process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL, fileURLToPath} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const kinds = ['ancient','builds','cards','event','monster','potion','relic'];
async function main() {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true});
  try {
    const page = await browser.newPage({offline:true, viewport:{width:1920,height:1080}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const kind of kinds) {
      await page.goto(pathToFileURL(path.resolve(kind + '.html')).href);
      const links = await page.locator('.site-nav a').evaluateAll(nodes => nodes.map(node => ({url:node.href, active:node.getAttribute('aria-current')})));
      assert.equal(links.length, 7);
      for (const link of links) assert.ok(fs.existsSync(fileURLToPath(link.url)), link.url);
      assert.equal(links.filter(link => link.active === 'page').length, 1);
      assert.ok(links.find(link => link.active === 'page').url.endsWith('/' + kind + '.html'));
      if (['ancient','event','monster'].includes(kind)) {
        await page.locator('[data-detail-key]').first().click();
        const frame = page.frameLocator('.split-detail iframe');
        await frame.locator('main').waitFor();
        assert.ok((await frame.locator('body').evaluate(node => node.ownerDocument.baseURI)).includes('/data/' + kind + '/'));
        const failed = await frame.locator('img').evaluateAll(async images => {
          const failed = [];
          await Promise.all(images.map(async image => { image.loading = 'eager'; try { await image.decode(); } catch { failed.push(image.src); } }));
          return failed;
        });
        assert.deepEqual(failed, []);
      }
      console.log('PASS', kind);
    }
    let references = 0;
    for (const kind of ['ancient','event','monster']) {
      const dir = 'data/' + kind;
      for (const file of fs.readdirSync(dir).filter(file => file.endsWith('.html'))) {
        for (const match of fs.readFileSync(dir + '/' + file, 'utf8').matchAll(/(?:href|src)="([^"<>]+)"/g)) {
          const url = match[1].split('#')[0];
          if (!url || /^(?:[a-z]+:|\/)/i.test(url)) continue;
          assert.ok(fs.existsSync(path.resolve(dir, url)), file + ' → ' + url);
          references++;
        }
      }
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto(pathToFileURL(path.resolve('mobile.html')).href);
    for (const tab of ['cards','builds','relic','potion']) await page.locator('button[data-tab=' + tab + ']').click();
    assert.deepEqual(errors, []);
    console.log('PASS mobile tabs and', references, 'detail references');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
