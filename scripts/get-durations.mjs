const ids = process.argv.slice(2);
for (const id of ids) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}`);
    const html = await res.text();
    const m = html.match(/\"approxDurationMs\":\"(\d+)\"/);
    const mins = m ? Math.round(parseInt(m[1], 10) / 60000) : null;
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log(`${id}: ${mins} mins | ${titleMatch ? titleMatch[1] : 'unknown'}`);
  } catch (err) {
    console.log(`${id}: err ${err.message}`);
  }
}
