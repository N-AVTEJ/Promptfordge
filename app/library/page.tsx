import { PhaseStub } from "@/components/shell/phase-stub";

export const metadata = {
  title: "Prompt Library | PromptForge",
  description:
    "Curated repository of production-grade prompt patterns and templates.",
};

export default function LibraryPage() {
  return (
    <PhaseStub
      moduleName="Production Prompt Library"
      phaseLabel="Phase 7"
      iconType="library"
      description="Battle-tested production prompt patterns covering structured JSON output, few-shot classification, agentic tool-use, and role anchoring."
      plannedFeatures={[
        "Faceted search by technique, use-case, and model compatibility",
        "Copy-ready system prompt blueprints and variable injectors",
        "Save and bookmark prompts to local storage",
        "Community template import/export",
      ]}
      nextRoute={{ label: "Challenges", href: "/challenges" }}
    />
  );
}
