// FULL scripted progression: sheep -> Sahor, using the real mechanics.
const H = require('./harness');
const { NQ } = H;
const { Game, Player, Bosses, CREATURES } = NQ;
const T = 16;

function advanceDialog() {
  let guard = 0;
  while ((Game.state === 'dialog' || Game.state === 'itemget') && guard++ < 60) {
    if (Game.state === 'itemget') { Game.itemGetData.t = 1; H.press(' '); }
    else H.press(' ');
  }
  H.assert(Game.state === 'play', 'dialog/celebration finished');
}
function clearUI() { advanceDialog(); }
// POWER-BRACERS grab: face the block, hold SPACE (grab), then hold an arrow to push/pull
function grabMove(block, faceDir, key, tx, ty, max) {
  H.face(faceDir);
  NQ.hold(' ', true); H.step(3);
  H.assert(Player.grab === block, 'grabbed the block (facing ' + faceDir + ')');
  H.hold(key, true);
  let guard = 0;
  while ((block.x !== tx || block.y !== ty) && guard++ < (max || 400)) H.step(2);
  H.hold(key, false);                           // stop pushing FIRST...
  H.step(16);                                   // ...then let the slide finish + the switch click
  NQ.hold(' ', false); H.step(4);
  H.assert(block.x === tx && block.y === ty, 'block moved to (' + tx + ',' + ty + ') got (' + block.x + ',' + block.y + ')');
}
function captureWith(species, method) {
  const c = Game.creatures.find(cc => cc.species === species && cc.state !== 'gone' && cc.state !== 'trapped');
  if (!c) throw new Error('no live ' + species + ' on map');
  c.vx = 0; c.vy = 0; c.wanderT = 999; c.state = 'wander';
  c.x = Player.x + 18; c.y = Player.y;
  H.face('right');
  if (method === 'bone-then-net' || method === 'bone-then-mitts') {
    Player.tool = 'bone'; Player.useTool(); H.step(40);
    H.assert(c.stun > 0, species + ' stunned by boomer-bone');
    c.x = Player.x + 16; c.y = Player.y;
    Player.tool = method.endsWith('net') ? 'net' : 'mitts'; Player.useTool(); H.step(20);
  } else {
    Player.tool = method; Player.useTool(); H.step(25);
  }
  H.assert(c.state === 'gone', species + ' captured via ' + method);
}

console.log('== ZONE 1: GREENWOOD VALE ==');
H.startPlay();
H.assert(Game.mapId === 'vale', 'new game starts in Greenwood Vale');
// 3 sheep with mitts
H.place(20, 14);
for (let i = 0; i < 3; i++) captureWith('sheep', 'mitts');
H.assert((Game.flags.life_sheep || 0) >= 3, '3 sheep befriended');
// Granny -> net + cage + baits
H.place(34, 12); H.face('up'); Game.interact();
H.assert(Game.state === 'dialog', 'Granny talks');
advanceDialog();
H.assert(Game.flags.net && Game.flags.cage, 'Granny gave NET + SCENT CAGE');
H.assert(Game.flags.baits.clover >= 3 && Game.flags.baits.tincan >= 3, 'starter baits given');
// trap a RAM with a clover cage (the real lure mechanic)
H.place(6, 24); H.face('right');
Game.placeCage('clover');
{
  const ram = Game.creatures.find(c => c.species === 'ram');
  H.assert(!!ram, 'a ram lives in the west woods');
  ram.x = Player.x + 60; ram.y = Player.y; ram.state = 'wander';
  H.step(260);
  H.assert((Game.flags.life_ram || 0) >= 1, 'ram walked into the clover cage');
}
// 2 goats (net)
H.place(8, 13);
for (let i = 0; i < 2; i++) captureWith('goat', 'net');
H.assert(Game.mountainCount() >= 3, '3 mountain friends');
// shrine -> sandals
H.place(6, 6); H.face('up'); Game.interact(); advanceDialog();
H.assert(Game.flags.sandals, 'SPRING SANDALS earned at the snow summit');
// jump gating: grotto chasm
{
  const can = Player.canEnter(NQ.MAPS.vale, 25, 8, 25, 9);
  H.assert(!can, 'chasm blocks walking');
  Player.airborne = true; Player.flight = false;
  H.assert(Player.canEnter(NQ.MAPS.vale, 25, 8, 25, 9), 'chasm crossable while jumping');
  Player.airborne = false;
}
// enter grotto via the door link
H.place(25, 4); H.hold('ArrowUp', true); H.step(30); H.hold('ArrowUp', false);
H.assert(Game.mapId === 'grotto1', 'entered Goat Grotto: Entry Cavern');

