const renderLabel=require('./creator-tier-labels.cjs');
const {comments}=require('../../data/cards/creator-comments.json');
const {characters}=require('../../data/cards/creator-tiers.json');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=(card,{prefix='detail-'+card.id.toLowerCase()}={})=>{
 const label=renderLabel(card,{linked:false});
 if(!label)return {label:'',content:''};
 const comment=comments[card.id];
 const source=characters[card.character].Jorbs;
 const id=prefix+'-tier-comment';
 return {
  label:'<button type="button" class="detail-tier-trigger" data-card-tier="'+esc(id)+'" aria-label="Open Tier commentary" aria-haspopup="dialog" aria-expanded="false" aria-controls="'+esc(id)+'">'+label+'</button>',
  content:'<section class="detail-tier-section" id="'+esc(id)+'" role="dialog" aria-labelledby="'+esc(id)+'-title" hidden><header class="tier-popup-header"><h3 id="'+esc(id)+'-title"><span class="tier-popup-name" lang="en">'+esc(card.name)+'</span>'+label+'</h3></header><p class="detail-tier-comment" lang="en">'+esc(comment?.text||'No commentary available for this card.').replace(/\r?\n/g,'<br>')+'</p><a class="detail-tier-source" href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.name)+'</a></section>'
 };
};
