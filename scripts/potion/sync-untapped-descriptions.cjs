process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const {parse,palette}=require('../relic/sync-untapped-descriptions.cjs');
async function main(){
 const file='data/potion/catalog.json',data=JSON.parse(fs.readFileSync(file,'utf8'));
 const cache='data/potion/source/untapped-descriptions.json',source='https://sts2.untapped.gg/en/potions';
 const snapshot=process.argv.includes('--cached')?JSON.parse(fs.readFileSync(cache,'utf8')):{source,checkedAt:new Date().toISOString(),palette,items:[]};
 if(!process.argv.includes('--cached')){
  const response=await fetch('https://sts2.untapped.gg/sitemap/potions.xml');assert(response.ok,'Potion sitemap HTTP '+response.status);
  const urls=[...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]).filter(url=>url.includes('/en/'));let cursor=0,done=0;
  await Promise.all(Array.from({length:6},async()=>{while(cursor<data.items.length){
   const item=data.items[cursor++],slug=item.id.toLowerCase().replaceAll('_','-'),url=urls.find(url=>url.endsWith('/'+slug));assert(url,'Missing potion URL '+item.id);
   let error;
   for(let attempt=0;attempt<3;attempt++)try{
    const response=await fetch(url,{signal:AbortSignal.timeout(30000)});assert(response.ok,response.status+' '+url);
    snapshot.items.push({id:item.id,name:item.nameEn,url,parts:parse(await response.text())});error=null;break;
   }catch(e){error=e;}
   if(error)throw error;
   done++;if(done%20===0||done===data.items.length)console.log('Checked '+done+'/'+data.items.length);
  }}));
  snapshot.items.sort((a,b)=>a.id.localeCompare(b.id));fs.writeFileSync(cache,JSON.stringify(snapshot,null,2)+'\n');
 }
 const changes=[];assert.equal(snapshot.items.length,data.items.length);
 for(const item of data.items){
  const reference=snapshot.items.find(x=>x.id===item.id);assert(reference,'Missing potion '+item.id);
  const text=reference.parts.map(p=>p.resource?'<'+(p.resource==='energy'?'e':'s')+'/>':p.text).join('');
  if(item.descEn!==text)changes.push({id:item.id,before:item.descEn,after:text});
  Object.assign(item,{descEn:text,descEnParts:reference.parts,descriptionClean:text.replace(/<[es]\/>/g,''),description:text,sourceEn:reference.url});delete item.descI18n;
 }
 data.englishSource=source;data.descriptionSource=source;
 fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');fs.writeFileSync('data/potion/description-audit.json',JSON.stringify({source,checkedAt:snapshot.checkedAt,total:data.items.length,matched:snapshot.items.length,changes,unmatched:[]},null,2)+'\n');
 console.log('Updated '+data.items.length+' English potion effects, colors and source links.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