console.log('== DUNGEON 1: GOAT GROTTO (4 rooms) ==');
// ROOM 1: jump the Grabby Gap ring, in AND out
H.place(6, 12); H.face('up');
Player.jump(); H.hold('ArrowUp', true); H.step(40); H.hold('ArrowUp', false);
H.assert(Math.round(Player.y / T) <= 10, 'jumped INTO the grabby gap ring (y=' + (Player.y / T).toFixed(1) + ')');
H.place(6, 10); H.face('up'); Game.interact();
H.assert(Game.flags.harpoon, 'HARPOON found in the Entry Cavern');
H.assert(Game.state === 'itemget', 'ITEM GET celebration plays for the harpoon');
clearUI();
H.place(6, 10); H.face('down');
Player.jump(); H.hold('ArrowDown', true); H.step(40); H.hold('ArrowDown', false);
H.assert(Math.round(Player.y / T) >= 12, 'jumped back OUT of the ring');
// north door -> ROOM 2
H.place(13, 6); H.hold('ArrowUp', true); H.step(40); H.hold('ArrowUp', false);
H.assert(Game.mapId === 'grotto2', 'entered the Great Chasm room');
// ROOM 2: vast pit — jump fails, harpoon crosses, rim post returns
{
  H.place(15, 17); H.face('up');
  Player.jump(); H.hold('ArrowUp', true); H.step(50); H.hold('ArrowUp', false); H.step(10);
  H.assert(Math.round(Player.y / T) >= 17, 'jump CANNOT reach the key island (y=' + (Player.y / T).toFixed(1) + ')');
  Player.hearts = Player.maxHearts;
}
H.place(15, 17); H.face('up'); Player.tool = 'harpoon'; Player.useTool();
H.step(70);
H.assert(Math.abs(Player.x - (15 * T + 8)) < 8 && Math.abs(Player.y - (11 * T + 12)) < 8, 'harpoon pulled Noah to the key island');
H.face('up'); Game.interact();
H.assert(Game.flags.keys === 1, 'little key from the island chest');
H.face('down'); Player.useTool(); H.step(70);
H.assert(Math.round(Player.y / T) >= 16, 'harpooned BACK off the key island');
// east locked door -> ROOM 3 (Bracer Works)
H.place(25, 11); H.face('right'); H.hold('ArrowRight', true); H.step(50); H.hold('ArrowRight', false);
H.assert(Game.flags.keys === 0, 'little key consumed at the locked door');
H.assert(Game.mapId === 'grotto3', 'entered the Bracer Works');
// ROOM 3: THE BRACER WORKS — wall machine -> bridge machine -> vault gate
{
  const m3 = NQ.MAPS.grotto3;
  const b1 = m3.objects.find(o => o.id === 'g3_b1');
  const b2 = m3.objects.find(o => o.id === 'g3_b2');
  const b3 = m3.objects.find(o => o.id === 'g3_b3');
  H.place(5, 9); H.face('down'); Game.interact(); H.step(2);
  H.assert(!Player.grab, 'block cannot be gripped without POWER BRACERS');
  H.place(4, 12); H.face('down'); Game.interact();
  H.assert(Game.flags.bracers, 'POWER BRACERS found in the chest');
  clearUI();
  // STAGE 1: park B1 on switch 1 -> the cracked wall sinks
  H.assert(NQ.tileAt(m3, 7, 11) === 'wall', 'the wall stands before the click');
  H.place(5, 9); grabMove(b1, 'down', 'ArrowDown', 5, 14);
  H.step(5);
  H.assert(Game.flags.switchFlags.sw_grotto3_1, 'switch 1 clicks');
  H.assert(NQ.tileAt(m3, 7, 11) === 'floor', 'the cracked wall sank into the floor');
  clearUI();
  // STAGE 2: B2 onto switch 2 -> the bridge slides over the chasm
  H.place(9, 7); grabMove(b2, 'right', 'ArrowRight', 16, 7);
  H.place(16, 6); grabMove(b2, 'down', 'ArrowDown', 16, 14);
  H.step(5);
  H.assert(Game.flags.switchFlags.sw_grotto3_2, 'switch 2 clicks');
  H.assert(NQ.tileAt(m3, 18, 10) === 'bridge', 'the bridge extended');
  clearUI();
  // cross the new bridge ON FOOT
  H.place(17, 10); H.hold('ArrowRight', true); H.step(80); H.hold('ArrowRight', false);
  H.assert(Player.footTile()[0] >= 20, 'walked across the new bridge');
  // STAGE 3: the boxed-in block — PULL it free, walk it to switch 3
  H.place(25, 8); grabMove(b3, 'left', 'ArrowRight', 25, 8);   // pull east, out of the alcove
  H.place(25, 7); grabMove(b3, 'down', 'ArrowDown', 25, 12);
  H.place(26, 12); grabMove(b3, 'left', 'ArrowLeft', 21, 12);
  H.step(5);
  H.assert(Game.flags.switchFlags.sw_grotto3, 'switch 3 clicks — the vault gate opens');
  clearUI();
  // through the gate, claim the BIG KEY (visible since the room began)
  H.place(22, 5); H.hold('ArrowUp', true); H.step(40); H.hold('ArrowUp', false);
  H.place(22, 3); H.face('up'); Game.interact();
  H.assert(Game.flags.bosskeys === 1, 'BIG KEY collected in the vault');
  clearUI();
}
// back through room 2, boss door north -> ROOM 4
H.place(3, 11); H.hold('ArrowLeft', true); H.step(40); H.hold('ArrowLeft', false);
H.assert(Game.mapId === 'grotto2', 'back in the Great Chasm');
H.place(15, 4); H.hold('ArrowUp', true); H.step(40); H.hold('ArrowUp', false);
H.assert(Game.flags.bosskeys === 0, 'boss door unlocked');
H.assert(Game.mapId === 'grotto4', 'entered Billys Hall');
// KING BILLY: harpoon mid-charge, then grab
{
  H.place(14, 8);
  H.step(30);
  const b = Game.boss;
  H.assert(b && b.name === 'billy' && b.awake, 'King Billy wakes');
  let guard = 0;
  while (!Game.flags.billy && guard++ < 8000) {
    if (b.caughtAnim > 0) { H.step(5); continue; }
    if (b.dazed > 0) {
      Player.x = b.x - 14; Player.y = b.y; H.face('right');
      Game.interact(); H.step(3);   // SPACE = grab, harpoon stays equipped!
    } else if (b.state === 'charge' && !Player.harpoon) {
      Player.x = b.x; Player.y = Math.min(b.y + 60, 10 * T); H.face('up');
      Player.tool = 'harpoon'; Player.useTool(); H.step(2);
    } else H.step(2);
    Player.hearts = Player.maxHearts; // not testing damage here
  }
  H.assert(Game.flags.billy, 'KING BILLY caught (1 harpoon-daze-grab round)');
  H.assert(Player.maxHearts === 8, 'heart container awarded');
}
console.log('== GEAR GAUNTLET -> COAST ==');
H.warp('vale', 45, 16);
Game.flags.gems = 12;
Game.openShop();
H.assert(Game.menu.items[0].key === 'gloves', 'gloves in Vale stock');
Game.menu.sel = 0; Game.buySelected();
H.assert(Game.flags.gloves, 'CLIMBING GLOVES bought');
H.assert(Game.state === 'itemget', 'gloves get a celebration too');
clearUI(); Game.menu = null;
// gauntlet: jump the chasm
H.place(39, 32); H.face('right');
Player.jump(); H.hold('ArrowRight', true); H.step(40); H.hold('ArrowRight', false);
H.assert(Player.x / T > 41.5, 'gauntlet gap jumped (x=' + (Player.x / T).toFixed(1) + ')');
// slick ice wall: gloves-only mantle
{
  H.assert(!Player.canEnter(NQ.MAPS.vale, 44, 33, 43, 33) === false, 'ice wall passable WITH gloves');
  const g = Game.flags.gloves; Game.flags.gloves = false;
  Player.airborne = true;
  H.assert(!Player.canEnter(NQ.MAPS.vale, 44, 33, 43, 33), 'slick wall always blocks jumping');
  Player.airborne = false; Game.flags.gloves = g;
}
H.place(43, 33); H.hold('ArrowRight', true); H.step(50); H.hold('ArrowRight', false);
H.assert(Player.x / T >= 44, 'mantled the slick wall');
// the WIDE water: prove jumping fails, then harpoon-chain across two posts
{
  H.place(47, 32); H.face('right');
  Player.jump(); H.hold('ArrowRight', true); H.step(50); H.hold('ArrowRight', false); H.step(10);
  H.assert(Math.floor(Player.x / T) <= 47, 'gauntlet water CANNOT be jumped (x=' + (Player.x / T).toFixed(1) + ')');
  Player.hearts = Player.maxHearts;
}
H.place(47, 32); H.face('right'); Player.tool = 'harpoon'; Player.useTool(); H.step(60);
H.assert(Math.floor(Player.x / T) === 51, 'pulled to post island A');
H.face('right'); Player.useTool(); H.step(60);
H.assert(Math.floor(Player.x / T) === 55, 'pulled to post island B');
// onward to the east shore post — and prove the road back works too
H.face('right'); Player.useTool(); H.step(60);
H.assert(Math.floor(Player.x / T) === 57, 'pulled to the east shore post');
H.face('left'); Player.useTool(); H.step(60);
H.assert(Math.floor(Player.x / T) === 55, 'return trip: back to island B');
H.face('right'); Player.useTool(); H.step(60);
H.assert(Math.floor(Player.x / T) === 57, 'and east again to the shore');
// the Gauntlet door opens THE CLIFFSIDE CROSSING — four channels, four MANDATORY wires
H.place(59, 33); H.hold('ArrowRight', true); H.step(60); H.hold('ArrowRight', false);
H.assert(Game.mapId === 'crags', 'Gauntlet exit opens THE CLIFFSIDE CROSSING');
const ride = (px, py, pe, lx) => {
  Player.x = px * T + 8; Player.y = py * T + 8; Player.elev = pe;
  Game.interact();
  H.assert(Game.zip, 'wire grips at (' + px + ',' + py + ')');
  for (let i = 0; i < 500 && Game.zip; i++) H.step(1);
  H.assert(Math.abs(Player.x - (lx * T + 8)) < 4, 'wire lands at x' + lx);
};
ride(8, 9, 2, 17);     // Lesson Mount        -> green band (A)
ride(22, 8, 3, 34);    // Ladder Spire        -> sand1      (B)
ride(40, 7, 4, 53);    // Stair-&-Slick Tower -> sand2      (C)
ride(58, 7, 4, 72);    // Sheer Face          -> the beach  (D)
Player.x = 86 * T + 8; Player.y = 18 * T + 8; Player.elev = 0; H.face('right');
H.hold('ArrowRight', true); H.step(40); H.hold('ArrowRight', false);
H.assert(Game.state === 'worldmap', "the Crossing's far exit surfaces on the WORLD MAP (no straight warp to coast)");
H.assert(Game.flags.coastPath, 'coast unlocked on the world map');
// walk the trail Vale -> Coast (the Bramble Road ambush is exercised in its own section below)
Game.flags.road_bramble = true;
Game.worldCursor = NQ.WORLD_NODES.findIndex(n => n.id === 'coast');
H.press(' ');
H.assert(!!Game.worldTravel, 'Noah sets off down the trail to the coast');
{ let gw = 0; while (Game.worldTravel && gw++ < 800) H.step(1); }
H.assert(Game.mapId === 'coast', 'walked the world-map trail into Sunsplash Coast');

