const fs=require('node:fs');
const chapters={act1a:['overgrowth','密林'],act1b:['underdocks','暗港'],act2:['hive','蟲巢'],act3:['glory','榮耀']};
const catalog=JSON.parse(fs.readFileSync('data/monster/catalog.json','utf8'));
const assets=require('../cards/data-assets.cjs').load();
const monsters=new Map(catalog.monsters.map(monster=>[monster.id,monster]));
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const wiki=page=>'https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:'+page;
function sourceName(name,page){
 return '<a class="wiki-monster-name-link" href="'+esc(wiki(page))+'" target="_blank" rel="noopener noreferrer">'+esc(name)+'</a>';
}
const inlineIcons={block:'https://slaythespire.wiki.gg/images/StS2_Intent_Defend.png',status:'https://slaythespire.wiki.gg/images/StS2_CardIcon_Status.png',tainted:'https://slaythespire.wiki.gg/images/StS2_Icon_Tainted.png'};
function powerDescription(text){
 return esc(text).replace(/\{icon:(\w+)\}/g,(_,name)=>{
  const image=assets[inlineIcons[name]];
  if(!image)throw Error('Missing inline Power icon: '+name);
  return '<img class="wiki-power-inline-icon" src="'+esc(image)+'" alt="" width="20" height="20">';
 }).replace(/\n/g,'<br>');
}
function powerList(powers){
 if(!powers.length)return '<span class="wiki-no-powers">None</span>';
 return '<ul class="wiki-power-list">'+powers.map(power=>{
  const image=assets[power.icon];
  if(!image)throw Error('Missing Power icon: '+power.name);
  return '<li><div class="wiki-power-name"><img src="'+esc(image)+'" alt="" width="28" height="28"><strong>'+esc(power.name)+(power.amount?' '+esc(power.amount):'')+'</strong></div><p>'+powerDescription(power.description)+'</p></li>';
 }).join('')+'</ul>';
}
function entityInfo(entity,type,page,showName=true){
 const monster=monsters.get(entity.id);
 const name=entity.name||monster.name;
 const rows=[['Type',entity.type||(entity.id==='WRIGGLER'?'Summoned':type==='elite'?'Elite':'Boss')],['Power',entity.powers]];
 return '<section class="wiki-monster-entity" id="monster-'+monster.slug+(entity.phase?'-phase-'+entity.phase:'')+'" data-monster-id="'+entity.id+'">'+(showName?'<h3>'+sourceName(name,page)+'</h3>':'')+'<div class="wiki-entity-header"><img src="'+assets[monster.image]+'" alt="'+esc(name)+'" width="224" height="224"><table class="wiki-monster-infobox" aria-label="'+esc(name)+'資訊"><tbody>'+rows.map(([key,value])=>'<tr><th scope="row">'+key+'</th><td>'+(key==='Power'?powerList(value):key==='Type'&&['Elite','Boss'].includes(value)?'<span class="monster-type-label" data-type="'+type+'">'+value+'</span>':esc(value))+'</td></tr>').join('')+'</tbody></table></div></section>';
}
function overview(data){
 return '<section class="wiki-monster-overview" aria-label="怪物總表">'+[['elite','Elite'],['boss','Boss']].map(([type,label])=>'<section><h3><span class="monster-type-label" data-type="'+type+'">'+label+'</span></h3><div class="wiki-overview-grid">'+data.encounters.filter(item=>item.type===type).map(item=>'<a class="wiki-overview-tile" href="#encounter-'+item.id+'"><img src="'+assets[monsters.get(item.imageId).image]+'" alt="" width="88" height="88"><span>'+esc(item.title)+'</span></a>').join('')+'</div></section>').join('')+'</section>';
}
function render(act='act1a'){
 const [file]=chapters[act];
 const data=JSON.parse(fs.readFileSync('data/monster/'+file+'-wiki.json','utf8'));
 return overview(data)+'<div class="wiki-monster-details">'+data.encounters.map(item=>'<article class="wiki-monster-detail" id="encounter-'+item.id+'" data-wiki-encounter="'+item.id+'" data-monster-type="'+item.type+'"><header><h2>'+sourceName(item.title,item.page)+'</h2></header>'+(item.summary?'<p>'+esc(item.summary)+'</p>':'')+item.entities.map(entity=>entityInfo(entity,item.type,item.page,item.entities.length>1)).join('')+'</article>').join('')+'</div>';
}
module.exports={render};
