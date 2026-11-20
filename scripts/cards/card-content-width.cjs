module.exports = `
/* Set the card page width once; every nested content wrapper fills it. */
html body main#main-content#main-content:has(>#card-scroll) {
  box-sizing:border-box;width:100%!important;max-width:none!important;
  margin-inline:auto!important;padding-inline:0!important;
}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine) {
  html body main#main-content#main-content:has(>#card-scroll) {width:max(25vw,460px)!important}
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
  html body[data-view=grid] main#main-content#main-content #card-scroll tbody {gap:16px}
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail {margin:0}
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
