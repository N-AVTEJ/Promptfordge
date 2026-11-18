import { Metadata } from "next";
import { MultiModelArenaLab } from "@/components/labs/multimodal-arena";

export const metadata: Metadata = {
  title: "Multi-Model & Multimodal Arena | PromptForge",
  description:
    "Evaluate identical prompt instructions and optional image inputs side-by-side on Gemini and OpenAI under identical operational parameters.",
};

export default function MultiModelArenaPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <MultiModelArenaLab />
    </div>
  );
}
