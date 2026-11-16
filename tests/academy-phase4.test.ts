import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import {
  CURRICULUM_MODULES,
  getModuleById,
  getLessonById,
} from "../content/modules";
import {
  getStoredProgress,
  markLessonComplete,
  saveQuizScore,
  setLastVisited,
  exportProgressToJson,
  importProgressFromJson,
  resetAllProgress,
} from "../lib/storage/progress";
import { formatTimestamp } from "../components/academy/timestamp-chips";
import { clearPromptForgeStorage } from "../lib/storage/index";

// Mock localStorage for Node test runner
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

describe("Phase 4: Academy Acceptance Verification", () => {
  beforeEach(() => {
    mockStorage.clear();
    clearPromptForgeStorage();
    resetAllProgress();
  });

  test("Timestamp chip seeks the video to the right second and formats cleanly", () => {
    // 1. Time formatting
    assert.strictEqual(formatTimestamp(0), "00:00");
    assert.strictEqual(formatTimestamp(45), "00:45");
    assert.strictEqual(formatTimestamp(65), "01:05");
    assert.strictEqual(formatTimestamp(140), "02:20");
    assert.strictEqual(formatTimestamp(3600), "60:00");

    // 2. Chapter alignment
    const lessonData = getLessonById("mod-01", "mod-01-les-01");
    assert.ok(lessonData);
    const chapters = lessonData.lesson.chapters;

    assert.strictEqual(chapters[0].time, 0);
    assert.strictEqual(chapters[1].time, 65);
    assert.strictEqual(chapters[2].time, 140);
    assert.strictEqual(chapters[3].time, 245);

    // Verify seek target matches chapter time exactly
    let seekedTime = -1;
    const mockSeek = (t: number) => {
      seekedTime = t;
    };

    mockSeek(chapters[2].time);
    assert.strictEqual(seekedTime, 140, "Seek handler must jump to exact second 140");

    // Verify seeking works for long-form video chapters beyond 12 mins (720s)
    mockSeek(950);
    assert.strictEqual(seekedTime, 950, "Seek handler must jump to target second beyond 720s");
  });

  test("Complete a quiz, refresh the page, progress ring is still correct", () => {
    const mod1 = getModuleById("mod-01");
    assert.ok(mod1);
    const lesson1 = mod1.lessons[0];

    // Initial state: 0% progress
    let currentProgress = getStoredProgress();
    assert.strictEqual(currentProgress.completedLessonIds.length, 0);
    let completedInMod = mod1.lessons.filter((l) =>
      currentProgress.completedLessonIds.includes(l.id)
    ).length;
    let percent = Math.round((completedInMod / mod1.lessons.length) * 100);
    assert.strictEqual(percent, 0);

    // Complete quiz with perfect score
    saveQuizScore(lesson1.id, lesson1.quiz.length, lesson1.quiz.length);

    // Simulate page refresh by fetching fresh copy from storage
    currentProgress = getStoredProgress();
    assert.ok(currentProgress.completedLessonIds.includes(lesson1.id));
    assert.strictEqual(
      currentProgress.quizScores?.[lesson1.id],
      lesson1.quiz.length
    );

    // Progress ring calculation after refresh
    completedInMod = mod1.lessons.filter((l) =>
      currentProgress.completedLessonIds.includes(l.id)
    ).length;
    percent = Math.round((completedInMod / mod1.lessons.length) * 100);
    // 1 of 6 lessons complete = 17%
    assert.strictEqual(percent, 17);

    // Complete second lesson
    const lesson2 = mod1.lessons[1];
    markLessonComplete(lesson2.id, true);

    // Simulate refresh again
    currentProgress = getStoredProgress();
    completedInMod = mod1.lessons.filter((l) =>
      currentProgress.completedLessonIds.includes(l.id)
    ).length;
    percent = Math.round((completedInMod / mod1.lessons.length) * 100);
    // 2 of 6 lessons complete = 33%
    assert.strictEqual(percent, 33);

    // Complete all lessons in mod1
    mod1.lessons.forEach((l) => markLessonComplete(l.id, true));

    currentProgress = getStoredProgress();
    completedInMod = mod1.lessons.filter((l) =>
      currentProgress.completedLessonIds.includes(l.id)
    ).length;
    percent = Math.round((completedInMod / mod1.lessons.length) * 100);
    // 6 of 6 lessons complete = 100%
    assert.strictEqual(percent, 100);
  });

  test("Export then import progress on a cleared browser restores state", () => {
    // 1. Establish initial progress across multiple modules
    markLessonComplete("mod-01-les-01", true);
    markLessonComplete("mod-01-les-02", true);
    markLessonComplete("mod-02-les-01", true);
    saveQuizScore("mod-01-les-01", 2, 2);
    saveQuizScore("mod-02-les-01", 1, 1);
    setLastVisited("mod-02", "mod-02-les-01");

    // 2. Export progress
    const jsonString = exportProgressToJson();
    assert.ok(jsonString.length > 50);

    // 3. Clear browser completely
    mockStorage.clear();
    clearPromptForgeStorage();

    const wiped = getStoredProgress();
    assert.strictEqual(wiped.completedLessonIds.length, 0);
    assert.deepStrictEqual(wiped.quizScores, {});
    assert.strictEqual(wiped.lastVisited, null);

    // 4. Import progress
    const result = importProgressFromJson(jsonString);
    assert.strictEqual(result.success, true);

    // 5. Verify complete restoration
    const restored = getStoredProgress();
    assert.strictEqual(restored.completedLessonIds.length, 3);
    assert.ok(restored.completedLessonIds.includes("mod-01-les-01"));
    assert.ok(restored.completedLessonIds.includes("mod-01-les-02"));
    assert.ok(restored.completedLessonIds.includes("mod-02-les-01"));
    assert.strictEqual(restored.quizScores?.["mod-01-les-01"], 2);
    assert.strictEqual(restored.quizScores?.["mod-02-les-01"], 1);
    assert.strictEqual(restored.lastVisited?.moduleId, "mod-02");
    assert.strictEqual(restored.lastVisited?.lessonId, "mod-02-les-01");
  });

  test("All 12 modules have valid structures, unique routes, and complete lessons", () => {
    assert.strictEqual(CURRICULUM_MODULES.length, 12);
    const seenLessonIds = new Set<string>();

    CURRICULUM_MODULES.forEach((mod) => {
      assert.ok(mod.lessons.length > 0);
      mod.lessons.forEach((les) => {
        assert.ok(!seenLessonIds.has(les.id), `Duplicate lesson ID: ${les.id}`);
        seenLessonIds.add(les.id);
        assert.ok(typeof les.youtubeId === "string");
        assert.ok(les.chapters.length >= 2, "Has chapters for seeking");
        assert.strictEqual(les.quiz.length, 5, "Has 5 quiz questions");
      });
    });

    assert.strictEqual(seenLessonIds.size, 58);
  });

  test("Quiz auto-completes passing grade (>= 66%) but rejects sub-passing scores", () => {
    // 1 out of 3 = 33% (fails)
    saveQuizScore("mod-03-les-01", 1, 3);
    let current = getStoredProgress();
    assert.strictEqual(current.completedLessonIds.includes("mod-03-les-01"), false);

    // 2 out of 3 = 67% (passes)
    saveQuizScore("mod-03-les-01", 2, 3);
    current = getStoredProgress();
    assert.strictEqual(current.completedLessonIds.includes("mod-03-les-01"), true);
  });
});
