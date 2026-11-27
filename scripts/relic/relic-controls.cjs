process.chdir(require('node:path').resolve(__dirname,'../..'));
const pools=['Ironclad','Silent','Regent','Necrobinder','Defect','Shared'];
const poolColors={Ironclad:'#dc6c68',Silent:'#70bf8b',Defect:'#6faeee',Regent:'#e3bf72',Necrobinder:'#b595dd',Shared:'#aab6c4'};
const ancientMenu=require('./ancient-relics.cjs').renderFilterMenu();
const poolButtons=pools.map(value=>'<button type="button" data-catalog-filter="pool" value="'+value+'" aria-pressed="false" style="--selection-color:'+poolColors[value]+';--button-accent:'+poolColors[value]+'">'+(value==='Shared'?'Colorless':value)+'</button>').join('');
const controls='<div class="catalog-filter-rows" lang="en"><div class="catalog-filter-row"><div class="catalog-filter-buttons" id="relic-filter-pool" role="group" aria-label="Pool">'+poolButtons+'<button type="button" data-catalog-filter="enchantments" value="true" aria-pressed="false">Enchantments</button></div></div><div class="catalog-filter-row relic-ancient-block" role="group" aria-label="遠古之民遺物"><div class="catalog-filter-buttons relic-ancient-buttons">'+ancientMenu+'<button type="button" data-catalog-filter="rarity" value="Ancient" aria-pressed="false">Ancient</button></div></div></div>';
const styles = `
main#main-content>.relic-filters {
  --control-height: 40px;
  --control-font: 14px;
  --control-radius: 8px;
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
`;
const script = `const entries = [...document.querySelectorAll('.entry')];
const search = document.getElementById('search');
const buttons = [...document.querySelectorAll('[data-catalog-filter]')];
function filter() {
  const ancient=buttons.find(button=>button.dataset.catalogFilter==='ancient'&&button.getAttribute('aria-pressed')==='true');
  if(ancient)for(const button of buttons){
    const key=button.dataset.catalogFilter;
    if(key==='ancient')button.setAttribute('aria-pressed',String(button===ancient));
    if(key==='rarity')button.setAttribute('aria-pressed',String(button.value==='Ancient'));
    if(key==='pool')button.setAttribute('aria-pressed','false');
  }
  const selectedPools=buttons.filter(button=>button.dataset.catalogFilter==='pool'&&button.getAttribute('aria-pressed')==='true');
  for(const button of selectedPools.slice(1))button.setAttribute('aria-pressed','false');
  const query = search.value.trim().toLowerCase();
  const queries = [...new Set(query.split(/[\\s、，,+]+/).filter(Boolean))];
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
      : !queries.length || queries.some(value => entry.textContent.toLowerCase().includes(value));
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
search.addEventListener('input',()=>{
  if(search.value.trim())for(const button of buttons)button.setAttribute('aria-pressed','false');
  filter();
});
for (const button of buttons) button.addEventListener('click', () => {
  if(button.dataset.catalogFilter==='ancient'||(button.dataset.catalogFilter==='rarity'&&button.value==='Ancient')){
    for(const other of buttons)other.setAttribute('aria-pressed',String(other===button||(button.dataset.catalogFilter==='ancient'&&other.dataset.catalogFilter==='rarity'&&other.value==='Ancient')));
  }else{
    const selected=button.getAttribute('aria-pressed') !== 'true';
    for(const other of buttons)other.setAttribute('aria-pressed','false');
    button.setAttribute('aria-pressed', String(selected));
  }
  search.value='';
  search.dispatchEvent(new Event('input',{bubbles:true}));
});
filter();`;
module.exports = {controls:require('../cards/character-filter.cjs')(controls,{iconPaths:{Shared:'assets/cards/icons/colorless.webp'},labels:{Shared:'Colorless'}}), styles, script};

module.exports.styles += `
html body main#main-content .relic-filters > .catalog-filter-rows {
  display: grid;
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.catalog-filter-row { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; gap: 8px; min-width: 0; }
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

// These colors still style relic entries, independently of filter buttons.
const entryColors={Ancient:'#c4b5fd',Shop:'#00d3bd',Event:'#f472b6'};
module.exports.styles += Object.entries(entryColors).map(([rarity,color]) => '\nhtml body #main-content .entry.relic[data-rarity='+rarity+'] {--rarity-color:'+color+'}\nhtml body #main-content .entry.relic[data-rarity='+rarity+'] [data-relic-rarity] {color:'+color+'}').join('');

module.exports.styles += `
html body main#main-content#main-content .relic-ancient-block {container-type:inline-size;--plain-rarity-color:#c5a2e8;--selection-color:#c5a2e8;--button-accent:#c5a2e8;border-color:#c5a2e8}
html body main#main-content#main-content .relic-ancient-buttons {display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
html body main#main-content .relic-ancient-menu {grid-column:1 / -1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%;min-width:0}
@container (min-width:320px) {
 html body main#main-content .relic-ancient-menu {grid-template-columns:repeat(4,minmax(0,1fr))}
}
@container (min-width:640px) {
 html body main#main-content .relic-ancient-menu {grid-template-columns:repeat(8,minmax(0,1fr))}
}
html body main#main-content .relic-ancient-menu>button {display:flex;align-items:center;justify-content:center;min-width:0;padding:8px 4px;border:1px solid #344454;border-radius:8px;background:#0b1119;cursor:pointer}
html body main#main-content#main-content#main-content .relic-ancient-block button:is(:hover,:focus-visible,[aria-pressed=true]) {border-color:#c5a2e8!important}
html body main#main-content#main-content#main-content .relic-ancient-block button[aria-pressed=true] {background:color-mix(in srgb,#c5a2e8 22%,#0d131a)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,#c5a2e8 40%,transparent)!important}
html body main#main-content .relic-ancient-menu>button>img {display:block;width:32px;max-width:100%;height:32px;object-fit:contain}
html body main#main-content#main-content#main-content#main-content#main-content #relic-filter-pool>button {border-color:var(--selection-color)!important}
html body main#main-content#main-content #relic-filter-pool .filter-character-icon {width:32px;height:32px}
html body main#main-content#main-content#main-content #relic-filter-pool button[data-catalog-filter=enchantments] {--selection-color:#f472b6;--button-accent:#f472b6;color:#f472b6;border-color:#f472b6}
html body main#main-content#main-content#main-content #relic-filter-pool button[data-catalog-filter=enchantments]:is(:hover,:focus-visible,[aria-pressed=true]) {border-color:#f472b6!important}
html body main#main-content#main-content#main-content #relic-filter-pool button[data-catalog-filter=enchantments][aria-pressed=true] {background:color-mix(in srgb,#f472b6 22%,#0d131a)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,#f472b6 40%,transparent)!important}
`;
