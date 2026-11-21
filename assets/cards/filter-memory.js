(() => {
  const main = document.getElementById('main-content');
  if (!main) return;
  const kind = main.querySelector('.relic-filters') ? 'relic'
    : main.querySelector('.potion-filters') ? 'potion'
    : main.querySelector('.build-panel') ? 'build' : null;
  if (!kind) return;
  const key = 'sts2_' + kind + '_filters';
  function read() {
    try {
      const cookie = location.protocol === 'file:' ? null
        : document.cookie.split(';').map(value => value.trim()).find(value => value.startsWith(key + '='));
      const value = location.protocol === 'file:' ? localStorage.getItem(key)
        : cookie ? decodeURIComponent(cookie.slice(key.length + 1)) : null;
      return value ? JSON.parse(value) : null;
    } catch { return null; }
  }
  function write(value) {
    try {
      const text = JSON.stringify(value);
      if (location.protocol === 'file:') localStorage.setItem(key, text);
      else document.cookie = key + '=' + encodeURIComponent(text)
        + '; Max-Age=31536000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    } catch { /* Keep filtering available when browser storage is disabled. */ }
  }
  const saved = read();
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
  const buttons = [...main.querySelectorAll('[data-catalog-filter]')];
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    for (const button of buttons) {
      const values = saved[button.dataset.catalogFilter];
      if (Array.isArray(values)) button.setAttribute('aria-pressed', String(values.includes(button.value)));
    }
    if (typeof window.filter === 'function') window.filter();
  }
  function rememberCatalog() {
    const selected = {};
    for (const button of buttons) {
      const values = selected[button.dataset.catalogFilter] ??= [];
      if (button.getAttribute('aria-pressed') === 'true') values.push(button.value);
    }
    write(selected);
  }
  main.addEventListener('click', event => {
    if (event.target.closest('[data-catalog-filter]')) rememberCatalog();
  });
  main.addEventListener('input', event => {
    if (event.target.id === 'search') rememberCatalog();
  });
})();
