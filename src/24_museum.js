"use strict";
// ===================== GRANNY'S GRAND MUSEUM =====================
// Granny's cottage grows five new wings off the menagerie, unlocking as the
// adventure unfolds (kid-visible progress = replay fuel):
//   COG HALL     (after GNASH)    — clockwork critters + stable friends on display
//   GEAR GALLERY (always)         — every gear & tool on pedestals; unfound = dark shapes
//   PILLOW DEN   (after reunion)  — Ramsi, SUPER RAMSI and all five Pillow-Kin, napping
//   TROPHY HALL  (after 1st boss) — a gold statue for every giant Noah has bested
//   THE WORKSHOP (after GNASH)    — the CREATURE COMBINER + pens for crafted rares (26_combiner)
(function () {
  if (typeof newMap !== 'function' || !MAPS.grannyzoo) return;

  // ---- new doors punched into the menagerie walls ----
  const z = MAPS.grannyzoo;
  const punch = (x, y, kind, req, msg, to, tx, ty) => {
    T(z, x, y, 'wood'); DOOR(z, x, y, kind, req, msg); LINK(z, x, y, to, tx, ty);
  };
  // forgiving gates: ANY evidence of the milestone opens the wing (saves differ in
  // which flags they carry — see Game.lookupFlag's mus_* aliases below)
  punch(4, 0, 'flag', 'mus_cog', 'COG HALL — opens when Noah reaches COGWERK CITY!', 'coghall', 12, 11);
  punch(10, 0, 'flag', 'mus_boss', 'TROPHY HALL — opens after your FIRST boss victory!', 'trophyhall', 17, 13);
  punch(17, 0, 'flag', null, '', 'gearhall', 12, 9);
  punch(0, 7, 'flag', 'mus_kin', 'PILLOW DEN — opens once you have met the Pillow-Kin!', 'pillowden', 15, 9);
  punch(21, 7, 'flag', null, '', 'workshop', 2, 15);   // the COMBINER is open from day one — recipes gate themselves
  SIGN(z, 3, 1, 'COG HALL up here — the clockwork wing!');
  SIGN(z, 11, 1, 'TROPHY HALL — every giant you ever bested, in gold!');
  SIGN(z, 16, 1, 'GEAR GALLERY — everything Noah has ever worn or wielded.');
  SIGN(z, 1, 8, 'PILLOW DEN — shhh... the Kin are napping.');
  SIGN(z, 20, 8, "THE WORKSHOP — Granny's friend COMBI joins creatures into RARE ones!");

  // any-evidence milestone aliases (old saves may carry different victory flags)
  const _lf = Game.lookupFlag;
  Game.lookupFlag = function (req) {
    const F = this.flags;
    if (req === 'mus_cog') return !!(F.gnash || F.intro_cog1 || F.cog_started || F.cog_cleared || F.road_gearline ||
      (F.starcells && Object.keys(F.starcells).some((k) => F.starcells[k])));
    if (req === 'mus_boss') return !!(F.billy || F.twinkle || F.cerberus || F.sahor || F.gustwing || F.pufflord ||
      F.sparkhorn || F.tempestia || F.mottle || F.thornback || F.geode || F.grub || F.gnash || F.gnashara || F.colossus);
    if (req === 'mus_kin') return !!(F.parents || F.ramsi || F.kin_0 || F.kin_1 || F.kin_2 || F.kin_3 || F.kin_4);
    return _lf.call(this, req);
  };

  // ---- shared: pen populator (same recipe as the menagerie) ----
  const PER = 4;
  function fillPens(game, m, PENS) {
    for (const k in PENS) {
      const p = PENS[k];
      const slots = [];
      for (let j = 0; j < p.ih; j++) for (let i = 0; i < p.iw; i++) slots.push([p.ix + i, p.iy + j]);
      let si = 0;
      for (const sp of p.species) {
        if (!CREATURES[sp]) continue;
        const n = Math.min(game.flags['life_' + sp] || 0, p.per || PER);
        for (let q = 0; q < n && si < slots.length; q++) {
          const [ci, cj] = slots[si++];
          const c = makeCreature(sp, ci, cj, { x: p.ix, y: p.iy, w: p.iw, h: p.ih });
          c.display = true; c.dir = (si % 2) ? 1 : -1; c.wanderT = Math.random() * 2;
          game.creatures.push(c);
        }
      }
    }
  }

  // ============ COG HALL ============
  const COG_PENS = {
    pests:  { fx: 2,  fy: 2, fw: 9, fh: 6, floor: 'cogfloor', ix: 3,  iy: 3, iw: 7, ih: 4,
              species: ['voltbug', 'coghopper', 'sparkdrone', 'steambull'], per: 3 },
    stable: { fx: 13, fy: 2, fw: 9, fh: 6, floor: 'grass', ix: 14, iy: 3, iw: 7, ih: 4,
              species: ['horse', 'lion'], per: 4 },
  };
  {
    const m = newMap('coghall', 24, 14, 'wood', { name: 'The Cog Hall', song: 'vale', cliff: 'stone', zone: 'vale' });
    for (let i = 0; i < m.w; i++) { T(m, i, 0, 'wall'); T(m, i, m.h - 1, 'wall'); }
    for (let j = 0; j < m.h; j++) { T(m, 0, j, 'wall'); T(m, m.w - 1, j, 'wall'); }
    for (const k in COG_PENS) { const p = COG_PENS[k]; R(m, p.fx, p.fy, p.fw, p.fh, 'fence'); R(m, p.ix, p.iy, p.iw, p.ih, p.floor); }
    SIGN(m, 6, 9, 'THE PEST PEN — volt-bugs, cog-hoppers, spark-drones & steam-bulls tick away here.');
    SIGN(m, 17, 9, 'THE STABLE PEN — horses & lions from THE ROYAL STABLEWORKS graze here.');
    SIGN(m, 12, 9, "GRANNY: Cogwerk critters! Don't worry — they're wound down and friendly now.");
    T(m, 12, 13, 'wood'); DOOR(m, 12, 13, 'flag'); LINK(m, 12, 13, 'grannyzoo', 4, 1);
    m.start = { x: 12, y: 11 };
  }

  // ============ GEAR GALLERY ============
  const GEAR_PEDES = [
    { icon: ['gear', 'sandal'], flag: 'sandals', label: 'SANDALS' },
    { icon: ['gear', 'glove'],  flag: 'gloves',  label: 'GLOVES' },
    { icon: ['gear', 'bracer'], flag: 'bracers', label: 'BRACERS' },
    { icon: ['gear', 'suit'],   flag: 'suit',    label: 'DIVE SUIT' },
    { icon: ['gear', 'wing'],   flag: 'wings',   label: 'WINGS' },
    { icon: ['tools', 'mitts'],   flag: null,      label: 'MITTS' },   // the starter tool — Noah ALWAYS has his mitts
    { icon: ['tools', 'net'],     flag: 'net',     label: 'NET' },
    { icon: ['tools', 'harpoon'], flag: 'harpoon', label: 'HARPOON' },
    { icon: ['tools', 'cage'],    flag: 'cage',    label: 'CAGE' },
    { icon: ['tools', 'bone'],    flag: 'bone',    label: 'BOOMER-BONE' },
  ];
  {
    const m = newMap('gearhall', 24, 12, 'wood', { name: 'The Gear Gallery', song: 'vale', cliff: 'stone', zone: 'vale' });
    for (let i = 0; i < m.w; i++) { T(m, i, 0, 'wall'); T(m, i, m.h - 1, 'wall'); }
    for (let j = 0; j < m.h; j++) { T(m, 0, j, 'wall'); T(m, m.w - 1, j, 'wall'); }
    OBJ(m, { type: 'artprop', x: 12, y: 2, key: 'banner' });
    GEAR_PEDES.forEach((g, i) => {
      const x = 3 + (i % 5) * 4, y = i < 5 ? 3 : 7;
      OBJ(m, { type: 'pedestal', x, y, icon: g.icon, flag: g.flag, label: g.label });
    });
    SIGN(m, 2, 9, 'GEAR ON TOP, TOOLS BELOW. Dark shapes are treasures Noah has not found... yet!');
    SIGN(m, 21, 9, 'GRANNY: My hero! Every adventure leaves something shiny behind.');
    T(m, 12, 11, 'wood'); DOOR(m, 12, 11, 'flag'); LINK(m, 12, 11, 'grannyzoo', 17, 1);
    m.start = { x: 12, y: 9 };
  }

  // ============ PILLOW DEN ============
  const KIN_DEN = [   // the four REAL Pillow-Kin (kin 0 only ever existed in the test bed)
    { kin: 1, color: '#d8b48a', name: 'MR. RAM' },
    { kin: 2, color: '#3a3550', name: 'BEAST MIMI' },
    { kin: 3, color: '#1a1a22', name: 'TOOTHLESS' },
    { kin: 4, color: '#e0a0d0', name: 'LUCKY' },
  ];
  {
    const m = newMap('pillowden', 18, 12, 'wood', { name: 'The Pillow Den', song: 'vale', cliff: 'stone', zone: 'vale' });
    for (let i = 0; i < m.w; i++) { T(m, i, 0, 'wall'); T(m, i, m.h - 1, 'wall'); }
    for (let j = 0; j < m.h; j++) { T(m, 0, j, 'wall'); T(m, m.w - 1, j, 'wall'); }
    KIN_DEN.forEach((k, i) => OBJ(m, { type: 'denpillow', x: 3 + i * 4, y: 4, kin: k.kin, color: k.color, label: k.name }));
    OBJ(m, { type: 'denramsi', x: 6, y: 8, supa: false });
    OBJ(m, { type: 'denramsi', x: 11, y: 8, supa: true });
    T(m, 4, 7, 'flowers'); T(m, 13, 7, 'flowers');
    SIGN(m, 2, 9, 'The four PILLOW-KIN nap here between adventures. Grey pillows still wait for their friends.');
    SIGN(m, 15, 9, 'RAMSI & SUPER RAMSI — the bravest clockwork hearts in any world.');
    T(m, 15, 11, 'wood'); DOOR(m, 15, 11, 'flag'); LINK(m, 15, 11, 'grannyzoo', 1, 7);
    m.start = { x: 15, y: 9 };
  }

  // ============ TROPHY HALL ============
  const TROPHIES = [
    { key: 'billy',      label: 'BILLY' },        { key: 'twinkle',   label: 'SIR TWINKLE' },
    { key: 'cerberus',   label: 'CERBERUS', spr: 'cerb' }, { key: 'sahor', label: 'SAHOR' },
    { key: 'gustwing',   label: 'GUSTWING' },     { key: 'pufflord',  label: 'PUFF LORD' },
    { key: 'sparkhorn',  label: 'SPARKHORN' },    { key: 'tempestia', label: 'TEMPESTIA' },
    { key: 'mottle',     label: 'THE MOTTLE' },   { key: 'thornback', label: 'THORNBACK' },
    { key: 'geode',      label: 'GEODE GOLEM' },  { key: 'grub',      label: 'THE GRUB' },
    { key: 'blazagon',   label: 'BLAZAGON', fn: (F, L) => F.blazagon || (L.blazagon || 0) > 0, creature: 'blazagon' },
    { key: 'gnash',      label: 'GNASH' },
    { key: 'road_bramble', label: 'TOLL GOAT',  creature: 'ram' },
    { key: 'road_squall',  label: 'GALE GULL',  creature: 'condor' },
    { key: 'road_meteor',  label: 'COMET WOLF', creature: 'cometpup' },
    { key: 'road_gearline', label: 'PISTON PETE', creature: 'steambull' },
    { key: 'road_steamway', label: 'GASKETTA',    creature: 'sparkdrone' },
    { key: 'road_skyrail',  label: 'RAIL KING',   creature: 'coghopper' },
    { key: 'gnashara',   label: 'GNASHARA' },
    { key: 'colossus',   label: 'STORM COLOSSUS', prop: 'colhelm', noGold: true },
  ];
  {
    const m = newMap('trophyhall', 34, 16, 'wood', { name: 'The Trophy Hall', song: 'vale', cliff: 'stone', zone: 'vale' });
    for (let i = 0; i < m.w; i++) { T(m, i, 0, 'wall'); T(m, i, m.h - 1, 'wall'); }
    for (let j = 0; j < m.h; j++) { T(m, 0, j, 'wall'); T(m, m.w - 1, j, 'wall'); }
    TROPHIES.forEach((t, i) => OBJ(m, { type: 'trophy', x: 2 + (i % 11) * 3, y: i < 11 ? 4 : 9, ...t }));
    OBJ(m, { type: 'artprop', x: 8, y: 12, key: 'velvetrope' });
    OBJ(m, { type: 'artprop', x: 25, y: 12, key: 'velvetrope' });
    OBJ(m, { type: 'artprop', x: 5, y: 2, key: 'banner' });
    OBJ(m, { type: 'artprop', x: 28, y: 2, key: 'banner' });
    SIGN(m, 2, 12, 'THE TROPHY HALL — a gold statue appears for every giant Noah bests. Grey stones wait for the rest!');
    SIGN(m, 31, 12, 'GRANNY: My word... and to think each one started as a bedtime worry.');
    T(m, 17, 15, 'wood'); DOOR(m, 17, 15, 'flag'); LINK(m, 17, 15, 'grannyzoo', 10, 1);
    m.start = { x: 17, y: 13 };
  }

  // ============ THE GRAND WORKSHOP (combiner machine lives in 26) ============
  // Roomy pens so the crafted family can properly ROAM — and a lagoon for mermaids.
  const RARE_PENS = {
    rares:   { fx: 2,  fy: 2, fw: 14, fh: 9, floor: 'grass',    ix: 3,  iy: 3, iw: 12, ih: 7,
               species: ['rainbowsheep', 'baalien', 'glittergoat', 'glimmerram'], per: 3 },
    mythics: { fx: 18, fy: 2, fw: 14, fh: 9, floor: 'skyfloor', ix: 19, iy: 3, iw: 12, ih: 7,
               species: ['pegasus', 'centaur', 'griffin', 'prismabeast'], per: 3 },
    lagoon:  { fx: 24, fy: 13, fw: 8,  fh: 6, floor: 'water',   ix: 25, iy: 14, iw: 6, ih: 3,
               species: ['mermaid'], per: 1 },   // ONE mermaid greets from the surface pool; the rest swim in THE AQUARIUM below
  };
  {
    const m = newMap('workshop', 34, 22, 'wood', { name: 'The Grand Workshop', song: 'vale', cliff: 'stone', zone: 'vale' });
    for (let i = 0; i < m.w; i++) { T(m, i, 0, 'wall'); T(m, i, m.h - 1, 'wall'); }
    for (let j = 0; j < m.h; j++) { T(m, 0, j, 'wall'); T(m, m.w - 1, j, 'wall'); }
    for (const k in RARE_PENS) { const p = RARE_PENS[k]; R(m, p.fx, p.fy, p.fw, p.fh, 'fence'); R(m, p.ix, p.iy, p.iw, p.ih, p.floor); }
    T(m, 9, 10, 'grass');                                               // rare-meadow gate: walk right in!
    T(m, 25, 10, 'skyfloor');                                           // mythic-field gate
    R(m, 25, 17, 6, 1, 'sand');                                         // the lagoon BEACH SHELF (pet the mermaids!)
    T(m, 27, 18, 'sand');                                               // lagoon gate onto the shelf
    T(m, 26, 13, 'shell'); T(m, 30, 18, 'shell');                       // lagoon beach touches
    OBJ(m, { type: 'buoy', x: 28, y: 15, to: 'aquarium', tx: 4, ty: 6, free: true, msg: 'Noah dives into COMBI\'s AQUARIUM!' });
    SIGN(m, 23, 12, 'THE DIVE POOL — hop on the buoy (SPACE) to visit the AQUARIUM: mermaids, sea-goats & more!');
    OBJ(m, { type: 'combiner', x: 12, y: 15 });
    NPC(m, 10, 16, 'combi', "COMBI: I'm COMBI, Granny's tinker-bot! Bring me the right friends and they'll JOIN HOOVES and transform into something WONDERFUL. Talk to me again by my machine!");
    OBJ(m, { type: 'artprop', x: 17, y: 2, key: 'banner' });
    OBJ(m, { type: 'artprop', x: 6, y: 13, key: 'velvetrope' });
    T(m, 3, 12, 'flowers'); T(m, 20, 12, 'flowers'); T(m, 5, 19, 'flowers');
    SIGN(m, 7, 11, 'THE RARE MEADOW — walk right in! SPACE to PET a friend (bring a snack and they will GOBBLE it).');
    SIGN(m, 24, 11, 'THE MYTHIC FIELD — walk among legends! SPACE to PET (even a griffin melts for a good scritch).');
    SIGN(m, 23, 19, 'THE DIVE POOL — the buoy leads DOWN to the aquarium, where the water-friends swim!');
    SIGN(m, 16, 17, 'HOW IT WORKS: creatures are never lost — they HOLD HOOVES and become ONE amazing new friend!');
    T(m, 0, 15, 'wood'); DOOR(m, 0, 15, 'flag'); LINK(m, 0, 15, 'grannyzoo', 20, 7);    // museum door (west)
    T(m, 17, 21, 'wood'); DOOR(m, 17, 21, 'flag'); LINK(m, 17, 21, 'vale', 40, 9);       // street door (south)
    SIGN(m, 18, 20, 'Street door below — out to the meadow. West door — into the museum.');
    m.start = { x: 3, y: 15 };
  }

  // ---- PET + FEED any display friend: SPACE near them (treat once per visit) ----
  const BAIT_NAMES = { hay: 'hay', clover: 'clover', tincan: 'tin can', fishsnack: 'fish snack', cookie: 'cookie', berry: 'rainbow berry' };
  Game.tryPetFriend = function () {
    let best = null, bd = 20;
    for (const c of this.creatures) {
      if (!c.display || c.state === 'gone') continue;
      const d = dist(Player.x, Player.y, c.x, c.y);
      if (d < bd) { bd = d; best = c; }
    }
    if (!best) return false;
    const def = CREATURES[best.species] || {};
    const order = [def.bait, 'hay', 'clover', 'tincan', 'fishsnack', 'cookie', 'berry'].filter(Boolean);
    const bkey = !best.fedOnce && order.find((k) => (this.flags.baits[k] || 0) > 0);
    if (bkey) {
      this.flags.baits[bkey]--; best.fedOnce = true;
      Audio2.jingle('gem');
      Particles.burst(best.x, best.y - 8, 'heart'); Particles.burst(best.x, best.y - 12, 'sparkle');
      this.toast((def.name || 'Your friend') + ' GOBBLES the ' + BAIT_NAMES[bkey] + '! New best friend!');
    } else {
      Audio2.jingle('talk');
      Particles.burst(best.x, best.y - 8, 'heart');
      this.toast((def.name || 'Your friend') + ' wiggles happily!');
    }
    best.wanderT = 0.9; best.dir = Player.x < best.x ? -1 : 1;          // turns to nuzzle Noah
    return true;
  };
  {
    const _int = Game.interact;
    Game.interact = function () {
      if (this.state === 'play' && this.tryPetFriend && this.tryPetFriend()) return;
      return _int.call(this);
    };
  }

  // ---- populate the new wings on entry (chained onto the zoo populator) ----
  const _pz = Game.populateZoo;
  Game.populateZoo = function (m) {
    _pz.call(this, m);
    if (!m) return;
    if (m.id === 'coghall') fillPens(this, m, COG_PENS);
    if (m.id === 'workshop') fillPens(this, m, RARE_PENS);
  };

  // ---- exterior facelift: big pixel facades OVERLAY the plain tile buildings ----
  // Solid wall tiles keep governing walkability; the art (assets/prop.<key>.png,
  // see SHEET_PROMPTS "PIXEL FACADES") draws over the footprint, anchored at the
  // building's base row so the row-sorted object pass occludes correctly. Until
  // the art lands, facades draw NOTHING and the vale looks exactly as before.
  Game.addMuseumFacades = function () {
    const v = MAPS.vale, co = MAPS.coast, w = MAPS.workshop;
    if (!v || v._museumFacades) return;
    v._museumFacades = true;
    OBJ(v, { type: 'facade', x: 32, y: 8, w: 6, key: 'grannyhouse' });        // the grown cottage
    // THE TINKER ANNEX: COMBI's street-front building beside the cottage
    R(v, 39, 5, 4, 4, 'wall');
    DOOR(v, 40, 8, 'flag');   // open from day one — missing ingredients are the real gate
    LINK(v, 40, 8, 'workshop', 17, 20);
    OBJ(v, { type: 'facade', x: 39, y: 8, w: 4, key: 'workshopannex' });
    // a little brick walk ties the cottage to the annex — one household, two doors
    for (let px = 33; px <= 41; px++) T(v, px, 9, 'path');
    T(v, 34, 10, 'path'); T(v, 40, 10, 'path');
    T(v, 38, 8, 'path');                                     // the side-yard gap between the buildings
    T(v, 32, 10, 'flowers'); T(v, 37, 10, 'flowers'); T(v, 42, 10, 'flowers');
    SIGN(v, 38, 9, 'THE TINKER ANNEX — COMBI joins creatures into RARE new friends! (It also connects to the museum inside.)');
    if (co) OBJ(co, { type: 'facade', x: 35, y: 11, w: 10, key: 'coasthouse' });  // the Sunsplash School
  };

  // ---- drawers ----
  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.artprop = function (c, o, ox, oy) {
    const spr = Sprites.props && Sprites.props[o.key];
    if (!spr) return;                                   // invisible until the art is delivered
    dspr(c, spr, ox - sprW(spr) / 2, oy + 8 - sprH(spr));
  };
  Game.OBJDRAW.facade = function (c, o) {
    const spr = Sprites.props && Sprites.props[o.key];
    if (!spr) return;                                   // invisible until the art is delivered
    const left = o.x * TILE - 8, baseY = (o.y + 1) * TILE;   // one-tile overhang split across both sides
    const targetW = o.w * TILE + 16, sc = targetW / sprW(spr);
    c.save();
    c.translate(left, baseY); c.scale(sc, sc);
    dspr(c, spr, 0, -sprH(spr));
    c.restore();
  };
  const goldCache = {};
  function goldize(spr, key) {
    if (goldCache[key]) return goldCache[key];
    const c = mkCanvas(spr.width, spr.height), x = c.getContext('2d');
    x.drawImage(spr, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(248,208,72,.6)'; x.fillRect(0, 0, spr.width, spr.height);
    x.fillStyle = 'rgba(120,80,20,.25)'; x.fillRect(0, spr.height / 2, spr.width, spr.height / 2);
    c.dens = spr.dens || 1;
    return (goldCache[key] = c);
  }
  function darkize(spr, key) {
    if (goldCache['d_' + key]) return goldCache['d_' + key];
    const c = mkCanvas(spr.width, spr.height), x = c.getContext('2d');
    x.drawImage(spr, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(30,24,46,.92)'; x.fillRect(0, 0, spr.width, spr.height);
    c.dens = spr.dens || 1;
    return (goldCache['d_' + key] = c);
  }
  function trophySprite(t) {
    const S = Sprites;
    if (S.props && S.props['trophy_' + t.key]) return S.props['trophy_' + t.key];      // future sheet-art slot
    if (t.prop && S.props && S.props[t.prop]) return S.props[t.prop];                  // boss-piece trophies (colossus helmet)
    const direct = S[t.spr || t.key];
    if (direct && direct.width) return direct;
    const cr = S.creatures[t.creature || t.key];
    if (cr && cr.right) return cr.right[0];
    return null;
  }
  Game.OBJDRAW.trophy = function (c, o, ox, oy) {
    const F = Game.flags, won = o.fn ? o.fn(F, Game.log) : (F[o.key] || (F.starcells && F.starcells[o.key]));
    // pedestal (museum-sheet art when delivered)
    const pedArt = Sprites.props && Sprites.props.pedestal;
    if (pedArt) {
      const g = won ? pedArt : darkize(pedArt, 'pedbase');
      dspr(c, g, ox - sprW(g) / 2, oy + 6 - sprH(g));
    } else {
      c.fillStyle = '#241a33'; c.fillRect(ox - 11, oy - 2, 22, 8);
      c.fillStyle = won ? '#c8a04c' : '#54585f'; c.fillRect(ox - 10, oy - 1, 20, 6);
      c.fillStyle = won ? '#e8c060' : '#6a6e78'; c.fillRect(ox - 10, oy - 1, 20, 2);
    }
    const spr = trophySprite(o) || (Sprites.props && Sprites.props.trophystar);
    if (spr) {
      const g = won ? (o.noGold ? spr : goldize(spr, o.key)) : darkize(spr, o.key);
      // statues get equal PRESENCE: height-first scaling (wide-flat beasts like
      // Cerberus no longer shrink into squat miniatures), width capped at 34
      const lw = sprW(g), lh = sprH(g), sc = Math.min(22 / lh, 34 / lw);
      c.save(); c.translate(ox, oy - ((Sprites.props && Sprites.props.pedestal) ? 8 : 2)); c.scale(sc, sc);
      dspr(c, g, -lw / 2, -lh);
      c.restore();
    } else {
      c.fillStyle = won ? '#f8d048' : '#3a3d45';
      c.save(); c.translate(ox, oy - 14); c.rotate(Game.time % 6.28 * (won ? 0.4 : 0));
      c.beginPath();
      for (let k = 0; k < 5; k++) { const a = k * 1.2566 - 1.57; c.lineTo(Math.cos(a) * 9, Math.sin(a) * 9); const a2 = a + 0.628; c.lineTo(Math.cos(a2) * 4, Math.sin(a2) * 4); }
      c.fill(); c.restore();
    }
    if (won && ((Game.time * 2 | 0) % 3) === 0) {
      c.fillStyle = '#fff'; c.fillRect(ox - 8 + ((Game.time * 37 | 0) % 16), oy - 22 + ((Game.time * 23 | 0) % 12), 1, 1);
    }
    drawText(c, won ? o.label : '???', ox, oy + 8, 5, won ? '#f8d048' : '#554a6a', '#241a33', 'center');
  };
  Game.OBJDRAW.pedestal = function (c, o, ox, oy) {
    const owned = !o.flag || !!Game.flags[o.flag];
    const base = Sprites.props && Sprites.props.gearpede;
    if (base) dspr(c, base, ox - sprW(base) / 2, oy + 7 - sprH(base));
    else {
      c.fillStyle = '#241a33'; c.fillRect(ox - 9, oy - 2, 18, 7);
      c.fillStyle = '#8a94a8'; c.fillRect(ox - 8, oy - 1, 16, 5);
      c.fillStyle = '#c8d0dc'; c.fillRect(ox - 8, oy - 1, 16, 2);
    }
    const set = Sprites[o.icon[0]], spr = set && set[o.icon[1]];
    if (spr) {
      const g = owned ? spr : darkize(spr, 'ped_' + o.icon[1]);
      c.save(); c.translate(ox, oy - (base ? 9 : 4) + Math.sin(Game.time * 2 + ox) * (owned ? 1.5 : 0)); c.scale(1.6, 1.6);
      dspr(c, g, -sprW(g) / 2, -sprH(g));
      c.restore();
      if (owned) { c.fillStyle = 'rgba(248,236,112,.25)'; c.beginPath(); c.ellipse(ox, oy - 10, 10, 12, 0, 0, 7); c.fill(); }
    }
    drawText(c, owned ? o.label : '???', ox, oy + 7, 5, owned ? '#9adcf8' : '#554a6a', '#241a33', 'center');
  };
  const plumpTints = {};
  function tintedPlump(col) {
    if (plumpTints[col]) return plumpTints[col];
    const spr = Sprites.props.plump;
    const c2 = mkCanvas(spr.width, spr.height), x = c2.getContext('2d');
    x.drawImage(spr, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = col; x.globalAlpha = 0.5; x.fillRect(0, 0, spr.width, spr.height);
    c2.dens = spr.dens || 1;
    return (plumpTints[col] = c2);
  }
  Game.OBJDRAW.denpillow = function (c, o, ox, oy) {
    const found = !!Game.flags['kin_' + o.kin];
    const col = found ? o.color : '#3a3d45';
    const kspr = found && Sprites.npcs && Sprites.npcs['kin' + o.kin];
    if (!kspr && Sprites.props && Sprites.props.plump) {   // the pillow only WAITS — rescued pets stand on a dais
      const g = tintedPlump(col);
      dspr(c, g, ox - sprW(g) / 2, oy + 3 - sprH(g));
    } else if (!kspr) {
    c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(ox, oy - 5, 12, 8.5, 0, 0, 7); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(ox, oy - 5.5, 10.5, 7, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(ox - 3, oy - 8, 5.5, 3, -0.4, 0, 7); c.fill();
    }
    if (found) {
      if (kspr) {                                  // rescued: the pet itself, RAMSI-sized, pillow retired
        const bob = Math.sin(Game.time * 1.6 + o.kin) * 1;
        c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(ox, oy + 3, 14, 4, 0, 0, 7); c.fill();
        c.fillStyle = '#8a5c2c'; c.beginPath(); c.ellipse(ox, oy + 2, 12.5, 3, 0, 0, 7); c.fill();
        const lw = sprW(kspr), lh = sprH(kspr), sc = Math.min(26 / lw, 30 / lh);
        c.save(); c.translate(ox, oy + 2 + bob); c.scale(sc, sc);
        dspr(c, kspr, -lw / 2, -lh);
        c.restore();
      } else {
        const br = ((Game.time + o.kin) % 3) < 2.6;
        c.fillStyle = '#241a33';
        if (br) { c.fillRect(ox - 4, oy - 6, 3, 1); c.fillRect(ox + 2, oy - 6, 3, 1); }
        else { c.fillRect(ox - 4, oy - 7, 2, 2); c.fillRect(ox + 2, oy - 7, 2, 2); }
      }
      drawText(c, 'z', ox + 9, oy - 18 - ((Game.time * 6 | 0) % 3), 6, '#9adcf8');
    } else drawText(c, '?', ox - 2, oy - 9, 7, '#554a6a');
    drawText(c, found ? o.label : '???', ox, oy + 5, 5, found ? '#9adcf8' : '#554a6a', '#241a33', 'center');
  };
  Game.OBJDRAW.denramsi = function (c, o, ox, oy) {
    const show = !o.supa || Game.flags.colossus;
    const spr = o.supa ? Sprites.ramsiSuper : Sprites.ramsi;
    c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(ox, oy, 14, 4, 0, 0, 7); c.fill();
    c.fillStyle = '#8a5c2c'; c.beginPath(); c.ellipse(ox, oy - 1, 12.5, 3, 0, 0, 7); c.fill();
    if (spr && spr.width) {
      const g = show ? spr : darkize(spr, o.supa ? 'sram' : 'ram');
      const lw = sprW(g), lh = sprH(g), sc = Math.min(26 / lw, 30 / lh);
      c.save(); c.translate(ox, oy - 2 + Math.sin(Game.time * 1.6 + (o.supa ? 2 : 0)) * 1.2); c.scale(sc, sc);
      dspr(c, g, -lw / 2, -lh);
      c.restore();
    }
    if (o.supa && show) { c.fillStyle = 'rgba(248,236,112,.2)'; c.beginPath(); c.ellipse(ox, oy - 14, 14, 16, 0, 0, 7); c.fill(); }
    drawText(c, o.supa ? (show ? 'SUPER RAMSI' : '???') : 'RAMSI', ox, oy + 6, 5, show ? '#f8d048' : '#554a6a', '#241a33', 'center');
  };
})();
