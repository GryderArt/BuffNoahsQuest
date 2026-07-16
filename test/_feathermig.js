// Regression: the SKY-FEATHER reward changed (rain cloud -> floating aviary). An OLD save that
// already earned & SPENT the feather on the removed rain cloud must still be able to build the
// aviary. loadGame() should refund exactly one feather in that case — and NOT over-grant otherwise.
const H = require('./harness');
const { NQ } = H; const { Game, Player } = NQ;
let fails = 0;
const ok = (c, m) => { if (!c) { console.log('  FAIL:', m); fails++; } else console.log('  ok:', m); };

const KEY = 'buffNoahQuest_v4_s0';
function writeSave(flags) {
  localStorage.setItem(KEY, JSON.stringify({ v: 4, flags, log: {}, maxHearts: 6, mapId: 'vale', px: 100, py: 100 }));
}
function freshFlags(extra) {
  return Object.assign({ coins: 0, gems: 0, mats: {}, matsFound: {} }, extra);
}
function load() { Game.state = 'play'; return loadGameGlobal(); }
// loadGame is a top-level function in game.js; reach it through the harness global scope
const loadGameGlobal = H.loadGame || global.loadGame || NQ.loadGame;

// --- Case 1: OLD rain-cloud save (earned + spent, no aviary, 0 feathers) -> refund 1 ---
writeSave(freshFlags({ gotmat_skyfeather: true, matsFound: { ascent_feather: true }, decor_raincloud: true, mats: {} }));
load();
ok((Game.flags.mats.skyfeather || 0) === 1, 'rain-cloud save: feather refunded to 1 (got ' + (Game.flags.mats.skyfeather||0) + ')');
ok(Game.flags.decor_raincloud === false, 'rain-cloud save: old trophy state retired');

// then the player can actually craft the aviary now
Game.loadMap('workshop'); Game.flags.coins = 999;
Game.openDecorCatalog();
const it = Game.menu.items.find(x => x.key === 'aviary');
Game.menu.sel = Game.menu.items.indexOf(it);
Game.decorBuySelected();
ok(Game.flags.aviary === true || Game.flags.decor_aviary === true, 'aviary crafted after refund');
ok((Game.flags.mats.skyfeather || 0) === 0, 'aviary craft consumed the refunded feather');

// --- Case 2: never earned the feather -> NO refund ---
writeSave(freshFlags({ mats: {} }));
load();
ok((Game.flags.mats.skyfeather || 0) === 0, 'no-feather save: not granted a free feather');

// --- Case 3: earned, still HOLDING the feather, no aviary -> stays 1 (no double) ---
writeSave(freshFlags({ gotmat_skyfeather: true, matsFound: { ascent_feather: true }, mats: { skyfeather: 1 } }));
load();
ok((Game.flags.mats.skyfeather || 0) === 1, 'holding-feather save: not doubled (got ' + (Game.flags.mats.skyfeather||0) + ')');

// --- Case 4: earned AND already built the aviary -> NO refund ---
writeSave(freshFlags({ gotmat_skyfeather: true, matsFound: { ascent_feather: true }, decor_aviary: true, aviary: true, mats: { skyfeather: 0 } }));
load();
ok((Game.flags.mats.skyfeather || 0) === 0, 'aviary-built save: no stray feather');

console.log(fails ? ('\nFEATHER-MIGRATION FAIL (' + fails + ')') : '\nFEATHER-MIGRATION PASS — old rain-cloud saves can build the aviary');
process.exit(fails ? 1 : 0);
