"use strict";
// ============== WORLD 2a REBUILT — THE SKY REALMS: the WIND level set ==============
// Overrides buildWorld2 (later declaration wins) and gives each sky boss its own AI.
// New reusable system:
//   * Wind — authored LANES (tile rects) that push Noah, critters and thrown tools.
//     Lanes marked bridge:true are thick with leaves: while the gust BLOWS, their rift
//     tiles carry weight (asteroidCovers wrap — same trick as light-bridges). Pulsing
//     lanes (windsocks show the rhythm) make timing puzzles; 1-tile pulsing bridge
//     lanes are PUFF-STONES. Storm maps add PLATES (bolts strike them on a telegraph)
//     and RODS (bolts prefer a rod — walk in its shadow).
// Bosses: GUST WING dive-bombs along the lanes; the PUFF LORD hides in a drifting
// shell-game of cloud-puffs; SPARKHORN charges in lines and fries itself on its own
// bolt-calls; THE STORM-LORD works through three phases. Ramsi's headbutt co-op is
// unchanged — every fight still ends with Noah's tool.

// ================================ WIND ================================
const Wind = {
  lit: new Set(),
  laneActive(l) { if (!l.pulse) return true; const c = l.pulse[0] + l.pulse[1]; return ((Game.time + (l.pulse[2] || 0)) % c) < l.pulse[0]; },
  inLane(l, x, y) { const ti = (x / TILE) | 0, tj = (y / TILE) | 0; return ti >= l.x && ti < l.x + l.w && tj >= l.y && tj < l.y + l.h; },
  update(dt, m) {
    if (!m || !m._wind) { this.lit.clear(); if (m) m._windLit = null; return; }
    this.lit = new Set();
    for (const l of m._wind) {
      const on = this.laneActive(l);
      if (on && l.bridge) for (let j = l.y; j < l.y + l.h; j++) for (let i = l.x; i < l.x + l.w; i++) {
        if (tileAt(m, i, j) === 'rift') this.lit.add(i + ',' + j);
      }
      if (!on || !l.str) continue;
      // push Noah (never during scripted arcs; never through solid walls)
      if (!Player.gArc && !Player.ledge && this.inLane(l, Player.x, Player.y)) {
        const nx = Player.x + l.dx * l.str * dt, ny = Player.y + l.dy * l.str * dt;
        const d = TILEDEFS[tileAt(m, (nx / TILE) | 0, (ny / TILE) | 0)] || {};
        if (!d.solid) { Player.x = nx; Player.y = ny; }
      }
      for (const cr of Game.creatures) if (cr.state !== 'gone' && cr.state !== 'trapped' && this.inLane(l, cr.x, cr.y)) { cr.x += l.dx * l.str * 0.5 * dt; cr.y += l.dy * l.str * 0.5 * dt; }
      if (Player.bone && this.inLane(l, Player.bone.x, Player.bone.y)) { Player.bone.x += l.dx * l.str * 0.8 * dt; Player.bone.y += l.dy * l.str * 0.8 * dt; }
      for (const n of (Game.flyingNets || [])) if (this.inLane(l, n.x, n.y)) { n.x += l.dx * l.str * 0.8 * dt; n.y += l.dy * l.str * 0.8 * dt; }
    }
    m._windLit = this.lit;
    // the storm: telegraphed bolts that prefer LIGHTNING RODS
    const st = m._storm;
    if (st) {
      st.t = (st.t || 0) - dt;
      st.bolts = (st.bolts || []).filter(b => (b.t -= dt) > -0.35);
      for (const b of st.bolts) {
        if (!b.fired && b.t <= 0) {
          b.fired = true; Audio2.jingle('rumble');
          Particles.burst(b.x * TILE + 8, b.y * TILE + 8, 'sparkle'); Particles.burst(b.x * TILE + 8, b.y * TILE + 2, 'dust');
          if (Player.inv <= 0 && dist(Player.x, Player.y, b.x * TILE + 8, b.y * TILE + 8) < 17) Player.hurt(1);
          const boss = Game.boss;
          if (boss && boss.awake && boss.selfBolt && dist(boss.x, boss.y, b.x * TILE + 8, b.y * TILE + 8) < 18) {
            boss.selfBolt = false; boss.stun = 1.2; boss.shieldT = Math.max(boss.shieldT, 2.2); boss.inv = 0;
            Game.banner('KRAKOOM! ' + (boss.cfg.title || 'The beast') + ' fries itself on its own bolt — NOW!');
          }
        }
      }
      if (st.t <= 0) {
        st.t = st.rate || 2.6;
        // strike the rod nearest Noah if one is close, else the plate nearest Noah
        let target = null, bd = 6.5 * TILE;
        for (const r of st.rods || []) { const d = dist(Player.x, Player.y, r[0] * TILE + 8, r[1] * TILE + 8); if (d < bd) { bd = d; target = r; } }
        if (!target && (st.plates || []).length) {
          let pd = 1e9; for (const p of st.plates) { const d = dist(Player.x, Player.y, p[0] * TILE + 8, p[1] * TILE + 8); if (d < pd) { pd = d; target = p; } }
        }
        if (target) st.bolts.push({ x: target[0], y: target[1], t: 1.15, fired: false });
      }
    }
  },
};
if (typeof G !== 'undefined' && G.NQ) G.NQ.Wind = Wind;

