process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL,fileURLToPath}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({offline:true,viewport:{width:1920,height:1080}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const url=pathToFileURL(path.resolve('monster.html')).href;
  await page.goto(url);
  const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(node=>node.id));
  assert.equal(new Set(ids).size,ids.length,'duplicate anchors');
  const coverage=new Set(await page.locator('[data-monster-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.monsterId)));
  for(const monster of require('../../data/monster/catalog.json').monsters.filter(item=>['boss','elite'].includes(item.encounterType)))assert(coverage.has(monster.id),'missing monster '+monster.id);
  assert.equal(await page.locator('[data-monster-id=TEST_SUBJECT]').count(),3,'all three Test Subject phases');
  for(const act of ['act1a','act1b','act2','act3']){
   await page.locator('[data-monster-chapter='+act+']').click();
   const chapter=page.locator('.monster-chapter[data-act='+act+']');
   assert.equal(await page.locator('.monster-chapter:visible').count(),1);
   assert.equal(await chapter.locator('.wiki-overview-tile').count(),6);
   assert.equal(await chapter.locator('.wiki-monster-detail[data-monster-type=elite]').count(),3);
   assert.equal(await chapter.locator('.wiki-monster-detail[data-monster-type=boss]').count(),3);
   assert.equal(await chapter.locator('.wiki-notes,.wiki-monster-pattern,.wiki-monster-sequence').count(),0);
   assert.equal(await chapter.locator('.wiki-useful-cards').count(),0);
   for(const tile of await chapter.locator('.wiki-overview-tile').all()){
    await tile.click();
    const hash=new URL(page.url()).hash;
    assert(await page.locator(hash).isVisible(),'overview jump '+hash);
   }
   assert.equal(await chapter.locator('.wiki-monster-infobox').count(),await chapter.locator('.wiki-monster-entity').count());
   for(const table of await chapter.locator('.wiki-monster-infobox').all()){
    assert.deepEqual(await table.locator('th').allTextContents(),['Type','Powers']);
    const powers=table.locator('.wiki-power-list>li');
    assert.equal(await powers.count(),await table.locator('.wiki-power-name>img').count());
    for(const power of await powers.all())assert((await power.locator('p').innerText()).length>0,'Power description');
   }
  }
  const broken=await page.locator('img').evaluateAll(async nodes=>{
   await Promise.all(nodes.map(node=>node.decode().catch(()=>{})));
   return nodes.filter(node=>!node.naturalWidth).map(node=>node.src);
  });
  assert.deepEqual(broken,[],'broken images');
  const localLinks=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(node=>node.href).filter(url=>url.startsWith('file:')));
  const files=new Map();
  for(const href of localLinks){
   const link=new URL(href),file=fileURLToPath(link);
   assert(fs.existsSync(file),'missing local link '+href);
   if(link.hash){
    if(!files.has(file))files.set(file,fs.readFileSync(file,'utf8'));
    assert(files.get(file).includes('id="'+decodeURIComponent(link.hash.slice(1))+'"'),'missing local anchor '+href);
   }
  }
  for(const width of [1280,1440,1920]){
   await page.setViewportSize({width,height:1080});
   const buttons=await page.locator('[data-monster-chapter]').evaluateAll(nodes=>nodes.map(node=>({y:node.getBoundingClientRect().y,overflow:node.scrollWidth>node.clientWidth})));
   assert.equal(new Set(buttons.map(button=>button.y)).size,1,'all chapters share row at '+width);
   assert(buttons.every(button=>!button.overflow),'chapter button text fits at '+width);
   for(const act of ['act1a','act1b','act2','act3']){
    await page.locator('[data-monster-chapter='+act+']').click();
    const overflow=await page.evaluate(()=>{
     const main=document.querySelector('main').getBoundingClientRect();
     return [...document.querySelectorAll('.monster-chapter:not([hidden]) :is(table,img,.wiki-overview-tile)')].filter(node=>{const r=node.getBoundingClientRect();return r.left<main.left-1||r.right>main.right+1}).map(node=>node.tagName);
    });
    assert.deepEqual(overflow,[],act+' overflow at '+width);
   }
  }
  await page.goto(url+'#monster-test-subject-phase-2');
  assert(await page.locator('.monster-chapter[data-act=act3]').isVisible(),'deep link opens chapter');
  assert.deepEqual(await page.locator('#monster-test-subject-phase-2 .wiki-power-name strong').allTextContents(),['Adaptable','Painful Stabs']);
  fs.mkdirSync('assets/monster/previews',{recursive:true});
  for(const act of ['act1b','act2','act3']){
   await page.locator('[data-monster-chapter='+act+']').click();
   await page.screenshot({path:'assets/monster/previews/wiki-'+act+'-1920.png'});
  }
  await page.goto(url+'#monster-bygone-effigy');
  await page.screenshot({path:'assets/monster/previews/wiki-powers-effigy-1920.png'});
  assert.deepEqual(errors,[],'runtime errors');
  console.log('PASS: 4 chapters × 6 overview encounters; complete monster/phase coverage; tables, images, links, chapter switching and deep links; aligned menu and no overflow at 1280/1440/1920.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
