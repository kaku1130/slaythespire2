// ---- conditional-format palette (colorblind support) ----------------------------
// good = high values, bad = low. Stored per-browser; the 'default' preset keeps the
// site's original green/red rendering byte-identical (callers fall back to their own
// hardcoded ramps when cellTriples() returns null). Consumed by archive.html
// (cellHeat / warHeat / diff charts), card.html and relic.html (rankHeat), and the
// in-game mod download defaults.
window.sbCF = (function () {
  var KEY = 'spirebird-cf-colors';
  var PRESETS = {
    default:    { label: 'Green / red (default)', good: '#2e8b57', bad: '#e0584d' },
    blueorange: { label: 'Blue / orange',         good: '#0072b2', bad: '#e69f00' },
    tealpink:   { label: 'Teal / pink',           good: '#009e88', bad: '#d65db1' },
    bluebrown:  { label: 'Blue / brown',          good: '#4a7fd4', bad: '#a0681f' },
  };
  var HEX = /^#[0-9a-fA-F]{6}$/;
  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && HEX.test(v.good) && HEX.test(v.bad)) return v;
    } catch (e) {}
    return { preset: 'default', good: PRESETS.default.good, bad: PRESETS.default.bad };
  }
  var cur = load();
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} cur = load(); }
  function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function lerp3(a, b, f) { return [Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f), Math.round(a[2] + (b[2] - a[2]) * f)]; }
  // {lo, mid, hi} RGB triples for the spreadsheet-style fill in the current theme,
  // derived from the chosen hexes \u2014 or null on the default preset.
  function cellTriples(dark) {
    if ((cur.preset || 'custom') === 'default') return null;
    var mid = dark ? [40, 44, 52] : [255, 255, 255];
    var f = dark ? 0.55 : 0.42;
    return { lo: lerp3(mid, hex2rgb(cur.bad), f), mid: mid, hi: lerp3(mid, hex2rgb(cur.good), f) };
  }
  return {
    PRESETS: PRESETS,
    get: function () { return cur; },
    save: save,
    isDefault: function () { return (cur.preset || 'custom') === 'default'; },
    goodRGB: function () { return hex2rgb(cur.good); },
    badRGB: function () { return hex2rgb(cur.bad); },
    cellTriples: cellTriples,
    lerp3: lerp3,
  };
})();

// ---- "hide stats" preference -----------------------------------------------------
// Per-browser mirror of the account's prefs.hide_stats (server: GET/PATCH /me/prefs).
// The hover modules and the replay overlays read THIS, synchronously, because they run
// on pages that know nothing about auth and can't wait on a request; the account copy
// is the source of truth and is pulled into here on every page load while signed in
// (syncStatPrefs below) and pushed from the Preferences panel when the box is toggled.
// Off by default, so a browser that has never seen the panel — or a signed-out
// visitor — sees the site exactly as before. When on: no card/relic hover captions,
// no spirebird-net or exact-solver overlay on replays.
window.sbStatPrefs = (function () {
  var KEY = 'spirebird-hide-stats';
  function load() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  var cur = load();
  function save(hide) {
    hide = !!hide;
    var changed = hide !== cur;
    cur = hide;
    try { if (hide) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) {}
    // Pages that rendered before a server sync landed can re-check (replay.html does).
    if (changed && typeof document !== 'undefined') {
      try { document.dispatchEvent(new CustomEvent('sb-stat-prefs', { detail: { hide_stats: cur } })); } catch (e) {}
    }
    return cur;
  }
  return {
    hidden: function () { return cur; },       // the one call sites use
    save: save,
  };
})();

