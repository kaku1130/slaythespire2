module.exports = `
/* Catalogs scroll with the document; only the navigation stays at the top. */
@media screen {
  html:has(main#main-content>.card-scroll,main#main-content>.relic-filters,main#main-content>.potion-filters) {
    height:auto!important;min-height:100%;overflow-x:clip!important;overflow-y:auto!important;
  }
  body:has(main#main-content>.card-scroll,main#main-content>.relic-filters,main#main-content>.potion-filters) {
    position:static!important;inset:auto!important;display:block!important;width:100%;
    height:auto!important;min-height:100dvh;overflow:visible!important;
  }
  body:has(main#main-content>.card-scroll,main#main-content>.relic-filters,main#main-content>.potion-filters)>.site-header {
    position:sticky!important;top:0!important;z-index:100;
  }
  html body main#main-content#main-content:is(:has(>.card-scroll),:has(>.relic-filters),:has(>.potion-filters)) {
    display:block!important;flex:none!important;height:auto!important;min-height:0;
    max-height:none!important;overflow:visible!important;
  }
  html body main#main-content#main-content:is(:has(>.card-scroll),:has(>.relic-filters),:has(>.potion-filters))>:is(.tools,.filters,.card-scroll,.catalog-scroll,.split-body,.mobile-search-row) {
    position:static!important;flex:none!important;height:auto!important;
    min-height:0;max-height:none!important;overflow:visible!important;scrollbar-gutter:auto;
  }
  html body main#main-content#main-content:is(:has(>.card-scroll),:has(>.relic-filters),:has(>.potion-filters)) :is(.grid-pool-heading,.relic-section-title,.potion-section-title) {
    position:static!important;top:auto;
  }
}
`;
