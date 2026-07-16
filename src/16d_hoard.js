"use strict";
// ============== BURROW 8 REBUILT — THE HOARD DESCENT: the MINECART level ==============
// Overrides buildBurrow8 (later declaration wins). New reusable system:
//   * Rails — dock objects with authored ROUTES (tile polylines). Step onto a dock and the
//     cart rides the line (chained Player.gArc segments — input locked, hazards skipped,
//     Ramsi rides along in the cart). Junctions are FLAGS set by existing switches
//     (boneswitch, block-on-switch puzzles): satisfy the flag and the ride goes through;
//     otherwise it takes the CRASH stub and tips Noah out safely beside the dock.
//     Soft-block BARRICADES on the line stop the solved route until ROLL-cleared.
//   * The TREMOR-GRUB is rebuilt: a tunneling worm — a coin-mound wake while buried
//     (unhittable), a swelling telegraph, then it ERUPTS for a proper co-op window.
// The five tool/ability gates of the old corridor survive as: SHRINK (dock-house latch),
// BONE (junction switch on a ledge), BRACERS (block re-aims the works), ROLL (barricade),
// HARPOON (the coin-fall post into the den). POUND smashes the throne-seal at the end.

// ================================ RAILS ================================
const Rails = {
  start(dock) {
    const m = Game.map; if (!m || !m._docks) return;
    let route = null;
    for (const r of dock.routes) { if (!r.req || Game.lookupFlag(r.req)) { route = r; break; } }
    if (!route) route = dock.routes[dock.routes.length - 1];
    // a barricade on the chosen line? take its blocked stub instead
    if (route.barr) {
      const d = TILEDEFS[tileAt(m, route.barr[0], route.barr[1])] || {};
      if (d.soft && route.blocked) route = route.blocked;
    }
    const pts = route.pts.map(([x, y]) => [x * TILE + 8, y * TILE + 12]);
    Game._cartRide = { pts, i: 1, crash: !!route.crash, out: route.out, msg: route.msg };
    Player.gArc = null; Rails.chain();
    Audio2.jingle('push');
    Game.toast(route.crash ? 'The cart lurches down the line...' : 'All aboard! The cart rattles down the rails!');
  },
  chain() {
    const r = Game._cartRide; if (!r) return;
    const [x1, y1] = r.pts[r.i];
    const x0 = Player.x, y0 = Player.y;
    const d = Math.max(6, dist(x0, y0, x1, y1));
    Player.gArc = { x0, y0, x1, y1, t: 0, dur: d / 105, arcH: 1.5, kind: 'cart' };
  },
  update(dt) {
    const m = Game.map;
    if (!m || !m._docks) { Game._cartRide = null; return; }
    if (Game._dockCool > 0) Game._dockCool -= dt;
    const ride = Game._cartRide;
    if (ride) {
      const comp = Game.companion;
      comp.x = Player.x - 2; comp.y = Player.y + 4; comp.busyT = 0.12; comp.dir = 'right';
      if (!Player.gArc) {
        if (ride.i >= ride.pts.length - 1) {         // line's end
          Game._cartRide = null; Game._dockCool = 0.9;
          if (ride.crash) {
            Player.x = ride.out[0] * TILE + 8; Player.y = ride.out[1] * TILE + 12;
            Player.lastSafe = [Player.x, Player.y];
            Audio2.jingle('denied'); Particles.burst(Player.x, Player.y, 'dust');
            Game.banner(ride.msg || 'CRUNCH! A dead end — Noah tips out of the cart. Set the junctions and try again!');
          } else {
            Player.lastSafe = [Player.x, Player.y];
            Audio2.jingle('door'); Particles.burst(Player.x, Player.y, 'dust');
            if (ride.msg) Game.banner(ride.msg);
          }
        } else { ride.i++; Rails.chain(); }
      }
      return;
    }
    // stepping onto a dock hops in (small cooldown so crash-outs don't instantly re-ride)
    if (!Player.gArc && !(Game._dockCool > 0)) {
      const [fi, fj] = Player.footTile();
      for (const o of m._docks) if (o.x === fi && o.y === fj) { Rails.start(o); return; }
    }
  },
};
if (typeof G !== 'undefined' && G.NQ) G.NQ.Rails = Rails;

