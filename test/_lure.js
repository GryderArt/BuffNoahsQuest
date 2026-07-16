// TOPSOIL TUNNELS systems test: jobspots (call/refusal/work/permanence), all five jobs,
// and Mottle's whack-a-mole cycle.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, TILEDEFS, tileAt } = NQ;
const Herd = NQ.Herd;
H.assert(!!Herd, 'Herd module exported');
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true });
Game.flags['intro_burrow5'] = 1;
Game.loadMap('burrow5'); Game._pendingIntro = null; Game.state = 'play';
H.place(4, 20); H.step(3);
const m = Game.map;
H.assert(m._herdwork, 'burrow5 runs herdwork');
H.assert(tileAt(m, 3, 11) === 'soil', 'the vale-burrow drop tile (3,11) is open ground');
const spot = (f) => m.objects.find(o => o.type === 'jobspot' && o.flag === f);
const work = (f, x, y, n) => {
  H.place(x, y); H.step(2); Game.interact();
  if (Game.state === 'dialog') Game.state = 'play';
  for (let i = 0; i < (n || 500) && !Game.flags.switchFlags[f]; i++) H.step(1);
};

// a call with no matching species nearby is politely refused
H.place(22, 26); H.step(2);   // empty ground, no spot in range
const before = !!spot('sw_b5sniff').worker;
Game.interact();
if (Game.state === 'dialog') Game.state = 'play';
H.assert(!spot('sw_b5sniff').worker || before === !!spot('sw_b5sniff').worker, 'no worker without a call in range');

// the five jobs
work('sw_b5mow1', 14, 8); H.assert(Game.flags.switchFlags.sw_b5mow1 && tileAt(m, 15, 8) === 'soil', 'a SHEEP mows the bramble wall');
work('sw_b5sniff', 24, 9); H.assert(Game.flags.switchFlags.sw_b5sniff && tileAt(m, 25, 8) === 'soil', 'a SNOWHARE sniffs out the buried chest');
work('sw_b5dig1', 9, 25, 700); H.assert(Game.flags.switchFlags.sw_b5dig1 && tileAt(m, 8, 27) === 'soil', 'the stray kid digs its herd free');
work('sw_b5ram1', 29, 20); H.assert(Game.flags.switchFlags.sw_b5ram1 && tileAt(m, 31, 20) === 'soil', 'a RAM smashes the dig-works boulder');
work('sw_b5dig2', 49, 20); H.assert(Game.flags.switchFlags.sw_b5dig2 && tileAt(m, 51, 20) === 'soil', 'the kidnapped kid digs the inner plug');

// MOTTLE: swims hill to hill, only vulnerable up top
H.place(58, 20); H.step(2);
const b = Game.boss;
H.assert(b && b.name === 'mottle', 'MOTTLE holds the den');
b.awake = true;
Game.companion.x = 40 * 16; Game.companion.y = 20 * 16;   // Ramsi away: no headbutts yet
const states = new Set(); const spots2 = new Set();
for (let i = 0; i < 700; i++) {
  Player.hearts = Player.maxHearts; Player.inv = 2;
  Player.x = 58 * 16 + 8; Player.y = 20 * 16 + 12;
  states.add(b.mstate); if (b.mstate === 'up' && b.tgt) spots2.add(b.tgt.join(','));
  H.step(1);
}
H.assert(states.has('under') && states.has('pop') && states.has('up'), 'mole cycle: under -> pop -> up (' + [...states] + ')');
b.mstate = 'under'; b.mT = 5; b.shieldT = 3; H.step(2);
H.assert(b.shieldT <= 0, 'no window holds on a swimming mole');
console.log('LURE PASS — five herd jobs, refusals, and a proper whack-a-mole Mottle');
