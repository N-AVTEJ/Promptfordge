import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { CURRICULUM_MODULES } from "../content/modules";

const EXPECTED_TITLES = [
  "Introduction to Prompt Engineering",
  "Example and Instruction Based Prompts",
  "Context Based and Interaction Based Prompts",
  "Advanced Prompt Techniques",
  "Prompt Optimization Techniques",
  "Multi-Model Prompting",
  "Tool-Augmented Prompting",
  "Security in Prompt Engineering",
  "Domain-Specific Prompt Engineering",
  "Advanced Prompt Engineering",
  "AI Agents, Context Engineering and MCP",
  "Production Prompt Engineering and Responsible AI",
];

const FORBIDDEN_NUMBER_PATTERNS = [
  /\b12\s+modules\b/i,
  /\b10\s+modules\b/i,
  /\b12-module\b/i,
  /\b10-module\b/i,
];

describe("Step 1 Acceptance: Single Source of Truth & No Hardcoded Titles", () => {
  it("CURRICULUM_MODULES defines exactly 12 modules with exact syllabus titles", () => {
    assert.strictEqual(CURRICULUM_MODULES.length, 12);
    CURRICULUM_MODULES.forEach((mod, idx) => {
      assert.strictEqual(mod.number, idx + 1);
      assert.strictEqual(mod.title, EXPECTED_TITLES[idx]);
    });
  });

  it("every module contains required single-source-of-truth fields: id, number, title, summary, topics, lessons, labs, videos, quiz", () => {
    CURRICULUM_MODULES.forEach((mod) => {
      assert.ok(typeof mod.id === "string" && mod.id.length > 0, `Module ${mod.number} missing id`);
      assert.strictEqual(typeof mod.number, "number", `Module ${mod.id} missing number`);
      assert.ok(typeof mod.title === "string" && mod.title.length > 0, `Module ${mod.number} missing title`);
      assert.ok(typeof mod.summary === "string" && mod.summary.length > 0, `Module ${mod.number} missing summary`);
      
      // topics[]
      assert.ok(Array.isArray(mod.topics), `Module ${mod.number} topics must be an array`);
      assert.ok(mod.topics.length >= 2, `Module ${mod.number} must define at least 2 topics`);
      mod.topics.forEach((t) => assert.strictEqual(typeof t, "string"));

      // lessons[]
      assert.ok(Array.isArray(mod.lessons), `Module ${mod.number} lessons must be an array`);
      assert.ok(mod.lessons.length > 0, `Module ${mod.number} must contain lessons`);

      // labs[]
      assert.ok(Array.isArray(mod.labs), `Module ${mod.number} labs must be an array`);
      assert.ok(mod.labs.length >= 1, `Module ${mod.number} must have at least one lab`);
      mod.labs.forEach((lab) => {
        assert.ok(typeof lab.id === "string" && lab.id.length > 0, `Lab in module ${mod.number} missing id`);
        assert.ok(typeof lab.route === "string" && lab.route.startsWith("/"), `Lab ${lab.id} route must start with /`);
        assert.ok(typeof lab.title === "string" && lab.title.length > 0, `Lab ${lab.id} missing title`);
        assert.ok(["full", "lite"].includes(lab.status), `Lab ${lab.id} status must be 'full' or 'lite'`);
        assert.ok(lab.loadsTask, `Lab ${lab.id} must define loadsTask`);
      });

      // videos
      assert.ok(Array.isArray(mod.videos), `Module ${mod.number} videos must be an array`);
      assert.ok(mod.videos.length >= 1, `Module ${mod.number} must have at least 1 video`);

      // quiz
      assert.ok(Array.isArray(mod.quiz), `Module ${mod.number} quiz must be an array`);
      assert.strictEqual(mod.quiz.length, 5, `Module ${mod.number} must have 5 quiz questions`);
    });
  });

  it("fails if any component or app page contains a hardcoded module title or number-of-modules literal", () => {
    const violations: { file: string; match: string; line: number }[] = [];

    function checkDirectory(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!["node_modules", ".next", ".git"].includes(entry.name)) {
            checkDirectory(fullPath);
          }
        } else if (/\.(tsx|jsx|ts|js)$/.test(entry.name)) {
          // Ignore test files and content data files
          if (
            fullPath.includes(path.sep + "tests" + path.sep) ||
            fullPath.includes(path.sep + "content" + path.sep) ||
            fullPath.includes(path.sep + "scripts" + path.sep)
          ) {
            continue;
          }

          const content = fs.readFileSync(fullPath, "utf-8");
          const strippedContent = content.replace(/\/\*[\s\S]*?\*\//g, "");
          const lines = strippedContent.split("\n");

          lines.forEach((lineText, idx) => {
            // Strip single-line comments
            const cleanLine = lineText.replace(/\/\/.*$/, "");

            // Check hardcoded titles (any appearance of the exact module title in code/markup)
            for (const title of EXPECTED_TITLES) {
              if (cleanLine.includes(title)) {
                violations.push({
                  file: fullPath,
                  match: `Title "${title}"`,
                  line: idx + 1,
                });
              }
            }

            // Check forbidden number patterns
            for (const pat of FORBIDDEN_NUMBER_PATTERNS) {
              if (pat.test(cleanLine)) {
                violations.push({
                  file: fullPath,
                  match: `Literal pattern: ${cleanLine.trim()}`,
                  line: idx + 1,
                });
              }
            }
          });
        }
      }
    }

    ["app", "components", "lib"].forEach((targetDir) => {
      const resolved = path.resolve(process.cwd(), targetDir);
      if (fs.existsSync(resolved)) {
        checkDirectory(resolved);
      }
    });

    assert.strictEqual(
      violations.length,
      0,
      `Found hardcoded module titles or literals:\n${violations.map((v) => `${v.file}:${v.line} -> ${v.match}`).join("\n")}`
    );
  });
});
