/**
 * PromptForge Typed Versioned Storage Module
 * Features:
 * - Versioned storage keys (prefix: pf_v1_)
 * - Typed schemas for history, saved prompts, progress, settings, and drafts
 * - Resilient against SSR, corrupted JSON, missing keys, and quota errors
 * - In-memory fallback if window.localStorage is blocked/unavailable
 */

export const STORAGE_PREFIX = "pf_v1_";

export const STORAGE_KEYS = {
  HISTORY: `${STORAGE_PREFIX}history`,
  SAVED_PROMPTS: `${STORAGE_PREFIX}saved_prompts`,
  PROGRESS: `${STORAGE_PREFIX}progress`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  LAB_DRAFTS: `${STORAGE_PREFIX}lab_drafts`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export interface StorageHistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  response?: string;
  model: string;
  metrics?: Record<string, number>;
}

export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ProgressData {
  completedLessonIds: string[];
  completedLabIds: string[];
  challengeScores: Record<string, number>;
  streakDays: number;
  lastActiveTimestamp: number;
}

export interface UserSettings {
  theme: "forge-dark";
  enableSound: boolean;
  reducedMotionManualOverride?: boolean;
}

export interface StorageSchema {
  [STORAGE_KEYS.HISTORY]: StorageHistoryItem[];
  [STORAGE_KEYS.SAVED_PROMPTS]: SavedPrompt[];
  [STORAGE_KEYS.PROGRESS]: ProgressData;
  [STORAGE_KEYS.SETTINGS]: UserSettings;
  [STORAGE_KEYS.LAB_DRAFTS]: Record<string, string>;
}

export const STORAGE_DEFAULTS: StorageSchema = {
  [STORAGE_KEYS.HISTORY]: [],
  [STORAGE_KEYS.SAVED_PROMPTS]: [],
  [STORAGE_KEYS.PROGRESS]: {
    completedLessonIds: [],
    completedLabIds: [],
    challengeScores: {},
    streakDays: 0,
    lastActiveTimestamp: 0,
  },
  [STORAGE_KEYS.SETTINGS]: {
    theme: "forge-dark",
    enableSound: true,
  },
  [STORAGE_KEYS.LAB_DRAFTS]: {},
};

export const STORAGE_VALIDATORS: {
  [K in keyof StorageSchema]: (data: unknown) => data is StorageSchema[K];
} = {
  [STORAGE_KEYS.HISTORY]: (data: unknown): data is StorageHistoryItem[] =>
    Array.isArray(data),
  [STORAGE_KEYS.SAVED_PROMPTS]: (data: unknown): data is SavedPrompt[] =>
    Array.isArray(data),
  [STORAGE_KEYS.PROGRESS]: (data: unknown): data is ProgressData =>
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    Array.isArray((data as ProgressData).completedLessonIds) &&
    Array.isArray((data as ProgressData).completedLabIds),
  [STORAGE_KEYS.SETTINGS]: (data: unknown): data is UserSettings =>
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    typeof (data as UserSettings).theme === "string",
  [STORAGE_KEYS.LAB_DRAFTS]: (data: unknown): data is Record<string, string> =>
    data !== null && typeof data === "object" && !Array.isArray(data),
};

// In-memory cache fallback for SSR or restricted environments
const memoryFallback = new Map<string, string>();

/**
 * Check if window.localStorage is accessible and writable.
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = `${STORAGE_PREFIX}__test__`;
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely parse a JSON string with fallback and optional type validation.
 */
export function safeParseJson<T>(
  raw: string | null,
  fallback: T,
  validator?: (data: unknown) => boolean
): T {
  if (raw === null || raw === undefined || raw === "") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (validator && !validator(parsed)) {
      console.warn(
        "[PromptForge Storage] Data failed validation. Using fallback default."
      );
      return fallback;
    }
    return parsed as T;
  } catch (err) {
    console.warn(
      "[PromptForge Storage] Corrupt JSON encountered. Recovering with fallback default.",
      err
    );
    return fallback;
  }
}

/**
 * Typed getter for localStorage with automatic validation and corruption self-healing.
 */
export function getStorageItem<K extends keyof StorageSchema>(
  key: K,
  overrideDefault?: StorageSchema[K],
  validator?: (data: unknown) => boolean
): StorageSchema[K] {
  const fallback = overrideDefault ?? STORAGE_DEFAULTS[key];
  const effectiveValidator = validator ?? STORAGE_VALIDATORS[key];

  if (!isLocalStorageAvailable()) {
    const memVal = memoryFallback.get(key);
    return safeParseJson<StorageSchema[K]>(
      memVal ?? null,
      fallback,
      effectiveValidator
    );
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn(
        `[PromptForge Storage] Corrupt JSON syntax in "${key}". Self-healing storage with default.`,
        err
      );
      try {
        window.localStorage.setItem(key, JSON.stringify(fallback));
      } catch {
        // Ignore quota/write error on heal
      }
      return fallback;
    }

    if (effectiveValidator && !effectiveValidator(parsed)) {
      console.warn(
        `[PromptForge Storage] Data in "${key}" failed type validation. Self-healing storage with default.`
      );
      try {
        window.localStorage.setItem(key, JSON.stringify(fallback));
      } catch {
        // Ignore quota/write error on heal
      }
      return fallback;
    }

    return parsed as StorageSchema[K];
  } catch (err) {
    console.warn(`[PromptForge Storage] Failed to read key "${key}":`, err);
    return fallback;
  }
}

/**
 * Typed setter for localStorage.
 */
export function setStorageItem<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K]
): boolean {
  const serialized = JSON.stringify(value);

  if (!isLocalStorageAvailable()) {
    memoryFallback.set(key, serialized);
    return true;
  }

  try {
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`[PromptForge Storage] Failed to write key "${key}":`, err);
    // Fallback to memory
    memoryFallback.set(key, serialized);
    return false;
  }
}

/**
 * Typed remover.
 */
export function removeStorageItem<K extends keyof StorageSchema>(
  key: K
): boolean {
  if (!isLocalStorageAvailable()) {
    memoryFallback.delete(key);
    return true;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[PromptForge Storage] Failed to remove key "${key}":`, err);
    return false;
  }
}

/**
 * Clear all PromptForge stored keys (without disturbing unrelated keys).
 */
export function clearPromptForgeStorage(): void {
  if (isLocalStorageAvailable()) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch (err) {
      console.warn("[PromptForge Storage] Failed to clear storage:", err);
    }
  }

  memoryFallback.clear();
}
