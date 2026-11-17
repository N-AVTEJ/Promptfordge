import { fetchPage } from './inspect-m8.mjs';

async function check(id) {
  const html = await fetchPage(`https://www.youtube.com/watch?v=${id}`);
  const idx = html.indexOf('"shortDescription":"');
  if (idx !== -1) {
    const end = html.indexOf('","isCrawlable"', idx);
    console.log(`\n=== ID: ${id} ===`);
    console.log(html.slice(idx + 20, end).replace(/\\n/g, '\n').replace(/\\"/g, '"').slice(0, 500));
  }
}

async function main() {
  await check(process.argv[2]);
}

main().catch(console.error);
