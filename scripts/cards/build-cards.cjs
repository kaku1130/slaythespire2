process.chdir(require('node:path').resolve(__dirname,'../..'));
const cardArt=require('./card-art-preview.cjs');
const cardGrid=require('./card-grid-view.cjs');
const toolbarRwd=require('./card-toolbar-rwd.cjs');
const resourceIcons=require('./resource-icons.cjs');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const navigation = require('./site-navigation.cjs');
const preferences=require('./site-preferences.cjs');
const cards = JSON.parse(fs.readFileSync('data/cards/cards-source.json', 'utf8'));
const chineseSource = JSON.parse(fs.readFileSync('data/cards/cards-zh-TW.json','utf8'));
const chineseCards = new Map(chineseSource.cards.map(c=>[c.id,c]));
const tierSource = JSON.parse(fs.readFileSync('data/cards/tiers-source.json', 'utf8'));
const buildSource = JSON.parse(fs.readFileSync('data/builds/source.json', 'utf8'));
const buildsByCard = buildSource.byCard;
const tiers = new Map(tierSource.rankings.map(c=>[c.id,c.tier]));
const categories = ['Ironclad', 'Silent', 'Defect', 'Regent', 'Necrobinder', 'Colorless', 'Curse', 'Event', 'Quest'];
const categoryMenu=categories;
const expected = [87, 88, 88, 88, 88, 64, 18, 27, 3];
assert.equal(cards.length, 551);
assert.equal(new Set(cards.map(c => c.id)).size, 551);
categories.forEach((p, i) => assert.equal(cards.filter(c => c.pool === p).length, expected[i]));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const poolLabels={Ironclad:'鐵甲戰士',Silent:'靜默獵手',Defect:'故障機器人',Necrobinder:'亡靈契約師',Regent:'儲君',Colorless:'無色',Curse:'詛咒',Event:'事件',Quest:'任務'};
const colors = ['#dc6c68', '#70bf8b', '#6faeee', '#e3bf72', '#b595dd', '#aab6c4', '#cf8098', '#6ac1b4', '#c8ab79'];
const poolColors=Object.fromEntries(categories.map((pool,i)=>[pool,colors[i]]));
function compareCards(a,b,key='rarity',direction=1){
  const rarityOrder=['Basic','Common','Uncommon','Rare','Ancient','Event','Curse','Quest'];
  const text=(x,y)=>String(x).localeCompare(String(y),'en',{sensitivity:'base'});
  const rank=x=>{const i=rarityOrder.indexOf(x);return i<0?rarityOrder.length:i;};
  const rarity=(x,y)=>rank(x)-rank(y)||text(x,y);
  const tierRank=x=>{const i=['S','A','B','C','D'].indexOf(x);return i<0?5:i;};
  if(key==='tier'){const ar=tierRank(a.tier),br=tierRank(b.tier);if(ar===5||br===5){if(ar!==br)return ar===5?1:-1;}else if(ar!==br)return (ar-br)*direction;}
  if(key==='energy'){const energyRank=x=>x==='X'?100:x==='—'||x===undefined?101:Number(x);const ar=energyRank(a.energy),br=energyRank(b.energy);if(ar===101||br===101){if(ar!==br)return ar===101?1:-1;}else if(ar!==br)return (ar-br)*direction;}
  const primary=['tier','energy'].includes(key)?0:key==='rarity'?rarity(a.rarity,b.rarity):text(a[key],b[key]);
  return primary*direction||(key==='rarity'?tierRank(a.tier)-tierRank(b.tier):0)||text(a.name,b.name)||rarity(a.rarity,b.rarity)||text(a.id,b.id);
}
const iconNames={Ironclad:'ironclad',Silent:'silent',Defect:'defect',Necrobinder:'necrobinder',Regent:'regent',Colorless:'colorless',Curse:'other',Event:'event',Quest:'other'};
const poolIcons=Object.fromEntries(Object.entries(iconNames).map(([pool,name])=>{
  const image=fs.readFileSync('assets/cards/icons/'+name+'.webp');
  assert.equal(image.toString('ascii',0,4),'RIFF');assert.equal(image.toString('ascii',8,12),'WEBP');
  return [pool,'data:image/webp;base64,'+image.toString('base64')];
}));

const typeLabels={Attack:'攻擊',Skill:'技能',Power:'能力',Curse:'詛咒',Quest:'任務'};
const typeColors={Attack:'#ff6568',Skill:'#74b3e6',Power:'#05df72',Curse:'#e3e8ee',Quest:'#e3e8ee'};
const filterTypes=['Attack','Power','Skill'];
const rarityLabels={Basic:'基礎',Common:'普通',Uncommon:'罕見',Rare:'稀有',Ancient:'先古之民',Event:'事件',Curse:'詛咒',Quest:'任務'};
const displayedRarities=['Basic','Common','Uncommon','Rare','Ancient'];
const canUpgrade=c=>!!c.upgrade||c.descBase!==c.descUpgraded;
const renderEffect=value=>esc(value||'—').replace(/&lt;g&gt;/g,'<span class="effect-keyword">').replace(/&lt;\/g&gt;/g,'</span>').replace(/&lt;e\/&gt;/g,'<span class="effect-resource" title="Energy">'+resourceIcons.energy+'</span>').replace(/&lt;e&gt;(.*?)&lt;\/e&gt;/g,(_,amount)=>'<span class="effect-resource" title="Energy">'+amount.replace(/\s+/g,'')+resourceIcons.energy+'</span>').replace(/&lt;s&gt;(.*?)&lt;\/s&gt;/g,(_,amount)=>'<span class="effect-star" title="Stars">'+amount.replace(/\s+/g,'')+resourceIcons.star+'</span>').replace(/\\n|\r?\n/g,'<br>');
function upgradedEnergy(c){const delta=c.upgrade?.energy;if(delta===undefined||c.energy===undefined)return c.energy;return typeof delta==='string'&&/^[+-]/.test(delta)?c.energy+Number(delta):Number(delta);}
function renderUpgraded(c){
  const zh=chineseCards.get(c.id),parts=[];
  if(canUpgrade(c)&&zh.descBase.trim()!==zh.descUpgraded.trim())parts.push(renderEffect(zh.descUpgraded));
  const nextCost=upgradedEnergy(c);
  if(c.energy!==undefined&&nextCost<c.energy)parts.push('<span class="upgraded-cost">Cost：'+esc(costLabel(c.energy))+' → '+esc(costLabel(nextCost))+'</span>');
  return parts.length?parts.join('<br>'):'<span class="not-available">—</span>';
}

const costLabel=value=>value===undefined?'—':value===-1?'X':String(value);
function renderEnergy(c){
  if(c.energy===undefined)return '<span class="not-available" title="No cost (unplayable)">—</span>';
  let result='<span class="energy-value">'+esc(costLabel(c.energy))+'</span>';
  if(c.starCost!==undefined)result+='<span class="star-cost" title="Additional star cost">'+esc(costLabel(c.starCost))+resourceIcons.star+'</span>';
  return result;
}
const localBuildUrl=b=>'builds.html#build-'+b.character+'-'+b.buildId;
function renderBuilds(c){const builds=buildsByCard[c.id]||[];if(!builds.length)return '<span class="not-available">—</span>';return '<div class="build-inline-list">'+builds.map(b=>'<div class="build-association"><a data-build-pool="'+esc(b.characterPool)+'" style="--build-color:'+poolColors[b.characterPool]+'" href="'+esc(localBuildUrl(b))+'">'+esc(b.name)+'</a><span class="build-role-label">'+(b.role==='core'?'核心卡片':'輔助卡片')+'</span></div>').join('')+'</div>';}

