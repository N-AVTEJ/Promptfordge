"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Shield } from "lucide-react";

export default function ArenaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PromptForge Arena Error]:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-8">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
        <h2 className="mt-4 text-xl font-bold text-white">Security Arena Sandbox Error</h2>
        <p className="mt-2 text-xs font-mono text-forge-muted max-w-md mx-auto">
          {error.message || "Failed to execute or evaluate arena test vector."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ultramarine px-4 py-2 text-xs font-semibold text-white"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Arena View</span>
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ultramarine px-4 py-2 text-xs font-bold text-white hover:bg-ultramarine-600 shadow-sm"
          >
            <Shield className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
