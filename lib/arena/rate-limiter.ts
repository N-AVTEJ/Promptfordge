/**
 * PromptForge Security Arena Rate Limiter
 * Enforces stricter rate limits than standard labs (15 runs / hour with burst protection of 8 / min).
 */

export class ArenaRateLimitError extends Error {
  readonly code = "ARENA_RATE_LIMITED";
  readonly retryAfterSeconds: number;
  readonly limit: number;

  constructor(limit: number, retryAfterSeconds: number) {
    const secs = Math.max(1, retryAfterSeconds);
    super(
      `Arena rate limit exceeded: maximum ${limit} security executions allowed. Sandbox cooldown active; retry in ${secs}s.`
    );
    this.name = "ArenaRateLimitError";
    this.limit = limit;
    this.retryAfterSeconds = secs;
  }
}

interface ArenaRateLimiterState {
  clientHourlyRuns: Map<string, number[]>; // Client identifier -> timestamps
  clientBurstRuns: Map<string, number[]>; // Client identifier -> timestamps for burst
  hourlyLimit: number;
  burstLimit: number;
}

const DEFAULT_HOURLY_LIMIT = 15; // Stricter than standard 20/hr
const DEFAULT_BURST_LIMIT = 8; // Max 8 runs in a 60-second window

const state: ArenaRateLimiterState = {
  clientHourlyRuns: new Map(),
  clientBurstRuns: new Map(),
  hourlyLimit: DEFAULT_HOURLY_LIMIT,
  burstLimit: DEFAULT_BURST_LIMIT,
};

export function setTestArenaLimits(hourly: number, burst: number): void {
  state.hourlyLimit = hourly;
  state.burstLimit = burst;
}

export function resetArenaRateLimiter(): void {
  state.clientHourlyRuns.clear();
  state.clientBurstRuns.clear();
  state.hourlyLimit = DEFAULT_HOURLY_LIMIT;
  state.burstLimit = DEFAULT_BURST_LIMIT;
}

export function checkArenaRateLimit(clientId = "127.0.0.1"): {
  allowed: boolean;
  remainingHourly: number;
  remainingBurst: number;
} {
  const now = Date.now();
  const hourWindowMs = 60 * 60 * 1000;
  const burstWindowMs = 60 * 1000; // 1 minute

  const key = clientId.trim() || "127.0.0.1";

  // Clean stale keys periodically
  if (state.clientHourlyRuns.size > 1000) {
    state.clientHourlyRuns.forEach((ts, k) => {
      if (ts.length === 0 || now - ts[ts.length - 1] > hourWindowMs) {
        state.clientHourlyRuns.delete(k);
      }
    });
  }

  // 1. Check Burst Window (1 minute)
  const burstTimestamps = (state.clientBurstRuns.get(key) || []).filter(
    (t) => now - t < burstWindowMs
  );
  if (burstTimestamps.length >= state.burstLimit) {
    const oldest = burstTimestamps[0];
    const retrySec = Math.max(1, Math.ceil((oldest + burstWindowMs - now) / 1000));
    throw new ArenaRateLimitError(state.burstLimit, retrySec);
  }

  // 2. Check Hourly Window (1 hour)
  const hourlyTimestamps = (state.clientHourlyRuns.get(key) || []).filter(
    (t) => now - t < hourWindowMs
  );
  if (hourlyTimestamps.length >= state.hourlyLimit) {
    const oldest = hourlyTimestamps[0];
    const retrySec = Math.max(1, Math.ceil((oldest + hourWindowMs - now) / 1000));
    throw new ArenaRateLimitError(state.hourlyLimit, retrySec);
  }

  // Record run
  burstTimestamps.push(now);
  hourlyTimestamps.push(now);
  state.clientBurstRuns.set(key, burstTimestamps);
  state.clientHourlyRuns.set(key, hourlyTimestamps);

  return {
    allowed: true,
    remainingHourly: Math.max(0, state.hourlyLimit - hourlyTimestamps.length),
    remainingBurst: Math.max(0, state.burstLimit - burstTimestamps.length),
  };
}
