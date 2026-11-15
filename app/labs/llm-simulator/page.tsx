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
        <div className="h-10 w-64 rounded-lg bg-white/[0.05]" />
        <div className="h-4 w-96 rounded bg-white/[0.03]" />
        <div className="h-96 w-full max-w-5xl rounded-xl border border-white/[0.06] bg-[#0E1015]/60 mt-8" />
      </div>
    ),
  }
);

export default function LlmSimulatorPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <LlmSimulatorLab />
    </div>
  );
}
