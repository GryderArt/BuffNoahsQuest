"use strict";
// ============== BURROW 5 REBUILT — TOPSOIL TUNNELS: the HERDWORK level ==============
// Overrides buildBurrow5. Noah has TOOLS ONLY here (Glow+Shrink come at the end), so the
// level's system is the herds themselves:
//   * Herdwork — JOBSPOTS are marked patches; press SPACE and Noah waves a clover. The
//     nearest matching burrow-Mimi trots over and DOES ITS THING: GOATS dig soil-plugs,
//     RAMS butt boulders, SHEEP mow bramble-roots, SNOWHARES sniff out buried treasure.
//     Every job is an m.puzzle entry (sw_* + applyPuzzle) — permanent, wired, audit-safe.
//   * MOTTLE THE MOLE rebuilt: true whack-a-mole — he swims the soil between MOLEHILLS
//     (unhittable), a hill shakes as he rises, then he pops up for the co-op window.
// The dig-works keep the classic tool gates: HARPOON the moat-post, LUNGE the cracked
// seam, call the KIDNAPPED GOAT to dig, BRACER the block onto the switch. The exit stays
// the Shrink-hole plug — the freshly-freed MR. RAM's first lesson.

// ================================ HERDWORK ================================
const Herd = {
  verbs: { goat: 'DIGS', ram: 'BUTTS', sheep: 'MOWS', snowhare: 'SNIFFS' },
  spots(m) { const r = []; for (const o of m.objects) if (o.type === 'jobspot') r.push(o); return r; },
  call(spot) {
    const m = Game.map;
    if (Game.flags.switchFlags[spot.flag]) { Game.toast('That job is already done — thanks, ' + spot.species.toUpperCase() + 'S!'); return; }
    if (spot.worker) { Game.toast('The ' + spot.species + ' is on its way!'); return; }
    let best = null, bd = 10.5 * TILE;
    for (const cr of Game.creatures) {
      if (cr.species !== spot.species || cr.state === 'gone' || cr.state === 'trapped' || cr._job) continue;
      const d = dist(cr.x, cr.y, spot.x * TILE + 8, spot.y * TILE + 8);
      if (d < bd) { bd = d; best = cr; }
    }
    if (!best) { Game.toast('Noah waves a clover... but no ' + spot.species.toUpperCase() + ' is near enough to see it!'); return; }
    spot.worker = best; best._job = spot;
    Audio2.jingle('talk'); Particles.burst(Player.x, Player.y - 10, 'sparkle');
    Game.toast('Noah waves a clover — a ' + spot.species.toUpperCase() + ' perks up and trots over!');
  },
  update(dt, m) {
    if (!m || !m._herdwork) return;
    for (const spot of this.spots(m)) {
      const cr = spot.worker;
      if (!cr) continue;
      if (cr.state === 'gone' || cr.state === 'trapped') { spot.worker = null; cr._job = null; continue; }
      const tx = spot.x * TILE + 8, ty = spot.y * TILE + 8;
      const d = Math.max(1, dist(cr.x, cr.y, tx, ty));
      if (d > 8) { cr.x += (tx - cr.x) / d * 62 * dt; cr.y += (ty - cr.y) / d * 62 * dt; cr.stun = 0.1; }
      else {
        spot.worker = null; cr._job = null;
        const pz = (m.puzzle || []).find(p => p.flag === spot.flag);
        if (pz && !Game.flags.switchFlags[spot.flag]) {
          Game.flags.switchFlags[spot.flag] = true; Game.applyPuzzle(m, pz);
          Audio2.jingle(pz.jingle || 'door');
          for (const [ti, tj] of (pz.tiles || [])) Particles.burst(ti * TILE + 8, tj * TILE + 8, 'dust');
          Particles.burst(tx, ty, 'confetti');
          if (pz.msg) Game.banner(pz.msg); saveGame();
        }
      }
    }
  },
};
if (typeof G !== 'undefined' && G.NQ) G.NQ.Herd = Herd;

