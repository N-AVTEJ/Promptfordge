import { fetchPage } from './inspect-m8.mjs';

async function main() {
  const html = await fetchPage('https://www.youtube.com/watch?v=g5h-piquf_k');
  const idx = html.indexOf('"shortDescription":"');
  if (idx !== -1) {
    const end = html.indexOf('","isCrawlable"', idx);
    console.log(html.slice(idx + 20, end).replace(/\\n/g, '\n').replace(/\\"/g, '"'));
  }
}

main().catch(console.error);
