process.chdir(require('node:path').resolve(__dirname,'../..'));
const groups={pool:['Ironclad','Silent','Defect','Necrobinder','Regent','Shared','Event'],rarity:['Common','Uncommon','Rare','Ancient','Shop','Event']};
const controls = "<div class=\"catalog-filter-rows\" lang=\"en\"><div class=\"catalog-filter-row\"><span>Character</span><div class=\"catalog-filter-buttons\" role=\"group\" aria-label=\"Pool\"><button type=\"button\" data-catalog-filter=\"pool\" value=\"Ironclad\" aria-pressed=\"false\" style=\"--selection-color:#dc6c68\">Ironclad</button><button type=\"button\" data-catalog-filter=\"pool\" value=\"Silent\" aria-pressed=\"false\" style=\"--selection-color:#70bf8b\">Silent</button><button type=\"button\" data-catalog-filter=\"pool\" value=\"Defect\" aria-pressed=\"false\" style=\"--selection-color:#6faeee\">Defect</button><button type=\"button\" data-catalog-filter=\"pool\" value=\"Necrobinder\" aria-pressed=\"false\" style=\"--selection-color:#b595dd\">Necrobinder</button><button type=\"button\" data-catalog-filter=\"pool\" value=\"Regent\" aria-pressed=\"false\" style=\"--selection-color:#e3bf72\">Regent</button><button type=\"button\" data-catalog-filter=\"pool\" value=\"Shared\" aria-pressed=\"false\" style=\"--selection-color:#aab6c4\">Shared</button><button type=\"button\" data-catalog-filter=\"pool\" value=\"Event\" aria-pressed=\"false\" style=\"--selection-color:#6ac1b4\">Event</button></div></div></div>";
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
  gap: 8px;
  width: 100%;
  min-width: 0;
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
@media screen and (max-width: 599px), screen and (pointer: coarse) and (max-width: 1400px) {
  .relic-dropdown-row {
    grid-template-columns: minmax(0, 1fr);
    max-width: none;
    gap: 8px;
  }
  .relic-dropdown { grid-template-columns: 5rem minmax(0, 1fr); }
}
@media screen and (pointer: coarse) and (min-width: 744px) and (max-width: 1400px) and (min-height: 501px) {
  .relic-dropdown-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
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
.relic-card-text {grid-column: 2; min-width: 0; overflow-wrap: anywhere}
.relic-card-text .tag {font-size: 12px; color: var(--rarity-color, var(--muted))}
.relic-card-text h3 {margin: 4px 0; font-size: 17px; line-height: 1.35}
.relic-card-text p {margin: 0; color: var(--muted); line-height: 1.5}
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
const search = document.getElementById('search');
const buttons = [...document.querySelectorAll('[data-catalog-filter]')];
function filter() {
  const query = search.value.trim().toLowerCase();
  const selected = {};
  for (const button of buttons) {
    const key = button.dataset.catalogFilter;
    selected[key] ??= new Set();
    if (button.getAttribute('aria-pressed') === 'true') selected[key].add(button.value);
  }
  let count = 0;
  for (const entry of entries) {
    const matches = Object.entries(selected).every(([key, values]) => !values.size || values.has(entry.dataset[key]) || (key === 'rarity' && values.has('Common') && entry.dataset.rarity === 'Starter'));
    const exact = query.length >= 2 && query.startsWith('"') && query.endsWith('"');
    const matchesSearch = exact
      ? [...entry.querySelectorAll('.relic-name-en,.relic-name-zh,.catalog-name-en,.potion-name-zh')].some(node => node.textContent.trim().toLowerCase() === query.slice(1, -1))
      : entry.textContent.toLowerCase().includes(query);
    entry.hidden = !matches || !matchesSearch;
    if (!entry.hidden) count++;
  }
  for (const section of document.querySelectorAll('.relic-section')) {
    const visible = section.querySelectorAll('.entry:not([hidden])').length;
    section.hidden = visible === 0;
    section.querySelector('.relic-section-count').textContent = '(' + visible + ')';
  }
  document.getElementById('empty').hidden = count > 0;
}
search.addEventListener('input', filter);
for (const button of buttons) button.addEventListener('click', () => {
  button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  filter();
});
filter();`;
module.exports = {controls:require('../cards/character-filter.cjs')(controls), styles, script};

module.exports.styles += `
html body main#main-content .relic-filters > .catalog-filter-rows {
  display: grid;
  grid-column: 1 / -1;
  grid-row: 2;
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.catalog-filter-row { display: grid; grid-template-columns: 60px minmax(0, 1fr); align-items: center; gap: 8px; min-width: 0; }
.catalog-filter-row > span { color: #fff; font: 600 14px/1.6 Arial, "Microsoft JhengHei", sans-serif; }
.catalog-filter-buttons { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
html body main#main-content .filters .catalog-filter-buttons button {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 40px;
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--control-bg, var(--paper));
  color: var(--selection-color);
  font: 400 16px/1.4 Arial, "Microsoft JhengHei", sans-serif;
  cursor: pointer;
}
html body main#main-content .filters .catalog-filter-buttons button:is(:hover, :focus-visible, [aria-pressed=true]) {
  border-color: var(--selection-color);
  background: color-mix(in srgb, var(--selection-color) 15%, var(--paper));
}
`;

module.exports.styles += `
html body main#main-content .relic-filters .catalog-filter-row {
  grid-template-columns: 80px minmax(0, 1fr);
  column-gap: 16px;
}
`;

module.exports.styles += `
.relic[data-rarity="Rare"] { --rarity-color: #e3bf72; }
html body main#main-content .relic-filters button[data-catalog-filter="rarity"][value="Rare"] { --selection-color: #e3bf72 !important; }
[data-relic-rarity="Rare"] { color: #e3bf72; }

.relic[data-rarity="Shop"] { --rarity-color: #b08968; }
html body main#main-content .relic-filters button[data-catalog-filter="rarity"][value="Shop"] { --selection-color: #b08968 !important; }
[data-relic-rarity="Shop"] { color: #b08968; }
`;
