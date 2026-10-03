import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ActiveAnimal, AnimalType, AuthUser, GameStats, GameStatus } from './types/game';
import { ANIMAL_LIST } from './config/assets';
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

  const gameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const freezeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, []);

  // Pick random animal according to probability table
  const pickRandomAnimalType = (): AnimalType => {
    const random = Math.random();
    let cumulative = 0;
    for (const animal of ANIMAL_LIST) {
      cumulative += animal.probability;
      if (random <= cumulative) {
        return animal.type;
      }
    }
    return 'mouse';
  };

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
      const points =
        animalType === 'mouse'
          ? 10
          : animalType === 'rabbit'
          ? 20
          : animalType === 'star'
          ? 30
          : -30;

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
  }, []);

  // End Game
  const endGame = useCallback(() => {
    clearAllIntervals();
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

  // Start game intervals (spawning & countdown timer)
  const startIntervals = useCallback(() => {
    clearAllIntervals();

    // Spawn loop
    gameIntervalRef.current = setInterval(() => {
      spawnAnimals();
    }, SPAWN_INTERVAL_MS);

    // Timer loop if not infinite
    if (duration !== null) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [clearAllIntervals, duration, endGame, spawnAnimals]);

  // Start a new game
  const handleStartGame = () => {
    soundManager.registerUserInteraction();
    soundManager.playBgm('playing');

    setScore(0);
    setTimeLeft(duration);
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
          hazardHits: prev.hazardHits + (targetType === 'snake' ? 1 : 0),
        };
      });

      // Trigger Effects & Sound depending on item type
      if (targetType === 'snake') {
        soundManager.playSfx('damage');
        setFlashEffect('red');
        setIsFrozen(true);

        if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

        flashTimeoutRef.current = setTimeout(() => {
          setFlashEffect(null);
        }, 1500);

        freezeTimeoutRef.current = setTimeout(() => {
          setIsFrozen(false);
        }, 2000);
      } else if (targetType === 'star') {
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
              onTogglePause={handleTogglePause}
              onQuit={handleQuitGame}
            />

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