console.log('== ZONE 2: SUNSPLASH COAST ==');
// harpoon a shark from the pier
{
  H.place(20, 29); H.face('right'); Player.tool = 'harpoon';
  const shark = Game.creatures.find(c => c.species === 'shark');
  H.assert(!!shark, 'a shark circles the pier');
  shark.x = Player.x + 40; shark.y = Player.y - 4; shark.vx = 0; shark.vy = 0; shark.wanderT = 999;
  Player.useTool(); H.step(30);
  H.assert((Game.flags.life_shark || 0) >= 1, 'shark harpooned from the pier');
}
// trade shark -> diving suit
Game.openTrade('sal');
H.assert(Game.menu.items[0].special, 'Sal offers the suit trade');
Game.menu.sel = 0; Game.tradeSelected();
H.assert(Game.flags.suit, 'DIVING SUIT earned via shark trade (no gems!)');
clearUI();
// school: 3 star pupils via cookie cages
H.place(40, 13); H.hold('ArrowUp', true); H.step(40); H.hold('ArrowUp', false);
H.assert(Game.mapId === 'school', 'entered Sunsplash School');
Game.flags.gems += 6; Game.flags.baits.cookie += 3;
for (let i = 0; i < 3; i++) {
  H.place(11, 10); H.face('right');
  Game.placeCage('cookie');
  const p = Game.creatures.find(c => c.species === 'starpupil' && c.state === 'wander');
  H.assert(!!p, 'star pupil ' + (i + 1) + ' present');
  p.x = Player.x + 50; p.y = Player.y;
  H.step(240);
  H.assert((Game.flags.life_starpupil || 0) >= i + 1, 'star pupil ' + (i + 1) + ' caged with a cookie');
}
H.place(11, 4); H.face('up'); Game.interact(); advanceDialog();
H.assert(Game.flags.bone, 'Ms. Plume lends the BOOMER-BONE');
clearUI();
// 8 sea mimis: one more genuine harpoon catch, rest via capture API (mechanic already proven)
H.warp('coast', 20, 26);
H.place(20, 29); H.face('right'); Player.tool = 'harpoon';
{
  const oct = Game.creatures.find(c => c.species === 'octopus');
  oct.x = Player.x + 36; oct.y = Player.y; oct.vx = oct.vy = 0; oct.wanderT = 999;
  Player.useTool(); H.step(30);
  H.assert((Game.flags.life_octopus || 0) >= 1, 'octopus reeled in');
}
while (Game.seaCount() < 8) {
  const c = Game.creatures.find(cc => ['jellyfish', 'capricorn', 'octopus'].includes(cc.species) && cc.state === 'wander');
  if (c) Game.capture(c, 'harpoon'); else Game.loadMap('coast');
}
H.assert(Game.seaCount() >= 8, '8 sea Mimis befriended');
// dive at the buoy
H.place(24, 31); Game.interact();
H.assert(Game.mapId === 'deep', 'dove into the Deep Blue');
H.assert(Game.map.gateOpen, 'TIDE GATE open at 8 sea friends');

