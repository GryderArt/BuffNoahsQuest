"use strict";
// ================= WORLD 2 — SKYWARD ASCENT =================
// After Ramsi is freed he JOINS Noah. Four floating sky-realms rise to the
// Storm Citadel where Noah's parents (BERKLEY & MEGAN) are caged. New toys:
//  - RAM SUIT: lunge (Z) into CRACKED walls to smash through (barriers + secrets).
//  - RAMSI the companion: auto-follows, headbutts boss SHIELDS & sky-switches,
//    and (as he learns) stuns sky-critters and shields Noah from a hit.

// ---- the four co-op sky bosses (one shared pattern, four flavors) ----
// Ramsi headbutts to drop the shield; while it's down, Noah lands hits with `tool`.
const SKY_BOSS = {
  gustwing:  { title: 'THE GUST WING', sprite: 'condor', armor: 3, hitR: 26, tool: 'net',     toolName: 'NET (Z)',         spd: 0.9, rangeX: 52, rangeY: 16, gives: 'ramStun',
    wake: 'THE GUST WING shrieks! Too quick to net — let RAMSI HEADBUTT it, THEN swing!' },
  pufflord:  { title: 'THE PUFF LORD', sprite: 'sheep',  armor: 3, hitR: 28, tool: 'mitts',   toolName: 'GRAB (Z)',        spd: 0.6, rangeX: 40, rangeY: 24, gives: 'ramShield',
    wake: 'THE PUFF LORD billows up! Its cloud-armor only pops after RAMSI rams it — then GRAB!' },
  sparkhorn: { title: 'SPARKHORN',     sprite: 'ram',    armor: 4, hitR: 26, tool: 'harpoon', toolName: 'HARPOON (Z)',     spd: 1.1, rangeX: 48, rangeY: 14, gives: 'ramBoost',
    wake: 'SPARKHORN crackles with lightning! RAMSI grounds it with a headbutt — then HARPOON the brute!' },
  tempestia: { title: 'THE STORM-LORD', sprite: 'dragon', armor: 5, hitR: 32, tool: 'bone',   toolName: 'BOOMER-BONE (Z)', spd: 0.8, rangeX: 54, rangeY: 20, gives: null,
    wake: 'THE STORM-LORD roars: "Your parents are MINE!" RAMSI breaks the storm-shield — BONE it down!' },
};
const SKY_TINT = { gustwing: 'rgba(120,200,255,.30)', pufflord: 'rgba(220,180,255,.28)', sparkhorn: 'rgba(255,230,120,.30)', tempestia: 'rgba(170,90,230,.34)' };

