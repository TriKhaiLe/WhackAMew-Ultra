import React, { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ActiveAnimal, ScorePopup, TrailPoint } from '../types/game';
import { Cell } from './Cell';
import { TouchTrail } from './TouchTrail';

interface GameBoardProps {
  cells: (ActiveAnimal | null)[];
  isPaused: boolean;
  isFrozen: boolean;
  flashEffect: 'red' | 'green' | null;
  onWhackCell: (index: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cells,
  isPaused,
  isFrozen,
  flashEffect,
  onWhackCell,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const isPointerDownRef = useRef(false);

  const addTrailPoint = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setTrailPoints((prev) => [...prev.slice(-14), { id, x, y }]);
    setTimeout(() => {
      setTrailPoints((prev) => prev.filter((p) => p.id !== id));
    }, 400);
  }, []);

  const addScorePopup = useCallback((points: number, x: number, y: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setPopups((prev) => [...prev, { id, points, x, y }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  }, []);

  const hitAtCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (isPaused || isFrozen) return;

      const element = document.elementFromPoint(clientX, clientY);
      if (!element) return;

      const cellElement = element.closest('[data-cell-index]') as HTMLElement | null;
      if (cellElement) {
        const indexStr = cellElement.getAttribute('data-cell-index');
        if (indexStr !== null) {
          const index = parseInt(indexStr, 10);
          const animal = cells[index];
          if (animal && !animal.isHit) {
            addScorePopup(animal.points, clientX, clientY);
            onWhackCell(index);
          }
        }
      }
    },
    [isPaused, isFrozen, cells, addScorePopup, onWhackCell]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    addTrailPoint(e.clientX, e.clientY);
    hitAtCoordinates(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Generate smooth trail on both hover (desktop mouse) and swipe/drag
    addTrailPoint(e.clientX, e.clientY);

    // If dragging / swiping, hit whatever cell is currently under finger/pointer
    if (isPointerDownRef.current) {
      hitAtCoordinates(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handleCellWhack = (index: number, clientX?: number, clientY?: number) => {
    if (isPaused || isFrozen) return;

    const animal = cells[index];
    if (animal && !animal.isHit) {
      let x = clientX;
      let y = clientY;

      // If client coordinates are not provided, calculate center of the cell
      if (x === undefined || y === undefined) {
        if (boardRef.current) {
          const cellEl = boardRef.current.querySelector(`[data-cell-index="${index}"]`);
          if (cellEl) {
            const rect = cellEl.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 3;
          }
        }
      }

      if (x !== undefined && y !== undefined) {
        addScorePopup(animal.points, x, y);
      }

      onWhackCell(index);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto px-4 select-none">
      {/* Portaled Overlays (Touch Trail, Flashes, Popups) directly to document.body */}
      <TouchTrail points={trailPoints} />

      {typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden"
          >
            {/* Red Flash Overlay (Hazard penalty) */}
            {flashEffect === 'red' && (
              <div className="absolute inset-0 bg-red-600/35 pointer-events-none animate-pulse" />
            )}

            {/* Green Flash Overlay (Star bonus) */}
            {flashEffect === 'green' && (
              <div className="absolute inset-0 bg-emerald-500/30 pointer-events-none transition-opacity" />
            )}

            {/* Score Popups */}
            {popups.map((popup) => (
              <div
                key={popup.id}
                className={`absolute pointer-events-none font-black text-xl sm:text-2xl font-display ${
                  popup.points > 0
                    ? 'text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.95)]'
                    : 'text-rose-400 drop-shadow-[0_2px_8px_rgba(244,63,94,0.95)]'
                }`}
                style={{
                  left: `${popup.x}px`,
                  top: `${popup.y}px`,
                  animation: 'popup-float 0.8s ease-out forwards',
                }}
              >
                {popup.points > 0 ? `+${popup.points}` : popup.points}
              </div>
            ))}
          </div>,
          document.body
        )}

      {/* Main 4x4 Grid Container */}
      <div
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`grid grid-cols-4 gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl touch-none transition-all duration-300 ${
          isPaused ? 'opacity-50 pointer-events-none scale-[0.98]' : ''
        } ${isFrozen ? 'ring-2 ring-rose-500/50 pointer-events-none' : ''}`}
      >
        {cells.map((animal, index) => (
          <Cell
            key={index}
            index={index}
            animal={animal}
            isBoardDisabled={isPaused || isFrozen}
            onWhack={handleCellWhack}
          />
        ))}
      </div>
    </div>
  );
};
