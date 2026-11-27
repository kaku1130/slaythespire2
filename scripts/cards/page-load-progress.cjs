module.exports = html => {
  const script = `<script data-site-load-progress>(()=>{
    if(window.parent===window)return;
    const report=stage=>window.parent.postMessage({type:'sts2-page-progress',stage},'*');
    report('parsing');
    document.addEventListener('DOMContentLoaded',()=>report('initialized'),{once:true});
  })();</script>`;
  const existing=/<script data-site-load-progress>[\s\S]*?<\/script>/;
  if(existing.test(html))return html.replace(existing,script);
  return html.replace(/<head\b[^>]*>|<html\b[^>]*>(?!\s*<head\b)/i, tag => tag + script);
};
