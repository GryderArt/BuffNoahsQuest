"use strict";
// ===================== WORLD 4 FINALE — GNASHARA, THE ALL-BEAST =====================
// One monstrosity fusing every foe: a HEAD for each, knocked out ONE AT A TIME with that
// world's tool. When all heads drop, the chest-core opens and SUPER RAMSI ends it.
const GNASHARA_HEADS = [
  { name: 'GUST-WING',  sprite: 'gustwing',  weak: 'ramsi',   prompt: 'GUST-WING head: lead RAMSI into it! (walk Ramsi up to the front head)' },
  { name: 'GNASH',      sprite: 'gnash',     weak: 'ram',     prompt: 'GNASH head: RAM-LUNGE it! (tool 1 MITTS, press Z up close)' },
  { name: 'STORM-LORD', sprite: 'tempestia', weak: 'harpoon', prompt: 'STORM-LORD head: HARPOON it! (tool 3, press Z)' },
  { name: 'CERBERUS',   sprite: 'cerb',      weak: 'bone',    prompt: 'CERBERUS head: BONE-STUN it! (tool 5, press Z)' },
  { name: 'GEODE',      sprite: 'geode',     weak: 'net',     prompt: 'GEODE head: NET it! (tool 2, press Z up close)' },
];

(function buildWorld4() {
  if (typeof newMap !== 'function' || MAPS.cog4) return;
  const m = newMap('cog4', 32, 22, 'cogfloor', { name: 'The All-Beast', song: 'boss', cliff: 'stone', zone: 'city', noFly: true });
  m.custom = true;
  R(m, 0, 0, m.w, 2, 'gearwall'); R(m, 0, m.h - 1, m.w, 1, 'gearwall'); R(m, 0, 0, 1, m.h, 'gearwall'); R(m, m.w - 1, 0, 1, m.h, 'gearwall');
  OBJ(m, { type: 'gear', x: 4, y: 5, r: 8, dir: 1, speed: 0.5 }); OBJ(m, { type: 'gear', x: 28, y: 5, r: 8, dir: -1, speed: 0.5 });
  for (const s of [[5, 18], [27, 18], [3, 11], [29, 11]]) T(m, s[0], s[1], 'steam');
  SIGN(m, 13, 18, 'THE ALL-BEAST GNASHARA — a HEAD for every foe you have faced! Knock them out ONE AT A TIME with the RIGHT tool (watch the prompt). When all are down, SUPER RAMSI ends it!');
  OBJ(m, { type: 'boss', x: 16, y: 7, boss: 'gnashara' });
  m.start = { x: 16, y: 18 };
  OBJ(m, { type: 'portal', x: 16, y: 5, to: 'castle1', tx: 4, ty: 12, secret: true, req: 'gnashara' });   // the cloud-stair to GRIMSPIRE KEEP
  SIGN(m, 14, 18, 'Something VAST strides the storm beyond the city... beat the All-Beast and the cloud-stair will rise.');
})();

