import { PhaseStub } from "@/components/shell/phase-stub";

export const metadata = {
  title: "Academy | PromptForge",
  description:
    "Interactive prompt engineering curriculum with embedded YouTube lessons.",
};

export default function AcademyPage() {
  return (
    <PhaseStub
      moduleName="Academy Curriculum"
      phaseLabel="Phase 2"
      iconType="academy"
      description="Structured interactive prompt engineering curriculum organized by core principles: System Framing, Few-Shot Demonstrations, Chain-of-Thought, and Constraint Anchoring with embedded YouTube walkthroughs."
      plannedFeatures={[
        "Interactive video player synchronized with code markers",
        "Typed lesson notes and executable quick-start templates",
        "Linear and freeform learning progression paths",
        "Local progress persistence in typed storage module",
      ]}
      nextRoute={{ label: "Labs", href: "/labs" }}
    />
  );
}
