(() => {
  const desktop = matchMedia('(min-width: 1441px), (width > 1024px) and (hover: hover) and (pointer: fine)');

  function update() {
    document.body.classList.toggle('cards-desktop', desktop.matches);
  }

  desktop.addEventListener('change', update);
  update();

  function closeTier(section,restoreFocus=true){
    section.hidden=true;
    const image=section.closest('[data-catalog-layout]').querySelector('.detail-art>img');
    for(const name of ['tabindex','role','aria-label','data-tier-close'])image.removeAttribute(name);
    const trigger=document.querySelector('[data-card-tier="'+section.id+'"]');
    if(trigger){trigger.setAttribute('aria-expanded','false');if(restoreFocus)trigger.focus({preventScroll:true});}
  }
  function positionTier(section){
    const card=section.closest('[data-catalog-layout]');
    const image=card.querySelector('.detail-art>img');
    const top=image.getBoundingClientRect().bottom-card.getBoundingClientRect().top-card.clientTop;
    section.style.setProperty('--tier-popup-top',Math.max(0,top)+'px');
  }
  document.addEventListener('click',event=>{
    const image=event.target.closest('.detail-art>img[data-tier-close]');
    if(image){closeTier(image.closest('[data-catalog-layout]').querySelector('.detail-tier-section'));return;}
    const button=event.target.closest('[data-card-tier]');
    if(!button)return;
    const section=document.getElementById(button.dataset.cardTier);
    if(!section)return;
    const opening=section.hidden;
    for(const other of document.querySelectorAll('.detail-tier-section:not([hidden])'))closeTier(other,false);
    if(!opening)return;
    positionTier(section);
    section.hidden=false;
    button.setAttribute('aria-expanded','true');
    const artwork=section.closest('[data-catalog-layout]').querySelector('.detail-art>img');
    artwork.tabIndex=0;
    artwork.setAttribute('role','button');
    artwork.setAttribute('aria-label','關閉 Tier 說明');
    artwork.setAttribute('data-tier-close','');
    section.querySelector('a').focus({preventScroll:true});
  });
  document.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&event.target.matches('.detail-art>img[data-tier-close]')){
      event.preventDefault();
      event.target.click();
      return;
    }
    if(event.key!=='Escape')return;
    for(const section of document.querySelectorAll('.detail-tier-section:not([hidden])'))closeTier(section);
  });
  window.addEventListener('resize',()=>{
    for(const section of document.querySelectorAll('.detail-tier-section:not([hidden])'))positionTier(section);
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-card-version]');
    if (!button || button.disabled) return;
    const card = button.closest('[data-catalog-layout]');
    if (!card) return;
    const upgraded = button.getAttribute('aria-pressed') !== 'true';
    const version = upgraded ? 'upgraded' : 'base';
    button.setAttribute('aria-pressed', String(upgraded));
    card.dataset.effectVersion = version;
    for (const panel of card.querySelectorAll('.detail-effect-panel')) {
      panel.hidden = panel.getAttribute('aria-label').toLowerCase() !== version;
    }
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-effect-search]');
    const search = document.getElementById('search');
    if (!button || !search) return;
    search.value = button.dataset.effectSearch;
    search.dispatchEvent(new Event('input', {bubbles:true}));
    search.focus({preventScroll:true});
    search.scrollIntoView({block:'center',behavior:'instant'});
  });

  const dialog = document.getElementById('card-effect-dialog');
  const tooltipData = document.getElementById('card-effect-tooltips-data');
  if (dialog && tooltipData) {
    const entries = JSON.parse(tooltipData.textContent);
    let trigger, pendingOpen;
    function openExplanation(button, entry) {
      if (!button.isConnected || !button.getClientRects().length) return;
      trigger = button;
      const title = document.getElementById('card-effect-dialog-title');
      title.replaceChildren();
      if (entry.icon) {
        const icon = document.createElement('img');
        icon.src = entry.icon; icon.alt = ''; icon.width = 24; icon.height = 24;
        title.append(icon);
      }
      title.append(document.createTextNode(entry.title));
      document.getElementById('card-effect-dialog-content').innerHTML = entry.html;
      if (!dialog.open) dialog.showModal();
    }
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-effect-tooltip]');
      const entry = button && entries[button.dataset.effectTooltip];
      if (!entry) return;
      clearTimeout(pendingOpen);
      if (event.detail === 0) openExplanation(button, entry);
      else if (event.detail === 1) pendingOpen = setTimeout(() => openExplanation(button, entry), 400);
    });
    document.addEventListener('dblclick', event => {
      const button = event.target.closest('.detail-effect-panel [data-effect-tooltip]');
      const search = document.getElementById('search');
      if (!button || !search) return;
      clearTimeout(pendingOpen);
      if (dialog.open) dialog.close();
      search.value = button.textContent.replace(/\s+/g, ' ').trim();
      search.dispatchEvent(new Event('input', {bubbles:true}));
      search.focus({preventScroll:true});
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') clearTimeout(pendingOpen);
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (trigger?.isConnected) trigger.focus({preventScroll:true});
    });
  }
})();
