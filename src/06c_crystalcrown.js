"use strict";
// ================= THE CRYSTAL CROWN — Whistling Canyon's new summit =================
// The unified world map keeps the Rainbow Spire as red rock with the crystal tower
// blooming out of its peak. This file makes the LEVEL match: the canyon map grows
// 12 rows taller at the TOP, and a pastel prismatic tower (new 'prism*' tiles in
// 05_tiles) rises straight out of the old Rainbow-Spire door block. Balconies of
// crystal floor float in the rift sky — ANGEL WINGS territory, same as the berry
// garden — with a chest, shard clusters and an in-world rainbow over the tip.
(function () {
  const EXT = 12;
  function extendCanyon() {
    const m = MAPS.canyon;
    if (!m || m._crown) return; m._crown = true;
    m.topPad = Math.max(m.topPad || 0, 3 * EOFF + 4);   // let the camera see the sky above the elev-3 lifted tower
    // ---- grow 12 rows at the top; everything painted so far slides DOWN 12 ----
    for (let k = 0; k < EXT; k++) {
      const tr = new Array(m.w).fill('rift'); tr[0] = 'rock'; tr[m.w - 1] = 'rock';
      const er = new Array(m.w).fill(3); er[0] = 0; er[m.w - 1] = 0;
      m.tiles.unshift(tr); m.elev.unshift(er);
    }
    m.h += EXT;
    for (const o of m.objects) o.y += EXT;
    for (const l of m.links) l.y += EXT;
    for (const s of m.spawns) s.y += EXT;
    m.start.y += EXT;
    const nd = {}; for (const k of Object.keys(m.doors)) { const [dx, dy] = k.split(','); nd[dx + ',' + (+dy + EXT)] = m.doors[k]; }
    m.doors = nd;
    // the map's old top border row (now row 12) joins the rift sky so the areas merge
    R(m, 1, EXT, m.w - 2, 1, 'rift', 3);
    // new outer border on the new top row
    R(m, 0, 0, m.w, 1, 'rock', 0);
    // arriving links from other maps still point at old coordinates — shift them
    if (MAPS.spire) for (const l of MAPS.spire.links) if (l.to === 'canyon') l.ty += EXT;
    // ---- THE TOWER: pastel crystal, blooming straight out of the spire-door rock ----
    // (the old door block sits at x38-43, now rows 13-18; the door itself at 40,16)
    R(m, 37, 10, 9, 3, 'prism', 3);           // base storey
    R(m, 38, 7, 7, 3, 'prism', 3);            // middle storey
    R(m, 39, 4, 5, 3, 'prism', 3);            // upper storey
    T(m, 41, 3, 'prism', 3);                  // the tip (rows 1-2 stay open sky for the rainbow)
    // ---- balconies: crystal floor floating in the rift sky (WINGS to reach) ----
    R(m, 34, 9, 3, 4, 'prismfloor', 3);       // west balcony
    T(m, 34, 9, 'prismglow', 3); T(m, 36, 12, 'prismglow', 3);
    R(m, 46, 9, 1, 4, 'prismfloor', 3);       // east ledge
    T(m, 46, 9, 'prismglow', 3);
    R(m, 45, 5, 2, 4, 'prismfloor', 3);       // TIP PERCH: fly higher to stand beside the peak
    T(m, 45, 5, 'prismglow', 3);              // (from up here the camera shows the tip + rainbow)
    T(m, 33, 11, 'prismshard', 3);            // shard clusters at the rails
    T(m, 35, 12, 'prismshard', 3);
    T(m, 46, 12, 'prismshard', 3);
    CHEST(m, 34, 11, { gems: 10 });
    // Berkley's SECRET: a tiny sky pad hides in the far NW corner of the rift — no sign,
    // no trail, just a glint for sharp-eyed flyers. A CRYSTAL SHARD (craft material) waits.
    R(m, 1, 1, 2, 2, 'prismfloor', 3);
    OBJ(m, { type: 'material', mat: 'crystalshard', x: 2, y: 2, id: 'mat_crystalshard_canyonsky' });
    SIGN(m, 35, 10, "THE CRYSTAL CROWN! Sahor's tower BLOOMS right out of the old red rock. FLAP (X, again and again) across the sky to walk its balconies!");
    // the rainbow + ambient sparkle over the tip (pure spectacle)
    OBJ(m, { type: 'crownrainbow', x: 41, y: 1, deco: true });   // rainbow in the open sky over the tip (not a reachability target)
  }
  // ---- draw: the rainbow arcs + drifting sparkles above the tower ----
  // (registered from the buildMaps wrapper — `Game` doesn't exist yet at module load)
  function installCrownDraw() {
    Game.OBJDRAW = Game.OBJDRAW || {};
    Game.OBJDRAW.crownrainbow = crownRainbowDraw;
  }
  const _bm = buildMaps;
  buildMaps = function () { _bm(); extendCanyon(); installCrownDraw(); };
  if (typeof MAPS !== 'undefined' && MAPS.canyon) extendCanyon();

  function crownRainbowDraw(c, o, ox, oy, e) {
    const t = Game.time, cx = ox + 8, cy = oy - (e || 0) + 30;   // lift with the elev-3 terrain
    const RB = ['#e84a4a', '#f89238', '#f8d048', '#58c452', '#4878e8', '#9a62e0'];
    c.save(); c.globalAlpha = 0.9;
    for (let k = 0; k < RB.length; k++) {
      c.strokeStyle = RB[k]; c.lineWidth = 2;
      c.beginPath(); c.arc(cx, cy, 16 + k * 2.2, Math.PI * 1.06, Math.PI * 1.94); c.stroke();
    }
    c.lineWidth = 1; c.restore();
    for (let k = 0; k < 6; k++) {                       // slow sparkle drift around the tip
      const a = t * 0.7 + k * 1.05, rr = 13 + 6 * Math.sin(t * 0.9 + k * 2);
      c.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.5 * Math.abs(Math.sin(t * 2.4 + k))).toFixed(2) + ')';
      c.fillRect(cx + Math.cos(a) * rr, cy - 4 + Math.sin(a) * rr * 0.5, 2, 2);
    }
  }
})();
