/**
 * Expert Prompting & Specialist Roles Engine
 * Module 4: Chain-of-Thought & Visual Reasoning Strategies
 *
 * Implements simultaneous side-by-side evaluation of a target question
 * across divergent specialist personas (Security, Performance, UX, SRE).
 */

import {
  ExpertRole,
  ExpertCouncilPreset,
  ExpertEvaluationResponse,
} from "./types";

export const EXPERT_EDUCATIONAL_DISCLOSURE =
  "Educational simulation: Side-by-side expert council visualizes how persona framing constrains model attention to specific domain invariants; answers generated under specialist role boundaries.";

export const EXPERT_ROLES: ExpertRole[] = [
  {
    id: "security-architect",
    title: "Principal Security Architect",
    persona: "Adversarial Threat Modeler & Cryptographic Systems Lead",
    avatarColor: "#EF4444", // red-500
    badgeText: "Security & Threat Invariants",
    systemPrompt:
      "You are a Principal Security Architect. Evaluate every design through an adversarial STRIDE threat-modeling lens. Enforce least-privilege boundaries, cryptographic hygiene, timing attack resistance, and immutable audit telemetry.",
    focusAreas: [
      "Zero-Trust Boundary Validation",
      "Cryptographic Key Lifecycle & Forward Secrecy",
      "Timing Side-Channel Immunity",
      "Immutable Audit Logs",
    ],
  },
  {
    id: "perf-engineer",
    title: "Principal Systems Performance Engineer",
    persona: "Low-Latency Kernel & Memory Systems Specialist",
    avatarColor: "#00E5FF", // electric cyan
    badgeText: "Latency & Resource Invariants",
    systemPrompt:
      "You are a Principal Systems Performance Engineer. Analyze systems with obsessive attention to latency bottlenecks, memory layout, cache hierarchies, CPU cache lines, concurrency models, and p99 tail bounds.",
    focusAreas: [
      "Zero-Copy Memory Pathways",
      "p99 / p99.9 Tail Latency Bounds",
      "Cache Locality & Lock Contention",
      "I/O Multiplexing & Ring Buffers",
    ],
  },
  {
    id: "ux-lead",
    title: "Staff Product & Accessibility Designer",
    persona: "Cognitive Load & WCAG 2.2 AAA Design Lead",
    avatarColor: "#FF7A1A", // molten amber
    badgeText: "Human Factors & Accessibility",
    systemPrompt:
      "You are a Staff Product & Accessibility Designer. Analyze interfaces with a focus on cognitive clarity, accessible affordances, WCAG compliance, user friction reduction, and empathetic error feedback.",
    focusAreas: [
      "WCAG 2.2 AAA Accessible Semantics",
      "Progressive Disclosure of Complexity",
      "Actionable Error Recovery Paths",
      "Zero-Jitter Visual Stability",
    ],
  },
  {
    id: "sre-lead",
    title: "Staff Site Reliability Engineer (SRE)",
    persona: "Chaos Engineering & Disaster Recovery Specialist",
    avatarColor: "#10B981", // emerald-500
    badgeText: "Resilience & Blast Radius",
    systemPrompt:
      "You are a Staff SRE. Evaluate systems from a failure-mode perspective. Assume network partitions, cascading thundering herds, downstream brownouts, and design strict circuit breaking.",
    focusAreas: [
      "Blast Radius Isolation & Cell Architecture",
      "Adaptive Circuit Breakers & Backpressure",
      "Idempotency & Replay Safety",
      "Mean Time to Recovery (MTTR) SLA",
    ],
  },
];

export const EXPERT_PRESETS: ExpertCouncilPreset[] = [
  {
    id: "rate-limiter",
    title: "High-Throughput API Rate Limiting Gateway",
    domain: "Distributed Systems Architecture",
    query:
      "How should an enterprise architect an API rate limiting and quota gateway handling 100k requests/second across multiple global edge regions?",
  },
  {
    id: "document-sync",
    title: "Real-Time Collaborative Document Sync",
    domain: "State Synchronization & Real-time Engines",
    query:
      "Design an offline-capable, conflict-free collaborative text editor synchronization engine supporting 50 simultaneous concurrent writers.",
  },
  {
    id: "monolith-migration",
    title: "Zero-Downtime Microservices Migration",
    domain: "Enterprise Infrastructure & Refactoring",
    query:
      "How do we transition a mission-critical billing monolith to an event-driven payment architecture without dropping transactions or incurring downtime?",
  },
];

