process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const source=JSON.parse(fs.readFileSync('data/cards/cards-source.json'));
async function main(){
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const width of [390,1440,1920]){
   const page=await browser.newPage({viewport:{width,height:1100},isMobile:width===390,hasTouch:width===390});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(pathToFileURL(path.resolve('cards.html')).href);
   const character=value=>page.locator('#card-filter-character button[value="'+value+'"]');
   const type=value=>page.locator('#card-filter-type button[value="'+value+'"]');
   const shown=()=>page.locator('.card-detail-row:visible').evaluateAll(rows=>rows.map(row=>row.dataset.id).sort());
   const order=await page.locator('#card-filter-character button').evaluateAll(buttons=>buttons.map(button=>button.value));
   assert.deepEqual(order.slice(-3),['Colorless','Event','Curse']);
   assert.equal(await character('Event').getAttribute('aria-label'),'Event');assert.equal(await character('Curse').getAttribute('aria-label'),'Curse、Quest');
   assert.equal(await character('Curse').getAttribute('title'),'Curse、Quest');
   assert.equal(await page.locator('#card-filter-character button img').count(),8);
   assert.equal(await page.locator('#card-filter-rarity button[value=Ancient] img').count(),0);
   await page.locator('#card-filter-character img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
   await character('Ironclad').click();await character('Event').click();
   const events=source.filter(card=>card.pool==='Event').map(card=>card.id).sort();assert.deepEqual(await shown(),events);
   await character('Event').click();await character('Curse').click();
   const curses=source.filter(card=>['Curse','Quest'].includes(card.pool)||['Curse','Quest'].includes(card.rarity)).map(card=>card.id).sort();
   assert.deepEqual(await shown(),curses);
   const headings=await page.locator('section[data-pool]:visible > .grid-pool-heading').allTextContents();
   for(const label of ['Curse','Quest'])assert.ok(headings.some(text=>text.trim().startsWith(label+' ')),label+' has a separate heading');
   assert.equal(await page.locator('.card-detail-row:is([data-type=Status],[data-rarity=Token])').count(),0);
   assert.equal(await page.locator('section:is([data-pool=Status],[data-pool=Token])').count(),0);
   assert.ok(!headings.some(text=>text.trim().startsWith('Event ')));
   assert.deepEqual(await page.locator('#card-filter-type button').evaluateAll(buttons=>buttons.map(button=>button.value)),['Attack','Skill','Power']);
   await type('Attack').click();const attacks=source.filter(card=>curses.includes(card.id)&&card.type==='Attack').map(card=>card.id).sort();assert.deepEqual(await shown(),attacks);
   await type('Attack').click();await character('Event').click();assert.deepEqual(await shown(),[...curses,...events].sort());
   await character('Event').click();await page.locator('#search').fill('Dowsing');assert.ok(await page.locator('#card-DOWSING').isVisible());
   await page.goto(pathToFileURL(path.resolve('cards.html')).href+'#card-BYRDONIS_EGG');assert.ok(await page.locator('#card-BYRDONIS_EGG').isVisible());assert.equal(await character('Curse').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.card-detail-row').count(),source.length);
   assert.equal(await page.locator('[id]').evaluateAll(nodes=>nodes.map(node=>node.id).filter((id,index,ids)=>ids.indexOf(id)!==index).length),0);
   const assets=await page.locator('.card-detail img').evaluateAll(images=>[...new Set(images.map(image=>image.getAttribute('src')))]);for(const image of assets)assert.ok(fs.existsSync(image),image);
   assert.deepEqual(errors,[]);
   assert.equal(await page.locator('#card-filter-result').innerText(),'符合張數 / 總卡片數：'+curses.length+' / '+source.length);
   if(width!==1920)await page.locator('#tools').screenshot({path:'assets/cards/previews/card-categories-'+width+'.png'});
   console.log('PASS '+width+'px: '+source.length+' cards, Event/Curse categories including Quest, Attack/Skill/Power options, combined filters and deep links.');await page.close();
  }
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
