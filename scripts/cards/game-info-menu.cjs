const items=[
 ['Events','https://sts2.untapped.gg/en/events'],
 ['Badges','https://sts2.untapped.gg/en/badges'],
 ['Patch Notes','https://sts2.untapped.gg/en/patch-notes']
];
const markup='<details class="game-info-dropdown"><summary>Game Info<span class="game-info-chevron" aria-hidden="true"></span></summary><div class="game-info-menu">'+items.map(([label,url])=>'<a href="'+url+'" '+(url.startsWith('https:')?'target="_blank" rel="noopener noreferrer"':'data-same-tab="true" target="_self"')+'>'+label+'</a>').join('')+'</div></details>';
const styles=`
/* Keep the final navigation menu outside the icon strip's clipping area. */
html body .site-header .site-nav {overflow:visible!important}
html body .site-header .game-info-dropdown {position:relative;align-self:center;width:132px;height:65px;font-family:Arial,"Microsoft JhengHei",sans-serif}
html body .site-header .game-info-dropdown>summary {
 display:flex;align-items:center;justify-content:center;gap:12px;box-sizing:border-box;
 width:100%;height:100%;padding:0 14px;list-style:none;cursor:pointer;
 border:1px solid #354454;border-radius:7.5px;background:#0d141c;color:#cbd5df;
 font:600 15px/1.4 Arial,"Microsoft JhengHei",sans-serif;white-space:nowrap;
}
html body .site-header .game-info-dropdown>summary::-webkit-details-marker {display:none}
html body .site-header .game-info-dropdown>summary:hover,
html body .site-header .game-info-dropdown[open]>summary {color:#e3e8ee;border-color:#238cc2;background:#163047}
html body .site-header .game-info-dropdown>summary:focus-visible {outline:2px solid #37a8ec;outline-offset:3px}
html body .site-header .game-info-chevron {display:block;width:7px;height:7px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:translateY(-2px) rotate(45deg)}
html body .site-header .game-info-dropdown[open] .game-info-chevron {transform:translateY(2px) rotate(225deg)}
html body .site-header .game-info-menu {
 position:absolute;right:0;top:calc(100% + 8px);z-index:110;box-sizing:border-box;
 width:220px;padding:6px;border:1px solid #354454;border-radius:8px;
 background:#0d141c;box-shadow:0 12px 32px #0008;
}
html body .site-header .game-info-menu>a {
 display:block!important;box-sizing:border-box;width:100%!important;min-width:0!important;max-width:none!important;
 height:auto!important;min-height:0!important;max-height:none!important;padding:12px 14px!important;
 margin:0;border:0;border-radius:5px;color:#cbd5df!important;text-align:left;text-decoration:none;
 font:500 14px/1.4 Arial,"Microsoft JhengHei",sans-serif!important;
}
html body .site-header .game-info-menu>a:hover {color:#fff!important;background:#1b2b3a}
`;
module.exports={items,markup,styles};
