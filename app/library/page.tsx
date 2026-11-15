import { Metadata } from "next";
import { LibraryView } from "@/components/library/library-view";

export const metadata: Metadata = {
  title: "Production Prompt Library & Version Control | PromptForge",
  description:
    "Save, version, and track prompt blueprints. Inspect version timelines, compare line-by-line diffs between revisions, and safely restore historical versions.",
};

export default function LibraryPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <LibraryView />
    </div>
  );
}
