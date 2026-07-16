"use strict";
// ============== BURROW 6 REBUILT — ROOT HOLLOWS: the SAP-FLOW level ==============
// Overrides buildBurrow6. New reusable system:
//   * Sap — the HEART-ROOT pumps glowing amber sap through an authored root network.
//     ROOT-BULB junctions choose which branch drinks: RAMSI butts a bulb (C) to turn it;
//     one bulb hides in a sealed vein-pocket and is turned by SHRINKING Ramsi through a
//     burrow-hole (press C at the hole — he rotates it from inside). When sap reaches a
//     SAP-RUNE the root there BLOOMS once, permanently: it drains a pool, grows a living
//     bridge, or opens a gate — implemented as m.puzzle entries (sw_* switchFlags +
//     applyPuzzle tile swaps), so the wire overlay, save/reload, _choke's 'bridge'
//     mechanic and validate's pre-solve all work unchanged.
//   * THORNBACK rebuilt: a charge-liner — telegraphed dashes that leave fading THORN
//     TRAILS; a charge across the den's sticky SAP CHANNEL glues it down for a long
//     free window. Ramsi's headbutt still opens the normal window (gauntlet-safe).

// ================================ SAP ================================
(function () {   // defensive: undefined reqs are simply unmet (new object types carry no flag)
  const orig = Game.lookupFlag;
  Game.lookupFlag = function (req) { if (!req) return false; return orig.call(this, req); };
})();

const Sap = {
  fed: new Set(),          // fed edge ids (this map, this tick)
  network(m) { return m && m._sap; },
  bulb(m, id) { for (const o of m.objects) if (o.type === 'sapbulb' && o.id === id) return o; return null; },
  recompute(m) {
    const net = this.network(m); this.fed = new Set();
    if (!net) return;
    const fedNodes = new Set([net.source]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const e of net.edges) {
        if (this.fed.has(e.id)) continue;
        if (!fedNodes.has(e.a) && !fedNodes.has(e.b)) continue;
        if (e.gate) { const b = this.bulb(m, e.gate.bulb); if (!b || b.state !== e.gate.state) continue; }
        this.fed.add(e.id); fedNodes.add(e.a); fedNodes.add(e.b); grew = true;
      }
    }
    // fire any freshly-fed runes (once, permanently)
    for (const o of m.objects) {
      if (o.type !== 'saprune' || !this.fed.has(o.edge)) continue;
      const pz = (m.puzzle || []).find(p => p.flag === o.flag);
      if (!pz || Game.flags.switchFlags[o.flag]) continue;
      Game.flags.switchFlags[o.flag] = true; Game.applyPuzzle(m, pz);
      Audio2.jingle(pz.jingle || 'door');
      Particles.burst(o.x * TILE + 8, o.y * TILE + 8, 'sparkle'); Particles.burst(o.x * TILE + 8, o.y * TILE + 2, 'confetti');
      if (pz.msg) Game.banner(pz.msg); saveGame();
    }
  },
  update(dt, m) { if (m && m._sap && Game.mapId === m.id) this.recompute(m); },
  fedTiles(m) {            // world tiles under fed edges (for the light mask)
    const out = []; const net = this.network(m); if (!net) return out;
    for (const e of net.edges) if (this.fed.has(e.id)) for (const [x, y] of e.tiles) out.push([x, y]);
    return out;
  },
};
if (typeof G !== 'undefined' && G.NQ) G.NQ.Sap = Sap;

(function () {
  const orig = Game.updateBurrowAbilities;
  Game.updateBurrowAbilities = function (dt) { orig.call(this, dt); Sap.update(dt, this.map); };
})();

