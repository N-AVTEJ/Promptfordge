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
      stroke: "var(--coral)",
      bg: "rgba(255, 107, 74, 0.1)",
      text: "text-ultramarine",
    },
    cyan: {
      stroke: "var(--teal)",
      bg: "rgba(18, 181, 166, 0.1)",
      text: "text-teal",
    },
    emerald: {
      stroke: "var(--teal)",
      bg: "rgba(18, 181, 166, 0.1)",
      text: "text-teal",
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--forge-border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
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
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {showLabel && (
        <span
          className={cn(
            "absolute font-mono font-bold leading-none select-none text-navy",
            size >= 64 ? "text-sm" : size >= 40 ? "text-xs" : "text-[10px]"
          )}
        >
          {normalizedPercent === 100 ? (
            <Check className="h-3.5 w-3.5 text-teal" />
          ) : (
            `${normalizedPercent}%`
          )}
        </span>
      )}
    </div>
  );
}
