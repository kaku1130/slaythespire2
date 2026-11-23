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
function render(card, {prefix = 'detail-' + card.id.toLowerCase(), localBuilds = '', showBuilds = true, showKeywords = true, showTierRating = true, searchableEffects = false, rarityBeforeType = false, showEffectTooltips = false, showEffectNotes = false, metadataAboveEffects = false, tierBesideName = false, cornerMetadata = false} = {}) {
  const chineseUrl = new URL(card.sourceZh || card.source);
  if (!card.sourceZh) chineseUrl.pathname = '/zh-TW' + chineseUrl.pathname;
  const energyCost = card.stats.find(stat => stat.label === 'Energy cost')?.value;
  const [baseCost, upgradedCost = baseCost] = (energyCost || '').split(/\s*→\s*/);
  const renderCost = (value, changed = false) => effect(value).replaceAll(icons.energy, icons.energyFor(card.character)).replace(/^(\d+|X)/, changed ? '<strong class="detail-effect-change">$1</strong>' : '<strong>$1</strong>');
  const starCost = metadataAboveEffects && card.stats.find(stat => stat.label === 'Star cost')?.value;
  const starCostContent = starCost ? '<span class="detail-panel-stars" aria-label="Star cost">' + effect(starCost) + '</span>' : '';
  const baseCostContent = baseCost ? '<p class="detail-panel-cost" aria-label="Base energy cost">' + renderCost(baseCost) + starCostContent + '</p>' : '';
  const upgradedCostContent = card.effect.upgraded !== null && upgradedCost ? '<p class="detail-panel-cost" aria-label="Upgraded energy cost">' + renderCost(upgradedCost, upgradedCost !== baseCost) + starCostContent + '</p>' : '';
  let baseContent = effect(card.effect.base), upgradedContent;
  if (card.effect.upgraded === null) {
    upgradedContent = '<span class="detail-empty">Cannot be upgraded.</span>';
  } else {
    const difference = compareEffects(card.effect.base, card.effect.upgraded, effect);
    upgradedContent = difference.upgraded;
  }
  baseContent = baseContent.replaceAll(icons.energy, icons.energyFor(card.character));
  upgradedContent = upgradedContent.replaceAll(icons.energy, icons.energyFor(card.character));
  if (searchableEffects) {
    const highlight = html => html.replace(/\bALL enemies\b/g, '<button type="button" class="detail-effect-search" data-effect-search="ALL enemies" aria-label="搜尋 ALL enemies">ALL enemies</button>');
    baseContent = highlight(baseContent);
    upgradedContent = highlight(upgradedContent);
  }
  if (showEffectTooltips) {
    const tooltips = require('./effect-tooltips.cjs');
    baseContent = tooltips.decorate(baseContent, card.id);
    upgradedContent = tooltips.decorate(upgradedContent, card.id, true);
  }
  const statRows = metadataAboveEffects ? ['Character', 'Type', 'Rarity'].map(label => card.stats.find(stat => stat.label === label)).filter(Boolean) : card.stats.filter(({label}) => !['Keywords', 'Upgrade', 'Target'].includes(label));
  if (rarityBeforeType && !metadataAboveEffects) {
    const typeIndex = statRows.findIndex(({label}) => label === 'Type');
    const rarityIndex = statRows.findIndex(({label}) => label === 'Rarity');
    if (typeIndex !== -1 && rarityIndex !== -1) [statRows[typeIndex], statRows[rarityIndex]] = [statRows[rarityIndex], statRows[typeIndex]];
  }
  const renderStat = ({label, value}) => {
    const rendered = label === 'Character' ? '<img src="' + card.characterIcon + '" alt="' + (metadataAboveEffects ? esc(value) : '') + '"' + (metadataAboveEffects ? ' title="' + esc(value) + '"' : '') + '>' + (metadataAboveEffects ? '' : esc(value)) : label === 'Rarity' ? '<span class="' + (metadataAboveEffects ? 'detail-plain-rarity' : 'rarity-label') + '" data-label-rarity="' + esc(value) + '">' + esc(value) + '</span>' : label === 'Type' ? '<span class="detail-type-label" data-type="' + esc(value) + '">' + esc(value) + '</span>' : effect(value).replaceAll(icons.energy, label === 'Energy cost' ? icons.energyFor(card.character) : icons.energy).replace(/→/g, '<span class="detail-cost-arrow" aria-label="upgrades to">→</span>');
    return '<div class="' + (metadataAboveEffects ? 'detail-meta-item' : 'detail-stat') + '"><dt>' + esc(label) + '</dt><dd' + (label === 'Type' ? ' data-type="' + esc(value) + '"' : label === 'Rarity' ? ' data-stat-rarity="' + esc(value) + '"' : label === 'Character' ? ' data-stat-character="' + esc(value) + '"' : '') + '>' + rendered + '</dd></div>';
  };
  const stats = statRows.filter(stat => !metadataAboveEffects || !['Character','Type'].includes(stat.label)).map(renderStat).join('');
  const typeMetadata = metadataAboveEffects ? '<dl class="detail-type-metadata" aria-label="Character, type and rarity">' + (cornerMetadata ? '' : renderStat({label:'Character',value:card.character})) + renderStat({label:'Type',value:card.type}) + (cornerMetadata ? '' : renderStat({label:'Rarity',value:card.rarity})) + '</dl>' : '';
  const keywords = card.keywords.map(keyword => {
    const description = (keyword.descriptionParts ? keyword.descriptionParts.map(part => part.color && /^#[0-9a-f]{3,8}$/i.test(part.color) ? '<span style="color:' + esc(part.color) + '">' + effect(part.text) + '</span>' : effect(part.text)).join('') : effect(keyword.description)).replaceAll(icons.energy, icons.energyFor(card.character));
    const debuff = keyword.frame?.endsWith('/hover_tip_debuff.webp');
    return '<div class="detail-keyword-item' + (debuff ? ' detail-keyword-debuff' : '') + '"><strong>' + esc(keyword.name) + (keyword.icon ? '<img src="' + esc(keyword.icon) + '" alt="" width="18" height="18" loading="lazy" decoding="async">' : '') + '</strong><p>' + description + '</p></div>';
  }).join('');
  const builds = showBuilds && card.builds.length ? card.builds.map(build => {
    return '<a class="detail-build" href="' + esc(buildLink(card, build, localBuilds)) + '"><span class="detail-build-tier" data-tier="' + esc(build.tier) + '">' + esc(build.tier) + '</span><span><span class="detail-build-name">' + esc(build.name) + '</span><span class="detail-build-meta">' + esc(build.character) + ' · ' + esc(build.role) + '</span></span></a>';
  }).join('') : '';
  const tierList = showTierRating && card.tier && ['Ironclad', 'Silent', 'Defect', 'Necrobinder', 'Regent'].includes(card.character)
    ? new URL('/zh-TW/card-tier-list/' + card.character.toLowerCase(), card.source).href : null;
  const tierDescription = 'Ranked ' + card.tier + ' tier in our ' + card.character + ' card tier list.';
  const tierBadge = tierList ? '<a class="detail-inline-tier" data-tier="' + esc(card.tier) + '" aria-label="Tier ' + esc(card.tier) + '" href="' + esc(tierList) + '" target="_blank" rel="noopener noreferrer">Tier ' + esc(card.tier) + '</a>' : '';
  const characterMetadata = metadataAboveEffects && tierBadge && !tierBesideName && !cornerMetadata ? '<dl class="detail-character-metadata" aria-label="Tier"><div class="detail-meta-item detail-tier-item"><dt>Tier</dt><dd>' + tierBadge + '</dd></div></dl>' : '';
  const art = '<figure class="detail-art" data-detail-row="1"><img src="' + esc(card.image) + '" width="700" height="532" alt="' + esc(card.name) + ' illustration" loading="lazy" decoding="async"></figure>';
  return `<article class="card-detail"${metadataAboveEffects ? ' data-card-layout="compact"' : ''} aria-labelledby="${prefix}-title" lang="en" data-source="${esc(card.source)}" data-character="${esc(card.character)}">
  <div class="detail-overview">
  ${characterMetadata}
  ${metadataAboveEffects ? '' : art}
  <header data-detail-row="2"><h2 class="detail-title" id="${prefix}-title">${cornerMetadata ? '<span class="detail-heading-row"><img class="detail-heading-character" src="' + esc(card.characterIcon) + '" alt="' + esc(card.character) + '" title="' + esc(card.character) + '">' : tierBesideName ? '<span class="detail-name-line">' : ''}<a class="detail-name-zh" lang="zh-Hant" href="${esc(chineseUrl.href)}" target="_blank" rel="noopener noreferrer">${esc(card.nameZh)}</a>${cornerMetadata ? '<span class="detail-heading-rarity" data-label-rarity="' + esc(card.rarity) + '">' + esc(card.rarity) + '</span></span>' : tierBesideName ? (tierList ? '<a class="detail-name-tier" data-tier="' + esc(card.tier) + '" aria-label="Tier ' + esc(card.tier) + '" href="' + esc(tierList) + '" target="_blank" rel="noopener noreferrer">' + esc(card.tier) + '</a>' : '') + '</span>' : ''}<a class="detail-name-en" href="${esc(require('./wiki-card-link.cjs')(card))}" target="_blank" rel="noopener noreferrer">${esc(card.name)}</a></h2></header>
  ${metadataAboveEffects ? art : ''}
  ${typeMetadata}
  <section class="detail-section detail-effects" data-detail-row="5" aria-label="Card effects"><div class="detail-effect-columns"><div class="detail-effect-panel" role="group" aria-label="Base">${metadataAboveEffects ? '' : '<h4>Base</h4>'}${baseCostContent}<p class="detail-panel-description">${baseContent}</p></div><div class="detail-effect-panel" role="group" aria-label="Upgraded">${metadataAboveEffects ? '' : '<h4 class="detail-upgraded">Upgraded</h4>'}${upgradedCostContent}<p class="detail-panel-description">${upgradedContent}</p></div></div>${showEffectNotes ? require('./effect-tooltips.cjs').notes(card.id) : ''}${showKeywords && keywords ? '<aside class="detail-keyword">' + keywords + '</aside>' : ''}</section>
  </div>
  ${cornerMetadata ? '<div class="detail-bottom-tier">' + (tierList ? '<a class="detail-name-tier" data-tier="' + esc(card.tier) + '" aria-label="Tier ' + esc(card.tier) + '" href="' + esc(tierList) + '" target="_blank" rel="noopener noreferrer">' + esc(card.tier) + '</a>' : '') + '</div>' : ''}
  ${metadataAboveEffects ? '' : '<section class="detail-section detail-card-stats" data-detail-row="6" aria-label="Card stats"><dl class="detail-stats">' + stats + '</dl></section>'}
  ${tierList && !metadataAboveEffects ? '<section class="detail-section detail-card-rating" data-detail-row="8" aria-label="Tier rating"><a class="detail-rating" href="' + esc(tierList) + '" target="_blank" rel="noopener noreferrer"><span class="tier detail-rating-badge" data-tier="' + esc(card.tier) + '" aria-label="Tier ' + esc(card.tier) + '">' + esc(card.tier) + '</span><span class="detail-rating-description">' + esc(tierDescription) + '</span></a></section>' : ''}
  ${builds ? '<section class="detail-section detail-card-builds" data-detail-row="7" aria-label="Builds using this card"><div class="detail-build-list">' + builds + '</div></section>' : ''}
</article>`.replace(/^[\t ]+$/gm, '');
}
module.exports = render;
