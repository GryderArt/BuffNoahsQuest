"use strict";
// ============== THE TRUE FINALE — GRIMSPIRE KEEP & THE STORM COLOSSUS ==============
// A dungeon within the last level: Noah stands on a rooftop battlement of a gothic
// castle while the STORM COLOSSUS — as tall as the keep itself — strides around the
// castle in the distance. SUPER RAMSI trades his rolling-pillow tricks for a GIANT
// LASER (press C): knock off its glowing armor plates and arms, then the helmet,
// then the head — and the whole towering thing comes crashing down. The Colossus
// answers with lightning bolts and whirling tornados. The laser holds 3 charges;
// munch GRASS LUMPS or drink MILK CARTONS scattered on the roof to recharge.
// When it falls, the thunderheads break and the sky turns clear and sunny.
// (Placeholder procedural art; painted sheets land via SHEET_PROMPTS.md sheet 12.)

const COLOSSUS_PIECES = [
  { id: 'plateL',  name: 'SHOULDER PLATE', kind: 'armor', anchor: 'shL',  r: 10 },
  { id: 'plateR',  name: 'SHOULDER PLATE', kind: 'armor', anchor: 'shR',  r: 10 },
  { id: 'chest',   name: 'CHEST PLATE',    kind: 'armor', anchor: 'chest', r: 11 },
  { id: 'belly',   name: 'BELLY PLATE',    kind: 'armor', anchor: 'belly', r: 11 },
  { id: 'armL',    name: 'ARM',            kind: 'arm',   anchor: 'armL', r: 10 },
  { id: 'armR',    name: 'ARM',            kind: 'arm',   anchor: 'armR', r: 10 },
];
// socket anchors measured from the green glow rings of each painted stride frame
// (design px -> world px at K=1.75; body box is 48x64 drawn feet-down at the origin)
const COL_ANCH = {
  a: { neck: [1.1, -87.7], shL: [-25.9, -63.9], shR: [30.8, -63.9], chest: [1.2, -49.4], belly: [2.1, -23.8],
       armL: [-33.9, -47.9], armR: [38.8, -47.9], helmet: [1.1, -103.7], head: [1.1, -97.7] },
  b: { neck: [-1.2, -96.3], shL: [-32.6, -71.1], shR: [29.8, -71.2], chest: [-0.7, -55.3], belly: [-0.4, -27.0],
       armL: [-40.6, -55.1], armR: [37.8, -55.2], helmet: [-1.2, -112.3], head: [-1.2, -106.3] },
};
function colFrame(cc) { return Math.sin(cc.t * 2.6) > 0 ? 'a' : 'b'; }
function colAnchor(cc, name) { const A = COL_ANCH[colFrame(cc)]; return A[name] || [0, 0]; }

// ---------------- the map ----------------
function buildCastle1() {
  if (MAPS.castle1) return;
  const m = newMap('castle1', 44, 16, 'rift', { name: 'Grimspire Keep', song: 'boss', cliff: 'stone', zone: 'sky', noFly: true });
  R(m, 0, 10, m.w, 5, 'cogfloor');                       // the battlement platform
  R(m, 0, 9, m.w, 1, 'gearwall');                        // the parapet (sky beyond)
  R(m, 0, 15, m.w, 1, 'gearwall');
  R(m, 0, 9, 1, 7, 'gearwall'); R(m, m.w - 1, 9, 1, 7, 'gearwall');
  m.start = { x: 4, y: 12 };
  m.topPad = 0;
  SIGN(m, 3, 13, 'GRIMSPIRE KEEP. The STORM COLOSSUS strides the walls! SUPER RAMSI\'s LASER (C) can blast its GLOWING pieces — line up under a glow and FIRE. Grass and milk refill his zap!');
  // snacks: grass lumps + milk cartons (respawning)
  for (const [x, y, kind] of [[9, 13, 'grasslump'], [15, 11, 'milkcarton'], [21, 13, 'grasslump'], [27, 11, 'milkcarton'], [33, 13, 'grasslump'], [39, 11, 'milkcarton']])
    OBJ(m, { type: kind, x, y });
  OBJ(m, { type: 'portal', x: 22, y: 13, to: 'vale', tx: 13, ty: 40, secret: true, req: 'colossus', ptKeep: true });   // victory exit: stays hidden even in playtest
  OBJ(m, { type: 'colossusbg', x: 0, y: 8, deco: true });   // row 8: paints OVER the sky rows, UNDER the parapet
  OBJ(m, { type: 'stormfx2', x: 1, y: m.h - 1, deco: true });
  m.colossus = {
    t: 0, wx: 350, dir: 1, state: 'fight',              // fight -> falling -> down
    pieces: COLOSSUS_PIECES.map(p => Object.assign({}, p, { off: false })),
    helmet: false, head: false,
    boltT: 2.6, bolts: [], tornadoT: 5.5, tornados: [], falling: [], shakeT: 0, clearT: 0,
  };
}
if (typeof G !== 'undefined' && G.NQ) { G.NQ.buildCastle1 = buildCastle1; }
buildCastle1();

