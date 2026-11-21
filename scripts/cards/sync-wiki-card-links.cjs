process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const source='https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Cards_List';
const cache='data/cards/source/wiki-sts2-cards-list.html';
const decode=value=>value.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&nbsp;/g,' ');
async function main(){
 if(!fs.existsSync(cache)||process.argv.includes('--refresh')){
  const url='https://slaythespire.wiki.gg/api.php?'+new URLSearchParams({action:'parse',page:'Slay_the_Spire_2:Cards_List',prop:'text',format:'json'});
  const response=await fetch(url);assert(response.ok,'Wiki HTTP '+response.status);
  const result=await response.json();assert(!result.error,JSON.stringify(result.error));
  fs.writeFileSync(cache,result.parse.text['*']);
 }
 const html=fs.readFileSync(cache,'utf8');
 const links=new Map([...html.matchAll(/<a\b[^>]*href="(\/wiki\/Slay_the_Spire_2:[^"]+)"[^>]*>([^<]+)<\/a>/g)].map(match=>[decode(match[2]),new URL(decode(match[1]),source).href]));
 const cards=JSON.parse(fs.readFileSync('data/cards/english-details.json','utf8')).cards;
 const special=JSON.parse(fs.readFileSync('data/cards/special-cards.json','utf8')).cards.map(item=>item.detail);
 const urls={};
 for(const card of [...cards,...special]){
  const name=['Strike','Defend'].includes(card.name)?card.name+' ('+card.character+')':card.name;
  const url=links.get(name);assert(url,'Missing Wiki card '+card.id+' / '+name);
  urls[card.id]=url;
 }
 fs.writeFileSync('data/cards/wiki-links.json',JSON.stringify({source,urls},null,2)+'\n');
 console.log('Mapped '+Object.keys(urls).length+' cards to Wiki card pages, including character variants and token anchors.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
