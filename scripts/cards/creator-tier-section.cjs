const renderLabel=require('./creator-tier-labels.cjs');
module.exports=(card,{tierPrefix=false,padded=false}={})=>{
 const rating=renderLabel(card,{linked:false,tierPrefix,padded});
 const badge=rating.match(/<span class="creator-tier-badge"[^>]*>[\s\S]*?<\/span>/)?.[0]||'';
 return {label:badge.replace('class="creator-tier-badge"','class="detail-tier-label creator-tier-badge"'),content:''};
};
