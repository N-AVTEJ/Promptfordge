import * as fs from "node:fs";
import * as path from "node:path";
import { LESSON_ENRICHMENT } from "./enrich-curriculum";
import type { VideoSource, Chapter } from "./modules-data/types";

const UDIW_CHAPTERS: Chapter[] = [
  { time: 0, label: "Intro" },
  { time: 20, label: "Prompt Engineering Basics" },
  { time: 63, label: "What is Prompt Engineering" },
  { time: 123, label: "Output Length" },
  { time: 259, label: "Sampling Controls (Top K & Top P)" },
  { time: 480, label: "Zero Shot Prompting" },
  { time: 556, label: "One Shot Prompting" },
  { time: 689, label: "System Messages & Role Assignment" },
  { time: 879, label: "Step Back Prompting" },
  { time: 1042, label: "Chain of Thought Reasoning" },
  { time: 1249, label: "Self Consistency" },
  { time: 1429, label: "Tree of Thought" },
  { time: 1618, label: "ReAct Framework" },
  { time: 1860, label: "Best Practices & Wrap-up" },
];

// Helper to attach chapters and metadata to uDIW34h8cmM wherever it appears
function patchUdiw(v: VideoSource) {
  if (v.id === "uDIW34h8cmM") {
    v.chapters = UDIW_CHAPTERS;
    v.covers = v.covers.filter((c) => c !== "APE" && c !== "APE overview");
  }
}

// 1. Patch all uDIW34h8cmM instances across all lessons
for (const lesson of Object.values(LESSON_ENRICHMENT)) {
  for (const v of lesson.videos) {
    patchUdiw(v);
  }
}

// 2. M2 Lesson 5: Add Jeff Su jC4v5AS4RIM covering "Instruction based"
const m2l5 = LESSON_ENRICHMENT["mod-02-les-05"];
if (m2l5) {
  const jeffSu: VideoSource = {
    id: "jC4v5AS4RIM",
    title: "Master the Perfect ChatGPT Prompt Formula (in just 8 minutes)!",
    channel: "Jeff Su",
    minutes: 8,
    covers: ["Instruction based"],
    level: "beginner",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Walks through the core formula for clear AI instructions covering task, context, and format.",
    reviewed: true,
  };
  // Ensure beginner video is primary or added
  m2l5.videos = [jeffSu, ...m2l5.videos.filter((v) => v.id !== "jC4v5AS4RIM")];
  m2l5.youtubeId = jeffSu.id;
  m2l5.status = "ok";
}

// M2 Lesson 7: Constraint based (ugxPshXr7Ro)
const m2l7 = LESSON_ENRICHMENT["mod-02-les-07"];
if (m2l7) {
  for (const v of m2l7.videos) {
    if (v.id === "ugxPshXr7Ro") {
      v.level = "beginner";
      v.whyThisVideo = "Tutorial breaking down 5 types of constraints and practical techniques for implementing limitations that enhance precision when prompting large language models.";
      v.reviewed = true;
    }
  }
}

// 3. M3 Lesson 1: Add AppliedAI 7vJluo_FI3I covering "Contextual"
const m3l1 = LESSON_ENRICHMENT["mod-03-les-01"];
if (m3l1) {
  const appliedAi: VideoSource = {
    id: "7vJluo_FI3I",
    title: "Understanding In-Context Learning: What It Is and How It Works",
    channel: "AppliedAI",
    minutes: 4,
    covers: ["Contextual"],
    level: "beginner",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Explores in-context learning as a fundamental prompting technique that enables models to adapt to context.",
    reviewed: true,
  };
  m3l1.videos = [appliedAi, ...m3l1.videos.filter((v) => v.id !== "7vJluo_FI3I")];
  m3l1.youtubeId = appliedAi.id;
  m3l1.status = "ok";
}

