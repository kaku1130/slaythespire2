const colors = require('../../data/ancient/tier-palette.json');
const selector = 'html body :is(.card-detail .detail-tier,.card-detail .detail-build-tier,body.character-guide-page .build-tier,body.character-guide-page .card-tier-badge)';
const colorSelector = 'html body #main-content :is(.card-detail .detail-tier,.card-detail .detail-build-tier,.build-tier,.card-tier-badge,.tier,.relic-tier-label,.font-extrabold)';
module.exports = '\n/* Solid tier labels, matching the ancient ranking label presentation. */\n' + `
${selector}[data-tier] {
  display:inline-flex;align-items:center;justify-content:center;
  box-sizing:border-box;flex:0 0 auto;min-width:36px;min-height:34px;height:auto;
  padding:3px 10px;border-radius:4px;font:800 20px/1.3 Arial,"Microsoft JhengHei",sans-serif;
}
` + Object.entries(colors).map(([tier,{color,background}]) => `
${colorSelector}[data-tier=${tier}][data-tier] {
  color:#000!important;background:${background}!important;border:1px solid ${background}!important;
}
`).join('');

module.exports += "\n/* Tier A labels use black lettering on their existing background. */\nhtml body #main-content :is(.detail-tier,.detail-build-tier,.build-tier,.card-tier-badge,.tier,.relic-tier-label,.font-extrabold)[data-tier=A][data-tier] {color:#000!important}\n";
// Metadata follows the badges on the English card detail pages.
const metadata = 'html body #main-content .card-detail .detail-meta';
module.exports += Object.entries(colors).map(([tier,{background}]) => '\nhtml body .card-detail .detail-inline-tier[data-tier='+tier+'] {--inline-tier-color:'+background+'}').join('');
module.exports += `
/* English card metadata: plain rarity/type text and compact solid tier badges. */
${metadata}>:is(.detail-type,.detail-rarity) {
  min-height:0;height:auto;padding:0;border:0;border-radius:0;background:transparent;
}
${metadata}>.detail-type {font-size:16px;font-weight:500;line-height:24px}
${metadata}>.detail-rarity {font-size:14px;font-weight:400;line-height:20px}
${metadata}>.detail-tier[data-tier][data-tier] {
  flex:0 1 auto;min-width:0;min-height:0;height:auto;
  padding:2px 8px;border:0!important;border-radius:6px;
  font:700 12px/16px Arial,"Microsoft JhengHei",sans-serif;
}
`;
const typeColors={Attack:'lab(63.7053% 60.745 31.3109)',Skill:'lab(78.503% -64.9265 39.7492)',Power:'lab(83.2664% 8.65132 106.895)'};
const rarityColors={Basic:'lab(84.9837% .601262 -2.17986)',Common:'lab(84.9837% .601262 -2.17986)',Uncommon:'lab(65.0361% -1.42065 -56.9802)',Rare:typeColors.Power,Ancient:'lab(72.7183% 31.8672 97.9407)'};
const tierColors=Object.fromEntries(['S','A','B','C','D'].map(tier=>[tier,['#000','var(--card-tier-'+tier+')']]));
for(const [type,color] of Object.entries(typeColors))module.exports += `
${metadata}>.detail-type[data-type=${type}] {color:${color}}
`;
for(const [rarity,color] of Object.entries(rarityColors))module.exports += `
${metadata}>.detail-rarity[data-rarity=${rarity}] {color:${color}}
`;
for(const [tier,[color,background]] of Object.entries(tierColors))module.exports += `
${metadata}>.detail-tier[data-tier=${tier}][data-tier] {color:${color}!important;background:${background}!important}
`;

module.exports += require('./rarity-colors.cjs');

module.exports += `
/* Card tier filters use the same button presentation as Type filters. */
html body #main-content #tools :is(#card-filter-tier,#card-filter-energy) button {
  min-height:48px;padding:8px;border-radius:8px;
  font:400 20px/1.4 Arial,"Microsoft JhengHei",sans-serif;
  background:var(--control-bg,#0d131a)!important;border:1px solid var(--line)!important;
  position:relative;
}
html body #main-content #tools :is(#card-filter-tier,#card-filter-energy) button[value][aria-pressed=true] {
  border-color:var(--tier-text-color)!important;
  background:color-mix(in srgb,var(--tier-text-color) 22%,#0d131a)!important;
  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tier-text-color) 40%,transparent)!important;
}
html body #main-content #tools #card-filter-tier button[aria-pressed=true]::after {
  content:none;
}
html body #main-content #tools :is(#card-filter-tier,#card-filter-energy) button:is(:hover,:focus-visible) {border-color:var(--tier-text-color)!important}
` + Object.entries(colors).map(([tier,{background}]) => `
html body #main-content #tools #card-filter-tier button[value=${tier}] {
  --tier-text-color:${background};color:var(--tier-text-color)!important;
  background:var(--control-bg,#0d131a)!important;border:1px solid var(--line)!important;
}
`).join('');

module.exports += `
/* Energy filters share Tier button states without selection checkmarks. */
html body #main-content #tools #card-filter-energy button {
 --tier-text-color:#e3bf72;color:var(--tier-text-color)!important;gap:8px;
}
html body #main-content #tools #card-filter-energy button[aria-pressed=true]::after {
 content:none;
}
`;