(function () {
  const orig = Game.updateBurrowAbilities;
  Game.updateBurrowAbilities = function (dt) { orig.call(this, dt); Wind.update(dt, this.map); };
})();
(function () {
  const orig = Game.asteroidCovers;
  Game.asteroidCovers = function (ti, tj) {
    const m = this.map;
    if (m && m._windLit && m._windLit.has(ti + ',' + tj)) return true;
    return orig.call(this, ti, tj);
  };
})();

// ======================= sky drawers =======================
Game.OBJDRAW = Game.OBJDRAW || {};
Game.OBJDRAW.windnet = function (c) {           // all lanes: leaf-streaks + puff-stone clouds (under entities)
  const m = Game.map; if (!m || !m._wind) return;
  for (const l of m._wind) {
    const on = Wind.laneActive(l);
    const x0 = l.x * TILE, y0 = l.y * TILE, w = l.w * TILE, h = l.h * TILE;
    if (l.bridge) {
      for (let j = l.y; j < l.y + l.h; j++) for (let i = l.x; i < l.x + l.w; i++) {
        if (tileAt(m, i, j) !== 'rift') continue;
        const px = i * TILE, py = j * TILE;
        if (on) {   // a plump little cloud-step
          c.fillStyle = 'rgba(36,26,51,.55)'; c.beginPath(); c.ellipse(px + 8, py + 10, 8.4, 5.4, 0, 0, 7); c.fill();
          c.fillStyle = '#f4f7ff'; c.beginPath(); c.ellipse(px + 8, py + 8, 7.6, 4.8, 0, 0, 7); c.fill();
          c.fillStyle = '#dfe8fa'; c.beginPath(); c.ellipse(px + 5, py + 10, 4, 2.6, 0, 0, 7); c.fill();
          c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(px + 10, py + 6.4, 4.4, 2.6, 0, 0, 7); c.fill();
        } else {    // fading warning wisp
          const u = 0.25 + 0.15 * Math.sin(Game.time * 6 + i);
          c.strokeStyle = 'rgba(244,247,255,' + u.toFixed(2) + ')'; c.lineWidth = 1.5;
          c.beginPath(); c.ellipse(px + 8, py + 8, 6, 3.6, 0, 0, 7); c.stroke(); c.lineWidth = 1;
        }
      }
    }
    if (!l.str) continue;
    const a = on ? 0.5 : 0.12;
    for (let k = 0; k < Math.max(2, (l.w + l.h) >> 1); k++) {
      const seed = hash2(k * 7 + l.x, l.y * 13);
      const u = ((Game.time * (on ? 0.5 : 0.1) * (l.str / 40) + seed) % 1);
      const px = x0 + (l.dx ? u * w : seed * w), py = y0 + (l.dy ? u * h : hash2(k, l.x) * h);
      c.strokeStyle = 'rgba(210,236,255,' + a + ')'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(px, py); c.lineTo(px + l.dx * 9, py + l.dy * 9); c.stroke();
      c.fillStyle = 'rgba(150,220,150,' + (a * 0.9).toFixed(2) + ')';
      c.fillRect(px + l.dx * 4 - 1, py + l.dy * 4 - 1, 2, 2);
      c.lineWidth = 1;
    }
  }
};
Game.OBJDRAW.stormfx = function (c) {           // bolts + telegraphs (over most things)
  const m = Game.map, st = m && m._storm; if (!st) return;
  for (const b of st.bolts || []) {
    const cx = b.x * TILE + 8, cy = b.y * TILE + 8;
    if (!b.fired) {
      const u = 1 - b.t / 1.15;
      c.strokeStyle = 'rgba(255,230,120,' + (0.35 + 0.5 * u).toFixed(2) + ')'; c.lineWidth = 2;
      c.beginPath(); c.arc(cx, cy, 14 - u * 8, 0, 7); c.stroke(); c.lineWidth = 1;
    } else if (b.t > -0.2) {
      c.strokeStyle = '#fff'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(cx + 3, cy - 60); c.lineTo(cx - 3, cy - 26); c.lineTo(cx + 2, cy - 24); c.lineTo(cx - 2, cy); c.stroke();
      c.strokeStyle = '#ffe678'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(cx + 2, cy - 58); c.lineTo(cx - 2, cy - 26); c.lineTo(cx + 1, cy - 23); c.lineTo(cx - 1, cy - 2); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(cx, cy, 6, 0, 7); c.fill();
      c.lineWidth = 1;
    }
  }
};
Game.OBJDRAW.windsock = function (c, o, ox, oy, e) {
  const m = Game.map, cx = ox + 8, cy = oy + 12 - e;
  let on = true;
  if (m && m._wind && o.lane !== undefined && m._wind[o.lane]) on = Wind.laneActive(m._wind[o.lane]);
  c.fillStyle = '#241a33'; c.fillRect(cx - 1.4, cy - 16, 2.8, 17);
  c.fillStyle = '#8c6c38'; c.fillRect(cx - 0.8, cy - 15, 1.6, 15);
  const flap = on ? Math.sin(Game.time * 9) * 2 : 0, len = on ? 10 : 4, droop = on ? 0 : 5;
  c.fillStyle = '#e8642f';
  c.beginPath(); c.moveTo(cx, cy - 15); c.lineTo(cx + len, cy - 13 + flap + droop); c.lineTo(cx + len, cy - 10 + flap + droop); c.lineTo(cx, cy - 9); c.closePath(); c.fill();
  c.fillStyle = '#fff'; c.fillRect(cx + 2, cy - 13.4 + flap * 0.4 + droop * 0.4, 2.4, 3.4);
};
Game.OBJDRAW.stormplate = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 9 - e;
  c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(cx, cy, 7.4, 4.6, 0, 0, 7); c.fill();
  c.fillStyle = '#7a8496'; c.beginPath(); c.ellipse(cx, cy - 0.6, 6.2, 3.6, 0, 0, 7); c.fill();
  c.fillStyle = '#aeb8ca'; c.beginPath(); c.ellipse(cx - 1, cy - 1.4, 3.6, 1.8, 0, 0, 7); c.fill();
  c.fillStyle = '#f8d048'; c.fillRect(cx - 1.2, cy - 2.6, 2.4, 1.2); c.fillRect(cx - 2.4, cy - 0.6, 1.2, 1.2); c.fillRect(cx + 1.2, cy - 0.6, 1.2, 1.2);
};
Game.OBJDRAW.lightningrod = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 12 - e, hum = 0.5 + 0.5 * Math.sin(Game.time * 4 + o.x);
  c.fillStyle = '#241a33'; c.fillRect(cx - 2, cy - 20, 4, 21);
  c.fillStyle = '#8a94a6'; c.fillRect(cx - 1.2, cy - 19, 2.4, 19);
  c.fillStyle = '#eaf2ff'; c.beginPath(); c.arc(cx, cy - 20, 2.6, 0, 7); c.fill();
  c.strokeStyle = 'rgba(255,230,120,' + (0.25 + 0.35 * hum).toFixed(2) + ')'; c.lineWidth = 1.6;
  c.beginPath(); c.arc(cx, cy - 20, 5 + hum * 2, 0, 7); c.stroke(); c.lineWidth = 1;
  if (dist(Player.x, Player.y, ox + 8, oy + 8) < 40) drawText(c, 'safe-ish!', cx - 14, cy - 32, 6, '#9adcf8', '#241a33');
};
Game.OBJDRAW.balloon = function (c, o, ox, oy, e) {
  const u = (Game.time * 0.04 + (o.phase || 0)) % 1;
  const px = 2 * TILE + u * 34 * TILE, py = oy + Math.sin(Game.time * 1.4 + o.phase * 9) * 6;
  c.strokeStyle = '#241a33'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 1, py + 10); c.stroke();
  c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(px, py - 6, 6.4, 7.4, 0, 0, 7); c.fill();
  c.fillStyle = o.col || '#e8589a'; c.beginPath(); c.ellipse(px, py - 6, 5.4, 6.4, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(px - 1.8, py - 8, 1.8, 2.4, 0, 0, 7); c.fill();
};

