"use strict";
// ===================== THE SKY-SPIRE ASCENT (a bespoke vertical wing-flyer) =====================
// A narrow, VERY tall wind-shaft you climb by FLAPPING (X) with your WINGS. Tap X to beat your
// wings upward, HOLD X to glide (slow your fall), arrows to drift left/right. Cloud ledges jut
// from the walls so you weave up in a zig-zag; PERCH clouds are checkpoints. Two dangers spark
// your wings OUT — a ZAP-BAT that patrols the lanes, and ARC-GATES that crackle across the shaft
// on a timer. Get zapped and your wings fizzle (you can't flap) and you PLUMMET until you recover
// or land. At the very top waits the SKY-FEATHER — the rarest crafting material in the game.
// Reached from a SKY SPIRE in the Vale (needs the WINGS). It is its own game-state ('ascent'),
// so it reuses nothing fragile; the wing/flap feel is tuned to be forgiving for a young flyer.
(function () {
  if (typeof Game === 'undefined') return;

  const AW = 15;                     // shaft width in tiles (narrow: centered in the 480 view)
  const AH = 116;                    // VERY tall
  const GRAV = 560, FLAP = -205, RISE_CAP = -235, FALL_CAP = 470, GLIDE_FALL = 66;
  const OX = ((VW - AW * TILE) / 2) | 0;   // horizontal offset to center the shaft (sky on both sides)

  // ---- build the shaft (deterministic so it's consistent + testable) ----
  function buildShaft() {
    const solid = []; for (let j = 0; j < AH; j++) solid.push(new Array(AW).fill(false));
    const perch = new Set(), cloud = new Set();     // 'cloud' ledges draw fluffy; 'perch' = checkpoint
    const set = (i, j, kind) => { if (i < 0 || j < 0 || i >= AW || j >= AH) return; solid[j][i] = true; if (kind === 'perch') perch.add(i + ',' + j); else if (kind === 'cloud') cloud.add(i + ',' + j); };
    // side walls (rock) full height
    for (let j = 0; j < AH; j++) { set(0, j, 'wall'); set(AW - 1, j, 'wall'); }
    // bottom start floor
    for (let i = 1; i < AW - 1; i++) { set(i, AH - 2, 'cloud'); set(i, AH - 1, 'wall'); }
    const start = { x: (AW / 2) * TILE, y: (AH - 2) * TILE - 2 };
    const checkpoints = [{ x: start.x, y: start.y }];
    // alternating cloud ledges climbing upward — now SMALL & sparse so you fall farther and
    // more often; only the (bigger) PERCH clouds every 3rd rung are reliable checkpoints.
    let side = 0, n = 0;
    for (let r = AH - 9; r > 10; r -= 8) {
      const isPerch = (n % 3 === 2), w = isPerch ? 4 : 3;             // regular ledges are TINY (3), perches a touch wider (4)
      const off = 1 + ((n * 3) % (AW - 2 - w));                       // wander the ledge across the shaft so gaps shift around
      const x0 = side === 0 ? 1 : AW - 1 - w;
      for (let i = x0; i < x0 + w; i++) set(i, r, isPerch ? 'perch' : 'cloud');
      if (isPerch) { const cx = x0 + ((w / 2) | 0); checkpoints.push({ x: cx * TILE + 8, y: (r - 1) * TILE + 6 }); }
      side ^= 1; n++;
    }
    // top chamber: side resting clouds + a SIDE perch checkpoint. The SKY-FEATHER floats in the
    // OPEN CENTRE column, so you grab it just by flapping up the last stretch — nothing above the
    // final ledges blocks the middle, so you can't get 'stuck below it' like before.
    for (let i = 1; i <= 4; i++) set(i, 9, 'cloud');                     // left landing
    for (let i = AW - 5; i <= AW - 2; i++) set(i, 9, 'cloud');           // right landing
    for (let i = 1; i <= 3; i++) set(i, 5, 'perch');                     // a summit perch OFF TO THE SIDE (checkpoint)
    const feather = { x: (AW / 2) * TILE + 8, y: 4 * TILE + 8 };         // dead centre, open air
    checkpoints.push({ x: 2 * TILE + 8, y: 4 * TILE });
    // ---- hazards ----
    const bats = [];
    for (let r = AH - 16; r > 14; r -= 15) bats.push({ x0: 2 * TILE, x1: (AW - 3) * TILE, y: r * TILE + 8, t: Math.random() * 6, spd: 46 + (r % 3) * 8, dir: (r % 2) ? 1 : -1 });
    const gates = [];
    for (let r = AH - 22; r > 16; r -= 19) gates.push({ y: r * TILE + 8, t: (r * 0.7) % 3, period: 2.3, onFrac: 0.42 });
    // STORMCROWS: big birds that CRUISE a band and DIVE at Noah when he drifts under them — the real menace
    const stormcrows = [];
    for (let r = AH - 26; r > 12; r -= 17) stormcrows.push({ homeY: r * TILE + 8, x: (AW / 2) * TILE, y: r * TILE + 8, t: Math.random() * 6, dir: (r % 2) ? 1 : -1, state: 'cruise', diveT: 0, cool: 1 + Math.random() * 2 });
    return { solid, perch, cloud, start, checkpoints, feather, bats, gates, stormcrows };
  }

  // ---- collision: is the player box (feet at x,y) overlapping a solid tile? ----
  function blocked(A, x, y) {
    const pts = [[x - 4, y - 13], [x + 4, y - 13], [x - 4, y - 1], [x + 4, y - 1], [x, y - 13], [x, y - 1], [x - 4, y - 7], [x + 4, y - 7]];
    for (const [px, py] of pts) { const i = (px / TILE) | 0, j = (py / TILE) | 0; if (A.solid[j] && A.solid[j][i]) return true; }
    return false;
  }

  // ---- start / exit ----
  Game.startAscent = function () {
    const A = this.ascent = buildShaft();
    A.p = { x: A.start.x, y: A.start.y, vx: 0, vy: 0, onG: true, face: 1, anim: 0, inv: 0, stun: 0, wingsOff: false, flapT: 0, spin: 0 };
    A.cp = 0; A.camY = 0; A.t = 0; A.shake = 0; A.won = 0; A.hearts = Player.hearts;
    this._ascentReturn = { map: this.mapId, x: (Player.x / TILE) | 0, y: (Player.y / TILE) | 0 };
    this.state = 'ascent';
    Audio2.jingle('dive'); if (Audio2.playSong) Audio2.playSong('sky');
    this.banner('THE SKY-SPIRE! Tap X to FLAP up, hold X to GLIDE. Dodge the ZAPS — they spark your wings out!');
  };
  Game.exitAscent = function (won) {
    const r = this._ascentReturn || { map: 'vale', x: 30, y: 22 };
    this.ascent = null; this.state = 'play';
    this.loadMap(r.map, r.x, r.y);
    if (!won) this.toast('You flutter back down from the spire.');
    saveGame();
  };

  // ---- per-frame update ----
  Game.updateAscent = function (dt, presses) {
    const A = this.ascent; if (!A) { this.state = 'play'; return; }
    A.t += dt; if (A.shake > 0) A.shake -= dt;
    const p = A.p; p.anim += dt;
    if (A.won > 0) { A.won -= dt; if (A.won <= 0) { this.exitAscent(true); this.itemGet('item:skyfeather', 'THE SKY-FEATHER!', 'The rarest treasure in the sky! Craft the FLOATING AVIARY with it at COMBI\'s DECOR CATALOG.'); } return; }
    for (const k of presses) if (k === 'Escape') { this.exitAscent(false); return; }

    const holdX = keyHeld('x') || keyHeld(' ');
    const goL = keyHeld('ArrowLeft') || keyHeld('a'), goR = keyHeld('ArrowRight') || keyHeld('d');
    if (p.inv > 0) p.inv -= dt;
    if (p.stun > 0) { p.stun -= dt; p.wingsOff = true; p.spin += dt * 16; } else { p.wingsOff = false; p.spin = 0; }

    // horizontal drift
    const ax = (goR ? 1 : 0) - (goL ? 1 : 0);
    p.vx += ax * 820 * dt; p.vx *= 0.86; if (Math.abs(p.vx) > 132) p.vx = 132 * Math.sign(p.vx);
    if (ax) p.face = ax > 0 ? 1 : -1;

    // FLAP (edge press) + GLIDE (hold) — disabled while zapped
    if (!p.wingsOff) for (const k of presses) if (k === 'x' || k === ' ') {
      p.vy = Math.min(p.vy, 0) + FLAP; if (p.vy < RISE_CAP) p.vy = RISE_CAP;
      p.flapT = 0.18; p.onG = false; Audio2.jingle('flap'); Particles.burst(p.x, p.y - 6, 'sparkle');
    }
    if (p.flapT > 0) p.flapT -= dt;
    // gravity
    p.vy += (p.wingsOff ? GRAV * 1.25 : GRAV) * dt;
    if (!p.wingsOff && holdX && p.vy > 0) p.vy = Math.min(p.vy, GLIDE_FALL);   // glide
    if (p.vy > FALL_CAP) p.vy = FALL_CAP;

    // integrate + collide (axis-separated)
    let nx = p.x + p.vx * dt;
    if (!blocked(A, nx, p.y)) p.x = nx; else p.vx = 0;
    let ny = p.y + p.vy * dt;
    if (!blocked(A, p.x, ny)) { p.y = ny; p.onG = false; }
    else {
      if (p.vy > 0) {   // landed on top of a ledge
        p.onG = true;
        const fi = (p.x / TILE) | 0, fj = (p.y / TILE) | 0;
        if (A.perch.has(fi + ',' + fj)) {   // a PERCH: update checkpoint
          for (let ci = 0; ci < A.checkpoints.length; ci++) if (Math.abs(A.checkpoints[ci].y - p.y) < 20) { if (A.cp < ci) { A.cp = ci; Audio2.jingle('gem'); this.toast('CHECKPOINT! Safe cloud.'); } break; }
        }
      }
      p.vy = 0;
    }

    // ---- hazards: contact sparks the wings out ----
    if (p.inv <= 0 && p.stun <= 0) {
      for (const b of A.bats) {
        const bx = (b.x0 + b.x1) / 2 + Math.sin(A.t * 1.6 + b.t) * (b.x1 - b.x0) / 2;
        if (Math.abs(p.x - bx) < 12 && Math.abs(p.y - 7 - b.y) < 12) { this.ascentZap(A, 'a ZAP-BAT'); break; }
      }
      if (p.stun <= 0) for (const g of A.gates) {
        const ph = ((A.t + g.t) % g.period) / g.period;   // arc ON during the first onFrac of the cycle
        if (ph < g.onFrac && Math.abs(p.y - 7 - g.y) < 9) { this.ascentZap(A, 'a SHOCK-GATE'); break; }
      }
    }
    // ---- STORMCROWS: cruise their band, then DIVE at Noah. STOMP them from ABOVE to KO them;
    //      any other touch sparks Noah's wings out. (Landing on top is the counter-play.) ----
    for (const cd of A.stormcrows) {
      if (cd.dead) { cd.deadT -= dt; cd.y += 190 * dt; cd.x += cd.dir * 30 * dt; cd.spin = (cd.spin || 0) + dt * 18; continue; }
      cd.cool -= dt;
      if (cd.state === 'cruise') {
        cd.x += cd.dir * 40 * dt;
        if (cd.x < 2 * TILE) { cd.x = 2 * TILE; cd.dir = 1; } else if (cd.x > (AW - 2) * TILE) { cd.x = (AW - 2) * TILE; cd.dir = -1; }
        cd.y += (cd.homeY - cd.y) * Math.min(1, dt * 3);
        if (cd.cool <= 0 && Math.abs(p.x - cd.x) < 34 && p.y > cd.y && p.y - cd.y < 9 * TILE) { cd.state = 'dive'; cd.tx = p.x; cd.ty = p.y; Audio2.jingle('step'); }
      } else {   // DIVE toward where Noah was, then climb back home
        const tx = cd.tx, ty = cd.ty + 20, dx = tx - cd.x, dy = ty - cd.y, d = Math.max(6, Math.hypot(dx, dy));
        cd.x += dx / d * 210 * dt; cd.y += dy / d * 210 * dt; cd.dir = dx >= 0 ? 1 : -1;
        if (d < 12 || cd.y > cd.homeY + 9 * TILE) { cd.state = 'cruise'; cd.cool = 1.6 + Math.random() * 1.8; }
      }
      if (Math.abs(p.x - cd.x) < 16 && Math.abs(p.y - 8 - cd.y) < 15) {
        if (p.vy > 20 && (p.y - 10) <= cd.y) {           // Noah is FALLING onto its back -> STOMP KO + bounce
          cd.dead = true; cd.deadT = 1.4; cd.dir = (p.x < cd.x) ? 1 : -1;
          p.vy = FLAP * 1.15; p.inv = Math.max(p.inv, 0.4);
          Audio2.jingle('bosswin'); Particles.burst(cd.x, cd.y - 6, 'confetti'); Particles.burst(cd.x, cd.y - 6, 'sparkle');
          this.toast('STOMP! You bonked the STORMCROW — it tumbles away!');
        } else if (p.inv <= 0 && p.stun <= 0) this.ascentZap(A, 'a STORMCROW');
      }
    }

    // ---- fall out the bottom -> back to the last checkpoint (gentle; never a hard game-over) ----
    if (p.y > (AH - 1) * TILE + 20) this.ascentFall(A);

    // ---- reach the SKY-FEATHER ----
    if (!this.flags.matsFound['ascent_feather'] && Math.abs(p.x - A.feather.x) < 20 && Math.abs(p.y - A.feather.y) < 22) {
      this.flags.matsFound['ascent_feather'] = true;
      this.flags.mats.skyfeather = (this.flags.mats.skyfeather || 0) + 1;
      this.flags['gotmat_skyfeather'] = true;
      A.won = 2.2; Audio2.jingle('bosswin'); if (Audio2.playSong) Audio2.playSong('title');
      Particles.burst(A.feather.x, A.feather.y, 'confetti'); Particles.burst(A.feather.x, A.feather.y - 8, 'sparkle');
      this.banner('THE SKY-FEATHER IS YOURS! The whole world lies below...');
      saveGame();
      return;
    }
    // camera follows Noah upward
    A.camY = clamp(p.y - VH * 0.58, 0, AH * TILE - VH);
  };
  Game.ascentZap = function (A, what) {
    const p = A.p; p.stun = 1.25; p.inv = 1.9; p.wingsOff = true;
    p.vy = 90; p.vx = -p.face * 60; A.shake = 0.3;
    Audio2.jingle('denied'); Particles.burst(p.x, p.y - 8, 'dust');
    this.toast('ZAP! ' + what + ' sparked your wings out — FALL to a cloud and shake it off!');
  };
  Game.ascentFall = function (A) {
    const cp = A.checkpoints[A.cp] || A.start, p = A.p;
    p.x = cp.x; p.y = cp.y; p.vx = 0; p.vy = 0; p.stun = 0; p.wingsOff = false; p.inv = 1.2;
    if (Player.hearts > 1) { Player.hearts -= 1; Audio2.jingle('hurt'); this.toast('Whoops — back to the last cloud!'); }
    else { Player.hearts = Math.min(Player.maxHearts, 3); this.toast('The wind catches you — back to the last cloud!'); }
    A.shake = 0.2;
  };

  // ---- draw ----
  Game.drawAscent = function (c) {
    const A = this.ascent; if (!A) return;
    const p = A.p, sh = A.shake > 0 ? (Math.random() * 3 - 1.5) : 0;
    // bright windy sky
    const g = c.createLinearGradient(0, 0, 0, SH);
    g.addColorStop(0, '#bfe6ff'); g.addColorStop(0.5, '#9fd0f4'); g.addColorStop(1, '#7fb4e4');
    c.fillStyle = g; c.fillRect(0, 0, SW, SH);
    // parallax clouds behind the shaft
    c.save(); c.globalAlpha = 0.5;
    for (let k = 0; k < 8; k++) {
      const cy = ((k * 90 - A.camY * 0.4) % (SH + 120) + SH + 120) % (SH + 120) - 60;
      const cx = (k * 137 % SW), r = 16 + (k % 3) * 8;
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.arc(cx + r, cy + 3, r * 0.8, 0, 7); c.arc(cx - r, cy + 3, r * 0.7, 0, 7); c.fill();
    }
    c.restore();
    c.save(); c.translate(OX + sh, -A.camY + sh);
    // visible tile band
    const j0 = Math.max(0, (A.camY / TILE | 0) - 1), j1 = Math.min(AH - 1, ((A.camY + SH) / TILE | 0) + 1);
    for (let j = j0; j <= j1; j++) for (let i = 0; i < AW; i++) {
      if (!A.solid[j][i]) continue;
      const x = i * TILE, y = j * TILE, key = i + ',' + j;
      if (A.perch.has(key)) {           // PERCH cloud — glowing, checkpointy
        c.fillStyle = '#e8f4ff'; c.beginPath(); c.ellipse(x + 8, y + 9, 11, 8, 0, 0, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + 8, y + 6, 9, 6, 0, 0, 7); c.fill();
        c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,160,' + (0.10 + 0.06 * Math.sin(A.t * 3 + i)).toFixed(2) + ')';
        c.beginPath(); c.arc(x + 8, y + 6, 13, 0, 7); c.fill(); c.restore();
      } else if (A.cloud.has(key)) {    // fluffy cloud ledge
        c.fillStyle = '#f0f4fc'; c.beginPath(); c.ellipse(x + 8, y + 9, 10, 7, 0, 0, 7); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(x + 8, y + 6, 8.5, 5.5, 0, 0, 7); c.fill();
        c.fillStyle = '#d4def0'; c.fillRect(x + 1, y + 11, 14, 2);
      } else {                          // rock wall
        c.fillStyle = '#8a7ca0'; c.fillRect(x, y, TILE, TILE);
        c.fillStyle = '#6a5c86'; c.fillRect(x, y + 12, TILE, 4);
        c.fillStyle = '#a89cc0'; c.fillRect(x + 2, y + 2, 4, 3);
      }
    }
    // ARC-GATES: two coils on the walls; crackle across when ON
    for (const gt of A.gates) {
      const y = gt.y - 7, ph = ((A.t + gt.t) % gt.period) / gt.period, on = ph < gt.onFrac;
      for (const wx of [1 * TILE, (AW - 2) * TILE]) { c.fillStyle = '#c8a04c'; c.fillRect(wx + 2, y - 3, 12, 6); c.fillStyle = '#f8d048'; c.fillRect(wx + 4, y - 1, 8, 2); }
      if (on) {
        c.strokeStyle = ((A.t * 20 | 0) % 2) ? '#fff' : '#9adcf8'; c.lineWidth = 2 + Math.sin(A.t * 30) * 1;
        c.beginPath(); let lx = 1 * TILE + 12; c.moveTo(lx, y);
        for (let s = 1; s <= 8; s++) { const xx = lx + s * (((AW - 3) * TILE) / 8); c.lineTo(xx, y + (Math.random() * 8 - 4)); }
        c.stroke(); c.lineWidth = 1;
      } else { c.strokeStyle = 'rgba(154,220,248,.35)'; c.setLineDash([3, 5]); c.beginPath(); c.moveTo(1 * TILE + 12, y); c.lineTo((AW - 2) * TILE, y); c.stroke(); c.setLineDash([]); }
    }
    // ZAP-BATS
    for (const b of A.bats) {
      const bx = (b.x0 + b.x1) / 2 + Math.sin(A.t * 1.6 + b.t) * (b.x1 - b.x0) / 2, by = b.y - 7;
      const fl = Math.sin(A.t * 18 + b.t) > 0 ? 4 : 1.5;
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(150,220,255,.22)'; c.beginPath(); c.arc(bx, by, 11, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#3a3550'; c.beginPath(); c.moveTo(bx - 8, by - fl); c.lineTo(bx - 2, by); c.lineTo(bx - 8, by + fl); c.fill();
      c.beginPath(); c.moveTo(bx + 8, by - fl); c.lineTo(bx + 2, by); c.lineTo(bx + 8, by + fl); c.fill();
      c.fillStyle = '#241a33'; c.beginPath(); c.arc(bx, by, 4, 0, 7); c.fill();
      c.fillStyle = ((A.t * 12 | 0) % 2) ? '#f8e858' : '#fff'; c.fillRect(bx - 2, by - 1, 1.5, 1.5); c.fillRect(bx + 1, by - 1, 1.5, 1.5);
      if (((A.t * 10 | 0) % 3) === 0) { c.strokeStyle = '#f8e858'; c.beginPath(); c.moveTo(bx, by + 3); c.lineTo(bx + 2, by + 7); c.lineTo(bx - 1, by + 9); c.stroke(); }
    }
    // STORMCROWS — a big dark bird with broad flapping wings (uses the real stormcrow sprite when handy)
    for (const cd of A.stormcrows) {
      if (cd.dead && cd.deadT <= 0) continue;                     // fully gone
      const diving = cd.state === 'dive';
      c.save(); c.translate(Math.round(cd.x), Math.round(cd.y - 4));
      if (cd.dead) { c.rotate(cd.spin || 0); c.globalAlpha = Math.max(0, Math.min(1, cd.deadT)); }
      if (cd.dir < 0) c.scale(-1, 1);
      c.fillStyle = 'rgba(20,10,40,.18)'; c.beginPath(); c.ellipse(0, 8, 9, 3, 0, 0, 7); c.fill();
      const spr = Sprites.creatures && Sprites.creatures.stormcrow;
      if (spr && spr.right && spr.right[0]) {
        const s = 1.6, f = spr.right[(A.t * (diving ? 12 : 6) | 0) % 2] || spr.right[0];
        c.scale(s, s); dspr(c, f, -sprW(f) / 2, -sprH(f) / 2);
      } else {   // fallback: broad dark wings + body
        const wf = Math.sin(A.t * (diving ? 16 : 7) + cd.t) * 6;
        c.fillStyle = '#3a3550';
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-10, -6 - wf, -18, 2 - wf * 0.4); c.quadraticCurveTo(-9, 3, 0, 3); c.fill();
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -6 - wf, 18, 2 - wf * 0.4); c.quadraticCurveTo(9, 3, 0, 3); c.fill();
        c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(0, 1, 4, 5, 0, 0, 7); c.fill();
        c.fillStyle = '#e87838'; c.beginPath(); c.moveTo(3, -2); c.lineTo(8, -1); c.lineTo(3, 1); c.fill();   // beak
        c.fillStyle = '#f8e858'; c.fillRect(2, -3, 1.4, 1.4);
      }
      c.restore();
      if (diving && !cd.dead) { c.strokeStyle = 'rgba(248,120,60,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cd.x, cd.y); c.lineTo(cd.tx, cd.ty); c.stroke(); }   // dive telegraph
    }
    // the SKY-FEATHER
    if (!this.flags.matsFound['ascent_feather']) {
      const fx = A.feather.x, fy = A.feather.y + Math.sin(A.t * 2) * 3;
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,150,' + (0.25 + 0.12 * Math.sin(A.t * 3)).toFixed(2) + ')'; c.beginPath(); c.arc(fx, fy, 16 + Math.sin(A.t * 3) * 3, 0, 7); c.fill(); c.restore();
      const spr = Sprites.items.skyfeather; if (spr) { const s = 2.2; c.save(); c.translate(fx, fy); c.scale(s, s); dspr(c, spr, -sprW(spr) / 2, -sprH(spr) / 2); c.restore(); }
    }
    // NOAH with beating wings (spins when zapped)
    {
      const set = Sprites.noah, frames = p.face > 0 ? set.right : set.left, spr = frames[p.onG ? 0 : 1] || frames[0];
      c.save(); c.translate(Math.round(p.x), Math.round(p.y));
      if (p.wingsOff) c.rotate(p.spin);
      if (!(p.inv > 0 && (p.inv * 12 | 0) % 2)) {
        c.fillStyle = 'rgba(20,10,40,.25)'; c.beginPath(); c.ellipse(0, 0, 6, 2, 0, 0, 7); c.fill();
        if (!p.wingsOff) {   // wings beat; splay wide when gliding
          const gliding = (keyHeld('x') || keyHeld(' ')) && p.vy > 0;
          c.fillStyle = '#fff'; const fw = gliding ? 7 : 3 + Math.abs(Math.sin(A.t * 22)) * 5, ww = gliding ? 10 : 6;
          c.beginPath(); c.ellipse(-7, -12, ww, fw, -0.5, 0, 7); c.ellipse(7, -12, ww, fw, 0.5, 0, 7); c.fill();
        } else { drawText(c, '@..@', -9, -30, 8, '#f8e858', '#241a33'); }
        dspr(c, spr, -sprW(spr) / 2, -sprH(spr));
      }
      c.restore();
    }
    c.restore();
    // ---- HUD ----
    const climbed = Math.max(0, Math.round((1 - (p.y / ((AH - 2) * TILE))) * 100));
    c.fillStyle = 'rgba(20,12,30,.5)'; c.fillRect(0, 0, SW, 14);
    for (let h = 0; h < Player.maxHearts; h += 2) { const full = Player.hearts - h; dspr(c, full >= 2 ? Sprites.items.heart : (full >= 1 ? Sprites.items.heart : Sprites.items.heartC ? Sprites.items.heart : Sprites.items.heart), 4 + (h / 2) * 10, 2); }
    // a simple height meter on the right
    const mh = SH - 40, mx = SW - 12;
    c.fillStyle = 'rgba(20,12,30,.4)'; c.fillRect(mx - 2, 20, 6, mh);
    c.fillStyle = '#f8e858'; const fillY = 20 + mh * (1 - climbed / 100); c.fillRect(mx - 2, fillY, 6, mh - (fillY - 20));
    drawText(c, climbed + 'm', mx - 18, 8, 8, '#241a33', '#fff');
    // pinned kid hint
    const stormcrowNear = A.stormcrows.some(cd => !cd.dead && Math.abs(cd.x - p.x) < 60 && cd.y > p.y - 30 && cd.y < p.y + 90);
    const hint = p.wingsOff ? 'ZAPPED! FALL TO A CLOUD!' : (climbed > 92 ? 'GRAB THE FEATHER!' : (stormcrowNear ? 'DROP ON THE STORMCROW TO BONK IT!' : 'TAP X: FLAP   HOLD X: GLIDE'));
    drawText(c, hint, SW / 2, SH - 14, 9, p.wingsOff ? '#f8e858' : '#fff', '#241a33', 'center');
    drawText(c, 'ESC: fly back down', 6, SH - 12, 7, '#241a33', '#cfe4f8');
    if (A.won > 0) { c.fillStyle = 'rgba(255,255,255,' + (0.3 * Math.min(1, A.won)).toFixed(2) + ')'; c.fillRect(0, 0, SW, SH); }
  };

  // ---- the entrance: a SKY SPIRE in the Vale (needs the WINGS) ----
  Game.addAscent = function () {
    const v = MAPS.vale; if (!v || v._spire) return; v._spire = true;
    OBJ(v, { type: 'skyspire', x: 52, y: 6 });
    SIGN(v, 50, 7, 'THE SKY-SPIRE pierces the clouds. With WINGS you could FLAP all the way up... a SKY-FEATHER glints at the very top!');
  };
  {
    const _int = Game.interact;
    Game.interact = function () {
      if (this.state === 'play' && this.map) {
        for (const o of this.map.objects) {
          if (o.type === 'skyspire' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 26) {
            if (!this.flags.wings) { Audio2.jingle('denied'); this.toast('You need ANGEL WINGS to fly the spire! (Trade a DRAGON for them.)'); return; }
            this.startAscent(); return;
          }
        }
      }
      return _int.call(this);
    };
  }
  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.skyspire = function (c, o, ox, oy) {
    const t = Game.time;
    // a tall tapering stone spire rising into a little cloud, a feather glinting atop
    c.fillStyle = '#8a7ca0';
    c.beginPath(); c.moveTo(ox - 10, oy + 14); c.lineTo(ox - 4, oy - 40); c.lineTo(ox + 4, oy - 40); c.lineTo(ox + 12, oy + 14); c.fill();
    c.fillStyle = '#6a5c86'; c.beginPath(); c.moveTo(ox + 2, oy - 40); c.lineTo(ox + 4, oy - 40); c.lineTo(ox + 12, oy + 14); c.lineTo(ox + 6, oy + 14); c.fill();
    c.fillStyle = '#a89cc0'; for (let k = 0; k < 5; k++) c.fillRect(ox - 7 + (k % 2) * 3, oy - 30 + k * 9, 3, 3);
    // cloud puff near the top
    c.fillStyle = '#ffffff'; for (const [bx, by, r] of [[-8, -34, 7], [0, -38, 9], [9, -34, 7], [2, -30, 6]]) { c.beginPath(); c.arc(ox + bx, oy + by, r, 0, 7); c.fill(); }
    // glinting feather
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,150,' + (0.3 + 0.15 * Math.sin(t * 3)).toFixed(2) + ')'; c.beginPath(); c.arc(ox, oy - 46, 6, 0, 7); c.fill(); c.restore();
    const spr = Sprites.items && Sprites.items.skyfeather; if (spr) { c.save(); c.translate(ox, oy - 46 + Math.sin(t * 2) * 2); c.scale(1.2, 1.2); dspr(c, spr, -sprW(spr) / 2, -sprH(spr) / 2); c.restore(); }
    if (dist(Player.x, Player.y, ox, oy) < 34) drawText(c, Game.flags.wings ? 'SPACE: FLY UP!' : 'need WINGS', ox - 22, oy - 56, 7, '#f8e858', '#241a33');
  };
})();
