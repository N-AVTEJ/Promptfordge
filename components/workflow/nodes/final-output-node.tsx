"use client";

import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Check, Copy, FileText, CheckCircle2 } from "lucide-react";
import { FinalOutputData } from "@/lib/workflow/types";

export const FinalOutputNode = memo(function FinalOutputNode({
  data,
  isConnectable,
}: NodeProps<FinalOutputData>) {
  const [copied, setCopied] = useState(false);

  const statusColors = {
    idle: "border-forge-border bg-[#0A0D14]",
    running: "border-emerald-400 bg-emerald-950/20 ring-1 ring-emerald-400 animate-pulse",
    done: "border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/50 shadow-emerald-950/30",
    failed: "border-rose-500 bg-rose-950/20 ring-1 ring-rose-500",
  };

  const handleCopy = () => {
    if (!data.output) return;
    navigator.clipboard.writeText(data.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = data.output
    ? data.output.trim().split(/\s+/).filter(Boolean).length
    : 0;

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
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#0A0D14] !bg-emerald-400 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold text-forge-text">
            {data.label || "Final Output"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              data.status === "running"
                ? "bg-emerald-400 animate-ping"
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

      {/* Body & Output View */}
      <div className="mt-3 space-y-2">
        {data.output ? (
          <div>
            <div className="flex items-center justify-between pb-1 text-[10px] font-mono text-forge-muted">
              <span>{wordCount} words · {data.output.length} chars</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded bg-white/[0.05] px-2 py-0.5 text-xs text-forge-text hover:bg-white/[0.1] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto rounded border border-white/[0.08] bg-[#0E121B] p-2.5 font-mono text-xs text-forge-text leading-relaxed whitespace-pre-wrap">
              {data.output}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded border border-dashed border-white/[0.1] bg-[#0E121B]/50 p-6 text-center">
            <FileText className="h-6 w-6 text-forge-muted/40 mb-1.5" />
            <p className="font-mono text-[11px] text-forge-muted">
              Awaiting pipeline execution...
            </p>
            <p className="mt-1 text-[10px] text-forge-muted/60">
              Output will render here once the workflow finishes.
            </p>
          </div>
        )}

        {data.educationalNote && (
          <p className="text-[10px] text-forge-muted italic leading-tight pt-1">
            {data.educationalNote}
          </p>
        )}
      </div>

      {/* Error message */}
      {data.error && (
        <div className="mt-2 rounded border border-rose-500/30 bg-rose-950/30 p-2 text-[10px] text-rose-300 font-mono">
          {data.error}
        </div>
      )}
    </div>
  );
});