// ---- boss behaviour (added to the Bosses module) ----
Bosses.up_skyboss = function (b, dt) {
  const p = Player, cfg = b.cfg;
  if (b.inv > 0) b.inv -= dt;
  if (b.shieldT > 0) b.shieldT -= dt;
  if (b.stun > 0) b.stun -= dt;
  const lean = clamp((p.x - b.hx) / 80, -1, 1);
  b.x = b.hx + Math.cos(b.t * cfg.spd) * cfg.rangeX + lean * 10;
  b.y = b.hy + Math.sin(b.t * cfg.spd * 1.3) * cfg.rangeY;
  if (b.shieldT > 0) {
    // VULNERABLE window (Ramsi cracked the shield) — Noah lands hits with the level's tool
    if (this.skyHit(b)) {
      b.hits++; b.inv = 0.7;
      Audio2.jingle('capture'); Particles.burst(b.x, b.y - 12, 'confetti');
      if (b.hits >= b.armor) { this.catchBoss(b); return; }
      Game.banner('HIT! ' + cfg.title + '  (' + b.hits + '/' + b.armor + ') — keep RAMSI on it!');
    }
  } else if (this.skyHit(b)) {
    if (Game.time - (b.clinkT || 0) > 1) { b.clinkT = Game.time; Game.toast(cfg.title + ' is SHIELDED — let RAMSI headbutt it first!'); }
    b.inv = 0.4;
  }
  if (Player.inv <= 0 && b.stun <= 0 && dist(p.x, p.y, b.x, b.y) < 14) Player.hurt(1);
};
Bosses.skyHit = function (b) {
  if (b.inv > 0) return false;
  const p = Player, near = dist(p.x, p.y, b.x, b.y), t = b.cfg.tool;
  const R = (b.cfg && b.cfg.hitR) || 22;                 // big bosses are big targets — hit them ANYWHERE
  if (t === 'mitts') return p.lungeT > 0 && near < R;
  if (t === 'net') return (p.netT > 0 && near < R + 2) || (Game.flyingNets || []).some(n => dist(n.x, n.y, b.x, b.y) < R - 4);
  if (t === 'harpoon') return !!p.harpoon && dist(p.harpoon.x, p.harpoon.y, b.x, b.y) < R - 4;
  if (t === 'bone') return !!p.bone && dist(p.bone.x, p.bone.y, b.x, b.y) < R - 4;
  return false;
};
Bosses.drawSkyBoss = function (c, b) {
  const ov = Sprites[b.name];                       // dedicated boss art, if the player made it
  const set = Sprites.creatures[b.cfg.sprite];
  const spr = ov || (Player.x > b.x ? set.right : set.left)[(b.t * 3 | 0) % 2];
  const sc = ov ? 1 : 2.4;
  c.save();
  if (b.stun > 0) c.rotate(Math.sin(b.t * 12) * 0.1);
  if (ov && Player.x < b.x) c.scale(-sc, sc); else c.scale(sc, sc);
  dspr(c, spr, -sprW(spr) / 2, -sprH(spr));
  c.restore();
  c.save(); c.globalAlpha = 0.5; c.fillStyle = SKY_TINT[b.name] || 'rgba(255,255,255,.2)';
  c.beginPath(); c.arc(0, -sprH(spr) * sc / 2, sprW(spr) * sc * 0.5, 0, 7); c.fill(); c.restore();
  if (b.shieldT <= 0) {     // SHIELD bubble when armored
    c.strokeStyle = 'rgba(140,220,255,' + (0.5 + 0.3 * Math.sin(b.t * 6)) + ')'; c.lineWidth = 2;
    c.beginPath(); c.arc(0, -sprH(spr) * sc / 2, sprW(spr) * sc * 0.62, 0, 7); c.stroke(); c.lineWidth = 1;
  }
  const top = -sprH(spr) * sc - 8;   // armor pips
  for (let k = 0; k < b.armor; k++) { c.fillStyle = k < (b.armor - b.hits) ? '#e84a4a' : '#3a2c50'; c.beginPath(); c.arc(-(b.armor - 1) * 6 + k * 12, top, 4, 0, 7); c.fill(); c.strokeStyle = '#241a33'; c.stroke(); }
};
Bosses.finalizeSky = function (b) {
  const F = Game.flags;
  F[b.name] = true;
  if (b.cfg.gives) F[b.cfg.gives] = true;
  Game.giveLoot({ heartC: 1 });
  const learn = { ramStun: ' RAMSI learns the CHARGE — he stuns sky-critters now!',
    ramShield: ' RAMSI learns to GUARD — he blocks a hit for you now!',
    ramBoost: ' RAMSI\'s headbutts grow MIGHTIER (longer shield-break)!' }[b.cfg.gives] || '';
  if (b.name === 'tempestia') Game.banner('THE STORM-LORD FALLS! The storm-cage cracks — climb up and free BERKLEY & MEGAN! (SPACE)');
  else Game.banner(b.cfg.title + ' CAUGHT! A SKY-PORTAL opens onward.' + learn);
};

