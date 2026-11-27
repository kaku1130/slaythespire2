process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await context.addInitScript(()=>sessionStorage.setItem('site-index-route',JSON.stringify({key:'relic',hash:''})));
   let release,blocked=true;
   const gate=new Promise(resolve=>{release=resolve;});
   await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(blocked&&url.pathname.endsWith('/assets/cards/cards.css'))await gate;
    if(mode==='website'&&url.origin==='http://progress.test'){
     const file=path.resolve('.'+decodeURIComponent(url.pathname));
     assert(!path.relative(process.cwd(),file).startsWith('..'));
     await route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});
    }else await route.continue();
   });
   await page.goto(mode==='file'?pathToFileURL(path.resolve('index.html')).href:'http://progress.test/index.html');
   await page.waitForFunction(()=>document.querySelector('.index-loading').hidden);
   await page.evaluate(()=>{
    window.progressValues=[];
    new MutationObserver(()=>{
     const value=Number(document.querySelector('.index-loading [role=progressbar]')?.getAttribute('aria-valuenow'));
     if(Number.isFinite(value)&&window.progressValues.at(-1)!==value)window.progressValues.push(value);
    }).observe(document.querySelector('.index-loading'),{subtree:true,attributes:true,childList:true,characterData:true});
   });
   await page.locator('.site-nav').getByRole('link',{name:'Cards',exact:true}).evaluate(node=>node.click());
   await page.waitForFunction(()=>document.querySelector('.index-loading [role=progressbar]')?.getAttribute('aria-valuenow')==='35');
   assert(await page.locator('.index-loading').isVisible());
   assert.equal(await page.locator('.index-loading-percent').textContent(),'35%');
   assert.equal(await page.locator('#main-content').getAttribute('aria-busy'),'true');
   assert.equal(await page.locator('.index-loading-spinner').evaluate(node=>getComputedStyle(node).animationName),'index-loading-spin');
   const box=await page.locator('.index-loading').boundingBox();assert(box.x>=0&&box.x+box.width<=390);
   await page.screenshot({path:'assets/cards/previews/loading-progress-phone.png'});
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await page.locator('.index-loading-spinner').evaluate(node=>getComputedStyle(node).animationName),'none');
   blocked=false;release();
   await page.waitForFunction(()=>document.querySelector('.index-loading').hidden);
   assert.equal(await page.locator('.index-loading-percent').textContent(),'100%');
   assert.equal(await page.locator('#main-content').getAttribute('aria-busy'),'false');
   const values=await page.evaluate(()=>window.progressValues);
   assert(values.includes(35)&&values.includes(100));
   assert(values.every((value,index)=>value>=0&&value<=100&&(!index||value>=values[index-1])),'progress never moves backwards');
   await page.locator('.site-nav').getByRole('link',{name:'Relics',exact:true}).click();
   assert(await page.locator('.index-loading').evaluate(node=>node.hidden),'cached pages skip the loading animation');
   for(const [label,key]of [['Characters','builds'],['Potions','potion'],['Enchantments','enchantments'],['Monster','monster']]){
    await page.locator('.site-nav').getByRole('link',{name:label,exact:true}).evaluate(node=>node.click());
    assert(await page.locator('.index-loading').evaluate(node=>node.hidden),label+' never shows the percentage animation');
    await page.waitForFunction(key=>document.querySelector('iframe[data-page="'+key+'"]')?.style.visibility==='',key);
   }
   assert.deepEqual(errors,[]);
   await context.close();
   console.log('PASS '+mode+': percentage animation only on Cards; other pages stay animation-free; completion and reduced motion work.');
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
