const fs = require('node:fs');
const stsDetails = require('../../data/monster/sts-gg-details.json');
const stsMonsters = 'https://sts.gg/v2/monsters';

const types = { Boss: 'boss', 菁英: 'elite', 一般: 'normal', 弱化: 'weak', 召喚物: 'summon' };


const actLabels = { 'e-act1a': '密林', 'e-act1b': '暗港', 'e-act2': '巢穴', 'e-act3': '榮耀' };
const typeLabels = { boss: 'Boss', elite: 'Elite', normal: 'Normal', weak: 'Weak' };

function renderFilters(acts) {
  const options = (items, selectedValue) => items.map(([value, label]) => '<option value="' + value + '"' + (value === selectedValue ? ' selected' : '') + '>' + label + '</option>').join('');
  return '<div class="encounter-filters" lang="en">'
    + '<label>Type<select id="encounter-type" aria-label="Type">' + options([['', 'All'], ...Object.entries(typeLabels)], 'boss') + '</select></label>'
    + '<label lang="zh-Hant">章節<select id="encounter-act" aria-label="章節">' + options([['', 'All'], ...acts.map(id => [id, actLabels[id]])]) + '</select></label></div>';
}


function renderMonsterCards(encounters) {
  const cards = new Map();
  for (const [, type, title, members] of encounters.matchAll(/<article class="encounter" data-type="([^"]+)"><h3>(.*?)<\/h3><div class="encounter-members">(.*?)<\/div><\/article>/gs)) {
    if (type === 'summon') continue;
    const encounterName = title.replace(/<[^>]+>/g, '').trim();
    for (const [, href, attrs, localImage, name] of members.matchAll(/<a class="encounter-member" href="([^"]+)"([^>]*)><img[^>]*src="([^"]+)"[^>]*><span>([^<]+)(?:<small>([^<]+)<\/small>)?<\/span><\/a>/g)) {
      // The middle segment represents the Decimillipede in the monster list.
      if (/monster-decimillipede-segment-(?:front|back)\.html$/.test(href)) continue;
      const key = type + ':' + href;
      const existing = cards.get(key);
      if (existing) {
        existing.encounters.push(encounterName);
        continue;
      }
      const imageName = localImage.match(/\/images\/([a-z0-9_]+)\.webp$/i)?.[1];
      const portrait = imageName
        ? 'https://sts.gg/_ipx/q_70%26s_200x200/images/sts2/monsters/' + imageName + '.png'
        : localImage;
      cards.set(key, { type, href, attrs, name, localImage, portrait, encounters: [encounterName] });
    }
  }
  return [...cards.values()].map(card => {
    const context = card.encounters.join(' ').replaceAll('"', '&quot;');
    const label = typeLabels[card.type];
    const slug = card.href.match(/monster-([^/]+)\.html$/)?.[1];
    const href = Object.hasOwn(stsDetails, slug) ? stsMonsters + '/' + slug : stsMonsters;
    return '<article class="encounter monster-card" data-type="' + card.type + '" data-encounter-name="' + context + '">'
      + '<a class="encounter-member monster-card-link" href="' + href + '" target="_blank" rel="noopener noreferrer"' + card.attrs + '>'
      + '<div class="monster-card-portrait"><img src="' + card.portrait + '" data-local-portrait="' + card.localImage + '" alt="" loading="lazy"></div>'
      + '<div class="monster-card-body"><h3>' + card.name + '</h3><span class="encounter-type" lang="en">' + label + '</span>'
      + '</div></a></article>';
  }).join('');
}