// M3 Lesson 2 & 3: Delimiters & Structured (zrp3Lr5eeFc)
for (const lId of ["mod-03-les-02", "mod-03-les-03"]) {
  const l = LESSON_ENRICHMENT[lId];
  if (l) {
    for (const v of l.videos) {
      if (v.id === "zrp3Lr5eeFc") {
        v.whyThisVideo = "Explains how headings, delimiters and semantic XML tags create clear boundaries, reduce ambiguity and make complex prompts easier to build, inspect and maintain.";
        v.reviewed = true;
      }
    }
  }
}

// M3 Lesson 4: Multi-prompt (OEQPss-UXhA)
const m3l4 = LESSON_ENRICHMENT["mod-03-les-04"];
if (m3l4) {
  for (const v of m3l4.videos) {
    if (v.id === "OEQPss-UXhA") {
      v.whyThisVideo = "Teaches how to structure complex tasks into multistep prompt interactions and orchestrate workflows step by step.";
      v.reviewed = true;
    }
  }
}

// 4. M4 Lesson 2: Prompt chaining (KwC8bUZrUKA)
const m4l2 = LESSON_ENRICHMENT["mod-04-les-02"];
if (m4l2) {
  for (const v of m4l2.videos) {
    if (v.id === "KwC8bUZrUKA") {
      v.whyThisVideo = "Explores how multiple Large Language Model prompts can be connected into intelligent workflows where each output becomes the next input.";
      v.reviewed = true;
    }
  }
}

// 5. M5 Lesson 1: Add FreeAcademy AI 3SPnv0ufR8Y covering "Iterative refinement"
const m5l1 = LESSON_ENRICHMENT["mod-05-les-01"];
if (m5l1) {
  const freeAcad: VideoSource = {
    id: "3SPnv0ufR8Y",
    title: "Iterative Refinement: How to Improve AI Prompts Step by Step",
    channel: "FreeAcademy AI",
    minutes: 6,
    covers: ["Iterative refinement"],
    level: "beginner",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Walks through the iteration cycle, common refinement patterns, and systematic ways to improve prompts step by step.",
    reviewed: true,
  };
  m5l1.videos = [freeAcad, ...m5l1.videos.filter((v) => v.id !== "3SPnv0ufR8Y")];
  m5l1.youtubeId = freeAcad.id;
  m5l1.status = "ok";
}

// M5 Lesson 4, 5, 6 agent-search reviews
for (const [lId, vId, why] of [
  ["mod-05-les-04", "yu27PWzJI_Y", "Explains prompt tuning as an efficient, low-cost method of adapting an AI foundation model to downstream tasks without retraining weights."],
  ["mod-05-les-05", "RTaZqGflrJ8", "Breaks down LLM evaluation for beginners with simple examples of BLEU, ROUGE, and BERTScore across the evaluation pipeline."],
  ["mod-05-les-06", "ZFKvTIADp0k", "IBM Distinguished Engineer Suj Perepa explains why AI hallucination occurs and demonstrates prompting techniques to contain it."],
]) {
  const l = LESSON_ENRICHMENT[lId];
  if (l) {
    for (const v of l.videos) {
      if (v.id === vId) {
        v.whyThisVideo = why;
        v.reviewed = true;
      }
    }
  }
}

// 6. M6 Lesson 3: Move J51oZYcNvP8 Cross-model to relatedTo, add IBM Technology sWH0T4Zez6I
const m6l3 = LESSON_ENRICHMENT["mod-06-les-03"];
if (m6l3) {
  const ibmMulti: VideoSource = {
    id: "sWH0T4Zez6I",
    title: "Multi Agent Systems Explained: How AI Agents & LLMs Work Together",
    channel: "IBM Technology",
    minutes: 8,
    covers: ["Cross-model AI interaction"],
    level: "intermediate",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Explains how multiple LLMs and AI agents collaborate, exchange state, and divide work across systems.",
    reviewed: true,
  };
  for (const v of m6l3.videos) {
    if (v.id === "J51oZYcNvP8") {
      v.covers = v.covers.filter((c) => c !== "Cross-model AI interaction");
      v.relatedTo = [...(v.relatedTo || []), "Cross-model AI interaction"];
    }
  }
  m6l3.videos = [ibmMulti, ...m6l3.videos.filter((v) => v.id !== "sWH0T4Zez6I")];
  m6l3.youtubeId = ibmMulti.id;
  m6l3.status = "ok";
}

