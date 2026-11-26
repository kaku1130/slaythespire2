process.chdir(require('node:path').resolve(__dirname, '../..'));
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const catalog = JSON.parse(fs.readFileSync('data/monster/catalog.json', 'utf8'));
catalog.items = catalog.items.filter(item => item.type !== 'Event');

(async () => {
  const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
  try {
    for (const mode of ['file', 'website']) for (const entry of ['monsters.html', 'index.html']) {
      const context = await browser.newContext({offline: true, viewport: {width: 1440, height: 1100}});
      const remote = [];
      context.on('request', request => {
        const url = new URL(request.url());
        if (['https:', 'http:'].includes(url.protocol) && url.hostname !== 'monster.test') remote.push(url.href);
      });
      if (mode === 'website') await context.route('http://monster.test/**', route => {
        const file = path.resolve('.' + decodeURIComponent(new URL(route.request().url()).pathname));
        assert.ok(file.startsWith(process.cwd() + path.sep));
        const contentType = {'.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.webp':'image/webp', '.png':'image/png', '.ico':'image/x-icon'}[path.extname(file)] || 'application/octet-stream';
        return route.fulfill({contentType, body: fs.readFileSync(file)});
      });
      const page = await context.newPage(), errors = [];
      page.setDefaultTimeout(10000);
      page.on('pageerror', error => errors.push(error.message));
      const url = mode === 'file' ? pathToFileURL(path.resolve(entry)).href : 'http://monster.test/' + entry;
      await page.goto(url);
      if (entry === 'index.html') await page.getByRole('link', {name:'Monster', exact:true}).click();
      const root = entry === 'index.html' ? page.frameLocator('#main-content>iframe:not([hidden])') : page;
      await root.locator('.monster-card').first().waitFor();
      assert.equal(await root.locator('.monster-card').count(), 80);
      assert.equal(await root.locator('.monster-category[data-type=Event],.monster-card[data-type=Event]').count(), 0, 'Event is excluded');
      const visible = () => root.locator('.monster-card:visible').count();
      assert.equal(await visible(), 22, 'Overgrowth is the default');
      assert.equal(await root.getByRole('button', {name:'All',exact:true}).count(), 0);
      assert.equal(await root.locator('.monster-heading,#monster-result,.monster-card-footer').count(), 0);
      assert.equal(await root.locator('.monster-types').count(), 0, 'type buttons removed');
      assert.equal(await root.locator('.monster-category>h3,.monster-member figcaption,.monster-hp').count(),0,'category headings, image captions and HP removed');
      const cardStyles = await root.locator('.monster-card').evaluateAll(cards=>cards.map(card=>({
        name:getComputedStyle(card.querySelector('h3')).color,
        category:getComputedStyle(card.closest('.monster-category')).borderLeftColor,
        nameSize:getComputedStyle(card.querySelector('h3')).fontSize,
        labelSize:getComputedStyle(card.querySelector('.monster-kind')).fontSize
      })));
      for(const style of cardStyles){assert.equal(style.name,style.category);assert.equal(style.labelSize,style.nameSize);}
      assert.equal(await root.locator('.filter-menu-toggle').count(),0,'no hamburger menu');
      for (const region of catalog.regions) assert.equal(await root.getByRole('button',{name:region,exact:true}).isVisible(),true,'area filters directly visible');
      assert.equal(await root.locator('.search-control #search').count(), 1, 'shared search markup');
      const searchLayout = await root.locator('.search-control').evaluate(control => {
        const box=control.getBoundingClientRect(),input=control.querySelector('input').getBoundingClientRect(),icon=control.querySelector('button').getBoundingClientRect();
        return {height:box.height,iconOffset:Math.abs((icon.top+icon.bottom-input.top-input.bottom)/2)};
      });
      assert.equal(searchLayout.height,48,'search control does not stretch vertically');
      assert.ok(searchLayout.iconOffset<1,'search icon aligns with the input');
      const links = await root.locator('.monster-card').evaluateAll(cards => cards.map(card => ({id:card.id.slice(8), url:card.href, target:card.target, names:[...card.querySelectorAll('img')].map(img=>img.alt)})));
      for (const card of links) {
        const expected = catalog.items.find(item => item.id === card.id);
        assert.ok(expected, card.id);
        assert.equal(card.url, expected.url);
        assert.equal(card.target, '_blank');
        assert.deepEqual(card.names, expected.members.map(member => member.name));
      }
      await root.locator('.monster-member img').evaluateAll(async images => {
        for (const image of images) image.loading = 'eager';
        await Promise.all(images.map(image => image.decode()));
      });
      for (const region of catalog.regions) {
        const button = root.getByRole('button', {name:region, exact:true});
        await button.click();
        assert.equal(await visible(), catalog.items.filter(item => item.region === region).length);
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
        assert.equal(await button.evaluate(node=>getComputedStyle(node).color),await root.locator('.monster-region:visible h2').evaluate(node=>getComputedStyle(node).color),'area button matches region heading color');
        assert.equal(await root.locator('.monster-region:visible').count(), 1);
        const groups = await root.locator('.monster-region:visible .monster-category').evaluateAll(nodes=>nodes.map(node=>({
          type:node.dataset.type, label:node.getAttribute('aria-label'), count:node.querySelectorAll('.monster-card').length,
          types:[...new Set([...node.querySelectorAll('.monster-card')].map(card=>card.dataset.type))], color:getComputedStyle(node).borderLeftColor
        })));
        for (const group of groups) {
          assert.equal(group.label,group.type);
          assert.deepEqual(group.types,[group.type],'each category has its own div');
          assert.equal(group.count,catalog.items.filter(item=>item.region===region&&(item.type==='Easy'?'Weak':item.type)===group.type).length);
        }
        const core=groups.filter(group=>['Boss','Elite','Hard','Weak'].includes(group.type));
        assert.deepEqual(core.map(group=>group.type),['Boss','Elite','Hard','Weak']);
        assert.equal(new Set(core.map(group=>group.color)).size,4,'four distinct category colors');
      }
      await page.reload();
      await root.locator('.monster-card').first().waitFor();
      assert.equal(await root.getByRole('button',{name:'Overgrowth',exact:true}).getAttribute('aria-pressed'),'true','reload starts at Overgrowth');
      await root.getByRole('button',{name:'Glory',exact:true}).click();
      const search = root.locator('#search');
      await search.fill('Battleworn Dummy');
      assert.equal(await visible(), 0, 'Event encounters are absent from search');
      await root.getByRole('button',{name:'清除搜尋',exact:true}).click();
      await root.getByRole('button',{name:'Overgrowth',exact:true}).click();
      await search.fill('Kin Priest');
      assert.equal(await visible(), 1, 'lineup member names are searchable');
      assert.equal(await root.locator('.monster-category:visible').count(),1,'search hides empty category divs');
      await search.fill('no-such-monster-987654');
      assert.equal(await visible(), 0);
      assert.equal(await root.locator('#monster-empty').isVisible(), true);
      await root.getByRole('button',{name:'清除搜尋',exact:true}).click();
      assert.equal(await visible(), 22);
      for (const [width, expectedColumns] of [[1024,1],[1100,1],[1280,1],[1440,1],[1920,3]]) {
        await page.setViewportSize({width, height:1100});
        const problems = await root.locator('.monster-grid').evaluateAll((grids,expectedColumns) => grids.filter(grid=>grid.getClientRects().length).flatMap(grid => {
          const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
          const overflow = [...grid.querySelectorAll('.monster-card')].some(card => card.scrollWidth > card.clientWidth + 1);
          return columns === expectedColumns && !overflow ? [] : [{columns, overflow}];
        }),expectedColumns);
        assert.deepEqual(problems, [], width + 'px '+expectedColumns+'-column layout');
      }
      const scrolling = await root.locator('main.monster-catalog').evaluate(main => {
        const scroller = document.querySelector('.site-page-scroll') || document.scrollingElement;
        const before = main.getBoundingClientRect().top;
        scroller.scrollTop = 250;
        const moved = before - main.getBoundingClientRect().top;
        const bounds = scroller === document.scrollingElement ? {left:0,right:innerWidth} : scroller.getBoundingClientRect();
        scroller.scrollTop = 0;
        return {moved, left:bounds.left, right:bounds.right, viewport:innerWidth, overflow:getComputedStyle(main).overflowY};
      });
      assert.ok(scrolling.moved > 200, 'content scrolls together');
      assert.equal(scrolling.left, 0);
      assert.equal(scrolling.right, scrolling.viewport, 'scrollbar at far right of viewport');
      assert.equal(scrolling.overflow, 'visible', 'no inset main-content scrollbar');
      assert.deepEqual(remote, [], 'offline catalog makes no remote requests');
      assert.deepEqual(errors, []);
      if (mode === 'file' && entry === 'monsters.html') {
        await page.setViewportSize({width:1440,height:1100});
        fs.mkdirSync('assets/monster/previews', {recursive:true});
        await page.mouse.move(20,20);
        await page.screenshot({path:'assets/monster/previews/monster-catalog-1440.png'});
          await root.getByRole('button',{name:'Glory',exact:true}).click();
          await page.screenshot({path:'assets/monster/previews/monster-glory-1440.png'});
      }
      console.log('PASS ' + mode + ' ' + entry + ': default area, colored category groups, shared search, removed labels, full-width scrolling, offline artwork and external links');
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
