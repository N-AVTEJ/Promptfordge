import { test, describe } from "node:test";
import assert from "node:assert";
import { CURRICULUM_MODULES } from "../content/modules";
import { durations } from "../lib/motion/index";

describe("Phase 2: Landing Page Data & Motion Verification", () => {
  test("Curriculum defines exactly 10 comprehensive modules", () => {
    assert.strictEqual(CURRICULUM_MODULES.length, 10);
    CURRICULUM_MODULES.forEach((mod, idx) => {
      assert.strictEqual(mod.number, idx + 1, `Module at index ${idx} must have number ${idx + 1}`);
      assert.ok(mod.id.length > 0, "Module must have an id");
      assert.ok(mod.title.length > 0, "Module must have a title");
      assert.ok(mod.subtitle.length > 0, "Module must have a subtitle");
      assert.ok(mod.description.length > 0, "Module must have a description");
      assert.ok(mod.lessonCount > 0, "Module must have at least 1 lesson");
      assert.ok(mod.tags.length > 0, "Module must have tags");
      assert.ok(mod.youtubeVideoId.length > 0, "Module must have a YouTube video ID");
      assert.ok(mod.keyTakeaway.length > 0, "Module must have a key takeaway");
    });
  });

  test("No animation duration exceeds the 1.2s rule", () => {
    Object.entries(durations).forEach(([key, val]) => {
      assert.ok(
        val <= 1.2,
        `Duration "${key}" (${val}s) must not exceed 1.2s per Phase 2 motion constraint`
      );
    });
  });

  test("Curriculum slugs are URL-friendly and unique", () => {
    const slugs = new Set<string>();
    CURRICULUM_MODULES.forEach((mod) => {
      assert.match(mod.slug, /^[a-z0-9-]+$/, `Slug "${mod.slug}" must be URL friendly`);
      assert.ok(!slugs.has(mod.slug), `Duplicate slug detected: ${mod.slug}`);
      slugs.add(mod.slug);
    });
  });
});
