process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const {payload,jsonAt}=require('./site-card-source.cjs');
const references={
 Ironclad:{Jorbs:'6b3390b7-bcbc-4ebc-ae78-ae9a400c66dc',Baalorlord:'004de170-026a-4dd4-a280-3b904be0b5d6'},
 Silent:{Jorbs:'2cd72d4b-eeb4-42ab-89ca-4ac682137672',Baalorlord:'6d61ea21-0552-4c49-8bb5-a5c15530fc00'},
 Regent:{Jorbs:'c47dbfda-4983-4107-8c9c-c33d5ae32b23',Baalorlord:'0e6c1e23-bec6-4887-a9e0-dbf49ede974d'},
 Necrobinder:{Jorbs:'3ae661e6-6190-4a45-b00e-63e8400fff94',Baalorlord:'43d0b41f-7d6d-4ce9-928e-c1310a413983'},
 Defect:{Jorbs:'5f8d3e04-1f50-4b56-b51a-d8650b000ce3',Baalorlord:'5a512e04-4583-4a16-9271-d46864c6cb4c'}
};
async function main(){
 const lists=Object.entries(references).flatMap(([character,authors])=>Object.entries(authors).map(([author,id])=>({character,author,id,url:'https://sts2.untapped.gg/en/tier-list/'+id})));
 const snapshots=await Promise.all(lists.map(async reference=>{
  const response=await fetch(reference.url,{signal:AbortSignal.timeout(30000)});assert(response.ok,reference.author+' '+reference.character+' HTTP '+response.status);
  const text=payload(await response.text()),marker='"tierList":',index=text.indexOf(marker);assert(index>=0,'Missing tier list '+reference.url);
  const data=jsonAt(text,index+marker.length);assert.equal(data.uuid,reference.id);assert(data.name.includes(reference.author));assert(data.tiers.length,'Empty tiers');
  return {...reference,name:data.name,version:data.version,tiers:data.tiers.map(tier=>({name:tier.name,color:tier.color,cards:tier.cards.map(card=>card.card_id||card.item_id)}))};
 }));
 const cards=JSON.parse(fs.readFileSync('data/cards/english-details.json','utf8')).cards,characters={};
 for(const character of Object.keys(references)){
  characters[character]={};
  for(const author of ['Jorbs','Baalorlord']){
   const source=snapshots.find(x=>x.character===character&&x.author===author),ratings={};
   const known=new Set(cards.filter(card=>card.character===character).map(card=>card.id));
   for(const tier of source.tiers)for(const id of tier.cards)if(known.has(id)){
    assert(!Object.hasOwn(ratings,id),'Duplicate card '+id+' in '+source.url);ratings[id]=tier.name;
   }
   characters[character][author]={url:source.url,name:source.name,version:source.version,ratings};
   console.log(character+' '+author+': '+Object.keys(ratings).length+'/'+known.size+' ranked; '+source.tiers.map(x=>x.name).join(', '));
  }
 }
 const checkedAt=new Date().toISOString();
 fs.writeFileSync('data/cards/source/creator-tier-lists.json',JSON.stringify({checkedAt,lists:snapshots},null,2)+'\n');
 fs.writeFileSync('data/cards/creator-tiers.json',JSON.stringify({checkedAt,characters},null,2)+'\n');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
