import https from 'node:https';

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
    } catch (e) {}
  }

  let shortDesc = '';
  const descMatch = html.match(/"shortDescription":"(.*?)"/);
  if (descMatch) {
    try {
      shortDesc = JSON.parse(`"${descMatch[1]}"`);
    } catch {
      shortDesc = descMatch[1];
    }
  }

  let title = '';
  const titleMatch = html.match(/"title":"(.*?)"/);
  if (titleMatch) {
    try {
      title = JSON.parse(`"${titleMatch[1]}"`);
    } catch {
      title = titleMatch[1];
    }
  }

  const chapters = initialData ? findChapters(initialData) : [];
  return { id, title, shortDesc, chapters };
}

async function main() {
  const ids = ['7j1t3UZA1TY', '_9x-mAHGgC4', 'gZTQNb0NGjM', 'g5h-piquf_k'];
  for (const id of ids) {
    console.log('====================================');
    console.log('CHECKING ID:', id);
    const res = await checkVideo(id);
    console.log('TITLE:', res.title);
    console.log('DESC:', res.shortDesc.slice(0, 400));
    console.log('CHAPTERS:', res.chapters.length ? JSON.stringify(res.chapters) : 'None');
  }
}

main().catch(console.error);
