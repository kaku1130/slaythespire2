process.chdir(require('node:path').resolve(__dirname,'../..'));
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const orders=require('./ancient-order.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve('relics.html')).href);
  const menu=page.locator('.relic-ancient-menu'),block=page.locator('.relic-ancient-block');
  assert.equal(await menu.locator('button').count(),8);
  const ancient=block.locator('button[value=Ancient]');
  assert.equal(await page.locator('[data-catalog-filter=rarity]').count(),1,'only Ancient rarity button remains');
  assert.equal(await block.locator('button').count(),9,'Ancient and eight icons share a block');
  assert.equal(await page.locator('#relic-filter-pool [data-catalog-filter=enchantments]').count(),1,'Enchantments belongs to the Pool block');
  const ancientBox=await ancient.boundingBox(),menuBox=await menu.boundingBox();
  assert(ancientBox.y+ancientBox.height<=menuBox.y,'Ancient appears on a separate row above the icons');
  assert(Math.abs(ancientBox.width-menuBox.width)<1,'Ancient fills its row');
  const iconRows=await menu.locator('button').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));
  assert.equal(new Set(iconRows).size,1,'wide menus show all eight icons in one row');
  for(const [width,columns] of [[240,2],[400,4],[800,8]]){
   await block.evaluate((node,width)=>node.style.width=width+'px',width);
   const tops=await menu.locator('button').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));
   assert.equal(tops.filter(top=>top===tops[0]).length,columns,width+'px columns');
  }
  await block.evaluate(node=>node.style.removeProperty('width'));
  await page.locator('[data-catalog-filter=pool][value=Ironclad]').click();
  for(const [slug,ids] of Object.entries(orders)){
   await page.locator('[data-catalog-filter=pool][value=Ironclad]').click();
   await page.locator('#search').fill('"no matching relic"');
   await menu.locator('[value='+slug+']').click();
   assert.equal(await page.locator('#search').inputValue(),'',slug+' clears search');
   assert.deepEqual(await page.locator('.entry.relic:not([hidden])').evaluateAll(nodes=>nodes.map(n=>n.dataset.relicId)),ids,slug+' exact ordered rewards');
   assert.equal(await page.locator('[data-catalog-filter=rarity][aria-pressed=true]').getAttribute('value'),'Ancient');
   assert.equal(await page.locator('[data-catalog-filter=pool][aria-pressed=true]').count(),0);
   assert.equal(await menu.locator('[aria-pressed=true]').count(),1);
   const background=await ancient.evaluate(node=>getComputedStyle(node).backgroundColor);
   assert.equal(await menu.locator('[value='+slug+']').evaluate(node=>getComputedStyle(node).backgroundColor),background,slug+' matches Ancient purple selection');
   assert.equal(await menu.locator('[value='+slug+']').evaluate(node=>getComputedStyle(node).borderTopColor),'rgb(197, 162, 232)',slug+' purple border');
  }
  await page.reload();
  assert.equal(await menu.locator('[value=darv]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.entry.relic:not([hidden])').count(),12);
  await menu.locator('[value=darv]').click();
  assert.equal(await page.locator('.entry.relic:not([hidden])').count(),12,'repeated owner click retains that owner');
  await menu.locator('[value=pael]').click();
  await ancient.click();
  assert.equal(await menu.locator('[aria-pressed=true]').count(),0,'Ancient clears owner selection');
  assert.equal(await ancient.getAttribute('aria-pressed'),'true');
  assert.deepEqual(await page.locator('.entry.relic:not([hidden])').evaluateAll(nodes=>nodes.map(n=>n.dataset.relicId)),Object.values(orders).flat(),'Ancient shows all rewards in order');
  await ancient.click();
  assert.equal(await page.locator('.entry.relic:not([hidden])').count(),102,'repeated Ancient click retains all ancient relics');
  await page.locator('[data-catalog-filter=pool][value=Ironclad]').click();
  await page.locator('#search').fill('"Small Capsule"');
  await ancient.click();
  assert.equal(await page.locator('#search').inputValue(),'');
  assert.equal(await page.locator('[data-catalog-filter=pool][aria-pressed=true]').count(),0);
  assert.equal(await page.locator('[data-catalog-filter=rarity][aria-pressed=true]').count(),1);
  assert.equal(await page.locator('.entry.relic:not([hidden])').count(),102,'Ancient clears filters that would hide rewards');
  await menu.locator('[value=neow]').click();
  await page.locator('#search').fill('"Small Capsule"');
  assert.equal(await page.locator('.entry.relic:not([hidden])').count(),1);
  await menu.locator('[value=neow]').click();
  assert.equal(await page.locator('#search').inputValue(),'','repeated owner click clears search');
  assert.equal(await page.locator('.entry.relic:not([hidden])').count(),30);
  await page.locator('[data-catalog-filter=pool][value=Ironclad]').click();
  assert.equal(await menu.locator('[aria-pressed=true]').count(),0);
  const catalog=require('../../data/relic/catalog.json').items;
  for(const key of ['pool'])for(const value of await page.locator('[data-catalog-filter='+key+']').evaluateAll(nodes=>nodes.map(n=>n.value).filter(value=>value!=='Ancient'))){
   await menu.locator('[value=neow]').click();
   await page.locator('#search').fill('"Small Capsule"');
   await page.locator('[data-catalog-filter='+key+'][value='+value+']').click();
   assert.equal(await menu.locator('[aria-pressed=true]').count(),0,key+' '+value+' clears owner');
   assert.equal(await ancient.getAttribute('aria-pressed'),'false',key+' '+value+' clears Ancient');
   assert.equal(await page.locator('#search').inputValue(),'',key+' '+value+' clears search');
   const actual=await page.locator('.entry.relic:not([hidden])').evaluateAll(nodes=>nodes.map(n=>n.dataset.relicId));
   assert.deepEqual(actual.sort(),catalog.filter(item=>item[key]===value).map(item=>item.id).sort(),key+' '+value+' displays matching relics');
  }
  await menu.locator('[value=neow]').click();
  const size=await menu.evaluate(node=>({width:node.clientWidth,scroll:node.scrollWidth}));
  assert(size.scroll<=size.width,'menu stays inside the page');
  await page.screenshot({path:path.join(process.env.TEMP,'relic-ancient-filter.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS: eight ancient filters, exact reward order, rarity/pool interaction, deselection, search, reload memory, and desktop layout.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
