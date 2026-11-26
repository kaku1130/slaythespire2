process.chdir(require('node:path').resolve(__dirname,'../..'));
// Shared relic and potion catalog layout.
module.exports={controls:'',script:'',styles:`
main#main-content:has(>.relic-filters,>.potion-filters)>.catalog-scroll{width:100%;align-self:center;padding-inline:0;scrollbar-gutter:auto}
html body main#main-content>:is(.relic-filters,.potion-filters){width:100%;align-self:center;justify-content:center;margin-inline:auto;overflow-x:hidden}
html body main#main-content .filters .catalog-search-tools{display:flex;align-items:center;justify-content:center;order:2;flex:0 0 100%;width:100%;max-width:none;min-width:0;margin:0}
html body main#main-content .filters .catalog-search-tools input#search{flex:1 1 auto;min-width:0;max-width:none;width:100%;margin:0}
`};

module.exports.styles+=`
html body main#main-content>.relic-filters{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:center}
html body main#main-content .relic-filters .catalog-search-tools{grid-column:1;grid-row:1;width:100%;min-width:0}
`;

module.exports.styles+=`
html body main#main-content>.potion-filters{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:center}
html body main#main-content .potion-filters .catalog-search-tools{grid-column:1;grid-row:1;width:100%;min-width:0}
`;

module.exports.styles+=`
html body main#main-content>.filters.relic-filters{overflow:visible}
`;

module.exports.styles+="\n/* English names stay beside Chinese names and wrap within each title. */\nmain#main-content :is(.relic-title-row,.potion-title-row) .catalog-name-en{font-size:.8em;font-weight:400;color:var(--muted);overflow-wrap:anywhere}\n";

module.exports.styles+=require('../cards/catalog-grid.cjs');
