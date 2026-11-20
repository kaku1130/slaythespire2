
function removeDialogue(html) {
  return html.replace(/<section\b[^>]*>\s*<h2\b[^>]*>\s*對話\s*<\/h2>[\s\S]*?<\/section>/g, '');
}

function addTopRelicMenu(html) {
  html = html.replace(/(<section\b[^>]*>\s*<h2\b[^>]*>其他(?:先古|遠古)之民的最強遺物<\/h2>)<div\b[^>]*>/g,
    '$1<div class="mt-3 gap-2" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,38px),1fr));width:100%">');
  html = html.replace(/<section\b[^>]*>\s*<h2\b[^>]*>其他(?:先古|遠古)之民的最強遺物<\/h2>[\s\S]*?<\/section>/g, section =>
    section.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (link, attrs, content) => {
      const label = content.match(/<img\b[^>]*\balt="([^"]*)"/)?.[1];
      if (!label) return link;
      attrs = attrs.replace(/\s(?:aria-label|title|style)="[^"]*"/g, '');
      content = content.replace(/(<\/div>)[^<]*$/, '$1');
      return '<a' + attrs + ' aria-label="' + label + '" title="' + label + '" style="justify-content:center;padding:8px 4px;min-height:48px">' + content + '</a>';
    }));
  if (html.includes('data-ancient-top-menu')) return html;
  const menu = html.match(/<section\b[^>]*>\s*<h2\b[^>]*>其他(?:先古|遠古)之民的最強遺物<\/h2>[\s\S]*?<\/section>/)?.[0];
  if (!menu) throw Error('Missing ancient relic menu');
  const copy = menu.replace(/<section\b[^>]*>/, '<section data-ancient-top-menu class="mb-6" aria-label="其他先古之民的最強遺物">')
    .replace(/<h2\b[^>]*>其他(?:先古|遠古)之民的最強遺物<\/h2>/, '');
  html = html.replace(menu, '');
  return /<main\b/.test(html) ? html.replace(/(<main\b[^>]*>)/, '$1' + copy) : copy + html;
}

module.exports = {removeDialogue, addTopRelicMenu};
