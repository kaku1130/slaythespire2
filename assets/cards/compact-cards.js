(() => {
  const desktop = matchMedia('(min-width: 1441px), (width > 1024px) and (hover: hover) and (pointer: fine)');

  function update() {
    document.body.classList.toggle('cards-desktop', desktop.matches);
  }

  desktop.addEventListener('change', update);
  update();

  const tierDialog=document.createElement('dialog');
  tierDialog.id='card-tier-dialog';
  tierDialog.setAttribute('aria-labelledby','card-tier-dialog-title');
  tierDialog.innerHTML='<header class="tier-dialog-header"><h2 id="card-tier-dialog-title"></h2><form method="dialog"><button type="submit" class="tier-dialog-close" aria-label="關閉 Tier 說明">×</button></form></header><div class="tier-dialog-content"></div>';
  document.body.append(tierDialog);
  let tierTrigger;
  document.addEventListener('click', event => {
    const button=event.target.closest('[data-card-tier]');
    if(!button)return;
    const section=document.getElementById(button.dataset.cardTier);
    if(!section)return;
    tierTrigger=button;
    const card=button.closest('[data-catalog-layout]');
    const zh=card.querySelector('.detail-name-zh').textContent;
    const en=card.querySelector('.detail-name-en').textContent;
    const tier=button.querySelector('.creator-tier-badge').textContent;
    tierDialog.querySelector('h2').textContent=zh+' / '+en+' · Tier '+tier;
    const content=section.cloneNode(true);
    content.removeAttribute('id');
    content.hidden=false;
    tierDialog.querySelector('.tier-dialog-content').replaceChildren(content);
    button.setAttribute('aria-expanded','true');
    tierDialog.showModal();
  });
  tierDialog.addEventListener('click',event=>{
    if(event.target!==tierDialog)return;
    const bounds=tierDialog.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)tierDialog.close();
  });
  tierDialog.addEventListener('close',()=>{
    tierDialog.querySelector('.tier-dialog-content').replaceChildren();
    if(tierTrigger?.isConnected){
      tierTrigger.setAttribute('aria-expanded','false');
      tierTrigger.focus({preventScroll:true});
    }
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
