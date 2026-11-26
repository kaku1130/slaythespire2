process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const pages=require('./site-navigation.cjs').items;
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const embedded of [false,true]){
   const context=await browser.newContext({offline:true,viewport:{width:1440,height:1100}});
   const page=await context.newPage();
   if(embedded)await page.goto(pathToFileURL(path.resolve('index.html')).href);
   for(const [key,label,file] of pages){
    if(embedded)await page.getByRole('link',{name:label,exact:true}).click();
    else await page.goto(pathToFileURL(path.resolve(file)).href);
    const root=embedded?page.frameLocator('#main-content>iframe:not([hidden])'):page;
    await root.locator('main#main-content').waitFor();
    for(const width of [1280,1440,1920]){
     await page.setViewportSize({width,height:1100});
     const box=await root.locator('main#main-content').evaluate(main=>{
      const rect=main.getBoundingClientRect(),parent=main.parentElement;
      return {width:rect.width,available:parent.clientWidth,left:rect.left,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
     });
     assert.ok(Math.abs(box.width-box.available*.6)<1,JSON.stringify({file,embedded,viewport:width,...box}));
     assert.ok(Math.abs(box.left-(box.available-box.width)/2)<1,file+' centered');
     assert.equal(box.overflow,false,file+' no horizontal document overflow');
    }
    console.log('PASS '+(embedded?'embedded ':'')+file+': centered 60% desktop content at 1280/1440/1920px');
    if(!embedded&&key==='cards'){
     await page.setViewportSize({width:1440,height:1100});
     fs.mkdirSync('assets/cards/previews',{recursive:true});
     await page.screenshot({path:'assets/cards/previews/cards-desktop-60-percent.png'});
    }
   }
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
