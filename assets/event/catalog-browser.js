(() => {
  const main = document.getElementById('main-content');
  const filters = main?.querySelector('.chapter-filters');
  const list = main?.querySelector('.split-list');
  const detail = main?.querySelector('.split-detail');
  if (!filters || !list || !detail) return;
  const kind = location.pathname.endsWith('monster.html') ? 'monster' : 'event';
  main.classList.add(kind + '-browser');
  const entries = [...list.querySelectorAll('.entry.' + kind)];
  if (kind === 'monster') {
    const typeOrder = { weak: 0, normal: 1, elite: 2, boss: 3 };
    entries.sort((a, b) => (typeOrder[a.dataset.encounterType] ?? 4) - (typeOrder[b.dataset.encounterType] ?? 4));
  }
  const buttons = [...filters.querySelectorAll('[data-filter-group]')];
  const search = document.getElementById('search');
  const chapterGroup = filters.querySelector('[aria-label="章節篩選"]');
  const typeGroup = filters.querySelector('[aria-label="怪物類型篩選"]');
  chapterGroup.setAttribute('aria-label', '章節單選');
  typeGroup?.setAttribute('aria-label', '怪物類型複選');
  if (kind === 'monster') {
    const options = document.createElement('div');
    options.className = 'monster-filter-options';
    chapterGroup.before(options);
    for (const [group, className] of [[chapterGroup, 'monster-chapter-options'], [typeGroup, 'monster-type-options']]) {
      const row = document.createElement('span');
      row.className = className;
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', group.getAttribute('aria-label'));
      row.append(...group.children);
      options.append(row);
      group.remove();
    }
  }
  for (const button of buttons) {
    if (button.dataset.filterValue === 'weak') button.textContent = '弱怪';
    if (button.dataset.filterValue === 'elite') button.textContent = '精英';
  }
  const choices = document.createElement('div');
  choices.className = 'catalog-choices ' + kind + '-choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', kind === 'monster' ? '怪物單選' : '事件單選');
  for (const entry of entries) {
    if (kind === 'event') {
      const color = getComputedStyle(entry).getPropertyValue('--chapter-color').trim() || '#6ac1b4';
      entry.style.setProperty('--detail-color', color);
      entry.style.setProperty('--chapter-color', color);
      entry.querySelectorAll('img,.event-list-picture').forEach(image => image.remove());
    }
    entry.setAttribute('role', 'button');
    entry.setAttribute('aria-pressed', 'false');
    choices.append(entry);
  }
  const empty = document.getElementById('empty');
  list.replaceChildren(filters, choices, empty);
  filters.prepend(search);
  detail.hidden = true;
  const compact = matchMedia('(max-width:1024px), (max-width:1366px) and (hover:none) and (pointer:coarse)');
  const desktop = () => !compact.matches;
  const chapterLabels = new Map(buttons
    .filter(button => button.dataset.filterGroup === 'acts')
    .map(button => [button, button.textContent.replace(/^第[一二三四五六七八九十\d]+章[・\s]*/, '')]));
  const step = kind === 'event' ? 'eventStep' : 'monsterStep';
  let chapter = 'act1a';
  const types = new Set(kind === 'monster' ? ['elite', 'boss'] : []);

  function showSelectionList() {
    const ready = kind === 'event' ? chapter !== null : types.size > 0;
    main.dataset[step] = ready ? 'list' : kind === 'event' ? 'chapter' : 'strength';
    detail.hidden = true;
    choices.scrollTop = 0;
    for (const entry of entries) {
      entry.classList.remove('is-detail-selected');
      entry.removeAttribute('aria-current');
      entry.setAttribute('aria-pressed', 'false');
    }
  }

  if (desktop()) showSelectionList();
  compact.addEventListener('change', () => {
    if (desktop()) showSelectionList();
    else {
      delete main.dataset[step];
      chapter ??= 'act1a';
    }
    filter();
  });
  function filter() {
    for (const [button, label] of chapterLabels) {
      button.textContent = desktop() ? label.replaceAll('・', '') : label;
    }
    const query = search.value.trim().toLowerCase();
    const chapterButton = buttons.find(button => button.dataset.filterGroup === 'acts' && button.dataset.filterValue === chapter);
    const chapterColor = chapterButton?.style.getPropertyValue('--selection-color');
    let count = 0;
    for (const entry of entries) {
      if (kind === 'event' && chapterColor) {
        entry.style.setProperty('--detail-color', chapterColor);
        entry.style.setProperty('--chapter-color', chapterColor);
      }
      entry.hidden = !entry.dataset.acts.split('|').includes(chapter)
        || (types.size > 0 && !types.has(entry.dataset.encounterType))
        || !entry.textContent.toLowerCase().includes(query);
      if (!entry.hidden) count++;
      if (entry.hidden && entry.classList.contains('is-detail-selected')) {
        entry.classList.remove('is-detail-selected');
        entry.removeAttribute('aria-current');
        entry.setAttribute('aria-pressed', 'false');
        detail.hidden = true;
      }
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(
      button.dataset.filterGroup === 'acts'
        ? button.dataset.filterValue === chapter : types.has(button.dataset.filterValue)
    ));
    empty.hidden = count > 0;
  }
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter-group]');
    if (!button) return;
    event.stopImmediatePropagation();
    if (button.dataset.filterGroup === 'acts') {
      chapter = button.dataset.filterValue;
    } else {
      const type = button.dataset.filterValue;
      const returningFromDetail = desktop() && main.dataset[step] === 'detail';
      if (!types.has(type)) types.add(type);
      else if (!returningFromDetail) types.delete(type);
    }
    if (desktop()) showSelectionList();
    filter();
  }, true);
  search.addEventListener('input', event => {
    event.stopImmediatePropagation();
    if (desktop()) showSelectionList();
    filter();
  }, true);
  function select(event) {
    const entry = event.target.closest('[data-detail-key]');
    if (!entry || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    for (const item of entries) item.setAttribute('aria-pressed', String(item === entry));
    detail.hidden = false;
    if (desktop()) main.dataset[step] = 'detail';
  }
  list.addEventListener('click', select);
  list.addEventListener('keydown', select);
  filter();
})();
