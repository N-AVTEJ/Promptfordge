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
      <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
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
                  className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-all ${
                    isSelected
                      ? "border border-ultramarine bg-ultramarine/10 text-ultramarine font-bold shadow-sm"
                      : "border border-navy/10 bg-daylight text-navy/70 hover:border-navy/30 hover:text-navy"
                  }`}
                >
                  {sc.defenseTechniqueName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Defense Technique Description Pill */}
        <div className="flex items-center gap-2 rounded-lg bg-lavender/40 p-2.5 font-mono text-xs text-navy/80 border border-violet/10">
          <span className="font-bold text-violet">
            NAMED DEFENSE: {currentScenario.defenseTechniqueName}
          </span>
          <span>—</span>
          <span>{currentScenario.defenseExplanation}</span>
        </div>
      </div>

      {/* Shared Adversarial Payload Input Bar */}
      <div className="rounded-2xl border border-navy/10 bg-white p-6 space-y-3 shadow-sm">
        <label
          htmlFor="compare-attack"
          className="flex items-center justify-between font-mono text-xs font-semibold text-navy/80"
        >
          <span className="flex items-center gap-1.5 text-ultramarine">
            <Flame className="h-3.5 w-3.5" />
            ADVERSARIAL ATTACK PAYLOAD (RUN SIMULTANEOUSLY AGAINST BOTH TARGETS):
          </span>
          <span className="text-[10px] text-navy/50">
            {customAttack.length} chars
          </span>
        </label>

        <textarea
          id="compare-attack"
          rows={3}
          value={customAttack}
          onChange={(e) => setCustomAttack(e.target.value)}
          className="w-full resize-none rounded-xl border border-navy/15 bg-daylight p-3 font-mono text-xs text-navy focus:border-ultramarine focus:outline-none focus:ring-1 focus:ring-ultramarine"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleExecuteCompare}
            disabled={isRunning || !customAttack.trim()}
            className="flex items-center gap-2 rounded-xl bg-ultramarine px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-ultramarine-hover disabled:opacity-50 transition-all"
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
        <div className="flex flex-col rounded-2xl border border-ultramarine/30 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-ultramarine/30 bg-ultramarine/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-ultramarine" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-ultramarine">
                VULNERABLE ARCHITECTURE (NO DEFENSE)
              </span>
            </div>
            {result && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                  result.vulnerableBreached
                    ? "bg-ultramarine/10 text-ultramarine"
                    : "bg-teal/20 text-teal-700"
                }`}
              >
                {result.vulnerableBreached ? (
                  <>
                    <XCircle className="h-3 w-3 text-ultramarine" />
                    FLAG COMPROMISED
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-teal-600" />
                    HELD
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex-1 p-5 space-y-4 font-mono text-xs">
            <div>
              <span className="text-[10px] text-navy/60 block mb-1 uppercase font-semibold">
                System Prompt Specification:
              </span>
              <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-xl border border-navy/10 bg-daylight p-3 text-[11px] text-ultramarine/90">
                {currentScenario.vulnerableSystem}
              </pre>
            </div>

            <div>
              <span className="text-[10px] text-navy/60 block mb-1 uppercase font-semibold">
                Execution Response Stream:
              </span>
              <div className="min-h-24 rounded-xl border border-ultramarine/30 bg-daylight p-3 text-[11px] text-navy">
                {result ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {result.vulnerableOutput}
                  </pre>
                ) : (
                  <span className="italic text-navy/40">
                    Run comparison to inspect vulnerable model completion...
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-ultramarine/10 p-3 border border-ultramarine/30 text-[11px] text-ultramarine">
              <span className="font-bold">Vulnerability Root Cause: </span>
              {currentScenario.vulnerabilityExplanation}
            </div>
          </div>
        </div>

        {/* Right: Defended Prompt */}
        <div className="flex flex-col rounded-2xl border border-teal/30 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-teal/20 bg-teal/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-700">
                DEFENDED ARCHITECTURE ({currentScenario.defenseTechniqueName})
              </span>
            </div>
            {result && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                  result.defendedBreached
                    ? "bg-ultramarine/10 text-ultramarine"
                    : "bg-teal/20 text-teal-700"
                }`}
              >
                {result.defendedBreached ? (
                  <>
                    <XCircle className="h-3 w-3 text-ultramarine" />
                    BREACHED
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-teal-600" />
                    DEFENSE HELD
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex-1 p-5 space-y-4 font-mono text-xs">
            <div>
              <span className="text-[10px] text-navy/60 block mb-1 uppercase font-semibold">
                Defended System Prompt Specification:
              </span>
              <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-xl border border-navy/10 bg-daylight p-3 text-[11px] text-teal-800">
                {currentScenario.defendedSystem}
              </pre>
            </div>

            <div>
              <span className="text-[10px] text-navy/60 block mb-1 uppercase font-semibold">
                Execution Response Stream:
              </span>
              <div className="min-h-24 rounded-xl border border-teal/20 bg-daylight p-3 text-[11px] text-navy">
                {result ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {result.defendedOutput}
                  </pre>
                ) : (
                  <span className="italic text-navy/40">
                    Run comparison to inspect defended model completion...
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-mint/50 p-3 border border-teal/20 text-[11px] text-teal-800">
              <span className="font-bold">Defense Mechanism: </span>
              {currentScenario.defenseExplanation}
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis Card if result available */}
      {result && (
        <div className="rounded-2xl border border-violet/20 bg-lavender/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-navy">
            <Info className="h-4 w-4 text-violet" />
            <span>COMPARATIVE SECURITY SYNTHESIS</span>
          </div>
          <p className="mt-2 text-xs text-navy/80 leading-relaxed font-mono">
            {result.analysis}
          </p>
        </div>
      )}

      {/* Technique Taxonomy Reference */}
      <div className="rounded-2xl border border-navy/10 bg-white p-6 space-y-4 shadow-sm">
        <span className="font-mono text-xs font-bold text-navy uppercase tracking-wider block">
          THE 4 CORE LLM DEFENSE PILLARS
        </span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
          {DEFENSE_TECHNIQUES.map((tech) => (
            <div
              key={tech.id}
              className="rounded-xl border border-navy/10 bg-daylight p-4 space-y-2"
            >
              <span className="font-bold text-violet block">{tech.name}</span>
              <p className="text-[11px] text-navy/70 leading-normal">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