// ---- RAMSI, the companion ----
Game.companion = { x: 0, y: 0, dir: 'right', t: 0, map: null, headCool: 0, shield: 0, shieldCool: 0, charge: 0 };
Game.companionActive = function () { return !!(this.flags.ramsi && this.map && (this.map.zone === 'sky' || this.map.zone === 'burrow' || this.map.zone === 'city')); };
Game.updateCompanion = function (dt) {
  if (!this.companionActive()) return;
  const comp = this.companion, p = Player;
  comp.t += dt;
  if (comp.map !== this.mapId) { comp.map = this.mapId; comp.x = p.x - 14; comp.y = p.y + 6; comp.headCool = 0; comp.flyTo = null; }
  if (comp.flyTo) {                                            // the WHEEE catch-up flight (spins through the air to Noah)
    const f = comp.flyTo; f.t += dt / f.dur; const u = Math.min(1, f.t);
    comp.x = lerp(f.x0, p.x - 10, u);
    comp.y = lerp(f.y0, p.y + 4, u) - Math.sin(u * Math.PI) * 44;
    comp.flySpin = (comp.flySpin || 0) + dt * 24;
    if (((f.t * 12) | 0) % 2) Particles.burst(comp.x, comp.y, 'sparkle');
    if (f.t >= 1) { comp.flyTo = null; comp.flySpin = 0; comp.x = p.x - 12; comp.y = p.y + 6; Particles.burst(comp.x, comp.y, 'dust'); }
    return;                                                    // nothing else while airborne
  }
  comp.headCool -= dt; comp.charge -= dt; comp.shieldCool -= dt;
  if (this.flags.ramShield && comp.shield <= 0 && comp.shieldCool <= 0) comp.shield = 1;   // recharge guard
  // FOLLOW Noah (springy trail)
  const d = dist(comp.x, comp.y, p.x, p.y);
  if (d > 13 && !(comp.busyT > 0)) { const s = Math.min(d - 12, (95 + (this.flags.ramBoost ? 30 : 0)) * dt); comp.x += (p.x - comp.x) / d * s; comp.y += (p.y - comp.y) / d * s; }
  if (Math.abs(p.x - comp.x) > 2) comp.dir = p.x < comp.x ? 'left' : 'right';
  // 1) headbutt a SHIELDED sky boss when Noah brings him near
  const b = this.boss;
  if (b && (b.sky || b.warden) && b.awake && this.flags.ramHead && b.shieldT <= 0 && comp.headCool <= 0 && dist(p.x, p.y, b.x, b.y) < 48) {
    comp.x = b.x; comp.y = b.y + 6; comp.charge = 0.35; comp.headCool = 0.6;
    b.shieldT = this.flags.ramBoost ? 4.0 : 3.0; b.stun = 0.8; b.inv = 0;
    Audio2.jingle('cage'); Particles.burst(b.x, b.y, 'sparkle');
    Game.banner("RAMSI HEADBUTTS — shield's down! Hit it with your " + (b.cfg.toolName || 'tool') + "!");
  }
  // 2) headbutt RAM-SWITCHES (gate kept on the flag so it survives reloads)
  for (const o of this.map.objects) {
    if (o.type === 'ramswitch' && this.flags.ramHead && !this.lookupFlag(o.flag) && dist(comp.x, comp.y, o.x * TILE + 8, o.y * TILE + 8) < 16) {
      this.flags[o.flag] = true; o.on = true;
      Audio2.jingle('door'); Particles.burst(o.x * TILE + 8, o.y * TILE + 8, 'sparkle');
      Game.banner(o.msg || 'RAMSI butts the SKY-SWITCH — something opens!'); saveGame();
    } else if (o.type === 'ramswitch' && this.lookupFlag(o.flag)) o.on = true;
  }
  // 3) CHARGE-stun roaming sky critters
  if (this.flags.ramStun) for (const cr of this.creatures) {
    if (cr.display) continue;                                   // pen friends are FAMILY — no charge-stun in the pens
    if (!(CREATURES[cr.species] || {}).dazeImmune && cr.state !== 'gone' && cr.state !== 'trapped' && cr.stun <= 0 && dist(comp.x, comp.y, cr.x, cr.y) < 14) {
      cr.stun = 3.5; Audio2.jingle('step'); Particles.burst(cr.x, cr.y - 6, 'sparkle');
    }
  }
  if (this.updateBurrowAbilities) this.updateBurrowAbilities(dt);   // World 2: Underburrow abilities
};
Game.drawCompanion = function (c) {
  const comp = this.companion, spr = Sprites.ramsi;
  if (this.map && this.map.underwater) {                       // UNDERWATER: Ramsi bobs inside a diving bell
    const bell = Sprites.props && Sprites.props.divingbell;
    const bx = Math.round(comp.x), by = Math.round(comp.y - 4 + Math.sin(comp.t * 2) * 2);
    const sr = (this.flags.colossus && Sprites.props && Sprites.props.sramsi1) ? Sprites.props.sramsi1 : spr;
    c.save(); c.translate(bx, by);
    c.fillStyle = 'rgba(10,40,64,.35)'; c.beginPath(); c.ellipse(0, 12, 12, 3, 0, 0, 7); c.fill();
    if (bell) {
      const bh = sprH(bell), bw = sprW(bell), rw = sprW(sr), rh = sprH(sr);
      const gy = -bh * 0.34;                                                           // the GLASS WINDOW centre (see-through chamber, measured from the art)
      // a DARK water-filled interior so pale Ramsi reads through the glass (dark fish show; a pale ram needs the backing)
      c.save(); c.fillStyle = 'rgba(6,26,42,.88)'; c.beginPath(); c.ellipse(0, gy, 7.5, 5.5, 0, 0, 7); c.fill(); c.restore();
      c.save(); c.translate(0, gy);                                                    // Ramsi rides INSIDE, BEHIND the glass (the dome sits in FRONT of him, like a fish seen through it)
      const rscale = Math.min(0.6, 11 / rh);
      c.scale(comp.dir === 'left' ? -rscale : rscale, rscale);
      dspr(c, sr, -rw / 2, -rh / 2); c.restore();
      dspr(c, bell, -bw / 2, -bh);                                                     // the glass bell OVER him
    } else {
      const scc = 0.62; c.save(); c.scale(scc, scc); dspr(c, sr, -sprW(sr) / 2, -sprH(sr) + 2); c.restore();   // the pet inside
      c.fillStyle = 'rgba(160,220,255,.28)'; c.beginPath(); c.arc(0, -4, 13, Math.PI, 0); c.fill();             // glass dome
      c.strokeStyle = '#c8a04c'; c.lineWidth = 2; c.beginPath(); c.arc(0, -4, 13, Math.PI, 0); c.stroke();
      c.fillStyle = '#c8a04c'; c.fillRect(-14, -4, 28, 3); c.fillStyle = '#8a6c2c'; c.fillRect(-4, -22, 8, 4);   // ring + top hook
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.4; c.beginPath(); c.arc(-4, -6, 6, Math.PI * 1.1, Math.PI * 1.5); c.stroke();
    }
    c.lineWidth = 1; c.restore();
    // rising bubbles from the bell
    if (((comp.t * 3 | 0) % 2) === 0) { c.fillStyle = 'rgba(200,230,255,.6)'; c.beginPath(); c.arc(bx + 8, by - 18 - ((comp.t * 20) % 24), 1.4, 0, 7); c.fill(); }
    if (this.flags.ramShield && comp.shield > 0) { c.strokeStyle = 'rgba(120,220,255,.5)'; c.beginPath(); c.arc(bx, by - 6, 15, 0, 7); c.stroke(); }
    return;
  }
  const _ce = elevAt(this.map, (comp.x / TILE) | 0, (comp.y / TILE) | 0);
  const eoff = _ce < 9 ? _ce * EOFF : 0;                      // ride the terraces like everyone else
  const bob = Math.sin(comp.t * 6) * 1.5 + (comp.charge > 0 ? -3 : 0), s = 0.7 * (comp.shrinkT > 0 ? 0.5 : 1) * (comp.glide > 0 ? 1.3 : 1);
  c.save();
  c.translate(Math.round(comp.x), Math.round(comp.y - eoff));
  c.fillStyle = 'rgba(20,10,40,.3)'; c.beginPath(); c.ellipse(0, 2, 7, 2.4, 0, 0, 7); c.fill();
  const puff = (comp.glide > 0 && Sprites.props && Sprites.props.glidepuff) ? Sprites.props.glidepuff : null;
  if (comp.glide > 0 && !puff) { c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.arc(0, -7, 11, 0, 7); c.fill(); }   // procedural puff fallback
  if (comp.rollT > 0) c.rotate((comp.t * 18) % 6.283);
  if (comp.flyTo) c.rotate((comp.flySpin || 0) % 6.283);
  if (comp.dir === 'left') c.scale(-s, s); else c.scale(s, s);
  const dsp = puff || spr;                                                  // RAMSI inflates into the glide-puff while gliding
  dspr(c, dsp, -sprW(dsp) / 2, -sprH(dsp) + bob);
  c.restore();
  if (this.flags.ramShield && comp.shield > 0) { c.strokeStyle = 'rgba(120,220,255,.5)'; c.beginPath(); c.arc(comp.x, comp.y - 6 - eoff, 9, 0, 7); c.stroke(); }
  if (comp.decoyT > 0) {
    c.strokeStyle = 'rgba(248,216,72,' + (0.4 + 0.4 * Math.sin(comp.t * 12)) + ')'; c.lineWidth = 2;
    c.beginPath(); c.arc(comp.x, comp.y - 6 - eoff, 12, 0, 7); c.stroke(); c.lineWidth = 1;
    drawText(c, '!', comp.x - 1, comp.y - 24, 9, '#f8d048', '#241a33');
  }
  if (comp.poundT > 0) {
    const r = (0.5 - comp.poundT) * 92 + 8;
    c.strokeStyle = 'rgba(255,230,150,' + Math.max(0, comp.poundT * 2) + ')'; c.lineWidth = 3;
    c.beginPath(); c.arc(comp.x, comp.y + 2, r, 0, 7); c.stroke(); c.lineWidth = 1;
  }
};