// 7. M8 Lesson 2, 3, 4:
// - zn2ukSnDqSg review
const m8l2 = LESSON_ENRICHMENT["mod-08-les-02"];
if (m8l2) {
  for (const v of m8l2.videos) {
    if (v.id === "zn2ukSnDqSg") {
      v.whyThisVideo = "Security researcher Dr Tim Muller explores how large language models can be jailbroken and manipulated for unintended purposes.";
      v.reviewed = true;
    }
  }
}

// - Remove "Safe prompt design" from _9x-mAHGgC4 and gZTQNb0NGjM
for (const lId of ["mod-08-les-03", "mod-08-les-04"]) {
  const l = LESSON_ENRICHMENT[lId];
  if (l) {
    for (const v of l.videos) {
      if (v.id === "_9x-mAHGgC4" || v.id === "gZTQNb0NGjM") {
        v.covers = v.covers.filter((c) => c !== "Safe prompt design");
        if (!v.relatedTo) v.relatedTo = [];
        if (!v.relatedTo.includes("Safe prompt design")) {
          v.relatedTo.push("Safe prompt design");
        }
      }
    }
  }
}

// - Add Probably Private q-4zKTR9m3g covering "Safe prompt design"
const m8l4 = LESSON_ENRICHMENT["mod-08-les-04"];
if (m8l4) {
  const probablyPrivate: VideoSource = {
    id: "q-4zKTR9m3g",
    title: "AI Security Mini-Course: Defending against Prompt Injections (spotlighting, alignment checks, etc)",
    channel: "Probably Private",
    minutes: 22,
    covers: ["Safe prompt design"],
    level: "intermediate",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Explores defense strategies against prompt injection including spotlighting, instruction hierarchy, and guardrails.",
    reviewed: true,
  };
  m8l4.videos = [probablyPrivate, ...m8l4.videos.filter((v) => v.id !== "q-4zKTR9m3g")];
  m8l4.youtubeId = probablyPrivate.id;
  m8l4.status = "ok";
}

// 8. M9 Lesson 2, 3, 4 agent-search reviews
for (const [lId, vId, why] of [
  ["mod-09-les-02", "GxlOoKI0zxg", "Demonstrates proven prompt engineering principles and structured formulas tailored for teachers and educational workflows."],
  ["mod-09-les-03", "QRgayVF5PyM", "Breaks down how to design prompts that drive consistent results, trigger automated actions, and scale business operations."],
  ["mod-09-les-04", "U8zrqWrTYdc", "Provides actionable prompt templates for academic research from literature reviews to methodology drafting."],
]) {
  const l = LESSON_ENRICHMENT[lId];
  if (l) {
    for (const v of l.videos) {
      if (v.id === vId) {
        v.whyThisVideo = why;
        v.reviewed = true;
      }
    }
  }
}

// 9. M10 Lesson 1, 2, 3, 4, 5:
// M10 Lesson 2: Active prompting (wcmLgy1-9aQ) review
const m10l2 = LESSON_ENRICHMENT["mod-10-les-02"];
if (m10l2) {
  for (const v of m10l2.videos) {
    if (v.id === "wcmLgy1-9aQ") {
      v.whyThisVideo = "Explores how Active Prompting improves AI reasoning by identifying model uncertainty and selectively requesting human examples.";
      v.reviewed = true;
    }
  }
}

// M10 Lesson 4: g5h-piquf_k move "Expert prompting" to relatedTo with note
const m10l4 = LESSON_ENRICHMENT["mod-10-les-04"];
if (m10l4) {
  for (const v of m10l4.videos) {
    if (v.id === "g5h-piquf_k") {
      v.covers = v.covers.filter((c) => c !== "Expert prompting");
      v.relatedTo = ["Expert prompting"];
      v.notes = "Critical perspective on expert personas";
      v.whyThisVideo = "Dives into token space mechanics to evaluate whether telling an LLM it is an expert persona measurably improves response quality.";
      v.reviewed = true;
    }
  }
}

