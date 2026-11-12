(() => {
  const search = document.getElementById('search');
  if (!search || search.closest('.search-control')) return;
  search.type = 'text';
  search.inputMode = 'search';
  search.setAttribute('role', 'searchbox');
  const style = document.createElement('style');
  style.textContent = `
html body main#main-content .search-control{position:relative;display:block;min-width:0;width:100%;flex:1 1 240px}
html body main#main-content .search-control input#search{display:block;width:100%;max-width:none;margin:0;padding-left:46px!important;box-sizing:border-box}
html body main#main-content .search-control input#search::-webkit-search-cancel-button{display:none;-webkit-appearance:none}
html body main#main-content .search-control>button.search-clear{position:absolute;left:4px;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:36px;height:36px;min-width:36px;min-height:36px;margin:0;padding:7px;border:0!important;border-radius:5px;background:transparent!important;box-shadow:none!important;color:#aab6c4!important;cursor:pointer}
html body main#main-content .search-control>button.search-clear:hover{color:#37a8ec!important;background:#163047!important}
html body main#main-content .search-clear .search-icon{font-size:20px;line-height:1;pointer-events:none}
html body main#main-content:is(.event-browser,.monster-browser) .chapter-filters>.search-control{order:-1;flex:0 0 auto}
`;
  document.head.append(style);
  const field = document.createElement('div');
  field.className = 'search-control';
  search.before(field);
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'search-clear';
  clear.setAttribute('aria-label', '清除搜尋關鍵字');
  clear.title = '清除搜尋關鍵字';
  clear.innerHTML = '<span class="search-icon" aria-hidden="true">🔍</span>';
  field.append(search, clear);
  clear.addEventListener('click', () => {
    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.focus({ preventScroll: true });
  });
})();
