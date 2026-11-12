import { PhaseStub } from "@/components/shell/phase-stub";

export const metadata = {
  title: "Evaluation Engine | PromptForge",
  description:
    "Disaggregated multi-metric prompt benchmarking and eval runner.",
};

export default function EvaluatePage() {
  return (
    <PhaseStub
      moduleName="Prompt Evaluation Engine"
      phaseLabel="Phase 5"
      iconType="evaluate"
      description="Run prompts across test suites with disaggregated evaluation metrics (format compliance, semantic similarity, toxicity, token economy). No false single accuracy score."
      plannedFeatures={[
        "Single Evaluation Engine in /lib/engine",
        "Disaggregated metric radar and bar charts (Recharts)",
        "Assertion test suites with custom evaluation predicates",
        "Exportable benchmark test reports",
      ]}
      nextRoute={{ label: "Model Arena", href: "/arena" }}
    />
  );
}
