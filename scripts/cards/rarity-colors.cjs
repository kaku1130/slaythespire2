module.exports = `
/* Use a deeper blue consistently for Uncommon text. */
html body #main-content [data-rarity=Uncommon] {--rarity-color:#4f9bd9!important}
html body #main-content .card-detail-row[data-rarity=Uncommon] .card-detail {--detail-rarity-color:#4f9bd9}
html body #main-content :is([data-stat-rarity=Uncommon],[data-relic-rarity=Uncommon],.rarity[data-rarity=Uncommon],.card-text-link[data-rarity=Uncommon],.build-card-list a[data-rarity=Uncommon]) {color:#4f9bd9!important}
html body #main-content .potion-section[data-rarity=Uncommon]>.potion-section-title {color:#4f9bd9}
html body #main-content :is(#card-filter-rarity button[value=Uncommon],[data-catalog-filter=rarity][value=Uncommon],button[data-rarity-filter=Uncommon]) {--selection-color:#4f9bd9!important;--rarity-color:#4f9bd9!important}

/* Rare matches the Block keyword on the reference True Grit page. */
html body #main-content [data-rarity=Rare] {--rarity-color:#efc851!important;--plain-rarity-color:#efc851!important;--detail-rarity-color:#efc851}
html body #main-content .card-detail-row[data-rarity=Rare] .card-detail {--detail-rarity-color:#efc851}
html body #main-content :is([data-stat-rarity=Rare],[data-label-rarity=Rare],[data-relic-rarity=Rare],.rarity[data-rarity=Rare],.card-text-link[data-rarity=Rare],.build-card-list a[data-rarity=Rare]) {color:#efc851!important}
html body #main-content .potion-section[data-rarity=Rare] {--group-color:#efc851!important}
html body #main-content .potion-section[data-rarity=Rare]>.potion-section-title {color:#efc851}
html body main#main-content#main-content#main-content :is(#card-filter-rarity button[value=Rare],[data-catalog-filter=rarity][value=Rare],button[data-rarity-filter=Rare]) {--selection-color:#efc851!important;--rarity-color:#efc851!important;--plain-rarity-color:#efc851!important;--rarity-text-color:#efc851!important;color:#efc851!important}
`;

module.exports += `
/* Common has its own light green, distinct from Basic and Starter. */
html body #main-content [data-rarity=Common] {--rarity-color:#a8dca4!important;--plain-rarity-color:#a8dca4!important;--detail-rarity-color:#a8dca4;--card-name-color:#a8dca4}
html body #main-content .card-detail-row[data-rarity=Common] .card-detail {--detail-rarity-color:#a8dca4}
html body #main-content :is([data-stat-rarity=Common],[data-label-rarity=Common],[data-relic-rarity=Common],.rarity[data-rarity=Common],.guide-resource-name[data-rarity=Common],.card-text-link[data-rarity=Common]) {color:#a8dca4!important}
html body #main-content .potion-section[data-rarity=Common] {--group-color:#a8dca4!important}
html body #main-content .potion-section[data-rarity=Common]>.potion-section-title {color:#a8dca4}
html body main#main-content#main-content#main-content :is(#card-filter-rarity button[value=Common],[data-catalog-filter=rarity][value=Common],button[data-rarity-filter=Common]) {--selection-color:#a8dca4!important;--rarity-color:#a8dca4!important;--plain-rarity-color:#a8dca4!important;--rarity-text-color:#a8dca4!important;color:#a8dca4!important}
`;
