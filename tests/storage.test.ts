import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import {
  STORAGE_KEYS,
  STORAGE_DEFAULTS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearPromptForgeStorage,
  safeParseJson,
} from "../lib/storage/index";

// Mock minimal window.localStorage for node environment
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

const mockStorage = new MockLocalStorage();
// Attach to global window
(global as unknown as { window: { localStorage: MockLocalStorage } }).window = {
  localStorage: mockStorage,
};

describe("PromptForge Typed Storage Module", () => {
  beforeEach(() => {
    mockStorage.clear();
    clearPromptForgeStorage();
  });

  it("returns default values when storage is empty", () => {
    const history = getStorageItem(STORAGE_KEYS.HISTORY);
    assert.deepStrictEqual(history, STORAGE_DEFAULTS[STORAGE_KEYS.HISTORY]);

    const progress = getStorageItem(STORAGE_KEYS.PROGRESS);
    assert.deepStrictEqual(progress, STORAGE_DEFAULTS[STORAGE_KEYS.PROGRESS]);
  });

  it("saves and retrieves typed items successfully", () => {
    const sampleHistory = [
      {
        id: "hist-1",
        timestamp: 1700000000,
        prompt: "System: You are an expert prompt engineer.",
        model: "gemini-1.5-pro",
      },
    ];

    const success = setStorageItem(STORAGE_KEYS.HISTORY, sampleHistory);
    assert.strictEqual(success, true);

    const retrieved = getStorageItem(STORAGE_KEYS.HISTORY);
    assert.strictEqual(retrieved.length, 1);
    assert.strictEqual(retrieved[0].id, "hist-1");
    assert.strictEqual(
      retrieved[0].prompt,
      "System: You are an expert prompt engineer."
    );
  });

  it("handles corrupt JSON string without crashing and returns default fallback", () => {
    // Deliberately inject completely corrupt JSON syntax
    mockStorage.setItem(
      STORAGE_KEYS.HISTORY,
      "{invalid_json:::syntax_error!!45@#$"
    );

    const result = getStorageItem(STORAGE_KEYS.HISTORY);
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 0);

    // Verify it healed the corrupt key in storage
    const healedRaw = mockStorage.getItem(STORAGE_KEYS.HISTORY);
    assert.strictEqual(
      healedRaw,
      JSON.stringify(STORAGE_DEFAULTS[STORAGE_KEYS.HISTORY])
    );
  });

  it("handles malformed non-object JSON without crashing", () => {
    mockStorage.setItem(STORAGE_KEYS.PROGRESS, "not a valid progress object");
    const result = getStorageItem(STORAGE_KEYS.PROGRESS);
    // Invalid JSON string returns fallback
    assert.deepStrictEqual(result, STORAGE_DEFAULTS[STORAGE_KEYS.PROGRESS]);
  });

  it("recovers and heals when storage contains valid JSON of incorrect schema type", () => {
    // Inject a valid JSON number where an array is expected
    mockStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(12345));
    const historyResult = getStorageItem(STORAGE_KEYS.HISTORY);
    assert.ok(Array.isArray(historyResult));
    assert.strictEqual(historyResult.length, 0);
    // Storage must be healed to default array
    assert.strictEqual(
      mockStorage.getItem(STORAGE_KEYS.HISTORY),
      JSON.stringify(STORAGE_DEFAULTS[STORAGE_KEYS.HISTORY])
    );

    // Inject a valid JSON string where an object is expected
    mockStorage.setItem(
      STORAGE_KEYS.PROGRESS,
      JSON.stringify("some-malicious-string")
    );
    const progressResult = getStorageItem(STORAGE_KEYS.PROGRESS);
    assert.deepStrictEqual(
      progressResult,
      STORAGE_DEFAULTS[STORAGE_KEYS.PROGRESS]
    );
    assert.strictEqual(
      mockStorage.getItem(STORAGE_KEYS.PROGRESS),
      JSON.stringify(STORAGE_DEFAULTS[STORAGE_KEYS.PROGRESS])
    );

    // Inject null into settings
    mockStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(null));
    const settingsResult = getStorageItem(STORAGE_KEYS.SETTINGS);
    assert.deepStrictEqual(
      settingsResult,
      STORAGE_DEFAULTS[STORAGE_KEYS.SETTINGS]
    );
  });

  it("safeParseJson handles null, undefined, empty, and broken strings", () => {
    const fallback = { safe: true };
    assert.deepStrictEqual(safeParseJson(null, fallback), fallback);
    assert.deepStrictEqual(safeParseJson("", fallback), fallback);
    assert.deepStrictEqual(safeParseJson("{broken json", fallback), fallback);
    assert.deepStrictEqual(safeParseJson('{"safe":false}', fallback), {
      safe: false,
    });
  });

  it("removes items and clears only PromptForge prefixed keys", () => {
    setStorageItem(STORAGE_KEYS.SETTINGS, {
      theme: "forge-dark",
      enableSound: false,
    });
    mockStorage.setItem("unrelated_app_key", "must_preserve");

    assert.strictEqual(
      getStorageItem(STORAGE_KEYS.SETTINGS).enableSound,
      false
    );

    removeStorageItem(STORAGE_KEYS.SETTINGS);
    assert.strictEqual(getStorageItem(STORAGE_KEYS.SETTINGS).enableSound, true);

    // Test clearPromptForgeStorage
    setStorageItem(STORAGE_KEYS.HISTORY, [
      { id: "1", timestamp: 1, prompt: "hi", model: "m" },
    ]);
    clearPromptForgeStorage();

    assert.strictEqual(getStorageItem(STORAGE_KEYS.HISTORY).length, 0);
    assert.strictEqual(
      mockStorage.getItem("unrelated_app_key"),
      "must_preserve"
    );
  });
});
