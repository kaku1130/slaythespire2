process.chdir(require('node:path').resolve(__dirname,'../..'));
const groups=[['Common','普通','#aab6c4'],['Uncommon','罕見','#74b3e6'],['Rare','稀有','#e3bf72'],['Event','事件','#6ac1b4']];
function formatCard(article, item) {
  const rarity = item.rarity;
  return article.replace('</article>',require('../cards/item-source-links.cjs').render(item,'potion')+'</article>').replace(/(<img\b[^>]*>)<div class="potion-title-row"><h2>(.*?) (<span class="catalog-name-en" lang="en">.*?<\/span>)<\/h2><div class="tag">.*?<\/div><\/div><p(?: lang="en")?>(.*?)<\/p>/s,
    (_, image, localizedName, englishName, description) => '<div class="potion-icon-row">' + image + '</div><div class="potion-title-row"><h2><span class="potion-name-zh" lang="zh-Hant">' + localizedName + '</span>' + englishName + '<span class="potion-rarity-row" lang="en">' + rarity + '</span></h2></div><p lang="en">' + description + '</p>');
}

function render(content,items){const articles=new Map([...content.matchAll(/<article\b[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].map(m=>[m[1],m[0]]));return groups.map(([rarity,label,color])=>{const members=items.filter(x=>x.rarity===rarity);return '<section class="potion-section" data-rarity="'+rarity+'" style="--group-color:'+color+'"><h2 class="potion-section-title" lang="en">'+rarity+' <span class="potion-section-count">('+members.length+')</span></h2><div class="catalog">'+members.map(x=>formatCard(articles.get(x.id),x)).join('')+'</div></section>';}).join('');}
const styles='.potion-section{margin:0 0 28px;padding:20px;border:1px solid var(--group-color);border-radius:12px;background:color-mix(in srgb,var(--group-color) 3%,var(--bg))}.potion-section-title{display:flex;align-items:center;gap:10px;color:var(--group-color);font-size:24px;margin:0 0 16px}.potion-section-count{font-size:16px;font-weight:400;color:var(--muted)}@media(max-width:640px){.potion-section{padding:12px}}';
module.exports={render,styles};

module.exports.styles += `
.entry.potion > .potion-title-row h2 {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
  color: var(--rarity-color, var(--ink));
}
main#main-content .potion-title-row h2 .catalog-name-en {
  color: var(--rarity-color, var(--ink));
}
`;

module.exports.styles+=require('../cards/item-source-links.cjs').styles;
