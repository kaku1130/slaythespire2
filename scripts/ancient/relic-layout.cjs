const fs=require('node:fs');
const assert=require('node:assert/strict');
const relics=JSON.parse(fs.readFileSync('data/relic/catalog.json','utf8')).items;
const byImage=new Map(relics.map(relic=>[relic.imagePath.split('/').pop(),relic]));
const {render,styles}=require('../relic/relic-card.cjs');
function divAt(html,start){
 const opening=html.slice(start).match(/^<div\b[^>]*>/);assert.ok(opening,'Expected relic div');
 const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=start+opening[0].length;
 let depth=1,tag;
 while(depth&&(tag=tags.exec(html)))depth+=tag[0].startsWith('</')?-1:1;
 assert.equal(depth,0,'Unclosed relic div');
 return {start,contentStart:start+opening[0].length,contentEnd:tag.index,end:tags.lastIndex};
}
function replaceRelics(html){
 let cursor=0;
 while(true){
  const match=/<div\b[^>]*id="(relic-[^"]+)"[^>]*>/.exec(html.slice(cursor));if(!match)break;
  const block=divAt(html,cursor+match.index),original=html.slice(block.start,block.end);
  const image=original.match(/<img\b[^>]*src="([^"]+)"/)?.[1];
  const relic=byImage.get(image?.split('/').pop());assert.ok(relic,'Unknown ancient relic '+match[1]);
  const text=/<div\b[^>]*class="flex-1 min-w-0"[^>]*>/.exec(original);assert.ok(text,'Missing relic text '+match[1]);
  const textBlock=divAt(original,text.index),body=original.slice(textBlock.contentStart,textBlock.contentEnd);
  const name=divAt(body,body.search(/<div\b/));
  const description=divAt(body,body.indexOf('<div',name.end));
  let remaining=body.slice(description.end).trim(),noteCursor=0;
  // Delete source help boxes while keeping the attached card entries and context.
  while(true){
   const note=/<div\b[^>]*style="[^"]*border-image:[^"]*"[^>]*>/.exec(remaining.slice(noteCursor));
   if(!note)break;
   const noteBlock=divAt(remaining,noteCursor+note.index);
   remaining=remaining.slice(0,noteBlock.start)+remaining.slice(noteBlock.end);
   noteCursor=noteBlock.start;
  }
  let previous;
  do{previous=remaining;remaining=remaining.replace(/<div\b[^>]*>\s*<\/div>/g,'').trim();}while(remaining!==previous);
  const extras=remaining?'<div class="ancient-relic-extras">'+remaining+'</div>':'';
  const replacement=render(relic,{image,id:match[1],className:'ancient-relic-entry',extras});
  html=html.slice(0,block.start)+replacement+html.slice(block.end);cursor=block.start+replacement.length;
 }
 return html;
}
module.exports={replaceRelics,styles:styles+'\nhtml body main#main-content .ancient-relic-extras {min-width:0;text-align:left}\n'};
