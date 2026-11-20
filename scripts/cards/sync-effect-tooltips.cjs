process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const {payload,jsonAt}=require('./site-card-source.cjs');
async function main(){
 const cards=JSON.parse(fs.readFileSync('data/cards/english-details.json','utf8')).cards;
 const file='data/cards/effect-tooltips.json',version=JSON.parse(fs.readFileSync('data/cards/source/catalog-en.json','utf8')).version;
 let previous=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{terms:{},cards:{}};
 if(process.argv.includes('--refresh')||(previous.version&&previous.version!==version))previous={terms:{},cards:{}};
 const data={source:'https://slaythespire2.net/card',version,checkedAt:new Date().toISOString(),terms:{...previous.terms},cards:{...previous.cards}};
 let cursor=0,checked=0;
 await Promise.all(Array.from({length:4},async()=>{while(cursor<cards.length){
  const card=cards[cursor++];
  if(!data.cards[card.id]){
   let tips,refs;
   const cached='data/cards/source/effect-pages/'+new URL(card.source).pathname.split('/').pop()+'.json';
   if(fs.existsSync(cached)){const page=JSON.parse(fs.readFileSync(cached,'utf8'));tips=page.tips;refs=page.refs;}
   else for(let attempt=0;attempt<3;attempt++)try{
    const response=await fetch(card.source,{signal:AbortSignal.timeout(30000)});assert.ok(response.ok,response.status+' '+card.source);
    const text=payload(await response.text());tips={};
    for(const match of text.matchAll(/"hoverTips":/g)){const start=match.index+match[0].length;if(text[start]==='{')Object.assign(tips,jsonAt(text,start));}
    for(const match of text.matchAll(/"tipRefs":/g)){const start=match.index+match[0].length;if(text[start]==='{')refs={...(refs||{}),...jsonAt(text,start)};}
    break;
   }catch(error){if(attempt===2)throw error;}
   assert.ok(tips,card.id+' tooltip source');
   const keys=[];
   for(const tip of Object.values(tips)){
    const hash=createHash('sha256').update(JSON.stringify(tip)).digest('hex').slice(0,12);
    const key=tip.key+':'+hash;data.terms[key]=tip;keys.push(key);
   }
   data.cards[card.id]={source:card.source,keys,...(refs?{refs}:{})};
  }
  checked++;if(checked%50===0||checked===cards.length){fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');console.log('Checked '+checked+'/'+cards.length+' English card pages');}
 }}));
 data.cards=Object.fromEntries(cards.map(card=>[card.id,data.cards[card.id]]));
 const used=new Set(Object.values(data.cards).flatMap(card=>card.keys));data.terms=Object.fromEntries(Object.entries(data.terms).filter(([key])=>used.has(key)));
 fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
 console.log(JSON.stringify({cards:cards.length,definitions:Object.keys(data.terms).length},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
