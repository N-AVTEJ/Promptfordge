# PromptForge 🔥
> **The Empirical Prompt Engineering Academy & Interactive Laboratory Platform**

PromptForge is a production-grade, interactive prompt engineering academy and live experimentation sandbox. Learners master foundational to advanced prompting techniques through embedded video curricula, interactive simulators, empirical comparison labs, visual DAG workflow studios, and adversarial security arenas.

---

## 🏛 System Architecture

```
+---------------------------------------------------------------------------------------------------------+
|                                        PROMPTFORGE PLATFORM                                             |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ PRESENTATION LAYER (Next.js 14 App Router + Tailwind CSS + Framer Motion) ]                          |
|  +---------------------------------------------------------------------------------------------------+  |
|  |  /             - Landing & Course Syllabus                                                        |  |
|  |  /academy      - 10 Modules (30 Lessons + Quizzes + Video Chapters + Practice Labs)               |  |
|  |  /dashboard    - Progress Rings, Recent Experiments, Saved Prompts, Rule-Based Recommendations    |  |
|  |  /challenges   - 9 Missions, 5 Badge Tiers, Auto-Check Verification from Storage, Unlock Modal   |  |
|  |  /labs         - Playground, Prompt Anatomy, LLM Simulator, Compare Lab, Optimizer, Reasoning    |  |
|  |  /workflow     - Visual DAG Workflow Studio (React Flow, Typed Handles, Cycle Prevention)         |  |
|  |  /arena        - Security Arena (5 Threat Levels, Red vs Blue Adversarial Challenge)             |  |
|  |  /evaluate     - Disaggregated Metric Evaluation Engine Hub                                       |  |
|  |  /library      - Saved Prompts, Versioning, Token & Clarity Metrics, Tag Filters                  |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                  |                                                      |
|                                                  v                                                      |
|  [ API ROUTE DISPATCHERS ]                                                                              |
|  +---------------------------------------------------------------------------------------------------+  |
|  |  POST /api/run         - Single prompt execution with cost estimation and caching                 |  |
|  |  POST /api/compare     - Multi-technique concurrent execution and spread metrics                 |  |
|  |  POST /api/optimize    - Weak prompt diagnosis, candidate generation, and diff metrics          |  |
|  |  POST /api/arena/run   - Level defense checks, Red vs Blue attack benchmarking                    |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                  |                                                      |
|                                                  v                                                      |
|  [ CORE ENGINE INFRASTRUCTURE (/lib/engine) ]                                                           |
|  +---------------------------------------------------------------------------------------------------+  |
|  |  +---------------------------+   +----------------------------+   +----------------------------+  |  |
|  |  |      Guard Engine         |   |    Global Kill Switch      |   |       LRU Cache Engine     |  |  |
|  |  |  - Per-IP Rate Limiting   |   |  - PROMPTFORGE_KILL_SWITCH |   |  - SHA-256 Cache Keying    |  |  |
|  |  |  - Daily Budget Hard Stop |   |  - Cached Demo Fallback    |   |  - TTL-based Eviction      |  |  |
|  |  |  - Payload Character Caps |   |  - Zero Secret Leakage     |   |  - Near-zero ms latency    |  |  |
|  |  +---------------------------+   +----------------------------+   +----------------------------+  |  |
|  |                                               |                                                   |  |
|  |  +--------------------------------------------v------------------------------------------------+  |  |
|  |  |                                  Provider Adapter Registry                                  |  |  |
|  |  |       [Google Gemini Adapter]                           [OpenAI Adapter]                    |  |  |
|  |  |  - gemini-1.5-flash / pro / 2.0-flash            - gpt-4o / gpt-4o-mini                     |  |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  |                                               |                                                   |  |
|  |  +--------------------------------------------v------------------------------------------------+  |  |
|  |  |                          Disaggregated Evaluation Engine                                    |  |  |
|  |  |  - Format Compliance (Regex/AST)                  - Latency & Token Spread Distributions     |  |  |
|  |  |  - Lexical Similarity (ROUGE-L)                  - Multi-Axis Position-Shuffled Rubric      |  |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                  |                                                      |
|                                                  v                                                      |
|  [ CLIENT-SIDE TYPED VERSIONED STORAGE (/lib/storage) ]                                                 |
|  +---------------------------------------------------------------------------------------------------+  |
|  |  pf_v1_progress     - Lesson completion, quiz passing scores, last-visited coordinate             |  |
|  |  pf_v1_challenges   - Completed missions, unlocked badges, total points                          |  |
|  |  pf_v1_arena        - Defended levels, attempts, best Red vs Blue defense fraction               |  |
|  |  pf_v1_workflows    - Custom DAG node graphs and execution states                                |  |
|  |  pf_v1_saved_prompts- Versioned prompt blueprints with multi-axis quality metrics                 |  |
|  |  pf_v1_history      - Prompt runs, latency, tokens, cost telemetry                                |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 🚀 Quickstart & Setup

### Prerequisites
- **Node.js**: >= 18.17 (Node 20+ LTS recommended)
- **Package Manager**: npm >= 9

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/N-AVTEJ/Promptfordge.git
cd Promptfordge
npm install
```

