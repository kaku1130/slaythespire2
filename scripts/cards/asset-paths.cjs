process.chdir(require('node:path').resolve(__dirname,'../..'));
// Keep downloaded assets in the same domain folders as the local pages.
const path = require('node:path');
module.exports = function assetPath(url) {
  const parts = new URL(url, 'https://slaythespire2.net').pathname.split('/').filter(Boolean);
  const groups = {potions:'potion', relics:'relic', events:'event', monsters:'monster', ancients:'ancient', intents:'monster', powers:'monster', cards:'cards', 'card-template':'cards'};
  const category = groups[parts[1]];
  if (parts[0] !== 'images' || !category || parts.length < 3) throw Error('Unknown asset category: ' + url);
  const subfolder = category === 'cards' ? 'source/' + parts[1] : ['intents','powers'].includes(parts[1]) ? parts[1] : 'images';
  const result = 'assets/' + category + '/' + subfolder + '/' + parts.slice(2).join('/');
  if (!path.resolve(result).startsWith(path.resolve('assets') + path.sep)) throw Error('Invalid asset path');
  return result;
};
