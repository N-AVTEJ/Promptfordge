"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Target,
  Copy,
  UserCheck,
  ShieldAlert,
  Code2,
  Sparkles,
} from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { CurvedDivider } from "@/components/ui/curved-divider";

interface TechniqueItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  formula: string;
  exampleSnippet: string;
  accent: "coral" | "violet" | "teal";
}

const TECHNIQUES: TechniqueItem[] = [
  {
    id: "zero-shot",
    name: "Zero-Shot Direct Execution",
    badge: "Baseline",
    description:
      "Direct imperative instruction without exemplars. Requires unambiguous verbs and boundary rules to prevent output distribution drift.",
    icon: Zap,
    formula: "Output = P(Task | Instruction)",
    exampleSnippet: "Classify triage severity of kernel trace. Return [P0, P1, P2].",
    accent: "coral",
  },
  {
    id: "one-shot",
    name: "One-Shot Calibration",
    badge: "Format Anchor",
    description:
      "A single canonical example calibrates the output schema, stylistic tone, and brevity ceiling with minimal token overhead.",
    icon: Target,
    formula: "Output = P(Task | Exemplar_1, Instruction)",
    exampleSnippet: "Input: 'OOM at 0x4f'. Output: {err: 'OOM', fatal: true}",
    accent: "teal",
  },
  {
    id: "few-shot",
    name: "Few-Shot In-Context Steering",
    badge: "High Precision",
    description:
      "3 to 5 contrasting positive and negative examples anchor latent distributions, eliminating formatting edge cases.",
    icon: Copy,
    formula: "Output = P(Task | {E_1, E_2, E_3}, Instruction)",
    exampleSnippet: "Provide boundary condition exemplars (null, max_int, malformed).",
    accent: "violet",
  },
  {
    id: "role-framing",
    name: "Role & Epistemic Framing",
    badge: "Prior Activation",
    description:
      "Declaring specialized personas primes targeted sub-networks and elevates reasoning rigor for specialized domains.",
    icon: UserCheck,
    formula: "Prior = P(Specialized Latents | Persona)",
    exampleSnippet: "You are a Rust borrow-checker auditor reviewing unsafe blocks.",
    accent: "coral",
  },
  {
    id: "constraint-specification",
    name: "Negative & Boundary Constraints",
    badge: "Boundary Gate",
    description:
      "Enforcing strict negative boundaries, output limits, and forbidden token sequences eliminates conversational filler.",
    icon: ShieldAlert,
    formula: "Constraint: ∀t ∈ Output, t ∉ ForbiddenSet",
    exampleSnippet: "Hard rule: Output raw JSON only. Zero prose. Zero markdown fences.",
    accent: "teal",
  },
  {
    id: "structured-output",
    name: "Structured Output Contracts",
    badge: "Grammar Enforced",
    description:
      "Schema-guided generation guarantees machine-readable JSON payloads that never break downstream production parsers.",
    icon: Code2,
    formula: "Output ∈ ValidGrammar(JSON_Schema)",
    exampleSnippet: "type Response = z.infer<typeof ProductionTriageSchema>;",
    accent: "violet",
  },
];

export function TechniqueShowcaseSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-mint pt-0 pb-0">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-xs font-bold text-teal shadow-card">
            <Sparkles className="h-4 w-4" />
            <span>Core Engineering Arsenal</span>
          </div>
          <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-indigo sm:text-5xl">
            Six Foundational Prompting Techniques
          </h2>
          <p className="mt-4 max-w-[65ch] mx-auto text-base sm:text-lg leading-[1.7] text-indigo-900/75">
            Every production system relies on a predictable blend of these core modalities.
            Master their mathematical mechanisms inside interactive laboratories.
          </p>
        </div>

        {/* 6 Technique Cards (Max 3 per row: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TECHNIQUES.map((item, index) => {
            const Icon = item.icon;

            const accentBadgeClass =
              item.accent === "coral"
                ? "border-coral/30 bg-coral/10 text-coral"
                : item.accent === "violet"
                ? "border-violet/30 bg-violet/10 text-violet"
                : "border-teal/30 bg-teal/10 text-teal";

            const accentIconBg =
              item.accent === "coral"
                ? "bg-coral/10 text-coral border-coral/30"
                : item.accent === "violet"
                ? "bg-violet/10 text-violet border-violet/30"
                : "bg-teal/10 text-teal border-teal/30";

            return (
              <motion.div
                key={item.id}
                initial={
                  prefersReduced
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 24 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={
                  prefersReduced
                    ? { duration: 0 }
                    : {
                        duration: 0.5,
                        delay: index * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }
                }
                className="hover-lift flex flex-col justify-between rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card transition-all hover:shadow-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accentIconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${accentBadgeClass}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 font-sans text-xl font-bold text-indigo">
                    {item.name}
                  </h3>

                  <p className="mt-3 text-sm leading-[1.7] text-indigo-900/75">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 space-y-3 pt-4 border-t border-indigo-950/10">
                  <div className="rounded-lg bg-cream/70 p-3 font-mono text-xs text-indigo-900/80 border border-indigo-950/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 block mb-1">
                      Formal Mechanism
                    </span>
                    <code>{item.formula}</code>
                  </div>

                  <div className="rounded-lg bg-white p-3 font-mono text-[11px] text-indigo border border-indigo-950/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 block mb-0.5">
                      Prompt Pattern
                    </span>
                    <span className="line-clamp-2">{item.exampleSnippet}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Curved Divider into Butter Band */}
      <CurvedDivider fillColor="text-butter" />
    </section>
  );
}
