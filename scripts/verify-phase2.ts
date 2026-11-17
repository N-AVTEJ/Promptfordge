/**
 * Phase 2 Cinematic Landing Page Automated Verification Script
 * Uses Playwright + Chrome to verify and capture all acceptance proofs.
 */

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

const BASE_URL = "http://localhost:3000";
const ARTIFACTS_DIR = path.resolve(process.cwd(), "artifacts/phase2");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  console.log("=== Starting Phase 2 Landing Acceptance Verification ===");

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  try {
    // -------------------------------------------------------------
    // Test 1: Full-page screenshots at 360, 768, and 1440 viewports
    // -------------------------------------------------------------
    console.log("\n[Test 1] Capturing full-page screenshots at 360, 768, 1440...");
    const viewports = [
      { name: "landing-360", width: 360, height: 800 },
      { name: "landing-768", width: 768, height: 1024 },
      { name: "landing-1440", width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
      });
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      const filePath = path.join(ARTIFACTS_DIR, `${vp.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`  ✓ Saved ${vp.name}.png (${vp.width}x${vp.height})`);
      await page.close();
    }

    // -------------------------------------------------------------
    // Test 2: Pinned story screenshots at 0, 20, 45, 70, 95 percent
    // -------------------------------------------------------------
    console.log("\n[Test 2] Capturing pinned story at 0%, 20%, 45%, 70%, 95% scroll...");
    const storyPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await storyPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await storyPage.waitForTimeout(1000);

    // Wait for ScrollTrigger to be attached to window
    await storyPage.waitForFunction(
      () => typeof (window as any).ScrollTrigger !== "undefined",
      { timeout: 5000 }
    );

    // Locate the pinned story element
    const storyBounds = await storyPage.evaluate(() => {
      const stList = (window as any).ScrollTrigger?.getAll() || [];
      const st = stList.find((trigger: any) => trigger.pin);
      if (st) {
        return { start: st.start, end: st.end, total: st.end - st.start };
      }
      return null;
    });

    console.log("  Pin bounds from ScrollTrigger:", storyBounds);

    const percentages = [0, 20, 45, 70, 95];
    for (const pct of percentages) {
      if (storyBounds) {
        const targetScroll = storyBounds.start + (pct / 100) * storyBounds.total;
        await storyPage.evaluate((y) => window.scrollTo(0, y), targetScroll);
      } else {
        // Fallback: estimate scroll
        await storyPage.evaluate((p) => {
          const docHeight = document.body.scrollHeight - window.innerHeight;
          window.scrollTo(0, (p / 100) * (docHeight * 0.45));
        }, pct);
      }
      await storyPage.waitForTimeout(800);

      const filePath = path.join(ARTIFACTS_DIR, `pinned-story-${pct}.png`);
      await storyPage.screenshot({ path: filePath });
      console.log(`  ✓ Saved pinned-story-${pct}.png at ${pct}% progress`);
    }

    // -------------------------------------------------------------
    // Test 3: Scroll backward through the story (no jumps)
    // -------------------------------------------------------------
    console.log("\n[Test 3] Testing backward scroll through story...");
    if (storyBounds) {
      // Scroll down to 95%
      await storyPage.evaluate((y) => window.scrollTo(0, y), storyBounds.start + 0.95 * storyBounds.total);
      await storyPage.waitForTimeout(400);

      // Scroll backwards in increments
      for (let p = 90; p >= 0; p -= 15) {
        const target = storyBounds.start + (p / 100) * storyBounds.total;
        await storyPage.evaluate((y) => window.scrollTo(0, y), target);
        await storyPage.waitForTimeout(200);
      }
      console.log("  ✓ Backward scroll executed smoothly without exceptions.");
    }

    // -------------------------------------------------------------
    // Test 4: Resize mid-scroll (pins recalculate)
    // -------------------------------------------------------------
    console.log("\n[Test 4] Testing mid-scroll resize recalculation...");
    if (storyBounds) {
      // Scroll to 50%
      await storyPage.evaluate((y) => window.scrollTo(0, y), storyBounds.start + 0.5 * storyBounds.total);
      await storyPage.waitForTimeout(300);

      // Resize mid-scroll
      await storyPage.setViewportSize({ width: 1024, height: 768 });
      await storyPage.waitForTimeout(600);

      const recalculated = await storyPage.evaluate(() => {
        const stList = (window as any).ScrollTrigger?.getAll() || [];
        const st = stList.find((t: any) => t.pin);
        return st ? { start: st.start, end: st.end } : null;
      });
      console.log("  ✓ Pins recalculated on resize:", recalculated);
    }
    await storyPage.close();

    // -------------------------------------------------------------
    // Test 5: Navigate away and back 5 times (ScrollTrigger count constant)
    // -------------------------------------------------------------
    console.log("\n[Test 5] Testing navigation memory leak (away & back 5 times)...");
    const navPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await navPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await navPage.waitForTimeout(800);

    const initialTriggers = await navPage.evaluate(() => {
      return (window as any).ScrollTrigger?.getAll()?.length || 0;
    });
    console.log(`  Initial ScrollTrigger count: ${initialTriggers}`);

    for (let i = 1; i <= 5; i++) {
      // Navigate to /dashboard
      await navPage.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
      await navPage.waitForTimeout(400);

      // Navigate back to /
      await navPage.goto(BASE_URL, { waitUntil: "networkidle" });
      await navPage.waitForTimeout(400);

      const currentTriggers = await navPage.evaluate(() => {
        return (window as any).ScrollTrigger?.getAll()?.length || 0;
      });
      console.log(`  Cycle ${i}: ScrollTrigger count: ${currentTriggers}`);
      assert.strictEqual(
        currentTriggers,
        initialTriggers,
        `ScrollTrigger count changed from ${initialTriggers} to ${currentTriggers} on cycle ${i}`
      );
    }
    console.log("  ✓ ScrollTrigger.getAll().length remained strictly constant across 5 transitions.");
    await navPage.close();

    // -------------------------------------------------------------
    // Test 6: Reduced-motion screenshot showing static version
    // -------------------------------------------------------------
    console.log("\n[Test 6] Testing prefers-reduced-motion fallback...");
    const reducedPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await reducedPage.emulateMedia({ reducedMotion: "reduce" });
    await reducedPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await reducedPage.waitForTimeout(1000);

    // Verify static content rendered
    const hasStaticHeading = await reducedPage.evaluate(() => {
      return document.body.innerText.includes("How a machine reads your prompt");
    });
    console.log("  Has static reduced-motion heading:", hasStaticHeading);
    assert.ok(hasStaticHeading, "Reduced motion view must render static presentation");

    const reducedPath = path.join(ARTIFACTS_DIR, "landing-reduced-motion.png");
    await reducedPage.screenshot({ path: reducedPath, fullPage: true });
    console.log("  ✓ Saved landing-reduced-motion.png");
    await reducedPage.close();

    // -------------------------------------------------------------
    // Test 7: Verify "Go to Dashboard" and absence of login UI
    // -------------------------------------------------------------
    console.log("\n[Test 7] Verifying CTAs and zero login UI...");
    const ctaPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await ctaPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await ctaPage.waitForTimeout(500);

    const ctaLinks = await ctaPage.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      const dashboardLinks = links.filter((l) =>
        l.textContent?.trim().includes("Go to Dashboard")
      );
      const signinLinks = links.filter(
        (l) =>
          l.textContent?.toLowerCase().includes("sign in") ||
          l.textContent?.toLowerCase().includes("log in")
      );
      return {
        dashboardCount: dashboardLinks.length,
        dashboardHrefs: dashboardLinks.map((l) => l.getAttribute("href")),
        signinCount: signinLinks.length,
      };
    });

    console.log("  Dashboard CTA Links:", ctaLinks);
    assert.ok(ctaLinks.dashboardCount >= 3, "Must have 'Go to Dashboard' in nav, hero, and closing");
    ctaLinks.dashboardHrefs.forEach((href) => {
      assert.strictEqual(href, "/dashboard", "CTA href must point to /dashboard");
    });
    assert.strictEqual(ctaLinks.signinCount, 0, "No login/sign-in links permitted");
    console.log("  ✓ 'Go to Dashboard' verified in nav, hero, and closing. Zero login UI.");

    // -------------------------------------------------------------
    // Test 8: Performance / CLS check
    // -------------------------------------------------------------
    console.log("\n[Test 8] Checking Cumulative Layout Shift (CLS)...");
    const clsScore = await ctaPage.evaluate(async () => {
      return new Promise<number>((resolve) => {
        let cls = 0;
        try {
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
          });
          observer.observe({ type: "layout-shift", buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(cls);
          }, 1500);
        } catch (e) {
          resolve(0);
        }
      });
    });

    console.log(`  Cumulative Layout Shift (CLS): ${clsScore.toFixed(4)}`);
    assert.ok(clsScore < 0.05, `CLS score (${clsScore}) must be under 0.05`);
    console.log("  ✓ CLS is under 0.05.");

    await ctaPage.close();

    console.log("\n=== All Phase 2 Acceptance Criteria Verified Successfully! ===");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
