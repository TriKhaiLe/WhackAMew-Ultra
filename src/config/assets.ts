import type { AnimalDefinition } from '../types/game';

/**
 * =========================================================================
 * ASSET CONFIGURATION & NAMING GUIDE
 * =========================================================================
 *
 * To supply your own images and sounds, place your files inside the
 * `public/` directory with the exact names below:
 *
 * 1. Image Assets (Folder: `public/images/`)
 *    - `public/images/mouse.png`   -> Chuột (+10 điểm)
 *    - `public/images/rabbit.png`  -> Thỏ (+20 điểm)
 *    - `public/images/star.png`    -> Sao may mắn (+30 điểm, hiệu ứng xanh)
 *    - `public/images/snake.png`   -> Khoai tây / Rắn (-30 điểm, màn hình đỏ & đóng băng 2s)
 *
 * 2. Sound Assets (Folder: `public/sounds/`)
 *    - `public/sounds/bg-music-1.mp3` -> Nhạc nền chờ/menu (Waiting BGM)
 *    - `public/sounds/bg-music-2.mp3` -> Nhạc nền trong ván chơi (Playing BGM)
 *    - `public/sounds/point.mp3`      -> Âm thanh khi đập trúng chuột / thỏ
 *    - `public/sounds/point2.mp3`     -> Âm thanh khi nhặt sao may mắn
 *    - `public/sounds/damage.mp3`     -> Âm thanh khi đập nhầm khoai tây / rắn
 *
 * Note: Vite serves all files in `public/` at the root path `/`.
 * =========================================================================
 */

export const ASSET_PATHS = {
  images: {
    mouse: '/images/mouse.png',
    rabbit: '/images/rabbit.png',
    snake: '/images/snake.png',
    star: '/images/star.png',
  },
  sounds: {
    bgWaiting: '/sounds/bg-music-1.mp3',
    bgPlaying: '/sounds/bg-music-2.mp3',
    point: '/sounds/point.wav',
    point2: '/sounds/point2.wav',
    damage: '/sounds/damage.wav',
  },
} as const;

export const ANIMAL_DEFINITIONS: Record<string, AnimalDefinition> = {
  mouse: {
    type: 'mouse',
    name: 'Chuột',
    image: ASSET_PATHS.images.mouse,
    points: 10,
    probability: 0.6,
    description: 'Xuất hiện thường xuyên, nhanh tay ghi 10 điểm.',
  },
  rabbit: {
    type: 'rabbit',
    name: 'Thỏ',
    image: ASSET_PATHS.images.rabbit,
    points: 20,
    probability: 0.2,
    description: 'Thỏ nhanh nhẹn, thưởng ngay 20 điểm.',
  },
  star: {
    type: 'star',
    name: 'Sao May Mắn',
    image: ASSET_PATHS.images.star,
    points: 30,
    probability: 0.1,
    description: 'Vật phẩm hiếm! Nhận 30 điểm và hiệu ứng rực rỡ.',
    isBonus: true,
  },
  snake: {
    type: 'snake',
    name: 'Khoai Tây Độc',
    image: ASSET_PATHS.images.snake,
    points: -30,
    probability: 0.1,
    description: 'Cạm bẫy! Trừ 30 điểm và khóa bàn chơi 2 giây.',
    isHazard: true,
  },
};

export const ANIMAL_LIST: AnimalDefinition[] = Object.values(ANIMAL_DEFINITIONS);

/**
 * Fallback Emoji/Symbols in case custom images are missing or loading
 */
export const ANIMAL_FALLBACKS: Record<string, string> = {
  mouse: '🐭',
  rabbit: '🐰',
  star: '⭐',
  snake: '🥔',
};
