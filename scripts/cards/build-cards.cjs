process.chdir(require('node:path').resolve(__dirname,'../..'));
const cardGrid=require('./card-grid-view.cjs');
const toolbarRwd=require('./card-toolbar-rwd.cjs');
const resourceIcons=require('./resource-icons.cjs');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const navigation = require('./site-navigation.cjs');

const cards = JSON.parse(fs.readFileSync('data/cards/cards-source.json', 'utf8'));
const chineseSource = JSON.parse(fs.readFileSync('data/cards/cards-zh-TW.json','utf8'));
const chineseCards = new Map(chineseSource.cards.map(c=>[c.id,c]));
const tierSource = JSON.parse(fs.readFileSync('data/cards/tiers-source.json', 'utf8'));
const buildSource = JSON.parse(fs.readFileSync('data/builds/source.json', 'utf8'));
const buildsByCard = buildSource.byCard;
const tiers = new Map(tierSource.rankings.map(c=>[c.id,c.tier]));
const {categories, category, groups, group, filterCategory} = require('./card-categories.cjs');
const filterLabels = {Event:'Event', Curse:'Curse', Other:'Other'};
function renderCardFilters(groups) {
  return '<div class="card-filter-rows" lang="en">' + groups.map(([label,key,values]) => {
    let buttons = values.map(value => {
      const selected = key === 'character' && value === 'Ironclad';
      if (key === 'energy' && value === 'cost-down') return '<button type="button" value="cost-down" aria-pressed="false" aria-label="升級後能量費用降低" title="升級後能量費用降低">Cost ↓</button>';
      return '<button type="button" value="' + value + '" aria-pressed="' + selected + '"' + (key === 'energy' && value === 'gain' ? ' aria-label="增加能量" title="增加能量"' : '') + '>' + (key === 'energy' && value === 'gain' ? '' : ((key !== 'rarity' && filterLabels[value]) || value || 'All')) + (key === 'energy' ? resourceIcons.energy : '') + (key === 'energy' && value === 'gain' ? '<span>Gain Energy</span>' : '') + '</button>';
    }).join('');
    if (key === 'character') buttons = require('./character-filter.cjs')(buttons, {
      iconPaths:{Colorless:'assets/cards/icons/colorless.webp', Event:'assets/cards/icons/event.webp', Curse:'assets/cards/icons/other.webp'},
      labels:{Colorless:'Colorless', Event:'Event', Curse:'Curse、Quest'}
    });
    return '<div class="card-filter-row"><span>' + label + '</span><div class="card-filter-buttons" id="card-filter-' + key + '" role="group" aria-label="' + label + '">' + buttons + '</div></div>';
  }).join('') + '</div>';
}
const expected = categories.map(pool=>cards.filter(card=>category(card)===pool).length);
assert.equal(new Set(cards.map(c => c.id)).size, cards.length);
assert.equal(expected.reduce((sum,count)=>sum+count,0), cards.length);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const poolLabels={Ironclad:'鐵甲戰士',Silent:'靜默獵手',Defect:'故障機器人',Necrobinder:'亡靈契約師',Regent:'儲君',Colorless:'無色',Curse:'詛咒',Event:'事件',Quest:'任務'};
const poolColors={Ironclad:'#dc6c68',Silent:'#70bf8b',Regent:'#e3bf72',Necrobinder:'#b595dd',Defect:'#6faeee',Colorless:'#aab6c4',Curse:'#cf8098',Status:'#aab6c4',Event:'#6ac1b4',Token:'#aab6c4',Quest:'#c8ab79'};
function compareCards(a,b,key='rarity',direction=1){
  const rarityOrder=['Basic','Common','Uncommon','Rare','Ancient','Event','Curse','Status','Token','Quest'];
  const text=(x,y)=>String(x).localeCompare(String(y),'en',{sensitivity:'base'});
  const rank=x=>{const i=rarityOrder.indexOf(x);return i<0?rarityOrder.length:i;};
  const rarity=(x,y)=>rank(x)-rank(y)||text(x,y);
  const tierRank=x=>{const i=['S','A','B','C','D'].indexOf(x);return i<0?5:i;};
  if(key==='tier'){const ar=tierRank(a.tier),br=tierRank(b.tier);if(ar===5||br===5){if(ar!==br)return ar===5?1:-1;}else if(ar!==br)return (ar-br)*direction;}
  if(key==='energy'){const energyRank=x=>x==='X'?100:x==='—'||x===undefined?101:Number(x);const ar=energyRank(a.energy),br=energyRank(b.energy);if(ar===101||br===101){if(ar!==br)return ar===101?1:-1;}else if(ar!==br)return (ar-br)*direction;}
  const primary=['tier','energy'].includes(key)?0:key==='rarity'?rarity(a.rarity,b.rarity):text(a[key],b[key]);
  return primary*direction||text(a.name,b.name)||rarity(a.rarity,b.rarity)||text(a.id,b.id);
}
const iconNames={Ironclad:'ironclad',Silent:'silent',Defect:'defect',Necrobinder:'necrobinder',Regent:'regent',Colorless:'colorless',Ancient:'event',Curse:'other',Status:'other',Event:'event',Token:'colorless',Quest:'other'};
const poolIcons=Object.fromEntries(Object.entries(iconNames).map(([pool,name])=>{
  const image=fs.readFileSync('assets/cards/icons/'+name+'.webp');
  assert.equal(image.toString('ascii',0,4),'RIFF');assert.equal(image.toString('ascii',8,12),'WEBP');
  return [pool,'data:image/webp;base64,'+image.toString('base64')];
}));

