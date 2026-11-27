const snapshot = require('../../data/relic/act-stats.json');
const items = new Map(snapshot.items.map(item => [item.id, item]));
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

module.exports = id => {
  const rows = [1, 2, 3].map(act => {
    const metric = items.get(id)?.acts[act];
    const value = metric?.value;
    if (value == null || !/\d/.test(String(value))) return '';
    return '<div class="relic-act-stat" data-act="' + act + '"><dt>Act ' + act + '</dt><dd>' +
      '<strong class="relic-act-value">' +
      escape(value) + '</strong></dd></div>';
  }).join('');
  return rows ? '<dl class="relic-act-stats" lang="en" aria-label="Untapped.gg 各章節 Bought / Picked 比率">' + rows + '</dl>' : '';
};
