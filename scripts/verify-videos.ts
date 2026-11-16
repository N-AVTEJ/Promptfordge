/**
 * PromptForge Video Verification Script
 * Validates YouTube IDs via YouTube oEmbed API:
 * https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json
 * 200 = ok (saves verified title and author).
 * Any other HTTP status = unavailable.
 * Generates /content/video-report.json with per-module counts and slot tracking.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface VideoCandidate {
  id: string;
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  expectedTitle: string;
  channel?: string;
  minutes?: number;
  covers: string[];
  role: "core" | "optional";
  source: "external" | "own";
}

export interface VerifiedVideo {
  id: string;
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  title: string;
  channel?: string;
  minutes?: number;
  covers: string[];
  role: "core" | "optional";
  status: "ok" | "unavailable";
  source: "external" | "own";
  verifiedAt: string;
  authorName?: string;
  thumbnailUrl?: string;
  httpStatus?: number;
}

export interface SlotTopic {
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  topic: string;
  notes: string;
}

export interface ModuleReport {
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  okCount: number;
  unavailableCount: number;
  slotCount: number;
  hasPlayableVideo: boolean;
  videos: VerifiedVideo[];
  slots: SlotTopic[];
}

export interface VideoReport {
  generatedAt: string;
  totalOk: number;
  totalUnavailable: number;
  totalSlots: number;
  modules: ModuleReport[];
}

export const CANDIDATE_VIDEOS: VideoCandidate[] = [
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
    role: "core",
    source: "external",
  },
  {
    id: "wjZofJX0v4M",
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    expectedTitle: "Transformers, the tech behind LLMs, Ch5",
    channel: "3Blue1Brown",
    minutes: 27,
    covers: ["Transformer architecture", "Fundamentals of LLMs"],
    role: "core",
    source: "external",
  },
  {
    id: "eMlx5fFNoYc",
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    expectedTitle: "Attention in transformers, step-by-step, Ch6",
    channel: "3Blue1Brown",
    minutes: 26,
    covers: ["Transformer architecture", "Working of LLMs (tokens, training, inference)"],
    role: "core",
    source: "external",
  },
  {
    id: "7xTGNNLPyMI",
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    expectedTitle: "Deep Dive into LLMs like ChatGPT",
    channel: "Andrej Karpathy",
    minutes: 211,
    covers: ["Working of LLMs (tokens, training, inference)", "Fundamentals of LLMs", "Basics of prompts"],
    role: "optional",
    source: "external",
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
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
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
    role: "optional",
    source: "external",
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
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
  },

  // Module 5
  {
    id: "vBJF2sy1Pyw",
    moduleId: "mod-05",
    moduleNumber: 5,
    moduleTitle: "Prompt Optimization Techniques",
    expectedTitle: "The challenges with using LLM as a Judge",
    channel: "Qdrant Vector Space Talks",
    minutes: 42,
    covers: ["Measuring response quality", "Performance evaluation"],
    role: "core",
    source: "external",
  },
  {
    id: "LZJTrAXcyFM",
    moduleId: "mod-05",
    moduleNumber: 5,
    moduleTitle: "Prompt Optimization Techniques",
    expectedTitle: "Community Paper Reading: LLMs-as-Judges",
    channel: "Arize AI",
    minutes: 54,
    covers: ["Iterative refinement", "Prompt tuning fundamentals"],
    role: "optional",
    source: "external",
  },
  {
    id: "RTaZqGflrJ8",
    moduleId: "mod-05",
    moduleNumber: 5,
    moduleTitle: "Prompt Optimization Techniques",
    expectedTitle: "LLM Evaluation Explained: BLEU, ROUGE, BERTScore & the Full Pipeline (Simple Guide)",
    channel: "AI Academy",
    minutes: 9,
    covers: ["BLEU, ROUGE, BERTScore", "Performance evaluation"],
    role: "core",
    source: "external",
  },
  {
    id: "xsDNArrmyuo",
    moduleId: "mod-05",
    moduleNumber: 5,
    moduleTitle: "Prompt Optimization Techniques",
    expectedTitle: "LLM Chronicles #6.6: Hallucination Detection and Evaluation for RAG systems (RAGAS, Lynx)",
    channel: "Donato Capitella",
    minutes: 14,
    covers: ["Hallucination detection", "Measuring response quality"],
    role: "core",
    source: "external",
  },

  // Module 6
  {
    id: "lOD_EE96jhM",
    moduleId: "mod-06",
    moduleNumber: 6,
    moduleTitle: "Multi-Model Prompting",
    expectedTitle: "Vision Language Models Enable Image Understanding",
    channel: "IBM Technology",
    minutes: 9,
    covers: ["Text + image prompts", "Intro to multi-model prompting"],
    role: "core",
    source: "external",
  },
  {
    id: "J51oZYcNvP8",
    moduleId: "mod-06",
    moduleNumber: 6,
    moduleTitle: "Multi-Model Prompting",
    expectedTitle: "What is Multimodal AI?",
    channel: "IBM Technology",
    minutes: 8,
    covers: ["Intro to multi-model prompting", "Cross-model AI interaction"],
    role: "core",
    source: "external",
  },

  // Module 7
  {
    id: "cDn7bf84LsM",
    moduleId: "mod-07",
    moduleNumber: 7,
    moduleTitle: "Tool-Augmented Prompting",
    expectedTitle: "LangChain Retrieval-Augmented Generation Demo",
    channel: "IBM Technology",
    minutes: 8,
    covers: ["Retrieval Augmented Generation"],
    role: "core",
    source: "external",
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
    role: "optional",
    source: "external",
  },
  {
    id: "h8gMhXYAv1k",
    moduleId: "mod-07",
    moduleNumber: 7,
    moduleTitle: "Tool-Augmented Prompting",
    expectedTitle: "Tool Calling: Traditional vs Embedded Approaches",
    channel: "IBM Technology",
    minutes: 5,
    covers: ["Function calling", "API-based prompting"],
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
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
    covers: ["Prompt injection", "Mitigation strategies"],
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
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
    role: "optional",
    source: "external",
  },
  {
    id: "zn2ukSnDqSg",
    moduleId: "mod-08",
    moduleNumber: 8,
    moduleTitle: "Security in Prompt Engineering",
    expectedTitle: "ChatGPT Jailbreak - Computerphile",
    channel: "Computerphile",
    minutes: 11,
    covers: ["Jailbreak techniques"],
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
  },

  // Module 10
  {
    id: "ut5kp56wW_4",
    moduleId: "mod-10",
    moduleNumber: 10,
    moduleTitle: "Advanced Prompt Engineering",
    expectedTitle: "Tree of Thoughts: Deliberate Problem Solving with LLMs",
    channel: "Yannic Kilcher",
    minutes: 29,
    covers: ["Tree-of-Thoughts"],
    role: "core",
    source: "external",
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
    role: "core",
    source: "external",
  },
  {
    id: "uDIW34h8cmM",
    moduleId: "mod-10",
    moduleNumber: 10,
    moduleTitle: "Advanced Prompt Engineering",
    expectedTitle: "Prompt Engineering Guide - From Beginner to Advanced",
    channel: "Matthew Berman",
    minutes: 20,
    covers: ["APE", "Expert prompting"],
    role: "core",
    source: "external",
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
    covers: ["MCP (hosts, clients, servers)", "Memory and tool protocols"],
    role: "core",
    source: "external",
  },
  {
    id: "7j1t3UZA1TY",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "MCP vs API",
    channel: "IBM Technology",
    minutes: 7,
    covers: ["MCP (hosts, clients, servers)", "Memory and tool protocols"],
    role: "core",
    source: "external",
  },
  {
    id: "kQmXtrmQ5Zg",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "MCP workshop",
    channel: "AI Engineer",
    minutes: 78,
    covers: ["Agent loops (plan, act, observe)", "MCP (hosts, clients, servers)"],
    role: "core",
    source: "external",
  },
  {
    id: "Yq29bZ8Hlrc",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "Optimize RAG with AI Agents & Vector Databases",
    channel: "IBM Technology",
    minutes: 33,
    covers: ["Agentic RAG"],
    role: "optional",
    source: "external",
  },
  {
    id: "vD0E3EUb8-8",
    moduleId: "mod-11",
    moduleNumber: 11,
    moduleTitle: "AI Agents, Context Engineering and MCP",
    expectedTitle: "Context Engineering vs. Prompt Engineering: Smarter AI with RAG & Agents",
    channel: "IBM Technology",
    minutes: 6,
    covers: ["Context windows and context engineering vs prompt engineering"],
    role: "core",
    source: "external",
  },

  // Module 12
  {
    id: "HdafI0t3sEY",
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    expectedTitle: "RAG vs. CAG: Solving Knowledge Gaps in AI Models",
    channel: "IBM Technology",
    minutes: 9,
    covers: ["Prompting vs RAG vs fine-tuning", "Guardrails, cost, latency, caching"],
    role: "core",
    source: "external",
  },
  {
    id: "7xTGNNLPyMI",
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    expectedTitle: "Deep Dive into LLMs like ChatGPT (Assistants & Post-training)",
    channel: "Andrej Karpathy",
    minutes: 211,
    covers: ["Prompting vs RAG vs fine-tuning", "Bias, safety, governance"],
    role: "optional",
    source: "external",
  },
  {
    id: "0A4zaEuRmig",
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    expectedTitle: "Prompt vs RAG vs Fine-Tuning — What’s the Difference?",
    channel: "Analytics Vidhya",
    minutes: 12,
    covers: ["Prompting vs RAG vs fine-tuning"],
    role: "core",
    source: "external",
  },
  {
    id: "o9jz04bIW0E",
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    expectedTitle: "LLM Fine Tuning Tutorial (Free Labs)",
    channel: "KodeKloud",
    minutes: 24,
    covers: ["Prompting vs RAG vs fine-tuning"],
    role: "optional",
    source: "external",
  },
];

export const SLOT_TOPICS: SlotTopic[] = [
  {
    moduleId: "mod-01",
    moduleNumber: 1,
    moduleTitle: "Introduction to Prompt Engineering",
    topic: "Basic prompt structures",
    notes: "Detailed architecture slot; video coming soon in curriculum cycle 2",
  },
  {
    moduleId: "mod-03",
    moduleNumber: 3,
    moduleTitle: "Context Based and Interaction Based Prompts",
    topic: "Delimiter based",
    notes: "XML and Markdown structural boundary slot",
  },
  {
    moduleId: "mod-03",
    moduleNumber: 3,
    moduleTitle: "Context Based and Interaction Based Prompts",
    topic: "Multi-prompt",
    notes: "Multi-prompt composition slot",
  },
  {
    moduleId: "mod-04",
    moduleNumber: 4,
    moduleTitle: "Advanced Prompt Techniques",
    topic: "Prompt chaining and pipelines",
    notes: "Sequential prompt pipeline slot",
  },
  {
    moduleId: "mod-09",
    moduleNumber: 9,
    moduleTitle: "Domain-Specific Prompt Engineering",
    topic: "Education and tutoring",
    notes: "Socratic tutoring and pedagogy slot",
  },
  {
    moduleId: "mod-09",
    moduleNumber: 9,
    moduleTitle: "Domain-Specific Prompt Engineering",
    topic: "Business automation",
    notes: "Enterprise document parsing and workflow slot",
  },
  {
    moduleId: "mod-09",
    moduleNumber: 9,
    moduleTitle: "Domain-Specific Prompt Engineering",
    topic: "Research assistance",
    notes: "Literature synthesis and citation grounding slot",
  },
  {
    moduleId: "mod-10",
    moduleNumber: 10,
    moduleTitle: "Advanced Prompt Engineering",
    topic: "Active prompting",
    notes: "Uncertainty-weighted active prompting slot",
  },
  {
    moduleId: "mod-10",
    moduleNumber: 10,
    moduleTitle: "Advanced Prompt Engineering",
    topic: "Expert prompting",
    notes: "Multi-persona expert ensemble slot",
  },
  {
    moduleId: "mod-12",
    moduleNumber: 12,
    moduleTitle: "Production Prompt Engineering and Responsible AI",
    topic: "Prompt versioning and regression tests",
    notes: "CI/CD prompt regression testing and drift slot",
  },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function verifyAllVideos(): Promise<VideoReport> {
  console.log(`Starting verification of ${CANDIDATE_VIDEOS.length} candidate videos via YouTube oEmbed...`);
  const verifiedList: VerifiedVideo[] = [];

  for (const candidate of CANDIDATE_VIDEOS) {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${candidate.id}&format=json`;
    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
      attempts++;
      try {
        await sleep(200); // polite spacing to avoid rate limits
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = (await res.json()) as {
            title: string;
            author_name?: string;
            thumbnail_url?: string;
          };
          console.log(`[OK 200] ${candidate.id} -> "${data.title}" (${data.author_name})`);
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
          console.warn(`[UNAVAILABLE ${res.status}] ${candidate.id} (${candidate.expectedTitle})`);
          verifiedList.push({
            ...candidate,
            title: candidate.expectedTitle,
            status: "unavailable",
            httpStatus: res.status,
            verifiedAt: new Date().toISOString(),
          });
          success = true; // definitive HTTP response, no need to retry
        }
      } catch (err: unknown) {
        if (attempts >= 3) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[ERROR] ${candidate.id} after ${attempts} attempts: ${msg}`);
          verifiedList.push({
            ...candidate,
            title: candidate.expectedTitle,
            status: "unavailable",
            httpStatus: 0,
            verifiedAt: new Date().toISOString(),
          });
        } else {
          await sleep(500);
        }
      }
    }
  }

  // Aggregate into 12 modules
  const moduleMap = new Map<number, ModuleReport>();
  for (let m = 1; m <= 12; m++) {
    const modId = `mod-${String(m).padStart(2, "0")}`;
    const sample = CANDIDATE_VIDEOS.find((v) => v.moduleNumber === m);
    const modTitle = sample?.moduleTitle ?? `Module ${m}`;
    moduleMap.set(m, {
      moduleId: modId,
      moduleNumber: m,
      moduleTitle: modTitle,
      okCount: 0,
      unavailableCount: 0,
      slotCount: 0,
      hasPlayableVideo: false,
      videos: [],
      slots: [],
    });
  }

  for (const v of verifiedList) {
    const rep = moduleMap.get(v.moduleNumber);
    if (rep) {
      rep.videos.push(v);
      if (v.status === "ok") {
        rep.okCount++;
        rep.hasPlayableVideo = true;
      } else {
        rep.unavailableCount++;
      }
    }
  }

  for (const s of SLOT_TOPICS) {
    const rep = moduleMap.get(s.moduleNumber);
    if (rep) {
      rep.slots.push(s);
      rep.slotCount++;
    }
  }

  const modules = Array.from(moduleMap.values());
  const totalOk = verifiedList.filter((v) => v.status === "ok").length;
  const totalUnavailable = verifiedList.filter((v) => v.status === "unavailable").length;
  const totalSlots = SLOT_TOPICS.length;

  const report: VideoReport = {
    generatedAt: new Date().toISOString(),
    totalOk,
    totalUnavailable,
    totalSlots,
    modules,
  };

  return report;
}

async function main() {
  const report = await verifyAllVideos();
  const outputPath = path.resolve(process.cwd(), "content", "video-report.json");
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nSuccessfully wrote verification report to ${outputPath}`);
  console.log(`Summary: ${report.totalOk} OK, ${report.totalUnavailable} Unavailable, ${report.totalSlots} Slots.`);

  let allHavePlayable = true;
  for (const mod of report.modules) {
    console.log(
      `M${mod.moduleNumber} (${mod.moduleTitle}): ${mod.okCount} OK, ${mod.unavailableCount} Unavailable, ${mod.slotCount} Slots. Playable: ${mod.hasPlayableVideo ? "YES" : "NO"}`
    );
    if (!mod.hasPlayableVideo) {
      allHavePlayable = false;
    }
  }

  if (!allHavePlayable) {
    console.error("Warning: Some modules do not have at least one playable video!");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

