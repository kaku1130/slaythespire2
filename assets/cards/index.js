(() => {
  const pages=window.sitePages;
  const host=document.getElementById('main-content');
  const loading=host.querySelector('.index-loading');
  const frames=new Map();
  const root=new URL('.',location.href);
  let selected='';
  const readSaved=()=>{
    try{return JSON.parse(sessionStorage.getItem('site-index-route')||'null');}catch{return null;}
  };
  function remember(route){
    try{sessionStorage.setItem('site-index-route',JSON.stringify(route));}catch{}
  }
  function updateRoute(route,push){
    const method=push?'pushState':'replaceState';
    history[method]({siteIndex:route},'',location.href);
    remember(route);
  }
  function routeFor(url){
    return Object.entries(pages).find(([,page])=>new URL(page.file,root).href===url.href.split('#')[0])?.[0];
  }
  function bindDocument(frame,key,topLevel){
    const doc=frame.contentDocument;
    if(!doc)return;
    doc.addEventListener('click',event=>{
      if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      const link=event.target.closest('a[href]');
      if(!link||link.hasAttribute('download'))return;
      const href=link.getAttribute('href');
      const url=new URL(href,doc.baseURI);
      const target=routeFor(url);
      if(target){
        event.preventDefault();
        event.stopImmediatePropagation();
        show({key:target,hash:url.hash},true);
      }else if(topLevel&&href.startsWith('#')){
        event.preventDefault();
        show({key,hash:href},true);
      }
    },true);
    const bindNested=()=>{
      for(const nested of doc.querySelectorAll('iframe')){
        if(nested.dataset.indexBound)continue;
        nested.dataset.indexBound='true';
        nested.addEventListener('load',()=>bindDocument(nested,key,false));
        if(nested.contentDocument?.readyState==='complete')bindDocument(nested,key,false);
      }
    };
    bindNested();
    new MutationObserver(bindNested).observe(doc.body,{childList:true,subtree:true});
    if(topLevel){
      const syncTitle=()=>{if(selected===key)document.title=doc.title;};
      syncTitle();
      new MutationObserver(syncTitle).observe(doc.querySelector('title'),{childList:true});
    }
  }
  function applyHash(entry,hash){
    const win=entry.frame.contentWindow;
    if(win.location.hash===hash)return;
    win.location.replace(win.location.href.split('#')[0]+hash);
    if(hash){
      let id;
      try{id=decodeURIComponent(hash.slice(1));}catch{return;}
      requestAnimationFrame(()=>win.document.getElementById(id)?.scrollIntoView({block:'start'}));
    }
  }
  function show(route,push=false){
    if(!pages[route?.key])route={key:'cards',hash:''};
    const {key,hash=''}=route;
    selected=key;
    updateRoute({key,hash},push);
    for(const link of document.querySelectorAll('.site-nav>a')){
      if(new URL(link.href).pathname===new URL(pages[key].file,root).pathname)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    }
    for(const [candidate,entry] of frames)entry.frame.hidden=candidate!==key;
    let entry=frames.get(key);
    if(entry){
      entry.hash=hash;
      entry.frame.hidden=false;
      loading.hidden=entry.ready;
      if(entry.ready){applyHash(entry,hash);document.title=entry.frame.contentDocument.title;}
      return;
    }
    loading.hidden=false;
    const frame=document.createElement('iframe');
    frame.title=pages[key].label;
    frame.dataset.page=key;
    frame.style.visibility='hidden';
    entry={frame,ready:false,hash};
    frames.set(key,entry);
    frame.addEventListener('load',()=>{
      entry.ready=true;
      bindDocument(frame,key,true);
      frame.style.visibility='';
      if(selected===key){loading.hidden=true;applyHash(entry,entry.hash);}
    },{once:true});
    // Embed the existing document so file:// works without fetch or a server.
    // The base keeps its original asset paths and local links intact.
    const source=pages[key].html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(tag,attributes,code)=>{
      if(/\bsrc\s*=|\btype\s*=/i.test(attributes))return tag;
      // Embedded documents have an about:srcdoc URL; relative links use their base.
      return '<script'+attributes+'>'+code.replace(/\blocation\.href\b/g,'document.baseURI')+'</script>';
    });
    const html=/<head\b/i.test(source)?source:source.replace(/(<html\b[^>]*>)/i,'$1<head>');
    frame.srcdoc=html.replace(/<head\b[^>]*>/i,head=>head+'<base href="'+new URL(pages[key].file,root).href+'"><style>html body>.site-header,html body>.skip-link{display:none!important}</style>');
    host.append(frame);
  }
  document.querySelector('.site-nav').addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const key=routeFor(new URL(link.href));
    if(!key)return;
    event.preventDefault();
    if(key===selected){
      const frame=frames.get(key)?.frame;
      if(frame?.contentWindow.scrollSitePageToTop)frame.contentWindow.scrollSitePageToTop();
      return;
    }
    const hash=frames.has(key)?frames.get(key).frame.contentWindow.location.hash:'';
    show({key,hash},true);
  });
  document.addEventListener('click',event=>{
    for(const menu of document.querySelectorAll('.game-info-dropdown[open]')){
      if(!menu.contains(event.target)||event.target.closest('.game-info-menu a'))menu.open=false;
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')for(const menu of document.querySelectorAll('.game-info-dropdown[open]'))menu.open=false;
  });
  window.addEventListener('popstate',event=>show(event.state?.siteIndex||{key:'cards',hash:''}));
  show(history.state?.siteIndex||readSaved()||{key:'cards',hash:''});
})();
