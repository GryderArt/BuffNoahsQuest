// GRANNY'S GRAND MUSEUM: five wings off the menagerie, gated by adventure progress,
// showing creatures, gear, kin, and gold boss trophies. Display-only, crash-free.
const H = require('./harness'); const { NQ } = H;
const { Game, MAPS } = NQ;
H.startPlay();

// wing doors punched into the zoo with the right gates
const z = MAPS.grannyzoo;
const door = (x, y) => z.doors[x + ',' + y];
H.assert(door(4, 0) && door(4, 0).req === 'mus_cog', 'COG HALL door gated on reaching Cogwerk');
H.assert(door(10, 0) && door(10, 0).req === 'mus_boss', 'TROPHY HALL door gated on the first boss');
H.assert(door(17, 0) && !door(17, 0).req, 'GEAR GALLERY always open');
H.assert(door(0, 7) && door(0, 7).req === 'mus_kin', 'PILLOW DEN gated on meeting the Kin');
H.assert(door(21, 7) && !door(21, 7).req, 'WORKSHOP open from day one (recipes gate themselves)');
// forgiving gates: ANY evidence works — an old save with only intro_cog1 still gets in
H.assert(!Game.doorIsOpen(z, 4, 0), 'cog wing shut on a truly fresh save');
Game.flags.intro_cog1 = true;
H.assert(Game.doorIsOpen(z, 4, 0), 'having SEEN Cogwerk is evidence enough (intro_cog1)');
delete Game.flags.intro_cog1;
Game.flags.mottle = true;
H.assert(Game.doorIsOpen(z, 10, 0), 'ANY boss victory opens the trophy hall (mottle)');
Game.flags.kin_2 = true;
H.assert(Game.doorIsOpen(z, 0, 7), 'ANY rescued Kin opens the den');
delete Game.flags.mottle; delete Game.flags.kin_2;
// every wing has a VISIBLE exit door set into its wall
for (const [mid, key] of [['coghall', '12,13'], ['gearhall', '12,11'], ['pillowden', '15,11'], ['trophyhall', '17,15'], ['workshop', '0,15'], ['workshop', '17,21']]) {
  H.assert(MAPS[mid].doors[key] && Game.doorIsOpen(MAPS[mid], +key.split(',')[0], +key.split(',')[1]), mid + ' exit door visible + open @' + key);
}

// gear gallery: 10 pedestals, dark until owned
Game.loadMap('gearhall');
const peds = MAPS.gearhall.objects.filter(o => o.type === 'pedestal');
H.assert(peds.length === 10, '10 gear/tool pedestals');
Game.flags.mitts = true; Game.flags.net = true;
H.render();

// trophy hall: a statue slot for EVERY big boss (22)
Game.loadMap('trophyhall');
const tr = MAPS.trophyhall.objects.filter(o => o.type === 'trophy');
H.assert(tr.length === 22, '22 trophy pedestals (got ' + tr.length + ')');
Game.flags.billy = true; Game.flags.gnash = true; Game.flags.road_gearline = true; Game.flags.colossus = true;
H.render(); H.shot('museum_trophies');

// pillow den: 5 kin pillows + Ramsi + Super Ramsi
Game.loadMap('pillowden');
const dp = MAPS.pillowden.objects.filter(o => o.type === 'denpillow');
const dr = MAPS.pillowden.objects.filter(o => o.type === 'denramsi');
H.assert(dp.length === 4 && dr.length === 2, '4 REAL kin pillows + 2 Ramsi displays (phantom kin-0 retired)');
H.assert(!dp.some(o => o.kin === 0), 'no pillow for kin 0 — it only ever existed in the test bed');
H.assert(dp.every(o => NQ.Sprites.npcs['kin' + o.kin]), 'every den pillow has REAL kin art to show');
Game.flags.kin_1 = true; Game.flags.kin_2 = true;
H.render(); H.shot('museum_den');

// cog hall: populates from life_ counts, display-only
Game.flags.life_voltbug = 3; Game.flags.life_steambull = 2; Game.flags.life_horse = 2; Game.flags.life_lion = 1;
Game.loadMap('coghall');
const disp = Game.creatures.filter(c => c.display);
H.assert(disp.length >= 8, 'cog hall pens fill from the log (' + disp.length + ' on display)');
H.assert(disp.every(c => c.display), 'all display-only');
H.assert(disp.some(c => c.species === 'horse') && disp.some(c => c.species === 'lion'), 'stable friends included');
H.render();

// workshop: combiner machine + rare pens fill with crafted friends
Game.flags.life_rainbowsheep = 1; Game.flags.life_griffin = 1;
Game.loadMap('workshop');
H.assert(MAPS.workshop.objects.some(o => o.type === 'combiner'), 'the COMBINER machine is installed');
H.assert(MAPS.workshop.objects.some(o => o.type === 'npc' && o.who === 'combi'), 'COMBI the tinker-bot is home');
const rares = Game.creatures.filter(c => c.display);
H.assert(rares.some(c => c.species === 'rainbowsheep') && rares.some(c => c.species === 'griffin'), 'crafted rares strut in their pens');
H.render(); H.shot('museum_workshop');

