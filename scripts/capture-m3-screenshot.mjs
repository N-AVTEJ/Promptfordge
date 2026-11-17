import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.resolve(process.cwd(), "artifacts/screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log("Launching Edge browser for M3 Honest Coverage screenshot...");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  try {
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    console.log("Navigating to /academy/mod-03/mod-03-les-01 ...");
    await desktopPage.goto("http://localhost:3000/academy/mod-03/mod-03-les-01", {
      waitUntil: "networkidle",
      timeout: 15000,
    });
    await desktopPage.waitForTimeout(2000);

    const mainFile = path.join(OUTPUT_DIR, "m3-lesson-honest-coverage.png");
    await desktopPage.screenshot({ path: mainFile, fullPage: false });
    console.log(`Saved screenshot to: ${mainFile}`);

    const desktopFile = path.join(OUTPUT_DIR, "m3-lesson-honest-coverage-desktop.png");
    await desktopPage.screenshot({ path: desktopFile, fullPage: true });
    console.log(`Saved full page to: ${desktopFile}`);

    const mobilePage = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await mobilePage.goto("http://localhost:3000/academy/mod-03/mod-03-les-01", {
      waitUntil: "networkidle",
      timeout: 15000,
    });
    await mobilePage.waitForTimeout(2000);
    const mobileFile = path.join(OUTPUT_DIR, "m3-lesson-honest-coverage-360px.png");
    await mobilePage.screenshot({ path: mobileFile, fullPage: false });
    console.log(`Saved mobile screenshot to: ${mobileFile}`);
    await mobilePage.close();

    await desktopPage.close();
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
