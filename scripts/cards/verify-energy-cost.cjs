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
      const panels = [...row.querySelectorAll('.detail-panel-cost')].map(panel => {const copy=panel.cloneNode(true);copy.querySelector('.detail-panel-stars')?.remove();return copy;});
      return {id:row.dataset.id,values:panels.map(panel=>panel.textContent.replace(/\s/g,'')),icons:panels.map(panel=>[...panel.querySelectorAll('img')].map(img=>img.getAttribute('src')))};
    }));
    assert.equal(rows.length, audit.cards.length);
    const byId = new Map(rows.map(row => [row.id,row]));
    for (const card of audit.cards) {
      const row = byId.get(card.id);
      const costs=card.value.replace(/\s/g,'').split('→');
      assert.equal(row.values[0],costs[0],card.id+' base cost');
      if(row.values.length>1)assert.equal(row.values[1],costs[1]||costs[0],card.id+' upgraded cost');
      for(const icons of row.icons)assert.deepEqual(icons,card.icons.length?['assets/cards/source/'+card.icons[0].slice('/images/'.length)]:[],card.id+' icons');
    }
    const effectIcons = await page.locator('.detail-effect-panel .energy-resource-icon,.detail-resource-note .energy-resource-icon,.detail-keyword .energy-resource-icon').evaluateAll(icons => icons.map(icon => ({
      id:icon.closest('tr').dataset.id,
      character:icon.closest('.card-detail').dataset.character,
      src:icon.getAttribute('src'),
      tag:icon.tagName
    })));
    assert.ok(effectIcons.length > 0, 'Effect energy icons are present');
    for (const icon of effectIcons) {
      const pool = ['Ironclad','Silent','Defect','Necrobinder','Regent'].includes(icon.character) ? icon.character.toLowerCase() : 'colorless';
      assert.equal(icon.tag, 'IMG', icon.id + ' effect uses character icon');
      assert.equal(icon.src, 'assets/cards/source/card-template/energy_inline_' + pool + '.webp', icon.id + ' effect icon');
    }
    assert.equal(await page.locator('.detail-resource-note').count(), 0, 'Keyword descriptions removed');
    console.log('PASS: ' + effectIcons.length + ' effect energy icons use the corresponding character artwork.');
    await page.locator('#search').fill('Untouchable');
    const card = page.locator('#card-UNTOUCHABLE .card-detail');
    await card.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    const energy = card.locator('[aria-label="Base energy cost"] img');
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
