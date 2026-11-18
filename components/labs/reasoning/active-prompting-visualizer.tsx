"use client";

import React, { useState } from "react";
import {
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Info,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ACTIVE_PROMPTING_SUITES,
  ACTIVE_PROMPTING_DISCLOSURE,
  getActivePromptingSuite,
} from "@/lib/reasoning/active-prompting-engine";
import { ActivePromptSample } from "@/lib/reasoning/types";

export function ActivePromptingVisualizer() {
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>(
    ACTIVE_PROMPTING_SUITES[0].id
  );
  const suite = getActivePromptingSuite(selectedSuiteId);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    suite.samples[0].id
  );
  const [injectedSampleIds, setInjectedSampleIds] = useState<string[]>([
    suite.samples[0].id,
  ]);
  const [uncertaintyThreshold, setUncertaintyThreshold] = useState<number>(0.6);

  const selectedSample: ActivePromptSample =
    suite.samples.find((s) => s.id === selectedSampleId) || suite.samples[0];

  const handleToggleInjection = (sampleId: string) => {
    setInjectedSampleIds((prev) =>
      prev.includes(sampleId)
        ? prev.filter((id) => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  // Calculate overall dataset accuracy
  const totalSamples = suite.samples.length;
  const currentAccuracy = Math.round(
    suite.samples.reduce((acc, s) => {
      const isInjected = injectedSampleIds.includes(s.id);
      return acc + (isInjected ? s.accuracyWithActive : s.accuracyWithoutActive);
    }, 0) / (totalSamples || 1)
  );

  const baselineAccuracy = Math.round(
    suite.samples.reduce((acc, s) => acc + s.accuracyWithoutActive, 0) /
      (totalSamples || 1)
  );

  return (
    <div className="space-y-6">
      {/* Educational Disclosure Header */}
      <div className="flex items-start gap-3 rounded-2xl border border-ultramarine/20 bg-ultramarine/5 p-4">
        <Info className="h-5 w-5 text-ultramarine shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-navy/80 leading-relaxed">
          <span className="font-bold text-ultramarine uppercase">
            [EDUCATIONAL SIMULATION / ACTIVE PROMPTING]
          </span>{" "}
          {ACTIVE_PROMPTING_DISCLOSURE}
        </div>
      </div>

      {/* Suite Selector & Macro Telemetry */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/10 pb-4">
          <div>
            <span className="text-xs font-mono font-semibold text-navy/60 uppercase">
              Reasoning Domain
            </span>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedSuiteId}
                onChange={(e) => {
                  setSelectedSuiteId(e.target.value);
                  const newSuite = getActivePromptingSuite(e.target.value);
                  setSelectedSampleId(newSuite.samples[0].id);
                  setInjectedSampleIds([newSuite.samples[0].id]);
                }}
                className="rounded-xl border border-navy/15 bg-daylight px-3 py-1.5 font-mono text-xs font-bold text-navy focus:outline-none focus:border-ultramarine"
              >
                {ACTIVE_PROMPTING_SUITES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.domain})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[11px] font-mono text-navy/60 uppercase">Baseline Pass Rate</div>
              <div className="text-xl font-mono font-black text-navy">{baselineAccuracy}%</div>
            </div>
            <ArrowRight className="h-4 w-4 text-navy/30" />
            <div className="text-right">
              <div className="text-[11px] font-mono text-ultramarine uppercase font-bold">Active CoT Pass Rate</div>
              <div className="text-xl font-mono font-black text-ultramarine flex items-center gap-1 justify-end">
                <span>{currentAccuracy}%</span>
                <TrendingUp className="h-4 w-4 text-mint-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Uncertainty Threshold Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-daylight p-4 rounded-2xl border border-navy/10">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-navy">
            <Sliders className="h-4 w-4 text-ultramarine" />
            <span>Uncertainty Disagreement Threshold:</span>
            <span className="rounded-md bg-white border border-navy/15 px-2 py-0.5 font-bold text-ultramarine">
              ≥ {uncertaintyThreshold.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={uncertaintyThreshold}
            onChange={(e) => setUncertaintyThreshold(parseFloat(e.target.value))}
            className="w-48 accent-ultramarine cursor-pointer"
          />
        </div>

        {/* Samples List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suite.samples.map((sample, idx) => {
            const isSelected = sample.id === selectedSample.id;
            const isInjected = injectedSampleIds.includes(sample.id);
            const isAboveThreshold = sample.disagreementScore >= uncertaintyThreshold;

            return (
              <div
                key={sample.id}
                onClick={() => setSelectedSampleId(sample.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? "border-ultramarine bg-ultramarine/[0.03] shadow-xs"
                    : "border-navy/10 bg-white hover:border-navy/20 hover:bg-daylight/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-navy">
                      Question #{idx + 1}
                    </span>
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] ${
                        sample.uncertaintyLevel === "high"
                          ? "border-amber-400 bg-amber-50 text-amber-800"
                          : sample.uncertaintyLevel === "medium"
                          ? "border-sky-400 bg-sky-50 text-sky-800"
                          : "border-mint-400 bg-mint-50 text-mint-800"
                      }`}
                    >
                      {sample.uncertaintyLevel.toUpperCase()} UNCERTAINTY ({(sample.disagreementScore * 100).toFixed(0)}%)
                    </Badge>
                  </div>

                  {isAboveThreshold && (
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/70 border border-amber-300 rounded px-1.5 py-0.5">
                      Candidate for CoT
                    </span>
                  )}
                </div>

                <p className="text-xs font-sans text-navy/80 line-clamp-2 leading-relaxed">
                  {sample.question}
                </p>

                <div className="mt-4 pt-3 border-t border-navy/10 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-navy/60">
                    Accuracy: {sample.accuracyWithoutActive}% →{" "}
                    <span className="font-bold text-mint-700">
                      {sample.accuracyWithActive}%
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant={isInjected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleInjection(sample.id);
                    }}
                    className={`h-7 text-xs font-mono gap-1.5 ${
                      isInjected
                        ? "bg-ultramarine text-white hover:bg-ultramarine/90"
                        : "border-navy/20 text-navy hover:bg-daylight"
                    }`}
                  >
                    {isInjected ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Curated Exemplar Active</span>
                      </>
                    ) : (
                      <span>+ Annotate & Curate</span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Sample Detailed Deep-Dive */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-navy/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-ultramarine">
                Active Prompting Inspection
              </span>
              <span className="rounded-full bg-daylight px-2 py-0.5 font-mono text-[10px] text-navy/70 border border-navy/10">
                Disagreement Variance: {selectedSample.disagreementScore}
              </span>
            </div>
            <h3 className="font-sans text-base font-bold text-navy">
              Disagreement Sampling across Stochastic Generations
            </h3>
          </div>
        </div>

        {/* The Question */}
        <div className="rounded-2xl border border-navy/10 bg-daylight p-4 space-y-1">
          <span className="text-[11px] font-mono font-semibold text-navy/60 uppercase">
            Challenging Evaluation Prompt
          </span>
          <p className="font-mono text-xs text-navy leading-relaxed font-semibold">
            {selectedSample.question}
          </p>
        </div>

        {/* Sampled Drafts Disagreement Breakdown */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-navy flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-ultramarine" />
            <span>4 Independent Temperature-Sampled Outputs (Uncertainty Analysis)</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedSample.sampledAnswers.map((draft, dIdx) => (
              <div
                key={dIdx}
                className="rounded-xl border border-navy/10 bg-white p-3 space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-navy/60">
                  <span>Draft #{dIdx + 1}</span>
                  <span className="text-navy/40">T=0.7 Sampling</span>
                </div>
                <p className="text-xs font-mono text-navy/80 leading-relaxed">
                  {draft}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Expert CoT Exemplar */}
        <div className="rounded-2xl border-2 border-mint-500/40 bg-mint-50/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-mint-900">
              <Sparkles className="h-4 w-4 text-mint-700" />
              <span>Human-Curated Step-by-Step CoT Exemplar (Inserted into Few-Shot Pool)</span>
            </div>
            <Badge className="bg-mint-700 text-white font-mono text-[10px]">
              +{(selectedSample.accuracyWithActive - selectedSample.accuracyWithoutActive)}% Accuracy Gain
            </Badge>
          </div>

          <pre className="font-mono text-xs text-navy/90 leading-relaxed whitespace-pre-wrap bg-white/80 p-4 rounded-xl border border-mint-200">
            {selectedSample.curatedExemplar}
          </pre>
        </div>
      </div>
    </div>
  );
}
