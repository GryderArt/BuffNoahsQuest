"use strict";
// ============== BURROW 7 REBUILT — CRYSTAL DEEP: the LIGHT-BEAM level ==============
// This file OVERRIDES buildBurrow7 from 16_underburrow_maps.js (later declaration wins),
// and introduces two reusable systems:
//   * Beams  — glow-charged crystals fire light-beams; RAMSI butts a crystal to TURN it.
//              Beams chain crystal-to-crystal, LIGHT the dark, harden LIGHT-BRIDGES over
//              star-chasms (rift tiles registered in m._beamBridges), and trigger SUNRUNES.
//   * lightMask — real darkness for maps with m.lightMask=true: a black veil punched by
//              light sources (Ramsi's Glow, glow-veins, crystals, beams, the Great Prism).
// The GEODE GOLEM is rebuilt: it drinks the dark — invisible in shadow, visible in glow,
// SLOWED with long open-windows while a beam bathes it. (In the vault3 re-fight, Ramsi's
// glow alone lights it, so the gauntlet still works with zero crystals.)

// ----------------------------- tiny helpers -----------------------------
function cdMkCanvas(w, h) {
  if (typeof __mkCanvas !== 'undefined') return __mkCanvas(w, h);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv;
}
const CD_DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];   // 0=E 1=S 2=W 3=N

// ================================ BEAMS ================================
const Beams = {
  segs: [],            // [{x0,y0,x1,y1,tiles:[[i,j]..]}] in TILE coords (this map, this frame)
  litSet: new Set(),   // beam-covered bridge tiles 'i,j'
  _mapId: null,
  objs(m, t) { const r = []; for (const o of m.objects) if (o.type === t) r.push(o); return r; },
  crystalAt(m, i, j) { for (const o of m.objects) if (o.type === 'beamcrystal' && o.x === i && o.y === j) return o; return null; },
  mothsOn(m, o) { for (const q of m.objects) if (q.type === 'moths' && q.x === o.x && q.y === o.y) return q; return null; },
  smothered(m, o) { const q = this.mothsOn(m, o); return q && !(q.fleeT > 0); },
  solid(m, i, j) {
    if (i < 0 || j < 0 || i >= m.w || j >= m.h) return true;
    const id = tileAt(m, i, j), d = TILEDEFS[id] || {};
    if (d.door || d.gate) { const o = (m.doors || {})[i + ',' + j]; return !(o && o.kind === 'flag' && o.req && Game.lookupFlag(o.req)); }
    return !!d.solid;
  },
  // cast one beam from (x,y) in dir; charge crystals it hits; record the segment
  cast(m, x, y, dir, seen) {
    const [dx, dy] = CD_DIRS[dir]; const tiles = [];
    let i = x + dx, j = y + dy, endI = x, endJ = y, hit = null;
    for (let n = 0; n < 24; n++) {
      if (this.solid(m, i, j)) { hit = ['wall', i, j]; break; }
      const cr = this.crystalAt(m, i, j);
      tiles.push([i, j]); endI = i; endJ = j;
      if (cr) { hit = ['crystal', cr]; break; }
      i += dx; j += dy;
    }
    this.segs.push({ x0: x, y0: y, x1: endI, y1: endJ, dir, tiles });
    for (const [ti, tj] of tiles) if (m._beamBridges && m._beamBridges.has(ti + ',' + tj)) this.litSet.add(ti + ',' + tj);
    if (hit && hit[0] === 'wall') this.runeCheck(m, hit[1], hit[2]);
    if (hit && hit[0] === 'crystal') {
      const cr = hit[1], key = cr.x + ',' + cr.y;
      if (!seen.has(key) && !this.smothered(m, cr)) { seen.add(key); cr.charged = true; this.prismCheck(m, cr); this.cast(m, cr.x, cr.y, cr.dir, seen); }
    }
  },
  prismCheck() {},   // (crystals never ARE the prism; the prism is checked as a wall-tile hit below)
  runeCheck(m, i, j) {
    for (const o of m.objects) {
      if (o.type === 'sunrune' && o.x === i && o.y === j && !Game.lookupFlag(o.flag)) {
        Game.flags[o.flag] = true; o.on = true;
        Audio2.jingle('door'); Particles.burst(i * TILE + 8, j * TILE + 8, 'sparkle');
        Game.banner(o.msg || 'The light strikes a SUN-RUNE — something ancient unlocks!'); saveGame();
      }
      if (o.type === 'prism' && !Game.lookupFlag(o.flag) && Math.abs(o.x - i) <= 0 && Math.abs(o.y - j) <= 1) {
        Game.flags[o.flag] = true;
        Audio2.jingle('bosswin');
        for (let k = 0; k < 5; k++) Particles.burst(o.x * TILE + 8 - 8 + k * 4, o.y * TILE - k * 6, 'sparkle');
        Game.banner('THE GREAT PRISM AWAKENS! Its beam pours EAST into the dig-works — the sealed gate drinks the light!'); saveGame();
      }
    }
  },
  update(dt, m) {
    if (!m || !m.beams) { this.segs = []; this.litSet.clear(); this._mapId = null; return; }
    this._mapId = m.id;
    // moth timers (decoy scatters them)
    const comp = Game.companion;
    for (const q of m.objects) if (q.type === 'moths') {
      if (q.fleeT > 0) q.fleeT -= dt;
      if (comp && comp.decoyT > 0 && dist(comp.x, comp.y, q.x * TILE + 8, q.y * TILE + 8) < 110 && !(q.fleeT > 0)) {
        q.fleeT = 6.5; Audio2.jingle('talk');
        Game.banner('The shadow-moths swarm after RAMSI\'s decoy — the crystal-heart is clear!');
      }
    }
    // recompute the whole light network from scratch (cheap: a handful of crystals)
    this.segs = []; this.litSet.clear();
    const seen = new Set();
    for (const o of m.objects) if (o.type === 'beamcrystal') o.charged = false;
    // 1) always-on wall spouts
    for (const o of m.objects) if (o.type === 'spout') this.cast(m, o.x, o.y, o.dir, seen);
    // 2) the awakened Great Prism
    for (const o of m.objects) if (o.type === 'prism' && Game.lookupFlag(o.flag)) this.cast(m, o.x, o.y, o.dir === undefined ? 0 : o.dir, seen);
    // 3) crystals WOKEN by RAMSI's glow stay awake — "crystal-hearts remember light".
    //    (COLD-HEARTS — o.cold — refuse the glow: only a BEAM can feed them.)
    m._beamWoken = m._beamWoken || new Set();
    if (Game.glowOn && Game.companionActive && Game.companionActive()) {
      for (const o of m.objects) if (o.type === 'beamcrystal' && !o.cold && !this.smothered(m, o)) {
        if (dist(comp.x, comp.y, o.x * TILE + 8, o.y * TILE + 8) < 34) {
          const key = o.x + ',' + o.y;
          if (!m._beamWoken.has(key)) { m._beamWoken.add(key); Audio2.jingle('gem'); Particles.burst(o.x * TILE + 8, o.y * TILE + 2, 'sparkle'); }
        }
      }
    }
    for (const o of m.objects) {
      if (o.type !== 'beamcrystal' || o.charged || this.smothered(m, o)) continue;
      const key = o.x + ',' + o.y;
      if (m._beamWoken.has(key) && !seen.has(key)) { seen.add(key); o.charged = true; this.cast(m, o.x, o.y, o.dir, seen); }
    }
    m._beamLit = this.litSet;
  },
  litNear(x, y, r) {   // is world-point near any beam segment? (golem check)
    const ti = (x / TILE) | 0, tj = (y / TILE) | 0, rr = Math.max(1, (r / TILE) | 0);
    for (const s of this.segs) for (const [i, j] of s.tiles) if (Math.abs(i - ti) <= rr && Math.abs(j - tj) <= rr) return true;
    return false;
  },
};
if (typeof G !== 'undefined' && G.NQ) G.NQ.Beams = Beams;

