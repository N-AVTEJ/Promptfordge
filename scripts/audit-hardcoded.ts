import fs from "node:fs";
import path from "node:path";

const TITLES = [
  "Introduction to Prompt Engineering",
  "Example and Instruction Based Prompts",
  "Context Based and Interaction Based Prompts",
  "Advanced Prompt Techniques",
  "Prompt Optimization Techniques",
  "Multi-Model Prompting",
  "Tool-Augmented Prompting",
  "Security in Prompt Engineering",
  "Domain-Specific Prompt Engineering",
  "Advanced Prompt Engineering",
  "AI Agents, Context Engineering and MCP",
  "Production Prompt Engineering and Responsible AI",
];

const patterns = [
  /12\s+modules/i,
  /10\s+modules/i,
  /12-module/i,
  /10-module/i,
];

interface Finding {
  file: string;
  type: string;
  matched: string;
  line: number;
}

const findings: Finding[] = [];

function scanDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".next", ".git"].includes(entry.name)) {
        scanDir(full);
      }
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      const lines = fs.readFileSync(full, "utf8").split("\n");
      lines.forEach((line, idx) => {
        // Exclude imports, comments referencing this test or documentation
        for (const title of TITLES) {
          if (line.includes(title)) {
            // Check if it's not in content/ or scripts/ or tests/
            findings.push({
              file: full,
              type: "hardcoded-title",
              matched: title,
              line: idx + 1,
            });
          }
        }
        for (const pat of patterns) {
          if (pat.test(line)) {
            findings.push({
              file: full,
              type: "number-literal",
              matched: line.trim(),
              line: idx + 1,
            });
          }
        }
      });
    }
  }
}

["app", "components"].forEach((dir) => {
  if (fs.existsSync(dir)) scanDir(dir);
});

console.log(`\nAudit found ${findings.length} potential hardcoded references in app/ & components/:\n`);
findings.forEach((f) => {
  console.log(`[${f.type}] ${f.file}:${f.line} -> "${f.matched}"`);
});
