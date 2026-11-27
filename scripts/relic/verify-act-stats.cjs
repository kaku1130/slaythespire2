process.chdir(require('node:path').resolve(__dirname, '../..'));
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const source = require('../../data/relic/source/untapped-act-stats.json');
const data = require('../../data/relic/act-stats.json');
const catalog = require('../../data/relic/catalog.json');

(async () => {
  const reference = new Map();
  for (const act of [1, 2, 3]) {
    const pages = source.pages.filter(page => page.act === act);
    assert.equal(pages.length, pages[0].totalPages);
    assert.deepEqual(pages.map(page => page.page), Array.from({length: pages.length}, (_, index) => index + 1));
    const rows = pages.flatMap(page => page.rows);
    assert.equal(new Set(rows.map(row => row.id)).size, pages[0].totalRelics);
    assert(rows.every(row => ['Bought', 'Picked'].includes(row.label)));
    assert(rows.every(row => row.value === null ? row.rawValue === '—' : row.value === row.rawValue));
    reference.set(act, rows);
  }
  assert.equal(data.items.length, catalog.items.length);
  assert.equal(data.unmatched.length, 0);
  for (const item of data.items) for (const act of [1, 2, 3]) {
    const row = reference.get(act).find(row => row.id === item.id);
    assert(row, item.id + ' source row in Act ' + act);
    assert.equal(item.acts[act].label, row.label);
    assert.equal(item.acts[act].value, row.value);
  }
  const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
  try {
    for (const embedded of [false, true]) {
      const context = await browser.newContext({offline: true, viewport: {width: 1440, height: 1100}});
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve(embedded ? 'index.html' : 'relics.html')).href);
      if (embedded) await page.getByRole('link', {name: 'Relics', exact: true}).click();
      const root = embedded ? page.frameLocator('#main-content>iframe:not([hidden])') : page;
      await root.locator('.relic-act-stats').first().waitFor();
      const rendered = await root.locator('.entry.relic').evaluateAll(nodes => nodes.map(node => ({
        id: node.id,
        stats: [...node.querySelectorAll('.relic-act-stat')].map(stat => ({
          act: +stat.dataset.act, title: stat.querySelector('dt').textContent,
          value: stat.querySelector('.relic-act-value').textContent
        }))
      })));
      assert.equal(rendered.length, catalog.items.length);
      assert.equal(await root.locator('.relic-act-metric').count(), 0, 'Bought / Picked labels removed');
      for (const item of rendered) {
        const expected = data.items.find(expected => expected.id === item.id);
        assert.deepEqual(item.stats, [1, 2, 3].map(act => ({act, title: 'Act ' + act,
          value: expected.acts[act].value ?? '—'})), item.id);
      }
      for (const width of [390, 900, 1025, 1440, 1920]) {
        await page.setViewportSize({width, height: 1100});
        const failures = await root.locator('.entry.relic:visible .relic-act-stats').evaluateAll(nodes => nodes.flatMap(node => {
          const box = node.getBoundingClientRect(), parent = node.closest('.entry').getBoundingClientRect();
          const cells = [...node.children].map(cell => cell.getBoundingClientRect());
          const vertical = Math.max(...cells.map(cell => cell.left)) - Math.min(...cells.map(cell => cell.left)) < 1 && cells[1].top >= cells[0].bottom && cells[2].top >= cells[1].bottom;
          const valuesBesideLabels = [...node.children].every(cell => {
            const label = cell.querySelector('dt').getBoundingClientRect(), value = cell.querySelector('dd').getBoundingClientRect();
            return value.left >= label.right && value.top < label.bottom && value.bottom > label.top;
          });
          const borderless = [node, ...node.children].every(element => {
            const style = getComputedStyle(element);
            return ['borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth'].every(side => style[side] === '0px');
          });
          return cells.length === 3 && vertical && valuesBesideLabels && borderless &&
            box.right <= parent.right && node.scrollWidth <= node.clientWidth ? [] : [node.closest('.entry').id];
        }));
        assert.deepEqual(failures, [], 'Act 1–3 use one borderless column at ' + width);
      }
      await root.locator('#search').fill('"Akabeko"');
      assert.equal(await root.locator('.entry.relic:visible').count(), 1);
      await root.locator('#AKABEKO .relic-act-stats').waitFor({state: 'visible'});
      if (!embedded) {
        await page.setViewportSize({width: 1440, height: 1100});
        await root.locator('#AKABEKO').screenshot({path: 'assets/relic/previews/relic-act-stats.png'});
      }
      assert.deepEqual(errors, []);
      console.log('PASS ' + (embedded ? 'homepage' : 'standalone') + ': 297 relics / 891 Act values match the source; unavailable values remain —; five widths, offline display and search work.');
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
