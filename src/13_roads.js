"use strict";
// ================= ROAD AMBUSHES: side-scrolling trouble between zones =================
// Mario-style pop-up levels at the midpoint of world-map legs. Gravity, stomps,
// coins, springs, checkpoints, and a 3-stomp mini-boss at the end of each road.

const ROAD_TILE = 16, ROAD_H = 14, ROAD_TOP = 28;   // grid height + HUD band
const ROAD_SOLID = { '#': 1, '=': 1, 'B': 1, '<': 1, '>': 1 };
const ROAD_FLAPS = 5;   // wing rule on roads: FIVE flaps per flight, land to refill; gliding is free

// ---- segment-based level authoring (each block is 14 rows tall) ----
function roadSeg(s) { return s.split('\n').filter(r => r.length); }
function roadJoin(segs) {
  const rows = new Array(ROAD_H).fill('');
  for (const seg of segs) {
    const w = Math.max(...seg.map(r => r.length));
    for (let j = 0; j < ROAD_H; j++) rows[j] += (seg[j] || '').padEnd(w, ' ');
  }
  return rows;
}
const RS = {
  flat: (n) => roadSeg(
    ' \n \n \n \n \n \n \n \n \n \n \n \n' + '#'.repeat(n) + '\n' + '#'.repeat(n)),
};

// ---------------- the three roads ----------------
function buildRoadLevels() {
  const L = {};
  // ======== 1. THE BRAMBLE ROAD (vale -> coast) ========
  L.bramble = {
    name: 'THE BRAMBLE ROAD', theme: 'bramble', boss: 'tollgoat', gravity: 1,
    intro: 'BANDITS ON THE ROAD! Hop the brambles, BOP the bandits (land on their heads), and beat their boss!',
    rows: roadJoin([
roadSeg(`
............
............
............
............
............
............
............
............
............
.......o....
......ooo...
............
############
############`),
roadSeg(`
..............
..............
..............
..............
..............
..............
..............
..............
.....o........
....o.o..w....
...o...o......
..............
####..########
####..########`),
roadSeg(`
................
................
................
................
................
................
.........o.o...
....BB...o.o...
....BB.h.......
..............w
####...#########
####...#########
################
################`),
roadSeg(`
..................
..................
..................
..................
..................
..................
......oooo........
.....B....B.......
....B......B......
...B........B..w..
..................
.....^^^^^^.......
##################
##################`),
roadSeg(`
..............
..............
..............
..............
..............
....F.........
..............
..........o...
.........o.o..
....w...o...o.
..............
..............
######...#####
######...#####`),
roadSeg(`
....................
....................
....................
....................
......o.......o.....
.....ooo.....ooo....
....................
....=====...=====...
.h..................
....................
....................
..S......^^^........
########............
########............`),
roadSeg(`
................
................
................
................
................
................
................
.....o..o..o....
................
...w.....h......
................
.....^^.........
####....########
####....########`),
roadSeg(`
..........
..........
..........
..........
..........
....F.....
..........
..........
..........
..........
..........
..........
##########
##########`),
roadSeg(`
....................
....................
....................
....................
....................
....................
.......o..o..o......
....................
.....==========.....
....................
....BB........BB....
.h.......^^.....h...
####################
####################`),
roadSeg(`
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.................G...........#
.............................#
.............................#
##############################
##############################`),
    ]),
  };
  // ======== 2. THE SQUALL STRAIT (coast -> wastes) ========
  L.squall = {
    name: 'THE SQUALL STRAIT', theme: 'squall', boss: 'galegull', gravity: 1,
    intro: 'A STORM ON THE STRAIT! Cross the wild water on crates and piers — beware leaping sharks and the GALE GULL!',
    rows: roadJoin([
roadSeg(`
............
............
............
............
............
............
............
............
........o...
.......ooo..
............
............
############
############`),
roadSeg(`
..................
..................
..................
..................
..................
..................
..................
......o....o......
..................
....=====.=====...
..................
..h...........h...
#####........#####
#####........#####`),
roadSeg(`
......................
......................
......................
......................
......................
.........o.o.o........
......................
......BB......BB......
......BB......BB......
...w..............w...
......................
.......^^......^^.....
######################
######################`),
roadSeg(`
....................
....................
....................
....................
.......o..o.........
......o....o........
....................
....==..==..==......
....................
..h....h......h.....
....................
....................
####............####
####............####`),
roadSeg(`
..............
..............
..............
..............
....F.........
..............
..............
..............
.......o.o....
..............
...S..........
......^^^.....
##############
##############`),
roadSeg(`
........................
........................
........................
........................
........................
........................
......o.....o.....o.....
........................
....===...===...===.....
........................
...f.....h..f...........
........................
####....####....########
####....####....########`),
roadSeg(`
..........
..........
..........
..........
..........
....F.....
..........
..........
..........
..........
..........
..........
##########
##########`),
roadSeg(`
......................
......................
......................
......................
......................
......................
......o....o....o.....
......................
....==...==...==......
......................
......................
....h....h....h.......
####..####..####..####
####..####..####..####`),
roadSeg(`
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.................G...........#
.............................#
.............................#
##############################
##############################`),
    ]),
  };
  // ======== 3. THE METEOR PASS (wastes -> canyon) ========
  L.meteor = {
    name: 'THE METEOR PASS', theme: 'meteor', boss: 'cometwolf', gravity: 0.82,
    intro: 'METEORS OVER THE PASS! Low gravity, long leaps — dodge the falling stars and outsmart the COMET WOLF!',
    rows: roadJoin([
roadSeg(`
............
............
............
............
............
............
............
............
........o...
.......ooo..
............
............
############
############`),
roadSeg(`
....................
....................
....................
....................
....................
......o......o......
.....ooo....ooo.....
....................
....................
..w.............w...
....................
....................
#####.....##########
#####.....##########`),
roadSeg(`
......................
......................
......................
......................
......................
......................
......o..o..o.........
......................
....=====..=====......
......................
...d............d.....
.....^^^..^^^.........
######......##########
######......##########`),
roadSeg(`
..................
..................
..................
..................
....F.............
..................
..................
.......o.o........
..................
......BBBB........
...w..............
..................
######......######
######......######`),
roadSeg(`
..........................
..........................
..........................
..........................
..........................
.......o.......o..........
......ooo.....ooo.........
..........................
....====..====..====......
..........................
..d...........d...........
...^^....^^......^^.......
#####....................#
#####....................#`),
roadSeg(`
..............
..............
..............
..............
....F.........
..............
..............
..............
......o.......
.....o.o......
..S...........
......^^^^....
##############
##############`),
roadSeg(`
........................
........................
........................
........................
........................
........................
......o.....o.....o.....
........................
....==....==....==......
..d.....................
....^^........^^........
........................
######............######
######............######`),
roadSeg(`
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.............................#
.................G...........#
.............................#
.............................#
##############################
##############################`),
    ]),
  };
  // normalize: equal row lengths
  for (const k of Object.keys(L)) {
    const w = Math.max(...L[k].rows.map(r => r.length));
    L[k].rows = L[k].rows.map(r => r.padEnd(w, ' '));
    L[k].w = w;
  }
  return L;
}
const ROAD_LEVELS = buildRoadLevels();
const ROAD_ROUTES = { '0-1': 'bramble', '1-2': 'squall', '2-3': 'meteor' };
const ROAD_BOSS_SPECIES = { tollgoat: 'ram', galegull: 'condor', cometwolf: 'cometpup' };
const ROAD_BOSS_NAMES = { tollgoat: 'THE TOLL GOAT', galegull: 'THE GALE GULL', cometwolf: 'THE COMET WOLF' };
const ROAD_BOSS_HP = { tollgoat: 2, galegull: 3, cometwolf: 3 };   // first road boss falls in 2 bops
const ROAD_ENEMY_SPECIES = {
  bramble: { w: 'goat', h: 'snowhare', f: 'condor', d: 'cometpup' },
  squall:  { w: 'crab', h: 'shark', f: 'jellyfish', d: 'cometpup' },
  meteor:  { w: 'alien', h: 'snowhare', f: 'jellyfish', d: 'cometpup' },
};

