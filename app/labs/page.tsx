import { Metadata } from "next";
import { LabsHub } from "@/components/labs/labs-hub";

export const metadata: Metadata = {
  title: "Visual Labs & Interactive Simulators | PromptForge",
  description:
    "Interactive prompt engineering visual laboratories: Prompt Anatomy Inspector, 6-Stage LLM Transformer Simulator, and Multi-Model Execution Playground.",
};

export default function LabsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <LabsHub />
    </div>
  );
}
