// Search controls and text buttons share the card filter height.
module.exports=`
:root {--catalog-control-height:48px;--catalog-button-height:48px;--catalog-icon-button-height:50px}
html body main#main-content#main-content#main-content .search-control,
html body main#main-content#main-content#main-content .search-control input#search,
html body main#main-content#main-content#main-content .shared-page-search input#search,
html body main#main-content#main-content#main-content :is(.filter-menu-toggle,.card-language-toggle) {
 box-sizing:border-box;height:var(--catalog-control-height)!important;
 min-height:var(--catalog-control-height)!important;max-height:var(--catalog-control-height)!important;
}
html body main#main-content#main-content#main-content .relic-ancient-buttons>button,
html body main#main-content#main-content#main-content .monster-filters>button {
 box-sizing:border-box;height:var(--catalog-button-height)!important;
 min-height:var(--catalog-button-height)!important;max-height:var(--catalog-button-height)!important;
}
html body main#main-content#main-content#main-content #relic-filter-pool>button,
html body main#main-content#main-content#main-content .relic-ancient-menu>button {
 box-sizing:border-box;height:var(--catalog-icon-button-height)!important;
 min-height:var(--catalog-icon-button-height)!important;max-height:var(--catalog-icon-button-height)!important;
}
`;