// zoo still populates as before
Game.flags.life_sheep = 2;
Game.loadMap('grannyzoo');
H.assert(Game.creatures.some(c => c.display && c.species === 'sheep'), 'the classic menagerie still fills');
H.render(); H.shot('museum_zoo_doors');
// ---- exterior facades: overlay slots + the Tinker Annex street building ----
H.assert(MAPS.vale.objects.some(o => o.type === 'facade' && o.key === 'grannyhouse'), 'cottage facade slot in the vale');
H.assert(MAPS.vale.objects.some(o => o.type === 'facade' && o.key === 'workshopannex'), 'Tinker Annex facade slot');
H.assert(MAPS.coast.objects.some(o => o.type === 'facade' && o.key === 'coasthouse'), 'school facade slot on the coast');
H.assert(MAPS.vale.doors['40,8'] && !MAPS.vale.doors['40,8'].req, 'annex street door open from day one');
// round trip: vale -> workshop (street door) -> back out
Game.loadMap('vale');
const link = MAPS.vale.links && MAPS.vale.links['40,8'];
Game.loadMap('workshop');
H.assert(MAPS.workshop.links && Object.values(MAPS.workshop.links).some(l => l.map === 'vale' || (l.to === 'vale')), 'workshop has a street exit back to the vale');
// facades draw nothing until art lands; with art injected they render at the footprint
Game.loadMap('vale');
NQ.Player.x = 34 * 16; NQ.Player.y = 12 * 16;
H.render();                                          // no art: unchanged, no crash
const cnv = NQ.mkCanvas ? null : null;
{ // placeholder art: a big test-only house so anchoring is visible in the shot
  const mk = (w, h, col, roof) => { const c2 = H.canvasLike ? H.canvasLike(w, h) : (() => { const cc = require('canvas').createCanvas(w, h); return cc; })(); const x = c2.getContext('2d');
    x.fillStyle = '#241a33'; x.fillRect(0, 0, w, h);
    x.fillStyle = col; x.fillRect(2, h * 0.3, w - 4, h * 0.7 - 2);
    x.fillStyle = roof; x.beginPath(); x.moveTo(0, h * 0.34); x.lineTo(w / 2, 2); x.lineTo(w, h * 0.34); x.fill();
    x.fillStyle = '#241a33'; x.fillRect(w * 0.34, h * 0.72, w * 0.14, h * 0.26);
    c2.dens = 1; return c2; };
  NQ.Sprites.props.grannyhouse = mk(112, 96, '#e8d8b0', '#c8743c');
  NQ.Sprites.props.workshopannex = mk(72, 80, '#9ad0c8', '#2c8880');
}
H.render(); H.shot('vale_facades');
// ---- the PETTING PENS: walk in, pet, feed, and nobody escapes ----
for (const sp of ['rainbowsheep', 'glittergoat', 'pegasus', 'mermaid']) Game.flags['life_' + sp] = 5;
Game.loadMap('workshop');
const wsm = MAPS.workshop;
H.assert(wsm.tiles[10][9] === 'grass' && wsm.tiles[10][25] === 'skyfloor' && wsm.tiles[18][27] === 'sand', 'gate openings in all three pens');
H.assert(wsm.tiles[17][27] === 'sand', 'the lagoon has a beach shelf to pet mermaids from');
// crafting multiples fills the pens — capped at 3 each
const rb = Game.creatures.filter(c => c.display && c.species === 'rainbowsheep');
H.assert(rb.length === 3, 'craft 5 rainbow sheep -> THREE roam the meadow (cap works)');
// Noah walks IN through the gate
NQ.Player.x = 9 * 16 + 8; NQ.Player.y = 11 * 16 + 8; NQ.Player.elev = 0;
H.hold('ArrowUp', true); H.step(40); H.hold('ArrowUp', false);
H.assert(NQ.Player.footTile()[1] <= 9, 'Noah strolls INTO the rare meadow through its gate');
// PET: hearts + wiggle
const friend = rb[0];
NQ.Player.x = friend.x; NQ.Player.y = friend.y + 6;
Game.toasts = [];
Game.interact();
H.assert(Game.toasts.some(t => /wiggles happily|GOBBLES/.test(t.text)), 'SPACE pets the friend');
// FEED: with a snack in the bag, first pet becomes a treat (consumes ONE, once per visit)
Game.flags.baits.clover = 2; friend.fedOnce = false;
Game.toasts = [];
Game.interact();
H.assert(Game.flags.baits.clover === 1 && Game.toasts.some(t => /GOBBLES/.test(t.text)), 'the friend gobbles ONE clover');
Game.toasts = [];
Game.interact();
H.assert(Game.flags.baits.clover === 1 && Game.toasts.some(t => /wiggles happily/.test(t.text)), 'seconds are pets, not snacks (once per visit)');
// Ramsi mingles WITHOUT knocking anyone (her charge-stun ignores pen friends)
Game.flags.ramsi = true; Game.flags.world2 = true; Game.flags.ramStun = true;
{
  const f2 = Game.creatures.find(c => c.display);
  Game.companion.x = f2.x; Game.companion.y = f2.y;
  for (let i = 0; i < 30; i++) H.step(1);
  H.assert(f2.stun <= 0, "Ramsi's charge-stun never knocks a pen friend");
}
// containment: 600 frames of mingling — every friend stays leashed to its pen
for (let i = 0; i < 600; i++) H.step(1);
for (const c of Game.creatures) {
  if (!c.display) continue;
  const ok = c.x >= (c.home.x - 1.5) * 16 && c.x <= (c.home.x + c.home.w + 1.5) * 16 &&
             c.y >= (c.home.y - 1.5) * 16 && c.y <= (c.home.y + c.home.h + 1.5) * 16;
  H.assert(ok, c.species + ' stays leashed to its pen (open gate or not)');
}
console.log('MUSEUM PASS — five gated wings, pedestals, trophies, kin den, PETTING pens, facade overlays all live');
