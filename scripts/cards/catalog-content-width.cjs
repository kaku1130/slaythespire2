const main = 'html body:not([data-detail-kind]) main#main-content#main-content:is(.ancient-browser,:has(>.relic-filters),:has(>.potion-filters),:has(>.character-sidebar),:has(>[data-ancient-top-menu]))';
module.exports = `
/* Nested catalog panels fill the shared page frame. */
${main}>:is(.filters,.catalog-scroll,.character-sidebar,.tier-sidebar,.build-layout,.split-body),
${main} :is(.relic-section,.potion-section,.catalog,.split-detail,.split-detail iframe,.build-content,.build-section,.build-panel) {
  box-sizing:border-box;width:100%!important;max-width:none!important;min-width:0;
}
${main}>.catalog-scroll {margin-inline:0}
`;
