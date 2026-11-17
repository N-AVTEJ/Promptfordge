import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.resolve(process.cwd(), "artifacts/screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log("Launching Edge browser for Content Pass acceptance screenshots...");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  const targets = [
    {
      name: "m1",
      path: "/academy/mod-01/mod-01-les-01",
      label: "M1: Introduction to Prompt Engineering (Lesson 1: Evolution of AI and LLMs)",
    },
    {
      name: "m5",
      path: "/academy/mod-05/mod-05-les-01",
      label: "M5: Prompt Optimization Techniques (Lesson 1: Iterative refinement)",
    },
    {
      name: "m8",
      path: "/academy/mod-08/mod-08-les-01",
      label: "M8: Security in Prompt Engineering (Lesson 1: Prompt injection)",
    },
    {
      name: "m12",
      path: "/academy/mod-12/mod-12-les-01",
      label: "M12: Production Prompt Engineering and Responsible AI (Lesson 1: Prompting vs RAG vs fine-tuning)",
    },
  ];

  try {
    for (const t of targets) {
      // Desktop 1440x900
      console.log(`Capturing Desktop: ${t.label}...`);
      const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await desktopPage.goto(`http://localhost:3000${t.path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await desktopPage.waitForTimeout(2000);
      const desktopFile = path.join(OUTPUT_DIR, `${t.name}-lesson-desktop.png`);
      await desktopPage.screenshot({ path: desktopFile, fullPage: false });
      await desktopPage.close();

      // Mobile 360x800
      console.log(`Capturing 360px Mobile: ${t.label}...`);
      const mobilePage = await browser.newPage({ viewport: { width: 360, height: 800 } });
      await mobilePage.goto(`http://localhost:3000${t.path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await mobilePage.waitForTimeout(2000);
      const mobileFile = path.join(OUTPUT_DIR, `${t.name}-lesson-360px.png`);
      await mobilePage.screenshot({ path: mobileFile, fullPage: false });
      await mobilePage.close();
    }

    // Also capture Academy catalog overview showing all 12 modules
    console.log("Capturing Academy Catalog Overview (Desktop)...");
    const catalogPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await catalogPage.goto("http://localhost:3000/academy", { waitUntil: "domcontentloaded", timeout: 15000 });
    await catalogPage.waitForTimeout(2000);
    await catalogPage.screenshot({
      path: path.join(OUTPUT_DIR, "academy-catalog-12-modules.png"),
      fullPage: true,
    });
    await catalogPage.close();

    console.log("Screenshots captured successfully in artifacts/screenshots/");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
