const fs=require('node:fs');
const assert=require('node:assert/strict');
const relics=JSON.parse(fs.readFileSync('data/relic/catalog.json','utf8')).items;
const byImage=new Map(relics.map(relic=>[relic.imagePath.split('/').pop(),relic]));
const {render,styles}=require('../relic/relic-card.cjs');
const cardDetails=new Map(JSON.parse(fs.readFileSync('data/cards/english-details.json','utf8')).cards.map(card=>[card.id,card]));
for(const {detail} of JSON.parse(fs.readFileSync('data/cards/special-cards.json','utf8')).cards)if(!cardDetails.has(detail.id))cardDetails.set(detail.id,detail);
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const cardNames=[...new Map([...cardDetails.values()].map(card=>[card.name,card])).values()].sort((a,b)=>b.name.length-a.name.length);
const escapedNames=new Map(cardNames.map(card=>[escape(card.name),card]));
const cardNamePattern=new RegExp('\\b('+[...escapedNames.keys()].map(name=>name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','g');
function emphasizeCardNames(article){
 return article.replace(/<p lang="en">([\s\S]*?)<\/p>/,(_,description)=>'<p lang="en">'+description.split(/(<[^>]*>)/g).map(part=>part.startsWith('<')?part:part.replace(cardNamePattern,name=>{const card=escapedNames.get(name);return '<a class="ancient-relic-card-name" data-card-id="'+card.id+'" data-rarity="'+card.rarity+'" href="'+escape(require('../cards/card-source-link.cjs')(card))+'" target="_blank" rel="noopener noreferrer" lang="en">'+name+'</a>';})).join('')+'</p>');
}
function divAt(html,start){
 const opening=html.slice(start).match(/^<div\b[^>]*>/);assert.ok(opening,'Expected relic div');
 const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=start+opening[0].length;
 let depth=1,tag;
 while(depth&&(tag=tags.exec(html)))depth+=tag[0].startsWith('</')?-1:1;
 assert.equal(depth,0,'Unclosed relic div');
 return {start,contentStart:start+opening[0].length,contentEnd:tag.index,end:tags.lastIndex};
}
function replaceRelics(html){
 let cursor=0;
 while(true){
  const match=/<div\b[^>]*id="(relic-[^"]+)"[^>]*>/.exec(html.slice(cursor));if(!match)break;
  const block=divAt(html,cursor+match.index),original=html.slice(block.start,block.end);
  const image=original.match(/<img\b[^>]*src="([^"]+)"/)?.[1];
  const relic=byImage.get(image?.split('/').pop());assert.ok(relic,'Unknown ancient relic '+match[1]);
  const text=/<div\b[^>]*class="flex-1 min-w-0"[^>]*>/.exec(original);assert.ok(text,'Missing relic text '+match[1]);
  const textBlock=divAt(original,text.index),body=original.slice(textBlock.contentStart,textBlock.contentEnd);
  const name=divAt(body,body.search(/<div\b/));
  const description=divAt(body,body.indexOf('<div',name.end));
  let remaining=body.slice(description.end).trim(),noteCursor=0;
  while(true){
   const note=/<div\b[^>]*style="[^"]*border-image:[^"]*"[^>]*>/.exec(remaining.slice(noteCursor));
   if(!note)break;
   const noteBlock=divAt(remaining,noteCursor+note.index);
   remaining=remaining.slice(0,noteBlock.start)+remaining.slice(noteBlock.end);
   noteCursor=noteBlock.start;
  }
  let previous;
  do{previous=remaining;remaining=remaining.replace(/<div\b[^>]*>\s*<\/div>/g,'').trim();}while(remaining!==previous);
  const extras=remaining?'<div class="ancient-relic-extras">'+remaining+'</div>':'';
  const replacement=emphasizeCardNames(render(relic,{image,id:match[1],className:'ancient-relic-entry',prefix:'../../',extras}));
  html=html.slice(0,block.start)+replacement+html.slice(block.end);cursor=block.start+replacement.length;
 }
 return html;
}
const cardColors={...require('../cards/rarity-text-colors.cjs'),Basic:'#b9c2cc',Uncommon:'#4f9bd9',Curse:'#cf8098',Status:'#b9c2cc',Token:'#b9c2cc',Quest:'#c8ab79'};
const cardNameStyles='\nhtml body main#main-content .ancient-relic-card-name {font-weight:700}\n'+Object.entries(cardColors).map(([rarity,color])=>'html body main#main-content .ancient-relic-card-name[data-rarity='+rarity+'] {color:'+color+'}\n').join('');
module.exports={replaceRelics,styles:styles+cardNameStyles+'\nhtml body main#main-content .ancient-relic-extras {min-width:0;text-align:left}\n'};
