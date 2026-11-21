process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {catalog,payload,jsonAt}=require('./site-card-source.cjs');
const sourceDirectory='data/cards/source';
const normalize=value=>String(value||'').replace(/\\n/g,'\n').replace(/<e>(\d+)<\/e>/g,(_,n)=>'<e/>'.repeat(Number(n))).replace(/<s>(\d+)<\/s>/g,(_,n)=>n+'<s/>');
function normalizeEffect(value,card){
 const effect=normalize(value);
 // The catalog drops fixed energy prefixes such as Orbit's four-energy threshold.
 const threshold=card.description?.match(/\{energyPrefix:energyIcons\((\d+)\)\}/)?.[1];
 return Number(threshold)>1?effect.replace(/<e\/>/,(icon,index)=>/\d\s*$/.test(effect.slice(0,index))?icon:threshold+icon):effect;
}
const comparable=value=>typeof value==='string'?normalize(value).replace(/\s+/g,' ').trim():JSON.stringify(value);
const date=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const write=(file,data)=>fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
function upgradeCost(card){
 const next=card.upgrade?.energy;
 return next===undefined?card.energy:typeof next==='string'&&/^[+-]/.test(next)?card.energy+Number(next):Number(next);
}
async function fetchPage(url){
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});assert.ok(response.ok,response.status+' '+url);return response.text();
}
async function main(){
 fs.mkdirSync(sourceDirectory,{recursive:true});
 const checkedAt=new Date().toISOString(),pages={};
 for(const language of ['en','zh-TW']){
  const url='https://slaythespire2.net/'+(language==='en'?'':language+'/')+'card';
  const html=await fetchPage(url),initial=catalog(html);
  pages[language]={source:url,checkedAt,version:html.match(/v\d+\.\d+\.\d+/)?.[0],...initial};
  write(sourceDirectory+'/catalog-'+language+'.json',pages[language]);
 }
 const html=await fetchPage('https://slaythespire2.net/card-tier-list'),flight=payload(html),start=flight.indexOf('"initial":');
 assert.ok(start>=0);const tierData=jsonAt(flight,start+'"initial":'.length);
 write(sourceDirectory+'/tier-list-en.json',{source:'https://slaythespire2.net/card-tier-list',checkedAt,...tierData});
 const reference=pages.en.cards,localized=new Map(pages['zh-TW'].cards.map(card=>[card.id,card]));
 assert.equal(reference.length,569);assert.equal(reference.filter(card=>card.rarity==='Ancient').length,19);
 assert.equal(new Set(reference.map(card=>card.id)).size,reference.length);assert.equal(localized.size,reference.length);
 const before=JSON.parse(fs.readFileSync('data/cards/cards-source.json','utf8')),old=new Map(before.map(card=>[card.id,card]));
 const oldDetails=new Map(JSON.parse(fs.readFileSync('data/cards/english-details.json','utf8')).cards.map(card=>[card.id,card]));
 const oldChinese=new Map(JSON.parse(fs.readFileSync('data/cards/cards-zh-TW.json','utf8')).cards.map(card=>[card.id,card]));
 const assets=JSON.parse(fs.readFileSync('data/cards/assets.json','utf8')),sharedAssets=require('./data-assets.cjs').load();
 const art=new Map();let cursor=0;
 await Promise.all(Array.from({length:4},async()=>{while(cursor<reference.length){
  const card=reference[cursor++];assert.ok(/^\/images\/cards\/[a-z0-9_/]+\.webp$/.test(card.imagePath),card.id+' image path');
  const local=sharedAssets[card.imagePath]||'assets/cards/source/'+card.imagePath.slice('/images/'.length);
  if(!fs.existsSync(local)){
   const response=await fetch('https://slaythespire2.net'+card.imagePath,{signal:AbortSignal.timeout(30000)});assert.ok(response.ok,card.id+' image');
   const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
   fs.mkdirSync(path.dirname(local),{recursive:true});fs.writeFileSync(local,bytes);
  }
  assets[card.imagePath]=local;art.set(card.id,local);
 }}));
 const rankings=tierData.lists.flatMap(list=>Object.entries(list.groups).flatMap(([tier,cards])=>cards.map(card=>({id:card.id,name:card.name,category:list.character,tier}))));
 const tiers=new Map(rankings.map(card=>[card.id,card.tier]));
 const fields=['id','name','pool','type','rarity','slug','energy','starCost','upgrade','unplayable','availability','canGenerateInCombat','multiplayerOnly'];
 const cards=[],chinese=[],details=[],changes=[];
 for(const raw of reference){
  const zh=localized.get(raw.id);assert.ok(zh&&zh.slug===raw.slug,raw.id+' localized card');
  const card=Object.fromEntries(fields.filter(key=>raw[key]!==undefined).map(key=>[key,raw[key]]));
  card.descBase=normalizeEffect(raw.descBase,raw);card.descUpgraded=normalizeEffect(raw.descUpgraded,raw);cards.push(card);
  const prior=oldChinese.get(card.id),aliases=[...(prior?.aliases||[]),...(prior&&prior.name!==zh.name?[prior.name]:[])];
  chinese.push({id:card.id,name:zh.name,slug:card.slug,descBase:normalizeEffect(zh.descBase,zh),descUpgraded:normalizeEffect(zh.descUpgraded,zh),...(aliases.length?{aliases:[...new Set(aliases)].filter(name=>name!==zh.name)}:{})});
  const changed=old.has(card.id)?['name','pool','type','rarity','energy','starCost','upgrade','descBase','descUpgraded'].filter(key=>comparable(old.get(card.id)[key])!==comparable(card[key])):['added'];
  if(changed.length)changes.push({id:card.id,name:card.name,fields:changed});
  const cost=card.energy===undefined?'No cost (unplayable)':(card.energy===-1?'X':card.energy)+'<e/>',next=upgradeCost(card);
  const stats=[{label:'Energy cost',value:next!==card.energy?cost+' → '+next+'<e/>':cost},
   ...(card.starCost!==undefined?[{label:'Star cost',value:card.starCost+'<s/>'}]:[]),
   {label:'Type',value:card.type},{label:'Rarity',value:card.rarity},{label:'Character',value:card.pool},{label:'Target',value:raw.target||'None'}];
  const icons={Ironclad:'ironclad',Silent:'silent',Defect:'defect',Regent:'regent',Necrobinder:'necrobinder',Colorless:'colorless',Event:'event',Curse:'other',Quest:'other'};
  const available=!!card.upgrade||card.descBase!==card.descUpgraded;
  details.push({...oldDetails.get(card.id),id:card.id,name:card.name,nameZh:zh.name,source:'https://slaythespire2.net/card/'+card.slug,
   type:card.type,rarity:card.rarity,character:card.pool,tier:tiers.get(card.id)||null,
   effect:{base:card.descBase,upgraded:available?card.descUpgraded:null},stats,
   keywords:(raw.keywords||[]).map(name=>({name,description:Object.values(pages.en.hoverTips).find(tip=>tip.title===name)?.description||''})),
   builds:oldDetails.get(card.id)?.builds||[],aliases:[...new Set(aliases)].filter(name=>name!==zh.name),version:pages.en.version,
   image:art.get(card.id),characterIcon:'assets/cards/icons/'+icons[card.pool]+'.webp'});
 }
 const ids=new Set(cards.map(card=>card.id)),special=JSON.parse(fs.readFileSync('data/cards/special-cards.json','utf8'));
 const merged=special.cards.filter(entry=>ids.has(entry.card.id)).map(entry=>entry.card.id);special.cards=special.cards.filter(entry=>!ids.has(entry.card.id));
 const removed=before.filter(card=>!ids.has(card.id)).map(card=>({id:card.id,name:card.name}));
 const audit={source:pages.en.source,version:pages.en.version,checkedAt,referenceCount:cards.length,supplementalCount:special.cards.length,
  ancient:cards.filter(card=>card.rarity==='Ancient').map(card=>({id:card.id,name:card.name,nameZh:localized.get(card.id).name,source:'https://slaythespire2.net/card/'+card.slug})),
  added:changes.filter(change=>change.fields.includes('added')),changed:changes.filter(change=>!change.fields.includes('added')),removed,mergedSupplemental:merged};
 write('data/cards/cards-source.json',cards);
 write('data/cards/cards-zh-TW.json',{source:pages['zh-TW'].source,version:pages.en.version,retrievedDate:date(),namesCheckedAt:checkedAt,cards:chinese});
 write('data/cards/english-details.json',{source:pages.en.source,retrievedDate:date(),version:pages.en.version,checkedAt,total:details.length,cards:details});
 write('data/cards/tiers-source.json',{source:'https://slaythespire2.net/card-tier-list',version:pages.en.version,retrievedDate:date(),rankings});
 write('data/cards/special-cards.json',special);write('data/cards/assets.json',assets);
 write('data/cards/chinese-names-source.json',{source:pages['zh-TW'].source,checkedAt,cards:cards.map(card=>({id:card.id,name:localized.get(card.id).name,source:'https://slaythespire2.net/zh-TW/card/'+card.slug}))});
 write('data/cards/card-audit.json',audit);
 console.log(JSON.stringify({version:audit.version,checked:cards.length,ancient:audit.ancient.length,added:audit.added.length,changed:audit.changed.length,removed,mergedSupplemental:merged,supplemental:special.cards.length,rankings:rankings.length},null,2));
}
module.exports={normalize,normalizeEffect,upgradeCost};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
