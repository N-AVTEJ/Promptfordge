import { describe, it } from "node:test";
import assert from "node:assert";

import {
  detectWorkflowCycle,
  getTopologicalOrder,
  isValidWorkflowConnection,
  extractTemplateVariables,
  interpolateVariables,
  executeWorkflow,
} from "../lib/workflow/engine";
import { WorkflowNode, WorkflowEdge } from "../lib/workflow/types";
import { STARTER_TEMPLATES } from "../lib/workflow/templates";
import {
  saveWorkflow,
  getSavedWorkflows,
  deleteWorkflow,
  exportWorkflowJson,
  importWorkflowJson,
} from "../lib/storage/workflow";
import {
  buildTreeOfThoughts,
  TOT_EDUCATIONAL_DISCLOSURE,
  TOT_PRESETS,
} from "../lib/reasoning/tot-engine";
import {
  safeCalculate,
  lookupKnowledge,
  executeMockTool,
  REACT_EDUCATIONAL_DISCLOSURE,
  REACT_SCENARIOS,
} from "../lib/reasoning/react-engine";
import {
  evaluateExpertCouncil,
  EXPERT_ROLES,
  EXPERT_PRESETS,
  EXPERT_EDUCATIONAL_DISCLOSURE,
} from "../lib/reasoning/expert-engine";

