import React from 'react';
import { createPortal } from 'react-dom';
import type { TrailPoint } from '../types/game';

interface TouchTrailProps {
  points: TrailPoint[];
}

export const TouchTrail: React.FC<TouchTrailProps> = ({ points }) => {
  if (typeof document === 'undefined' || points.length === 0) return null;

  return createPortal(
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      {points.map((point) => (
        <span
          key={point.id}
          className="touch-trail"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
          }}
        />
      ))}
    </div>,
    document.body
  );
};
