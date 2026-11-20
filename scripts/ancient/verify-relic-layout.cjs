process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const slugs=JSON.parse(fs.readFileSync('data/ancient/catalog.json','utf8')).slugs;
async function snapshot(locator){
 return locator.evaluateAll(cards=>cards.map(card=>{
  const image=card.querySelector('.relic-card-text > img'),zh=card.querySelector('.relic-name-zh'),en=card.querySelector('.relic-name-en');
  const effect=card.querySelector('.relic-card-text > p'),rarity=card.querySelector('.relic-rarity-row [data-relic-rarity]');
  const nodes=[image,zh,en,effect,rarity],rects=nodes.map(node=>node.getBoundingClientRect()),bounds=card.getBoundingClientRect();
  return {id:card.dataset.relicId||card.id,anchor:card.id,zh:zh.textContent,en:en.textContent,effect:effect.textContent,rarity:rarity.textContent,
   color:getComputedStyle(zh).color,enColor:getComputedStyle(en).color,rarityColor:getComputedStyle(rarity).color,
   headingSize:getComputedStyle(zh).fontSize,effectSize:getComputedStyle(effect).fontSize,background:getComputedStyle(rarity).backgroundColor,
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
  await page.goto(pathToFileURL(path.resolve('relic.html')).href);
  const reference=new Map((await snapshot(page.locator('.entry.relic'))).map(relic=>[relic.id,relic]));
  let total=0,cardCount=0;
  for(const slug of slugs){
   const original=fs.readFileSync('data/ancient/source/'+slug+'.html','utf8').match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
   const anchors=[...original.matchAll(/<div\b[^>]*id="(relic-[^"]+)"/g)].map(match=>match[1]);
   await page.goto(pathToFileURL(path.resolve('data/ancient/ancient-'+slug+'.html')).href);
   const rows=await snapshot(page.locator('.ancient-relic-entry'));
   assert.deepEqual(rows.map(row=>row.anchor),anchors,slug+' relic anchors');
   for(const row of rows){
    const expected=reference.get(row.id);assert.ok(expected,row.id);
    for(const key of ['zh','en','effect','rarity','color','headingSize','effectSize'])assert.equal(row[key],expected[key],slug+' '+row.id+' '+key);
    assert.equal(row.enColor,row.color);assert.equal(row.rarityColor,row.color);
    assert.equal(row.background,'rgba(0, 0, 0, 0)');assert.ok(row.valid,slug+' '+row.id+' layout');
   }
   cardCount+=await page.locator('.ancient-relic-extras .card-detail').count();total+=rows.length;
  }
  assert.equal(cardCount,16,'embedded reward cards preserved');
  await page.goto(pathToFileURL(path.resolve('ancient.html')).href);
  const frame=page.frameLocator('.split-detail iframe');
  await frame.locator('.ancient-relic-entry').first().waitFor();
  const embedded=await snapshot(frame.locator('.ancient-relic-entry'));
  for(const row of embedded){assert.equal(row.headingSize,reference.get(row.id).headingSize);assert.ok(row.valid,row.id+' iframe layout');}
  const card=frame.locator('.ancient-relic-entry').first();
  await card.scrollIntoViewIfNeeded();await card.locator('.relic-card-text > img').evaluate(img=>img.decode());
  await card.screenshot({path:'assets/ancient/previews/catalog-relic-format-1440.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: '+slugs.length+' ancient pages, '+total+' relics match catalog layout and content; '+cardCount+' reward cards and relic anchors preserved; embedded panel verified.');
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
