import Link from "next/link";
import { Flame, ArrowLeft, Terminal, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-ember-500/20 blur-2xl pointer-events-none" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.1] bg-[#12141A] text-ember-500 shadow-xl">
          <Flame className="h-10 w-10 text-ember-400" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <span className="font-mono text-xs uppercase tracking-widest text-ember-400">
          Error 404 // Out of Bounds
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Endpoint Not Forged
        </h1>
        <p className="text-sm text-forge-muted leading-relaxed">
          The requested coordinate lies beyond the PromptForge telemetry perimeter. Check your
          prompt navigation path or return to safety.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-ember-500 to-amber-500 px-4 py-2.5 text-xs font-semibold text-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Forge Home</span>
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-[#14171E] px-4 py-2.5 text-xs font-medium text-forge-text hover:text-white transition-colors"
        >
          <Compass className="h-4 w-4 text-cyan-400" />
          <span>Learner Dashboard</span>
        </Link>
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-[#14171E] px-4 py-2.5 text-xs font-medium text-forge-text hover:text-white transition-colors"
        >
          <Terminal className="h-4 w-4 text-forge-muted" />
          <span>Academy Curriculum</span>
        </Link>
      </div>
    </div>
  );
}
