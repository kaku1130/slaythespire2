process.chdir(require('node:path').resolve(__dirname,'../..'));
// Keep navigation and filters outside each catalog's scrolling region.
module.exports = `
@media screen{
 html,body{height:100%;min-height:0;overflow:hidden}
 html{overflow:clip}
 body{position:fixed;inset:0;width:100%;display:flex;flex-direction:column;height:100dvh;min-height:0}
 .site-header{position:relative;flex:0 0 auto}
 main#main-content{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain}
 main#main-content:has(>.card-scroll,>.catalog-scroll,>.build-layout){display:flex;flex-direction:column;overflow:hidden}
 main#main-content>:is(.tools,.filters){flex:0 0 auto;min-height:0;max-height:45%;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}
 main#main-content>:is(.card-scroll,.catalog-scroll){flex:1;min-height:0;min-width:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;scrollbar-color:#354454 transparent;padding:3px 8px 3px 3px}
 main#main-content>:is(.card-scroll,.catalog-scroll):focus-visible{outline:2px solid #37a8ec;outline-offset:-2px}
 main#main-content>.build-layout{flex:1;min-height:0}
 main#main-content .card-scroll :is(section,[id^=card-]),main#main-content .catalog-scroll :is(section,.entry){scroll-margin-top:16px}
 main#main-content .card-scroll thead{top:0}
}
@media print{.catalog-scroll{overflow:visible;height:auto}}
`;
