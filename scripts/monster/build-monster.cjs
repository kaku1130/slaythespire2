process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs'), assert = require('node:assert/strict');
const nav = require('../cards/site-navigation.cjs');
const catalog = JSON.parse(fs.readFileSync('data/monster/catalog.json', 'utf8'));
const localized = require('../../data/monster/names-zh-TW.json');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const order = ['Boss', 'Elite', 'Hard', 'Easy'];
const visibleItems = catalog.items.filter(item => order.includes(item.type));
const sections = catalog.regions.map(region => {
  const items = visibleItems.filter(item => item.region === region).sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || a.name.localeCompare(b.name));
  const groups = order.map(type => {
    const category = type === 'Easy' ? 'Weak' : type;
    const groupItems = items.filter(item => item.type === type);
    if (!groupItems.length) return '';
    const cards = groupItems.map(item => {
      const nameZh=localized.names[item.id];
      assert.ok(nameZh,'Missing Chinese monster name: '+item.id);
      for (const member of item.members) assert.ok(fs.existsSync(member.image), member.image);
      return '<a class="monster-card" id="monster-' + esc(item.id) + '" data-region="' + region + '" data-type="' + category + '" data-search="' + esc([nameZh, item.name, category, ...item.members.map(member => member.name)].join(' ').toLowerCase()) + '" href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(nameZh + ' · ' + item.name + ' on Untapped.gg') + '">' +
        '<div class="monster-card-head"><h4><span class="monster-name-zh" lang="zh-Hant">'+esc(nameZh)+'</span><span class="monster-name-en" lang="en">' + esc(item.name) + '</span></h4></div>' +
        '<div class="monster-lineup" style="--members:' + item.members.length + '">' + item.members.map(member => '<figure class="monster-member"><img src="' + esc(member.image) + '" alt="' + esc(member.name) + '" width="180" height="148" loading="lazy"></figure>').join('') + '</div>' +
        '</a>';
    }).join('');
    return '<div class="monster-category" data-type="' + category + '" role="group" aria-label="' + category + '"><h3 class="monster-category-title" lang="en">'+category+'</h3><div class="monster-grid">' + cards + '</div></div>';
  }).join('');
  return '<section class="monster-region" data-region="' + region + '" aria-label="' + region + '">' + groups + '</section>';
}).join('');
const filters = catalog.regions.map(region => '<button type="button" value="' + region + '" aria-pressed="' + (region === 'Overgrowth') + '">' + region + '</button>').join('');
const html = '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="assets/cards/icons/site-favicon.ico?v=4"><title>Monster｜殺戮尖塔 2</title><style>' + nav.styles + nav.layoutStyles + fs.readFileSync('assets/cards/search-control.css', 'utf8') + fs.readFileSync('assets/monster/monster-catalog.css', 'utf8') + '</style></head><body>' + nav.renderHeader('monster') + '<main id="main-content" class="monster-catalog"><div class="monster-tools"><div class="monster-search-tools"><div class="search-control"><input id="search" type="text" inputmode="search" role="searchbox" placeholder="搜尋關鍵字" aria-label="搜尋怪物或遭遇名稱" autocomplete="off"><button type="button" id="monster-search-clear" class="search-clear" aria-label="清除搜尋" title="清除搜尋關鍵字"><span class="search-icon" aria-hidden="true">🔍</span></button></div></div><div class="monster-filters" role="group" aria-label="Area">' + filters + '</div></div>' + sections + '<p id="monster-empty" hidden>找不到符合條件的怪物，請調整分區或搜尋文字。</p><footer class="monster-source">資料來源：<a href="' + catalog.source + '" target="_blank" rel="noopener noreferrer">Untapped.gg</a> · 遊戲內容與圖片屬各自權利人所有。</footer></main><script src="assets/monster/monster.js"></script></body></html>';
require('../cards/desktop-page-css.cjs').writeDesktopPage('monsters.html', html, {searchControls: false, attribution: false});
console.log('Built monsters.html: ' + visibleItems.length + ' encounters, external detail links only.');
