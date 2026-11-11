process.chdir(require('node:path').resolve(__dirname,'../..'));
// Desktop layout for relic and potion catalogs; iPhone has its own page.
module.exports={controls:'',script:'',styles:`
main#main-content :is(.relic-section,.potion-section) .catalog{grid-template-columns:minmax(0,1fr)}
main#main-content:has(>.relic-filters,>.potion-filters)>.catalog-scroll{width:50%;align-self:center;padding-inline:0;scrollbar-gutter:auto;scrollbar-width:none}
main#main-content:has(>.relic-filters,>.potion-filters)>.catalog-scroll::-webkit-scrollbar{display:none}
html body main#main-content>:is(.relic-filters,.potion-filters){width:50%;align-self:center;justify-content:center;margin-inline:auto;overflow-x:hidden}
html body main#main-content .filters :is(.relic-filter-group,.potion-rarities){flex:0 0 100%;width:100%;justify-content:center}
html body main#main-content .relic-filters .relic-filter-group:has([data-filter-group=pool]){order:0}
html body main#main-content .relic-filters .relic-filter-group:has([data-filter-group=rarity]){order:1}
html body main#main-content .filters .catalog-search-tools{display:flex;align-items:center;justify-content:center;order:2;flex:0 0 100%;width:100%;max-width:none;min-width:0;margin:0}
html body main#main-content .filters .catalog-search-tools input#search{flex:1 1 auto;min-width:0;max-width:none;width:100%;margin:0}
`};

module.exports.styles+=`
html body main#main-content>.relic-filters{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:16px;align-items:center}
html body main#main-content .relic-filters .relic-filter-group:has([data-filter-group=pool]){grid-column:1/-1;grid-row:1}
html body main#main-content .relic-filters [data-filter-group=pool]{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:18px;padding-inline:8px;white-space:nowrap}
html body main#main-content .relic-filters [data-filter-group=pool] img{width:24px;height:24px;object-fit:contain;flex-shrink:0}
html body main#main-content .relic-filters .relic-filter-group:has([data-filter-group=rarity]){grid-column:1;grid-row:2;width:auto;flex-wrap:nowrap;justify-content:flex-start}
html body main#main-content .relic-filters [data-filter-group=rarity]{font-size:18px;padding-inline:10px;white-space:nowrap}
html body main#main-content .relic-filters .catalog-search-tools{grid-column:2;grid-row:2;width:100%;min-width:0}
`;

module.exports.styles+=`
html body main#main-content>.potion-filters{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:16px;align-items:center}
html body main#main-content .potion-filters .potion-rarities{grid-column:1;grid-row:1;width:auto;flex-wrap:nowrap;justify-content:flex-start}
html body main#main-content .potion-filters .catalog-search-tools{grid-column:2;grid-row:1;width:100%;min-width:0}
`;

module.exports.styles+=`
html body main#main-content>.filters.relic-filters{overflow:visible}
html body main#main-content>.filters.relic-filters>.relic-filter-group:has([data-filter-group=pool]){width:max-content;max-width:none;justify-self:center;flex-wrap:nowrap}
`;
