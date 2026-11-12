/**
 * PromptForge Central Prompt Execution Engine
 * Validates input (Zod), checks guardrails, queries cache,
 * invokes provider adapter, computes cost, and returns normalized RunResult.
 */

import { z } from "zod";
import { estimateCost } from "@/content/pricing";
import { getProvider } from "@/lib/providers";
import { computeCacheKey, engineCache } from "./cache";
import { ENGINE_CONFIG } from "./config";
import {
  checkDailyBudget,
  checkRateLimit,
  recordTokenUsage,
  validatePayloadLimits,
} from "./guard";

export const ExecuteInputSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt cannot be empty"),
  system: z.string().trim().optional(),
  model: z.string().trim().default("gemini-1.5-flash"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxOutputTokens: z
    .number()
    .int()
    .min(1, "maxOutputTokens must be at least 1")
    .max(
      ENGINE_CONFIG.maxOutputTokens,
      `Requested maxOutputTokens exceeds engine limit of ${ENGINE_CONFIG.maxOutputTokens}`
    )
    .optional(),
});

export type ExecuteInput = z.input<typeof ExecuteInputSchema> & {
  apiKey?: string;
  ip?: string;
  skipCache?: boolean;
  skipRateLimit?: boolean;
};

export interface RunResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  latencyMs: number;
  costEstimateUsd: number;
  cached: boolean;
  model: string;
  provider: string;
  finishReason?: string;
  timestamp: number;
}

/**
 * Execute a prompt with end-to-end guarding, caching, and cost estimation.
 */
export async function executePrompt(input: ExecuteInput): Promise<RunResult> {
  // 1. Zod input validation
  const parsed = ExecuteInputSchema.parse({
    prompt: input.prompt,
    system: input.system,
    model: input.model || "gemini-1.5-flash",
    temperature: input.temperature ?? 0.7,
    maxOutputTokens: input.maxOutputTokens,
  });

  // 2. Guardrails check: Payload bounds & Daily budget hard stop
  validatePayloadLimits({
    prompt: parsed.prompt,
    maxOutputTokens: parsed.maxOutputTokens,
  });
  checkDailyBudget();

  // Enforce per-IP rate limit when an IP is specified (e.g. from API route) and not bypassed
  if (input.ip && !input.skipRateLimit) {
    checkRateLimit(input.ip);
  }

  // 3. Cache Check
  const cacheKey = computeCacheKey({
    prompt: parsed.prompt,
    model: parsed.model,
    temperature: parsed.temperature,
    system: parsed.system,
  });

  if (!input.skipCache) {
    const cachedResult = engineCache.get(cacheKey) as RunResult | null;
    if (cachedResult) {
      return {
        ...cachedResult,
        cached: true,
        latencyMs: 1, // Near-zero latency indicator for cached response
        timestamp: Date.now(),
      };
    }
  }

  // 4. Resolve provider and run
  const provider = getProvider(parsed.model);

  const providerResult = await provider.run({
    prompt: parsed.prompt,
    system: parsed.system,
    model: parsed.model,
    temperature: parsed.temperature,
    maxOutputTokens: parsed.maxOutputTokens,
    apiKey: input.apiKey,
  });

  // 5. Cost estimation
  const costEstimateUsd = estimateCost(
    parsed.model,
    providerResult.tokensIn,
    providerResult.tokensOut
  );

  const totalTokens = providerResult.tokensIn + providerResult.tokensOut;

  // 6. Record consumed tokens to global daily budget
  recordTokenUsage(totalTokens);

  // 7. Assemble normalized RunResult
  const finalResult: RunResult = {
    text: providerResult.text,
    tokensIn: providerResult.tokensIn,
    tokensOut: providerResult.tokensOut,
    totalTokens,
    latencyMs: providerResult.latencyMs,
    costEstimateUsd,
    cached: false,
    model: parsed.model,
    provider: provider.name,
    finishReason: providerResult.finishReason,
    timestamp: Date.now(),
  };

  // 8. Save to cache only when valid non-empty response was generated
  if (finalResult.text && finalResult.text.trim().length > 0) {
    engineCache.set(cacheKey, finalResult);
  }

  return finalResult;
}
