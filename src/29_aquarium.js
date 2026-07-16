"use strict";
// ===================== COMBI'S AQUARIUM (underground, under the Tinker Annex) =====================
// A buoy in the Workshop dive-pool drops Noah into a warm glass aquarium where the crafted
// MERMAIDS and CAPRICORNS swim, plus a school of ambient reef friends (seahorse, angelfish,
// pufferfish, starfish). Swim through, PET them (SPACE). A second bubble surfaces at the
// long-unused MINI LAKE on the Vale's south side — so the mermaid pond and the lake connect.
(function () {
  // ---- a deep-water PARALLAX backdrop: far silhouettes + light rays drift at ~0.4x ----
  // atmospheric depth OVERLAY that FILLS the whole view (parallax = drifts slower than the camera)
  Game.drawAquariumBg = function (c, camX, camY) {
    const t = Game.time, px = camX * 0.4, art = Sprites.scenes && Sprites.scenes.aquariumbg;
    c.save();
    c.translate(camX, camY);                                   // cancel the world translate -> pure SCREEN space (fills top-to-bottom)
    if (art) {                                                 // a painted far backdrop tiled across the whole view
      c.globalAlpha = 1;
      const iw = art.width, oxs = -(((px * 0.5) % iw) + iw) % iw;
      for (let x = oxs - iw; x < VW + iw; x += iw) { try { c.drawImage(art, 0, 0, art.width, art.height, x, 0, iw, VH); } catch (e) {} }
      c.globalAlpha = 1;
    } else {                                                   // no art loaded: a deep gradient so it is never bare
      const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#1e5f8c'); g.addColorStop(1, '#0a2c48');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    }
    // FAR reef silhouettes hang in the upper water
    c.fillStyle = 'rgba(10,44,70,.26)';
    for (let k = 0; k < 9; k++) {
      const sx = ((k * 132 - px * 0.4) % (VW + 220) + VW + 220) % (VW + 220) - 110;
      const h = 26 + (k % 3) * 16;
      c.beginPath(); c.moveTo(sx - 22, 0); c.lineTo(sx, h); c.lineTo(sx + 22, 0); c.fill();
    }
    // slow sun-rays + drifting motes for a sense of deep water (full height)
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++) {
      const rx = ((k * 150 - px * 0.2 + Math.sin(t * 0.2 + k) * 14) % (VW + 240) + VW + 240) % (VW + 240) - 120;
      c.fillStyle = 'rgba(150,220,255,.05)';
      c.beginPath(); c.moveTo(rx, 0); c.lineTo(rx + 34, 0); c.lineTo(rx + 74, VH); c.lineTo(rx + 40, VH); c.fill();
    }
    c.restore();
    for (let k = 0; k < 24; k++) {
      const mx = ((k * 61 - px * 0.6) % VW + VW) % VW, my = ((k * 47 + t * 8) % VH);
      c.fillStyle = 'rgba(200,230,255,' + (0.08 + (k % 3) * 0.05) + ')'; c.fillRect(mx, my, 1, 1);
    }
    c.restore();
  };

  // ---- new AMBIENT underwater creatures (always in the tank; display-only exhibit) ----
  Object.assign(CREATURES, {
    seahorse:   { name: 'Seahorse',    habitat: 'water', sea: true, spd: 10, catch: ['net','harpoon','cage'], bait: 'fishsnack' },
    angelfish:  { name: 'Angelfish',   habitat: 'water', sea: true, spd: 14, catch: ['net','harpoon','cage'], bait: 'fishsnack', sparkle: true },
    pufferfish: { name: 'Pufferfish',  habitat: 'water', sea: true, spd: 8,  catch: ['net','harpoon','cage'], bait: 'fishsnack' },
    starfish:   { name: 'Starfish',    habitat: 'water', sea: true, spd: 5,  catch: ['mitts','net','cage'], bait: 'fishsnack' },
    mermaidsea: { name: 'Deep Mermaid',habitat: 'water', sea: true, spd: 12, catch: [], bait: null, sparkle: true },
  });

  // ---- placeholder pixel art (sheet.aquarium overrides these; see SHEET_PROMPTS) ----
  const G = {
    seahorse: ['..kk..', '.kYYk.', 'kYeYk.', '.kYYk.', '.kYYk.', '.kYk..', 'kYYk..', '.kk...'],
    angelfish: ['...k....', '..kWk...', '.kWWWk.k', 'kWBWBWkk', 'kWWWWWk.', '.kWWWk.k', '..kWk...', '...k....'],
    pufferfish: ['.k.k.k..', 'kPkPkPk.', '.kPPPk..', 'kPPePPk.', '.kPPPk..', 'kPkPkPk.', '.k.k.k..'],
    starfish: ['...k....', '..kRk...', '.kRRRk..', 'kRRRRRk.', 'kkRRRkk.', '.k.k.k..'],
    mermaidsea: ['..kkkk..', '.kSeSk..', '.kSSSk..', '.kTTSk..', 'kTTTTk..', '.kTTTk..', 'kTkTTk..', '.k.kk...'],
  };
  const PAL = {
    seahorse: { Y: '#f8c048', e: '#241a33' },
    angelfish: { W: '#f8f0c0', B: '#4878e8' },
    pufferfish: { P: '#f89858', e: '#241a33' },
    starfish: { R: '#e86a6a' },
    mermaidsea: { S: '#f8c896', T: '#40c0b8' },
  };
  function installAquariumSprites() {
    const S = Sprites;
    const hasExt = (k) => (typeof EXT_ART !== 'undefined') && EXT_ART['creature.' + k + '.a'];
    for (const k of Object.keys(G)) {
      if (hasExt(k)) continue;
      if (S.creatures[k] && S.creatures[k].right && S.creatures[k].right[0]) continue;
      const w = Math.max(...G[k].map(r => r.length)), g = G[k].map(r => r.padEnd(w, '.'));
      const a = buildSprite(g, PAL[k]), b = buildSprite(hopFrame(g), PAL[k]);
      S.creatures[k] = { right: [a, b], left: [flipH(a), flipH(b)] };
    }
  }
  const _bas = buildAllSprites;
  buildAllSprites = function () { _bas(); installAquariumSprites(); };
  if (typeof Sprites !== 'undefined' && Sprites.creatures) installAquariumSprites();

  // ---- the map (a LONG deep-water gallery) ----
  if (typeof newMap === 'function' && !MAPS.aquarium) {
    const m = newMap('aquarium', 72, 26, 'openwater', { name: "Combi's Aquarium", song: 'deep', cliff: 'sea', zone: 'vale', underwater: true, aqua: true });
    for (let i = 0; i < m.w; i++) { T(m, i, 0, 'coral'); T(m, i, m.h - 1, 'coral'); }
    for (let j = 0; j < m.h; j++) { T(m, 0, j, 'coral'); T(m, 71, j, 'coral'); }
    // a SEABED band runs along the BOTTOM; OPEN WATER (the painted backdrop) fills the tall column above (side-scroller depth)
    R(m, 1, 21, 70, 4, 'seafloor');
    // kelp forests + coral gardens (foreground, camera-fixed)
    scatter(m, 'kelp', 2, 2, 68, 22, 70, 411, ['seafloor']);
    scatter(m, 'coral', 3, 3, 66, 20, 30, 412, ['seafloor']);
    scatter(m, 'shell', 3, 18, 66, 6, 20, 413, ['seafloor']);
    // coral OUTCROPS rise from the seabed (varying heights) — an open reef, not a top-down maze of walls
    R(m, 15, 17, 2, 4, 'coral'); R(m, 29, 18, 2, 3, 'coral'); R(m, 45, 16, 2, 5, 'coral'); R(m, 61, 18, 2, 3, 'coral');
    // a few TALL kelp strands sway up from the sand for foreground layering
    for (const kx of [7, 20, 41, 56, 67]) R(m, kx, 18, 1, 3, 'kelp');
    // THE SUNKEN SHIP (a big landmark with a ram's-head mast) — near the middle
    OBJ(m, { type: 'sunkenship', x: 34, y: 23, scale: 1.9 });   // a BIG wreck resting on the seabed (bottom-anchored, enlarged)
    SIGN(m, 28, 20, 'A giant SUNKEN SHIP with a RAM-HEAD mast! The old sailors loved Mimis too. Psst... tiny bubbles sneak out of a dark crack BEHIND the hull!');
    // reef decor — the DIVING BELL is Ramsi's alone (he rides it), so scatter portholes & anchors instead
    OBJ(m, { type: 'aqprop', x: 10, y: 23, key: 'anchor' });
    OBJ(m, { type: 'aqprop', x: 22, y: 23, key: 'porthole' });
    OBJ(m, { type: 'aqprop', x: 52, y: 23, key: 'anchor' });
    OBJ(m, { type: 'aqprop', x: 64, y: 22, key: 'porthole' });
    CHEST(m, 68, 3, { gems: 8 });
    // craftable AQUARIUM decorations (invisible until crafted at COMBI's DECOR CATALOG)
    OBJ(m, { type: 'pendecor', key: 'treasurechest', x: 20, y: 22 });
    OBJ(m, { type: 'pendecor', key: 'glowcoral', x: 50, y: 20 });
    CHEST(m, 6, 22, { heartpiece: 1 });
    // exits: bubble UP to the Workshop dive-pool (far west) and to the VALE LAKE (far east)
    OBJ(m, { type: 'bubble', x: 4, y: 6, to: 'workshop', tx: 28, ty: 18 });
    SIGN(m, 4, 8, 'Bubbles rise to the WORKSHOP pool — SPACE to swim up.');
    OBJ(m, { type: 'bubble', x: 67, y: 20, to: 'vale', tx: 20, ty: 31 });
    SIGN(m, 63, 21, 'These bubbles rise to the VALE LAKE, far to the south — SPACE to surface there.');
    SIGN(m, 8, 4, "COMBI'S AQUARIUM! Swim the whole reef and PET (SPACE) the friends you meet.");
    m.start = { x: 4, y: 6 };
  }

  // ---- a matching buoy in the VALE'S long-unused MINI LAKE (south side) ----
  Game.addAquariumLink = function () {
    const v = MAPS.vale;
    if (!v || v._aqualink) return;
    v._aqualink = true;
    // a shallow spot in the south lake becomes the dive point
    if (v.tiles[31] && v.tiles[31][20] !== undefined) {
      OBJ(v, { type: 'buoy', x: 20, y: 31, to: 'aquarium', tx: 30, ty: 16, free: true, msg: "A secret way into COMBI'S AQUARIUM!" });
      OBJ(v, { type: 'sign', x: 18, y: 30, text: 'A shimmering buoy bobs here — hop on (SPACE) to dive to a hidden AQUARIUM!' });
    }
  };

  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.sunkenship = function (c, o, ox, oy) {
    const art = Sprites.props && Sprites.props.sunkenship;
    if (art) {
      const sc = o.scale || 1;
      c.save(); c.translate(ox + 8, oy + 16); c.scale(sc, sc);          // bottom-center anchor, enlarge on o.scale
      dspr(c, art, -sprW(art) / 2, -sprH(art)); c.restore(); return;
    }
    // placeholder: a broken hull with a RAM-HEAD mast
    c.fillStyle = '#3a2a1c'; c.fillRect(ox - 20, oy - 4, 56, 18);
    c.fillStyle = '#5a4028'; c.fillRect(ox - 22, oy - 8, 60, 8);
    c.fillStyle = '#241a12'; for (let k = 0; k < 6; k++) c.fillRect(ox - 18 + k * 9, oy - 6, 2, 18);
    c.fillStyle = '#2a1e14'; c.fillRect(ox + 6, oy - 44, 4, 40);                 // the mast
    c.fillStyle = '#8a94a8'; c.beginPath(); c.arc(ox + 8, oy - 48, 7, 0, 7); c.fill();  // ram head
    c.fillStyle = '#c8d0dc'; c.beginPath(); c.arc(ox + 5, oy - 50, 4, 0, 7); c.arc(ox + 11, oy - 50, 4, 0, 7); c.fill();  // horns
    c.fillStyle = '#241a33'; c.fillRect(ox + 5, oy - 49, 1.5, 1.5); c.fillRect(ox + 9, oy - 49, 1.5, 1.5);
    if (((Game.time * 2 | 0) % 4) === 0) { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(ox + 20, oy - 20 - ((Game.time * 14) % 30), 1, 1); }
  };
  Game.OBJDRAW.aqprop = function (c, o, ox, oy) {
    const art = Sprites.props && Sprites.props[o.key];
    if (art) { dspr(c, art, ox + 8 - sprW(art) / 2, oy + 12 - sprH(art)); return; }
    if (o.key === 'divingbell') {
      c.fillStyle = '#8a6c2c'; c.fillRect(ox - 8, oy - 18, 16, 4);
      c.fillStyle = 'rgba(160,220,255,.35)'; c.beginPath(); c.arc(ox, oy - 6, 11, Math.PI, 0); c.fill();
      c.strokeStyle = '#c8a04c'; c.lineWidth = 2; c.beginPath(); c.arc(ox, oy - 6, 11, Math.PI, 0); c.stroke(); c.lineWidth = 1;
      c.fillStyle = '#c8a04c'; c.fillRect(ox - 11, oy - 6, 22, 3);
    } else if (o.key === 'anchor') {
      c.strokeStyle = '#8a94a8'; c.lineWidth = 3; c.beginPath(); c.moveTo(ox, oy - 16); c.lineTo(ox, oy + 2); c.stroke();
      c.beginPath(); c.arc(ox, oy - 16, 4, 0, 7); c.stroke(); c.beginPath(); c.moveTo(ox - 8, oy - 2); c.quadraticCurveTo(ox, oy + 8, ox + 8, oy - 2); c.stroke(); c.lineWidth = 1;
    } else if (o.key === 'porthole') {
      c.fillStyle = '#5a4028'; c.beginPath(); c.arc(ox, oy - 4, 8, 0, 7); c.fill();
      c.fillStyle = '#9adcf8'; c.beginPath(); c.arc(ox, oy - 4, 5, 0, 7); c.fill();
    }
  };

  // ---- populate: reef friends fill the WHOLE tank, each at its natural depth ----
  // Every species gets a DEPTH BAND (starfish live down on the sand!) and spreads
  // across the full tank width; the _swim/_crawl motion below keeps them cruising
  // the space instead of huddling where they were born.
  // left tank = the MERMAID POND (crafted mermaids/capricorns + exhibit deep-mermaids);
  // right tank = the REEF (always-swimming ambient friends).
  const AQ_BANDS = {   // [yTop, yBottom] in tiles — the seafloor sand starts at y=21
    mermaidsea: [5, 15], capricorn: [7, 17], seahorse: [11, 19], angelfish: [4, 12],
    pufferfish: [8, 17], starfish: [19, 20],
  };
  Game.AQ_BANDS = AQ_BANDS;
  const AQ_TANKS = [
    { x0: 2, x1: 34, ambient: [['mermaidsea', 2]], log: [['mermaid', 4, 'mermaidsea'], ['capricorn', 3]] },
    { x0: 37, x1: 69, ambient: [['seahorse', 4], ['angelfish', 4], ['pufferfish', 3], ['starfish', 4]], log: [] },
  ];
  const _pz = Game.populateZoo;
  Game.populateZoo = function (mp) {
    _pz.call(this, mp);
    if (!mp || mp.id !== 'aquarium') return;
    for (const t of AQ_TANKS) {
      let si = 0;
      const add = (sp, n) => {
        if (!CREATURES[sp]) return;
        const band = AQ_BANDS[sp] || [5, 18];
        for (let q = 0; q < n; q++) {
          const ci = t.x0 + 1 + ((si * 7.3 + q * 3.1) % (t.x1 - t.x0 - 2));       // spread the width
          const cj = band[0] + ((si * 2.7 + q * 1.9) % (band[1] - band[0] + 1));  // spread the band
          const c = makeCreature(sp, ci | 0, cj | 0, { x: t.x0, y: band[0], w: t.x1 - t.x0, h: band[1] - band[0] });
          c.display = true; c.dir = (si % 2) ? 1 : -1; c.wanderT = Math.random() * 1.5;
          if (sp === 'starfish') c._crawl = true; else c._swim = true;
          si++;
          this.creatures.push(c);
        }
      };
      for (const [sp, n] of t.ambient) add(sp, n);                                   // always present
      for (const [flag, cap, showAs] of t.log) add(showAs || flag, Math.min(this.flags['life_' + flag] || 0, cap));   // your collection (underwater art)
    }
  };

  // ---- SWIM & CRAWL: lively aquarium motion (chained over the base updater) ----
  // _swim: long lazy glides with a horizontal cruising bias + a gentle depth weave,
  //        so fish actually TOUR the tank. _crawl: starfish creep along the sand.
  // A soft leash turns them around at their band edges instead of yanking them home.
  const _ucAqua = updateCreature;
  updateCreature = function (c, map, dt, player) {
    if (!(c.display && (c._swim || c._crawl))) return _ucAqua(c, map, dt, player);
    const def = CREATURES[c.species] || { spd: 10 };
    c.anim += dt;
    if (c.state === 'trapped' || c.state === 'gone') return;
    c.wanderT -= dt;
    if (c._crawl) {                                    // starfish: slow sand-shuffles with long rests
      if (c.wanderT <= 0) {
        c.wanderT = 2.5 + Math.random() * 4;
        if (Math.random() < 0.4) { c.vx = 0; c.vy = 0; }
        else { c.vx = (Math.random() < 0.5 ? -1 : 1) * def.spd * (0.6 + Math.random() * 0.8); c.vy = (Math.random() - 0.5) * def.spd * 0.4; }
      }
    } else {                                           // swimmers: pick a heading, GLIDE a while
      if (c.wanderT <= 0) {
        c.wanderT = 2.2 + Math.random() * 2.8;
        const a = Math.random() * Math.PI * 2, sp = def.spd * (0.9 + Math.random() * 0.7);
        c.vx = Math.cos(a) * sp * 1.35; c.vy = Math.sin(a) * sp * 0.55;
        if (Math.abs(c.vx) < def.spd * 0.4) c.vx = (c.dir || 1) * def.spd * 0.8;   // never hover in place
      }
      c.vy += Math.sin(c.anim * 1.7 + c.x * 0.05) * dt * 6;                        // gentle depth weave
    }
    if (c.home) {                                      // soft band leash: turn, don't teleport
      const x0 = c.home.x * TILE - 8, x1 = (c.home.x + c.home.w) * TILE + 8;
      const y0 = c.home.y * TILE - 6, y1 = (c.home.y + c.home.h) * TILE + 10;
      if (c.x < x0) c.vx = Math.abs(c.vx) || def.spd; else if (c.x > x1) c.vx = -(Math.abs(c.vx) || def.spd);
      if (c.y < y0) c.vy = Math.abs(c.vy) * 0.8 + 2; else if (c.y > y1) c.vy = -(Math.abs(c.vy) * 0.8 + 2);
    }
    const nx = c.x + c.vx * dt, ny = c.y + c.vy * dt;
    if (creatureWalkable(map, c, (nx / TILE) | 0, (c.y / TILE) | 0)) c.x = nx; else c.vx *= -1;
    if (creatureWalkable(map, c, (c.x / TILE) | 0, (ny / TILE) | 0)) c.y = ny; else c.vy *= -1;
    if (Math.abs(c.vx) > 1) c.dir = c.vx > 0 ? 1 : -1;
  };
})();
