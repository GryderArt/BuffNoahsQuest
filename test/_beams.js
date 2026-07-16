// CRYSTAL DEEP systems test: glow-charging, rotation, beam chains, light-bridges,
// shadow-moths + decoy, sun-runes, prism awakening, and the light-shy Geode Golem.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS } = NQ;
const Beams = NQ.Beams;
H.assert(!!Beams, 'Beams module exported');

H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true,
  ramGlow: true, ramShrink: true, ramBounce: true, ramDecoy: true });
Game.flags['intro_burrow7'] = 1;
Game.loadMap('burrow7'); Game._pendingIntro = null; Game.state = 'play';
H.place(4, 20); H.step(3);
const snap = (x, y) => { H.place(x, y); Game.companion.x = Player.x - 10; Game.companion.y = Player.y + 2; H.step(2); };

const m = Game.map;
H.assert(m.lightMask && m.beams, 'burrow7 opts into lightMask + beams');
const cryst = (x, y) => m.objects.find(o => o.type === 'beamcrystal' && o.x === x && o.y === y);

// ---- spouts light their crystals unaided ----
H.assert(Beams.segs.length >= 3, 'wall-spouts cast beams on their own (' + Beams.segs.length + ' segments)');
H.assert(cryst(35, 14).charged, 'chamber-A crystal is fed by its wall-spout');

// ---- glow-charging: stand near C1 and it wakes; chain reaches C2 ----
snap(9, 21); for (let i = 0; i < 10; i++) H.step(1);
H.assert(Game.glowOn, 'Ramsi glows in the dark');
H.assert(cryst(9, 20).charged, 'C1 wakes in Ramsi\'s glow');
H.assert(cryst(16, 20).charged, 'the beam chains C1 -> C2');

// ---- rotation: turn C2 EAST (S->W->N->E is 3 presses... S(1)->W(2)->N(3)->E(0)) ----
snap(15, 20);
const c2 = cryst(16, 20);
const presses = ((0 - c2.dir) + 4) % 4;
for (let k = 0; k < presses; k++) { Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1); }
H.assert(c2.dir === 0, 'RAMSI turned C2 to face EAST');
snap(9, 21); for (let i = 0; i < 6; i++) H.step(1);   // keep C1 awake so the chain holds
H.assert(Game.flags.b7_prism, 'the chained beam WAKES THE GREAT PRISM');
for (let i = 0; i < 10; i++) H.step(1);
H.assert(Game.flags.b7_gate0, 'the Prism\'s own beam opens the dig-works gate-rune');

// ---- secret: aim C2 NORTH instead -> the north vault rune ----
snap(15, 20);
for (let k = 0; k < 3; k++) { Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1); }
H.assert(c2.dir === 3, 'C2 re-aimed NORTH');
snap(9, 21); for (let i = 0; i < 6; i++) H.step(1);
H.assert(Game.flags.b7_srx, 'secret north rune-vault opens');

// ---- chamber A: aim C3 south -> C4 fires the LIGHT-BRIDGE over the star-chasm ----
const c3 = cryst(35, 14);
snap(35, 15);
const p3 = ((1 - c3.dir) + 4) % 4;
for (let k = 0; k < p3; k++) { Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1); }
H.assert(c3.dir === 1, 'C3 aimed SOUTH');
H.step(2);
H.assert(cryst(35, 20).charged, 'C4 (the bridge-heart) is charged');
H.assert(m._beamLit.has('36,20') && m._beamLit.has('37,20') && m._beamLit.has('38,20'), 'all three bridge tiles are LIT');
H.assert(Game.asteroidCovers ? Game.asteroidCovers(37, 20) : Game.asteroidCovers, 'lit bridge tile counts as solid ground');
H.assert(!Game.asteroidCovers(37, 19), 'unlit chasm tile still deadly');

// ---- STICKY LIGHT: woken hearts stay awake when Ramsi walks away ----
snap(30, 22);                                             // clear across the map from C1/C2
for (let i = 0; i < 20; i++) H.step(1);
H.assert(cryst(9, 20).charged && cryst(16, 20).charged, 'woken crystals STAY lit after Ramsi leaves (no more dead-chain rotating)');
// ---- COLD-HEARTS refuse the glow: only a beam feeds them ----
const c4 = cryst(35, 20);
H.assert(c4.cold, 'the bridge-heart is a COLD-HEART');
cryst(35, 14).dir = 0; H.step(3);                         // starve it of the beam
snap(35, 19); for (let i = 0; i < 25; i++) H.step(1);     // stand right next to it
H.assert(!c4.charged, 'standing beside a cold-heart does NOT wake it');
cryst(35, 14).dir = 1; H.step(3);
H.assert(c4.charged, 'the beam feeds it instantly');

// ---- chamber B: moths smother the heart until the DECOY ----
const c5 = cryst(43, 17);
H.assert(!c5.charged, 'moth-smothered crystal cannot charge');
snap(42, 19);
Game.ramsiCommand();                       // wrapper: near moths -> decoy
for (let i = 0; i < 30; i++) H.step(1);
H.assert(c5.charged, 'decoyed moths free the crystal-heart');
H.assert(Game.flags.b7_g2, 'its beam strikes the floor-rune: east gate opens');

