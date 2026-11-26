process.chdir(require('node:path').resolve(__dirname,'../..'));
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page=await browser.newPage();
    await page.goto(pathToFileURL(path.resolve('cards.html')).href);
    const referenceTypes={Attack:'lab(63.7053% 60.745 31.3109)',Skill:'lab(78.503% -64.9265 39.7492)',Power:'lab(83.2664% 8.65132 106.895)'};
    const referenceRarities={Common:'lab(84.9837% .601262 -2.17986)',Uncommon:'lab(65.0361% -1.42065 -56.9802)',Rare:referenceTypes.Power,Ancient:'lab(72.7183% 31.8672 97.9407)'};
    const referenceTiers=Object.fromEntries(['S','A','B','C','D'].map(tier=>[tier,[['S','A'].includes(tier)?'#fff':'#000','var(--card-tier-'+tier+')']]));
    for(const width of [1440,390])for(const file of ['cards.html','card1.html'].filter(file=>require('node:fs').existsSync(file))) {
      await page.setViewportSize({width,height:1000});await page.goto(pathToFileURL(path.resolve(file)).href);
      for(const [kind,values] of Object.entries({type:referenceTypes,rarity:referenceRarities,tier:referenceTiers}))for(const [value,colors] of Object.entries(values)) {
        const actual=await page.locator('.detail-meta>.detail-'+kind+'[data-'+kind+'='+value+']').first().evaluate((node,args)=>{
          const [kind,colors]=args,s=getComputedStyle(node),probe=document.createElement('span');
          probe.style.color=kind==='tier'?colors[0]:colors;probe.style.backgroundColor=kind==='tier'?colors[1]:'transparent';document.body.append(probe);
          const expected=getComputedStyle(probe),result={color:s.color,expected:expected.color,background:s.backgroundColor,expectedBackground:expected.backgroundColor,border:s.borderTopWidth,font:s.fontSize,weight:s.fontWeight,padding:s.padding,radius:s.borderRadius};probe.remove();return result;
        },[kind,colors]);
        assert.equal(actual.color,actual.expected,kind+' '+value+' color');assert.equal(actual.background,actual.expectedBackground,kind+' '+value+' background');
        assert.equal(actual.border,'0px');assert.equal(actual.font,kind==='tier'?'12px':kind==='type'?'16px':'14px');
        assert.equal(actual.weight,kind==='tier'?'700':kind==='type'?'500':'400');assert.equal(actual.padding,kind==='tier'?'2px 8px':'0px');assert.equal(actual.radius,kind==='tier'?'6px':'0px');
      }
      console.log('PASS '+file+' '+width+'px: reference rarity/type styles and menu-matched tier colors');
    }
    const ancient=require('../../data/cards/tier-palette.json');
    await page.goto(pathToFileURL(path.resolve('characters.html')).href);
    // Check every level even if the current build list has no D-ranked guide.
    await page.evaluate(()=>{for(const tier of ['S','A','B','C','D']){const n=document.createElement('span');n.className='build-tier';n.dataset.tier=tier;document.querySelector('main').append(n);}});
    const badges=await page.locator('.build-tier[data-tier],.card-tier-badge[data-tier]').evaluateAll(nodes=>nodes.filter(n=>n.dataset.tier!=='unranked').map(n=>({tier:n.dataset.tier,color:getComputedStyle(n).color,background:getComputedStyle(n).backgroundColor,border:getComputedStyle(n).borderTopColor})));
    for(const {tier,color,background} of badges){assert.equal(color,ancient[tier].color,tier);assert.equal(background,ancient[tier].background,tier);}
    console.log('PASS build tier fills remain unchanged');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
