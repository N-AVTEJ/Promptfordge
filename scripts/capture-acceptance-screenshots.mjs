import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.resolve(process.cwd(), "artifacts/screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log("Launching Edge browser for acceptance screenshot capture...");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  const errors = [];

  try {
    // 1. Responsive Viewports for "/" and "/dashboard"
    const viewports = [
      { width: 360, height: 800, name: "360-mobile" },
      { width: 768, height: 1024, name: "768-tablet" },
      { width: 1440, height: 900, name: "1440-desktop" },
    ];

    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          console.error(`Browser console error [${vp.name}]:`, msg.text());
          errors.push(`[${vp.name}] ${msg.text()}`);
        }
      });

      // Landing page
      console.log(`Capturing Landing Page at ${vp.width}px...`);
      await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `landing-${vp.name}.png`),
        fullPage: false,
      });

      // Dashboard
      console.log(`Capturing Dashboard at ${vp.width}px...`);
      await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `dashboard-${vp.name}.png`),
        fullPage: false,
      });

      await page.close();
    }

    // 2. Landing Page Pinned Story: 5 Stages
    console.log("Capturing 5 scroll positions for pinned story stages...");
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    desktopPage.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(`[desktop-pinned] ${msg.text()}`);
      }
    });

    await desktopPage.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(1500);

    // Find the section with id="transformer-story" or containing "Educational simulation"
    const sectionTop = await desktopPage.evaluate(() => {
      const el = document.querySelector("#transformer-story");
      if (el) {
        return el.getBoundingClientRect().top + window.scrollY;
      }
      return 900;
    });

    console.log(`Pinned section starts around scrollY = ${sectionTop}px`);

    // We want 5 stages across the 2600px scroll range (progress = 0.1, 0.3, 0.5, 0.7, 0.9)
    const stageScrollOffsets = [
      sectionTop + 100,
      sectionTop + 650,
      sectionTop + 1200,
      sectionTop + 1750,
      sectionTop + 2300,
    ];

    for (let i = 0; i < stageScrollOffsets.length; i++) {
      const scrollY = stageScrollOffsets[i];
      await desktopPage.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollY);
      await desktopPage.waitForTimeout(800);

      const stageInfo = await desktopPage.evaluate(() => {
        const badge = document.querySelector("#transformer-story [class*='font-mono'][class*='uppercase']");
        return badge ? badge.textContent : "Stage";
      });

      console.log(`Capturing Pinned Story Stage ${i + 1} at scrollY ${scrollY}px (${stageInfo})...`);
      await desktopPage.screenshot({
        path: path.join(OUTPUT_DIR, `pinned-story-stage-${i + 1}.png`),
        fullPage: false,
      });
    }

    await desktopPage.close();

    // 3. Lesson Page with YouTube / Coming Soon Placeholder
    console.log("Capturing Academy Lesson Page...");
    const lessonPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    lessonPage.on("console", (msg) => {
      if (msg.type() === "error") {
        // Ignore expected third-party youtube iframe blocked errors in headless if any
        if (!msg.text().includes("youtube") && !msg.text().includes("doubleclick")) {
          errors.push(`[lesson-page] ${msg.text()}`);
        }
      }
    });

    await lessonPage.goto("http://localhost:3000/academy/mod-01/mod-01-les-01", { waitUntil: "networkidle" });
    await lessonPage.waitForTimeout(1500);

    const embedStatus = await lessonPage.evaluate(() => {
      const comingSoon = document.body.innerText.includes("Video Coming Soon") || document.body.innerText.includes("coming soon");
      const iframe = document.querySelector("iframe[src*='youtube']");
      return { comingSoon, hasIframe: !!iframe };
    });

    console.log("Lesson Page embed status:", embedStatus);

    await lessonPage.screenshot({
      path: path.join(OUTPUT_DIR, "academy-lesson-embed.png"),
      fullPage: false,
    });
    await lessonPage.close();

    // 4. Reduced-Motion Fallback Verification
    console.log("Capturing reduced-motion fallback...");
    const reducedMotionPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });

    await reducedMotionPage.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await reducedMotionPage.waitForTimeout(1000);

    // Scroll to the pinned story section
    await reducedMotionPage.evaluate(() => {
      const el = document.querySelector("#transformer-story");
      if (el) el.scrollIntoView();
    });
    await reducedMotionPage.waitForTimeout(500);

    await reducedMotionPage.screenshot({
      path: path.join(OUTPUT_DIR, "landing-reduced-motion-fallback.png"),
      fullPage: false,
    });
    await reducedMotionPage.close();

    console.log("\n--- ACCEPTANCE VERIFICATION SUMMARY ---");
    console.log(`Screenshots generated in: ${OUTPUT_DIR}`);
    const files = fs.readdirSync(OUTPUT_DIR);
    files.forEach((f) => console.log(`  - ${f}`));
    console.log(`Total console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.warn("Errors caught:", errors);
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
