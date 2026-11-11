process.chdir(require('node:path').resolve(__dirname,'../..'));
// Shared sizing and rhythm for catalog controls and content groups.
module.exports = `
:root{--control-bg:#0d131a;--control-border:#293340;--control-height:48px;--control-font:20px;--control-radius:7px;--control-gap:8px;--group-gap:16px;--section-gap:24px;--panel-padding:20px}
main#main-content :is(.tools,.filters){font-family:Arial,"Microsoft JhengHei",sans-serif;margin:0 0 var(--section-gap);padding:0;min-width:0;max-width:100%}
main#main-content :is(.tools,.filters) :is(button,input[type=search],select){box-sizing:border-box;min-height:var(--control-height);font:400 var(--control-font)/1.4 Arial,"Microsoft JhengHei",sans-serif;padding:8px 14px;border:1px solid var(--control-border);border-radius:var(--control-radius);background:var(--control-bg);max-width:100%}
main#main-content :is(.tools,.filters) #search{height:var(--control-height);min-height:var(--control-height);min-width:0;width:100%;font:400 var(--control-font)/1.4 Arial,"Microsoft JhengHei",sans-serif;padding:8px 14px;color:var(--ink);border:1px solid var(--control-border);border-radius:var(--control-radius);background:var(--control-bg)}
main#main-content :is(.tools,.filters) #search::placeholder{color:var(--muted);opacity:1}
main#main-content :is(.tools,.filters) :is(button,select){cursor:pointer}
main#main-content :is(.tools,.filters) :is(button,select):hover{border-color:currentColor}
main#main-content :is(.tools,.filters) :is(button,input,select):focus-visible{outline:2px solid var(--focus,#37a8ec);outline-offset:3px}
main#main-content .filters{display:flex;flex-wrap:wrap;align-items:center;gap:var(--group-gap)}
main#main-content .filters #search{order:1;flex:1 1 320px;max-width:420px;margin-left:auto}
main#main-content .filters select{flex:0 1 auto;min-width:0}
main#main-content :is(.potion-rarities,.relic-filter-group){display:flex;flex-wrap:wrap;gap:var(--control-gap);max-width:100%}
main#main-content .tools :is(.primary-filter-row,.secondary-filter-row){display:flex;flex-wrap:wrap;align-items:center;gap:var(--group-gap);padding:0;overflow:visible}
main#main-content .tools .primary-filter-row{margin:0 0 var(--group-gap)}
main#main-content .tools .secondary-filter-row{margin:0}
main#main-content .tools :is(.chips,.rarity-buttons,.filter-cluster,.presentation-controls,.image-size-controls){gap:var(--control-gap);padding:0}
main#main-content .tools .inline-search{flex:1 1 320px;max-width:420px;margin-left:auto}
main#main-content .tools .type-buttons #aoe-toggle{margin-left:0}
main#main-content :is(.catalog,.relic-section .catalog,.potion-section .catalog){gap:var(--group-gap)}
main#main-content :is(.relic-section,.potion-section){margin:0 0 var(--section-gap);padding:var(--panel-padding)}
main#main-content :is(.relic-section-title,.potion-section-title){margin:0 0 var(--group-gap)}
main#main-content .entry{padding:var(--panel-padding)}
main#main-content .card-scroll section{margin-bottom:var(--section-gap)}
main#main-content .card-scroll .grid-pool-heading{margin:0 0 var(--group-gap)}
main#main-content .build-layout{gap:var(--section-gap)}
main#main-content :is(.character-nav,.tier-sidebar .tier-index){gap:var(--control-gap)}
main#main-content .character-sidebar .character-nav a{min-height:var(--control-height);font-size:var(--control-font);line-height:1.4;padding:8px 14px;border-radius:var(--control-radius)}
main#main-content .tier-sidebar .tier-index-item{min-height:var(--control-height);font-size:var(--control-font);padding:8px 14px;border-radius:var(--control-radius);gap:var(--control-gap)}
main#main-content .build-content .build-panel{padding:var(--panel-padding)}
main#main-content>footer{margin-top:var(--section-gap)}
@media(max-width:760px){main#main-content .build-layout{gap:var(--group-gap)}}
@media(max-width:640px){:root{--panel-padding:16px}main#main-content .filters #search{flex:1 1 100%;max-width:none;margin-left:0}main#main-content .filters select{flex:1 1 100%;width:100%}main#main-content .filters>:is(.potion-rarities,.relic-filter-group){width:100%}main#main-content .tools .inline-search{flex:1 1 100%;max-width:none;margin-left:0}main#main-content .tools .presentation-controls{flex:1 1 100%;width:100%;margin:0;justify-content:flex-start}main#main-content .tools .presentation-controls .image-size-controls{flex:1 1 100%;margin:0}main#main-content .tools .presentation-controls>button{flex:1 1 0}}
`;

module.exports += `
.site-header .site-nav a{border:1px solid transparent}
.site-header .site-nav a:hover,.site-header .site-nav a[aria-current=page]:hover{border-color:currentColor!important;box-shadow:none!important}
main#main-content :is(.character-nav a,.tier-index-item):hover{border-color:currentColor}
main#main-content :is(.tools,.filters) #search{appearance:none;outline:none;box-shadow:none;border:1px solid var(--control-border)}
main#main-content :is(.tools,.filters) #search:hover{border-color:var(--muted)}
main#main-content :is(.tools,.filters) #search:focus{border-color:var(--focus,#37a8ec);outline:none;box-shadow:0 0 0 1px var(--focus,#37a8ec)}
`;

module.exports += require('./button-theme.cjs');

module.exports += require('./search-theme.cjs');
