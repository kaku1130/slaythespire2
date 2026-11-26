const {formatCatalogCard}=require('./relic-layout.cjs');
const {description:fallbackDescription}=require('../potion/potion-controls.cjs');
const colors=require('../cards/rarity-text-colors.cjs');
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function description(relic){
 if(!relic.descEnParts)return fallbackDescription(relic).replaceAll('potion-keyword','relic-keyword');
 return require('../event/untapped-effect.cjs')(relic);
}
function render(relic,{image,id='',className='',extras='',prefix=''}={}){
 if(!image)throw Error('Missing relic image: '+relic.id);
 const article='<article class="entry relic catalog-relic-card '+escape(className)+'"'+(id?' id="'+escape(id)+'"':'')+' data-relic-id="'+escape(relic.id)+'" data-rarity="'+escape(relic.rarity)+'"><img src="'+escape(image)+'" alt="'+escape(relic.name)+'" width="72" height="72"><div class="relic-title-row"><h2>'+escape(relic.name)+' <span class="catalog-name-en" lang="en">'+escape(relic.nameEn)+'</span></h2><div class="tag"></div></div><p lang="en">'+description(relic).replaceAll('potion-keyword','relic-keyword')+'</p></article>';
 return formatCatalogCard(article,relic,{prefix}).replace('<div class="catalog-source-links">',extras+'<div class="catalog-source-links">');
}
const card='html body main#main-content .catalog-relic-card[data-relic-id]';
const styles=require('../cards/item-source-links.cjs').styles+`
/* Reuse the relic catalog presentation in build and ancient pages. */
${card} {display:grid;gap:12px;box-sizing:border-box;width:100%;min-width:0;padding:18px;border:1px solid var(--line,#293340);border-radius:10px;background:var(--paper,#0d131a);text-align:center}
${card} .relic-card-text {display:grid;gap:12px;min-width:0}
${card} .relic-card-text > img {display:block;width:72px;height:72px;justify-self:center;margin:0;object-fit:contain}
${card} .relic-card-text h3 {display:flex;flex-direction:column;align-items:center;gap:4px;margin:0;font:700 27.5px/1.35 Arial,"Microsoft JhengHei",sans-serif}
${card} .relic-card-text h3 :is(.relic-name-zh,.relic-name-en) {font:inherit;color:var(--plain-rarity-color);overflow-wrap:anywhere}
${card} .relic-name-en {text-decoration:none}
${card} .relic-card-text > p {width:80%;margin:0 auto;justify-self:center;color:#fff6e2;font:400 22.5px/1.6 Arial,"Microsoft JhengHei",sans-serif;white-space:pre-line}
${card} .relic-keyword {color:#efc851;font-weight:500}
${card} .relic-rarity-row {display:flex;justify-content:center;font:600 20px/1.4 Arial,"Microsoft JhengHei",sans-serif}
html body main#main-content#main-content .catalog-relic-card .relic-rarity-row [data-relic-rarity] {padding:0;border:0!important;background:transparent!important;color:var(--plain-rarity-color)!important;font:inherit}
`+Object.entries(colors).map(([rarity,color])=>`${card}[data-rarity=${rarity}] {--plain-rarity-color:${color}}`).join('\n');
module.exports={render,description,styles:styles+`
html body main#main-content .catalog-relic-card .relic-icon-row {display:grid;grid-template-columns:minmax(0,1fr) 72px minmax(0,1fr);gap:8px;align-items:start;min-width:0;width:100%}
html body main#main-content .catalog-relic-card .relic-icon-row>img {grid-column:2;grid-row:1;display:block;width:72px;height:72px;object-fit:contain;margin:0}
html body main#main-content .catalog-relic-card .relic-pool-corner {grid-column:1;grid-row:1;justify-self:start;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:4px;min-width:0;max-width:100%;margin:0;color:var(--pool-color,#aab6c4);font:600 20px/1.4 Arial,"Microsoft JhengHei",sans-serif}
html body main#main-content .catalog-relic-card .relic-pool-corner>span {display:block;min-width:0;overflow-wrap:anywhere}
html body main#main-content#main-content .catalog-relic-card .relic-icon-row>.relic-rarity-row {grid-column:3;grid-row:1;justify-self:end;display:block;width:auto;max-width:100%;min-width:0;margin:0;text-align:right;font:600 16px/1.4 Arial,"Microsoft JhengHei",sans-serif}
html body main#main-content#main-content .catalog-relic-card .relic-icon-row>.relic-rarity-row>[data-relic-rarity] {display:block;max-width:100%;overflow-wrap:anywhere;text-align:right}
html body main#main-content .catalog-relic-card .relic-pool-corner>img {display:block;width:28px;height:28px;object-fit:contain;margin:0;flex:none}
`};
