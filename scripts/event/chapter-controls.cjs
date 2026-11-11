process.chdir(require('node:path').resolve(__dirname,'../..'));
const chapters=[['act1a','第一章・密林'],['act1b','第一章・暗港'],['act2','第二章・蟲巢'],['act3','第三章・榮光之殿']];
const groups=[...chapters,['shared','跨章節共用'],['other','其他']];
const colors={act1a:'#70bf8b',act1b:'#6faeee',act2:'#e3bf72',act3:'#b595dd',shared:'#6ac1b4',other:'#aab6c4',weak:'#aab6c4',normal:'#70bf8b',elite:'#e3bf72',boss:'#dc6c68',summon:'#b595dd'};
function groupOf(x){return x.shared||(x.acts||[]).length>1?'shared':(x.acts||[]).find(a=>colors[a])||'other';}
function acts(x){return [...new Set([...(x.acts||[]),groupOf(x)])].join('|');}
const types=[['weak','弱小'],['normal','一般'],['elite','菁英'],['boss','Boss'],['summon','召喚物']];
function controls(kind,items){return [['acts',groups.filter(([key])=>(kind!=='monster'||key!=='other')&&items.some(x=>groupOf(x)===key||(x.acts||[]).includes(key))) ],...(kind==='monster'?[['encounterType',types.filter(([key])=>key!=='summon')]]:[])].map(([key,values])=>'<div class="relic-filter-group chapter-filter-group" role="group" aria-label="'+(key==='acts'?'章節篩選':'怪物類型篩選')+'">'+values.map(([value,label])=>'<button type="button" data-filter-group="'+key+'" data-filter-value="'+value+'" style="--selection-color:'+ (colors[value]||'#aab6c4')+'" aria-pressed="false">'+label+'</button>').join('')+'</div>').join('');}
function rank(x){if(x.shared)return 4;const indexes=(x.acts||[]).map(a=>chapters.findIndex(c=>c[0]===a)).filter(i=>i>=0);return indexes.length?Math.min(...indexes):5;}
const compare=(a,b)=>rank(a)-rank(b)||a.name.localeCompare(b.name,'zh-TW')||a.id.localeCompare(b.id);
const styles='.chapter-filters{align-items:center;gap:18px 28px}.chapter-filter-group{display:flex;flex-wrap:wrap;gap:8px;max-width:100%}.chapter-filter-group button{font:inherit;padding:8px 13px;color:var(--muted);background:var(--paper);border:1px solid var(--line);border-radius:7px;cursor:pointer}.chapter-filter-group button:hover{border-color:var(--focus)}.chapter-filters #search{order:1;flex:0 1 360px;margin-left:auto}@media(max-width:640px){.chapter-filters #search{flex:1 1 100%;margin-left:0}}';
const script=`const entries=[...document.querySelectorAll('.entry')],search=document.querySelector('#search'),buttons=[...document.querySelectorAll('[data-filter-group]')],selected={};for(const b of buttons)selected[b.dataset.filterGroup]??=new Set();function filter(){const q=search.value.trim().toLowerCase();let count=0;for(const e of entries){e.hidden=!(e.textContent.toLowerCase().includes(q)&&Object.entries(selected).every(([key,values])=>!values.size||e.dataset[key].split('|').some(v=>values.has(v))));if(!e.hidden)count++;}for(const b of buttons)b.setAttribute('aria-pressed',String(selected[b.dataset.filterGroup].has(b.dataset.filterValue)));for(const section of document.querySelectorAll('.chapter-section,.monster-type-section')){const count=[...section.querySelectorAll('.entry')].filter(e=>!e.hidden).length;section.hidden=count===0;section.querySelector('.chapter-count').textContent='('+count+')';}document.querySelector('#empty').hidden=count>0;}search.addEventListener('input',filter);for(const b of buttons)b.addEventListener('click',()=>{const values=selected[b.dataset.filterGroup],v=b.dataset.filterValue;if(values.has(v))values.delete(v);else values.add(v);filter();});`;
function render(content,items,kind){
 const articles=new Map([...content.matchAll(/<article\b[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].map(m=>[m[1],m[0]]));
 return groups.map(([key,label])=>{
  const members=items.filter(x=>groupOf(x)===key);if(!members.length)return '';
  const content=kind==='monster'?types.map(([type,label])=>{const matches=members.filter(x=>x.encounterType===type);return matches.length?'<div class="monster-type-section" data-monster-type="'+type+'" style="--monster-type-color:'+colors[type]+'"><h3 class="monster-type-title">'+label+' <span class="chapter-count">('+matches.length+')</span></h3><div class="catalog">'+matches.map(x=>articles.get(x.id)).join('')+'</div></div>':'';}).join(''):'<div class="catalog">'+members.map(x=>articles.get(x.id)).join('')+'</div>';
  return '<section class="chapter-section" data-chapter="'+key+'" style="--chapter-color:'+colors[key]+'"><h2 class="chapter-title">'+label+' <span class="chapter-count">('+members.length+')</span></h2>'+content+'</section>';
 }).join('');
}

const groupStyles='.chapter-section{margin:0 0 28px;padding:20px;border:1px solid var(--chapter-color);border-radius:12px;background:color-mix(in srgb,var(--chapter-color) 3%,var(--bg))}.chapter-title{display:flex;align-items:center;gap:10px;color:var(--chapter-color);font-size:24px;margin:0 0 16px}.chapter-count{font-size:16px;font-weight:400;color:var(--muted)}@media(max-width:640px){.chapter-section{padding:12px}}';
const compareMonsters=(a,b)=>types.findIndex(t=>t[0]===a.encounterType)-types.findIndex(t=>t[0]===b.encounterType)||compare(a,b);
const monsterStyles='.monster-type-section{margin-top:18px}.monster-type-section[hidden]{display:none}main#main-content .chapter-section .monster-type-title{display:flex;align-items:center;gap:8px;margin:0 0 12px;color:var(--monster-type-color);font-size:18px;line-height:1.5}';
module.exports={controls,compare,compareMonsters,styles:styles+groupStyles+monsterStyles,script,render,acts};

module.exports.styles+=`
html body main#main-content>.chapter-filters{display:flex;flex-wrap:nowrap;align-items:center;gap:16px}
html body main#main-content>.filters.chapter-filters>.chapter-filter-group{order:0;flex:0 0 auto;width:auto;flex-wrap:nowrap;justify-content:flex-start}
html body main#main-content>.filters.chapter-filters>input#search{order:1;flex:1 1 0;min-width:0;width:100%;max-width:none;margin:0}
`;

module.exports.styles+=`html body main#main-content>.filters.chapter-filters .chapter-filter-group button{font-size:18px;padding-inline:10px;white-space:nowrap}`;
