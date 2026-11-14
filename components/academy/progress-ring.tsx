"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProgressRingProps {
  percent: number; // 0 to 100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  accent?: "amber" | "cyan" | "emerald";
  className?: string;
  showLabel?: boolean;
}

export function ProgressRing({
  percent,
  size = 56,
  strokeWidth = 4,
  accent = "amber",
  className,
  showLabel = true,
}: ProgressRingProps) {
  const normalizedPercent = Math.min(100, Math.max(0, Math.round(percent)));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedPercent / 100) * circumference;

  const accentColors = {
    amber: {
      stroke: "#FF6B00",
      glow: "rgba(255, 107, 0, 0.4)",
      bg: "rgba(255, 107, 0, 0.12)",
      text: "text-ember-400",
    },
    cyan: {
      stroke: "#00E5FF",
      glow: "rgba(0, 229, 255, 0.4)",
      bg: "rgba(0, 229, 255, 0.12)",
      text: "text-cyan-400",
    },
    emerald: {
      stroke: "#10B981",
      glow: "rgba(16, 185, 129, 0.4)",
      bg: "rgba(16, 185, 129, 0.12)",
      text: "text-emerald-400",
    },
  }[accent];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center shrink-0", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={normalizedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${normalizedPercent}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-forge-border"
        />

        {/* Animated Active Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accentColors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            filter: normalizedPercent > 0 ? `drop-shadow(0 0 4px ${accentColors.glow})` : "none",
          }}
        />
      </svg>

      {/* Center Label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold leading-none">
          {normalizedPercent === 100 ? (
            <Check
              className={cn("h-3.5 w-3.5", accentColors.text)}
              strokeWidth={3}
              aria-label="Completed"
            />
          ) : (
            <span
              className={cn("tabular-nums", accentColors.text)}
              style={{ fontSize: Math.max(9, Math.round(size * 0.22)) }}
            >
              {normalizedPercent}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
