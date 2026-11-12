const fs = require('node:fs');

function removeDialogue(html) {
  return html.replace(/<section\b[^>]*>\s*<h2\b[^>]*>\s*對話\s*<\/h2>[\s\S]*?<\/section>/g, '');
}

function desktopMenu() {
  const detail = fs.readFileSync('data/ancient/ancient-vakuu.html', 'utf8');
  const footer = detail.match(/<h2\b[^>]*>其他先古之民的最強遺物<\/h2>([\s\S]*?)<\/section>/)?.[1];
  if (!footer) throw Error('Missing ancient relic menu');
  const links = new Map([...footer.matchAll(/<a\b[^>]*href="[^"]*\/(ancient-[^"/]+\.html)"[^>]*>[\s\S]*?<\/a>/g)]
    .map(([link, key]) => [key, link.replaceAll('../../', '').replace('<a ', '<a data-detail-key="' + key + '" ')]));
  const order = ['neow', 'darv', 'orobas', 'pael', 'tezcatara', 'nonupeipe', 'tanx'];
  const items = order.map(slug => {
    const item = links.get('ancient-' + slug + '.html');
    if (!item) throw Error('Missing relic menu entry: ' + slug);
    const label = item.match(/<\/div>([^<]+)<\/a>$/)?.[1].trim();
    if (!label) throw Error('Missing relic menu label: ' + slug);
    return item.replace('<a ', '<a aria-label="' + label + '" title="' + label + '" ')
      .replace(/<\/div>[^<]+<\/a>$/, '</div></a>');
  });
  return '<template id="ancient-desktop-menu"><nav class="ancient-desktop-menu" aria-label="先古之民的最強遺物">' + items.join('') + '</nav></template>';
}

module.exports = {desktopMenu, removeDialogue};
