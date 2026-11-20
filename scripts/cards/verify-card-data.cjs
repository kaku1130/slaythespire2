process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const {normalize,upgradeCost}=require('./sync-card-data.cjs');
const reference=JSON.parse(fs.readFileSync('data/cards/source/catalog-en.json'));
const localized=new Map(JSON.parse(fs.readFileSync('data/cards/source/catalog-zh-TW.json')).cards.map(card=>[card.id,card]));
const source=JSON.parse(fs.readFileSync('data/cards/cards-source.json'));
const detail=new Map(JSON.parse(fs.readFileSync('data/cards/english-details.json')).cards.map(card=>[card.id,card]));
const plain=value=>normalize(value).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
async function main(){
 assert.equal(reference.version,'v0.111.1');assert.equal(reference.cards.length,569);
 assert.deepEqual(source.map(card=>card.id).sort(),reference.cards.map(card=>card.id).sort());
 assert.equal(reference.cards.filter(card=>card.rarity==='Ancient').length,19);
 for(const card of reference.cards){
  const row=detail.get(card.id),zh=localized.get(card.id);assert.ok(row,card.id);
  assert.equal(row.name,card.name);assert.equal(row.nameZh,zh.name);assert.equal(row.type,card.type);assert.equal(row.rarity,card.rarity);assert.equal(row.character,card.pool);
  assert.equal(row.effect.base,normalize(card.descBase));assert.equal(row.effect.upgraded,card.upgrade||card.descBase!==card.descUpgraded?normalize(card.descUpgraded):null);
  assert.ok(fs.existsSync(row.image),card.id+' illustration');
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const width of [1440,1920]){
   const page=await browser.newPage({viewport:{width,height:1100}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(pathToFileURL(path.resolve('card.html')).href);
   const rendered=await page.locator('.card-detail-row').evaluateAll(rows=>rows.map(row=>{
    const text=element=>{const copy=element.cloneNode(true);for(const br of copy.querySelectorAll('br'))br.replaceWith('\n');return copy.textContent.replace(/\s+/g,' ').trim();};
    const panels=row.querySelectorAll('.detail-effect-panel p');
    return {id:row.dataset.id,name:text(row.querySelector('.detail-title a:last-child')),zh:text(row.querySelector('.detail-name-zh')),
     base:text(panels[0]),upgraded:text(panels[1]),stats:Object.fromEntries([...row.querySelectorAll('.detail-stat')].map(stat=>[text(stat.querySelector('dt')),text(stat.querySelector('dd'))]))};
   }));
   assert.equal(rendered.length,reference.cards.length);const byId=new Map(rendered.map(card=>[card.id,card]));
   for(const card of reference.cards){
    const row=byId.get(card.id);assert.equal(row.name,card.name,card.id+' English name');assert.equal(row.zh,localized.get(card.id).name,card.id+' Chinese name');
    assert.equal(row.base,plain(card.descBase),card.id+' Base');
    let upgraded=card.upgrade||card.descBase!==card.descUpgraded?plain(card.descUpgraded):'Cannot be upgraded.';
    const next=upgradeCost(card),cost=card.energy===undefined?'No cost (unplayable)':card.energy===-1?'X':String(card.energy);
    if(Number.isFinite(card.energy)&&card.energy>=0&&next<card.energy)upgraded+=' '+card.energy+' → '+next;
    assert.equal(row.upgraded,upgraded,card.id+' Upgraded');
    assert.equal(row.stats['Energy cost'],next!==card.energy?cost+' → '+next:cost,card.id+' energy');
    assert.equal(row.stats.Type,card.type);assert.equal(row.stats.Rarity,card.rarity);assert.equal(row.stats.Character,card.pool);
    if(card.starCost!==undefined)assert.equal(row.stats['Star cost'],String(card.starCost),card.id+' stars');
   }
   await page.locator('#card-filter-character button[aria-pressed=true]').click();
   const ancient=page.locator('#card-filter-rarity button[value=Ancient]');await ancient.click();
   assert.equal(await page.locator('.card-detail-row:visible').count(),19,'Ancient filter includes all 19 cards');assert.ok(await page.locator('#card-ABUNDANCE').isVisible());
   await page.locator('#search').fill('Abundance');assert.ok(await page.locator('#card-ABUNDANCE').isVisible());
   assert.equal(await page.locator('#card-filter-rarity button[aria-pressed=true]').count(),0,'search resets filters');
   assert.deepEqual(errors,[]);
   if(width===1440){await page.locator('#card-ABUNDANCE img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));await page.locator('#card-ABUNDANCE .card-detail').screenshot({path:'assets/cards/previews/abundance-audited-1440.png'});}
   console.log('PASS '+width+'px: all 569 source cards match names, Base/Upgraded, energy/stars, type, rarity and character; Ancient has 19 cards.');await page.close();
  }
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
