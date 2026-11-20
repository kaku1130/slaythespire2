const palette = require('../../data/ancient/tier-palette.json');
const tiers = {Basic:'D',Starter:'D',Common:'D',Uncommon:'B',Rare:'A',Ancient:'S',Shop:'C',Event:'C',Curse:'S',Status:'D',Token:'D',Quest:'A',None:'D'};
const labels = 'html body main#main-content :is(.rarity-label,[data-relic-rarity],.potion-rarity-row)';
const filters = 'html body main#main-content :is(#card-filter-rarity button,button[data-catalog-filter=rarity])';
module.exports = `
/* Rarity uses the same filled label in filters and entry details. */
${labels} {
 display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;
 width:max-content;max-width:100%;min-height:26px;padding:3px 10px;
 border:0;border-radius:4px;font:700 16px/1.4 Arial,"Microsoft JhengHei",sans-serif;
}
${filters} {border-radius:4px!important;position:relative;font-weight:700!important}
${filters}[aria-pressed=true] {outline:none;box-shadow:none!important}
${filters}[aria-pressed=true]::after {
 content:"✓";position:absolute;right:4px;top:3px;
 display:grid;place-items:center;width:18px;height:18px;
 border-radius:50%;background:#fff;color:#040609;font:800 14px/1 Arial,sans-serif;
}
${filters}:focus-visible {outline:2px solid #fff;outline-offset:3px}
${filters}:hover {filter:brightness(1.12)}
` + Object.entries(tiers).map(([rarity,tier]) => `
html body main#main-content :is(.rarity-label[data-label-rarity=${rarity}],[data-relic-rarity=${rarity}],.entry.potion[data-rarity=${rarity}] .potion-rarity-row,#card-filter-rarity button[value=${rarity}],button[data-catalog-filter=rarity][value=${rarity}]) {
 color:${palette[tier].color}!important;background:${palette[tier].background}!important;border-color:${palette[tier].background}!important;
}
`).join('') + `
/* Ancient labels share the same purple in filters and details. */
html body main#main-content :is(.rarity-label[data-label-rarity=Ancient],[data-relic-rarity=Ancient],.entry.potion[data-rarity=Ancient] .potion-rarity-row,#card-filter-rarity button[value=Ancient],button[data-catalog-filter=rarity][value=Ancient]) {
 background:#a78bdf!important;border-color:#a78bdf!important;
}
/* Event labels use a light coffee brown to distinguish them from Shop. */
html body main#main-content :is(.rarity-label[data-label-rarity=Event],[data-relic-rarity=Event],.entry.potion[data-rarity=Event] .potion-rarity-row,#card-filter-rarity button[value=Event],button[data-catalog-filter=rarity][value=Event]) {
 background:#b08b70!important;border-color:#b08b70!important;
}
`;
