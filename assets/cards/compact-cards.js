(() => {
  const main = document.getElementById('main-content');
  const tools = document.getElementById('tools');
  const search = main.querySelector('.card-search');
  const aoe = document.getElementById('aoe-toggle');
  if (!tools || !search || !aoe) return;
  const searchHome = document.createComment('Full-size search position');
  const aoeHome = document.createComment('Full-size AOE position');
  search.before(searchHome);
  aoe.before(aoeHome);
  const media = matchMedia('(max-width:768px), (orientation:landscape) and (max-width:1133px) and (max-height:768px)');
  function update() {
    if (media.matches) {
      tools.before(search);
      tools.append(aoe);
    } else {
      searchHome.after(search);
      aoeHome.after(aoe);
    }
  }
  media.addEventListener('change', update);
  update();
})();
