import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { GeminiProvider } from "../lib/providers/gemini";
import { OpenAIProvider } from "../lib/providers/openai";
import { getProvider } from "../lib/providers/index";
import { MissingApiKeyError } from "../lib/providers/types";

describe("PromptForge Provider Adapters", () => {
  const originalGeminiKey = process.env.GEMINI_API_KEY;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  describe("Gemini Adapter", () => {
    it("reports unavailable when no GEMINI_API_KEY is configured", () => {
      const provider = new GeminiProvider();
      assert.strictEqual(provider.isAvailable(), false);
    });

    it("reports available when explicit BYOK key is provided", () => {
      const provider = new GeminiProvider();
      assert.strictEqual(provider.isAvailable("test-byok-key"), true);
    });

    it("throws MissingApiKeyError when run is attempted with no key", async () => {
      const provider = new GeminiProvider();
      await assert.rejects(
        async () => {
          await provider.run({ prompt: "Hello" });
        },
        (err: unknown) => {
          assert.ok(err instanceof MissingApiKeyError);
          assert.strictEqual(err.provider, "gemini");
          assert.strictEqual(err.code, "MISSING_API_KEY");
          return true;
        }
      );
    });
  });

  describe("OpenAI Adapter", () => {
    it("is cleanly disabled when no OPENAI_API_KEY is configured", () => {
      const provider = new OpenAIProvider();
      assert.strictEqual(provider.isAvailable(), false);
    });

    it("reports available when explicit BYOK key is provided", () => {
      const provider = new OpenAIProvider();
      assert.strictEqual(provider.isAvailable("sk-proj-testkey"), true);
    });

    it("throws MissingApiKeyError cleanly when run is called without key", async () => {
      const provider = new OpenAIProvider();
      await assert.rejects(
        async () => {
          await provider.run({ prompt: "Hello OpenAI" });
        },
        (err: unknown) => {
          assert.ok(err instanceof MissingApiKeyError);
          assert.strictEqual(err.provider, "openai");
          assert.ok(err.message.includes("disabled cleanly"));
          return true;
        }
      );
    });
  });

  describe("Provider Registry", () => {
    it("resolves providers by model name", () => {
      const gemini = getProvider("gemini-1.5-flash");
      assert.strictEqual(gemini.name, "gemini");

      const openai = getProvider("gpt-4o-mini");
      assert.strictEqual(openai.name, "openai");
    });

    it("resolves providers by provider identifier", () => {
      assert.strictEqual(getProvider("gemini").name, "gemini");
      assert.strictEqual(getProvider("openai").name, "openai");
    });
  });
});
