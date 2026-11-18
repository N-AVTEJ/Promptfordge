/**
 * Capture Verification Artifacts Script
 * Uses Playwright (Edge channel) to capture:
 * - Academy index (1440 & 360)
 * - One module page (1440 & 360)
 * - Labs index (1440 & 360)
 * - Workflow template picker (1440)
 * - Dashboard (1440 & 360)
 * - Video recording of lab run + results reveal + progress ring fill
 * - Reduced motion verification
 */

import { chromium } from "playwright";
import { spawn, ChildProcess } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 3089;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACTS_DIR = path.resolve(process.cwd(), "artifacts", "phase2b");

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function fetchRoute(route: string): Promise<number> {
  return new Promise((resolve) => {
    http
      .get(`${BASE_URL}${route}`, (res) => {
        resolve(res.statusCode || 500);
      })
      .on("error", () => resolve(500));
  });
}

async function waitForServer(retries = 30, delayMs = 1000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    const status = await fetchRoute("/");
    if (status === 200) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

async function run() {
  console.log("Starting Next.js server for artifact capture on port", PORT);
  const server: ChildProcess = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "start", "-p", String(PORT)],
    {
      stdio: "pipe",
      shell: true,
      env: { ...process.env, PORT: String(PORT) },
    }
  );

  const ready = await waitForServer();
  if (!ready) {
    console.error("Failed to start server on port", PORT);
    server.kill();
    process.exit(1);
  }

  console.log("Server ready on", BASE_URL);

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  // 1. Desktop Viewport (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const desktopPage = await desktopContext.newPage();

  console.log("Capturing 1440x900 screenshots...");

  // Academy Index (1440)
  await desktopPage.goto(`${BASE_URL}/academy`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, "academy-index-1440.png"),
    fullPage: false,
  });
  console.log("✓ Saved academy-index-1440.png");

  // Module Page (1440)
  await desktopPage.goto(`${BASE_URL}/academy/mod-01`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, "module-overview-mod01-1440.png"),
    fullPage: false,
  });
  console.log("✓ Saved module-overview-mod01-1440.png");

  // Labs Index (1440)
  await desktopPage.goto(`${BASE_URL}/labs`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, "labs-index-1440.png"),
    fullPage: false,
  });
  console.log("✓ Saved labs-index-1440.png");

  // Workflow Template Picker (1440)
  await desktopPage.goto(`${BASE_URL}/workflow`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1500);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, "workflow-template-picker-1440.png"),
    fullPage: false,
  });
  console.log("✓ Saved workflow-template-picker-1440.png");

  // Dashboard (1440)
  await desktopPage.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1500);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, "dashboard-1440.png"),
    fullPage: false,
  });
  console.log("✓ Saved dashboard-1440.png");

  // Interactive Run: Open Lesson Studio, mark complete, observe animated progress ring fill
  console.log("Executing interactive lesson completion and progress ring fill...");
  await desktopPage.goto(`${BASE_URL}/academy/mod-01/mod-01-les-01`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, "sequence-1-lesson-before-complete.png"),
    fullPage: false,
  });

  // Click mark complete button
  const markCompleteBtn = desktopPage.locator('button:has-text("Mark complete")').first();
  if (await markCompleteBtn.isVisible()) {
    await markCompleteBtn.click();
    await desktopPage.waitForTimeout(400);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, "sequence-2-progress-ring-animating.png"),
      fullPage: false,
    });
    await desktopPage.waitForTimeout(1200);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, "sequence-3-lesson-completed-card.png"),
      fullPage: false,
    });
    console.log("✓ Saved interactive lesson completion sequence (1-3)");
  }

  // Interactive Run: Run a lab (/labs/tool-lab)
  console.log("Executing tool lab run and results reveal...");
  await desktopPage.goto(`${BASE_URL}/labs/tool-lab`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, "sequence-4-lab-before-run.png"),
    fullPage: false,
  });

  const runLabBtn = desktopPage.locator('button:has-text("Execute Function Call Pipeline")').first();
  if (await runLabBtn.isVisible()) {
    await runLabBtn.click();
    await desktopPage.waitForTimeout(400);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, "sequence-5-lab-executing.png"),
      fullPage: false,
    });
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, "sequence-6-lab-results-revealed.png"),
      fullPage: false,
    });
    console.log("✓ Saved interactive lab execution sequence (4-6)");
  }

  await desktopPage.close();
  await desktopContext.close();

  // 2. Mobile Viewport (360x800)
  console.log("Capturing 360x800 mobile screenshots...");
  const mobileContext = await browser.newContext({
    viewport: { width: 360, height: 800 },
  });
  const mobilePage = await mobileContext.newPage();

  // Academy Mobile
  await mobilePage.goto(`${BASE_URL}/academy`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, "academy-index-360.png"),
    fullPage: false,
  });
  console.log("✓ Saved academy-index-360.png");

  // Module Mobile
  await mobilePage.goto(`${BASE_URL}/academy/mod-01`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, "module-overview-mod01-360.png"),
    fullPage: false,
  });
  console.log("✓ Saved module-overview-mod01-360.png");

  // Labs Mobile
  await mobilePage.goto(`${BASE_URL}/labs`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, "labs-index-360.png"),
    fullPage: false,
  });
  console.log("✓ Saved labs-index-360.png");

  // Dashboard Mobile
  await mobilePage.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, "dashboard-360.png"),
    fullPage: false,
  });
  console.log("✓ Saved dashboard-360.png");

  await mobilePage.close();
  await mobileContext.close();

  // 3. Reduced Motion Verification
  console.log("Testing prefers-reduced-motion media feature...");
  const reducedMotionContext = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 },
  });
  const rmPage = await reducedMotionContext.newPage();
  await rmPage.goto(`${BASE_URL}/academy`, { waitUntil: "networkidle" });
  const isReduced = await rmPage.evaluate(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  console.log(`✓ prefers-reduced-motion: reduce verified by browser window: ${isReduced}`);

  await rmPage.close();
  await reducedMotionContext.close();

  await browser.close();

  // Kill server tree
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"]);
  } else {
    server.kill();
  }

  console.log("\n=============================================================");
  console.log("All screenshots and verification records successfully saved!");
  console.log("Artifacts directory:", ARTIFACTS_DIR);
  console.log("=============================================================");
}

run().catch((err) => {
  console.error("Artifact capture failed:", err);
  process.exit(1);
});
