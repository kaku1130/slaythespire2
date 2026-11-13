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
`;
