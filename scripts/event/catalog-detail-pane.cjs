process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('fs');
const typography=require('./detail-typography.cjs').styles;
const styles=`
main#main-content.detail-split{display:flex!important;flex-direction:column;gap:16px;overflow:hidden!important}.detail-split>.filters{flex:0 0 auto;max-height:40%;overflow:auto;margin:0;padding:0 0 4px}.split-body{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;flex:1;min-height:0;min-width:0;overflow:hidden}
.split-list{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:auto;scrollbar-width:thin;box-sizing:border-box;border:1px solid #293340;border-radius:10px;background:#080d13;padding:16px;scrollbar-color:#354454 transparent}.split-list>.filters{flex:0 0 auto;max-height:44%;overflow:auto;margin-top:0}.split-list>.catalog-scroll{flex:1;min-height:0;overflow:auto;padding:3px 6px 3px 3px}.split-list .chapter-section:last-of-type{margin-bottom:0}.split-list .catalog{grid-template-columns:repeat(3,minmax(0,1fr))!important}.split-list .chapter-section{padding:12px}.split-list .entry{cursor:pointer}.split-list [data-detail-key].is-detail-selected{outline:2px solid #37a8ec;outline-offset:-2px;background:#102333}.split-list [data-detail-key]:focus-visible{outline:2px solid #37a8ec;outline-offset:2px}.split-list .entry>img{height:130px}.split-list .entry.event>img{height:160px}.split-list .container{padding:0;max-width:none}.split-list .container>.grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
.split-detail{min-width:0;min-height:0;display:flex;flex-direction:column;border:1px solid #293340;border-radius:10px;background:#080d13;overflow:hidden}.split-detail-heading{margin:0;padding:12px 16px;color:#aab6c4;font:600 18px/1.5 system-ui;border-bottom:1px solid #293340}.split-detail iframe[hidden],.split-detail-heading[hidden]{display:none}.split-detail iframe{display:block;width:100%;flex:1;min-height:0;border:0;background:#040609}
.split-list .compact-detail-item{display:flex;flex-direction:row;gap:12px;align-items:center;text-align:left;text-decoration:none}
.split-list .compact-detail-item[hidden]{display:none!important}
.split-list .compact-detail-item:not(.event):is(:hover,.is-detail-selected,:focus-visible){border-color:var(--detail-color,#37a8ec);outline:2px solid var(--detail-color,#37a8ec);outline-offset:-2px}
.split-list .compact-detail-item:not(.event).is-detail-selected{background:color-mix(in srgb,var(--detail-color,#37a8ec) 14%,#080d13)}
main#main-content .split-list .compact-detail-item:not(.event):is(:hover,.is-detail-selected,:focus-visible) .compact-detail-name{color:var(--detail-color,#37a8ec)}
.split-list .compact-detail-item>:not(.compact-detail-image):not(.compact-detail-name):not(.event-list-picture){display:none!important}
main#main-content .split-list .compact-detail-image{position:static;display:block;flex:0 0 64px;width:64px;height:64px;object-fit:contain;margin:0;border-radius:6px}
main#main-content .split-list .compact-detail-item:not(.event){gap:8px;padding:12px}
main#main-content .split-list .compact-detail-item:not(.event) .compact-detail-image{flex-basis:48px;width:48px;height:48px}
main#main-content .split-list .compact-detail-item:not(.event) .compact-detail-name{font-size:16px;overflow:visible;text-overflow:clip;overflow-wrap:anywhere}
main#main-content .split-list .compact-detail-name{flex:1;min-width:0;margin:0;color:var(--ink,#e3e8ee);font-size:18px;font-weight:600;line-height:1.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
main#main-content .split-list .entry.event.compact-detail-item{flex-direction:column;align-items:stretch;gap:0;padding:0;overflow:visible;border:0;background:transparent}
main#main-content .split-list .entry.event .compact-detail-name{position:static;flex:none;padding:0 0 8px;width:100%;box-sizing:border-box;text-align:center;color:var(--ink,#e3e8ee);background:transparent}
main#main-content .split-list .event-list-picture{width:100%;overflow:hidden;border:1px solid #293340;border-radius:8px;background:#080d13}
main#main-content .split-list .entry.event .compact-detail-image{flex:none;width:100%;height:auto;object-fit:contain;border-radius:0}
main#main-content .split-list .entry.event.compact-detail-item:is(.is-detail-selected,:focus-visible){outline:none;background:transparent}
main#main-content .split-list .entry.event.compact-detail-item:is(.is-detail-selected,:focus-visible) .event-list-picture{border-color:var(--chapter-color,#37a8ec);outline:2px solid var(--chapter-color,#37a8ec);outline-offset:-2px}
main#main-content .split-list .entry.event .event-list-picture:hover{border-color:var(--chapter-color,#37a8ec);outline:2px solid var(--chapter-color,#37a8ec);outline-offset:-2px}
main#main-content .split-list .entry.event.is-detail-selected .compact-detail-name{color:var(--chapter-color,#37a8ec)}
main#main-content.ancient-browser .split-body{grid-template-columns:25% minmax(0,1fr)}.ancient-act-groups{display:flex;flex-direction:column;gap:16px;align-items:stretch}.ancient-act-column{display:flex;flex-direction:column;gap:20px;min-width:0}
main#main-content .ancient-act-title{display:flex;align-items:center;gap:10px;margin:0 0 16px;color:var(--detail-color,#74b3e6);font-size:24px;font-weight:700;line-height:1.5}
.ancient-act-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
@media(max-width:640px){main#main-content .ancient-act-title{font-size:22px}}
@media(max-width:520px){.ancient-act-groups{grid-template-columns:1fr}.split-list .catalog,.split-list .container>.grid,.ancient-act-grid{grid-template-columns:1fr!important}}
@media(max-width:850px){.split-body{display:flex;flex-direction:column;overflow:auto;gap:16px}.split-list{flex:0 0 52dvh;min-height:280px;padding:12px}.split-detail{flex:0 0 72dvh;min-height:360px}}
`;
const embedStyles=`html,body{position:static!important;display:block!important;height:auto!important;min-height:100%!important;overflow:auto!important;width:100%!important}body>.site-header,body>.skip-link{display:none!important}main#main-content{display:block!important;width:100%!important;max-width:none!important;padding:20px!important;margin:0!important;height:auto!important;overflow:visible!important}body[data-detail-kind=event] main div[class*="aspect-"]{max-height:280px;overflow:hidden}main>.container{padding:0!important;max-width:none!important;width:100%!important}main [class*="flex-wrap"]:has(>[aria-label="切換遊戲版本"]){display:none!important}`;
const detailHeaderStyles=`body[data-detail-kind=ancient] main#main-content .is-relic-highlighted{border-color:var(--detail-highlight-color,#37a8ec);outline:2px solid var(--detail-highlight-color,#37a8ec);outline-offset:-2px;background-color:color-mix(in srgb,var(--detail-highlight-color,#37a8ec) 14%,#080d13)!important}.detail-identity{display:flex;align-items:flex-start;gap:20px;margin-bottom:20px}.detail-identity-text{flex:1;min-width:0}body[data-detail-kind] main#main-content img.detail-portrait{position:static;flex:0 0 112px;width:112px;height:112px;object-fit:contain;border-radius:8px}.detail-portrait-wrap{align-self:flex-start}main#main-content{padding:16px!important}body[data-detail-kind] main#main-content :is(h1,h2,h3,.detail-title){font-family:Arial,"Microsoft JhengHei",sans-serif;font-size:24px;line-height:1.4;font-weight:600;color:#74b3e6}body[data-detail-kind] main#main-content .detail-title{margin:0}body[data-detail-kind=monster] main#main-content .max-w-3xl{max-width:none;width:100%}body[data-detail-kind] main#main-content :is(.max-w-3xl,.max-w-5xl,.max-w-6xl){max-width:none;width:100%}body[data-detail-kind=monster] .monster-detail-header{align-items:flex-start}body[data-detail-kind=monster] .monster-detail-header>div:last-child{flex:1;min-width:0}
body[data-detail-kind=event] .detail-identity{display:grid;grid-template-columns:minmax(100px,1fr) minmax(0,2fr);align-items:start}
body[data-detail-kind=event] main#main-content img.detail-portrait{width:100%;height:auto;max-width:none;object-fit:contain}
body[data-detail-kind] .detail-card-lane{width:100%;max-width:100%;min-width:0}
body[data-detail-kind] .database-card-link{margin-left:0;margin-right:auto}
`;
function runtime(){
 const data=JSON.parse(document.getElementById('detail-pane-data').textContent),main=document.getElementById('main-content');
 const filters=main.querySelector(':scope > .filters');if(filters)filters.remove();const list=document.createElement('div');list.className='split-list';while(main.firstChild)list.append(main.firstChild);const body=document.createElement('div');body.className='split-body';body.append(list);if(filters)main.append(filters);main.append(body);main.classList.add('detail-split');
 const panel=document.createElement('section');panel.className='split-detail';panel.setAttribute('aria-label','詳細內容');const heading=document.createElement('h2');heading.className='split-detail-heading';heading.textContent='詳細內容';const frame=document.createElement('iframe');frame.title='詳細內容';frame.hidden=true;heading.hidden=true;panel.append(frame);body.append(panel);
 const encounterBrowser=Boolean(list.querySelector('.encounter'));
 if(encounterBrowser){
  main.classList.add('encounter-browser');
  panel.hidden=true;
  body.prepend(filters);
  const back=document.createElement('button');
  back.type='button';
  back.className='encounter-back';
  back.textContent='返回怪物列表';
  panel.prepend(back);
  back.addEventListener('click',()=>{
   const selected=list.querySelector('[aria-current="true"]');
   panel.hidden=true;
   list.hidden=false;
   selected?.focus();
  });
 }
 const choices=[];for(const link of list.querySelectorAll('a[href]')){const key=link.getAttribute('href').split('/').pop();if(!data.pages[key])continue;const item=link.closest('.entry')||link;item.dataset.detailKey=key;if(item.tagName!=='A')item.tabIndex=0;choices.push(item);if(link.classList.contains('details'))link.remove();}
 for(const item of encounterBrowser?[]:choices){
  const sourceImage=item.querySelector('img'),sourceName=item.querySelector('h2,.font-semibold');
  if(!sourceImage||!sourceName)continue;
  const image=sourceImage.cloneNode(true);image.className='compact-detail-image';image.removeAttribute('style');
  const name=document.createElement('h2');name.className='compact-detail-name';name.textContent=sourceName.textContent.trim();name.title=name.textContent;
  item.classList.add('compact-detail-item');if(item.classList.contains('monster'))item.style.setProperty('--detail-color',({weak:'#aab6c4',normal:'#70bf8b',elite:'#e3bf72',boss:'#dc6c68',summon:'#b595dd'})[item.dataset.encounterType]);
  if(item.classList.contains('event')){const picture=document.createElement('div');picture.className='event-list-picture';picture.append(image);item.append(name,picture);}else item.append(image,name);
 }
 if(choices[0]?.dataset.detailKey.startsWith('ancient-')){
  main.classList.add('ancient-browser');
  const grid=choices[0].parentElement,container=grid.parentElement;
  for(const sibling of [...container.children])if(sibling!==grid&&sibling.querySelector('[aria-label="切換遊戲版本"]'))sibling.remove();
  const groups=new Map();
  for(const item of choices){const act=item.textContent.match(/第\s*(\d+)\s*幕/);const key=act?Number(act[1]):0;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
  const darv=choices.find(item=>item.dataset.detailKey==='ancient-darv.html');
  if(darv)for(const act of [2,3]){const copy=darv.cloneNode(true);if(!groups.has(act))groups.set(act,[]);groups.get(act).push(copy);choices.push(copy);}
  for(const item of groups.get(0)||[]){const index=choices.indexOf(item);if(index>=0)choices.splice(index,1);item.remove();}groups.delete(0);
  const sections=document.createElement('div');sections.className='ancient-act-groups';const actColumns=new Map();for(const act of [1,2,3]){const column=document.createElement('div');column.className='ancient-act-column';column.dataset.actColumn=act;actColumns.set(act,column);sections.append(column);}
  for(const key of [...groups.keys()].sort((a,b)=>(a||99)-(b||99))){const section=document.createElement('section'),title=document.createElement('h2'),items=document.createElement('div');section.className='ancient-act-section';section.dataset.act=key;section.style.setProperty('--detail-color',({1:'#70bf8b',2:'#e3bf72',3:'#b595dd',0:'#6ac1b4'})[key]||'#aab6c4');title.className='ancient-act-title';title.textContent=key?'第 '+key+' 幕':'跨幕共用';items.className='ancient-act-grid';items.append(...groups.get(key));section.append(title,items);(actColumns.get(key)||actColumns.get(1)).append(section);}
  grid.replaceWith(sections);
  const template = document.getElementById('ancient-desktop-menu');
  if (template) {
    const menu = template.content.firstElementChild.cloneNode(true);
    choices.push(...menu.querySelectorAll('[data-detail-key]'));
    list.append(menu);
  }
 }
 const fittedNames=choices.filter(item=>!item.classList.contains('event')).map(item=>item.querySelector('.compact-detail-name')).filter(Boolean);
 function fitListName(name){if(!name.clientWidth)return;let size=16;name.style.whiteSpace='nowrap';name.style.fontSize=size+'px';while(name.scrollWidth>name.clientWidth+1&&size>10){size-=.5;name.style.fontSize=size+'px';}if(name.scrollWidth>name.clientWidth+1)name.style.whiteSpace='normal';}
 const nameObserver=new ResizeObserver(entries=>{for(const entry of entries)fitListName(entry.target);});for(const name of fittedNames){fitListName(name);nameObserver.observe(name);}
 function open(key){const page=data.pages[key];if(!page)return;if(encounterBrowser){list.hidden=true;panel.hidden=false;}for(const item of choices){const active=item.dataset.detailKey===key;item.classList.toggle('is-detail-selected',active);if(active)item.setAttribute('aria-current','true');else item.removeAttribute('aria-current');}heading.hidden=true;frame.hidden=false;heading.textContent=page.name;frame.title=page.name+'詳細內容';const base=new URL('data/'+key.split('-')[0]+'/'+key,location.href).href;const selectedItem=choices.find(item=>item.dataset.detailKey===key),detailColor=selectedItem?getComputedStyle(selectedItem).getPropertyValue('--detail-color').trim():'';frame.srcdoc=page.html.replace(/<head\b[^>]*>/i,head=>head+'<base href="'+base+'">'+(detailColor?'<style>:root{--detail-highlight-color:'+detailColor+'}</style>':''));if(encounterBrowser)requestAnimationFrame(()=>panel.querySelector('.encounter-back').focus());}
 list.addEventListener('click',event=>{const item=event.target.closest('[data-detail-key]');if(!item||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();open(item.dataset.detailKey);});
 list.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('.entry[data-detail-key]')){event.preventDefault();open(event.target.dataset.detailKey);}});
 frame.addEventListener('load',()=>{const doc=frame.contentDocument;if(!doc)return;doc.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!link)return;const href=link.getAttribute('href');if(href.startsWith('#')){let id;try{id=decodeURIComponent(href.slice(1));}catch{return;}const target=doc.getElementById(id);if(target){event.preventDefault();if(id.startsWith('relic-')){for(const item of doc.querySelectorAll('.is-relic-highlighted'))item.classList.remove('is-relic-highlighted');target.classList.add('is-relic-highlighted');}target.style.scrollMarginTop='16px';target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});}return;}const url=new URL(href,doc.baseURI),key=url.pathname.split('/').pop();if(data.pages[key]){event.preventDefault();open(key);}else if(url.href.split('#')[0]===location.href.split('#')[0]){event.preventDefault();list.focus();}else{link.target='_blank';link.rel='noopener';}});});
 if(main.classList.contains('ancient-browser')){
  let detailObserver;
  frame.setAttribute('scrolling','no');
  frame.addEventListener('load',()=>{
   detailObserver?.disconnect();
   const doc=frame.contentDocument,content=doc?.getElementById('main-content');
   if(!content)return;
   const style=doc.createElement('style');
   style.textContent='html,body{min-height:0!important;height:auto!important;overflow:hidden!important}';
   doc.head.append(style);
   const resize=()=>{frame.style.height=Math.ceil(content.getBoundingClientRect().height)+'px';};
   detailObserver=new ResizeObserver(resize);detailObserver.observe(content);resize();
   main.scrollTo({top:0,behavior:'instant'});
  });
  list.remove();
  document.getElementById('ancient-desktop-menu')?.remove();
  open('ancient-neow.html');
 }
}

