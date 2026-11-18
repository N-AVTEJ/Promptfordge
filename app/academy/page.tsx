import { Metadata } from "next";
import { AcademyGrid } from "@/components/academy/academy-grid";
import { CURRICULUM_MODULES } from "@/content/modules";

export const metadata: Metadata = {
  title: "Academy | PromptForge",
  description: `Comprehensive ${CURRICULUM_MODULES.length}-module interactive prompt engineering curriculum with embedded video lessons and side-by-side lab studios.`,
};

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-daylight text-navy">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <AcademyGrid />
      </div>
    </div>
  );
}
