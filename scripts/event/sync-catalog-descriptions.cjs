process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const {payload,jsonAt}=require('../cards/site-card-source.cjs');
async function main(){
 for(const kind of ['relic','potion']){
  const snapshots={};
  for(const language of ['en','zh-TW']){
   const source='https://slaythespire2.net/'+(language==='en'?'':language+'/')+kind;
   const cache='data/'+kind+'/source/descriptions-'+language+'.json';
   if(process.argv.includes('--cached'))snapshots[language]=JSON.parse(fs.readFileSync(cache,'utf8'));
   else{
    const response=await fetch(source);assert(response.ok,source+' HTTP '+response.status);
    const text=payload(await response.text()),start=text.indexOf('"initial":');assert(start>=0,'Missing catalog');
    const items=jsonAt(text,start+10)[kind==='relic'?'relics':'potions'];
    assert(Array.isArray(items)&&items.length,'Empty source');
    snapshots[language]={source,retrievedDate:new Date().toISOString(),items:items.map(x=>({id:x.id,imagePath:x.imagePath,name:x.name,description:x.descI18n,descriptionClean:x.descriptionClean}))};
    fs.writeFileSync(cache,JSON.stringify(snapshots[language],null,2)+'\n');
   }
  }
  const file='data/'+kind+'/catalog.json',catalog=JSON.parse(fs.readFileSync(file,'utf8')),changes=[];
  // Validate every match before changing the catalog. Keep names, rarity and layout intact.
  const updates=catalog.items.map(item=>{
   const matches=Object.fromEntries(Object.entries(snapshots).map(([language,snapshot])=>{
    const match=snapshot.items.find(x=>x.id===item.id||(!x.id&&x.imagePath===(item.imagePath||item.image)));
    assert(match&&typeof match.description==='string'&&match.description.trim(),'Missing '+language+' '+item.id);
    return [language,match];
   }));
   return {item,values:{descEn:matches.en.description,descI18n:matches['zh-TW'].description,descriptionClean:matches['zh-TW'].descriptionClean}};
  });
  for(const {item,values}of updates)for(const [field,value]of Object.entries(values))if(item[field]!==value){
   changes.push({id:item.id,field,before:item[field],after:value});item[field]=value;
  }
  fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n');
  const audit={sources:Object.values(snapshots).map(x=>x.source),retrievedDate:new Date().toISOString(),total:catalog.items.length,matched:updates.length,changedItems:new Set(changes.map(x=>x.id)).size,changes,unmatched:[]};
  fs.writeFileSync('data/'+kind+'/description-audit.json',JSON.stringify(audit,null,2)+'\n');
  console.log(kind+': checked '+updates.length+'; updated '+audit.changedItems+' descriptions.');
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
