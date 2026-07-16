const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player, TILEDEFS, tileAt } = NQ;
const tat = (x, y) => tileAt(Game.map, x, y);

H.startPlay();
Object.assign(Game.flags, { ramsi: true, world2: true, sandals: true, wings: true,
  ramGlow: true, ramShrink: true, ramBounce: true, ramGlide: true, ramDecoy: true, ramRoll: true, ramPound: true });
function load() { Game.loadMap('burrowtest'); Game.state = 'play'; Object.assign(Game.companion, { busyT:0, rollT:0, decoyT:0, poundT:0, poundCool:0, glide:0, shrinkT:0 }); H.place(18, 10); H.step(12); }

// ---- ROLL-CHARGE smashes a soft-block ----
load();
H.place(18, 10); H.face('right'); H.step(1);
H.assert((TILEDEFS[tat(19, 10)] || {}).soft === true, 'soft-block present before roll');
Game.ramsiCommand();
H.step(40);
H.assert(!(TILEDEFS[tat(19, 10)] || {}).soft, 'ROLL-CHARGE smashed the soft-block to soil');

// ---- PILLOW-BOUNCE arcs Noah up to the ledge ----
load();
H.place(24, 12); H.step(1);
H.assert(Game.tryBounce() === true, 'standing on the pad, X triggers a bounce');
H.step(50);
H.assert(Math.abs(Player.x / 16 - 24) < 1.4 && Math.abs(Player.y / 16 - 5) < 1.6, 'BOUNCE landed Noah on the high ledge (~24,5)');

// ---- PUFF-GLIDE carries Noah across the gap ----
load();
H.place(26, 11); H.step(1);
Game.ramsiCommand();
H.assert(!!Player.gArc && Player.gArc.kind === 'glide', 'C at the updraft starts a glide');
H.step(70);
H.assert(Math.abs(Player.x / 16 - 31) < 1.4, 'GLIDE carried Noah across to ~x31');

// ---- GROUND-POUND stuns a nearby critter ----
load();
H.place(21, 8); H.step(16);
const crNear = Game.creatures.find(cr => cr.state !== 'gone');
crNear.x = Game.companion.x + 14; crNear.y = Game.companion.y; crNear.stun = 0;
Game.ramsiCommand();
H.assert(Game.companion.poundT > 0, 'C near critters triggers GROUND-POUND');
H.assert(crNear.stun > 0, 'POUND stunned the nearby critter');

// ---- DECOY taunts (when Pound is not known) ----
load();
Game.flags.ramPound = false;
H.place(21, 8); H.step(16);
const cr2 = Game.creatures.find(cr => cr.state !== 'gone'); cr2.x = Game.companion.x + 14; cr2.y = Game.companion.y;
Game.ramsiCommand();
H.assert(Game.companion.decoyT > 0, 'with no Pound, C near enemies triggers DECOY');
Game.flags.ramPound = true;

// screenshot the arena
Game.loadMap('burrowtest'); Game.state = 'play'; H.place(22, 8); H.step(2);
Game.banners = []; Game.toasts = []; H.render();
fs.writeFileSync(__dirname + '/../shots/bt_arena.png', H.canvas.toBuffer('image/png'));
console.log('ABILITIES OK — Roll, Bounce, Glide, Pound, Decoy all verified');
