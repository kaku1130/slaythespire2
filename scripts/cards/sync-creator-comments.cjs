process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const {payload,jsonAt}=require('./site-card-source.cjs');
const {characters}=require('../../data/cards/creator-tiers.json');
const cards=new Map(require('../../data/cards/english-details.json').cards.map(card=>[card.id,card]));
async function main(){
 const comments={},sources={};
 for(const [character,lists] of Object.entries(characters)){
  const source=lists.Jorbs.url,file='data/cards/source/jorbs-'+character.toLowerCase()+'.html';
  if(!process.argv.includes('--cached')){
   const response=await fetch(source,{signal:AbortSignal.timeout(45000)});
   assert.ok(response.ok,source+' HTTP '+response.status);
   fs.writeFileSync(file,await response.text());
  }
  const text=payload(fs.readFileSync(file,'utf8')),marker='"tierList":',start=text.indexOf(marker);
  assert.ok(start>=0,'Missing tier list '+source);
  const list=jsonAt(text,start+marker.length);
  assert.ok(list.name.includes('Jorbs'));
  sources[character]={url:source,name:list.name,version:list.version};
  for(const tier of list.tiers)for(const item of tier.cards){
   const id=item.card_id||item.item_id;
   if(cards.get(id)?.character!==character||!item.commentary?.trim())continue;
   assert.ok(!comments[id],'Duplicate Jorbs comment: '+id);
   comments[id]={text:item.commentary.trim(),source,version:item.commentary_version||list.version};
  }
 }
 assert.ok(comments.OFFERING?.text.startsWith("Thinking about Offering like it's letting you play an entire extra turn"));
 const data={author:'Jorbs',checkedAt:new Date().toISOString(),sources,comments};
 fs.writeFileSync('data/cards/creator-comments.json',JSON.stringify(data,null,2)+'\n');
 console.log('Cached '+Object.keys(comments).length+' Jorbs comments; existing tier ratings unchanged.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
