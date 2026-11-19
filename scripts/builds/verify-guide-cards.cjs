process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const guide=JSON.parse(fs.readFileSync('data/builds/guide.json','utf8'));
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try {
 if(process.argv.includes('--preview')) {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(pathToFileURL(path.resolve('build.html')).href);
  await page.evaluate(()=>document.querySelector('.tier-index-item').click());
  const image=path.join(require('node:os').tmpdir(),'slaythespire2-build-card-preview.png');
  await page.locator('.build-guide-card:visible').first().evaluate(node=>node.scrollIntoView({block:'start'}));await page.locator('.build-guide-card:visible').first().locator('img').evaluateAll(async nodes=>{for(const n of nodes)n.loading='eager';await Promise.all(nodes.map(n=>n.decode()));});await page.screenshot({path:image});console.log(image);return;
 }
 for(const width of [1440,1920]) {
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('build.html')).href);
  const duplicates=await page.locator('[id]').evaluateAll(nodes=>nodes.map(n=>n.id).filter((id,index,ids)=>ids.indexOf(id)!==index));assert.deepEqual(duplicates,[],'unique card headings');
  assert.equal(await page.locator('.build-pair-images').count(),0,'old card pairs removed');
  for(const build of guide.builds) {
   const id='build-'+build.character+'-'+build.id;
   await page.evaluate(id=>document.querySelector('.tier-index-item[href="#'+id+'"]').click(),id);
   const panel=page.locator('#'+id);assert.ok(await panel.isVisible(),id);
   if(build===guide.builds[0]) {
    const type=panel.locator('.detail-effect-panel h4').first();assert.equal(await type.evaluate(n=>getComputedStyle(n).fontSize),'13px');
    assert.equal(await type.evaluate(n=>getComputedStyle(n).color),'rgb(170, 184, 203)');
    const font=await panel.locator('.detail-title').first().evaluate(n=>getComputedStyle(n).fontSize);
    assert.equal(await panel.locator('.detail-title a').first().evaluate(n=>getComputedStyle(n).fontSize),font);
   }
   for(const [index,role] of ['core','support'].entries()) {
    const group=panel.locator('.build-guide-cards').nth(index);
    assert.deepEqual((await group.locator('.build-guide-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.cardId))).sort(),[...build[role]].sort());
    const bad=await group.evaluate(group=>{
     const r=group.getBoundingClientRect();return [...group.children].filter(n=>{const b=n.getBoundingClientRect();return Math.abs(b.width-r.width)>1||b.left<r.left-1||b.right>r.right+1;}).length;
    });assert.equal(bad,0,id+' '+role+' one full-width column');
    for(const card of await group.locator('.card-detail').all()) {
     assert.equal(await card.locator('.detail-keyword').count(),0);
     assert.equal(await card.locator('.detail-meta :is(.detail-character,.detail-rarity,.detail-type)').count(),0);
     const statLabels=await card.locator('.detail-stats dt').allTextContents();
     for(const label of ['Character','Rarity','Type'])assert.equal(statLabels.filter(value=>value===label).length,1,label+' appears once in Card Stats');
     assert.equal(await card.locator('.detail-title a').count(),2);assert.equal(await card.locator('.detail-art img').count(),1);
     assert.equal(await card.locator('[data-detail-row="5"]').count(),1);assert.equal(await card.locator('[data-detail-row="6"]').count(),1);
     const widths=await card.evaluate(card=>{const art=card.querySelector('.detail-art').getBoundingClientRect();return [...card.children].every(n=>{const b=n.getBoundingClientRect();return b.left>=art.left-1&&b.right<=art.right+1;});});assert.ok(widths,id+' card content aligns to art');
    }
   }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS '+width+'px: all 25 guides, core/support membership, unique headings, full-width single-column card details');
  await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
