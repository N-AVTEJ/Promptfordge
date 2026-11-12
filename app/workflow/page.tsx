import { PhaseStub } from "@/components/shell/phase-stub";

export const metadata = {
  title: "Workflow Studio | PromptForge",
  description: "Visual node-based multi-step prompt chaining studio.",
};

export default function WorkflowPage() {
  return (
    <PhaseStub
      moduleName="Prompt Workflow Studio"
      phaseLabel="Phase 4"
      iconType="workflow"
      description="Visual pipeline builder powered by React Flow for composing multi-step LLM chains, router nodes, extractors, and self-consistency voting trees."
      plannedFeatures={[
        "Interactive node graph canvas with custom forge nodes",
        "Step-by-step pipeline execution and state inspector",
        "Simulated and live execution debugging",
        "Exportable workflow JSON definitions",
      ]}
      nextRoute={{ label: "Evaluation Engine", href: "/evaluate" }}
    />
  );
}