// beams tick alongside the burrow abilities (runs whenever the companion is active)
(function () {
  const orig = Game.updateBurrowAbilities;
  Game.updateBurrowAbilities = function (dt) { orig.call(this, dt); Beams.update(dt, this.map); };
})();

// light-bridges: beam-covered rift tiles are solid ground (piggybacks the asteroid hook)
(function () {
  const orig = Game.asteroidCovers;
  Game.asteroidCovers = function (ti, tj) {
    const m = this.map;
    if (m && m._beamLit && m._beamLit.has(ti + ',' + tj)) return true;
    return orig.call(this, ti, tj);
  };
})();

// C key: RAMSI butts a nearby crystal to TURN it (before everything else);
// also: near smothered moths, C always throws the DECOY (even after Roll is learned)
(function () {
  const orig = Game.ramsiCommand;
  Game.ramsiCommand = function () {
    if (this.companionActive && this.companionActive() && this.map && this.map.beams && !(this.companion.busyT > 0)) {
      let best = null, bd = 26;
      for (const o of this.map.objects) if (o.type === 'beamcrystal' && o.rot) {
        const d = dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8);
        if (d < bd) { bd = d; best = o; }
      }
      if (best) {
        const comp = this.companion;
        comp.x = best.x * TILE + 8; comp.y = best.y * TILE + 12; comp.busyT = 0.35;
        best.dir = (best.dir + 1) % 4;
        Audio2.jingle('key'); Particles.burst(best.x * TILE + 8, best.y * TILE + 4, 'sparkle');
        Beams.update(0, this.map);
        if (best.cold && !best.charged)
          this.toast('The COLD-HEART stays dark... FEED it a beam first (turn a LIT crystal into it)!');
        else if (!best.charged)
          this.toast('It turns to face ' + ['EAST', 'SOUTH', 'WEST', 'NORTH'][best.dir] + ' — but it is dark. Feed it light!');
        else
          this.toast('RAMSI butts the crystal — its BEAM swings ' + ['EAST', 'SOUTH', 'WEST', 'NORTH'][best.dir] + '!');
        return;
      }
      if (this.flags.ramDecoy) for (const o of this.map.objects) {
        if (o.type === 'moths' && !(o.fleeT > 0) && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 70) { this.startDecoy(); return; }
      }
    }
    return orig.call(this);
  };
})();

