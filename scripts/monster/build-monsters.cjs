process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const navigation=require('../cards/site-navigation.cjs');
const catalog=JSON.parse(fs.readFileSync('data/monster/catalog.json','utf8'));
const assets=require('../cards/data-assets.cjs').load();
const monsters=catalog.monsters.filter(monster=>['boss','elite'].includes(monster.encounterType));
const chapters=[['act1a','密林'],['act1b','暗港'],['act2','蟲巢'],['act3','榮耀']];
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function contents(html,start){
 const opening=html.slice(start).match(/^<div\b[^>]*>/);assert(opening);
 const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=start+opening[0].length;
 let depth=1,tag;while(depth&&(tag=tags.exec(html)))depth+=tag[0].startsWith('</')?-1:1;
 assert.equal(depth,0);return html.slice(start+opening[0].length,tag.index);
}
function detail(monster){
 const source=fs.readFileSync('data/monster/source/'+monster.slug+'.html','utf8');
 const main=source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
 const start=main.indexOf('<div class="max-w-3xl mx-auto">');assert(start>=0,monster.slug);
 let html=contents(main,start).replace(/<a\b[^>]*>\s*(?:<svg\b[\s\S]*?<\/svg>)?全部怪物<\/a>/,'');
 html=html.replace(/<section\b[^>]*>\s*<h2\b[^>]*>共同出現<\/h2>[\s\S]*?<\/section>/g,'')
  .replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/\son\w+="[^"]*"/gi,'')
  .replace(/<h1\b/g,'<h3').replace(/<\/h1>/g,'</h3>')
  .replace(/\s(?:srcset|srcSet)="[^"]*"/g,'')
  .replace(/src="([^"]+)"/g,(_,url)=>{if(url.startsWith('data:'))return 'src="'+url+'"';assert(assets[url],'Missing monster asset '+url);return 'src="'+assets[url]+'"';})
  .replace(/\bid="([^"]+)"/g,(_,id)=>'id="monster-'+monster.slug+'-'+id+'"')
  .replace(/href="([^"]+)"/g,(_,url)=>{
   if(url.startsWith('#'))return 'href="#monster-'+monster.slug+'-'+url.slice(1)+'"';
   const slug=url.match(/^\/zh-TW\/monster\/([^#?]+)$/)?.[1];
   if(slug&&monsters.some(item=>item.slug===slug))return 'href="#monster-'+slug+'"';
   return 'href="'+escape(url.startsWith('/')?'https://slaythespire2.net'+url:url)+'" target="_blank" rel="noopener noreferrer"';
  });
 for(const [oldName,label]of [['第一章 - 蔓生之地','密林'],['第一章 - 水底碼頭','暗港'],['第二章 - 蟲巢','蟲巢'],['第三章 - 榮光之殿','榮耀']])html=html.replaceAll(oldName,label);
 return '<article class="monster-card" id="monster-'+monster.slug+'" data-monster-id="'+monster.id+'" data-monster-type="'+monster.encounterType+'">'+html+'</article>';
}
function encountersFor(act,type){
 const encounters=new Map();
 for(const monster of monsters)for(const encounter of monster.encounters||[]){
  if(encounter.act!==act||encounter.type!==type)continue;
  if(!encounters.has(encounter.id))encounters.set(encounter.id,{...encounter,members:[]});
  const group=encounters.get(encounter.id);
  if(!group.members.some(member=>member.id===monster.id))group.members.push(monster);
 }
 return [...encounters.values()];
}
function encounterBlock(encounter){
 const order=monster=>{const index=encounter.monsters.indexOf(monster.id);return index<0?Infinity:index;};
 const members=[...encounter.members].sort((a,b)=>order(a)-order(b));
 const combined=members.length>1||encounter.monsters.length>1;
 return '<div class="monster-encounter'+(combined?' is-combined':'')+'" data-encounter-id="'+encounter.id+'" id="encounter-'+encounter.id+'" data-encounter-type="'+encounter.type+'">'+members.map(detail).join('')+'</div>';
}
function encounterOverview(act){
 const byId=new Map(monsters.map(monster=>[monster.id,monster]));
 return '<section class="monster-encounter-overview"><h2>戰鬥組合</h2>'+[['boss','Boss'],['elite','Elite']].map(([type,label])=>'<div class="monster-encounter-category"><h3><span class="monster-type-label" data-type="'+type+'">'+label+'</span></h3><ul>'+encountersFor(act,type).map(encounter=>'<li data-overview-encounter="'+encounter.id+'"><a class="monster-encounter-jump" href="#encounter-'+encounter.id+'">'+escape(catalog.encounterNames[encounter.id]||byId.get(encounter.monsters[0]).name)+' ('+encounter.monsters.length+')</a>：'+encounter.monsters.map(id=>{const monster=byId.get(id);assert(monster,'Unknown encounter member '+id);return '<a class="monster-overview-member" data-member-id="'+id+'" href="#monster-'+monster.slug+'"><img src="'+assets[monster.image]+'" alt="" width="36" height="36"><span>'+escape(monster.name)+'</span></a>';}).join('、')+'</li>').join('')+'</ul></div>').join('')+'</section><h2 class="monster-detail-heading">詳細資料</h2>';
}
function runtime(){
 const buttons=[...document.querySelectorAll('[data-monster-chapter]')],chapters=[...document.querySelectorAll('.monster-chapter')];
 function show(act){
  for(const chapter of chapters)chapter.hidden=chapter.dataset.act!==act;
  for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.monsterChapter===act));
 }
 for(const button of buttons)button.addEventListener('click',()=>{show(button.dataset.monsterChapter);document.getElementById('main-content').scrollIntoView({block:'start'});});
 function route(){const target=document.getElementById(location.hash.slice(1));const chapter=target?.closest('.monster-chapter');if(chapter){show(chapter.dataset.act);requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}}
 window.addEventListener('hashchange',route);route();
}
const menu='<nav class="monster-chapter-menu" aria-label="怪物章節">'+chapters.map(([act,label],index)=>'<button type="button" data-monster-chapter="'+act+'" aria-controls="monster-chapter-'+act+'" aria-pressed="'+(index===0)+'">'+label+'</button>').join('')+'</nav>';
const content=chapters.map(([act,label],index)=>'<section class="monster-chapter" id="monster-chapter-'+act+'" data-act="'+act+'"'+(index?' hidden':'')+' aria-label="'+label+'">'+require('./overgrowth-wiki.cjs').render(act)+'</section>').join('');
const html='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>怪物｜Boss 與Elite</title><link rel="icon" href="assets/cards/icons/site-logo.webp"><link rel="stylesheet" href="assets/event/styles/source.css"><style>'+navigation.styles+navigation.layoutStyles+fs.readFileSync('assets/monster/monster-desktop.css','utf8')+'</style></head><body>'+navigation.renderHeader('monster')+'<main id="main-content" class="monster-page">'+menu+content+'</main><script>('+runtime.toString()+')();</script></body></html>';
require('../cards/desktop-page-css.cjs').writeDesktopPage('monster.html',html,{searchControls:false});
console.log('Built monster.html: '+monsters.length+' Boss/Elite monsters, '+chapters.length+' chapters; full details, no search.');
