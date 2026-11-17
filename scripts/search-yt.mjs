import fs from "node:fs";

export async function checkVideo(id) {
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    if (!oembedRes.ok) return null;
    const oembed = await oembedRes.json();
    
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    const html = await pageRes.text();
    const durationMatch = html.match(/"approxDurationMs":"(\d+)"/);
    const dateMatch = html.match(/datePublished"\s*content="([^"]+)"/);
    const descMatch = html.match(/"shortDescription":"(.*?)"/);
    const mins = durationMatch ? Math.round(parseInt(durationMatch[1], 10) / 60000) : null;
    const date = dateMatch ? dateMatch[1] : null;
    const desc = descMatch ? descMatch[1].replace(/\\n/g, " ") : "";
    
    return {
      id,
      title: oembed.title,
      author: oembed.author_name,
      minutes: mins,
      published: date,
      desc: desc.slice(0, 300),
      isEligible: mins !== null && mins >= 4 && date && parseInt(date.slice(0, 4), 10) >= 2023
    };
  } catch (err) {
    return null;
  }
}

export async function searchYouTube(query) {
  console.log(`\n=== Searching: "${query}" ===`);
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  const text = await res.text();
  
  // Specific to search result video items
  const idMatches = [...text.matchAll(/"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/g)];
  const seen = new Set();
  const ids = [];
  for (const m of idMatches) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      ids.push(m[1]);
    }
  }

  console.log(`Found ${ids.length} search videoRenderer IDs. Checking top 10...`);
  const eligible = [];
  for (const id of ids.slice(0, 10)) {
    const info = await checkVideo(id);
    if (info) {
      console.log(`  - [${info.isEligible ? "ELIGIBLE" : "SKIP"}] ${info.id} | ${info.minutes}m | ${info.published?.slice(0,4)} | ${info.author} | "${info.title}"`);
      if (info.isEligible) {
        console.log(`      Desc: ${info.desc.slice(0, 180)}...`);
        eligible.push(info);
      }
    }
  }
  return eligible;
}

const query = process.argv[2];
if (query) {
  if (query.startsWith("check:")) {
    const id = query.replace("check:", "").trim();
    const info = await checkVideo(id);
    console.log(JSON.stringify(info, null, 2));
  } else {
    await searchYouTube(query);
  }
}
