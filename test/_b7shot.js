// CRYSTAL DEEP screenshots: entry lesson / light-bridge / golem den
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true, ramGlow: true, ramShrink: true, ramBounce: true, ramDecoy: true });
Game.flags['intro_burrow7'] = 1;
Game.loadMap('burrow7'); Game._pendingIntro = null; Game.state = 'play';
const m = Game.map, cryst = (x, y) => m.objects.find(o => o.type === 'beamcrystal' && o.x === x && o.y === y);
const snap = (x, y) => { H.place(x, y); Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 4; H.step(3); };

// 1) the entry lesson: C1 charged, beam flying to C2, prism asleep ahead
snap(10, 21); for (let i = 0; i < 8; i++) H.step(1);
H.shot('b7_entry');

// 2) the light-bridge: chain C3->C4 aimed, Noah standing mid-bridge over the star-chasm
cryst(35, 14).dir = 1; H.step(2);
snap(35, 18); H.step(2);
Player.x = 37 * 16 + 8; Player.y = 20 * 16 + 12; Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 2;
for (let i = 0; i < 6; i++) H.step(1);
H.shot('b7_bridge');

// 3) the den: arena lane lit, golem bathed + window open
cryst(58, 12).dir = 1; H.step(2);
snap(56, 17); H.step(2);                                  // spawn/wake the den boss
snap(49, 18); for (let i = 0; i < 40; i++) H.step(1);      // park far: particles decay, no headbutt
// compose the shot statically (H.shot renders without updating)
Player.x = 57 * 16 + 8; Player.y = 19 * 16 + 12; Player.dir = 'up';
Game.companion.x = 56 * 16 + 8; Game.companion.y = 19 * 16 + 4;
const b = Game.boss;
if (b) { b.awake = true; b.x = 58 * 16 + 8; b.y = 17 * 16 + 8; b.shieldT = 2.0; b.stun = 0; b.lit = 2; b.slamT = 1; }
H.shot('b7_den');
console.log('B7 SHOTS saved');
