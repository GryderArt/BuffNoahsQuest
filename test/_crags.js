// THE CLIFFSIDE CROSSING (v4): the Vale is STOCK; its old exit opens a transition sub-level
// that starts Vale-green and ends ocean-sandy. FIVE lands split by FOUR sea channels; each
// summit holds the ONLY wire across, and every summit climbs a DIFFERENT way (slick / ladder
// / stairs+slick / tall sheer slick) — all World-1 valid (gloves + stairs, NO Ramsi). Plus:
// Ramsi follows EVERYWHERE once rescued.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS, TILEDEFS } = NQ;
const T = 16;
H.startPlay();

// ---- the Vale is untouched ----
const v = MAPS.vale;
H.assert(v.w === 64, 'vale back to its original 64 width');
H.assert(v.links.some(l => l.x === 61 && l.y === 33 && l.to === 'coast'), 'original exit link restored');
H.assert(v.doors['61,33'] && v.doors['61,33'].req === 'billy', "King Billy's door still guards it");
H.assert(!v.objects.some(o => o.type === 'zipanchor'), 'no zip poles inside the Vale itself');

// ---- the Crossing geometry ----
const m = MAPS.crags;
H.assert(m && m.w === 88, 'the Cliffside Crossing exists and grew to 88 wide');
H.assert(m.tiles[10][5] === 'grass' && m.tiles[10][60] === 'sand', 'meadow west, sand east (the gradient)');
for (const cx of [13, 14, 15, 30, 31, 32, 49, 50, 51, 68, 69, 70]) H.assert(m.tiles[10][cx] === 'water', 'channel water at x' + cx);
H.assert(TILEDEFS.ice.slick, 'slick faces use the gloves-ONLY rule');
H.assert(m.objects.filter(o => o.type === 'zipanchor').length === 10, 'four crossing wires + the practice stub (10 poles)');
H.assert(m.objects.filter(o => o.type === 'laddervis').length >= 3, 'the ladder/stair climbs are marked');
H.assert(m.objects.filter(o => o.type === 'bouncepad').length === 0, 'NO Ramsi bounce pads (World-1 has no Ramsi yet)');
H.assert(m.spawns.some(s => s.species === 'goat') && m.spawns.some(s => s.species === 'crab'), 'mountain friends west, beach friends east');
H.assert(m.links.some(l => l.to === 'vale'), 'you can walk back to the Vale');

// ---- flow: Vale exit -> Crossing; Crossing far exit -> WORLD MAP (coastPath) ----
Game.flags.billy = true; Game.flags.gloves = true;
Game.loadMap('vale');
Player.x = 61 * T + 8; Player.y = 33 * T + 8;
H.step(2);
H.assert(Game.mapId === 'crags' && Game.state === 'play', 'the old Vale exit now opens the Crossing');
delete Game.flags.coastPath;
Player.x = 86 * T + 8; Player.y = 18 * T + 8;
H.step(2);
H.assert(Game.state === 'worldmap' && Game.flags.coastPath, "the Crossing's far exit surfaces the WORLD MAP with coastPath earned");
Game.state = 'play';

// ---- zip rules: bare hands slip (practice pole), lunges stay lunges, wires DOWNHILL only ----
Game.loadMap('crags');
const practice = m.objects.find(o => o.type === 'zipanchor' && o.x === 4 && o.y === 16);
Player.x = practice.x * T + 8; Player.y = practice.y * T + 8; Player.elev = 1;
delete Game.flags.gloves;
Game.interact();
H.assert(!Game.zip, 'no gloves: the handle slips (the knoll lesson, no ride)');
Game.flags.gloves = true;
const bottom = m.objects.find(o => o.type === 'zipanchor' && o.x === 17);   // a downhill LANDING pole
Player.x = bottom.x * T + 8; Player.y = bottom.y * T + 8; Player.elev = 1;
Game.interact();
H.assert(!Game.zip, 'a BOTTOM pole refuses: wires slide DOWNHILL only');
Player.lungeT = 0.4;
Player.x = practice.x * T + 8; Player.y = practice.y * T + 8; Player.elev = 1;
Game.interact();
H.assert(!Game.zip, 'a mid-LUNGE space bar never grabs a wire');
Player.lungeT = 0;

// ---- the channels are REALLY uncrossable on foot ----
Player.x = 11 * T + 8; Player.y = 12 * T + 8; Player.elev = 0; Player.inv = 9;
NQ.press('x'); H.hold('ArrowRight', true);
for (let i = 0; i < 90; i++) { Player.hearts = Player.maxHearts; H.step(1); }
H.hold('ArrowRight', false);
H.assert(Player.footTile()[0] <= 13, 'channel A cannot be jumped or waded (x=' + (Player.x / T).toFixed(1) + ') — the WIRE is the way');

