process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const cards = JSON.parse(fs.readFileSync('data/cards/english-details.json', 'utf8')).cards;
const ids = list => list.map(card => card.id).sort();

(async () => {
  const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
  try {
    for (const file of ['cards.html', 'index.html']) {
      const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve(file)).href);
      const root = file === 'index.html' ? page.frameLocator('#main-content>iframe:not([hidden])') : page;
      await root.locator('#card-scroll').waitFor();
      const menu = root.locator('.filter-menu-toggle');
      if (await menu.count() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
      const button = (group, value) => root.locator('#card-filter-' + group + ' button[value="' + value + '"]');
      const visible = () => root.locator('.card-detail-row').evaluateAll(rows => rows.filter(row => row.getClientRects().length && getComputedStyle(row).display !== 'none' && !row.closest('section[hidden]')).map(row => row.dataset.id).sort());
      const verify = async (expected, label) => {
        assert.deepEqual(await visible(), ids(expected), file + ': ' + label);
        const state = await root.locator('#card-scroll').evaluate(scroll => ({
          leaked: [...scroll.querySelectorAll('.card-detail-row[hidden]')].some(row => getComputedStyle(row).display !== 'none'),
          count: document.getElementById('card-filter-result').textContent
        }));
        assert.equal(state.leaked, false, 'hidden cards stay hidden in the computed layout');
        assert.equal(state.count, '符合張數 / 總卡片數：' + expected.length + ' / ' + cards.length);
      };
      await button('character', 'Ironclad').click();
      await verify(cards, 'all cards');
      const rarityMatches = (card, rarity) => card.rarity === rarity || rarity === 'Common' && card.rarity === 'Basic';
      for (const rarity of ['Common', 'Uncommon', 'Rare', 'Ancient']) {
        await button('rarity', rarity).click();
        await verify(cards.filter(card => rarityMatches(card, rarity)), rarity);
        await button('rarity', rarity).click();
      }
      await button('rarity', 'Rare').click();
      await button('rarity', 'Uncommon').click();
      await verify(cards.filter(card => ['Rare', 'Uncommon'].includes(card.rarity)), 'rarity union');
      await button('character', 'Ironclad').click();
      await button('type', 'Attack').click();
      await verify(cards.filter(card => card.character === 'Ironclad' && card.type === 'Attack' && ['Rare', 'Uncommon'].includes(card.rarity)), 'character AND type AND rarity');
      await button('rarity', 'Uncommon').click();
      await page.reload();
      await root.locator('#card-scroll').waitFor();
      await verify(cards.filter(card => card.character === 'Ironclad' && card.type === 'Attack' && card.rarity === 'Rare'), 'restored filters');
      if (await menu.count() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
      await button('rarity', 'Rare').click();
      await button('type', 'Attack').click();
      for (const width of [1280, 1440, 1920]) {
        await page.setViewportSize({width, height: 1000});
        const layout = await root.locator('section[data-pool=Ironclad] tbody').evaluate(tbody => {
          const rows = [...tbody.querySelectorAll('tr:not([hidden])')];
          const bounds = rows.slice(0, 5).map(row => row.getBoundingClientRect().toJSON());
          return {
            columns: getComputedStyle(tbody).gridTemplateColumns.split(' ').length,
            bounds,
            overflow: rows.some(row => row.scrollWidth > row.clientWidth + 1)
          };
        });
        assert.equal(layout.columns, 4, width + 'px desktop columns');
        assert.ok(layout.bounds.slice(0, 4).every(box => Math.abs(box.top - layout.bounds[0].top) < 1), 'four cards share the first row');
        assert.ok(layout.bounds[4].top > layout.bounds[0].top, 'fifth card wraps');
        assert.equal(layout.overflow, false, 'cards fit their columns');
      }
      const border = await button('rarity', 'Rare').evaluate(node => getComputedStyle(node).borderTopWidth);
      assert.equal(border, '1px', 'filter border matches ancient menu');
      await button('rarity', 'Ancient').click();
      await button('type', 'Attack').click();
      await button('energy', 'X').click();
      await verify([], 'empty combination hides every card');
      assert.equal(await root.locator('#empty').isVisible(), true);
      assert.deepEqual(errors, []);
      if (file === 'cards.html') {
        await button('rarity', 'Ancient').click();
        await button('type', 'Attack').click();
        await button('energy', 'X').click();
        await page.setViewportSize({width: 1440, height: 1000});
        if (await menu.count()) await menu.click();
        fs.mkdirSync('assets/cards/previews', {recursive: true});
        await page.screenshot({path: 'assets/cards/previews/card-filters-four-columns.png'});
      }
      console.log('PASS ' + file + ': rarity, combined and restored filters, actual visibility, four desktop columns, borders');
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
