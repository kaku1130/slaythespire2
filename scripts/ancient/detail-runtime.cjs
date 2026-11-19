// The ancient page uses only its detail frame and the navigation inside it.
module.exports = function ancientDetailRuntime() {
  const data = JSON.parse(document.getElementById('detail-pane-data').textContent);
  const main = document.getElementById('main-content');
  main.classList.add('detail-split', 'ancient-browser');
  const body = document.createElement('div');
  body.className = 'split-body';
  const panel = document.createElement('section');
  panel.className = 'split-detail';
  panel.setAttribute('aria-label', '詳細內容');
  const frame = document.createElement('iframe');
  frame.setAttribute('scrolling', 'no');
  panel.append(frame);
  body.append(panel);
  main.append(body);
  function open(key) {
    const page = data.pages[key];
    if (!page) return;
    frame.title = page.name + '詳細內容';
    const base = new URL('data/ancient/' + key, location.href).href;
    frame.srcdoc = page.html.replace(/<head\b[^>]*>/i, head => head + '<base href="' + base + '">');
  }
  let observer;
  frame.addEventListener('load', () => {
    observer?.disconnect();
    const doc = frame.contentDocument, content = doc?.getElementById('main-content');
    if (!content) return;
    const style = doc.createElement('style');
    style.textContent = 'html,body{min-height:0!important;height:auto!important;overflow:hidden!important}';
    doc.head.append(style);
    const resize = () => {frame.style.height = Math.ceil(content.getBoundingClientRect().height) + 'px';};
    observer = new ResizeObserver(resize);
    observer.observe(content);
    resize();
    main.scrollTo({top:0, behavior:'instant'});
    doc.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        let id;
        try {id = decodeURIComponent(href.slice(1));} catch {return;}
        const target = doc.getElementById(id);
        if (target) {
          event.preventDefault();
          if (id.startsWith('relic-')) {
            for (const item of doc.querySelectorAll('.is-relic-highlighted')) item.classList.remove('is-relic-highlighted');
            target.classList.add('is-relic-highlighted');
          }
          target.style.scrollMarginTop = '16px';
          target.tabIndex = -1;
          target.focus({preventScroll:true});
          target.scrollIntoView({block:'start', behavior:'instant'});
        }
        return;
      }
      const url = new URL(href, doc.baseURI), key = url.pathname.split('/').pop();
      if (data.pages[key]) {
        event.preventDefault();
        open(key);
      } else if (url.href.split('#')[0] === location.href.split('#')[0]) {
        event.preventDefault();
        main.scrollTo({top:0, behavior:'instant'});
      } else {
        link.target = '_blank';
        link.rel = 'noopener';
      }
    });
  });
  open('ancient-neow.html');
};
