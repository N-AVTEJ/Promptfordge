"use client";

import React, { useState } from "react";
import {
  Terminal,
  Calculator,
  Search,
  CheckCircle2,
  Play,
  RotateCcw,
  SkipForward,
  Info,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  REACT_SCENARIOS,
  REACT_EDUCATIONAL_DISCLOSURE,
  executeMockTool,
} from "@/lib/reasoning/react-engine";
import { ReactScenario, ReactStep } from "@/lib/reasoning/types";

export function ReactVisualizer() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    REACT_SCENARIOS[0].id
  );
  const [visibleStepCount, setVisibleStepCount] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Live Mock Tool Sandbox inputs
  const [testTool, setTestTool] = useState<"calculator" | "lookup">("calculator");
  const [testInput, setTestInput] = useState<string>("25 * 1024 * 0.05 * 12");
  const [testOutput, setTestOutput] = useState<string>("");

  const scenario: ReactScenario =
    REACT_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    REACT_SCENARIOS[0];

  const totalSteps = scenario.steps.length;
  const visibleSteps = scenario.steps.slice(0, visibleStepCount);

  // Step Forward
  const handleStepForward = () => {
    if (visibleStepCount < totalSteps) {
      setVisibleStepCount((prev) => prev + 1);
    }
  };

  // Step Back
  const handleStepBack = () => {
    if (visibleStepCount > 1) {
      setVisibleStepCount((prev) => prev - 1);
    }
  };

  // Reset
  const handleReset = () => {
    setIsPlaying(false);
    setVisibleStepCount(1);
  };

  // Reveal All
  const handleRevealAll = () => {
    setIsPlaying(false);
    setVisibleStepCount(totalSteps);
  };

  // Play animation through steps
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (visibleStepCount < totalSteps) {
        timer = setTimeout(() => {
          setVisibleStepCount((prev) => prev + 1);
        }, 800);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, visibleStepCount, totalSteps]);

  // Execute test tool in sandbox
  const handleRunToolTest = () => {
    const res = executeMockTool(testTool, testInput);
    setTestOutput(res.output);
  };

  return (
    <div className="space-y-6">
      {/* Educational Simulation Disclosure Header */}
      <div className="flex items-start gap-3 rounded-xl border border-ember-500/30 bg-ember-950/20 p-4">
        <Info className="h-5 w-5 text-ember-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-amber-200 leading-relaxed">
          <span className="font-bold text-amber-300">
            [EDUCATIONAL SIMULATION / THOUGHT SUMMARIES]
          </span>{" "}
          {REACT_EDUCATIONAL_DISCLOSURE}
        </div>
      </div>

      {/* Scenario Selector & Stepper Controls */}
      <div className="rounded-xl border border-forge-border bg-forge-surface p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Scenario Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-forge-muted uppercase">
            Scenario:
          </span>
          {REACT_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSelectedScenarioId(s.id);
                setVisibleStepCount(1);
                setIsPlaying(false);
              }}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-all ${
                selectedScenarioId === s.id
                  ? "bg-ember-500 text-black font-bold shadow-lg"
                  : "border border-forge-border bg-[#0E121B] text-forge-text hover:border-white/[0.15]"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-forge-muted mr-1">
            Step {visibleStepCount} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg border border-forge-border bg-[#0E121B] px-2.5 py-1.5 font-mono text-xs text-forge-muted hover:text-forge-text"
            title="Reset to step 1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleStepBack}
            disabled={visibleStepCount <= 1}
            className="rounded-lg border border-forge-border bg-[#0E121B] px-2.5 py-1.5 font-mono text-xs text-forge-text disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={handleStepForward}
            disabled={visibleStepCount >= totalSteps}
            className="rounded-lg border border-cyan-500/40 bg-cyan-950/20 px-3 py-1.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-900/30 disabled:opacity-40 flex items-center gap-1"
          >
            <span>Next Step</span>
            <SkipForward className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-lg bg-cyan-500 px-3.5 py-1.5 font-mono text-xs font-bold text-black hover:bg-cyan-400 flex items-center gap-1.5"
          >
            <Play className={`h-3 w-3 ${isPlaying ? "animate-spin" : ""}`} />
            <span>{isPlaying ? "Pause" : "Auto Play"}</span>
          </button>
          <button
            type="button"
            onClick={handleRevealAll}
            className="rounded-lg border border-forge-border bg-[#0E121B] px-2.5 py-1.5 font-mono text-xs text-forge-muted hover:text-forge-text"
          >
            All Steps
          </button>
        </div>
      </div>

      {/* Target Question Banner */}
      <div className="rounded-xl border border-forge-border bg-[#0A0D14] p-4 font-mono text-xs">
        <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold block mb-1">
          Target Prompt / Operational Task
        </span>
        <p className="text-forge-text leading-relaxed">{scenario.task}</p>
      </div>

      {/* Alternating Step Timeline */}
      <div className="space-y-4">
        {visibleSteps.map((step: ReactStep, idx: number) => {
          const isThought = step.type === "thought";
          const isAction = step.type === "action";
          const isObservation = step.type === "observation";
          const isFinish = step.type === "finish";

          return (
            <div
              key={step.stepNumber}
              className={`rounded-xl border p-4 shadow-xl transition-all ${
                isThought
                  ? "border-ember-500/40 bg-ember-950/15"
                  : isAction
                  ? "border-cyan-500/50 bg-[#0E121B]"
                  : isObservation
                  ? "border-emerald-500/40 bg-emerald-950/15"
                  : "border-amber-400 bg-amber-950/20 ring-1 ring-amber-400"
              }`}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isThought && (
                    <Badge className="bg-ember-500/20 text-ember-300 border border-ember-500/40 font-mono text-[10px] font-bold">
                      THOUGHT (SUMMARY)
                    </Badge>
                  )}
                  {isAction && (
                    <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-[10px] font-bold flex items-center gap-1">
                      <Terminal className="h-3 w-3" />
                      ACTION [{step.toolName}]
                    </Badge>
                  )}
                  {isObservation && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      OBSERVATION
                    </Badge>
                  )}
                  {isFinish && (
                    <Badge className="bg-amber-500 text-black font-mono text-[10px] font-bold">
                      ★ FINAL ANSWER
                    </Badge>
                  )}
                  <span className="font-mono text-xs font-semibold text-forge-text">
                    {step.title}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-forge-muted">
                  +{step.timestamp}ms
                </span>
              </div>

              {/* Step Content */}
              <div className="font-mono text-xs text-forge-text leading-relaxed pl-1 whitespace-pre-wrap">
                {isAction ? (
                  <div className="rounded border border-white/[0.08] bg-[#07080B] p-2.5 text-cyan-300 font-mono text-xs">
                    <span className="text-forge-muted select-none">{"> "}</span>
                    {step.content}
                  </div>
                ) : isObservation ? (
                  <div className="rounded border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-emerald-300 font-mono text-xs">
                    <span className="text-emerald-500 select-none">{"← "}</span>
                    {step.content}
                  </div>
                ) : (
                  <p>{step.content}</p>
                )}
              </div>

              {/* Pedagogical Note */}
              <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-forge-muted italic">
                {step.educationalNote}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Mock Tool Sandbox */}
      <div className="rounded-xl border border-forge-border bg-forge-surface p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/10 text-cyan-400">
              <Terminal className="h-3.5 w-3.5" />
            </div>
            <span className="font-mono text-xs font-bold text-forge-text">
              Interactive Mock Tool Sandbox
            </span>
          </div>
          <span className="font-mono text-[10px] text-forge-muted">
            Test ReAct tools directly with verified outputs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-forge-muted block">
              Select Tool
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTestTool("calculator");
                  setTestInput("25 * 1024 * 0.05 * 12");
                  setTestOutput("");
                }}
                className={`flex-1 rounded-lg border p-2 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors ${
                  testTool === "calculator"
                    ? "border-cyan-500 bg-cyan-950/30 text-cyan-300 font-bold"
                    : "border-forge-border bg-[#0E121B] text-forge-muted"
                }`}
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>Calculator</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestTool("lookup");
                  setTestInput("argon2id");
                  setTestOutput("");
                }}
                className={`flex-1 rounded-lg border p-2 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors ${
                  testTool === "lookup"
                    ? "border-ember-500 bg-ember-950/30 text-ember-300 font-bold"
                    : "border-forge-border bg-[#0E121B] text-forge-muted"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span>Lookup</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-forge-muted block">
              Tool Input
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder={
                  testTool === "calculator"
                    ? "(450 * 12) + 300"
                    : "cloud egress, argon2id, etc."
                }
                className="flex-1 rounded-md border border-white/[0.08] bg-[#0E121B] px-3 py-1.5 font-mono text-xs text-forge-text focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRunToolTest}
                className="rounded-md bg-cyan-500 px-3 py-1.5 font-mono text-xs font-bold text-black hover:bg-cyan-400"
              >
                Run Tool
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-forge-muted block">
              Tool Output Result
            </label>
            <div className="min-h-[38px] rounded-md border border-white/[0.08] bg-[#07080B] px-3 py-2 font-mono text-xs text-emerald-400">
              {testOutput ? (
                testOutput
              ) : (
                <span className="text-forge-muted/50 italic">
                  Press Run Tool to execute...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
