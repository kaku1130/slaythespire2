process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const normalize = value => String(value || '').replace(/\[gold\]/g, '<g>').replace(/\[\/gold\]/g, '</g>').replace(/\[energy:(\d+)\]/g, (_, n) => '<e/>'.repeat(Number(n))).replace(/\[star:(\d+)\]/g, (_, n) => n + '<s/>');
function description(card, upgraded = false) {
  const keywords = (card.keywords || []).map(word => '<g>' + word + '</g>.');
  return [...keywords, normalize(upgraded ? card.upgrade_description || card.description : card.description)].filter(Boolean).join('\n');
}
async function main() {
  const [english, localized] = await Promise.all(['en', 'zht'].map(async lang => {
    const response = await fetch('https://spire-codex.com/api/cards?lang=' + lang, {signal:AbortSignal.timeout(30000)});
    assert.ok(response.ok);return response.json();
  }));
  const existing = new Set(JSON.parse(fs.readFileSync('data/cards/cards-source.json', 'utf8')).map(card => card.id));
  const chinese = new Map(localized.map(card => [card.id, card]));
  const additions = english.filter(card => !existing.has(card.id) && ['Status', 'Token', 'Quest', 'Curse'].includes(card.rarity_key));
  const records = [];
  const assets = JSON.parse(fs.readFileSync('data/cards/assets.json', 'utf8'));
  for (const entry of additions) {
    const zh = chinese.get(entry.id);assert.ok(zh && zh.name, entry.id);
    const pool = entry.rarity_key === 'Token' ? 'Token' : entry.type_key === 'Status' ? 'Status' : entry.rarity_key;
    const slug = entry.id.toLowerCase().replaceAll('_', '-');
    const image = 'assets/cards/source/cards/' + pool.toLowerCase() + '/' + entry.id.toLowerCase() + '.webp';
    assets[new URL(entry.image_url, 'https://spire-codex.com').href] = image;
    if (!fs.existsSync(image)) {
      const response = await fetch(new URL(entry.image_url, 'https://spire-codex.com'), {signal:AbortSignal.timeout(30000)});
      assert.ok(response.ok, entry.id + ' image');const bytes = Buffer.from(await response.arrayBuffer());
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
      fs.mkdirSync(path.dirname(image), {recursive:true});fs.writeFileSync(image, bytes);
    }
    const cost = entry.is_x_cost ? -1 : entry.cost >= 0 ? entry.cost : undefined;
    const base = description(entry), upgraded = entry.upgrade ? description(entry, true) : null;
    const card = {id:entry.id, name:entry.name, pool, type:entry.type_key, rarity:entry.rarity_key, slug, descBase:base, descUpgraded:upgraded || base,
      ...(cost !== undefined ? {energy:cost} : {unplayable:true}), ...(entry.star_cost !== null ? {starCost:entry.star_cost} : {}),
      ...(entry.upgrade ? {upgrade:{...entry.upgrade, ...(entry.upgrade.cost !== undefined ? {energy:entry.upgrade.cost} : {})}} : {}),
      source:'https://spire-codex.com/cards/' + slug, sourceZh:'https://spire-codex.com/cards/' + slug + '?lang=zht'};
    const costText = cost === undefined ? 'No cost (unplayable)' : (cost === -1 ? 'X' : cost) + '<e/>';
    const upgradedCost = entry.upgrade?.cost;
    const stats = [{label:'Energy cost', value:upgradedCost !== undefined && upgradedCost < cost ? costText + ' → ' + upgradedCost + '<e/>' : costText},
      {label:'Type', value:card.type}, {label:'Rarity', value:card.rarity}, {label:'Character', value:pool}];
    records.push({card, chinese:{id:card.id, name:zh.name, slug, descBase:description(zh), descUpgraded:zh.upgrade ? description(zh, true) : description(zh)},
      detail:{id:card.id, name:card.name, nameZh:zh.name, source:card.source, sourceZh:card.sourceZh, type:card.type, rarity:card.rarity, character:pool, tier:null,
        effect:{base, upgraded}, stats, keywords:[], builds:[], aliases:[], image, characterIcon:'assets/cards/icons/other.webp'}});
    console.log('Imported ' + card.id);
  }
  fs.writeFileSync('data/cards/special-cards.json', JSON.stringify({source:'https://spire-codex.com/api/cards', checkedAt:new Date().toISOString(), cards:records}, null, 2) + '\n');
  fs.writeFileSync('data/cards/assets.json', JSON.stringify(assets, null, 2) + '\n');
  console.log('Imported ' + records.length + ' status, token and quest cards.');
}
main().catch(error => {console.error(error);process.exitCode=1;});
