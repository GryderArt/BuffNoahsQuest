const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player, TILEDEFS, tileAt } = NQ;
const save = (n) => { Game.banners = []; Game.toasts = []; H.render(); fs.writeFileSync(__dirname + '/../shots/b8_' + n + '.png', H.canvas.toBuffer('image/png')); };
function applyTool(tool, b) {
  if (tool === 'mitts') { Player.x = b.x; Player.y = b.y; Player.dir = 'right'; Player.lungeT = 0.2; }
  else if (tool === 'net') { Player.x = b.x; Player.y = b.y; Player.netT = 0.2; }
  else if (tool === 'harpoon') Player.harpoon = { x: b.x, y: b.y, vx: 0, vy: 0, dist: 0, max: 300, state: 'out' };
  else if (tool === 'bone') Player.bone = { x: b.x, y: b.y, vx: 0, vy: 0, t: 0.1 };
}
function beatWarden(name, tool) {
  let broke = false;
  for (let i = 0; i < 2500 && Game.boss; i++) {
    const b = Game.boss; Player.hearts = Player.maxHearts;
    Player.x = b.x - 10; Player.y = b.y; Player.dir = 'right';
    Game.companion.x = b.x; Game.companion.y = b.y + 4;
    if (b.cfg && b.cfg.cmd === 'pound') { b.surf = 1; Game.companion.poundCool = 0; }
    if (!b.awake) { H.step(1); continue; }
    if (b.shieldT > 0) { broke = true; b.inv = 0; applyTool(tool, b); }
    else if (!(Game.companion.busyT > 0)) Game.ramsiCommand();
    H.step(1);
  }
  H.assert(broke, name + ': Ramsi opened the window');
  H.assert(Game.flags[name] || Game.flags['g_' + name], name + ' CAUGHT');
}
H.startPlay();
Object.assign(Game.flags, { ramsi: true, world2: true, ramsuit: true, sandals: true, wings: true,
  net: true, harpoon: true, bone: true, suit: true, gloves: true, bracers: true, mitts: true,
  ramGlow: true, ramShrink: true, ramBounce: true, ramDecoy: true, ramGlide: true, ramRoll: true }); // ramPound comes from Kin #4

// ===== LEVEL 8: ability chain + Tremor-Grub =====
Game.loadMap('burrow8'); Game.state = 'play'; H.place(4, 11); H.step(3); save('1_entry');
H.place(6, 12); H.face('up'); Game.interact();
H.assert(Game.flags.ramPound === true, 'Kin #4 grants GROUND-POUND');
// SHRINK
H.place(11, 10); H.step(40); Game.ramsiCommand();
H.assert(Game.flags.b8_g1, 'chain: SHRINK opens the gate');
// BOUNCE
H.place(18, 11); H.step(30); H.assert(Game.tryBounce(), 'chain: BOUNCE fires'); H.step(50);
H.assert(Player.x / 16 > 21.5, 'chain: BOUNCE cleared the pile');
// GLIDE
H.place(27, 11); H.step(30); Game.ramsiCommand(); H.step(75);
H.assert(Player.x / 16 > 32.5, 'chain: GLIDE crossed the chasm');
// ROLL
H.place(36, 11); H.face('right'); H.step(30); Game.ramsiCommand(); H.step(40);
H.assert(!(TILEDEFS[tileAt(Game.map, 38, 11)] || {}).soft, 'chain: ROLL smashed the wall');
// POUND the swarm
H.place(42, 11); H.step(30);
const wasp = Game.creatures.find(cr => cr.state !== 'gone'); if (wasp) { wasp.x = Player.x + 16; wasp.y = Player.y; wasp.stun = 0; }
Game.companion.poundCool = 0; Game.ramsiCommand();
H.assert(Game.companion.poundT > 0, 'chain: GROUND-POUND fires');
// TREMOR-GRUB
H.place(50, 11); H.step(2);
H.assert(Game.boss && Game.boss.name === 'grub', 'Tremor-Grub spawned');
Game.companion.x = Game.boss.x; Game.companion.y = Game.boss.y; save('2_grub');
beatWarden('grub', 'bone');
H.assert(Game.doorIsOpen(Game.map, 60, 11), 'beating the Tremor-Grub opens the gauntlet gate');

// ===== THE GAUNTLET: re-fight all four, fresh g_* flags (home flags already set) =====
Object.assign(Game.flags, { mottle: true, thornback: true, geode: true, grub: true });   // simulate L5-L8 home wins
H.assert(Game.flags.mottle && Game.flags.grub, 'home Warden flags set (L5-L8 cleared)');
function runDen(map, boss, tool, gflag, nextDoorX) {
  Game.loadMap(map); Game.state = 'play'; H.place(4, 7); H.step(2);
  H.assert(Game.boss && Game.boss.name === boss && Game.boss.gauntlet, map + ': ' + boss + ' RE-SUMMONED (gauntlet) despite home win');
  beatWarden(boss, tool);
  H.assert(Game.flags['g_' + boss] === true, map + ': g_' + boss + ' set (distinct from home flag)');
  H.assert(Game.doorIsOpen(Game.map, nextDoorX, 7), map + ': den-gate opens');
}
runDen('vault1', 'mottle', 'mitts', 'g_mottle', 22);
runDen('vault2', 'thornback', 'net', 'g_thornback', 22);
runDen('vault3', 'geode', 'harpoon', 'g_geode', 22);
Game.loadMap('vault4'); Game.state = 'play'; H.place(4, 7); H.step(2); save('3_vault4_grub');
runDen('vault4', 'grub', 'bone', 'g_grub', 22);
console.log('BURROW8 + GAUNTLET OK — Pound chain, Tremor-Grub, and all four gauntlet Wardens verified');
