import { encode, decode } from "gpt-tokenizer";
import * as gpt4o from "gpt-tokenizer/model/gpt-4o";
import * as r50k from "gpt-tokenizer/encoding/r50k_base";
import { ProcessedToken, TokenizerComparison } from "./types";

const TOKEN_PALETTE = [
  { hex: "#00e5ff", bg: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300" },
  { hex: "#ff6b00", bg: "bg-ember-500/15 border-ember-500/40 text-ember-300" },
  { hex: "#10b981", bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" },
  { hex: "#8b5cf6", bg: "bg-purple-500/15 border-purple-500/40 text-purple-300" },
  { hex: "#f59e0b", bg: "bg-amber-500/15 border-amber-500/40 text-amber-300" },
  { hex: "#ec4899", bg: "bg-pink-500/15 border-pink-500/40 text-pink-300" },
  { hex: "#38bdf8", bg: "bg-sky-500/15 border-sky-500/40 text-sky-300" },
  { hex: "#a855f7", bg: "bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300" },
];

/**
 * Tokenize input text into rich ProcessedTokens with token IDs and offsets.
 */
export function tokenizeInputText(text: string, maxTokens = 128): ProcessedToken[] {
  if (!text || text.length === 0) return [];

  try {
    const rawTokenIds = encode(text);
    const cappedTokenIds = rawTokenIds.slice(0, maxTokens);

    let runningCharIndex = 0;
    const tokens: ProcessedToken[] = [];

    for (let i = 0; i < cappedTokenIds.length; i++) {
      const tokenId = cappedTokenIds[i];
      let tokenText = "";
      try {
        tokenText = decode([tokenId]);
      } catch {
        tokenText = `[tok_${tokenId}]`;
      }

      // Track character span in raw text
      const charStart = runningCharIndex;
      const charEnd = runningCharIndex + tokenText.length;
      runningCharIndex = charEnd;

      const palette = TOKEN_PALETTE[i % TOKEN_PALETTE.length];

      tokens.push({
        id: tokenId,
        text: tokenText,
        cleanText: tokenText.replace(/\n/g, "\\n").replace(/\t/g, "\\t"),
        index: i,
        byteLength: new TextEncoder().encode(tokenText).length,
        charStart,
        charEnd,
        colorClass: palette.bg,
        hexColor: palette.hex,
      });
    }

    return tokens;
  } catch (err) {
    // Graceful fallback if tokenizer throws on rare malformed input
    console.warn("Tokenizer fallback invoked:", err);
    return fallbackTokenize(text);
  }
}

/**
 * Simple regex fallback tokenizer for resilience
 */
function fallbackTokenize(text: string): ProcessedToken[] {
  const matches = text.match(/\w+|[^\w\s]|\s+/g) || [text];
  let running = 0;
  return matches.slice(0, 64).map((chunk, i) => {
    const palette = TOKEN_PALETTE[i % TOKEN_PALETTE.length];
    const start = running;
    running += chunk.length;
    return {
      id: 1000 + i,
      text: chunk,
      cleanText: chunk.replace(/\n/g, "\\n"),
      index: i,
      byteLength: new TextEncoder().encode(chunk).length,
      charStart: start,
      charEnd: running,
      colorClass: palette.bg,
      hexColor: palette.hex,
    };
  });
}

/**
 * Compares tokenization of the same text across multiple BPE vocabularies:
 * - cl100k_base: GPT-4 & GPT-3.5 standard
 * - o200k_base: GPT-4o expanded multilingual vocabulary
 * - r50k_base: GPT-2 / GPT-3 legacy vocabulary
 */
export function compareTokenizers(text: string): TokenizerComparison[] {
  if (!text || text.trim().length === 0) {
    return [
      {
        name: "cl100k_base (GPT-4 / GPT-3.5)",
        id: "cl100k_base",
        description: "OpenAI 100,000 token vocabulary standard for GPT-4 and Claude-class models.",
        modelEra: "2023 - Modern Standard",
        tokenCount: 0,
        tokens: [],
        compressionRatio: 0,
        estimatedCostPer1M: 5.0,
        tokenExpansionPercent: 0,
      },
      {
        name: "o200k_base (GPT-4o)",
        id: "o200k_base",
        description: "Expanded 200,000 token vocabulary with superior non-English compression.",
        modelEra: "2024 - Next-Gen Multilingual",
        tokenCount: 0,
        tokens: [],
        compressionRatio: 0,
        estimatedCostPer1M: 2.5,
        tokenExpansionPercent: 0,
      },
      {
        name: "r50k_base (GPT-2 / Davinci)",
        id: "r50k_base",
        description: "Legacy 50,000 token vocabulary. Suffers severe token bloat on non-English text.",
        modelEra: "2019 - Legacy Architecture",
        tokenCount: 0,
        tokens: [],
        compressionRatio: 0,
        estimatedCostPer1M: 20.0,
        tokenExpansionPercent: 0,
      },
    ];
  }

  // 1. cl100k_base
  let cl100kTokens: number[] = [];
  try {
    cl100kTokens = encode(text);
  } catch {
    cl100kTokens = [1];
  }
  const cl100kPieces = cl100kTokens.slice(0, 48).map((id) => {
    try {
      return decode([id]);
    } catch {
      return `[${id}]`;
    }
  });

  // 2. o200k_base (GPT-4o)
  let o200kTokens: number[] = [];
  try {
    o200kTokens = gpt4o.encode(text);
  } catch {
    o200kTokens = cl100kTokens;
  }
  const o200kPieces = o200kTokens.slice(0, 48).map((id) => {
    try {
      return gpt4o.decode([id]);
    } catch {
      return `[${id}]`;
    }
  });

  // 3. r50k_base (Legacy)
  let r50kTokens: number[] = [];
  try {
    r50kTokens = r50k.encode(text);
  } catch {
    r50kTokens = cl100kTokens;
  }
  const r50kPieces = r50kTokens.slice(0, 48).map((id) => {
    try {
      return r50k.decode([id]);
    } catch {
      return `[${id}]`;
    }
  });

  const baseCount = Math.max(1, cl100kTokens.length);
  const textChars = text.length;

  return [
    {
      name: "cl100k_base",
      id: "cl100k_base",
      description: "Standard 100k token vocabulary used in GPT-4 and GPT-3.5-Turbo.",
      modelEra: "2023 - Modern Standard",
      tokenCount: cl100kTokens.length,
      tokens: cl100kPieces,
      compressionRatio: Number((textChars / Math.max(1, cl100kTokens.length)).toFixed(2)),
      estimatedCostPer1M: 5.0,
      tokenExpansionPercent: 0,
    },
    {
      name: "o200k_base (GPT-4o)",
      id: "o200k_base",
      description: "Doubled 200k vocabulary dramatically improves token density for non-English and code.",
      modelEra: "2024 - Next-Gen Multilingual",
      tokenCount: o200kTokens.length,
      tokens: o200kPieces,
      compressionRatio: Number((textChars / Math.max(1, o200kTokens.length)).toFixed(2)),
      estimatedCostPer1M: 2.5,
      tokenExpansionPercent: Number((((o200kTokens.length - baseCount) / baseCount) * 100).toFixed(1)),
    },
    {
      name: "r50k_base (Legacy GPT-2/3)",
      id: "r50k_base",
      description: "Legacy 50k vocabulary. Lacks subword entries for non-Latin scripts, causing byte-splitting.",
      modelEra: "2019 - Legacy Architecture",
      tokenCount: r50kTokens.length,
      tokens: r50kPieces,
      compressionRatio: Number((textChars / Math.max(1, r50kTokens.length)).toFixed(2)),
      estimatedCostPer1M: 20.0,
      tokenExpansionPercent: Number((((r50kTokens.length - baseCount) / baseCount) * 100).toFixed(1)),
    },
  ];
}

export const MULTILINGUAL_PRESETS = [
  {
    label: "English Technical Prompt",
    language: "English",
    text: "Explain how multi-head attention calculates Query, Key, and Value vectors in a transformer.",
    insight: "English text enjoys high token efficiency, averaging ~4 characters per token in modern vocabularies.",
  },
  {
    label: "Hindi (Devanagari Script)",
    language: "Hindi",
    text: "नमस्ते! कृत्रिम बुद्धिमत्ता और मशीन लर्निंग कैसे काम करते हैं, कृपया विस्तार से समझाइए।",
    insight: "Legacy r50k splits Devanagari characters into raw UTF-8 bytes, requiring up to 4-5x more tokens and cost!",
  },
  {
    label: "Chinese (Simplified)",
    language: "Chinese",
    text: "大型语言模型如何利用自注意力机制捕获长距离上下文语义关联？",
    insight: "o200k has native Chinese compound tokens, cutting token counts significantly compared to earlier vocabularies.",
  },
  {
    label: "Arabic (Right-to-Left)",
    language: "Arabic",
    text: "كيف تعمل نماذج المحولات اللغوية في فهم السياق وتوليد النصوص الإبداعية؟",
    insight: "Rich morphology in Semitic languages suffers token fragmentation in vocabularies optimized heavily for English.",
  },
  {
    label: "Python Code",
    language: "Python",
    text: "def self_attention(q, k, v, mask=None):\n    scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d_k)\n    return torch.matmul(F.softmax(scores, dim=-1), v)",
    insight: "Code tokenizers compress indentation, operators, and common function names into single atomic tokens.",
  },
];
