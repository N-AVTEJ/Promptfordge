/**
 * PromptForge Gamified Challenges & Badges Storage Module
 * Stores missions, difficulty, points, completed status, and unlocked badges in localStorage.
 * Automatic verification against other lab records (Compare Experiments, Arena, Workflows, Academy).
 */

import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
} from "./index";
import { useEffect, useState, useCallback } from "react";
import { getArenaProgress } from "./arena";
import { getSavedWorkflows } from "./workflow";
import { getStoredProgress } from "./progress";
import { getSavedPrompts } from "./library";

export const CHALLENGES_CHANGE_EVENT = "promptforge:challenges-updated";

export type MissionDifficulty = "easy" | "medium" | "hard" | "expert";
export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export interface ChallengeMission {
  id: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: MissionDifficulty;
  points: number;
  labRoute: string;
  labName: string;
  targetRequirement: string;
  hint: string;
  checkType:
    | "compare_few_shot"
    | "anatomy_components"
    | "optimize_clarity"
    | "arena_level_1"
    | "arena_level_2"
    | "workflow_nodes"
    | "reasoning_depth"
    | "red_blue_defense"
    | "academy_scholar";
}

export interface ChallengeBadge {
  id: string;
  name: string;
  title: string;
  description: string;
  tier: BadgeTier;
  minPoints: number;
  iconName: string;
}

export interface ChallengesData {
  completedMissionIds: string[];
  unlockedBadgeIds: string[];
  totalPoints: number;
  completedAt: Record<string, number>;
  badgeUnlockedAt: Record<string, number>;
  lastCompletedMissionId?: string;
  lastUnlockedBadgeId?: string;
}

