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
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-overview {grid-row:1 / 6;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-overview>header {display:grid;grid-row:span 2;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-title {display:grid;grid-row:1 / -1;grid-template-rows:subgrid;justify-items:center;align-items:start;min-width:0}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-name-line {align-items:start}
}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine) {
  html body[data-view=grid] main#main-content#main-content #card-scroll tbody {grid-template-columns:repeat(4,minmax(0,1fr))}
}
html body #card-scroll .detail-heading-row {display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr) minmax(0,1fr);align-items:start;gap:8px;width:100%;min-width:0}
html body #card-scroll .detail-heading-character {display:block;width:28px;height:28px;object-fit:contain;justify-self:start}
html body #card-scroll .detail-heading-row>.detail-name-zh {min-width:0;width:100%;overflow-wrap:anywhere}
html body #card-scroll .detail-heading-rarity {justify-self:end;max-width:100%;overflow-wrap:anywhere;text-align:right;font:600 16px/1.4 Arial,sans-serif;color:var(--detail-rarity-color)}
html body #card-scroll .detail-bottom-tier {display:flex;justify-content:center;align-items:end;min-height:30px}
html body #card-scroll .detail-bottom-tier>.detail-name-tier {display:inline-flex;align-items:center;justify-content:center;min-width:36px;min-height:30px;padding:0 6px;border-radius:4px;color:#fff;font:700 24px/1.25 Arial,sans-serif;text-decoration:none;background:var(--name-tier-color,#788491)}
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

/* Catalog cards: art, names, metadata, active effect, version controls, tier. */
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail-row:has([data-catalog-layout]) {grid-row:span 4}
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-overview {grid-row:1 / 5;justify-items:center;text-align:center}
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-art {grid-row:1;justify-self:center}
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-overview>header {grid-row:2;display:block}
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-title {display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px 12px;width:100%;text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata {grid-row:3;display:grid;grid-template-columns:minmax(0,1fr) max-content minmax(0,1fr);align-items:center;gap:12px;margin:0;width:100%;text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata .detail-meta-item:first-child {justify-self:start;text-align:left}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata .detail-meta-item:nth-child(2) {justify-self:center;text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata .detail-meta-item:last-child {justify-self:end;text-align:right}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] dd[data-stat-character]>img {width:28px;height:28px}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effects {grid-row:4;display:flex;flex-direction:column;gap:8px;align-self:start;width:100%;text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-columns {display:block;position:relative}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-panel {display:block;border:0}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-panel[hidden] {display:none!important}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-panel p {text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-panel-description {width:80%;justify-self:center;margin-inline:auto;text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-version-controls {position:absolute;top:16px;right:8px;z-index:1;display:flex;justify-content:flex-end;gap:8px}
html body main#main-content #card-scroll .detail-version-controls button {padding:4px 6px;border:1px solid #354454;border-radius:6px;background:#0d141c;color:#aab6c4;font:400 16px/1.4 Arial,"Microsoft JhengHei",sans-serif;cursor:pointer}
html body main#main-content #card-scroll .detail-version-controls button[aria-pressed=true] {color:#7fff00;border-color:#7fff00;background:#17351a}
html body main#main-content #card-scroll .detail-version-controls button:focus-visible {outline:2px solid #37a8ec;outline-offset:3px}
html body main#main-content #card-scroll .detail-version-controls button:disabled {opacity:.45;cursor:default}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-bottom-tier {grid-row:auto;justify-content:center;align-items:center;width:100%}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-title>a {flex:0 1 auto;min-width:0;max-width:100%;overflow-wrap:anywhere}
@media screen and (max-width:600px) {
 html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-title {flex-direction:column;flex-wrap:nowrap}
}
/* Offline creator rating and commentary stay directly below the upgrade toggle. */
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-tier-section {width:100%;min-width:0;margin-top:8px;padding:16px;border:1px solid #303d4e;border-radius:9px;background:#101923;text-align:left}
html body main#main-content #card-scroll .detail-tier-heading {display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;margin:0 auto}
html body main#main-content #card-scroll .detail-tier-comment {margin:0;color:#e3e8ee;font:400 20px/1.6 Arial,"Microsoft JhengHei",sans-serif;overflow-wrap:anywhere}
html body main#main-content #card-scroll details.detail-tier-toggle>.detail-tier-heading {width:max-content;max-width:100%;margin-inline:auto;list-style:none;cursor:pointer}
html body main#main-content #card-scroll details.detail-tier-toggle>.detail-tier-heading::-webkit-details-marker {display:none}
html body main#main-content #card-scroll details.detail-tier-toggle>.detail-tier-heading:focus-visible {outline:2px solid #37a8ec;outline-offset:4px;border-radius:4px}
html body main#main-content #card-scroll .detail-tier-source {display:inline-block;margin-top:12px;color:#8bcaf0;font:400 16px/1.5 Arial,sans-serif;text-decoration:none}
html body main#main-content #card-scroll .detail-tier-source:hover {text-decoration:underline;text-underline-offset:4px}
html body main#main-content #card-scroll .detail-tier-toggle {width:100%;min-width:0}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .creator-tier-badge {font-size:16px}
`;
