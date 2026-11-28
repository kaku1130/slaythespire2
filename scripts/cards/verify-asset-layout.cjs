process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const folders=require('./asset-layout.cjs');
const pages=['characters','cards','monsters','potions','relics','enchantments'];
const expected=[...pages,'index'].sort();
assert.deepEqual(fs.readdirSync('assets',{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).sort(),expected);
let checked=0;
function localReference(value,base='.'){
 const file=value.replace(/&amp;/g,'&').split(/[?#]/)[0];
 if(!file||/^(?:https?:|data:|\/\/|#)/.test(file))return;
 const full=path.resolve(base,decodeURIComponent(file));assert(fs.existsSync(full),'Missing local asset: '+value+' relative to '+base);checked++;
}
for(const page of [...pages,'index']){
 const html=fs.readFileSync(page+'.html','utf8');
 for(const match of html.matchAll(/(?:src|href)="(assets\/[^"<>]+)"/g))localReference(match[1]);
 if(page!=='index')assert(html.includes('assets/'+page+'/'+page+'.css'),page+' uses its own canonical stylesheet');
}
for(const page of [...pages,'index']){
 const file='assets/'+page+'/'+page+'.css',css=fs.readFileSync(file,'utf8');
 for(const match of css.matchAll(/url\(\s*["']?([^"'\s)]+)["']?\s*\)/g))localReference(match[1],path.dirname(file));
}
const loaded=require('./data-assets.cjs').load();for(const target of Object.values(loaded))localReference(target);
for(const [category,folder] of Object.entries(folders)){
 for(const target of Object.values(JSON.parse(fs.readFileSync('data/'+category+'/assets.json','utf8'))))assert.equal(target.split('/')[1],folder,category+' data maps to its page asset folder');
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{for(const name of [...pages,'index']){
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),missing=[],errors=[];
  await context.route('http://assets.test/**',async route=>{
   const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));assert(file.startsWith(process.cwd()+path.sep));
   if(!fs.existsSync(file)){missing.push(file);return route.fulfill({status:404,body:'Missing asset'});}
   const contentType={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'}[path.extname(file)]||'application/octet-stream';
   return route.fulfill({contentType,body:fs.readFileSync(file)});
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto('http://assets.test/'+name+'.html');
  const current=()=>name==='index'?page.frameLocator('#main-content>iframe:not([hidden])'):page;
  await current().locator('main').waitFor();
  if(name==='cards'||name==='index'){
   await current().locator('#search').fill('"Mad Science"');await page.waitForTimeout(550);
   const mad=current().locator('#card-MAD_SCIENCE');await mad.locator('[data-card-variant-step="1"]').click();await mad.locator('[data-card-version]').click();assert(await mad.locator('[data-card-image-version=upgraded]:visible').count()===1);
  }
  if(name==='index')for(const label of ['Characters','Relics','Potions','Monster','Cards']){
   await page.locator('.site-nav>a[aria-label="'+label+'"]').click();await current().locator('main').waitFor();
  }
  assert.deepEqual(errors,[],name+' browser errors');assert.deepEqual(missing,[],name+' missing assets');
  console.log('PASS '+name+'.html: loaded without missing assets or JavaScript errors');await context.close();
 }}finally{await browser.close();}
 console.log('PASS '+checked+' local asset references and all category mappings.');
})().catch(error=>{console.error(error);process.exitCode=1;});
