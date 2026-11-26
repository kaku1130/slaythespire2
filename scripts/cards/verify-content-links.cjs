process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const {normalize,cardUrl}=require('./content-links.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({offline:true,viewport:{width:1440,height:1000}});
  await context.route('https://sts2.untapped.gg/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Link target verification</title>'}));
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const pages=['characters.html','cards.html','relics.html','potions.html'];
  let count=0;
  for(const file of pages){
   await page.goto(pathToFileURL(path.resolve(file)).href);
   const problems=await page.locator('a[href]').evaluateAll(nodes=>nodes.filter(node=>!node.hasAttribute('data-same-tab')).flatMap(node=>{
    const href=node.getAttribute('href');
    if(/cards\.html#card-|slaythespire2\.net\/(?:zh-TW\/)?(?:card|relic|potion)\/|wiki\.gg\/wiki\/Slay_the_Spire_2:/.test(href))return [href];
    if(/^https:\/\/sts2\.untapped\.gg\/en\/(?:cards|relics|potions)\//.test(href)&&node.target!=='_blank')return ['Missing new-tab target: '+href];
    return [];
   }));
   assert.deepEqual(problems,[],file);
   count+=await page.locator('a[href^="https://sts2.untapped.gg/en/cards/"],a[href^="https://sts2.untapped.gg/en/relics/"],a[href^="https://sts2.untapped.gg/en/potions/"]').count();
  }
  for(const mode of ['standalone','index']){
   await page.goto(pathToFileURL(path.resolve(mode==='index'?'index.html':'characters.html')).href);
   if(mode==='index')await page.locator('.site-nav>a[aria-label=Characters]').click();
   const surface=mode==='index'?page.frameLocator('#main-content>iframe:not([hidden])'):page;
   await surface.locator('.character-tile[data-character=ironclad] .character-tile-link').click();
   await surface.locator('#character-ironclad').waitFor({state:'visible'});
   const link=surface.locator('#character-ironclad a[href="https://sts2.untapped.gg/en/cards/ironclad/anger"]').first();
   const destination=await link.getAttribute('href');
   const originalUrl=page.url();
   const popupPromise=page.waitForEvent('popup');
   await link.click();const popup=await popupPromise;
   assert.ok(popup.url()===destination||popup.url()==='about:blank');
   assert.equal(page.url(),originalUrl);
   assert.equal(await surface.locator('#character-ironclad').isVisible(),true);
   await popup.close();
  }
  const special=require('../../data/cards/special-cards.json').cards.find(item=>item.detail.id==='SOVEREIGN_BLADE').detail;
  assert.equal(cardUrl(special),'https://sts2.untapped.gg/en/cards/token/sovereign-blade');
  const sample='<a href="cards.html#card-ANGER">Anger</a>';
  assert.equal(normalize(normalize(sample)),normalize(sample),'Link normalization is stable');
  assert.deepEqual(errors,[]);
  console.log('PASS: '+count+' Untapped resource links, special card URLs and new-window behavior in standalone and index.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
