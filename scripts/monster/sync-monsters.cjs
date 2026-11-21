process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path');
const {payload,jsonAt}=require('../cards/site-card-source.cjs');
const origin='https://slaythespire2.net';
async function download(url){const response=await fetch(url);if(!response.ok)throw Error(response.status+' '+url);return response;}
async function main(){
 fs.mkdirSync('data/monster/source',{recursive:true});
 const index=await (await download(origin+'/zh-TW/monster')).text();
 fs.writeFileSync('data/monster/source/index.html',index);
 const text=payload(index),marker='"initial":',catalog=jsonAt(text,text.indexOf(marker)+marker.length);
 const selected=catalog.monsters.filter(monster=>['boss','elite'].includes(monster.encounterType));
 const assets=JSON.parse(fs.readFileSync('data/monster/assets.json','utf8'));
 const allAssets=require('../cards/data-assets.cjs').load();
 for(let i=0;i<selected.length;i+=4)await Promise.all(selected.slice(i,i+4).map(async monster=>{
  const file='data/monster/source/'+monster.slug+'.html';
  if(!fs.existsSync(file)||process.argv.includes('--refresh'))fs.writeFileSync(file,await (await download(origin+'/zh-TW/monster/'+monster.slug)).text());
 }));
 const urls=new Set();
 for(const monster of selected){const html=fs.readFileSync('data/monster/source/'+monster.slug+'.html','utf8').match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];for(const [,url]of html.matchAll(/src="(\/images\/[^"?]+)"/g))urls.add(url);}
 const list=[...urls];
 for(let i=0;i<list.length;i+=6)await Promise.all(list.slice(i,i+6).map(async url=>{
  const target=allAssets[url]||'assets/monster/source/'+url.slice('/images/'.length);
  if(target.includes('..'))throw Error('Invalid asset path');
  if(!fs.existsSync(target)){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,Buffer.from(await (await download(origin+url)).arrayBuffer()));}
  if(target.startsWith('assets/monster/'))assets[url]=target;
 }));
 fs.writeFileSync('data/monster/assets.json',JSON.stringify(assets,null,2));
 fs.writeFileSync('data/monster/catalog.json',JSON.stringify({...catalog,source:origin+'/zh-TW/monster',retrievedAt:new Date().toISOString()},null,2));
 console.log('Synced '+selected.length+' Boss/Elite monsters and '+list.length+' asset references.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
