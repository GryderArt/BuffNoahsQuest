// SKY REALMS systems test: lane carry, leaf-bridges, pulsing drafts, puff-stones,
// bone drift, the storm scheduler + rod preference, and all four boss AIs.
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
const Wind = NQ.Wind;
H.assert(!!Wind, 'Wind module exported');
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, ramsuit: true, suit: true, wings: true,
  net: true, harpoon: true, bone: true, cage: true });

// ---- sky1: carry + bridge + pulse ----
Game.flags['intro_sky1'] = 1;
Game.loadMap('sky1'); Game._pendingIntro = null; Game.state = 'play';
H.place(4, 15); H.step(2);
const m1 = Game.map;
H.assert(m1._wind && m1._wind.length === 3, 'sky1 has three wind lanes');
H.place(14, 14);
const x0 = Player.x;
for (let i = 0; i < 50; i++) H.step(1);
H.assert(Player.x > x0 + 24, 'the leaf-stream CARRIES Noah east (+' + Math.round(Player.x - x0) + 'px)');
H.assert(Game.asteroidCovers(16, 14), 'the always-on stream bridges its rift tiles');
let onSeen = false, offSeen = false;
for (let i = 0; i < 360; i++) { if (Game.asteroidCovers(19, 10)) onSeen = true; else offSeen = true; H.step(1); }
H.assert(onSeen && offSeen, 'the pulsing up-draft bridges ON and OFF');
H.place(6, 14);
Game.flyingNets.push({ x: 15 * 16, y: 14 * 16 + 8, vx: 0, vy: 0, t: 0 });
const n0 = Game.flyingNets[Game.flyingNets.length - 1], nx0 = n0.x; H.step(5);
H.assert(!Game.flyingNets.includes(n0) || n0.x > nx0, 'thrown nets drift downwind');
// GUST WING dives
H.place(28, 14); H.step(2);
let b = Game.boss; b.awake = true;
const gs = new Set();
for (let i = 0; i < 500; i++) { Player.hearts = Player.maxHearts; Player.inv = 2; Player.x = 24 * 16; Player.y = 14 * 16; gs.add(b.gs); H.step(1); }
H.assert(gs.has('circle') && gs.has('aim') && gs.has('dive'), 'Gust Wing circles, aims, DIVES (' + [...gs] + ')');

// ---- sky2: staggered puff-stones ----
Game.flags['intro_sky2'] = 1; Game.flags.gustwing = true;
Game.loadMap('sky2'); Game._pendingIntro = null; Game.state = 'play';
H.place(4, 16); H.step(2);
let both = false, neither = false, mix = false;
for (let i = 0; i < 300; i++) {
  const a = Game.asteroidCovers(8, 14), c2 = Game.asteroidCovers(10, 14);
  if (a && c2) both = true; if (!a && !c2) neither = true; if (a !== c2) mix = true;
  H.step(1);
}
H.assert(mix, 'puff-stones pulse on a STAGGER (never all in lockstep)');
b = Game.boss; b.awake = true; H.place(26, 15); H.step(2);
for (let i = 0; i < 40; i++) H.step(1);
H.assert(b.puffs && b.puffs.length === 2, 'the Puff Lord drifts with two decoy puffs');

// ---- sky3: storm bolts prefer rods; Sparkhorn fries itself ----
Game.flags['intro_sky3'] = 1; Game.flags.pufflord = true;
Game.loadMap('sky3'); Game._pendingIntro = null; Game.state = 'play';
H.place(15, 16); H.step(2);                       // beside the rod at (16,16)
const st = Game.map._storm;
let rodStruck = false, fired = false;
for (let i = 0; i < 400 && !(rodStruck && fired); i++) {
  Player.hearts = Player.maxHearts; Player.x = 15 * 16 + 8; Player.y = 16 * 16 + 12;
  for (const bolt of st.bolts) { if (bolt.x === 16 && bolt.y === 16) rodStruck = true; if (bolt.fired) fired = true; }
  H.step(1);
}
H.assert(rodStruck, 'bolts prefer the LIGHTNING ROD when Noah stands in its shadow');
H.assert(fired, 'bolts actually strike');
b = Game.boss; b.awake = true;
let fried = false;
for (let i = 0; i < 900 && !fried; i++) {
  Player.hearts = Player.maxHearts; Player.inv = 2;
  Player.x = b.x - 20; Player.y = b.y;            // stay in front so it keeps charging
  Game.companion.x = 4 * 16; Game.companion.y = 16 * 16;
  if (b.stun > 0 && b.shieldT > 0) fried = true;
  H.step(1);
}
H.assert(fried, 'Sparkhorn eventually fries itself on its own bolt-call (free window)');

// ---- sky4: the Storm-Lord's three phases ----
Game.flags['intro_sky4'] = 1; Game.flags.sparkhorn = true;
Game.loadMap('sky4'); Game._pendingIntro = null; Game.state = 'play';
H.place(27, 15); H.step(2);
b = Game.boss; b.awake = true; H.step(2);
H.assert(b.phase === 1, 'Storm-Lord opens calm');
b.hits = 2; H.step(2); H.assert(b.phase === 2, 'two hits: the squall-swirl phase');
b.hits = 4; H.step(2); H.assert(b.phase === 3, 'four hits: fury');
console.log('WIND PASS — lanes, bridges, stones, storm, and four bosses with real moves');
