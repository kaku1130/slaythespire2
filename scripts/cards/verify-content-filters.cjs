process.chdir(require('node:path').resolve(__dirname, '../..'));
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  for(const width of [1440,1920])for(const file of ['cards.html','relics.html','potions.html']){
   const page=await browser.newPage({viewport:{width,height:1000}});
   await page.goto(pathToFileURL(path.resolve(file)).href);
   const groups=page.locator('#card-filter-rarity,.catalog-filter-buttons[aria-label=Rarity]');
   if(await groups.count()){
    const sizes=await groups.first().locator('button').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
    assert.ok(new Set(sizes.map(Math.round)).size>1,file+' button widths follow content');
   }
   if(file!=='potions.html')for(const name of ['Ironclad','Silent','Defect','Necrobinder','Regent']){
    const button=page.locator('#card-filter-character button,[data-catalog-filter=pool]').filter({has:page.locator('img')}).and(page.getByRole('button',{name,exact:true}));
    assert.equal(await button.count(),1);
    assert.equal(await button.textContent(),'');
    assert.ok(await button.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0));
    const wasPressed=await button.getAttribute('aria-pressed');
    await button.click();assert.equal(await button.getAttribute('aria-pressed'),wasPressed==='true'?'false':'true');
   }
   const tiers=page.locator('.detail-tier[data-tier=A],.tier[data-tier=A],.relic-tier-label[data-tier=A]');
   if(await tiers.count())assert.ok(await tiers.evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).backgroundColor==='rgb(249, 115, 22)')));
   console.log('PASS '+file+' '+width+'px: content widths, character icons and filtering, Tier A orange');
   await page.close();
  }
  for(const file of ['characters.html','ancients.html']){
   const page=await browser.newPage();await page.goto(pathToFileURL(path.resolve(file)).href);
   const tiers=page.locator('[data-tier=A]');
   const colors=await tiers.evaluateAll(nodes=>nodes.map(n=>({class:n.className,color:getComputedStyle(n).backgroundColor})));
   assert.ok(colors.every(n=>n.color==='rgb(249, 115, 22)'),JSON.stringify(colors));
   await page.close();console.log('PASS '+file+': Tier A labels orange');
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
