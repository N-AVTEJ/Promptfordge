import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "LLM Simulator & Attention Visualizer | PromptForge Labs",
  description:
    "Interactive 6-stage transformer simulator. Explore raw text, real BPE tokenization, vector embeddings, positional encoding, multi-head attention graph, and autoregressive generation.",
};

const LlmSimulatorLab = dynamic(
  () => import("@/components/labs/llm-simulator").then((m) => m.LlmSimulatorLab),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-indigo/5" />
        <div className="h-4 w-96 rounded bg-indigo/5" />
        <div className="h-96 w-full max-w-6xl rounded-2xl border border-indigo/10 bg-white p-8 shadow-sm mt-8" />
      </div>
    ),
  }
);

export default function LlmSimulatorPage() {
  return (
    <div className="min-h-screen bg-cream text-indigo py-20 lg:py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <LlmSimulatorLab />
      </div>
    </div>
  );
}
