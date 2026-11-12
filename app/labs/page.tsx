import { PhaseStub } from "@/components/shell/phase-stub";

export const metadata = {
  title: "Live Labs | PromptForge",
  description: "Real-time interactive prompt engineering sandbox.",
};

export default function LabsPage() {
  return (
    <PhaseStub
      moduleName="Interactive Live Labs"
      phaseLabel="Phase 3"
      iconType="labs"
      description="Live prompt playground with token stream visualizations, system prompt configuration, variable slots, and prompt diffing."
      plannedFeatures={[
        "Unified Prompt Execution Engine (/lib/engine)",
        "Server-side adapter integration (Gemini & OpenAI)",
        "Live token usage counters and latency metrics",
        "Versioned local prompt drafts and auto-save",
      ]}
      nextRoute={{ label: "Workflow Studio", href: "/workflow" }}
    />
  );
}
