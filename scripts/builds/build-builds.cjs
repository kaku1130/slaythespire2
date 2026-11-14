process.chdir(require('node:path').resolve(__dirname,'../..'));

const resourceIcons=require('../cards/resource-icons.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict'),navigation=require('../cards/site-navigation.cjs');
const guide=JSON.parse(fs.readFileSync('data/builds/guide.json','utf8'));
const source=JSON.parse(fs.readFileSync('data/builds/source.json','utf8'));
const cards=JSON.parse(fs.readFileSync('data/cards/cards-source.json','utf8'));
const chinese=new Map(JSON.parse(fs.readFileSync('data/cards/cards-zh-TW.json','utf8')).cards.map(c=>[c.id,c]));
const byId=new Map(cards.map(c=>[c.id,c]));
const cardImages=JSON.parse(fs.readFileSync('data/cards/card-images.json','utf8'));
const cardTiers=new Map(JSON.parse(fs.readFileSync('data/cards/tiers-source.json','utf8')).rankings.map(card=>[card.id,card.tier]));

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich=value=>esc(value||'').replace(/&lt;g&gt;/g,'<span class="guide-keyword">').replace(/&lt;\/g&gt;/g,'</span>').replace(/&lt;e\/&gt;/g,resourceIcons.energy).replace(/&lt;e&gt;(.*?)&lt;\/e&gt;/g,(_,amount)=>amount.replace(/\s+/g,'')+resourceIcons.energy).replace(/&lt;s&gt;(.*?)&lt;\/s&gt;/g,'$1★').replace(/\\n|\r?\n/g,'<br>');
const pools=[['Ironclad','鐵甲戰士','#dc6c68'],['Silent','靜默獵手','#70bf8b'],['Defect','故障機器人','#6faeee'],['Regent','儲君','#e3bf72'],['Necrobinder','亡靈契約師','#b595dd']];
const builds=new Map();
for(const [id,links] of Object.entries(source.byCard))for(const b of links){const key=b.character+'-'+b.buildId;if(!builds.has(key))builds.set(key,{...b,key,core:[],support:[]});builds.get(key)[b.role].push(byId.get(id));}
assert.equal(builds.size,25);
function renderCardLink(c){return '<a class="card-text-link" href="cards.html#card-'+esc(c.id)+'" data-rarity="'+c.rarity+'">'+esc(chinese.get(c.id).name)+'</a>';}
function renderCardWithTier(c){const tier=cardTiers.get(c.id);return '<span class="build-card-entry" data-card-tier-id="'+esc(c.id)+'">'+renderCardLink(c)+'<span class="card-tier-badge" data-tier="'+(tier||'unranked')+'" aria-label="Tier '+(tier||'未評級')+'">'+(tier||'—')+'</span></span>';}
function renderCardPair(c){const images=cardImages[c.id],name=chinese.get(c.id).name;assert(images?.base,'Missing card image '+c.id);const figure=(src,label)=>'<figure><img src="'+esc(src)+'" alt="'+esc(name+'（'+label+'）')+'" width="340" height="454" loading="lazy" decoding="async"></figure>';return '<div class="build-inline-card-pair" data-card-pair="'+esc(c.id)+'"><div class="build-pair-name">'+renderCardWithTier(c)+'</div><div class="build-pair-images">'+figure(images.base,'升級前')+(images.upgraded?figure(images.upgraded,'升級後'):'<div class="build-no-upgrade">無升級版本</div>')+'</div></div>';}
function renderCards(list){const rarityOrder=['Basic','Common','Uncommon','Rare','Ancient','Event','Curse','Quest'];const rank=c=>{const index=rarityOrder.indexOf(c.rarity);return index<0?rarityOrder.length:index;};const tierRank=c=>{const index=['S','A','B','C','D'].indexOf(cardTiers.get(c.id));return index<0?5:index;};return [...list].sort((a,b)=>rank(a)-rank(b)||tierRank(a)-tierRank(b)||a.name.localeCompare(b.name,'en')).map(renderCardPair).join('');}

