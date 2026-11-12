"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  Terminal,
  GraduationCap,
  FlaskConical,
  GitFork,
  BarChart3,
  Swords,
  Library,
  Trophy,
  ArrowRight,
  Database,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import {
  fadeUpVariants,
  fadeUpReducedVariants,
  staggerContainerVariants,
} from "@/lib/motion";
import { ScrollTriggerTest } from "@/components/motion/scroll-trigger-test";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  isLocalStorageAvailable,
} from "@/lib/storage";

const MODULES = [
  {
    title: "Academy",
    desc: "Interactive curriculum with embedded YouTube masterclasses.",
    href: "/academy",
    phase: "Phase 2",
    icon: GraduationCap,
  },
  {
    title: "Live Labs",
    desc: "Real-time prompt execution sandbox with token stream telemetry.",
    href: "/labs",
    phase: "Phase 3",
    icon: FlaskConical,
  },
  {
    title: "Workflow Studio",
    desc: "Node-based visual pipeline graph for multi-agent prompt chains.",
    href: "/workflow",
    phase: "Phase 4",
    icon: GitFork,
  },
  {
    title: "Evaluation Engine",
    desc: "Multi-metric assertion suite. Disaggregated accuracy scores.",
    href: "/evaluate",
    phase: "Phase 5",
    icon: BarChart3,
  },
  {
    title: "Model Arena",
    desc: "Dual-pane side-by-side prompt battleground across frontier models.",
    href: "/arena",
    phase: "Phase 6",
    icon: Swords,
  },
  {
    title: "Prompt Library",
    desc: "Curated blueprints for structured JSON, tool use, and few-shot framing.",
    href: "/library",
    phase: "Phase 7",
    icon: Library,
  },
  {
    title: "Challenges",
    desc: "Prompt golf, adversarial defense tests, and schema puzzles.",
    href: "/challenges",
    phase: "Phase 8",
    icon: Trophy,
  },
];

