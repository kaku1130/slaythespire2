process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs');
const starImage='data:image/webp;base64,'+fs.readFileSync('assets/cards/icons/star-icon.webp').toString('base64');
const star='<span class="star-resource-icon" role="img" aria-label="輝星"></span>';
const styles=':root{--star-resource-image:url("'+starImage+'")}.star-resource-icon{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em;background-image:var(--star-resource-image);background-size:contain;background-position:center;background-repeat:no-repeat;margin:0;flex-shrink:0}';
const energyImage='data:image/webp;base64,'+fs.readFileSync('assets/cards/icons/energy-inline.webp').toString('base64');
const energy='<span class="energy-resource-icon" role="img" aria-label="能量"></span>';
const energyStyles=':root{--energy-resource-image:url("'+energyImage+'")}.energy-resource-icon{display:inline-block;width:1.05em;height:1.05em;vertical-align:-.15em;background-image:var(--energy-resource-image);background-size:contain;background-position:center;background-repeat:no-repeat;margin:0;flex-shrink:0}';
module.exports={star,energy,styles:styles+energyStyles};