const SideScroll = {
  active: null,
  BOSS_AI: {}, BOSS_DRAW: {}, BOSS_HINT: {}, BOSS_INTRO: {},   // per-boss overrides (19b adds the cog fights)
  // ---------- lifecycle ----------
  start(levelId, fromTravel) {
    const def = ROAD_LEVELS[levelId];
    if (!def) return;
    const S = {
      id: levelId, def, t: 0, camX: 0,
      p: { x: 24, y: 0, vx: 0, vy: 0, onG: false, face: 1, anim: 0, coyote: 0, jbuf: 0, inv: 0, squash: 0, flaps: ROAD_FLAPS, glide: 0 },
      enemies: [], coins: {}, springs: {}, flags: {}, checkpoint: [24, 0],
      crushers: [], vents: [], bobs: [],
      boss: null, bossT: 0, won: false, wonT: 0, deathT: 0, shake: 0,
      fromTravel: !!fromTravel, meteors: [],
    };
    // scan markers
    const rows = def.rows;
    S.flagCols = [];
    for (let j = 0; j < ROAD_H; j++) for (let i = 0; i < rows[j].length; i++) {
      const ch = rows[j][i];
      if ('whfd'.includes(ch)) S.enemies.push(this.mkEnemy(S, ch, i, j, def.theme));
      else if (ch === 'G') S.bossHome = [i, j];
      else if (ch === 'F' && !S.flagCols.includes(i)) S.flagCols.push(i);
      else if (ch === 'C') S.crushers.push({ i, j, ph: (i * 0.53) % 1.1, st: 'up', y: j * ROAD_TILE });
      else if (ch === 'V') S.vents.push({ i, j, ph: (i * 0.73) % 3.1, st: 'idle', gy: null });
      else if (ch === 'Z') S.bobs.push({ i, j, t: i * 0.7 });
    }
    S.spawnList = S.enemies.map(e => ({ ...e }));
    // floor the player
    S.p.y = this.groundYAt(S, S.p.x) - 1;
    S.checkpoint = [S.p.x, S.p.y];
    this.active = S;
    Game.state = 'side';
    Game.banner(def.intro);
    if (def.wings && !Game.flags.wings) Game.toast('The Rail-Guild lends you BRASS WINGS! Tap X in the air to FLAP!');
    Audio2.playSong('road');
    Audio2.jingle('bossintro');
  },
  mkEnemy(S, ch, i, j, theme) {
    const species = ROAD_ENEMY_SPECIES[theme][ch];
    // rest on the first solid surface at or below the marker so nothing floats;
    // a marker over a bottomless gap (leaping sharks) rests at the chasm floor.
    let gj = j;
    while (gj < ROAD_H && !ROAD_SOLID[this.tile(S, i, gj)]) gj++;
    const restY = gj * ROAD_TILE;
    return { kind: ch, species, x: i * ROAD_TILE + 8, y: restY, vx: ch === 'w' ? -44 : 0, vy: 0,
      t: Math.random() * 2, state: 'live', squash: 0, homeY: restY, dashT: 0 };
  },
  tile(S, i, j) {
    if (i < 0 || i >= S.def.w) return '#';
    if (j < 0 || j >= ROAD_H) return ' ';
    return S.def.rows[j][i] || ' ';
  },
  solidAt(S, x, y) {
    const i = Math.floor(x / ROAD_TILE), j = Math.floor(y / ROAD_TILE);
    return ROAD_SOLID[this.tile(S, i, j)] || false;
  },
  groundYAt(S, x) {
    const i = Math.floor(x / ROAD_TILE);
    let j = 0;
    while (j < ROAD_H && ROAD_SOLID[this.tile(S, i, j)]) j++;   // skip a pipe-CEILING strip: ground is under the open air
    for (; j < ROAD_H; j++) if (ROAD_SOLID[this.tile(S, i, j)]) return j * ROAD_TILE;
    return ROAD_H * ROAD_TILE + 80;
  },
  // ---------- update ----------
  update(dt, presses) {
    const S = this.active; if (!S) return;
    S.t += dt;
    if (S.shake > 0) S.shake -= dt;
    if (S.wonT > 0) {
      S.wonT -= dt;
      if (S.wonT <= 0) this.finish(true);
      return;
    }
    if (S.deathT > 0) {
      S.deathT -= dt;
      if (S.deathT <= 0) this.respawn();
      return;
    }
    if (presses.includes('Escape')) {
      Game.toast('Noah retreats — you must BEAT the road to get through!');
      this.finish(false); return;
    }
    const p = S.p, def = S.def;
    const grav = 760 * def.gravity;
    // input
    let ax = 0;
    if (keyHeld('ArrowLeft') || keyHeld('a')) ax = -1;
    if (keyHeld('ArrowRight') || keyHeld('d')) ax = 1;
    if (presses.includes('x') || presses.includes(' ')) p.jbuf = 0.12;
    p.jbuf -= dt; p.coyote -= dt; p.inv -= dt;
    if (p.squash > 0) p.squash -= dt;
    // horizontal
    const target = ax * 118;
    p.vx += clamp(target - p.vx, -640 * dt, 640 * dt);
    if (!ax) p.vx *= Math.max(0, 1 - 8 * dt);
    if (ax) { p.face = ax; p.anim += dt; }
    // jump (+ ANGEL WINGS: tap X to FLAP in mid-air, hold X to GLIDE)
    if (p.jbuf > 0 && (p.onG || p.coyote > 0)) {
      p.vy = -262; p.onG = false; p.coyote = 0; p.jbuf = 0;
      Audio2.jingle('jump'); Particles.burst(p.x, p.y, 'dust');
    } else if (p.jbuf > 0 && (Game.flags.wings || def.wings) && !p.onG && !this.solidAt(S, p.x, p.y + 3)) {
      // road rule: each mid-air flap costs a feather — five per flight, land to refill
      if (p.flaps > 0) {
        p.flaps--; p.vy = -200; p.jbuf = 0; p.flapT = 0.18;
        Audio2.jingle('flap'); Particles.burst(p.x, p.y - 4, 'dust');
      } else { p.jbuf = 0; Audio2.jingle('denied'); }
    }
    if (p.flapT > 0) p.flapT -= dt;
    const holdJump = keyHeld('x') || keyHeld(' ');
    const rising = p.vy < 0 && holdJump;
    p.vy += (rising ? grav * 0.55 : grav) * dt;
    const gliding = (Game.flags.wings || def.wings) && !p.onG && holdJump && p.vy > 0;
    p.vy = Math.min(p.vy, gliding ? 70 : 330);   // out of flaps? hold X to GLIDE down like a bird
    p.glide = gliding ? 1 : 0;
    // integrate + collide (axis separated, 10x16 box, feet at p.y)
    const half = 5, top = 15;
    p.x += p.vx * dt;
    if (p.vx > 0 && (this.solidAt(S, p.x + half, p.y - 2) || this.solidAt(S, p.x + half, p.y - top + 2))) {
      p.x = Math.floor((p.x + half) / ROAD_TILE) * ROAD_TILE - half - 0.01; p.vx = 0;
    } else if (p.vx < 0 && (this.solidAt(S, p.x - half, p.y - 2) || this.solidAt(S, p.x - half, p.y - top + 2))) {
      p.x = Math.ceil((p.x - half) / ROAD_TILE) * ROAD_TILE + half + 0.01; p.vx = 0;
    }
    p.x = clamp(p.x, 6, def.w * ROAD_TILE - 6);
    const wasG = p.onG;
    p.y += p.vy * dt;
    p.onG = false;
    if (p.vy >= 0 && (this.solidAt(S, p.x - half + 1, p.y) || this.solidAt(S, p.x + half - 1, p.y))) {
      p.y = Math.floor(p.y / ROAD_TILE) * ROAD_TILE - 0.01; p.vy = 0; p.onG = true; p.coyote = 0.1; p.flaps = ROAD_FLAPS;
      if (!wasG) { p.squash = 0.12; Particles.burst(p.x, p.y, 'dust'); }
    } else if (p.vy < 0 && (this.solidAt(S, p.x - half + 1, p.y - top) || this.solidAt(S, p.x + half - 1, p.y - top))) {
      p.y = Math.ceil((p.y - top) / ROAD_TILE) * ROAD_TILE + top + 0.01; p.vy = 0;
    }
    if (p.onG) p.coyote = 0.1;
    // conveyor belts carry whoever stands on them
    if (p.onG) {
      const bt = this.tile(S, Math.floor(p.x / ROAD_TILE), Math.floor((p.y + 2) / ROAD_TILE));
      if (bt === '>') p.x += 55 * dt; else if (bt === '<') p.x -= 55 * dt;
    }
    // tile interactions at feet/center
    const ci = Math.floor(p.x / ROAD_TILE);
    for (const [dx2, dy2] of [[0, -2], [0, -10], [0, -16]]) {
      const i = Math.floor((p.x + dx2) / ROAD_TILE), j = Math.floor((p.y + dy2) / ROAD_TILE);
      const ch = S.def.rows[j] && S.def.rows[j][i];
      if (ch === 'o' && !S.coins[i + ',' + j]) {
        S.coins[i + ',' + j] = true; Game.flags.coins++; Audio2.jingle('coin');
        Particles.burst(i * ROAD_TILE + 8, j * ROAD_TILE + 8, 'sparkle');
      } else if (ch === 'S' && p.vy >= 0 && Math.abs(p.y - (j * ROAD_TILE)) < 6) {
        p.vy = -420; Audio2.jingle('flap'); Particles.burst(p.x, p.y, 'sparkle');
      } else if (ch === '^' && p.inv <= 0) {
        this.hurt(S, 1);
      }
    }
    // checkpoint flags are planted on the ground in their column — grab by walking past
    for (const fi of S.flagCols || []) {
      if (S.flags[fi]) continue;
      if (Math.abs(p.x - (fi * ROAD_TILE + 8)) < 10) {
        S.flags[fi] = true; S.checkpoint = this.safeSpot(S, fi);
        Audio2.jingle('key'); Game.toast('CHECKPOINT! The flag waves for you.');
      }
    }
    // pit fall
    if (p.y > ROAD_H * ROAD_TILE + 40) { this.hurt(S, 2, true); if (S.deathT <= 0 && Player.hearts > 0) this.respawnAtCheckpoint(); return; }
    // boss trigger
    if (!S.boss && S.bossHome && p.x > (S.bossHome[0] - 13) * ROAD_TILE) this.spawnBoss(S);
    // enemies + factory hazards
    this.updateEnemies(S, dt);
    this.updateHazards(S, dt);
    if (S.boss) this.updateBoss(S, dt);
    // theme hazards: falling meteors
    if (def.theme === 'meteor') this.updateMeteors(S, dt);
    // camera
    const lock = S.boss ? (S.bossHome[0] - 14) * ROAD_TILE : 0;
    if (S.boss) p.x = Math.max(p.x, lock + 16);
    S.camX = clamp(p.x - VW * 0.4, lock, def.w * ROAD_TILE - VW);
    if (S.boss) S.camX = Math.max(S.camX, lock);
  },
  hurt(S, n, silent) {
    const p = S.p;
    if (p.inv > 0) return;
    p.inv = 1.1; Player.hearts -= n * 2; S.shake = 0.25;
    if (!silent) { Audio2.jingle('hurt'); p.vy = -180; p.vx = -p.face * 90; }
    if (Player.hearts <= 0) {
      S.deathT = 1.2; Audio2.jingle('denied');
      Game.toast('Noah got DIZZY! Back to the last flag...');
    }
  },
  // a checkpoint must never land you on spikes: find the nearest spike-free solid spot
  safeSpot(S, col) {
    const ok = (i) => {
      if (i < 1 || i >= S.def.w) return -1;
      let gj = -1;
      for (let j = 0; j < ROAD_H; j++) if (ROAD_SOLID[this.tile(S, i, j)]) { gj = j; break; }
      if (gj < 1) return -1;                                                   // bottomless = unsafe
      if (this.tile(S, i, gj - 1) === '^' || this.tile(S, i, gj - 2) === '^') return -1;  // spikes above
      return gj;
    };
    for (let d = 0; d < 14; d++) {
      let gj = ok(col + d); if (gj > 0) return [(col + d) * ROAD_TILE + 8, gj * ROAD_TILE - 1];
      if (d) { gj = ok(col - d); if (gj > 0) return [(col - d) * ROAD_TILE + 8, gj * ROAD_TILE - 1]; }
    }
    return [col * ROAD_TILE + 8, this.groundYAt(S, col * ROAD_TILE + 8) - 1];
  },
  respawnAtCheckpoint() {
    const S = this.active, p = S.p;
    p.x = S.checkpoint[0]; p.y = S.checkpoint[1]; p.vx = 0; p.vy = 0; p.inv = 1.4; p.flaps = ROAD_FLAPS;
    Audio2.jingle('hurt');
  },
  respawn() {
    const S = this.active;
    Player.hearts = Player.maxHearts;
    // reset live enemies to their spawns (captured ones stay caught)
    S.enemies = S.enemies.map((e, i) => e.state === 'gone' ? e : { ...S.spawnList[i] });
    if (S.boss) { S.boss = null; }    // boss resets fully
    this.respawnAtCheckpoint();
  },
  // ---------- enemies ----------
  updateEnemies(S, dt) {
    const p = S.p;
    for (const e of S.enemies) {
      if (e.state === 'gone') continue;
      if (e.state === 'squashed') {
        e.squash += dt;
        if (e.squash > 0.5) { e.state = 'gone'; }
        continue;
      }
      e.t += dt;
      if (e.kind === 'w') {                       // walker: patrol, turn at edges/walls
        e.x += e.vx * dt;
        const ahead = e.x + Math.sign(e.vx) * 8;
        if (this.solidAt(S, ahead, e.y - 4) || !this.solidAt(S, ahead, e.y + 2)) e.vx *= -1;
      } else if (e.kind === 'h') {                // hopper: arcing hops, landing on the REAL ground beneath it
        e.vy += 700 * dt; e.y += e.vy * dt; e.x += e.vx * dt;
        e.x = clamp(e.x, 8, S.def.w * ROAD_TILE - 8);
        const gy = this.groundYAt(S, e.x);
        if (e.y >= gy) {
          e.y = gy; e.vy = 0; e.vx = 0;
          if (e.t > 1.0) { e.t = 0; e.vy = e.species === 'shark' ? -330 : -215; e.vx = clamp(p.x - e.x, -60, 60); }
        }
      } else if (e.kind === 'f') {                // flyer: bobbing drift toward Noah
        e.y = e.homeY - 38 + Math.sin(e.t * 2.2) * 22;
        e.x += clamp(p.x - e.x, -42, 42) * dt;
      } else if (e.kind === 'd') {                // dasher: telegraph, then zoom
        if (e.dashT > 0) {
          e.dashT -= dt; e.x += e.vx * dt;
          if (this.solidAt(S, e.x + Math.sign(e.vx) * 8, e.y - 4)) { e.vx = 0; e.dashT = 0; }
        } else if (Math.abs(p.x - e.x) < 130 && Math.abs(p.y - e.y) < 30 && e.t > 2.2) {
          e.t = 0; e.dashT = 0.9; e.vx = Math.sign(p.x - e.x) * 215;
          Audio2.jingle('step');
        }
        if (!this.solidAt(S, e.x, e.y + 2)) { e.vy += 700 * dt; e.y += e.vy * dt; } else e.vy = 0;
      }
      // player contact
      this.touchPlayer(S, e, 9 + (e.kind === 'd' ? 2 : 0));
    }
  },
  touchPlayer(S, e, rad) {
    const p = S.p;
    const ex = e.x, ey = e.y - 6;
    if (Math.abs(p.x - ex) > rad + 5 || Math.abs((p.y - 8) - ey) > rad + 6) return;
    if (p.vy > 40 && p.y - 6 < ey) {              // STOMP! a bonk is a capture
      e.state = 'squashed'; e.squash = 0;
      p.vy = -200; p.inv = Math.max(p.inv, 0.25);
      Game.log[e.species] = (Game.log[e.species] || 0) + 1;
      Game.flags['life_' + e.species] = (Game.flags['life_' + e.species] || 0) + 1;
      Audio2.jingle('capture');
      Particles.burst(ex, ey, 'confetti');
    } else if (p.inv <= 0) {
      this.hurt(S, 1);
    }
  },
  // ---------- factory hazards: crushers 'C', steam vents 'V', spark-bobs 'Z' ----------
  updateHazards(S, dt) {
    const p = S.p;
    for (const cr of S.crushers) {
      cr.ph += dt;
      const floorY = this.groundYAt(S, cr.i * ROAD_TILE + 8), restY = cr.j * ROAD_TILE;
      if (cr.st === 'up') { cr.y = restY; if (cr.ph > 1.25) { cr.st = 'down'; cr.ph = 0; } }
      else if (cr.st === 'down') {
        cr.y = Math.min(floorY - 14, cr.y + 520 * dt);
        if (cr.y >= floorY - 14) { cr.st = 'floor'; cr.ph = 0; S.shake = Math.max(S.shake, 0.12); Audio2.jingle('rumble'); Particles.burst(cr.i * ROAD_TILE + 8, floorY, 'dust'); }
      } else if (cr.st === 'floor') { if (cr.ph > 0.55) { cr.st = 'rise'; cr.ph = 0; } }
      else { cr.y = Math.max(restY, cr.y - 90 * dt); if (cr.y <= restY) { cr.st = 'up'; cr.ph = 0; } }
      if (cr.st !== 'up' && p.inv <= 0 &&
          Math.abs(p.x - (cr.i * ROAD_TILE + 8)) < 12 && p.y > cr.y - 2 && p.y - 15 < cr.y + 14) this.hurt(S, 1);
    }
    for (const v of S.vents) {
      if (v.gy == null) v.gy = this.groundYAt(S, v.i * ROAD_TILE + 8);
      v.ph += dt;
      const cyc = v.ph % 3.1;
      v.st = cyc < 1.6 ? 'idle' : cyc < 2.15 ? 'hiss' : 'blast';
      if (v.st === 'blast' && p.inv <= 0) {
        if (Math.abs(p.x - (v.i * ROAD_TILE + 8)) < 9 && p.y > v.gy - 80 && p.y - 15 < v.gy) this.hurt(S, 1);
      }
    }
    for (const z of S.bobs) {
      z.t += dt;
      const zx = z.i * ROAD_TILE + 8, zy = z.j * ROAD_TILE + 8 + Math.sin(z.t * 1.7) * 38;
      if (p.inv <= 0 && Math.abs(p.x - zx) < 9 && Math.abs((p.y - 8) - zy) < 10) this.hurt(S, 1);
    }
  },
  drawHazards(c, S) {
    for (const cr of S.crushers) {
      const x = cr.i * ROAD_TILE;
      c.fillStyle = '#3a2c50'; c.fillRect(x + 5, -8, 6, cr.y + 8);
      c.fillStyle = '#241a33'; c.fillRect(x - 3, cr.y, 22, 14);
      c.fillStyle = (cr.st === 'down' || cr.st === 'floor') ? '#c8743c' : '#8a94a8';
      c.fillRect(x - 2, cr.y + 1, 20, 12);
      c.fillStyle = '#241a33';
      for (let k = 0; k < 3; k++) c.fillRect(x + 1 + k * 7, cr.y + 4, 2, 2);
      c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - 2, cr.y + 1, 20, 2);
    }
    for (const v of S.vents) {
      const x = v.i * ROAD_TILE, gy = v.gy != null ? v.gy : this.groundYAt(S, v.i * ROAD_TILE + 8);
      c.fillStyle = '#241a33'; c.fillRect(x + 1, gy - 5, 14, 5);
      c.fillStyle = '#8a94a8'; c.fillRect(x + 2, gy - 4, 12, 3);
      c.fillStyle = '#241a33'; c.fillRect(x + 4, gy - 4, 1, 3); c.fillRect(x + 7, gy - 4, 1, 3); c.fillRect(x + 10, gy - 4, 1, 3);
      if (v.st === 'hiss') {
        c.fillStyle = 'rgba(255,255,255,.5)';
        for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + 4 + k * 4, gy - 9 - ((v.ph * 30 + k * 5) % 8), 2, 0, 7); c.fill(); }
      } else if (v.st === 'blast') {
        const w = Math.sin(v.ph * 22) * 1.5;
        c.fillStyle = 'rgba(235,244,255,.82)'; c.fillRect(x + 3 - w, gy - 80, 10 + w * 2, 80);
        c.fillStyle = 'rgba(154,220,248,.5)'; c.fillRect(x + 1, gy - 80, 14, 80);
        c.fillStyle = '#fff'; c.fillRect(x + 6, gy - 80, 4, 80);
      }
    }
    for (const z of S.bobs) {
      const zx = z.i * ROAD_TILE + 8, zy = z.j * ROAD_TILE + 8 + Math.sin(z.t * 1.7) * 38;
      c.strokeStyle = 'rgba(248,146,56,.25)'; c.beginPath(); c.moveTo(zx, z.j * ROAD_TILE - 32); c.lineTo(zx, z.j * ROAD_TILE + 48); c.stroke();
      c.fillStyle = '#241a33'; c.beginPath(); c.arc(zx, zy, 6.5, 0, 7); c.fill();
      c.fillStyle = '#f89238'; c.beginPath(); c.arc(zx, zy, 5, 0, 7); c.fill();
      c.fillStyle = '#f8e858'; c.beginPath(); c.arc(zx - 1, zy - 1, 2.2, 0, 7); c.fill();
      const a = z.t * 9;
      c.strokeStyle = '#f8e858'; c.beginPath(); c.moveTo(zx + Math.cos(a) * 8, zy + Math.sin(a) * 8); c.lineTo(zx + Math.cos(a) * 11, zy + Math.sin(a) * 11); c.stroke();
    }
  },
  // ---------- bosses ----------
  spawnBoss(S) {
    const [bi, bj] = S.bossHome;
    const hp = ROAD_BOSS_HP[S.def.boss] || 3;
    S.boss = { kind: S.def.boss, x: bi * ROAD_TILE + 8, y: this.groundYAt(S, bi * ROAD_TILE + 8) - 120, vx: 0, vy: 60,
      hp, maxHp: hp, t: 0, state: 'intro', stateT: 1.2, stun: 0, inv: 0, dir: -1 };
    const times = hp === 1 ? 'ONCE' : hp === 2 ? 'TWICE' : hp + ' TIMES';
    Game.banner(this.BOSS_INTRO[S.def.boss] ||
      (ROAD_BOSS_NAMES[S.def.boss] + ' blocks the road! BOP it on the head — ' + times + '!'));
    Audio2.playSong('boss'); Audio2.jingle('bossintro');
    S.shake = 0.4;
  },
  updateBoss(S, dt) {
    const b = S.boss, p = S.p;
    b.t += dt; b.inv -= dt;
    const grav = 760 * S.def.gravity;
    const groundY = this.groundYAt(S, b.x);
    if (b.state === 'intro') {
      b.vy += grav * dt; b.y += b.vy * dt;            // dramatic drop-in
      if (b.y >= groundY) { b.y = groundY; b.vy = 0; if (b.landed !== true) { b.landed = true; S.shake = 0.35; Particles.burst(b.x, b.y, 'dust'); } }
      b.stateT -= dt; if (b.stateT <= 0 && b.y >= groundY) { b.state = 'act'; b.stateT = 0; }
      return;
    }
    if (b.stun > 0) {
      b.stun -= dt;
      this.bossTouch(S, b, true);
      return;
    }
    const AI = this.BOSS_AI[b.kind];    // bespoke fights register here (19b: the cog bosses)
    if (AI) {
      AI(S, b, dt, this);
    } else if (b.kind === 'tollgoat') {
      // hops back and forth; every few hops, a big leap onto Noah
      b.vy += grav * dt; b.y += b.vy * dt;
      if (b.y >= groundY) {
        b.y = groundY; b.vy = 0;
        b.rest = (b.rest || 0) + dt;
        if (b.rest > 0.5) {
          b.rest = 0; b.hops = (b.hops || 0) + 1;
          if (b.hops % 3 === 0) { b.vy = -300; b.vx = clamp((p.x - b.x) * 1.4, -160, 160); Audio2.jingle('step'); }
          else { b.vy = -210; b.vx = (Math.abs(p.x - b.x) > 60 ? Math.sign(p.x - b.x) : b.dir) * (70 + b.hp * 12); b.dir = Math.sign(b.vx) || b.dir; }
        }
      } else { b.x += b.vx * dt; }
      this.bossTouch(S, b, true);                  // always stompable, careful timing
    } else if (b.kind === 'galegull') {
      // circles above, telegraphed swoop; stunned on the ground after each swoop
      if (b.state === 'act') {
        b.y = groundY - 92 + Math.sin(b.t * 2) * 12;
        b.x += clamp(p.x - b.x, -70, 70) * dt * 1.1;
        b.stateT += dt;
        if (b.stateT > 2.2) { b.state = 'tele'; b.stateT = 0.55; Audio2.jingle('denied'); }
      } else if (b.state === 'tele') {
        b.stateT -= dt;
        if (b.stateT <= 0) { b.state = 'swoop'; b.sx = b.x; b.sy = b.y; b.tx = p.x; b.swt = 0; }
      } else if (b.state === 'swoop') {
        b.swt += dt * 1.9;
        const u = Math.min(1, b.swt);
        b.x = lerp(b.sx, b.tx, u);
        b.y = lerp(b.sy, groundY, u < 0.5 ? u * u * 2 : 1 - (1 - u) * (1 - u) * 2);
        if (u >= 1) { b.state = 'act'; b.stateT = 0; b.stun = 1.5; Particles.burst(b.x, b.y, 'dust'); S.shake = 0.2; }
      }
      this.bossTouch(S, b, b.stun > 0);            // only stompable while grounded-dizzy
    } else if (b.kind === 'cometwolf') {
      // telegraphed floor dashes; crashing into the wall leaves it dizzy
      if (b.state === 'act') {
        b.stateT += dt;
        b.x += Math.sign(p.x - b.x) * 24 * dt;
        if (b.stateT > 1.4) { b.state = 'tele'; b.stateT = 0.6; Audio2.jingle('denied'); }
      } else if (b.state === 'tele') {
        b.stateT -= dt;
        if (b.stateT <= 0) { b.state = 'dash'; b.vx = Math.sign(p.x - b.x) * (200 + (3 - b.hp) * 45); }
      } else if (b.state === 'dash') {
        b.x += b.vx * dt;
        if (this.solidAt(S, b.x + Math.sign(b.vx) * 12, b.y - 6)) {
          b.state = 'act'; b.stateT = 0; b.stun = 1.6; S.shake = 0.3;
          Audio2.jingle('rumble'); Particles.burst(b.x, b.y - 8, 'dust');
        }
      }
      b.y = groundY;
      this.bossTouch(S, b, b.stun > 0);            // stomp only while wall-dizzy
    }
    // pen the boss into the arena — it can never slip off the left (or right) edge
    const arenaL = (S.bossHome[0] - 14) * ROAD_TILE + 16, arenaR = S.def.w * ROAD_TILE - 14;
    if (b.x < arenaL) { b.x = arenaL; b.vx = 0; if (b.state === 'dash') { b.state = 'act'; b.stateT = 0; b.stun = 1.6; S.shake = 0.3; Audio2.jingle('rumble'); } }
    else if (b.x > arenaR) { b.x = arenaR; b.vx = 0; if (b.state === 'dash') { b.state = 'act'; b.stateT = 0; b.stun = 1.6; } }
  },
  bossTouch(S, b, stompable) {
    const p = S.p;
    if (Math.abs(p.x - b.x) > 17 || Math.abs((p.y - 8) - (b.y - 10)) > 18) return;
    if (stompable && p.vy > 40 && p.y - 8 < b.y - 8 && b.inv <= 0) {
      b.hp--; b.inv = 0.8; b.stun = 0; p.vy = -230;
      S.shake = 0.3; Audio2.jingle('capture');
      Particles.burst(b.x, b.y - 14, 'confetti');
      if (b.hp <= 0) this.winBoss(S, b);
      else Game.banner('BONK! (' + (b.maxHp - b.hp) + '/' + b.maxHp + ') ' + ROAD_BOSS_NAMES[b.kind] + ' is FURIOUS!');
    } else if (p.inv <= 0) {
      this.hurt(S, 1);
    }
  },
  winBoss(S, b) {
    const sp = ROAD_BOSS_SPECIES[b.kind];
    Game.log[sp] = (Game.log[sp] || 0) + 1;
    Game.flags['life_' + sp] = (Game.flags['life_' + sp] || 0) + 1;
    Game.giveLoot({ heartC: 1, coins: 20 });
    Game.banner(ROAD_BOSS_NAMES[b.kind] + ' CAUGHT! The road is SAFE — and a heart container is yours!');
    Audio2.jingle('bosswin');
    for (let k = 0; k < 5; k++) Particles.burst(b.x - 20 + k * 10, b.y - 10 - (k % 2) * 14, 'confetti');
    S.wonT = 2.2; S.bossGone = true; S.boss = null;
  },
  updateMeteors(S, dt) {
    const p = S.p;
    // spawn telegraphed strikes ahead of Noah
    if (!S.metT) S.metT = 2;
    S.metT -= dt;
    if (S.metT <= 0 && !S.boss) {
      S.metT = 1.6 + Math.random() * 1.4;
      const tx = p.x + 60 + Math.random() * 140;
      S.meteors.push({ x: tx, y: -30, gy: this.groundYAt(S, tx), warn: 0.9, live: 2.4 });
    }
    for (let i = S.meteors.length - 1; i >= 0; i--) {
      const mt = S.meteors[i];
      if (mt.warn > 0) { mt.warn -= dt; continue; }
      mt.y += 330 * dt;
      if (mt.y >= mt.gy - 6) {
        Particles.burst(mt.x, mt.gy - 4, 'dust'); Particles.burst(mt.x, mt.gy - 8, 'sparkle');
        Audio2.jingle('push'); S.meteors.splice(i, 1);
        if (Math.abs(p.x - mt.x) < 14 && Math.abs(p.y - mt.gy) < 18) this.hurt(S, 1);
        continue;
      }
      if (Math.abs(p.x - mt.x) < 9 && Math.abs((p.y - 8) - mt.y) < 10) { this.hurt(S, 1); S.meteors.splice(i, 1); }
    }
  },
  finish(won) {
    const S = this.active; this.active = null;
    Player.hearts = Player.maxHearts;
    if (Game.pendingCog3) {                                // a Cogwerk interlude paused Noah's WALK
      const tv = Game.pendingCog3; Game.pendingCog3 = null;
      Game.state = 'world3map'; Audio2.playSong('title');
      if (won) { Game.flags['road_' + S.id] = true; Game.world3Travel = tv; saveGame(); }   // back on the trail
      else { Game.world3Travel = null; Game.world3Cursor = Game.world3Here(); }             // retreat: stay put
      return;
    }
    if (won) {
      Game.flags['road_' + S.id] = true; saveGame();
      // beat it -> the interrupted journey carries on to its destination
      if (S.fromTravel && Game.pendingTravel) { Game.worldTravel = Game.pendingTravel; Game.pendingTravel = null; }
    } else {
      // retreated WITHOUT winning -> NO skipping: drop the trip, stay put at the origin node
      Game.pendingTravel = null; Game.worldTravel = null;
      Game.worldCursor = Game.worldHere();
    }
    Game.state = 'worldmap';
    Audio2.playSong('title');
  },
  // ---------- draw ----------
  draw(c) {
    const S = this.active; if (!S) return;
    const def = S.def, p = S.p;
    const shx = S.shake > 0 ? (Math.random() * 4 - 2) : 0;
    c.save();
    c.beginPath(); c.rect(0, 0, SW, SH); c.clip();
    this.drawSky(c, S);
    c.save();
    c.translate(Math.round(-S.camX + shx), ROAD_TOP);
    // tiles
    const i0 = Math.max(0, (S.camX / ROAD_TILE | 0) - 1), i1 = Math.min(def.w - 1, ((S.camX + SW) / ROAD_TILE | 0) + 1);
    for (let j = 0; j < ROAD_H; j++) for (let i = i0; i <= i1; i++) this.drawTile(c, S, i, j);
    this.drawHazards(c, S);
    if (S.boss) {
      const wx = (S.bossHome[0] - 14) * ROAD_TILE, th = S.def.theme;
      const pal = th === 'bramble' ? ['#55b24a', '#9c6b38', '#754d26'] : th === 'squall' ? ['#eed694', '#b89a64', '#8d7448'] : th === 'cogwerk' ? ['#e8c060', '#a87c44', '#6c4c28'] : ['#7c5aa8', '#54387c', '#3a2458'];
      for (let yy = 0; yy < ROAD_H * ROAD_TILE; yy += 16) {
        c.fillStyle = pal[1]; c.fillRect(wx, yy, 12, 16);
        c.fillStyle = pal[2]; c.fillRect(wx + 2, yy + 5, 4, 3); c.fillRect(wx + 7, yy + 10, 4, 3);
        c.fillStyle = pal[0]; c.fillRect(wx, yy, 12, 3);
      }
      c.fillStyle = '#1a1226'; c.fillRect(wx + 12, 0, 2, ROAD_H * ROAD_TILE);
    }
    // meteors
    for (const mt of S.meteors) {
      if (mt.warn > 0) {
        const bl = ((S.t * 6 | 0) % 2) === 0;
        c.strokeStyle = bl ? 'rgba(255,120,80,.9)' : 'rgba(255,200,80,.6)';
        c.lineWidth = 2; c.beginPath(); c.ellipse(mt.x, mt.gy - 3, 10, 3, 0, 0, 7); c.stroke();
      } else {
        c.fillStyle = '#241a33'; c.beginPath(); c.arc(mt.x, mt.y, 6, 0, 7); c.fill();
        c.fillStyle = '#f89238'; c.beginPath(); c.arc(mt.x, mt.y, 4.5, 0, 7); c.fill();
        c.fillStyle = '#f8e858'; c.beginPath(); c.arc(mt.x - 1, mt.y - 1, 2, 0, 7); c.fill();
        c.strokeStyle = 'rgba(248,146,56,.5)'; c.beginPath(); c.moveTo(mt.x + 3, mt.y - 8); c.lineTo(mt.x + 8, mt.y - 22); c.stroke();
      }
    }
    // enemies
    for (const e of S.enemies) {
      if (e.state === 'gone') continue;
      const set = Sprites.creatures[e.species];
      const spr = ((p.x > e.x) ? set.right : set.left)[((e.t * 5 | 0) % 2)];
      c.save();
      c.translate(Math.round(e.x), Math.round(e.y));
      c.scale(ANIMAL_DRAW_SCALE, ANIMAL_DRAW_SCALE);   // render road animals 1.5x (visual only)
      if (e.state === 'squashed') { c.scale(1.3, Math.max(0.15, 1 - e.squash * 3)); c.globalAlpha = Math.max(0, 1 - e.squash * 2); }
      if (e.kind === 'd' && e.dashT <= 0 && e.t > 1.6) c.translate((Math.random() * 2 - 1), 0);  // pre-dash shiver
      c.fillStyle = 'rgba(20,10,40,.3)'; c.beginPath(); c.ellipse(0, 0, 7, 2, 0, 0, 7); c.fill();
      dspr(c, spr, -sprW(spr) / 2, -sprH(spr));
      c.restore();
    }
    // boss
    if (S.boss) this.drawBoss(c, S, S.boss);
    // player
    this.drawNoah(c, S);
    Particles.draw(c, S.camX, 0);
    c.restore();
    this.drawHUD(c, S);
    if (S.boss) this.drawBossBar(c, S);
    if (S.deathT > 0) { c.fillStyle = 'rgba(10,6,18,' + Math.min(0.7, (1.2 - S.deathT)) + ')'; c.fillRect(0, 0, SW, SH); }
    c.restore();
  },
  drawNoah(c, S) {
    const p = S.p;
    if (p.inv > 0 && ((p.inv * 12 | 0) % 2)) return;
    const set = Sprites.noah;
    const frames = p.face > 0 ? set.right : set.left;
    let f = 0;
    if (!p.onG) f = 1;
    else if (Math.abs(p.vx) > 12) { const n = frames.length; const st = ((p.anim * 9) | 0) % n; f = n === 4 ? [0, 2, 1, 3][st] : st; }
    const spr = frames[f];
    c.save();
    c.translate(Math.round(p.x), Math.round(p.y));
    let sclY = 1;
    if (p.squash > 0) sclY = 0.86;
    else if (!p.onG) sclY = 1 + clamp(-p.vy / 900, -0.08, 0.12);
    c.scale(2 - sclY, sclY);
    c.fillStyle = 'rgba(20,10,40,.3)'; c.beginPath(); c.ellipse(0, 0, 6, 2, 0, 0, 7); c.fill();
    if ((Game.flags.wings || S.def.wings) && !p.onG) {
      c.fillStyle = p.flaps > 0 ? (Game.flags.wings ? '#fff' : '#e8c060') : '#cfc9e0';   // loaners are BRASS
      const fw = p.glide ? 6.5 : Math.sin(Game.time * 20) * 3, ww = p.glide ? 9 : 5;
      c.beginPath(); c.ellipse(-7, -sprH(spr) * 0.55, ww, 3 + fw, -0.5, 0, 7); c.ellipse(7, -sprH(spr) * 0.55, ww, 3 + fw, 0.5, 0, 7); c.fill();
    }
    dspr(c, spr, -sprW(spr) / 2, -sprH(spr));
    c.restore();
  },
  drawBoss(c, S, b) {
    const D = this.BOSS_DRAW[b.kind];
    if (D) { D(c, S, b, this); return; }
    const sp = ROAD_BOSS_SPECIES[b.kind];
    const set = Sprites.creatures[sp];
    const spr = ((S.p.x > b.x) ? set.right : set.left)[((b.t * 4 | 0) % 2)];
    c.save();
    c.translate(Math.round(b.x), Math.round(b.y));
    if (b.inv > 0 && ((b.inv * 14 | 0) % 2)) c.globalAlpha = 0.4;
    const sc = 2.3;
    if (b.state === 'tele') c.translate(Math.random() * 3 - 1.5, 0);
    c.fillStyle = 'rgba(20,10,40,.35)'; c.beginPath(); c.ellipse(0, 0, 14, 3.4, 0, 0, 7); c.fill();
    c.scale(sc, sc);
    dspr(c, spr, -sprW(spr) / 2, -sprH(spr));
    c.restore();
    if (b.stun > 0) drawText(c, '@..@', b.x - 9, b.y - sprH(spr) * 2.3 - 12, 8, '#f8e858', '#241a33');
    // hp pips
    this.drawBossPips(c, b, b.x, b.y - sprH(spr) * 2.3 - 20);
  },
  drawBossPips(c, b, x, y) {
    const pips = b.maxHp || 3;
    for (let k = 0; k < pips; k++) {
      c.fillStyle = k < b.hp ? '#e84a4a' : '#3a2c50';
      c.beginPath(); c.arc(x - (pips - 1) * 6 + k * 12, y, 4, 0, 7); c.fill();
      c.strokeStyle = '#241a33'; c.stroke();
    }
  },
  drawTile(c, S, i, j) {
    const ch = S.def.rows[j][i];
    if (!ch || ch === ' ' || ch === '.') return;
    const x = i * ROAD_TILE, y = j * ROAD_TILE, th = S.def.theme;
    if (ch === '#') {
      const above = S.def.rows[j - 1] && ROAD_SOLID[S.def.rows[j - 1][i]];
      const pal = th === 'bramble' ? ['#55b24a', '#9c6b38', '#754d26'] : th === 'squall' ? ['#eed694', '#b89a64', '#8d7448'] : th === 'cogwerk' ? ['#e8c060', '#a87c44', '#6c4c28'] : ['#7c5aa8', '#54387c', '#3a2458'];
      c.fillStyle = pal[1]; c.fillRect(x, y, 16, 16);
      c.fillStyle = pal[2];
      for (let b2 = 0; b2 < 3; b2++) c.fillRect(x + ((i * 7 + b2 * 5 + j * 3) % 12), y + 4 + ((b2 * 7 + i) % 10), 3, 2);
      if (!above) {
        c.fillStyle = pal[0]; c.fillRect(x, y, 16, 5);
        c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x, y, 16, 1);
        c.fillStyle = '#241a33'; c.fillRect(x, y + 5, 16, 1);
      }
    } else if (ch === '=') {
      if (th === 'cogwerk') {                       // brass sky-rail plank
        c.fillStyle = '#241a33'; c.fillRect(x, y + 2, 16, 8);
        c.fillStyle = '#8a6c3c'; c.fillRect(x, y + 4, 16, 5);
        c.fillStyle = '#e8c060'; c.fillRect(x, y + 3, 16, 2);
        c.fillStyle = '#241a33'; c.fillRect(x + 3, y + 6, 2, 3); c.fillRect(x + 11, y + 6, 2, 3);
        return;
      }
      c.fillStyle = '#241a33'; c.fillRect(x, y + 2, 16, 8);
      c.fillStyle = '#a8703c'; c.fillRect(x, y + 3, 16, 6);
      c.fillStyle = '#c08850'; c.fillRect(x, y + 3, 16, 2);
    } else if (ch === 'B') {
      c.fillStyle = '#241a33'; c.fillRect(x, y, 16, 16);
      c.fillStyle = '#b07a48'; c.fillRect(x + 1, y + 1, 14, 14);
      c.fillStyle = '#8a5c2c'; c.fillRect(x + 1, y + 7, 14, 2);
      c.fillStyle = '#c08850'; c.fillRect(x + 1, y + 1, 14, 2);
      c.strokeStyle = '#704820'; c.strokeRect(x + 2.5, y + 2.5, 11, 11);
    } else if (ch === '^') {
      const col = th === 'bramble' ? '#3a7a34' : th === 'squall' ? '#6c7484' : '#9adcf8';
      c.fillStyle = '#241a33';
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + k * 4 + 2, y + 16); c.lineTo(x + k * 4 + 4, y + 5); c.lineTo(x + k * 4 + 6, y + 16); c.fill(); }
      c.fillStyle = col;
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + k * 4 + 3, y + 16); c.lineTo(x + k * 4 + 4, y + 8); c.lineTo(x + k * 4 + 5, y + 16); c.fill(); }
    } else if (ch === '<' || ch === '>') {
      const dir = ch === '>' ? 1 : -1, ph = ((S.t * dir * 28) % 8 + 8) % 8;
      c.fillStyle = '#241a33'; c.fillRect(x, y, 16, 16);
      c.fillStyle = '#54387c'; c.fillRect(x, y + 6, 16, 10);
      c.fillStyle = '#8a94a8'; c.fillRect(x, y, 16, 6);
      c.fillStyle = '#c8d0dc'; c.fillRect(x, y, 16, 2);
      c.fillStyle = '#3a2c50';
      for (let k = 0; k < 2; k++) c.fillRect(x + (k * 8 + ph) % 16, y + 1, 3, 4);
      c.fillStyle = '#241a33'; c.fillRect(x, y + 5, 16, 1);
    } else if (ch === 'o') {
      if (S.coins[i + ',' + j]) return;
      const bob = Math.sin(S.t * 4 + i) * 2;
      c.save(); c.translate(x + 5, y + 4 + bob); c.scale(1.4, 1.4); dspr(c, Sprites.items.coin, 0, 0); c.restore();
    } else if (ch === 'S') {
      c.fillStyle = '#241a33'; c.fillRect(x + 2, y + 8, 12, 8);
      c.fillStyle = '#e84a4a'; c.fillRect(x + 3, y + 9, 10, 3);
      c.fillStyle = '#aab2c0'; c.fillRect(x + 5, y + 12, 6, 3);
      c.fillStyle = '#fff'; c.fillRect(x + 3, y + 9, 10, 1);
    } else if (ch === 'F') {
      const got = S.flags[i];
      const gy = this.groundYAt(S, x + 8);          // plant the flagpole on the ground
      c.fillStyle = '#241a33'; c.fillRect(x + 7, gy - 30, 2, 30);
      c.fillStyle = got ? '#f8d048' : '#aab2c0';
      c.beginPath(); c.moveTo(x + 9, gy - 29); c.lineTo(x + 9 + 10, gy - 25 + Math.sin(S.t * 5) * 1.5); c.lineTo(x + 9, gy - 21); c.fill();
    }
  },
  drawSky(c, S) {
    const th = S.def.theme, t = S.t, cx = S.camX;
    let g = c.createLinearGradient(0, 0, 0, SH);
    if (th === 'bramble') { g.addColorStop(0, '#8ed4f4'); g.addColorStop(1, '#cdeccd'); }
    else if (th === 'squall') { g.addColorStop(0, '#3a4668'); g.addColorStop(1, '#6c80a8'); }
    else if (th === 'cogwerk') { g.addColorStop(0, '#b06a3c'); g.addColorStop(1, '#e8b878'); }
    else { g.addColorStop(0, '#140a2e'); g.addColorStop(1, '#3a2458'); }
    c.fillStyle = g; c.fillRect(0, 0, SW, SH);
    if (th === 'bramble') {
      c.fillStyle = 'rgba(255,255,255,.8)';
      for (let k = 0; k < 5; k++) { const x = ((k * 167 - cx * 0.2) % (SW + 80)) - 40 + ((k * 53) % 30); c.beginPath(); c.arc(x, 40 + (k % 3) * 22, 13 + (k % 2) * 6, 0, 7); c.fill(); }
      c.fillStyle = '#7fbf72';
      for (let k = 0; k < 7; k++) { const x = ((k * 150 - cx * 0.4) % (SW + 160)) - 80; c.beginPath(); c.arc(x, SH + 30, 90, 0, 7); c.fill(); }
      c.fillStyle = '#69b25e';
      for (let k = 0; k < 7; k++) { const x = ((k * 190 - cx * 0.6) % (SW + 200)) - 100 + 60; c.beginPath(); c.arc(x, SH + 50, 100, 0, 7); c.fill(); }
    } else if (th === 'squall') {
      c.fillStyle = 'rgba(26,26,44,.7)';
      for (let k = 0; k < 6; k++) { const x = ((k * 140 - cx * 0.25 - t * 18) % (SW + 120)) - 60; c.beginPath(); c.arc(x, 36 + (k % 3) * 14, 24, 0, 7); c.arc(x + 20, 40 + (k % 3) * 14, 18, 0, 7); c.fill(); }
      if (((t * 2.5 | 0) % 9) === 0) { c.fillStyle = 'rgba(255,255,230,.12)'; c.fillRect(0, 0, SW, SH); }
      c.strokeStyle = 'rgba(190,210,240,.35)'; c.lineWidth = 1;
      for (let k = 0; k < 26; k++) {
        const rx = ((k * 67 + t * 220) % (SW + 40)) - 20, ry = ((k * 113 + t * 340) % SH);
        c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 3, ry + 9); c.stroke();
      }
      c.fillStyle = 'rgba(70,110,160,.5)';
      for (let k = 0; k < 9; k++) { const x = ((k * 110 - cx * 0.5 - t * 30) % (SW + 120)) - 60; c.beginPath(); c.arc(x, SH - 6, 40, 0, 7); c.fill(); }
    } else if (th === 'cogwerk') {
      // smoggy brass sky: slow skyline gears, chimneys, drifting smoke
      c.fillStyle = 'rgba(120,70,40,.30)';
      for (let k = 0; k < 6; k++) {
        const x = ((k * 150 - cx * 0.25) % (SW + 160) + SW + 160) % (SW + 160) - 80, y = 58 + (k % 3) * 26, r = 20 + (k % 2) * 9;
        c.save(); c.translate(x, y); c.rotate(t * (k % 2 ? 0.2 : -0.15) + k);
        for (let s2 = 0; s2 < 8; s2++) { c.rotate(Math.PI / 4); c.fillRect(r - 4, -3, 8, 6); }
        c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.restore();
      }
      c.fillStyle = 'rgba(90,50,30,.5)';
      for (let k = 0; k < 7; k++) {
        const x = ((k * 130 - cx * 0.5) % (SW + 160) + SW + 160) % (SW + 160) - 80;
        c.fillRect(x, SH - 60 - (k % 3) * 18, 26, 120);
        c.fillRect(x + 6, SH - 74 - (k % 3) * 18, 14, 16);
      }
      c.fillStyle = 'rgba(240,230,220,.18)';
      for (let k = 0; k < 7; k++) {
        const x = ((k * 130 - cx * 0.5) % (SW + 160) + SW + 160) % (SW + 160) - 80 + 13;
        c.beginPath(); c.arc(x + Math.sin(t + k) * 4, SH - 84 - (k % 3) * 18 - ((t * 12 + k * 9) % 26), 7, 0, 7); c.fill();
      }
    } else {
      c.fillStyle = '#fff';
      for (let k = 0; k < 40; k++) { const x = ((k * 97 - cx * 0.15) % SW + SW) % SW; const y = (k * 53) % (SH - 60); c.globalAlpha = 0.3 + (k % 3) * 0.25; c.fillRect(x, y, 1, 1); }
      c.globalAlpha = 1;
      if (((t | 0) % 4) === 0) { const sx2 = ((t * 160) % (SW + 100)); c.strokeStyle = 'rgba(180,220,255,.5)'; c.beginPath(); c.moveTo(sx2, 20); c.lineTo(sx2 - 26, 46); c.stroke(); }
      c.fillStyle = '#2a1c44';
      for (let k = 0; k < 8; k++) {
        const x = ((k * 130 - cx * 0.35) % (SW + 160)) - 80;
        c.beginPath(); c.moveTo(x - 50, SH); c.lineTo(x, SH - 90 - (k % 3) * 22); c.lineTo(x + 50, SH); c.fill();
      }
    }
  },
  // pinned boss bar: <=5 short words, ALWAYS on screen during the fight, gold when it's GO-time
  drawBossBar(c, S) {
    const b = S.boss;
    const hintFn = this.BOSS_HINT[b.kind];
    const line = hintFn ? hintFn(S, b) : 'BOP HIS HEAD!';
    const hot = b.stun > 0;
    c.fillStyle = 'rgba(16,10,26,.88)'; c.fillRect(0, SH - 24, SW, 24);
    c.fillStyle = hot ? '#f8d048' : '#3a2c50'; c.fillRect(0, SH - 24, SW, 2);
    drawText(c, line, 14, SH - 17, 11, hot ? '#f8e858' : '#fff', '#241a33');
    const kx = SW - 92;
    c.fillStyle = '#241a33'; c.fillRect(kx - 2, SH - 21, 18, 17);
    c.fillStyle = '#e8e4f8'; c.fillRect(kx - 1, SH - 20, 16, 14);
    drawText(c, 'X', kx + 4, SH - 17, 9, '#241a33');
    drawText(c, 'JUMP', kx + 20, SH - 16, 8, '#9a90b8', '#241a33');
  },
  drawHUD(c, S) {
    c.fillStyle = 'rgba(16,10,26,.85)'; c.fillRect(0, 0, SW, ROAD_TOP);
    c.fillStyle = '#f8d048'; drawText(c, S.def.name, 8, 6, 11, '#f8d048', '#241a33');
    for (let i = 0; i < Player.maxHearts / 2; i++) {
      const fill = Player.hearts - i * 2;
      c.save(); c.translate(220 + i * 13, 8); c.scale(1.5, 1.5);
      dspr(c, fill >= 1 ? Sprites.items.heart : Sprites.items.heartC, 0, 0);
      c.restore();
    }
    c.save(); c.translate(SW - 120, 8); c.scale(1.5, 1.5); dspr(c, Sprites.items.coin, 0, 0); c.restore();
    drawText(c, 'x' + Game.flags.coins, SW - 104, 8, 10, '#f8e858', '#241a33');
    if (Game.flags.wings || S.def.wings) {
      // five feathers = five flaps; they grey out as you spend them, refill on landing
      for (let k = 0; k < ROAD_FLAPS; k++) {
        c.save(); c.translate(SW - 236 + k * 12, 13); c.rotate(-0.5);
        c.fillStyle = k < S.p.flaps ? '#fff' : '#3a2c50';
        c.beginPath(); c.ellipse(0, 0, 3, 6.5, 0, 0, 7); c.fill();
        c.strokeStyle = '#241a33'; c.stroke();
        if (k < S.p.flaps) { c.fillStyle = '#c8e8f8'; c.fillRect(-0.5, -5, 1, 9); }
        c.restore();
      }
    }
    if (!G.NQ_TOUCH) drawText(c, 'X: jump', SW - 52, 9, 8, '#9a90b8', '#241a33');   // touch: the X button IS the hint (and ... sits there)
  },
};
// pinned-hint defaults for the classic road bosses (cog bosses register theirs in 19b)
Object.assign(SideScroll.BOSS_HINT, {
  tollgoat: (S, b) => 'JUMP ON HIS HEAD!',
  galegull: (S, b) => b.stun > 0 ? 'NOW! BOP THE GULL!' : b.state === 'tele' ? 'DIVE COMING! MOVE!' : 'WAIT FOR THE DIVE!',
  cometwolf: (S, b) => b.stun > 0 ? 'DIZZY! BOP HIM!' : b.state === 'dash' ? 'JUMP THE DASH!' : 'WATCH FOR THE DASH!',
});
// register for the test harness
if (G.NQ) { G.NQ.SideScroll = SideScroll; G.NQ.ROAD_LEVELS = ROAD_LEVELS; G.NQ.ROAD_ROUTES = ROAD_ROUTES; G.NQ.ROAD_BOSS_SPECIES = ROAD_BOSS_SPECIES; }
