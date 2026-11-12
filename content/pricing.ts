/**
 * PromptForge Model Pricing Table & Cost Estimation
 * Units: USD per 1,000,000 tokens (1M tokens)
 */

export interface ModelPricing {
  modelId: string;
  displayName: string;
  provider: "gemini" | "openai";
  inputCostPer1M: number; // in USD
  outputCostPer1M: number; // in USD
  contextWindow: number;
}

export const MODEL_PRICING_TABLE: Record<string, ModelPricing> = {
  "gemini-1.5-flash": {
    modelId: "gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
    provider: "gemini",
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.3,
    contextWindow: 1048576,
  },
  "gemini-1.5-pro": {
    modelId: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    provider: "gemini",
    inputCostPer1M: 3.5,
    outputCostPer1M: 10.5,
    contextWindow: 2097152,
  },
  "gemini-2.0-flash": {
    modelId: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    provider: "gemini",
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.4,
    contextWindow: 1048576,
  },
  "gpt-4o-mini": {
    modelId: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    provider: "openai",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    contextWindow: 128000,
  },
  "gpt-4o": {
    modelId: "gpt-4o",
    displayName: "GPT-4o",
    provider: "openai",
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    contextWindow: 128000,
  },
};

export const DEFAULT_MODEL_PRICING: ModelPricing = {
  modelId: "default",
  displayName: "Standard LLM",
  provider: "gemini",
  inputCostPer1M: 0.1,
  outputCostPer1M: 0.4,
  contextWindow: 128000,
};

/**
 * Calculates the estimated USD cost for a given model run based on token counts.
 * Returns cost rounded to 6 decimal places (e.g. 0.000042).
 */
export function estimateCost(
  model: string,
  tokensIn: number,
  tokensOut: number
): number {
  const normalizedModel = (model || "").trim().toLowerCase();
  const pricing = MODEL_PRICING_TABLE[normalizedModel] || DEFAULT_MODEL_PRICING;
  const safeTokensIn = Math.max(0, tokensIn || 0);
  const safeTokensOut = Math.max(0, tokensOut || 0);
  const inputCost = (safeTokensIn / 1_000_000) * pricing.inputCostPer1M;
  const outputCost = (safeTokensOut / 1_000_000) * pricing.outputCostPer1M;
  const total = inputCost + outputCost;
  // Round to 6 decimal places to prevent float precision noise
  return Math.round(total * 1_000_000) / 1_000_000;
}
