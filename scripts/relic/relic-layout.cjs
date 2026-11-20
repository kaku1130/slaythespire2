process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('fs');
const source=fs.readFileSync('data/relic/source/index.html','utf8').split('</main>')[0];
const groups=[['Ironclad','Ironclad','#dc6c68'],['Silent','Silent','#70bf8b'],['Defect','Defect','#6faeee'],['Regent','Regent','#e3bf72'],['Necrobinder','Necrobinder','#b595dd'],['Shared','Shared','#aab6c4'],['Event','Event','#6ac1b4'],['Fallback','Other','#c8ab79']];
const iconNames={Ironclad:'ironclad',Silent:'silent',Defect:'defect',Necrobinder:'necrobinder',Regent:'regent',Shared:'colorless',Event:'event',Fallback:'other'};
function compare(a,b){const group=x=>groups.findIndex(g=>g[0]===x.pool),rank=x=>{const i=source.indexOf('src="'+x.imagePath+'"');return i<0?Infinity:i;};return group(a)-group(b)||rank(a)-rank(b)||a.name.localeCompare(b.name,'zh-TW');}

const escapeHtml = text => text.replace(/[&<>]/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;'})[char]);

function renderClassification(rarity, pool) {
  return '<span data-relic-rarity="' + escapeHtml(rarity) + '">' + escapeHtml(rarity) + '</span>';
}

function formatCard(article, item) {
  return article.replace(/(<img\b[^>]*>)<div class="relic-title-row"><h2>(.*?) <span class="catalog-name-en" lang="en">(.*?)<\/span><\/h2><div class="tag">[^<]*(.*?)<\/div><\/div><p(?: lang="en")?>(.*?)<\/p>/s,
    (_, image, localizedName, englishName, ranking, localizedEffect) => {
      return '<div class="relic-card-text">' + image + '<h3><span class="relic-name-zh" lang="zh-Hant">' + localizedName
        + '</span><span class="relic-name-en" lang="en" title="' + englishName.replaceAll('"', '&quot;') + '">' + englishName
        + '</span></h3><p lang="en">' + localizedEffect + '</p>'
        + '<div class="relic-rarity-row" lang="en">' + renderClassification(item.rarity) + '</div>'
        + (ranking ? '<div class="tag relic-card-ranking">' + ranking + '</div>' : '') + '</div>';
    });
}

function render(content,items){const articles=new Map([...content.matchAll(/<article\b[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].map(m=>[m[1],m[0]]));return groups.map(([pool,label,color])=>{const members=items.filter(x=>x.pool===pool);return members.length?'<section class="relic-section" data-pool="'+pool+'" style="--pool-color:'+color+'"><h2 class="relic-section-title"><img class="relic-group-icon" src="assets/cards/icons/'+iconNames[pool]+'.webp" alt="" width="28" height="28">'+label+' <span class="relic-section-count">('+members.length+')</span></h2><div class="catalog">'+members.map(x=>formatCard(articles.get(x.id),x)).join('')+'</div></section>':'';}).join('');}
const styles='.relic-section{margin:0 0 28px;padding:20px;border:1px solid var(--pool-color);border-radius:12px;background:color-mix(in srgb,var(--pool-color) 3%,var(--bg))}.relic-group-icon{width:28px;height:28px;object-fit:contain;flex-shrink:0}@media(max-width:640px){.relic-section{padding:12px}}.relic-section-title{display:flex;align-items:center;gap:10px;color:var(--pool-color);font-size:24px;margin:0 0 16px}.relic-section-count{font-size:16px;font-weight:400;color:var(--muted)}.relic-section .catalog{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.relic[data-rarity=Ancient]{--rarity-color:#c084fc}.relic[data-rarity=Shop]{--rarity-color:#b08968}.relic[data-rarity=Starter],.relic[data-rarity=None]{--rarity-color:#a1a1aa}@media(max-width:1023px){.relic-section .catalog{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:639px){.relic-section .catalog{grid-template-columns:1fr}}';
module.exports={compare,render,styles,formatCard,renderClassification};

module.exports.styles += `
.relic-card-text h3 .relic-card-classification { display: inline; margin-inline-start: 6px; font-weight: 400; }
`;

module.exports.styles += `
.relic-name-zh { display: block; }
.relic-name-row { display: flex; flex-wrap: nowrap; align-items: baseline; gap: 8px; min-width: 0; }
.relic-name-en { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.relic-card-text h3 .relic-card-classification { flex: 0 0 auto; margin-inline-start: 0; white-space: nowrap; }
`;

module.exports.styles += `
.relic-card-text h3 {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 8px;
  row-gap: 4px;
}
.relic-name-zh,
.relic-name-row { display: contents; }
.relic-name-en {
  min-width: 0;
  max-width: 100%;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  overflow-wrap: anywhere;
}
.relic-card-text h3 .relic-card-classification {
  flex: 0 1 auto;
  max-width: 100%;
  white-space: normal;
}
`;

module.exports.styles += `
.relic-card-text h3 .relic-name-zh,
.relic-card-text h3 .relic-name-en {
  color: var(--rarity-color, var(--ink));
}
.relic-card-classification [data-relic-rarity] { display: none; }
`;
