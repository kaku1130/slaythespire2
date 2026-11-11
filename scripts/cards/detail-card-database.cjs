process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('fs');
const cards=JSON.parse(fs.readFileSync('data/cards/cards.json')).cards;
const images=JSON.parse(fs.readFileSync('data/cards/card-images.json'));
const previews=JSON.parse(fs.readFileSync('data/cards/card-art-previews.json'));
const assets=require('./data-assets.cjs').load();
const byArt=new Map(),byName=new Map();
for(const card of cards){byName.set(card.nameZh,card);const art=previews[card.id]?.match(/<img[^>]+src="([^"]+)"/)?.[1];if(art){byArt.set(art,card);if(assets[art])byArt.set(assets[art],card);}}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function replaceCards(html,prefix='../../'){
 let cursor=0;
 while(true){const match=/<div\b[^>]*class="[^"]*\bselect-none\b[^\"]*"[^>]*>/.exec(html.slice(cursor));if(!match)break;
  let start=cursor+match.index,end=start+match[0].length,depth=1;const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=end;let tag;while(depth&&(tag=tags.exec(html))){depth+=tag[0].startsWith('</')?-1:1;end=tags.lastIndex;}if(depth)throw Error('Unclosed card preview');
  const block=html.slice(start,end),firstImage=block.match(/<img\b[^>]*>/)?.[0]||'',src=firstImage.match(/src="([^"]+)"/)?.[1],name=firstImage.match(/alt="([^"]*)"/)?.[1];
  const card=byArt.get(src?.replace(/^(?:\.\.\/)+/,''))||byName.get(name?.replace(/\+$/,''));
  if(!card){replaceCards.unmatched.push({name,src});cursor=end;continue;}
  const upgraded=block.includes(card.nameZh+'+')||block.includes((name||'')+'+</span>');
  const image=upgraded&&images[card.id].upgraded?images[card.id].upgraded:images[card.id].base;
  const before=html.slice(0,start).match(/<a\b[^>]*>$/),after=html.slice(end).match(/^<\/a>/);if(before&&after){start-=before[0].length;end+=after[0].length;}
  const replacement='<a class="database-card-link" data-card-id="'+card.id+'" href="'+prefix+'cards.html#card-'+card.id+'" target="_blank" rel="noopener" style="display:block;width:340px;max-width:100%"><img class="database-card-image" src="'+prefix+image+'" alt="'+esc(card.nameZh)+(upgraded?'（升級後）':'')+'" width="340" height="454" loading="lazy" style="display:block;width:100%;height:auto"></a>';
  html=html.slice(0,start)+replacement+html.slice(end);cursor=start+replacement.length;
 }
 return html;
}
replaceCards.unmatched=[];
module.exports={replaceCards};
