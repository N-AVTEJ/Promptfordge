import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import {
  getStoredProgress,
  markLessonComplete,
  saveQuizScore,
  setLastVisited,
  getLastVisited,
  exportProgressToJson,
  importProgressFromJson,
  resetAllProgress,
} from "../lib/storage/progress";
import { clearPromptForgeStorage } from "../lib/storage/index";

// Mock minimal window.localStorage for node environment if not yet attached
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
(global as unknown as { window: { localStorage: MockLocalStorage } }).window = {
  localStorage: mockStorage,
};

describe("PromptForge Progress Store & JSON Export/Import", () => {
  beforeEach(() => {
    mockStorage.clear();
    clearPromptForgeStorage();
  });

  it("initializes with clean default state", () => {
    const progress = getStoredProgress();
    assert.deepStrictEqual(progress.completedLessonIds, []);
    assert.deepStrictEqual(progress.quizScores, {});
    assert.strictEqual(progress.lastVisited, null);
  });

  it("marks lessons as complete and toggles them off", () => {
    markLessonComplete("mod-01-les-01", true);
    let progress = getStoredProgress();
    assert.ok(progress.completedLessonIds.includes("mod-01-les-01"));

    markLessonComplete("mod-01-les-02", true);
    progress = getStoredProgress();
    assert.strictEqual(progress.completedLessonIds.length, 2);

    // Toggle off
    markLessonComplete("mod-01-les-01", false);
    progress = getStoredProgress();
    assert.strictEqual(progress.completedLessonIds.length, 1);
    assert.ok(!progress.completedLessonIds.includes("mod-01-les-01"));
    assert.ok(progress.completedLessonIds.includes("mod-01-les-02"));
  });

  it("records quiz scores, preserves best score, and auto-completes passing quizzes", () => {
    // Score 1 out of 3 (not passing)
    saveQuizScore("mod-01-les-01", 1, 3);
    let progress = getStoredProgress();
    assert.strictEqual(progress.quizScores?.["mod-01-les-01"], 1);
    assert.strictEqual(progress.quizTotalQuestions?.["mod-01-les-01"], 3);
    assert.ok(!progress.completedLessonIds.includes("mod-01-les-01"));

    // Retake with score 3 out of 3 (100% passing)
    saveQuizScore("mod-01-les-01", 3, 3);
    progress = getStoredProgress();
    assert.strictEqual(progress.quizScores?.["mod-01-les-01"], 3);
    // Should have auto-marked completed
    assert.ok(progress.completedLessonIds.includes("mod-01-les-01"));

    // Retake with lower score 2 out of 3: best score should remain 3
    saveQuizScore("mod-01-les-01", 2, 3);
    progress = getStoredProgress();
    assert.strictEqual(progress.quizScores?.["mod-01-les-01"], 3);

    // New lesson: 2 out of 3 (67%) is a passing grade (>= 66%)
    saveQuizScore("mod-01-les-02", 2, 3);
    progress = getStoredProgress();
    assert.ok(progress.completedLessonIds.includes("mod-01-les-02"), "2/3 should pass and complete lesson");
  });

  it("records and retrieves last visited lesson", () => {
    assert.strictEqual(getLastVisited(), null);

    setLastVisited("mod-02", "mod-02-les-03");
    const last = getLastVisited();
    assert.ok(last !== null);
    assert.strictEqual(last?.moduleId, "mod-02");
    assert.strictEqual(last?.lessonId, "mod-02-les-03");
    assert.ok(typeof last?.timestamp === "number");
  });

  it("exports progress to JSON string and restores state on cleared browser", () => {
    // 1. Populate initial state
    markLessonComplete("mod-01-les-01", true);
    markLessonComplete("mod-01-les-02", true);
    saveQuizScore("mod-01-les-01", 3, 3);
    setLastVisited("mod-01", "mod-01-les-02");

    // 2. Export to JSON
    const exportedJson = exportProgressToJson();
    assert.ok(typeof exportedJson === "string");
    const parsed = JSON.parse(exportedJson);
    assert.strictEqual(parsed.app, "promptforge");
    assert.strictEqual(parsed.version, 1);
    assert.strictEqual(parsed.data.completedLessonIds.length, 2);

    // 3. Clear the browser storage completely (acceptance test requirement)
    mockStorage.clear();
    clearPromptForgeStorage();

    const emptyProgress = getStoredProgress();
    assert.strictEqual(emptyProgress.completedLessonIds.length, 0);
    assert.strictEqual(emptyProgress.lastVisited, null);

    // 4. Import the exported JSON
    const importResult = importProgressFromJson(exportedJson);
    assert.strictEqual(importResult.success, true);
    assert.ok(importResult.progress);

    // 5. Verify restored state matches initial state
    const restored = getStoredProgress();
    assert.strictEqual(restored.completedLessonIds.length, 2);
    assert.ok(restored.completedLessonIds.includes("mod-01-les-01"));
    assert.ok(restored.completedLessonIds.includes("mod-01-les-02"));
    assert.strictEqual(restored.quizScores?.["mod-01-les-01"], 3);
    assert.strictEqual(restored.lastVisited?.moduleId, "mod-01");
    assert.strictEqual(restored.lastVisited?.lessonId, "mod-01-les-02");
  });

  it("handles corrupted or invalid JSON import safely", () => {
    const broken = importProgressFromJson("not valid json");
    assert.strictEqual(broken.success, false);
    assert.ok(broken.error?.includes("JSON parse error"));

    const empty = importProgressFromJson("");
    assert.strictEqual(empty.success, false);

    const primitive = importProgressFromJson("42");
    assert.strictEqual(primitive.success, false);
  });

  it("deduplicates lesson IDs and coerces string scores on import", () => {
    const messyPayload = JSON.stringify({
      app: "promptforge",
      version: 1,
      data: {
        completedLessonIds: ["mod-01-les-01", "mod-01-les-01", "mod-01-les-02"],
        quizScores: { "mod-01-les-01": "2", "mod-01-les-02": 3 },
        quizTotalQuestions: { "mod-01-les-01": "2", "mod-01-les-02": "3" },
      },
    });

    const result = importProgressFromJson(messyPayload);
    assert.strictEqual(result.success, true);
    const restored = getStoredProgress();
    assert.strictEqual(restored.completedLessonIds.length, 2);
    assert.deepStrictEqual(restored.completedLessonIds, ["mod-01-les-01", "mod-01-les-02"]);
    assert.strictEqual(restored.quizScores?.["mod-01-les-01"], 2);
    assert.strictEqual(restored.quizTotalQuestions?.["mod-01-les-01"], 2);
  });

  it("resets all progress cleanly", () => {
    markLessonComplete("mod-03-les-01", true);
    saveQuizScore("mod-03-les-01", 2, 2);
    setLastVisited("mod-03", "mod-03-les-01");

    resetAllProgress();

    const current = getStoredProgress();
    assert.strictEqual(current.completedLessonIds.length, 0);
    assert.deepStrictEqual(current.quizScores, {});
    assert.strictEqual(current.lastVisited, null);
  });
});
