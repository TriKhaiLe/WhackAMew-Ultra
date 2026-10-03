import React, { useState } from 'react';
import { X, User, Lock, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { AuthUser } from '../types/game';
import { loginOrSignup } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLoginSuccess,
  onLogout,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setFeedback({ message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.', isError: true });
      return;
    }

    setIsLoading(true);
    setFeedback({ message: 'Đang xử lý kết nối máy chủ...', isError: false });

    try {
      const result = await loginOrSignup(cleanUsername, cleanPassword);
      const user: AuthUser = {
        username: cleanUsername,
        password: cleanPassword,
        userId: result.userId || null,
      };
      onLoginSuccess(user);
      setFeedback({ message: 'Đăng nhập / Đăng ký thành công!', isError: false });
      setPassword('');
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.';
      setFeedback({ message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    setFeedback({ message: 'Đã đăng xuất tài khoản.', isError: false });
    setUsername('');
    setPassword('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-appear"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-left">
          <h2 className="text-xl font-black text-white font-display">Tài Khoản Người Chơi</h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đang đăng nhập: @{currentUser.username}
              </span>
            ) : (
              'Đăng nhập hoặc đăng ký tài khoản để lưu điểm lên Bảng Xếp Hạng.'
            )}
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
              feedback.isError
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form or User Info */}
        {!currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label
                htmlFor="auth-username"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Tên đăng nhập (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-username"
                  type="text"
                  maxLength={100}
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập username..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Mật khẩu (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-password"
                  type="password"
                  maxLength={100}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm font-display uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang Xử Lý...
                </>
              ) : (
                'Xác Nhận Đăng Nhập'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  {currentUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    {currentUser.username}
                  </p>
                  <p className="text-xs text-slate-400">Tài khoản cá nhân</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng Xuất Tài Khoản
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
