const orange = require('../../data/ancient/tier-palette.json').A.background;
module.exports = `
/* Tier A uses orange throughout labels, filters and rankings. */
:root {--card-tier-A:${orange};--catalog-tier-A:${orange}}
html body :is(.tier,.build-tier,.card-tier-badge,.relic-tier-label,.font-extrabold)[data-tier=A] {
  --tier-color:${orange}!important;background:${orange}!important;color:#fff!important;border-color:${orange}!important;
}
html body :is([data-tier-filter=A],#card-filter-tier button[value=A]) {
  --tier-color:${orange}!important;--selection-color:${orange}!important;
}
html body .card-detail :is(.detail-tier,.detail-build-tier)[data-tier=A] {
  color:${orange};background:color-mix(in srgb,${orange} 16%,#0b1119);border-color:${orange};
}
`;
