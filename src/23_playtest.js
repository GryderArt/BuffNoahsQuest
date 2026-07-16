"use strict";
// ============== PLAYTEST MODE (press T on the title screen) ==============
// God mode's sibling for level-testing: EVERYTHING IS OPEN, NOTHING IS DONE.
//   * full kit: all tools, gear, upgrades, Ramsi + all 7 burrow abilities, sky powers
//   * every door/gate is open, every portal/pad requirement is waived, secret portals
//     are visible, every world-map node is unlocked (flags.god), and the three travel
//     roads never ambush — so you can walk straight to ANY level
//   * but bosses are UNCAUGHT, Pillow-Kin stay CAGED, puzzles/runes/star-cells are
//     UNSOLVED — the actual content is fresh for testing
//   * Noah can't die (hits still flash + knock back, hearts refill)
// Implementation: requirement-stripping is REVERSIBLE (originals stashed on the object
// and restored the moment a non-playtest game loads the same map in the same session).

function playtestMode() {
  const F = Game.flags;
  F.playtest = true; F.god = true;                       // god = every map node unlocked
  Object.assign(F, {
    net: true, cage: true, harpoon: true, bone: true,
    sandals: true, gloves: true, bracers: true, suit: true, wings: true,
    upg_lunge: 2, upg_net: 2, upg_jump: 2, upg_speed: 2, upg_harpoon: 2,
    coins: 99, gems: 60, keys: 9, bosskeys: 9,
    ramsuit: true, ramsi: true, world2: true, ramHead: true, ramStun: true, ramShield: true, ramBoost: true,
    ramGlow: true, ramShrink: true, ramBounce: true, ramGlide: true, ramDecoy: true, ramRoll: true, ramPound: true,
    underburrow: true,                                   // (skips the one-time intro cutscene)
  });
  if (typeof ROAD_ROUTES !== 'undefined') for (const r of Object.values(ROAD_ROUTES)) F['road_' + r] = true;
  if (typeof COG_ROUTES !== 'undefined') for (const r of Object.values(COG_ROUTES)) F['road_' + r] = true;
  F.baits = { clover: 9, tincan: 9, fishsnack: 9, cookie: 9, berry: 9 };
  Player.maxHearts = 16; Player.hearts = 16;
  if (Game.map) Game.ptApplyMap(Game.map);               // strip reqs on the map we're standing in
  Game.state = 'play';
  Game.banner('PLAYTEST MODE: every door, gate, road & map node is OPEN — bosses, Pillow-Kin and puzzles are UNTOUCHED. Noah cannot die. ESC = warp anywhere!');
  saveGame();
}

// ---- reversible requirement stripping (runs on every map load) ----
Game.ptApplyMap = function (m) {
  if (!m) return;
  const on = !!this.flags.playtest;
  for (const o of m.objects) {
    if (o.ptKeep) continue;                                // victory exits keep their locks even in playtest
    if (on) {
      if (o.req !== undefined && o.req !== null && o._ptReq === undefined) { o._ptReq = o.req; o.req = null; }
      if (o.secret && o._ptSecret === undefined) { o._ptSecret = true; o.secret = false; }
    } else {
      if (o._ptReq !== undefined) { o.req = o._ptReq; delete o._ptReq; }
      if (o._ptSecret !== undefined) { o.secret = true; delete o._ptSecret; }
    }
  }
  if (m.links) for (const L of m.links) {
    if (on) { if (L.req !== undefined && L.req !== null && L._ptReq === undefined) { L._ptReq = L.req; L.req = null; } }
    else if (L._ptReq !== undefined) { L.req = L._ptReq; delete L._ptReq; }
  }
};
(function () {
  const orig = Game.loadMap;
  Game.loadMap = function (id, tx, ty) { orig.call(this, id, tx, ty); this.ptApplyMap(this.map); };
})();

// ---- every door swings open in playtest (bosses behind them are still there) ----
(function () {
  const orig = Game.doorIsOpen;
  Game.doorIsOpen = function (m, ti, tj) { if (this.flags.playtest) return true; return orig.call(this, m, ti, tj); };
})();

// ---- hits flash and shove but never end the run ----
(function () {
  const orig = Player.hurt;
  Player.hurt = function (n) { orig.call(this, n); if (Game.flags.playtest) this.hearts = this.maxHearts; };
})();

// ---- a visible badge so screenshots/saves are never mistaken for real runs ----
(function () {
  const orig = UI.drawPanel;
  UI.drawPanel = function (c) {
    orig.call(this, c);
    if (!Game.flags.playtest) return;
    const t = 'PLAYTEST';
    c.fillStyle = 'rgba(36,26,51,.85)'; c.fillRect(2, VH - 13, t.length * 6 + 10, 11);
    c.strokeStyle = '#f8d048'; c.lineWidth = 1; c.strokeRect(2.5, VH - 12.5, t.length * 6 + 9, 10);
    drawText(c, t, 7, VH - 11, 7, '#f8d048', '#241a33');
  };
})();
if (typeof G !== 'undefined' && G.NQ) { G.NQ.playtestMode = playtestMode; }