// the C key: an unpounded POUND-PLATE within reach always wins (the generic fallback
// order preferred ROLL once Ramsi knew it, so C at the throne-seal rolled him away)
(function () {
  const orig = Game.ramsiCommand;
  Game.ramsiCommand = function () {
    if (this.companionActive && this.companionActive() && this.flags.ramPound && !(this.companion.busyT > 0) && this.map) {
      for (const o of this.map.objects) {
        if (o.type === 'poundplate' && !this.lookupFlag(o.flag) && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 40) {
          this.companion.x = o.x * TILE + 8; this.companion.y = o.y * TILE + 4;   // he hops onto the seal
          return this.startPound();
        }
      }
    }
    return orig.call(this);
  };
})();

// rails tick with the burrow abilities (chained after the Beams wrapper from 16c)
(function () {
  const orig = Game.updateBurrowAbilities;
  Game.updateBurrowAbilities = function (dt) { orig.call(this, dt); Rails.update(dt); };
})();

// Ramsi + the cart render together (cart under Noah while riding)
(function () {
  const orig = Game.drawCompanion;
  Game.drawCompanion = function (c) {
    if (Game._cartRide) {
      const x = Math.round(Player.x), y = Math.round(Player.y);
      c.fillStyle = 'rgba(20,10,40,.35)'; c.beginPath(); c.ellipse(x, y + 3, 10, 3, 0, 0, 7); c.fill();
      c.fillStyle = '#241a33'; c.fillRect(x - 10, y - 9, 20, 11);
      c.fillStyle = '#6a4a26'; c.fillRect(x - 9, y - 8, 18, 9);
      c.fillStyle = '#8c6c38'; c.fillRect(x - 9, y - 8, 18, 3);
      c.fillStyle = '#caa044'; c.fillRect(x - 9, y - 2, 18, 1);
      c.fillStyle = '#241a33'; c.beginPath(); c.arc(x - 5, y + 2, 3, 0, 7); c.arc(x + 5, y + 2, 3, 0, 7); c.fill();
      c.fillStyle = '#5a4628'; c.beginPath(); c.arc(x - 5, y + 2, 1.4, 0, 7); c.arc(x + 5, y + 2, 1.4, 0, 7); c.fill();
      // a stashed lantern glow
      c.fillStyle = 'rgba(255,220,130,.8)'; c.beginPath(); c.arc(x + 8, y - 10, 2, 0, 7); c.fill();
    }
    orig.call(this, c);
  };
})();

// hoard-specific light sources on top of the shared light-mask
(function () {
  const orig = Game.drawLightMask;
  Game.drawLightMask = function (c, map, camX, camY, Z) {
    orig.call(this, c, map, camX, camY, Z);
    if (map.id !== 'burrow8') return;
    // extra punches drawn as soft additive halos (the mask is already down)
    c.save(); c.globalCompositeOperation = 'lighter';
    const halo = (wx, wy, r, col, a) => {
      const sx = (wx - camX) * Z, sy = (wy - camY) * Z;
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, r);
      g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      c.fillStyle = g; c.beginPath(); c.arc(sx, sy, r, 0, 7); c.fill();
    };
    for (const o of map.objects) {
      if (o.type === 'raildock') halo(o.x * TILE + 8, o.y * TILE + 8, 30, '255,214,120', 0.22);
      else if (o.type === 'coindune') halo(o.x * TILE + 8, o.y * TILE + 6, 22, '255,206,100', 0.16);
      else if (o.type === 'railsignal') halo(o.x * TILE + 8, o.y * TILE + 8, 16, Game.lookupFlag(o.req) ? '120,255,150' : '255,110,90', 0.3);
    }
    if (Game._cartRide) halo(Player.x, Player.y - 6, 96, '255,224,150', 0.3);
    c.restore();
  };
})();

