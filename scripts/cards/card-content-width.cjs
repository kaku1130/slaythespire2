module.exports = `
/* Nested content fills the shared page frame. */
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
  html body[data-view=grid] main#main-content#main-content #card-scroll tbody {gap:16px}
  /* Share section heights among cards in each visible row. */
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail-row:not([hidden]) {grid-column:auto;grid-row:span 6;display:grid!important;grid-template-rows:subgrid;align-self:stretch}
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail-cell {display:grid!important;grid-row:1 / -1;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail {grid-row:1 / -1;grid-template-rows:subgrid;margin:0}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-overview {grid-row:1 / 6;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-overview>header {display:grid;grid-row:span 2;grid-template-rows:subgrid}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-title {display:grid;grid-row:1 / -1;grid-template-rows:subgrid;justify-items:center;align-items:start;min-width:0}
  html body[data-view=grid] main#main-content#main-content #card-scroll .detail-name-line {align-items:start}
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

/* Catalog cards: art, names, active effect, metadata, sources. */
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail-row:has([data-catalog-layout]) {grid-row:span 5}
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-overview {grid-row:1 / 6;justify-items:center;text-align:center}
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-art {grid-row:1;justify-self:center}
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-overview>header {grid-row:2;display:block}
html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-title {display:flex;flex-direction:column;flex-wrap:nowrap;justify-content:center;align-items:center;gap:4px;width:100%;text-align:center;font-size:22px;line-height:1.3}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata {grid-row:4;display:grid;grid-template-columns:minmax(0,1fr) max-content minmax(0,1fr);align-items:center;gap:12px;margin:0;width:100%;text-align:center;font:700 14px/1.4 Arial,"Microsoft JhengHei",sans-serif}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata .detail-meta-item:first-child {justify-self:start;text-align:left}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata .detail-meta-item:nth-child(2) {justify-self:center;text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata .detail-meta-item:last-child {justify-self:end;text-align:right}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] dd[data-stat-character]>img {width:28px;height:28px}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effects {grid-row:3;display:flex;flex-direction:column;gap:8px;align-self:start;width:100%;text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-columns {display:block;position:relative}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-panel {display:block;border:0}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-panel[hidden] {display:none!important}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-panel p {text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-panel-description {width:80%;justify-self:center;margin-inline:auto;text-align:center}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-version-controls {position:static;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:8px;box-sizing:border-box;width:100%;margin:0;padding:0}
html body main#main-content #card-scroll .detail-version-controls>[data-card-version] {grid-column:2;justify-self:center}
html body main#main-content #card-scroll .detail-version-controls button {padding:4px 6px;border:1px solid #354454;border-radius:6px;background:#0d141c;color:#7fff00;font:400 16px/1.4 Arial,"Microsoft JhengHei",sans-serif;cursor:pointer}
html body main#main-content #card-scroll .detail-version-controls button[aria-pressed=true] {color:#7fff00;border-color:#7fff00;background:#17351a}
html body main#main-content #card-scroll .detail-version-controls button:focus-visible {outline:2px solid #37a8ec;outline-offset:3px}
html body main#main-content #card-scroll .detail-version-controls button:disabled {opacity:.45;cursor:default}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-bottom-tier {grid-row:auto;justify-content:center;align-items:center;width:100%}
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-title>:is(a,.detail-name-en) {flex:0 1 auto;min-width:0;max-width:100%;overflow-wrap:anywhere}
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
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .creator-tier-badge {font-size:14px;line-height:1.4;min-width:22px;min-height:22px;padding:0 4px}
`;

module.exports+=require('./catalog-grid.cjs');

module.exports+=require('./catalog-typography.cjs');

module.exports+=`
/* Chinese names use the full title width above the effects. */
html body main#main-content#main-content#main-content #card-scroll .detail-title-row {display:grid;grid-template-columns:minmax(0,1fr);align-items:center;gap:4px;width:100%;min-width:0;font:inherit}
html body main#main-content#main-content#main-content #card-scroll .detail-title-row>.detail-name-zh {grid-column:1;min-width:0;width:100%;text-align:center;overflow-wrap:anywhere}
html body main#main-content#main-content#main-content #card-scroll .detail-tier-trigger {grid-column:3;justify-self:end;display:inline-flex;align-items:center;justify-content:center;margin:0;padding:0;border:0;border-radius:4px;background:transparent;color:inherit;cursor:pointer;line-height:1}
html body main#main-content#main-content#main-content #card-scroll .detail-tier-trigger:focus-visible {outline:2px solid #37a8ec;outline-offset:3px}
html body main#main-content#main-content#main-content #card-scroll .detail-tier-section[hidden] {display:none!important}
`;

