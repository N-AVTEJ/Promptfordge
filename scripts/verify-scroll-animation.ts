import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

async function verifyLandingAnimation() {
  console.log("=== Verifying Phase 2 Landing Scroll Animation ===");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.toString()));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  assert.strictEqual(errors.length, 0, "No console or page errors on initial load");

  // 1. Verify ScrollTrigger exists and is pinned
  const stInfo = await page.evaluate(() => {
    const stList = (window as unknown as { ScrollTrigger?: { getAll: () => any[] } })
      .ScrollTrigger?.getAll() || [];
    const st = stList.find((t: any) => t.pin);
    if (!st) return null;
    return {
      start: st.start,
      end: st.end,
      total: st.end - st.start,
    };
  });
  console.log("ScrollTrigger pin bounds:", stInfo);
  assert.ok(stInfo, "Pinned ScrollTrigger instance must exist");
  assert.ok(stInfo.total > 2000, "Pin distance must cover the 400vh scrub story");

  const outDir = path.resolve("artifacts/phase2/verified_scroll");
  fs.mkdirSync(outDir, { recursive: true });

  // Test Points in the pinned story: 0%, 20%, 45%, 70%, 92%
  const testStages = [
    { name: "stage1-prompt", progress: 0.05 },
    { name: "stage2-tokens", progress: 0.22 },
    { name: "stage3-vectors", progress: 0.48 },
    { name: "stage4-attention", progress: 0.72 },
    { name: "stage5-stream", progress: 0.92 },
  ];

  for (const stg of testStages) {
    const targetY = stInfo.start + stInfo.total * stg.progress;
    await page.evaluate((pos) => window.scrollTo(0, pos), targetY);
    await page.waitForTimeout(400);

    const visualState = await page.evaluate(() => {
      const getOpacity = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? parseFloat(window.getComputedStyle(el).opacity) : null;
      };
      const getTransform = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? window.getComputedStyle(el).transform : null;
      };

      return {
        sentenceCardOpacity: getOpacity(".desktop-sentence-card"),
        tokensOpacity: getOpacity(".desktop-tokens-layer"),
        firstTokenOpacity: getOpacity(".desktop-token-11956"),
        firstTokenTransform: getTransform(".desktop-token-11956"),
        loopsTokenTransform: getTransform(".desktop-token-19445"),
        attnLinesOpacity: getOpacity(".desktop-attn-line"),
        outputConsoleOpacity: getOpacity(".desktop-output-console"),
      };
    });

    console.log(
      `\nChecking ${stg.name} (progress ~${(stg.progress * 100).toFixed(0)}%):`,
      visualState
    );

    if (stg.progress === 0.05) {
      assert.ok(
        (visualState.sentenceCardOpacity ?? 0) > 0.8,
        "Stage 1: Sentence card must be visible"
      );
      assert.ok(
        visualState.tokensOpacity === null || (visualState.firstTokenOpacity ?? 0) < 0.2,
        "Stage 1: Tokens must be hidden"
      );
    } else if (stg.progress === 0.22) {
      assert.ok(
        (visualState.firstTokenOpacity ?? 0) > 0.7,
        "Stage 2: Tokens must be revealed"
      );
      assert.ok(
        (visualState.sentenceCardOpacity ?? 1) < 0.2,
        "Stage 2: Sentence card must fade"
      );
    } else if (stg.progress === 0.48) {
      assert.ok(
        (visualState.firstTokenOpacity ?? 0) > 0.7,
        "Stage 3: Tokens must stay visible"
      );
      assert.ok(
        visualState.firstTokenTransform !== "none",
        "Stage 3: Tokens must translate to scatter positions"
      );
    } else if (stg.progress === 0.72) {
      assert.ok(
        (visualState.attnLinesOpacity ?? 0) > 0.4,
        "Stage 4: Attention lines must draw"
      );
    } else if (stg.progress === 0.92) {
      assert.ok(
        (visualState.outputConsoleOpacity ?? 0) > 0.8,
        "Stage 5: Output console must be visible"
      );
    }

    const scrPath = path.join(outDir, `${stg.name}.png`);
    await page.screenshot({ path: scrPath });
    console.log(`  ✓ Captured ${stg.name}.png`);
  }

  // 2. Reverse scroll check: scroll from bottom back to 0
  console.log("\n[Reverse Scroll Check] Scrubbing backwards to 0%...");
  await page.evaluate((pos) => window.scrollTo(0, pos), stInfo.start);
  await page.waitForTimeout(500);
  const revertedState = await page.evaluate(() => {
    const el = document.querySelector(".desktop-sentence-card");
    return el ? parseFloat(window.getComputedStyle(el).opacity) : 0;
  });
  console.log("Reverted sentence card opacity:", revertedState);
  assert.ok(
    revertedState > 0.8,
    "Reverse scroll must smoothly restore Stage 1 sentence card"
  );

  // 3. Technique rows animation check
  console.log("\n[Technique Rows Check] Scrolling to TechniqueRows...");
  const techRowEl = await page.$("section[aria-label='Prompting techniques comparison']");
  assert.ok(techRowEl, "TechniqueRows section must exist");
  const techBox = await techRowEl.boundingBox();
  if (techBox) {
    await page.evaluate((y) => window.scrollTo(0, y), techBox.y);
    await page.waitForTimeout(600);
    const barWidth = await page.evaluate(() => {
      const bar = document.querySelector(
        "section[aria-label='Prompting techniques comparison'] .bg-ultramarine"
      );
      return bar ? bar.getAttribute("style") : null;
    });
    console.log("Technique bar width style after scroll:", barWidth);
    assert.ok(
      barWidth && barWidth.includes("%") && !barWidth.includes("0%"),
      "Token bars must draw when section enters view"
    );
  }

  console.log("\n✓ ALL SCROLL ANIMATION TESTS PASSED PERFECTLY!");
  await browser.close();
}

verifyLandingAnimation().catch((err) => {
  console.error("VERIFICATION FAILED:", err);
  process.exit(1);
});
