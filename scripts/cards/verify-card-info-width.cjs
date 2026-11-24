process.chdir(require('node:path').resolve(__dirname,'../..'));
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  for(const file of ['Cards.html','card1.html'].filter(file=>require('node:fs').existsSync(file)))for(const width of [1920,1440,390]) {
   const page=await browser.newPage({viewport:{width,height:1000}});
   await page.goto(pathToFileURL(path.resolve(file)).href);
   await page.locator('#card-filter-character button[value=Ironclad]').click();
   const failures=await page.locator('.card-detail').evaluateAll(cards=>cards.flatMap(card=>{
    const art=card.querySelector('.detail-art img').getBoundingClientRect();
    if(!art.width)return [];
    return [...card.children].filter(n=>!n.classList.contains('detail-art')).flatMap(n=>{
     const r=n.getBoundingClientRect();return r.left<art.left-1||r.right>art.right+1||(n.classList.contains('detail-keyword')&&Math.abs(r.width-art.width)>1) ? [card.id+' '+n.className+' '+JSON.stringify({left:r.left,right:r.right,artLeft:art.left,artRight:art.right})]:[];
    });
   }));
   assert.deepEqual(failures,[]);
   const spacing=await page.locator('section[data-pool]').evaluateAll(sections=>sections.filter(s=>!s.hidden).map(section=>{
    const heading=getComputedStyle(section.querySelector('.grid-pool-heading'));
    const cards=[...section.querySelectorAll('.card-detail-row:not([hidden]) .card-detail')];
    return [heading.paddingTop,heading.paddingBottom,heading.marginTop,heading.marginBottom,getComputedStyle(cards[0]).marginTop,getComputedStyle(cards.at(-1)).marginBottom];
   }));
   for(const values of spacing)assert.deepEqual(values,['24px','24px','0px','0px','0px','0px']);await page.close();console.log('PASS '+file+' '+width+'px: card information stays within artwork; keyword notes match artwork width');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
