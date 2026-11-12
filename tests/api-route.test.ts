import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import { POST } from "../app/api/run/route";
import { engineCache } from "../lib/engine/cache";
import {
  resetGuardState,
  setTestDailyTokenBudget,
  setTestRateLimit,
} from "../lib/engine/guard";

function createMockRequest(
  body: unknown,
  options?: { ip?: string; headers?: Record<string, string> }
): NextRequest {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (options?.ip) {
    headers.set("x-forwarded-for", options.ip);
  }
  if (options?.headers) {
    for (const [k, v] of Object.entries(options.headers)) {
      headers.set(k, v);
    }
  }

  const url = "http://localhost:3000/api/run";
  const req = new NextRequest(url, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return req;
}

describe("POST /api/run Route Handler", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    engineCache.clear();
    resetGuardState();
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns 400 for malformed JSON request body", async () => {
    const req = createMockRequest("this is not json");
    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error.code, "INVALID_INPUT");
  });

  it("returns 400 for missing prompt", async () => {
    const req = createMockRequest({ prompt: "" });
    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error.code, "INVALID_INPUT");
  });

  it("returns 400 with MISSING_API_KEY when no server key or BYOK header is set", async () => {
    const req = createMockRequest({ prompt: "Hello world", model: "gemini-1.5-flash" });
    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error.code, "MISSING_API_KEY");
    assert.strictEqual(data.error.provider, "gemini");
  });

  it("executes successfully with 200 when BYOK header is provided", async () => {
    global.fetch = (async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: { parts: [{ text: "BYOK generation worked!" }] },
              finishReason: "STOP",
            },
          ],
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 10 },
        }),
      } as unknown as Response;
    }) as unknown as typeof fetch;

    const req = createMockRequest(
      { prompt: "Tell me about BYOK", model: "gemini-1.5-flash" },
      { headers: { "x-provider-key": "ephemeral-user-api-key" } }
    );

    const res = await POST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.text, "BYOK generation worked!");
    assert.strictEqual(data.data.cached, false);
  });

  it("returns 429 when per-IP rate limit is reached", async () => {
    setTestRateLimit(2);
    const testIp = "203.0.113.195";

    global.fetch = (async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "Ok" }] } }],
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 5 },
        }),
      } as unknown as Response;
    }) as unknown as typeof fetch;

    // Run 1
    const res1 = await POST(
      createMockRequest(
        { prompt: "Run 1" },
        { ip: testIp, headers: { "x-provider-key": "dummy" } }
      )
    );
    assert.strictEqual(res1.status, 200);

    // Run 2
    const res2 = await POST(
      createMockRequest(
        { prompt: "Run 2" },
        { ip: testIp, headers: { "x-provider-key": "dummy" } }
      )
    );
    assert.strictEqual(res2.status, 200);

    // Run 3 exceeds limit of 2 -> 429 RATE_LIMITED
    const res3 = await POST(
      createMockRequest(
        { prompt: "Run 3" },
        { ip: testIp, headers: { "x-provider-key": "dummy" } }
      )
    );
    assert.strictEqual(res3.status, 429);
    const data3 = await res3.json();
    assert.strictEqual(data3.success, false);
    assert.strictEqual(data3.error.code, "RATE_LIMITED");
    assert.ok(data3.error.retryAfterSeconds > 0);
  });

  it("returns 429 when daily token budget is exhausted", async () => {
    setTestDailyTokenBudget(10);

    global.fetch = (async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "Heavy reply" }] } }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 15 },
        }),
      } as unknown as Response;
    }) as unknown as typeof fetch;

    // Run 1: consumes 25 tokens, exceeding budget of 10
    const res1 = await POST(
      createMockRequest(
        { prompt: "Consume tokens" },
        { headers: { "x-provider-key": "key" } }
      )
    );
    assert.strictEqual(res1.status, 200);

    // Run 2: blocked by budget hard stop
    const res2 = await POST(
      createMockRequest(
        { prompt: "Consume more" },
        { headers: { "x-provider-key": "key" } }
      )
    );
    assert.strictEqual(res2.status, 429);
    const data2 = await res2.json();
    assert.strictEqual(data2.success, false);
    assert.strictEqual(data2.error.code, "BUDGET_EXHAUSTED");
  });
});