// ---- the fight (extends the Bosses framework; up_<name> is auto-dispatched) ----
Bosses.up_gnashara = function (b, dt) {
  const heads = b.heads;
  if (b.active >= heads.length) {                                   // ALL HEADS DOWN -> Super-Ramsi finish
    b.coreT = (b.coreT || 0) + dt;
    if (!b._coreAnn) { b._coreAnn = true; Game.banner('Every head is DOWN! The chest-core blazes open — SUPER RAMSI, FINISH IT!'); Audio2.jingle('door'); }
    if (b.coreT > 1.0) this.catchBoss(b);
    return;
  }
  // ---- the All-Beast PROWLS the arena: drifts perch to perch, sometimes a telegraphed SWEEP ----
  if (b.sweepT > 0) {                                               // mid-sweep: barrel across the arena
    b.sweepT -= dt; b.x += b.sweepV * dt;
    if (Player.inv <= 0 && dist(Player.x, Player.y, b.x, b.y + 10) < 40) { Player.hurt(1); Particles.burst(Player.x, Player.y, 'dust'); }
    if (b.sweepT <= 0) { b.tx = b.x; b.ty = b.y; b.moveT = 1.6; }
  } else if (b.sweepTeleT > 0) {                                    // wind-up: shiver in place (the tell)
    b.sweepTeleT -= dt; b.x += Math.sin(b.t * 30) * 0.6;
    if (b.sweepTeleT <= 0) { b.sweepT = 1.15; b.sweepV = (Player.x > b.x ? 1 : -1) * 150; Audio2.jingle('rumble'); }
  } else {
    b.moveT = (b.moveT || 0) - dt;
    if (b.moveT <= 0) {
      b.moveT = 2.2 + Math.random() * 1.4;
      if (Math.random() < 0.3 && b.active >= 1) { b.sweepTeleT = 0.8; Audio2.jingle('step'); }
      else { const P = [[9, 6], [16, 5], [23, 6], [12, 8], [20, 8]][(Math.random() * 5) | 0]; b.tx = P[0] * 16 + 8; b.ty = P[1] * 16 + 8; }
    }
    if (b.tx) { b.x += (b.tx - b.x) * 1.5 * dt; b.y += (b.ty - b.y) * 1.5 * dt; }
  }
  b.x = clamp(b.x, 6 * 16, 26 * 16); b.y = clamp(b.y, 4 * 16, 9 * 16);
  const head = heads[b.active], hx = b.x, hy = b.y + 18;            // the active head presents at the front
  if (b._announced !== b.active) { b._announced = b.active; Audio2.jingle('key'); }   // the pinned hint bar (22b) carries the text now
  head._cool = Math.max(0, (head._cool || 0) - dt);
  // SLAM: telegraph, then a body-radius shockwave (attack then back off)
  b.slamT = (b.slamT || 0) + dt;
  b.slamTele = b.slamT > 3.0;
  if (b.slamT > 3.5) { b.slamTele = false; b.slamT = 0; if (Player.inv <= 0 && dist(Player.x, Player.y, b.x, b.y + 10) < 46) { Player.hurt(1); Particles.burst(Player.x, Player.y, 'dust'); } Audio2.jingle('rumble'); }
  // the head's WEAKNESS (use the right tool, near the front head)
  let hit = false;                                    // the presenting head is BIG: generous windows
  if (head.weak === 'net' && Player.netT > 0 && dist(Player.x, Player.y, hx, hy) < 36) hit = true;
  else if (head.weak === 'ram' && Player.lungeT > 0 && dist(Player.x, Player.y, hx, hy) < 36) hit = true;
  else if (head.weak === 'ramsi' && Game.companion && Game.companionActive && Game.companionActive() && dist(Game.companion.x, Game.companion.y, hx, hy) < 32) hit = true;
  else if (head.weak === 'harpoon' && Player.harpoon && dist(Player.harpoon.x, Player.harpoon.y, hx, hy) < 28) { hit = true; Player.harpoon = null; }
  else if (head.weak === 'bone' && Player.bone && dist(Player.bone.x, Player.bone.y, hx, hy) < 28) hit = true;
  if (hit && head._cool <= 0) {
    head.hp -= 1; head._cool = 0.6; Audio2.jingle('hit'); Particles.burst(hx, hy - 4, 'sparkle');
    if (head.hp <= 0) {
      head.down = true; b.active++; Audio2.jingle('cage'); Particles.burst(hx, hy, 'confetti');
      const nxt = heads[b.active];
      Game.banner('The ' + head.name + ' head is OUT! (' + b.active + '/' + heads.length + ')' + (nxt ? '  Next -> ' + nxt.name : '  -> THE CORE!'));
    } else Game.banner(head.name + ' head REELS — hit it once more!');
  }
};

