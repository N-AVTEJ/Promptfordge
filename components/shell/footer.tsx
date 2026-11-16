import React from "react";
import Link from "next/link";
import { Flame, ShieldCheck, Terminal, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-indigo-950/10 bg-cream py-16 text-indigo-900/70">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-coral/30 bg-coral/10">
                <Flame className="h-4 w-4 text-coral" />
              </div>
              <span className="font-sans text-lg font-bold tracking-tight text-indigo">
                Prompt<span className="text-coral">Forge</span>
              </span>
            </div>
            <p className="max-w-[65ch] text-sm leading-relaxed text-indigo-900/70">
              Interactive prompt engineering academy and laboratory. Master tokenomics,
              decomposition chains, structured output contracts, and adversarial defense.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-teal/30 bg-teal/10 px-2.5 py-1 text-teal font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Educational Simulation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-coral/30 bg-coral/10 px-2.5 py-1 text-coral font-medium">
                <Terminal className="h-3.5 w-3.5" />
                Zero Auth Wall
              </span>
            </div>
          </div>

          {/* Curriculum & Labs */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-indigo">
              Curriculum & Labs
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/academy"
                  className="transition-colors hover:text-coral"
                >
                  Academy Modules (1–12)
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/anatomy"
                  className="transition-colors hover:text-coral"
                >
                  Prompt Anatomy Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/llm-simulator"
                  className="transition-colors hover:text-coral"
                >
                  LLM Transformer Simulator
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/playground"
                  className="transition-colors hover:text-coral"
                >
                  Live Prompt Playground
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-indigo">
              Quick Launch
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 font-semibold text-coral transition-colors hover:text-coral-600"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/evaluate"
                  className="transition-colors hover:text-coral"
                >
                  Evaluation Engine
                </Link>
              </li>
              <li>
                <Link
                  href="/arena"
                  className="transition-colors hover:text-coral"
                >
                  Model Benchmark Arena
                </Link>
              </li>
              <li>
                <Link
                  href="/challenges"
                  className="transition-colors hover:text-coral"
                >
                  Defense Challenges
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-indigo-950/10 pt-6 sm:flex-row text-xs text-indigo-900/60 font-mono">
          <p>
            PromptForge Academy · Designed for engineers building reliable AI systems.
          </p>
          <p className="mt-2 sm:mt-0">
            Open-source architecture · Server-side execution
          </p>
        </div>
      </div>
    </footer>
  );
}
