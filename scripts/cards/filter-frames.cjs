module.exports = `
/* Filter groups use spacing instead of outer frames. */
html body main#main-content #tools .card-filter-row,
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row {
  box-sizing:border-box;
  min-width:0;
  padding:0;
  border:0;
  border-radius:0;
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
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row {
  grid-template-columns:minmax(0,1fr);
}
html body main#main-content #tools .card-filter-row > span,
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-row > span {
  display:none;
}
`;
module.exports += `
/* Fill each filter frame while keeping content-based button proportions. */
html body main#main-content #tools .card-filter-buttons,
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-buttons {
  display:flex;
  flex-wrap:wrap;
  width:100%;
  min-width:0;
}
html body main#main-content #tools .card-filter-buttons button,
html body main#main-content :is(.relic-filters,.potion-filters) .catalog-filter-buttons button {
  box-sizing:border-box;
  width:auto;
  flex:1 1 auto;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:0;
  max-width:none;
  margin:0;
}
html body main#main-content :is(#tools,.relic-filters,.potion-filters) .filter-character-icon {
  display:block;width:32px;height:32px;object-fit:contain;
}
`;
module.exports += `
/* Keep separate menu groups farther apart than buttons within a group. */
html body main#main-content#main-content#main-content :is(.card-filter-rows,.catalog-filter-rows) {
  row-gap:24px!important;
}
`;