// ---- tiny reusable CUTSCENE system (sky-themed beats: big art + caption) ----
function drawReunion(c, t) {
  const cx = SW / 2;
  const scene = null;   // the old composed family art is retired — the cutscene now builds itself from the CURRENT parents/noah/ramsi sprites, so it always matches the in-level art
  if (scene) {                            // crisp composed family art (Noah + parents + Ramsi)
    const h = SH * 0.62, w = sprW(scene) * h / sprH(scene), bob = Math.sin(t * 2) * 3;
    c.drawImage(scene, cx - w / 2, SH * 0.40 - h / 2 + bob, w, h);
  } else {
    const cy = SH / 2 - 6;
    const pf = Sprites.parentsFree || Sprites.parents;
    if (pf) { c.save(); c.translate(cx, cy); const s = 4 + Math.sin(t * 3) * 0.15; c.scale(s, s); dspr(c, pf, -sprW(pf) / 2, -sprH(pf) / 2); c.restore(); }
    else {
      const s = 3.4;
      c.fillStyle = '#3a6ea5'; c.fillRect(cx - s * 9, cy - s * 6, s * 5, s * 12);
      c.fillStyle = '#b54a6a'; c.fillRect(cx + s * 4, cy - s * 6, s * 5, s * 12);
      c.fillStyle = '#f0c89a'; c.fillRect(cx - s * 8, cy - s * 11, s * 3, s * 4); c.fillRect(cx + s * 5, cy - s * 11, s * 3, s * 4);
    }
    const noah = Sprites.noah.down[0];
    c.save(); c.translate(cx - 134, cy + 30); c.scale(3, 3); dspr(c, noah, -sprW(noah) / 2, -sprH(noah)); c.restore();
    if (Sprites.ramsi) { c.save(); c.translate(cx + 132, cy + 34); c.scale(2.6, 2.6); dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi)); c.restore(); }
  }
  for (let i = 0; i < 22; i++) { c.fillStyle = ['#e84a4a', '#f8d048', '#58c452', '#4878e8', '#f898c8'][i % 5]; c.fillRect((hash2(i, 5) * SW + t * (35 + i)) % SW, (hash2(i, 11) * SH + t * 70) % SH, 3, 3); }
}
const REUNION = [
  { title: 'THE STORM CLEARS', text: 'With the STORM-LORD beaten, the storm-cage bursts open in a shower of light!', draw: drawReunion },
  { title: 'BERKLEY', text: '"NOAH! My boy - you climbed the whole SKY to find us!"', draw: drawReunion },
  { title: 'MEGAN', text: '"And you befriended RAMSI along the way. Our brave, BUFF little hero."', draw: drawReunion },
  { title: 'HOME ON THE DAWN WIND', text: 'Noah, Ramsi, Berkley & Megan soar home together on the wind. HERO OF THE SKY!', draw: drawReunion },
];
Game.startCutscene = function (beats, onDone) {
  this.cutscene = { beats: beats, i: 0, t: 0, onDone: onDone || null };
  this.state = 'cutscene'; Audio2.playSong('title');
};
Game.advanceCutscene = function () {
  const cs = this.cutscene; if (!cs || cs.t < 0.35) return;
  cs.i++; cs.t = 0;
  if (cs.i >= cs.beats.length) { const d = cs.onDone; this.cutscene = null; if (d) d(); else this.state = 'play'; }
};
Game.updateCutscene = function (dt, presses) {
  const cs = this.cutscene; if (!cs) { this.state = 'play'; return; }
  cs.t += dt;
  if (presses && (presses.includes(' ') || presses.includes('z') || presses.includes('Enter') || presses.includes('x'))) this.advanceCutscene();
};
Game.drawCutscene = function (c) {
  const cs = this.cutscene; if (!cs) return;
  const beat = cs.beats[cs.i] || {};
  c.fillStyle = '#141229'; c.fillRect(0, 0, SW, SH);
  c.fillStyle = '#1c1838'; c.fillRect(0, 0, SW, SH * 0.55);
  for (let i = 0; i < 44; i++) { c.fillStyle = 'rgba(200,210,255,' + (0.25 + 0.5 * Math.abs(Math.sin(i * 1.7 + Game.time))) + ')'; c.fillRect((hash2(i, 3) * SW) | 0, (hash2(i, 7) * SH * 0.6) | 0, 2, 2); }
  if (beat.draw) beat.draw(c, cs.t);
  const bh = 82, by = SH - bh - 12;
  c.fillStyle = 'rgba(20,12,30,.92)'; c.fillRect(18, by, SW - 36, bh);
  c.strokeStyle = '#f8d048'; c.lineWidth = 2; c.strokeRect(18, by, SW - 36, bh); c.lineWidth = 1;
  if (beat.title) drawText(c, beat.title, 34, by + 10, 12, '#f8d048', '#241a33');
  { c.font = 'bold 11px monospace';
    const wl = wrapText(c, (beat.text || '').replace(/\n/g, ' '), SW - 100);
    wl.slice(0, 3).forEach((l, i) => drawText(c, l, 34, by + 30 + i * 16, 11, '#fff', '#241a33')); }
  const last = cs.i + 1 >= cs.beats.length;
  drawText(c, last ? 'SPACE / click  >>  THE END' : 'SPACE / click  >>', SW - 34, by + bh - 14, 8, '#9adcf8', '#241a33', 'right');
};

