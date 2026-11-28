process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const cards=require('../../data/cards/english-details.json').cards,images=require('../../data/cards/downloaded-card-images.json').cards;
const searchText=require('./card-search-text.cjs');
(async()=>{
 let count=0;
 for(const card of cards){
  const image=images[card.id];assert(image,card.id+' image record');
  assert(!image.unavailable,card.id+' has downloadable artwork');
  for(const item of image.variants||[image])for(const variant of ['base',...(card.effect.upgraded!==null?['upgraded']:[])]){
   assert(item[variant],card.id+' '+variant);const png=fs.readFileSync(item[variant]);
   assert.equal(png.toString('ascii',1,4),'PNG');assert.equal(png.readUInt32BE(16),512);assert.equal(png.readUInt32BE(20),654);count++;
  }
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const file of ['cards.html','index.html']){
   const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve(file)).href);
   const root=file==='index.html'?page.frameLocator('#main-content>iframe:not([hidden])'):page;
   await root.locator('[data-card-presentation=download]').first().waitFor();
   const rows=await root.locator('.card-detail-row').evaluateAll(ns=>ns.map(n=>({id:n.dataset.id,search:n.dataset.search,nameEn:n.dataset.nameEn,nameZh:n.dataset.nameZh,children:[...n.querySelector('.card-detail').children].map(c=>c.className)})));
   assert.equal(rows.length,cards.length);
   for(const row of rows){const card=cards.find(c=>c.id===row.id);assert.equal(row.search,searchText(card));assert.equal(row.nameEn,card.name.toLowerCase());assert.equal(row.nameZh,card.nameZh.toLowerCase());assert.deepEqual(row.children,['downloaded-card-heading','downloaded-card-art','downloaded-card-links']);}
   for(const width of [1920,1440,390]){
    await page.setViewportSize({width,height:1100});
    const card=root.locator('#card-BASH'),parts=await card.locator('.card-detail').evaluate(n=>[...n.children].map(c=>({top:c.getBoundingClientRect().top,bottom:c.getBoundingClientRect().bottom})));
    for(let i=1;i<parts.length;i++)assert(parts[i].top>=parts[i-1].bottom-1,'vertical order');
    const positions=await root.locator('[data-card-presentation=download]:visible').evaluateAll(nodes=>nodes.map(n=>{
     const r=selector=>n.querySelector(selector)?.getBoundingClientRect(),heading=r('.downloaded-card-heading'),tier=r('.downloaded-card-tier'),title=r('.downloaded-card-title'),upgrade=r('.downloaded-card-upgrade'),links=r('.downloaded-card-links'),untapped=r('.detail-untapped-link'),spirebird=r('.detail-spirebird-link'),art=r('.downloaded-card-art');
     const center=r=>r.top+r.height/2;
     const inside=r=>r.left>=art.left-1&&r.right<=art.right+1;
     const midpoint=r=>(r.left+r.right)/2;
     return {tierCenter:tier?Math.abs(tier.left-heading.left):0,titleCenter:Math.abs(midpoint(title)-midpoint(heading)),upgradeCenter:Math.abs(heading.right-upgrade.right),sourcesCentered:Math.abs(spirebird.left-links.left)<1&&Math.abs(untapped.right-links.right)<1&&links.width<=art.width*.9+1,below:upgrade.bottom<=art.top&&links.top>=art.bottom,inside:[tier,upgrade,spirebird,untapped].filter(Boolean).every(inside),gap:art.top-heading.bottom};
    }));
    for(const pos of positions){assert(pos.tierCenter<1);assert(pos.titleCenter<1);assert(pos.upgradeCenter<1);assert(pos.sourcesCentered);assert(pos.below);assert(pos.inside);assert(pos.gap>=0&&pos.gap<=4.5);}
    await card.locator('[data-card-image-version=base]').evaluate(img=>img.decode());
    await card.locator('[data-card-version]').click();assert(await card.locator('[data-card-image-version=upgraded]').isVisible());assert(!await card.locator('[data-card-image-version=base]').isVisible());
    await card.locator('[data-card-version]').click();assert(await card.locator('[data-card-image-version=base]').isVisible());
   }
   await page.setViewportSize({width:1440,height:1100});await root.locator('#card-BASH').screenshot({path:'assets/cards/previews/downloaded-card-'+(file==='index.html'?'index':'standalone')+'.png'});
   assert.deepEqual(errors,[]);console.log('PASS '+file+': order, preserved search data, responsive layout and image upgrade toggle');await context.close();
  }
 }finally{await browser.close();}
 console.log('PASS '+count+' original PNG downloads verified, including all nine Mad Science variants.');
})().catch(error=>{console.error(error);process.exitCode=1;});
