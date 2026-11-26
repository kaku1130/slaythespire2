process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL,fileURLToPath}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const data=JSON.parse(fs.readFileSync('data/builds/characters.json','utf8'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({offline:true,viewport:{width:1440,height:1000}});
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
  await page.goto(pathToFileURL(path.resolve('characters.html')).href);
  assert.equal(await page.locator('.character-tile').count(),6);
  const missingTranslations=await page.locator('.character-prose a[href]').evaluateAll(nodes=>nodes.filter(node=>{
   const href=node.getAttribute('href'),text=node.textContent.trim();
   return /(?:cards\.html#|\/(?:cards|relics|potions)\/)/.test(href)&&text&&!text.startsWith('Untapped.gg')&&!node.closest('.guide-card')&&!node.querySelector('img.guide-image')&&!node.querySelector('.guide-resource-name');
  }).map(node=>node.textContent));
  assert.deepEqual(missingTranslations,[],'Linked resource names include Chinese translations');
  assert.ok((await page.locator('#character-ironclad .guide-resource-name').allTextContents()).some(text=>text.startsWith("Pael's Legion(")));

  assert.equal(await page.locator('.character-nav,.character-toc').count(),0);
  assert.equal(await page.locator('.site-nav a[href="characters.html"]').getAttribute('aria-label'),'Characters');
  assert.equal(await page.locator('.site-nav a[href="characters.html"] img').getAttribute('src'),'data:image/webp;base64,'+fs.readFileSync('assets/cards/icons/ironclad.webp').toString('base64'));
  await page.locator('img').evaluateAll(async nodes=>{
   for(const node of nodes)node.loading='eager';
   await Promise.all(nodes.map(node=>node.decode()));
  });
  for(const url of await page.locator('a[href]').evaluateAll(nodes=>nodes.map(node=>node.href).filter(href=>href.startsWith('file:')))){
   assert.ok(fs.existsSync(fileURLToPath(url)),url);
  }
  const preview='assets/builds/previews';fs.mkdirSync(preview,{recursive:true});
  await page.screenshot({path:preview+'/characters-index-1440.png'});
  assert.equal(await page.locator('.character-back').textContent(),'← All Characters');
  assert.equal(await page.locator('.character-tile a a').count(),0);
  for(const character of data.characters){
   const tile=page.locator('.character-tile[data-character="'+character.id+'"]');
   const tags=tile.locator('.character-build-link');
   assert.equal(await tags.count(),character.tags.length);
   for(let index=0;index<character.tags.length;index++){
    const tag=tags.nth(index),hash=await tag.getAttribute('href');
    await tag.click();
    await page.waitForFunction(id=>{
     const heading=document.getElementById(id),bounds=heading.getBoundingClientRect();
     return heading.closest('[data-character-panel]').hidden===false&&bounds.top>=0&&bounds.top<innerHeight;
    },hash.slice(1));
    assert.equal(await page.locator('#character-index').isVisible(),false);
    await page.locator('.character-back').click();
    await page.waitForFunction(()=>!document.getElementById('character-index').hidden);
   }
  }
  for(const character of data.characters){
   await page.locator('.character-tile[data-character="'+character.id+'"] .character-tile-link').click();
   await page.waitForFunction(id=>!document.getElementById('character-'+id).hidden,character.id);
   assert.equal(await page.locator('.character-panel:visible').count(),1);
   assert.equal(await page.locator('#character-index').isVisible(),false);
   assert.equal(await page.locator('main').evaluate(node=>node.scrollWidth<=node.clientWidth),true,character.id+' content overflow');
   if(character.id==='ironclad'){
    assert.equal(await page.locator('#character-ironclad .character-prose').evaluate(node=>getComputedStyle(node).fontSize),'25.5px');
    assert.equal(await page.locator('#character-ironclad .character-prose>div:first-child .guide-image').count(),0);
    await page.screenshot({path:preview+'/character-ironclad-1440.png'});
   }
   const buildTags=page.locator('#character-'+character.id+' .character-build-link');
   assert.equal(await buildTags.count(),character.tags.length);
   for(let index=0;index<character.tags.length;index++){
    const tag=buildTags.nth(index),hash=await tag.getAttribute('href');
    await tag.click();
    await page.waitForFunction(hash=>location.hash===hash,hash);
    await page.waitForFunction(id=>{
     const heading=document.getElementById(id),bounds=heading.getBoundingClientRect();
     return heading.closest('[data-character-panel]').hidden===false&&bounds.top>=0&&bounds.top<innerHeight;
    },hash.slice(1));
   }
   if(character.id==='fool')assert.equal(await page.locator('.fool-card').count(),90);
   await page.locator('.character-back').click();
   await page.waitForFunction(()=>!document.getElementById('character-index').hidden);
  }
  await page.goto(pathToFileURL(path.resolve('characters.html')).href+'#character-defect');
  assert.equal(await page.locator('#character-defect').isVisible(),true);
  for(const width of [1024,1920]){
   await page.setViewportSize({width,height:1000});
   assert.equal(await page.locator('main').evaluate(node=>node.scrollWidth<=node.clientWidth),true,'desktop width '+width);
  }
  for(const width of [390,320]){
   await page.setViewportSize({width,height:1000});
   await page.goto(pathToFileURL(path.resolve('characters.html')).href);
   const columns=await page.locator('.character-grid').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
   assert.equal(columns,1,'Phone character overview is one column');
   assert.equal(await page.locator('.site-header-inner').evaluate(node=>node.scrollWidth<=node.clientWidth),true,'Phone navigation fits '+width);
   assert.equal(await page.locator('main').evaluate(node=>node.scrollWidth<=node.clientWidth),true,'Phone character page fits '+width);
   if(width===390)await page.screenshot({path:preview+'/characters-index-390.png'});
   await page.locator('.character-tile[data-character="necrobinder"] .character-tile-link').click();
   await page.waitForFunction(()=>!document.getElementById('character-necrobinder').hidden);
   assert.equal(await page.locator('main').evaluate(node=>node.scrollWidth<=node.clientWidth),true,'Phone detail fits '+width);
   await page.locator('.game-info-dropdown summary').click();
   const menuBox=await page.locator('.game-info-menu').boundingBox();
   assert.ok(menuBox.x>=0&&menuBox.x+menuBox.width<=width,'Phone Game Info fits');
  }
  await page.setViewportSize({width:1440,height:1000});
  const pages=['cards.html','potions.html','relics.html'];
  for(const file of pages){
   await page.goto(pathToFileURL(path.resolve(file)).href);
   const entry=page.locator('.site-nav a[aria-label="Characters"]');
   assert.equal(await entry.count(),1,file);
   assert.equal(await entry.locator('img').getAttribute('src'),'data:image/webp;base64,'+fs.readFileSync('assets/cards/icons/ironclad.webp').toString('base64'),file);
  }
  assert.deepEqual(errors,[]);
  assert.deepEqual(requests,[],'All character content must load without network requests');
  console.log('PASS: six offline character routes, five full guides, 90 Fool cards, local images/links, build-tag navigation, enlarged typography, desktop layouts and all navigation entries.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
