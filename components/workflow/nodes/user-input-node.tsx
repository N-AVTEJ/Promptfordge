"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { MessageSquare, Clock } from "lucide-react";
import { UserInputData } from "@/lib/workflow/types";

export const UserInputNode = memo(function UserInputNode({
  data,
  isConnectable,
}: NodeProps<UserInputData>) {
  const [inputVal, setInputVal] = React.useState(data.inputPrompt || "");

  React.useEffect(() => {
    setInputVal(data.inputPrompt || "");
  }, [data.inputPrompt]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputVal(val);
    data.inputPrompt = val;
  };

  const statusColors = {
    idle: "border-forge-border bg-[#0A0D14]",
    running: "border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500 animate-pulse",
    done: "border-emerald-500/70 bg-emerald-950/20",
    failed: "border-rose-500 bg-rose-950/20 ring-1 ring-rose-500",
  };

  return (
    <div
      className={`relative w-80 rounded-xl border p-4 shadow-xl transition-all ${
        statusColors[data.status] || statusColors.idle
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold text-forge-text">
            {data.label || "User Input"}
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

      {/* Node Body */}
      <div className="mt-3 space-y-2">
        <label className="block text-[11px] font-mono text-forge-muted">
          Input Prompt Text
        </label>
        <textarea
          rows={3}
          value={inputVal}
          onChange={handleChange}
          placeholder="Enter prompt input or parameters..."
          className="w-full resize-none rounded-md border border-white/[0.08] bg-[#0E121B] px-2.5 py-1.5 font-mono text-xs text-forge-text placeholder:text-forge-muted/50 focus:border-cyan-500 focus:outline-none"
        />
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
            <span>Payload Emitted</span>
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
        data-datatype="text"
        title="Output: text"
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#0A0D14] !bg-cyan-400 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
