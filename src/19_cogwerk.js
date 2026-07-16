"use strict";
// ===================== WORLD 3 — COGWERK CITY (Level 1) =====================
// A strictly LINEAR two-stage level (no dead-ends, no skips, no side-steps, no stuck):
//   STAGE 1 — THE PLAZA: clear every haywire critter (catching!), then SOCKET the
//             master-gear at the Clocktower base to start it turning.
//   STAGE 2 — THE CLIMB: a vertical stack of full-width, skill-gated ledges —
//             BOUNCE up -> GLIDE the steam-gap -> SHRINK a vent -> ROLL a barricade
//             -> POUND the plate -> STAR-CELL + the PIPE down to Level 2.
// Every gate spans the FULL width with exactly one skill-opening, so the only way
// on is the intended skill; the only soft/rollable tile is the roll-gate itself.

(function buildCogwerkCity() {
  if (typeof newMap !== 'function' || MAPS.cog1) return;
  const m = newMap('cog1', 52, 44, 'cogfloor', { name: 'Cogwerk City', song: 'canyon', cliff: 'stone', zone: 'city', noFly: true });
  m.custom = true;
  m.viewScale = 0.75;                                              // pull the camera back so the full tower is framed by wide sunset sky
  const wall = (x, y, w, h, e) => R(m, x, y, w, h, 'gearwall', e);
  const gear = (x, y, r, dir, speed, dx, dy) => OBJ(m, { type: 'gear', x, y, r, dir, speed, dx: dx || 0, dy: dy || 0 });

  // ===== THE CLOCK-TOWER rises from the city into an open SUNSET SKY =====
  // plaza walls + a full-width PARAPET that caps the city; the slender tower climbs ABOVE it into the sky
  wall(0, 28, 1, 16); wall(51, 28, 1, 16); wall(0, 43, 52, 1);
  const twall = (x, y, w, h, e) => R(m, x, y, w, h, 'towerwall', e);   // ornate brass clock-tower masonry
  twall(0, 26, 52, 2);                                              // city-top parapet (ceiling of the plaza)
  for (let yy = 0; yy < 26; yy++) for (let xx = 0; xx < 52; xx++) if (xx < 16 || xx > 37) m.tiles[yy][xx] = 'sky';
  twall(15, 0, 1, 26); twall(38, 0, 1, 26);                         // the tower's two outer walls (sky beyond, no border)
  R(m, 16, 0, 22, 2, 'towergear');                                              // the tower crown (under the clock)
  m._skyHorizon = 26; m._sun = { x: 7, y: 6 };
  OBJ(m, { type: 'decor', sprite: 'spire', x: 26, y: 1 });
  OBJ(m, { type: 'decor', sprite: 'towercolumn', x: 17, y: 7 }); OBJ(m, { type: 'decor', sprite: 'towercolumn2', x: 36, y: 7 });
  OBJ(m, { type: 'decor', sprite: 'towerwindow', x: 18, y: 15 }); OBJ(m, { type: 'decor', sprite: 'towerwindow', x: 35, y: 19 });
  OBJ(m, { type: 'decor', sprite: 'airship', x: 8, y: 4 }); OBJ(m, { type: 'decor', sprite: 'birds', x: 42, y: 5 });
  OBJ(m, { type: 'decor', sprite: 'cloudbig', x: 6, y: 11 }); OBJ(m, { type: 'decor', sprite: 'cloudsmall', x: 45, y: 9 });
  OBJ(m, { type: 'decor', sprite: 'cloudsmall', x: 10, y: 20 }); OBJ(m, { type: 'decor', sprite: 'cloudbig', x: 43, y: 22 });
  OBJ(m, { type: 'clock', x: 26, y: 4, r: 42 });                   // the GREAT CLOCK at the tower's crown

  // =================== STAGE 2: THE CLIMB (skill gates up the narrow tower, bottom -> top) ===================
  // the BOUNCE is the ONLY way up off the parapet, gated on cog_started
  T(m, 26, 28, 'bouncecap');
  OBJ(m, { type: 'bouncepad', x: 26, y: 28, to: [26, 24], req: 'cog_started', msg: 'BOING! RAMSI springs Noah up the Clocktower!' });
  OBJ(m, { type: 'gearsocket', x: 23, y: 28 });
  SIGN(m, 20, 28, 'CLOCKTOWER START — SOCKET the master-gear (left), then BOUNCE up (right).');

  // ----- LEDGE 1 (y23..25) -> GLIDE across the steam-gap (LEFT) -----
  CHEST(m, 33, 24, { coins: 20 }); gear(18, 24, 4, 1, 0.6); gear(35, 24, 4, -1, 0.8);
  SIGN(m, 25, 24, 'LEDGE 1 — go LEFT to the steam-gap, then press C to GLIDE up.');
  R(m, 16, 20, 22, 3, 'chasm'); for (let sx = 16; sx < 38; sx++) { T(m, sx, 19, 'steam'); T(m, sx, 23, 'steam'); }
  OBJ(m, { type: 'glidevent', x: 19, y: 23, to: [19, 18], msg: 'RAMSI puffs up and GLIDES Noah across the steam-gap!' });
  gear(22, 21, 5, -1, 0.7); gear(31, 21, 5, 1, 0.9);

  // ----- LEDGE 2 (y17..19) -> SHRINK through the clamped vent (RIGHT) -----
  SIGN(m, 27, 18, 'LEDGE 2 — go RIGHT to the clamped vent; press C so RAMSI SHRINKS through to unlatch the gate.');
  twall(16, 16, 22, 1); T(m, 34, 16, 'holegap'); DOOR(m, 35, 16, 'flag', 'cog_grate', 'A clamped service grate.');
  OBJ(m, { type: 'ramhole', x: 34, y: 17, flag: 'cog_grate', compOnly: true, msg: 'RAMSI shrinks through and unlatches the grate!' });

  // ----- LEDGE 3 (y13..15) -> ROLL the rusted barricade (LEFT) -----
  CHEST(m, 33, 14, { gems: 4 }); gear(18, 14, 4, 1, 0.8);
  SIGN(m, 26, 14, 'LEDGE 3 — go LEFT to the rusted barricade. Face it and ROLL through (C).');
  twall(16, 12, 22, 1); T(m, 20, 12, 'softblock');

  // ----- LEDGE 4 (y9..11) -> POUND the vault plate (RIGHT) -----
  SIGN(m, 27, 10, 'LEDGE 4 — go RIGHT to the vault plate. GROUND-POUND it (C)!');
  OBJ(m, { type: 'poundplate', x: 34, y: 10, flag: 'cog_vault', msg: 'WHAM! The pound cracks the STAR-CELL vault open!' });
  gear(18, 10, 4, -1, 0.6); gear(31, 10, 4, 1, 0.7);
  twall(16, 8, 22, 1); DOOR(m, 34, 8, 'flag', 'cog_vault', 'A vault sealed by a great gear-plate.');

  // ----- THE VAULT (y2..7): the STAR in front of the great clock + the pipe down to Level 2 -----
  OBJ(m, { type: 'starcell', x: 26, y: 6, id: 'sc_cog1' });
  CHEST(m, 33, 7, { coins: 30 });
  OBJ(m, { type: 'portal', x: 29, y: 6, to: 'cog2', tx: 17, ty: 1 });   // the PIPE down — enter cog2 at the TOP source
  OBJ(m, { type: 'portal', x: 23, y: 6, to: 'world3map', secret: true, req: 'sc_cog1' });   // post-star EXIT to the overview map
  SIGN(m, 26, 7, 'STAR-CELL claimed! A great PIPE plunges down to THE PIPEWORKS. (Step in)');
  gear(18, 6, 4, 1, 0.5); gear(35, 6, 4, -1, 0.5);

  // =================== STAGE 1: THE PLAZA (clear the pests; socket the gear) ===================
  wall(23, 33, 5, 4, 1);                                   // central flywheel base
  gear(24, 33, 11, 1, 0.5, 4, -2); gear(27, 35, 8, -1, 0.7, 0, -2);
  for (const s of [[22, 32], [28, 32], [22, 37], [28, 37]]) T(m, s[0], s[1], 'steam');
  wall(2, 29, 4, 4, 1); wall(46, 29, 4, 4, 1); wall(2, 39, 4, 3, 1); wall(46, 39, 4, 3, 1);
  gear(3, 29, 6, 1, 0.6, 0, -3); gear(48, 29, 6, -1, 0.5, 0, -3);
  for (const p of [[14, 38, 4], [37, 37, 5], [10, 40, 3], [41, 40, 3]]) R(m, p[0], p[1], 1, p[2], 'pipe');
  for (const c of [[12, 31], [39, 31], [18, 30], [34, 30]]) T(m, c[0], c[1], 'cog');
  for (const s of [[9, 36], [43, 36], [19, 32], [33, 36], [16, 41]]) T(m, s[0], s[1], 'steam');
  NPC(m, 10, 37, 'supreme_trader', 'Supreme Trader').bigArt = 'trader';
  m.objects[m.objects.length - 1].big = 66;
  SIGN(m, 14, 38, 'WELCOME TO COGWERK CITY! Talk to the SUPREME TRADER (SPACE). CLEAR the haywire critters, then SOCKET the master-gear by the Clocktower bounce-pad.');
  SPAWN(m, 'sheep', 16, 40, 18, 2, 3);
  m.start = { x: 13, y: 40 };

  // ---- pests (guaranteed-walkable placement) + the pound sentinels ----
  m.onLoad = function (G) {
    if (!G.lookupFlag('cog_vault')) for (const s of [[33, 10], [35, 10]]) { const c = makeCreature('crab', s[0], s[1], { x: 16, y: 9, w: 22, h: 3 }); c.display = true; G.creatures.push(c); }
    if (!G.lookupFlag('cog_cleared')) {
      const home = { x: 1, y: 28, w: 50, h: 14 };
      const roster = [['voltbug', 8, 31], ['voltbug', 42, 31], ['voltbug', 25, 42], ['sparkdrone', 14, 33], ['sparkdrone', 35, 33],
        ['coghopper', 9, 42], ['coghopper', 43, 42], ['coghopper', 20, 30], ['rustbeetle', 7, 35], ['rustbeetle', 44, 42], ['steambull', 18, 42], ['steambull', 30, 42]];
      for (const r of roster) {
        let bx = r[1], by = r[2], ok = false;
        for (let rad = 0; rad <= 6 && !ok; rad++) for (let dy = -rad; dy <= rad && !ok; dy++) for (let dx = -rad; dx <= rad && !ok; dx++) {
          const ti = r[1] + dx, tj = r[2] + dy;
          if (tj >= 29 && tj <= 42 && ti >= 1 && ti <= 49 && creatureWalkable(G.map, { species: r[0] }, ti, tj)) { bx = ti; by = tj; ok = true; }
        }
        G.creatures.push(makeCreature(r[0], bx, by, home));
      }
    }
  };
})();

