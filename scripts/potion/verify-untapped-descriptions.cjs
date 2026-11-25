process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const source=require('../../data/potion/source/untapped-descriptions.json').items,items=require('../../data/potion/catalog.json').items;
  assert.equal(items.length,63);assert(items.every(x=>!Object.hasOwn(x,'descI18n')));
  for(const mode of ['file','website']){
   const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];
   if(mode==='website')await context.route('http://potions.test/**',async route=>{
    const file=path.resolve('.'+decodeURIComponent(new URL(route.request().url()).pathname));assert(!path.relative(process.cwd(),file).startsWith('..'));
    const contentType={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    await route.fulfill({status:200,contentType,body:fs.readFileSync(file)});
   });
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(mode==='file'?pathToFileURL(path.resolve('potions.html')).href:'http://potions.test/potions.html');
   assert.equal(await page.locator('.card-language-toggle,[data-effect-language]').count(),0);
   const rendered=await page.locator('.entry.potion').evaluateAll(nodes=>nodes.map(n=>{
    const effect=n.querySelector(':scope > p'),clone=effect.cloneNode(true);
    for(const icon of clone.querySelectorAll('.energy-resource-icon,.star-resource-icon'))icon.replaceWith(icon.classList.contains('energy-resource-icon')?'<e/>':'<s/>');
    return {id:n.id,name:n.querySelector('.potion-name-zh').textContent,href:n.querySelector('a.catalog-name-en').href,text:clone.textContent,colors:[...effect.querySelectorAll('[style]')].map(span=>({text:span.textContent,color:span.style.color}))};
   }));
   for(const item of items){
    const actual=rendered.find(x=>x.id===item.id),reference=source.find(x=>x.id===item.id);
    assert.equal(actual.name,item.name,'Chinese name retained');assert.equal(actual.href,reference.url,item.id+' source link');
    assert.equal(actual.text,reference.parts.map(p=>p.resource?'<'+(p.resource==='energy'?'e':'s')+'/>':p.text).join(''),item.id+' exact website description');
    const expected=await page.evaluate(parts=>parts.filter(p=>p.color).map(p=>{const span=document.createElement('span');span.style.color=p.color;return {text:p.text,color:span.style.color}}),reference.parts);
    assert.deepEqual(actual.colors,expected,item.id+' exact website colors');
   }
   await page.locator('#search').fill('"Strength Potion"');assert.equal(await page.locator('.entry.potion:visible').count(),1);
   if(mode==='file')await page.screenshot({path:'assets/potion/previews/untapped-effects-1440.png'});
   assert.deepEqual(errors,[]);console.log('PASS '+mode+': all 63 English effects, colors, Chinese names, source links and English-only display.');await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
