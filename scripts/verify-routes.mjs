const routes = [
  "/",
  "/academy",
  "/labs",
  "/workflow",
  "/evaluate",
  "/arena",
  "/library",
  "/challenges",
];

const port = process.env.PORT || process.argv[2] || 3000;
const baseUrl = `http://localhost:${port}`;

async function verifyAll() {
  console.log(`Verifying PromptForge Routes on ${baseUrl}...\n`);
  let passed = 0;
  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      const hasForgeBrand =
        text.includes("PROMPT") || text.includes("PromptForge");
      console.log(
        `[PASS] ${route.padEnd(12)} -> Status: ${res.status} | Content Length: ${text.length} | Brand check: ${hasForgeBrand ? "OK" : "MISSING"}`
      );
      if (res.status === 200 && hasForgeBrand) {
        passed++;
      }
    } catch (err) {
      console.error(`[FAIL] ${route} -> Error: ${err.message}`);
    }
  }
  console.log(`\nTotal passed: ${passed}/${routes.length}`);
  if (passed !== routes.length) {
    process.exit(1);
  }
}

verifyAll();
