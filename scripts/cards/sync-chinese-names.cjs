process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs');
const assert = require('node:assert/strict');
const detailsFile = 'data/cards/english-details.json';
const chineseFile = 'data/cards/cards-zh-TW.json';
const auditFile = 'data/cards/chinese-names-source.json';
const text = html => html.replace(/<[^>]*>/g, '').replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n) => ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[n])).trim();

async function main() {
  const details = JSON.parse(fs.readFileSync(detailsFile, 'utf8'));
  const chinese = JSON.parse(fs.readFileSync(chineseFile, 'utf8'));
  const ids = new Set(JSON.parse(fs.readFileSync('data/cards/cards.json', 'utf8')).cards.map(card => card.id));
  const cards = details.cards.filter(card => ids.has(card.id));
  const audit = {source:'https://slaythespire2.net/zh-TW/card', checkedAt:new Date().toISOString(), cards:[]};
  let cursor = 0;
  await Promise.all(Array.from({length:4}, async () => {
    while (cursor < cards.length) {
      const card = cards[cursor++];
      const url = new URL(card.source);
      url.pathname = '/zh-TW' + url.pathname;
      let name;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(url, {signal:AbortSignal.timeout(30000)});
          assert.ok(response.ok, response.status + ' ' + url.href);
          const html = await response.text();
          const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
          assert.ok(heading, 'Missing card heading: ' + url.href);
          name = text(heading);
          assert.ok(name && name.length < 80 && /[\p{Script=Han}]/u.test(name), 'Unexpected Chinese name: ' + name);
          break;
        } catch (error) {
          if (attempt === 2) throw error;
        }
      }
      audit.cards.push({id:card.id, name, source:url.href});
      if (audit.cards.length % 50 === 0 || audit.cards.length === cards.length) console.log('Checked ' + audit.cards.length + '/' + cards.length);
    }
  }));
  assert.equal(audit.cards.length, cards.length);
  audit.cards.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(auditFile, JSON.stringify(audit, null, 2) + '\n');
  const names = new Map(audit.cards.map(card => [card.id, card.name]));
  const changed = [];
  for (const card of details.cards) if (names.has(card.id) && card.nameZh !== names.get(card.id)) {
    changed.push({id:card.id, before:card.nameZh, after:names.get(card.id)});
    card.nameZh = names.get(card.id);
  }
  for (const card of chinese.cards) if (names.has(card.id) && card.name !== names.get(card.id)) {
    card.aliases = [...new Set([...(card.aliases || []), card.name])].filter(name => name !== names.get(card.id));
    card.name = names.get(card.id);
  }
  if (process.argv.includes('--write')) {
    details.chineseNamesCheckedAt = audit.checkedAt;
    chinese.namesCheckedAt = audit.checkedAt;
    fs.writeFileSync(detailsFile, JSON.stringify(details, null, 2) + '\n');
    fs.writeFileSync(chineseFile, JSON.stringify(chinese, null, 2) + '\n');
  }
  console.log(JSON.stringify({checked:cards.length, changed:changed.length, written:process.argv.includes('--write'), changes:changed}, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
