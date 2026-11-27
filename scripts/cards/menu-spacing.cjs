module.exports = `
/* Use one compact vertical rhythm for search and menu groups. */
html {--group-gap:24px;--control-gap:8px}
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
/* Separate search and menu groups without widening gaps inside button groups. */
html body main#main-content#main-content#main-content :is(.tools,.filters,.monster-tools,.filter-menu-panel) {row-gap:24px!important}
`;
