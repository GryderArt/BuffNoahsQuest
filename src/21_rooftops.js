"use strict";
// ===================== WORLD 3 — THE HIGH ROOFS (3x-wide rooftop CHASE) =====================
// A wide rooftop skyline 100 ft up. A strict TRAVERSAL HIERARCHY: JUMP (X) only crosses the SMALL gaps;
// HARPOON (tool 3) the brass ANCHORS across the MEDIUM gaps (too wide to jump); GLIDE (C) the WIDEST
// chasms (too wide to jump OR harpoon — no anchor, just a glide-point). The fiery BLAZAGON bolts to a
// new tower each time you NET him — chase him the length of the skyline and corner him on the LAST roof.
// The sky-gap is a 'hole': you can't walk into it, only leap/grapple/glide — miss and you fall (a heart).
(function buildRooftops() {
  if (typeof newMap !== 'function' || MAPS.cog3) return;
  const W = 144, H = 30;
  const m = newMap('cog3', W, H, 'skygap', { name: 'The High Roofs', song: 'coast', cliff: 'void', zone: 'city', noFly: true });
  m.custom = true; m.facades = true;

  const WID = [10, 8, 10, 9, 8, 11, 9, 8, 10, 8];
  const YPOS = [19, 19, 15, 8, 8, 12, 18, 18, 13, 17];
  const THK  = [7, 7, 9, 8, 8, 11, 7, 7, 11, 9];
  const GAPTYPE = ['jump', 'harpoon', 'glide', 'jump', 'harpoon', 'glide', 'jump', 'harpoon', 'glide'];
  const GAPW = { jump: 2, harpoon: 5, glide: 9 };
  const B = []; let x = 2;
  for (let i = 0; i < WID.length; i++) { B.push({ x, y: YPOS[i], w: WID[i], h: THK[i] }); if (i < GAPTYPE.length) x += WID[i] + GAPW[GAPTYPE[i]]; }

  // lay the rooftops (+ front parapet lip + a little clutter)
  for (let i = 0; i < B.length; i++) {
    const b = B[i]; R(m, b.x, b.y, b.w, b.h, i % 2 ? 'roofb' : 'roof');
    for (let cx = b.x; cx < b.x + b.w; cx++) m.tiles[b.y + b.h - 1][cx] = 'parapet';
    m.tiles[b.y + 1][b.x + 1] = 'acunit';
    if (b.w > 7) m.tiles[b.y + 2][b.x + b.w - 3] = 'skylight';
    if (i % 2 === 1) OBJ(m, { type: 'decor', sprite: 'antenna', x: b.x + b.w - 2, y: b.y });   // rooftop antenna decor
  }
  // connectors per gap type: JUMP (nothing) < HARPOON (anchor on the far roof) < GLIDE (glide-point)
  for (let i = 0; i < GAPTYPE.length; i++) {
    const a = B[i], b = B[i + 1], t = GAPTYPE[i];
    if (t === 'harpoon') {
      const row = (Math.max(a.y, b.y) + Math.min(a.y + a.h, b.y + b.h) - 1) >> 1;   // a row both roofs share
      POST(m, b.x, row);
    } else if (t === 'glide') {
      OBJ(m, { type: 'glidevent', x: a.x + a.w - 1, y: a.y + 2, to: [b.x + 1, b.y + 2], msg: 'RAMSI puffs up and GLIDES Noah across the wide chasm!' });
    }
  }
  OBJ(m, { type: 'portal', x: B[9].x + (B[9].w >> 1), y: B[9].y + 2, to: 'world3map', secret: true, req: 'sc_cog3' });   // post-star EXIT to the overview map (the finale is the All-Beast node)
  SIGN(m, B[0].x + 2, B[0].y + 2, 'THE HIGH ROOFS — 100 ft up! JUMP (X) the SMALL gaps, HARPOON (tool 3) the brass ANCHORS across MEDIUM gaps, GLIDE (C) the WIDEST chasms. Chase fiery BLAZAGON across the skyline and NET him (Z) — he BOLTS to a new tower each hit, so run him down to the LAST roof! A fall costs a heart.');
  m.start = { x: B[0].x + 3, y: B[0].y + 2 };

  // BLAZAGON chase: he bolts to a new tower each net hit, truly caught on the LAST roof
  const chaseIdx = [2, 4, 6, 8, 9];
  m._chaseSpots = chaseIdx.map(i => [B[i].x + (B[i].w >> 1), B[i].y + (B[i].h >> 1)]);
  m._chaseBoxes = chaseIdx.map(i => ({ x: B[i].x, y: B[i].y, w: B[i].w, h: B[i].h }));

  // FACADE: the lowest building-top tile per column -> a tower wall renders below it (see drawWorld)
  m._facadeTop = new Array(W).fill(-1);
  for (let cx = 0; cx < W; cx++) for (let cy = H - 1; cy >= 0; cy--) { const id = m.tiles[cy][cx]; if (id === 'roof' || id === 'roofb' || id === 'parapet' || id === 'acunit' || id === 'skylight') { m._facadeTop[cx] = cy; break; } }

  m.onLoad = function (G) {
    if (!(G.flags.starcells && G.flags.starcells['sc_cog3'])) {
      const sp = m._chaseSpots[0], bz = makeCreature('blazagon', sp[0], sp[1], m._chaseBoxes[0]);
      bz._chase = 0; bz._chaseMax = 4; G.creatures.push(bz);
    }
  };
})();
