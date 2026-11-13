function buildCatalogs(only){
process.chdir(require('path').resolve(__dirname,'../..'));
const fs=require('fs'),nav=require('../cards/site-navigation.cjs');
const potion=require('../potion/potion-controls.cjs');
const columns=require('../relic/catalog-columns.cjs');
const relic=require('../relic/relic-controls.cjs');
const chapter=require('./chapter-controls.cjs');
const encounters=require('../monster/encounters.cjs');
const relicLayout=require('../relic/relic-layout.cjs');
const potionLayout=require('../potion/potion-layout.cjs');
const kinds={potion:'藥水',event:'事件',relic:'遺物',monster:'怪物'};
const data=Object.fromEntries(Object.keys(kinds).map(k=>[k,JSON.parse(fs.readFileSync('data/'+k+'/catalog.json'))]));
const assets=require('../cards/data-assets.cjs').load();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={Common:'普通',Uncommon:'罕見',Rare:'稀有',Event:'事件',Ancient:'先古之民',Shop:'商店',Starter:'初始',Ironclad:'鐵甲戰士',Silent:'靜默獵手',Defect:'故障機器人',Necrobinder:'亡靈契約師',Regent:'儲君',Shared:'共享',act1a:'第一章・密林',act1b:'第一章・暗港',act2:'第二章・巢穴',act3:'第三章・榮耀',boss:'Boss',elite:'菁英',normal:'一般',weak:'弱怪',summon:'召喚物'};
const file=k=>k+'.html';
const cards=JSON.parse(fs.readFileSync('data/cards/cards-source.json'));
const routes=new Map(cards.map(c=>['/zh-TW/card/'+c.slug,'cards.html#card-'+c.id]));
for(const [k,{items}] of Object.entries(data)){routes.set('/zh-TW/'+k,file(k));for(const x of items)if(x.slug)routes.set('/zh-TW/'+k+'/'+x.slug,'data/'+k+'/'+k+'-'+x.slug+'.html');else routes.set('/zh-TW/'+k+'/'+x.id.toLowerCase().replaceAll('_','-'),file(k)+'#'+x.id);}
function href(url,prefix=''){const plain=url.replace('https://slaythespire2.net','');if(routes.has(plain))return prefix+routes.get(plain);if(plain.startsWith('/'))return 'https://slaythespire2.net'+plain;return url;}
function header(k,prefix=''){return nav.renderHeader(k).replace(/href="([^"]+)"/g,(_,u)=>'href="'+(nav.items.some(item=>item[2]===u)?prefix+u:href(u,prefix))+'"');}
const css=`:root{color-scheme:dark;--bg:#040609;--paper:#0d131a;--ink:#e3e8ee;--muted:#aab6c4;--line:#293340;--focus:#37a8ec}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:18px/1.6 system-ui,sans-serif}a{color:#74b3e6}main{width:90%;margin:28px auto 60px}h1{font-size:32px}h2{font-size:23px;margin:12px 0}.intro,footer{color:var(--muted)}.filters{display:flex;flex-wrap:wrap;gap:12px;margin:20px 0 28px}.filters input,.filters select{font:inherit;padding:10px 14px;background:var(--paper);color:var(--ink);border:1px solid var(--line);border-radius:7px;max-width:100%}.filters input{flex:1;min-width:180px}.catalog{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:18px}.entry{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:20px;min-width:0;scroll-margin-top:160px}.entry:target{outline:2px solid var(--focus)}.entry img{display:block;object-fit:contain;width:100%;height:140px}.entry.event img{height:180px;object-fit:cover;border-radius:6px}.entry p{white-space:pre-line}.tag{font-size:15px;color:var(--muted)}.details{display:inline-block;margin-top:12px}.entry[hidden]{display:none}footer{margin-top:32px;font-size:14px}button,input,select,a{touch-action:manipulation}:focus-visible{outline:2px solid var(--focus);outline-offset:3px}@media(max-width:640px){main{width:94%}.filters>*{width:100%}}`;
const script=`const entries=[...document.querySelectorAll('.entry')],search=document.querySelector('#search'),selects=[...document.querySelectorAll('select')];function filter(){const q=search.value.trim().toLowerCase();let count=0;for(const e of entries){e.hidden=!(e.textContent.toLowerCase().includes(q)&&selects.every(s=>!s.value||e.dataset[s.name].split('|').includes(s.value)));if(!e.hidden)count++;}document.querySelector('#empty').hidden=count>0;}search.addEventListener('input',filter);selects.forEach(s=>s.addEventListener('change',filter));`;
for(const kind of Object.keys(kinds))fs.mkdirSync('data/'+kind,{recursive:true});
fs.writeFileSync('assets/event/no-image.svg','<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="#11171d"/><text x="160" y="94" text-anchor="middle" fill="#aab6c4" font-size="18">來源未提供圖片</text></svg>');
const sourceCss=fs.readFileSync('assets/event/styles/source.css','utf8').replace(/@font-face\s*\{[^}]*\}/g,'');fs.writeFileSync('assets/event/styles/source.css',sourceCss);
for(const [k,{items,version}] of Object.entries(data).filter(([kind])=>!only||kind===only)){
 if(k==='potion')items.sort(potion.compare);
 if(k==='relic')items.sort(relicLayout.compare);
 if(['event','monster'].includes(k))items.sort(k==='monster'?chapter.compareMonsters:chapter.compare);
 const fields=k==='potion'?['rarity']:k==='relic'?['pool','rarity']:k==='event'?['acts']:['acts','encounterType'];
 const select=k==='potion'?potion.controls:k==='relic'?relic.controls:k==='monster'?'':chapter.controls(k,items);
 const searchControl='<input id="search" type="search" placeholder="搜尋名稱或內容" aria-label="搜尋'+kinds[k]+'">';
 const filterControls=['potion','relic'].includes(k)?select+'<div class="catalog-search-tools">'+columns.controls+searchControl+'</div>':select+searchControl;
 const content=k==='monster'?encounters.render(items,assets,esc):items.map(x=>{const image=assets[x.imagePath||x.image]||'assets/event/no-image.svg';const desc=x.descriptionClean||('生命值：'+x.minHp+(x.maxHp!==x.minHp?'–'+x.maxHp:'')+' HP');return '<article class="entry '+k+'" id="'+x.id+'" '+fields.map(f=>'data-'+f.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'="'+esc(f==='acts'?chapter.acts(x):[x[f]].flat().filter(Boolean).join('|'))+'"').join(' ')+'><img src="'+image+'" alt="'+esc(x.name)+'" loading="lazy">'+(['potion','relic'].includes(k)?'<div class="'+k+'-title-row">':'')+'<h2>'+esc(x.name)+(['potion','relic'].includes(k)&&x.nameEn?' <span class="catalog-name-en" lang="en">'+esc(x.nameEn)+'</span>':'')+'</h2><div class="tag">'+(k==='relic'?['rarity']:fields).flatMap(f=>[x[f]].flat()).filter(Boolean).map(v=>esc(labels[v]||v)).join(' · ')+(k==='relic'?require('../relic/ancient-rankings.cjs').render(x.id):'')+'</div>'+(['potion','relic'].includes(k)?'</div>':'')+'<p>'+(k==='potion'?potion.description(x):k==='relic'?potion.description(x).replaceAll('potion-keyword','relic-keyword'):esc(desc))+'</p>'+(['event','monster'].includes(k)?'<a class="details" href="data/'+k+'/'+k+'-'+x.slug+'.html">'+(k==='event'?'查看選項與結果':'查看招式與出招順序')+' →</a>':'')+'</article>';}).join('');
 fs.writeFileSync(file(k),'<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><link rel="apple-touch-icon" sizes="180x180" href="assets/cards/icons/site-logo.png"><link rel="icon" type="image/webp" href="assets/cards/icons/site-logo.webp"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+kinds[k]+'｜殺戮尖塔2</title><style>'+css+nav.styles+(k==='potion'?potion.styles+potionLayout.styles:k==='relic'?potion.styles.replaceAll('.potion','.relic')+relic.styles+relicLayout.styles:chapter.styles)+nav.layoutStyles+columns.styles+'</style><body>'+header(k)+'<main id="main-content">'+'<div class="filters'+(k==='potion'?' potion-filters':k==='relic'?' relic-filters':' chapter-filters')+'">'+filterControls+'</div><div id="catalog-scroll" class="catalog-scroll" role="region" aria-label="瀏覽內容" tabindex="0">'+(k==='potion'?potionLayout.render(content,items):k==='relic'?relicLayout.render(content,items):k==='monster'?content:chapter.render(content,items,k))+'<p id="empty" hidden>沒有符合條件的內容。</p></div></main><script>'+(k==='potion'?potion.script:k==='relic'?relic.script:k==='monster'?encounters.script:chapter.script)+columns.script+'</script></body></html>');
 if(!['event','monster'].includes(k))continue;
 for(const x of items){const raw=fs.readFileSync('data/'+k+'/source/'+x.slug+'.html','utf8');let main=raw.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];if(!main)throw Error('Missing detail '+x.slug);
 main=main.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/\son\w+="[^"]*"/gi,'').replace(/\s(?:srcset|srcSet)="[^"]*"/g,'').replace(/src="([^"]+)"/g,(_,u)=>{u=u.replace(/&amp;/g,'&');if(u.startsWith('data:'))return 'src="'+u+'"';if(!assets[u])throw Error('Missing detail asset '+u);return 'src="../../'+assets[u]+'"';}).replace(/href="([^"]+)"/g,(_,u)=>'href="'+href(u,'../../')+'"');
 if(k==='monster')main=main.replaceAll('border-gray-500/30">弱化</span>','border-gray-500/30">弱怪</span>').replaceAll('晉階','進階').replaceAll('進階</a>級數','進階</a>等級');
 if(k==='event')main=require('../cards/detail-card-database.cjs').replaceCards(main);
 // Source details are fully server-rendered; remove the online-only version switch.
 main=main.replace(/<button\b[^>]*>[\s\S]*?<\/button>/g,'');
 fs.writeFileSync('data/'+k+'/'+k+'-'+x.slug+'.html','<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(x.name)+'｜'+kinds[k]+'</title><link rel="stylesheet" href="../../assets/event/styles/source.css"><style>'+nav.styles+'body{background:#040609;color:#e3e8ee}main{min-width:0}main [class*="flex-wrap"]:has(>[aria-label="切換遊戲版本"]){display:none}main img{max-width:100%}'+nav.layoutStyles+'</style><body>'+header(k,'../../')+'<main id="main-content">'+main+'</main></body></html>');
 }
 console.log('Built '+k+': '+items.length);
}
// Update navigation without rebuilding unrelated card/game content.
for(const f of only==='monster'?[]:['cards.html','builds.html']){let h=fs.readFileSync(f,'utf8');h=h.replace(/<header class="site-header">[\s\S]*?<\/header>/,nav.renderHeader(f==='cards.html'?'cards':'builds').replace(/^<a class="skip-link"[^]*?<\/a>/,''));fs.writeFileSync(f,nav.openPageLinksInNewTab(h));}

for(const kind of ['event','monster'].filter(kind=>!only||kind===only))require('./catalog-detail-pane.cjs').build(kind);

for(const kind of ['event','monster'].filter(kind=>!only||kind===only)){
 const files=[file(kind),...data[kind].items.map(x=>'data/'+kind+'/'+kind+'-'+x.slug+'.html')];
 for(const file of files){const html=fs.readFileSync(file,'utf8');const updated=html.replaceAll('蔓生之地','密林').replaceAll('水底碼頭','暗港').replaceAll('蟲巢','巢穴').replaceAll('榮光之殿','榮耀');if(updated!==html)fs.writeFileSync(file,updated);}
}

for(const kind of ['event','monster'].filter(kind=>!only||kind===only)){const name=file(kind);let html=fs.readFileSync(name,'utf8');if(!html.includes('href="assets/cards/mobile-layout.css"'))html=html.replace(/<body\b/,'<link rel="stylesheet" href="assets/cards/mobile-layout.css"><body');if(!html.includes('src="assets/cards/mobile-layout.js"'))html=html.replace('</body>','<script src="assets/cards/mobile-layout.js"></script></body>');fs.writeFileSync(name,html);}

for(const kind of Object.keys(kinds).filter(kind=>!only||kind===only)){const name=file(kind);let html=fs.readFileSync(name,'utf8');if(!html.includes('src="assets/cards/search-controls.js"'))html=html.replace('</body>','<script src="assets/cards/search-controls.js"></script></body>');if(kind==='event') html=html.replace('</body>','<link rel="stylesheet" href="assets/event/event-desktop.css"></body>');
 if(kind==='monster') html=html.replace('</body>','<link rel="stylesheet" href="assets/monster/monster-desktop.css"></body>');
 if(['relic','potion'].includes(kind)) html=html.replace('</body>','<link rel="stylesheet" href="assets/'+kind+'/'+kind+'-desktop.css"></body>');
 require('../cards/desktop-page-css.cjs').writeDesktopPage(name,html);}
}
module.exports=buildCatalogs;
if(require.main===module)buildCatalogs();
