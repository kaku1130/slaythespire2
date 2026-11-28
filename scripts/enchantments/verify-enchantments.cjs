process.chdir(require('node:path').resolve(__dirname, '../..'));
const path = require('node:path'), fs = require('node:fs'), assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const expected = ['BEAUTIFUL_BRACELET','ELECTRIC_SHRYMP','FRESNEL_LENS','GLITTER','GNARLED_HAMMER','KIFUDA','MYSTIC_LIGHTER','NUTRITIOUS_SOUP','PAELS_CLAW','PAELS_GROWTH','PUNCH_DAGGER','ROYAL_STAMP','SILKEN_TRESS','TRI_BOOMERANG','WING_CHARM'].sort();
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1100}}), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('enchantments.html')).href);
    assert.equal(await page.locator('.enchantment').count(), 22);
    assert.equal(await page.locator('.enchantment .catalog-source-links').count(), 0);
    assert.equal(await page.locator('.enchantment-image-link').count(), 22);
    assert.equal(await page.locator('.enchantment .catalog-name-en').first().evaluate(n => getComputedStyle(n).color), 'rgb(244, 114, 182)');
    assert.equal(await page.locator('.enchantment-found-in').first().evaluate(n => getComputedStyle(n).borderTopWidth), '0px');
    for (const item of require('../../data/enchantments/catalog.json').items) {
      assert.equal(await page.locator('#enchantment-'+item.id+' .enchantment-image-link').getAttribute('href'), item.sourceEn);
    }
    const colors = [];
    for (const type of ['Event','Ancient','Shop','Card']) colors.push(await page.locator('[data-source-type='+type+']').first().evaluate(n => getComputedStyle(n).color));
    assert.equal(new Set(colors).size, 4);
    await page.screenshot({path:'assets/enchantments/previews/enchantments-desktop.png'});
    await page.goto(pathToFileURL(path.resolve('relics.html')).href);
    const button = page.locator('[data-catalog-filter=enchantments]');
    const a = await page.locator('#relic-filter-pool button[value=Shared]').boundingBox(), b = await button.boundingBox();
    assert.equal(a.y,b.y,'Enchantments shares the second row with Colorless');
    assert(b.x>=a.x+a.width,'Enchantments follows Colorless');
    await button.click();
    assert.deepEqual(await page.locator('.entry.relic:visible').evaluateAll(nodes => nodes.map(n => n.dataset.relicId).sort()), expected);
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.relic-ancient-menu [aria-pressed=true]').count(), 0);
    assert.equal(await page.locator('#MYSTIC_LIGHTER .relic-enchantment-link').getAttribute('href'), 'enchantments.html');
    await page.screenshot({path:'assets/relics/previews/relic-enchantments.png'});
    await page.reload();
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.entry.relic:visible').count(), 15);
    await page.locator('#search').fill('"Akabeko"');
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.entry.relic:visible').count(), 0);
    await page.locator('#search').fill('');
    assert.equal(await page.locator('#search').inputValue(), '');
    await page.locator('#KIFUDA .relic-enchantment-link[href$="ADROIT"]').click();
    await page.waitForURL('**/enchantments.html#enchantment-ADROIT');
    assert(await page.locator('#enchantment-ADROIT').isVisible());
    await page.goto(pathToFileURL(path.resolve('index.html')).href);
    await page.locator('.site-nav a[aria-label=Relics]').click();
    const frame = page.frameLocator('iframe[data-page=relic]');
    await frame.locator('[data-catalog-filter=enchantments]').click();
    // Stored filter can start selected; select explicitly when toggled off.
    if (await frame.locator('[data-catalog-filter=enchantments]').getAttribute('aria-pressed') !== 'true') await frame.locator('[data-catalog-filter=enchantments]').click();
    await frame.locator('#KIFUDA .relic-enchantment-link[href$="ADROIT"]').click();
    assert(await page.frameLocator('iframe[data-page=enchantments]').locator('#enchantment-ADROIT').isVisible());
    // Verify the homepage's embedded copy, which can lag behind the standalone page.
    for (const width of [1440, 390]) {
      await page.setViewportSize({width, height:1100});
      const adroit = page.frameLocator('iframe[data-page=enchantments]').locator('#enchantment-ADROIT');
      const effect = await adroit.locator('p').boundingBox();
      const source = await adroit.locator('.enchantment-source').boundingBox();
      assert.match(await adroit.locator('p').innerText(), /Gain X Block\./);
      assert.match(await adroit.locator('.enchantment-source').innerText(), /Kifuda/);
      assert(source.y >= effect.y + effect.height, 'Adroit: Shop Kifuda must be below Gain X Block at ' + width + 'px');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: 22 pink enchantments, image attribution, colored sources, 15 relics, filter memory/search and direct/index links.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
