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
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      "Direct task instruction with zero exemplars. Requires ultra-precise intent framing and unambiguous verbs to avoid distribution drift.",
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
      "A single canonical example calibrates the output schema, stylistic tone, and conciseness ceiling with minimal token overhead.",
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
      "3 to 5 contrasting positive and negative examples anchor latent distributions, dramatically reducing edge-case hallucination.",
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
      "Declaring high-leverage personas ('Principal Cryptographic Engineer') primes specialized sub-networks and elevates reasoning rigor.",
    icon: UserCheck,
    formula: "Prior = P(Specialized Latents | Persona)",
    exampleSnippet: "You are a Rust borrow-checker auditor reviewing unwrap() calls.",
    accent: "cyan",
  },
  {
    id: "constraint-specification",
    name: "Negative & Boundary Constraints",
    badge: "Safety Gates",
    description:
      "Enforcing strict negative boundaries, output limits, and forbidden token sequences eliminates conversational filler.",
    icon: ShieldAlert,
    formula: "Constraint: ∀t ∈ Output, t ∉ ForbiddenSet",
    exampleSnippet: "Hard rule: Output raw JSON only. Zero prose. Zero markdown quotes.",
    accent: "amber",
  },
  {
    id: "structured-output",
    name: "Structured Output Contracts",
    badge: "Grammar Enforced",
    description:
      "Schema-guided generation guarantees machine-readable JSON or XML payloads that never break downstream production parsers.",
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

  // Magnetic hover physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

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
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
      whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: prefersReduced ? 0 : 0.45,
        delay: prefersReduced ? 0 : index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative flex flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-all duration-300 ${
        isAmber
          ? "border-ember-500/30 bg-forge-900/70 hover:border-ember-500/70 hover:shadow-[0_0_30px_rgba(255,107,0,0.15)]"
          : "border-cyan-500/30 bg-forge-900/70 hover:border-cyan-500/70 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]"
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isAmber
                ? "border-ember-500/40 bg-ember-500/10 text-ember-400"
                : "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <Badge
            variant="outline"
            className={`font-mono text-xs ${
              isAmber
                ? "border-ember-500/40 text-ember-400"
                : "border-cyan-500/40 text-cyan-400"
            }`}
          >
            {item.badge}
          </Badge>
        </div>

        {/* Title & Description */}
        <h3 className="mt-5 font-mono text-lg font-bold text-forge-text sm:text-xl group-hover:text-forge-50">
          {item.name}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-forge-muted sm:text-sm">
          {item.description}
        </p>

        {/* Formula Math Box */}
        <div className="mt-4 rounded-lg border border-forge-border/60 bg-forge-surface/80 px-3 py-2 font-mono text-xs text-forge-muted">
          <span className="text-[10px] uppercase text-forge-muted block mb-0.5">Formalization</span>
          <span className={isAmber ? "text-ember-400" : "text-cyan-400"}>{item.formula}</span>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="mt-5 rounded-lg border border-forge-border/40 bg-forge-950 p-3 font-mono text-[11px] text-forge-text/90">
        <span className="text-[9px] uppercase tracking-wider text-forge-muted block mb-1">Pattern In Action</span>
        <code className="text-forge-text block truncate">{item.exampleSnippet}</code>
      </div>
    </motion.div>
  );
}

export function TechniqueShowcaseSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-forge-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 font-mono text-xs font-semibold text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span>FOUNDATIONAL HEURISTICS</span>
          </div>
          <h2 className="mt-4 font-mono text-3xl font-extrabold tracking-tight text-forge-text sm:text-5xl">
            Core Prompting Techniques
          </h2>
          <p className="mt-4 text-base leading-relaxed text-forge-muted sm:text-lg">
            Master the six non-negotiable prompt architectures used by senior AI engineers
            to elicit deterministic, high-reasoning completions.
          </p>
        </div>

        {/* 6 Technique Cards Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
