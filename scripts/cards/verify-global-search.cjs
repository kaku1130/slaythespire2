process.chdir(require('node:path').resolve(__dirname,'../..'));
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const expectedDefends=require('../../data/cards/english-details.json').cards.filter(card=>card.name==='Defend').map(card=>card.id).sort();
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const embedded of [false,true]){
   const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(pathToFileURL(path.resolve(embedded?'index.html':'cards.html')).href);
   let root=embedded?page.frameLocator('#main-content>iframe:not([hidden])'):page;
   await root.locator('#card-scroll').waitFor();
   assert.equal(await root.locator('#card-filter-tier,.card-tier-choices').count(),0,'Tier filter removed');
   for(const [group,value] of [['character','Silent'],['type','Attack'],['rarity','Rare'],['energy','3+']]){
    const button=root.locator('#card-filter-'+group+' button[value="'+value+'"]');
    if(await button.getAttribute('aria-pressed')!=='true')await button.click();
   }
   await root.locator('#search').fill('"Defend"');
   assert.equal(await root.locator('#tools [aria-pressed=true]').count(),0,'card search clears every filter');
   assert.deepEqual(await root.locator('.card-detail-row:not([hidden])').evaluateAll(nodes=>nodes.map(n=>n.dataset.id).sort()),expectedDefends,'Defend across all characters');
   if(embedded)await page.locator('.site-nav>[aria-label=Relics]').click();
   else await page.goto(pathToFileURL(path.resolve('relics.html')).href);
   root=embedded?page.frameLocator('#main-content>iframe:not([hidden])'):page;
   await root.locator('.entry.relic').first().waitFor();
   const colors={Ironclad:'rgb(220, 108, 104)',Silent:'rgb(112, 191, 139)',Regent:'rgb(227, 191, 114)',Necrobinder:'rgb(181, 149, 221)',Defect:'rgb(111, 174, 238)',Shared:'rgb(170, 182, 196)'};
   for(const [pool,color] of Object.entries(colors)){
    const button=root.locator('#relic-filter-pool>[value='+pool+']');
    assert.equal(await button.evaluate(node=>getComputedStyle(node).borderTopColor),color,pool+' idle border');
    await button.hover();
    assert.equal(await button.evaluate(node=>getComputedStyle(node).borderTopColor),color,pool+' hover border');
    await button.click();
    assert.equal(await button.evaluate(node=>getComputedStyle(node).borderTopColor),color,pool+' clicked border');
   }
   for(const selector of ['[data-catalog-filter=ancient][value=neow]','[data-catalog-filter=pool][value=Silent]']){
    await root.locator(selector).click();
    await root.locator('#search').fill('"Burning Blood"');
    assert.equal(await root.locator('[data-catalog-filter][aria-pressed=true]').count(),0,'relic search clears Ancient, owner and Pool');
    assert.deepEqual(await root.locator('.entry.relic:not([hidden])').evaluateAll(nodes=>nodes.map(n=>n.dataset.relicId)),['BURNING_BLOOD'],'search includes relics outside previous filters');
   }
   assert.deepEqual(errors,[]);
   console.log('PASS '+(embedded?'homepage':'standalone')+': card/relic searches clear every filter; all six Pool borders retain their colors.');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
