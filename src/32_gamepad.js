"use strict";
// ===================== USB GAMEPAD (SNES controller) support =====================
// Polls the browser Gamepad API each frame and feeds the SAME KEYS[]/PRESS_QUEUE the
// keyboard uses, so the entire game plays on a USB SNES pad with zero other changes.
//   * D-PAD  = analog axes[0]/[1] (deadzoned) OR the dpad-buttons (12-15) — covers
//              every cheap USB clone, which report the pad one way or the other.
//   * FACE   = a saved, REMAPPABLE table (defaults to the SNES layout, standard indices).
//   * L / R  = swap the equipped tool (prev / next), as requested.
//   * SETUP  = a friendly press-to-bind screen (open with SELECT+START on the pad, or the
//              K key) that fixes any odd pad and saves the map to localStorage.
// Cheap USB SNES pads number their buttons inconsistently, so the defaults are a best
// guess; the setup screen makes it correct for whatever pad is plugged in.
(function () {
  if (typeof Game === 'undefined') return;

  // standard Gamepad-API face order:  0=B(bottom) 1=A(right) 2=X... wait: 2=left,3=top.
  // SNES faces sit  Y(left) X(top) B(bottom) A(right)  ->  B=0, A=1, Y=2, X=3.
  const DEFAULT_MAP = {
    0: 'z',        // B (bottom) -> CATCH / USE TOOL  (the main action)
    1: ' ',        // A (right)  -> TALK / OK / interact / confirm
    2: 'c',        // Y (left)   -> RAMSI power
    3: 'x',        // X (top)    -> JUMP / bounce
    4: 'q',        // L          -> swap tool LEFT  (previous)
    5: 'e',        // R          -> swap tool RIGHT (next)
    6: 'q', 7: 'e',// L2/R2 if present mirror the shoulders
    8: 'i',        // Select     -> BACKPACK / log
    9: 'Escape',   // Start      -> MAP / menu
    12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight',   // dpad-as-buttons
    'ax0-': 'ArrowLeft', 'ax0+': 'ArrowRight',   // OR a stick/axis d-pad (axis0 = L/R)
    'ax1-': 'ArrowUp',   'ax1+': 'ArrowDown',    //                       (axis1 = U/D)
  };
  // the SETUP screen walks these — the four D-PAD directions FIRST (each binds a button OR
  // an axis push, so it works whether the pad is digital or on a stick), then the buttons.
  const STEPS = [
    { key: 'ArrowUp',    label: 'MOVE UP',    hint: 'walk up',    try: 'push UP on the pad',   dir: true },
    { key: 'ArrowDown',  label: 'MOVE DOWN',  hint: 'walk down',  try: 'push DOWN on the pad', dir: true },
    { key: 'ArrowLeft',  label: 'MOVE LEFT',  hint: 'walk left',  try: 'push LEFT on the pad', dir: true },
    { key: 'ArrowRight', label: 'MOVE RIGHT', hint: 'walk right', try: 'push RIGHT on the pad',dir: true },
    { key: 'z',      label: 'CATCH / USE TOOL', hint: 'swing the net, grab, harpoon', try: 'try B' },
    { key: 'x',      label: 'JUMP',             hint: 'hop and bounce',                try: 'try X (top)' },
    { key: ' ',      label: 'TALK / OK',        hint: 'signs, chests, say YES',        try: 'try A' },
    { key: 'c',      label: 'RAMSI POWER',      hint: 'Glow, Shrink, Bounce...',       try: 'try Y (left)' },
    { key: 'q',      label: 'TOOL  ◀  LEFT',  hint: 'switch to the tool at left',  try: 'try L' },
    { key: 'e',      label: 'TOOL  ▶  RIGHT', hint: 'switch to the tool at right', try: 'try R' },
    { key: 'Escape', label: 'MAP / BACK',       hint: 'open the world map',            try: 'try START' },
    { key: 'i',      label: 'BACKPACK',         hint: 'your caught friends',           try: 'try SELECT' },
  ];

  const GP = Game.Gamepad = {
    connected: false, index: -1, id: '',
    map: Object.assign({}, DEFAULT_MAP),
    prev: {},          // last frame's active game-keys (edge detection)
    lastRaw: {},       // last frame's raw button-down states (setup binding edges)
    _combo: false,
    setup: null,
    DEADZONE: 0.5,
    STEPS,
    status() { return this.connected ? 'CONTROLLER READY' : 'no controller'; },
  };

  // --- persistence (its own key; never touches the save slots) ---
  const PAD_KEY = 'buffNoahQuest_pad';
  function padStore() { try { return (typeof storage === 'function' && storage()) || (typeof localStorage !== 'undefined' ? localStorage : null); } catch (e) { return null; } }
  function saveMap() { try { const s = padStore(); if (s) s.setItem(PAD_KEY, JSON.stringify(GP.map)); } catch (e) {} }
  function loadMap() { try { const s = padStore(); const r = s && s.getItem(PAD_KEY); if (r) GP.map = Object.assign({}, DEFAULT_MAP, JSON.parse(r)); } catch (e) {} }
  loadMap();
  GP.resetMap = function () { GP.map = Object.assign({}, DEFAULT_MAP); saveMap(); };

  function padList() { try { return (typeof navigator !== 'undefined' && navigator.getGamepads && navigator.getGamepads()) || []; } catch (e) { return []; } }
  function firstPad() { const l = padList(); for (const p of l) if (p && p.connected) return p; return null; }

  // raw button-down map {index:bool} + the raw axes array (interpreted through the map)
  function readRaw(p) {
    const raw = {};
    const btns = p.buttons || [];
    for (let i = 0; i < btns.length; i++) { const b = btns[i]; raw[i] = !!(b && (b.pressed || (typeof b === 'number' ? b : b.value) > 0.5)); }
    return { raw, axes: (p.axes || []) };
  }

  function releaseAll() {   // clear anything the pad was holding (avoids stuck movement on unplug)
    for (const k in GP.prev) { KEYS[k] = false; }
    GP.prev = {};
  }
  function onConnect(p) {
    GP.connected = true; GP.index = p.index; GP.id = (p.id || 'gamepad');
    if (typeof Game.toast === 'function') Game.toast('CONTROLLER CONNECTED! (SELECT+START = button setup)');
    try { if (typeof Audio2 !== 'undefined' && Audio2.unlock) Audio2.unlock(); } catch (e) {}
  }
  function onDisconnect() {
    GP.connected = false; releaseAll();
    if (typeof Game.toast === 'function') Game.toast('Controller unplugged.');
  }

  // ---- the per-frame poll (called at the top of updateGame; no-op without a pad) ----
  function pollGamepad() {
    const p = firstPad();
    if (p && !GP.connected) onConnect(p);
    else if (!p && GP.connected) onDisconnect();
    if (!p) return;
    const rr = readRaw(p), raw = rr.raw, axes = rr.axes;
    GP._raw = raw; GP._axes = axes;

    // OPEN SETUP gesture: SELECT+START held together (raw 8+9 — almost always those two,
    // whatever the face-button mapping is). Debounced so it fires once.
    if (raw[8] && raw[9]) {
      if (!GP._combo) { GP._combo = true; if (Game.state !== 'padsetup') { GP.openSetup(); return; } }
    } else GP._combo = false;

    if (Game.state === 'padsetup') { GP.pollSetup(raw, axes); return; }   // setup reads raw buttons + axes

    // build the set of active game-keys from buttons AND bound axes (d-pad on a stick)
    const active = {};
    for (const bi in raw) if (raw[bi] && GP.map[bi]) active[GP.map[bi]] = true;
    const dz = GP.DEADZONE;
    for (let i = 0; i < axes.length; i++) {
      if (axes[i] <= -dz) { const k = GP.map['ax' + i + '-']; if (k) active[k] = true; }
      else if (axes[i] >= dz) { const k = GP.map['ax' + i + '+']; if (k) active[k] = true; }
    }

    // rising edge -> a discrete press; level -> held; falling edge -> release
    for (const k in active) {
      if (!GP.prev[k]) { PRESS_QUEUE.push(k); ANY_KEY_PRESSED = true; }
      KEYS[k] = true;
    }
    for (const k in GP.prev) if (!active[k]) KEYS[k] = false;
    GP.prev = active;
  }
  Game.pollGamepad = pollGamepad;
  if (typeof window !== 'undefined') window.pollGamepad = pollGamepad;

  // ---- SETUP screen (press-to-bind, saves to localStorage) ----
  GP.openSetup = function () {
    this._returnState = (Game.state === 'padsetup') ? (this._returnState || 'title') : Game.state;
    this.setup = { i: 0, map: Object.assign({}, this.map), lastRaw: Object.assign({}, this._raw || {}), lastAxes: (this._axes || []).slice(), flash: 0, done: false };
    Game.state = 'padsetup';
    try { if (typeof Audio2 !== 'undefined') Audio2.jingle('talk'); } catch (e) {}
  };
  GP.finishSetup = function (commit) {
    if (commit && this.setup) { this.map = this.setup.map; saveMap(); if (typeof Game.toast === 'function') Game.toast('Buttons saved! Have fun, Noah!'); }
    this.setup = null; this.prev = {};
    Game.state = this._returnState || 'title';
  };
  // raw-button edge detection during setup -> bind to the current action
  GP.pollSetup = function (raw, axes) {
    const S = this.setup; if (!S) return;
    axes = axes || [];
    if (S.flash > 0) S.flash -= 1;
    // FINISHED: on the 'all set' screen a fresh button press just starts playing (never
    // indexes past the step list — that used to be a latent crash).
    if (S.done || S.i >= STEPS.length) {
      for (const bi in raw) if (raw[bi] && !S.lastRaw[bi]) { S.lastRaw = Object.assign({}, raw); this.finishSetup(true); return; }
      S.lastRaw = Object.assign({}, raw); S.lastAxes = axes.slice();
      return;
    }
    const step = STEPS[S.i];
    const bind = (token) => {
      const key = step.key;
      for (const k in S.map) if (S.map[k] === key) delete S.map[k];   // this action lets go of its old input(s)
      delete S.map[token];                                            // this input lets go of its old action
      S.map[token] = key;                                             // bind
      S.flash = 8; S.i++;
      try { if (typeof Audio2 !== 'undefined') Audio2.jingle('gem'); } catch (e) {}
      if (S.i >= STEPS.length) S.done = true;
    };
    // 1) a fresh BUTTON press binds the current action (any button — incl. dpad-buttons +
    //    SELECT/START; the open combo needs BOTH 8+9 at once, so singles never collide).
    let bound = false;
    for (const bi in raw) if (raw[bi] && !S.lastRaw[bi]) { bind(String(+bi)); bound = true; break; }
    // 2) on a DIRECTION step, a fresh AXIS push also binds (d-pad reported as a stick)
    if (!bound && step.dir) {
      const AX = 0.6, last = S.lastAxes || [];
      for (let i = 0; i < axes.length; i++) {
        const v = axes[i] || 0, lv = last[i] || 0;
        if (v <= -AX && lv > -AX) { bind('ax' + i + '-'); break; }
        if (v >= AX && lv < AX) { bind('ax' + i + '+'); break; }
      }
    }
    S.lastRaw = Object.assign({}, raw); S.lastAxes = axes.slice();
  };
  // keyboard controls on the setup screen (parent-friendly): Enter=skip, Esc=save&exit, R=reset
  GP.updateSetup = function (presses) {
    const S = this.setup; if (!S) { Game.state = this._returnState || 'title'; return; }
    for (const k of presses) {
      if (k === 'Escape') { this.finishSetup(true); return; }
      else if (k === 'Enter' || k === ' ' || k === 'z') { if (S.done) { this.finishSetup(true); return; } S.i = Math.min(STEPS.length, S.i + 1); if (S.i >= STEPS.length) S.done = true; }
      else if (k === 'r') { this.resetMap(); S.map = Object.assign({}, this.map); S.i = 0; S.done = false; }
    }
  };

  // a little SNES-pad glyph, with one face button lit
  function drawPad(c, x, y, s, litKey) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#3a3550'; c.strokeStyle = '#241a33'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-30, -8); c.quadraticCurveTo(-34, 8, -20, 9); c.lineTo(20, 9); c.quadraticCurveTo(34, 8, 30, -8); c.quadraticCurveTo(24, -12, 0, -12); c.quadraticCurveTo(-24, -12, -30, -8); c.closePath(); c.fill(); c.stroke();
    // d-pad (lit yellow while binding a MOVE direction)
    const dLit = (litKey === 'ArrowUp' || litKey === 'ArrowDown' || litKey === 'ArrowLeft' || litKey === 'ArrowRight');
    c.fillStyle = dLit ? '#f8e858' : '#241a33'; c.fillRect(-20, -4, 9, 3); c.fillRect(-16, -8, 3, 11);
    // face buttons (Y left, X top, B bottom, A right) — lit shows where the current action lives
    const faces = [['x', 0, -6], ['c', 6, 0], ['z', 12, 4], [' ', 18, 0]];   // top, left, bottom, right (approx)
    const pos = { x: [12, -4], c: [8, 2], z: [12, 6], ' ': [17, 2] };
    const bcol = (kk) => (kk === litKey ? '#f8e858' : '#c8506a');
    // draw 4 face dots in a diamond on the right
    const diamond = [['x', 15, -5], ['c', 10, 0], [' ', 20, 0], ['z', 15, 5]];
    for (const [kk, bx, by] of diamond) { c.fillStyle = bcol(kk); c.beginPath(); c.arc(bx, by, 2.4, 0, 7); c.fill(); }
    // shoulder nubs
    c.fillStyle = (litKey === 'q') ? '#f8e858' : '#8a94a8'; c.fillRect(-28, -12, 8, 2);
    c.fillStyle = (litKey === 'e') ? '#f8e858' : '#8a94a8'; c.fillRect(20, -12, 8, 2);
    c.restore();
  }

  GP.drawSetup = function (c) {
    const S = this.setup;
    c.fillStyle = '#14101f'; c.fillRect(0, 0, SW, SH);
    drawText(c, 'CONTROLLER SETUP', SW / 2, 14, 16, '#f8d048', '#241a33', 'center');
    if (!this.connected) {
      drawText(c, 'Plug in your controller...', SW / 2, SH / 2 - 8, 11, '#e84a4a', '#241a33', 'center');
      drawText(c, 'ESC: back', SW / 2, SH - 16, 9, '#9adcf8', '#241a33', 'center');
      return;
    }
    if (!S || S.done) {
      drawPad(c, SW / 2, 84, 2.2, null);
      drawText(c, 'ALL SET!', SW / 2, 120, 18, '#8ef0c0', '#241a33', 'center');
      drawText(c, 'D-pad moves. L / R swap tools.', SW / 2, 150, 10, '#fff', '#241a33', 'center');
      drawText(c, 'Press  A / B  or ENTER to play!', SW / 2, 170, 11, '#f8e858', '#241a33', 'center');
      drawText(c, 'SELECT+START anytime to set up again', SW / 2, SH - 16, 8, '#a89cc0', '#241a33', 'center');
      return;
    }
    const step = STEPS[S.i];
    drawPad(c, SW / 2, 70, 2.2, step.key);
    drawText(c, step.dir ? 'PUSH THE D-PAD DIRECTION FOR:' : 'PRESS THE BUTTON YOU WANT FOR:', SW / 2, 110, 10, '#9adcf8', '#241a33', 'center');
    const lit = S.flash > 0;
    drawText(c, step.label, SW / 2, 128, 18, lit ? '#8ef0c0' : '#f8d048', '#241a33', 'center');
    drawText(c, step.hint, SW / 2, 154, 10, '#fff', '#241a33', 'center');
    drawText(c, '(' + step.try + ')', SW / 2, 170, 9, '#f8b048', '#241a33', 'center');
    // progress pips
    const n = STEPS.length, pw = 12, tot = n * pw, x0 = SW / 2 - tot / 2;
    for (let i = 0; i < n; i++) { c.fillStyle = i < S.i ? '#8ef0c0' : (i === S.i ? '#f8e858' : '#54485e'); c.fillRect(x0 + i * pw, 188, 8, 6); }
    drawText(c, (S.i + 1) + ' / ' + n, SW / 2, 200, 8, '#a89cc0', '#241a33', 'center');
    // live: which raw buttons are pressed right now (shows the pad is heard)
    const raw = this._raw || {}, axs = this._axes || []; let downs = [];
    for (const bi in raw) if (raw[bi]) downs.push('B' + bi);
    for (let i = 0; i < axs.length; i++) { if (axs[i] <= -0.5) downs.push('ax' + i + '\u2190'); else if (axs[i] >= 0.5) downs.push('ax' + i + '\u2192'); }
    drawText(c, downs.length ? (downs.join(' ') + ' down') : 'waiting for a press...', SW / 2, 218, 8, downs.length ? '#8ef0c0' : '#7a6a96', '#241a33', 'center');
    drawText(c, 'ENTER: skip (keep default)    R: start over    ESC: save & play', SW / 2, SH - 14, 8, '#9adcf8', '#241a33', 'center');
  };
})();
