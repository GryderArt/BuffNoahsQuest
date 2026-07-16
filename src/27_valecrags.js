"use strict";
// ============ RAMSI EVERYWHERE + THE CLIFFSIDE CROSSING (vale -> coast sub-level) ============
// 1) Ramsi (or SUPER RAMSI) follows Noah through EVERY world once rescued — fixes the
//    invisible "RAMSI shields you!" bug.
// 2) The Vale itself is back to STOCK. Its old east exit now opens into THE CLIFFSIDE
//    CROSSING: a terraced trek that starts Vale-green and turns sandier and bluer with
//    every climb until the sea — slick-stone faces (gloves ONLY, sandal-jumps slip),
//    zip-wires that reject bare hands, ladder pockets, and a grand one-way ride to the
//    beach. Its far exit runs the classic flow: world map + coastPath + the Bramble Road.

// ---- 1. the companion roams every world (he just waits out swims) ----
Game.companionActive = function () {
  // everywhere post-rescue — including underwater, where Ramsi rides a DIVING BELL
  return !!(this.flags.ramsi && this.map);
};

// ---- 2. ZIP-WIRES ----
Game.tryZip = function () {
  if (this.zip) return true;
  if (Player.lungeT > 0 || Player.grab) return false;         // a LUNGE is a lunge — never a zip
  const m = this.map; if (!m) return false;
  for (const o of m.objects) {
    if (o.type !== 'zipanchor') continue;
    if (dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) > 13) continue;
    if (!this.flags.gloves) {
      Audio2.jingle('denied');
      const dx = Math.sign(Player.x - (o.x * TILE + 8)) || 1;
      Player.x += dx * 8;
      Particles.burst(o.x * TILE + 8, o.y * TILE, 'dust');
      this.toast('Your BARE HANDS slip right off! CLIMBING GLOVES grip the wire (Marko, 8 gems).');
      return true;
    }
    const e0 = elevAt(m, o.x, o.y), e1 = elevAt(m, o.tx, o.ty);
    if (e0 <= e1) { Audio2.jingle('talk'); this.toast('The wire only slides DOWNHILL — climb to its TOP!'); return true; }
    const x0 = o.x * TILE + 8, y0 = o.y * TILE + 8, x1 = o.tx * TILE + 8, y1 = o.ty * TILE + 8;
    const len = dist(x0, y0, x1, y1);
    this.zip = { x0, y0, x1, y1, e0, e1, t: 0, dur: Math.max(0.5, len / 150), sag: Math.min(14, len * 0.06) };
    Audio2.jingle('flap');
    this.toast('WHEEE!');
    return true;
  }
  return false;
};
Game.updateZip = function (dt) {
  const z = this.zip; if (!z) return;
  z.t += dt / z.dur;
  const t = Math.min(1, z.t);
  Player.x = lerp(z.x0, z.x1, t);
  Player.y = lerp(z.y0, z.y1, t) + z.sag * 4 * t * (1 - t);
  Player.elev = Math.round(lerp(z.e0, z.e1, t));
  Player.inv = Math.max(Player.inv, 0.2);
  Player.airborne = true;                                      // hang in the air like a proper ride
  Player.vx = 0; Player.vy = 0;
  if (((z.t * 14) | 0) !== (((z.t - dt / z.dur) * 14) | 0)) Particles.burst(Player.x, Player.y - 18 - Player.elev * EOFF, 'sparkle');
  if (z.t >= 1) {
    Player.x = z.x1; Player.y = z.y1; Player.elev = z.e1;
    Player.airborne = false;
    this.zip = null;
    Audio2.jingle('cage'); Particles.burst(Player.x, Player.y, 'dust');
  }
};
{
  const _int = Game.interact;
  Game.interact = function () {
    if (this.state === 'play' && this.tryZip && this.tryZip()) return;
    return _int.call(this);
  };
}