(function () {
  const orig = Game.updateBurrowAbilities;
  Game.updateBurrowAbilities = function (dt) { orig.call(this, dt); Herd.update(dt, this.map); };
})();
(function () {
  const orig = Game.interact;
  Game.interact = function () {
    const m = this.map;
    if (m && m._herdwork) {
      for (const o of m.objects) if (o.type === 'jobspot' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 32) { Herd.call(o); return; }
    }
    return orig.call(this);
  };
})();

Game.OBJDRAW = Game.OBJDRAW || {};
Game.OBJDRAW.jobspot = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 9 - e, done = Game.flags.switchFlags[o.flag];
  if (done) {   // a happy little clover patch
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + o.x; c.fillStyle = '#58c452'; c.beginPath(); c.arc(cx - 4 + k * 4, cy + 1 - (k % 2) * 2, 2.2, 0, 7); c.fill(); }
    return;
  }
  const p = 0.5 + 0.5 * Math.sin(Game.time * 3 + o.x);
  c.strokeStyle = 'rgba(248,232,88,' + (0.4 + 0.4 * p).toFixed(2) + ')'; c.setLineDash([3, 4]);
  c.lineDashOffset = -((Game.time * 10) % 7); c.lineWidth = 1.6;
  c.beginPath(); c.arc(cx, cy, 8.5, 0, 7); c.stroke(); c.setLineDash([]); c.lineWidth = 1;
  const set = Sprites.creatures[o.species];   // a little bobbing "wanted" portrait
  if (set) { const spr = set.right[0], bob = Math.sin(Game.time * 2.6 + o.x) * 1.4; c.save(); c.globalAlpha = 0.9; c.translate(cx, cy - 14 + bob); c.scale(0.8, 0.8); dspr(c, spr, -sprW(spr) / 2, -sprH(spr) / 2); c.restore(); }
  c.fillStyle = '#58c452'; c.beginPath(); c.arc(cx, cy, 2.2, 0, 7); c.fill();   // the clover
  c.fillStyle = '#7ee468'; c.beginPath(); c.arc(cx - 1.4, cy - 1.4, 1.1, 0, 7); c.arc(cx + 1.4, cy - 1.4, 1.1, 0, 7); c.fill();
  if (dist(Player.x, Player.y, ox + 8, oy + 8) < 36) drawText(c, 'SPACE: CALL ' + o.species.toUpperCase(), cx - 30 - o.species.length * 2, cy - 26, 7, '#f8e858', '#241a33');
};
Game.OBJDRAW.molehill = function (c, o, ox, oy, e) {
  const cx = ox + 8, cy = oy + 10 - e;
  c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(cx, cy, 8.4, 4.6, 0, 0, 7); c.fill();
  c.fillStyle = '#5a3c1e'; c.beginPath(); c.ellipse(cx, cy - 0.6, 7, 3.6, 0, 0, 7); c.fill();
  c.fillStyle = '#7a5430'; c.beginPath(); c.ellipse(cx, cy - 1.4, 4.6, 2.2, 0, 0, 7); c.fill();
  c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(cx, cy - 1, 2.2, 1.2, 0, 0, 7); c.fill();
};

