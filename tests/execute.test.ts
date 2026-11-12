import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { executePrompt, RunResult } from "../lib/engine/execute";
import { engineCache } from "../lib/engine/cache";
import { resetGuardState, setTestDailyTokenBudget } from "../lib/engine/guard";

describe("PromptForge Execution Engine", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    engineCache.clear();
    resetGuardState();
    process.env.GEMINI_API_KEY = "test-mock-gemini-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.GEMINI_API_KEY;
  });

  it("validates input and rejects empty prompt with Zod error", async () => {
    await assert.rejects(
      async () => {
        await executePrompt({ prompt: "" });
      },
      (err: unknown) => {
        assert.ok(err && typeof err === "object" && "issues" in err);
        return true;
      }
    );
  });

  it("rejects whitespace-only prompt with Zod validation error instead of hitting upstream", async () => {
    await assert.rejects(
      async () => {
        await executePrompt({ prompt: "   \n\t   " });
      },
      (err: unknown) => {
        assert.ok(err && typeof err === "object" && "issues" in err);
        return true;
      }
    );
  });

  it("rejects maxOutputTokens exceeding engine limit with Zod error", async () => {
    await assert.rejects(
      async () => {
        await executePrompt({
          prompt: "Valid prompt",
          maxOutputTokens: 99999,
        });
      },
      (err: unknown) => {
        assert.ok(err && typeof err === "object" && "issues" in err);
        return true;
      }
    );
  });

  it("returns cached: true and near-zero latency on the second identical run", async () => {
    let fetchCalls = 0;
    // Mock successful Gemini response
    global.fetch = (async () => {
      fetchCalls++;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  { text: "Quantum computing uses qubits in superposition." },
                ],
              },
              finishReason: "STOP",
            },
          ],
          usageMetadata: {
            promptTokenCount: 15,
            candidatesTokenCount: 20,
            totalTokenCount: 35,
          },
        }),
      } as unknown as Response;
    }) as unknown as typeof fetch;

    const input = {
      prompt: "Explain qubits simply",
      model: "gemini-1.5-flash",
      temperature: 0.5,
    };

    // First call (uncached)
    const res1 = await executePrompt(input);
    assert.strictEqual(res1.cached, false);
    assert.strictEqual(res1.tokensIn, 15);
    assert.strictEqual(res1.tokensOut, 20);
    assert.strictEqual(
      res1.text,
      "Quantum computing uses qubits in superposition."
    );
    assert.ok(res1.costEstimateUsd > 0);
    assert.strictEqual(fetchCalls, 1);

    // Second call (MUST be cached)
    const res2 = await executePrompt(input);
    assert.strictEqual(res2.cached, true);
    assert.strictEqual(
      res2.latencyMs <= 1,
      true,
      "Cached call latency should be near-zero"
    );
    assert.strictEqual(res2.text, res1.text);
    assert.strictEqual(res2.tokensIn, 15);
    assert.strictEqual(res2.tokensOut, 20);
    assert.strictEqual(fetchCalls, 1, "Should not make a second network fetch");
  });

  it("triggers hard stop when daily budget is exhausted", async () => {
    setTestDailyTokenBudget(20);

    global.fetch = (async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "Done" }] } }],
          usageMetadata: { promptTokenCount: 15, candidatesTokenCount: 10 },
        }),
      } as unknown as Response;
    }) as unknown as typeof fetch;

    // First call: uses 25 tokens, exceeding budget of 20
    await executePrompt({ prompt: "First run", model: "gemini-1.5-flash" });

    // Second call: guard must throw BudgetExhaustedError
    await assert.rejects(
      async () => {
        await executePrompt({
          prompt: "Second run",
          model: "gemini-1.5-flash",
        });
      },
      (err: any) => {
        assert.strictEqual(err.code, "BUDGET_EXHAUSTED");
        return true;
      }
    );
  });

  it("throws MissingApiKeyError clearly without crashing when no key is configured", async () => {
    delete process.env.GEMINI_API_KEY;

    await assert.rejects(
      async () => {
        await executePrompt({
          prompt: "Run without key",
          model: "gemini-1.5-flash",
        });
      },
      (err: any) => {
        assert.strictEqual(err.code, "MISSING_API_KEY");
        assert.strictEqual(err.provider, "gemini");
        return true;
      }
    );
  });

  it("does not poison cache with empty text completions", async () => {
    let callCount = 0;
    global.fetch = (async () => {
      callCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "" }] }, finishReason: "STOP" }],
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 0 },
        }),
      } as unknown as Response;
    }) as unknown as typeof fetch;

    const res1 = await executePrompt({
      prompt: "Empty test prompt",
      model: "gemini-1.5-flash",
    });
    assert.strictEqual(res1.text, "");
    assert.strictEqual(res1.cached, false);

    // Call count was 1
    assert.strictEqual(callCount, 1);

    // Second run should NOT hit cache because empty text is excluded from cache persistence
    await executePrompt({
      prompt: "Empty test prompt",
      model: "gemini-1.5-flash",
    });
    assert.strictEqual(callCount, 2, "Second run must not hit poisoned cache");
  });

  it("allows programmatic internal runs without IP without client rate limiting", async () => {
    global.fetch = (async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "Evaluation ok" }] } }],
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 5 },
        }),
      } as unknown as Response;
    }) as unknown as typeof fetch;

    // Run 25 times programmatically without IP (e.g. lab evaluation bench)
    for (let i = 1; i <= 25; i++) {
      const res = await executePrompt({
        prompt: `Programmatic evaluation run ${i}`,
        model: "gemini-1.5-flash",
      });
      assert.strictEqual(res.text, "Evaluation ok");
    }
  });
});
