// SKY REALMS screenshots: leaf-bridge lesson / puff-stones + Puff Lord / the storm span
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, ramsuit: true, suit: true, wings: true,
  net: true, harpoon: true, bone: true, cage: true });

// 1) sky1: Noah mid-crossing on the leaf-stream, windsock + updraft beyond
Game.flags['intro_sky1'] = 1;
Game.loadMap('sky1'); Game._pendingIntro = null; Game.state = 'play';
H.place(14, 14); Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 4;
for (let i = 0; i < 20; i++) H.step(1);
H.shot('sky1_stream');

// 2) sky2: the puff-stone crossing + the Puff Lord's shell game (crown tell)
Game.flags['intro_sky2'] = 1; Game.flags.gustwing = true;
Game.loadMap('sky2'); Game._pendingIntro = null; Game.state = 'play';
H.place(13, 15); Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 4;
const b2 = Game.boss; if (b2) { b2.awake = true; }
for (let i = 0; i < 30; i++) H.step(1);
if (b2) { b2.hid = true; b2.shieldT = 0; }
H.shot('sky2_puffs');

// 3) sky3: a bolt striking a rod while Noah shelters, Sparkhorn aiming
Game.flags['intro_sky3'] = 1; Game.flags.pufflord = true;
Game.loadMap('sky3'); Game._pendingIntro = null; Game.state = 'play';
H.place(15, 16); Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 4;
const b3 = Game.boss; if (b3) b3.awake = true;
const st = Game.map._storm;
for (let i = 0; i < 400; i++) {
  Player.hearts = Player.maxHearts; Player.x = 15 * 16 + 8; Player.y = 16 * 16 + 12;
  H.step(1);
  const bolt = st.bolts.find(x => x.fired && x.t > 0 && x.t < 0.12);
  if (bolt) break;
}
H.shot('sky3_storm');
console.log('SKY SHOTS saved');
