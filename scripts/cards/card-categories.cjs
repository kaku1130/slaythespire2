const categories = ['Ironclad', 'Silent', 'Regent', 'Necrobinder', 'Defect', 'Colorless', 'Event', 'Curse'];
function category(card) {
  if (card.pool === 'Event') return 'Event';
  if (['Curse', 'Quest'].includes(card.pool) || ['Curse', 'Quest'].includes(card.rarity)) return 'Curse';
  return card.pool;
}
const groups = [...categories, 'Quest'];
function group(card) {
  const parent = category(card);
  if (parent !== 'Curse') return parent;
  if (card.type === 'Quest') return 'Quest';
  return 'Curse';
}
function filterCategory(group) {
  return ['Curse', 'Quest'].includes(group) ? 'Curse' : group;
}
module.exports = {categories, category, groups, group, filterCategory};
