"use strict";
// ================= world maps (procedural builder, precise features) =================
const MAPS = {};
function newMap(id, w, h, base, opts) {
  const m = Object.assign({ id, w, h, tiles: [], elev: [], objects: [], links: [], spawns: [],
    doors: {}, overrides: {}, name: id, song: 'vale', cliff: 'dirt', dark: false }, opts || {});
  for (let j = 0; j < h; j++) { m.tiles.push(new Array(w).fill(base)); m.elev.push(new Array(w).fill(0)); }
  MAPS[id] = m; return m;
}
function T(m, x, y, t, e) { if (x>=0&&y>=0&&x<m.w&&y<m.h){ m.tiles[y][x] = t; if (e !== undefined) m.elev[y][x] = e; } }
function R(m, x, y, w, h, t, e) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) T(m, i, j, t, e); }
function E(m, x, y, w, h, e) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i>=0&&j>=0&&i<m.w&&j<m.h) m.elev[j][i] = e; }
function scatter(m, t, x, y, w, h, n, seed, keep) {
  const r = sRandom(seed);
  for (let k = 0; k < n; k++) {
    const i = x + (r() * w | 0), j = y + (r() * h | 0);
    if (keep && !keep.includes(m.tiles[j] && m.tiles[j][i])) continue;
    T(m, i, j, t);
  }
}
// ---- organic shaping helpers (the anti-box toolkit) ----
const SOFT_TILES = ['grass','flowers','pebbles','path','sand','shell','snow','dust','voidfloor','seafloor','kelp','floor','skyfloor'];
// noise-perturbed ellipse fill; `over` restricts which tiles may be overwritten
function blob(m, cx, cy, rx, ry, t, e, seed, over) {
  const r = sRandom((seed || 1) * 97 + 3);
  const ph = r() * 6.28, ph2 = r() * 6.28, a3 = 0.13 + r() * 0.09, a5 = 0.07 + r() * 0.07;
  for (let j = Math.floor(cy - ry - 2); j <= Math.ceil(cy + ry + 2); j++) {
    for (let i = Math.floor(cx - rx - 2); i <= Math.ceil(cx + rx + 2); i++) {
      if (i < 1 || j < 1 || i >= m.w - 1 || j >= m.h - 1) continue;
      const dx = (i - cx) / rx, dy = (j - cy) / ry;
      const d = Math.sqrt(dx * dx + dy * dy);
      const ang = Math.atan2(dy, dx);
      const rad = 1 + a3 * Math.sin(ang * 3 + ph) + a5 * Math.sin(ang * 5 + ph2);
      if (d <= rad) {
        if (over && !over.includes(m.tiles[j][i])) continue;
        T(m, i, j, t, e);
      }
    }
  }
}
// stamp a winding trail through control points; only repaints SOFT ground, keeps elevation
function windPath(m, pts, t, w, seed) {
  const curve = catmullRom(pts, 10);
  const r = sRandom((seed || 7) * 31 + 1);
  for (const [px, py] of curve) {
    const rad = (w || 1.2) * (0.75 + 0.5 * r());
    for (let j = Math.floor(py - rad); j <= Math.ceil(py + rad); j++)
      for (let i = Math.floor(px - rad); i <= Math.ceil(px + rad); i++) {
        if (i < 1 || j < 1 || i >= m.w - 1 || j >= m.h - 1) continue;
        if (Math.hypot(i - px, j - py) <= rad && SOFT_TILES.includes(m.tiles[j][i])) m.tiles[j][i] = t;
      }
  }
}
// guarantee a feature tile is walkable ground (used after blobs reshape an area)
function ensureGround(m, x, y, t) {
  const cur = m.tiles[y][x], d = TILEDEFS[cur] || {};
  if (d.solid || d.hole || d.rift || cur === 'water' || cur === 'deep') T(m, x, y, t);
}
// dungeon de-boxing: round room corners outward + scatter rubble/stalagmites safely
function organicCave(m, seed, decorN) {
  const r = sRandom(seed);
  const occ = new Set();
  for (const o of m.objects) occ.add(o.x + ',' + o.y);
  for (const L of m.links) occ.add(L.x + ',' + L.y);
  for (const k of Object.keys(m.doors)) occ.add(k);
  const adds = [];
  for (let j = 1; j < m.h - 1; j++) for (let i = 1; i < m.w - 1; i++) {
    if (m.tiles[j][i] !== 'wall') continue;
    const f = (a, b) => m.tiles[b][a] === 'floor';
    const corner = (f(i - 1, j) && f(i, j - 1)) || (f(i + 1, j) && f(i, j - 1)) ||
                   (f(i - 1, j) && f(i, j + 1)) || (f(i + 1, j) && f(i, j + 1));
    if (corner && r() < 0.55) adds.push([i, j]);
  }
  for (const [i, j] of adds) T(m, i, j, 'floor');
  let placed = 0, guard = 0;
  while (placed < (decorN || 0) && guard++ < 400) {
    const i = 1 + (r() * (m.w - 2) | 0), j = 1 + (r() * (m.h - 2) | 0);
    if (m.tiles[j][i] !== 'floor') continue;
    let ok = true;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (m.tiles[j + dj][i + di] !== 'floor' || occ.has((i + di) + ',' + (j + dj))) ok = false;
    }
    if (!ok) continue;
    T(m, i, j, r() < 0.65 ? 'rubble' : 'stal'); placed++;
  }
}
function OBJ(m, o) { m.objects.push(o); return o; }
function CHEST(m, x, y, loot, req) { return OBJ(m, { type: 'chest', x, y, loot, req, id: m.id + '_c_' + x + '_' + y }); }
function SIGN(m, x, y, text) { return OBJ(m, { type: 'sign', x, y, text }); }
function NPC(m, x, y, who, name) { return OBJ(m, { type: 'npc', x, y, who, name }); }
function POST(m, x, y) { T(m, x, y, m.tiles[y][x], undefined); return OBJ(m, { type: 'post', x, y }); }
function LINK(m, x, y, to, tx, ty, req, msg) { m.links.push({ x, y, to, tx, ty, req, msg }); }
function DOOR(m, x, y, kind, req, msg, e) { T(m, x, y, kind === 'lock' ? 'doorL' : kind === 'boss' ? 'doorB' : 'doorF', e); m.doors[x + ',' + y] = { kind, req, msg, id: m.id + '_d_' + x + '_' + y }; }
function SPAWN(m, species, x, y, w, h, n) { m.spawns.push({ species, x, y, w, h, n }); }
function ASTEROID(m, x0, y0, x1, y1, w, h, period, phase) { (m.asteroids = m.asteroids || []).push({ ax0: x0 * 16, ay0: y0 * 16, ax1: x1 * 16, ay1: y1 * 16, w, h, period, phase: phase || 0, t: 0, x: x0 * 16, y: y0 * 16 }); }

