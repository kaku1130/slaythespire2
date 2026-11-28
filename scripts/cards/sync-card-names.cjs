process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const {catalog}=require('./site-card-source.cjs');
const source='https://slaythespire2.net/zh-TW/card';
(async()=>{
 const checkedAt=new Date().toISOString();
 let html;
 if(process.argv.includes('--cached'))html=fs.readFileSync('data/cards/source/names-zh-TW-current.html','utf8');
 else{const response=await fetch(source,{signal:AbortSignal.timeout(30000)});assert(response.ok,'Chinese names HTTP '+response.status);html=await response.text();fs.writeFileSync('data/cards/source/names-zh-TW-current.html',html);}
 const localized=new Map(catalog(html).cards.map(card=>[card.id,card]));
 const zhFile='data/cards/cards-zh-TW.json',enFile='data/cards/english-details.json',manifestFile='data/cards/cards.json';
 const zh=JSON.parse(fs.readFileSync(zhFile,'utf8')),en=JSON.parse(fs.readFileSync(enFile,'utf8')),manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
 const changes=[];
 for(const card of zh.cards){
  const current=localized.get(card.id);assert(current,card.id+' missing from name source');
  if(card.name!==current.name){changes.push({id:card.id,before:card.name,after:current.name});card.aliases=[...new Set([...(card.aliases||[]),card.name])].filter(name=>name!==current.name);card.name=current.name;}
 }
 const names=new Map(zh.cards.map(card=>[card.id,card]));
 for(const database of [en,manifest])for(const card of database.cards){
  const current=names.get(card.id);assert(current,card.id+' missing from localized database');card.nameZh=current.name;
  const aliases=[...new Set([...(card.aliases||[]),...(current.aliases||[])])].filter(name=>name!==current.name);
  if(aliases.length)card.aliases=aliases;
 }
 zh.namesCheckedAt=checkedAt;
 const write=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');
 write(zhFile,zh);if(changes.length){write(enFile,en);write(manifestFile,manifest);}
 write('data/cards/chinese-names-source.json',{source,checkedAt,cards:zh.cards.map(card=>({id:card.id,name:card.name,source:source+'/'+localized.get(card.id).slug}))});
 const audit={source,checkedAt,checked:zh.cards.length,changed:changes.length,changes,aliasesPreserved:en.cards.reduce((n,c)=>n+(c.aliases?.length||0),0)};
 write('data/cards/chinese-names-audit.json',audit);console.log(JSON.stringify(audit,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
