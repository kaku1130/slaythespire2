process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL,fileURLToPath}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const pages=['ancients.html','characters.html','cards.html','potions.html','relics.html','monsters.html',...fs.readdirSync('data/ancient').filter(f=>/^ancient-.*\.html$/.test(f)).map(f=>'data/ancient/'+f)];
  for(const file of pages) {
   const page=await browser.newPage({offline:true,viewport:{width:1440,height:1000}}),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',request=>{if(request.url().startsWith('file:') && request.failure()?.errorText!=='net::ERR_ABORTED')failed.push(request.url()+' '+request.failure()?.errorText);});
   await page.goto(pathToFileURL(path.resolve(file)).href);
   if(file==='cards.html') {
    await page.locator('#search').fill('"Tremble"');
    assert.equal(await page.locator('#card-TREMBLE .detail-untapped-link').getAttribute('href'),require('../../data/cards/english-details.json').cards.find(card=>card.id==='TREMBLE').sourceEn);
   }
   const missingLinks=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.href).filter(h=>h.startsWith('file:')));
   for(const url of missingLinks)assert.ok(fs.existsSync(fileURLToPath(url)),file+' missing link '+url);
   const broken=await page.locator('img[src]').evaluateAll(async nodes=>{
    for(const n of nodes)n.loading='eager';
    await Promise.all(nodes.map(n=>n.decode().catch(()=>{})));
    return nodes.filter(n=>!n.naturalWidth).map(n=>n.getAttribute('src'));
   });
   assert.deepEqual(broken,[],file+' broken images');assert.deepEqual(failed,[],file+' missing resources');assert.deepEqual(errors,[],file+' runtime errors');
   console.log('PASS '+file+': links, images, styles/scripts and runtime');await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
