const main='html body main#main-content#main-content#main-content';
module.exports=`
/* Catalog names use h1 sizing; metadata uses h4 sizing. */
${main} #card-scroll .card-detail[data-catalog-layout] .detail-title,
${main} .catalog-relic-card .relic-card-text>h1,
${main} .entry.potion .potion-title-row>h1 {
 display:flex;flex-direction:column;align-items:center;gap:4px;margin:0;
 font:700 32px/1.3 Arial,"Microsoft JhengHei",sans-serif!important;
 text-align:center;min-width:0;width:100%;
}
${main} .catalog-relic-card .relic-card-text>h1 :is(.relic-name-zh,.relic-name-en),
${main} .entry.potion .potion-title-row>h1 :is(.potion-name-zh,.catalog-name-en) {
 display:block;font:inherit;color:var(--plain-rarity-color);white-space:normal;overflow-wrap:anywhere;
}
${main} #card-scroll .card-detail[data-catalog-layout] .detail-type-metadata,
${main} #card-scroll .card-detail[data-catalog-layout] .creator-tier-badge,
${main} .catalog-relic-card :is(.relic-rarity-row,[data-relic-rarity],.relic-pool-corner),
${main} .entry.potion .potion-rarity-row {
 font-size:18px!important;line-height:1.4;
}
${main} #card-scroll .card-detail[data-catalog-layout] dd[data-stat-character]>img,
${main} .catalog-relic-card .relic-pool-corner>img {
 width:18px;height:18px;
}
${main} .catalog-relic-card .relic-icon-row>img,
${main} .entry.potion .potion-icon-row>img {width:72px;height:72px}
${main} :is(.catalog-relic-card .relic-icon-row,.entry.potion .potion-icon-row) {
 grid-template-columns:minmax(0,1fr) 72px minmax(0,1fr);
}
/* Descriptions retain paragraph semantics with h3 sizing. */
${main} #card-scroll .card-detail[data-catalog-layout] .detail-panel-description,
${main} .catalog-relic-card .relic-card-text>p,
${main} .entry.potion>p {font-size:22px;line-height:1.6}
`;
