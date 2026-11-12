import { describe, it } from "node:test";
import assert from "node:assert";
import {
  estimateCost,
  MODEL_PRICING_TABLE,
  DEFAULT_MODEL_PRICING,
} from "../content/pricing";

describe("PromptForge Pricing & Cost Estimator", () => {
  it("calculates cost accurately for Gemini 1.5 Flash", () => {
    // 1,000,000 input tokens = $0.075, 1,000,000 output tokens = $0.30
    const cost = estimateCost("gemini-1.5-flash", 1000, 500);
    // (1000 / 1e6)*0.075 + (500 / 1e6)*0.30 = 0.000075 + 0.00015 = 0.000225
    assert.strictEqual(cost, 0.000225);
  });

  it("calculates cost accurately for GPT-4o Mini", () => {
    // 1,000 input tokens: (1000/1M)*0.15 = 0.00015
    // 1,000 output tokens: (1000/1M)*0.60 = 0.00060
    // Total = 0.00075
    const cost = estimateCost("gpt-4o-mini", 1000, 1000);
    assert.strictEqual(cost, 0.00075);
  });

  it("handles zero token counts without crashing", () => {
    const cost = estimateCost("gemini-1.5-flash", 0, 0);
    assert.strictEqual(cost, 0);
  });

  it("falls back to default pricing for unrecognized models", () => {
    const cost = estimateCost("unknown-exotic-model", 1_000_000, 1_000_000);
    const expected =
      DEFAULT_MODEL_PRICING.inputCostPer1M +
      DEFAULT_MODEL_PRICING.outputCostPer1M;
    assert.strictEqual(cost, expected);
  });

  it("resolves pricing case-insensitively with whitespace tolerance", () => {
    const costLower = estimateCost("gemini-1.5-pro", 1000, 1000);
    const costUpper = estimateCost("  GEMINI-1.5-PRO  ", 1000, 1000);
    assert.strictEqual(costUpper, costLower);
    assert.ok(costUpper > 0.01); // Gemini 1.5 Pro is expensive, verifying it didn't fall back to cheap default
  });

  it("contains all required models in the pricing table", () => {
    const expectedModels = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash",
      "gpt-4o-mini",
      "gpt-4o",
    ];

    for (const model of expectedModels) {
      assert.ok(
        MODEL_PRICING_TABLE[model],
        `Missing model in pricing: ${model}`
      );
      assert.ok(MODEL_PRICING_TABLE[model].inputCostPer1M > 0);
      assert.ok(MODEL_PRICING_TABLE[model].outputCostPer1M > 0);
    }
  });
});
