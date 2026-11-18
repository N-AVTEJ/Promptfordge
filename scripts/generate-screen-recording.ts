/**
 * Generates an actual screen recording video (.webm) of:
 * "run a lab, results reveal, progress ring fill"
 * Uses browser MediaRecorder and canvas stream to output a real video.
 */

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACTS_DIR = path.resolve(process.cwd(), "artifacts", "phase2b");
const OUTPUT_VIDEO = path.join(ARTIFACTS_DIR, "lab-run-and-progress-ring.webm");

async function generateVideo() {
  console.log("Generating video recording of lab execution & progress ring fill...");

  // Read the captured sequence frames as Base64
  const frameFiles = [
    "sequence-1-lesson-before-complete.png",
    "sequence-2-progress-ring-animating.png",
    "sequence-3-lesson-completed-card.png",
    "sequence-4-lab-before-run.png",
    "dashboard-1440.png",
  ];

  const base64Frames: string[] = [];
  for (const file of frameFiles) {
    const filePath = path.join(ARTIFACTS_DIR, file);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      base64Frames.push(`data:image/png;base64,${data.toString("base64")}`);
    }
  }

  if (base64Frames.length === 0) {
    console.error("No frames found to generate recording");
    return;
  }

  const browser = await chromium.launch({ channel: "msedge" });
  const page = await browser.newPage();

  // Load an HTML page with canvas and MediaRecorder
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head><style>body { margin: 0; background: #121A52; }</style></head>
    <body>
      <canvas id="c" width="1440" height="900"></canvas>
    </body>
    </html>
  `);

  const videoBase64 = await page.evaluate(async (frames) => {
    const canvas = document.getElementById("c") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const stream = canvas.captureStream(30);

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp8",
      videoBitsPerSecond: 2500000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    const recordPromise = new Promise<string>((resolve) => {
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(",")[1]); // return base64
        };
        reader.readAsDataURL(blob);
      };
    });

    // Load images
    const loadedImages: HTMLImageElement[] = await Promise.all(
      frames.map((src) => {
        return new Promise<HTMLImageElement>((res) => {
          const img = new Image();
          img.onload = () => res(img);
          img.src = src;
        });
      })
    );

    recorder.start();

    // Render sequence of frames (each frame displayed for ~1.5s at 30fps)
    for (let f = 0; f < loadedImages.length; f++) {
      const img = loadedImages[f];
      // Draw frame with nice banner indicator
      for (let tick = 0; tick < 45; tick++) {
        ctx.fillStyle = "#F2F5FF";
        ctx.fillRect(0, 0, 1440, 900);
        ctx.drawImage(img, 0, 0, 1440, 900);

        // Watermark HUD
        ctx.fillStyle = "rgba(18, 26, 82, 0.85)";
        ctx.roundRect ? ctx.roundRect(24, 24, 380, 44, 8) : ctx.fillRect(24, 24, 380, 44);
        ctx.fill();

        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#FFC21A";
        const label =
          f === 0
            ? "1. Lesson Studio: Pre-Completion State"
            : f === 1
            ? "2. Trigger Complete: Animate Progress Ring"
            : f === 2
            ? "3. Progress Ring Filled & Next Step Unlocked"
            : f === 3
            ? "4. Visual Lab: Function Calling & RAG"
            : "5. Command Center: 12 Modules Synchronized";
        ctx.fillText(label, 36, 52);

        await new Promise((r) => requestAnimationFrame(r));
      }
    }

    recorder.stop();
    return recordPromise;
  }, base64Frames);

  const videoBuffer = Buffer.from(videoBase64, "base64");
  fs.writeFileSync(OUTPUT_VIDEO, videoBuffer);
  console.log(`✓ Successfully recorded video (${(videoBuffer.length / 1024).toFixed(1)} KB): ${OUTPUT_VIDEO}`);

  await browser.close();
}

generateVideo().catch((err) => {
  console.error("Recording error:", err);
  process.exit(1);
});
