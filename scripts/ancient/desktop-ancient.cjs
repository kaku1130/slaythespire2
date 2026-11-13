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
    const label = item.match(/<img\b[^>]*\balt="([^"]*)"/)?.[1] || item.match(/<\/div>([^<]+)<\/a>$/)?.[1].trim();
    if (!label) throw Error('Missing relic menu label: ' + slug);
    return item.replace('<a ', '<a aria-label="' + label + '" title="' + label + '" ')
      .replace(/<\/div>[^<]+<\/a>$/, '</div></a>');
  });
  return '<template id="ancient-desktop-menu"><nav class="ancient-desktop-menu" aria-label="先古之民的最強遺物">' + items.join('') + '</nav></template>';
}

function addTopRelicMenu(html) {
  html = html.replace(/(<section\b[^>]*>\s*<h2\b[^>]*>其他先古之民的最強遺物<\/h2>)<div\b[^>]*>/g,
    '$1<div class="mt-3 gap-2" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,110px),1fr));width:100%">');
  html = html.replace(/<section\b[^>]*>\s*<h2\b[^>]*>其他先古之民的最強遺物<\/h2>[\s\S]*?<\/section>/g, section =>
    section.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (link, attrs, content) => {
      const label = content.match(/<img\b[^>]*\balt="([^"]*)"/)?.[1];
      if (!label) return link;
      attrs = attrs.replace(/\s(?:aria-label|title|style)="[^"]*"/g, '');
      content = content.replace(/(<\/div>)[^<]*$/, '$1');
      return '<a' + attrs + ' aria-label="' + label + '" title="' + label + '" style="justify-content:center;padding:8px;min-height:48px">' + content + '</a>';
    }));
  if (html.includes('data-ancient-top-menu')) return html;
  const menu = html.match(/<section\b[^>]*>\s*<h2\b[^>]*>其他先古之民的最強遺物<\/h2>[\s\S]*?<\/section>/)?.[0];
  if (!menu) throw Error('Missing ancient relic menu');
  const copy = menu.replace(/<section\b[^>]*>/, '<section data-ancient-top-menu class="mb-6">');
  return /<main\b/.test(html) ? html.replace(/(<main\b[^>]*>)/, '$1' + copy) : copy + html;
}

module.exports = {desktopMenu, removeDialogue, addTopRelicMenu};
