import { CURRICULUM_MODULES } from '../content/modules';
import { MODULE_LESSON_TOPICS } from './generate-pass3-report';

for (const mod of CURRICULUM_MODULES) {
  const topics = MODULE_LESSON_TOPICS[mod.number];
  const allCovers = new Set<string>();
  const allRelated = new Set<string>();
  for (const l of mod.lessons) {
    for (const v of l.videos || []) {
      for (const c of v.covers || []) allCovers.add(c);
      for (const r of v.relatedTo || []) allRelated.add(r);
    }
  }

  console.log(`\n=================== Module ${mod.number}: ${mod.title} ===================`);
  for (const t of topics) {
    const tNorm = t.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isCovered = Array.from(allCovers).some((c) => {
      const cNorm = c.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cNorm === tNorm || cNorm.includes(tNorm) || tNorm.includes(cNorm);
    });
    const isRelated = Array.from(allRelated).some((r) => {
      const rNorm = r.toLowerCase().replace(/[^a-z0-9]/g, '');
      return rNorm === tNorm || rNorm.includes(tNorm) || tNorm.includes(rNorm);
    });
    console.log(`  ${t.padEnd(45)} -> ${isCovered ? 'COVERED' : isRelated ? 'RELATED ONLY' : 'NO VIDEO'}`);
  }
}
