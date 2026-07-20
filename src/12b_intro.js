"use strict";
// ================= THE OPENING — a SPACE-paced storybook cutscene =================
// Replaces the old 21-second auto-timer intro (the drawIntro here overrides 11_ui's,
// house-style later-declaration-wins). Seven beats; the reader sets the pace:
//   SPACE / Z / ENTER / click — finish the line, then next beat
//   X / ESC                  — skip the whole opening
// Animation uses the REAL sprites (side walk cycles, Ramsi, Sahor, the cage) and
// upgrades itself automatically when the Sheet-18 art lands:
//   Sprites.scenes.intro_vale / intro_storm            (painted backdrops)
//   Sprites.props.introhug / introsahorfly / introcage
//                 intronoahbrave / intronoahdash / introspire
(function () {
  const N = 7;
  const CAPS = [
    'This is BUFF NOAH... and this is RAMSI — best friends in the whole wide world.',
    'Every morning they play in GREENWOOD VALE. Comfy. Cozy. PERFECT.',
    'But one golden morning... the sky turned DARK.',
    'MIMI SAHOR: "Awww. How comfy. How SOFT. How... MINE!"',
    'SAHOR: "Hee hee hee! Catch us if you can, muscle-boy! TO THE RAINBOW SPIRE!"',
    'NOAH: "Hold on, Ramsi. I will master EVERY power... and I am COMING FOR YOU."',
    'Go get your best friend back. Press SPACE to PLAY!',
  ];
  const TYPE_CPS = 26;                                   // caption type-on speed (chars/sec)

  function ip() { if (!Game.intro) Game.intro = { i: 0, t: 0, fx: {}, entered: -1 }; return Game.intro; }

  Game.introFinish = function () {
    Game.intro = null; Game.state = 'play';
    Audio2.playSong((Game.map && Game.map.song) || 'vale');
    Game.banner('SAHOR stole RAMSI — he is caged beyond the RAINBOW SPIRE! Master EVERY power of movement to win him back.');
    Game.toast('First: help Granny with her sheep (by the cottage).');
    saveGame();
  };
  Game.introAdvance = function () {
    const s = ip();
    if (s.t < 0.35) return;                              // anti-mash guard
    if (s.t * TYPE_CPS < (CAPS[s.i] || '').length) { s.t = (CAPS[s.i] || '').length / TYPE_CPS; return; }   // 1st press: finish the line
    s.i++; s.t = 0; s.fx = {};
    if (s.i >= N) Game.introFinish();
  };
  Game.updateIntro = function (dt, presses) {
    const s = ip();
    if (s.entered !== s.i) { s.entered = s.i; beatAudio(s.i); }
    s.t += dt;
    // timed one-shot stingers inside a beat
    if (s.i === 3 && !s.fx.snatch && s.t > 1.15) { s.fx.snatch = 1; Audio2.jingle('snatch'); Audio2.jingle('swoopdown'); }
    if (s.i === 5 && !s.fx.brave && s.t > 1.6) { s.fx.brave = 1; Audio2.jingle('bravesting'); }
    for (const k of presses) {
      if (k === ' ' || k === 'z' || k === 'Enter') Game.introAdvance();
      else if (k === 'x' || k === 'Escape') Game.introFinish();
    }
  };
  function beatAudio(i) {
    try {
      if (i === 0) { Audio2.playSong('title'); Audio2.jingle('dawnrise'); }
      else if (i === 1) Audio2.jingle('heart');
      else if (i === 2) { Audio2.playSong('storm'); Audio2.jingle('thunderroll'); }
      else if (i === 3) Audio2.jingle('thunderroll');
      else if (i === 4) Audio2.jingle('swoopdown');
      else if (i === 5) Audio2.jingle('sadsting');
      else if (i === 6) { Audio2.playSong('title'); Audio2.jingle('fanfare'); }
    } catch (e) {}
  }

  // ---------- drawing helpers ----------
  function coverDraw(c, img, biasY) {                    // fill SW x SH, crop overflow (painted scenes)
    const iw = img.width, ih = img.height, sc = Math.max(SW / iw, SH / ih);
    const sw2 = SW / sc, sh2 = SH / sc;
    const sx = (iw - sw2) / 2, sy = (ih - sh2) * (biasY === undefined ? 0.5 : biasY);
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = true;
    try { c.drawImage(img, sx, sy, sw2, sh2, 0, 0, SW, SH); } catch (e) {}
    c.imageSmoothingEnabled = sm;
  }
  function pspr(c, spr, x, y, s, flip) {                 // draw sprite scaled about its center
    if (!spr) return;
    c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(flip ? -s : s, s);
    dspr(c, spr, -sprW(spr) / 2, -sprH(spr) / 2); c.restore();
  }
  function noahSide(t, fps) {                            // side walk-cycle frame (faces right)
    const arr = (Sprites.noah && Sprites.noah.right) || [];
    return arr[((t * (fps || 8)) | 0) % Math.max(1, arr.length)] || arr[0];
  }
  // the meadow: painted scene when present, else a loving procedural fallback.
  // storm = 0 (golden morning) .. 1 (full storm)
  function bgMeadow(c, t, storm) {
    const sc = Sprites.scenes || {};
    const art = storm > 0.5 ? (sc.intro_storm || sc.intro_vale) : (sc.intro_vale || null);
    if (art) {
      coverDraw(c, art, 0.62);
      if (storm > 0.5 && !sc.intro_storm) { c.fillStyle = 'rgba(24,16,52,.55)'; c.fillRect(0, 0, SW, SH); }   // stormless art: dim it
      return;
    }
    // sky
    const g = c.createLinearGradient(0, 0, 0, SH);
    if (storm < 0.5) { g.addColorStop(0, '#8ed4f4'); g.addColorStop(0.5, '#cdeefb'); g.addColorStop(0.62, '#ffe9a8'); }
    else { g.addColorStop(0, '#241a44'); g.addColorStop(0.5, '#3a2f5e'); g.addColorStop(0.62, '#6a5288'); }
    g.addColorStop(0.63, storm < 0.5 ? '#55b24a' : '#2f5e33'); g.addColorStop(1, storm < 0.5 ? '#3f9434' : '#1d3a22');
    c.fillStyle = g; c.fillRect(0, 0, SW, SH);
    if (storm < 0.5) { c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(84, 46, 20, 0, 7); c.fill(); c.fillStyle = 'rgba(255,243,176,.25)'; c.beginPath(); c.arc(84, 46, 34, 0, 7); c.fill(); }
    // clouds: puffy & white, or boiling & bruised
    for (let k = 0; k < 7; k++) {
      const cx = ((hash2(k, 3) * SW) + t * (storm > 0.5 ? 26 : 7) * (k % 2 ? 1 : 1.5)) % (SW + 120) - 60;
      const cy = 26 + hash2(k, 7) * 66, r = 13 + (k % 3) * 7;
      c.fillStyle = storm < 0.5 ? 'rgba(255,255,255,.85)' : 'rgba(38,28,66,.9)';
      c.beginPath(); c.arc(cx, cy, r, 0, 7); c.arc(cx + r, cy + 4, r * 0.8, 0, 7); c.arc(cx - r, cy + 4, r * 0.72, 0, 7); c.fill();
    }
    const gy = SH * 0.63;
    // the cottage (chimney smoke by day, brave window light in the storm)
    c.fillStyle = storm < 0.5 ? '#d8b878' : '#8a7454'; c.fillRect(96, gy - 44, 64, 44);
    c.fillStyle = storm < 0.5 ? '#a8703c' : '#6e4a28';
    c.beginPath(); c.moveTo(88, gy - 44); c.lineTo(128, gy - 72); c.lineTo(168, gy - 44); c.fill();
    c.fillStyle = '#241a33'; c.fillRect(118, gy - 26, 14, 26);
    c.fillStyle = storm < 0.5 ? '#9adcf8' : '#f8d048'; c.fillRect(140, gy - 34, 11, 11);
    c.strokeStyle = '#241a33'; c.strokeRect(96.5, gy - 44.5, 64, 44);
    c.fillStyle = '#6e4a28'; c.fillRect(150, gy - 66, 8, 14);
    if (storm < 0.5) for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(154 + Math.sin(t * 1.4 + k * 2) * 4, gy - 74 - k * 9, 3 + k, 0, 7); c.fill(); }
    // the big oak (real tree art when it exists)
    const tree = (typeof TileArt !== 'undefined') && TileArt.tree;
    if (tree && tree.width) pspr(c, tree, SW - 120, gy - 40, 2.6);
    // fence + flowers
    c.fillStyle = storm < 0.5 ? '#a8703c' : '#5e442a';
    for (let x = 24; x < SW; x += 34) { c.fillRect(x, gy + 26, 4, 16); }
    c.fillRect(0, gy + 30, SW, 3);
    for (let k = 0; k < 22; k++) {
      const fx = (hash2(k, 5) * SW) | 0, fy = gy + 42 + ((hash2(k, 9) * (SH - gy - 56)) | 0);
      c.fillStyle = storm < 0.5 ? ['#fff', '#f898c8', '#f8e858'][k % 3] : '#4a6a4e'; c.fillRect(fx, fy, 2, 2);
    }
  }
  function lightning(c, t, chance) {                     // stochastic flash + fork
    const ph = (t * 6.7) | 0;
    if (hash2(ph, 13) > chance) return;
    const a = 0.5 * (1 - (t * 6.7 - ph));
    c.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')'; c.fillRect(0, 0, SW, SH);
    const x0 = 80 + hash2(ph, 5) * (SW - 160);
    c.strokeStyle = '#f8ec70'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, 0);
    c.lineTo(x0 - 12, 46); c.lineTo(x0 + 8, 78); c.lineTo(x0 - 10, 128); c.stroke(); c.lineWidth = 1;
  }
  function windLeaves(c, t) {
    for (let k = 0; k < 14; k++) {
      const lx = (SW + 40 - ((t * (120 + (k % 5) * 40) + hash2(k, 3) * SW) % (SW + 80))),
            ly = 30 + hash2(k, 7) * (SH - 90) + Math.sin(t * 5 + k) * 8;
      c.fillStyle = k % 3 ? '#58c452' : '#f8e858'; c.fillRect(lx, ly, 3, 2);
    }
  }
  function caged(c, x, y, s, t) {                        // Ramsi in the golden cage (art or a drawn birdcage)
    const P = Sprites.props || {};
    if (P.introcage) { pspr(c, P.introcage, x, y, s); return; }
    const w = 13 * s, h = 15 * s;
    pspr(c, Sprites.ramsi, x, y + 1 * s, s * 0.85);
    c.strokeStyle = '#f8b800'; c.lineWidth = Math.max(1.5, s);
    c.beginPath(); c.ellipse(x, y + h * 0.34, w * 0.54, h * 0.16, 0, 0, 7); c.stroke();          // base ring
    c.beginPath(); c.arc(x, y - h * 0.02, w * 0.54, Math.PI, 0); c.stroke();                      // dome
    for (let b = -2; b <= 2; b++) {                                                              // bars
      const bx = x + b * w * 0.25;
      c.beginPath(); c.moveTo(bx, y - h * 0.02 - (2 - Math.abs(b)) * 1.6 * s); c.lineTo(bx, y + h * 0.34); c.stroke();
    }
    c.beginPath(); c.moveTo(x, y - h * 0.02 - w * 0.54); c.lineTo(x, y - h * 0.02 - w * 0.54 - 4 * s); c.stroke();   // hanging stem
    c.lineWidth = 1;
  }
  function sahorFly(c, x, y, s, t, withCage, faceRight) { // Sahor mid-flight (art or sprite + wing flap)
    const P = Sprites.props || {};
    if (P.introsahorfly) {                               // sheet art faces LEFT and bakes the cage in
      pspr(c, P.introsahorfly, x, y, s, !!faceRight);    // flip only when she flies to the RIGHT
      return;
    }
    // little bat wings behind the boss sprite
    const wf = Math.sin(t * 14) * 6;
    c.fillStyle = '#3a2f5e';
    c.beginPath(); c.moveTo(x - 8 * s, y - 4 * s); c.quadraticCurveTo(x - 20 * s, y - 10 * s - wf, x - 26 * s, y + 2 * s - wf * 0.5); c.quadraticCurveTo(x - 16 * s, y + 4 * s, x - 8 * s, y + 2 * s); c.fill();
    c.beginPath(); c.moveTo(x + 8 * s, y - 4 * s); c.quadraticCurveTo(x + 20 * s, y - 10 * s - wf, x + 26 * s, y + 2 * s - wf * 0.5); c.quadraticCurveTo(x + 16 * s, y + 4 * s, x + 8 * s, y + 2 * s); c.fill();
    pspr(c, Sprites.sahor, x, y, s);
    if (withCage) caged(c, x - 2, y + 26 * s + Math.sin(t * 5) * 2, s * 0.75, t);
  }
  function spireFar(c, x, y, s, t) {                     // the RAINBOW SPIRE, world-map style:
    // stacked Arizona red-rock mesa with the crystal crown blooming from its peak.
    // (The Sheet-18 floating-island spire cell is intentionally unused — mismatch.)
    const tiers = [[20, 8], [15, 8], [10, 8]];           // half-width, height per rock tier
    let ty = y + 24 * s;
    c.strokeStyle = '#241a33';
    for (const [hw, hh] of tiers) {
      ty -= hh * s;
      c.fillStyle = '#b06a3c'; c.fillRect(x - hw * s, ty, hw * 2 * s, hh * s);
      c.fillStyle = '#d89860'; c.fillRect(x - hw * s, ty, hw * 2 * s, 2 * s);        // sunlit lip
      c.fillStyle = '#834c28'; c.fillRect(x - hw * s, ty + (hh - 2) * s, hw * 2 * s, 2 * s);
      c.strokeRect(x - hw * s + 0.5, ty + 0.5, hw * 2 * s - 1, hh * s - 1);
    }
    // the crystal crown growing out of the cracked peak
    c.fillStyle = '#241a33'; c.beginPath(); c.moveTo(x - 7 * s, ty); c.lineTo(x, ty - 22 * s); c.lineTo(x + 7 * s, ty); c.fill();
    c.fillStyle = '#cabcf4'; c.beginPath(); c.moveTo(x - 5.5 * s, ty); c.lineTo(x, ty - 20 * s); c.lineTo(x + 5.5 * s, ty); c.fill();
    c.fillStyle = '#9adcf8'; c.beginPath(); c.moveTo(x, ty - 20 * s); c.lineTo(x + 5.5 * s, ty); c.lineTo(x, ty); c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(x - 1 * s, ty - 17 * s, s, 14 * s);
    for (const [rx2, ry2] of [[-8, -1], [7, -2], [-4, 2]]) {                          // rubble shards at the crack
      c.fillStyle = '#e8d8f8'; c.fillRect(x + rx2 * s, ty + ry2 * s, 2 * s, 2 * s);
    }
    const RB = ['#e84a4a', '#f89238', '#f8d048', '#58c452', '#4878e8', '#9a62e0'];
    for (let k = 0; k < RB.length; k++) { c.strokeStyle = RB[k]; c.globalAlpha = 0.85; c.beginPath(); c.arc(x, ty - 16 * s, (14 + k * 2.2) * s, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
    c.globalAlpha = 1;
    const tw = (t * 3 | 0) % 3;
    c.fillStyle = '#fff'; c.fillRect(x - 4 * s + tw * 4 * s, ty - (8 + tw * 5) * s, 2, 2);
  }

  // ---------- the seven beats ----------
  function beat0(c, t) {                                 // DAWN: chase-play in the meadow (side walk cycles!)
    bgMeadow(c, t, 0);
    const cx = SW * 0.44, cy = SH * 0.63 + 34, rx = 130, ry = 22;
    const a = t * 1.5, na = a, ra = a + 1.05;
    const nx = cx + Math.cos(na) * rx, ny = cy + Math.sin(na) * ry;
    const rxp = cx + Math.cos(ra) * rx, ryp = cy + Math.sin(ra) * ry + Math.abs(Math.sin(t * 7)) * -5;
    const nLeft = Math.sin(na) > 0 ? Math.cos(na) < 0 : Math.cos(na) < 0;   // face travel direction
    pspr(c, Sprites.ramsi, rxp, ryp - 8, 2.1, Math.cos(ra + Math.PI / 2) < 0);
    const fr = noahSide(t, 9);
    pspr(c, fr, nx, ny - 12, 2.2, Math.cos(na + Math.PI / 2) < 0);
    for (let k = 0; k < 3; k++) {                        // drifting hearts
      const hp = (t * 0.5 + k * 0.33) % 1;
      c.save(); c.globalAlpha = 1 - hp; c.translate(cx - 30 + k * 34, cy - 44 - hp * 30); c.scale(1.6, 1.6);
      dspr(c, Sprites.items.heart, 0, 0); c.restore();
    }
    for (let k = 0; k < 4; k++) {                        // butterflies
      const bx = 60 + hash2(k, 3) * (SW - 120) + Math.sin(t * 1.3 + k * 2) * 26, by = SH * 0.4 + Math.sin(t * 2.1 + k) * 18;
      c.fillStyle = k % 2 ? '#f898c8' : '#f8e858'; c.fillRect(bx, by, 3, 2); c.fillRect(bx + Math.sin(t * 16 + k) > 0 ? bx + 3 : bx - 2, by - 1, 2, 2);
    }
  }
  function beat1(c, t) {                                 // THE HUG
    bgMeadow(c, t, 0);
    c.fillStyle = 'rgba(255,236,150,.16)'; c.beginPath(); c.arc(SW / 2, SH * 0.52, 120 + Math.sin(t * 2) * 6, 0, 7); c.fill();
    const P = Sprites.props || {};
    if (P.introhug) pspr(c, P.introhug, SW / 2, SH * 0.55, 3.4);
    else {
      pspr(c, Sprites.noah.down[0], SW / 2 - 20, SH * 0.55, 2.8);
      c.save(); c.translate(SW / 2 + 26, SH * 0.58 + Math.sin(t * 3) * 1.5); c.rotate(-0.18); c.scale(2.3, 2.3);
      dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi) / 2); c.restore();
    }
    for (let k = 0; k < 5; k++) {                        // orbiting hearts
      const a = t * 1.2 + k * (Math.PI * 2 / 5);
      c.save(); c.globalAlpha = 0.7 + Math.sin(t * 3 + k) * 0.3;
      c.translate(SW / 2 + Math.cos(a) * 92, SH * 0.5 + Math.sin(a) * 34); c.scale(1.5, 1.5);
      dspr(c, Sprites.items.heart, 0, 0); c.restore();
    }
  }
  function beat2(c, t) {                                 // THE SKY TURNS DARK
    const dk = clamp(t / 1.6, 0, 1);
    bgMeadow(c, t, dk);
    c.fillStyle = 'rgba(18,12,40,' + (0.30 * dk).toFixed(2) + ')'; c.fillRect(0, 0, SW, SH);
    windLeaves(c, t);
    if (dk > 0.6) lightning(c, t, 0.16);
    const gy = SH * 0.63;
    pspr(c, Sprites.noah.up[0], SW * 0.42, gy + 22, 2.4);                       // back view — watching the sky
    c.save(); c.translate(SW * 0.42 + 34 + Math.sin(t * 22) * (dk > 0.6 ? 1.2 : 0), gy + 28); c.scale(2, 2);
    dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi) / 2); c.restore();
    if (dk >= 1) drawText(c, '?', SW * 0.42 - 6, gy - 26 + Math.sin(t * 4) * 2, 14, '#f8e858', '#241a33');
  }
  function beat3(c, t) {                                 // MIMI SAHOR STRIKES
    const shake = (t > 1.05 && t < 1.6) ? Math.sin(t * 70) * 3 : 0;
    c.save(); c.translate(shake, shake * 0.6);
    bgMeadow(c, t, 1);
    windLeaves(c, t + 8);
    lightning(c, t, t > 0.9 && t < 1.4 ? 1.01 : 0.2);                            // guaranteed CRACK at the grab
    const gy = SH * 0.63;
    const rx0 = SW * 0.42 + 34, ry0 = gy + 28;
    const p = clamp(t / 1.1, 0, 1), e = p * p;
    const sx = lerp(SW + 70, rx0, e), sy = lerp(-30, ry0 - 34, e) + Math.sin(t * 9) * 3;
    let rX = rx0, rY = ry0, grabbed = t > 1.1;
    if (grabbed) { const q = Math.min(1, (t - 1.1) / 1.7), ee = q * q; rX = lerp(rx0, -80, ee); rY = lerp(ry0 - 30, -60, ee); }
    pspr(c, Sprites.noah.down[0], SW * 0.42, gy + 22, 2.4);                      // whirls to face us, shocked
    if (!grabbed) { c.save(); c.translate(rx0, ry0); c.scale(2, 2); dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi) / 2); c.restore(); }
    if (grabbed) { sahorFly(c, rX, rY - 18, 1.6, t, true); }
    else sahorFly(c, sx, sy, 1.6, t, false);
    drawText(c, '!', SW * 0.42 - 5, gy - 34 + Math.sin(t * 10) * 3, 18, '#f8e858', '#241a33');
    c.restore();
  }
  function beat4(c, t) {                                 // THE CHASE toward the spire
    const lift = clamp(t / 3, 0, 0.4);
    bgMeadow(c, t, 1 - lift);
    windLeaves(c, t + 4);
    spireFar(c, SW * 0.58, 74, 0.95, t);      // on the open horizon (clear of the painted cottage)
    const q = clamp(t / 3.2, 0, 1);
    sahorFly(c, lerp(SW * 0.3, SW * 0.60, q), lerp(56, 66, q), lerp(1.3, 0.5, q), t, true, true);
    const P = Sprites.props || {}, gy = SH * 0.63;
    const nx = SW * 0.22 + Math.min(60, t * 26);
    if (P.intronoahdash) pspr(c, P.intronoahdash, nx, gy + 18, 2.4);
    else pspr(c, noahSide(t, 12), nx, gy + 18, 2.4);
    for (let k = 0; k < 3; k++) { const dp = (t * 2 + k * 0.4) % 1; c.fillStyle = 'rgba(216,184,120,' + (0.5 * (1 - dp)).toFixed(2) + ')'; c.beginPath(); c.arc(nx - 18 - dp * 16, gy + 34, 3 + dp * 3, 0, 7); c.fill(); }
  }
  function beat5(c, t) {                                 // THE VOW (night, stars, far spire)
    const g = c.createLinearGradient(0, 0, 0, SH);
    g.addColorStop(0, '#100c26'); g.addColorStop(0.7, '#241a44'); g.addColorStop(1, '#0c0a18');
    c.fillStyle = g; c.fillRect(0, 0, SW, SH);
    for (let k = 0; k < 60; k++) {                       // twinkling stars
      const sx = (hash2(k, 3) * SW) | 0, sy = (hash2(k, 7) * SH * 0.7) | 0;
      c.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.6 * Math.abs(Math.sin(t * 1.4 + k))).toFixed(2) + ')';
      c.fillRect(sx, sy, k % 9 ? 1 : 2, k % 9 ? 1 : 2);
    }
    spireFar(c, SW * 0.72, SH * 0.42, 1.5, t);
    c.fillStyle = 'rgba(154,220,248,' + (0.10 + 0.05 * Math.sin(t * 2)).toFixed(2) + ')';
    c.beginPath(); c.arc(SW * 0.72, SH * 0.42 - 38, 46, 0, 7); c.fill();       // the spire's cold glow
    c.fillStyle = '#0c0a18'; c.beginPath();                                     // cliff silhouette
    c.moveTo(0, SH); c.lineTo(0, SH * 0.72); c.lineTo(SW * 0.3, SH * 0.78); c.lineTo(SW * 0.42, SH * 0.9); c.lineTo(SW * 0.42, SH); c.fill();
    const P = Sprites.props || {};
    if (P.intronoahbrave) pspr(c, P.intronoahbrave, SW * 0.18, SH * 0.72 - 18, 2.6);
    else pspr(c, Sprites.noah.up[0], SW * 0.18, SH * 0.72 - 16, 2.4);           // back view, facing the spire
    if (t > 1.6) {                                       // his courage kindles: gold sparkles gather
      const a = Math.min(1, t - 1.6);
      for (let k = 0; k < 4; k++) {
        const sa = t * 1.8 + k * 1.6, rr = 16 + k * 3;
        c.fillStyle = 'rgba(248,216,72,' + (a * (0.4 + 0.5 * Math.abs(Math.sin(t * 3 + k)))).toFixed(2) + ')';
        c.fillRect(SW * 0.18 + Math.cos(sa) * rr, SH * 0.72 - 34 + Math.sin(sa) * 9, 2, 2);
      }
    }
  }
  function beat6(c, t) {                                 // THE QUEST BEGINS! (title card)
    c.fillStyle = '#141229'; c.fillRect(0, 0, SW, SH);
    c.save(); c.translate(SW / 2, SH * 0.44); c.rotate(t * 0.4);                // radiant beams
    for (let i = 0; i < 12; i++) {
      c.rotate(Math.PI / 6);
      const grd = c.createLinearGradient(0, 0, 150, 0);
      grd.addColorStop(0, 'rgba(248,216,72,.34)'); grd.addColorStop(1, 'rgba(248,216,72,0)');
      c.fillStyle = grd; c.beginPath(); c.moveTo(0, 0); c.lineTo(150, -14); c.lineTo(150, 14); c.fill();
    }
    c.restore();
    const pop = Math.min(1, t * 2.2);
    c.save(); c.translate(SW / 2, SH * 0.3); c.scale(pop, pop);
    drawText(c, "BUFF NOAH'S QUEST", 0, -12, 26, '#f8d048', '#241a33', 'center');
    drawText(c, 'THE QUEST BEGINS!', 0, 22, 14, '#fff', '#241a33', 'center');
    c.restore();
    pspr(c, Sprites.ramsi, SW / 2, SH * 0.58 + Math.sin(t * 3) * 3, 2.6);       // waiting to be rescued!
    const icons = [Sprites.gear.sandal, Sprites.gear.glove, Sprites.tools.net, Sprites.gear.suit, Sprites.tools.harpoon, Sprites.gear.wing, Sprites.gear.bracer];
    icons.forEach((ic, k) => {
      if (!ic) return;
      const ap = clamp(t * 2 - k * 0.22, 0, 1);
      if (ap <= 0) return;
      c.save(); c.globalAlpha = ap; c.translate(SW / 2 + (k - (icons.length - 1) / 2) * 44, SH * 0.76 - (1 - ap) * 14); c.scale(2, 2);
      dspr(c, ic, -sprW(ic) / 2, -sprH(ic) / 2); c.restore();
    });
  }
  const BEATS = [beat0, beat1, beat2, beat3, beat4, beat5, beat6];

  // ---------- the frame ----------
  UI.drawIntro = function (c) {
    const s = ip(), t = s.t, i = Math.min(s.i, N - 1);
    c.save(); c.beginPath(); c.rect(0, 0, SW, SH); c.clip();
    c.imageSmoothingEnabled = false;
    try { BEATS[i](c, t); } catch (e) {}
    // letterbox + caption band
    c.fillStyle = '#0c0814'; c.fillRect(0, 0, SW, 14);
    const bh = 44; c.fillStyle = 'rgba(10,6,18,.92)'; c.fillRect(0, SH - bh, SW, bh);
    c.fillStyle = '#f8d048'; c.fillRect(0, SH - bh, SW, 1);
    const cap = CAPS[i] || '', shown = cap.slice(0, Math.max(0, (t * TYPE_CPS) | 0));
    c.font = 'bold 10px monospace';
    const lines = wrapText(c, shown, SW - 150);
    lines.slice(0, 2).forEach((l, k) => drawText(c, l, 18, SH - bh + 8 + k * 14, 10, '#fff', '#241a33'));
    const done = shown.length >= cap.length;
    if (done || i === N - 1) {
      const pulse = 0.6 + Math.abs(Math.sin(Game.time * 3.2)) * 0.4;
      c.globalAlpha = pulse;
      drawText(c, i === N - 1 ? 'SPACE: PLAY!' : 'SPACE ▶', SW - 16, SH - bh + 15, i === N - 1 ? 11 : 10, '#f8e858', '#241a33', 'right');
      c.globalAlpha = 1;
    }
    // beat pips + skip hint
    for (let k = 0; k < N; k++) {
      const px = SW - 16 - (N - 1 - k) * 11;
      c.fillStyle = k < s.i ? '#f8d048' : (k === s.i ? '#fff' : '#4a4066');
      c.beginPath(); c.arc(px, 7, k === s.i ? 3.2 : 2.2, 0, 7); c.fill();
    }
    drawText(c, 'X: skip', 6, 3, 7, '#9a90b8', '#0c0814');
    c.restore();
    UI.hot = [{ x: 0, y: 0, w: SW, h: SH, fn: function () { Game.introAdvance(); } }];   // click anywhere = next
  };
})();
