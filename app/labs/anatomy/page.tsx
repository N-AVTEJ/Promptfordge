import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Prompt Anatomy Visualizer | PromptForge Labs",
  description:
    "Deconstruct and analyze prompt architecture in real-time. Detect Role, Task, Context, Examples, Constraints, and Output Contracts with live Execution Engine side-by-side A/B evaluation.",
};

const PromptAnatomyLab = dynamic(
  () => import("@/components/labs/prompt-anatomy").then((m) => m.PromptAnatomyLab),
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

export default function AnatomyPage() {
  return (
    <div className="min-h-screen bg-daylight text-navy py-20 lg:py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <PromptAnatomyLab />
      </div>
    </div>
  );
}
