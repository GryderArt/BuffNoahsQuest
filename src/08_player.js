"use strict";
// ================= Noah: movement, elevation rules, tools =================
const Player = {
  x: 0, y: 0, dir: 'down', anim: 0, moving: false,
  hearts: 6, maxHearts: 6, inv: 0,            // half-hearts
  airborne: false, airT: 0, flight: false, flapY: 0,
  swimming: false, wearingSuit: false, elev: 0,
  toolAnim: 0, tool: 'mitts', lungeT: 0, netT: 0,
  harpoon: null, bone: null, grab: null, grabT: 0, mantleT: 0,
  ledge: null, landT: 0,                       // ledge: {fx,fy,tx,ty,t,dur,kind}
  stuckT: 0, dizzy: 0,
  reset(x, y) { this.x = x * TILE + 8; this.y = y * TILE + 12; this.airborne = false; this.flight = false; this.harpoon = null; this.bone = null; this.lungeT = 0; this.netT = 0; this.swimming = false; this.dizzy = 0; this.grab = null; this.mantleT = 0; this.ledge = null; this.landT = 0; this.lastWarpTile = null; this.gArc = null; },
  footTile() { return [(this.x / TILE) | 0, (this.y / TILE) | 0]; },

  canEnter(map, ti, tj, fi, fj) {
    const id = tileAt(map, ti, tj), d = TILEDEFS[id] || {};
    const F = Game.flags;
    if (d.door) return Game.doorIsOpen(map, ti, tj);
    if (d.gate) return !!map.gateOpen;
    if (d.solid) return false;
    const eCur = elevAt(map, fi, fj), eNew = elevAt(map, ti, tj);
    if (id === 'water' && !map.underwater) {
      if (F.suit) return true;                      // swim
      return this.airborne && !this.flight;         // jump across
    }
    if (d.hole && id !== 'water') { if (!this.airborne) return false; }
    if (d.rift) { if (!(this.airborne && this.flight) && !Game.asteroidCovers(ti, tj)) return false; }
    const curStair = (TILEDEFS[tileAt(map, fi, fj)] || {}).stair, newStair = d.stair;
    if (eNew > eCur) {
      const diff = eNew - eCur;
      if ((curStair || newStair) && diff <= 1) return true;
      if (diff === 1) {
        if (d.slick) return !!F.gloves;             // slick wall: gloves ONLY
        if (F.gloves) return true;
        if (this.airborne && F.sandals) return true;
        return false;
      }
      return false;
    }
    return true;  // same level or hop down
  },
  tryMove(map, dx, dy, dt) {
    const spd = (60 + (Game.flags.upg_speed || 0) * 14) * (this.swimming ? 0.62 : 1) * (this.airborne ? 1.55 : 1) * dt;
    let moved = false;
    const [fi, fj] = this.footTile();
    const attempt = (nx, ny) => {
      const ti = (nx / TILE) | 0, tj = (ny / TILE) | 0;
      // escape rule: a tile you already overlap can never block you
      if (ti === fi && tj === fj) return true;
      if (!this.canEnter(map, ti, tj, fi, fj)) return false;
      // ledge transitions become real CLIMB / HOP-DOWN animations
      if (!this.airborne && !this.ledge && this.lungeT <= 0) {
        const eC = elevAt(map, fi, fj), eN = elevAt(map, ti, tj);
        const anyStair = (TILEDEFS[tileAt(map, fi, fj)] || {}).stair || (TILEDEFS[tileAt(map, ti, tj)] || {}).stair;
        if (!anyStair && eN !== eC && eN < 9 && eC < 9) {
          this.startLedge(ti, tj, eN > eC ? 'climb' : 'hop');
          return false;   // the animation carries us; no slide this frame
        }
      }
      return true;
    };
    if (dx) { const nx = this.x + dx * spd; if (attempt(nx + Math.sign(dx) * 4, this.y)) { this.x = nx; moved = true; } }
    if (dy) { const ny = this.y + dy * spd; if (attempt(this.x, ny + (dy > 0 ? 2 : -3))) { this.y = ny; moved = true; } }
    this.x = clamp(this.x, 6, map.w * TILE - 6); this.y = clamp(this.y, 8, map.h * TILE - 2);
    return moved;
  },
  unstick(map) {
    const [fi, fj] = this.footTile();
    const okTile = (i, j) => {
      const id = tileAt(map, i, j), d = TILEDEFS[id] || {};
      return !d.solid && !d.hole && !d.rift && !d.gate && !(id === 'water' && !map.underwater && !Game.flags.suit) && id !== 'deep';
    };
    if (okTile(fi, fj)) return;   // current spot is fine — nothing to do
    const seen = new Set([fi + ',' + fj]), q = [[fi, fj]];
    while (q.length) {
      const [i, j] = q.shift();
      const ok = okTile(i, j) && !(TILEDEFS[tileAt(map, i, j)] || {}).door;
      if (ok && !(i === fi && j === fj)) { this.x = i * TILE + 8; this.y = j * TILE + 12; Game.toast('Unstuck!'); return; }
      for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const k = (i + di) + ',' + (j + dj);
        if (!seen.has(k) && i + di >= 0 && j + dj >= 0 && i + di < map.w && j + dj < map.h) { seen.add(k); q.push([i + di, j + dj]); }
      }
    }
  },
  update(map, dt) {
    if (this.inv > 0) this.inv -= dt;
    if (this.dizzy > 0) { this.dizzy -= dt; if (this.dizzy <= 0) { Game.respawn(); } return; }
    if (this.mantleT > 0) this.mantleT -= dt;
    if (this.landT > 0) this.landT -= dt;
    if (this.gArc) {                                   // Ramsi-assisted glide / pillow-bounce arc
      const a = this.gArc; a.t += dt; const pr = Math.min(1, a.t / a.dur);
      this.x = lerp(a.x0, a.x1, pr); this.y = lerp(a.y0, a.y1, pr) - Math.sin(pr * Math.PI) * a.arcH;
      this.airborne = true; this.flight = false; this.airT = 0.2; this.elev = 0; this.anim += dt;
      if (pr >= 1) {
        this.x = a.x1; this.y = a.y1; this.gArc = null; this.airborne = false; this.landT = 0.16;
        this.lastSafe = [this.x, this.y]; Particles.burst(this.x, this.y, 'dust');
        if (Game.companion) { Game.companion.glide = 0; Game.companion.busyT = 0; }
      }
      return;
    }
    if (this.ledge) { this.updateLedge(map, dt); this.anim += dt; return; }
    if (this.grab) { this.updateGrab(map, dt); return; }
    if (this.gSlide) this.gSlide = null;            // a slide cannot outlive its grab
    let dx = 0, dy = 0;
    if (keyHeld('ArrowLeft') || keyHeld('a')) dx = -1;
    if (keyHeld('ArrowRight') || keyHeld('d')) dx = 1;
    if (keyHeld('ArrowUp') || keyHeld('w')) dy = -1;
    if (keyHeld('ArrowDown') || keyHeld('s')) dy = 1;
    if (dx || dy) {
      this.dir = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
      if (dx && dy) this.dir = dx < 0 ? 'left' : 'right';
      const moved = this.tryMove(map, dx, dy, dt);
      this.moving = true; this.anim += dt;
      if (!moved && !this.airborne) {
        // only rescue when genuinely BOXED IN (all four neighbors blocked)
        const [fi, fj] = this.footTile();
        const boxed = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([di, dj]) => !this.canEnter(map, fi + di, fj + dj, fi, fj));
        if (boxed) { this.stuckT += dt; if (this.stuckT > 0.9) { this.stuckT = 0; this.unstick(map); } }
        else this.stuckT = 0;
      }
      else this.stuckT = 0;
    } else { this.moving = false; this.stuckT = 0; }
    // airborne arc
    if (this.airborne) {
      this.airT += dt;
      const dur = this.flight ? 0.55 : 0.42 + (Game.flags.upg_jump || 0) * 0.08;
      if (this.airT >= dur) {
        // landing check: if on a hole, nudge to last safe... rely on canEnter preventing illegal landings mid-move
        const [fi, fj] = this.footTile();
        const id = tileAt(map, fi, fj), d = TILEDEFS[id] || {};
        if ((d.hole || d.rift || (id === 'water' && !map.underwater && !Game.flags.suit)) && !Game.asteroidCovers(fi, fj)) {
          if (this.flight) { this.airT = dur - 0.2; }   // keep gliding until solid ground
          else { this.airborne = false; this.hurt(1); this.x = this.lastSafe[0]; this.y = this.lastSafe[1]; }
        } else { this.airborne = false; this.flight = false; this.landT = 0.16; Particles.burst(this.x, this.y - this.elev * EOFF, 'dust'); }
      }
    } else {
      const [fi, fj] = this.footTile();
      const id = tileAt(map, fi, fj), d = TILEDEFS[id] || {};
      if (!d.hole && !d.rift && !(id === 'water' && !Game.flags.suit && !map.underwater)) this.lastSafe = [this.x, this.y];
      const wasSwimming = this.swimming;
      this.swimming = !map.underwater && id === 'water' && Game.flags.suit;
      if (this.swimming || map.underwater) this.wearingSuit = true;
      if (wasSwimming && !this.swimming && this.wearingSuit && !Game.flags.suitHint) {
        Game.flags.suitHint = true;
        Game.toast('Looking SLICK in that wetsuit! Press U to change back (or strut all day).');
      }
    }
    const [fi2, fj2] = this.footTile();
    this.elev = Math.min(elevAt(map, fi2, fj2), 8);
    // projectiles
    if (this.lungeT > 0) {
      this.lungeT -= dt;
      const [mx, my] = DIRS[this.dir];
      this.tryMove(map, mx, my, dt * (2.2 + (Game.flags.upg_lunge || 0) * 0.9));
      Game.checkToolCatch('mitts', this.x + mx * 10, this.y + my * 10, 11);
      const ci = ((this.x + mx * 12) / TILE) | 0, cj = ((this.y + my * 12) / TILE) | 0;
      if ((TILEDEFS[tileAt(map, ci, cj)] || {}).crack) { if (Game.flags.ramsuit) Game.smashCrack(map, ci, cj); else Game.toast('A CRACKED wall! Real horsepower could smash it...'); }
    }
    if (this.netT > 0) {
      this.netT -= dt;
      const [mx, my] = DIRS[this.dir];
      Game.checkToolCatch('net', this.x + mx * 13, this.y + my * 13 - 4, 14 + (Game.flags.upg_net || 0) * 4);
    }
    if (this.harpoon) this.updateHarpoon(map, dt);
    if (this.bone) this.updateBone(map, dt);
  },
  // ---- ledge transitions: climbing mantle / springy hop-down ----
  startLedge(ti, tj, kind) {
    this.ledge = { fx: this.x, fy: this.y, tx: ti * TILE + 8, ty: tj * TILE + 12, t: 0, dur: kind === 'climb' ? 0.32 : 0.2, kind };
    Audio2.jingle(kind === 'climb' ? 'cage' : 'jump');
    if (kind === 'climb') Particles.burst(this.x, this.y - this.elev * EOFF, 'dust');
  },
  updateLedge(map, dt) {
    const L = this.ledge;
    L.t += dt;
    const p = Math.min(1, L.t / L.dur);
    const ease = p * p * (3 - 2 * p);
    this.x = lerp(L.fx, L.tx, ease); this.y = lerp(L.fy, L.ty, ease);
    if (p >= 1) {
      this.x = L.tx; this.y = L.ty; this.ledge = null;
      const [fi, fj] = this.footTile();
      this.elev = Math.min(elevAt(map, fi, fj), 8);
      this.landT = L.kind === 'hop' ? 0.16 : 0.1;
      Particles.burst(this.x, this.y - this.elev * EOFF, 'dust');
      if (L.kind === 'hop') Audio2.jingle('step');
    }
  },
  // ---- POWER BRACERS block grab: hold SPACE, arrows push/pull ----
  updateGrab(map, dt) {
    const o = this.grab;
    if (!keyHeld(' ') || !Game.map.objects.includes(o) || tileAt(map, o.x, o.y) === 'switch') {
      if (this.gSlide) { this.x = this.gSlide.tx; this.y = this.gSlide.ty; this.gSlide = null; }
      this.grab = null; return;
    }
    // smooth slide: Noah and the block glide tile-to-tile instead of teleporting
    if (this.gSlide) {
      const p = Math.min(1, (Game.time - this.gSlide.start) / 0.2);
      const ee = p * p * (3 - 2 * p);
      this.x = lerp(this.gSlide.fx, this.gSlide.tx, ee);
      this.y = lerp(this.gSlide.fy, this.gSlide.ty, ee);
      this.moving = true; this.anim += dt;
      if (p < 1) return;
      this.gSlide = null; this.grabT = 0.19;
      Particles.burst(o.x * TILE + 8, o.y * TILE + 8, 'dust');
    }
    this.grabT += dt;
    const f = DIRS[this.dir];                       // facing vector (toward block)
    let move = 0;                                   // +1 push, -1 pull
    if ((keyHeld('ArrowRight') || keyHeld('d')) ) move = f[0] === 1 ? 1 : f[0] === -1 ? -1 : 0;
    else if ((keyHeld('ArrowLeft') || keyHeld('a'))) move = f[0] === -1 ? 1 : f[0] === 1 ? -1 : 0;
    else if ((keyHeld('ArrowDown') || keyHeld('s'))) move = f[1] === 1 ? 1 : f[1] === -1 ? -1 : 0;
    else if ((keyHeld('ArrowUp') || keyHeld('w'))) move = f[1] === -1 ? 1 : f[1] === 1 ? -1 : 0;
    if (!move) { this.grabT = 0.18; return; }
    if (this.grabT < 0.22) return;
    this.grabT = 0;
    const blockFree = (i, j) => {
      const id = tileAt(map, i, j), d = TILEDEFS[id] || {};
      if (d.solid || d.hole || d.rift || d.door || d.gate) return false;
      for (const o2 of map.objects) if (o2 !== o && o2.x === i && o2.y === j && o2.type !== 'sign') return false;
      return true;
    };
    const [fi, fj] = this.footTile();
    if (move === 1) {                              // PUSH: block forward, Noah follows
      const nx = o.x + f[0], ny = o.y + f[1];
      if (!blockFree(nx, ny)) return;
      const oldBX = o.x, oldBY = o.y;
      o.slideFrom = [o.x, o.y]; o.slideStart = Game.time;
      o.x = nx; o.y = ny;
      this.gSlide = { fx: this.x, fy: this.y, tx: oldBX * TILE + 8, ty: oldBY * TILE + 12, start: Game.time };
      Audio2.jingle('push');
    } else {                                       // PULL: Noah steps back, block follows
      const pi = fi - f[0], pj = fj - f[1];
      if (!this.canEnter(map, pi, pj, fi, fj)) return;
      const id = tileAt(map, pi, pj), d = TILEDEFS[id] || {};
      if (d.hole || d.rift || (id === 'water' && !map.underwater)) return;   // never pull yourself into a pit
      o.slideFrom = [o.x, o.y]; o.slideStart = Game.time;
      o.x = fi; o.y = fj;
      this.gSlide = { fx: this.x, fy: this.y, tx: pi * TILE + 8, ty: pj * TILE + 12, start: Game.time };
      Audio2.jingle('push');
    }
    if (tileAt(map, o.x, o.y) === 'switch') this.grab = null;   // it clicks in — let go
  },
  lunge() {
    if (this.dizzy > 0 || this.lungeT > 0) return;
    this.lungeT = 0.2 + ((Game.flags.upg_lunge || 0)) * 0.05;
    Audio2.jingle('step');
  },
  jump() {
    if (this.dizzy > 0) return;
    if (!this.airborne) {
      if (!Game.flags.sandals) { Game.toast('Noah hops a tiny hop. (Spring Sandals would help!)'); return; }
      this.airborne = true; this.flight = false; this.airT = 0; Audio2.jingle('jump');
    } else if (Game.flags.wings && !(Game.map && Game.map.noFly)) {
      this.flight = true; this.airT = Math.min(this.airT, 0.15); Audio2.jingle('flap'); this.flapY = 1;
    }
  },
  useTool() {
    if (this.dizzy > 0) return;
    const t = this.tool, F = Game.flags;
    if (t === 'mitts') { this.lunge(); }
    else if (t === 'net' && F.net) {
      this.netT = 0.22; Audio2.jingle('step');
      if ((F.upg_net || 0) >= 2) { // net launcher: flying net
        const [mx, my] = DIRS[this.dir];
        Game.flyingNets.push({ x: this.x, y: this.y - 6, vx: mx * 130, vy: my * 130, life: 0.6 });
      }
    }
    else if (t === 'harpoon' && F.harpoon) {
      if (this.harpoon) return;
      const [mx, my] = DIRS[this.dir];
      this.harpoon = { x: this.x, y: this.y - 6, vx: mx * 230, vy: my * 230, dist: 0, max: (7 + (F.upg_harpoon ? 3 : 0)) * TILE, state: 'out' };
    }
    else if (t === 'cage' && F.cage) Game.openBaitMenu();
    else if (t === 'bone' && F.bone) {
      if (this.bone) return;
      const [mx, my] = DIRS[this.dir];
      this.bone = { x: this.x, y: this.y - 6, vx: mx * 170, vy: my * 170, t: 0 };
    }
    else Game.toast("Noah doesn't have that tool yet!");
  },
  updateHarpoon(map, dt) {
    const h = this.harpoon;
    if (h.state === 'out') {
      h.x += h.vx * dt; h.y += h.vy * dt; h.dist += Math.hypot(h.vx, h.vy) * dt;
      // hit post?
      for (const o of Game.map.objects) {
        if (o.type !== 'post') continue;
        if (dist(this.x, this.y, o.x * TILE + 8, o.y * TILE + 8) < 20) continue;   // not the post underfoot/beside you
        if (dist(h.x, h.y, o.x * TILE + 8, o.y * TILE + 8) < 9) {
          h.state = 'pull'; h.px = (o.land ? o.land[0] : o.x) * TILE + 8; h.py = (o.land ? o.land[1] : o.y) * TILE + 12; Audio2.jingle('key'); return;   // o.land = SWING across to a far roof
        }
      }
      if (Game.bossHarpoonHit && Game.bossHarpoonHit(h)) { this.harpoon = null; return; }
      const hit = Game.checkToolCatch('harpoon', h.x, h.y, 8);
      if (hit) { this.harpoon = null; return; }
      const ti = (h.x / TILE) | 0, tj = (h.y / TILE) | 0;
      const hid = tileAt(map, ti, tj), hd = TILEDEFS[hid] || {};
      // projectiles fly OVER water/deep (only real walls stop them)
      const blocked = hd.solid && hid !== 'deep' && hid !== 'water';
      if (h.dist > h.max || blocked) this.harpoon = null;
    } else { // pull Noah to the post
      const d = dist(this.x, this.y, h.px, h.py);
      if (d < 4) { this.x = h.px; this.y = h.py; this.harpoon = null; this.airborne = false; Particles.burst(this.x, this.y, 'dust'); }
      else { this.x += (h.px - this.x) / d * 260 * dt; this.y += (h.py - this.y) / d * 260 * dt; }
    }
  },
  updateBone(map, dt) {
    const b = this.bone;
    b.t += dt;
    if (b.t > 0.32) { // return
      const d = dist(b.x, b.y, this.x, this.y);
      if (d < 8) { this.bone = null; return; }
      b.x += (this.x - b.x) / d * 200 * dt; b.y += (this.y - b.y) / d * 200 * dt;
    } else { b.x += b.vx * dt; b.y += b.vy * dt; }
    if (Game.bossBoneHit && Game.bossBoneHit(b)) { b.t = Math.max(b.t, 0.33); return; }
    if (Game.boneInteract) Game.boneInteract(b);
    for (const c of Game.creatures) {
      if (!c.display && c.state !== 'gone' && c.state !== 'trapped' && c.stun <= 0 && dist(b.x, b.y, c.x, c.y) < 10) {
        c.stun = 6; Audio2.jingle('cage'); Particles.burst(c.x, c.y - 8, 'sparkle'); b.t = Math.max(b.t, 0.33);
      }
    }
  },
  hurt(half) {
    if (this.inv > 0 || this.dizzy > 0) return;
    if (Game.flags.ramShield && Game.companion && Game.companion.shield > 0) { Game.companion.shield = 0; Game.companion.shieldCool = 6; this.inv = 1.0; Audio2.jingle('cage'); Game.toast('RAMSI shields you!'); return; }
    this.hearts -= half; this.inv = 1.1; Audio2.jingle('hurt');
    if (this.hearts <= 0) { this.hearts = 0; this.dizzy = 1.4; Game.toast('Noah got dizzy! Hee hee...'); }
  },
  draw(c) {
    const underwater = Game.map.underwater;
    const set = (this.swimming || underwater || this.wearingSuit) ? Sprites.noahDive : Sprites.noah;
    let frames = set[this.dir];
    let f = 0;
    if (this.moving) {
      // 2-frame art alternates steps; 4-frame art plays the full gait
      // (a=left step, c=pass, b=right step, d=pass)
      const n = frames.length;
      const step = ((this.anim * (n > 2 ? 10 : 7)) | 0) % n;
      f = (n === 4) ? [0, 2, 1, 3][step] : step;
    }
    let swimTilt = 0;
    if (underwater && Sprites.noahSwim) {
      // real SWIM pose: prone body, kick frames, gentle tilt + idle flutter
      const hdir = (this.dir === 'left') ? 'left' : 'right';
      frames = Sprites.noahSwim[hdir];
      f = ((this.anim * 5 | 0) % frames.length);
      if (!this.moving) f = ((Game.time * 2 | 0) % frames.length);
      swimTilt = Math.sin(Game.time * 3 + this.x * 0.05) * 0.12;
    } else if (this.swimming && Sprites.noahSurf) {
      // SURFACE swim: head above the waterline, splashy crawl
      const hdir = (this.dir === 'left') ? 'left' : 'right';
      frames = Sprites.noahSurf[hdir];
      f = this.moving ? ((this.anim * 5 | 0) % frames.length) : ((Game.time * 2 | 0) % frames.length);
    }
    let spr = frames[f];
    let jumpH = this.airborne ? Math.sin(Math.PI * Math.min(1, this.airT / (this.flight ? 0.55 : 0.42 + (Game.flags.upg_jump || 0) * 0.08))) * (this.flight ? 10 : 9) : 0;
    let ex = this.elev * EOFF;
    // ledge animation: climb pose & smooth height blend, little hop arc
    if (this.ledge) {
      const L = this.ledge, p = Math.min(1, L.t / L.dur);
      const eFrom = Math.min(elevAt(Game.map, (L.fx / TILE) | 0, (L.fy / TILE) | 0), 8);
      const eTo = Math.min(elevAt(Game.map, (L.tx / TILE) | 0, (L.ty / TILE) | 0), 8);
      ex = lerp(eFrom * EOFF, eTo * EOFF, p);
      if (L.kind === 'climb') { spr = set.climb; jumpH = Math.sin(Math.PI * p) * 3 + (((L.t * 16) | 0) % 2); }
      else jumpH = Math.sin(Math.PI * p) * 7;
    }
    // shadow (not while afloat — the splash line does the grounding)
    if (!this.swimming) {
      c.fillStyle = 'rgba(20,10,40,.32)';
      c.beginPath(); c.ellipse(this.x, this.y + 1 - ex, 6 - (this.airborne ? 2 : 0), 2.4, 0, 0, 7); c.fill();
    }
    if (this.inv > 0 && ((this.inv * 12 | 0) % 2)) return;
    const sx = Math.round(this.x - 8), sy = Math.round(this.y - 18 - ex - jumpH + (this.swimming ? 4 : 0));
    // squash & stretch: stretch on take-off / rise, squash on landing
    let sclX = 1, sclY = 1;
    if (this.airborne) { const t = Math.min(1, this.airT / 0.42); sclY = 1 + 0.14 * Math.sin(Math.PI * Math.min(1, t * 1.6)); sclX = 2 - sclY; }
    if (this.landT > 0) { const q = this.landT / 0.16; sclY = 1 - 0.2 * q; sclX = 1 + 0.22 * q; }
    if (sclX !== 1 || sclY !== 1) {
      c.save(); c.translate(this.x, this.y - ex + 2); c.scale(sclX, sclY); c.translate(-this.x, -(this.y - ex + 2));
      this._scaled = true;
    } else this._scaled = false;
    if (this.dizzy > 0) { c.save(); c.translate(this.x, sy + 10); c.rotate(Math.sin(this.dizzy * 20) * 0.3); c.translate(-this.x, -sy - 10); }
    if (swimTilt) { c.save(); c.translate(this.x, sy + 8); c.rotate(swimTilt); c.translate(-this.x, -sy - 8); this._swimRot = true; } else this._swimRot = false;
    // angel wings while flying
    if (this.airborne && this.flight) {
      c.fillStyle = '#fff';
      const w = Math.sin(Game.time * 18) * 3;
      c.beginPath(); c.ellipse(this.x - 9, sy + 8, 5, 3 + w, -0.5, 0, 7); c.ellipse(this.x + 9, sy + 8, 5, 3 + w, 0.5, 0, 7); c.fill();
    }
    dspr(c, spr, sx, sy);
    if (this._swimRot) { c.restore(); this._swimRot = false; }
    if (this.dizzy > 0) c.restore();
    if (this._scaled) { c.restore(); this._scaled = false; }
    // (waterline foam now lives in the surface-swim sprite itself)
  },
  // tool projectiles drawn in a TOP overlay so they never clip under terrain (downward bug)
  drawFx(c) {
    const ex = this.elev * EOFF;
    if (this.netT > 0) {
      const [mx, my] = DIRS[this.dir];
      c.strokeStyle = '#f0e8d8'; c.lineWidth = 1;
      c.beginPath(); c.arc(this.x + mx * 10, this.y - 8 - ex + my * 10, 13 + (Game.flags.upg_net || 0) * 4, 0, 7); c.stroke();
      c.strokeStyle = 'rgba(240,232,216,.4)'; c.beginPath(); c.arc(this.x + mx * 10, this.y - 8 - ex + my * 10, 9, 0, 7); c.stroke();
    }
    if (this.harpoon) {
      const h = this.harpoon;
      c.strokeStyle = '#caa05c'; c.lineWidth = 1; c.beginPath(); c.moveTo(this.x, this.y - 8 - ex); c.lineTo(h.x, h.y - ex); c.stroke();
      c.fillStyle = '#f8b800'; c.fillRect(h.x - 2, h.y - 2 - ex, 4, 4);
    }
    if (this.bone) { c.save(); c.translate(this.bone.x, this.bone.y - ex); c.rotate(this.bone.t * 14); dspr(c, Sprites.items.bone, -3, -3); c.restore(); }
  }
};
