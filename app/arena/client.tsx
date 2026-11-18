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
    <div className="min-h-screen bg-daylight text-navy">
      <main className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-8">
        {/* Header Section */}
        <div className="rounded-3xl border border-navy/10 bg-white p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href="/academy/mod-08"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-3 py-1 font-mono text-xs font-semibold text-ultramarine hover:bg-ultramarine/20 transition-colors"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Module 8: Security in Prompt Engineering</span>
                </a>
                <span className="rounded border border-navy/20 bg-daylight px-2 py-0.5 font-mono text-[10px] text-navy/70 uppercase">
                  Full Lab
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-ultramarine/30 bg-ultramarine/10 text-ultramarine">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-navy">
                    Security Arena <span className="text-ultramarine">{"//"} Red vs Blue</span>
                  </h1>
                  <p className="font-mono text-xs text-navy/70 mt-0.5">
                    Safe adversarial laboratory for prompt injection defense &amp; boundary auditing
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Telemetry Chips */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 rounded-xl border border-navy/10 bg-daylight px-4 py-2.5 text-navy/70">
                <CheckCircle2 className="h-4 w-4 text-teal" />
                <span>LEVELS:</span>
                <span className="font-bold text-navy">
                  {completedLevels.length}/{ARENA_LEVELS.length}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-navy/10 bg-daylight px-4 py-2.5 text-navy/70">
                <Trophy className="h-4 w-4 text-ultramarine" />
                <span>BATTERY RECORD:</span>
                <span className="font-bold text-ultramarine">
                  {bestScore || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Sandbox Invariants Security Notice */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal/30 bg-teal/10 p-4 font-mono text-xs text-teal">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal shrink-0" />
              <span className="font-bold">SANDBOX INVARIANTS:</span>
              <span className="text-navy/70 font-sans text-xs">
                Target models have NO external tools • Fake educational flags only (<code className="text-teal font-mono font-bold">FLAG&#123;...&#125;</code>) • Output capped at 500 chars
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-navy/70 font-mono text-xs">
              <Lock className="h-3.5 w-3.5" />
              <span>STRICT RATE LIMITS</span>
            </div>
          </div>
        </div>

        {/* 3 Arena Navigation Tabs */}
        <div className="flex border-b border-navy/10">
          <nav className="-mb-px flex space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={() => handleTabChange("levels")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "levels"
                  ? "border-ultramarine text-ultramarine bg-white rounded-t-xl"
                  : "border-transparent text-navy/70 hover:text-navy"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>Level Mode (1 - 5)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("compare")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "compare"
                  ? "border-teal text-teal bg-white rounded-t-xl"
                  : "border-transparent text-navy/70 hover:text-navy"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Compare Mode (A / B)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("red-vs-blue")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "red-vs-blue"
                  ? "border-violet text-violet bg-white rounded-t-xl"
                  : "border-transparent text-navy/70 hover:text-navy"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Red vs Blue (8-Attack Battery)</span>
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
