const images=require('../../data/cards/downloaded-card-images.json').cards;
const renderTier=require('./creator-tier-section.cjs');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=(card,{prefix='detail-'+card.id.toLowerCase(),showTierRating=true}={})=>{
 const aliases=[...new Set(card.aliases||[])].filter(name=>name&&name!==card.nameZh);
 const displayNameHtml='<span class="downloaded-card-primary-name">'+esc(card.nameZh)+'</span>'+(aliases.length?'<wbr><span class="downloaded-card-alias">('+esc(aliases.join('、'))+')</span>':'');
 const image=images[card.id];
 if(!image?.base&&!image?.unavailable)throw Error('Missing downloaded card image: '+card.id);
 const variants=image.variants||[];
 const hasVariants=variants.length>0;
 const hasUpgrade=card.effect.upgraded!==null&&!!image.upgraded;
 const baseId=prefix+'-image-base',upgradedId=prefix+'-image-upgraded';
 const picture=(src,version,id,variant=null,index=0)=>{
  const name=card.name+(variant?' ('+variant.label+')':'')+(version==='upgraded'?'+':'');
  const effect=(variant?.effect||card.effect)[version]||card.effect.base;
  return '<img class="downloaded-card-image" data-card-image-version="'+version+'"'+(variant?' data-card-variant="'+esc(variant.slug)+'"':'')+' id="'+id+'" src="'+esc(src)+'" alt="'+esc(name+' — '+effect.replace(/<[^>]*>/g,''))+'" width="512" height="654" loading="lazy" decoding="async"'+(version==='upgraded'||index>0?' hidden':'')+'>';
 };
 const art=hasVariants?variants.map((variant,index)=>picture(variant.base,'base',baseId+'-'+index,variant,index)+picture(variant.upgraded,'upgraded',upgradedId+'-'+index,variant,index)).join(''):
  (image.unavailable?'<span class="downloaded-card-unavailable" lang="zh-Hant">來源網站尚無此卡的完整卡圖</span>':picture(image.base,'base',baseId))+(hasUpgrade?picture(image.upgraded,'upgraded',upgradedId):'');
 const variantData=hasVariants?' data-card-variants="'+esc(JSON.stringify(variants.map(v=>({slug:v.slug,label:v.label,source:v.source}))))+'"':'';
 const chevron=direction=>'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(direction<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7')+'"/></svg>';
 const variantArrows=hasVariants?[-1,1].map(direction=>'<button type="button" class="downloaded-card-arrow" data-card-variant-step="'+direction+'" aria-label="'+(direction<0?'上一個':'下一個')+' Mad Science 版本" aria-controls="'+prefix+'-images">'+chevron(direction)+'</button>').join('')+'<span class="sr-only" data-card-variant-status aria-live="polite" aria-atomic="true">1 / '+variants.length+' · '+esc(variants[0].label)+'</span>':'';
 const tier=showTierRating?renderTier(card).label:'';
 const upgradeControl='<span class="downloaded-card-upgrade"><button type="button" id="'+prefix+'-upgrade" data-card-version="upgraded" aria-label="upgrade+" aria-pressed="false" aria-controls="'+prefix+'-images"'+(!hasUpgrade?' disabled title="Cannot be upgraded"':'')+'><span class="downloaded-card-upgrade-symbol" aria-hidden="true">➕&#xfe0e;</span></button></span>';
 const source=variants[0]?.source||require('./card-source-link.cjs')(card),spirebird=require('./spirebird-link.cjs')(card);
 return '<article class="card-detail" data-card-layout="compact" data-catalog-layout="true" data-card-presentation="download" data-effect-version="base"'+(hasVariants?' data-card-variant="'+esc(variants[0].slug)+'"':'')+' data-character="'+esc(card.character)+'" data-card-name-en="'+esc(card.name)+'" aria-labelledby="'+prefix+'-title" lang="en">'+
 '<header class="downloaded-card-heading">'+
 '<h2 class="downloaded-card-title" id="'+prefix+'-title"><span class="detail-name-zh" lang="zh-Hant">'+displayNameHtml+'</span>'+(tier?'<span class="downloaded-card-tier">'+tier+'</span>':'')+upgradeControl+'</h2>'+
 '</header>'+
 '<figure class="downloaded-card-art" id="'+prefix+'-images"'+variantData+'>'+art+variantArrows+'</figure>'+
 '<footer class="downloaded-card-links">'+
 '<a class="downloaded-card-source detail-spirebird-link" href="'+esc(spirebird)+'" target="_blank" rel="noopener noreferrer" title="'+esc(card.name+' · Spirebird')+'">spirebird.com</a>'+
 '<a class="downloaded-card-source detail-untapped-link" href="'+esc(source)+'" target="_blank" rel="noopener noreferrer" title="'+esc(card.name+' · Untapped.gg')+'">untapped.gg</a>'+
 '</footer></article>';
};
