process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const source=require('../../data/cards/source/creator-tier-lists.json').lists,cards=require('../../data/cards/english-details.json').cards;
  assert.equal(source.length,10);
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];
   if(mode==='website')await context.route('http://cards.test/**',async route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));assert(!path.relative(process.cwd(),file).startsWith('..'));
    const contentType={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    await route.fulfill({status:200,contentType,body:fs.readFileSync(file)});
   });
   page.on('pageerror',error=>errors.push(error.message));
   const url=mode==='file'?pathToFileURL(path.resolve('Cards.html')).href:'http://cards.test/Cards.html';await page.goto(url);
   assert.equal(await page.locator('.detail-creator-name').count(),0);
   const rows=await page.locator('.card-detail-row').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.id,ratings:[...n.querySelectorAll('.detail-bottom-tier .detail-creator-rating')].map(a=>({author:a.dataset.author,href:a.href,tier:a.querySelector('.creator-tier-badge').textContent,color:getComputedStyle(a.querySelector('.creator-tier-badge')).color}))})));
   let ranked=0,unranked=0;
   for(const card of cards){
    const row=rows.find(x=>x.id===card.id),lists=source.filter(x=>x.character===card.character&&x.author==='Jorbs');
    assert.equal(row.ratings.length,lists.length,card.id+' author count');
    if(!lists.length)continue;
    assert.deepEqual(row.ratings.map(x=>x.author),['Jorbs']);
    for(const rating of row.ratings){
     const list=lists.find(x=>x.author===rating.author),tier=list.tiers.find(t=>t.cards.includes(card.id))?.name||'—';
     assert.equal(rating.href,list.url);assert.equal(rating.tier,tier,card.id+' '+rating.author+' source rating');assert.equal(rating.color,'rgb(0, 0, 0)');
     if(tier==='—')unranked++;else ranked++;
    }
   }
   assert.equal(ranked,438);assert.equal(unranked,16);
   for(const width of [1280,1440,1920]){
    await page.setViewportSize({width,height:1100});
    assert(await page.locator('.detail-bottom-tier:visible').evaluateAll(nodes=>nodes.every(n=>{
     const links=n.querySelectorAll('.detail-creator-rating');if(!links.length)return true;
     const label=links[0].getBoundingClientRect(),outer=n.getBoundingClientRect();
     return links.length===1&&Math.abs((label.left+label.right)-(outer.left+outer.right))<1;
    })),'centered Jorbs rating '+width);
   }
   await page.goto(url+'#card-BASH');await page.setViewportSize({width:1440,height:1100});
   if(mode==='file')await page.screenshot({path:'assets/cards/previews/creator-tiers-1440.png'});
   assert.deepEqual(errors,[]);console.log('PASS '+mode+': 438 Jorbs ratings, 16 unranked markers, source links/black labels and centered placement at three desktop widths.');await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
