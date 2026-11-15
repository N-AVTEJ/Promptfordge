/**
 * Tree-of-Thoughts (ToT) Deliberate Reasoning Engine
 * Module 4: Chain-of-Thought & Visual Reasoning Strategies
 *
 * Implements deliberate heuristic search through candidate reasoning paths.
 * Generates candidate thoughts, evaluates them across separate criteria,
 * prunes unpromising paths, and highlights the chosen optimal path.
 */

import { TotTreeState, TotNode } from "./types";

export const TOT_EDUCATIONAL_DISCLOSURE =
  "Educational simulation: Candidate reasoning paths generated and scored via deliberate tree search; this visualizes externalized exploration strategies, not private model internal activations.";

export interface TotPresetProblem {
  id: string;
  title: string;
  problem: string;
  description: string;
}

export const TOT_PRESETS: TotPresetProblem[] = [
  {
    id: "cache-invalidation",
    title: "Distributed Cache Freshness",
    problem:
      "Design a multi-region cache invalidation protocol that guarantees sub-10ms consistency for 50k writes/sec without locking global databases.",
    description:
      "System design challenge comparing dual-write, event bus changelog, and lease-based versioning approaches.",
  },
  {
    id: "game-of-24",
    title: "Game of 24 Logic Puzzle",
    problem:
      "Using the numbers [4, 7, 8, 8] and basic arithmetic (+, -, *, /) where each number must be used exactly once, reach exactly 24.",
    description:
      "Symbolic arithmetic search exploring operator precedence and branch pruning.",
  },
  {
    id: "guardrail-latency",
    title: "Enterprise LLM Guardrail Pipeline",
    problem:
      "Architect a multi-tier prompt injection defense system that screens inputs against jailbreaks in < 40ms without dropping good user queries.",
    description:
      "AI security tradeoff comparing regex/heuristics, lightweight classifier embedding, and full secondary LLM check.",
  },
];

interface CandidateTemplate {
  title: string;
  thoughtSummary: string;
  feasibility: { score: number; reason: string };
  soundness: { score: number; reason: string };
  completeness: { score: number; reason: string };
  isWinningBranch?: boolean;
  children?: CandidateTemplate[];
}

/**
 * Pre-engineered high-rigor tree structures for educational presets
 */
