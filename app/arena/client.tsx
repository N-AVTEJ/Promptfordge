"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  Flame,
  Layers,
  Trophy,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { LevelMode } from "@/components/arena/level-mode";
import { CompareMode } from "@/components/arena/compare-mode";
import { RedVsBlueChallenge } from "@/components/arena/red-vs-blue";
import {
  getArenaProgress,
  setLastActiveArenaTab,
} from "@/lib/storage/arena";
import { ARENA_LEVELS } from "@/lib/arena/levels";

type ArenaTab = "levels" | "compare" | "red-vs-blue";

export function SecurityArenaClient() {
  const [activeTab, setActiveTab] = useState<ArenaTab>("levels");
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [bestScore, setBestScore] = useState<string | null>(null);

  useEffect(() => {
    const progress = getArenaProgress();
    setActiveTab(progress.lastActiveTab || "levels");
    setCompletedLevels(progress.completedLevels || []);
    setBestScore(progress.bestRedVsBlueFraction);
  }, []);

  const handleTabChange = (tab: ArenaTab) => {
    setActiveTab(tab);
    setLastActiveArenaTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-forge-text selection:bg-red-500/30 selection:text-white">
      {/* Tense Top Split Glow Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-500 via-purple-600 to-cyan-500" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/[0.08] pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500/40 bg-gradient-to-b from-red-950/60 to-black shadow-inner">
                <Flame className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h1 className="font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
                  SECURITY <span className="text-red-500">ARENA</span> {"// "}
                  <span className="text-cyan-400">RED VS BLUE</span>
                </h1>
                <p className="font-mono text-xs text-forge-muted tracking-wide">
                  MODULE 8 {"//"} SAFE ADVERSARIAL SANDBOX FOR PROMPT INJECTION &amp; DEFENSE-IN-DEPTH
                </p>
              </div>
            </div>
          </div>

          {/* Quick Telemetry Chips */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-[#0E1015] px-3 py-1.5 text-forge-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>LEVELS:</span>
              <span className="font-bold text-forge-text">
                {completedLevels.length}/{ARENA_LEVELS.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-[#0E1015] px-3 py-1.5 text-forge-muted">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>BATTERY RECORD:</span>
              <span className="font-bold text-cyan-300">
                {bestScore || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Sandbox Invariants Security Notice */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-cyan-500/25 bg-cyan-950/15 px-3.5 py-2.5 font-mono text-[11px] text-cyan-300/90 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="font-semibold">
              SANDBOX SECURITY INVARIANTS:
            </span>
            <span className="text-forge-muted">
              Target models have NO external tools • Fake educational flags only (<code className="text-cyan-200">FLAG&#123;...&#125;</code>) • Output capped at 500 chars • Env vars scrubbed
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-forge-subtle">
            <Lock className="h-3 w-3" />
            <span>STRICT RATE LIMITS ACTIVE</span>
          </div>
        </div>

        {/* 3 Arena Navigation Tabs */}
        <div className="flex border-b border-white/[0.08]">
          <nav className="-mb-px flex space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={() => handleTabChange("levels")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "levels"
                  ? "border-red-500 text-red-400 bg-red-950/20"
                  : "border-transparent text-forge-muted hover:border-white/20 hover:text-white"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>LEVEL MODE (1 - 5)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("compare")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "compare"
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
                  : "border-transparent text-forge-muted hover:border-white/20 hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>COMPARE MODE (A / B)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("red-vs-blue")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "red-vs-blue"
                  ? "border-purple-500 text-purple-300 bg-purple-950/20"
                  : "border-transparent text-forge-muted hover:border-white/20 hover:text-white"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>RED VS BLUE (8-ATTACK BATTERY)</span>
            </button>
          </nav>
        </div>

        {/* Tab Content Display */}
        <div className="pt-2">
          {activeTab === "levels" && <LevelMode />}
          {activeTab === "compare" && <CompareMode />}
          {activeTab === "red-vs-blue" && <RedVsBlueChallenge />}
        </div>
      </main>
    </div>
  );
}
