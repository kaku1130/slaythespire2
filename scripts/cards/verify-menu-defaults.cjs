process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const files=['cards.html','characters.html','relics.html','potions.html','enchantments.html','monsters.html','index.html'];
async function snapshot(root){return root.locator('main').evaluate(n=>({
 inputs:[...n.querySelectorAll('input:not([type=hidden]),select')].map(e=>[e.id,e.value,e.checked||false]),
 selected:[...n.querySelectorAll('button[aria-pressed=true],[data-character][aria-current=page]')].map(e=>[e.id,e.value,e.dataset.character||'']),
 panels:[...n.querySelectorAll('[data-character-panel]:not([hidden])')].map(e=>e.id)
}));}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{for(const mode of ['file','website'])for(const file of files){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  if(mode==='website')await context.route('http://defaults.test/**',route=>{
   const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));assert(file.startsWith(process.cwd()+path.sep));
   const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';return route.fulfill({contentType:type,body:fs.readFileSync(file)});
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=mode==='file'?pathToFileURL(path.resolve(file)).href:'http://defaults.test/'+file;
  await page.goto(url);const root=()=>file==='index.html'?page.frameLocator('#main-content>iframe:not([hidden])'):page;
  await root().locator('main').waitFor();if(file==='index.html')await root().locator('#card-scroll').waitFor();
  const defaults=await snapshot(root());
  const stored=await page.evaluate(()=>{
   const saved={search:'no-such-card-menu-test',characters:['Silent'],types:['Power'],rarities:['Rare'],energies:['3+'],area:['Glory'],route:'#character-silent'};
   for(const kind of ['card','relic','potion','enchantments','monster','characters','build']){const key='sts2_'+kind+'_filters';localStorage.setItem(key,JSON.stringify(saved));if(location.protocol!=='file:')document.cookie=key+'='+encodeURIComponent(JSON.stringify(saved))+'; Path=/';}
   sessionStorage.setItem('site-index-route',JSON.stringify({key:'relic',hash:''}));return {...localStorage};
  });
  const search=root().locator('#search');if(await search.count())await search.fill('changed-menu');
  await page.reload();await root().locator('main').waitFor();if(file==='index.html')await root().locator('#card-scroll').waitFor();
  assert.deepEqual(await snapshot(root()),defaults,mode+' '+file+' uses defaults despite old saved settings');
  assert.deepEqual(await page.evaluate(()=>({...localStorage})),stored,'no filter settings are written');
  if(file==='index.html'){
   await root().locator('#search').fill('anger');await page.waitForTimeout(550);
   await page.locator('.site-nav>a[aria-label=Relics]').click();await root().locator('.relic-filters').waitFor();
   await root().locator('#search').fill('changed-menu');await page.waitForTimeout(100);
   await page.locator('.site-nav>a[aria-label=Cards]').click();await root().locator('#card-scroll').waitFor();assert.deepEqual(await snapshot(root()),defaults,'returning to Cards uses defaults');
   await page.locator('.site-nav>a[aria-label=Relics]').click();await root().locator('.relic-filters').waitFor();assert.equal(await root().locator('#search').inputValue(),'','returning to Relics clears search');
   await page.reload();await root().locator('#card-scroll').waitFor();assert.deepEqual(await snapshot(root()),defaults,'index reload starts at Cards defaults');
  }
  assert.deepEqual(errors,[]);console.log('PASS '+mode+' '+file+': default menus, no persisted settings');await context.close();
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