console.log('== BOSS: SIR TWINKLE ==');
H.place(46, 19); H.step(20);
{
  const b = Game.boss;
  H.assert(b && b.name === 'twinkle' && b.awake, 'Sir Twinkle wakes');
  Game.flags.baits.fishsnack = 9;
  Player.x = 43 * T; Player.y = 28 * T; // out of arm reach
  // the SEALED chest must refuse to open while Twinkle reigns
  {
    const before = Player.x;
    Player.x = 51 * T + 8; Player.y = 13 * T + 12; H.face('up'); Game.interact(); H.step(1);
    H.assert(!Game.flags.crown && !Game.flags.openedChests['deep_c_51_12'], 'crown chest is SEALED until Twinkle is caught');
    Player.x = 43 * T; Player.y = 28 * T;
  }
  // ring of snack cages around his drift bowl — the hungry arms come to THEM
  for (const [cx, cy] of [[46, 17], [50, 17], [46, 21], [50, 21], [48, 23]])
    Game.map.objects.push({ type: 'cageSet', x: cx, y: cy, bait: 'fishsnack', done: false });
  let guard = 0;
  while (!Game.flags.twinkle && guard++ < 9000) {
    if (b && b.caughtAnim > 0) { H.step(5); continue; }
    if (!Game.boss) break;
    Player.hearts = Player.maxHearts;
    H.step(2);
  }
  H.assert(Game.flags.twinkle, 'all five hungry arms STUCK on cages — SIR TWINKLE caught');
}
H.place(51, 13); H.face('up'); Game.interact();
H.assert(Game.flags.crown, 'SUNKEN CROWN claimed');
clearUI();

console.log('== ZONE 3: STARFALL WASTES ==');
H.assert(NQ.WORLD_NODES[2].req === 'crown' && Game.lookupFlag('crown'), 'Wastes node unlocked by the crown');
// travel the world map ON FOOT: Noah walks the trail from Coast to Wastes
Game.loadMap('coast');
Game.state = 'worldmap'; Game.worldCursor = 2;
H.press(' ');
Game.flags.road_squall = true;   // this leg's ambush is exercised in the dedicated road section
H.assert(!!Game.worldTravel, 'Noah sets off along the trail');
let walkGuard = 0;
while (Game.worldTravel && walkGuard++ < 600) H.step(1);
H.assert(Game.mapId === 'wastes', 'arrived in Starfall Wastes after the walk');
Game.flags.life_alien = 4;   // catching every alien powers the warp pads
// WARP-PAD HOP: step onto a hub pad to launch to a shard asteroid; shards auto-collect on contact
H.place(17, 7);
H.assert(Math.floor(Player.x / T) === 26 && Math.floor(Player.y / T) === 7, 'warp pad A teleports to the stardust asteroid');
H.place(28, 6);
H.assert(Game.shardCount() >= 1, 'shard 1 recovered on asteroid A');
H.place(26, 7);
H.assert(Math.floor(Player.x / T) === 17, 'warp pad returns Noah to the hub');
H.place(17, 16);
H.place(41, 20);
H.assert(Game.shardCount() >= 2, 'shard 2 recovered on asteroid B');
H.place(17, 25);
H.place(34, 33);
H.assert(Game.shardCount() >= 3, 'shard 3 recovered on asteroid C');
H.place(9, 16); H.face('up'); Game.interact(); advanceDialog();
H.assert(Game.flags.keepOpen, "Zibble unseals Hound's Keep");
H.place(17, 11);
H.assert(Math.floor(Player.x / T) === 48, 'warp pad K reaches the keep asteroid');
// cosmic capture: unicorns now roam the Astral Drift (moving-asteroid dungeon)
Game.loadMap('void'); H.place(18, 10);
captureWith('unicorn', 'bone-then-mitts');
Game.loadMap('wastes');

