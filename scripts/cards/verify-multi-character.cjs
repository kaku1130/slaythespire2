process.chdir(require('node:path').resolve(__dirname,'../..'));
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    for(const width of [1440,390])for(const file of ['Cards.html','card1.html'].filter(file=>require('node:fs').existsSync(file))) {
      const page=await browser.newPage({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(pathToFileURL(path.resolve(file)).href);
      const chosen=()=>page.locator('#card-filter-character button[aria-pressed=true]').evaluateAll(nodes=>nodes.map(n=>n.value));
      assert.deepEqual(await chosen(),['Ironclad']);
      assert.equal(await page.locator('.card-detail').count(),503);
      for(const pool of ['Curse','Event','Quest']) {
        assert.equal(await page.locator('section[data-pool="'+pool+'"]').count(),0);
        assert.equal(await page.locator('#card-filter-character button[value="'+pool+'"]').count(),0);
      }
      await page.locator('#search').fill("Ascender's Bane");
      assert.ok(await page.locator('#empty').isVisible());
      assert.equal(await page.locator('#card-filter-character button[value=Curse]').count(),0);
      await page.locator('#search').fill('');
      await page.locator('#card-filter-character button[value=Silent]').click();
      assert.deepEqual(await chosen(),['Ironclad','Silent']);
      await page.locator('#card-filter-character button[value=Ironclad]').click();
      assert.deepEqual(await chosen(),['Silent']);
      for(const [query,pool,id] of [['Dark Embrace','Ironclad','DARK_EMBRACE'],['側步','Silent','SCARE'],['Alignment','Regent','ALIGNMENT']]) {
        await page.locator('#search').fill(query);
        assert.ok((await chosen()).includes(pool),query);
        assert.ok(await page.locator('#card-'+id).isVisible(),query);
        const pools=await page.locator('.card-detail-row:not([hidden])').evaluateAll(rows=>rows.map(r=>r.closest('section[data-pool]').dataset.pool));
        assert.deepEqual([...new Set(pools)].sort(),(await chosen()).sort());
      }
      await page.locator('#search').fill('Strike');
      assert.ok((await chosen()).length>1,'shared keyword selects multiple characters');
      const before=await chosen();
      await page.locator('#search').fill('no-such-card-xyz');assert.deepEqual(await chosen(),before);assert.ok(await page.locator('#empty').isVisible());
      await page.locator('.search-clear').click();assert.deepEqual(await chosen(),before);
      for(const value of [0,.5,.999]){await page.evaluate(v=>Math.random=()=>v,value);await page.locator('#aoe-toggle').click();assert.ok((await chosen()).length>=1);const shown=await page.locator('.card-detail-row:not([hidden])').count();assert.ok(shown>0);}
      assert.deepEqual(errors,[]);await page.close();console.log('PASS '+file+' '+width+'px: multiple characters, Ironclad default, bilingual/name search sync, random search and empty state');
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
