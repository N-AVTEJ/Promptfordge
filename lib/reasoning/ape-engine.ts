/**
 * Automatic Prompt Engineer (APE) Engine (Zhou et al., 2022)
 *
 * Implements automated program synthesis of prompt instructions:
 * 1. Takes input-output demonstration pairs
 * 2. Generates candidate prompt hypotheses ("Proposal Generation")
 * 3. Evaluates each candidate prompt across validation test suites ("Monte Carlo Scoring")
 * 4. Ranks candidate instructions and selects the Pareto-optimal prompt
 */

import { ApeExperiment } from "./types";

export const APE_EDUCATIONAL_DISCLOSURE =
  "Educational Simulation: Automatic Prompt Engineer (APE) treats prompt design as a programmatic optimization problem. It uses an LLM to propose instruction hypotheses from demonstration pairs, scores each candidate across validation cases, and selects the optimal instruction without human trial-and-error.";

export const APE_EXPERIMENTS: ApeExperiment[] = [
  {
    id: "exp-json-extractor",
    taskTitle: "Robust JSON Entity Extraction",
    taskDescription:
      "Synthesize an optimal instruction that extracts user entity fields into compliant JSON without preamble markdown or trailing comments.",
    inputOutputDemos: [
      {
        input: "Customer Alex Taylor (alex@acme.corp) subscribed to Enterprise tier at $1,200/mo.",
        output: '{"name": "Alex Taylor", "email": "alex@acme.corp", "tier": "Enterprise", "mrr": 1200}',
      },
      {
        input: "Lead Brenda Vance, email bvance@startup.io, wants Starter tier for $49/mo.",
        output: '{"name": "Brenda Vance", "email": "bvance@startup.io", "tier": "Starter", "mrr": 49}',
      },
    ],
    testCases: [
      {
        id: "tc-1",
        input: "User David Chen, contact dchen@fintech.co, signed up for Growth plan at $299 monthly.",
        expectedOutput: '{"name": "David Chen", "email": "dchen@fintech.co", "tier": "Growth", "mrr": 299}',
      },
      {
        id: "tc-2",
        input: "Inquiry from Elena Rostova (elena.r@ai-labs.org). Selected Enterprise plan ($2500 per month).",
        expectedOutput: '{"name": "Elena Rostova", "email": "elena.r@ai-labs.org", "tier": "Enterprise", "mrr": 2500}',
      },
      {
        id: "tc-3",
        input: "Frank Miller, frank@logistics.net, upgraded to Premium at $750/mo with annual commitment.",
        expectedOutput: '{"name": "Frank Miller", "email": "frank@logistics.net", "tier": "Premium", "mrr": 750}',
      },
      {
        id: "tc-4",
        input: "Sarah Connor (sconnor@cyber.mil) on Free tier ($0/mo).",
        expectedOutput: '{"name": "Sarah Connor", "email": "sconnor@cyber.mil", "tier": "Free", "mrr": 0}',
      },
    ],
    educationalDisclosure: APE_EDUCATIONAL_DISCLOSURE,
    candidates: [
      {
        id: "ape-cand-1",
        instruction:
          "Extract the customer's name, email, tier, and mrr from the input text and format the output as a valid RFC 8259 JSON object with exactly those 4 keys. Output strictly raw JSON without markdown backticks or explanations.",
        generationStep: 1,
        testScores: [
          { caseId: "tc-1", score: 100, passed: true },
          { caseId: "tc-2", score: 100, passed: true },
          { caseId: "tc-3", score: 100, passed: true },
          { caseId: "tc-4", score: 100, passed: true },
        ],
        averageScore: 100,
        rank: 1,
        status: "top_candidate",
        rationale: "Explicitly names keys and schema, prohibits markdown wrappers, achieving 100% test pass rate.",
      },
      {
        id: "ape-cand-2",
        instruction:
          "Convert the following text into a JSON object containing name, email, tier, and mrr fields.",
        generationStep: 1,
        testScores: [
          { caseId: "tc-1", score: 95, passed: true },
          { caseId: "tc-2", score: 70, passed: false }, // Included markdown ```json
          { caseId: "tc-3", score: 95, passed: true },
          { caseId: "tc-4", score: 70, passed: false },
        ],
        averageScore: 82.5,
        rank: 2,
        status: "evaluated",
        rationale: "Concise but occasionally generates markdown code blocks that break downstream strict parsers.",
      },
      {
        id: "ape-cand-3",
        instruction:
          "You are a helpful assistant. Please read the customer details and give me their information in JSON format.",
        generationStep: 1,
        testScores: [
          { caseId: "tc-1", score: 50, passed: false }, // Preamble added
          { caseId: "tc-2", score: 55, passed: false },
          { caseId: "tc-3", score: 60, passed: false },
          { caseId: "tc-4", score: 45, passed: false },
        ],
        averageScore: 52.5,
        rank: 3,
        status: "eliminated",
        rationale: "Vague instructions result in conversational preambles ('Sure, here is your JSON:') that fail validation.",
      },
    ],
  },
  {
    id: "exp-sentiment-classifier",
    taskTitle: "Deterministic Sentiment & Nuance Tagger",
    taskDescription:
      "Synthesize an optimal instruction that classifies support tickets into POSITIVE, NEUTRAL, NEGATIVE, or URGENT_ESCALATION with 1-sentence root cause justification.",
    inputOutputDemos: [
      {
        input: "The dashboard is beautiful and fast, but my card was billed twice!",
        output: "Label: URGENT_ESCALATION\nReason: Billing discrepancy with double charge requires immediate financial remediation.",
      },
      {
        input: "I was wondering if dark mode is planned for the next quarterly release?",
        output: "Label: NEUTRAL\nReason: Routine feature inquiry without operational disruption.",
      },
    ],
    testCases: [
      {
        id: "tc-s1",
        input: "Our production webhook server crashed because of your unexpected SSL change!",
        expectedOutput: "Label: URGENT_ESCALATION\nReason: Production outage caused by vendor certificate update.",
      },
      {
        id: "tc-s2",
        input: "Thank you for the prompt resolution on ticket #4401! Great support team.",
        expectedOutput: "Label: POSITIVE\nReason: Customer expresses gratitude for timely issue resolution.",
      },
    ],
    educationalDisclosure: APE_EDUCATIONAL_DISCLOSURE,
    candidates: [
      {
        id: "ape-cand-s1",
        instruction:
          "Classify the sentiment of the user message into one of: POSITIVE, NEUTRAL, NEGATIVE, or URGENT_ESCALATION. Format output strictly as:\nLabel: <CATEGORY>\nReason: <ONE_SENTENCE_RATIONALE>",
        generationStep: 1,
        testScores: [
          { caseId: "tc-s1", score: 100, passed: true },
          { caseId: "tc-s2", score: 100, passed: true },
        ],
        averageScore: 100,
        rank: 1,
        status: "top_candidate",
        rationale: "Constrains exact category labels and two-line output structure, maximizing parser reliability.",
      },
      {
        id: "ape-cand-s2",
        instruction:
          "Tell me the sentiment of this support ticket and explain why.",
        generationStep: 1,
        testScores: [
          { caseId: "tc-s1", score: 65, passed: false },
          { caseId: "tc-s2", score: 70, passed: false },
        ],
        averageScore: 67.5,
        rank: 2,
        status: "eliminated",
        rationale: "Fails to enforce standard enum vocabulary or parseable output formatting.",
      },
    ],
  },
];

export function getApeExperiment(id?: string): ApeExperiment {
  if (!id) return APE_EXPERIMENTS[0];
  return APE_EXPERIMENTS.find((e) => e.id === id) || APE_EXPERIMENTS[0];
}
