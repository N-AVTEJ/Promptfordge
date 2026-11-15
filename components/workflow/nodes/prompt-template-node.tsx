"use client";

import React, { memo, useMemo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Code2, Clock, Tag } from "lucide-react";
import { PromptTemplateData } from "@/lib/workflow/types";
import { extractTemplateVariables } from "@/lib/workflow/engine";

export const PromptTemplateNode = memo(function PromptTemplateNode({
  data,
  isConnectable,
}: NodeProps<PromptTemplateData>) {
  const statusColors = {
    idle: "border-forge-border bg-[#0A0D14]",
    running: "border-ember-500 bg-ember-950/20 ring-1 ring-ember-500 animate-pulse",
    done: "border-emerald-500/70 bg-emerald-950/20",
    failed: "border-rose-500 bg-rose-950/20 ring-1 ring-rose-500",
  };

  const detectedVars = useMemo(() => {
    return extractTemplateVariables(data.template || "");
  }, [data.template]);

  return (
    <div
      className={`relative w-80 rounded-xl border p-4 shadow-xl transition-all ${
        statusColors[data.status] || statusColors.idle
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="text-in"
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#0A0D14] !bg-cyan-400 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-ember-500/10 text-ember-400">
            <Code2 className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold text-forge-text">
            {data.label || "Prompt Template"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              data.status === "running"
                ? "bg-ember-400 animate-ping"
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

      {/* Node Body */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono text-forge-muted">
            Template (use {"{{variable}}"})
          </label>
        </div>
        <textarea
          rows={3}
          value={data.template}
          onChange={(e) => {
            data.template = e.target.value;
          }}
          placeholder="System role... {{input}} ...constraints"
          className="w-full resize-none rounded-md border border-white/[0.08] bg-[#0E121B] px-2.5 py-1.5 font-mono text-xs text-forge-text placeholder:text-forge-muted/50 focus:border-ember-500 focus:outline-none"
        />

        {/* Detected Variables Chips */}
        {detectedVars.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-forge-muted flex items-center gap-1">
              <Tag className="h-2.5 w-2.5" /> Variables:
            </span>
            {detectedVars.map((v) => (
              <span
                key={v}
                className="rounded bg-ember-500/15 px-1.5 py-0.5 font-mono text-[10px] text-ember-300 border border-ember-500/30"
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}

        {data.educationalNote && (
          <p className="text-[10px] text-forge-muted italic leading-tight">
            {data.educationalNote}
          </p>
        )}
      </div>

      {/* Output preview when done */}
      {data.output && (
        <div className="mt-2.5 rounded border border-emerald-500/30 bg-emerald-950/30 p-2 font-mono text-[11px] text-emerald-300">
          <div className="flex items-center justify-between text-[10px] text-emerald-400/80 mb-1">
            <span>Compiled Prompt</span>
            {data.metrics?.latencyMs !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {data.metrics.latencyMs}ms
              </span>
            )}
          </div>
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
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#0A0D14] !bg-ember-400 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
