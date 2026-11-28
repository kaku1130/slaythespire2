process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const cards=require('../../data/cards/english-details.json').cards;
const cardUrl=require('./card-source-link.cjs');
const file='data/cards/downloaded-card-images.json';
const manifest=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{source:'https://sts2.untapped.gg/en/cards',download:'Download Card Image',language:'en',cards:{}};
let action;
async function discoverAction(){
 const response=await fetch('https://sts2.untapped.gg/en/cards/ironclad/inferno');assert(response.ok,'Could not inspect image download action');
 const html=await response.text();
 const chunks=[...new Set([...html.matchAll(/\/_next\/static\/chunks\/[^"\\\s]+\.js/g)].map(match=>match[0]))];
 let cursor=0;
 await Promise.all(Array.from({length:4},async()=>{while(cursor<chunks.length&&!action){
  const script=await(await fetch('https://sts2.untapped.gg'+chunks[cursor++])).text();
  const match=script.match(/createServerReference\)\("([a-f0-9]{40,64})"[^;]{0,180}"fetchCardImage"/);
  if(match)action=match[1];
 }}));
 assert(action,'Download Card Image action was not found');
}
function pngFromFlight(buffer){
 const signature=Buffer.from([137,80,78,71,13,10,26,10]);
 const start=buffer.indexOf(signature);assert(start>=0,'Download returned no PNG: '+buffer.toString('utf8',0,200));
 let at=start+8;
 while(at+12<=buffer.length){const size=buffer.readUInt32BE(at),type=buffer.toString('ascii',at+4,at+8);at+=size+12;if(type==='IEND')return buffer.subarray(start,at);}
 throw Error('Incomplete PNG download');
}
function save(){fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');}
(async()=>{
 await discoverAction();
 let cursor=0,done=0;const errors=[];
 await Promise.all(Array.from({length:6},async()=>{while(cursor<cards.length){
 const card=cards[cursor++],url=cardUrl(card),slug=new URL(url).pathname.split('/').pop()==='cards'?card.id.toLowerCase().replaceAll('_','-'):new URL(url).pathname.split('/').pop();
 const entry=manifest.cards[card.id]||{source:url};
 if(card.id==='MAD_SCIENCE'){
  const urls=require('../../data/cards/source/untapped-effects.json').urls.filter(url=>url.includes('/en/cards/event/mad-science-'));
  assert.equal(urls.length,9,'Expected nine Mad Science variants');
  const previous=new Map((entry.variants||[]).map(item=>[item.slug,item]));
  const variants=[];
  for(const source of urls){
   const slug=new URL(source).pathname.split('/').pop(),suffix=slug.slice('mad-science-'.length);
   const item=previous.get(slug)||{slug,label:suffix[0].toUpperCase()+suffix.slice(1),source};
   if(!item.effect){
    const page=await fetch(source,{signal:AbortSignal.timeout(30000)});assert(page.ok,'Variant page '+page.status);
    const html=await page.text(),{parse}=require('../relic/sync-untapped-descriptions.cjs');
    const text=parts=>parts.map(p=>p.resource?'<'+(p.resource==='energy'?'e':'s')+'/>':p.text).join('');
    item.effect={base:text(parse(html)),upgraded:text(parse(html,'upgradeDetails'))};
   }
   for(const version of ['base','upgraded']){
    if(item[version]&&fs.existsSync(item[version]))continue;
    const target='assets/cards/images/downloaded/'+slug+(version==='upgraded'?'-upgraded':'')+'.png';
    let error;
    for(let attempt=0;attempt<3;attempt++)try{
     const response=await fetch(source,{method:'POST',headers:{'Next-Action':action,'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(['en',slug,version==='upgraded','png']),signal:AbortSignal.timeout(45000)});
     assert(response.ok,'HTTP '+response.status);const png=pngFromFlight(Buffer.from(await response.arrayBuffer()));
     fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,png);item[version]=target;error=null;break;
    }catch(e){error=e;}
    if(error)errors.push({id:card.id,variant:slug+' '+version,error:error.message});
   }
   variants.push(item);
   manifest.cards[card.id]={source:'https://sts2.untapped.gg/en/cards?search=Mad+Science',base:variants[0].base,upgraded:variants[0].upgraded,variants};save();
   console.log('Mad Science '+item.label+': '+(item.base&&item.upgraded?'downloaded':'incomplete'));
  }
  done++;continue;
 }
 for(const variant of ['base',...(card.effect.upgraded!==null?['upgraded']:[])]){
  if(entry[variant]&&fs.existsSync(entry[variant]))continue;
  const target='assets/cards/images/downloaded/'+card.id.toLowerCase()+(variant==='upgraded'?'-upgraded':'')+'.png';
  let error;
  for(let attempt=0;attempt<3;attempt++)try{
   const response=await fetch(url,{method:'POST',headers:{'Next-Action':action,'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(['en',slug,variant==='upgraded','png']),signal:AbortSignal.timeout(45000)});
   assert(response.ok,'HTTP '+response.status);const png=pngFromFlight(Buffer.from(await response.arrayBuffer()));
   fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,png);entry[variant]=target;error=null;break;
  }catch(e){error=e;}
  if(error)errors.push({id:card.id,variant,error:error.message});
 }
 manifest.cards[card.id]=entry;done++;if(done%25===0||done===cards.length){save();console.log('Downloaded '+done+'/'+cards.length+' cards; failures '+errors.length);}
 }}));
 manifest.errors=errors;save();console.log(JSON.stringify({cards:cards.length,images:Object.values(manifest.cards).reduce((n,c)=>n+(c.variants?c.variants.reduce((total,v)=>total+!!v.base+!!v.upgraded,0):!!c.base+!!c.upgraded),0),errors}));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});