// ---- drawers ----
Game.OBJDRAW = Game.OBJDRAW || {};
// NOTE the OBJDRAW dispatch conventions (12_main): ox/oy = the tile's TOP-LEFT px,
// and e arrives ALREADY in pixels (elev level * EOFF). Never multiply by EOFF again.
Game.OBJDRAW.zipanchor = function (c, o, ox, oy, e) {
  const px = ox + 8, base = oy + 16 - (e || 0);              // pole foot, planted on its (raised) tile
  const wireY = (x, y) => {                                   // wire attach point for any anchor tile
    const lv = Math.min(elevAt(Game.map, x, y), 8);
    return y * TILE + 16 - lv * EOFF - 22;
  };
  if (o.draws) {
    const ax = px, ay = wireY(o.x, o.y), bx = o.tx * TILE + 8, by = wireY(o.tx, o.ty);
    const mx = (ax + bx) / 2, my = (ay + by) / 2 + Math.min(14, dist(ax, ay, bx, by) * 0.06);
    c.strokeStyle = '#241a33'; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, bx, by); c.stroke();
    c.strokeStyle = '#c8d0dc'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, bx, by); c.stroke();
  }
  c.fillStyle = '#241a33'; c.fillRect(px - 2, base - 25, 5, 25);
  c.fillStyle = '#8a5c2c'; c.fillRect(px - 1, base - 24, 3, 23);
  c.fillStyle = '#241a33'; c.beginPath(); c.arc(px, base - 25, 4, 0, 7); c.fill();
  c.fillStyle = ((Game.time * 3 | 0) % 2) ? '#e8c060' : '#f8d048';
  c.beginPath(); c.arc(px, base - 25, 2.6, 0, 7); c.fill();
  if (!Game.zip && dist(Player.x, Player.y, px, oy + 8) < 26)
    drawText(c, Game.flags.gloves ? 'SPACE: ZIP!' : 'gloves...', px - 18, base - 38, 7, Game.flags.gloves ? '#f8e858' : '#b0a0c8', '#241a33');
};
Game.OBJDRAW.laddervis = function (c, o, ox, oy, e) {
  // the ladder leans on its tile's south face: from the raised lip down to raw ground
  const px = ox + 8, lip = oy + 16 - (e || 0) - 3, foot = oy + 18;
  c.fillStyle = '#241a33'; c.fillRect(px - 6, lip, 3, foot - lip); c.fillRect(px + 3, lip, 3, foot - lip);
  c.fillStyle = '#a8703c'; c.fillRect(px - 5, lip + 1, 1.6, foot - lip - 2); c.fillRect(px + 4, lip + 1, 1.6, foot - lip - 2);
  const rungs = Math.max(3, ((foot - lip - 4) / 4) | 0);
  for (let k = 0; k < rungs; k++) { c.fillStyle = '#241a33'; c.fillRect(px - 5, lip + 3 + k * 4, 10, 2.4); c.fillStyle = '#c08850'; c.fillRect(px - 4, lip + 3.5 + k * 4, 8, 1.4); }
};

