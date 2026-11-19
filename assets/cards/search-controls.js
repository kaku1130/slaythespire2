(() => {
  if (window.parent !== window) return;
  const main = document.getElementById('main-content');
  if (!main) return;
  let search = document.getElementById('search');
  const buildPage = !!main.querySelector('.build-panel');
  const ancientPage = main.classList.contains('ancient-browser');
  if (buildPage || ancientPage || /\/data\/ancient\//.test(location.pathname)) return;
  const highlightPage = !search;
  let status;
  if (!search) {
    const toolbar = document.createElement('div');
    toolbar.className = 'shared-page-search';
    search = document.createElement('input');
    search.id = 'search';
    search.type = 'search';
    search.placeholder = '搜尋關鍵字';
    search.setAttribute('aria-label', '搜尋頁面內容');
    status = document.createElement('span');
    status.className = 'shared-search-status';
    status.setAttribute('aria-live', 'polite');
    toolbar.append(search, status);
    main.prepend(toolbar);
  }
  if (!search) return;
  const style = document.createElement('style');
  style.textContent = `
.shared-page-search{display:flex;flex:0 0 auto;align-items:center;gap:12px;width:100%;min-width:0;margin:0 0 8px}
.shared-page-search input#search{box-sizing:border-box;width:100%;min-width:0;height:48px;padding:8px 14px;border:1px solid #293340;border-radius:7px;background:#0d131a;color:#e3e8ee;font:20px/1.4 Arial,"Microsoft JhengHei",sans-serif}
.shared-search-status{flex:0 0 auto;color:#9aabbf;font-size:14px}
.shared-search-status:empty{display:none}
mark.shared-search-match{background:#184e35;color:#a8f0bf;border-radius:2px}
`;
  document.head.append(style);

  const frameDocuments = new Set();
  function highlightAncient() {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    for (const doc of [document, ...frameDocuments]) {
      const root = doc.getElementById('main-content');
      if (!root) continue;
      for (const mark of root.querySelectorAll('mark.shared-search-match')) mark.replaceWith(doc.createTextNode(mark.textContent));
      root.normalize();
      if (!query) continue;
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const texts = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.parentElement.closest('script,style,input,textarea,select,.shared-page-search,.site-header,[hidden]') && node.textContent.toLowerCase().includes(query)) texts.push(node);
      }
      for (const node of texts) {
        const fragment = doc.createDocumentFragment();
        const text = node.textContent, lower = text.toLowerCase();
        let start = 0, index;
        while ((index = lower.indexOf(query, start)) >= 0) {
          fragment.append(doc.createTextNode(text.slice(start,index)));
          const mark = doc.createElement('mark');
          mark.className = 'shared-search-match';
          mark.textContent = text.slice(index,index + query.length);
          fragment.append(mark);
          start = index + query.length;
          count++;
        }
        fragment.append(doc.createTextNode(text.slice(start)));
        node.replaceWith(fragment);
      }
    }
    status.textContent = query ? count + ' 處符合' : '';
  }
  if (highlightPage) search.addEventListener('input', highlightAncient);

  const boundDocuments = new WeakSet();
  function bindDocument(doc) {
    if (boundDocuments.has(doc)) return;
    boundDocuments.add(doc);
    let pendingClick;
    const replayedClicks = new WeakSet();
    // Keep a text link's first click from navigating before a double-click.
    doc.addEventListener('click', event => {
      if (replayedClicks.has(event)) return;
      const target = event.target;
      const clickable = target.closest?.('main a[href],main [data-detail-key]');
      if (!clickable || !clickable.textContent.trim() || target.closest('img,svg,button,input,select,textarea') || clickable.closest('.site-header,.site-attribution') || event.button !== 0 || !event.detail || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      clearTimeout(pendingClick);
      if (event.detail > 1) return;
      pendingClick = setTimeout(() => {
        const replay = new doc.defaultView.MouseEvent('click', {bubbles:true,cancelable:true,view:doc.defaultView,detail:1,button:0});
        replayedClicks.add(replay);
        target.dispatchEvent(replay);
      }, 400);
    }, true);
    doc.addEventListener('dblclick', event => {
      const target = event.target;
      if (!(target instanceof doc.defaultView.Element) || !target.closest('main') || target.closest('input,textarea,select,button,[contenteditable=true],.site-header')) return;
      clearTimeout(pendingClick);
      // Native word selection is finalized after the dblclick event.
      setTimeout(() => {
        const selection = doc.defaultView.getSelection();
        const selected = selection?.rangeCount && !selection.isCollapsed && selection.getRangeAt(0).intersectsNode(target) ? selection.toString() : '';
        const text = selected.replace(/\s+/g,' ').trim() || target.textContent.replace(/\s+/g,' ').trim();
        if (!text) return;
        const card = target.closest('tr[data-id]');
        if (card) search.dataset.preferredPool = card.closest('section[data-pool]')?.dataset.pool || '';
        search.value = text;
        search.dispatchEvent(new Event('input', {bubbles:true}));
        search.focus({preventScroll:true});
      }, 0);
    }, true);
  }
  bindDocument(document);
  const boundFrames = new WeakSet();
  function watchFrames() {
    for (const frame of main.querySelectorAll('iframe')) {
      if (boundFrames.has(frame)) continue;
      boundFrames.add(frame);
      let previous;
      const bind = () => {
        try {
          const doc = frame.contentDocument;
          if (!doc) return;
          if (previous) frameDocuments.delete(previous);
          previous = doc;
          frameDocuments.add(doc);
          bindDocument(doc);
          if (!doc.querySelector('[data-shared-search-style]')) {
            const css = doc.createElement('style');
            css.dataset.sharedSearchStyle = '';
            css.textContent = 'mark.shared-search-match{background:#184e35;color:#a8f0bf;border-radius:2px}';
            doc.head?.append(css);
          }
          if (highlightPage && search.value) highlightAncient();
        } catch { /* Cross-origin embedded content is outside this page's search. */ }
      };
      frame.addEventListener('load', bind);
      bind();
    }
  }
  watchFrames();
  new MutationObserver(watchFrames).observe(main, {childList:true,subtree:true});
})();

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
html body main#main-content:is(.event-browser,.monster-browser,.encounter-browser) .chapter-filters>.search-control{order:-1;flex:0 0 auto}
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

