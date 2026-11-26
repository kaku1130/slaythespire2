module.exports = `
/* Match the character page content frame without changing the navigation. */
html body:not([data-detail-kind]) main#main-content#main-content#main-content {
  box-sizing:border-box;
  width:100%!important;
  max-width:none!important;
  margin-inline:auto!important;
  padding-inline:16px!important;
}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine), screen and (min-width:1441px) {
  html body:not([data-detail-kind]) main#main-content#main-content#main-content {
    width:60%!important;
  }
  html body:not([data-detail-kind]) main#main-content:has(>.relic-filters,>.potion-filters)>.catalog-scroll {
    width:100%!important;
    max-width:none;
    margin-inline:0;
  }
  html body:not([data-detail-kind]) main#main-content .card-detail .detail-keyword {width:100%;justify-self:stretch}
}
`;