// ---- 3. THE CLIFFSIDE CROSSING (its own map; the Vale stays untouched) ----
(function buildCliffsideCrossing() {
  if (typeof newMap !== 'function' || MAPS.crags) return;
  const m = newMap('crags', 88, 24, 'grass', { name: 'The Cliffside Crossing', song: 'coast', cliff: 'dirt', zone: 'vale' });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, i < 34 ? 'tree' : 'palm'); T(m, i, m.h - 1, i < 34 ? 'tree' : 'palm'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'tree'); T(m, 87, j, 'water'); }
  // FOUR sea-water CHANNELS split FIVE lands; only the ZIP-WIRES cross them
  R(m, 13, 1, 3, 22, 'water');
  R(m, 16, 1, 14, 22, 'grass', 1);
  R(m, 30, 1, 3, 22, 'water');
  R(m, 33, 1, 16, 22, 'sand', 1);
  R(m, 49, 1, 3, 22, 'water');
  R(m, 52, 1, 16, 22, 'sand', 1);
  R(m, 68, 1, 3, 22, 'water');
  R(m, 71, 1, 16, 22, 'sand', 0);
  const ring = (x, y, w, h, tile, e) => {
    for (let i = x; i < x + w; i++) { T(m, i, y, tile, e); T(m, i, y + h - 1, tile, e); }
    for (let j = y; j < y + h; j++) { T(m, x, j, tile, e); T(m, x + w - 1, j, tile, e); }
  };
  // a small 3x3 SUMMIT platform at elev `e`, centred on column cx, with a pole spot at (cx, py)
  const summit = (cx, py, e) => { R(m, cx - 1, py - 1, 3, 3, 'grass', e); };
  // === STRUCTURE 1 — THE LESSON MOUNT (meadow e0): two SLICK steps, gloves-only ===
  T(m, 8, 12, 'ice', 1); T(m, 8, 11, 'ice', 2);                 // e0 -> e1 -> e2 slick face
  summit(8, 9, 2); T(m, 8, 10, 'grass', 2);                     // pole platform at e2
  // === STRUCTURE 2 — THE LADDER SPIRE (green band e1): a LADDER, NO gloves needed ===
  T(m, 22, 12, 'stair', 2); OBJ(m, { type: 'laddervis', x: 22, y: 12 });   // e1 -> e2
  T(m, 22, 11, 'stair', 3); OBJ(m, { type: 'laddervis', x: 22, y: 11 });   // e2 -> e3
  summit(22, 8, 3); T(m, 22, 9, 'grass', 3); T(m, 22, 10, 'grass', 3);
  // === STRUCTURE 3 — THE STAIR-AND-SLICK TOWER (sand1 e1): stairs to e3, then a SLICK lip to e4 ===
  T(m, 40, 12, 'stair', 2); OBJ(m, { type: 'laddervis', x: 40, y: 12 });   // e1 -> e2
  T(m, 40, 11, 'stair', 3); OBJ(m, { type: 'laddervis', x: 40, y: 11 });   // e2 -> e3
  T(m, 40, 10, 'ice', 4);                                                   // e3 -> e4 SLICK (gloves!)
  summit(40, 7, 4); T(m, 40, 8, 'grass', 4); T(m, 40, 9, 'grass', 4);
  // === STRUCTURE 4 — THE SHEER FACE (sand2 e1): the TALLEST, all-SLICK climb (gloves) ===
  T(m, 58, 12, 'ice', 2); T(m, 58, 11, 'ice', 3); T(m, 58, 10, 'ice', 4);   // e1 -> e2 -> e3 -> e4, ALL slick (gloves!)
  summit(58, 7, 4); T(m, 58, 8, 'grass', 4); T(m, 58, 9, 'grass', 4);
  // THE ZIP-WIRES (downhill only; the ONLY crossing) — draws on the LOWER pole so the end never clips
  const zipline = (x1, y1, x2, y2) => {
    const lowFirst = y1 >= y2;
    OBJ(m, { type: 'zipanchor', x: x1, y: y1, tx: x2, ty: y2, draws: lowFirst });
    OBJ(m, { type: 'zipanchor', x: x2, y: y2, tx: x1, ty: y1, draws: !lowFirst });
  };
  zipline(8, 9, 17, 13);            // Lesson Mount        -> green band (A)
  zipline(22, 8, 34, 12);           // Ladder Spire        -> sand1      (B)
  zipline(40, 7, 53, 12);           // Stair-&-Slick Tower -> sand2      (C)
  zipline(58, 7, 72, 13);           // Bounce Bluff        -> the beach  (D)
  // ladder-knoll PRACTICE wire (gloveless can reach it)
  R(m, 3, 15, 3, 3, 'grass', 1);
  T(m, 4, 18, 'stair', 1); OBJ(m, { type: 'laddervis', x: 4, y: 18 });
  CHEST(m, 4, 16, { gems: 4 });
  zipline(4, 16, 2, 12);
  // theme gradient + life
  scatter(m, 'flowers', 2, 3, 11, 17, 8, 271, ['grass']);
  scatter(m, 'bush', 2, 3, 11, 17, 4, 272, ['grass']);
  scatter(m, 'pebbles', 17, 3, 12, 18, 6, 273, ['grass']);
  scatter(m, 'shell', 34, 3, 52, 18, 12, 274, ['sand']);
  scatter(m, 'palm', 52, 3, 30, 17, 6, 275, ['sand']);
  T(m, 62, 16, 'water'); T(m, 63, 16, 'water'); T(m, 62, 17, 'water'); T(m, 64, 17, 'shell');
  CHEST(m, 25, 17, { gems: 5 });
  CHEST(m, 44, 17, { heartpiece: 1 });
  CHEST(m, 63, 17, { gems: 8 });
  LINK(m, 1, 20, 'vale', 59, 33); T(m, 1, 20, 'path');
  LINK(m, 86, 18, 'coast', 2, 18); T(m, 86, 18, 'path'); T(m, 85, 18, 'path');
  SPAWN(m, 'goat', 18, 4, 8, 16, 2);
  SPAWN(m, 'ibex', 35, 4, 10, 8, 2);
  SPAWN(m, 'crab', 54, 6, 14, 12, 2);
  SPAWN(m, 'condor', 47, 4, 10, 6, 1);
  SIGN(m, 3, 21, 'THE CLIFFSIDE CROSSING — five lands, four channels of sea! Each summit holds a ZIP-WIRE, the only way across. Climb all sorts of ways: SLICK stone (gloves!), LADDERS, STAIRS, and a BOUNCE.');
  SIGN(m, 8, 13, 'THE LESSON MOUNT: two SLICK climbs (gloves!) to the pole. Wires slide DOWNHILL only — bare hands slip!');
  SIGN(m, 21, 12, 'THE LADDER SPIRE: climb the LADDER (no gloves!) to its top wire.');
  SIGN(m, 37, 14, 'THE STAIR-&-SLICK TOWER: climb the STAIRS, then one slick lip (gloves!) to the wire.');
  SIGN(m, 54, 15, 'THE SHEER FACE: the tallest climb — SLICK all the way up. Gloves and courage!');
  SIGN(m, 84, 19, 'SUNSPLASH COAST ahead — over the dunes and onto the World Map!');
  m.start = { x: 2, y: 20 };
})();
