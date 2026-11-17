const details = require('../../data/monster/sts-gg-details.json');

const words = value => value.replace(/([a-z])([A-Z])/g, '$1 $2')
  .replaceAll('_', ' ').toLowerCase().replace(/\b[a-z]/g, char => char.toUpperCase());

function localDetail(monster) {
  const acts = { act1a: 'Act 1 – Overgrowth', act1b: 'Act 1 – Underdocks', act2: 'Act 2 – Hive', act3: 'Act 3 – Glory' };
  const moves = monster.moves.map(move => ({
    name: words(move.id),
    intents: move.intents.map(words),
    effects: [
      move.damage == null ? '' : `${move.damage} damage${move.damageAsc == null ? '' : ` (${move.damageAsc} at A${move.ascLevel || 9})`}${move.hits ? ` × ${move.hits} hits` : ''}`,
      move.block == null ? '' : `${move.block} Block`,
      ...(move.effects || []).map(effect => [
        effect.type, effect.amount, effect.amountAsc == null ? '' : `(${effect.amountAsc} at A${effect.ascLevel || 9})`,
        effect.target ? `→ ${effect.target}` : '',
      ].filter(Boolean).join(' ')),
    ].filter(Boolean),
  }));
  const flow = moves.length ? monster.flow.phases.flatMap(phase => phase.steps.map(step => {
    if (step.kind === 'loop') return ['step', 'Loop back to ' + words(step.to)];
    if (step.kind === 'random') return ['step', step.options.map(option =>
      `${words(option.id)} (${(option.prob * 100).toFixed(1)}%${option.repeat === 'CannotRepeat' ? ', cannot repeat' : ''})`).join(' · ')];
    return ['step', words(step.id)];
  })) : [];
  return {
    name: words(monster.className),
    tags: [words(monster.encounterType), ...monster.acts.map(act => acts[act])],
    hp: monster.minHp ? String(monster.minHp) + (monster.minHpAsc ? ` (${monster.minHpAsc} at A8)` : '') : '',
    powers: [], moves, flow,
  };
}

function render(monster, portrait, escape) {
  const source = details[monster.slug];
  const detail = source || localDetail(monster);
  const section = (heading, content) => content ? `<section><h2>${heading}</h2>${content}</section>` : '';
  const powers = detail.powers.map(([name, amount]) => `<li>${escape(name)} ${escape(amount)}</li>`).join('');
  const moves = detail.moves.map(move => `<article><h3>${escape(move.name)}</h3>`
    + (move.intents.length ? `<p class="detail-meta">${escape(move.intents.join(' · '))}</p>` : '')
    + (move.effects.length ? `<ul>${move.effects.map(effect => `<li>${escape(effect)}</li>`).join('')}</ul>` : '')
    + '</article>').join('');
  const flow = detail.flow.map(([kind, line]) =>
    kind === 'phase' ? `<h3>${escape(line)}</h3>` : `<p>${escape(line)}</p>`).join('');
  const attribution = source
    ? `<a href="https://sts.gg/v2/monsters/${escape(monster.slug)}">View on STS.gg</a>`
    : 'Source: Local game data';
  return {
    name: detail.name,
    html: `<div class="monster-detail" lang="en"><div><div>`
      + (portrait ? `<img class="monster-portrait" src="../../${escape(portrait)}" alt="">` : '')
      + `<h1>${escape(detail.name)}</h1>`
      + (detail.tags.length ? `<p class="detail-meta">${escape(detail.tags.join(' · '))}</p>` : '')
      + (detail.hp ? `<p><strong>HP</strong> ${escape(detail.hp)}</p>` : '')
      + '</div></div>'
      + section('Starting Powers', powers && `<ul>${powers}</ul>`)
      + section('Moves', moves)
      + section('Move Pattern', flow)
      + `<footer>${attribution}</footer></div>`,
  };
}

const styles = `
.monster-detail{width:100%;max-width:56rem;margin-inline:auto;padding:16px;color:#e3e8ee;line-height:1.55}
.monster-detail .monster-portrait{float:right;width:clamp(64px,23vw,128px);height:clamp(64px,23vw,128px);object-fit:contain;margin:0 0 8px 12px}
.monster-detail>div{display:flow-root}
.monster-detail h1{font-size:1.8rem;font-weight:700}
.monster-detail h2{font-size:1.3rem;font-weight:700;margin-bottom:8px}
.monster-detail h3{font-weight:700}
.monster-detail p{margin-block:4px}
.monster-detail li{margin-inline-start:1.25em;list-style:disc}
.monster-detail section,.monster-detail footer{margin-block-start:16px;border-top:1px solid #293340;padding-block-start:12px}
.monster-detail article{margin-block:8px;padding:10px 12px;border:1px solid #293340;border-radius:8px}
.monster-detail .detail-meta,.monster-detail footer{color:#aab6c4}
.monster-detail a{color:#74b3e6;text-decoration:underline}
`;

module.exports = { render, styles };
