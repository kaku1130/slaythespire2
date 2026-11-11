process.chdir(require('node:path').resolve(__dirname,'../..'));
module.exports=`
/* Toolbars wrap with the available CSS viewport, including browser zoom. */
.tools{min-width:0;max-width:100%}.tools .primary-filter-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px;overflow:visible;padding:3px 3px 12px;min-width:0;max-width:100%}
.tools .primary-filter-row .chips{display:flex;flex:0 1 auto;flex-wrap:wrap;min-width:0;max-width:100%;gap:8px;overflow:visible;margin:0;padding:2px}
.tools .primary-filter-row .chips button{white-space:nowrap;flex:0 0 auto;min-width:0;max-width:100%}
.tools .primary-filter-row .inline-search{flex:1 1 260px;min-width:0;max-width:100%}.inline-search input{width:100%;min-width:0;max-width:100%}
.tools .primary-filter-row>.result{flex:0 0 auto;margin:0;white-space:nowrap;padding:0}
.tools .secondary-filter-row{display:flex;align-items:center;flex-wrap:wrap;gap:12px 18px;overflow:visible;min-width:0;max-width:100%}
.filter-cluster{display:flex;flex:0 1 auto;align-items:center;flex-wrap:wrap;gap:10px;min-width:0;max-width:100%}
.tools .secondary-filter-row .rarity-buttons{display:flex;flex:0 1 auto;flex-wrap:wrap;min-width:0;max-width:100%;overflow:visible;padding:0;gap:8px}
.tools .secondary-filter-row .rarity-filter-label{flex:0 0 auto}
.tools .secondary-filter-row .presentation-controls{display:flex;flex:0 1 auto;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:8px;margin:0 0 0 auto;min-width:0;max-width:100%}
.tools .presentation-controls .image-size-controls{flex:0 0 auto;margin-left:6px;max-width:100%}.tools .presentation-controls button{flex:0 0 auto}
@media(max-width:1699px){.tools .primary-filter-row .chips{flex:1 0 100%}.tools .primary-filter-row .inline-search{flex:1 1 0;min-width:0}.tools .secondary-filter-row .presentation-controls{margin-left:0}}
@media(max-width:640px){.tools .primary-filter-row{padding:0;gap:10px}.tools .primary-filter-row .chips{padding:2px;gap:6px}.tools .primary-filter-row .chips button{font-size:18px;min-height:42px;padding:5px 9px;gap:5px}.tools .primary-filter-row .pool-icon{width:20px;height:20px}.tools .secondary-filter-row{gap:10px;margin-top:12px}.filter-cluster{flex:1 0 100%;width:100%;flex-wrap:nowrap;align-items:flex-start;gap:8px}.filter-cluster .rarity-filter-label{min-width:64px}.tools .secondary-filter-row .rarity-buttons{flex:1 1 0;gap:6px}.tools .rarity-buttons button{padding:5px 10px;min-height:44px;font-size:20px}.tools .presentation-controls button{min-height:42px;font-size:18px;padding:5px 11px}.tools .secondary-filter-row .presentation-controls{margin:0}.inline-search input#search{font-size:20px;height:46px;min-height:46px}.tools .primary-filter-row>.result{font-size:12px}.tools .rarity-filter-label{font-size:22px;line-height:44px}}
@media(max-width:1000px){.tools .primary-filter-row>.result{display:none}.tools .secondary-filter-row .rarity-filter-label{display:none}.filter-cluster{gap:0}}
.tools .rarity-buttons button[data-rarity-filter=Ancient]{--rarity-color:#c49aef}
/* The page scrolls as a whole; only the site navigation remains sticky. */
@media screen{html{height:auto;min-height:100%;overflow-x:clip;overflow-y:auto}body{display:block;min-height:100dvh;height:auto;overflow:visible}.site-header{position:sticky;top:0}main#main-content{display:block;min-height:0;height:auto;overflow:visible}.card-scroll{height:auto;min-height:0;overflow:visible;scrollbar-gutter:auto}.card-scroll section{max-width:100%}.tools{position:static;top:auto}}
@media screen and (min-width:1800px){.card-scroll thead{top:var(--site-header-height,72px)}}

/* Separate filter groups and share card Tier colors with their controls. */
.tools .secondary-filter-row{column-gap:28px;row-gap:18px}
.tools .tier-buttons button{background:var(--tier-color,transparent);color:#fff;border-color:var(--tier-color,var(--line))}.tools .tier-buttons button[data-tier-filter=unranked]{color:var(--muted)}.tools .tier-buttons button[aria-pressed=true]{background:var(--tier-color,transparent);color:#fff;border-color:var(--ink);box-shadow:0 0 0 1px var(--ink)}.tools .tier-buttons button[data-tier-filter=unranked][aria-pressed=true]{color:var(--muted)}

.tools .secondary-filter-row .presentation-controls{margin-left:auto;justify-content:flex-end}.tools .presentation-controls .image-size-controls{order:-1;margin:0 8px 0 0}.tools .tier-buttons button,.tools .tier-buttons button[aria-pressed=true]{background:var(--paper);color:var(--tier-color);border-color:var(--tier-color)}.tools .tier-buttons button[aria-pressed=true]{box-shadow:0 0 0 1px currentColor}.tools .aoe-toggle{display:inline-flex;align-items:center;gap:8px;margin:0;flex:0 0 auto;min-height:44px;font-size:18px;cursor:pointer;white-space:nowrap}.tools .aoe-toggle input{width:18px;height:18px;min-height:0;margin:0;padding:0;accent-color:var(--focus)}

.tools .tier-buttons button[aria-pressed=true]{background:var(--tier-color);color:#fff;border-color:var(--tier-color);box-shadow:0 0 0 2px color-mix(in srgb,var(--tier-color) 60%,white),0 0 12px color-mix(in srgb,var(--tier-color) 45%,transparent);font-weight:700}

.tools .type-buttons #aoe-toggle{margin-left:12px}

.tools .type-buttons #aoe-toggle{display:inline-flex;align-items:center;justify-content:center;gap:7px}.aoe-icon{width:20px;height:20px;flex:0 0 auto}

.tools{border-bottom:0}
`;