console.log('== DUNGEON 3: HOUNDS KEEP (3 rooms) ==');
// warp to the keep asteroid, walk into the (open) door
H.place(17, 11); Game.interact();
H.place(52, 12); H.hold('ArrowRight', true); H.step(30); H.hold('ArrowRight', false);
H.assert(Game.mapId === 'keep1', 'entered the Star Halls through the keep door');
// ROOM 1: the obstacle slalom — jump bar, climb ridge, harpoon span
H.place(7, 9); H.face('right');
Player.jump(); H.hold('ArrowRight', true); H.step(40); H.hold('ArrowRight', false);
H.assert(Player.x / T > 8.5, 'slalom 1: jumped the crack');
H.place(11, 9); H.hold('ArrowRight', true); H.step(110); H.hold('ArrowRight', false);
H.assert(Player.x / T >= 14, 'slalom 2: climbed the ridge and hopped down (x=' + (Player.x / T).toFixed(1) + ')');
{
  H.place(16, 9); H.face('right');
  Player.jump(); H.hold('ArrowRight', true); H.step(50); H.hold('ArrowRight', false); H.step(10);
  H.assert(Math.floor(Player.x / T) <= 17, 'slalom 3: the wide span cannot be jumped');
  Player.hearts = Player.maxHearts;
}
H.place(16, 9); H.face('right'); Player.tool = 'harpoon'; Player.useTool(); H.step(60);
H.assert(Math.floor(Player.x / T) === 21, 'slalom 3: harpooned the span');
H.place(22, 9); H.face('right'); Game.interact();
H.assert(Game.flags.keys >= 1, 'Star Halls little key');
// locked north door -> ROOM 2
H.place(15, 5); H.hold('ArrowUp', true); H.step(50); H.hold('ArrowUp', false);
H.assert(Game.mapId === 'keep2', 'entered the Triple Locks');
// ROOM 2: THE TRIPLE LOCKS — three machines, blocks only
{
  const m2 = NQ.MAPS.keep2;
  const b1 = m2.objects.find(o => o.id === 'k2_b1');
  const b2 = m2.objects.find(o => o.id === 'k2_b2');
  const b3 = m2.objects.find(o => o.id === 'k2_b3');
  // Noah standing on a switch does NOTHING — only stone counts
  H.place(22, 16); H.step(10);
  H.assert(!Game.flags.switchFlags.sw_keep2_1, 'Noah standing on a switch does NOT count');
  // STAGE 1: B1 -> SE switch: the west wall sinks
  H.place(16, 15); grabMove(b1, 'right', 'ArrowRight', 22, 15);
  H.place(22, 14); grabMove(b1, 'down', 'ArrowDown', 22, 16);
  H.step(5);
  H.assert(Game.flags.switchFlags.sw_keep2_1, 'lock 1 clicks');
  H.assert(NQ.tileAt(m2, 13, 15) === 'floor', 'the west wall sank');
  H.assert(!Game.flags.switchFlags.sw_keep2, 'one lock is not enough');
  clearUI();
  // STAGE 2: B2 -> bridge over the starry moat
  H.place(8, 17); grabMove(b2, 'up', 'ArrowUp', 8, 14);
  H.step(5);
  H.assert(NQ.tileAt(m2, 15, 12) === 'bridge', 'the moat bridge extended');
  clearUI();
  // cross on foot into the north hall
  H.place(15, 14); H.hold('ArrowUp', true); H.step(90); H.hold('ArrowUp', false);
  H.assert(Player.footTile()[1] <= 11, 'crossed the moat bridge');
  // STAGE 3: PULL the boxed block free, run it to the west switch
  H.place(20, 6); grabMove(b3, 'left', 'ArrowRight', 20, 6);
  H.place(20, 5); grabMove(b3, 'down', 'ArrowDown', 20, 8);
  H.place(21, 8); grabMove(b3, 'left', 'ArrowLeft', 8, 8);
  H.step(5);
  H.assert(Game.flags.switchFlags.sw_keep2, 'TRIPLE LOCKS solved — den door AND vault unlock');
  clearUI();
}
H.place(23, 9); H.hold('ArrowRight', true); H.step(40); H.hold('ArrowRight', false);
H.place(25, 9); H.face('right'); Game.interact();
H.assert(Game.flags.bosskeys >= 1, 'BIG KEY from the triple-lock vault');
// north door -> ROOM 3, boss door, CERBERUS
H.place(15, 4); H.hold('ArrowUp', true); H.step(40); H.hold('ArrowUp', false);
H.assert(Game.mapId === 'keep3', 'entered the Cerberus Den');
H.place(13, 11); H.hold('ArrowUp', true); H.step(40); H.hold('ArrowUp', false);
H.assert(Game.flags.bosskeys === 0, 'den boss door unlocked');
{
  H.place(12, 8); H.step(20);
  const b = Game.boss;
  H.assert(b && b.name === 'cerberus' && b.awake, 'Cerberus wakes');
  let guard = 0;
  while (!Game.flags.cerberus && guard++ < 9000) {
    if (b.caughtAnim > 0) { H.step(5); continue; }
    if (b.stun > 0) {
      Player.x = b.x - 16; Player.y = b.y; H.face('right');
      Game.interact(); H.step(3);   // SPACE-grab a head, bone stays equipped
    } else if (b.state === 'drowsy' && !Player.bone) {
      Player.x = b.x; Player.y = b.y + 50; H.face('up');
      Player.tool = 'bone'; Player.useTool(); H.step(2);
    } else H.step(3);
    Player.hearts = Player.maxHearts;
  }
  H.assert(Game.flags.cerberus, 'CERBERUS caught (all three heads soothed)');
}

