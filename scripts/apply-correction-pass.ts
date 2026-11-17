/**
 * Script to surgically apply the correction pass across:
 * - scripts/enrich-curriculum.ts
 * - scripts/verify-videos.ts
 * - scripts/modules-data/
 */

import * as fs from "node:fs";
import * as path from "node:path";

console.log("Starting correction pass execution...");

// 1. UPDATE scripts/enrich-curriculum.ts
const enrichPath = path.resolve(process.cwd(), "scripts", "enrich-curriculum.ts");
let enrichContent = fs.readFileSync(enrichPath, "utf-8");

// A. Fix mod-02-les-01 (Zero-shot)
// Add uDIW34h8cmM, update T-w_5T-j-dA (level intermediate, covers ["Zero-shot", "Chain of Thought"])
enrichContent = enrichContent.replace(
  /"mod-02-les-01": \{[\s\S]*?youtubeId: "T-w_5T-j-dA",[\s\S]*?status: "ok",\s*\}/,
  `"mod-02-les-01": {
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
  }`
);

// B. Fix mod-02-les-02 (One-shot)
// Ensure uDIW34h8cmM has updated covers and role optional
enrichContent = enrichContent.replace(
  /"mod-02-les-02": \{[\s\S]*?youtubeId: "Vl4hH_L5-3Q",[\s\S]*?status: "ok",\s*\}/,
  `"mod-02-les-02": {
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
  }`
);

// C. Fix mod-02-les-03 (Few-shot)
// Remove Cu8QvodkjpU, add uDIW34h8cmM
enrichContent = enrichContent.replace(
  /"mod-02-les-03": \{[\s\S]*?youtubeId: "Vl4hH_L5-3Q",[\s\S]*?status: "ok",\s*\}/,
  `"mod-02-les-03": {
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
  }`
);

// D. Fix mod-02-les-04 (Chain of Thought)
// Include T-w_5T-j-dA
enrichContent = enrichContent.replace(
  /"mod-02-les-04": \{[\s\S]*?youtubeId: "b210W3JWOxw",[\s\S]*?status: "ok",\s*\}/,
  `"mod-02-les-04": {
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
  }`
);

// E. Fix mod-02-les-05 (Instruction based)
// Remove Cu8QvodkjpU, set T-w_5T-j-dA with covers ["Zero-shot", "Chain of Thought"] and relatedTo ["Instruction based"]
enrichContent = enrichContent.replace(
  /"mod-02-les-05": \{[\s\S]*?youtubeId: "T-w_5T-j-dA",[\s\S]*?status: "ok",\s*\}/,
  `"mod-02-les-05": {
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
  }`
);

// F. Fix mod-02-les-06 (Role based)
// cnww-CvDoRk: covers ["Role based", "Few-shot"], uDIW34h8cmM: covers ["Zero-shot", "One-shot", "Few-shot", "Role based"]
enrichContent = enrichContent.replace(
  /"mod-02-les-06": \{[\s\S]*?youtubeId: "uDIW34h8cmM",[\s\S]*?status: "ok",\s*\}/,
  `"mod-02-les-06": {
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
  }`
);

// G. Fix mod-02-les-07 (Constraint based)
// Resolve slot with ugxPshXr7Ro
enrichContent = enrichContent.replace(
  /"mod-02-les-07": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-02-les-07": {
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
  }`
);

// H. Fix Module 3 (Contextual, Delimiter based, Structured prompts, Multi-prompt, Reflection-based)
// mod-03-les-01: cnww-CvDoRk covers ["Reflection-based"], relatedTo ["Contextual", "Structured prompts"]
enrichContent = enrichContent.replace(
  /"mod-03-les-01": \{[\s\S]*?youtubeId: "cnww-CvDoRk",[\s\S]*?status: "ok",\s*\}/,
  `"mod-03-les-01": {
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
  }`
);

// mod-03-les-02: resolve with zrp3Lr5eeFc
enrichContent = enrichContent.replace(
  /"mod-03-les-02": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-03-les-02": {
    beforeYouWatch: [
      "Learn how to use delimiters like XML tags or triple quotes to separate instructions from raw user data.",
      "Observe how clear boundaries stop malicious or accidental prompt injections from altering your instructions."
    ],
    checkYourself: {
      question: "Why do AI developers wrap user inputs in tags like \`<document>\` or \`\"\"\"\`?",
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
  }`
);

// mod-03-les-03: structured prompts
enrichContent = enrichContent.replace(
  /"mod-03-les-03": \{[\s\S]*?youtubeId: "cnww-CvDoRk",[\s\S]*?status: "ok",\s*\}/,
  `"mod-03-les-03": {
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
  }`
);

