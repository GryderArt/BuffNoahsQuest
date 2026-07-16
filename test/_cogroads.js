// COGWERK ROADS v2: expanded factory set-pieces (belts/crushers/vents/spark-bobs), the
// five-flap wing meter, and three BESPOKE boss fights with real vulnerability windows.
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
const SS = NQ.SideScroll;
const pin = (S, x, y) => { Player.hearts = Player.maxHearts; S.p.inv = 9; if (x != null) { S.p.x = x; S.p.y = y; S.p.vx = 0; S.p.vy = 0; } };
const toArena = (S) => { S.p.x = (S.bossHome ? 0 : 0) || (S.def.w - 12) * 16; S.p.y = SS.groundYAt(S, S.p.x) - 1; };

H.startPlay(); Game.enterSlot('city');
H.assert(Game.mapId === 'cog1', 'city quick-start lands in cog1');

// ---- the roads got BIGGER: real set-piece budgets ----
H.assert(NQ.ROAD_LEVELS.gearline.w >= 180 && NQ.ROAD_LEVELS.steamway.w >= 150 && NQ.ROAD_LEVELS.skyrail.w >= 135,
  'all three roads roughly doubled in length');

// open the world-3 map and pick The Pipeworks: Noah WALKS, and the GEAR-LINE ambushes him halfway
Game.state = 'world3map'; Game.world3Cursor = 1;
Game.flags.starcells = { sc_cog1: 1, sc_lady: 1, sc_cog3: 1 };
NQ.press(' '); H.step(1);
H.assert(Game.world3Travel && Game.state === 'world3map', 'picking a node starts a WALK (no teleporting)');
const walk0 = { x: Game.world3Travel.x, y: Game.world3Travel.y };
for (let i = 0; i < 30 && Game.state === 'world3map'; i++) H.step(1);
H.assert(Game.state === 'world3map' ? (Game.world3Travel && (Game.world3Travel.x !== walk0.x || Game.world3Travel.y !== walk0.y)) : true, 'Noah moves along the trail');
for (let i = 0; i < 600 && Game.state !== 'side'; i++) H.step(1);
H.assert(Game.state === 'side' && SS.active && SS.active.id === 'gearline', 'halfway along the leg, THE GEAR-LINE ambushes');
{
  const S = SS.active;
  H.assert(S.crushers.length === 4 && S.vents.length === 4 && S.flagCols.length === 2, 'gear-line: 4 crushers, 4 steam vents, 2 checkpoints');
  H.assert(S.def.rows[12].includes('>') && S.def.rows[12].includes('<'), 'gear-line: belts run BOTH ways');

  // conveyor carries Noah
  pin(S, 20 * 16 + 8, SS.groundYAt(S, 20 * 16 + 8) - 1);
  const cx0 = S.p.x; for (let i = 0; i < 30; i++) { pin(S); H.step(1); }
  H.assert(S.p.x > cx0 + 8, 'a > belt carries Noah along');

  // ---- WING METER: five flaps, then denied; landing refills; empty wings still glide ----
  Game.flags.wings = 1;
  pin(S, 24, 60); S.p.onG = false; S.p.coyote = -1;
  let flapped = 0;
  for (let k = 0; k < 8; k++) {
    const f0 = S.p.flaps; S.p.vy = 50; S.p.coyote = -1;
    NQ.press('x'); H.step(1);
    if (S.p.flaps === f0 - 1) flapped++;
    S.p.y = 60;                                        // hold him mid-air between flaps
  }
  H.assert(flapped === 5 && S.p.flaps === 0, 'exactly FIVE flaps per flight (got ' + flapped + ')');
  const vyDenied = (() => { S.p.vy = 50; NQ.press('x'); H.step(1); return S.p.vy; })();
  H.assert(vyDenied > -150, 'the sixth flap is denied');
  H.hold('x', true); S.p.y = 60; S.p.vy = 320;
  for (let i = 0; i < 4; i++) { pin(S); S.p.y = 60; S.p.onG = false; H.step(1); }
  H.assert(S.p.vy <= 71 && S.p.glide, 'out of feathers he GLIDES down like a bird (vy=' + Math.round(S.p.vy) + ')');
  H.hold('x', false);
  pin(S, 24, 0);
  for (let i = 0; i < 60 && !S.p.onG; i++) H.step(1);
  H.assert(S.p.flaps === 5, 'touching the ground refills all five feathers');

  // ---- PISTON PETE: armored head, slam-waves, a STUCK-fist bop window ----
  toArena(S);
  for (let i = 0; i < 40 && !S.boss; i++) { pin(S); H.step(1); }
  H.assert(S.boss && S.boss.kind === 'pistonpete', 'PISTON PETE spawns in the arena');
  const b = S.boss;
  for (let i = 0; i < 200 && b.state !== 'act'; i++) { pin(S, b.x - 90, SS.groundYAt(S, b.x - 90) - 1); H.step(1); }
  // stomping the ARMORED head clangs off: no damage either way (fist not stuck yet)
  const hp0 = b.hp;
  let bounced = false;
  for (let i = 0; i < 18 && !bounced; i++) {
    pin(S, b.x, b.y - 20); S.p.vy = 220; H.step(1);
    if (S.p.vy < -100) bounced = true;
  }
  H.assert(bounced && b.hp === hp0 && b.stun <= 0, 'armored head: the stomp CLANGS off (no damage, big bounce)');
  for (let i = 0; i < 240; i++) { pin(S, b.x - 90, SS.groundYAt(S, b.x - 90) - 1); H.step(1); }
  H.assert((b.slams || 0) >= 1, 'he slams and strides — a real fight, not a statue');
  // wait for the fist to STICK, then bop
  for (let i = 0; i < 1200 && b.stun <= 0; i++) { pin(S, b.x - 90, SS.groundYAt(S, b.x - 90) - 1); H.step(1); }
  H.assert(b.stun > 0 && b.stuck, 'every third slam his fist gets STUCK');
  for (let i = 0; i < 60 && S.boss && S.boss.hp === hp0; i++) { pin(S, b.x, b.y - 20); S.p.vy = 220; H.step(1); }
  H.assert(S.boss && S.boss.hp === hp0 - 1, 'bopping the stuck-fist window lands a hit');
  H.assert(SS.BOSS_HINT.pistonpete(S, b).length <= 24, 'pinned hint stays kid-short');
}
// win it -> Noah RESUMES the walk from the ambush spot, then arrives
SS.finish(true);
H.assert(Game.state === 'world3map' && Game.world3Travel, 'a win puts Noah back on the trail mid-walk');
H.assert(Game.flags.road_gearline, 'the Gear-Line stays open');
for (let i = 0; i < 600 && Game.state !== 'play'; i++) H.step(1);
H.assert(Game.state === 'play' && Game.mapId === 'cog2', 'finishing the walk lands you in the Pipeworks');

