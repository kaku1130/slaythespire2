process.chdir(require('node:path').resolve(__dirname,'../..'));
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  await page.goto(pathToFileURL(path.resolve('relics.html')).href);
  const height=await page.locator('#search').evaluate(node=>node.getBoundingClientRect().height);
  assert.equal(height,48);
  for(const file of ['cards.html','relics.html','potions.html','monsters.html']){
   await page.goto(pathToFileURL(path.resolve(file)).href);
   const fields=page.locator('.search-control,.search-control input#search,.filter-menu-toggle');
   await page.locator('.search-control').waitFor();
   assert.equal(await page.locator('#aoe-toggle,.catalog-random,button[aria-label^="隨機"]').count(),0,file+' no random buttons');
   if(file==='cards.html'){
    assert.equal(await page.locator('.filter-menu-toggle,.filter-menu-panel').count(),0,'card hamburger removed');
    assert.equal(await page.locator('.card-search').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),1,'search fills toolbar');
    for(const group of ['character','type','rarity','energy'])assert(await page.locator('#card-filter-'+group).isVisible(),group+' filters directly visible');
   }
   if(file==='relics.html'||file==='potions.html'){
    const gap=await page.locator('.search-control').evaluate(node=>Math.abs(node.getBoundingClientRect().right-node.parentElement.getBoundingClientRect().right));
    assert(gap<1,file+' search fills toolbar');
   }
   for(const actual of await fields.evaluateAll(nodes=>nodes.filter(node=>node.getClientRects().length).map(node=>({name:node.className||node.id||node.textContent,height:node.getBoundingClientRect().height}))))assert.equal(actual.height,height,file+' '+actual.name);
   const offset=await page.locator('.search-clear').first().evaluate(node=>{
    const icon=node.getBoundingClientRect(),input=node.parentElement.querySelector('input').getBoundingClientRect();
    return Math.abs((icon.top+icon.bottom-input.top-input.bottom)/2);
   });
   assert(offset<1,file+' centered search icon');
   assert(await page.locator('#search').evaluate(input=>{
    const css=getComputedStyle(input);
    return parseFloat(css.lineHeight)+parseFloat(css.paddingTop)+parseFloat(css.paddingBottom)<=input.clientHeight;
   }),file+' text fits inside search field');
   if(file==='potions.html'){
    assert.equal(await page.locator('[data-catalog-filter],.catalog-filter-rows').count(),0,'potion rarity menu removed');
    assert.equal(await page.locator('.entry.potion').count(),63,'all potions retained');
   }
   if(file==='relics.html'||file==='monsters.html')await page.screenshot({path:path.join(process.env.TEMP,file.replace('.html','')+'-control-heights.png')});
  }
  console.log('PASS: all catalog search bars and adjacent actions, search controls match card buttons at 48px; potion rarity controls removed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