// ---- chamber C: the two-heart alignment opens the Golem vault ----
const c6 = cryst(49, 15), c7 = cryst(49, 22);
snap(49, 16);
for (let g = 0; c6.dir !== 1 && g < 6; g++) { Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1); }
snap(49, 21);
for (let g = 0; c7.dir !== 0 && g < 6; g++) { Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1); }
H.step(2);
H.assert(c6.dir === 1 && c7.dir === 0, 'C6 south, C7 east');
H.assert(Game.flags.b7_vault, 'aligned light ignites the vault-rune');

// ---- the GEODE GOLEM: shadow / glow / beam states ----
H.place(45, 20); Game.companion.x = Player.x; Game.companion.y = Player.y; H.step(2); // far from den
const den = () => Game.boss;
H.place(56, 17); H.step(2);
H.assert(den() && den().name === 'geode', 'Geode Golem holds the den');
// drag Noah + Ramsi far into a corner: golem falls to shadow
Player.x = 55 * 16; Player.y = 25 * 16; Game.companion.x = Player.x - 200 <  0 ? 8 : Player.x - 200; Game.companion.y = Player.y;
Game.companion.x = 33 * 16; Game.companion.y = 20 * 16;   // Ramsi parked way west (beyond glow range)
for (let i = 0; i < 8; i++) H.step(1);
H.assert(den().lit === 0, 'far from glow + beams: the Golem melts into shadow');
Game.companion.x = den().x; Game.companion.y = den().y;   // bring the lantern
for (let i = 0; i < 4; i++) H.step(1);
H.assert(den().lit >= 1, 'in Ramsi\'s glow the Golem takes shape');

// ================= LIVE PATH CHECK (Berkley: 'check the crystal activation paths') =================
// Play the vault chain like a real kid: wake, TURN with the real C command, open the last gate.
{
  H.startPlay();
  Game.flags.ramsi = true; Game.flags.world2 = true; Game.flags.ramGlow = true; Game.flags.glowOn = true; Game.flags.ramDecoy = true;
  Game.loadMap('burrow7');
  const m = Game.map;
  const warm = m.objects.find(o => o.type === 'beamcrystal' && o.x === 49 && o.y === 15);
  const cold = m.objects.find(o => o.type === 'beamcrystal' && o.x === 49 && o.y === 22);
  // turning the DARK cold-heart teaches instead of confusing (fresh-visit state)
  warm.charged = false; cold.charged = false; warm.dir = 3; cold.dir = 2;
  if (m._beamWoken) m._beamWoken.clear();
  delete Game.flags.b7_vault;
  Game.toasts = [];
  Player.x = 49 * 16 + 8; Player.y = 21 * 16 + 8;
  Game.companion.x = Player.x; Game.companion.y = Player.y + 10;
  H.step(5);
  Game.ramsiCommand(); H.step(2);
  H.assert(Game.toasts.some(t => /COLD-HEART stays dark/.test(t.text)), 'dark cold-heart: the toast says FEED IT first');
  // warm heart: wake + turn DOWN (south)
  Player.x = 49 * 16 + 8; Player.y = 16 * 16 + 8;
  Game.companion.x = Player.x - 10; Game.companion.y = Player.y;
  for (let i = 0; i < 30; i++) H.step(1);
  H.assert(warm.charged, 'the spout feeds the warm heart');
  let g = 0; while (warm.dir !== 1 && g++ < 6) { Game.ramsiCommand(); H.step(5); }
  for (let i = 0; i < 20; i++) H.step(1);
  H.assert(cold.charged, 'warm heart turned DOWN — the cold-heart drinks its beam');
  // cold heart: turn EAST -> the vault rune across the trench fires
  Player.x = 49 * 16 + 8; Player.y = 21 * 16 + 8;
  g = 0; while (cold.dir !== 0 && g++ < 6) { Game.ramsiCommand(); H.step(5); }
  for (let i = 0; i < 30; i++) H.step(1);
  H.assert(Game.flags.b7_vault, 'the LAST GATE rune fires — the Golem vault opens');
  H.assert(!NQ.Player ? true : true, 'ok');
}

// ================= THE GOLEM OBEYS WALLS =================
{
  Game.flags.glowOn = false;                                  // shadow-form wander (the wall-ghost case)
  Game.loadMap('burrow7');
  const b = Game.boss;
  H.assert(b && b.name === 'geode', 'the Geode Golem waits in its den');
  Game.companion.x = 10 * 16; Game.companion.y = 10 * 16;     // Ramsi far away: pure shadow wander
  Player.x = 47 * 16; Player.y = 24 * 16;
  let onSolid = 0;
  for (let i = 0; i < 600; i++) {
    Player.hearts = Player.maxHearts;
    H.step(1);
    const d = NQ.TILEDEFS[NQ.tileAt(Game.map, (b.x / 16) | 0, (b.y / 16) | 0)] || {};
    if (d.solid || d.rift) onSolid++;
  }
  H.assert(onSolid === 0, 'in 600 frames of shadow-wander the Golem NEVER stands in a wall (was ghosting before)');
}

console.log('BEAMS PASS — charge, turn, chain, bridge, moths, runes, prism, and a light-shy Golem');
