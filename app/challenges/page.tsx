import { Metadata } from "next";
import { ChallengesHub } from "@/components/challenges/challenges-hub";

export const metadata: Metadata = {
  title: "Challenges & Badges | PromptForge",
  description:
    "Master prompt engineering missions with automated verification, points, and unlockable badges across all live laboratories.",
};

export default function ChallengesPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ChallengesHub />
    </div>
  );
}
