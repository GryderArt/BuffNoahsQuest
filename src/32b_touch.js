"use strict";
// ================= TOUCH CONTROLS — phones & tablets =================
// Auto-detects touch devices and switches the game to finger-friendly inputs
// (override with ?touch=1 / ?touch=0 in the URL):
//   * a semi-transparent 4-arrow D-PAD (lower left, DualSense-style rounded "pick"
//     keys) drives the arrow keys — 8-way: thumb between two arrows = a diagonal
//   * the QUEST box becomes big Z / X / C buttons + a SPACE BAR (11_ui calls
//     UI.drawTouchPad for that spot); the side-scroller + sky minigames have no
//     panel, so they get floating buttons bottom-right instead
//   * a "..." button (top right) opens a menu: PACK (I), OUTFIT (U), MAP (ESC),
//     QUEST (re-read the hint), MUSIC (P), FULLSCREEN (F)
//   * any other tap is a normal click — tool icons, title slots, world-map
//     nodes, pack page arrows and dialog-advance all already handle clicks
// Everything funnels through the SAME queues the keyboard uses (KEYS /
// PRESS_QUEUE / CLICK_QUEUE), so game logic needs zero changes.
(function () {
  // ---------- device detection: phone/tablet, not touch-screen laptops ----------
  function detectTouch() {
    if (IS_NODE) return false;
    const qs = String((G.location && G.location.search) || '');
    if (/[?&]touch=1/.test(qs)) return true;
    if (/[?&]touch=0/.test(qs)) return false;
    const nav = G.navigator || {};
    const mtp = nav.maxTouchPoints | 0;
    if (!(('ontouchstart' in G) || mtp > 0)) return false;         // no touch hardware at all
    const iPadOS = nav.platform === 'MacIntel' && mtp > 1;          // iPads masquerade as Macs
    const mobileUA = iPadOS || /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Silk|Kindle|Mobile|Tablet/i.test(nav.userAgent || '');
    const coarse = !!(G.matchMedia && G.matchMedia('(pointer: coarse)').matches);
    return mobileUA || coarse;      // fine-pointer (mouse-first) machines keep the keyboard UI
  }
  G.NQ_TOUCH = detectTouch();

  // ---------- geometry (virtual-screen coords) ----------
  const PAD = { x: 56, y: SH - 50, off: 19, w: 26, h: 24, grab: 50, dead: 9 };   // 4-arrow pad, lower left
  const MENU_BTN = { x: SW - 26, y: 4, w: 22, h: 17 };             // the "..." button, top right
  const DIRS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  const MOVE_STATES = ['play', 'side', 'ascent', 'aviary'];   // dialogs hide the stick (SPACE advances)
  const FLOAT_STATES = ['side', 'ascent', 'aviary'];               // states with no side panel
  const BTN_DEFS = [{ k: 'z', cap: 'TOOL' }, { k: 'x', cap: 'JUMP' }, { k: 'c', cap: 'RAMSI' }];

  const T = {                       // live touch state (exposed for the browser test harness)
    padId: null,                    // the touch currently steering the D-pad
    btns: [],                       // [{x,y,w,h,k}] on-screen buttons, rebuilt every frame
    btnTouch: {},                   // touch id -> key it is holding down
    menuOpen: false, menuRects: [],
  };
  G.NQ_TOUCH_STATE = T;

  // ---------- feed the exact same plumbing the keyboard uses ----------
  function setHeld(k, on) {
    if (on && !KEYS[k]) PRESS_QUEUE.push(k);
    KEYS[k] = !!on;
  }
  function pressKey(k) { PRESS_QUEUE.push(k); }

  const MENU_ITEMS = [
    { label: 'PACK', sub: 'I', go: () => pressKey('i') },
    { label: 'OUTFIT', sub: 'U', go: () => pressKey('u') },
    { label: 'MAP', sub: 'ESC', go: () => pressKey('Escape') },
    { label: 'QUEST', sub: '!', go: showQuest },
    { label: 'MUSIC', sub: 'P', go: () => pressKey('p') },
    { label: 'FULLSCREEN', sub: 'F', go: () => { if (G.NQ_toggleFullscreen) G.NQ_toggleFullscreen(); } },
  ];
  function showQuest() {   // the touch HUD trades the quest box for buttons — re-read it here
    try {
      if (Game.state === 'play' && !Game.dialog) {
        Game.dialog = { name: 'QUEST', who: 'noah', lines: [Game.questHint()] };
        Game.state = 'dialog';
      }
    } catch (e) {}
  }

  // ---------- the D-pad ----------
  function padActive() { return MOVE_STATES.includes(Game.state); }
  function padSet(px, py) {
    const dx = px - PAD.x, dy = py - PAD.y, len = Math.hypot(dx, dy);
    const S = 0.3827;                        // sin 22.5° — 8-way sectors, like a real D-pad
    const on = len > PAD.dead;               // the centre gap is neutral
    setHeld('ArrowLeft', on && dx / len < -S); setHeld('ArrowRight', on && dx / len > S);
    setHeld('ArrowUp', on && dy / len < -S); setHeld('ArrowDown', on && dy / len > S);
  }
  function padClear() {
    T.padId = null;
    for (const k of DIRS) setHeld(k, false);
  }

  // ---------- touch routing ----------
  function vpt(t) {
    const r = canvas.getBoundingClientRect();
    return { x: (t.clientX - r.left) * (r.width ? SW / r.width : 1), y: (t.clientY - r.top) * (r.height ? SH / r.height : 1) };
  }
  function inRect(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
  function touchDown(id, p) {
    if (T.menuOpen) {                                     // an open menu eats the tap
      for (const r of T.menuRects) if (inRect(p, r)) {
        T.menuOpen = false;
        try { Audio2.jingle('step'); r.go(); } catch (e) {}
        return;
      }
      T.menuOpen = false;
      if (inRect(p, MENU_BTN)) return;                    // tapping ... again just closes
    } else if (inRect(p, MENU_BTN)) {
      T.menuOpen = true;
      try { Audio2.jingle('step'); } catch (e) {}
      return;
    }
    for (const b of T.btns) if (inRect(p, b)) { T.btnTouch[id] = b.k; setHeld(b.k, true); return; }
    if (T.padId === null && padActive() && Math.hypot(p.x - PAD.x, p.y - PAD.y) <= PAD.grab) {
      T.padId = id; padSet(p.x, p.y); return;
    }
    CLICK_QUEUE.push({ x: p.x, y: p.y });                 // plain tap = a click
  }
  function touchMove(id, p) { if (id === T.padId) padSet(p.x, p.y); }
  function touchUp(id) {
    if (id === T.padId) { padClear(); return; }
    const k = T.btnTouch[id];
    if (k !== undefined) { setHeld(k, false); delete T.btnTouch[id]; }
  }
  function installTouch() {
    if (!canvas || !canvas.addEventListener) return;
    const opt = { passive: false };
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();                                  // no scroll/zoom/ghost-mouse
      try { if (typeof Audio2 !== 'undefined') Audio2.unlock(); } catch (err) {}
      for (const t of e.changedTouches) touchDown(t.identifier, vpt(t));
    }, opt);
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) touchMove(t.identifier, vpt(t));
    }, opt);
    const up = (e) => { e.preventDefault(); for (const t of e.changedTouches) touchUp(t.identifier); };
    canvas.addEventListener('touchend', up, opt);
    canvas.addEventListener('touchcancel', up, opt);
  }
  const _bootCanvas = bootCanvas;
  bootCanvas = function () { _bootCanvas(); if (G.NQ_TOUCH) installTouch(); };

  // ---------- the action pad in the HUD panel (called from 11_ui in the QUEST spot) ----------
  UI.drawTouchPad = function (c) {
    const x0 = VW + 8, w = PANEL_W - 16;                   // 160 wide
    const sy = SH - 32, zy = sy - 42;                      // SPACE bar + Z/X/C row, bottom-anchored
    BTN_DEFS.forEach((b, i) => {
      const bx = x0 + i * 55, r = { x: bx, y: zy, w: 50, h: 36, k: b.k };
      T.btns.push(r);
      drawTouchBtn(c, r, b.k.toUpperCase(), b.cap);
    });
    const sr = { x: x0, y: sy, w: w, h: 26, k: ' ' };
    T.btns.push(sr);
    drawTouchBtn(c, sr, 'SPACE', 'TALK / CHECK');
  };
  function drawTouchBtn(c, r, big, cap) {
    const on = !!KEYS[r.k];
    c.fillStyle = on ? '#4878e8' : '#181020'; c.fillRect(r.x, r.y, r.w, r.h);
    c.strokeStyle = on ? '#f8d048' : '#5a4a78'; c.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    const bs = r.h >= 30 ? 13 : 10;
    drawText(c, big, r.x + r.w / 2, r.y + (cap ? 5 : (r.h - bs) / 2), bs, '#fff', null, 'center');
    if (cap) drawText(c, cap, r.x + r.w / 2, r.y + r.h - 11, 6, on ? '#d8e8ff' : '#a89cc0', null, 'center');
  }

  // ---------- overlay: D-pad + "..." + menu + floating pad, drawn over everything ----------
  const _render = render;
  render = function (dtForUi) {
    if (G.NQ_TOUCH) {
      T.btns.length = 0;                                   // rebuilt by drawTouchPad / the float pad
      if (T.padId !== null && !padActive()) padClear();    // state changed mid-press
    }
    _render(dtForUi);
    if (G.NQ_TOUCH) { try { drawTouchOverlay(ctx); } catch (e) {} }
  };
  function drawTouchOverlay(c) {
    if (!c) return;
    c.save();
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    c.imageSmoothingEnabled = false;
    const st = Game.state;
    if (FLOAT_STATES.includes(st)) drawFloatPad(c);
    if (padActive()) drawPad(c);
    drawMenuBtn(c);
    if (T.menuOpen) drawMenu(c);
    if ((G.innerHeight || 0) > (G.innerWidth || 1) * 1.05) {   // portrait phone: nudge, don't block
      c.fillStyle = 'rgba(24,16,32,.85)'; c.fillRect(SW / 2 - 120, 26, 240, 16);
      drawText(c, 'TURN SIDEWAYS FOR A BIG SCREEN!', SW / 2, 30, 8, '#f8d048', null, 'center');
    }
    c.restore();
  }
  // four rounded "pick" keys (broad edge out, soft point toward the centre gap)
  const PETALS = [
    { k: 'ArrowUp', ox: 0, oy: -1, rot: 0 },
    { k: 'ArrowRight', ox: 1, oy: 0, rot: Math.PI / 2 },
    { k: 'ArrowDown', ox: 0, oy: 1, rot: Math.PI },
    { k: 'ArrowLeft', ox: -1, oy: 0, rot: -Math.PI / 2 },
  ];
  function pickPath(c, pts, rr) {                 // polygon with per-corner rounding
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[pts.length - 1], pts[0]);
    c.beginPath(); c.moveTo(m0[0], m0[1]);
    for (let i = 0; i < pts.length; i++) {
      const q = pts[i], m1 = mid(q, pts[(i + 1) % pts.length]);
      c.arcTo(q[0], q[1], m1[0], m1[1], rr[i]);
      c.lineTo(m1[0], m1[1]);
    }
    c.closePath();
  }
  function drawPad(c) {
    const w = PAD.w, h = PAD.h;
    for (const p of PETALS) {
      const on = !!KEYS[p.k];
      c.save();
      c.translate(PAD.x + p.ox * PAD.off, PAD.y + p.oy * PAD.off);
      c.rotate(p.rot);
      pickPath(c, [[-w / 2, -h / 2], [w / 2, -h / 2], [0, h / 2]], [6, 6, 7]);
      c.globalAlpha = on ? 0.75 : 0.30;
      c.fillStyle = on ? '#4878e8' : '#100c1e'; c.fill();
      c.globalAlpha = on ? 0.95 : 0.55;
      c.lineWidth = 2; c.strokeStyle = on ? '#f8d048' : '#ffffff'; c.stroke();
      c.lineWidth = 1;
      c.globalAlpha = on ? 0.95 : 0.70;           // arrow glyph, pointing outward
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(0, -7); c.lineTo(-4.5, -1); c.lineTo(4.5, -1); c.closePath(); c.fill();
      c.restore();
    }
    c.globalAlpha = 1;
  }
  function drawFloatPad(c) {                                // side-scroller/minigames: no panel
    c.save(); c.globalAlpha = 0.62;
    const x0 = SW - 140;
    BTN_DEFS.forEach((b, i) => {
      const r = { x: x0 + i * 44, y: SH - 66, w: 40, h: 30, k: b.k };
      T.btns.push(r);
      drawTouchBtn(c, r, b.k.toUpperCase(), null);
    });
    const sr = { x: x0, y: SH - 30, w: 128, h: 22, k: ' ' };
    T.btns.push(sr);
    drawTouchBtn(c, sr, 'SPACE', null);
    c.restore();
  }
  function drawMenuBtn(c) {
    c.globalAlpha = 0.85;
    c.fillStyle = '#241a33'; c.fillRect(MENU_BTN.x, MENU_BTN.y, MENU_BTN.w, MENU_BTN.h);
    c.strokeStyle = T.menuOpen ? '#f8d048' : '#a89cc0';
    c.strokeRect(MENU_BTN.x + 0.5, MENU_BTN.y + 0.5, MENU_BTN.w - 1, MENU_BTN.h - 1);
    c.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) c.fillRect(MENU_BTN.x + 4 + i * 6, MENU_BTN.y + 7, 3, 3);
    c.globalAlpha = 1;
  }
  function drawMenu(c) {
    T.menuRects = [];
    const w = 108, x = SW - w - 4, y0 = MENU_BTN.y + MENU_BTN.h + 3, ih = 18;
    c.globalAlpha = 0.96;
    c.fillStyle = '#241a33'; c.fillRect(x, y0, w, MENU_ITEMS.length * ih + 6);
    c.strokeStyle = '#f8d048'; c.strokeRect(x + 0.5, y0 + 0.5, w - 1, MENU_ITEMS.length * ih + 5);
    MENU_ITEMS.forEach((it, i) => {
      const iy = y0 + 5 + i * ih;
      T.menuRects.push({ x: x + 2, y: iy - 3, w: w - 4, h: ih, go: it.go });
      drawText(c, it.label, x + 8, iy, 8, '#fff');
      drawText(c, it.sub, x + w - 8, iy, 7, '#9adcf8', null, 'right');
      if (i) { c.strokeStyle = '#382850'; c.beginPath(); c.moveTo(x + 4, iy - 3.5); c.lineTo(x + w - 4, iy - 3.5); c.stroke(); }
    });
    c.globalAlpha = 1;
  }
})();
