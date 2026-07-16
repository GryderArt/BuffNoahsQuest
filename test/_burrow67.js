const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player, TILEDEFS, tileAt } = NQ;
const save = (n) => { Game.banners = []; Game.toasts = []; H.render(); fs.writeFileSync(__dirname + '/../shots/b67_' + n + '.png', H.canvas.toBuffer('image/png')); };
function applyTool(tool, b) {
  if (tool === 'mitts') { Player.x = b.x; Player.y = b.y; Player.dir = 'right'; Player.lungeT = 0.2; }
  else if (tool === 'net') { Player.x = b.x; Player.y = b.y; Player.netT = 0.2; }
  else if (tool === 'harpoon') Player.harpoon = { x: b.x, y: b.y, vx: 0, vy: 0, dist: 0, max: 300, state: 'out' };
  else if (tool === 'bone') Player.bone = { x: b.x, y: b.y, vx: 0, vy: 0, t: 0.1 };
}
function beatWarden(name, tool) {
  let broke = false;
  for (let i = 0; i < 1600 && Game.boss; i++) {
    const b = Game.boss; Player.hearts = Player.maxHearts;
    Player.x = b.x - 10; Player.y = b.y; Player.dir = 'right';
    Game.companion.x = b.x; Game.companion.y = b.y + 4;
    if (b.cfg && b.cfg.cmd === 'pound') b.surf = 1;
    if (!b.awake) { H.step(1); continue; }
    if (b.shieldT > 0) { broke = true; b.inv = 0; applyTool(tool, b); }
    else if (!(Game.companion.busyT > 0)) Game.ramsiCommand();
    H.step(1);
  }
  H.assert(broke, name + ': Ramsi opened the window (co-op)');
  H.assert(Game.flags[name], name + ' CAUGHT');
}
H.startPlay();
Object.assign(Game.flags, { ramsi: true, world2: true, ramsuit: true, sandals: true, wings: true,
  net: true, harpoon: true, bone: true, suit: true, gloves: true, bracers: true, mitts: true,
  ramGlow: true, ramShrink: true });   // already learned in L5

// ============ LEVEL 6 — ROOT HOLLOWS ============
Game.loadMap('burrow6'); Game.state = 'play'; H.place(4, 18); H.step(3); save('6_1_entry');
H.place(8, 19); H.face('up'); Game.interact();
H.assert(Game.flags.ramBounce && Game.flags.ramDecoy, 'Kin #2 grants Bounce + Decoy');
// BOUNCE over the root-shelf
H.place(13, 18); H.step(20);
H.assert(Game.tryBounce() === true, 'on the mushroom, X bounces');
H.step(50);
H.assert(Player.x / 16 > 15.5, 'BOUNCE cleared the root-shelf (x>15.5)');
// SHRINK secret
H.place(21, 9); H.step(40); Game.ramsiCommand();
H.assert(Game.flags.b6_secret, 'SHRINK opens the sap-pocket secret');
// THORNBACK
H.place(36, 12); H.step(2);
H.assert(Game.boss && Game.boss.name === 'thornback', 'Thornback spawned');
Game.companion.x = Game.boss.x; Game.companion.y = Game.boss.y; save('6_2_thornback');
beatWarden('thornback', 'net');
H.assert(Game.doorIsOpen(Game.map, 47, 12), 'beating Thornback opens the gate');

// ============ LEVEL 7 — CRYSTAL DEEP ============
Game.loadMap('burrow7'); Game.state = 'play'; H.place(4, 18); H.step(3); save('7_1_entry');
H.place(7, 19); H.face('up'); Game.interact();
H.assert(Game.flags.ramGlide && Game.flags.ramRoll, 'Kin #3 grants Glide + Roll');
// GLIDE across the star-chasm
H.place(12, 18); H.step(20); Game.ramsiCommand();
H.assert(!!Player.gArc && Player.gArc.kind === 'glide', 'C at the updraft starts a glide');
H.step(75);
H.assert(Player.x / 16 > 16.5, 'GLIDE crossed the star-chasm (x>16.5)');
// ROLL through the crystal soft-block wall
H.place(20, 18); H.face('right'); H.step(20);
H.assert((TILEDEFS[tileAt(Game.map, 22, 18)] || {}).soft === true, 'soft-block wall present');
Game.ramsiCommand(); H.step(40);
H.assert(!(TILEDEFS[tileAt(Game.map, 22, 18)] || {}).soft, 'ROLL-CHARGE smashed the crystal wall');
// GEODE GOLEM
H.place(36, 12); H.step(2);
H.assert(Game.boss && Game.boss.name === 'geode', 'Geode Golem spawned');
Game.companion.x = Game.boss.x; Game.companion.y = Game.boss.y; save('7_2_geode');
beatWarden('geode', 'harpoon');
H.assert(Game.doorIsOpen(Game.map, 47, 12), 'beating Geode opens the shaft gate');
console.log('BURROW 6 & 7 OK — Bounce, Decoy, Glide, Roll + Thornback & Geode all verified');
