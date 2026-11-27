(() => {
  const main = document.getElementById('main-content');
  if (!main) return;
  const kind = main.querySelector('.enchantment-filters') ? 'enchantments'
    : main.querySelector('.relic-filters') ? 'relic'
    : main.querySelector('.potion-filters') ? 'potion'
    : main.querySelector('.monster-filters') ? 'monster'
    : main.querySelector('[data-character-panel]') ? 'characters'
    : main.querySelector('.build-panel') ? 'build' : null;
  if (!kind) return;
  const key = 'sts2_' + kind + '_filters';
  const isFile = new URL(document.baseURI).protocol === 'file:';
  function read() {
    try {
      const cookie = isFile ? null
        : document.cookie.split(';').map(value => value.trim()).find(value => value.startsWith(key + '='));
      const value = isFile ? localStorage.getItem(key)
        : cookie ? decodeURIComponent(cookie.slice(key.length + 1)) : null;
      return value ? JSON.parse(value) : null;
    } catch { return null; }
  }
  function write(value) {
    try {
      const text = JSON.stringify(value);
      if (isFile) localStorage.setItem(key, text);
      else document.cookie = key + '=' + encodeURIComponent(text)
        + '; Max-Age=31536000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    } catch { /* Keep filtering available when browser storage is disabled. */ }
  }
  const saved = read();
  if (kind === 'characters') {
    if (typeof saved?.route === 'string') window.restoreCharacterRoute?.(saved.route.replace(/^#/, ''));
    function rememberCharacter() {
      const panel = main.querySelector('[data-character-panel]:not([hidden])');
      write({route:location.hash || (panel ? '#' + panel.id : '#characters')});
    }
    window.addEventListener('hashchange', rememberCharacter);
    rememberCharacter();
    return;
  }
  if (kind === 'build') {
    if (!location.hash && saved && typeof saved.pool === 'string') {
      const section = [...main.querySelectorAll('.build-section')].find(item => item.dataset.pool === saved.pool);
      if (section && typeof window.selectCharacter === 'function') {
        const panel = [...section.querySelectorAll('.build-panel')].find(item => item.id === saved.build);
        window.selectCharacter(saved.pool, panel?.id || '');
      }
    }
    function rememberBuild() {
      const selected = main.querySelector('.character-nav [aria-current=page]');
      const panel = main.querySelector('.build-panel.is-selected');
      if (selected) write({pool:selected.dataset.character, build:panel?.id || ''});
    }
    window.addEventListener('hashchange', rememberBuild);
    rememberBuild();
    return;
  }
  const search = main.querySelector('#search');
  const buttons = [...main.querySelectorAll('[data-catalog-filter],.monster-filters button')];
  const group = button => button.dataset.catalogFilter || 'area';
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    if (search && typeof saved.search === 'string') search.value = saved.search;
    for (const button of buttons) {
      const values = saved[group(button)];
      if (Array.isArray(values)) button.setAttribute('aria-pressed', String(values.includes(button.value)));
    }
    if (kind === 'monster') {
      const selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true');
      if (selected) selected.click();
      else search?.dispatchEvent(new Event('input', {bubbles:true}));
    }
    if (typeof window.filter === 'function') window.filter();
  }
  function rememberCatalog() {
    const selected = {search:search?.value || ''};
    for (const button of buttons) {
      const values = selected[group(button)] ??= [];
      if (button.getAttribute('aria-pressed') === 'true') values.push(button.value);
    }
    write(selected);
  }
  main.addEventListener('click', event => {
    if (event.target.closest('[data-catalog-filter],.monster-filters button')) rememberCatalog();
  });
  main.addEventListener('input', event => {
    if (event.target.id === 'search') rememberCatalog();
  });
  rememberCatalog();
})();
