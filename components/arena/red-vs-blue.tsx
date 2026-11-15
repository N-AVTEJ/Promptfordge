"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Terminal,
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import {
  STORED_ATTACKS,
  STARTER_DEFENSE_TEMPLATES,
  RED_VS_BLUE_TARGET_FLAG,
} from "@/lib/arena/attacks";
import { runClientRedVsBlueChallenge } from "@/lib/arena/client";
import { RedVsBlueRunResult, BatteryAttackResult } from "@/lib/arena/types";
import {
  getArenaProgress,
  saveRedVsBlueResult,
} from "@/lib/storage/arena";
import { ScanAnimation } from "./scan-animation";

export function RedVsBlueChallenge() {
  const [defensePrompt, setDefensePrompt] = useState<string>(
    STARTER_DEFENSE_TEMPLATES[1].prompt
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<RedVsBlueRunResult | null>(null);
  const [expandedAttackId, setExpandedAttackId] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const progress = getArenaProgress();
    setBestScore(progress.bestRedVsBlueFraction);
  }, []);

  const handleSelectTemplate = (templatePrompt: string) => {
    setDefensePrompt(templatePrompt);
    setResult(null);
    setError(null);
  };

  const handleRunBattery = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const res = await runClientRedVsBlueChallenge(defensePrompt);
      setResult(res);

      const updated = saveRedVsBlueResult(res.fractionScore);
      setBestScore(updated.bestRedVsBlueFraction);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Battery run failed.";
      setError(msg);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAttackId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Target Mission Briefing Banner */}
      <div className="rounded-2xl border border-indigo/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal" />
              <span className="font-mono text-sm font-extrabold uppercase tracking-wider text-teal-700">
                BLUE TEAM OBJECTIVE // FORTIFY THE SECRET TOKEN
              </span>
            </div>
            <p className="text-xs text-indigo/70 leading-relaxed">
              Your mission: Author a defense system prompt that protects the secret flag below against our fixed battery of 8 adversarial prompt injection attacks.
            </p>
          </div>

          {bestScore && (
            <div className="flex items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-3 py-1.5 font-mono text-xs text-coral font-bold">
              <Trophy className="h-4 w-4 text-coral" />
              <span>RECORD SCORE:</span>
              <span className="font-bold text-sm text-coral">{bestScore}</span>
            </div>
          )}
        </div>

        {/* Highlighted Flag Box */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo/10 bg-cream/60 p-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-indigo/60 uppercase text-[10px] font-semibold">
              PROTECTED SECRET FLAG:
            </span>
            <code className="text-teal-700 font-bold tracking-wider">
              {RED_VS_BLUE_TARGET_FLAG}
            </code>
          </div>
          <span className="text-[10px] text-indigo/40">
            SAFE EDUCATIONAL TARGET // ZERO REAL SECRETS
          </span>
        </div>
      </div>

      {/* Defense Authoring Console */}
      <div className="rounded-2xl border border-indigo/10 bg-white p-6 shadow-sm space-y-4">
        {/* Templates Picker */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo/10 pb-3">
          <span className="font-mono text-xs font-semibold text-indigo/70">
            STARTER DEFENSE TEMPLATES:
          </span>
          <div className="flex flex-wrap gap-2">
            {STARTER_DEFENSE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectTemplate(tmpl.prompt)}
                className="rounded-lg border border-indigo/10 bg-cream px-2.5 py-1 font-mono text-xs text-indigo/70 hover:border-coral/40 hover:text-indigo transition-colors"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Defense Prompt Textarea */}
        <div>
          <label
            htmlFor="defense-prompt"
            className="mb-1.5 flex items-center justify-between font-mono text-xs text-indigo/70"
          >
            <span className="flex items-center gap-1.5 text-teal-700">
              <Terminal className="h-3.5 w-3.5" />
              YOUR BLUE TEAM SYSTEM PROMPT DEFENSE:
            </span>
            <span className="text-[10px] text-indigo/40">
              {defensePrompt.length} / 4000 chars
            </span>
          </label>
          <textarea
            id="defense-prompt"
            rows={8}
            value={defensePrompt}
            onChange={(e) => setDefensePrompt(e.target.value)}
            placeholder="Define your system directives, instruction hierarchies, delimiters, and refusal rules..."
            className="w-full resize-none rounded-xl border border-indigo/15 bg-cream/50 p-3 font-mono text-xs text-indigo focus:border-coral focus:outline-none leading-relaxed"
          />
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="flex items-center justify-between rounded-md border border-red-500/50 bg-red-950/30 p-3 font-mono text-xs text-red-300 shadow-inner">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-3 rounded px-1.5 py-0.5 text-forge-muted hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setDefensePrompt("")}
            disabled={!defensePrompt || isRunning}
            className="flex items-center gap-1.5 font-mono text-xs text-forge-muted hover:text-white disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>RESET</span>
          </button>

          <button
            type="button"
            onClick={handleRunBattery}
            disabled={isRunning || !defensePrompt.trim()}
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-500 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {isRunning ? (
              <>
                <Zap className="h-4 w-4 animate-spin text-black" />
                <span>RUNNING 8-ATTACK BATTERY...</span>
              </>
            ) : (
              <>
                <Flame className="h-4 w-4 text-red-950" />
                <span>DEPLOY & RUN 8-ATTACK BATTERY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scanning Radar Telemetry */}
      {isRunning && (
        <ScanAnimation
          variant="split"
          label="RUNNING 8-VECTOR ADVERSARIAL PENETRATION BATTERY"
        />
      )}

      {/* Scoreboard Result Banner (Score strictly as fraction X/8, NEVER percentage) */}
      {result && (
        <div
          className={`rounded-lg border p-5 shadow-lg ${
            result.blockedCount === 8
              ? "border-emerald-500/50 bg-emerald-950/20"
              : result.blockedCount >= 5
              ? "border-cyan-500/40 bg-cyan-950/20"
              : "border-red-500/40 bg-red-950/20"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-forge-muted block">
                BATTERY EVALUATION RESULT
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {result.fractionScore}
                </span>
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 block">
                    ATTACKS NEUTRALIZED
                  </span>
                  <span className="font-mono text-[11px] text-forge-muted">
                    {result.blockedCount} blocked out of {result.totalCount} tests
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {result.blockedCount === 8 ? (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  FORTRESS BULLETPROOF
                </div>
              ) : result.blockedCount >= 5 ? (
                <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/50 bg-cyan-500/20 px-3 py-1 font-mono text-xs font-bold text-cyan-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  STRONG RESILIENCE
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-500/20 px-3 py-1 font-mono text-xs font-bold text-red-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  BREACH PRONE
                </div>
              )}
            </div>
          </div>

          <p className="mt-3 font-mono text-xs text-forge-text leading-relaxed">
            {result.summary}
          </p>
        </div>
      )}

      {/* PER-ATTACK 8-RESULT GRID */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-forge-text flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              PER-ATTACK BATTERY AUDIT (ALL 8 VECTORS)
            </span>
            <span className="font-mono text-[11px] text-forge-muted">
              CLICK CARD TO INSPECT PAYLOAD & EXPLANATION
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {result.attacks.map((atk: BatteryAttackResult) => {
              const isExpanded = expandedAttackId === atk.attackId;

              return (
                <div
                  key={atk.attackId}
                  onClick={() => toggleExpand(atk.attackId)}
                  className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                    atk.blocked
                      ? "border-cyan-500/30 bg-[#0C1014] hover:border-cyan-500/60"
                      : "border-red-500/40 bg-[#140C0E] hover:border-red-500/70"
                  }`}
                >
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-forge-muted">
                          #{atk.index}
                        </span>
                        <span className="font-mono text-xs font-bold text-forge-text">
                          {atk.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-forge-muted">
                        CATEGORY: {atk.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                          atk.blocked
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-red-500/20 text-red-300 animate-pulse"
                        }`}
                      >
                        {atk.blocked ? (
                          <>
                            <ShieldCheck className="h-3 w-3" />
                            BLOCKED
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3 w-3" />
                            BREACHED
                          </>
                        )}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-forge-muted" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-forge-muted" />
                      )}
                    </div>
                  </div>

                  {/* Card Explanation Summary */}
                  <p className="mt-2 text-xs text-forge-muted leading-normal font-mono">
                    {atk.explanation}
                  </p>

                  {/* Expanded Details: Payload & Output */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-indigo/10 space-y-2.5 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-coral uppercase block mb-1 font-semibold">
                          Adversarial Test Payload:
                        </span>
                        <pre className="whitespace-pre-wrap rounded-xl bg-cream/70 p-2.5 text-[11px] text-coral border border-coral/20">
                          {atk.payload}
                        </pre>
                      </div>

                      <div>
                        <span className="text-[10px] text-teal-700 uppercase block mb-1 font-semibold">
                          Model Output Response:
                        </span>
                        <pre className="whitespace-pre-wrap rounded-xl bg-cream/70 p-2.5 text-[11px] text-indigo border border-indigo/10">
                          {atk.modelOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Default State: Preview all 8 attack vectors if no battery has been run yet */}
      {!result && (
        <div className="space-y-4">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo block">
            PREVIEW: 8 ADVERSARIAL ATTACK VECTORS IN THE BATTERY
          </span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
            {STORED_ATTACKS.map((atk) => (
              <div
                key={atk.id}
                className="rounded-xl border border-indigo/10 bg-white p-4 space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between text-[10px] text-indigo/60">
                  <span>VECTOR #{atk.index}</span>
                  <span className="text-coral font-bold">{atk.category}</span>
                </div>
                <div className="font-bold text-indigo text-[11px]">
                  {atk.name}
                </div>
                <p className="text-[10px] text-indigo/60 line-clamp-2">
                  {atk.payload}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
