process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs');
const assert = require('node:assert/strict');
const nav = require('../cards/site-navigation.cjs');
const potion = require('../potion/potion-controls.cjs');
const {writeDesktopPage} = require('../cards/desktop-page-css.cjs');
const catalog = require('../../data/enchantments/catalog.json');
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
assert.equal(catalog.items.length, 22);
const entries = catalog.items.map(item => {
  assert(fs.existsSync(item.image), 'Missing enchantment icon: ' + item.id);
  const found = item.foundIn.length ? item.foundIn.map(source => {
    const [, category, rarity] = new URL(source.url).pathname.split('/').slice(1);
    const type = category === 'events' ? 'Event' : category === 'cards' ? 'Card' : category === 'relics' ? ({ancient:'Ancient',shop:'Shop',event:'Event'}[rarity] || 'Relic') : 'Other';
    return '<a class="enchantment-source" data-source-type="' + type + '" href="' + escape(source.url) + '" target="_blank" rel="noopener noreferrer"><span class="enchantment-source-type">' + type + '</span><span>' + escape(source.name) + '</span></a>';
  }).join(' ') : '';
  return '<article class="entry potion enchantment" id="enchantment-' + item.id + '" data-enchantment-id="' + item.id + '">' +
    '<div class="potion-icon-row"><a class="enchantment-image-link" href="' + escape(item.sourceEn) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escape(item.name) + ' — untapped.gg"><img src="' + item.image + '" alt="' + escape(item.name) + '" width="72" height="72" loading="lazy"></a></div>' +
    '<div class="potion-title-row"><h2><span class="catalog-name-en" lang="en">' + escape(item.name) + '</span>' + (found ? '<span class="enchantment-found-in" role="group" aria-label="取得來源"><span class="enchantment-sources">' + found + '</span></span>' : '') + '</h2></div>' +
    '<p lang="en">' + potion.description(item) + '</p></article>';
}).join('');
const search = '<div class="filters potion-filters enchantment-filters"><div class="catalog-search-tools"><div class="search-control"><input id="search" type="text" inputmode="search" role="searchbox" placeholder="搜尋關鍵字" aria-label="搜尋附魔" autocomplete="off"><button type="button" class="search-clear" aria-label="清除搜尋關鍵字" title="清除搜尋關鍵字"><span class="search-icon" aria-hidden="true">🔍</span></button></div></div></div>';
const html = '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" type="image/x-icon" href="assets/cards/icons/site-favicon.ico?v=4"><title>Enchantments｜殺戮尖塔 2</title>' +
  '<link rel="stylesheet" href="assets/potion/potion.css"><link rel="stylesheet" href="assets/enchantments/enchantments-page.css"></head><body>' +
  nav.renderHeader('enchantments') + '<main id="main-content">' + search +
  '<div id="catalog-scroll" class="catalog-scroll" role="region" aria-label="瀏覽附魔" tabindex="0"><section class="potion-section enchantment-section"><h2 class="potion-section-title" lang="en">Enchantments <span class="potion-section-count">(22)</span></h2><div class="catalog">' + entries +
  '</div></section><p id="empty" hidden>沒有符合條件的內容。</p></div></main><script>' + potion.script + '</script></body></html>';
writeDesktopPage('enchantments.html', html, {attribution: '資料來源：<a href="' + catalog.source + '" target="_blank" rel="noopener noreferrer">Untapped.gg Enchantments</a> · 遊戲內容與圖片屬各自權利人所有。'});
console.log('Built enchantments.html: 22 enchantments, shared potion search and card presentation.');
