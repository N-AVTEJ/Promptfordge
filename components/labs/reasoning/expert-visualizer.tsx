"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Zap,
  Users,
  Server,
  Sparkles,
  Info,
  Clock,
  RotateCcw,
} from "lucide-react";
import {
  EXPERT_ROLES,
  EXPERT_PRESETS,
  EXPERT_EDUCATIONAL_DISCLOSURE,
  evaluateExpertCouncil,
} from "@/lib/reasoning/expert-engine";
import {
  ExpertCouncilPreset,
  ExpertEvaluationResponse,
} from "@/lib/reasoning/types";

export function ExpertVisualizer() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    EXPERT_PRESETS[0].id
  );
  const [customQuery, setCustomQuery] = useState<string>("");
  const [responses, setResponses] = useState<ExpertEvaluationResponse[]>(() =>
    evaluateExpertCouncil(EXPERT_PRESETS[0].query, EXPERT_PRESETS[0].id)
  );

  const preset: ExpertCouncilPreset =
    EXPERT_PRESETS.find((p) => p.id === selectedPresetId) || EXPERT_PRESETS[0];

  const handleSelectPreset = (pId: string) => {
    setSelectedPresetId(pId);
    const p = EXPERT_PRESETS.find((x) => x.id === pId);
    if (p) {
      setResponses(evaluateExpertCouncil(p.query, p.id));
    }
  };

  const handleRunCustom = () => {
    if (!customQuery.trim()) return;
    setResponses(evaluateExpertCouncil(customQuery.trim()));
  };

  const roleIcons: Record<string, React.ReactNode> = {
    "security-architect": <ShieldAlert className="h-4 w-4 text-red-400" />,
    "perf-engineer": <Zap className="h-4 w-4 text-cyan-400" />,
    "ux-lead": <Users className="h-4 w-4 text-amber-400" />,
    "sre-lead": <Server className="h-4 w-4 text-emerald-400" />,
  };

  const roleBorderColors: Record<string, string> = {
    "security-architect": "border-red-500/40 hover:border-red-400",
    "perf-engineer": "border-cyan-500/40 hover:border-cyan-400",
    "ux-lead": "border-amber-500/40 hover:border-amber-400",
    "sre-lead": "border-emerald-500/40 hover:border-emerald-400",
  };

  return (
    <div className="space-y-6">
      {/* Educational Simulation Disclosure Header */}
      <div className="flex items-start gap-3 rounded-xl border border-purple-500/30 bg-purple-950/20 p-4">
        <Info className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-purple-200 leading-relaxed">
          <span className="font-bold text-purple-300">
            [EDUCATIONAL SIMULATION / MULTI-PERSONA REASONING]
          </span>{" "}
          {EXPERT_EDUCATIONAL_DISCLOSURE}
        </div>
      </div>

      {/* Preset Selector & Custom Input */}
      <div className="rounded-xl border border-forge-border bg-forge-surface p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono font-semibold text-forge-text flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Specialist Council Scenario Presets
          </span>
          <button
            type="button"
            onClick={() => handleSelectPreset(selectedPresetId)}
            className="flex items-center gap-1 rounded border border-forge-border px-2.5 py-1 text-[11px] font-mono text-forge-muted hover:text-forge-text"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Re-evaluate</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EXPERT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p.id)}
              className={`text-left rounded-lg border p-3 transition-all ${
                selectedPresetId === p.id
                  ? "border-ember-500 bg-ember-950/20 ring-1 ring-ember-500/50"
                  : "border-forge-border bg-[#0E121B] hover:border-white/[0.15]"
              }`}
            >
              <div className="font-mono text-xs font-bold text-forge-text mb-1">
                {p.title}
              </div>
              <div className="text-[10px] text-forge-muted">
                {p.domain}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-3 border-t border-forge-border flex items-center gap-2">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Or submit a custom technical question to all 4 specialist personas..."
            className="flex-1 rounded-md border border-white/[0.08] bg-[#0E121B] px-3 py-1.5 font-mono text-xs text-forge-text focus:border-cyan-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleRunCustom}
            disabled={!customQuery.trim()}
            className="rounded-md bg-purple-500 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-purple-400 disabled:opacity-50"
          >
            Run Council
          </button>
        </div>
      </div>

      {/* Active Question Banner */}
      <div className="rounded-xl border border-forge-border bg-[#0A0D14] p-4 font-mono text-xs">
        <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold block mb-1">
          Council Target Query
        </span>
        <p className="text-forge-text leading-relaxed">
          {customQuery.trim() || preset.query}
        </p>
      </div>

      {/* Side-by-Side Specialist Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {EXPERT_ROLES.map((role) => {
          const resp = responses.find((r) => r.roleId === role.id);
          const icon = roleIcons[role.id];
          const borderCls = roleBorderColors[role.id];

          return (
            <div
              key={role.id}
              className={`rounded-xl border bg-[#0A0D14] p-4 shadow-xl flex flex-col justify-between transition-all ${borderCls}`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08]">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold text-forge-text leading-tight">
                      {role.title}
                    </h3>
                    <span className="text-[10px] text-forge-muted block">
                      {role.persona}
                    </span>
                  </div>
                </div>

                {/* Key Takeaway Pill */}
                {resp && (
                  <div className="mt-3 rounded border border-white/[0.06] bg-[#0E121B] p-2.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-0.5">
                      Core Perspective Highlight:
                    </span>
                    <p className="text-[11px] font-mono text-forge-text leading-snug">
                      &ldquo;{resp.keyTakeaway}&rdquo;
                    </p>
                  </div>
                )}

                {/* Full Specialist Response */}
                <div className="mt-3 max-h-72 overflow-y-auto rounded border border-white/[0.06] bg-[#0E121B] p-3 font-mono text-xs text-forge-text leading-relaxed whitespace-pre-wrap">
                  {resp?.response || "Evaluating query under specialist frame..."}
                </div>
              </div>

              {/* Card Footer: Metrics & Independent Scores */}
              <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2">
                {resp && (
                  <>
                    <div className="flex items-center justify-between text-[10px] font-mono text-forge-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {resp.latencyMs}ms
                      </span>
                      <span>{resp.tokensUsed} tokens</span>
                    </div>

                    {/* Independent Metric Scores (No combined score!) */}
                    <div className="space-y-1 pt-1 border-t border-white/[0.04]">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-forge-muted">Domain Rigor:</span>
                        <span className="text-red-400 font-bold">
                          {resp.scores.domainRigor.score}/5
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-forge-muted">Actionability:</span>
                        <span className="text-cyan-400 font-bold">
                          {resp.scores.actionability.score}/5
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-forge-muted">Risk Awareness:</span>
                        <span className="text-emerald-400 font-bold">
                          {resp.scores.riskAwareness.score}/5
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
