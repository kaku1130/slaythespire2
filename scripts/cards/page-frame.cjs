module.exports = `
/* All pages share a full-width frame with the same edge spacing. */
html {--site-width:100%;--site-page-gap:20px}
html body main#main-content,
html body .site-header>.site-header-inner {
  box-sizing:border-box;
  width:100%!important;
  max-width:none!important;
  margin-inline:0!important;
  padding-inline:16px!important;
}
html body main#main-content {padding-block:20px 24px}

/* Let menus and details fill the shared page frame at tablet widths. */
@media screen and (min-width:600px) and (max-width:1366px) {
  html body main#main-content:is(.event-browser[data-event-step],.monster-browser[data-monster-step],.ancient-browser) .split-body,
  html body main#main-content>:is(.character-sidebar,.tier-sidebar,.relic-filters,.potion-filters),
  html body main#main-content>.build-layout .build-content,
  html body main#main-content:has(>.relic-filters,>.potion-filters)>.catalog-scroll {
    width:100%;
    max-width:none;
    min-width:0;
  }
  html body main#main-content>.filters.relic-filters>.relic-filter-group:has([data-filter-group=pool]) {
    width:100%;
    flex-wrap:wrap;
  }
}
`;
module.exports+=require('./menu-spacing.cjs');

module.exports+="\n/* Equal spacing above and below the header divider. */\nhtml body .site-header>.site-header-inner {padding-block:8px!important}\nhtml body main#main-content {padding-top:8px!important}\n";

module.exports += "\n/* Thin scrollbars for the page and nested scroll areas. */\n* { scrollbar-width: thin; }\n";