export const MISSIONS: ChallengeMission[] = [
  {
    id: "few-shot-beats-zero-shot",
    title: "Format Master (Few-Shot Superiority)",
    tagline: "Get few-shot prompting to beat zero-shot on format compliance.",
    description:
      "Run an experiment in the Technique Comparison Lab comparing Zero-Shot and Few-Shot on a structured JSON output task, proving that Few-Shot yields superior format compliance.",
    difficulty: "medium",
    points: 100,
    labRoute: "/labs/compare",
    labName: "Technique Comparison Lab",
    targetRequirement: "Few-Shot Format Compliance score > Zero-Shot Format Compliance score in saved comparison experiments.",
    hint: "Navigate to /labs/compare, choose 'JSON Extraction', select Zero-Shot and Few-Shot, and run the benchmark.",
    checkType: "compare_few_shot",
  },
  {
    id: "prompt-anatomist",
    title: "Prompt Anatomist",
    tagline: "Inspect the five core anatomical components of robust prompts.",
    description:
      "Identify Role, Task, Context, Constraints, and Few-Shot components inside the Prompt Anatomy Visualizer without missing structural boundaries.",
    difficulty: "easy",
    points: 50,
    labRoute: "/labs/anatomy",
    labName: "Prompt Anatomy Visualizer",
    targetRequirement: "Explore the canonical prompt breakdown in /labs/anatomy.",
    hint: "Open /labs/anatomy and inspect the highlighted token boundaries for all 5 components.",
    checkType: "anatomy_components",
  },
  {
    id: "precision-optimizer",
    title: "Precision Optimizer",
    tagline: "Cut prompt token bloat while raising clarity >= 80%.",
    description:
      "Optimize a prompt using the multi-axis Prompt Optimizer and save a version to your Library with high clarity and low verbosity.",
    difficulty: "medium",
    points: 100,
    labRoute: "/labs/optimize",
    labName: "Prompt Optimizer",
    targetRequirement: "At least one saved prompt version with clarity score >= 80%.",
    hint: "Run optimization on a verbose prompt in /labs/optimize and click 'Save to Library'.",
    checkType: "optimize_clarity",
  },
  {
    id: "security-initiate",
    title: "Security Initiate",
    tagline: "Neutralize direct prompt injection attacks.",
    description:
      "Defend against Level 1 direct instruction override attacks in the Security Arena by crafting a defensive system boundary.",
    difficulty: "easy",
    points: 50,
    labRoute: "/arena",
    labName: "Security Arena",
    targetRequirement: "Complete Level 1 in the Security Arena.",
    hint: "Go to /arena, select Level 1, and defend against the secret leak attempt.",
    checkType: "arena_level_1",
  },
  {
    id: "perimeter-sentinel",
    title: "Perimeter Sentinel",
    tagline: "Repel persona impersonation and jailbreaks.",
    description:
      "Clear both Level 1 and Level 2 in the Security Arena by establishing impervious system instructions against roleplay exploits.",
    difficulty: "medium",
    points: 100,
    labRoute: "/arena",
    labName: "Security Arena",
    targetRequirement: "Complete Levels 1 and 2 in the Security Arena.",
    hint: "Clear Level 2 in the Security Arena with a resilient role-defense prompt.",
    checkType: "arena_level_2",
  },
  {
    id: "workflow-orchestrator",
    title: "Workflow Orchestrator",
    tagline: "Construct an agentic DAG pipeline with 3+ interconnected nodes.",
    description:
      "Design an execution workflow in the Visual Workflow Studio containing at least 3 nodes (e.g. Prompt -> Router -> Evaluator).",
    difficulty: "hard",
    points: 150,
    labRoute: "/workflow",
    labName: "Workflow Builder",
    targetRequirement: "A custom or template workflow with >= 3 connected nodes.",
    hint: "Open /workflow and design or run an agentic pipeline.",
    checkType: "workflow_nodes",
  },
  {
    id: "reasoning-cartographer",
    title: "Reasoning Cartographer",
    tagline: "Explore Tree-of-Thought search paths to depth 3.",
    description:
      "Investigate multi-branch reasoning paths with Tree-of-Thought exploration and evaluate candidate thoughts.",
    difficulty: "hard",
    points: 150,
    labRoute: "/labs/reasoning",
    labName: "Reasoning Playground",
    targetRequirement: "Explore deep reasoning branches in the Reasoning Playground.",
    hint: "Open /labs/reasoning, choose Tree-of-Thought, and explore reasoning candidates.",
    checkType: "reasoning_depth",
  },
  {
    id: "red-blue-champion",
    title: "Red vs Blue Champion",
    tagline: "Defend against an 8-attack adversarial benchmark with >= 75% defense rate.",
    description:
      "Submit a hardened defensive system prompt in Red vs Blue arena mode that stops at least 6 out of 8 automated attack vectors.",
    difficulty: "expert",
    points: 200,
    labRoute: "/arena",
    labName: "Security Arena (Red vs Blue)",
    targetRequirement: "Achieve best Red vs Blue defense fraction >= 75% (e.g. 6/8, 7/8, or 8/8).",
    hint: "Switch to Red vs Blue mode in /arena, enforce delimitation and leak detection.",
    checkType: "red_blue_defense",
  },
  {
    id: "curriculum-scholar",
    title: "Academy Scholar",
    tagline: "Pass comprehension quizzes for 3 or more Academy lessons.",
    description:
      "Work through the foundational prompt engineering lessons in the Academy and achieve passing scores (>= 66%) on at least 3 lesson quizzes.",
    difficulty: "easy",
    points: 50,
    labRoute: "/academy",
    labName: "Academy Curriculum",
    targetRequirement: "At least 3 completed lessons in the Academy.",
    hint: "Read lessons in Module 1 and 2 and submit their comprehension quizzes.",
    checkType: "academy_scholar",
  },
];

export const BADGES: ChallengeBadge[] = [
  {
    id: "iron-scribe",
    name: "Iron Scribe",
    title: "Novice Practitioner",
    description: "Earned your first 50 points in PromptForge missions.",
    tier: "bronze",
    minPoints: 50,
    iconName: "Feather",
  },
  {
    id: "logic-forger",
    name: "Logic Forger",
    title: "Technique Specialist",
    description: "Mastered comparison metrics and structured prompting (150+ points).",
    tier: "silver",
    minPoints: 150,
    iconName: "Sparkles",
  },
  {
    id: "security-sentinel",
    name: "Security Sentinel",
    title: "Adversarial Defender",
    description: "Demonstrated impervious system prompt defenses against attack vectors (300+ points).",
    tier: "gold",
    minPoints: 300,
    iconName: "ShieldCheck",
  },
  {
    id: "prompt-alchemist",
    name: "Prompt Alchemist",
    title: "Systems Architect",
    description: "Built multi-agent pipelines and mastered advanced reasoning search (500+ points).",
    tier: "gold",
    minPoints: 500,
    iconName: "Cpu",
  },
  {
    id: "forge-grandmaster",
    name: "Grandmaster of the Forge",
    title: "Apex Prompt Engineer",
    description: "Supreme mastery across all PromptForge laboratories, arena, and benchmarks (750+ points).",
    tier: "platinum",
    minPoints: 750,
    iconName: "Flame",
  },
];