// ============================ THE LIGHT MASK ============================
let cdMask = null;
function cdPunch(mc, sx, sy, r, a) {
  const g = mc.createRadialGradient(sx, sy, 0, sx, sy, r);
  g.addColorStop(0, 'rgba(0,0,0,' + a + ')'); g.addColorStop(0.75, 'rgba(0,0,0,' + (a * 0.5).toFixed(2) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
  mc.fillStyle = g; mc.beginPath(); mc.arc(sx, sy, r, 0, 7); mc.fill();
}
Game.drawLightMask = function (c, map, camX, camY, Z) {
  if (!cdMask) { cdMask = cdMkCanvas(VW, VH); }
  const mc = cdMask.getContext('2d');
  const W2S = (wx, wy) => [(wx - camX) * Z, (wy - camY) * Z];
  mc.save(); mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, VW, VH);
  mc.fillStyle = 'rgba(5,2,13,' + (map.darkness !== undefined ? map.darkness : 0.9) + ')';
  mc.fillRect(0, 0, VW, VH);
  mc.globalCompositeOperation = 'destination-out';
  // Noah: a small personal aura; Ramsi: the true lantern (when Glow is known)
  { const [sx, sy] = W2S(Player.x, Player.y - 8); cdPunch(mc, sx, sy, 34, 0.9); }
  if (Game.glowOn && Game.companionActive && Game.companionActive()) {
    const [sx, sy] = W2S(Game.companion.x, Game.companion.y - 6); cdPunch(mc, sx, sy, 92, 1);
  }
  // tiles: glow-veins glimmer; visible-region scan only
  const i0 = Math.max(0, (camX / TILE | 0) - 1), i1 = Math.min(map.w - 1, ((camX + VW / Z) / TILE | 0) + 1);
  const j0 = Math.max(0, (camY / TILE | 0) - 1), j1 = Math.min(map.h - 1, ((camY + VH / Z) / TILE | 0) + 1);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const id = map.tiles[j][i];
    if (id === 'glowvein') { const [sx, sy] = W2S(i * TILE + 8, j * TILE + 8); cdPunch(mc, sx, sy, 26, 0.55); }
  }
  // objects: crystals, spouts, the prism, runes, the portal
  for (const o of map.objects) {
    const [sx, sy] = W2S(o.x * TILE + 8, o.y * TILE + 8);
    if (o.type === 'beamcrystal') cdPunch(mc, sx, sy, o.charged ? 64 : 16, o.charged ? 0.95 : 0.4);
    else if (o.type === 'spout') cdPunch(mc, sx, sy, 22, 0.6);
    else if (o.type === 'prism') cdPunch(mc, sx, sy, Game.lookupFlag(o.flag) ? 120 : 34, Game.lookupFlag(o.flag) ? 1 : 0.5);
    else if (o.type === 'sunrune' && (o.on || Game.lookupFlag(o.flag))) cdPunch(mc, sx, sy, 30, 0.7);
    else if (o.type === 'portal') cdPunch(mc, sx, sy, 30, 0.6);
    else if (o.type === 'pillowkin') cdPunch(mc, sx, sy, 26, 0.55);
  }
  // beams: punch a soft channel of light along every segment
  for (const s of Beams.segs) {
    const [ax, ay] = W2S(s.x0 * TILE + 8, s.y0 * TILE + 8), [bx, by] = W2S(s.x1 * TILE + 8, s.y1 * TILE + 8);
    mc.strokeStyle = 'rgba(0,0,0,.85)'; mc.lineCap = 'round';
    mc.lineWidth = 26; mc.globalAlpha = 0.5; mc.beginPath(); mc.moveTo(ax, ay); mc.lineTo(bx, by); mc.stroke();
    mc.lineWidth = 13; mc.globalAlpha = 0.95; mc.beginPath(); mc.moveTo(ax, ay); mc.lineTo(bx, by); mc.stroke();
    mc.globalAlpha = 1;
  }
  // the boss glints through the dark when beam-lit
  if (Game.boss && Beams.litNear(Game.boss.x, Game.boss.y, 18)) { const [sx, sy] = W2S(Game.boss.x, Game.boss.y - 8); cdPunch(mc, sx, sy, 56, 0.85); }
  mc.restore();
  c.drawImage(cdMask, 0, 0);
  // additive pass: the beams themselves + charged-crystal sparkle (drawn OVER the veil)
  c.save(); c.globalCompositeOperation = 'lighter';
  const pulse = 0.75 + 0.25 * Math.sin(Game.time * 6);
  for (const s of Beams.segs) {
    const ax = (s.x0 * TILE + 8 - camX) * Z, ay = (s.y0 * TILE + 8 - camY) * Z, bx = (s.x1 * TILE + 8 - camX) * Z, by = (s.y1 * TILE + 8 - camY) * Z;
    c.strokeStyle = 'rgba(120,190,255,' + (0.28 * pulse).toFixed(2) + ')'; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    c.strokeStyle = 'rgba(235,248,255,' + (0.75 * pulse).toFixed(2) + ')'; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    // drifting motes along the beam
    for (let k = 0; k < 3; k++) {
      const u = ((Game.time * 0.55 + k / 3 + (s.x0 * 7 + s.y0 * 13) * 0.01) % 1);
      const mx = ax + (bx - ax) * u, my = ay + (by - ay) * u;
      c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(mx - 1, my - 1, 2, 2);
    }
  }
  c.restore(); c.lineWidth = 1; c.lineCap = 'butt';
};

