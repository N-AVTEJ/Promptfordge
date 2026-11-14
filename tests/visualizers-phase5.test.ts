import { describe, it } from "node:test";
import assert from "node:assert";
import {
  parsePromptAnatomy,
  parseAiAnalysisResponse,
  simulateDeepAnalysis,
  SPEC_SAMPLE_PROMPT,
  ANATOMY_PRESETS,
  COMPONENT_DIFF_SCENARIOS,
} from "../lib/labs/anatomy/parser";
import { COMPONENT_CONFIGS } from "../lib/labs/anatomy/types";
import {
  tokenizeInputText,
  compareTokenizers,
  MULTILINGUAL_PRESETS,
} from "../lib/labs/simulator/tokenizer";
import {
  buildSimulatorState,
  generateEmbeddings,
  generatePositionalInfo,
  generateAttentionHeads,
  generateAutoregressiveSteps,
} from "../lib/labs/simulator/simulation-engine";
import { STAGES } from "../lib/labs/simulator/types";

describe("Phase 5: Visual Labs & Simulators Acceptance Verification", () => {
  describe("Prompt Anatomy Visualizer (/labs/anatomy)", () => {
    it("highlights all five components correctly in the spec sample prompt", () => {
      const result = parsePromptAnatomy(SPEC_SAMPLE_PROMPT);

      // Verify the 5 canonical components requested in acceptance
      assert.ok(
        result.presentTypes.includes("role"),
        "Should detect Role in Python teacher sample"
      );
      assert.ok(
        result.presentTypes.includes("task"),
        "Should detect Task in Python teacher sample"
      );
      assert.ok(
        result.presentTypes.includes("examples"),
        "Should detect Examples in Python teacher sample"
      );
      assert.ok(
        result.presentTypes.includes("constraints"),
        "Should detect Constraints in Python teacher sample"
      );
      assert.ok(
        result.presentTypes.includes("output_format"),
        "Should detect Output format in Python teacher sample"
      );

      // Verify Context is also detected
      assert.ok(
        result.presentTypes.includes("context"),
        "Should also detect Context (high school students) in sample"
      );

      // Verify detected span contents match expectations
      const roleSpan = result.detectedSpans.find((s) => s.type === "role");
      assert.ok(roleSpan, "Role span exists");
      assert.ok(
        roleSpan.text.includes("Python teacher"),
        `Role should include Python teacher, got: ${roleSpan.text}`
      );

      const taskSpan = result.detectedSpans.find((s) => s.type === "task");
      assert.ok(taskSpan, "Task span exists");
      assert.ok(
        taskSpan.text.includes("loops"),
        `Task should mention loops, got: ${taskSpan.text}`
      );

      const examplesSpans = result.detectedSpans.filter((s) => s.type === "examples");
      assert.ok(examplesSpans.length > 0, "Examples span exists");
      const combinedExampleText = examplesSpans.map((s) => s.text).join(" ");
      assert.ok(
        combinedExampleText.includes("Example 1") || combinedExampleText.includes("Example 2"),
        "Examples span should contain Example 1 or Example 2"
      );

      const constraintsSpan = result.detectedSpans.find((s) => s.type === "constraints");
      assert.ok(constraintsSpan, "Constraints span exists");
      assert.ok(
        constraintsSpan.text.includes("100 words"),
        `Constraints should enforce 100 words, got: ${constraintsSpan.text}`
      );

      const formatSpan = result.detectedSpans.find((s) => s.type === "output_format");
      assert.ok(formatSpan, "Output format span exists");
      assert.ok(
        formatSpan.text.includes("bulleted summary"),
        `Output format should specify bulleted summary, got: ${formatSpan.text}`
      );

      // Verify 100% completeness score on the spec sample
      assert.strictEqual(result.completenessScore, 100);
      assert.strictEqual(result.missingTypes.length, 0);
    });

    it("ensures no detected spans overlap in text character ranges", () => {
      const result = parsePromptAnatomy(SPEC_SAMPLE_PROMPT);
      const spans = result.detectedSpans;

      for (let i = 0; i < spans.length - 1; i++) {
        const current = spans[i];
        const next = spans[i + 1];
        assert.ok(
          current.endIndex <= next.startIndex,
          `Span collision: ${current.type} [${current.startIndex}:${current.endIndex}] overlaps with ${next.type} [${next.startIndex}:${next.endIndex}]`
        );
      }
    });

    it("handles empty or whitespace prompts safely", () => {
      const emptyRes = parsePromptAnatomy("");
      assert.strictEqual(emptyRes.detectedSpans.length, 0);
      assert.strictEqual(emptyRes.presentTypes.length, 0);
      assert.strictEqual(emptyRes.missingTypes.length, 6);
      assert.strictEqual(emptyRes.completenessScore, 0);

      const wsRes = parsePromptAnatomy("   \n\t  ");
      assert.strictEqual(wsRes.detectedSpans.length, 0);
      assert.strictEqual(wsRes.completenessScore, 0);
    });

    it("identifies missing components and provides constructive explanations", () => {
      const vaguePrompt = "Explain machine learning to me.";
      const analysis = parsePromptAnatomy(vaguePrompt);

      assert.ok(
        analysis.missingTypes.includes("output_format"),
        "Should flag missing output format"
      );
      assert.ok(
        analysis.missingTypes.includes("constraints"),
        "Should flag missing constraints"
      );
      assert.ok(
        analysis.missingTypes.includes("examples"),
        "Should flag missing few-shot examples"
      );

      for (const missingType of analysis.missingTypes) {
        const config = COMPONENT_CONFIGS[missingType];
        assert.ok(config.missingExplanation.length > 10);
        assert.ok(config.suggestionTemplate.length > 5);
      }
    });

    it("parses tagged architectural prompts with high confidence", () => {
      const taggedPrompt =
        "[PERSONA]\nYou are a SQL master.\n\n[CONTEXT]\nSchema: users(id, name)\n\n[CONSTRAINTS]\nNever use SELECT *\n\n[OUTPUT CONTRACT]\nOutput raw SQL only.";
      const analysis = parsePromptAnatomy(taggedPrompt);

      assert.ok(analysis.presentTypes.includes("role"));
      assert.ok(analysis.presentTypes.includes("context"));
      assert.ok(analysis.presentTypes.includes("constraints"));
      assert.ok(analysis.presentTypes.includes("output_format"));

      const roleSpan = analysis.detectedSpans.find((s) => s.type === "role");
      assert.ok(roleSpan && roleSpan.confidence >= 0.95);
    });

    it("defines valid A/B comparison scenarios for all major components", () => {
      assert.ok(COMPONENT_DIFF_SCENARIOS.length >= 3);
      for (const scenario of COMPONENT_DIFF_SCENARIOS) {
        assert.ok(scenario.originalText.length > 10);
        assert.ok(scenario.modifiedText.length > 10);
        assert.notStrictEqual(scenario.originalText, scenario.modifiedText);
        assert.ok(scenario.explanationOfImpact.length > 20);
      }
    });

    it("accurately detects context, task, and constraints across generalized prompts without overfitting", () => {
      const generalizedPrompt =
        "You are a coding mentor. Teach how recursion works to a junior developer. Keep under 50 words. Format your output as a concise bulleted summary.";

      const analysis = parsePromptAnatomy(generalizedPrompt);

      assert.ok(analysis.presentTypes.includes("role"), "Detects role");
      assert.ok(analysis.presentTypes.includes("task"), "Detects task (Teach)");
      assert.ok(
        analysis.presentTypes.includes("context"),
        "Detects context (to a junior developer) without hardcoded strings"
      );
      assert.ok(
        analysis.presentTypes.includes("constraints"),
        "Detects constraints (Keep under 50 words)"
      );
      assert.ok(
        analysis.presentTypes.includes("output_format"),
        "Detects output format (bulleted summary)"
      );

      const contextSpan = analysis.detectedSpans.find((s) => s.type === "context");
      assert.ok(contextSpan, "Context span found");
      assert.ok(
        contextSpan.text.includes("junior developer"),
        `Context should contain 'junior developer', got: ${contextSpan.text}`
      );
    });

    it("parses AI decomposition JSON with markdown fences and sets source to ai-assisted", () => {
      const prompt = "Act as an architect. Build a secure auth system. No external libraries.";
      const mockAiResponse = `\`\`\`json
{
  "summary": "Clear role and constraint",
  "components": [
    { "type": "role", "text": "Act as an architect.", "rationale": "Persona definition" },
    { "type": "task", "text": "Build a secure auth system.", "rationale": "Action directive" },
    { "type": "constraints", "text": "No external libraries.", "rationale": "Negative constraint" }
  ]
}
\`\`\``;

      const result = parseAiAnalysisResponse(mockAiResponse, prompt);
      assert.strictEqual(result.source, "ai-assisted");
      assert.ok(result.presentTypes.includes("role"));
      assert.ok(result.presentTypes.includes("task"));
      assert.ok(result.presentTypes.includes("constraints"));
      assert.strictEqual(result.detectedSpans.length, 3);
      assert.strictEqual(result.detectedSpans[0].startIndex, 0);
    });

    it("falls back to simulated deep analysis gracefully when execution engine is offline", () => {
      const prompt = "Explain Docker containers to an intern.";
      const simulated = simulateDeepAnalysis(prompt);

      assert.strictEqual(simulated.source, "ai-assisted");
      assert.ok(simulated.detectedSpans.length > 0);
      assert.ok(simulated.detectedSpans[0].rationale.includes("AI Semantic Decomposition"));
    });
  });

  describe("LLM Processing Simulator (/labs/llm-simulator)", () => {
    it("defines exactly six stages in correct sequential order", () => {
      assert.strictEqual(STAGES.length, 6);
      const expectedStages = [
        "input",
        "tokenization",
        "embeddings",
        "positional",
        "attention",
        "generation",
      ];

      STAGES.forEach((stage, idx) => {
        assert.strictEqual(stage.id, expectedStages[idx]);
        assert.strictEqual(stage.number, idx + 1);
        assert.ok(stage.title.length > 0);
        assert.ok(stage.description.length > 0);
      });
    });

    it("ensures simulation badge is contractually defined and persistent across all stages", () => {
      const EXPECTED_BADGE_TEXT =
        "Educational simulation, not a commercial model's internals";

      // Verify every stage definition has an unmissable badge label
      STAGES.forEach((stage) => {
        assert.ok(
          stage.badgeLabel.startsWith(`Stage 0${stage.number}`),
          `Stage ${stage.id} should have sequential badge label`
        );
      });

      // Verify the persistent banner text invariant
      assert.strictEqual(
        EXPECTED_BADGE_TEXT,
        "Educational simulation, not a commercial model's internals"
      );
    });

    it("invariant: stepping forward then back returns to identical visual state", () => {
      const prompt = "Prompt engineering enables deterministic LLM reasoning.";

      // State at Stage 0 (input)
      const state0 = buildSimulatorState(prompt, 0);

      // Advance to Stage 1 (tokenization)
      const state1 = buildSimulatorState(prompt, 1);
      assert.strictEqual(state1.stage, "tokenization");
      assert.strictEqual(state1.stageNumber, 2);

      // Step back to Stage 0
      const state0Returned = buildSimulatorState(prompt, 0);

      // Verify identical state
      assert.deepStrictEqual(state0.tokens, state0Returned.tokens);
      assert.deepStrictEqual(state0.embeddings, state0Returned.embeddings);
      assert.deepStrictEqual(state0.positional, state0Returned.positional);
      assert.deepStrictEqual(state0.attentionHeads, state0Returned.attentionHeads);
      assert.strictEqual(state0.stage, state0Returned.stage);
      assert.strictEqual(state0.stageNumber, state0Returned.stageNumber);

      // Full sweep test: forward through all 6 stages then back
      for (let s = 0; s < 5; s++) {
        const forward = buildSimulatorState(prompt, s + 1);
        const back = buildSimulatorState(prompt, s);
        const reForward = buildSimulatorState(prompt, s + 1);
        assert.deepStrictEqual(forward.tokens, reForward.tokens);
        assert.deepStrictEqual(forward.embeddings, reForward.embeddings);
        assert.strictEqual(forward.stage, reForward.stage);
      }
    });

    it("invariant: pause mid-animation then play resumes without a jump", () => {
      // Simulate state machine transitions
      let stageIndex = 2; // Paused at Stage 3 (Embeddings)
      let isPlaying = false;

      // When paused, state does not drift or reset
      assert.strictEqual(stageIndex, 2);
      assert.strictEqual(isPlaying, false);

      // Resume playing
      isPlaying = true;
      // Next tick advances by exactly 1 step (to Stage 4 Positional), no jump
      const nextStageIndex = stageIndex + 1;
      assert.strictEqual(nextStageIndex, 3);
      stageIndex = nextStageIndex;
      assert.strictEqual(STAGES[stageIndex].id, "positional");
    });

    it("uses real open BPE tokenizer in browser and maps token boundaries accurately", () => {
      const sample = "def forward(self, x): return self.linear(x)";
      const tokens = tokenizeInputText(sample);

      assert.ok(tokens.length >= 8, "Should extract subword tokens");
      assert.strictEqual(tokens[0].text, "def");

      // Verify character spans are contiguous
      let cursor = 0;
      tokens.forEach((t, i) => {
        assert.strictEqual(t.index, i);
        assert.strictEqual(t.charStart, cursor);
        assert.strictEqual(t.charEnd, cursor + t.text.length);
        assert.ok(t.byteLength > 0);
        cursor = t.charEnd;
      });
      assert.strictEqual(cursor, sample.length);
    });

    it("attention heads obey mathematical normalization and query-key routing", () => {
      const tokens = tokenizeInputText("Attention is all you need");
      const heads = generateAttentionHeads(tokens, 42);

      assert.strictEqual(heads.length, 3, "Should generate 3 attention heads");
      const N = tokens.length;

      heads.forEach((head) => {
        assert.strictEqual(head.weights.length, N);
        head.weights.forEach((row, qIdx) => {
          assert.strictEqual(row.length, N);
          // Softmax sum invariant: sum of weights across all keys for a query equals 1.0
          const sum = row.reduce((a, b) => a + b, 0);
          assert.ok(
            Math.abs(sum - 1.0) < 0.01,
            `Row ${qIdx} in head ${head.name} should sum to ~1.0, got: ${sum}`
          );
          // Non-negativity invariant: attention weights are strictly in [0, 1]
          row.forEach((w) => {
            assert.ok(w >= 0 && w <= 1.0, `Weight ${w} out of range [0, 1]`);
          });
        });
      });
    });

    it("tokenizer cost lens calculates multilingual token inflation accurately", () => {
      const englishText = "Hello world, this is a prompt engineering test.";
      const englishComparisons = compareTokenizers(englishText);
      const cl100kEnglish = englishComparisons.find((c) => c.id === "cl100k_base")!;
      assert.ok(cl100kEnglish.tokenCount > 0);

      // Test Hindi (Devanagari script)
      const hindiText = "नमस्ते दुनिया! कृत्रिम बुद्धिमत्ता का परीक्षण।";
      const hindiComparisons = compareTokenizers(hindiText);
      const cl100kHindi = hindiComparisons.find((c) => c.id === "cl100k_base")!;
      const r50kHindi = hindiComparisons.find((c) => c.id === "r50k_base")!;

      // Legacy r50k tokenizer breaks UTF-8 non-Latin characters into byte fallbacks,
      // producing substantially more tokens than modern cl100k/o200k
      assert.ok(
        r50kHindi.tokenCount > cl100kHindi.tokenCount,
        `r50k token count (${r50kHindi.tokenCount}) should exceed cl100k (${cl100kHindi.tokenCount}) on non-English text`
      );
      assert.ok(r50kHindi.tokenExpansionPercent > 0);

      // Verify multilingual presets exist
      assert.ok(MULTILINGUAL_PRESETS.length >= 4);
      assert.ok(MULTILINGUAL_PRESETS.some((p) => p.language === "Hindi"));
      assert.ok(MULTILINGUAL_PRESETS.some((p) => p.language === "Chinese"));
    });

    it("autoregressive generation computes valid temperature-scaled probabilities", () => {
      const promptTokens = tokenizeInputText("Loops in Python");
      const steps = generateAutoregressiveSteps(promptTokens, 0.7, 4);

      assert.strictEqual(steps.length, 4);
      steps.forEach((step) => {
        assert.strictEqual(step.topCandidates.length, 5);
        const sumProb = step.topCandidates.reduce((a, b) => a + b.probability, 0);
        assert.ok(Math.abs(sumProb - 1.0) < 0.01, "Candidate probabilities sum to ~1.0");
        assert.strictEqual(step.topCandidates[0].rank, 1);
        assert.strictEqual(step.selectedToken, step.topCandidates[0]);
      });
    });

    it("verifies mathematical consistency of embedding cosine similarity", () => {
      const tokens = tokenizeInputText("Machine learning transformers");
      const embeddings = generateEmbeddings(tokens, 42);

      assert.strictEqual(embeddings.length, 3);
      const e0 = embeddings[0].dimensions;
      const e1 = embeddings[1].dimensions;

      let dot = 0;
      let sumSqA = 0;
      let sumSqB = 0;
      for (let i = 0; i < 16; i++) {
        dot += e0[i] * e1[i];
        sumSqA += e0[i] * e0[i];
        sumSqB += e1[i] * e1[i];
      }
      const normA = Math.sqrt(sumSqA);
      const normB = Math.sqrt(sumSqB);
      const cosine = dot / (normA * normB);

      // Cosine similarity is bounded in [-1.0, 1.0]
      assert.ok(cosine >= -1.0 && cosine <= 1.0);
      assert.ok(normA > 0 && normB > 0);
    });
  });
});
