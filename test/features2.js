const H = require('./harness');
const { NQ } = H;
const { Game, Player, MAPS } = NQ;
const T = 16;
H.startPlay();

console.log('== warp pads gated on catching every alien ==');
Game.loadMap('wastes'); H.releaseAll();
Game.flags.life_alien = 0; Player.lastWarpTile = null;
Player.x = 17 * T + 8; Player.y = 7 * T + 12; H.step(2);
H.assert(Math.floor(Player.x / T) === 17, 'warp pad is DEAD before every alien is caught');
Game.flags.life_alien = 4; Player.lastWarpTile = null;
Player.x = 17 * T + 8; Player.y = 7 * T + 12; H.step(2);
H.assert(Math.floor(Player.x / T) === 26, 'warp pad fires once all aliens are caught (just by standing on it)');

console.log('== Astral Portal -> the void dungeon ==');
Game.loadMap('wastes'); H.releaseAll();
Player.x = 13 * T + 8; Player.y = 13 * T + 12; H.step(2);
H.assert(Game.mapId === 'void', 'stepping on the Astral Portal warps to the Astral Drift');

console.log('== moving asteroids carry & the void drops you ==');
const m = MAPS.void;
H.assert(m.asteroids && m.asteroids.length >= 2, 'the drift has moving asteroids');
Game.loadMap('void'); H.releaseAll();
const a = m.asteroids[0];
Player.x = a.x + a.w * T / 2; Player.y = a.y + a.h * T / 2; Player.airborne = false; Player.inv = 0;
Player.lastSafe = [Player.x, Player.y];
const x0 = Player.x;
for (let i = 0; i < 60; i++) H.step(1);
H.assert(Math.abs(Player.x - x0) > 8, 'a moving asteroid carries Noah along (dx=' + (Player.x - x0).toFixed(0) + ')');
Player.lastSafe = [4 * T + 8, 10 * T + 12]; Player.inv = 0; Player.hearts = Player.maxHearts;
Player.x = 11 * T + 8; Player.y = 5 * T + 12; Player.airborne = false;
H.step(2);
H.assert(Math.floor(Player.x / T) === 4, 'stepping into the void drops Noah back onto solid rock');

console.log('== boomer-bone knocks the dive gate open ==');
Game.loadMap('coast'); H.releaseAll();
const dr = Game.map.doors['24,30'];
H.assert(dr && dr.kind === 'bone', 'the dive lagoon is barred by a BONE-LATCH');
H.assert(!Game.doorIsOpen(Game.map, 24, 30), 'the dive gate starts shut');
Game.flags.bone = true; Player.tool = 'bone'; Player.bone = null;
Player.x = 24 * T + 8; Player.y = 28 * T + 12; H.face('down'); Player.useTool();
for (let i = 0; i < 40 && !Game.doorIsOpen(Game.map, 24, 30); i++) H.step(1);
H.assert(Game.doorIsOpen(Game.map, 24, 30), 'the boomer-bone knocks the BONE-LATCH open');

console.log('== boomer-bone stuns a few extra seconds ==');
Game.loadMap('vale'); H.releaseAll();
H.place(20, 14);
const cr = Game.creatures.find(cc => cc.species === 'sheep' && cc.state !== 'gone') || Game.creatures.find(cc => cc.state === 'wander');
cr.vx = 0; cr.vy = 0; cr.wanderT = 999; cr.state = 'wander'; cr.stun = 0; cr.x = Player.x + 16; cr.y = Player.y;
H.face('right'); Player.tool = 'bone'; Player.bone = null; Player.useTool();
for (let i = 0; i < 40 && cr.stun <= 0; i++) { cr.x = Player.x + 16; cr.y = Player.y; H.step(1); }
H.assert(cr.stun > 5, 'boomer-bone stun lasts a few extra seconds (stun=' + cr.stun.toFixed(1) + ')');

console.log('== boomer-bone flips an out-of-reach lever ==');
Game.loadMap('void'); H.releaseAll();
Game.flags.driftVault = false; Game.flags.bone = true; Player.bone = null; Player.tool = 'bone';
Player.x = 36 * T + 8; Player.y = 8 * T + 12; Player.airborne = false; Player.lastSafe = [Player.x, Player.y];
H.face('up'); Player.useTool();
for (let i = 0; i < 40 && !Game.flags.driftVault; i++) H.step(1);
H.assert(Game.flags.driftVault, 'boomer-bone flips the far lever -> Stardust Vault unsealed');

