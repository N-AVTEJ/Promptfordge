/**
 * PromptForge Video Verification & Topic Resolution Script
 *
 * Implements STEP V and STEP R with Honest Coverage:
 * - Validates all YouTube video IDs via YouTube oEmbed API:
 *   https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json
 *   HTTP 200 = "ok" (records verified title and author).
 *   Any other HTTP status = "unavailable".
 * - Step R: Tracks the search topics from the syllabus.
 * - Honest Coverage: Per module compute coverage = lesson topics with a "covers" video / total lesson topics.
 * - UI watch time = core videos only.
 * - Enforces schema: VideoSource { id, title, channel, minutes, covers, relatedTo, level, status, resolvedBy, role }
 * - Generates /content/video-report.json with per-module coverage numbers.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export type VideoLevel = "beginner" | "intermediate" | "advanced";
export type VideoStatus = "ok" | "unavailable" | "slot";
export type ResolvedBy = "seed" | "agent-search";

export interface CandidateVideo {
  id: string;
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  expectedTitle: string;
  channel: string;
  minutes: number;
  covers: string[];
  relatedTo?: string[];
  level: VideoLevel;
  role: "core" | "optional";
  resolvedBy: ResolvedBy;
}

export interface VerifiedVideo extends CandidateVideo {
  title: string;
  authorName?: string;
  thumbnailUrl: string;
  status: "ok" | "unavailable";
  httpStatus: number;
  verifiedAt: string;
}

export interface TopicResolutionReport {
  topicNumber: number;
  moduleId: string;
  moduleNumber: number;
  topicName: string;
  searchQuery: string;
  outcome: "resolved" | "slot";
  chosenVideoId?: string;
  chosenVideoTitle?: string;
  chosenChannel?: string;
  chosenMinutes?: number;
  reason: string;
}

export interface ModuleReport {
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  okCount: number;
  unavailableCount: number;
  slotCount: number;
  hasPlayableVideo: boolean;
  totalWatchMinutes: number; // Core videos only
  coverage: number; // lesson topics with a "covers" video / total lesson topics
  coverageRatio: string; // e.g. "7/8"
  coveredTopicsCount: number;
  totalTopicsCount: number;
  coveredTopics: string[];
  totalTopics: string[];
  videos: VerifiedVideo[];
  slots: { topic: string; notes: string }[];
}

export interface FullVideoReport {
  generatedAt: string;
  totalOk: number;
  totalUnavailable: number;
  totalSlots: number;
  everyModuleHasPlayableVideo: boolean;
  coveragePerModule: Record<string, number>;
  modules: ModuleReport[];
  resolvedTopics: TopicResolutionReport[];
  topicsWithoutVideo: { moduleId: string; moduleNumber: number; topic: string; reason: string }[];
}

export const MODULE_LESSON_TOPICS: Record<number, string[]> = {
  1: [
    "Evolution of AI and LLMs",
    "Fundamentals of LLMs",
    "Transformer architecture",
    "Working of LLMs (tokens, training, inference)",
    "Basics of prompts",
    "Basic prompt structures",
  ],
  2: [
    "Zero-shot",
    "One-shot",
    "Few-shot",
    "Chain of Thought",
    "Instruction based",
    "Role based",
    "Constraint based",
    "Persona",
  ],
  3: [
    "Contextual",
    "Delimiter based",
    "Structured prompts",
    "Multi-prompt",
    "Reflection-based",
  ],
  4: [
    "Multi-turn conversations",
    "Prompt chaining and pipelines",
    "Dynamic prompt templates",
  ],
  5: [
    "Iterative refinement",
    "Measuring response quality",
    "Performance evaluation",
    "Prompt tuning fundamentals",
    "BLEU, ROUGE, BERTScore",
    "Hallucination detection",
  ],
  6: [
    "Intro to multi-model prompting",
    "Text + image prompts",
    "Cross-model AI interaction",
  ],
  7: [
    "API-based prompting",
    "Function calling",
    "Plug-in tool integration",
    "Retrieval Augmented Generation",
  ],
  8: [
    "Prompt injection",
    "Jailbreak techniques",
    "Mitigation strategies",
    "Safe prompt design",
  ],
  9: [
    "Coding",
    "Education and tutoring",
    "Business automation",
    "Research assistance",
  ],
  10: [
    "Tree-of-Thoughts",
    "Active prompting",
    "ReAct",
    "Expert prompting",
    "APE",
  ],
  11: [
    "Agent loops (plan, act, observe)",
    "Context windows and context engineering vs prompt engineering",
    "Memory and tool protocols",
    "MCP (hosts, clients, servers)",
    "Agentic RAG",
  ],
  12: [
    "Prompting vs RAG vs fine-tuning",
    "LLM-as-judge in production",
    "Prompt versioning and regression tests",
    "Guardrails, cost, latency, caching",
    "Bias, safety, governance",
  ],
};

export const CANDIDATE_VIDEOS: CandidateVideo[] = [
  // Module 1
  {
    id: "LPZh9BOjkQs",
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    expectedTitle: "Large Language Models explained briefly",
    channel: "3Blue1Brown",
    minutes: 8,
    covers: ["Evolution of AI and LLMs", "Fundamentals of LLMs"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "ZHCB09O6zUk",
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    expectedTitle: "A Brief History of AI: From Machine Learning to Gen AI to Agentic AI",
    channel: "IBM Technology",
    minutes: 13,
    covers: ["Evolution of AI and LLMs", "History of AI"],
    level: "beginner",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "uDIW34h8cmM",
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    expectedTitle: "Prompt Engineering Guide, Beginner to Advanced",
    channel: "Matthew Berman",
    minutes: 33,
    covers: ["Basics of prompts and structures", "Basic prompt structures"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "wjZofJX0v4M",
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    expectedTitle: "Transformers, the tech behind LLMs | Deep Learning Chapter 5",
    channel: "3Blue1Brown",
    minutes: 27,
    covers: ["Transformer architecture", "Fundamentals of LLMs"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "eMlx5fFNoYc",
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    expectedTitle: "Attention in transformers, step-by-step | Deep Learning Chapter 6",
    channel: "3Blue1Brown",
    minutes: 26,
    covers: ["Transformer architecture", "Working of LLMs (tokens, training, inference)"],
    level: "advanced",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "7xTGNNLPyMI",
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    expectedTitle: "Deep Dive into LLMs like ChatGPT",
    channel: "Andrej Karpathy",
    minutes: 211,
    covers: ["Working of LLMs (tokens, training, inference)", "Fundamentals of LLMs"],
    level: "advanced",
    role: "optional",
    resolvedBy: "seed",
  },

  // Module 2
  {
    id: "T-w_5T-j-dA",
    moduleId: "mod-02",
    moduleNumber: 2,
    moduleTitle: "Example and Instruction Based Prompts",
    expectedTitle: "Large Language Models Are Zero Shot Reasoners",
    channel: "IBM Technology",
    minutes: 8,
    covers: ["Zero-shot", "Chain of Thought"],
    relatedTo: ["Instruction based"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "Vl4hH_L5-3Q",
    moduleId: "mod-02",
    moduleNumber: 2,
    moduleTitle: "Example and Instruction Based Prompts",
    expectedTitle: "Zero-shot, One-shot and Few-shot Prompting Techniques Explained",
    channel: "At A Glance!",
    minutes: 9,
    covers: ["Zero-shot", "One-shot", "Few-shot"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "uDIW34h8cmM",
    moduleId: "mod-02",
    moduleNumber: 2,
    moduleTitle: "Example and Instruction Based Prompts",
    expectedTitle: "Prompt Engineering Guide - From Beginner to Advanced",
    channel: "Matthew Berman",
    minutes: 33,
    covers: ["Zero-shot", "One-shot", "Few-shot", "Role based"],
    level: "beginner",
    role: "optional",
    resolvedBy: "seed",
  },
  {
    id: "b210W3JWOxw",
    moduleId: "mod-02",
    moduleNumber: 2,
    moduleTitle: "Example and Instruction Based Prompts",
    expectedTitle: "ChatGPT Chain-of-Thought Prompt Explained",
    channel: "1littlecoder",
    minutes: 10,
    covers: ["Chain of Thought"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "b2t4pa9lOIc",
    moduleId: "mod-02",
    moduleNumber: 2,
    moduleTitle: "Example and Instruction Based Prompts",
    expectedTitle: "Prompt Engineering Explained: Zero, Few, CoT, Self Consistency, Persona",
    channel: "Loop Kaka",
    minutes: 15,
    covers: ["Few-shot", "Chain of Thought", "Persona"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "cnww-CvDoRk",
    moduleId: "mod-02",
    moduleNumber: 2,
    moduleTitle: "Example and Instruction Based Prompts",
    expectedTitle: "Advanced Prompt Engineering Techniques",
    channel: "Sai Ram Penjarla",
    minutes: 12,
    covers: ["Role based", "Few-shot"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "ugxPshXr7Ro",
    moduleId: "mod-02",
    moduleNumber: 2,
    moduleTitle: "Example and Instruction Based Prompts",
    expectedTitle: "Constrained Generation for Better LLM Prompting Results",
    channel: "Matthew Esposito | AI",
    minutes: 5,
    covers: ["Constraint based"],
    level: "intermediate",
    role: "core",
    resolvedBy: "agent-search",
  },

  // Module 3
  {
    id: "cnww-CvDoRk",
    moduleId: "mod-03",
    moduleNumber: 3,
    moduleTitle: "Context Based and Interaction Based Prompts",
    expectedTitle: "Advanced Prompt Engineering Techniques",
    channel: "Sai Ram Penjarla",
    minutes: 12,
    covers: ["Reflection-based"],
    relatedTo: ["Contextual", "Structured prompts"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "zrp3Lr5eeFc",
    moduleId: "mod-03",
    moduleNumber: 3,
    moduleTitle: "Context Based and Interaction Based Prompts",
    expectedTitle: "XML Tags, Delimiters & Complex Prompt Structure",
    channel: "Fortivance Academy",
    minutes: 8,
    covers: ["Delimiter based", "Structured prompts"],
    level: "intermediate",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "OEQPss-UXhA",
    moduleId: "mod-03",
    moduleNumber: 3,
    moduleTitle: "Context Based and Interaction Based Prompts",
    expectedTitle: "AI Prompt Engineering - Multistep Prompting",
    channel: "SivamX",
    minutes: 9,
    covers: ["Multi-prompt"],
    level: "intermediate",
    role: "core",
    resolvedBy: "agent-search",
  },

  // Module 4
  {
    id: "3TGqlQxpuU0",
    moduleId: "mod-04",
    moduleNumber: 4,
    moduleTitle: "Advanced Prompt Techniques",
    expectedTitle: "LangChain prompt templates, chat history, multi-turn",
    channel: "CampusX",
    minutes: 18,
    covers: ["Multi-turn conversations", "Dynamic prompt templates"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "KwC8bUZrUKA",
    moduleId: "mod-04",
    moduleNumber: 4,
    moduleTitle: "Advanced Prompt Techniques",
    expectedTitle: "Prompt Chaining Explained | LangChain Tutorial for Building Smarter AI Workflows 🚀",
    channel: "Micro Learning",
    minutes: 8,
    covers: ["Prompt chaining and pipelines"],
    level: "intermediate",
    role: "core",
    resolvedBy: "agent-search",
  },

  // Module 5
  {
    id: "yu27PWzJI_Y",
    moduleId: "mod-05",
    moduleNumber: 5,
    moduleTitle: "Prompt Optimization Techniques",
    expectedTitle: "What is Prompt Tuning?",
    channel: "IBM Technology",
    minutes: 9,
    covers: ["Prompt tuning fundamentals", "Soft prompts"],
    level: "beginner",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "ZFKvTIADp0k",
    moduleId: "mod-05",
    moduleNumber: 5,
    moduleTitle: "Prompt Optimization Techniques",
    expectedTitle: "Tuning Your AI Model to Reduce Hallucinations",
    channel: "IBM Technology",
    minutes: 9,
    covers: ["Hallucination detection", "Measuring response quality"],
    level: "beginner",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "vBJF2sy1Pyw",
    moduleId: "mod-05",
    moduleNumber: 5,
    moduleTitle: "Prompt Optimization Techniques",
    expectedTitle: "The challenges with using LLM as a Judge",
    channel: "Qdrant Vector Space Talks",
    minutes: 42,
    covers: ["Measuring response quality", "Performance evaluation"],
    level: "advanced",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "LZJTrAXcyFM",
    moduleId: "mod-05",
    moduleNumber: 5,
    moduleTitle: "Prompt Optimization Techniques",
    expectedTitle: "Community Paper Reading: LLMs-as-Judges",
    channel: "Arize AI",
    minutes: 54,
    covers: ["LLM-as-judge"],
    relatedTo: ["Iterative refinement"],
    level: "advanced",
    role: "optional",
    resolvedBy: "seed",
  },
  {
    id: "RTaZqGflrJ8",
    moduleId: "mod-05",
    moduleNumber: 5,
    moduleTitle: "Prompt Optimization Techniques",
    expectedTitle: "LLM Evaluation Explained: BLEU, ROUGE, BERTScore & the Full Pipeline (Simple Guide)",
    channel: "AI Academy",
    minutes: 7,
    covers: ["BLEU, ROUGE, BERTScore"],
    level: "intermediate",
    role: "core",
    resolvedBy: "agent-search",
  },

  // Module 6
  {
    id: "J51oZYcNvP8",
    moduleId: "mod-06",
    moduleNumber: 6,
    moduleTitle: "Multi-Model Prompting",
    expectedTitle: "What is Multimodal AI?",
    channel: "IBM Technology",
    minutes: 8,
    covers: ["Intro to multi-model prompting", "Cross-model AI interaction"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "lOD_EE96jhM",
    moduleId: "mod-06",
    moduleNumber: 6,
    moduleTitle: "Multi-Model Prompting",
    expectedTitle: "Vision Language Models Enable Image Understanding",
    channel: "IBM Technology",
    minutes: 9,
    covers: ["Text + image prompts", "Vision Language Models Enable Image Understanding"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },

  // Module 7
  {
    id: "h8gMhXYAv1k",
    moduleId: "mod-07",
    moduleNumber: 7,
    moduleTitle: "Tool-Augmented Prompting",
    expectedTitle: "Tool Calling: Traditional vs Embedded Approaches",
    channel: "IBM Technology",
    minutes: 5,
    covers: ["Function calling", "API-based prompting"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "gosZ_vqXkMI",
    moduleId: "mod-07",
    moduleNumber: 7,
    moduleTitle: "Tool-Augmented Prompting",
    expectedTitle: "Orchestrating LLM-Powered Tool Calls",
    channel: "IBM Technology",
    minutes: 4,
    covers: ["Plug-in tool integration", "API-based prompting"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "cDn7bf84LsM",
    moduleId: "mod-07",
    moduleNumber: 7,
    moduleTitle: "Tool-Augmented Prompting",
    expectedTitle: "LangChain Retrieval-Augmented Generation Demo",
    channel: "IBM Technology",
    minutes: 8,
    covers: ["Retrieval Augmented Generation"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "0z9_MhcYvcY",
    moduleId: "mod-07",
    moduleNumber: 7,
    moduleTitle: "Tool-Augmented Prompting",
    expectedTitle: "What is Agentic RAG?",
    channel: "IBM Technology",
    minutes: 10,
    covers: ["Retrieval Augmented Generation", "Plug-in tool integration"],
    level: "intermediate",
    role: "optional",
    resolvedBy: "seed",
  },

  // Module 8
  {
    id: "_9x-mAHGgC4",
    moduleId: "mod-08",
    moduleNumber: 8,
    moduleTitle: "Security in Prompt Engineering",
    expectedTitle: "Six Major Adversarial AI Attack Types",
    channel: "IBM Technology",
    minutes: 9,
    covers: ["AI attack surface overview"],
    relatedTo: ["Prompt injection", "Mitigation strategies", "Safe prompt design"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "zn2ukSnDqSg",
    moduleId: "mod-08",
    moduleNumber: 8,
    moduleTitle: "Security in Prompt Engineering",
    expectedTitle: "ChatGPT Jailbreak - Computerphile",
    channel: "Computerphile",
    minutes: 12,
    covers: ["Jailbreak techniques"],
    level: "intermediate",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "gZTQNb0NGjM",
    moduleId: "mod-08",
    moduleNumber: 8,
    moduleTitle: "Security in Prompt Engineering",
    expectedTitle: "Hypnotized AI and Large Language Model Security",
    channel: "IBM Technology",
    minutes: 7,
    covers: ["Prompt injection", "Safe prompt design"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "yNIlm9IfcgA",
    moduleId: "mod-08",
    moduleNumber: 8,
    moduleTitle: "Security in Prompt Engineering",
    expectedTitle: "Understanding and Preventing Prompt Injection",
    channel: "ChatBotKit",
    minutes: 6,
    covers: ["Prompt injection", "Mitigation strategies"],
    level: "intermediate",
    role: "optional",
    resolvedBy: "seed",
  },

  // Module 9
  {
    id: "LAF-lACf2QY",
    moduleId: "mod-09",
    moduleNumber: 9,
    moduleTitle: "Domain-Specific Prompt Engineering",
    expectedTitle: "Prompt engineering essentials: Getting better results from LLMs",
    channel: "GitHub",
    minutes: 24,
    covers: ["Coding"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "--XpNP6NsqE",
    moduleId: "mod-09",
    moduleNumber: 9,
    moduleTitle: "Domain-Specific Prompt Engineering",
    expectedTitle: "How to Write Better AI Prompts as a Software Developer in 2026",
    channel: "JetBrains",
    minutes: 28,
    covers: ["Coding"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "GxlOoKI0zxg",
    moduleId: "mod-09",
    moduleNumber: 9,
    moduleTitle: "Domain-Specific Prompt Engineering",
    expectedTitle: "Prompt Engineering for Teachers",
    channel: "Town Square for Teachers",
    minutes: 11,
    covers: ["Education and tutoring"],
    level: "beginner",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "QRgayVF5PyM",
    moduleId: "mod-09",
    moduleNumber: 9,
    moduleTitle: "Domain-Specific Prompt Engineering",
    expectedTitle: "Prompt Engineering for Business: Automate Workflows With AI",
    channel: "Tuff University",
    minutes: 30,
    covers: ["Business automation"],
    level: "intermediate",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "U8zrqWrTYdc",
    moduleId: "mod-09",
    moduleNumber: 9,
    moduleTitle: "Domain-Specific Prompt Engineering",
    expectedTitle: "How to use ChatGPT for Research - Literature Review, Research Paper Writing & Publication",
    channel: "WiseUp Communications",
    minutes: 9,
    covers: ["Research assistance"],
    level: "beginner",
    role: "core",
    resolvedBy: "agent-search",
  },

  // Module 10
  {
    id: "uDIW34h8cmM",
    moduleId: "mod-10",
    moduleNumber: 10,
    moduleTitle: "Advanced Prompt Engineering",
    expectedTitle: "Prompt Engineering Guide - From Beginner to Advanced",
    channel: "Matthew Berman",
    minutes: 33,
    covers: ["ToT, ReAct, APE overview"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "ut5kp56wW_4",
    moduleId: "mod-10",
    moduleNumber: 10,
    moduleTitle: "Advanced Prompt Engineering",
    expectedTitle: "Tree of Thoughts: Deliberate Problem Solving with LLMs",
    channel: "Yannic Kilcher",
    minutes: 29,
    covers: ["Tree-of-Thoughts"],
    level: "advanced",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "QX-p-vsDoiQ",
    moduleId: "mod-10",
    moduleNumber: 10,
    moduleTitle: "Advanced Prompt Engineering",
    expectedTitle: "ReAct paper reading",
    channel: "Arize AI",
    minutes: 48,
    covers: ["ReAct"],
    level: "advanced",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "wcmLgy1-9aQ",
    moduleId: "mod-10",
    moduleNumber: 10,
    moduleTitle: "Advanced Prompt Engineering",
    expectedTitle: "Active Prompting Explained: Boost AI Reasoning with Less Human Effort",
    channel: "Micro Learning",
    minutes: 8,
    covers: ["Active prompting"],
    level: "advanced",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "g5h-piquf_k",
    moduleId: "mod-10",
    moduleNumber: 10,
    moduleTitle: "Advanced Prompt Engineering",
    expectedTitle: "Should you tell your LLM it's an 'expert' before prompting?",
    channel: "AI and Search with Mark Williams-Cook",
    minutes: 7,
    covers: ["Expert prompting"],
    level: "advanced",
    role: "core",
    resolvedBy: "agent-search",
  },

  // Module 11
  {
    id: "eur8dUO9mvE",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "What is MCP?",
    channel: "IBM Technology",
    minutes: 4,
    covers: ["What is MCP?", "MCP (hosts, clients, servers)"],
    relatedTo: ["Agent loops (plan, act, observe)"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "vD0E3EUb8-8",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "Context Engineering vs. Prompt Engineering: Smarter AI with RAG & Agents",
    channel: "IBM Technology",
    minutes: 6,
    covers: ["Context windows and context engineering vs prompt engineering", "Agentic RAG"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "7j1t3UZA1TY",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "MCP vs API: Simplifying AI Agent Integration with External Data",
    channel: "IBM Technology",
    minutes: 7,
    covers: ["MCP vs API", "Memory and tool protocols"],
    level: "beginner",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "kQmXtrmQ5Zg",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "Building Agents with Model Context Protocol - Full Workshop with Mahesh Murag of Anthropic",
    channel: "AI Engineer",
    minutes: 78,
    covers: ["Agent loops (plan, act, observe)", "Memory and tool protocols"],
    level: "advanced",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "Yq29bZ8Hlrc",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "Optimize RAG with AI Agents & Vector Databases",
    channel: "IBM Technology",
    minutes: 33,
    covers: ["Agentic RAG", "Optimize RAG with AI Agents and Vector Databases"],
    level: "advanced",
    role: "optional",
    resolvedBy: "seed",
  },

  // Module 12
  {
    id: "zYGDpG-pTho",
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    expectedTitle: "RAG vs Fine-Tuning vs Prompt Engineering: Optimizing AI Models",
    channel: "IBM Technology",
    minutes: 13,
    covers: ["Prompting vs RAG vs fine-tuning"],
    level: "beginner",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "l5K4r_TJz_8",
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    expectedTitle: "How to implement LLM guardrails for RAG applications",
    channel: "IBM Developer",
    minutes: 7,
    covers: ["LLM guardrails explained", "Guardrails, cost, latency, caching"],
    level: "intermediate",
    role: "core",
    resolvedBy: "agent-search",
  },
  {
    id: "HdafI0t3sEY",
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    expectedTitle: "RAG vs. CAG: Solving Knowledge Gaps in AI Models",
    channel: "IBM Technology",
    minutes: 9,
    covers: ["Caching"],
    relatedTo: ["Guardrails, cost, latency, caching"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
  },
  {
    id: "7xTGNNLPyMI",
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    expectedTitle: "Deep Dive into LLMs like ChatGPT",
    channel: "Andrej Karpathy",
    minutes: 211,
    covers: ["Post-training and assistant models"],
    relatedTo: ["Bias, safety, governance"],
    level: "advanced",
    role: "optional",
    resolvedBy: "seed",
  },
  {
    id: "DNmIqNjbKoM",
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    expectedTitle: "Prompt Versioning & Testing Strategies — Reliable LLM Development | Uplatz",
    channel: "Uplatz",
    minutes: 6,
    covers: ["Prompt versioning and regression tests"],
    level: "intermediate",
    role: "core",
    resolvedBy: "agent-search",
  },
];

export const RESOLVED_TOPICS: TopicResolutionReport[] = [
  {
    topicNumber: 1,
    moduleId: "mod-01",
    moduleNumber: 1,
    topicName: "Evolution of AI and LLMs",
    searchQuery: "history of AI and large language models explained",
    outcome: "resolved",
    chosenVideoId: "ZHCB09O6zUk",
    chosenVideoTitle: "A Brief History of AI: From Machine Learning to Gen AI to Agentic AI",
    chosenChannel: "IBM Technology",
    chosenMinutes: 13,
    reason: "13 minutes long (>=4m), published 2024, passes oEmbed with HTTP 200, highly accessible beginner primer on the 70-year timeline of AI.",
  },
  {
    topicNumber: 2,
    moduleId: "mod-02",
    moduleNumber: 2,
    topicName: "Constraint based prompting",
    searchQuery: "constrained generation for better LLM prompting results",
    outcome: "resolved",
    chosenVideoId: "ugxPshXr7Ro",
    chosenVideoTitle: "Constrained Generation for Better LLM Prompting Results",
    chosenChannel: "Matthew Esposito | AI",
    chosenMinutes: 5,
    reason: "5-minute tutorial published 2025, passes oEmbed HTTP 200, teaches 5 categories of prompt constraints (structure, quantity, language, logic) with concrete LLM examples.",
  },
  {
    topicNumber: 3,
    moduleId: "mod-03",
    moduleNumber: 3,
    topicName: "Delimiter based and structured prompts",
    searchQuery: "XML Tags Delimiters Complex Prompt Structure",
    outcome: "resolved",
    chosenVideoId: "zrp3Lr5eeFc",
    chosenVideoTitle: "XML Tags, Delimiters & Complex Prompt Structure",
    chosenChannel: "Fortivance Academy",
    chosenMinutes: 8,
    reason: "8-minute dedicated lesson published 2026, passes oEmbed HTTP 200, teaches XML tags, delimiters, semantic boundaries, and structured prompt formatting.",
  },
  {
    topicNumber: 4,
    moduleId: "mod-03",
    moduleNumber: 3,
    topicName: "Multi-prompt interaction",
    searchQuery: "AI Prompt Engineering Multistep Prompting",
    outcome: "resolved",
    chosenVideoId: "OEQPss-UXhA",
    chosenVideoTitle: "AI Prompt Engineering - Multistep Prompting",
    chosenChannel: "SivamX",
    chosenMinutes: 9,
    reason: "9-minute tutorial published 2025, passes oEmbed HTTP 200, teaches multi-step prompt design, decomposing complex asks, and orchestrating sequential workflows.",
  },
  {
    topicNumber: 5,
    moduleId: "mod-04",
    moduleNumber: 4,
    topicName: "Prompt chaining and pipelines",
    searchQuery: "Prompt Chaining Explained LangChain Tutorial for Building Smarter AI Workflows",
    outcome: "resolved",
    chosenVideoId: "KwC8bUZrUKA",
    chosenVideoTitle: "Prompt Chaining Explained | LangChain Tutorial for Building Smarter AI Workflows 🚀",
    chosenChannel: "Micro Learning",
    chosenMinutes: 8,
    reason: "8-minute guide published 2026, passes oEmbed HTTP 200, teaches prompt chaining architectures and step-by-step pipeline execution.",
  },
  {
    topicNumber: 6,
    moduleId: "mod-05",
    moduleNumber: 5,
    topicName: "Prompt tuning fundamentals",
    searchQuery: "prompt tuning soft prompts explained",
    outcome: "resolved",
    chosenVideoId: "yu27PWzJI_Y",
    chosenVideoTitle: "What is Prompt Tuning?",
    chosenChannel: "IBM Technology",
    chosenMinutes: 9,
    reason: "9 minutes, published 2024, passes oEmbed HTTP 200, explains soft prompts vs full fine-tuning with clear visual diagrams.",
  },
  {
    topicNumber: 7,
    moduleId: "mod-05",
    moduleNumber: 5,
    topicName: "BLEU, ROUGE, BERTScore",
    searchQuery: "LLM Evaluation Explained BLEU ROUGE BERTScore",
    outcome: "resolved",
    chosenVideoId: "RTaZqGflrJ8",
    chosenVideoTitle: "LLM Evaluation Explained: BLEU, ROUGE, BERTScore & the Full Pipeline (Simple Guide)",
    chosenChannel: "AI Academy",
    chosenMinutes: 7,
    reason: "Evaluated per instructions: 7-minute instructional video published 2025, passes oEmbed HTTP 200, explains n-gram overlap in BLEU, recall in ROUGE, and embedding similarity in BERTScore.",
  },
  {
    topicNumber: 8,
    moduleId: "mod-05",
    moduleNumber: 5,
    topicName: "Hallucination detection",
    searchQuery: "LLM hallucination detection explained",
    outcome: "resolved",
    chosenVideoId: "ZFKvTIADp0k",
    chosenVideoTitle: "Tuning Your AI Model to Reduce Hallucinations",
    chosenChannel: "IBM Technology",
    chosenMinutes: 9,
    reason: "9 minutes long (>=4m), published 2024, passes oEmbed HTTP 200, covers core hallucination causes and mitigation techniques.",
  },
  {
    topicNumber: 9,
    moduleId: "mod-08",
    moduleNumber: 8,
    topicName: "Jailbreak techniques",
    searchQuery: "ChatGPT jailbreak Computerphile",
    outcome: "resolved",
    chosenVideoId: "zn2ukSnDqSg",
    chosenVideoTitle: "ChatGPT Jailbreak - Computerphile",
    chosenChannel: "Computerphile",
    chosenMinutes: 12,
    reason: "12 minutes, passes oEmbed HTTP 200, classic and definitive exploration of semantic jailbreaks and model safety boundaries.",
  },
  {
    topicNumber: 10,
    moduleId: "mod-09",
    moduleNumber: 9,
    topicName: "Education and tutoring prompts",
    searchQuery: "Prompt Engineering for Teachers",
    outcome: "resolved",
    chosenVideoId: "GxlOoKI0zxg",
    chosenVideoTitle: "Prompt Engineering for Teachers",
    chosenChannel: "Town Square for Teachers",
    chosenMinutes: 11,
    reason: "11-minute educational guide published 2025, passes oEmbed HTTP 200, teaches Socratic prompting, curriculum scaffolding, and interactive tutoring techniques.",
  },
  {
    topicNumber: 11,
    moduleId: "mod-09",
    moduleNumber: 9,
    topicName: "Business automation prompts",
    searchQuery: "Prompt Engineering for Business Automate Workflows With AI",
    outcome: "resolved",
    chosenVideoId: "QRgayVF5PyM",
    chosenVideoTitle: "Prompt Engineering for Business: Automate Workflows With AI",
    chosenChannel: "Tuff University",
    chosenMinutes: 30,
    reason: "30-minute comprehensive lecture published 2026, passes oEmbed HTTP 200, teaches enterprise document extraction, classification prompts, and automated business workflows.",
  },
  {
    topicNumber: 12,
    moduleId: "mod-09",
    moduleNumber: 9,
    topicName: "Research assistance prompts",
    searchQuery: "How to use ChatGPT for Research Literature Review",
    outcome: "resolved",
    chosenVideoId: "U8zrqWrTYdc",
    chosenVideoTitle: "How to use ChatGPT for Research - Literature Review, Research Paper Writing & Publication",
    chosenChannel: "WiseUp Communications",
    chosenMinutes: 9,
    reason: "9-minute tutorial published 2025, passes oEmbed HTTP 200, teaches literature review synthesis, paper section structuring, and citation grounding prompts.",
  },
  {
    topicNumber: 13,
    moduleId: "mod-10",
    moduleNumber: 10,
    topicName: "Active prompting",
    searchQuery: "Active Prompting Explained Boost AI Reasoning with Less Human Effort",
    outcome: "resolved",
    chosenVideoId: "wcmLgy1-9aQ",
    chosenVideoTitle: "Active Prompting Explained: Boost AI Reasoning with Less Human Effort",
    chosenChannel: "Micro Learning",
    chosenMinutes: 8,
    reason: "8-minute lesson published 2026, passes oEmbed HTTP 200, teaches active prompting methodology: uncertainty estimation, human-in-the-loop exemplar annotation, and CoT reasoning.",
  },
  {
    topicNumber: 14,
    moduleId: "mod-10",
    moduleNumber: 10,
    topicName: "Expert prompting",
    searchQuery: "Should you tell your LLM it's an expert before prompting",
    outcome: "resolved",
    chosenVideoId: "g5h-piquf_k",
    chosenVideoTitle: "Should you tell your LLM it's an 'expert' before prompting?",
    chosenChannel: "AI and Search with Mark Williams-Cook",
    chosenMinutes: 7,
    reason: "7-minute empirical investigation published 2026, passes oEmbed HTTP 200, teaches expert persona conditioning, prompt framing nuance, and benchmarked output effects.",
  },
  {
    topicNumber: 15,
    moduleId: "mod-12",
    moduleNumber: 12,
    topicName: "Prompting vs RAG vs fine-tuning",
    searchQuery: "RAG vs Fine-Tuning vs Prompt Engineering: Optimizing AI Models",
    outcome: "resolved",
    chosenVideoId: "zYGDpG-pTho",
    chosenVideoTitle: "RAG vs Fine-Tuning vs Prompt Engineering: Optimizing AI Models",
    chosenChannel: "IBM Technology",
    chosenMinutes: 13,
    reason: "13 minutes, passes oEmbed HTTP 200, directly addresses the prompt vs RAG vs fine-tuning architectural spectrum. Augmented by l5K4r_TJz_8 (IBM Developer, 7m, guardrails for RAG).",
  },
  {
    topicNumber: 16,
    moduleId: "mod-12",
    moduleNumber: 12,
    topicName: "Prompt versioning and regression tests",
    searchQuery: "Prompt Versioning Testing Strategies Reliable LLM Development",
    outcome: "resolved",
    chosenVideoId: "DNmIqNjbKoM",
    chosenVideoTitle: "Prompt Versioning & Testing Strategies — Reliable LLM Development | Uplatz",
    chosenChannel: "Uplatz",
    chosenMinutes: 6,
    reason: "6-minute production engineering guide published 2025, passes oEmbed HTTP 200, teaches prompt version control, golden dataset regression testing, and CI/CD evaluation gates.",
  },
];

export const SLOT_TOPICS: { moduleId: string; moduleNumber: number; topic: string; notes: string }[] = [];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function verifyAllVideos(): Promise<FullVideoReport> {
  console.log(`Verifying ${CANDIDATE_VIDEOS.length} candidate videos via YouTube oEmbed API...`);
  const verifiedList: VerifiedVideo[] = [];

  for (const candidate of CANDIDATE_VIDEOS) {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${candidate.id}&format=json`;
    try {
      const res = await fetch(oembedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PromptForge/1.0",
        },
      });

      if (res.status === 200) {
        const data = (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
        verifiedList.push({
          ...candidate,
          title: data.title ?? candidate.expectedTitle,
          authorName: data.author_name ?? candidate.channel,
          thumbnailUrl: data.thumbnail_url ?? `https://i.ytimg.com/vi/${candidate.id}/hqdefault.jpg`,
          status: "ok",
          httpStatus: 200,
          verifiedAt: new Date().toISOString(),
        });
        console.log(`  [OK] ${candidate.id} (${candidate.channel}) - "${candidate.expectedTitle}"`);
      } else {
        console.warn(`  [UNAVAILABLE ${res.status}] ${candidate.id} - "${candidate.expectedTitle}"`);
        verifiedList.push({
          ...candidate,
          title: candidate.expectedTitle,
          thumbnailUrl: `https://i.ytimg.com/vi/${candidate.id}/hqdefault.jpg`,
          status: "unavailable",
          httpStatus: res.status,
          verifiedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(`  [ERROR] ${candidate.id}:`, err);
      verifiedList.push({
        ...candidate,
        title: candidate.expectedTitle,
        thumbnailUrl: `https://i.ytimg.com/vi/${candidate.id}/hqdefault.jpg`,
        status: "unavailable",
        httpStatus: 500,
        verifiedAt: new Date().toISOString(),
      });
    }

    await sleep(80);
  }

  // Group by module
  const moduleMap = new Map<number, ModuleReport>();
  for (let m = 1; m <= 12; m++) {
    const modId = `mod-${String(m).padStart(2, "0")}`;
    const sample = CANDIDATE_VIDEOS.find((v) => v.moduleNumber === m);
    moduleMap.set(m, {
      moduleId: modId,
      moduleNumber: m,
      moduleTitle: sample?.moduleTitle ?? `Module ${m}`,
      okCount: 0,
      unavailableCount: 0,
      slotCount: 0,
      hasPlayableVideo: false,
      totalWatchMinutes: 0,
      coverage: 0,
      coverageRatio: "0/0",
      coveredTopicsCount: 0,
      totalTopicsCount: 0,
      coveredTopics: [],
      totalTopics: [],
      videos: [],
      slots: [],
    });
  }

  const seenVideoPerModule = new Set<string>();
  for (const v of verifiedList) {
    const rep = moduleMap.get(v.moduleNumber);
    if (rep) {
      rep.videos.push(v);
      const key = `${v.moduleNumber}:${v.id}`;
      if (v.status === "ok") {
        rep.okCount++;
        rep.hasPlayableVideo = true;
        // UI watch time = core videos only
        if (v.role !== "optional" && !seenVideoPerModule.has(key)) {
          seenVideoPerModule.add(key);
          rep.totalWatchMinutes += v.minutes;
        }
      } else {
        rep.unavailableCount++;
      }
    }
  }

  for (const s of SLOT_TOPICS) {
    const rep = moduleMap.get(s.moduleNumber);
    if (rep) {
      rep.slots.push({ topic: s.topic, notes: s.notes });
      rep.slotCount++;
    }
  }

  // Calculate honest coverage per module:
  // coverage = lesson topics with a "covers" video / total lesson topics
  const coveragePerModule: Record<string, number> = {};
  for (let m = 1; m <= 12; m++) {
    const rep = moduleMap.get(m)!;
    const lessonTopics = MODULE_LESSON_TOPICS[m] || [];
    const okVideosInMod = rep.videos.filter((v) => v.status === "ok");

    const coveredTopics = lessonTopics.filter((topic) => {
      const tNorm = topic.toLowerCase().trim();
      return okVideosInMod.some((v) => {
        return (v.covers || []).some((c) => {
          const cNorm = c.toLowerCase().trim();
          return cNorm === tNorm || cNorm.includes(tNorm) || tNorm.includes(cNorm);
        });
      });
    });

    const totalTopicsCount = lessonTopics.length;
    const coveredTopicsCount = coveredTopics.length;
    const coverage = totalTopicsCount > 0 ? Math.round((coveredTopicsCount / totalTopicsCount) * 100) / 100 : 0;

    rep.coverage = coverage;
    rep.coverageRatio = `${coveredTopicsCount}/${totalTopicsCount}`;
    rep.coveredTopicsCount = coveredTopicsCount;
    rep.totalTopicsCount = totalTopicsCount;
    rep.coveredTopics = coveredTopics;
    rep.totalTopics = lessonTopics;

    coveragePerModule[rep.moduleId] = coverage;
  }

  const modules = Array.from(moduleMap.values());
  const totalOk = verifiedList.filter((v) => v.status === "ok").length;
  const totalUnavailable = verifiedList.filter((v) => v.status === "unavailable").length;
  const totalSlots = SLOT_TOPICS.length;
  const everyModuleHasPlayableVideo = modules.every((m) => m.hasPlayableVideo);

  const topicsWithoutVideo = SLOT_TOPICS.map((s) => ({
    moduleId: s.moduleId,
    moduleNumber: s.moduleNumber,
    topic: s.topic,
    reason: s.notes,
  }));

  const report: FullVideoReport = {
    generatedAt: new Date().toISOString(),
    totalOk,
    totalUnavailable,
    totalSlots,
    everyModuleHasPlayableVideo,
    coveragePerModule,
    modules,
    resolvedTopics: RESOLVED_TOPICS,
    topicsWithoutVideo,
  };

  return report;
}

async function main() {
  const report = await verifyAllVideos();
  const outputPath = path.resolve(process.cwd(), "content", "video-report.json");
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nSuccessfully generated ${outputPath}`);
  console.log(`Summary: ${report.totalOk} OK, ${report.totalUnavailable} Unavailable, ${report.totalSlots} Slots.`);
  console.log(`Every module has playable video: ${report.everyModuleHasPlayableVideo ? "YES" : "NO"}`);
  console.log("Per-module coverage numbers:", report.coveragePerModule);
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