// ======================= the four SKY BOSS AIs =======================
(function () {
  const upOrig = Bosses.up_skyboss, drawOrig = Bosses.drawSkyBoss;
  function hitPhase(self, b, cfg) {   // shared window/hit skeleton (identical to the old one)
    const comp = Game.companion;
    if (b.shieldT > 0) {
      if (self.skyHit(b)) {
        b.hits++; b.inv = 0.7; Audio2.jingle('capture'); Particles.burst(b.x, b.y - 12, 'confetti');
        if (b.hits >= b.armor) { self.catchBoss(b); return true; }
        Game.banner('HIT! ' + cfg.title + '  (' + b.hits + '/' + b.armor + ') — keep RAMSI on it!');
      }
    } else if (self.skyHit(b)) {
      if (Game.time - (b.clinkT || 0) > 1) { b.clinkT = Game.time; Game.toast(cfg.title + ' is SHIELDED — let RAMSI headbutt it first!'); }
      b.inv = 0.4;
    }
    if (Player.inv <= 0 && b.stun <= 0 && !(comp.decoyT > 0) && dist(Player.x, Player.y, b.x, b.y) < 14) Player.hurt(1);
    return false;
  }
  Bosses.up_skyboss = function (b, dt) {
    const cfg = b.cfg, p = Player;
    if (b.inv > 0) b.inv -= dt;
    if (b.shieldT > 0) b.shieldT -= dt;
    if (b.stun > 0) b.stun -= dt;

    if (b.name === 'gustwing') {                 // ---- the DIVE-BOMBER ----
      if (b.gs === undefined) { b.gs = 'circle'; b.gT = 2.2; }
      b.gT -= dt;
      if (b.stun > 0) { /* reeling */ }
      else if (b.gs === 'circle') {
        b.x = b.hx + Math.cos(b.t * 1.1) * 52; b.y = b.hy + Math.sin(b.t * 1.5) * 14 - 10;
        if (b.gT <= 0) { b.gs = 'aim'; b.gT = 0.8; b.aimA = Math.atan2(p.y - b.y, p.x - b.x); }
      } else if (b.gs === 'aim') {
        b.aimA = Math.atan2(p.y - b.y, p.x - b.x);
        if (b.gT <= 0) { b.gs = 'dive'; b.gT = 0; b.dvD = 0; Audio2.jingle('flap'); }
      } else if (b.gs === 'dive') {
        const spd = 210; b.x += Math.cos(b.aimA) * spd * dt; b.y += Math.sin(b.aimA) * spd * dt; b.dvD += spd * dt;
        if (Player.inv <= 0 && dist(p.x, p.y, b.x, b.y) < 13) Player.hurt(1);
        if (b.dvD > 6.2 * TILE) { b.gs = 'circle'; b.gT = 2.4; b.x = clamp(b.x, b.hx - 80, b.hx + 80); b.y = clamp(b.y, b.hy - 40, b.hy + 40); }
      }
    } else if (b.name === 'pufflord') {          // ---- the SHELL GAME ----
      if (b.puffs === undefined) { b.shuffleT = 0; b.puffs = [{ a: 0.6 }, { a: 3.7 }]; }
      b.shuffleT -= dt;
      b.x = b.hx + Math.cos(b.t * 0.5) * 34; b.y = b.hy + Math.sin(b.t * 0.8) * 16;
      for (const q of b.puffs) { q.x = b.hx + Math.cos(b.t * 0.5 + q.a) * 34; q.y = b.hy + Math.sin(b.t * 0.8 + q.a) * 16; }
      if (b.shuffleT <= 0) { b.shuffleT = 5.5; b.hid = b.shieldT <= 0; Particles.burst(b.x, b.y, 'dust'); }
      if (b.shieldT > 0) b.hid = false;          // a headbutt pops him out of the crowd
    } else if (b.name === 'sparkhorn') {         // ---- the CHARGE-LINER who fries himself ----
      if (b.ss === undefined) { b.ss = 'aim'; b.sT = 1.1; }
      b.sT -= dt;
      if (b.stun > 0) { /* scorched: hold still */ }
      else if (b.ss === 'aim') {
        b.aimA = Math.atan2(p.y - b.y, p.x - b.x);
        b.x += Math.cos(b.t * 2) * 8 * dt; b.y += Math.sin(b.t * 2.6) * 8 * dt;
        if (b.sT <= 0) { b.ss = 'charge'; b.sT = 0; b.chD = 0; Audio2.jingle('step'); }
      } else if (b.ss === 'charge') {
        const spd = 185; b.x += Math.cos(b.aimA) * spd * dt; b.y += Math.sin(b.aimA) * spd * dt; b.chD += spd * dt;
        if (Player.inv <= 0 && dist(p.x, p.y, b.x, b.y) < 13) Player.hurt(1);
        if (b.chD > 5 * TILE) {
          b.ss = 'call'; b.sT = 1.3; b.selfBolt = true;
          const st = Game.map._storm;
          if (st) st.bolts.push({ x: (b.x / TILE) | 0, y: (b.y / TILE) | 0, t: 1.15, fired: false });
          Game.toast('SPARKHORN calls the storm down on its own head...');
        }
      } else if (b.ss === 'call') {
        if (b.sT <= 0) { b.ss = 'aim'; b.sT = 1.0 + Math.random() * 0.5; b.selfBolt = false; }
      }
      b.x = clamp(b.x, b.hx - 88, b.hx + 88); b.y = clamp(b.y, b.hy - 44, b.hy + 44);
    } else if (b.name === 'tempestia') {         // ---- THE STORM-LORD, three phases ----
      b.phase = b.hits >= 4 ? 3 : b.hits >= 2 ? 2 : 1;
      const spd = [0.55, 0.8, 1.1][b.phase - 1];
      const lean = clamp((p.x - b.hx) / 80, -1, 1);
      b.x = b.hx + Math.cos(b.t * spd) * cfg.rangeX + lean * 10;
      b.y = b.hy + Math.sin(b.t * spd * 1.3) * cfg.rangeY;
      const st = Game.map._storm;
      if (st) st.rate = [3.2, 2.4, 1.5][b.phase - 1];
      if (b.phase >= 2) {                        // the squall-swirl shoves Noah around the arena
        const a = b.t * (b.phase === 3 ? 1.6 : 1.0);
        if (dist(p.x, p.y, b.x, b.y) < 76 && !Player.gArc) {
          const nx = p.x + Math.cos(a) * 34 * dt, ny = p.y + Math.sin(a) * 34 * dt;
          const d2 = TILEDEFS[tileAt(Game.map, (nx / TILE) | 0, (ny / TILE) | 0)] || {};
          if (!d2.solid) { p.x = nx; p.y = ny; }
        }
      }
    } else return upOrig.call(this, b, dt);
    hitPhase(this, b, cfg);
  };
  Bosses.drawSkyBoss = function (c, b) {
    if (b.name === 'gustwing' && b.gs === 'aim') {
      c.save(); c.rotate(b.aimA);
      c.strokeStyle = 'rgba(150,220,255,' + (0.4 + 0.3 * Math.sin(b.t * 10)) + ')'; c.setLineDash([4, 4]); c.lineWidth = 2;
      c.beginPath(); c.moveTo(8, 0); c.lineTo(6.2 * TILE, 0); c.stroke(); c.setLineDash([]); c.lineWidth = 1; c.restore();
    }
    if (b.name === 'sparkhorn' && b.ss === 'aim') {
      c.save(); c.rotate(b.aimA);
      c.strokeStyle = 'rgba(255,230,120,' + (0.4 + 0.3 * Math.sin(b.t * 10)) + ')'; c.setLineDash([4, 4]); c.lineWidth = 2;
      c.beginPath(); c.moveTo(8, 0); c.lineTo(5 * TILE, 0); c.stroke(); c.setLineDash([]); c.lineWidth = 1; c.restore();
    }
    if (b.name === 'pufflord') {
      for (const q of (b.puffs || [])) {         // the decoy puffs (world-anchored)
        const qx = q.x - b.x, qy = q.y - b.y;
        c.fillStyle = 'rgba(36,26,51,.4)'; c.beginPath(); c.ellipse(qx, qy + 4, 12, 6, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(244,247,255,.95)'; c.beginPath(); c.ellipse(qx, qy - 2, 11, 8, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(223,232,250,.9)'; c.beginPath(); c.ellipse(qx - 4, qy + 1, 6, 4, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(qx + 4, qy - 5, 6.4, 4.4, 0, 0, 7); c.fill();
      }
      if (b.hid && b.shieldT <= 0) {             // the real one wears a puff too
        c.fillStyle = 'rgba(244,247,255,.9)'; c.beginPath(); c.ellipse(0, -8, 12, 9, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(4, -12, 6.4, 4.4, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(223,232,250,.9)'; c.beginPath(); c.ellipse(-5, -5, 6, 4, 0, 0, 7); c.fill();
        // ...but his crown pokes out (the tell!)
        c.fillStyle = '#f8d048'; c.fillRect(-4, -19, 8, 3); c.fillRect(-4, -22, 2, 3); c.fillRect(2, -22, 2, 3); c.fillRect(-1, -21, 2, 2);
      }
    }
    drawOrig.call(this, c, b);
  };
})();

// ============================ THE FOUR MAPS ============================
function buildWorld2() {
  if (MAPS.sky1) return;
  const edge = (m) => { for (let i = 0; i < m.w; i++) { T(m, i, 0, 'cloud'); T(m, i, m.h - 1, 'cloud'); } for (let j = 0; j < m.h; j++) { T(m, 0, j, 'cloud'); T(m, m.w - 1, j, 'cloud'); } };

  // ===== SKY 1 — CLOUDRISE LANDING (the wind lesson) =====
  {
    const m = newMap('sky1', 40, 20, 'rift', { name: 'Cloudrise Landing', song: 'boss', cliff: 'void', zone: 'sky' });
    R(m, 2, 12, 36, 6, 'skyfloor'); edge(m);
    m.start = { x: 4, y: 15 };
    SIGN(m, 3, 16, 'SKYWARD ASCENT! Grab the RAM SUIT, LUNGE (Z) the cracked wall — and mind the WIND: leaf-streams CARRY you, and their leaves are thick enough to WALK ON.');
    CHEST(m, 6, 13, { item: 'ramsuit' });
    R(m, 11, 1, 1, 11, 'cloud'); R(m, 11, 12, 1, 6, 'crack'); T(m, 11, 18, 'cloud');   // full-height wall: the crack is the ONLY way
    SIGN(m, 9, 16, 'A cracked cloud-wall! With the RAM SUIT, LUNGE (Z) to bust through.');
    // the wind lesson: a leaf-stream bridges the first gap
    R(m, 15, 12, 3, 6, 'rift');
    SIGN(m, 13, 16, 'The floor is GONE — but look: the leaf-stream blows thick across. Walk the wind!');
    // the upper terrace: a PULSING stream (watch the windsock)
    R(m, 14, 4, 20, 5, 'skyfloor');
    R(m, 14, 9, 20, 3, 'rift');
    R(m, 32, 4, 1, 5, 'crack');
    CHEST(m, 33, 4, { heartpiece: 1 });
    SIGN(m, 22, 13, 'An UP-draft gusts in bursts — the WINDSOCK shows when. Ride it to the high meadow (condors! treasure!).');
    SPAWN(m, 'condor', 16, 5, 10, 3, 2); SPAWN(m, 'condor', 22, 13, 8, 4, 2);
    SIGN(m, 26, 16, 'THE GUST WING dives along the wind-lines — sidestep its swoop, let RAMSI headbutt, then NET it (Z)!');
    OBJ(m, { type: 'boss', x: 28, y: 14, boss: 'gustwing' });
    OBJ(m, { type: 'portal', x: 35, y: 14, to: 'sky2', tx: 4, ty: 16, req: 'gustwing' });
    OBJ(m, { type: 'windsock', x: 21, y: 12, lane: 2, deco: true });
    OBJ(m, { type: 'windnet', x: 1, y: m.h - 2, deco: true });
    m._wind = [
      { x: 14, y: 13, w: 5, h: 4, dx: 1, dy: 0, str: 46, bridge: true },                       // 0: the lesson stream
      { x: 2, y: 13, w: 8, h: 4, dx: 1, dy: 0, str: 24 },                                      // 1: a gentle tailwind at the start
      { x: 19, y: 8, w: 2, h: 5, dx: 0, dy: -1, str: 28, bridge: true, pulse: [2.8, 1.9, 0] }, // 2: the pulsing up-draft
    ];
  }

  // ===== SKY 2 — GALE TERRACES (puff-stones + the sky-switch) =====
  {
    const m = newMap('sky2', 40, 22, 'rift', { name: 'Gale Terraces', song: 'boss', cliff: 'void', zone: 'sky' });
    R(m, 2, 13, 36, 6, 'skyfloor'); edge(m);
    m.start = { x: 4, y: 16 };
    SIGN(m, 3, 16, 'GALE TERRACES. PUFF-STONES swell and fade on the wind\'s beat — cross while they\'re plump! A SKY-SWITCH bars the gate: bring RAMSI close.');
    R(m, 8, 13, 4, 6, 'rift');                    // the puff-stone crossing
    OBJ(m, { type: 'ramswitch', x: 15, y: 16, flag: 'sky2_gate', msg: 'RAMSI butts the SKY-SWITCH — the cloud-gate grinds open!' });
    SIGN(m, 13, 14, 'A SKY-SWITCH, too high for Noah. Stand near it — RAMSI headbutts it for you.');
    R(m, 20, 1, 1, 18, 'cloud'); R(m, 20, 19, 1, 2, 'cloud');
    DOOR(m, 20, 16, 'flag', 'sky2_gate', 'A sky-gate — RAMSI\'s switch will open it.');
    // the high terrace + its pulsing up-draft
    R(m, 24, 5, 10, 4, 'skyfloor');
    R(m, 24, 9, 10, 4, 'rift');
    CHEST(m, 31, 6, { gems: 6 });
    SIGN(m, 27, 14, 'Another burst-draft climbs to the high terrace — windsock says WHEN.');
    SIGN(m, 23, 17, 'THE PUFF LORD hides among his cloud-puffs — but his CROWN pokes out! Ramsi pops his armor, then GRAB him (Z)!');
    OBJ(m, { type: 'boss', x: 28, y: 15, boss: 'pufflord' });
    OBJ(m, { type: 'portal', x: 35, y: 16, to: 'sky3', tx: 4, ty: 16, req: 'pufflord' });
    SPAWN(m, 'jellyfish', 22, 13, 8, 5, 2);
    OBJ(m, { type: 'windsock', x: 7, y: 13, lane: 0, deco: true });
    OBJ(m, { type: 'windsock', x: 26, y: 9, lane: 5, deco: true });
    OBJ(m, { type: 'windnet', x: 1, y: m.h - 2, deco: true });
    OBJ(m, { type: 'balloon', x: 2, y: 3, phase: 0.1, col: '#e8589a', deco: true });
    OBJ(m, { type: 'balloon', x: 2, y: 5, phase: 0.55, col: '#58c4e8', deco: true });
    m._wind = [
      { x: 8, y: 14, w: 1, h: 1, dx: 0, dy: 0, str: 0, bridge: true, pulse: [2.2, 2.2, 0] },     // puff-stones (staggered)
      { x: 9, y: 16, w: 1, h: 1, dx: 0, dy: 0, str: 0, bridge: true, pulse: [2.2, 2.2, 1.1] },
      { x: 10, y: 14, w: 1, h: 1, dx: 0, dy: 0, str: 0, bridge: true, pulse: [2.2, 2.2, 2.2] },
      { x: 11, y: 16, w: 1, h: 1, dx: 0, dy: 0, str: 0, bridge: true, pulse: [2.2, 2.2, 3.3] },
      { x: 9, y: 13, w: 1, h: 1, dx: 0, dy: 0, str: 0, bridge: true, pulse: [2.2, 2.2, 1.6] },
      { x: 28, y: 9, w: 2, h: 4, dx: 0, dy: -1, str: 26, bridge: true, pulse: [2.6, 2.0, 0] },   // 5: terrace up-draft
    ];
  }

  // ===== SKY 3 — THUNDERHEAD SPAN (plates, rods, squalls) =====
  {
    const m = newMap('sky3', 40, 22, 'rift', { name: 'Thunderhead Span', song: 'boss', cliff: 'void', zone: 'sky' });
    R(m, 2, 13, 36, 6, 'skyfloor'); edge(m);
    m.start = { x: 4, y: 16 };
    SIGN(m, 3, 16, 'THUNDERHEAD SPAN. Bolts hunt the METAL PLATES — but they\'d rather hit a LIGHTNING ROD. Walk in a rod\'s shadow, and mind the shoving SQUALLS!');
    R(m, 10, 13, 4, 6, 'water');                  // the sky-pool (suit)
    R(m, 20, 1, 1, 12, 'cloud'); R(m, 20, 19, 1, 2, 'cloud');
    R(m, 20, 13, 1, 6, 'crack');                  // the cracked seam (ram) — full-height wall above/below
    for (const [px, py] of [[15, 14], [17, 17], [23, 16], [25, 13], [18, 13]]) OBJ(m, { type: 'stormplate', x: px, y: py, deco: true });
    OBJ(m, { type: 'lightningrod', x: 16, y: 16, deco: true });
    OBJ(m, { type: 'lightningrod', x: 24, y: 15, deco: true });
    SIGN(m, 21, 17, 'SPARKHORN charges in lines — and calls bolts down on its OWN head. Keep clear, let it fry itself (or let RAMSI butt it), then HARPOON (Z)!');
    OBJ(m, { type: 'boss', x: 28, y: 15, boss: 'sparkhorn' });
    R(m, 31, 7, 4, 4, 'skyfloor'); R(m, 33, 11, 1, 2, 'crack'); CHEST(m, 32, 8, { heartpiece: 1 });
    OBJ(m, { type: 'portal', x: 35, y: 16, to: 'sky4', tx: 4, ty: 16, req: 'sparkhorn' });
    SPAWN(m, 'condor', 22, 13, 8, 4, 2);
    OBJ(m, { type: 'windsock', x: 14, y: 13, lane: 0, deco: true });
    OBJ(m, { type: 'windnet', x: 1, y: m.h - 2, deco: true });
    OBJ(m, { type: 'stormfx', x: 1, y: 20, deco: true });
    m._wind = [
      { x: 14, y: 13, w: 12, h: 6, dx: 0, dy: 1, str: 34, pulse: [2.1, 2.7, 0] },   // the shoving squall
    ];
    m._storm = { plates: [[15, 14], [17, 17], [23, 16], [25, 13], [18, 13]], rods: [[16, 16], [24, 15]], t: 2, rate: 2.6, bolts: [] };
  }

  // ===== SKY 4 — STORM CITADEL (the exam) =====
  {
    const m = newMap('sky4', 40, 22, 'rift', { name: 'Storm Citadel', song: 'boss', cliff: 'stone', zone: 'sky' });
    R(m, 2, 13, 36, 6, 'skyfloor'); edge(m);
    m.start = { x: 4, y: 16 };
    SIGN(m, 3, 16, 'THE STORM CITADEL. Berkley & Megan are caged above! Hostile gusts shove toward the drop — cross on the beat, SMASH the gates, and end the STORM-LORD.');
    R(m, 3, 18, 15, 1, 'rift');                   // the wind tries to shove you off THIS edge
    R(m, 9, 1, 1, 12, 'cloud'); T(m, 9, 18, 'cloud'); R(m, 9, 19, 1, 2, 'cloud');
    R(m, 17, 1, 1, 12, 'cloud'); T(m, 17, 18, 'cloud'); R(m, 17, 19, 1, 2, 'cloud');
    R(m, 9, 13, 1, 5, 'crack');
    R(m, 17, 13, 1, 5, 'crack');
    R(m, 18, 13, 2, 5, 'rift');                   // the moat before the arena (puff-stones)
    R(m, 20, 8, 15, 11, 'skyfloor');              // the arena
    for (const [px, py] of [[23, 16], [31, 12]]) OBJ(m, { type: 'stormplate', x: px, y: py, deco: true });
    OBJ(m, { type: 'lightningrod', x: 26, y: 17, deco: true });
    SIGN(m, 21, 17, 'THE STORM-LORD! Three tempers: bolts, then a shoving SQUALL-SWIRL, then fury. Keep RAMSI on him and BONE him down (Z)!');
    OBJ(m, { type: 'boss', x: 27, y: 14, boss: 'tempestia' });
    R(m, 24, 2, 6, 4, 'skyfloor');
    R(m, 24, 1, 6, 1, 'cloud'); R(m, 23, 1, 1, 7, 'cloud'); R(m, 30, 1, 1, 7, 'cloud');   // the storm-cage ring
    R(m, 24, 6, 6, 1, 'cloud'); R(m, 24, 7, 6, 1, 'cloud'); R(m, 26, 6, 1, 2, 'crack');   // crack = the only way up
    OBJ(m, { type: 'parents', x: 26, y: 3 });
    SIGN(m, 30, 4, 'BERKLEY & MEGAN! Beat the STORM-LORD, RAM up through the cracked ceiling, and free them (SPACE).');
    OBJ(m, { type: 'windsock', x: 5, y: 13, lane: 0, deco: true });
    OBJ(m, { type: 'windnet', x: 1, y: m.h - 2, deco: true });
    OBJ(m, { type: 'stormfx', x: 1, y: 20, deco: true });
    m._wind = [
      { x: 3, y: 13, w: 14, h: 5, dx: 0, dy: 1, str: 40, pulse: [2.6, 1.7, 0] },              // 0: the killer gust
      { x: 18, y: 14, w: 1, h: 1, dx: 0, dy: 0, str: 0, bridge: true, pulse: [2.0, 2.0, 0] }, // moat puff-stones
      { x: 19, y: 16, w: 1, h: 1, dx: 0, dy: 0, str: 0, bridge: true, pulse: [2.0, 2.0, 1.0] },
      { x: 18, y: 17, w: 1, h: 1, dx: 0, dy: 0, str: 0, bridge: true, pulse: [2.0, 2.0, 2.0] },
    ];
    m._storm = { plates: [[23, 16], [31, 12]], rods: [[26, 17]], t: 3, rate: 3.2, bolts: [] };
  }
}
if (typeof G !== 'undefined' && G.NQ) { G.NQ.buildWorld2 = buildWorld2; }
