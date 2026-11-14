import { Metadata } from "next";
import { LlmSimulatorLab } from "@/components/labs/llm-simulator";

export const metadata: Metadata = {
  title: "LLM Simulator & Attention Visualizer | PromptForge Labs",
  description:
    "Interactive 6-stage transformer simulator. Explore raw text, real BPE tokenization, vector embeddings, positional encoding, multi-head attention graph, and autoregressive generation.",
};

export default function LlmSimulatorPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <LlmSimulatorLab />
    </div>
  );
}
