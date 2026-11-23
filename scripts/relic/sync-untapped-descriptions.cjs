process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const palette={aqua:'#2aebbe',cream:'#fff6e2',gold:'#efc851',red:'#f55',green:'#7fff00',blue:'#87ceeb',darkblue:'#67aeeb',orange:'#ffa518',pink:'#ff78a0',purple:'violet'};
const decode=s=>s.replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,key)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[key]));
function parse(html,section='description'){
 const match=html.match(new RegExp('<div\\b[^>]*class="page-module-[^"]*__'+section+'"[^>]*>([\\s\\S]*?)<\\/div>'));
 assert(match,'Missing relic description');
 const parts=[],stack=[];
 for(const token of match[1].match(/<[^>]+>|[^<]+/g)||[]){
  if(token.startsWith('</')){stack.pop();continue;}
  if(/^<br\b/.test(token)){parts.push({text:'\n'});continue;}
  if(/^<img\b/.test(token)){
   const identity=token.toLowerCase();assert(/energy|star/.test(identity),'Unexpected description image '+token);
   parts.push({resource:identity.includes('energy')?'energy':'star'});continue;
  }
  if(token.startsWith('<')){
   const category=token.match(/ParsedTextDisplay-[^"\s]*__(\w+)/)?.[1];
   const color=palette[category]||(['keyword','tokenLink'].includes(category)?palette.gold:category==='enchantmentLink'?palette.purple:stack.at(-1));
   stack.push(color);continue;
  }
  parts.push({text:decode(token),...(stack.at(-1)?{color:stack.at(-1)}:{})});
 }
 assert(parts.length,'Empty relic description');return parts;
}
async function main(){
 const file='data/relic/catalog.json',data=JSON.parse(fs.readFileSync(file,'utf8'));
 const cache='data/relic/source/untapped-descriptions.json';
 const snapshot=(process.argv.includes('--cached')||process.argv.includes('--resume'))?JSON.parse(fs.readFileSync(cache,'utf8')):{source:'https://sts2.untapped.gg/en/relics',checkedAt:new Date().toISOString(),palette,items:[]};
 if(!snapshot.relicUrls){
  const response=await fetch('https://sts2.untapped.gg/sitemap/relics.xml');assert(response.ok,'Relic sitemap HTTP '+response.status);
  snapshot.relicUrls=[...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]).filter(url=>url.includes('/en/'));
 }
 const results=new Map(snapshot.items.filter(x=>!x.error).map(x=>[x.id,x]));let cursor=0,done=0;
 await Promise.all(Array.from({length:6},async()=>{while(cursor<data.items.length){
  const item=data.items[cursor++];if(!results.has(item.id)){
   assert(!process.argv.includes('--cached'),'Missing cached relic '+item.id);
   const pool=['Ancient','Event','Shop'].includes(item.rarity)?item.rarity.toLowerCase():['Shared','Event','Fallback'].includes(item.pool)?'colorless':item.pool.toLowerCase();
   const specialSlugs={CHOSEN_CHEESE:'chosen-cheese',FAKE_LEES_WAFFLE:'fake-lees-waffle',FAKE_MERCHANTS_RUG:'fake-merchants-rug',FAKE_SNECKO_EYE:'fake-snecko-eye'};
   const slug=specialSlugs[item.id]||item.nameEn.toLowerCase().replace(/[’'.]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
   const url='https://sts2.untapped.gg/en/relics/'+pool+'/'+slug;
   let error;
   for(let attempt=0;attempt<3;attempt++)try{
    const response=await fetch(url,{signal:AbortSignal.timeout(30000)});assert(response.ok,response.status+' '+url);
    const parts=parse(await response.text());results.set(item.id,{id:item.id,name:item.nameEn,url,parts});error=null;break;
   }catch(e){error=e;}
   if(error){results.set(item.id,{id:item.id,name:item.nameEn,url,error:error.message});console.log('UNMATCHED '+item.id+': '+error.message);}
  }
  done++;if(done%50===0||done===data.items.length)console.log('Checked '+done+'/'+data.items.length);
 }}));
 snapshot.items=[...results.values()].filter(x=>data.items.some(item=>item.id===x.id));fs.writeFileSync(cache,JSON.stringify(snapshot,null,2)+'\n');
 const missing=snapshot.items.filter(x=>x.error);assert.equal(missing.length,0,'Unmatched relics: '+missing.map(x=>x.id).join(', '));
 const changes=[];
 for(const item of data.items){
  const reference=results.get(item.id),text=reference.unavailable?item.descEn:reference.parts.map(p=>p.resource?'<'+(p.resource==='energy'?'e':'s')+'/>':p.text).join('');
  if(item.descEn!==text)changes.push({id:item.id,before:item.descEn,after:text});
  item.descEn=text;if(reference.parts)item.descEnParts=reference.parts;item.descriptionClean=text.replace(/<[es]\/>/g,'');item.description=text;
  item.sourceEn=reference.url;
  delete item.descI18n;
 }
 data.englishSource=snapshot.source;data.descriptionSource=snapshot.source;
 fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
 fs.writeFileSync('data/relic/description-audit.json',JSON.stringify({source:snapshot.source,checkedAt:snapshot.checkedAt,total:data.items.length,matched:snapshot.items.filter(x=>!x.unavailable).length,changes,unmatched:snapshot.items.filter(x=>x.unavailable)},null,2)+'\n');
 console.log('Updated '+data.items.length+' English descriptions and colors; removed Chinese effects.');
}
module.exports={parse,palette};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