Bosses.drawGnashara = function (c, b) {
  c.fillStyle = '#39304e'; c.beginPath(); c.ellipse(0, -6, 48, 30, 0, 0, 7); c.fill();           // fused body
  c.fillStyle = '#2a2240'; c.beginPath(); c.ellipse(0, 6, 46, 20, 0, 0, 7); c.fill();
  c.fillStyle = '#1f1830'; for (let g = 0; g < 5; g++) { c.beginPath(); c.arc(-36 + g * 18, 8, 5, 0, 7); c.fill(); }
  const arc = [[-44, -14], [-22, -22], [0, -26], [22, -22], [44, -14]];                          // heads on the shoulders
  for (let i = 0; i < b.heads.length; i++) {
    const h = b.heads[i], spr = Sprites[h.sprite], a = arc[i] || [0, -20];
    c.save(); c.translate(a[0], a[1]);
    if (h.down) { c.globalAlpha = 0.35; c.rotate(0.6); } else if (i !== b.active) c.globalAlpha = 0.8;
    if (spr) { c.scale(0.7, 0.7); dspr(c, spr, -sprW(spr) / 2, -sprH(spr) / 2); } else { c.fillStyle = h.down ? '#555' : '#a4445a'; c.fillRect(-7, -7, 14, 14); }
    c.restore();
  }
  if (b.active < b.heads.length) {                                                               // active head presents at the front
    const spr = Sprites[b.heads[b.active].sprite];
    c.save(); c.translate(0, 18 + Math.sin(b.t * 4) * 2);
    c.fillStyle = 'rgba(255,220,120,' + (0.25 + 0.2 * Math.sin(b.t * 7)).toFixed(2) + ')'; c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fill();
    if (spr) dspr(c, spr, -sprW(spr) / 2, -sprH(spr) / 2);
    c.restore();
  } else { c.fillStyle = 'rgba(150,220,255,.9)'; c.beginPath(); c.arc(0, 4, 9 + Math.sin(b.t * 6) * 2, 0, 7); c.fill(); }
  if (b.slamTele) { c.strokeStyle = 'rgba(255,90,90,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 10, 46, 0, 7); c.stroke(); c.lineWidth = 1; }
  if (b.sweepTeleT > 0) { const dx = Player.x > b.x ? 1 : -1; c.strokeStyle = 'rgba(255,200,90,.9)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(dx * 50, 8); c.lineTo(dx * 78, 8); c.lineTo(dx * 68, 0); c.moveTo(dx * 78, 8); c.lineTo(dx * 68, 16); c.stroke(); c.lineWidth = 1; }
};

Bosses.finalizeGnashara = function (b) {
  Game.flags.gnashara = true;
  Audio2.jingle('bosswin');
  Game.banner('GNASHARA FALLS! A stair of cloud rises to GRIMSPIRE KEEP. Step into the light!');
  saveGame();
  // the FOURTH star-cell — this collect fires the star cutscene, and at 4/4 the
  // SUPER RAMSI transformation beats play right after (22c appends them)
  if (Game.collectStarcell) Game.collectStarcell({ id: 'sc_cog4' });
};

function drawSuperRamsiScene(c, t) {
  const cx = SW / 2, cy = SH * 0.4;
  for (let i = 0; i < 22; i++) { const a = t + i * 0.29, r = 38 + 34 * Math.abs(Math.sin(t * 2 + i)); c.fillStyle = 'rgba(248,208,72,' + (0.3 * Math.abs(Math.sin(t + i))).toFixed(2) + ')'; c.fillRect((cx + Math.cos(a) * r) | 0, (cy + Math.sin(a) * r) | 0, 3, 3); }
  const sr = (typeof Sprites !== 'undefined' && Sprites.ramsiSuper) ? Sprites.ramsiSuper : null;
  if (sr) { const s = 4 + 0.3 * Math.sin(t * 4); c.save(); c.translate(cx, cy); try { c.drawImage(sr, -sr.width * s / 2, -sr.height * s / 2, sr.width * s, sr.height * s); } catch (e) {} c.restore(); }
  else { c.fillStyle = '#f8d048'; c.beginPath(); c.arc(cx, cy, 22, 0, 7); c.fill(); }
}
Game.GNASHARA_ENDING = [
  { title: 'SUPER RAMSI!', text: 'The star-cells fuse — RAMSI blazes into his SUPER form and fires a beam of star-light into the All-Beast’s core!', draw: drawSuperRamsiScene },
  { title: 'THE BEAST FALLS', text: 'GNASHARA comes apart in a shower of gears and light; every fused foe scatters back into the world, free at last.', draw: drawSuperRamsiScene },
  { title: 'HERO OF COGWERK CITY', text: 'Noah and Super Ramsi stand atop the quiet skyline as dawn breaks over the clockwork city. THE END.', draw: drawSuperRamsiScene },
];
