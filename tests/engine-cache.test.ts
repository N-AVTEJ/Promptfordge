import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import {
  computeCacheKey,
  MemoryLruCache,
  engineCache,
} from "../lib/engine/cache";

describe("PromptForge Engine LRU Cache & Key Hashing", () => {
  beforeEach(() => {
    engineCache.clear();
  });

  describe("Cache Key Hashing (SHA-256)", () => {
    it("produces identical hash for identical execution parameters", () => {
      const key1 = computeCacheKey({
        prompt: "Summarize quantum computing in three sentences.",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        system: "You are a concise physicist.",
      });

      const key2 = computeCacheKey({
        prompt: "Summarize quantum computing in three sentences.",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        system: "You are a concise physicist.",
      });

      assert.strictEqual(key1, key2);
      assert.ok(key1.startsWith("pf_run_"));
    });

    it("normalizes whitespace and model case without altering hash result", () => {
      const keyNormal = computeCacheKey({
        prompt: "Craft a tweet about Rust.",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        system: "Be witty.",
      });

      const keyWhitespace = computeCacheKey({
        prompt: "   Craft a tweet about Rust.   ",
        model: "GEMINI-1.5-FLASH  ",
        temperature: 0.700001, // rounds to 0.70
        system: "  Be witty. ",
      });

      assert.strictEqual(keyNormal, keyWhitespace);
    });

    it("generates distinct hashes when any parameter differs", () => {
      const baseParams = {
        prompt: "Tell me a joke",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        system: "Humorous tone",
      };

      const baseKey = computeCacheKey(baseParams);

      const diffPrompt = computeCacheKey({
        ...baseParams,
        prompt: "Tell me a riddle",
      });
      assert.notStrictEqual(baseKey, diffPrompt);

      const diffModel = computeCacheKey({
        ...baseParams,
        model: "gpt-4o-mini",
      });
      assert.notStrictEqual(baseKey, diffModel);

      const diffTemp = computeCacheKey({
        ...baseParams,
        temperature: 0.2,
      });
      assert.notStrictEqual(baseKey, diffTemp);

      const diffSystem = computeCacheKey({
        ...baseParams,
        system: "Serious tone",
      });
      assert.notStrictEqual(baseKey, diffSystem);
    });

    it("treats omitted system prompt consistently", () => {
      const keyWithoutSystem = computeCacheKey({
        prompt: "Say hi",
        model: "gemini-1.5-flash",
      });
      const keyWithEmptySystem = computeCacheKey({
        prompt: "Say hi",
        model: "gemini-1.5-flash",
        system: "",
      });
      assert.strictEqual(keyWithoutSystem, keyWithEmptySystem);
    });
  });

  describe("MemoryLruCache Behavior", () => {
    it("stores and retrieves items correctly", () => {
      const cache = new MemoryLruCache<string>(5);
      cache.set("key1", "val1");
      cache.set("key2", "val2");

      assert.strictEqual(cache.get("key1"), "val1");
      assert.strictEqual(cache.get("key2"), "val2");
      assert.strictEqual(cache.get("unknown"), null);
      assert.strictEqual(cache.has("key1"), true);
      assert.strictEqual(cache.has("unknown"), false);
      assert.strictEqual(cache.size(), 2);
    });

    it("evicts the least recently used item when capacity is exceeded", () => {
      const cache = new MemoryLruCache<string>(3);
      cache.set("a", "alpha");
      cache.set("b", "beta");
      cache.set("c", "gamma");

      assert.strictEqual(cache.size(), 3);

      // Inserting 4th item "d" must evict "a" (oldest)
      cache.set("d", "delta");
      assert.strictEqual(cache.get("a"), null);
      assert.strictEqual(cache.get("b"), "beta");
      assert.strictEqual(cache.get("c"), "gamma");
      assert.strictEqual(cache.get("d"), "delta");
      assert.strictEqual(cache.size(), 3);
    });

    it("refreshes LRU priority upon get() access", () => {
      const cache = new MemoryLruCache<string>(3);
      cache.set("a", "alpha");
      cache.set("b", "beta");
      cache.set("c", "gamma");

      // Access "a", making "b" the least recently used
      assert.strictEqual(cache.get("a"), "alpha");

      // Now insert "d" -> "b" should be evicted, NOT "a"
      cache.set("d", "delta");
      assert.strictEqual(cache.get("b"), null); // Evicted!
      assert.strictEqual(cache.get("a"), "alpha"); // Retained!
      assert.strictEqual(cache.get("c"), "gamma");
      assert.strictEqual(cache.get("d"), "delta");
    });

    it("evicts expired entries according to TTL", async () => {
      const cache = new MemoryLruCache<string>(5, 50); // 50ms TTL
      cache.set("temp", "volatile");

      assert.strictEqual(cache.get("temp"), "volatile");

      // Wait for expiration
      await new Promise((res) => setTimeout(res, 60));

      assert.strictEqual(cache.get("temp"), null);
      assert.strictEqual(cache.has("temp"), false);
    });

    it("clears all entries on clear()", () => {
      const cache = new MemoryLruCache<string>(10);
      cache.set("1", "one");
      cache.set("2", "two");
      assert.strictEqual(cache.size(), 2);

      cache.clear();
      assert.strictEqual(cache.size(), 0);
      assert.strictEqual(cache.get("1"), null);
    });
  });
});
