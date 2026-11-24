const {characters}=require('../../data/cards/creator-tiers.json');
const palette=require('../../data/ancient/tier-palette.json');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=(card,{tierSuffix=false,linked=true}={})=>{
 const lists=characters[card.character];if(!lists)return '';
 return ['Jorbs'].map(author=>{
  const list=lists[author],tier=list.ratings[card.id]||'—',color=palette[tier]?.background||(tier==='F'?'#b595dd':'#788491');
  const label=tierSuffix?(tier==='—'?'Unranked':tier+'-Tier'):tier;
  if(!linked)return '<span class="detail-creator-rating" data-author="'+author+'"><span class="creator-tier-badge" data-tier="'+esc(tier)+'" style="--creator-tier-color:'+esc(color)+'" aria-label="'+esc(author+' '+(tier==='—'?'Unranked':'Tier '+tier))+'">'+esc(label)+'</span></span>';
  return '<a class="detail-creator-rating" data-author="'+author+'" href="'+esc(list.url)+'" target="_blank" rel="noopener noreferrer" title="'+esc(list.name+' · '+(tier==='—'?'未列入此清單':'Tier '+tier))+'"><span class="creator-tier-badge" data-tier="'+esc(tier)+'" style="--creator-tier-color:'+esc(color)+'" aria-label="'+esc(author+' '+(tier==='—'?'Unranked':'Tier '+tier))+'">'+esc(label)+'</span></a>';
 }).join('');
};