// ---- PLAYTEST: cross the whole level, climbing each summit its OWN way, riding each wire ----
delete Game.flags.coastPath;
Game.loadMap('crags');
const climb = (bx, by, be, tgt, name) => {
  Player.x = bx * T + 8; Player.y = by * T + 8; Player.elev = be; Player.inv = 9; Game.zip = null;
  let peak = be; H.hold('ArrowUp', true);
  for (let i = 0; i < 90; i++) { H.step(1); peak = Math.max(peak, Player.elev); }
  H.hold('ArrowUp', false);
  H.assert(peak >= tgt, 'PLAYTEST: ' + name + ' climbed to e' + tgt + ' (peak e' + peak + ')');
};
const ride = (px, py, pe, landX, landE, name) => {
  Player.x = px * T + 8; Player.y = py * T + 8; Player.elev = pe;
  Game.interact();
  H.assert(Game.zip, 'PLAYTEST: ' + name + ' pole grips');
  let sawAir = false;
  for (let i = 0; i < 500 && Game.zip; i++) { if (Player.airborne) sawAir = true; H.step(1); }
  H.assert(sawAir && Math.abs(Player.x - (landX * T + 8)) < 4 && Player.elev === landE, 'PLAYTEST: ' + name + ' wire lands at x' + landX + ' e' + landE);
};
climb(8, 13, 0, 2, 'THE LESSON MOUNT (slick 2-step)');
ride(8, 9, 2, 17, 1, 'Mount');
climb(22, 13, 1, 3, 'THE LADDER SPIRE (ladder, no gloves)');
ride(22, 8, 3, 34, 1, 'Spire');
climb(40, 13, 1, 4, 'THE STAIR-&-SLICK TOWER');
ride(40, 7, 4, 53, 1, 'Tower');
climb(58, 13, 1, 4, 'THE SHEER FACE (tallest slick)');
ride(58, 7, 4, 72, 0, 'SheerFace');
Player.x = 86 * T + 8; Player.y = 18 * T + 8; H.step(2);
H.assert(Game.state === 'worldmap' && Game.flags.coastPath, 'PLAYTEST: crossed the whole level, world map earned');
Game.state = 'play';

// ---- climbing honesty: the slick Lesson Mount needs gloves (sandal-jumps slip) ----
Game.zip = null; Game.flags.sandals = true;
const tryMount = () => {
  Player.x = 8 * T + 8; Player.y = 13 * T + 8; Player.elev = 0; Player.inv = 9;
  let peak = 0; H.hold('ArrowUp', true);
  for (let i = 0; i < 60; i++) { Player.airborne = true; H.step(1); peak = Math.max(peak, Player.elev); }
  H.hold('ArrowUp', false); Player.airborne = false;
  return peak >= 2;
};
delete Game.flags.gloves;
H.assert(!tryMount(), 'slick mount: even sandal-jumps slip off without gloves');
Game.flags.gloves = true;
H.assert(tryMount(), 'with gloves the slick mount is climbable');

// ---- but the LADDER SPIRE needs NO gloves (the gentle, diverse climb) ----
delete Game.flags.gloves;
Player.x = 22 * T + 8; Player.y = 13 * T + 8; Player.elev = 1; Player.inv = 9;
let ladPeak = 1; H.hold('ArrowUp', true);
for (let i = 0; i < 90; i++) { H.step(1); ladPeak = Math.max(ladPeak, Player.elev); }
H.hold('ArrowUp', false);
H.assert(ladPeak >= 3, 'the LADDER SPIRE climbs gloveless (a fair choice for early kids)');
Game.flags.gloves = true;

// ---- Ramsi follows EVERYWHERE once rescued ----
delete Game.flags.ramsi;
Game.loadMap('vale');
H.assert(!Game.companionActive(), 'no Ramsi before the rescue');
Game.flags.ramsi = true;
for (const id of ['vale', 'crags', 'coast', 'wastes', 'grannyzoo', 'workshop', 'stable', 'cog1']) {
  Game.loadMap(id);
  H.assert(Game.companionActive(), 'Ramsi follows in ' + id);
  H.step(3);
}
Game.loadMap('vale');
Game.flags.ramShield = true; Game.companion.shield = 1; Player.inv = 0;
const h0 = Player.hearts;
Player.hurt(2);
H.assert(Player.hearts === h0 && Game.companionActive(), 'the shield fires where Ramsi VISIBLY is');

console.log('CRAGS PASS — stock Vale, a wider green-to-sea Crossing, FOUR diverse climbs, clip-free wires, Ramsi everywhere');