// mod-03-les-04: resolve multi-prompt with OEQPss-UXhA
enrichContent = enrichContent.replace(
  /"mod-03-les-04": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-03-les-04": {
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
  }`
);

// mod-03-les-05: reflection-based
enrichContent = enrichContent.replace(
  /"mod-03-les-05": \{[\s\S]*?youtubeId: "cnww-CvDoRk",[\s\S]*?status: "ok",\s*\}/,
  `"mod-03-les-05": {
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
  }`
);

// I. Fix mod-04-les-02 (Prompt chaining and pipelines) -> KwC8bUZrUKA
enrichContent = enrichContent.replace(
  /"mod-04-les-02": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-04-les-02": {
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
  }`
);

// J. Fix mod-05-les-01 (Iterative refinement)
enrichContent = enrichContent.replace(
  /"mod-05-les-01": \{[\s\S]*?youtubeId: "LZJTrAXcyFM",[\s\S]*?status: "ok",\s*\}/,
  `"mod-05-les-01": {
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
  }`
);

// K. Fix mod-05-les-03 (Performance evaluation)
enrichContent = enrichContent.replace(
  /"mod-05-les-03": \{[\s\S]*?youtubeId: "vBJF2sy1Pyw",[\s\S]*?status: "ok",\s*\}/,
  `"mod-05-les-03": {
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
  }`
);

// L. Fix mod-05-les-05 (BLEU, ROUGE, BERTScore) -> RTaZqGflrJ8
enrichContent = enrichContent.replace(
  /"mod-05-les-05": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-05-les-05": {
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
  }`
);

// M. Fix mod-08-les-01 (_9x-mAHGgC4: covers ["AI attack surface overview"], remove prompt injection / mitigation claims)
enrichContent = enrichContent.replace(
  /"mod-08-les-01": \{[\s\S]*?youtubeId: "_9x-mAHGgC4",[\s\S]*?status: "ok",\s*\}/,
  `"mod-08-les-01": {
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
  }`
);

// N. Fix mod-08-les-04
enrichContent = enrichContent.replace(
  /"mod-08-les-04": \{[\s\S]*?youtubeId: "_9x-mAHGgC4",[\s\S]*?status: "ok",\s*\}/,
  `"mod-08-les-04": {
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
  }`
);

// O. Fix mod-09-les-02 (Education and tutoring) -> GxlOoKI0zxg
enrichContent = enrichContent.replace(
  /"mod-09-les-02": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-09-les-02": {
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
  }`
);

// P. Fix mod-09-les-03 (Business automation) -> QRgayVF5PyM
enrichContent = enrichContent.replace(
  /"mod-09-les-03": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-09-les-03": {
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
  }`
);

// Q. Fix mod-09-les-04 (Research assistance) -> U8zrqWrTYdc
enrichContent = enrichContent.replace(
  /"mod-09-les-04": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-09-les-04": {
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
  }`
);

// R. Fix mod-10-les-02 (Active prompting) -> wcmLgy1-9aQ
enrichContent = enrichContent.replace(
  /"mod-10-les-02": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-10-les-02": {
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
  }`
);

// S. Fix mod-10-les-04 (Expert prompting) -> g5h-piquf_k
enrichContent = enrichContent.replace(
  /"mod-10-les-04": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-10-les-04": {
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
  }`
);

// T. Fix mod-11-les-01 (eur8dUO9mvE remove agent loops)
enrichContent = enrichContent.replace(
  /"mod-11-les-01": \{[\s\S]*?youtubeId: "eur8dUO9mvE",[\s\S]*?status: "ok",\s*\}/,
  `"mod-11-les-01": {
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
  }`
);

// U. Fix mod-12-les-03 (Prompt versioning and regression tests) -> DNmIqNjbKoM
enrichContent = enrichContent.replace(
  /"mod-12-les-03": \{[\s\S]*?status: "slot",\s*\}/,
  `"mod-12-les-03": {
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
  }`
);

// V. Fix mod-12-les-04 (HdafI0t3sEY covers ["Caching"], remove "Guardrails")
enrichContent = enrichContent.replace(
  /"mod-12-les-04": \{[\s\S]*?youtubeId: "l5K4r_TJz_8",[\s\S]*?status: "ok",\s*\}/,
  `"mod-12-les-04": {
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
  }`
);

// W. Fix mod-12-les-05 (7xTGNNLPyMI covers ["Post-training and assistant models"], remove Bias, safety, governance)
enrichContent = enrichContent.replace(
  /"mod-12-les-05": \{[\s\S]*?youtubeId: "7xTGNNLPyMI",[\s\S]*?status: "ok",\s*\}/,
  `"mod-12-les-05": {
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
  }`
);

fs.writeFileSync(enrichPath, enrichContent, "utf-8");
console.log("Successfully updated scripts/enrich-curriculum.ts");
