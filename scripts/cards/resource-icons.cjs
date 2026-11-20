process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs');
const starImage='data:image/webp;base64,'+fs.readFileSync('assets/cards/icons/star-icon.webp').toString('base64');
const star='<span class="star-resource-icon" role="img" aria-label="輝星"></span>';
const styles=':root{--star-resource-image:url("'+starImage+'")}.star-resource-icon{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em;background-image:var(--star-resource-image);background-size:contain;background-position:center;background-repeat:no-repeat;margin:0;flex-shrink:0}';
const energyImage='data:image/webp;base64,'+fs.readFileSync('assets/cards/icons/energy-inline.webp').toString('base64');
const energy='<span class="energy-resource-icon" role="img" aria-label="能量"></span>';
const energyStyles=':root{--energy-resource-image:url("'+energyImage+'")}.energy-resource-icon{display:inline-block;width:1.05em;height:1.05em;vertical-align:-.15em;background-image:var(--energy-resource-image);background-size:contain;background-position:center;background-repeat:no-repeat;margin:0;flex-shrink:0}';
function energyFor(character) {
  const pool = ['Ironclad','Silent','Defect','Necrobinder','Regent'].includes(character) ? character.toLowerCase() : 'colorless';
  return '<img class="energy-resource-icon" src="assets/cards/source/card-template/energy_inline_' + pool + '.webp" alt="energy" style="width:1.05em;height:1.05em;margin:0 .03em;background:none">';
}
module.exports={star,energy,energyFor,styles:styles+energyStyles};