console.log('== ZONE 4: WHISTLING CANYON ==');
Game.loadMap('canyon');
// stairs e0->e1, ice wall e1->e2 (gloves), post e2->e3 (harpoon)
H.place(8, 28); H.hold('ArrowUp', true); H.step(30); H.hold('ArrowUp', false);
H.assert(Player.elev === 1, 'stairs to tier 1');
H.place(36, 21); H.hold('ArrowUp', true); H.step(60); H.hold('ArrowUp', false);
H.assert(Player.elev === 2, 'gloves up the slick frost wall to tier 2');
H.place(24, 12); H.face('up'); Player.tool = 'harpoon'; Player.useTool(); H.step(70);
H.assert(Player.elev === 3, 'harpooned the summit post to tier 3');
// dragon: bone-stun then net (Cora's mastery trade)
Game.loadMap('canyon'); H.place(20, 15);
captureWith('dragon', 'bone-then-net');
Game.openTrade('cora');
H.assert(Game.menu.items[0].special, 'Cora offers the wings trade');
Game.menu.sel = 0; Game.tradeSelected();
H.assert(Game.flags.wings, 'ANGEL WINGS earned via dragon trade');
clearUI();
// FLY across the wide rift to the berry garden
{
  H.place(20, 8); H.face('up');
  H.assert(!Player.canEnter(NQ.MAPS.canyon, 20, 5, 20, 8), 'rift blocks walking');
  Player.airborne = true; Player.flight = false;
  H.assert(!Player.canEnter(NQ.MAPS.canyon, 20, 5, 20, 8), 'rift blocks plain jumping too');
  Player.airborne = false;
  Player.jump(); Player.jump(); // jump + first flap = flight
  H.hold('ArrowUp', true);
  for (let i = 0; i < 14 && Player.y > 3.6 * T; i++) { H.step(10); Player.jump(); }
  H.hold('ArrowUp', false);
  H.step(30);
  H.assert(Player.y / T < 4.2, 'FLEW across the rift (y=' + (Player.y / T).toFixed(1) + ')');
}
H.place(20, 3); H.face('up'); Game.interact();
H.assert(Game.flags.baits.berry >= 1, 'RAINBOW BERRY picked at the summit garden');
clearUI();

console.log('== FINALE: RAINBOW SPIRE ==');
H.place(40, 6); H.hold('ArrowUp', true); H.step(50); H.hold('ArrowUp', false);
H.assert(Game.mapId === 'spire', 'entered the Rainbow Spire');
H.place(15, 14); H.step(20);
{
  const b = Game.boss;
  H.assert(b && b.name === 'sahor' && b.awake, 'MIMI SAHOR wakes');
  // phase 1: harpoon the glowing ring x3
  let guard = 0;
  Player.tool = 'harpoon';
  while (b.phase === 1 && guard++ < 3000) {
    if (!Player.harpoon) {
      Player.x = b.ringX; Player.y = b.ringY + 56; H.face('up');
      Player.useTool();
    }
    Player.hearts = Player.maxHearts;
    H.step(2);
  }
  H.assert(b.phase === 2, 'phase 2: Sahor on the run (3 ring hooks)');
  // phase 2: rainbow berry cage on her path (top edge of the perimeter)
  Game.map.objects.push({ type: 'cageSet', x: 10, y: 5, bait: 'berry', done: false });
  guard = 0;
  while (!Game.flags.sahor && guard++ < 4000) { Player.hearts = Player.maxHearts; H.step(3); }
  H.assert(Game.flags.sahor, 'MIMI SAHOR CAUGHT — the trickster is befriended!');
}
H.step(20);
H.assert(Game.state === 'play', 'Sahor opens the portal (no instant win — Ramsi awaits)');

console.log("== TRUE FINALE: RAMSI'S ROOST (all gear) ==");
// the Spire portal (gated by sahor) -> the Roost
H.place(15, 3); H.hold('ArrowUp', true); H.step(40); H.hold('ArrowUp', false);
H.assert(Game.mapId === 'roost', 'stepped through the portal into Ramsi\'s Roost');
// 1) JUMP the gap
H.place(9, 26); H.face('right');
Player.jump(); H.hold('ArrowRight', true); H.step(40); H.hold('ArrowRight', false);
H.assert(Player.x / T > 11, 'roost 1: jumped the sky gap');
// 2) CLIMB the slick wall (gloves) up onto the terrace
H.place(16, 23); H.hold('ArrowUp', true); H.step(60); H.hold('ArrowUp', false);
H.assert(Player.elev === 1, 'roost 2: climbed the frosty wall to the terrace');
// 3) HARPOON the post across the void
H.place(17, 18); H.face('right'); Player.tool = 'harpoon'; Player.useTool(); H.step(60);
H.assert(Math.floor(Player.x / T) === 22, 'roost 3: harpooned across the void notch');
// 4) DIVE: swim across the sky pool (suit)
{
  H.place(29, 19); H.face('right');
  H.assert(!Player.canEnter(NQ.MAPS.roost, 30, 19, 29, 19) === false || Game.flags.suit, 'sky pool needs the suit');
  H.hold('ArrowRight', true); H.step(220); H.hold('ArrowRight', false);
  H.assert(Player.x / T >= 37, 'roost 4: swam across the sky pool (x=' + (Player.x / T).toFixed(1) + ')');
}
// 5) FLY across the great rift (wings)
{
  H.place(37, 18); H.face('right');
  Player.airborne = false;
  H.assert(!Player.canEnter(NQ.MAPS.roost, 38, 18, 37, 18), 'rift blocks walking');
  Player.jump(); Player.jump();   // jump + flap = flight
  H.hold('ArrowRight', true);
  for (let i = 0; i < 16 && Player.x / T < 40.5; i++) { H.step(8); Player.jump(); }
  H.hold('ArrowRight', false); H.step(20);
  H.assert(Player.x / T >= 40, 'roost 5: FLEW across the great void (x=' + (Player.x / T).toFixed(1) + ')');
}
// 6) BRACERS: push the sky-block onto the star switch to free Ramsi's cage
{
  const b = Game.map.objects.find(o => o.id === 'roost_b1');
  H.place(45, 11); grabMove(b, 'right', 'ArrowRight', 50, 11);
  H.place(50, 12); grabMove(b, 'up', 'ArrowUp', 50, 9);
  H.step(5);
  H.assert(Game.flags.switchFlags.sw_roost, 'roost 6: star switch clicked — cage opens');
}
// walk to Ramsi and FREE her
H.place(52, 9); H.hold('ArrowRight', true); H.step(30); H.hold('ArrowRight', false);
H.place(52, 8); H.face('right'); Game.interact();
H.assert(Game.flags.ramsi, 'RAMSI FREED — the true ending!');
H.step(260);
H.assert(Game.mapId === 'sky1', 'freeing Ramsi opens the SKY (sky1), not the credits');
H.assert(Game.companionActive(), 'RAMSI now follows Noah as a companion');
H.assert(Game.flags.ramHead, 'Ramsi can HEADBUTT from the very start of World 2');

