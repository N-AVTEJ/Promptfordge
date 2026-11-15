import { Metadata } from "next";
import { ReasoningLab } from "@/components/labs/reasoning/reasoning-lab";

export const metadata: Metadata = {
  title: "Visual Reasoning Playground | PromptForge",
  description:
    "Explore visual prompt reasoning strategies: Tree-of-Thoughts heuristic search, ReAct Thought-Action-Observation loops, and Multi-Persona Specialist Council prompting.",
};

export default function ReasoningLabPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ReasoningLab />
    </div>
  );
}
