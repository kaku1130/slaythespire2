const fs=require('fs'),path=require('path'),crypto=require('crypto');
process.chdir(path.resolve(__dirname,'../..'));
const ui=require('./mobile-ui.cjs');
const sharp=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
const css=`
/* MobileDevice text card catalog */
.brand{color:var(--ink);text-decoration:none}
body[data-text-cards=true][data-tab=cards] .app-shell{display:block;overflow:auto;overscroll-behavior:contain;width:96%;padding-top:8px}
body[data-text-cards=true][data-tab=cards] .content{overflow:visible;min-height:0;padding:8px 0 24px}
body[data-text-cards=true][data-tab=cards] .toolbar{display:contents}
body[data-text-cards=true][data-tab=cards] #desktop-filters,body[data-text-cards=true][data-tab=cards] #filter-panel{display:contents}
body[data-text-cards=true][data-tab=cards] .search-row{display:none}
body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="職業"]{display:flex;flex-wrap:nowrap;gap:8px;margin-bottom:10px}
body[data-text-cards=true][data-tab=cards] .filter-options{display:flex;flex-wrap:nowrap;align-items:center;gap:8px;position:sticky;top:0;z-index:5;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line)}
body[data-text-cards=true][data-tab=cards] .filter-options .filter-group{display:flex;flex-wrap:nowrap;gap:6px;margin:0}
body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="卡片"]{border-left:1px solid var(--line);padding-left:8px}
body[data-text-cards=true][data-tab=cards] .filter-group button{min-width:44px;min-height:46px;padding:5px 7px;font-size:20px;justify-content:center}
body[data-text-cards=true][data-tab=cards] .filter-group img{width:26px;height:26px}
body[data-text-cards=true][data-tab=cards] .filter-options #search{display:block;flex:0 1 20%;width:20%;max-width:20%;min-width:0;height:46px;padding:4px 6px;font-size:16px;margin-left:auto}
body[data-text-cards=true][data-tab=cards] .card-grid{grid-template-columns:minmax(0,1fr);gap:18px 12px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;padding:0;align-items:start}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card{grid-template-columns:minmax(0,1fr);padding:10px;gap:10px;font-size:17px;height:100%;align-self:stretch}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-body{justify-content:flex-start}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-heading h3{font-size:18px}
@media(min-width:600px){body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card{grid-template-columns:minmax(0,2fr) minmax(0,3fr);font-size:18px;padding:14px;gap:12px}}
@media(min-width:600px){
body[data-text-cards=true][data-tab=cards] .toolbar{display:flex;align-items:center;gap:14px;position:sticky;top:0;z-index:5;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line)}
body[data-text-cards=true][data-tab=cards] #filter-panel{display:flex;flex-wrap:nowrap;align-items:center;gap:14px;width:100%}
body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="職業"]{margin:0;padding-right:14px;border-right:1px solid var(--line)}
body[data-text-cards=true][data-tab=cards] .filter-options{position:static;border:0;padding:0;flex:1;gap:14px}
body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="卡片"]{padding-left:14px}
body[data-text-cards=true][data-tab=cards] .filter-group button{min-width:52px;min-height:56px;padding:6px 8px;font-size:23px}
body[data-text-cards=true][data-tab=cards] .filter-group img{width:32px;height:32px}
body[data-text-cards=true][data-tab=cards] .filter-options #search{height:56px;flex:1 1 0;max-width:20%;width:0}
}
@media(min-width:600px) and (max-width:850px){body[data-text-cards=true][data-tab=cards] #filter-panel{gap:8px}body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="職業"]{padding-right:8px;gap:6px}body[data-text-cards=true][data-tab=cards] .filter-options{gap:8px}body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="卡片"]{padding-left:8px}body[data-text-cards=true][data-tab=cards] .filter-group button{min-width:50px;padding:6px}body[data-text-cards=true][data-tab=cards] .filter-options .filter-group{gap:4px}}
/* Keep the entire area above the sticky controls opaque. */
@media(max-width:599px){body[data-tab=cards] .filter-options::before{content:'';position:absolute;left:0;right:0;bottom:100%;height:8px;background:var(--bg);pointer-events:none}}
@media(min-width:600px){body[data-tab=cards] .toolbar::before{content:'';position:absolute;left:0;right:0;bottom:100%;height:8px;background:var(--bg);pointer-events:none}}
body[data-text-cards=true][data-tab=cards] .filter-options{top:0}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair{grid-template-columns:minmax(0,1fr)}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card{grid-template-columns:minmax(0,2fr) minmax(0,3fr);font-size:18px;padding:14px;gap:12px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card{grid-template-columns:minmax(0,1fr);text-align:center;justify-items:center}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-art{width:min(100%,280px)}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .card-thumbnail{width:80%}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-body{width:100%;align-items:center;text-align:center}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card{border-width:5px;border-color:var(--card-frame,var(--color))}
body[data-tab=cards] .catalog-card-pair[data-pool=Ironclad]{--card-frame:#863422}
body[data-tab=cards] .catalog-card-pair[data-pool=Silent]{--card-frame:#42711e}
body[data-tab=cards] .catalog-card-pair[data-pool=Defect]{--card-frame:#0f5d85}
body[data-tab=cards] .catalog-card-pair[data-pool=Regent]{--card-frame:#a75800}
body[data-tab=cards] .catalog-card-pair[data-pool=Necrobinder]{--card-frame:#8a3f5b}
body[data-tab=cards] .catalog-card-pair[data-pool=Colorless]{--card-frame:#595959}
body[data-tab=cards] .catalog-card-pair[data-pool=Curse]{--card-frame:#2a282b}
body[data-tab=cards] .catalog-card-pair[data-pool=Event]{--card-frame:#aaa9b2}
body[data-tab=cards] .catalog-card-pair[data-pool=Quest]{--card-frame:#4a4e4f}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-art{width:100%}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .card-thumbnail{width:min(95%,280px)}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-heading{font-size:24px;gap:8px;align-items:center}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-heading h3{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0 12px;font-size:24px;line-height:1.5}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-cost{max-width:36px;font-size:24px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .cost-badge{width:36px;height:36px}
body[data-text-cards=true][data-tab=cards] .card-name-zh{position:relative;margin-right:0}
body[data-text-cards=true][data-tab=cards] .card-name-zh{color:#fff;background:var(--rarity-label-bg,#56606b);border-radius:5px;padding:3px 30px}
body[data-text-cards=true][data-tab=cards] .card-name-plus{position:absolute;right:8px;top:3px;color:#fff}
body[data-text-cards=true][data-tab=cards] .card-name-en{color:#c4c8ce;font-size:20px;overflow-wrap:anywhere;min-width:0;max-width:100%}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-cost{position:absolute;top:14px;left:14px;z-index:1}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-heading{padding:0 44px;min-height:48px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-heading h3{flex-direction:column;flex-wrap:nowrap;gap:0;width:100%}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .card-thumbnail{border:0;border-radius:0}
body[data-text-cards=true][data-tab=cards] .card-name-row{display:flex;align-items:center;justify-content:center;gap:8px;max-width:100%;min-width:0}
body[data-text-cards=true][data-tab=cards] .card-name-zh{margin-right:0;min-width:0}
body[data-text-cards=true][data-tab=cards] .rarity-label,body[data-text-cards=true][data-tab=cards] .text-card-type{display:inline-block;color:#fff;font-size:14px;font-weight:700;line-height:1.5;border-radius:5px;padding:3px 8px;background:#56606b;white-space:nowrap;flex:none}
body[data-text-cards=true][data-tab=cards] .rarity-label[data-rarity=Uncommon]{background:#26649a}
body[data-text-cards=true][data-tab=cards] .rarity-label[data-rarity=Rare]{background:#c66a18}
body[data-text-cards=true][data-tab=cards] .rarity-label[data-rarity=Ancient]{background:#7246a0}
body[data-text-cards=true][data-tab=cards] .rarity-label[data-rarity=Curse]{background:#845062}
body[data-text-cards=true][data-tab=cards] .rarity-label:is([data-rarity=Event],[data-rarity=Quest]){background:#32766e}
body[data-tab=cards] .catalog-card-pair[data-rarity=Uncommon]{--rarity-label-bg:#26649a}
body[data-tab=cards] .catalog-card-pair[data-rarity=Rare]{--rarity-label-bg:#c66a18}
body[data-tab=cards] .catalog-card-pair[data-rarity=Ancient]{--rarity-label-bg:#7246a0}
body[data-tab=cards] .catalog-card-pair[data-rarity=Curse]{--rarity-label-bg:#845062}
body[data-tab=cards] .catalog-card-pair:is([data-rarity=Event],[data-rarity=Quest]){--rarity-label-bg:#32766e}
body[data-text-cards=true][data-tab=cards] .text-card-type[data-type=Attack]{background:#b33438}
body[data-text-cards=true][data-tab=cards] .text-card-type[data-type=Skill]{background:#26649a}
body[data-text-cards=true][data-tab=cards] .text-card-type[data-type=Power]{background:#16734a}
body[data-text-cards=true][data-tab=cards] .text-card-type[data-type=Curse]{background:#845062}
body[data-text-cards=true][data-tab=cards] .text-card-type[data-type=Quest]{background:#32766e}
body[data-text-cards=true][data-tab=cards] .card-label-row{display:flex;align-items:center;justify-content:center;gap:8px}
body[data-text-cards=true][data-tab=cards] .card-image-gap{height:8px;flex:none}
body[data-text-cards=true][data-tab=cards] [data-group=upgrade]{color:#05df72;font-size:30px;font-weight:700;line-height:1;--color:#05df72!important}
body[data-text-cards=true][data-tab=cards] [data-group=upgrade][aria-pressed=true]{color:#ff6568;--color:#ff6568!important}
body[data-text-cards=true][data-tab=cards] #open-card-search{min-width:44px;min-height:46px;padding:5px 7px;margin-left:auto;flex:none;font-size:20px}
#card-search-dialog{margin:auto;width:min(92vw,480px);height:auto;max-height:90dvh;border:1px solid var(--line);border-radius:12px;padding:18px}
#card-search-dialog[open]{display:flex;flex-direction:column;gap:12px}
#card-search-dialog .search-dialog-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}
#card-search-dialog #search{display:block!important;width:100%!important;max-width:none!important;flex:none!important;height:48px;font-size:18px}
@media(min-width:600px){body[data-text-cards=true][data-tab=cards] #open-card-search{min-width:50px;min-height:56px;font-size:23px}}
@media(min-width:600px) and (max-width:850px){body[data-text-cards=true][data-tab=cards] .filter-options{gap:6px}body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="職業"]{gap:4px;padding-right:6px}body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="卡片"]{padding-left:6px}}
@media(max-width:380px){body[data-text-cards=true][data-tab=cards] .filter-options{gap:4px}body[data-text-cards=true][data-tab=cards] .filter-options .filter-group{gap:4px}body[data-text-cards=true][data-tab=cards] .filter-options .filter-group button,body[data-text-cards=true][data-tab=cards] #open-card-search{min-width:38px;padding:5px 4px}body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="卡片"]{padding-left:4px}}
@media(min-width:600px) and (max-width:850px){body[data-text-cards=true][data-tab=cards] .filter-group[aria-label="職業"]{gap:2px}}
/* Larger reading text; descriptions share the artwork's width. */
body[data-tab=cards]{font-size:20px}
body[data-tab=cards] .brand{font-size:27px}
body[data-tab=cards] .tabs button{font-size:20px}
body[data-tab=cards] .section-heading{font-size:26px}
body[data-tab=cards] .section-heading .count{font-size:18px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card{font-size:20px}
body[data-text-cards=true][data-tab=cards] .card-name-zh{font-size:28px}
body[data-text-cards=true][data-tab=cards] .card-name-en{font-size:22px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-cost{font-size:26px}
body[data-text-cards=true][data-tab=cards] .rarity-label,body[data-text-cards=true][data-tab=cards] .text-card-type{font-size:16px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-body{width:min(95%,280px);min-width:0}
body[data-text-cards=true][data-tab=cards] .text-card-effect{width:100%;overflow-wrap:anywhere}
body[data-text-cards=true][data-tab=cards] .filter-group button{font-size:22px}
body[data-text-cards=true][data-tab=cards] [data-group=upgrade]{font-size:32px}
body[data-text-cards=true][data-tab=cards] #open-card-search{font-size:22px}
body[data-tab=cards] #card-search-dialog #search{font-size:20px}
@media(max-width:760px){body[data-tab=cards] .brand span{font-size:18px}}
@media(max-width:380px){body[data-text-cards=true][data-tab=cards] .filter-options,body[data-text-cards=true][data-tab=cards] .filter-options .filter-group{gap:3px}}
@media(min-width:600px){body[data-text-cards=true][data-tab=cards] .filter-group button,body[data-text-cards=true][data-tab=cards] #open-card-search{font-size:25px}body[data-text-cards=true][data-tab=cards] [data-group=upgrade]{font-size:32px}}
@media(min-width:600px){
body[data-text-cards=true][data-tab=cards] .card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card{padding:8px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-heading{padding:48px 0 0}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .card-thumbnail,body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-body{width:100%;max-width:280px}
}
@media(min-width:600px){body[data-text-cards=true][data-tab=cards] .filter-options #search{font-size:20px;max-width:20%}}
@media(max-width:599px){
body[data-text-cards=true][data-tab=cards] [data-group=upgrade][aria-pressed=false]{color:#fff;--color:#fff!important}
body[data-text-cards=true][data-tab=cards] .filter-options #search{display:none}
body[data-text-cards=true][data-tab=cards].phone-search-open .filter-options .filter-group{display:none}
body[data-text-cards=true][data-tab=cards].phone-search-open .filter-options{padding-left:4px;padding-right:4px}
body[data-text-cards=true][data-tab=cards].phone-search-open .filter-options #search{display:block;flex:1;width:0;max-width:100%;margin-left:0;font-size:20px;outline-offset:0}
body[data-text-cards=true][data-tab=cards].phone-search-open #open-card-search{display:none}
}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]) #open-menu{display:none}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]) #open-card-search{min-width:44px;min-height:46px;padding:5px 7px;font-size:22px;flex:none}
@media(max-width:599px){
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]) .search-row{display:flex;flex:1;max-width:none;min-width:0}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]) .search-row #search{display:none}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]).phone-search-open #mobile-card-actions,body[data-text-cards=true][data-tab=potion].phone-search-open #desktop-filters{display:none}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]).phone-search-open .search-row{padding:0 4px}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]).phone-search-open #open-card-search{display:none}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]).phone-search-open .search-row #search{display:block;flex:1;width:0;max-width:100%;margin-left:0;font-size:20px;outline-offset:0;height:46px}
}
@media(min-width:600px){
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]) #desktop-filters{display:block;flex:1;min-width:0}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]) #mobile-card-actions{display:none}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]) .search-row{display:flex;flex:0 1 20%;width:20%;max-width:20%;min-width:0}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]) .search-row #search{display:block;flex:1;width:100%;max-width:100%;font-size:20px}
}
body[data-text-cards=true] :is(#filter-panel,#mobile-card-actions) .filter-group button{min-width:44px;min-height:46px;padding:5px 7px;font-size:22px;justify-content:center;flex-shrink:0}
body[data-text-cards=true] :is(#filter-panel,#mobile-card-actions) .filter-group img{width:26px;height:26px}
body[data-text-cards=true] .tabs button{font-size:20px}
body[data-text-cards=true] .build-picker>button{min-height:46px;padding:5px 7px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-body{width:min(76%,224px)}
@media(max-width:599px){
body[data-text-cards=true][data-tab=relic] #mobile-card-actions{flex:1;min-width:0}
body[data-text-cards=true][data-tab=relic] #open-card-search{margin-left:auto}
body[data-text-cards=true][data-tab=relic] #mobile-card-actions .filter-group{flex-wrap:nowrap;overflow-x:auto;max-width:100%}
}
@media(max-width:380px){body[data-text-cards=true] :is(#filter-panel,#mobile-card-actions) .filter-options .filter-group button{min-width:38px;padding:5px 4px}}
@media(min-width:600px){
body[data-text-cards=true] :is(#filter-panel,#mobile-card-actions) .filter-group button{min-width:52px;min-height:56px;padding:6px 8px;font-size:25px}
body[data-text-cards=true] :is(#filter-panel,#mobile-card-actions) .filter-group img{width:32px;height:32px}
body[data-text-cards=true] .build-picker>button{min-height:56px;padding:6px 8px}
body[data-text-cards=true][data-tab=cards] .catalog-card-pair .text-card-body{width:80%;max-width:224px}
body[data-text-cards=true]:is([data-tab=relic],[data-tab=potion]) #open-card-search{min-width:50px;min-height:56px}
}
@media(min-width:600px) and (max-width:850px){body[data-text-cards=true] :is(#filter-panel,#mobile-card-actions) .filter-group button{min-width:50px;padding:6px}}
body[data-text-cards=true] :is(#filter-panel,#mobile-card-actions) [data-group=upgrade]{font-size:32px}
`;
async function main(){
 const old=fs.readFileSync('mobile.html','utf8');
 const data=JSON.parse(old.match(/id="app-data">(.*?)<\/script>/s)[1]);
 const assets=new Map([...old.matchAll(/<script type="application\/octet-stream" id="asset-([^"]+)" data-mime="([^"]+)">([^<]+)<\/script>/g)].map(m=>[m[1],{mime:m[2],bytes:Buffer.from(m[3],'base64')}]));
 const githubLogo=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="#e3e8ee" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>');
 const logoKey=crypto.createHash('sha256').update(githubLogo).digest('hex').slice(0,24);assets.set(logoKey,{mime:'image/svg+xml',bytes:githubLogo});data.icons.logo=logoKey;
 const shell=ui.shell.replace('<div class="brand">','<a class="brand" href="https://github.com/kaku1130/slaythespire2" target="_blank" rel="noopener noreferrer">').replace('</span></div><nav class="tabs"','</span></a><nav class="tabs"');
 // Use high-resolution artwork at more than twice the displayed width within the 25 MB budget.
 for(const card of data.cards)card.images={upgraded:!!card.images.upgraded};
 const figures=JSON.parse(fs.readFileSync('data/cards/card-image-figures.json'));
 const artwork=data.cards.map(card=>{const match=figures[card.id]?.[0]?.match(/src="(\/images\/cards\/[^" ]+)"/);if(!match)throw Error('Missing artwork '+card.id);return {card,file:'assets/cards/source'+match[1].slice('/images'.length)};});
 for(const {width,quality} of [{width:560,quality:82},{width:560,quality:74},{width:504,quality:82}]){
  let cursor=0;
  await Promise.all(Array.from({length:4},async()=>{while(cursor<artwork.length){const {card,file}=artwork[cursor++];const bytes=await sharp(file).resize({width,withoutEnlargement:true}).webp({quality,effort:5}).toBuffer(),key=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,24);assets.set(key,{mime:'image/webp',bytes});card.thumbnails={base:key,upgraded:card.images.upgraded?key:null};}}));
  const json=JSON.stringify(data),estimate=Buffer.byteLength(json)+[...assets].filter(([key])=>json.includes(key)).reduce((n,[,a])=>n+4*Math.ceil(a.bytes.length/3)+200,0)+150000;
  console.log(JSON.stringify({artworkWidth:width,quality,estimatedBytes:estimate}));
  if(estimate<24900000)break;
 }
 const next=assets;
 let result;
  const serialized=JSON.stringify(data).replace(/</g,'\\u003c');
  const used=[...next].filter(([key])=>serialized.includes(key));
  let runtime=ui.runtime.toString();
  runtime=runtime.replace("const pools=t==='relic'?[...poolOrder,'Shared','Event']:poolOrder;", "const pools=t==='relic'?[...poolOrder,'Shared',...(matchMedia('(min-width:600px)').matches?['Event']:[])]:t==='cards'?[...poolOrder,'Colorless']:poolOrder;");
  runtime=runtime.replace('s.pools.has(x.pool)', "(s.pools.has(x.pool)||(t==='relic'&&!matchMedia('(min-width:600px)').matches&&s.pools.has('Shared')&&x.pool==='Event'))");
  runtime=runtime.replace('function renderBuilds(){const s=state.builds;', `function renderBuilds(){const s=state.builds;if(D.textCards&&showBuildChoices&&!s.pool)return '<div class="build-picker" role="group" aria-label="流派"></div>';`);
  runtime=runtime.replace('if(b)switchTab(b.dataset.tab);', "if(b){if(b.dataset.tab==='builds'){state.builds.pool=null;state.builds.key=null;state.builds.query='';showBuildChoices=true;}switchTab(b.dataset.tab);}");
  runtime=runtime.replace("const rarityColor={Uncommon:", "const rarityColor={Starter:'#ffffff',Basic:'#ffffff',Common:'#ffffff',Uncommon:");
  runtime=runtime.replace('s.pools.has(c.category)', "(s.pools.has(c.category)||(s.pools.has('Colorless')&&['Curse','Event','Quest'].includes(c.category)))");
  runtime=runtime.replace("'Shared','Event']:poolOrder;", "'Shared','Event']:t==='cards'?[...poolOrder,'Colorless']:poolOrder;");
  runtime=runtime.replace('}else return;renderFilters();renderContent();save();});', "}else return;const keepScroll=state.tab==='cards'&&b?.dataset.group==='upgrade',scroller=document.querySelector('.app-shell'),scrollTop=scroller.scrollTop;renderFilters();renderContent(!keepScroll);if(keepScroll)scroller.scrollTop=scrollTop;save();});");
  runtime=runtime.replace('function renderFilters(){','function renderFilters(){const searchHadFocus=document.activeElement===search;if(!document.getElementById("card-search-dialog").open)document.querySelector(".search-row").append(search);');
  runtime=runtime.replace('filters.innerHTML=html;moveCardActions();hydrate();}', 'filters.innerHTML=html;moveCardActions();hydrate();if(searchHadFocus)search.focus({preventScroll:true});}');
  runtime=runtime.replace('function cardTile(c){',`function cardTile(c){if(state.tab==='cards'){return '<article class="catalog-card-pair" data-card-id="'+c.id+'">'+textCard(c,!!c.images.upgraded&&state.cards.upgraded).replace(/<button[^>]*class="card-upgrade-toggle"[^>]*>[\\s\\S]*?<\\/button>/g,'').replace(/<span class="text-card-tier">[\\s\\S]*?<\\/span><\\/span>/g,'')+'</article>'; }`);
  runtime=runtime.replace("group==='upgrade'?'🔨'", "group==='upgrade'?(active?'−':'+')");
  runtime=runtime.replace('<article class="catalog-card-pair" data-card-id="', `<article class="catalog-card-pair" data-pool="'+c.category+'" data-rarity="'+c.rarity+'" data-card-id="`);
  runtime=runtime.replace("(D.textCards?'':button('upgrade','upgraded','🔨升級卡牌',s.upgraded))+button('aoe','aoe','💥AOE',s.query==='所有敵人')", "button('aoe','aoe','💥AOE',s.query==='所有敵人')+button('upgrade','upgraded','升級卡片',s.upgraded)");
  runtime=runtime.replace('esc(c.type)', "esc(({Attack:'攻擊',Skill:'技能',Power:'能力',Curse:'詛咒',Quest:'任務'})[c.type]||c.type)");
  runtime=runtime.replace("<h3>'+esc(c.nameZh)+(upgraded?'+':'')+'</h3>", "<h3>'+(state.tab==='cards'?'<span class=\"card-name-zh\" data-upgraded=\"'+upgraded+'\">'+esc(c.nameZh)+(upgraded?'<span class=\"card-name-plus\">+</span>':'')+'</span><span class=\"card-name-en\">'+esc(c.name)+'</span>':esc(c.nameZh)+(upgraded?'+':''))+'</h3>");
  runtime=runtime.replace('<span class="card-name-zh"', '<span class="card-name-row"><span class="card-name-zh"');
  runtime=runtime.replace('</span><span class="card-name-en">', '</span></span><span class="card-name-en">');
  runtime=runtime.replace('<span class="text-card-type">', `'+(state.tab==='cards'?'<div class="card-image-gap" aria-hidden="true"></div>':'')+'<div class="card-label-row"><span class="text-card-type" data-type="'+c.type+'">`);
  runtime=runtime.replace("+'</span></div><div class=\"text-card-body\">", "+'</span></div></div><div class=\"text-card-body\">");
  runtime=runtime.replace('function moveCardActions(){',`function moveCardActions(){if(state.tab==='cards'){const options=filters.querySelector('.filter-options');if(matchMedia('(min-width:600px)').matches){if(phoneSearchOpen)closeInlineSearch();searchButton.remove();}else options?.append(searchButton);if(options&&search.parentElement!==options)options.append(search);return;}if(state.tab==='relic'||state.tab==='potion'){const row=document.querySelector('.search-row'),pools=filters.querySelector('.filter-group[aria-label="職業"]')||document.querySelector('#mobile-card-actions .filter-group[aria-label="職業"]');searchButton.setAttribute('aria-label',state.tab==='relic'?'搜尋遺物':'搜尋藥水');if(matchMedia('(min-width:600px)').matches){if(phoneSearchOpen)closeInlineSearch();document.getElementById('desktop-filters').append(filters);if(pools)filters.prepend(pools);searchButton.remove();}else{if(pools)document.getElementById('mobile-card-actions').append(pools);row.append(searchButton);}row.append(search);return;}`);
  runtime=runtime.replace(' const upgradedCards=new Set();',` const searchDialog=document.getElementById('card-search-dialog'),searchButton=document.createElement('button');let phoneSearchOpen=false;searchButton.id='open-card-search';searchButton.type='button';searchButton.textContent='🔍';searchButton.setAttribute('aria-label','搜尋卡牌');searchButton.setAttribute('aria-controls','search');searchButton.setAttribute('aria-expanded','false');function closeInlineSearch(){phoneSearchOpen=false;document.body.classList.remove('phone-search-open');searchButton.setAttribute('aria-expanded','false');if(document.activeElement===search)search.blur();}searchButton.addEventListener('click',()=>{phoneSearchOpen=true;document.body.classList.add('phone-search-open');searchButton.setAttribute('aria-expanded','true');search.focus({preventScroll:true});});document.addEventListener('pointerdown',e=>{if(phoneSearchOpen&&e.target!==search&&!searchButton.contains(e.target))closeInlineSearch();},true);search.addEventListener('keydown',e=>{if(phoneSearchOpen&&(e.key==='Enter'||e.key==='Escape')){e.preventDefault();closeInlineSearch();}});
 matchMedia('(min-width:600px)').addEventListener('change',()=>{moveCardActions();if(state.tab==='relic'){renderFilters();renderContent(false);}});
 const upgradedCards=new Set();`);
  runtime=runtime.replace('function switchTab(t){', "function switchTab(t){closeInlineSearch();");
  runtime=runtime.replace('function moveFilters(){','function moveFilters(){if(state.tab===\'cards\'){closeMenu();document.getElementById("desktop-filters").append(filters);moveCardActions();hydrate();return;}');
  runtime=runtime.replace("function renderContent(reset=true){","function renderContent(reset=true){if(reset&&state.tab==='cards')document.querySelector('.app-shell').scrollTop=0;");
  result='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>殺戮尖塔2</title><style>'+ui.styles+css+'</style></head><body>'+shell+'<dialog id="card-search-dialog" aria-labelledby="card-search-title"><div class="search-dialog-heading"><label id="card-search-title" for="search">搜尋卡牌</label><button type="button" id="close-card-search" aria-label="關閉搜尋">✕</button></div></dialog><script type="application/json" id="app-data">'+serialized+'</script>'+used.map(([key,a])=>'<script type="application/octet-stream" id="asset-'+key+'" data-mime="'+a.mime+'">'+a.bytes.toString('base64')+'</script>').join('')+'<script>('+runtime+')();</script></body></html>';
  console.log(JSON.stringify({bytes:Buffer.byteLength(result),assets:used.length}));
 if(Buffer.byteLength(result)>=25000000)throw Error('MobileDevice HTML exceeds 25 MB');
 fs.writeFileSync('mobile.html',result);
}
main().catch(e=>{console.error(e);process.exitCode=1});
