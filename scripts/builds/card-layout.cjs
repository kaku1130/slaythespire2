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
 font-size:clamp(30px,3vw,42px);line-height:1.25;
}
html body main#main-content .build-guide-card .detail-title :is(.detail-name-zh,.detail-name-en) {font:inherit}
html body main#main-content .build-guide-card .detail-effect-panel h4 {
 margin:0 0 9px;color:#aab8cb;font-size:13px;font-weight:600;line-height:1.6;letter-spacing:.05em;
}
html body main#main-content .build-guide-card .detail-build {font-size:16px}
`;