// ---- the CLOCKWORK GATE in the Vale -> Cogwerk City (opens once Ramsi is your companion) ----
Game.addCogwerkEntrance = function () {
  const m = MAPS.vale; if (!m || m._cogGate) return; m._cogGate = true;
  OBJ(m, { type: 'portal', x: 30, y: 18, to: 'cog1', tx: 13, ty: 40, req: 'ramsi', plain: true });   // plain: the coggate art draws the look
  OBJ(m, { type: 'coggate', x: 30, y: 18, req: 'ramsi' });
  SIGN(m, 31, 19, 'The great BRASS CLOCKWORK GATE hums here — it swings open to COGWERK CITY once RAMSI walks at your side. (Step in!)');
};
// ---- a distinct BRASS CLOCKWORK archway (so it never looks like the earthy burrow) ----
Game.OBJDRAW = Game.OBJDRAW || {};
Game.OBJDRAW.coggate = function (c, o, ox, oy) {
  const t = Game.time, open = !o.req || Game.lookupFlag(o.req);
  const cx = ox + 8, base = oy + 14;
  // two brass pillars
  for (const sx of [-16, 16]) {
    c.fillStyle = '#8a6a2c'; c.fillRect(cx + sx - 5, base - 34, 10, 34);
    c.fillStyle = '#c8a04c'; c.fillRect(cx + sx - 5, base - 34, 4, 34);
    c.fillStyle = '#5a4420'; c.fillRect(cx + sx - 5, base - 4, 10, 4);
    // rivets
    c.fillStyle = '#e8c060'; for (let k = 0; k < 4; k++) c.fillRect(cx + sx - 1, base - 30 + k * 8, 2, 2);
  }
  // arched brass lintel
  c.strokeStyle = '#c8a04c'; c.lineWidth = 6; c.beginPath(); c.arc(cx, base - 34, 20, Math.PI, 0); c.stroke();
  c.strokeStyle = '#8a6a2c'; c.lineWidth = 2; c.beginPath(); c.arc(cx, base - 34, 20, Math.PI, 0); c.stroke(); c.lineWidth = 1;
  // big turning gears in the arch
  const gear = (gx, gy, r, spd, col) => {
    c.save(); c.translate(gx, gy); c.rotate(t * spd);
    c.fillStyle = col; for (let k = 0; k < 8; k++) { c.save(); c.rotate(k * Math.PI / 4); c.fillRect(-1.6, -r - 2.5, 3.2, 4); c.restore(); }
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.fillStyle = '#5a4420'; c.beginPath(); c.arc(0, 0, r * 0.4, 0, 7); c.fill(); c.restore();
  };
  gear(cx - 8, base - 30, 6, open ? 1.6 : 0.2, '#e8c060');
  gear(cx + 9, base - 26, 5, open ? -2.0 : -0.25, '#c8a04c');
  // a little clock face at the keystone
  c.fillStyle = '#241a33'; c.beginPath(); c.arc(cx, base - 44, 6, 0, 7); c.fill();
  c.fillStyle = '#f0e0c8'; c.beginPath(); c.arc(cx, base - 44, 4.6, 0, 7); c.fill();
  c.strokeStyle = '#241a33'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(cx, base - 44); c.lineTo(cx + Math.cos(t) * 3, base - 44 + Math.sin(t) * 3); c.stroke();
  c.beginPath(); c.moveTo(cx, base - 44); c.lineTo(cx + Math.cos(t * 0.4) * 2, base - 44 + Math.sin(t * 0.4) * 2); c.stroke();
  // the doorway: glowing brass when open, barred when locked
  if (open) {
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(248,208,72,' + (0.16 + 0.08 * Math.sin(t * 2.5)).toFixed(2) + ')';
    c.beginPath(); c.ellipse(cx, base - 12, 12, 16, 0, 0, 7); c.fill(); c.restore();
    // puffs of steam
    for (let k = 0; k < 3; k++) { const sy = base - 30 - ((t * 12 + k * 9) % 26); c.fillStyle = 'rgba(230,230,240,' + (0.4 - ((t * 12 + k * 9) % 26) / 70).toFixed(2) + ')'; c.beginPath(); c.arc(cx + 14 + Math.sin(t + k) * 2, sy, 2 + k, 0, 7); c.fill(); }
  } else {
    c.fillStyle = '#3a2c50'; c.fillRect(cx - 11, base - 30, 22, 28);
    c.strokeStyle = '#5a4420'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(cx - 8 + k * 8, base - 30); c.lineTo(cx - 8 + k * 8, base - 2); c.stroke(); } c.lineWidth = 1;
  }
  if (dist(Player.x, Player.y, cx, oy + 8) < 30) drawText(c, open ? 'COGWERK CITY' : 'needs RAMSI', cx, oy - 20, 6, open ? '#f8d048' : '#f89238', '#241a33', 'center');
};
if (typeof MAPS !== 'undefined' && MAPS.vale && Game.addCogwerkEntrance) Game.addCogwerkEntrance();