// second trip: the whole walk, no interruption
Game.loadMap('cog1'); Game.state = 'world3map'; Game.world3Cursor = 1;
NQ.press(' '); H.step(1);
let sawSide = false;
for (let i = 0; i < 800 && Game.state !== 'play'; i++) { if (Game.state === 'side') sawSide = true; H.step(1); }
H.assert(Game.state === 'play' && Game.mapId === 'cog2' && !sawSide, 'a cleared route walks straight through');

// ---- GASKETTA: ceiling-crawler; steam-rain; overheats and FALLS ----
Game.state = 'world3map'; Game.world3Cursor = 2;
NQ.press(' '); H.step(1);
for (let i = 0; i < 600 && Game.state !== 'side'; i++) H.step(1);
H.assert(Game.state === 'side' && SS.active.id === 'steamway', 'cog2 -> cog3: THE STEAMWAY ambushes mid-walk');
{
  const S = SS.active;
  H.assert(S.vents.length === 5 && S.crushers.length === 2 && S.bobs.length === 2, 'steamway: 5 vents, 2 pipe-presses, 2 spark-bobs');
  toArena(S);
  for (let i = 0; i < 40 && !S.boss; i++) { pin(S); H.step(1); }
  H.assert(S.boss && S.boss.kind === 'gasketta', 'GASKETTA spawns');
  const b = S.boss, floorY = SS.groundYAt(S, b.x);
  H.assert(floorY > 100, 'arena ground is the FLOOR, not the pipe-ceiling (gy=' + floorY + ')');
  let sawRain = false, minY = 999;
  const px = (S.bossHome[0] - 5) * 16;
  for (let i = 0; i < 1400 && b.stun <= 0; i++) {
    pin(S, px, SS.groundYAt(S, px) - 1);
    H.step(1);
    if (b.ph === 'rain') sawRain = true;
    minY = Math.min(minY, b.y);
  }
  H.assert(minY < 80, 'she really hangs from the pipe-ceiling (minY=' + Math.round(minY) + ')');
  H.assert(sawRain, 'she pours telegraphed steam-rain');
  H.assert(b.stun > 0 && b.ph === 'floor', 'after two rains she OVERHEATS and falls — the bop window');
  const hp0 = b.hp;
  for (let i = 0; i < 60 && S.boss && S.boss.hp === hp0; i++) { pin(S, b.x, b.y - 20); S.p.vy = 220; H.step(1); }
  H.assert(S.boss && S.boss.hp === hp0 - 1, 'bopping her on the floor lands a hit');
}
SS.finish(false);
H.assert(Game.state === 'world3map' && !Game.flags.road_steamway && !Game.world3Travel, 'retreat: back to the map at your old stop, walk cancelled, route still closed');

