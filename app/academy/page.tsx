import { Metadata } from "next";
import { AcademyGrid } from "@/components/academy/academy-grid";

export const metadata: Metadata = {
  title: "Academy | PromptForge",
  description:
    "Comprehensive 10-module interactive prompt engineering curriculum with embedded video lessons and side-by-side lab studios.",
};

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-cream text-indigo">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <AcademyGrid />
      </div>
    </div>
  );
}
