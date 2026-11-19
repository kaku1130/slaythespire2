const fs = require('node:fs');
const path = require('node:path');
// Match the category tiles at the top of https://slaythespire2.net/.
const files = {
  builds:['assets/cards/source/cards/necrobinder/soul_storm.webp','cover'],
  cards:['assets/cards/icons/nav-cards.webp','cover'],
  relic:['assets/relic/images/nav-relics.webp','contain'],
  potion:['assets/potion/images/nav-potions.webp','contain'],
  ancient:['assets/ancient/images/icon/neow.webp','contain'],
  monster:['assets/monster/images/nav-monsters.webp','cover']
};
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
/* Match the compact button widths used by the relic page. */
@media screen and (min-width:601px) and (hover:hover) and (pointer:fine), screen and (min-width:1025px) {
  html body .site-header .site-nav {
    display:grid!important;
    grid-template-columns:repeat(6,62px)!important;
    grid-auto-columns:62px!important;
    flex:0 0 auto!important;
    width:392px!important;
    max-width:100%;
    margin-left:auto;
    gap:4px;
  }
  html body .site-header .site-nav > a {box-sizing:border-box;flex:0 0 62px!important;width:62px!important;min-width:62px!important;max-width:62px!important}
}
/* Portrait phones show all six navigation buttons across the full header. */
@media screen and (max-width:600px) and (orientation:portrait) {
  html body .site-header>.site-header-inner {width:100%!important;padding-inline:8px!important;gap:0}
  html body .site-header .site-brand {display:none!important}
  html body .site-header .site-nav {
    display:grid!important;
    grid-template-columns:repeat(6,minmax(0,1fr))!important;
    grid-auto-flow:row!important;
    grid-auto-columns:auto!important;
    flex:1 1 100%!important;
    width:100%!important;
    max-width:100%;
    margin:0;
    gap:4px;
    overflow:visible;
  }
  html body .site-header .site-nav > a {box-sizing:border-box;min-width:0!important;width:100%!important;max-width:100%;padding:6px 0!important}
}
`;
module.exports = {icons,styles};