const PRESET_TREES: Record<string, CandidateTemplate[]> = {
  "cache-invalidation": [
    {
      title: "Approach A: Distributed Two-Phase Commit (2PC)",
      thoughtSummary:
        "Coordinate synchronous prepare and commit phases across all regional redis clusters simultaneously on each write.",
      feasibility: {
        score: 2,
        reason:
          "High cross-continental network latency (>120ms roundtrip) violates the strict 10ms boundary.",
      },
      soundness: {
        score: 4,
        reason:
          "Mathematically sound serializability, but vulnerable to blocking coordinator failures.",
      },
      completeness: {
        score: 3,
        reason: "Does not account for partial partition tolerance under split-brain conditions.",
      },
      isWinningBranch: false,
    },
    {
      title: "Approach B: Raft-Replicated Event Log with Monotonic Version Leases",
      thoughtSummary:
        "Publish writes to regional Raft log with monotonic microsecond sequence IDs and local read-through leases.",
      feasibility: {
        score: 5,
        reason:
          "Local reads hit cached leases in < 2ms; background sequence stream syncs asynchronously in single-digit ms.",
      },
      soundness: {
        score: 5,
        reason:
          "Monotonic ordering prevents out-of-order stale overrides; lease invalidation prevents dirty reads.",
      },
      completeness: {
        score: 5,
        reason:
          "Includes explicit handling for network blips, clock skew mitigation, and fallback to origin.",
      },
      isWinningBranch: true,
      children: [
        {
          title: "Sub-path B1: Push-based Invalidation via Geo-Replicated NATS/Kafka",
          thoughtSummary:
            "Propagate tombstone envelopes over geo-mesh stream; nodes immediately invalidate key version.",
          feasibility: {
            score: 5,
            reason: "Standard high-throughput pub/sub handles 50k msgs/sec easily with 4-8ms p99 transit.",
          },
          soundness: {
            score: 5,
            reason: "Idempotent tombstone versioning ensures safe replays.",
          },
          completeness: {
            score: 5,
            reason: "Fully addresses edge failovers and heartbeat recovery.",
          },
          isWinningBranch: true,
        },
        {
          title: "Sub-path B2: Short TTL Polling with Vector Clocks",
          thoughtSummary:
            "Rely on 200ms ultra-short TTL combined with client-carried vector clock headers.",
          feasibility: {
            score: 3,
            reason: "Massive origin DB read amplification on cache stampedes when TTL expires.",
          },
          soundness: {
            score: 4,
            reason: "Causal ordering preserved, but 200ms window allows stale telemetry reads.",
          },
          completeness: {
            score: 3,
            reason: "Lacks thundering-herd lock protection.",
          },
          isWinningBranch: false,
        },
      ],
    },
    {
      title: "Approach C: Pure Local TTL Caching with Client Cache Busting",
      thoughtSummary:
        "Rely strictly on deterministic short 1-second TTL without any inter-region broadcast invalidation.",
      feasibility: {
        score: 4,
        reason: "Trivially simple to operate with standard CDN/Redis edges.",
      },
      soundness: {
        score: 1,
        reason:
          "Fails hard requirement: allows up to 1000ms of stale reads, which violates the sub-10ms consistency rule.",
      },
      completeness: {
        score: 2,
        reason: "Completely ignores multi-region consistency contract.",
      },
      isWinningBranch: false,
    },
  ],

  "game-of-24": [
    {
      title: "Candidate 1: Product Multiplication First (8 * 8 = 64)",
      thoughtSummary:
        "Multiply the two 8s to get 64, then attempt to reach 24 using remaining 4 and 7.",
      feasibility: {
        score: 2,
        reason: "64 - (4 * 7) = 36 != 24. 64 / 4 - 7 = 9 != 24. No combination yields 24.",
      },
      soundness: {
        score: 4,
        reason: "Arithmetic evaluated correctly, but path is a dead end.",
      },
      completeness: {
        score: 3,
        reason: "Explored two branches before confirming no valid solution.",
      },
      isWinningBranch: false,
    },
    {
      title: "Candidate 2: Factor Decomposition (Targeting 8 * 3 = 24)",
      thoughtSummary:
        "Form a factor of 3 or 8 using the remaining three numbers [4, 7, 8]. Notice 7 - (8 / 4) = 7 - 2 = 5, or (7 - 4) = 3!",
      feasibility: {
        score: 5,
        reason: "With (7 - 4) = 3, we have 3, 8, 8 remaining. Still have an extra 8 to integrate.",
      },
      soundness: {
        score: 4,
        reason: "Good intermediate step towards 24.",
      },
      completeness: {
        score: 4,
        reason: "Examines factor groups systematically.",
      },
      isWinningBranch: false,
    },
    {
      title: "Candidate 3: Difference Subtraction Approach ((7 - (8 / 8)) * 4 = 24)",
      thoughtSummary:
        "Evaluate: 8 / 8 = 1. Then 7 - 1 = 6. Then 6 * 4 = 24! Every number [4, 7, 8, 8] used exactly once.",
      feasibility: {
        score: 5,
        reason: "Exact closed-form solution: (7 - (8 / 8)) * 4 = (7 - 1) * 4 = 6 * 4 = 24.",
      },
      soundness: {
        score: 5,
        reason: "Mathematically rigorous and verifies all four numbers used once.",
      },
      completeness: {
        score: 5,
        reason: "Validates all puzzle constraints cleanly.",
      },
      isWinningBranch: true,
      children: [
        {
          title: "Sub-path 3A: Direct Verification ((7 - 1) * 4)",
          thoughtSummary:
            "Final syntax check: 8/8 = 1 (valid integers), 7 - 1 = 6 (positive), 6 * 4 = 24 (exact target).",
          feasibility: { score: 5, reason: "Zero remaining ambiguity." },
          soundness: { score: 5, reason: "Confirmed identity (7 - 8/8) * 4 == 24." },
          completeness: { score: 5, reason: "All arithmetic constraints satisfied." },
          isWinningBranch: true,
        },
      ],
    },
  ],

  "guardrail-latency": [
    {
      title: "Strategy 1: Heavyweight Secondary LLM Judge Call",
      thoughtSummary:
        "Pass every raw prompt through a separate 70B parameter evaluator with few-shot safety rules.",
      feasibility: {
        score: 1,
        reason:
          "Secondary LLM call introduces 250-600ms latency, decisively breaking the < 40ms requirement.",
      },
      soundness: {
        score: 4,
        reason: "High contextual comprehension, but prohibitive latency and cost.",
      },
      completeness: {
        score: 4,
        reason: "Catches subtle adversarial framing.",
      },
      isWinningBranch: false,
    },
    {
      title: "Strategy 2: Tiered Multi-Stage Filter (Regex -> Embedding -> Token Perplexity)",
      thoughtSummary:
        "Stage 1: Aho-Corasick trie matching for known exploit patterns (<1ms). Stage 2: Small ONNX bi-encoder cosine similarity to known jailbreak vector cluster (<15ms). Stage 3: Perplexity heuristic (<5ms).",
      feasibility: {
        score: 5,
        reason: "Total pipeline executes in 18-24ms p95 on edge CPU/GPU, comfortably below 40ms.",
      },
      soundness: {
        score: 5,
        reason:
          "Fast-exit on clean prompts prevents wasteful computation; vector distance catches paraphrased attacks.",
      },
      completeness: {
        score: 5,
        reason:
          "Addresses latency, recall, false-positive threshold tuning, and canary logging.",
      },
      isWinningBranch: true,
      children: [
        {
          title: "Sub-path 2A: Semantic Vector Clustering with ONNX MiniLM",
          thoughtSummary:
            "Precompute centroid embeddings for 'ignore previous instructions', role-play exploits, and delimiter injections. Quantize to INT8.",
          feasibility: {
            score: 5,
            reason: "INT8 MiniLM runs in ~8ms on modern edge instances.",
          },
          soundness: {
            score: 5,
            reason: "Cosine distance threshold of 0.82 balances precision and recall cleanly.",
          },
          completeness: {
            score: 5,
            reason: "Includes false-positive bypass whitelist for dev environments.",
          },
          isWinningBranch: true,
        },
        {
          title: "Sub-path 2B: Strict Regex Blacklist Only",
          thoughtSummary:
            "Rely exclusively on exact string and regex matching for injection verbs.",
          feasibility: {
            score: 5,
            reason: "Blazing fast (<0.5ms).",
          },
          soundness: {
            score: 2,
            reason:
              "Easily bypassed by Base64 encoding, leetspeak, or simple semantic synonyms.",
          },
          completeness: {
            score: 2,
            reason: "Inadequate against modern prompt injection variants.",
          },
          isWinningBranch: false,
        },
      ],
    },
    {
      title: "Strategy 3: Output-Only Scanning",
      thoughtSummary:
        "Allow all prompts through uninspected; only filter the model's generated output for leaked secrets.",
      feasibility: {
        score: 4,
        reason: "Low overhead on the ingress path.",
      },
      soundness: {
        score: 2,
        reason:
          "Leaves the model vulnerable to goal hijacking, recursive tool execution, and denial-of-wallet exploits.",
      },
      completeness: {
        score: 2,
        reason: "Leaves prompt injection vulnerability completely open.",
      },
      isWinningBranch: false,
    },
  ],
};

