process.chdir(require('node:path').resolve(__dirname,'../..'));
const groups={pool:['Ironclad','Silent','Defect','Necrobinder','Regent','Shared','Event'],rarity:['Starter','Common','Uncommon','Rare','Ancient','Shop','Event']};
const controls = '<div class="relic-dropdown-row">' + Object.entries(groups).map(([key, values]) => {
  const title = key === 'pool' ? 'Pool' : 'Rarity';
  return '<label class="relic-dropdown"><span lang="en">' + title + '</span><select data-relic-filter="' + key
    + '"><option value="">All</option>' + values.map(value => '<option value="' + value + '">' + value
    + '</option>').join('') + '</select></label>';
}).join('') + '</div>';
const styles = `
main#main-content>.relic-filters {
  --control-height: 40px;
  --control-font: 14px;
  --control-radius: 8px;
}
.relic-dropdown-row {
  display: grid;
  grid-column: 1 / -1;
  grid-row: 2;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(8px, 2vw, 20px);
  width: 100%;
  max-width: min(32rem, calc(100vw - 32px));
  min-width: 0;
  justify-self: start;
  margin-inline-end: auto;
}
.relic-dropdown {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #fff;
  font: 600 14px/1.6 Arial, "Microsoft JhengHei", sans-serif;
}
main#main-content .relic-filters .relic-dropdown select {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding-inline: 8px;
  color: var(--ink);
  text-overflow: ellipsis;
  display: block;
}
main#main-content .relic-filters .relic-dropdown select:focus-visible {
  outline-offset: -2px;
}
.relic-section .entry.relic {
  border-radius: 12px;
  transition: border-color 150ms ease, background-color 150ms ease;
}
.relic-section .entry.relic:hover,
.relic-section .entry.relic:focus-within {
  border-color: color-mix(in srgb, var(--pool-color, var(--muted)) 55%, var(--line));
  background-color: color-mix(in srgb, var(--pool-color, var(--muted)) 5%, var(--paper));
}
@media (max-width: 599px), (pointer: coarse) and (max-width: 1000px) and (max-height: 500px) {
  .relic-dropdown-row {
    grid-template-columns: minmax(0, 1fr);
    max-width: min(100%, calc(100vw - 32px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
    gap: 8px;
  }
  main#main-content .relic-filters .relic-dropdown select {
    font-size: 16px;
    padding-inline: 4px;
  }
}
.relic-card-text {grid-column: 2; min-width: 0; overflow-wrap: anywhere}
.relic-card-text .tag {font-size: 12px; color: var(--rarity-color, var(--muted))}
.relic-card-text h3 {margin: 4px 0; font-size: 17px; line-height: 1.35}
.relic-card-text p {margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5}
.relic-card-ranking {margin-top: 4px}
[data-relic-pool="Ironclad"],
.relic-dropdown select[data-relic-filter="pool"] option[value="Ironclad"],
main#main-content .relic-filters select[data-relic-filter="pool"]:has(option[value="Ironclad"]:checked) {color: #dc6c68}
[data-relic-pool="Silent"],
.relic-dropdown select[data-relic-filter="pool"] option[value="Silent"],
main#main-content .relic-filters select[data-relic-filter="pool"]:has(option[value="Silent"]:checked) {color: #70bf8b}
[data-relic-pool="Defect"],
.relic-dropdown select[data-relic-filter="pool"] option[value="Defect"],
main#main-content .relic-filters select[data-relic-filter="pool"]:has(option[value="Defect"]:checked) {color: #6faeee}
[data-relic-pool="Necrobinder"],
.relic-dropdown select[data-relic-filter="pool"] option[value="Necrobinder"],
main#main-content .relic-filters select[data-relic-filter="pool"]:has(option[value="Necrobinder"]:checked) {color: #b595dd}
[data-relic-pool="Regent"],
.relic-dropdown select[data-relic-filter="pool"] option[value="Regent"],
main#main-content .relic-filters select[data-relic-filter="pool"]:has(option[value="Regent"]:checked) {color: #e3bf72}
[data-relic-pool="Shared"],
.relic-dropdown select[data-relic-filter="pool"] option[value="Shared"],
main#main-content .relic-filters select[data-relic-filter="pool"]:has(option[value="Shared"]:checked) {color: #aab6c4}
[data-relic-pool="Event"],
.relic-dropdown select[data-relic-filter="pool"] option[value="Event"],
main#main-content .relic-filters select[data-relic-filter="pool"]:has(option[value="Event"]:checked) {color: #6ac1b4}
[data-relic-pool="Fallback"],
.relic-dropdown select[data-relic-filter="pool"] option[value="Fallback"],
main#main-content .relic-filters select[data-relic-filter="pool"]:has(option[value="Fallback"]:checked) {color: #c8ab79}
[data-relic-rarity="Starter"],
.relic-dropdown select[data-relic-filter="rarity"] option[value="Starter"],
main#main-content .relic-filters select[data-relic-filter="rarity"]:has(option[value="Starter"]:checked) {color: #a1a1aa}
[data-relic-rarity="Common"],
.relic-dropdown select[data-relic-filter="rarity"] option[value="Common"],
main#main-content .relic-filters select[data-relic-filter="rarity"]:has(option[value="Common"]:checked) {color: #cbd5e1}
[data-relic-rarity="Uncommon"],
.relic-dropdown select[data-relic-filter="rarity"] option[value="Uncommon"],
main#main-content .relic-filters select[data-relic-filter="rarity"]:has(option[value="Uncommon"]:checked) {color: #74b3e6}
[data-relic-rarity="Rare"],
.relic-dropdown select[data-relic-filter="rarity"] option[value="Rare"],
main#main-content .relic-filters select[data-relic-filter="rarity"]:has(option[value="Rare"]:checked) {color: #e3bf72}
[data-relic-rarity="Ancient"],
.relic-dropdown select[data-relic-filter="rarity"] option[value="Ancient"],
main#main-content .relic-filters select[data-relic-filter="rarity"]:has(option[value="Ancient"]:checked) {color: #c084fc}
[data-relic-rarity="Shop"],
.relic-dropdown select[data-relic-filter="rarity"] option[value="Shop"],
main#main-content .relic-filters select[data-relic-filter="rarity"]:has(option[value="Shop"]:checked) {color: #fb923c}
[data-relic-rarity="Event"],
.relic-dropdown select[data-relic-filter="rarity"] option[value="Event"],
main#main-content .relic-filters select[data-relic-filter="rarity"]:has(option[value="Event"]:checked) {color: #6ac1b4}
[data-relic-rarity="None"],
.relic-dropdown select[data-relic-filter="rarity"] option[value="None"],
main#main-content .relic-filters select[data-relic-filter="rarity"]:has(option[value="None"]:checked) {color: #a1a1aa}
`;
const script = `const entries = [...document.querySelectorAll('.entry')];
const search = document.querySelector('#search');
const filters = [...document.querySelectorAll('[data-relic-filter]')];
function filter() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const entry of entries) {
    const matches = filters.every(select => !select.value || entry.dataset[select.dataset.relicFilter] === select.value);
    entry.hidden = !matches || !entry.textContent.toLowerCase().includes(query);
    if (!entry.hidden) visible++;
  }
  for (const section of document.querySelectorAll('.relic-section')) {
    const count = section.querySelectorAll('.entry:not([hidden])').length;
    section.hidden = count === 0;
    section.querySelector('.relic-section-count').textContent = '(' + count + ')';
  }
  document.querySelector('#empty').hidden = visible > 0;
}
search.addEventListener('input', filter);
for (const select of filters) select.addEventListener('change', filter);
filter();`;
module.exports = {controls, styles, script};
