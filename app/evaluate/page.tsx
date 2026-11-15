import { Metadata } from "next";
import Link from "next/link";
import {
  FlaskConical,
  Scale,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Evaluation Engine | PromptForge",
  description:
    "Disaggregated multi-metric prompt benchmarking and evaluation engine. Analyze format compliance, latency, cost, and LLM judge rubrics with zero single-accuracy fallacies.",
};

const EVAL_DIMENSIONS = [
  {
    title: "Format Compliance",
    metric: "Binary / Key Verification",
    description:
      "Validates JSON schemas, markdown tables, and list delimiters with deterministic AST and regex parsing.",
    badge: "Deterministic",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    title: "Semantic Similarity (ROUGE-L)",
    metric: "Longest Common Subsequence",
    description:
      "Precision, recall, and F1 score against reference answers when ground truth is provided. Never conflated with correctness.",
    badge: "Lexical Overlap",
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    title: "Token & Cost Telemetry",
    metric: "Input + Output Token Spreads",
    description:
      "Tracks token inflation and cost per run across Gemini 1.5 Flash, Pro, and GPT-4o with standard deviation spreads.",
    badge: "Economic",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    title: "Multi-Axis LLM Judge",
    metric: "4 Rubric Criteria (1–5)",
    description:
      "Evaluates Relevance, Clarity, Correctness, and Constraint Following with position-bias shuffled evaluation.",
    badge: "Qualitative",
    color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
  },
];

export default function EvaluatePage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 pb-16">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#14171E] to-[#0A0C10] p-6 sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
              <Scale className="h-3.5 w-3.5" />
              <span>PromptForge Evaluation Engine</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Disaggregated Benchmark Suite
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-forge-muted">
              Never collapse complex prompt performance into a single misleading accuracy score.
              PromptForge evaluates prompt techniques across independent, statistically-rigorous
              metric dimensions.
            </p>
          </div>

          <Link
            href="/labs/compare"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-ember-500 to-amber-500 px-4 py-2.5 text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
          >
            <span>Launch Comparison Lab</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Disaggregated Dimensions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Disaggregated Evaluation Dimensions
          </h2>
          <p className="text-xs text-forge-muted">
            Independent evaluation metrics run in parallel for every prompt execution job.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EVAL_DIMENSIONS.map((dim) => (
            <div
              key={dim.title}
              className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0E1015] p-5 transition-colors hover:border-white/[0.14]"
            >
              <div>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${dim.color}`}
                >
                  {dim.badge}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-white">{dim.title}</h3>
                <p className="font-mono text-[11px] text-forge-muted mt-0.5">{dim.metric}</p>
                <p className="mt-2 text-xs leading-relaxed text-forge-muted">
                  {dim.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connected Evaluation Labs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Evaluation Laboratories</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/labs/compare"
            className="group rounded-xl border border-white/[0.08] bg-[#0E1015] p-5 transition-all hover:border-ember-500/40 hover:bg-[#12151D]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <FlaskConical className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white group-hover:text-amber-400">
              Technique Comparison Lab
            </h3>
            <p className="mt-1 text-xs text-forge-muted">
              Benchmark Zero-Shot vs Few-Shot vs CoT across multiple runs with metric spread
              histograms and position-bias mitigated rubric judging.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-amber-400">
              <span>Open Lab</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>

          <Link
            href="/labs/optimize"
            className="group rounded-xl border border-white/[0.08] bg-[#0E1015] p-5 transition-all hover:border-cyan-500/40 hover:bg-[#12151D]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white group-hover:text-cyan-400">
              Prompt Optimizer & Diff Lens
            </h3>
            <p className="mt-1 text-xs text-forge-muted">
              Diagnose prompt anti-patterns, calculate pre- and post-optimization radar metrics, and
              inspect token-level word diffs.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-cyan-400">
              <span>Open Optimizer</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>

          <Link
            href="/arena"
            className="group rounded-xl border border-white/[0.08] bg-[#0E1015] p-5 transition-all hover:border-emerald-500/40 hover:bg-[#12151D]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white group-hover:text-emerald-400">
              Adversarial Security Arena
            </h3>
            <p className="mt-1 text-xs text-forge-muted">
              Evaluate system prompt boundaries against 8 automated jailbreaks and prompt injection
              vectors with Red vs Blue automated scoring.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
              <span>Open Security Arena</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
