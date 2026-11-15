/**
 * PromptForge Visual Workflow Starter Templates
 * Three production-ready DAG templates covering linear chains,
 * automated evaluation, and multi-step summarization pipelines.
 */

import { WorkflowDefinition } from "./types";

export const STARTER_TEMPLATES: WorkflowDefinition[] = [
  {
    id: "template-4-node-linear",
    name: "4-Node Linear Prompt Chain",
    description:
      "A clean linear pipeline passing user input into a prompt template, executing via LLM, and rendering final output.",
    isTemplate: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nodes: [
      {
        id: "node-user-input",
        type: "userInput",
        position: { x: 50, y: 180 },
        data: {
          label: "1. User Input",
          status: "idle",
          inputPrompt:
            "How can teams migrate from REST APIs to event-driven architectures without downtime?",
          educationalNote: "Feeds raw prompt parameters or user queries into the workflow.",
        },
      },
      {
        id: "node-prompt-template",
        type: "promptTemplate",
        position: { x: 380, y: 180 },
        data: {
          label: "2. Prompt Template",
          status: "idle",
          template:
            "You are a Principal Software Architect. Synthesize a 3-stage migration plan for the following requirement:\n\n{{input}}\n\nBe concise, technical, and list concrete risks.",
          variables: ["input"],
          educationalNote: "Interpolates upstream inputs into {{variables}} syntax.",
        },
      },
      {
        id: "node-llm-run",
        type: "llmRun",
        position: { x: 720, y: 180 },
        data: {
          label: "3. LLM Run (Gemini Flash)",
          status: "idle",
          model: "gemini-1.5-flash",
          temperature: 0.7,
          educationalNote: "Invokes the central execution engine with telemetry and token counting.",
        },
      },
      {
        id: "node-final-output",
        type: "finalOutput",
        position: { x: 1060, y: 180 },
        data: {
          label: "4. Final Output",
          status: "idle",
          educationalNote: "Terminal node displaying rendered results with copy & inspect tools.",
        },
      },
    ],
    edges: [
      {
        id: "e-input-to-template",
        source: "node-user-input",
        target: "node-prompt-template",
        animated: false,
        style: { stroke: "#00E5FF", strokeWidth: 2 },
      },
      {
        id: "e-template-to-llm",
        source: "node-prompt-template",
        target: "node-llm-run",
        animated: false,
        style: { stroke: "#FF7A1A", strokeWidth: 2 },
      },
      {
        id: "e-llm-to-output",
        source: "node-llm-run",
        target: "node-final-output",
        animated: false,
        style: { stroke: "#10B981", strokeWidth: 2 },
      },
    ],
  },
  {
    id: "template-automated-eval",
    name: "Chain with Automated Evaluation",
    description:
      "A 5-node quality auditing pipeline that passes model output into an automated rubric evaluation judge before reaching final output.",
    isTemplate: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nodes: [
      {
        id: "eval-user-input",
        type: "userInput",
        position: { x: 50, y: 180 },
        data: {
          label: "1. Security Question",
          status: "idle",
          inputPrompt:
            "Explain the difference between Symmetric and Asymmetric Cryptography to a junior engineer.",
          educationalNote: "Raw user inquiry to be explained.",
        },
      },
      {
        id: "eval-prompt-template",
        type: "promptTemplate",
        position: { x: 360, y: 180 },
        data: {
          label: "2. Educator Template",
          status: "idle",
          template:
            "You are a Senior Security Educator. Write a clear, beginner-friendly explanation for:\n\n{{input}}\n\nInclude key tradeoffs, performance implications, and one memorable analogy.",
          variables: ["input"],
          educationalNote: "Structures pedagogical constraints and persona.",
        },
      },
      {
        id: "eval-llm-run",
        type: "llmRun",
        position: { x: 680, y: 180 },
        data: {
          label: "3. LLM Draft Generator",
          status: "idle",
          model: "gemini-1.5-flash",
          temperature: 0.6,
          educationalNote: "Generates candidate educational response.",
        },
      },
      {
        id: "eval-evaluate-node",
        type: "evaluate",
        position: { x: 1000, y: 180 },
        data: {
          label: "4. Automated Rubric Judge",
          status: "idle",
          referenceCriteria:
            "Independent assessment across Clarity, Relevance, Correctness, and Constraint Following.",
          educationalNote: "Evaluates candidates against explicit non-combined rubrics.",
        },
      },
      {
        id: "eval-final-output",
        type: "finalOutput",
        position: { x: 1320, y: 180 },
        data: {
          label: "5. Audited Evaluation Report",
          status: "idle",
          educationalNote: "Presents both model output and rubric assessment breakdown.",
        },
      },
    ],
    edges: [
      {
        id: "e2-1-2",
        source: "eval-user-input",
        target: "eval-prompt-template",
        animated: false,
        style: { stroke: "#00E5FF", strokeWidth: 2 },
      },
      {
        id: "e2-2-3",
        source: "eval-prompt-template",
        target: "eval-llm-run",
        animated: false,
        style: { stroke: "#FF7A1A", strokeWidth: 2 },
      },
      {
        id: "e2-3-4",
        source: "eval-llm-run",
        target: "eval-evaluate-node",
        animated: false,
        style: { stroke: "#A855F7", strokeWidth: 2 },
      },
      {
        id: "e2-4-5",
        source: "eval-evaluate-node",
        target: "eval-final-output",
        animated: false,
        style: { stroke: "#10B981", strokeWidth: 2 },
      },
    ],
  },
  {
    id: "template-summarize-translate",
    name: "Summarize & Translate Multi-Step Pipeline",
    description:
      "A 6-node chained workflow: takes an incident report, condenses it to executive points, then feeds the summary into a second translation prompt.",
    isTemplate: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nodes: [
      {
        id: "st-input",
        type: "userInput",
        position: { x: 40, y: 180 },
        data: {
          label: "1. Incident Log Text",
          status: "idle",
          inputPrompt:
            "At 14:22 UTC, the database connection pool reached maximum capacity due to unindexed queries triggered by a sudden surge in analytics traffic. Engineers implemented query caching, increased pool size by 40%, and added an index on created_at, restoring service health at 14:38 UTC.",
          educationalNote: "Input payload containing technical incident notes.",
        },
      },
      {
        id: "st-template-1",
        type: "promptTemplate",
        position: { x: 330, y: 180 },
        data: {
          label: "2. Exec Summary Prompt",
          status: "idle",
          template:
            "Extract an executive root-cause summary in exactly 2 concise bullet points from this incident report:\n\n{{input}}",
          variables: ["input"],
          educationalNote: "Stage 1 prompt template.",
        },
      },
      {
        id: "st-llm-1",
        type: "llmRun",
        position: { x: 630, y: 180 },
        data: {
          label: "3. LLM Summarizer",
          status: "idle",
          model: "gemini-1.5-flash",
          temperature: 0.3,
          educationalNote: "Runs extraction stage.",
        },
      },
      {
        id: "st-template-2",
        type: "promptTemplate",
        position: { x: 930, y: 180 },
        data: {
          label: "4. Localization Prompt",
          status: "idle",
          template:
            "Translate the following executive incident summary into professional, idiomatic Spanish for the global operations center:\n\n{{input}}",
          variables: ["input"],
          educationalNote: "Stage 2 prompt template chaining from Stage 1 output.",
        },
      },
      {
        id: "st-llm-2",
        type: "llmRun",
        position: { x: 1240, y: 180 },
        data: {
          label: "5. LLM Translator",
          status: "idle",
          model: "gemini-1.5-flash",
          temperature: 0.3,
          educationalNote: "Runs translation stage.",
        },
      },
      {
        id: "st-output",
        type: "finalOutput",
        position: { x: 1540, y: 180 },
        data: {
          label: "6. Localized Executive Brief",
          status: "idle",
          educationalNote: "Final output delivered in Spanish.",
        },
      },
    ],
    edges: [
      {
        id: "e3-1-2",
        source: "st-input",
        target: "st-template-1",
        animated: false,
        style: { stroke: "#00E5FF", strokeWidth: 2 },
      },
      {
        id: "e3-2-3",
        source: "st-template-1",
        target: "st-llm-1",
        animated: false,
        style: { stroke: "#FF7A1A", strokeWidth: 2 },
      },
      {
        id: "e3-3-4",
        source: "st-llm-1",
        target: "st-template-2",
        animated: false,
        style: { stroke: "#00E5FF", strokeWidth: 2 },
      },
      {
        id: "e3-4-5",
        source: "st-template-2",
        target: "st-llm-2",
        animated: false,
        style: { stroke: "#FF7A1A", strokeWidth: 2 },
      },
      {
        id: "e3-5-6",
        source: "st-llm-2",
        target: "st-output",
        animated: false,
        style: { stroke: "#10B981", strokeWidth: 2 },
      },
    ],
  },
];
