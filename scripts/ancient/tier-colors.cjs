module.exports = function tierColors(html) {
  html = html.replace(/<(div|span)\b([^>]*)>\s*([SABCD])\s*<\/\1>/g, (tag, name, attrs, tier) => /font-extrabold/.test(attrs) ? '<'+name+attrs.replace(/\sdata-tier="[^"]*"/g,'')+' data-tier="'+tier+'">'+tier+'</'+name+'>' : tag).replace(/<div\b[^>]*>\s*[BCD]\s*<\/div>/g, tag => {
    if (!/class="[^"]*font-extrabold/.test(tag)) return tag;
    if (/>\s*[BC]\s*</.test(tag)) return tag.replace('bg-amber-500/90', 'bg-sky-500/90').replace('text-black', 'text-white');
    if (tag.includes('background-color:#788491')) return tag;
    return tag.replace(/\s*bg-sky-500\/90/g, '').replace('<div ', '<div style="background-color:#788491;color:#fff" ');
  });
  return html + '<style>' + require('../cards/tier-labels.cjs') + '</style>';
};
