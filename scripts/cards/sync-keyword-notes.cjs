process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const file='data/cards/english-details.json';
function text(html){return html.replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,'').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[n])).replace(/\s+/g,' ').trim();}
function descriptionParts(html){
 const colored=[];
 const marked=html.replace(/<span\b[^>]*style="color:(#[0-9a-f]{3,8})"[^>]*>([\s\S]*?)<\/span>/gi,(_,color,value)=>'\uE000'+(colored.push({text:text(value),color})-1)+'\uE001');
 const value=text(marked),parts=[];let offset=0;
 for(const match of value.matchAll(/\uE000(\d+)\uE001/g)){
  if(match.index>offset)parts.push({text:value.slice(offset,match.index)});
  parts.push(colored[Number(match[1])]);offset=match.index+match[0].length;
 }
 if(offset<value.length)parts.push({text:value.slice(offset)});
 return parts;
}
function parse(html,url){
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];assert.ok(main,'Missing main: '+url);
 const effect=main.search(/<h2\b[^>]*>Card Effect<\/h2>/);assert.ok(effect>=0,'Missing Card Effect: '+url);
 const head=main.slice(0,effect),notes=[];
 for(const match of head.matchAll(/<div\b[^>]*style="[^"]*border-image:url\(\/images\/card-template\/hover_tip[^/)]*\.webp\)[^"]*"[^>]*>([\s\S]*?<\/p>)/g)){
  const title=match[1].match(/<div\b[^>]*class="[^"]*items-center[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  const description=match[1].match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1];
  assert.ok(title&&description,'Unrecognized tooltip: '+url);
  const frameSource=match[0].match(/border-image:url\(([^)]+)\)/)[1];
  const iconSource=title.match(/<img\b[^>]*src="([^"]+)"/)?.[1];
  const note={name:text(title),description:text(description),frameSource,descriptionParts:descriptionParts(description),...(iconSource?{iconSource}:{})};assert.ok(note.name&&note.description,url);
  if(!notes.some(n=>n.name===note.name))notes.push(note);
 }
 assert.ok(notes.length||!head.includes('border-image:url(/images/card-template/hover_tip'),'No recognized keyword section: '+url);
 return notes;
}
module.exports={parse};
async function main(){
 const data=JSON.parse(fs.readFileSync(file,'utf8')),ids=new Set(JSON.parse(fs.readFileSync('data/cards/cards.json','utf8')).cards.map(c=>c.id));
 const cards=data.cards.filter(c=>ids.has(c.id)),cacheFile='.keyword-notes-audit.json',results=new Map(fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile,'utf8')):[]);let cursor=0,done=0;
 await Promise.all(Array.from({length:6},async()=>{while(cursor<cards.length){const card=cards[cursor++];if(results.has(card.id)){done++;continue;}let notes;
  for(let attempt=0;attempt<4;attempt++)try{
   const response=await fetch(card.source,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(response.status+' '+card.source);
   notes=parse(await response.text(),card.source);break;
  }catch(error){if(attempt===3)throw error;await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));}
  results.set(card.id,notes);done++;if(done%25===0)fs.writeFileSync(cacheFile,JSON.stringify([...results]));if(done%50===0||done===cards.length)console.log('Checked '+done+'/'+cards.length);
 }}));
 const assetFile='data/cards/assets.json',cardAssets=JSON.parse(fs.readFileSync(assetFile,'utf8')),allAssets=require('./data-assets.cjs').load(),downloaded=[];
 const urls=[...new Set([...results.values()].flat().flatMap(note=>[note.frameSource,note.iconSource]).filter(Boolean))];
 for(const url of urls){
  assert.ok(/^\/images\/[a-z0-9_./-]+\.webp$/.test(url),'Unexpected tooltip asset '+url);
  const filename=url.split('/').pop(),target=allAssets[url]||(url.includes('/card-template/')?'assets/cards/source/card-template/':'assets/cards/icons/keywords/')+filename;
  if(!fs.existsSync(target)){
   const response=await fetch('https://slaythespire2.net'+url,{signal:AbortSignal.timeout(30000)});assert.ok(response.ok,'Asset '+url);
   const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.toString('ascii',0,4),'RIFF',url);assert.equal(bytes.toString('ascii',8,12),'WEBP',url);
   if(process.argv.includes('--write')){fs.mkdirSync(require('node:path').dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}downloaded.push(target);
  }
  allAssets[url]=target;if(!cardAssets[url]&&!Object.values(require('./data-assets.cjs').load()).includes(target))cardAssets[url]=target;
 }
 for(const notes of results.values())for(const note of notes){note.frame=allAssets[note.frameSource];delete note.frameSource;if(note.iconSource){note.icon=allAssets[note.iconSource];delete note.iconSource;}}
 const changed=[],added=[];
 for(const card of cards){const notes=results.get(card.id);if(JSON.stringify(card.keywords)!==JSON.stringify(notes)){
  changed.push(card.name);for(const note of notes)if(!card.keywords.some(old=>old.name===note.name))added.push({card:card.name,keyword:note.name});
  card.keywords=notes;
 }}
 assert.deepEqual(results.get('TREMBLE').map(n=>n.name),['Vulnerable','Exhaust']);
 if(process.argv.includes('--write')){data.keywordNotesCheckedAt=new Date().toISOString();fs.writeFileSync(file,JSON.stringify(data,null,2));fs.writeFileSync(assetFile,JSON.stringify(cardAssets,null,2));}
 if(fs.existsSync(cacheFile))fs.unlinkSync(cacheFile);
 console.log(JSON.stringify({checked:cards.length,downloaded:downloaded.length,changed:changed.length,added:added.length,addedTerms:[...new Set(added.map(n=>n.keyword))],sample:added.slice(0,15),written:process.argv.includes('--write')},null,2));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
