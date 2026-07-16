const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player } = NQ;
const save = (n) => { Game.banners = []; Game.toasts = []; H.render(); fs.writeFileSync(__dirname + '/../shots/gn_' + n + '.png', H.canvas.toBuffer('image/png')); };
function applyTool(tool, b) {
  if (tool === 'harpoon') Player.harpoon = { x: b.x, y: b.y, vx: 0, vy: 0, dist: 0, max: 300, state: 'out' };
  else if (tool === 'bone') Player.bone = { x: b.x, y: b.y, vx: 0, vy: 0, t: 0.1 };
}
H.startPlay();
Object.assign(Game.flags, { ramsi: true, world2: true, ramsuit: true, sandals: true, wings: true,
  net: true, harpoon: true, bone: true, suit: true, gloves: true, bracers: true, mitts: true,
  ramGlow: true, ramShrink: true, ramBounce: true, ramDecoy: true, ramGlide: true, ramRoll: true, ramPound: true,
  mottle: true, thornback: true, geode: true, grub: true });
Game.loadMap('gnash_throne'); Game.state = 'play'; H.place(20, 11); H.step(2);
H.assert(Game.boss && Game.boss.name === 'gnash', 'GNASH spawned in his throne');
Game.companion.x = Game.boss.x; Game.companion.y = Game.boss.y; save('1_throne');

const phasesSeen = new Set();
for (let i = 0; i < 6000 && Game.boss && Game.state === 'play'; i++) {
  const b = Game.boss; Player.hearts = Player.maxHearts;
  Player.x = b.x - 10; Player.y = b.y; Player.dir = 'right';
  Game.companion.x = b.x; Game.companion.y = b.y + 4;
  phasesSeen.add(b.phase);
  if (b.phase !== 2) { b.surf = 1; Game.companion.poundCool = 0; }
  if (b.caughtAnim > 0) { H.step(1); continue; }
  const tool = ['bone', 'harpoon', 'bone'][b.phase - 1];
  if (b.shieldT > 0) { b.inv = 0; applyTool(tool, b); }
  else if (!(Game.companion.busyT > 0)) Game.ramsiCommand();
  H.step(1);
}
H.assert(phasesSeen.has(1) && phasesSeen.has(2) && phasesSeen.has(3), 'GNASH cycled through all 3 phases');
H.assert(Game.flags.gnash === true, 'GNASH defeated');
H.assert(Game.flags.pillowkin === 4, 'all 4 Pillow-Kin freed on the win');
H.assert(Game.state === 'cutscene', 'the PILLOW-KIN reunion cutscene plays');
// the reunion cutscene -> credits
Game.cutscene.i = 0; Game.cutscene.t = 1.0; save('2_reunion');
for (let i = 0; i < 8 && Game.state === 'cutscene'; i++) { Game.cutscene.t = 1.0; Game.advanceCutscene(); }
H.assert(Game.state === 'credits', 'cutscene advances to CREDITS — THE END');
console.log('GNASH OK — 3 phases, ending cutscene, credits all verified');