const cardImages=JSON.parse(fs.readFileSync('data/cards/card-images.json','utf8'));
const cardTableImages=JSON.parse(fs.readFileSync('data/cards/card-table-images.json','utf8'));
function renderCardImage(c,kind){const src=cardImages[c.id]?.[kind];if(!src)return '<span class="not-available">—</span>';const alt=chineseCards.get(c.id).name+(kind==='base'?'（升級前）':'（升級後）');return '<button type="button" class="card-image-button" aria-pressed="false" aria-label="'+esc(alt)+'，雙擊前往表格中的此卡片"><img class="card-image" src="'+esc(src)+'" alt="'+esc(alt)+'" width="340" height="454" loading="lazy" decoding="async"></button>';}
function renderCardImages(c){return '<div class="card-images-pair" data-card-image-id="'+esc(c.id)+'"><figure>'+renderCardImage(c,'base')+'</figure></div>';}

const columns=[['english','ID'],['name','Name'],['images','圖片'],['effect','Effect'],['upgraded','Upgraded'],['tier','Tier'],['builds','Builds'],['type','Type'],['energy','Cost'],['rarity','Rarity'],['pool','Category']];
const visibleColumns=new Set(columns.map(([key])=>key).filter(key=>key!=='images'));
const buildNameWidth=Math.max(...Object.values(buildsByCard).flat().map(b=>Array.from(b.name).reduce((width,char)=>width+(/[\u2e80-\uffff]/.test(char)?24:14),0)));
const fixedColumnWidths={english:196,name:144,builds:Math.ceil(buildNameWidth)+24,type:112,energy:112,tier:100,rarity:120,pool:144};
const flexibleColumnWeights={effect:1,upgraded:1};
const fixedWidth=Object.entries(fixedColumnWidths).filter(([key])=>visibleColumns.has(key)).reduce((sum,[,width])=>sum+width,0);
const flexibleWeight=Object.values(flexibleColumnWeights).reduce((sum,weight)=>sum+weight,0);
const columnGroup='<colgroup>'+columns.filter(([key])=>visibleColumns.has(key)).map(([key])=>'<col data-column="'+key+'" style="width:'+(fixedColumnWidths[key]?(fixedColumnWidths[key]+'px'):'calc((100% - '+fixedWidth+'px) * '+(flexibleColumnWeights[key]/flexibleWeight).toFixed(8)+')')+'">').join('')+'</colgroup>';

function heading(key,label,rowspan=''){return '<th scope="col" data-field="'+key+'"'+(key==='pool'?' class="category-column"':'')+(rowspan?' rowspan="2"':'')+(key==='english'?' class="english-name"':'')+' aria-sort="'+(key==='rarity'?'ascending':'none')+'"><button type="button" class="sort-button" data-sort="'+key+'" aria-label="'+label+(key==='rarity'?', ascending; click to sort descending':', click to sort ascending')+'">'+label+'<span class="sort-icon" aria-hidden="true">'+(key==='rarity'?'↑':'↕')+'</span></button></th>';}
const tableHead='<thead role="rowgroup"><tr>'+columns.filter(([key])=>visibleColumns.has(key)).map(([key,label])=>heading(key,label)).join('')+'</tr></thead>';

