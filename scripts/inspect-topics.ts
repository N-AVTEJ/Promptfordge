import { CURRICULUM_MODULES } from "../content/modules";

for (const m of CURRICULUM_MODULES) {
  console.log(`Module ${m.number}: ${m.title} (${m.lessons.length} lessons)`);
  for (const l of m.lessons) {
    const vids = l.videos || [];
    const okVids = vids.filter((v) => v.status === "ok");
    const coversAll = okVids.flatMap((v) => v.covers || []);
    console.log(`  - [${l.id}] "${l.title}" (status: ${l.status}) | ok videos: ${okVids.length} | covers: ${JSON.stringify(coversAll)}`);
  }
}
