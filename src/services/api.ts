import type { AuthUser, LeaderboardEntry, HighScorePackage } from '../types/game';

const API_BASE_URL = 'https://dprojectsserver.azurewebsites.net';
const USER_STORAGE_KEY = 'wamLoggedUser';
const HIGH_SCORE_KEY = 'whackAMewHighScore';

export const getStoredHighScore = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
};

export const saveStoredHighScore = (score: number): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // Storage quota or private mode error
  }
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    sessionStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const saveStoredUser = (user: AuthUser | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Session storage error
  }
};

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
  message?: string;
}

const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const err = payload as ApiErrorResponse | null;
    const errorMessage = err?.error?.message || err?.message || `Lỗi máy chủ (${response.status})`;
    throw new Error(errorMessage);
  }

  return payload as T;
};

export const loginOrSignup = async (username: string, password: string): Promise<{ userId?: string | null }> => {
  return apiRequest<{ userId?: string | null }>('/api/profile/login-or-signup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

const parseHighScorePackage = (rawPackage: unknown): HighScorePackage => {
  if (!rawPackage) return { highScore: 0, timeSpan: 0 };

  const normalize = (value: Record<string, unknown>): HighScorePackage => {
    const highScore = Number(value?.highScore ?? value?.HighScore ?? 0);
    const timeSpan = Number(value?.timeSpan ?? value?.TimeSpan ?? 0);
    return {
      highScore: Number.isFinite(highScore) ? highScore : 0,
      timeSpan: Number.isFinite(timeSpan) ? timeSpan : 0,
    };
  };

  if (typeof rawPackage === 'string') {
    try {
      const parsed = JSON.parse(rawPackage);
      return normalize(parsed);
    } catch {
      return { highScore: 0, timeSpan: 0 };
    }
  }

  if (typeof rawPackage === 'object' && rawPackage !== null) {
    return normalize(rawPackage as Record<string, unknown>);
  }

  return { highScore: 0, timeSpan: 0 };
};

interface RawLeaderboardEntry {
  username?: string;
  Username?: string;
  highScorePackage?: unknown;
  HighScorePackage?: unknown;
}

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const payload = await apiRequest<RawLeaderboardEntry[]>('/api/profile/get-leaderboard', {
    method: 'GET',
  });

  if (!Array.isArray(payload)) return [];

  return payload.map((entry) => ({
    username: entry.username || entry.Username || 'Vô danh',
    package: parseHighScorePackage(entry.highScorePackage || entry.HighScorePackage),
  })).sort((a, b) => b.package.highScore - a.package.highScore);
};

export const updateServerHighScore = async (
  user: AuthUser,
  highScore: number,
  timeSpan: number
): Promise<unknown> => {
  if (!user.username || !user.password) return null;

  return apiRequest('/api/profile/update-high-score', {
    method: 'PUT',
    body: JSON.stringify({
      username: user.username,
      password: user.password,
      newHighScore: {
        highScore,
        timeSpan,
      },
    }),
  });
};