export const DEFAULT_CHALLENGES_STATE: ChallengesData = {
  completedMissionIds: [],
  unlockedBadgeIds: [],
  totalPoints: 0,
  completedAt: {},
  badgeUnlockedAt: {},
};

function emitChallengesChange(data: ChallengesData) {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent(CHALLENGES_CHANGE_EVENT, { detail: data })
      );
    } catch {
      // Ignore during SSR or unit test environments
    }
  }
}

/**
 * Retrieve challenges state from localStorage.
 */
export function getStoredChallenges(): ChallengesData {
  const current = getStorageItem(STORAGE_KEYS.CHALLENGES);
  if (!current || typeof current !== "object") {
    return { ...DEFAULT_CHALLENGES_STATE };
  }

  const completedMissionIds = Array.isArray(current.completedMissionIds)
    ? current.completedMissionIds.filter((id): id is string => typeof id === "string")
    : [];

  const unlockedBadgeIds = Array.isArray(current.unlockedBadgeIds)
    ? current.unlockedBadgeIds.filter((id): id is string => typeof id === "string")
    : [];

  const completedAt = current.completedAt && typeof current.completedAt === "object"
    ? current.completedAt
    : {};

  const badgeUnlockedAt = current.badgeUnlockedAt && typeof current.badgeUnlockedAt === "object"
    ? current.badgeUnlockedAt
    : {};

  const totalPoints = typeof current.totalPoints === "number"
    ? current.totalPoints
    : calculateTotalPoints(completedMissionIds);

  return {
    completedMissionIds,
    unlockedBadgeIds,
    totalPoints,
    completedAt,
    badgeUnlockedAt,
    lastCompletedMissionId: current.lastCompletedMissionId,
    lastUnlockedBadgeId: current.lastUnlockedBadgeId,
  };
}

/**
 * Calculate total points based on completed missions.
 */
export function calculateTotalPoints(completedMissionIds: string[]): number {
  const set = new Set(completedMissionIds);
  return MISSIONS.reduce((acc, m) => (set.has(m.id) ? acc + m.points : acc), 0);
}

/**
 * Compute which badges should be unlocked given a point total.
 */
export function computeUnlockedBadges(points: number): string[] {
  return BADGES.filter((b) => points >= b.minPoints).map((b) => b.id);
}

/**
 * Perform automatic check for a single mission against stored application state.
 */