// ======================= object drawers =======================
Game.OBJDRAW = Game.OBJDRAW || {};
Game.OBJDRAW.railseg = function (c, o, ox, oy) {
  const cx = ox + 8, cy = oy + 12;
  const ties = '#33241455', rail = '#b8934a', railDk = '#6a4c22';
  // ties (subtle planks under the rails)
  c.fillStyle = '#241a33'; c.globalAlpha = 0.35;
  if (o.c.E || o.c.W) { c.fillRect(ox + 2, cy - 4, 3, 8); c.fillRect(ox + 8, cy - 4, 3, 8); c.fillRect(ox + 13, cy - 4, 3, 8); }
  if (o.c.N || o.c.S) { c.fillRect(cx - 4, oy + 2, 8, 3); c.fillRect(cx - 4, oy + 8, 8, 3); c.fillRect(cx - 4, oy + 13, 8, 3); }
  c.globalAlpha = 1;
  const seg = (x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
  c.lineWidth = 1.6; c.strokeStyle = railDk;
  if (o.c.E) { seg(cx, cy - 3, ox + 16, cy - 3); seg(cx, cy + 3, ox + 16, cy + 3); }
  if (o.c.W) { seg(ox, cy - 3, cx, cy - 3); seg(ox, cy + 3, cx, cy + 3); }
  if (o.c.N) { seg(cx - 3, oy, cx - 3, cy); seg(cx + 3, oy, cx + 3, cy); }
  if (o.c.S) { seg(cx - 3, cy, cx - 3, oy + 16); seg(cx + 3, cy, cx + 3, oy + 16); }
  c.lineWidth = 1; c.strokeStyle = rail;
  if (o.c.E) { seg(cx, cy - 3, ox + 16, cy - 3); seg(cx, cy + 3, ox + 16, cy + 3); }
  if (o.c.W) { seg(ox, cy - 3, cx, cy - 3); seg(ox, cy + 3, cx, cy + 3); }
  if (o.c.N) { seg(cx - 3, oy, cx - 3, cy); seg(cx + 3, oy, cx + 3, cy); }
  if (o.c.S) { seg(cx - 3, cy, cx - 3, oy + 16); seg(cx + 3, cy, cx + 3, oy + 16); }
};
Game.OBJDRAW.raildock = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 12 - e;
  c.fillStyle = '#241a33'; c.fillRect(cx - 12, cy - 8, 24, 14);
  c.fillStyle = '#5a4628'; c.fillRect(cx - 11, cy - 7, 22, 12);
  c.fillStyle = '#8c6c38'; for (let k = -10; k < 10; k += 4) c.fillRect(cx + k, cy - 7, 3, 12);
  if (!Game._cartRide) {   // the parked cart, waiting
    c.fillStyle = '#241a33'; c.fillRect(cx - 8, cy - 10, 16, 9);
    c.fillStyle = '#6a4a26'; c.fillRect(cx - 7, cy - 9, 14, 7);
    c.fillStyle = '#8c6c38'; c.fillRect(cx - 7, cy - 9, 14, 2);
    c.fillStyle = '#241a33'; c.beginPath(); c.arc(cx - 4, cy - 1, 2.4, 0, 7); c.arc(cx + 4, cy - 1, 2.4, 0, 7); c.fill();
  }
  if (dist(Player.x, Player.y, ox + 8, oy + 8) < 30 && !Game._cartRide)
    drawText(c, 'HOP IN!', cx - 13, cy - 22, 7, '#f8e858', '#241a33');
};
Game.OBJDRAW.railsignal = function (c, o, ox, oy, e) {
  const on = Game.lookupFlag(o.req), cx = ox + 8, cy = oy + 8 - e;
  c.fillStyle = '#241a33'; c.fillRect(cx - 1.5, cy - 8, 3, 12);
  c.fillStyle = '#3a2c18'; c.fillRect(cx - 1, cy - 7, 2, 10);
  c.fillStyle = on ? '#58e872' : '#e84a4a';
  c.beginPath(); c.arc(cx, cy - 9, 3 + (on ? Math.sin(Game.time * 5) * 0.6 : 0), 0, 7); c.fill();
  c.strokeStyle = '#241a33'; c.stroke();
};
Game.OBJDRAW.coindune = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 12 - e, r = o.r || 9;
  c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(cx, cy, r + 1.4, r * 0.62 + 1.2, 0, 0, 7); c.fill();
  c.fillStyle = '#b8862c'; c.beginPath(); c.ellipse(cx, cy, r, r * 0.62, 0, 0, 7); c.fill();
  c.fillStyle = '#e8b84a'; c.beginPath(); c.ellipse(cx - r * 0.15, cy - r * 0.18, r * 0.72, r * 0.4, 0, 0, 7); c.fill();
  c.fillStyle = '#f8dc86';
  for (let k = 0; k < 5; k++) { const a = hash2(o.x * 7 + k, o.y * 13); c.fillRect(cx - r * 0.6 + a * r * 1.2, cy - r * 0.4 + hash2(k, o.x) * r * 0.55, 2, 1.4); }
  const tw = (Game.time * 2 + o.x * 0.7) % 3;
  if (tw < 0.6) { const a = hash2(o.x, o.y + ((Game.time / 3) | 0)); c.fillStyle = '#fff'; c.fillRect(cx - r * 0.5 + a * r, cy - r * 0.3, 2, 2); }
};