module.exports+=`
/* Tier shares the upgrade row's font size and button height. */
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-version-controls .creator-tier-badge {box-sizing:border-box;min-width:32px;min-height:calc(1.4em + 10px);padding:4px 6px;border:1px solid transparent;border-radius:6px;font:400 16px/1.4 Arial,"Microsoft JhengHei",sans-serif;font-size:16px!important}
`;

module.exports+=`
/* Tier commentary expands in normal flow at the bottom of its card. */
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout]>.detail-tier-section {position:static;grid-column:1;grid-row:auto;box-sizing:border-box;width:100%!important;max-width:none;max-height:none;overflow:visible;margin:0;padding:12px 0 0;border:0;border-top:1px solid #405063;border-radius:0;background:transparent;box-shadow:none;text-align:left}
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout]>.detail-tier-section .detail-tier-comment {margin:0;color:#e3e8ee;font:400 22px/1.6 Arial,"Microsoft JhengHei",sans-serif;overflow-wrap:anywhere}
`;

module.exports+=`
html body main#main-content#main-content#main-content #card-scroll .detail-tier-source:focus-visible {outline:2px solid #74b3e6;outline-offset:3px}
`;

module.exports+=`
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout]>.detail-tier-section .detail-tier-source {display:inline-block;margin-top:12px;color:#8bcaf0;font:400 22px/1.6 Arial,sans-serif;overflow-wrap:anywhere}
`;

module.exports+=`
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout]>.detail-tier-section .detail-tier-translation {margin:16px 0 0;padding-top:16px;border-top:1px solid #405063;color:#e3e8ee;font:400 22px/1.6 Arial,"Microsoft JhengHei",sans-serif;overflow-wrap:anywhere}
`;

module.exports+=`
html body main#main-content #card-scroll .card-detail[data-catalog-layout] .detail-spirebird-link {display:inline-flex;align-items:center;justify-content:center;justify-self:end;gap:6px;max-width:100%;margin:0;color:#cbd5df;font:700 15px/1.4 Georgia,serif;white-space:nowrap;flex:0 0 auto;width:auto;text-decoration:none}
html body main#main-content #card-scroll .detail-spirebird-link img {display:block;width:100%;height:auto;object-fit:contain}
html body main#main-content #card-scroll .detail-spirebird-link:hover {color:#8bcaf0}
html body main#main-content #card-scroll .detail-spirebird-link:focus-visible {outline:2px solid #74b3e6;outline-offset:4px;border-radius:4px}
`;

module.exports+=`
html body main#main-content #card-scroll .detail-card-sources {grid-row:5;display:flex;align-self:end;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;width:100%;min-width:0;margin-top:8px}
html body main#main-content #card-scroll .detail-untapped-link {display:inline-flex;align-items:center;justify-content:flex-start;min-width:0;flex:0 0 auto;width:auto;text-decoration:none}
html body main#main-content #card-scroll .detail-untapped-link img {display:block;width:100%;max-width:100%;height:auto;object-fit:contain}
html body main#main-content #card-scroll .detail-untapped-link:focus-visible {outline:2px solid #74b3e6;outline-offset:4px;border-radius:4px}
`;

module.exports+=`
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] {padding-bottom:12px}
`;
module.exports+=`
/* Selection fill follows aria-pressed, including touch browsers that retain hover. */
html body main#main-content#main-content #tools .card-filter-buttons button[aria-pressed=false] {
  background:var(--control-bg,#0d131a)!important;
  box-shadow:none!important;
}
`;

module.exports+=`
html body main#main-content#main-content #card-scroll .detail-card-sources>a {color:#cbd5df;font:700 18px/1.4 Arial,sans-serif;white-space:nowrap;text-decoration:none}
`;
module.exports+=`
/* Grid siblings share frame heights while their content stays at the top. */
html body[data-view=grid] main#main-content#main-content#main-content #card-scroll .card-detail-row:not([hidden]):has([data-catalog-layout]) {grid-row:auto;align-self:stretch;display:flex!important;flex-direction:column}
html body[data-view=grid] main#main-content#main-content#main-content #card-scroll .card-detail-cell:has([data-catalog-layout]) {display:flex!important;flex:1;min-height:0}
html body[data-view=grid] main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] {grid-template-rows:auto;align-content:start;flex:1}
html body[data-view=grid] main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-overview {grid-row:auto;grid-template-rows:repeat(5,auto);align-content:start;align-self:start;row-gap:12px}
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-panel {padding-bottom:0}
html body main#main-content#main-content#main-content #card-scroll .detail-card-sources {align-self:start;margin:0;padding:0}
`;

