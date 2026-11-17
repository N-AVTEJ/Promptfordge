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

async function main() {
  for (const id of ['_9x-mAHGgC4', 'gZTQNb0NGjM']) {
    const html = await fetchPage(`https://www.youtube.com/watch?v=${id}`);
    const descMatch = html.match(/"shortDescription":"(.*?)"/);
    console.log(`\n=== ID: ${id} ===`);
    if (descMatch) {
      console.log(descMatch[1].replace(/\\n/g, '\n'));
    }
  }
}

main().catch(console.error);
