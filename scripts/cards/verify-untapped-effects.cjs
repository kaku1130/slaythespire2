process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const cards=require('../../data/cards/english-details.json').cards,source=require('../../data/cards/source/untapped-effects.json').items;
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];
   if(mode==='website')await context.route('http://cards.test/**',async route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));assert(!path.relative(process.cwd(),file).startsWith('..'));
    const contentType={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    await route.fulfill({status:200,contentType,body:fs.readFileSync(file)});
   });
   page.on('pageerror',error=>errors.push(error.message));
   const url=mode==='file'?pathToFileURL(path.resolve('cards.html')).href:'http://cards.test/cards.html';await page.goto(url);
   assert.equal(await page.locator('.card-language-toggle,[data-effect-language]').count(),0);
   const rendered=await page.locator('.card-detail-row').evaluateAll(rows=>rows.map(row=>({id:row.dataset.id,name:row.querySelector('.detail-name-zh').textContent,href:row.querySelector('.detail-name-en').href,panels:[...row.querySelectorAll('.detail-panel-description')].map(node=>{
    const clone=node.cloneNode(true);for(const br of clone.querySelectorAll('br'))br.replaceWith('\n');
    for(const icon of clone.querySelectorAll('.energy-resource-icon,.star-resource-icon'))icon.replaceWith(icon.classList.contains('energy-resource-icon')?'<e/>':'<s/>');
    return {text:clone.textContent,colors:[...node.querySelectorAll('[style]')].filter(n=>n.style.color).map(n=>{const copy=n.cloneNode(true);for(const br of copy.querySelectorAll('br'))br.replaceWith('\n');return {text:copy.textContent,color:n.style.color}})};
   })})));
   assert.equal(rendered.length,569);
   for(const card of cards){
    const row=rendered.find(x=>x.id===card.id),reference=source.find(x=>x.id===card.id);
    assert.equal(row.name,card.nameZh,card.id+' Chinese name');assert.equal(row.href,reference.url,card.id+' Untapped link');
    if(reference.unavailable){assert.equal(card.id,'MAD_SCIENCE');assert.equal(row.href,'https://sts2.untapped.gg/en/cards');assert(row.panels[0].text.includes('???'));continue;}
    for(const [index,key]of ['base','upgraded'].entries()){
     const parts=reference[key];if(parts===null){assert.equal(row.panels[index].text,'Cannot be upgraded.');continue;}
     assert.equal(row.panels[index].text,parts.map(p=>p.resource?'<'+(p.resource==='energy'?'e':'s')+'/>':p.text).join(''),card.id+' '+key+' exact text');
     const colors=await page.evaluate(parts=>parts.filter(p=>p.color).map(p=>{const n=document.createElement('span');n.style.color=p.color;return {text:p.text,color:n.style.color}}),parts);
     assert.deepEqual(row.panels[index].colors,colors,card.id+' '+key+' exact colors');
    }
   }
   const search=page.locator('#search');await search.fill('Vulnerable');assert(await page.locator('#card-BASH').isVisible());
   await search.fill('猛擊');assert(await page.locator('#card-BASH').isVisible());
   await search.fill('');await page.goto(url+'#card-WHIRLWIND');await page.locator('#card-WHIRLWIND [data-effect-search]').first().click();assert.equal(await search.inputValue(),'ALL enemies');
   await page.goto(url+'#card-BASH');if(mode==='file')await page.screenshot({path:'assets/cards/previews/untapped-effects-1440.png'});
   assert.deepEqual(errors,[]);console.log('PASS '+mode+': 568 exact source effects/colors; 569 Chinese names/links, generic Mad Science, English-only display and search.');await context.close();
  }
  const credit=require('./source-credit.cjs');
  for(const file of ['cards.html','characters.html','relics.html','potions.html','ancients.html'])assert(fs.readFileSync(file,'utf8').includes(credit),file+' exact requested footer');
  console.log('PASS: requested source footer on all six pages.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
