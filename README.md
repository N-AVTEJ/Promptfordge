# PromptForge 🔥

An interactive prompt engineering academy where learners experiment with prompts in live labs with embedded YouTube lessons.

## Tech Stack (Phase 1 Foundation)

- **Framework:** Next.js 14 (App Router) + TypeScript Strict Mode
- **Styling:** Tailwind CSS + Radix/shadcn-inspired primitives
- **Design System:** "The Forge" theme (near-black `#0B0C0E`, molten amber `#FF6B00`, cool cyan `#00E5FF`, warm off-white `#F5F6F8`)
- **Typography:** Geist Sans (UI) & JetBrains Mono (prompts/code/tokens) via `next/font`
- **Motion:** GSAP + ScrollTrigger, Lenis smooth scroll (single RAF loop), Framer Motion
- **State & Storage:** Versioned typed `localStorage` module (`/lib/storage`) with corrupted data recovery
- **Accessibility:** Reduced motion detection with static fallbacks, keyboard navigable, responsive (360px - 1920px)

---

## Quickstart & Run Steps

### 1. Prerequisites

- Node.js >= 18.17 (Node 20+ recommended)
- npm >= 9

### 2. Environment Setup

Copy the sample environment file:

```bash
cp .env.example .env.local
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Linter & Tests

```bash
# Type check and linting
npm run lint

# Safe storage and motion unit tests
npm test
```