// ======================= THE TREMOR-GRUB, rebuilt (a tunneling worm) =======================
(function () {
  const upPrev = Bosses.up_warden, drawPrev = Bosses.drawWarden;
  Bosses.up_warden = function (b, dt) {
    if (b.name !== 'grub') return upPrev.call(this, b, dt);
    const p = Player, cfg = b.cfg, comp = Game.companion;
    if (b.inv > 0) b.inv -= dt;
    if (b.shieldT > 0) b.shieldT -= dt;
    if (b.stun > 0) b.stun -= dt;
    if (b.gstate === undefined) { b.gstate = 'buried'; b.gT = 2.2; b.surf = 0; }
    b.gT -= dt;
    if (b.gstate === 'buried') {
      b.surf = 0;
      if (b.shieldT > 0) b.shieldT = 0;                      // can't hold a window on a buried worm
      const d = Math.max(1, dist(b.x, b.y, p.x, p.y));       // the mound stalks Noah
      b.x += (p.x - b.x) / d * 46 * dt; b.y += (p.y - b.y) / d * 34 * dt;
      if ((b.trailT = (b.trailT || 0) - dt) <= 0) { b.trailT = 0.22; Particles.burst(b.x, b.y + 2, 'dust'); }
      if (b.gT <= 0) { b.gstate = 'rise'; b.gT = 0.8; Audio2.jingle('rumble'); }
    } else if (b.gstate === 'rise') {
      b.surf = 0;
      if (b.gT <= 0) {
        b.gstate = 'up'; b.gT = 2.6; b.surf = 1;
        Audio2.jingle('bossintro'); Particles.burst(b.x, b.y, 'dust'); Particles.burst(b.x, b.y - 8, 'sparkle');
        if (Player.inv <= 0 && !(comp.decoyT > 0) && dist(p.x, p.y, b.x, b.y) < 20) Player.hurt(1);
      }
    } else if (b.gstate === 'up') {
      b.surf = 1;
      if (b.shieldT > 0) b.gT = Math.max(b.gT, 0.9);         // stays up while the window holds
      if (b.gT <= 0) { b.gstate = 'buried'; b.gT = 2.2 + Math.random() * 0.8; b.shieldT = 0; Particles.burst(b.x, b.y + 2, 'dust'); }
    }
    b.x = clamp(b.x, b.hx - 5 * TILE, b.hx + 5 * TILE); b.y = clamp(b.y, b.hy - 4 * TILE, b.hy + 4 * TILE);
    if (b.shieldT > 0) {
      if (this.wardenHit(b)) {
        b.hits++; b.inv = 0.7; Audio2.jingle('capture'); Particles.burst(b.x, b.y - 12, 'confetti');
        if (b.hits >= b.armor) { this.catchBoss(b); return; }
        Game.banner('HIT! ' + cfg.title + ' (' + b.hits + '/' + b.armor + ') — keep it up top!');
      }
    } else if (this.wardenHit(b)) {
      if (Game.time - (b.clinkT || 0) > 1) { b.clinkT = Game.time; Game.toast(b.surf ? cfg.title + ' is GUARDED — RAMSI headbutts it first!' : 'It is UNDER the coins — wait for it to ERUPT!'); }
      b.inv = 0.4;
    }
    if (Player.inv <= 0 && b.surf > 0 && b.stun <= 0 && !(comp.decoyT > 0) && dist(p.x, p.y, b.x, b.y) < 14) Player.hurt(1);
  };
  Bosses.drawWarden = function (c, b) {
    if (b.name !== 'grub') return drawPrev.call(this, c, b);
    const ov = Sprites.grub;
    if (b.gstate === 'buried' || b.gstate === 'rise') {
      const sw = b.gstate === 'rise' ? Math.sin(b.t * 26) * 1.5 : 0;
      const h = b.gstate === 'rise' ? 9 : 6;
      c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(sw, -2, 13, h, 0, 0, 7); c.fill();
      c.fillStyle = '#6a4a26'; c.beginPath(); c.ellipse(sw, -3, 11.4, h - 1.4, 0, 0, 7); c.fill();
      c.fillStyle = '#8c6c38'; c.beginPath(); c.ellipse(sw, -4.4, 8, h - 3.4, 0, 0, 7); c.fill();
      c.fillStyle = '#e8b84a'; c.fillRect(sw - 5, -5, 2, 1.6); c.fillRect(sw + 3, -3, 2, 1.6);
      if (b.gstate === 'rise') { c.strokeStyle = 'rgba(255,150,80,' + (0.5 + 0.4 * Math.sin(b.t * 14)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(0, -3, 15, 0, 7); c.stroke(); c.lineWidth = 1; }
    } else {
      c.save();
      if (b.stun > 0) c.rotate(Math.sin(b.t * 12) * 0.1);
      if (ov) { const sc = 1; if (Player.x < b.x) c.scale(-sc, sc); dspr(c, ov, -sprW(ov) / 2, -sprH(ov)); }
      else {
        const wob = Math.sin(b.t * 6) * 2;
        // a fat segmented worm rearing out of the coins
        c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(0, 0, 12, 5, 0, 0, 7); c.fill();
        c.fillStyle = '#b8862c'; c.beginPath(); c.ellipse(0, -1, 10.4, 4, 0, 0, 7); c.fill();
        const seg = (yy, r, col) => { c.fillStyle = '#241a33'; c.beginPath(); c.arc(wob * (1 - yy / 30), yy, r + 1.2, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(wob * (1 - yy / 30), yy, r, 0, 7); c.fill(); };
        seg(-6, 8, '#e88aa8'); seg(-14, 9, '#f0a0bc'); seg(-22, 10, '#f8b8ce');
        c.fillStyle = '#241a33'; c.beginPath(); c.arc(wob * 0.3 - 4, -24, 1.8, 0, 7); c.arc(wob * 0.3 + 4, -24, 1.8, 0, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(wob * 0.3 - 4, -24.6, 0.7, 0, 7); c.arc(wob * 0.3 + 4, -24.6, 0.7, 0, 7); c.fill();
        c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(wob * 0.3, -19, 3, 1.8, 0, 0, 7); c.fill();
        const open = b.shieldT > 0;
        if (open) { c.fillStyle = '#ffd95a'; c.beginPath(); c.arc(wob * 0.6, -12, 3, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,217,90,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(wob * 0.6, -12, 6 + Math.sin(b.t * 10), 0, 7); c.stroke(); c.lineWidth = 1; }
      }
      c.restore();
      const top = -36;
      for (let k = 0; k < b.armor; k++) { c.fillStyle = k < (b.armor - b.hits) ? '#e84a4a' : '#3a2c50'; c.beginPath(); c.arc(-(b.armor - 1) * 6 + k * 12, top, 4, 0, 7); c.fill(); c.strokeStyle = '#241a33'; c.stroke(); }
    }
  };
})();

// ============================ THE MAP ============================
function buildBurrow8() {
  if (MAPS.burrow8) return;
  const m = newMap('burrow8', 72, 40, 'soil', { name: 'The Hoard Descent', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  m.lightMask = true; m.darkness = 0.82;
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  m.start = { x: 4, y: 20 };
  const vein = (p) => { for (const [x, y] of p) T(m, x, y, 'glowvein'); };
  const dune = (p) => { for (const [x, y, r] of p) OBJ(m, { type: 'coindune', x, y, r, deco: true }); };

  // ---------------- WEST: Gnash's dune-sea of stolen gold (the herds) ----------------
  NPC(m, 5, 22, 'cora', 'Hoard-Watch');
  SIGN(m, 3, 23, "GNASH'S HOARD — dunes of stolen gold under a pitch-black roof. ALIENS & COMET-PUPS love COOKIES; the UNICORN bolts unless you BONE-stun it. The DIG-WORKS descend EAST — ride the old mine-rails down!");
  SPAWN(m, 'alien', 5, 5, 14, 8, 3); SPAWN(m, 'condor', 18, 6, 9, 6, 2);
  SPAWN(m, 'cometpup', 4, 26, 12, 8, 3); SPAWN(m, 'unicorn', 17, 28, 9, 7, 2);
  dune([[8, 8, 10], [14, 12, 8], [22, 10, 11], [7, 17, 7], [12, 24, 9], [20, 22, 8], [9, 31, 8], [16, 33, 10], [24, 17, 7], [27, 25, 9], [6, 12, 6], [25, 30, 7]]);
  vein([[10, 15], [19, 18], [6, 23], [23, 13], [13, 29], [8, 27], [16, 9], [26, 33]]);
  CHEST(m, 26, 4, { coins: 18 }); CHEST(m, 3, 36, { gems: 6 });

  // secret spur: a crumbly wall hides a private treasure-line
  R(m, 23, 33, 1, 6, 'rootwall'); T(m, 23, 35, 'softblock');
  R(m, 24, 32, 7, 1, 'rootwall');
  SIGN(m, 21, 33, 'A crumbly, coin-crusted wall... RAMSI could ROLL-CHARGE it (C).');
  dune([[29, 34, 7]]);
  SIGN(m, 25, 37, "A dusty spur-line — Gnash's PRIVATE stash lies across the dark.");

  // ---------------- sealed DIG-WORKS (x31-70) ----------------
  // big fills first, carve after
  R(m, 31, 1, 1, 13, 'rootwall');                       // west seal above the house
  R(m, 32, 1, 10, 13, 'rootwall');                      // slab over the dock-house
  R(m, 42, 1, 29, 3, 'rootwall');                       // north strip
  R(m, 42, 4, 13, 1, 'rootwall');                       // band-A roof (x42-54)
  R(m, 55, 4, 16, 1, 'rootwall');                       // ledge roof (x55-70)
  R(m, 41, 5, 1, 8, 'rootwall');                        // band-A west wall
  R(m, 55, 5, 1, 8, 'rootwall'); T(m, 55, 6, 'soil');   // band-A east wall + rail gap
  R(m, 42, 13, 14, 2, 'rift');                          // band-A under-rift (x42-55, y13-14)
  R(m, 42, 15, 14, 11, 'rift');                         // THE GREAT VOID (x42-55, y15-25)
  R(m, 56, 12, 15, 2, 'rift');                          // the coin-fall (ledge/den split — no jumping it)
  R(m, 55, 13, 1, 12, 'rootwall');                      // den west wall (x55, y13-24)
  R(m, 56, 24, 15, 1, 'rootwall');                      // den south wall
  R(m, 31, 27, 11, 12, 'rift');                         // south void (under the house)
  R(m, 42, 26, 29, 13, 'rift');                         // south void (east half)
  R(m, 33, 32, 4, 3, 'soil');                           // the secret treasure pocket

  // ---- the DOCK-HOUSE (x32-40, y15-25): shrink latch, first dock, bone junction ----
  R(m, 31, 14, 11, 1, 'rootwall'); R(m, 31, 26, 11, 1, 'rootwall');
  R(m, 31, 15, 1, 11, 'rootwall'); R(m, 41, 15, 1, 11, 'rootwall'); T(m, 41, 20, 'soil');
  T(m, 31, 18, 'holegap'); DOOR(m, 31, 20, 'flag', 'b8_g1', 'The dock-house door, latched from inside.');
  OBJ(m, { type: 'ramhole', x: 30, y: 18, flag: 'b8_g1', compOnly: true, msg: 'RAMSI shrinks through and kicks the dock-house latch loose!' });
  SIGN(m, 28, 22, 'The old DIG-WORKS! The door is latched — SHRINK RAMSI (C) through the burrow-hole.');
  R(m, 36, 17, 5, 2, 'chasm');                          // the switch-ledge gap
  OBJ(m, { type: 'boneswitch', x: 38, y: 16, flag: 'b8_j1', msg: 'CLACK! The BOOMER-BONE throws the junction — the line runs NORTH to the works!' });
  SIGN(m, 36, 21, 'The junction lever hangs on a far ledge. Stand below, face UP, and fling your BOOMER-BONE (Z)!');
  SIGN(m, 33, 22, 'HOP IN the cart to ride the line. Red signal = a dead-end stub. Set the junction first!');
  vein([[33, 16], [39, 24]]);

  // ---- BAND A (x42-54, y5-12): block-junction + barricade + the second dock ----
  OBJ(m, { type: 'block', x: 45, y: 9, id: 'b8_blk1' }); T(m, 47, 9, 'switch');
  m.puzzle = [{ sw: [47, 9], flag: 'sw_b8j2', to: 'bridge', tiles: [], wireTo: [50, 8], color: '248,208,72', jingle: 'door', msg: 'CLUNK! The high junction swings — the line runs EAST to the coin-fall ledge!' }];
  SIGN(m, 43, 10, 'Junction two is BLOCK-driven: shove the BLOCK (BRACERS) onto the switch.');
  T(m, 54, 8, 'softblock');
  SIGN(m, 52, 10, 'A coin-slide buries the east line — ROLL-CHARGE (C) the pile off the rails!');
  vein([[43, 6], [52, 11], [47, 5]]);
  CHEST(m, 42, 5, { coins: 12 });

  // ---- the LEDGE (x56-70, y5-11) + the coin-fall post into the den ----
  POST(m, 60, 14); POST(m, 60, 11);                     // paired posts: down AND back up
  SIGN(m, 58, 9, 'End of the line. Below roars the COIN-FALL — hook the POST with your HARPOON (Z) and reel down!');
  dune([[63, 8, 8], [59, 7, 6], [68, 10, 7]]);
  vein([[66, 10], [57, 6]]);
  CHEST(m, 68, 6, { coins: 25 });

  // ---- the DEN (x56-70, y14-23): the TREMOR-GRUB, LUCKY, and the throne-seal ----
  for (const [hx, hy] of [[58, 16], [66, 20], [60, 22], [64, 16]]) T(m, hx, hy, 'holegap');
  SIGN(m, 57, 21, 'THE TREMOR-GRUB swims beneath the gold! Watch the moving MOUND — when it ERUPTS, RAMSI headbutts, then BONE it (Z)!');
  OBJ(m, { type: 'boss', x: 62, y: 20, boss: 'grub' });
  OBJ(m, { type: 'pillowkin', x: 68, y: 15, kin: 4, caged: true, warden: 'grub', color: '#e0a0d0', name: 'LUCKY',
    gives: ['ramPound'], freed: 'You free LUCKY, the last Pillow-Kin! RAMSI learns the GROUND-POUND (press C). Now SMASH the cracked throne-seal and drop into the Hoard Cavern... GNASH awaits.' });
  OBJ(m, { type: 'poundplate', x: 66, y: 21, flag: 'b8_seal', msg: 'WHAM! The throne-floor seal shatters — the way down into the HOARD CAVERN gapes open!' });
  SIGN(m, 63, 22, 'The floor here is one great CRACKED SEAL... nothing less than a GROUND-POUND (C) will break it.');
  OBJ(m, { type: 'portal', x: 66, y: 22, to: 'vault1', tx: 3, ty: 7, req: 'b8_seal', secret: true });
  dune([[60, 18, 9], [65, 18, 7], [58, 22, 6]]);
  vein([[59, 18], [67, 19], [63, 15]]);

  // ---- the treasure pocket (secret spur destination) ----
  CHEST(m, 35, 33, { gems: 12 });
  dune([[36, 32, 6], [34, 34, 5]]);

  // ================= RAIL ROUTES =================
  const docks = [];
  const dock = (x, y, routes) => { const o = { type: 'raildock', x, y, routes, to: null }; OBJ(m, o); docks.push(o); return o; };
  // D1: dock-house -> band A (bone junction b8_j1), else a dead stub over the void
  const D1 = dock(34, 20, [
    { req: 'b8_j1', pts: [[34, 20], [40, 20], [44, 20], [44, 8]], msg: 'The cart climbs the old grade — up into the HIGH WORKS!' },
    { pts: [[34, 20], [40, 20], [44, 20], [48, 20], [48, 23]], crash: true, out: [35, 21], msg: 'SCREEECH — a dead-end buffer over the void! Noah scrambles back. Throw the junction (BONE) first!' },
  ]);
  D1.to = [44, 8];
  OBJ(m, { type: 'railsignal', x: 44, y: 19, req: 'b8_j1', deco: true });
  // D2: band A -> the coin-fall ledge (block junction sw_b8j2 + the barricade at 54,8)
  const D2 = dock(50, 8, [
    { req: 'sw_b8j2', pts: [[50, 8], [54, 8], [54, 6], [58, 6]], barr: [54, 8],
      blocked: { pts: [[50, 8], [52, 8]], crash: true, out: [52, 9], msg: 'CRUNCH! The coin-slide blocks the line — ROLL it clear (C) and ride again!' },
      msg: 'The cart bursts through to the COIN-FALL LEDGE — end of the high line!' },
    { pts: [[50, 8], [50, 12]], crash: true, out: [51, 9], msg: 'SCREEECH — the junction dumps the cart at a stub! Shove the BLOCK onto the switch first!' },
  ]);
  D2.to = [58, 6];
  OBJ(m, { type: 'railsignal', x: 51, y: 7, req: 'sw_b8j2', deco: true });
  // D4/D5: the secret spur, out and back
  const D4 = dock(26, 36, [{ pts: [[26, 36], [30, 36], [30, 33], [34, 33]], msg: "Gnash's PRIVATE stash!" }]);
  D4.to = [34, 33];
  const D5 = dock(33, 32, [{ pts: [[33, 32], [30, 32], [30, 36], [27, 36]] }]);
  D5.to = [27, 36];
  m._docks = docks;

  // lay railseg objects along every authored line (draw-only)
  const segsAt = {};
  const lay = (pts) => {
    for (let s = 0; s + 1 < pts.length; s++) {
      let [x0, y0] = pts[s]; const [x1, y1] = pts[s + 1];
      const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
      let x = x0, y = y0;
      while (true) {
        const k = x + ',' + y;
        const o = segsAt[k] || (segsAt[k] = { type: 'railseg', x, y, c: {} });
        if (x !== x1 || y !== y1) { o.c[dx > 0 ? 'E' : dx < 0 ? 'W' : dy > 0 ? 'S' : 'N'] = 1; }
        if (x !== x0 || y !== y0) { o.c[dx > 0 ? 'W' : dx < 0 ? 'E' : dy > 0 ? 'N' : 'S'] = 1; }
        if (x === x1 && y === y1) break;
        x += dx; y += dy;
      }
    }
  };
  for (const d of docks) for (const r of d.routes) { lay(r.pts); if (r.blocked) lay(r.blocked.pts); }
  for (const k in segsAt) m.objects.unshift(segsAt[k]);   // unshift: rails draw beneath same-row props
}
if (typeof G !== 'undefined' && G.NQ) { G.NQ.buildBurrow8 = buildBurrow8; }
