"use strict";
// ================= creatures, props, particles =================
// catch methods: mitts (grab), net (swing), harpoon (swimmers), cage+bait, bone-stun first
const CREATURES = {
  sheep:    { name: 'Sheep',     habitat: 'land',  spd: 12, catch: ['mitts','net','cage'], bait: 'clover', sea: false },
  ram:      { name: 'Ram',       habitat: 'land',  spd: 16, catch: ['net','cage'], bait: 'clover', feisty: true },
  goat:     { name: 'Goat',      habitat: 'land',  spd: 18, catch: ['net','cage'], bait: 'tincan', mountain: true },
  snowhare: { name: 'Snow Hare', habitat: 'land',  spd: 30, catch: ['net','cage'], bait: 'clover', skittish: true, mountain: true },
  crab:     { name: 'Crab',      habitat: 'land',  spd: 18, catch: ['mitts','net','cage'], bait: 'fishsnack', sting: 0.5, aggressive: true, aggro: 72 },
  octopus:  { name: 'Octopus',   habitat: 'water', spd: 14, catch: ['harpoon','net','cage'], bait: 'fishsnack', sea: true },
  jellyfish:{ name: 'Jellyfish', habitat: 'water', spd: 10, catch: ['harpoon','cage'], bait: 'fishsnack', sting: 0.5, touchSting: true, sea: true },
  shark:    { name: 'Shark',     habitat: 'water', spd: 30, catch: ['harpoon'], bait: null, sting: 1, aggressive: true, aggro: 120, sea: true },
  capricorn:{ name: 'Capricorn', habitat: 'water', spd: 16, catch: ['harpoon','net','cage'], bait: 'fishsnack', sea: true },
  starpupil:{ name: 'Star Pupil',habitat: 'land',  spd: 22, catch: ['cage'], bait: 'cookie', skittish: true },
  alien:    { name: 'Alien',     habitat: 'land',  spd: 24, catch: ['net','cage'], bait: 'cookie', sting: 0.5, aggressive: true, aggro: 96 },
  unicorn:  { name: 'Unicorn',   habitat: 'land',  spd: 34, catch: ['stun','cage'], bait: 'cookie', skittish: true },
  cometpup: { name: 'Comet Pup', habitat: 'land',  spd: 32, catch: ['net','stun','cage'], bait: 'cookie', sting: 0.5, aggressive: true, aggro: 84 },
  dragon:   { name: 'Dragon',    habitat: 'land',  spd: 24, catch: ['stun'], bait: null, sting: 1, aggressive: true, aggro: 110, stunThen: 'net' },
  condor:   { name: 'Condor',    habitat: 'land',  spd: 28, catch: ['net','cage'], bait: 'cookie', sting: 0.5, aggressive: true, aggro: 92 },
  ibex:     { name: 'Ibex',      habitat: 'land',  spd: 18, catch: ['net','cage'], bait: 'tincan', sting: 0.5, charger: true },
  // --- World 3: Cogwerk City PESTS (haywire clockwork critters) ---
  // Late-game ferocity: the pests chase from farther, run faster and BITE for real
  // (sting is in hearts; contact deals sting*2 half-hearts). Player.hurt's 1.1s
  // invulnerability window still guarantees no chain-drain, and 0 hearts is only ever "dizzy".
  voltbug:   { name: 'Volt-Bug',    habitat: 'land', spd: 48, catch: ['net','cage'], bait: 'cookie', sprite: 'voltbug',    sting: 1, aggressive: true, aggro: 124, pest: true },
  coghopper: { name: 'Cog-Hopper',  habitat: 'land', spd: 60, catch: ['net','cage'], bait: 'clover', sprite: 'coghopper', skittish: true, pest: true },
  rustbeetle:{ name: 'Rust-Beetle', habitat: 'land', spd: 20, catch: ['stun'],         bait: 'tincan', sprite: 'rustbeetle', stunThen: 'net', sting: 0.5, aggressive: true, aggro: 84, pest: true },
  steambull: { name: 'Steam-Bull',  habitat: 'land', spd: 26, catch: ['net','cage'], bait: 'clover', sprite: 'steambull', sting: 1, charger: true, feisty: true, pest: true },
  sparkdrone: { name: 'Spark-Drone', habitat: 'land', spd: 46, catch: ['net','cage'], bait: 'cookie', sprite: 'sparkdrone', sting: 1.5, aggressive: true, aggro: 144, dazeImmune: true, pest: true },
  blazagon:  { name: 'Blazagon',    habitat: 'land', spd: 30, catch: ['net'],         bait: 'cookie', sprite: 'blazagon', skittish: true, feisty: true, big: true },
};
const SEA_SPECIES = ['octopus', 'jellyfish', 'shark', 'capricorn'];

