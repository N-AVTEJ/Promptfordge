const ids = process.argv.slice(2);
for (const id of ids) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}`);
    const html = await res.text();
    const m = html.match(/"approxDurationMs":"(\d+)"/);
    const mins = m ? Math.round(parseInt(m[1], 10) / 60000) : null;
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const dateMatch = html.match(/datePublished"\s*content="([^"]+)"/);
    const channelMatch = html.match(/ownerChannelName"\s*content="([^"]+)"/);
    console.log(`${id}: ${mins} mins | ${dateMatch ? dateMatch[1] : 'unknown-date'} | ${channelMatch ? channelMatch[1] : 'unknown-channel'} | ${titleMatch ? titleMatch[1] : 'unknown'}`);
  } catch (err) {
    console.log(`${id}: err ${err.message}`);
  }
}