// M10 Lesson 5: APE resolution with Andrei Muresanu OmTdkNEr2nU
const m10l5 = LESSON_ENRICHMENT["mod-10-les-05"];
if (m10l5) {
  const apeAuthorVid: VideoSource = {
    id: "OmTdkNEr2nU",
    title: "Large Language Models Are Human-Level Prompt Engineers (Automatic Prompt Engineer - APE)",
    channel: "Andrei Muresanu",
    minutes: 5,
    covers: ["APE"],
    level: "advanced",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Paper author explains the Automatic Prompt Engineer (APE) framework for automated instruction generation and selection.",
    reviewed: true,
  };
  m10l5.videos = [apeAuthorVid, ...m10l5.videos.filter((v) => v.id !== "OmTdkNEr2nU")];
  m10l5.youtubeId = apeAuthorVid.id;
  m10l5.status = "ok";
}

// 10. M11:
// - Lesson 1: Add Duke Center for Computational Thinking MKqg6wzOySA (beginner agent loops)
const m11l1 = LESSON_ENRICHMENT["mod-11-les-01"];
if (m11l1) {
  const dukeAgent: VideoSource = {
    id: "MKqg6wzOySA",
    title: "Key 5 - AI Agents Explained: Plan, Act, Observe Loop & Real Risks",
    channel: "Duke Center for Computational Thinking",
    minutes: 16,
    covers: ["Agent loops (plan, act, observe)"],
    level: "beginner",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Explains what makes a system agentic through the foundational Plan, Act, Observe loop.",
    reviewed: true,
  };
  m11l1.videos = [dukeAgent, ...m11l1.videos.filter((v) => v.id !== "MKqg6wzOySA")];
  m11l1.youtubeId = dukeAgent.id;
  m11l1.status = "ok";
}

// - Lesson 3: 7j1t3UZA1TY remove Memory, add Martin Keen BacJ6sEhqMo
const m11l3 = LESSON_ENRICHMENT["mod-11-les-03"];
if (m11l3) {
  for (const v of m11l3.videos) {
    if (v.id === "7j1t3UZA1TY") {
      v.covers = v.covers.filter((c) => c !== "Memory" && c !== "Memory and tool protocols");
      v.covers.push("Tool protocols and MCP discovery");
    }
  }
  const ibmMemory: VideoSource = {
    id: "BacJ6sEhqMo",
    title: "The Four Types of Memory Every AI Agent Needs",
    channel: "IBM Technology",
    minutes: 11,
    covers: ["Memory and tool protocols"],
    level: "intermediate",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Martin Keen explains the four types of memory AI agents use, from short-term context buffers to long-term memory.",
    reviewed: true,
  };
  m11l3.videos = [ibmMemory, ...m11l3.videos.filter((v) => v.id !== "BacJ6sEhqMo")];
  m11l3.youtubeId = ibmMemory.id;
  m11l3.status = "ok";
}

// 11. M12:
// - Lesson 1: zYGDpG-pTho review
const m12l1 = LESSON_ENRICHMENT["mod-12-les-01"];
if (m12l1) {
  for (const v of m12l1.videos) {
    if (v.id === "zYGDpG-pTho") {
      v.whyThisVideo = "Martin Keen compares RAG, fine-tuning, and prompt engineering to guide when to extend knowledge versus refine responses.";
      v.reviewed = true;
    }
  }
}

