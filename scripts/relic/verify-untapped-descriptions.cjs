process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const source=require('../../data/relic/source/untapped-descriptions.json').items;
  const items=require('../../data/relic/catalog.json').items;
  assert.equal(items.length,297);assert(items.every(x=>x.id!=='CIRCLET'&&!Object.hasOwn(x,'descI18n')));
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];
   if(mode==='website')await context.route('http://relics.test/**',async route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));assert(!path.relative(process.cwd(),file).startsWith('..'));
    const contentType={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    await route.fulfill({status:200,contentType,body:fs.readFileSync(file)});
   });
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(mode==='file'?pathToFileURL(path.resolve('relics.html')).href:'http://relics.test/relics.html');
   assert.equal(await page.locator('.card-language-toggle,[data-effect-language]').count(),0);
   for(const item of items)assert.equal(await page.locator('#'+item.id+' a.relic-name-en').getAttribute('href'),item.sourceEn,item.id+' source link');
   assert.equal(await page.locator('#BURNING_BLOOD a.relic-name-en').getAttribute('href'),'https://sts2.untapped.gg/en/relics/ironclad/burning-blood');
   assert.equal(await page.locator('#CIRCLET').count(),0);
   const rendered=await page.locator('.entry.relic').evaluateAll(nodes=>nodes.map(n=>{
    const effect=n.querySelector('.relic-card-text > p'),clone=effect.cloneNode(true);
    for(const icon of clone.querySelectorAll('.energy-resource-icon,.star-resource-icon'))icon.replaceWith(icon.classList.contains('energy-resource-icon')?'<e/>':'<s/>');
    return {id:n.id,name:n.querySelector('.relic-name-zh').textContent,text:clone.textContent,colors:[...effect.querySelectorAll('[style]')].map(span=>({text:span.textContent,color:span.style.color}))};
   }));
   for(const item of items){
    const actual=rendered.find(x=>x.id===item.id),reference=source.find(x=>x.id===item.id);assert.equal(actual.name,item.name,'Chinese name retained');
    if(reference.unavailable){assert.equal(item.id,'CIRCLET');continue;}
    assert.equal(actual.text,reference.parts.map(p=>p.resource?'<'+(p.resource==='energy'?'e':'s')+'/>':p.text).join(''),item.id+' exact website description');
    const expected=await page.evaluate(parts=>parts.filter(p=>p.color).map(p=>{const span=document.createElement('span');span.style.color=p.color;return {text:p.text,color:span.style.color}}),reference.parts);
    assert.deepEqual(actual.colors,expected,item.id+' exact website colors');
   }
   const search=page.locator('#search');await search.fill('Vigor');assert(await page.locator('#AKABEKO').isVisible());
   await search.fill('赤牛');assert(await page.locator('#AKABEKO').isVisible());
   await search.fill('');await page.locator('[data-catalog-filter=pool][value=Shared]').click();assert.equal(await page.locator('.entry.relic:visible').count(),252);
   await page.locator('[data-catalog-filter=pool][value=Ironclad]').click();assert.equal(await page.locator('[data-catalog-filter=pool][aria-pressed=true]').count(),1);assert.equal(await page.locator('.entry.relic:visible').count(),9);
   await search.fill('"Akabeko"');assert.equal(await page.locator('.entry.relic:visible').count(),1);
   assert.deepEqual(errors,[]);
   if(mode==='file')await page.screenshot({path:'assets/relic/previews/untapped-effects-1440.png'});
   console.log('PASS '+mode+': 297 source descriptions/colors, Chinese names, source links, Circlet removed, English-only display, search and Pool filters.');await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
