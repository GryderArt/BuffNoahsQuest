"use strict";
// ================= WORLD 2 — THE UNDERBURROW (levels 5-8) =================
// With Berkley & Megan home, the ground rumbles: GNASH, the Hollow King has
// dragged Ramsi's plush family — the PILLOW-KIN — into the Underburrow. Noah &
// Ramsi dig down through four burrow-realms, freeing a Pillow-Kin in each (every
// reunion reawakens one of Ramsi's powers) and besting each realm's WARDEN, then
// run a gauntlet of all four Wardens and defeat Gnash to bring the family home.
//
// Ramsi's 7 new abilities, all on ONE key — C ("Call Ramsi") — context-dispatched:
//   GLOW (passive light)  SHRINK (ramhole)  PILLOW-BOUNCE (pad + X)  PUFF-GLIDE
//   (glidevent + C)  DECOY TAUNT  ROLL-CHARGE  GROUND-POUND (battle, C).
// Built in WAVES; map sub-builders are appended below and function-hoisted.

// ===================== the C command key: context dispatch =====================
Game.ramsiCommand = function () {
  if (!this.companionActive || !this.companionActive()) return;
  const comp = this.companion, m = this.map, p = Player;
  if (comp.busyT > 0) return;                                   // mid-ability lock

  // 1) SHRINK through a burrow-hole -> flip its gate flag (puzzle)
  if (this.flags.ramShrink) for (const o of m.objects)
    if (o.type === 'ramhole' && !this.lookupFlag(o.flag) && dist(p.x, p.y, o.x * TILE + 8, o.y * TILE + 8) < 30) {
      comp.x = o.x * TILE + 8; comp.y = o.y * TILE + 8; comp.shrinkT = 1.2; comp.busyT = 0.6;
      this.flags[o.flag] = true; Audio2.jingle('door'); Particles.burst(o.x * TILE + 8, o.y * TILE + 8, 'sparkle');
      this.banner(o.msg || 'RAMSI shrinks through the hole and flips the latch — a gate opens!'); saveGame(); return;
    }

  // 2) PUFF-GLIDE at a glide-vent -> scripted carry across the gap
  if (this.flags.ramGlide) for (const o of m.objects)
    if (o.type === 'glidevent' && o.to && dist(p.x, p.y, o.x * TILE + 8, o.y * TILE + 8) < 24) { this.startGlide(o); return; }

  // 3) BATTLE: a Warden / Gnash is present -> perform the move that opens its window
  const b = this.boss;
  if (b && b.awake && b.gnash) { this.ramsiBattleMove(b); return; }

  // underwater: Ramsi rides his diving BELL — no rolling down here (he'd just spin in a jar)
  if (this.map && this.map.underwater) { Audio2.jingle('cage'); this.toast('Mimi bobs happily in his diving bell! (No rolling underwater.)'); Particles.burst(this.companion.x, this.companion.y - 8, 'sparkle'); return; }
  // 4) ROLL a soft-block right in front of Noah (puzzle)
  if (this.flags.ramRoll && this.softblockAhead()) { this.startRoll(); return; }

  // 5) roaming enemies near -> Pound (AoE) else Decoy else Roll; fall back to practice
  const enemyNear = this.creatures.some(cr => cr.state !== 'gone' && cr.state !== 'trapped' && dist(p.x, p.y, cr.x, cr.y) < 64);
  if (this.flags.ramPound && enemyNear) return this.startPound();
  if (this.flags.ramDecoy && enemyNear) return this.startDecoy();
  if (this.flags.ramRoll) return this.startRoll();
  if (this.flags.ramPound) return this.startPound();
  if (this.flags.ramDecoy) return this.startDecoy();
};

// ----- the boss-context battle move (each Warden/phase declares what opens its window) -----
Game.ramsiBattleMove = function (b) {
  const need = b.gnash ? (b.phase === 2 ? 'roll' : 'pound') : ((b.cfg && b.cfg.cmd) || 'pound');
  if (need === 'shrink' && this.flags.ramShrink) return this.startBossShrink();
  if (need === 'decoy' && this.flags.ramDecoy) return this.startDecoy();
  if (need === 'roll' && this.flags.ramRoll) return this.startRoll();
  if (need === 'pound' && this.flags.ramPound) return this.startPound();
  // sensible fallback to whatever Ramsi knows
  if (this.flags.ramPound) return this.startPound();
  if (this.flags.ramDecoy) return this.startDecoy();
  if (this.flags.ramRoll) return this.startRoll();
};

// ----------------------------- ability starters -----------------------------
Game.startGlide = function (o) {
  const comp = this.companion;
  Player.gArc = { x0: Player.x, y0: Player.y, x1: o.to[0] * TILE + 8, y1: o.to[1] * TILE + 12, t: 0, dur: 0.95, arcH: 14, kind: 'glide' };
  comp.glide = 1.1; comp.busyT = 0.95; Audio2.jingle('flap');
  this.banner(o.msg || 'RAMSI puffs up and glides Noah across the chasm!');
};
Game.tryBounce = function () {
  if (!this.flags.ramBounce || !this.companionActive || !this.companionActive()) return false;
  if (Player.gArc || Player.airborne) return false;
  const [fi, fj] = Player.footTile();
  for (const o of this.map.objects)
    if (o.type === 'bouncepad' && o.to && (fi === o.x && fj === o.y || dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 13)) {
      if (o.req && !this.lookupFlag(o.req)) { this.toast('The Clocktower is JAMMED — clear the city and SOCKET the MASTER-GEAR first!'); return false; }
      this.companion.x = o.x * TILE + 8; this.companion.y = o.y * TILE + 10; this.companion.busyT = 0.3;
      Player.gArc = { x0: Player.x, y0: Player.y, x1: o.to[0] * TILE + 8, y1: o.to[1] * TILE + 12, t: 0, dur: 0.72, arcH: 48, kind: 'bounce' };
      Audio2.jingle('jump'); Particles.burst(o.x * TILE + 8, o.y * TILE + 12, 'dust');
      this.banner(o.msg || 'BOING! RAMSI springs Noah up high!'); return true;
    }
  return false;
};
Game.softblockAhead = function () {
  const [dx, dy] = DIRS[Player.dir];
  for (let s = 1; s <= 2; s++) { const ti = ((Player.x + dx * TILE * s) / TILE) | 0, tj = ((Player.y + dy * TILE * s) / TILE) | 0;
    if ((TILEDEFS[tileAt(this.map, ti, tj)] || {}).soft) return [ti, tj]; }
  return null;
};
Game.startRoll = function () {
  const comp = this.companion;
  comp.rollT = 0.55; comp.rollDir = Player.dir; comp.busyT = 0.55;
  comp.x = Player.x; comp.y = Player.y; Audio2.jingle('push');
};
Game.startDecoy = function () {
  const comp = this.companion;
  comp.decoyT = 3.0; comp.busyT = 0.3;
  Audio2.jingle('talk'); Particles.burst(comp.x, comp.y - 8, 'sparkle');
  this.banner('RAMSI TAUNTS — "Over heeere!" Enemies turn on HIM (he\'s invincible a moment)!');
};
Game.startPound = function () {
  const comp = this.companion;
  if (comp.poundCool > 0) { this.toast('GROUND-POUND is recharging...'); return; }
  comp.poundT = 0.5; comp.poundCool = 1.6; comp.busyT = 0.4;
  Audio2.jingle('rumble');
  Particles.burst(comp.x, comp.y, 'dust'); Particles.burst(comp.x - 10, comp.y, 'dust'); Particles.burst(comp.x + 10, comp.y, 'dust');
  for (const cr of this.creatures)
    if (cr.state !== 'gone' && cr.state !== 'trapped' && dist(comp.x, comp.y, cr.x, cr.y) < 48) { cr.stun = 3.5; Particles.burst(cr.x, cr.y - 6, 'sparkle'); }
  for (const o of this.map.objects)
    if (o.type === 'poundplate' && !this.lookupFlag(o.flag) && dist(comp.x, comp.y, o.x * TILE + 8, o.y * TILE + 8) < 40) {
      this.flags[o.flag] = true; o.on = true; Audio2.jingle('door'); Particles.burst(o.x * TILE + 8, o.y * TILE + 8, 'sparkle');
      this.banner(o.msg || 'WHAM! The ground-pound slams the great floor-plate — a gate grinds open!'); saveGame();
    }
  this.banner('RAMSI GROUND-POUNDS — a shockwave STUNS everything nearby!');
};