export default function HomePage() {
  const prefersReduced = useReducedMotion();
  const activeFadeUp = prefersReduced ? fadeUpReducedVariants : fadeUpVariants;

  // Real-time typed storage diagnostic state
  const [storageStatus, setStorageStatus] = useState<{
    available: boolean;
    historyCount: number;
    corruptTestStatus: string;
  }>({
    available: false,
    historyCount: 0,
    corruptTestStatus: "Ready to test",
  });

  useEffect(() => {
    const isAvail = isLocalStorageAvailable();
    const history = getStorageItem(STORAGE_KEYS.HISTORY);
    setStorageStatus({
      available: isAvail,
      historyCount: history.length,
      corruptTestStatus: "Storage online and typed",
    });
  }, []);

  const triggerCorruptStorageTest = () => {
    try {
      // Intentionally insert corrupted syntax into localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          STORAGE_KEYS.HISTORY,
          "CORRUPT_JSON_SYNTAX_{{["
        );
      }
      // Read back through safe typed getter
      const recovered = getStorageItem(STORAGE_KEYS.HISTORY);
      setStorageStatus((prev) => ({
        ...prev,
        historyCount: recovered.length,
        corruptTestStatus:
          "Recovered cleanly from corrupt JSON! Fallback used.",
      }));
    } catch {
      setStorageStatus((prev) => ({
        ...prev,
        corruptTestStatus: "Unexpected unhandled error!",
      }));
    }
  };

  const triggerCorruptStorageTypeTest = () => {
    try {
      // Insert valid JSON but invalid schema type (number instead of history array)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          STORAGE_KEYS.HISTORY,
          JSON.stringify(99999)
        );
      }
      const recovered = getStorageItem(STORAGE_KEYS.HISTORY);
      setStorageStatus((prev) => ({
        ...prev,
        historyCount: recovered.length,
        corruptTestStatus: "Type mismatch healed cleanly! Fallback array used.",
      }));
    } catch {
      setStorageStatus((prev) => ({
        ...prev,
        corruptTestStatus: "Unexpected unhandled error on type mismatch!",
      }));
    }
  };

  const resetStorageTest = () => {
    setStorageItem(STORAGE_KEYS.HISTORY, [
      {
        id: "demo-1",
        timestamp: Date.now(),
        prompt: "System: You are an expert prompt engineer.",
        model: "gemini-1.5-pro",
      },
    ]);
    const history = getStorageItem(STORAGE_KEYS.HISTORY);
    setStorageStatus((prev) => ({
      ...prev,
      historyCount: history.length,
      corruptTestStatus: "Reset to healthy test item.",
    }));
  };

  return (
    <div className="relative overflow-hidden pb-24">
      {/* Background Ambience */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,107,0,0.12),rgba(11,12,14,0))]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        {/* HERO SECTION */}
        <motion.div
          variants={activeFadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Phase Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-ember-500/30 bg-ember-500/10 px-3.5 py-1.5 font-mono text-xs font-medium text-ember-400">
            <Flame className="h-4 w-4 animate-pulse-glow" />
            <span>THE FORGE ARCHITECTURE · PHASE 1 FOUNDATION</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-8 font-mono text-4xl font-extrabold tracking-tight text-forge-text sm:text-6xl lg:text-7xl">
            TEMPER YOUR PROMPTS.
            <br />
            <span className="bg-gradient-to-r from-ember-400 via-amber-500 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,107,0,0.35)]">
              FORGE COGNITIVE CONTROL.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-forge-muted sm:text-lg lg:text-xl">
            An interactive prompt engineering academy where high-leverage mental
            models meet live execution sandboxes and YouTube masterclasses.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 rounded-lg bg-ember-500 px-6 py-3.5 font-mono text-sm font-semibold text-forge-950 shadow-ember-glow transition-all hover:bg-ember-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
            >
              <span>Enter Academy</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/labs"
              className="inline-flex items-center gap-2 rounded-lg border border-forge-border bg-forge-surface px-6 py-3.5 font-mono text-sm font-semibold text-forge-text transition-colors hover:border-forge-border-bright hover:bg-forge-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <span>Explore Live Labs</span>
              <Terminal className="h-4 w-4 text-cyan-400" />
            </Link>
          </div>
        </motion.div>

        {/* FORGE CODE / TOKEN STREAM VISUALIZER */}
        <motion.div
          variants={activeFadeUp}
          initial="hidden"
          animate="visible"
          className="mt-16 sm:mt-20"
        >
          <div className="relative mx-auto max-w-4xl rounded-2xl border border-forge-border bg-forge-surface p-1 shadow-2xl">
            <div className="flex items-center justify-between rounded-t-xl border-b border-forge-border bg-forge-elevated/70 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-forge-border" />
                <span className="h-3 w-3 rounded-full bg-forge-border" />
                <span className="h-3 w-3 rounded-full bg-forge-border" />
                <span className="ml-2 font-mono text-xs text-forge-muted">
                  prompt-workbench.forge.ts
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                <span>Simulated Stream</span>
              </div>
            </div>

            <div className="overflow-x-auto p-6 font-mono text-xs leading-relaxed sm:text-sm">
              <p className="text-forge-subtle">
                {"//"} Architectural Pattern: Constraint-Anchored System Prompt
              </p>
              <p className="mt-2 text-cyan-400">&lt;system_instructions&gt;</p>
              <p className="pl-4 text-forge-text">
                Role: Senior Prompt Optimization Engine.
              </p>
              <p className="pl-4 text-forge-text">
                Goal: Transform ambiguous intent into zero-shot deterministic
                reasoning paths.
              </p>
              <p className="pl-4 text-ember-400">
                Rule: Separate candidate pathways, actions, and observations
                explicitly.
              </p>
              <p className="text-cyan-400">&lt;/system_instructions&gt;</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-forge-border/60 pt-3 text-xs text-forge-muted">
                <span className="inline-flex items-center gap-1 rounded border border-cyan-500/20 bg-forge-elevated px-2 py-0.5 text-cyan-400">
                  Tokens: 48 prompt / 128 context
                </span>
                <span className="inline-flex items-center gap-1 rounded border border-ember-500/20 bg-forge-elevated px-2 py-0.5 text-ember-400">
                  Latency: 18ms
                </span>
                <span className="inline-flex items-center gap-1 rounded border border-forge-border bg-forge-elevated px-2 py-0.5 text-forge-text">
                  Engine: /lib/engine (Unified)
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 7 ROADMAP MODULES GRID */}
        <div className="mt-28">
          <div className="flex flex-col justify-between gap-4 border-b border-forge-border pb-6 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-ember-500">
                Phase Breakdown
              </span>
              <h2 className="mt-2 font-mono text-2xl font-bold tracking-tight text-forge-text sm:text-3xl">
                Academy & Engine Architecture
              </h2>
            </div>
            <p className="max-w-md font-mono text-xs text-forge-muted sm:text-sm">
              7 dedicated modules built upon unified execution & evaluation
              primitives.
            </p>
          </div>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.href}
                  variants={activeFadeUp}
                  className="h-full"
                >
                  <Link
                    href={mod.href}
                    className="group relative flex h-full flex-col justify-between rounded-xl border border-forge-border bg-forge-surface p-5 shadow-sm transition-all hover:border-ember-500/50 hover:bg-forge-elevated hover:shadow-ember-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-ember-500/30 bg-ember-500/10 text-ember-500 transition-transform group-hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="text-[11px]">
                          {mod.phase}
                        </Badge>
                      </div>
                      <h3 className="mt-4 font-mono text-base font-bold text-forge-text transition-colors group-hover:text-ember-400">
                        {mod.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-forge-muted">
                        {mod.desc}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center gap-1.5 font-mono text-xs font-medium text-ember-500 transition-transform group-hover:translate-x-1">
                      <span>Inspect module</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* TYPED STORAGE RESILIENCE VERIFIER */}
        <div className="mt-28 rounded-2xl border border-forge-border bg-forge-surface p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-forge-border pb-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-ember-500/30 bg-ember-500/10 text-ember-500">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-mono text-base font-semibold text-forge-text">
                  Typed Storage Integrity Check (/lib/storage)
                </h3>
                <p className="font-mono text-xs text-forge-muted">
                  Safe versioned JSON parser & corrupted-data self-healing
                  engine
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={triggerCorruptStorageTest}
                className="gap-1.5 font-mono text-xs"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Corrupt JSON Syntax</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={triggerCorruptStorageTypeTest}
                className="gap-1.5 font-mono text-xs"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Corrupt Schema Type</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetStorageTest}
                className="gap-1.5 font-mono text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 font-mono text-xs sm:grid-cols-3">
            <div className="rounded-lg border border-forge-border bg-forge-elevated p-3">
              <span className="block text-[10px] text-forge-subtle">
                STORAGE DRIVER
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-forge-text">
                {storageStatus.available ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>localStorage Online</span>
                  </>
                ) : (
                  <span>In-Memory Fallback</span>
                )}
              </span>
            </div>

            <div className="rounded-lg border border-forge-border bg-forge-elevated p-3">
              <span className="block text-[10px] text-forge-subtle">
                HISTORY ITEMS CACHED
              </span>
              <span className="mt-1 block text-sm font-bold text-forge-text">
                {storageStatus.historyCount} items
              </span>
            </div>

            <div className="rounded-lg border border-forge-border bg-forge-elevated p-3 sm:col-span-1">
              <span className="block text-[10px] text-forge-subtle">
                INTEGRITY STATUS
              </span>
              <span className="mt-1 block truncate font-medium text-cyan-400">
                {storageStatus.corruptTestStatus}
              </span>
            </div>
          </div>
        </div>

        {/* GSAP SCROLLTRIGGER TEST SECTION */}
        <div className="mt-28">
          <ScrollTriggerTest />
        </div>
      </div>
    </div>
  );
}