(() => {
  const main = document.getElementById('main-content');
  const search = document.getElementById('search');
  const toolbar = search?.closest('.catalog-search-tools');
  const kind = main?.querySelector('.relic-filters') ? 'relic' : main?.querySelector('.potion-filters') ? 'potion' : null;
  if (!kind || !toolbar || toolbar.querySelector('.catalog-random')) return;
  const style = document.createElement('style');
  style.textContent = `
html body main#main-content .filters .catalog-search-tools:has(.catalog-random) {display:grid;grid-template-columns:minmax(0,1fr) 52px;gap:8px;align-items:center}
html body main#main-content .catalog-search-tools:has(.catalog-random)>.search-control {width:100%;min-width:0}
html body main#main-content .filters .catalog-search-tools>button.catalog-random {box-sizing:border-box;display:flex;align-items:center;justify-content:center;width:52px;min-width:52px;height:48px;min-height:48px;margin:0;padding:8px;border:1px solid #6faeee;border-radius:7px;background:#0d131a;color:#e3e8ee;font:22px/1 Arial,sans-serif;cursor:pointer}
html body main#main-content .filters .catalog-search-tools>button.catalog-random:is(:hover,:focus-visible) {border-color:#37a8ec;background:#163047;outline-offset:2px}
`;
  document.head.append(style);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'catalog-random';
  button.textContent = '🎲';
  button.title = kind === 'relic' ? '隨機遺物' : '隨機藥水';
  button.setAttribute('aria-label', button.title);
  toolbar.append(button);
  button.addEventListener('click', () => {
    const names = [...main.querySelectorAll(kind === 'relic' ? '.entry.relic .relic-name-en' : '.entry.potion .catalog-name-en')]
      .map(name => name.textContent.trim()).filter(Boolean);
    if (!names.length) return;
    for (const filter of main.querySelectorAll('[data-catalog-filter]')) filter.setAttribute('aria-pressed','false');
    search.value = '"' + names[Math.floor(Math.random() * names.length)] + '"';
    search.dispatchEvent(new Event('input', {bubbles:true}));
  });
})();
