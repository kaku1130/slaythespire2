process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1000}});
   if(mode==='website')await context.route('http://index.test/**',async route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));
    assert.ok(file.startsWith(process.cwd()+path.sep));
    const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    await route.fulfill({contentType:type,body:fs.readFileSync(file)});
   });
   const page=await context.newPage(),errors=[];
   page.setDefaultTimeout(10000);
   page.on('pageerror',error=>errors.push(error.message));
   const url=mode==='file'?pathToFileURL(path.resolve('index.html')).href:'http://index.test/index.html';
   await page.goto(url);
   const current=()=>page.frameLocator('#main-content>iframe:not([hidden])');
   await current().locator('#card-scroll').waitFor();
   const header=await page.locator('.site-header').boundingBox();
   await current().locator('#search').fill('Offering');
   for(const [label,key,selector] of [['Characters','builds','.character-grid'],['Relics','relic','.relic-section'],['Potions','potion','.potion-section'],['Ancients','ancient','.split-detail iframe'],['Monster','monster','.monster-grid'],['Cards','cards','#card-scroll']]){
    await page.locator('.site-nav>a[aria-label="'+label+'"]').click();
    await current().locator(selector).first().waitFor();
    if(['relic','potion','monster'].includes(key)){
     assert.equal(await current().locator('.filter-menu-toggle').count(),0,key+' no hamburger');
     assert.equal(await current().locator(key==='monster'?'.monster-filters':'.catalog-filter-rows').isVisible(),true,key+' visible filters');
    }
    if(key==='ancient')await current().frameLocator('.split-detail iframe').locator('.ancient-top-menu-grid').waitFor();
    assert.equal(page.url(),url);
    assert.equal(await page.locator('#main-content>iframe:not([hidden])').getAttribute('data-page'),key);
    assert.equal(await current().locator('body>.site-header').isVisible(),false);
    assert.deepEqual(await page.locator('.site-header').boundingBox(),header);
   }
   assert.equal(await current().locator('#search').inputValue(),'Offering');
   await current().locator('#card-OFFERING .detail-tier-trigger').click();
   assert.equal(await current().locator('#card-OFFERING .detail-tier-section').isVisible(),true);
   await current().locator('#card-OFFERING .detail-art>img').click();
   await page.locator('.site-nav>a[aria-label="Characters"]').click();
   await current().locator('.character-tile[data-character=ironclad] .character-tile-link').click();
   await current().locator('#character-ironclad').waitFor({state:'visible'});
   const anger=current().locator('#character-ironclad a[href="https://sts2.untapped.gg/en/cards/ironclad/anger"]').first();
   assert.equal(await anger.getAttribute('target'),'_blank');
   assert.equal(page.url(),url);
   await page.reload();
   await current().locator('#character-ironclad').waitFor({state:'visible'});
   for(const [width,height] of [[744,1133],[390,844]]){
    await page.setViewportSize({width,height});
    assert.equal(await page.locator('.site-header-inner').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
    assert.equal(await page.locator('#main-content>iframe:not([hidden])').evaluate(el=>el.getBoundingClientRect().width<=innerWidth),true);
   }
   assert.deepEqual(errors,[]);
   console.log('PASS '+mode+': single URL, six pages, stable header, preserved search, local links, Tier dialog, back/reload and narrow layouts.');
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
