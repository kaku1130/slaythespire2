const fs=require('node:fs');
const icons=require('./resource-icons.cjs');
const {normalize}=require('./sync-card-data.cjs');
const source=JSON.parse(fs.readFileSync('data/cards/effect-tooltips.json','utf8'));
const cards=new Map(JSON.parse(fs.readFileSync('data/cards/source/catalog-en.json','utf8')).cards.map(card=>[card.id,card]));
const assets=require('./data-assets.cjs').load();
const entries=Object.create(null);
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const plain=value=>value.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
function context(text,card,upgraded){
 const values=Object.fromEntries(Object.entries(card.vars||{}).map(([key,value])=>[key.toLowerCase(),value]));
 if(upgraded)for(const [key,value] of Object.entries(card.upgrade||{})){
  const name=key.toLowerCase();
  if(typeof value==='number')values[name]=value;
  else if(typeof value==='string'&&/^[+-]\d+(\.\d+)?$/.test(value)&&typeof values[name]==='number')values[name]+=Number(value);
 }
 return normalize(text).replace(/\{([a-z][a-z0-9]*)(?::diff\(\))?\}/gi,(match,key)=>values[key.toLowerCase()]??match);
}
function content(value){
 return escape(value).replace(/&lt;g&gt;/g,'<em>').replace(/&lt;\/g&gt;/g,'</em>').replace(/&lt;b&gt;/g,'<strong>').replace(/&lt;\/b&gt;/g,'</strong>')
  .replace(/&lt;e\s*\/&gt;/g,icons.energy).replace(/&lt;s\s*\/&gt;/g,icons.star).replace(/\n/g,'<br>');
}
function decorate(html,cardId,upgraded=false){
 const page=source.cards[cardId],card=cards.get(cardId);if(!page||!card)return html;
 const variants=new Map();
 for(const key of page.keys){
  const tip=source.terms[key];let title=context(tip.title,card,upgraded),description=context(tip.card?.description||tip.description||'',card,upgraded);
  // A generic enchantment has no numeric context on the source page.
  description=description.replace(/<b>\{WeakPower\}<\/b>\s*/g,'');
  if(!description||/[{}]/.test(title+description))continue;
  const id=cardId+'|'+key+'|'+(upgraded?'upgraded':'base');
  let icon=tip.icon&&(assets[tip.icon]||'assets/cards/icons/keywords/'+tip.icon.split('/').pop());
  if(icon&&!fs.existsSync(icon))icon=undefined;
  entries[id]={title,html:content(description),...(icon?{icon}:{})};
  const name=plain(tip.title.replace(/\s*\{[^}]*\}/g,'')).toLowerCase();
  const forms=[name];
  if(tip.card)forms.push(name+'s',name+'+',name+'s+');
  if(name==='exhaust')forms.push('exhausted');
  if(name==='channel')forms.push('channeled','channels','channeling');
  if(name==='forge')forms.push('forges');
  for(const form of forms)if(form)variants.set(form,id);
 }
 if(!variants.size)return html;
 const words=[...variants.keys()].sort((a,b)=>b.length-a.length).map(word=>word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
 const pattern=new RegExp('(?<![\\p{L}\\p{N}_])('+words.join('|')+')(?![\\p{L}\\p{N}_])','giu');
 let buttonDepth=0;
 return html.split(/(<[^>]*>)/g).map(part=>{
  if(part.startsWith('<')){if(/^<button\b/i.test(part))buttonDepth++;else if(/^<\/button>/i.test(part))buttonDepth--;return part;}
  if(buttonDepth)return part;
  return part.replace(pattern,word=>'<button type="button" class="detail-effect-keyword" data-effect-tooltip="'+escape(variants.get(word.toLowerCase()))+'" aria-haspopup="dialog">'+word+'</button>');
 }).join('');
}
function markup(){
 const data=JSON.stringify(entries).replace(/</g,'\\u003c');
 return `<!--card-effect-tooltips--><dialog id="card-effect-dialog" aria-labelledby="card-effect-dialog-title" lang="en"><header class="effect-dialog-header"><h2 id="card-effect-dialog-title"></h2><form method="dialog"><button class="effect-dialog-close" type="submit" aria-label="關閉效果說明">×</button></form></header><div id="card-effect-dialog-content"></div></dialog><script type="application/json" id="card-effect-tooltips-data">${data}</script><!--/card-effect-tooltips-->`;
}
function note(cardId,key){
 const term=source.cards[cardId]?.keys.map(id=>source.terms[id]).find(term=>term.key===key);
 if(!term)return '';
 return '<aside class="detail-resource-note" aria-label="'+escape(term.title)+'"><h3>'+escape(term.title)+'</h3><p>'+content(term.description)+'</p></aside>';
}
function notes(cardId){
 decorate('',cardId);decorate('',cardId,true);
 const seen=new Set(),items=[];
 for(const [key,entry] of Object.entries(entries)){
  if(!key.startsWith(cardId+'|'))continue;
  const signature=entry.title+'|'+entry.html;
  if(seen.has(signature))continue;
  seen.add(signature);
  const upgraded=key.endsWith('|upgraded');
  const title=entry.title+(upgraded?' (Upgraded)':'');
  items.push('<aside class="detail-resource-note"><h3>'+escape(title)+'</h3><p>'+entry.html+'</p></aside>');
 }
 return items.length?'<figcaption class="detail-effect-notes">'+items.join('')+'</figcaption>':'';
}
module.exports={decorate,markup,note,notes};
