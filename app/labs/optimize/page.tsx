import { Metadata } from "next";
import { OptimizeLab } from "@/components/labs/optimize-lab";

export const metadata: Metadata = {
  title: "Prompt Optimizer & Tracker | PromptForge",
  description:
    "Paste a weak prompt and get evidence-backed improvements with line-by-line diffs, pedagogical rationale, and independent metric evaluations.",
};

export default function OptimizeLabPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <OptimizeLab />
    </div>
  );
}
