import React from 'react';
import { Pause, Play, LogOut, Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  timeLeft: number | null; // null for infinite
  combo: number;
  isPaused: boolean;
  isFrozen: boolean;
  activeCount?: number;
  totalItemsCount?: number;
  nextUnlockSeconds?: number | null;
  activeAnimalEmojis?: string[];
  onTogglePause: () => void;
  onQuit: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  highScore,
  timeLeft,
  combo,
  isPaused,
  isFrozen,
  activeCount = 4,
  totalItemsCount = 14,
  nextUnlockSeconds = null,
  activeAnimalEmojis = [],
  onTogglePause,
  onQuit,
}) => {
  const isUrgentTime = timeLeft !== null && timeLeft <= 5 && timeLeft > 0;

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-4 select-none">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-2.5">
        {/* Score Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 sm:p-3 text-center shadow-lg relative overflow-hidden">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Điểm Số
          </p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-display tracking-tight transition-all">
            {score.toLocaleString()}
          </p>
          {combo > 1 && (
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30">
              <Flame className="w-2.5 h-2.5 text-amber-400" />
              {combo}x Combo
            </div>
          )}
        </div>

        {/* Timer Card */}
        <div
          className={`backdrop-blur-md rounded-2xl p-2.5 sm:p-3 text-center shadow-lg transition-all duration-300 relative overflow-hidden ${
            isUrgentTime
              ? 'bg-rose-950/80 border border-rose-500/50 animate-pulse'
              : 'bg-slate-900/80 border border-slate-800'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider mb-0.5 text-slate-400">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>Thời Gian</span>
          </div>
          <p
            className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${
              isUrgentTime ? 'text-rose-400' : 'text-sky-400'
            }`}
          >
            {timeLeft === null ? '∞' : `${timeLeft}s`}
          </p>
        </div>

        {/* High Score Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 sm:p-3 text-center shadow-lg relative overflow-hidden">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Kỷ Lục
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-200 font-display tracking-tight">
            {highScore.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Active Items & Next Unlock Info */}
      <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Vật phẩm ({activeCount}/{totalItemsCount}):
          </span>
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 select-none text-base">
            {activeAnimalEmojis.map((em, i) => (
              <span key={i} title={`Vật phẩm ${i + 1}`}>
                {em}
              </span>
            ))}
          </div>
        </div>

        {nextUnlockSeconds !== null && nextUnlockSeconds !== undefined && (
          <div className="shrink-0 text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30 flex items-center gap-1">
            <span className="hidden sm:inline">Mở thêm sau:</span>
            <strong className="text-amber-400 font-mono">{nextUnlockSeconds}s</strong>
          </div>
        )}
      </div>

      {/* Freeze Warning Alert */}
      {isFrozen && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>BÀN CHƠI ĐANG BỊ KHÓA DO ĐẬP TRÚNG BẪY NGUY HIỂM!</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onTogglePause}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 ${
            isPaused
              ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
              : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
        </button>

        <button
          type="button"
          onClick={onQuit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 text-xs font-bold tracking-wide transition-all shadow-md active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Thoát ván</span>
        </button>
      </div>
    </div>
  );
};