export function checkMissionRequirement(mission: ChallengeMission): {
  passed: boolean;
  message: string;
} {
  switch (mission.checkType) {
    case "compare_few_shot": {
      const experiments = getStorageItem(STORAGE_KEYS.COMPARE_EXPERIMENTS);
      if (!Array.isArray(experiments) || experiments.length === 0) {
        return {
          passed: false,
          message: "No comparison experiments found. Run a comparison between Zero-Shot and Few-Shot in /labs/compare.",
        };
      }
      for (const exp of experiments) {
        if (!Array.isArray(exp.results)) continue;
        interface ResultEntry {
          techniqueId?: string;
          formatComplianceSpread?: { mean?: number };
        }
        const results = exp.results as ResultEntry[];
        const zero = results.find((r) => r.techniqueId === "zero-shot");
        const few = results.find((r) => r.techniqueId === "few-shot");
        if (zero && few) {
          const zeroScore = zero.formatComplianceSpread?.mean ?? 0;
          const fewScore = few.formatComplianceSpread?.mean ?? 0;
          if (fewScore > zeroScore) {
            const taskLabel = (exp.task || "Experiment").slice(0, 30);
            return {
              passed: true,
              message: `Few-Shot (${Math.round(fewScore * 100)}%) successfully beat Zero-Shot (${Math.round(zeroScore * 100)}%) on format compliance in experiment "${taskLabel}...".`,
            };
          }
        }
      }
      return {
        passed: false,
        message: "No experiment yet where Few-Shot beat Zero-Shot on format compliance. Try testing JSON or table output formatting.",
      };
    }

    case "anatomy_components": {
      // Can be verified if anatomy lab was visited or completed in progress
      const progress = getStoredProgress();
      const inCompleted = progress.completedLabIds?.includes("anatomy");
      const drafts = getStorageItem(STORAGE_KEYS.LAB_DRAFTS);
      const explored = drafts && (drafts["anatomy"] || drafts["spec-sample"]);
      if (inCompleted || explored) {
        return {
          passed: true,
          message: "Prompt Anatomy Visualizer components inspected.",
        };
      }
      return {
        passed: false,
        message: "Visit /labs/anatomy and inspect the five structural components to claim.",
      };
    }

    case "optimize_clarity": {
      const prompts = getSavedPrompts();
      for (const p of prompts) {
        if (Array.isArray(p.versions)) {
          for (const v of p.versions) {
            const clarity = v.metrics?.clarity;
            if (clarity !== undefined) {
              const normalizedClarity = clarity <= 5 ? clarity * 20 : clarity;
              if (normalizedClarity >= 80) {
                return {
                  passed: true,
                  message: `Prompt "${p.title}" achieved ${Math.round(normalizedClarity)}% clarity score.`,
                };
              }
            }
          }
        }
      }
      return {
        passed: false,
        message: "No saved prompt found with clarity score >= 80%. Run an optimization in /labs/optimize and save to library.",
      };
    }

    case "arena_level_1": {
      const arena = getArenaProgress();
      if (arena.completedLevels.includes(1)) {
        return {
          passed: true,
          message: "Level 1 (Direct Instruction Override) completed in Security Arena.",
        };
      }
      return {
        passed: false,
        message: "Level 1 not yet completed in the Security Arena.",
      };
    }

    case "arena_level_2": {
      const arena = getArenaProgress();
      if (arena.completedLevels.includes(1) && arena.completedLevels.includes(2)) {
        return {
          passed: true,
          message: "Levels 1 & 2 completed in Security Arena.",
        };
      }
      return {
        passed: false,
        message: "Complete both Level 1 and Level 2 in /arena to unlock.",
      };
    }

    case "workflow_nodes": {
      const workflows = getSavedWorkflows();
      for (const wf of workflows) {
        if (Array.isArray(wf.nodes) && wf.nodes.length >= 3) {
          return {
            passed: true,
            message: `Workflow "${wf.name}" contains ${wf.nodes.length} connected nodes.`,
          };
        }
      }
      return {
        passed: false,
        message: "No workflow found with 3 or more nodes. Build or configure a workflow in /workflow.",
      };
    }

    case "reasoning_depth": {
      // Check if user visited or interacted with reasoning lab
      const progress = getStoredProgress();
      const drafts = getStorageItem(STORAGE_KEYS.LAB_DRAFTS);
      const explored = drafts && (drafts["reasoning"] || drafts["tot"]);
      if (progress.completedLabIds?.includes("reasoning") || explored) {
        return {
          passed: true,
          message: "Reasoning Playground exploration verified.",
        };
      }
      return {
        passed: false,
        message: "Explore Tree-of-Thought candidates in /labs/reasoning to unlock.",
      };
    }

    case "red_blue_defense": {
      const arena = getArenaProgress();
      if (arena.bestRedVsBlueFraction) {
        const [blocked, total] = arena.bestRedVsBlueFraction.split("/").map(Number);
        if (total > 0 && blocked / total >= 0.75) {
          return {
            passed: true,
            message: `Red vs Blue defense achieved ${arena.bestRedVsBlueFraction} (${Math.round((blocked / total) * 100)}% defense rate).`,
          };
        }
      }
      return {
        passed: false,
        message: "Achieve at least 75% defense (6/8 attacks blocked) in /arena Red vs Blue mode.",
      };
    }

    case "academy_scholar": {
      const progress = getStoredProgress();
      if (progress.completedLessonIds.length >= 3) {
        return {
          passed: true,
          message: `${progress.completedLessonIds.length} Academy lessons completed.`,
        };
      }
      return {
        passed: false,
        message: `Currently completed ${progress.completedLessonIds.length}/3 required Academy lessons.`,
      };
    }

    default:
      return { passed: false, message: "Unknown requirement check." };
  }
}

/**
 * Complete a mission, update points and badges, and return update details.
 */
