process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs');
const assert = require('node:assert/strict');
const source = 'https://sts2.untapped.gg/en/relics';
const cache = 'data/relic/source/untapped-act-stats.json';

function parsePage(html, act, page, url) {
  const flight = [...html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)]
    .map(match => JSON.parse(match[1])).filter(chunk => chunk[0] === 1).map(chunk => chunk[1]).join('');
  assert(flight.includes('"selectedKey":"rate-act-' + act + '"'), 'Incorrect act: ' + url);
  const pagination = flight.match(/"page":(\d+),"totalPages":(\d+)/);
  const total = flight.match(/"children":"(\d+) Total Relics"/);
  assert(pagination && total && +pagination[1] === page, 'Incorrect pagination: ' + url);
  const records = new Map();
  for (const line of flight.split('\n')) {
    const match = line.match(/^([0-9a-f]+):([\[{].*)$/);
    if (match) try { records.set(match[1], JSON.parse(match[2])); } catch { /* Non-JSON Flight records. */ }
  }
  function dereference(value) {
    const ref = typeof value === 'string' && value.match(/^\$L?([0-9a-f]+)$/);
    return ref && records.has(ref[1]) ? records.get(ref[1]) : value;
  }
  function walk(value, visit, seen = new Set()) {
    value = dereference(value);
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value) && value[0] === '$') {
      visit(value);
      walk(value[3], visit, seen);
    } else if (Array.isArray(value)) {
      for (const child of value) walk(child, visit, seen);
    } else {
      for (const child of Object.values(value)) walk(child, visit, seen);
    }
  }
  function text(value) {
    value = dereference(value);
    if (value == null || value === false || value === '$undefined') return '';
    if (Array.isArray(value)) return value[0] === '$' ? text(value[3]?.children) : value.map(text).join('');
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }
  const nodes = new Map();
  let allCharacters = false;
  for (const value of records.values()) walk(value, node => {
    if (node[3]?.searchParam === 'character') {
      const all = node[3].items?.find(item => item.label === 'All Characters');
      const selected = node[3].selectedKey;
      if (all && (selected === all.key ||
        ((selected == null || selected === '$undefined') && all.isDefault && !new URL(url, source).searchParams.get('character')))) allCharacters = true;
    }
    if (node[3]?.className?.includes('__statsRelic')) nodes.set(node[2], node);
  });
  assert(allCharacters, 'Unexpected character filter: ' + url);
  const rows = [...nodes].map(([id, node]) => {
    const cells = [];
    walk(node[3].children, child => {
      if (/RelicStatColumns.*__value(?: |$)/.test(child[3]?.className || '')) cells.push(child);
    });
    const metrics = cells.map(cell => {
      let label = '', value = '';
      walk(cell, child => {
        if (child[3]?.className?.includes('__mobileLabel')) label = text(child[3].children);
        if (child[1] === 'strong') value = text(child[3].children).trim();
      });
      return {label, value};
    });
    const metric = metrics.find(item => ['Bought', 'Picked'].includes(item.label));
    assert(metric, 'Missing Bought/Picked column: ' + id + ' ' + url);
    const percentage = metric.value.match(/^\d+(?:\.\d+)?%$/)?.[0] || null;
    assert(percentage || metric.value === '—', 'Unexpected acquisition value: ' + id + ' ' + metric.value);
    if (percentage) assert(parseFloat(percentage) <= 100, 'Invalid percentage: ' + id);
    const name = node[3].children.find(child => Array.isArray(child) && child[1] === 'h3');
    return {id, name: text(name), url: new URL(node[3].href, source).href,
      label: metric.label, value: percentage, rawValue: metric.value,
      offered: metrics.find(item => item.label === 'Offered')?.value || null};
  });
  assert(rows.length > 0 && rows.length <= 50, 'Unexpected relic count: ' + url);
  return {act, page, url, totalPages: +pagination[2], totalRelics: +total[1], rows};
}

async function download(act, page) {
  const url = source + '?sort=rate-act-' + act + '&page=' + page;
  let error;
  for (let attempt = 0; attempt < 3; attempt++) try {
    const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
    assert(response.ok, 'HTTP ' + response.status + ': ' + url);
    return parsePage(await response.text(), act, page, url);
  } catch (failure) { error = failure; }
  throw error;
}

async function main() {
  let snapshot;
  if (process.argv.includes('--cached')) snapshot = JSON.parse(fs.readFileSync(cache, 'utf8'));
  else {
    const pages = await Promise.all([1, 2, 3].map(act => download(act, 1)));
    const pending = pages.flatMap(first => Array.from({length: first.totalPages - 1}, (_, index) => [first.act, index + 2]));
    let cursor = 0;
    await Promise.all(Array.from({length: 3}, async () => {
      while (cursor < pending.length) {
        const [act, page] = pending[cursor++];
        pages.push(await download(act, page));
        console.log('Fetched Act ' + act + ', page ' + page);
      }
    }));
    snapshot = {source, checkedAt: new Date().toISOString(), scope: 'All Characters',
      pages: pages.sort((a, b) => a.act - b.act || a.page - b.page)};
  }
  const acts = new Map();
  for (const act of [1, 2, 3]) {
    const pages = snapshot.pages.filter(page => page.act === act);
    assert.equal(pages.length, pages[0].totalPages, 'Missing pages for Act ' + act);
    const rows = new Map(pages.flatMap(page => page.rows.map(row => [row.id, {...row, pageUrl: page.url}])));
    assert.equal(rows.size, pages[0].totalRelics, 'Incomplete Act ' + act);
    acts.set(act, rows);
  }
  const catalog = require('../../data/relic/catalog.json');
  const unmatched = [];
  const items = catalog.items.map(item => {
    const byAct = {};
    for (const act of [1, 2, 3]) {
      const rows = acts.get(act);
      const row = rows.get(item.id);
      byAct[act] = row ? {label: row.label, value: row.value, offered: row.offered, sourceUrl: row.pageUrl} : null;
    }
    if (Object.values(byAct).every(value => !value)) unmatched.push(item.id);
    return {id: item.id, acts: byAct};
  });
  fs.writeFileSync(cache, JSON.stringify(snapshot, null, 2) + '\n');
  fs.writeFileSync('data/relic/act-stats.json', JSON.stringify({source, checkedAt: snapshot.checkedAt,
    scope: snapshot.scope, sourceRelics: acts.get(1).size, unmatched, items}, null, 2) + '\n');
  console.log(JSON.stringify({localRelics: items.length, sourceRelics: acts.get(1).size, unmatched,
    available: Object.fromEntries([...acts].map(([act, rows]) => [act, [...rows.values()].filter(row => row.value !== null).length]))}));
}
module.exports = {parsePage};
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
