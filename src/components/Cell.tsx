import React from 'react';
import type { ActiveAnimal } from '../types/game';
import { ANIMAL_DEFINITIONS, ANIMAL_FALLBACKS } from '../config/assets';

interface CellProps {
  index: number;
  animal: ActiveAnimal | null;
  isBoardDisabled: boolean;
  onWhack: (index: number, clientX?: number, clientY?: number) => void;
}

export const Cell: React.FC<CellProps> = ({
  index,
  animal,
  isBoardDisabled,
  onWhack,
}) => {
  const def = animal ? ANIMAL_DEFINITIONS[animal.type] : null;

  const triggerWhack = (clientX?: number, clientY?: number) => {
    if (animal && !animal.isHit && !isBoardDisabled) {
      onWhack(index, clientX, clientY);
    }
  };

  const emoji = animal ? ANIMAL_FALLBACKS[animal.type] || def?.emoji || '🐭' : '🐭';

  return (
    <div
      data-cell-index={index}
      className={`relative aspect-square rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700/80 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden transition-all duration-150 select-none ${
        isBoardDisabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:border-amber-400/60 active:scale-95'
      }`}
      onPointerDown={(e) => {
        e.preventDefault();
        triggerWhack(e.clientX, e.clientY);
      }}
      onPointerEnter={(e) => {
        // "Rê" (hover) support: hitting animal on cursor hover/glide
        triggerWhack(e.clientX, e.clientY);
      }}
    >
      {/* Hole Depth Ring */}
      <div className="absolute inset-1.5 rounded-xl bg-slate-950/70 shadow-[inset_0_3px_8px_rgba(0,0,0,0.8)] pointer-events-none" />

      {/* Target Item (Animal / Star / Hazard) */}
      {animal && def && (
        <div
          data-animal-type={animal.type}
          className={`relative z-10 w-full h-full flex flex-col items-center justify-center transition-transform select-none ${
            animal.isHit ? 'animate-hit scale-125 opacity-80' : 'animate-appear'
          }`}
        >
          {/* Subtle Glow depending on item type */}
          {def.isBonus && (
            <div className="absolute inset-2 rounded-full bg-amber-400/25 blur-lg pointer-events-none animate-pulse" />
          )}
          {def.isHazard && (
            <div className="absolute inset-2 rounded-full bg-rose-600/30 blur-lg pointer-events-none" />
          )}

          <span
            className="text-4xl sm:text-5xl md:text-6xl select-none filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] pointer-events-none transform transition-transform"
            role="img"
            aria-label={def.name}
          >
            {emoji}
          </span>
        </div>
      )}
    </div>
  );
};
