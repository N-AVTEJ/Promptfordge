/**
 * PromptForge Guard Engine
 * Enforces per-IP rate limiting, global daily token budget hard stop,
 * and character/token payload boundaries.
 */

import { ENGINE_CONFIG } from "./config";

export class RateLimitError extends Error {
  readonly code = "RATE_LIMITED";
  readonly retryAfterSeconds: number;
  readonly limit: number;

  constructor(limit: number, retryAfterSeconds: number) {
    const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
    super(
      `Rate limit exceeded: maximum ${limit} runs per hour reached for your IP address. Please try again in ~${minutes} minute${minutes > 1 ? "s" : ""}.`
    );
    this.name = "RateLimitError";
    this.limit = limit;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class BudgetExhaustedError extends Error {
  readonly code = "BUDGET_EXHAUSTED";
  readonly currentUsage: number;
  readonly dailyBudget: number;

  constructor(currentUsage: number, dailyBudget: number) {
    super(
      `Daily token budget exhausted (${currentUsage.toLocaleString()} / ${dailyBudget.toLocaleString()} tokens used today). The shared sandbox hard stop resets at 00:00 UTC.`
    );
    this.name = "BudgetExhaustedError";
    this.currentUsage = currentUsage;
    this.dailyBudget = dailyBudget;
  }
}

export class GuardValidationError extends Error {
  readonly code = "GUARD_VALIDATION_ERROR";
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "GuardValidationError";
    this.field = field;
  }
}

interface GuardState {
  ipWindows: Map<string, number[]>; // IP -> array of timestamps (ms)
  dailyTokensUsed: number;
  currentDateUtc: string;
  dynamicDailyBudget: number | null;
  dynamicRateLimit: number | null;
}

function getTodayUtcString(): string {
  return new Date().toISOString().slice(0, 10);
}

const state: GuardState = {
  ipWindows: new Map(),
  dailyTokensUsed: 0,
  currentDateUtc: getTodayUtcString(),
  dynamicDailyBudget: null,
  dynamicRateLimit: null,
};

/**
 * Returns current effective daily token budget
 */
export function getDailyTokenBudget(): number {
  if (state.dynamicDailyBudget !== null) {
    return state.dynamicDailyBudget;
  }
  // Check runtime env override or config
  const envVal = process.env.PROMPTFORGE_DAILY_TOKEN_BUDGET;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return ENGINE_CONFIG.dailyTokenBudget;
}

/**
 * Returns current effective per-IP rate limit per hour
 */
export function getRateLimitPerHour(): number {
  if (state.dynamicRateLimit !== null) {
    return state.dynamicRateLimit;
  }
  const envVal = process.env.PROMPTFORGE_RATE_LIMIT_PER_HOUR;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return ENGINE_CONFIG.rateLimitRunsPerHour;
}

/**
 * Check and enforce per-IP rate limit.
 * Uses a sliding 1-hour window.
 */
export function checkRateLimit(ip: string): void {
  const normalizedIp = (ip || "127.0.0.1").trim();
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const limit = getRateLimitPerHour();

  // Periodic pruning of expired IP windows to prevent memory exhaustion
  if (state.ipWindows.size > 2000) {
    state.ipWindows.forEach((timestamps, key) => {
      if (
        timestamps.length === 0 ||
        now - timestamps[timestamps.length - 1] >= windowMs
      ) {
        state.ipWindows.delete(key);
      }
    });
  }

  const timestamps = state.ipWindows.get(normalizedIp) || [];
  // Evict timestamps older than 1 hour
  const recentTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (recentTimestamps.length >= limit) {
    const oldestTimestamp = recentTimestamps[0];
    const retryAfterMs = oldestTimestamp + windowMs - now;
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
    // Persist filtered list
    state.ipWindows.set(normalizedIp, recentTimestamps);
    throw new RateLimitError(limit, retryAfterSec);
  }

  // Record this run
  recentTimestamps.push(now);
  state.ipWindows.set(normalizedIp, recentTimestamps);
}

/**
 * Checks if the global daily token budget has been exhausted.
 */
export function checkDailyBudget(): void {
  const today = getTodayUtcString();
  if (state.currentDateUtc !== today) {
    state.currentDateUtc = today;
    state.dailyTokensUsed = 0;
  }

  const budget = getDailyTokenBudget();
  if (state.dailyTokensUsed >= budget) {
    throw new BudgetExhaustedError(state.dailyTokensUsed, budget);
  }
}

/**
 * Validates prompt length and requested output tokens against engine configuration.
 */
export function validatePayloadLimits(params: {
  prompt: string;
  maxOutputTokens?: number;
}): void {
  const promptStr = typeof params.prompt === "string" ? params.prompt : "";
  if (promptStr.length > ENGINE_CONFIG.maxPromptLength) {
    throw new GuardValidationError(
      "prompt",
      `Prompt length of ${promptStr.length} exceeds maximum limit of ${ENGINE_CONFIG.maxPromptLength} characters.`
    );
  }

  if (params.maxOutputTokens !== undefined) {
    if (params.maxOutputTokens <= 0) {
      throw new GuardValidationError(
        "maxOutputTokens",
        "Requested maxOutputTokens must be greater than 0."
      );
    }
    if (params.maxOutputTokens > ENGINE_CONFIG.maxOutputTokens) {
      throw new GuardValidationError(
        "maxOutputTokens",
        `Requested maxOutputTokens (${params.maxOutputTokens}) exceeds engine limit of ${ENGINE_CONFIG.maxOutputTokens}.`
      );
    }
  }
}

/**
 * Records token consumption into the daily budget.
 */
export function recordTokenUsage(tokens: number): void {
  const today = getTodayUtcString();
  if (state.currentDateUtc !== today) {
    state.currentDateUtc = today;
    state.dailyTokensUsed = 0;
  }
  state.dailyTokensUsed += Math.max(0, tokens);
}

/**
 * Full guard check before execution begins.
 */
export function guardRequest(params: {
  ip: string;
  prompt: string;
  maxOutputTokens?: number;
}): void {
  validatePayloadLimits({
    prompt: params.prompt,
    maxOutputTokens: params.maxOutputTokens,
  });
  checkDailyBudget();
  checkRateLimit(params.ip);
}

/**
 * Get current guard metrics (useful for telemetry and diagnostics)
 */
export function getGuardStatus(): {
  dailyTokensUsed: number;
  dailyTokenBudget: number;
  currentDateUtc: string;
  rateLimitRunsPerHour: number;
  trackedIpsCount: number;
} {
  return {
    dailyTokensUsed: state.dailyTokensUsed,
    dailyTokenBudget: getDailyTokenBudget(),
    currentDateUtc: state.currentDateUtc,
    rateLimitRunsPerHour: getRateLimitPerHour(),
    trackedIpsCount: state.ipWindows.size,
  };
}

/**
 * Test helpers for deterministic unit testing
 */
export function setTestDailyTokenBudget(budget: number | null): void {
  state.dynamicDailyBudget = budget;
}

export function setTestRateLimit(limit: number | null): void {
  state.dynamicRateLimit = limit;
}

export function resetGuardState(): void {
  state.ipWindows.clear();
  state.dailyTokensUsed = 0;
  state.currentDateUtc = getTodayUtcString();
  state.dynamicDailyBudget = null;
  state.dynamicRateLimit = null;
}
