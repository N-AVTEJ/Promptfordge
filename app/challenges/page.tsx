import { PhaseStub } from "@/components/shell/phase-stub";

export const metadata = {
  title: "Challenges | PromptForge",
  description:
    "Prompt golf, adversarial defense, and structured output coding puzzles.",
};

export default function ChallengesPage() {
  return (
    <PhaseStub
      moduleName="Prompt Engineering Challenges"
      phaseLabel="Phase 8"
      iconType="challenges"
      description="Gamified challenges including Prompt Golf (minimal tokens for target behavior), Jailbreak Defense (system prompt hardening), and Strict JSON Schema Puzzles."
      plannedFeatures={[
        "Interactive challenge leaderboard based on local storage scores",
        "Automated grading runner against boundary test vectors",
        "Token efficiency scoreboards and hint systems",
        "Progress badges and mastery certificates",
      ]}
      nextRoute={{ label: "Academy Curriculum", href: "/academy" }}
    />
  );
}
