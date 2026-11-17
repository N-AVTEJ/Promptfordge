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
    color: "text-teal border-teal/30 bg-teal/10",
  },
  {
    title: "Semantic Similarity (ROUGE-L)",
    metric: "Longest Common Subsequence",
    description:
      "Precision, recall, and F1 score against reference answers when ground truth is provided. Never conflated with correctness.",
    badge: "Lexical Overlap",
    color: "text-violet border-violet/30 bg-violet/10",
  },
  {
    title: "Token & Cost Telemetry",
    metric: "Input + Output Token Spreads",
    description:
      "Tracks token inflation and cost per run across Gemini 1.5 Flash, Pro, and GPT-4o with standard deviation spreads.",
    badge: "Economic",
    color: "text-ultramarine border-ultramarine/30 bg-ultramarine/10",
  },
  {
    title: "Multi-Axis LLM Judge",
    metric: "4 Rubric Criteria (1–5)",
    description:
      "Evaluates Relevance, Clarity, Correctness, and Constraint Following with position-bias shuffled evaluation.",
    badge: "Qualitative",
    color: "text-navy border-navy/10 bg-daylight",
  },
];

export default function EvaluatePage() {
  return (
    <div className="min-h-screen bg-daylight text-navy">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-16">
        {/* Banner */}
        <div className="rounded-3xl border border-navy/10 bg-white p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1 text-xs font-bold text-teal">
                <Scale className="h-4 w-4" />
                <span>PromptForge Evaluation Engine</span>
              </div>
              <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-navy">
                Disaggregated Benchmark Suite
              </h1>
              <p className="max-w-[65ch] text-base leading-[1.7] text-navy/70">
                Never collapse complex prompt performance into a single misleading accuracy score.
                PromptForge evaluates prompt techniques across independent, statistically-rigorous
                metric dimensions.
              </p>
            </div>

            <Link
              href="/labs/compare"
              className="inline-flex items-center gap-2 rounded-xl bg-ultramarine px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-ultramarine-600 transition-all shrink-0"
            >
              <span>Launch Comparison Lab</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Disaggregated Dimensions (Max 3 cards per row) */}
        <section className="space-y-6">
          <div>
            <h2 className="font-sans text-2xl font-bold text-navy">
              Disaggregated Evaluation Dimensions
            </h2>
            <p className="mt-1 max-w-[65ch] text-sm text-navy/70">
              Independent evaluation metrics run in parallel for every prompt execution job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EVAL_DIMENSIONS.map((dim) => (
              <div
                key={dim.title}
                className="hover-lift flex flex-col justify-between rounded-2xl border border-navy/10 bg-white p-8 shadow-sm"
              >
                <div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold font-mono border ${dim.color}`}
                  >
                    {dim.badge}
                  </span>
                  <h3 className="mt-5 font-sans text-lg font-bold text-navy">{dim.title}</h3>
                  <p className="font-mono text-xs text-teal font-medium mt-1">{dim.metric}</p>
                  <p className="mt-3 text-sm leading-[1.7] text-navy/70">
                    {dim.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Connected Evaluation Labs (Max 3 cards per row) */}
        <section className="space-y-6">
          <h2 className="font-sans text-2xl font-bold text-navy">Evaluation Laboratories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href="/labs/compare"
              className="hover-lift group rounded-2xl border border-navy/10 bg-white p-8 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-ultramarine/30 bg-ultramarine/10 text-ultramarine">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-sans text-lg font-bold text-navy group-hover:text-ultramarine transition-colors">
                Technique Comparison Lab
              </h3>
              <p className="mt-2 text-sm leading-[1.7] text-navy/70">
                Benchmark Zero-Shot vs Few-Shot vs CoT across multiple runs with metric spread
                histograms and position-bias mitigated rubric judging.
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-ultramarine">
                <span>Open Lab</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            <Link
              href="/labs/optimize"
              className="hover-lift group rounded-2xl border border-navy/10 bg-white p-8 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet/30 bg-violet/10 text-violet">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-sans text-lg font-bold text-navy group-hover:text-violet transition-colors">
                Prompt Optimizer & Diff Lens
              </h3>
              <p className="mt-2 text-sm leading-[1.7] text-navy/70">
                Diagnose prompt anti-patterns, calculate pre- and post-optimization radar metrics, and
                inspect token-level word diffs.
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-violet">
                <span>Open Optimizer</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            <Link
              href="/arena"
              className="hover-lift group rounded-2xl border border-navy/10 bg-white p-8 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal/30 bg-teal/10 text-teal">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-sans text-lg font-bold text-navy group-hover:text-teal transition-colors">
                Adversarial Security Arena
              </h3>
              <p className="mt-2 text-sm leading-[1.7] text-navy/70">
                Evaluate system prompt boundaries against 8 automated jailbreaks and prompt injection
                vectors with Red vs Blue automated scoring.
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-teal">
                <span>Open Security Arena</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
