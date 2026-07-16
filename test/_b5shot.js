// TOPSOIL TUNNELS screenshots: pastures + sinkhole / a job in motion / Mottle popping
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true });
Game.flags['intro_burrow5'] = 1;
Game.loadMap('burrow5'); Game._pendingIntro = null; Game.state = 'play';

// 1) the pastures + the sinkhole landmark
H.place(12, 16); Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 4;
for (let i = 0; i < 10; i++) H.step(1);
H.shot('b5_pastures');

// 2) a sheep answering the call, mid-trot to the bramble job
H.place(14, 8); H.step(2); Game.interact(); if (Game.state === 'dialog') Game.state = 'play';
for (let i = 0; i < 55; i++) H.step(1);
H.shot('b5_job');

// 3) Mottle popped at a molehill
for (let i = 0; i < 200 && !Game.flags.switchFlags.sw_b5mow1; i++) H.step(1);
H.place(45, 20); for (let i = 0; i < 30; i++) H.step(1);   // decay particles away from den
Player.x = 58 * 16 + 8; Player.y = 20 * 16 + 12; Player.dir = 'up';
Game.companion.x = Player.x - 14; Game.companion.y = Player.y + 4;
const b = Game.boss;
if (b) { b.awake = true; b.x = 60 * 16 + 8; b.y = 16 * 16 + 6; b.mstate = 'up'; b.mT = 2; b.surf = 1; b.shieldT = 2; b.stun = 0; }
H.shot('b5_mottle');
console.log('B5 SHOTS saved');
