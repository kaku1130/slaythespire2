const fs = require('node:fs');
const names = {Ironclad:'ironclad', Silent:'silent', Defect:'defect', Necrobinder:'necrobinder', Regent:'regent'};
module.exports = function characterFilters(html) {
  return html.replace(/<button\b([^>]*\bvalue="(Ironclad|Silent|Defect|Necrobinder|Regent)"[^>]*)>\2<\/button>/g, (_, attributes, name) => {
    const image = fs.readFileSync(require('node:path').resolve(__dirname, '../../assets/cards/icons/' + names[name] + '.webp'));
    return '<button' + attributes + ' aria-label="' + name + '" title="' + name + '"><img class="filter-character-icon" src="data:image/webp;base64,' + image.toString('base64') + '" alt="" width="32" height="32"></button>';
  });
};
