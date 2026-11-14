import { Metadata } from "next";
import { AcademyGrid } from "@/components/academy/academy-grid";

export const metadata: Metadata = {
  title: "Academy | PromptForge",
  description:
    "Comprehensive 10-module interactive prompt engineering curriculum with embedded video lessons and side-by-side lab studios.",
};

export default function AcademyPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AcademyGrid />
    </div>
  );
}
