"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Zap,
  Target,
  Copy,
  UserCheck,
  ShieldAlert,
  Code2,
} from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

interface TechniqueItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  formula: string;
  exampleSnippet: string;
  accent: "amber" | "cyan";
}

const TECHNIQUES: TechniqueItem[] = [
  {
    id: "zero-shot",
    name: "Zero-Shot Direct Execution",
    badge: "Baseline",
    description:
      "Direct task instruction without exemplars. Requires unambiguous imperative verbs and explicit constraints to avoid distribution drift.",
    icon: Zap,
    formula: "Output = P(Task | Instruction)",
    exampleSnippet: "Classify triage severity of kernel trace. Return [P0, P1, P2].",
    accent: "amber",
  },
  {
    id: "one-shot",
    name: "One-Shot Calibration",
    badge: "Format Anchor",
    description:
      "A single canonical example calibrates the output schema, stylistic tone, and brevity ceiling with minimal token overhead.",
    icon: Target,
    formula: "Output = P(Task | Exemplar_1, Instruction)",
    exampleSnippet: "Input: 'Out of memory at 0x4f'. Output: {err: 'OOM', fatal: true}",
    accent: "cyan",
  },
  {
    id: "few-shot",
    name: "Few-Shot In-Context Steering",
    badge: "High Precision",
    description:
      "3 to 5 contrasting positive and negative examples anchor latent distributions, eliminating edge-case formatting failures.",
    icon: Copy,
    formula: "Output = P(Task | {E_1, E_2, E_3}, Instruction)",
    exampleSnippet: "Provide boundary condition exemplars (null, max_int, malformed).",
    accent: "amber",
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
    accent: "cyan",
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
    accent: "amber",
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
    accent: "cyan",
  },
];

function TechniqueCard({
  item,
  index,
  prefersReduced,
}: {
  item: TechniqueItem;
  index: number;
  prefersReduced: boolean;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Restrained subtle magnetic hover physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 220 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    const xFromCenter = (e.clientX - rect.left) / width - 0.5;
    const yFromCenter = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(xFromCenter);
    mouseY.set(yFromCenter);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const Icon = item.icon;
  const isAmber = item.accent === "amber";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        prefersReduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }
      }
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: prefersReduced ? 0 : 0.35,
        delay: prefersReduced ? 0 : index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#13161C] to-[#0A0C0F] p-6 transition-colors duration-200 hover:border-white/[0.18]"
    >
      {/* Top Hairline Accent on Card */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none group-hover:via-white/[0.18]" />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
              isAmber
                ? "border-ember-500/30 bg-ember-500/[0.07] text-ember-400"
                : "border-cyan-500/30 bg-cyan-500/[0.07] text-cyan-400"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="rounded border border-white/[0.08] bg-[#0E1014] px-2 py-0.5 font-mono text-[10px] text-forge-muted">
            {item.badge}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="mt-4 font-mono text-base font-semibold text-forge-text group-hover:text-white">
          {item.name}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-forge-muted">
          {item.description}
        </p>

        {/* Formula Math Box */}
        <div className="mt-4 rounded-md border border-white/[0.06] bg-[#08090C] px-3 py-2 font-mono text-xs">
          <span className="text-[10px] uppercase text-forge-muted block mb-0.5 tracking-wider">Formalization</span>
          <span className={isAmber ? "text-ember-400" : "text-cyan-400"}>{item.formula}</span>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="mt-4 rounded-md border border-white/[0.05] bg-[#08090C] p-2.5 font-mono text-[11px] text-forge-muted">
        <span className="text-[9px] uppercase tracking-wider text-forge-subtle block mb-1">Pattern In Action</span>
        <code className="text-forge-text block truncate">{item.exampleSnippet}</code>
      </div>
    </motion.div>
  );
}

export function TechniqueShowcaseSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-forge-950 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#101216] px-3 py-1 font-mono text-[11px] font-medium text-cyan-400">
            <span>Foundational Heuristics</span>
          </div>
          <h2 className="mt-4 font-mono text-2xl font-bold tracking-tight text-forge-text sm:text-4xl">
            Core Prompting Architectures
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-forge-muted sm:text-base">
            Six foundational patterns to elicit deterministic, high-reasoning completions
            without brittle ad-hoc guessing.
          </p>
        </div>

        {/* 6 Technique Cards Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TECHNIQUES.map((tech, index) => (
            <TechniqueCard
              key={tech.id}
              item={tech}
              index={index}
              prefersReduced={prefersReduced}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
