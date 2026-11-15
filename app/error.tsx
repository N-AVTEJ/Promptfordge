"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PromptForge Root Error Boundary]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-950/20 text-rose-400 shadow-xl">
          <AlertTriangle className="h-8 w-8" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <span className="font-mono text-xs uppercase tracking-widest text-rose-400">
          Runtime Boundary Intercept
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          An Unexpected Sandbox Error Occurred
        </h1>
        <p className="text-xs text-forge-muted leading-relaxed font-mono">
          {error.message || "The client component failed to render cleanly."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-ember-500 to-amber-500 px-4 py-2 text-xs font-semibold text-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-xs font-bold text-white hover:bg-coral-600 shadow-card"
        >
          <Home className="h-4 w-4 text-forge-muted" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
