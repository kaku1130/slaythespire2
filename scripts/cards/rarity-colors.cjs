module.exports = `
/* Use a deeper blue consistently for Uncommon text. */
html body #main-content [data-rarity=Uncommon] {--rarity-color:#4f9bd9!important}
html body #main-content .card-detail-row[data-rarity=Uncommon] .card-detail {--detail-rarity-color:#4f9bd9}
html body #main-content :is([data-stat-rarity=Uncommon],[data-relic-rarity=Uncommon],.rarity[data-rarity=Uncommon],.card-text-link[data-rarity=Uncommon],.build-card-list a[data-rarity=Uncommon]) {color:#4f9bd9!important}
html body #main-content .potion-section[data-rarity=Uncommon]>.potion-section-title {color:#4f9bd9}
html body #main-content :is(#card-filter-rarity button[value=Uncommon],[data-catalog-filter=rarity][value=Uncommon],button[data-rarity-filter=Uncommon],[data-filter-group=rarity][data-filter-value=Uncommon]) {--selection-color:#4f9bd9!important;--rarity-color:#4f9bd9!important}
`;