### 2. Configure Environment
Copy the `.env.example` template:
```bash
cp .env.example .env.local
```

Populate your preferred provider credentials in `.env.local`:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```
*(Note: If no API keys are provided or if budgets are exhausted, PromptForge automatically falls back to high-fidelity cached demo data for all interactive laboratories).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
PromptForge includes a comprehensive test suite covering guardrails, caching, curriculum validation, and acceptance criteria:
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## ⚙️ Environment Variables Specification

All environment variables are strictly server-side unless prefixed with `NEXT_PUBLIC_`.

| Variable | Type | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | String | *Empty* | Server API key for Google Gemini (Flash, Pro, 2.0). |
| `OPENAI_API_KEY` | String | *Empty* | Server API key for OpenAI (GPT-4o, GPT-4o Mini). |
| `PROMPTFORGE_KILL_SWITCH` | Boolean (`true`/`false`) | `false` | **Global Kill Switch**: Halts all external AI calls and serves cached demo data. |
| `NEXT_PUBLIC_DEMO_MODE` | Boolean (`true`/`false`) | `false` | Client-accessible flag enforcing sandbox demo mode. |
| `PROMPTFORGE_DAILY_TOKEN_BUDGET` | Integer | `500000` | Global daily token consumption hard stop (resets at 00:00 UTC). |
| `PROMPTFORGE_RATE_LIMIT_PER_HOUR` | Integer | `20` | Maximum executions permitted per client IP within a sliding 1-hour window. |
| `PROMPTFORGE_MAX_PROMPT_LENGTH` | Integer | `12000` | Maximum character boundary for input prompts. |
| `PROMPTFORGE_MAX_OUTPUT_TOKENS` | Integer | `4096` | Upper limit for requested completion tokens. |
| `PROMPTFORGE_CACHE_MAX_ENTRIES` | Integer | `500` | Maximum capacity of the in-memory LRU cache. |
| `PROMPTFORGE_CACHE_TTL_MS` | Integer | `86400000` | In-memory cache time-to-live (24 hours). |

---

## 🛡️ Guardrails & Operational Limits

PromptForge is engineered with defense-in-depth security and cost containment:

1. **Per-IP Sliding Window Rate Limiting**:
   - Limits clients to 20 runs per hour by default.
   - Throttled requests receive HTTP 429 with explicit `Retry-After` headers.
2. **Global Daily Token Budget Hard Stop**:
   - Tracks aggregated token consumption across all users.
   - Hard cutoff at 500,000 tokens/day prevents cloud billing runaway.
3. **Payload Sanitization & Boundary Validation**:
   - Rejects empty, whitespace-only, or oversized prompts (>12,000 chars) before touching model providers.
4. **Zero Client Secret Leakage**:
   - External provider API keys are strictly confined to server-side Node.js runtime.
   - Automated tests scan `.next/static` to guarantee zero credentials leak into client JavaScript bundles.
5. **BYOK (Bring Your Own Key) Ephemeral Header Support**:
   - Learners can supply optional `x-provider-key` or `Authorization: Bearer <key>` headers in the playground.
   - BYOK credentials are used exclusively in-memory for the single request and are never logged, stored, or cached.

---

## 🔒 Global Kill Switch & Cached Demo Mode

PromptForge includes a fail-safe **Global Kill Switch** and **Cached Demo Mode**:

- **Activation**: Set `PROMPTFORGE_KILL_SWITCH=true` in environment configuration.
- **Behavior**:
  - Completely disables all external LLM provider API invocations.
  - Labs (`/labs/playground`, `/labs/compare`, `/labs/optimize`, `/arena`) fall back seamlessly to pre-recorded, high-fidelity sample results.
  - All simulated or cached executions are clearly labeled with the `"Demo data"` amber badge.
  - The Technique Comparison Lab guarantees that Few-Shot format compliance (100%) strictly outperforms Zero-Shot (33%), enabling reproducible completion of the Format Master challenge even in offline mode.
- **Resilience**: If an upstream provider experiences outages or rate limit exhaustion, client labs offer a 1-click fallback to cached demo data, ensuring uninterrupted curriculum learning.

---

## 📋 Known Limitations & Deferred Backlog

As scoped in the product architecture roadmap, the following advanced capabilities are deliberately deferred to future development:

1. **Multimodal Laboratory (Module 6)**: Image, audio, and video input prompt visualizers.
2. **RAG & Tool/Function-Calling Lab (Module 7)**: Live vector embeddings search and external tool execution sandboxes.
3. **Industry Prompt Benchmark Suite (Module 9)**: Domain-specific prompt corpora (Healthcare, Legal, Financial compliance).
4. **Curriculum Knowledge Graph**: Dynamic visual node graph mapping prerequisite relationships across prompt concepts.
5. **Teacher / Classroom Mode**: Multi-user instructor dashboards, classroom assignment distribution, and cohort progress tracking.
6. **Multilingual Prompt Benchmark Suite**: Cross-lingual token inflation benchmarking and translation prompt evaluation.
