import { searchYouTube, checkVideo } from './search-yt.mjs';

const GAPS = [
  {
    topic: 'M2 Instruction based',
    queries: ['how to write clear instructions for ChatGPT', 'instruction prompting for beginners'],
  },
  {
    topic: 'M3 Contextual prompts',
    queries: ['adding context to prompts LLM', 'contextual prompting explained'],
  },
  {
    topic: 'M5 Iterative refinement',
    queries: ['iterative prompt refinement', 'improve a prompt step by step'],
  },
  {
    topic: 'M6 Cross-model interaction',
    queries: ['using multiple LLMs together workflow', 'multi-model AI orchestration explained'],
  },
  {
    topic: 'M8 Safe prompt design',
    queries: ['secure system prompt design against injection', 'defensive prompt engineering injection mitigation'],
  },
  {
    topic: 'M10 APE',
    queries: ['Automatic Prompt Engineer APE explained', 'Automatic Prompt Engineer paper LLM'],
  },
  {
    topic: 'M11 Agent loops, BEGINNER level',
    queries: ['what are AI agents explained', 'AI agent plan act observe loop'],
  },
  {
    topic: 'M11 Memory',
    queries: ['AI agent memory short term long term explained', 'AI agents memory vector episodic buffer'],
  },
  {
    topic: 'M12 Bias, safety, governance',
    queries: ['responsible AI bias in LLMs explained', 'AI governance explained'],
  },
  {
    topic: 'M12 Cost, latency, caching',
    queries: ['prompt caching LLM cost latency explained', 'prompt caching Anthropic Gemini explained'],
  },
];

async function main() {
  const targetIndex = process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : null;
  const list = targetIndex !== null ? [GAPS[targetIndex]] : GAPS;

  for (const gap of list) {
    if (!gap) continue;
    console.log(`\n#######################################################`);
    console.log(`TOPIC: ${gap.topic}`);
    console.log(`#######################################################`);
    for (const q of gap.queries) {
      await searchYouTube(q);
    }
  }
}

main().catch(console.error);
