import React from "react";
import Link from "next/link";
import { Flame, ShieldCheck, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.07] bg-[#07080A] py-12 text-forge-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-gradient-to-b from-[#1C2028] to-[#101215]">
                <Flame className="h-3.5 w-3.5 text-ember-500" />
              </div>
              <span className="font-mono text-sm font-bold tracking-tight text-forge-text">
                PROMPT<span className="text-ember-500">FORGE</span>
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-forge-muted">
              Interactive prompt engineering academy and laboratory. Master tokenomics,
              decomposition chains, structured output contracts, and adversarial defense.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-[#0F1115] px-2 py-0.5 text-cyan-400">
                <ShieldCheck className="h-3 w-3" />
                Educational Simulation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-[#0F1115] px-2 py-0.5 text-forge-muted">
                <Terminal className="h-3 w-3 text-ember-500" />
                Deterministic Telemetry
              </span>
            </div>
          </div>

          {/* Curriculum & Tools */}
          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-forge-text">
              Curriculum & Labs
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link
                  href="/academy"
                  className="transition-colors hover:text-forge-text"
                >
                  Academy Modules (1–10)
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/anatomy"
                  className="transition-colors hover:text-forge-text"
                >
                  Prompt Anatomy Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/llm-simulator"
                  className="transition-colors hover:text-forge-text"
                >
                  LLM Transformer Simulator
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/playground"
                  className="transition-colors hover:text-forge-text"
                >
                  Live Prompt Playground
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Architecture */}
          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-forge-text">
              Architecture & Safety
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link
                  href="/evaluate"
                  className="transition-colors hover:text-forge-text"
                >
                  Evaluation Engine
                </Link>
              </li>
              <li>
                <Link
                  href="/arena"
                  className="transition-colors hover:text-forge-text"
                >
                  Model Benchmark Arena
                </Link>
              </li>
              <li>
                <Link
                  href="/library"
                  className="transition-colors hover:text-forge-text"
                >
                  Production Blueprints
                </Link>
              </li>
              <li>
                <Link
                  href="/challenges"
                  className="transition-colors hover:text-forge-text"
                >
                  Adversarial Defense Sandbox
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between border-t border-white/[0.06] pt-6 sm:flex-row font-mono text-[11px]">
          <p className="text-forge-muted">
            PromptForge Academy · Designed for engineers building reliable AI systems.
          </p>
          <p className="mt-2 text-forge-muted sm:mt-0">
            Open-source architecture · Server-side execution
          </p>
        </div>
      </div>
    </footer>
  );
}
