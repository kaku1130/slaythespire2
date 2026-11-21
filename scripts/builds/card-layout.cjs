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
