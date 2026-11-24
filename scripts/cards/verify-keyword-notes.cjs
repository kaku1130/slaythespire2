process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true});
  try {
    for (const width of [1440, 1920]) {
      const page = await browser.newPage({viewport:{width, height:1100}});
      await page.goto(pathToFileURL(path.resolve('Cards.html')).href);
      const notes = page.locator('#card-TREMBLE .detail-keyword');
      await notes.scrollIntoViewIfNeeded();
      await notes.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
      const result = await notes.evaluate(element => {
        const bounds = element.getBoundingClientRect();
        const panelStyle = getComputedStyle(element.closest('.card-detail').querySelector('.detail-effect-panel'));
        return [...element.children].map(item => {
          const rect = item.getBoundingClientRect(), style = getComputedStyle(item);
          return {halfWidth:Math.abs(rect.width - bounds.width / 2) < 1, centered:Math.abs(rect.left + rect.width / 2 - bounds.left - bounds.width / 2) < 1, fits:rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1,
            matchesPanel:['borderTopWidth','borderTopStyle','borderTopColor','borderRadius','padding'].every(property => style[property] === panelStyle[property]) && style.borderImageSource === 'none',
            background:style.backgroundColor,
            icons:[...item.querySelectorAll('img')].map(img => img.naturalWidth > 0),
            colored:!!item.querySelector('p span[style]')};
        });
      });
      assert.equal(result.length, 2);
      assert.ok(result.every(item => item.halfWidth && item.centered && item.fits && item.matchesPanel));
      const layout = await notes.evaluate(element => {
        const [first, second] = [...element.children].map(item => item.getBoundingClientRect());
        const panels = [...element.closest('.card-detail').querySelectorAll('.detail-effect-panel')].map(item => item.getBoundingClientRect());
        return {stacked:second.top >= first.bottom, effectsBeside:Math.abs(panels[0].top - panels[1].top) < 1};
      });
      assert.ok(layout.stacked, 'keyword descriptions form one column');
      assert.ok(layout.effectsBeside, 'Card Effect retains its original desktop columns');
      assert.ok(result[0].colored);
      assert.equal(result[0].background, 'rgb(56, 31, 30)');
      assert.equal(result[1].background, 'rgb(34, 46, 51)');
      assert.deepEqual(result[0].icons, [true]);
      const missing = await page.locator('.detail-keyword-item').evaluateAll(items => items.flatMap(item => {
        const frame = item.style.borderImageSource.match(/url\(["']?(.*?)["']?\)/)?.[1];
        return [frame, ...[...item.querySelectorAll('img')].map(img => img.getAttribute('src'))].filter(Boolean);
      }));
      for (const asset of missing) assert.ok(fs.existsSync(asset), asset);
      fs.mkdirSync('assets/cards/previews', {recursive:true});
      await notes.screenshot({path:'assets/cards/previews/keyword-notes-' + width + '.png'});
      console.log('PASS ' + width + 'px: keyword frames, icons, highlighted values and artwork alignment');
      await page.close();
    }
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
