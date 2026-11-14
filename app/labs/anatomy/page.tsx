import { Metadata } from "next";
import { PromptAnatomyLab } from "@/components/labs/prompt-anatomy";

export const metadata: Metadata = {
  title: "Prompt Anatomy Visualizer | PromptForge Labs",
  description:
    "Deconstruct and analyze prompt architecture in real-time. Detect Role, Task, Context, Examples, Constraints, and Output Contracts with live Execution Engine side-by-side A/B evaluation.",
};

export default function AnatomyPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PromptAnatomyLab />
    </div>
  );
}
