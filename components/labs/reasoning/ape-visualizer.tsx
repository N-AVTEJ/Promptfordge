"use client";

import React, { useState } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  APE_EXPERIMENTS,
  APE_EDUCATIONAL_DISCLOSURE,
  getApeExperiment,
} from "@/lib/reasoning/ape-engine";
import { ApeCandidate } from "@/lib/reasoning/types";

export function ApeVisualizer() {
  const [selectedExpId, setSelectedExpId] = useState<string>(
    APE_EXPERIMENTS[0].id
  );
  const experiment = getApeExperiment(selectedExpId);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    experiment.candidates[0].id
  );

  const selectedCandidate: ApeCandidate =
    experiment.candidates.find((c) => c.id === selectedCandidateId) ||
    experiment.candidates[0];

  return (
    <div className="space-y-6">
      {/* Educational Disclosure Header */}
      <div className="flex items-start gap-3 rounded-2xl border border-ultramarine/20 bg-ultramarine/5 p-4">
        <Info className="h-5 w-5 text-ultramarine shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-navy/80 leading-relaxed">
          <span className="font-bold text-ultramarine uppercase">
            [EDUCATIONAL SIMULATION / AUTOMATIC PROMPT ENGINEER]
          </span>{" "}
          {APE_EDUCATIONAL_DISCLOSURE}
        </div>
      </div>

      {/* Task & Experiment Picker Header */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/10 pb-4">
          <div>
            <span className="text-xs font-mono font-semibold text-navy/60 uppercase">
              APE Optimization Task
            </span>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedExpId}
                onChange={(e) => {
                  setSelectedExpId(e.target.value);
                  const newExp = getApeExperiment(e.target.value);
                  setSelectedCandidateId(newExp.candidates[0].id);
                }}
                className="rounded-xl border border-navy/15 bg-daylight px-3 py-1.5 font-mono text-xs font-bold text-navy focus:outline-none focus:border-ultramarine"
              >
                {APE_EXPERIMENTS.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.taskTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-navy/70">
            <div>
              <span className="text-navy/50">Demonstration Pairs:</span>{" "}
              <span className="font-bold text-navy">{experiment.inputOutputDemos.length}</span>
            </div>
            <div className="h-4 w-px bg-navy/15" />
            <div>
              <span className="text-navy/50">Test Cases:</span>{" "}
              <span className="font-bold text-navy">{experiment.testCases.length}</span>
            </div>
            <div className="h-4 w-px bg-navy/15" />
            <div>
              <span className="text-navy/50">Candidates Evaluated:</span>{" "}
              <span className="font-bold text-ultramarine">{experiment.candidates.length}</span>
            </div>
          </div>
        </div>

        {/* Task Objective and Input-Output Demonstrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-navy/10 bg-daylight p-4 space-y-2">
            <span className="text-[11px] font-mono font-bold text-navy/60 uppercase">
              1. Input-Output Demonstrations (Exemplars fed to Proposal LLM)
            </span>
            <div className="space-y-2 font-mono text-xs">
              {experiment.inputOutputDemos.map((demo, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-navy/10 space-y-1">
                  <div className="text-navy/60 text-[10px]">Input #{idx + 1}: {demo.input}</div>
                  <div className="text-ultramarine font-semibold text-[11px]">Output: {demo.output}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-daylight p-4 space-y-2">
            <span className="text-[11px] font-mono font-bold text-navy/60 uppercase">
              2. Monte Carlo Validation Cases (Scoring Suite)
            </span>
            <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto pr-1">
              {experiment.testCases.map((tc, idx) => (
                <div key={tc.id} className="bg-white p-2.5 rounded-xl border border-navy/10 text-[11px]">
                  <div className="font-semibold text-navy">Case {idx + 1}: {tc.input}</div>
                  <div className="text-navy/50 text-[10px] mt-0.5">Expected: {tc.expectedOutput}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Candidate Ranking Leaderboard */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-navy uppercase flex items-center gap-2">
              <Trophy className="h-4 w-4 text-marigold-600" />
              <span>Prompt Candidate Leaderboard (Automatic Hypothesis Ranking)</span>
            </span>
            <span className="text-xs font-mono text-navy/50">
              Ranked by Monte Carlo Validation Pass Rate
            </span>
          </div>

          <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white overflow-hidden shadow-2xs">
            {experiment.candidates.map((cand) => {
              const isSelected = cand.id === selectedCandidate.id;
              const isTop = cand.rank === 1;

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  className={`cursor-pointer p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-ultramarine/[0.04] border-l-4 border-l-ultramarine"
                      : "hover:bg-daylight/50"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-navy">
                        Rank #{cand.rank}
                      </span>
                      {isTop && (
                        <Badge className="bg-marigold text-navy font-mono text-[10px] font-bold">
                          ★ Optimal Candidate
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] ${
                          cand.status === "top_candidate"
                            ? "border-mint-400 bg-mint-50 text-mint-800"
                            : cand.status === "evaluated"
                            ? "border-sky-400 bg-sky-50 text-sky-800"
                            : "border-rose-400 bg-rose-50 text-rose-800"
                        }`}
                      >
                        {cand.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <p className="font-mono text-xs text-navy/90 line-clamp-2 leading-relaxed">
                      &quot;{cand.instruction}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-navy/60 uppercase">Eval Score</div>
                      <div className="text-lg font-mono font-black text-navy">{cand.averageScore}%</div>
                    </div>

                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className={`h-8 text-xs font-mono ${
                        isSelected
                          ? "bg-ultramarine text-white"
                          : "border-navy/20 text-navy hover:bg-daylight"
                      }`}
                    >
                      {isSelected ? "Inspecting" : "Inspect Run"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Candidate Detailed Inspection */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-navy/10 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-ultramarine uppercase">
              Candidate #{selectedCandidate.rank} Instruction Analysis
            </span>
            <h3 className="font-sans text-base font-bold text-navy">
              Prompt Hypothesis Synthesis & Test Matrix Breakdown
            </h3>
          </div>
          <Badge className="bg-ultramarine text-white font-mono text-xs">
            Score: {selectedCandidate.averageScore}%
          </Badge>
        </div>

        {/* Synthesized Prompt Text */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold text-navy/60 uppercase">
            Proposed System / Directive Prompt
          </span>
          <div className="rounded-2xl border border-navy/10 bg-daylight p-4 font-mono text-xs text-navy leading-relaxed font-semibold">
            {selectedCandidate.instruction}
          </div>
          <p className="text-xs text-navy/70 font-sans italic">
            Rationale: {selectedCandidate.rationale}
          </p>
        </div>

        {/* Test Matrix Pass/Fail Grid */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-navy uppercase">
            Test Case Evaluation Results ({selectedCandidate.testScores.filter(s => s.passed).length}/{selectedCandidate.testScores.length} Passed)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedCandidate.testScores.map((score, sIdx) => {
              const testCase = experiment.testCases.find((tc) => tc.id === score.caseId);

              return (
                <div
                  key={score.caseId}
                  className={`rounded-xl border p-3 space-y-1.5 ${
                    score.passed
                      ? "border-mint-300 bg-mint-50/30"
                      : "border-rose-200 bg-rose-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-navy">Test Case #{sIdx + 1}</span>
                    <span
                      className={`flex items-center gap-1 font-bold ${
                        score.passed ? "text-mint-800" : "text-rose-700"
                      }`}
                    >
                      {score.passed ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-mint-700" />
                          <span>Pass ({score.score}%)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-rose-600" />
                          <span>Fail ({score.score}%)</span>
                        </>
                      )}
                    </span>
                  </div>
                  {testCase && (
                    <div className="text-[11px] font-mono text-navy/70 line-clamp-2">
                      Input: {testCase.input}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