// Single source of truth for the top navigation, shared by archive.html (the
// SPA), card.html and relic.html. Edit the lists here and all three pages
// follow. Context decides how the tab items link:
//   - on the SPA ('spa'): tabs are in-page  <a href="#tab" data-tab="tab"> links
//     (the SPA's own click handler intercepts .navlink and calls showTab); the
//     two profile links are plain anchors that navigate away.
//   - on a profile page ('card' / 'relic'): every item is a .navlink; tabs point
//     at the SPA root ('/#tab') and the current profile link gets the 'on' class.
(function (root) {
  'use strict';
  var SEP = { sep: true };
  // The standalone profile pages.
  var PROFILES = [
    { label: 'Card Profiles',  href: 'card.html',  id: 'card'  },
    { label: 'Relic Profiles', href: 'relic.html', id: 'relic' },
    { label: 'Enemy Encounter Profiles', href: 'enemy.html', id: 'enemy' },
  ];

  // ---- Enemy profile registry -------------------------------------------------
  // One row per base-game ENCOUNTER (enemy.html's unit of profile). KEEP IN SYNC
  // with engine.js BASE_ENCOUNTERS — the community gate's authoritative fight list;
  // a new base-game encounter needs a row here for its profile page to carry art
  // and appear in prev/next, browse, and the global search. (An encounter missing
  // here still renders its stats page from the published shards; it just has no
  // art or nav presence.)
  //
  // NOTE (mitigation drop): run JSONs carry per-fight monster_ids, so since the
  // enc_mitigation.json supplementary pass shipped, enemy.html prefers the
  // OBSERVED line-up from that file for any row still marked `unverified` (or
  // absent). Rows WITHOUT the flag are curated overrides and win. This table
  // remains the pre-recompute fallback and the browse-thumbnail source.
  // `m`: monster ids from site/monster_data.json whose exported renders depict the
  // fight — first entry is the primary/thumbnail. `unverified: 1` marks rows where
  // the monster line-up is a BEST-EFFORT reading of the ids, not verified against
  // the game's encounter definitions — REVIEW THESE (the profile page shows a
  // "mapping unverified" note until the flag is removed). Rows with `m: []` have
  // no confident art at all (no matching exported render).
  //
  // Unassigned monster renders that likely belong to fights below (summons /
  // members / unexported bosses): BATTLE_FRIEND_V1/V2/V3, EYE_WITH_TEETH,
  // FAT_GREMLIN, SNEAKY_GREMLIN, GAS_BOMB, GUARDBOT, NOISEBOT, STABBOT, ZAPBOT,
  // LIVING_SHIELD, PARAFRIGHT, TORCH_HEAD_AMALGAM, TOUGH_EGG, WRIGGLER,
  // SPECTRAL_KNIGHT, CRUSHER (render failed), ROCKET (render failed).
  var ENEMIES = {
    AEONGLASS: { m: ['AEONGLASS'] },
    AXEBOTS: { m: ['AXEBOT'] },
    BOWLBUGS: { m: ['BOWLBUG_EGG', 'BOWLBUG_NECTAR', 'BOWLBUG_ROCK', 'BOWLBUG_SILK'] },   // observed in run monster_ids
    BYGONE_EFFIGY: { m: ['BYGONE_EFFIGY'] },
    BYRDONIS: { m: ['BYRDONIS'] },
    CEREMONIAL_BEAST: { m: ['CEREMONIAL_BEAST'] },
    CHOMPERS: { m: ['CHOMPER'] },
    CONSTRUCT_MENAGERIE: { m: ['CUBEX_CONSTRUCT', 'PUNCH_CONSTRUCT'] },   // observed in run monster_ids
    CORPSE_SLUGS: { m: ['CORPSE_SLUG'] },
    CUBEX_CONSTRUCT: { m: ['CUBEX_CONSTRUCT'] },
    CULTISTS: { m: ['CALCIFIED_CULTIST', 'DAMP_CULTIST'] },   // observed in run monster_ids
    DECIMILLIPEDE: { m: ['DECIMILLIPEDE_SEGMENT_FRONT', 'DECIMILLIPEDE_SEGMENT_MIDDLE', 'DECIMILLIPEDE_SEGMENT_BACK'] },
    DEVOTED_SCULPTOR: { m: ['DEVOTED_SCULPTOR'] },
    DOORMAKER: { m: [] },                                    // no exported render
    ENTOMANCER: { m: ['ENTOMANCER'] },
    EXOSKELETONS: { m: ['EXOSKELETON'] },
    FABRICATOR: { m: ['FABRICATOR'] },
    FLYCONID: { m: ['FLYCONID'] },
    FOGMOG: { m: ['FOGMOG'] },
    FOSSIL_STALKER: { m: ['FOSSIL_STALKER'] },
    FROG_KNIGHT: { m: ['FROG_KNIGHT'] },
    FUZZY_WURM_CRAWLER: { m: ['FUZZY_WURM_CRAWLER'] },
    GLOBE_HEAD: { m: ['GLOBE_HEAD'] },
    GREMLIN_MERC: { m: ['GREMLIN_MERC'] },
    HAUNTED_SHIP: { m: ['HAUNTED_SHIP'] },
    HUNTER_KILLER: { m: ['HUNTER_KILLER'] },
    INFESTED_PRISMS: { m: ['INFESTED_PRISM'] },
    INKLETS: { m: ['INKLET'] },
    KAISER_CRAB: { m: [] },                                  // no exported render
    KNIGHTS: { m: ['FLAIL_KNIGHT', 'MAGI_KNIGHT', 'SPECTRAL_KNIGHT'], unverified: 1 },
    KNOWLEDGE_DEMON: { m: ['KNOWLEDGE_DEMON'] },
    LAGAVULIN_MATRIARCH: { m: ['LAGAVULIN_MATRIARCH'] },
    LIVING_FOG: { m: ['LIVING_FOG'] },
    LOUSE_PROGENITOR: { m: ['LOUSE_PROGENITOR'] },
    MAWLER: { m: ['MAWLER'] },
    MECHA_KNIGHT: { m: ['MECHA_KNIGHT'] },
    MYTES: { m: ['MYTE'] },
    NIBBITS: { m: ['NIBBIT'] },
    OVERGROWTH_CRAWLERS: { m: ['FUZZY_WURM_CRAWLER', 'SHRINKER_BEETLE'] },   // observed in run monster_ids (NOT Wriggler — those belong to Phrog Parasite / Dense Vegetation)
    OVICOPTER: { m: ['OVICOPTER'] },
    OWL_MAGISTRATE: { m: ['OWL_MAGISTRATE'] },
    PHANTASMAL_GARDENERS: { m: ['PHANTASMAL_GARDENER'] },
    PHROG_PARASITE: { m: ['PHROG_PARASITE'] },
    PUNCH_CONSTRUCT: { m: ['PUNCH_CONSTRUCT'] },
    QUEEN: { m: ['QUEEN', 'TORCH_HEAD_AMALGAM'] },   // amalgam observed at 100% of fights (cf. patch-registry note)
    RUBY_RAIDERS: { m: ['BRUTE_RUBY_RAIDER', 'ASSASSIN_RUBY_RAIDER', 'AXE_RUBY_RAIDER', 'CROSSBOW_RUBY_RAIDER', 'TRACKER_RUBY_RAIDER'], unverified: 1 },
    SCROLLS_OF_BITING: { m: ['SCROLL_OF_BITING'] },
    SEAPUNK: { m: ['SEAPUNK'] },
    SEWER_CLAM: { m: ['SEWER_CLAM'] },
    SHRINKER_BEETLE: { m: ['SHRINKER_BEETLE'] },
    SKULKING_COLONY: { m: ['SKULKING_COLONY'] },
    SLIMED_BERSERKER: { m: ['SLIMED_BERSERKER'] },
    SLIMES: { m: ['LEAF_SLIME_M', 'LEAF_SLIME_S', 'TWIG_SLIME_M', 'TWIG_SLIME_S'], unverified: 1 },
    SLITHERING_STRANGLER: { m: ['SLITHERING_STRANGLER'] },
    SLUDGE_SPINNER: { m: ['SLUDGE_SPINNER'] },
    SLUMBERING_BEETLE: { m: ['SLUMBERING_BEETLE'] },
    SNAPPING_JAXFRUIT: { m: ['SNAPPING_JAXFRUIT'] },
    SOUL_FYSH: { m: ['SOUL_FYSH'] },
    SOUL_NEXUS: { m: ['SOUL_NEXUS'] },
    SPINY_TOAD: { m: ['SPINY_TOAD'] },
    TERROR_EEL: { m: ['TERROR_EEL'] },
    TEST_SUBJECT: { m: ['TEST_SUBJECT'] },
    THE_INSATIABLE: { m: ['THE_INSATIABLE'] },
    THE_KIN: { m: ['KIN_PRIEST', 'KIN_FOLLOWER'], unverified: 1 },
    THE_LOST_AND_FORGOTTEN: { m: ['THE_LOST', 'THE_FORGOTTEN'] },
    THE_OBSCURA: { m: ['THE_OBSCURA'] },
    THIEVING_HOPPER: { m: ['THIEVING_HOPPER'] },
    TOADPOLES: { m: ['TOADPOLE'] },
    TUNNELER: { m: ['TUNNELER'] },
    TURRET_OPERATOR: { m: ['TURRET_OPERATOR', 'LIVING_SHIELD'] },   // shield observed at 100% of fights
    TWO_TAILED_RATS: { m: ['TWO_TAILED_RAT'] },
    VANTOM: { m: ['VANTOM'] },
    VINE_SHAMBLER: { m: ['VINE_SHAMBLER'] },
    WATERFALL_GIANT: { m: ['WATERFALL_GIANT'] },
    // event fights (base …_EVENT_ENCOUNTER forms; _V<n> variants collapse onto these)
    BATTLEWORN_DUMMY_EVENT_ENCOUNTER: { m: ['BATTLE_FRIEND_V1', 'BATTLE_FRIEND_V2', 'BATTLE_FRIEND_V3'] },   // the dummy IS the Battle Friends (observed)
    DENSE_VEGETATION_EVENT_ENCOUNTER: { m: ['WRIGGLER'] },   // confirmed by jorbs
    MYSTERIOUS_KNIGHT_EVENT_ENCOUNTER: { m: ['MYSTERIOUS_KNIGHT'] },
    PUNCH_OFF_EVENT_ENCOUNTER: { m: ['PUNCH_CONSTRUCT'] },   // observed in run monster_ids
    FAKE_MERCHANT_EVENT_ENCOUNTER: { m: ['FAKE_MERCHANT_MONSTER'] },
  };
  // Base id of an encounters-tab row's modelId: "ENCOUNTER." prefix off, event
  // "_V<n>_" infix collapsed, trailing tier token off. MIRRORS engine.js normEnc —
  // keep the two in sync (engine doesn't export it; it's 4 lines).
  var ENC_TIERS = { BOSS: 1, ELITE: 1, NORMAL: 1, WEAK: 1, STRONG: 1, MINIBOSS: 1, SUPER: 1 };
  function encBase(modelId) {
    var s = String(modelId || '').replace(/^ENCOUNTER\./, '').replace(/_V\d+_ENCOUNTER$/, '_ENCOUNTER');
    var us = s.lastIndexOf('_');
    if (us > 0 && ENC_TIERS[s.slice(us + 1)]) s = s.slice(0, us);
    return s;
  }
  function encDisplayName(base) {
    return prettyName(String(base || '').replace(/_EVENT_ENCOUNTER$/, ''));
  }
  // Tabs that now live under the "Stats" mega-dropdown (pulled out of the flat strip).
  var STATS_TABS = [
    { label: 'Cards', tab: 'cards' },
    { label: 'Relics', tab: 'relics' },
    { label: 'Events', tab: 'events' },
    { label: 'Shops', tab: 'shops' },
    { label: 'Campfires', tab: 'campfires' },
    { label: 'Potions', tab: 'potions' },
    { label: 'Encounters', tab: 'encounters' },
  ];
  // The remaining flat SPA tabs, in display order. `tab` must match the section id / data-tab.
  // An item carrying `href` instead of `tab` is a STANDALONE page: it renders as a
  // plain anchor — deliberately NOT .navlink, so the SPA's tab click handler ignores
  // it and the browser navigates away — gets the 'on' class when `id` matches the
  // render context, and shows an alpha chip when `alpha` is set.
  var TABS = [
    { label: 'Your Runs',      tab: 'runs' },
    { label: 'Mastery',        tab: 'mastery' },
    SEP,
    { label: 'In-Game Mod',    tab: 'mod' },
    { label: 'Dev Notes',      tab: 'devnotes' },
  ];
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // Responsive behaviour for the shared top nav, injected once so all three
  // pages get it (and it overrides their inline `.topbar .inner { height:46px }`,
  // which clipped a wrapped nav into the page below). The nav stays a single
  // horizontally-scrollable strip instead of wrapping; on phones it drops to its
  // own full-width row beneath the brand + account controls.
  function ensureCss() {
    if (typeof document === 'undefined' || document.getElementById('sb-nav-css')) return;
    var st = document.createElement('style');
    st.id = 'sb-nav-css';
    st.textContent =
      '.topbar{position:sticky;top:0;z-index:40;}' +
      '.topbar .inner{height:auto;min-height:56px;flex-wrap:nowrap;}' +
      '.topbar nav#snav{flex:1 1 auto;min-width:0;overflow-x:auto;flex-wrap:nowrap;white-space:nowrap;scrollbar-width:thin;padding:2px 0 5px;}' +
      '.topbar nav#snav>a,.topbar nav#snav>.navsep{flex:0 0 auto;}' +
      '.topbar nav#snav::-webkit-scrollbar{height:6px;}' +
      '.topbar nav#snav::-webkit-scrollbar-thumb{background:#36506f;border-radius:3px;}' +
      // alpha chip on standalone-page nav items (see TABS)
      '.topbar nav#snav a .sb-alpha{margin-left:5px;padding:1px 4px;border-radius:3px;' +
        'background:#e0a33a;color:#10192a;font-size:9px;font-weight:700;line-height:1.5;' +
        'letter-spacing:.07em;text-transform:uppercase;vertical-align:1px;}' +
      // hand-drawn brand logo replacing the "Spirebird" wordmark (swapped in by ensureLogo)
      '.topbar .logo{flex:0 0 auto;display:flex;align-items:center;padding:3px 0;}' +
      '.topbar .logo .sb-logo-img{height:34px;width:auto;display:block;}' +
      '@media(max-width:760px){' +
        '.topbar .inner{flex-wrap:wrap;row-gap:8px;column-gap:14px;padding-top:7px;padding-bottom:7px;}' +
        '.topbar nav#snav{order:10;flex:1 1 100%;}' +
        '.topbar .logo .sb-logo-img{height:30px;}' +
      '}';
    (document.head || document.documentElement).appendChild(st);
  }
  // Replace the plain "Spirebird" wordmark (the <a class="logo"> in each page's .topbar)
  // with the hand-drawn brand image, once, keeping the home link + tooltip attributes.
  // Centralized here so every page sharing nav.js updates without touching its inline markup.
  function ensureLogo() {
    if (typeof document === 'undefined') return;
    var a = document.querySelector('.topbar .logo');
    if (!a) return;
    // Append the artist credit to the hover description (the colTips handler reads
    // data-desc live on hover). Idempotent — render() + DOMContentLoaded both call this.
    var CREDIT = 'Logo by MarthaClare.art';
    var d = (a.getAttribute('data-desc') || '').replace(/\s+$/, '');
    if (!/Logo by/i.test(d)) a.setAttribute('data-desc', d ? d + '. ' + CREDIT : CREDIT);
    if (a.querySelector('img.sb-logo-img')) return;
    ensureCss();
    a.innerHTML = '<img class="sb-logo-img" src="SpireBirdTextWebLogo.png" alt="Spirebird">';
  }
  // ---- Second nav row: a pinned search box with image autocomplete, opt-in via
  //      mountSearch() from the card/relic profile pages. The SPA does not use it
  //      (it has in-tab search), so render() above is unaffected. The row is appended
  //      inside .topbar (which is sticky), so it pins under the main nav strip. ----
  function ensureSearchCss() {
    if (typeof document === 'undefined' || document.getElementById('sb-search-css')) return;
    var st = document.createElement('style');
    st.id = 'sb-search-css';
    st.textContent =
      '.sb-searchrow{background:var(--navy,#0e1726);border-bottom:1px solid var(--line,#1c2940);}' +
      '.sb-searchinner{max-width:1080px;margin:0 auto;padding:6px 18px;position:relative;}' +
      '.sb-search{width:100%;box-sizing:border-box;background:#0a1320;color:#e7eef7;' +
        'border:1px solid #2a3c57;border-radius:7px;padding:7px 11px;font-size:14px;line-height:1.2;outline:none;}' +
      '.sb-search::placeholder{color:#67788f;}' +
      '.sb-search:focus{border-color:#3d597f;}' +
      '.sb-ac{position:absolute;left:18px;right:18px;top:100%;margin-top:-1px;z-index:60;' +
        'background:#0c1525;border:1px solid #2a3c57;border-top:none;border-radius:0 0 8px 8px;' +
        'max-height:62vh;overflow-y:auto;box-shadow:0 14px 30px rgba(0,0,0,.5);display:none;}' +
      '.sb-ac.open{display:block;}' +
      '.sb-ac-item{display:flex;align-items:center;gap:11px;padding:5px 11px;cursor:pointer;color:#dce5f1;}' +
      '.sb-ac-item:hover,.sb-ac-item.active{background:#16243a;}' +
      '.sb-ac-item img{height:40px;width:auto;max-width:56px;object-fit:contain;flex:0 0 auto;' +
        'filter:drop-shadow(0 2px 5px rgba(0,0,0,.5));}' +
      '.sb-ac-nm{font-size:14px;font-weight:600;}' +
      // Inline variant: the search rides in the main nav row (.inner) instead of a
      // second pinned row. The box is a compact flex item; its autocomplete panel
      // anchors to the box (left:0) rather than spanning the full row.
      '.sb-search-inline{position:relative;flex:0 1 240px;min-width:120px;}' +
      '.sb-search-inline .sb-search{width:100%;box-sizing:border-box;}' +
      '.sb-search-inline .sb-ac{left:0;right:auto;width:340px;max-width:80vw;}' +
      '@media(max-width:760px){.sb-search-inline{order:9;flex:1 1 100%;}' +
        '.sb-search-inline .sb-ac{width:auto;left:0;right:0;max-width:none;}}';
    (document.head || document.documentElement).appendChild(st);
  }
  // opts: { items:[{id,name,img,href}], placeholder?, limit? }. Page builds items
  // post-catalog-load (it owns prettyName + image paths); nav stays catalog-agnostic.
  function mountSearch(ctx, opts) {
    if (typeof document === 'undefined') return;
    opts = opts || {};
    var bar = document.querySelector('.topbar');
    if (!bar) return;
    var items = opts.items || [], getItems = opts.getItems, limit = opts.limit || 8;
    ensureSearchCss();
    var input, ac;
    if (opts.inline) {
      // Single-row mode: drop a compact search box into the main nav row, between
      // the nav strip and the account controls. No second row.
      var inner = bar.querySelector('.inner');
      if (!inner) return;
      var box = inner.querySelector('.sb-search-inline');
      if (!box) {
        box = document.createElement('div');
        box.className = 'sb-search-inline';
        box.innerHTML =
          '<input class="sb-search" type="text" autocomplete="off" spellcheck="false" placeholder="' +
            esc(opts.placeholder || 'Search\u2026') + '">' +
          '<div class="sb-ac" role="listbox"></div>';
        var anchor = inner.querySelector('.autharea');   // sit just before the account controls
        if (anchor) inner.insertBefore(box, anchor); else inner.appendChild(box);
      }
      input = box.querySelector('.sb-search');
      ac = box.querySelector('.sb-ac');
    } else {
      var row = bar.querySelector('.sb-searchrow');
      if (!row) {
        row = document.createElement('div');
        row.className = 'sb-searchrow';
        row.innerHTML = '<div class="sb-searchinner">' +
          '<input class="sb-search" type="text" autocomplete="off" spellcheck="false" placeholder="' +
            esc(opts.placeholder || 'Search\u2026') + '">' +
          '<div class="sb-ac" role="listbox"></div></div>';
        bar.appendChild(row);
      }
      input = row.querySelector('.sb-search');
      ac = row.querySelector('.sb-ac');
    }
    var shown = [], active = -1;
    function close() { ac.classList.remove('open'); ac.innerHTML = ''; shown = []; active = -1; }
    function go(it) { if (it) window.location.href = it.href; }
    function matches(q) {
      q = q.trim().toLowerCase();
      if (!q) return [];
      var starts = [], contains = [], source = getItems ? getItems() : items;
      for (var i = 0; i < source.length; i++) {
        var it = source[i], nm = (it.name || '').toLowerCase(), hay = nm + ' ' + (it.id || '').toLowerCase();
        if (hay.indexOf(q) < 0) continue;
        (nm.indexOf(q) === 0 ? starts : contains).push(it);
      }
      return starts.concat(contains).slice(0, limit);
    }
    function paint() {
      shown = matches(input.value);
      if (!shown.length) { close(); return; }
      ac.innerHTML = shown.map(function (it, i) {
        var img = it.img ? '<img src="' + esc(it.img) + '" alt="" onerror="this.style.visibility=\'hidden\'">' : '';
        return '<div class="sb-ac-item" data-i="' + i + '" role="option">' + img +
          '<span class="sb-ac-nm">' + esc(it.name) + '</span></div>';
      }).join('');
      active = -1; ac.classList.add('open');
    }
    function setActive(n) {
      var els = ac.querySelectorAll('.sb-ac-item');
      if (!els.length) return;
      active = (n + els.length) % els.length;
      for (var i = 0; i < els.length; i++) els[i].classList.toggle('active', i === active);
      els[active].scrollIntoView({ block: 'nearest' });
    }
    input.addEventListener('input', paint);
    input.addEventListener('keydown', function (e) {
      if (!ac.classList.contains('open')) { if (e.key === 'ArrowDown') paint(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); go(shown[active >= 0 ? active : 0]); }
      else if (e.key === 'Escape') { close(); input.blur(); }
    });
    // mousedown, not click: fire before the input's blur tears the panel down.
    ac.addEventListener('mousedown', function (e) {
      var it = e.target.closest && e.target.closest('.sb-ac-item');
      if (!it) return;
      e.preventDefault();
      go(shown[+it.getAttribute('data-i')]);
    });
    input.addEventListener('blur', function () { setTimeout(close, 120); });
    return { focus: function () { input.focus(); } };
  }

  function prettyName(s) {
    return s == null ? '' : String(s).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }
  // The global navigational index: every card + relic, each linking to its profile.
  // The input is cheap and appears immediately; its catalog is loaded only when
  // somebody uses it, so ordinary page visits do not pay for autocomplete data.
  var _searchBuilt = false, _globalSearchItems = [], _globalSearchPromise = null;
  function buildGlobalSearch(ctx) {
    if (typeof document === 'undefined' || _searchBuilt) return;
    _searchBuilt = true;
    mountSearch('global', {
      getItems: function () { return _globalSearchItems; },
      placeholder: 'Jump to a card, relic, or enemy\u2026',
      inline: true,
    });
    var input = document.querySelector('.sb-search-inline .sb-search');
    function getJSON(u) {
      return fetch(u, { credentials: 'include' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    function loadItems() {
      if (_globalSearchPromise) return _globalSearchPromise;
      _globalSearchPromise = Promise.all([getJSON('/card_data.json'), getJSON('/relic_data.json'), getJSON('/monster_data.json')]).then(function (res) {
      var cd = res[0] || {}, rd = res[1] || {}, md = res[2] || {};
      var cBuild = cd.sourceBuild || null, rBuild = rd.sourceBuild || null, mBuild = md.sourceBuild || null;
      var cards = Array.isArray(cd.cards) ? cd.cards : (Array.isArray(cd) ? cd : []);
      var relics = Array.isArray(rd.relics) ? rd.relics : [];
      var monsterById = {};
      (Array.isArray(md.monsters) ? md.monsters : []).forEach(function (m) { if (m && m.id) monsterById[m.id] = m; });
      var items = [];
      cards.forEach(function (c) {
        var art = c.art && c.art.png;
        items.push({ id: c.id, name: prettyName(c.id),
          img: (cBuild && art) ? '/img/cards/' + cBuild + '/' + art : '',
          href: '/card.html?id=' + encodeURIComponent(c.id) });
      });
      relics.forEach(function (r) {
        if (r.deprecated) return;
        var art = r.art && r.art.png;
        items.push({ id: r.id, name: prettyName(r.id),
          img: (rBuild && art) ? '/img/relics/' + rBuild + '/' + art : '',
          href: '/relic.html?id=' + encodeURIComponent(r.id) });
      });
      // Enemies: the registry above, thumbnailed by the first mapped monster render.
      Object.keys(ENEMIES).forEach(function (b) {
        var img = '';
        (ENEMIES[b].m || []).some(function (mid) {
          var mo = monsterById[mid];
          if (mBuild && mo && mo.hasImage !== false && mo.art && mo.art.png) { img = '/img/monsters/' + mBuild + '/' + mo.art.png; return true; }
          return false;
        });
        items.push({ id: b, name: encDisplayName(b),
          img: img,
          href: '/enemy.html?id=' + encodeURIComponent(b) });
      });
        _globalSearchItems = items;
        // If the first typed character started the request, repaint when the
        // catalog arrives rather than making the visitor type it again.
        if (input && input.value) input.dispatchEvent(new Event('input'));
      });
      return _globalSearchPromise;
    }
    if (input) {
      input.addEventListener('focus', loadItems, { once: true });
      input.addEventListener('input', loadItems, { once: true });
    }
  }

  function ensureDdCss() {
    if (typeof document === 'undefined' || document.getElementById('sb-dd-css')) return;
    var st = document.createElement('style');
    st.id = 'sb-dd-css';
    st.textContent =
      '.sb-dd-trig{cursor:pointer;}' +
      '.sb-dd-trig .sb-caret{font-size:9px;opacity:.75;display:inline-block;margin-left:3px;transition:transform .12s;}' +
      '.sb-dd-trig.dd-open .sb-caret{transform:rotate(180deg);}' +
      '.sb-dd-panel{position:absolute;left:0;right:0;top:100%;z-index:55;display:none;' +
        'background:#0c1525;border-top:1px solid #2a3c57;border-bottom:1px solid #2a3c57;box-shadow:0 16px 30px rgba(0,0,0,.45);}' +
      '.sb-dd-panel.dd-open{display:block;}' +
      '.sb-dd-inner{max-width:1080px;margin:0 auto;padding:15px 18px;}' +
      '.sb-dd-col{margin-bottom:15px;}' +
      '.sb-dd-col:last-child{margin-bottom:0;}' +
      '.sb-dd-h{display:block;font-family:"Zilla Slab",serif;font-weight:700;font-size:16px;letter-spacing:.04em;' +
        'color:#e7eef7;text-transform:uppercase;border-bottom:1px solid #24364f;padding-bottom:6px;margin-bottom:8px;}' +
      '.sb-dd-h:hover{color:#fff;}' +
      '.sb-dd-h .sb-alpha{margin-left:5px;padding:1px 4px;border-radius:3px;background:#e0a33a;color:#10192a;font-family:system-ui,sans-serif;font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.07em;text-transform:uppercase;vertical-align:2px;}' +
      '.sb-dd-h-inline{display:inline;border-bottom:0;padding:0;margin:0 14px 0 0;}' +
      '.sb-dd-row{font-size:13px;line-height:1.65;margin-bottom:3px;white-space:nowrap;overflow:hidden;}' +
      '.sb-dd-lab{font-weight:700;color:#7f93ab;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;margin-right:9px;}' +
      '.sb-dd-lab::after{content:":";opacity:.6;}' +
      '.sb-dd-row a{color:#6fb4ee;}' +
      '.sb-dd-row a:hover{color:#9fd0f7;text-decoration:underline;}' +
      // the inline Stats header is an <a> inside .sb-dd-row, so .sb-dd-row a would recolor/resize
      // it; re-assert the .sb-dd-h header look (Zilla Slab 16px, light) so it matches Profiles.
      '.sb-dd-row a.sb-dd-h-inline{font-family:"Zilla Slab",serif;font-weight:700;font-size:16px;letter-spacing:.04em;color:#e7eef7;text-decoration:none;}' +
      '.sb-dd-row a.sb-dd-h-inline:hover{color:#fff;text-decoration:none;}' +
      '.sb-dd-sep{color:#4a5d76;}' +
      '.sb-dd-hint{color:#6f8197;font-size:12px;padding:1px 0;}' +
      '.sb-tip{position:fixed;z-index:80;display:none;background:#0c1525;border:1px solid #2a3c57;border-radius:9px;' +
        'padding:9px 11px;box-shadow:0 14px 30px rgba(0,0,0,.55);pointer-events:none;}' +
      '.sb-tip.show{display:block;}' +
      '.sb-tip-tbl{border-collapse:collapse;}' +
      '.sb-tip-tbl tr,.sb-tip-tbl td,.sb-tip-tbl th{background:transparent!important;}' +   // neutralize the site-wide tbody row striping
      '.sb-tip-tbl th{font-size:10.5px;font-weight:700;color:#8fa3ba;text-align:center;padding:0 0 4px;}' +
      '.sb-tip-tbl td{padding:4px;text-align:center;vertical-align:middle;}' +
      '.sb-tip-tbl td.sb-tip-lab{text-align:center;font-size:11px;font-weight:600;color:#9fb0c4;white-space:nowrap;padding:0 12px;}' +
      '.sb-tip-tbl img{width:96px;height:auto;display:block;margin:0 auto;filter:drop-shadow(0 1px 4px rgba(0,0,0,.5));}';
    (document.head || document.documentElement).appendChild(st);
  }
  // ---- Shared mega-dropdown machinery (used by both "Profiles" and "Stats"). Leaders are
  //      computed CLIENT-SIDE from the already-published tab shards (no precompute/recompute),
  //      fetched lazily on first open and cached, so idle pages pay nothing. Panels attach to
  //      .topbar (not the nav strip, which clips via overflow) and span full width. ----
  var NAV_INDEX = { cards: '/card.html', relics: '/relic.html', enemies: '/enemy.html' };
  var DOT = '<span class="sb-dd-sep"> \u00b7 </span>';     // mid-line dot separator
  function ddGetJSON(u) { u = window.SpirebirdResetRules ? SpirebirdResetRules.apiUrl(u) : u; return fetch(u, { credentials: 'include' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }

  // solo - A10 leader pools. Card rows use card.html's universeAtLevel representative pick:
  // current build, unupgraded, unenchanted, most-offered character split, reliable.
  var _idxP = null;
  function loadIndex() { if (!_idxP) _idxP = ddGetJSON('/stats/community/index'); return _idxP; }
  // Representative card rows for a cohort (memoized per cohort), mirroring card.html's
  // universeAtLevel: current build, unupgraded, unenchanted, most-offered character split,
  // reliable. Each cohort is its own ~2 MB shard, fetched lazily and cached.
  var _repsP = {};
  function loadReps(cohort) {
    if (_repsP[cohort]) return _repsP[cohort];
    _repsP[cohort] = Promise.all([loadIndex(), ddGetJSON('/stats/community/tab?facet=solo&cohort=' + cohort + '&tab=cards')]).then(function (res) {
      var cb = (res[0] || {}).currentBuild || null, cards = Array.isArray(res[1]) ? res[1] : [];
      var byCard = {};
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        if (c.enchanted || c.upg !== 0 || (cb && c.version !== cb) || c.reliable !== true || c.isToken) continue;
        var cur = byCard[c.cardId];
        if (!cur || (c.offered || 0) > (cur.offered || 0)) byCard[c.cardId] = c;
      }
      return Object.keys(byCard).map(function (k) { return byCard[k]; });
    });
    return _repsP[cohort];
  }
  function topN(reps, field, idKey, n) {
    var out = [];
    for (var i = 0; i < reps.length; i++) { var r = reps[i], v = r[field]; if (typeof v === 'number' && isFinite(v)) out.push({ id: r[idKey], v: v, kind: r.kind }); }
    out.sort(function (a, b) { return b.v - a.v; });
    return out.slice(0, n);
  }
  var _relicsP = null;
  function loadRelics() {
    if (_relicsP) return _relicsP;
    _relicsP = ddGetJSON('/stats/community/tab?facet=solo&cohort=a10&tab=relics').then(function (r) {
      var relics = Array.isArray(r) ? r : [];
      function top(field, minPicked) {
        var out = [];
        for (var i = 0; i < relics.length; i++) { var x = relics[i], v = x[field]; if (typeof v !== 'number' || !isFinite(v)) continue; if (minPicked && (x.picked || 0) < minPicked) continue; out.push({ id: x.relicId, v: v }); }
        out.sort(function (a, b) { return b.v - a.v; });
        return out.slice(0, 40);
      }
      return { war: top('war', 20), wSkill: top('wSkill'), iSkill: top('iSkill') };
    });
    return _relicsP;
  }
  // Enemy leader pools for the Profiles dropdown: the A10 encounters shard,
  // newest design window per (modelId, character), aggregated per BASE encounter
  // (encBase) — WAR sums; Death% / Dmg% are the exact runs-weighted recombination
  // of the per-character rows (same identity enemy.html's Overall row uses).
  var _enemiesP = null;
  function loadEnemyLeaders() {
    if (_enemiesP) return _enemiesP;
    var svA = function (v) { return String(v || '0').split('.').map(function (n) { return parseInt(n, 10) || 0; }); };
    var svCmp = function (a, b) { var A = svA(a), B = svA(b); for (var i = 0; i < 3; i++) { if ((A[i] || 0) !== (B[i] || 0)) return (A[i] || 0) - (B[i] || 0); } return 0; };
    _enemiesP = ddGetJSON('/stats/community/tab?facet=solo&cohort=a10&tab=encounters').then(function (r) {
      var rows = Array.isArray(r) ? r : [];
      var newest = {};   // modelId|char -> row from its newest window
      rows.forEach(function (x) {
        if (!x || !x.modelId) return;
        var k = x.modelId + '|' + x.character;
        if (!newest[k] || svCmp(x.version, newest[k].version) > 0) newest[k] = x;
      });
      var agg = {};      // base -> { runs, war, deaths, dmg, maxHp }
      Object.keys(newest).forEach(function (k) {
        var x = newest[k], b = encBase(x.modelId), n = x.runs || 0;
        if (!n) return;
        var a = agg[b] || (agg[b] = { runs: 0, war: 0, deaths: 0, dmg: 0, maxHp: 0 });
        a.runs += n;
        if (typeof x.war === 'number') a.war += x.war;
        if (typeof x.deathPct === 'number') a.deaths += x.deathPct * n / 100;
        if (typeof x.avgDmg === 'number') {
          a.dmg += x.avgDmg * n;
          if (typeof x.avgDmgPct === 'number' && x.avgDmgPct > 0) a.maxHp += 100 * x.avgDmg * n / x.avgDmgPct;
        }
      });
      function top(val, min) {
        var out = [];
        Object.keys(agg).forEach(function (b) { var a = agg[b]; if (a.runs < (min || 0)) return; var v = val(a); if (typeof v === 'number' && isFinite(v)) out.push({ id: b, v: v }); });
        out.sort(function (x, y) { return y.v - x.v; });
        return out.slice(0, 40);
      }
      return {
        deathPct: top(function (a) { return a.runs ? 100 * a.deaths / a.runs : null; }, 50),
        avgDmgPct: top(function (a) { return a.maxHp > 0 ? 100 * a.dmg / a.maxHp : null; }, 50),
        war: top(function (a) { return a.war; }, 50),
      };
    });
    return _enemiesP;
  }
  // id -> art filename (+ build), for building card image URLs in the tooltip table.
  var _artP = null;
  function loadArt() {
    if (_artP) return _artP;
    _artP = ddGetJSON('/card_data.json').then(function (cd) {
      var m = {}, arr = (cd && cd.cards) || [];
      for (var i = 0; i < arr.length; i++) { var c = arr[i]; if (c.id && c.art && c.art.png) m[c.id] = c.art.png; }
      return { build: (cd && cd.sourceBuild) || null, art: m };
    });
    return _artP;
  }
  // Relic grid data (parallels the card loaders): per-cohort relic rows (reliability floor:
  // picked >= 10) and relic id -> art, for the relic cohort x rank tooltip.
  var _relicRepsP = {};
  function loadRelicReps(cohort) {
    if (_relicRepsP[cohort]) return _relicRepsP[cohort];
    _relicRepsP[cohort] = ddGetJSON('/stats/community/tab?facet=solo&cohort=' + cohort + '&tab=relics').then(function (r) {
      return (Array.isArray(r) ? r : []).filter(function (x) { return (x.picked || 0) >= 10; });
    });
    return _relicRepsP[cohort];
  }
  var _relicArtP = null;
  function loadRelicArt() {
    if (_relicArtP) return _relicArtP;
    _relicArtP = ddGetJSON('/relic_data.json').then(function (rd) {
      var m = {}, arr = (rd && rd.relics) || [];
      for (var i = 0; i < arr.length; i++) { var c = arr[i]; if (c.id && c.art && c.art.png) m[c.id] = c.art.png; }
      return { build: (rd && rd.sourceBuild) || null, art: m };
    });
    return _relicArtP;
  }
  // Shop reps: card/relic purchases only (removals skipped — no image, like card SKIP tokens),
  // raw shard fields normalized to the SPA's column keys so topN(statKey) works. Each row keeps
  // its kind so the grid can pick card vs relic art per cell.
  var _shopRepsP = {};
  function loadShopReps(cohort) {
    if (_shopRepsP[cohort]) return _shopRepsP[cohort];
    _shopRepsP[cohort] = ddGetJSON('/stats/community/tab?facet=solo&cohort=' + cohort + '&tab=shops').then(function (s) {
      var items = (s && s.items) || [];
      return items.map(function (it) {
        return { id: it.id, kind: it.kind, seen: it.seen, bought: it.bought, winRate: it.winRate, war: it.war, warPer: it.warPerBuy, price: it.avgPrice, gold: it.goldSpent, warPg: it.warPg, pSkill: it.pSkill, wSkill: it.wSkill };
      });
    });
    return _shopRepsP[cohort];
  }
  function closeAllDropdowns() {
    if (typeof document === 'undefined') return;
    var ps = document.querySelectorAll('.sb-dd-panel.dd-open'); for (var i = 0; i < ps.length; i++) ps[i].classList.remove('dd-open');
    var ts = document.querySelectorAll('.sb-dd-trig.dd-open'); for (var j = 0; j < ts.length; j++) ts[j].classList.remove('dd-open');
    hideStatTip();
  }
  function wireDropdown(trig, panel, paint) {
    if (trig._wired) return;
    trig._wired = true;
    var closeT, rzT;
    function open() { clearTimeout(closeT); closeAllDropdowns(); panel.classList.add('dd-open'); trig.classList.add('dd-open'); paint(); }
    function close() { panel.classList.remove('dd-open'); trig.classList.remove('dd-open'); hideStatTip(); }
    function soon() { clearTimeout(closeT); closeT = setTimeout(close, 180); }
    trig.addEventListener('mouseenter', open);
    trig.addEventListener('mouseleave', soon);
    panel.addEventListener('mouseenter', function () { clearTimeout(closeT); });
    panel.addEventListener('mouseleave', soon);
    trig.addEventListener('click', function (e) { e.preventDefault(); panel.classList.contains('dd-open') ? close() : open(); });
    panel.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) close(); });   // close after a pick (matters for same-page hash nav)
    document.addEventListener('click', function (e) { if (!trig.contains(e.target) && !panel.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (!panel.classList.contains('dd-open')) return; clearTimeout(rzT); rzT = setTimeout(paint, 150); });
  }
  function panelFor(name, bar) {
    var panel = bar.querySelector('.sb-dd-panel[data-dd="' + name + '"]');
    if (!panel) { panel = document.createElement('div'); panel.className = 'sb-dd-panel'; panel.setAttribute('data-dd', name); bar.appendChild(panel); }
    return panel;
  }
  // drop trailing links (and separators) until a row fits on one line
  function trimToFit(row) {
    var links = row.querySelector('.sb-dd-links');
    if (!links) return;
    var guard = 0;
    while (row.scrollWidth > row.clientWidth && links.querySelectorAll('a').length > 1 && guard++ < 120) {
      links.removeChild(links.lastElementChild);
      var s = links.lastElementChild;
      if (s && s.classList && s.classList.contains('sb-dd-sep')) links.removeChild(s);
    }
  }

  // ---- "Profiles": Cards/Relics/Enemies leader lists; card and relic names carry
  //      the data-*-id attribute that card-hover.js / relic-hover.js use for image
  //      tooltips (enemies have no hover handler yet \u2014 plain links). ----
  var LEADER_CATS = {
    cards:  [['war', 'WAR'], ['wSkill', '\u0394wSkill'], ['eloBT', 'BT Elo']],
    relics: [['war', 'WAR'], ['wSkill', '\u0394wSkill'], ['iSkill', '\u0394iSkill']],
    enemies: [['deathPct', 'Death%'], ['avgDmgPct', 'Dmg%'], ['war', 'WAR']],
  };
  function buildProfilesDropdown() {
    if (typeof document === 'undefined') return;
    var trig = document.querySelector('.sb-dd-trig[data-dd="profiles"]');
    var bar = document.querySelector('.topbar');
    if (!trig || !bar) return;
    ensureDdCss();
    var panel = panelFor('profiles', bar);
    function shell(cardsRows, relicsRows, enemiesRows) {
      function col(kind, title, rows) {
        return '<div class="sb-dd-col"><a class="sb-dd-h" href="' + NAV_INDEX[kind] + '">' + title + '</a>' + rows + '</div>';
      }
      panel.innerHTML = '<div class="sb-dd-inner">' + col('cards', 'Cards', cardsRows) + col('relics', 'Relics', relicsRows) + col('enemies', 'Enemy Encounters', enemiesRows) + '</div>';
    }
    if (!panel.innerHTML) { var d = '<div class="sb-dd-hint">\u2026</div>'; shell(d, d, d); }
    function paint() {
      Promise.all([loadReps('a10'), loadRelics(), loadEnemyLeaders()]).then(function (res) {
        var reps = res[0], relicPools = res[1], enemyPools = res[2];
        var pools = {
          cards: { war: topN(reps, 'war', 'cardId', 40), wSkill: topN(reps, 'wSkill', 'cardId', 40), eloBT: topN(reps, 'eloBT', 'cardId', 40) },
          relics: relicPools,
          enemies: enemyPools,
        };
        function rowsFor(kind) {
          var attr = kind === 'cards' ? 'data-card-id' : kind === 'relics' ? 'data-relic-id' : null;
          var nameOf = kind === 'enemies' ? encDisplayName : prettyName;
          var h = '';
          LEADER_CATS[kind].forEach(function (cat) {
            var list = pools[kind][cat[0]] || [];
            if (!list.length) return;
            var links = list.map(function (e) {
              return '<a href="' + NAV_INDEX[kind] + '?id=' + encodeURIComponent(e.id) + '"' +
                (attr ? ' ' + attr + '="' + esc(e.id) + '" data-hov-w="200"' : '') + '>' + esc(nameOf(e.id)) + '</a>';
            }).join(DOT);
            h += '<div class="sb-dd-row"><span class="sb-dd-lab">' + esc(cat[1]) + ' Leaders</span><span class="sb-dd-links">' + links + '</span></div>';
          });
          return h || '<div class="sb-dd-hint">no data yet</div>';
        }
        shell(rowsFor('cards'), rowsFor('relics'), rowsFor('enemies'));
        var rows = panel.querySelectorAll('.sb-dd-row');
        for (var i = 0; i < rows.length; i++) trimToFit(rows[i]);
      });
    }
    wireDropdown(trig, panel, paint);
  }

  // ---- "Stats": the 7 data tabs. Each header opens its tab; the Cards row has sort lines
  //      whose hover previews the A10 top-5 by that stat. Other tabs are placeholders. ----
  // Surfaced sortable columns per tab, mirroring archive.html's column keys/titles (distinct
  // primary stats; act-split / per-character / per-action sub-columns omitted — ambiguous
  // repeated headers). Clicking sorts that tab by the key. Order here is the table order and
  // serves as the stable tiebreaker; actual display order is by sort-popularity (see paint).
  var STATS_COLS = {
    cards: [
      ['elo', 'CR-Elo'], ['eloBT', 'BT'], ['pickWar', 'pWAR'], ['pwarPerPick', 'pWAR%'], ['warSeen', 'WAR/Seen'],
      ['cWar', 'cWAR'], ['cpickWar', 'cpWAR'], ['cpwarPerPick', 'cpWAR%'], ['war', 'WAR'], ['floorScaling', '\u0394pick'],
      ['warDelta', '\u0394WAR%'], ['dmgPerFight', '\u0394HP'], ['turnPerFight', '\u0394Turns'], ['pHP', 'pHP'], ['pDMG', 'pDMG'],
      ['pRWAR', 'pRWAR'], ['pickRate', 'Pick%'], ['winRate', 'Win%'], ['winWhenSeen', 'Seen'], ['baselineWhenSeen', 'Base'],
      ['pSkill', '\u0394pSkill'], ['wSkill', '\u0394wSkill'], ['offered', 'Off'], ['picked', 'Pick'], ['wins', 'Win'],
      ['losses', 'Loss'],
    ],
    relics: [
      ['war', 'WAR'], ['cWar', 'cWAR'], ['vsBaseline', 'vBase'], ['winRate', 'Win%'], ['wSkill', '\u0394wSkill'],
      ['iSkill', '\u0394iSkill'], ['wins', 'W'], ['picked', 'Pick'], ['dmgPerFight', '\u0394HP'], ['turnPerFight', '\u0394Turns'],
    ],
    events: [
      ['war', 'WAR'], ['cWar', 'cWAR'], ['winRate', 'Win%'], ['wSkill', '\u0394wSkill'], ['pickRate', 'Pick%'],
      ['pSkill', '\u0394pSkill'], ['picked', 'Picks'], ['offered', 'Off'],
    ],
    shops: [
      ['kind', 'Kind'], ['seen', 'Seen'], ['bought', 'Bought'], ['pSkill', '\u0394pSkill'], ['winRate', 'Win%'],
      ['wSkill', '\u0394wSkill'], ['war', 'WAR'], ['warPer', 'WAR/ea'], ['cWar', 'cWAR'], ['cwarPer', 'cWAR/ea'],
      ['price', 'Gold'], ['gold', 'Σ Gold'], ['warPg', 'WAR/100g'],
    ],
    potions: [
      ['pickup', 'Pickup%'], ['usePct', 'Use%'], ['pSkill', '\u0394pSkill'], ['wSkill', '\u0394wSkill'], ['war', 'WAR'],
      ['warPickup', 'WAR/Pick'], ['offered', 'Off'], ['winsOffered', 'W'], ['picked', 'Pick'], ['bought', 'Buy'],
      ['used', 'Use'], ['discarded', 'Disc'],
    ],
    encounters: [
      ['war', 'WAR'], ['warEnc', 'WAR/Enc'], ['avgDmg', 'Avg Dmg'], ['stdDmg', 'StdDev'], ['avgDmgPct', 'Dmg%'],
      ['floorDevPct', 'Floor Dev%'], ['deathPct', 'Death%'], ['avgTurns', 'Turns'], ['avgPotions', 'Potions'], ['runs', 'Runs'],
    ],
    // campfires: per-action dynamic columns (no stable standalone stats).
  };

  // The dropdown's stat list is autogenerated from the live page column definitions when
  // present (the SPA exposes window.SB_TAB_STATS from archive.html's cols()), so new stats
  // appear with no list to maintain. STATS_COLS above is the baked snapshot used on the
  // card/relic profile pages (which don't carry the SPA column defs) so the menu matches.
  function statsColsFor(tab) {
    try { if (typeof window !== 'undefined' && typeof window.SB_TAB_STATS === 'function') {
      var live = window.SB_TAB_STATS(); if (live && live[tab] && live[tab].length) return live[tab];
    } } catch (e) {}
    return STATS_COLS[tab] || null;
  }
  // Sort-popularity snapshot, fetched once per page load (frozen for the session so the nav
  // never reorders while open). Orders metrics #1-priority by deliberate-sort counts.
  var _popP = null;
  function loadSortPop() { if (!_popP) _popP = ddGetJSON('/stats/sortpop').then(function (p) { return p || {}; }); return _popP; }
  function orderByPop(cols, pop) {
    return cols.map(function (c, i) { return { c: c, i: i, n: (pop && pop[c[0]]) || 0 }; })
      .sort(function (a, b) { return b.n - a.n || a.i - b.i; })   // most-sorted first; table order breaks ties
      .map(function (x) { return x.c; });
  }
  function ensureStatTip() {
    var t = document.getElementById('sb-stat-tip');
    if (!t) { t = document.createElement('div'); t.id = 'sb-stat-tip'; t.className = 'sb-tip'; (document.body || document.documentElement).appendChild(t); }
    return t;
  }
  function hideStatTip() { if (typeof document === 'undefined') return; var t = document.getElementById('sb-stat-tip'); if (t) t.classList.remove('show'); }
  var COHORT_ROWS = [['a10', 'A10'], ['midA10', 'A10 >50% est. WR'], ['strongA10', 'A10 >75% est. WR']];
  // tooltip table: rank columns 1..5 across the top, one row per cohort. srcFor(entry)
  // returns the image URL for an entry (cards, relics, or per-kind for shops).
  function showStatTip(anchor, statKey, reps, idKey, srcFor) {
    var t = ensureStatTip();
    var head = '<tr><th></th>' + [1, 2, 3, 4, 5].map(function (n) { return '<th>' + n + '</th>'; }).join('') + '</tr>';
    var body = COHORT_ROWS.map(function (cr) {
      var tops = topN(reps[cr[0]] || [], statKey, idKey, 5), cells = '';
      for (var i = 0; i < 5; i++) {
        var e = tops[i];
        if (e) { var src = srcFor(e); cells += '<td>' + (src ? '<img src="' + esc(src) + '" alt="" onerror="this.style.visibility=\'hidden\'">' : '') + '</td>'; }
        else cells += '<td></td>';
      }
      return '<tr><td class="sb-tip-lab">' + esc(cr[1]) + '</td>' + cells + '</tr>';
    }).join('');
    t.innerHTML = '<table class="sb-tip-tbl">' + head + body + '</table>';
    t.classList.add('show');
    var r = anchor.getBoundingClientRect(), tw = t.offsetWidth, th = t.offsetHeight;
    var x = Math.min(r.left, window.innerWidth - tw - 8); if (x < 8) x = 8;
    var y = r.bottom + 8; if (y + th > window.innerHeight - 8) y = r.top - th - 8;
    t.style.left = x + 'px'; t.style.top = y + 'px';
  }
  function buildStatsDropdown() {
    if (typeof document === 'undefined') return;
    var trig = document.querySelector('.sb-dd-trig[data-dd="stats"]');
    var bar = document.querySelector('.topbar');
    if (!trig || !bar) return;
    ensureDdCss();
    var panel = panelFor('stats', bar);
    function shell(inner) { panel.innerHTML = '<div class="sb-dd-inner">' + inner + '</div>'; }
    if (!panel.innerHTML) shell('<div class="sb-dd-hint">\u2026</div>');
    function paint() {
      loadSortPop().then(function (pop) {
        var h = '';
        STATS_TABS.forEach(function (tb) {
          var cols = statsColsFor(tb.tab), content;
          if (cols && cols.length) {
            var ordered = orderByPop(cols, pop[tb.tab]);
            content = '<span class="sb-dd-links">' + ordered.map(function (s) {
              var grid = (tb.tab === 'cards' || tb.tab === 'relics' || tb.tab === 'shops');   // tabs with an image grid hovertip
              return '<a class="sb-stat-link' + (grid ? ' sb-stat' : '') + '" href="/archive.html#' + tb.tab + '&sort=' + s[0] + '"' + (grid ? ' data-stat="' + s[0] + '" data-kind="' + tb.tab + '"' : '') + '>' + esc(s[1]) + '</a>';
            }).join(DOT) + '</span>';
          } else {
            content = '<span class="sb-dd-hint">\u2014</span>';   // campfires: per-action columns, no stable stats
          }
          // header sits inline with its stats on one line; trimToFit drops trailing stats to fit
          h += '<div class="sb-dd-col"><div class="sb-dd-row"><a class="sb-dd-h sb-dd-h-inline" href="/archive.html#' + tb.tab + '">' + esc(tb.label) + '</a>' + content + '</div></div>';
        });
        // Standalone bespoke-stats page (not an SPA tab) — sits below the categories.
        h += '<div class="sb-dd-col"><div class="sb-dd-row"><a class="sb-dd-h sb-dd-h-inline" href="bespoke.html">Bespoke stats</a></div></div>';
        shell(h);
        var rows = panel.querySelectorAll('.sb-dd-row');
        for (var i = 0; i < rows.length; i++) trimToFit(rows[i]);
      });
    }
    var activeStat = null;
    if (!panel._tipWired) {
      panel._tipWired = true;
      // On first hover of a card/relic/shop stat, lazily pull the three cohort shards + art
      // (memoized), then render the cohort x rank grid. Subsequent hovers are instant.
      panel.addEventListener('mouseover', function (e) {
        var s = e.target.closest && e.target.closest('.sb-stat');
        if (!s) return;
        activeStat = s;
        var key = s.getAttribute('data-stat'), kind = s.getAttribute('data-kind') || 'cards';
        var cardSrc = function (A) { return function (en) { var a = A.art[en.id]; return (A.build && a) ? '/img/cards/' + A.build + '/' + a : ''; }; };
        var relicSrc = function (R) { return function (en) { var a = R.art[en.id]; return (R.build && a) ? '/img/relics/' + R.build + '/' + a : ''; }; };
        if (kind === 'relics') {
          Promise.all([loadRelicReps('a10'), loadRelicReps('midA10'), loadRelicReps('strongA10'), loadRelicArt()]).then(function (r) {
            if (activeStat !== s) return;
            showStatTip(s, key, { a10: r[0], midA10: r[1], strongA10: r[2] }, 'relicId', relicSrc(r[3]));
          });
        } else if (kind === 'shops') {
          Promise.all([loadShopReps('a10'), loadShopReps('midA10'), loadShopReps('strongA10'), loadArt(), loadRelicArt()]).then(function (r) {
            if (activeStat !== s) return;
            var cs = cardSrc(r[3]), rs = relicSrc(r[4]);
            showStatTip(s, key, { a10: r[0], midA10: r[1], strongA10: r[2] }, 'id', function (en) { return en.kind === 'relic' ? rs(en) : cs(en); });
          });
        } else {
          Promise.all([loadReps('a10'), loadReps('midA10'), loadReps('strongA10'), loadArt()]).then(function (r) {
            if (activeStat !== s) return;
            showStatTip(s, key, { a10: r[0], midA10: r[1], strongA10: r[2] }, 'cardId', cardSrc(r[3]));
          });
        }
      });
      panel.addEventListener('mouseout', function (e) { if (e.target.closest && e.target.closest('.sb-stat')) { activeStat = null; hideStatTip(); } });
    }
    wireDropdown(trig, panel, paint);
  }

  // ---- "Leaderboards": per-card / per-relic best winstreaks (A10 cohort) + the Unbeaten
  //      Seeds challenge list. Both lazy-fetched on first open. A name's "N" is its best
  //      streak; a trailing "*" means that streak is the one currently still running. ----
  var PRETTY_CHAR = { IRONCLAD: 'Ironclad', SILENT: 'Silent', DEFECT: 'Defect', REGENT: 'Regent', NECROBINDER: 'Necrobinder', FOOL: 'Fool' };
  function prettyChar(c) { return PRETTY_CHAR[c] || (c ? c.charAt(0) + c.slice(1).toLowerCase() : c); }
  function buildLeaderboardsDropdown() {
    if (typeof document === 'undefined') return;
    var trig = document.querySelector('.sb-dd-trig[data-dd="leaderboards"]');
    var bar = document.querySelector('.topbar');
    if (!trig || !bar) return;
    ensureDdCss();
    var panel = panelFor('leaderboards', bar);
    function shell(wsRows, seedRows) {
      panel.innerHTML = '<div class="sb-dd-inner">'
        + '<div class="sb-dd-col"><a class="sb-dd-h" href="/archive.html#winstreaks">Winstreaks</a>' + wsRows + '</div>'
        + '<div class="sb-dd-col"><a class="sb-dd-h" href="/archive.html#seeds">Unbeaten Seeds</a>' + seedRows + '</div>'
        + '</div>';
    }
    if (!panel.innerHTML) { var d = '<div class="sb-dd-hint">\u2026</div>'; shell(d, d); }
    function wsRow(kind, rows) {
      var attr = kind === 'cards' ? 'data-card-id' : 'data-relic-id';
      var idx = NAV_INDEX[kind];
      var top = (rows || []).filter(function (r) { return r.best > 0; })
        .sort(function (a, b) { return b.best - a.best; }).slice(0, 14);
      if (!top.length) return '';
      var links = top.map(function (r) {
        var star = (r.cur === r.best && r.best > 0) ? '*' : '';
        return '<a href="' + idx + '?id=' + encodeURIComponent(r.id) + '" ' + attr + '="' + esc(r.id) + '" data-hov-w="200">' + esc(prettyName(r.id)) + ' ' + r.best + star + '</a>';
      }).join(DOT);
      return '<div class="sb-dd-row"><span class="sb-dd-lab">' + (kind === 'cards' ? 'Cards' : 'Relics') + '</span><span class="sb-dd-links">' + links + '</span></div>';
    }
    function paint() {
      Promise.all([
        ddGetJSON('/stats/winstreaks?cohort=a10&kind=cards'),
        ddGetJSON('/stats/winstreaks?cohort=a10&kind=relics'),
        ddGetJSON('/stats/unbeaten-seeds')
      ]).then(function (res) {
        var wsRows = (wsRow('cards', res[0] && res[0].rows) + wsRow('relics', res[1] && res[1].rows)) || '<div class="sb-dd-hint">no data yet</div>';
        var seedRows = '<div class="sb-dd-hint">no data yet</div>';
        var sd = res[2];
        if (sd && sd.rows && sd.rows.length) {
          var cur = sd.currentBuild;
          var pool = sd.rows.filter(function (r) { return !cur || r.build === cur; });
          if (!pool.length) pool = sd.rows;
          var top = pool.slice().sort(function (a, b) { return b.expWins - a.expWins; }).slice(0, 14);
          var links = top.map(function (r) {
            return '<a href="/archive.html#seeds">' + esc(prettyChar(r.character)) + ' ' + (Number(r.expWins) || 0).toFixed(1) + '</a>';
          }).join(DOT);
          seedRows = '<div class="sb-dd-row"><span class="sb-dd-lab">Hardest</span><span class="sb-dd-links">' + links + '</span></div>';
        }
        shell(wsRows, seedRows);
        var rows = panel.querySelectorAll('.sb-dd-row');
        for (var i = 0; i < rows.length; i++) trimToFit(rows[i]);
      });
    }
    wireDropdown(trig, panel, paint);
  }

  // ---- "Analysis": the same full-width dropdown shell as Profiles / Stats,
  //      grouping charts, replays and sandbox under one top-level destination. ----
  function buildAnalysisDropdown() {
    if (typeof document === 'undefined') return;
    var trig = document.querySelector('.sb-dd-trig[data-dd="analysis"]');
    var bar = document.querySelector('.topbar');
    if (!trig || !bar) return;
    ensureDdCss();
    var panel = panelFor('analysis', bar);
    function links(items) {
      return items.map(function (it) { return '<a href="' + it[1] + '">' + it[0] + '</a>'; }).join(DOT);
    }
    function paint() {
      panel.innerHTML = '<div class="sb-dd-inner">'
        + '<div class="sb-dd-col">'
        + '<a class="sb-dd-h" href="/archive.html#charts">Charts</a>'
        + '<div class="sb-dd-row"><span class="sb-dd-links">' + links([
          ['Estimated winrate', '/archive.html#charts&ch=winrateOverTime'],
          ['Encounter damage grid', '/archive.html#charts&ch=encDmgGrid'],
          ['Encounter turns grid', '/archive.html#charts&ch=encTurnsGrid']
        ]) + '</span></div>'
        + '<div class="sb-dd-row"><span class="sb-dd-links">' + links([
          ['Winrate per floor', '/archive.html#charts&ch=winratePerFloor'],
          ['Winrate vs run stat', '/archive.html#charts&ch=winrateVsStat&cstat=relicWar'],
          ['Winrate by floor type', '/archive.html#charts&ch=floorTypeWinrate']
        ]) + '</span></div>'
        + '<div class="sb-dd-row"><span class="sb-dd-links">' + links([
          ['% max HP lost per fight', '/archive.html#charts&ch=dmgPerFloor'],
          ['Table scatter (BT Elo vs WAR/seen)', '/archive.html#charts&ch=tableScatter&tbl=cards&tx=eloBT&ty=warSeen'],
          ['Deck clusters', '/archive.html#charts&ch=deckClusters']
        ]) + '</span></div>'
        + '</div>'
        + '<div class="sb-dd-col">'
        + '<a class="sb-dd-h" href="/in-combat-stats.html">In-combat stats</a>'
        + '<div class="sb-dd-row"><span class="sb-dd-links"><a href="/in-combat-stats.html">Community stats</a>' + DOT + '<a href="/engine-combat-stats.html">Engine stats</a></span></div>'
        + '<a class="sb-dd-h" href="/replays.html">Replays <span class="sb-alpha">alpha</span></a>'
        + '<div class="sb-dd-row"><span class="sb-dd-links">'
        + '<a href="/replays.html?user=jorbs">jorbs\'s Runs</a>' + DOT
        + '<a href="/replays.html?user=Spirebird0.111.0">spirebird\'s Runs</a>' + DOT
        + '<a href="/replays.html?mine=1">Your Runs</a>' + DOT
        + '<a href="/archive.html#mod">Get the mod</a>'
        + '</span></div></div>'
        + '<div class="sb-dd-col">'
        + '<a class="sb-dd-h" href="/seeds.html">Seed Finder <span class="sb-alpha">alpha</span></a>'
        + '<div class="sb-dd-row"><span class="sb-dd-links"><a href="/seeds.html">Find seeds</a>' + DOT + '<a href="/hunts.html">Site-wide searches</a></span></div>'
        + '<a class="sb-dd-h" href="/sandbox.html">Sandbox <span class="sb-alpha">alpha</span></a>'
        + '<div class="sb-dd-row"><span class="sb-dd-links"><a href="/sandbox.html">Create a position</a></span></div>'
        + '<div class="sb-dd-hint">With the mod installed, press Ctrl+C in game, then paste into Position JSON.</div>'
        + '</div></div>';
    }
    wireDropdown(trig, panel, paint);
  }

  // ctx: 'spa' | 'card' | 'relic' | 'enemy'. mount: element or element id.
  function render(ctx, mount) {
    ensureCss();
    ensureLogo();
    if (typeof mount === 'string') mount = document.getElementById(mount);
    if (!mount) return;
    var spa = ctx === 'spa', h = '';
    // Profiles + Stats are mega-dropdowns (not .navlink, so the SPA tab handler ignores
    // them; their own handlers toggle the panels).
    h += '<a href="#" class="sb-dd-trig' + (ctx === 'card' || ctx === 'relic' || ctx === 'enemy' ? ' on' : '') + '" data-dd="profiles">Profiles<span class="sb-caret">\u25be</span></a>';
    h += '<a href="#" class="sb-dd-trig" data-dd="stats">Stats<span class="sb-caret">\u25be</span></a>';
    h += '<a href="#" class="sb-dd-trig" data-dd="leaderboards">Leaderboards<span class="sb-caret">\u25be</span></a>';
    h += '<span class="navsep"></span>';
    h += '<a href="#" class="sb-dd-trig' + (ctx === 'in-combat-stats' || ctx === 'replays' || ctx === 'sandbox' ? ' on' : '') + '" data-dd="analysis">Analysis<span class="sb-caret">\u25be</span></a>';
    h += '<span class="navsep"></span>';
    TABS.forEach(function (it) {
      if (it.sep) { h += '<span class="navsep"></span>'; return; }
      if (it.href) {
        h += '<a href="' + esc(it.href) + '"' + (ctx === it.id ? ' class="on"' : '') + '>' + esc(it.label) +
             (it.alpha ? '<span class="sb-alpha">alpha</span>' : '') + '</a>';
        return;
      }
      h += spa
        ? '<a href="#' + it.tab + '" class="navlink" data-tab="' + it.tab + '">' + esc(it.label) + '</a>'
        : '<a href="/archive.html#' + it.tab + '" class="navlink">' + esc(it.label) + '</a>';
    });

    mount.innerHTML = h;
    buildGlobalSearch(ctx);
    buildProfilesDropdown();
    buildStatsDropdown();
    buildLeaderboardsDropdown();
    buildAnalysisDropdown();
  }
  // ---- top-bar account controls -------------------------------------------
  // ONE implementation, mounted into any page carrying an empty <span
  // id="authArea">. There were four hand-copied versions of this and they had
  // drifted into being wrong: replay.html, replays.html and relic.html all keyed
  // off `m.name` / `m.sub`, but /api/me answers with `login` / `subscriber` — so
  // a reader who WAS signed in through Twitch was still handed a "Log in with
  // Twitch" button, and the log-out button posted to /auth/logout, which is not a
  // route (it is /auth/twitch/logout).
  //
  // The SpireBird ACCOUNT is the identity in the chrome, matching the SPA: it is
  // what names an uploaded run, what gates annotating one, and what owns
  // Preferences. A Twitch session is an ENTITLEMENT, not an identity, so it
  // appears only as a subscriber badge and never as a login prompt up here — the
  // places that genuinely need one (the card and scene comment boxes) ask for it
  // in context, where the reason for asking is on screen.
  //
  // The markup reuses each page's existing .twpill / .twgear / .twlogout rules,
  // so this changes what the topbar SAYS without changing how it looks.
  function siteAccount() {
    try { return JSON.parse(localStorage.getItem('spirebird-auth') || 'null'); } catch (e) { return null; }
  }
  function mountAuth(mount) {
    if (typeof document === 'undefined') return;
    mount = (typeof mount === 'string') ? document.getElementById(mount)
          : (mount || document.getElementById('authArea'));
    if (!mount) return;
    // Most pages explicitly mount their account area, while nav.js also has a
    // DOM-ready fallback for pages that forget.  They can both run on the same
    // page; avoid issuing the identical /api/me request twice.
    if (mount.dataset.sbAuthMounted) return;
    mount.dataset.sbAuthMounted = '1';
    var acct = siteAccount(), on = !!(acct && acct.token);

    // Painted twice: once straight from localStorage so the account name is
    // there on first frame, then again when /api/me settles the Twitch badge.
    // Without the first pass the topbar reads "Log in" for as long as the
    // request takes, which is exactly the wrong answer to show a signed-in user.
    function paint(me) {
      acct = siteAccount(); on = !!(acct && acct.token);
      mount.innerHTML =
        (me && me.subscriber
          ? '<button class="twpill sub" id="sbTwOut" title="Subscribed via Twitch \u2014 click to sign out of Twitch.">\u2713 ' +
            esc(me.login || 'Subscriber') + '</button>'
          : '') +
        (on
          ? '<button class="twgear" id="sbPrefs" title="Preferences">\u2699 ' + esc(acct.username || 'Account') + '</button>' +
            '<button class="twlogout" id="sbOut">log out</button>'
          : '<a class="twpill" id="sbIn" href="/archive.html?prefs=1" title="Sign in to your Spirebird account">Log in</a>');
      var p = document.getElementById('sbPrefs');
      if (p) p.addEventListener('click', function () { location.href = '/archive.html?prefs=1'; });
      var o = document.getElementById('sbOut');
      if (o) o.addEventListener('click', function () {
        // The account session lives in localStorage, so signing out is local —
        // there is no server call to make and nothing to wait for. The "hide stats"
        // mirror goes back to off with it (it belongs to the account).
        try { localStorage.removeItem('spirebird-auth'); } catch (e) {}
        if (root.sbStatPrefs) root.sbStatPrefs.save(false);
        location.reload();
      });
      var t = document.getElementById('sbTwOut');
      if (t) t.addEventListener('click', function () {
        var done = function () { location.reload(); };
        fetch('/auth/twitch/logout', { method: 'POST', credentials: 'include' }).then(done, done);
      });
    }
    paint(null);
    fetch('/api/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(paint, function () {});
  }
  // Pull the account's "hide stats" flag into the per-browser mirror (sbStatPrefs) so
  // a box ticked on another device applies here too. Runs from boot() on every page
  // that loads nav.js — independent of mountAuth, since the SPA paints its own account
  // area and never gives mountAuth a mount. Signed-in only; a dead session (401) just
  // leaves the mirror as it was. Once per page.
  var _prefsSynced = false;
  function syncStatPrefs() {
    if (_prefsSynced || !root.sbStatPrefs) return;
    _prefsSynced = true;
    var acct = siteAccount();
    if (!acct || !acct.token) return;
    fetch('/me/prefs', { headers: { Authorization: 'Bearer ' + acct.token } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (p) { if (p && typeof p.hide_stats === 'boolean') root.sbStatPrefs.save(p.hide_stats); }, function () {});
  }
  root.SpirebirdNav = { render: render, mountSearch: mountSearch, mountAuth: mountAuth, TABS: TABS, PROFILES: PROFILES,
    ENEMIES: ENEMIES, encBase: encBase, encDisplayName: encDisplayName };
  // Pages that include nav.js but don't call render() (or call it before the topbar exists)
  // still get the brand swap as soon as the DOM is ready.
  // Auto-mounted for the same reason as the logo swap: a page should not have to
  // remember to call this. Keyed on the id, NOT the .autharea class — the SPA's
  // own .autharea holds its live login/prefs buttons and must not be overwritten.
  function boot() { ensureLogo(); mountAuth(); syncStatPrefs(); }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : this);
