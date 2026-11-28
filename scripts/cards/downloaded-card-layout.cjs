const card='html body main#main-content#main-content#main-content #card-scroll .card-detail[data-catalog-layout][data-card-presentation="download"]';
module.exports=`
/* Downloaded full-card images keep the original game frame, name and effect. */
html body[data-view=grid] main#main-content#main-content#main-content #card-scroll .card-detail-row:has([data-card-presentation="download"]) {grid-row:auto;grid-column:auto;align-self:stretch}
${card} {display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:4px;box-sizing:border-box;width:100%;height:100%;margin:0;padding:12px 0;text-align:center}
${card} .downloaded-card-heading>.downloaded-card-title {position:static;display:grid;place-items:center;flex:none;box-sizing:border-box;width:fit-content;max-width:calc(100% - 80px);min-height:56px;margin:0 auto;color:#e3e8ee;font:700 clamp(20px,8cqi,28px)/1.3 Arial,"Microsoft JhengHei",sans-serif;text-align:center;overflow-wrap:anywhere}
${card} .downloaded-card-title>.detail-name-zh {display:block;width:100%;text-align:center;font:inherit}
${card} .detail-name-zh>:is(.downloaded-card-primary-name,.downloaded-card-alias) {display:inline-block;max-width:100%;vertical-align:top;overflow-wrap:anywhere}
${card}>.downloaded-card-heading {position:relative;display:block;box-sizing:border-box;width:90%;max-width:90%;margin:0;padding:0}
${card}>.downloaded-card-links {display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 10px;box-sizing:border-box;width:90%;max-width:90%;margin:4px 0 0;padding:0;border:0;background:transparent;box-shadow:none}
${card}>.downloaded-card-art {position:relative;display:block;flex:none;box-sizing:border-box;width:100%;margin:0;padding:0;border:0;background:transparent;aspect-ratio:512/654}
${card} .downloaded-card-unavailable {display:grid;place-items:center;box-sizing:border-box;width:100%;height:100%;padding:16px;border:1px solid #303d4e;border-radius:9px;color:#aab6c4;font:16px/1.6 Arial,"Microsoft JhengHei",sans-serif}
${card} .downloaded-card-image {display:block;width:100%;height:auto;aspect-ratio:512/654;object-fit:contain;margin:0;border:0;border-radius:0}
${card} [data-card-image-version][hidden] {display:none!important}
${card} .downloaded-card-title>.downloaded-card-tier {position:absolute;left:0;top:50%;display:flex;align-items:center;justify-content:center;width:32px;min-height:32px;margin:0;transform:translateY(-50%)}
${card} .downloaded-card-tier>.detail-tier-label {display:inline-flex;align-items:center;justify-content:center;flex:0 0 32px;box-sizing:border-box;width:32px;height:32px;min-width:32px;min-height:32px;margin:0;padding:0;border:0;border-radius:4px;background:var(--creator-tier-color,#788491);color:#000;font:700 18px/1.4 Arial,sans-serif;cursor:default;pointer-events:none}
${card} .downloaded-card-title>.downloaded-card-upgrade {position:absolute;right:0;top:50%;display:flex;align-items:center;justify-content:flex-end;width:32px;margin:0;transform:translateY(-50%)}
${card} .downloaded-card-upgrade>button {display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:32px;min-width:32px;height:32px;min-height:32px;margin:0;padding:0;border:1px solid #7fff00;border-radius:4px;background:#101923;color:#7fff00;font:700 18px/1.4 Arial,sans-serif;white-space:nowrap;cursor:pointer;transition:background-color .15s,border-color .15s,box-shadow .15s,transform .08s,filter .15s}
${card} .downloaded-card-upgrade-symbol {display:block;transform:translateY(-1px);font-family:"Segoe UI Symbol",Arial,sans-serif;font-variant-emoji:text;color:inherit}
${card} .downloaded-card-upgrade>button:not(:disabled):active {transform:scale(.88);filter:brightness(1.35)}
${card} .downloaded-card-upgrade>button[aria-pressed=true] {background:#7fff00;border-color:#7fff00;color:#000;box-shadow:inset 0 0 0 1px #b4ff6980;animation:card-upgrade-activate .24s ease-out}
${card} .downloaded-card-upgrade>button[aria-pressed=true]>.downloaded-card-upgrade-symbol {text-shadow:none}
@keyframes card-upgrade-activate {from{transform:scale(.88);filter:brightness(1.5)}to{transform:scale(1);filter:brightness(1)}}
@media(prefers-reduced-motion:reduce){${card} .downloaded-card-upgrade>button {animation:none;transition:none}}
${card} .downloaded-card-upgrade>button:disabled {border-color:#788491;background:#151b22;color:#788491;opacity:.6;cursor:default}
${card} .downloaded-card-upgrade>button:focus-visible {outline:2px solid #7fff00;outline-offset:3px}
${card} .downloaded-card-arrow {position:absolute;top:50%;z-index:1;display:grid;place-items:center;width:28px;height:40px;min-height:0;margin:0;padding:0;border:1px solid #536176;border-radius:6px;background:#080e18d9;color:#e3e8ee;transform:translateY(-50%);cursor:pointer}
${card} .downloaded-card-arrow[data-card-variant-step="-1"] {left:2px}
${card} .downloaded-card-arrow[data-card-variant-step="1"] {right:2px}
${card} .downloaded-card-arrow:hover {background:#25364a;color:#fff}
${card} .downloaded-card-arrow:focus-visible {outline:2px solid #4ade80;outline-offset:2px}
${card} .downloaded-card-links>.downloaded-card-source {display:block;flex:none;white-space:nowrap;width:max-content;max-width:100%;margin:0;padding:0;color:#cbd5df;font:700 18px/1.2 Arial,sans-serif;text-align:center;text-decoration:none;overflow-wrap:anywhere}
${card} .downloaded-card-links>.detail-spirebird-link {text-align:left}
${card} .downloaded-card-links>.detail-untapped-link {margin-left:auto;text-align:right}
${card} .downloaded-card-links>.downloaded-card-source:hover {color:#8bcaf0;text-decoration:underline}
`;
