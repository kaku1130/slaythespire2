module.exports = `
/* Core and support cards show only linked Chinese names. */
html body main#main-content .build-content .build-guide-cards {
 display:block;min-width:0;line-height:1.8;overflow-wrap:anywhere;
}
html body main#main-content .build-content .build-guide-cards > .card-text-link {
 display:inline;overflow-wrap:anywhere;line-height:inherit;
}
html body main#main-content :is(.guide-strategy,.guide-rationale,.build-guide-cards) .card-text-link {
 font-weight:700;
}
html body main#main-content :is(.guide-strategy,.guide-rationale,.build-guide-cards) .card-text-link[data-rarity=Rare] {
 color:#efc851!important;
}
html body main#main-content .build-inline-card-effect {
 font-size:.8em;font-weight:400;color:#aab6c4;
}
html body main#main-content .build-inline-card-effect .guide-keyword {
 font-weight:400;color:inherit;
}
`;

module.exports += `
html body main#main-content .build-content .build-guide-cards {display:grid;grid-template-columns:minmax(0,1fr);gap:24px;min-width:0}
html body main#main-content .build-guide-card {min-width:0}
html body main#main-content .build-guide-card>.card-detail {box-sizing:border-box;width:100%;max-width:none;min-width:0;margin:0}
html body main#main-content .build-guide-card .detail-title {font-size:2rem;line-height:1.25}
html body main#main-content .build-guide-card .detail-title :is(.detail-name-zh,.detail-name-en) {font:inherit}
`;
