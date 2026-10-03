import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ActiveAnimal, AnimalDefinition, AnimalType, AuthUser, GameStats, GameStatus } from './types/game';
import {
  ANIMAL_DEFINITIONS,
  ANIMAL_FALLBACKS,
  INITIAL_ANIMAL_LIST,
  UNLOCKABLE_ANIMAL_LIST,
} from './config/assets';
import { soundManager } from './services/sound';
import {
  getStoredHighScore,
  saveStoredHighScore,
  getStoredUser,
  saveStoredUser,
  fetchLeaderboard,
  updateServerHighScore,
} from './services/api';
import { Navbar } from './components/Navbar';
import { StartScreen } from './components/StartScreen';
import { ScoreBoard } from './components/ScoreBoard';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { AuthModal } from './components/AuthModal';
import { LeaderboardModal } from './components/LeaderboardModal';

const GRID_SIZE = 16;
const SPAWN_INTERVAL_MS = 800;
const ANIMAL_LIFETIME_MS = 1500;

export const App: React.FC = () => {
  // State
  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => getStoredHighScore());
  const [duration, setDuration] = useState<number | null>(15);
  const [timeLeft, setTimeLeft] = useState<number | null>(15);
  const [cells, setCells] = useState<(ActiveAnimal | null)[]>(Array(GRID_SIZE).fill(null));
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [flashEffect, setFlashEffect] = useState<'red' | 'green' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getIsMuted());

  // Dynamic Animal Pool Progression (New item unlocked every 15s)
  const [activeAnimals, setActiveAnimals] = useState<AnimalDefinition[]>(INITIAL_ANIMAL_LIST);
  const [remainingAnimals, setRemainingAnimals] = useState<AnimalDefinition[]>(UNLOCKABLE_ANIMAL_LIST);
  const [gameElapsed, setGameElapsed] = useState<number>(0);
  const [unlockedItemToast, setUnlockedItemToast] = useState<{
    animal: AnimalDefinition;
    id: number;
  } | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // User & Stats
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    totalWhacks: 0,
    mouseHits: 0,
    rabbitHits: 0,
    starHits: 0,
    hazardHits: 0,
    maxCombo: 0,
    currentCombo: 0,
  });

  // Refs for intervals & async state
  const cellsRef = useRef<(ActiveAnimal | null)[]>(Array(GRID_SIZE).fill(null));
  cellsRef.current = cells;
  const statusRef = useRef<GameStatus>(status);
  statusRef.current = status;
  const isFrozenRef = useRef<boolean>(isFrozen);
  isFrozenRef.current = isFrozen;

  const activeAnimalsRef = useRef<AnimalDefinition[]>(INITIAL_ANIMAL_LIST);
  const remainingAnimalsRef = useRef<AnimalDefinition[]>(UNLOCKABLE_ANIMAL_LIST);
  const gameElapsedRef = useRef<number>(0);

  const gameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const freezeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize server high score for current user on mount
  useEffect(() => {
    if (user?.username) {
      fetchLeaderboard()
        .then((leaderboard) => {
          const me = leaderboard.find(
            (entry) => entry.username.toLowerCase() === user.username.toLowerCase()
          );
          if (me && me.package.highScore > highScore) {
            setHighScore(me.package.highScore);
            saveStoredHighScore(me.package.highScore);
          }
        })
        .catch(() => {
          // Ignore server reachability issues
        });
    }
  }, [user, highScore]);

  // Global user interaction listener to allow BGM on first click/pointer
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.registerUserInteraction();
      if (statusRef.current === 'idle' || statusRef.current === 'gameover') {
        soundManager.playBgm('waiting');
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
    };
  }, []);

  const clearAllIntervals = useCallback(() => {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (freezeTimeoutRef.current) {
      clearTimeout(freezeTimeoutRef.current);
      freezeTimeoutRef.current = null;
    }
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  // Pick random animal according to probability table from currently active pool
  const pickRandomAnimalType = useCallback((): AnimalType => {
    const pool = activeAnimalsRef.current;
    if (!pool || pool.length === 0) return 'mouse';

    const totalWeight = pool.reduce((acc, a) => acc + (a.probability || 0.1), 0);
    let randomVal = Math.random() * totalWeight;

    for (const animal of pool) {
      randomVal -= (animal.probability || 0.1);
      if (randomVal <= 0) {
        return animal.type;
      }
    }
    return pool[0].type;
  }, []);

  // Unlock next animal into the active spawn pool after every 15 seconds
  const unlockNextAnimal = useCallback(() => {
    if (remainingAnimalsRef.current.length === 0) return;

    const nextAnimal = remainingAnimalsRef.current[0];
    const newRemaining = remainingAnimalsRef.current.slice(1);
    const newActive = [...activeAnimalsRef.current, nextAnimal];

    remainingAnimalsRef.current = newRemaining;
    activeAnimalsRef.current = newActive;

    setRemainingAnimals(newRemaining);
    setActiveAnimals(newActive);

    // Audio chime & notification banner
    soundManager.playSfx('bonus');
    setUnlockedItemToast({
      animal: nextAnimal,
      id: Date.now(),
    });

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setUnlockedItemToast(null);
    }, 4000);
  }, []);

  // Spawn random animals into empty cells
  const spawnAnimals = useCallback(() => {
    if (statusRef.current !== 'playing' || isFrozenRef.current) return;

    const currentCells = [...cellsRef.current];
    const emptyIndices: number[] = [];
    currentCells.forEach((cell, idx) => {
      if (cell === null) emptyIndices.push(idx);
    });

    if (emptyIndices.length === 0) return;

    // Pick 2-3 empty cells
    const spawnCount = Math.min(emptyIndices.length, Math.floor(Math.random() * 2) + 2);
    const chosenIndices: number[] = [];

    for (let i = 0; i < spawnCount; i++) {
      const remainingIndices = emptyIndices.filter((idx) => !chosenIndices.includes(idx));
      if (remainingIndices.length === 0) break;
      const randIdx = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
      chosenIndices.push(randIdx);
    }

    chosenIndices.forEach((cellIdx) => {
      const animalType = pickRandomAnimalType();
      const def = ANIMAL_DEFINITIONS[animalType];
      const points = def ? def.points : 10;

      const instanceId = `${Date.now()}-${cellIdx}-${Math.random()}`;
      currentCells[cellIdx] = {
        instanceId,
        type: animalType,
        points,
        isHit: false,
        spawnTime: Date.now(),
        durationMs: ANIMAL_LIFETIME_MS,
      };

      // Despawn animal if not hit after duration
      setTimeout(() => {
        setCells((prev) => {
          const next = [...prev];
          if (next[cellIdx]?.instanceId === instanceId && !next[cellIdx]?.isHit) {
            next[cellIdx] = null;
          }
          return next;
        });
      }, ANIMAL_LIFETIME_MS);
    });

    setCells(currentCells);
  }, [pickRandomAnimalType]);

  // End Game
  const endGame = useCallback(() => {
    clearAllIntervals();
    setUnlockedItemToast(null);
    setStatus('gameover');
    soundManager.playBgm('waiting');

    setScore((finalScore) => {
      const isNewBest = finalScore > highScore;
      if (isNewBest) {
        setHighScore(finalScore);
        saveStoredHighScore(finalScore);
        setIsNewHighScore(true);

        // Sync with backend if user is logged in
        if (user) {
          const timeSpan = duration === null ? 999999 : duration;
          updateServerHighScore(user, finalScore, timeSpan).catch(() => {});
        }
      } else {
        setIsNewHighScore(false);
      }

      setStats((prev) => ({
        ...prev,
        score: finalScore,
        highScore: Math.max(finalScore, highScore),
      }));

      return finalScore;
    });

    setCells(Array(GRID_SIZE).fill(null));
    setIsFrozen(false);
    setFlashEffect(null);
    setIsGameOverOpen(true);
  }, [clearAllIntervals, highScore, user, duration]);

  // Start game intervals (spawning & clock timer with 15s progression)
  const startIntervals = useCallback(() => {
    clearAllIntervals();

    // Spawn loop
    gameIntervalRef.current = setInterval(() => {
      spawnAnimals();
    }, SPAWN_INTERVAL_MS);

    // Clock loop: timer countdown and 15-second dynamic animal unlocks
    timerIntervalRef.current = setInterval(() => {
      // 1. Decrement duration if not infinite mode
      if (duration !== null) {
        setTimeLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }

      // 2. Track elapsed playing seconds and unlock new item after every 15s
      gameElapsedRef.current += 1;
      setGameElapsed(gameElapsedRef.current);

      if (gameElapsedRef.current % 15 === 0) {
        unlockNextAnimal();
      }
    }, 1000);
  }, [clearAllIntervals, duration, endGame, spawnAnimals, unlockNextAnimal]);

  // Start a new game
  const handleStartGame = () => {
    soundManager.registerUserInteraction();
    soundManager.playBgm('playing');

    setScore(0);
    setTimeLeft(duration);
    gameElapsedRef.current = 0;
    setGameElapsed(0);
    setUnlockedItemToast(null);

    // Reset progression: base 4 items in active pool, remaining 10 in queue
    activeAnimalsRef.current = [...INITIAL_ANIMAL_LIST];
    remainingAnimalsRef.current = [...UNLOCKABLE_ANIMAL_LIST];
    setActiveAnimals([...INITIAL_ANIMAL_LIST]);
    setRemainingAnimals([...UNLOCKABLE_ANIMAL_LIST]);

    setCells(Array(GRID_SIZE).fill(null));
    setIsFrozen(false);
    setFlashEffect(null);
    setIsGameOverOpen(false);
    setIsNewHighScore(false);
    setStats({
      score: 0,
      highScore,
      totalWhacks: 0,
      mouseHits: 0,
      rabbitHits: 0,
      starHits: 0,
      hazardHits: 0,
      maxCombo: 0,
      currentCombo: 0,
    });

    setStatus('playing');
    startIntervals();
  };

  // Pause / Resume
  const handleTogglePause = () => {
    if (status === 'playing') {
      setStatus('paused');
      clearAllIntervals();
      soundManager.pauseBgm();
    } else if (status === 'paused') {
      setStatus('playing');
      startIntervals();
      soundManager.resumeBgm('playing');
    }
  };

  // Quit to Menu
  const handleQuitGame = () => {
    clearAllIntervals();
    setUnlockedItemToast(null);
    setStatus('idle');
    setCells(Array(GRID_SIZE).fill(null));
    setIsFrozen(false);
    setFlashEffect(null);
    soundManager.playBgm('waiting');
  };

  // Whack animal in cell
  const handleWhackCell = useCallback(
    (index: number) => {
      if (statusRef.current !== 'playing' || isFrozenRef.current) return;

      const currentCell = cellsRef.current[index];
      if (!currentCell || currentCell.isHit) return;

      // Mark cell as hit
      const hitInstanceId = currentCell.instanceId;
      const targetType = currentCell.type;
      const points = currentCell.points;
      const def = ANIMAL_DEFINITIONS[targetType];

      setCells((prev) => {
        const next = [...prev];
        if (next[index] && next[index]?.instanceId === hitInstanceId) {
          next[index] = { ...next[index]!, isHit: true };
        }
        return next;
      });

      // Update Score & Combo
      setScore((prev) => Math.max(0, prev + points));

      setStats((prev) => {
        const newCombo = points > 0 ? prev.currentCombo + 1 : 0;
        return {
          ...prev,
          totalWhacks: prev.totalWhacks + 1,
          currentCombo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          mouseHits: prev.mouseHits + (targetType === 'mouse' ? 1 : 0),
          rabbitHits: prev.rabbitHits + (targetType === 'rabbit' ? 1 : 0),
          starHits: prev.starHits + (targetType === 'star' ? 1 : 0),
          hazardHits: prev.hazardHits + (def?.isHazard ? 1 : 0),
        };
      });

      // Trigger Effects & Sound depending on item type
      if (def?.isHazard || points < 0) {
        soundManager.playSfx('damage');
        setFlashEffect('red');
        setIsFrozen(true);

        const freezeDuration = def?.freezeDurationMs ?? 2000;

        if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

        flashTimeoutRef.current = setTimeout(() => {
          setFlashEffect(null);
        }, Math.min(1500, freezeDuration));

        freezeTimeoutRef.current = setTimeout(() => {
          setIsFrozen(false);
        }, freezeDuration);
      } else if (def?.isBonus || points >= 30) {
        soundManager.playSfx('bonus');
        setFlashEffect('green');

        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => {
          setFlashEffect(null);
        }, 800);
      } else {
        soundManager.playSfx('point');
      }

      // Remove cell after hit animation
      setTimeout(() => {
        setCells((prev) => {
          const next = [...prev];
          if (next[index]?.instanceId === hitInstanceId) {
            next[index] = null;
          }
          return next;
        });
      }, 300);
    },
    []
  );

  const handleToggleMute = () => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
  };

  const handleLoginSuccess = (newUser: AuthUser) => {
    setUser(newUser);
    saveStoredUser(newUser);

    // Sync high score
    fetchLeaderboard()
      .then((leaderboard) => {
        const me = leaderboard.find(
          (entry) => entry.username.toLowerCase() === newUser.username.toLowerCase()
        );
        if (me && me.package.highScore > highScore) {
          setHighScore(me.package.highScore);
          saveStoredHighScore(me.package.highScore);
        } else if (highScore > 0) {
          const timeSpan = duration === null ? 999999 : duration;
          updateServerHighScore(newUser, highScore, timeSpan).catch(() => {});
        }
      })
      .catch(() => {});
  };

  const handleLogout = () => {
    setUser(null);
    saveStoredUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background Dots Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-25 bg-grid-pattern" />

      {/* Top Navigation */}
      <Navbar
        user={user}
        highScore={highScore}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 z-10 w-full max-w-4xl mx-auto">
        {status === 'idle' ? (
          <StartScreen
            highScore={highScore}
            duration={duration}
            onChangeDuration={setDuration}
            onStartGame={handleStartGame}
          />
        ) : (
          <div className="w-full flex flex-col items-center animate-appear">
            <ScoreBoard
              score={score}
              highScore={highScore}
              timeLeft={timeLeft}
              combo={stats.currentCombo}
              isPaused={status === 'paused'}
              isFrozen={isFrozen}
              activeCount={activeAnimals.length}
              totalItemsCount={INITIAL_ANIMAL_LIST.length + UNLOCKABLE_ANIMAL_LIST.length}
              nextUnlockSeconds={
                remainingAnimals.length > 0 ? 15 - (gameElapsed % 15) : null
              }
              activeAnimalEmojis={activeAnimals.map(
                (a) => ANIMAL_FALLBACKS[a.type] || a.emoji
              )}
              onTogglePause={handleTogglePause}
              onQuit={handleQuitGame}
            />

            {/* Real-time Toast Alert when a new animal is unlocked every 15s */}
            {unlockedItemToast && (
              <div className="w-full max-w-xl mb-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-emerald-500/20 border-2 border-amber-400/60 backdrop-blur-md text-amber-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 animate-bounce">
                <span className="text-2xl select-none" role="img">
                  {ANIMAL_FALLBACKS[unlockedItemToast.animal.type] || unlockedItemToast.animal.emoji}
                </span>
                <span>
                  🎉 Vật phẩm mới xuất hiện:{' '}
                  <strong className="text-white underline decoration-amber-400">
                    {unlockedItemToast.animal.name}
                  </strong>{' '}
                  (
                  <span
                    className={
                      unlockedItemToast.animal.points > 0
                        ? 'text-emerald-400 font-extrabold'
                        : 'text-rose-400 font-extrabold'
                    }
                  >
                    {unlockedItemToast.animal.points > 0
                      ? `+${unlockedItemToast.animal.points}`
                      : unlockedItemToast.animal.points}{' '}
                    điểm
                  </span>
                  )!
                </span>
              </div>
            )}

            <GameBoard
              cells={cells}
              isPaused={status === 'paused'}
              isFrozen={isFrozen}
              flashEffect={flashEffect}
              onWhackCell={handleWhackCell}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-3 text-center text-xs text-slate-500 z-10 select-none">
        Whack-A-Mew Pro • Powered by @KT
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        currentUser={user}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        currentUser={user}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <GameOverModal
        isOpen={isGameOverOpen}
        score={score}
        highScore={highScore}
        isNewHighScore={isNewHighScore}
        stats={stats}
        onRestart={handleStartGame}
        onGoHome={() => {
          setIsGameOverOpen(false);
          setStatus('idle');
        }}
        onOpenLeaderboard={() => {
          setIsGameOverOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />
    </div>
  );
};

export default App;
