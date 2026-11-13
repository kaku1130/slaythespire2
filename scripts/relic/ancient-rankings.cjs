const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const relics = JSON.parse(read('data/relic/catalog.json')).items;
const byImage = new Map(relics.map(relic => [path.posix.basename(relic.imagePath), relic.id]));
const rankings = new Map();
for (const slug of JSON.parse(read('data/ancient/catalog.json')).slugs) {
  const html = read('data/ancient/ancient-' + slug + '.html');
  const section = html.match(/<section id="relic-tier-list"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  if (!section) throw Error('Missing relic ranking: ' + slug);
  const name = section.match(/<h1\b[^>]*>([^<]+)最強遺物強度排行<\/h1>/)?.[1];
  if (!name) throw Error('Missing ancient name: ' + slug);
  let tier;
  for (const match of section.matchAll(/<div\b[^>]*class="[^"]*font-extrabold[^"]*"[^>]*>\s*([SABCD][+-]?)\s*<\/div>|<a\b[^>]*href="#(relic-[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (match[1]) { tier = match[1]; continue; }
    const image = match[3].match(/<img\b[^>]*src="([^"]+)"/)?.[1];
    const id = image && byImage.get(path.posix.basename(image));
    if (!id || !tier) throw Error('Unmatched ranked relic: ' + slug + '/' + match[2]);
    if (!rankings.has(id)) rankings.set(id, []);
    rankings.get(id).push({tier, slug, name, anchor:match[2]});
  }
}
function render(id) {
  return (rankings.get(id) || []).map(({tier, slug, name, anchor}) =>
    '<a class="relic-ancient-ranking" href="data/ancient/ancient-' + slug + '.html#' + esc(anchor) + '" title="' + esc(name + '最強遺物強度排行：' + tier) + '">' +
    '<img src="assets/ancient/images/icon/' + slug + '.webp" alt="" width="24" height="24"><span>' + esc(name) + '</span>' +
    '<span class="relic-tier-label" data-tier="' + esc(tier) + '">' + esc(tier) + '</span></a>'
  ).join('');
}
module.exports = {render, rankings};
