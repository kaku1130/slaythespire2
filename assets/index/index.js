(() => {
  const pages=window.sitePages;
  const host=document.getElementById('main-content');
  const loading=host.querySelector('.index-loading');
  const loadingTemplate=loading.innerHTML;
  const frames=new Map();
  const root=new URL('.',location.href);
  const selectionStorageKey='sts2:last-page:'+root.href;
  function savedPage(){
    try{
      const key=localStorage.getItem(selectionStorageKey);
      if(Object.hasOwn(pages,key))return {key,hash:''};
    }catch{}
    return {key:'cards',hash:''};
  }
  let selected='';
  let completionTimer;
  function renderProgress(entry){
    if(entry.key!=='cards'||selected!==entry.key||frames.get(entry.key)!==entry)return;
    loading.style.setProperty('--load-progress',entry.progress+'%');
    const percent=loading.querySelector('.index-loading-percent');
    if(percent)percent.textContent=entry.progress+'%';
    loading.querySelector('[role=progressbar]')?.setAttribute('aria-valuenow',String(entry.progress));
  }
  function progress(entry,value){
    entry.progress=Math.max(entry.progress,value);
    renderProgress(entry);
  }
  function showLoading(entry){
    clearTimeout(completionTimer);
    host.setAttribute('aria-busy','true');
    if(entry.key!=='cards'){loading.hidden=true;return;}
    loading.innerHTML=loadingTemplate;
    loading.classList.remove('is-complete');
    loading.hidden=false;
    renderProgress(entry);
  }
  function finishLoading(entry){
    if(entry.key!=='cards'){loading.hidden=true;host.setAttribute('aria-busy','false');return;}
    progress(entry,100);
    loading.querySelector('.index-loading-label').textContent='載入完成';
    host.setAttribute('aria-busy','false');
    loading.classList.add('is-complete');
    completionTimer=setTimeout(()=>{
      if(selected===entry.key&&frames.get(entry.key)===entry&&entry.ready)loading.hidden=true;
    },180);
  }
  window.addEventListener('message',event=>{
    if(event.data?.type!=='sts2-page-progress')return;
    const value={parsing:35,initialized:85}[event.data.stage];
    if(!value)return;
    for(const entry of frames.values())if(entry.frame.contentWindow===event.source){progress(entry,value);break;}
  });
  function updateRoute(route,push){
    const method=push?'pushState':'replaceState';
    history[method]({siteIndex:route},'',location.href);
  }
  function routeFor(url){
    return Object.entries(pages).find(([,page])=>{
      const target=new URL(page.file,root);
      return target.origin===url.origin&&target.pathname===url.pathname;
    })?.[0];
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
    if(selected!==key){
      for(const entry of frames.values())entry.frame.remove();
      frames.clear();
    }
    selected=key;
    try{localStorage.setItem(selectionStorageKey,key);}catch{}
    clearTimeout(completionTimer);
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
      if(entry.ready)loading.hidden=true;
      else showLoading(entry);
      host.setAttribute('aria-busy',String(!entry.ready));
      if(entry.ready){entry.frame.contentWindow.closeFilterMenu?.();applyHash(entry,hash);document.title=entry.frame.contentDocument.title;}
      return;
    }
    const frame=document.createElement('iframe');
    frame.title=pages[key].label;
    frame.dataset.page=key;
    frame.style.visibility='hidden';
    entry={key,frame,ready:false,hash,progress:10};
    frames.set(key,entry);
    showLoading(entry);
    const fail=()=>{
      if(frames.get(key)!==entry)return;
      frames.delete(key);
      frame.remove();
      if(selected!==key)return;
      clearTimeout(completionTimer);
      loading.classList.remove('is-complete');
      host.setAttribute('aria-busy','false');
      loading.hidden=false;
      loading.textContent='載入失敗，請重試。';
      const retry=document.createElement('button');
      retry.type='button';
      retry.textContent='重試';
      retry.addEventListener('click',()=>show({key,hash:entry.hash}));
      loading.append(retry);
    };
    frame.addEventListener('load',()=>{
      try{
        const doc=frame.contentDocument;
        if(!doc?.getElementById('main-content')){fail();return;}
        const style=doc.createElement('style');
        style.textContent='html body>.site-header,html body>.skip-link{display:none!important}';
        doc.head.append(style);
        frame.contentWindow.closeFilterMenu?.();
        bindDocument(frame,key,true);
        entry.ready=true;
        frame.style.visibility='';
        if(selected===key){
          finishLoading(entry);applyHash(entry,entry.hash);
        }
      }catch{fail();}
    },{once:true});
    try{
        progress(entry,35);
        const source=pages[key].html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(tag,attributes,code)=>{
          if(/\bsrc\s*=|\btype\s*=/i.test(attributes))return tag;
          return '<script'+attributes+'>'+code.replace(/\blocation\.href\b/g,'document.baseURI')+'</script>';
        });
        const html=/<head\b/i.test(source)?source:source.replace(/(<html\b[^>]*>)/i,'$1<head>');
        frame.srcdoc=html.replace(/<head\b[^>]*>/i,head=>head+'<base href="'+new URL(pages[key].file,root).href+'"><style>html body>.site-header,html body>.skip-link{display:none!important}</style>');
        host.append(frame);
    }catch{fail();}
  }
  document.querySelector('.site-nav').addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const key=routeFor(new URL(link.href));
    if(!key)return;
    event.preventDefault();
    const previous=frames.get(key);
    if(previous){previous.frame.remove();frames.delete(key);}
    show({key,hash:''},true);
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
  show(history.state?.siteIndex||savedPage());
})();
