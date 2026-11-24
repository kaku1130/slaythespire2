process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const guide=JSON.parse(fs.readFileSync('data/builds/guide.json','utf8'));
const catalog=new Map(JSON.parse(fs.readFileSync('data/relic/catalog.json','utf8')).items.map(relic=>[relic.className,relic]));
async function snapshot(locator){
 return locator.evaluateAll(cards=>cards.map(card=>{
  const image=card.querySelector('.relic-card-text > img'),zh=card.querySelector('.relic-name-zh'),en=card.querySelector('.relic-name-en');
  const effect=card.querySelector('.relic-card-text > p'),rarity=card.querySelector('[data-relic-rarity]');
  const nodes=[image,zh,en,effect,rarity],rects=nodes.map(node=>node.getBoundingClientRect()),bounds=card.getBoundingClientRect();
  return {id:card.dataset.relicId||card.id,zh:zh.textContent,en:en.textContent,effect:effect.textContent,rarity:rarity.textContent,
   color:getComputedStyle(zh).color,enColor:getComputedStyle(en).color,rarityColor:getComputedStyle(rarity).color,
   background:getComputedStyle(rarity).backgroundColor,
   valid:nodes.every((node,i)=>!i||!!(nodes[i-1].compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING))
    &&rects.every((rect,i)=>!i||rect.top>=rects[i-1].bottom-1)
    &&rects.every(rect=>rect.left>=bounds.left-1&&rect.right<=bounds.right+1)};
 }));
}
async function main(){
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1400}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve('Relics.html')).href);
  const reference=new Map((await snapshot(page.locator('.entry.relic'))).map(relic=>[relic.id,relic]));
  await page.goto(pathToFileURL(path.resolve('Characters.html')).href);
  let total=0;
  for(const build of guide.builds){
   const id='build-'+build.character+'-'+build.id;
   await page.evaluate(id=>document.querySelector('.tier-index-item[href="#'+id+'"]').click(),id);
   const rows=await snapshot(page.locator('#'+id+' .build-key-relic'));
   assert.deepEqual(rows.map(row=>row.id),build.relics.map(relic=>catalog.get(relic.className).id),id+' membership');
   for(const row of rows){
    const expected=reference.get(row.id);
    for(const key of ['zh','en','effect','rarity','color'])assert.equal(row[key],expected[key],id+' '+row.id+' '+key);
    assert.equal(row.enColor,row.color);assert.equal(row.rarityColor,row.color);
    assert.equal(row.background,'rgba(0, 0, 0, 0)');assert.ok(row.valid,id+' '+row.id+' layout');
   }
   total+=rows.length;
  }
  await page.evaluate(()=>document.querySelector('.tier-index-item').click());
  const card=page.locator('.build-key-relic:visible').first();
  await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(img=>img.decode());
  await card.screenshot({path:'assets/builds/previews/key-relic-catalog-style-1440.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: '+guide.builds.length+' guides, '+total+' key relic entries match relic catalog content, rarity colors and layout.');
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
