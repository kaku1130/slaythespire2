process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const assetPath = require('./asset-paths.cjs');
const source = 'https://sts2.untapped.gg/en/enemies';
const snapshot = 'data/monster/source/untapped-enemies.html';
const regions = ['Overgrowth', 'Underdocks', 'Hive', 'Glory'];
async function parse(html) {
  const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
  const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    // Only replay the saved document's inline streaming instructions. No remote requests.
    await page.setContent(html.replace(/<script\b[^>]*src=[^>]*>[\s\S]*?<\/script>/g, ''));
    const items = await page.evaluate(({regions, source}) => regions.flatMap(region => {
      const heading = [...document.querySelectorAll('h2')].find(node => node.textContent === region);
      if (!heading) throw new Error('Missing region: ' + region);
      return [...heading.closest('section').querySelectorAll('a[href*="/enemies/encounters/"]')].map(card => {
        const url = new URL(card.getAttribute('href'), source).href;
        const members = [...card.querySelectorAll('img[alt]')].flatMap(img => {
          const src = new URL(img.getAttribute('src'), source);
          const imageSource = src.searchParams.get('url') || src.href;
          return img.alt && imageSource.includes('/art/enemies/') ? [{name: img.alt, imageSource}] : [];
        });
        const hp = [...card.querySelectorAll('[class*="HealthBar-"][class*="__value"]')].map(node => node.textContent.trim());
        if (members.length !== hp.length) throw new Error(card.getAttribute('aria-label') + ': unmatched HP');
        members.forEach((member, i) => { member.hp = hp[i]; });
        return {id: region.toLowerCase() + '-' + url.split('/').pop(), name: card.querySelector('h4').textContent.trim(), region,
          type: card.querySelector('[class*="__poolTag"]').textContent.trim(), url, members};
      });
    }), {regions, source});
    assert.equal(items.length, await page.locator('a[href*="/enemies/encounters/"]').count());
    assert.equal(new Set(items.map(item => item.id)).size, items.length);
    for (const item of items) {
      assert.ok(item.members.length, item.name + ': enemy artwork');
      assert.ok(['Boss', 'Elite', 'Easy', 'Hard', 'Event'].includes(item.type));
      for (const member of item.members) member.image = assetPath(member.imageSource);
    }
    return items;
  } finally { await browser.close(); }
}

async function main() {
  fs.mkdirSync(path.dirname(snapshot), {recursive: true});
  if (!process.argv.includes('--cached')) {
    const response = await fetch(source, {signal: AbortSignal.timeout(30000)});
    assert.ok(response.ok, 'Source HTTP ' + response.status);
    fs.writeFileSync(snapshot, await response.text());
  }
  const items = await parse(fs.readFileSync(snapshot, 'utf8'));
  const assets = JSON.parse(fs.readFileSync('data/monster/assets.json', 'utf8'));
  const downloads = new Map(items.flatMap(item => item.members.map(member => [member.imageSource, member.image])));
  const sharp = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
  let cursor = 0;
  const pending = [...downloads];
  await Promise.all(Array.from({length: 6}, async () => {
    while (cursor < pending.length) {
      const [url, target] = pending[cursor++];
      if (!fs.existsSync(target)) {
        const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
        assert.ok(response.ok, url + ': HTTP ' + response.status);
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.mkdirSync(path.dirname(target), {recursive: true});
        await sharp(buffer).resize({width: 600, height: 480, fit: 'inside', withoutEnlargement: true}).webp({quality: 88}).toFile(target);
      }
      assets[url] = target;
    }
  }));
  fs.writeFileSync('data/monster/assets.json', JSON.stringify(assets, null, 2) + '\n');
  fs.writeFileSync('data/monster/catalog.json', JSON.stringify({source, regions, items}, null, 2) + '\n');
  console.log('Synced ' + items.length + ' encounters and ' + downloads.size + ' local enemy images.');
  for (const region of regions) console.log(region + ': ' + items.filter(item => item.region === region).length);
}

module.exports = {parse};
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
