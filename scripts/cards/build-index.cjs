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
.index-loading {position:absolute;z-index:2;top:32px;left:50%;transform:translateX(-50%);box-sizing:border-box;width:min(340px,calc(100% - 32px));padding:20px;border:1px solid #293340;border-radius:12px;background:#0d131af2;color:#cbd5df;box-shadow:0 10px 30px #0005;opacity:1;transition:opacity 160ms ease}
.index-loading.is-complete {opacity:0;pointer-events:none}
.index-loading-head {display:flex;align-items:center;gap:10px;margin-bottom:14px;font-size:16px}
.index-loading-spinner {width:18px;height:18px;flex:none;border:2px solid #354454;border-top-color:#6faeee;border-radius:50%;animation:index-loading-spin 900ms linear infinite}
.index-loading-percent {margin-left:auto;font-variant-numeric:tabular-nums;color:#88bcec}
.index-loading-track {height:6px;overflow:hidden;border-radius:4px;background:#25313e}
.index-loading-fill {width:var(--load-progress,0%);height:100%;border-radius:inherit;background:linear-gradient(90deg,#4f9bd9,#88bcec);transition:width 220ms ease}
@keyframes index-loading-spin {to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce) {.index-loading,.index-loading-fill {transition:none}.index-loading-spinner {animation:none}}
.index-loading button {margin-left:8px;padding:6px 12px;border:1px solid #354454;border-radius:6px;background:#0d131a;color:#e3e8ee;font:inherit;cursor:pointer}
`;
fs.writeFileSync('assets/cards/index.css',css);
const version=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12);
const asset=file=>file+'?v='+version(file);
const loading='<div class="index-loading" hidden role="status" aria-live="polite"><div class="index-loading-head"><span class="index-loading-spinner" aria-hidden="true"></span><span class="index-loading-label">載入中…</span><span class="index-loading-percent">0%</span></div><div class="index-loading-track" role="progressbar" aria-label="頁面載入完成度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="index-loading-fill"></div></div></div>';
fs.writeFileSync('index.html','<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" type="image/x-icon" href="assets/cards/icons/site-favicon.ico?v=4"><title>Slay the Spire II</title><link rel="stylesheet" href="'+asset('assets/cards/index.css')+'"><script defer src="'+asset('assets/cards/index-pages.js')+'"></script><script defer src="'+asset('assets/cards/index.js')+'"></script></head><body class="index-page">'+navigation.renderHeader('cards')+'<main id="main-content">'+loading+'</main></body></html>');
console.log('Built index.html: '+navigation.items.length+' embedded pages, one persistent navigation and URL.');