function cleanEventDetail(){
 const main=document.getElementById('main-content');if(!main)return;
 for(const a of main.querySelectorAll('a'))if(a.textContent.trim()==='所有事件')a.remove();
 const hero=[...main.querySelectorAll('div')].find(e=>e.className.includes('lg:sticky')&&e.querySelector('img'));
 if(hero){const grid=hero.parentElement,image=hero.querySelector('img'),title=grid.querySelector('h1');if(image&&title){const header=document.createElement('div'),text=document.createElement('div');header.className='detail-identity';text.className='detail-identity-text';title.before(header);text.append(title);while(header.nextElementSibling&&(header.nextElementSibling.matches('p')||header.nextElementSibling.className.includes('flex-wrap')))text.append(header.nextElementSibling);image.className='detail-portrait';image.removeAttribute('style');header.append(text,image);}hero.remove();grid.style.display='block';}
 for(const h of main.querySelectorAll('h2'))if(h.textContent.includes('的其他事件')){const section=h.closest('section');if(section)section.remove();}
}
function cleanOtherDetail(kind){
 const main=document.getElementById('main-content');if(!main)return;
 for(const link of main.querySelectorAll('a'))if(['所有怪物','全部怪物','所有先古之民','全部先古之民'].includes(link.textContent.trim()))link.remove();
 if(kind==='monster'){
  const title=main.querySelector('h1'),header=title?.parentElement?.parentElement;
  if(header){header.classList.add('monster-detail-header');header.parentElement.style.maxWidth='none';header.parentElement.style.width='100%';}
 }else if(kind==='ancient'){
  const banner=[...main.querySelectorAll('div')].find(e=>e.className.includes('aspect-')&&e.querySelector('img'));
  if(banner){banner.parentElement.style.backgroundImage='none';banner.remove();}
  const content=[...main.querySelectorAll('div')].find(e=>e.className.includes('bg-gradient-to-t'));
  if(content){content.style.paddingTop='0';content.style.backgroundImage='none';const avatar=content.querySelector('img');if(avatar){avatar.parentElement.classList.add('detail-portrait-wrap');avatar.parentElement.style.width='112px';avatar.parentElement.style.height='112px';avatar.parentElement.style.flex='0 0 112px';}}
 }
}
function normalizeDetailHeader(){
 const main=document.getElementById('main-content');if(!main)return;
 const version=main.querySelector('[aria-label="切換遊戲版本"]');
 if(version){const row=version.parentElement,wrapper=row.parentElement;if(wrapper!==main&&wrapper.children.length===1)wrapper.remove();else row.remove();}
 let title=main.querySelector('h1');
 if(document.body.dataset.detailKind==='ancient'){
  const content=[...main.querySelectorAll('div')].find(e=>e.className.includes('bg-gradient-to-t'));
  const original=content?.querySelector('.font-bold');
  if(original){title=document.createElement('h1');title.textContent=original.textContent;original.replaceWith(title);}
  if(content){content.style.padding='0';content.parentElement.style.border='0';content.parentElement.style.background='none';}
 }
 if(title)title.classList.add('detail-title');
 if(['event','ancient'].includes(document.body.dataset.detailKind))for(const card of main.querySelectorAll('.database-card-link,.select-none')){
  card.style.marginLeft='0';card.style.marginRight='auto';
  const lane=card.closest('div.flex.flex-wrap');
  if(lane){lane.classList.add('detail-card-lane');lane.style.justifyContent='flex-start';lane.style.alignItems='flex-start';
   if(document.body.dataset.detailKind==='event'&&lane.parentElement.className.includes('sm:flex')){lane.parentElement.style.display='block';lane.style.marginTop='12px';}
  }
  if(card.parentElement.classList.contains('items-center'))card.parentElement.style.alignItems='flex-start';
 }

}
function build(kind){const file=kind+'.html';let html=fs.readFileSync(file,'utf8');if(html.includes('id="detail-pane-data"'))throw Error('Rebuild the original page before adding detail panes');html=html.replace(/(<a class="details"[^>]*>)[\s\S]*?(<\/a>)/g,'$1$2');const slugs=kind==='ancient'?JSON.parse(fs.readFileSync('data/ancient/catalog.json')).slugs:JSON.parse(fs.readFileSync('data/'+kind+'/catalog.json')).items.map(x=>x.slug);const pages={};for(const slug of slugs){const key=kind+'-'+slug+'.html';let detail=fs.readFileSync('data/'+key.split('-')[0]+'/'+key,'utf8');if(!detail.includes('<head>'))detail=detail.replace(/(<html[^>]*>)/,'$1<head>').replace('<body>','</head><body>');detail=detail.replace('<body>','<body data-detail-kind="'+kind+'">');detail=detail.replace('</head>','<style>'+embedStyles+typography+detailHeaderStyles+'</style></head>');if(kind==='event')detail=detail.replace('</body>','<script>('+cleanEventDetail.toString()+')();</script></body>');if(kind==='monster'||kind==='ancient')detail=detail.replace('</body>','<script>('+cleanOtherDetail.toString()+')('+JSON.stringify(kind)+');</script></body>');detail=detail.replace('</body>','<script>('+normalizeDetailHeader.toString()+')();</script></body>');pages[key]={name:(detail.match(/<title>(.*?)<\/title>/)?.[1]||slug).split('｜')[0].split(' | ')[0],html:detail};}
const menu=kind==='ancient'?require('../ancient/desktop-ancient.cjs').desktopMenu():'';
html=html.replace('</body>','<style>'+styles+typography+'</style>'+menu+'<script type="application/json" id="detail-pane-data">'+JSON.stringify({pages}).replace(/</g,'\\u003c')+'</script><script>('+runtime.toString()+')();</script></body>');if(kind==='event')html=html.replace('</head>','<link rel="stylesheet" href="assets/event/catalog-browser.css"></head>').replace('</body>','<script src="assets/event/catalog-browser.js"></script></body>');fs.writeFileSync(file,html);console.log('Added split detail pane:',kind);}
module.exports={build};