/**
 * Builds or synthesizes a Tree-of-Thoughts state for a given prompt.
 */
export function buildTreeOfThoughts(
  problemPrompt: string,
  presetId?: string
): TotTreeState {
  const matchedKey =
    presetId ||
    Object.keys(PRESET_TREES).find((k) =>
      problemPrompt.toLowerCase().includes(k.replace("-", " "))
    ) ||
    "cache-invalidation";

  const templateBranches =
    PRESET_TREES[matchedKey] || PRESET_TREES["cache-invalidation"];

  const nodes: Record<string, TotNode> = {};
  const rootId = "tot-root";

  // Root Problem Node
  nodes[rootId] = {
    id: rootId,
    parentId: null,
    depth: 0,
    title: "Root: Target Objective",
    thoughtSummary: problemPrompt,
    scores: {
      feasibility: { score: 5, maxScore: 5, reason: "Root problem specification" },
      soundness: { score: 5, maxScore: 5, reason: "Well-defined constraints" },
      completeness: { score: 5, maxScore: 5, reason: "Context provided" },
    },
    status: "selected",
    expanded: true,
    childrenIds: [],
    isChosenPath: true,
  };

  let candidateCount = 0;
  let chosenLeafId: string | null = null;
  const chosenPathIds = [rootId];

  // Level 1 Nodes
  templateBranches.forEach((t1, idx1) => {
    const id1 = `tot-node-1-${idx1 + 1}`;
    nodes[rootId].childrenIds.push(id1);
    candidateCount++;

    const isLevel1Winner = !!t1.isWinningBranch;
    if (isLevel1Winner) {
      chosenPathIds.push(id1);
    }

    const node1: TotNode = {
      id: id1,
      parentId: rootId,
      depth: 1,
      title: t1.title,
      thoughtSummary: t1.thoughtSummary,
      scores: {
        feasibility: { ...t1.feasibility, maxScore: 5 },
        soundness: { ...t1.soundness, maxScore: 5 },
        completeness: { ...t1.completeness, maxScore: 5 },
      },
      status: isLevel1Winner ? "selected" : t1.feasibility.score < 3 ? "pruned" : "candidate",
      expanded: isLevel1Winner,
      childrenIds: [],
      isChosenPath: isLevel1Winner,
    };

    // Level 2 Children
    if (t1.children && t1.children.length > 0) {
      t1.children.forEach((t2, idx2) => {
        const id2 = `${id1}-sub-${idx2 + 1}`;
        node1.childrenIds.push(id2);
        candidateCount++;

        const isLevel2Winner = isLevel1Winner && !!t2.isWinningBranch;
        if (isLevel2Winner) {
          chosenPathIds.push(id2);
          chosenLeafId = id2;
        }

        nodes[id2] = {
          id: id2,
          parentId: id1,
          depth: 2,
          title: t2.title,
          thoughtSummary: t2.thoughtSummary,
          scores: {
            feasibility: { ...t2.feasibility, maxScore: 5 },
            soundness: { ...t2.soundness, maxScore: 5 },
            completeness: { ...t2.completeness, maxScore: 5 },
          },
          status: isLevel2Winner ? "selected" : "candidate",
          expanded: true,
          childrenIds: [],
          isChosenPath: isLevel2Winner,
        };
      });
    } else if (isLevel1Winner && !chosenLeafId) {
      chosenLeafId = id1;
    }

    nodes[id1] = node1;
  });

  return {
    problemPrompt,
    rootNodeId: rootId,
    nodes,
    chosenLeafId: chosenLeafId || chosenPathIds[chosenPathIds.length - 1],
    chosenPathNodeIds: chosenPathIds,
    totalCandidateThoughts: candidateCount,
    maxDepth: 2,
    educationalDisclosure: TOT_EDUCATIONAL_DISCLOSURE,
  };
}
