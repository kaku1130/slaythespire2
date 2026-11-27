process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parse: parseEffect} = require('../relic/sync-untapped-descriptions.cjs');
const source = 'https://sts2.untapped.gg/en/enchantments';
const sourceDir = 'data/enchantments/source';
const decode = text => text.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(+code))
  .replace(/&(amp|quot|apos|lt|gt|nbsp);/g, (_, entity) => ({amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' '})[entity]);
const text = html => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

async function load(url, file) {
  if (process.argv.includes('--cached')) return fs.readFileSync(file, 'utf8');
  const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
  assert(response.ok, 'HTTP ' + response.status + ': ' + url);
  const html = await response.text();
  fs.writeFileSync(file, html);
  return html;
}

function parseDetail(html, url) {
  const name = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
  const description = html.match(/<p\b[^>]*class="page-module-[^"]*__description"[^>]*>([\s\S]*?)<\/p>/);
  assert(name && description, 'Missing enchantment content: ' + url);
  const descEnParts = parseEffect('<div class="page-module-enchantments__description">' + description[1] + '</div>');
  const blocks = [...html.matchAll(/<dt>Found in<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)].map(match => match[1]);
  blocks.push(...[...html.matchAll(/<aside\b[^>]*class="RelatedItems-[^"]*__section"[^>]*>([\s\S]*?)<\/aside>/g)].map(match => match[1]));
  const foundIn = new Map();
  for (const block of blocks) for (const match of block.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = new URL(decode(match[1]), source).href;
    if (!/\/en\/(relics|cards|events)\//.test(href)) continue;
    const cardName = match[2].match(/\brole="img"\s+aria-label="([^"]+)"/)?.[1];
    const iconName = match[2].match(/<img\b[^>]*alt="([^"]+)"/)?.[1];
    const label = cardName || iconName ? decode(cardName || iconName) : text(match[2]);
    assert(label, 'Missing Found in name: ' + href);
    foundIn.set(href, {name: label, url: href});
  }
  return {name: text(name[1]), descEnParts, foundIn: [...foundIn.values()]};
}

async function main() {
  fs.mkdirSync(sourceDir, {recursive: true});
  fs.mkdirSync('assets/enchantments/images', {recursive: true});
  const html = await load(source, sourceDir + '/index.html');
  const links = [...new Set([...html.matchAll(/<a\b[^>]*href="(\/en\/enchantments\/[^"?#]+)"[^>]*>/g)].map(match => match[1]))];
  assert.equal(links.length, 22, 'Expected exactly 22 source enchantments');
  const sharp = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
  const items = new Array(links.length), assets = {};
  let cursor = 0;
  await Promise.all(Array.from({length: 3}, async () => {
    while (cursor < links.length) {
      const index = cursor++, href = links[index], slug = href.split('/').at(-1);
      const url = new URL(href, source).href;
      const detail = await load(url, sourceDir + '/' + slug + '.html');
      const content = parseDetail(detail, url);
      const card = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].find(match => match[1] === href);
      const src = card?.[2].match(/<img\b[^>]*\ssrc="([^"]+)"/)?.[1];
      assert(src, 'Missing enchantment icon: ' + slug);
      const imageUrl = new URL(decode(src), source).searchParams.get('url');
      assert(imageUrl?.startsWith('https://sts2json.untapped.gg/art/enchantments/'), 'Unexpected icon URL: ' + imageUrl);
      const image = 'assets/enchantments/images/' + slug + '.webp';
      if (!fs.existsSync(image)) {
        assert(!process.argv.includes('--cached'), 'Missing cached image: ' + image);
        const response = await fetch(imageUrl, {signal: AbortSignal.timeout(30000)});
        assert(response.ok, 'Missing source image: ' + imageUrl);
        await sharp(Buffer.from(await response.arrayBuffer())).webp({lossless: true}).toFile(image);
      }
      assets[imageUrl] = image;
      items[index] = {id: slug.toUpperCase().replaceAll('-', '_'), slug, ...content, image, imageUrl, sourceEn: url};
      console.log('Synced ' + content.name + ': ' + content.foundIn.length + ' Found in sources');
    }
  }));
  assert.equal(new Set(items.map(item => item.id)).size, 22);
  fs.writeFileSync('data/enchantments/catalog.json', JSON.stringify({source, checkedAt: new Date().toISOString(), total: items.length, items}, null, 2) + '\n');
  fs.writeFileSync('data/enchantments/assets.json', JSON.stringify(assets, null, 2) + '\n');
}
module.exports = {parseDetail};
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
