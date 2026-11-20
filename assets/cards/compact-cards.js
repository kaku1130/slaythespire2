(() => {
  const desktop = matchMedia('(min-width: 1441px), (width > 1024px) and (hover: hover) and (pointer: fine)');

  function update() {
    document.body.classList.toggle('cards-desktop', desktop.matches);
  }

  desktop.addEventListener('change', update);
  update();

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
