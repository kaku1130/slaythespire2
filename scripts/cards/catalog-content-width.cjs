const main = 'html body:not([data-detail-kind]) main#main-content#main-content:is(.ancient-browser,:has(>.relic-filters),:has(>.potion-filters),:has(>.character-sidebar),:has(>[data-ancient-top-menu]))';
module.exports = `
/* Size each catalog or guide once against the viewport, never its nested panels. */
${main} {
  box-sizing:border-box;width:100%!important;max-width:none!important;
  margin-inline:auto!important;padding-inline:0!important;
}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine) {
  ${main} {width:50vw!important}
}
${main}>:is(.filters,.catalog-scroll,.character-sidebar,.tier-sidebar,.build-layout,.split-body),
${main} :is(.relic-section,.potion-section,.catalog,.split-detail,.split-detail iframe,.build-content,.build-section,.build-panel) {
  box-sizing:border-box;width:100%!important;max-width:none!important;min-width:0;
}
${main}>.catalog-scroll {margin-inline:0}
`;
