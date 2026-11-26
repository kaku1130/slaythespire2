process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const cards = JSON.parse(fs.readFileSync('data/cards/english-details.json', 'utf8')).cards;

(async () => {
  const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
  try {
    for (const mode of ['file', 'website']) for (const file of ['cards.html', 'index.html']) {
      const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
      if (mode === 'website') await context.route('http://search.test/**', route => {
        const filePath = path.resolve('.' + decodeURIComponent(new URL(route.request().url()).pathname));
        assert.ok(filePath.startsWith(process.cwd() + path.sep));
        const contentType = {'.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp'}[path.extname(filePath)] || 'application/octet-stream';
        return route.fulfill({contentType, body: fs.readFileSync(filePath)});
      });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(mode === 'file' ? pathToFileURL(path.resolve(file)).href : 'http://search.test/' + file);
      const root = file === 'index.html' ? page.frameLocator('#main-content>iframe:not([hidden])') : page;
      await root.locator('#card-scroll').waitFor();
      const search = root.locator('#search');
      const visible = () => root.locator('.card-detail-row:visible').evaluateAll(rows => rows.map(row => row.dataset.id).sort());
      for (const query of ['anger', 'ANGER', ' anger ', '怒火', '憤怒', '"Anger"']) {
        await search.fill(query);
        assert.deepEqual(await visible(), ['ANGER'], mode + ' ' + file + ': ' + query);
        assert.equal(await root.locator('#card-filter-result').textContent(), '符合張數 / 總卡片數：1 / 569');
      }
      await search.fill('anger,pommel');
      assert.deepEqual(await visible(), ['ANGER', 'POMMEL_STRIKE'], 'multiple keywords');
      await search.fill('Vulnerable');
      const expected = cards.filter(card => card.character === 'Ironclad' && [card.name, card.nameZh, card.effect.base, card.effect.upgraded].join(' ').toLowerCase().includes('vulnerable')).map(card => card.id).sort();
      assert.deepEqual(await visible(), expected, 'effect keyword excludes mentions in commentary');
      await search.fill('');
      const menu = root.locator('.filter-menu-toggle');
      if (await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
      await root.locator('#card-filter-rarity button[value=Rare]').click();
      await search.fill('anger');
      assert.deepEqual(await visible(), ['ANGER'], 'search resets rarity in standalone and embedded pages');
      assert.equal(await root.locator('#card-filter-rarity button[aria-pressed=true]').count(), 0);
      await search.fill('no-such-card-98765');
      assert.deepEqual(await visible(), []);
      assert.equal(await root.locator('#empty').isVisible(), true);
      await search.fill('');
      assert.equal((await visible()).length, cards.filter(card => card.character === 'Ironclad').length);
      assert.deepEqual(errors, []);
      console.log('PASS ' + mode + ' ' + file + ': Anger, aliases, effect keywords, multiple queries, filter reset and empty results');
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
