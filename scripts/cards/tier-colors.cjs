module.exports = `
/* Tier A uses orange throughout labels, filters and rankings. */
:root {--card-tier-A:#f97316;--catalog-tier-A:#f97316}
html body :is(.tier,.build-tier,.card-tier-badge,.relic-tier-label,.font-extrabold)[data-tier=A] {
  --tier-color:#f97316!important;background:#f97316!important;color:#fff!important;border-color:#f97316!important;
}
html body :is([data-tier-filter=A],#card-filter-tier button[value=A]) {
  --tier-color:#f97316!important;--selection-color:#f97316!important;
}
html body .card-detail :is(.detail-tier,.detail-build-tier)[data-tier=A] {
  color:#f97316;background:color-mix(in srgb,#f97316 16%,#0b1119);border-color:#f97316;
}
`;