const typeLabels={Attack:'攻擊',Skill:'技能',Power:'能力',Curse:'詛咒',Status:'狀態',Quest:'任務'};
const typeColors={Attack:'#ff6568',Skill:'#74b3e6',Power:'#05df72',Curse:'#e3e8ee',Quest:'#e3e8ee'};
const rarityLabels={Basic:'基礎',Common:'普通',Uncommon:'罕見',Rare:'稀有',Ancient:'先古之民',Event:'事件',Curse:'詛咒',Status:'狀態',Token:'衍生',Quest:'任務'};
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
const localBuildUrl=b=>'characters.html#build-'+b.character+'-'+b.buildId;
function renderBuilds(c){const builds=buildsByCard[c.id]||[];if(!builds.length)return '<span class="not-available">—</span>';return '<div class="build-inline-list">'+builds.map(b=>'<div class="build-association"><a data-build-pool="'+esc(b.characterPool)+'" style="--build-color:'+poolColors[b.characterPool]+'" href="'+esc(localBuildUrl(b))+'">'+esc(b.name)+'</a><span class="build-role-label">'+(b.role==='core'?'核心卡片':'輔助卡片')+'</span></div>').join('')+'</div>';}

const columns=[['english','ID'],['name','Name'],['effect','Effect'],['upgraded','Upgraded'],['tier','Tier'],['builds','Builds'],['type','Type'],['energy','Cost'],['rarity','Rarity'],['pool','Category']];
const visibleColumns=new Set(columns.map(([key])=>key));
const buildNameWidth=Math.max(...Object.values(buildsByCard).flat().map(b=>Array.from(b.name).reduce((width,char)=>width+(/[\u2e80-\uffff]/.test(char)?24:14),0)));
const fixedColumnWidths={english:196,name:144,builds:Math.ceil(buildNameWidth)+24,type:112,energy:112,tier:100,rarity:120,pool:144};
const flexibleColumnWeights={effect:1,upgraded:1};
const fixedWidth=Object.entries(fixedColumnWidths).filter(([key])=>visibleColumns.has(key)).reduce((sum,[,width])=>sum+width,0);
const flexibleWeight=Object.values(flexibleColumnWeights).reduce((sum,weight)=>sum+weight,0);
const columnGroup='<colgroup>'+columns.filter(([key])=>visibleColumns.has(key)).map(([key])=>'<col data-column="'+key+'" style="width:'+(fixedColumnWidths[key]?(fixedColumnWidths[key]+'px'):'calc((100% - '+fixedWidth+'px) * '+(flexibleColumnWeights[key]/flexibleWeight).toFixed(8)+')')+'">').join('')+'</colgroup>';

