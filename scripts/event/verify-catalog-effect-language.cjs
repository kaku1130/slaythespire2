process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1100}});
   if(mode==='website')await context.route('http://catalogs.test/**',async route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));
    assert(!path.relative(process.cwd(),file).startsWith('..'));
    const contentType={'.html':'text/html','.css':'text/css','.js':'application/javascript','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    await route.fulfill({status:200,contentType,body:fs.readFileSync(file)});
   });
   for(const kind of ['relic','potion']){
    const items=require('../../data/'+kind+'/catalog.json').items;
    for(const [language,field]of [['en','descEn'],['zh-TW','descI18n']]){
     const source=require('../../data/'+kind+'/source/descriptions-'+language+'.json').items;
     for(const item of items)assert.equal(item[field],source.find(x=>x.id===item.id).description,item.id+' matches website '+language+' exactly');
    }
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(mode==='file'?pathToFileURL(path.resolve(kind+'.html')).href:'http://catalogs.test/'+kind+'.html');
    const toggle=page.locator('.card-language-toggle'),search=page.locator('#search');
    assert.equal(await toggle.textContent(),'中','each page defaults independently to English');
    const visibleIds=()=>page.locator('.entry:visible').evaluateAll(nodes=>nodes.map(n=>n.id).sort());
    assert.equal((await visibleIds()).length,items.length);
    for(const lang of ['en','zh'])assert.equal(await page.locator('[data-effect-language='+lang+']').count(),items.length);
    const first=page.locator('.entry').first();
    const metadata=()=>first.locator('h2,h3,img,.relic-rarity-row,.potion-rarity-row').evaluateAll(nodes=>nodes.map(n=>n.outerHTML));
    const before=await metadata();await toggle.click();
    assert.equal(await toggle.textContent(),'EN');assert.deepEqual(await metadata(),before);
    assert(await first.locator('[data-effect-language=zh]').isVisible());
    assert(!await first.locator('[data-effect-language=en]').isVisible());
    const rendered=await page.locator('.entry').evaluateAll(nodes=>nodes.map(n=>({id:n.id,zh:n.querySelector('[data-effect-language=zh]').textContent,en:n.querySelector('[data-effect-language=en]').textContent})));
    const plain=s=>s.replace(/<g>|<\/g>|<e>\d+<\/e>|<s>\d+<\/s>|<[es]\s*\/>/g,'').replace(/\s+/g,' ').trim();
    for(const item of items){const row=rendered.find(x=>x.id===item.id);assert.equal(plain(row.zh),plain(item.descI18n),item.id+' Chinese effect');assert.equal(plain(row.en),plain(item.descEn),item.id+' English effect');}
    for(const query of kind==='relic'?['戰鬥','combat','能量','Energy']:['力量','strength','中毒','poison']){
     await search.fill(query);const ids=await visibleIds();assert(ids.length>0,query);
     const intended=await page.locator('.entry:not([hidden])').evaluateAll(nodes=>nodes.map(n=>n.id).sort());assert.deepEqual(ids,intended,'actual display matches filter');
     await toggle.click();assert.deepEqual(await visibleIds(),ids,'both languages searchable regardless of display');assert.equal(await search.inputValue(),query);
    }
    await search.fill('');const filter=page.locator('[data-catalog-filter=rarity][value=Rare]');await filter.click();
    const ids=await visibleIds();assert(ids.length>0&&ids.length<items.length);await toggle.click();assert.deepEqual(await visibleIds(),ids);assert.equal(await filter.getAttribute('aria-pressed'),'true');
    if(await toggle.textContent()==='中')await toggle.click();
    await page.reload();assert.equal(await toggle.textContent(),'EN');assert.equal(await filter.getAttribute('aria-pressed'),'true');
    const key='sts2_'+kind+'_effect_language';
    if(mode==='file')assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'zh');else assert.equal((await context.cookies()).find(c=>c.name===key).value,'zh');
    for(const width of [1280,1440,1920]){
     await page.setViewportSize({width,height:1100});
     assert(await page.locator('.catalog-search-tools').evaluate(toolbar=>{
      const r=toolbar.querySelector('.catalog-random').getBoundingClientRect(),l=toolbar.querySelector('.card-language-toggle').getBoundingClientRect(),m=toolbar.querySelector('.filter-menu-toggle').getBoundingClientRect(),o=toolbar.getBoundingClientRect();
      return r.right<=l.left&&l.right<=m.left&&m.right<=o.right+1&&r.y===l.y&&l.y===m.y&&l.width===52&&l.height===48;
     }),'toolbar placement '+width);
    }
    await search.fill('');await page.setViewportSize({width:1440,height:1100});
    if(mode==='file')await page.screenshot({path:'assets/'+kind+'/previews/effects-chinese-1440.png'});
    assert.deepEqual(errors,[]);console.log('PASS '+mode+' '+kind+': '+items.length+' bilingual effects, search, metadata, filters, persistence and toolbar.');await page.close();
   }
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
