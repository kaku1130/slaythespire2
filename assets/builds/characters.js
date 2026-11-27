(()=>{
 const index=document.getElementById('character-index');
 const detail=document.getElementById('character-detail');
 const panels=[...document.querySelectorAll('[data-character-panel]')];
 let current='';
 function applyRoute(fallbackHash=''){
  let hash;
  try{hash=decodeURIComponent(location.hash.slice(1)||(typeof fallbackHash==='string'?fallbackHash:''));}catch{hash='';}
  const target=document.getElementById(hash);
  const panel=target?.closest('[data-character-panel]')||panels.find(panel=>hash.startsWith('build-'+panel.dataset.characterPanel+'-'));
  const selected=panel?.dataset.characterPanel||'';
  index.hidden=!!panel;
  detail.hidden=!panel;
  for(const candidate of panels)candidate.hidden=candidate!==panel;
  document.title=(panel?panel.querySelector('h1').textContent+'｜':'')+'Characters｜殺戮尖塔2';
  if(selected!==current){
   current=selected;
   (document.querySelector('.site-page-scroll')||window).scrollTo({top:0,behavior:'instant'});
  }
  if(target&&target!==panel&&panel)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
 }
 window.addEventListener('hashchange',applyRoute);
 document.addEventListener('click',event=>{
  const link=event.target.closest('.site-nav>a[href]');
  if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  if(new URL(link.href).pathname!==new URL(document.baseURI).pathname)return;
  event.preventDefault();
  location.hash='characters';
  applyRoute();
  (document.querySelector('.site-page-scroll')||window).scrollTo({top:0,behavior:'instant'});
 },true);
 window.restoreCharacterRoute=hash=>{if(!location.hash)applyRoute(hash);};
 applyRoute();
})();
