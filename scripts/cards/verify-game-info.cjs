process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const {items}=require('./game-info-menu.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({offline:true,viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const pages=['index.html','characters.html','cards.html','potions.html','relics.html','monsters.html','enchantments.html'];
  for(const file of pages){
   await page.goto(pathToFileURL(path.resolve(file)).href);
   const menu=page.locator('.site-header .game-info-dropdown'),summary=menu.locator('summary');
   assert.equal(await menu.count(),1,file);
   assert.equal(await summary.innerText(),'Game Info',file+' menu title');
   assert.deepEqual(items.map(([label])=>label),['Events','Badges','Patch Notes']);
   assert.equal(await page.locator('.site-nav>a').count(),6,file+' six main navigation icons');
   assert.equal(items[0][0],'Events');
   assert.equal(await menu.getByRole('link',{name:'Enemies',exact:true}).count(),0);
   const monster=page.getByRole('link',{name:'Monster',exact:true});
   assert.ok((await monster.getAttribute('href')).endsWith('monsters.html'));
   assert.notEqual(await monster.getAttribute('target'),'_blank');
   assert.equal(await monster.evaluate(node=>node.previousElementSibling.getAttribute('aria-label')),'Enchantments');
   assert.equal(await monster.evaluate(node=>node.nextElementSibling.classList.contains('game-info-dropdown')),true);
   assert.equal(await monster.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0),true,'Monster artwork loads');
   assert.equal(await menu.evaluate(node=>node===node.parentElement.lastElementChild),true,file+' rightmost menu');
   assert.deepEqual(await menu.locator('a').evaluateAll(nodes=>nodes.map(node=>[node.textContent,node.href])),items);
   assert.equal(await menu.locator('a:not([target="_blank"])').count(),0);
   await summary.press('Enter');
   assert.equal(await menu.evaluate(node=>node.open),true,file+' keyboard open');
   const bounds=await menu.locator('.game-info-menu').boundingBox();
   assert.ok(bounds.x>=0&&bounds.x+bounds.width<=1440,file+' dropdown clipping');
   assert.equal(await menu.locator('.game-info-menu').evaluate(node=>{
    const rect=node.getBoundingClientRect();return node.contains(document.elementFromPoint(rect.left+rect.width/2,rect.bottom-12));
   }),true,file+' menu covers content');
   await summary.press('Escape');
   assert.equal(await menu.evaluate(node=>node.open),false,file+' Escape closes');
   assert.equal(await summary.evaluate(node=>document.activeElement===node),true,file+' focus restored');
   await summary.click();await page.mouse.click(4,20);
   assert.equal(await menu.evaluate(node=>node.open),false,file+' outside click closes');
   if(file==='cards.html'){
    await summary.click();
    await page.screenshot({path:'assets/cards/previews/game-info-1440.png'});
    await summary.press('Escape');
   }
  }
  await page.goto(pathToFileURL(path.resolve('characters.html')).href);
  await page.setViewportSize({width:1024,height:900});
  assert.equal(await page.locator('.site-header-inner').evaluate(node=>node.scrollWidth<=node.clientWidth),true,'desktop header overflow');
  await page.locator('.game-info-dropdown summary').click();
  const box=await page.locator('.game-info-menu').boundingBox();
  assert.ok(box.x>=0&&box.x+box.width<=1024);
  assert.deepEqual(errors,[]);
  console.log('PASS: Monster icon and placement, Game Info links, keyboard controls, dismissal and unclipped desktop menus on all '+pages.length+' pages.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
