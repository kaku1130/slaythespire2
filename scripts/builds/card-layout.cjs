module.exports = `
/* Use the card page presentation for core and support cards. */
html body main#main-content .build-content .build-guide-cards {
 display:grid;grid-template-columns:minmax(0,1fr);gap:24px;min-width:0;
}
html body main#main-content .build-content .build-guide-card {min-width:0}
html body main#main-content .build-content .build-guide-card>.card-detail {
 box-sizing:border-box;width:100%;max-width:none;min-width:0;margin:0;
 --card-tier-S:#d05a68;--card-tier-A:#f97316;--card-tier-B:#4e8dcc;--card-tier-C:#4e9c68;--card-tier-D:#828e9d;
}
html body main#main-content .build-guide-card .detail-title {
 font-size:2rem;font-weight:700;line-height:1.25;
}
html body main#main-content .build-guide-card .detail-title :is(.detail-name-zh,.detail-name-en) {font:inherit}
html body main#main-content .build-guide-card .detail-overview {grid-template-columns:minmax(0,1fr)}
html body main#main-content .build-guide-card .detail-overview>header {min-width:0;width:100%}
html body main#main-content .build-guide-card .detail-name-line {display:grid;grid-template-columns:1.2em minmax(0,1fr) 1.2em;align-items:start;gap:8px;width:100%;min-width:0}
html body main#main-content .build-guide-card .detail-name-line>.detail-name-zh {grid-column:2;min-width:0;overflow-wrap:anywhere}
html body main#main-content .build-guide-card .detail-name-line>.detail-name-tier {grid-column:3;display:inline-flex;justify-content:center;align-items:center;box-sizing:border-box;width:1.2em;min-height:1.25em;border-radius:4px;color:#fff;font:inherit;text-decoration:none;background:var(--name-tier-color,#788491)}
html body main#main-content .build-guide-card .detail-effect-panel h4 {
 margin:0 0 9px;color:#aab8cb;font-size:13px;font-weight:600;line-height:1.6;letter-spacing:.05em;
}
html body main#main-content .build-guide-card .detail-build {font-size:16px}
`;
module.exports += Object.entries(require('../../data/ancient/tier-palette.json')).map(([tier,{background}]) => '\nhtml body main#main-content .build-guide-card .detail-name-tier[data-tier='+tier+'] {--name-tier-color:'+background+'}').join('');