export function completeMission(
  missionId: string,
  force = false
): {
  success: boolean;
  message: string;
  newlyUnlockedBadges: ChallengeBadge[];
  mission?: ChallengeMission;
  updatedState: ChallengesData;
} {
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) {
    return {
      success: false,
      message: "Mission not found.",
      newlyUnlockedBadges: [],
      updatedState: getStoredChallenges(),
    };
  }

  const current = getStoredChallenges();
  if (current.completedMissionIds.includes(missionId) && !force) {
    return {
      success: true,
      message: "Mission is already completed.",
      newlyUnlockedBadges: [],
      mission,
      updatedState: current,
    };
  }

  if (!force) {
    const check = checkMissionRequirement(mission);
    if (!check.passed) {
      return {
        success: false,
        message: check.message,
        newlyUnlockedBadges: [],
        mission,
        updatedState: current,
      };
    }
  }

  const newCompletedIds = Array.from(new Set([...current.completedMissionIds, missionId]));
  const newPoints = calculateTotalPoints(newCompletedIds);
  const eligibleBadgeIds = computeUnlockedBadges(newPoints);
  const previouslyUnlocked = new Set(current.unlockedBadgeIds);
  const newlyUnlockedBadgeIds = eligibleBadgeIds.filter((id) => !previouslyUnlocked.has(id));

  const completedAt = {
    ...current.completedAt,
    [missionId]: current.completedAt[missionId] || Date.now(),
  };

  const badgeUnlockedAt = { ...current.badgeUnlockedAt };
  const now = Date.now();
  newlyUnlockedBadgeIds.forEach((id) => {
    badgeUnlockedAt[id] = now;
  });

  const updated: ChallengesData = {
    completedMissionIds: newCompletedIds,
    unlockedBadgeIds: eligibleBadgeIds,
    totalPoints: newPoints,
    completedAt,
    badgeUnlockedAt,
    lastCompletedMissionId: missionId,
    lastUnlockedBadgeId: newlyUnlockedBadgeIds[newlyUnlockedBadgeIds.length - 1] || current.lastUnlockedBadgeId,
  };

  setStorageItem(STORAGE_KEYS.CHALLENGES, updated);
  emitChallengesChange(updated);

  const newlyUnlockedBadges = BADGES.filter((b) => newlyUnlockedBadgeIds.includes(b.id));

  return {
    success: true,
    message: `Mission "${mission.title}" completed! +${mission.points} points.`,
    newlyUnlockedBadges,
    mission,
    updatedState: updated,
  };
}

/**
 * Evaluates all missions against stored progress and auto-completes any that meet requirements.
 */
export function autoCheckAllMissions(): {
  completedMissions: ChallengeMission[];
  newlyUnlockedBadges: ChallengeBadge[];
  totalPoints: number;
} {
  const current = getStoredChallenges();
  const previouslyCompleted = new Set(current.completedMissionIds);
  const completedMissions: ChallengeMission[] = [];
  const newlyUnlockedBadges: ChallengeBadge[] = [];

  for (const mission of MISSIONS) {
    if (!previouslyCompleted.has(mission.id)) {
      const check = checkMissionRequirement(mission);
      if (check.passed) {
        const res = completeMission(mission.id, true);
        if (res.success && res.mission) {
          completedMissions.push(res.mission);
          newlyUnlockedBadges.push(...res.newlyUnlockedBadges);
        }
      }
    }
  }

  const finalState = getStoredChallenges();
  return {
    completedMissions,
    newlyUnlockedBadges,
    totalPoints: finalState.totalPoints,
  };
}

/**
 * Reset all challenge progress.
 */
export function resetChallenges(): ChallengesData {
  const fresh = { ...DEFAULT_CHALLENGES_STATE };
  setStorageItem(STORAGE_KEYS.CHALLENGES, fresh);
  emitChallengesChange(fresh);
  return fresh;
}

/**
 * React Hook for interactive gamified challenges state.
 */
export function useChallenges() {
  const [challenges, setChallenges] = useState<ChallengesData>(DEFAULT_CHALLENGES_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const initial = getStoredChallenges();
    setChallenges(initial);

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<ChallengesData>;
      if (customEvent.detail) {
        setChallenges(customEvent.detail);
      } else {
        setChallenges(getStoredChallenges());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CHALLENGES || !e.key) {
        setChallenges(getStoredChallenges());
      }
    };

    window.addEventListener(CHALLENGES_CHANGE_EVENT, handleCustom);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CHALLENGES_CHANGE_EVENT, handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const complete = useCallback((missionId: string, force = false) => {
    const res = completeMission(missionId, force);
    setChallenges(res.updatedState);
    return res;
  }, []);

  const autoCheck = useCallback(() => {
    const res = autoCheckAllMissions();
    setChallenges(getStoredChallenges());
    return res;
  }, []);

  const reset = useCallback(() => {
    const fresh = resetChallenges();
    setChallenges(fresh);
    return fresh;
  }, []);

  return {
    challenges,
    isHydrated,
    missions: MISSIONS,
    badges: BADGES,
    complete,
    autoCheck,
    reset,
  };
}
