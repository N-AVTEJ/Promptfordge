/**
 * PromptForge Shared AI Backend Limits & Config
 * Centralized configuration for guard thresholds, rate limiting, and cache.
 */

export interface EngineConfig {
  /** Maximum allowed prompt length in characters */
  maxPromptLength: number;
  /** Maximum allowable output tokens in single request */
  maxOutputTokens: number;
  /** Number of runs allowed per IP within a sliding 1-hour window */
  rateLimitRunsPerHour: number;
  /** Global daily token hard stop budget */
  dailyTokenBudget: number;
  /** Maximum number of entries stored in the in-memory LRU cache */
  cacheMaxEntries: number;
  /** Time to live for cached responses in milliseconds (default 24 hours) */
  cacheTtlMs: number;
}

function parseEnvInt(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (!raw) return defaultValue;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const ENGINE_CONFIG: EngineConfig = {
  maxPromptLength: parseEnvInt("PROMPTFORGE_MAX_PROMPT_LENGTH", 12000),
  maxOutputTokens: parseEnvInt("PROMPTFORGE_MAX_OUTPUT_TOKENS", 4096),
  rateLimitRunsPerHour: parseEnvInt("PROMPTFORGE_RATE_LIMIT_PER_HOUR", 20),
  dailyTokenBudget: parseEnvInt("PROMPTFORGE_DAILY_TOKEN_BUDGET", 500000),
  cacheMaxEntries: parseEnvInt("PROMPTFORGE_CACHE_MAX_ENTRIES", 500),
  cacheTtlMs: parseEnvInt(
    "PROMPTFORGE_CACHE_TTL_MS",
    24 * 60 * 60 * 1000 // 24 hours
  ),
};
