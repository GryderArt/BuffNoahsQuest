const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player } = NQ;
const save = (n) => { Game.banners = []; Game.toasts = []; H.render(); fs.writeFileSync(__dirname + '/../shots/b5_' + n + '.png', H.canvas.toBuffer('image/png')); };
function applyTool(tool, b) {
  if (tool === 'mitts') { Player.x = b.x; Player.y = b.y; Player.dir = 'right'; Player.lungeT = 0.2; }
  else if (tool === 'net') { Player.x = b.x; Player.y = b.y; Player.netT = 0.2; }
  else if (tool === 'harpoon') Player.harpoon = { x: b.x, y: b.y, vx: 0, vy: 0, dist: 0, max: 300, state: 'out' };
  else if (tool === 'bone') Player.bone = { x: b.x, y: b.y, vx: 0, vy: 0, t: 0.1 };
}
function beatWarden(name, tool) {
  let broke = false;
  for (let i = 0; i < 1500 && Game.boss; i++) {
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
  net: true, harpoon: true, bone: true, suit: true, gloves: true, bracers: true, mitts: true });
Game.loadMap('burrow5'); Game.state = 'play'; H.place(5, 11); H.step(3);
save('1_intro');                                                  // dark intro + Old Mole

// free Pillow-Kin #1 -> Glow + Shrink
H.place(11, 7); H.face('up'); Game.interact();
H.assert(Game.flags.ramGlow && Game.flags.ramShrink, 'Kin #1 grants Glow + Shrink');
H.assert(Game.flags.pillowkin === 1, 'pillowkin count = 1');
H.place(11, 10); H.step(3); save('2_glow');                      // lit cavern

// shrink gate 1
H.place(13, 10); H.step(40); Game.ramsiCommand();
H.assert(Game.flags.b5_g1 && Game.doorIsOpen(Game.map, 15, 11), 'SHRINK opens gate 1');
// secret heart-piece
H.place(22, 7); H.step(40); Game.ramsiCommand();
H.assert(Game.flags.b5_secret && Game.doorIsOpen(Game.map, 25, 5), 'SHRINK opens the secret');
const hp0 = Game.flags.heartpieces;
H.place(26, 4); H.face('up'); Game.interact();
H.assert(Game.flags.heartpieces === hp0 + 1, 'grabbed the secret HEART-PIECE');
// shrink gate 2
H.place(28, 14); H.step(40); Game.ramsiCommand();
H.assert(Game.flags.b5_g2 && Game.doorIsOpen(Game.map, 30, 11), 'SHRINK opens gate 2');

// MOTTLE
H.place(36, 11); H.step(2);
H.assert(Game.boss && Game.boss.name === 'mottle', 'Mottle spawned');
Game.companion.x = Game.boss.x; Game.companion.y = Game.boss.y; H.render(); save('3_mottle');
beatWarden('mottle', 'mitts');
H.assert(Game.doorIsOpen(Game.map, 45, 11), 'beating Mottle opens the elevator gate');
H.place(50, 11); H.step(2); save('4_exit');
console.log('BURROW5 OK — Kin freed, shrink puzzles solved, Mottle beaten');
