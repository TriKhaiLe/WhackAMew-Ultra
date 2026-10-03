import React, { useEffect, useState } from 'react';
import { X, Trophy, RefreshCw, Medal, Loader2, AlertCircle } from 'lucide-react';
import type { AuthUser, LeaderboardEntry } from '../types/game';
import { fetchLeaderboard } from '../services/api';

interface LeaderboardModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  currentUser,
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      setEntries(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tải bảng xếp hạng.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-appear"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 text-left">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-display">Bảng Xếp Hạng</h2>
            <p className="text-xs text-slate-400">Top các cao thủ đạt điểm cao nhất</p>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400">
            {entries.length > 0 ? `${entries.length} người chơi` : 'Đang cập nhật...'}
          </span>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isLoading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 mb-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-sm custom-scrollbar">
          {isLoading && entries.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <p className="text-xs">Đang tải bảng xếp hạng từ máy chủ...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Chưa có dữ liệu người chơi trên bảng xếp hạng. Hãy là người đầu tiên!
            </div>
          ) : (
            entries.slice(0, 50).map((entry, index) => {
              const isCurrentUser =
                currentUser && currentUser.username.toLowerCase() === entry.username.toLowerCase();

              const rank = index + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              return (
                <div
                  key={`${entry.username}-${index}`}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all ${
                    isCurrentUser
                      ? 'bg-amber-500/15 border-amber-400/50 ring-1 ring-amber-400/30 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                        isTop1
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                          : isTop2
                          ? 'bg-slate-300 text-slate-950'
                          : isTop3
                          ? 'bg-amber-700/60 text-amber-200 border border-amber-600'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isTop1 ? <Medal className="w-4 h-4 fill-current" /> : rank}
                    </div>

                    {/* Username */}
                    <div>
                      <p className="font-bold text-white leading-tight flex items-center gap-1.5">
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                          {entry.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
                            BẠN
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="font-black text-amber-400 font-display text-base">
                      {entry.package.highScore.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">điểm</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
