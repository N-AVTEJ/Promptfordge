"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Cpu, Clock, Zap, DollarSign } from "lucide-react";
import { LlmRunData } from "@/lib/workflow/types";

export const LlmRunNode = memo(function LlmRunNode({
  id,
  data,
  isConnectable,
}: NodeProps<LlmRunData>) {
  const statusColors = {
    idle: "border-forge-border bg-[#0A0D14]",
    running: "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400 animate-pulse",
    done: "border-emerald-500/70 bg-emerald-950/20",
    failed: "border-rose-500 bg-rose-950/20 ring-1 ring-rose-500",
  };

  return (
    <div
      className={`relative w-84 rounded-xl border p-4 shadow-xl transition-all ${
        statusColors[data.status] || statusColors.idle
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="text-in"
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#0A0D14] !bg-ember-400 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-400">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold text-forge-text">
            {data.label || "LLM Run"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              data.status === "running"
                ? "bg-cyan-400 animate-ping"
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

      {/* Controls */}
      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-mono text-forge-muted">
              Model
            </label>
            <select
              value={data.model}
              onChange={(e) => {
                data.model = e.target.value;
              }}
              className="mt-0.5 w-full rounded border border-white/[0.08] bg-[#0E121B] px-2 py-1 font-mono text-[11px] text-forge-text focus:border-cyan-500 focus:outline-none"
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-forge-muted">
                Temp
              </label>
              <span className="font-mono text-[10px] text-cyan-400">
                {data.temperature ?? 0.7}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={data.temperature ?? 0.7}
              onChange={(e) => {
                data.temperature = parseFloat(e.target.value);
              }}
              className="mt-1 w-full accent-cyan-400"
            />
          </div>
        </div>

        {data.educationalNote && (
          <p className="text-[10px] text-forge-muted italic leading-tight">
            {data.educationalNote}
          </p>
        )}
      </div>

      {/* Telemetry bar when done */}
      {data.metrics && data.status === "done" && (
        <div className="mt-2.5 flex items-center justify-between rounded border border-white/[0.06] bg-[#0E121B] px-2 py-1 text-[10px] font-mono text-forge-muted">
          <span className="flex items-center gap-1 text-cyan-400">
            <Clock className="h-2.5 w-2.5" />
            {data.metrics.latencyMs || 0}ms
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <Zap className="h-2.5 w-2.5" />
            {(data.metrics.tokensIn || 0) + (data.metrics.tokensOut || 0)} tok
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <DollarSign className="h-2.5 w-2.5" />
            ${(data.metrics.costUsd || 0).toFixed(5)}
          </span>
        </div>
      )}

      {/* Output preview when done */}
      {data.output && (
        <div className="mt-2 rounded border border-emerald-500/30 bg-emerald-950/30 p-2 font-mono text-[11px] text-emerald-300">
          <span className="text-[10px] text-emerald-400/80 block mb-0.5">
            Model Output
          </span>
          <p className="line-clamp-3 whitespace-pre-wrap">{data.output}</p>
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
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#0A0D14] !bg-purple-400 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
