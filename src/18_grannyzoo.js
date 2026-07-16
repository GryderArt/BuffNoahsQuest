"use strict";
// ===================== GRANNY'S MENAGERIE (the zoo) =====================
// The inside of Granny's cottage is a living trophy room: every creature Noah
// has ever befriended comes to stay here, sorted into the right enclosure.
// It is DISPLAY ONLY — the animals wander their pens but cannot be re-caught.
// It re-populates from the player's inventory (flags.life_<species>) on entry.

// pen = { fx,fy,fw,fh: fence rectangle ; floor: interior tile ; ix,iy,iw,ih: where
//         animals stand ; species: which critters belong here }
const ZOO_PENS = {
  tank:   { fx: 2,  fy: 2, fw: 7, fh: 5, floor: 'water',    ix: 3,  iy: 3,  iw: 5, ih: 3,
            species: ['octopus', 'jellyfish', 'shark', 'capricorn'] },
  aviary: { fx: 13, fy: 2, fw: 7, fh: 5, floor: 'grass',    ix: 14, iy: 3,  iw: 5, ih: 3,
            species: ['condor'] },
  paddock:{ fx: 2,  fy: 9, fw: 7, fh: 5, floor: 'grass',    ix: 3,  iy: 10, iw: 5, ih: 3,
            species: ['sheep', 'ram', 'goat', 'snowhare', 'ibex', 'crab'] },
  starpen:{ fx: 13, fy: 9, fw: 7, fh: 5, floor: 'skyfloor', ix: 14, iy: 10, iw: 5, ih: 3,
            species: ['starpupil', 'alien', 'unicorn', 'cometpup', 'dragon'] },
};
const ZOO_PER_SPECIES = 4;   // how many of each species to show (keeps pens readable)

(function buildGrannyZoo() {
  if (typeof newMap !== 'function' || MAPS.grannyzoo) return;
  const m = newMap('grannyzoo', 22, 16, 'wood',
    { name: "Granny's Menagerie", song: 'vale', cliff: 'stone', zone: 'vale' });
  // outer walls
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'wall'); T(m, i, m.h - 1, 'wall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'wall'); T(m, m.w - 1, j, 'wall'); }
  // four fenced enclosures
  for (const k in ZOO_PENS) {
    const p = ZOO_PENS[k];
    R(m, p.fx, p.fy, p.fw, p.fh, 'fence');     // fence box
    R(m, p.ix, p.iy, p.iw, p.ih, p.floor);     // interior floor (water / grass / skyfloor)
  }
  // a perch in the aviary + a little colour in the paddock
  T(m, 16, 4, 'stump'); T(m, 4, 11, 'flowers'); T(m, 7, 11, 'flowers');
  // labels (in the central aisle, facing each pen)
  SIGN(m, 9, 4, "THE TANK — octopus, jellyfish, sharks & capricorns paddle here.");
  SIGN(m, 12, 4, "THE AVIARY — condors and other high-flyers roost here.");
  SIGN(m, 9, 11, "THE PADDOCK — sheep, rams, goats, hares, ibex & crabs graze here.");
  SIGN(m, 12, 11, "THE STAR PEN — star pupils, aliens, unicorns, comet pups & dragons.");
  SIGN(m, 10, 13, "GRANNY: Welcome to my menagerie, Noah! Every friend you've ever caught comes to stay. Go say hello!");
  // exit back to the meadow, just below the cottage door
  T(m, 11, 15, 'wood'); LINK(m, 11, 15, 'vale', 34, 9);
  m.start = { x: 11, y: 13 };
})();

// fill the pens from the player's current inventory; called on loadMap('grannyzoo')
if (typeof Game !== 'undefined') {
  Game.populateZoo = function (m) {
    if (!m || m.id !== 'grannyzoo') return;
    for (const k in ZOO_PENS) {
      const p = ZOO_PENS[k];
      // slot positions inside the pen
      const slots = [];
      for (let j = 0; j < p.ih; j++) for (let i = 0; i < p.iw; i++) slots.push([p.ix + i, p.iy + j]);
      let si = 0;
      for (const sp of p.species) {
        if (!CREATURES[sp]) continue;
        let n = Math.min(this.flags['life_' + sp] || 0, ZOO_PER_SPECIES);
        for (let q = 0; q < n && si < slots.length; q++) {
          const [ci, cj] = slots[si++];
          const c = makeCreature(sp, ci, cj, { x: p.ix, y: p.iy, w: p.iw, h: p.ih });
          c.display = true;                 // display only: never catchable
          c.dir = (si % 2) ? 1 : -1;
          c.wanderT = Math.random() * 2;
          this.creatures.push(c);
        }
      }
    }
  };
}