const sections = categories.map((pool, i) => {
  const list = cards.filter(c => c.pool === pool).sort((a,b) => compareCards({...a,tier:tiers.get(a.id)},{...b,tier:tiers.get(b.id)}));
  const rows = list.map(c => {
    const values={images:renderCardImages(c),english:'<a class="name-en" data-card-art="'+esc(c.id)+'" href="https://slaythespire2.net/card/'+encodeURIComponent(c.slug)+'" target="_blank" rel="noopener noreferrer">'+esc(c.name)+'</a>',name:'<a data-card-art="'+esc(c.id)+'" data-rarity="'+esc(c.rarity)+'" href="https://slaythespire2.net/zh-TW/card/'+encodeURIComponent(c.slug)+'" target="_blank" rel="noopener noreferrer">'+'<span class="name-zh" lang="zh-Hant">'+esc(chineseCards.get(c.id).name)+'</span></a>',type:'<span class="type" data-type="'+esc(c.type)+'">'+esc(typeLabels[c.type])+'</span>',energy:renderEnergy(c),effect:renderEffect(chineseCards.get(c.id).descBase),upgraded:renderUpgraded(c),rarity:'<span class="rarity" data-rarity="'+esc(c.rarity)+'">'+esc(displayedRarities.includes(c.rarity)?rarityLabels[c.rarity]:'—')+'</span>',tier:'<span class="tier" data-tier="'+(tiers.get(c.id)||'unranked')+'"'+(tiers.has(c.id)?'':' title="Not ranked by source"')+'>'+(tiers.get(c.id)||'—')+'</span>',builds:renderBuilds(c),pool:esc(pool)};
    return '<tr id="card-'+esc(c.id)+'" role="row" data-name="'+esc((c.name+' '+chineseCards.get(c.id).name).toLowerCase())+'" data-id="'+esc(c.id)+'" data-search="'+esc([c.id,c.name,chineseCards.get(c.id).name,chineseCards.get(c.id).descBase,canUpgrade(c)?chineseCards.get(c.id).descUpgraded:''].join(' ').replace(/<[^>]*>/g,'').toLowerCase())+'" data-type="'+esc(c.type)+'" data-rarity="'+esc(c.rarity)+'">'+columns.map(([key,label])=>'<td role="cell" data-field="'+key+'" data-label="'+label+'"'+(key==='energy'?' data-sort-value="'+esc(costLabel(c.energy))+'"':key==='name'?' data-sort-value="'+esc(c.name)+'"':key==='rarity'?' data-sort-value="'+esc(c.rarity)+'"':key==='type'?' data-sort-value="'+esc(c.type)+'"':'')+' class="'+({english:'english-name',name:'name',pool:'category',effect:'effect',upgraded:'effect upgraded',builds:'builds',energy:'energy'}[key]||key)+'">'+values[key]+'</td>').join('')+'</tr>';
  }).join('\n');
  return `<section data-pool="${pool}" style="--accent:${colors[i]}"><h2 class="grid-pool-heading"><img src="${poolIcons[pool]}" alt="" width="28" height="28">${poolLabels[pool]} <span class="grid-pool-name-en" lang="en">${pool}</span> <span class="grid-pool-count">(${list.length})</span></h2><div class="mobile-sort"><label for="sort-${pool}">Sort by</label><select id="sort-${pool}" class="mobile-sort-key">${columns.filter(([key])=>visibleColumns.has(key)).map(([key,label])=>`<option value="${key}"${key==='pool'?' hidden disabled':''}${key==='rarity'?' selected':''}>${label}</option>`).join('')}</select><button type="button" class="mobile-sort-direction" aria-label="Ascending; click to sort descending">↑ Asc</button></div><div class="table-wrap"><table role="table"><caption class="sr-only">${pool} 卡片名稱，共 ${list.length} 張</caption>${columnGroup}${tableHead}<tbody role="rowgroup">${rows}</tbody></table></div></section>`;
}).join('\n');
const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><link rel="apple-touch-icon" sizes="180x180" href="assets/cards/icons/site-logo.png"><link rel="icon" type="image/webp" href="assets/cards/icons/site-logo.webp"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Slay the Spire 2｜551 張卡片名稱索引</title>
<style>
:root{color-scheme:dark;--ink:#e3e8ee;--muted:#86909b;--line:#1a222b;--paper:#080e14;--bg:#040609;--link:#0a8fd1;--focus:#37a8ec}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Arial,"Microsoft JhengHei",sans-serif;font-size:14px;line-height:1.6}main{max-width:2200px;margin:0 auto;padding:28px 32px 48px}a{color:var(--link);text-underline-offset:4px}a:hover{color:#19affe}input,select,button{font:inherit}input,select{width:100%;height:42px;padding:9px 12px;border:1px solid var(--line);border-radius:6px;background:var(--paper);color:var(--ink)}input::placeholder{color:var(--muted)}input:focus-visible,select:focus-visible,button:focus-visible,a:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
.tools{margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid var(--line)}.controls{display:flex;align-items:end;gap:14px}.field{flex:1}label{display:block;font-size:12px;color:var(--muted);margin-bottom:6px}.category-field{max-width:250px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chips button{display:inline-flex;align-items:center;gap:8px;--accent:var(--ink);border:1px solid var(--accent);border-color:color-mix(in srgb,var(--accent) 45%,var(--line));border-radius:6px;padding:6px 12px;background:var(--paper);background:color-mix(in srgb,var(--accent) 7%,var(--paper));color:var(--accent);cursor:pointer;transition:background .15s,border-color .15s,color .15s,box-shadow .15s}.chips button:hover{border-color:var(--accent);background:#141b24;background:color-mix(in srgb,var(--accent) 16%,var(--paper))}.chips button[aria-pressed=true]{background:var(--accent);color:var(--bg);border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}.result{font-size:12px;color:var(--muted);margin:16px 0 0;font-variant-numeric:tabular-nums}
section{margin-bottom:32px;scroll-margin-top:20px}h2{font-size:22px;font-weight:650;line-height:1.4;display:flex;align-items:center;gap:10px;margin:0 0 14px;color:var(--accent)}.section-count{font-size:13px;font-weight:400;color:var(--muted);font-variant-numeric:tabular-nums}.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:8px;background:var(--paper)}table{width:100%;min-width:1700px;border-collapse:collapse;text-align:left;font-size:14px}th{padding:11px 18px;background:#11171d;border-bottom:1px solid var(--line);font-size:12px;font-weight:500;color:var(--muted)}td{padding:10px 18px;border-bottom:1px solid var(--line)}tbody tr:last-child td{border-bottom:0}tbody tr{transition:background .15s}tbody tr:hover{background:#141b24}.name{min-width:165px;font-weight:600}.name a{color:var(--rarity-color,#aab6c4);text-decoration:none}.name a:hover{color:var(--rarity-color,#aab6c4);text-decoration:underline}.num{width:76px;color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}td.category{color:var(--accent);font-size:13px}.type,.rarity{font-size:13px}.type[data-type=Attack]{color:#ff6568}.type[data-type=Skill]{color:#74b3e6}.type[data-type=Power]{color:#05df72}.type[data-type=Curse],.type[data-type=Quest]{color:var(--ink)}.rarity{color:var(--rarity-color,#aab6c4)}[data-rarity]{--rarity-color:#aab6c4}[data-rarity=Uncommon]{--rarity-color:#74b3e6}[data-rarity=Rare]{--rarity-color:#e3bf72}[data-rarity=Ancient]{--rarity-color:#c49aef}[data-rarity=Curse]{--rarity-color:#cf8098}[data-rarity=Event],[data-rarity=Quest]{--rarity-color:#6ac1b4}
footer{font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:20px}[hidden]{display:none!important}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}#empty{padding:40px;text-align:center;color:var(--muted)}
@media(max-width:640px){main{padding:20px 16px 32px}.controls{flex-direction:column;align-items:stretch}.category-field{max-width:none}.chips{gap:6px}.chips button{padding:5px 10px;font-size:12px}td,th{padding:10px 12px}h2{font-size:20px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
@media print{:root{color-scheme:light;--ink:#17212b;--muted:#53606c;--line:#cdd3da;--paper:white;--bg:white}body{background:white}main{max-width:none;padding:0}.tools{display:none}.table-wrap{overflow:visible;border-radius:0}table{min-width:0;font-size:10px}td,th{padding:5px 8px}th{background:#eef0f2}thead{display:table-header-group}tr{break-inside:avoid}h2{color:var(--ink);break-after:avoid}a{color:var(--ink);text-decoration:none}.type,.rarity{color:var(--ink)!important;font-size:10px}.name a{color:var(--ink)!important}section{margin-bottom:20px}footer{margin-top:20px}}
.sort-button{display:flex;align-items:center;gap:8px;width:100%;padding:0;border:0;background:none;color:inherit;text-align:left;cursor:pointer;font:inherit;white-space:nowrap}.sort-button:hover{color:var(--ink)}.sort-icon{opacity:.45;font-size:12px}th[aria-sort=ascending],th[aria-sort=descending]{color:var(--ink)}th[aria-sort=ascending] .sort-icon,th[aria-sort=descending] .sort-icon{opacity:1;color:var(--accent)}
.pool-icon{width:20px;height:20px;flex-shrink:0;object-fit:contain}.all-icon{width:18px;height:18px;flex-shrink:0}
span.tier{display:inline-flex;align-items:center;justify-content:center;min-width:28px;padding:1px 7px;border:1px solid transparent;border-radius:4px;font-size:12px;font-weight:700;line-height:1.6;color:#fff}.tier[data-tier=S],[data-tier-filter=S]{--tier-color:#b83b4b}.tier[data-tier=S]{background:var(--tier-color)}.tier[data-tier=A],[data-tier-filter=A]{--tier-color:#a65320}.tier[data-tier=A]{background:var(--tier-color)}.tier[data-tier=B],[data-tier-filter=B]{--tier-color:#846515}.tier[data-tier=B]{background:var(--tier-color)}.tier[data-tier=C],[data-tier-filter=C]{--tier-color:#337749}.tier[data-tier=C]{background:var(--tier-color)}.tier[data-tier=D],[data-tier-filter=D]{--tier-color:#356a9a}.tier[data-tier=D]{background:var(--tier-color)}.tier[data-tier=unranked]{background:transparent;color:var(--muted)}
.effect{min-width:265px;max-width:340px;font-size:13px;line-height:1.65}.effect-keyword{color:#fbbf24;font-weight:500}.effect-resource,.effect-star,.star-cost{color:#facc15;white-space:nowrap}.not-available{color:var(--muted)}.energy{min-width:105px;font-variant-numeric:tabular-nums}.cost-change{color:#7dd3a0;font-size:12px;white-space:nowrap}.star-cost{display:block;font-size:12px}.builds{min-width:180px;max-width:240px}.build-list{list-style:none;padding:0;margin:0;display:grid;gap:10px}.build-list a{font-size:13px;text-decoration:none}.build-list a:hover{text-decoration:underline}.build-role{display:block;font-size:11px;color:var(--muted)}.effect-heading{text-align:center}td{vertical-align:top}th{vertical-align:middle}.table-wrap{scrollbar-color:#354454 var(--paper)}@media print{.table-wrap{overflow-x:auto}table{min-width:1500px}.effect{font-size:10px;min-width:200px}.effect-keyword,.effect-resource,.effect-star,.star-cost{color:inherit}}

/* Responsive layout: full table on wide screens, readable cards below 1800px. */
main{width:100%;padding:clamp(16px,2vw,32px);padding-bottom:48px}.field{min-width:0}.controls{flex-wrap:wrap}.chips button{min-height:44px}.mobile-sort{display:none}.table-wrap{max-width:100%}footer{overflow-wrap:anywhere}
@media screen and (min-width:1800px){table{min-width:1320px}td,th{padding:10px 12px}.effect{min-width:210px}.builds{min-width:155px}.name{min-width:150px}}
@media screen and (max-width:1799px){
 .mobile-sort{display:flex;align-items:center;gap:10px;margin:0 0 14px}.mobile-sort label{margin:0;white-space:nowrap}.mobile-sort select{width:auto;min-width:0;max-width:260px;flex:1;min-height:44px}.mobile-sort-direction{min-height:44px;min-width:88px;padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:var(--paper);color:var(--ink);cursor:pointer}.mobile-sort-direction:hover{border-color:var(--accent)}
 .table-wrap{border:0;background:transparent;overflow:visible;border-radius:0}table{display:block;width:100%;min-width:0;border:0}thead{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%);white-space:nowrap}tbody{display:grid;gap:16px;width:100%}tbody tr{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0 20px;padding:18px 20px;border:1px solid var(--line);border-radius:10px;background:var(--paper)}tbody tr:hover{background:var(--paper)}
 td,td.name,td.num,td.energy,td.effect,td.builds{display:block;width:auto;min-width:0;max-width:none;padding:12px 0;border:0;font-size:14px;overflow-wrap:anywhere}td::before{content:attr(data-label);display:block;margin-bottom:5px;font-size:11px;font-weight:500;letter-spacing:.04em;color:var(--muted)}
 td.name{order:0;grid-column:span 3;font-size:19px;padding:0 0 12px}td.name::before,td.num::before{display:none}td.name a{display:inline-block;line-height:1.5}td.num{order:1;grid-column:4;text-align:right;padding:3px 0 12px;font-size:12px}td.num::after{content:' / No.';color:var(--muted)}
 td.type{order:2}td.energy{order:3}td.rarity{order:4}td.tier{order:5;display:block;background:transparent;color:var(--ink);border:0;border-radius:0;font-weight:400;line-height:1.6}.tier .tier{vertical-align:middle}
 td[data-field=effect]{order:6;grid-column:1/-1;border-top:1px solid var(--line);line-height:1.8}
 td.builds{order:8;grid-column:span 3;border-top:1px solid var(--line)}td.category{order:9;border-top:1px solid var(--line)}.build-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px}.build-list a{font-size:14px;line-height:1.5;display:inline-block;padding:3px 0}.star-cost{display:inline-block;margin-left:6px}section{margin-bottom:30px}
}
@media screen and (max-width:640px){
 main{padding:16px 12px 32px}.controls{gap:12px}.controls .field{width:100%}input,select{font-size:16px;min-height:44px}.chips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.chips button{justify-content:center;padding:7px 5px;font-size:12px;gap:5px;min-width:0}.pool-icon{width:18px;height:18px}.tools{margin-bottom:24px}.mobile-sort{gap:8px}.mobile-sort select{max-width:none;font-size:14px}.mobile-sort-direction{min-width:78px;font-size:13px}h2{font-size:21px}tbody{gap:12px}tbody tr{grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px;padding:16px}td.name{grid-column:1/-1;padding-right:36px;font-size:18px}td.num{display:none}td.type,td.energy,td.rarity,td.tier{padding:9px 0}td[data-field=effect],td.builds{grid-column:1/-1;padding:14px 0}td.category{grid-column:1/-1;padding:10px 0 0}.build-list{grid-template-columns:1fr}.effect{line-height:1.8}footer{font-size:11px}
}
@media screen and (max-width:359px){.chips{grid-template-columns:repeat(2,minmax(0,1fr))}.mobile-sort{flex-wrap:wrap}.mobile-sort label{width:100%}.mobile-sort select{max-width:none}.chips button{font-size:13px}}
@media print{.mobile-sort{display:none}}


/* Category is included in the table; card metadata remains available for filters. */


@media screen and (max-width:1799px){td.builds{grid-column:1/-1}}

.name-en,.name-zh{display:block}.name-zh{margin-top:4px;font-size:13px;font-weight:500;opacity:.95}.effect-content{display:grid;gap:14px}.effect-label{display:block;margin-bottom:4px;font-size:11px;letter-spacing:.04em;font-weight:600;color:var(--muted)}.effect-upgraded .effect-label{color:#7dd3a0}.effect{min-width:320px;max-width:620px;width:38%}
@media screen and (min-width:1800px){table{min-width:1150px}.effect{min-width:320px}}
@media screen and (max-width:1799px){td.effect{width:auto;min-width:0;max-width:none}.effect-content{grid-template-columns:1fr;gap:12px}.name-zh{font-size:14px}}
@media screen and (max-width:640px){.effect-content{grid-template-columns:1fr;gap:14px}.effect-upgraded{border-top:1px dashed var(--line);padding-top:14px}.name-zh{font-size:14px}}


.effect-upgrade-toggle{margin:0}.effect-upgrade-toggle summary{width:fit-content;min-height:36px;padding:5px 0;color:#7dd3a0;font-size:12px;cursor:pointer;user-select:none}.effect-upgrade-toggle summary:focus-visible{outline:2px solid var(--focus);outline-offset:4px;border-radius:3px}.effect-upgrade-toggle .upgrade-hide{display:none}.effect-upgrade-toggle[open] .upgrade-show{display:none}.effect-upgrade-toggle[open] .upgrade-hide{display:inline}.effect-upgrade-toggle .effect-upgraded{margin-top:8px;padding-top:12px;border-top:1px dashed var(--line)}@media(pointer:coarse){.effect-upgrade-toggle summary{min-height:44px;padding:10px 0}}
${navigation.styles}
@media screen{main section :is(table,th,td,.name-en,.name-zh,.num,.type,.rarity,.tier,.cost-change,.star-cost,.effect-label,.effect-resource,.effect-star,.build-role,.section-count,.build-list a,.effect-upgrade-toggle summary){font-size:x-large}main section td::before{font-size:x-large}main section :is(.effect,.build-list,.name){line-height:1.8}}
@media screen{main .chips button,main .mobile-sort label,main .mobile-sort select,main .mobile-sort-direction,main .sort-button,main .category-field select{font-size:x-large}main .chips button{white-space:normal;overflow-wrap:anywhere}main .category-field{max-width:320px}main .mobile-sort-direction{min-width:110px}}@media screen and (max-width:640px){main .chips{grid-template-columns:repeat(2,minmax(0,1fr))}}
.name .name-zh{margin-top:0}.name .name-en{margin-top:4px}
@media screen{main section .name .name-en{font-size:large}main section .name .name-zh{font-size:x-large}}
.name .name-en{color:var(--muted)}.name .name-zh{color:var(--rarity-color,#aab6c4)}

@media screen and (min-width:1800px){table{min-width:1600px}td.effect{width:26%;min-width:280px;max-width:540px}}
@media screen and (max-width:1799px){td[data-field=effect]{order:6;grid-column:span 2}td[data-field=upgraded]{order:7;grid-column:span 2;border-top:1px solid var(--line);line-height:1.8}}
@media screen and (max-width:640px){td[data-field=effect],td[data-field=upgraded]{grid-column:1/-1;padding:14px 0}}

@media screen and (min-width:1800px){main section table th,main section table td{vertical-align:top}}
.english-name{min-width:160px;color:var(--muted)}@media screen{main section .english-name .name-en{font-size:large;color:var(--muted);margin-top:0}}@media screen and (max-width:1799px){td.english-name{order:0;grid-column:span 2;min-width:0;padding:0 0 12px}td.name{order:1;grid-column:span 2}}@media screen and (max-width:640px){td.english-name,td.name{grid-column:1/-1}td.name{padding-right:0}}
.english-name a.name-en{text-decoration:none}.english-name a.name-en:hover{text-decoration:underline}
.tools .primary-filter-row{display:flex;align-items:center;gap:14px;flex-wrap:nowrap;overflow-x:auto;padding:3px 3px 12px;scrollbar-width:thin;scrollbar-color:#354454 transparent}.tools .primary-filter-row .chips{display:flex;flex-wrap:nowrap;gap:8px;margin:0;flex:0 0 auto}.tools .primary-filter-row .chips button{white-space:nowrap;flex-shrink:0}.inline-search{flex:1 0 280px;min-width:260px}.inline-search input{font-size:x-large;height:48px;min-height:48px}.secondary-filter-row{display:flex;align-items:center;gap:12px;margin-top:12px}.secondary-filter-row label{font-size:x-large;margin:0}.secondary-filter-row select{font-size:x-large;max-width:260px;min-height:48px;height:auto}@media(max-width:640px){.inline-search{flex-basis:260px}.secondary-filter-row select{max-width:none;flex:1}}
.secondary-filter-row{align-items:flex-start;flex-wrap:wrap}.rarity-filter-label{font-size:x-large;line-height:48px}.rarity-buttons{display:flex;flex-wrap:wrap;gap:8px}.rarity-buttons button{font:inherit;font-size:x-large;min-height:48px;padding:6px 14px;border:1px solid var(--line);border-radius:6px;background:var(--paper);color:var(--rarity-color,var(--muted));cursor:pointer}.rarity-buttons button:hover{border-color:currentColor}.rarity-buttons button[aria-pressed=true]{background:#141b24;border-color:currentColor}.rarity-buttons button:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
.inline-search input#search:focus-visible{outline:2px solid var(--focus);outline-offset:3px}

@media screen{html,body{height:100%;overflow:hidden}body{height:100dvh;display:flex;flex-direction:column}.site-header{position:relative;flex:0 0 auto}main#main-content{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;width:100%;padding:20px 24px;overflow:hidden}.tools{flex:0 0 auto;margin-bottom:16px;padding-bottom:14px}.card-scroll{flex:1;min-height:0;min-width:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;scrollbar-color:#354454 transparent;padding:3px 8px 3px 3px}.card-scroll:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}.card-scroll [id^=card-]{scroll-margin-top:16px}.card-scroll section{scroll-margin-top:16px}}
@media screen and (max-width:640px){main#main-content{padding:12px}.tools{margin-bottom:12px;padding-bottom:10px}.secondary-filter-row{flex-wrap:nowrap}.rarity-buttons{min-width:0;flex:1;flex-wrap:nowrap;overflow-x:auto;padding:3px;scrollbar-width:thin}.rarity-buttons button{flex:0 0 auto;white-space:nowrap}.card-scroll{padding-right:4px}}
@media print{.card-scroll{overflow:visible;height:auto}}

@media screen and (min-width:1800px){.card-scroll{overflow:auto}.card-scroll section{min-width:1600px}.card-scroll .table-wrap{overflow:visible;max-width:none}.card-scroll table{border-collapse:separate;border-spacing:0}.card-scroll thead th{position:sticky;top:0;z-index:10;background:#11171d;box-shadow:0 1px 0 var(--line)}}
.tools .secondary-filter-row{flex-wrap:nowrap;align-items:center;overflow-x:auto;padding-bottom:3px;gap:12px}.tools .rarity-filter-label{flex:0 0 auto}.tools .rarity-buttons{flex:0 0 auto;flex-wrap:nowrap;overflow:visible;padding:0}.tools .rarity-buttons button{white-space:nowrap}.tools .secondary-filter-row .result{flex:0 0 auto;white-space:nowrap;margin:0 0 0 auto;padding-left:12px}@media screen and (min-width:1800px){.card-scroll{padding-top:0}.card-scroll .table-wrap{border-radius:0}.card-scroll thead{position:sticky;top:0;z-index:30;background:#11171d;isolation:isolate}.card-scroll thead th{position:static;background:#11171d!important;opacity:1;backdrop-filter:none}.card-scroll tbody{position:relative;z-index:0}}
@media screen and (min-width:1800px){main section td:is([data-field="type"],[data-field="energy"],[data-field="rarity"],[data-field="tier"]){text-align:center}main section th:has(>button:is([data-sort="type"],[data-sort="energy"],[data-sort="rarity"],[data-sort="tier"])){text-align:center}main section .sort-button:is([data-sort="type"],[data-sort="energy"],[data-sort="rarity"],[data-sort="tier"]){justify-content:center;text-align:center}}
.build-list li{color:var(--build-color)}.build-list li a,.build-list li a:hover,.build-list li .build-role{color:var(--build-color)}
.tools .chips button[aria-pressed=true]{background:var(--paper);background:color-mix(in srgb,var(--accent) 7%,var(--paper));color:var(--accent);border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}.tools .rarity-buttons button[aria-pressed=true]{background:var(--paper);color:var(--rarity-color,var(--muted));border-color:currentColor;box-shadow:0 0 0 1px currentColor}
@media screen and (min-width:1800px){.card-scroll section{min-width:2400px}.card-scroll section table{table-layout:fixed;width:100%;min-width:2400px}.card-scroll section table :is(th,td){width:auto;min-width:0;max-width:none;overflow-wrap:anywhere}.card-scroll section table td .build-list{min-width:0}}
@media screen and (hover:hover){.card-scroll tbody tr:hover{background:color-mix(in srgb,var(--accent) 18%,#141b24)}.card-scroll tbody tr:hover>td{background:color-mix(in srgb,var(--accent) 18%,#141b24)}.card-scroll tbody tr:hover>td:first-child{box-shadow:inset 4px 0 0 var(--accent)}.card-scroll tbody tr:hover .name-zh{filter:brightness(1.2)}}.card-scroll tbody tr:focus-within>td{background:color-mix(in srgb,var(--accent) 14%,#141b24)}
.effect-star,.star-cost{color:#7dd3fc;white-space:nowrap}
.card-scroll tbody tr.is-selected{outline:2px solid var(--accent);outline-offset:-2px}.card-scroll tbody tr.is-selected>td{background:color-mix(in srgb,var(--accent) 18%,#141b24)}@media screen and (hover:hover){.card-scroll tbody tr:hover{outline:2px solid var(--accent);outline-offset:-2px}.card-scroll tbody tr:hover>td:first-child{box-shadow:none}}
.card-scroll tbody tr:target:not(.is-selected):not(:hover){outline:none}
${resourceIcons.styles}
.card-scroll section .build-list li .build-role{color:var(--muted);font-size:large}
.card-scroll section .build-list li{display:flex;align-items:baseline;flex-wrap:nowrap;gap:8px}.card-scroll section .build-list li a{flex:1 1 auto;min-width:0}.card-scroll section .build-list li .build-role{display:inline-block;flex:0 0 auto;color:var(--muted);font-size:medium;white-space:nowrap}
.card-scroll section .build-list li{justify-content:flex-start;gap:6px}.card-scroll section .build-list li a{flex:0 1 auto}.card-scroll section .build-list li .build-role{margin-left:0}
.build-inline-list{white-space:normal;max-width:100%;overflow:visible;overflow-wrap:normal;word-break:normal}.build-inline-list a,.build-inline-list a:hover{display:inline;color:var(--build-color);font-size:inherit;text-decoration:none}.build-inline-list a:hover{text-decoration:underline}
.build-inline-list a{display:inline-block;white-space:nowrap;overflow-wrap:normal;word-break:keep-all}
${cardArt.styles}
.card-image-link{display:block;width:100%;max-width:204px;margin:0 auto}.card-image{display:block;width:100%;height:auto;aspect-ratio:340/454;object-fit:contain}.card-image-link:hover{filter:brightness(1.12)}
@media screen and (max-width:1799px){td[data-field=tier]{order:4}td[data-field=imageBase]{grid-column:1/span 2}td[data-field=imageUpgraded]{grid-column:3/span 2}td[data-field=imageBase],td[data-field=imageUpgraded]{order:5;min-width:0}.card-image-link{max-width:204px}td[data-field=imageBase]::before,td[data-field=imageUpgraded]::before{display:block}}
@media screen and (max-width:640px){td[data-field=imageBase]{grid-column:1}td[data-field=imageUpgraded]{grid-column:2}}



.card-images-pair{display:grid;grid-template-columns:minmax(0,120px);justify-content:center;gap:8px;width:100%;max-width:120px;margin:0 auto}.card-images-pair figure{margin:0;min-width:0;text-align:center}.card-images-pair .card-image{display:block;width:120px;max-width:100%;height:auto}.card-images-pair .not-available{display:block;padding:16px 0;font-size:large}.card-image-button{display:block;padding:0;border:0;background:transparent;cursor:zoom-in;width:100%}.card-image-button:hover{filter:brightness(1.15)}.card-image-button:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:5px}
@media screen and (min-width:1800px){.card-scroll section,.card-scroll section table{min-width:2400px;width:100%}.card-scroll section table{table-layout:fixed}.card-scroll section td[data-field=builds]{max-width:none}}
@media screen and (max-width:1799px){td[data-field=images]{order:5;grid-column:1/-1}td[data-field=pool]{grid-column:1/-1}}

main section td:is([data-field=english],[data-field=name]){text-align:center}main section th{text-align:center}main section th .sort-button{justify-content:center;text-align:center}
main section td:is([data-field=type],[data-field=energy],[data-field=tier]){text-align:center}
@media screen and (min-width:1800px){.card-scroll{overflow-x:hidden}.card-scroll section,.card-scroll section table{width:100%;min-width:0;max-width:100%}.card-scroll .table-wrap{width:100%;max-width:100%;min-width:0}.card-scroll section table{table-layout:fixed}.card-scroll section table :is(th,td){min-width:0;max-width:none}.card-scroll section td.effect,.card-scroll section td.builds{width:auto;min-width:0;max-width:none}}
main section td[data-field=english],main section td[data-field=english] .name-en{white-space:nowrap;overflow-wrap:normal;word-break:normal}
.build-inline-list{display:grid;gap:4px;justify-items:start}.build-inline-list a{display:block}
.card-scroll section table :is(th,td){vertical-align:middle;text-align:center}.build-inline-list{justify-items:center}
@media screen and (max-width:1799px){.card-scroll tbody tr{align-items:center}}

${cardGrid.styles}
.tools .primary-filter-row>.result{flex:0 0 auto;white-space:nowrap;margin:0;align-self:center}.tools .secondary-filter-row .presentation-controls{flex:0 0 auto;flex-wrap:nowrap;margin:0 0 0 auto}.presentation-controls .image-size-controls{flex:0 0 auto;margin:0 0 0 8px}.presentation-controls button{min-height:48px;white-space:nowrap}
@media(min-width:901px){.tools .primary-filter-row{overflow:visible}.tools .primary-filter-row .chips{flex:0 1 auto;min-width:0;overflow-x:auto;padding:2px;scrollbar-width:thin}.inline-search{flex:1 1 320px;min-width:240px}}
.card-image-button{cursor:pointer}.card-image-button:disabled{cursor:default}.card-image-button:disabled:hover{filter:none;transform:none}
body[data-view=table] main section :is(th,td)[data-field=images]{display:none!important}
${toolbarRwd}
.build-association{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;gap:0 6px;min-width:0;max-width:100%}.build-role-label{color:var(--muted);font-size:14px;white-space:nowrap;line-height:1.5}
${navigation.layoutStyles}
main#main-content .tools .primary-filter-row .presentation-controls{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:8px;margin:0 0 0 auto}
@media(max-width:640px){main#main-content .tools .primary-filter-row .presentation-controls{justify-content:flex-start;margin:0}}
</style></head><body data-view="grid" data-card-size="M">${navigation.renderHeader('cards')}<main id="main-content">
<div class="tools" id="tools" hidden><div class="primary-filter-row"><nav class="chips" aria-label="快速分類">${categoryMenu.map(p=>`<button type="button" data-category="${p}" style="--accent:${poolColors[p]}" aria-pressed="false"><img class="pool-icon" src="${poolIcons[p]}" alt="" width="20" height="20">${['Colorless','Curse','Event','Quest'].includes(p)?p:poolLabels[p]}</button>`).join('')}</nav>${cardGrid.controls}</div><div class="secondary-filter-row"><div class="filter-cluster rarity-cluster"><div class="rarity-buttons" role="group" aria-label="稀有度篩選">${displayedRarities.filter(r=>r!=='Basic').map(r=>`<button type="button" data-rarity-filter="${r}" data-rarity="${r}" aria-pressed="false">${rarityLabels[r]}</button>`).join('')}</div></div><div class="filter-cluster tier-cluster"><div class="rarity-buttons tier-buttons" role="group" aria-label="Tier 評級篩選"><button type="button" data-tier-filter="S" aria-pressed="false">S</button><button type="button" data-tier-filter="A" aria-pressed="false">A</button><button type="button" data-tier-filter="B" aria-pressed="false">B</button><button type="button" data-tier-filter="C" aria-pressed="false">C</button><button type="button" data-tier-filter="D" aria-pressed="false">D</button></div></div><div class="filter-cluster type-cluster"><div class="rarity-buttons type-buttons" role="group" aria-label="類型篩選">${filterTypes.map(type=>`<button type="button" data-type-filter="${type}" style="--rarity-color:${typeColors[type]}" aria-pressed="false">${typeLabels[type]}</button>${type==='Skill'?cardGrid.actionControls:''}`).join('')}</div></div><div class="inline-search"><label class="sr-only" for="search">搜尋關鍵字</label><input id="search" type="search" placeholder="搜尋關鍵字" autocomplete="off"></div></div></div>
<div id="card-scroll" class="card-scroll" role="region" aria-label="卡牌表格" tabindex="0">${sections}<p id="empty" hidden>找不到符合條件的卡片，請調整搜尋文字、分類或稀有度。</p>
</div>
</main>
${cardArt.markup({paired:true})}<script>
${preferences.script}
const search=document.getElementById('search'),rarityButtons=[...document.querySelectorAll('[data-rarity-filter]')];
const tierButtons=[...document.querySelectorAll('[data-tier-filter]')];
const typeButtons=[...document.querySelectorAll('[data-type-filter]')];
const compactCardMedia=window.matchMedia('(max-width:1024px), (max-width:1366px) and (hover:none) and (pointer:coarse)');
const sections=[...document.querySelectorAll('section[data-pool]')],buttons=[...document.querySelectorAll('[data-category]')];
const savedCardPreferences=window.sts2Preferences.load('cards')||{};
function restoreSelection(values,controls,key){const allowed=new Set(controls.map(button=>button.dataset[key]));return new Set((Array.isArray(values)?values:[]).filter(value=>allowed.has(value)));}
const selectedCategories=restoreSelection(savedCardPreferences.categories,buttons,'category'),selectedRarities=restoreSelection(savedCardPreferences.rarities,rarityButtons,'rarityFilter'),selectedTypes=restoreSelection(savedCardPreferences.types,typeButtons,'typeFilter');
const selectedTiers=restoreSelection(savedCardPreferences.tiers,tierButtons,'tierFilter');
function syncCompactCategorySelection(){if(compactCardMedia.matches&&['Curse','Event','Quest'].some(pool=>selectedCategories.has(pool))){for(const pool of ['Curse','Event','Quest'])selectedCategories.delete(pool);selectedCategories.add('Colorless');}}
syncCompactCategorySelection();compactCardMedia.addEventListener('change',()=>{syncCompactCategorySelection();filter();});
const cardSortPreferences=savedCardPreferences.sorts&&typeof savedCardPreferences.sorts==='object'&&!Array.isArray(savedCardPreferences.sorts)?savedCardPreferences.sorts:{};
search.value=typeof savedCardPreferences.query==='string'?savedCardPreferences.query:'';
if(['grid','table'].includes(savedCardPreferences.view))document.body.dataset.view=savedCardPreferences.view;
if(['M','L','XL'].includes(savedCardPreferences.size))document.body.dataset.cardSize=savedCardPreferences.size;else if(savedCardPreferences.size==='S')document.body.dataset.cardSize='M';
function saveCardPreferences(){window.sts2Preferences.save('cards',{categories:[...selectedCategories],rarities:[...selectedRarities],tiers:[...selectedTiers],types:[...selectedTypes],query:search.value,view:document.body.dataset.view,size:document.body.dataset.cardSize,sorts:cardSortPreferences,routeHash:location.hash});}
function toggleSelection(selection,value){if(selection.has(value))selection.delete(value);else selection.add(value);filter();}
function filter(){document.getElementById('aoe-toggle').setAttribute('aria-pressed',String(search.value==='所有敵人'));const queries=[...new Set(search.value.toLowerCase().split(/[\\s+、，,]+/).filter(Boolean))];let count=0;for(const section of sections){let found=0;for(const row of section.querySelectorAll('tbody tr')){row.classList.remove('is-selected');row.hidden=!!((selectedCategories.size&&!selectedCategories.has(section.dataset.pool)&&!(compactCardMedia.matches&&selectedCategories.has('Colorless')&&['Colorless','Curse','Event','Quest'].includes(section.dataset.pool)))||(selectedRarities.size&&!selectedRarities.has(row.dataset.rarity)&&!(selectedRarities.has('Common')&&row.dataset.rarity==='Basic'))||(selectedTiers.size&&!selectedTiers.has(row.querySelector('.tier[data-tier]').dataset.tier))||(selectedTypes.size&&!selectedTypes.has(row.dataset.type))||(queries.length>0&&!queries.some(query=>row.dataset.search.includes(query))));if(!row.hidden)found++;}section.hidden=!found;const poolCount=section.querySelector('.grid-pool-count');if(poolCount)poolCount.textContent='('+found+')';count+=found;}document.getElementById('empty').hidden=count!==0;for(const button of tierButtons)button.setAttribute('aria-pressed',String(selectedTiers.has(button.dataset.tierFilter)));for(const button of buttons)button.setAttribute('aria-pressed',String(selectedCategories.has(button.dataset.category)));for(const button of rarityButtons)button.setAttribute('aria-pressed',String(selectedRarities.has(button.dataset.rarityFilter)));for(const button of typeButtons)button.setAttribute('aria-pressed',String(selectedTypes.has(button.dataset.typeFilter)));document.getElementById('card-scroll').scrollTo({top:0,left:0,behavior:'instant'});saveCardPreferences();}
for(const button of typeButtons)button.addEventListener('click',()=>{toggleSelection(selectedTypes,button.dataset.typeFilter);});
for(const button of tierButtons)button.addEventListener('click',()=>{toggleSelection(selectedTiers,button.dataset.tierFilter);});
document.getElementById('aoe-toggle').addEventListener('click',event=>{search.value=event.currentTarget.getAttribute('aria-pressed')==='true'?'':'所有敵人';filter();});
search.addEventListener('input',filter);for(const button of rarityButtons)button.addEventListener('click',()=>{toggleSelection(selectedRarities,button.dataset.rarityFilter);});for(const button of buttons)button.addEventListener('click',()=>{toggleSelection(selectedCategories,button.dataset.category);});document.getElementById('tools').hidden=false;filter();


${compareCards.toString()}
for(const table of document.querySelectorAll('table')){
  const tbody=table.querySelector('tbody'),section=table.closest('section');
  const sortSelect=section.querySelector('.mobile-sort-key'),directionButton=section.querySelector('.mobile-sort-direction');
  let sortKey='rarity',sortDirection=1;
  function applySort(key,direction){
    sortKey=key;sortDirection=direction;
    const rows=[...tbody.rows];
    const values=row=>({...Object.fromEntries([...row.cells].map(cell=>[cell.dataset.field,cell.dataset.sortValue??cell.textContent])),id:row.dataset.id});
    rows.sort((a,b)=>compareCards(values(a),values(b),sortKey,sortDirection));
    tbody.append(...rows);
    cardSortPreferences[section.dataset.pool]={key:sortKey,direction:sortDirection};saveCardPreferences();
    sortSelect.value=sortKey;
    directionButton.textContent=sortDirection===1?'↑ Asc':'↓ Desc';
    directionButton.setAttribute('aria-label',sortDirection===1?'Ascending; click to sort descending':'Descending; click to sort ascending');
    for(const headerButton of table.querySelectorAll('[data-sort]')){
      const active=headerButton.dataset.sort===sortKey;
      headerButton.closest('th').setAttribute('aria-sort',active?(sortDirection===1?'ascending':'descending'):'none');
      headerButton.querySelector('.sort-icon').textContent=active?(sortDirection===1?'↑':'↓'):'↕';
      const label=headerButton.closest('th').textContent.replace(/[↑↓↕]/g,'').trim();
      headerButton.setAttribute('aria-label',label+(active?(sortDirection===1?', ascending; click to sort descending':', descending; click to sort ascending'):', click to sort ascending'));
    }
  }
  for(const button of table.querySelectorAll('[data-sort]'))button.addEventListener('click',()=>applySort(button.dataset.sort,sortKey===button.dataset.sort?-sortDirection:1));
  sortSelect.addEventListener('change',()=>applySort(sortSelect.value,1));
  directionButton.addEventListener('click',()=>applySort(sortKey,-sortDirection));
  const rememberedSort=cardSortPreferences[section.dataset.pool];if(rememberedSort&&${JSON.stringify([...visibleColumns])}.includes(rememberedSort.key))applySort(rememberedSort.key,rememberedSort.direction===-1?-1:1);
}
const siteHeader=document.querySelector('.site-header');
function updateSiteHeaderHeight(){document.documentElement.style.setProperty('--site-header-height',siteHeader.getBoundingClientRect().height+'px');}
new ResizeObserver(updateSiteHeaderHeight).observe(siteHeader);updateSiteHeaderHeight();
const compactView=window.matchMedia('(max-width: 1799px)');
function updateSortFocus(){for(const button of document.querySelectorAll('.sort-button')){if(compactView.matches)button.setAttribute('tabindex','-1');else button.removeAttribute('tabindex');}}
compactView.addEventListener('change',updateSortFocus);updateSortFocus();

function selectCardRow(row){for(const current of document.querySelectorAll('.card-scroll tbody tr.is-selected'))current.classList.remove('is-selected');row.classList.add('is-selected');}
function scrollToCard(row){const area=document.getElementById('card-scroll'),head=row.closest('table').querySelector('thead'),pageScroll=getComputedStyle(area).overflowY==='visible';const headerHeight=pageScroll?document.querySelector('.site-header').getBoundingClientRect().height+(compactView.matches?0:head.getBoundingClientRect().height):compactView.matches?0:head.getBoundingClientRect().height;row.style.scrollMarginTop=(headerHeight+12)+'px';if(pageScroll){row.scrollIntoView({block:'start',behavior:'instant'});return;}const top=area.scrollTop+row.getBoundingClientRect().top-area.getBoundingClientRect().top-headerHeight-12;area.scrollTo({top:Math.max(0,top),behavior:'instant'});}
document.getElementById('card-scroll').addEventListener('click',event=>{const row=event.target.closest('tbody tr[data-id]');if(row)selectCardRow(row);});
function revealLinkedCard(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}if(!id.startsWith('card-'))return;const row=document.getElementById(id);if(!row)return;const section=row.closest('section[data-pool]');if(!section)return;selectedCategories.clear();selectedCategories.add(section.dataset.pool);search.value='';selectedRarities.clear();selectedTypes.clear();selectedTiers.clear();filter();selectCardRow(row);requestAnimationFrame(()=>scrollToCard(row));}
window.addEventListener('hashchange',revealLinkedCard);const reloading=performance.getEntriesByType('navigation')[0]?.type==='reload';if(!reloading||savedCardPreferences.routeHash!==location.hash)revealLinkedCard();

const cardImageSources=${JSON.stringify(cardImages).replace(/</g,'\\u003c')};
let showUpgradedCards=false;
function refreshCardImages(){for(const button of document.querySelectorAll('.card-scroll .card-image-button')){const id=button.closest('[data-card-image-id]').dataset.cardImageId,data=cardImageSources[id],img=button.querySelector('img'),name=img.alt.replace(/（升級(?:前|後)）$/,'');const upgraded=showUpgradedCards&&!!data.upgraded;img.src=upgraded?data.upgraded:data.base;img.alt=name+(upgraded?'（升級後）':'（升級前）');button.setAttribute('aria-pressed',String(upgraded));button.setAttribute('aria-label',img.alt+'，雙擊前往表格中的此卡片');}}
document.getElementById('upgrade-toggle').addEventListener('click',event=>{showUpgradedCards=!showUpgradedCards;event.currentTarget.setAttribute('aria-pressed',String(showUpgradedCards));refreshCardImages();});
function openCardInTable(button){const row=button.closest('tr');document.querySelector('[data-card-view="table"]').click();history.replaceState(null,'','#'+row.id);selectCardRow(row);saveCardPreferences();requestAnimationFrame(()=>{scrollToCard(row);row.tabIndex=-1;row.focus({preventScroll:true});});}
document.getElementById('card-scroll').addEventListener('dblclick',event=>{const button=event.target.closest('.card-image-button');if(button)openCardInTable(button);});
document.getElementById('card-scroll').addEventListener('click',event=>{const button=event.target.closest('.card-image-button');if(button&&event.detail===0)openCardInTable(button);});

refreshCardImages();
${cardGrid.script}
${cardArt.createScript({paired:true,width:420})}
</script></body></html>`;
fs.writeFileSync('cards.html',navigation.openPageLinksInNewTab(html).replace('</body>','<script src="assets/cards/search-controls.js"></script></body>'));
const manifest={source:'https://slaythespire2.net/card',chineseSource:chineseSource.source,retrievedDate:'2026-11-08',version:'Live v0.107.1',tierSource:tierSource.source,tierRetrievedDate:tierSource.retrievedDate,total:cards.length,categories:Object.fromEntries(categories.map((p,i)=>[p,expected[i]])),cards:categories.flatMap(pool=>cards.filter(c=>c.pool===pool).sort((a,b)=>compareCards({...a,tier:tiers.get(a.id)},{...b,tier:tiers.get(b.id)})).map(c=>({id:c.id,name:c.name,nameZh:chineseCards.get(c.id).name,category:c.pool,type:c.type,rarity:c.rarity,rarityZh:rarityLabels[c.rarity],tier:tiers.get(c.id)||null,images:cardImages[c.id],tableImages:cardTableImages[c.id],effect:{base:chineseCards.get(c.id).descBase,upgraded:canUpgrade(c)?chineseCards.get(c.id).descUpgraded:null},energy:c.energy??null,starCost:c.starCost??null,upgrade:c.upgrade??null,builds:(buildsByCard[c.id]||[]).map(b=>({...b,sourceUrl:b.url,url:localBuildUrl(b)})),url:'https://slaythespire2.net/zh-TW/card/'+c.slug})))};
fs.writeFileSync('data/cards/cards.json',JSON.stringify(manifest,null,2));
assert.equal((html.match(/<tr id="card-[^"]+" role="row" data-name=/g)||[]).length,551);
assert.equal((html.match(/<section data-pool=/g)||[]).length,9);
console.log(JSON.stringify({total:551,categories:manifest.categories,htmlBytes:Buffer.byteLength(html)},null,2));
require('../builds/build-builds.cjs');
