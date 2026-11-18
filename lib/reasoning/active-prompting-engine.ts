/**
 * Active Prompting Reasoning Engine (Diao et al., 2023)
 *
 * Implements uncertainty estimation via disagreement sampling:
 * 1. Queries the model multiple times with temperature > 0
 * 2. Quantifies disagreement (entropy/variance) across sampled reasoning paths
 * 3. Identifies highest-uncertainty instances requiring expert demonstration
 * 4. Injects curated chain-of-thought exemplars to boost reasoning accuracy
 */

import { ActivePromptSuite } from "./types";

export const ACTIVE_PROMPTING_DISCLOSURE =
  "Educational Simulation: Active Prompting identifies reasoning ambiguity by sampling multiple stochastic outputs and calculating normalized answer variance. In production pipelines, high-disagreement items trigger human-in-the-loop few-shot curation.";

export const ACTIVE_PROMPTING_SUITES: ActivePromptSuite[] = [
  {
    id: "suite-multi-hop-logic",
    title: "Multi-Hop Symbolic & Arithmetic Logic",
    domain: "Mathematical & Causal Reasoning",
    educationalDisclosure: ACTIVE_PROMPTING_DISCLOSURE,
    samples: [
      {
        id: "sample-01",
        question:
          "A server cluster has 4 nodes. Node A has 32GB RAM, Node B has half of Node A, Node C has 8GB more than Node B, and Node D has the average of Nodes A, B, and C. If Node B fails, what percentage of the remaining total RAM is Node D?",
        sampledAnswers: [
          "Draft 1: Node D has 24GB. Total remaining = 32 + 24 + 24 = 80GB. 24 / 80 = 30%.",
          "Draft 2: Node D has 20GB. Total remaining = 32 + 24 + 20 = 76GB. 20 / 76 = 26.3%.",
          "Draft 3: Node D has 24GB. Total remaining = 32 + 24 = 56GB without D. 24 / 80 = 30%.",
          "Draft 4: Node D = (32 + 16 + 24) / 3 = 24GB. Nodes left: A(32), C(24), D(24). Sum = 80GB. 24/80 = 30.0%.",
        ],
        disagreementScore: 0.82,
        uncertaintyLevel: "high",
        curatedExemplar:
          "Step 1: Compute Node A = 32GB.\nStep 2: Node B = 32 / 2 = 16GB.\nStep 3: Node C = 16 + 8 = 24GB.\nStep 4: Node D = (32 + 16 + 24) / 3 = 72 / 3 = 24GB.\nStep 5: Node B fails -> Remaining nodes are A (32GB), C (24GB), D (24GB).\nStep 6: Total remaining = 32 + 24 + 24 = 80GB.\nStep 7: Node D percentage = 24 / 80 = 0.30 = 30.0%.",
        accuracyWithoutActive: 38,
        accuracyWithActive: 94,
      },
      {
        id: "sample-02",
        question:
          "In an ACID database running Snapshot Isolation, Transaction 1 reads balance $100 and deposits $50. Transaction 2 concurrently reads balance $100 and withdraws $80. Does a write-skew anomaly or serializability conflict occur under standard PostgreSQL isolation levels?",
        sampledAnswers: [
          "Draft 1: A serialization error (40001) is thrown because concurrent updates conflict.",
          "Draft 2: Under Repeatable Read, write-skew can occur if constraints span multiple rows, but here both touch the same row so first-committer wins with 40001.",
          "Draft 3: Both transactions succeed and balance becomes $70 because updates commute.",
          "Draft 4: Transaction 2 blocks until Transaction 1 commits, then re-evaluates under Read Committed.",
        ],
        disagreementScore: 0.74,
        uncertaintyLevel: "high",
        curatedExemplar:
          "Step 1: Identify isolation level: PostgreSQL 'Repeatable Read' implements Snapshot Isolation (not strict SSI).\nStep 2: Check target row: Both transactions update the *same* single balance row.\nStep 3: First-committer-wins rule: Whichever transaction attempts to UPDATE first locks the tuple.\nStep 4: Concurrent conflict: When the second transaction attempts its UPDATE on an already-modified tuple, PostgreSQL aborts it with SQLSTATE 40001 (could not serialize access due to concurrent update).\nConclusion: First transaction commits; second transaction fails with a serialization error.",
        accuracyWithoutActive: 44,
        accuracyWithActive: 91,
      },
      {
        id: "sample-03",
        question:
          "Convert UTC timestamp '2026-03-29T01:30:00Z' to London local time (Europe/London), considering UK Daylight Saving Time transition rules for 2026.",
        sampledAnswers: [
          "Draft 1: London is BST (UTC+1) starting 1:00 AM UTC on last Sunday of March, so it is 02:30 BST.",
          "Draft 2: London is UTC+0 (GMT) because DST starts at 2:00 AM local time.",
          "Draft 3: 02:30:00 BST (+1 hour offset).",
          "Draft 4: 02:30 BST (clocks forward at 01:00 UTC).",
        ],
        disagreementScore: 0.35,
        uncertaintyLevel: "medium",
        curatedExemplar:
          "Step 1: Check EU/UK DST rule: Clocks spring forward 1 hour at 01:00 UTC on the last Sunday of March.\nStep 2: 2026-03-29 is the last Sunday of March 2026.\nStep 3: At 01:00 UTC, the time shifts to BST (UTC+1).\nStep 4: 01:30:00 UTC + 1 hour = 02:30:00 BST.",
        accuracyWithoutActive: 68,
        accuracyWithActive: 98,
      },
      {
        id: "sample-04",
        question:
          "What is the time complexity of searching an element in a balanced binary search tree with N nodes?",
        sampledAnswers: [
          "Draft 1: O(log N) because the search space is halved at each tree depth level.",
          "Draft 2: O(log N) worst and average case in a balanced AVL or Red-Black tree.",
          "Draft 3: O(log N).",
          "Draft 4: O(log N) logarithmic time.",
        ],
        disagreementScore: 0.05,
        uncertaintyLevel: "low",
        curatedExemplar:
          "Step 1: Balanced BST height is strictly bounded by O(log N).\nStep 2: At each step, comparing the target value eliminates half the subtree.\nStep 3: Maximum path length from root to leaf is O(log N).\nConclusion: Time complexity is O(log N).",
        accuracyWithoutActive: 96,
        accuracyWithActive: 99,
      },
    ],
  },
  {
    id: "suite-api-security",
    title: "Zero-Trust & API Security Gateways",
    domain: "Cloud Security Architecture",
    educationalDisclosure: ACTIVE_PROMPTING_DISCLOSURE,
    samples: [
      {
        id: "sample-sec-01",
        question:
          "A microservice parses an incoming JWT containing {'alg': 'none', 'sub': 'admin'}. The server uses a standard HMAC verification library. Why might a security bypass occur if the verification routine does not enforce explicit algorithm whitelist checking?",
        sampledAnswers: [
          "Draft 1: The 'none' algorithm causes the signature verification to skip cryptographic validation.",
          "Draft 2: The server throws a cryptographic decoding exception automatically in all modern JWT specs.",
          "Draft 3: If the library accepts 'none', an attacker can sign with an empty signature and gain administrative access.",
          "Draft 4: Key confusion attack where the public key is treated as an HMAC secret.",
        ],
        disagreementScore: 0.79,
        uncertaintyLevel: "high",
        curatedExemplar:
          "Step 1: JWT RFC 7518 specifies an algorithm named 'none' intended for unsecured tokens.\nStep 2: Vulnerable libraries check header['alg'] dynamically without checking an allowed algorithms whitelist.\nStep 3: If an attacker specifies 'alg': 'none' and omits the signature, permissive libraries validate the token without checking against any secret key.\nStep 4: Remediation: Explicitly require algorithm whitelist (e.g. ['RS256'] or ['HS256']) in the verifier options.",
        accuracyWithoutActive: 41,
        accuracyWithActive: 95,
      },
    ],
  },
];

export function getActivePromptingSuite(id?: string): ActivePromptSuite {
  if (!id) return ACTIVE_PROMPTING_SUITES[0];
  return ACTIVE_PROMPTING_SUITES.find((s) => s.id === id) || ACTIVE_PROMPTING_SUITES[0];
}
