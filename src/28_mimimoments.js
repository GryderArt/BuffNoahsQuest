"use strict";
// ===================== MIMI MOMENTS + THE MIMI PHOTO ALBUM =====================
// Twenty surprise RAMSI scenes: his face fills the dialog box (zoomed, Lady-of-the-Lake
// style) and he hollers something silly about EXACTLY where you are. Mostly in gentle
// places (the Vale, the Stables, the Pipeworks). Every moment becomes a PHOTO in the
// MIMI ALBUM — a book in the Pillow Den. Unearned pages show WHERE + a hint.

(function () {
  // ---- Ramsi's big dialog faces (normal + SUPER) ----
  function installRamsiFaces() {
    if (typeof Sprites === 'undefined' || !Sprites.pixPortraits) return;
    try {
      if (Sprites.ramsi && !Sprites.pixPortraits.ramsi) Sprites.pixPortraits.ramsi = pixPortraitFor(Sprites.ramsi);
      if (Sprites.ramsiSuper && !Sprites.pixPortraits.ramsisuper) Sprites.pixPortraits.ramsisuper = pixPortraitFor(Sprites.ramsiSuper);
    } catch (err) {}
  }
  const _bas = buildAllSprites;
  buildAllSprites = function () { _bas(); installRamsiFaces(); };
  if (typeof Sprites !== 'undefined' && Sprites.pixPortraits) installRamsiFaces();

  // clicks can page dialogs too (mirrors the SPACE logic in 12_main)
  Game.advanceDialog = function () {
    const d = this.dialog; if (!d) return;
    d.lines.shift();
    if (!d.lines.length) {
      const after = d.after; this.dialog = null; this.state = 'play';
      if (after) after();
    }
  };

  const mm = () => { const F = Game.flags; F.mimimoments = F.mimimoments || {}; return F.mimimoments; };

  // SUPER MIMI face: once the FOUR STAR-CELLS are gathered (or after the finale),
  // Ramsi's dialog portrait is SUPER RAMSI — matching his sparkly announcement.
  const superNow = () => !!((Game.starcellCount && Game.starcellCount() >= 4) || Game.flags.colossus);
  function ramsiWho() {
    try { if (!Sprites.pixPortraits.ramsisuper && Sprites.ramsiSuper) Sprites.pixPortraits.ramsisuper = pixPortraitFor(Sprites.ramsiSuper); } catch (err) {}
    const hasArt = (Sprites.props && (Sprites.props.sramsi1 || Sprites.props.sramsi2)) || (Sprites.pixPortraits && Sprites.pixPortraits.ramsisuper);
    return superNow() && hasArt ? 'ramsisuper' : 'ramsi';
  }
  Game.ramsiWho = ramsiWho;

  // ---- THE TWENTY ----
  // check() runs only in calm play frames with Ramsi along; keep lines SHORT and silly.
  const spr = (path) => () => { try { return path(); } catch (e) { return null; } };
  const MOMENTS = [
    { id: 'vale_home', title: 'GREENWOOD VALE', hint: 'Bring Ramsi home to the meadow.',
      icon: spr(() => Sprites.creatures.sheep.right[0]),
      lines: ['GREEN! Snacks EVERYWHERE!', 'Mimi is HOME with Noah! Baaah!'],
      check: () => Game.mapId === 'vale' },
    { id: 'granny_meet', title: "GRANNY'S MEADOW", hint: 'Walk Ramsi up to Granny.',
      icon: spr(() => Sprites.npcs.granny),
      lines: ['GRANNY! Noah has a GRANNY!', 'Question: do grannies carry SNACKS?'],
      check: () => Game.mapId === 'vale' && Game.map.objects.some((o) => o.type === 'npc' && o.who === 'granny' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 40) },
    { id: 'zoo_friends', title: 'THE MENAGERIE', hint: "Visit Granny's zoo together.",
      icon: spr(() => Sprites.creatures.goat.right[0]),
      lines: ['SO many friends!', 'Mimi counts them: one, two... MANY!'],
      check: () => Game.mapId === 'grannyzoo' && Game.creatures.some((cr) => cr.display && cr.state !== 'gone' && dist(Player.x, Player.y, cr.x, cr.y) < 90) },
    { id: 'den_naps', title: 'THE PILLOW DEN', hint: 'Show Ramsi the nap room.',
      icon: spr(() => Sprites.props.plump),
      lines: ['A whole room of PILLOWS?!', 'Best. Day. EVER. Naps are Mimi cardio!'],
      check: () => Game.mapId === 'pillowden' },
    { id: 'mermaid_wow', title: 'THE LAGOON', hint: 'Craft a MERMAID, then bring Ramsi to the lagoon.',
      icon: spr(() => Sprites.creatures.mermaid.right[0]),
      lines: ['A REAL MERMAID?! Mimi is going to faint!', '...Okay. Mimi is fine. HELLO FISH LADY!'],
      check: () => Game.mapId === 'workshop' && (Game.flags.life_mermaid || 0) > 0 && Player.x > 23 * TILE && Player.y > 12 * TILE },
    { id: 'ship_secret', title: 'THE SUNKEN SHIP', hint: 'Dive to the AQUARIUM and swim up behind the great SUNKEN SHIP.',
      icon: spr(() => (Sprites.props && Sprites.props.sunkenship) || Sprites.creatures.mermaidsea.right[0]),
      lines: ['A whole SHIP under the sea!', 'Mimi is the CAPTAIN now! ...where is the snack hold?'],
      check: () => Game.mapId === 'aquarium' && Game.map.objects.some((o) => o.type === 'sunkenship' && dist(Player.x, Player.y, o.x * TILE + 8, (o.y - 2) * TILE) < 62) },
    { id: 'first_craft', title: 'THE COMBINER', hint: 'Craft your first rare friend.',
      icon: spr(() => Sprites.creatures.rainbowsheep.right[0]),
      lines: ['The machine went BZZT-POP...', 'and made a FRIEND! Mimi LOVES science!'],
      check: () => Game.mapId === 'workshop' && Game.RECIPES && Game.RECIPES.some((r) => (Game.log[r.id] || 0) > 0) && Game.map.objects.some((o) => o.type === 'combiner' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 90) },
    { id: 'stable_horses', title: 'THE STABLEWORKS', hint: 'Meet the wild horses with Ramsi.',
      icon: spr(() => Sprites.creatures.horse.right[0]),
      lines: ['HORSES! So big! So fast!', 'Mimi wants a piggyback ride!'],
      check: () => Game.mapId === 'stable' && Game.creatures.some((cr) => cr.species === 'horse' && cr.state !== 'gone' && dist(Player.x, Player.y, cr.x, cr.y) < 96) },
    { id: 'lion_brave', title: 'THE LION DEN', hint: 'Open the bone-latch and step inside... together.',
      icon: spr(() => Sprites.creatures.lion.right[0]),
      lines: ['Nice kitty. BIG kitty.', 'Mimi is very brave. Noah? Stand in front of Mimi.'],
      check: () => Game.mapId === 'stable' && Player.x > 30 * TILE && Player.y > 4 * TILE && Player.y < 13 * TILE },
    { id: 'hay_snack', title: 'THE HAY BARN', hint: 'Gather hay while Ramsi watches.',
      icon: spr(() => Sprites.items.hay),
      lines: ['Hay for the horses!', '...And ONE bite for Mimi. Okay, TWO bites.'],
      check: () => Game.mapId === 'stable' && (Game.flags.baits.hay || 0) > 0 },
    { id: 'pipes_sniff', title: 'THE PIPEWORKS', hint: 'Take Ramsi down among the pipes.',
      icon: spr(() => Sprites.tools.harpoon),
      lines: ['Pipes! Pipes everywhere!', 'Listen... sloosh sloosh. The water is HIDING!'],
      check: () => Game.mapId === 'cog2' },
    { id: 'water_flows', title: 'THE PIPEWORKS POND', hint: 'Make the water flow again!',
      icon: spr(() => Sprites.items.gem),
      lines: ['WATER! BAAAAH! MIMI SO WET!', '...Do it again do it again do it AGAIN!'],
      check: () => Game.mapId === 'cog2' && Game.flags.cog2_flow && (Game.map._pondTiles || []).some((pp) => dist(Player.x, Player.y, pp[0] * TILE + 8, pp[1] * TILE + 8) < 110) },
    { id: 'zip_bird', title: 'THE CLIFFSIDE CROSSING', hint: 'Ride a zip-wire with Ramsi along.',
      icon: spr(() => Sprites.gear.wing),
      lines: ['WHEEE! Mimi FLEW!', 'Mimi is a bird now! (Mimi is not a bird.)'],
      check: () => Game.mapId === 'crags' && Game.flags._zippedOnce },
    { id: 'sea_bath', title: 'SUNSPLASH COAST', hint: 'Show Ramsi the ocean.',
      icon: spr(() => Sprites.creatures.crab.right[0]),
      lines: ['The SEA! A bath as big as the SKY!', 'Mimi will NOT be taking it.'],
      check: () => { if (Game.mapId !== 'coast') return false; const ti = (Player.x / TILE) | 0, tj = (Player.y / TILE) | 0; for (let dj = -3; dj <= 3; dj++) for (let di = -3; di <= 3; di++) { const t = tileAt(Game.map, ti + di, tj + dj); if (t === 'water' || t === 'deep') return true; } return false; } },
    { id: 'school_smart', title: 'SUNSPLASH SCHOOL', hint: "Visit Ms. Plume's class together.",
      icon: spr(() => Sprites.npcs.plume),
      lines: ['A school! Mimi knows math:', 'snacks + snacks = HAPPY. A-plus for Mimi!'],
      check: () => Game.mapId === 'school' && Game.map.objects.some((o) => o.type === 'npc' && o.who === 'plume' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 96) },
    { id: 'trophy_gold', title: 'THE TROPHY HALL', hint: 'Admire the gold statues together.',
      icon: spr(() => Sprites.props.trophystar),
      lines: ['Gold statues of the scary guys!', 'Noah beat them ALL. Mimi was only a LITTLE scared.'],
      check: () => Game.mapId === 'trophyhall' && Game.map.objects.some((o) => o.type === 'trophy' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 84 && (o.fn ? o.fn(Game.flags, Game.log) : (Game.flags[o.key] || (Game.flags.starcells && Game.flags.starcells[o.key])))) },
    { id: 'gear_shiny', title: 'THE GEAR GALLERY', hint: "Show Ramsi Noah's treasures.",
      icon: spr(() => Sprites.gear.sandal),
      lines: ["All of Noah's shiny things!", "Mimi's favorite is... the SHINY one!"],
      check: () => Game.mapId === 'gearhall' && Game.map.objects.some((o) => o.type === 'pedestal' && (!o.flag || Game.flags[o.flag]) && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 84) },
    { id: 'stars_fell', title: 'STARFALL WASTES', hint: 'Walk the fallen-star fields with Ramsi.',
      icon: spr(() => Sprites.items.shard),
      lines: ['Stars fell down HERE!', 'Mimi will put them all back. ...Later. After snacks.'],
      check: () => Game.mapId === 'wastes' },
    { id: 'dark_burrow', title: 'THE UNDERBURROW', hint: 'Brave the dark tunnels side by side.',
      icon: spr(() => Sprites.creatures.alien.right[0]),
      lines: ['Dark! Spooky! Hold Mimi\'s hoof.', 'Mimi is holding YOUR hoof. Same thing!'],
      check: () => Game.map && Game.map.zone === 'burrow' },
    { id: 'super_mimi', title: 'THE FOUR STARS', hint: 'Gather ALL FOUR star-cells...',
      icon: spr(() => Sprites.ramsiSuper),
      lines: ['Mimi feels... SPARKLY!', 'SUPER MIMI! (Still takes naps.)'],
      check: () => Game.starcellCount && Game.starcellCount() >= 4 },
    { id: 'sunny_end', title: 'AFTER THE STORM', hint: 'Bring back the sunshine, then rest somewhere calm.',
      icon: spr(() => Sprites.props.colhelm),
      lines: ['The sun came back!', 'Mimi did that! (Noah helped. A lot.)'],
      check: () => Game.flags.colossus && Game.map && !Game.map.colossus },
    { id: 'warp_lost', title: 'THE STARFALL WARP', hint: 'Ride a WARP PAD in the Starfall Wastes — Mimi is NOT ready.',
      icon: spr(() => Sprites.items.shard),
      lines: ['Noah, where did you GO!!', 'Wait for meeeeee!'],
      check: () => false,
      onDismiss: () => { if (Game.launchRamsiFlight) Game.launchRamsiFlight(); } },
  ];
  Game.MIMI_MOMENTS = MOMENTS;

  // zip rides stamp a flag for the bird moment
  {
    const _uz = Game.updateZip;
    Game.updateZip = function (dt) {
      const was = !!this.zip;
      _uz.call(this, dt);
      if (was && !this.zip && this.mapId === 'crags') this.flags._zippedOnce = true;
    };
  }

  // ---- the trigger heart: one calm frame, one moment ----
  function checkMoments() {
    if (Game.state !== 'play' || Game.dialog || Game.menu || Game.cutscene || Game.zip) return;
    if (!Game.flags.ramsi) return;
    if (Game.winT > 0) return;                                  // never interrupt a victory beat
    if (Game.boss) return;                                       // never pop mid-boss-fight (calm scenes only)
    if (Game.companion && Game.companion.flyTo) return;          // let the WHEEE flight finish uninterrupted
    if (Game.map && Game.map.colossus) return;                  // the finale narrates itself (sunny_end waits for calm)
    const got = mm();
    const V = Game.flags.mimiphotoV = Game.flags.mimiphotoV || {};    // photo version per page (2 = crisp)
    const photos = Game.flags.mimiphotos || {};
    for (const M of MOMENTS) {
      let ok = false;
      try { ok = M.check(); } catch (err) { ok = false; }
      if (got[M.id]) {
        // RETRO RE-SHOOT: heal pages earned before crisp photos existed (V<2) or whose
        // photo was shed under a full localStorage. Re-snap AT MOST ONCE PER MAP VISIT
        // (the _retroShot guard, reset on loadMap) so a repeatedly-needed capture can
        // NEVER spew glitter/toasts every frame — the bug the player hit.
        const rs = Game._retroShot || (Game._retroShot = {});
        const needs = (V[M.id] || 0) < 2 || !photos[M.id];
        if (ok && needs && !rs[M.id] && !Game._pendingPhoto) {
          rs[M.id] = true;                                      // one attempt per visit
          Game._pendingPhoto = M.id;                            // 12_main snaps the clean scene this frame
          Game.toast('CLICK! A crisp new photo joins the MIMI ALBUM!');
          Audio2.jingle('gem');
          if (Game.companion) Particles.burst(Game.companion.x, Game.companion.y - 12, 'sparkle');
          return;
        }
        continue;
      }
      if (!ok) continue;
      got[M.id] = true;
      Game.fireMimiMoment(M);
      return;                                                   // one surprise at a time
    }
  }
  {
    const _uc = Game.updateCompanion;
    Game.updateCompanion = function (dt) {
      _uc.call(this, dt);
      checkMoments();
    };
  }

  Game.launchRamsiFlight = function () {
    const comp = this.companion; if (!comp) return;
    comp.flyTo = { x0: comp.x, y0: comp.y, t: 0, dur: 1.15 };   // arcs to wherever Noah is NOW
    comp.busyT = 0; Audio2.jingle('flap');
  };
  Game.fireMimiMoment = function (M) {
    mm()[M.id] = true;
    const who = ramsiWho();
    this.dialog = { name: who === 'ramsisuper' ? 'SUPER MIMI' : 'RAMSI', who, lines: M.lines.slice(),
      after: () => { this.toast('NEW PHOTO in the MIMI ALBUM! (Pillow Den)'); if (M.onDismiss) M.onDismiss(); } };
    this.state = 'dialog';
    this._pendingPhoto = M.id;                                  // 12_main snaps the clean scene this frame
    Audio2.jingle('flap');
    if (this.companion) { Particles.burst(this.companion.x, this.companion.y - 10, 'heart'); Particles.burst(this.companion.x, this.companion.y - 14, 'confetti'); }
    saveGame();
  };

  // ---- THE MIMI ALBUM (a book in the Pillow Den) ----
  Game.addMimiAlbum = function () {
    const m = MAPS.pillowden;
    if (!m || m._album) return;
    m._album = true;
    OBJ(m, { type: 'mimialbum', x: 9, y: 6 });
    SIGN(m, 8, 7, "THE MIMI ALBUM — Ramsi's favorite pictures! Grey pages tell you WHERE a new photo waits.");
  };
  Game.openAlbum = function () {
    this.menu = { type: 'album', sel: 0, items: MOMENTS.map((M) => ({ label: M.title })) };
    this.state = 'menu'; Audio2.jingle('talk');
  };
  {
    const _int = Game.interact;
    Game.interact = function () {
      if (this.state === 'play' && this.map && this.map.id === 'pillowden') {
        for (const o of this.map.objects) {
          if (o.type === 'mimialbum' && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 22) { this.openAlbum(); return; }
        }
      }
      return _int.call(this);
    };
  }
  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.mimialbum = function (c, o, ox, oy) {
    // a plump book on a little stand
    c.fillStyle = '#241a33'; c.fillRect(ox - 7, oy - 2, 14, 8);
    c.fillStyle = '#8a5c2c'; c.fillRect(ox - 6, oy - 1, 12, 6);
    c.fillStyle = '#241a33'; c.fillRect(ox - 9, oy - 12, 18, 11);
    c.fillStyle = '#c8506a'; c.fillRect(ox - 8, oy - 11, 16, 9);
    c.fillStyle = '#f0e0c8'; c.fillRect(ox - 7, oy - 10, 6, 7); c.fillRect(ox + 1, oy - 10, 6, 7);
    c.fillStyle = '#f8d048'; c.fillRect(ox - 1, oy - 11, 2, 9);
    if (((Game.time * 2 | 0) % 3) === 0) { c.fillStyle = '#fff'; c.fillRect(ox + 6, oy - 15, 1, 1); }
    if (dist(Player.x, Player.y, ox, oy) < 26) drawText(c, 'SPACE: album', ox - 24, oy - 20, 7, '#f8e858', '#241a33');
  };

  // the album spread (dispatched from UI.drawMenu)
  // decode captured-photo dataURLs into <img> once, cache them
  const photoCache = {};
  function photoImg(url) {
    if (!url || typeof Image === 'undefined') return null;
    if (photoCache[url] !== undefined) return photoCache[url];
    try { const im = new Image(); im.src = url; photoCache[url] = im; return im; } catch (e) { photoCache[url] = null; return null; }
  }
  const drawn = (im) => im && (im.complete !== false) && (im.naturalWidth === undefined || im.naturalWidth > 0);

  Game.drawAlbum = function (c, m, ui) {
    const got = mm(), photos = this.flags.mimiphotos || {};
    ui.hot = [];

    // ===== ZOOM VIEW: one big photo + its caption UNDER it (the dialog can't cover the scene) =====
    if (m.zoom != null) {
      const M = MOMENTS[m.zoom]; const has = !!got[M.id];
      c.fillStyle = 'rgba(16,10,24,.97)'; c.fillRect(0, 0, VW, VH);
      // the enlarged polaroid
      const pw = 300, ph = Math.round(pw * VH / VW), px = (VW - pw) / 2, py = 20;
      c.fillStyle = '#fff'; c.fillRect(px - 6, py - 6, pw + 12, ph + 40);
      c.strokeStyle = '#f8d048'; c.lineWidth = 2; c.strokeRect(px - 6.5, py - 6.5, pw + 13, ph + 41); c.lineWidth = 1;
      const im = has ? photoImg(photos[M.id]) : null;
      if (drawn(im)) { try { c.imageSmoothingEnabled = false; c.drawImage(im, px, py, pw, ph); } catch (e) {} }
      else {
        c.fillStyle = has ? '#bfe8c8' : '#54485e'; c.fillRect(px, py, pw, ph);
        drawText(c, has ? 'no photo yet!' : '???', px + pw / 2, py + ph / 2 - 12, 10, has ? '#2c5c3c' : '#e8dcf4', has ? false : '#241a33', 'center');
        if (has) drawText(c, 'Visit that place again — Mimi will SNAP one!', px + pw / 2, py + ph / 2 + 6, 8, '#2c5c3c', false, 'center');
      }
      drawText(c, M.title, px + pw / 2, py + ph + 8, 10, '#241a33', false, 'center');
      // the caption / hint UNDER the photo
      c.font = 'bold 11px monospace';
      const cap = has ? '"' + M.lines.join(' ') + '"' : 'HINT: ' + M.hint;
      wrapText(c, cap, VW - 60).slice(0, 3).forEach((l, li) => drawText(c, l, VW / 2, py + ph + 28 + li * 15, 11, has ? '#f8e858' : '#9adcf8', '#241a33', 'center'));
      // nav: click anywhere / arrows to flip, ESC to close
      ui.hot.push({ x: 0, y: 0, w: VW * 0.28, h: VH, fn: () => { m.zoom = (m.zoom + MOMENTS.length - 1) % MOMENTS.length; m.sel = m.zoom; } });
      ui.hot.push({ x: VW * 0.72, y: 0, w: VW * 0.28, h: VH, fn: () => { m.zoom = (m.zoom + 1) % MOMENTS.length; m.sel = m.zoom; } });
      drawText(c, '< flip', 10, VH - 12, 8, '#9adcf8', '#241a33');
      drawText(c, 'flip >', VW - 46, VH - 12, 8, '#9adcf8', '#241a33');
      drawText(c, 'ESC: back to album', VW / 2, VH - 12, 8, '#a89cc0', '#241a33', 'center');
      return;
    }

    // ===== GRID VIEW (auto-fits any number of moments into the view) =====
    const cols = 5, rows = Math.ceil(MOMENTS.length / cols);
    const cellW = 88, headH = 22, footH = 30;
    const cellH = Math.min(50, Math.floor((VH - 10 - headH - footH) / rows));   // shrink cells so every row fits on screen
    const thumbH = Math.max(26, cellH - 4);                                     // photo box; name-plate sits on its bottom 9px
    const W = 24 + cols * cellW, H = headH + rows * cellH + footH;
    const X0 = (VW - W) / 2, Y0 = (VH - H) / 2;
    ui.menuRect = { x: X0, y: Y0, w: W, h: H };
    c.fillStyle = 'rgba(24,16,32,.96)'; c.fillRect(X0, Y0, W, H);
    c.strokeStyle = '#f8d048'; c.lineWidth = 2; c.strokeRect(X0 + 1, Y0 + 1, W - 2, H - 2); c.lineWidth = 1;
    c.fillStyle = '#f0e0c8'; c.fillRect(X0 + 6, Y0 + headH - 2, W - 12, rows * cellH + 2);
    c.fillStyle = '#d8c4a8'; c.fillRect(X0 + W / 2 - 1, Y0 + headH - 2, 2, rows * cellH + 2);
    const done = MOMENTS.filter((M) => got[M.id]).length;
    drawText(c, 'THE MIMI ALBUM — ' + done + ' / ' + MOMENTS.length + ' photos  (click a photo to zoom)', X0 + 10, Y0 + 6, 9, '#f8d048');
    MOMENTS.forEach((M, i) => {
      const cx = X0 + 12 + (i % cols) * cellW, cy = Y0 + headH + ((i / cols) | 0) * cellH;
      const fw = 80, fh = thumbH;
      ui.hot.push({ x: cx, y: cy, w: fw, h: fh, fn: () => { Game.menu.sel = i; if (got[MOMENTS[i].id]) Game.menu.zoom = i; } });
      const has = !!got[M.id], sel = i === m.sel;
      c.fillStyle = sel ? '#f8d048' : '#241a33'; c.fillRect(cx, cy, fw, fh);
      const im = has ? photoImg(photos[M.id]) : null;
      if (drawn(im)) { try { c.imageSmoothingEnabled = true; c.drawImage(im, cx + 2, cy + 2, fw - 4, fh - 4); c.imageSmoothingEnabled = false; } catch (e) {} }
      else {
        c.fillStyle = has ? '#fff' : '#54485e'; c.fillRect(cx + 1.5, cy + 1.5, fw - 3, fh - 3);
        c.fillStyle = has ? '#9adcf8' : '#3a3244'; c.fillRect(cx + 4, cy + 4, fw - 8, fh - 15);
        if (has) {
          const ic = M.icon && M.icon(), midY = cy + (fh - 9) / 2 + 4;
          if (Sprites.ramsi) { const r = Sprites.ramsi, sc = Math.min(20 / sprW(r), 20 / sprH(r)); c.save(); c.translate(cx + 22, midY); c.scale(sc, sc); dspr(c, r, -sprW(r) / 2, -sprH(r)); c.restore(); }
          if (ic && ic.width) { const s2 = Math.min(20 / sprW(ic), 22 / sprH(ic)); c.save(); c.translate(cx + 56, midY); c.scale(s2, s2); dspr(c, ic, -sprW(ic) / 2, -sprH(ic)); c.restore(); }
        } else drawText(c, '?', cx + fw / 2, cy + (fh - 9) / 2 - 6, 12, '#8a7c98', false, 'center');
      }
      c.font = 'bold 5px monospace';
      c.fillStyle = 'rgba(20,14,28,.82)'; c.fillRect(cx, cy + fh - 9, fw, 9);        // a readable name-plate for EVERY frame
      drawText(c, M.title.slice(0, 20), cx + fw / 2, cy + fh - 7, 5, has ? '#f4ecd8' : '#b6a8cc', false, 'center');
    });
    const sM = MOMENTS[m.sel] || MOMENTS[0];
    const line = got[sM.id] ? sM.title + ' — "' + sM.lines[0] + '"' : sM.title + ' — HINT: ' + sM.hint;
    c.font = 'bold 9px monospace';
    c.fillStyle = 'rgba(20,14,28,.9)'; c.fillRect(X0 + 6, Y0 + H - footH + 2, W - 12, footH - 6);   // dark caption bar under the grid
    wrapText(c, line, W - 24).slice(0, 2).forEach((l, li) => drawText(c, l, X0 + 12, Y0 + H - footH + 4 + li * 11, 9, got[sM.id] ? '#f8e858' : '#9adcf8', '#241a33'));
  };
})();
