const icons = require('./resource-icons.cjs');
const compareEffects = require('./effect-diff.cjs');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const effect = value => esc(value).replace(/&lt;g&gt;/g, '<em>').replace(/&lt;\/g&gt;/g, '</em>')
  .replace(/&lt;e\s*\/&gt;/g, icons.energy).replace(/&lt;s\s*\/&gt;/g, icons.star).replace(/\n/g, '<br>');
function buildLink(card, build, localBuilds) {
  const match = build.url.match(/^\/build\/([^#]+)#build-(.+)$/);
  if (match) {
    const hash = 'build-' + match[1] + '-' + match[2];
    if (localBuilds.includes('id="' + hash + '"')) return 'build.html#' + hash;
  }
  return new URL(build.url, card.source).href;
}
function render(card, {prefix = 'detail-' + card.id.toLowerCase(), localBuilds = '', showBuilds = true, showKeywords = true, showTierRating = true} = {}) {
  const chineseUrl = new URL(card.source);
  chineseUrl.pathname = '/zh-TW' + chineseUrl.pathname;
  const energyCost = card.stats.find(stat => stat.label === 'Energy cost')?.value;
  const costChange = energyCost?.match(/^(\d+)<e\/>\s*→\s*(\d+)<e\/>$/);
  let baseContent = effect(card.effect.base), upgradedContent;
  if (costChange && Number(costChange[2]) < Number(costChange[1])) {
    upgradedContent = effect(energyCost).replace('→', '<span class="detail-cost-arrow" aria-label="upgrades to">→</span>');
  } else if (card.effect.upgraded === null) {
    upgradedContent = '<span class="detail-empty">Cannot be upgraded.</span>';
  } else {
    const difference = compareEffects(card.effect.base, card.effect.upgraded, effect);
    upgradedContent = difference.upgraded;
  }
  const stats = card.stats.map(({label, value}) => {
    const rendered = label === 'Character' ? '<img src="' + card.characterIcon + '" alt="">' + esc(value) : effect(value).replace(/→/g, '<span class="detail-cost-arrow" aria-label="upgrades to">→</span>');
    return '<div class="detail-stat"><dt>' + esc(label) + '</dt><dd' + (label === 'Type' ? ' data-type="' + esc(value) + '"' : label === 'Rarity' ? ' data-stat-rarity="' + esc(value) + '"' : label === 'Character' ? ' data-stat-character="' + esc(value) + '"' : '') + '>' + rendered + '</dd></div>';
  }).join('');
  const keywords = card.keywords.map(keyword => {
    const description = keyword.descriptionParts ? keyword.descriptionParts.map(part => part.color && /^#[0-9a-f]{3,8}$/i.test(part.color) ? '<span style="color:' + esc(part.color) + '">' + effect(part.text) + '</span>' : effect(part.text)).join('') : effect(keyword.description);
    const frame = keyword.frame ? ' style="border-image-source:url(&quot;' + esc(keyword.frame) + '&quot;)"' : '';
    return '<div class="detail-keyword-item"' + frame + '><strong>' + esc(keyword.name) + (keyword.icon ? '<img src="' + esc(keyword.icon) + '" alt="" width="18" height="18" loading="lazy" decoding="async">' : '') + '</strong><p>' + description + '</p></div>';
  }).join('');
  const builds = showBuilds && card.builds.length ? card.builds.map(build => {
    return '<a class="detail-build" href="' + esc(buildLink(card, build, localBuilds)) + '"><span class="detail-build-tier" data-tier="' + esc(build.tier) + '">' + esc(build.tier) + '</span><span><span class="detail-build-name">' + esc(build.name) + '</span><span class="detail-build-meta">' + esc(build.character) + ' · ' + esc(build.role) + '</span></span></a>';
  }).join('') : '';
  const tierList = showTierRating && card.tier && ['Ironclad', 'Silent', 'Defect', 'Necrobinder', 'Regent'].includes(card.character)
    ? new URL('/card-tier-list/' + card.character.toLowerCase(), card.source).href : null;
  const tierDescription = 'Ranked ' + card.tier + ' tier in our ' + card.character + ' card tier list.';
  return `<article class="card-detail" aria-labelledby="${prefix}-title" lang="en" data-source="${esc(card.source)}" data-character="${esc(card.character)}">
  <header data-detail-row="1"><h2 class="detail-title" id="${prefix}-title"><a class="detail-name-zh" lang="zh-Hant" href="${esc(chineseUrl.href)}" target="_blank" rel="noopener noreferrer">${esc(card.nameZh)}</a><a href="${esc(card.source)}" target="_blank" rel="noopener noreferrer">${esc(card.name)}</a></h2></header>
  <figure class="detail-art" data-detail-row="3"><img src="${esc(card.image)}" width="700" height="532" alt="${esc(card.name)} illustration" loading="lazy" decoding="async"></figure>
  ${showKeywords && keywords ? '<aside class="detail-keyword" data-detail-row="4">' + keywords + '</aside>' : ''}
  <section class="detail-section" data-detail-row="5" aria-labelledby="${prefix}-effect"><h3 id="${prefix}-effect">Card Effect</h3><div class="detail-effect-columns"><div class="detail-effect-panel"><h4>Base</h4><p>${baseContent}</p></div><div class="detail-effect-panel"><h4 class="detail-upgraded">Upgraded</h4><p>${upgradedContent}</p></div></div></section>
  <section class="detail-section" data-detail-row="6" aria-labelledby="${prefix}-stats"><h3 id="${prefix}-stats">Card Stats</h3><dl class="detail-stats">${stats}</dl></section>
  ${tierList ? '<section class="detail-section" data-detail-row="8" aria-labelledby="' + prefix + '-rating"><h3 id="' + prefix + '-rating">Tier Rating</h3><div class="detail-rating">' + (card.tier ? '<span class="tier detail-rating-badge" data-tier="' + esc(card.tier) + '" aria-label="Tier ' + esc(card.tier) + '">' + esc(card.tier) + '</span>' : '') + '<p>' + esc(tierDescription) + '</p><a href="' + esc(tierList) + '" target="_blank" rel="noopener noreferrer">' + esc(card.character) + ' card tier list<span aria-hidden="true"> →</span></a></div></section>' : ''}
  ${builds ? '<section class="detail-section" data-detail-row="7" aria-labelledby="' + prefix + '-builds"><h3 id="' + prefix + '-builds">Builds Using This Card</h3><div class="detail-build-list">' + builds + '</div></section>' : ''}
</article>`.replace(/^[\t ]+$/gm, '');
}
module.exports = render;
