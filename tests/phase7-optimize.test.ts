/**
 * Phase 7 Acceptance Verification Tests: Prompt Optimization & Tracking (Module 5)
 *
 * Acceptance Criteria Verified:
 * 1. A deliberately vague prompt ("write about dogs") produces at least three specific diagnoses.
 * 2. Restoring an old version creates a new version rather than deleting history.
 * 3. Diff view correct for added, removed, and changed lines.
 * 4. POST /api/optimize pipeline: diagnosis, candidate generation, execution, and independent metric evaluation.
 * 5. Invariant: Never show one combined accuracy score; show each metric independently.
 * 6. Storage: typed localStorage operations, versioning, non-destructive restore, import & export.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import {
  computeLineDiff,
  splitLines,
  DiffLine,
  DiffResult,
} from "../lib/engine/diff";
import {
  analyzeWeakPrompt,
  generatePromptImprovements,
  simulateOptimizedRun,
  PromptAnalysis,
} from "../lib/engine/optimize";
import {
  getSavedPrompts,
  getSavedPromptById,
  savePrompt,
  restorePromptVersion,
  deleteSavedPrompt,
  exportLibraryJson,
  importLibraryJson,
} from "../lib/storage/library";
import {
  STORAGE_KEYS,
  clearPromptForgeStorage,
  getStorageItem,
  setStorageItem,
} from "../lib/storage/index";
import { POST as optimizeHandler } from "../app/api/optimize/route";
import { engineCache } from "../lib/engine/cache";
import {
  resetGuardState,
  setTestRateLimit,
} from "../lib/engine/guard";

// Mock localStorage for node test runner
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

describe("Phase 7: Prompt Optimization & Version Tracking Acceptance Tests", () => {
  beforeEach(() => {
    mockStorage.clear();
    clearPromptForgeStorage();
    engineCache.clear();
    resetGuardState();
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 1: Deliberately vague prompt produces >= 3 specific diagnoses
  // -------------------------------------------------------------------------
  describe("Acceptance 1: Deliberately vague prompt produces >= 3 diagnoses", () => {
    it('produces at least three specific diagnoses for "write about dogs"', () => {
      const vaguePrompt = "write about dogs";
      const analysis: PromptAnalysis = analyzeWeakPrompt(vaguePrompt);

      // Core acceptance threshold: >= 3 specific diagnoses
      assert.ok(
        analysis.diagnoses.length >= 3,
        `Expected at least 3 diagnoses, got ${analysis.diagnoses.length}`
      );

      // Verify specific diagnoses identified
      const categories = analysis.diagnoses.map((d) => d.category);

      // Must detect vague verb "write"
      assert.ok(
        categories.includes("vague_verbs"),
        'Should identify "vague_verbs" for directive "write"'
      );

      // Must detect missing context & target audience
      assert.ok(
        categories.includes("missing_context"),
        'Should identify "missing_context" for missing audience and domain scope'
      );

      // Must detect absence of constraints
      assert.ok(
        categories.includes("no_constraints"),
        'Should identify "no_constraints" for missing boundaries'
      );

      // Must detect missing format
      assert.ok(
        categories.includes("no_format"),
        'Should identify "no_format" for lack of schema'
      );

      // Verify all diagnoses contain actionable explanations and suggestions
      for (const diag of analysis.diagnoses) {
        assert.ok(diag.title.length > 0, "Diagnosis title must not be empty");
        assert.ok(diag.description.length > 10, "Diagnosis description must be substantive");
        assert.ok(diag.suggestion.length > 10, "Diagnosis suggestion must be actionable");
        assert.ok(["critical", "warning", "info"].includes(diag.severity));
      }

      // Quality score must reflect weak prompt
      assert.ok(analysis.score < 50, `Vague prompt score should be low (< 50), got ${analysis.score}`);
      assert.strictEqual(analysis.qualityTier, "weak");
    });

    it("evaluates other ambiguous prompts with multiple specific diagnoses", () => {
      const prompts = [
        "explain recursion",
        "make an email to sell stuff",
        "give me code for auth",
      ];

      for (const p of prompts) {
        const result = analyzeWeakPrompt(p);
        assert.ok(
          result.diagnoses.length >= 3,
          `Prompt "${p}" should produce at least 3 diagnoses, got ${result.diagnoses.length}`
        );
      }
    });

    it("gives higher quality scores to well-engineered production prompts", () => {
      const strongPrompt = `You are a Principal Security Architect.
Context: Conducting an external API security audit for a fintech payment platform.
Directives: Itemize the top 3 highest-risk OWASP API vulnerabilities.
Constraints: Do not include introductory filler. Keep response under 200 words.
Output Format: Markdown table with columns | Risk | Impact | Remediation |.`;

      const result = analyzeWeakPrompt(strongPrompt);
      assert.ok(
        result.score >= 70,
        `Strong prompt should receive high score (>= 70), got ${result.score}`
      );
      assert.ok(
        result.diagnoses.length <= 1,
        `Strong prompt should produce at most 1 minor diagnosis, got ${result.diagnoses.length}`
      );
    });

    it("generates up to 3 distinct improved versions with explicit reasons for each change", () => {
      const weak = "write about dogs";
      const analysis = analyzeWeakPrompt(weak);
      const improvements = generatePromptImprovements(weak, analysis.diagnoses);

      assert.strictEqual(improvements.length, 3);

      const strategies = improvements.map((i) => i.strategy);
      assert.deepStrictEqual(strategies, ["structured", "constrained", "format_engineered"]);

      for (const imp of improvements) {
        assert.ok(imp.prompt.length > weak.length);
        assert.ok(imp.changes.length >= 2, "Each version must specify at least 2 concrete changes");

        // Verify pedagogical rationale for each change
        for (const change of imp.changes) {
          assert.ok(change.description.length > 5);
          assert.ok(change.reason.length > 10, "Every change must explain WHY it was made");
        }

        // Verify diff is computed
        assert.ok(imp.diff.lines.length > 0);
        assert.ok(imp.diff.summary.added > 0 || imp.diff.summary.modified > 0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 2: Restoring an old version creates a new version
  // -------------------------------------------------------------------------
  describe("Acceptance 2: Version restore creates new version without deleting history", () => {
    it("restoring an old version creates a new version rather than deleting history", () => {
      // 1. Initial creation (Version 1)
      const prompt = savePrompt({
        title: "Database Indexing Guide",
        content: "Explain database indexes.",
        tags: ["database", "sql"],
        notes: "Initial draft (v1)",
      });

      assert.strictEqual(prompt.versions?.length, 1);
      assert.strictEqual(prompt.versions[0].versionNumber, 1);
      const v1Id = prompt.versions[0].id;

      // 2. Edit content -> creates Version 2
      const updatedV2 = savePrompt({
        id: prompt.id,
        title: "Database Indexing Guide",
        content: "Explain B-Tree and Hash indexes for PostgreSQL with pros and cons.",
        notes: "Added specific index types (v2)",
      });

      assert.strictEqual(updatedV2.versions?.length, 2);
      assert.strictEqual(updatedV2.versions[1].versionNumber, 2);
      const v2Id = updatedV2.versions[1].id;

      // 3. Edit content again -> creates Version 3
      const updatedV3 = savePrompt({
        id: prompt.id,
        title: "Database Indexing Guide",
        content: `You are a Lead Database Architect.
Compare B-Tree, Hash, and GIN indexes in PostgreSQL.
Format: Markdown table with columns | Index Type | Lookup Complexity | Write Overhead |.
Constraint: Under 250 words.`,
        notes: "Production prompt with table and constraints (v3)",
      });

      assert.strictEqual(updatedV3.versions?.length, 3);
      assert.strictEqual(updatedV3.versions[2].versionNumber, 3);

      // Verify history prior to restore
      assert.strictEqual(updatedV3.versions[0].id, v1Id);
      assert.strictEqual(updatedV3.versions[1].id, v2Id);

      // 4. RESTORE Version 1
      // CRITICAL ACCEPTANCE CHECK:
      // "Restoring an old version creates a new version rather than deleting history."
      const restoredPrompt = restorePromptVersion(prompt.id, v1Id);

      // Total versions must now be 4!
      assert.strictEqual(
        restoredPrompt.versions?.length,
        4,
        "Total version count must increment to 4 after restore"
      );

      // All past versions (v1, v2, v3) must still exist unmodified!
      assert.strictEqual(restoredPrompt.versions[0].versionNumber, 1);
      assert.strictEqual(restoredPrompt.versions[0].id, v1Id);
      assert.strictEqual(restoredPrompt.versions[0].content, "Explain database indexes.");

      assert.strictEqual(restoredPrompt.versions[1].versionNumber, 2);
      assert.strictEqual(restoredPrompt.versions[1].id, v2Id);

      assert.strictEqual(restoredPrompt.versions[2].versionNumber, 3);

      // Newest version is v4, which carries v1's content
      const v4 = restoredPrompt.versions[3];
      assert.strictEqual(v4.versionNumber, 4);
      assert.strictEqual(v4.content, "Explain database indexes.");
      assert.ok(v4.notes?.includes("Restored from Version 1"));

      // Active content and active version ID match v4
      assert.strictEqual(restoredPrompt.content, "Explain database indexes.");
      assert.strictEqual(restoredPrompt.currentVersionId, v4.id);

      // Check persistent storage
      const reloaded = getSavedPromptById(prompt.id);
      assert.ok(reloaded);
      assert.strictEqual(reloaded.versions?.length, 4);
    });

    it("throws clear error when restoring non-existent prompt or version", () => {
      assert.throws(
        () => restorePromptVersion("invalid-id", "ver-1"),
        /not found in storage/i
      );

      const p = savePrompt({
        title: "Test",
        content: "content",
      });

      assert.throws(
        () => restorePromptVersion(p.id, "non-existent-ver-id"),
        /not found on prompt/i
      );
    });
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 3: Diff view correct for added, removed, and changed lines
  // -------------------------------------------------------------------------
  describe("Acceptance 3: Diff view correct for added, removed, and changed lines", () => {
    it("correctly identifies purely added lines", () => {
      const orig = "Line 1\nLine 2";
      const imp = "Line 1\nLine 2\nLine 3 (added)";

      const diff: DiffResult = computeLineDiff(orig, imp);

      assert.strictEqual(diff.summary.added, 1);
      assert.strictEqual(diff.summary.removed, 0);
      assert.strictEqual(diff.summary.modified, 0);
      assert.strictEqual(diff.summary.unchanged, 2);

      const addedLine = diff.lines.find((l) => l.type === "added");
      assert.ok(addedLine);
      assert.strictEqual(addedLine.text, "Line 3 (added)");
    });

    it("correctly identifies purely removed lines", () => {
      const orig = "Line 1\nLine 2 (to delete)\nLine 3";
      const imp = "Line 1\nLine 3";

      const diff: DiffResult = computeLineDiff(orig, imp);

      assert.strictEqual(diff.summary.added, 0);
      assert.strictEqual(diff.summary.removed, 1);
      assert.strictEqual(diff.summary.modified, 0);
      assert.strictEqual(diff.summary.unchanged, 2);

      const removedLine = diff.lines.find((l) => l.type === "removed");
      assert.ok(removedLine);
      assert.strictEqual(removedLine.text, "Line 2 (to delete)");
    });

    it("correctly identifies changed/modified lines", () => {
      const orig = "write about dogs";
      const imp = "Synthesize canine care and behavioral traits";

      const diff: DiffResult = computeLineDiff(orig, imp);

      assert.strictEqual(diff.summary.modified, 1);
      assert.strictEqual(diff.summary.added, 0);
      assert.strictEqual(diff.summary.removed, 0);

      const modLine = diff.lines.find((l) => l.type === "modified");
      assert.ok(modLine);
      assert.strictEqual(modLine.oldText, "write about dogs");
      assert.strictEqual(modLine.newText, "Synthesize canine care and behavioral traits");
    });

    it("correctly classifies mixed added, removed, and changed lines simultaneously", () => {
      const orig = [
        "Header Anchor",
        "Line purely deleted",
        "Middle Anchor 1",
        "Line to change",
        "Middle Anchor 2",
        "Footer Anchor",
      ].join("\n");

      const imp = [
        "Header Anchor",
        "Middle Anchor 1",
        "Line changed successfully",
        "Middle Anchor 2",
        "Line purely added",
        "Footer Anchor",
      ].join("\n");

      const diff = computeLineDiff(orig, imp);

      assert.strictEqual(diff.summary.unchanged, 4, "All 4 anchors must be unchanged");
      assert.strictEqual(diff.summary.removed, 1, "Must detect exactly 1 removed line");
      assert.strictEqual(diff.summary.modified, 1, "Must detect exactly 1 modified line");
      assert.strictEqual(diff.summary.added, 1, "Must detect exactly 1 added line");

      // Verify line types match
      const types = diff.lines.map((l) => l.type);
      assert.ok(types.includes("unchanged"));
      assert.ok(types.includes("removed"));
      assert.ok(types.includes("modified"));
      assert.ok(types.includes("added"));
    });

    it("handles identical texts with zero edits and 100% unchanged", () => {
      const text = "Line 1\nLine 2\nLine 3";
      const diff = computeLineDiff(text, text);

      assert.strictEqual(diff.summary.added, 0);
      assert.strictEqual(diff.summary.removed, 0);
      assert.strictEqual(diff.summary.modified, 0);
      assert.strictEqual(diff.summary.unchanged, 3);
      assert.ok(diff.lines.every((l) => l.type === "unchanged"));
    });

    it("handles empty original text (all lines added)", () => {
      const diff = computeLineDiff("", "Line 1\nLine 2");
      assert.strictEqual(diff.summary.added, 2);
      assert.strictEqual(diff.summary.removed, 0);
      assert.strictEqual(diff.summary.unchanged, 0);
    });

    it("handles empty improved text (all lines removed)", () => {
      const diff = computeLineDiff("Line 1\nLine 2", "");
      assert.strictEqual(diff.summary.removed, 2);
      assert.strictEqual(diff.summary.added, 0);
      assert.strictEqual(diff.summary.unchanged, 0);
    });
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 4: POST /api/optimize pipeline & independent metrics
  // -------------------------------------------------------------------------
  describe("Acceptance 4: POST /api/optimize pipeline & independent metrics", () => {
    it("returns 400 for empty or whitespace prompt", async () => {
      const req1 = new NextRequest("http://localhost:3000/api/optimize", {
        method: "POST",
        body: JSON.stringify({ prompt: "" }),
      });
      const res1 = await optimizeHandler(req1);
      assert.strictEqual(res1.status, 400);

      const req2 = new NextRequest("http://localhost:3000/api/optimize", {
        method: "POST",
        body: JSON.stringify({ prompt: "   " }),
      });
      const res2 = await optimizeHandler(req2);
      assert.strictEqual(res2.status, 400);
    });

    it("returns 400 for malformed JSON", async () => {
      const req = new NextRequest("http://localhost:3000/api/optimize", {
        method: "POST",
        body: "not json",
      });
      const res = await optimizeHandler(req);
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.error.code, "MALFORMED_JSON");
    });

    it("runs end-to-end optimization on 'write about dogs' and produces 3 evaluated improvements", async () => {
      const req = new NextRequest("http://localhost:3000/api/optimize", {
        method: "POST",
        body: JSON.stringify({
          prompt: "write about dogs",
          simulate: true, // Deterministic simulation for test environment
        }),
      });

      const res = await optimizeHandler(req);
      assert.strictEqual(res.status, 200);

      const data = await res.json();
      assert.strictEqual(data.success, true);

      // Verify original prompt diagnoses
      assert.ok(data.original);
      assert.ok(data.original.analysis.diagnoses.length >= 3);
      assert.ok(data.original.run.text.length > 0);

      // Verify improvements
      assert.strictEqual(data.improvements.length, 3);

      for (const imp of data.improvements) {
        assert.ok(["structured", "constrained", "format_engineered"].includes(imp.strategy));
        assert.ok(imp.prompt.length > data.original.prompt.length);
        assert.ok(imp.changes.length > 0);
        assert.ok(imp.diff);

        // Verify independent evaluations
        assert.ok(imp.run);
        assert.ok(typeof imp.run.latency.latencyMs === "number");
        assert.ok(typeof imp.run.tokenUsage.totalTokens === "number");
        assert.ok(typeof imp.run.cost.costUsd === "number");

        // Verify judge evaluations (1-5 each)
        assert.ok(imp.judge);
        assert.ok(imp.judge.relevance.score >= 1 && imp.judge.relevance.score <= 5);
        assert.ok(imp.judge.clarity.score >= 1 && imp.judge.clarity.score <= 5);
        assert.ok(imp.judge.correctness.score >= 1 && imp.judge.correctness.score <= 5);
        assert.ok(imp.judge.constraintFollowing.score >= 1 && imp.judge.constraintFollowing.score <= 5);

        // INVARIANT CHECK: Each metric must have its own delta and independent explanation
        assert.ok(imp.metricsComparison.relevance.explanation.length > 0);
        assert.ok(imp.metricsComparison.clarity.explanation.length > 0);
        assert.ok(imp.metricsComparison.constraintFollowing.explanation.length > 0);
        assert.ok(imp.metricsComparison.latencyMs.explanation.length > 0);
        assert.ok(imp.metricsComparison.totalTokens.explanation.length > 0);

        // Make sure no single combined "accuracyScore" is returned
        assert.strictEqual((imp as unknown as { accuracyScore?: unknown }).accuracyScore, undefined);
      }
    });

    it("enforces rate limiting on repeated requests from same IP", async () => {
      setTestRateLimit(2); // 2 requests per hour limit

      const makeReq = () =>
        new NextRequest("http://localhost:3000/api/optimize", {
          method: "POST",
          headers: { "x-forwarded-for": "198.51.100.99" },
          body: JSON.stringify({ prompt: "explain recursion", simulate: true }),
        });

      const res1 = await optimizeHandler(makeReq());
      assert.strictEqual(res1.status, 200);

      const res2 = await optimizeHandler(makeReq());
      assert.strictEqual(res2.status, 200);

      // 3rd request should hit rate limit (429)
      const res3 = await optimizeHandler(makeReq());
      assert.strictEqual(res3.status, 429);
      const data3 = await res3.json();
      assert.strictEqual(data3.error.code, "RATE_LIMIT_EXCEEDED");
    });
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 5: Library Import & Export and Storage Operations
  // -------------------------------------------------------------------------
  describe("Acceptance 5: Library Import & Export and Storage Operations", () => {
    it("exports all saved prompts as valid JSON string", () => {
      savePrompt({
        title: "Prompt Alpha",
        content: "Content Alpha",
        tags: ["alpha"],
      });
      savePrompt({
        title: "Prompt Beta",
        content: "Content Beta",
        tags: ["beta"],
      });

      const exportedJson = exportLibraryJson();
      const parsed = JSON.parse(exportedJson);

      assert.strictEqual(parsed.promptforge_version, "1.0");
      assert.ok(Array.isArray(parsed.prompts));
      assert.strictEqual(parsed.prompts.length, 2);
    });

    it("imports prompts correctly in merge mode without dropping existing", () => {
      savePrompt({
        id: "p-existing",
        title: "Existing Prompt",
        content: "Original Content",
        tags: ["tag1"],
      });

      const importPayload = JSON.stringify({
        prompts: [
          {
            id: "p-imported-new",
            title: "Imported New",
            content: "Imported Content",
            tags: ["tag2"],
          },
        ],
      });

      const result = importLibraryJson(importPayload, "merge");
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.importedCount, 1);

      const all = getSavedPrompts();
      assert.strictEqual(all.length, 2);
      assert.ok(all.some((p) => p.id === "p-existing"));
      assert.ok(all.some((p) => p.id === "p-imported-new"));
    });

    it("imports prompts in replace mode, replacing existing library", () => {
      savePrompt({
        title: "Old prompt to overwrite",
        content: "Old content",
      });

      const importPayload = JSON.stringify({
        prompts: [
          {
            id: "p-brand-new",
            title: "Brand New Prompt",
            content: "Brand New Content",
            tags: ["clean"],
          },
        ],
      });

      const result = importLibraryJson(importPayload, "replace");
      assert.strictEqual(result.success, true);

      const all = getSavedPrompts();
      assert.strictEqual(all.length, 1);
      assert.strictEqual(all[0].id, "p-brand-new");
    });

    it("handles corrupt import strings safely without throwing", () => {
      const result = importLibraryJson("corrupted JSON content!!{{{");
      assert.strictEqual(result.success, false);
      assert.ok(result.error);
    });

    it("deletes a prompt by ID", () => {
      const p = savePrompt({
        title: "To be deleted",
        content: "delete me",
      });

      assert.strictEqual(getSavedPrompts().length, 1);
      const deleted = deleteSavedPrompt(p.id);
      assert.strictEqual(deleted, true);
      assert.strictEqual(getSavedPrompts().length, 0);
    });
  });
});
