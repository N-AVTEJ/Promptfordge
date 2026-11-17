import Link from "next/link";
import { Flame, ArrowLeft, Terminal, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-ember-500/20 blur-2xl pointer-events-none" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-navy/10 bg-white text-ultramarine shadow-sm">
          <Flame className="h-10 w-10 text-ultramarine" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <span className="font-mono text-xs uppercase tracking-widest text-ultramarine font-bold">
          Error 404 // Out of Bounds
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Endpoint Not Forged
        </h1>
        <p className="text-sm text-navy/70 leading-relaxed">
          The requested coordinate lies beyond the PromptForge telemetry perimeter. Check your
          prompt navigation path or return to safety.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-ultramarine px-4 py-2.5 text-xs font-bold text-white transition-transform hover:scale-[1.02] shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Forge Home</span>
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-navy/10 bg-white px-4 py-2.5 text-xs font-medium text-navy hover:bg-daylight transition-colors shadow-sm"
        >
          <Compass className="h-4 w-4 text-teal" />
          <span>Learner Dashboard</span>
        </Link>
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 rounded-lg border border-navy/10 bg-white px-4 py-2.5 text-xs font-medium text-navy hover:bg-daylight transition-colors shadow-sm"
        >
          <Terminal className="h-4 w-4 text-violet" />
          <span>Academy Curriculum</span>
        </Link>
      </div>
    </div>
  );
}
