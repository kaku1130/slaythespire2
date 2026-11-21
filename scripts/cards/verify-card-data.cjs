process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const {normalizeEffect,upgradeCost}=require('./sync-card-data.cjs');
const reference=JSON.parse(fs.readFileSync('data/cards/source/catalog-en.json'));
const localized=new Map(JSON.parse(fs.readFileSync('data/cards/source/catalog-zh-TW.json')).cards.map(card=>[card.id,card]));
const source=JSON.parse(fs.readFileSync('data/cards/cards-source.json'));
const detail=new Map(JSON.parse(fs.readFileSync('data/cards/english-details.json')).cards.map(card=>[card.id,card]));
const plain=(value,card)=>normalizeEffect(value,card).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
async function main(){
 assert.equal(reference.version,'v0.111.1');assert.equal(reference.cards.length,569);
 assert.deepEqual(source.map(card=>card.id).sort(),reference.cards.map(card=>card.id).sort());
 assert.equal(reference.cards.filter(card=>card.rarity==='Ancient').length,19);
 for(const card of reference.cards){
  const row=detail.get(card.id),zh=localized.get(card.id);assert.ok(row,card.id);
  assert.equal(row.name,card.name);assert.equal(row.nameZh,zh.name);assert.equal(row.type,card.type);assert.equal(row.rarity,card.rarity);assert.equal(row.character,card.pool);
  assert.equal(row.effect.base,normalizeEffect(card.descBase,card));assert.equal(row.effect.upgraded,card.upgrade||card.descBase!==card.descUpgraded?normalizeEffect(card.descUpgraded,card):null);
  assert.ok(fs.existsSync(row.image),card.id+' illustration');
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const width of [1440,1920]){
   const page=await browser.newPage({viewport:{width,height:1100}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(pathToFileURL(path.resolve('card.html')).href);
   const rendered=await page.locator('.card-detail-row').evaluateAll(rows=>rows.map(row=>{
    const text=element=>{const copy=element.cloneNode(true);for(const br of copy.querySelectorAll('br'))br.replaceWith('\n');return copy.textContent.replace(/\s+/g,' ').trim();};
   const panels=row.querySelectorAll('.detail-panel-description');
    const costText=selector=>{const cost=row.querySelector(selector)?.cloneNode(true);if(!cost)return null;cost.querySelector('.detail-panel-stars')?.remove();return text(cost);};
    return {id:row.dataset.id,name:text(row.querySelector('.detail-name-en')),zh:text(row.querySelector('.detail-name-zh')),tier:row.querySelector('.detail-character-metadata .detail-inline-tier')?.textContent.trim(),
     base:text(panels[0]),upgraded:text(panels[1]),baseCost:costText('[aria-label="Base energy cost"]'),upgradedCost:costText('[aria-label="Upgraded energy cost"]'),stars:row.querySelector('.detail-panel-stars')?.textContent.trim(),stats:Object.fromEntries([...row.querySelectorAll('.detail-meta-item')].map(stat=>[text(stat.querySelector('dt')),text(stat.querySelector('dd'))]))};
   }));
   assert.equal(rendered.length,reference.cards.length);const byId=new Map(rendered.map(card=>[card.id,card]));
   for(const card of reference.cards){
    const row=byId.get(card.id);assert.equal(row.name,card.name,card.id+' English name');assert.equal(row.zh,localized.get(card.id).name,card.id+' Chinese name');
    assert.equal(row.base,plain(card.descBase,card),card.id+' Base');
    let upgraded=card.upgrade||card.descBase!==card.descUpgraded?plain(card.descUpgraded,card):'Cannot be upgraded.';
    const next=upgradeCost(card),cost=card.energy===undefined?'No cost (unplayable)':card.energy===-1?'X':String(card.energy);
    assert.equal(row.upgraded,upgraded,card.id+' Upgraded');
    assert.equal(row.baseCost,cost,card.id+' base energy');
    assert.equal(row.upgradedCost,detail.get(card.id).effect.upgraded===null?null:next===-1?'X':next===undefined?cost:String(next),card.id+' upgraded energy');
    assert.equal(row.stats.Type,card.type);assert.equal(row.stats.Rarity,card.rarity);assert.equal(row.stats.Character,card.pool);
    const tier=detail.get(card.id).tier;
    assert.equal(row.tier,tier&&['Ironclad','Silent','Defect','Necrobinder','Regent'].includes(card.pool)?'Tier '+tier:undefined,card.id+' footer Tier');
    if(card.starCost!==undefined)assert.equal(row.stars,String(card.starCost),card.id+' stars');
   }
   assert.equal(await page.locator('.detail-card-stats').count(),0,'old table removed');
   assert.equal(await page.locator('.detail-card-rating,.detail-rating-description').count(),0,'bottom Tier rating and description removed');
   assert.equal(await page.locator('.detail-title .detail-inline-tier').count(),0,'Tier removed from title');
   assert.equal(await page.locator('.detail-tier-footer').count(),0,'Tier shares the bottom metadata row');
   assert.equal(await page.locator('.detail-overview > header + .detail-art + .detail-type-metadata + .detail-effects').count(),reference.cards.length,'title, artwork, type, then effects');
   assert.equal(await page.locator('.detail-card-metadata [data-type]').count(),0,'Type removed from top metadata');
   assert.equal(await page.locator('.detail-overview > .detail-effects + .detail-character-metadata').count(),reference.cards.length,'character follows effects');
   assert.equal(await page.locator('.detail-card-metadata [data-stat-character]').count(),0,'character removed from top metadata');
   assert.equal(await page.locator('.detail-effect-notes,.detail-resource-note').count(),0,'keyword explanations removed');
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
