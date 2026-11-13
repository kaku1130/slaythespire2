const fs = require('node:fs');

const types = { Boss: 'boss', 菁英: 'elite', 一般: 'normal', 弱化: 'weak', 召喚物: 'summon' };

function render(items, assets, esc) {
  const source = fs.readFileSync('data/monster/source/index.html', 'utf8');
  const main = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  const monsters = new Map(items.map(monster => [monster.slug, monster]));
  const sections = [...main.matchAll(/<section><h2 id="(e-act\w+)"[^>]*>([^<]+)[\s\S]*?<\/h2>([\s\S]*?)<\/section>/g)];
  if (!sections.length) throw Error('Missing encounter sections in the saved monster index');

  const links = sections.map(([, id, title], index) =>
    `<button type="button" data-encounter-chapter="${id}" aria-pressed="${index === 0}">${esc(title.replace(/^第.章 - /, ''))}</button>`
  ).join('');
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
      return `<article class="encounter" data-type="${types[type]}"><h3><span class="encounter-type">${esc(type === '弱化' ? '弱怪' : type)}</span> ${esc(name)} <small>(${count})</small></h3><div class="encounter-members">${members}</div></article>`;
    }).join('');
    return `<section class="encounter-chapter" id="${id}"><div class="encounter-grid">${cards}</div></section>`;
  }).join('');
  return '<div class="encounter-nav chapter-filter-group" role="group" aria-label="章節單選">' + links + '</div>' + chapters;
}

function filterEncounters() {
  const search = document.getElementById('search');
  const chapters = document.querySelectorAll('.encounter-chapter');
  const menu = document.querySelector('.encounter-nav');
  const buttons = [...menu.querySelectorAll('button')];
  search.placeholder = '搜尋戰鬥組合或怪物';
  search.after(menu);
  let selected = buttons[0].dataset.encounterChapter;

  function filter() {
    const query = search.value.trim().toLowerCase();
    let total = 0;
    for (const chapter of chapters) {
      let count = 0;
      for (const encounter of chapter.querySelectorAll('.encounter')) {
        encounter.hidden = !encounter.textContent.toLowerCase().includes(query);
        if (!encounter.hidden) count++;
      }
      chapter.hidden = chapter.id !== selected || count === 0;
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
  for (const button of buttons) button.addEventListener('click', () => {
    selected = button.dataset.encounterChapter;
    for (const option of buttons) option.setAttribute('aria-pressed', String(option === button));
    resetDetail();
    filter();
    document.querySelector('.split-list')?.scrollTo(0, 0);
  });
  filter();
}

module.exports = { render, script: '(' + filterEncounters.toString() + ')();' };
