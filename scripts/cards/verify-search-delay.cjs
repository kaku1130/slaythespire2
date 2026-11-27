process.chdir(require('node:path').resolve(__dirname, '../..'));
const path = require('node:path'), assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true});
  try {
    for (const embedded of [false, true]) for (const file of ['cards.html','potions.html','relics.html','enchantments.html','monsters.html']) {
      const context = await browser.newContext();
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.clock.install();
      await page.clock.pauseAt(new Date(Date.now() + 1000));
      await page.goto(pathToFileURL(path.resolve(embedded ? 'index.html' : file)).href);
      if (embedded && file !== 'cards.html') await page.locator('.site-nav>a[href="' + file + '"]').click();
      const root = embedded ? page.frameLocator('#main-content>iframe:not([hidden])') : page;
      const search = root.locator('#search');
      await search.waitFor();
      const selector = file === 'cards.html' ? '.card-detail-row' : file === 'monsters.html' ? '.monster-card' : '.entry';
      const results = () => root.locator(selector + ':not([hidden])').count();
      const original = await results();
      assert.ok(original > 0, 'initial results');
      await search.fill('no-such-keyword-98765');
      await page.clock.runFor(200);
      assert.equal(await results(), original, 'typing leaves results unchanged');
      await search.fill('no-such-keyword-987654');
      await page.clock.runFor(499);
      assert.equal(await results(), original, 'new input restarts the 500 ms delay');
      await page.clock.runFor(1);
      assert.deepEqual(errors, []);
      assert.equal(await results(), 0, 'filters at 500 ms: '+file+' '+await search.inputValue());
      await search.fill('');
      await page.clock.runFor(500);
      assert.equal(await results(), original, 'clearing restores results');

      // A pending search must be cancelled when an IME starts composing.
      await search.fill('no-such-keyword');
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.imeSetComposition', {text:'ㄋ', selectionStart:1, selectionEnd:1});
      await page.clock.runFor(500);
      assert.equal(await results(), original, 'no filtering during composition');
      await cdp.send('Input.insertText', {text:'no-such-keyword-98765'});
      await page.clock.runFor(499);
      assert.equal(await results(), original, 'IME commit also waits 500 ms');
      await page.clock.runFor(1);
      assert.equal(await results(), 0, 'IME commit applies after delay');
      assert.equal(await search.evaluate(node => node === document.activeElement), true, 'focus preserved');
      assert.deepEqual(errors, []);
      console.log('PASS ' + (embedded ? 'embedded ' : 'standalone ') + file + ': 500 ms delay, restart, clear and IME');
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
