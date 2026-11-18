import { Metadata } from "next";
import { ContextBuilderLab } from "@/components/labs/context-builder";

export const metadata: Metadata = {
  title: "Context Builder & Reflection Lab | PromptForge",
  description:
    "Master context window engineering, delimiter boundary scoping, structured schema wrappers, and self-critique reflection loops.",
};

export default function ContextBuilderPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ContextBuilderLab />
    </div>
  );
}
