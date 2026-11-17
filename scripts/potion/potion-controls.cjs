process.chdir(require('node:path').resolve(__dirname,'../..'));
const icons=require('../cards/resource-icons.cjs');
const order=['Common','Uncommon','Rare','Event'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const controls = '<div class="potion-rarity-dropdown" lang="en"><label for="potion-rarity">Rarity</label><select id="potion-rarity"><option value="">All</option>'
  + order.map(rarity => '<option value="' + rarity + '">' + rarity + '</option>').join('') + '</select></div>';
function description(x){return esc(x.descI18n||x.descriptionClean).replace(/&lt;e&gt;(\d+)&lt;\/e&gt;/g,(_,n)=>icons.energy.repeat(Number(n))).replace(/&lt;s&gt;(\d+)&lt;\/s&gt;/g,(_,n)=>icons.star.repeat(Number(n))).replace(/&lt;g&gt;/g,'<span class="potion-keyword">').replace(/&lt;\/g&gt;/g,'</span>').replace(/&lt;e\s*\/&gt;|&lt;e&gt;\s*&lt;\/e&gt;/g,icons.energy).replace(/&lt;s\s*\/&gt;|&lt;s&gt;\s*&lt;\/s&gt;/g,icons.star);}
const styles=icons.styles+`.potion-filters .potion-rarities{order:0}.potion-filters #search{order:1;flex:0 1 420px;margin-left:auto}.potion-title-row{justify-content:center}@media(max-width:640px){.potion-filters #search{flex:1 1 100%;margin-left:0}}.potion-title-row{display:flex;align-items:baseline;gap:12px;margin:12px 0}.potion-title-row h2{margin:0;min-width:0}.potion-title-row .tag{flex-shrink:0;white-space:nowrap}.potion-keyword{color:#fbbf24;font-weight:500}.potion-rarities{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.potion-rarities button{font:inherit;cursor:pointer;padding:10px 16px;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--rarity-color)}[data-rarity-filter=Common],.potion[data-rarity=Common]{--rarity-color:#aab6c4}[data-rarity-filter=Uncommon],.potion[data-rarity=Uncommon]{--rarity-color:#74b3e6}[data-rarity-filter=Rare],.potion[data-rarity=Rare]{--rarity-color:#e3bf72}[data-rarity-filter=Event],.potion[data-rarity=Event]{--rarity-color:#6ac1b4}.potion .tag{color:var(--rarity-color)}.potion-rarities button:hover{border-color:currentColor}.potion-rarities button[aria-pressed=true]{border-color:currentColor;box-shadow:0 0 0 1px currentColor;background:color-mix(in srgb,var(--rarity-color) 12%,var(--paper))}.catalog:has(>.potion){grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}@media(max-width:1023px){.catalog:has(>.potion){grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:639px){.catalog:has(>.potion){grid-template-columns:1fr}}.entry.potion{display:grid;grid-template-columns:72px minmax(0,1fr);grid-template-rows:auto 1fr;column-gap:16px;row-gap:8px;align-items:start;padding:18px}.entry.potion[hidden]{display:none}.entry.potion>img{grid-column:1;grid-row:1 / 4;width:72px;height:72px;object-fit:contain}.entry.potion>.potion-title-row{grid-column:2;grid-row:1;align-self:start;justify-content:flex-start;margin:0;gap:10px}.entry.potion>.catalog-name-en{grid-column:2;grid-row:2;font-size:.9em;color:var(--muted);overflow-wrap:anywhere}.entry.potion>p{grid-column:2;grid-row:3;margin:0}.potion-title-row h2{font-size:21px;line-height:1.45}@media(max-width:640px){.entry.potion{grid-template-columns:56px minmax(0,1fr);column-gap:12px;padding:14px}.entry.potion>img{width:56px;height:56px}.potion-title-row h2{font-size:20px}.entry.potion>.potion-title-row{gap:8px}}`;
const script=`const entries=[...document.querySelectorAll('.entry')],search=document.querySelector('#search'),rarity=document.querySelector('#potion-rarity');function filter(){const q=search.value.trim().toLowerCase();let count=0;for(const e of entries){e.hidden=!(e.textContent.toLowerCase().includes(q)&&(!rarity.value||rarity.value===e.dataset.rarity));if(!e.hidden)count++;}for(const section of document.querySelectorAll('.potion-section')){const visible=[...section.querySelectorAll('.entry')].filter(e=>!e.hidden).length;section.hidden=visible===0;section.querySelector('.potion-section-count').textContent='('+visible+')';}document.querySelector('#empty').hidden=count>0;}search.addEventListener('input',filter);rarity.addEventListener('change',filter);filter();`;
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
