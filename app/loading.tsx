import { Flame } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-ember-500/20 blur-xl animate-pulse pointer-events-none" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-navy/10 bg-white text-ultramarine shadow-sm">
          <Flame className="h-7 w-7 text-ultramarine animate-bounce" />
        </div>
      </div>
      <div className="space-y-1">
        <span className="font-mono text-xs uppercase tracking-widest text-ultramarine font-bold">
          Initializing
        </span>
        <p className="text-xs text-navy/70 font-mono">Loading PromptForge telemetry...</p>
      </div>
    </div>
  );
}
