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
      ? "from-coral/0 via-coral/30 to-coral/0 border-coral/40 text-coral"
      : variant === "blue"
      ? "from-teal/0 via-teal/30 to-teal/0 border-teal/40 text-teal-600"
      : "from-coral/0 via-violet/20 to-teal/0 border-teal/40 text-teal-700";

  return (
    <div className="relative overflow-hidden rounded-xl border border-indigo/10 bg-white p-4 font-mono text-xs shadow-sm">
      {/* Moving scanning beam */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-full h-full bg-gradient-to-b from-transparent via-teal-400/20 to-transparent animate-[scan_2s_ease-in-out_infinite]"
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
                variant === "red" ? "bg-coral" : "bg-teal-500"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                variant === "red" ? "bg-coral" : "bg-teal-600"
              }`}
            />
          </span>
          <span className="font-semibold tracking-wider uppercase text-indigo">
            {label}
          </span>
        </div>
        <span className="text-[10px] text-indigo/60">
          TOKEN_STREAM_ACTIVE [ISOLATED_SANDBOX]
        </span>
      </div>

      {/* Visual pulse line */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded bg-indigo/10">
        <div
          className={`h-full w-1/3 bg-gradient-to-r ${colorClass} animate-[pulse_1.2s_ease-in-out_infinite]`}
        />
      </div>
    </div>
  );
}
