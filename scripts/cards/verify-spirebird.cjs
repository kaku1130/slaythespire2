process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const sourceIds=new Set(require('../../data/cards/source/spirebird-card-data.json').cards.map(card=>card.id));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({offline:true,viewport:{width:1440,height:1200}});
  await context.route('https://spirebird.com/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Spirebird link check</title>'}));
  const page=await context.newPage();
  for(const mode of ['standalone','index']){
   await page.goto(pathToFileURL(path.resolve(mode==='index'?'index.html':'cards.html')).href);
   const surface=mode==='index'?page.frameLocator('#main-content>iframe:not([hidden])'):page;
   const links=await surface.locator('.detail-spirebird-link').evaluateAll(nodes=>nodes.map(node=>({href:node.href,target:node.target,id:node.closest('[id^="card-"]').id.slice(5)})));
   assert.equal(links.length,569);
   assert.equal(await surface.locator('.detail-untapped-link').count(),569);
   const untapped=await surface.locator('.card-detail[data-catalog-layout]').evaluateAll(nodes=>nodes.map(n=>({source:n.querySelector('.detail-untapped-link').href,name:n.querySelector('.detail-name-en').getAttribute('href'),target:n.querySelector('.detail-untapped-link').target})));
   for(const link of untapped){assert.equal(link.name,null);assert.ok(link.source.startsWith('https://sts2.untapped.gg/en/cards'));assert.equal(link.target,'_blank');}
   for(const link of links){
    const url=new URL(link.href);
    assert.equal(url.origin,'https://spirebird.com');assert.equal(url.pathname,'/card.html');
    assert.equal(url.searchParams.get('id'),link.id);assert.ok(sourceIds.has(link.id));
    assert.equal(url.searchParams.get('resetRules'),'all');assert.equal(link.target,'_blank');
   }
   const card=surface.locator('#card-BASH .card-detail');
   const sizes=await card.evaluate(node=>{
    const pool=node.querySelector('[data-stat-character]>img').getBoundingClientRect();
    const heading=document.querySelector('.grid-pool-heading img').getBoundingClientRect();
    const link=node.querySelector('.detail-spirebird-link'),footer=link.getBoundingClientRect(),bounds=node.querySelector('.detail-card-sources').getBoundingClientRect(),left=node.querySelector('.detail-untapped-link').getBoundingClientRect();
    return {pool:[pool.width,pool.height],heading:[heading.width,heading.height],right:Math.abs(footer.right-bounds.right),left:Math.abs(left.left-bounds.left),last:node.querySelector('.detail-card-sources')===node.querySelector('.detail-overview').lastElementChild};
   });
   assert.deepEqual(sizes.pool,sizes.heading);assert.ok(sizes.right<1&&sizes.left<1);assert.equal(sizes.last,true);
   await card.locator('.detail-card-sources img').evaluateAll(nodes=>Promise.all(nodes.map(n=>n.decode())));
   const originalUrl=page.url(),popupPromise=page.waitForEvent('popup');
   await card.locator('.detail-spirebird-link').click();const popup=await popupPromise;
   assert.equal(new URL(popup.url()).searchParams.get('id'),'BASH');assert.equal(page.url(),originalUrl);await popup.close();
   if(mode==='standalone'){
    fs.mkdirSync('assets/cards/previews',{recursive:true});
    await card.screenshot({path:'assets/cards/previews/spirebird-card-footer.png'});
   }
  }
  console.log('PASS: 569 Spirebird card links, official icon loading, left/right bottom placement and Untapped links, matching pool icon sizes and new-tab behavior in cards/index.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
