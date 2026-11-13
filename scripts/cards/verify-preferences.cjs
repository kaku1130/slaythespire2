const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
process.chdir(path.resolve(__dirname, '../..'));
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true});
  try {
    const context = await browser.newContext({viewport:{width:1920,height:1080}});
    // Fail if any page tries to read or write persisted menu preferences.
    await context.addInitScript(() => {
      for (const name of ['localStorage', 'sessionStorage']) Object.defineProperty(window, name, {get(){throw Error('Unexpected storage access: '+name);}});
      Object.defineProperty(document, 'cookie', {get(){throw Error('Unexpected cookie read');},set(){throw Error('Unexpected cookie write');}});
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const url = kind => pathToFileURL(path.resolve(kind+'.html')).href;
    await page.goto(url('cards'));
    const selected = () => page.locator('[data-category][aria-pressed=true]').evaluateAll(nodes=>nodes.map(n=>n.dataset.category));
    assert.deepEqual(await selected(), ['Ironclad']);
    for (const pool of ['Silent','Defect','Regent','Necrobinder','Colorless','Curse','Event','Quest','Ironclad']) {
      for (let repeat=0;repeat<2;repeat++) {
        await page.locator('[data-category='+pool+']').click();
        assert.deepEqual(await selected(), [pool]);
        assert.deepEqual(await page.locator('section[data-pool]:visible').evaluateAll(nodes=>nodes.map(n=>n.dataset.pool)),[pool]);
      }
    }
    await page.locator('[data-category=Silent]').click();
    await page.locator('[data-rarity-filter=Rare]').click();
    await page.locator('[data-type-filter=Skill]').click();
    await page.locator('#search').fill('格擋');
    await page.reload();
    assert.deepEqual(await selected(), ['Ironclad']);
    assert.equal(await page.locator('#search').inputValue(), '');
    assert.equal(await page.locator('[data-rarity-filter][aria-pressed=true],[data-type-filter][aria-pressed=true]').count(),0);
    for (const kind of ['ancient','builds','event','monster','potion','relic']) {
      const html=fs.readFileSync(kind+'.html','utf8');
      assert.ok(!/localStorage|sessionStorage|document\.cookie|sts2Preferences/.test(html),kind);
      await page.goto(url(kind));
      const control = page.locator('[data-filter-group], [data-character], [data-rarity-filter]').first();
      if (await control.isVisible()) await control.click();
      await page.goto(url('cards'));
      await page.goto(url(kind));
      if(kind==='monster') assert.deepEqual(await page.locator('[data-filter-group=encounterType][aria-pressed=true]').evaluateAll(nodes=>nodes.map(n=>n.dataset.filterValue)),['elite','boss']);
      if(kind==='builds') assert.equal(await page.locator('[data-character][aria-current=page]').count(),0);
    }
    assert.deepEqual(errors,[]);
    assert.deepEqual(await context.cookies(),[]);
    console.log('PASS: exclusive card categories, Ironclad default, reload resets filters, all pages work without storage or cookies.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
