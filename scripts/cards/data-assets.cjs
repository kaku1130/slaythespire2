process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs = require('node:fs');
const categories = ['ancient','builds','cards','event','monster','potion','relic'];
function load() {
  return Object.assign({}, ...categories.map(category => JSON.parse(fs.readFileSync('data/' + category + '/assets.json', 'utf8'))));
}
function save(assets) {
  const groups = Object.fromEntries(categories.map(category => [category, {}]));
  for (const [source, target] of Object.entries(assets)) {
    const category = target.split('/')[1];
    if (!groups[category]) throw Error('Unknown asset category: ' + target);
    groups[category][source] = target;
  }
  for (const category of categories) {
    fs.mkdirSync('data/' + category, {recursive:true});
    fs.writeFileSync('data/' + category + '/assets.json', JSON.stringify(groups[category], null, 2));
  }
}
module.exports = {load, save};
