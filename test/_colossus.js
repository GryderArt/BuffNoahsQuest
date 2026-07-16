// THE STORM COLOSSUS: laser pieces in order (armor/arms -> helmet -> head), 3-charge
// ammo with grass/milk refills, bolts + tornados, the collapse, the sky clearing,
// the ending cutscene, and the cloud-stair portal from cog4.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true, gnash: true, pillowkin: 4, gnashara: true,
  ramGlow: true, ramShrink: true, ramBounce: true, ramDecoy: true, ramGlide: true, ramRoll: true, ramPound: true });

// the cloud-stair appears in cog4 once Gnashara falls
H.assert(MAPS.cog4.objects.some(o => o.type === 'portal' && o.to === 'castle1' && o.req === 'gnashara'), 'cog4 grows the cloud-stair to Grimspire');

Game.flags['intro_castle1'] = 1;
Game.loadMap('castle1'); Game._pendingIntro = null; Game.state = 'play';
H.place(10, 12); H.step(3);
const m = Game.map, c = m.colossus;
H.assert(!!c && c.state === 'fight', 'the Storm Colossus strides Grimspire Keep');
H.assert(Game._laser && Game._laser.n === 3, 'Super Ramsi opens with 3 laser charges');

// hint bar speaks colossus
H.assert(/GLOW|LASER|ZAP/.test(Game.bossHintLine().text), 'pinned hint speaks laser — "' + Game.bossHintLine().text + '"');

// ---- a lined-up shot knocks a piece off ----
const fire = () => {   // pinned: bolts/tornados must not shove the shooter mid-charge
  const px = Player.x, py = Player.y;
  Game.ramsiCommand();
  for (let i = 0; i < 55; i++) { Player.x = px; Player.y = py; Player.inv = 9; Player.hearts = Player.maxHearts;
    Game.companion.x = px; Game.companion.y = py + 4; H.step(1); }
};
Game.companion.x = Player.x; Game.companion.y = Player.y + 4;
c.wx = Player.x; c.dir = 1; H.step(1);                    // chest (ox 0) lines up with Noah
fire();
H.assert(c.pieces.find(p => p.id === 'chest').off, 'aligned blast knocks the CHEST PLATE off');
H.assert(Game._laser.n === 2, 'a shot spends a charge');

// ---- missing still spends; empty tank begs for snacks ----
c.wx = Player.x + 400; fire(); fire();
H.assert(Game._laser.n === 0, 'tank empty after three shots');
Game.ramsiCommand(); H.step(2);
H.assert(Game._laser.n === 0, 'no free shots when empty');
H.assert(/GRASS|MILK/.test(Game.bossHintLine().text), 'hint says to eat — "' + Game.bossHintLine().text + '"');

// ---- snacks refill (grass lump, then milk carton) ----
H.place(9, 13); for (let i = 0; i < 8 && Game._laser.n < 1; i++) H.step(1);
H.assert(Game._laser.n === 1, 'MUNCH: grass lump +1 charge');
H.place(15, 11); for (let i = 0; i < 8 && Game._laser.n < 2; i++) H.step(1);
H.assert(Game._laser.n === 2, 'GLUG: milk carton +1 charge');

// ---- storm attacks actually happen ----
let sawBolt = false, sawNado = false;
for (let i = 0; i < 700 && !(sawBolt && sawNado); i++) {
  Player.hearts = Player.maxHearts;
  if (c.bolts.some(b => b.fired)) sawBolt = true;
  if (c.tornados.length) sawNado = true;
  H.step(1);
}
H.assert(sawBolt, 'lightning bolts strike (telegraphed)');
H.assert(sawNado, 'tornados sweep the battlement');

// ---- knock everything off: pieces -> helmet -> head -> THE FALL ----
Game.companion.x = Player.x; Game.companion.y = Player.y + 4;
for (let guard = 0; guard < 14 && c.pieces.some(p => !p.off); guard++) {
  const p = c.pieces.find(q => !q.off);
  Game._laser.n = 3; c.dir = 1;
  c.wx = Player.x - NQ.COL_ANCH[NQ.colFrame(c)][p.anchor][0]; H.step(1);
  fire();
}
H.assert(c.pieces.every(p => p.off), 'all six pieces blasted off');
H.assert(!c.helmet, 'helmet still on after the pieces');
Game._laser.n = 3; c.wx = Player.x; H.step(1); fire();
H.assert(c.helmet, 'the HELMET flies off next');
Game._laser.n = 3; c.wx = Player.x; H.step(1); fire();
H.assert(c.state === 'falling' || c.state === 'down', 'head hit: the Colossus is coming down');
for (let i = 0; i < 400 && c.state !== 'down'; i++) { Player.hearts = Player.maxHearts; H.step(1); }
H.assert(c.state === 'down' && Game.flags.colossus, 'CRASH! flags.colossus set');
for (let i = 0; i < 400 && Game.state !== 'cutscene'; i++) { Player.hearts = Player.maxHearts; H.step(1); }
H.assert(c.clearT >= 1, 'the sky has fully cleared to sunshine');
H.assert(Game.state === 'cutscene', 'the ending plays');
for (let i = 0; i < 8 && Game.state === 'cutscene'; i++) { Game.cutscene.t = 1; Game.advanceCutscene(); }
H.assert(Game.state === 'credits', 'and the credits roll — THE TRUE END');
console.log('COLOSSUS PASS — laser recipe, snacks, storm attacks, collapse, sunshine, credits');
