import * as fs from "node:fs";
import * as path from "node:path";
import type { VideoSource, CheckYourself } from "./modules-data/types";

export interface LessonEnrichment {
  beforeYouWatch: [string, string];
  checkYourself: CheckYourself;
  videos: VideoSource[];
  youtubeId: string;
  status: "ok" | "slot" | "unavailable";
}

export const LESSON_ENRICHMENT: Record<string, LessonEnrichment> = {
  // -------------------------------------------------------------
  // MODULE 1: Introduction to Prompt Engineering
  // -------------------------------------------------------------
  "mod-01-les-01": {
    beforeYouWatch: [
      "You will see how computers shifted from rigid human-written rules to learning patterns from large libraries of text.",
      "Notice how modern language models can solve new tasks simply by reading clear instructions."
    ],
    checkYourself: {
      question: "What is the core difference between older rule-based software and modern language models?",
      answer: "Traditional software requires humans to manually program every rule, while language models learn statistical language patterns and adapt to instructions in plain text.",
      hint: "Think about who defines the rules: a software engineer hand-coding them, or a model learning from text."
    },
    videos: [
      {
        id: "LPZh9BOjkQs",
        title: "Large Language Models explained briefly",
        channel: "3Blue1Brown",
        minutes: 8,
        covers: ["Evolution of AI and LLMs", "Fundamentals of LLMs"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "ZHCB09O6zUk",
        title: "A Brief History of AI: From Machine Learning to Gen AI to Agentic AI",
        channel: "IBM Technology",
        minutes: 13,
        covers: ["Evolution of AI and LLMs", "History of AI"],
        level: "beginner",
        status: "ok",
        resolvedBy: "agent-search",
      },
    ],
    youtubeId: "LPZh9BOjkQs",
    status: "ok",
  },
  "mod-01-les-02": {
    beforeYouWatch: [
      "This video breaks down how language models process words and predict what should come next in a conversation.",
      "Watch for how context changes the probability of words that the model chooses."
    ],
    checkYourself: {
      question: "Why does the context you provide drastically change the quality of an AI's response?",
      answer: "The model predicts future words entirely based on the input text you give it; clearer context narrows the mathematical probabilities toward accurate answers.",
      hint: "The model has no hidden intentions—it calculates what follows your specific words."
    },
    videos: [
      {
        id: "LPZh9BOjkQs",
        title: "Large Language Models explained briefly",
        channel: "3Blue1Brown",
        minutes: 8,
        covers: ["Fundamentals of LLMs"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "wjZofJX0v4M",
        title: "Transformers, the tech behind LLMs | Deep Learning Chapter 5",
        channel: "3Blue1Brown",
        minutes: 27,
        covers: ["Fundamentals of LLMs", "Transformer architecture"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "LPZh9BOjkQs",
    status: "ok",
  },
  "mod-01-les-03": {
    beforeYouWatch: [
      "Here you will discover the transformer, the fundamental blueprint that powers modern conversational artificial intelligence.",
      "Notice how the model looks at every word in a sentence simultaneously instead of reading slowly word-by-word."
    ],
    checkYourself: {
      question: "What makes the transformer faster and smarter than earlier language models?",
      answer: "It processes entire sentences at once using attention mechanisms rather than reading one word at a time sequentially.",
      hint: "Think about reading a whole phrase at a glance versus sounding out each letter individually."
    },
    videos: [
      {
        id: "wjZofJX0v4M",
        title: "Transformers, the tech behind LLMs | Deep Learning Chapter 5",
        channel: "3Blue1Brown",
        minutes: 27,
        covers: ["Transformer architecture"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "eMlx5fFNoYc",
        title: "Attention in transformers, step-by-step | Deep Learning Chapter 6",
        channel: "3Blue1Brown",
        minutes: 26,
        covers: ["Transformer architecture", "Attention mechanism"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "wjZofJX0v4M",
    status: "ok",
  },
  "mod-01-les-04": {
    beforeYouWatch: [
      "Explore how raw words turn into number tokens, how models train on data, and how they generate text during inference.",
      "Pay attention to why models sometimes stumble on simple spelling or character counting tasks."
    ],
    checkYourself: {
      question: "Why do AI models think in word chunks called tokens instead of individual letters?",
      answer: "Tokens allow the model to process vocabulary efficiently as numerical IDs, though it means the model does not natively see individual letters.",
      hint: "A token is usually 3 to 4 characters or a common word chunk."
    },
    videos: [
      {
        id: "eMlx5fFNoYc",
        title: "Attention in transformers, step-by-step | Deep Learning Chapter 6",
        channel: "3Blue1Brown",
        minutes: 26,
        covers: ["Working of LLMs (tokens, training, inference)"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "7xTGNNLPyMI",
        title: "Deep Dive into LLMs like ChatGPT",
        channel: "Andrej Karpathy",
        minutes: 211,
        covers: ["Tokens, training, inference", "Working of LLMs"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "eMlx5fFNoYc",
    status: "ok",
  },
  "mod-01-les-05": {
    beforeYouWatch: [
      "This practical lesson explains how to write your first clean, predictable prompt for any language model.",
      "Look for how giving clear instructions and expected output formats prevents confusing replies."
    ],
    checkYourself: {
      question: "What is the single most effective way to eliminate vague answers from an AI?",
      answer: "Provide explicit constraints on length, tone, and format, alongside the core instruction.",
      hint: "Tell the model what good output looks like before it starts writing."
    },
    videos: [
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["Basics of prompts", "Foundational prompting"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "7xTGNNLPyMI",
        title: "Deep Dive into LLMs like ChatGPT",
        channel: "Andrej Karpathy",
        minutes: 211,
        covers: ["Basics of prompts"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "uDIW34h8cmM",
    status: "ok",
  },
  "mod-01-les-06": {
    beforeYouWatch: [
      "Learn the core anatomy of professional prompts: task, context, reference examples, and output constraints.",
      "See how organizing your instructions into distinct sections keeps the model focused on your goal."
    ],
    checkYourself: {
      question: "What four core elements should every reliable production prompt include?",
      answer: "A clear role/task, background context, reference data or examples, and precise output constraints.",
      hint: "Remember the blueprint: who, what, with what background, and formatted how."
    },
    videos: [
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["Basic prompt structures", "Prompt architecture"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "uDIW34h8cmM",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 2: Example and Instruction Based Prompts
  // -------------------------------------------------------------
  "mod-02-les-01": {
    beforeYouWatch: [
      "Observe zero-shot prompting: asking an AI to perform a task with zero prior demonstrations or examples.",
      "Notice how clear context and direct imperative verbs yield accurate first-attempt answers."
    ],
    checkYourself: {
      question: "When is zero-shot prompting sufficient without providing examples?",
      answer: "When the task is straightforward, well-documented in the model's pretraining data, and does not require a custom format.",
      hint: "Common tasks like translating a word or summarizing a news article rarely need examples."
    },
    videos: [
      {
        id: "Vl4hH_L5-3Q",
        title: "Zero-shot, One-shot and Few-shot Prompting Techniques Explained",
        channel: "At A Glance!",
        minutes: 9,
        covers: ["Zero-shot"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "T-w_5T-j-dA",
        title: "Large Language Models Are Zero Shot Reasoners",
        channel: "IBM Technology",
        minutes: 8,
        covers: ["Zero-shot", "Chain of Thought"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["Zero-shot", "One-shot", "Few-shot", "Role based"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
    ],
    youtubeId: "Vl4hH_L5-3Q",
    status: "ok",
  },
  "mod-02-les-02": {
    beforeYouWatch: [
      "See how giving just one good demonstration (one-shot) teaches the model your desired format and tone.",
      "Pay attention to how a single example anchors the style of the answer."
    ],
    checkYourself: {
      question: "What immediate advantage does one-shot prompting offer over zero-shot?",
      answer: "It illustrates the exact expected formatting, tone, and schema without relying solely on descriptive text.",
      hint: "Showing is often clearer than telling."
    },
    videos: [
      {
        id: "Vl4hH_L5-3Q",
        title: "Zero-shot, One-shot and Few-shot Prompting Techniques Explained",
        channel: "At A Glance!",
        minutes: 9,
        covers: ["One-shot", "Few-shot"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["Zero-shot", "One-shot", "Few-shot", "Role based"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
    ],
    youtubeId: "Vl4hH_L5-3Q",
    status: "ok",
  },
  "mod-02-les-03": {
    beforeYouWatch: [
      "Learn few-shot prompting, the technique of providing 2 to 5 diverse examples to guide complex classification or formatting.",
      "Watch how consistent example patterns eliminate ambiguity."
    ],
    checkYourself: {
      question: "Why should your few-shot examples represent varied edge cases rather than identical samples?",
      answer: "Varied examples teach the model how to handle nuances, edge cases, and exceptions instead of overfitting to one narrow pattern.",
      hint: "If all examples look identical, the model will struggle when a slightly different input arrives."
    },
    videos: [
      {
        id: "Vl4hH_L5-3Q",
        title: "Zero-shot, One-shot and Few-shot Prompting Techniques Explained",
        channel: "At A Glance!",
        minutes: 9,
        covers: ["Few-shot"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["Zero-shot", "One-shot", "Few-shot", "Role based"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
      {
        id: "b2t4pa9lOIc",
        title: "Prompt Engineering Explained – Zero, Few, CoT, Self Consistency, Persona",
        channel: "Loop Kaka",
        minutes: 15,
        covers: ["Few-shot"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
    ],
    youtubeId: "Vl4hH_L5-3Q",
    status: "ok",
  },
  "mod-02-les-04": {
    beforeYouWatch: [
      "Understand Chain-of-Thought prompting, encouraging the AI to work out its reasoning step-by-step before answering.",
      "See why letting the model 'think out loud' dramatically improves math and logic accuracy."
    ],
    checkYourself: {
      question: "Why does asking a model to 'think step by step' reduce logical mistakes?",
      answer: "It creates reasoning tokens in its output context, allowing subsequent prediction steps to build directly on earlier verified deductions.",
      hint: "Just like humans, jumping straight to a final answer causes careless mental slips."
    },
    videos: [
      {
        id: "b210W3JWOxw",
        title: "ChatGPT Chain-of-Thought Prompt Explained - LLM Chain of Thoughts for Beginners",
        channel: "1littlecoder",
        minutes: 10,
        covers: ["Chain of Thought"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "T-w_5T-j-dA",
        title: "Large Language Models Are Zero Shot Reasoners",
        channel: "IBM Technology",
        minutes: 8,
        covers: ["Zero-shot", "Chain of Thought"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "b2t4pa9lOIc",
        title: "Prompt Engineering Explained – Zero, Few, CoT, Self Consistency, Persona",
        channel: "Loop Kaka",
        minutes: 15,
        covers: ["Chain of Thought"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
    ],
    youtubeId: "b210W3JWOxw",
    status: "ok",
  },
  "mod-02-les-05": {
    beforeYouWatch: [
      "Master direct instruction-based prompting: writing commands with clear verbs, strict priorities, and explicit negative rules.",
      "Observe how ambiguous verbs cause unexpected hallucinations or filler text."
    ],
    checkYourself: {
      question: "What is an imperative verb and why is it preferred in prompt instructions?",
      answer: "An imperative verb directly states an action (e.g. 'Extract', 'Summarize', 'Validate') leaving zero ambiguity about the expected deliverable.",
      hint: "Compare 'Can you maybe look at this?' with 'Extract three bullet points from this text:'"
    },
    videos: [
      {
        id: "T-w_5T-j-dA",
        title: "Large Language Models Are Zero Shot Reasoners",
        channel: "IBM Technology",
        minutes: 8,
        covers: ["Zero-shot", "Chain of Thought"],
        relatedTo: ["Instruction based"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
    ],
    youtubeId: "T-w_5T-j-dA",
    status: "ok",
  },
  "mod-02-les-06": {
    beforeYouWatch: [
      "Learn role-based prompting, where you assign an expert background to prime the model's vocabulary and assumptions.",
      "See how adopting an auditor or teacher persona tailors depth and terminology."
    ],
    checkYourself: {
      question: "How does assigning a role change how the language model calculates its response?",
      answer: "It shifts the probability distribution toward technical vocabulary, domain expertise, and standard practices associated with that persona.",
      hint: "A pediatric doctor and a financial analyst talk about health insurance very differently."
    },
    videos: [
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["Zero-shot", "One-shot", "Few-shot", "Role based"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
      {
        id: "cnww-CvDoRk",
        title: "Advanced Prompt Engineering Techniques",
        channel: "Sai Ram Penjarla",
        minutes: 12,
        covers: ["Role based", "Few-shot"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
    ],
    youtubeId: "cnww-CvDoRk",
    status: "ok",
  },
  "mod-02-les-07": {
    beforeYouWatch: [
      "Explore constraint-based prompting: defining what the model must NOT do, maximum lengths, and strict output boundaries.",
      "Notice how negative constraints safeguard against verbose or conversational responses."
    ],
    checkYourself: {
      question: "Why should negative constraints be paired with an alternative action?",
      answer: "Models follow positive instructions more reliably than pure negatives; telling the model what to do instead prevents confusion.",
      hint: "Instead of just 'Don't write essays', add 'Provide exactly three bullet points.'"
    },
    videos: [
      {
        id: "ugxPshXr7Ro",
        title: "Constrained Generation for Better LLM Prompting Results",
        channel: "Matthew Esposito | AI",
        minutes: 5,
        covers: ["Constraint based"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "ugxPshXr7Ro",
    status: "ok",
  },
  "mod-02-les-08": {
    beforeYouWatch: [
      "Understand persona-driven prompting: crafting consistent voice, tone, and empathy levels for user-facing assistants.",
      "Watch how persona attributes keep customer support interactions calm and helpful."
    ],
    checkYourself: {
      question: "What is the key difference between an expert role and a communication persona?",
      answer: "An expert role specifies technical knowledge and skills, while a persona defines tone, temperament, and communication style.",
      hint: "One defines what the AI knows; the other defines how the AI speaks."
    },
    videos: [
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["Persona prompting"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "b2t4pa9lOIc",
        title: "Prompt Engineering Explained – Zero, Few, CoT, Self Consistency, Persona",
        channel: "Loop Kaka",
        minutes: 15,
        covers: ["Persona"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "uDIW34h8cmM",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 3: Context Based and Interaction Based Prompts
  // -------------------------------------------------------------
  "mod-03-les-01": {
    beforeYouWatch: [
      "See how background context acts as working memory for the AI during a conversation.",
      "Notice how relevant reference documents prevent the model from guessing or inventing facts."
    ],
    checkYourself: {
      question: "Where should background context be placed relative to the main task in a prompt?",
      answer: "Placing context above or clearly separated from the final instruction ensures the model reads the data before executing the request.",
      hint: "Give the model the facts first, then tell it what to do with them."
    },
    videos: [
      {
        id: "cnww-CvDoRk",
        title: "Advanced Prompt Engineering Techniques",
        channel: "Sai Ram Penjarla",
        minutes: 12,
        covers: ["Reflection-based"],
        relatedTo: ["Contextual", "Structured prompts"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
    ],
    youtubeId: "cnww-CvDoRk",
    status: "ok",
  },
  "mod-03-les-02": {
    beforeYouWatch: [
      "Learn how to use delimiters like XML tags or triple quotes to separate instructions from raw user data.",
      "Observe how clear boundaries stop malicious or accidental prompt injections from altering your instructions."
    ],
    checkYourself: {
      question: 'Why do AI developers wrap user inputs in tags like `<document>` or `"""`?',
      answer: "Delimiters visually and syntactically isolate external text, preventing the model from confusing user data with system instructions.",
      hint: "It acts like a protective fence around untrusted text."
    },
    videos: [
      {
        id: "zrp3Lr5eeFc",
        title: "XML Tags, Delimiters & Complex Prompt Structure",
        channel: "Fortivance Academy",
        minutes: 8,
        covers: ["Delimiter based", "Structured prompts"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "zrp3Lr5eeFc",
    status: "ok",
  },
  "mod-03-les-03": {
    beforeYouWatch: [
      "Discover structured prompts: organizing system messages, user tasks, and examples using consistent headings.",
      "See how repeatable templates make prompt outputs reliable across thousands of requests."
    ],
    checkYourself: {
      question: "How does a structured prompt template help software applications that consume AI output?",
      answer: "Consistent sections produce predictable, parseable responses that code can easily ingest without formatting errors.",
      hint: "Code needs predictable structures, not random narrative variations."
    },
    videos: [
      {
        id: "zrp3Lr5eeFc",
        title: "XML Tags, Delimiters & Complex Prompt Structure",
        channel: "Fortivance Academy",
        minutes: 8,
        covers: ["Delimiter based", "Structured prompts"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
      {
        id: "cnww-CvDoRk",
        title: "Advanced Prompt Engineering Techniques",
        channel: "Sai Ram Penjarla",
        minutes: 12,
        covers: ["Reflection-based"],
        relatedTo: ["Structured prompts", "Contextual"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
    ],
    youtubeId: "zrp3Lr5eeFc",
    status: "ok",
  },
  "mod-03-les-04": {
    beforeYouWatch: [
      "Explore multi-prompt workflows: breaking a giant task into several sequential prompts where each output feeds the next.",
      "Observe how modular steps improve accuracy over a single overwhelming super-prompt."
    ],
    checkYourself: {
      question: "What is the primary benefit of breaking a complex prompt into multiple linked steps?",
      answer: "Each step focuses on one clear goal, reducing cognitive load on the model and making bugs easy to isolate and fix.",
      hint: "Divide and conquer makes each piece verifiable on its own."
    },
    videos: [
      {
        id: "OEQPss-UXhA",
        title: "AI Prompt Engineering - Multistep Prompting",
        channel: "SivamX",
        minutes: 9,
        covers: ["Multi-prompt"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "OEQPss-UXhA",
    status: "ok",
  },
  "mod-03-les-05": {
    beforeYouWatch: [
      "Learn reflection-based prompting, where the AI reviews its own draft against a rubric before finalizing the answer.",
      "Notice how self-correction catches overlooked constraints and factual slips."
    ],
    checkYourself: {
      question: "How does reflection prompting differ from standard single-pass generation?",
      answer: "The model critiques its initial response against specified guidelines, identifying mistakes and rewriting a corrected version before returning output.",
      hint: "It mimics proofreading your own essay before handing it in."
    },
    videos: [
      {
        id: "cnww-CvDoRk",
        title: "Advanced Prompt Engineering Techniques",
        channel: "Sai Ram Penjarla",
        minutes: 12,
        covers: ["Reflection-based"],
        relatedTo: ["Contextual", "Structured prompts"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
    ],
    youtubeId: "cnww-CvDoRk",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 4: Advanced Prompt Techniques
  // -------------------------------------------------------------
  "mod-04-les-01": {
    beforeYouWatch: [
      "Understand how multi-turn conversations maintain chat history and state across several back-and-forth exchanges.",
      "Watch how conversational context accumulates and how old messages can be summarized to save tokens."
    ],
    checkYourself: {
      question: "Why do long chat conversations eventually need message pruning or sliding windows?",
      answer: "Language models have finite context windows; accumulating too much chat history increases cost and risks exceeding capacity limits.",
      hint: "You cannot send an infinite conversation history with every new message."
    },
    videos: [
      {
        id: "3TGqlQxpuU0",
        title: "Prompts in LangChain | Generative AI using LangChain | Video 4 | CampusX",
        channel: "CampusX",
        minutes: 18,
        covers: ["Multi-turn conversations", "Dynamic prompt templates"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "3TGqlQxpuU0",
    status: "ok",
  },
  "mod-04-les-02": {
    beforeYouWatch: [
      "Explore prompt chaining pipelines: passing verified JSON outputs from an extractor into a validator and then into a writer.",
      "See how pipeline architectures create dependable data processing lines with AI."
    ],
    checkYourself: {
      question: "What should you do between stages in a prompt chain to guarantee pipeline stability?",
      answer: "Validate the schema of intermediate outputs with code before passing them into the next prompt stage.",
      hint: "Never blindly feed unverified model output into downstream dependencies."
    },
    videos: [
      {
        id: "KwC8bUZrUKA",
        title: "Prompt Chaining Explained | LangChain Tutorial for Building Smarter AI Workflows 🚀",
        channel: "Micro Learning",
        minutes: 8,
        covers: ["Prompt chaining and pipelines"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "KwC8bUZrUKA",
    status: "ok",
  },
  "mod-04-les-03": {
    beforeYouWatch: [
      "Learn dynamic prompt templates: using variable placeholders to safely inject live user data into fixed prompt scaffolding.",
      "See how templates separate system logic from dynamic parameters."
    ],
    checkYourself: {
      question: "Why are parameterized templates safer than manually concatenating strings into a prompt?",
      answer: "Templates centralize formatting, enforce variable boundaries, and sanitize user variables before runtime execution.",
      hint: "Think about parameterized SQL queries preventing SQL injection."
    },
    videos: [
      {
        id: "3TGqlQxpuU0",
        title: "Prompts in LangChain | Generative AI using LangChain | Video 4 | CampusX",
        channel: "CampusX",
        minutes: 18,
        covers: ["Dynamic prompt templates"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "3TGqlQxpuU0",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 5: Prompt Optimization Techniques
  // -------------------------------------------------------------
  "mod-05-les-01": {
    beforeYouWatch: [
      "See how engineers systematically refine prompts through test cycles instead of guessing and hoping.",
      "Watch how logging failures and writing regression cases leads to dependable prompts."
    ],
    checkYourself: {
      question: "What is the danger of tweaking a prompt to fix one edge case without running a test suite?",
      answer: "Fixing one prompt edge case blindly can silently break accuracy on dozens of previously passing test cases.",
      hint: "A fix in one place can cause unexpected regressions somewhere else."
    },
    videos: [
      {
        id: "LZJTrAXcyFM",
        title: "Community Paper Reading: LLMs-as-Judges",
        channel: "Arize AI",
        minutes: 54,
        covers: ["LLM-as-judge"],
        relatedTo: ["Iterative refinement"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
    ],
    youtubeId: "LZJTrAXcyFM",
    status: "ok",
  },
  "mod-05-les-02": {
    beforeYouWatch: [
      "Explore how to measure whether an AI answer is actually good using automated metrics and rubric scoring.",
      "Notice how subjective human impressions are replaced with objective scoring criteria."
    ],
    checkYourself: {
      question: "Why is a clear scoring rubric essential when grading AI outputs at scale?",
      answer: "A clear rubric defines unambiguous criteria so automated evaluators or human reviewers score answers consistently.",
      hint: "Without explicit scoring rules, different graders will give conflicting scores."
    },
    videos: [
      {
        id: "vBJF2sy1Pyw",
        title: "The challenges in using LLM-as-a-Judge - Sourabh Agrawal | Vector Space Talk #013",
        channel: "Qdrant Vector Search",
        minutes: 42,
        covers: ["Measuring response quality"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "vBJF2sy1Pyw",
    status: "ok",
  },
  "mod-05-les-03": {
    beforeYouWatch: [
      "Discover LLM-as-a-Judge: using a larger foundation model to evaluate and score outputs produced by smaller, faster models.",
      "Pay attention to positional bias and verbosity bias when models grade other models."
    ],
    checkYourself: {
      question: "What is verbosity bias in an LLM evaluator?",
      answer: "The tendency of language models to give higher scores to longer, wordier answers regardless of whether they are actually more accurate.",
      hint: "Long answers can sound authoritative even when they contain little substance."
    },
    videos: [
      {
        id: "vBJF2sy1Pyw",
        title: "The challenges in using LLM-as-a-Judge - Sourabh Agrawal | Vector Space Talk #013",
        channel: "Qdrant Vector Search",
        minutes: 42,
        covers: ["Performance evaluation", "LLM-as-a-judge"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "LZJTrAXcyFM",
        title: "Community Paper Reading: LLMs-as-Judges",
        channel: "Arize AI",
        minutes: 54,
        covers: ["LLM-as-judge"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
    ],
    youtubeId: "vBJF2sy1Pyw",
    status: "ok",
  },
  "mod-05-les-04": {
    beforeYouWatch: [
      "Learn prompt tuning fundamentals: adapting models to specific tasks efficiently without retraining billions of weights.",
      "See how soft prompt vectors steer pre-trained models with minimal compute."
    ],
    checkYourself: {
      question: "How does prompt tuning differ from full parameter fine-tuning?",
      answer: "Prompt tuning freezes the original model weights and trains a small set of virtual prompt tokens, saving compute and storage.",
      hint: "Instead of rebuilding the whole engine, you adjust a lightweight tuning dial."
    },
    videos: [
      {
        id: "yu27PWzJI_Y",
        title: "What is Prompt Tuning?",
        channel: "IBM Technology",
        minutes: 9,
        covers: ["Prompt tuning fundamentals", "Soft prompts"],
        level: "beginner",
        status: "ok",
        resolvedBy: "agent-search",
      },
    ],
    youtubeId: "yu27PWzJI_Y",
    status: "ok",
  },
  "mod-05-les-05": {
    beforeYouWatch: [
      "Examine traditional NLP scoring metrics: BLEU for word overlap, ROUGE for summary recall, and BERTScore for semantic similarity.",
      "Notice when simple word-matching metrics fail to capture true factual meaning."
    ],
    checkYourself: {
      question: "Why might a paraphrase receive a low BLEU score even though its meaning is completely correct?",
      answer: "BLEU strictly measures exact word n-gram matches; using different synonyms conveys the right meaning but misses identical words.",
      hint: "Exact vocabulary overlap does not equal semantic correctness."
    },
    videos: [
      {
        id: "RTaZqGflrJ8",
        title: "LLM Evaluation Explained: BLEU, ROUGE, BERTScore & the Full Pipeline (Simple Guide)",
        channel: "AI Academy",
        minutes: 7,
        covers: ["BLEU, ROUGE, BERTScore"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "RTaZqGflrJ8",
    status: "ok",
  },
  "mod-05-les-06": {
    beforeYouWatch: [
      "Learn why language models hallucinate and explore practical techniques to detect and contain made-up facts.",
      "Observe how grounding instructions in source documents keeps answers factually anchored."
    ],
    checkYourself: {
      question: "What is the most effective prompt constraint to prevent factual hallucinations?",
      answer: "Instruct the model to answer strictly from the provided text, and explicitly state 'I do not know' if the answer is missing.",
      hint: "Give the model explicit permission to decline answering rather than guessing."
    },
    videos: [
      {
        id: "ZFKvTIADp0k",
        title: "Tuning Your AI Model to Reduce Hallucinations",
        channel: "IBM Technology",
        minutes: 9,
        covers: ["Hallucination detection", "Grounding and temperature"],
        level: "beginner",
        status: "ok",
        resolvedBy: "agent-search",
      },
    ],
    youtubeId: "ZFKvTIADp0k",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 6: Multi-Model Prompting
  // -------------------------------------------------------------
  "mod-06-les-01": {
    beforeYouWatch: [
      "Discover multimodal artificial intelligence: models that simultaneously process and reason across text, images, and audio.",
      "Observe how visual tokens blend with language tokens in a unified attention space."
    ],
    checkYourself: {
      question: "How does a multimodal model represent an image alongside text prompt instructions?",
      answer: "A vision encoder converts image patches into numerical embedding tokens that sit in the same representation space as words.",
      hint: "Pictures become tokens that the model reads just like words."
    },
    videos: [
      {
        id: "J51oZYcNvP8",
        title: "What is Multimodal AI? How LLMs Process Text, Images, and More",
        channel: "IBM Technology",
        minutes: 8,
        covers: ["What is Multimodal AI?", "Multimodal architectures"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "lOD_EE96jhM",
        title: "What Are Vision Language Models? How AI Sees & Understands Images",
        channel: "IBM Technology",
        minutes: 9,
        covers: ["Vision Language Models Enable Image Understanding"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "J51oZYcNvP8",
    status: "ok",
  },
  "mod-06-les-02": {
    beforeYouWatch: [
      "Master image prompting: how to direct the model's gaze toward specific diagrams, charts, or visual artifacts.",
      "Notice how coordinate bounding boxes and step-by-step questions extract precise data from charts."
    ],
    checkYourself: {
      question: "When prompting an AI to inspect an image diagram, why should you specify the regions of interest?",
      answer: "Explicit visual focal points prevent the model from getting distracted by background clutter or irrelevant visual elements.",
      hint: "Guide the AI's eye just like you would guide a human teammate."
    },
    videos: [
      {
        id: "lOD_EE96jhM",
        title: "What Are Vision Language Models? How AI Sees & Understands Images",
        channel: "IBM Technology",
        minutes: 9,
        covers: ["Text + image prompts"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "lOD_EE96jhM",
    status: "ok",
  },
  "mod-06-les-03": {
    beforeYouWatch: [
      "Explore cross-model interaction: combining specialized vision, audio, and language models to accomplish complex workflows.",
      "See how handoffs between specialized tools produce richer outcomes than a single generalist model."
    ],
    checkYourself: {
      question: "What is the key advantage of routing tasks across multiple specialized models?",
      answer: "Each model excels at its specific domain (e.g. OCR, transcription, high-speed coding) while reducing total latency and operating cost.",
      hint: "Specialists collaborating together often beat a single expensive generalist."
    },
    videos: [
      {
        id: "J51oZYcNvP8",
        title: "What is Multimodal AI? How LLMs Process Text, Images, and More",
        channel: "IBM Technology",
        minutes: 8,
        covers: ["Cross-model AI interaction"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "J51oZYcNvP8",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 7: Tool-Augmented Prompting
  // -------------------------------------------------------------
  "mod-07-les-01": {
    beforeYouWatch: [
      "See how language models connect to external web APIs to retrieve fresh real-time data and trigger actions.",
      "Notice how the model decides when it needs to call a tool versus answering from pretraining memory."
    ],
    checkYourself: {
      question: "How does a model know when to invoke an API tool rather than guessing an answer?",
      answer: "It checks tool descriptions against user queries and outputs a structured tool request when needed information lies outside its weights.",
      hint: "Tool descriptions are the menu that tells the AI what external abilities exist."
    },
    videos: [
      {
        id: "h8gMhXYAv1k",
        title: "What is Tool Calling? Connecting LLMs to Your Data",
        channel: "IBM Technology",
        minutes: 5,
        covers: ["Tool Calling: Traditional vs Embedded Approaches", "API-based prompting"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "gosZ_vqXkMI",
        title: "AI Tool Calling via Natural Language: LLMs, APIs & Docker in Action",
        channel: "IBM Technology",
        minutes: 4,
        covers: ["Orchestrating LLM-Powered Tool Calls"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "h8gMhXYAv1k",
    status: "ok",
  },
  "mod-07-les-02": {
    beforeYouWatch: [
      "Learn function calling: teaching the model to output strict JSON arguments matching your backend code schemas.",
      "Observe how type signatures and clear parameter descriptions prevent invalid function calls."
    ],
    checkYourself: {
      question: "Does an LLM execute backend function code itself when performing function calling?",
      answer: "No, the model generates structured JSON arguments; your application code receives those arguments, runs the function, and returns the result.",
      hint: "The AI plans the call, but your server executes the code."
    },
    videos: [
      {
        id: "h8gMhXYAv1k",
        title: "What is Tool Calling? Connecting LLMs to Your Data",
        channel: "IBM Technology",
        minutes: 5,
        covers: ["Function calling"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "h8gMhXYAv1k",
    status: "ok",
  },
  "mod-07-les-03": {
    beforeYouWatch: [
      "Understand plugin and tool integration: orchestrating multiple tools like calculators, web search, and databases.",
      "Watch how the AI handles errors when a third-party tool fails or times out."
    ],
    checkYourself: {
      question: "How should an application handle a tool error when returning the result back to the model?",
      answer: "Pass a clear, informative error message into the conversation so the model can adjust parameters or try an alternative approach.",
      hint: "Letting the AI see the error gives it a chance to recover gracefully."
    },
    videos: [
      {
        id: "gosZ_vqXkMI",
        title: "AI Tool Calling via Natural Language: LLMs, APIs & Docker in Action",
        channel: "IBM Technology",
        minutes: 4,
        covers: ["Plug-in tool integration"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "0z9_MhcYvcY",
        title: "What is Agentic RAG?",
        channel: "IBM Technology",
        minutes: 10,
        covers: ["Plug-in tool integration"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "gosZ_vqXkMI",
    status: "ok",
  },
  "mod-07-les-04": {
    beforeYouWatch: [
      "Explore Retrieval-Augmented Generation (RAG): pulling private company documents into the prompt at runtime.",
      "See how vector embeddings find relevant paragraphs from thousands of documents in milliseconds."
    ],
    checkYourself: {
      question: "Why is RAG preferred over fine-tuning for constantly changing organizational knowledge?",
      answer: "RAG updates knowledge instantly by changing database records without requiring expensive model retraining cycles.",
      hint: "Updating a database row takes seconds; fine-tuning weights takes hours and compute."
    },
    videos: [
      {
        id: "cDn7bf84LsM",
        title: "LangChain RAG: Optimizing AI Models for Accurate Responses",
        channel: "IBM Technology",
        minutes: 8,
        covers: ["Retrieval Augmented Generation"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "0z9_MhcYvcY",
        title: "What is Agentic RAG?",
        channel: "IBM Technology",
        minutes: 10,
        covers: ["What is Agentic RAG?", "Retrieval Augmented Generation"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "cDn7bf84LsM",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 8: Security in Prompt Engineering
  // -------------------------------------------------------------
  "mod-08-les-01": {
    beforeYouWatch: [
      "Understand prompt injection attacks: how untrusted user input can hijack model instructions to bypass security filters.",
      "Notice the distinction between direct injections and indirect injections hidden in external websites."
    ],
    checkYourself: {
      question: "What is an indirect prompt injection attack?",
      answer: "An attack where malicious instructions are hidden inside an external document or webpage that the AI reads while performing a task.",
      hint: "The attacker is not chatting with the bot directly; they planted instructions for the bot to find."
    },
    videos: [
      {
        id: "_9x-mAHGgC4",
        title: "Artificial Intelligence: The new attack surface",
        channel: "IBM Technology",
        minutes: 9,
        covers: ["AI attack surface overview"],
        relatedTo: ["Prompt injection", "Mitigation strategies"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "yNIlm9IfcgA",
        title: "Secure AI Systems: Understanding and Preventing Prompt Injection",
        channel: "ChatBotKit",
        minutes: 6,
        covers: ["Prompt injection", "Understanding and Preventing Prompt Injection"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
    ],
    youtubeId: "_9x-mAHGgC4",
    status: "ok",
  },
  "mod-08-les-02": {
    beforeYouWatch: [
      "Examine jailbreak techniques: clever adversarial framing, role-play scenarios, and linguistic tricks used to bypass safety guardrails.",
      "See why simple keyword blacklists fail against creative semantic workarounds."
    ],
    checkYourself: {
      question: "Why do keyword filters fail to stop sophisticated jailbreak prompts?",
      answer: "Attackers rephrase forbidden concepts using hypothetical roleplay, ciphers, or metaphors that evade exact keyword matches.",
      hint: "Language has infinite ways to express the same prohibited intent."
    },
    videos: [
      {
        id: "zn2ukSnDqSg",
        title: "ChatGPT Jailbreak - Computerphile",
        channel: "Computerphile",
        minutes: 12,
        covers: ["Jailbreak techniques"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
      },
    ],
    youtubeId: "zn2ukSnDqSg",
    status: "ok",
  },
  "mod-08-les-03": {
    beforeYouWatch: [
      "Learn defense-in-depth mitigation strategies: input sanitization, dual LLM pattern checks, and output guardrails.",
      "See why multi-layered defenses are necessary when securing LLM applications."
    ],
    checkYourself: {
      question: "What is the Dual LLM security architecture?",
      answer: "A pattern where an isolated privileged model handles sensitive tools, while an unprivileged model processes untrusted external data.",
      hint: "Separate data interpretation from administrative execution authority."
    },
    videos: [
      {
        id: "gZTQNb0NGjM",
        title: "Hypnotized AI and Large Language Model Security",
        channel: "IBM Technology",
        minutes: 7,
        covers: ["Mitigation strategies", "Safe prompt design"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "yNIlm9IfcgA",
        title: "Secure AI Systems: Understanding and Preventing Prompt Injection",
        channel: "ChatBotKit",
        minutes: 6,
        covers: ["Mitigation strategies"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "gZTQNb0NGjM",
    status: "ok",
  },
  "mod-08-les-04": {
    beforeYouWatch: [
      "Discover safe prompt design principles: structural delimiter enforcement, strict system role pinning, and least-privilege tool execution.",
      "Notice how architectural boundaries protect sensitive internal business rules."
    ],
    checkYourself: {
      question: "Why should internal business instructions never rely on client-side prompt formatting alone?",
      answer: "Client-side prompts can be inspected or modified by attackers; safety guardrails and authorization must be enforced on the backend server.",
      hint: "Never trust the client to enforce security rules."
    },
    videos: [
      {
        id: "gZTQNb0NGjM",
        title: "Hypnotized AI and Large Language Model Security",
        channel: "IBM Technology",
        minutes: 7,
        covers: ["Safe prompt design"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "_9x-mAHGgC4",
        title: "Artificial Intelligence: The new attack surface",
        channel: "IBM Technology",
        minutes: 9,
        covers: ["AI attack surface overview"],
        relatedTo: ["Safe prompt design"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
    ],
    youtubeId: "gZTQNb0NGjM",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 9: Domain-Specific Prompt Engineering
  // -------------------------------------------------------------
  "mod-09-les-01": {
    beforeYouWatch: [
      "Learn coding prompt techniques: generating clean functions, writing comprehensive unit tests, and debugging stack traces.",
      "See how giving the model existing type signatures and code conventions eliminates hallucinated library calls."
    ],
    checkYourself: {
      question: "What is the best way to prevent an AI coding assistant from using deprecated or invented APIs?",
      answer: "Provide the exact method signatures, library versions, or type definitions in the prompt context.",
      hint: "Anchor the model to the exact library version your project uses."
    },
    videos: [
      {
        id: "LAF-lACf2QY",
        title: "Prompt engineering essentials: Getting better results from LLMs | Tutorial",
        channel: "GitHub",
        minutes: 24,
        covers: ["Coding", "Prompt engineering essentials"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "--XpNP6NsqE",
        title: "How to Write Better AI Prompts as a Software Developer in 2026",
        channel: "JetBrains",
        minutes: 28,
        covers: ["Coding", "Prompt engineering for developers"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "LAF-lACf2QY",
    status: "ok",
  },
  "mod-09-les-02": {
    beforeYouWatch: [
      "Explore prompt engineering for education: designing Socratic tutors that guide students to answers instead of handing them solutions.",
      "Observe how scaffolding questions encourage deep critical thinking."
    ],
    checkYourself: {
      question: "How does a Socratic prompt prevent a student from taking mental shortcuts?",
      answer: "It instructs the AI to respond with diagnostic questions that prompt the student to explain their reasoning step-by-step.",
      hint: "A great tutor asks guiding questions rather than doing the homework for the student."
    },
    videos: [
      {
        id: "GxlOoKI0zxg",
        title: "Prompt Engineering for Teachers",
        channel: "Town Square for Teachers",
        minutes: 11,
        covers: ["Education and tutoring"],
        level: "beginner",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "GxlOoKI0zxg",
    status: "ok",
  },
  "mod-09-les-03": {
    beforeYouWatch: [
      "Discover enterprise automation prompts: parsing messy invoices, extracting contract dates, and converting emails into CRM actions.",
      "Notice how schema validation protects downstream business software from data errors."
    ],
    checkYourself: {
      question: "Why must business extraction prompts output strictly typed schemas like JSON?",
      answer: "Business workflows require predictable key-value fields so databases and automated systems can ingest data without manual cleanup.",
      hint: "Databases cannot query conversational paragraphs reliably."
    },
    videos: [
      {
        id: "QRgayVF5PyM",
        title: "Prompt Engineering for Business: Automate Workflows With AI",
        channel: "Tuff University",
        minutes: 30,
        covers: ["Business automation"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "QRgayVF5PyM",
    status: "ok",
  },
  "mod-09-les-04": {
    beforeYouWatch: [
      "Learn research assistance prompts: synthesizing scientific papers, cross-referencing citations, and summarizing literature reviews.",
      "See how requiring paragraph citations prevents fabricated references."
    ],
    checkYourself: {
      question: "How can you prevent an AI from inventing plausible-sounding scientific citations?",
      answer: "Require the AI to cite only verbatim quotes and exact URLs or DOIs provided within the source text.",
      hint: "Never ask a model to recall academic papers from memory without reference text."
    },
    videos: [
      {
        id: "U8zrqWrTYdc",
        title: "How to use ChatGPT for Research - Literature Review, Research Paper Writing & Publication",
        channel: "WiseUp Communications",
        minutes: 9,
        covers: ["Research assistance"],
        level: "beginner",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "U8zrqWrTYdc",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 10: Advanced Prompt Engineering
  // -------------------------------------------------------------
  "mod-10-les-01": {
    beforeYouWatch: [
      "Discover Tree-of-Thoughts (ToT): generating multiple reasoning branches, evaluating each path, and backtracking when stuck.",
      "See how tree exploration solves complex mathematical and algorithmic puzzles that trip up standard linear chains."
    ],
    checkYourself: {
      question: "How does Tree-of-Thoughts improve on Chain-of-Thought for complex multi-step problems?",
      answer: "ToT generates multiple possible next steps, evaluates their viability, and backtracks from dead ends rather than pursuing only one path.",
      hint: "It explores a tree of possibilities instead of following a single straight line."
    },
    videos: [
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["ToT, ReAct, APE overview"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "ut5kp56wW_4",
        title: "Tree of Thoughts: Deliberate Problem Solving with Large Language Models (Full Paper Review)",
        channel: "Yannic Kilcher",
        minutes: 29,
        covers: ["Tree of Thoughts: Deliberate Problem Solving with LLMs"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "uDIW34h8cmM",
    status: "ok",
  },
  "mod-10-les-02": {
    beforeYouWatch: [
      "Explore active prompting: measuring model uncertainty across multiple drafts to identify ambiguous steps needing human clarification.",
      "Notice how uncertainty metrics reveal when the AI is unsure versus confident."
    ],
    checkYourself: {
      question: "What does high disagreement across multiple sampled answers tell an engineer about a prompt?",
      answer: "It signals high model uncertainty and ambiguity, indicating the prompt needs clearer constraints or few-shot examples.",
      hint: "If five runs give five different answers, the question needs clarifying."
    },
    videos: [
      {
        id: "wcmLgy1-9aQ",
        title: "Active Prompting Explained: Boost AI Reasoning with Less Human Effort",
        channel: "Micro Learning",
        minutes: 8,
        covers: ["Active prompting"],
        level: "advanced",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "wcmLgy1-9aQ",
    status: "ok",
  },
  "mod-10-les-03": {
    beforeYouWatch: [
      "Learn ReAct (Reason + Act): interweaving reasoning steps with external tool actions in a tight observe-and-adjust loop.",
      "See how the model explains what it learned from tool results before taking its next action."
    ],
    checkYourself: {
      question: "What does each step in a ReAct loop consist of?",
      answer: "A Thought (reasoning about state), an Action (calling an external tool), and an Observation (reading the tool's response).",
      hint: "Think, Act, Observe, Repeat."
    },
    videos: [
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["ToT, ReAct, APE overview"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "QX-p-vsDoiQ",
        title: "Keys to Understanding ReAct: Synergizing Reasoning and Acting in Language Models",
        channel: "Arize AI",
        minutes: 48,
        covers: ["ReAct paper reading"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "uDIW34h8cmM",
    status: "ok",
  },
  "mod-10-les-04": {
    beforeYouWatch: [
      "Discover expert prompting: prompting a committee of virtual specialists who critique, debate, and synthesize a master plan.",
      "Observe how diverse specialist viewpoints uncover blind spots in complex architectures."
    ],
    checkYourself: {
      question: "Why does an ensemble of specialized prompts produce more robust output than one generalized prompt?",
      answer: "Different specialist personas bring distinct domain constraints and critical questions to the evaluation table.",
      hint: "A security reviewer, a UX designer, and a database architect spot very different flaws."
    },
    videos: [
      {
        id: "g5h-piquf_k",
        title: "Should you tell your LLM it's an 'expert' before prompting?",
        channel: "AI and Search with Mark Williams-Cook",
        minutes: 7,
        covers: ["Expert prompting"],
        level: "advanced",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "g5h-piquf_k",
    status: "ok",
  },
  "mod-10-les-05": {
    beforeYouWatch: [
      "Learn Automatic Prompt Engineering (APE): using LLMs to automatically generate, test, and optimize candidate prompts against benchmarks.",
      "Notice how machines discover subtle prompt wording variations that humans would never consider."
    ],
    checkYourself: {
      question: "How does an Automatic Prompt Engineering (APE) pipeline evaluate candidate prompts?",
      answer: "It executes hundreds of candidate prompt variations against a test dataset and selects the top performers based on objective test scores.",
      hint: "It uses systematic experimentation and scoring rather than human guessing."
    },
    videos: [
      {
        id: "uDIW34h8cmM",
        title: "Prompt Engineering Guide - From Beginner to Advanced",
        channel: "Matthew Berman",
        minutes: 33,
        covers: ["APE overview"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "uDIW34h8cmM",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 11: AI Agents, Context Engineering and MCP
  // -------------------------------------------------------------
  "mod-11-les-01": {
    beforeYouWatch: [
      "Explore autonomous agent loops: how agents plan goals, execute tools, observe consequences, and update their plans dynamically.",
      "Watch how goal decomposition turns high-level user objectives into concrete terminal commands."
    ],
    checkYourself: {
      question: "What prevents an autonomous agent from getting trapped in an infinite loop when a tool keeps failing?",
      answer: "A maximum iteration limit, loop detection heuristics, and explicit fallback instructions in the system prompt.",
      hint: "Agents must know when to stop and ask the human for assistance."
    },
    videos: [
      {
        id: "eur8dUO9mvE",
        title: "What is MCP? Integrate AI Agents with Databases & APIs",
        channel: "IBM Technology",
        minutes: 4,
        covers: ["What is MCP?", "MCP (hosts, clients, servers)"],
        relatedTo: ["Agent loops (plan, act, observe)"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
      {
        id: "kQmXtrmQ5Zg",
        title: "Building Agents with Model Context Protocol - Full Workshop with Mahesh Murag of Anthropic",
        channel: "AI Engineer",
        minutes: 78,
        covers: ["Agent loops (plan, act, observe)", "MCP workshop Mahesh Murag"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
    ],
    youtubeId: "kQmXtrmQ5Zg",
    status: "ok",
  },
  "mod-11-les-02": {
    beforeYouWatch: [
      "Understand context engineering vs prompt engineering: managing entire dynamic context windows, token caches, and document stores.",
      "See how keeping prompt prefixes stable unlocks ultra-fast, low-cost prompt caching."
    ],
    checkYourself: {
      question: "What is the primary difference between prompt engineering and context engineering?",
      answer: "Prompt engineering focuses on text instructions, while context engineering optimizes the entire information architecture, caching, and state inside the context window.",
      hint: "One is about the words you choose; the other is about how data flows through memory."
    },
    videos: [
      {
        id: "vD0E3EUb8-8",
        title: "Context Engineering vs. Prompt Engineering: Smarter AI with RAG & Agents",
        channel: "IBM Technology",
        minutes: 6,
        covers: ["Context Engineering vs. Prompt Engineering"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "vD0E3EUb8-8",
    status: "ok",
  },
  "mod-11-les-03": {
    beforeYouWatch: [
      "Learn agent memory and tool protocols: maintaining short-term working memory alongside long-term vector recall.",
      "Notice how standardized tool schemas allow agents to discover new tools on the fly."
    ],
    checkYourself: {
      question: "Why should an agent distinguish between short-term working memory and long-term storage?",
      answer: "Short-term memory holds active conversation details in the context window, while long-term memory stores durable knowledge in databases for on-demand retrieval.",
      hint: "Similar to human RAM and hard drive storage."
    },
    videos: [
      {
        id: "7j1t3UZA1TY",
        title: "MCP vs API: Simplifying AI Agent Integration with External Data",
        channel: "IBM Technology",
        minutes: 7,
        covers: ["MCP vs API", "Memory and tool protocols"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "kQmXtrmQ5Zg",
        title: "Building Agents with Model Context Protocol - Full Workshop with Mahesh Murag of Anthropic",
        channel: "AI Engineer",
        minutes: 78,
        covers: ["Memory and tool protocols"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "7j1t3UZA1TY",
    status: "ok",
  },
  "mod-11-les-04": {
    beforeYouWatch: [
      "Discover Model Context Protocol (MCP): the open standard connecting AI hosts like Claude or Cursor to local servers and databases.",
      "See how MCP replaces custom one-off API plugins with universal client-server connections."
    ],
    checkYourself: {
      question: "What problem does Model Context Protocol (MCP) solve for developers?",
      answer: "It provides a standardized protocol so developers write one MCP server that any compatible AI client can connect to and query.",
      hint: "Think USB-C for connecting AI models to files, databases, and services."
    },
    videos: [
      {
        id: "eur8dUO9mvE",
        title: "What is MCP? Integrate AI Agents with Databases & APIs",
        channel: "IBM Technology",
        minutes: 4,
        covers: ["What is MCP?", "MCP (hosts, clients, servers)"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "7j1t3UZA1TY",
        title: "MCP vs API: Simplifying AI Agent Integration with External Data",
        channel: "IBM Technology",
        minutes: 7,
        covers: ["MCP vs API", "MCP (hosts, clients, servers)"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "eur8dUO9mvE",
    status: "ok",
  },
  "mod-11-les-05": {
    beforeYouWatch: [
      "Explore Agentic RAG: where an agent plans query rewrites, filters retrieved chunks, and loops back if information is incomplete.",
      "Observe how active query expansion beats naive one-shot vector search."
    ],
    checkYourself: {
      question: "How does Agentic RAG improve on traditional naive RAG?",
      answer: "It evaluates whether retrieved documents actually answered the query and proactively searches again with refined terms if gaps remain.",
      hint: "It reviews its own research and digs deeper if necessary."
    },
    videos: [
      {
        id: "vD0E3EUb8-8",
        title: "Context Engineering vs. Prompt Engineering: Smarter AI with RAG & Agents",
        channel: "IBM Technology",
        minutes: 6,
        covers: ["Agentic RAG"],
        level: "beginner",
        status: "ok",
        resolvedBy: "seed",
      },
      {
        id: "Yq29bZ8Hlrc",
        title: "Optimize RAG with AI Agents & Vector Databases",
        channel: "IBM Technology",
        minutes: 33,
        covers: ["Optimize RAG with AI Agents and Vector Databases"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "vD0E3EUb8-8",
    status: "ok",
  },

  // -------------------------------------------------------------
  // MODULE 12: Production Prompt Engineering and Responsible AI
  // -------------------------------------------------------------
  "mod-12-les-01": {
    beforeYouWatch: [
      "Learn the architectural tradeoffs between prompt engineering, RAG, and fine-tuning in production software.",
      "See how cost, latency, data freshness, and maintenance complexity drive the decision for each approach."
    ],
    checkYourself: {
      question: "When is fine-tuning justified over prompt engineering or RAG?",
      answer: "When you need to embed specialized domain terminology or formatting into model weights while reducing runtime token overhead at high volume.",
      hint: "Fine-tuning permanently shapes behavior and style, while RAG supplies fresh facts."
    },
    videos: [
      {
        id: "zYGDpG-pTho",
        title: "RAG vs Fine-Tuning vs Prompt Engineering: Optimizing AI Models",
        channel: "IBM Technology",
        minutes: 13,
        covers: ["Prompting vs RAG vs fine-tuning"],
        level: "beginner",
        status: "ok",
        resolvedBy: "agent-search",
      },
    ],
    youtubeId: "zYGDpG-pTho",
    status: "ok",
  },
  "mod-12-les-02": {
    beforeYouWatch: [
      "Explore running LLM-as-a-judge pipelines in continuous production: monitoring model drift, scoring latency, and setting quality alert gates.",
      "Notice how automated evaluations catch unexpected regressions before users report them."
    ],
    checkYourself: {
      question: "Why should production LLM judge scores be paired with random human audit samples?",
      answer: "Automated judges can develop systematic biases or fail to catch subtle real-world user intent mismatches.",
      hint: "Human spot-checks keep automated evaluators honest."
    },
    videos: [
      {
        id: "vBJF2sy1Pyw",
        title: "The challenges in using LLM-as-a-Judge - Sourabh Agrawal | Vector Space Talk #013",
        channel: "Qdrant Vector Search",
        minutes: 42,
        covers: ["LLM-as-judge in production"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
      },
    ],
    youtubeId: "vBJF2sy1Pyw",
    status: "ok",
  },
  "mod-12-les-03": {
    beforeYouWatch: [
      "Discover prompt versioning and regression testing: treating prompts as production code tracked in Git with automated CI/CD checks.",
      "See how gold-standard evaluation datasets catch subtle prompt regressions before deployment."
    ],
    checkYourself: {
      question: "Why should prompt templates be version-controlled in the same repository as application code?",
      answer: "It ensures changes to prompts are peer-reviewed, tested against regression datasets, and deployed atomically alongside supporting application logic.",
      hint: "Prompts are code and deserve the same CI/CD rigor."
    },
    videos: [
      {
        id: "DNmIqNjbKoM",
        title: "Prompt Versioning & Testing Strategies — Reliable LLM Development | Uplatz",
        channel: "Uplatz",
        minutes: 6,
        covers: ["Prompt versioning and regression tests"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
    ],
    youtubeId: "DNmIqNjbKoM",
    status: "ok",
  },
  "mod-12-les-04": {
    beforeYouWatch: [
      "Master production guardrails, cost management, latency budgets, and token caching for enterprise LLM systems.",
      "Learn how semantic cache layers answer common questions in under 10 milliseconds at zero LLM cost."
    ],
    checkYourself: {
      question: "How does semantic response caching dramatically lower LLM operating costs?",
      answer: "It stores previous model answers and returns them immediately when a new user query matches the same meaning, bypassing upstream LLM calls.",
      hint: "Why pay to recompute an answer you calculated two seconds ago?"
    },
    videos: [
      {
        id: "l5K4r_TJz_8",
        title: "How to implement LLM guardrails for RAG applications",
        channel: "IBM Developer",
        minutes: 7,
        covers: ["LLM guardrails explained", "Guardrails, cost, latency, caching"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "agent-search",
        role: "core",
      },
      {
        id: "HdafI0t3sEY",
        title: "RAG vs. CAG: Solving Knowledge Gaps in AI Models",
        channel: "IBM Technology",
        minutes: 9,
        covers: ["Caching"],
        relatedTo: ["Guardrails, cost, latency, caching"],
        level: "intermediate",
        status: "ok",
        resolvedBy: "seed",
        role: "core",
      },
    ],
    youtubeId: "l5K4r_TJz_8",
    status: "ok",
  },
  "mod-12-les-05": {
    beforeYouWatch: [
      "Understand bias mitigation, safety alignment, and responsible AI governance in customer-facing deployments.",
      "Notice how alignment techniques like RLHF steer models away from harmful, biased, or discriminatory responses."
    ],
    checkYourself: {
      question: "What is the primary role of post-training alignment (such as RLHF) in modern language models?",
      answer: "It aligns raw token-completion models with human values, encouraging helpful, harmless, and truthful answers.",
      hint: "Pretraining teaches language; alignment teaches judgment and ethics."
    },
    videos: [
      {
        id: "7xTGNNLPyMI",
        title: "Deep Dive into LLMs like ChatGPT",
        channel: "Andrej Karpathy",
        minutes: 211,
        covers: ["Post-training and assistant models"],
        relatedTo: ["Bias, safety, governance"],
        level: "advanced",
        status: "ok",
        resolvedBy: "seed",
        role: "optional",
      },
    ],
    youtubeId: "7xTGNNLPyMI",
    status: "ok",
  },
};
