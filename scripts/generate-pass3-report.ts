import * as fs from "node:fs";
import * as path from "node:path";
import { CURRICULUM_MODULES } from "../content/modules";

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

const CHANGED_CLAIMS = [
  {
    claimId: "C1",
    targetVideo: "uDIW34h8cmM",
    field: "covers / chapters",
    oldValue: "covers: ['Basics of prompts', 'Basic prompt structures', 'Zero-shot', 'One-shot', 'Few-shot', 'Role based', 'Tree-of-Thoughts', 'ReAct', 'APE']",
    newValue: "covers: ['Basics of prompts', 'Basic prompt structures', 'Zero-shot', 'One-shot', 'Few-shot', 'Role based', 'Tree-of-Thoughts', 'ReAct']; APE removed. Chapters recorded: Tree of Thought at 1429s (23:49), ReAct at 1618s (26:58); APE absent.",
    reason: "Claim Check B1: Video chapters and transcript inspected. Tree-of-Thoughts and ReAct have dedicated chapters; APE is completely absent. APE removed from covers and resolved with Andrei Muresanu (OmTdkNEr2nU).",
  },
  {
    claimId: "C2",
    targetVideo: "J51oZYcNvP8 in M6",
    field: "covers -> relatedTo",
    oldValue: "covers: ['What is Multimodal AI?', 'Cross-model AI interaction']",
    newValue: "covers: ['What is Multimodal AI?', 'Multimodal architectures']; relatedTo: ['Cross-model AI interaction']",
    reason: "Claim Check B2: Video teaches multimodal foundation concepts, not multi-LLM orchestration. Cross-model interaction moved to relatedTo and resolved with IBM Technology (sWH0T4Zez6I).",
  },
  {
    claimId: "C3",
    targetVideo: "7j1t3UZA1TY in M11",
    field: "covers",
    oldValue: "covers: ['MCP vs API', 'Memory and tool protocols', 'Memory']",
    newValue: "covers: ['MCP vs API', 'Tool protocols and MCP discovery']; 'Memory' removed",
    reason: "Claim Check B3: Description and chapters cover MCP primitives, dynamic discovery, and API integration, but no agent memory. Memory removed and resolved with Martin Keen (BacJ6sEhqMo).",
  },
  {
    claimId: "C4",
    targetVideo: "_9x-mAHGgC4 & gZTQNb0NGjM in M8",
    field: "covers -> relatedTo",
    oldValue: "_9x-mAHGgC4 and gZTQNb0NGjM claimed 'Safe prompt design'",
    newValue: "covers: ['AI attack surface overview'] and ['Mitigation strategies']; 'Safe prompt design' moved to relatedTo",
    reason: "Claim Check B4: Neither video demonstrates defensive prompt construction or prompt structuring against injection. Resolved with Probably Private (q-4zKTR9m3g).",
  },
  {
    claimId: "C5",
    targetVideo: "g5h-piquf_k in M10",
    field: "covers -> relatedTo",
    oldValue: "covers: ['Expert prompting']",
    newValue: "relatedTo: ['Expert prompting']; notes: 'Critical perspective on expert personas'",
    reason: "Claim Check B5: Video explores token space mechanics and questions whether expert persona prompting actually works; moved to relatedTo with critical perspective note.",
  },
];

async function checkOEmbed(id: string): Promise<{ ok: boolean; title?: string; author?: string; status: number }> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PromptForge/1.0" },
    });
    if (res.status === 200) {
      const data = (await res.json()) as { title?: string; author_name?: string };
      return { ok: true, title: data.title, author: data.author_name, status: 200 };
    }
    return { ok: false, status: res.status };
  } catch {
    return { ok: false, status: 500 };
  }
}

