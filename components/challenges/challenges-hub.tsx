"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Flame,
  RefreshCw,
  Feather,
  Cpu,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  Target,
} from "lucide-react";
import {
  useChallenges,
  ChallengeMission,
  ChallengeBadge,
  MissionDifficulty,
} from "@/lib/storage/challenges";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const DIFFICULTY_CONFIG: Record<
  MissionDifficulty,
  { label: string; bg: string; text: string; border: string }
> = {
  easy: {
    label: "Easy",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  medium: {
    label: "Medium",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  hard: {
    label: "Hard",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
  expert: {
    label: "Expert",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
  },
};

const TIER_CONFIG: Record<
  string,
  { label: string; border: string; glow: string; text: string; bg: string }
> = {
  bronze: {
    label: "Bronze Tier",
    border: "border-amber-700/40",
    glow: "shadow-sm",
    text: "text-amber-700",
    bg: "bg-butter/50",
  },
  silver: {
    label: "Silver Tier",
    border: "border-slate-400/40",
    glow: "shadow-sm",
    text: "text-slate-600",
    bg: "bg-white",
  },
  gold: {
    label: "Gold Tier",
    border: "border-yellow-500/50",
    glow: "shadow-sm",
    text: "text-yellow-600",
    bg: "bg-butter/70",
  },
  platinum: {
    label: "Platinum Tier",
    border: "border-teal/50",
    glow: "shadow-sm",
    text: "text-teal",
    bg: "bg-mint/50",
  },
};

function renderBadgeIcon(iconName: string, className = "h-6 w-6") {
  switch (iconName) {
    case "Feather":
      return <Feather className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "ShieldCheck":
      return <ShieldCheck className={className} />;
    case "Cpu":
      return <Cpu className={className} />;
    case "Flame":
      return <Flame className={className} />;
    default:
      return <Award className={className} />;
  }
}

export function ChallengesHub() {
  const { challenges, missions, badges, complete, autoCheck, reset, isHydrated } =
    useChallenges();
  const prefersReduced = useReducedMotion();

  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "completed">("all");
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});
  const [verificationFeedback, setVerificationFeedback] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const [unlockModalBadge, setUnlockModalBadge] = useState<ChallengeBadge | null>(null);
  const [isAutoChecking, setIsAutoChecking] = useState(false);

  // Auto-check on first hydration to credit any previously completed lab work
  useEffect(() => {
    if (isHydrated) {
      const res = autoCheck();
      if (res.newlyUnlockedBadges.length > 0) {
        setUnlockModalBadge(res.newlyUnlockedBadges[0]);
      }
    }
  }, [isHydrated, autoCheck]);

  const completedSet = useMemo(
    () => new Set(challenges.completedMissionIds),
    [challenges.completedMissionIds]
  );
  const unlockedBadgesSet = useMemo(
    () => new Set(challenges.unlockedBadgeIds),
    [challenges.unlockedBadgeIds]
  );

  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      if (difficultyFilter !== "all" && m.difficulty !== difficultyFilter) {
        return false;
      }
      const isCompleted = completedSet.has(m.id);
      if (statusFilter === "completed" && !isCompleted) return false;
      if (statusFilter === "in_progress" && isCompleted) return false;
      return true;
    });
  }, [missions, difficultyFilter, statusFilter, completedSet]);

  const handleVerify = (mission: ChallengeMission) => {
    const res = complete(mission.id);
    setVerificationFeedback((prev) => ({
      ...prev,
      [mission.id]: {
        success: res.success,
        message: res.message,
      },
    }));

    if (res.newlyUnlockedBadges.length > 0) {
      setUnlockModalBadge(res.newlyUnlockedBadges[0]);
    }
  };

  const handleAutoCheckAll = () => {
    setIsAutoChecking(true);
    try {
      const res = autoCheck();
      if (res.newlyUnlockedBadges.length > 0) {
        setUnlockModalBadge(res.newlyUnlockedBadges[0]);
      }
    } finally {
      setTimeout(() => setIsAutoChecking(false), 400);
    }
  };

  const toggleHint = (missionId: string) => {
    setExpandedHints((prev) => ({
      ...prev,
      [missionId]: !prev[missionId],
    }));
  };

  // Next badge target calculation
  const nextBadge = useMemo(() => {
    return badges.find((b) => challenges.totalPoints < b.minPoints) || null;
  }, [badges, challenges.totalPoints]);

  const progressToNextBadge = useMemo(() => {
    if (!nextBadge) return 100;
    const currentPoints = challenges.totalPoints;
    const prevPoints =
      badges
        .filter((b) => b.minPoints < nextBadge.minPoints)
        .sort((a, b) => b.minPoints - a.minPoints)[0]?.minPoints || 0;
    const range = nextBadge.minPoints - prevPoints;
    const earnedInRange = Math.max(0, currentPoints - prevPoints);
    return Math.min(100, Math.round((earnedInRange / range) * 100));
  }, [badges, challenges.totalPoints, nextBadge]);

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-navy/10 bg-white p-6 sm:p-8 shadow-sm">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-ultramarine/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 rounded-full bg-teal/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-3 py-1 text-xs font-medium text-ultramarine">
              <Trophy className="h-3.5 w-3.5" />
              <span>Prompt Mastery Track</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Engineering Missions & Badges
            </h1>
            <p className="max-w-2xl text-sm text-navy/70">
              Complete automated lab challenges to forge your skills. Stored entirely in local
              browser state with deterministic criteria verification.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm sm:gap-4">
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-navy/60">
                Total Score
              </span>
              <div className="mt-1 flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-ultramarine" />
                <span className="font-mono text-xl font-bold text-navy sm:text-2xl">
                  {challenges.totalPoints}
                </span>
                <span className="font-mono text-[11px] text-ultramarine font-bold">pts</span>
              </div>
            </div>

            <div className="border-l border-navy/10 pl-3 text-center sm:pl-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-navy/60">
                Missions
              </span>
              <div className="mt-1 flex items-center justify-center gap-1 font-mono text-xl font-bold text-navy sm:text-2xl">
                <span>{challenges.completedMissionIds.length}</span>
                <span className="text-sm font-normal text-navy/60">/{missions.length}</span>
              </div>
            </div>

            <div className="border-l border-white/[0.08] pl-3 text-center sm:pl-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-forge-muted">
                Badges
              </span>
              <div className="mt-1 flex items-center justify-center gap-1 font-mono text-xl font-bold text-white sm:text-2xl">
                <span className="text-cyan-400">{challenges.unlockedBadgeIds.length}</span>
                <span className="text-sm font-normal text-forge-muted">/{badges.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Badge Progress Bar */}
        {nextBadge && (
          <div className="mt-6 border-t border-white/[0.08] pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-forge-muted">
                Next Unlock:{" "}
                <span className="font-semibold text-white">{nextBadge.name}</span> ({nextBadge.tier})
              </span>
              <span className="font-mono text-forge-muted">
                {challenges.totalPoints} / {nextBadge.minPoints} pts ({progressToNextBadge}%)
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-ember-500 via-amber-400 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextBadge}%` }}
                transition={prefersReduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Badges Showcase Section */}
      <section className="space-y-4" aria-labelledby="badges-heading">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-ember-400" />
            <h2 id="badges-heading" className="text-lg font-semibold text-white">
              Earned Badges Showcase
            </h2>
          </div>
          <button
            type="button"
            onClick={handleAutoCheckAll}
            disabled={isAutoChecking}
            className="inline-flex items-center gap-1.5 rounded-md border border-navy/10 bg-white px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-ultramarine hover:text-ultramarine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine disabled:opacity-50"
            aria-label="Scan local lab storage to check and complete missions automatically"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-ultramarine ${isAutoChecking ? "animate-spin" : ""}`} />
            <span>Auto-Verify from Storage</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((badge) => {
            const isUnlocked = unlockedBadgesSet.has(badge.id);
            const tierStyle = TIER_CONFIG[badge.tier];

            return (
              <div
                key={badge.id}
                className={`relative flex flex-col items-center justify-between rounded-xl border p-4 text-center transition-all ${
                  isUnlocked
                    ? `${tierStyle.border} ${tierStyle.bg} ${tierStyle.glow}`
                    : "border-navy/10 bg-daylight opacity-60"
                }`}
              >
                {/* Status Indicator */}
                <div className="absolute right-2.5 top-2.5">
                  {isUnlocked ? (
                    <Unlock className="h-3.5 w-3.5 text-teal" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-navy/70" />
                  )}
                </div>

                <div
                  className={`mt-2 flex h-14 w-14 items-center justify-center rounded-xl border ${
                    isUnlocked
                      ? `${tierStyle.border} bg-white ${tierStyle.text}`
                      : "border-navy/10 bg-daylight text-navy/40"
                  }`}
                >
                  {renderBadgeIcon(badge.iconName, "h-7 w-7")}
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="text-xs font-semibold text-navy">{badge.name}</h3>
                  <p className="text-[10px] font-mono text-navy/70">{badge.title}</p>
                </div>

                <div className="mt-3 w-full border-t border-navy/10 pt-2 text-[10px] text-navy/70">
                  {isUnlocked ? (
                    <span className="font-medium text-teal">Unlocked ✓</span>
                  ) : (
                    <span>Requires {badge.minPoints} pts</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Missions Section & Filters */}
      <section className="space-y-6" aria-labelledby="missions-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="missions-heading" className="text-lg font-semibold text-navy">
              Active Missions ({filteredMissions.length})
            </h2>
            <p className="text-xs text-navy/70">
              Select any mission to launch the linked lab and verify completion criteria.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "in_progress" | "completed")}
              className="rounded-md border border-navy/10 bg-white px-2.5 py-1.5 text-xs text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
              aria-label="Filter missions by completion status"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="rounded-md border border-navy/10 bg-white px-2.5 py-1.5 text-xs text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
              aria-label="Filter missions by difficulty"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredMissions.map((mission) => {
            const isCompleted = completedSet.has(mission.id);
            const diffStyle = DIFFICULTY_CONFIG[mission.difficulty];
            const feedback = verificationFeedback[mission.id];
            const isHintExpanded = expandedHints[mission.id];

            return (
              <div
                key={mission.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  isCompleted
                    ? "border-teal/30 bg-mint/30"
                    : "border-navy/10 bg-white hover:border-ultramarine shadow-sm"
                }`}
              >
                <div>
                  {/* Top Bar: Difficulty, Points, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${diffStyle.bg} ${diffStyle.text} border ${diffStyle.border}`}
                      >
                        {diffStyle.label}
                      </span>
                      <span className="font-mono text-xs font-semibold text-ultramarine">
                        +{mission.points} pts
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                        <CheckCircle2 className="h-4 w-4 text-teal" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-navy/60">
                        <Target className="h-3.5 w-3.5 text-ultramarine" />
                        Available
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3 space-y-1">
                    <h3 className="text-base font-semibold text-navy">{mission.title}</h3>
                    <p className="text-xs text-navy/70">{mission.tagline}</p>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-navy/80">
                    {mission.description}
                  </p>

                  {/* Target Requirement Badge */}
                  <div className="mt-3 rounded-xl border border-navy/10 bg-daylight p-3 text-xs text-navy/80">
                    <span className="font-mono text-[10px] uppercase text-teal-700 font-bold">
                      Criteria:
                    </span>{" "}
                    {mission.targetRequirement}
                  </div>

                  {/* Expandable Hint */}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => toggleHint(mission.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-forge-muted hover:text-white"
                      aria-expanded={isHintExpanded}
                    >
                      {isHintExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" /> Hide Hint
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" /> Show Strategy Hint
                        </>
                      )}
                    </button>
                    {isHintExpanded && (
                      <div className="mt-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 p-2 text-xs text-amber-200/90">
                        {mission.hint}
                      </div>
                    )}
                  </div>

                  {/* Verification Feedback Banner */}
                  {feedback && (
                    <div
                      className={`mt-3 rounded-md border p-2 text-xs ${
                        feedback.success
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      }`}
                      role="status"
                    >
                      {feedback.message}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
                  <Link
                    href={mission.labRoute}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  >
                    <span>Launch {mission.labName}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleVerify(mission)}
                        className="rounded-md border border-ultramarine/30 bg-ultramarine px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-ultramarine-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
                      >
                        Verify Check
                      </button>
                    )}
                    {isCompleted && (
                      <span className="font-mono text-[11px] text-emerald-400">
                        ✓ Claimed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredMissions.length === 0 && (
          <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center shadow-sm">
            <Trophy className="mx-auto h-8 w-8 text-navy/30" />
            <h3 className="mt-3 text-sm font-semibold text-navy">No missions found</h3>
            <p className="mt-1 text-xs text-navy/60">
              Adjust your filters or reset to view all available engineering challenges.
            </p>
          </div>
        )}
      </section>

      {/* Reset State Option */}
      <div className="flex items-center justify-between border-t border-navy/10 pt-6 text-xs text-navy/60">
        <span>PromptForge local storage engine • Safe sandbox execution</span>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset all mission progress, points, and badges?")) {
              reset();
              setVerificationFeedback({});
            }
          }}
          className="inline-flex items-center gap-1 hover:text-ultramarine focus-visible:outline-none"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Challenge Data</span>
        </button>
      </div>

      {/* Animated Badge Unlock Modal Dialog */}
      <AnimatePresence>
        {unlockModalBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-indigo/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUnlockModalBadge(null)}
            />

            {/* Modal Content */}
            <motion.div
              className={`relative z-10 max-w-sm w-full rounded-2xl border ${
                TIER_CONFIG[unlockModalBadge.tier].border
              } ${TIER_CONFIG[unlockModalBadge.tier].bg} p-6 text-center ${
                TIER_CONFIG[unlockModalBadge.tier].glow
              }`}
              initial={prefersReduced ? { opacity: 0 } : { scale: 0.85, opacity: 0, y: 20 }}
              animate={prefersReduced ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-badge-title"
            >
              <button
                type="button"
                onClick={() => setUnlockModalBadge(null)}
                className="absolute right-4 top-4 rounded-full p-1 text-forge-muted hover:text-white focus-visible:outline-none"
                aria-label="Close unlock modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.08] text-amber-400 shadow-inner">
                {renderBadgeIcon(unlockModalBadge.iconName, "h-10 w-10")}
              </div>

              <div className="mt-4 space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ember-400">
                  New Badge Unlocked!
                </span>
                <h3 id="modal-badge-title" className="text-xl font-bold text-white">
                  {unlockModalBadge.name}
                </h3>
                <p className="text-xs font-mono text-cyan-300">{unlockModalBadge.title}</p>
              </div>

              <p className="mt-3 text-xs text-forge-muted leading-relaxed">
                {unlockModalBadge.description}
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setUnlockModalBadge(null)}
                  className="w-full rounded-lg bg-gradient-to-r from-ember-500 to-amber-500 py-2 text-xs font-semibold text-navy transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
                >
                  Claim Badge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
