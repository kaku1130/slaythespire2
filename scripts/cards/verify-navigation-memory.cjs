process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1000}});
   if(mode==='website')await context.route('http://navigation.test/**',route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));
    assert(!path.relative(process.cwd(),file).startsWith('..'));
    return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});
   });
   const url=mode==='file'?pathToFileURL(path.resolve('index.html')).href:'http://navigation.test/index.html';
   const page=await context.newPage();
   const selected=async(page,key)=>{
    const frame=page.locator('iframe[data-page="'+key+'"]');
    await frame.waitFor({state:'visible'});
    assert.equal(await page.locator('#main-content>iframe').count(),1);
   };
   await page.goto(url);await selected(page,'cards');
   await page.locator('.site-nav>a[aria-label=Relics]').click();await selected(page,'relic');
   await page.reload();await selected(page,'relic');
   assert.equal(await page.locator('.site-nav>a[aria-label=Relics]').getAttribute('aria-current'),'page');
   // A new tab has no history state and must restore the saved selection.
   const reopened=await context.newPage();await reopened.goto(url);await selected(reopened,'relic');
   await reopened.locator('.site-nav>a[aria-label=Potions]').click();await selected(reopened,'potion');
   await reopened.goBack();await selected(reopened,'relic');
   await reopened.goForward();await selected(reopened,'potion');
   await reopened.locator('.game-info-dropdown>summary').click();
   await reopened.locator('.game-info-menu a[href="enchantments.html"]').click();await selected(reopened,'enchantments');
   await reopened.reload();await selected(reopened,'enchantments');
   const mobile=await context.newPage();await mobile.setViewportSize({width:390,height:844});
   await mobile.goto(url);await selected(mobile,'enchantments');
   await mobile.locator('.site-nav>a[aria-label=Potions]').click();await selected(mobile,'potion');
   await mobile.reload();await selected(mobile,'potion');
   await mobile.evaluate(()=>localStorage.setItem('sts2:last-page:'+new URL('.',location.href).href,'invalid-page'));
   const fallback=await context.newPage();await fallback.goto(url);await selected(fallback,'cards');
   // Storage restrictions must not prevent navigation or history restoration.
   await fallback.addInitScript(()=>{Storage.prototype.getItem=Storage.prototype.setItem=()=>{throw new Error('Storage unavailable');};});
   await fallback.goto(url);await selected(fallback,'cards');
   await fallback.locator('.site-nav>a[aria-label=Relics]').click();await selected(fallback,'relic');
   await fallback.reload();await selected(fallback,'relic');
   console.log('PASS '+mode+': selection survives reload/new tab; back/forward, mobile, invalid and unavailable storage work.');
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
