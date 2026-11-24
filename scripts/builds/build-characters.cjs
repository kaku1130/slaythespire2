process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs');
const navigation=require('../cards/site-navigation.cjs');
const data=JSON.parse(fs.readFileSync('data/builds/characters.json','utf8'));
const cards=new Map(JSON.parse(fs.readFileSync('data/cards/english-details.json','utf8')).cards.map(card=>[card.id,card]));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={ironclad:'鐵甲戰士',silent:'靜默獵手',regent:'儲君',necrobinder:'縛亡者',defect:'故障機器人',fool:'Fool'};
const colors={ironclad:'#dc6c68',silent:'#70bf8b',regent:'#e3bf72',necrobinder:'#b595dd',defect:'#6faeee',fool:'#ef9acc'};
const buildHeadingAliases={ironclad:{Strength:'Vulnerable Builds'},necrobinder:{Souls:'Soul Builds'},defect:{Orbs:'Orb and Focus Builds'}};
const effect=require('../event/untapped-effect.cjs');
const rarityColors=require('../cards/rarity-text-colors.cjs');
function rarityAttributes(rarity){
 const name=rarity.charAt(0).toUpperCase()+rarity.slice(1).toLowerCase();
 return ' data-rarity="'+esc(name)+'" style="--card-name-color:'+ (rarityColors[name]||rarityColors.Common)+'"';
}

function cardPreview(id){
 const card=cards.get(id);
 if(!card)throw Error('Missing character guide card: '+id);
 const description=card.effectParts?effect({descEnParts:card.effectParts.base}):esc(card.effect.base);
 return '<figure class="guide-card" data-card-id="'+esc(id)+'"'+rarityAttributes(card.rarity)+'><a class="guide-card-art" href="Cards.html#card-'+esc(id)+'"><img src="'+esc(card.image)+'" alt="'+esc(card.name)+'" loading="lazy"></a><figcaption><span class="guide-card-zh">'+esc(card.nameZh)+'</span><a class="guide-card-name" href="Cards.html#card-'+esc(id)+'">'+esc(card.name)+'</a><span class="guide-card-meta">'+esc(card.rarity)+' · '+esc(card.type)+'</span><p>'+description+'</p></figcaption></figure>';
}

const buildTagsByCharacter=new Map();

const panels=data.characters.map(character=>{
 let body=character.content||'';
 body=body.replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/g,'');
 // The hero already introduces the character; omit the duplicate source banner.
 body=body.replace(/^<div><div><img class="guide-image"[^>]*><\/div><\/div>(?:<p><br><\/p>)?/, '');
 body=body.replace(/<div class="character-card-reference" data-card-id="([^"]+)"><\/div>/g,(_,id)=>cardPreview(id));
 let headingIndex=0;
 const buildHeadings=new Map();
 body=body.replace(/<h([23])>([\s\S]*?)<\/h\1>/g,(_,level,title)=>{
  const id=character.id+'-section-'+headingIndex++;
  buildHeadings.set(title.replace(/<[^>]+>/g,'').trim(),id);
  return '<h'+level+' id="'+id+'">'+title+'</h'+level+'>';
 });
 if(character.cards){
  body='<p class="beta-description">Fool is available on the beta branch. '+character.cards.length+' cards from the source catalog.</p><div class="fool-cards">'+character.cards.map(card=>'<article class="guide-card fool-card"'+rarityAttributes(card.rarity)+'><img class="fool-card-art" src="'+esc(card.image)+'" alt="" loading="lazy"><div><h2>'+esc(card.name)+'</h2><p class="guide-card-meta">'+esc(card.rarity)+' · '+esc(card.type)+' · '+esc(card.cost)+' Energy</p><p>'+esc(card.description)+'</p></div></article>').join('')+'</div>';
 }
 const buildTags=character.tags.map(tag=>{
  const heading=buildHeadingAliases[character.id]?.[tag]||tag+' Builds';
  const target=buildHeadings.get(heading);
  if(!target)throw Error('Missing build heading for '+character.id+': '+tag);
  return '<a class="character-build-link" href="#'+target+'">'+esc(tag)+'</a>';
 }).join('');
 buildTagsByCharacter.set(character.id,buildTags);
 return '<section class="character-panel" id="character-'+character.id+'" data-character-panel="'+character.id+'" style="--character-accent:'+colors[character.id]+'" hidden><div class="character-hero"><img src="'+esc(character.background)+'" alt="" width="1600" height="600"><div><p>'+esc(names[character.id])+'</p><h1>'+esc(character.name)+'</h1><div class="character-tags">'+buildTags+'</div></div></div><div class="character-reading-layout"><article class="character-prose" aria-label="'+esc(character.name)+' 介紹">'+body+'<p class="character-source">資料來源：<a href="'+esc(character.source)+'">Untapped.gg · '+esc(character.name)+'</a></p></article></div></section>';
}).join('');


const tiles=data.characters.map(character=>'<article class="character-tile" data-character="'+character.id+'" style="--character-accent:'+colors[character.id]+'"><img src="'+esc(character.background)+'" alt="" width="900" height="600"><a class="character-tile-link" href="#character-'+character.id+'" aria-label="'+esc(character.name)+' · '+esc(names[character.id])+'"></a><div class="character-tile-content"><span class="character-tile-name">'+esc(character.name)+'</span><span class="character-tile-zh">'+esc(names[character.id])+'</span><div class="character-tags">'+buildTagsByCharacter.get(character.id)+(character.id==='fool'?'<span>Beta</span>':'')+'</div></div></article>').join('');

const html='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png?v=4"><link rel="icon" type="image/x-icon" href="assets/cards/icons/site-favicon.ico?v=4"><title>Characters｜殺戮尖塔2</title><style>'+navigation.styles+navigation.layoutStyles+fs.readFileSync('assets/builds/characters.css','utf8')+'</style></head><body class="characters-page">'+navigation.renderHeader('builds')+'<main id="main-content"><div id="character-index"><header class="characters-heading"><h1>Characters</h1></header><div class="character-grid">'+tiles+'</div></div><div id="character-detail" hidden><div class="character-toolbar"><a class="character-back" href="#characters">← All Characters</a></div>'+panels+'</div></main><script src="assets/builds/characters.js"></script></body></html>';
require('../cards/desktop-page-css.cjs').writeDesktopPage('Characters.html',navigation.openPageLinksInNewTab(html),{searchControls:false,attribution:false});
console.log('Created local Characters page: '+data.characters.length+' characters, five guides and 90 Fool cards.');
