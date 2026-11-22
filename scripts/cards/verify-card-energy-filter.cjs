process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const cards=JSON.parse(fs.readFileSync('data/cards/english-details.json','utf8')).cards;
const base=card=>(card.stats.find(stat=>stat.label==='Energy cost')?.value||'').split('→')[0].replace(/<[^>]*>/g,'').trim();
const matches=(card,value)=>(value==='X'&&card.id==='STARDUST')||(value==='3+'?/^\d+$/.test(base(card))&&Number(base(card))>=3:base(card)===value);
const ids=cards=>cards.map(card=>card.id).sort();
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1000}}),errors=[];
   if(mode==='website')await context.route('http://cards.test/**',async route=>{
    const requested=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));
    assert(!path.relative(process.cwd(),requested).startsWith('..'));
    const ext=path.extname(requested),type={'.html':'text/html','.css':'text/css','.js':'application/javascript','.webp':'image/webp','.svg':'image/svg+xml'}[ext]||'application/octet-stream';
    await route.fulfill({status:200,contentType:type,body:fs.readFileSync(requested)});
   });
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   const url=mode==='file'?pathToFileURL(path.resolve('card.html')).href:'http://cards.test/card.html';
   await page.goto(url);
   const group=page.locator('#card-filter-energy'),button=value=>group.locator('button').filter({hasText:new RegExp('^'+value.replace('+','\\+')+'$')});
   const gainButton=group.locator('button[value=gain]');
   assert.deepEqual(await group.locator('button').allTextContents(),['0','1','2','3+','X','Gain Energy']);
   assert.equal(await gainButton.getAttribute('aria-label'),'增加能量');
   assert.equal(await group.locator('button>.energy-resource-icon').count(),6,'each option has an energy icon');
   assert(await group.locator('.energy-resource-icon').first().evaluate(icon=>getComputedStyle(icon).backgroundImage!=='none'),'energy artwork loaded');
   const energyBox=await group.boundingBox(),tierBox=await page.locator('#card-filter-tier').boundingBox();
   assert(energyBox.y>=tierBox.y+tierBox.height,'Energy below Tier');
   await page.locator('#card-filter-character button[value=Ironclad]').click();
   const visible=()=>page.locator('.card-detail-row:not([hidden])').evaluateAll(rows=>rows.map(row=>row.dataset.id).sort());
   for(const value of ['0','1','2','3+','X']){
    await button(value).click();
    assert.deepEqual(await visible(),ids(cards.filter(card=>matches(card,value))),mode+' '+value+' costs');
    assert.equal(await button(value).getAttribute('aria-pressed'),'true');
    assert((await button(value).evaluate(node=>getComputedStyle(node,'::after').content)).includes('✓'),'selected energy shows check');
    await button(value).click();
   }
   await page.locator('#card-filter-character button[value=Regent]').click();
   await button('X').click();
   assert((await visible()).includes('STARDUST'),'Regent X includes Stardust exception');
   await button('X').click();await button('0').click();
   assert((await visible()).includes('STARDUST'),'Stardust retains its actual 0 energy cost');
   await button('0').click();
   await page.locator('#card-filter-character button[value=Regent]').click();
   await gainButton.click();
   const gains=await visible();
   for(const id of ['BLOODLETTING','ADRENALINE','OFFERING','CHARGE_BATTERY','SUNDER','AUTOMATION','DOUBLE_ENERGY','FUSION','IGNITION','METEOR_STRIKE'])assert(gains.includes(id),'includes energy gain '+id);
   for(const id of ['STRIKE_IRONCLAD','CORRUPTION','ALL_FOR_ONE','BANSHEES_CRY','ADAPTIVE_STRIKE','TRANSFIGURE','MOMENTUM_STRIKE','SYNTHESIS','DANSE_MACABRE'])assert(!gains.includes(id),'excludes costs/discounts '+id);
   assert((await gainButton.evaluate(node=>getComputedStyle(node,'::after').content)).includes('✓'));
   await button('0').click();
   assert.deepEqual(await visible(),ids(cards.filter(card=>gains.includes(card.id)&&matches(card,'0'))),'0 cost AND energy gain');
   assert((await visible()).includes('BLOODLETTING'));
   await button('0').click();await button('2').click();
   await page.reload();
   assert.equal(await gainButton.getAttribute('aria-pressed'),'true','gain toggle restored');
   assert.deepEqual(await visible(),ids(cards.filter(card=>gains.includes(card.id)&&matches(card,'2'))),'combined gain/cost selection restored');
   await gainButton.click();await button('2').click();
   await button('0').click();await button('2').click();
   assert.deepEqual(await visible(),ids(cards.filter(card=>matches(card,'0')||matches(card,'2'))),'multi-select union');
   await button('0').click();await button('2').click();
   await button('1').click();
   assert((await visible()).includes('AUTOMATION'),'Automation uses base cost 1');
   await button('1').click();await button('0').click();
   assert(!(await visible()).includes('AUTOMATION'),'upgraded cost 0 does not override base cost');
   await button('0').click();await button('1').click();
   await page.locator('#card-filter-character button[value=Ironclad]').click();
   await page.locator('#card-filter-type button[value=Attack]').click();
   assert.deepEqual(await visible(),ids(cards.filter(card=>card.character==='Ironclad'&&card.type==='Attack'&&matches(card,'1'))),'AND with character and type');
   await gainButton.click();
   await page.locator('#search').fill('Automation');
   assert.equal(await group.locator('[aria-pressed=true]').count(),0,'search resets energy');
   await page.locator('#search').fill('');
   await page.locator('#card-filter-character button[value=Ironclad]').click();
   await button('2').click();
   await page.reload();
   assert.equal(await button('2').getAttribute('aria-pressed'),'true','energy selection restored');
   assert.deepEqual(await visible(),ids(cards.filter(card=>matches(card,'2'))),'restored filter applied');
   if(mode==='file')assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sts2_card_filters')).energies),['2']);
   else assert.deepEqual(JSON.parse(decodeURIComponent((await context.cookies()).find(cookie=>cookie.name==='sts2_card_filters').value)).energies,['2']);
   await page.goto(url+'#card-AUTOMATION');
   assert.equal(await group.locator('[aria-pressed=true]').count(),0,'card deep link clears energy');
   assert((await visible()).includes('AUTOMATION'));
   const menu=page.locator('.filter-menu-toggle');await menu.click();assert(!await group.isVisible());await menu.click();assert(await group.isVisible());
   await button('X').click();
   const eligible=await page.locator('.card-detail-row:not([hidden]) .detail-name-en').allTextContents();
   assert(eligible.length>0);
   await page.evaluate(()=>Math.random=()=>0);await page.locator('#aoe-toggle').click();
   assert.equal(await page.locator('#search').inputValue(),'"'+eligible[0]+'"','random respects Energy');
   assert.deepEqual(errors,[]);
   console.log('PASS '+mode+': all energy groups, base costs, multi-select/AND, persistence, search/reset, deep links, menu toggle and random card.');
   if(mode==='file'){
    await page.locator('#search').fill('');
    await gainButton.click();
    await page.screenshot({path:'assets/cards/previews/energy-filter-1440.png'});
   }
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
