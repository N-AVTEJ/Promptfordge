"use client";

import React from "react";

interface ScanAnimationProps {
  variant?: "red" | "blue" | "split";
  label?: string;
}

export function ScanAnimation({
  variant = "split",
  label = "SYSTEM ENGAGED // RUNNING HEURISTIC SCAN",
}: ScanAnimationProps) {
  const colorClass =
    variant === "red"
      ? "from-red-500/0 via-red-500/30 to-red-500/0 border-red-500/40 text-red-400"
      : variant === "blue"
      ? "from-cyan-500/0 via-cyan-500/30 to-cyan-500/0 border-cyan-500/40 text-cyan-400"
      : "from-red-500/0 via-purple-500/20 to-cyan-500/0 border-cyan-500/40 text-cyan-300";

  return (
    <div className="relative overflow-hidden rounded-md border border-white/[0.08] bg-black/60 p-4 font-mono text-xs shadow-inner">
      {/* Moving scanning beam */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-full h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-[scan_2s_ease-in-out_infinite]"
        style={{
          animationDuration: "1.8s",
          animationIterationCount: "infinite",
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                variant === "red" ? "bg-red-400" : "bg-cyan-400"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                variant === "red" ? "bg-red-500" : "bg-cyan-500"
              }`}
            />
          </span>
          <span className="font-semibold tracking-wider uppercase text-forge-text">
            {label}
          </span>
        </div>
        <span className="text-[10px] text-forge-muted">
          TOKEN_STREAM_ACTIVE [ISOLATED_SANDBOX]
        </span>
      </div>

      {/* Visual pulse line */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded bg-white/[0.05]">
        <div
          className={`h-full w-1/3 bg-gradient-to-r ${colorClass} animate-[pulse_1.2s_ease-in-out_infinite]`}
        />
      </div>
    </div>
  );
}