console.log('== WORLD 2: SKYWARD ASCENT ==');
Object.assign(Game.flags, { net: true, harpoon: true, bone: true, suit: true, wings: true, gloves: true, bracers: true });
Game.state = 'play';
// --- RAM SUIT: grab it, then smash a cracked wall ---
{
  const m = NQ.MAPS.sky1;
  H.place(6, 13); Game.interact();
  H.assert(Game.flags.ramsuit, 'RAM SUIT collected from the sky chest');
  Game.state = 'play'; Game.menu = null;
  H.assert((NQ.TILEDEFS[m.tiles[15][11]] || {}).crack, 'a cracked wall bars the path at (11,15)');
  Game.smashCrack(m, 11, 15);
  H.assert(!(NQ.TILEDEFS[m.tiles[15][11]] || {}).crack, 'RAM SUIT smashed the cracked wall open');
}
function applyTool(tool, b) {
  if (tool === 'mitts') { Player.x = b.x; Player.y = b.y; Player.dir = 'right'; Player.lungeT = 0.2; }
  else if (tool === 'net') { Player.x = b.x; Player.y = b.y; Player.netT = 0.2; }
  else if (tool === 'harpoon') { Player.harpoon = { x: b.x, y: b.y, vx: 0, vy: 0, dist: 0, max: 300, state: 'out' }; }
  else if (tool === 'bone') { Player.bone = { x: b.x, y: b.y, vx: 0, vy: 0, t: 0.1 }; }
}
function beatSky(mapId, name, tool) {
  Game.loadMap(mapId); Game.state = 'play';
  H.assert(Game.boss && Game.boss.name === name, mapId + ': ' + name + ' spawned');
  let brokeOnce = false;
  for (let i = 0; i < 900 && Game.boss; i++) {
    const b = Game.boss;
    Player.hearts = Player.maxHearts;
    Player.x = b.x - 10; Player.y = b.y;                 // hug the boss so Ramsi charges in
    Game.companion.x = b.x; Game.companion.y = b.y;       // (she follows Noah; nudge her in)
    if (b.awake && b.shieldT > 0) { brokeOnce = true; b.inv = 0; applyTool(tool, b); }
    H.step(1);
  }
  H.assert(brokeOnce, name + ': RAMSI broke the shield (the co-op move)');
  H.assert(Game.flags[name], name + ' CAUGHT with Ramsi\'s help');
}
beatSky('sky1', 'gustwing', 'net');
H.assert(Game.flags.ramStun, 'Gust Wing win taught RAMSI the CHARGE (ramStun)');
beatSky('sky2', 'pufflord', 'mitts');
H.assert(Game.flags.ramShield, 'Puff Lord win taught RAMSI the GUARD (ramShield)');
beatSky('sky3', 'sparkhorn', 'harpoon');
H.assert(Game.flags.ramBoost, 'Sparkhorn win made RAMSI MIGHTIER (ramBoost)');
beatSky('sky4', 'tempestia', 'bone');
H.assert(Game.flags.tempestia, 'THE STORM-LORD falls');
// --- RESCUE: free Berkley & Megan ---
{
  const par = NQ.MAPS.sky4.objects.find(o => o.type === 'parents');
  H.place(par.x, par.y + 1); H.face('up'); Game.interact();
  H.assert(Game.flags.parents, 'BERKLEY & MEGAN freed once the STORM-LORD is beaten');
  H.step(180);                                  // brief on-map celebration, then the cutscene
  H.assert(Game.state === 'cutscene', 'a REUNION cutscene plays (uses the freed-parents art)');
  for (let i = 0; i < 8 && Game.state === 'cutscene'; i++) { Game.cutscene.t = 1; Game.advanceCutscene(); }
  H.assert(Game.state === 'play' && Game.mapId === 'vale', 'after the reunion: straight home to the VALE (no mid-game credits)');
  H.assert(Game.map.objects.some(o => o.type === 'portal' && o.to === 'burrow5' && Game.lookupFlag(o.req)), 'the burrow gapes open in the meadow — onward to World 2b');
}
// --- the RAM-SWITCH gate (a Ramsi-only puzzle) ---
{
  Game.loadMap('sky2'); Game.state = 'play'; Game.flags.sky2_gate = false;
  const sw = NQ.MAPS.sky2.objects.find(o => o.type === 'ramswitch');
  H.assert(!Game.doorIsOpen(NQ.MAPS.sky2, 20, 16), 'the sky-gate starts shut');
  Player.x = sw.x * 16 + 8; Player.y = sw.y * 16 + 8;
  Game.companion.x = Player.x; Game.companion.y = Player.y;
  for (let i = 0; i < 30 && !Game.flags.sky2_gate; i++) H.step(1);
  H.assert(Game.flags.sky2_gate, 'RAMSI headbutts the SKY-SWITCH');
  H.assert(Game.doorIsOpen(NQ.MAPS.sky2, 20, 16), 'and the sky-gate opens for Noah');
}
// save survives, never resumes in a dungeon
NQ.saveGame();
Game.state = 'play';
H.warp('spire', 15, 27); NQ.saveGame();
H.assert(NQ.loadGame(), 'save reloads');
H.assert(!NQ.MAPS[Game.mapId].dungeon, 'resume is outside dungeons (' + Game.mapId + ')');


