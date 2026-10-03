export type AnimalType = 'mouse' | 'rabbit' | 'snake' | 'star';

export interface AnimalDefinition {
  type: AnimalType;
  name: string;
  image: string;
  points: number;
  probability: number;
  description: string;
  isHazard?: boolean;
  isBonus?: boolean;
}

export interface ActiveAnimal {
  instanceId: string;
  type: AnimalType;
  points: number;
  isHit: boolean;
  spawnTime: number;
  durationMs: number;
}

export interface ScorePopup {
  id: string;
  points: number;
  x: number;
  y: number;
}

export interface TrailPoint {
  id: number;
  x: number;
  y: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface GameStats {
  score: number;
  highScore: number;
  totalWhacks: number;
  mouseHits: number;
  rabbitHits: number;
  starHits: number;
  hazardHits: number;
  maxCombo: number;
  currentCombo: number;
}

export interface AuthUser {
  username: string;
  password?: string;
  userId?: string | null;
}

export interface HighScorePackage {
  highScore: number;
  timeSpan: number;
}

export interface LeaderboardEntry {
  username: string;
  package: HighScorePackage;
}
