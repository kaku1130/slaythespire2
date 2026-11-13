const fs = require('node:fs');
const path = require('node:path');

// Bundle each desktop index's styles in cascade order.
function writeDesktopPage(page, html) {
  const name = path.basename(page, '.html');
  const stylesheet = path.posix.join('assets', name, name + '.css');
  const styleTags = /<style>([\s\S]*?)<\/style>|<link\b(?=[^>]*\brel="stylesheet")[^>]*\bhref="([^"]+)"[^>]*>/g;
  const styles = [];
  const updated = html.replace(styleTags, (_, inlineCss, linkedPath) => {
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
  });
  if (!styles.length) throw new Error('Missing stylesheet for ' + page);
  fs.writeFileSync(stylesheet, styles.join('\n\n') + '\n' + require('./page-frame.cjs'));
  fs.writeFileSync(page, updated);
}

module.exports = {writeDesktopPage};
