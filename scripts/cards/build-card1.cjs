process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs');
const assert = require('node:assert/strict');
const source = JSON.parse(fs.readFileSync('data/cards/english-details.json', 'utf8'));
const details = new Map(source.cards.map(card => [card.id, card]));
const localBuilds = fs.readFileSync('build.html', 'utf8');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = value => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const renderArticle = require('./render-card-detail.cjs');
function render(card) {
  return '<td class="card-detail-cell" data-field="detail" role="cell" colspan="10">'+renderArticle(card,{localBuilds,showBuilds:false,showKeywords:false,searchableEffects:true,rarityBeforeType:true})+'</td>';
}
function attribute(tag, name, value) {
  const pattern = new RegExp('\\b' + name + '="[^"]*"');
  return pattern.test(tag) ? tag.replace(pattern, name + '="' + esc(value) + '"') : tag.replace(/>$/, ' ' + name + '="' + esc(value) + '">');
}
function buildCardDetails({output = 'card1'} = {}) {
assert.ok(['cards', 'card1'].includes(output));
let count = 0;
let html = fs.readFileSync('card.html', 'utf8');
html = html.replace(/<tr id="card-([^"]+)"[^>]*>[\s\S]*?<\/tr>/g, (original, id) => {
  original = original.replace(/<td class="card-detail-cell"[\s\S]*?<\/article><\/td>/g, '');
  const card = details.get(id);
  assert.ok(card, 'Missing English detail: ' + id);
  count++;
  let row = original.replace(/^<tr[^>]*>/, tag => {
    tag = attribute(tag, 'class', 'card-detail-row');
    tag = attribute(tag, 'data-type', card.type);
    tag = attribute(tag, 'data-rarity', card.rarity);
    tag = attribute(tag, 'data-name', (card.name + ' ' + card.nameZh).toLowerCase());
    return attribute(tag, 'data-search', plain([card.name, card.nameZh, card.effect.base, card.effect.upgraded || ''].join(' ')).toLowerCase());
  });
  // Keep filter/sort data in the existing cells, aligned with the English source.
  row = row.replace(/(<td\b[^>]*data-field="([^"]+)"[^>]*>)([\s\S]*?)<\/td>/g, (cell, tag, field, content) => {
    const sortValues = {name:card.name, type:card.type, rarity:card.rarity};
    if (sortValues[field]) tag = attribute(tag, 'data-sort-value', sortValues[field]);
    if (field === 'english') content = '<a class="name-en" href="' + esc(card.source) + '" target="_blank" rel="noopener noreferrer">' + esc(card.name) + '</a>';
    if (field === 'tier') content = '<span class="tier" data-tier="' + esc(card.tier || 'unranked') + '">' + esc(card.tier || '—') + '</span>';
    if (field === 'energy') {
      const cost = card.stats.find(s => s.label === 'Energy cost').value.split('→')[0];
      const numeric = plain(cost).match(/^(\d+|X)/)?.[1] || '—';
      tag = attribute(tag, 'data-sort-value', numeric);
      content = '<span class="energy-value">' + esc(numeric) + '</span>';
    }
    if (field === 'rarity') content = '<span class="rarity" data-rarity="' + esc(card.rarity) + '">' + esc(card.rarity) + '</span>';
    if (field === 'type') content = '<span class="type" data-type="' + esc(card.type) + '">' + esc(card.type) + '</span>';
    return tag + content + '</td>';
  });
  return row.replace('</tr>', render(card) + '</tr>');
});
assert.equal(count, source.cards.filter(card => !['Curse', 'Event', 'Quest'].includes(card.character)).length);
assert.equal(count, 503);
html = html.replace('href="assets/cards/cards.css"', 'href="assets/cards/' + output + '.css"');
html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + (output === 'cards' ? 'Slay the Spire 2' : 'Card 1') + '｜503 張卡牌詳細資料</title>');
html = html.replace(/href="(?:card|card1)\.html#card-/g, 'href="' + (output === 'cards' ? 'card' : output) + '.html#card-');
const hashScript = '<script>if(location.hash.startsWith("#card-"))requestAnimationFrame(()=>{const row=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(row){row.style.scrollMarginTop="12px";row.scrollIntoView({block:"start",behavior:"instant"});}});</script>';
html = html.replaceAll(hashScript, '').replace('</body>', hashScript + '</body>');
const baseCss = fs.readFileSync('assets/cards/cards.css', 'utf8').split('/* Each card occupies one full row with seven detail sections. */')[0].trimEnd();
fs.writeFileSync('assets/cards/' + output + '.css', baseCss + '\n' + fs.readFileSync('assets/cards/card1-detail.css', 'utf8') + require('./navigation-icons.cjs').styles + require('./desktop-content-width.cjs') + require('./filter-frames.cjs') + require('./page-scroll.cjs') + require('./tier-colors.cjs') + require('./tier-labels.cjs') + require('./card-content-width.cjs'));
fs.writeFileSync((output === 'cards' ? 'card' : output) + '.html', html);
fs.appendFileSync('assets/cards/' + output + '.css', require('./rarity-labels.cjs'));
console.log('Created ' + (output === 'cards' ? 'card' : output) + '.html: ' + count + ' cards with English detail sections.');
}
module.exports = buildCardDetails;
if (require.main === module) buildCardDetails({output:process.argv.includes('--promote') ? 'cards' : 'card1'});