function heading(key,label,rowspan=''){return '<th scope="col" data-field="'+key+'"'+(key==='pool'?' class="category-column"':'')+(rowspan?' rowspan="2"':'')+(key==='english'?' class="english-name"':'')+' aria-sort="'+(key==='rarity'?'ascending':'none')+'"><button type="button" class="sort-button" data-sort="'+key+'" aria-label="'+label+(key==='rarity'?', ascending; click to sort descending':', click to sort ascending')+'">'+label+'<span class="sort-icon" aria-hidden="true">'+(key==='rarity'?'↑':'↕')+'</span></button></th>';}
const tableHead='<thead role="rowgroup"><tr>'+columns.filter(([key])=>visibleColumns.has(key)).map(([key,label])=>heading(key,label)).join('')+'</tr></thead>';

const sections = groups.map(pool => {
  const list = cards.filter(c => group(c) === pool).sort((a,b) => compareCards({...a,tier:tiers.get(a.id)},{...b,tier:tiers.get(b.id)}));
  const rows = list.map(c => {
    const values={english:'<a class="name-en" href="'+esc(require('./wiki-card-link.cjs')(c))+'" target="_blank" rel="noopener noreferrer">'+esc(c.name)+'</a>',name:'<span class="name-zh" lang="zh-Hant" data-rarity="'+esc(c.rarity)+'">'+esc(chineseCards.get(c.id).name)+'</span>',type:'<span class="type" data-type="'+esc(c.type)+'">'+esc(typeLabels[c.type])+'</span>',energy:renderEnergy(c),effect:renderEffect(chineseCards.get(c.id).descBase)+(chineseCards.get(c.id).notes?'<br><small>'+renderEffect(chineseCards.get(c.id).notes)+'</small>':''),upgraded:renderUpgraded(c),rarity:'<span class="rarity" data-rarity="'+esc(c.rarity)+'">'+esc(displayedRarities.includes(c.rarity)?rarityLabels[c.rarity]:'—')+'</span>',tier:'<span class="tier" data-tier="'+(tiers.get(c.id)||'unranked')+'"'+(tiers.has(c.id)?'':' title="Not ranked by source"')+'>'+(tiers.get(c.id)||'—')+'</span>',builds:renderBuilds(c),pool:esc(pool)};
    return '<tr id="card-'+esc(c.id)+'" role="row" data-name="'+esc((c.name+' '+chineseCards.get(c.id).name).toLowerCase())+'" data-id="'+esc(c.id)+'" data-search="'+esc([c.id,c.name,chineseCards.get(c.id).name,...(chineseCards.get(c.id).aliases||[]),chineseCards.get(c.id).notes||'',chineseCards.get(c.id).descBase,canUpgrade(c)?chineseCards.get(c.id).descUpgraded:''].join(' ').replace(/<[^>]*>/g,'').toLowerCase())+'" data-type="'+esc(c.type)+'" data-rarity="'+esc(c.rarity)+'">'+columns.map(([key,label])=>'<td role="cell" data-field="'+key+'" data-label="'+label+'"'+(key==='energy'?' data-sort-value="'+esc(costLabel(c.energy))+'"':key==='name'?' data-sort-value="'+esc(c.name)+'"':key==='rarity'?' data-sort-value="'+esc(c.rarity)+'"':key==='type'?' data-sort-value="'+esc(c.type)+'"':'')+' class="'+({english:'english-name',name:'name',pool:'category',effect:'effect',upgraded:'effect upgraded',builds:'builds',energy:'energy'}[key]||key)+'">'+values[key]+'</td>').join('')+'</tr>';
  }).join('\n');
  return `<section data-pool="${pool}" data-filter-category="${filterCategory(pool)}"${pool === 'Ironclad' ? '' : ' hidden'} style="--accent:${poolColors[pool]}"><h2 class="grid-pool-heading"><img src="${poolIcons[pool]}" alt="" width="28" height="28">${pool} <span class="grid-pool-count">(${list.length})</span></h2><div class="mobile-sort"><label for="sort-${pool}">Sort by</label><select id="sort-${pool}" class="mobile-sort-key">${columns.filter(([key])=>visibleColumns.has(key)).map(([key,label])=>`<option value="${key}"${key==='pool'?' hidden disabled':''}${key==='rarity'?' selected':''}>${label}</option>`).join('')}</select><button type="button" class="mobile-sort-direction" aria-label="Ascending; click to sort descending">↑ Asc</button></div><div class="table-wrap"><table role="table"><caption class="sr-only">${pool} 卡片名稱，共 ${list.length} 張</caption>${columnGroup}${tableHead}<tbody role="rowgroup">${rows}</tbody></table></div></section>`;
}).join('\n');
const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png?v=4"><link rel="icon" type="image/x-icon" href="assets/cards/icons/site-favicon.ico?v=4"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Slay the Spire 2｜${cards.length} 張卡片名稱索引</title>
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
span.tier{display:inline-flex;align-items:center;justify-content:center;min-width:28px;padding:1px 7px;border:1px solid transparent;border-radius:4px;font-size:12px;font-weight:700;line-height:1.6;color:#fff}:root{--card-tier-S:#d05a68}.tier[data-tier=S]{--tier-color:var(--card-tier-S)}:root{--card-tier-A:#cc773d}.tier[data-tier=A]{--tier-color:var(--card-tier-A)}:root{--card-tier-B:#4e8dcc}.tier[data-tier=B]{--tier-color:var(--card-tier-B)}:root{--card-tier-C:#4e9c68}.tier[data-tier=C]{--tier-color:var(--card-tier-C)}:root{--card-tier-D:#828e9d}.tier[data-tier=D]{--tier-color:var(--card-tier-D)}span.tier[data-tier]:not([data-tier=unranked]){background:var(--tier-color);color:#10151d}.tier[data-tier=unranked]{background:transparent;color:var(--muted)}
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




@media screen and (min-width:1800px){.card-scroll section,.card-scroll section table{min-width:2400px;width:100%}.card-scroll section table{table-layout:fixed}.card-scroll section td[data-field=builds]{max-width:none}}

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
${toolbarRwd}
.build-association{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;gap:0 6px;min-width:0;max-width:100%}.build-role-label{color:var(--muted);font-size:14px;white-space:nowrap;line-height:1.5}
${navigation.layoutStyles}
@media screen {
  main#main-content:has(>#card-scroll) {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    grid-template-rows: minmax(0, 1fr);
    gap: var(--section-gap, 24px);
  }

  main#main-content>#tools {
    grid-column: 1;
    grid-row: 1 / -1;
    max-height: none;
    margin: 0;
    padding: 3px;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  main#main-content>#card-scroll {
    grid-column: 2;
    grid-row: 1;
  }

  main#main-content #tools :is(.primary-filter-row,.secondary-filter-row) {
    flex-direction: column;
    align-items: stretch;
  }

  main#main-content #tools .primary-filter-row .chips {
    flex: 0 1 auto;
    flex-wrap: wrap;
    overflow: visible;
  }

  main#main-content #tools :is(.chips,.rarity-buttons)>button {
    flex: 1 0 auto;
  }


  main#main-content #tools .profession-filter-row {
    display: grid;
    flex: 0 0 100%;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--control-gap);
  }

  main#main-content #tools .profession-filter-row>button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding-inline: 4px;
  }

  main#main-content #tools .profession-filter-row .pool-icon {
    width: 28px;
    height: 28px;
    margin: 0;
  }

  main#main-content #tools .profession-filter-row .profession-filter-label {
    display: none;
  }

  main#main-content #tools .extra-category-row {
    display: flex;
    flex: 0 0 100%;
    gap: var(--control-gap);
  }

  main#main-content #tools .extra-category-row>button {
    flex: 1 0 auto;
    font-size: 18px;
    padding-inline: 6px;
  }

  main#main-content #tools .secondary-filter-row .filter-cluster {
    flex: 0 0 auto;
    width: 100%;
  }

  main#main-content #tools .secondary-filter-row .rarity-buttons {
    flex: 1 1 auto;
  }

  main#main-content #tools .card-search { width: 100%; min-width: 0; margin-bottom: 0; }



  main#main-content #tools .card-search #search {
    box-sizing: border-box;
    width: 100%;
    height: var(--control-height);
    min-height: var(--control-height);
    padding: 8px 14px;
    font: 400 var(--control-font)/1.4 Arial, "Microsoft JhengHei", sans-serif;
    color: var(--ink);
    background: var(--control-bg);
    border: 1px solid var(--control-border);
    border-radius: var(--control-radius);
  }

  main#main-content #tools .card-search #search:focus {
    border-color: var(--focus);
    outline: none;
  }
}
@media print{.card-search{display:none}}
html{--site-width:100%}
html body main#main-content,html body .site-header>.site-header-inner{width:100%;max-width:none}
${fs.readFileSync('assets/cards/compact-cards.css','utf8')}
${fs.readFileSync('assets/cards/search-control.css','utf8')}
</style></head><body data-view="grid">${navigation.renderHeader('cards')}<main id="main-content">
<div class="tools" id="tools"><div class="inline-search card-search"><label class="sr-only" for="search">搜尋關鍵字</label><div class="search-control"><input id="search" type="text" inputmode="search" role="searchbox" placeholder="搜尋關鍵字" autocomplete="off"><button type="button" class="search-clear" aria-label="清除搜尋關鍵字" title="清除搜尋關鍵字"><span class="search-icon" aria-hidden="true">🔍</span></button></div></div>${renderCardFilters([['Character','character',["Ironclad","Silent","Regent","Necrobinder","Defect","Colorless","Event","Curse"]],['Type','type',["Attack","Skill","Power"]],['Rarity','rarity',["Common","Uncommon","Rare","Ancient"]]])}${renderCardFilters([['Energy','energy',['0','1','2','3+','X','gain','cost-down']]])}<p id="card-filter-result" class="card-filter-result" role="status" aria-live="polite" aria-atomic="true">符合張數 / 總卡片數：0 / ${cards.length}</p></div>
<div id="card-scroll" class="card-scroll" role="region" aria-label="卡牌表格" tabindex="0">${sections}<p id="empty" hidden>找不到符合條件的卡片，請調整搜尋文字、分類或稀有度。</p>
</div>
</main>
<script>

