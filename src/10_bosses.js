"use strict";
// ================= bosses: capture puzzles, never damage races =================
const Bosses = {
  spawn(name, tx, ty, opts) {
    const b = { name, x: tx * TILE + 8, y: ty * TILE + 12, hx: tx * TILE + 8, hy: ty * TILE + 12, t: 0, awake: false, caughtAnim: 0 };
    if (name === 'billy') Object.assign(b, { state: 'idle', stateT: 1, dazed: 0, speed: 95, vx: 0, vy: 0, hits: 0 });
    if (name === 'twinkle') Object.assign(b, { arms: [0, 1, 2, 3, 4].map(i => ({ trapped: false, bend: 0, tx: 0, ty: 0 })), spin: 1, baseA: 0, rad: 38 });
    if (name === 'cerberus') Object.assign(b, { state: 'drowsy', stateT: 4, stun: 0, heads: 3 });
    if (name === 'sahor') Object.assign(b, { phase: 1, perch: 0, perchT: 2.6, ringHits: 0, pathT: 0, ringX: tx * TILE + 8, ringY: (ty + 1) * TILE + 8 });
    if (typeof SKY_BOSS !== 'undefined' && SKY_BOSS[name]) Object.assign(b, { sky: true, cfg: SKY_BOSS[name], armor: SKY_BOSS[name].armor, hits: 0, state: 'roam', stateT: 1.2, shieldT: 0, stun: 0, dir: -1, vx: 0, vy: 0 });
    if (typeof BURROW_BOSS !== 'undefined' && BURROW_BOSS[name]) Object.assign(b, { warden: true, cfg: BURROW_BOSS[name], armor: BURROW_BOSS[name].armor, hits: 0, shieldT: 0, stun: 0, inv: 0, surf: 0, surfT: 1.4 });
    if (name === 'gnash') Object.assign(b, { gnash: true, cfg: (typeof GNASH !== 'undefined' ? GNASH : {}), phase: 1, hits: 0, armor: 3, shieldT: 0, stun: 0, inv: 0, surf: 0, surfT: 1.6, sub: 0 });
    if (name === 'gnashara') Object.assign(b, { gnashara: true, active: 0, slamT: 0, heads: (typeof GNASHARA_HEADS !== 'undefined' ? GNASHARA_HEADS.map(h => Object.assign({}, h, { hp: 2, down: false })) : []) });
    if (opts && opts.gauntlet) b.gauntlet = true;
    if (opts && opts.flag) b.flag = opts.flag;
    Game.boss = b;
  },
  wake(b) {
    if (b.awake) return; b.awake = true; Audio2.jingle('bossintro'); Audio2.playSong('boss');
    const lines = {
      billy: 'KING BILLY: "BAAAH! Nets bounce off my armor — and NOTHING stops my charge!"',
      twinkle: 'SIR TWINKLE: "Five hungry arms — and OH how they love FISH SNACKS! Set your cages... if you dare!"',
      cerberus: 'CERBERUS: "WOOF WOOF WOOF!" (He naps between zoomies. Bonk him gently while drowsy!)',
      sahor: 'MIMI SAHOR: "Catch ME? Hee hee! First, harpoon my GLOWING RING — if you can find it!"',
      gnashara: 'GNASHARA, THE ALL-BEAST: a hundred roars in one — "I AM EVERY FOE YOU FELLED! Face them ALL at once!"',
    };
    Game.banner(lines[b.name] || (b.cfg && b.cfg.wake) || (b.name.toUpperCase() + ' bars the way — team up with RAMSI!'));
  },
  catchBoss(b) {
    b.caughtAnim = 1.6; Audio2.jingle('bosswin');
    Particles.burst(b.x, b.y - 20, 'confetti'); Particles.burst(b.x - 14, b.y - 8, 'confetti'); Particles.burst(b.x + 14, b.y - 8, 'confetti');
  },
  finalize(b) {
    const F = Game.flags;
    Game.boss = null;
    if (b.gnashara && this.finalizeGnashara) { this.finalizeGnashara(b); return; }
    if (b.flag) { F[b.flag] = true; Game.giveLoot({ heartC: 1 }); Game.banner((b.name === 'billy' ? 'KING BILLY' : b.name === 'cerberus' ? 'CERBERUS' : b.name.toUpperCase()) + ' is beaten! Step out and back in for the next challenger.'); saveGame(); return; }
    if (b.name === 'billy') {
      F.billy = true; Game.giveLoot({ heartC: 1 });
      Game.banner("KING BILLY CAUGHT! He drops BILLY'S BELL — and a glowing EXIT portal opens in the hall (NE)!");
    } else if (b.name === 'twinkle') {
      F.twinkle = true; Game.giveLoot({ heartC: 1 });
      Game.banner('SIR TWINKLE CAUGHT! The crown chest UNSEALS — and an EXIT portal opens at the top of the lair!');
    } else if (b.name === 'cerberus') {
      F.cerberus = true; Game.giveLoot({ heartC: 1 });
      Game.banner('CERBERUS CAUGHT! Such a good boy! An EXIT portal opens — and WHISTLING CANYON unlocks (ESC)!');
    } else if (b.name === 'sahor') {
      F.sahor = true;
      Game.banner('MIMI SAHOR CAUGHT! She gasps: "...you really came for RAMSI?" — a PORTAL tears open above! Step through to his ROOST!');
    } else if (b.sky) { this.finalizeSky(b); }
    else if (b.warden) { this.finalizeWarden(b); }
    else if (b.gnash) { this.finalizeGnash(b); }
    saveGame();
  },
  update(dt) {
    const b = Game.boss; if (!b) return;
    b.t += dt;
    if (b.caughtAnim > 0) { b.caughtAnim -= dt; if (b.caughtAnim <= 0) this.finalize(b); return; }
    if (!b.awake) { if (dist(Player.x, Player.y, b.x, b.y) < 78) this.wake(b); return; }
    if (b.sky) this.up_skyboss(b, dt); else if (b.warden) this.up_warden(b, dt); else if (b.gnash) this.up_gnash(b, dt); else this['up_' + b.name](b, dt);
  },
  // --- KING BILLY ---
  up_billy(b, dt) {
    if (b.dazed > 0) {
      b.dazed -= dt;
      // grab while dazed — ONE good grab tires Billy out
      if (Player.lungeT > 0 && dist(Player.x, Player.y, b.x, b.y) < 27) {
        b.hits = (b.hits || 0) + 1;
        if (b.hits >= 1) { this.catchBoss(b); return; }
        b.dazed = 0; b.state = 'idle'; b.stateT = 1.0; b.speed += 16;
        Player.inv = Math.max(Player.inv, 0.8);
        Audio2.jingle('step'); Particles.burst(b.x, b.y - 16, 'sparkle');
        Game.banner('GOTCHA — almost! Billy WRIGGLES FREE... and now he is ANGRY-fast!');
        return;
      }
      if (b.dazed <= 0) { b.speed += 14; Game.toast('Billy shakes it off — FASTER now!'); }
      return;
    }
    if (b.state === 'idle') {
      b.stateT -= dt;
      if (b.stateT <= 0) {
        b.state = 'charge';
        const d = Math.max(1, dist(b.x, b.y, Player.x, Player.y));
        b.vx = (Player.x - b.x) / d * b.speed; b.vy = (Player.y - b.y) / d * b.speed;
        Audio2.jingle('step');
      }
    } else {
      b.x += b.vx * dt; b.y += b.vy * dt;
      const ti = (b.x / TILE) | 0, tj = (b.y / TILE) | 0;
      const d = TILEDEFS[tileAt(Game.map, ti + Math.sign(b.vx), tj)] || {};
      const d2 = TILEDEFS[tileAt(Game.map, ti, tj + Math.sign(b.vy))] || {};
      if (d.solid || d2.solid || (TILEDEFS[tileAt(Game.map, ti, tj)] || {}).solid) {
        b.state = 'idle'; b.stateT = 1.1; b.vx = b.vy = 0;
        b.x = clamp(b.x, b.hx - 7 * TILE, b.hx + 7 * TILE); b.y = clamp(b.y, b.hy - 3 * TILE, b.hy + 5 * TILE);
      }
      if (Player.inv <= 0 && dist(Player.x, Player.y, b.x, b.y) < 16) Player.hurt(2);
    }
  },
  // --- SIR TWINKLE ---
  armTip(b, i) {
    const a = b.baseA + i * Math.PI * 2 / 5;
    const r = b.rad + Math.sin(b.t * 1.4) * 16;
    return [b.x + Math.cos(a) * r, b.y + Math.sin(a) * r];
  },
  up_twinkle(b, dt) {
    // the great starfish DRIFTS around his lair bowl
    b.baseA += b.spin * dt * (0.9 + 0.3 * Math.sin(b.t * 0.6));
    if (((b.t / 6) | 0) % 2 === 0 && b.spinFlip !== ((b.t / 6) | 0)) { b.spin *= -1; b.spinFlip = (b.t / 6) | 0; }
    b.x = b.hx + Math.cos(b.t * 0.33) * 30 + Math.sin(b.t * 0.18) * 10;
    b.y = b.hy + Math.sin(b.t * 0.47) * 22;
    const free = b.arms.map((a, i) => i).filter(i => !b.arms[i].trapped);
    if (!free.length) { this.catchBoss(b); return; }
    // his arms HUNGER for fish-snack cages: each free arm bends toward the
    // nearest unclaimed cage and gets STUCK fast when it touches
    const cages = Game.map.objects.filter(o => o.type === 'cageSet' && !o.done && o.bait === 'fishsnack');
    const claimed = new Set();
    for (const i of free) {
      const arm = b.arms[i];
      const nt = this.armTip(b, i);                  // natural sweeping tip
      let best = null, bd = 70;                      // attraction range (px)
      for (const o of cages) {
        if (claimed.has(o)) continue;
        const dd = dist(nt[0], nt[1], o.x * TILE + 8, o.y * TILE + 8);
        if (dd < bd) { bd = dd; best = o; }
      }
      if (best) {
        claimed.add(best);
        arm.bend = Math.min(1, (arm.bend || 0) + dt * 1.1);
        const cx = best.x * TILE + 8, cy = best.y * TILE + 8;
        arm.tx = lerp(nt[0], cx, arm.bend); arm.ty = lerp(nt[1], cy, arm.bend);
        if (arm.bend >= 1 || dist(arm.tx, arm.ty, cx, cy) < 6) {
          best.done = true; arm.trapped = true; arm.cx = cx; arm.cy = cy;
          Audio2.jingle('cage'); Particles.burst(cx, cy, 'sparkle');
          const left = b.arms.filter(a => !a.trapped).length;
          Game.banner(left ? 'CHOMP — an arm is STUCK on the snack cage! ' + left + ' arms left!' : 'ALL FIVE ARMS STUCK!');
        }
      } else {
        arm.bend = Math.max(0, (arm.bend || 0) - dt * 1.6);
        arm.tx = nt[0]; arm.ty = nt[1];
      }
      if (Player.inv <= 0 && dist(Player.x, Player.y, arm.tx, arm.ty) < 9) Player.hurt(1);
    }
    if (Player.inv <= 0 && dist(Player.x, Player.y, b.x, b.y) < 14) Player.hurt(1);
  },
  // --- CERBERUS ---
  up_cerberus(b, dt) {
    if (b.stun > 0) {
      b.stun -= dt;
      // ONE head soothed per grab — all three must be calmed
      if (Player.lungeT > 0 && dist(Player.x, Player.y, b.x, b.y) < 44) {
        b.heads = (b.heads === undefined ? 3 : b.heads) - 1;
        if (b.heads <= 0) { this.catchBoss(b); return; }
        b.stun = 0; b.state = 'pause'; b.stateT = 3;   // REELS for a few seconds — get away!
        Player.inv = Math.max(Player.inv, 1.2);
        Audio2.jingle('step'); Particles.burst(b.x, b.y - 12, 'sparkle');
        Game.banner('One head soothed (' + (3 - b.heads) + '/3)! Cerberus REELS — RUN before the ZOOMIES return!');
        return;
      }
      return;
    }
    b.stateT -= dt;
    if (b.stateT <= 0) {
      b.state = b.state === 'alert' ? 'drowsy' : 'alert'; b.stateT = b.state === 'alert' ? 6 : 4.5;
      Game.toast(b.state === 'alert' ? 'CERBERUS: ZOOMIES!! (run!)' : 'Cerberus yawns... so drowsy... (NOW, the bone!)');
    }
    if (b.state === 'alert') {
      const d = Math.max(1, dist(b.x, b.y, Player.x, Player.y));
      b.x += (Player.x - b.x) / d * 52 * dt; b.y += (Player.y - b.y) / d * 52 * dt;
      b.x = clamp(b.x, b.hx - 6 * TILE, b.hx + 6 * TILE); b.y = clamp(b.y, b.hy - 3 * TILE, b.hy + 4 * TILE);
      if (Player.inv <= 0 && dist(Player.x, Player.y, b.x, b.y) < 25) Player.hurt(2);
    }
  },
  // --- MIMI SAHOR ---
  sahorPerches() { return [[6, 6], [23, 6], [6, 16], [23, 16]]; },
  up_sahor(b, dt) {
    if (b.phase === 1) {
      b.perchT -= dt;
      if (b.perchT <= 0) { b.perch = (b.perch + 1 + ((Math.random() * 3) | 0)) % 4; b.perchT = 2.8; Particles.burst(b.x, b.y - 10, 'sparkle'); }
      const [pi, pj] = this.sahorPerches()[b.perch];
      b.x = pi * TILE + 8; b.y = pj * TILE + 4;
      b.ringX = pi * TILE + 8; b.ringY = (pj + 1) * TILE + 8;
      if (b.ringHits >= 3) {
        b.phase = 2; b.pathT = 0;
        Game.banner('SAHOR: "Okay okay! Round 2: catch me on the RUN! Bet you have no... RAINBOW BERRY?!"');
      }
    } else {
      b.pathT += dt * 0.22;
      // run the arena perimeter (rect 5..25 x 5..18)
      const per = b.pathT % 1;
      const X0 = 5 * TILE, X1 = 25 * TILE, Y0 = 5 * TILE, Y1 = 18 * TILE;
      const wTop = (X1 - X0), hSide = (Y1 - Y0), total = 2 * (wTop + hSide);
      let dd = per * total;
      if (dd < wTop) { b.x = X0 + dd; b.y = Y0; }
      else if (dd < wTop + hSide) { b.x = X1; b.y = Y0 + (dd - wTop); }
      else if (dd < 2 * wTop + hSide) { b.x = X1 - (dd - wTop - hSide); b.y = Y1; }
      else { b.x = X0; b.y = Y1 - (dd - 2 * wTop - hSide); }
      for (const o of Game.map.objects) {
        if (o.type === 'cageSet' && !o.done && o.bait === 'berry' && dist(b.x, b.y, o.x * TILE + 8, o.y * TILE + 8) < 14) {
          o.done = true; this.catchBoss(b);
          Game.banner('SAHOR: "A RAINBOW BERRY?! ...worth it." CHOMP!');
        }
      }
      if (Player.inv <= 0 && dist(Player.x, Player.y, b.x, b.y) < 12) Player.hurt(1);
    }
  },
  harpoonHit(h) {
    const b = Game.boss; if (!b || !b.awake || b.caughtAnim > 0) return false;
    if (b.name === 'billy' && b.state === 'charge' && dist(h.x, h.y, b.x, b.y) < 26) {
      b.dazed = 2.6; b.state = 'idle'; b.stateT = 1; b.vx = b.vy = 0;
      Audio2.jingle('cage'); Game.banner('BILLY IS DAZED! RUN UP AND GRAB HIM (SPACE)!'); return true;
    }
    if (b.name === 'billy' && b.state !== 'charge' && dist(h.x, h.y, b.x, b.y) < 26) {
      Game.toast('Bonk! His armor shrugs it off. Harpoon him MID-CHARGE!'); return true;
    }
    if (b.name === 'sahor' && b.phase === 1 && dist(h.x, h.y, b.ringX, b.ringY) < 12) {
      b.ringHits++; Audio2.jingle('key'); Particles.burst(b.ringX, b.ringY, 'sparkle');
      Game.banner('Ring hooked! (' + b.ringHits + '/3) She blinks away...');
      b.perch = (b.perch + 1) % 4; b.perchT = 2.8; return true;
    }
    return false;
  },
  boneHit(bn) {
    const b = Game.boss; if (!b || !b.awake || b.caughtAnim > 0) return false;
    if (b.name === 'cerberus' && dist(bn.x, bn.y, b.x, b.y) < 42) {
      if (b.state === 'drowsy') { b.stun = 3.4; Audio2.jingle('cage'); Game.banner('BONK! Cerberus wobbles... GRAB A HEAD (SPACE)!'); }
      else Game.toast('He caught it mid-zoomies and ate it. Wait for DROWSY!');
      return true;
    }
    return false;
  },
  draw(c) {
    const b = Game.boss; if (!b) return;
    const scale = b.caughtAnim > 0 ? Math.max(0.05, b.caughtAnim / 1.6) : 1;
    const bob = b.awake ? Math.sin(b.t * 3) * 2 : Math.sin(b.t * 1.2) * 1;
    c.save();
    c.translate(Math.round(b.x), Math.round(b.y + bob));
    c.scale(scale, scale);
    c.fillStyle = 'rgba(20,10,40,.35)';
    c.beginPath(); c.ellipse(0, 2, 14, 4, 0, 0, 7); c.fill();
    if (b.sky) { this.drawSkyBoss(c, b); }
    else if (b.warden) { this.drawWarden(c, b); }
    else if (b.gnash) { this.drawGnash(c, b); }
    else if (b.gnashara) { this.drawGnashara(c, b); }
    else if (b.name === 'billy') {
      if (b.dazed > 0) c.rotate(Math.sin(b.t * 10) * 0.1);
      dspr(c, Sprites.billy, -16, -26);
      if (b.dazed > 0) drawText(c, '@..@', -10, -34, 7, '#f8e858');
    } else if (b.name === 'twinkle') {
      // arms
      for (let i = 0; i < 5; i++) {
        const arm = b.arms[i];
        if (arm.trapped) {
          c.save(); c.translate(arm.cx - b.x, arm.cy - b.y - bob);
          c.globalAlpha = 0.8; dspr(c, Sprites.props.cage, -7, -4); c.globalAlpha = 1; c.restore();
          continue;
        }
        let tipx = arm.tx, tipy = arm.ty;
        if (!Number.isFinite(tipx) || (tipx === 0 && tipy === 0)) { const nt0 = this.armTip(b, i); tipx = nt0[0]; tipy = nt0[1]; }
        const lx = tipx - b.x, ly = tipy - b.y;
        for (let s = 1; s <= 5; s++) {
          const bx = lx * s / 5, by = ly * s / 5;
          c.fillStyle = '#241a33'; c.beginPath(); c.arc(bx, by, s === 5 ? 5 : 3.6, 0, 7); c.fill();
          c.fillStyle = (s === 5 && (arm.bend || 0) > 0.05) ? (((b.t * 6 | 0) % 2) ? '#fff' : '#f8e858') : (s === 5 ? '#f89238' : '#e87898');
          c.beginPath(); c.arc(bx, by, s === 5 ? 4 : 2.6, 0, 7); c.fill();
        }
      }
      dspr(c, Sprites.twinkle, -10, -7);
    } else if (b.name === 'cerberus') {
      if (b.stun > 0 || b.state === 'pause') c.rotate(Math.sin(b.t * 10) * 0.08);
      c.save(); c.scale(1.75, 1.75); dspr(c, Sprites.cerb, -13, -15); c.restore();   // BOSS-sized three-headed pup
      if (b.state === 'drowsy' && b.stun <= 0) drawText(c, 'z z Z', 14, -42, 7, '#9adcf8');
      if (b.stun > 0 || b.state === 'pause') drawText(c, '@..@', -8, -42, 7, '#f8e858');
    } else if (b.name === 'sahor') {
      if (b.phase === 1 && b.awake && Number.isFinite(b.ringX)) {
        // glowing ring at pillar base
        c.save(); c.translate(b.ringX - b.x, b.ringY - b.y - bob);
        c.strokeStyle = ((b.t * 5 | 0) % 2) ? '#f8e858' : '#fff'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(0, 0, 7, 4, 0, 0, 7); c.stroke(); c.restore();
        dspr(c, Sprites.sahor, -12, -34);   // perched atop pillar
      } else {
        dspr(c, Sprites.sahor, -12, -26);
      }
    }
    c.restore();
  },
};
// wire boss hit hooks into the game/projectile system
Game.bossHarpoonHit = (h) => Bosses.harpoonHit(h);
Game.bossBoneHit = (b) => Bosses.boneHit(b);
