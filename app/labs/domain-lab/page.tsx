import { Metadata } from "next";
import { DomainPromptLab } from "@/components/labs/domain-lab";

export const metadata: Metadata = {
  title: "Domain-Specific Prompt Lab | PromptForge",
  description:
    "Explore four domain-tuned prompting tracks: software engineering, education, business automation, and scientific research.",
};

export default function DomainLabPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DomainPromptLab />
    </div>
  );
}
