import type { AnimalDefinition, AnimalType } from '../types/game';

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

export const ANIMAL_DEFINITIONS: Record<AnimalType, AnimalDefinition> = {
  // --- Starter Items (Base Pool) ---
  mouse: {
    type: 'mouse',
    name: 'Chuột',
    emoji: '🐭',
    image: ASSET_PATHS.images.mouse,
    points: 10,
    probability: 0.35,
    description: 'Xuất hiện thường xuyên, nhanh tay ghi 10 điểm.',
  },
  rabbit: {
    type: 'rabbit',
    name: 'Thỏ',
    emoji: '🐰',
    image: ASSET_PATHS.images.rabbit,
    points: 20,
    probability: 0.25,
    description: 'Thỏ nhanh nhẹn, thưởng ngay 20 điểm.',
  },
  star: {
    type: 'star',
    name: 'Sao May Mắn',
    emoji: '⭐',
    image: ASSET_PATHS.images.star,
    points: 30,
    probability: 0.15,
    description: 'Vật phẩm hiếm! Nhận 30 điểm và hiệu ứng rực rỡ.',
    isBonus: true,
  },
  snake: {
    type: 'snake',
    name: 'Khoai Tây Độc',
    emoji: '🥔',
    image: ASSET_PATHS.images.snake,
    points: -30,
    probability: 0.12,
    description: 'Cạm bẫy! Trừ 30 điểm và khóa bàn chơi 2 giây.',
    isHazard: true,
    freezeDurationMs: 2000,
  },

  // --- 10 New Unlockable Items (Added every 15s in game) ---
  cat: {
    type: 'cat',
    name: 'Mèo Hoàng Thượng',
    emoji: '🐱',
    points: 15,
    probability: 0.22,
    description: 'Mèo lười quý tộc, đập nhẹ ghi 15 điểm.',
    unlockAfterSeconds: 15,
  },
  hamster: {
    type: 'hamster',
    name: 'Chuột Hamster',
    emoji: '🐹',
    points: 25,
    probability: 0.18,
    description: 'Hamster má phúng phính đáng yêu, thưởng 25 điểm.',
    unlockAfterSeconds: 30,
  },
  frog: {
    type: 'frog',
    name: 'Ếch Xanh',
    emoji: '🐸',
    points: 35,
    probability: 0.15,
    description: 'Ếch nhảy thoăn thoắt, nhanh tay bắt lấy 35 điểm.',
    unlockAfterSeconds: 45,
  },
  fox: {
    type: 'fox',
    name: 'Cáo Tinh Ranh',
    emoji: '🦊',
    points: 40,
    probability: 0.14,
    description: 'Cáo đỏ khôn khéo, săn được nhận ngay 40 điểm.',
    unlockAfterSeconds: 60,
  },
  hedgehog: {
    type: 'hedgehog',
    name: 'Nhím Gai Cảnh Báo',
    emoji: '🦔',
    points: -20,
    probability: 0.10,
    description: 'Coi chừng gai nhọn! Trừ 20 điểm và khựng 1 giây.',
    isHazard: true,
    freezeDurationMs: 1000,
    unlockAfterSeconds: 75,
  },
  panda: {
    type: 'panda',
    name: 'Gấu Trúc Quốc Bảo',
    emoji: '🐼',
    points: 50,
    probability: 0.12,
    description: 'Gấu trúc siêu quý hiếm, mang lại 50 điểm thưởng.',
    isBonus: true,
    unlockAfterSeconds: 90,
  },
  monkey: {
    type: 'monkey',
    name: 'Khỉ Láu Lỉnh',
    emoji: '🐵',
    points: 45,
    probability: 0.12,
    description: 'Khỉ tinh quái chuyền cành mau lẹ, thưởng 45 điểm.',
    unlockAfterSeconds: 105,
  },
  bomb: {
    type: 'bomb',
    name: 'Bom Nổ Chậm',
    emoji: '💣',
    points: -50,
    probability: 0.08,
    description: 'Cực kỳ nguy hiểm! Trừ 50 điểm và đóng băng 2.5 giây.',
    isHazard: true,
    freezeDurationMs: 2500,
    unlockAfterSeconds: 120,
  },
  pig: {
    type: 'pig',
    name: 'Heo Vàng Tài Lộc',
    emoji: '🐷',
    points: 60,
    probability: 0.09,
    description: 'Heo vàng phát tài phát lộc, rinh ngay 60 điểm!',
    isBonus: true,
    unlockAfterSeconds: 135,
  },
  dragon: {
    type: 'dragon',
    name: 'Rồng Thần Huyền Thoại',
    emoji: '🐲',
    points: 100,
    probability: 0.05,
    description: 'Vật phẩm tối thượng! Đại tiệc 100 điểm thưởng rực rỡ.',
    isBonus: true,
    unlockAfterSeconds: 150,
  },
};

export const INITIAL_ANIMAL_KEYS: AnimalType[] = ['mouse', 'rabbit', 'star', 'snake'];

export const UNLOCKABLE_ANIMAL_KEYS: AnimalType[] = [
  'cat',
  'hamster',
  'frog',
  'fox',
  'hedgehog',
  'panda',
  'monkey',
  'bomb',
  'pig',
  'dragon',
];

export const ANIMAL_LIST: AnimalDefinition[] = Object.values(ANIMAL_DEFINITIONS);

export const INITIAL_ANIMAL_LIST: AnimalDefinition[] = INITIAL_ANIMAL_KEYS.map(
  (key) => ANIMAL_DEFINITIONS[key]
);

export const UNLOCKABLE_ANIMAL_LIST: AnimalDefinition[] = UNLOCKABLE_ANIMAL_KEYS.map(
  (key) => ANIMAL_DEFINITIONS[key]
);

/**
 * Fallback Emoji/Symbols in case custom images are missing or loading
 */
export const ANIMAL_FALLBACKS: Record<AnimalType, string> = {
  mouse: '🐭',
  rabbit: '🐰',
  star: '⭐',
  snake: '🥔',
  cat: '🐱',
  hamster: '🐹',
  frog: '🐸',
  fox: '🦊',
  hedgehog: '🦔',
  panda: '🐼',
  monkey: '🐵',
  bomb: '💣',
  pig: '🐷',
  dragon: '🐲',
};
