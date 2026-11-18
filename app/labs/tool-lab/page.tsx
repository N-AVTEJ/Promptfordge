import { Metadata } from "next";
import { ToolLab } from "@/components/labs/tool-lab";

export const metadata: Metadata = {
  title: "Tool-Augmented & RAG Lab | PromptForge",
  description:
    "Function-calling sandbox with mock tools (calculator, lookup, weather) and an in-memory RAG demo retrieving from 10 sample documents with chunk inspection.",
};

export default function ToolLabPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ToolLab />
    </div>
  );
}
