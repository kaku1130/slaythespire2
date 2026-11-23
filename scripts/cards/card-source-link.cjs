const fs=require('node:fs'),path=require('node:path');
const cards=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../data/cards/english-details.json'),'utf8')).cards;
const urls=new Map(cards.map(card=>[card.id,card.sourceEn]));
module.exports=card=>card.sourceEn||urls.get(card.id)||require('./wiki-card-link.cjs')(card);