// C key: turn a root-bulb (directly, or through its vein-hole with Shrink)
(function () {
  const orig = Game.ramsiCommand;
  Game.ramsiCommand = function () {
    const m = this.map;
    if (this.companionActive && this.companionActive() && m && m._sap) {
      const comp = this.companion;
      // bulb-holes swallow the press entirely (never fall through to the plain ramhole logic)
      let nearHole = null;
      for (const o of m.objects) if (o.type === 'ramhole' && o.bulb && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 30) nearHole = o;
      if (comp.busyT > 0) { if (nearHole) return; }
      const turn = (b, viaHole) => {
        b.state = b.states[(b.states.indexOf(b.state) + 1) % b.states.length];
        comp.busyT = viaHole ? 0.6 : 0.35;
        if (viaHole) comp.shrinkT = 1.0;
        Audio2.jingle('key'); Particles.burst(b.x * TILE + 8, b.y * TILE + 4, 'sparkle');
        this.toast(viaHole ? 'RAMSI shrinks into the vein and heaves the hidden bulb — ' + Sap.stateName(b) : 'RAMSI butts the root-bulb — ' + Sap.stateName(b));
        Sap.recompute(m);
      };
      if (!(comp.busyT > 0)) {
        for (const o of m.objects) if (o.type === 'sapbulb' && o.rot && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 26) { turn(o, false); return; }
        if (nearHole && this.flags.ramShrink) {
          const b = Sap.bulb(m, nearHole.bulb);
          if (b) { comp.x = nearHole.x * TILE + 8; comp.y = nearHole.y * TILE + 8; turn(b, true); return; }
        }
        if (nearHole) return;   // hole present but no Shrink yet: swallow, no crash
      }
    }
    return orig.call(this);
  };
})();
Sap.stateName = function (b) { return b.state === 'off' ? 'the sap is STOPPED.' : 'the sap flows ' + ({ E: 'EAST', W: 'WEST', N: 'NORTH', S: 'SOUTH' }[b.state] || b.state) + '!'; };

// Root Hollows light: the heart-root, fed roots, bulbs and runes glow through the veil
(function () {
  const orig = Game.drawLightMask;
  Game.drawLightMask = function (c, map, camX, camY, Z) {
    orig.call(this, c, map, camX, camY, Z);
    if (!map._sap) return;
    c.save(); c.globalCompositeOperation = 'lighter';
    const halo = (wx, wy, r, col, a) => {
      const sx = (wx - camX) * Z, sy = (wy - camY) * Z;
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, r);
      g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      c.fillStyle = g; c.beginPath(); c.arc(sx, sy, r, 0, 7); c.fill();
    };
    if (map._sapChannel) for (const k of map._sapChannel) {   // the sticky channel shimmers amber
      const [x, y] = k.split(',').map(Number);
      halo(x * TILE + 8, y * TILE + 8, 13, '255,170,60', 0.22 + 0.08 * Math.sin(Game.time * 3 + x));
    }
    const hr = map._sap.heart;
    halo(hr[0] * TILE + 8, hr[1] * TILE + 4, 110, '255,190,90', 0.34 + 0.08 * Math.sin(Game.time * 2.4));
    for (const [x, y] of Sap.fedTiles(map)) halo(x * TILE + 8, y * TILE + 8, 20, '255,180,80', 0.14);
    for (const o of map.objects) {
      if (o.type === 'sapbulb') halo(o.x * TILE + 8, o.y * TILE + 8, 24, o.state === 'off' ? '150,120,80' : '255,190,90', 0.3);
      else if (o.type === 'saprune') halo(o.x * TILE + 8, o.y * TILE + 8, Game.flags.switchFlags[o.flag] ? 30 : 14, '255,210,110', 0.3);
    }
    c.restore();
  };
})();

