"use strict";
// ===================== PEN DECORATIONS (IDEAS.md list 1, #8) =====================
// A DECOR CATALOG stand in the Grand Workshop: spend COINS on toys, ponds and lamps
// for the pens. Buying one plays the SAME full itemget fanfare as crafting a rare
// friend, then the decoration appears in its pen on the spot — and the pen friends
// REACT: they wander over to play, nudge the bouncy ball around, and throw hearts.
// A proper sink for the coin economy (befriending pays +2 a catch).
(function () {
  if (!MAPS.workshop) return;

  // Play items now cost 10x COINS (coins are abundant) AND one found MATERIAL scattered
  // across the whole game — so decorating means EXPLORING. The RAIN CLOUD is the trophy:
  // it needs the SKY-FEATHER from the very top of the Ascent.
  const DECOR = [
    { key: 'flowerbed', label: 'FLOWER GARDEN',   price: 60,  mat: 'seedbag', x: 21, y: 8,  desc: 'Flowers for the mythic field — butterflies visit!' },
    { key: 'ball',      label: 'BOUNCY BALL',     price: 80,  mat: 'spring',  x: 7,  y: 6,  desc: 'A big striped ball — meadow friends NUDGE it around!' },
    { key: 'sealamp',   label: 'PEARL LAMP',      price: 100, mat: 'pearl',   x: 30, y: 17, desc: 'A warm lamp for the lagoon beach — the water twinkles.' },
    { key: 'tireswing', label: 'TIRE SWING',      price: 120, mat: 'tire',    x: 12, y: 4,  desc: 'A cozy swing that sways — perfect for watching the pen.' },
    { key: 'pond',      label: 'SPLASH POND',     price: 150, mat: 'bucket',  x: 5,  y: 8,  desc: 'A cool blue pond with a lily pad. Splish splash!' },
    { key: 'fountain',  label: 'MARBLE FOUNTAIN', price: 180, mat: 'marble',  x: 25, y: 5,  desc: 'A sparkling fountain fit for a pegasus.' },
    { key: 'aviary',    label: 'FLOATING AVIARY', price: 200, mat: 'skyfeather', x: 16, y: 4, place: 'special', desc: 'Build a floating SKY-ISLAND where all your WINGED friends fly free — a bright cloud opens in the MYTHIC pen to visit it!' },
    // -- crafted from the DUNGEON secret-room materials; placed in the AQUARIUM / AVIARY --
    { key: 'treasurechest', label: 'TREASURE CHEST', price: 150, mat: 'goldnugget',  place: 'aquarium', x: 20, y: 22, desc: 'A golden chest for the seabed — it puffs happy coin-bubbles!' },
    { key: 'glowcoral',     label: 'GLOW CORAL',     price: 150, mat: 'crystalshard', place: 'aquarium', x: 50, y: 20, desc: 'A crystal coral that pulses with light in the aquarium.' },
    { key: 'suncrystal',    label: 'SUN CRYSTAL',    price: 220, mat: 'voidgem',     place: 'aviary',   desc: 'A floating sun-crystal for the aviary — your flyers circle it!' },
    { key: 'rainbowarch',   label: 'RAINBOW ARCH',   price: 200, mat: 'goldnugget',  place: 'aviary',   desc: 'A shining rainbow arch to swoop through in the aviary.' },
  ];
  Game.PEN_DECOR = DECOR;
  const owned = (k) => !!Game.flags['decor_' + k];

  // ---- the stand + the decoration spots live in the map from day one ----
  {
    const m = MAPS.workshop;
    if (!m._decor) {
      m._decor = true;
      OBJ(m, { type: 'decorcatalog', x: 15, y: 14 });
      SIGN(m, 14, 13, 'PEN DECOR CATALOG — spend COINS on toys for the pens! The friends will come and PLAY with them.');
      for (const d of DECOR) if (!d.place) OBJ(m, { type: 'pendecor', key: d.key, x: d.x, y: d.y });
    }
  }

  // ---- the catalog menu (same rig as the shop/combiner) ----
  Game.decorStock = function () {
    const MN = (Game.MAT_NAMES || {});
    return DECOR.map((d) => {
      const have = d.mat ? (this.flags.mats[d.mat] || 0) : 1;
      const can = owned(d.key) || (this.flags.coins >= d.price && have >= 1);
      const req = d.mat ? ('  +  1 ' + (MN[d.mat] || d.mat) + ' (have ' + have + ')') : '';
      return {
        key: d.key,
        label: owned(d.key) ? d.label + '  (placed!)' : d.label + ' - ' + d.price + ' coins' + req,
        special: !owned(d.key) && can,
        desc: owned(d.key) ? d.desc : d.desc + (d.mat && have < 1 ? '  — find a ' + (MN[d.mat] || d.mat) + ' out in the world!' : ''),
      };
    });
  };
  Game.openDecorCatalog = function () {
    this.menu = { type: 'decor', who: 'combi', sel: 0, items: this.decorStock() };
    this.state = 'menu'; Audio2.jingle('talk');
  };
  Game.decorBuySelected = function () {
    const m = this.menu, it = m.items[m.sel];
    if (!it) return;
    const d = DECOR.find((x) => x.key === it.key);
    if (owned(d.key)) { Audio2.jingle('talk'); this.toast('Already placed — the friends LOVE it!'); return; }
    if (this.flags.coins < d.price) {
      Audio2.jingle('denied');
      this.toast('Not enough coins! Befriending pays +2 a catch — chests help too.');
      return;
    }
    const MN = (Game.MAT_NAMES || {});
    if (d.mat && (this.flags.mats[d.mat] || 0) < 1) {
      Audio2.jingle('denied');
      this.toast('You need a ' + (MN[d.mat] || d.mat) + ' to craft this! Search the whole world for one.');
      return;
    }
    this.flags.coins -= d.price;
    if (d.mat) this.flags.mats[d.mat] = Math.max(0, (this.flags.mats[d.mat] || 0) - 1);
    this.flags['decor_' + d.key] = true;
    if (d.key === 'aviary') { this.flags.aviary = true; if (this.spawnAviaryCloud) this.spawnAviaryCloud(); }
    const whereMsg = d.place === 'aquarium' ? ' It appears in COMBI\'S AQUARIUM — dive down to see it!'
      : d.place === 'aviary' ? ' It appears in the FLOATING AVIARY — fly up to see it!'
      : d.place === 'special' ? '' : ' It appears in the pens RIGHT NOW!';
    // the SAME full fanfare a freshly-crafted friend gets
    this.itemGet(d.key === 'aviary' ? 'item:skyfeather' : ('decor:' + d.key), 'THE ' + d.label + '!', d.key === 'aviary' ? 'A bright CLOUD opens in the MYTHIC pen — step into it to FLY the aviary with your winged friends!' : (d.desc + whereMsg));
    if (this.map && this.map.id === 'workshop' && d.x !== undefined) {
      Particles.burst(d.x * TILE + 8, d.y * TILE, 'confetti');
      Particles.burst(d.x * TILE + 8, d.y * TILE - 6, 'sparkle');
    }
    m.items = this.decorStock(); m.sel = Math.min(m.sel, m.items.length - 1);
    saveGame();
  };
  {
    const _mc = Game.menuConfirm;
    Game.menuConfirm = function () {
      if (this.menu && this.menu.type === 'decor') { this.decorBuySelected(); return; }
      return _mc.call(this);
    };
  }
  {
    const _int = Game.interact;
    Game.interact = function () {
      if (this.state === 'play' && this.map && this.map.id === 'workshop') {
        for (const o of this.map.objects) {
          if (o.type === 'decorcatalog' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 24) { this.openDecorCatalog(); return; }
        }
      }
      return _int.call(this);
    };
  }

  // ---- one shared painter: the pen object AND the itemget icon use the same art ----
  function drawDecorArt(c, key, ox, oy, o) {
    const t = Game.time;
    if (key === 'ball') {
      const px = ox + (o && o._px || 0), py = oy + (o && o._py || 0);
      const roll = (o && o._roll || 0);
      c.fillStyle = 'rgba(20,10,40,.3)'; c.beginPath(); c.ellipse(px, py + 4, 6, 2, 0, 0, 7); c.fill();
      c.save(); c.translate(px, py - 2); c.rotate(roll);
      c.fillStyle = '#241a33'; c.beginPath(); c.arc(0, 0, 6.4, 0, 7); c.fill();
      c.fillStyle = '#e84a4a'; c.beginPath(); c.arc(0, 0, 5.2, 0, 7); c.fill();
      c.fillStyle = '#f8d048'; c.beginPath(); c.arc(0, 0, 5.2, -0.5, 0.9); c.lineTo(0, 0); c.fill();
      c.fillStyle = '#4878e8'; c.beginPath(); c.arc(0, 0, 5.2, 2.1, 3.5); c.lineTo(0, 0); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(-1.6, -1.8, 1.4, 0, 7); c.fill();
      c.restore();
    } else if (key === 'tireswing') {
      c.strokeStyle = '#8a5c2c'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(ox - 9, oy + 6); c.lineTo(ox - 6, oy - 14); c.lineTo(ox + 6, oy - 14); c.lineTo(ox + 9, oy + 6); c.stroke();
      const sw = Math.sin(t * 1.8 + ox * 0.1) * 3;
      c.strokeStyle = '#c8a04c'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(ox, oy - 14); c.lineTo(ox + sw, oy - 4); c.stroke();
      c.strokeStyle = '#241a33'; c.lineWidth = 3.6;
      c.beginPath(); c.arc(ox + sw, oy - 1, 3.4, 0, 7); c.stroke();
      c.strokeStyle = '#3a3244'; c.lineWidth = 2;
      c.beginPath(); c.arc(ox + sw, oy - 1, 3.4, 0, 7); c.stroke();
      c.lineWidth = 1;
    } else if (key === 'pond') {
      c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(ox, oy, 13, 7.5, 0, 0, 7); c.fill();
      c.fillStyle = '#4878e8'; c.beginPath(); c.ellipse(ox, oy, 11.5, 6, 0, 0, 7); c.fill();
      c.fillStyle = '#9adcf8'; c.beginPath(); c.ellipse(ox - 2, oy - 1, 7, 3.4, 0, 0, 7); c.fill();
      const r = ((t * 6) % 12);
      c.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - r / 12)).toFixed(2) + ')';
      c.beginPath(); c.ellipse(ox + 3, oy + 1, r * 0.7, r * 0.35, 0, 0, 7); c.stroke();
      c.fillStyle = '#58c452'; c.beginPath(); c.ellipse(ox - 5, oy + 2, 3, 1.8, 0.3, 0, 7); c.fill();
      c.fillStyle = '#e87898'; c.fillRect(ox - 6, oy, 2, 2);
    } else if (key === 'flowerbed') {
      c.fillStyle = '#6a4a2c'; c.beginPath(); c.ellipse(ox, oy + 2, 12, 4, 0, 0, 7); c.fill();
      const cols = ['#e84a4a', '#f8d048', '#e87898', '#9a62e0', '#f89238'];
      for (let k = 0; k < 5; k++) {
        const fx = ox - 8 + k * 4, fy = oy + Math.sin(k * 2.7) * 1.5;
        c.strokeStyle = '#58c452'; c.beginPath(); c.moveTo(fx, fy + 2); c.lineTo(fx, fy - 3); c.stroke();
        c.fillStyle = cols[k]; c.beginPath(); c.arc(fx, fy - 4, 2, 0, 7); c.fill();
        c.fillStyle = '#f8ec70'; c.fillRect(fx - 0.7, fy - 4.7, 1.4, 1.4);
      }
      for (let k = 0; k < 2; k++) {                                 // visiting butterflies
        const bx = ox + Math.sin(t * (1.3 + k * 0.4) + k * 3) * 13, by = oy - 8 + Math.sin(t * 2.2 + k * 1.7) * 4;
        const fl = Math.sin(t * 10 + k) > 0 ? 2.2 : 0.9;
        c.fillStyle = k ? '#f8d048' : '#e87898';
        c.beginPath(); c.ellipse(bx - fl, by, fl, 1.4, 0, 0, 7); c.ellipse(bx + fl, by, fl, 1.4, 0, 0, 7); c.fill();
      }
    } else if (key === 'fountain') {
      c.fillStyle = '#241a33'; c.beginPath(); c.ellipse(ox, oy + 2, 12, 5, 0, 0, 7); c.fill();
      c.fillStyle = '#c8d0dc'; c.beginPath(); c.ellipse(ox, oy + 1, 10.5, 4, 0, 0, 7); c.fill();
      c.fillStyle = '#9adcf8'; c.beginPath(); c.ellipse(ox, oy + 1, 8.5, 3, 0, 0, 7); c.fill();
      c.fillStyle = '#8a94a8'; c.fillRect(ox - 1.5, oy - 8, 3, 9);
      for (let k = 0; k < 4; k++) {                                 // arcing water jets
        const ph = (t * 1.6 + k / 4) % 1, dir = k % 2 ? 1 : -1;
        const jx = ox + dir * ph * 7, jy = oy - 8 + Math.sin(ph * Math.PI) * -6 + ph * 9;
        c.fillStyle = 'rgba(190,235,255,' + (0.9 - ph * 0.6).toFixed(2) + ')';
        c.fillRect(jx, jy, 1.6, 1.6);
      }
      if (((t * 2 | 0) % 3) === 0) { c.fillStyle = '#fff'; c.fillRect(ox - 6 + ((t * 31 | 0) % 12), oy - 10, 1, 1); }
    } else if (key === 'sealamp') {
      c.fillStyle = '#241a33'; c.fillRect(ox - 1.5, oy - 12, 4, 14);
      c.fillStyle = '#8a5c2c'; c.fillRect(ox - 1, oy - 12, 3, 14);
      c.fillStyle = '#241a33'; c.beginPath(); c.arc(ox + 0.5, oy - 14, 4.6, 0, 7); c.fill();
      c.fillStyle = '#f8d8e8'; c.beginPath(); c.arc(ox + 0.5, oy - 14, 3.4, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ox - 0.5, oy - 15, 1.2, 0, 7); c.fill();
      c.save(); c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(255,225,240,' + (0.16 + 0.08 * Math.sin(t * 2.6)).toFixed(2) + ')';
      c.beginPath(); c.arc(ox + 0.5, oy - 14, 11 + Math.sin(t * 2.6) * 2, 0, 7); c.fill(); c.restore();
    } else if (key === 'raincloud') {
      // a plump cloud drifting a little, sprinkling a happy rain (the Ascent trophy decor)
      const dx = Math.sin(t * 0.7) * 4, cy = oy - 14 + Math.sin(t * 1.3) * 1.5;
      c.fillStyle = '#c8d0e0';
      for (const [bx, by, r] of [[-7, 0, 5], [0, -2, 6.5], [7, 0, 5], [2, 2, 5]]) { c.beginPath(); c.arc(ox + dx + bx, cy + by, r, 0, 7); c.fill(); }
      c.fillStyle = '#e8ecf4';
      for (const [bx, by, r] of [[-5, -2, 3], [1, -4, 3.5], [6, -2, 2.6]]) { c.beginPath(); c.arc(ox + dx + bx, cy + by, r, 0, 7); c.fill(); }
      c.fillStyle = '#7a86a0'; c.beginPath(); c.ellipse(ox + dx, cy + 4, 9, 3, 0, 0, 7); c.fill();
      // rain streaks + a tiny sun-sparkle
      c.strokeStyle = '#8ec8f8'; c.lineWidth = 1;
      for (let k = 0; k < 5; k++) {
        const rx = ox + dx - 8 + k * 4, ph = ((t * 22 + k * 7) % 18);
        c.globalAlpha = 0.7 - ph / 26; c.beginPath(); c.moveTo(rx, cy + 6 + ph); c.lineTo(rx - 1, cy + 10 + ph); c.stroke();
      }
      c.globalAlpha = 1; c.lineWidth = 1;
      if ((t * 2 | 0) % 3 === 0) { c.fillStyle = '#fff'; c.fillRect(ox + dx + 4, cy - 8, 1, 1); }
    } else if (key === 'treasurechest') {
      c.fillStyle = '#241a33'; c.fillRect(ox - 9, oy - 8, 18, 12);
      c.fillStyle = '#8a5c2c'; c.fillRect(ox - 8, oy - 3, 16, 7);
      c.fillStyle = '#c8a04c'; c.fillRect(ox - 8, oy - 8, 16, 5);
      c.fillStyle = '#f8d048'; c.fillRect(ox - 8, oy - 8, 16, 2); c.fillRect(ox - 8, oy - 1, 16, 1);
      c.fillStyle = '#241a33'; c.fillRect(ox - 1, oy - 4, 2, 3);
      // coin-bubbles drifting up
      for (let k = 0; k < 3; k++) { const by = oy - 10 - ((t * 12 + k * 8) % 22); c.fillStyle = 'rgba(248,216,72,' + (0.7 - ((t * 12 + k * 8) % 22) / 34).toFixed(2) + ')'; c.beginPath(); c.arc(ox - 4 + Math.sin(t + k) * 5, by, 1.5 + (k % 2), 0, 7); c.fill(); }
    } else if (key === 'glowcoral') {
      const cols = ['#f898c8', '#9adcf8', '#c8a0f0'];
      for (let k = 0; k < 3; k++) {
        const bx = ox - 7 + k * 7, h = 12 - Math.abs(k - 1) * 3, sway = Math.sin(t * 1.4 + k) * 1.5;
        c.strokeStyle = cols[k]; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, oy + 4); c.quadraticCurveTo(bx + sway, oy + 4 - h * 0.6, bx + sway * 1.3, oy + 4 - h); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(bx + sway * 1.3, oy + 4 - h, 2, 0, 7); c.fill();
      }
      c.lineWidth = 1;
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(180,220,255,' + (0.12 + 0.08 * Math.sin(t * 3)).toFixed(2) + ')'; c.beginPath(); c.arc(ox, oy - 2, 12, 0, 7); c.fill(); c.restore();
    } else if (key === 'suncrystal') {
      c.save(); c.translate(ox, oy - 2); c.rotate(t * 0.4);
      c.fillStyle = '#f8d048'; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.lineTo(Math.cos(a) * 9, Math.sin(a) * 9); const a2 = a + Math.PI / 6; c.lineTo(Math.cos(a2) * 4.5, Math.sin(a2) * 4.5); } c.fill();
      c.fillStyle = '#fff8d0'; c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); c.restore();
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,140,' + (0.2 + 0.12 * Math.sin(t * 2.5)).toFixed(2) + ')'; c.beginPath(); c.arc(ox, oy - 2, 16 + Math.sin(t * 2.5) * 3, 0, 7); c.fill(); c.restore();
    } else if (key === 'rainbowarch') {
      const rc = ['#e84a4a', '#f89238', '#f8d048', '#58c452', '#4878e8', '#9a62e0'];
      c.lineWidth = 2;
      for (let k = 0; k < 6; k++) { c.strokeStyle = rc[k]; c.beginPath(); c.arc(ox, oy + 12, 6 + k * 2, Math.PI, 0); c.stroke(); }
      c.lineWidth = 1;
      if ((t * 3 | 0) % 2) { c.fillStyle = '#fff'; c.fillRect(ox - 16 + ((t * 30 | 0) % 32), oy + 2, 1, 1); }
    }
  }

  // ---- pen objects: invisible until bought, then alive ----
  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.pendecor = function (c, o, ox, oy) {
    if (!owned(o.key)) return;
    // bouncy-ball toy physics (nudged by friends, settles home)
    if (o.key === 'ball') {
      const dt = 1 / 60;
      o._px = (o._px || 0) + (o._vx || 0) * dt; o._py = (o._py || 0) + (o._vy || 0) * dt;
      o._vx = (o._vx || 0) * 0.96; o._vy = (o._vy || 0) * 0.96;
      o._roll = (o._roll || 0) + (o._vx || 0) * dt * 0.3;
      o._px = clamp(o._px, -26, 26); o._py = clamp(o._py, -18, 18);
      o._px *= 0.999; o._py *= 0.999;
    }
    drawDecorArt(c, o.key, ox + 8, oy + 8, o);
  };
  Game.OBJDRAW.decorcatalog = function (c, o, ox, oy) {
    const t = Game.time;
    c.strokeStyle = '#8a5c2c'; c.lineWidth = 2;                       // an easel stand
    c.beginPath(); c.moveTo(ox + 2, oy + 10); c.lineTo(ox + 8, oy - 10); c.lineTo(ox + 14, oy + 10); c.stroke();
    c.lineWidth = 1;
    c.fillStyle = '#241a33'; c.fillRect(ox - 1, oy - 9, 18, 13);
    c.fillStyle = '#f0e0c8'; c.fillRect(ox, oy - 8, 16, 11);
    c.fillStyle = '#e84a4a'; c.fillRect(ox + 2, oy - 6, 5, 3);        // colorful little catalog pictures
    c.fillStyle = '#4878e8'; c.fillRect(ox + 9, oy - 6, 5, 3);
    c.fillStyle = '#58c452'; c.fillRect(ox + 2, oy - 1, 5, 3);
    c.fillStyle = '#f8d048'; c.fillRect(ox + 9, oy - 1, 5, 3);
    if (Sprites.items && Sprites.items.coin) dspr(c, Sprites.items.coin, ox + 12, oy - 14 + Math.sin(t * 2) * 1.5);
    if (dist(Player.x, Player.y, ox + 8, oy + 8) < 30) drawText(c, 'SPACE: decorate!', ox - 14, oy - 22, 7, '#f8e858', '#241a33');
  };

  // ---- the itemget fanfare icon: the decoration draws its own portrait ----
  const iconCache = {};
  function decorIcon(key) {
    if (iconCache[key]) return iconCache[key];
    const cv = mkCanvas(30, 30), x = cv.getContext('2d');
    drawDecorArt(x, key, 15, (key === 'sealamp' || key === 'tireswing' || key === 'raincloud') ? 24 : 18, null);
    cv.dens = 1;
    return (iconCache[key] = cv);
  }
  {
    const _icon = Game.itemIcon;
    Game.itemIcon = function (iconKey) {
      const [kind, name] = iconKey.split(':');
      if (kind === 'decor') return decorIcon(name);
      return _icon.call(this, iconKey);
    };
  }

  // ---- friends REACT: stroll over, play, throw hearts; the ball gets nudged ----
  const _ucDecor = updateCreature;
  updateCreature = function (c, map, dt, player) {
    _ucDecor(c, map, dt, player);
    if (!c.display || c._swim || c._crawl || !map || map.id !== 'workshop') return;
    const toys = map.objects.filter((o) => o.type === 'pendecor' && owned(o.key) &&
      c.home && o.x >= c.home.x - 1 && o.x <= c.home.x + c.home.w + 1 && o.y >= c.home.y - 1 && o.y <= c.home.y + c.home.h + 1);
    if (!toys.length) return;
    if (c._toyT === undefined) c._toyT = 2 + Math.random() * 6;
    c._toyT -= dt;
    if (c._toyT <= 0) {                                              // time to go play!
      const o = toys[(Math.random() * toys.length) | 0];
      const tx = o.x * TILE + 8, ty = o.y * TILE + 8;
      const d = Math.max(8, dist(c.x, c.y, tx, ty));
      const def = CREATURES[c.species] || { spd: 12 };
      c.vx = (tx - c.x) / d * def.spd; c.vy = (ty - c.y) / d * def.spd;
      c.wanderT = Math.min(2.6, d / def.spd);                        // walk straight there
      c._toyT = 7 + Math.random() * 9;
    }
    for (const o of toys) {
      const tx = o.x * TILE + 8, ty = o.y * TILE + 8;
      if (dist(c.x, c.y, tx, ty) < 15) {
        if (o.key === 'ball') {                                      // NUDGE! the ball rolls away
          const d = Math.max(4, dist(c.x, c.y, tx + (o._px || 0), ty + (o._py || 0)));
          o._vx = (o._vx || 0) + (tx + (o._px || 0) - c.x) / d * 46 * dt * 8;
          o._vy = (o._vy || 0) + (ty + (o._py || 0) - c.y) / d * 46 * dt * 8;
        }
        if ((c._playT = (c._playT || 0) - dt) <= 0) {
          c._playT = 1.4 + Math.random();
          Particles.burst(c.x, c.y - 10, Math.random() < 0.6 ? 'heart' : 'sparkle');
        }
      }
    }
  };
})();
