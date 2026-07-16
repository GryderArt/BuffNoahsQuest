// PINNED BOSS HINT BAR: persistent, state-aware, kid-readable (age 6).
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true, gnash: true, pillowkin: 4,
  ramGlow: true, ramShrink: true, ramBounce: true, ramDecoy: true, ramGlide: true, ramRoll: true, ramPound: true });
const hint = () => Game.bossHintLine();

// ---- GNASHARA: a recipe per head, always on screen ----
Game.flags['intro_cog4'] = 1;
Game.loadMap('cog4'); Game._pendingIntro = null; Game.state = 'play';
H.place(16, 12); H.step(2);
const b = Game.boss;
H.assert(b && b.gnashara, 'GNASHARA spawned');
b.awake = true; H.step(1);
H.assert(hint() && /RAMSI/.test(hint().text), 'head 1 (Gust-Wing): hint says walk Ramsi in — "' + hint().text + '"');
b.heads[0].down = true; b.active = 1; H.step(1);
H.assert(/MITTS/.test(hint().text) && hint().keys.join('') === '1Z', 'head 2 (Gnash): MITTS with [1][Z] key-caps');
b.active = 2; H.step(1);
H.assert(/HARPOON/.test(hint().text) && hint().keys[0] === '3', 'head 3: HARPOON with [3]');
b.heads[2].hp = 1; H.step(1);
H.assert(/AGAIN/.test(hint().text) && hint().hot, 'a wounded head flips the bar to hot AGAIN! mode');
b.active = 5; H.step(1);
H.assert(/SUPER RAMSI/.test(hint().text), 'all heads down: SUPER RAMSI line');
for (let i = 0; i < 90 && Game.boss; i++) H.step(1);   // let the core finish

// ---- wardens: state-aware two-step ----
Game.flags['intro_burrow7'] = 1;
Game.loadMap('burrow7'); Game._pendingIntro = null; Game.state = 'play';
H.place(56, 17); H.step(2);
const g = Game.boss;
H.assert(g && g.name === 'geode', 'geode spawned');
g.awake = true;
Game.companion.x = 33 * 16; Game.companion.y = 20 * 16;   // park Ramsi far: dark golem
Player.x = 55 * 16; Player.y = 25 * 16;
for (let i = 0; i < 10; i++) H.step(1);
H.assert(g.lit === 0 && /LIGHT/.test(hint().text), 'dark golem: hint says LIGHT IT UP — "' + hint().text + '"');
Game.companion.x = g.x; Game.companion.y = g.y; H.step(3);
g.shieldT = 2; H.step(1);
H.assert(/NOW!/.test(hint().text) && hint().hot && hint().keys[0] === '3', 'open window: NOW! HARPOON with [3]');
// no boss -> no bar
Game.loadMap('vale'); Game.state = 'play'; H.step(2);
H.assert(!hint(), 'no boss, no bar');
console.log('BOSSHINT PASS — pinned, state-aware, key-capped hints for young readers');
