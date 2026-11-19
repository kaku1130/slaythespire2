module.exports = `
/* Use consistent colored frames for filter groups on every device. */
html body main#main-content #tools .card-filter-row,
html body main#main-content #tools > .card-action-row,
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row {
  box-sizing:border-box;
  min-width:0;
  padding:8px;
  border:1px solid var(--filter-frame-color,#293340);
  border-radius:10px;
}
html body main#main-content #tools .card-filter-row:has(#card-filter-character),
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row:has([data-catalog-filter=pool]) {
  --filter-frame-color:#b595dd;
}
html body main#main-content #tools .card-filter-row:has(#card-filter-rarity),
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row:has([data-catalog-filter=rarity]) {
  --filter-frame-color:#e3bf72;
}
html body main#main-content #tools .card-filter-row:has(#card-filter-type) {--filter-frame-color:#6faeee}
html body main#main-content #tools > .card-action-row {--filter-frame-color:#70bf8b}
@media screen and (max-width:599px), screen and (pointer:coarse) and (max-width:1000px) and (max-height:500px) {
  html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row {
    grid-template-columns:minmax(0,1fr);
  }
  html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row > span {
    display:none;
  }
}
`;
module.exports += `
/* Filter buttons fill their frames without visible group headings. */
html body main#main-content #tools .card-filter-row,
html body main#main-content #tools > .card-action-row,
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row {
  grid-template-columns:minmax(0,1fr);
}
html body main#main-content #tools .card-filter-row > span,
html body main#main-content #tools .card-tier-label,
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row > span {
  display:none;
}
html body main#main-content #tools .card-tier-choices {grid-column:1}
`;
module.exports += `
/* Equal-width filter buttons occupy the entire available frame. */
html body main#main-content #tools .card-filter-buttons,
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-buttons {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(min(100%,96px),1fr));
  width:100%;
  min-width:0;
}
html body main#main-content #tools .card-tier-choices {
  width:100%;
  min-width:0;
  grid-template-columns:repeat(5,minmax(0,1fr));
}
html body main#main-content #tools :is(.card-filter-buttons,.card-tier-choices) button,
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-buttons button {
  box-sizing:border-box;
  width:100%;
  min-width:0;
  max-width:none;
  margin:0;
}
`;
module.exports += `
/* Card filter groups share a blue outer frame. */
html body main#main-content #tools .card-filter-row,
html body main#main-content #tools > .card-action-row {
  border-color:#6faeee;
}
`;
module.exports += `
/* Relic and potion filter groups use the same blue outer frame. */
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row {
  border-color:#6faeee;
}
`;
module.exports += `
/* Random-search buttons share the blue filter-frame border. */
html body main#main-content #tools #aoe-toggle,
html body main#main-content .filters .catalog-search-tools>button.catalog-random {
  border-color:#6faeee!important;
}
`;