// - Lesson 2: reuse vBJF2sy1Pyw and LZJTrAXcyFM in M12 covers
const m12l2 = LESSON_ENRICHMENT["mod-12-les-02"];
if (m12l2) {
  const qdrantJudge: VideoSource = {
    id: "vBJF2sy1Pyw",
    title: "The challenges with using LLM as a Judge",
    channel: "Qdrant Vector Space Talks",
    minutes: 20,
    covers: ["LLM-as-judge in production"],
    level: "advanced",
    status: "ok",
    resolvedBy: "seed",
    role: "core",
  };
  const lzjJudge: VideoSource = {
    id: "LZJTrAXcyFM",
    title: "Building an LLM-as-a-Judge Evaluation Pipeline",
    channel: "Prompt Engineering Lab",
    minutes: 15,
    covers: ["LLM-as-judge in production"],
    level: "advanced",
    status: "ok",
    resolvedBy: "seed",
    role: "optional",
  };
  m12l2.videos = [qdrantJudge, lzjJudge];
  m12l2.youtubeId = qdrantJudge.id;
  m12l2.status = "ok";
}

// - Lesson 3: DNmIqNjbKoM review
const m12l3 = LESSON_ENRICHMENT["mod-12-les-03"];
if (m12l3) {
  for (const v of m12l3.videos) {
    if (v.id === "DNmIqNjbKoM") {
      v.whyThisVideo = "Explores how to version, test, and validate prompts in production AI so outputs remain stable and reproducible.";
      v.reviewed = true;
    }
  }
}

// - Lesson 4: l5K4r_TJz_8 review + add u57EnkQaUTY (prompt caching)
const m12l4 = LESSON_ENRICHMENT["mod-12-les-04"];
if (m12l4) {
  for (const v of m12l4.videos) {
    if (v.id === "l5K4r_TJz_8") {
      v.whyThisVideo = "Demonstrates how to implement contextual grounding checks and guardrails to detect hallucinations in production applications.";
      v.reviewed = true;
    }
  }
  const promptCachingVid: VideoSource = {
    id: "u57EnkQaUTY",
    title: "What is Prompt Caching? Optimize LLM Latency with AI Transformers",
    channel: "IBM Technology",
    minutes: 9,
    covers: ["Guardrails, cost, latency, caching"],
    level: "intermediate",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Explains how prompt caching works with AI transformers to cut cost and reduce LLM inference latency.",
    reviewed: true,
  };
  m12l4.videos = [promptCachingVid, ...m12l4.videos.filter((v) => v.id !== "u57EnkQaUTY")];
}

// - Lesson 5: Add yh-3WU1FKrk covering Bias, safety, governance
const m12l5 = LESSON_ENRICHMENT["mod-12-les-05"];
if (m12l5) {
  const respAiVid: VideoSource = {
    id: "yh-3WU1FKrk",
    title: "What is Responsible AI? A Guide to AI Governance",
    channel: "IBM Technology",
    minutes: 6,
    covers: ["Bias, safety, governance"],
    level: "beginner",
    status: "ok",
    resolvedBy: "agent-search",
    role: "core",
    whyThisVideo: "Provides an essential guide to Responsible AI principles, risk minimization, and AI governance frameworks.",
    reviewed: true,
  };
  m12l5.videos = [respAiVid, ...m12l5.videos.filter((v) => v.id !== "yh-3WU1FKrk")];
  m12l5.youtubeId = respAiVid.id;
  m12l5.status = "ok";
}

// Write the updated LESSON_ENRICHMENT object back to scripts/enrich-curriculum.ts
const header = `import * as fs from "node:fs";
import * as path from "node:path";
import type { VideoSource, CheckYourself } from "./modules-data/types";

export interface LessonEnrichment {
  beforeYouWatch: [string, string];
  checkYourself: CheckYourself;
  videos: VideoSource[];
  youtubeId: string;
  status: "ok" | "slot" | "unavailable";
}

export const LESSON_ENRICHMENT: Record<string, LessonEnrichment> = ${JSON.stringify(LESSON_ENRICHMENT, null, 2)};
`;

fs.writeFileSync(path.resolve(process.cwd(), "scripts/enrich-curriculum.ts"), header, "utf8");
console.log("Successfully wrote updated scripts/enrich-curriculum.ts");
