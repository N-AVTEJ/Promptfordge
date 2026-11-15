"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldAlert,
  Flame,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import { COMPARE_SCENARIOS } from "@/lib/arena/compare-scenarios";
import { CompareScenario, CompareRunResult } from "@/lib/arena/types";
import { runClientCompareAttack } from "@/lib/arena/client";
import { DEFENSE_TECHNIQUES } from "@/lib/arena/attacks";
import { ScanAnimation } from "./scan-animation";

export function CompareMode() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    COMPARE_SCENARIOS[0].id
  );
  const [customAttack, setCustomAttack] = useState<string>(
    COMPARE_SCENARIOS[0].attackPayload
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<CompareRunResult | null>(null);

  const currentScenario: CompareScenario =
    COMPARE_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    COMPARE_SCENARIOS[0];

  const handleSelectScenario = (scenario: CompareScenario) => {
    setSelectedScenarioId(scenario.id);
    setCustomAttack(scenario.attackPayload);
    setResult(null);
  };

  const handleExecuteCompare = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);

    try {
      const res = await runClientCompareAttack({
        attackPayload: customAttack,
        scenarioId: currentScenario.id,
        vulnerableSystem: currentScenario.vulnerableSystem,
        defendedSystem: currentScenario.defendedSystem,
        defenseTechniqueName: currentScenario.defenseTechniqueName,
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Comparison failed.";
      setResult({
        attackPayload: customAttack,
        vulnerableOutput: `[ERROR]: ${msg}`,
        vulnerableBreached: false,
        defendedOutput: `[ERROR]: ${msg}`,
        defendedBreached: false,
        defenseTechniques: [currentScenario.defenseTechniqueName],
        analysis: `Execution aborted: ${msg}`,
        latencyMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selector & Techniques Bar */}
      <div className="rounded-lg border border-white/[0.08] bg-[#0C0E12] p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-forge-text">
              DEFENSE TECHNIQUE COMPARISONS
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMPARE_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc)}
                  className={`rounded px-3 py-1.5 font-mono text-xs transition-all ${
                    isSelected
                      ? "border border-cyan-500/60 bg-cyan-950/40 text-cyan-200 shadow-sm"
                      : "border border-white/[0.06] bg-black/40 text-forge-muted hover:border-white/20 hover:text-white"
                  }`}
                >
                  {sc.defenseTechniqueName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Defense Technique Description Pill */}
        <div className="flex items-center gap-2 rounded bg-black/50 p-2.5 font-mono text-xs text-forge-muted border border-white/[0.05]">
          <span className="font-bold text-cyan-400">
            NAMED DEFENSE: {currentScenario.defenseTechniqueName}
          </span>
          <span>—</span>
          <span>{currentScenario.defenseExplanation}</span>
        </div>
      </div>

      {/* Shared Adversarial Payload Input Bar */}
      <div className="rounded-lg border border-white/[0.08] bg-[#0E0F14] p-4 space-y-3 shadow-md">
        <label
          htmlFor="compare-attack"
          className="flex items-center justify-between font-mono text-xs font-semibold text-forge-muted"
        >
          <span className="flex items-center gap-1.5 text-red-400">
            <Flame className="h-3.5 w-3.5" />
            ADVERSARIAL ATTACK PAYLOAD (RUN SIMULTANEOUSLY AGAINST BOTH TARGETS):
          </span>
          <span className="text-[10px] text-forge-subtle">
            {customAttack.length} chars
          </span>
        </label>

        <textarea
          id="compare-attack"
          rows={3}
          value={customAttack}
          onChange={(e) => setCustomAttack(e.target.value)}
          className="w-full resize-none rounded-md border border-white/[0.1] bg-black/70 p-3 font-mono text-xs text-forge-text focus:border-cyan-400 focus:outline-none"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleExecuteCompare}
            disabled={isRunning || !customAttack.trim()}
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-red-600 via-purple-600 to-cyan-500 px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isRunning ? (
              <>
                <Zap className="h-3.5 w-3.5 animate-spin" />
                <span>EVALUATING SIDE-BY-SIDE...</span>
              </>
            ) : (
              <>
                <span>EXECUTE SIDE-BY-SIDE COMPARISON</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scanning Animation */}
      {isRunning && (
        <ScanAnimation
          variant="split"
          label={`DISPATCHING PAYLOAD DUAL-PANE EXECUTION [${currentScenario.defenseTechniqueName.toUpperCase()}]`}
        />
      )}

      {/* Side-by-Side Dual Pane: Vulnerable (Red) vs Defended (Cyan) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Vulnerable Prompt */}
        <div className="flex flex-col rounded-lg border border-red-500/40 bg-[#0E0F14] shadow-md">
          <div className="flex items-center justify-between border-b border-red-500/20 bg-red-950/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-400">
                VULNERABLE ARCHITECTURE (NO DEFENSE)
              </span>
            </div>
            {result && (
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                  result.vulnerableBreached
                    ? "bg-red-500/20 text-red-300"
                    : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                {result.vulnerableBreached ? (
                  <>
                    <XCircle className="h-3 w-3 text-red-400" />
                    FLAG COMPROMISED
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    HELD
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex-1 p-4 space-y-3 font-mono text-xs">
            <div>
              <span className="text-[10px] text-forge-muted block mb-1 uppercase">
                System Prompt Specification:
              </span>
              <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded border border-white/[0.06] bg-black/60 p-2.5 text-[11px] text-red-200/80">
                {currentScenario.vulnerableSystem}
              </pre>
            </div>

            <div>
              <span className="text-[10px] text-forge-muted block mb-1 uppercase">
                Execution Response Stream:
              </span>
              <div className="min-h-24 rounded border border-red-500/20 bg-black/80 p-3 text-[11px] text-forge-text">
                {result ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {result.vulnerableOutput}
                  </pre>
                ) : (
                  <span className="italic text-forge-subtle">
                    Run comparison to inspect vulnerable model completion...
                  </span>
                )}
              </div>
            </div>

            <div className="rounded bg-red-950/20 p-2.5 border border-red-500/20 text-[11px] text-red-300/90">
              <span className="font-bold">Vulnerability Root Cause: </span>
              {currentScenario.vulnerabilityExplanation}
            </div>
          </div>
        </div>

        {/* Right: Defended Prompt */}
        <div className="flex flex-col rounded-lg border border-cyan-500/40 bg-[#0E0F14] shadow-md">
          <div className="flex items-center justify-between border-b border-cyan-500/20 bg-cyan-950/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                DEFENDED ARCHITECTURE ({currentScenario.defenseTechniqueName})
              </span>
            </div>
            {result && (
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                  result.defendedBreached
                    ? "bg-red-500/20 text-red-300"
                    : "bg-cyan-500/20 text-cyan-300"
                }`}
              >
                {result.defendedBreached ? (
                  <>
                    <XCircle className="h-3 w-3 text-red-400" />
                    BREACHED
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                    DEFENSE HELD
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex-1 p-4 space-y-3 font-mono text-xs">
            <div>
              <span className="text-[10px] text-forge-muted block mb-1 uppercase">
                Defended System Prompt Specification:
              </span>
              <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded border border-white/[0.06] bg-black/60 p-2.5 text-[11px] text-cyan-200/90">
                {currentScenario.defendedSystem}
              </pre>
            </div>

            <div>
              <span className="text-[10px] text-forge-muted block mb-1 uppercase">
                Execution Response Stream:
              </span>
              <div className="min-h-24 rounded border border-cyan-500/20 bg-black/80 p-3 text-[11px] text-forge-text">
                {result ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {result.defendedOutput}
                  </pre>
                ) : (
                  <span className="italic text-forge-subtle">
                    Run comparison to inspect defended model completion...
                  </span>
                )}
              </div>
            </div>

            <div className="rounded bg-cyan-950/20 p-2.5 border border-cyan-500/20 text-[11px] text-cyan-300/90">
              <span className="font-bold">Defense Mechanism: </span>
              {currentScenario.defenseExplanation}
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis Card if result available */}
      {result && (
        <div className="rounded-lg border border-white/[0.08] bg-[#101217] p-4 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-forge-text">
            <Info className="h-4 w-4 text-cyan-400" />
            <span>COMPARATIVE SECURITY SYNTHESIS</span>
          </div>
          <p className="mt-2 text-xs text-forge-muted leading-relaxed font-mono">
            {result.analysis}
          </p>
        </div>
      )}

      {/* Technique Taxonomy Reference */}
      <div className="rounded-lg border border-white/[0.06] bg-black/40 p-4 space-y-3">
        <span className="font-mono text-xs font-bold text-forge-muted uppercase tracking-wider block">
          THE 4 CORE LLM DEFENSE PILLARS
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
          {DEFENSE_TECHNIQUES.map((tech) => (
            <div
              key={tech.id}
              className="rounded border border-white/[0.06] bg-[#0E1015] p-3 space-y-1.5"
            >
              <span className="font-bold text-cyan-400">{tech.name}</span>
              <p className="text-[11px] text-forge-muted leading-normal">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
