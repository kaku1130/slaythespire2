process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const {parse,palette}=require('../relic/sync-untapped-descriptions.cjs');
async function main(){
 const file='data/cards/english-details.json',data=JSON.parse(fs.readFileSync(file,'utf8'));
 const cache='data/cards/source/untapped-effects.json',source='https://sts2.untapped.gg/en/cards';
 const snapshot=(process.argv.includes('--cached')||process.argv.includes('--resume'))?JSON.parse(fs.readFileSync(cache,'utf8')):{source,checkedAt:new Date().toISOString(),palette,items:[]};
 if(!snapshot.urls){
  const response=await fetch('https://sts2.untapped.gg/sitemap/cards.xml');assert(response.ok,'Card sitemap HTTP '+response.status);
  snapshot.urls=[...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]).filter(url=>url.includes('/en/'));
 }
 const results=new Map(snapshot.items.filter(x=>!x.error).map(x=>[x.id,x]));let cursor=0,done=0;
 await Promise.all(Array.from({length:6},async()=>{while(cursor<data.cards.length){
  const card=data.cards[cursor++];if(!results.has(card.id)){
   if(card.id==='MAD_SCIENCE'){results.set(card.id,{id:card.id,unavailable:true,reason:'Untapped lists nine specific Mad Science variants rather than the generic card.',url:source});continue;}
   assert(!process.argv.includes('--cached'),'Missing cached card '+card.id);
   const names=[card.id.toLowerCase().replaceAll('_','-'),card.name.toLowerCase().replace(/[’'.!]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')];
   const candidates=snapshot.urls.filter(url=>names.some(slug=>url.endsWith('/'+slug)));
   const url=candidates.find(url=>url.includes('/cards/'+card.character.toLowerCase()+'/'))||candidates[0];assert(url,'Missing card URL '+card.id);
   let error;
   for(let attempt=0;attempt<3;attempt++)try{
    const response=await fetch(url,{signal:AbortSignal.timeout(30000)});assert(response.ok,response.status+' '+url);const html=await response.text();
    const base=parse(html),upgraded=/class="page-module-[^"]*__upgradeDetails"/.test(html)?parse(html,'upgradeDetails'):null;
    results.set(card.id,{id:card.id,name:card.name,url,base,upgraded});error=null;break;
   }catch(e){error=e;}
   if(error){results.set(card.id,{id:card.id,url,error:error.message});console.log('UNMATCHED '+card.id+': '+error.message);}
  }
  done++;if(done%50===0||done===data.cards.length){snapshot.items=[...results.values()];fs.writeFileSync(cache,JSON.stringify(snapshot,null,2)+'\n');console.log('Checked '+done+'/'+data.cards.length);}
 }}));
 snapshot.items=[...results.values()];fs.writeFileSync(cache,JSON.stringify(snapshot,null,2)+'\n');assert(!snapshot.items.some(x=>x.error),'Unmatched cards: '+snapshot.items.filter(x=>x.error).map(x=>x.id).join(', '));
 const changes=[],plain=parts=>parts===null?null:parts.map(p=>p.resource?'<'+(p.resource==='energy'?'e':'s')+'/>':p.text).join('');
 for(const card of data.cards){
  const reference=results.get(card.id);card.sourceEn=reference.url;
  if(reference.unavailable)continue;
  const updated={base:plain(reference.base),upgraded:plain(reference.upgraded)};
  if(JSON.stringify(card.effect)!==JSON.stringify(updated))changes.push({id:card.id,before:card.effect,after:updated});
  card.effect=updated;card.effectParts={base:reference.base,upgraded:reference.upgraded};
 }
 data.descriptionSource=source;data.checkedAt=snapshot.checkedAt;fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
 fs.writeFileSync('data/cards/description-audit.json',JSON.stringify({source,checkedAt:snapshot.checkedAt,total:data.cards.length,matched:snapshot.items.filter(x=>!x.unavailable).length,changes,unmatched:snapshot.items.filter(x=>x.unavailable)},null,2)+'\n');
 console.log('Updated '+data.cards.length+' English card effects and source links.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
