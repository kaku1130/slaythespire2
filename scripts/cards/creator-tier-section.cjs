const renderLabel=require('./creator-tier-labels.cjs');
const {comments}=require('../../data/cards/creator-comments.json');
const {comments:translations}=require('../../data/cards/creator-comments-zh-TW.json');
const {characters}=require('../../data/cards/creator-tiers.json');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=(card,{prefix='detail-'+card.id.toLowerCase(),tierPrefix=false,padded=false}={})=>{
 const label=renderLabel(card,{linked:false,tierPrefix,padded});
 if(!label)return {label:'',content:''};
 const comment=comments[card.id];
 const source=characters[card.character].Jorbs;
 const translated=comment?translations[card.id]?.text:'這張卡片目前沒有評語。';
 if(comment&&!translated)throw Error('Missing Traditional Chinese commentary: '+card.id);
 const id=prefix+'-tier-comment';
 return {
  label:'<button type="button" class="detail-tier-trigger" data-card-tier="'+esc(id)+'" aria-label="Toggle Tier commentary" aria-expanded="false" aria-controls="'+esc(id)+'">'+label+'</button>',
  content:'<section class="detail-tier-section" id="'+esc(id)+'" role="region" aria-label="'+esc(card.name)+' Tier commentary" hidden><p class="detail-tier-comment" lang="en">'+esc(comment?.text||'No commentary available for this card.').replace(/\r?\n/g,'<br>')+'</p><p class="detail-tier-translation" lang="zh-Hant">'+esc(translated).replace(/\r?\n/g,'<br>')+'</p><a class="detail-tier-source" href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.name)+'</a></section>'
 };
};
