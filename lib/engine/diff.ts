/**
 * PromptForge Line Diff Engine
 *
 * Implements deterministic line-by-line diffing with Longest Common Subsequence (LCS).
 * Accurately detects:
 * - 'unchanged': line identical in both versions
 * - 'added': line newly introduced in improved version
 * - 'removed': line deleted from original version
 * - 'modified': line in original replaced by a corresponding line in improved version
 */

export type DiffLineType = "unchanged" | "added" | "removed" | "modified";

export interface DiffLine {
  type: DiffLineType;
  text: string;
  originalLineNumber?: number;
  improvedLineNumber?: number;
  oldText?: string; // Populated when type === 'modified'
  newText?: string; // Populated when type === 'modified'
  reason?: string;  // Pedagogical rationale for this change
}

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  totalLinesOriginal: number;
  totalLinesImproved: number;
}

export interface DiffResult {
  lines: DiffLine[];
  summary: DiffSummary;
}

export interface DiffOptions {
  detectModifications?: boolean; // Default true: group adjacent del+add as modified
  trimTrailingNewlines?: boolean; // Default false
}

/**
 * Splits text into lines, handling both CRLF and LF safely.
 */
export function splitLines(text: string): string[] {
  if (!text) return [];
  // Normalize \r\n to \n
  const normalized = text.replace(/\r\n/g, "\n");
  // If empty string, return empty array
  if (normalized.length === 0) return [];
  return normalized.split("\n");
}

/**
 * Computes Longest Common Subsequence (LCS) matrix between two arrays of lines.
 */
function computeLcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

interface RawDiffOp {
  type: "common" | "delete" | "insert";
  text: string;
  origIndex?: number;
  impIndex?: number;
}

/**
 * Backtracks LCS table to generate ordered list of raw insertions, deletions, and common lines.
 */
function backtrackLcs(
  dp: number[][],
  linesA: string[],
  linesB: string[]
): RawDiffOp[] {
  let i = linesA.length;
  let j = linesB.length;
  const ops: RawDiffOp[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      ops.push({
        type: "common",
        text: linesA[i - 1],
        origIndex: i,
        impIndex: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({
        type: "insert",
        text: linesB[j - 1],
        impIndex: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      ops.push({
        type: "delete",
        text: linesA[i - 1],
        origIndex: i,
      });
      i--;
    }
  }

  return ops.reverse();
}

/**
 * Computes deterministic line-by-line diff between two strings.
 */
export function computeLineDiff(
  originalText: string,
  improvedText: string,
  options?: DiffOptions
): DiffResult {
  const detectModifications = options?.detectModifications ?? true;
  const linesA = splitLines(originalText);
  const linesB = splitLines(improvedText);

  // Quick optimization for identical texts
  if (originalText === improvedText) {
    const lines: DiffLine[] = linesA.map((line, idx) => ({
      type: "unchanged",
      text: line,
      originalLineNumber: idx + 1,
      improvedLineNumber: idx + 1,
    }));

    return {
      lines,
      summary: {
        added: 0,
        removed: 0,
        modified: 0,
        unchanged: lines.length,
        totalLinesOriginal: linesA.length,
        totalLinesImproved: linesB.length,
      },
    };
  }

  // Handle case where original is empty
  if (linesA.length === 0) {
    const lines: DiffLine[] = linesB.map((line, idx) => ({
      type: "added",
      text: line,
      improvedLineNumber: idx + 1,
    }));
    return {
      lines,
      summary: {
        added: lines.length,
        removed: 0,
        modified: 0,
        unchanged: 0,
        totalLinesOriginal: 0,
        totalLinesImproved: linesB.length,
      },
    };
  }

  // Handle case where improved is empty
  if (linesB.length === 0) {
    const lines: DiffLine[] = linesA.map((line, idx) => ({
      type: "removed",
      text: line,
      originalLineNumber: idx + 1,
    }));
    return {
      lines,
      summary: {
        added: 0,
        removed: lines.length,
        modified: 0,
        unchanged: 0,
        totalLinesOriginal: linesA.length,
        totalLinesImproved: 0,
      },
    };
  }

  const dp = computeLcsTable(linesA, linesB);
  const rawOps = backtrackLcs(dp, linesA, linesB);

  const resultLines: DiffLine[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  let idx = 0;
  while (idx < rawOps.length) {
    const op = rawOps[idx];

    if (op.type === "common") {
      resultLines.push({
        type: "unchanged",
        text: op.text,
        originalLineNumber: op.origIndex,
        improvedLineNumber: op.impIndex,
      });
      unchangedCount++;
      idx++;
      continue;
    }

    // Collect contiguous hunk of deletions and insertions
    const delHunk: RawDiffOp[] = [];
    const insHunk: RawDiffOp[] = [];

    while (idx < rawOps.length && rawOps[idx].type !== "common") {
      if (rawOps[idx].type === "delete") {
        delHunk.push(rawOps[idx]);
      } else if (rawOps[idx].type === "insert") {
        insHunk.push(rawOps[idx]);
      }
      idx++;
    }

    if (detectModifications && delHunk.length > 0 && insHunk.length > 0) {
      // Pair deletions and insertions as 'modified'
      const pairCount = Math.min(delHunk.length, insHunk.length);
      for (let p = 0; p < pairCount; p++) {
        resultLines.push({
          type: "modified",
          text: insHunk[p].text,
          oldText: delHunk[p].text,
          newText: insHunk[p].text,
          originalLineNumber: delHunk[p].origIndex,
          improvedLineNumber: insHunk[p].impIndex,
        });
        modifiedCount++;
      }

      // Remaining unmatched deletions
      for (let d = pairCount; d < delHunk.length; d++) {
        resultLines.push({
          type: "removed",
          text: delHunk[d].text,
          originalLineNumber: delHunk[d].origIndex,
        });
        removedCount++;
      }

      // Remaining unmatched insertions
      for (let a = pairCount; a < insHunk.length; a++) {
        resultLines.push({
          type: "added",
          text: insHunk[a].text,
          improvedLineNumber: insHunk[a].impIndex,
        });
        addedCount++;
      }
    } else {
      // No modification grouping: classify strictly as removed or added
      for (const d of delHunk) {
        resultLines.push({
          type: "removed",
          text: d.text,
          originalLineNumber: d.origIndex,
        });
        removedCount++;
      }
      for (const a of insHunk) {
        resultLines.push({
          type: "added",
          text: a.text,
          improvedLineNumber: a.impIndex,
        });
        addedCount++;
      }
    }
  }

  return {
    lines: resultLines,
    summary: {
      added: addedCount,
      removed: removedCount,
      modified: modifiedCount,
      unchanged: unchangedCount,
      totalLinesOriginal: linesA.length,
      totalLinesImproved: linesB.length,
    },
  };
}
