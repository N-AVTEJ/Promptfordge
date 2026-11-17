import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('./content/video-report.json', 'utf8'));

const agentSearchVideos = [];
for (const mod of report.modules) {
  for (const vid of mod.videos) {
    if (vid.resolvedBy === 'agent-search') {
      agentSearchVideos.push({
        id: vid.id,
        moduleId: mod.moduleId,
        moduleNumber: mod.moduleNumber,
        title: vid.title || vid.expectedTitle,
        channel: vid.channel || vid.authorName,
        minutes: vid.minutes,
        covers: vid.covers,
        relatedTo: vid.relatedTo || [],
      });
    }
  }
}

console.log(`Found ${agentSearchVideos.length} agent-search videos:`);
console.log(JSON.stringify(agentSearchVideos, null, 2));