// ---------------- geometry helpers ----------------
const COL_PARALLAX = 0.45;
function colScreenX(m) { return (m.colossus.wx - (Game.camX || 0) * COL_PARALLAX); }
function colFeetY() { return 150; }
function colPieceScreen(m, p) {
  const c = m.colossus, a = colAnchor(c, p.anchor);
  return [colScreenX(m) + a[0] * c.dir, colFeetY() + a[1]];
}
function colVulnerable(m) {
  const c = m.colossus;
  const per = c.pieces.filter(p => !p.off);
  if (per.length) return per;
  if (!c.helmet) return [{ id: 'helmet', name: 'HELMET', anchor: 'helmet', r: 12, helmet: true }];
  if (!c.head) return [{ id: 'head', name: 'HEAD', anchor: 'head', r: 12, head: true }];
  return [];
}

// ---------------- the update (chained on the shared ability tick) ----------------
const Colossus = {
  update(dt) {
    const m = Game.map; if (!m || !m.colossus) return;
    const c = m.colossus; c.t += dt;
    if (!Game._laser) Game._laser = { n: 3, max: 3 };
    if (Game._laserCharge && (Game._laserCharge.t -= dt) <= 0) { Game._laserCharge = null; this.blast(); }
    if (Game._laserFx && (Game._laserFx.t -= dt) <= 0) Game._laserFx = null;
    // snack pickups (walk over; respawn after a rest)
    for (const o of m.objects) {
      if (o.type !== 'grasslump' && o.type !== 'milkcarton') continue;
      if (o._coolT > 0) { o._coolT -= dt; continue; }
      if (dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 14) {
        if (Game._laser.n >= Game._laser.max) { Game.toast('RAMSI is FULL of zap! (3/3)'); o._coolT = 1.2; continue; }
        Game._laser.n++; o._coolT = 12;
        Audio2.jingle(o.type === 'milkcarton' ? 'dive' : 'cage');
        Particles.burst(o.x * TILE + 8, o.y * TILE + 4, 'sparkle');
        Game.toast(o.type === 'milkcarton' ? 'GLUG GLUG! Laser +1 (' + Game._laser.n + '/3)' : 'MUNCH! Laser +1 (' + Game._laser.n + '/3)');
      }
    }
    // falling knocked-off pieces
    for (const f of c.falling) { f.vy += 260 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
    c.falling = c.falling.filter(f => f.y < 400);
    if (c.shakeT > 0) c.shakeT -= dt;
    if (c.state === 'falling') {
      c.fallT = (c.fallT || 0) + dt;
      c.shakeT = 0.2;
      if (c.fallT > 2.4 && c.state !== 'down') {
        c.state = 'down'; c.clearT = 0.01;
        Game.flags.colossus = true; saveGame();
        Audio2.jingle('bosswin'); Audio2.playSong('title');
        Game.banner('THE STORM COLOSSUS CRASHES DOWN — and the clouds TEAR OPEN! Sunlight pours over Grimspire. YOU DID IT, NOAH!');
        for (let k = 0; k < 8; k++) Particles.burst(Player.x - 40 + k * 12, Player.y - 20, 'confetti');
      }
      return;
    }
    if (c.state === 'down') {
      c.clearT = Math.min(1, (c.clearT || 0) + dt * 0.25);
      if (!c._ending && c.clearT >= 1) {
        c._ending = true;
        if (Game.startCutscene && Game.COLOSSUS_ENDING) Game.startCutscene(Game.COLOSSUS_ENDING, function () { Game.state = 'credits'; Game.creditsT = 0; saveGame(); });
      }
      return;
    }
    // ---- the stride: paces around the keep, turning at the wings ----
    if (!Game._laserCharge && !Game._laserFx) c.wx += c.dir * 26 * dt;   // it hesitates as his light gathers
    if (c.wx > 560) { c.wx = 560; c.dir = -1; } if (c.wx < 140) { c.wx = 140; c.dir = 1; }
    // ---- LIGHTNING: telegraphed strike at Noah's feet ----
    c.boltT -= dt;
    c.bolts = c.bolts.filter(b2 => (b2.t -= dt) > -0.3);
    for (const b2 of c.bolts) {
      if (!b2.fired && b2.t <= 0) {
        b2.fired = true; Audio2.jingle('rumble');
        Particles.burst(b2.x, b2.y, 'dust');
        if (Player.inv <= 0 && dist(Player.x, Player.y, b2.x, b2.y) < 17) Player.hurt(1);
      }
    }
    if (c.boltT <= 0) { c.boltT = 3.1; c.bolts.push({ x: Player.x, y: Player.y, t: 1.15, fired: false }); }
    // ---- TORNADOS: whirl across the battlement ----
    c.tornadoT -= dt;
    if (c.tornadoT <= 0) {
      c.tornadoT = 7.5;
      const fromLeft = Math.random() < 0.5;
      c.tornados.push({ x: fromLeft ? 20 : m.w * TILE - 20, y: (11 + (Math.random() * 3 | 0)) * TILE + 8, vx: fromLeft ? 52 : -52, t: 0 });
      Game.toast('A TORNADO sweeps the roof — hop aside!');
    }
    for (const tn of c.tornados) {
      tn.t += dt; tn.x += tn.vx * dt;
      if (dist(Player.x, Player.y, tn.x, tn.y) < 16) {
        Player.x += tn.vx * 1.4 * dt;
        if (Player.inv <= 0) { Player.hurt(1); Particles.burst(Player.x, Player.y - 8, 'dust'); }
      }
    }
    c.tornados = c.tornados.filter(tn => tn.x > -30 && tn.x < m.w * TILE + 30);
  },
  fire() {                                              // SUPER RAMSI'S LASER (the C key here)
    const m = Game.map, c = m.colossus, comp = Game.companion;
    if (c.state !== 'fight' || Game._laserCharge || Game._laserFx) return;
    if (!Game._laser) Game._laser = { n: 3, max: 3 };
    if (Game._laser.n <= 0) { Audio2.jingle('denied'); Game.toast('No zap left! EAT GRASS or DRINK MILK!'); return; }
    Game._laser.n--;
    comp.busyT = 0.75;
    Game._laserCharge = { t: 0.34, x: comp.x };          // he gathers light first...
    Audio2.jingle('key'); Particles.burst(comp.x, comp.y - 10, 'sparkle');
  },
  blast() {                                             // ...then the beam
    const m = Game.map, c = m.colossus, comp = Game.companion;
    Game._laserFx = { t: 0.4, x: comp.x };
    Audio2.jingle('bossintro');
    const sx = comp.x - (Game.camX || 0);
    let hit = null, hd = 17;                               // nearest aligned piece wins
    for (const p of colVulnerable(m)) { const [px] = colPieceScreen(m, p); const d = Math.abs(px - sx); if (d < hd) { hd = d; hit = p; } }
    if (!hit) { Game.toast('The laser scorches the sky — line up UNDER a glow!'); return; }
    // KNOCKED OFF!
    const [px, py] = colPieceScreen(m, hit);
    c.falling.push({ kind: hit.id, x: px, y: py, vx: (Math.random() - 0.5) * 60 + c.dir * 20, vy: -80, rot: 0, vr: 4 });
    c.shakeT = 0.35; Audio2.jingle('cage'); Particles.burst(comp.x, comp.y - 20, 'confetti');
    if (hit.helmet) { c.helmet = true; Game.banner('THE HELMET FLIES OFF! Its head glows — ONE MORE BLAST!'); }
    else if (hit.head) { c.state = 'falling'; c.tornados = []; c.bolts = []; Game.banner('DIRECT HIT! The STORM COLOSSUS teeters...!'); Audio2.jingle('rumble'); }
    else {
      const p2 = c.pieces.find(q => q.id === hit.id); if (p2) p2.off = true;
      const left = c.pieces.filter(q => !q.off).length;
      Game.banner(left ? 'The ' + hit.name + ' is BLASTED OFF! (' + (6 - left) + '/6)' : 'ALL PIECES OFF! Now the HELMET!');
    }
  },
};
if (typeof G !== 'undefined' && G.NQ) { G.NQ.Colossus = Colossus; G.NQ.COL_ANCH = COL_ANCH; G.NQ.colFrame = colFrame; }
(function () {
  const orig = Game.updateBurrowAbilities;
  Game.updateBurrowAbilities = function (dt) { orig.call(this, dt); Colossus.update(dt); };
})();
(function () {
  const orig = Game.ramsiCommand;
  Game.ramsiCommand = function () {
    if (this.map && this.map.colossus && this.companionActive && this.companionActive() && !(this.companion.busyT > 0)) { Colossus.fire(); return; }
    return orig.call(this);
  };
})();

// ---------------- drawing: the sky, the keep, the COLOSSUS ----------------
Game.OBJDRAW = Game.OBJDRAW || {};
Game.OBJDRAW.colossusbg = function (c) {
  const m = Game.map, cc = m.colossus; if (!cc) return;
  const camX = Game.camX || 0, horizon = 9 * TILE;
  const clear = cc.state === 'down' ? cc.clearT : 0;
  c.save();
  c.translate(camX, 0);                                  // pin the backdrop to the view
  if (cc.shakeT > 0) c.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3);
  // painted panoramas win when present (scene.grimspire_storm / scene.grimspire_sunny)
  const sc = Sprites.scenes || {};
  const pano = clear >= 0.5 ? (sc.grimspire_sunny || sc.grimspire_storm) : (sc.grimspire_storm || null);
  if (pano) {
    try { c.imageSmoothingEnabled = true; c.drawImage(pano, -camX * 0.3 - 40, 0, VW + 240, horizon); c.imageSmoothingEnabled = false; } catch (e) {}
  } else {
  // sky: thunderheads -> (after the win) clear blue
  const g = c.createLinearGradient(0, 0, 0, horizon);
  if (clear < 1) { g.addColorStop(0, '#232036'); g.addColorStop(0.7, '#3a3450'); g.addColorStop(1, '#4a4266'); }
  c.fillStyle = g; c.fillRect(0, 0, VW, horizon);
  if (clear > 0) { const g2 = c.createLinearGradient(0, 0, 0, horizon); g2.addColorStop(0, '#4a90d8'); g2.addColorStop(1, '#9adcf8');
    c.save(); c.globalAlpha = clear; c.fillStyle = g2; c.fillRect(0, 0, VW, horizon);
    c.fillStyle = '#ffe27a'; c.beginPath(); c.arc(VW - 70, 34, 18, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.9)'; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(60 + k * 130, 40 + (k % 2) * 18, 26, 9, 0, 0, 7); c.fill(); }
    c.restore(); }
  if (clear < 1) {                                        // rolling thunderheads + far flicker
    for (let k = 0; k < 6; k++) { const cx2 = ((k * 97 + Game.time * 6) % (VW + 80)) - 40, cy2 = 18 + (k % 3) * 16;
      c.fillStyle = 'rgba(30,26,48,.8)'; c.beginPath(); c.ellipse(cx2, cy2, 42, 12, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(58,52,80,.7)'; c.beginPath(); c.ellipse(cx2 + 12, cy2 - 5, 26, 8, 0, 0, 7); c.fill(); }
    if (Math.sin(Game.time * 7) > 0.96) { c.fillStyle = 'rgba(220,225,255,.14)'; c.fillRect(0, 0, VW, horizon); }
  }
  // the keep: gothic towers on the horizon (parallax)
  c.save(); c.translate(-camX * 0.3, 0);
  for (let k = 0; k < 7; k++) {
    const bx = k * 120 - 40, bw = 34 + (k % 3) * 10, bh = 46 + (k % 2) * 22, by = horizon - bh;
    c.fillStyle = clear > 0.5 ? '#5a5470' : '#191527'; c.fillRect(bx, by, bw, bh);
    c.fillStyle = clear > 0.5 ? '#6a647f' : '#211c31'; c.fillRect(bx, by, bw, 4);
    for (let t2 = 0; t2 < bw; t2 += 8) c.fillRect(bx + t2, by - 5, 5, 6);                 // crenellations
    c.fillStyle = clear > 0.5 ? '#3a3550' : '#0e0b18'; c.fillRect(bx + bw / 2 - 3, by - 16, 6, 16);  // spire
    if (clear < 0.5) { c.fillStyle = 'rgba(255,220,120,' + (0.25 + 0.15 * Math.sin(Game.time * 2 + k)) + ')';
      c.fillRect(bx + 6, by + 14, 4, 6); c.fillRect(bx + bw - 10, by + 22, 4, 6); }       // lit windows
  }
  c.restore();
  }
  // ---- THE STORM COLOSSUS (placeholder knight; Sprites.colossus* will override) ----
  if (cc.state !== 'down') {
    const sx = cc.wx - camX * COL_PARALLAX, fy = colFeetY() + (cc.state === 'falling' ? Math.min(60, (cc.fallT || 0) * 40) : 0);
    const step = Math.sin(cc.t * 2.6) * 3, tilt = cc.state === 'falling' ? (cc.fallT || 0) * 0.45 : 0;
    c.save(); c.translate(sx, fy); c.rotate(tilt * cc.dir);
    c.scale(cc.dir, 1);
    const P = (k) => (Sprites.props && Sprites.props[k]) || null;
    const armor = '#4a4266', armorHi = '#6a6288', dark = '#241a33', glow = 'rgba(126,240,160,';
    if (P('colbodya')) {
      // ---- PAINTED colossus: every piece rides its MEASURED socket, per stride frame ----
      const K = 1.75;
      const A = COL_ANCH[colFrame(cc)];
      const body = colFrame(cc) === 'a' ? P('colbodya') : P('colbodyb');
      c.drawImage(body, -24 * K, -64 * K, 48 * K, 64 * K);
      const hd = P('colhead');
      if (hd) c.drawImage(hd, A.neck[0] - 14, A.neck[1] - 22, 28, 28);
      if (!cc.helmet) { const hm = P('colhelm'); if (hm) c.drawImage(hm, A.neck[0] - 17.5, A.neck[1] - 27, 35, 31.5); }
      for (const p of cc.pieces) {
        if (p.off) continue;
        const a = A[p.anchor];
        c.save(); c.translate(a[0], a[1]);
        if (p.kind === 'arm') {
          const swing = Math.sin(cc.t * 2.6 + (p.anchor === 'armR' ? 0 : Math.PI)) * 0.07;
          c.rotate(swing);
          const spr = P(p.anchor === 'armL' ? 'colarml' : 'colarmr');
          if (spr) c.drawImage(spr, -11.2, -8, 22.4, 48);      // shoulder joint ~top-center of the arm art
        } else {
          const spr = P(p.id === 'chest' ? 'colplatec' : p.id === 'belly' ? 'colplateb' : 'colplates');
          if (spr) {
            c.save(); if (p.id === 'plateR') c.scale(-1, 1);
            const w = (p.id === 'chest' || p.id === 'belly') ? 25.6 : 22.4, h = p.id === 'chest' ? 22.4 : 19.2;
            c.drawImage(spr, -w / 2, -h / 2, w, h); c.restore();
          }
        }
        c.restore();
      }
      c.restore();
      // (reticles + falling pieces continue below in screen space)
    } else {
    // ---- procedural placeholder knight ----
    // legs stride
    c.fillStyle = dark; c.fillRect(-16, -34 + step, 12, 34 - step); c.fillRect(5, -34 - step, 12, 34 + step);
    c.fillStyle = armor; c.fillRect(-14, -32 + step, 8, 30 - step); c.fillRect(7, -32 - step, 8, 30 + step);
    // torso
    c.fillStyle = dark; c.fillRect(-24, -84, 48, 54);
    c.fillStyle = armor; c.fillRect(-21, -81, 42, 48);
    c.fillStyle = armorHi; c.fillRect(-21, -81, 42, 8);
    // head (under the helmet)
    c.fillStyle = dark; c.beginPath(); c.arc(0, -94, 13, 0, 7); c.fill();
    c.fillStyle = '#8a84a8'; c.beginPath(); c.arc(0, -94, 10.6, 0, 7); c.fill();
    c.fillStyle = cc.helmet ? '#ffd95a' : '#241a33'; c.fillRect(-5, -97, 4, 4); c.fillRect(2, -97, 4, 4);   // eyes glow once bare
    if (!cc.helmet) {                                   // the great helm + plume
      c.fillStyle = dark; c.fillRect(-14, -110, 28, 18);
      c.fillStyle = '#5a5470'; c.fillRect(-12, -108, 24, 14);
      c.fillStyle = '#e84a4a'; c.fillRect(-3, -122, 6, 14);
      c.fillStyle = dark; c.fillRect(-12, -99, 24, 3);
    }
    // pieces still attached
    for (const p of cc.pieces) {
      if (p.off) continue;
      c.save(); c.translate(p.ox * (cc.dir === 1 ? 1 : 1), p.oy + 92 - 92);   // offsets are already mirrored via scale
      c.translate(0, 0);
      if (p.kind === 'arm') {
        const swing = Math.sin(cc.t * 2.6 + (p.ox > 0 ? 0 : Math.PI)) * 6;
        c.rotate(swing * 0.02);
        c.fillStyle = dark; c.fillRect(-7, 0, 14, 40); c.fillStyle = armor; c.fillRect(-5, 2, 10, 36);
        c.fillStyle = dark; c.beginPath(); c.arc(0, 42, 8, 0, 7); c.fill();
      } else {
        c.fillStyle = dark; c.fillRect(-11, -8, 22, 18);
        c.fillStyle = armorHi; c.fillRect(-9, -6, 18, 14);
        c.fillStyle = armor; c.fillRect(-9, -6, 18, 4);
      }
      c.restore();
    }
    c.restore();
    }
    // glow reticles over whatever the laser can currently hit (in screen space, unmirrored)
    if (cc.state === 'fight') {
      const psx = Player.x - camX;
      for (const p of colVulnerable(m)) {
        const a = colAnchor(cc, p.anchor);
        const px = sx + a[0] * cc.dir, py = fy + a[1];
        const near = Math.abs(px - psx) < 16;
        const pulse = 0.5 + 0.5 * Math.sin(Game.time * (near ? 12 : 5));
        c.strokeStyle = glow + (0.45 + 0.45 * pulse) + ')'; c.lineWidth = near ? 3 : 1.6;
        c.beginPath(); c.arc(px, py, (p.r || 10) + pulse * 2.5, 0, 7); c.stroke(); c.lineWidth = 1;
        if (near) { c.fillStyle = glow + '0.9)'; c.beginPath(); c.moveTo(px, py + 16); c.lineTo(px - 5, py + 24); c.lineTo(px + 5, py + 24); c.fill(); }
      }
    }
  }
  // knocked-off pieces tumble down the sky
  for (const f of cc.falling) {
    c.save(); c.translate(f.x, f.y); c.rotate(f.rot);
    const ch = Sprites.props && Sprites.props.colchunk;
    if (ch) c.drawImage(ch, -11, -9, 22, 18);
    else { c.fillStyle = '#241a33'; c.fillRect(-10, -8, 20, 16); c.fillStyle = '#6a6288'; c.fillRect(-8, -6, 16, 12); }
    c.restore();
  }
  c.restore();
};
Game.OBJDRAW.stormfx2 = function (c) {
  const m = Game.map, cc = m.colossus; if (!cc) return;
  const camX = Game.camX || 0;
  // bolt telegraphs + strikes (world space)
  for (const b2 of cc.bolts) {
    const bx = b2.x, by = b2.y;
    if (!b2.fired) { const u = 1 - b2.t / 1.15;
      c.strokeStyle = 'rgba(255,230,120,' + (0.35 + 0.5 * u).toFixed(2) + ')'; c.lineWidth = 2;
      c.beginPath(); c.arc(bx, by, 15 - u * 8, 0, 7); c.stroke(); c.lineWidth = 1;
    } else if (b2.t > -0.2) {
      c.strokeStyle = '#fff'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(bx + 4, by - 90); c.lineTo(bx - 3, by - 40); c.lineTo(bx + 2, by - 36); c.lineTo(bx - 1, by); c.stroke();
      c.strokeStyle = '#ffe678'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(bx + 3, by - 86); c.lineTo(bx - 2, by - 40); c.lineTo(bx + 1, by - 34); c.lineTo(bx, by - 2); c.stroke();
      c.lineWidth = 1;
    }
  }
  // tornados (world space): stacked whirling ovals
  for (const tn of cc.tornados) {
    const ts = Sprites.props && Sprites.props.coltornado;
    if (ts) { c.save(); c.translate(tn.x, tn.y); c.rotate(Math.sin(tn.t * 9) * 0.08);
      c.drawImage(ts, -11, -34, 22, 38.5); c.restore(); }
    else for (let k = 0; k < 5; k++) {
      const w = 6 + k * 4, yy = tn.y - k * 7, sway = Math.sin(tn.t * 10 + k) * 2.5;
      c.strokeStyle = 'rgba(210,220,240,' + (0.75 - k * 0.1) + ')'; c.lineWidth = 2;
      c.beginPath(); c.ellipse(tn.x + sway, yy, w, 3.4, 0, 0, 7); c.stroke();
    }
    c.lineWidth = 1;
  }
  // the gather: a swelling star at Ramsi's brow
  if (Game._laserCharge) {
    const u = 1 - Game._laserCharge.t / 0.34, gx = Game.companion.x, gy = Game.companion.y - 14;
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(180,240,255,' + (0.5 * u).toFixed(2) + ')'; c.beginPath(); c.arc(gx, gy, 3 + u * 9, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,' + (0.85 * u).toFixed(2) + ')'; c.beginPath(); c.arc(gx, gy, 1.5 + u * 4, 0, 7); c.fill();
    c.restore();
  }
  // SUPER RAMSI'S LASER: a huge vertical blast
  if (Game._laserFx) {
    const lx = Game._laserFx.x, u = Game._laserFx.t / 0.4;
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(126,240,160,' + (0.35 * u).toFixed(2) + ')'; c.fillRect(lx - 9, 0, 18, Game.companion.y);
    c.fillStyle = 'rgba(240,255,246,' + (0.9 * u).toFixed(2) + ')'; c.fillRect(lx - 3.5, 0, 7, Game.companion.y);
    c.restore();
  }
  // charge pips: three bolts above the hint bar (readable without words)
  if (cc.state === 'fight') {
    const n = (Game._laser && Game._laser.n !== undefined) ? Game._laser.n : 3;
    const bolt = Sprites.props && Sprites.props.colbolt;
    for (let k = 0; k < 3; k++) {
      const px = camX + VW / 2 - 24 + k * 24, py = VH - 56;
      c.save(); c.translate(px, py);
      if (bolt) { c.globalAlpha = k < n ? 1 : 0.22; c.drawImage(bolt, -4.5, -7, 9, 14.5); c.globalAlpha = 1; }
      else {
        c.fillStyle = k < n ? '#7ef0a0' : 'rgba(60,66,90,.9)';
        c.beginPath(); c.moveTo(2, -8); c.lineTo(-3, 1); c.lineTo(0, 1); c.lineTo(-2, 8); c.lineTo(3, -1); c.lineTo(0, -1); c.closePath(); c.fill();
        c.strokeStyle = '#241a33'; c.stroke();
      }
      c.restore();
    }
  }
};
// pickups
Game.OBJDRAW.grasslump = function (c, o, ox, oy, e) {
  if (o._coolT > 0) return;
  const cx = ox + 8, cy = oy + 10 - e, bob = Math.sin(Game.time * 3 + o.x) * 1;
  const spr = Sprites.props && Sprites.props.colgrass;
  if (spr) { c.drawImage(spr, cx - 7, cy - 7 + bob, 14, 12); return; }
  c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(cx, cy + bob, 8, 5.4, 0, 0, 7); c.fill();
  c.fillStyle = '#3f9c40'; c.beginPath(); c.ellipse(cx, cy - 1 + bob, 6.6, 4.2, 0, 0, 7); c.fill();
  c.strokeStyle = '#58c452'; c.lineWidth = 1.6;
  for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(cx + k * 4, cy - 1 + bob); c.lineTo(cx + k * 5, cy - 8 + bob); c.stroke(); }
  c.lineWidth = 1;
};
Game.OBJDRAW.milkcarton = function (c, o, ox, oy, e) {
  if (o._coolT > 0) return;
  const cx = ox + 8, cy = oy + 11 - e, bob = Math.sin(Game.time * 3 + o.x) * 1;
  const spr = Sprites.props && Sprites.props.colmilk;
  if (spr) { c.drawImage(spr, cx - 6, cy - 15 + bob, 12, 17); return; }
  c.fillStyle = '#241a33'; c.fillRect(cx - 6, cy - 13 + bob, 12, 14);
  c.fillStyle = '#f4f7ff'; c.fillRect(cx - 4.6, cy - 11.6 + bob, 9.2, 11.2);
  c.fillStyle = '#4878e8'; c.fillRect(cx - 4.6, cy - 6 + bob, 9.2, 3);
  c.fillStyle = '#dfe8fa'; c.beginPath(); c.moveTo(cx - 6, cy - 13 + bob); c.lineTo(cx, cy - 17 + bob); c.lineTo(cx + 6, cy - 13 + bob); c.closePath(); c.fill();
  c.strokeStyle = '#241a33'; c.stroke();
};
// SUPER RAMSI: a golden aura on the roof (painted super sprite will override)
(function () {
  const orig = Game.drawCompanion;
  Game.drawCompanion = function (c) {
    if (this.map && this.map.colossus) {
      const comp = this.companion, p = 0.5 + 0.5 * Math.sin(Game.time * 5);
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(comp.x, comp.y - 6, 0, comp.x, comp.y - 6, 18 + p * 4);
      g.addColorStop(0, 'rgba(255,220,120,.5)'); g.addColorStop(1, 'rgba(255,220,120,0)');
      c.fillStyle = g; c.beginPath(); c.arc(comp.x, comp.y - 6, 18 + p * 4, 0, 7); c.fill(); c.restore();
      const F = (k) => (Sprites.props && Sprites.props[k]) || null;
      if (F('sramsi1')) {
        const firing = !!Game._laserFx, charging = !!Game._laserCharge;
        const spr = firing ? F('sramsi4') : charging ? F('sramsi3') : ((Game.time * 4 | 0) % 2 ? F('sramsi2') : F('sramsi1'));
        const w = firing ? 26 : 22, h = 18, bob = Math.sin(Game.time * 5) * 1.6;
        c.save(); c.translate(Math.round(comp.x), Math.round(comp.y));
        c.fillStyle = 'rgba(20,10,40,.3)'; c.beginPath(); c.ellipse(0, 2, 8, 2.6, 0, 0, 7); c.fill();
        if (comp.dir === 'left') c.scale(-1, 1);
        c.drawImage(spr, -w / 2, -h - 4 + bob, w, h);
        c.restore();
        return;                                          // (the golden aura above + our own body draw)
      }
    }
    if (Game.flags.colossus && !(this.map && this.map.colossus) && Sprites.props && Sprites.props.sramsi1) {
      // victory lap: Super Ramsi rides along for the rest of the save
      const f = ((Game.time * 4 | 0) % 2 ? Sprites.props.sramsi2 : Sprites.props.sramsi1);
      if (f) { if (!f.dens) f.dens = 4; const keep = Sprites.ramsi; Sprites.ramsi = f; orig.call(this, c); Sprites.ramsi = keep; return; }
    }
    orig.call(this, c);
  };
})();
// the pinned hint bar knows this fight too (reading level: age 6)
(function () {
  const orig = Game.bossHintLine;
  Game.bossHintLine = function () {
    const m = this.map;
    if (m && m.colossus && m.colossus.state !== 'down' && this.state !== 'cutscene') {
      const c = m.colossus;
      if (c.state === 'falling') return { keys: [], text: 'IT IS FALLING! WATCH!', hot: true };
      const n = (Game._laser && Game._laser.n !== undefined) ? Game._laser.n : 3;
      if (n <= 0) return { keys: [], text: 'EAT GRASS! DRINK MILK!' };
      const psx = Player.x - (Game.camX || 0), sx = c.wx - (Game.camX || 0) * COL_PARALLAX;
      const near = colVulnerable(m).some(p => Math.abs(sx + p.ox * c.dir - psx) < 16);
      if (near) return { keys: ['C'], text: 'NOW! FIRE THE LASER!', hot: true };
      if (!c.pieces.some(p => !p.off)) return { keys: ['C'], text: c.helmet ? 'ZAP THE HEAD!' : 'ZAP THE HELMET!' };
      return { keys: ['C'], text: 'STAND UNDER A GLOW!' };
    }
    return orig.call(this);
  };
})();

// ---------------- the ending ----------------
function drawColossusEnd(c, t) {
  const cx = SW / 2;
  const pano = Sprites.scenes && Sprites.scenes.grimspire_sunny;
  if (pano) {
    c.save(); c.imageSmoothingEnabled = true;
    const ph = SH, pw = pano.width * ph / pano.height, drift = Math.sin(t * 0.25) * 24;
    c.drawImage(pano, cx - pw / 2 + drift, 0, pw, ph);
    c.restore(); c.imageSmoothingEnabled = false;
    c.fillStyle = 'rgba(20,12,30,.14)'; c.fillRect(0, 0, SW, SH);   // gentle vignette for readability
  } else {
    const g = c.createLinearGradient(0, 0, 0, SH * 0.62); g.addColorStop(0, '#4a90d8'); g.addColorStop(1, '#9adcf8');
    c.fillStyle = g; c.fillRect(0, 0, SW, SH * 0.62);
    c.fillStyle = '#3f9c40'; c.fillRect(0, SH * 0.62, SW, SH);
  }
  const gy = SH * 0.66;
  const noah = Sprites.noah.down[0];
  c.fillStyle = 'rgba(20,10,40,.35)'; c.beginPath(); c.ellipse(cx - 40, gy + 2, 26, 7, 0, 0, 7); c.fill();
  c.beginPath(); c.ellipse(cx + 34, gy + 4, 24, 6, 0, 0, 7); c.fill();
  c.save(); c.translate(cx - 40, gy); c.scale(3, 3); dspr(c, noah, -sprW(noah) / 2, -sprH(noah)); c.restore();
  const sr = Sprites.props && (((t * 3 | 0) % 2) ? Sprites.props.sramsi2 : Sprites.props.sramsi1);
  if (sr) { const bob = Math.sin(t * 2.4) * 3; c.drawImage(sr, cx + 6, gy - 56 + bob, 66, 54); }
  else if (Sprites.ramsi) { c.save(); c.translate(cx + 30, gy + 4); c.scale(2.6, 2.6); dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi)); c.restore(); }
  for (let i = 0; i < 24; i++) { c.fillStyle = ['#e84a4a', '#f8d048', '#58c452', '#4878e8', '#f898c8'][i % 5]; c.fillRect((hash2(i, 5) * SW + t * (30 + i)) % SW, (hash2(i, 11) * SH + t * 60) % SH, 3, 3); }
}
// the 4th star-cell: RAMSI GOES SUPER (played inside the star celebration)
function drawSuperTransform(c, t, phase) {
  c.fillStyle = '#141229'; c.fillRect(0, 0, SW, SH);
  const cx = SW / 2, cy = SH / 2 - 8;
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 10; k++) { const a = k * 0.628 + t * (phase >= 2 ? 1.2 : 0.3);
    c.fillStyle = 'rgba(255,220,120,' + (phase >= 2 ? 0.16 : 0.07) + ')';
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * SW, cy + Math.sin(a) * SW * 0.5); c.lineTo(cx + Math.cos(a + 0.16) * SW, cy + Math.sin(a + 0.16) * SW * 0.5); c.fill(); }
  c.restore();
  if (phase === 1) {
    if (Sprites.ramsi) { c.save(); c.translate(cx, cy + 14); c.scale(3.2, 3.2); dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi)); c.restore(); }
    for (let k = 0; k < 4; k++) {                       // the four star-cells spiral in
      const a = t * 1.6 + k * 1.57, r = Math.max(14, 90 - t * 34);
      const sx2 = cx + Math.cos(a) * r, sy2 = cy - 6 + Math.sin(a) * r * 0.55;
      c.fillStyle = '#ffd95a'; c.beginPath();
      for (let q = 0; q < 5; q++) { const b = -Math.PI / 2 + q * 1.257; c.lineTo(sx2 + Math.cos(b) * 6, sy2 + Math.sin(b) * 6); const b2 = b + 0.628; c.lineTo(sx2 + Math.cos(b2) * 2.6, sy2 + Math.sin(b2) * 2.6); }
      c.closePath(); c.fill(); c.strokeStyle = '#241a33'; c.stroke();
    }
  } else if (phase === 2) {
    const u = Math.min(1, t * 1.4);
    c.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.6 * Math.sin(u * Math.PI)).toFixed(2) + ')';
    c.beginPath(); c.arc(cx, cy, 30 + u * 60, 0, 7); c.fill();
  } else {
    const sr = Sprites.props && (((t * 3 | 0) % 2) ? Sprites.props.sramsi2 : Sprites.props.sramsi1);
    if (sr) { const bob = Math.sin(t * 2.4) * 4; c.drawImage(sr, cx - 66, cy - 54 + bob, 132, 108); }
    for (let i = 0; i < 26; i++) { c.fillStyle = ['#ffd95a', '#fff', '#9adcf8'][i % 3]; c.fillRect((hash2(i, 5) * SW + t * (40 + i)) % SW, (hash2(i, 11) * SH + t * 66) % SH, 3, 3); }
  }
}
(function () {
  const orig = Game.STAR_CUTSCENE;
  if (!orig) return;
  Game.STAR_CUTSCENE = function (n, who) {
    const beats = orig.call(this, n, who);
    if (n >= 4) beats.push(
      { title: 'THE FOUR STARS SING', text: 'Every star-cell blazes at once — their light pours into RAMSI!', draw: (c, t) => drawSuperTransform(c, t, 1) },
      { title: 'HE CHANGES', text: 'Gears of gold! Fleece of sunlight! The little clockwork ram stands up TALL...', draw: (c, t) => drawSuperTransform(c, t, 2) },
      { title: 'SUPER RAMSI!', text: 'A LASER burns behind his star-bright eyes. Something VAST waits beyond the storm — GO GET IT, YOU TWO!', draw: (c, t) => drawSuperTransform(c, t, 3) }
    );
    return beats;
  };
})();

Game.COLOSSUS_ENDING = [
  { title: 'THE SKY BREAKS', text: 'The Storm Colossus crashes down the castle walls — and the thunderheads tear apart like paper!', draw: drawColossusEnd },
  { title: 'SUNRISE OVER GRIMSPIRE', text: 'Warm light washes the keep. Super Ramsi\'s glow fades to a happy, ordinary glow.', draw: drawColossusEnd },
  { title: 'HERO OF EVERYTHING', text: 'Every world safe. Every friend free. Noah & Ramsi — heroes, together. THE END!', draw: drawColossusEnd },
];