module.exports+=`
/* Filtered cards must stay hidden regardless of grid and detail layout rules. */
html body[data-view=grid] main#main-content#main-content#main-content #card-scroll .card-detail-row[hidden] {display:none!important}
/* Cards use two columns by default, one on phones, and three on desktops. */
html body[data-view=grid] main#main-content#main-content#main-content #card-scroll tbody {grid-template-columns:repeat(2,minmax(0,1fr))}
@media screen and (max-width:600px), screen and (orientation:landscape) and (max-height:500px) and (max-width:1000px) and (pointer:coarse) {
  html body[data-view=grid] main#main-content#main-content#main-content #card-scroll tbody {grid-template-columns:minmax(0,1fr)}
}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine) {
  html body[data-view=grid] main#main-content#main-content#main-content #card-scroll tbody {grid-template-columns:repeat(3,minmax(0,1fr))}
  html body[data-view=grid] main#main-content#main-content #card-scroll .card-detail-row:not([hidden]) {grid-column:auto}
  html body main#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata {display:grid;grid-template-columns:minmax(0,1fr) max-content minmax(0,1fr);gap:4px;width:calc(100% + 48px);justify-self:center}
  html body main#main-content#main-content #card-scroll .detail-type-metadata :is(dd,.detail-type-label,.detail-plain-rarity) {font-size:14px}
  html body main#main-content#main-content #card-scroll .detail-type-metadata .detail-meta-item:last-child {max-width:100%}
  html body main#main-content#main-content #card-scroll .detail-type-metadata :is(dd[data-stat-rarity],.detail-plain-rarity) {white-space:normal;overflow-wrap:anywhere;justify-content:flex-end}
}
/* Subtle outlines distinguish available options and selected filters. */
html body main#main-content#main-content#main-content #tools .card-filter-buttons button,
html body main#main-content#main-content#main-content #tools .filter-menu-toggle {
  border:2px solid #465365!important;
}
html body main#main-content#main-content#main-content #tools .card-filter-buttons button:is(:hover,[aria-pressed=true]),
html body main#main-content#main-content#main-content #tools .filter-menu-toggle:is(:hover,[aria-expanded=true]) {
  border-color:var(--selection-color,#d9e5f2)!important;
}
html body main#main-content#main-content#main-content #tools .card-filter-buttons button:focus-visible,
html body main#main-content#main-content#main-content #tools .filter-menu-toggle:focus-visible {
  outline:2px solid #fff;outline-offset:3px;
}
`;

module.exports+=`
/* Fill each card while keeping a consistent inset and section spacing. */
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] {padding:12px;gap:12px}
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] :is(.detail-overview,.detail-art,header,.detail-type-metadata,.detail-effects,.detail-card-sources) {box-sizing:border-box;width:100%;max-width:none;min-width:0}
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-overview {row-gap:12px}
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-effect-panel {box-sizing:border-box;padding:12px}
html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout] .detail-panel-description {width:100%;max-width:none;margin-inline:0}
`;

