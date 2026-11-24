process.chdir(require('node:path').resolve(__dirname,'../..'));
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
async function main(){
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const width of [390,1440,1920]){
   const page=await browser.newPage({viewport:{width,height:1100},isMobile:width===390,hasTouch:width===390});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(pathToFileURL(path.resolve('Cards.html')).href);
   const dialog=page.locator('#card-effect-dialog');
   assert.equal(await dialog.count(),1);assert.equal(await page.locator('button button').count(),0);
   const vulnerable=page.locator('#card-BASH .detail-effect-panel').first().locator('[data-effect-tooltip]').filter({hasText:'Vulnerable'});
   await vulnerable.dblclick();assert.equal(await page.locator('#search').inputValue(),'Vulnerable');
   await page.waitForTimeout(450);assert.ok(!await dialog.isVisible());await page.locator('#search').fill('');
   await vulnerable.click();await dialog.waitFor({state:'visible'});
   assert.equal(await page.locator('#card-effect-dialog-title').innerText(),'Vulnerable');
   assert.equal(await page.locator('#card-effect-dialog-content').innerText(),'Vulnerable creatures take 50% more damage from Attacks.');
   assert.equal(await dialog.locator('a').count(),0,'effect explanation contains no links');
   assert.equal(await page.locator('#search').inputValue(),'');
   if(width!==1920)await page.screenshot({path:'assets/cards/previews/effect-popup-'+width+'.png'});
   await page.locator('.effect-dialog-close').click();assert.ok(!await dialog.isVisible());assert.ok(await vulnerable.evaluate(el=>el===document.activeElement));
   await page.locator('#card-BASH .detail-effect-panel').nth(1).locator('[data-effect-tooltip]').filter({hasText:'Vulnerable'}).click();await dialog.waitFor({state:'visible'});await page.keyboard.press('Escape');assert.ok(!await dialog.isVisible());
   await vulnerable.focus();await page.keyboard.press('Enter');assert.ok(await dialog.isVisible());await page.mouse.click(1,1);assert.ok(!await dialog.isVisible());
   await page.locator('#card-BREAKTHROUGH [data-effect-search]').first().click();assert.equal(await page.locator('#search').inputValue(),'ALL enemies');
   await page.locator('#search').fill('');await page.locator('#card-BASH .detail-effect-panel h4').first().dblclick();
   await page.waitForFunction(()=>document.getElementById('search').value==='Base');await page.locator('#search').fill('');
   for(const [index,amount] of [6,8].entries()){
    await page.locator('#card-LEGION_OF_BONE .detail-effect-panel').nth(index).locator('[data-effect-tooltip]').filter({hasText:'Summon'}).click();
    await dialog.waitFor({state:'visible'});
    assert.equal(await page.locator('#card-effect-dialog-title').innerText(),'Summon '+amount);assert.ok((await page.locator('#card-effect-dialog-content').innerText()).includes('with '+amount+' HP'));await page.keyboard.press('Escape');
   }
   const broken=await page.locator('[data-effect-tooltip]').evaluateAll(buttons=>{const data=JSON.parse(document.getElementById('card-effect-tooltips-data').textContent);return buttons.filter(button=>!data[button.dataset.effectTooltip]).length;});assert.equal(broken,0);
   assert.deepEqual(errors,[]);console.log('PASS '+width+'px: source-based effect dialogs, Base/Upgraded values, mouse/keyboard closing, existing search behaviors.');await page.close();
  }
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