// ======================= object DRAWERS (via Game.OBJDRAW) =======================
Game.OBJDRAW = Game.OBJDRAW || {};
Game.OBJDRAW.beamcrystal = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 10 - e, ch = !!o.charged;
  const body = ch ? '#8ec8ff' : o.cold ? '#7a92aa' : '#4a3f72', edge = '#241a33', gleam = ch ? '#eaf6ff' : o.cold ? '#c8dcea' : '#6a5f96';
  c.fillStyle = 'rgba(20,10,40,.35)'; c.beginPath(); c.ellipse(cx, cy + 3, 7, 2.4, 0, 0, 7); c.fill();
  c.fillStyle = '#3a3050'; c.fillRect(cx - 6, cy - 1, 12, 4);                        // rock socle
  c.fillStyle = edge; c.beginPath(); c.moveTo(cx, cy - 16); c.lineTo(cx + 6, cy - 4); c.lineTo(cx + 3, cy + 1); c.lineTo(cx - 3, cy + 1); c.lineTo(cx - 6, cy - 4); c.closePath(); c.fill();
  c.fillStyle = body; c.beginPath(); c.moveTo(cx, cy - 14); c.lineTo(cx + 4.6, cy - 4); c.lineTo(cx + 2, cy); c.lineTo(cx - 2, cy); c.lineTo(cx - 4.6, cy - 4); c.closePath(); c.fill();
  c.fillStyle = gleam; c.fillRect(cx - 2, cy - 11, 2, 5);
  if (ch) { const p2 = 0.5 + 0.5 * Math.sin(Game.time * 7 + o.x); c.fillStyle = 'rgba(255,255,255,' + (0.5 * p2).toFixed(2) + ')'; c.beginPath(); c.arc(cx, cy - 7, 3 + p2 * 2, 0, 7); c.fill(); }
  // direction tick: a little arrow of light at the tip
  const [dx, dy] = CD_DIRS[o.dir];
  c.strokeStyle = ch ? '#eaf6ff' : '#9a8fc6'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx + dx * 7, cy - 7 + dy * 7); c.lineTo(cx + dx * 12, cy - 7 + dy * 12); c.stroke(); c.lineWidth = 1;
  if (o.cold && !ch) { const p3 = 0.4 + 0.3 * Math.sin(Game.time * 2 + o.x); c.strokeStyle = 'rgba(200,220,234,' + p3.toFixed(2) + ')'; c.beginPath(); c.arc(cx, cy - 7, 8, 0, 7); c.stroke(); }
  if (o.rot && dist(Player.x, Player.y, ox + 8, oy + 8) < 26 && Game.companionActive && Game.companionActive())
    drawText(c, 'C: TURN!', cx - 15, cy - 26, 7, '#f8e858', '#241a33');
};
Game.OBJDRAW.spout = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 8 - e;
  c.fillStyle = '#241a33'; c.fillRect(cx - 4, cy - 4, 8, 8);
  c.fillStyle = '#6a5f96'; c.fillRect(cx - 3, cy - 3, 6, 6);
  c.fillStyle = '#eaf6ff'; c.beginPath(); c.arc(cx, cy, 1.8 + 0.7 * Math.sin(Game.time * 8 + o.x), 0, 7); c.fill();
};
Game.OBJDRAW.prism = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 12 - e, awake = Game.lookupFlag(o.flag);
  const t = Game.time, bob = awake ? Math.sin(t * 2) * 1.2 : 0;
  c.fillStyle = 'rgba(20,10,40,.4)'; c.beginPath(); c.ellipse(cx, cy + 2, 12, 3.4, 0, 0, 7); c.fill();
  const cols = awake ? ['#bfe4ff', '#8ec8ff', '#eaf6ff'] : ['#4a3f72', '#3a3055', '#5a4f86'];
  // three great shards
  const shard = (px, h, w, col) => { c.fillStyle = '#241a33'; c.beginPath(); c.moveTo(px, cy - h - 2 + bob); c.lineTo(px + w + 1.5, cy + bob); c.lineTo(px - w - 1.5, cy + bob); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(px, cy - h + bob); c.lineTo(px + w, cy + bob); c.lineTo(px - w, cy + bob); c.closePath(); c.fill(); };
  shard(cx - 8, 20, 4.4, cols[1]); shard(cx + 8, 24, 4.6, cols[0]); shard(cx, 34, 6, cols[2]);
  c.fillStyle = awake ? '#ffffff' : '#6a5f96'; c.fillRect(cx - 1.4, cy - 28 + bob, 2.8, 12);
  if (awake) { const p2 = 0.5 + 0.5 * Math.sin(t * 5); c.strokeStyle = 'rgba(190,228,255,' + (0.5 * p2).toFixed(2) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy - 14, 18 + p2 * 4, 0, 7); c.stroke(); c.lineWidth = 1; }
  else if (dist(Player.x, Player.y, ox + 8, oy + 8) < 40) drawText(c, 'asleep...', cx - 16, cy - 42, 7, '#9a8fc6', '#241a33');
};
Game.OBJDRAW.sunrune = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 8 - e, on = o.on || Game.lookupFlag(o.flag);
  const p2 = 0.5 + 0.5 * Math.sin(Game.time * 3 + o.x);
  c.strokeStyle = on ? '#f8d048' : 'rgba(154,143,198,' + (0.5 + 0.4 * p2).toFixed(2) + ')'; c.lineWidth = 2;
  c.beginPath(); c.arc(cx, cy, 5.5, 0, 7); c.stroke();
  c.beginPath(); c.moveTo(cx - 3, cy); c.lineTo(cx + 3, cy); c.moveTo(cx, cy - 3); c.lineTo(cx, cy + 3); c.stroke(); c.lineWidth = 1;
  if (on) { c.fillStyle = 'rgba(248,208,72,.35)'; c.beginPath(); c.arc(cx, cy, 8, 0, 7); c.fill(); }
  // a faint dotted wire to whatever it opens (readable cause -> effect)
  if (o.wireTo) {
    const bx = o.wireTo[0] * TILE + 8, by = o.wireTo[1] * TILE + 8;
    c.strokeStyle = on ? 'rgba(248,208,72,.9)' : 'rgba(154,143,198,.35)'; c.setLineDash([3, 5]);
    c.lineDashOffset = on ? -((Game.time * 24) % 8) : 0;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(bx, cy); c.lineTo(bx, by); c.stroke(); c.setLineDash([]);
  }
};
Game.OBJDRAW.moths = function (c, o, ox, oy, e) {
  const fled = o.fleeT > 0, comp = Game.companion;
  const hx = fled && comp ? comp.x : ox + 8, hy = fled && comp ? comp.y - 6 : oy + 2 - e;
  for (let k = 0; k < 6; k++) {
    const a = Game.time * (2.2 + k * 0.3) + k * 1.9, r = 7 + Math.sin(Game.time * 3 + k) * 3 + (fled ? 6 : 0);
    const mx = hx + Math.cos(a) * r, my = hy + Math.sin(a * 1.3) * r * 0.6;
    c.fillStyle = 'rgba(24,16,40,.92)'; c.fillRect(mx - 2, my - 1, 4, 2);
    c.fillStyle = 'rgba(90,70,130,.9)'; c.fillRect(mx - 1, my - 2, 2, 2);
  }
  if (!fled && dist(Player.x, Player.y, ox + 8, oy + 8) < 60 && Game.flags.ramDecoy)
    drawText(c, 'C: DECOY!', hx - 17, hy - 18, 7, '#f8e858', '#241a33');
};