// ======================= MOTTLE, rebuilt (whack-a-mole) =======================
(function () {
  const upPrev = Bosses.up_warden, drawPrev = Bosses.drawWarden;
  const hillsFor = (b) => {
    const m = Game.map;
    if (m && m._molehills) return m._molehills;
    return [[(b.hx / TILE | 0) - 3, (b.hy / TILE | 0) - 2], [(b.hx / TILE | 0) + 3, (b.hy / TILE | 0) - 2],
            [(b.hx / TILE | 0) - 3, (b.hy / TILE | 0) + 2], [(b.hx / TILE | 0) + 3, (b.hy / TILE | 0) + 2]];
  };
  Bosses.up_warden = function (b, dt) {
    if (b.name !== 'mottle') return upPrev.call(this, b, dt);
    const p = Player, cfg = b.cfg, comp = Game.companion;
    if (b.inv > 0) b.inv -= dt;
    if (b.shieldT > 0) b.shieldT -= dt;
    if (b.stun > 0) b.stun -= dt;
    if (b.mstate === undefined) { b.mstate = 'under'; b.mT = 1.6; b.surf = 0; }
    b.mT -= dt;
    if (b.mstate === 'under') {
      b.surf = 0;
      if (b.shieldT > 0) b.shieldT = 0;            // no window on a swimming mole
      // swim toward the hill nearest Noah
      const hills = hillsFor(b);
      let best = hills[0], bd = 1e9;
      for (const h of hills) { const d = dist(h[0] * TILE + 8, h[1] * TILE + 8, p.x, p.y); if (d < bd) { bd = d; best = h; } }
      b.tgt = best;
      const tx = best[0] * TILE + 8, ty = best[1] * TILE + 4, d = Math.max(1, dist(b.x, b.y, tx, ty));
      b.x += (tx - b.x) / d * 85 * dt; b.y += (ty - b.y) / d * 85 * dt;
      if ((b.trailT = (b.trailT || 0) - dt) <= 0) { b.trailT = 0.24; Particles.burst(b.x, b.y + 3, 'dust'); }
      if (d < 8 && b.mT <= 0) { b.mstate = 'pop'; b.mT = 0.6; Audio2.jingle('step'); }
    } else if (b.mstate === 'pop') {
      b.surf = 0;
      if (b.mT <= 0) {
        b.mstate = 'up'; b.mT = 2.3; b.surf = 1;
        Audio2.jingle('bossintro'); Particles.burst(b.x, b.y, 'dust');
        if (Player.inv <= 0 && !(comp.decoyT > 0) && dist(p.x, p.y, b.x, b.y) < 18) Player.hurt(1);
      }
    } else if (b.mstate === 'up') {
      b.surf = 1;
      if (b.shieldT > 0) b.mT = Math.max(b.mT, 0.8);
      if (b.mT <= 0) { b.mstate = 'under'; b.mT = 1.5 + Math.random() * 0.9; b.shieldT = 0; Particles.burst(b.x, b.y + 2, 'dust'); }
    }
    if (b.shieldT > 0) {
      if (this.wardenHit(b)) {
        b.hits++; b.inv = 0.7; Audio2.jingle('capture'); Particles.burst(b.x, b.y - 12, 'confetti');
        if (b.hits >= b.armor) { this.catchBoss(b); return; }
        Game.banner('HIT! ' + cfg.title + ' (' + b.hits + '/' + b.armor + ') — watch the hills!');
      }
    } else if (this.wardenHit(b)) {
      if (Game.time - (b.clinkT || 0) > 1) { b.clinkT = Game.time; Game.toast(b.surf ? cfg.title + ' is GUARDED — RAMSI headbutts him first!' : 'He is UNDER the soil — watch which MOLEHILL shakes!'); }
      b.inv = 0.4;
    }
    if (Player.inv <= 0 && b.surf > 0 && b.stun <= 0 && !(comp.decoyT > 0) && dist(p.x, p.y, b.x, b.y) < 14) Player.hurt(1);
  };
  Bosses.drawWarden = function (c, b) {
    if (b.name !== 'mottle') return drawPrev.call(this, c, b);
    const ov = Sprites.mottle;
    if (b.mstate === 'under' || b.mstate === 'pop') {
      const sw = b.mstate === 'pop' ? Math.sin(b.t * 24) * 1.6 : 0;
      const h = b.mstate === 'pop' ? 7.5 : 5;
      c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(sw, -1, 11, h, 0, 0, 7); c.fill();
      c.fillStyle = '#5a3c1e'; c.beginPath(); c.ellipse(sw, -2, 9.4, h - 1.2, 0, 0, 7); c.fill();
      c.fillStyle = '#7a5430'; c.beginPath(); c.ellipse(sw, -3, 6, h - 2.8, 0, 0, 7); c.fill();
      if (b.mstate === 'pop') { c.strokeStyle = 'rgba(255,150,80,' + (0.5 + 0.4 * Math.sin(b.t * 16)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(0, -2, 13, 0, 7); c.stroke(); c.lineWidth = 1; }
    } else {
      c.save();
      if (b.stun > 0) c.rotate(Math.sin(b.t * 12) * 0.1);
      if (ov) { const sc = 1; if (Player.x < b.x) c.scale(-sc, sc); dspr(c, ov, -sprW(ov) / 2, -sprH(ov)); }
      else {
        const bob = Math.sin(b.t * 5) * 1.4;
        c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(0, -9 + bob, 10.4, 12, 0, 0, 7); c.fill();
        c.fillStyle = '#6a4a2e'; c.beginPath(); c.ellipse(0, -9 + bob, 9, 10.6, 0, 0, 7); c.fill();
        c.fillStyle = '#8a6440'; c.beginPath(); c.ellipse(-2, -12 + bob, 5, 6, -0.3, 0, 7); c.fill();
        // digging paws + star nose + shades (a very cool mole)
        c.fillStyle = '#e8b48a'; c.beginPath(); c.arc(-8, -4 + bob, 3, 0, 7); c.arc(8, -4 + bob, 3, 0, 7); c.fill();
        c.fillStyle = '#f090a0'; c.beginPath(); c.arc(0, -14 + bob, 2.6, 0, 7); c.fill();
        for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.fillStyle = '#f8b8c8'; c.fillRect(Math.cos(a) * 4 - 0.8, -14 + bob + Math.sin(a) * 4 - 0.8, 1.6, 1.6); }
        c.fillStyle = '#241a33'; c.fillRect(-6, -19 + bob, 12, 3.4);
        const open = b.shieldT > 0;
        if (open) { c.fillStyle = '#ffd95a'; c.beginPath(); c.arc(0, -6 + bob, 2.6, 0, 7); c.fill(); }
      }
      c.restore();
      const top = -30;
      for (let k = 0; k < b.armor; k++) { c.fillStyle = k < (b.armor - b.hits) ? '#e84a4a' : '#3a2c50'; c.beginPath(); c.arc(-(b.armor - 1) * 6 + k * 12, top, 4, 0, 7); c.fill(); c.strokeStyle = '#241a33'; c.stroke(); }
    }
  };
})();