const textCard='html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout]';
module.exports+=`
/* Left-aligned card copy and inline metadata match the character guide cards. */
${textCard} {text-align:left;container-type:inline-size;--card-metadata-font-size:clamp(8px,5.5cqi,16px)}
${textCard} .detail-overview {grid-template-rows:repeat(5,auto)}
${textCard} :is(.detail-overview,.detail-art,.detail-title,.detail-title-row,.detail-name-zh,.detail-name-en,.detail-effects,.detail-effect-panel,.detail-panel-cost,.detail-panel-description,.detail-card-sources) {text-align:left;justify-self:start;justify-items:start}
${textCard} .detail-title {flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:4px 8px}
${textCard} .detail-title-row {display:block;flex:0 0 auto;width:max-content;max-width:100%}
${textCard} .detail-name-tier {display:inline-flex;align-items:center;gap:12px;flex:0 0 auto;width:max-content;max-width:100%;min-width:0}
${textCard} .detail-name-tier>.detail-name-en {display:block;flex:0 1 auto;min-width:0;white-space:nowrap;overflow-wrap:normal;word-break:normal}
${textCard} .detail-name-tier .detail-tier-trigger {flex:0 0 auto;line-height:1}
${textCard} .detail-name-tier .creator-tier-badge {display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:1.6em;height:1.6em;min-height:0;margin:0;padding:0;border:0;border-radius:4px;white-space:pre;background:var(--creator-tier-color,#788491);color:#000;font:700 16px/1.4 Arial,sans-serif;font-size:calc(var(--card-title-font-size,1em) * .6)!important}
${textCard} [data-cost-version][hidden] {display:none!important}
${textCard} .detail-effects {grid-row:4;gap:0}
${textCard} :is(.detail-effect-columns,.detail-effect-panel) {border:0;border-radius:0;background:transparent;box-shadow:none;padding:0;overflow:visible}
${textCard} .detail-effect-panel {display:block}
${textCard} .detail-inline-cost {display:inline;margin:0;white-space:nowrap}
${textCard} .detail-panel-stars {display:inline-flex;margin:0 0 0 6px}
${textCard} .detail-panel-description {margin:0}
${textCard} .detail-heading-metadata {grid-row:3}
${textCard} .detail-action-metadata {grid-row:5}
${textCard} .detail-type-metadata.detail-version-controls {display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:4px 0;width:100%;margin:0;padding:0;text-align:left;font-weight:400}
${textCard} .detail-type-metadata .detail-meta-item {display:inline-flex;align-items:center;justify-content:flex-start;gap:0;min-width:0;justify-self:start;text-align:left}
${textCard} .detail-type-metadata .detail-meta-item+.detail-meta-item::before {content:" ";white-space:pre;color:var(--muted,#aab6c4)}
${textCard} .detail-type-metadata dd {display:inline-flex;align-items:center;margin:0;text-align:left}
${textCard} .detail-type-metadata :is(.detail-type-label,.detail-plain-rarity,button) {display:inline;box-sizing:border-box;width:auto;min-width:0;min-height:0;margin:0;padding:0;border:0!important;border-radius:0;background:transparent!important;box-shadow:none!important;font:inherit;font-size:16px!important;line-height:1.4;text-align:left}
${textCard} .detail-type-metadata :is(.detail-plain-rarity,.detail-type-label,[data-card-version]) {font-weight:700}
${textCard} .detail-type-label[data-type=Attack] {color:#ed9094}
${textCard} .detail-type-label[data-type=Skill] {color:#8bd6a6}
${textCard} .detail-type-label[data-type=Power] {color:#e3bf72}
${textCard} .detail-type-metadata .creator-tier-badge {display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:26px;min-height:26px;margin:0;padding:2px 6px;border:0;border-radius:4px;background:var(--creator-tier-color,#788491);color:#000;font:700 16px/1.4 Arial,sans-serif;font-size:16px!important}
${textCard} .detail-type-metadata.detail-heading-metadata {flex-wrap:nowrap;white-space:nowrap;font-size:var(--card-metadata-font-size)!important}
${textCard} .detail-heading-metadata :is(.detail-meta-item,dd,.detail-type-label,.detail-plain-rarity,button) {font-size:inherit!important}
${textCard} .detail-heading-metadata .detail-meta-item {flex:0 0 auto}
${textCard} .detail-heading-metadata dd[data-stat-character]>img {width:clamp(12px,10cqi,28px);height:clamp(12px,10cqi,28px)}
${textCard} .detail-heading-metadata .detail-meta-item+.detail-meta-item::before {content:" ";margin:0 1.5px}
${textCard} .detail-heading-metadata [data-card-version][aria-pressed] {min-height:calc(1.4em + 6px);padding:2px 4px}
${textCard} .detail-heading-metadata [data-card-version] {font-size:var(--card-metadata-font-size)!important}
${textCard} .detail-type-metadata.detail-action-metadata {flex-wrap:nowrap;font-size:var(--card-metadata-font-size)!important}
${textCard} .detail-action-metadata :is(.detail-meta-item,dd,button,.detail-creator-rating,.creator-tier-badge) {font-size:inherit!important}
${textCard} .detail-action-metadata .creator-tier-badge {font-size:var(--card-metadata-font-size)!important}
${textCard} .detail-action-metadata :is([data-card-version],.creator-tier-badge) {min-height:0;padding:2px}
${textCard} .detail-action-metadata .detail-meta-item+.detail-meta-item::before {content:" ";margin:0 1.5px}
${textCard} .detail-action-metadata [data-card-version][aria-pressed] {min-height:0;padding:2px}
${textCard} .detail-type-metadata [data-card-version] {display:inline-flex;align-items:center;justify-content:center;min-height:26px;padding:2px 6px;border:1px solid currentColor!important;border-radius:5px;background:#101923!important;color:#b3ff66}
${textCard} .detail-type-metadata [data-card-version][aria-pressed=false] {background:#101923!important;color:#7fff00}
${textCard} .detail-type-metadata [data-card-version] {text-decoration:none!important}
${textCard} .detail-type-metadata button {cursor:pointer}
${textCard} .detail-type-metadata button:disabled {cursor:default}
${textCard} .detail-type-metadata [data-card-version]:disabled {color:#788491;background:#151b22!important;opacity:1;cursor:not-allowed;box-shadow:none!important;text-decoration:none!important}
${textCard} .detail-type-metadata button:is(:hover,[aria-pressed=true],[aria-expanded=true]) {text-decoration:underline;text-underline-offset:3px}
${textCard} .detail-type-metadata [data-card-version][aria-pressed=true] {color:#10210b;font-weight:700;text-decoration-thickness:2px;border-color:#7fff00!important;background:#7fff00!important;box-shadow:0 0 0 2px #7fff0055!important}
${textCard} .detail-type-metadata button:focus-visible {outline:2px solid #37a8ec;outline-offset:3px}
${textCard} .detail-action-metadata .detail-card-sources {display:inline-flex;grid-row:auto;align-self:auto;justify-content:flex-start;flex-wrap:wrap;gap:8px 12px;width:auto;margin:0;padding:0;border:0;white-space:nowrap;font:700 1em/1.4 Arial,sans-serif}
${textCard} .detail-card-sources>a {font:inherit;font-size:var(--card-metadata-font-size)!important}
${textCard} .detail-source-separator {display:none}
${textCard} .detail-type-metadata.detail-upgrade-controls {flex-wrap:wrap;gap:8px 12px;font-size:var(--card-metadata-font-size)}
${textCard} .detail-upgrade-controls .detail-meta-item+.detail-meta-item::before {content:none}
${textCard} .detail-upgrade-controls [data-card-version] {font-size:inherit}
${textCard} .detail-type-metadata.detail-heading-metadata {display:flex;align-items:center;justify-content:flex-start;justify-self:start;gap:4px 0;margin:0;padding:0;text-align:left}
${textCard} .detail-heading-metadata :is(.detail-meta-item,dd) {justify-content:flex-start;text-align:left;margin-inline:0}
/* All content sharing a row is vertically centered. */
${textCard} :is(.detail-name-tier,.detail-type-metadata,.detail-meta-item,.detail-type-metadata dd,.detail-card-sources) {align-items:center}
${textCard} .detail-card-sources {align-self:center}
/* Sources and live card count share a row when space permits. */
html body main#main-content#main-content#main-content .card-results-footer {display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px}
html body main#main-content#main-content#main-content .card-results-footer>.card-source {order:0;flex:0 1 auto;max-width:100%;min-width:0;margin:0;text-align:left;overflow-wrap:anywhere}
html body main#main-content#main-content#main-content .card-results-footer>#card-filter-result {order:1;display:block;flex:0 0 auto;width:auto;max-width:100%;margin:0 0 0 auto;padding:0;color:#9aabbf;text-align:right;font:14px/1.4 Arial,"Microsoft JhengHei",sans-serif}
html body main#main-content#main-content#main-content>#tools {margin-bottom:0!important}
html body main#main-content#main-content#main-content>#tools+#card-scroll {margin-top:0;padding-top:0}
html body[data-view=grid] main#main-content#main-content#main-content #card-scroll>section[data-pool]:nth-child(1 of section[data-pool]:not([hidden]))>.grid-pool-heading {padding-block:var(--group-gap,24px)}
/* Phone card names stack Chinese above the English name and its Tier badge. */
@media screen and (max-width:600px), screen and (orientation:landscape) and (max-height:500px) and (max-width:1000px) and (hover:none) and (pointer:coarse) {
 ${textCard} .detail-title {flex-direction:column;align-items:flex-start}
 ${textCard} .detail-title-row {display:block;width:100%}
 ${textCard} .detail-name-tier {display:inline-flex;flex-wrap:nowrap;align-items:center;max-width:100%}
}
/* Compact layouts keep character and type menus, with rarity/cost on desktop only. */
@media screen and (max-width:1024px), screen and (max-width:1440px) and (hover:none), screen and (max-width:1440px) and (pointer:coarse) {
 html body main#main-content #tools .card-filter-row:has(#card-filter-rarity,#card-filter-energy) {display:none!important}
 html body main#main-content #tools .card-filter-rows:has(#card-filter-energy) {display:none!important}
}
`;