// ======================= GEODE GOLEM, rebuilt (light-shy) =======================
(function () {
  const upOrig = Bosses.up_warden, drawOrig = Bosses.drawWarden;
  function geodeLight(b) {
    const comp = Game.companion;
    if (Beams._mapId === Game.mapId && Beams.litNear(b.x, b.y, 18)) return 2;          // beam-bathed
    if (Game.glowOn && comp && dist(comp.x, comp.y, b.x, b.y) < 88) return 1;          // in Ramsi's glow
    return 0;                                                                           // shadow
  }
  Bosses.up_warden = function (b, dt) {
    if (b.name !== 'geode') return upOrig.call(this, b, dt);
    const p = Player, cfg = b.cfg, comp = Game.companion;
    if (b.inv > 0) b.inv -= dt;
    if (b.shieldT > 0) b.shieldT -= dt;
    if (b.stun > 0) b.stun -= dt;
    const light = b.lit = geodeLight(b);
    // heavy stone obeys walls: move one axis at a time, only onto open floor
    const bStep = (nx, ny) => {
      const ti = (nx / TILE) | 0, tj = (ny / TILE) | 0;
      const d2 = TILEDEFS[tileAt(Game.map, ti, tj)] || {};
      if (d2.solid || d2.rift || d2.hole || d2.door || d2.gate) return false;
      b.x = nx; b.y = ny; return true;
    };
    if (light === 0) {
      // shadow-form: it slides away through the dark; no window can hold
      if (b.shieldT > 0) { b.shieldT = 0; Game.toast('The Golem melts into shadow — LIGHT it up to land a blow!'); }
      b.wanderT = (b.wanderT || 0) - dt;
      if (b.wanderT <= 0) { b.wa = Math.random() * Math.PI * 2; b.wanderT = 1.2; }
      const okX = bStep(b.x + Math.cos(b.wa) * 34 * dt, b.y);
      const okY = bStep(b.x, b.y + Math.sin(b.wa) * 22 * dt);
      if (!okX && !okY) b.wanderT = 0;                       // cornered: pick a new direction
    } else if (b.stun <= 0) {
      // lit: a slow, heavy lumber toward Noah — SLOWER still inside a beam
      const spd = light === 2 ? 9 : 20, d = Math.max(1, dist(b.x, b.y, p.x, p.y));
      bStep(b.x + (p.x - b.x) / d * spd * dt, b.y);
      bStep(b.x, b.y + (p.y - b.y) / d * spd * dt);
      // the SLAM: telegraphed shockwave (disabled while beam-bathed)
      if (light === 1 && b.shieldT <= 0) {
        b.slamT = (b.slamT === undefined ? 2.6 : b.slamT) - dt;
        if (b.slamT <= 0 && b.slamT > -0.9) { /* telegraph window */ }
        if (b.slamT <= -0.9) {
          b.slamT = 3.4; Audio2.jingle('rumble'); Particles.burst(b.x, b.y + 2, 'dust');
          if (Player.inv <= 0 && !(comp.decoyT > 0) && dist(p.x, p.y, b.x, b.y) < 30) Player.hurt(1);
        }
      }
    }
    b.x = clamp(b.x, b.hx - 4.5 * TILE, b.hx + 4.5 * TILE); b.y = clamp(b.y, b.hy - 4.5 * TILE, b.hy + 4.5 * TILE);
    // the co-op window: Ramsi's headbutt opens it (generic companion code sets shieldT);
    // a beam-bath holds it open LONGER the moment it opens
    if (b.shieldT > 0 && !b._extended && light === 2) { b.shieldT = Math.max(b.shieldT, 4.6); b._extended = true; }
    if (b.shieldT <= 0) b._extended = false;
    if (b.shieldT > 0) {
      if (this.wardenHit(b)) {
        b.hits++; b.inv = 0.7; Audio2.jingle('capture'); Particles.burst(b.x, b.y - 12, 'confetti');
        if (b.hits >= b.armor) { this.catchBoss(b); return; }
        Game.banner('HIT! ' + cfg.title + ' (' + b.hits + '/' + b.armor + ') — keep it in the LIGHT!');
      }
    } else if (this.wardenHit(b)) {
      if (Game.time - (b.clinkT || 0) > 1) { b.clinkT = Game.time; Game.toast(light === 0 ? 'Your harpoon whistles through shadow — LIGHT the Golem first!' : cfg.title + ' is GUARDED — bring RAMSI close so he HEADBUTTS it!'); }
      b.inv = 0.4;
    }
    if (Player.inv <= 0 && b.stun <= 0 && light > 0 && !(comp.decoyT > 0) && dist(p.x, p.y, b.x, b.y) < 14) Player.hurt(1);
  };
  Bosses.drawWarden = function (c, b) {
    if (b.name !== 'geode') return drawOrig.call(this, c, b);
    const ov = Sprites.geode, light = b.lit === undefined ? 1 : b.lit;
    const alpha = light === 0 ? 0.09 : light === 1 ? 0.85 : 1;
    c.save();
    c.globalAlpha = alpha;
    if (b.stun > 0) c.rotate(Math.sin(b.t * 12) * 0.1);
    if (ov) { const sc = 1; if (Player.x < b.x) c.scale(-sc, sc); dspr(c, ov, -sprW(ov) / 2, -sprH(ov)); }
    else {
      const bob = Math.sin(b.t * 2) * 1.2;
      // a hunched boulder-beast studded with crystal
      c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(0, -12 + bob, 15, 13, 0, 0, 7); c.fill();
      c.fillStyle = '#4a4066'; c.beginPath(); c.ellipse(0, -12 + bob, 13.4, 11.4, 0, 0, 7); c.fill();
      c.fillStyle = '#5c5280'; c.beginPath(); c.ellipse(-3, -15 + bob, 8, 6.4, -0.4, 0, 7); c.fill();
      const sh = (px, py, h, col) => { c.fillStyle = '#241a33'; c.beginPath(); c.moveTo(px, py - h - 1.5 + bob); c.lineTo(px + 3.6, py + bob); c.lineTo(px - 3.6, py + bob); c.closePath(); c.fill();
        c.fillStyle = col; c.beginPath(); c.moveTo(px, py - h + bob); c.lineTo(px + 2.6, py + bob); c.lineTo(px - 2.6, py + bob); c.closePath(); c.fill(); };
      sh(-6, -20, 9, light === 2 ? '#bfe4ff' : '#8ec8ff'); sh(2, -22, 12, light === 2 ? '#eaf6ff' : '#9ad0ff'); sh(8, -18, 7, '#8ec8ff');
      // stumpy legs + glowing core-eye (the weak point, bared when the window is open)
      c.fillStyle = '#3a3055'; c.fillRect(-10, -3, 7, 4); c.fillRect(3, -3, 7, 4);
      const open = b.shieldT > 0;
      c.fillStyle = open ? '#ffd95a' : '#241a33'; c.beginPath(); c.arc(0, -10 + bob, open ? 3.6 : 2.4, 0, 7); c.fill();
      if (open) { c.strokeStyle = 'rgba(255,217,90,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(0, -10 + bob, 6 + Math.sin(b.t * 10) * 1.5, 0, 7); c.stroke(); c.lineWidth = 1; }
    }
    c.restore();
    // slam telegraph ring
    if (b.lit === 1 && b.slamT !== undefined && b.slamT <= 0 && b.slamT > -0.9) {
      const u = -b.slamT / 0.9;
      c.strokeStyle = 'rgba(255,150,80,' + (0.7 - u * 0.4).toFixed(2) + ')'; c.lineWidth = 2.5;
      c.beginPath(); c.arc(0, 0, 30 * u + 4, 0, 7); c.stroke(); c.lineWidth = 1;
    }
    if (b.lit === 0) { for (let k = 0; k < 3; k++) { const a = b.t * 3 + k * 2.1; c.fillStyle = 'rgba(90,70,130,.5)'; c.fillRect(Math.cos(a) * 10 - 1, -8 + Math.sin(a * 1.4) * 6, 2, 2); } }
    // armor pips (kept from the house style)
    const top = -34;
    for (let k = 0; k < b.armor; k++) { c.fillStyle = k < (b.armor - b.hits) ? '#e84a4a' : '#3a2c50'; c.beginPath(); c.arc(-(b.armor - 1) * 6 + k * 12, top, 4, 0, 7); c.fill(); c.strokeStyle = '#241a33'; c.stroke(); }
  };
})();

// ============================ THE MAP ============================
function buildBurrow7() {
  if (MAPS.burrow7) return;
  const m = newMap('burrow7', 64, 40, 'soil', { name: 'Crystal Deep', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  m.lightMask = true; m.darkness = 0.9; m.beams = true;
  m._beamBridges = new Set(['36,20', '37,20', '38,20']);
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'crystal'); T(m, i, m.h - 1, 'crystal'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'crystal'); T(m, m.w - 1, j, 'crystal'); }
  m.start = { x: 4, y: 20 };
  const vein = (p) => { for (const [x, y] of p) T(m, x, y, 'glowvein'); };
  const crys = (p) => { for (const [x, y] of p) T(m, x, y, 'crystal'); };

  // ---------------- WEST: the open Crystal Deep (herds + the beam lessons) ----------------
  NPC(m, 5, 22, 'gruul', 'Gem-Warden');
  SIGN(m, 3, 23, 'THE CRYSTAL DEEP. Walk RAMSI up to a crystal-heart and it WAKES — and stays awake forever! Press C to TURN one. Feed the GREAT PRISM a beam and the dig-works open EAST.');
  vein([[6, 19], [11, 21], [14, 19], [19, 21], [22, 19], [6, 26], [18, 26], [26, 13], [8, 12], [27, 24]]);
  crys([[3, 8], [4, 8], [3, 9], [20, 26], [21, 26], [26, 9], [27, 9], [27, 10], [12, 6], [12, 7]]);

  // the beam lesson row (y=20): C1 fixed -> C2 turnable -> THE GREAT PRISM -> the rune-gate
  OBJ(m, { type: 'beamcrystal', x: 9, y: 20, dir: 0, rot: false });
  SIGN(m, 7, 22, 'A crystal-heart. Walk close — it WAKES for Ramsi and shines EAST forever!');
  OBJ(m, { type: 'beamcrystal', x: 16, y: 20, dir: 1, rot: true });
  SIGN(m, 14, 22, 'This heart TURNS: press C! Aim its beam EAST, into the Great Prism. (The NORTH wall glimmers oddly too...)');
  crys([[24, 19]]); T(m, 24, 20, 'crystal');
  OBJ(m, { type: 'prism', x: 24, y: 20, dir: 0, flag: 'b7_prism' });
  SIGN(m, 21, 22, 'THE GREAT PRISM of the Deep — asleep for an age. One true beam will wake it.');

  // secret 1: aim C2 NORTH instead — a rune-vault in the north wall
  R(m, 15, 3, 6, 1, 'crystal'); R(m, 15, 1, 1, 2, 'crystal'); R(m, 20, 1, 1, 2, 'crystal');
  DOOR(m, 17, 3, 'flag', 'b7_srx', 'A rune-sealed vault door.');
  OBJ(m, { type: 'sunrune', x: 16, y: 3, flag: 'b7_srx', wireTo: [17, 3], msg: 'The north rune drinks the beam — a hidden vault grinds open!' });
  CHEST(m, 18, 1, { gems: 8 });

  // the capricorn pool + secret 2 (jelly-guarded heart-piece on the isle)
  blob(m, 12, 30, 4.6, 2.6, 'water', 0, 7301, ['soil']);
  T(m, 12, 31, 'soil'); T(m, 13, 31, 'soil');
  CHEST(m, 13, 31, { heartpiece: 1 });
  SIGN(m, 9, 27, 'Capricorn drift in the black pool — and jellies guard a treasure-isle. DECOY (C) the swarm, then swim in!');
  SPAWN(m, 'capricorn', 9, 29, 7, 4, 3);
  SPAWN(m, 'jellyfish', 10, 29, 6, 4, 3);

  // the ibex ridge (north) + the starpupil hollow (south-west)
  SPAWN(m, 'ibex', 17, 6, 9, 5, 3);
  SIGN(m, 17, 10, 'Ibex clatter along the ridge — they love a CLOVER cage.');
  R(m, 2, 33, 7, 1, 'crystal'); T(m, 5, 33, 'soil'); R(m, 2, 34, 1, 3, 'crystal');
  SPAWN(m, 'starpupil', 3, 34, 5, 3, 2);
  vein([[4, 35], [6, 36]]);
  SIGN(m, 7, 31, 'Starpupils nest in the hollow below — shy things. They only shine where light falls (a quiet COOKIE cage works best).');

  // ---------------- the SEALED DIG-WORKS (x30-62): choke chain, chambered ----------------
  // enclosure
  R(m, 30, 11, 25, 3, 'crystal');                       // thick north band wall (x30-54, y11-13)
  R(m, 30, 27, 25, 1, 'crystal');                       // south band wall (y27, x30-54)
  R(m, 30, 14, 1, 13, 'crystal');                       // west wall col x30
  DOOR(m, 30, 20, 'flag', 'b7_gate0', 'A crystal gate, dark and sealed. A sun-rune sleeps at its heart.');
  OBJ(m, { type: 'sunrune', x: 30, y: 20, flag: 'b7_gate0', wireTo: [30, 20], msg: 'The Prism\'s beam floods the gate-rune — the dig-works open!' });

  // Chamber A (x31-38): the bounce wall, the spout, and the LIGHT-BRIDGE over the star-chasm
  R(m, 32, 14, 1, 13, 'crystal');                       // bounce wall
  OBJ(m, { type: 'bouncepad', x: 31, y: 20, to: [33, 20], msg: 'BOING! Over the glassy wall!' });
  SIGN(m, 31, 22, 'A sheer glass wall — stand on the mushroom and BOUNCE (X)!');
  OBJ(m, { type: 'spout', x: 32, y: 14, dir: 0 });      // wall-spout, always lit, fires E along y14
  OBJ(m, { type: 'beamcrystal', x: 35, y: 14, dir: 0, rot: true });
  OBJ(m, { type: 'beamcrystal', x: 35, y: 20, dir: 0, rot: false, cold: true });   // COLD-HEART: beam-fed only
  R(m, 36, 14, 3, 13, 'rift');                          // the star-chasm (bridge row 36-38 @ y20 stays rift; beams harden it)
  SIGN(m, 33, 22, 'A STAR-CHASM! The pale COLD-HEART by the edge only drinks BEAM-light: TURN the lit crystal (C) to feed it — its glow becomes a BRIDGE.');

  // Chamber B (x40-45): the shadow-moth vault
  R(m, 39, 14, 1, 13, 'crystal'); T(m, 39, 20, 'soil'); // opening off the light-bridge
  OBJ(m, { type: 'spout', x: 43, y: 13, dir: 1 });      // ceiling-spout fires S
  OBJ(m, { type: 'beamcrystal', x: 43, y: 17, dir: 1, rot: false });
  OBJ(m, { type: 'moths', x: 43, y: 17, fleeT: 0 });
  OBJ(m, { type: 'sunrune', x: 43, y: 27, flag: 'b7_g2', wireTo: [46, 20], msg: 'The floor-rune blazes — the east gate opens!' });
  SIGN(m, 40, 22, 'SHADOW-MOTHS smother the crystal-heart — no light can wake it. DECOY (C) draws every moth to RAMSI!');
  CHEST(m, 44, 15, { coins: 20 });
  vein([[41, 16], [44, 24]]);
  R(m, 46, 14, 1, 13, 'crystal');
  DOOR(m, 46, 20, 'flag', 'b7_g2', 'A rune-bolted gate.');

  // Chamber C (x47-53): the two-heart ALIGNMENT + the harpoon trench
  OBJ(m, { type: 'spout', x: 46, y: 15, dir: 0 });
  OBJ(m, { type: 'beamcrystal', x: 49, y: 15, dir: 3, rot: true });
  OBJ(m, { type: 'beamcrystal', x: 49, y: 22, dir: 2, rot: true, cold: true });    // COLD-HEART: beam-fed only
  SIGN(m, 47, 18, 'The vault-rune waits far EAST. The COLD-HEART below only drinks BEAM-light: turn the warm heart DOWN into it, then turn the cold one EAST!');
  R(m, 52, 14, 1, 13, 'rift');                          // the star-trench (light crosses; Noah cannot)
  POST(m, 53, 20); POST(m, 51, 20);                     // paired posts: across AND back
  SIGN(m, 50, 18, 'The trench swallows every bridge... but not a HARPOON line. Hook the POST (Z) and reel across!');
  vein([[48, 24], [51, 16]]);
  R(m, 54, 11, 1, 16, 'crystal');                       // den wall col x54 (y11-26)
  DOOR(m, 54, 18, 'flag', 'b7_vault', 'The Golem-vault door — its rune waits for aligned light.');
  OBJ(m, { type: 'sunrune', x: 54, y: 22, flag: 'b7_vault', wireTo: [54, 18], msg: 'The vault-rune ignites — the Golem\'s door rolls aside!' });

  // ---------------- the GOLEM DEN (x55-62, y11-26) ----------------
  R(m, 55, 10, 8, 1, 'crystal');                        // den north wall
  OBJ(m, { type: 'spout', x: 54, y: 12, dir: 0 });      // den wall-spout
  OBJ(m, { type: 'beamcrystal', x: 58, y: 12, dir: 0, rot: true });
  OBJ(m, { type: 'beamcrystal', x: 60, y: 21, dir: 2, rot: true });
  SIGN(m, 55, 23, 'GEODE GOLEM drinks the dark! Keep it in RAMSI\'s glow — better, TURN the den-hearts and pin it under a BEAM. Headbutt, then HARPOON its bared core (Z)!');
  OBJ(m, { type: 'boss', x: 58, y: 17, boss: 'geode' });
  OBJ(m, { type: 'pillowkin', x: 61, y: 12, kin: 3, caged: true, warden: 'geode', color: '#1a1a22', name: 'TOOTHLESS',
    gives: ['ramGlide', 'ramRoll'], freed: 'You free TOOTHLESS! RAMSI learns PUFF-GLIDE (at an updraft, press C) and ROLL-CHARGE (face a soft-block, press C). GLIDE the great star-chasm to descend!' });
  CHEST(m, 62, 16, { gems: 10 });
  vein([[56, 14], [61, 24], [57, 21]]);

  // the exit: a vast star-chasm south of the den — glide-only, then the down-shaft
  R(m, 55, 27, 8, 5, 'rift');                           // y27-31
  OBJ(m, { type: 'glidevent', x: 58, y: 26, to: [60, 32], msg: 'RAMSI puffs up and glides Noah across the great star-chasm!' });
  SIGN(m, 60, 25, 'The floor falls away into stars. At the UPDRAFT, GLIDE (C)!');
  R(m, 55, 32, 1, 7, 'crystal'); R(m, 56, 36, 7, 1, 'crystal');
  SIGN(m, 58, 34, 'A great downward shaft — GNASH\'s hoard rumbles far below.');
  OBJ(m, { type: 'portal', x: 60, y: 33, to: 'burrow8', tx: 4, ty: 20, req: 'geode' });
}
if (typeof G !== 'undefined' && G.NQ) { G.NQ.buildBurrow7 = buildBurrow7; }