// ======================= object drawers =======================
Game.OBJDRAW = Game.OBJDRAW || {};
Game.OBJDRAW.rootseg = function (c, o, ox, oy) {
  const fed = Sap.fed.has(o.edge);
  const cx = ox + 8, cy = oy + 8, w = hash2(o.x * 3, o.y * 7) * 3 - 1.5;
  c.strokeStyle = '#241a33'; c.lineWidth = 6; c.lineCap = 'round';
  const seg = (x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
  const dirs = o.c;
  if (dirs.E) seg(cx + w, cy, ox + 16, cy); if (dirs.W) seg(ox, cy, cx + w, cy);
  if (dirs.N) seg(cx, oy, cx, cy + w); if (dirs.S) seg(cx, cy + w, cx, oy + 16);
  c.strokeStyle = '#5a3c22'; c.lineWidth = 4;
  if (dirs.E) seg(cx + w, cy, ox + 16, cy); if (dirs.W) seg(ox, cy, cx + w, cy);
  if (dirs.N) seg(cx, oy, cx, cy + w); if (dirs.S) seg(cx, cy + w, cx, oy + 16);
  if (fed) {
    const p = 0.6 + 0.4 * Math.sin(Game.time * 5 + (o.x + o.y) * 0.9);
    c.strokeStyle = 'rgba(255,178,64,' + (0.85 * p).toFixed(2) + ')'; c.lineWidth = 1.8;
    if (dirs.E) seg(cx + w, cy, ox + 16, cy); if (dirs.W) seg(ox, cy, cx + w, cy);
    if (dirs.N) seg(cx, oy, cx, cy + w); if (dirs.S) seg(cx, cy + w, cx, oy + 16);
    const u = (Game.time * 1.4 + hash2(o.x, o.y)) % 1;                   // a traveling sap-bead
    if (u < 0.25) { c.fillStyle = '#ffd98a'; c.fillRect(cx - 1.5 + (dirs.E ? u * 40 : 0), cy - 1.5 + (dirs.S ? u * 40 : 0), 3, 3); }
  }
  c.lineWidth = 1; c.lineCap = 'butt';
};
Game.OBJDRAW.sapbulb = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 9 - e, on = o.state !== 'off';
  c.fillStyle = 'rgba(20,10,40,.35)'; c.beginPath(); c.ellipse(cx, cy + 4, 7, 2.2, 0, 0, 7); c.fill();
  c.fillStyle = '#241a33'; c.beginPath(); c.arc(cx, cy, 7.4, 0, 7); c.fill();
  c.fillStyle = on ? '#c88a3c' : '#6a4a2a'; c.beginPath(); c.arc(cx, cy, 6, 0, 7); c.fill();
  c.fillStyle = on ? '#ffb240' : '#8a643c'; c.beginPath(); c.arc(cx - 1, cy - 1.5, 3.6, 0, 7); c.fill();
  if (on) { c.fillStyle = '#ffe0a0'; c.beginPath(); c.arc(cx - 1.5, cy - 2, 1.4, 0, 7); c.fill(); }
  const d = { E: [1, 0], S: [0, 1], W: [-1, 0], N: [0, -1] }[o.state];
  if (d) { c.strokeStyle = '#ffd98a'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx + d[0] * 6, cy + d[1] * 6); c.lineTo(cx + d[0] * 11, cy + d[1] * 11); c.stroke();
    c.beginPath(); c.moveTo(cx + d[0] * 11 - d[1] * 3, cy + d[1] * 11 - d[0] * 3); c.lineTo(cx + d[0] * 11 + d[1] * 3, cy + d[1] * 11 + d[0] * 3); c.stroke(); c.lineWidth = 1; }
  else { c.fillStyle = '#241a33'; c.fillRect(cx - 3, cy - 0.8, 6, 1.6); }
  if (o.rot && dist(Player.x, Player.y, ox + 8, oy + 8) < 26 && Game.companionActive && Game.companionActive())
    drawText(c, 'C: TURN!', cx - 15, cy - 20, 7, '#f8e858', '#241a33');
};
Game.OBJDRAW.saprune = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 8 - e, on = Game.flags.switchFlags[o.flag];
  const p = 0.5 + 0.5 * Math.sin(Game.time * 3 + o.x);
  c.strokeStyle = on ? '#ffb240' : 'rgba(200,150,90,' + (0.5 + 0.4 * p).toFixed(2) + ')'; c.lineWidth = 2;
  c.beginPath(); c.arc(cx, cy, 5.5, 0, 7); c.stroke();
  c.beginPath(); c.moveTo(cx, cy - 3); c.quadraticCurveTo(cx + 3, cy, cx, cy + 3); c.quadraticCurveTo(cx - 3, cy, cx, cy - 3); c.stroke();
  c.lineWidth = 1;
  if (on) {   // the bloomed root-flower
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5 + Game.time * 0.3; c.fillStyle = '#f8b8ce'; c.beginPath(); c.ellipse(cx + Math.cos(a) * 4.4, cy - 8 + Math.sin(a) * 4.4, 3, 1.8, a, 0, 7); c.fill(); }
    c.fillStyle = '#ffd98a'; c.beginPath(); c.arc(cx, cy - 8, 2.4, 0, 7); c.fill();
  }
};
Game.OBJDRAW.heartroot = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 8 - e, t = Game.time;
  const beat = 1 + 0.06 * Math.sin(t * 2.4) + 0.03 * Math.sin(t * 4.8 + 1);
  c.save(); c.translate(cx, cy); c.scale(beat, beat);
  for (let k = 0; k < 6; k++) {   // root flares
    const a = k * Math.PI / 3 + 0.3;
    c.strokeStyle = '#241a33'; c.lineWidth = 5; c.beginPath(); c.moveTo(Math.cos(a) * 6, Math.sin(a) * 4); c.quadraticCurveTo(Math.cos(a) * 16, Math.sin(a) * 12, Math.cos(a) * 22, Math.sin(a) * 18); c.stroke();
    c.strokeStyle = '#5a3c22'; c.lineWidth = 3; c.beginPath(); c.moveTo(Math.cos(a) * 6, Math.sin(a) * 4); c.quadraticCurveTo(Math.cos(a) * 16, Math.sin(a) * 12, Math.cos(a) * 22, Math.sin(a) * 18); c.stroke();
  }
  c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(0, -6, 13, 15, 0, 0, 7); c.fill();
  c.fillStyle = '#a86428'; c.beginPath(); c.ellipse(0, -6, 11.4, 13.4, 0, 0, 7); c.fill();
  c.fillStyle = '#ffb240'; c.beginPath(); c.ellipse(-2, -8, 6.5, 8, -0.2, 0, 7); c.fill();
  c.fillStyle = '#ffe0a0'; c.beginPath(); c.ellipse(-3.5, -10, 2.6, 3.4, -0.2, 0, 7); c.fill();
  c.restore();
  c.lineWidth = 1;
  if (dist(Player.x, Player.y, ox + 8, oy + 8) < 42) drawText(c, 'the HEART-ROOT', cx - 34, cy - 30, 7, '#ffd98a', '#241a33');
};

