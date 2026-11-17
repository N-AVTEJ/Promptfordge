import { Metadata } from "next";
import dynamic from "next/dynamic";
import DashboardLoading from "./loading";

export const metadata: Metadata = {
  title: "Dashboard | PromptForge Command Center",
  description:
    "Engineering dashboard featuring curriculum progress rings, comparison experiment history, prompt library count, and rule-based next lesson recommendations.",
};

const DashboardView = dynamic(
  () =>
    import("@/components/dashboard/dashboard-view").then(
      (m) => m.DashboardView
    ),
  { ssr: false, loading: () => <DashboardLoading /> }
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-daylight text-navy">
      <DashboardView />
    </div>
  );
}
