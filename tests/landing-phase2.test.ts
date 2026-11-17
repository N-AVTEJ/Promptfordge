import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { CURRICULUM_MODULES } from "../content/modules";
import { durations } from "../lib/motion/index";
import {
  curriculumStats,
  HERO_SENTENCE,
  HERO_SEGMENTS,
  STORY_STAGES,
  DESKTOP_TOKENS,
  MOBILE_TOKENS,
  SIMULATION_BADGE,
  OUTPUT_TOKENS,
  TECHNIQUE_ROWS,
} from "../content/landing";
import videoReport from "../content/video-report.json";

describe("Phase 2: Landing Page Data & Motion Verification", () => {
  test("Curriculum defines exactly 12 comprehensive modules", () => {
    assert.strictEqual(CURRICULUM_MODULES.length, 12);
    CURRICULUM_MODULES.forEach((mod, idx) => {
      assert.strictEqual(
        mod.number,
        idx + 1,
        `Module at index ${idx} must have number ${idx + 1}`
      );
      assert.ok(mod.id.length > 0, "Module must have an id");
      assert.ok(mod.title.length > 0, "Module must have a title");
      assert.ok(mod.subtitle.length > 0, "Module must have a subtitle");
      assert.ok(mod.description.length > 0, "Module must have a description");
      assert.ok(mod.lessonCount > 0, "Module must have at least 1 lesson");
      assert.ok(mod.tags.length > 0, "Module must have tags");
      assert.ok(
        mod.youtubeVideoId.length > 0,
        "Module must have a YouTube video ID"
      );
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
      assert.match(
        mod.slug,
        /^[a-z0-9-]+$/,
        `Slug "${mod.slug}" must be URL friendly`
      );
      assert.ok(!slugs.has(mod.slug), `Duplicate slug detected: ${mod.slug}`);
      slugs.add(mod.slug);
    });
  });

  test("Landing derived metrics match authoritative content sources", () => {
    assert.strictEqual(curriculumStats.totalModules, CURRICULUM_MODULES.length);
    assert.strictEqual(curriculumStats.totalVideos, videoReport.totalOk);
    assert.strictEqual(curriculumStats.totalModules, 12);
    assert.strictEqual(curriculumStats.totalVideos, 59);
    assert.ok(curriculumStats.totalLessons >= 50);
    assert.ok(curriculumStats.totalWatchMinutes > 0);
  });

  test("Hero sentence decomposes into all 4 highlighter categories", () => {
    assert.strictEqual(
      HERO_SENTENCE,
      "Act as a Python teacher. Explain loops to a beginner. Give two examples. Keep it under 100 words."
    );
    assert.strictEqual(HERO_SEGMENTS.length, 4);

    const categories = HERO_SEGMENTS.map((s) => s.category);
    assert.deepStrictEqual(categories, ["role", "task", "context", "constraint"]);

    const joinedText = HERO_SEGMENTS.map((s) => s.text).join(" ");
    assert.strictEqual(joinedText, HERO_SENTENCE);
  });

  test("Pinned story defines exactly five sequential stages", () => {
    assert.strictEqual(STORY_STAGES.length, 5);
    STORY_STAGES.forEach((stage, idx) => {
      assert.strictEqual(stage.stage, idx + 1);
      assert.ok(stage.caption.length > 0);
      assert.ok(stage.description.length > 0);
      assert.strictEqual(stage.rangeDesktop.length, 2);
      assert.strictEqual(stage.rangeMobile.length, 2);
    });

    assert.strictEqual(STORY_STAGES[0].caption, "You write the prompt.");
    assert.strictEqual(STORY_STAGES[1].caption, "The model cuts it into tokens.");
    assert.strictEqual(
      STORY_STAGES[2].caption,
      "Each token becomes a point that carries meaning."
    );
    assert.strictEqual(
      STORY_STAGES[3].caption,
      "Attention decides which words matter to each other."
    );
    assert.strictEqual(
      STORY_STAGES[4].caption,
      "It writes the answer one token at a time."
    );
  });

  test("Story token counts meet layout specifications (12 desktop, 8 mobile)", () => {
    assert.strictEqual(DESKTOP_TOKENS.length, 12);
    assert.strictEqual(MOBILE_TOKENS.length, 8);

    DESKTOP_TOKENS.forEach((tok) => {
      assert.ok(typeof tok.id === "number" && tok.id > 0);
      assert.ok(tok.text.length > 0);
      assert.ok(tok.scatterDesktop.x >= 0 && tok.scatterDesktop.x <= 100);
      assert.ok(tok.scatterDesktop.y >= 0 && tok.scatterDesktop.y <= 100);
      assert.ok(tok.attentionWeight >= 0 && tok.attentionWeight <= 1.0);
    });

    MOBILE_TOKENS.forEach((tok) => {
      assert.ok(typeof tok.id === "number" && tok.id > 0);
      assert.ok(tok.text.length > 0);
      assert.ok(tok.scatterMobile.x >= 0 && tok.scatterMobile.x <= 100);
      assert.ok(tok.scatterMobile.y >= 0 && tok.scatterMobile.y <= 100);
    });

    // Central node is 'loops'
    const loopsToken = DESKTOP_TOKENS.find((t) => t.text === "loops");
    assert.ok(loopsToken, "Token 'loops' must exist as target node");

    // Strongest attention line is 'Python'
    const pythonToken = DESKTOP_TOKENS.find((t) => t.text === "Python");
    assert.ok(pythonToken?.isStrongestAttention, "Python must be strongest attention");
    assert.ok(
      (pythonToken?.attentionWeight || 0) >= 0.9,
      "Python attention weight must be >= 0.9"
    );
  });

  test("Persistent simulation disclaimer badge is exact contract text", () => {
    assert.strictEqual(
      SIMULATION_BADGE,
      "Educational simulation. Token IDs and weights are illustrative."
    );
  });

  test("Output tokens are deterministic and non-empty", () => {
    assert.ok(OUTPUT_TOKENS.length >= 8);
    OUTPUT_TOKENS.forEach((tok) => {
      assert.ok(typeof tok === "string" && tok.length > 0);
    });
  });

  test("Technique rows define exactly six flat comparisons with token counts", () => {
    assert.strictEqual(TECHNIQUE_ROWS.length, 6);
    const expectedIds = [
      "zero-shot",
      "one-shot",
      "few-shot",
      "role",
      "constraint",
      "structured",
    ];
    assert.deepStrictEqual(
      TECHNIQUE_ROWS.map((r) => r.id),
      expectedIds
    );

    TECHNIQUE_ROWS.forEach((row) => {
      assert.ok(row.name.length > 0);
      assert.ok(row.explanation.length > 0);
      assert.ok(row.tokensUsed > 0);
      assert.ok(row.samplePrompt.length > 0);
    });
  });

  test("Landing components follow anti-slop rules strictly", () => {
    const landingDir = path.resolve(process.cwd(), "components/landing");
    const landingFiles = fs
      .readdirSync(landingDir)
      .filter((f) => f.endsWith(".tsx"));

    // Check only our Phase 2 components
    const phase2Files = [
      "Nav.tsx",
      "Hero.tsx",
      "TokenStory.tsx",
      "TechniqueRows.tsx",
      "Syllabus.tsx",
      "LessonPreview.tsx",
      "Closing.tsx",
      "Footer.tsx",
    ];

    phase2Files.forEach((fileName) => {
      const filePath = path.join(landingDir, fileName);
      assert.ok(fs.existsSync(filePath), `File ${fileName} must exist`);
      const content = fs.readFileSync(filePath, "utf-8");

      // No black or #000 in components
      assert.ok(
        !content.includes("#000"),
        `${fileName} must not contain #000 hex color`
      );
      assert.ok(
        !content.includes("text-black"),
        `${fileName} must not use text-black`
      );
      assert.ok(
        !content.includes("bg-black"),
        `${fileName} must not use bg-black`
      );

      // No all-caps tracking labels (uppercase tracking)
      assert.ok(
        !content.includes("uppercase tracking"),
        `${fileName} must not use all-caps tracked labels`
      );

      // No arrow character in buttons
      assert.ok(
        !content.includes("→"),
        `${fileName} must not contain '→' character`
      );
      assert.ok(
        !content.includes("&rarr;"),
        `${fileName} must not contain '&rarr;' entity`
      );
    });
  });
});