// ---- the four sky maps (one connected skyfloor BAND, with gear/ram gates) ----
function buildWorld2() {
  if (MAPS.sky1) return;   // build once
  const edge = (m) => { for (let i = 0; i < m.w; i++) { T(m, i, 0, 'cloud'); T(m, i, m.h - 1, 'cloud'); } for (let j = 0; j < m.h; j++) { T(m, 0, j, 'cloud'); T(m, m.w - 1, j, 'cloud'); } };

  // ===== SKY 1 — CLOUDRISE LANDING =====  (get the RAM SUIT, smash your first wall)
  {
    const m = newMap('sky1', 40, 20, 'rift', { name: 'Cloudrise Landing', song: 'boss', cliff: 'void', zone: 'sky' });
    R(m, 2, 12, 36, 6, 'skyfloor'); edge(m);
    SIGN(m, 3, 15, 'SKYWARD ASCENT! Ramsi follows you now. Grab the RAM SUIT, then LUNGE (Z) into the CRACKED wall to smash through!');
    CHEST(m, 6, 13, { item: 'ramsuit' });
    R(m, 11, 12, 1, 6, 'crack');                 // first cracked barrier (ram)
    SIGN(m, 9, 16, 'A cracked wall! With the RAM SUIT, LUNGE (Z) to bust it open.');
    OBJ(m, { type: 'boss', x: 22, y: 14, boss: 'gustwing' });
    SIGN(m, 16, 16, 'THE GUST WING! Lead RAMSI close so he headbutts its shield, then NET it (Z)!');
    // secret alcove above the band — sealed by a crack ceiling
    R(m, 27, 7, 4, 4, 'skyfloor'); R(m, 27, 11, 4, 1, 'crack'); CHEST(m, 29, 8, { heartpiece: 1 });
    SIGN(m, 25, 13, 'The clouds look cracked overhead... (secret above!)');
    OBJ(m, { type: 'portal', x: 35, y: 14, to: 'sky2', tx: 4, ty: 16, req: 'gustwing' });
    SPAWN(m, 'condor', 14, 13, 8, 4, 2);
    m.start = { x: 4, y: 15 };
  }

  // ===== SKY 2 — GALE TERRACES =====  (Ramsi opens a sky-gate; cross a wide rift)
  {
    const m = newMap('sky2', 40, 22, 'rift', { name: 'Gale Terraces', song: 'boss', cliff: 'void', zone: 'sky' });
    R(m, 2, 13, 36, 6, 'skyfloor'); edge(m);
    SIGN(m, 3, 16, 'GALE TERRACES. FLY the wide rift (X). A SKY-SWITCH bars the gate — bring RAMSI to butt it open!');
    R(m, 9, 13, 2, 6, 'rift');                   // wide rift (wings)
    OBJ(m, { type: 'ramswitch', x: 15, y: 16, flag: 'sky2_gate', msg: 'RAMSI butts the SKY-SWITCH — the cloud-gate grinds open!' });
    SIGN(m, 13, 14, 'A SKY-SWITCH, too high for Noah. Stand near it — RAMSI headbutts it for you.');
    R(m, 20, 13, 1, 6, 'cloud'); DOOR(m, 20, 16, 'flag', 'sky2_gate', 'A sky-gate — RAMSI\'s switch will open it.');   // gated wall
    OBJ(m, { type: 'boss', x: 28, y: 15, boss: 'pufflord' });
    SIGN(m, 23, 17, 'THE PUFF LORD! Ramsi pops its cloud-armor with a ram — then GRAB it (Z)!');
    // secret alcove (crack)
    R(m, 31, 7, 4, 4, 'skyfloor'); R(m, 33, 11, 1, 2, 'crack'); CHEST(m, 32, 8, { gems: 6 });
    OBJ(m, { type: 'portal', x: 35, y: 16, to: 'sky3', tx: 4, ty: 16, req: 'pufflord' });
    SPAWN(m, 'jellyfish', 22, 13, 8, 5, 2);
    m.start = { x: 4, y: 16 };
  }

  // ===== SKY 3 — THUNDERHEAD SPAN =====  (a sky-pool to swim, a crack to smash)
  {
    const m = newMap('sky3', 40, 22, 'rift', { name: 'Thunderhead Span', song: 'boss', cliff: 'void', zone: 'sky' });
    R(m, 2, 13, 36, 6, 'skyfloor'); edge(m);
    SIGN(m, 3, 16, 'THUNDERHEAD SPAN. SWIM the sky-pool (SUIT), RAM the cracked seam. RAMSI shields YOU now!');
    R(m, 10, 13, 4, 6, 'water');                 // sky-pool (suit)
    R(m, 20, 13, 1, 6, 'crack');                 // cracked seam (ram)
    OBJ(m, { type: 'boss', x: 28, y: 15, boss: 'sparkhorn' });
    SIGN(m, 23, 17, 'SPARKHORN! Ramsi grounds the lightning with a headbutt — then HARPOON it (Z)!');
    R(m, 31, 7, 4, 4, 'skyfloor'); R(m, 33, 11, 1, 2, 'crack'); CHEST(m, 32, 8, { heartpiece: 1 });   // secret
    OBJ(m, { type: 'portal', x: 35, y: 16, to: 'sky4', tx: 4, ty: 16, req: 'sparkhorn' });
    SPAWN(m, 'condor', 22, 13, 8, 4, 2);
    m.start = { x: 4, y: 16 };
  }

  // ===== SKY 4 — STORM CITADEL =====  (two cracked gates, the STORM-LORD, the rescue)
  {
    const m = newMap('sky4', 40, 22, 'rift', { name: 'Storm Citadel', song: 'boss', cliff: 'stone', zone: 'sky' });
    R(m, 2, 13, 36, 6, 'skyfloor'); edge(m);
    SIGN(m, 3, 16, 'THE STORM CITADEL. Berkley & Megan are caged above. SMASH the gates, then beat the STORM-LORD with RAMSI!');
    R(m, 9, 13, 1, 6, 'crack');                  // cracked gate 1
    R(m, 17, 13, 1, 6, 'crack');                 // cracked gate 2
    R(m, 20, 8, 15, 11, 'skyfloor');             // the arena (rises above the band)
    OBJ(m, { type: 'boss', x: 27, y: 14, boss: 'tempestia' });
    SIGN(m, 21, 17, 'THE STORM-LORD! Keep RAMSI on him to break the storm-shield, then BONE him down (Z)!');
    // the caged parents — above the arena, behind a cracked ceiling (freed AFTER the boss)
    R(m, 24, 2, 6, 4, 'skyfloor'); R(m, 26, 6, 1, 2, 'crack');
    OBJ(m, { type: 'parents', x: 26, y: 3 });
    SIGN(m, 30, 4, 'BERKLEY & MEGAN! Beat the STORM-LORD, RAM up through the cracked ceiling, and free them (SPACE).');
    m.start = { x: 4, y: 16 };
  }
}
Game.REUNION = REUNION;
if (G.NQ) { G.NQ.SKY_BOSS = SKY_BOSS; G.NQ.buildWorld2 = buildWorld2; G.NQ.REUNION = REUNION; }
