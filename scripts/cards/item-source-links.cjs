const fs=require('node:fs'),path=require('node:path');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ids=Object.fromEntries(['relic','potion'].map(kind=>{
 const data=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../data/'+kind+'/source/spirebird-'+kind+'_data.json'),'utf8'));
 return [kind,new Set(data[kind+'s'].map(item=>item.id))];
}));
function render(item,kind,prefix=''){
 if(!ids[kind]?.has(item.id))throw Error('Unknown Spirebird '+kind+': '+item.id);
 const name=item.nameEn;
 const bird=kind==='relic'?'https://spirebird.com/relic.html?id='+encodeURIComponent(item.id)+'&resetRules=all'
  :'https://spirebird.com/archive.html?resetRules=all#potions&q='+encodeURIComponent(name);
 return '<div class="catalog-source-links"><a class="catalog-untapped-link" href="'+esc(item.sourceEn)+'" target="_blank" rel="noopener noreferrer" title="'+esc(name)+' · Untapped.gg">untapped.gg</a><a class="catalog-spirebird-link" href="'+esc(bird)+'" target="_blank" rel="noopener noreferrer" title="'+esc(name)+' · Spirebird">spirebird.com</a></div>';
}
const styles=`
html body main#main-content#main-content .catalog-relic-card.catalog-relic-card:has(>.ancient-relic-extras){grid-template-rows:auto minmax(0,1fr) auto}
html body main#main-content#main-content .entry:has(>.catalog-source-links){padding-bottom:12px}
html body main#main-content#main-content .catalog-relic-card:has(>.catalog-source-links){grid-template-rows:minmax(0,1fr) auto}
html body main#main-content#main-content .potion:has(>.catalog-source-links){grid-template-rows:auto auto minmax(0,1fr) auto}
html body main#main-content .catalog-source-links{display:flex;align-self:end;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;width:100%;min-width:0;margin-top:auto;padding-top:8px}
html body main#main-content .catalog-source-links>a{display:inline-flex;align-items:center;min-width:0;color:#cbd5df;font:700 18px/1.4 Arial,sans-serif;white-space:nowrap;text-decoration:none}
html body main#main-content .catalog-source-links .catalog-untapped-link{flex:0 0 auto;width:auto;justify-content:flex-start}
html body main#main-content .catalog-source-links .catalog-spirebird-link{flex:0 0 auto;width:auto;justify-content:flex-end;margin-left:auto}
html body main#main-content .catalog-source-links>a>img{display:block;width:100%;max-width:100%;height:auto;max-height:none;object-fit:contain;margin:0}
html body main#main-content .catalog-source-links>a:focus-visible{outline:2px solid #74b3e6;outline-offset:4px;border-radius:4px}
`;
module.exports={render,styles};
