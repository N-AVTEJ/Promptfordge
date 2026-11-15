import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Visual Reasoning Playground | PromptForge",
  description:
    "Explore visual prompt reasoning strategies: Tree-of-Thoughts heuristic search, ReAct Thought-Action-Observation loops, and Multi-Persona Specialist Council prompting.",
};

const ReasoningLab = dynamic(
  () =>
    import("@/components/labs/reasoning/reasoning-lab").then(
      (m) => m.ReasoningLab
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-white/[0.05]" />
        <div className="h-4 w-96 rounded bg-white/[0.03]" />
        <div className="h-96 w-full max-w-4xl rounded-xl border border-white/[0.06] bg-[#0E1015]/60 mt-8" />
      </div>
    ),
  }
);

export default function ReasoningLabPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ReasoningLab />
    </div>
  );
}
