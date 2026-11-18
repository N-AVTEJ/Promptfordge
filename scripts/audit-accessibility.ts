/**
 * Accessibility & Performance Audit Script
 * Audits accessibility snapshots and performance markers on all primary routes
 */

import { chromium } from "playwright";
import { spawn, ChildProcess } from "node:child_process";
import http from "node:http";

const PORT = 3091;
const BASE_URL = `http://localhost:${PORT}`;

async function fetchRoute(route: string): Promise<number> {
  return new Promise((resolve) => {
    http
      .get(`${BASE_URL}${route}`, (res) => resolve(res.statusCode || 500))
      .on("error", () => resolve(500));
  });
}

async function waitForServer(): Promise<boolean> {
  for (let i = 0; i < 30; i++) {
    const s = await fetchRoute("/");
    if (s === 200) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function runAudit() {
  console.log("Starting audit server on port", PORT);
  const server: ChildProcess = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "start", "-p", String(PORT)],
    { stdio: "pipe", shell: true, env: { ...process.env, PORT: String(PORT) } }
  );

  await waitForServer();
  const browser = await chromium.launch({ channel: "msedge" });
  const page = await browser.newPage();

  const routes = ["/academy", "/academy/mod-01", "/labs", "/workflow", "/dashboard"];
  console.log("\nAuditing accessibility & DOM structure on core routes:");

  for (const route of routes) {
    const start = Date.now();
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
    const loadTime = Date.now() - start;

    const snapshot = await page.accessibility.snapshot();
    const h1Count = await page.locator("h1").count();
    const imagesWithoutAlt = await page.locator("img:not([alt])").count();
    const buttonsWithoutLabel = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.filter((b) => !b.innerText.trim() && !b.getAttribute("aria-label") && !b.getAttribute("title")).length;
    });

    console.log(`\nRoute: ${route} (Rendered in ${loadTime}ms)`);
    console.log(`  - <h1> Elements: ${h1Count} (Valid semantic structure: ${h1Count >= 1 ? "✓" : "✗"})`);
    console.log(`  - Accessible Nodes in Tree: ${snapshot ? "✓ Valid AOM Snapshot" : "✗"}`);
    console.log(`  - Images missing alt text: ${imagesWithoutAlt} ${imagesWithoutAlt === 0 ? "✓" : "✗"}`);
    console.log(`  - Buttons missing accessible name: ${buttonsWithoutLabel} ${buttonsWithoutLabel === 0 ? "✓" : "✗"}`);
  }

  await browser.close();
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"]);
  } else {
    server.kill();
  }
}

runAudit().catch(console.error);