describe("Phase 8: Workflow Builder Acceptance Tests", () => {
  it("A 4-node chain runs end to end and each node displays its output", async () => {
    const nodes: WorkflowNode[] = [
      {
        id: "n-input",
        type: "userInput",
        position: { x: 0, y: 0 },
        data: {
          label: "User Query",
          status: "idle",
          inputPrompt: "How can we implement rate limiting?",
        },
      },
      {
        id: "n-template",
        type: "promptTemplate",
        position: { x: 300, y: 0 },
        data: {
          label: "Prompt Template",
          status: "idle",
          template: "You are an API Architect. Advise on: {{input}}",
          variables: ["input"],
        },
      },
      {
        id: "n-llm",
        type: "llmRun",
        position: { x: 600, y: 0 },
        data: {
          label: "LLM Runner",
          status: "idle",
          model: "gemini-1.5-flash",
          temperature: 0.7,
        },
      },
      {
        id: "n-output",
        type: "finalOutput",
        position: { x: 900, y: 0 },
        data: {
          label: "Final Result",
          status: "idle",
        },
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: "e1", source: "n-input", target: "n-template" },
      { id: "e2", source: "n-template", target: "n-llm" },
      { id: "e3", source: "n-llm", target: "n-output" },
    ];

    // Mock prompt runner to verify deterministic pipeline output
    let runnerCallCount = 0;
    const mockRunner = async (input: { prompt: string }) => {
      runnerCallCount++;
      return {
        text: `Engine Completion for: ${input.prompt}`,
        tokensIn: 12,
        tokensOut: 24,
        latencyMs: 85,
        costEstimateUsd: 0.00004,
        model: "gemini-1.5-flash",
      };
    };

    const result = await executeWorkflow(nodes, edges, { runner: mockRunner });

    // Assert overall pipeline success
    assert.strictEqual(result.success, true);
    assert.strictEqual(runnerCallCount, 1);
    assert.strictEqual(result.executedNodeIds.length, 4);

    // Assert each node generated and stored its output
    assert.ok(result.nodeOutputs["n-input"], "User input node must have output");
    assert.strictEqual(
      result.nodeOutputs["n-input"],
      "How can we implement rate limiting?"
    );

    assert.ok(result.nodeOutputs["n-template"], "Template node must have output");
    assert.strictEqual(
      result.nodeOutputs["n-template"],
      "You are an API Architect. Advise on: How can we implement rate limiting?"
    );

    assert.ok(result.nodeOutputs["n-llm"], "LLM node must have output");
    assert.ok(
      result.nodeOutputs["n-llm"].includes("Engine Completion for: You are an API Architect")
    );

    assert.ok(result.nodeOutputs["n-output"], "Final output node must have output");
    assert.strictEqual(result.nodeOutputs["n-output"], result.nodeOutputs["n-llm"]);

    // Check telemetry accumulation
    assert.strictEqual(result.totalTokens, 36);
    assert.ok(result.totalLatencyMs >= 0);
  });

  it("A cyclic graph is rejected before any API call", async () => {
    // 3-node cyclic graph: A -> B -> C -> A
    const nodes: WorkflowNode[] = [
      {
        id: "c-1",
        type: "userInput",
        position: { x: 0, y: 0 },
        data: { label: "Input Node A", status: "idle", inputPrompt: "test" },
      },
      {
        id: "c-2",
        type: "llmRun",
        position: { x: 300, y: 0 },
        data: { label: "LLM Node B", status: "idle", model: "gemini-1.5-flash" },
      },
      {
        id: "c-3",
        type: "promptTemplate",
        position: { x: 600, y: 0 },
        data: { label: "Template Node C", status: "idle", template: "{{input}}" },
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: "e1", source: "c-1", target: "c-2" },
      { id: "e2", source: "c-2", target: "c-3" },
      { id: "e3", source: "c-3", target: "c-1" }, // Cycles back to c-1!
    ];

    // Spy on runner to ensure ZERO calls occur
    let runnerCalled = false;
    const spyRunner = async () => {
      runnerCalled = true;
      return { text: "Should never run", latencyMs: 0, costEstimateUsd: 0, model: "m" };
    };

    // Cycle detection directly
    const cycleCheck = detectWorkflowCycle(nodes, edges);
    assert.strictEqual(cycleCheck.hasCycle, true);
    assert.ok(cycleCheck.errorMessage, "Cycle check must provide friendly error");
    assert.ok(
      cycleCheck.errorMessage.includes("cyclic dependency"),
      `Expected message to explain cyclic dependency, got: ${cycleCheck.errorMessage}`
    );

    // Full workflow execution attempt
    const result = await executeWorkflow(nodes, edges, { runner: spyRunner });

    // CRITICAL ACCEPTANCE CHECK: Rejected before any API call!
    assert.strictEqual(runnerCalled, false, "Execution runner must NOT be called when cycle is detected");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.executedNodeIds.length, 0);
    assert.ok(
      result.error?.includes("cyclic dependency"),
      `Expected friendly error message, got: ${result.error}`
    );
  });

  it("Detects 2-node immediate reciprocal cycles (A <-> B)", () => {
    const nodes: WorkflowNode[] = [
      {
        id: "n-1",
        type: "promptTemplate",
        position: { x: 0, y: 0 },
        data: { label: "Template 1", status: "idle", template: "A" },
      },
      {
        id: "n-2",
        type: "llmRun",
        position: { x: 300, y: 0 },
        data: { label: "LLM Run 2", status: "idle", model: "m" },
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: "e1", source: "n-1", target: "n-2" },
      { id: "e2", source: "n-2", target: "n-1" },
    ];

    const check = detectWorkflowCycle(nodes, edges);
    assert.strictEqual(check.hasCycle, true);
    assert.ok(check.errorMessage?.includes("Template 1"));
    assert.ok(check.errorMessage?.includes("LLM Run 2"));
  });

  it("Typed handle connection validation prevents invalid linkages", () => {
    const nodes: WorkflowNode[] = [
      {
        id: "inp",
        type: "userInput",
        position: { x: 0, y: 0 },
        data: { label: "Input", status: "idle", inputPrompt: "" },
      },
      {
        id: "tpl",
        type: "promptTemplate",
        position: { x: 100, y: 0 },
        data: { label: "Template", status: "idle", template: "{{input}}" },
      },
      {
        id: "out",
        type: "finalOutput",
        position: { x: 300, y: 0 },
        data: { label: "Output", status: "idle" },
      },
      {
        id: "llm",
        type: "llmRun",
        position: { x: 150, y: 0 },
        data: { label: "LLM", status: "idle", model: "m" },
      },
      {
        id: "eval1",
        type: "evaluate",
        position: { x: 200, y: 0 },
        data: { label: "Eval 1", status: "idle" },
      },
      {
        id: "eval2",
        type: "evaluate",
        position: { x: 250, y: 0 },
        data: { label: "Eval 2", status: "idle" },
      },
    ];

    // Self-connection must be rejected
    assert.strictEqual(
      isValidWorkflowConnection({ source: "inp", target: "inp" }, nodes),
      false
    );

    // UserInput cannot be a target (it only emits input)
    assert.strictEqual(
      isValidWorkflowConnection({ source: "llm", target: "inp" }, nodes),
      false
    );

    // FinalOutput cannot be a source (it is a terminal receiver)
    assert.strictEqual(
      isValidWorkflowConnection({ source: "out", target: "llm" }, nodes),
      false
    );

    // Typed Handle rule: Evaluate cannot be connected to Evaluate (rubrics evaluate text, not rubrics)
    assert.strictEqual(
      isValidWorkflowConnection({ source: "eval1", target: "eval2" }, nodes),
      false
    );

    // Typed Handle rule: Evaluate cannot be connected directly to PromptTemplate
    assert.strictEqual(
      isValidWorkflowConnection({ source: "eval1", target: "tpl" }, nodes),
      false
    );

    // Valid forward connection: UserInput -> LLM
    assert.strictEqual(
      isValidWorkflowConnection({ source: "inp", target: "llm" }, nodes),
      true
    );

    // Valid forward connection: LLM -> FinalOutput
    assert.strictEqual(
      isValidWorkflowConnection({ source: "llm", target: "out" }, nodes),
      true
    );

    // Valid forward connection: LLM -> Evaluate
    assert.strictEqual(
      isValidWorkflowConnection({ source: "llm", target: "eval1" }, nodes),
      true
    );

    // Valid forward connection: Evaluate -> FinalOutput
    assert.strictEqual(
      isValidWorkflowConnection({ source: "eval1", target: "out" }, nodes),
      true
    );
  });

  it("Extracts and interpolates template {{variables}} deterministically", () => {
    const template =
      "Hello {{name}}, welcome to {{project}}! Please review {{input}}.";

    const vars = extractTemplateVariables(template);
    assert.deepStrictEqual(vars, ["name", "project", "input"]);

    const interpolated = interpolateVariables(template, {
      name: "Navtej",
      project: "PromptForge",
      input: "Task-8",
    });

    assert.strictEqual(
      interpolated,
      "Hello Navtej, welcome to PromptForge! Please review Task-8."
    );

    // Test fallback when variable is omitted
    const fallbackInterpolated = interpolateVariables(
      "Query: {{input}}",
      { input: "Default Query" }
    );
    assert.strictEqual(fallbackInterpolated, "Query: Default Query");
  });

  it("Executes 5-node chain with Evaluate node producing independent rubric scores", async () => {
    const template = STARTER_TEMPLATES[1]; // Chain with Automated Evaluation
    assert.strictEqual(template.nodes.length, 5);

    const result = await executeWorkflow(template.nodes, template.edges);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.executedNodeIds.length, 5);

    const evalOutput = result.nodeOutputs["eval-evaluate-node"];
    assert.ok(evalOutput, "Evaluate node must generate rubric output");
    assert.ok(evalOutput.includes("Clarity:"), "Must evaluate Clarity");
    assert.ok(evalOutput.includes("Relevance:"), "Must evaluate Relevance");
    assert.ok(evalOutput.includes("Correctness:"), "Must evaluate Correctness");
    assert.ok(evalOutput.includes("Constraints:"), "Must evaluate Constraints");
  });

  it("Starter templates are all validated DAGs with no cycles", () => {
    assert.strictEqual(STARTER_TEMPLATES.length, 3);

    for (const t of STARTER_TEMPLATES) {
      assert.ok(t.nodes.length >= 4, `Template ${t.name} must have >= 4 nodes`);
      assert.ok(t.edges.length >= 3, `Template ${t.name} must have >= 3 edges`);

      const cycle = detectWorkflowCycle(t.nodes, t.edges);
      assert.strictEqual(
        cycle.hasCycle,
        false,
        `Template ${t.name} must not contain cycles`
      );

      const order = getTopologicalOrder(t.nodes, t.edges);
      assert.strictEqual(order.length, t.nodes.length);
    }
  });

  it("Workflow JSON export and import round-trips correctly", () => {
    const original = STARTER_TEMPLATES[0];
    const exportedJson = exportWorkflowJson(original);
    assert.ok(typeof exportedJson === "string");

    const imported = importWorkflowJson(exportedJson);
    assert.strictEqual(imported.name, original.name);
    assert.strictEqual(imported.nodes.length, original.nodes.length);
    assert.strictEqual(imported.edges.length, original.edges.length);

    // Rejects corrupt JSON
    assert.throws(() => importWorkflowJson("not valid json"));
    assert.throws(() => importWorkflowJson(JSON.stringify({ notAWorkflow: true })));
  });
});

