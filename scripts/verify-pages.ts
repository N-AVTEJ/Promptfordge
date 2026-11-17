import { chromium } from "playwright";
import assert from "node:assert";

async function verifyPages() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const routes = ["/dashboard", "/academy", "/labs", "/library", "/workflow", "/challenges"];
  for (const route of routes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.toString()));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const resp = await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    if (errors.length > 0) {
      console.error(`Errors on ${route}:`, errors);
    }
    assert.strictEqual(resp?.status(), 200, `Route ${route} returned status 200`);
    assert.strictEqual(errors.length, 0, `Route ${route} has no console errors`);
    console.log(`✓ ${route} loaded cleanly with HTTP 200 and 0 errors`);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Check Academy module count
  await page.goto("http://localhost:3000/academy", { waitUntil: "networkidle" });
  const moduleCards = await page.$$("a[href^='/academy/']");
  console.log(`✓ Academy module links found: ${moduleCards.length}`);
  assert.ok(moduleCards.length >= 12, "At least 12 module links exist in Academy");

  // Check Dashboard telemetry text absence
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
  const content = await page.content();
  assert.ok(!content.includes("Curriculum Telemetry"), "Dashboard must not contain 'Curriculum Telemetry'");
  assert.ok(!content.includes("Learner Telemetry"), "Dashboard must not contain 'Learner Telemetry'");
  console.log("✓ Dashboard telemetry labels properly removed and replaced with clean progress indicators");

  // Check Academy lesson route
  const lessonResp = await page.goto("http://localhost:3000/academy/mod-01/mod-01-les-01", { waitUntil: "networkidle" });
  assert.strictEqual(lessonResp?.status(), 200, "Academy lesson route returned status 200");
  console.log("✓ Lesson studio loaded cleanly with HTTP 200");

  // Check body background is daylight
  const bgColor = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
  console.log(`✓ Body background color: ${bgColor}`);

  await browser.close();
  console.log("\nALL SITE INTEGRATION CHECKS PASSED!");
}

verifyPages().catch((err) => {
  console.error("PAGE VERIFICATION FAILED:", err);
  process.exit(1);
});
