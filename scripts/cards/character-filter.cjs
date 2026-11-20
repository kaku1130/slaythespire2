const fs = require('node:fs');
const names = {Ironclad:'ironclad', Silent:'silent', Defect:'defect', Necrobinder:'necrobinder', Regent:'regent'};
module.exports = function characterFilters(html, {iconPaths = {}, labels = {}} = {}) {
  const values = [...new Set([...Object.keys(names), ...Object.keys(iconPaths)])].join('|');
  const buttons = new RegExp('<button\\b([^>]*\\bvalue="(' + values + ')"[^>]*)>[^<]*<\\/button>', 'g');
  return html.replace(buttons, (_, attributes, name) => {
    const imagePath = iconPaths[name] || 'assets/cards/icons/' + names[name] + '.webp';
    const image = fs.readFileSync(require('node:path').resolve(__dirname, '../..', imagePath));
    const label = labels[name] || name;
    return '<button' + attributes + ' aria-label="' + label + '" title="' + label + '"><img class="filter-character-icon" src="data:image/webp;base64,' + image.toString('base64') + '" alt="" width="32" height="32"></button>';
  });
};