function makeCreature(species, x, y, home) {
  return { kind: 'creature', species, x: x * TILE + 8, y: y * TILE + 12, dir: 1, moveT: 0,
    vx: 0, vy: 0, home, stun: 0, state: 'wander', wanderT: Math.random() * 2, anim: Math.random() * 9 };
}
function creatureWalkable(map, c, ti, tj) {
  const id = tileAt(map, ti, tj), d = TILEDEFS[id] || {}, def = CREATURES[c.species];
  if (d.door || d.gate) return false;
  if (map.underwater) return !d.solid;
  if (def.habitat === 'water') return id === 'water' || id === 'deep';
  if (d.solid || d.hole || d.rift || d.swim) return false;
  return true;
}
function updateCreature(c, map, dt, player) {
  const def = CREATURES[c.species];
  // per-map FEROCITY: m.feral > 1 makes this map's critters chase from farther, close in
  // faster, recover charges sooner and bite harder (used by late-game bonus areas).
  const feral = map.feral || 1, feralSpd = feral > 1 ? 1.2 : 1;
  c.anim += dt;
  if (c.heartT > 0) c.heartT -= dt;                 // floating "you fed me!" heart fades out
  if (c.state === 'trapped' || c.state === 'gone') return;
  if (c.stun > 0) { c.stun -= dt; return; }
  // BLAZAGON escape: RUN + LEAP in a parabolic arc to the next rooftop (set up by Game.capture)
  if (c._leap) {
    const L = c._leap; L.t += dt; const pr = Math.min(1, L.t / L.dur);
    c.x = L.x0 + (L.x1 - L.x0) * pr;
    c.y = L.y0 + (L.y1 - L.y0) * pr - Math.sin(pr * Math.PI) * L.hop;     // hop arc
    c.dir = (L.x1 >= L.x0) ? 1 : -1; c.vx = (L.x1 - L.x0); c.vy = 0;       // run frames while leaping
    if (pr >= 1) { c.x = L.x1; c.y = L.y1; if (L.box) c.home = L.box; c._leap = null; c.state = 'wander'; }
    return;
  }
  // lure: walk toward an armed cage with matching bait
  let lure = null;
  for (const o of map.objects) {
    if (o.type === 'cageSet' && !o.done && o.bait === def.bait && dist(c.x, c.y, o.x * TILE + 8, o.y * TILE + 8) < 90) { lure = o; break; }
  }
  if (lure) {
    const tx = lure.x * TILE + 8, ty = lure.y * TILE + 8;
    const d = dist(c.x, c.y, tx, ty);
    if (d < 7) { lure.done = true; c.state = 'trapped'; c.trapAt = lure; Game.onTrapped(c, lure); return; }
    c.vx = (tx - c.x) / d * def.spd; c.vy = (ty - c.y) / d * def.spd;
  } else if (!c.display && def.aggressive && player && dist(c.x, c.y, player.x, player.y) < (def.aggro || 96) * feral) {
    c.state = 'chase';
    const d = Math.max(8, dist(c.x, c.y, player.x, player.y));
    c.vx = (player.x - c.x) / d * def.spd * feralSpd; c.vy = (player.y - c.y) / d * def.spd * feralSpd;
  } else if (!c.display && def.charger && player) {
    c.chargeCool = (c.chargeCool || 0) - dt;
    if (c.dashT > 0) { c.dashT -= dt; }                          // mid-dash: keep the straight-line lunge
    else if (dist(c.x, c.y, player.x, player.y) < 132 * feral && c.chargeCool <= 0) {
      const d = Math.max(8, dist(c.x, c.y, player.x, player.y));
      c.vx = (player.x - c.x) / d * def.spd * 2.6 * feralSpd; c.vy = (player.y - c.y) / d * def.spd * 2.6 * feralSpd; c.dashT = 0.45; c.chargeCool = 2.6 / feral; c.state = 'charge';
      Audio2.jingle('step');
    } else { c.wanderT -= dt; if (c.wanderT <= 0) { c.wanderT = 1 + Math.random() * 2; const a = Math.random() * 6.283; c.vx = Math.cos(a) * def.spd * 0.5; c.vy = Math.sin(a) * def.spd * 0.5; } }
  } else if (!c.display && def.skittish && player && dist(c.x, c.y, player.x, player.y) < 48 && c.state !== 'flee') {
    c.state = 'flee'; c.fleeT = 1.2;
  } else if (c.state === 'flee') {
    c.fleeT -= dt;
    const d = Math.max(8, dist(c.x, c.y, player.x, player.y));
    c.vx = (c.x - player.x) / d * def.spd * 1.6; c.vy = (c.y - player.y) / d * def.spd * 1.6;
    if (c.fleeT <= 0) c.state = 'wander';
  } else {
    c.wanderT -= dt;
    if (c.wanderT <= 0) {
      c.wanderT = 1 + Math.random() * 2.4;
      if (Math.random() < 0.35) { c.vx = 0; c.vy = 0; }
      else { const a = Math.random() * Math.PI * 2; c.vx = Math.cos(a) * def.spd; c.vy = Math.sin(a) * def.spd; }
    }
  }
  // FIERCE contact: an aggro'd critter that TOUCHES Noah nips him.
  // Calm/wandering creatures stay safe to walk up to and grab — catching is never punished.
  if (!c.display && def.sting && (c.state === 'chase' || c.state === 'charge' || def.touchSting) &&
      c.stun <= 0 && c.state !== 'trapped' && c.state !== 'gone' && player && Player.inv <= 0 &&
      dist(c.x, c.y, player.x, player.y) < 12) {
    Player.hurt(Math.max(1, Math.round(def.sting * 2 * feral)));
    Particles.burst(player.x, player.y - 8, 'dust'); Audio2.jingle('denied');
  }
  // home leash
  if (c.home && (c.x < c.home.x * TILE - 16 || c.x > (c.home.x + c.home.w) * TILE + 16 || c.y < c.home.y * TILE - 16 || c.y > (c.home.y + c.home.h) * TILE + 16)) {
    const hx = (c.home.x + c.home.w / 2) * TILE, hy = (c.home.y + c.home.h / 2) * TILE;
    const d = dist(c.x, c.y, hx, hy); c.vx = (hx - c.x) / d * def.spd; c.vy = (hy - c.y) / d * def.spd;
  }
  let nx = c.x + c.vx * dt, ny = c.y + c.vy * dt;
  if (creatureWalkable(map, c, (nx / TILE) | 0, (c.y / TILE) | 0)) c.x = nx; else c.vx *= -1;
  if (creatureWalkable(map, c, (c.x / TILE) | 0, (ny / TILE) | 0)) c.y = ny; else c.vy *= -1;
  if (Math.abs(c.vx) > 1) c.dir = c.vx > 0 ? 1 : -1;
}
function drawCreature(ctx2, c, map) {
  const def = CREATURES[c.species];
  const set = Sprites.creatures[def.sprite || c.species] || Sprites.creatures[c.species] || Sprites.creatures.alien;
  const e = elevAt(map, (c.x / TILE) | 0, (c.y / TILE) | 0);
  const spr = (c.dir > 0 ? set.right : set.left)[(Math.abs(c.vx) + Math.abs(c.vy) > 2 && ((c.anim * 6 | 0) % 2)) ? 1 : 0];
  const sx = c.x - sprW(spr) / 2, sy = c.y - sprH(spr) + 2 - (e < 9 ? e * EOFF : 0);
  const _S = ANIMAL_DRAW_SCALE * ((typeof CREATURE_SCALE !== 'undefined' && CREATURE_SCALE[c.species]) || 1), _ay = c.y + 1 - (e < 9 ? e * EOFF : 0);   // per-species scale, anchored at the feet
  ctx2.save(); ctx2.translate(c.x, _ay); ctx2.scale(_S, _S); ctx2.translate(-c.x, -_ay);
  // shadow (feet planted)
  ctx2.fillStyle = 'rgba(20,10,40,.3)';
  ctx2.beginPath(); ctx2.ellipse(c.x, c.y + 1 - (e < 9 ? e * EOFF : 0), sprW(spr) / 2.6, 2.5, 0, 0, 7); ctx2.fill();
  if (c.stun > 0) { ctx2.save(); ctx2.translate(c.x, sy); ctx2.rotate(Math.sin(c.anim * 14) * 0.12); ctx2.translate(-c.x, -sy); }
  const bob = def.habitat === 'water' && map.underwater ? Math.sin(c.anim * 3) * 1.5 : 0;
  dspr(ctx2, spr, Math.round(sx), Math.round(sy + bob));
  if (def.sparkle) {   // rare/crafted friends twinkle
    const ph = ((c.anim * 3 + c.x * 0.13) | 0) % 4;
    if (ph < 2) {
      ctx2.fillStyle = ph ? '#fff' : '#f8ec70';
      ctx2.fillRect(sx + 2 + ((c.anim * 41 | 0) % 10), sy + 1 + ((c.anim * 29 | 0) % 8), 1, 1);
      ctx2.fillRect(sx + sprW(spr) - 4 - ((c.anim * 23 | 0) % 8), sy + 4 + ((c.anim * 17 | 0) % 6), 1, 1);
    }
  }
  if (c.stun > 0) {
    ctx2.restore();
    drawText(ctx2, '★', c.x - 3 + Math.sin(c.anim * 10) * 3, sy - 8, 7, '#f8e858');
  }
  if (c.state === 'trapped') dspr(ctx2, Sprites.props.cage, c.x - 7, c.y - 8 - (e < 9 ? e * EOFF : 0));
  ctx2.restore();
  if (c.heartT > 0) {                               // the heart from our artwork — same one as the life total
    const hs = Sprites.items && Sprites.items.heart;
    if (hs) { const k = Math.min(1, c.heartT); ctx2.save(); ctx2.globalAlpha = Math.min(1, k * 1.6);
      ctx2.translate(c.x, c.y - 22 - (e < 9 ? e * EOFF : 0) - (1 - k) * 12); ctx2.scale(1.2, 1.2);
      dspr(ctx2, hs, -sprW(hs) / 2, -sprH(hs) / 2); ctx2.restore(); }
  }
}
// ---------------- particles ----------------
const Particles = {
  list: [], ambient: [],
  burst(x, y, kind) {
    const cols = { confetti: ['#e84a4a','#f8d048','#58c452','#4878e8','#f898c8','#9a62e0'],
      dust: ['#d2b88a','#c0a878'], sparkle: ['#fff','#f8e858','#9adcf8'], heart: ['#e84a4a','#f898c8'] };
    const n = kind === 'confetti' ? 26 : 10;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = kind === 'dust' ? 14 : 38;
      this.list.push({ x, y, vx: Math.cos(a) * s * (0.4 + Math.random()), vy: Math.sin(a) * s * (0.4 + Math.random()) - (kind === 'confetti' ? 36 : 6),
        life: 0.6 + Math.random() * (kind === 'confetti' ? 0.9 : 0.3),
        col: choice(cols[kind] || cols.sparkle, Math.random()), sz: kind === 'confetti' ? 2 : 1.5, grav: kind === 'confetti' ? 90 : 20 });
    }
  },
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt;
      if (p.life <= 0) this.list.splice(i, 1);
    }
  },
  draw(c, camX, camY) {
    for (const p of this.list) { c.fillStyle = p.col; c.fillRect(Math.round(p.x), Math.round(p.y), p.sz, p.sz); }
  },
  // ambient per zone (screen-space drift)
  drawAmbient(c, zone, time) {
    const seedBase = 999;
    const kinds = { vale: ['leaf', 14], coast: ['bubblet', 10], deep: ['bubblet', 22], wastes: ['star', 24], canyon: ['leaf', 10], snow: ['snow', 20] };
    const k = kinds[zone]; if (!k) return;
    for (let i = 0; i < k[1]; i++) {
      const r1 = hash2(i, 7), r2 = hash2(i, 13), sp = 8 + r2 * 16;
      let x = ((r1 * VW + time * (k[0] === 'star' ? 3 : sp)) % VW + VW) % VW;
      let y = ((r2 * VH + time * (k[0] === 'snow' || k[0] === 'leaf' ? sp : -sp)) % VH + VH) % VH;
      if (k[0] === 'leaf') { c.fillStyle = i % 2 ? 'rgba(120,200,90,.7)' : 'rgba(248,224,120,.6)'; c.fillRect(x, y, 2, 2); }
      else if (k[0] === 'snow') { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(x, y, 2, 2); }
      else if (k[0] === 'star') { c.fillStyle = i % 3 ? 'rgba(255,255,255,' + (0.3 + 0.5 * Math.abs(Math.sin(time * 2 + i))) + ')' : 'rgba(154,220,248,.8)'; c.fillRect(x, y, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1); }
      else { c.fillStyle = 'rgba(220,245,255,.55)'; c.beginPath(); c.arc(x, y, 1 + (i % 3), 0, 7); c.stroke(); c.strokeStyle = 'rgba(220,245,255,.5)'; }
    }
  }
};
// prop sprite positions for tree-type tiles
function propSpriteFor(id) { return id === 'tree' ? TileArt.tree : id === 'pine' ? TileArt.pine : id === 'palm' ? TileArt.palm : null; }