// ======================= THORNBACK, rebuilt (charge-liner) =======================
(function () {
  const upPrev = Bosses.up_warden, drawPrev = Bosses.drawWarden;
  Bosses.up_warden = function (b, dt) {
    if (b.name !== 'thornback') return upPrev.call(this, b, dt);
    const p = Player, cfg = b.cfg, comp = Game.companion;
    if (b.inv > 0) b.inv -= dt;
    if (b.shieldT > 0) b.shieldT -= dt;
    if (b.stun > 0) b.stun -= dt;
    if (b.tstate === undefined) { b.tstate = 'aim'; b.tT = 1.2; b._thorns = []; }
    for (const th of b._thorns) th.life -= dt;
    b._thorns = b._thorns.filter(th => th.life > 0);
    if (b.stuckT > 0) {
      b.stuckT -= dt;
      if (b.stuckT <= 0) { b.tstate = 'aim'; b.tT = 1.0; }
    } else if (b.tstate === 'aim') {
      b.tT -= dt;
      b.aimA = Math.atan2(p.y - b.y, p.x - b.x);
      if (b.tT <= 0) { b.tstate = 'charge'; b.tT = 0; b.chD = 0; Audio2.jingle('step'); }
    } else if (b.tstate === 'charge') {
      const spd = 175, dx = Math.cos(b.aimA) * spd * dt, dy = Math.sin(b.aimA) * spd * dt;
      b.x += dx; b.y += dy; b.chD += Math.hypot(dx, dy);
      if ((b.thT = (b.thT || 0) - dt) <= 0) { b.thT = 0.07; b._thorns.push({ x: b.x, y: b.y, life: 6.5 }); }
      const ti = (b.x / TILE) | 0, tj = (b.y / TILE) | 0;
      const solid = (TILEDEFS[tileAt(Game.map, ti, tj)] || {}).solid;
      const inChannel = Game.map._sapChannel && Game.map._sapChannel.has(ti + ',' + tj);
      if (inChannel) {
        b.stuckT = 2.8; b.shieldT = Math.max(b.shieldT, 2.8); b.inv = 0; b.tstate = 'stuck';
        Audio2.jingle('cage'); Particles.burst(b.x, b.y, 'sparkle');
        Game.banner('THORNBACK charges into the STICKY SAP — glued! NET it (Z)!');
      } else if (solid || b.chD > 5.5 * TILE) {
        b.tstate = 'aim'; b.tT = 1.0 + Math.random() * 0.4;
        b.x = clamp(b.x, b.hx - 5 * TILE, b.hx + 5 * TILE); b.y = clamp(b.y, b.hy - 4.5 * TILE, b.hy + 4.5 * TILE);
      }
    }
    // thorn trail pricks
    if (Player.inv <= 0) for (const th of b._thorns) if (dist(p.x, p.y, th.x, th.y) < 8) { Player.hurt(1); break; }
    if (b.shieldT > 0) {
      if (this.wardenHit(b)) {
        b.hits++; b.inv = 0.7; Audio2.jingle('capture'); Particles.burst(b.x, b.y - 12, 'confetti');
        if (b.hits >= b.armor) { this.catchBoss(b); return; }
        Game.banner('HIT! ' + cfg.title + ' (' + b.hits + '/' + b.armor + ')!');
      }
    } else if (this.wardenHit(b)) {
      if (Game.time - (b.clinkT || 0) > 1) { b.clinkT = Game.time; Game.toast(cfg.title + ' is all armor — RAMSI headbutts it, or bait a charge into the STICKY SAP!'); }
      b.inv = 0.4;
    }
    if (Player.inv <= 0 && !(b.stuckT > 0) && b.stun <= 0 && !(comp.decoyT > 0) && dist(p.x, p.y, b.x, b.y) < 14) Player.hurt(1);
  };
  Bosses.drawWarden = function (c, b) {
    if (b.name !== 'thornback') return drawPrev.call(this, c, b);
    // world-anchored extras first (relative to the boss translate)
    for (const th of (b._thorns || [])) {
      const a = Math.min(1, th.life / 1.5);
      c.fillStyle = 'rgba(36,26,51,' + a.toFixed(2) + ')';
      c.beginPath(); c.moveTo(th.x - b.x, th.y - b.y - 5); c.lineTo(th.x - b.x + 3, th.y - b.y + 1); c.lineTo(th.x - b.x - 3, th.y - b.y + 1); c.closePath(); c.fill();
      c.fillStyle = 'rgba(120,200,140,' + (a * 0.9).toFixed(2) + ')';
      c.beginPath(); c.moveTo(th.x - b.x, th.y - b.y - 4); c.lineTo(th.x - b.x + 2, th.y - b.y); c.lineTo(th.x - b.x - 2, th.y - b.y); c.closePath(); c.fill();
    }
    if (b.tstate === 'aim' && b.awake && !(b.stuckT > 0)) {   // the telegraph line
      c.save(); c.rotate(b.aimA);
      c.strokeStyle = 'rgba(232,74,74,' + (0.4 + 0.3 * Math.sin(b.t * 10)) + ')'; c.setLineDash([4, 4]); c.lineWidth = 2;
      c.beginPath(); c.moveTo(10, 0); c.lineTo(5.5 * TILE, 0); c.stroke();
      c.setLineDash([]); c.lineWidth = 1; c.restore();
    }
    if (b.stuckT > 0) {   // sap goo
      c.fillStyle = 'rgba(255,178,64,.5)'; c.beginPath(); c.ellipse(0, 2, 14, 5, 0, 0, 7); c.fill();
      c.rotate(Math.sin(b.t * 14) * 0.06);
    }
    drawPrev.call(this, c, b);
  };
})();

