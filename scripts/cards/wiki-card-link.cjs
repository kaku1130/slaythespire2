const fs=require('node:fs'),path=require('node:path');
const {urls}=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../data/cards/wiki-links.json'),'utf8'));
module.exports=card=>{
 const url=urls[card.id];
 if(!url)throw Error('Missing Wiki card link: '+card.id);
 return url;
};
