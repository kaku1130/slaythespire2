process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path');
const origin='https://slaythespire.wiki.gg';
const files=['overgrowth','underdocks','hive','glory'];
function divAt(html,start){
 const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=start;
 let depth=0,tag;
 while((tag=tags.exec(html))){depth+=tag[0].startsWith('</')?-1:1;if(!depth)return {html:html.slice(start,tags.lastIndex),end:tags.lastIndex};}
 throw Error('Unclosed Wiki div');
}
function divs(html,className){
 const matches=[],tags=/<div\b[^>]*class="([^"]*)"[^>]*>/g;let tag;
 while((tag=tags.exec(html)))if(tag[1].split(/\s+/).includes(className)){const block=divAt(html,tag.index);matches.push(block.html);tags.lastIndex=block.end;}
 return matches;
}
const plain=html=>html.replace(/<br\s*\/?>/g,' ').replace(/<[^>]+>/g,'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&#x([a-f0-9]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").replace(/\s+/g,' ').trim();
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(url){
 for(let attempt=0;attempt<4;attempt++){
  const r=await fetch(url);
  if(r.status===429&&attempt<3){await pause(Math.min(60000,1000*(Number(r.headers.get('retry-after'))||10*(attempt+1))));continue;}
  if(!r.ok)throw Error(r.status+' '+url);return r;
 }
}
async function main(){
 const entries=files.flatMap(file=>JSON.parse(fs.readFileSync('data/monster/'+file+'-wiki.json','utf8')).encounters);
 const cache='data/monster/wiki-powers.json';
 const pages=fs.existsSync(cache)&&!process.argv.includes('--refresh')?JSON.parse(fs.readFileSync(cache,'utf8')).pages:{};
 for(const entry of entries){
  if(pages[entry.page])continue;
  const url=origin+'/api.php?'+new URLSearchParams({action:'parse',page:'Slay_the_Spire_2:'+entry.page,prop:'text',format:'json'});
  const response=await (await get(url)).json();if(response.error)throw Error(JSON.stringify(response.error));
  const html=response.parse.text['*'];
  const boxes=divs(html,'druid-infobox');
  const powers=boxes.filter(box=>box.includes('druid-row-StackType')).map(box=>{
   const title=divs(box,'druid-data-Title')[0]||'';
   const file=title.match(/href="\/wiki\/File:([^"?]+)"/);
   return {name:plain(title),stackType:plain(divs(box,'druid-data-StackType')[0]||''),description:plain(divs(box,'druid-data-Text')[0]||''),icon:file?origin+'/images/'+file[1]:null};
  });
  const entities=boxes.filter(box=>box.includes('druid-container-enemy-infobox')).map(box=>({name:plain(divs(box,'druid-title')[0]||''),powers:plain(divs(box,'druid-data-Powers')[0]||'')}));
  pages[entry.page]={source:origin+'/wiki/Slay_the_Spire_2:'+entry.page,entities,powers};
  fs.writeFileSync(cache,JSON.stringify({checkedAt:new Date().toISOString(),pages},null,2)+'\n');
  console.log(entry.page+': '+powers.length+' Powers');
  await pause(1100);
 }
 const assets=JSON.parse(fs.readFileSync('data/monster/assets.json','utf8'));
 const icons=[...new Set(Object.values(pages).flatMap(page=>page.powers.map(power=>power.icon)).filter(Boolean))];
 for(const url of icons){
  const target='assets/monster/powers/wiki/'+decodeURIComponent(new URL(url).pathname.split('/').pop());
  if(!fs.existsSync(target)){
   const response=await get(url);if(!response.headers.get('content-type')?.startsWith('image/'))throw Error('Not an image: '+url);
   fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,Buffer.from(await response.arrayBuffer()));
   await pause(1100);
  }
  assets[url]=target;
 }
 fs.writeFileSync('data/monster/wiki-powers.json',JSON.stringify({checkedAt:new Date().toISOString(),pages},null,2)+'\n');
 fs.writeFileSync('data/monster/assets.json',JSON.stringify(assets,null,2)+'\n');
 console.log('Synced '+entries.length+' Wiki pages and '+icons.length+' Power icons.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
