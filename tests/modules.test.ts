import { test, describe } from "node:test";
import assert from "node:assert";
import {
  CURRICULUM_MODULES,
  getModuleById,
  getLessonById,
  getAllLessons,
} from "../content/modules";

describe("PromptForge Phase 4: Module & Lesson Curriculum Data", () => {
  test("Curriculum defines exactly 12 comprehensive modules", () => {
    assert.strictEqual(CURRICULUM_MODULES.length, 12);
    CURRICULUM_MODULES.forEach((mod, idx) => {
      assert.strictEqual(mod.number, idx + 1);
      assert.ok(mod.id.startsWith("mod-"));
      assert.ok(mod.title.length > 0);
      assert.ok(mod.summary.length > 0);
      assert.ok(mod.outcome.length > 0);
      assert.ok(mod.lessons.length > 0, `Module ${mod.id} must have lessons`);
      assert.strictEqual(mod.lessonCount, mod.lessons.length);
    });
  });

  test("Every lesson satisfies required curriculum schema with valid video or slot", () => {
    let totalLessonsCount = 0;

    CURRICULUM_MODULES.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        totalLessonsCount++;
        assert.ok(lesson.id.length > 0, "Lesson must have an id");
        assert.ok(lesson.title.length > 0, "Lesson must have a title");
        assert.ok(typeof lesson.youtubeId === "string");
        if (lesson.status) {
          assert.ok(["ok", "slot", "unavailable"].includes(lesson.status));
        }

        // Chapters
        assert.ok(
          lesson.chapters.length >= 2,
          `Lesson ${lesson.id} must have at least 2 chapters`
        );
        lesson.chapters.forEach((chap, cIdx) => {
          assert.ok(typeof chap.time === "number" && chap.time >= 0);
          assert.ok(chap.label.length > 0);
          if (cIdx > 0) {
            assert.ok(
              chap.time >= lesson.chapters[cIdx - 1].time,
              `Chapters in ${lesson.id} must be in ascending time order`
            );
          }
        });

        // Summary & Key Concepts
        assert.ok(lesson.summary.length > 20, "Lesson summary must be descriptive");
        assert.ok(lesson.keyConcepts.length >= 2, "Must have at least 2 key concepts");

        // Practice Challenge
        assert.ok(lesson.practiceChallenge.title.length > 0);
        assert.ok(lesson.practiceChallenge.objective.length > 0);
        assert.ok(lesson.practiceChallenge.instructions.length > 0);
        assert.ok(lesson.practiceChallenge.starterPrompt.length > 0);

        // Quiz
        assert.strictEqual(lesson.quiz.length, 5, `Lesson ${lesson.id} must have 5 quiz questions`);
        lesson.quiz.forEach((q, qIdx) => {
          assert.ok(q.question.length > 0, `Question ${qIdx} in ${lesson.id} must have text`);
          assert.ok(q.options.length >= 2, "Quiz questions must have at least 2 options");
          assert.ok(
            q.answerIndex >= 0 && q.answerIndex < q.options.length,
            `Question ${qIdx} answerIndex must point to a valid option`
          );
          assert.ok(q.explanation.length > 0, "Must have explanation for answer");
        });

        // Related Lab
        assert.ok(lesson.relatedLab.length > 0, "Must specify a related lab");
      });
    });

    assert.strictEqual(totalLessonsCount, 58, `Expected 58 total lessons, got ${totalLessonsCount}`);
  });

  test("Helper functions retrieve modules and lessons accurately", () => {
    const mod1 = getModuleById("mod-01");
    assert.ok(mod1);
    assert.strictEqual(mod1?.title, "Introduction to Prompt Engineering");

    const modBySlug = getModuleById("example-and-instruction-based-prompts");
    assert.ok(modBySlug);
    assert.strictEqual(modBySlug?.id, "mod-02");

    const lessonData = getLessonById("mod-01", "mod-01-les-01");
    assert.ok(lessonData);
    assert.strictEqual(lessonData?.lesson.id, "mod-01-les-01");
    assert.strictEqual(lessonData?.lessonIndex, 0);
    assert.ok(lessonData?.nextLesson);
    assert.strictEqual(lessonData?.nextLesson?.lessonId, "mod-01-les-02");
    assert.strictEqual(lessonData?.prevLesson, undefined);

    const all = getAllLessons();
    assert.strictEqual(all.length, 58);
  });
});
