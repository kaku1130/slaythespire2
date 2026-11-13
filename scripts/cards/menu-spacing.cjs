module.exports = `
/* Use one compact vertical rhythm for search and menu groups. */
html {--group-gap:8px;--control-gap:8px}
html body main#main-content {row-gap:8px!important}
html body main#main-content :is(.tools,.filters,.primary-filter-row,.secondary-filter-row,.chips,.filter-cluster,.rarity-buttons,.relic-menu-row,.chapter-filter-group,.monster-filter-options,.character-nav,.tier-index) {
  row-gap:8px!important;
}
html body main#main-content :is(.primary-filter-row,.secondary-filter-row,.chips,.filter-cluster,.catalog-search-tools) {
  margin-block:0!important;padding-block:0!important;
}
html body main#main-content>:is(.tools,.filters,.character-sidebar,.tier-sidebar) {
  margin-block:0 8px!important;padding-block:0!important;
}
html body main#main-content:has(>#card-scroll)>#tools {margin-block:0!important}
html body main#main-content>.mobile-search-row {margin-block:0 8px!important;padding-block:0!important}
html body main#main-content .split-list {row-gap:8px!important}
html body main#main-content .split-list>.filters {margin-block:0!important}
html body main#main-content [data-ancient-top-menu] {margin-bottom:8px}
html body main#main-content [data-ancient-top-menu]>div {margin-top:8px}
`;