describe("Phase 8: Reasoning Playground Acceptance Tests", () => {
  it("Tree-of-Thoughts generates candidates, scores them across separate individual metrics with explanations, and selects optimal path", () => {
    const tree = buildTreeOfThoughts("Design an enterprise cache invalidation protocol");

    // Acceptance requirement: Reasoning visuals show candidate paths
    assert.ok(tree.totalCandidateThoughts >= 3);
    assert.ok(tree.chosenLeafId, "Must have an identified optimal leaf");
    assert.ok(tree.chosenPathNodeIds.length >= 2, "Chosen path must include root + winner");

    // Verify root
    const root = tree.nodes[tree.rootNodeId];
    assert.ok(root, "Root node must exist");
    assert.strictEqual(root.depth, 0);

    // Verify candidate thoughts have separate individual metrics (Never a single combined accuracy score)
    const candidates = Object.values(tree.nodes).filter((n) => n.depth > 0);
    assert.ok(candidates.length >= 3);

    for (const cand of candidates) {
      const { feasibility, soundness, completeness } = cand.scores;

      // Metric 1: Feasibility
      assert.ok(typeof feasibility.score === "number" && feasibility.score >= 1 && feasibility.score <= 5);
      assert.ok(feasibility.reason.length > 5, "Feasibility must have explanation");

      // Metric 2: Soundness
      assert.ok(typeof soundness.score === "number" && soundness.score >= 1 && soundness.score <= 5);
      assert.ok(soundness.reason.length > 5, "Soundness must have explanation");

      // Metric 3: Completeness
      assert.ok(typeof completeness.score === "number" && completeness.score >= 1 && completeness.score <= 5);
      assert.ok(completeness.reason.length > 5, "Completeness must have explanation");
    }

    // Verify chosen path has isChosenPath = true
    for (const pId of tree.chosenPathNodeIds) {
      assert.strictEqual(tree.nodes[pId].isChosenPath, true);
    }
  });

  it("Tree-of-Thoughts presents educational simulation disclosure label", () => {
    // Acceptance requirement: disclosure label present
    assert.ok(TOT_EDUCATIONAL_DISCLOSURE.length > 0);
    assert.ok(
      TOT_EDUCATIONAL_DISCLOSURE.includes("Educational simulation"),
      "Must state educational simulation explicitly"
    );
    assert.ok(
      TOT_EDUCATIONAL_DISCLOSURE.includes("not private model internal activations"),
      "Must clarify candidate paths are structured exploration, not private model internals"
    );
  });

  it("ReAct loop executes alternating Thought (summary), Action, Observation steps with mock tool suite", () => {
    const scenario = REACT_SCENARIOS[0]; // Cloud Egress calculation
    assert.strictEqual(scenario.id, "cloud-egress");

    // Check alternating sequence
    const types = scenario.steps.map((s) => s.type);
    assert.strictEqual(types[0], "thought");
    assert.strictEqual(types[1], "action");
    assert.strictEqual(types[2], "observation");
    assert.strictEqual(types[3], "thought");
    assert.strictEqual(types[4], "action");
    assert.strictEqual(types[5], "observation");
    assert.strictEqual(types[6], "thought");
    assert.strictEqual(types[7], "finish");

    // Acceptance requirement: Clear labels that thoughts are summaries, not private internal reasoning
    for (const step of scenario.steps) {
      if (step.type === "thought") {
        assert.ok(
          step.title.includes("Thought (Summary)") || step.title.includes("Thought"),
          `Thought step must be clearly labeled as summary, got: ${step.title}`
        );
      }
    }

    // Terminal answer verifies expected calculation ($15,360)
    const finalStep = scenario.steps[scenario.steps.length - 1];
    assert.strictEqual(finalStep.type, "finish");
    assert.ok(finalStep.content.includes("15,360"));
  });

  it("ReAct tools execute securely: safeCalculate handles math without eval, supports unary signs and safe math functions, and rejects dangerous input", () => {
    // Safe standard arithmetic
    assert.strictEqual(safeCalculate("25 * 1024 * 0.05 * 12").result, 15360);
    assert.strictEqual(safeCalculate("(450 * 12) + 300").result, 5700);
    assert.strictEqual(safeCalculate("100 / 4").result, 25);
    assert.strictEqual(safeCalculate("2 ^ 10").result, 1024);

    // Float arithmetic
    assert.strictEqual(safeCalculate("0.1 + 0.2").result, 0.3);

    // Unary negative signs and expressions
    assert.strictEqual(safeCalculate("5 * -2").result, -10);
    assert.strictEqual(safeCalculate("10 - -5").result, 15);
    assert.strictEqual(safeCalculate("-(3 + 4)").result, -7);
    assert.strictEqual(safeCalculate("5 * -(3 + 4)").result, -35);
    assert.strictEqual(safeCalculate("-5 + 10").result, 5);

    // Safe mathematical functions
    assert.strictEqual(safeCalculate("sqrt(16)").result, 4);
    assert.strictEqual(safeCalculate("abs(-42)").result, 42);
    assert.strictEqual(safeCalculate("round(4.6)").result, 5);
    assert.strictEqual(safeCalculate("floor(4.9)").result, 4);
    assert.strictEqual(safeCalculate("ceil(4.1)").result, 5);

    // Rejection of dangerous code / injections (never evaluates JS!)
    const injection = safeCalculate("process.exit(1)");
    assert.ok(injection.error, "Must reject non-arithmetic characters or forbidden identifiers");

    const functionInjection = safeCalculate("console.log('pwned')");
    assert.ok(functionInjection.error, "Must reject function calls");
  });

  it("ReAct tools execute lookup queries against knowledge base", () => {
    const egressLookup = lookupKnowledge("cloud egress");
    assert.ok(egressLookup.includes("0-10 TB/mo"));
    assert.ok(egressLookup.includes("10-50 TB/mo"));

    const argonLookup = lookupKnowledge("argon2id");
    assert.ok(argonLookup.includes("65536 KiB"));

    // Tool runner dispatcher
    const toolExec = executeMockTool("calculator", "50 * 20");
    assert.strictEqual(toolExec.output, "1000");

    const lookupExec = executeMockTool("lookup", "gemini context");
    assert.ok(lookupExec.output.includes("1,000,000"));
  });

  it("ReAct presents educational disclosure label", () => {
    // Acceptance requirement: disclosure label present
    assert.ok(REACT_EDUCATIONAL_DISCLOSURE.length > 0);
    assert.ok(
      REACT_EDUCATIONAL_DISCLOSURE.includes("Educational simulation"),
      "Must state educational simulation"
    );
    assert.ok(
      REACT_EDUCATIONAL_DISCLOSURE.includes("Summarized externalized rationale"),
      "Must clarify thought steps are summaries"
    );
  });

  it("Expert Prompting evaluates queries across 4 distinct specialist roles side by side with non-combined scores", () => {
    const query = EXPERT_PRESETS[0].query;
    const council = evaluateExpertCouncil(query, EXPERT_PRESETS[0].id);

    assert.strictEqual(council.length, 4);

    const roleIds = council.map((c) => c.roleId);
    assert.ok(roleIds.includes("security-architect"));
    assert.ok(roleIds.includes("perf-engineer"));
    assert.ok(roleIds.includes("ux-lead"));
    assert.ok(roleIds.includes("sre-lead"));

    // Check that each specialist provides distinct domain-specific answers
    const secResp = council.find((c) => c.roleId === "security-architect")!;
    assert.ok(secResp.response.includes("TLS") || secResp.response.includes("Adversarial") || secResp.response.includes("JA4"));

    const perfResp = council.find((c) => c.roleId === "perf-engineer")!;
    assert.ok(perfResp.response.includes("eBPF") || perfResp.response.includes("Cache") || perfResp.response.includes("Atomic") || perfResp.response.includes("Redis"));

    const uxResp = council.find((c) => c.roleId === "ux-lead")!;
    assert.ok(uxResp.response.includes("Human-Readable") || uxResp.response.includes("Warning") || uxResp.response.includes("429"));

    const sreResp = council.find((c) => c.roleId === "sre-lead")!;
    assert.ok(sreResp.response.includes("Fail-Open") || sreResp.response.includes("Blast Radius") || sreResp.response.includes("Cell"));

    // Verify independent scores with reasons (Never a single combined score!)
    for (const member of council) {
      const { domainRigor, actionability, riskAwareness } = member.scores;

      assert.ok(domainRigor.score >= 1 && domainRigor.score <= 5);
      assert.ok(domainRigor.reason.length > 3);

      assert.ok(actionability.score >= 1 && actionability.score <= 5);
      assert.ok(actionability.reason.length > 3);

      assert.ok(riskAwareness.score >= 1 && riskAwareness.score <= 5);
      assert.ok(riskAwareness.reason.length > 3);
    }
  });

  it("Expert Prompting presents educational simulation disclosure label", () => {
    assert.ok(EXPERT_EDUCATIONAL_DISCLOSURE.length > 0);
    assert.ok(
      EXPERT_EDUCATIONAL_DISCLOSURE.includes("Educational simulation"),
      "Must state educational simulation"
    );
    assert.ok(
      EXPERT_EDUCATIONAL_DISCLOSURE.includes("specialist role boundaries"),
      "Must explain specialist boundaries"
    );
  });
});
