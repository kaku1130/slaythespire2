process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1100}}),errors=[];
   if(mode==='website')await context.route('http://cards.test/**',async route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));
    assert(!path.relative(process.cwd(),file).startsWith('..'));
    const contentType={'.html':'text/html','.css':'text/css','.js':'application/javascript','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    await route.fulfill({status:200,contentType,body:fs.readFileSync(file)});
   });
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   const url=mode==='file'?pathToFileURL(path.resolve('card.html')).href:'http://cards.test/card.html';
   await page.goto(url+'#card-BASH');
   const toggle=page.locator('.card-language-toggle'),search=page.locator('#search');
   assert.equal(await toggle.textContent(),'中','default English retains current presentation');
   assert.equal(await page.locator('.card-detail-row').count(),569);
   for(const lang of ['en','zh'])assert.equal(await page.locator('[data-effect-language='+lang+']').count(),569*2,'complete bilingual panels');
   const website={en:require('../../data/cards/source/effects-en.json').cards,zh:require('../../data/cards/source/effects-zh-TW.json').cards};
   const english=require('../../data/cards/english-details.json').cards;
   const canonical=text=>text.replace(/<(e|s)>(\d+)<\/\1>/g,(_,r,n)=>('<'+r+'/>').repeat(Number(n))).replace(/<\/?g>/g,'');
   const descriptions=await page.locator('.card-detail-row').evaluateAll(rows=>rows.map(row=>({id:row.dataset.id,variants:[...row.querySelectorAll('[data-effect-language]')].map(node=>{
    const clone=node.cloneNode(true);
    for(const br of clone.querySelectorAll('br'))br.replaceWith('\n');
    for(const icon of clone.querySelectorAll('.energy-resource-icon,.star-resource-icon'))icon.replaceWith(icon.classList.contains('energy-resource-icon')?'<e/>':'<s/>');
    return {lang:node.dataset.effectLanguage,text:clone.textContent};
   })})));
   for(const row of descriptions)for(const language of ['en','zh']){
    const source=website[language].find(x=>x.id===row.id),variants=row.variants.filter(x=>x.lang===language);
    assert.equal(variants[0].text,canonical(source.descBase),row.id+' '+language+' Base matches website exactly');
    const upgrade=english.find(x=>x.id===row.id).effect.upgraded;
    assert.equal(variants[1].text,upgrade===null?(language==='en'?'Cannot be upgraded.':'無法升級。'):canonical(source.descUpgraded),row.id+' '+language+' Upgraded matches website exactly');
   }
   assert.equal(await page.locator('.detail-type-label').count(),569);
   assert(await page.locator('.detail-type-label').evaluateAll(nodes=>nodes.every(n=>{const css=getComputedStyle(n);return css.color==='rgb(0, 0, 0)'&&css.backgroundColor!=='rgba(0, 0, 0, 0)'&&parseFloat(css.borderRadius)>0;})),'all Types are filled labels with black text');
   const variants=page.locator('#card-BASH [data-effect-language]');
   const metadata=()=>page.locator('#card-BASH .detail-name-zh,#card-BASH .detail-name-en,#card-BASH .detail-heading-rarity,#card-BASH .detail-type-metadata,#card-BASH .detail-panel-cost').allTextContents();
   const originalMetadata=await metadata();
   assert((await variants.filter({hasText:'Apply 2'}).first().innerText()).includes('Vulnerable'));
   await toggle.click();assert.equal(await toggle.textContent(),'EN');
   assert.deepEqual(await metadata(),originalMetadata,'only descriptions change');
   assert(await page.locator('#card-BASH [data-effect-language=zh]').first().isVisible());
   assert(!await page.locator('#card-BASH [data-effect-language=en]').first().isVisible());
   assert((await page.locator('#card-BASH [data-effect-language=zh]').first().innerText()).includes('施加 2 層易傷'));
   assert.deepEqual(await page.locator('#card-BASH [data-effect-language=zh] .detail-effect-change').allTextContents(),['10','3'],'Chinese upgraded numbers retain highlights');
   assert.equal(await page.locator('#card-BLOODLETTING [data-effect-language=zh]').first().locator('img.energy-resource-icon').count(),2);
   assert.equal(await page.locator('#card-BLOODLETTING [data-effect-language=zh]').last().locator('img.energy-resource-icon').count(),3);
   const literalTags=await page.locator('[data-effect-language=zh]').evaluateAll(nodes=>nodes.filter(n=>/<\/?[es]>/.test(n.textContent)).length);
   assert.equal(literalTags,0,'localized resource tokens rendered as icons');
   const visibleIds=()=>page.locator('.card-detail-row:not([hidden])').evaluateAll(nodes=>nodes.map(n=>n.dataset.id).sort());
   for(const query of ['易傷','Vulnerable','所有敵人','ALL enemies']){
    await search.fill(query);const before=await visibleIds();
    assert(before.includes(query.includes('敵人')||query.includes('enemies')?'WHIRLWIND':'BASH'));
    await toggle.click();assert.deepEqual(await visibleIds(),before,'search results independent of language: '+query);
    assert.equal(await search.inputValue(),query,'language toggle preserves query');
   }
   await search.fill('');await page.locator('#card-filter-energy button[value="2"]').click();
   const filtered=await visibleIds();await toggle.click();
   assert.deepEqual(await visibleIds(),filtered,'language toggle preserves filters');
   assert.equal(await page.locator('#card-filter-energy button[value="2"]').getAttribute('aria-pressed'),'true');
   if(await toggle.textContent()==='中')await toggle.click();
   await page.evaluate(()=>history.replaceState(null,'',location.href.split('#')[0]));
   await page.reload();assert.equal(await toggle.textContent(),'EN','Chinese preference restored');
   assert.equal(await page.locator('#card-filter-energy button[value="2"]').getAttribute('aria-pressed'),'true','filter restored independently');
   if(mode==='file')assert.equal(await page.evaluate(()=>localStorage.getItem('sts2_card_effect_language')),'zh');
   else assert.equal((await context.cookies()).find(c=>c.name==='sts2_card_effect_language').value,'zh');
   await page.goto(url+'#card-WHIRLWIND');
   await page.locator('#card-WHIRLWIND [data-effect-language=zh] [data-effect-search]').first().click();
   assert.equal(await search.inputValue(),'所有敵人');assert((await visibleIds()).includes('WHIRLWIND'));
   for(const width of [1280,1440,1920]){
    await page.setViewportSize({width,height:1100});
    const positions=await page.locator('.card-search').evaluate(toolbar=>{
     const random=toolbar.querySelector('#aoe-toggle').getBoundingClientRect(),lang=toolbar.querySelector('.card-language-toggle').getBoundingClientRect(),menu=toolbar.querySelector('.filter-menu-toggle').getBoundingClientRect(),outer=toolbar.getBoundingClientRect();
     return {ordered:random.right<=lang.left&&lang.right<=menu.left&&menu.right<=outer.right+1,aligned:random.y===lang.y&&lang.y===menu.y,size:lang.width===52&&lang.height===48};
    });
    assert(positions.ordered&&positions.aligned&&positions.size,'toolbar placement at '+width);
   }
   await page.goto(url+'#card-ASCENDERS_BANE');
   assert((await page.locator('#card-ASCENDERS_BANE [data-effect-language=zh]').last().innerText()).includes('無法升級'));
   await page.goto(url+'#card-BASH');await page.setViewportSize({width:1440,height:1100});
   if(mode==='file')await page.screenshot({path:'assets/cards/previews/effects-chinese-1440.png'});
   assert.deepEqual(errors,[]);
   console.log('PASS '+mode+': 569 bilingual cards; descriptions only, numeric highlights/icons, language-independent search, filters, persistence, effect search and toolbar placement.');
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
