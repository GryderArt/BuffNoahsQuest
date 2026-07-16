"use strict";
// ===================== THE FLOATING AVIARY (a side-scroll sky sanctuary) =====================
// Crafted with the Ascent's SKY-FEATHER at Combi's DECOR CATALOG. A bright CLOUD then opens in
// the Workshop's MYTHIC pen; step into it to soar a wide, peaceful sky-island where ALL your
// WINGED friends (pegasus, griffin, condor, dragon, blazagon, comet-pup...) drift and wheel.
// Noah FREE-FLIES with his wings (arrows in any direction) — no falling, no danger. PET the
// friends (SPACE) and swoop through the glowing RINGS for a sparkle. A relaxed reward for the
// whole flying-creature collection, in the side-scroller format.
(function () {
  if (typeof Game === 'undefined') return;

  const AVW = 170 * TILE, AVH = 34 * TILE;                 // a WIDE, tall-ish open sky
  const FLYERS = ['pegasus', 'griffin', 'condor', 'dragon', 'blazagon', 'cometpup'];

  // ---- the bright entrance cloud in the Workshop mythic pen ----
  Game.spawnAviaryCloud = function () {
    const m = MAPS.workshop; if (!m || !this.flags.aviary) return;
    if (m.objects.some(o => o.type === 'aviarycloud')) return;
    OBJ(m, { type: 'aviarycloud', x: 25, y: 6 });
    SIGN(m, 23, 6, 'A bright AVIARY CLOUD! Step in (SPACE) to FLY the sky-island with your winged friends.');
  };
  { // keep the cloud present whenever the workshop is (re)loaded after the aviary is built
    const _pz = Game.populateZoo;
    Game.populateZoo = function (m) { _pz.call(this, m); if (m && m.id === 'workshop' && this.flags.aviary && this.spawnAviaryCloud) this.spawnAviaryCloud(); };
  }

  // ---- enter / exit ----
  Game.startAviary = function () {
    const A = this.aviary = { t: 0, camX: 0, camY: 0, creatures: [], rings: [], clouds: [], ringsHit: 0, bonus: false };
    A.p = { x: 3 * TILE, y: AVH / 2, vx: 0, vy: 0, face: 1, anim: 0 };
    // decorative cloud islands
    for (let k = 0; k < 26; k++) A.clouds.push({ x: 100 + hash2(k, 3) * (AVW - 200), y: 20 + hash2(k, 7) * (AVH - 40), r: 14 + (k % 4) * 8, sp: 0.3 + hash2(k, 5) * 0.5 });
    // YOUR winged friends drift here — up to 3 of each you own; a couple ambient if you own none
    const owned = FLYERS.filter(f => (this.flags['life_' + f] || 0) > 0 || (this.log[f] || 0) > 0);
    const roster = owned.length ? owned : ['pegasus', 'griffin'];
    let i = 0;
    for (const f of roster) {
      const n = Math.min(3, Math.max(1, owned.length ? (this.flags['life_' + f] || this.log[f] || 1) : 1));
      for (let q = 0; q < n; q++) {
        i++;
        A.creatures.push({ species: f, x: 200 + (i * 233) % (AVW - 400), y: 40 + (i * 97) % (AVH - 80),
          bx: 0, by: 0, t: hash2(i, 2) * 6, spd: 22 + (i % 3) * 10, dir: (i % 2) ? 1 : -1, petT: 0, phase: hash2(i, 9) * 6.28 });
      }
    }
    // glowing RINGS to swoop through, spread along the island
    const RN = 9;
    for (let k = 0; k < RN; k++) A.rings.push({ x: 300 + k * ((AVW - 500) / (RN - 1)), y: 60 + Math.sin(k * 1.3) * (AVH * 0.32) + AVH * 0.4, r: 22, hit: false, t: hash2(k, 4) * 6 });
    A.exit = { x: AVW - 3 * TILE, y: AVH / 2 };
    this._aviaryReturn = { map: this.mapId, x: (Player.x / TILE) | 0, y: (Player.y / TILE) | 0 };
    this.state = 'aviary';
    Audio2.jingle('dive'); if (Audio2.playSong) Audio2.playSong('title');
    this.banner('THE FLOATING AVIARY! Fly ANYWHERE with the arrows. PET friends (SPACE), swoop the RINGS. ESC to leave.');
  };
  Game.exitAviary = function () {
    const r = this._aviaryReturn || { map: 'workshop', x: 25, y: 8 };
    this.aviary = null; this.state = 'play';
    this.loadMap(r.map, r.x, r.y); saveGame();
  };

  // ---- per-frame update (free 8-directional flight; peaceful, no gravity/danger) ----
  Game.updateAviary = function (dt, presses) {
    const A = this.aviary; if (!A) { this.state = 'play'; return; }
    A.t += dt; const p = A.p; p.anim += dt;
    for (const k of presses) {
      if (k === 'Escape') { this.exitAviary(); return; }
      if (k === ' ' || k === 'z') this.aviaryPet(A);
    }
    const gx = (keyHeld('ArrowRight') || keyHeld('d') ? 1 : 0) - (keyHeld('ArrowLeft') || keyHeld('a') ? 1 : 0);
    const gy = (keyHeld('ArrowDown') || keyHeld('s') ? 1 : 0) - (keyHeld('ArrowUp') || keyHeld('w') ? 1 : 0);
    p.vx += gx * 640 * dt; p.vy += gy * 640 * dt;
    p.vx *= 0.90; p.vy *= 0.90;
    const MX = 165; if (Math.abs(p.vx) > MX) p.vx = MX * Math.sign(p.vx); if (Math.abs(p.vy) > MX) p.vy = MX * Math.sign(p.vy);
    if (gx) p.face = gx > 0 ? 1 : -1;
    p.x = clamp(p.x + p.vx * dt, TILE, AVW - TILE); p.y = clamp(p.y + p.vy * dt, TILE, AVH - TILE);
    // the winged friends wheel on lazy loops
    for (const cr of A.creatures) {
      cr.t += dt;
      const tx = cr.x + Math.cos(cr.t * 0.5 + cr.phase) * cr.spd * dt * 30;
      cr.vx = Math.cos(cr.t * 0.5 + cr.phase) * cr.spd; cr.vy = Math.sin(cr.t * 0.8 + cr.phase) * cr.spd * 0.5;
      cr.x = clamp(cr.x + cr.vx * dt, 40, AVW - 40); cr.y = clamp(cr.y + cr.vy * dt, 30, AVH - 30);
      if (Math.abs(cr.vx) > 1) cr.dir = cr.vx > 0 ? 1 : -1;
      if (cr.petT > 0) cr.petT -= dt;
    }
    // swoop through a RING
    for (const rg of A.rings) {
      if (rg.hit) continue;
      if (Math.abs(p.x - rg.x) < rg.r * 0.6 && Math.abs(p.y - rg.y) < rg.r) {
        rg.hit = true; A.ringsHit++; Audio2.jingle('gem'); Particles.burst(rg.x, rg.y, 'sparkle');
        this.toast('WHOOSH! ring ' + A.ringsHit + ' / ' + A.rings.length);
        if (A.ringsHit >= A.rings.length && !A.bonus) { A.bonus = true; this.flags.coins += 20; Audio2.jingle('fanfare'); this.banner('EVERY RING! +20 coins from the sky-spirits!'); saveGame(); }
      }
    }
    // fly into the far EXIT cloud (or ESC) to leave
    if (Math.abs(p.x - A.exit.x) < 20 && Math.abs(p.y - A.exit.y) < 24) { this.exitAviary(); return; }
    // camera follows (horizontal side-scroll bias, some vertical)
    A.camX = clamp(p.x - SW * 0.42, 0, AVW - SW);
    A.camY = clamp(p.y - SH * 0.5, 0, AVH - SH);
  };
  Game.aviaryPet = function (A) {
    let best = null, bd = 34;
    for (const cr of A.creatures) { const d = dist(A.p.x, A.p.y, cr.x, cr.y); if (d < bd) { bd = d; best = cr; } }
    if (!best) return;
    best.petT = 1.0; Audio2.jingle('gem');
    Particles.burst(best.x, best.y - 8, 'heart'); Particles.burst(best.x, best.y - 12, 'sparkle');
    this.toast((CREATURES[best.species] ? CREATURES[best.species].name : 'Your friend') + ' loops with joy!');
  };

  // ---- draw ----
  Game.drawAviary = function (c) {
    const A = this.aviary; if (!A) return; const p = A.p, t = A.t;
    // dreamy sky gradient
    const g = c.createLinearGradient(0, 0, 0, SH);
    g.addColorStop(0, '#8fd0f8'); g.addColorStop(0.55, '#bfe4fb'); g.addColorStop(1, '#e8f4ff');
    c.fillStyle = g; c.fillRect(0, 0, SW, SH);
    // far parallax clouds
    c.save(); c.globalAlpha = 0.5;
    for (let k = 0; k < 10; k++) { const cx = ((k * 150 - A.camX * 0.25) % (SW + 200) + SW + 200) % (SW + 200) - 100, cy = 20 + (k * 53 % (SH - 60)); c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 18, 0, 7); c.arc(cx + 16, cy + 4, 14, 0, 7); c.arc(cx - 16, cy + 4, 12, 0, 7); c.fill(); }
    c.restore();
    // ---- crafted RAINBOW ARCH: a GIANT translucent rainbow arcing across the whole sky ----
    if (this.flags.decor_rainbowarch) {
      const band = ['#9a5ce0', '#4864e0', '#4aa0f0', '#5cc457', '#f8e048', '#f89a30', '#f24a4a']; // violet(inner) -> red(outer)
      const cx = SW * 0.5 - A.camX * 0.10;   // barely parallaxes, so it reads as sky-far and enormous
      const cy = SH + SH * 0.66;             // centre well BELOW the screen: only the great crown shows
      const R0 = SH * 1.5;                   // radius bigger than the whole screen -> a real sky rainbow
      c.save(); c.lineCap = 'round';
      for (let k = 0; k < 7; k++) { c.globalAlpha = 0.30; c.lineWidth = 15; c.strokeStyle = band[k]; c.beginPath(); c.arc(cx, cy, R0 + k * 15, Math.PI, 0); c.stroke(); }
      c.globalAlpha = 0.12; c.lineWidth = 10; c.strokeStyle = '#fff'; c.beginPath(); c.arc(cx, cy, R0 - 9, Math.PI, 0); c.stroke();  // soft inner sheen
      c.restore();
    }
    c.save(); c.translate(-A.camX, -A.camY);
    // cloud islands (soft, near)
    for (const cl of A.clouds) {
      const dx = Math.sin(t * cl.sp + cl.x) * 4;
      c.fillStyle = 'rgba(255,255,255,.9)';
      c.beginPath(); c.arc(cl.x + dx, cl.y, cl.r, 0, 7); c.arc(cl.x + dx + cl.r, cl.y + 3, cl.r * 0.8, 0, 7); c.arc(cl.x + dx - cl.r, cl.y + 3, cl.r * 0.7, 0, 7); c.arc(cl.x + dx, cl.y + 5, cl.r * 0.9, 0, 7); c.fill();
      c.fillStyle = 'rgba(200,225,245,.7)'; c.beginPath(); c.ellipse(cl.x + dx, cl.y + cl.r * 0.7, cl.r * 1.1, cl.r * 0.35, 0, 0, 7); c.fill();
    }
    // rings (glowing hoops to swoop through)
    for (const rg of A.rings) {
      const pulse = 0.6 + 0.4 * Math.sin(t * 3 + rg.t);
      if (rg.hit) { c.strokeStyle = 'rgba(150,220,160,.35)'; c.lineWidth = 3; c.beginPath(); c.ellipse(rg.x, rg.y, rg.r * 0.6, rg.r, 0, 0, 7); c.stroke(); continue; }
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(248,236,120,' + (0.5 * pulse).toFixed(2) + ')'; c.lineWidth = 7; c.beginPath(); c.ellipse(rg.x, rg.y, rg.r * 0.6, rg.r, 0, 0, 7); c.stroke(); c.restore();
      c.strokeStyle = ((t * 6 | 0) % 2) ? '#fff' : '#f8e858'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(rg.x, rg.y, rg.r * 0.6, rg.r, 0, 0, 7); c.stroke(); c.lineWidth = 1;
    }
    // YOUR winged friends
    for (const cr of A.creatures) {
      const set = Sprites.creatures[cr.species]; if (!set || !set.right) continue;
      const spr = (cr.dir > 0 ? set.right : set.left)[(cr.anim * 6 | 0) % 2] || (cr.dir > 0 ? set.right : set.left)[0];
      const bob = Math.sin(cr.t * 2 + cr.phase) * 3, s = 1.7 * ((typeof CREATURE_SCALE !== 'undefined' && CREATURE_SCALE[cr.species]) || 1);
      c.save(); c.translate(Math.round(cr.x), Math.round(cr.y + bob)); c.scale(s, s);
      c.fillStyle = 'rgba(20,10,40,.12)'; c.beginPath(); c.ellipse(0, 6, sprW(spr) / 2.4, 2, 0, 0, 7); c.fill();
      dspr(c, spr, -sprW(spr) / 2, -sprH(spr) / 2);
      c.restore();
      if (cr.petT > 0) { const hs = Sprites.items.heart; if (hs) { c.save(); c.globalAlpha = Math.min(1, cr.petT * 1.5); c.translate(cr.x, cr.y - 20 - (1 - cr.petT) * 10); c.scale(1.2, 1.2); dspr(c, hs, -sprW(hs) / 2, -sprH(hs) / 2); c.restore(); } }
    }
    // ---- crafted AVIARY decor (from the dungeon rare materials) ----
    if (this.flags.decor_suncrystal) {
      const sx = AVW * 0.45, sy = AVH * 0.4;
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,140,' + (0.22 + 0.12 * Math.sin(t * 2)).toFixed(2) + ')'; c.beginPath(); c.arc(sx, sy, 46 + Math.sin(t * 2) * 6, 0, 7); c.fill(); c.restore();
      c.save(); c.translate(sx, sy); c.rotate(t * 0.3);
      c.fillStyle = '#f8d048'; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; c.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); const a2 = a + Math.PI / 8; c.lineTo(Math.cos(a2) * 13, Math.sin(a2) * 13); } c.fill();
      c.fillStyle = '#fff8d0'; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill(); c.restore();
    }
    // (the RAINBOW ARCH now draws as a giant sky rainbow in the background — see above)
    // the EXIT cloud (a big soft doorway-cloud)
    { const e = A.exit; c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(180,235,255,' + (0.2 + 0.1 * Math.sin(t * 2)).toFixed(2) + ')'; c.beginPath(); c.arc(e.x, e.y, 26, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#fff'; for (const [bx, by, r] of [[-14, 0, 12], [0, -6, 15], [14, 0, 12], [0, 8, 13]]) { c.beginPath(); c.arc(e.x + bx, e.y + by, r, 0, 7); c.fill(); }
      drawText(c, 'HOME', e.x, e.y - 4, 8, '#4878a8', '#fff', 'center'); }
    // NOAH, ever-soaring on his wings
    { const set = Sprites.noah, frames = p.face > 0 ? set.right : set.left, spr = frames[1] || frames[0];
      c.save(); c.translate(Math.round(p.x), Math.round(p.y));
      c.fillStyle = 'rgba(20,10,40,.16)'; c.beginPath(); c.ellipse(0, 8, 6, 2, 0, 0, 7); c.fill();
      c.fillStyle = '#fff'; const fw = 3 + Math.abs(Math.sin(t * 16)) * 5;
      c.beginPath(); c.ellipse(-7, -6, 9, fw, -0.5, 0, 7); c.ellipse(7, -6, 9, fw, 0.5, 0, 7); c.fill();
      dspr(c, spr, -sprW(spr) / 2, -sprH(spr));
      c.restore(); }
    c.restore();
    // HUD
    c.fillStyle = 'rgba(20,12,30,.4)'; c.fillRect(0, 0, SW, 14);
    drawText(c, 'RINGS ' + A.ringsHit + ' / ' + A.rings.length, 6, 3, 9, '#f8e858', '#241a33');
    drawText(c, 'ARROWS: fly    SPACE: pet a friend', SW / 2, SH - 14, 9, '#fff', '#4878a8', 'center');
    drawText(c, 'ESC / HOME cloud: leave', SW - 6, SH - 12, 7, '#4878a8', '#eaf6ff', 'right');
  };

  // ---- the bright cloud object in the mythic pen ----
  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.aviarycloud = function (c, o, ox, oy) {
    const t = Game.time, cx = ox + 8, cy = oy + 6 + Math.sin(t * 1.5) * 2;
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(180,235,255,' + (0.22 + 0.10 * Math.sin(t * 2.4)).toFixed(2) + ')'; c.beginPath(); c.arc(cx, cy, 20, 0, 7); c.fill(); c.restore();
    c.fillStyle = '#ffffff'; for (const [bx, by, r] of [[-11, 2, 9], [0, -4, 12], [11, 2, 9], [0, 6, 10]]) { c.beginPath(); c.arc(cx + bx, cy + by, r, 0, 7); c.fill(); }
    c.fillStyle = '#eaf6ff'; for (const [bx, by, r] of [[-6, -3, 4], [4, -6, 5], [8, -1, 3]]) { c.beginPath(); c.arc(cx + bx, cy + by, r, 0, 7); c.fill(); }
    // little feather sparkle rising
    for (let k = 0; k < 3; k++) { const sy = cy - 8 - ((t * 10 + k * 8) % 22); c.fillStyle = 'rgba(248,236,140,' + (0.6 - ((t * 10 + k * 8) % 22) / 40).toFixed(2) + ')'; c.fillRect(cx - 5 + Math.sin(t + k) * 6, sy, 1.5, 1.5); }
    if (dist(Player.x, Player.y, cx, oy + 8) < 28) drawText(c, 'SPACE: FLY!', cx, oy - 12, 7, '#4878a8', '#fff', 'center');
  };
  { // step into the cloud to enter
    const _int = Game.interact;
    Game.interact = function () {
      if (this.state === 'play' && this.map) {
        for (const o of this.map.objects) {
          if (o.type === 'aviarycloud' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 26) { this.startAviary(); return; }
        }
      }
      return _int.call(this);
    };
  }
})();
