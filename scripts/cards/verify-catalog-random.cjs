process.chdir(require('node:path').resolve(__dirname,'../..'));
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    for(const width of [1440,390]) {
      const page=await browser.newPage({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600});
      for(const kind of ['card','relic','potion']) {
        await page.goto(pathToFileURL(path.resolve(kind+'.html')).href);
        const isCard=['card','card1'].includes(kind);
        const button=page.locator(isCard?'#aoe-toggle':'.catalog-random');
        assert.equal(await button.count(),1);assert.equal(await button.textContent(),'🎲');
        const names=await page.locator(isCard?'.card-scroll .name-en':kind==='relic'?'.entry .relic-name-en':'.entry .catalog-name-en').allTextContents();
        const layout=await button.evaluate(button=>{
          const r=button.getBoundingClientRect(),field=document.querySelector('.search-control').getBoundingClientRect(),toolbar=button.parentElement.getBoundingClientRect();
          return {right:r.right,fieldRight:field.right,top:r.top,fieldTop:field.top,fits:r.right<=toolbar.right+1};
        });
        assert.ok(layout.right>layout.fieldRight&&layout.fits);assert.ok(Math.abs(layout.top-layout.fieldTop)<1);
        if(!isCard)await page.locator('[data-catalog-filter]').first().click();
        for(const random of [0,.5,.999]) {
          await page.evaluate(value=>Math.random=()=>value,random);
          await button.click();
          const expected=names[Math.floor(random*names.length)].trim();
          assert.equal(await page.locator('#search').inputValue(),'"'+expected+'"');
          const visible=await page.locator(isCard?'.card-detail-row:not([hidden])':'.entry:not([hidden])').allTextContents();
          assert.ok(visible.length>0);assert.ok(visible.some(text=>text.includes(expected)));
          const shownNames=await page.locator(isCard?'.card-detail-row:not([hidden]) .name-en':kind==='relic'?'.entry:not([hidden]) .relic-name-en':'.entry:not([hidden]) .catalog-name-en').allTextContents();
          assert.ok(shownNames.every(name=>name.trim().toLowerCase()===expected.toLowerCase()),'only exact names are shown');
          await page.locator('#search').fill('"'+expected+' incomplete"');
          assert.equal(await page.locator(isCard?'.card-detail-row:not([hidden])':'.entry:not([hidden])').count(),0,'quoted partial names do not match');
          assert.equal(await page.locator('[data-catalog-filter][aria-pressed=true]').count(),0);
        }
        console.log('PASS '+kind+' '+width+'px: right-side dice, random English-name search, filters reset and matching entries shown');
      }
      await page.close();
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
