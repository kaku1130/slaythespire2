(() => {
  const search = document.querySelector('.card-search');
  const aoe = document.getElementById('aoe-toggle');
  if (!search || !aoe) return;
  const aoeRow = aoe.parentElement;
  const desktop = matchMedia('(min-width: 1441px), (width > 1024px) and (hover: hover) and (pointer: fine)');

  function update() {
    document.body.classList.toggle('cards-desktop', desktop.matches);
    (desktop.matches ? search : aoeRow).append(aoe);
    aoeRow.hidden = desktop.matches;
  }

  desktop.addEventListener('change', update);
  update();
})();
