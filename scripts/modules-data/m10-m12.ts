import type { CurriculumModule } from "./types";

export const M10_M12: CurriculumModule[] = [
  // ==========================================
  // MODULE 10: Advanced Prompt Engineering
  // ==========================================
  {
    id: "mod-10",
    number: 10,
    slug: "advanced-prompt-engineering",
    legacySlugs: ["production-readiness-and-lifecycle", "advanced-engineering"],
    title: "Advanced Prompt Engineering",
    subtitle: "Tree-of-Thoughts, ReAct, Active Prompting, and APE",
    description:
      "Master frontier reasoning paradigms including Tree-of-Thoughts (ToT), Reason + Act (ReAct) frameworks, Active Prompting, and Automatic Prompt Engineer (APE).",
    summary:
      "Explore non-linear reasoning architectures that transcend traditional single-turn generation. Master tree search over textual thought spaces (Tree-of-Thoughts), interleaved thought-action-observation loops (ReAct), uncertainty-weighted active prompting, and automated programmatic prompt generation via APE.",
    outcome:
      "Implement Tree-of-Thoughts search algorithms, construct autonomous ReAct reasoning loops, and automate prompt discovery using optimization frameworks.",
    duration: "70 mins",
    lessonCount: 5,
    videoCount: 2,
    level: "Specialized",
    tags: ["Tree-of-Thoughts", "ReAct", "Active Prompting", "APE", "Reasoning"],
    youtubeVideoId: "ut5kp56wW_4",
    accent: "amber",
    keyTakeaway:
      "Reasoning is not linear token generation; true problem solving requires branching search, deliberate backtracking, and continuous environmental observation.",
    keyConcepts: [
      "Tree-of-Thoughts (ToT) State Space Exploration",
      "ReAct (Reasoning + Acting) Interleaved Loops",
      "Active Prompting via Uncertainty Sampling",
      "Automatic Prompt Engineer (APE) Meta-Generation",
    ],
    practiceChallenge: {
      title: "ReAct Agent Loop Implementation",
      objective: "Author a complete ReAct cycle solving a multi-hop factual inquiry using Thought, Action, and Observation tokens.",
      instructions:
        "Draft the prompt trace demonstrating how the model decides to search, inspects results, and iterates toward the final answer.",
      starterPrompt:
        "Question: What is the elevation difference between the capital of Kenya and the capital of Colorado?\nThought 1: I need to find the capital of Kenya and its elevation.\nAction 1: search[\"Capital of Kenya elevation\"]\nObservation 1: Nairobi is Kenya's capital at an elevation of 1,795 m (5,889 ft).\nThought 2:",
      hint: "Show the model performing the second search for Denver, Colorado, and computing the arithmetic difference.",
      solutionNotes:
        "The model searches for Denver (1,609 m / 5,280 ft) and subtracts to yield 186 m (609 ft) difference.",
    },
    quiz: [
      {
        question: "How does Tree-of-Thoughts (ToT) fundamentally differ from standard Chain-of-Thought (CoT)?",
        options: [
          "ToT explores multiple reasoning branches simultaneously, evaluates candidate thoughts, and supports backtracking via search algorithms like BFS or DFS",
          "ToT is only used for forestry research",
          "ToT generates code exclusively in Python",
          "ToT eliminates the need for foundation models",
        ],
        answerIndex: 0,
        explanation: "ToT frames problem-solving as tree search, generating multiple next steps, evaluating state value, and backtracking when branches fail.",
      },
      {
        question: "What does the 'ReAct' framework stand for, and what is its core innovation?",
        options: [
          "Reasoning + Acting: interleaving internal reasoning traces with external tool actions and observation feedbacks",
          "React.js UI library integration",
          "Reactionary prompt engineering",
          "Real-time Automated Chat Typing",
        ],
        answerIndex: 0,
        explanation: "Yao et al. (2022) created ReAct to synergize reasoning ('Thought') with environmental interaction ('Action' and 'Observation').",
      },
      {
        question: "What is 'Active Prompting' (Diao et al., 2023)?",
        options: [
          "Identifying the most uncertain questions in a dataset (via entropy or disagreement) and prioritizing those specific examples for human exemplar annotation",
          "Running while typing prompts on a treadmill",
          "Sending prompts every 5 seconds continuously",
          "Using active verbs exclusively",
        ],
        answerIndex: 0,
        explanation: "Active prompting borrows from active learning, selecting questions where the model exhibits highest variance to build optimal few-shot pools.",
      },
      {
        question: "How does Automatic Prompt Engineer (APE, Zhou et al., 2022) discover optimal prompts?",
        options: [
          "An LLM generates multiple candidate instructions, evaluates them against a validation score, and iteratively mutates the best performers",
          "By employing 50 human prompt engineers",
          "By guessing random character sequences",
          "By brute-forcing dictionary words alphabetically",
        ],
        answerIndex: 0,
        explanation: "APE frames prompt optimization as programmatic natural language program synthesis, using LLMs to generate and grade candidate prompts.",
      },
      {
        question: "When is Tree-of-Thoughts search particularly justified despite its 10x+ token overhead?",
        options: [
          "On complex combinatorial puzzles, strategic planning, mathematical proofs, and multi-step deduction problems (e.g. Game of 24)",
          "For simple binary sentiment classification",
          "For translating 'Hello' to Spanish",
          "For writing customer support greetings",
        ],
        answerIndex: 0,
        explanation: "ToT's computational overhead is justified when problems require lookahead, heuristic evaluation, and systematic trial-and-error search.",
      },
    ],
    lessons: [
      {
        id: "mod-10-les-01",
        title: "Tree-of-Thoughts",
        youtubeId: "ut5kp56wW_4",
        status: "ok",
        videos: [
          {
            id: "ut5kp56wW_4",
            title: "Tree of Thoughts: Deliberate Problem Solving with Large Language Models (Full Paper Review)",
            channel: "Yannic Kilcher",
            minutes: 29,
            covers: ["Tree-of-Thoughts"],
            role: "core",
            status: "ok",
            source: "external",
          },
        ],
        chapters: [
          { time: 0, label: "Beyond Chain of Thought: State Space Search" },
          { time: 380, label: "Thought Generation, State Evaluation, and Heuristics" },
          { time: 760, label: "Breadth-First and Depth-First Search Implementations" },
        ],
        summary:
          "Explore Tree-of-Thoughts (ToT) prompting (Yao et al., 2023). Learn how to decompose complex tasks into discrete thought units, score intermediate state plausibility, and implement BFS/DFS search with backtracking.",
        keyConcepts: [
          "Thought Unit Decomposition",
          "State Evaluation & Self-Scoring Heuristics",
          "Tree Search Algorithms (BFS / DFS / Beam Search)",
        ],
        practiceChallenge: {
          title: "Tree-of-Thoughts Step-by-Step Solver",
          objective: "Implement a 3-branch ToT exploration for the Game of 24 using numbers [4, 6, 8, 9].",
          instructions:
            "Generate 3 candidate first operations, score each for promise (Sure / Maybe / Impossible), and prune dead branches.",
          starterPrompt:
            "Numbers: [4, 6, 8, 9]. Goal: 24.\nBranch 1: 9 - 6 = 3, remaining [4, 8, 3].\nBranch 2: 8 / 4 = 2, remaining [6, 9, 2].\nBranch 3: 9 + 4 = 13, remaining [6, 8, 13].\nEvaluate each branch.",
          hint: "Notice how Branch 2: $8/4=2$, then $2 \\times 9 = 18 + 6 = 24$ leads to success.",
        },
        quiz: [
          {
            question: "What was the landmark benchmark where Tree-of-Thoughts achieved 74% success compared to Chain-of-Thought's 4%?",
            options: [
              "The Game of 24 arithmetic puzzle",
              "Image classification on ImageNet",
              "English-to-French translation",
              "Spelling bee competitions",
            ],
            answerIndex: 0,
            explanation: "In the Game of 24, standard CoT failed catastrophically (4%), while ToT's lookahead and backtracking achieved 74% success.",
          },
          {
            question: "In the Tree-of-Thoughts architecture, what are the two distinct roles played by the LLM?",
            options: [
              "Thought Generator (proposing next steps) and State Evaluator (scoring candidate states)",
              "Client and Database",
              "Compiler and Linker",
              "Audio player and Video recorder",
            ],
            answerIndex: 0,
            explanation: "ToT prompts the model both to propose next prospective reasoning moves and to evaluate the viability of candidate states.",
          },
          {
            question: "Why does standard autoregressive Chain-of-Thought fail on combinatorial search problems?",
            options: [
              "Greedy left-to-right generation cannot backtrack if an early step leads into an unavoidable dead end",
              "The model runs out of numbers",
              "CUDA kernels do not support addition",
              "Tokens cannot represent equations",
            ],
            answerIndex: 0,
            explanation: "Once an erroneous token is generated in linear CoT, causal attention commits to it, unable to erase or backtrack.",
          },
          {
            question: "What is the token cost trade-off of running Tree-of-Thoughts with beam width $b=3$ and depth $d=4$?",
            options: [
              "Token consumption multiplies exponentially with search depth and branching factor",
              "Token cost is identical to zero-shot",
              "Token cost drops to zero",
              "ToT prompts are billed at half price",
            ],
            answerIndex: 0,
            explanation: "Evaluating dozens of candidate branches across multiple tree depths causes exponential growth in prompt invocations.",
          },
          {
            question: "How can state evaluations in ToT be formatted to simplify programmatic pruning?",
            options: [
              "Instruct the evaluator to output categorical tags: `sure`, `maybe`, or `impossible`",
              "Write poetic essays",
              "Generate random emojis",
              "Output numbers in roman numerals",
            ],
            answerIndex: 0,
            explanation: "Discrete categorical judgements allow search orchestrators to instantly discard `impossible` states and pursue `sure` ones.",
          },
        ],
        relatedLab: "/labs/reasoning",
        notesMarkdown:
          "### Tree-of-Thoughts (ToT)\n\nTree-of-Thoughts allows language models to engage in deliberate problem-solving. By generating, evaluating, and searching over diverse thought paths, models explore solution spaces with human-like deliberation.",
      },
      {
        id: "mod-10-les-02",
        title: "Active prompting",
        youtubeId: "",
        status: "slot",
        videos: [],
        chapters: [
          { time: 0, label: "Uncertainty Quantification in In-Context Learning" },
          { time: 240, label: "Disagreement Metrics and Output Entropy" },
          { time: 480, label: "Constructing Task-Adaptive Exemplar Pools" },
        ],
        summary:
          "Master Active Prompting techniques. Learn to calculate model prediction uncertainty, prioritize the most informative examples for few-shot curation, and dynamically construct task-adaptive prompts. (Video coming soon in next curriculum release).",
        keyConcepts: [
          "Uncertainty-Weighted Exemplar Selection",
          "Disagreement & Discrepancy Sampling",
          "Entropy-Based Task Prioritization",
        ],
        practiceChallenge: {
          title: "Uncertainty-Guided Few-Shot Selection",
          objective: "Identify which 3 questions in a candidate pool exhibit the highest disagreement across 5 stochastic runs and format them as few-shot exemplars.",
          instructions:
            "Design the scoring protocol to measure output variance across repeated samplings.",
          starterPrompt:
            "Sample 5 completions per query at temperature=0.8.\nIf all 5 agree -> Low uncertainty.\nIf answers diverge (2 vs 3) -> High uncertainty. Mark for exemplar curation.",
          hint: "Focusing manual annotation budget on high-uncertainty questions yields maximum accuracy gains.",
        },
        quiz: [
          {
            question: "What is the primary objective of Active Prompting (Diao et al.)?",
            options: [
              "To identify which specific training questions are most difficult or uncertain for the model, focusing exemplar annotation where it has the highest impact",
              "To prompt the model while exercising",
              "To reduce token generation time to zero",
              "To generate automated voice responses",
            ],
            answerIndex: 0,
            explanation: "Active prompting adapts few-shot learning by selecting exemplars from the questions where the model exhibits greatest uncertainty.",
          },
          {
            question: "How is 'uncertainty' typically quantified in Active Prompting without access to model log probabilities?",
            options: [
              "By sampling multiple outputs at temperature > 0 and calculating the disagreement rate (entropy) among the generated answers",
              "By asking the model 'Are you scared?'",
              "By measuring internet latency",
              "By checking GPU fan speed",
            ],
            answerIndex: 0,
            explanation: "High divergence across multiple stochastic generations indicates high predictive uncertainty for that query.",
          },
          {
            question: "Why is selecting arbitrary random examples for Few-Shot prompting sub-optimal?",
            options: [
              "Random examples often demonstrate trivial cases the model already knows, while failing to provide guidance on complex boundary edge cases",
              "Random examples crash the database",
              "Random examples violate copyright",
              "Random examples use too many vowels",
            ],
            answerIndex: 0,
            explanation: "Curating examples that target specific model confusion zones yields far higher marginal accuracy gains.",
          },
          {
            question: "In Active Prompting, what happens once the most uncertain questions are identified?",
            options: [
              "Human experts or frontier models generate annotated chain-of-thought demonstrations for them to use as new few-shot exemplars",
              "Those questions are permanently deleted from the database",
              "The model is prohibited from answering them",
              "The questions are translated into binary",
            ],
            answerIndex: 0,
            explanation: "Providing explicit reasoning steps for historically uncertain queries transforms them into high-value instructional anchors.",
          },
          {
            question: "What is the benefit of dynamically selecting active exemplars at runtime?",
            options: [
              "Prompts receive exemplars that are both semantically relevant and structurally instructive for the specific incoming query",
              "It makes the prompt free",
              "It requires zero API tokens",
              "It works without an internet connection",
            ],
            answerIndex: 0,
            explanation: "Dynamic retrieval ensures the prompt context is populated with the most informative exemplars for that exact challenge.",
          },
        ],
        relatedLab: "/labs/reasoning",
        notesMarkdown:
          "### Active Prompting\n\nActive Prompting applies active learning to prompt engineering. By diagnosing prediction uncertainty, engineers construct curated exemplar suites that directly remediate the model's blindspots.",
      },
      {
        id: "mod-10-les-03",
        title: "ReAct",
        youtubeId: "QX-p-vsDoiQ",
        status: "ok",
        videos: [
          {
            id: "QX-p-vsDoiQ",
            title: "Keys to Understanding ReAct: Synergizing Reasoning and Acting in Language Models",
            channel: "Arize AI",
            minutes: 48,
            covers: ["ReAct"],
            role: "core",
            status: "ok",
            source: "external",
          },
        ],
        chapters: [
          { time: 0, label: "The ReAct Architecture: Synergizing Reasoning & Action" },
          { time: 320, label: "Thought-Action-Observation Trajectories" },
          { time: 640, label: "Preventing Infinite Loops and Error Recovery" },
        ],
        summary:
          "Master the ReAct (Reason + Act) prompting framework. Understand how alternating verbal reasoning traces with environmental tool actions allows models to dynamically formulate plans, track state, and recover from errors.",
        keyConcepts: [
          "Thought, Action, Observation Trajectory Pattern",
          "Dynamic Plan Revision & State Tracking",
          "Loop Termination & Final Synthesis Guardrails",
        ],
        practiceChallenge: {
          title: "ReAct Financial Researcher Trace",
          objective: "Draft a 2-step ReAct prompt trace verifying quarterly EPS and revenue for an enterprise company.",
          instructions:
            "Format the trace explicitly with `Thought 1:`, `Action 1:`, `Observation 1:`, `Thought 2:`, and `Final Answer:`.",
          starterPrompt:
            "Question: Did Microsoft beat its consensus EPS estimate in Q4 2023?\nThought 1: I need to look up Microsoft's Q4 2023 reported EPS and the consensus estimate.",
          hint: "Ensure the action is formatted as a tool call (e.g. `search[\"MSFT Q4 2023 EPS reported vs consensus\"]`).",
        },
        quiz: [
          {
            question: "What problem does ReAct solve that pure Chain-of-Thought (CoT) and pure Tool Calling cannot solve alone?",
            options: [
              "CoT cannot interact with external environments, while pure tool calling lacks verbal reasoning to track plans and synthesize observations",
              "ReAct allows models to generate 3D graphics",
              "ReAct makes APIs run without network connections",
              "ReAct removes all token billing costs",
            ],
            answerIndex: 0,
            explanation: "ReAct combines internal reasoning ('Thought') with external world interaction ('Action'/'Observation'), overcoming the limitations of both.",
          },
          {
            question: "What are the three canonical steps in a ReAct loop cycle?",
            options: [
              "Thought, Action, Observation",
              "Input, Process, Output",
              "Download, Extract, Install",
              "Prompt, Wait, Response",
            ],
            answerIndex: 0,
            explanation: "The model articulates its reasoning in a Thought, emits a concrete Action, and pauses until the environment returns an Observation.",
          },
          {
            question: "How does a ReAct agent recover when a search tool returns zero results?",
            options: [
              "In the subsequent Thought step, the model observes the empty result and formulates an alternate query or tries a different tool",
              "It crashes the host computer",
              "It generates a fake answer immediately",
              "The API permanently bans the user",
            ],
            answerIndex: 0,
            explanation: "The interleaved reasoning step allows the model to analyze observation feedback and adapt its strategy dynamically.",
          },
          {
            question: "What is an 'infinite loop trap' in ReAct implementations?",
            options: [
              "The model repeating the exact same Thought and Action repeatedly because the observation does not satisfy its termination criteria",
              "A hardware defect in the RAM",
              "A loop that generates infinite money",
              "An internet cable tied in a circle",
            ],
            answerIndex: 0,
            explanation: "Without a maximum step cap or repetition penalty, agents can get stuck looping between identical failed actions.",
          },
          {
            question: "What guardrail must every production ReAct orchestrator enforce?",
            options: [
              "A hard cap on maximum iteration steps (e.g. max_steps = 10) to prevent runaway latency and infinite billing loops",
              "Requiring the user to approve every single letter generated",
              "Running the agent on a single thread only",
              "Disabling all system prompts",
            ],
            answerIndex: 0,
            explanation: "Enforcing hard step limits stops runaway execution when agents encounter dead ends or ambiguous queries.",
          },
        ],
        relatedLab: "/labs/reasoning",
        notesMarkdown:
          "### ReAct: Synergizing Reasoning and Acting\n\nReAct empowers language models to solve multi-hop real-world challenges. By combining linguistic reasoning with tool actions, agents inspect the world, evaluate feedback, and dynamically update plans.",
      },
      {
        id: "mod-10-les-04",
        title: "Expert prompting",
        youtubeId: "",
        status: "slot",
        videos: [],
        chapters: [
          { time: 0, label: "Multi-Persona Expert Ensembles in Single Prompts" },
          { time: 210, label: "Adversarial Multi-Disciplinary Panels" },
          { time: 420, label: "Synthesizing Consensus Across Disagreeing Experts" },
        ],
        summary:
          "Master Expert Prompting architectures. Learn how prompting an ensemble of diverse domain experts (e.g. Lawyer, Cryptographer, Product Manager) within a single session eliminates blindspots. (Video coming soon in next curriculum release).",
        keyConcepts: [
          "Multi-Expert Persona Panels",
          "Inter-Disciplinary Cross-Examination",
          "Consensus Synthesis Protocol",
        ],
        practiceChallenge: {
          title: "Enterprise Architecture Review Board Prompt",
          objective: "Simulate an architecture review board featuring a Security Engineer, a Cloud Cost Architect, and a Performance Engineer reviewing a proposed migration.",
          instructions:
            "Prompt each persona to evaluate the proposal from their domain perspective before delivering a joint synthesis.",
          starterPrompt:
            "Proposal: 'Migrate our Postgres database to fully serverless Aurora across 3 multi-region replicas.'\nSimulate review by:\n- Security Architect\n- FinOps Specialist\n- Database Reliability Engineer",
          hint: "Notice how FinOps highlights cost unpredictability while the DRE highlights cross-region latency.",
        },
        quiz: [
          {
            question: "What is 'Expert Prompting'?",
            options: [
              "Simulating a panel of specialized domain experts who independently analyze a problem before synthesizing a comprehensive consensus",
              "Hiring expensive human consultants to write prompts",
              "Using a prompt written by OpenAI executives",
              "Writing prompts in assembly code",
            ],
            answerIndex: 0,
            explanation: "Expert prompting leverages multi-disciplinary role specialization to analyze complex scenarios from divergent angles.",
          },
          {
            question: "Why does an expert panel prompt reveal risks that a generic 'Act as an engineer' prompt misses?",
            options: [
              "Different personas focus their attention on conflicting optimization priorities (e.g. Security vs Speed vs Cost), exposing hidden trade-offs",
              "Because expert prompts use 10x more electricity",
              "Because the model switches between different foundation models internally",
              "It does not; there is no difference",
            ],
            answerIndex: 0,
            explanation: "Specialized roles surface genuine real-world tensions and edge cases that a single generic persona overlooks.",
          },
          {
            question: "How should an expert prompting session conclude?",
            options: [
              "With an explicit Synthesis and Decision section reconciling the conflicting viewpoints into a concrete actionable recommendation",
              "With the experts arguing endlessly",
              "By deleting the prompt context",
              "By flipping a coin",
            ],
            answerIndex: 0,
            explanation: "A designated Moderator role reconciles conflicting recommendations into an actionable trade-off analysis.",
          },
          {
            question: "What is the token cost trade-off of simulating 4 separate experts in a single prompt?",
            options: [
              "Higher generation token count and increased latency as each persona emits their independent perspective",
              "No difference in token count",
              "The prompt runs 4x faster",
              "Tokens are billed at a wholesale discount",
            ],
            answerIndex: 0,
            explanation: "Multi-persona simulations generate substantially more text, increasing cost and inference time proportionally.",
          },
          {
            question: "When is Expert Prompting especially valuable?",
            options: [
              "For strategic architecture reviews, medical differential diagnoses, legal compliance audits, and high-stakes policy decisions",
              "For checking the weather",
              "For basic spelling correction",
              "For adding 2 + 2",
            ],
            answerIndex: 0,
            explanation: "High-stakes multi-dimensional decisions benefit enormously from adversarial multi-angle cross-examination.",
          },
        ],
        relatedLab: "/labs/reasoning",
        notesMarkdown:
          "### Expert Prompting\n\nSingle-perspective prompts produce one-dimensional answers. Expert Prompting simulates a collaborative review board of specialized personas, surfacing multi-faceted trade-offs and robust solutions.",
      },
      {
        id: "mod-10-les-05",
        title: "APE",
        youtubeId: "uDIW34h8cmM",
        status: "ok",
        videos: [
          {
            id: "uDIW34h8cmM",
            title: "Prompt Engineering Guide - From Beginner to Advanced",
            channel: "Matthew Berman",
            minutes: 20,
            covers: ["APE", "Expert prompting"],
            role: "core",
            status: "ok",
            source: "external",
            thumbnailUrl: "https://i.ytimg.com/vi/uDIW34h8cmM/hqdefault.jpg",
          },
        ],
        chapters: [
          { time: 0, label: "Automatic Prompt Generation & Exploration" },
          { time: 240, label: "Iterative Scoring & Candidate Selection" },
          { time: 510, label: "APE in Autonomous Agent Systems" },
          { time: 820, label: "Production Best Practices" },
        ],
        summary:
          "Explore Automatic Prompt Engineer (APE). Learn how to treat natural language prompts as programs to be synthesized, evaluated, and optimized automatically by foundation models using score-guided search.",
        keyConcepts: [
          "APE Program Synthesis Formulation",
          "Score-Guided Prompt Optimization",
          "Evolutionary Prompt Mutation & Selection",
        ],
        practiceChallenge: {
          title: "Build an Automated Prompt Improver Meta-Prompt",
          objective: "Construct an APE meta-prompt that takes an underperforming prompt and a failure log, generating 3 candidate improved prompts.",
          instructions:
            "Design the meta-prompt to analyze error logs and generate candidate variations with explicit hypothesis rationales.",
          starterPrompt:
            "You are an Automatic Prompt Engineer.\nBase Prompt: {{base_prompt}}\nObserved Failures: {{failures}}\nGenerate 3 optimized prompt variations and explain the hypothesis for each.",
          hint: "The meta-prompt should target the specific semantic ambiguity causing the failures.",
        },
        quiz: [
          {
            question: "What is the core premise of Automatic Prompt Engineer (APE, Zhou et al., 2022)?",
            options: [
              "LLMs can generate and optimize their own natural language instructions better and faster than human trial-and-error",
              "A robotic monkey that types prompts",
              "An automated tool that deletes user prompts",
              "A hardware chip designed exclusively for prompts",
            ],
            answerIndex: 0,
            explanation: "APE frames prompt engineering as program synthesis, using LLMs to automatically generate, score, and refine instructions.",
          },
          {
            question: "How does APE evaluate candidate prompt variants?",
            options: [
              "By running each candidate prompt against a validation dataset and calculating a quantitative task score (e.g. accuracy or F1)",
              "By asking the human author which prompt looks prettier",
              "By counting the number of letters in the prompt",
              "By measuring how loud the server fan runs",
            ],
            answerIndex: 0,
            explanation: "Candidate prompts are scored empirically against test sets, selecting variants that maximize the objective metric.",
          },
          {
            question: "What is 'Evolutionary Prompt Optimization'?",
            options: [
              "Using genetic algorithms: mutating high-scoring prompts, crossing over effective clauses, and selecting the fittest variants across generations",
              "Prompts that evolve over millions of years",
              "A prompt about Charles Darwin",
              "Changing the prompt font each week",
            ],
            answerIndex: 0,
            explanation: "Evolutionary techniques treat prompt clauses as genetic material, mutating and recombining successful instructions.",
          },
          {
            question: "Why do automatically generated APE prompts sometimes look counter-intuitive to human engineers?",
            options: [
              "Models find semantic and phrasing associations in high-dimensional latent space that humans would never think to combine",
              "Because the model made a spelling mistake",
              "Because APE prompts are written in Martian",
              "Because the GPU was overheated",
            ],
            answerIndex: 0,
            explanation: "Automated search discovers subtle token combinations that optimize attention activations regardless of human stylistic conventions.",
          },
          {
            question: "What is required before you can successfully run an APE optimization loop?",
            options: [
              "A representative evaluation dataset with ground-truth labels and a deterministic scoring function",
              "A supercomputer with 1,000 GPUs",
              "OpenAI's source code",
              "A physical laboratory",
            ],
            answerIndex: 0,
            explanation: "Without an objective scoring function and evaluation dataset, automated optimizers have no signal on whether variants improve quality.",
          },
        ],
        relatedLab: "/labs/reasoning",
        notesMarkdown:
          "### Automatic Prompt Engineer (APE)\n\nHuman prompt intuition has limits. APE automates prompt discovery by treating prompt generation as program synthesis, iteratively testing and refining instructions against quantitative benchmark metrics.",
      },
    ],
  },

  // ==========================================
  // MODULE 11: AI Agents, Context Engineering and MCP
  // ==========================================
  {
    id: "mod-11",
    number: 11,
    slug: "ai-agents-context-engineering-and-mcp",
    title: "AI Agents, Context Engineering and MCP",
    subtitle: "Agentic Loops, Context Windows, Memory, and Model Context Protocol",
    description:
      "Explore autonomous agent loops (plan, act, observe), context engineering vs prompt engineering, memory systems, Anthropic's Model Context Protocol (MCP), and Agentic RAG.",
    summary:
      "Transition from isolated prompts to autonomous agent systems and the Model Context Protocol (MCP). Learn how agent loops plan, act, and observe across dynamic environments, contrast traditional prompt writing with holistic context window engineering, and implement standardized MCP hosts, clients, and servers.",
    outcome:
      "Architect autonomous agentic workflows, design stateful memory architectures, connect tools via Model Context Protocol (MCP), and build resilient Agentic RAG pipelines.",
    duration: "75 mins",
    lessonCount: 5,
    videoCount: 4,
    level: "Specialized",
    tags: ["Agents", "MCP", "Context Engineering", "Memory", "Agentic RAG"],
    youtubeVideoId: "eur8dUO9mvE",
    accent: "amber",
    keyTakeaway:
      "Prompt engineering is writing the instruction; context engineering is curating the entire runtime environment, memory, tools, and protocols inside the context window.",
    keyConcepts: [
      "Agent Loops: Plan, Act, Observe, Re-evaluate",
      "Context Engineering vs Prompt Engineering",
      "Episodic, Semantic, and Working Memory Protocols",
      "Model Context Protocol (MCP) Architecture (Host, Client, Server)",
      "Agentic RAG with Dynamic Query Reformulation",
    ],
    practiceChallenge: {
      title: "Design an MCP Server Specification for GitHub",
      objective: "Define the JSON-RPC interface for an MCP Server exposing tools `read_issue`, `create_pull_request`, and resources `repo://file`.",
      instructions:
        "Draft the tool declaration schema adhering to the Model Context Protocol standard.",
      starterPrompt:
        "MCP Server Spec:\n{\n  \"tools\": [\n    {\n      \"name\": \"github_read_issue\",\n      \"description\": \"Read an issue by number\",\n      \"inputSchema\": { ... }\n    }\n  ]\n}",
      hint: "Follow Anthropic's Model Context Protocol open standard for inputSchema and tool registration.",
      solutionNotes:
        "The MCP client connects to the server over stdio or SSE, receiving standardized tool definitions.",
    },
    quiz: [
      {
        question: "What is the defining operational difference between a simple prompt completion and an 'AI Agent'?",
        options: [
          "An agent operates in a continuous loop: planning, executing actions via tools, observing environmental feedback, and adapting until a goal is achieved",
          "An agent is written in C++ while prompts are in English",
          "An agent runs without consuming any API tokens",
          "An agent is a humanoid robot",
        ],
        answerIndex: 0,
        explanation: "Agents possess autonomy: they break goals into plans, invoke tools, process observations, and self-correct across multi-step loops.",
      },
      {
        question: "How does 'Context Engineering' differ from traditional 'Prompt Engineering'?",
        options: [
          "Context engineering manages the entire dynamic lifecycle of the context window (retrieval, memory, tools, state pruning, caching) rather than just static words",
          "Context engineering only applies to computer hardware",
          "Context engineering is another name for typography",
          "There is no difference between them",
        ],
        answerIndex: 0,
        explanation: "Prompt engineering focuses on instruction phrasing; context engineering designs the dynamic information architecture feeding the model.",
      },
      {
        question: "What problem does the Model Context Protocol (MCP, open-sourced by Anthropic) solve?",
        options: [
          "It standardizes how applications (hosts) discover and connect AI models (clients) to secure data sources and tools (servers) via a single open protocol",
          "It is a new cryptocurrency for AI agents",
          "It replaces the HTTP protocol across the entire internet",
          "It forces all models to use the exact same weights",
        ],
        answerIndex: 0,
        explanation: "MCP provides a unified open standard for exposing tools, prompts, and resources to AI applications without custom bespoke SDK glue code.",
      },
      {
        question: "In the Model Context Protocol architecture, what are the three core roles?",
        options: [
          "Host (the application container), Client (the AI interface), and Server (the tool/resource provider)",
          "Browser, Modem, Router",
          "CPU, GPU, RAM",
          "User, Hacker, Admin",
        ],
        answerIndex: 0,
        explanation: "In MCP, a Host (like Claude Desktop or IDE) manages Clients that connect to specialized MCP Servers over stdio or SSE.",
      },
      {
        question: "What distinguishes 'Agentic RAG' from basic semantic search?",
        options: [
          "The agent can reformulate queries, retrieve across multiple databases, evaluate if retrieved documents are adequate, and take follow-up actions",
          "Agentic RAG uses only SQL queries",
          "Agentic RAG runs 1,000x faster than vector search",
          "Agentic RAG does not use embeddings",
        ],
        answerIndex: 0,
        explanation: "Agentic RAG introduces deliberate reflection into retrieval: evaluating relevance, reforming search terms, and synthesizing disparate sources.",
      },
    ],
    lessons: [
      {
        id: "mod-11-les-01",
        title: "Agent loops (plan, act, observe)",
        youtubeId: "kQmXtrmQ5Zg",
        status: "ok",
        videos: [
          {
            id: "kQmXtrmQ5Zg",
            title: "Building Agents with Model Context Protocol - Full Workshop with Mahesh Murag of Anthropic",
            channel: "AI Engineer",
            minutes: 78,
            covers: ["Agent loops (plan, act, observe)", "MCP (hosts, clients, servers)"],
            role: "core",
            status: "ok",
            source: "external",
          },
        ],
        chapters: [
          { time: 0, label: "The Autonomous Agent Loop Architecture" },
          { time: 600, label: "Planning, Tool Execution, and Observation Feedback" },
          { time: 1800, label: "Handling State Accumulation and Graceful Termination" },
        ],
        summary:
          "Deconstruct autonomous agent loops. Learn how agents decompose user objectives into executable task graphs, invoke external tools, process environmental observations, and adapt plans until completion.",
        keyConcepts: [
          "Plan-Act-Observe-Reflect Cycle",
          "Task Graph Decomposition",
          "Autonomous Stopping Conditions & Timeouts",
        ],
        practiceChallenge: {
          title: "Multi-Step Research Agent Loop Trace",
          objective: "Simulate a complete 3-iteration agent loop investigating a database migration error.",
          instructions:
            "Format the loop clearly showing: Plan -> Action -> Observation -> Revised Plan -> Final Resolution.",
          starterPrompt:
            "Goal: Resolve migration failure on table `users`.\nStep 1 Plan: Inspect migration logs.\nAction: exec[\"cat /var/log/migration.log\"]\nObservation: Error: column 'uuid' cannot be null.",
          hint: "The agent should plan a schema fix (adding a default or backfilling nulls) in Step 2.",
        },
        quiz: [
          {
            question: "What is the primary role of the 'Plan' step in an autonomous agent loop?",
            options: [
              "Decomposing a complex user goal into an ordered sequence of sub-tasks and determining which tool to invoke first",
              "Displaying a loading animation on the screen",
              "Calculating how much to bill the user",
              "Shutting down the server when idle",
            ],
            answerIndex: 0,
            explanation: "Planning provides high-level navigational strategy, breaking compound objectives into actionable tool invocations.",
          },
          {
            question: "What happens during the 'Observe' step of the agent cycle?",
            options: [
              "The agent ingests the structured output or error message returned by the executed tool and adds it to the context window",
              "The agent turns on the user's webcam",
              "The agent looks at the computer screen physically",
              "The agent sends an email to the developer",
            ],
            answerIndex: 0,
            explanation: "Observation feeds external environmental reality back into the model's working memory for subsequent reasoning.",
          },
          {
            question: "What prevents an autonomous agent from running forever in an infinite loop?",
            options: [
              "Programmatic safeguards: maximum step limits, timeout budgets, and repetition loop detectors",
              "The model gets tired and falls asleep",
              "The computer runs out of numbers",
              "Agents are incapable of looping",
            ],
            answerIndex: 0,
            explanation: "External orchestration wrappers enforce strict maximum iteration caps and timeout guardrails.",
          },
          {
            question: "What is 'Replanning' in agent architecture?",
            options: [
              "Dynamically modifying the remaining task list when an unexpected error or new discovery occurs during execution",
              "Restarting the computer from scratch",
              "Writing a new business plan",
              "Deleting the user prompt",
            ],
            answerIndex: 0,
            explanation: "Replanning adapts the agent's strategy based on unexpected observations, avoiding dead ends.",
          },
          {
            question: "Why should autonomous agent actions with high real-world impact require confirmation gates?",
            options: [
              "To prevent accidental data deletion, financial loss, or unauthorized messages caused by hallucinated or misaligned agent actions",
              "Because AI actions are illegal without human signatures",
              "To make the agent run faster",
              "To save disk storage space",
            ],
            answerIndex: 0,
            explanation: "Human-in-the-loop oversight prevents autonomous misfires on irreversible or safety-critical operations.",
          },
        ],
        relatedLab: "/workflow",
        notesMarkdown:
          "### Agent Loops (Plan, Act, Observe)\n\nAutonomous agents transcend single-turn prompting. By looping through planning, tool execution, and environmental observation, agents solve complex, multi-step real-world objectives.",
      },
      {
        id: "mod-11-les-02",
        title: "Context windows and context engineering vs prompt engineering",
        youtubeId: "vD0E3EUb8-8",
        status: "ok",
        videos: [
          {
            id: "vD0E3EUb8-8",
            title: "Context Engineering vs. Prompt Engineering: Smarter AI with RAG & Agents",
            channel: "IBM Technology",
            minutes: 6,
            covers: ["Context windows and context engineering vs prompt engineering"],
            role: "core",
            status: "ok",
            source: "external",
            thumbnailUrl: "https://i.ytimg.com/vi/vD0E3EUb8-8/hqdefault.jpg",
          },
        ],
        chapters: [
          { time: 0, label: "What the Model Sees vs How You Ask" },
          { time: 90, label: "Context Rot & The Lost in the Middle Problem" },
          { time: 195, label: "Dynamic Context Windows: RAG & Tool State" },
          { time: 280, label: "Context Engineering Architecture for Agents" },
        ],
        summary:
          "Understand the paradigm shift from Prompt Engineering to Context Engineering. Learn how to architect, optimize, cache, and prune the holistic context window across multi-session agent workflows.",
        keyConcepts: [
          "Holistic Context Architecture",
          "KV-Cache Friendly Context Layouts",
          "Information Density & Attention Budget Management",
        ],
        practiceChallenge: {
          title: "Design a KV-Cache Optimized Context Layout",
          objective: "Structure a prompt containing static system instructions, reusable company policy, and dynamic user query to maximize prompt caching hits.",
          instructions:
            "Place unchanging tokens at the start and dynamic user tokens at the end, explaining the KV-cache reuse mechanics.",
          starterPrompt:
            "# [CACHE TIER 1: STATIC SYSTEM RULES - 2,000 tokens]\n...\n# [CACHE TIER 2: REUSABLE CORPUS - 10,000 tokens]\n...\n# [DYNAMIC TIER: USER QUERY - 150 tokens]\n...",
          hint: "Any modification to early tokens invalidates all downstream KV cache entries.",
        },
        quiz: [
          {
            question: "Why does Context Engineering represent an evolution beyond simple Prompt Engineering?",
            options: [
              "Context engineering treats the context window as a dynamic memory hierarchy, managing retrieval, pruning, and caching rather than just wording instructions",
              "Context engineering requires writing in machine code",
              "Prompt engineering has been deprecated and no longer works",
              "Context engineering only applies to 1-billion parameter models",
            ],
            answerIndex: 0,
            explanation: "Context engineering focuses on the entire information architecture: what enters the window, when it gets evicted, and how it is cached.",
          },
          {
            question: "How does KV-cache prefix caching affect context engineering strategy?",
            options: [
              "Developers must place static, reusable text at the exact start of the prompt so identical token prefixes can be reused from GPU memory without re-computation",
              "Developers must change the beginning of the prompt on every request",
              "It requires using random timestamps at line 1",
              "Prefix caching has no effect on prompt design",
            ],
            answerIndex: 0,
            explanation: "Prefix caching only hits when the token sequence from index 0 is strictly identical; dynamic tokens must be placed at the end.",
          },
          {
            question: "What is the consequence of stuffing a 1-million-token context window with uncurated raw documents?",
            options: [
              "Attention dilution, degraded needle-in-a-haystack recall, high per-call cost, and massive latency spikes",
              "The model becomes 100% accurate on everything",
              "The context window shrinks automatically",
              "It deletes the GPU driver",
            ],
            answerIndex: 0,
            explanation: "Large context windows are not free: excessive noise degrades retrieval precision and inflates generation latency.",
          },
          {
            question: "What is 'Semantic Compression' in context engineering?",
            options: [
              "Summarizing or pruning verbose reference text into dense factual representations to preserve attention budget and reduce token costs",
              "Compressing text with GZIP before sending it to the API",
              "Deleting all vowels from the prompt",
              "Converting sentences into abbreviations",
            ],
            answerIndex: 0,
            explanation: "Semantic compression maximizes the informational density per token, ensuring every token in context contributes to task performance.",
          },
          {
            question: "When should an item be evicted from an agent's active context window?",
            options: [
              "When its task is completed, its relevance to future reasoning steps is near-zero, and it can be archived to external storage",
              "Never; all tokens must be kept forever",
              "After exactly 3 seconds",
              "Whenever the user types a question mark",
            ],
            answerIndex: 0,
            explanation: "Active eviction keeps the working context lean, reducing cost and preventing distraction from resolved tasks.",
          },
        ],
        relatedLab: "/workflow",
        notesMarkdown:
          "### Context Engineering vs Prompt Engineering\n\nPrompt engineering asks: 'What words should I use?' Context engineering asks: 'What information should enter the context window, how should it be structured, what can be cached, and what must be evicted?'",
      },
      {
        id: "mod-11-les-03",
        title: "Memory and tool protocols",
        youtubeId: "7j1t3UZA1TY",
        status: "ok",
        videos: [
          {
            id: "7j1t3UZA1TY",
            title: "MCP vs API: Simplifying AI Agent Integration with External Data",
            channel: "IBM Technology",
            minutes: 7,
            covers: ["MCP (hosts, clients, servers)", "Memory and tool protocols"],
            role: "core",
            status: "ok",
            source: "external",
          },
          {
            id: "eur8dUO9mvE",
            title: "What is MCP? Integrate AI Agents with Databases & APIs",
            channel: "IBM Technology",
            minutes: 4,
            covers: ["MCP (hosts, clients, servers)", "Memory and tool protocols"],
            role: "optional",
            status: "ok",
            source: "external",
          },
        ],
        chapters: [
          { time: 0, label: "Memory Taxonomies: Working, Episodic, Semantic" },
          { time: 220, label: "Tool Protocols & Standardized Interfaces" },
          { time: 430, label: "State Synchronization and Session Restorations" },
        ],
        summary:
          "Master memory systems and tool protocols for AI agents. Understand the difference between short-term working memory, episodic conversation logs, and semantic knowledge stores, and how standardized protocols streamline tool execution.",
        keyConcepts: [
          "Memory Taxonomy: Working vs Episodic vs Semantic",
          "Standardized Tool Protocols",
          "State Persistence & Entity Extraction",
        ],
        practiceChallenge: {
          title: "Entity Memory Extraction Schema",
          objective: "Design a memory extraction prompt that identifies long-term user preferences (e.g. dietary restrictions, tech stack) from conversational chat turns.",
          instructions:
            "Extract new preferences into an external memory JSON schema for storage in a user profile database.",
          starterPrompt:
            "User: 'I am building a React 18 dashboard and I am strictly vegan, by the way.'\nExtract Memory Entities JSON:",
          hint: "The output should yield entities: `{ \"tech_stack\": [\"React 18\"], \"dietary\": [\"vegan\"] }`.",
        },
        quiz: [
          {
            question: "What is 'Episodic Memory' in an AI agent architecture?",
            options: [
              "A chronological record of past conversation sessions, interactions, and events stored in an external database",
              "A television series about AI",
              "The RAM inside the GPU",
              "The pretraining weights of the model",
            ],
            answerIndex: 0,
            explanation: "Episodic memory captures historical events and past user interactions, allowing the agent to recall past conversations.",
          },
          {
            question: "What is 'Semantic Memory' in an AI agent?",
            options: [
              "Structured knowledge graphs or vector stores capturing timeless facts, rules, and world concepts independent of specific conversation episodes",
              "The dictionary inside the tokenizer",
              "The spelling of words",
              "The user's password",
            ],
            answerIndex: 0,
            explanation: "Semantic memory stores general facts and structured entities that remain true across multiple sessions.",
          },
          {
            question: "Why do agents need a standardized Tool Protocol rather than ad-hoc custom JSON wrappers for every tool?",
            options: [
              "Standard protocols enable interchangeable plug-and-play tools across different models, hosting frameworks, and third-party services",
              "Because custom JSON is illegal",
              "To increase latency",
              "Standard protocols run without computers",
            ],
            answerIndex: 0,
            explanation: "Standardized protocols (like MCP) eliminate the need to write custom client-server glue code for every new tool.",
          },
          {
            question: "How does an agent prevent memory retrieval from injecting outdated or contradictory information?",
            options: [
              "By storing timestamps and validity metadata with each memory record, allowing the agent to favor newer facts over superseded ones",
              "By deleting all memories every 5 minutes",
              "By guessing which memory is real",
              "By ignoring memory entirely",
            ],
            answerIndex: 0,
            explanation: "Temporal tagging and entity versioning ensure that updated preferences override stale historical memories.",
          },
          {
            question: "What is 'Working Memory' in an LLM agent?",
            options: [
              "The active tokens currently residing inside the context window during the ongoing inference pass",
              "The hard drive swap space",
              "The user's brain",
              "A physical notepad on the developer's desk",
            ],
            answerIndex: 0,
            explanation: "Working memory is the immediate scratchpad space available within the active context window for the current execution step.",
          },
        ],
        relatedLab: "/workflow",
        notesMarkdown:
          "### Memory and Tool Protocols\n\nAgents without memory are amnesiacs. By separating working memory (context window), episodic memory (interaction history), and semantic memory (knowledge graphs), agents deliver persistent, personalized utility.",
      },
      {
        id: "mod-11-les-04",
        title: "MCP (hosts, clients, servers)",
        youtubeId: "eur8dUO9mvE",
        status: "ok",
        videos: [
          {
            id: "eur8dUO9mvE",
            title: "What is MCP? Integrate AI Agents with Databases & APIs",
            channel: "IBM Technology",
            minutes: 4,
            covers: ["MCP (hosts, clients, servers)", "Memory and tool protocols"],
            role: "core",
            status: "ok",
            source: "external",
          },
          {
            id: "7j1t3UZA1TY",
            title: "MCP vs API: Simplifying AI Agent Integration with External Data",
            channel: "IBM Technology",
            minutes: 7,
            covers: ["MCP (hosts, clients, servers)", "Memory and tool protocols"],
            role: "optional",
            status: "ok",
            source: "external",
          },
        ],
        chapters: [
          { time: 0, label: "The Model Context Protocol (MCP) Open Standard" },
          { time: 130, label: "Hosts, Clients, and Servers Explained" },
          { time: 260, label: "JSON-RPC Transports: Stdio vs Server-Sent Events (SSE)" },
        ],
        summary:
          "Master Anthropic's Model Context Protocol (MCP). Learn the roles of Hosts, Clients, and Servers, examine JSON-RPC message formats over stdio and SSE transports, and author reusable MCP tools.",
        keyConcepts: [
          "MCP Architecture (Host, Client, Server)",
          "JSON-RPC 2.0 Message Protocols",
          "Stdio vs SSE Transport Layers",
          "Resources, Prompts, and Tools Primitives",
        ],
        practiceChallenge: {
          title: "Build a Minimal MCP Tool Definition",
          objective: "Author an MCP server tool declaration for a local filesystem search tool `find_files_by_extension`.",
          instructions:
            "Format the tool declaration with name, description, and JSON Schema `inputSchema`.",
          starterPrompt:
            "{\n  \"name\": \"find_files_by_extension\",\n  \"description\": \"Search directory for files matching extension (e.g. .ts, .py)\",\n  \"inputSchema\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"directory\": { \"type\": \"string\" },\n      \"extension\": { \"type\": \"string\" }\n    },\n    \"required\": [\"directory\", \"extension\"]\n  }\n}",
          hint: "Ensure the JSON schema conforms to standard JSON Schema Draft 7 specifications.",
        },
        quiz: [
          {
            question: "In the Model Context Protocol (MCP), what is an 'MCP Server'?",
            options: [
              "A lightweight process that exposes specific capabilities (tools, resources, prompt templates) to an AI host application",
              "A central mainframe owned by Anthropic",
              "A web server hosting HTML websites",
              "A DNS root name server",
            ],
            answerIndex: 0,
            explanation: "An MCP Server is a service (local or remote) exposing tools and data resources to MCP clients via a standardized protocol.",
          },
          {
            question: "What are the three fundamental primitives exposed by an MCP Server?",
            options: [
              "Resources (read-only data), Prompts (parameterized templates), and Tools (executable functions)",
              "HTML, CSS, and JavaScript",
              "GET, POST, and DELETE",
              "Users, Groups, and Permissions",
            ],
            answerIndex: 0,
            explanation: "MCP formalizes three primitives: Resources (documents/data), Prompts (prompt templates), and Tools (callable functions).",
          },
          {
            question: "Which transport protocol is standard for local MCP servers running on the user's desktop machine?",
            options: [
              "Standard input/output (`stdio`) streaming JSON-RPC messages",
              "Bluetooth wireless transfer",
              "FTP file uploads",
              "Infrared data transfer",
            ],
            answerIndex: 0,
            explanation: "Local MCP servers communicate with the host process via standard I/O (`stdio`), providing fast, secure local inter-process communication.",
          },
          {
            question: "What transport protocol is used when connecting to a remote cloud-hosted MCP Server?",
            options: [
              "Server-Sent Events (SSE) over HTTP with POST endpoints for message delivery",
              "Sending paper letters via post",
              "Dial-up modem connections",
              "Telnet on port 23",
            ],
            answerIndex: 0,
            explanation: "Remote MCP servers utilize Server-Sent Events (SSE) for server-to-client streaming paired with HTTP POST for client requests.",
          },
          {
            question: "What is an 'MCP Host' application?",
            options: [
              "The end-user software (such as Claude Desktop, Zed, or VS Code) that orchestrates LLMs and connects to one or more MCP servers",
              "The internet service provider",
              "A computer monitor manufacturer",
              "A server cooling fan",
            ],
            answerIndex: 0,
            explanation: "The MCP Host is the client application that discovers servers, negotiates capabilities, and provides tools to the model.",
          },
        ],
        relatedLab: "/workflow",
        notesMarkdown:
          "### Model Context Protocol (MCP)\n\nMCP establishes an open standard for AI extensibility. By decoupling AI applications (hosts) from tool providers (servers) via JSON-RPC, developers build tool integrations once that work across all compliant AI environments.",
      },
      {
        id: "mod-11-les-05",
        title: "Agentic RAG",
        youtubeId: "Yq29bZ8Hlrc",
        status: "ok",
        videos: [
          {
            id: "Yq29bZ8Hlrc",
            title: "Optimize RAG with AI Agents & Vector Databases",
            channel: "IBM Technology",
            minutes: 33,
            covers: ["Agentic RAG"],
            role: "core",
            status: "ok",
            source: "external",
          },
          {
            id: "0z9_MhcYvcY",
            title: "What is Agentic RAG?",
            channel: "IBM Technology",
            minutes: 10,
            covers: ["Retrieval Augmented Generation", "Plug-in tool integration"],
            role: "optional",
            status: "ok",
            source: "external",
          },
        ],
        chapters: [
          { time: 0, label: "From Static RAG Pipelines to Agentic Retrieval" },
          { time: 600, label: "Query Routing, Sub-Query Decomposition, and Fallbacks" },
          { time: 1400, label: "Self-Correction & Relevance Verification" },
        ],
        summary:
          "Build autonomous Agentic RAG pipelines. Learn how agents perform query reformulation, sub-query decomposition across multiple indices, document relevance verification, and iterative retrieval.",
        keyConcepts: [
          "Dynamic Query Reformulation",
          "Sub-Query Decomposition & Multi-Index Routing",
          "Self-RAG Relevance Self-Verification",
        ],
        practiceChallenge: {
          title: "Multi-Index Routing Agent Prompt",
          objective: "Create an agent routing prompt that inspects a user question and routes to either: Vector Knowledge Base, SQL Analytics DB, or Live Web Search.",
          instructions:
            "Define the routing decision criteria and output target index as structured JSON.",
          starterPrompt:
            "Query: 'What were our gross revenues last month and how does our competitor's new product launch affect our Q4 projections?'\nDecompose into sub-queries and assign index target to each.",
          hint: "Sub-query 1 targets SQL Analytics DB (internal revenue); Sub-query 2 targets Live Web Search (competitor news).",
        },
        quiz: [
          {
            question: "Why does Agentic RAG outperform traditional single-shot RAG on complex multi-part questions?",
            options: [
              "It can break compound questions into independent sub-queries, query distinct databases, and combine findings iteratively",
              "It runs without consuming any API tokens",
              "It deletes older documents automatically",
              "It only searches for exact keyword matches",
            ],
            answerIndex: 0,
            explanation: "Agentic RAG decomposes complex questions and executes targeted searches across disparate databases before synthesizing.",
          },
          {
            question: "What is 'Self-RAG' (Asai et al., 2023)?",
            options: [
              "A framework where the model generates special reflection tokens to decide when to retrieve, evaluate retrieved document relevance, and verify answer faithfulness",
              "A model that only reads its own training data",
              "A RAG system running on a smartwatch",
              "An automated database backup system",
            ],
            answerIndex: 0,
            explanation: "Self-RAG dynamically self-evaluates: deciding if retrieval is necessary, if retrieved text is relevant, and if output is faithful.",
          },
          {
            question: "What action does an Agentic RAG system take if the first vector search returns documents with low similarity scores?",
            options: [
              "It rewrites the search query with synonyms or alternative phrasing and executes a secondary search",
              "It returns a blank screen",
              "It fabricates an answer anyway",
              "It logs the user out",
            ],
            answerIndex: 0,
            explanation: "Agentic reasoning loops reformulate search queries dynamically when initial retrieval quality is poor.",
          },
          {
            question: "What is 'Corrective RAG' (CRAG)?",
            options: [
              "A retrieval architecture that evaluates document confidence, augmenting with public web search if internal documents are insufficient or contradictory",
              "A grammar checker for RAG documents",
              "A software tool that corrects misspelled SQL queries",
              "A legal copyright compliance filter",
            ],
            answerIndex: 0,
            explanation: "CRAG introduces an external fallback branch (such as web search) whenever internal knowledge retrieval confidence falls below threshold.",
          },
          {
            question: "What is the primary operational trade-off of Agentic RAG compared to naive RAG?",
            options: [
              "Higher end-to-end latency and increased token usage due to iterative reasoning steps and multiple retrieval round-trips",
              "Lower factual accuracy",
              "Incompatibility with modern vector databases",
              "Requirement for specialized analog hardware",
            ],
            answerIndex: 0,
            explanation: "Iterative query expansion and self-reflection loops require multiple LLM calls, accumulating latency and token costs.",
          },
        ],
        relatedLab: "/workflow",
        notesMarkdown:
          "### Agentic RAG\n\nStatic RAG pipelines fail when queries are ambiguous or multi-faceted. Agentic RAG introduces autonomy: evaluating retrieved documents, reformulating queries, and coordinating multi-hop information synthesis.",
      },
    ],
  },

  // ==========================================
  // MODULE 12: Production Prompt Engineering and Responsible AI
  // ==========================================
  {
    id: "mod-12",
    number: 12,
    slug: "production-prompt-engineering-and-responsible-ai",
    title: "Production Prompt Engineering and Responsible AI",
    subtitle: "Architectural Trade-offs, Governance, Guardrails, and Operational Scaling",
    description:
      "Master production deployment: Prompting vs RAG vs Fine-Tuning trade-offs, LLM-as-a-judge pipelines, regression testing, cost/caching guardrails, and AI bias/governance.",
    summary:
      "Bridge the final gap between experimental prototypes and robust enterprise production. Learn to navigate the architectural trade-offs between prompting, RAG, and fine-tuning, implement automated LLM-as-a-judge regression suites, deploy low-latency prompt caching and cost guardrails, and audit systems for demographic bias, safety compliance, and responsible AI governance.",
    outcome:
      "Evaluate architectural trade-offs between prompting, RAG, and fine-tuning, establish CI/CD prompt regression pipelines, optimize production caching and cost controls, and implement responsible AI governance guardrails.",
    duration: "65 mins",
    lessonCount: 5,
    videoCount: 3,
    level: "Specialized",
    tags: ["Production", "RAG vs Fine-Tuning", "LLM-as-a-Judge", "Guardrails", "Responsible AI"],
    youtubeVideoId: "HdafI0t3sEY",
    accent: "cyan",
    keyTakeaway:
      "Enterprise prompt engineering is 10% wording and 90% systems engineering: caching, regression gates, cost controls, and ethical governance.",
    keyConcepts: [
      "Prompting vs RAG vs Fine-Tuning Decision Matrix",
      "Production LLM-as-a-Judge Continuous Auditing",
      "CI/CD Prompt Versioning & Automated Regression Testing",
      "Cost, Latency, and Prefix Caching Architecture",
      "Algorithmic Bias, Safety Guardrails, and AI Governance",
    ],
    practiceChallenge: {
      title: "Production CI/CD Prompt Regression Suite",
      objective: "Author a GitHub Actions / CI test specification that runs a 20-case prompt eval suite, blocking deployment if accuracy regresses below 95%.",
      instructions:
        "Draft the test runner script verifying JSON schema conformity, latency budgets (< 1.5s), and judge faithfulness scores.",
      starterPrompt:
        "describe('Production Prompt Gate', () => {\n  test('must pass 95% threshold on golden dataset', async () => {\n    // Run eval runner\n  });\n});",
      hint: "Integrate automated judge assertions that fail the build if regressions are detected.",
      solutionNotes:
        "The automated CI gate catches subtle edge-case degradations before prompts are merged to main.",
    },
    quiz: [
      {
        question: "When should an enterprise choose Fine-Tuning over Prompting or RAG?",
        options: [
          "When you need to permanently instill a highly specific, idiosyncratic style, syntax, or vocabulary that is expensive or impossible to convey in context",
          "When you need the model to know what happened five minutes ago",
          "When you want to save money on initial engineering time",
          "Fine-tuning is always superior in every situation",
        ],
        answerIndex: 0,
        explanation: "Fine-tuning excels at teaching form, tone, and domain syntax; RAG is required for dynamic, frequently changing factual knowledge.",
      },
      {
        question: "What is 'Semantic Drift' in production prompt management?",
        options: [
          "When a provider updates model weights behind an API alias (e.g. `gpt-4o`), causing existing prompts to behave differently or regress",
          "When words change their meaning over 500 years",
          "When the prompt moves slowly across the screen",
          "A hardware failure in the network router",
        ],
        answerIndex: 0,
        explanation: "Upstream model weight updates can alter token sensitivities, breaking previously verified prompt behaviors without code changes.",
      },
      {
        question: "How does prefix caching reduce production costs in multi-tenant SaaS applications?",
        options: [
          "By sharing common system prompts and documentation prefixes across thousands of users, incurring cache read rates at 10-20% of standard input pricing",
          "By making the model run on consumer laptops",
          "By eliminating all server electricity",
          "Prefix caching has no impact on cost",
        ],
        answerIndex: 0,
        explanation: "Shared static prefixes hit server GPU cache, reducing input billing rates by up to 80-90% for repeated tokens.",
      },
      {
        question: "What is the primary risk of 'Algorithmic Sycophancy' in production customer-facing assistants?",
        options: [
          "The model uncritically validating false or dangerous user claims simply to agree with the user's emotional framing",
          "The model speaking in an angry voice",
          "The model refusing to answer questions",
          "The model generating random poetry",
        ],
        answerIndex: 0,
        explanation: "Sycophancy causes models to agree with misconceptions, failing to correct users on critical medical, legal, or financial facts.",
      },
      {
        question: "What constitutes a 'Hard Stop' cost guardrail in production LLM gateways?",
        options: [
          "An automated threshold that cuts off API execution when a daily token budget or monetary spend ceiling is reached, preventing runaway bills",
          "A physical stop button on the server rack",
          "A popup asking the user if they are sure",
          "A polite email sent at the end of the month",
        ],
        answerIndex: 0,
        explanation: "Hard stop budget guards enforce automated circuit breaking to prevent infinite agent loops or DDoS attacks from bankrupting projects.",
      },
    ],
    lessons: [
      {
        id: "mod-12-les-01",
        title: "Prompting vs RAG vs fine-tuning",
        youtubeId: "0A4zaEuRmig",
        status: "ok",
        videos: [
          {
            id: "0A4zaEuRmig",
            title: "Prompt vs RAG vs Fine-Tuning — What’s the Difference?",
            channel: "Analytics Vidhya",
            minutes: 12,
            covers: ["Prompting vs RAG vs fine-tuning"],
            role: "core",
            status: "ok",
            source: "external",
            thumbnailUrl: "https://i.ytimg.com/vi/0A4zaEuRmig/hqdefault.jpg",
          },
          {
            id: "HdafI0t3sEY",
            title: "RAG vs. CAG: Solving Knowledge Gaps in AI Models",
            channel: "IBM Technology",
            minutes: 9,
            covers: ["Prompting vs RAG vs fine-tuning", "Guardrails, cost, latency, caching"],
            role: "core",
            status: "ok",
            source: "external",
            thumbnailUrl: "https://i.ytimg.com/vi/HdafI0t3sEY/hqdefault.jpg",
          },
          {
            id: "o9jz04bIW0E",
            title: "LLM Fine Tuning Tutorial (Free Labs)",
            channel: "KodeKloud",
            minutes: 24,
            covers: ["Prompting vs RAG vs fine-tuning"],
            role: "optional",
            status: "ok",
            source: "external",
            thumbnailUrl: "https://i.ytimg.com/vi/o9jz04bIW0E/hqdefault.jpg",
          },
          {
            id: "7xTGNNLPyMI",
            title: "Deep Dive into LLMs like ChatGPT",
            channel: "Andrej Karpathy",
            minutes: 211,
            covers: ["Prompting vs RAG vs fine-tuning", "Bias, safety, governance"],
            role: "optional",
            status: "ok",
            source: "external",
            thumbnailUrl: "https://i.ytimg.com/vi/7xTGNNLPyMI/hqdefault.jpg",
          },
        ],
        chapters: [
          { time: 0, label: "The Triad: Prompting vs RAG vs Fine-Tuning" },
          { time: 180, label: "When to Prompt: Zero-Shot to Few-Shot" },
          { time: 390, label: "When to RAG: Dynamic External Knowledge" },
          { time: 580, label: "When to Fine-Tune: Form, Style, and Syntax Adaptation" },
        ],
        summary:
          "Master the architectural decision matrix between Prompt Engineering, Retrieval-Augmented Generation, and Supervised Fine-Tuning. Learn when to use in-context prompting, when to index external data, and when to fine-tune weights.",
        keyConcepts: [
          "The Triad Decision Matrix (Prompting, RAG, Fine-Tuning)",
          "Form vs Knowledge Specialization",
          "Total Cost of Ownership (TCO) Comparison",
        ],
        practiceChallenge: {
          title: "Architecture Selection Matrix Exercise",
          objective: "Analyze three enterprise scenarios and prescribe the optimal architectural solution (Prompting, RAG, or Fine-Tuning) with cost rationale.",
          instructions:
            "Scenario A: Company handbook Q&A (updates monthly). Scenario B: Specialized SQL dialect generation. Scenario C: Quick customer email categorization.",
          starterPrompt:
            "Prescribe architecture for Scenarios A, B, and C with trade-off justification.",
          hint: "Scenario A = RAG (dynamic knowledge); Scenario B = Fine-Tuning (specialized syntax); Scenario C = Zero/Few-Shot Prompting.",
        },
        quiz: [
          {
            question: "Why is Fine-Tuning poorly suited for keeping an LLM updated with dynamic, rapidly changing company news?",
            options: [
              "Fine-tuning requires retraining weights with high compute costs and latency, whereas RAG updates instantly by modifying database records",
              "Fine-tuned models cannot read English",
              "Fine-tuning deletes the model's vocabulary",
              "Fine-tuning is only permitted for academic universities",
            ],
            answerIndex: 0,
            explanation: "Weights are static snapshots. Keeping knowledge fresh via fine-tuning is economically and operationally impractical compared to RAG.",
          },
          {
            question: "When is Prompt Engineering alone (without RAG or Fine-Tuning) the correct choice?",
            options: [
              "When standard model general intelligence suffices, data volume fits within the context window, and time-to-market is the primary objective",
              "When you have no internet access",
              "When you want to train a new model from scratch",
              "Never; prompting is obsolete",
            ],
            answerIndex: 0,
            explanation: "Prompt engineering requires zero infrastructure overhead, enabling rapid prototyping and deployment for standard tasks.",
          },
          {
            question: "What is 'Form vs Knowledge' in the fine-tuning vs RAG debate?",
            options: [
              "Fine-tuning excels at teaching *form* (style, structure, tone, syntax), while RAG excels at providing *knowledge* (facts, documents, data)",
              "Form means the size of the computer; knowledge means the software",
              "Form is for images; knowledge is for text",
              "There is no conceptual difference",
            ],
            answerIndex: 0,
            explanation: "Fine-tuning shapes behavioral form and syntax; RAG supplies factual ground truth.",
          },
          {
            question: "What is the primary advantage of combining RAG with a fine-tuned model (Hybrid)?",
            options: [
              "The model is fine-tuned to follow strict citation syntax and internal domain jargon, while RAG injects fresh factual context",
              "It cuts server electricity consumption to zero",
              "It guarantees 100% free API calls",
              "It runs in the browser without WebAssembly",
            ],
            answerIndex: 0,
            explanation: "Hybrid architectures pair fine-tuned structural discipline with RAG's dynamic factual precision.",
          },
          {
            question: "Which option has the lowest initial engineering cost and fastest time-to-market?",
            options: [
              "Few-shot prompt engineering",
              "Full parameter pretraining",
              "Supervised fine-tuning with RLHF",
              "Custom vector database infrastructure",
            ],
            answerIndex: 0,
            explanation: "In-context prompt engineering can be authored and tested in minutes without training runs or database setup.",
          },
        ],
        relatedLab: "/labs/optimize",
        notesMarkdown:
          "### Prompting vs RAG vs Fine-Tuning\n\n- **Prompting**: Fast, zero-infrastructure steering of general capabilities.\n- **RAG**: Dynamic injection of private, frequently changing knowledge.\n- **Fine-Tuning**: Deep conditioning of style, syntax, and specialized behavioral form.",
      },
      {
        id: "mod-12-les-02",
        title: "LLM-as-judge in production",
        youtubeId: "vBJF2sy1Pyw",
        status: "ok",
        videos: [
          {
            id: "vBJF2sy1Pyw",
            title: "The challenges in using LLM-as-a-Judge - Sourabh Agrawal | Vector Space Talk #013",
            channel: "Qdrant Vector Search",
            minutes: 42,
            covers: ["Measuring response quality", "Performance evaluation", "LLM-as-judge in production"],
            role: "core",
            status: "ok",
            source: "external",
          },
        ],
        chapters: [
          { time: 0, label: "Production Judge Pipelines and Asynchronous Auditing" },
          { time: 260, label: "Mitigating Judge Biases (Position, Verbosity, Self-Enhancement)" },
          { time: 520, label: "Cost-Effective Judge Sampling (Shadow Traffic)" },
        ],
        summary:
          "Deploy LLM-as-a-judge evaluators in live production systems. Learn how to audit live production traffic asynchronously, detect performance degradation in shadow deployments, and mitigate evaluator biases.",
        keyConcepts: [
          "Asynchronous Production Quality Auditing",
          "Shadow Traffic Evaluation",
          "Judge Bias Mitigation (Position Swapping)",
        ],
        practiceChallenge: {
          title: "Pairwise Judge with Position Swap",
          objective: "Implement a double-evaluator script that runs A/B comparison twice with swapped positions to eliminate position bias.",
          instructions:
            "Design the logic: Evaluate (A, B) -> Evaluate (B, A). Declare a winner only if consistent in both directions.",
          starterPrompt:
            "Eval 1: Model 1 = Candidate A, Model 2 = Candidate B.\nEval 2: Model 1 = Candidate B, Model 2 = Candidate A.\nIf winners conflict -> Mark TIE.",
          hint: "Position swapping is the gold standard for unbiased pairwise LLM evaluations.",
        },
        quiz: [
          {
            question: "Why should LLM-as-a-judge evaluation run asynchronously (out-of-band) in production?",
            options: [
              "Evaluating responses synchronously in the critical path would double user-facing latency and create unnecessary blocking",
              "Because judge models are not allowed to run in real time",
              "Synchronous judging causes database locks",
              "Asynchronous judging is free of charge",
            ],
            answerIndex: 0,
            explanation: "Running judges out-of-band (e.g. via background queues) audits production quality without degrading user response times.",
          },
          {
            question: "What is 'Self-Enhancement Bias' in LLM judges?",
            options: [
              "The tendency of an LLM judge to give higher scores to responses generated by its own model family (e.g. GPT-4 favoring GPT-4 outputs)",
              "The judge model giving itself a high tip",
              "The model attempting to upgrade its own hardware",
              "A model refusing to judge other models",
            ],
            answerIndex: 0,
            explanation: "Models recognize stylistic quirks of their own pretraining distribution, subtly favoring their own generations.",
          },
          {
            question: "What is 'Shadow Evaluation' in production deployments?",
            options: [
              "Sending copies of live production traffic to a candidate prompt in the background and evaluating results without serving them to users",
              "Evaluating prompts in a dark room",
              "Hiding evaluation metrics from developers",
              "Evaluating prompts without electricity",
            ],
            answerIndex: 0,
            explanation: "Shadow evaluation safely tests candidate prompts on real production traffic before flipping user-facing routing flags.",
          },
          {
            question: "How can you make LLM-as-a-judge scores interpretable and actionable?",
            options: [
              "Require the judge prompt to output structured rationales referencing explicit rubric criteria before outputting the numeric score",
              "Output only a single number without any text",
              "Display the score in binary",
              "Have the judge model output emojis only",
            ],
            answerIndex: 0,
            explanation: "Detailed reasoning strings allow developers to debug why an output received a failing score and address the root cause.",
          },
          {
            question: "What percentage of production traffic is typically sampled for judge auditing to control costs?",
            options: [
              "1% to 5% of production traffic, scaled up during anomalies or canary rollouts",
              "100% of all requests always",
              "Zero percent",
              "Only traffic generated between 2 AM and 3 AM",
            ],
            answerIndex: 0,
            explanation: "Sampling a statistical subset provides representative quality metrics while capping secondary evaluation token costs.",
          },
        ],
        relatedLab: "/labs/optimize",
        notesMarkdown:
          "### LLM-as-a-Judge in Production\n\nAutomated judging transforms production monitoring from lagging user complaints to proactive real-time alerting. Auditing shadow traffic with unbiased rubrics ensures quality at scale.",
      },
      {
        id: "mod-12-les-03",
        title: "Prompt versioning and regression tests",
        youtubeId: "",
        status: "slot",
        videos: [],
        chapters: [
          { time: 0, label: "Treating Prompts as Code: GitOps for LLMs" },
          { time: 240, label: "Automated Regression Test Suites in CI/CD" },
          { time: 480, label: "Canary Deployments and Rollback Protocols" },
        ],
        summary:
          "Implement prompt versioning and continuous integration (CI/CD) regression testing. Learn to version prompts in Git, run automated regression gates on pull requests, and orchestrate canary rollouts. (Video coming soon in next curriculum release).",
        keyConcepts: [
          "GitOps Prompt Versioning",
          "CI/CD Regression Gates on Pull Requests",
          "Canary Deployments & Automated Rollback",
        ],
        practiceChallenge: {
          title: "Prompt Regression Test Harness",
          objective: "Write a test runner script in TypeScript/Jest that evaluates a candidate prompt against 10 critical edge cases.",
          instructions:
            "Assert that all 10 edge cases pass without syntax errors or hallucination flags before exiting 0.",
          starterPrompt:
            "const testCases = [ ... ];\nfor (const tc of testCases) {\n  const res = await runPrompt(candidatePrompt, tc.input);\n  assert(tc.validator(res));\n}",
          hint: "Failing tests should emit a non-zero exit code to block deployment in CI.",
        },
        quiz: [
          {
            question: "Why should production prompts be committed to version control (Git) rather than stored only in web playground dashboards?",
            options: [
              "Git provides audit history, diff tracking, peer review via pull requests, and automated testing via CI/CD pipelines",
              "Playgrounds are illegal under enterprise law",
              "Git makes prompts run 5x faster",
              "Prompts cannot be edited outside Git",
            ],
            answerIndex: 0,
            explanation: "Storing prompts as code integrates prompt development into existing engineering workflows, testing, and reviews.",
          },
          {
            question: "What is a 'Prompt Regression'?",
            options: [
              "When an edit designed to fix one failure mode unintentionally breaks previously functional behaviors on other inputs",
              "When a prompt forgets how to speak English",
              "When a prompt becomes shorter",
              "When the model refuses to answer",
            ],
            answerIndex: 0,
            explanation: "Regressions are hidden side-effects of prompt changes that degrade performance on established happy paths.",
          },
          {
            question: "How should a CI/CD pipeline validate a pull request modifying a system prompt?",
            options: [
              "Automatically execute an evaluation runner against the golden benchmark dataset and block merging if accuracy drops below threshold",
              "Automatically merge without testing",
              "Email the CEO for manual approval",
              "Delete the pull request",
            ],
            answerIndex: 0,
            explanation: "Automated CI gates run regression batteries, verifying that improvements in one area haven't degraded general quality.",
          },
          {
            question: "What is a 'Canary Rollout' for prompts?",
            options: [
              "Routing 5% of live users to the new prompt version while monitoring error rates before expanding to 100% of traffic",
              "A prompt featuring yellow branding",
              "Testing prompts on birds",
              "Deploying code on weekends only",
            ],
            answerIndex: 0,
            explanation: "Canaries limit blast radius by exposing only a small slice of live traffic to new changes, rolling back if errors rise.",
          },
          {
            question: "What artifact should be generated alongside every prompt version in production?",
            options: [
              "A cryptographic commit hash paired with the exact benchmark evaluation score card achieved at deployment",
              "A printed paper manual",
              "An MP3 audio recording",
              "A screenshot of the desktop",
            ],
            answerIndex: 0,
            explanation: "Pairing code commits with evaluation scorecards establishes an immutable historical record of quality.",
          },
        ],
        relatedLab: "/labs/optimize",
        notesMarkdown:
          "### Prompt Versioning and Regression Tests\n\nProduction prompts are software artifacts. Integrating prompts into GitOps workflows with automated regression gates ensures that deployments are safe, reproducible, and verifiable.",
      },
      {
        id: "mod-12-les-04",
        title: "Guardrails, cost, latency, caching",
        youtubeId: "HdafI0t3sEY",
        status: "ok",
        videos: [
          {
            id: "HdafI0t3sEY",
            title: "RAG vs. CAG: Solving Knowledge Gaps in AI Models",
            channel: "IBM Technology",
            minutes: 9,
            covers: ["Prompting vs RAG vs fine-tuning", "Guardrails, cost, latency, caching"],
            role: "core",
            status: "ok",
            source: "external",
          },
        ],
        chapters: [
          { time: 0, label: "Operational Guardrails: Rate Limits, Budgets, Circuit Breakers" },
          { time: 270, label: "Prefix Caching Mechanics & KV-Cache Economics" },
          { time: 540, label: "Streaming Latency and Memory Footprints" },
        ],
        summary:
          "Master operational guardrails, cost controls, latency optimization, and prompt caching. Learn to construct rate-limiting gateways, daily token hard stops, and KV-cache architectures that slash operating costs by 80%.",
        keyConcepts: [
          "Rate Limiting & Daily Token Budget Hard Stops",
          "Prefix Caching & KV-Cache Reusability",
          "Streaming Latency & TTFT Optimization",
        ],
        practiceChallenge: {
          title: "Multi-Tier Rate Limiting & Budget Circuit Breaker",
          objective: "Implement a gateway guard that enforces 20 runs/hour per IP and a global $50/day hard budget cap.",
          instructions:
            "Draft the guard logic checking IP sliding window count and cumulative daily token expenditure.",
          starterPrompt:
            "function guardRequest(ip, estimatedTokens) {\n  // Check rate limit: 20/hr\n  // Check global daily budget\n}",
          hint: "Throw descriptive 429 Too Many Requests errors when thresholds are exceeded.",
        },
        quiz: [
          {
            question: "How does 'Prompt Caching' (KV-Cache reuse) drastically reduce operating expenses in high-volume applications?",
            options: [
              "When consecutive requests share an identical prompt prefix, the provider reuses pre-computed attention keys/values, billing cached tokens at an 80-90% discount",
              "By caching user passwords",
              "By storing web pages on a local hard drive",
              "By turning off the AI model after 5 PM",
            ],
            answerIndex: 0,
            explanation: "Reusing pre-computed KV attention states saves server GPU compute, which providers pass on as major pricing discounts.",
          },
          {
            question: "What is a 'Circuit Breaker' pattern in production LLM gateways?",
            options: [
              "An automated mechanism that temporarily halts upstream LLM calls when error rates or spending velocity exceed predefined thresholds",
              "A physical electrical fuse in the wall",
              "A tool for formatting code",
              "A method for breaking encryption keys",
            ],
            answerIndex: 0,
            explanation: "Circuit breakers protect downstream systems and company budgets when upstream APIs suffer outages or runaway loops.",
          },
          {
            question: "Why should production user interfaces always utilize streaming completions (`stream: true`)?",
            options: [
              "Streaming dramatically lowers perceived latency by rendering the first tokens to the user in milliseconds rather than waiting seconds for full completion",
              "Streaming is free of charge",
              "Streaming uses less electricity",
              "Streaming prevents all spelling errors",
            ],
            answerIndex: 0,
            explanation: "Streaming outputs tokens as they are generated, improving user experience by minimizing Time to First Token (TTFT).",
          },
          {
            question: "What is 'Semantic Caching' as opposed to exact prefix caching?",
            options: [
              "Returning cached completions for new user queries that are semantically identical (high vector similarity) to previously answered queries",
              "Caching dictionary definitions",
              "Storing emojis in browser memory",
              "A browser plugin for Google Chrome",
            ],
            answerIndex: 0,
            explanation: "Semantic caching checks vector similarity: if a new query means the same as an old one, it serves the cached response with zero LLM compute.",
          },
          {
            question: "What parameter in API requests prevents a compromised or looping prompt from generating infinite output tokens?",
            options: [
              "`max_tokens` (or `max_completion_tokens`)",
              "`temperature`",
              "`user_id`",
              "`model_name`",
            ],
            answerIndex: 0,
            explanation: "Setting a conservative `max_tokens` cap stops runaway generation from exhausting budgets.",
          },
        ],
        relatedLab: "/labs/optimize",
        notesMarkdown:
          "### Guardrails, Cost, Latency, and Caching\n\nOperational engineering is the backbone of production AI. Implementing strict rate limits, daily hard stops, semantic caching, and prefix reuse ensures reliability and cost sustainability.",
      },
      {
        id: "mod-12-les-05",
        title: "Bias, safety, governance",
        youtubeId: "7xTGNNLPyMI",
        status: "ok",
        videos: [
          {
            id: "7xTGNNLPyMI",
            title: "Deep Dive into LLMs like ChatGPT",
            channel: "Andrej Karpathy",
            minutes: 211,
            covers: ["Prompting vs RAG vs fine-tuning", "Bias, safety, governance"],
            role: "core",
            status: "ok",
            source: "external",
          },
        ],
        chapters: [
          { time: 0, label: "Algorithmic Bias in Pre-trained Foundation Models" },
          { time: 600, label: "Toxicity Filtering, Red-Teaming, and Alignment" },
          { time: 2400, label: "Responsible AI Governance & Regulatory Compliance" },
        ],
        summary:
          "Master responsible AI principles, demographic bias mitigation, and safety governance. Learn to audit model outputs for demographic skew, implement ethical alignment guardrails, and comply with emerging AI regulations.",
        keyConcepts: [
          "Demographic & Representation Bias Auditing",
          "Constitutional AI & Safety Guardrails",
          "Regulatory Governance & Transparency Compliance",
        ],
        practiceChallenge: {
          title: "Auditing Demographic Fairness in Recruiting Prompts",
          objective: "Audit a resume-screening prompt to ensure decisions are based strictly on demonstrable qualifications without bias regarding applicant names or universities.",
          instructions:
            "Design an anonymized screening template that redacts demographic indicators before evaluation.",
          starterPrompt:
            "System: Evaluate applicant suitability based strictly on listed technical competencies in `<resume>`. Do not factor in gender, ethnicity, age, or graduation year.",
          hint: "Pre-processing resumes to redact identifying metadata provides the strongest anti-bias guarantee.",
        },
        quiz: [
          {
            question: "Why do foundation models inherit cultural, gender, and demographic biases?",
            options: [
              "Because pre-training corpora reflect historical human text from the public internet, containing societal stereotypes and demographic imbalances",
              "Because software engineers intentionally program bias into the code",
              "Because GPUs have intrinsic political preferences",
              "Bias does not exist in language models",
            ],
            answerIndex: 0,
            explanation: "Models compress web-scale text; pre-existing societal prejudices and historical skews are encoded in latent statistical representations.",
          },
          {
            question: "What is 'Constitutional AI' (Anthropic, Bai et al., 2022)?",
            options: [
              "A training methodology where AI models critique and align their own responses against a set of written constitutional principles of safety and helpfulness",
              "An AI system that writes legal constitutions for nations",
              "A model trained only on Supreme Court documents",
              "A political campaign tool",
            ],
            answerIndex: 0,
            explanation: "Constitutional AI uses written principles to steer self-critique and reinforcement learning, producing harmless assistants at scale.",
          },
          {
            question: "What is the primary objective of regulatory frameworks like the EU AI Act regarding generative AI systems?",
            options: [
              "Ensuring transparency, copyright compliance, safety risk categorization, and preventing algorithmic discrimination in high-stakes domains",
              "Banning all computers in Europe",
              "Making AI models open-source by force",
              "Taxing every generated token",
            ],
            answerIndex: 0,
            explanation: "Regulations enforce transparency, risk categorization, copyright governance, and nondiscrimination safeguards.",
          },
          {
            question: "How can prompt engineers mitigate stereotyping in open-ended generation (e.g. generating descriptions of doctors vs nurses)?",
            options: [
              "By explicitly instructing the model to maintain balanced representation across gender, background, and cultural diversity in examples",
              "By telling the model to be nice",
              "By avoiding all mention of people",
              "By writing prompts in all caps",
            ],
            answerIndex: 0,
            explanation: "Explicit counter-stereotypical framing and diversity instructions guide models away from majority historical priors.",
          },
          {
            question: "What is 'Model Transparency and Watermarking' in responsible AI?",
            options: [
              "Disclosing AI involvement to users and embedding subtle statistical or cryptographic signatures in generated text or media to verify provenance",
              "Placing a physical sticker on the monitor",
              "Printing a watermark on paper invoices",
              "A tool for downloading videos",
            ],
            answerIndex: 0,
            explanation: "Transparency ensures users know when they are interacting with AI, and watermarking tracks synthetic media provenance.",
          },
        ],
        relatedLab: "/labs/optimize",
        notesMarkdown:
          "### Bias, Safety, and Governance\n\nAI without governance is a liability. Responsible prompt engineering audits for demographic fairness, implements safety boundaries, and complies with legal and ethical standards.",
      },
    ],
  },
];
