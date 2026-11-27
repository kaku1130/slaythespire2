const snapshot = require('../../data/relic/act-stats.json');
const items = new Map(snapshot.items.map(item => [item.id, item]));
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

module.exports = id => '<dl class="relic-act-stats" lang="en" aria-label="Untapped.gg 各章節 Bought / Picked 比率">' +
  [1, 2, 3].map(act => {
    const metric = items.get(id)?.acts[act];
    const value = metric?.value ?? '—';
    return '<div class="relic-act-stat" data-act="' + act + '"><dt>Act ' + act + '</dt><dd>' +
      '<strong class="relic-act-value"' + (value === '—' ? ' title="來源沒有此章節的統計資料"' : '') + '>' +
      escape(value) + '</strong></dd></div>';
  }).join('') + '</dl>';