// ============================ THE MAP ============================
function buildBurrow5() {
  if (MAPS.burrow5) return;
  const m = newMap('burrow5', 64, 40, 'soil', { name: 'Topsoil Tunnels', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  m._herdwork = true;                                   // vignette-dark only: daylight leaks down here
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  m.start = { x: 4, y: 20 };
  const vein = (p) => { for (const [x, y] of p) T(m, x, y, 'glowvein'); };

  // ---------------- WEST: three pastures around the great SINKHOLE ----------------
  NPC(m, 5, 22, 'granny', 'Old Mole');
  SIGN(m, 3, 23, 'THE TOPSOIL TUNNELS! GNASH stole the PILLOW-KIN — but you\'ll need help from the burrow-Mimis themselves. Wave a clover at a JOB-PATCH (SPACE): GOATS dig, RAMS butt, SHEEP mow, SNOWHARES sniff!');
  blob(m, 16, 18, 3.4, 2.2, 'chasm', 0, 5301, ['soil']);   // the sinkhole landmark
  SIGN(m, 20, 16, 'The GREAT SINKHOLE — topsoil pours in day and night. Mind the edge!');
  vein([[6, 16], [11, 13], [22, 23], [7, 26], [13, 10], [26, 15]]);

  // pasture A (NW): sheep + rams (the vale-burrow drops you here at 3,11)
  SPAWN(m, 'sheep', 3, 4, 8, 6, 4); SPAWN(m, 'ram', 8, 8, 4, 4, 2);
  SIGN(m, 5, 12, 'BAAA! Sheep LOVE bramble-roots. See a mowing job? Call a sheep!');
  // the bramble wall into pasture C, mowed by a sheep
  R(m, 15, 3, 2, 10, 'rootwall');
  OBJ(m, { type: 'jobspot', species: 'sheep', x: 14, y: 8, flag: 'sw_b5mow1' });
  // pasture C (NE): snowhares + the sniffing secret
  SPAWN(m, 'snowhare', 20, 4, 8, 6, 3);
  R(m, 24, 6, 3, 1, 'rootwall'); R(m, 24, 7, 1, 1, 'rootwall'); R(m, 26, 7, 1, 1, 'rootwall'); T(m, 25, 8, 'rootwall');
  CHEST(m, 25, 7, { heartpiece: 1 });
  OBJ(m, { type: 'jobspot', species: 'snowhare', x: 24, y: 9, flag: 'sw_b5sniff' });
  SIGN(m, 21, 10, 'Snowhares smell treasure through solid soil. Something is buried near here...');
  // pasture B (S): goats behind a soil-plug, one stray outside
  R(m, 2, 27, 15, 1, 'rootwall');
  SPAWN(m, 'goat', 4, 29, 10, 6, 4);
  blob(m, 12, 33, 2.6, 1.8, 'water', 0, 5310, ['soil']);
  SPAWN(m, 'goat', 10, 22, 4, 4, 1);                     // the stray kid
  OBJ(m, { type: 'jobspot', species: 'goat', x: 9, y: 25, flag: 'sw_b5dig1' });
  SIGN(m, 12, 25, 'A stray kid bleats at the plugged burrow — its herd is sealed below! Goats dig like nobody\'s business...');
  // the stray ram by the sinkhole (for the dig-works boulder)
  SPAWN(m, 'ram', 24, 18, 4, 4, 1);
  OBJ(m, { type: 'jobspot', species: 'ram', x: 29, y: 20, flag: 'sw_b5ram1' });
  SIGN(m, 27, 22, 'The DIG-WORKS door is one BIG boulder. You know who loves headbutting boulders? RAMS.');
  CHEST(m, 27, 4, { coins: 12 }); CHEST(m, 3, 36, { gems: 5 });

  // ---------------- the SEALED DIG-WORKS (x31-62) ----------------
  R(m, 31, 11, 24, 3, 'rootwall');                       // thick north band wall (x31-54)
  R(m, 30, 27, 25, 1, 'rootwall');                       // south band wall (x30-54)
  R(m, 31, 14, 1, 13, 'rootwall');                       // west wall + the boulder gate
  T(m, 31, 19, 'rootwall'); T(m, 31, 20, 'rootwall');    // (the boulder tiles the ram smashes)
  R(m, 36, 14, 2, 13, 'rift');                           // the sinkhole moat arm (starry: no jumping this)
  POST(m, 38, 20); POST(m, 35, 20);                      // paired posts: across AND back
  SIGN(m, 33, 22, 'An arm of the sinkhole cuts the works in two — HARPOON the POST (Z) and reel across!');
  R(m, 44, 14, 1, 13, 'rootwall'); T(m, 44, 20, 'crack');
  SIGN(m, 41, 22, 'A cracked seam in the old wall — LUNGE (Z) with the RAM SUIT to smash through!');
  SPAWN(m, 'goat', 48, 17, 2, 2, 1);                     // the kidnapped kid
  OBJ(m, { type: 'jobspot', species: 'goat', x: 49, y: 20, flag: 'sw_b5dig2' });
  SIGN(m, 46, 22, 'MOTTLE kidnapped a GOAT-KID! It\'s dying to dig again — call it (SPACE) at the job-patch!');
  R(m, 51, 14, 1, 13, 'rootwall'); T(m, 51, 19, 'rootwall'); T(m, 51, 20, 'rootwall'); // wall w/ the plug (kid digs 19-20)
  OBJ(m, { type: 'block', x: 52, y: 16, id: 'b5_blk1' }); T(m, 52, 18, 'switch');
  R(m, 54, 14, 1, 13, 'chasm');                          // the last pit
  SIGN(m, 52, 22, 'Shove the BLOCK (BRACERS) onto the switch — old beams will bridge the pit.');
  vein([[34, 16], [42, 24], [48, 15], [53, 25]]);
  CHEST(m, 41, 15, { coins: 10 });

  // ---------------- the DEN (x55-62): MOTTLE + MR. RAM + the shrink-hole exit ----------------
  R(m, 55, 13, 8, 1, 'rootwall');                        // den north wall
  for (const [hx, hy] of [[56, 16], [60, 16], [57, 23], [61, 22]]) OBJ(m, { type: 'molehill', x: hx, y: hy, deco: true });
  m._molehills = [[56, 16], [60, 16], [57, 23], [61, 22]];
  SIGN(m, 55, 21, 'MOTTLE THE MOLE swims the soil between his hills! Watch which MOLEHILL shakes — when he pops, RAMSI headbutts, then GRAB him (Z)!');
  OBJ(m, { type: 'boss', x: 58, y: 19, boss: 'mottle' });
  OBJ(m, { type: 'pillowkin', x: 61, y: 15, kin: 1, caged: true, warden: 'mottle', color: '#d8b48a', name: 'MR. RAM',
    gives: ['ramGlow', 'ramShrink'], freed: 'You free MR. RAM! RAMSI now GLOWS in the dark AND can SHRINK through burrow-holes (press C). Try the plugged hole below — dig deeper!' });
  CHEST(m, 62, 23, { gems: 8 });
  // the plugged shaft down (Shrink's first lesson)
  T(m, 60, 25, 'holegap'); DOOR(m, 60, 26, 'flag', 'b5_exit', 'A snug burrow-hatch, plugged from below.');
  OBJ(m, { type: 'ramhole', x: 60, y: 24, flag: 'b5_exit', compOnly: true, msg: 'RAMSI shrinks down the hole and kicks the plug loose — the hatch swings open!' });
  R(m, 55, 27, 8, 1, 'rootwall'); T(m, 60, 27, 'soil');
  T(m, 59, 28, 'rootwall'); T(m, 61, 28, 'rootwall'); T(m, 60, 29, 'rootwall');
  SIGN(m, 57, 24, 'The shaft to the ROOT HOLLOWS — plugged tight. Only something SMALL could slip through...');
  OBJ(m, { type: 'portal', x: 60, y: 28, to: 'burrow6', tx: 4, ty: 20, req: 'b5_exit' });

  // ================= the JOBS (m.puzzle entries) =================
  m.puzzle = [
    { sw: [14, 8], flag: 'sw_b5mow1', to: 'soil', tiles: [[15, 7], [15, 8], [16, 7], [16, 8]],
      color: '126,228,104', jingle: 'cage', msg: 'MUNCH MUNCH MUNCH — the sheep mows a path through the bramble-roots!' },
    { sw: [24, 9], flag: 'sw_b5sniff', to: 'soil', tiles: [[25, 8]],
      color: '248,232,88', jingle: 'key', msg: 'The snowhare thumps twice and digs — a BURIED CHEST pokes out of the soil!' },
    { sw: [9, 25], flag: 'sw_b5dig1', to: 'soil', tiles: [[8, 27], [9, 27]],
      color: '126,228,104', jingle: 'door', msg: 'DIG DIG DIG — the kid tunnels the plug open! The goat pasture (and its pond) is free!' },
    { sw: [29, 20], flag: 'sw_b5ram1', to: 'soil', tiles: [[31, 19], [31, 20]],
      color: '232,120,80', jingle: 'rumble', msg: 'CRACK! The ram headbutts the boulder to bits — the DIG-WORKS stand open!' },
    { sw: [49, 20], flag: 'sw_b5dig2', to: 'soil', tiles: [[51, 19], [51, 20]],
      color: '126,228,104', jingle: 'door', msg: 'The rescued kid digs the plug wide open — and prances off. Onward!' },
    { sw: [52, 18], flag: 'sw_b5bridge', to: 'bridge', tiles: [[54, 19], [54, 20], [54, 21]],
      color: '248,208,72', jingle: 'door', msg: 'CLUNK! Old beams swing across the pit!' },
  ];
}
if (typeof G !== 'undefined' && G.NQ) { G.NQ.buildBurrow5 = buildBurrow5; }
