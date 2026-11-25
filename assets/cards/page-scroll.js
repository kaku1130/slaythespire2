(() => {
  if (window.parent !== window || document.body.classList.contains('characters-page')) return;
  const main = document.getElementById('main-content');
  if (!main || main.closest('.site-page-scroll')) return;
  const style = document.createElement('style');
  style.textContent = `
html:has(body>.site-page-scroll):has(main#main-content#main-content) {height:100%!important;min-height:0!important;overflow:hidden!important}
html body:has(>.site-page-scroll):has(main#main-content#main-content) {position:fixed!important;inset:0!important;display:flex!important;flex-direction:column;width:100%;height:100dvh!important;min-height:0!important;overflow:hidden!important}
html body:has(>.site-page-scroll):has(main#main-content#main-content)>.site-header {position:relative!important;top:0!important;flex:0 0 auto;width:100%!important;max-width:none!important;z-index:100}
html body>.site-page-scroll {display:block;flex:1 1 0;min-height:0;width:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior-y:contain;scrollbar-gutter:auto}
html body>.site-page-scroll main#main-content#main-content#main-content {display:block!important;flex:none!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
html body>.site-page-scroll main#main-content#main-content#main-content>:is(.tools,.filters,.card-scroll,.catalog-scroll,.split-body,.mobile-search-row,.character-sidebar,.tier-sidebar,.build-layout),
html body>.site-page-scroll main#main-content#main-content#main-content :is(.split-detail,.build-content) {position:static!important;flex:none!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;scrollbar-gutter:auto}
`;
  document.head.append(style);
  const scroller = document.createElement('div');
  scroller.className = 'site-page-scroll';
  main.before(scroller);
  scroller.append(main);
})();

// Reset the active page's scroll areas without reloading or clearing its state.
window.scrollSitePageToTop=()=>{
  window.scrollTo({top:0,left:0,behavior:'instant'});
  for(const area of document.querySelectorAll('.site-page-scroll,main#main-content,.card-scroll,.catalog-scroll,.split-body,.split-detail,.build-content')){
    area.scrollTo({top:0,left:0,behavior:'instant'});
  }
  for(const frame of document.querySelectorAll('iframe')){
    try{
      if(frame.contentWindow.scrollSitePageToTop)frame.contentWindow.scrollSitePageToTop();
      else frame.contentWindow.scrollTo({top:0,left:0,behavior:'instant'});
    }catch{}
  }
};
document.addEventListener('click',event=>{
  const link=event.target.closest('.site-nav>a[aria-current="page"]');
  if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  window.scrollSitePageToTop();
});

// Native details keeps the navigation usable without JavaScript; add dismissal shortcuts.
document.addEventListener('click',event=>{
  for(const menu of document.querySelectorAll('.game-info-dropdown[open]')){
    if(!menu.contains(event.target)||event.target.closest('.game-info-menu a'))menu.open=false;
  }
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  for(const menu of document.querySelectorAll('.game-info-dropdown[open]')){
    menu.open=false;
    menu.querySelector('summary').focus();
    event.preventDefault();
  }
});
