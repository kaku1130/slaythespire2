process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const cards=JSON.parse(fs.readFileSync('data/cards/english-details.json','utf8')).cards;
const {comments}=require('../../data/cards/creator-comments.json');
const {characters}=require('../../data/cards/creator-tiers.json');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({offline:true,viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve('Cards.html')).href);
  assert.equal(await page.locator('[data-catalog-layout]').count(),cards.length);
  assert.equal(await page.locator('[data-card-version=base]').count(),0);
  assert.equal(await page.locator('[data-card-version=upgraded]').count(),cards.length);
  assert.deepEqual(await page.locator('[data-catalog-layout] .detail-overview').evaluateAll(nodes=>[...new Set(nodes.map(node=>[...node.children].map(child=>child.tagName).join(',')))]),['FIGURE,HEADER,DL,SECTION']);
  for(const card of cards){
   const row=page.locator('#card-'+card.id);
   assert.equal(await row.locator('.detail-name-zh').getAttribute('href'),await row.locator('.detail-name-en').getAttribute('href'),card.id+' shared name link');
   assert.equal(await row.locator('[data-card-version=upgraded]').isDisabled(),card.effect.upgraded===null,card.id);
   if(/^Cost changes from/.test(card.effect.upgraded||'')){
    const descriptions=await row.locator('.detail-panel-description').allTextContents();
    if(/^Cost changes from\s+(?:\d+|X)\s+to\s+(?:\d+|X)\.?$/i.test(card.effect.upgraded))assert.equal(descriptions[1],descriptions[0],card.id+' full upgraded effect');
    if(card.id==='PROTECTOR')assert.ok(descriptions[1].includes('15 damage'), 'Preserve upgraded damage alongside cost changes');
    assert.ok(!descriptions[1].includes('Cost changes from'));
   }
  }
  const renderedRatings=await page.locator('[data-catalog-layout]').evaluateAll(nodes=>nodes.map(node=>({
   id:node.closest('[id^="card-"]').id.slice(5),
   label:node.querySelector('.creator-tier-badge')?.textContent,
   comment:node.querySelector('.detail-tier-comment')?.textContent,
   source:node.querySelector('.detail-tier-source')?.getAttribute('href'),
   sourceName:node.querySelector('.detail-tier-source')?.textContent
  })));
  for(const rating of renderedRatings){
   const card=cards.find(card=>card.id===rating.id),list=characters[card.character]?.Jorbs;
   if(list){const tier=list.ratings[card.id];assert.equal(rating.label,tier||'—',card.id);}
   if(comments[card.id]){
    assert.equal(rating.comment,comments[card.id].text.replace(/\r?\n/g,''),card.id+' Jorbs commentary');
    assert.equal(rating.source,list.url);assert.equal(rating.sourceName,list.name);
   }
  }
  assert.equal(await page.locator('.detail-tier-section:not([hidden])').count(),0,'Commentary defaults closed');
  for(const width of [1440,1024]){
   await page.setViewportSize({width,height:1100});
   await page.locator('#search').fill('Bash');
   const card=page.locator('#card-BASH');
   const base=card.locator('.detail-effect-panel[aria-label=Base]'),upgraded=card.locator('.detail-effect-panel[aria-label=Upgraded]');
   assert.equal(await base.isVisible(),true);
   assert.equal(await upgraded.isVisible(),false);
   const baseText=await base.locator('.detail-panel-description').textContent();
   await card.locator('[data-card-version=upgraded]').click();
   assert.equal(await upgraded.isVisible(),true);
   assert.equal(await base.isVisible(),false);
   assert.notEqual(await upgraded.locator('.detail-panel-description').textContent(),baseText);
   assert.equal(await card.locator('[data-card-version=upgraded]').getAttribute('aria-pressed'),'true');
   assert.equal(await card.locator('[data-card-version=upgraded]').evaluate(node=>getComputedStyle(node).color),'rgb(127, 255, 0)');
   await card.locator('[data-card-version=upgraded]').press('Enter');
   assert.equal(await card.locator('[data-card-version=upgraded]').getAttribute('aria-pressed'),'false');
   assert.notEqual(await card.locator('[data-card-version=upgraded]').evaluate(node=>getComputedStyle(node).color),'rgb(127, 255, 0)');
   assert.equal(await base.isVisible(),true);
   const costRow=await card.evaluate(row=>{
    const panel=row.querySelector('.detail-effect-panel:not([hidden])');
    const cost=panel.querySelector('.detail-panel-cost').getBoundingClientRect();
    const button=row.querySelector('[data-card-version]').getBoundingClientRect();
    const block=row.querySelector('.detail-effect-columns').getBoundingClientRect();
    return {center:Math.abs((cost.left+cost.right-block.left-block.right)/2),row:Math.abs((cost.top+cost.bottom-button.top-button.bottom)/2),right:button.right<=block.right};
   });
   assert.ok(costRow.center<1&&costRow.row<2&&costRow.right,'Upgrade toggle shares the independently centered cost row');
   const layout=await card.evaluate(row=>{
    const card=row.querySelector('.card-detail'),art=card.querySelector('.detail-art').getBoundingClientRect(),bounds=card.getBoundingClientRect();
    const selectors=['.detail-art','.detail-name-zh','.detail-name-en','.detail-type-metadata','.detail-effects','.detail-version-controls','.detail-bottom-tier'];
    return {center:Math.abs((art.left+art.right-bounds.left-bounds.right)/2),tops:selectors.map(selector=>card.querySelector(selector).getBoundingClientRect().top),align:['.detail-title','.detail-panel-description'].map(selector=>getComputedStyle(card.querySelector(selector)).textAlign),metadata:[...card.querySelector('.detail-type-metadata').children].map(node=>node.querySelector('dt').textContent),overflow:card.scrollWidth>card.clientWidth};
   });
   assert.ok(layout.center<2);
   assert.ok(Math.abs(layout.tops[1]-layout.tops[2])<2,'Short Chinese and English names share a row');
   assert.deepEqual(layout.tops,[...layout.tops].sort((a,b)=>a-b));
   assert.deepEqual(layout.align,['center','center']);
   assert.deepEqual(layout.metadata,['Character','Type','Rarity']);assert.equal(layout.overflow,false);
  }
  await page.setViewportSize({width:390,height:1100});
  const phoneNames=await page.locator('#card-BASH .detail-title').evaluate(node=>[node.querySelector('.detail-name-zh').getBoundingClientRect().top,node.querySelector('.detail-name-en').getBoundingClientRect().top]);
  assert.ok(phoneNames[1]>phoneNames[0],'Phone names use two rows');
  await page.setViewportSize({width:1440,height:1100});
  await page.locator('#search').fill('Body Slam');
  const slam=page.locator('#card-BODY_SLAM');
  assert.ok((await slam.locator('[aria-label="Base energy cost"]').textContent()).includes('1'));
  await slam.locator('[data-card-version=upgraded]').click();
  assert.ok((await slam.locator('[aria-label="Upgraded energy cost"]').textContent()).includes('0'));
  await page.evaluate(()=>location.hash='card-CRESCENT_SPEAR');
  const starCard=page.locator('#card-CRESCENT_SPEAR');await starCard.waitFor({state:'visible'});
  const starOverlap=await starCard.evaluate(row=>{
   const stars=row.querySelector('.detail-effect-panel:not([hidden]) .detail-panel-stars').getBoundingClientRect();
   const button=row.querySelector('[data-card-version]').getBoundingClientRect();
   return stars.right>button.left;
  });
  assert.equal(starOverlap,false,'Star cost must not overlap the upgrade toggle');
  await page.evaluate(()=>location.hash='card-BASH');
  await page.locator('#card-BASH').waitFor({state:'visible'});
  await page.locator('#search').fill('');
  await page.locator('#card-BASH .detail-art img').evaluate(node=>node.decode());
  fs.mkdirSync('assets/cards/previews',{recursive:true});
  await page.screenshot({path:'assets/cards/previews/card-version-layout-1440.png'});
  await page.locator('#card-BASH .card-detail').screenshot({path:'assets/cards/previews/card-version-single.png'});
  await page.locator('#card-BASH [data-card-version=upgraded]').click();
  await page.locator('#card-BASH .card-detail').screenshot({path:'assets/cards/previews/card-version-upgraded.png'});
  await page.setViewportSize({width:1440,height:2200});
  await page.locator('#search').fill('Offering');
  const offering=page.locator('#card-OFFERING');
  assert.equal(await offering.locator('.creator-tier-badge').textContent(),'S');
  assert.equal(await offering.locator('.detail-tier-comment').textContent(),comments.OFFERING.text);
  assert.equal(await offering.locator('.detail-tier-section').isVisible(),false);
  const tierDialog=page.locator('#card-tier-dialog');
  await offering.locator('.creator-tier-badge').click();
  assert.equal(await tierDialog.isVisible(),true);
  assert.equal(await tierDialog.locator('.detail-tier-comment').textContent(),comments.OFFERING.text);
  assert.equal(await tierDialog.locator('.detail-tier-source').textContent(),'Jorbs Ironclad Tier List');
  await page.keyboard.press('Escape');
  assert.equal(await tierDialog.isVisible(),false);
  await offering.locator('.detail-tier-trigger').press('Enter');
  assert.equal(await tierDialog.isVisible(),true);
  await tierDialog.locator('.tier-dialog-close').click();
  assert.equal(await tierDialog.isVisible(),false);

  await offering.locator('.detail-art img').evaluate(node=>node.decode());
  await offering.locator('.card-detail').screenshot({path:'assets/cards/previews/offering-tier-comment.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: 569 card layouts, single-button upgrade toggling and green state, upgrade availability, cost changes, content order and desktop alignment.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
