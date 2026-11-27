process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const mode of ['file','website'])for(const embedded of [false,true]){
   const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   if(mode==='website')await context.route('http://menus.test/**',route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));
    assert(!path.relative(process.cwd(),file).startsWith('..'));
    return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});
   });
   const url=file=>mode==='file'?pathToFileURL(path.resolve(file)).href:'http://menus.test/'+file;
   const open=async(file,key,label)=>{
    await page.goto(url(embedded?'index.html':file));
    if(embedded){await page.locator('.site-nav').getByRole('link',{name:label,exact:true}).click();return page.frameLocator('iframe[data-page='+key+']');}
    return page;
   };
   let root=await open('cards.html','cards','Cards');
   const cardPool=()=>root.locator('#card-filter-character');
   assert.equal(await cardPool().locator('[aria-pressed=true]').getAttribute('value'),'Ironclad');
   await cardPool().locator('[value=Ironclad]').click();
   assert.equal(await cardPool().locator('[aria-pressed=true]').getAttribute('value'),'Ironclad');
   await cardPool().locator('[value=Silent]').click();
   await cardPool().locator('[value=Silent]').click();
   assert.equal(await cardPool().locator('[aria-pressed=true]').count(),1);
   await root.locator('#card-filter-rarity [value=Rare]').click();
   await root.locator('#card-filter-type [value=Skill]').click();
   await page.reload();
   assert.equal(await cardPool().locator('[aria-pressed=true]').getAttribute('value'),'Silent');
   assert.equal(await root.locator('#card-filter-rarity [value=Rare]').getAttribute('aria-pressed'),'true');
   assert.equal(await root.locator('#card-filter-type [value=Skill]').getAttribute('aria-pressed'),'true');
   await root.locator('#search').fill('"Anger"');
   await page.reload();
   assert.equal(await root.locator('#search').inputValue(),'"Anger"');
   assert.equal(await root.locator('.card-detail-row:visible').count(),0,'search also respects Silent / Rare / Skill');
   assert.equal(await cardPool().locator('[aria-pressed=true]').getAttribute('value'),'Silent');
   assert.equal(await root.locator('#card-filter-rarity [value=Rare]').getAttribute('aria-pressed'),'true');
   assert.equal(await root.locator('#card-filter-type [value=Skill]').getAttribute('aria-pressed'),'true');
   root=await open('relics.html','relic','Relics');
   const relicPool=()=>root.locator('[data-catalog-filter=pool][aria-pressed=true]');
   assert.equal(await relicPool().getAttribute('value'),'Ironclad');
   await root.locator('[data-catalog-filter=pool][value=Silent]').click();
   await root.locator('[data-catalog-filter=pool][value=Silent]').click();
   assert.equal(await relicPool().count(),1);
   await page.reload();assert.equal(await relicPool().getAttribute('value'),'Silent');
   await root.locator('[data-catalog-filter=ancient][value=pael]').click();
   await page.reload();
   assert.equal(await root.locator('[data-catalog-filter=ancient][value=pael]').getAttribute('aria-pressed'),'true');
   assert.equal(await relicPool().count(),0,'Ancient selection clears character Pool');
   await root.locator('[data-catalog-filter=enchantments]').click();
   await page.reload();assert.equal(await root.locator('[data-catalog-filter=enchantments]').getAttribute('aria-pressed'),'true');
   assert.equal(await root.locator('.entry:visible').count(),15);
   for(const [file,key,label,query]of [['potions.html','potion','Potions','"Strength Potion"'],['enchantments.html','enchantments','Enchantments','"Glam"']]){
    root=await open(file,key,label);await root.locator('#search').fill(query);await page.reload();
    assert.equal(await root.locator('#search').inputValue(),query);assert.equal(await root.locator('.entry:visible').count(),1);
   }
   root=await open('monsters.html','monster','Monster');
   await root.locator('.monster-filters button[value=Hive]').click();
   await page.reload();assert.equal(await root.locator('.monster-filters [aria-pressed=true]').getAttribute('value'),'Hive');
   root=await open('characters.html','builds','Characters');
   await root.locator('.character-tile').nth(1).click();
   const selected=await root.locator('[data-character-panel]:visible').getAttribute('data-character-panel');
   // Reopen without a hash so persistence, rather than the URL, restores the choice.
   root=await open('characters.html','builds','Characters');
   assert.equal(await root.locator('[data-character-panel]:visible').getAttribute('data-character-panel'),selected);
   assert.deepEqual(errors,[]);
   console.log('PASS '+mode+' '+(embedded?'homepage':'standalone')+': all six pages remember choices/search; card/relic Pools default to Ironclad and stay single-select.');
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