// ============================ THE MAP ============================
function buildBurrow6() {
  if (MAPS.burrow6) return;
  const m = newMap('burrow6', 64, 40, 'soil', { name: 'Root Hollows', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  m.lightMask = true; m.darkness = 0.86;
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  m.start = { x: 4, y: 20 };
  const vein = (p) => { for (const [x, y] of p) T(m, x, y, 'glowvein'); };

  // ---------------- WEST: the living hollow ----------------
  NPC(m, 5, 22, 'sal', 'Bog-Keeper');
  SIGN(m, 3, 23, 'THE ROOT HOLLOWS — every root here drinks from the great HEART-ROOT. Turn the ROOT-BULBS (C) and the sap follows... and where sap flows, old roots BLOOM. The dig-works lie EAST.');
  OBJ(m, { type: 'heartroot', x: 18, y: 20, deco: true });
  blob(m, 10, 10, 4.6, 2.8, 'water', 0, 6301, ['soil']);          // the octopus pool
  SPAWN(m, 'octopus', 7, 8, 7, 5, 3); SPAWN(m, 'jellyfish', 12, 9, 5, 4, 2);
  SPAWN(m, 'goat', 5, 26, 11, 7, 3); SPAWN(m, 'crab', 15, 31, 9, 5, 2); SPAWN(m, 'ibex', 24, 27, 7, 6, 2);
  SIGN(m, 8, 14, 'Sap-swimmers drift the black pool — HARPOON the octopi; jellies sting (DECOY them... once you can!).');
  vein([[7, 17], [13, 23], [22, 25], [26, 14], [9, 24], [15, 6], [27, 31], [4, 31]]);
  CHEST(m, 27, 5, { coins: 14 });

  // the drain-pool (SW) hiding a heart-piece
  R(m, 7, 32, 6, 4, 'water');
  CHEST(m, 9, 34, { heartpiece: 1 });
  SIGN(m, 13, 33, 'A drowned hollow... something glints under the sap. If only the pool would DRAIN.');

  // the bloom-vault (N) behind a root that only sap can open
  R(m, 16, 4, 5, 1, 'rootwall'); R(m, 16, 5, 1, 2, 'rootwall'); R(m, 20, 5, 1, 2, 'rootwall'); T(m, 18, 6, 'rootwall');
  CHEST(m, 18, 5, { gems: 7 });

  // ---------------- the SEALED DIG-WORKS (x30-62) ----------------
  R(m, 30, 11, 25, 3, 'rootwall');                      // thick north band wall (x30-54)
  R(m, 30, 27, 25, 1, 'rootwall');                      // south band wall
  R(m, 30, 14, 1, 13, 'rootwall');                      // west wall + the sap-gate
  DOOR(m, 30, 20, 'flag', 'sw_b6gate', 'A great root-gate, dry and shut. A sap-rune sleeps at its heart.');
  R(m, 41, 14, 1, 13, 'rift');                          // the SAP-FALL trench (bottomless: no jumping)
  POST(m, 42, 20); POST(m, 40, 20);                     // paired posts: across AND back
  R(m, 46, 14, 3, 13, 'chasm');                         // the bridge-pit (x46-48)
  R(m, 54, 11, 1, 16, 'rootwall');                      // den west wall
  DOOR(m, 54, 18, 'flag', 'sw_b6den', 'The Warden-door — its rune waits for sap.');
  R(m, 55, 10, 8, 1, 'rootwall');                       // den north wall
  R(m, 55, 27, 8, 4, 'rootwall');                       // den south ridge (bounce-only)

  // chamber A (x31-40): the sealed VEIN-POCKET bulb (turned via Shrink-hole)
  R(m, 34, 15, 3, 3, 'rootwall'); T(m, 35, 16, 'soil');  // the pocket, walled solid
  T(m, 34, 16, 'holegap');
  OBJ(m, { type: 'ramhole', x: 33, y: 16, bulb: 'B', compOnly: true });
  SIGN(m, 31, 22, 'The main-line bulb hides in a sealed VEIN-POCKET. Stand at the burrow-hole and press C — shrunk RAMSI turns it from inside!');
  SIGN(m, 37, 22, 'The sap-fall roars through the gap ahead — no root grows across THAT. Hook the POST (Z)!');
  vein([[32, 16], [39, 24]]);
  // the side-vault the pocket-bulb can also feed (aim it NORTH) — carved into the band wall
  T(m, 36, 12, 'soil');
  CHEST(m, 36, 12, { coins: 16 });

  // chamber B/C (x43-53): the bridge-root + the last bulb + the gems bloom
  SIGN(m, 43, 22, 'An old BRIDGE-ROOT spans the pit, shriveled dry. Feed it sap and watch it GROW.');
  R(m, 49, 24, 3, 1, 'rootwall'); T(m, 50, 24, 'rootwall'); R(m, 49, 25, 1, 2, 'rootwall'); R(m, 51, 25, 1, 2, 'rootwall');
  CHEST(m, 50, 25, { gems: 8 });
  vein([[44, 16], [52, 23], [50, 15]]);

  // the den (x55-62): THORNBACK + the sticky channel + BEAST MIMI + the bounce exit
  SIGN(m, 55, 23, 'THORNBACK charges in straight lines! Sidestep its dash — bait it into the STICKY SAP channel, or let RAMSI headbutt it. Then NET it (Z)!');
  OBJ(m, { type: 'boss', x: 58, y: 17, boss: 'thornback' });
  OBJ(m, { type: 'pillowkin', x: 61, y: 11, kin: 2, caged: true, warden: 'thornback', color: '#3a3550', name: 'BEAST MIMI',
    gives: ['ramBounce', 'ramDecoy'], freed: 'You free BEAST MIMI! RAMSI learns PILLOW-BOUNCE (stand on a mushroom, press X) and DECOY TAUNT (press C). BOUNCE over the ridge to descend!' });
  m._sapChannel = new Set();
  for (let x = 56; x <= 61; x++) { m._sapChannel.add(x + ',19'); m._sapChannel.add(x + ',20'); }
  CHEST(m, 62, 24, { gems: 6 });
  vein([[56, 14], [61, 22]]);
  OBJ(m, { type: 'bouncepad', x: 60, y: 23, to: [60, 33], msg: 'BOING! RAMSI springs Noah over the ridge to the exit shaft!' });
  SIGN(m, 56, 25, 'No way on but UP and over — stand on RAMSI\'s mushroom and BOUNCE (X)!');
  R(m, 56, 31, 1, 8, 'rootwall'); R(m, 57, 37, 6, 2, 'rootwall');
  R(m, 57, 31, 6, 6, 'soil');
  SIGN(m, 58, 34, 'The sap-fall pours down to the CRYSTAL DEEP below.');
  OBJ(m, { type: 'portal', x: 60, y: 33, to: 'burrow7', tx: 4, ty: 20, req: 'thornback' });

  // ================= THE SAP NETWORK =================
  // nodes: S=heart(18,20) A=(24,20) G=(31,20) B=(38,20) C=(45,20) D=(50,17)
  const lay = (pts) => { const tiles = []; for (let s = 0; s + 1 < pts.length; s++) { let [x, y] = pts[s]; const [x1, y1] = pts[s + 1], dx = Math.sign(x1 - x), dy = Math.sign(y1 - y); while (true) { tiles.push([x, y]); if (x === x1 && y === y1) break; x += dx; y += dy; } } return tiles; };
  const edges = [
    { id: 'e1', a: 'S', b: 'A', pts: [[18, 20], [24, 20]] },
    { id: 'e2', a: 'A', b: 'drain', pts: [[24, 20], [24, 30], [10, 30], [10, 32]], gate: { bulb: 'A', state: 'S' } },
    { id: 'e3', a: 'A', b: 'G', pts: [[24, 20], [30, 20]], gate: { bulb: 'A', state: 'E' } },
    { id: 'e4', a: 'A', b: 'bloom', pts: [[24, 20], [24, 12], [18, 12], [18, 7]], gate: { bulb: 'A', state: 'N' } },
    { id: 'e5', a: 'G', b: 'B', pts: [[31, 20], [38, 20]], gate: { bulb: 'B', state: 'E' } },
    { id: 'e6', a: 'G', b: 'vault', pts: [[35, 16], [35, 14], [36, 14], [36, 12]], gate: { bulb: 'B', state: 'N' } },
    { id: 'e7', a: 'B', b: 'C', pts: [[38, 20], [45, 20]] },
    { id: 'e8', a: 'C', b: 'bridge', pts: [[45, 20], [49, 20]] },
    { id: 'e9', a: 'C', b: 'D', pts: [[45, 20], [50, 20], [50, 17]] },
    { id: 'e10', a: 'D', b: 'den', pts: [[50, 17], [54, 17]], gate: { bulb: 'D', state: 'E' } },
    { id: 'e11', a: 'D', b: 'gems', pts: [[50, 17], [50, 24]], gate: { bulb: 'D', state: 'S' } },
  ];
  for (const e of edges) e.tiles = lay(e.pts);
  m._sap = { source: 'S', heart: [18, 20], edges };
  OBJ(m, { type: 'sapbulb', id: 'A', x: 24, y: 20, states: ['off', 'S', 'E', 'N'], state: 'off', rot: true });
  OBJ(m, { type: 'sapbulb', id: 'B', x: 35, y: 16, states: ['off', 'E', 'N'], state: 'off', rot: false, compOnly: true });
  OBJ(m, { type: 'sapbulb', id: 'D', x: 50, y: 17, states: ['off', 'E', 'S'], state: 'off', rot: true });
  SIGN(m, 22, 22, 'The first ROOT-BULB. Press C — RAMSI butts it a quarter-turn. Feed the drowned hollow... then feed the GATE.');
  OBJ(m, { type: 'saprune', edge: 'e2', x: 10, y: 32, flag: 'sw_b6drain' });
  OBJ(m, { type: 'saprune', edge: 'e3', x: 30, y: 20, flag: 'sw_b6gate' });
  OBJ(m, { type: 'saprune', edge: 'e4', x: 18, y: 7, flag: 'sw_b6bloom' });
  OBJ(m, { type: 'saprune', edge: 'e6', x: 36, y: 14, flag: 'sw_b6vault' });
  OBJ(m, { type: 'saprune', edge: 'e8', x: 49, y: 20, flag: 'sw_b6bridge' });
  OBJ(m, { type: 'saprune', edge: 'e10', x: 54, y: 17, flag: 'sw_b6den' });
  OBJ(m, { type: 'saprune', edge: 'e11', x: 50, y: 24, flag: 'sw_b6gems' });
  m.puzzle = [
    { sw: [10, 32], flag: 'sw_b6drain', to: 'soil', tiles: (() => { const t = []; for (let x = 7; x <= 12; x++) for (let y = 32; y <= 35; y++) t.push([x, y]); return t; })(),
      color: '255,178,64', jingle: 'dive', msg: 'GLUG! The old drain-root drinks the pool dry — the drowned hollow surfaces!' },
    { sw: [30, 20], flag: 'sw_b6gate', to: 'soil', tiles: [], wireTo: [30, 20],
      color: '255,178,64', jingle: 'door', msg: 'The gate-rune drinks deep — the great root-gate creaks OPEN!' },
    { sw: [18, 7], flag: 'sw_b6bloom', to: 'soil', tiles: [[18, 6]],
      color: '248,152,200', jingle: 'capture', msg: 'The dead root BLOOMS into a great flower — a hidden hoard peeks out!' },
    { sw: [36, 14], flag: 'sw_b6vault', to: 'soil', tiles: [[36, 13]],
      color: '255,178,64', jingle: 'door', msg: 'The vein-vault blooms open!' },
    { sw: [49, 20], flag: 'sw_b6bridge', to: 'bridge', tiles: [[46, 20], [47, 20], [48, 20]],
      color: '255,178,64', jingle: 'door', msg: 'The BRIDGE-ROOT gulps the sap and GROWS — a living bridge spans the pit!' },
    { sw: [54, 17], flag: 'sw_b6den', to: 'soil', tiles: [], wireTo: [54, 18],
      color: '255,178,64', jingle: 'door', msg: 'The Warden-door drinks — and rolls aside. THORNBACK waits.' },
    { sw: [50, 24], flag: 'sw_b6gems', to: 'soil', tiles: [[50, 24]],
      color: '255,178,64', jingle: 'door', msg: 'A gem-pocket blooms open!' },
  ];
  // draw-only root segments along every edge
  const segsAt = {};
  for (const e of edges) {
    for (let s = 0; s + 1 < e.pts.length; s++) {
      let [x, y] = e.pts[s]; const [x1, y1] = e.pts[s + 1], dx = Math.sign(x1 - x), dy = Math.sign(y1 - y);
      while (true) {
        const k = x + ',' + y;
        const o = segsAt[k] || (segsAt[k] = { type: 'rootseg', x, y, c: {}, edge: e.id, deco: true });
        if (x !== x1 || y !== y1) o.c[dx > 0 ? 'E' : dx < 0 ? 'W' : dy > 0 ? 'S' : 'N'] = 1;
        if (x !== e.pts[s][0] || y !== e.pts[s][1]) o.c[dx > 0 ? 'W' : dx < 0 ? 'E' : dy > 0 ? 'N' : 'S'] = 1;
        if (x === x1 && y === y1) break;
        x += dx; y += dy;
      }
    }
  }
  for (const k in segsAt) m.objects.unshift(segsAt[k]);
}
if (typeof G !== 'undefined' && G.NQ) { G.NQ.buildBurrow6 = buildBurrow6; }
