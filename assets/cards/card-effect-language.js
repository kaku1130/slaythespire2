(() => {
  const toolbar=document.querySelector('#tools .card-search,.filters .catalog-search-tools');
  const menu=toolbar?.querySelector('.filter-menu-toggle');
  if(!menu||toolbar.querySelector('.card-language-toggle'))return;
  const button=document.createElement('button');
  button.type='button';button.className='card-language-toggle';
  menu.before(button);
  const kind=document.querySelector('.entry.relic')?'relic':document.querySelector('.entry.potion')?'potion':'card';
  const name={card:'卡片',relic:'遺物',potion:'藥水'}[kind];
  const key='sts2_'+kind+'_effect_language';
  let language='en';
  try{
    const cookie=location.protocol==='file:'?null:document.cookie.split(';').map(value=>value.trim()).find(value=>value.startsWith(key+'='));
    const saved=location.protocol==='file:'?localStorage.getItem(key):cookie?.slice(key.length+1);
    if(saved==='zh')language='zh';
  }catch{}
  const variants=[...document.querySelectorAll('#card-scroll [data-effect-language],#catalog-scroll [data-effect-language]')];
  function show(value){
    language=value;
    for(const variant of variants)variant.hidden=variant.dataset.effectLanguage!==value;
    button.textContent=value==='zh'?'EN':'中';
    button.title='切換為'+(value==='zh'?'英文':'中文')+name+'效果';
    button.setAttribute('aria-label',button.title);
    button.setAttribute('aria-pressed',String(value==='zh'));
    document.documentElement.dataset.cardEffectLanguage=value;
  }
  show(language);
  button.addEventListener('click',()=>{
    show(language==='en'?'zh':'en');
    try{
      if(location.protocol==='file:')localStorage.setItem(key,language);
      else document.cookie=key+'='+language+'; Max-Age=31536000; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
    }catch{}
  });
})();