function buildMaps() {
// ======================= GREENWOOD VALE =======================
{
  const m = newMap('vale', 64, 40, 'grass', { name: 'Greenwood Vale', song: 'vale', cliff: 'dirt', zone: 'vale' });
  scatter(m, 'flowers', 14, 10, 26, 16, 26, 11, ['grass']);
  scatter(m, 'flowers', 30, 18, 18, 10, 12, 12, ['grass']);
  // open east meadow (breathing room, not boxy)
  scatter(m, 'flowers', 50, 4, 12, 20, 14, 13, ['grass']);
  scatter(m, 'tree', 52, 2, 10, 22, 9, 33, ['grass', 'flowers']);
  scatter(m, 'bush', 50, 6, 12, 18, 5, 43, ['grass']);
  // border woods
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'tree'); T(m, i, m.h - 1, 'tree'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'tree'); T(m, m.w - 1, j, 'tree'); }
  // --- snowy hills NW: organic contoured slopes (elev 1..3, summit shrine) ---
  R(m, 0, 0, 17, 15, 'snow', 1);
  blob(m, 7, 6.5, 6.6, 5.6, 'snow', 2, 351, ['snow']);     // mid slope
  blob(m, 6, 5, 3.8, 3.4, 'snow', 3, 352, ['snow']);       // summit dome
  // soft snowy toes pushing into the meadow (south side only — never near the grotto plateau)
  blob(m, 17.5, 10.5, 1.8, 1.5, 'snow', 1, 354, ['grass', 'flowers']);
  blob(m, 5, 15.5, 2.4, 1.5, 'snow', 1, 355, ['grass', 'flowers']);
  blob(m, 11, 15.2, 2.0, 1.4, 'snow', 1, 356, ['grass', 'flowers']);
  // anchored ledges so the stair chain always connects
  E(m, 4, 8, 7, 4, 2);                                     // e2 shelf with the (8,11) landing
  E(m, 5, 3, 4, 5, 3);                                     // e3 summit knob (statue/spirit/sign)
  E(m, 13, 12, 3, 3, 1); E(m, 7, 13, 3, 2, 1);             // e1 aprons under the stairs
  for (let i = 0; i < 17; i++) T(m, i, 0, 'pine');
  for (let j = 0; j < 15; j++) T(m, 0, j, 'pine');
  scatter(m, 'pine', 1, 1, 15, 13, 9, 21, ['snow']);
  // keep the shrine knob clear so the Spirit (jump-shoe giver) isn't hidden behind a pine
  for (let cy = 3; cy <= 6; cy++) for (let cx = 5; cx <= 7; cx++) if (m.tiles[cy][cx] === 'pine') T(m, cx, cy, 'snow', 3);
  T(m, 14, 14, 'stair', 0); T(m, 14, 13, 'snow', 1);
  T(m, 8, 12, 'stair', 1); T(m, 8, 11, 'snow', 2);
  T(m, 6, 8, 'stair', 2); T(m, 6, 7, 'snow', 3);
  T(m, 6, 3, 'statue', 3);
  NPC(m, 6, 5, 'spirit', 'Shrine Spirit');
  SIGN(m, 8, 5, 'SHRINE OF THE SPRING SANDALS. Befriend 3 mountain friends (goats or rams), then speak to the spirit!');
  CHEST(m, 2, 2, { heartpiece: 1 });
  CHEST(m, 12, 3, { coins: 12 });
  // --- Goat Grotto entrance (jump-gated by chasm) ---
  R(m, 20, 1, 11, 7, 'grass', 1);
  R(m, 21, 8, 9, 1, 'chasm', 0);
  T(m, 25, 7, 'stair', 0); E(m, 25, 7, 1, 1, 0); T(m, 25, 7, 'stair', 0);
  E(m, 25, 6, 1, 1, 1);
  DOOR(m, 25, 2, 'flag', null, null, 1); LINK(m, 25, 2, 'grotto1', 13, 21);
  R(m, 20, 1, 11, 1, 'rock', 1); T(m, 25, 1, 'rock', 1); T(m, 25, 2, 'doorF', 1);
  SIGN(m, 23, 10, 'GOAT GROTTO ahead. MIND THE GAP! You need SPRING SANDALS (press X to jump).');
  // --- Granny cottage & sheep meadow ---
  R(m, 32, 5, 6, 4, 'wall'); R(m, 33, 6, 4, 2, 'wall');
  DOOR(m, 34, 8, 'flag'); LINK(m, 34, 8, 'grannyzoo', 11, 13); // into GRANNY'S MENAGERIE (the zoo)
  NPC(m, 34, 11, 'granny', 'Granny');
  SIGN(m, 30, 12, "GRANNY'S MEADOW. Her 3 sheep ran off! Sneak up and GRAB them (SPACE).");
  R(m, 18, 12, 9, 1, 'fence'); R(m, 18, 17, 9, 1, 'fence');
  R(m, 18, 13, 1, 4, 'fence'); R(m, 26, 13, 1, 4, 'fence');
  T(m, 22, 17, 'grass');
  // --- start area sign ---
  SIGN(m, 27, 21, 'Welcome to MIMI ISLAND! Arrows move. SPACE talks & grabs signs... like this one!');
  // a shimmering VISION of RAMSI, trapped far away on a floating island (unreachable)
  R(m, 57, 2, 5, 5, 'rift'); T(m, 59, 4, 'grass', 2);
  OBJ(m, { type: 'ramsi', x: 59, y: 4, vale: true });
  SIGN(m, 28, 23, 'A magic vision shimmers NE: RAMSI the Pillow Pet, trapped on a floating ROOST! Only a hero who has mastered EVERY power of movement can ever reach him.');
  // --- Marko stall + Tess ---
  R(m, 39, 11, 3, 1, 'fence');
  NPC(m, 40, 12, 'marko', 'Marko');
  SIGN(m, 42, 13, "MARKO'S STALL: gear & baits for GEMS. Trade coins with Tess (10 coins = 1 gem).");
  NPC(m, 45, 16, 'tess', 'Trapper Tess');
  // --- west forest ---
  scatter(m, 'tree', 2, 17, 11, 18, 26, 31, ['grass', 'flowers']);
  scatter(m, 'bush', 3, 17, 10, 17, 8, 41, ['grass']);
  scatter(m, 'stump', 3, 18, 10, 15, 3, 345, ['grass']);
  CHEST(m, 5, 22, { coins: 15 });
  // --- south lake: a real organic lake (no more rectangle) with bridge & island chest ---
  blob(m, 24, 30.5, 9.5, 4.0, 'water', 0, 301, ['grass', 'flowers']);
  blob(m, 18.5, 32, 4.6, 2.8, 'water', 0, 302, ['grass', 'flowers']);
  blob(m, 29.5, 29.5, 4.4, 2.9, 'water', 0, 303, ['grass', 'flowers']);
  for (let j = 26; j <= 35; j++) if (m.tiles[j][24] === 'water') T(m, 24, j, 'bridge');
  T(m, 26, 30, 'grass'); CHEST(m, 26, 30, { gems: 3 });
  ensureGround(m, 24, 25, 'grass'); ensureGround(m, 18, 36, 'grass'); ensureGround(m, 24, 26, 'grass');
  SIGN(m, 24, 25, 'Fisherfolk say: a HARPOON can reel in swimmers AND hook golden posts!');
  CHEST(m, 18, 36, { coins: 10 });
  // --- GEAR GAUNTLET: one LONG sealed causeway across the whole SE ---
  // jump gap -> slick ice ridge -> WIDE water with a 2-post harpoon chain -> Billy-gated door
  R(m, 36, 29, 27, 8, 'rock');
  R(m, 37, 31, 24, 4, 'grass', 0);
  T(m, 38, 29, 'grass'); T(m, 38, 30, 'grass');   // northern entrance slot
  SIGN(m, 38, 32, 'GEAR GAUNTLET: the long road to SUNSPLASH COAST. Only true adventurers pass! 1) JUMP  2) CLIMB  3) HARPOON, twice!');
  R(m, 41, 31, 1, 4, 'chasm');                     // 1: the jump gap
  R(m, 44, 31, 2, 4, 'grass', 1);                  // 2: slick ice ridge (gloves)
  R(m, 44, 31, 1, 4, 'ice', 1);
  R(m, 48, 31, 9, 4, 'water');                     // 3: WIDE water — far too wide to jump
  POST(m, 47, 32);                                 //    west shore post (return target)
  T(m, 51, 32, 'grass'); POST(m, 51, 32);          //    post island A
  T(m, 55, 32, 'grass'); POST(m, 55, 32);          //    post island B
  POST(m, 57, 32);                                 //    east shore post (and the way back)
  SIGN(m, 47, 31, 'Golden posts twinkle across the water. ZIP, ZIP, ZIP — and the same road home!');
  R(m, 61, 31, 1, 4, 'rock');
  DOOR(m, 61, 33, 'flag', 'billy', 'The great door rumbles: "Return when you have caught KING BILLY of Goat Grotto!"');
  LINK(m, 61, 33, 'coast', 2, 18);
  CHEST(m, 59, 31, { gems: 3 });
  // nibble the causeway's straight rock frame (visual only; never opens a way in)
  { const rr = sRandom(361);
    for (let i = 36; i < 63; i++) { if (rr() < 0.4 && m.tiles[28][i] === 'grass' && m.tiles[30][i] === 'rock') T(m, i, 29, 'grass'); }
    for (let i = 36; i < 63; i++) { if (rr() < 0.4 && m.tiles[37] && m.tiles[37][i] === 'grass' && m.tiles[35][i] === 'rock') T(m, i, 36, 'grass'); }
  }
  // spawns
  CHEST(m, 56, 8, { coins: 14 });
  // BACKTRACK COLLECTABLE: a heart on a rift-ringed island — only ANGEL WINGS reach it
  R(m, 52, 19, 5, 5, 'chasm'); R(m, 53, 20, 3, 3, 'rift'); T(m, 54, 21, 'grass');
  CHEST(m, 54, 21, { heartpiece: 1 });
  SIGN(m, 50, 24, 'A heart glints on a floating islet! Come back and FLY here once you earn ANGEL WINGS.');
  // --- winding country roads tie the vale together ---
  windPath(m, [[26, 22], [27, 19], [29, 16], [31, 13], [33, 11], [34, 10]], 'path', 1.05, 311);  // start -> Granny
  windPath(m, [[27, 20], [24, 19], [22, 18]], 'path', 0.9, 312);                                  // -> meadow gate
  windPath(m, [[34, 11], [37, 12], [40, 13], [42, 14], [45, 15]], 'path', 0.9, 313);              // Granny -> Marko -> Tess
  windPath(m, [[28, 20], [26, 17], [26, 13], [25, 10], [25, 9]], 'path', 0.9, 314);               // -> Grotto gap
  windPath(m, [[27, 21], [29, 24], [33, 26], [36, 28], [38, 30]], 'path', 1.0, 315);              // -> Gear Gauntlet
  windPath(m, [[26, 22], [25, 24], [24, 26]], 'path', 0.9, 316);                                  // -> lake bridge
  // --- meadow life ---
  scatter(m, 'flowers', 18, 18, 26, 8, 16, 341, ['grass']);
  scatter(m, 'pebbles', 16, 10, 32, 24, 14, 342, ['grass']);
  scatter(m, 'tree', 29, 1, 20, 3, 9, 343, ['grass', 'flowers']);
  scatter(m, 'bush', 37, 17, 9, 7, 5, 344, ['grass']);
  scatter(m, 'tree', 44, 19, 6, 7, 4, 346, ['grass']);
  SPAWN(m, 'sheep', 17, 11, 12, 9, 5);
  SPAWN(m, 'sheep', 48, 6, 12, 16, 2);
  SPAWN(m, 'ram', 3, 18, 10, 14, 3);
  SPAWN(m, 'goat', 2, 2, 13, 11, 4);
  SPAWN(m, 'snowhare', 1, 1, 14, 12, 2);
  m.start = { x: 26, y: 20 };
}
// ======================= GOAT GROTTO — a real multi-room dungeon =======================
// Room 1: ENTRY CAVERN (grabby gap + whistling tunnel)
{
  const m = newMap('grotto1', 26, 26, 'wall', { name: 'Goat Grotto — Entry Cavern', song: 'dungeon', cliff: 'stone', zone: 'vale', dungeon: true, dark: true });
  R(m, 8, 14, 10, 8, 'floor');                       // entry hall
  T(m, 13, 22, 'floor'); LINK(m, 13, 22, 'vale', 25, 9);
  SIGN(m, 10, 20, '1) Grab the HARPOON in the WEST chamber (jump the gap!). The GREAT CHASM lies through the NORTH door.');
  // whistling tunnel loop
  R(m, 3, 18, 5, 1, 'floor');
  R(m, 3, 19, 1, 5, 'floor');
  R(m, 3, 23, 14, 1, 'floor');
  R(m, 16, 21, 1, 3, 'floor');
  CHEST(m, 9, 23, { coins: 8 });
  SIGN(m, 4, 23, 'The Whistling Tunnel. Goats dug this. Why? Goats.');
  // west chamber: the GRABBY GAP
  R(m, 3, 6, 7, 7, 'floor');
  R(m, 6, 13, 3, 1, 'floor');
  R(m, 4, 7, 5, 5, 'chasm'); R(m, 5, 8, 3, 3, 'floor');
  CHEST(m, 6, 9, { tool: 'harpoon' });
  SIGN(m, 3, 6, 'The GRABBY GAP! Take a running JUMP (X) — in AND out.');
  // north door to the Great Chasm
  R(m, 13, 5, 1, 9, 'floor');
  DOOR(m, 13, 4, 'flag'); LINK(m, 13, 4, 'grotto2', 15, 23);
  organicCave(m, 701, 5);
  m.start = { x: 13, y: 21 };
}
// Room 2: THE GREAT CHASM (key island, catwalk rims, two gated exits)
{
  const m = newMap('grotto2', 30, 26, 'wall', { name: 'Goat Grotto — The Great Chasm', song: 'dungeon', cliff: 'stone', zone: 'vale', dungeon: true, dark: true });
  R(m, 14, 19, 3, 6, 'floor');
  T(m, 15, 24, 'floor'); LINK(m, 15, 24, 'grotto1', 13, 5);
  R(m, 5, 4, 21, 15, 'floor');                        // the cavern
  R(m, 8, 6, 15, 11, 'chasm');                        // a VAST pit
  T(m, 15, 11, 'floor'); T(m, 15, 10, 'floor');       // key island, dead center
  POST(m, 15, 11); CHEST(m, 15, 10, { key: 1 });
  POST(m, 15, 17);                                    // south rim post (the way back)
  SIGN(m, 9, 18, '2) HARPOON the island post from HERE on the south rim — then harpoon the rim post to return. The catwalks lead to two doors!');
  SIGN(m, 23, 4, 'NORTH: the BOSS DOOR (needs the BIG KEY). EAST: the BRACER WORKS (needs a little key).');
  CHEST(m, 6, 5, { gems: 3 });
  // east: locked door to the Bracer Works
  DOOR(m, 26, 11, 'lock'); LINK(m, 26, 11, 'grotto3', 3, 11);
  // north: the boss door
  DOOR(m, 15, 3, 'boss'); LINK(m, 15, 3, 'grotto4', 14, 15);
  organicCave(m, 702, 4);
  m.start = { x: 15, y: 23 };
}
// Room 3: THE BRACER WORKS (a real machine-puzzle: wall -> bridge -> vault gate)
{
  const m = newMap('grotto3', 28, 22, 'wall', { name: 'Goat Grotto — The Bracer Works', song: 'dungeon', cliff: 'stone', zone: 'vale', dungeon: true, dark: true });
  // west entry hall
  R(m, 2, 9, 5, 6, 'floor');
  T(m, 2, 11, 'floor'); LINK(m, 2, 11, 'grotto2', 25, 11);
  CHEST(m, 4, 13, { item: 'bracers' });
  SIGN(m, 3, 9, '3) POWER BRACERS wait in the chest! Hold SPACE to GRAB a block, arrows to PUSH or PULL. Park it on the glowing switch!');
  OBJ(m, { type: 'block', x: 5, y: 10, id: 'g3_b1' });
  T(m, 5, 14, 'switch');
  // central chamber (behind the sinking wall in column x7)
  R(m, 8, 5, 10, 12, 'floor');
  OBJ(m, { type: 'block', x: 10, y: 7, id: 'g3_b2' });
  T(m, 16, 14, 'switch');
  SIGN(m, 13, 5, 'Each switch drives ONE goat-machine. Follow its glowing wire to see what moves!');
  // the chasm moat (2 wide — no jump crosses it) and the east platform
  R(m, 18, 5, 2, 12, 'chasm');
  R(m, 20, 5, 7, 12, 'floor');
  // the treasure vault — VISIBLE from the start, sealed by the final gate
  R(m, 21, 2, 4, 2, 'floor');
  CHEST(m, 22, 2, { bosskey: 1 });
  CHEST(m, 24, 2, { gems: 4 });
  DOOR(m, 22, 4, 'flag', 'sw_grotto3', 'The vault gate waits for the THIRD click...');
  // the boxed-in block: walled on three sides — bracers must PULL it free
  OBJ(m, { type: 'block', x: 24, y: 8, id: 'g3_b3' });
  T(m, 23, 8, 'wall'); T(m, 24, 7, 'wall'); T(m, 24, 9, 'wall');
  SIGN(m, 25, 5, "Boxed in on three sides! Pushing is hopeless... stand BESIDE it, grab, and PULL while walking backwards.");
  T(m, 21, 12, 'switch');
  m.puzzle = [
    { sw: [5, 14],  flag: 'sw_grotto3_1', to: 'floor',  tiles: [[7, 10], [7, 11], [7, 12]], color: '120,240,255', jingle: 'rumble', msg: 'RRRUMBLE! The cracked wall sinks into the floor!' },
    { sw: [16, 14], flag: 'sw_grotto3_2', to: 'bridge', tiles: [[18, 10], [19, 10]],        color: '248,208,72',  jingle: 'door',   msg: 'CLUNK! A stone bridge slides across the chasm!' },
    { sw: [21, 12], flag: 'sw_grotto3',   tiles: [], wireTo: [22, 4],                        color: '220,110,230', jingle: 'bosswin', msg: 'KA-CHUNK! The vault gate grinds open!' },
  ];
  m.start = { x: 3, y: 11 };
}
// Room 4: BILLY'S HALL (the arena)
{
  const m = newMap('grotto4', 28, 18, 'wall', { name: "Goat Grotto — Billy's Hall", song: 'dungeon', cliff: 'stone', zone: 'vale', dungeon: true, dark: true });
  R(m, 13, 12, 3, 5, 'floor');
  T(m, 14, 16, 'floor'); LINK(m, 14, 16, 'grotto2', 15, 4);
  R(m, 6, 2, 16, 10, 'floor');                        // the arena
  OBJ(m, { type: 'boss', x: 14, y: 5, boss: 'billy' });
  SIGN(m, 16, 13, '4) King Billy hates nets and shrugs off pokes... but a HARPOON mid-CHARGE? Then GRAB him three times (SPACE)!');
  // victory EXIT portal: a side grotto torn open when Billy is caught
  R(m, 22, 2, 3, 3, 'floor');
  LINK(m, 23, 3, 'vale', 25, 9, 'billy');
  organicCave(m, 704, 3);
  m.start = { x: 14, y: 15 };
}
// ======================= SUNSPLASH COAST =======================
{
  const m = newMap('coast', 60, 38, 'grass', { name: 'Sunsplash Coast', song: 'coast', cliff: 'dirt', zone: 'coast' });
  scatter(m, 'flowers', 4, 4, 30, 12, 18, 51, ['grass']);
  for (let i = 0; i < m.w; i++) T(m, i, 0, 'tree');
  for (let j = 0; j < 20; j++) T(m, 0, j, 'tree');
  T(m, 0, 18, 'grass'); T(m, 1, 18, 'grass'); LINK(m, 0, 18, 'vale', 50, 33);
  // beach & sea: a hand-drawn sweeping shoreline (no straight bands)
  for (let i = 0; i < 60; i++) {
    const gEdge = 21.5 + 1.6 * Math.sin(i * 0.13 + 0.7) + 0.8 * Math.sin(i * 0.31 + 2.1);
    const sEdge = 27.6 + 1.5 * Math.sin(i * 0.17 + 1.3) + 0.8 * Math.sin(i * 0.41);
    const dEdge = 33.6 + 1.1 * Math.sin(i * 0.21 + 3.0);
    for (let j = Math.round(gEdge); j < 38; j++) {
      if (j < Math.round(sEdge)) T(m, i, j, 'sand');
      else if (j < Math.round(dEdge)) T(m, i, j, 'water');
      else T(m, i, j, 'deep');
    }
  }
  // the east bay, with a wavy coast
  for (let j = 8; j < 38; j++) {
    const bx = 42 + Math.round(1.8 * Math.sin(j * 0.23 + 1.0));
    for (let i = bx; i < 60; i++) if (m.tiles[j][i] !== 'water' && m.tiles[j][i] !== 'deep') T(m, i, j, 'water');
  }
  for (let j = 8; j < 34; j++) {
    const dx = 48 + Math.round(1.2 * Math.sin(j * 0.3 + 0.4));
    for (let i = dx; i < 60; i++) T(m, i, j, 'deep');
  }
  R(m, 42, 8, 2, 12, 'sand');                          // the bay sand bar
  scatter(m, 'palm', 2, 20, 50, 4, 12, 61, ['sand']);
  scatter(m, 'palm', 2, 19, 52, 6, 10, 62, ['sand']);
  // tidepools & beach decor
  blob(m, 12, 24.5, 1.8, 1.2, 'water', 0, 403, ['sand']);
  blob(m, 33, 24, 1.5, 1.0, 'water', 0, 404, ['sand']);
  scatter(m, 'shell', 2, 21, 56, 6, 12, 405, ['sand']);
  scatter(m, 'pebbles', 4, 2, 36, 16, 10, 406, ['grass']);
  scatter(m, 'flowers', 4, 3, 34, 14, 12, 407, ['grass']);
  // pier
  T(m, 20, 26, 'sand');
  for (let j = 27; j <= 32; j++) T(m, 20, j, 'bridge');
  NPC(m, 22, 25, 'sal', 'Salty Sal');
  ensureGround(m, 22, 25, 'sand'); ensureGround(m, 18, 25, 'sand');
  SIGN(m, 18, 25, "SALTY SAL'S TRADES: a real SHARK buys you a DIVING SUIT! Sharks circle the pier — HARPOON one from the planks (Z).");
  // Marko stall
  R(m, 29, 13, 3, 1, 'fence');
  NPC(m, 30, 14, 'marko', 'Marko');
  SIGN(m, 32, 15, "MARKO'S BEACH STALL: STARDUST COOKIES, FISH SNACKS, upgrades!");
  // school building
  R(m, 35, 5, 10, 7, 'wall');
  R(m, 36, 6, 8, 5, 'wall');
  DOOR(m, 40, 11, 'flag'); LINK(m, 40, 11, 'school', 11, 13);
  SIGN(m, 37, 13, 'SUNSPLASH SCHOOL — Ms. Plume teaches the brightest fish on the island. Visitors welcome!');
  // DIVE LAGOON — a BONE-LATCH bars it; only the BOOMER-BONE can knock it open
  R(m, 23, 30, 3, 3, 'rock');                          // ring of rock around the buoy
  T(m, 24, 31, 'water');                               // the buoy floats inside
  DOOR(m, 24, 30, 'bone', null, 'A BONE-LATCH bars the dive! Knock it open with the BOOMER-BONE (tool 5, Z).');
  OBJ(m, { type: 'buoy', x: 24, y: 31, to: 'deep', tx: 5, ty: 5 });
  SIGN(m, 20, 27, 'DIVE LAGOON: a BONE-LATCH bars it. Throw your BOOMER-BONE to knock it open, then DIVE (SPACE at the buoy)!');
  // gloves ledge chest
  R(m, 6, 4, 6, 4, 'grass', 1); R(m, 6, 4, 6, 1, 'ice', 1);
  CHEST(m, 8, 6, { gems: 4 });
  SIGN(m, 12, 9, 'Slick frosty ledge: CLIMBING GLOVES only!');
  // harpoon island heartpiece — well off shore; no jump reaches it
  T(m, 44, 31, 'sand'); POST(m, 44, 31);             // the sand spit (and the way back)
  T(m, 49, 31, 'sand'); POST(m, 49, 31); T(m, 48, 31, 'water');   // (audit fix: the pull-line to the treasure pocket was walled) E(m, 49, 31, 1, 1, 0);
  T(m, 49, 30, 'sand'); CHEST(m, 49, 30, { heartpiece: 1 });
  SIGN(m, 43, 19, 'A golden post twinkles on the far island... (harpoon from the sand spit south of here)');
  ensureGround(m, 43, 19, 'sand');
  // tide gate hint
  SIGN(m, 10, 23, 'OLD TIDE LEGEND: the Deep Blue gate opens for a friend of EIGHT sea Mimis. (Catch octopi, jellies, sharks & capricorns — fish snacks help!)');
  ensureGround(m, 10, 23, 'sand');
  // winding coast road: vale gate -> stall -> school, with a spur to the pier
  windPath(m, [[2, 18], [6, 17], [11, 16], [16, 15], [22, 15], [27, 14], [30, 15]], 'path', 1.0, 411);
  windPath(m, [[30, 15], [34, 14], [38, 13], [40, 12]], 'path', 0.9, 412);
  windPath(m, [[22, 15], [21, 19], [20, 23], [20, 25]], 'path', 0.9, 413);
  // spawns
  SPAWN(m, 'crab', 4, 22, 40, 5, 5);
  SPAWN(m, 'jellyfish', 44, 28, 12, 8, 2);
  SPAWN(m, 'octopus', 6, 29, 20, 6, 3);
  SPAWN(m, 'jellyfish', 28, 29, 12, 6, 3);
  SPAWN(m, 'shark', 16, 29, 12, 7, 2);
  SPAWN(m, 'capricorn', 42, 9, 4, 10, 2);
  // the reef friends from Combi's Aquarium now live wild in the surf — catchable at last!
  SPAWN(m, 'seahorse', 8, 28, 20, 7, 3);
  SPAWN(m, 'angelfish', 26, 28, 22, 7, 3);
  SPAWN(m, 'pufferfish', 12, 30, 30, 5, 3);
  SPAWN(m, 'starfish', 6, 31, 44, 4, 4);
  m.start = { x: 4, y: 18 };
}
// ======================= SUNSPLASH SCHOOL =======================
{
  const m = newMap('school', 22, 16, 'wood', { name: 'Sunsplash School', song: 'coast', cliff: 'stone', zone: 'coast' });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'wall'); T(m, i, m.h - 1, 'wall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'wall'); T(m, m.w - 1, j, 'wall'); }
  T(m, 11, 15, 'wood'); LINK(m, 11, 15, 'coast', 40, 12);
  NPC(m, 11, 3, 'plume', 'Ms. Plume');
  SIGN(m, 8, 5, "Ms. Plume: 'My STAR PUPILS skipped snack time! Trap 3 of them with STARDUST COOKIES (B opens your bait cage) and I'll lend you my BOOMER-BONE.'");
  for (const [dx, dy] of [[5, 8], [10, 8], [15, 8], [5, 11], [15, 11]]) T(m, dx, dy, 'statue');
  SPAWN(m, 'starpupil', 3, 6, 16, 8, 4);
  m.start = { x: 11, y: 13 };
}
// ======================= THE DEEP BLUE (underwater maze) =======================
{
  const m = newMap('deep', 56, 44, 'seafloor', { name: 'The Deep Blue', song: 'deep', cliff: 'sea', zone: 'coast', underwater: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'coral'); T(m, i, m.h - 1, 'coral'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'coral'); T(m, m.w - 1, j, 'coral'); }
  scatter(m, 'kelp', 2, 2, 44, 32, 40, 71, ['seafloor']);
  scatter(m, 'kelp', 4, 4, 30, 30, 24, 96, ['seafloor']);
  scatter(m, 'kelp', 42, 24, 12, 12, 8, 97, ['seafloor']);
  // maze ribs (longer, windier)
  R(m, 8, 2, 1, 12, 'coral'); R(m, 8, 18, 1, 16, 'coral');
  R(m, 14, 6, 1, 26, 'coral'); R(m, 14, 6, 8, 1, 'coral');
  R(m, 20, 10, 1, 26, 'coral'); R(m, 26, 2, 1, 22, 'coral');
  R(m, 26, 28, 1, 10, 'coral'); R(m, 32, 8, 1, 26, 'coral');
  R(m, 21, 10, 6, 1, 'coral'); R(m, 27, 28, 5, 1, 'coral');
  R(m, 8, 38, 30, 1, 'coral'); R(m, 2, 33, 6, 1, 'coral');
  T(m, 14, 20, 'seafloor'); T(m, 20, 14, 'seafloor'); T(m, 26, 24, 'seafloor'); T(m, 32, 12, 'seafloor');
  // CORAL CURTAIN: a full-height reef wall seals the east; the TIDE GATE is the
  // ONLY gap (fixes the swim-around exploit — the lair is now a sealed pocket).
  R(m, 40, 1, 1, 42, 'coral');                          // the curtain (x40, full height)
  R(m, 35, 16, 5, 1, 'coral'); R(m, 35, 21, 5, 1, 'coral'); // canyon mouth walls
  R(m, 35, 17, 5, 4, 'seafloor');                       // approach pocket just west of the gate
  scatter(m, 'kelp', 33, 13, 7, 12, 12, 81, ['seafloor']);
  SIGN(m, 34, 22, 'The Kelp Canyon narrows to the TIDE GATE — the only door east.');
  // bubble exits (back to coast)
  OBJ(m, { type: 'bubble', x: 5, y: 5, to: 'coast', tx: 24, ty: 28 });
  OBJ(m, { type: 'bubble', x: 7, y: 30, to: 'coast', tx: 38, ty: 30 });
  SIGN(m, 5, 7, 'Glittering bubbles rise here — press SPACE to swim UP to the surface.');
  // tide gate: the single gap in the curtain
  R(m, 40, 18, 1, 2, 'gate');
  SIGN(m, 36, 16, 'THE TIDE GATE: "EIGHT sea friends shall part the waters." Beyond, SIR TWINKLE naps — he only wakes for the fisher who has caught EVERY creature of the Deep!');
  // Twinkle lair — a sealed bowl east of the curtain, entered ONLY via the gate
  R(m, 41, 6, 14, 32, 'seafloor');
  scatter(m, 'kelp', 42, 8, 12, 5, 9, 91, ['seafloor']);
  scatter(m, 'coral', 52, 8, 3, 24, 8, 95, ['seafloor']);
  OBJ(m, { type: 'boss', x: 48, y: 19, boss: 'twinkle' });
  CHEST(m, 51, 12, { item: 'crown' }, 'twinkle');
  CHEST(m, 51, 27, { heartpiece: 1 }, 'twinkle');
  // victory EXIT portal: surfaces by the second buoy
  LINK(m, 48, 7, 'coast', 38, 30, 'twinkle');
  CHEST(m, 4, 16, { gems: 3 }); CHEST(m, 28, 30, { gems: 4 }); CHEST(m, 22, 4, { coins: 20 });
  CHEST(m, 10, 40, { gems: 3 });
  SPAWN(m, 'octopus', 2, 2, 30, 34, 4);
  SPAWN(m, 'jellyfish', 4, 4, 28, 34, 4);
  SPAWN(m, 'capricorn', 8, 8, 22, 28, 3);
  SPAWN(m, 'shark', 22, 16, 9, 18, 2);
  SPAWN(m, 'seahorse', 4, 6, 28, 30, 3);
  SPAWN(m, 'angelfish', 6, 8, 26, 28, 3);
  SPAWN(m, 'pufferfish', 8, 10, 22, 26, 2);
  SPAWN(m, 'starfish', 6, 34, 44, 6, 3);
  m.start = { x: 5, y: 5 };
}
// ======================= STARFALL WASTES (cosmic warp-hop badlands) =======================
{
  const m = newMap('wastes', 58, 40, 'voidfloor', { name: 'Starfall Wastes', song: 'wastes', cliff: 'void', zone: 'wastes' });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rock'); T(m, i, m.h - 1, 'rock'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rock'); T(m, m.w - 1, j, 'rock'); }
  // a great RIFT SEA of stars fills the east — its shore is a ragged starlit coast
  for (let j = 1; j < 39; j++) {
    const hx = 20 + Math.round(1.4 * Math.sin(j * 0.26 + 0.8) + 0.8 * Math.sin(j * 0.61 + 2.0));
    for (let i = hx; i < 57; i++) T(m, i, j, 'rift');
  }
  // scatter cosmetic craters, crystals, meteor rocks & beacons through the hub
  scatter(m, 'crater', 2, 2, 16, 36, 16, 51, ['voidfloor']);
  for (const [cx, cy] of [[4, 6], [14, 9], [3, 30], [15, 33], [6, 11]]) OBJ(m, { type: 'prop', x: cx, y: cy, sprite: 'crystal' });
  for (const [bx, by] of [[2, 18], [17, 5], [17, 35]]) OBJ(m, { type: 'prop', x: bx, y: by, sprite: 'beacon' });
  scatter(m, 'rock', 22, 3, 32, 34, 10, 61, ['rift']);   // floating meteor-rocks in the void (cosmetic)
  // --- hub: Zibble's crashed saucer + traders ---
  OBJ(m, { type: 'prop', x: 8, y: 13, sprite: 'saucer' });
  NPC(m, 9, 16, 'zibble', 'Zibble');
  SIGN(m, 5, 18, "Zibble's saucer crash-landed! CERBERUS scattered its 3 STAR SHARDS onto asteroids out in the rift. Catch ALL the ALIENS to POWER the WARP PADS, then just STEP onto one to launch!");
  NPC(m, 13, 23, 'gruul', 'Gruul the Bounty Hunter');
  SIGN(m, 11, 25, 'GRUUL BUYS: aliens 3 gems, unicorns 5 gems. TWO unicorns = a HEART CONTAINER. Coins 10:1.');
  R(m, 4, 26, 3, 1, 'fence');
  NPC(m, 5, 27, 'marko', 'Marko');
  SIGN(m, 7, 28, "MARKO'S VOID STALL: cosmic cookies, upgrades, hearts.");
  // ASTRAL PORTAL -> the moving-asteroid unicorn dungeon
  OBJ(m, { type: 'portal', x: 13, y: 13, to: 'void', tx: 4, ty: 10 });
  SIGN(m, 13, 11, 'ASTRAL PORTAL: step in to reach THE ASTRAL DRIFT — UNICORNS roam its moving asteroids!');
  CHEST(m, 3, 4, { gems: 4 });
  // --- WARP NETWORK: a launch row on the rift's edge -> a shard asteroid each ---
  // helper: a 2-way warp pair (hub pad <-> island pad)
  function warpPair(hx, hy, ax, ay) {
    T(m, hx, hy, 'warp'); T(m, ax, ay, 'warp');
    OBJ(m, { type: 'warp', x: hx, y: hy, tx: ax, ty: ay });
    OBJ(m, { type: 'warp', x: ax, y: ay, tx: hx, ty: hy });
  }
  // ASTEROID A — shard 1 (north): a ragged floating rock, not a square
  R(m, 26, 5, 4, 3, 'voidfloor');
  blob(m, 29, 7, 3.9, 3.4, 'voidfloor', 0, 371, ['rift']);
  scatter(m, 'crater', 25, 4, 7, 7, 3, 71, ['voidfloor']);
  ensureGround(m, 29, 5, 'voidfloor'); ensureGround(m, 25, 9, 'voidfloor');
  OBJ(m, { type: 'prop', x: 29, y: 5, sprite: 'crystal' });
  warpPair(17, 7, 26, 7);
  OBJ(m, { type: 'shard', x: 28, y: 6, id: 'shard1' });
  SIGN(m, 25, 9, 'STARDUST ASTEROID. A shard glints here!');
  // ASTEROID B — shard 2 (mid-east)
  R(m, 38, 17, 4, 4, 'voidfloor');
  blob(m, 40, 19.5, 4.3, 4.0, 'voidfloor', 0, 372, ['rift']);
  scatter(m, 'crater', 37, 16, 7, 7, 4, 72, ['voidfloor']);
  ensureGround(m, 43, 17, 'voidfloor');
  OBJ(m, { type: 'prop', x: 43, y: 17, sprite: 'beacon' });
  warpPair(17, 16, 38, 19);
  OBJ(m, { type: 'shard', x: 41, y: 20, id: 'shard2' });
  // ASTEROID C — shard 3 (south)
  R(m, 31, 31, 4, 3, 'voidfloor');
  blob(m, 33.5, 32.5, 4.3, 3.4, 'voidfloor', 0, 373, ['rift']);
  scatter(m, 'crater', 30, 30, 7, 6, 4, 73, ['voidfloor']);
  ensureGround(m, 35, 31, 'voidfloor'); ensureGround(m, 34, 33, 'voidfloor');
  OBJ(m, { type: 'prop', x: 35, y: 31, sprite: 'crystal' });
  warpPair(17, 25, 31, 33);
  OBJ(m, { type: 'shard', x: 34, y: 33, id: 'shard3' });
  // BONUS ASTEROID — heart piece (far SE, its own pad)
  R(m, 49, 31, 4, 3, 'voidfloor');
  blob(m, 51, 32.5, 3.6, 3.2, 'voidfloor', 0, 374, ['rift']);
  scatter(m, 'crater', 48, 30, 6, 6, 3, 74, ['voidfloor']);
  ensureGround(m, 48, 35, 'voidfloor'); ensureGround(m, 52, 32, 'voidfloor');
  warpPair(17, 31, 49, 33);
  CHEST(m, 52, 32, { heartpiece: 1 });
  SIGN(m, 48, 35, 'A secret asteroid — treasure for the brave hopper!');
  // KEEP ASTEROID — Hound's Keep door (gated by all 3 shards via Zibble)
  R(m, 47, 10, 5, 4, 'voidfloor');
  blob(m, 50.5, 12, 4.6, 3.9, 'voidfloor', 0, 375, ['rift']);
  scatter(m, 'crater', 47, 9, 8, 7, 3, 75, ['voidfloor']);
  ensureGround(m, 48, 15, 'voidfloor'); ensureGround(m, 50, 10, 'voidfloor');
  OBJ(m, { type: 'prop', x: 47, y: 10, sprite: 'beacon' });
  warpPair(17, 11, 48, 12);
  R(m, 53, 9, 2, 7, 'rock');
  DOOR(m, 53, 12, 'flag', 'keepOpen', 'Starlight seals the keep. Bring Zibble his 3 STAR SHARDS first!');
  LINK(m, 53, 12, 'keep1', 15, 19);
  SIGN(m, 48, 15, "HOUND'S KEEP lies past this door — home of CERBERUS, the three-headed good boy.");
  CHEST(m, 50, 10, { coins: 20 });
  // creatures roam the hub plaza
  SPAWN(m, 'alien', 2, 3, 16, 34, 4);
  SPAWN(m, 'cometpup', 3, 5, 14, 28, 3);
  m.start = { x: 6, y: 20 };
}
// ============== THE ASTRAL DRIFT — moving-asteroid unicorn dungeon ==============
{
  const m = newMap('void', 44, 22, 'rift', { name: 'The Astral Drift', song: 'wastes', cliff: 'void', zone: 'wastes', dungeon: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rock'); T(m, i, m.h - 1, 'rock'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rock'); T(m, m.w - 1, j, 'rock'); }
  // START island (west) + the portal home
  R(m, 2, 8, 6, 6, 'voidfloor');
  scatter(m, 'crater', 2, 8, 6, 6, 3, 811, ['voidfloor']);
  OBJ(m, { type: 'portal', x: 3, y: 10, to: 'wastes', tx: 12, ty: 13 });
  SIGN(m, 5, 12, 'THE ASTRAL DRIFT: RIDE the moving asteroids! Step into the void and you fall back. UNICORNS graze on the far rocks — STUN (bone) then NET them!');
  // MID island — unicorns
  R(m, 16, 8, 7, 6, 'voidfloor');
  scatter(m, 'crater', 16, 8, 7, 6, 4, 812, ['voidfloor']);
  OBJ(m, { type: 'prop', x: 21, y: 9, sprite: 'crystal' });
  SPAWN(m, 'unicorn', 17, 9, 4, 4, 2);
  // EAST island — more unicorns + a reward
  R(m, 32, 8, 9, 6, 'voidfloor');
  scatter(m, 'crater', 32, 8, 9, 6, 5, 813, ['voidfloor']);
  OBJ(m, { type: 'prop', x: 39, y: 9, sprite: 'beacon' });
  SPAWN(m, 'unicorn', 33, 9, 6, 4, 3);
  CHEST(m, 39, 12, { heartpiece: 1 }, 'driftVault');
  T(m, 36, 5, 'rock'); OBJ(m, { type: 'lever', x: 36, y: 5, flag: 'driftVault', msg: 'CLICK! The STARDUST VAULT unseals on the east rock!' });
  SIGN(m, 33, 13, 'STARDUST PADDOCK — wild UNICORNS roam. The VAULT (NE) is sealed: flip its far LEVER with your BOOMER-BONE!');
  // the moving asteroid ferries: start -> mid -> east
  ASTEROID(m, 8, 9, 13, 9, 3, 4, 4.2, 0);
  ASTEROID(m, 23, 9, 29, 9, 3, 4, 4.6, 0.35);
  m.start = { x: 4, y: 10 };
}
// ======================= HOUND'S KEEP — multi-room =======================
// Room 1: STAR HALLS (an obstacle slalom: jump bar, climb ridge, harpoon span)
{
  const m = newMap('keep1', 30, 22, 'wall', { name: "Hound's Keep — Star Halls", song: 'dungeon', cliff: 'stone', zone: 'wastes', dungeon: true, dark: true });
  R(m, 14, 16, 3, 5, 'floor');
  T(m, 15, 20, 'floor'); LINK(m, 15, 20, 'wastes', 50, 18);
  R(m, 4, 4, 22, 12, 'floor');                        // the long hall
  SIGN(m, 5, 14, '1) The STAR HALLS test every skill: JUMP the crack, CLIMB the ridge, HARPOON the span. The little key waits at the end.');
  R(m, 8, 4, 1, 12, 'chasm');                         // jump bar
  R(m, 12, 4, 2, 12, 'floor', 1);                     // climb ridge (up & hop down)
  R(m, 17, 4, 3, 12, 'chasm');                        // 3-wide span: harpoon only
  POST(m, 16, 9); POST(m, 21, 9);
  CHEST(m, 23, 9, { key: 1 });
  CHEST(m, 5, 5, { coins: 10 });
  DOOR(m, 15, 3, 'lock'); LINK(m, 15, 3, 'keep2', 15, 21);
  SIGN(m, 23, 12, '2) The north door is LOCKED. Good thing about keys: they fit locks.');
  organicCave(m, 705, 4);
  m.start = { x: 15, y: 19 };
}
// Room 2: THE TRIPLE LOCKS (three blocks, three MACHINES: wall -> bridge -> twin doors)
{
  const m = newMap('keep2', 30, 24, 'wall', { name: "Hound's Keep — The Triple Locks", song: 'dungeon', cliff: 'stone', zone: 'wastes', dungeon: true, dark: true });
  R(m, 14, 19, 3, 4, 'floor');
  T(m, 15, 22, 'floor'); LINK(m, 15, 22, 'keep1', 15, 4);
  R(m, 14, 14, 11, 5, 'floor');                       // SE chamber (entry)
  R(m, 5, 14, 8, 5, 'floor');                         // SW chamber, behind the sinking wall (x13)
  R(m, 5, 12, 20, 2, 'chasm');                        // the starry moat
  R(m, 5, 4, 20, 8, 'floor');                         // north hall
  OBJ(m, { type: 'block', x: 17, y: 15, id: 'k2_b1' });
  OBJ(m, { type: 'block', x: 8,  y: 16, id: 'k2_b2' });
  OBJ(m, { type: 'block', x: 19, y: 6,  id: 'k2_b3' });
  T(m, 22, 16, 'switch'); T(m, 8, 14, 'switch'); T(m, 8, 8, 'switch');
  // the boxed-in block: open only from the EAST
  T(m, 18, 6, 'wall'); T(m, 19, 5, 'wall'); T(m, 19, 7, 'wall');
  SIGN(m, 15, 18, '1) THE TRIPLE LOCKS: only STONE weighs enough here. Each switch drives a different machine — follow the wires!');
  SIGN(m, 6, 17, '2) This switch hums... the bridge machine waits for weight.');
  SIGN(m, 23, 4, '3) Boxed in! Pushing is hopeless — stand beside it, GRAB, and PULL it free.');
  DOOR(m, 15, 3, 'flag', 'sw_keep2', 'Three clicks or no entry, says the door.');
  LINK(m, 15, 3, 'keep3', 13, 13);
  DOOR(m, 24, 9, 'flag', 'sw_keep2', 'This vault, too, waits for the third click.');
  R(m, 25, 8, 3, 4, 'floor');
  CHEST(m, 26, 9, { bosskey: 1 });
  m.puzzle = [
    { sw: [22, 16], flag: 'sw_keep2_1', to: 'floor',  tiles: [[13, 15], [13, 16]], color: '120,240,255', jingle: 'rumble', msg: 'RRRUMBLE! The west wall sinks into the floor!' },
    { sw: [8, 14],  flag: 'sw_keep2_2', to: 'bridge', tiles: [[15, 12], [15, 13]], color: '248,208,72',  jingle: 'door',   msg: 'CLUNK! A bridge slides across the starry moat!' },
    { sw: [8, 8],   flag: 'sw_keep2',   tiles: [], wireTo: [15, 3],                color: '220,110,230', jingle: 'bosswin', msg: 'KA-CHUNK! The den door AND the vault unlock!' },
  ];
  m.start = { x: 15, y: 20 };
}
// Room 3: CERBERUS DEN
{
  const m = newMap('keep3', 26, 16, 'wall', { name: "Hound's Keep — Cerberus Den", song: 'dungeon', cliff: 'stone', zone: 'wastes', dungeon: true, dark: true });
  R(m, 12, 11, 3, 4, 'floor');
  T(m, 13, 14, 'floor'); LINK(m, 13, 14, 'keep2', 15, 4);
  DOOR(m, 13, 10, 'boss');
  R(m, 6, 2, 14, 8, 'floor');                         // the den
  OBJ(m, { type: 'boss', x: 12, y: 5, boss: 'cerberus' });
  SIGN(m, 15, 12, '4) Cerberus naps between zoomies. BONE him while drowsy, then GRAB a head — all THREE heads (SPACE)!');
  // victory EXIT portal
  R(m, 20, 2, 3, 3, 'floor');
  LINK(m, 21, 3, 'wastes', 50, 18, 'cerberus');
  organicCave(m, 707, 3);
  m.start = { x: 13, y: 13 };
}
// ======================= WHISTLING CANYON =======================
{
  const m = newMap('canyon', 48, 40, 'dust', { name: 'Whistling Canyon', song: 'canyon', cliff: 'canyon', zone: 'canyon' });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rock'); T(m, i, m.h - 1, 'rock'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rock'); T(m, m.w - 1, j, 'rock'); }
  // grand tiers rising north — wavy hand-cut contours, anchored at every crossing
  {
    const wob = (i, ph) => 1.7 * Math.sin(i * 0.21 + ph) + 0.9 * Math.sin(i * 0.53 + ph * 2.1);
    const damp = (i, anchors) => { let d = 1; for (const [ax, rad] of anchors) { const dd = Math.abs(i - ax); if (dd < rad) d = Math.min(d, dd / rad); } return d; };
    for (let i = 1; i < 47; i++) {
      const b1 = 27.5 + Math.round(wob(i, 1.1) * damp(i, [[8, 5]]));
      const b2 = 19.5 + Math.round(wob(i, 2.3) * damp(i, [[36, 5], [14, 4]]));
      const b3 = 11.5 + Math.round(wob(i, 3.7) * damp(i, [[24, 7]]));
      for (let j = 1; j < 39; j++) {
        let e = j < b3 ? 3 : j < b2 ? 2 : j < b1 ? 1 : 0;
        // PYRAMID: higher tiers pull in from the sides (stepped mountain)
        const w2 = Math.round(Math.sin(j * 0.7 + i) * 1.2);
        if (e >= 2 && (i < 4 + w2 || i > 42 - w2)) e = 1;
        if (e >= 3 && (i < 10 + w2 || i > 44)) e = 2;
        m.elev[j][i] = e;
      }
    }
  }
  // tier connections
  T(m, 8, 27, 'stair', 0); // e0 -> e1
  R(m, 36, 19, 1, 1, 'ice', 2); // slick wall up to e2 (gloves)
  T(m, 36, 20, 'path', 1);
  T(m, 14, 19, 'path', 1);
  // e2 -> e3: harpoon over a WIDE void notch (3 tiles — no jump can cross)
  R(m, 20, 9, 8, 3, 'chasm', 2);
  T(m, 24, 8, 'path', 3); POST(m, 24, 8);
  T(m, 24, 12, 'path', 2); POST(m, 24, 12);   // lower post: the road back down
  SIGN(m, 25, 13, 'UP THE WHISTLER: 1) stairs west 2) the slick frost wall east (GLOVES) 3) HARPOON the summit post across the notch!');
  // the SUMMIT is a rift sea — the berry garden floats in it (WINGS only, truly)
  R(m, 1, 1, 46, 6, 'rift', 3);
  R(m, 16, 1, 16, 3, 'berrybed', 3);
  OBJ(m, { type: 'berry', x: 20, y: 2, id: 'berryA' });
  OBJ(m, { type: 'berry', x: 27, y: 2, id: 'berryB' });
  SIGN(m, 18, 8, 'RAINBOW BERRY GARDEN across the wide rift — only ANGEL WINGS can cross (X in mid-air to FLAP, again and again!)');
  // Rainbow Spire door (on summit, east of garden)
  R(m, 38, 1, 6, 6, 'rock', 3);
  DOOR(m, 40, 4, 'flag', null, null, 3); LINK(m, 40, 4, 'spire', 15, 35);
  T(m, 40, 5, 'path', 3); T(m, 40, 6, 'path', 3);
  SIGN(m, 42, 8, 'THE RAINBOW SPIRE. The trickster MIMI SAHOR waits at the top. Bring a RAINBOW BERRY!');
  // NPCs
  NPC(m, 12, 32, 'cora', 'Cliffside Cora');
  SIGN(m, 14, 33, 'CORA TRADES: one DRAGON = ANGEL WINGS! (Dragons nap on the 3rd tier: BONE-stun, then NET.) Capricorns 4 gems. Coins 10:1.');
  R(m, 29, 22, 3, 1, 'fence');
  NPC(m, 30, 23, 'marko', 'Marko');
  SIGN(m, 32, 24, "MARKO'S SUMMIT STALL: final upgrades & hearts!");
  // switchback trails on every tier
  windPath(m, [[6, 35], [7, 32], [8, 30], [8, 28]], 'path', 1.0, 921);                                  // canyon floor -> stairs
  windPath(m, [[8, 26], [10, 25], [14, 24], [19, 23], [24, 23], [28, 23], [32, 23], [36, 21]], 'path', 1.0, 922);  // tier 1 road -> frost wall
  windPath(m, [[36, 18], [33, 17], [29, 16], [26, 15], [24, 14]], 'path', 1.0, 923);                    // tier 2 road -> notch post
  windPath(m, [[24, 8], [28, 8], [32, 7], [36, 7], [40, 6]], 'path', 0.95, 924);                        // summit road -> Spire
  windPath(m, [[8, 30], [10, 32], [12, 33]], 'path', 0.9, 925);                                          // spur to Cora
  // decorations & extras
  scatter(m, 'tree', 3, 29, 20, 9, 8, 91, ['dust']);
  scatter(m, 'bush', 20, 13, 20, 5, 6, 92, ['dust']);
  scatter(m, 'bush', 6, 2, 6, 7, 4, 95, ['dust']);
  scatter(m, 'rock', 2, 20, 6, 4, 3, 93, ['dust']);
  scatter(m, 'rock', 40, 24, 6, 5, 3, 94, ['dust']);
  CHEST(m, 4, 14, { gems: 4 }); CHEST(m, 44, 14, { heartpiece: 1 }); CHEST(m, 4, 36, { coins: 18 });
  SPAWN(m, 'dragon', 16, 13, 24, 5, 2);
  SPAWN(m, 'condor', 6, 21, 30, 6, 3);
  SPAWN(m, 'ibex', 10, 29, 26, 9, 3);
  m.start = { x: 6, y: 34 };
}
// ======================= RAINBOW SPIRE (finale) =======================
{
  const m = newMap('spire', 30, 38, 'wall', { name: 'Rainbow Spire', song: 'boss', cliff: 'stone', zone: 'canyon', dungeon: true });
  // the LONG CLIMB: a narrow torchlit hall, statues watching
  R(m, 14, 21, 3, 15, 'floor');
  LINK(m, 15, 36, 'canyon', 40, 6); T(m, 15, 36, 'floor');
  for (const sy of [24, 28, 32]) { T(m, 13, sy, 'statue'); T(m, 17, sy, 'statue'); }
  SIGN(m, 14, 33, 'FINAL CHALLENGE! Phase 1: Sahor blinks between pillars — HARPOON the GLOWING RING under her perch.');
  SIGN(m, 16, 26, 'Phase 2: drop a RAINBOW BERRY cage (tool 4) on her racing path and shoo her in!');
  R(m, 13, 20, 5, 1, 'floor');
  R(m, 3, 3, 24, 17, 'floor');
  // perch pillars
  for (const [px, py] of [[6, 6], [23, 6], [6, 16], [23, 16]]) T(m, px, py, 'statue');
  OBJ(m, { type: 'boss', x: 15, y: 11, boss: 'sahor' });
  // a PORTAL tears open here once Sahor is caught -> the true finale
  DOOR(m, 15, 2, 'flag', 'sahor', 'A swirling portal — it opens once MIMI SAHOR is caught!');
  LINK(m, 15, 2, 'roost', 4, 26);
  SIGN(m, 12, 4, 'RAMSI awaits! Once Sahor falls, step into the PORTAL to his floating ROOST.');
  organicCave(m, 708, 3);
  m.start = { x: 15, y: 35 };
}
// ======================= RAMSI'S ROOST — the all-gear finale ======================
// One grand sky-temple gauntlet that demands EVERY movement power in sequence.
{
  const m = newMap('roost', 56, 30, 'rift', { name: "Ramsi's Roost", song: 'boss', cliff: 'stone', zone: 'canyon', dungeon: true });
  // floating in a starry void: islands of skyfloor connected by gear-gated crossings
  // --- entry island (SW) ---
  R(m, 2, 23, 8, 6, 'skyfloor');
  T(m, 4, 28, 'skyfloor'); LINK(m, 4, 28, 'spire', 15, 4);
  SIGN(m, 3, 26, "RAMSI'S ROOST. Every power you earned, used at last — JUMP, CLIMB, HARPOON, DIVE, FLY! Begin east.");
  for (const [cx, cy] of [[2, 22], [9, 27]]) OBJ(m, { type: 'prop', x: cx, y: cy, sprite: 'crystal' });
  // 1) JUMP — a chasm gap to the next island
  R(m, 12, 23, 7, 6, 'skyfloor');
  R(m, 10, 23, 2, 6, 'chasm');                 // 2-wide... sandals jump (boosted) clears 1; make 1-wide:
  R(m, 11, 23, 1, 6, 'skyfloor'); R(m, 10, 23, 1, 6, 'chasm');
  SIGN(m, 12, 27, '1) JUMP the gap (X)!');
  // 2) CLIMB — a slick ice wall up onto a higher terrace
  R(m, 12, 16, 8, 7, 'skyfloor', 1);
  R(m, 14, 22, 4, 1, 'ice', 1);                // slick face at the elev boundary (gloves only)
  SIGN(m, 16, 20, '2) CLIMB the frosty wall (need GLOVES)!');
  // 3) HARPOON — zip a post across a void notch to a mid island
  R(m, 21, 15, 8, 7, 'skyfloor', 1);
  R(m, 20, 15, 1, 8, 'rift', 1);               // 1-wide rift wall? harpoon over it
  R(m, 19, 16, 2, 5, 'rift');                  // wide notch (3 total) — no jump
  T(m, 22, 18, 'skyfloor', 1); POST(m, 22, 18); E(m, 22, 18, 1, 1, 1);
  POST(m, 17, 18); E(m, 17, 18, 1, 1, 1); T(m, 17, 18, 'skyfloor', 1);  // return post on the climb terrace
  SIGN(m, 23, 20, '3) HARPOON the golden post across the void (Z)!');
  // 4) DIVE — a sky-spring pool you must swim across (DIVING SUIT)
  R(m, 29, 16, 9, 6, 'skyfloor');
  R(m, 30, 17, 7, 4, 'water');
  T(m, 34, 16, 'skyfloor'); CHEST(m, 34, 16, { heartpiece: 1 });
  SIGN(m, 29, 21, '4) DIVE in and SWIM across (need the SUIT)!');
  // 5) FLY — a great rift only ANGEL WINGS can cross
  R(m, 40, 14, 10, 9, 'skyfloor');
  R(m, 38, 12, 2, 13, 'rift');                 // wide void: wings only
  SIGN(m, 41, 21, '5) FLY across the great void (X to flap, again and again)!');
  // 6) BRACERS — push a sky-block onto a star switch to drop Ramsi's cage
  R(m, 44, 6, 11, 9, 'skyfloor');
  OBJ(m, { type: 'block', x: 46, y: 11, id: 'roost_b1' });
  T(m, 50, 9, 'switch');
  DOOR(m, 52, 9, 'flag', 'sw_roost', "Ramsi's cage holds until the star switch CLICKS...");
  R(m, 52, 6, 3, 6, 'skyfloor');
  // the cage CELL: solid cloud ring so the star-switch door is the ONLY way in (audit fix —
  // it used to stand in open floor and could simply be walked around)
  R(m, 52, 6, 3, 1, 'cloud'); T(m, 52, 7, 'cloud'); T(m, 52, 8, 'cloud'); T(m, 52, 10, 'cloud');
  R(m, 53, 10, 2, 1, 'cloud'); R(m, 55, 6, 1, 5, 'cloud');
  DOOR(m, 52, 9, 'flag', 'sw_roost', "Ramsi's cage holds until the star switch CLICKS...");
  // ^ re-stamped: the original DOOR tile was overwritten by the skyfloor fill above it,
  //   so the cage gate never physically existed — the star switch was always skippable.
  SIGN(m, 44, 13, '6) Grab the sky-block (SPACE) and park it on the STAR SWITCH to free him!');
  // RAMSI himself, caged, on the summit
  OBJ(m, { type: 'ramsi', x: 53, y: 8, roost: true });
  CHEST(m, 41, 15, { gems: 6 });
  for (const [cx, cy] of [[42, 22], [48, 14], [54, 5]]) OBJ(m, { type: 'prop', x: cx, y: cy, sprite: 'beacon' });
  m.start = { x: 4, y: 26 };
  m.roost = true;
}
if (typeof buildWorld2 === 'function') buildWorld2();   // World 2: Skyward Ascent
if (typeof buildUnderburrow === 'function') buildUnderburrow();   // World 2: The Underburrow (levels 5-8)
// how far the camera must over-scan above y=0 so lifted terrain near the top
// edge (snow summits, the rainbow-berry garden...) is never masked
for (const m of Object.values(MAPS)) {
  let pad = 0;
  for (let j = 0; j < Math.min(7, m.h); j++)
    for (let i = 0; i < m.w; i++) {
      const e = m.elev[j][i];
      if (e > 0 && e < 9) pad = Math.max(pad, e * EOFF - j * TILE + 26);
    }
  m.topPad = pad;
}
}
// world map node layout (painted level select)
// x/y = positions for the built-in painted island; bx/by = positions tuned to
// the optional worldmap_bg.png (measured from the art's actual region centers).
const WORLD_NODES = [
  { id: 'vale',   x: 150, y: 170, bx: 158, by: 190, label: 'Greenwood Vale',  req: null },
  { id: 'coast',  x: 300, y: 190, bx: 274, by: 212, label: 'Sunsplash Coast', req: 'coastPath' },
  { id: 'wastes', x: 360, y: 90,  bx: 379, by: 90,  label: 'Starfall Wastes', req: 'crown' },
  { id: 'canyon', x: 200, y: 60,  bx: 192, by: 65,  label: 'Whistling Canyon', req: 'cerberus' },
];
// World 3 has its OWN map: a clockwork level-select (no shared overworld trail)
const WORLD3_NODES = [
  { id: 'cog1', label: 'Cogwerk City',   req: null,      x: 72,  y: 100 },
  { id: 'cog2', label: 'The Pipeworks',  req: 'sc_cog1', x: 188, y: 150 },
  { id: 'cog3', label: 'The High Roofs', req: 'sc_lady', x: 300, y: 92 },
  { id: 'cog4', label: 'The All-Beast',  req: 'sc_cog3', x: 416, y: 148 },
  { id: 'vale', label: 'Greenwood Vale', req: null, exit: true, x: 240, y: 214 },
];
function nodeX(n) { return (Sprites && Sprites.worldMapBg && n.bx !== undefined) ? n.bx : n.x; }
function nodeY(n) { return (Sprites && Sprites.worldMapBg && n.by !== undefined) ? n.by : n.y; }
// optional custom trail waypoints between consecutive nodes, keyed 'i-j' (i<j)
let WORLD_PATHS = {};
// apply positions saved by the drag editor (worldmap_nodes.js -> window.NQ_MAP_OVERRIDE)
function applyMapOverride(ov) {
  const o = ov || ((typeof window !== 'undefined') && window.NQ_MAP_OVERRIDE);
  if (!o) return;
  if (o.nodes) for (const n of WORLD_NODES) if (o.nodes[n.id]) { n.bx = o.nodes[n.id].x; n.by = o.nodes[n.id].y; }
  WORLD_PATHS = o.paths || {};
}
// full point list (incl. waypoints) for a directional walk between adjacent nodes a->b
function segPoints(a, b) {
  const key = Math.min(a, b) + '-' + Math.max(a, b);
  let wp = (WORLD_PATHS[key] || []).map(p => [p[0], p[1]]);
  if (b < a) wp.reverse();
  return wp;
}
