"use strict";
// ===================== THE GLIMMER DEEP (secret cave behind the sunken ship) =====================
// A crack in the seabed BEHIND the aquarium's sunken ship drops into a pitch-dark,
// glitter-walled chimney — the deepest, narrowest place in any world. New mechanic:
// GLOW ALGAE light up when Noah bumps them and slowly fade, so the way down is a
// trail of your own fading light. Glow fish drift like little lanterns. Sleepy
// anemone gates curl away (forever) when lit. At the very bottom waits LANTERNA,
// a shy lantern-fish whose light went out — light ALL THREE glow-plants at once to
// cheer her up. Her friendship unseals the PEARL LANTERN: Noah shines in the dark.
(function () {
  // ---- creatures: glow fish (living lanterns) + Lanterna's small aquarium form ----
  Object.assign(CREATURES, {
    glowfish: { name: 'Glow Fish', habitat: 'water', sea: true, spd: 15, catch: [], bait: null, sparkle: true },
    lanterna: { name: 'Lanterna',  habitat: 'water', sea: true, spd: 8,  catch: [], bait: null, sparkle: true },
  });
  const G2 = {
    glowfish: ['..kkkk..', '.kTTTTk.', 'kTeTTTkY', '.kTTTTk.', '..kkkk..'],
    lanterna: [
      '.........kYk..',
      '........kyYyk.',
      '........kYYYk.',
      '.........kSk..',
      '...kkkkkkk....',
      '..kPPPPPPPk...',
      '.kTpPPPWWPPk..',
      '.kTpPPPWePPk..',
      '.kTpPPPPPPPk..',
      '..kppppppppk..',
      '...kkkkkkk....',
    ],
  };
  const PAL2 = {
    glowfish: { T: '#48e0c8', Y: '#f8ec70', e: '#241a33' },
    lanterna: { P: '#4a3a78', p: '#6a5aa0', T: '#3a2f5e', W: '#ffffff', e: '#241a33', S: '#8a7cb0', Y: '#f8b800', y: '#f8ec70' },
  };
  function installGlowSprites() {
    const S = Sprites;
    const hasExt = (k) => (typeof EXT_ART !== 'undefined') && EXT_ART['creature.' + k + '.a'];
    for (const k of Object.keys(G2)) {
      if (hasExt(k)) continue;
      if (S.creatures[k] && S.creatures[k].right && S.creatures[k].right[0]) continue;
      const w = Math.max(...G2[k].map(r => r.length)), g = G2[k].map(r => r.padEnd(w, '.'));
      const a = buildSprite(g, PAL2[k]), b = buildSprite(hopFrame(g), PAL2[k]);
      S.creatures[k] = { right: [a, b], left: [flipH(a), flipH(b)] };
    }
    // the PEARL LANTERN item icon (for the treasure fanfare + gear rows)
    if (!S.items.pearllantern) {
      S.items.pearllantern = buildSprite([
        '..kkkk..',
        '.kGGGGk.',
        'kGWWPGGk',
        'kGWPPPGk',
        'kGPPPPGk',
        '.kGGGGk.',
        '..kGGk..',
        '...kk...',
      ], { G: '#c8a04c', W: '#ffffff', P: '#f8d8e8' });
    }
  }
  const _bas = buildAllSprites;
  buildAllSprites = function () { _bas(); installGlowSprites(); };
  if (typeof Sprites !== 'undefined' && Sprites.creatures) installGlowSprites();

  // ---- the map: a LONG, DEEP, NARROW chimney (a shape no other level tries) ----
  const CW = 30, CH = 121;
  const WP = [
    [15, 3], [7, 9], [22, 16], [6, 23], [20, 29], [8, 36], [22, 43], [10, 50],
    [22, 57], [6, 64], [17, 70], [8, 77], [22, 84], [12, 91], [22, 97], [8, 104], [15, 110],
  ];
  const PATH = [];
  let GC = null;
  if (typeof newMap === 'function' && !MAPS.glowcave) {
    const m = newMap('glowcave', CW, CH, 'coral', { name: 'The Glimmer Deep', song: 'deep', cliff: 'sea', zone: 'vale', underwater: true, aqua: true });
    m.dark = true; m.lightMask = true; m.darkness = 0.9;
    GC = m;
    const carve = (i, j) => {
      if (i < 1 || j < 1 || i > CW - 2 || j > CH - 2) return;
      if (m.tiles[j][i] !== 'openwater') { m.tiles[j][i] = 'openwater'; PATH.push([i, j]); }
    };
    const pocket = (cx, cy, rx, ry) => {
      for (let j = cy - ry; j <= cy + ry; j++) for (let i = cx - rx; i <= cx + rx; i++) {
        if (((i - cx) * (i - cx)) / (rx * rx) + ((j - cy) * (j - cy)) / (ry * ry) <= 1) carve(i, j);
      }
    };
    // serpentine corridors: dig DOWN from each bend, then ACROSS to the next (2 wide)
    for (let k = 0; k < WP.length - 1; k++) {
      const [ax, ay] = WP[k], [bx, by] = WP[k + 1];
      for (let j = ay; j <= by; j++) { carve(ax, j); carve(ax + 1, j); }
      const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx);
      for (let i = x0; i <= x1; i++) { carve(i, by); carve(i, by + 1); }
    }
    for (const [wx, wy] of WP) pocket(wx, wy, 3, 2);
    pocket(15, 112, 6, 6);                                        // LANTERNA's bulb chamber at the very bottom
    // sandy floors wherever water rests on rock; sparse kelp & shells
    for (let j = 1; j < CH - 1; j++) for (let i = 1; i < CW - 1; i++) {
      if (m.tiles[j][i] === 'openwater' && (TILEDEFS[m.tiles[j + 1][i]] || {}).solid) {
        m.tiles[j][i] = 'seafloor';
        const h = hash2(i, j);
        if (h > 0.86) m.tiles[j][i] = 'kelp'; else if (h > 0.78) m.tiles[j][i] = 'shell';
      }
    }
    // a faint dotted glow-vein marks the way for sharp eyes
    for (let k = 8; k < PATH.length; k += 13) { const [i, j] = PATH[k]; if (m.tiles[j][i] === 'openwater') m.tiles[j][i] = 'glowvein'; }
    // ---- glow algae along the descent (the light-trail mechanic) ----
    const near = (i, j, list, r) => list.some(([x, y]) => Math.abs(x - i) <= r && Math.abs(y - j) <= r);
    const placed = [];
    for (let k = 3; k < PATH.length && placed.length < 30; k += 5) {
      const [i, j] = PATH[k];
      if (j > 104) continue;                                      // the chamber keeps its three BOSS lights
      if (j >= 38 && j <= 42 && i >= 7 && i <= 11) continue;      // clear of gate 1
      if (j >= 72 && j <= 76 && i >= 16 && i <= 19) continue;     // clear of gate 2
      if (near(i, j, placed, 2)) continue;
      placed.push([i, j]);
      OBJ(m, { type: 'glowalgae', x: i, y: j, lit: 0 });
    }
    // dedicated teaching algae right beside each gate
    OBJ(m, { type: 'glowalgae', x: 9, y: 38, lit: 0 });
    OBJ(m, { type: 'glowalgae', x: 18, y: 72, lit: 0 });
    // ---- two sleepy ANEMONE GATES (light them open — they STAY open) ----
    const gate = (id, cells) => {
      for (const [ci, cj] of cells) m.tiles[cj][ci] = 'coral';
      OBJ(m, { type: 'anemgate', x: cells[0][0], y: cells[0][1], id, cells, open: 0 });
    };
    gate(1, [[8, 40], [9, 40]]);
    gate(2, [[17, 74], [18, 74]]);
    // ---- the bottom chamber: three BOSS lights, the pearl altar, treasure ----
    for (const [bx, by] of [[10, 109], [20, 114], [14, 117]]) OBJ(m, { type: 'glowalgae', x: bx, y: by, lit: 0, bosslight: true });
    OBJ(m, { type: 'pearlaltar', x: 15, y: 116 });
    CHEST(m, 23, 43, { gems: 6 });
    CHEST(m, 7, 64, { coins: 15 });
    CHEST(m, 10, 110, { heartpiece: 1 });
    // ---- ways home: bubbles at the top AND beside the altar (no long climb back) ----
    OBJ(m, { type: 'bubble', x: 13, y: 2, to: 'aquarium', tx: 36, ty: 22 });
    OBJ(m, { type: 'bubble', x: 20, y: 111, to: 'aquarium', tx: 36, ty: 22 });
    SIGN(m, 17, 3, 'THE GLIMMER DEEP! GLOW PLANTS wake when you BUMP them — then slowly fall asleep again. Follow your own light down, down, down...');
    SIGN(m, 19, 112, 'Someone very shy lives here. Her lantern went dark... light ALL THREE glow plants AT ONCE to show her the way back to bright!');
    m.start = { x: 15, y: 3 };
  }

  // ---- the secret way in: a crack in the seabed BEHIND the sunken ship ----
  if (MAPS.aquarium && !MAPS.aquarium._glowlink) {
    MAPS.aquarium._glowlink = true;
    OBJ(MAPS.aquarium, { type: 'cavemouth', x: 37, y: 23, to: 'glowcave', tx: 15, ty: 3 });
  }

  // ---- interactions: squeeze into the crack / wake the pearl ----
  {
    const _int = Game.interact;
    Game.interact = function () {
      if (this.state === 'play' && this.map) {
        for (const o of this.map.objects) {
          if (o.type === 'cavemouth' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 22) {
            Audio2.jingle('dive');
            this.banner('Noah squeezes through the secret crack... THE GLIMMER DEEP!');
            this.loadMap(o.to, o.tx, o.ty);
            return;
          }
          if (o.type === 'pearlaltar' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 22) {
            if (!this.flags.lanterna) { Audio2.jingle('talk'); this.toast('The giant clam is shut tight... someone sad drifts in the dark nearby.'); return; }
            if (!this.flags.pearllantern) {
              this.flags.pearllantern = true;
              this.itemGet('item:pearllantern', 'THE PEARL LANTERN!', 'Noah SHINES in dark places now — the deep and the burrows are friendly!');
              saveGame(); return;
            }
            Audio2.jingle('gem'); this.toast('The pearl hums warmly in your pack.'); return;
          }
        }
      }
      return _int.call(this);
    };
  }

  // ---- per-frame: algae fade/wake + anemone gates (chained onto the companion tick) ----
  function openGate(g, m, o, silent) {
    o.open = 1; g.flags['glowgate_' + o.id] = true;
    for (const [ci, cj] of o.cells) m.tiles[cj][ci] = 'openwater';
    if (!silent) {
      Audio2.jingle('door'); Particles.burst(o.x * TILE + 16, o.y * TILE + 8, 'sparkle');
      g.banner('The sleepy anemones curl away from the light — the way is OPEN, forever!');
      saveGame();
    }
  }
  function tickGlowCave(g, dt) {
    const m = g.map;
    // LANTERNA appears once Noah swims deep enough (keeps the long descent calm & quiet)
    if (!g.flags.lanterna && !g.boss && Player.y > 100 * TILE) {
      Bosses.spawn('lanterna', 15, 112);
      Object.assign(g.boss, {
        cfg: { wake: 'LANTERNA the lantern-fish hides here — her light went OUT and she is too shy to shine! Wake ALL THREE glow plants at once to cheer her up!' },
        lights: m.objects.filter(o => o.type === 'glowalgae' && o.bosslight),
      });
    }
    for (const o of m.objects) {
      if (o.type !== 'glowalgae') continue;
      if (o.lit > 0) o.lit = Math.max(0, o.lit - dt / (o.bosslight ? 11 : 8.5));
      if (o.lit < 0.92 && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 14) {
        if (!g.flags._algaeToasted) { g.flags._algaeToasted = 1; g.toast('The glow plant WAKES! It falls asleep slowly — keep swimming!'); }
        o.lit = 1; Audio2.jingle('gem');
        Particles.burst(o.x * TILE + 8, o.y * TILE + 2, 'sparkle');
      }
    }
    for (const o of m.objects) {
      if (o.type !== 'anemgate' || o.open) continue;
      for (const a of m.objects) {
        if (a.type === 'glowalgae' && a.lit > 0.3 && dist(a.x * TILE, a.y * TILE, o.x * TILE, o.y * TILE) < 3.4 * TILE) { openGate(g, m, o); break; }
      }
    }
  }
  {
    const _ucomp = Game.updateCompanion;
    Game.updateCompanion = function (dt) {
      _ucomp.call(this, dt);
      if (this.map && this.map.id === 'glowcave' && this.state === 'play') tickGlowCave(this, dt);
    };
  }

  // ---- populate: glow-fish schools, remembered gates, and the shy boss ----
  const FISH_HOMES = [[22, 16], [20, 29], [22, 43], [22, 57], [17, 70], [22, 84], [22, 97], [15, 110]];
  const _pz = Game.populateZoo;
  Game.populateZoo = function (mp) {
    _pz.call(this, mp);
    if (!mp) return;
    if (mp.id === 'aquarium' && this.flags.lanterna) {
      // after the rescue, LANTERNA + two glow fish visit the mermaid pond!
      const visits = [['lanterna', 16, 10], ['glowfish', 10, 8], ['glowfish', 24, 13]];
      for (const [sp, ci, cj] of visits) {
        const c = makeCreature(sp, ci, cj, { x: 3, y: 6, w: 30, h: 11 });
        c.display = true; c._swim = true; c.wanderT = Math.random() * 1.5;
        this.creatures.push(c);
      }
    }
    if (mp.id !== 'glowcave') return;
    for (const o of mp.objects) if (o.type === 'anemgate' && this.flags['glowgate_' + o.id] && !o.open) openGate(this, mp, o, true);
    FISH_HOMES.forEach(([fx, fy], i) => {
      const n = (i % 3 === 0) ? 2 : 1;
      for (let q = 0; q < n; q++) {
        const c = makeCreature('glowfish', fx + (q ? -2 : 1), fy + (q ? 1 : -1), { x: fx - 3, y: fy - 2, w: 6, h: 4 });
        c.display = true; c._swim = true; c.dir = (i + q) % 2 ? 1 : -1; c.wanderT = Math.random() * 1.5;
        this.creatures.push(c);
      }
    });
  };

  // ---- LANTERNA: a boss fight with no biting — pure light-puzzle ----
  Bosses.up_lanterna = function (b, dt) {
    const lights = b.lights || [];
    const lit = lights.filter(o => o.lit > 0.2);
    let tx = b.hx + Math.cos(b.t * 0.45) * 34, ty = b.hy + Math.sin(b.t * 0.7) * 14 + Math.sin(b.t * 0.29) * 9;
    if (lit.length) { const o = lit[0]; tx = o.x * TILE + 8; ty = o.y * TILE - 8; }   // drawn toward hope
    b.x += (tx - b.x) * Math.min(1, dt * 1.3); b.y += (ty - b.y) * Math.min(1, dt * 1.3);
    if ((b.shyT || 0) <= 0 && dist(Player.x, Player.y, b.x, b.y) < 15) {
      b.shyT = 0.9; Particles.burst(b.x, b.y - 6, 'dust'); Audio2.jingle('step');     // startled dart — never a bite
    }
    if ((b.shyT || 0) > 0) {
      b.shyT -= dt;
      const d = Math.max(6, dist(b.x, b.y, Player.x, Player.y));
      b.x += (b.x - Player.x) / d * 74 * dt; b.y += (b.y - Player.y) / d * 74 * dt;
    }
    b.x = clamp(b.x, 10 * TILE, 21 * TILE); b.y = clamp(b.y, 107 * TILE, 118 * TILE);
    if (lit.length >= 3) {
      this.catchBoss(b);
      Game.banner('ALL THREE GLOW! Lanterna peeks out... and her lantern CATCHES the light!');
    }
  };
  {
    const _fin = Bosses.finalize;
    Bosses.finalize = function (b) {
      if (b.name !== 'lanterna') return _fin.call(this, b);
      Game.boss = null;
      Game.flags.lanterna = true;
      Game.giveLoot({ heartC: 1 });
      Game.banner('LANTERNA GLOWS AGAIN! She is your friend now — and the giant clam below CREAKS open...');
      Audio2.playSong('deep');
      saveGame();
    };
  }
  {
    const _draw = Bosses.draw;
    Bosses.draw = function (c) {
      _draw.call(this, c);
      const b = Game.boss; if (!b || b.name !== 'lanterna') return;
      const lit = (b.lights || []).filter(o => o.lit > 0.2).length;
      const glow = b.caughtAnim > 0 ? 1 : lit / 3;
      const scale = b.caughtAnim > 0 ? Math.max(0.05, b.caughtAnim / 1.6) : 1;
      const bob = Math.sin(b.t * 2.2) * 3;
      const fd = Player.x < b.x ? -1 : 1;
      // SAME sprite as the freed lantern-fish (consistency); the boss just adds the
      // animated LANTERN glow (dim/grey when her lights are out -> gold as hope returns).
      const set = Sprites.creatures.lanterna;
      const spr = set && (fd > 0 ? set.right : set.left)[0];
      c.save(); c.translate(Math.round(b.x), Math.round(b.y + bob)); c.scale(scale, scale);
      if ((b.shyT || 0) > 0) c.rotate(Math.sin(b.t * 18) * 0.08);
      if (spr) { const bs = 2.3; c.save(); c.scale(bs, bs); dspr(c, spr, -sprW(spr) / 2, -sprH(spr) / 2); c.restore(); }
      // the lantern bulb sits atop the sprite; dim it when out, blaze gold as lights come on
      const lx = 8 * fd, ly = -22;
      if (glow <= 0.05) { c.fillStyle = 'rgba(84,88,106,.75)'; c.beginPath(); c.arc(lx, ly, 4.6, 0, 7); c.fill(); }
      else {
        c.fillStyle = glow < 0.5 ? '#f8d048' : '#f8ec70'; c.beginPath(); c.arc(lx, ly, 4, 0, 7); c.fill();
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(248,236,112,' + (0.30 * glow).toFixed(2) + ')';
        c.beginPath(); c.arc(lx, ly, 10 + Math.sin(b.t * 7) * 2.5, 0, 7); c.fill(); c.restore();
      }
      if (b.caughtAnim > 0) { const hs = Sprites.items.heart; if (hs) { c.save(); c.globalAlpha = Math.min(1, b.caughtAnim); c.translate(10 * fd, -38 - (1 - Math.min(1, b.caughtAnim)) * 6); dspr(c, hs, -sprW(hs) / 2, -sprH(hs) / 2); c.restore(); } }
      c.restore();
    };
  }
  {
    const _hint = Game.bossHintLine;
    Game.bossHintLine = function () {
      const b = this.boss;
      if (b && b.name === 'lanterna' && b.awake && b.caughtAnim <= 0) {
        const lit = (b.lights || []).filter(o => o.lit > 0.2).length;
        if (!lit) return { keys: [], text: 'BUMP THE GLOW PLANTS!' };
        if (lit < 3) return { keys: [], text: (3 - lit) + ' MORE! BE QUICK!', hot: true };
        return { keys: [], text: 'ALL THREE! WATCH!', hot: true };
      }
      return _hint.call(this);
    };
  }

  // ---- drawing: the crack, the algae, the gates, the altar ----
  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.cavemouth = function (c, o, ox, oy) {
    const cx = ox + 8, cy = oy + 8, t = Game.time;
    // a jagged dark crack in the seabed, breathing bubbles + a faint teal breath
    c.fillStyle = '#241a33';
    c.beginPath(); c.moveTo(cx - 12, cy + 8); c.lineTo(cx - 6, cy - 4); c.lineTo(cx - 1, cy + 3);
    c.lineTo(cx + 4, cy - 6); c.lineTo(cx + 9, cy + 1); c.lineTo(cx + 13, cy + 8); c.fill();
    c.fillStyle = '#080f20';
    c.beginPath(); c.moveTo(cx - 8, cy + 8); c.lineTo(cx - 4, cy); c.lineTo(cx, cy + 5);
    c.lineTo(cx + 4, cy - 2); c.lineTo(cx + 8, cy + 3); c.lineTo(cx + 10, cy + 8); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(126,240,200,' + (0.10 + 0.07 * Math.sin(t * 2.2)).toFixed(2) + ')';
    c.beginPath(); c.ellipse(cx, cy + 2, 13, 7, 0, 0, 7); c.fill(); c.restore();
    for (let k = 0; k < 5; k++) {
      const bx = cx + Math.sin(t * 1.4 + k * 2.1) * 5;
      const by = cy - ((t * 18 + k * 13) % 44);
      c.fillStyle = 'rgba(190,235,255,.75)'; c.beginPath(); c.arc(bx, by, 0.8 + (k % 3) * 0.7, 0, 7); c.fill();
    }
    if (dist(Player.x, Player.y, cx, cy) < 34) drawText(c, 'SPACE: ?', cx - 16, cy - 24, 7, '#9adcf8', '#241a33');
  };
  Game.OBJDRAW.glowalgae = function (c, o, ox, oy) {
    const lit = o.lit || 0, t = Game.time;
    const sc = o.bosslight ? 1.5 : 1;
    const dark = [20, 62, 66], bright = [126, 240, 200];
    const col = dark.map((d, i) => Math.round(d + (bright[i] - d) * lit));
    c.save(); c.translate(ox + 8, oy + 12); c.scale(sc, sc);
    for (let k = -2; k <= 2; k++) {
      const sway = Math.sin(t * (1.1 + k * 0.13) + o.x * 2 + k) * (2 + lit * 1.5);
      const h = 9 + Math.abs(k) * -1.5 + (k % 2 ? 2 : 0);
      c.strokeStyle = 'rgb(' + col.join(',') + ')'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(k * 2.6, 0); c.quadraticCurveTo(k * 2.6 + sway, -h * 0.6, k * 2.6 + sway * 1.4, -h);
      c.stroke();
    }
    c.lineWidth = 1;
    if (lit > 0.05) {
      c.save(); c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(126,240,200,' + (0.30 * lit).toFixed(2) + ')';
      c.beginPath(); c.arc(0, -5, 8 + lit * 7 + Math.sin(t * 5 + o.x) * 1.5, 0, 7); c.fill();
      for (let k = 0; k < 3; k++) {                                  // rising spores
        const sy = ((t * 9 + k * 8 + o.x * 3) % 24);
        c.fillStyle = 'rgba(200,255,230,' + (lit * (1 - sy / 24)).toFixed(2) + ')';
        c.fillRect(Math.sin(t * 2 + k * 2.4 + o.y) * 5, -4 - sy, 1.4, 1.4);
      }
      c.restore();
    } else if (((t * 1.6 + o.x * 0.7 + o.y * 0.3) % 3) < 0.22) {     // asleep: the faintest wink, so it CAN be found
      c.fillStyle = 'rgba(126,240,200,.5)'; c.fillRect(-1, -7, 1.5, 1.5);
    }
    c.restore();
  };
  Game.OBJDRAW.anemgate = function (c, o, ox, oy) {
    const t = Game.time;
    for (let ci = 0; ci < o.cells.length; ci++) {
      const gx = o.cells[ci][0] * TILE + 8 - (o.x * TILE + 8) + ox, gy = o.cells[ci][1] * TILE + 8 - (o.y * TILE + 8) + oy;
      if (o.open) {                                                  // curled away at the edges, fast asleep
        c.fillStyle = '#5a3a6a'; c.beginPath(); c.arc(gx - 6, gy + 6, 2.5, 0, 7); c.arc(gx + 6, gy + 6, 2.5, 0, 7); c.fill();
        if (((t + ci) % 3) < 1.4) drawText(c, 'z', gx + 4, gy - 6, 5, '#9adcf8');
        continue;
      }
      for (let k = 0; k < 4; k++) {                                  // a squishy wall of wiggling anemones
        const ax = gx - 6 + k * 4, sway = Math.sin(t * 2.2 + k * 1.3 + ci * 2) * 1.6;
        c.strokeStyle = k % 2 ? '#e87898' : '#b06ac0'; c.lineWidth = 2.4;
        c.beginPath(); c.moveTo(ax, gy + 8); c.quadraticCurveTo(ax + sway, gy, ax + sway * 1.5, gy - 7); c.stroke();
        c.fillStyle = '#f8c8d8'; c.beginPath(); c.arc(ax + sway * 1.5, gy - 7, 1.6, 0, 7); c.fill();
      }
      c.lineWidth = 1;
    }
    if (!o.open && dist(Player.x, Player.y, ox + 8, oy + 8) < 40) drawText(c, 'LIGHT THE PLANT!', ox - 18, oy - 14, 6, '#7ef0c8', '#241a33');
  };
  Game.OBJDRAW.pearlaltar = function (c, o, ox, oy) {
    const open = !!Game.flags.lanterna, taken = !!Game.flags.pearllantern, t = Game.time;
    c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(ox, oy + 6, 12, 4, 0, 0, 7); c.fill();
    c.fillStyle = '#54586a'; c.fillRect(ox - 7, oy - 2, 14, 8);
    c.fillStyle = '#6a707e'; c.fillRect(ox - 7, oy - 2, 14, 3);
    // the giant clam
    c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(ox, oy - 4, 11, 6, 0, 0, Math.PI, true); c.fill();
    c.fillStyle = '#c8a2c8'; c.beginPath(); c.ellipse(ox, oy - 4, 9.5, 4.6, 0, 0, Math.PI, true); c.fill();
    if (open) {
      const lift = 5 + Math.sin(t * 2) * 0.8;
      c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(ox, oy - 4 - lift, 11, 6, -0.22, Math.PI, 0, true); c.fill();
      c.fillStyle = '#e0b8e0'; c.beginPath(); c.ellipse(ox, oy - 4 - lift, 9.5, 4.6, -0.22, Math.PI, 0, true); c.fill();
      if (!taken) {
        c.fillStyle = '#fff'; c.beginPath(); c.arc(ox, oy - 6, 3.4, 0, 7); c.fill();
        c.fillStyle = '#f8d8e8'; c.beginPath(); c.arc(ox + 1, oy - 5, 1.6, 0, 7); c.fill();
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(255,240,250,' + (0.3 + 0.15 * Math.sin(t * 3)).toFixed(2) + ')';
        c.beginPath(); c.arc(ox, oy - 6, 9 + Math.sin(t * 3) * 2, 0, 7); c.fill(); c.restore();
        if (dist(Player.x, Player.y, ox, oy) < 30) drawText(c, 'SPACE!', ox - 11, oy - 22, 7, '#f8e858', '#241a33');
      } else if (((t * 2 | 0) % 3) === 0) { c.fillStyle = '#fff'; c.fillRect(ox + 3, oy - 10, 1.5, 1.5); }
    } else {
      c.fillStyle = '#8a6a8a'; c.fillRect(ox - 8, oy - 5, 16, 2);
      drawText(c, '???', ox - 8, oy - 16, 6, '#554a6a', '#241a33');
    }
  };

  // ---- the deep-dark backdrop (wraps the aquarium's painted parallax) ----
  {
    const _bg = Game.drawAquariumBg;
    Game.drawAquariumBg = function (c, camX, camY) {
      if (!Game.map || Game.map.id !== 'glowcave') return _bg.call(this, c, camX, camY);
      const t = Game.time;
      c.save(); c.translate(camX, camY);
      const g = c.createLinearGradient(0, 0, 0, VH);
      const deep = Math.min(1, camY / (CH * TILE - VH));                 // darker the deeper you go
      g.addColorStop(0, deep < 0.5 ? '#0b1f38' : '#071527'); g.addColorStop(1, '#02060f');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      for (let k = 0; k < 30; k++) {                                     // drifting glitter-dust
        const mx = ((k * 67 - camX * 0.3) % VW + VW) % VW, my = ((k * 53 + t * (4 + (k % 3) * 3)) % VH);
        const tw = 0.5 + 0.5 * Math.sin(t * 2.4 + k * 1.7);
        c.fillStyle = 'rgba(150,220,255,' + (0.05 + 0.1 * tw).toFixed(2) + ')';
        c.fillRect(mx, my, 1, 1);
      }
      c.restore();
    };
  }

  // ---- the darkness itself: a chained light-mask (same rig as the Crystal Deep) ----
  let gcMask = null;
  function punch(mc, x, y, r, a) {
    const g = mc.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,' + Math.min(1, a) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
    mc.fillStyle = g; mc.beginPath(); mc.arc(x, y, r, 0, 7); mc.fill();
  }
  {
    const _mask = Game.drawLightMask;
    Game.drawLightMask = function (c, map, camX, camY, Z) {
      if (!map || map.id !== 'glowcave') {
        if (_mask) _mask.call(this, c, map, camX, camY, Z);
        // the PEARL LANTERN: a warm halo around Noah in every other dark place
        if (Game.flags.pearllantern && map && map.lightMask) {
          const px = (Player.x - camX) * Z, py = (Player.y - 8 - camY) * Z;
          c.save(); c.globalCompositeOperation = 'lighter';
          const r = 46 + Math.sin(Game.time * 2.2) * 4;
          const g = c.createRadialGradient(px, py, 2, px, py, r);
          g.addColorStop(0, 'rgba(255,238,190,.15)'); g.addColorStop(1, 'rgba(255,238,190,0)');
          c.fillStyle = g; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); c.restore();
        }
        return;
      }
      if (!gcMask) gcMask = mkCanvas(VW, VH);
      const mc = gcMask.getContext('2d');
      const W2S = (wx, wy) => [(wx - camX) * Z, (wy - camY) * Z];
      mc.save(); mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, VW, VH);
      mc.fillStyle = 'rgba(4,2,12,' + (map.darkness !== undefined ? map.darkness : 0.9) + ')';
      mc.fillRect(0, 0, VW, VH);
      mc.globalCompositeOperation = 'destination-out';
      { const [sx, sy] = W2S(Player.x, Player.y - 8); punch(mc, sx, sy, Game.flags.pearllantern ? 84 : 46, 0.95); }
      for (const o of map.objects) {
        const [sx, sy] = W2S(o.x * TILE + 8, o.y * TILE + 8);
        if (sx < -80 || sx > VW + 80 || sy < -80 || sy > VH + 80) continue;
        if (o.type === 'glowalgae') {
          const base = (0.5 + 0.5 * Math.sin(Game.time * 2 + o.x * 3)) * 0.12;
          punch(mc, sx, sy, 10 + (o.lit || 0) * (o.bosslight ? 52 : 40), base + (o.lit || 0) * 0.85);
        } else if (o.type === 'bubble') punch(mc, sx, sy, 26, 0.6);
        else if (o.type === 'chest') punch(mc, sx, sy, 14, 0.4);
        else if (o.type === 'sign') punch(mc, sx, sy, 12, 0.35);
        else if (o.type === 'pearlaltar') punch(mc, sx, sy, Game.flags.lanterna && !Game.flags.pearllantern ? 44 : 14, Game.flags.lanterna ? 0.9 : 0.3);
      }
      for (const cr of Game.creatures) {                             // glow fish are swimming lanterns
        if (cr.species !== 'glowfish' && cr.species !== 'lanterna') continue;
        const [sx, sy] = W2S(cr.x, cr.y - 4); punch(mc, sx, sy, 30, 0.8);
      }
      const i0 = Math.max(0, (camX / TILE | 0) - 1), i1 = Math.min(map.w - 1, ((camX + VW / Z) / TILE | 0) + 1);
      const j0 = Math.max(0, (camY / TILE | 0) - 1), j1 = Math.min(map.h - 1, ((camY + VH / Z) / TILE | 0) + 1);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        if (map.tiles[j][i] === 'glowvein') { const [sx, sy] = W2S(i * TILE + 8, j * TILE + 8); punch(mc, sx, sy, 20, 0.5); }
      }
      if (Game.boss && Game.boss.name === 'lanterna') {
        const b = Game.boss, litN = (b.lights || []).filter(o => o.lit > 0.2).length;
        const [sx, sy] = W2S(b.x, b.y - 12);
        punch(mc, sx, sy, 16 + litN * 16 + (b.caughtAnim > 0 ? 60 : 0), 0.4 + litN * 0.2);
      }
      mc.restore();
      c.drawImage(gcMask, 0, 0);
      // GLITTER: the cave walls twinkle where the veil still lies
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        if (!(TILEDEFS[map.tiles[j][i]] || {}).solid) continue;
        const h = hash2(i * 3 + 1, j * 7 + 2);
        if (h > 0.24) continue;
        const tw = Math.sin(Game.time * (2.2 + h * 8) + i * 7.7 + j * 3.1);
        if (tw < 0.45) continue;
        const [sx, sy] = W2S(i * TILE + 3 + (h * 37 % 1) * 10, j * TILE + 3 + (h * 91 % 1) * 10);
        c.fillStyle = 'rgba(185,235,255,' + (0.5 * (tw - 0.45) / 0.55).toFixed(2) + ')';
        c.fillRect(sx, sy, 1.6, 1.6);
      }
      c.restore();
    };
  }
})();
