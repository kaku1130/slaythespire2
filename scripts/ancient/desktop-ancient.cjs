
function removeDialogue(html) {
  return html.replace(/<section\b[^>]*>\s*<h2\b[^>]*>\s*對話\s*<\/h2>[\s\S]*?<\/section>/g, '');
}

const menuEntries=[['neow','涅奧'],['darv','達弗'],['orobas','歐洛巴斯'],['pael','佩爾'],['tezcatara','特茲卡塔拉'],['nonupeipe','諾奴佩普'],['tanx','坦克斯'],['vakuu','瓦庫']];
function addTopRelicMenu(html,{active,prefix='../../',assets}={}) {
  const old=html.match(/<section\b[^>]*>\s*<h2\b[^>]*>其他(?:先古|遠古)之民的最強遺物<\/h2>[\s\S]*?<\/section>/)?.[0];
  if(!old)throw Error('Missing ancient relic menu');
  const menu='<section data-ancient-top-menu class="ancient-top-menu" aria-label="遠古之民選單"><div class="ancient-top-menu-grid">'+menuEntries.map(([slug,label])=>{
    const image=assets['/images/ancients/icon/'+slug+'.webp'];
    if(!image)throw Error('Missing ancient menu icon '+slug);
    const current=slug===active,tag=current?'span':'a';
    const destination=current?' role="link" aria-current="page" aria-disabled="true"':' href="ancient-'+slug+'.html"';
    return '<'+tag+destination+' aria-label="'+label+'" title="'+label+'"><img src="'+prefix+image+'" alt="" width="48" height="48"><span class="ancient-menu-name">'+label+'</span></'+tag+'>';
  }).join('')+'</div></section>';
  html=html.replace(old,'');
  return /<main\b/.test(html)?html.replace(/(<main\b[^>]*>)/,'$1'+menu):menu+html;
}
const styles=`
html body main#main-content .ancient-top-menu {margin:0 0 24px}
html body main#main-content .ancient-top-menu-grid {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(2,128px);gap:8px;width:100%}
html body main#main-content .ancient-top-menu-grid>:is(a,span) {display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;width:100%;min-width:0;height:128px;padding:8px;border:1px solid #344454;border-radius:8px;background:#0b1119;color:#e3e8ee;text-decoration:none}
html body main#main-content .ancient-top-menu-grid>a:is(:hover,:focus-visible) {border-color:#238cc2;background:#163047}
html body main#main-content .ancient-top-menu-grid>[aria-disabled=true] {filter:grayscale(1);opacity:.5;border-color:#293340;background:#10151b;color:#8a949e;cursor:default}
html body main#main-content .ancient-top-menu-grid>:is(a,span)>img {position:static;display:block;width:48px;height:48px;max-width:100%;object-fit:contain}
html body main#main-content .ancient-top-menu-grid .ancient-menu-name {display:flex;align-items:center;justify-content:center;width:100%;min-width:0;min-height:2.8em;font:600 14px/1.4 Arial,"Microsoft JhengHei",sans-serif;text-align:center;white-space:normal;overflow-wrap:anywhere}
`;
module.exports = {removeDialogue,addTopRelicMenu,styles};
