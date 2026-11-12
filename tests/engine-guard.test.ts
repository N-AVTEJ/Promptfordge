import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import {
  checkRateLimit,
  checkDailyBudget,
  validatePayloadLimits,
  guardRequest,
  recordTokenUsage,
  getGuardStatus,
  resetGuardState,
  setTestDailyTokenBudget,
  setTestRateLimit,
  RateLimitError,
  BudgetExhaustedError,
  GuardValidationError,
} from "../lib/engine/guard";
import { ENGINE_CONFIG } from "../lib/engine/config";

describe("PromptForge Guard Engine", () => {
  beforeEach(() => {
    resetGuardState();
  });

  describe("Per-IP Rate Limiting", () => {
    it("allows up to 20 runs per hour for a single IP", () => {
      const testIp = "192.168.1.42";

      // 20 requests should all succeed
      for (let i = 1; i <= 20; i++) {
        assert.doesNotThrow(() => checkRateLimit(testIp), `Request ${i} should be allowed`);
      }
    });

    it("enforces hard rate-limit error on the 21st request in an hour", () => {
      const testIp = "192.168.1.42";

      // Fill quota of 20
      for (let i = 0; i < 20; i++) {
        checkRateLimit(testIp);
      }

      // 21st request must throw RateLimitError
      assert.throws(
        () => checkRateLimit(testIp),
        (err: unknown) => {
          assert.ok(err instanceof RateLimitError);
          assert.strictEqual(err.code, "RATE_LIMITED");
          assert.strictEqual(err.limit, 20);
          assert.ok(err.retryAfterSeconds > 0 && err.retryAfterSeconds <= 3600);
          assert.ok(err.message.includes("20 runs per hour"));
          return true;
        }
      );
    });

    it("isolates rate limits between different IP addresses", () => {
      const ipA = "10.0.0.1";
      const ipB = "10.0.0.2";

      // Max out ipA
      for (let i = 0; i < 20; i++) {
        checkRateLimit(ipA);
      }
      assert.throws(() => checkRateLimit(ipA), RateLimitError);

      // ipB should still be completely unblocked
      assert.doesNotThrow(() => checkRateLimit(ipB));
      assert.doesNotThrow(() => checkRateLimit(ipB));
    });

    it("honors dynamic / custom rate limits", () => {
      const testIp = "172.16.0.5";
      setTestRateLimit(3);

      checkRateLimit(testIp);
      checkRateLimit(testIp);
      checkRateLimit(testIp);

      // 4th request exceeds custom limit of 3
      assert.throws(() => checkRateLimit(testIp), RateLimitError);
    });
  });

  describe("Global Daily Token Budget Hard Stop", () => {
    it("setting the daily budget to a tiny number triggers the hard stop", () => {
      // Set tiny budget of 50 tokens
      setTestDailyTokenBudget(50);

      // Below budget: passes
      assert.doesNotThrow(() => checkDailyBudget());

      // Record 60 tokens (exceeds 50)
      recordTokenUsage(60);

      // Should now trigger the hard stop
      assert.throws(
        () => checkDailyBudget(),
        (err: unknown) => {
          assert.ok(err instanceof BudgetExhaustedError);
          assert.strictEqual(err.code, "BUDGET_EXHAUSTED");
          assert.strictEqual(err.dailyBudget, 50);
          assert.strictEqual(err.currentUsage, 60);
          assert.ok(err.message.includes("Daily token budget exhausted"));
          return true;
        }
      );
    });

    it("triggers hard stop immediately when budget is set to 0", () => {
      setTestDailyTokenBudget(0);
      assert.throws(() => checkDailyBudget(), BudgetExhaustedError);
    });

    it("accumulates tokens accurately and respects default budget threshold", () => {
      recordTokenUsage(100);
      recordTokenUsage(250);
      const status = getGuardStatus();
      assert.strictEqual(status.dailyTokensUsed, 350);
    });
  });

  describe("Payload Limits Validation", () => {
    it("rejects prompts that exceed maxPromptLength", () => {
      const oversizedPrompt = "A".repeat(ENGINE_CONFIG.maxPromptLength + 1);

      assert.throws(
        () => validatePayloadLimits({ prompt: oversizedPrompt }),
        (err: unknown) => {
          assert.ok(err instanceof GuardValidationError);
          assert.strictEqual(err.field, "prompt");
          assert.ok(err.message.includes("exceeds maximum limit"));
          return true;
        }
      );
    });

    it("rejects maxOutputTokens that exceed engine limits", () => {
      assert.throws(
        () =>
          validatePayloadLimits({
            prompt: "Test prompt",
            maxOutputTokens: ENGINE_CONFIG.maxOutputTokens + 100,
          }),
        (err: unknown) => {
          assert.ok(err instanceof GuardValidationError);
          assert.strictEqual(err.field, "maxOutputTokens");
          return true;
        }
      );
    });

    it("accepts valid prompt within boundaries", () => {
      assert.doesNotThrow(() =>
        validatePayloadLimits({
          prompt: "Write a high-converting landing page headline.",
          maxOutputTokens: 1024,
        })
      );
    });
  });

  describe("Full guardRequest Composite Flow", () => {
    it("runs validation, budget check, and rate limit check in order", () => {
      const testIp = "127.0.0.1";
      assert.doesNotThrow(() =>
        guardRequest({
          ip: testIp,
          prompt: "Hello world",
          maxOutputTokens: 500,
        })
      );
    });
  });
});
