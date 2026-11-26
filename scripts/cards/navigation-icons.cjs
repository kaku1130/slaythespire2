const fs = require('node:fs');
const path = require('node:path');
// Match the category tiles at the top of https://slaythespire2.net/.
const files = {
  builds:['assets/cards/icons/ironclad.webp','contain'],
  cards:['assets/cards/icons/nav-cards.webp','cover'],
  relic:['assets/relic/images/nav-relics.webp','contain'],
  potion:['assets/potion/images/nav-potions.webp','contain'],
  monster:['assets/monster/images/the-insatiable.webp','contain']
};
const columnCount=Object.keys(files).length;
const navigationWidth=columnCount*62+(columnCount-1)*4;
const icons = Object.fromEntries(Object.entries(files).map(([key,[file,fit]]) => {
  const src = 'data:image/webp;base64,' + fs.readFileSync(path.resolve(__dirname,'../..',file)).toString('base64');
  return [key,'<span class="site-nav-visual" aria-hidden="true"><img class="site-nav-icon" src="' + src + '" alt="" width="36" height="36" style="width:36px;height:36px;object-fit:' + fit + ';border-radius:6px' + (key === 'monster' ? ';object-position:center;transform:scale(1.2)' : '') + '"></span>'];
}));
const styles = `
/* Category artwork replaces the navigation text labels. */
html body>.site-header {box-sizing:border-box;width:100vw!important;max-width:none!important;margin-inline:0}
html body .site-header .site-nav > a {box-sizing:border-box;height:52px!important;min-height:52px!important;max-height:52px!important;min-width:60px;padding:6px 12px!important;align-self:center}
html body .site-header .site-nav a > .site-nav-visual {display:flex!important;align-items:center;justify-content:center;flex:0 0 36px;width:36px;height:36px}
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
/* Use the image source even when bundled legacy styles replace the logo. */
html body .site-header .site-logo {content:normal;width:112px;height:63px;object-fit:contain}
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

module.exports.styles += `
/* Scale desktop navigation artwork and buttons together by 25%. */
@media screen and (min-width:601px) and (hover:hover) and (pointer:fine), screen and (min-width:1025px) {
  html body .site-header .site-nav {
    grid-template-columns:repeat(${columnCount},77.5px)!important;
    grid-auto-columns:77.5px!important;
    flex:0 1 ${columnCount*77.5+(columnCount-1)*5}px!important;width:${columnCount*77.5+(columnCount-1)*5}px!important;gap:5px;
  }
  html body .site-header .site-nav > a {
    flex:0 0 77.5px!important;width:77.5px!important;min-width:77.5px!important;max-width:77.5px!important;
    height:65px!important;min-height:65px!important;max-height:65px!important;
    padding:7.5px 15px!important;border-radius:7.5px;
  }
  html body .site-header .site-nav a > .site-nav-visual {flex:0 0 45px;width:45px;height:45px}
  html body .site-header .site-nav .site-nav-icon {width:45px!important;height:45px!important;border-radius:7.5px!important}
}
`;

module.exports.styles += require('./game-info-menu.cjs').styles;

module.exports.styles+=`
/* Compact tablets keep identical navigation sizing regardless of input detection. */
@media screen and (min-width:601px) and (max-width:1180px) {
 html body .site-header .site-nav {display:grid!important;grid-template-columns:repeat(${columnCount},62px) 108px!important;grid-auto-columns:62px!important;flex:0 0 504px!important;width:504px!important;gap:4px}
 html body .site-header .site-nav>a {flex:0 0 62px!important;width:62px!important;min-width:62px!important;max-width:62px!important;height:52px!important;min-height:52px!important;max-height:52px!important;padding:6px 12px!important;border-radius:6px}
 html body .site-header .site-nav a>.site-nav-visual {flex:0 0 36px;width:36px;height:36px}
 html body .site-header .site-nav .site-nav-icon {width:36px!important;height:36px!important;border-radius:6px!important}
 html body .site-header .game-info-dropdown {flex:0 0 108px;width:108px;height:52px}
 html body .site-header .game-info-dropdown>summary {font-size:14px;padding:0 8px;gap:8px;border-radius:6px}
}
`;

module.exports.styles+=`
/* Prevent Safari text autosizing from changing the header after navigation. */
html body .site-header {-webkit-text-size-adjust:100%;text-size-adjust:100%}
html body .site-header .site-nav>a,html body .site-header .game-info-dropdown>summary {transition:none;animation:none}
`;

module.exports.styles+=`
/* Navigation fills the space beside the logo with a consistent separation. */
html body .site-header>.site-header-inner {flex-wrap:nowrap!important;column-gap:24px!important}
html body .site-header .site-brand {flex:0 0 auto}
html body .site-header .site-nav {display:grid!important;grid-template-columns:repeat(${columnCount},minmax(0,1fr)) minmax(108px,1fr)!important;grid-auto-columns:minmax(0,1fr)!important;flex:1 1 0!important;width:auto!important;min-width:0;max-width:none;margin-inline:0!important}
html body .site-header .site-nav>a {width:100%!important;min-width:0!important;max-width:none!important;flex:1 1 0!important;padding-inline:0!important}
html body .site-header .game-info-dropdown {width:100%;min-width:0;max-width:none;justify-self:stretch}
`;

module.exports.styles+=`
/* Share navigation artwork sizing with card pool icons. */
html {--site-nav-icon-size:36px}
@media screen and (min-width:601px) and (hover:hover) and (pointer:fine), screen and (min-width:1025px) {html {--site-nav-icon-size:45px}}
@media screen and (max-width:600px) {html {--site-nav-icon-size:32px}}
@media screen and (min-width:601px) and (max-width:1180px) {html {--site-nav-icon-size:36px}}
`;

module.exports.styles+=`
/* Phones show only the five category icons, with no empty menu column. */
@media screen and (max-width:600px), screen and (orientation:landscape) and (max-height:500px) and (max-width:1000px) and (hover:none) and (pointer:coarse) {
 html body .site-header .game-info-dropdown {display:none!important}
 html body .site-header .site-nav {grid-template-columns:repeat(${columnCount},minmax(0,1fr))!important}
}
`;

module.exports.styles+=`
/* Category icon sizing belongs to navigation, independently of Game Info. */
@media screen and (max-width:600px) {
 html body .site-header .site-nav>a {padding-block:4px!important}
 html body .site-header .site-nav a>.site-nav-visual {flex:0 0 32px;width:32px;height:32px}
 html body .site-header .site-nav .site-nav-icon {width:32px!important;height:32px!important}
}
`;
