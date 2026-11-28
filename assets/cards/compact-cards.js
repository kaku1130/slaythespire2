(() => {
  const desktop = matchMedia('(min-width: 1441px), (width > 1024px) and (hover: hover) and (pointer: fine)');

  function update() {
    document.body.classList.toggle('cards-desktop', desktop.matches);
  }

  desktop.addEventListener('change', update);
  update();

  const titleWidths = new WeakMap();
  function fitEnglishTitle(title) {
    const name = title.querySelector('.detail-name-en');
    if (!name || !title.clientWidth) return;
    const size = parseFloat(getComputedStyle(title).fontSize);
    name.style.fontSize = size + 'px';
    const group = name.closest('.detail-name-tier');
    const tier = group && getComputedStyle(group).flexDirection !== 'column' ? group.querySelector('.detail-tier-label') : null;
    const gap = tier ? parseFloat(getComputedStyle(group).columnGap) : 0;
    const available = Math.max(1, title.clientWidth - gap - (tier ? tier.getBoundingClientRect().width : 0) - 1);
    const naturalWidth = name.scrollWidth;
    if (naturalWidth > available) {
      const fittedSize = size * available / naturalWidth;
      name.style.fontSize = fittedSize + 'px';
    }
    titleWidths.set(title, title.clientWidth);
  }
  const titles = [...document.querySelectorAll('[data-catalog-layout] .detail-title')];
  const titleObserver = new ResizeObserver(entries => {
    for (const {target} of entries) {
      if (titleWidths.get(target) !== target.clientWidth) fitEnglishTitle(target);
    }
  });
  for (const title of titles) {
    fitEnglishTitle(title);
    titleObserver.observe(title);
  }
  document.fonts.ready.then(() => titles.forEach(fitEnglishTitle));

  function updateCardImages(card) {
    for (const image of card.querySelectorAll('[data-card-image-version]')) {
      image.hidden = image.dataset.cardImageVersion !== card.dataset.effectVersion
        || Boolean(image.dataset.cardVariant && image.dataset.cardVariant !== card.dataset.cardVariant);
    }
  }
  document.addEventListener('click', event => {
    const arrow = event.target.closest('[data-card-variant-step]');
    if (!arrow) return;
    const card = arrow.closest('[data-catalog-layout]');
    const art = card?.querySelector('[data-card-variants]');
    if (!art) return;
    const variants = JSON.parse(art.dataset.cardVariants);
    const current = variants.findIndex(variant => variant.slug === card.dataset.cardVariant);
    const index = (current + Number(arrow.dataset.cardVariantStep) + variants.length) % variants.length;
    const variant = variants[index];
    card.dataset.cardVariant = variant.slug;
    updateCardImages(card);
    const source = card.querySelector('.detail-untapped-link');
    if (source) {
      source.href = variant.source;
      source.title = card.dataset.cardNameEn + ' (' + variant.label + ') · Untapped.gg';
    }
    const status = card.querySelector('[data-card-variant-status]');
    if (status) status.textContent = (index + 1) + ' / ' + variants.length + ' · ' + variant.label;
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-card-version]');
    if (!button || button.disabled) return;
    const card = button.closest('[data-catalog-layout]');
    if (!card) return;
    const stateAttribute = button.getAttribute('role') === 'switch' ? 'aria-checked' : 'aria-pressed';
    const upgraded = button.getAttribute(stateAttribute) !== 'true';
    const version = upgraded ? 'upgraded' : 'base';
    button.setAttribute(stateAttribute, String(upgraded));
    card.dataset.effectVersion = version;
    updateCardImages(card);
    for (const panel of card.querySelectorAll('.detail-effect-panel')) {
      panel.hidden = panel.getAttribute('aria-label').toLowerCase() !== version;
    }
    for (const cost of card.querySelectorAll('[data-cost-version]')) {
      cost.hidden = cost.dataset.costVersion !== version;
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