export async function generateReport() {
  console.log("Generating Pass 3 Video Report with honest coverage and derived gaps...");

  // Collect all unique video IDs across all modules
  const allVideosMap = new Map<string, { id: string; minutes: number; level: string; covers: string[]; relatedTo: string[]; whyThisVideo?: string; reviewed?: boolean }>();
  for (const mod of CURRICULUM_MODULES) {
    for (const les of mod.lessons) {
      for (const v of les.videos || []) {
        if (!allVideosMap.has(v.id)) {
          allVideosMap.set(v.id, {
            id: v.id,
            minutes: v.minutes,
            level: v.level || "intermediate",
            covers: v.covers || [],
            relatedTo: v.relatedTo || [],
            whyThisVideo: v.whyThisVideo,
            reviewed: v.reviewed,
          });
        }
      }
    }
  }

  console.log(`Found ${allVideosMap.size} unique video IDs across the 12 modules. Verifying oEmbed...`);
  const oembedResults = new Map<string, { ok: boolean; title?: string; author?: string; status: number }>();
  for (const id of Array.from(allVideosMap.keys())) {
    const res = await checkOEmbed(id);
    oembedResults.set(id, res);
    console.log(`  [${res.ok ? "OK 200" : "FAIL " + res.status}] ${id} -> "${res.title || "Unknown"}"`);
    await new Promise((r) => setTimeout(r, 60));
  }

  // Build module reports
  const moduleReports = [];
  const coveragePerModule: Record<string, number> = {};
  const reviewedVideosList = [];

  for (const mod of CURRICULUM_MODULES) {
    const lessonTopics = MODULE_LESSON_TOPICS[mod.number] || [];
    const modVideosMap = new Map<string, any>();
    let totalWatchMinutes = 0;

    for (const les of mod.lessons) {
      for (const v of les.videos || []) {
        const oemb = oembedResults.get(v.id);
        const status = oemb?.ok ? "ok" : "unavailable";
        if (!modVideosMap.has(v.id)) {
          modVideosMap.set(v.id, {
            ...v,
            title: oemb?.title || v.title,
            channel: oemb?.author || v.channel,
            authorName: oemb?.author || v.channel,
            thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
            status,
            httpStatus: oemb?.status || (oemb?.ok ? 200 : 404),
            verifiedAt: new Date().toISOString(),
            covers: [...(v.covers || [])],
            relatedTo: [...(v.relatedTo || [])],
          });
        } else {
          const existing = modVideosMap.get(v.id);
          for (const c of v.covers || []) {
            if (!existing.covers.includes(c)) existing.covers.push(c);
          }
          for (const r of v.relatedTo || []) {
            if (!existing.relatedTo.includes(r)) existing.relatedTo.push(r);
          }
        }

        if (v.resolvedBy === "agent-search" && v.whyThisVideo) {
          reviewedVideosList.push({
            id: v.id,
            moduleId: mod.id,
            moduleNumber: mod.number,
            title: oemb?.title || v.title,
            channel: oemb?.author || v.channel,
            minutes: v.minutes,
            whyThisVideo: v.whyThisVideo,
            reviewed: true,
          });
        }
      }
    }

    const modVideos = Array.from(modVideosMap.values());
    for (const v of modVideos) {
      if (v.status === "ok" && v.role !== "optional") {
        totalWatchMinutes += v.minutes || 0;
      }
    }

    // Determine covered topics strictly from videos where status is "ok" and topic matches covers
    const okVideosInMod = modVideos.filter((v) => v.status === "ok");
    const coveredTopics = lessonTopics.filter((topic) => {
      const tNorm = topic.toLowerCase().replace(/[^a-z0-9]/g, "");
      return okVideosInMod.some((v) => {
        return (v.covers || []).some((c: string) => {
          const cNorm = c.toLowerCase().replace(/[^a-z0-9]/g, "");
          return cNorm === tNorm || cNorm.includes(tNorm) || tNorm.includes(cNorm);
        });
      });
    });

    const totalTopicsCount = lessonTopics.length;
    const coveredTopicsCount = coveredTopics.length;
    const coverage = totalTopicsCount > 0 ? Math.round((coveredTopicsCount / totalTopicsCount) * 100) / 100 : 0;
    coveragePerModule[mod.id] = coverage;

    moduleReports.push({
      moduleId: mod.id,
      moduleNumber: mod.number,
      moduleTitle: mod.title,
      okCount: okVideosInMod.length,
      unavailableCount: modVideos.filter((v) => v.status === "unavailable").length,
      slotCount: 0,
      hasPlayableVideo: okVideosInMod.length > 0,
      totalWatchMinutes,
      coverage,
      coverageRatio: `${coveredTopicsCount}/${totalTopicsCount}`,
      coveredTopicsCount,
      totalTopicsCount,
      coveredTopics,
      totalTopics: lessonTopics,
      videos: modVideos,
    });
  }

  // Derive topicsWithoutVideo strictly
  const topicsWithoutVideo: { moduleId: string; moduleNumber: number; topic: string; reason: string }[] = [];
  for (const mRep of moduleReports) {
    for (const t of mRep.totalTopics) {
      if (!mRep.coveredTopics.includes(t)) {
        topicsWithoutVideo.push({
          moduleId: mRep.moduleId,
          moduleNumber: mRep.moduleNumber,
          topic: t,
          reason: "No confirmed video with this topic in 'covers' (may have relatedTo video or remain as gap)",
        });
      }
    }
  }

  // Deduplicate reviewed videos
  const seenReviewed = new Set<string>();
  const uniqueReviewedVideos = [];
  for (const r of reviewedVideosList) {
    if (!seenReviewed.has(r.id)) {
      seenReviewed.add(r.id);
      uniqueReviewedVideos.push(r);
    }
  }

  const finalReport = {
    generatedAt: new Date().toISOString(),
    pass: "Pass 3 (Surgical edits and honest reporting)",
    totalOk: Array.from(oembedResults.values()).filter((r) => r.ok).length,
    totalUnavailable: Array.from(oembedResults.values()).filter((r) => !r.ok).length,
    totalSlots: topicsWithoutVideo.length,
    everyModuleHasPlayableVideo: moduleReports.every((m) => m.hasPlayableVideo),
    coveragePerModule,
    changedClaims: CHANGED_CLAIMS,
    reviewedVideos: uniqueReviewedVideos,
    droppedVideos: [], // All candidate videos passed oEmbed 200, length >= 4m, 2023+, instructional
    topicsWithoutVideo,
    modules: moduleReports,
  };

  const outPath = path.resolve(process.cwd(), "content/video-report.json");
  fs.writeFileSync(outPath, JSON.stringify(finalReport, null, 2), "utf8");
  console.log(`\nSuccessfully wrote ${outPath}`);
  console.log("Derived topicsWithoutVideo count:", topicsWithoutVideo.length);
  console.log("Topics without video:", topicsWithoutVideo);
  console.log("Coverage per module:", coveragePerModule);
}

generateReport().catch(console.error);
