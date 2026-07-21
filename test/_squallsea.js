// THE SQUALL STRAIT sea overhaul + victory-exit shortcuts + Twinkle's nap rule.
const H = require('./harness.js');
const { Game, Player } = NQ;
const T = 16;

console.log('== SQUALL STRAIT: a real sea crossing ==');
NQ.newGame(); Game.state = 'play';
NQ.SideScroll.start('squall', false);
const S = NQ.SideScroll.active;
H.assert(S.def.water === true, 'squall is a water road');
H.assert(S.def.rows.some(r => r.includes('Z')), 'urchin-mines ride the swell');
H.assert(S.def.rows.some(r => r.includes('V')), 'a waterspout gushes on an island');
H.assert(S.flagCols.length >= 2, 'two checkpoint flags (' + S.flagCols.length + ')');

// falling in the drink = SPLASH + bounce (never a doom pit), with a current shove
const p = S.p;
p.x = 20 * T + 8;                       // seg2's water gap (cols 18-19 abs... col 20 = gap)
p.y = 12 * T + 20; p.vy = 120; p.vx = 100;
const heartsB4 = Player.hearts;
H.step(1);
H.assert(p.vy < -200, 'splashing in tosses Noah UP on a wave (vy=' + p.vy.toFixed(0) + ')');
H.assert(p.vx < 40, 'the storm current shoves him back (vx=' + p.vx.toFixed(0) + ')');
H.assert(Player.hearts === heartsB4, 'the sea itself never hurts');
H.assert(p.flaps === 5, 'a splash refills the flap meter');

// sea sharks: lurk UNDER the surface, then leap ABOVE it, then splash back under
const shark = S.enemies.find(e => e.kind === 'h');
H.assert(!!shark && shark.homeY === 12 * T + 22, 'sharks cruise below the waves (' + (shark && shark.homeY) + ')');
p.x = shark.hx + 60; p.y = 12 * T; p.vy = 0;   // stand near so it leaps
let rose = false, resub = false;
for (let i = 0; i < 400; i++) {
  H.step(1); Player.hearts = Player.maxHearts; p.inv = 1; p.x = shark.hx + 60; p.y = 0; p.vy = 0;
  if (shark.y < 12 * T - 20) rose = true;
  if (rose && !shark.leap && shark.y >= shark.homeY - 1) { resub = true; break; }
}
H.assert(rose, 'a shark LEAPS clear out of the water');
H.assert(resub, 'and splashes back under to cruise again');

// jellyfish bob ON the surface (not flying in the sky)
const jelly = S.enemies.find(e => e.kind === 'f');
H.assert(!!jelly, 'a jellyfish drifts the strait');
let jmin = 999, jmax = -999;
for (let i = 0; i < 240; i++) { H.step(1); Player.hearts = Player.maxHearts; p.inv = 1; jmin = Math.min(jmin, jelly.y); jmax = Math.max(jmax, jelly.y); }
H.assert(jmin > 12 * T - 12 && jmax < 12 * T + 8, 'jelly bobs in the surf band (' + jmin.toFixed(0) + '..' + jmax.toFixed(0) + ')');
NQ.SideScroll.active = null; Game.state = 'play';

console.log('== TWINKLE: only duels a true fisher ==');
NQ.newGame(); Game.state = 'play';
Game.flags.twinkle = false;
Game.loadMap('deep', 46, 19); Game.state = 'play';
H.assert(Game.creatures.filter(c => c.state !== 'gone').length > 10, 'the Deep teems with creatures');
H.place(47, 19); H.step(30);
H.assert(Game.boss && Game.boss.name === 'twinkle' && !Game.boss.awake, 'Twinkle stays asleep beside Noah');
for (const cr of Game.creatures) cr.state = 'gone';
H.place(47, 19); H.step(30);
H.assert(Game.boss && Game.boss.awake, 'catching EVERY sea creature wakes him');

console.log('== victory exits go straight to the World Map ==');
// deep bubbles, once crowned
NQ.newGame(); Game.state = 'play';
Game.flags.crown = true;
Game.loadMap('deep', 5, 6); Game.state = 'play';
H.place(5, 5); Game.interact();
H.assert(Game.state === 'worldmap', 'crowned bubble-surface -> World Map');
H.assert(NQ.WORLD_NODES[Game.worldCursor].id === 'wastes', 'cursor preset on Starfall Wastes');
Game.state = 'play';
// deep bubbles, NOT crowned: normal surfacing still works
NQ.newGame(); Game.state = 'play';
Game.flags.crown = false;               // (newGame keeps in-memory flags — reset explicitly)
Game.loadMap('deep', 5, 6); Game.state = 'play';
H.place(5, 5); Game.interact();
H.assert(Game.mapId === 'coast' && Game.state === 'play', 'uncrowned bubble still surfaces at the buoy');
// deep victory portal (req twinkle)
NQ.newGame(); Game.state = 'play';
Game.flags.twinkle = true; Game.flags.crown = true;
Game.loadMap('deep', 48, 8); Game.state = 'play';
H.place(48, 7); H.step(2);
H.assert(Game.state === 'worldmap', "Twinkle's victory portal -> World Map");
Game.state = 'play';
// keep3 victory portal (req cerberus)
NQ.newGame(); Game.state = 'play';
Game.flags.cerberus = true;
Game.loadMap('keep3', 21, 4); Game.state = 'play';
H.place(21, 3); H.step(2);
H.assert(Game.state === 'worldmap', "Cerberus's victory portal -> World Map");
H.assert(NQ.WORLD_NODES[Game.worldCursor].id === 'canyon', 'cursor preset on Whistling Canyon');
Game.state = 'play';

console.log('SQUALL SEA PASS — bouncy sea, leaping sharks, surf jellies, nap-gated Twinkle, map-jump exits');
