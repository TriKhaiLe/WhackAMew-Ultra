import React from 'react';
import { Volume2, VolumeX, Trophy, User, LogIn } from 'lucide-react';
import type { AuthUser } from '../types/game';

interface NavbarProps {
  user: AuthUser | null;
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenAuth: () => void;
  onOpenLeaderboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  highScore,
  isMuted,
  onToggleMute,
  onOpenAuth,
  onOpenLeaderboard,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between z-40 relative">
      {/* Brand Logo & High Score Preview */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-300/30">
          <span className="text-xl select-none" role="img" aria-label="Game logo">
            🐭
          </span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-display leading-tight">
            WHACK-A-MEW
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
              PRO
            </span>
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            Kỷ lục: <strong className="text-amber-400 font-semibold">{highScore}</strong>
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center ${
            isMuted
              ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shadow-sm shadow-amber-500/10'
          }`}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Leaderboard Button */}
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95"
          title="Bảng xếp hạng"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">BXH</span>
        </button>

        {/* Auth / Profile Button */}
        <button
          type="button"
          onClick={onOpenAuth}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 ${
            user
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {user ? (
            <>
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[85px] sm:max-w-[120px] truncate">@{user.username}</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Đăng nhập</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
