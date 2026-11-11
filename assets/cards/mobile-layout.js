(() => {
  const media = window.matchMedia('(max-width:760px)');
  const main = document.getElementById('main-content');
  if (!main) return;
  const pageKind = location.pathname.split('/').pop().replace(/\.html$/, '');
  main.dataset.mobilePage = pageKind;
  // Keep accessible names when the compact layout hides visible labels.
  document.querySelectorAll('.site-brand,.site-nav a,.chips button,.relic-filters [data-filter-group="pool"],#upgrade-toggle,#aoe-toggle').forEach(el => {
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.trim());
    el.title = el.getAttribute('aria-label');
  });
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
  const panels = pageKind === 'builds' ? [] : [...main.querySelectorAll(':scope > .tools,:scope > .filters,:scope > .character-sidebar,:scope > .tier-sidebar')];
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
  function update() {
    if (media.matches) {
      if (sharedAncients) main.querySelector('.ancient-act-column[data-act-column="3"]')?.append(sharedAncients);
      if (searchNode || panels.length) {
        main.prepend(row);
        if (panels.length) row.append(menu);
        if (searchNode) row.append(searchNode);
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
  update();
  media.addEventListener('change', update);
})();
