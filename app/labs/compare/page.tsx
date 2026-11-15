import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Technique Comparison Lab | PromptForge",
  description:
    "Empirical multi-technique benchmarking with independent metrics and statistical spread across N runs.",
};

const CompareLab = dynamic(
  () => import("@/components/labs/compare-lab").then((m) => m.CompareLab),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-white/[0.05]" />
        <div className="h-4 w-96 rounded bg-white/[0.03]" />
        <div className="h-96 w-full max-w-4xl rounded-xl border border-white/[0.06] bg-[#0E1015]/60 mt-8" />
      </div>
    ),
  }
);

export default function CompareLabPage() {
  return (
    <div className="min-h-screen bg-forge-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <CompareLab />
      </div>
    </div>
  );
}
