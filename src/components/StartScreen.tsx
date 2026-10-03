import React, { useState } from 'react';
import { Play, Sparkles, Clock, Infinity as InfinityIcon, AlertTriangle, Flame } from 'lucide-react';
import { INITIAL_ANIMAL_LIST, UNLOCKABLE_ANIMAL_LIST, ANIMAL_FALLBACKS } from '../config/assets';

interface StartScreenProps {
  highScore: number;
  duration: number | null; // null for infinite
  onChangeDuration: (duration: number | null) => void;
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  highScore,
  duration,
  onChangeDuration,
  onStartGame,
}) => {
  const isInfinite = duration === null;
  const [tempDuration, setTempDuration] = useState<number>(duration ?? 15);

  const handleDurationChange = (val: number) => {
    const safeVal = Math.max(15, val);
    setTempDuration(safeVal);
    if (!isInfinite) {
      onChangeDuration(safeVal);
    }
  };

  const handleToggleInfinite = (checked: boolean) => {
    if (checked) {
      onChangeDuration(null);
    } else {
      onChangeDuration(tempDuration);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto my-auto px-4 py-6 flex flex-col items-center text-center animate-appear">
      {/* Decorative Glow */}
      <div className="relative mb-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-sm shadow-amber-400/10 animate-floating">
          <Sparkles className="w-3.5 h-3.5" />
          WHACK-A-MEW
        </span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display drop-shadow-sm mb-2">
        Game Đập Chuột
      </h1>
      <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto mb-6">
        Chạm hoặc lướt vuốt tay qua các ô để đập chuột thật nhanh và bứt phá kỷ lục điểm số!
      </p>

      {/* Main Glass Card */}
      <div className="w-full bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        {/* High Score Banner */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-500/20 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-amber-300 font-medium">Kỷ Lục Điểm Cao</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400 font-display leading-tight">
                {highScore.toLocaleString()}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
            Cố gắng vượt qua!
          </span>
        </div>

        {/* Game Mode / Duration Setup */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Thời Lượng Ván Chơi
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300 hover:text-white transition">
              <input
                type="checkbox"
                checked={isInfinite}
                onChange={(e) => handleToggleInfinite(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700 cursor-pointer accent-amber-500"
              />
              <span className="flex items-center gap-1">
                <InfinityIcon className="w-3.5 h-3.5 text-amber-400" />
                Vô hạn
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={15}
              step={5}
              value={isInfinite ? '' : tempDuration}
              disabled={isInfinite}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              placeholder={isInfinite ? '∞ Không giới hạn' : '15'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            />
            {!isInfinite && (
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-800">
                giây
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Tối thiểu 15 giây. Bật chế độ vô hạn để chơi liên tục không đếm ngược thời gian.
          </p>
        </div>

        {/* Item Guide Section */}
        <div className="space-y-3.5 text-left">
          {/* Starter Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Vật Phẩm Khởi Đầu</span>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                  4 mặc định
                </span>
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {INITIAL_ANIMAL_LIST.map((animal) => {
                const isPositive = animal.points > 0;
                const emoji = ANIMAL_FALLBACKS[animal.type] || animal.emoji;

                return (
                  <div
                    key={animal.type}
                    className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-2 flex flex-col items-center justify-center gap-1 transition-all hover:border-slate-700"
                    title={animal.description}
                  >
                    <span className="text-3xl select-none filter drop-shadow-sm py-0.5" role="img" aria-label={animal.name}>
                      {emoji}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300 leading-tight text-center truncate w-full">
                      {animal.name}
                    </span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isPositive
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {isPositive ? `+${animal.points}` : animal.points}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unlockable Items Every 15s */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mở Khóa Mỗi 15 Giây</span>
                <span className="text-[10px] font-semibold text-sky-400 bg-sky-400/10 px-1.5 py-0.2 rounded border border-sky-400/20">
                  +10 vật phẩm
                </span>
              </p>
              <span className="text-[10px] text-slate-400">Xuất hiện dần khi chơi</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {UNLOCKABLE_ANIMAL_LIST.map((animal) => {
                const isPositive = animal.points > 0;
                const emoji = ANIMAL_FALLBACKS[animal.type] || animal.emoji;

                return (
                  <div
                    key={animal.type}
                    className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center gap-1 transition-all hover:border-slate-700 relative overflow-hidden"
                    title={`${animal.name}: ${animal.description} (Mở sau ${animal.unlockAfterSeconds}s)`}
                  >
                    <span className="absolute top-1 right-1 text-[8px] font-bold text-sky-400 font-mono bg-sky-400/10 px-1 rounded">
                      +{animal.unlockAfterSeconds}s
                    </span>
                    <span className="text-2xl sm:text-3xl select-none filter drop-shadow-sm pt-2" role="img" aria-label={animal.name}>
                      {emoji}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 leading-tight text-center truncate w-full">
                      {animal.name}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1 py-0.5 rounded ${
                        isPositive
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {isPositive ? `+${animal.points}` : animal.points}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-xs text-amber-200/90">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-300">Cảnh báo:</strong> Đập trúng bẫy nguy hiểm (Khoai tây, Nhím gai, Bom) sẽ bị trừ điểm và đóng băng bàn chơi!
          </p>
        </div>

        {/* Start Game Action */}
        <button
          type="button"
          onClick={onStartGame}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg sm:text-xl font-display uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
          Bắt Đầu Chơi
        </button>
      </div>
    </div>
  );
};
