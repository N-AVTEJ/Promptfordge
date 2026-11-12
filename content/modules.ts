/**
 * PromptForge Curriculum — The 10 Core Modules
 * Strictly typed data in /content, never hardcoded in pages.
 */

export interface CurriculumModule {
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  lessonCount: number;
  level: "Foundational" | "Core" | "Advanced" | "Specialized";
  tags: string[];
  youtubeVideoId: string;
  accent: "amber" | "cyan";
  keyTakeaway: string;
}

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: "mod-01",
    number: 1,
    slug: "tokenomics-and-attention",
    title: "Tokenomics & Attention Mechanics",
    subtitle: "How LLMs Actually Parse Text",
    description:
      "Deconstruct BPE tokenization, token boundary traps, and self-attention matrices. See why models can't count letters without phonetic token splits.",
    duration: "45 mins",
    lessonCount: 4,
    level: "Foundational",
    tags: ["BPE", "Self-Attention", "Context Window"],
    youtubeVideoId: "bZQun8Y4L2A",
    accent: "amber",
    keyTakeaway:
      "LLMs don't read words or letters; they calculate probabilistic transitions over subword token IDs.",
  },
  {
    id: "mod-02",
    number: 2,
    slug: "prompt-anatomy-and-system-framing",
    title: "Prompt Anatomy & System Framing",
    subtitle: "Architecting the Semantic Boundary",
    description:
      "Master the 4-part architectural blueprint: Persona declaration, Execution context, Hard constraints, and Output contract.",
    duration: "50 mins",
    lessonCount: 5,
    level: "Foundational",
    tags: ["System Prompts", "Delimiters", "Constraints"],
    youtubeVideoId: "jC4v5AS4RIM",
    accent: "cyan",
    keyTakeaway:
      "Explicit structural delimiters prevent prompt injection and eliminate instruction ambiguity.",
  },
  {
    id: "mod-03",
    number: 3,
    slug: "in-context-learning-and-exemplars",
    title: "In-Context Learning & Few-Shot",
    subtitle: "Steering Latent Representations",
    description:
      "Why exemplars outperform adjectives. Discover optimal exemplar distribution, diversity clustering, and order sensitivity bias.",
    duration: "60 mins",
    lessonCount: 5,
    level: "Core",
    tags: ["Few-Shot", "Exemplar Selection", "Format Steering"],
    youtubeVideoId: "dQw4w9WgXcQ",
    accent: "amber",
    keyTakeaway:
      "3 well-chosen contrasting negative/positive exemplars anchor latent distributions better than 500 words of rules.",
  },
  {
    id: "mod-04",
    number: 4,
    slug: "chain-of-thought-and-decomposition",
    title: "Chain-of-Thought & Reasoning",
    subtitle: "Unlocking Latent Computation",
    description:
      "Allocate compute per token. Contrast standard zero-shot CoT with self-consistency voting, least-to-most decomposition, and skeleton-of-thought.",
    duration: "65 mins",
    lessonCount: 6,
    level: "Core",
    tags: ["CoT", "Self-Consistency", "Decomposition"],
    youtubeVideoId: "wVzUYep1ooU",
    accent: "cyan",
    keyTakeaway:
      "Reasoning tokens give the attention mechanism intermediate memory scratchpads to converge on correct trajectories.",
  },
  {
    id: "mod-05",
    number: 5,
    slug: "structured-outputs-and-schema-contracts",
    title: "Structured Output & Schemas",
    subtitle: "Guaranteed JSON, XML & Tool Formats",
    description:
      "From regex-constrained logits to Pydantic/Zod schemas. Build mission-critical pipelines that never fail JSON.parse in production.",
    duration: "55 mins",
    lessonCount: 4,
    level: "Core",
    tags: ["JSON Mode", "Zod", "Grammar Sampling"],
    youtubeVideoId: "9pZsnhPqE1Q",
    accent: "amber",
    keyTakeaway:
      "Schema-enforced grammar constraints eliminate parser crashes before the token is even emitted.",
  },
  {
    id: "mod-06",
    number: 6,
    slug: "directional-stimulus-and-meta-prompting",
    title: "Directional Stimulus & Meta-Prompting",
    subtitle: "Prompts That Optimize Themselves",
    description:
      "Automated prompt generation, DSPy compilation mental models, and directional hint signals for domain-specific fine-steering.",
    duration: "50 mins",
    lessonCount: 4,
    level: "Advanced",
    tags: ["Meta-Prompting", "DSPy", "Automated Refinement"],
    youtubeVideoId: "HNnP_fP_n50",
    accent: "cyan",
    keyTakeaway:
      "Let the LLM optimize its own instructions against quantitative unit test evaluations.",
  },
  {
    id: "mod-07",
    number: 7,
    slug: "rag-context-injection-and-grounding",
    title: "RAG Context & Grounding Protocols",
    subtitle: "Defeating Hallucinations at Scale",
    description:
      "Lost-in-the-middle phenomenon, chunk attribution, citation anchoring, and negative constraint enforcement for retrieved knowledge bases.",
    duration: "70 mins",
    lessonCount: 6,
    level: "Advanced",
    tags: ["RAG", "Grounding", "Citation Anchors"],
    youtubeVideoId: "T-D1KVIuvjA",
    accent: "amber",
    keyTakeaway:
      "Place critical instructions at the boundaries of the context window to counter mid-context attention fading.",
  },
  {
    id: "mod-08",
    number: 8,
    slug: "multi-agent-orchestration-and-tools",
    title: "Multi-Agent & Tool Orchestration",
    subtitle: "From Chatbots to Autonomous Systems",
    description:
      "Function-calling protocols, ReAct loops (Reasoning + Acting), state machines, agent handoffs, and verification guards.",
    duration: "75 mins",
    lessonCount: 6,
    level: "Advanced",
    tags: ["ReAct", "Tool Use", "Multi-Agent"],
    youtubeVideoId: "sal78ACtGTc",
    accent: "cyan",
    keyTakeaway:
      "Decouple planning from execution: single agents hallucinate tools, specialized swarms verify state changes.",
  },
  {
    id: "mod-09",
    number: 9,
    slug: "adversarial-attacks-and-red-teaming",
    title: "Adversarial Attacks & Red Teaming",
    subtitle: "Breaking Systems Before Attackers Do",
    description:
      "Direct prompt injection, indirect context contamination, cipher encoding, payload splitting, and roleplay bypass exploits.",
    duration: "60 mins",
    lessonCount: 5,
    level: "Specialized",
    tags: ["Red Teaming", "Prompt Injection", "Jailbreaks"],
    youtubeVideoId: "ndGsB6ODkYg",
    accent: "amber",
    keyTakeaway:
      "Untrusted user input must never share an undelimited semantic stream with privileged system instructions.",
  },
  {
    id: "mod-10",
    number: 10,
    slug: "defense-in-depth-and-evals",
    title: "Defense-in-Depth & Unit Evals",
    subtitle: "Production Hardening & CI/CD Gates",
    description:
      "Dual-LLM evaluator patterns, canary tokens, XML sandbox isolation, deterministic assertions, and CI regression suites.",
    duration: "80 mins",
    lessonCount: 6,
    level: "Specialized",
    tags: ["Canary Tokens", "Evals", "CI/CD Gates"],
    youtubeVideoId: "V_0p_i-0g5Y",
    accent: "cyan",
    keyTakeaway:
      "Never deploy a prompt to production without a versioned suite of deterministic and model-graded assertion checks.",
  },
];
