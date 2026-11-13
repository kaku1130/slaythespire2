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
  fs.writeFileSync(page, name === 'event' ? updated : updated.replace('</body>', "<footer class=\"site-attribution\" style=\"position:static;flex:0 0 auto;grid-column:1 / -1;padding:8px 16px;text-align:center;font-size:14px;color:var(--muted,#aab6c4)\">資料來源：<a href=\"https://slaythespire2.net/zh-TW/monster\" target=\"_blank\" rel=\"noopener\">殺戮尖塔2 攻略與Wiki</a> · 遊戲內容與圖片屬各自權利人所有。</footer><script>(()=>{const main=document.getElementById('main-content');const footer=document.querySelector('.site-attribution');const region=main.querySelector('.split-body,.build-content')||main.querySelector('.catalog-scroll,.card-scroll')||main;region.append(footer);})();</script>" + '</body>'));
}

module.exports = {writeDesktopPage};
