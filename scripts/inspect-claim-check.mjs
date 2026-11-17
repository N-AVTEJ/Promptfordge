import https from 'node:https';
import fs from 'node:fs';

export function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    ).on('error', reject);
  });
}

function findChapters(obj, results = []) {
  if (!obj || typeof obj !== 'object') return results;
  if (obj.chapterRenderer) {
    const r = obj.chapterRenderer;
    const title = r.title?.simpleText || r.title?.runs?.map((x) => x.text).join('') || '';
    const timeSec = Math.floor((r.timeRangeStartMillis || 0) / 1000);
    results.push({ title, timeSec });
  }
  for (const key of Object.keys(obj)) {
    findChapters(obj[key], results);
  }
  return results;
}

async function checkVideo(id) {
  const html = await fetchPage(`https://www.youtube.com/watch?v=${id}`);
  let initialData = null;
  const match = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.+?});/s);
  if (match) {
    try {
      initialData = JSON.parse(match[1]);
    } catch (e) {
      // try fallback parse
    }
  }

  // Also check if there are chapters in marker data
  const chapters = initialData ? findChapters(initialData) : [];
  return { id, chapters, initialDataFound: !!initialData, html };
}

async function main() {
  const { chapters, html, initialDataFound } = await checkVideo('uDIW34h8cmM');
  console.log('Initial data found:', initialDataFound);
  console.log('Chapters found:', chapters.length);
  if (chapters.length > 0) {
    console.log(JSON.stringify(chapters, null, 2));
  } else {
    // Look for macroMarkersListItemRenderer or chapters in html
    const markerMatches = [...html.matchAll(/"title":\{"(?:simpleText|runs)":([^}]+)\}.*?"timeRangeStartMillis":(\d+)/g)];
    console.log('Regex marker matches:', markerMatches.length);
    for (const m of markerMatches.slice(0, 30)) {
      console.log(m[1], Math.floor(parseInt(m[2], 10) / 1000) + 's');
    }
  }
}

main().catch(console.error);