// --------------------- passive ticks (called from updateCompanion) ---------------------
Game.updateBurrowAbilities = function (dt) {
  const comp = this.companion, m = this.map;
  for (const k of ['busyT', 'shrinkT', 'glide', 'bounceT', 'decoyT', 'poundT', 'poundCool', 'bossShrinkT']) if (comp[k] > 0) comp[k] -= dt;
  this.glowOn = !!(this.flags.ramGlow && m && m.dark);

  // while gliding, Ramsi rides just under Noah
  if (Player.gArc && Player.gArc.kind === 'glide') { comp.x = Player.x; comp.y = Player.y + 10; comp.glide = Math.max(comp.glide, 0.1); }

  // ROLL-CHARGE: dash Ramsi in the rolled direction, smashing soft-blocks + bowling critters
  if (comp.rollT > 0) {
    comp.rollT -= dt;
    const [dx, dy] = DIRS[comp.rollDir || 'right'];
    const nx = comp.x + dx * 150 * dt, ny = comp.y + dy * 150 * dt;
    const ti = (nx / TILE) | 0, tj = (ny / TILE) | 0;
    if ((TILEDEFS[tileAt(m, ti, tj)] || {}).soft) { T(m, ti, tj, m.zone === 'city' ? 'cogfloor' : 'soil'); Audio2.jingle('cage'); Particles.burst(ti * TILE + 8, tj * TILE + 8, 'confetti'); if (m.zone === 'city' && this.onCitySmash) this.onCitySmash(m); }
    if ((TILEDEFS[tileAt(m, ti, tj)] || {}).solid) { comp.rollT = 0; }   // whirl STOPS at an unbreakable wall (gearwall/pipe/crack) — no phasing through
    else { comp.x = nx; comp.y = ny; }
    for (const cr of this.creatures)
      if (cr.state !== 'gone' && cr.state !== 'trapped' && cr.stun <= 0 && dist(comp.x, comp.y, cr.x, cr.y) < 14) { cr.stun = 3.0; Particles.burst(cr.x, cr.y - 6, 'sparkle'); }
    if (comp.rollT <= 0) { comp.x = Player.x - 12; comp.y = Player.y + 6; }
  }
};

// ===================== build every Underburrow map (runs at module load) =====================
function buildUnderburrow() {
  if (typeof buildBurrowTest === 'function') buildBurrowTest();
  if (typeof buildBurrow5 === 'function') buildBurrow5();
  if (typeof buildBurrow6 === 'function') buildBurrow6();
  if (typeof buildBurrow7 === 'function') buildBurrow7();
  if (typeof buildBurrow8 === 'function') buildBurrow8();
  if (typeof buildVaults === 'function') buildVaults();
  if (typeof buildGnashThrone === 'function') buildGnashThrone();
}