const search=document.getElementById('search');
const characterFilter=document.getElementById('card-filter-character');
const typeFilter=document.getElementById('card-filter-type');
const rarityFilter=document.getElementById('card-filter-rarity');
const energyFilter=document.getElementById('card-filter-energy');
const multiFilters = [characterFilter, rarityFilter, typeFilter, energyFilter];
function setFilterValues(group, values) {
  for (const button of group.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(values.includes(button.value)));
  }
}
function selectedValues(group) {
  return new Set([...group.querySelectorAll('button[aria-pressed="true"]')].map(button => button.value));
}
for (const group of multiFilters) {
  group.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const selected = button.getAttribute('aria-pressed') === 'true';
    if (group === characterFilter) setFilterValues(group, selected ? [] : [button.value]);
    else button.setAttribute('aria-pressed', String(!selected));
    filter();
  });
}
const compactCardMedia=window.matchMedia('(max-width:1024px), (max-width:1366px) and (hover:none) and (pointer:coarse)');
const sections=[...document.querySelectorAll('section[data-pool]')];
search.value='';
function selectedCardFilters() {
  return {characters:selectedValues(characterFilter), rarities:selectedValues(rarityFilter), types:selectedValues(typeFilter), energies:selectedValues(energyFilter)};
}
const cardFilterCookie='sts2_card_filters';
function restoreCardFilters() {
  setFilterValues(characterFilter, ['Ironclad']);
  try {
    const cookie=new URL(document.baseURI).protocol==='file:'?null:document.cookie.split(';').map(value=>value.trim()).find(value=>value.startsWith(cardFilterCookie+'='));
    const stored=new URL(document.baseURI).protocol==='file:'?localStorage.getItem(cardFilterCookie):cookie?decodeURIComponent(cookie.slice(cardFilterCookie.length+1)):null;
    if(!stored)return;
    const saved=JSON.parse(stored);
    if(!saved||typeof saved!=='object')return;
    for(const [key,group] of [['characters',characterFilter],['types',typeFilter],['rarities',rarityFilter],['energies',energyFilter]]) {
      if(!Array.isArray(saved[key]))continue;
      const allowed=new Set([...group.querySelectorAll('button')].map(button=>button.value));
      const restoredValues=key==='energies'?saved[key].map(value=>['3','4+'].includes(value)?'3+':value):saved[key];
      const values=restoredValues.filter(value=>allowed.has(value));
      setFilterValues(group,key==='characters'?values.slice(0,1):values);
    }
  } catch {}
}
function rememberCardFilters() {
  try {
    const serialized=JSON.stringify(Object.fromEntries(Object.entries(selectedCardFilters()).map(([key,values])=>[key,[...values]])));
    if(new URL(document.baseURI).protocol==='file:'){
      if(localStorage.getItem(cardFilterCookie)!==serialized)localStorage.setItem(cardFilterCookie,serialized);
      return;
    }
    const value=encodeURIComponent(serialized);
    if(document.cookie.split(';').some(cookie=>cookie.trim()===cardFilterCookie+'='+value))return;
    document.cookie=cardFilterCookie+'='+value+'; Max-Age=31536000; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
  } catch {}
}
function cardMatchesFilters(row, section, selected) {
  const {characters, rarities, types, energies}=selected;
  const baseEnergy=row.dataset.baseEnergy;
  const energyGroup=Number(baseEnergy)>=3?'3+':baseEnergy;
  const energyCosts=[...energies].filter(value=>!['gain','cost-down'].includes(value));
  return (!characters.size||characters.has(section.dataset.filterCategory))
    && (!rarities.size||rarities.has(row.dataset.rarity)||(rarities.has('Common')&&row.dataset.rarity==='Basic'))
    && (!types.size||types.has(row.dataset.type))
    && (!energyCosts.length||energyCosts.includes(energyGroup)||(energies.has('X')&&row.dataset.id==='STARDUST'))
    && (!energies.has('gain')||row.dataset.energyGain==='true')
    && (!energies.has('cost-down')||row.dataset.costDown==='true');
}
function filter() {
  const queries=cardSearchQueries(),selected=selectedCardFilters();let count=0;
  for(const section of sections){
    let found=0;
    for(const row of section.querySelectorAll('tbody tr')){
      row.classList.remove('is-selected');
      row.hidden=!cardMatchesFilters(row,section,selected)||(queries.length>0&&!cardMatchesSearch(row,queries));
      if(!row.hidden)found++;
    }
    section.hidden=!found;
    const poolCount=section.querySelector('.grid-pool-count');if(poolCount)poolCount.textContent='('+found+')';
    count+=found;
  }
  document.getElementById('empty').hidden=count!==0;
  document.getElementById('card-filter-result').textContent='符合張數 / 總卡片數：'+count+' / ${cards.length}';
  document.getElementById('card-scroll').scrollTo({top:0,left:0,behavior:'instant'});
  rememberCardFilters();
}

