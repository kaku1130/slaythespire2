module.exports = `
/* Tier A uses the Regent gold throughout labels, filters and rankings. */
:root {--card-tier-A:#e3bf72;--catalog-tier-A:#e3bf72}
html body :is(.tier,.build-tier,.card-tier-badge,.relic-tier-label,.font-extrabold)[data-tier=A] {
  --tier-color:#e3bf72!important;background:#e3bf72!important;color:#fff!important;border-color:#e3bf72!important;
}
html body :is([data-tier-filter=A],#card-filter-tier button[value=A]) {
  --tier-color:#e3bf72!important;--selection-color:#e3bf72!important;
}
html body .card-detail :is(.detail-tier,.detail-build-tier)[data-tier=A] {
  color:#e3bf72;background:color-mix(in srgb,#e3bf72 16%,#0b1119);border-color:#e3bf72;
}
`;