function render(items, assets, esc) {
  const source = fs.readFileSync('data/monster/source/index.html', 'utf8');
  const main = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  const monsters = new Map(items.map(monster => [monster.slug, monster]));
  const sections = [...main.matchAll(/<section><h2 id="(e-act\w+)"[^>]*>([^<]+)[\s\S]*?<\/h2>([\s\S]*?)<\/section>/g)];
  if (!sections.length) throw Error('Missing encounter sections in the saved monster index');

  const chapters = sections.map(([, id, , body]) => {
    const encounters = [...body.matchAll(/<div class="bg-card border border-border rounded-lg p-4">([\s\S]*?)(?=<div class="bg-card border border-border rounded-lg p-4">|$)/g)];
    if (!encounters.length) throw Error('Missing encounters for ' + id);
    const cards = encounters.map(([, encounter]) => {
      const [, type, name, count] = encounter.match(/<span[^>]*>([^<]+)<\/span><span[^>]*>([^<]+)<\/span><span[^>]*>\(<!-- -->(\d+)<!-- -->\)<\/span>/);
      if (type === '召喚物' && /^\(summoned by\s+Byrdonis\)$/.test(name)) return '';
      const slots = [...encounter.matchAll(/<a [^>]*href="\/zh-TW\/monster\/([^"]+)"[^>]*>([\s\S]*?)<\/a>|<span[^>]*>隨機<\/span>/g)];
      if (!types[type] || slots.length !== Number(count)) throw Error('Invalid encounter slots for ' + name);
      const members = slots.map(([, slug, html]) => {
        if (!slug) return '<span class="encounter-member encounter-random">? 隨機</span>';
        const monster = monsters.get(slug);
        const portrait = html.match(/<img alt="([^"]*)"[^>]*src="([^"]+)"/);
        const image = assets[monster?.imagePath || monster?.image || portrait?.[2]] || 'assets/event/no-image.svg';
        const label = monster?.name || portrait?.[1] || slug;
        const hp = monster?.minHp > 0
          ? monster.minHp + (monster.maxHp !== monster.minHp ? '–' + monster.maxHp : '') + ' HP'
          : html.match(/>([\d-]+ HP)<\/span>/)?.[1];
        const detail = 'data/monster/monster-' + slug + '.html';
        if (!monster && !fs.existsSync(detail)) throw Error('Missing monster detail for ' + slug);
        return `<a class="encounter-member" href="${detail}"><img src="${esc(image)}" alt="" loading="lazy"><span>${esc(label)}${hp ? '<small>' + esc(hp) + '</small>' : ''}</span></a>`;
      }).join('');
      return `<article class="encounter" data-type="${types[type]}"><h3><span class="encounter-type">${esc(typeLabels[types[type]] || type)}</span> ${esc(name)} <small>(${count})</small></h3><div class="encounter-members">${members}</div></article>`;
    }).join('');
    return `<section class="encounter-chapter" id="${id}"><div class="encounter-grid">${renderMonsterCards(cards)}</div></section>`;
  }).join('');
  return renderFilters(sections.map(([, id]) => id)) + '<div class="encounter-grid encounter-results">' + chapters + '</div>';
}

function filterEncounters() {
  const search = document.getElementById('search');
  const chapters = document.querySelectorAll('.encounter-chapter');
  const menu = document.querySelector('.encounter-filters');
  const type = document.getElementById('encounter-type');
  const act = document.getElementById('encounter-act');
  function restorePortrait(image) {
    const local = image.dataset.localPortrait;
    if (local && image.getAttribute('src') !== local) image.src = local;
  }
  for (const image of document.querySelectorAll('img[data-local-portrait]')) {
    image.addEventListener('error', () => restorePortrait(image), { once: true });
    if (image.complete && !image.naturalWidth) restorePortrait(image);
  }
  search.after(menu);

  function filter() {
    const query = search.value.trim().toLowerCase();
    let total = 0;
    for (const chapter of chapters) {
      let count = 0;
      for (const encounter of chapter.querySelectorAll('.encounter')) {
        encounter.hidden = (type.value !== '' && encounter.dataset.type !== type.value) || !(encounter.textContent + ' ' + (encounter.dataset.encounterName || '')).toLowerCase().includes(query);
        if (!encounter.hidden) count++;
      }
      chapter.hidden = (act.value !== "" && chapter.id !== act.value) || count === 0;
      if (!chapter.hidden) total += count;
    }
    document.getElementById('empty').hidden = total > 0;
  }
  function resetDetail() {
    const panel = document.querySelector('.split-detail');
    if (panel) panel.hidden = true;
    const list = document.querySelector('.split-list');
    if (list) list.hidden = false;
    for (const member of document.querySelectorAll('.encounter-member[aria-current]')) {
      member.removeAttribute('aria-current');
      member.classList.remove('is-detail-selected');
    }
  }
  search.addEventListener('input', () => {
    resetDetail();
    filter();
  });
  for (const select of [type, act]) select.addEventListener('change', () => {
    resetDetail();
    filter();
    document.querySelector('.split-list')?.scrollTo(0, 0);
  });
  filter();
}