// ===================== a tiny end-to-end test bed for every ability =====================
function buildBurrowTest() {
  if (MAPS.burrowtest) return;
  const m = newMap('burrowtest', 34, 16, 'soil', { name: 'Burrow Test', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  for (const [vx, vy] of [[4, 6], [5, 7], [6, 8], [7, 9], [8, 8], [9, 7], [10, 8], [11, 9], [12, 8]]) T(m, vx, vy, 'glowvein');
  SIGN(m, 2, 11, 'BURROW TEST. Free the PILLOW-KIN (SPACE) to learn GLOW + SHRINK, then press C at the burrow-hole.');
  OBJ(m, { type: 'pillowkin', x: 6, y: 10, kin: 0, caged: true, color: '#7fe6b8', gives: ['ramGlow', 'ramShrink'],
    freed: 'PILLOW-KIN freed! RAMSI glows in the dark AND can SHRINK through burrow-holes (press C)!' });
  // root-wall barrier with a burrow-hole + a flag-gate latched from the far side
  R(m, 15, 1, 1, m.h - 2, 'rootwall');
  T(m, 15, 6, 'holegap');
  DOOR(m, 15, 9, 'flag', 'bt_gate', 'A burrow-gate, latched on the far side.');
  OBJ(m, { type: 'ramhole', x: 14, y: 6, flag: 'bt_gate', compOnly: true,
    msg: 'RAMSI shrinks through the hole and flips the gate latch — it grinds open!' });
  SIGN(m, 12, 11, "A wall with a tiny burrow-hole — Noah can't fit, but shrunk RAMSI can. Stand close, press C!");
  // ---- right-hand arena: Roll / Bounce / Glide stations (props don't gate the path) ----
  R(m, 19, 10, 2, 1, 'softblock');                                  // ROLL: a soft pile to bowl through
  SIGN(m, 18, 12, 'ROLL-CHARGE: face the soft pile and press C to smash it.');
  OBJ(m, { type: 'bouncepad', x: 24, y: 12, to: [24, 5], msg: 'BOING! Up to the high ledge!' });
  SIGN(m, 23, 13, 'PILLOW-BOUNCE: stand on the mushroom and press X to launch up.');
  CHEST(m, 24, 5, { gems: 6 });
  R(m, 27, 11, 3, 1, 'chasm');                                      // a gap to glide over
  OBJ(m, { type: 'glidevent', x: 26, y: 11, to: [31, 11], msg: 'RAMSI glides Noah across the gap!' });
  SIGN(m, 25, 9, 'PUFF-GLIDE: at the updraft, press C to glide the gap.');
  CHEST(m, 31, 9, { heartpiece: 1 });
  SPAWN(m, 'sheep', 20, 7, 4, 2, 2);                                // critters to demo Pound / Decoy
  m.start = { x: 3, y: 8 };
}

if (typeof G !== 'undefined' && G.NQ) { G.NQ.buildUnderburrow = buildUnderburrow; }

// ===================== the four BURROW WARDENS (co-op bosses) =====================
// One shared AI: Ramsi's KEY move (cmd) briefly drops the Warden's guard; while the
// guard is down, Noah lands hits with the level's `tool`. N hits => caught. Each is
// fought in its home level AND re-summoned in the finale gauntlet (fresh g_* flags).
const BURROW_BOSS = {
  mottle:    { title: 'MOTTLE THE MOLE', sprite: 'goat',    armor: 2, hitR: 24, tool: 'mitts',   toolName: 'GRAB (Z)',        cmd: 'shrink', spd: 1.3, rangeX: 40, rangeY: 10,
    wake: 'MOTTLE THE MOLE burrows up and down! Send shrunk RAMSI (C) to yank him out — then GRAB him (Z)!' },
  thornback: { title: 'THORNBACK',       sprite: 'crab',    armor: 3, hitR: 26, tool: 'net',     toolName: 'NET (Z)',         cmd: 'decoy',  spd: 0.8, rangeX: 50, rangeY: 16,
    wake: 'THORNBACK\'s front is all armor! DECOY (C) to spin it around, then NET its soft back (Z)!' },
  geode:     { title: 'GEODE GOLEM',      sprite: 'ram',     armor: 3, hitR: 28, tool: 'harpoon', toolName: 'HARPOON (Z)',     cmd: 'roll',   spd: 0.7, rangeX: 44, rangeY: 12,
    wake: 'GEODE GOLEM\'s shell is unbreakable! GLIDE behind it, ROLL-CHARGE (C) its core — then HARPOON (Z)!' },
  grub:      { title: 'THE TREMOR-GRUB',  sprite: 'octopus', armor: 3, hitR: 28, tool: 'bone',    toolName: 'BOOMER-BONE (Z)', cmd: 'pound',  spd: 0.5, rangeX: 26, rangeY: 8,
    wake: 'THE TREMOR-GRUB surfaces and dives! GROUND-POUND (C) as it surfaces to flip it belly-up — then BONE it (Z)!' },
};
const BURROW_TINT = { mottle: 'rgba(150,110,70,.30)', thornback: 'rgba(120,200,140,.30)', geode: 'rgba(150,120,230,.32)', grub: 'rgba(230,140,110,.30)' };

// shrink-attack on a SHRINK warden (Mottle): Ramsi darts under him and yanks him up
Game.startBossShrink = function () {
  const comp = this.companion, b = this.boss;
  comp.shrinkT = 1.0; comp.bossShrinkT = 0.7; comp.busyT = 0.5;
  if (b) { comp.x = b.x; comp.y = b.y + 6; }
  Audio2.jingle('cage'); if (b) Particles.burst(b.x, b.y, 'sparkle');
  this.banner('RAMSI shrinks and YANKS the Warden up — its guard drops! Hit it (Z)!');
};

Bosses.up_warden = function (b, dt) {
  const p = Player, cfg = b.cfg, comp = Game.companion;
  if (b.inv > 0) b.inv -= dt;
  if (b.shieldT > 0) b.shieldT -= dt;
  if (b.stun > 0) b.stun -= dt;
  const lean = clamp((p.x - b.hx) / 80, -1, 1);
  b.x = b.hx + Math.cos(b.t * cfg.spd) * cfg.rangeX + lean * 10;
  b.y = b.hy + Math.sin(b.t * cfg.spd * 1.3) * cfg.rangeY;
  if (b.shieldT > 0) {                              // guard DOWN (Ramsi headbutted) -> Noah lands tool hits
    if (this.wardenHit(b)) {
      b.hits++; b.inv = 0.7; Audio2.jingle('capture'); Particles.burst(b.x, b.y - 12, 'confetti');
      if (b.hits >= b.armor) { this.catchBoss(b); return; }
      Game.banner('HIT! ' + cfg.title + ' (' + b.hits + '/' + b.armor + ') — keep RAMSI on it!');
    }
  } else if (this.wardenHit(b)) {
    if (Game.time - (b.clinkT || 0) > 1) { b.clinkT = Game.time; Game.toast(cfg.title + ' is GUARDED — bring RAMSI close so he HEADBUTTS it first!'); }
    b.inv = 0.4;
  }
  if (Player.inv <= 0 && b.stun <= 0 && !(comp.decoyT > 0) && dist(p.x, p.y, b.x, b.y) < 14) Player.hurt(1);
};
Bosses.wardenWindowOpens = function (b, cfg, comp) {
  const near = dist(comp.x, comp.y, b.x, b.y);
  if (cfg.cmd === 'shrink') return comp.bossShrinkT > 0 && near < 44;
  if (cfg.cmd === 'decoy')  return comp.decoyT > 2.5 && near < 80;
  if (cfg.cmd === 'roll')   return comp.rollT > 0 && near < 32;
  if (cfg.cmd === 'pound')  return comp.poundT > 0 && near < 66 && b.surf > 0;
  return false;
};
Bosses.wardenHit = function (b) { if (b.inv > 0) return false; return this.skyHit(b); };
Bosses.drawWarden = function (c, b) {
  const ov = Sprites[b.name];
  const set = Sprites.creatures[b.cfg.sprite];
  const spr = ov || (Player.x > b.x ? set.right : set.left)[(b.t * 3 | 0) % 2];
  const sc = ov ? 1 : 2.4;
  c.save();
  if (b.stun > 0) c.rotate(Math.sin(b.t * 12) * 0.1);
  if (ov && Player.x < b.x) c.scale(-sc, sc); else c.scale(sc, sc);
  dspr(c, spr, -sprW(spr) / 2, -sprH(spr));
  c.restore();
  c.save(); c.globalAlpha = 0.5; c.fillStyle = BURROW_TINT[b.name] || 'rgba(180,150,120,.25)';
  c.beginPath(); c.arc(0, -sprH(spr) * sc / 2, sprW(spr) * sc * 0.5, 0, 7); c.fill(); c.restore();
  if (b.shieldT <= 0) {     // GUARD shell when armored (no open window)
    c.strokeStyle = 'rgba(210,180,120,' + (0.5 + 0.3 * Math.sin(b.t * 6)) + ')'; c.lineWidth = 2;
    c.beginPath(); c.arc(0, -sprH(spr) * sc / 2, sprW(spr) * sc * 0.62, 0, 7); c.stroke(); c.lineWidth = 1;
  }
  const top = -sprH(spr) * sc - 8;
  for (let k = 0; k < b.armor; k++) { c.fillStyle = k < (b.armor - b.hits) ? '#e84a4a' : '#3a2c50'; c.beginPath(); c.arc(-(b.armor - 1) * 6 + k * 12, top, 4, 0, 7); c.fill(); c.strokeStyle = '#241a33'; c.stroke(); }
};
Bosses.finalizeWarden = function (b) {
  const F = Game.flags;
  if (b.gauntlet) { F['g_' + b.name] = true; Game.banner(b.cfg.title + ' falls again! The next den-gate opens — onward!'); }
  else { F[b.name] = true; Game.giveLoot({ heartC: 1 }); Game.banner(b.cfg.title + ' is CAUGHT! Its cage-lock springs — FREE the PILLOW-KIN (SPACE) to awaken a NEW power!'); }
};
if (typeof G !== 'undefined' && G.NQ) { G.NQ.BURROW_BOSS = BURROW_BOSS; }

// ===================== LEVEL 5 — TOPSOIL TUNNELS (Glow + Shrink; Warden: MOTTLE) =====================
function buildBurrow5() {
  if (MAPS.burrow5) return;
  const m = newMap('burrow5', 60, 22, 'soil', { name: 'Topsoil Tunnels', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  m.start = { x: 3, y: 11 };
  const vein = (pts) => { for (const [x, y] of pts) T(m, x, y, 'glowvein'); };

  // ---- Chamber 1: tumble-in + the burrow-mole + Pillow-Kin #1 (glow-cub) ----
  NPC(m, 6, 11, 'granny', 'Old Mole');
  SIGN(m, 3, 13, 'You tumble into THE UNDERBURROW after Ramsi! GNASH the Hollow King stole the PILLOW-KIN — Ramsi\'s plush family. Dig down and free them all!');
  vein([[8, 7], [9, 8], [10, 9], [9, 13], [10, 14], [7, 15]]);
  SIGN(m, 8, 14, 'Pitch dark down here... MR. RAM, a plush pup, is caged in the alcove above. Free him (SPACE)!');
  OBJ(m, { type: 'pillowkin', x: 11, y: 6, kin: 1, caged: true, color: '#8ef0c0', gives: ['ramGlow', 'ramShrink'],
    name: 'MR. RAM', freed: 'You free MR. RAM! RAMSI now GLOWS in the dark — and can SHRINK through burrow-holes (press C)!' });
  R(m, 9, 4, 5, 1, 'rootwall'); R(m, 9, 5, 1, 3, 'rootwall'); R(m, 13, 5, 1, 3, 'rootwall');  // alcove frame

  // ---- Barrier 1 + SHRINK gate (b5_g1) ----
  R(m, 15, 1, 1, 20, 'rootwall');
  T(m, 15, 9, 'holegap'); DOOR(m, 15, 11, 'flag', 'b5_g1', 'A root-gate, latched on the far side.');
  OBJ(m, { type: 'ramhole', x: 13, y: 9, flag: 'b5_g1', compOnly: true, msg: 'RAMSI shrinks through the hole and unlatches the gate!' });
  SIGN(m, 12, 13, 'A wall with a tiny burrow-hole. Stand close and press C — shrunk RAMSI will flip the latch!');

  // ---- Chamber 2: a SECRET heart-piece behind a second shrink-hole (Glow reveals it) ----
  vein([[18, 9], [19, 10], [20, 11], [21, 10], [22, 9], [23, 8]]);
  SIGN(m, 18, 13, 'Some burrow-holes only glimmer in RAMSI\'s GLOW... a secret hides up here.');
  R(m, 23, 2, 6, 1, 'rootwall'); R(m, 23, 2, 1, 4, 'rootwall'); R(m, 28, 2, 1, 4, 'rootwall'); R(m, 24, 5, 5, 1, 'rootwall');  // secret box (x24-27,y3-4)
  T(m, 26, 5, 'holegap'); DOOR(m, 25, 5, 'flag', 'b5_secret', 'A hidden burrow-gate.');
  OBJ(m, { type: 'ramhole', x: 22, y: 6, flag: 'b5_secret', compOnly: true, msg: 'RAMSI squeezes through the glimmering hole — a secret opens!' });
  CHEST(m, 26, 3, { heartpiece: 1 });

  // ---- Barrier 2 + SHRINK gate (b5_g2) ----
  R(m, 30, 1, 1, 20, 'rootwall');
  T(m, 30, 13, 'holegap'); DOOR(m, 30, 11, 'flag', 'b5_g2', 'A thick root-gate.');
  OBJ(m, { type: 'ramhole', x: 28, y: 13, flag: 'b5_g2', compOnly: true, msg: 'RAMSI shrinks through and heaves the gate open!' });
  SIGN(m, 33, 13, 'MOTTLE THE MOLE guards the way! He hides in his shell — send shrunk RAMSI (C) to yank him out, then GRAB him (Z)!');

  // ---- Chamber 3: MOTTLE arena (he pops between holes) ----
  for (const [hx, hy] of [[33, 1], [40, 1], [36, 20], [43, 20]]) T(m, hx, hy, 'holegap');
  vein([[35, 8], [38, 9], [41, 8]]);
  OBJ(m, { type: 'boss', x: 38, y: 11, boss: 'mottle' });

  // ---- Boss-gate + Chamber 4: the root-elevator down ----
  R(m, 45, 1, 1, 20, 'rootwall');
  DOOR(m, 45, 11, 'flag', 'mottle', 'A root-gate sealed by MOTTLE\'s magic — beat him to pass.');
  SIGN(m, 48, 13, 'A root-elevator! It descends to the ROOT HOLLOWS far below.');
  CHEST(m, 50, 8, { gems: 8 });
  OBJ(m, { type: 'portal', x: 53, y: 11, to: 'burrow6', tx: 3, ty: 11, req: 'mottle' });
  m.b5 = true;
}

// ===================== LEVEL 6 — ROOT HOLLOWS (Bounce + Decoy; Warden: THORNBACK) =====================
function buildBurrow6() {
  if (MAPS.burrow6) return;
  const m = newMap('burrow6', 60, 24, 'soil', { name: 'Root Hollows', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  m.start = { x: 3, y: 18 };
  const vein = (pts) => { for (const [x, y] of pts) T(m, x, y, 'glowvein'); };
  const rootPillars = (cols) => { for (const [x, y, h] of cols) R(m, x, y, 1, h, 'rootwall'); };

  // ---- Chamber 1: drop-in + Pillow-Kin #2 (Bounce + Decoy) ----
  SIGN(m, 3, 20, 'THE ROOT HOLLOWS — a vast hollow of braided roots. Another PILLOW-KIN is caged ahead. Free it (SPACE)!');
  rootPillars([[6, 1, 9], [10, 14, 9]]);                              // hanging / rising roots
  vein([[5, 16], [7, 14], [9, 12]]);
  OBJ(m, { type: 'pillowkin', x: 8, y: 18, kin: 2, caged: true, color: '#f0c060', gives: ['ramBounce', 'ramDecoy'],
    name: 'BEAST MIMI', freed: 'You free BEAST MIMI! RAMSI learns PILLOW-BOUNCE (stand on a mushroom, press X) and DECOY TAUNT (press C)!' });

  // ---- Bounce barrier 1: a root-shelf too tall to climb ----
  R(m, 15, 1, 1, 23, 'rootwall');
  OBJ(m, { type: 'bouncepad', x: 13, y: 18, to: [16, 18], msg: 'BOING! RAMSI springs Noah over the root-shelf!' });
  SIGN(m, 12, 20, 'A root-shelf blocks the way! Stand on the MUSHROOM and press X — RAMSI flattens into a trampoline!');

  // ---- Chamber 2: sap-wasp swarm (DECOY) + a SHRINK secret heart-piece ----
  SIGN(m, 17, 20, 'SAP-WASPS! Press C — RAMSI DECOYS the swarm (they chase HIM) while you slip through.');
  SPAWN(m, 'jellyfish', 19, 13, 8, 8, 4);                            // the "sap-wasps"
  vein([[20, 10], [23, 8], [26, 11]]);
  // shrink secret: a walled pocket with a heart-piece
  R(m, 22, 3, 5, 1, 'rootwall'); R(m, 22, 3, 1, 4, 'rootwall'); R(m, 26, 3, 1, 4, 'rootwall'); R(m, 22, 6, 5, 1, 'rootwall');
  T(m, 24, 6, 'holegap'); DOOR(m, 23, 6, 'flag', 'b6_secret', 'A hidden burrow-gate.');
  OBJ(m, { type: 'ramhole', x: 21, y: 8, flag: 'b6_secret', compOnly: true, msg: 'RAMSI shrinks through — a secret sap-pocket opens!' });
  CHEST(m, 24, 4, { heartpiece: 1 });

  // ---- Bounce barrier 2 ----
  R(m, 31, 1, 1, 23, 'rootwall');
  OBJ(m, { type: 'bouncepad', x: 29, y: 18, to: [33, 18], msg: 'BOING! Over you go!' });
  SIGN(m, 28, 20, 'Another shelf — BOUNCE over it (stand on the mushroom, press X).');

  // ---- Chamber 3: THORNBACK arena (Decoy to spin it, Bounce to its soft back) ----
  rootPillars([[36, 1, 7], [44, 16, 7]]);
  SIGN(m, 33, 20, 'THORNBACK! Its front is all armor. DECOY (C) to spin it around, then NET its soft back (Z)!');
  OBJ(m, { type: 'bouncepad', x: 40, y: 20, to: [40, 9], msg: 'Up to its soft back!' });
  OBJ(m, { type: 'boss', x: 39, y: 12, boss: 'thornback' });

  // ---- Boss-gate + Chamber 4: the sap-fall down ----
  R(m, 47, 1, 1, 23, 'rootwall');
  DOOR(m, 47, 12, 'flag', 'thornback', 'A root-gate sealed by THORNBACK — beat it to pass.');
  SIGN(m, 49, 20, 'A SAP-FALL pours into the depths — ride it down to the CRYSTAL DEEP.');
  CHEST(m, 52, 8, { gems: 8 });
  OBJ(m, { type: 'portal', x: 55, y: 18, to: 'burrow7', tx: 3, ty: 18, req: 'thornback' });
  m.b6 = true;
}

// ===================== LEVEL 7 — CRYSTAL DEEP (Glide + Roll; Warden: GEODE GOLEM) =====================
function buildBurrow7() {
  if (MAPS.burrow7) return;
  const m = newMap('burrow7', 60, 24, 'soil', { name: 'Crystal Deep', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  m.start = { x: 3, y: 18 };
  const vein = (pts) => { for (const [x, y] of pts) T(m, x, y, 'glowvein'); };
  const crystals = (pts) => { for (const [x, y] of pts) T(m, x, y, 'crystal'); };

  // ---- Chamber 1: entry + Pillow-Kin #3 (Glide + Roll) ----
  SIGN(m, 3, 20, 'THE CRYSTAL DEEP — glittering caverns over bottomless star-chasms. Free the next PILLOW-KIN (SPACE)!');
  crystals([[5, 16], [9, 14], [6, 20]]); vein([[7, 17], [8, 15]]);
  OBJ(m, { type: 'pillowkin', x: 7, y: 18, kin: 3, caged: true, color: '#9ad0ff', gives: ['ramGlide', 'ramRoll'],
    name: 'TOOTHLESS', freed: 'You free TOOTHLESS! RAMSI learns PUFF-GLIDE (at an updraft, press C) and ROLL-CHARGE (face a crystal soft-block, press C)!' });

  // ---- Glide crossing 1: a wide star-chasm wings can't cross (no-fly) ----
  R(m, 13, 1, 4, 22, 'chasm');
  OBJ(m, { type: 'glidevent', x: 12, y: 18, to: [17, 18], msg: 'RAMSI puffs up and glides Noah over the star-chasm!' });
  SIGN(m, 11, 20, 'A bottomless star-chasm — too wide to jump and wings are useless this deep. At the UPDRAFT, press C to GLIDE!');

  // ---- Chamber 2: ROLL through a crystal soft-block wall + a reversible secret ----
  R(m, 22, 1, 1, 23, 'softblock');                                   // a crystal soft-block barrier
  SIGN(m, 18, 20, 'A wall of crystal SOFT-BLOCKS. Face it and press C — RAMSI ROLL-CHARGES straight through!');
  vein([[19, 9], [25, 8], [28, 11]]);
  // secret pocket (roll in, walk out)
  crystals([[26, 3], [27, 3], [28, 3], [26, 4], [28, 4], [26, 5], [28, 5]]);   // (27,5) stays open: the shaft up to the vault
  T(m, 27, 6, 'softblock');
  CHEST(m, 27, 4, { heartpiece: 1 });
  SIGN(m, 25, 11, 'A crystal vault, sealed by a soft-block — ROLL-CHARGE (C) up into it for a HEART-PIECE.');

  // ---- Geode arena: glide behind it, roll its core ----
  crystals([[35, 1], [35, 2], [43, 21], [43, 22]]); vein([[37, 8], [41, 9]]);
  SIGN(m, 33, 20, 'GEODE GOLEM! Its shell is unbreakable up front. GLIDE behind it, ROLL-CHARGE (C) its core, then HARPOON (Z)!');
  OBJ(m, { type: 'glidevent', x: 35, y: 20, to: [43, 12], msg: 'RAMSI glides Noah around behind the Golem!' });
  OBJ(m, { type: 'boss', x: 39, y: 12, boss: 'geode' });

  // ---- Boss-gate + exit shaft ----
  R(m, 47, 1, 1, 23, 'rootwall');
  DOOR(m, 47, 12, 'flag', 'geode', 'A crystal gate sealed by the GEODE GOLEM — beat it to pass.');
  SIGN(m, 49, 20, 'A great downward shaft — you can hear GNASH\'s hoard rumbling far below.');
  CHEST(m, 52, 8, { gems: 10 });
  OBJ(m, { type: 'portal', x: 55, y: 18, to: 'burrow8', tx: 3, ty: 18, req: 'geode' });
  m.b7 = true;
}

// ===================== LEVEL 8 — THE HOARD DESCENT (Ground-Pound; Warden: TREMOR-GRUB) =====================
function buildBurrow8() {
  if (MAPS.burrow8) return;
  const m = newMap('burrow8', 70, 24, 'soil', { name: 'The Hoard Descent', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  m.start = { x: 3, y: 11 };
  const vein = (pts) => { for (const [x, y] of pts) T(m, x, y, 'glowvein'); };

  // ---- C1: entry + Pillow-Kin #4 (Ground-Pound, the finale ultimate) ----
  SIGN(m, 3, 13, 'GNASH\'S HOARD — piles of stolen soft things lit by stolen lanterns. The last PILLOW-KIN is here. Free it (SPACE)!');
  vein([[5, 9], [7, 13], [9, 10]]);
  OBJ(m, { type: 'pillowkin', x: 6, y: 11, kin: 4, caged: true, color: '#f090b0', gives: ['ramPound'],
    name: 'LUCKY', freed: 'You free LUCKY, the last Pillow-Kin! RAMSI learns the GROUND-POUND (press C) — a shockwave that STUNS everything! Now drill every power on the way down.' });

  // ---- the ability-chain: SHRINK -> BOUNCE -> GLIDE -> ROLL -> POUND ----
  // SHRINK gate
  R(m, 12, 1, 1, 22, 'rootwall'); T(m, 12, 9, 'holegap'); DOOR(m, 12, 11, 'flag', 'b8_g1', 'A latched root-gate.');
  OBJ(m, { type: 'ramhole', x: 11, y: 9, flag: 'b8_g1', compOnly: true, msg: 'RAMSI shrinks through and unlatches the gate!' });
  SIGN(m, 9, 13, 'SHRINK (C) through the hole to open the gate.');
  // BOUNCE shelf
  R(m, 21, 1, 1, 22, 'rootwall');
  OBJ(m, { type: 'bouncepad', x: 18, y: 11, to: [22, 11], msg: 'BOING! Over the hoard-pile!' });
  SIGN(m, 15, 13, 'BOUNCE (X on the mushroom) over the hoard-pile.');
  // GLIDE chasm
  R(m, 28, 1, 4, 22, 'chasm');
  OBJ(m, { type: 'glidevent', x: 27, y: 11, to: [33, 11], msg: 'RAMSI glides Noah over the chasm of coins!' });
  SIGN(m, 24, 13, 'GLIDE (C at the updraft) over the coin-chasm.');
  // ROLL wall
  R(m, 38, 1, 1, 22, 'softblock');
  SIGN(m, 34, 13, 'ROLL-CHARGE (C) through the soft-block wall.');
  // POUND a sap-wasp nest blocking the hall
  SPAWN(m, 'jellyfish', 41, 8, 5, 8, 5);
  SIGN(m, 40, 14, 'A wasp-nest! GROUND-POUND (C) to stun the whole swarm, then slip through.');
  vein([[43, 9], [45, 13]]);

  // ---- TREMOR-GRUB arena (Pound as it surfaces -> flip it -> BONE) ----
  for (const [hx, hy] of [[48, 1], [56, 1], [50, 22], [54, 22]]) T(m, hx, hy, 'holegap');
  SIGN(m, 47, 14, 'THE TREMOR-GRUB! It burrows and surfaces. GROUND-POUND (C) as it SURFACES to flip it belly-up, then BONE it (Z)!');
  OBJ(m, { type: 'boss', x: 52, y: 11, boss: 'grub' });

  // ---- boss-gate -> the Hoard Cavern gauntlet ----
  R(m, 60, 1, 1, 22, 'rootwall'); DOOR(m, 60, 11, 'flag', 'grub', 'A gate sealed by the TREMOR-GRUB.');
  SIGN(m, 62, 13, 'THE HOARD CAVERN yawns ahead — GNASH re-summons his elite. Steel yourself for the GAUNTLET!');
  CHEST(m, 63, 8, { heartpiece: 1 });
  OBJ(m, { type: 'portal', x: 66, y: 11, to: 'vault1', tx: 3, ty: 7, req: 'grub' });
  m.b8 = true;
}

// ===================== THE GAUNTLET — vault1..4 (re-fight all four Wardens, fresh g_* flags) =====================
function buildVaults() {
  if (MAPS.vault1) return;
  const den = (id, name, boss, nextTo, gateFlag) => {
    const m = newMap(id, 26, 15, 'soil', { name: name, song: 'boss', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
    for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
    for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
    for (const [x, y] of [[5, 3], [20, 3], [5, 11], [20, 11]]) T(m, x, y, 'holegap');
    m.start = { x: 3, y: 7 };
    OBJ(m, { type: 'boss', x: 13, y: 7, boss: boss, gauntlet: true });
    SIGN(m, 3, 9, name + ' — GNASH re-summons ' + boss.toUpperCase() + '! Beat it the same way to open the next den.');
    OBJ(m, { type: 'portal', x: 23, y: 7, to: nextTo, tx: 3, ty: 7, req: gateFlag });
    R(m, 22, 1, 1, 13, 'rootwall'); DOOR(m, 22, 7, 'flag', gateFlag, 'A den-gate — beat the Warden to open it.');
    return m;
  };
  den('vault1', 'Hoard Cavern I',   'mottle',    'vault2',      'g_mottle');
  den('vault2', 'Hoard Cavern II',  'thornback', 'vault3',      'g_thornback');
  den('vault3', 'Hoard Cavern III', 'geode',     'vault4',      'g_geode');
  den('vault4', 'Hoard Cavern IV',  'grub',      'gnash_throne','g_grub');
}

// ===================== FINAL BOSS — GNASH, THE HOLLOW KING (3 phases x 3 hits) =====================
const GNASH = { title: 'GNASH, THE HOLLOW KING', sprite: 'dragon', hitR: 40,
  wake: 'GNASH: "You DARE raid my hoard?! The PILLOW-KIN are MINE!" — He burrows deep. POUND (C) him up as he SURFACES, then BONE him (Z)!' };
Bosses.toolHits = function (b, tool) {
  const p = Player, near = dist(p.x, p.y, b.x, b.y);
  const R = (b.cfg && b.cfg.hitR) || 24;                 // the Hollow King is HUGE — his whole body counts
  if (tool === 'mitts') return p.lungeT > 0 && near < R;
  if (tool === 'net') return (p.netT > 0 && near < R + 2) || (Game.flyingNets || []).some(n => dist(n.x, n.y, b.x, b.y) < R - 6);
  if (tool === 'harpoon') return !!p.harpoon && dist(p.harpoon.x, p.harpoon.y, b.x, b.y) < R - 8;
  if (tool === 'bone') return !!p.bone && dist(p.bone.x, p.bone.y, b.x, b.y) < R - 8;
  return false;
};
Bosses.up_gnash = function (b, dt) {
  const p = Player, comp = Game.companion;
  if (b.inv > 0) b.inv -= dt;
  if (b.shieldT > 0) b.shieldT -= dt;
  if (b.stun > 0) b.stun -= dt;
  b.surfT -= dt;
  const lean = clamp((p.x - b.hx) / 110, -1, 1);
  b.x = b.hx + Math.cos(b.t * 0.7) * 56 + lean * 10;
  b.y = b.hy + Math.sin(b.t * 0.9) * 18;
  if (b.phase === 1) { if (b.surfT <= 0) { b.surf = b.surf ? 0 : 1; b.surfT = b.surf ? 2.2 : 1.6; } } else b.surf = 1;
  // the co-op move that opens the window depends on the phase
  const cmd = b.phase === 2 ? 'roll' : 'pound';
  const near = dist(comp.x, comp.y, b.x, b.y);
  const opens = cmd === 'roll' ? (comp.rollT > 0 && near < 34) : (comp.poundT > 0 && near < 72 && b.surf > 0);
  if (b.shieldT <= 0 && opens) {
    b.shieldT = 2.6; b.stun = 0.7; b.inv = 0; Audio2.jingle('cage'); Particles.burst(b.x, b.y, 'sparkle');
    Game.banner('GNASH staggers — hit him with your ' + ['BONE', 'HARPOON', 'BONE'][b.phase - 1] + ' (Z)!');
  }
  const tool = ['bone', 'harpoon', 'bone'][b.phase - 1];
  if (b.shieldT > 0 && b.inv <= 0 && this.toolHits(b, tool)) {
    b.hits++; b.inv = 0.7; Audio2.jingle('capture'); Particles.burst(b.x, b.y - 14, 'confetti');
    if (b.hits >= 3) {
      if (b.phase >= 3) { this.catchBoss(b); return; }
      b.phase++; b.hits = 0; b.shieldT = 0; b.surf = 0; b.surfT = 1.4;
      Game.banner('GNASH reels into PHASE ' + b.phase + '! ' + ['', 'He hurls crystal BOULDERS — ROLL-CHARGE (C) to stagger him!', 'He summons MOLE-MINIONS — GROUND-POUND (C) them all!'][b.phase - 1]);
      return;
    }
    Game.banner('HIT GNASH! Phase ' + b.phase + ' (' + b.hits + '/3)');
  }
  if (Player.inv <= 0 && b.stun <= 0 && !(comp.decoyT > 0) && b.surf > 0 && dist(p.x, p.y, b.x, b.y) < 16) Player.hurt(2);
};
Bosses.drawGnash = function (c, b) {
  const ov = Sprites.gnash, set = Sprites.creatures[(b.cfg && b.cfg.sprite) || 'dragon'];
  const spr = ov || (Player.x > b.x ? set.right : set.left)[(b.t * 3 | 0) % 2];
  const sc = ov ? 1.9 : 3.0;
  c.save();
  if (b.stun > 0) c.rotate(Math.sin(b.t * 12) * 0.08);
  if (b.phase === 1 && !b.surf) c.globalAlpha = 0.4;
  if (ov && Player.x < b.x) c.scale(-sc, sc); else c.scale(sc, sc);
  dspr(c, spr, -sprW(spr) / 2, -sprH(spr));
  c.restore();
  const cy = -sprH(spr) * sc - 2;                                   // a little crown
  c.fillStyle = '#f8d048'; c.beginPath(); c.moveTo(-11, cy); c.lineTo(-11, cy - 8); c.lineTo(-6, cy - 3); c.lineTo(-1, cy - 10); c.lineTo(4, cy - 3); c.lineTo(9, cy - 10); c.lineTo(11, cy - 3); c.lineTo(11, cy); c.fill();
  c.fillStyle = '#e84a4a'; c.fillRect(-1, cy - 5, 2, 2);
  c.save(); c.globalAlpha = 0.5; c.fillStyle = 'rgba(120,80,160,.3)'; c.beginPath(); c.arc(0, -sprH(spr) * sc / 2, sprW(spr) * sc * 0.55, 0, 7); c.fill(); c.restore();
  if (b.shieldT <= 0) { c.strokeStyle = 'rgba(180,140,220,' + (0.5 + 0.3 * Math.sin(b.t * 6)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(0, -sprH(spr) * sc / 2, sprW(spr) * sc * 0.6, 0, 7); c.stroke(); c.lineWidth = 1; }
  const top = -sprH(spr) * sc - 18;
  for (let k = 0; k < 3; k++) { c.fillStyle = k < (3 - b.hits) ? '#e84a4a' : '#3a2c50'; c.beginPath(); c.arc(-12 + k * 12, top, 4, 0, 7); c.fill(); c.strokeStyle = '#241a33'; c.stroke(); }
  drawText(c, 'PHASE ' + b.phase + '/3', 0, top - 16, 8, '#f8d048', '#241a33', 'center');
};
Bosses.finalizeGnash = function (b) {
  Game.flags.gnash = true; Game.flags.pillowkin = 4;
  Game.banner('GNASH FALLS! Every cage bursts — Ramsi\'s whole Pillow-Kin family is FREE!');
  const toCogwerk = function () {
    Game.loadMap('vale', 28, 19); Game.state = 'play';
    Game.banner('The Pillow-Kin are HOME! And listen — the great CLOCKWORK GATE east of the cottage is TICKING. COGWERK CITY needs a hero next!');
    Audio2.playSong('vale'); saveGame();
  };
  if (Game.startCutscene && Game.PILLOWKIN_ENDING) Game.startCutscene(Game.PILLOWKIN_ENDING, toCogwerk);
  else toCogwerk();
};

// ----------------------------- the reunion ending cutscene -----------------------------
function drawKinReunion(c, t) {
  const cx = SW / 2, cy = SH / 2 - 4;
  const scene = Sprites.scenes && Sprites.scenes.kinreunion;
  if (scene) { const h = SH * 0.62, w = sprW(scene) * h / sprH(scene), bob = Math.sin(t * 2) * 3; c.drawImage(scene, cx - w / 2, SH * 0.40 - h / 2 + bob, w, h); }
  else {
    const noah = Sprites.noah.down[0];
    c.save(); c.translate(cx - 74, cy + 22); c.scale(3, 3); dspr(c, noah, -sprW(noah) / 2, -sprH(noah)); c.restore();
    if (Sprites.ramsi) { c.save(); c.translate(cx - 20, cy + 28); c.scale(2.4, 2.4); dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi)); c.restore(); }
    const cols = ['#8ef0c0', '#f0c060', '#9ad0ff', '#f090b0'];
    cols.forEach((col, i) => {
      const kx = cx + 26 + (i % 2) * 32, ky = cy - 4 + (i >> 1) * 30 + Math.sin(t * 3 + i) * 3;
      const ksp = Sprites.npcs && Sprites.npcs['kin' + (i + 1)];
      c.save(); c.translate(kx, ky);
      if (ksp) { c.scale(1.9, 1.9); dspr(c, ksp, -sprW(ksp) / 2, -sprH(ksp) + 6); }
      else {
        c.fillStyle = '#241a33'; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill();
        c.fillStyle = col; c.beginPath(); c.arc(0, 0, 9, 0, 7); c.fill();
        c.fillStyle = col; c.beginPath(); c.arc(-5, -9, 3.6, 0, 7); c.arc(5, -9, 3.6, 0, 7); c.fill();
        c.fillStyle = '#241a33'; c.fillRect(-4, -3, 2, 2); c.fillRect(2, -3, 2, 2);
        c.strokeStyle = '#241a33'; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 1, 3, 0.15, 2.99); c.stroke(); c.lineWidth = 1;
      }
      c.restore();
    });
  }
  for (let i = 0; i < 26; i++) { c.fillStyle = ['#e84a4a', '#f8d048', '#58c452', '#4878e8', '#f898c8'][i % 5]; c.fillRect((hash2(i, 5) * SW + t * (30 + i)) % SW, (hash2(i, 11) * SH + t * 64) % SH, 3, 3); }
}
const PILLOWKIN_ENDING = [
  { title: 'THE HOLLOW KING FALLS', text: 'Gnash topples into his own hoard! Every cage springs open in a shower of soft light.', draw: drawKinReunion },
  { title: 'THE PILLOW-KIN', text: '"You came ALL the way down here... for US?" The plush family tumbles into Ramsi\'s arms.', draw: drawKinReunion },
  { title: 'RAMSI', text: 'Ramsi glows brighter than ever — every power awakened, his whole family safe at last.', draw: drawKinReunion },
  { title: 'HOME, TOGETHER', text: 'Noah, Ramsi and all four Pillow-Kin climb home to the sun. HERO OF THE UNDERBURROW!', draw: drawKinReunion },
];
Game.PILLOWKIN_ENDING = PILLOWKIN_ENDING;

// ----------------------------- Gnash's throne map -----------------------------
function buildGnashThrone() {
  if (MAPS.gnash_throne) return;
  const m = newMap('gnash_throne', 44, 22, 'soil', { name: "Gnash's Hoard", song: 'boss', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  m.start = { x: 3, y: 11 };
  for (const [x, y] of [[8, 3], [8, 18], [16, 2], [34, 2], [38, 4], [38, 17]]) T(m, x, y, 'glowvein');     // stolen lanterns
  for (const [x, y, h] of [[6, 1, 4], [6, 17, 4], [40, 8, 6]]) R(m, x, y, 1, h, 'rootwall');               // root-pillars
  SIGN(m, 4, 13, 'GNASH, THE HOLLOW KING, sprawled upon his hoard of stolen softness! THREE phases: POUND him up, ROLL his boulders back, then POUND his minions — BONE/HARPOON him each time (Z)!');
  // the caged Pillow-Kin family, looking on from behind the throne (freed on the win)
  for (let i = 0; i < 4; i++) OBJ(m, { type: 'pillowkin', x: 33 + i, y: 4, kin: 1 + i, caged: true, color: ['#8ef0c0', '#f0c060', '#9ad0ff', '#f090b0'][i], compOnly: true });
  OBJ(m, { type: 'boss', x: 26, y: 11, boss: 'gnash' });
  m.throne = true;
}
if (typeof G !== 'undefined' && G.NQ) { G.NQ.GNASH = GNASH; G.NQ.PILLOWKIN_ENDING = PILLOWKIN_ENDING; }

// ===================== ENTRY / UNLOCK + the intro cutscene =====================
function drawBurrowIntro(c, t) {
  const cx = SW / 2, cy = SH / 2;
  c.fillStyle = '#6b4a2c'; c.fillRect(0, cy + 18, SW, SH);                          // meadow surface
  c.fillStyle = '#1a0f06'; c.beginPath(); c.moveTo(cx - 90, cy + 18); c.lineTo(cx, cy + 96); c.lineTo(cx + 90, cy + 18); c.fill();   // the burrow crack
  const dy = Math.min(58, t * 26);
  const cols = ['#8ef0c0', '#f0c060', '#9ad0ff', '#f090b0'];
  cols.forEach((col, i) => {
    const ksp = Sprites.npcs && Sprites.npcs['kin' + (i + 1)];
    const kx = cx - 30 + i * 22, ky = cy + 12 + dy + Math.sin(t * 5 + i) * 2;
    if (ksp) { c.save(); c.translate(kx, ky); c.scale(1.3, 1.3); dspr(c, ksp, -sprW(ksp) / 2, -sprH(ksp)); c.restore(); }
    else { c.fillStyle = col; c.beginPath(); c.arc(kx, ky - 4, 6, 0, 7); c.fill(); }
  });
  const gn = Sprites.gnash;
  if (gn) { c.save(); c.translate(cx + 8, cy + 34 + dy); c.scale(2.4, 2.4); dspr(c, gn, -sprW(gn) / 2, -sprH(gn)); c.restore(); }
  else { c.fillStyle = '#241a33'; c.beginPath(); c.arc(cx + 8, cy + 34 + dy, 22, 0, 7); c.fill(); c.fillStyle = '#f8d048'; c.fillRect(cx, cy + 12 + dy, 16, 4); }
  const noah = Sprites.noah.down[0];
  c.save(); c.translate(cx - 118, cy + 6); c.scale(2.4, 2.4); dspr(c, noah, -sprW(noah) / 2, -sprH(noah)); c.restore();
  if (Sprites.ramsi) { c.save(); c.translate(cx - 88, cy + 10); c.scale(2, 2); dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi)); c.restore(); }
  for (let i = 0; i < 16; i++) { c.fillStyle = 'rgba(120,90,60,.7)'; c.fillRect((hash2(i, 4) * SW) | 0, (cy + 20 + (hash2(i, 9) * 40 + t * 30) % 60) | 0, 2, 2); }   // falling dirt
}
const UNDERBURROW_INTRO = [
  { title: 'THE GROUND RUMBLES', text: 'Home at last with Berkley & Megan — but the earth shakes, and a great BURROW tears open the meadow!', draw: drawBurrowIntro },
  { title: 'GNASH, THE HOLLOW KING', text: 'A mole-monarch drags a net of soft, squirming plushies down into the dark — RAMSI\'s family, the PILLOW-KIN!', draw: drawBurrowIntro },
  { title: 'INTO THE UNDERBURROW', text: 'Ramsi\'s eyes go wide. Down they dive — Noah and Ramsi plunge into the burrow to bring his whole family home.', draw: drawBurrowIntro },
];
Game.UNDERBURROW_INTRO = UNDERBURROW_INTRO;

// a burrow mouth opens in Greenwood Vale; it ACTIVATES once the parents are rescued (flags.parents)
Game.addBurrowEntrance = function () {
  const m = MAPS.vale; if (!m || m._burrowEntrance) return; m._burrowEntrance = true;
  OBJ(m, { type: 'portal', x: 24, y: 20, to: 'burrow5', tx: 3, ty: 11, req: 'parents', plain: true });   // plain: the burrow-mouth art draws the look
  OBJ(m, { type: 'burrowmouth', x: 24, y: 20, req: 'parents' });
  OBJ(m, { type: 'sign', x: 25, y: 18, text: 'A dark EARTHEN BURROW gapes in the meadow, sealed by rumbling soil. Rescue Berkley & Megan from the sky, and GNASH\'s UNDERBURROW will open here...' });
};
// ---- a distinct EARTHY, ROOTED burrow-mouth (so it never looks like the brass cog gate) ----
Game.OBJDRAW = Game.OBJDRAW || {};
Game.OBJDRAW.burrowmouth = function (c, o, ox, oy) {
  const t = Game.time, open = !o.req || Game.lookupFlag(o.req);
  const cx = ox + 8, cy = oy + 8;
  // a raised dirt MOUND ringing the hole
  c.fillStyle = '#6a4a2c'; c.beginPath(); c.ellipse(cx, cy + 6, 22, 11, 0, 0, 7); c.fill();
  c.fillStyle = '#7a5636'; c.beginPath(); c.ellipse(cx, cy + 4, 20, 9.5, 0, 0, 7); c.fill();
  // clumps of grass on the rim
  c.strokeStyle = '#4a7a30'; c.lineWidth = 1.5;
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI - 0.1, rx = cx + Math.cos(a) * 20, ry = cy + 6 - Math.sin(a) * 9; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 1, ry - 4); c.moveTo(rx, ry); c.lineTo(rx + 2, ry - 3); c.stroke(); }
  c.lineWidth = 1;
  // the dark hole itself
  c.fillStyle = '#1c120a'; c.beginPath(); c.ellipse(cx, cy + 3, 15, 8, 0, 0, 7); c.fill();
  c.fillStyle = '#0a0603'; c.beginPath(); c.ellipse(cx, cy + 4, 11.5, 5.5, 0, 0, 7); c.fill();
  // dangling ROOTS across the top of the hole
  c.strokeStyle = '#5a3c22'; c.lineWidth = 2;
  for (let k = 0; k < 5; k++) { const rx = cx - 12 + k * 6, sway = Math.sin(t * 1.2 + k) * 1.5; c.beginPath(); c.moveTo(rx, cy - 3); c.quadraticCurveTo(rx + sway, cy + 1, rx + sway * 1.4, cy + 4 + (k % 2) * 2); c.stroke(); }
  c.lineWidth = 1;
  // pebbles
  c.fillStyle = '#8a6a48'; for (const [dx, dy] of [[-18, 8], [16, 9], [-8, 12], [11, 11]]) c.fillRect(cx + dx, cy + dy, 2, 2);
  if (open) {
    // a faint warm glow + rising dust motes from the depths (it's ALIVE down there)
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(120,90,50,' + (0.10 + 0.05 * Math.sin(t * 2)).toFixed(2) + ')'; c.beginPath(); c.ellipse(cx, cy + 3, 12, 6, 0, 0, 7); c.fill(); c.restore();
    for (let k = 0; k < 3; k++) { const my = cy + 2 - ((t * 8 + k * 7) % 18); c.fillStyle = 'rgba(180,150,110,' + (0.4 - ((t * 8 + k * 7) % 18) / 45).toFixed(2) + ')'; c.fillRect(cx - 6 + Math.sin(t + k) * 6, my, 1, 1); }
    // two tiny eyeshine glints deep in the dark
    if (((t * 1.5 | 0) % 4) < 2) { c.fillStyle = '#f8e858'; c.fillRect(cx - 4, cy + 3, 1.5, 1.5); c.fillRect(cx + 3, cy + 3, 1.5, 1.5); }
  } else {
    // sealed: cracked rubble plugging the hole
    c.fillStyle = '#5a4632'; c.beginPath(); c.ellipse(cx, cy + 3, 13, 7, 0, 0, 7); c.fill();
    c.strokeStyle = '#3a2c1c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - 8, cy); c.lineTo(cx - 2, cy + 5); c.lineTo(cx + 6, cy + 1); c.stroke(); c.lineWidth = 1;
  }
  if (dist(Player.x, Player.y, cx, cy) < 30) drawText(c, open ? 'THE UNDERBURROW' : 'sealed by earth', cx, oy - 14, 6, open ? '#c8a060' : '#8a6a48', '#241a33', 'center');
};
if (typeof G !== 'undefined' && G.NQ) { G.NQ.UNDERBURROW_INTRO = UNDERBURROW_INTRO; }