// ===================== STAR-CELL celebration cutscene (Cogwerk series) =====================
function drawStarGet(c, t, who) {
  const cx = SW / 2, cy = SH * 0.34;
  const pulse = 1 + 0.08 * Math.sin(t * 4);
  const SP = (typeof Sprites !== 'undefined') ? Sprites : null;
  if (SP && SP.fx && SP.fx.starburst && SP.items && SP.items.starcell) {       // HD star art
    const burst = SP.fx.starburst, bs = 3.4 + 0.3 * Math.sin(t * 3);
    c.save(); c.translate(cx, cy); c.rotate(t * 0.3);
    try { c.drawImage(burst, -burst.width * bs / 2, -burst.height * bs / 2, burst.width * bs, burst.height * bs); } catch (e) {}
    c.restore();
    const star = SP.items.starcell, ss = 3.0 * pulse;
    c.save(); c.translate(cx, cy); c.rotate(0.05 * Math.sin(t));
    try { c.drawImage(star, -star.width * ss / 2, -star.height * ss / 2, star.width * ss, star.height * ss); } catch (e) {}
    c.restore();
  } else {
    for (let i = 0; i < 16; i++) {                                              // procedural fallback
      const a = t * 0.7 + i * Math.PI / 8, r1 = 16, r2 = 58 + 10 * Math.sin(t * 3 + i);
      c.strokeStyle = 'rgba(248,208,72,' + (0.08 + 0.06 * (0.5 + 0.5 * Math.sin(t * 2 + i))).toFixed(3) + ')'; c.lineWidth = 7;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); c.stroke();
    }
    c.lineWidth = 1;
    c.save(); c.translate(cx, cy); c.scale(pulse, pulse); c.rotate(0.05 * Math.sin(t));
    c.fillStyle = 'rgba(120,210,255,.25)'; c.beginPath(); c.arc(0, 0, 30, 0, 7); c.fill();
    const pts = [[0, -26], [7, -7], [26, 0], [7, 7], [0, 26], [-7, 7], [-26, 0], [-7, -7]];
    c.fillStyle = '#bfe9ff'; c.beginPath(); for (const pp of pts) c.lineTo(pp[0], pp[1]); c.closePath(); c.fill();
    c.fillStyle = '#7fd0ff'; c.beginPath(); for (const pp of pts) c.lineTo(pp[0] * 0.55, pp[1] * 0.55); c.closePath(); c.fill();
    c.fillStyle = '#f8d048'; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.fill();
    for (let g = 0; g < 8; g++) { const ga = g * Math.PI / 4; c.fillRect(Math.cos(ga) * 7 - 1, Math.sin(ga) * 7 - 1, 2, 2); }
    c.restore();
  }
  if (SP && SP.props && SP.props.ribbon) {                          // a little banner with the count
    const rb = SP.props.ribbon, rs = 2.2, rw = rb.width * rs, rh = rb.height * rs;
    try { c.drawImage(rb, cx - rw / 2, cy + 40, rw, rh); } catch (e) {}
    drawText(c, (Game.starcellCount ? Game.starcellCount() : 0) + ' / 4', cx, cy + 40 + rh / 2 - 4, 9, '#f8d048', '#241a33', 'center');
  }
  for (let i = 0; i < 26; i++) {                                   // sparkles
    const a = hash2(i, 3) * 7 + t * (0.4 + hash2(i, 9)), r = 42 + hash2(i, 5) * 80;
    const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r * 0.7, tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 2);
    c.fillStyle = 'rgba(255,255,255,' + (0.35 * tw).toFixed(2) + ')'; c.fillRect(sx | 0, sy | 0, 2, 2);
  }
  // the heroes + the level's CHARACTER cheering on a ledge — REAL pixel art
  const gy = SH * 0.685, FS = 2.0;
  c.fillStyle = '#241a33'; c.fillRect(cx - 94, gy + 2, 188, 16);
  c.fillStyle = '#2e2448'; c.fillRect(cx - 94, gy, 188, 3);
  const fig = (spr, fx, bob) => { if (!spr) return; c.save(); c.translate(fx, gy + 2 + (bob || 0)); c.scale(FS, FS); try { dspr(c, spr, -sprW(spr) / 2, -sprH(spr)); } catch (e) {} c.restore(); };
  fig(SP && SP.noah && SP.noah.down ? SP.noah.down[(t * 4 | 0) % 2] : null, cx - 42, Math.sin(t * 5) * 2);                // NOAH
  fig(SP && SP.ramsi ? SP.ramsi : null, cx - 12, Math.sin(t * 5 + 1) * 2);                                               // RAMSI
  let cw = null;
  if (SP) { if (who === 'lady') cw = SP.npcs && SP.npcs.lady; else if (who === 'trader') cw = SP.npcs && SP.npcs.trader; else if (who === 'blazagon') cw = SP.creatures && SP.creatures.blazagon && SP.creatures.blazagon.left[0]; }
  fig(cw, cx + 42, Math.sin(t * 4 + 2) * 2);                                                                             // the level character
}
Game.STAR_CUTSCENE = function (n, who) {
  const last = n >= 4;
  return [
    { title: 'A STAR-CELL BLAZES TO LIFE!', text: 'Noah lifts the CLOCKWORK STAR-CELL high — its light pours across COGWERK CITY! (' + n + ' of 4)', draw: (c, t) => drawStarGet(c, t, who) },
    last
      ? { title: "RAMSI'S SUPER-FORM AWAITS", text: "All FOUR star-cells gathered! Carry them to the SUPREME TRADER and unleash RAMSI's SUPER-FORM!", draw: (c, t) => drawStarGet(c, t, who) }
      : { title: 'ONE STEP CLOSER', text: 'Another machine-heart of the city beats again. ' + (4 - n) + ' star-cell' + (4 - n > 1 ? 's' : '') + ' still hidden in the clockwork — onward!', draw: (c, t) => drawStarGet(c, t, who) },
  ];
};
