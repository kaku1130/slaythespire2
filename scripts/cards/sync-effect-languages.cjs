process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const source='https://slaythespire2.net/zh-TW/card';
const normalize=text=>text===null?null:text.replace(/<(e|s)>(\d+)<\/\1>/g,(_,resource,count)=>('<'+resource+'/>').repeat(Number(count)));
async function main(){
 const cache='data/cards/source/effects-zh-TW.json';
 let data;
 if(process.argv.includes('--cached'))data=JSON.parse(fs.readFileSync(cache,'utf8'));
 else{
  const response=await fetch(source);assert(response.ok,'Chinese card source HTTP '+response.status);
  data=require('./site-card-source.cjs').catalog(await response.text());
  fs.writeFileSync(cache,JSON.stringify(data,null,2)+'\n');
 }
 const englishFile='data/cards/english-details.json';
 const englishData=JSON.parse(fs.readFileSync(englishFile,'utf8')),english=englishData.cards;
 const englishCache='data/cards/source/effects-en.json';
 let englishSource;
 if(process.argv.includes('--cached'))englishSource=JSON.parse(fs.readFileSync(englishCache,'utf8'));
 else{
  const response=await fetch('https://slaythespire2.net/card');assert(response.ok,'English card source HTTP '+response.status);
  englishSource=require('./site-card-source.cjs').catalog(await response.text());
  fs.writeFileSync(englishCache,JSON.stringify(englishSource,null,2)+'\n');
 }
 const cards={},changes=[];
 const previous=JSON.parse(fs.readFileSync('data/cards/effects-zh-TW.json','utf8')).cards;
 assert.equal(data.cards.length,english.length);assert.equal(englishSource.cards.length,english.length);
 for(const card of english){
  const localized=data.cards.find(item=>item.id===card.id);
  const reference=englishSource.cards.find(item=>item.id===card.id);
  assert(localized&&typeof localized.descBase==='string'&&localized.descBase.trim(),'Missing Chinese effect '+card.id);
  assert(reference&&typeof reference.descBase==='string'&&reference.descBase.trim(),'Missing English effect '+card.id);
  assert(card.effect.upgraded===null||typeof localized.descUpgraded==='string','Missing Chinese upgrade '+card.id);
  assert(card.effect.upgraded===null||typeof reference.descUpgraded==='string','Missing English upgrade '+card.id);
  cards[card.id]={base:localized.descBase,upgraded:card.effect.upgraded===null?null:localized.descUpgraded};
  const updated={base:normalize(reference.descBase),upgraded:card.effect.upgraded===null?null:normalize(reference.descUpgraded)};
  for(const field of ['base','upgraded']){
   if(card.effect[field]!==updated[field])changes.push({id:card.id,language:'en',field,before:card.effect[field],after:updated[field]});
   if(previous[card.id]?.[field]!==cards[card.id][field])changes.push({id:card.id,language:'zh-TW',field,before:previous[card.id]?.[field],after:cards[card.id][field]});
  }
  card.effect=updated;
 }
 const checkedAt=new Date().toISOString();englishData.checkedAt=checkedAt;
 fs.writeFileSync(englishFile,JSON.stringify(englishData,null,2)+'\n');
 fs.writeFileSync('data/cards/effects-zh-TW.json',JSON.stringify({source,checkedAt:new Date().toISOString(),cards},null,2)+'\n');
 fs.writeFileSync('data/cards/description-audit.json',JSON.stringify({sources:['https://slaythespire2.net/card',source],checkedAt,total:english.length,matched:english.length,changedCards:new Set(changes.map(x=>x.id)).size,changes,unmatched:[]},null,2)+'\n');
 console.log('Checked bilingual Base/Upgraded effects for '+english.length+' cards; corrected '+new Set(changes.map(x=>x.id)).size+' cards.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
