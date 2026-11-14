process.chdir(require('node:path').resolve(__dirname,'../..'));
const styles=`
.presentation-controls button[data-card-view]{display:inline-flex;align-items:center;justify-content:center;gap:7px}.view-icon{width:20px;height:20px;flex:0 0 auto}.grid-pool-name-en{font-size:.75em;font-weight:400;color:var(--muted)}.grid-pool-heading{flex-wrap:wrap}


.presentation-controls{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:10px}.presentation-controls button{font:inherit;font-size:large;color:var(--muted);background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:5px 14px;cursor:pointer}.presentation-controls button[aria-pressed=true]{border-color:var(--focus);color:var(--focus)}.presentation-controls button:focus-visible{outline:2px solid var(--focus);outline-offset:2px}.grid-pool-heading{display:none}
body[data-view=grid] .card-scroll section{min-width:0;width:100%;margin-bottom:28px}
body[data-view=grid] .grid-pool-heading{display:flex;align-items:center;gap:10px;margin:8px 4px 14px;color:var(--accent);font-size:x-large;font-weight:600}
.grid-pool-heading img{width:28px;height:28px;object-fit:contain}.grid-pool-count{font-size:large;font-weight:400;color:var(--muted)}
body[data-view=grid] .card-scroll .table-wrap{border:0;border-radius:0;overflow:visible;background:transparent;max-width:100%}
body[data-view=grid] .card-scroll table{display:block;width:100%;min-width:0;max-width:100%;border:0}
body[data-view=grid] .card-scroll :is(thead,colgroup,.mobile-sort){display:none!important}
body[data-view=grid] .card-scroll tbody{display:grid;justify-content:center;width:100%;grid-template-columns:minmax(0,694px);gap:18px 14px}
body[data-view=grid] .card-scroll tbody tr{position:relative;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto 1fr;gap:0;align-items:start;align-content:start;margin:0;padding:6px 4px 12px;border:1px solid transparent;border-radius:10px;background:transparent;transition:background .15s,border-color .15s;min-width:0}
body[data-view=grid] .card-scroll tbody tr>td{background:transparent!important;border:0;min-width:0;max-width:none;width:auto;padding:0;text-align:center;overflow-wrap:normal;grid-column:1}
body[data-view=grid] .card-scroll tbody td:not([data-field=images]):not([data-field=english]):not([data-field=builds]):not([data-field=tier]){display:none!important}
body[data-view=grid] .card-scroll td::before{display:none!important}
body[data-view=grid] .card-scroll td[data-field=images]{display:block;order:0;padding:0}
body[data-view=grid] .card-scroll td[data-field=english]{display:block!important;order:1;padding:6px 4px 0;font-size:large;white-space:normal}
body[data-view=grid] .card-scroll td[data-field=english] .name-en{font-size:large;white-space:normal;overflow-wrap:normal;line-height:1.4;color:var(--rarity-color,var(--muted))}
body[data-view=grid] .card-scroll td[data-field=builds]{display:block;order:3;padding:5px 0 0;font-size:large;line-height:1.5}
body[data-view=grid] .card-scroll td[data-field=builds]>.not-available{display:none}
body[data-view=grid] .card-scroll td[data-field=tier]{display:block;position:static;order:2;top:auto;right:auto;padding:5px 0 0;min-height:30px;z-index:auto}body[data-view=grid] .card-scroll td[data-field=tier]:has(.tier[data-tier=unranked]){display:none}
body[data-view=grid] .card-scroll td[data-field=tier] .tier{font-size:large;min-width:28px;padding:0 6px;box-shadow:0 2px 7px #0008}
body[data-view=grid] .card-scroll td[data-field=tier] .tier[data-tier=unranked]{display:none}
body[data-view=table] .card-image-upgraded{display:none}
body[data-view=grid] .card-scroll .card-images-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;max-width:none;width:100%;margin:0}
body[data-view=grid] .card-scroll .card-image-button{width:100%;max-width:none;transition:transform .15s;transform-origin:center center}
body[data-view=grid] .card-scroll .card-image{display:block;width:100%;max-width:100%;height:auto;aspect-ratio:340/454}
body[data-view=grid] .card-scroll .build-inline-list{gap:3px}
body[data-view=grid] .card-scroll tr.is-selected{border-color:var(--accent);outline:2px solid var(--accent);outline-offset:-2px;background:color-mix(in srgb,var(--accent) 8%,var(--paper))}
@media(hover:hover){body[data-view=grid] .card-scroll tbody tr:hover{border-color:var(--accent);outline:1px solid var(--accent);outline-offset:-1px;background:color-mix(in srgb,var(--accent) 6%,var(--paper))}body[data-view=grid] .card-image-button:hover{transform:scale(1.025)}}
@media(prefers-reduced-motion:reduce){body[data-view=grid] .card-scroll :is(tr,.card-image-button){transition:none}}
`;
const actionControls="<button type=\"button\" id=\"aoe-toggle\" aria-pressed=\"false\">AOE</button>";
module.exports={styles,actionControls};
