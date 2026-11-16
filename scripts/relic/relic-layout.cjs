process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('fs');
const source=fs.readFileSync('data/relic/source/index.html','utf8').split('</main>')[0];
const groups=[['Ironclad','Ironclad','#dc6c68'],['Silent','Silent','#70bf8b'],['Defect','Defect','#6faeee'],['Necrobinder','Necrobinder','#b595dd'],['Regent','Regent','#e3bf72'],['Shared','Shared','#aab6c4'],['Event','Event','#6ac1b4'],['Fallback','Other','#c8ab79']];
const iconNames={Ironclad:'ironclad',Silent:'silent',Defect:'defect',Necrobinder:'necrobinder',Regent:'regent',Shared:'colorless',Event:'event',Fallback:'other'};
function compare(a,b){const group=x=>groups.findIndex(g=>g[0]===x.pool),rank=x=>{const i=source.indexOf('src="'+x.imagePath+'"');return i<0?Infinity:i;};return group(a)-group(b)||rank(a)-rank(b)||a.name.localeCompare(b.name,'zh-TW');}

const englishSource = fs.readFileSync('data/relic/source/index-en.html', 'utf8');
const englishPayload = [...englishSource.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)]
  .map(match => JSON.parse(match[1]))
  .find(chunk => chunk.includes('"initial":{"relics":['));
const englishRelics = JSON.parse(englishPayload.slice(englishPayload.indexOf(':') + 1))[3].children[3].initial.relics;
const englishById = new Map(englishRelics.map(item => [item.id, item]));
const escapeHtml = text => text.replace(/[&<>]/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;'})[char]);


function renderEffect(id) {
  const relic = englishById.get(id);
  if (!relic) return '';
  if (id === 'AMETHYST_AUBERGINE') return 'Enemies drop 10 additional Gold.';
  return escapeHtml(relic.descI18n || relic.descriptionClean)
    .replace(/&lt;g&gt;(.*?)&lt;\/g&gt;/gs, '<span class="relic-keyword">$1</span>')
    .replace(/&lt;([es])&gt;(\d+)&lt;\/\1&gt;/g, (_, type, count) => {
      const resource = type === 'e' ? 'energy' : 'star';
      return '<span role="img" aria-label="' + count + ' ' + resource + '">' +
        ('<span class="' + resource + '-resource-icon" aria-hidden="true"></span>').repeat(Number(count)) + '</span>';
    });
}

function renderClassification(rarity, pool) {
  return '<span data-relic-rarity="' + escapeHtml(rarity) + '">' + escapeHtml(rarity) +
    '</span> · <span data-relic-pool="' + escapeHtml(pool) + '">' + escapeHtml(pool) + '</span>';
}

function formatCard(article, item) {
  return article.replace(/<div class="relic-title-row"><h2>(.*?) <span class="catalog-name-en" lang="en">(.*?)<\/span><\/h2><div class="tag">[^<]*(.*?)<\/div><\/div><p>(.*?)<\/p>/s,
    (_, localizedName, englishName, ranking, localizedEffect) => {
      const description = renderEffect(item.id);
      const effect = description ? '<p lang="en">' + description + '</p>' : '<p>' + localizedEffect + '</p>';
      return '<div class="relic-card-text"><div class="tag" lang="en">' + renderClassification(item.rarity, item.pool) + '</div>'
        + '<h3><span lang="en">' + englishName + '</span> ' + localizedName + '</h3>' + effect
        + (ranking ? '<div class="tag relic-card-ranking">' + ranking + '</div>' : '') + '</div>';
    });
}

function render(content,items){const articles=new Map([...content.matchAll(/<article\b[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].map(m=>[m[1],m[0]]));return groups.map(([pool,label,color])=>{const members=items.filter(x=>x.pool===pool);return members.length?'<section class="relic-section" data-pool="'+pool+'" style="--pool-color:'+color+'"><h2 class="relic-section-title"><img class="relic-group-icon" src="assets/cards/icons/'+iconNames[pool]+'.webp" alt="" width="28" height="28">'+label+' <span class="relic-section-count">('+members.length+')</span></h2><div class="catalog">'+members.map(x=>formatCard(articles.get(x.id),x)).join('')+'</div></section>':'';}).join('');}
const styles='.relic-section{margin:0 0 28px;padding:20px;border:1px solid var(--pool-color);border-radius:12px;background:color-mix(in srgb,var(--pool-color) 3%,var(--bg))}.relic-group-icon{width:28px;height:28px;object-fit:contain;flex-shrink:0}@media(max-width:640px){.relic-section{padding:12px}}.relic-section-title{display:flex;align-items:center;gap:10px;color:var(--pool-color);font-size:24px;margin:0 0 16px}.relic-section-count{font-size:16px;font-weight:400;color:var(--muted)}.relic-section .catalog{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.relic[data-rarity=Ancient]{--rarity-color:#c084fc}.relic[data-rarity=Shop]{--rarity-color:#fb923c}.relic[data-rarity=Starter],.relic[data-rarity=None]{--rarity-color:#a1a1aa}@media(max-width:1023px){.relic-section .catalog{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:639px){.relic-section .catalog{grid-template-columns:1fr}}';
module.exports={compare,render,styles,formatCard,renderEffect,renderClassification};
