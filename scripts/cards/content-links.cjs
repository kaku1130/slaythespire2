const fs=require('node:fs'),path=require('node:path');
const read=file=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../..',file),'utf8'));
const cards=[...read('data/cards/english-details.json').cards,...read('data/cards/special-cards.json').cards.map(item=>item.detail)];
const sourceUrls=read('data/cards/source/untapped-effects.json').urls;
const slug=value=>value.toLowerCase().replace(/[’'.!]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const decode=value=>value.replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&(amp|quot|apos|lt|gt);/g,(_,name)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'}[name]));
const clean=value=>decode(value).replace(/[’‘]/g,"'").trim();
const byUrl=new Map(),byName=new Map(),byId=new Map();
function remember(item,url,category){
 const entry={url,category};
 byId.set(item.id,entry);
 for(const name of [item.nameEn,item.name,item.nameZh])if(name)byName.set(clean(name),entry);
 for(const source of [item.sourceEn,item.source,item.sourceZh,item.url])if(source&&source!== 'https://sts2.untapped.gg/en/cards')byUrl.set(decode(source),url);
}
function cardUrl(card){
 const candidates=[card.id.toLowerCase().replaceAll('_','-'),slug(card.name)];
 return sourceUrls.find(url=>candidates.some(name=>url.endsWith('/'+name))&&url.includes('/'+card.character.toLowerCase()+'/'))
  ||sourceUrls.find(url=>candidates.some(name=>url.endsWith('/'+name)))
  ||(card.sourceEn?.startsWith('https://sts2.untapped.gg/en/')?card.sourceEn:'https://sts2.untapped.gg/en/cards/'+card.character.toLowerCase()+'/'+slug(card.name));
}
for(const card of cards)remember(card,cardUrl(card),'cards');
for(const category of ['relic','potion'])for(const item of read('data/'+category+'/catalog.json').items)remember(item,item.sourceEn,category+'s');
const names=[...byName.keys()].sort((a,b)=>b.length-a.length);
function normalize(html){
 // Script bodies include serialized documents and must be handled by their own generators.
 return html.split(/(<script\b[^>]*>[\s\S]*?<\/script>)/gi).map(part=>part.startsWith('<script')?part:part.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g,(original,before,href,after,body)=>{
  if(/data-same-tab|site-brand|site-nav/.test(before+after))return original;
  const plain=decode(href),text=clean(body.replace(/<[^>]+>/g,''));
  let url=byUrl.get(plain);
  const localCard=plain.match(/(?:^|\/)cards\.html#card-([^#?]+)/);
  if(localCard)url=byId.get(localCard[1])?.url;
  const isResource=/(?:\/cards\/|\/card\/|\/relics?\/|\/potions?\/|wiki\.gg\/wiki\/Slay_the_Spire_2:|(?:^|\/)(?:relics|potions)\.html)/.test(plain);
  if(!url&&isResource){
   const id=(before+after).match(/data-card-id="([^"]+)"/)?.[1];
   const title=(before+after).match(/title="([^"]+)"/)?.[1];
   const name=byName.has(text)?text:names.find(name=>text===name||text.startsWith(name+'(')||text.startsWith(name+'+('));
   url=byId.get(id)?.url||byName.get(clean(title||''))?.url||byName.get(name)?.url;
   if(!url){
    const tail=plain.split('/').pop()?.split('#')[0];
    url=sourceUrls.find(candidate=>candidate.endsWith('/'+tail));
   }
   if(!url&&/(?:^|\/)relics\.html/.test(plain))url='https://sts2.untapped.gg/en/relics';
   if(!url&&/(?:^|\/)potions\.html/.test(plain))url='https://sts2.untapped.gg/en/potions';
  }
  if(!url&&/^https:\/\/sts2\.untapped\.gg\/en\/(?:cards|relics|potions)\//.test(plain))url=plain;
  if(!url)return original;
  const attrs=(before.trimEnd()+' href="'+url+'"'+after).replace(/\s+(?:target|rel|data-same-tab)="[^"]*"/g,'');
  return '<a '+attrs.trim()+' target="_blank" rel="noopener noreferrer">'+body+'</a>';
 })).join('');
}
module.exports={normalize,cardUrl};
