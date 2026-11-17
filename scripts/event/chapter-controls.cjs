process.chdir(require('node:path').resolve(__dirname,'../..'));
const chapters=[['act1a','第一章・密林'],['act1b','第一章・暗港'],['act2','第二章・巢穴'],['act3','第三章・榮耀']];
const types=[['weak','弱怪'],['normal','一般'],['elite','菁英'],['boss','Boss'],['summon','召喚物']];

function rank(x){if(x.shared)return 4;const indexes=(x.acts||[]).map(a=>chapters.findIndex(c=>c[0]===a)).filter(i=>i>=0);return indexes.length?Math.min(...indexes):5;}
const compare=(a,b)=>rank(a)-rank(b)||a.name.localeCompare(b.name,'zh-TW')||a.id.localeCompare(b.id);
const styles='.chapter-filters{align-items:center;gap:18px 28px}.chapter-filter-group{display:flex;flex-wrap:wrap;gap:8px;max-width:100%}.chapter-filter-group button{font:inherit;padding:8px 13px;color:var(--muted);background:var(--paper);border:1px solid var(--line);border-radius:7px;cursor:pointer}.chapter-filter-group button:hover{border-color:var(--focus)}.chapter-filters #search{order:1;flex:0 1 360px;margin-left:auto}@media(max-width:640px){.chapter-filters #search{flex:1 1 100%;margin-left:0}}';
const groupStyles='.chapter-section{margin:0 0 28px;padding:20px;border:1px solid var(--chapter-color);border-radius:12px;background:color-mix(in srgb,var(--chapter-color) 3%,var(--bg))}.chapter-title{display:flex;align-items:center;gap:10px;color:var(--chapter-color);font-size:24px;margin:0 0 16px}.chapter-count{font-size:16px;font-weight:400;color:var(--muted)}@media(max-width:640px){.chapter-section{padding:12px}}';
const compareMonsters=(a,b)=>types.findIndex(t=>t[0]===a.encounterType)-types.findIndex(t=>t[0]===b.encounterType)||compare(a,b);
const monsterStyles='.monster-type-section{margin-top:18px}.monster-type-section[hidden]{display:none}main#main-content .chapter-section .monster-type-title{display:flex;align-items:center;gap:8px;margin:0 0 12px;color:var(--monster-type-color);font-size:18px;line-height:1.5}';
module.exports={compareMonsters,styles:styles+groupStyles+monsterStyles};

module.exports.styles+=`
html body main#main-content>.chapter-filters{display:flex;flex-wrap:nowrap;align-items:center;gap:16px}
html body main#main-content>.filters.chapter-filters>.chapter-filter-group{order:0;flex:0 0 auto;width:auto;flex-wrap:nowrap;justify-content:flex-start}
html body main#main-content>.filters.chapter-filters>input#search{order:1;flex:1 1 0;min-width:0;width:100%;max-width:none;margin:0}
`;

module.exports.styles+=`html body main#main-content>.filters.chapter-filters .chapter-filter-group button{font-size:18px;padding-inline:10px;white-space:nowrap}`;
