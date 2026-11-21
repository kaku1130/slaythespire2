process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs');
const assert = require('node:assert/strict');
const source = JSON.parse(fs.readFileSync('data/cards/english-details.json', 'utf8'));
const details = new Map(source.cards.map(card => [card.id, card]));
const localBuilds = fs.readFileSync('build.html', 'utf8');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = value => value.replace(/<\/?(?:article|section|div|p|header|h[1-6]|dl|dt|dd|aside|td|br)\b[^>]*>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, key) => {
  if(key[0]==='#')return String.fromCodePoint(key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):Number(key.slice(1)));
  return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[key.toLowerCase()];
}).replace(/\s+/g, ' ').trim();
const renderArticle = require('./render-card-detail.cjs');
function render(card) {
  const article=renderArticle(card,{localBuilds,showBuilds:false,showKeywords:false,searchableEffects:true,rarityBeforeType:true,showEffectNotes:false,metadataAboveEffects:true,cornerMetadata:true});
  return '<td class="card-detail-cell" data-field="detail" role="cell" colspan="10">'+article+'</td>';
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
  const detailCell = render(card);
  count++;
  let row = original.replace(/^<tr[^>]*>/, tag => {
    tag = attribute(tag, 'class', 'card-detail-row');
    tag = attribute(tag, 'data-type', card.type);
    tag = attribute(tag, 'data-rarity', card.rarity);
    tag = attribute(tag, 'data-name', (card.name + ' ' + card.nameZh).toLowerCase());
    return attribute(tag, 'data-search', plain(detailCell).toLowerCase());
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
  const sortValues=Object.fromEntries([...row.matchAll(/<td\b([^>]*)data-field="([^"]+)"([^>]*)>([\s\S]*?)<\/td>/g)].map(([,before,field,after,content])=>[field,(before+after).match(/data-sort-value="([^"]*)"/)?.[1]??plain(content)]));
  let rowTag=row.match(/^<tr[^>]*>/)[0];
  rowTag=attribute(rowTag,'data-sort-values',JSON.stringify(sortValues));
  rowTag=attribute(rowTag,'data-tier',card.tier||'unranked');
  return rowTag+detailCell+'</tr>';
});
assert.equal(count, details.size);
html = html.replace(/<footer class="card-results-footer">([\s\S]*?)<\/footer>/g, '$1');
html = html.replace(/<footer class="site-attribution"[^>]*>[\s\S]*?<\/footer>/g, '')
  .replace(/<p class="card-source">[\s\S]*?<\/p>/g, '')
  .replace(/<script>\(\(\)=>\{const main=document\.getElementById\('main-content'\);const footer=document\.querySelector\('\.site-attribution'\);[\s\S]*?<\/script>/g, '');
const resultCount = html.match(/<p\b[^>]*id="card-filter-result"[^>]*>[\s\S]*?<\/p>/);
assert.ok(resultCount, 'Missing card filter count');
const sourceCredit = '<p class="card-source">資料來源：<a href="https://slaythespire2.net/" target="_blank" rel="noopener noreferrer">Slay the Spire 2 Guide &amp; Wiki</a> · 遊戲內容與圖片屬各自權利人所有。</p>';
html = html.replace(resultCount[0], '').replace('</main>', '<footer class="card-results-footer">' + resultCount[0] + sourceCredit + '</footer></main>');
html = html.replace('href="assets/cards/cards.css"', 'href="assets/cards/' + output + '.css"');
html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + (output === 'cards' ? 'Slay the Spire 2' : 'Card 1') + '｜' + count + ' 張卡牌詳細資料</title>');
html = html.replace(/href="(?:card|card1)\.html#card-/g, 'href="' + (output === 'cards' ? 'card' : output) + '.html#card-');
const hashScript = '<script>if(location.hash.startsWith("#card-"))requestAnimationFrame(()=>{const row=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(row){row.style.scrollMarginTop="12px";row.scrollIntoView({block:"start",behavior:"instant"});}});</script>';
html = html.replaceAll(hashScript, '').replace('</body>', hashScript + '</body>');
const baseCss = fs.readFileSync('assets/cards/cards.css', 'utf8').split('/* Each card occupies one full row with seven detail sections. */')[0].trimEnd();
fs.writeFileSync('assets/cards/' + output + '.css', baseCss + '\n' + fs.readFileSync('assets/cards/card1-detail.css', 'utf8') + require('./navigation-icons.cjs').styles + require('./desktop-content-width.cjs') + require('./filter-frames.cjs') + require('./page-scroll.cjs') + require('./tier-colors.cjs') + require('./tier-labels.cjs') + require('./card-content-width.cjs'));
html = html.replace(/<!--card-effect-tooltips-->[\s\S]*?<!--\/card-effect-tooltips-->/g, '');
fs.writeFileSync((output === 'cards' ? 'card' : output) + '.html', html);
fs.appendFileSync('assets/cards/' + output + '.css', require('./rarity-labels.cjs'));
console.log('Created ' + (output === 'cards' ? 'card' : output) + '.html: ' + count + ' cards with English detail sections.');
}
module.exports = buildCardDetails;
if (require.main === module) buildCardDetails({output:process.argv.includes('--promote') ? 'cards' : 'card1'});