// ---- THE RAIL KING: spark showers, the magnet crown, derail windows ----
SS.start('skyrail');
{
  const S = SS.active;
  H.assert(S.bobs.length === 4, 'sky-rail: 4 spark-bobs guard the void');
  // no dragon caught yet? the Rail-Guild lends BRASS wings for this road only
  const hadWings = Game.flags.wings; Game.flags.wings = 0;
  pin(S, 40, 60); S.p.onG = false; S.p.coyote = -1; S.p.vy = 50; S.p.flaps = 5;
  NQ.press('x'); H.step(1);
  H.assert(S.def.wings === 1 && S.p.flaps === 4, 'loaner wings: flaps work on the Sky-Rail even wingless');
  Game.flags.wings = hadWings;
  toArena(S);
  for (let i = 0; i < 40 && !S.boss; i++) { pin(S); H.step(1); }
  H.assert(S.boss && S.boss.kind === 'railking', 'THE RAIL KING spawns');
  const b = S.boss, gy = SS.groundYAt(S, b.x);
  let sawMagnet = false, sawSparks = false, x0 = b.x, moved = 0;
  for (let i = 0; i < 1500 && b.stun <= 0; i++) {
    pin(S, (S.bossHome[0] - 12) * 16, gy - 1);
    H.step(1);
    if (b.ph === 'magnet') sawMagnet = true;
    if ((b.shots || []).length) sawSparks = true;
    moved = Math.max(moved, Math.abs(b.x - x0));
  }
  H.assert(moved > 60, 'he SURFS the arena (moved ' + Math.round(moved) + 'px)');
  H.assert(sawSparks, 'sparks fly off the cart');
  H.assert(sawMagnet, 'his magnet crown drags Noah');
  H.assert(b.stun > 0 && b.derail, 'every second pull the cart DERAILS — the bop window');
  const hp0 = b.hp;
  for (let i = 0; i < 60 && S.boss && S.boss.hp === hp0; i++) { pin(S, b.x, b.y - 20); S.p.vy = 220; H.step(1); }
  H.assert(S.boss && S.boss.hp === hp0 - 1, 'bopping the tipped cart lands a hit');
}
SS.finish(false);

// playtest mode pre-clears all three
Game.state = 'title'; H.press('t');
H.assert(Game.flags.road_gearline && Game.flags.road_steamway && Game.flags.road_skyrail, 'playtest pre-clears the cog roads');
console.log('COGROADS PASS — big set-piece roads, a real wing meter, and three bespoke boss fights with windows');
