function buildCatalogs(only){
process.chdir(require('path').resolve(__dirname,'../..'));
const fs=require('fs'),nav=require('../cards/site-navigation.cjs');
const potion=require('../potion/potion-controls.cjs');
const columns=require('../relic/catalog-columns.cjs');
const relic=require('../relic/relic-controls.cjs');



const relicLayout=require('../relic/relic-layout.cjs');
const potionLayout=require('../potion/potion-layout.cjs');
const kinds={potion:'藥水',relic:'遺物'};
if(only && !kinds[only])throw new Error('Unsupported catalog: '+only);
const data=Object.fromEntries(Object.keys(kinds).map(k=>[k,JSON.parse(fs.readFileSync('data/'+k+'/catalog.json'))]));
const assets=require('../cards/data-assets.cjs').load();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={Common:'普通',Uncommon:'罕見',Rare:'稀有',Event:'事件',Ancient:'先古之民',Shop:'商店',Starter:'初始',Ironclad:'鐵甲戰士',Silent:'靜默獵手',Defect:'故障機器人',Necrobinder:'亡靈契約師',Regent:'儲君',Shared:'共享',act1a:'第一章・密林',act1b:'第一章・暗港',act2:'第二章・巢穴',act3:'第三章・榮耀',boss:'Boss',elite:'菁英',normal:'一般',weak:'弱怪',summon:'召喚物'};
const file=k=>({potion:'Potions.html',relic:'Relics.html'})[k];
const cards=JSON.parse(fs.readFileSync('data/cards/cards-source.json'));
const routes=new Map(cards.map(c=>['/zh-TW/card/'+c.slug,'Cards.html#card-'+c.id]));
for(const [k,{items}] of Object.entries(data)){routes.set('/zh-TW/'+k,file(k));for(const x of items)if(x.slug)routes.set('/zh-TW/'+k+'/'+x.slug,'data/'+k+'/'+k+'-'+x.slug+'.html');else routes.set('/zh-TW/'+k+'/'+x.id.toLowerCase().replaceAll('_','-'),file(k)+'#'+x.id);}
function href(url,prefix=''){const plain=url.replace('https://slaythespire2.net','');if(routes.has(plain))return prefix+routes.get(plain);if(plain.startsWith('/'))return 'https://slaythespire2.net'+plain;return url;}
function header(k,prefix=''){return nav.renderHeader(k).replace(/href="([^"]+)"/g,(_,u)=>'href="'+(!u.startsWith('https://')&&nav.items.some(item=>item[2]===u)?prefix+u:href(u,prefix))+'"');}
const css=`:root{color-scheme:dark;--bg:#040609;--paper:#0d131a;--ink:#e3e8ee;--muted:#aab6c4;--line:#293340;--focus:#37a8ec}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:18px/1.6 system-ui,sans-serif}a{color:#74b3e6}main{width:90%;margin:28px auto 60px}h1{font-size:32px}h2{font-size:23px;margin:12px 0}.intro,footer{color:var(--muted)}.filters{display:flex;flex-wrap:wrap;gap:12px;margin:20px 0 28px}.filters input,.filters select{font:inherit;padding:10px 14px;background:var(--paper);color:var(--ink);border:1px solid var(--line);border-radius:7px;max-width:100%}.filters input{flex:1;min-width:180px}.catalog{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:18px}.entry{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:20px;min-width:0;scroll-margin-top:160px}.entry:target{outline:2px solid var(--focus)}.entry img{display:block;object-fit:contain;width:100%;height:140px}.entry p{white-space:pre-line}.tag{font-size:15px;color:var(--muted)}.details{display:inline-block;margin-top:12px}.entry[hidden]{display:none}footer{margin-top:32px;font-size:14px}button,input,select,a{touch-action:manipulation}:focus-visible{outline:2px solid var(--focus);outline-offset:3px}@media(max-width:640px){main{width:94%}.filters>*{width:100%}}`;
for(const kind of Object.keys(kinds))fs.mkdirSync('data/'+kind,{recursive:true});
fs.writeFileSync('assets/event/no-image.svg','<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="#11171d"/><text x="160" y="94" text-anchor="middle" fill="#aab6c4" font-size="18">來源未提供圖片</text></svg>');
for(const [k,{items,version}] of Object.entries(data).filter(([kind])=>!only||kind===only)){
 if(k==='potion')items.sort(potion.compare);
 if(k==='relic')items.sort(relicLayout.compare);

 const fields=k==='potion'?['rarity']:k==='relic'?['pool','rarity']:['acts','encounterType'];
 const select=k==='potion'?potion.controls:k==='relic'?relic.controls:'';
 const searchControl='<div class="search-control"><input id="search" type="text" inputmode="search" role="searchbox" placeholder="搜尋關鍵字" '+(k==='relic'?'autocomplete="off" ':'')+'aria-label="搜尋'+kinds[k]+'"><button type="button" class="search-clear" aria-label="清除搜尋關鍵字" title="清除搜尋關鍵字"><span class="search-icon" aria-hidden="true">🔍</span></button></div>';
 const filterControls=['potion','relic'].includes(k)?select+'<div class="catalog-search-tools">'+columns.controls+searchControl+'</div>':select+searchControl;
 const content=items.map(x=>{const image=assets[x.imagePath||x.image]||'assets/event/no-image.svg';const desc=x.descriptionClean||('生命值：'+x.minHp+(x.maxHp!==x.minHp?'–'+x.maxHp:'')+' HP');return '<article class="entry '+k+'" id="'+x.id+'" '+fields.map(f=>'data-'+f.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'="'+esc([x[f]].flat().filter(Boolean).join('|'))+'"').join(' ')+'><img src="'+image+'" alt="'+esc(x.name)+'" loading="lazy">'+(['potion','relic'].includes(k)?'<div class="'+k+'-title-row">':'')+'<h2>'+esc(x.name)+(['potion','relic'].includes(k)&&x.nameEn?' <span class="catalog-name-en" lang="en">'+esc(x.nameEn)+'</span>':'')+'</h2><div class="tag">'+(k==='relic'?['rarity']:fields).flatMap(f=>[x[f]].flat()).filter(Boolean).map(v=>esc(labels[v]||v)).join(' · ')+(k==='relic'?require('../relic/ancient-rankings.cjs').render(x.id):'')+'</div>'+(['potion','relic'].includes(k)?'</div>':'')+'<p'+(['potion','relic'].includes(k)?' lang="en"':'')+'>'+(k==='potion'?potion.description(x):k==='relic'?require('../relic/relic-card.cjs').description(x):esc(desc))+'</p>'+'</article>';}).join('');
 fs.writeFileSync(file(k),'<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png?v=4"><link rel="icon" type="image/x-icon" href="assets/cards/icons/site-favicon.ico?v=4"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+kinds[k]+'｜殺戮尖塔2</title><style>'+css+nav.styles+(k==='potion'?potion.styles+potionLayout.styles:k==='relic'?potion.styles.replaceAll('.potion','.relic')+relic.styles+relicLayout.styles:'')+nav.layoutStyles+columns.styles+fs.readFileSync('assets/cards/search-control.css','utf8')+'</style><body>'+header(k)+'<main id="main-content">'+'<div class="filters'+(k==='potion'?' potion-filters':k==='relic'?' relic-filters':' chapter-filters')+'">'+filterControls+'</div><div id="catalog-scroll" class="catalog-scroll" role="region" aria-label="瀏覽內容" tabindex="0">'+(k==='potion'?potionLayout.render(content,items):k==='relic'?relicLayout.render(content,items):content)+'<p id="empty" hidden>沒有符合條件的內容。</p></div></main><script>'+(k==='potion'?potion.script:k==='relic'?relic.script:'')+columns.script+'</script></body></html>');
 console.log('Built '+k+': '+items.length);
}
// Update navigation without rebuilding unrelated card/game content.
for(const f of ['Cards.html','Characters.html']){let h=fs.readFileSync(f,'utf8');h=h.replace(/<header class="site-header">[\s\S]*?<\/header>/,nav.renderHeader(f==='Cards.html'?'cards':'builds').replace(/^<a class="skip-link"[^]*?<\/a>/,''));fs.writeFileSync(f,nav.openPageLinksInNewTab(h));}

for(const kind of Object.keys(kinds).filter(kind=>!only||kind===only)){const name=file(kind);let html=fs.readFileSync(name,'utf8');if(!html.includes('src="assets/cards/search-controls.js"'))html=html.replace('</body>','<script src="assets/cards/search-controls.js"></script></body>');

 if(['relic','potion'].includes(kind)) html=html.replace('</body>','<link rel="stylesheet" href="assets/'+kind+'/'+kind+'-desktop.css"></body>');
 if(kind==='relic') html=html.replace('</body>','<style>'+require('../relic/relic-card.cjs').styles+'</style></body>');
 require('../cards/desktop-page-css.cjs').writeDesktopPage(name,html);}
}
module.exports=buildCatalogs;
if(require.main===module)buildCatalogs();
