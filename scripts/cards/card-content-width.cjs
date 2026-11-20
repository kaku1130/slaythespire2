module.exports = `
/* Set the card page width once; every nested content wrapper fills it. */
html body main#main-content#main-content:has(>#card-scroll) {
  box-sizing:border-box;width:100%!important;max-width:none!important;
  margin-inline:auto!important;padding-inline:0!important;
}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine) {
  html body main#main-content#main-content:has(>#card-scroll) {width:50vw!important}
}
html body main#main-content#main-content>#tools,
html body main#main-content#main-content>#card-scroll {
  box-sizing:border-box;width:100%!important;max-width:none!important;padding-inline:0;
}
html body[data-view=grid] main#main-content#main-content #card-scroll :is(section[data-pool],.table-wrap,table,tbody,.card-detail-row,.card-detail-cell,.card-detail) {
  box-sizing:border-box;width:100%;max-width:none;min-width:0;
}
html body[data-view=grid] main#main-content#main-content #card-scroll tbody {grid-template-columns:minmax(0,1fr)}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine) {
  html body[data-view=grid] main#main-content#main-content #card-scroll tbody {grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  /* Share artwork, both names, effects, stats and rating tracks across each pair. */
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail-row:not([hidden]) {grid-column:auto;grid-row:span 6;display:grid!important;grid-template-rows:subgrid;align-self:stretch}
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail-row > .card-detail-cell {display:grid!important;grid-row:1 / -1;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail {grid-row:1 / -1;grid-template-rows:subgrid;margin:0;align-content:start}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-overview {grid-row:span 4;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-overview>header {display:grid;grid-row:span 2;grid-template-rows:subgrid;min-width:0}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-title {display:grid;grid-row:1 / -1;grid-template-rows:subgrid;justify-items:center;align-items:start;min-width:0}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-stat:first-child {align-items:start}
}
/* Keyword notes share the centered artwork width on every device. */
html body main#main-content#main-content .card-detail>.detail-keyword {
  box-sizing:border-box;width:100%;justify-self:stretch;margin-inline:0;
}


/* Align card information with the centered artwork width. */
html body main#main-content#main-content .card-detail>:is(.detail-overview,header,.detail-meta,.detail-section) {
  box-sizing:border-box;width:100%;max-width:700px;min-width:0;
  justify-self:center;overflow-wrap:anywhere;
}
html body main#main-content#main-content .card-detail>.detail-keyword {
  box-sizing:border-box;width:100%;max-width:700px;min-width:0;justify-self:center;overflow-wrap:anywhere;
}

/* Keep profession headings equally spaced between the surrounding content. */
html body[data-view=grid] main#main-content#main-content #card-scroll>section[data-pool] {
  display:flow-root;margin-block:0;
}
html body[data-view=grid] main#main-content#main-content #card-scroll .grid-pool-heading {
  margin-block:0;padding-block:24px;padding-inline:16px;
}
html body[data-view=grid] #card-scroll tbody>.card-detail-row:nth-child(1 of :not([hidden])) .card-detail {margin-top:0}
html body[data-view=grid] #card-scroll tbody>.card-detail-row:nth-last-child(1 of :not([hidden])) .card-detail {margin-bottom:0}
`;
