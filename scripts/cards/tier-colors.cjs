const gold = require('../../data/ancient/tier-palette.json').A.background;
module.exports = `
/* Tier A matches the Crimson Mantle name color throughout labels and filters. */
:root {--card-tier-A:${gold};--catalog-tier-A:${gold}}
html body :is(.tier,.build-tier,.card-tier-badge,.relic-tier-label,.font-extrabold)[data-tier=A] {
  --tier-color:${gold}!important;background:${gold}!important;color:#fff!important;border-color:${gold}!important;
}
html body :is([data-tier-filter=A],#card-filter-tier button[value=A]) {
  --tier-color:${gold}!important;--selection-color:${gold}!important;
}
html body .card-detail :is(.detail-tier,.detail-build-tier)[data-tier=A] {
  color:${gold};background:color-mix(in srgb,${gold} 16%,#0b1119);border-color:${gold};
}
`;
