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
  label:'<button type="button" class="detail-tier-trigger" data-card-tier="'+esc(id)+'" aria-label="Open Tier commentary" aria-haspopup="dialog" aria-expanded="false" aria-controls="card-tier-dialog">'+label+'</button>',
  content:'<section class="detail-tier-section" id="'+esc(id)+'" aria-label="Jorbs commentary" hidden><p class="detail-tier-comment" lang="en">'+esc(comment?.text||'No commentary available for this card.').replace(/\r?\n/g,'<br>')+'</p><a class="detail-tier-source" href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.name)+'</a></section>'
 };
};
