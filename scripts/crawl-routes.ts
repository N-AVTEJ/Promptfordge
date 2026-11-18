/**
 * Route Crawler and Acceptance Verification Script
 * Visits /academy, every module (1-12), every lab, /workflow, /dashboard
 * Asserts:
 *  - Exactly 12 modules
 *  - Titles match modules.ts
 *  - Every module has at least one reachable lab
 *  - No dead links (HTTP status !== 404)
 * Outputs markdown audit report
 */

import http from "node:http";
import { spawn, ChildProcess } from "node:child_process";
import { CURRICULUM_MODULES } from "../content/modules";

const PORT = 3088;
const BASE_URL = `http://localhost:${PORT}`;

interface CrawlResult {
  route: string;
  status: number;
  titleMatches?: boolean;
  notes?: string;
}

async function fetchRoute(route: string): Promise<{ status: number; text: string; location?: string }> {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${route}`;
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode || 500,
            text: data,
            location: res.headers.location,
          });
        });
      })
      .on("error", (err) => {
        resolve({
          status: 500,
          text: err.message,
        });
      });
  });
}

async function waitForServer(retries = 30, delayMs = 1000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetchRoute("/");
      if (res.status === 200) {
        return true;
      }
    } catch {
      // Retry
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

async function runCrawl() {
  console.log("=============================================================");
  console.log("Starting PromptForge Acceptance Route Crawler on Port", PORT);
  console.log("=============================================================\n");

  // Step 1: Start Next.js production server
  const serverProcess: ChildProcess = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "start", "-p", String(PORT)],
    {
      stdio: "pipe",
      shell: true,
      env: { ...process.env, PORT: String(PORT) },
    }
  );

  serverProcess.stderr?.on("data", (d) => {
    // console.error(d.toString());
  });

  const ready = await waitForServer();
  if (!ready) {
    console.error("FATAL: Next.js production server failed to start on port", PORT);
    serverProcess.kill();
    process.exit(1);
  }

  console.log("✓ Next.js production server is live on", BASE_URL);

  const crawlReport: CrawlResult[] = [];
  let failures = 0;

  // 1. Verify Module Count
  console.log(`\n[1/5] Verifying Module Count Single Source of Truth...`);
  if (CURRICULUM_MODULES.length === 12) {
    console.log(`✓ Exactly 12 curriculum modules verified in content/modules.ts`);
  } else {
    console.error(`✗ Expected 12 modules, found ${CURRICULUM_MODULES.length}`);
    failures++;
  }

  // 2. Crawl Core Hub Routes
  console.log(`\n[2/5] Crawling Core Hub Routes (/academy, /labs, /workflow, /dashboard, /arena)...`);
  const coreRoutes = ["/academy", "/labs", "/workflow", "/dashboard", "/arena"];
  for (const route of coreRoutes) {
    const res = await fetchRoute(route);
    const passed = res.status >= 200 && res.status < 400;
    crawlReport.push({
      route,
      status: res.status,
      notes: passed ? "OK" : "Dead link",
    });
    if (!passed) failures++;
    console.log(`  ${passed ? "✓" : "✗"} ${route.padEnd(20)} [HTTP ${res.status}]`);
  }

  // 3. Crawl Every Module Overview and Verify Titles Match modules.ts
  console.log(`\n[3/5] Crawling All 12 Module Pages (/academy/mod-XX)...`);
  for (const mod of CURRICULUM_MODULES) {
    const modRoute = `/academy/${mod.id}`;
    const res = await fetchRoute(modRoute);
    const passed = res.status === 200;
    const titleMatch = res.text.includes(mod.title);

    crawlReport.push({
      route: modRoute,
      status: res.status,
      titleMatches: titleMatch,
      notes: `Module ${mod.number}: "${mod.title}" (Match: ${titleMatch})`,
    });

    if (!passed || !titleMatch) failures++;
    console.log(
      `  ${passed && titleMatch ? "✓" : "✗"} ${modRoute.padEnd(20)} [HTTP ${res.status}] Title: "${mod.title.slice(0, 35)}..." (Match: ${titleMatch})`
    );
  }

  // 4. Crawl Every Module's Associated Labs & Verify Reachability
  console.log(`\n[4/5] Crawling Associated Labs for Every Module (1 to 12)...`);
  const testedLabRoutes = new Set<string>();

  for (const mod of CURRICULUM_MODULES) {
    if (!mod.labs || mod.labs.length === 0) {
      console.error(`✗ Module ${mod.number} has ZERO associated labs!`);
      failures++;
      continue;
    }

    let reachableLabFound = false;

    for (const lab of mod.labs) {
      let status = 0;
      let finalRoute = lab.route;

      const res = await fetchRoute(lab.route);
      status = res.status;

      // Handle redirect (e.g. 307/308 from /labs/workflow -> /workflow)
      if (res.status >= 300 && res.status < 400 && res.location) {
        finalRoute = res.location;
        const redirRes = await fetchRoute(res.location);
        status = redirRes.status;
      }

      const passed = status >= 200 && status < 400;
      if (passed) reachableLabFound = true;

      if (!testedLabRoutes.has(lab.route)) {
        testedLabRoutes.add(lab.route);
        crawlReport.push({
          route: lab.route,
          status,
          notes: `Module ${mod.number} Lab [${lab.status}]: ${lab.title}`,
        });
        console.log(
          `  ${passed ? "✓" : "✗"} ${lab.route.padEnd(25)} [HTTP ${status}] ${lab.title} (${lab.status})`
        );
      }
    }

    if (!reachableLabFound) {
      console.error(`✗ Module ${mod.number} has NO reachable labs!`);
      failures++;
    }
  }

  // 5. Check Lessons Reachability (Sample first lesson of each module)
  console.log(`\n[5/5] Crawling First Lesson of Each Module...`);
  for (const mod of CURRICULUM_MODULES) {
    const firstLesson = mod.lessons[0];
    if (firstLesson) {
      const lessonRoute = `/academy/${mod.id}/${firstLesson.id}`;
      const res = await fetchRoute(lessonRoute);
      const passed = res.status === 200;
      crawlReport.push({
        route: lessonRoute,
        status: res.status,
        notes: `Lesson ${mod.number}.1: ${firstLesson.title}`,
      });
      if (!passed) failures++;
      console.log(`  ${passed ? "✓" : "✗"} ${lessonRoute.padEnd(36)} [HTTP ${res.status}]`);
    }
  }

  // Teardown
  serverProcess.kill();

  console.log("\n=============================================================");
  console.log("Crawl Summary Report");
  console.log("=============================================================");
  console.log(`Total Routes Crawled: ${crawlReport.length}`);
  console.log(`Total Failures / Dead Links: ${failures}`);

  if (failures === 0) {
    console.log("🎉 ALL ACCEPTANCE ASSERTIONS PASSED!");
    process.exit(0);
  } else {
    console.error(`❌ CRAWL ENCOUNTERED ${failures} FAILURES!`);
    process.exit(1);
  }
}

runCrawl().catch((err) => {
  console.error("Fatal crawler error:", err);
  process.exit(1);
});
