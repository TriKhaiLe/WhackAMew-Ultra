import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, Award, Flame } from 'lucide-react';
import type { GameStats } from '../types/game';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  stats: GameStats;
  onRestart: () => void;
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  highScore,
  isNewHighScore,
  stats,
  onRestart,
  onGoHome,
  onOpenLeaderboard,
}) => {
  useEffect(() => {
    if (isOpen && isNewHighScore) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#34d399'],
        });
      } catch {
        // Fallback gracefully
      }
    }
  }, [isOpen, isNewHighScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-appear">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-6">
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-amber-400/20">
          <Trophy className="w-8 h-8 text-slate-950" />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
            Trò Chơi Kết Thúc!
          </h2>
          {isNewHighScore ? (
            <p className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Kỷ Lục Mới Được Thiết Lập! 🎉
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-1">Bạn đã hoàn thành ván chơi xuất sắc!</p>
          )}
        </div>

        {/* Score Breakdown Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-semibold mb-0.5">Điểm Ván Này</p>
            <p className="text-3xl font-black text-amber-400 font-display">
              {score.toLocaleString()}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-semibold mb-0.5">Kỷ Lục Cao Nhất</p>
            <p className="text-3xl font-black text-slate-200 font-display">
              {highScore.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Mini Stats Bar */}
        <div className="flex items-center justify-around py-3 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
          <div className="text-slate-400">
            Tổng lượt đập: <strong className="text-slate-200">{stats.totalWhacks}</strong>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Max Combo: <strong className="text-amber-400">{stats.maxCombo}x</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base font-display uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Chơi Lại Ngay
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Bảng Xếp Hạng
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
