module.exports = `
/* Center the complete build guide, including menus and content, on desktop. */
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine), screen and (min-width:1441px) {
  html body.character-guide-page main#main-content#main-content#main-content {
    box-sizing:border-box;
    width:max(25%,500px)!important;
    max-width:none!important;
    margin-inline:auto!important;
  }
}
`;
module.exports+=require('./tier-colors.cjs');
