process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const source='https://slaythespire2.net/zh-TW/monster';
const snapshot='data/monster/source/slaythespire2-zh-TW.html';
const normalize=value=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
function parse(html){
 const flight=[...html.matchAll(/self\.__next_f\.push\((\[1,"(?:[^"\\]|\\.)*"\])\)/g)].map(match=>JSON.parse(match[1])[1]).join('');
 let names;
 function walk(value){
  if(typeof value==='string'&&(value.startsWith('{')||value.startsWith('['))){
   let parsed;try{parsed=JSON.parse(value);}catch{return;}
   walk(parsed);
  }else if(value&&typeof value==='object'){
   if(value.encounterNames){names=value.encounterNames;return;}
   for(const child of Object.values(value))walk(child);
  }
 }
 for(const line of flight.split('\n')){
  let record;try{record=JSON.parse(line.replace(/^[0-9a-f]+:/,''));}catch{continue;}
  walk(record);
 }
 assert.ok(names,'Missing Chinese encounter names in reference page');
 return new Map(Object.entries(names).map(([id,name])=>[normalize(id),name]));
}
async function main(){
 if(process.argv.includes('--refresh')){
  const response=await fetch(source,{signal:AbortSignal.timeout(30000)});
  assert.ok(response.ok,'Chinese monster source HTTP '+response.status);
  fs.writeFileSync(snapshot,await response.text());
 }
 const names=parse(fs.readFileSync(snapshot,'utf8'));
 const items=require('../../data/monster/catalog.json').items.filter(item=>item.type!=='Event');
 const translated=Object.fromEntries(items.map(item=>{
  const name=names.get(normalize(item.url.split('/').pop()));
  assert.ok(name,'Missing Chinese name: '+item.id);
  return [item.id,name];
 }));
 fs.writeFileSync('data/monster/names-zh-TW.json',JSON.stringify({source,names:translated},null,2)+'\n');
 console.log('Synced '+items.length+' Chinese encounter names from cached reference page.');
}
module.exports={parse};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