interface PrecomputedExpertAnswer {
  response: string;
  keyTakeaway: string;
  scores: {
    domainRigor: { score: number; reason: string };
    actionability: { score: number; reason: string };
    riskAwareness: { score: number; reason: string };
  };
}

const EXPERT_KNOWLEDGE_MATRIX: Record<
  string,
  Record<string, PrecomputedExpertAnswer>
> = {
  "rate-limiter": {
    "security-architect": {
      response: `### 1. Threat Invariants & Adversarial Defense
- **Distributed DoS & Botnet Masquerading**: Raw IP rate limiting is inadequate due to IPv6 rotation and residential proxy pools. Mandate cryptographic client fingerprints (TLS Client Hello JA4 hashes) and authenticated token buckets.
- **Timing Attack Resistance**: Rate-limit header disclosures (e.g. \`Retry-After\`) must employ jittered intervals to prevent adversaries from synchronizing request waves to sliding window boundary edges.
- **HMAC Signatures on Edge Quotas**: Synchronize edge counters with cryptographically signed state claims to prevent header forgery between ingress POPs and core VPCs.`,
      keyTakeaway:
        "Reject plain IP keys; authenticate via JA4 TLS fingerprints and jitter Retry-After to thwart wave synchronization.",
      scores: {
        domainRigor: { score: 5, reason: "Evaluates proxy rotation, timing attacks, and cryptographic state." },
        actionability: { score: 4, reason: "Concrete header and protocol specifications." },
        riskAwareness: { score: 5, reason: "Exposes distributed botnet evasion vectors." },
      },
    },
    "perf-engineer": {
      response: `### 1. Micro-Benchmark & Data Structure Allocation
- **Redis GCRA vs Local Token Bucket**: Centralized Redis roundtrips (1-3ms) at 100k req/sec create network saturation. Implement a two-tier hierarchy: local in-memory Token Buckets on Envoy/eBPF edges with batch background sync (100ms intervals).
- **Atomic Operations without Lock Contention**: Use CPU atomic compare-and-swap (\`atomic_fetch_add\`) on a 64-bit uint counter combining millisecond timestamp (48 bits) and token count (16 bits) in a single cache line (64 bytes).
- **Zero-Copy eBPF Filtering**: Drop blacklisted and hard-rate-limited packets directly in the Linux XDP kernel driver before allocating socket buffers (\`sk_buff\`).`,
      keyTakeaway:
        "Drop requests at kernel XDP layer via eBPF; pack timestamp and tokens into a single 64-byte CPU cache line.",
      scores: {
        domainRigor: { score: 5, reason: "Addresses CPU cache lines, CAS atomic ops, and eBPF kernel drops." },
        actionability: { score: 5, reason: "Direct C/eBPF bit-packing implementation pattern." },
        riskAwareness: { score: 4, reason: "Addresses Redis connection pool saturation." },
      },
    },
    "ux-lead": {
      response: `### 1. Cognitive Friction & Status Transparency
- **Transparent Human-Readable Headers**: Supplement standard \`RateLimit-Limit\`, \`RateLimit-Remaining\`, and \`RateLimit-Reset\` with clear human-readable reset timestamps in ISO 8601, not just raw epoch seconds.
- **Predictive Warning States**: Return a \`RateLimit-Warning: 80% quota consumed\` header when approaching threshold so client apps can throttle non-critical background polling before users experience a hard crash.
- **Actionable 429 Error Payloads**: Do not return generic 'Rate limit exceeded'. Provide: "You have exceeded your 1,000 req/min quota. Your tokens replenish at 14:02:15 UTC. Upgrade quota or back off polling interval."`,
      keyTakeaway:
        "Provide predictive 80% threshold warnings and human-readable recovery timestamps instead of opaque 429 walls.",
      scores: {
        domainRigor: { score: 4, reason: "Covers RFC standards and human cognitive ergonomics." },
        actionability: { score: 5, reason: "Exact JSON error payload and HTTP header contracts." },
        riskAwareness: { score: 4, reason: "Prevents confusing client-side UX failures." },
      },
    },
    "sre-lead": {
      response: `### 1. Failure Domains & Blast Radius Containment
- **Fail-Open vs Fail-Closed Strategy**: Rate limiters must never become a single point of failure that brings down the primary business. If the rate-limiting storage cluster (Redis/Memcached) is degraded, fail OPEN for authenticated enterprise traffic and fail CLOSED only for unauthenticated public routes.
- **Cell-Based Regional Partitioning**: Isolate rate counters into regional cells (US-East, EU-Central, AP-South). Never attempt global cross-region synchronous consensus for rate limits; allow up to 5% temporary regional drift during network partitions.
- **Circuit Breakers with Exponential Jitter**: Enforce adaptive shedding so clients do not immediately hammer the gateway on the second the rate limit reset window opens.`,
      keyTakeaway:
        "Fail open for authenticated tiers when Redis fails; eliminate global consensus in favor of cell-isolated regional quotas.",
      scores: {
        domainRigor: { score: 5, reason: "Exemplary resilience architecture with cell isolation and partition safety." },
        actionability: { score: 5, reason: "Actionable operational runbook policies." },
        riskAwareness: { score: 5, reason: "Prevents rate-limiter death spirals." },
      },
    },
  },

  "document-sync": {
    "security-architect": {
      response: `### 1. Cryptographic Invariants & Integrity
- **End-to-End Encrypted CRDT Operations**: Encrypt state deltas client-side before transmission. The central relay server must act strictly as a blind ordering coordinator without ability to decrypt document contents.
- **Tamper-Evident Merkle DAG**: Wrap each character operation into an authenticated hash tree. Each node signs their CRDT state vector with an Ed25519 private key to prevent malicious peer injection.
- **Compromise Containment**: If a collaborator's session token is revoked, rotate document encryption keys immediately with epoch ratchet forward-secrecy.`,
      keyTakeaway:
        "Keep the central relay server blind to document content using client-signed Merkle CRDT deltas.",
      scores: {
        domainRigor: { score: 5, reason: "Applies zero-trust cryptography and Merkle DAG integrity." },
        actionability: { score: 4, reason: "Clear Ed25519 and epoch ratchet design." },
        riskAwareness: { score: 5, reason: "Protects against rogue relay servers." },
      },
    },
    "perf-engineer": {
      response: `### 1. Memory Layout & Delta Compression
- **Yjs/Loro Run-Length Encoded CRDTs**: Avoid character-by-character object allocations. Use run-length encoded (RLE) byte vectors to represent contiguous typing blocks.
- **Binary Delta Transport over WebSockets**: Serialize operations into binary Protobuf or FlatBuffers rather than JSON. JSON strings for 50 simultaneous writers waste up to 8x network bandwidth and trigger heavy GC sweeps.
- **Memory Footprint Bound**: Keep document state under 10MB memory footprint on mobile devices by snapshotting compacted state checkpoints every 500 operations.`,
      keyTakeaway:
        "Use run-length encoding (RLE) and binary WebSockets; snapshot every 500 ops to maintain sub-10MB RAM footprint.",
      scores: {
        domainRigor: { score: 5, reason: "Analyzes GC pauses, RLE encoding, and Protobuf efficiency." },
        actionability: { score: 5, reason: "Direct library selection (Yjs/FlatBuffers) and compaction cadence." },
        riskAwareness: { score: 4, reason: "Focuses on mobile memory limits and GC pressure." },
      },
    },
    "ux-lead": {
      response: `### 1. Presence & Visual Conflict Affordances
- **Non-Distracting Collaborative Cursors**: Render peer cursor trails with subtle 200ms cubic-bezier dampening. Throttle high-frequency cursor updates to 30fps to avoid visual nausea.
- **Transparent Offline/Reconnecting Indicators**: When network drops, do not block the editor or throw scary alert modals. Show an unobtrusive amber indicator: "Offline — your edits are saved locally and will merge seamlessly".
- **Visual Attribution Highlights**: Soft momentary pastel highlights when remote edits land, fading out smoothly over 1.2s to prevent disorienting jumps in line position.`,
      keyTakeaway:
        "Dampen cursor movements to 30fps with 200ms bezier curves; never lock the editor during offline reconnection.",
      scores: {
        domainRigor: { score: 4, reason: "Addresses motion sickness, cognitive fatigue, and offline confidence." },
        actionability: { score: 5, reason: "Precise CSS animation timings and color fade rules." },
        riskAwareness: { score: 4, reason: "Prevents UI freezing and user panic during network drops." },
      },
    },
    "sre-lead": {
      response: `### 1. Cluster State & Partition Tolerance
- **Distributed WebSocket Connection Draining**: Use Envoy edge proxies with sticky session routing to session pods. On deployment, drain WebSockets over a graceful 60-second window to prevent 50,000 reconnect storms.
- **Storage Durability Checkpoints**: Buffer in-flight CRDT ops in a high-speed Redis cluster, flushing compacted snapshots to S3/Postgres asynchronously with write-ahead logging (WAL).
- **Split-Brain Convergence**: CRDTs guarantee mathematical convergence once network partitions heal, but monitor replication lag histograms with Prometheus alerting at > 250ms p95 lag.`,
      keyTakeaway:
        "Graceful 60-second WebSocket connection draining prevents reconnect storms; monitor CRDT replication lag histograms.",
      scores: {
        domainRigor: { score: 5, reason: "Addresses connection storming, WAL storage, and Prometheus metrics." },
        actionability: { score: 5, reason: "Operational deployment procedures." },
        riskAwareness: { score: 5, reason: "Explicit focus on reconnect thundering herds." },
      },
    },
  },

  "monolith-migration": {
    "security-architect": {
      response: `### 1. Security Invariants during Migration
- **Dual-Write Vulnerability Surface**: Never mirror raw plaintext credit card numbers or unhashed PII across message queues during the shadow-run phase. Tokenize data at ingress before emitting to Kafka/RabbitMQ.
- **mTLS Service Mesh Authentication**: Microservices must communicate via mutual TLS with SPIFFE/SPIRE verifiable identities, not legacy internal IP whitelist assumptions.
- **Reconciliation Audit Trail**: Implement an independent cryptographic auditor verifying ledger checksums between legacy SQL tables and event store records every 15 minutes.`,
      keyTakeaway:
        "Tokenize payment PII before queue emission and verify ledger checksums between monolith and event store continuously.",
      scores: {
        domainRigor: { score: 5, reason: "Covers dual-write leakage, SPIFFE mTLS, and cryptographic ledgers." },
        actionability: { score: 4, reason: "Architecture requirements for financial systems." },
        riskAwareness: { score: 5, reason: "Zero-tolerance for data leaks during transition." },
      },
    },
    "perf-engineer": {
      response: `### 1. Throughput & Latency Invariants
- **Outbox Pattern with Debezium CDC**: Avoid dual-writes from application code (which introduces distributed transaction locks). Write to a single local \`outbox_events\` table inside the existing SQL transaction; capture changes asynchronously using Debezium CDC reading WAL logs.
- **Batching & Compression on Event Stream**: Configure Kafka producer with Snappy compression and 5ms linger batching to achieve 20x throughput on payment event bursts.
- **Consumer Idempotency Table**: Keep an in-memory Redis bloom filter + PostgreSQL unique constraint on \`event_id\` to ensure sub-millisecond deduplication checks.`,
      keyTakeaway:
        "Employ the Transactional Outbox Pattern via Postgres WAL (Debezium CDC); never execute dual application writes.",
      scores: {
        domainRigor: { score: 5, reason: "Explains transactional outbox, WAL CDC, and Kafka batching." },
        actionability: { score: 5, reason: "Proven zero-downtime engineering pattern." },
        riskAwareness: { score: 5, reason: "Avoids 2PC and distributed locks." },
      },
    },
    "ux-lead": {
      response: `### 1. Customer Transaction Assurance
- **Optimistic State with Clear Confirmation**: When moving to asynchronous event processing, billing transactions can take 1-3 seconds to reach final settlement. Show immediate receipt acknowledgment with pending reconciliation badge.
- **Self-Healing Polling Experience**: If an event is delayed in the pipeline, never show a generic spinner indefinitely. After 4 seconds, display: "Your payment is being confirmed with your financial institution. We will email your invoice within 60 seconds."
- **Customer Support Ledger Link**: Provide customers and support agents with a human-friendly Reference Code (e.g. \`PAY-7829-NYC\`) tied directly to the Kafka event trace.`,
      keyTakeaway:
        "Transform asynchronous latency into transparent reassurance: display human-friendly reference IDs and email fallback.",
      scores: {
        domainRigor: { score: 4, reason: "Focuses on user anxiety during financial latency." },
        actionability: { score: 5, reason: "Copy guidelines and state management UX." },
        riskAwareness: { score: 4, reason: "Prevents double-click duplicate payments." },
      },
    },
    "sre-lead": {
      response: `### 1. Blast Radius & Dark Launch Strategy
- **Strangler Fig Pattern with Canary Routing**: Route 1% of transactions through the new event-driven service while the monolith processes the remaining 99%. Compare ledger results in dark-mode shadow verification.
- **Dead Letter Queue (DLQ) & Poison Pill Handling**: Every event consumer must route malformed or failing payloads to a dedicated DLQ after 3 retries with exponential backoff. An unhandled exception must never halt partition consumption.
- **Instant Kill Switch / Revert Flag**: Maintain a zero-downtime feature flag in Consul/LaunchDarkly that can revert 100% of routing back to the monolith in < 5 seconds without restarting services.`,
      keyTakeaway:
        "Execute Strangler Fig pattern with shadow canary routing; implement 5-second kill switches and non-blocking DLQs.",
      scores: {
        domainRigor: { score: 5, reason: "Comprehensive canary rollout, kill switches, and DLQ handling." },
        actionability: { score: 5, reason: "Exemplary operational rollback plan." },
        riskAwareness: { score: 5, reason: "Zero-downtime protection against migration surprises." },
      },
    },
  },
};

