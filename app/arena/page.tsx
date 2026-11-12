import { PhaseStub } from "@/components/shell/phase-stub";

export const metadata = {
  title: "Model Arena | PromptForge",
  description:
    "Side-by-side prompt battleground across multiple frontier models.",
};

export default function ArenaPage() {
  return (
    <PhaseStub
      moduleName="Prompt Battle Arena"
      phaseLabel="Phase 6"
      iconType="arena"
      description="Dual-pane side-by-side prompt execution arena comparing Gemini, OpenAI, and custom variants with blind voting and speed comparison."
      plannedFeatures={[
        "Side-by-side synchronized response streaming",
        "Blind evaluation mode to eliminate brand bias",
        "Token-per-second and latency comparison telemetry",
        "Educational simulation presets for offline play",
      ]}
      nextRoute={{ label: "Prompt Library", href: "/library" }}
    />
  );
}
