import { LESSON_ENRICHMENT } from './enrich-curriculum';

for (const [lesId, data] of Object.entries(LESSON_ENRICHMENT)) {
  console.log(`\nLesson: ${lesId}`);
  for (const v of data.videos) {
    console.log(`  - [${v.status}] ${v.id} (${v.level}, ${v.resolvedBy}): covers=[${v.covers.join(', ')}], relatedTo=[${(v.relatedTo||[]).join(', ')}]`);
  }
}
