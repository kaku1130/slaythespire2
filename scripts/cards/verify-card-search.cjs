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
      const pool = value => root.locator('#card-filter-character button[value="' + value + '"]');
      // Exercise Chromium's composition path in both the top document and srcdoc iframe.
      await search.focus();
      const beforeComposition = await visible();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.imeSetComposition', {text:'ㄋ', selectionStart:1, selectionEnd:1});
      assert.equal(await search.inputValue(), 'ㄋ', 'IME preedit stays in the input');
      assert.deepEqual(await visible(), beforeComposition, 'preedit does not filter cards');
      await cdp.send('Input.imeSetComposition', {text:'怒火', selectionStart:2, selectionEnd:2});
      assert.equal(await search.inputValue(), '怒火', 'IME candidate remains intact');
      assert.deepEqual(await visible(), beforeComposition, 'candidate waits for commit');
      await cdp.send('Input.insertText', {text:'怒火'});
      await page.waitForTimeout(550);
      assert.equal(await search.inputValue(), '怒火', 'committed Chinese text is preserved');
      assert.deepEqual(await visible(), ['ANGER'], 'IME commit searches across Pools');
      assert.equal(await search.evaluate(node => node === document.activeElement), true, 'IME retains focus');
      await cdp.detach();
      await root.locator('#card-filter-reset').click();
      await pool('Silent').click();
      assert.deepEqual(await visible(), cards.filter(card => ['Ironclad', 'Silent'].includes(card.character)).map(card => card.id).sort(), 'Pool selections combine');
      await page.reload();
      await root.locator('#card-scroll').waitFor();
      assert.deepEqual(await root.locator('#card-filter-character button[aria-pressed=true]').evaluateAll(buttons => buttons.map(button => button.value)), ['Ironclad'], 'reload uses the default Pool');
      assert.deepEqual(await visible(), cards.filter(card => card.character === 'Ironclad').map(card => card.id).sort(), 'reload clears previous Pool selections');
      await pool('Ironclad').click();
      assert.equal((await visible()).length, cards.length, 'no selected Pools shows all cards');
      for (const [group, value] of [['character','Silent'], ['type','Power'], ['rarity','Rare'], ['energy','3+']]) {
        await root.locator('#card-filter-' + group + ' button[value="' + value + '"]').click();
      }
      for (const query of ['anger', 'ANGER', ' anger ', '怒火', '憤怒', '"Anger"']) {
        await search.fill(query);
      await page.waitForTimeout(550);
        assert.deepEqual(await visible(), ['ANGER'], mode + ' ' + file + ': ' + query);
        assert.equal(await root.locator('#card-filter-result').textContent(), '符合張數 / 總卡片數：1 / 569');
        assert.equal(await root.locator('#tools button[aria-pressed=true]').count(), 0, 'keyword search clears Pool and other filters');
      }
      await search.fill('anger,pommel');
      await page.waitForTimeout(550);
      assert.deepEqual(await visible(), ['ANGER', 'POMMEL_STRIKE'], 'multiple keywords');
      await search.fill('Vulnerable');
      await page.waitForTimeout(550);
      const expected = cards.filter(card => [card.name, card.nameZh, card.effect.base, card.effect.upgraded].join(' ').toLowerCase().includes('vulnerable') || card.id === 'MAD_SCIENCE').map(card => card.id).sort();
      assert.deepEqual(await visible(), expected, 'effect keyword excludes mentions in commentary');
      assert.equal(await root.locator('#card-filter-character button[aria-pressed=true]').count(), 0);
      await page.reload();
      await root.locator('#card-scroll').waitFor();
      assert.deepEqual(await visible(), cards.filter(card => card.character === 'Ironclad').map(card => card.id).sort(), 'reload clears search and uses the default Pool');
      await search.fill('');
      await page.waitForTimeout(550);
      assert.equal(await root.locator('.filter-menu-toggle').count(), 0, 'card filters have no hamburger');
      await root.locator('#card-filter-rarity button[value=Rare]').click();
      await search.fill('anger');
      await page.waitForTimeout(550);
      assert.deepEqual(await visible(), ['ANGER'], 'search resets rarity in standalone and embedded pages');
      assert.equal(await root.locator('#card-filter-rarity button[aria-pressed=true]').count(), 0);
      await search.fill('no-such-card-98765');
      await page.waitForTimeout(550);
      assert.deepEqual(await visible(), []);
      assert.equal(await root.locator('#empty').isVisible(), true);
      assert.equal(await root.locator('#tools button[aria-pressed=true]').count(), 0, 'unmatched keyword also leaves all Pools unselected');
      assert.equal(await search.inputValue(), 'no-such-card-98765');
      await search.fill('');
      await page.waitForTimeout(550);
      assert.deepEqual(await visible(), cards.filter(card => card.character === 'Ironclad').map(card => card.id).sort());
      assert.deepEqual(errors, []);
      console.log('PASS ' + mode + ' ' + file + ': Anger, aliases, effect keywords, multiple queries, filter reset and empty results');
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
