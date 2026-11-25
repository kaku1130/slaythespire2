process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const navigation=require('./site-navigation.cjs');
const pages=Object.fromEntries(navigation.items.map(([key,label,file])=>[key,{label,file,html:fs.readFileSync(file,'utf8')}]));
fs.writeFileSync('assets/cards/index-pages.js','window.sitePages='+JSON.stringify(pages).replace(/</g,'\\u003c')+';\n');
const css=navigation.styles+'\n'+navigation.layoutStyles+`\n
html {height:100%;background:#040609;color-scheme:dark}
body.index-page {display:flex;flex-direction:column;margin:0;height:100dvh;min-height:0;overflow:hidden;background:#040609;color:#e3e8ee;font:16px/1.6 Arial,"Microsoft JhengHei",sans-serif}
body.index-page>.site-header {flex:none}
html body.index-page main#main-content#main-content#main-content {position:relative;flex:1 1 0;box-sizing:border-box;width:100%!important;max-width:none!important;min-height:0;height:auto;padding:0!important;margin:0!important;overflow:hidden}
.index-page iframe {display:block;width:100%;height:100%;border:0;background:#040609}
.index-page [hidden] {display:none!important}
.index-loading {position:absolute;inset:24px;text-align:center;color:#aab6c4}
`;
fs.writeFileSync('assets/cards/index.css',css);
const version=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12);
const asset=file=>file+'?v='+version(file);
fs.writeFileSync('index.html','<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" type="image/x-icon" href="assets/cards/icons/site-favicon.ico?v=4"><title>Slay the Spire II</title><link rel="stylesheet" href="'+asset('assets/cards/index.css')+'"><script defer src="'+asset('assets/cards/index-pages.js')+'"></script><script defer src="'+asset('assets/cards/index.js')+'"></script></head><body class="index-page">'+navigation.renderHeader('cards')+'<main id="main-content"><p class="index-loading" role="status">載入中…</p></main></body></html>');
console.log('Built index.html: five original pages, one persistent navigation and URL.');
