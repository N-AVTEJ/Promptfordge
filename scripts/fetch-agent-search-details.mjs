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

const list = [
  'ZHCB09O6zUk',
  'ugxPshXr7Ro',
  'zrp3Lr5eeFc',
  'OEQPss-UXhA',
  'KwC8bUZrUKA',
  'yu27PWzJI_Y',
  'ZFKvTIADp0k',
  'RTaZqGflrJ8',
  'zn2ukSnDqSg',
  'GxlOoKI0zxg',
  'QRgayVF5PyM',
  'U8zrqWrTYdc',
  'wcmLgy1-9aQ',
  'g5h-piquf_k',
  'zYGDpG-pTho',
  'l5K4r_TJz_8',
  'DNmIqNjbKoM',
];

async function main() {
  const results = [];
  for (const id of list) {
    try {
      const html = await fetchPage(`https://www.youtube.com/watch?v=${id}`);
      let desc = '';
      const descMatch = html.match(/"shortDescription":"(.*?)"/);
      if (descMatch) {
        try {
          desc = JSON.parse(`"${descMatch[1]}"`);
        } catch {
          desc = descMatch[1];
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

      // Check first lines or sentences of description
      const cleanDesc = desc.replace(/\\n/g, '\n').trim();
      const firstLines = cleanDesc
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 20 && !l.startsWith('http') && !l.startsWith('👉') && !l.startsWith('Join') && !l.startsWith('Follow'));

      results.push({
        id,
        title,
        firstLines: firstLines.slice(0, 3),
        fullDescStart: cleanDesc.slice(0, 300),
      });
    } catch (e) {
      results.push({ id, error: e.message });
    }
  }

  fs.writeFileSync('./scripts/agent-search-details.json', JSON.stringify(results, null, 2));
  console.log('Saved agent-search-details.json');
}

main().catch(console.error);