/**
 * Evaluates a query across all 4 specialist roles.
 */
export function evaluateExpertCouncil(
  query: string,
  presetId?: string
): ExpertEvaluationResponse[] {
  const matchedKey =
    presetId ||
    Object.keys(EXPERT_KNOWLEDGE_MATRIX).find((k) =>
      query.toLowerCase().includes(k.replace("-", " "))
    ) ||
    "rate-limiter";

  const matrix =
    EXPERT_KNOWLEDGE_MATRIX[matchedKey] ||
    EXPERT_KNOWLEDGE_MATRIX["rate-limiter"];

  return EXPERT_ROLES.map((role) => {
    const data = matrix[role.id];
    const defaultData: PrecomputedExpertAnswer = {
      response: `### ${role.title} Evaluation\nSpecialist analysis for: "${query}"\n\n- **Primary Invariant**: Strict compliance with ${role.focusAreas[0]}.\n- **Tradeoff Analysis**: Balances domain precision with implementation velocity.\n- **Recommended Next Step**: Institute automated integration testing verifying ${role.focusAreas[1]}.`,
      keyTakeaway: `Enforces strict domain requirements around ${role.focusAreas[0]}.`,
      scores: {
        domainRigor: { score: 4, reason: `Addresses core ${role.title} invariants.` },
        actionability: { score: 4, reason: "Clear practical recommendations." },
        riskAwareness: { score: 4, reason: "Highlights primary failure modes." },
      },
    };

    const final = data || defaultData;
    const tokensUsed = Math.max(80, Math.ceil(final.response.length / 4));
    const latencyMs = 280 + Math.floor(Math.random() * 80);

    return {
      roleId: role.id,
      roleTitle: role.title,
      response: final.response,
      keyTakeaway: final.keyTakeaway,
      latencyMs,
      tokensUsed,
      scores: {
        domainRigor: { ...final.scores.domainRigor, maxScore: 5 },
        actionability: { ...final.scores.actionability, maxScore: 5 },
        riskAwareness: { ...final.scores.riskAwareness, maxScore: 5 },
      },
    };
  });
}
