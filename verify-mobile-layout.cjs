const { chromium } = require('C:/Users/TBKC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try {
  const page = await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for (const width of [390,320,760,1280]) {
   await page.setViewportSize({width,height:844});
   for(const name of ['cards','builds','relic','potion','event','monster','ancient']) {
    await page.goto(pathToFileURL(path.resolve('github/slaythespire2/'+name+'.html')).href);
    await page.waitForTimeout(200);
    const mobile=width<=760;
    if(mobile && name==='builds') {
     assert.equal(await page.locator('.mobile-menu-toggle').count(),0);
     assert.ok(await page.locator('.character-sidebar').isVisible());
     await page.locator('.character-nav a').first().click();
     assert.ok(await page.locator('.tier-sidebar').isVisible());
    }
    if(mobile && ['relic','potion','event'].includes(name)) {
     const columns=await page.locator('.catalog').first().evaluate(e=>getComputedStyle(e).gridTemplateColumns);
     assert.equal(columns.split(' ').length,1,name+' should have one full-width column');
    }
    if(mobile && name==='ancient') {
     assert.deepEqual(await page.locator('.ancient-act-section').evaluateAll(es=>es.map(e=>e.dataset.act)),['1','2','3','0']);
     assert.equal(await page.locator('.compact-detail-item').first().evaluate(e=>getComputedStyle(e).justifyContent),'center');
    }
    assert.equal(await page.locator('.site-brand>span').isVisible(),!mobile);
    assert.ok(await page.locator('.site-nav a').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().right<=innerWidth+1)),name+' navigation overflow');
    if(mobile && await page.locator('.mobile-filter-panel').count()){
     assert.ok(await page.locator('.mobile-filter-panel').evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')));
     await page.locator('.mobile-menu-toggle').click();
     assert.equal(await page.locator('.mobile-menu-toggle').getAttribute('aria-expanded'),'true');
     if(['relic','potion','event'].includes(name)) {
      const button=page.locator('.filters button[data-filter-group],.filters button[data-rarity-filter]').first();
      await button.click();
      await page.waitForTimeout(300);
      assert.equal(await button.evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
      await button.click();
     }
    }
    if(await page.locator('#search').count()) {
     assert.equal(await page.locator('.mobile-search-row #search').count(),mobile?1:0);
     if(mobile) {
      const before=await page.locator('#search').boundingBox();
      await page.locator('#main-content').evaluate(e=>e.scrollTop=600);
      const after=await page.locator('#search').boundingBox();
      assert.ok(Math.abs(before.y-after.y)<2,name+' search not sticky');
      const filters=page.locator('#tools,.filters').first();
      assert.ok((await filters.boundingBox()).y<after.y,name+' filters did not scroll');
      await page.locator('#main-content').evaluate(e=>e.scrollTop=0);
      await page.locator('#search').fill('不存在xyz');
      await page.locator('#search').fill('');
     }
    }
    if(name==='cards'&&mobile) {
     assert.equal(await page.locator('body').getAttribute('data-view'),'grid');
     assert.equal(await page.locator('.presentation-controls').isVisible(),false);
     assert.equal(await page.locator('.chips button').first().evaluate(e=>getComputedStyle(e).fontSize),'0px');
     assert.equal(await page.locator('#upgrade-toggle .mobile-upgrade-icon').isVisible(),true);
     await page.locator('#upgrade-toggle').click();
     assert.equal(await page.locator('#upgrade-toggle').getAttribute('aria-pressed'),'true');
     await page.locator('#aoe-toggle').click();
     await page.locator('#aoe-toggle').click();
     assert.equal(await page.locator('.mobile-search-row>#upgrade-toggle').count(),1);
     assert.equal(await page.locator('[data-type-filter="Skill"] + #aoe-toggle').count(),1);
     const skillBox=await page.locator('[data-type-filter="Skill"]').boundingBox();
     const aoeBox=await page.locator('#aoe-toggle').boundingBox();
     assert.ok(Math.abs(skillBox.y-aoeBox.y)<2 && aoeBox.x>skillBox.x);
     for(const id of ['upgrade-toggle','aoe-toggle']) {
      assert.equal((await page.locator('#'+id).boundingBox()).width,44);
      assert.ok(await page.locator('#'+id+' .mobile-toggle-label').isHidden());
     }
     const selected=await page.locator('.chips button').first().getAttribute('aria-pressed');
     await page.locator('.chips button').first().click();
     assert.equal(await page.locator('.chips button').first().getAttribute('aria-pressed'),String(selected!=='true'));
     if(width===390)await page.screenshot({path:'mobile-layout-cards.png'});
     await page.locator('.mobile-menu-toggle').click();
     assert.ok(await page.locator('#tools').isHidden());
     assert.ok(await page.locator('#upgrade-toggle').isVisible());
     await page.locator('#upgrade-toggle').click();
     assert.equal(await page.locator('#upgrade-toggle').getAttribute('aria-pressed'),'false');
    }
    console.log('PASS',width,name);
    if(width===390 && ['relic','potion','event','ancient','builds'].includes(name)) await page.screenshot({path:'mobile-layout-'+name+'.png'});
   }
  }
  assert.deepEqual(errors,[]);
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
