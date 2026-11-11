process.chdir(require('node:path').resolve(__dirname,'../..'));
const selector='.tools button[aria-pressed=true],.potion-rarities button[aria-pressed=true],.relic-filter-group button[aria-pressed=true],.character-nav a[aria-current=page],.tier-index-item[aria-current=location],.site-nav a[aria-current=page]';
const colors={Ironclad:'#dc6c68',Silent:'#70bf8b',Defect:'#6faeee',Necrobinder:'#b595dd',Regent:'#e3bf72',Shared:'#aab6c4',Event:'#6ac1b4',Starter:'#aab6c4',Common:'#aab6c4',Uncommon:'#74b3e6',Rare:'#e3bf72',Ancient:'#c49aef',Shop:'#fb923c'};
const base='.tools button,.potion-rarities button,.relic-filter-group button,.character-nav a,.tier-index-item,.site-nav a';
const rarityColors={Common:'#aab6c4',Uncommon:'#74b3e6',Rare:'#e3bf72',Ancient:'#c49aef',Event:'#6ac1b4'};
const styles=Object.entries(rarityColors).map(([value,color])=>'.potion-rarities button[data-rarity-filter='+value+']{--rarity-color:'+color+'}').join('')+Object.entries(colors).map(([value,color])=>'.relic-filter-group button[data-filter-value='+value+']{--selection-color:'+color+'}').join('')+`
${base}{--control-color:var(--selection-color,var(--tier-color,var(--rarity-color,var(--accent,var(--muted,#86909b)))));color:var(--control-color)!important}
${selector}{--selected-fill:var(--selection-color,var(--tier-color,var(--rarity-color,var(--accent,#238cc2))));background:color-mix(in srgb,var(--selected-fill) 22%,#0d131a)!important;color:var(--control-color)!important;border-color:color-mix(in srgb,var(--selected-fill) 65%,#293340)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--selected-fill) 40%,transparent)!important}
.character-nav a .sidebar-character-en,.tier-index-item .tier-index-name{color:inherit!important}
`;
module.exports={styles};
