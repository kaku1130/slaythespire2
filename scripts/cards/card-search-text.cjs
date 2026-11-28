// Index card content explicitly so commentary and source labels cannot add matches.
module.exports = card => [
  card.id, card.name, card.nameZh, ...(card.aliases || []),
  card.character, card.type, card.rarity,
  card.effect.base, card.effect.upgraded,
  ...card.stats.map(stat => stat.value),
  ...(require('../../data/cards/downloaded-card-images.json').cards[card.id]?.variants||[])
    .flatMap(variant=>[variant.label,variant.effect?.base,variant.effect?.upgraded])
].filter(value => value !== null && value !== undefined).join(' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ').trim().toLowerCase();
