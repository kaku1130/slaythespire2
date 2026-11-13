const fs=require('node:fs'),path=require('node:path');
const github='data:image/svg+xml;base64,'+fs.readFileSync(path.resolve(__dirname,'../../assets/cards/icons/github.svg')).toString('base64');
module.exports = `
/* Keep navigation in one row when the full labels no longer fit. */
@media screen and (max-width:1366px) {
  html body .site-header>.site-header-inner {flex-wrap:nowrap;gap:8px;min-height:56px}
  html body .site-header .site-brand {flex:0 0 auto;min-height:44px;gap:0}
  html body .site-header .site-brand>span,
  html body .site-header .site-nav a>span:not([aria-hidden]) {
    display:block;position:absolute;width:1px;height:1px;padding:0;margin:-1px;
    overflow:hidden;clip-path:inset(50%);white-space:nowrap;
  }
  html body .site-header .site-logo {width:30px;height:30px}
  html body .site-header .site-nav {flex:1 1 auto;width:auto;min-width:0;gap:4px}
  html body .site-header .site-nav a {flex:1 1 0;min-width:0;min-height:44px;padding:4px!important;gap:0;font-size:24px}
}

/* Compact, right-aligned navigation with a GitHub brand icon. */
html body .site-header .site-nav {flex:0 1 auto!important;width:auto!important;margin-left:auto;justify-content:flex-end}
html body .site-header .site-nav a {flex:0 0 auto!important}
html body .site-header .site-logo {content:url("${github}")}

/* Show navigation labels whenever tablet-sized widths have enough room, regardless of input device. */
@media screen and (min-width:700px) and (max-width:1366px) {
  html body .site-header .site-nav a {font-size:18px;gap:5px;padding:6px!important}
  html body .site-header .site-nav a>span:not([aria-hidden]) {
    display:inline;position:static;width:auto;height:auto;padding:0;margin:0;
    overflow:visible;clip-path:none;white-space:nowrap;
  }
  html body .site-header .site-nav a>span[aria-hidden] {font-size:20px}
}

/* Keep the site header visible during whole-page scrolling. */
html body>.site-header {position:sticky!important;top:0;z-index:100}

/* Phones and compact tablets keep icon-only navigation in either orientation. */
@media screen and (max-width:768px), screen and (orientation:landscape) and (max-width:1133px) and (max-height:768px) {
  html body .site-header .site-nav a {font-size:24px;gap:0;padding:4px!important}
  html body .site-header .site-nav a>span:not([aria-hidden]) {
    display:block;position:absolute;width:1px;height:1px;padding:0;margin:-1px;
    overflow:hidden;clip-path:inset(50%);white-space:nowrap;
  }
  html body .site-header .site-nav a>span[aria-hidden] {font-size:24px}
}

/* Fit all seven phone navigation buttons without clipping the first border. */
@media screen and (max-width:600px) {
  html body .site-header .site-nav a {
    box-sizing:border-box;width:clamp(30px,8vw,40px);min-width:0;
    padding:4px!important;font-size:20px;
  }
  html body .site-header .site-nav a>span[aria-hidden] {font-size:20px;line-height:1}
}

/* Phone navigation uses the entire header row without the brand icon. */
@media screen and (max-width:600px), screen and (orientation:landscape) and (max-height:500px) and (max-width:1000px) {
  html body .site-header .site-brand {display:none!important}
  html body .site-header>.site-header-inner {gap:0}
  html body .site-header .site-nav {flex:1 1 auto!important;width:100%!important;margin:0;gap:4px}
  html body .site-header .site-nav a {flex:1 1 0!important;width:auto;min-width:0}
}
`;
