const H = require('./harness'); const fs = require('fs'); const { NQ } = H;
const { Game, Player, TILEDEFS, tileAt } = NQ;
const save = (n) => { Game.banners = []; Game.toasts = []; H.render(); fs.writeFileSync(__dirname + '/../shots/b5n_' + n + '.png', H.canvas.toBuffer('image/png')); };
function applyTool(tool, b) {
  if (tool === 'mitts') { Player.x = b.x; Player.y = b.y; Player.dir = 'right'; Player.lungeT = 0.2; }
  else if (tool === 'net') { Player.x = b.x; Player.y = b.y; Player.netT = 0.2; }
  else if (tool === 'harpoon') Player.harpoon = { x: b.x, y: b.y, vx: 0, vy: 0, dist: 0, max: 300, state: 'out' };
  else if (tool === 'bone') Player.bone = { x: b.x, y: b.y, vx: 0, vy: 0, t: 0.1 };
}
function beatWarden(tool) {                 // NEW headbutt co-op: bring Ramsi in, she breaks the guard, Noah hits
  let broke = false;
  for (let i = 0; i < 1500 && Game.boss; i++) {
    const b = Game.boss; Player.hearts = Player.maxHearts;
    Player.x = b.x - 10; Player.y = b.y; Player.dir = 'right';
    Game.companion.x = b.x; Game.companion.y = b.y;     // nudge Ramsi onto him -> auto headbutt
    if (b.awake && b.shieldT > 0) { broke = true; b.inv = 0; applyTool(tool, b); }
    H.step(1);
  }
  return broke;
}
function grabMove(block, faceDir, key, tx, ty) {
  H.face(faceDir); NQ.hold(' ', true); H.step(3);
  H.assert(Player.grab === block, 'grabbed the block');
  H.hold(key, true); let g = 0;
  while ((block.x !== tx || block.y !== ty) && g++ < 400) H.step(2);
  H.hold(key, false); H.step(16); NQ.hold(' ', false); H.step(4);
  H.assert(block.x === tx && block.y === ty, 'block parked at (' + tx + ',' + ty + ')');
}

H.startPlay();
Object.assign(Game.flags, { ramsi: true, world2: true, ramHead: true, ramStun: true, ramShield: true, ramBoost: true,
  ramsuit: true, sandals: true, gloves: true, bracers: true, suit: true, wings: true,
  net: true, harpoon: true, bone: true, cage: true });
Game.flags.baits = { clover: 9, tincan: 9, fishsnack: 9, cookie: 9, berry: 9 };
Game.loadMap('burrow5'); Game.state = 'play'; H.place(8, 10); H.step(3); save('1_meadow');

// ---- catching is the main goal: round up a sheep and a goat ----
const herd = {}; for (const cr of Game.creatures) herd[cr.species] = (herd[cr.species] || 0) + 1;
H.assert(herd.sheep >= 3 && herd.goat >= 2 && herd.snowhare >= 1, 'open meadows are stocked with herds: ' + JSON.stringify(herd));
function catchOne(species, method) {
  const c = Game.creatures.find(cc => cc.species === species && cc.state !== 'gone');
  c.vx = c.vy = 0; c.wanderT = 999; c.x = Player.x + 18; c.y = Player.y; H.face('right');
  Player.tool = method; Player.useTool(); H.step(25);
  H.assert(c.state === 'gone', 'caught a ' + species + ' with ' + method);
}
H.place(10, 8); catchOne('sheep', 'net');
H.place(14, 28); catchOne('goat', 'net');

// ---- COMBO DUNGEON step 1: HARPOON the post across the moat ----
H.place(40, 20); H.face('right'); Player.tool = 'harpoon'; Player.useTool(); H.step(70);
H.assert(Player.x / 16 > 44, 'HARPOON-post reeled Noah across the moat (x=' + (Player.x / 16).toFixed(1) + ')');
// ---- step 2: RAM-SMASH the cracked seam ----
H.assert((TILEDEFS[tileAt(Game.map, 48, 20)] || {}).crack === true, 'cracked seam present');
H.place(47, 20); H.face('right'); Game.smashCrack(Game.map, 48, 20);
H.assert(!(TILEDEFS[tileAt(Game.map, 48, 20)] || {}).crack, 'RAM SUIT smashed the seam');
// ---- step 3: BRACER a block onto the switch to bridge the pit ----
const blk = Game.map.objects.find(o => o.type === 'block' && o.id === 'b5_blk1');
H.place(50, 20); grabMove(blk, 'right', 'ArrowRight', 55, 20);
H.assert(Game.flags.switchFlags.sw_b5bridge, 'block-on-switch extends the root-beam bridge');
H.assert(tileAt(Game.map, 56, 20) === 'bridge', 'the pit is now bridged');

// ---- MOTTLE: the cage is locked until he's beaten ----
H.place(58, 20); H.step(2);
H.assert(Game.boss && Game.boss.name === 'mottle', 'Mottle guards the dig-head');
const kin = Game.map.objects.find(o => o.type === 'pillowkin');
H.face('up'); Game.interact();
H.assert(!Game.flags.kin_1 && !Game.flags.ramGlow, 'cannot free MR. RAM while Mottle still stands');
Game.companion.x = Game.boss.x; Game.companion.y = Game.boss.y; save('2_mottle');
H.assert(beatWarden('mitts'), 'Ramsi HEADBUTTS Mottle and Noah GRABS him');
H.assert(Game.flags.mottle, 'MOTTLE beaten');
// ---- now free MR. RAM -> awaken GLOW + SHRINK ----
H.place(61, 16); H.face('up'); Game.interact();
H.assert(Game.flags.ramGlow && Game.flags.ramShrink, 'freeing MR. RAM awakens GLOW + SHRINK');
H.assert(Game.flags.pillowkin === 1, 'pillowkin count = 1');
// ---- the new SHRINK opens the way down ----
H.place(61, 26); H.step(20); Game.ramsiCommand();
H.assert(Game.flags.b5_exit && Game.doorIsOpen(Game.map, 60, 27), 'SHRINK opens the burrow-hole down to Level 6');
save('3_cleared');
console.log('BURROW5(new) OK — open herds, 3-tool combo dungeon, Mottle->Glow+Shrink, shrink exit');
