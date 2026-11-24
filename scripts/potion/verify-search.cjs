process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1000}});
   if(mode==='website')await context.route('http://potions.test/**',async route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));
    assert(!path.relative(process.cwd(),file).startsWith('..'));
    const contentType={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    await route.fulfill({status:200,contentType,body:fs.readFileSync(file)});
   });
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(mode==='file'?pathToFileURL(path.resolve('Potions.html')).href:'http://potions.test/Potions.html');
   const search=page.locator('#search');
   const visibleIds=()=>page.locator('.entry.potion:visible').evaluateAll(nodes=>nodes.map(n=>n.id).sort());
   const entries=await page.locator('.entry.potion').evaluateAll(nodes=>nodes.map(n=>({id:n.id,en:n.querySelector('.catalog-name-en').textContent,rarity:n.dataset.rarity})));
   assert.equal((await visibleIds()).length,63);
   for(const query of ['力量','strength','STRENGTH','poison','中毒','"Strength Potion"','不存在的藥水']){
    await search.fill(query);
    const actual=await visibleIds();
    const intended=await page.locator('.entry.potion:not([hidden])').evaluateAll(nodes=>nodes.map(n=>n.id).sort());
    assert.deepEqual(actual,intended,mode+' actual display matches filter state: '+query);
    if(query==='力量'||query==='"Strength Potion"')assert.deepEqual(actual,['STRENGTH_POTION']);
    if(['poison','中毒'].includes(query))assert.deepEqual(actual,['POISON_POTION']);
    if(query.toLowerCase()==='strength')assert.deepEqual(actual,['FLEX_POTION','FYSH_OIL','SHACKLING_POTION','STRENGTH_POTION']);
    if(query==='不存在的藥水'){assert.deepEqual(actual,[]);assert(await page.locator('#empty').isVisible());}
   }
   for(const entry of entries){
    await search.fill('"'+entry.en+'"');
    assert.deepEqual(await visibleIds(),[entry.id],'exact-name search shows only '+entry.id);
   }
   await page.locator('.search-clear').click();assert.equal((await visibleIds()).length,63);
   await page.locator('[data-catalog-filter=rarity][value=Rare]').click();
   assert.deepEqual(await visibleIds(),entries.filter(e=>e.rarity==='Rare').map(e=>e.id).sort(),'rarity filter visibly hides other potions');
   await search.fill('poison');assert.deepEqual(await visibleIds(),['POISON_POTION']);
   assert.equal(await page.locator('[data-catalog-filter][aria-pressed=true]').count(),0,'search clears rarity');
   await page.locator('.search-clear').click();assert.equal((await visibleIds()).length,63);
   for(const width of [1280,1920]){
    await page.setViewportSize({width,height:1000});await search.fill('"Strength Potion"');
    assert.deepEqual(await visibleIds(),['STRENGTH_POTION'],'filtered cards stay hidden at '+width);
   }
   await page.setViewportSize({width:1440,height:1000});
   if(mode==='file')await page.screenshot({path:'assets/potion/previews/search-fixed-1440.png'});
   assert.deepEqual(errors,[]);
   console.log('PASS '+mode+': Chinese/English and all 63 exact-name searches show only matching potions; rarity, reset, empty results and desktop widths verified.');
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
