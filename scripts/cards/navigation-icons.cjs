const fs = require('node:fs');
const path = require('node:path');
// Match the category tiles at the top of https://slaythespire2.net/.
const files = {
  builds:['assets/cards/source/cards/necrobinder/soul_storm.webp','cover'],
  cards:['assets/cards/icons/nav-cards.webp','cover'],
  relic:['assets/relic/images/nav-relics.webp','contain'],
  potion:['assets/potion/images/nav-potions.webp','contain'],
  ancient:['assets/ancient/images/icon/neow.webp','contain']
};
const columnCount=Object.keys(files).length;
const navigationWidth=columnCount*62+(columnCount-1)*4;
const icons = Object.fromEntries(Object.entries(files).map(([key,[file,fit]]) => {
  const src = 'data:image/webp;base64,' + fs.readFileSync(path.resolve(__dirname,'../..',file)).toString('base64');
  return [key,'<span class="site-nav-visual" aria-hidden="true"><img class="site-nav-icon" src="' + src + '" alt="" width="36" height="36" style="width:36px;height:36px;object-fit:' + fit + ';border-radius:6px"></span>'];
}));
const styles = `
/* Category artwork replaces the navigation text labels. */
html body>.site-header {box-sizing:border-box;width:100vw!important;max-width:none!important;margin-inline:0}
html body .site-header .site-nav > a {min-width:60px;min-height:48px;padding:6px 12px!important}
html body .site-header .site-nav a > .site-nav-visual {display:flex!important;align-items:center;justify-content:center}
html body .site-header .site-nav .site-nav-icon {display:block;flex-shrink:0;max-width:none}
html body .site-header .site-nav {margin-left:auto!important;justify-content:end}
/* Match the compact button widths used by the relic page. */
@media screen and (min-width:601px) and (hover:hover) and (pointer:fine), screen and (min-width:1025px) {
  html body .site-header .site-nav {
    display:grid!important;
    grid-template-columns:repeat(${columnCount},62px)!important;
    grid-auto-columns:62px!important;
    flex:0 1 ${navigationWidth}px!important;
    width:${navigationWidth}px!important;
    max-width:100%;
    margin-left:auto;
    gap:4px;
  }
  html body .site-header .site-nav > a {box-sizing:border-box;flex:0 0 62px!important;width:62px!important;min-width:62px!important;max-width:62px!important}
}
/* Portrait phones keep the compact header edge spacing. */
@media screen and (max-width:600px) and (orientation:portrait) {
  html body .site-header>.site-header-inner {width:100%!important;padding-inline:8px!important;gap:0}
  html body .site-header .site-brand {display:none!important}
}
`;
const brandStyles = `
/* Brand visibility is shared by every page, including bundled legacy styles. */
@media screen and (min-width:601px) {
  html body .site-header .site-brand {display:flex!important}
  html body .site-header .site-brand > span {
    display:block!important;position:static!important;width:auto!important;height:auto!important;
    margin:0!important;padding:0!important;overflow:visible!important;clip-path:none!important;white-space:nowrap;
  }
  html body .site-header .site-nav {flex:0 1 ${navigationWidth}px!important;width:${navigationWidth}px!important;min-width:0;max-width:100%}
}
@media screen and (max-width:600px), screen and (orientation:landscape) and (max-height:500px) and (max-width:1000px) and (hover:none) and (pointer:coarse) {
  html body .site-header .site-brand {display:none!important}
  html body .site-header .site-nav {display:flex!important;flex:0 0 auto!important;width:max-content!important;max-width:100%;margin-left:auto!important;justify-content:flex-end!important;gap:4px}
  html body .site-header .site-nav > a {box-sizing:border-box;flex:0 0 52px!important;width:52px!important;min-width:52px!important;max-width:52px!important;padding:6px 8px!important}
}
`;
module.exports = {icons,styles:styles+brandStyles};
