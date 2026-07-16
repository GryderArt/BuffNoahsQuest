// ROOT HOLLOWS systems test: bulb turning, sap routing, permanent blooms (drain /
// gate / bridge / den door / secrets), the shrink-hole bulb, and Thornback's charges.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, TILEDEFS, tileAt } = NQ;
const Sap = NQ.Sap;
H.assert(!!Sap, 'Sap module exported');
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true, ramGlow: true, ramShrink: true });
Game.flags['intro_burrow6'] = 1;
Game.loadMap('burrow6'); Game._pendingIntro = null; Game.state = 'play';
H.place(4, 20); H.step(3);
const m = Game.map;
H.assert(m.lightMask && m._sap, 'burrow6 opts into lightMask + sap');
const snap = (x, y) => { H.place(x, y); Game.companion.x = Player.x - 10; Game.companion.y = Player.y + 2; H.step(12); };
const bulb = (id) => m.objects.find(o => o.type === 'sapbulb' && o.id === id);

// ---- nothing downstream is fed while bulb A is off ----
H.assert(Sap.fed.has('e1'), 'the heart-root always feeds the trunk');
H.assert(!Sap.fed.has('e2') && !Sap.fed.has('e3'), 'bulb A (off) holds the flow');

// ---- turn A: off -> S (drain the pool) ----
snap(23, 20);
Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1);
H.assert(bulb('A').state === 'S', 'first turn: sap flows SOUTH');
H.assert(Game.flags.switchFlags.sw_b6drain, 'the drain-root drinks the pool');
H.assert(tileAt(m, 9, 34) === 'soil', 'the drowned hollow is dry land now');

// ---- A -> E (open the dig-works gate) ----
Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1);
H.assert(bulb('A').state === 'E', 'second turn: sap flows EAST');
H.assert(Game.flags.switchFlags.sw_b6gate, 'the gate-rune drinks: the dig-works open');

// ---- A -> N (the bloom-vault secret) ----
Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1);
H.assert(Game.flags.switchFlags.sw_b6bloom && tileAt(m, 18, 6) === 'soil', 'the flower blooms open the north vault');
// back to E so the dungeon stays fed
for (let g = 0; bulb('A').state !== 'E' && g < 6; g++) { Game.ramsiCommand(); for (let i = 0; i < 25; i++) H.step(1); }
H.assert(bulb('A').state === 'E', 'A re-aimed EAST');

// ---- the vein-pocket bulb via the shrink-hole ----
snap(33, 16);
Game.ramsiCommand(); for (let i = 0; i < 50; i++) H.step(1);
H.assert(bulb('B').state === 'E', 'shrunk RAMSI turns the hidden bulb EAST');
H.assert(Sap.fed.has('e7'), 'the main line drinks past the pocket');
H.assert(Game.flags.switchFlags.sw_b6bridge, 'the bridge-root GROWS across the pit');
H.assert(tileAt(m, 47, 20) === 'bridge', 'living bridge tiles are real');
Game.ramsiCommand(); for (let i = 0; i < 40; i++) H.step(1);
H.assert(bulb('B').state === 'N' && Game.flags.switchFlags.sw_b6vault, 'aimed NORTH it blooms the vein-vault');
for (let g = 0; bulb('B').state !== 'E' && g < 6; g++) { Game.ramsiCommand(); for (let i = 0; i < 45; i++) H.step(1); }
H.assert(bulb('B').state === 'E', 'B re-aimed EAST');

// ---- the last bulb: den door + gem pocket ----
snap(50, 18);
Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1);
H.assert(bulb('D').state === 'E' && Game.flags.switchFlags.sw_b6den, 'the Warden-door drinks and opens');
Game.ramsiCommand(); for (let i = 0; i < 30; i++) H.step(1);
H.assert(Game.flags.switchFlags.sw_b6gems, 'the gem-pocket blooms');

// ---- THORNBACK: charge-liner + the sticky channel ----
snap(57, 19); H.step(2);
const b = Game.boss;
H.assert(b && b.name === 'thornback', 'THORNBACK holds the den');
b.awake = true;
let sawCharge = false, sawThorns = false, sawStuck = false;
Game.companion.x = 40 * 16; Game.companion.y = 20 * 16;   // Ramsi parked away (no headbutt)
for (let i = 0; i < 700 && !(sawCharge && sawThorns); i++) {   // phase 1: open-floor charges
  Player.hearts = Player.maxHearts; Player.inv = 2;
  Player.x = 61 * 16 + 8; Player.y = 14 * 16 + 12;
  if (b.tstate === 'charge') sawCharge = true;
  if ((b._thorns || []).length >= 3) sawThorns = true;
  H.step(1);
}
for (let i = 0; i < 900 && !sawStuck; i++) {                   // phase 2: bait across the channel
  Player.hearts = Player.maxHearts; Player.inv = 2;
  Player.x = 59 * 16 + 8; Player.y = 22 * 16 + 12;
  if (b.stuckT > 0) sawStuck = true;
  H.step(1);
}
H.assert(sawCharge, 'it charges in lines');
H.assert(sawThorns, 'charges leave thorn trails');
H.assert(sawStuck && b.shieldT > 0, 'a charge across the sticky sap glues it — free window');
console.log('SAP PASS — bulbs, routing, permanent blooms, shrink-vein, and a sticky Thornback');
