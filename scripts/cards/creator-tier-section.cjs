const renderLabel=require('./creator-tier-labels.cjs');
const {comments}=require('../../data/cards/creator-comments.json');
const {characters}=require('../../data/cards/creator-tiers.json');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=card=>{
 const label=renderLabel(card,{tierSuffix:true,linked:false});
 if(!label)return '';
 const comment=comments[card.id];
 if(!comment)return '<div class="detail-tier-heading">'+label+'</div>';
 const source=characters[card.character].Jorbs;
 return '<details class="detail-tier-toggle" aria-label="Tier"><summary class="detail-tier-heading">'+label+'</summary><section class="detail-tier-section" aria-label="Jorbs commentary"><p class="detail-tier-comment" lang="en">'+esc(comment.text).replace(/\r?\n/g,'<br>')+'</p><a class="detail-tier-source" href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.name)+'</a></section></details>';
};
