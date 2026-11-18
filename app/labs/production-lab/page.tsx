import { Metadata } from "next";
import { ProductionLab } from "@/components/labs/production-lab";

export const metadata: Metadata = {
  title: "Production & Responsible AI Lab | PromptForge",
  description:
    "Enterprise prompt regression test runner, input/output guardrail gates, cache and latency telemetry, and demographic bias probe suite.",
};

export default function ProductionLabPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductionLab />
    </div>
  );
}
