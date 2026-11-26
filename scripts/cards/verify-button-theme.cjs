process.chdir(require('node:path').resolve(__dirname, '../..'));
const path = require('node:path'), assert = require('node:assert/strict'), fs = require('node:fs');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const cases = [
      ['cards.html','#card-filter-type button[value=Attack]'],
      ['relics.html','[data-catalog-filter=pool][value=Ironclad]'],
      ['monsters.html','.monster-filters button[value=Underdocks]'],
      ['characters.html','.character-tile-link']
    ];
    for (const [file,selector] of cases) {
      const page = await browser.newPage({offline:true,viewport:{width:1440,height:1100}});
      await page.goto(pathToFileURL(path.resolve(file)).href);
      if (file==='cards.html') await page.locator('.filter-menu-toggle').click();
      const root = page;
      const button = root.locator(selector).first();
      await button.waitFor();
      await page.mouse.move(2,2);
      const style = await button.evaluate(node=>{
        const css=getComputedStyle(node);return {width:css.borderTopWidth,color:css.borderTopColor,radius:css.borderTopLeftRadius};
      });
      assert.deepEqual(style,{width:'1px',color:file==='relics.html'?'rgb(220, 108, 104)':'rgb(52, 68, 84)',radius:'8px'},file+' filter outline');
      await button.hover();
      assert.equal(await button.evaluate(node=>getComputedStyle(node).borderTopColor),file==='monsters.html'?'rgb(117, 183, 210)':file==='relics.html'?'rgb(220, 108, 104)':'rgb(35, 140, 194)',file+' hover outline');
      const summary=page.locator('.game-info-dropdown>summary');
      assert.equal(await summary.evaluate(node=>getComputedStyle(node).borderTopWidth),'1px');
      if(file==='monsters.html'){
        const frame=await page.locator('.monster-filters').evaluate(node=>{
          const box=node.getBoundingClientRect(),buttons=[...node.querySelectorAll('button')];
          return {color:getComputedStyle(node).borderTopColor,left:buttons[0].getBoundingClientRect().left-box.left,right:box.right-buttons.at(-1).getBoundingClientRect().right,font:getComputedStyle(buttons[0]).fontSize,height:buttons[0].getBoundingClientRect().height};
        });
        assert.equal(frame.color,'rgb(111, 174, 238)');
        assert.ok(Math.abs(frame.left-9)<1&&Math.abs(frame.right-9)<1,'monster area buttons fill the frame');
        assert.equal(frame.font,'20px');assert.equal(frame.height,48);
        await page.mouse.move(2,2);
        fs.mkdirSync('assets/monster/previews',{recursive:true});
        await page.screenshot({path:'assets/monster/previews/monster-shared-buttons-1440.png'});
      }
      console.log('PASS '+file+': ancient-style 1px outlines, 8px corners, blue hover');
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
