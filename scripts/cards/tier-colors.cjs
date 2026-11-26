const gold = require('../../data/cards/tier-palette.json').A.background;
module.exports = `
/* Tier A matches the Crimson Mantle name color throughout labels and filters. */
:root {--card-tier-A:${gold};--catalog-tier-A:${gold}}
html body :is(.tier,.build-tier,.card-tier-badge,.relic-tier-label,.font-extrabold)[data-tier=A] {
  --tier-color:${gold}!important;background:${gold}!important;color:#000!important;border-color:${gold}!important;
}
html body .card-detail :is(.detail-tier,.detail-build-tier)[data-tier=A] {
  color:${gold};background:color-mix(in srgb,${gold} 16%,#0b1119);border-color:${gold};
}
`;
