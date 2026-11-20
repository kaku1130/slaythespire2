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
})();