function cardSearchQueries() {
  return [...new Set(search.value.toLowerCase().split(/[\\s、，,+]+/).filter(Boolean))];
}
function cardMatchesSearch(row, queries) {
  const query = search.value.trim().toLowerCase();
  if (query.length >= 2 && query.startsWith('"') && query.endsWith('"')) {
    const name = query.slice(1, -1);
    return [...row.querySelectorAll('.detail-name-en,.detail-name-zh')].some(node => node.textContent.trim().toLowerCase() === name);
  }
  return queries.some(value => row.dataset.search.includes(value));
}
search.addEventListener('input',()=>{
  if(search.value.trim())for(const group of multiFilters)setFilterValues(group,[]);
  filter();
});

restoreCardFilters();
filter();


${compareCards.toString()}
for(const table of document.querySelectorAll('table')){
  const tbody=table.querySelector('tbody'),section=table.closest('section');
  const sortSelect=section.querySelector('.mobile-sort-key'),directionButton=section.querySelector('.mobile-sort-direction');
  let sortKey='rarity',sortDirection=1;
  function applySort(key,direction){
    sortKey=key;sortDirection=direction;
    const rows=[...tbody.rows];
    const values=row=>({...JSON.parse(row.dataset.sortValues),id:row.dataset.id});
    rows.sort((a,b)=>compareCards(values(a),values(b),sortKey,sortDirection));
    tbody.append(...rows);
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
function revealLinkedCard(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}if(!id.startsWith('card-'))return;const row=document.getElementById(id);if(!row)return;const section=row.closest('section[data-pool]');if(!section)return;setFilterValues(characterFilter,[section.dataset.filterCategory]);search.value='';setFilterValues(rarityFilter,[]);setFilterValues(typeFilter,[]);setFilterValues(energyFilter,[]);filter();selectCardRow(row);requestAnimationFrame(()=>scrollToCard(row));}
window.addEventListener('hashchange',revealLinkedCard);revealLinkedCard();




</script></body></html>`;
require('./desktop-page-css.cjs').writeDesktopPage('cards.html',navigation.openPageLinksInNewTab(html).replace('</body>','<script src="assets/cards/search-controls.js"></script><script src="assets/cards/compact-cards.js?v=15"></script></body>'));
const manifest={source:'https://slaythespire2.net/card',chineseSource:chineseSource.source,retrievedDate:chineseSource.retrievedDate,version:chineseSource.version,balanceUpdate:chineseSource.balanceUpdate,tierSource:tierSource.source,tierRetrievedDate:tierSource.retrievedDate,total:cards.length,categories:Object.fromEntries(categories.map((p,i)=>[p,expected[i]])),cards:groups.flatMap(pool=>cards.filter(c=>group(c)===pool).sort((a,b)=>compareCards({...a,tier:tiers.get(a.id)},{...b,tier:tiers.get(b.id)})).map(c=>({id:c.id,name:c.name,nameZh:chineseCards.get(c.id).name,...(chineseCards.get(c.id).aliases?{aliases:chineseCards.get(c.id).aliases}:{}),...(chineseCards.get(c.id).notes?{notes:chineseCards.get(c.id).notes}:{}),...(c.availability?{availability:c.availability}:{}),...(c.canGenerateInCombat!==undefined?{canGenerateInCombat:c.canGenerateInCombat}:{}),category:category(c),originalPool:c.pool,type:c.type,rarity:c.rarity,rarityZh:rarityLabels[c.rarity],tier:tiers.get(c.id)||null,effect:{base:chineseCards.get(c.id).descBase,upgraded:canUpgrade(c)?chineseCards.get(c.id).descUpgraded:null},energy:c.energy??null,starCost:c.starCost??null,upgrade:c.upgrade??null,builds:(buildsByCard[c.id]||[]).map(b=>({...b,sourceUrl:b.url,url:localBuildUrl(b)})),url:c.sourceZh||'https://slaythespire2.net/zh-TW/card/'+c.slug})))};
fs.writeFileSync('data/cards/cards.json',JSON.stringify(manifest,null,2));
assert.equal((html.match(/<tr id="card-[^"]+" role="row" data-name=/g)||[]).length,cards.length);
assert.equal((html.match(/<section data-pool=/g)||[]).length,groups.length);
console.log(JSON.stringify({total:cards.length,categories:manifest.categories,htmlBytes:Buffer.byteLength(html)},null,2));
require('../builds/build-builds.cjs');
require('./build-card1.cjs')({output:'cards'});
