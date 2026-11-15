import { CompareLab } from "@/components/labs/compare-lab";

export const metadata = {
  title: "Technique Comparison Lab | PromptForge",
  description:
    "Empirical multi-technique benchmarking with independent metrics and statistical spread across N runs.",
};

export default function CompareLabPage() {
  return (
    <div className="min-h-screen bg-forge-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <CompareLab />
      </div>
    </div>
  );
}
