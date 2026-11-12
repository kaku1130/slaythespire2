process.chdir(require('path').resolve(__dirname,'../..'));
const fs=require('fs'),path=require('path'),nav=require('../cards/site-navigation.cjs');
const data=JSON.parse(fs.readFileSync('data/ancient/catalog.json')),assets=require('../cards/data-assets.cjs').load();
const list='ancient.html';
function local(url,prefix){if(url==='/zh-TW/ancient'||url==='https://slaythespire2.net/zh-TW/ancient')return prefix+list;const match=url.match(/^(?:https:\/\/slaythespire2.net)?\/zh-TW\/ancient\/([^/#?]+)$/);if(match&&data.slugs.includes(match[1]))return prefix+'data/ancient/ancient-'+match[1]+'.html';if(url.startsWith('/'))return 'https://slaythespire2.net'+url;return url;}
for(const slug of [null,...data.slugs]){const prefix=slug?'../../':'',file=slug?'data/ancient/ancient-'+slug+'.html':list,source=fs.readFileSync(slug?'data/ancient/source/'+slug+'.html':'data/ancient/source/index.html','utf8');let main=source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];main=main.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/\son\w+="[^"]*"/gi,'').replace(/<button\b[\s\S]*?<\/button>/g,'').replace(/\s(?:srcset|srcSet)="[^"]*"/g,'').replace(/src="([^"]+)"/g,(_,u)=>{u=u.replace(/&amp;/g,'&');if(u.startsWith('data:'))return 'src="'+u+'"';if(!assets[u])throw Error('Uncached image '+u);return 'src="'+prefix+assets[u]+'"';}).replace(/href="([^"]+)"/g,(_,u)=>'href="'+local(u,prefix)+'"');
if(slug)main=require('./desktop-ancient.cjs').removeDialogue(main);
if(slug)main=require('../cards/detail-card-database.cjs').replaceCards(main);
main=main.replaceAll('loading="lazy"','loading="eager"');
main=require('./tier-colors.cjs')(main);
if(!slug)main=main.replace(/<h1\b[\s\S]*?<\/h1>/,'').replace(/<p\b[^>]*>殺戮尖塔2 全部[\s\S]*?強度排行。<\/p>/,'');
if(!slug)main=main.replace(/<div class="mt-auto flex items-center gap-1\.5 pt-3 text-sm font-semibold text-link">[^<]*最強遺物[\s\S]*?<\/div>/g,'');
const header=nav.renderHeader('ancient').replace(/href="((?:ancient|builds|cards|event|monster|potion|relic)\.html)"/g,(_,u)=>'href="'+prefix+u+'"');
const title=source.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'先古之民';
const css=nav.styles+'body{background:#040609;color:#e3e8ee}main{min-width:0}main img{max-width:100%}main [class*="flex-wrap"]:has(>[aria-label="切換遊戲版本"]){display:none}'+nav.layoutStyles;
fs.writeFileSync(file,'<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><link rel="apple-touch-icon" sizes="180x180" href="'+prefix+'assets/cards/icons/site-logo.png"><link rel="icon" type="image/webp" href="'+prefix+'assets/cards/icons/site-logo.webp"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><link rel="stylesheet" href="'+prefix+'assets/event/styles/source.css"><style>'+css+'</style></head><body>'+header+'<main id="main-content">'+main+'</main></body></html>');}
// Keep existing pages and their custom content, updating only ancient navigation.
function update(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','source'].includes(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())update(f);else if(e.name.endsWith('.html')){let html=fs.readFileSync(f,'utf8');if(!html.includes('class="site-header"'))continue;const prefix=path.relative(path.dirname(f),'.').replaceAll('\\','/');html=html.replace(/<a\b[^>]*href="https:\/\/slaythespire2.net\/zh-TW\/ancient"[^>]*>/g,()=>'<a href="'+(prefix?prefix+'/':'')+list+'" data-same-tab="true" target="_self">');fs.writeFileSync(f,html);}}}update('.');
console.log('Built ancient index and '+data.slugs.length+' detail pages.');

require('../event/catalog-detail-pane.cjs').build('ancient');
const desktopHtml = fs.readFileSync(list, 'utf8').replace('</body>', '<link rel="stylesheet" href="assets/ancient/ancient-desktop.css"></body>');
require('../cards/desktop-page-css.cjs').writeDesktopPage(list, desktopHtml);
