process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const audit = JSON.parse(fs.readFileSync('data/cards/source/energy-cost-audit.json'));
async function main() {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1100}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('card.html')).href);
    const rows = await page.locator('.card-detail-row').evaluateAll(rows => rows.map(row => {
      const stat = [...row.querySelectorAll('.detail-stat')].find(stat => stat.querySelector('dt').textContent === 'Energy cost');
      return {id:row.dataset.id,value:stat.querySelector('dd').textContent.replace(/\s/g,''),icons:[...stat.querySelectorAll('img')].map(img => img.getAttribute('src'))};
    }));
    assert.equal(rows.length, audit.cards.length);
    const byId = new Map(rows.map(row => [row.id,row]));
    for (const card of audit.cards) {
      const row = byId.get(card.id);
      assert.equal(row.value, card.value.replace(/\s/g,''), card.id + ' cost');
      assert.deepEqual(row.icons, card.icons.map(icon => 'assets/cards/source/' + icon.slice('/images/'.length)), card.id + ' icons');
    }
    await page.locator('#search').fill('Untouchable');
    const card = page.locator('#card-UNTOUCHABLE .card-detail');
    await card.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    const energy = card.locator('.detail-stat').filter({has:page.locator('dt', {hasText:'Energy cost'})}).locator('img');
    assert.ok(await energy.evaluate(img => img.naturalWidth > 0));
    await card.screenshot({path:'assets/cards/previews/untouchable-energy-1440.png'});
    await page.locator('#search').fill('Untouchable+Abundance');
    assert.ok(await page.locator('#card-UNTOUCHABLE').isVisible());
    assert.ok(await page.locator('#card-ABUNDANCE').isVisible());
    assert.deepEqual(errors, []);
    console.log('PASS: all ' + rows.length + ' energy costs and icons match website audit; Untouchable icon loads; symbol OR search works.');
  } finally {
    await browser.close();
  }
}
main().catch(error => {console.error(error);process.exitCode=1;});
