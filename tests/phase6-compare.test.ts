import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import {
  evaluateResponseLength,
  evaluateLatency,
  evaluateTokenUsage,
  evaluateCost,
  evaluateFormatCompliance,
  computeRougeL,
  calculateSpread,
  aggregateTechniqueRuns,
  buildShuffledJudgePrompt,
  parseJudgeResponse,
  simulateRubricJudge,
  shuffleArray,
  RunEvaluation,
} from "../lib/engine/evaluate";
import {
  TECHNIQUES,
  TECHNIQUE_IDS,
  getTechnique,
  generatePromptForTechnique,
  generateAllPrompts,
} from "../lib/techniques";
import { POST as compareHandler } from "../app/api/compare/route";
import { engineCache } from "../lib/engine/cache";
import {
  resetGuardState,
  setTestRateLimit,
  setTestDailyTokenBudget,
  RateLimitError,
} from "../lib/engine/guard";

describe("Phase 6: Empirical Technique Comparison Lab Acceptance Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    engineCache.clear();
    resetGuardState();
    process.env.GEMINI_API_KEY = "test-mock-gemini-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.GEMINI_API_KEY;
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 1: Run all six techniques on one task
  // -------------------------------------------------------------------------
  describe("Acceptance 1: All six techniques & no merged score", () => {
    it("defines exactly six distinct prompting techniques", () => {
      assert.strictEqual(TECHNIQUES.length, 6);
      assert.deepStrictEqual(TECHNIQUE_IDS, [
        "zero-shot",
        "one-shot",
        "few-shot",
        "role-based",
        "constraint-based",
        "structured",
      ]);

      for (const id of TECHNIQUE_IDS) {
        const def = getTechnique(id);
        assert.ok(def, `Technique ${id} must exist in registry`);
        assert.strictEqual(typeof def.name, "string");
        assert.strictEqual(typeof def.description, "string");
        assert.strictEqual(typeof def.generatePrompt, "function");
      }
    });

    it("transforms a single task into six specialized prompts", () => {
      const task = "Summarize the ACID properties of relational databases.";
      const prompts = generateAllPrompts(task);

      assert.strictEqual(Object.keys(prompts).length, 6);

      // Verify each technique includes the task and specialized instructions
      assert.ok(prompts["zero-shot"].includes(task));
      assert.ok(prompts["one-shot"].includes("Demonstration Exemplar"));
      assert.ok(prompts["few-shot"].includes("Example 1"));
      assert.ok(prompts["role-based"].includes("Principal Technical Architect"));
      assert.ok(prompts["constraint-based"].includes("Non-Negotiable Operational Constraints"));
      assert.ok(prompts["structured"].includes("# SYSTEM SPECIFICATION"));
    });

    it("evaluates six techniques producing six cards with NO combined score anywhere", () => {
      const task = "Extract key entities from error log";
      const sampleRuns: Record<string, RunEvaluation[]> = {};

      for (const id of TECHNIQUE_IDS) {
        sampleRuns[id] = [
          {
            runIndex: 1,
            text: `Output from ${id} run 1`,
            responseLength: evaluateResponseLength(`Output from ${id} run 1`),
            latency: evaluateLatency(320),
            tokenUsage: evaluateTokenUsage(40, 25),
            cost: evaluateCost("gemini-1.5-flash", 40, 25),
            formatCompliance: evaluateFormatCompliance(`Output from ${id} run 1`, "none"),
            judgeScore: simulateRubricJudge(task, `Output from ${id} run 1`, id),
          },
        ];
      }

      const aggregateCards = TECHNIQUE_IDS.map((id) =>
        aggregateTechniqueRuns({
          techniqueId: id,
          techniqueName: getTechnique(id)!.name,
          prompt: generatePromptForTechnique(id, task),
          runsRequested: 1,
          runs: sampleRuns[id],
        })
      );

      // Verify exactly six cards
      assert.strictEqual(aggregateCards.length, 6);

      // Crucial Invariant: Verify NO combined accuracy score or merged score exists
      for (const card of aggregateCards) {
        const cardKeys = Object.keys(card);
        assert.strictEqual(
          cardKeys.includes("score"),
          false,
          "No blended 'score' property must exist"
        );
        assert.strictEqual(
          cardKeys.includes("accuracy"),
          false,
          "No blended 'accuracy' property must exist"
        );
        assert.strictEqual(
          cardKeys.includes("combinedScore"),
          false,
          "No combinedScore property must exist"
        );
        assert.strictEqual(
          cardKeys.includes("overallScore"),
          false,
          "No overallScore property must exist"
        );

        // Every metric must be independent with an explanation string
        assert.ok(card.latencySpread.explanation.length > 0);
        assert.ok(card.outputTokensSpread.explanation.length > 0);
        assert.ok(card.inputTokensSpread.explanation.length > 0);
        assert.ok(card.costSpread.explanation.length > 0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 2: N runs show spread, not just one number
  // -------------------------------------------------------------------------
  describe("Acceptance 2: N runs show statistical spread", () => {
    it("computes mean, min, max, range, and standard deviation accurately across N runs", () => {
      // 3 runs with varied latencies: 300ms, 400ms, 500ms
      const latencies = [300, 400, 500];
      const spread = calculateSpread(latencies, "Latency", "ms");

      assert.strictEqual(spread.mean, 400);
      assert.strictEqual(spread.min, 300);
      assert.strictEqual(spread.max, 500);
      assert.strictEqual(spread.range, 200); // 500 - 300 = 200ms spread
      assert.strictEqual(Math.round(spread.stdDev * 100) / 100, 81.65);
      assert.ok(spread.explanation.includes("spread 200 ms"));
      assert.ok(spread.explanation.includes("min 300"));
      assert.ok(spread.explanation.includes("max 500"));
    });

    it("handles single-run N=1 without crashing, showing zero spread", () => {
      const spread = calculateSpread([250], "Latency", "ms");

      assert.strictEqual(spread.mean, 250);
      assert.strictEqual(spread.min, 250);
      assert.strictEqual(spread.max, 250);
      assert.strictEqual(spread.range, 0);
      assert.strictEqual(spread.stdDev, 0);
    });

    it("handles empty values array safely without NaN", () => {
      const spread = calculateSpread([], "Output Tokens");

      assert.strictEqual(spread.mean, 0);
      assert.strictEqual(spread.min, 0);
      assert.strictEqual(spread.max, 0);
      assert.strictEqual(spread.range, 0);
      assert.strictEqual(spread.stdDev, 0);
      assert.ok(spread.explanation.includes("No runs available"));
    });

    it("aggregates N runs into distinct metric spreads in aggregateTechniqueRuns", () => {
      const runs: RunEvaluation[] = [
        {
          runIndex: 1,
          text: "Response 1 with 15 tokens.",
          responseLength: evaluateResponseLength("Response 1 with 15 tokens."),
          latency: evaluateLatency(250),
          tokenUsage: evaluateTokenUsage(50, 15),
          cost: evaluateCost("gemini-1.5-flash", 50, 15),
          formatCompliance: evaluateFormatCompliance("Response 1", "none"),
        },
        {
          runIndex: 2,
          text: "Response 2 with slightly longer tokens.",
          responseLength: evaluateResponseLength("Response 2 with slightly longer tokens."),
          latency: evaluateLatency(350),
          tokenUsage: evaluateTokenUsage(50, 25),
          cost: evaluateCost("gemini-1.5-flash", 50, 25),
          formatCompliance: evaluateFormatCompliance("Response 2", "none"),
        },
        {
          runIndex: 3,
          text: "Response 3",
          responseLength: evaluateResponseLength("Response 3"),
          latency: evaluateLatency(450),
          tokenUsage: evaluateTokenUsage(50, 35),
          cost: evaluateCost("gemini-1.5-flash", 50, 35),
          formatCompliance: evaluateFormatCompliance("Response 3", "none"),
        },
      ];

      const agg = aggregateTechniqueRuns({
        techniqueId: "few-shot",
        techniqueName: "Few-Shot",
        prompt: "Sample prompt",
        runsRequested: 3,
        runs,
      });

      assert.strictEqual(agg.runsCompleted, 3);
      assert.strictEqual(agg.latencySpread.mean, 350);
      assert.strictEqual(agg.latencySpread.range, 200); // 450 - 250
      assert.strictEqual(agg.outputTokensSpread.mean, 25);
      assert.strictEqual(agg.outputTokensSpread.range, 20); // 35 - 15
    });
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 3: Judge output order is shuffled
  // -------------------------------------------------------------------------
  describe("Acceptance 3: Position bias reduction via randomized candidate order", () => {
    it("shuffles candidate ordering in LLM judge prompt", () => {
      const task = "Classify sentiment of ticket";
      const candidates = [
        { id: "zero-shot", text: "Sentiment is positive." },
        { id: "one-shot", text: "Sentiment: POSITIVE." },
        { id: "few-shot", text: "Label: POSITIVE, Confidence: 0.95." },
        { id: "role-based", text: "As a senior QA, sentiment is POSITIVE." },
        { id: "constraint-based", text: "POSITIVE." },
        { id: "structured", text: '{"sentiment": "POSITIVE"}' },
      ];

      // Test with custom RNG that reverses array order to verify shuffling
      const reverseRng = () => 0.0; // Deterministically places elements at 0
      const shuffledResult = buildShuffledJudgePrompt(task, candidates, { rng: reverseRng });

      // Verify that the prompt candidate order is NOT the original order
      const originalOrder = candidates.map((c) => c.id);
      assert.notDeepStrictEqual(shuffledResult.candidateOrder, originalOrder);

      // Verify candidate anonymous labels are mapped
      assert.strictEqual(typeof shuffledResult.idToAnonymousLabel["zero-shot"], "string");
      assert.strictEqual(typeof shuffledResult.anonymousLabelToId["Candidate A"], "string");

      // Verify prompt contains rubric criteria: relevance, correctness, clarity, constraintFollowing
      assert.ok(shuffledResult.prompt.includes("relevance (1-5)"));
      assert.ok(shuffledResult.prompt.includes("correctness (1-5)"));
      assert.ok(shuffledResult.prompt.includes("clarity (1-5)"));
      assert.ok(shuffledResult.prompt.includes("constraintFollowing (1-5)"));
    });

    it("verifies shuffleArray produces permutations and preserves all elements", () => {
      const items = ["A", "B", "C", "D", "E", "F"];
      let observedDifferentOrder = false;

      // Run multiple shuffles to verify non-deterministic permutations
      for (let i = 0; i < 20; i++) {
        const shuffled = shuffleArray(items);
        assert.strictEqual(shuffled.length, items.length);
        assert.deepStrictEqual([...shuffled].sort(), [...items].sort());
        if (shuffled.join(",") !== items.join(",")) {
          observedDifferentOrder = true;
          break;
        }
      }

      assert.strictEqual(
        observedDifferentOrder,
        true,
        "Shuffled array should produce different ordering from original"
      );
    });

    it("correctly de-anonymizes parsed judge response back to candidate IDs", () => {
      const anonymousLabelToId = {
        "Candidate A": "structured",
        "Candidate B": "zero-shot",
      };

      const mockJudgeJson = JSON.stringify({
        evaluations: {
          "Candidate A": {
            relevance: { score: 5, reason: "Perfect alignment." },
            correctness: { score: 5, reason: "100% accurate." },
            clarity: { score: 5, reason: "Structured JSON schema." },
            constraintFollowing: { score: 5, reason: "Strict constraints." },
          },
          "Candidate B": {
            relevance: { score: 4, reason: "Good answer." },
            correctness: { score: 4, reason: "Sound logic." },
            clarity: { score: 3, reason: "Unformatted prose." },
            constraintFollowing: { score: 3, reason: "Minor constraint lapse." },
          },
        },
      });

      const parsed = parseJudgeResponse(mockJudgeJson, anonymousLabelToId);

      assert.ok(parsed["structured"], "Should remap Candidate A to structured");
      assert.strictEqual(parsed["structured"].clarity.score, 5);
      assert.strictEqual(parsed["structured"].clarity.reason, "Structured JSON schema.");

      assert.ok(parsed["zero-shot"], "Should remap Candidate B to zero-shot");
      assert.strictEqual(parsed["zero-shot"].clarity.score, 3);
    });
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 4: Hitting rate limit mid-compare shows partial results
  // -------------------------------------------------------------------------
  describe("Acceptance 4: Rate limit mid-compare partial results", () => {
    it("returns partial results with clear warning when throttled mid-compare", async () => {
      let callCount = 0;

      // Mock fetch: succeeds for first 2 calls, then throws rate limit / budget error
      global.fetch = async (url, opts) => {
        callCount++;
        if (callCount <= 2) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              candidates: [
                {
                  content: {
                    parts: [{ text: `Response #${callCount}` }],
                  },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 15,
                candidatesTokenCount: 20,
              },
            }),
          } as Response;
        }

        // On 3rd call, simulate rate limit failure
        return {
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
          json: async () => ({
            error: {
              code: 429,
              message: "Resource has been exhausted (e.g. check quota).",
              status: "RESOURCE_EXHAUSTED",
            },
          }),
        } as Response;
      };

      // Set rate limit per hour to 2 to trigger rate limit on call 3
      setTestRateLimit(2);

      const requestPayload = {
        task: "Explain binary search.",
        techniques: [
          { id: "zero-shot", prompt: "Explain binary search concisely." },
          { id: "one-shot", prompt: "Demonstration: ... Explain binary search." },
        ],
        runsPerTechnique: 2, // Total 4 requested runs
        skipCache: true,
      };

      const req = new NextRequest("http://localhost:3000/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": "198.51.100.42",
        },
        body: JSON.stringify(requestPayload),
      });

      const response = await compareHandler(req);
      assert.strictEqual(response.status, 200, "Should return HTTP 200 with partial results");

      const body = await response.json();

      assert.strictEqual(body.success, true);
      assert.strictEqual(body.status, "partial");
      assert.ok(body.warning, "Warning object must be present");
      assert.strictEqual(body.warning.code, "RATE_LIMITED");
      assert.ok(
        body.warning.message.includes("Comparison halted mid-run due to rate limit"),
        "Clear explanation message must be provided"
      );

      // Verify partial completed runs data is preserved
      assert.strictEqual(body.data.isPartial, true);
      assert.ok(body.data.totalCompletedRuns > 0);
      assert.ok(body.data.results.length > 0);
    });

    it("returns 429 if rate limit is reached immediately before any run completes", async () => {
      // Set limit to 0 so even the first run fails
      setTestRateLimit(0);

      const requestPayload = {
        task: "Explain hashing.",
        techniques: [{ id: "zero-shot", prompt: "Explain hashing." }],
        runsPerTechnique: 1,
      };

      const req = new NextRequest("http://localhost:3000/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": "198.51.100.99",
        },
        body: JSON.stringify(requestPayload),
      });

      const response = await compareHandler(req);
      assert.strictEqual(response.status, 429);

      const body = await response.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "RATE_LIMITED");
    });
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 5: BLEU & ROUGE Rule (Ground Truth Reference Answer)
  // -------------------------------------------------------------------------
  describe("Acceptance 5: Ground truth reference answer requirement for ROUGE-L", () => {
    it("refuses to compute ROUGE-L when reference answer is empty or missing", () => {
      assert.throws(
        () => computeRougeL("Some candidate output", ""),
        /Cannot compute ROUGE-L without a reference answer/
      );

      assert.throws(
        () => computeRougeL("Some candidate output", "   \t\n  "),
        /Cannot compute ROUGE-L without a reference answer/
      );
    });

    it("computes accurate ROUGE-L LCS precision, recall, and F1 when reference is supplied", () => {
      const reference = "Quantum superposition allows qubits to be in multiple states simultaneously.";
      const candidate = "Quantum superposition allows particles to exist in multiple states simultaneously.";

      const result = computeRougeL(candidate, reference);

      assert.strictEqual(typeof result.precision, "number");
      assert.strictEqual(typeof result.recall, "number");
      assert.strictEqual(typeof result.f1, "number");
      assert.ok(result.f1 > 0.7, "Should detect high overlap on similar sentences");

      // Verify educational explainers
      assert.ok(result.whatItTellsYou.includes("longest common subsequence"));
      assert.ok(result.whatItDoesNotTellYou.includes("does NOT evaluate factual truth"));
      assert.ok(result.explanation.includes("ROUGE-L:"));
    });

    it("achieves 100% ROUGE-L on exact reference match", () => {
      const text = "Deterministic state machine with immutable audit trail.";
      const result = computeRougeL(text, text);

      assert.strictEqual(result.recall, 1.0);
      assert.strictEqual(result.precision, 1.0);
      assert.strictEqual(result.f1, 1.0);
    });
  });

  // -------------------------------------------------------------------------
  // ACCEPTANCE 6: Format Compliance Verification
  // -------------------------------------------------------------------------
  describe("Acceptance 6: Format compliance evaluator", () => {
    it("evaluates strict JSON format compliance", () => {
      const validJson = '{"status": "success", "count": 42}';
      const validRes = evaluateFormatCompliance(validJson, "json");
      assert.strictEqual(validRes.isCompliant, true);
      assert.strictEqual(validRes.score, 1.0);
      assert.ok(validRes.explanation.includes("Strict JSON compliance achieved"));

      const fencedJson = 'Here is the data:\n```json\n{"status": "ok"}\n```';
      const fencedRes = evaluateFormatCompliance(fencedJson, "json");
      assert.strictEqual(fencedRes.isCompliant, true);
      assert.strictEqual(fencedRes.score, 1.0);

      const invalidJson = 'Not a json object: {broken: key, "unquoted"}';
      const invalidRes = evaluateFormatCompliance(invalidJson, "json");
      assert.strictEqual(invalidRes.isCompliant, false);
      assert.strictEqual(invalidRes.score, 0.0);
      assert.ok(invalidRes.explanation.includes("Failed JSON compliance"));
    });

    it("evaluates bullet-points format compliance", () => {
      const bullets = "- Item one\n- Item two\n- Item three";
      const res = evaluateFormatCompliance(bullets, "bullet-points");
      assert.strictEqual(res.isCompliant, true);
      assert.strictEqual(res.score, 1.0);

      const prose = "This is a standard paragraph with no list items at all.";
      const proseRes = evaluateFormatCompliance(prose, "bullet-points");
      assert.strictEqual(proseRes.isCompliant, false);
    });

    it("evaluates CSV compliance", () => {
      const csv = "id,name,role\n1,Alice,Admin\n2,Bob,User";
      const res = evaluateFormatCompliance(csv, "csv");
      assert.strictEqual(res.isCompliant, true);
      assert.strictEqual(res.score, 1.0);
    });

    it("evaluates XML compliance", () => {
      const xml = "<response><status>ok</status></response>";
      const res = evaluateFormatCompliance(xml, "xml");
      assert.strictEqual(res.isCompliant, true);
    });
  });
});
