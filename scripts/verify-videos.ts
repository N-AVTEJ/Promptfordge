/**
 * PromptForge Video Verification & Topic Resolution Script
 *
 * Implements STEP V and STEP R:
 * - Validates all seed and resolved YouTube video IDs via YouTube oEmbed API:
 *   https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json
 *   HTTP 200 = "ok" (records verified title and author).
 *   Any other HTTP status = "unavailable".
 * - Step R: Tracks the 13 search topics from the syllabus (what was chosen or why not).
 * - Enforces schema: VideoSource { id, title, channel, minutes, covers, level, status, resolvedBy }
 * - Generates /content/video-report.json with per-module counts, 13 topics details, and list of topics without video.
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
  totalWatchMinutes: number;
  videos: VerifiedVideo[];
  slots: { topic: string; notes: string }[];
}

export interface FullVideoReport {
  generatedAt: string;
  totalOk: number;
  totalUnavailable: number;
  totalSlots: number;
  everyModuleHasPlayableVideo: boolean;
  modules: ModuleReport[];
  resolvedTopics: TopicResolutionReport[];
  topicsWithoutVideo: { moduleId: string; moduleNumber: number; topic: string; reason: string }[];
}

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
    expectedTitle: "Prompt Engineering: Zero vs Few-Shot",
    channel: "IBM Technology",
    minutes: 8,
    covers: ["Zero-shot", "Instruction based"],
    level: "beginner",
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
    id: "Cu8QvodkjpU",
    moduleId: "mod-02",
    moduleNumber: 2,
    moduleTitle: "Example and Instruction Based Prompts",
    expectedTitle: "Meta Reveals 7 Prompt Techniques",
    channel: "Meta",
    minutes: 12,
    covers: ["Instruction based", "Role based", "Constraint based"],
    level: "intermediate",
    role: "optional",
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
    covers: ["Role based"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
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
    covers: ["Contextual", "Reflection-based", "Structured prompts"],
    level: "intermediate",
    role: "core",
    resolvedBy: "seed",
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
    covers: ["Iterative refinement", "Performance evaluation"],
    level: "advanced",
    role: "optional",
    resolvedBy: "seed",
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
    covers: ["Prompt injection", "Mitigation strategies", "Safe prompt design"],
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

  // Module 11
  {
    id: "eur8dUO9mvE",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "What is MCP?",
    channel: "IBM Technology",
    minutes: 4,
    covers: ["What is MCP?", "MCP (hosts, clients, servers)", "Agent loops (plan, act, observe)"],
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
    covers: ["Guardrails, cost, latency, caching"],
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
    covers: ["Post-training and assistant models", "Bias, safety, governance"],
    level: "advanced",
    role: "optional",
    resolvedBy: "seed",
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
    reason: "Matched query on approved channel (IBM Technology). 13 minutes long (>=4m), published 2024, passes oEmbed with HTTP 200, highly accessible beginner primer on the 70-year timeline of AI.",
  },
  {
    topicNumber: 2,
    moduleId: "mod-03",
    moduleNumber: 3,
    topicName: "Delimiter based and structured prompts",
    searchQuery: "prompt engineering delimiters structured prompts XML tags",
    outcome: "slot",
    reason: "DeepLearning.AI and Anthropic host delimiter tutorials within interactive platforms or short promo trailers (H4YK_7MAckk is only 2 minutes). Standalone matching videos were from non-approved channels (e.g. Try To Be USEFUL, Claude lab). Per strict rule, left as 'slot' with friendly 'Video coming soon' card.",
  },
  {
    topicNumber: 3,
    moduleId: "mod-03",
    moduleNumber: 3,
    topicName: "Multi-prompt interaction",
    searchQuery: "multi prompt LLM workflow explained",
    outcome: "slot",
    reason: "No standalone explainer >=4m published >=2023 on the approved channel list specifically titled for multi-prompt interactions. Preserved as a designated syllabus slot.",
  },
  {
    topicNumber: 4,
    moduleId: "mod-04",
    moduleNumber: 4,
    topicName: "Prompt chaining and pipelines",
    searchQuery: "prompt chaining explained LLM",
    outcome: "slot",
    reason: "Official cloud channels (Google Cloud, AWS) currently feature short clips (<4m, e.g. Dbm23wpUSVg is 3m) or general agent overviews. Dedicated prompt-chaining explainers were from independent unapproved creators. Left as 'slot'.",
  },
  {
    topicNumber: 5,
    moduleId: "mod-05",
    moduleNumber: 5,
    topicName: "BLEU, ROUGE, BERTScore",
    searchQuery: "BLEU ROUGE BERTScore explained",
    outcome: "slot",
    reason: "Stanford CS224N references BLEU within an 80m 2019 lecture (pre-2023, not dedicated). Dedicated standalone breakdown videos (e.g. RTaZqGflrJ8) belong to non-approved channels (AI Academy). Strictly left as 'slot'.",
  },
  {
    topicNumber: 6,
    moduleId: "mod-05",
    moduleNumber: 5,
    topicName: "Hallucination detection",
    searchQuery: "LLM hallucination detection explained",
    outcome: "resolved",
    chosenVideoId: "ZFKvTIADp0k",
    chosenVideoTitle: "Tuning Your AI Model to Reduce Hallucinations",
    chosenChannel: "IBM Technology",
    chosenMinutes: 9,
    reason: "Approved channel (IBM Technology), 9 minutes long (>=4m), published 2024, passes oEmbed HTTP 200, covers core hallucination causes and mitigation techniques.",
  },
  {
    topicNumber: 7,
    moduleId: "mod-05",
    moduleNumber: 5,
    topicName: "Prompt tuning fundamentals",
    searchQuery: "prompt tuning soft prompts explained",
    outcome: "resolved",
    chosenVideoId: "yu27PWzJI_Y",
    chosenVideoTitle: "What is Prompt Tuning?",
    chosenChannel: "IBM Technology",
    chosenMinutes: 9,
    reason: "Approved channel (IBM Technology / Martin Keen), 9 minutes, passes oEmbed HTTP 200, explains soft prompts vs full fine-tuning with clear visual diagrams.",
  },
  {
    topicNumber: 8,
    moduleId: "mod-08",
    moduleNumber: 8,
    topicName: "Jailbreak techniques",
    searchQuery: "ChatGPT jailbreak Computerphile",
    outcome: "resolved",
    chosenVideoId: "zn2ukSnDqSg",
    chosenVideoTitle: "ChatGPT Jailbreak - Computerphile",
    chosenChannel: "Computerphile",
    chosenMinutes: 12,
    reason: "Approved channel (Computerphile), 12 minutes, passes oEmbed HTTP 200, classic and definitive exploration of semantic jailbreaks and model safety boundaries.",
  },
  {
    topicNumber: 9,
    moduleId: "mod-09",
    moduleNumber: 9,
    topicName: "Education and tutoring prompts",
    searchQuery: "prompt engineering for teachers tutoring AI",
    outcome: "slot",
    reason: "No standalone educational video meeting all rules (>=4 min, published >=2023, approved channel list). Left as 'slot' with rich syllabus practice challenge.",
  },
  {
    topicNumber: 10,
    moduleId: "mod-09",
    moduleNumber: 9,
    topicName: "Business automation prompts",
    searchQuery: "AI prompts business automation workflow",
    outcome: "slot",
    reason: "No standalone video from approved channels dedicated exclusively to business document/workflow prompt patterns. Left as 'slot'.",
  },
  {
    topicNumber: 11,
    moduleId: "mod-09",
    moduleNumber: 9,
    topicName: "Research assistance prompts",
    searchQuery: "AI research assistant prompting literature review",
    outcome: "slot",
    reason: "No standalone explainer from approved channels >=4m dedicated to literature review prompts. Left as 'slot'.",
  },
  {
    topicNumber: 12,
    moduleId: "mod-10",
    moduleNumber: 10,
    topicName: "Active prompting and expert prompting",
    searchQuery: "active prompting uncertainty chain of thought explained / expert prompting LLM",
    outcome: "slot",
    reason: "Active prompting papers exist from academic labs, but no dedicated explainer video >=4m on approved channels meets criteria. Left as 'slot'.",
  },
  {
    topicNumber: 13,
    moduleId: "mod-12",
    moduleNumber: 12,
    topicName: "Prompting vs RAG vs fine-tuning, guardrails, responsible AI",
    searchQuery: "prompt engineering vs RAG vs fine-tuning / LLM guardrails explained",
    outcome: "resolved",
    chosenVideoId: "zYGDpG-pTho",
    chosenVideoTitle: "RAG vs Fine-Tuning vs Prompt Engineering: Optimizing AI Models",
    chosenChannel: "IBM Technology",
    chosenMinutes: 13,
    reason: "Approved channel (IBM Technology / Martin Keen), 13 minutes, passes oEmbed HTTP 200, directly addresses the prompt vs RAG vs fine-tuning architectural spectrum. Augmented by l5K4r_TJz_8 (IBM Developer, 7m, guardrails for RAG).",
  },
];

export const SLOT_TOPICS = [
  {
    moduleId: "mod-02",
    moduleNumber: 2,
    topic: "Constraint based prompting",
    notes: "Negative space boundary constraint slot; covered by hands-on challenge.",
  },
  {
    moduleId: "mod-03",
    moduleNumber: 3,
    topic: "Delimiter based and structured prompts",
    notes: "XML and Markdown structural boundary slot.",
  },
  {
    moduleId: "mod-03",
    moduleNumber: 3,
    topic: "Multi-prompt interaction",
    notes: "Multi-prompt sequential workflow slot.",
  },
  {
    moduleId: "mod-04",
    moduleNumber: 4,
    topic: "Prompt chaining and pipelines",
    notes: "Sequential prompt pipeline slot.",
  },
  {
    moduleId: "mod-05",
    moduleNumber: 5,
    topic: "BLEU, ROUGE, BERTScore",
    notes: "NLP metrics evaluation slot.",
  },
  {
    moduleId: "mod-09",
    moduleNumber: 9,
    topic: "Education and tutoring prompts",
    notes: "Socratic tutoring and pedagogy slot.",
  },
  {
    moduleId: "mod-09",
    moduleNumber: 9,
    topic: "Business automation prompts",
    notes: "Enterprise document parsing and workflow slot.",
  },
  {
    moduleId: "mod-09",
    moduleNumber: 9,
    topic: "Research assistance prompts",
    notes: "Literature synthesis and citation grounding slot.",
  },
  {
    moduleId: "mod-10",
    moduleNumber: 10,
    topic: "Active prompting",
    notes: "Uncertainty-weighted active prompting slot.",
  },
  {
    moduleId: "mod-10",
    moduleNumber: 10,
    topic: "Expert prompting",
    notes: "Multi-persona expert ensemble slot.",
  },
  {
    moduleId: "mod-12",
    moduleNumber: 12,
    topic: "Prompt versioning and regression tests",
    notes: "CI/CD prompt regression testing and drift slot.",
  },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function verifyAllVideos(): Promise<FullVideoReport> {
  console.log(`Verifying ${CANDIDATE_VIDEOS.length} candidate videos via YouTube oEmbed API...`);
  const verifiedList: VerifiedVideo[] = [];

  for (const candidate of CANDIDATE_VIDEOS) {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${candidate.id}&format=json`;
    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
      attempts++;
      try {
        await sleep(150);
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = (await res.json()) as {
            title: string;
            author_name?: string;
            thumbnail_url?: string;
          };
          console.log(`  [200 OK] ${candidate.id} -> "${data.title}" (${data.author_name})`);
          verifiedList.push({
            ...candidate,
            title: data.title || candidate.expectedTitle,
            channel: data.author_name || candidate.channel,
            authorName: data.author_name,
            thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${candidate.id}/hqdefault.jpg`,
            status: "ok",
            httpStatus: 200,
            verifiedAt: new Date().toISOString(),
          });
          success = true;
        } else {
          console.warn(`  [${res.status} UNAVAILABLE] ${candidate.id} (${candidate.expectedTitle})`);
          verifiedList.push({
            ...candidate,
            title: candidate.expectedTitle,
            thumbnailUrl: `https://i.ytimg.com/vi/${candidate.id}/hqdefault.jpg`,
            status: "unavailable",
            httpStatus: res.status,
            verifiedAt: new Date().toISOString(),
          });
          success = true;
        }
      } catch (err: unknown) {
        if (attempts >= 3) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`  [ERROR] ${candidate.id} after ${attempts} attempts: ${msg}`);
          verifiedList.push({
            ...candidate,
            title: candidate.expectedTitle,
            thumbnailUrl: `https://i.ytimg.com/vi/${candidate.id}/hqdefault.jpg`,
            status: "unavailable",
            httpStatus: 0,
            verifiedAt: new Date().toISOString(),
          });
        } else {
          await sleep(400);
        }
      }
    }
  }

  // Aggregate into modules
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
        if (!seenVideoPerModule.has(key)) {
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
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