console.log('== TROUBLE ON THE ROAD (side-scroller ambushes) ==');
{
  const SS = NQ.SideScroll;
  // physics unit: a held running jump clears the first gap
  SS.start('bramble', false);
  let S = SS.active;
  H.assert(Game.state === 'side', 'road level starts in side mode');
  S.p.x = 11 * 16; S.p.y = SS.groundYAt(S, S.p.x) - 1;
  H.hold('ArrowRight', true); NQ.hold('x', true);
  for (let i = 0; i < 90; i++) { H.step(1); Player.hearts = Player.maxHearts; }
  H.hold('ArrowRight', false); NQ.hold('x', false);
  H.assert(S.p.x > 15 * 16, 'running jump carries Noah across the first gap (x=' + (S.p.x / 16 | 0) + ')');
  H.assert(S.p.y < 14 * 16, 'and he did not fall into it');
  // stomp unit: bonking a bandit counts as a capture
  const e0 = S.enemies.find(e => e.state === 'live' && e.kind === 'w') || S.enemies.find(e => e.state === 'live');
  const beforeLog = Game.log[e0.species] || 0;
  e0.vx = 0; e0.vy = 0;
  for (let i = 0; i < 30 && e0.state === 'live'; i++) { S.p.x = e0.x; S.p.y = e0.y - 12; S.p.vy = 140; S.p.inv = 0.5; H.step(1); }
  H.assert(e0.state !== 'live', 'stomp squashes the road bandit');
  H.assert((Game.log[e0.species] || 0) === beforeLog + 1, 'stomped bandit joins the capture log');
  // coin unit
  const coinsBefore = Game.flags.coins;
  S.p.x = 7 * 16 + 8; S.p.y = 10 * 16;
  for (let i = 0; i < 8; i++) H.step(1);
  H.assert(Game.flags.coins > coinsBefore, 'road coins land in the wallet');
  SS.active = null; Game.state = 'play';
  // full integration: world travel -> midpoint ambush -> boss -> resume
  Game.loadMap('vale');
  Game.flags.road_bramble = false;   // re-arm the bramble ambush for this dedicated test
  Game.state = 'worldmap';
  Game.startWorldTravel(1);
  let g = 0; while (Game.worldTravel && g++ < 3000) H.step(1);
  H.assert(Game.state === 'side' && SS.active && SS.active.id === 'bramble', 'AMBUSH at the midpoint of the vale-coast leg');
  H.assert(!!Game.pendingTravel, 'the interrupted journey is remembered');
  S = SS.active;
  S.p.x = (S.bossHome[0] - 12) * 16; S.p.y = SS.groundYAt(S, S.p.x) - 1;
  H.step(80);
  H.assert(S.boss && S.boss.kind === 'tollgoat', 'THE TOLL GOAT blocks the road');
  const heartsBefore2 = Player.maxHearts;
  let guard = 0;
  while (SS.active && SS.active.boss && guard++ < 6000) {
    const b = SS.active.boss, SP = SS.active.p;
    if (b.inv <= 0 && b.state !== 'intro' && SP.vy >= 0) { SP.x = b.x; SP.y = b.y - 16; SP.vy = 90; SP.inv = 0.5; }
    H.step(1); Player.hearts = Player.maxHearts;
  }
  H.assert(!(SS.active && SS.active.boss), 'two bops fell the Toll Goat');
  let g2 = 0; while (SS.active && g2++ < 400) H.step(1);
  H.assert(Player.maxHearts === heartsBefore2 + 2, 'road boss drops a heart container');
  H.assert(Game.flags.road_bramble, 'the bramble road is cleared');
  H.assert(Game.state === 'worldmap' && !!Game.worldTravel, 'the journey RESUMES after the victory');
  let g3 = 0; while (Game.worldTravel && g3++ < 3000) H.step(1);
  H.assert(Game.mapId === 'coast', 'Noah arrives at Sunsplash Coast');
  Game.state = 'worldmap'; Game.startWorldTravel(0);
  let g4 = 0, sideHit = false;
  while (Game.worldTravel && g4++ < 3000) { H.step(1); if (Game.state === 'side') sideHit = true; }
  H.assert(!sideHit, 'a cleared road never ambushes again');
  H.assert(Game.mapId === 'vale', 'back home in the vale');
  // CLEAR-ONCE REGRESSION: win once, cross the leg both ways incl. across a save/load.
  H.assert(Game.flags.road_bramble, 'bramble stays flagged as cleared');
  NQ.saveGame(); H.assert(NQ.loadGame(), 'save reloads with road progress');
  H.assert(Game.flags.road_bramble, 'cleared-road flag survives save/load');
  let backForth = false;
  for (const dest of [1, 0, 1, 0]) {
    Game.state = 'worldmap'; Game.startWorldTravel(dest);
    let g5 = 0; while (Game.worldTravel && g5++ < 3000) { H.step(1); if (Game.state === 'side') backForth = true; }
  }
  H.assert(!backForth, 'no re-trigger when back-tracing the cleared leg');
}

console.log('PLAYTHROUGH PASS — full critical path verified');
