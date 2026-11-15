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
        <div className="h-10 w-64 rounded-lg bg-white/[0.05]" />
        <div className="h-4 w-96 rounded bg-white/[0.03]" />
        <div className="h-96 w-full max-w-5xl rounded-xl border border-white/[0.06] bg-[#0E1015]/60 mt-8" />
      </div>
    ),
  }
);

export default function AnatomyPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PromptAnatomyLab />
    </div>
  );
}
