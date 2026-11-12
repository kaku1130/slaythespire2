(() => {
  const media = window.matchMedia('(max-width:1024px), (max-width:1366px) and (hover:none) and (pointer:coarse)');
  const main = document.getElementById('main-content');
  if (!main) return;
  const pageKind = location.pathname.split('/').pop().replace(/\.html$/, '');
  main.dataset.mobilePage = pageKind;
  if (pageKind === 'builds') {
    for (const link of main.querySelectorAll('.tier-index-item')) {
      const panel = document.getElementById(link.hash.slice(1));
      const overview = panel?.querySelector('.build-overview');
      if (!overview) continue;
      const heading = document.createElement('h3');
      heading.className = 'mobile-build-heading';
      const tier = link.querySelector('.build-tier').cloneNode(true);
      tier.removeAttribute('aria-hidden');
      tier.setAttribute('aria-label', tier.textContent.trim() + ' 級');
      heading.append(tier, link.querySelector('.tier-index-name').cloneNode(true));
      panel.prepend(heading);
    }
    const characterBar = main.querySelector('.character-sidebar');
    const updateCharacterHeight = () => main.style.setProperty('--mobile-character-height', characterBar.getBoundingClientRect().height + 'px');
    updateCharacterHeight();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateCharacterHeight).observe(characterBar);
    else window.addEventListener('resize', updateCharacterHeight);
    function scrollToBuild() {
      if (!media.matches) return;
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const panel = document.getElementById(id);
      const heading = panel?.querySelector('.mobile-build-heading');
      if (!heading || panel.hidden || panel.closest('.build-section').hidden) return;
      main.scrollTo({
        top: main.scrollTop + panel.getBoundingClientRect().top - main.getBoundingClientRect().top - 12,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      });
    }
    window.addEventListener('hashchange', () => requestAnimationFrame(scrollToBuild));
    main.addEventListener('click', event => {
      const link = event.target.closest('.tier-index-item');
      if (link && link.hash === location.hash) requestAnimationFrame(scrollToBuild);
    });
    requestAnimationFrame(scrollToBuild);
  }
  // Keep accessible names when the compact layout hides visible labels.
  document.querySelectorAll('.site-brand,.site-nav a,.chips button,.character-nav a,.relic-filters [data-filter-group="pool"],#upgrade-toggle,#aoe-toggle').forEach(el => {
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.trim());
    el.title = el.getAttribute('aria-label');
  });
  if (pageKind === 'relic') {
    const filters = main.querySelector('.relic-filters');
    const groups = [...filters.querySelectorAll(':scope > .relic-filter-group')];
    const menuRow = document.createElement('div');
    menuRow.className = 'relic-menu-row';
    groups[0].before(menuRow);
    menuRow.append(...groups);
  }
  if (pageKind === 'cards') {
    const rarityCluster = main.querySelector('.rarity-cluster');
    const rarities = rarityCluster?.querySelector('.rarity-buttons');
    const colorless = main.querySelector('[data-category="Colorless"]');
    if (rarities && colorless) {
      (main.querySelector('[data-category="Quest"]') || colorless).after(rarities);
      rarityCluster.remove();
    }
    const chips = main.querySelector('.chips');
    const professions = document.createElement('span');
    const others = document.createElement('span');
    professions.className = 'card-profession-row';
    others.className = 'card-other-row';
    professions.setAttribute('role', 'group');
    professions.setAttribute('aria-label', '職業分類');
    others.setAttribute('role', 'group');
    others.setAttribute('aria-label', '其他卡牌分類');
    for (const button of [...chips.querySelectorAll('[data-category]')]) {
      (['Colorless', 'Curse', 'Event', 'Quest'].includes(button.dataset.category) ? others : professions).append(button);
    }
    chips.prepend(professions, others);
  }
  const upgrade = document.getElementById('upgrade-toggle');
  if (upgrade) {
    upgrade.querySelector('span')?.classList.add('desktop-upgrade-icon');
    const plus = document.createElement('span');
    plus.className = 'mobile-upgrade-icon';
    plus.setAttribute('aria-hidden', 'true');
    plus.textContent = '+';
    upgrade.prepend(plus);
  }
  const search = document.getElementById('search');
  const searchNode = search?.closest('.inline-search') || search;
  if (pageKind === 'cards' && searchNode) main.querySelector('#tools')?.prepend(searchNode);
  const searchHome = searchNode && document.createComment('Desktop search position');
  if (searchNode) searchNode.before(searchHome);
  const row = document.createElement('div');
  row.className = 'mobile-search-row';
  const buttons = ['upgrade-toggle', 'aoe-toggle'].map(id => document.getElementById(id)).filter(Boolean);
  buttons.forEach(button => {
    [...button.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => {
      const label = document.createElement('span');
      label.className = 'mobile-toggle-label';
      node.replaceWith(label);
      label.append(node);
    });
  });
  const homes = buttons.map(button => {
    const home = document.createComment('Desktop toggle position');
    button.before(home);
    return home;
  });
  // Keep these pages' filters visible without a collapsible mobile menu.
  const panels = ['builds', 'cards', 'relic', 'potion'].includes(pageKind) ? [] : [...main.querySelectorAll(':scope > .tools,:scope > .filters,:scope > .character-sidebar,:scope > .tier-sidebar')];
  panels.forEach((panel, index) => {
    panel.id ||= 'mobile-filter-panel-' + index;
    panel.classList.add('mobile-filter-panel');
  });
  const menu = document.createElement('button');
  menu.type = 'button';
  menu.className = 'mobile-menu-toggle';
  menu.textContent = '☰';
  menu.setAttribute('aria-label', '展開篩選選單');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-controls', panels.map(panel => panel.id).join(' '));
  main.dataset.mobileFiltersOpen = 'false';
  menu.addEventListener('click', () => {
    const open = main.dataset.mobileFiltersOpen !== 'true';
    main.dataset.mobileFiltersOpen = String(open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '收合篩選選單' : '展開篩選選單');
    if (open) main.scrollTo({top:0, behavior:'instant'});
  });
  let desktopView;
  const sharedAncients = main.querySelector('.ancient-act-section[data-act="0"]');
  const sharedHome = sharedAncients && document.createComment('Desktop shared ancient position');
  if (sharedAncients) sharedAncients.before(sharedHome);
  const chapterButtons = ['monster', 'event'].includes(pageKind) ? [...main.querySelectorAll('[data-filter-group="acts"]')].map(button => ({button, label: button.textContent})) : [];
  const compactChapterLabels = {act1a: '1.密林', act1b: '1.暗港', act2: '2.巢穴', act3: '3.榮耀'};
  function update() {
    for (const {button, label} of chapterButtons) button.textContent = media.matches ? compactChapterLabels[button.dataset.filterValue] || label : label;
    if (pageKind === 'cards') {
      for (const button of main.querySelectorAll('[data-category="Curse"],[data-category="Event"],[data-category="Quest"]')) button.hidden = media.matches;
      const colorless = main.querySelector('[data-category="Colorless"]');
      if (media.matches) main.querySelector('.card-profession-row').append(colorless);
      else main.querySelector('.card-other-row').prepend(colorless);
      const label = media.matches ? '無色、其他' : 'Colorless';
      colorless.setAttribute('aria-label', label);
      colorless.title = label;
      const text = [...colorless.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
      if (text) text.textContent = label;
    }
    if (media.matches) {
      if (sharedAncients) main.querySelector('.ancient-act-column[data-act-column="3"]')?.append(sharedAncients);
      if ((searchNode || panels.length) && !['event', 'monster'].includes(pageKind)) {
        main.prepend(row);
        if (panels.length) row.append(menu);
        if (searchNode && !['event', 'monster'].includes(pageKind)) row.append(searchNode);
      }
      buttons.forEach(button => {
        if (button === upgrade) row.append(button);
        else main.querySelector('[data-type-filter="Skill"]')?.after(button);
      });
      if (document.body.hasAttribute('data-view')) {
        desktopView ??= document.body.dataset.view;
        document.body.dataset.view = 'grid';
      }
    } else {
      if (sharedAncients) sharedHome.after(sharedAncients);
      if (searchNode) searchHome.after(searchNode);
      row.remove();
      buttons.forEach((button, index) => homes[index].after(button));
      if (desktopView !== undefined) {
        document.body.dataset.view = desktopView;
        desktopView = undefined;
      }
    }
    document.querySelectorAll('[data-card-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cardView === document.body.dataset.view)));
  }
  // Prevent the existing double-click shortcut from entering table mode on phones.
  document.addEventListener('dblclick', event => {
    if (media.matches && event.target.closest('.card-image-button')) event.stopImmediatePropagation();
  }, true);
  document.addEventListener('click', event => {
    if (media.matches && (event.target.closest('[data-card-view="table"]') || (event.detail === 0 && event.target.closest('.card-image-button')))) event.stopImmediatePropagation();
  }, true);
  main.addEventListener('click', event => {
    if (media.matches && event.target.closest('.split-list [data-detail-key]')) {
      requestAnimationFrame(() => main.querySelector('.split-detail')?.scrollIntoView({block:'start'}));
    }
  });
  if (['cards', 'relic', 'potion'].includes(pageKind)) {
    const updateSearchHeight = () => main.style.setProperty('--mobile-search-height', row.getBoundingClientRect().height + 'px');
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateSearchHeight).observe(row);
    else window.addEventListener('resize', updateSearchHeight);
    update();
    updateSearchHeight();
  } else update();
  media.addEventListener('change', update);
})();
