const fs=require('node:fs'),path=require('node:path');
const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../data/cards/source/spirebird-card-data.json'),'utf8'));
const ids=new Set(source.cards.map(card=>card.id));
module.exports=card=>{
 if(!ids.has(card.id))throw Error('Unknown Spirebird card: '+card.id);
 return 'https://spirebird.com/card.html?id='+encodeURIComponent(card.id)+'&resetRules=all';
};
