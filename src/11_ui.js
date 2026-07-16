"use strict";
// ================= UI: side panel, dialog, menus, world map, title, credits =================
const UI = {
  panelHot: [],
  drawPanel(c) {
    this.panelHot = [];
    const F = Game.flags, X = VW;
    c.fillStyle = '#241a33'; c.fillRect(X, 0, PANEL_W, SH);
    c.fillStyle = '#382850'; c.fillRect(X, 0, 2, SH);
    // portrait + name
    const pi = Sprites.portraitImgs.noahFace;
    c.fillStyle = '#181020'; c.fillRect(X + 8, 6, 36, 36);
    if (pi && pi.complete !== false) { try { c.drawImage(pi, X + 8, 6, 36, 36); } catch (e) {} }
    c.strokeStyle = '#f8d048'; c.strokeRect(X + 7.5, 5.5, 37, 37);
    drawText(c, 'BUFF NOAH', X + 50, 8, 10, '#f8d048');
    drawText(c, Game.map ? Game.map.name : '', X + 50, 22, 8, '#9adcf8');
    // hearts
    let hy = 48;
    for (let i = 0; i < Player.maxHearts / 2; i++) {
      const hx = X + 8 + (i % 7) * 13, hyy = hy + ((i / 7) | 0) * 11;
      const fill = Player.hearts - i * 2;
      c.save(); c.translate(hx, hyy); c.scale(1.6, 1.6);
      dspr(c, fill >= 2 ? Sprites.items.heart : Sprites.items.heartC, 0, 0);
      if (fill === 1) { const hh = Sprites.items.heart, hd = hh.dens || 1; c.drawImage(hh, 0, 0, 4 * hd, 6 * hd, 0, 0, 4, 6); }
      c.restore();
    }
    hy += 12 * Math.ceil(Player.maxHearts / 14) + 12;
    // tools
    const tools = [['mitts', true, '1'], ['net', F.net, '2'], ['harpoon', F.harpoon, '3'], ['cage', F.cage, '4'], ['bone', F.bone, '5']];
    drawText(c, 'TOOLS (1-5, Q/E)', X + 8, hy, 7, '#a89cc0'); hy += 10;
    tools.forEach(([t, owned, num], i) => {
      const tx = X + 8 + i * 32;
      this.panelHot.push({ x: tx, y: hy, w: 28, h: 22, tool: t, owned });
      c.fillStyle = Player.tool === t ? '#4878e8' : '#181020';
      c.fillRect(tx, hy, 28, 22);
      c.strokeStyle = Player.tool === t ? '#f8d048' : '#382850'; c.strokeRect(tx + 0.5, hy + 0.5, 27, 21);
      c.globalAlpha = owned ? 1 : 0.22;
      c.save(); c.translate(tx + 5, hy + 4); c.scale(1.6, 1.6); dspr(c, Sprites.tools[t], 0, 0); c.restore();
      c.globalAlpha = 1;
      drawText(c, num, tx + 2, hy + 13, 7, owned ? '#fff' : '#555');
    });
    hy += 28;
    // (GEAR moved off the panel into YOUR PACK — press I; frees space for the quest box)
    // baits
    drawText(c, 'BAITS (tool 4 to set)', X + 8, hy, 7, '#a89cc0'); hy += 10;
    const baits = [['clover', 'clover'], ['tincan', 'tincan'], ['fishsnack', 'fishsnack'], ['cookie', 'cookie'], ['berry', 'berry'], ['hay', 'hay']];
    baits.forEach(([b, icon], i) => {
      const bx = X + 8 + i * 27;
      if (!Sprites.items[icon] || F.baits[b] === undefined) return;
      dspr(c, Sprites.items[icon], bx, hy);
      drawText(c, '' + F.baits[b], bx + 9, hy - 1, 8, F.baits[b] ? '#fff' : '#554a6a');
    });
    hy += 14;
    // MATERIALS (craft PLAY ITEMS at the decor catalog) — only shown once you have any
    if (F.mats && Object.keys(F.mats).some(k => F.mats[k] > 0)) {
      drawText(c, 'MATERIALS', X + 8, hy, 7, '#a89cc0'); hy += 10;
      const order = ['pearl', 'tire', 'spring', 'seedbag', 'marble', 'bucket', 'skyfeather', 'goldnugget', 'crystalshard', 'voidgem'].filter(k => (F.mats[k] || 0) > 0);
      order.forEach((mk, i) => {
        const bx = X + 8 + (i % 7) * 24, by = hy + ((i / 7) | 0) * 13;
        if (!Sprites.items[mk]) return;
        dspr(c, Sprites.items[mk], bx, by);
        drawText(c, '' + F.mats[mk], bx + 9, by - 1, 8, '#fff');
      });
      hy += 14 + (order.length > 7 ? 13 : 0);
    }
    // wallet
    dspr(c, Sprites.items.coin, X + 8, hy); drawText(c, '' + F.coins, X + 18, hy - 1, 9, '#f8e858');
    dspr(c, Sprites.items.gem, X + 56, hy + 1); drawText(c, '' + F.gems, X + 66, hy - 1, 9, '#9adcf8');
    dspr(c, Sprites.items.key, X + 104, hy); drawText(c, '' + F.keys, X + 114, hy - 1, 9, '#f8d048');
    drawText(c, 'HP:' + F.heartpieces + '/4', X + 130, hy - 1, 8, '#f898c8');
    hy += 14;
    // quest hint — stretches into the space freed by GEAR + the version stamp
    const qh = Math.max(74, SH - 16 - hy);
    c.fillStyle = '#181020'; c.fillRect(X + 6, hy, PANEL_W - 12, qh);
    c.strokeStyle = '#f8d048'; c.strokeRect(X + 6.5, hy + 0.5, PANEL_W - 13, qh - 1);
    drawText(c, '! QUEST', X + 10, hy + 3, 8, '#f8d048');
    c.font = 'bold 8px monospace';
    const lines = wrapText(c, Game.questHint(), PANEL_W - 24);
    lines.slice(0, Math.max(7, Math.floor((qh - 18) / 9))).forEach((l, i) => drawText(c, l, X + 10, hy + 14 + i * 9, 8, '#fff'));
    // controls hint (gear + log + baits live in YOUR PACK — press I)
    drawText(c, 'I:pack ESC:map P:music F:full', X + 8, SH - 12, 7, '#a89cc0');
  },
  drawBannersToasts(c, dt) {
    for (let i = Game.banners.length - 1; i >= 0; i--) {
      const b = Game.banners[i]; b.t -= dt;
      if (b.t <= 0) { Game.banners.splice(i, 1); continue; }
      if (i > 0) continue; // one at a time
      const a = Math.min(1, b.t);
      c.globalAlpha = a;
      c.fillStyle = '#241a33'; c.fillRect(10, 8, VW - 20, 40);
      c.strokeStyle = '#f8d048'; c.strokeRect(10.5, 8.5, VW - 21, 39);
      c.font = 'bold 11px monospace';
      const lines = wrapText(c, b.text, VW - 44);
      lines.slice(0, 2).forEach((l, j) => drawText(c, l, VW / 2, 14 + j * 14, 11, '#fff', '#241a33', 'center'));
      c.globalAlpha = 1;
    }
    for (let i = Game.toasts.length - 1; i >= 0; i--) {
      const t = Game.toasts[i]; t.t -= dt;
      if (t.t <= 0) { Game.toasts.splice(i, 1); continue; }
      if (i > 0) continue;
      c.font = 'bold 8px monospace';
      const w = c.measureText(t.text).width + 12;
      c.globalAlpha = Math.min(1, t.t * 2);
      const ty = (typeof SideScroll !== 'undefined' && Game.state === 'side' && SideScroll.active && SideScroll.active.boss) ? VH - 52 : VH - 26;
      c.fillStyle = '#241a33'; c.fillRect(VW / 2 - w / 2, ty, w, 14);
      drawText(c, t.text, VW / 2, ty + 3, 8, '#f8e858', '#241a33', 'center');
      c.globalAlpha = 1;
    }
  },
  drawDialog(c) {
    const d = Game.dialog; if (!d) return;
    const H = 100, Y = VH - H - 4;
    c.fillStyle = 'rgba(24,16,32,.95)'; c.fillRect(6, Y, VW - 12, H);
    c.strokeStyle = '#f8d048'; c.lineWidth = 2; c.strokeRect(7, Y + 1, VW - 14, H - 2); c.lineWidth = 1;
    let txx = 16;
    if (d.who) {
      // portrait: photo for noah/sahor, pixel zoom for others
      c.fillStyle = '#181020'; c.fillRect(14, Y + 8, 64, 64);
      const photo = d.who === 'noah' ? Sprites.portraitImgs.noahFace : d.who === 'sahor' ? Sprites.portraitImgs.sahorFace : null;
      const face = Sprites.faceImgs && Sprites.faceImgs[d.who];
      const bigArt = (d.who === 'supreme_trader' && Sprites.scenes) ? (Sprites.scenes.traderface || Sprites.scenes.trader) : (d.who === 'lady' && Sprites.scenes && Sprites.scenes.lady) ? Sprites.scenes.lady : null;
      // RAMSI (aka Mimi) fills the box from his REAL sprite art, zoomed toward the head
      const ramFace = d.who === 'ramsisuper' ? (Sprites.props && (Sprites.props.sramsi1 || Sprites.props.sramsi2))
        : d.who === 'ramsi' ? Sprites.ramsi : null;
      if (ramFace && ramFace.width) {
        const lw = sprW(ramFace), lh = sprH(ramFace), sc = 64 / Math.min(lw, lh) * 0.95;    // cover-fit: zoom IN
        c.save(); c.beginPath(); c.rect(14, Y + 8, 64, 64); c.clip();
        c.imageSmoothingEnabled = false;
        c.translate(14 + 32, Y + 8 + 4); c.scale(sc, sc);
        dspr(c, ramFace, -lw / 2, 0);                                                        // head anchored near the top
        c.restore();
      }
      else if (bigArt) { try { const s = Math.min(64 / bigArt.width, 64 / bigArt.height); c.drawImage(bigArt, 14 + (64 - bigArt.width * s) / 2, Y + 8 + (64 - bigArt.height * s) / 2, bigArt.width * s, bigArt.height * s); } catch (e) {} }
      else if (photo) { try { c.drawImage(photo, 14, Y + 8, 64, 64); } catch (e) {} }
      else if (face && face.complete !== false) {
        // FF-Tactics style face, aspect-fit 45x64 inside the 64 box
        c.fillStyle = '#4a3c58'; c.fillRect(14, Y + 8, 64, 64);
        try { c.drawImage(face, 14 + 9, Y + 8, 46, 64); } catch (e) { if (Sprites.pixPortraits[d.who]) c.drawImage(Sprites.pixPortraits[d.who], 14, Y + 8); }
      }
      else if (Sprites.pixPortraits[d.who] || (d.who === 'lady' && Sprites.pixPortraits.spirit)) c.drawImage(Sprites.pixPortraits[d.who] || Sprites.pixPortraits.spirit, 14, Y + 8);
      c.strokeStyle = '#fff'; c.strokeRect(13.5, Y + 7.5, 65, 65);
      c.strokeStyle = '#f8d048'; c.strokeRect(11.5, Y + 5.5, 69, 69);
      txx = 88;
    }
    drawText(c, d.name, txx, Y + 8, 12, '#f8d048');
    c.font = 'bold 12px monospace';
    const lines = wrapText(c, d.lines[0], VW - txx - 22);
    lines.slice(0, 4).forEach((l, i) => drawText(c, l, txx, Y + 24 + i * 16, 12, '#fff'));
    drawText(c, d.lines.length > 1 ? 'SPACE / click >' : 'SPACE / click: done', VW - 130, Y + H - 13, 8, '#9adcf8');
  },
  // ---------- mouse: clickable regions recorded during draw ----------
  hot: [],
  hit(x, y) {
    for (let i = this.hot.length - 1; i >= 0; i--) {
      const r = this.hot[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) { r.fn(); return true; }
    }
    return false;
  },
  handleClick(x, y) {
    if (Game.state === 'cutscene') { if (Game.advanceCutscene) Game.advanceCutscene(); return; }
    if (Game.state === 'dialog') { if (Game.advanceDialog) Game.advanceDialog(); return; }
    const st = Game.state;
    // side-panel tool icons: clickable whenever the panel is shown
    if (x >= VW) { for (const r of (this.panelHot || [])) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) { if (r.owned) { Player.tool = r.tool; Audio2.jingle('step'); } return; } }
    if (st === 'menu') {
      if (this.hit(x, y)) return;                       // hit an item / close button
      const r = this.menuRect, f = this.faceRect;
      const inMenu = r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      const inFace = f && x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h;
      if (!inMenu && !inFace) { Game.menu = null; Game.state = 'play'; Audio2.jingle('step'); }   // click outside closes it
      return;
    }
    if (st === 'worldmap' || st === 'world3map' || st === 'title') { this.hit(x, y); return; }
    // advance/confirm screens: a click is just a confirm tap
    if (st === 'dialog' || st === 'itemget' || st === 'intro' || st === 'credits' || st === 'cutscene') PRESS_QUEUE.push(' ');
  },
  // ---------- YOUR PACK (I) — capture log / gear & tools / baits & materials ----------
  // Arrow keys (or the on-screen arrows) flip pages; ESC/I closes. GEAR lives here now
  // instead of on the always-on panel, so the HUD quest box gets the space.
  PACK_PAGES: ['CAPTURE LOG', 'GEAR & TOOLS', 'BAITS & MATERIALS'],
  drawPack(c, m) {
    const F = Game.flags, page = m.page = ((m.page || 0) + 3) % 3;
    const W = 336, X0 = (VW - W) / 2;
    const logSp = Object.keys(Game.log).filter(s => Game.log[s] > 0);
    const logRows = Math.max(1, Math.ceil(logSp.length / 4));
    const H = page === 0 ? Math.min(VH - 8, Math.max(130, 38 + logRows * 26 + 20)) : page === 1 ? 200 : 172;
    const Y0 = (VH - H) / 2;
    this.menuRect = { x: X0, y: Y0, w: W, h: H }; this.faceRect = null;
    c.fillStyle = 'rgba(24,16,32,.96)'; c.fillRect(X0, Y0, W, H);
    c.strokeStyle = '#f8d048'; c.lineWidth = 2; c.strokeRect(X0 + 1, Y0 + 1, W - 2, H - 2); c.lineWidth = 1;
    drawText(c, 'YOUR PACK', X0 + 10, Y0 + 8, 9, '#f8d048');
    drawText(c, this.PACK_PAGES[page], X0 + 10, Y0 + 22, 8, '#9adcf8');
    // pager chips (clickable)
    drawText(c, '◄', X0 + W - 80, Y0 + 8, 10, '#9adcf8');
    drawText(c, (page + 1) + '/3', X0 + W - 60, Y0 + 8, 9, '#fff');
    drawText(c, '►', X0 + W - 32, Y0 + 8, 10, '#9adcf8');
    this.hot.push({ x: X0 + W - 88, y: Y0 + 2, w: 26, h: 20, fn: () => { m.page = (m.page + 2) % 3; } });
    this.hot.push({ x: X0 + W - 40, y: Y0 + 2, w: 26, h: 20, fn: () => { m.page = (m.page + 1) % 3; } });
    const bodyY = Y0 + 38;
    if (page === 0) {
      if (!logSp.length) drawText(c, 'No friends caught yet!', X0 + 12, bodyY, 9, '#fff');
      logSp.forEach((s, i) => {
        const lx = X0 + 14 + (i % 4) * 78, ly = bodyY + ((i / 4) | 0) * 26;
        const spr = Sprites.creatures[s].right[0];
        dspr(c, spr, lx, ly);
        drawText(c, 'x' + Game.log[s], lx + 18, ly + 2, 9, '#fff');
        drawText(c, CREATURES[s].name, lx, ly + 14, 6, '#9adcf8');
      });
    } else if (page === 1) {
      const gear = [
        ['sandal', 'SPRING SANDALS', F.sandals, 'X: jump gaps and little ledges'],
        ['glove',  'CLIMB GLOVES',   F.gloves,  'grip steep cliffs and icy rims'],
        ['bracer', 'POWER BRACERS',  F.bracers, 'SPACE: grab, push + pull blocks'],
        ['suit',   'DIVE SUIT',      F.suit,    'swim underwater (U: suit up)'],
        ['wing',   'ANGEL WINGS',    F.wings,   'X in the air: flap, hold to glide'],
      ];
      gear.forEach(([k, name, owned, what], i) => {
        const gy = bodyY + i * 22;
        c.globalAlpha = owned ? 1 : 0.25;
        if (Sprites.gear[k]) { c.save(); c.translate(X0 + 14, gy); c.scale(1.7, 1.7); dspr(c, Sprites.gear[k], 0, 0); c.restore(); }
        c.globalAlpha = 1;
        drawText(c, name, X0 + 44, gy, 8, owned ? '#f8e858' : '#554a6a');
        drawText(c, owned ? what : 'not found yet...', X0 + 44, gy + 10, 7, owned ? '#9adcf8' : '#554a6a');
      });
      const ty = bodyY + 5 * 22 + 2;
      drawText(c, 'TOOLS (keys 1-5)', X0 + 12, ty, 7, '#a89cc0');
      [['mitts', true], ['net', F.net], ['harpoon', F.harpoon], ['cage', F.cage], ['bone', F.bone]].forEach(([t, owned], i) => {
        c.globalAlpha = owned ? 1 : 0.25;
        c.save(); c.translate(X0 + 12 + i * 30, ty + 10); c.scale(1.6, 1.6); dspr(c, Sprites.tools[t], 0, 0); c.restore();
        c.globalAlpha = 1;
      });
    } else {
      drawText(c, 'BAITS (tool 4 sets a cage)', X0 + 12, bodyY, 7, '#a89cc0');
      const baits = [['clover', 'clover'], ['tincan', 'tincan'], ['fishsnack', 'fishsnack'], ['cookie', 'cookie'], ['berry', 'berry'], ['hay', 'hay']];
      baits.forEach(([b, icon], i) => {
        const bx = X0 + 12 + i * 46;
        if (!Sprites.items[icon] || F.baits[b] === undefined) return;
        dspr(c, Sprites.items[icon], bx, bodyY + 12);
        drawText(c, 'x' + F.baits[b], bx + 10, bodyY + 11, 8, F.baits[b] ? '#fff' : '#554a6a');
      });
      const my = bodyY + 34;
      drawText(c, 'MATERIALS (craft decor at COMBI\'s)', X0 + 12, my, 7, '#a89cc0');
      const order = ['pearl', 'tire', 'spring', 'seedbag', 'marble', 'bucket', 'skyfeather', 'goldnugget', 'crystalshard', 'voidgem'].filter(k => ((F.mats && F.mats[k]) || 0) > 0);
      if (!order.length) drawText(c, 'none yet — search the whole world!', X0 + 12, my + 12, 7, '#554a6a');
      order.forEach((mk, i) => {
        const bx = X0 + 12 + (i % 7) * 44, by = my + 12 + ((i / 7) | 0) * 16;
        if (!Sprites.items[mk]) return;
        dspr(c, Sprites.items[mk], bx, by);
        drawText(c, 'x' + F.mats[mk], bx + 10, by - 1, 8, '#fff');
      });
      const wy = my + 12 + (order.length > 7 ? 32 : 16) + 6;
      drawText(c, 'WALLET', X0 + 12, wy, 7, '#a89cc0');
      dspr(c, Sprites.items.coin, X0 + 12, wy + 11); drawText(c, '' + F.coins, X0 + 24, wy + 10, 9, '#f8e858');
      dspr(c, Sprites.items.gem, X0 + 66, wy + 12); drawText(c, '' + F.gems, X0 + 78, wy + 10, 9, '#9adcf8');
      dspr(c, Sprites.items.key, X0 + 120, wy + 11); drawText(c, '' + F.keys, X0 + 132, wy + 10, 9, '#f8d048');
      drawText(c, 'HP:' + F.heartpieces + '/4', X0 + 168, wy + 10, 8, '#f898c8');
      drawText(c, 'heart pieces', X0 + 214, wy + 10, 7, '#a89cc0');
    }
    this.hot.push({ x: X0 + W - 96, y: Y0 + H - 16, w: 92, h: 14, fn: () => { Game.menu = null; Game.state = 'play'; } });
    drawText(c, '◄►: flip page   ESC/I: close', X0 + 10, Y0 + H - 12, 7, '#a89cc0');
  },
  drawMenu(c) {
    const m = Game.menu; if (!m) return;
    this.hot = [];
    if (m.type === 'album' && Game.drawAlbum) { Game.drawAlbum(c, m, this); return; }
    if (m.type === 'log') { this.drawPack(c, m); return; }   // YOUR PACK (I): log/gear/baits pages
    const W = 300, X0 = (VW - W) / 2;
    let title = m.type === 'shop' ? "MARKO'S STALL  (gems: " + Game.flags.gems + ')'
      : m.type === 'trade' ? ({ tess: 'TRAPPER TESS', sal: 'SALTY SAL', gruul: 'GRUUL', cora: 'CLIFFSIDE CORA' })[m.who] + "'S TRADES  (coins: " + Game.flags.coins + ' gems: ' + Game.flags.gems + ')'
      : m.type === 'bait' ? 'PICK A BAIT (SPACE sets the cage)'
      : m.type === 'combine' ? 'THE COMBINER — friends JOIN & TRANSFORM!  (nobody is lost)'
      : m.type === 'decor' ? 'PEN DECOR CATALOG  (coins: ' + Game.flags.coins + ')'
      : 'CAPTURE LOG — your living herd (trade these!)';
    const items = m.items || [];
    const H = 44 + Math.max(1, items.length) * 16 + 10 + (m.type === 'combine' ? 14 : 0);
    const Y0 = (VH - H) / 2;
    this.menuRect = { x: X0, y: Y0, w: W, h: H }; this.faceRect = null;
    c.fillStyle = 'rgba(24,16,32,.96)'; c.fillRect(X0, Y0, W, H);
    c.strokeStyle = '#f8d048'; c.lineWidth = 2; c.strokeRect(X0 + 1, Y0 + 1, W - 2, H - 2); c.lineWidth = 1;
    drawText(c, title, X0 + 10, Y0 + 8, 9, '#f8d048');
    if ((m.type === 'shop' || m.type === 'trade' || m.type === 'combine' || m.type === 'decor') && Sprites.npcs[m.who]) {
      const spr = Sprites.npcs[m.who], fw = 64, fh = 84, fx = X0 - fw - 6, fy = Y0;
      this.faceRect = { x: fx, y: fy, w: fw, h: fh };
      c.fillStyle = 'rgba(24,16,32,.96)'; c.fillRect(fx, fy, fw, fh);
      c.strokeStyle = '#f8d048'; c.lineWidth = 2; c.strokeRect(fx + 1, fy + 1, fw - 2, fh - 2); c.lineWidth = 1;
      const sc = Math.min((fw - 16) / sprW(spr), (fh - 28) / sprH(spr));
      c.save(); c.translate(fx + fw / 2, fy + 8); c.scale(sc, sc); c.imageSmoothingEnabled = false;
      dspr(c, spr, -sprW(spr) / 2, 0); c.restore();
      const nm = ({ marko: 'MARKO', tess: 'TRAPPER TESS', sal: 'SALTY SAL', gruul: 'GRUUL', cora: 'CLIFFSIDE CORA', combi: 'COMBI' })[m.who] || (m.who || '').toUpperCase();
      drawText(c, nm, fx + fw / 2, fy + fh - 12, 7, '#9adcf8', '#241a33', 'center');
    }
    items.forEach((it, i) => {
      const iy = Y0 + 24 + i * 16;
      this.hot.push({ x: X0 + 6, y: iy - 2, w: W - 12, h: 15, fn: () => { Game.menu.sel = i; Game.menuConfirm(); } });
      if (i === m.sel) { c.fillStyle = '#4878e8'; c.fillRect(X0 + 6, iy - 2, W - 12, 15); }
      const label = it.label + (it.price !== undefined ? '  - ' + it.price + ' gems' : '');
      drawText(c, (it.special ? '* ' : '') + label, X0 + 12, iy, 8, it.special ? '#f8e858' : '#fff');
      if (it.have !== undefined && it.sp) drawText(c, 'have ' + it.have, X0 + W - 56, iy, 7, it.have >= it.n ? '#58c452' : '#e84a4a');
      if (i === m.sel && it.desc) {
        if (m.type === 'combine') {
          c.font = 'bold 7px monospace';
          wrapText(c, it.desc, W - 24).slice(0, 2).forEach((l, li) => drawText(c, l, X0 + 12, Y0 + H - 26 + li * 10, 7, '#9adcf8'));
        } else drawText(c, it.desc, X0 + 12, Y0 + H - 14, 7, '#9adcf8');
      }
    });
    drawText(c, 'SPACE/Z: choose  ESC: close', X0 + 10, Y0 + H - (m.type === 'combine' ? 38 : 24), 7, '#a89cc0');
  },
  // ---------- ITEM GET! celebration overlay ----------
  drawItemGet(c, dt) {
    const d = Game.itemGetData; if (!d) return;
    d.t += dt;
    const t = d.t;
    c.fillStyle = 'rgba(16,8,28,.78)'; c.fillRect(0, 0, VW, VH);
    const cx = VW / 2, cy = VH / 2 - 14;
    // radiant beams
    c.save(); c.translate(cx, cy); c.rotate(t * 0.6);
    for (let i = 0; i < 10; i++) {
      c.rotate(Math.PI / 5);
      const grd = c.createLinearGradient(0, 0, 92, 0);
      grd.addColorStop(0, 'rgba(248,216,72,.5)'); grd.addColorStop(1, 'rgba(248,216,72,0)');
      c.fillStyle = grd;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(92, -11); c.lineTo(92, 11); c.fill();
    }
    c.restore();
    // sparkle ring
    for (let i = 0; i < 14; i++) {
      const a = t * 2 + i * Math.PI * 2 / 14, r = 52 + Math.sin(t * 5 + i) * 5;
      c.fillStyle = i % 2 ? '#fff' : '#f8e858';
      c.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.66, 2, 2);
    }
    // the item, zoomed BIG with a pop-in bounce
    const icon = Game.itemIcon(d.iconKey);
    if (icon) {
      const pop = Math.min(1, t * 2.6);
      const s = (5 + Math.sin(Math.min(Math.PI, t * 7)) * 1.6) * pop + Math.sin(t * 2.2) * 0.25;
      c.save(); c.translate(cx, cy + Math.sin(t * 2.2) * 3);
      c.imageSmoothingEnabled = false;
      c.scale(s, s);
      dspr(c, icon, -sprW(icon) / 2, -sprH(icon) / 2);
      c.restore();
    }
    drawText(c, 'ITEM GET!', cx, 26, 13, '#f8e858', '#241a33', 'center');
    drawText(c, d.title, cx, cy + 56, 14, '#fff', '#241a33', 'center');
    c.font = 'bold 8px monospace';
    wrapText(c, d.sub || '', VW - 120).slice(0, 2).forEach((l, i) =>
      drawText(c, l, cx, cy + 76 + i * 11, 8, '#9adcf8', '#241a33', 'center'));
    if (t > 0.7 && ((t * 2 | 0) % 2 === 0)) drawText(c, '- SPACE -', cx, VH - 22, 9, '#fff', '#241a33', 'center');
  },
  drawIntro(c, t) {
    c.save();
    c.beginPath(); c.rect(0, 0, VW, VH); c.clip();
    c.imageSmoothingEnabled = false;
    if (t < 11) {
      // --- SCENE 1: the meadow. Noah & Ramsi cuddle... until SAHOR strikes ---
      const g = c.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#8ed4f4'); g.addColorStop(0.55, '#bfe8f8'); g.addColorStop(0.56, '#55b24a'); g.addColorStop(1, '#3f9434');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(60, 44, 18, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,.85)';
      for (const [cx2, cy2, r] of [[150, 40, 14], [180, 46, 10], [350, 60, 16], [378, 66, 11]]) { c.beginPath(); c.arc(cx2 + Math.sin(t * 0.3) * 6, cy2, r, 0, 7); c.fill(); }
      const gy = VH * 0.56;
      for (let i = 0; i < 16; i++) { const fx = (hash2(i, 5) * VW) | 0, fy = gy + 14 + ((hash2(i, 9) * (VH - gy - 26)) | 0); c.fillStyle = ['#fff', '#f898c8', '#f8e858'][i % 3]; c.fillRect(fx, fy, 2, 2); }
      const nx = VW / 2 - 56, ny = gy - 18;
      c.save(); c.translate(nx, ny); c.scale(3, 3); dspr(c, Sprites.noah.down[0], 0, 0); c.restore();
      // Ramsi snuggles by Noah — until the YOINK
      let rx = nx + 70, ry = ny + 44;
      let sx2 = VW + 60, sy2 = 40;
      const sahorIn = t > 4.6;
      if (sahorIn) {
        const p = clamp((t - 4.6) / 2.0, 0, 1);
        sx2 = lerp(VW + 60, rx + 6, p); sy2 = lerp(36, ry - 30, p) + Math.sin(t * 6) * 2;
        if (t > 7.4) {
          const q = clamp((t - 7.4) / 3.0, 0, 1), ee = q * q;
          sx2 = lerp(rx + 6, VW + 80, ee); sy2 = lerp(ry - 30, -56, ee);
          rx = sx2 - 4; ry = sy2 + 22;
        }
      }
      c.save(); c.translate(rx, ry); c.scale(2.2, 2.2); dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi) / 2); c.restore();
      if (sahorIn) { c.save(); c.translate(sx2, sy2); c.scale(2, 2); dspr(c, Sprites.sahor, -sprW(Sprites.sahor) / 2, -sprH(Sprites.sahor) / 2); c.restore(); }
      if (t < 7.4) {
        for (let i = 0; i < 3; i++) {
          const hp = (t * 0.6 + i * 0.33) % 1;
          c.save(); c.globalAlpha = 1 - hp; c.translate(nx + 44 + i * 18, ny + 12 - hp * 26); c.scale(1.6, 1.6); dspr(c, Sprites.items.heart, 0, 0); c.restore();
        }
      } else { drawText(c, '!', nx + 22, ny - 16, 16, '#f8e858', '#241a33'); }
      c.fillStyle = '#0c0814'; c.fillRect(0, 0, VW, 18); c.fillRect(0, VH - 20, VW, 20);
      const line = t < 4.6 ? 'Buff Noah and RAMSI the Pillow Pet. Best friends. Comfiest friends.'
        : t < 7.4 ? 'MIMI SAHOR: "Awww. How comfy. How SOFT. How... MINE!"'
        : 'SAHOR: "Hee hee hee! Catch us if you can, muscle-boy!"';
      drawText(c, line, VW / 2, VH - 14, 8, '#fff', '#241a33', 'center');
    } else {
      // --- SCENE 2: the world map. Sahor whisks Ramsi to the Rainbow Spire ---
      this.drawWorldMap(c);
      const a = WORLD_NODES[0], d2 = WORLD_NODES[3];
      const pts = catmullRom([[nodeX(a), nodeY(a)], [(nodeX(a) + nodeX(d2)) / 2 + 34, Math.min(nodeY(a), nodeY(d2)) - 26], [nodeX(d2), nodeY(d2)]], 16);
      const p = clamp((t - 11.4) / 8.0, 0, 1);
      const idx = Math.min(pts.length - 1, (p * pts.length) | 0);
      const mx = pts[idx][0], my = pts[idx][1];
      c.strokeStyle = 'rgba(248,232,88,.9)'; c.setLineDash([2, 3]);
      c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k <= idx; k++) c.lineTo(pts[k][0], pts[k][1]);
      c.stroke(); c.setLineDash([]);
      const bobf = Math.sin(t * 5) * 2;
      c.drawImage(Sprites.ramsi, mx - 7, my + 2 + bobf, 14, 10);
      c.drawImage(Sprites.sahor, mx - 8, my - 17 + bobf, 16, 19);
      c.fillStyle = '#0c0814'; c.fillRect(0, 0, VW, 18); c.fillRect(0, VH - 30, VW, 30);
      drawText(c, p < 1 ? 'Sahor whisks RAMSI across Mimi Island — to the RAINBOW SPIRE!'
        : 'Win back your best friend. Master EVERY power. GO!', VW / 2, VH - 14, 8, '#fff', '#241a33', 'center');
    }
    drawText(c, 'SPACE: skip', VW - 6, 6, 7, '#9a90b8', '#16101f', 'right');
    c.restore();
    c.fillStyle = '#16101f'; c.fillRect(VW, 0, PANEL_W, VH);
    drawText(c, 'THE TALE BEGINS...', VW + 12, 16, 9, '#f8d048');
  },
  drawWorldMap(c) {
    const bg = Sprites.worldMapBg;
    if (bg && bg.complete !== false && (bg.naturalWidth || bg.width)) {
      try { c.imageSmoothingEnabled = false; c.drawImage(bg, 0, 0, VW, VH); } catch (e) {}
      c.fillStyle = 'rgba(16,24,40,.12)'; c.fillRect(0, 0, VW, VH);   // settle labels
    } else {
      c.fillStyle = '#16304a'; c.fillRect(0, 0, VW, VH);
      for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(110,170,230,.18)'; c.fillRect((hash2(i, 3) * VW) | 0, (hash2(i, 9) * VH) | 0, 5, 1); }
      c.fillStyle = '#3f9c46';
      c.beginPath(); c.ellipse(VW / 2 - 10, VH / 2 + 4, 180, 96, -0.1, 0, 7); c.fill();
      c.fillStyle = '#58b449';
      c.beginPath(); c.ellipse(VW / 2 - 16, VH / 2, 168, 86, -0.1, 0, 7); c.fill();
      c.fillStyle = '#eef1f7'; c.beginPath(); c.ellipse(170, 80, 40, 22, 0, 0, 7); c.fill();
      c.fillStyle = '#ecd28d'; c.beginPath(); c.ellipse(330, 196, 56, 18, 0.2, 0, 7); c.fill();
      c.fillStyle = '#7a5ab8'; c.beginPath(); c.ellipse(364, 92, 44, 26, 0, 0, 7); c.fill();
      c.fillStyle = '#b06a3c'; c.beginPath(); c.ellipse(204, 64, 48, 24, 0, 0, 7); c.fill();
    }
    drawText(c, '~ MIMI ISLAND ~', VW / 2, 12, 12, '#fff', '#16304a', 'center');
    this.hot = [];
    // nodes
    const unlocked = WORLD_NODES.map(n => Game.flags.god || !n.req || Game.lookupFlag(n.req));
    WORLD_NODES.forEach((n, i) => {
      const open = unlocked[i];
      // path lines
      const nx = nodeX(n), ny = nodeY(n);
      this.hot.push({ x: nx - 12, y: ny - 12, w: 24, h: 24, fn: () => { Game.worldCursor = i; if (unlocked[i] && !Game.worldTravel) Game.startWorldTravel(i); } });
      // connectors: smooth curved trail through waypoints (or straight if none)
      if (i > 0) {
        const p = WORLD_NODES[i - 1];
        const wp = segPoints(i - 1, i);
        if (wp.length || !bg) {
          const curve = catmullRom([[nodeX(p), nodeY(p)], ...wp, [nx, ny]], 14);
          c.strokeStyle = open ? (bg ? 'rgba(248,232,88,.9)' : '#f8e858') : 'rgba(255,255,255,.28)';
          c.setLineDash([3, 3]); c.beginPath(); c.moveTo(curve[0][0], curve[0][1]);
          for (let k = 1; k < curve.length; k++) c.lineTo(curve[k][0], curve[k][1]);
          c.stroke(); c.setLineDash([]);
        }
      }
      // node ring (with a soft dark halo so it reads on busy art)
      c.fillStyle = 'rgba(20,12,30,.55)'; c.beginPath(); c.arc(nx, ny, 12, 0, 7); c.fill();
      c.fillStyle = '#241a33'; c.beginPath(); c.arc(nx, ny, 10, 0, 7); c.fill();
      c.fillStyle = open ? (i === Game.worldCursor ? '#f8d048' : '#e84a4a') : '#554a6a';
      c.beginPath(); c.arc(nx, ny, 7, 0, 7); c.fill();
      if (!open) drawText(c, '?', nx - 3, ny - 5, 9, '#fff', '#241a33');
      // label on a little plaque for legibility
      c.font = 'bold 8px monospace';
      const lw = c.measureText(n.label).width + 8;
      c.fillStyle = 'rgba(20,12,30,.6)'; c.fillRect(nx - lw / 2, ny + 11, lw, 11);
      drawText(c, n.label, nx, ny + 13, 8, open ? '#fff' : '#b0a0c8', '#241a33', 'center');
      if (i === Game.worldCursor) {
        c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(nx, ny, 12 + Math.sin(Game.time * 6) * 2, 0, 7); c.stroke(); c.lineWidth = 1;
      }
    });
    // NOAH on the map: standing at his current zone, or walking the trail
    const tv = Game.worldTravel;
    {
      const here = WORLD_NODES[Game.worldHere()];
      const nx = tv ? tv.x : nodeX(here), ny = tv ? tv.y : nodeY(here);
      const dir = tv ? tv.dir : 'down';
      const frame = tv ? ((tv.anim * 7 | 0) % 2) : 0;
      const spr = Sprites.noah[dir][frame];
      c.fillStyle = 'rgba(20,10,40,.4)';
      c.beginPath(); c.ellipse(nx, ny - 8, 6, 2.4, 0, 0, 7); c.fill();
      const bob = tv ? 0 : Math.sin(Game.time * 3) * 1;
      dspr(c, spr, Math.round(nx - 8), Math.round(ny - 28 + bob));
      if (tv) { // little dust trail
        if (((tv.anim * 6) | 0) % 2) { c.fillStyle = 'rgba(220,200,160,.6)'; c.fillRect(nx - 10 + Math.sin(tv.anim * 9) * 3, ny - 6, 2, 2); }
      }
    }
    const cur = WORLD_NODES[Game.worldCursor];
    const curOpen = unlocked[Game.worldCursor];
    if (tv) drawText(c, 'Noah hits the road...', VW / 2, VH - 24, 9, '#f8e858', '#16304a', 'center');
    else {
      drawText(c, curOpen ? 'SPACE: travel to ' + cur.label : 'Locked! ' + ({ coastPath: 'Pass the Gear Gauntlet in SE Vale!', crown: 'Find the Sunken Crown in the Deep Blue!', cerberus: 'Catch Cerberus in Hound\'s Keep!' })[cur.req],
        VW / 2, VH - 30, 9, curOpen ? '#f8e858' : '#f898c8', '#16304a', 'center');
      drawText(c, 'arrows: choose   ESC: back', VW / 2, VH - 16, 8, '#9adcf8', '#16304a', 'center');
    }
  },
  drawWorld3Map(c) {
    const bg3 = Sprites.scenes && Sprites.scenes.world3bg;
    const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#3a2c18'); g.addColorStop(1, '#221910'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    if (bg3) { const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = true; try { c.drawImage(bg3, 0, 0, VW, VH); } catch (e) {} c.imageSmoothingEnabled = sm; c.fillStyle = 'rgba(20,14,8,.10)'; c.fillRect(0, 0, VW, VH); }
    else {
      for (const gg of [[70, 66, 46, 1, 0.3], [414, 58, 38, -1, 0.4], [402, 214, 52, 1, 0.25], [58, 206, 34, -1, 0.5]]) {
        const gx = gg[0], gy = gg[1], R = gg[2], ang = Game.time * gg[4] * gg[3];
        c.save(); c.translate(gx, gy); c.rotate(ang); c.fillStyle = 'rgba(120,92,40,.5)';
        for (let k = 0; k < 12; k++) { c.save(); c.rotate(k * Math.PI / 6); c.fillRect(-3, -R - 5, 6, 7); c.restore(); }
        c.beginPath(); c.arc(0, 0, R, 0, 7); c.fill(); c.fillStyle = 'rgba(60,46,22,.6)'; c.beginPath(); c.arc(0, 0, R * 0.55, 0, 7); c.fill(); c.restore();
      }
      c.fillStyle = 'rgba(20,14,8,.35)'; c.fillRect(0, 0, VW, VH);
    }
    drawText(c, '~ WORLD 3: COGWERK ~', VW / 2, 12, 12, '#f8d048', '#241a10', 'center');
    this.hot = [];
    const ul = WORLD3_NODES.map(n => Game.flags.god || !n.req || Game.lookupFlag(n.req));
    // trails: the main chain plus side-spurs (matches Game.world3Go's walking routes)
    const byId3 = {}; WORLD3_NODES.forEach(n => { byId3[n.id] = n; });
    const chain3 = (typeof W3_CHAIN !== 'undefined') ? W3_CHAIN : ['cog1', 'cog2', 'cog3', 'cog4'];
    const paths3 = [];
    for (let i = 1; i < chain3.length; i++) paths3.push([byId3[chain3[i - 1]], byId3[chain3[i]]]);
    if (typeof W3_SPURS !== 'undefined') for (const sid in W3_SPURS) if (byId3[sid] && byId3[W3_SPURS[sid]]) paths3.push([byId3[W3_SPURS[sid]], byId3[sid]]);
    for (const [A3, B3] of paths3) {
      if (!A3 || !B3) continue;
      c.strokeStyle = '#7a4628'; c.lineWidth = 6; c.beginPath(); c.moveTo(A3.x, A3.y); c.lineTo(B3.x, B3.y); c.stroke();
      c.strokeStyle = '#a8623a'; c.lineWidth = 3; c.stroke(); c.lineWidth = 1;
    }
    WORLD3_NODES.forEach((n, i) => {
      const open = ul[i], cur = i === Game.world3Cursor;
      this.hot.push({ x: n.x - 14, y: n.y - 14, w: 28, h: 28, fn: () => { Game.world3Cursor = i; if (open) Game.world3Go(n); } });
      c.save(); c.translate(n.x, n.y);
      if (n.exit) { c.fillStyle = '#241a33'; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill(); c.fillStyle = open ? '#58c452' : '#554a6a'; c.beginPath(); c.arc(0, 0, 9, 0, 7); c.fill(); c.fillStyle = '#2c7a34'; c.fillRect(-6, -2, 12, 8); }
      else { const ang = Game.time * (i % 2 ? -1 : 1); c.save(); c.rotate(ang); c.fillStyle = '#241a33'; for (let k = 0; k < 10; k++) { c.save(); c.rotate(k * Math.PI / 5); c.fillRect(-3, -14, 6, 5); c.restore(); } c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill(); c.restore();
        c.fillStyle = open ? (cur ? '#f8d048' : '#caa044') : '#554a6a'; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.fillStyle = '#241a33'; c.beginPath(); c.arc(0, 0, 3, 0, 7); c.fill(); }
      c.restore();
      if (!open) drawText(c, '?', n.x - 3, n.y - 5, 9, '#fff', '#241a33');
      c.font = 'bold 8px monospace'; const lw = c.measureText(n.label).width + 8;
      c.fillStyle = 'rgba(20,12,8,.7)'; c.fillRect(n.x - lw / 2, n.y + 13, lw, 11);
      drawText(c, n.label, n.x, n.y + 15, 8, open ? '#fff' : '#b0a0c8', '#241a10', 'center');
      if (cur) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(n.x, n.y, 14 + Math.sin(Game.time * 6) * 2, 0, 7); c.stroke(); c.lineWidth = 1; }
    });
    // NOAH on the map: standing at his current stop, or WALKING the brass trail (with Ramsi tagging along)
    const tv3 = Game.world3Travel;
    const here = WORLD3_NODES[Game.world3Here()];
    const nx3 = tv3 ? tv3.x : here.x, ny3 = tv3 ? tv3.y : here.y;
    const dir3 = tv3 ? tv3.dir : 'down';
    const frame3 = tv3 ? ((tv3.anim * 7 | 0) % 2) : 0;
    const spr = (Sprites.noah[dir3] || Sprites.noah.down)[frame3];
    c.fillStyle = 'rgba(20,10,40,.4)'; c.beginPath(); c.ellipse(nx3, ny3 - 8, 6, 2.4, 0, 0, 7); c.fill();
    dspr(c, spr, Math.round(nx3 - 9), Math.round(ny3 - 30 + (tv3 ? 0 : Math.sin(Game.time * 3))));
    if (Sprites.ramsi) dspr(c, Sprites.ramsi, Math.round(nx3 + 3 - (tv3 && tv3.dir === 'left' ? 14 : 0)), Math.round(ny3 - 25 + (tv3 ? Math.sin(tv3.anim * 9) * 1.5 : 0)));
    if (tv3 && ((tv3.anim * 6) | 0) % 2) { c.fillStyle = 'rgba(220,200,160,.6)'; c.fillRect(nx3 - 10 + Math.sin(tv3.anim * 9) * 3, ny3 - 6, 2, 2); }
    const cn = WORLD3_NODES[Game.world3Cursor];
    drawText(c, ul[Game.world3Cursor] ? (cn.exit ? 'SPACE: leave to ' + cn.label : 'SPACE: enter ' + cn.label) : 'Locked — win the STAR-CELL in Cogwerk City first!', VW / 2, VH - 28, 9, ul[Game.world3Cursor] ? '#f8e858' : '#f898c8', '#241a10', 'center');
    drawText(c, 'arrows: choose   ESC: back', VW / 2, VH - 15, 8, '#9adcf8', '#241a10', 'center');
  },
  drawTitle(c) {
    this.hot = [];
    c.fillStyle = '#1a1426'; c.fillRect(0, 0, SW, SH);
    // key art right
    const art = Sprites.portraitImgs.titleArt;
    if (art) { try { c.drawImage(art, SW - 200, -10, 200, 300); } catch (e) {} }
    const grd = c.createLinearGradient(SW - 220, 0, SW - 120, 0);
    grd.addColorStop(0, '#1a1426'); grd.addColorStop(1, 'rgba(26,20,38,0)');
    c.fillStyle = grd; c.fillRect(SW - 220, 0, 100, SH);
    drawText(c, 'BUFF NOAH\'S', 30, 50, 30, '#f8d048');
    drawText(c, 'QUEST', 30, 84, 38, '#f8d048');
    drawText(c, 'the Mimis of Mimi Island', 32, 126, 11, '#9adcf8');
    drawText(c, 'VERSION 4 — Storybook Edition', 32, 144, 10, '#e84a4a');
    drawText(c, 'CHOOSE A SAVE SLOT', 30, 156, 10, '#fff');
    for (let n = 0; n < NUM_SLOTS; n++) {
      const sy = 172 + n * 17, sel = Game.titleSlot === n;
      if (sel) { c.fillStyle = '#3a56a8'; c.fillRect(28, sy - 3, 396, 17); c.strokeStyle = '#9adcf8'; c.lineWidth = 1; c.strokeRect(28, sy - 3, 396, 17); }
      const sum = Game.slotSummary ? Game.slotSummary(n) : null;
      drawText(c, 'SLOT ' + (n + 1), 34, sy, 9, sel ? '#fff' : '#c8bce0');
      drawText(c, sum ? (sum.name + '   \u2665' + Math.round(sum.hearts / 2) + '   ' + sum.caught + ' caught') : '\u2014 empty \u2014', 96, sy, 8, sum ? '#f8e858' : '#7a6a96');
      if (sum) drawText(c, '[X]', 402, sy, 7, '#e87a7a');
      this.hot.push({ x: 28, y: sy - 3, w: sum ? 368 : 396, h: 17, fn: () => { Game.titleSlot = n; Game.enterSlot('auto'); } });
      if (sum) this.hot.push({ x: 398, y: sy - 3, w: 26, h: 17, fn: () => { Game.titleSlot = n; Game.eraseSlot(n); } });
    }
    drawText(c, '\u2191\u2193 pick   ENTER / click  play   N new game   X erase', 30, 226, 8, '#a89cc0');
    // (the dev quick-start key hints are hidden; the G/T/U/C keys themselves still work)
    { const gp = Game.Gamepad, on = gp && gp.connected; drawText(c, (on ? '\u25B6 CONTROLLER READY' : 'USB controller? plug it in') + '  \u2014  K: button setup', 30, 262, 8, on ? '#8ef0c0' : '#f8b048'); }
    if (!ANY_KEY_PRESSED && Game.time > 4) drawText(c, 'No keys? Open this .html in Chrome/Edge directly.', 30, 250, 7, '#e84a4a');
    drawText(c, VERSION, 432, SH - 10, 7, '#7a6a96');
  },
  drawCredits(c, t) {
    c.fillStyle = '#1a1426'; c.fillRect(0, 0, SW, SH);
    const art = Sprites.portraitImgs.noahFull, sa = Sprites.portraitImgs.sahorBig;
    if (art) { try { c.drawImage(art, 40, 40, 150, 190); } catch (e) {} }
    if (sa) { try { c.drawImage(sa, SW - 200, 50, 150, 165); } catch (e) {} }
    drawText(c, 'THE END!', SW / 2, 30, 24, '#f8d048', '#1a1426', 'center');
    if (Sprites.ramsi) { c.save(); c.translate(SW / 2, 150); const s = 3 + Math.sin(t * 3) * 0.2; c.scale(s, s); dspr(c, Sprites.ramsi, -sprW(Sprites.ramsi) / 2, -sprH(Sprites.ramsi) / 2); c.restore(); drawText(c, 'RAMSI ... free at last!', SW / 2, 196, 9, '#9adcf8', '#1a1426', 'center'); }
    const lines = ['BUFF NOAH ... himself', 'MIMI SAHOR ... herself (best trickster)',
      'All the Mimis of Mimi Island ... friends forever',
      'Made with love for the Gryder family', '', 'Press any key for the title'];
    lines.forEach((l, i) => drawText(c, l, SW / 2, 80 + i * 16, 9, '#fff', '#1a1426', 'center'));
    for (let i = 0; i < 24; i++) {
      c.fillStyle = ['#e84a4a', '#f8d048', '#58c452', '#4878e8', '#f898c8'][i % 5];
      c.fillRect(((hash2(i, 5) * SW) + t * (20 + i)) % SW, (hash2(i, 11) * SH + t * 40 + i * 9) % SH, 3, 3);
    }
  },
};
