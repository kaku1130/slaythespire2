process.chdir(require('node:path').resolve(__dirname,'../..'));
const icons=require('../cards/resource-icons.cjs');
const order=['Common','Uncommon','Rare','Event'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const controls = "<div class=\"catalog-filter-rows\" lang=\"en\"><div class=\"catalog-filter-row\"><span>Rarity</span><div class=\"catalog-filter-buttons\" role=\"group\" aria-label=\"Rarity\"><button type=\"button\" data-catalog-filter=\"rarity\" value=\"Common\" aria-pressed=\"false\" style=\"--selection-color:#cbd5e1\">Common</button><button type=\"button\" data-catalog-filter=\"rarity\" value=\"Uncommon\" aria-pressed=\"false\" style=\"--selection-color:#74b3e6\">Uncommon</button><button type=\"button\" data-catalog-filter=\"rarity\" value=\"Rare\" aria-pressed=\"false\" style=\"--selection-color:#e3bf72\">Rare</button><button type=\"button\" data-catalog-filter=\"rarity\" value=\"Event\" aria-pressed=\"false\" style=\"--selection-color:#6ac1b4\">Event</button></div></div></div>";
function description(x){return esc(x.descEn||x.descI18n||x.descriptionClean).replace(/&lt;e&gt;(\d+)&lt;\/e&gt;/g,(_,n)=>icons.energy.repeat(Number(n))).replace(/&lt;s&gt;(\d+)&lt;\/s&gt;/g,(_,n)=>icons.star.repeat(Number(n))).replace(/&lt;g&gt;/g,'<span class="potion-keyword">').replace(/&lt;\/g&gt;/g,'</span>').replace(/&lt;e\s*\/&gt;|&lt;e&gt;\s*&lt;\/e&gt;/g,icons.energy).replace(/&lt;s\s*\/&gt;|&lt;s&gt;\s*&lt;\/s&gt;/g,icons.star);}
const styles=icons.styles+`.potion-filters .potion-rarities{order:0}.potion-filters #search{order:1;flex:0 1 420px;margin-left:auto}.potion-title-row{justify-content:center}@media(max-width:640px){.potion-filters #search{flex:1 1 100%;margin-left:0}}.potion-title-row{display:flex;align-items:baseline;gap:12px;margin:12px 0}.potion-title-row h2{margin:0;min-width:0}.potion-title-row .tag{flex-shrink:0;white-space:nowrap}.potion-keyword{color:#efc851;font-weight:500}.potion-rarities{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.potion-rarities button{font:inherit;cursor:pointer;padding:10px 16px;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--rarity-color)}[data-rarity-filter=Common],.potion[data-rarity=Common]{--rarity-color:#aab6c4}[data-rarity-filter=Uncommon],.potion[data-rarity=Uncommon]{--rarity-color:#74b3e6}[data-rarity-filter=Rare],.potion[data-rarity=Rare]{--rarity-color:#e3bf72}[data-rarity-filter=Event],.potion[data-rarity=Event]{--rarity-color:#6ac1b4}.potion .tag{color:var(--rarity-color)}.potion-rarities button:hover{border-color:currentColor}.potion-rarities button[aria-pressed=true]{border-color:currentColor;box-shadow:0 0 0 1px currentColor;background:color-mix(in srgb,var(--rarity-color) 12%,var(--paper))}.catalog:has(>.potion){grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}@media(max-width:1023px){.catalog:has(>.potion){grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:639px){.catalog:has(>.potion){grid-template-columns:1fr}}.entry.potion{display:grid;grid-template-columns:72px minmax(0,1fr);grid-template-rows:auto 1fr;column-gap:16px;row-gap:8px;align-items:start;padding:18px}.entry.potion[hidden]{display:none}.entry.potion>img{grid-column:1;grid-row:1 / 3;width:72px;height:72px;object-fit:contain}.entry.potion>.potion-title-row{grid-column:2;grid-row:1;align-self:start;justify-content:flex-start;margin:0;gap:10px}.entry.potion>p{grid-column:2;grid-row:2;margin:0}.potion-title-row h2{font-size:21px;line-height:1.45}@media(max-width:640px){.entry.potion{grid-template-columns:56px minmax(0,1fr);column-gap:12px;padding:14px}.entry.potion>img{width:56px;height:56px}.potion-title-row h2{font-size:20px}.entry.potion>.potion-title-row{gap:8px}}`;
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
    const matches = Object.entries(selected).every(([key, values]) => !values.size || values.has(entry.dataset[key]));
    const exact = query.length >= 2 && query.startsWith('"') && query.endsWith('"');
    const matchesSearch = exact
      ? [...entry.querySelectorAll('.relic-name-en,.relic-name-zh,.catalog-name-en,.potion-name-zh')].some(node => node.textContent.trim().toLowerCase() === query.slice(1, -1))
      : entry.textContent.toLowerCase().includes(query);
    entry.hidden = !matches || !matchesSearch;
    if (!entry.hidden) count++;
  }
  for (const section of document.querySelectorAll('.potion-section')) {
    const visible = section.querySelectorAll('.entry:not([hidden])').length;
    section.hidden = visible === 0;
    section.querySelector('.potion-section-count').textContent = '(' + visible + ')';
  }
  document.getElementById('empty').hidden = count > 0;
}
search.addEventListener('input', filter);
for (const button of buttons) button.addEventListener('click', () => {
  button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  filter();
});
filter();`;
module.exports={controls,description,styles,script,compare:(a,b)=>order.indexOf(a.rarity)-order.indexOf(b.rarity)||a.name.localeCompare(b.name,'zh-TW')||a.id.localeCompare(b.id)};

module.exports.styles += `
html body main#main-content .potion-filters > .potion-rarity-dropdown {
  display: grid;
  grid-column: 1 / -1;
  grid-row: 2;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
@media screen and (max-width: 599px), screen and (pointer: coarse) and (max-width: 1400px) {
  html body main#main-content .potion-filters > .potion-rarity-dropdown { grid-template-columns: 5rem minmax(0, 1fr); grid-column: 1 / -1; max-width: none; }
}
html body main#main-content #potion-rarity option[value="Common"],
html body main#main-content #potion-rarity:has(option[value="Common"]:checked) { color: #cbd5e1; }
html body main#main-content #potion-rarity option[value="Uncommon"],
html body main#main-content #potion-rarity:has(option[value="Uncommon"]:checked) { color: #74b3e6; }
html body main#main-content #potion-rarity option[value="Rare"],
html body main#main-content #potion-rarity:has(option[value="Rare"]:checked) { color: #e3bf72; }
html body main#main-content #potion-rarity option[value="Event"],
html body main#main-content #potion-rarity:has(option[value="Event"]:checked) { color: #6ac1b4; }
`;

module.exports.styles += `
html body main#main-content .potion-filters > .catalog-filter-rows {
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
.potion[data-rarity="Rare"] { --rarity-color: #e3bf72; }
html body main#main-content .potion-filters button[data-catalog-filter="rarity"][value="Rare"] { --selection-color: #e3bf72 !important; }
[data-relic-rarity="Rare"] { color: #e3bf72; }
.potion-section[data-rarity="Rare"] { --group-color: #e3bf72 !important; }

.potion[data-rarity="Shop"] { --rarity-color: #b08968; }
html body main#main-content .potion-filters button[data-catalog-filter="rarity"][value="Shop"] { --selection-color: #b08968 !important; }
[data-relic-rarity="Shop"] { color: #b08968; }
.potion-section[data-rarity="Shop"] { --group-color: #b08968 !important; }
`;
