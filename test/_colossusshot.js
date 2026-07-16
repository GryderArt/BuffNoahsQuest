const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, gnashara: true, net: true, harpoon: true, bone: true,
  ramGlow: true, ramShrink: true, ramBounce: true, ramDecoy: true, ramGlide: true, ramRoll: true, ramPound: true });
Game.flags['intro_castle1'] = 1;
Game.loadMap('castle1'); Game._pendingIntro = null; Game.state = 'play';
const m = Game.map, c = m.colossus;

// 1) mid-fight: colossus looming, tornado crossing, reticles glowing, hint bar + pips
H.place(14, 12); Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 4;
for (let i = 0; i < 20; i++) { Player.hearts = Player.maxHearts; H.step(1); }
c.wx = Player.x + 40; c.dir = -1;
c.tornados.push({ x: Player.x + 90, y: 12 * 16 + 8, vx: -52, t: 1.2 });
c.bolts.push({ x: Player.x - 60, y: Player.y, t: 0.6, fired: false });
H.step(2);
H.shot('colossus_fight');

// 2) the laser blast connecting
Game.companion.x = Player.x; Game.companion.y = Player.y + 4;
c.wx = Player.x; c.dir = 1; H.step(1);
Game.ramsiCommand(); H.step(3);
H.shot('colossus_laser');

// 3) after the fall: clear sunny sky
for (const p of c.pieces) p.off = true;
c.helmet = true; c.state = 'down'; c.clearT = 1; c._ending = true;   // freeze pre-cutscene
Game.flags.colossus = true;
H.step(2);
H.shot('colossus_sunny');
console.log('COLOSSUS SHOTS saved');
