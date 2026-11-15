import { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard | PromptForge Command Center",
  description:
    "Learner telemetry dashboard featuring curriculum progress rings, comparison experiment history, prompt library count, and rule-based next lesson recommendations.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardView />
    </div>
  );
}
