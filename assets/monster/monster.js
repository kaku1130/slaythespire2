(() => {
  const search = document.getElementById('search');
  const buttons = [...document.querySelectorAll('.monster-filters[aria-label=Area] button')];
  const sections = [...document.querySelectorAll('.monster-region')];
  let region = 'Overgrowth';
  function filter() {
    const query = search.value.trim().toLowerCase();
    let total = 0;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.value === region));
    for (const section of sections) {
      let count = 0;
      for (const card of section.querySelectorAll('.monster-card')) {
        card.hidden = card.dataset.region !== region || !card.dataset.search.includes(query);
        if (!card.hidden) count++;
      }
      for (const group of section.querySelectorAll('.monster-category')) {
        group.hidden = !group.querySelector('.monster-card:not([hidden])');
      }
      section.hidden = count === 0;
      total += count;
    }
    document.getElementById('monster-empty').hidden = total !== 0;
  }
  for (const button of buttons) button.addEventListener('click', () => {
    region = button.value;
    filter();
  });
  search.addEventListener('input', filter);
  document.getElementById('monster-search-clear').addEventListener('click', () => {
    search.value = '';
    filter();
    search.focus();
  });
  filter();
})();
