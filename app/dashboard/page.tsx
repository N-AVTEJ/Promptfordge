import { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard | PromptForge Command Center",
  description:
    "Engineering dashboard featuring curriculum progress rings, comparison experiment history, prompt library count, and rule-based next lesson recommendations.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-daylight text-navy">
      <DashboardView />
    </div>
  );
}
