const fs = require('node:fs');
const path = require('node:path');

// Bundle each desktop index's styles in cascade order.
function writeDesktopPage(page, html, {searchControls = true, attribution = true} = {}) {
  if (!/src="assets\/cards\/page-scroll\.js(?:\?[^" ]*)?"/.test(html)) html = html.replace('</body>', '<script src="assets/cards/page-scroll.js?v=2"></script></body>');
  if (searchControls && !html.includes('src="assets/cards/search-controls.js"')) html = html.replace('</body>', '<script src="assets/cards/search-controls.js"></script></body>');
  const basename = path.basename(page, '.html');
  if (['characters','relics','potions'].includes(basename) && !html.includes('src="assets/cards/filter-memory.js"')) html = html.replace('</body>', '<script src="assets/cards/filter-memory.js"></script></body>');
  const name = ({cards:'cards',characters:'builds',relics:'relic',potions:'potion',ancients:'ancient'})[basename] || basename;
  const stylesheet = path.posix.join('assets', name, name + '.css');
  const styleTags = /<style>([\s\S]*?)<\/style>|<link\b(?=[^>]*\brel="stylesheet")[^>]*\bhref="([^"]+)"[^>]*>/g;
  const styles = [];
  // Embedded detail templates contain style tags inside JavaScript strings.
  const scripts = [];
  const protectedHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, script => '<!--page-script-' + (scripts.push(script) - 1) + '-->');
  const updated = protectedHtml.replace(styleTags, (_, inlineCss, linkedPath) => {
    const source = linkedPath || page;
    const css = linkedPath ? fs.readFileSync(linkedPath, 'utf8') : inlineCss;
    const rebased = css.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/gi, (match, doubleQuoted, singleQuoted, unquoted) => {
      const url = doubleQuoted ?? singleQuoted ?? unquoted;
      if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(url)) return match;
      const asset = path.posix.join(path.posix.dirname(source), url);
      return 'url(' + JSON.stringify(path.posix.relative(path.posix.dirname(stylesheet), asset)) + ')';
    });
    styles.push(rebased.trim());
    return styles.length === 1 ? '<link rel="stylesheet" href="' + stylesheet + '">' : '';
  }).replace(/<!--page-script-(\d+)-->/g, (_, index) => scripts[Number(index)]);
  if (!styles.length) throw new Error('Missing stylesheet for ' + page);
  if (['cards','characters','relics','potions'].includes(basename)) styles.push(require('./rarity-labels.cjs'));
  fs.writeFileSync(stylesheet, styles.join('\n\n') + '\n' + require('./page-frame.cjs') + '\n' + require('./navigation-icons.cjs').styles + require('./page-scroll.cjs'));
  if (!attribution) {
    fs.writeFileSync(page, updated);
    require('./version-stylesheet.cjs')(page,stylesheet);
    return;
  }
  fs.writeFileSync(page, updated.replace('</body>', "<footer class=\"site-attribution\" style=\"flex:0 0 auto;margin:32px 0 0;padding:6px 16px;line-height:1.4;text-align:center;font-size:12px;color:var(--muted,#aab6c4)\">" + require('./source-credit.cjs') + "</footer><script>(()=>{const main=document.getElementById('main-content');const footer=document.querySelector('.site-attribution');const content=main.querySelector(':scope > .split-body, :scope > .card-scroll, :scope > .catalog-scroll, :scope > .build-layout .build-content')||main;content.append(footer);})();</script>" + '</body>'));
  require('./version-stylesheet.cjs')(page,stylesheet);
}

module.exports = {writeDesktopPage};