console.log('== flags never respawn you in spikes ==');
for (const lvl of ['bramble', 'squall', 'meteor']) {
  NQ.SideScroll.start(lvl, false);
  const S = NQ.SideScroll.active;
  for (const fi of S.flagCols) {
    const cp = NQ.SideScroll.safeSpot(S, fi);
    const col = Math.floor(cp[0] / 16);
    let gj = -1; for (let j = 0; j < 14; j++) if ('#=B'.includes(NQ.SideScroll.tile(S, col, j))) { gj = j; break; }
    const spiky = gj > 0 && (NQ.SideScroll.tile(S, col, gj - 1) === '^' || NQ.SideScroll.tile(S, col, gj - 2) === '^');
    H.assert(gj > 0 && !spiky, lvl + ': flag @col ' + fi + ' -> spike-free checkpoint (col ' + col + ')');
  }
  NQ.SideScroll.active = null; NQ.Game.state = 'play';
}

console.log('== Cerberus reels (pauses) after a head-grab ==');
Game.flags.cerberus = false; Game.loadMap('keep3');
const cb = Game.boss;
H.assert(cb && cb.name === 'cerberus', 'Cerberus present in the den');
cb.awake = true; cb.stun = 2; cb.state = 'drowsy'; cb.heads = 3;
Player.x = cb.x - 16; Player.y = cb.y; Player.lungeT = 0.25; H.face('right'); Player.inv = 0;
H.step(1);
H.assert(cb.heads === 2 && cb.state === 'pause', 'grabbing a head -> Cerberus enters a reeling pause');
const bx = cb.x, by = cb.y, hp0 = Player.hearts; Player.x = cb.x + 120;
let moved = 0, hurt = false, frames = 0;
for (let i = 0; i < 300; i++) { Player.inv = 0; H.step(1); if (cb.state !== 'pause') break; frames++; if (Player.hearts < hp0) hurt = true; moved = Math.max(moved, Math.abs(cb.x - bx) + Math.abs(cb.y - by)); }
H.assert(frames > 120, 'the pause lasts a few seconds (' + (frames / 60).toFixed(1) + 's getaway)');
H.assert(!hurt && moved < 2, 'Cerberus stays put & harmless during the pause');
H.assert(cb.state !== 'pause', 'then the zoomies resume');

console.log('== wings flap in side-scrollers ==');
NQ.SideScroll.start('bramble', false); let SW = NQ.SideScroll.active;
Game.flags.wings = true;
SW.p.x = 6 * 16; SW.p.y = 5 * 16; SW.p.vy = 120; SW.p.onG = false; SW.p.jbuf = 0; SW.p.coyote = 0;
NQ.press('x'); H.step(1);
H.assert(SW.p.vy < 0, 'mid-air flap with wings lifts Noah (vy=' + SW.p.vy.toFixed(0) + ')');
Game.flags.wings = false;
SW.p.y = 5 * 16; SW.p.vy = 120; SW.p.onG = false; SW.p.jbuf = 0; SW.p.coyote = 0;
NQ.press('x'); H.step(1);
H.assert(SW.p.vy > 0, 'without wings, a mid-air tap does nothing');
NQ.SideScroll.active = null; Game.state = 'play';

console.log('== hopper bunnies land on real ground (not on air) ==');
NQ.SideScroll.start('bramble', false); const SH2 = NQ.SideScroll.active;
const hop = SH2.enemies.find(e => e.kind === 'h');
H.assert(!!hop, 'a hopper exists in the bramble road');
hop.x = 10 * 16 + 8; hop.y = 3 * 16; hop.vy = 0; hop.vx = 0; hop.t = 0;
hop.homeY = 5 * 16;                                  // the OLD bug would land it floating here
let landY = null;
for (let i = 0; i < 90 && landY === null; i++) { H.step(1); if (hop.vy === 0 && hop.y > 3 * 16) landY = hop.y; }
const gy = NQ.SideScroll.groundYAt(SH2, hop.x);
H.assert(landY !== null && Math.abs(landY - gy) < 1, 'hopper lands flush on the ground (' + landY + '), not its old homeY (' + hop.homeY + ')');
NQ.SideScroll.active = null; Game.state = 'play';

console.log('FEATURES2 PASS — asteroids, warp gate, portal, bone gate & stun verified');
