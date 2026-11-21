module.exports = `
/* Set the card page width once; every nested content wrapper fills it. */
html body main#main-content#main-content:has(>#card-scroll) {
  box-sizing:border-box;width:100%!important;max-width:none!important;
  margin-inline:auto!important;padding-inline:0!important;
}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine) {
  html body main#main-content#main-content:has(>#card-scroll) {width:100%!important}
}
html body main#main-content#main-content>#tools,
html body main#main-content#main-content>#card-scroll {
  box-sizing:border-box;width:100%!important;max-width:none!important;padding-inline:0;
}
html body[data-view=grid] main#main-content#main-content #card-scroll :is(section[data-pool],.table-wrap,table,tbody,.card-detail-row,.card-detail-cell,.card-detail) {
  box-sizing:border-box;width:100%;max-width:none;min-width:0;
}
html body[data-view=grid] main#main-content#main-content #card-scroll tbody {grid-template-columns:minmax(0,1fr)}
html body #card-scroll .detail-overview {grid-template-columns:minmax(0,1fr)}
html body #card-scroll .detail-overview>header {min-width:0;width:100%}
html body #card-scroll .detail-title {font-size:2rem;font-weight:700;line-height:1.25}
html body #card-scroll .detail-title :is(.detail-name-zh,.detail-name-en,.detail-name-tier) {font:inherit}
html body #card-scroll .detail-name-line {display:grid;grid-template-columns:1.2em minmax(0,1fr) 1.2em;align-items:center;gap:8px;width:100%;min-width:0}
html body #card-scroll .detail-name-line>.detail-name-zh {grid-column:2;min-width:0;overflow-wrap:anywhere}
html body #card-scroll .detail-name-line>.detail-name-tier {grid-column:3;display:inline-flex;justify-content:center;align-items:center;box-sizing:border-box;width:1.2em;min-height:1.25em;border-radius:4px;color:#fff;font:inherit;text-decoration:none;background:var(--name-tier-color,#788491)}
html body #card-scroll .detail-name-tier[data-tier=S] {--name-tier-color:rgb(225,112,132)}
html body #card-scroll .detail-name-tier[data-tier=A] {--name-tier-color:rgb(227,191,114)}
html body #card-scroll .detail-name-tier[data-tier=B] {--name-tier-color:rgb(105,176,222)}
html body #card-scroll .detail-name-tier[data-tier=C] {--name-tier-color:rgb(105,183,139)}
html body #card-scroll .detail-name-tier[data-tier=D] {--name-tier-color:rgb(120,132,145)}
@media screen and (min-width:601px) and (min-height:501px), screen and (min-width:1001px), screen and (min-width:601px) and (hover:hover) and (pointer:fine) {
  html body[data-view=grid] main#main-content#main-content #card-scroll tbody {grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  /* Share section heights among cards in each visible row. */
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail-row:not([hidden]) {grid-column:auto;grid-row:span 6;display:grid!important;grid-template-rows:subgrid;align-self:stretch}
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail-cell {display:grid!important;grid-row:1 / -1;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail {grid-row:1 / -1;grid-template-rows:subgrid;margin:0}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-overview {grid-row:1 / -1;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-overview>header {display:grid;grid-row:span 2;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-title {display:grid;grid-row:1 / -1;grid-template-rows:subgrid;justify-items:center;align-items:start;min-width:0}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-name-line {align-items:start}
}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine) {
  html body[data-view=grid] main#main-content#main-content #card-scroll tbody {grid-template-columns:repeat(4,minmax(0,1fr))}
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
