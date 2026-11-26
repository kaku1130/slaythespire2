const order=require('./ancient-order.cjs');
const names={neow:'涅奧',orobas:'歐洛巴斯',pael:'佩爾',tezcatara:'特茲卡塔拉',nonupeipe:'諾奴佩普',tanx:'坦克斯',vakuu:'瓦庫',darv:'達弗'};
const owners=new Map(Object.entries(order).flatMap(([slug,ids])=>ids.map(id=>[id,slug])));
const iconPath=slug=>'assets/relic/icons/ancients/'+slug+'.webp';
function renderFilterMenu(){
 return '<div class="relic-ancient-menu" role="group" aria-label="遠古之民">'+Object.keys(order).map(slug=>
  '<button type="button" data-catalog-filter="ancient" value="'+slug+'" aria-pressed="false" aria-label="'+names[slug]+'" title="'+names[slug]+'"><img src="'+iconPath(slug)+'" alt="" width="32" height="32"></button>'
 ).join('')+'</div>';
}
function renderOwnerIcon(id){
 const slug=owners.get(id);
 return slug?'<span class="relic-ancient-icon" title="'+names[slug]+'" aria-label="'+names[slug]+'"><img src="'+iconPath(slug)+'" alt="" width="20" height="20"></span>':'';
}
module.exports={order,owners,renderFilterMenu,renderOwnerIcon};