function renderLinkedStrategy(text,g){
 const candidates=[...new Set([...g.core,...g.support])].map(id=>byId.get(id)).sort((a,b)=>chinese.get(b.id).name.length-chinese.get(a.id).name.length);
 let output='',offset=0;
 while(offset<text.length){const card=candidates.find(c=>text.startsWith(chinese.get(c.id).name,offset));if(card){output+=renderCardLink(card);offset+=chinese.get(card.id).name.length;}else{output+=esc(text[offset]);offset++;}}
 return output;
}
const relicIcons=new Map();
function relicIcon(r){if(!relicIcons.has(r.className)){const filename=r.imagePath.split('/').pop();assert(/^[a-z0-9_]+\.webp$/.test(filename));const bytes=fs.readFileSync('assets/relic/images/'+filename);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');relicIcons.set(r.className,'data:image/webp;base64,'+bytes.toString('base64'));}return relicIcons.get(r.className);}

const iconName={Ironclad:'ironclad',Silent:'silent',Defect:'defect',Regent:'regent',Necrobinder:'necrobinder'};
function renderGuide(g,full=false){
 const key=g.character+'-'+g.id,b=builds.get(key);assert(b);assert.equal(g.name,b.name);assert.equal(g.tier,b.tier);
 assert.deepEqual(b.core.map(c=>c.id).sort(),[...g.core].sort());assert.deepEqual(b.support.map(c=>c.id).sort(),[...g.support].sort());b.core=g.core.map(id=>byId.get(id));b.support=g.support.map(id=>byId.get(id));
 const search=[g.name,g.summary,g.id,g.playstyle,...b.core.flatMap(c=>[c.name,chinese.get(c.id).name]),...b.support.flatMap(c=>[c.name,chinese.get(c.id).name]),...g.relics.map(r=>r.name)].join(' ').toLowerCase();

 return '<article class="build-panel'+(full?' full-guide':'')+'" id="build-'+key+'" data-search="'+esc(search)+'"'+(guide.builds.find(first=>first.characterPool===g.characterPool).id!==g.id?' hidden':'')+'><h3 class="build-panel-heading"><span class="build-tier" data-tier="'+esc(g.tier)+'" aria-label="'+esc(g.tier)+' 級">'+esc(g.tier)+'</span><span>'+esc(g.name)+'</span></h3><div class="build-details"><div class="build-overview"><div class="build-explanation"><div class="guide-strategy"><h4>玩法思路</h4><p>'+renderLinkedStrategy(g.playstyle,g)+'</p></div><div class="guide-rationale"><h4>為什麼是 '+g.tier+' 級</h4><p>'+renderLinkedStrategy(g.rationale,g)+'</p></div></div><div class="build-tradeoffs"><div><h4>優點</h4><p>'+esc(g.strength)+'</p></div><div><h4>缺點</h4><p>'+esc(g.weakness)+'</p></div></div>'+'</div><div class="build-resources"><div class="build-deck-groups"><div class="build-card-group"><h4>核心卡片</h4><div class="build-card-pairs">'+renderCards(b.core)+'</div></div><div class="build-card-group"><h4>輔助卡片</h4><div class="build-card-pairs">'+renderCards(b.support)+'</div></div></div><div class="relic-group"><h4>關鍵遺物</h4>'+(g.relics.length?'<ul class="relic-list">'+g.relics.map(r=>'<li><img class="relic-icon" src="'+relicIcon(r)+'" alt="" width="40" height="40"><div class="relic-content"><strong>'+esc(r.name)+'</strong><div class="relic-effect">'+rich(r.description)+'</div></div></li>').join('')+'</ul>':'<p class="no-relics">原站未列出指定遺物。</p>')+'</div></div></div></article>';
}
function characterFile(pool){return '#character-'+iconName[pool];}
function characterNav(active='Ironclad'){return '<nav class="character-nav" aria-label="流派角色">'+pools.map(([pool,label,color])=>{const icon='data:image/webp;base64,'+fs.readFileSync('assets/cards/icons/'+iconName[pool]+'.webp').toString('base64');return '<a href="'+characterFile(pool)+'" data-character="'+pool+'" aria-label="'+label+'" title="'+label+'" style="--accent:'+color+'"'+(active===pool?' aria-current="page"':'')+'><img class="sidebar-character-icon" src="'+icon+'" alt="" width="32" height="32"></a>';}).join('')+'</nav>';}

function renderRanking(pool){const selected=guide.builds.filter(g=>g.characterPool===pool);return '<nav class="tier-index" aria-label="流派評級總覽">'+selected.map(g=>'<a class="tier-index-item" href="#build-'+g.character+'-'+g.id+'" aria-label="'+esc(g.name)+'，'+g.tier+' 級"><span class="build-tier" data-tier="'+g.tier+'" aria-hidden="true">'+g.tier+'</span><span class="tier-index-name">'+esc(g.name)+'</span></a>').join('')+'</nav>';}

function renderSection([pool,label,color],full=false){const icon='data:image/webp;base64,'+fs.readFileSync('assets/cards/icons/'+iconName[pool]+'.webp').toString('base64');return '<section class="build-section" id="character-'+iconName[pool]+'" data-pool="'+pool+'"'+(pool!=='Ironclad'?' hidden':'')+' style="--accent:'+color+'">'+'<div class="build-grid">'+guide.builds.filter(g=>g.characterPool===pool).map(g=>renderGuide(g,full)).join('')+'</div></section>';}

const sections=pools.map(p=>renderSection(p)).join('');
const tierMenus=pools.map(([pool,label,color])=>'<div class="tier-menu-group" data-menu-pool="'+pool+'" style="--accent:'+color+'"'+(pool!=='Ironclad'?' hidden':'')+'>'+renderRanking(pool)+'</div>').join('');
const html=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><link rel="apple-touch-icon" sizes="180x180" href="assets/cards/icons/site-logo.png"><link rel="icon" type="image/webp" href="assets/cards/icons/site-logo.webp"><meta name="viewport" content="width=device-width,initial-scale=1"><title>流派｜殺戮尖塔2</title><style>
:root{color-scheme:dark;--ink:#e3e8ee;--muted:#86909b;--line:#1a222b;--paper:#080e14;--bg:#040609}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.6 Arial,"Microsoft JhengHei",sans-serif}a{color:#0a8fd1;text-underline-offset:4px}a:hover{color:#19affe}main{max-width:1600px;padding:28px clamp(12px,2vw,32px) 48px;margin:auto}h1{font-size:28px;margin:0 0 8px}.build-intro{color:var(--muted);margin:0 0 24px}.build-tools{max-width:230px;margin-bottom:24px}label{display:block;color:var(--muted);font-size:12px;margin-bottom:6px}input,select{width:100%;min-height:44px;border:1px solid var(--line);border-radius:6px;padding:10px 12px;background:var(--paper);color:var(--ink);font:inherit}a:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #37a8ec;outline-offset:3px}.build-section{margin-bottom:36px}h2{font-size:22px;color:var(--accent);margin:0 0 16px}h2 small{font-size:14px;font-weight:400;color:var(--muted);margin-left:8px}.build-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.build-panel{padding:22px;border:1px solid var(--line);border-top:3px solid var(--accent);border-radius:8px;background:var(--paper);min-width:0}.build-panel:target{outline:2px solid #37a8ec}.build-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}h3{font-size:20px;line-height:1.4;margin:0}h4{font-size:12px;color:var(--muted);font-weight:500;margin:0 0 8px}.build-group+.build-group{margin-top:18px}.build-card-list{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.build-card-list a{display:block;padding:8px 10px;border:1px solid var(--line);border-radius:5px;color:#aab6c4;text-decoration:none;min-height:56px;overflow-wrap:anywhere}.build-card-list a:hover{background:#141b24;border-color:#354454}.build-card-list small{display:block;font-size:11px;color:var(--muted)}.build-card-list a[data-rarity=Uncommon]{color:#74b3e6}.build-card-list a[data-rarity=Rare]{color:#e3bf72}.build-card-list a[data-rarity=Ancient]{color:#c49aef}.original-build{display:inline-block;margin-top:20px;font-size:12px;padding:5px 0}.build-tier{display:inline-flex;align-items:center;justify-content:center;min-width:32px;padding:2px 8px;border-radius:4px;color:white;font-weight:700;background:#337749}.build-tier[data-tier=S]{background:#b83b4b}.build-tier[data-tier=A]{background:#a65320}.build-tier[data-tier=B]{background:#846515}footer{color:var(--muted);border-top:1px solid var(--line);padding-top:18px;font-size:12px}[hidden]{display:none!important}#build-empty{text-align:center;padding:40px;color:var(--muted)}@media(max-width:760px){.build-grid{grid-template-columns:1fr}.build-tools{grid-template-columns:1fr}input,select{font-size:16px}.build-panel{padding:18px}h1{font-size:24px}}@media(max-width:359px){.build-card-list{grid-template-columns:1fr}}
main{max-width:1400px}.build-intro{max-width:930px}.build-version{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 24px;color:var(--ink);font-size:12px}.build-version span{color:var(--muted);margin-left:8px}.build-grid{grid-template-columns:1fr;gap:14px}.build-section h2{display:flex;align-items:center;gap:10px}.character-icon{object-fit:contain;flex-shrink:0}.build-panel{padding:20px 24px;border-top:1px solid var(--line)}.build-panel-heading{justify-content:flex-start;align-items:flex-start;margin-bottom:14px;gap:14px}.build-tier{margin-top:2px;flex-shrink:0;min-width:34px;min-height:34px;font-size:17px}.build-summary{margin:7px 0 0;color:var(--muted);line-height:1.7}.build-preview{display:flex;gap:14px;align-items:center}.preview-label{font-size:12px;color:var(--muted);white-space:nowrap}.build-preview .build-card-list{flex:1;grid-template-columns:repeat(3,minmax(0,1fr))}.build-preview .build-card-list a{min-height:0;padding:7px 10px}.build-details{margin-top:16px;border-top:1px solid var(--line)}.build-tradeoffs{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:18px 0;border-bottom:1px solid var(--line);margin-bottom:18px}.build-tradeoffs h4{margin-bottom:4px}.build-tradeoffs p,.version-note p{margin:0;font-size:13px}.build-deck-groups{display:grid;grid-template-columns:1fr 1fr;gap:24px}.build-deck-groups .build-group{margin-top:0}.relic-group{margin-top:20px}.relic-list{list-style:none;display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:0}.relic-list li{padding:5px 10px;border:1px solid var(--line);border-radius:5px;color:#e3bf72;font-size:13px}.no-relics{font-size:12px;color:var(--muted);margin:0}.version-note{margin-top:20px;border-left:3px solid #846515;padding:10px 14px;background:#84651514}.version-note h4{color:#d9c278}.build-panel:target .build-details{border-top-color:#37a8ec}@media(max-width:760px){.build-panel{padding:17px 15px}.build-preview{display:block}.preview-label{display:block;margin-bottom:8px}.build-preview .build-card-list{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.build-preview .build-card-list a{padding:7px;font-size:12px}.build-preview small{font-size:10px}.build-tradeoffs,.build-deck-groups{grid-template-columns:1fr;gap:18px}.build-section h2{font-size:20px;flex-wrap:wrap}.build-section h2 small{margin-left:0}h3{font-size:18px}.build-summary{font-size:13px}.build-version span{width:100%;margin-left:0}}@media(max-width:359px){.build-preview .build-card-list{grid-template-columns:1fr}.build-preview small{display:inline;margin-left:8px}}

.character-nav{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 24px}.character-nav a{padding:8px 13px;min-height:44px;border:1px solid var(--line);border-radius:6px;color:var(--accent,var(--muted));text-decoration:none}.character-nav a:hover{border-color:var(--accent,#37a8ec)}.character-nav a[aria-current=page]{background:#141b24;border-color:var(--accent,#37a8ec);color:var(--accent,#e3e8ee)}.local-guide-link{color:inherit;text-decoration:none}.local-guide-link:hover{text-decoration:underline}.guide-strategy{padding:18px 0 0}.guide-strategy h4{color:var(--ink);font-weight:600;margin-bottom:6px}.guide-strategy p{font-size:14px;line-height:1.85;margin:0 0 16px}.guide-keyword{color:#fbbf24}.version-note{margin:0 0 20px}.version-table-wrap{max-width:100%;overflow-x:auto}.version-table{width:100%;border-collapse:collapse;text-align:left;font-size:12px;min-width:420px}.version-table th,.version-table td{border-bottom:1px solid var(--line);padding:9px 10px;vertical-align:top}.version-table th{font-weight:500;color:var(--muted)}.version-table td{color:var(--ink)}.missing-note{padding:10px 14px;margin-bottom:20px;background:#b83b4b15;border-left:3px solid #b83b4b;font-size:13px}.relic-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.relic-list li{padding:12px}.relic-list strong{font-weight:500}.relic-effect{font-size:12px;line-height:1.7;margin-top:6px;color:var(--muted)}.detailed-cards li{border:1px solid var(--line);border-radius:6px;padding:10px;min-width:0}.detailed-cards a{padding:0;min-height:0;border:0}.guide-card-meta{font-size:11px;color:var(--muted);margin-top:8px}.guide-card-effect{margin-top:8px;font-size:12px;line-height:1.8;overflow-wrap:anywhere}.full-guide .build-details{border:0;margin-top:0}.character-guide-page .build-preview{display:none}.tier-index{display:grid;gap:8px;margin-bottom:28px}.tier-index-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--paper);border:1px solid var(--line);border-radius:6px}.tier-index-row .build-tier{margin:0}.tier-index-links{display:flex;flex-wrap:wrap;gap:10px 20px}.tier-index-links a{font-size:14px}.character-back{display:inline-block;margin-bottom:16px;font-size:12px}.character-guide-page .build-panel{margin-bottom:12px}@media(max-width:760px){.relic-list{grid-template-columns:1fr}.character-nav{gap:6px}.character-nav a{font-size:12px;padding:8px 10px}.guide-strategy p{font-size:13px}.detailed-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.build-deck-groups{grid-template-columns:1fr}.version-note{padding:10px 8px}}@media(max-width:359px){.detailed-cards{grid-template-columns:1fr}}
.tier-index{display:none}.character-guide-page .tier-index{display:grid}#all{scroll-margin-top:100px}
.relic-list li{display:flex;align-items:flex-start;gap:12px}.relic-icon{width:40px;height:40px;object-fit:contain;flex-shrink:0}.relic-content{min-width:0}.build-card-list a{min-height:44px;display:flex;align-items:center}.build-card-list{align-content:start}@media(max-width:640px){.relic-icon{width:34px;height:34px}.relic-list li{gap:10px}}
.build-deck-groups{display:block}.build-card-line{margin:10px 0;line-height:2;overflow-wrap:anywhere}.build-card-label{font-weight:600;color:var(--ink)}.card-text-link{color:#aab6c4;text-decoration:none}.card-text-link:hover{text-decoration:underline;color:#19affe}.card-text-link[data-rarity=Uncommon]{color:#74b3e6}.card-text-link[data-rarity=Rare]{color:#e3bf72}.card-text-link[data-rarity=Ancient]{color:#c49aef}.card-text-link:focus-visible{outline:2px solid #37a8ec;outline-offset:3px}
${navigation.styles}

.build-titlebar{position:sticky;top:var(--site-header-height,65px);z-index:90;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 0;margin:0 0 24px;background:#040609f5;border-bottom:1px solid var(--line);backdrop-filter:blur(12px)}.build-titlebar h1{margin:0;font-size:clamp(20px,1.9vw,28px);line-height:1.4;flex-shrink:0}.build-titlebar .character-nav{margin:0;justify-content:flex-end}.build-titlebar .character-nav a{white-space:nowrap}.build-section,[id^=build-]{scroll-margin-top:calc(var(--site-header-height,65px) + var(--build-titlebar-height,80px) + 16px)}
@media(max-width:1100px){.build-titlebar{flex-wrap:wrap;gap:12px}.build-titlebar h1{width:100%}.build-titlebar .character-nav{width:100%;justify-content:flex-start}}
@media(max-width:640px){.build-titlebar{padding:12px 0;margin-bottom:20px}.build-titlebar .character-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.build-titlebar .character-nav a{padding:8px 6px;text-align:center;font-size:12px}}
@media print{.build-titlebar{position:static;background:white;backdrop-filter:none}.build-titlebar .character-nav{display:none}}

.build-section{font-size:x-large}.build-section :is(h2,h3,h4,p,small,a,.relic-list li,.relic-effect,.build-tier){font-size:x-large}.build-section :is(.guide-strategy p,.build-tradeoffs p,.build-card-line,.relic-effect){line-height:1.8}
.build-titlebar .character-nav a{font-size:x-large}.build-titlebar .character-nav{flex-wrap:wrap}@media(max-width:640px){.build-titlebar .character-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.build-titlebar .character-nav a{white-space:normal;overflow-wrap:anywhere}}
.tier-index-row{align-items:flex-start}.tier-index-links{display:grid;gap:12px;flex:1;min-width:0}.tier-index-item{display:block;text-decoration:none;line-height:1.8;overflow-wrap:anywhere}.tier-index-name{font-weight:600}.tier-index-arrow,.tier-index-description{color:var(--muted)}.tier-index-item:hover .tier-index-name{text-decoration:underline}.tier-index-row .build-tier{margin-top:4px}
.tier-index-name,.tier-index-description{display:block}.tier-index-description{margin-top:4px}
.tier-index-name{font-size:x-large}.tier-index-description{font-size:large}
.build-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:28px;align-items:start}.character-sidebar{position:sticky;top:calc(var(--site-header-height,65px) + var(--build-titlebar-height,80px) + 16px);max-height:calc(100dvh - var(--site-header-height,65px) - var(--build-titlebar-height,80px) - 32px);overflow-y:auto;padding:2px}.character-sidebar .character-nav{display:grid;grid-template-columns:1fr;gap:10px;margin:0}.character-sidebar .character-nav a{font-size:x-large;text-align:left;padding:12px 16px;white-space:normal}.build-content{min-width:0}@media(max-width:760px){.build-layout{grid-template-columns:1fr;gap:20px}.character-sidebar{position:static;max-height:none;overflow:visible}.character-sidebar .character-nav{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.character-sidebar .character-nav a{padding:10px;text-align:center}}@media print{.build-layout{display:block}.character-sidebar{display:none}}
.build-layout{grid-template-columns:260px minmax(0,1fr)}.character-sidebar{top:calc(var(--site-header-height,65px) + 16px);max-height:calc(100dvh - var(--site-header-height,65px) - 32px)}.character-sidebar h1{font-size:clamp(20px,1.9vw,28px);line-height:1.4;margin:0 0 20px}.build-section,[id^=build-]{scroll-margin-top:calc(var(--site-header-height,65px) + 16px)}@media(max-width:760px){.build-layout{grid-template-columns:1fr}.character-sidebar{max-height:none}.character-sidebar h1{margin-bottom:16px}}@media print{.character-sidebar{display:block;position:static}.character-sidebar .character-nav{display:none}}
.build-panel:target{outline:none;outline-offset:0;border-color:var(--accent);box-shadow:none;background:#141b24}.build-panel:target .build-panel-heading{color:var(--accent)}
.tier-index-item{padding:10px 12px;border:1px solid transparent;border-radius:6px}.tier-index-item[aria-current="location"]{outline:none;outline-offset:0;border-color:var(--accent);box-shadow:none;background:#141b24}.tier-index-item[aria-current="location"] .tier-index-name{color:var(--accent)}
.character-sidebar .character-nav a{display:flex;align-items:center;gap:12px}.sidebar-character-icon{width:32px;height:32px;object-fit:contain;flex-shrink:0}.sidebar-character-text{display:flex;align-items:baseline;flex-wrap:nowrap;gap:8px;min-width:0;white-space:nowrap}.sidebar-character-zh{display:block;font-size:x-large;line-height:1.4}.sidebar-character-en{display:block;font-size:x-large;line-height:1.4;color:var(--muted);margin-top:0;overflow-wrap:normal}@media(max-width:760px){.character-sidebar .character-nav a{text-align:left;gap:8px}.sidebar-character-icon{width:26px;height:26px}}
.build-section .build-panel-heading h3,.build-section .build-panel-heading h3 a{font-size:x-large}.build-section .build-panel-heading .build-summary{font-size:large}
.character-guide-page .tier-index{display:flex;flex-wrap:nowrap;align-items:center;gap:10px;max-width:100%;overflow-x:auto;padding:3px 3px 10px;scrollbar-width:thin;scrollbar-color:#354454 transparent}.tier-index .tier-index-item{display:inline-flex;align-items:center;gap:10px;flex:0 0 auto;white-space:nowrap;min-height:48px}.tier-index .build-tier{margin:0}.tier-index .tier-index-name{display:inline}
.character-guide-page .tier-index{position:sticky;top:var(--site-header-height,65px);z-index:80;background:#040609f5;backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding-top:10px;padding-bottom:10px}.build-panel[id]{scroll-margin-top:calc(var(--site-header-height,65px) + var(--tier-menu-height,70px) + 16px)}.build-section{scroll-margin-top:var(--site-header-height,65px)}@media print{.character-guide-page .tier-index{position:static;backdrop-filter:none}}

main{max-width:2000px}.build-layout{grid-template-columns:240px 280px minmax(0,1fr);gap:24px}.tier-sidebar{position:sticky;top:calc(var(--site-header-height,65px) + 16px);max-height:calc(100dvh - var(--site-header-height,65px) - 32px);overflow-y:auto;min-width:0;padding:2px}.tier-sidebar .tier-index{position:static;display:flex;flex-direction:column;align-items:stretch;gap:10px;overflow:visible;max-width:100%;margin:0;padding:0;border:0;background:none;backdrop-filter:none}.tier-sidebar .tier-index-item{flex:0 0 auto;white-space:normal;align-items:flex-start;line-height:1.5}.tier-sidebar .build-tier{flex-shrink:0}.build-panel.is-selected{border-color:var(--accent);background:#141b24}.build-panel.is-selected .build-panel-heading{color:var(--accent)}.build-panel[id]{scroll-margin-top:calc(var(--site-header-height,65px) + 16px)}
@media(max-width:1100px){.build-layout{grid-template-columns:240px minmax(0,1fr)}.character-sidebar{grid-column:1/-1;position:static;max-height:none}.character-sidebar .character-nav{grid-template-columns:repeat(5,minmax(0,1fr))}.character-sidebar .character-nav a{padding:10px 8px;gap:6px}.character-sidebar .sidebar-character-icon{width:24px;height:24px}.tier-sidebar{grid-column:1;grid-row:2}.build-content{grid-column:2;grid-row:2}}
@media(max-width:760px){.build-layout{grid-template-columns:1fr}.character-sidebar{grid-column:auto}.character-sidebar .character-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.tier-sidebar,.build-content{grid-column:auto;grid-row:auto}.tier-sidebar{position:static;max-height:none;overflow:visible}.tier-sidebar .tier-index{flex-direction:row;overflow-x:auto;align-items:center;padding-bottom:8px}.tier-sidebar .tier-index-item{white-space:nowrap;align-items:center}.build-content{min-width:0}}
@media print{.tier-sidebar{display:none}.build-layout{display:block}}

.character-sidebar .character-nav a[aria-current=page],.tier-sidebar .tier-index-item[aria-current="location"],.build-panel:target,.build-panel.is-selected{border-color:var(--accent)}

@media screen{
 html,body{height:100%;overflow:hidden}body{height:100dvh;display:flex;flex-direction:column}.site-header{position:relative;flex:0 0 auto}main#main-content{flex:1;min-height:0;width:100%;padding:20px 24px;overflow:hidden}.build-layout{height:100%;min-height:0;grid-template-columns:clamp(180px,16vw,240px) clamp(210px,19vw,280px) minmax(0,1fr);grid-template-rows:minmax(0,1fr);align-items:stretch;gap:20px}.character-sidebar,.tier-sidebar{position:static;grid-column:auto;grid-row:auto;min-height:0;height:100%;max-height:none;overflow-y:auto;overscroll-behavior:contain}.character-sidebar .character-nav{grid-template-columns:1fr}.build-content{grid-column:auto;grid-row:auto;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;scrollbar-color:#354454 transparent;padding:3px 8px 3px 3px}.build-content:focus-visible{outline:2px solid #37a8ec;outline-offset:-2px}.build-content .build-section{margin-bottom:0}.build-content .build-panel{margin-bottom:0}.tier-sidebar .tier-index{position:static}
}
@media screen and (max-width:1200px){.build-content .relic-list,.build-content .build-tradeoffs{grid-template-columns:1fr}.build-panel{padding:16px}}
@media screen and (max-width:760px){main#main-content{padding:12px}.build-layout{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr);gap:12px}.character-sidebar,.tier-sidebar{height:auto;overflow-y:hidden;overflow-x:auto;max-height:none}.character-sidebar .character-nav{display:flex;flex-wrap:nowrap;gap:8px}.character-sidebar .character-nav a{flex:0 0 auto;padding:8px 12px}.sidebar-character-text{white-space:nowrap}.tier-sidebar .tier-index{flex-direction:row;flex-wrap:nowrap;overflow-x:auto;gap:8px;padding:2px 2px 8px}.tier-sidebar .tier-index-item{white-space:nowrap;align-items:center}.build-content{height:100%;padding-right:4px}}

.tier-sidebar .tier-index-item{align-items:center}.tier-sidebar .build-tier{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;min-width:36px;flex-shrink:0}
.tier-sidebar .tier-index-name{color:var(--accent)}
.build-content{border-top:1px solid var(--content-accent,var(--line));border-bottom:1px solid var(--content-accent,var(--line));border-radius:6px}
.build-content{border:1px solid var(--content-accent,var(--line));border-radius:8px;background:#141b24;padding:0}.build-content .build-panel,.build-content .build-panel:target,.build-content .build-panel.is-selected{border:0;outline:none;box-shadow:none;border-radius:0;background:transparent}
.tier-sidebar .tier-index-item,.tier-sidebar .tier-index-item:hover,.tier-sidebar .tier-index-item:focus,.tier-sidebar .tier-index-item .tier-index-name,.tier-sidebar .tier-index-item:hover .tier-index-name{text-decoration:none}







${resourceIcons.styles}

.build-card-entry{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;vertical-align:baseline}.card-tier-badge{display:inline-flex;align-items:center;justify-content:center;min-width:24px;padding:0 5px;border-radius:4px;color:#fff;font-size:16px;font-weight:700;line-height:1.5}.card-tier-badge[data-tier=S]{background:#b83b4b}.card-tier-badge[data-tier=A]{background:#a65320}.card-tier-badge[data-tier=B]{background:#846515}.card-tier-badge[data-tier=C]{background:#337749}.card-tier-badge[data-tier=D]{background:#356a9a}.card-tier-badge[data-tier=unranked]{color:var(--muted);background:transparent}
${navigation.layoutStyles}
main#main-content>.character-sidebar{flex:0 0 auto;position:static;width:100%;height:auto;max-height:30%;overflow:auto;margin:0 0 var(--group-gap);padding:2px}
main#main-content>.character-sidebar .character-nav{display:flex;flex-wrap:wrap;justify-content:flex-start;gap:var(--control-gap);margin:0}
main#main-content>.character-sidebar .character-nav a{flex:0 0 auto;text-align:left}
main#main-content>.build-layout{grid-template-columns:clamp(210px,22vw,300px) minmax(0,1fr);grid-template-rows:minmax(0,1fr)}
main#main-content>.build-layout .tier-sidebar{grid-column:1;grid-row:1}
main#main-content>.build-layout .build-content{grid-column:2;grid-row:1}
@media(max-width:760px){main#main-content>.character-sidebar .character-nav a{padding:6px 8px;gap:6px}main#main-content>.character-sidebar .sidebar-character-zh{font-size:18px}main#main-content>.character-sidebar .sidebar-character-en{font-size:18px}main#main-content>.build-layout{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}main#main-content>.build-layout .tier-sidebar{grid-column:1;grid-row:1}main#main-content>.build-layout .build-content{grid-column:1;grid-row:2}}


/* Center both menus above the full-width content. */
main#main-content>.tier-sidebar{flex:0 0 auto;position:static;width:100%;height:auto;max-height:25%;overflow:auto;margin:0 0 var(--group-gap);padding:2px}
main#main-content>.tier-sidebar .tier-index{display:flex;flex-direction:row;flex-wrap:wrap;justify-content:flex-start;align-items:center;gap:var(--control-gap);overflow:visible}
main#main-content>.tier-sidebar .tier-index-item{white-space:nowrap}
main#main-content>.build-layout{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr)}
main#main-content>.build-layout .build-content{grid-column:1;grid-row:1}
main#main-content .build-content .build-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;margin:0;padding:0;border:0}
main#main-content .build-details :is(.build-overview,.build-resources){display:flex;flex-direction:column;gap:24px;min-width:0}
main#main-content .build-content :is(.build-explanation,.build-tradeoffs,.build-deck-groups){display:flex;flex-direction:column;gap:24px;margin:0;padding:0;border:0;min-width:0}
main#main-content .build-explanation>div{min-width:0;padding:0}
main#main-content .build-details h4{margin:0 0 8px;color:var(--accent);font-size:24px;font-weight:600;line-height:1.4}
main#main-content .build-details p{margin:0;line-height:1.8}
main#main-content .build-details .relic-group{margin:0}
main#main-content .build-resources .relic-list{grid-template-columns:minmax(0,1fr)}
main#main-content .build-content .build-details{position:relative}
main#main-content .build-details::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:1px;background:var(--line);pointer-events:none}
main#main-content .character-sidebar .character-nav a,main#main-content .tier-sidebar .tier-index-item{font-family:Arial,"Microsoft JhengHei",sans-serif;font-size:24px;font-weight:400;line-height:1.4}
main#main-content .tier-sidebar .tier-index-name{font:inherit}
@media(max-width:760px){main#main-content .character-sidebar .character-nav a,main#main-content .tier-sidebar .tier-index-item{font-size:18px}main#main-content .build-details::before{display:none}main#main-content .build-resources{border-top:1px solid var(--line);padding-top:24px}}

@media(max-width:760px){main#main-content .build-content .build-details{grid-template-columns:minmax(0,1fr);gap:24px}}



/* Center menus and keep each guide in a single readable column. */
@media screen and (min-width:761px) {
  main#main-content:has(>.tier-sidebar:not([hidden])) {
    overflow-y: auto;
  }

  main#main-content>.tier-sidebar {
    width: 100%;
    height: auto;
    max-height: none;
    align-self: center;
    margin-inline: auto;
    padding-inline: 0;
    overflow: visible;
  }

  main#main-content>.tier-sidebar .tier-index {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  html body main#main-content>.tier-sidebar .tier-index a.tier-index-item {
    flex: 0 0 auto;
    min-width: 0;
    justify-content: flex-start;
    text-align: left;
    white-space: normal;
  }
}
@media screen and (min-width:761px) {
  main#main-content>.character-sidebar {
    width: 100%;
    align-self: center;
    margin-inline: auto;
    padding-inline: 0;
  }

  main#main-content>.character-sidebar .character-nav {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    width: 100%;
  }

  main#main-content>.character-sidebar .character-nav a {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    padding: 8px;
  }

  main#main-content>.character-sidebar .sidebar-character-text {
    display: none;
  }
}
main#main-content>.character-sidebar .character-nav,main#main-content>.tier-sidebar .tier-index{justify-content:center}
main#main-content>.build-layout .build-content{width:100%;justify-self:center}
main#main-content .build-content .build-section{width:100%;min-width:0}
main#main-content .build-content .build-details{display:flex;flex-direction:column;gap:28px}
main#main-content .build-details::before{display:none}
.build-card-pairs{display:grid;grid-template-columns:minmax(0,1fr);gap:20px}
@media (width > 1024px) and (hover: hover) and (pointer: fine), (width > 1366px) { .build-card-pairs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.build-inline-card-pair{min-width:0;border:1px solid var(--line);border-radius:10px;padding:14px;background:var(--paper)}
.build-pair-name{text-align:center;margin-bottom:12px}.build-pair-name .build-card-entry{display:inline-flex;align-items:center;gap:8px}
.build-pair-images{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
.build-pair-images figure{margin:0;min-width:0}
.build-pair-images img{display:block;width:100%;height:auto;aspect-ratio:340/454;object-fit:contain}.build-no-upgrade{padding:40px 8px;text-align:center;color:var(--muted)}
@media(max-width:760px){main#main-content>.build-layout .build-content{width:100%}.build-inline-card-pair{padding:8px}.build-pair-images{gap:6px}main#main-content .build-details .build-resources{border-top:0;padding-top:0}}

/* Stretch profession controls to the same edges as the build menu. */
@media screen and (min-width:761px) {
  html body main#main-content>.character-sidebar .character-nav {
    display:grid;grid-template-columns:repeat(5,minmax(0,1fr));width:100%;
  }
  html body main#main-content>.character-sidebar .character-nav a {
    width:100%!important;min-width:0!important;max-width:none!important;
  }
}

/* Full-width build menus and content on phones and tablet-sized viewports. */
@media screen and (max-width:1133px) {
  html body main#main-content>.character-sidebar,
  html body main#main-content>.tier-sidebar,
  html body main#main-content>.build-layout,
  html body main#main-content>.build-layout .build-content {
    width:100%!important;max-width:none;min-width:0;margin-inline:0;padding-inline:0;
  }
  html body main#main-content>.character-sidebar .character-nav {
    display:grid;grid-template-columns:repeat(5,minmax(0,1fr));width:100%;
  }
  html body main#main-content>.character-sidebar .character-nav a {
    width:100%!important;min-width:0!important;max-width:none!important;
  }
  html body main#main-content>.tier-sidebar .tier-index {
    display:grid;grid-template-columns:minmax(0,1fr);width:100%;
  }
  html body main#main-content>.tier-sidebar .tier-index-item {
    width:100%;min-width:0;white-space:normal;justify-content:flex-start;text-align:left;
  }
}

/* Keep build menu labels left-aligned at every viewport size. */
html body main#main-content>.tier-sidebar .tier-index-item {
  justify-content:flex-start!important;text-align:left!important;
}
html body main#main-content>.tier-sidebar .tier-index-item .tier-index-name {
  text-align:left;
}
@media screen and (max-width:760px) {
  html body main#main-content:has(>.tier-sidebar:not([hidden])) {
    overflow-y: auto;
  }
  html body main#main-content > .tier-sidebar {
    max-height: none;
    overflow: visible;
  }
  html body main#main-content > .tier-sidebar .tier-index {
    max-height: none;
    overflow: visible;
  }
}
</style></head><body class="character-guide-page">${navigation.renderHeader('builds')}<main id="main-content"><div class="character-sidebar" aria-label="角色選單">${characterNav()}</div><div class="tier-sidebar" aria-label="流派強度選單" hidden>${tierMenus}</div><div class="build-layout" hidden><div class="build-content" role="region" aria-label="流派內容" tabindex="0">${sections}</div></div><p id="build-empty" hidden>沒有符合條件的流派。</p></main><script>

let selectedPool='',selectedBuildId='';
const buildSections=[...document.querySelectorAll('.build-section')],characterLinks=[...document.querySelectorAll('[data-character]')];
function selectCharacter(pool,buildId=''){
  const section=buildSections.find(section=>section.dataset.pool===pool)||buildSections[0];
  selectedPool=section.dataset.pool;
  document.querySelector('.build-content').style.setProperty('--content-accent',section.style.getPropertyValue('--accent'));
  const panels=[...section.querySelectorAll('.build-panel')];
  selectedBuildId=panels.some(panel=>panel.id===buildId)?buildId:'';
  document.querySelector('.tier-sidebar').hidden=!!selectedBuildId;
  document.querySelector('.build-layout').hidden=!selectedBuildId;
  for(const item of buildSections){item.hidden=item!==section;for(const panel of item.querySelectorAll('.build-panel')){const active=panel.id===selectedBuildId;panel.hidden=!active;panel.classList.toggle('is-selected',active);}}
  for(const menu of document.querySelectorAll('[data-menu-pool]'))menu.hidden=menu.dataset.menuPool!==selectedPool;
  for(const link of characterLinks){if(link.dataset.character===selectedPool)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
  for(const link of document.querySelectorAll('.tier-index-item')){if(link.getAttribute('href')==='#'+selectedBuildId)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
  document.getElementById('build-empty').hidden=true;
  updateStickyOffsets();

  document.querySelector('.build-content').scrollTo({top:0,left:0,behavior:'instant'});
}
function applyBuildRoute(){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{id='';}
  const target=document.getElementById(id);
  if(target?.classList.contains('build-panel')){selectCharacter(target.closest('.build-section').dataset.pool,id);return;}
  if(target?.classList.contains('build-section')){selectCharacter(target.dataset.pool);return;}
  selectedPool='';selectedBuildId='';
  document.querySelector('.tier-sidebar').hidden=true;
  document.querySelector('.build-layout').hidden=true;
  for(const link of characterLinks)link.removeAttribute('aria-current');
  for(const section of buildSections)section.hidden=true;
  for(const link of document.querySelectorAll('.tier-index-item'))link.removeAttribute('aria-current');
}
function updateStickyOffsets(){const header=document.querySelector('.site-header');if(header)document.documentElement.style.setProperty('--site-header-height',header.getBoundingClientRect().height+'px');}
updateStickyOffsets();window.addEventListener('resize',updateStickyOffsets);
if(typeof ResizeObserver!=='undefined'){const stickyObserver=new ResizeObserver(updateStickyOffsets);const header=document.querySelector('.site-header');if(header)stickyObserver.observe(header);}
window.addEventListener('hashchange',applyBuildRoute);

applyBuildRoute();

</script></body></html>`;
require('../cards/desktop-page-css.cjs').writeDesktopPage('builds.html',navigation.openPageLinksInNewTab(html));
console.log('Created local Builds page: 25 builds.');

