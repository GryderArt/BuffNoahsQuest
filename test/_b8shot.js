// HOARD DESCENT screenshots: dune-sea / mid-ride over the void / the grub den
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true,
  ramGlow: true, ramShrink: true, ramBounce: true, ramDecoy: true, ramGlide: true, ramRoll: true });
Game.flags['intro_burrow8'] = 1;
Game.loadMap('burrow8'); Game._pendingIntro = null; Game.state = 'play';

// 1) the dune-sea
H.place(12, 22); Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 4;
for (let i = 0; i < 10; i++) H.step(1);
H.shot('b8_dunes');

// 2) mid-ride: freeze the cart over the great void
Game.flags.b8_g1 = true; Game.flags.b8_j1 = true;
H.place(34, 20); H.step(2);
for (let i = 0; i < 90 && (Game._cartRide || Player.gArc); i++) {
  H.step(1);
  if (Game._cartRide && Player.x > 43 * 16 && Player.y < 18 * 16 && Player.y > 15 * 16) break;
}
H.shot('b8_ride');
for (let i = 0; i < 400 && (Game._cartRide || Player.gArc); i++) H.step(1);

// 3) the den: grub erupted beside the pound-seal
H.place(45, 8); for (let i = 0; i < 30; i++) H.step(1);   // settle particles far away
Player.x = 61 * 16 + 8; Player.y = 19 * 16 + 12; Player.dir = 'right';
Game.companion.x = Player.x - 14; Game.companion.y = Player.y + 4;
const b = Game.boss;
if (b) { b.awake = true; b.x = 63 * 16 + 8; b.y = 19 * 16 + 8; b.gstate = 'up'; b.gT = 2; b.surf = 1; b.shieldT = 2; b.stun = 0; }
H.shot('b8_den');
console.log('B8 SHOTS saved');
