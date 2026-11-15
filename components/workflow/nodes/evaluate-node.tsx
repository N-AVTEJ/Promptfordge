"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { EvaluateData } from "@/lib/workflow/types";

export const EvaluateNode = memo(function EvaluateNode({
  data,
  isConnectable,
}: NodeProps<EvaluateData>) {
  const statusColors = {
    idle: "border-indigo-950/10 bg-white shadow-card",
    running: "border-violet bg-violet/10 ring-1 ring-violet animate-pulse",
    done: "border-teal/70 bg-teal/10",
    failed: "border-coral bg-coral/10 ring-1 ring-coral",
  };

  const scores = data.scores;

  return (
    <div
      className={`relative w-88 rounded-xl border p-4 shadow-xl transition-all ${
        statusColors[data.status] || statusColors.idle
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="text-in"
        isConnectable={isConnectable}
        data-datatype="text"
        title="Input: candidate text"
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-violet hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-pink-500/10 text-pink-400">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold text-forge-text">
            {data.label || "Evaluate (Rubric)"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              data.status === "running"
                ? "bg-purple-400 animate-ping"
                : data.status === "done"
                ? "bg-emerald-400"
                : data.status === "failed"
                ? "bg-rose-400"
                : "bg-forge-muted/40"
            }`}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-forge-muted">
            {data.status}
          </span>
        </div>
      </div>

      {/* Body / Criteria */}
      <div className="mt-3 space-y-2">
        <div className="rounded border border-indigo-950/10 bg-cream/70 p-2 text-[10px] font-mono text-indigo-900/70 leading-relaxed">
          <span className="text-coral font-semibold block mb-0.5">
            4-Dimensional Quality Rubric
          </span>
          Independent metric evaluation across Clarity, Relevance, Correctness, and Constraint Following.
        </div>

        {data.educationalNote && (
          <p className="text-[10px] text-indigo-900/60 italic leading-tight">
            {data.educationalNote}
          </p>
        )}
      </div>

      {/* 4 Separate Scores Display (Never combined!) */}
      {scores && data.status === "done" && (
        <div className="mt-2.5 space-y-1.5 rounded border border-indigo-950/10 bg-cream/70 p-2.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-[10px] text-teal font-semibold mb-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Rubric Assessment
            </span>
            {data.metrics?.latencyMs !== undefined && (
              <span className="text-indigo-900/60 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {data.metrics.latencyMs}ms
              </span>
            )}
          </div>

          {/* Metric 1: Clarity */}
          <div className="flex items-center justify-between">
            <span className="text-forge-muted">Clarity</span>
            <div className="flex items-center gap-1">
              <span className="text-cyan-400 font-bold">{scores.clarity}/5</span>
            </div>
          </div>
          <div className="h-1 w-full rounded-full bg-forge-muted/20 overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${(scores.clarity / 5) * 100}%` }}
            />
          </div>

          {/* Metric 2: Relevance */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-forge-muted">Relevance</span>
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">{scores.relevance}/5</span>
            </div>
          </div>
          <div className="h-1 w-full rounded-full bg-forge-muted/20 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${(scores.relevance / 5) * 100}%` }}
            />
          </div>

          {/* Metric 3: Correctness */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-forge-muted">Correctness</span>
            <div className="flex items-center gap-1">
              <span className="text-amber-400 font-bold">{scores.correctness}/5</span>
            </div>
          </div>
          <div className="h-1 w-full rounded-full bg-forge-muted/20 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${(scores.correctness / 5) * 100}%` }}
            />
          </div>

          {/* Metric 4: Constraints */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-forge-muted">Constraints</span>
            <div className="flex items-center gap-1">
              <span className="text-purple-400 font-bold">
                {scores.constraintFollowing}/5
              </span>
            </div>
          </div>
          <div className="h-1 w-full rounded-full bg-forge-muted/20 overflow-hidden">
            <div
              className="h-full bg-purple-400 rounded-full"
              style={{ width: `${(scores.constraintFollowing / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Output text */}
      {data.output && !scores && (
        <div className="mt-2 rounded border border-emerald-500/30 bg-emerald-950/30 p-2 font-mono text-[10px] text-emerald-300">
          <p className="line-clamp-2">{data.output}</p>
        </div>
      )}

      {/* Error message */}
      {data.error && (
        <div className="mt-2 rounded border border-rose-500/30 bg-rose-950/30 p-2 text-[10px] text-rose-300 font-mono">
          {data.error}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="text-out"
        isConnectable={isConnectable}
        data-datatype="evaluation"
        title="Output: rubric evaluation scores"
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-coral hover:!scale-125 transition-transform"
      />
    </div>
  );
});
