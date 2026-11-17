import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Playground | PromptForge Live Labs",
  description:
    "Interactive live prompt engineering playground with multi-model adapters, token telemetry, LRU caching, and cost estimation.",
};

const PromptPlayground = dynamic(
  () => import("@/components/labs/playground").then((m) => m.PromptPlayground),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-indigo/5" />
        <div className="h-4 w-96 rounded bg-indigo/5" />
        <div className="h-96 w-full max-w-6xl rounded-2xl border border-navy/10 bg-white p-8 shadow-sm mt-8" />
      </div>
    ),
  }
);

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-daylight text-navy py-20 lg:py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <PromptPlayground />
      </div>
    </div>
  );
}
