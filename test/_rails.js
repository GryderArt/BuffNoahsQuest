// HOARD DESCENT systems test: dock rides, crash stubs, bone/block junctions,
// the roll barricade, the coin-fall post gate, the grub cycle, and the pound-seal.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, TILEDEFS, tileAt } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true,
  ramGlow: true, ramShrink: true, ramBounce: true, ramDecoy: true, ramGlide: true, ramRoll: true });
Game.flags['intro_burrow8'] = 1;
Game.loadMap('burrow8'); Game._pendingIntro = null; Game.state = 'play';
H.place(4, 20); H.step(3);
const m = Game.map;
H.assert(m.lightMask && m._docks && m._docks.length === 4, 'burrow8 has lightMask + 4 rail docks');

const rideOut = (max) => { for (let i = 0; i < (max || 900) && (Game._cartRide || Player.gArc); i++) H.step(1); };
const at = () => [Math.round(Player.x / 16 - 0.5), Math.round(Player.y / 16 - 0.75)];

// ---- shrink latch into the dock-house ----
H.place(29, 18); Game.companion.x = Player.x; Game.companion.y = Player.y; H.step(2);
Game.ramsiCommand(); H.step(10);
H.assert(Game.flags.b8_g1, 'RAMSI shrinks through the dock-house latch');

// ---- D1 without the junction: dead-end stub, safe tip-out ----
H.place(33, 20); H.step(1); H.place(34, 20); H.step(2);
H.assert(!!Game._cartRide || !!Player.gArc, 'stepping on the dock starts a ride');
rideOut();
H.assert(Player.x === 35 * 16 + 8 && Player.y === 21 * 16 + 12, 'unset junction -> crash stub tips Noah out beside the dock');

// ---- bone the junction switch across the ledge-gap ----
Player.bone = { x: 38 * 16 + 8, y: 16 * 16 + 8, vx: 0, vy: 0, t: 0.1 };
H.step(3);
H.assert(Game.flags.b8_j1, 'BOOMER-BONE throws junction one');

// ---- D1 again: up into Band A ----
H.step(60);   // dock cooldown
H.place(34, 20); H.step(2); rideOut();
H.assert(at()[0] === 44 && at()[1] === 8, 'the ride lands in the high works (44,8) — got ' + at());

// ---- block junction: emulate the block-on-switch flag, then the barricade ----
Game.flags.switchFlags['sw_b8j2'] = true;
H.step(70);
H.place(53, 8); Player.dir = 'right'; Game.companion.x = Player.x; Game.companion.y = Player.y; H.step(2);
H.assert((TILEDEFS[tileAt(m, 54, 8)] || {}).soft, 'the coin-slide barricade blocks the east line');
H.place(50, 8); H.step(2); rideOut();
H.assert(at()[0] === 52 && at()[1] === 9, 'barricaded line -> blocked stub tips Noah out early — got ' + at());
H.place(53, 8); Player.dir = 'right'; Game.companion.x = Player.x - 8; Game.companion.y = Player.y; H.step(12);
Game.ramsiCommand();                                   // ROLL-CHARGE clears it
for (let i = 0; i < 60; i++) H.step(1);
H.assert(!(TILEDEFS[tileAt(m, 54, 8)] || {}).soft, 'ROLL-CHARGE clears the barricade');
H.step(70);
H.place(50, 8); H.step(2); rideOut();
H.assert(at()[0] === 58 && at()[1] === 6, 'cleared + set line lands on the coin-fall ledge — got ' + at());

// ---- the den is chasm-gated (post pull is the way down) ----
H.assert(m.objects.some(o => o.type === 'post' && o.x === 60 && o.y === 14), 'the coin-fall post waits below');

// ---- the grub: buried (windowless) -> erupts (window) ----
H.place(62, 18); H.step(2);
const b = Game.boss;
H.assert(b && b.name === 'grub', 'the TREMOR-GRUB holds the den');
b.awake = true;
const states = new Set();
for (let i = 0; i < 480; i++) { states.add(b.gstate); Player.hearts = Player.maxHearts; H.step(1); }
H.assert(states.has('buried') && states.has('rise') && states.has('up'), 'grub cycles buried -> rise -> erupt (' + [...states] + ')');
// window only while surfaced
b.gstate = 'buried'; b.gT = 5; b.shieldT = 3; H.step(2);
H.assert(b.shieldT <= 0, 'no co-op window holds on a buried grub');

// ---- LUCKY + the pound-seal + the hidden drop ----
Game.flags.grub = true; Game.flags.ramPound = true;
H.assert(Game.flags.ramRoll, 'Roll is known (the trap: C used to pick ROLL over POUND here)');
H.place(66, 20); Game.companion.x = 66 * 16 + 8; Game.companion.y = 21 * 16 + 8; H.step(12);
Game.ramsiCommand(); H.step(10);                        // the real C key, not startPound()
H.assert(Game.flags.b8_seal, 'pressing C at the throne-seal GROUND-POUNDS it (plate outranks roll)');
const portal = m.objects.find(o => o.type === 'portal');
H.assert(portal && portal.req === 'b8_seal' && Game.lookupFlag(portal.req), 'the drop to the Hoard Cavern is open');

// ---- the secret spur, there and back ----
H.place(24, 35); H.step(2);
H.place(26, 36); H.step(2); rideOut();
H.assert(at()[0] === 34 && at()[1] === 33, 'secret spur reaches the private stash — got ' + at());
H.step(60); H.place(33, 32); H.step(2); rideOut();
H.assert(at()[0] === 27 && at()[1] === 36, 'and the spur rides home again — got ' + at());
console.log('RAILS PASS — docks, stubs, junctions, barricade, grub cycle, pound-seal, secret spur');