module.exports = { render, renderFilters, renderMonsterCards, script: '(' + filterEncounters.toString() + ')();' };

module.exports.styles = `
.encounter-browser .split-list { border: 0; }
.encounter-browser .encounter-filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.encounter-filters label {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  position: relative;
  gap: 8px;
  color: #fff;
  font: 600 14px/1.6 Arial, "Microsoft JhengHei", sans-serif;
  min-width: 0;
}
@media screen and (max-width: 599px), screen and (pointer: coarse) and (max-width: 1400px) {
  .encounter-browser .encounter-filters {
    grid-template-columns: minmax(0, 1fr);
    max-width: none;
  }
  .encounter-filters label { grid-template-columns: 5rem minmax(0, 1fr); }
}
@media screen and (pointer: coarse) and (min-width: 744px) and (max-width: 1400px) and (min-height: 501px) {
  .encounter-browser .encounter-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.encounter .encounter-type {
  display: inline-block;
  padding: 2px 7px;
  border: 1px solid color-mix(in srgb, var(--type-color, #aab6c4) 45%, transparent);
  border-radius: 5px;
  background: color-mix(in srgb, var(--type-color, #aab6c4) 12%, transparent);
  color: var(--type-color, #aab6c4);
  font-size: 12px;
  font-weight: 600;
}
.encounter[data-type=boss] { --type-color: #dc6c68; }
.encounter-filters #encounter-type option[value=boss],
main#main-content .chapter-filters #encounter-type:has(option[value=boss]:checked) { color: #dc6c68; }
.encounter[data-type=elite] { --type-color: #e3bf72; }
.encounter-filters #encounter-type option[value=elite],
main#main-content .chapter-filters #encounter-type:has(option[value=elite]:checked) { color: #e3bf72; }
.encounter[data-type=normal] { --type-color: #6faeee; }
.encounter-filters #encounter-type option[value=normal],
main#main-content .chapter-filters #encounter-type:has(option[value=normal]:checked) { color: #6faeee; }
.encounter[data-type=weak] { --type-color: #70bf8b; }
.encounter-filters #encounter-type option[value=weak],
main#main-content .chapter-filters #encounter-type:has(option[value=weak]:checked) { color: #70bf8b; }
`;

module.exports.styles += `
.encounter-browser .encounter-grid {
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}
@media (min-width: 768px) {
  .encounter-browser .encounter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 768px) and (max-width: 950px) and (pointer: coarse) and (max-height: 480px) {
  .encounter-browser .encounter-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (min-width: 960px) {
  .encounter-browser .encounter-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (min-width: 1150px) {
  .encounter-browser .encounter-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (min-width: 1360px) {
  .encounter-browser .encounter-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
.encounter.monster-card { padding: 0; overflow: hidden; }
.monster-card:hover, .monster-card:focus-within {
  border-color: var(--type-color, var(--muted));
}
.monster-card .monster-card-link {
  display: block;
  height: 100%;
  padding: 0;
  border-radius: inherit;
  background: none;
  color: var(--ink);
  text-decoration: none;
}
.monster-card .monster-card-link:focus-visible { outline-offset: -3px; }
.monster-card-portrait {
  display: grid;
  place-items: center;
  height: 176px;
  padding: 8px;
  background: var(--bg, #040609);
}
.monster-card .monster-card-portrait img {
  width: 160px;
  max-width: 100%;
  height: 160px;
  object-fit: contain;
}
.monster-card-body { padding: 10px 12px 12px; text-align: center; }
main#main-content .monster-card h3 { margin: 0 0 6px; overflow-wrap: anywhere; }
`;

module.exports.styles += `
.encounter-browser .encounter-results > .encounter-chapter:not([hidden]),
.encounter-browser .encounter-results > .encounter-chapter > .encounter-grid {
  display: contents;
}
`;
