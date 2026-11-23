const icons=require('../cards/resource-icons.cjs');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=item=>item.descEnParts.map(part=>part.resource?(part.resource==='energy'?icons.energy:icons.star):part.color?'<span style="color:'+escape(part.color)+'">'+escape(part.text)+'</span>':escape(part.text)).join('');
