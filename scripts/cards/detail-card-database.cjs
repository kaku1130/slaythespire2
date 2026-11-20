process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('fs');
const cards=JSON.parse(fs.readFileSync('data/cards/cards.json')).cards;
const previews=JSON.parse(fs.readFileSync('data/cards/card-art-previews.json'));
const assets=require('./data-assets.cjs').load();
const details=new Map(JSON.parse(fs.readFileSync('data/cards/english-details.json','utf8')).cards.map(card=>[card.id,card]));
for(const {detail} of JSON.parse(fs.readFileSync('data/cards/special-cards.json','utf8')).cards)if(!details.has(detail.id))details.set(detail.id,detail);
const render=require('./render-card-detail.cjs');
const byArt=new Map(),byName=new Map();
for(const card of cards){byName.set(card.nameZh,card);const art=previews[card.id]?.match(/<img[^>]+src="([^"]+)"/)?.[1];if(art){byArt.set(art,card);if(assets[art])byArt.set(assets[art],card);}}
for(const card of details.values()){byArt.set(card.image,card);byName.set(card.nameZh,card);}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function replaceCards(html,prefix='../../'){
 let cursor=0;
 while(true){const match=/<div\b[^>]*class="[^"]*\bselect-none\b[^\"]*"[^>]*>/.exec(html.slice(cursor));if(!match)break;
  let start=cursor+match.index,end=start+match[0].length,depth=1;const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=end;let tag;while(depth&&(tag=tags.exec(html))){depth+=tag[0].startsWith('</')?-1:1;end=tags.lastIndex;}if(depth)throw Error('Unclosed card preview');
  const block=html.slice(start,end),firstImage=block.match(/<img\b[^>]*>/)?.[0]||'',src=firstImage.match(/src="([^"]+)"/)?.[1],name=firstImage.match(/alt="([^"]*)"/)?.[1];
  const card=byArt.get(src?.replace(/^(?:\.\.\/)+/,''))||byName.get(name?.replace(/\+$/,''));
  if(!card){replaceCards.unmatched.push({name,src});cursor=end;continue;}
  const before=html.slice(0,start).match(/<a\b[^>]*>$/),after=html.slice(end).match(/^<\/a>/);if(before&&after){start-=before[0].length;end+=after[0].length;}
  const detail=details.get(card.id);
  if(!detail)throw Error('Missing ancient card detail '+card.id);
  const article=render(detail,{prefix:'ancient-card-'+start+'-'+card.id.toLowerCase(),showBuilds:false,showKeywords:false,rarityBeforeType:true,showEffectTooltips:true})
    .replace(/(src|href)="(assets\/|build\.html|card\.html)/g,'$1="'+prefix+'$2');
  const replacement='<div class="ancient-card-entry card-detail-row" data-card-id="'+card.id+'" data-rarity="'+esc(detail.rarity)+'">'+article+'</div>';
  html=html.slice(0,start)+replacement+html.slice(end);cursor=start+replacement.length;
 }
 return html;
}
replaceCards.unmatched=[];
module.exports={replaceCards};
