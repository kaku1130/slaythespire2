process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const variants=require('../../data/cards/downloaded-card-images.json').cards.MAD_SCIENCE.variants;
(async()=>{
 assert.equal(variants.length,9);
 const hashes=variants.flatMap(v=>['base','upgraded'].map(version=>crypto.createHash('sha256').update(fs.readFileSync(v[version])).digest('hex')));assert.equal(new Set(hashes).size,18,'all variant/version downloads differ');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{for(const file of ['cards.html','index.html']){
  const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(file)).href);const root=file==='index.html'?page.frameLocator('#main-content>iframe:not([hidden])'):page;
  const search=root.locator('#search');await search.fill('"Mad Science"');await page.waitForTimeout(550);
  const card=root.locator('#card-MAD_SCIENCE'),previous=card.locator('[data-card-variant-step="-1"]'),nextArrow=card.locator('[data-card-variant-step="1"]'),button=card.locator('[data-card-version]');
  assert(await card.isVisible());assert.equal(await card.locator('select').count(),0);assert.equal(await card.locator('[data-card-variant-step]').count(),2);assert(!(await button.isDisabled()));assert.equal(await card.locator('.downloaded-card-unavailable').count(),0);
  async function checkImage(variant,version){
   const image=card.locator('.downloaded-card-image:visible');assert.equal(await image.count(),1);assert.equal(await image.getAttribute('data-card-variant'),variant.slug);assert.equal(await image.getAttribute('data-card-image-version'),version);assert.equal(await image.getAttribute('src'),variant[version]);await image.evaluate(img=>img.decode());
   assert.equal(await card.locator('.detail-untapped-link').getAttribute('href'),variant.source);assert.equal(await button.getAttribute('aria-pressed'),String(version==='upgraded'));
  }
  for(const [index,variant] of variants.entries()){
   await checkImage(variant,'base');await button.click();await checkImage(variant,'upgraded');
   await button.evaluate(n=>Promise.all(n.getAnimations().map(animation=>animation.finished)));
   assert.equal(await button.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(127, 255, 0)','upgrade uses green');
   const next=variants[(index+1)%variants.length];await nextArrow.click();await checkImage(next,'upgraded');await button.click();await checkImage(next,'base');
  }
  await previous.click();await checkImage(variants.at(-1),'base');await nextArrow.click();await checkImage(variants[0],'base');
  await nextArrow.focus();await nextArrow.press('Enter');await checkImage(variants[1],'base');
  await search.fill('Wisdom');await page.waitForTimeout(550);assert(await card.isVisible(),'variant name is searchable');
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1100});const bounds=await card.locator('[data-card-presentation]').evaluate(n=>{const r=n.getBoundingClientRect(),s=n.querySelector('[data-card-variant-step="1"]').getBoundingClientRect();return{left:s.left>=r.left,right:s.right<=r.right};});assert(bounds.left&&bounds.right,'arrow fits the card');
  }
  await page.setViewportSize({width:1440,height:1100});while(await card.locator('[data-card-presentation]').getAttribute('data-card-variant')!==variants[4].slug)await nextArrow.click();await button.click();await card.screenshot({path:'assets/cards/previews/mad-science-'+(file==='index.html'?'index':'standalone')+'.png'});
  await page.reload();await search.fill('"Mad Science"');await page.waitForTimeout(550);assert.equal(await card.locator('[data-card-presentation]').getAttribute('data-card-variant'),variants[0].slug,'reload uses default variant');await checkImage(variants[0],'base');
  assert.deepEqual(errors,[]);console.log('PASS '+file+': nine arrow-switched variants, keyboard, 18 images, green upgrade button, links/search, compact layout and default reset');await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
