import { Metadata } from "next";
import { PromptPlayground } from "@/components/labs/playground";

export const metadata: Metadata = {
  title: "Playground | PromptForge Live Labs",
  description:
    "Interactive live prompt engineering playground with multi-model adapters, token telemetry, LRU caching, and cost estimation.",
};

export default function PlaygroundPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PromptPlayground />
    </div>
  );
}
