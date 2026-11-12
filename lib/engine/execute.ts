/**
 * PromptForge Central Prompt Execution Engine
 * Validates input (Zod), checks guardrails, queries cache,
 * invokes provider adapter, computes cost, and returns normalized RunResult.
 */

import { z } from "zod";
import { estimateCost } from "@/content/pricing";
import { getProvider } from "@/lib/providers";
import { computeCacheKey, engineCache } from "./cache";
import { guardRequest, recordTokenUsage } from "./guard";

export const ExecuteInputSchema = z.object({
  prompt: z
    .string({
      required_error: "Prompt is required",
      invalid_type_error: "Prompt must be a string",
    })
    .min(1, "Prompt cannot be empty"),
  system: z.string().optional(),
  model: z.string().default("gemini-1.5-flash"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxOutputTokens: z.number().int().min(1).max(8192).optional(),
});

export type ExecuteInput = z.infer<typeof ExecuteInputSchema> & {
  apiKey?: string;
  ip?: string;
  skipCache?: boolean;
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

  const ip = input.ip || "127.0.0.1";

  // 2. Guardrails check: Payload bounds, Daily budget hard stop, and Per-IP rate limit
  guardRequest({
    ip,
    prompt: parsed.prompt,
    maxOutputTokens: parsed.maxOutputTokens,
  });

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

  // 8. Save to cache
  engineCache.set(cacheKey, finalResult);

  return finalResult;
}
