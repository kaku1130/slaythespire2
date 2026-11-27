const {items} = require('../../data/enchantments/catalog.json');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const sources = new Set(items.flatMap(item => item.foundIn.map(source => source.url)));
const byName = new Map(items.map(item => [item.name.toLowerCase(), item]));

function isRelated(relic) {
  return sources.has(relic.sourceEn) || /\benchant(?:ment)?s?\b|\benchanted\b/i.test(relic.descEn || relic.descriptionClean || '');
}

function linkDescription(html, prefix = '') {
  // Effect parts already isolate the colored enchantment names from ordinary prose.
  return html.replace(/<span\b([^>]*)>([^<]*)<\/span>/g, (original, attrs, text) => {
    const name = text.replace(/&#39;/g, "'").replace(/&amp;/g, '&').toLowerCase();
    const enchantment = byName.get(name);
    const keyword = /^enchant(?:ment)?s?$|^enchanted$/i.test(name);
    if (!enchantment && !keyword) return original;
    const href = prefix + 'enchantments.html' + (enchantment ? '#enchantment-' + enchantment.id : '');
    return '<a class="relic-enchantment-link" data-same-tab="true" target="_self" href="' + escape(href) + '" style="color:#f472b6">' + text + '</a>';
  });
}

module.exports = {isRelated, linkDescription};
