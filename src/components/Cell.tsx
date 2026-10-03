import React, { useState } from 'react';
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
  const [imageError, setImageError] = useState(false);

  const def = animal ? ANIMAL_DEFINITIONS[animal.type] : null;

  const triggerWhack = (clientX?: number, clientY?: number) => {
    if (animal && !animal.isHit && !isBoardDisabled) {
      onWhack(index, clientX, clientY);
    }
  };

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
          className={`relative z-10 w-4/5 h-4/5 flex items-center justify-center transition-transform select-none ${
            animal.isHit ? 'animate-hit' : 'animate-appear'
          }`}
        >
          {/* Subtle Glow depending on item type */}
          {def.isBonus && (
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md pointer-events-none animate-pulse" />
          )}
          {def.isHazard && (
            <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-md pointer-events-none" />
          )}

          {!imageError ? (
            <img
              src={def.image}
              alt={def.name}
              draggable={false}
              className="w-full h-full object-contain filter drop-shadow-lg select-none pointer-events-none"
              onError={() => setImageError(true)}
            />
          ) : (
            <span
              className="text-4xl sm:text-5xl select-none filter drop-shadow-md pointer-events-none"
              role="img"
              aria-label={def.name}
            >
              {ANIMAL_FALLBACKS[animal.type] || '🐭'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
