"use strict";
// ================= BUFF NOAH'S QUEST v4 — boot & constants =================
const VERSION = "__BUILD_STAMP__";
const TILE = 16;            // world tile size (virtual px)
const EOFF = 14;            // vertical lift per elevation level (BIG, readable height)
const VIEW_TW = 30, VIEW_TH = 17;      // game viewport in tiles
const VW = VIEW_TW * TILE, VH = VIEW_TH * TILE;   // 480 x 272
const PANEL_W = 176;
const SW = VW + PANEL_W, SH = VH;      // virtual screen 656 x 272
// in-world render scale for animals (creatures + road enemies) and chests — visual only
const ANIMAL_DRAW_SCALE = 1.5, CHEST_DRAW_SCALE = 1.5;
const WASTES_ALIEN_QUOTA = 4;   // catch this many aliens to power the Wastes warp pads

// Environment detection: browser vs node test harness
const IS_NODE = (typeof window === 'undefined');
const G = IS_NODE ? global : window;   // global object
if (IS_NODE && typeof G.document === 'undefined') {
  // harness must define document/canvas before requiring game.js
  throw new Error('test harness must install DOM stubs first');
}

let canvas, ctx, SCALE = 2;
function bootCanvas() {
  canvas = document.getElementById('game');
  function fit() {
    const dpr = (G.devicePixelRatio || 1);
    const availW = (G.innerWidth || SW * 2), availH = (G.innerHeight || SH * 2);
    const s = Math.min(availW * dpr / SW, availH * dpr / SH);
    const fs = !!(typeof document !== 'undefined' && document.fullscreenElement);
    // windowed: crisp integer pixels; FULLSCREEN or TOUCH devices: exact fit — fill
    // every inch the aspect allows (the renderer scales by transform, fractions are
    // fine, and a phone at integer scale would waste half its tiny screen)
    SCALE = (fs || G.NQ_TOUCH) ? Math.max(1, s) : Math.max(1, Math.floor(s));
    canvas.width = Math.round(SW * SCALE); canvas.height = Math.round(SH * SCALE);
    canvas.style.width = (canvas.width / dpr) + 'px';
    canvas.style.height = (canvas.height / dpr) + 'px';
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  }
  fit();
  if (G.addEventListener) G.addEventListener('resize', fit);
  if (document.addEventListener) document.addEventListener('fullscreenchange', fit);
  G.NQ_toggleFullscreen = function () {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
      else if (document.exitFullscreen) document.exitFullscreen();
    } catch (err) {}
  };
  if (canvas.focus) canvas.focus();
  if (canvas.addEventListener) canvas.addEventListener('mousedown', (e) => {
    try { if (typeof Audio2 !== 'undefined') Audio2.unlock(); } catch (err) {}
    const r = canvas.getBoundingClientRect();
    const sx = r.width ? SW / r.width : 1, sy = r.height ? SH / r.height : 1;
    CLICK_QUEUE.push({ x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy });
    if (e.preventDefault) e.preventDefault();
  });
}

// offscreen canvas factory (browser + node-canvas harness)
function mkCanvas(w, h) {
  if (!IS_NODE) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  return G.__mkCanvas(w, h);
}

// ---------- input (keyboard-first; legacy key-name normalization) ----------
const KEYS = {};
let LAST_KEY = '(none yet!)', ANY_KEY_PRESSED = false;
const KEY_ALIASES = { Up:'ArrowUp', Down:'ArrowDown', Left:'ArrowLeft', Right:'ArrowRight',
  Spacebar:' ', Esc:'Escape', Del:'Delete' };
const KEYCODE_MAP = { 37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',32:' ',27:'Escape',
  90:'z',88:'x',73:'i',80:'p',81:'q',69:'e',85:'u',71:'g',78:'n',49:'1',50:'2',51:'3',52:'4',53:'5',13:'Enter' };
function normKey(e) {
  let k = e.key;
  if (k === undefined && e.keyCode !== undefined) k = KEYCODE_MAP[e.keyCode];
  if (!k) return null;
  if (KEY_ALIASES[k]) k = KEY_ALIASES[k];
  if (k.length === 1) k = k.toLowerCase();
  return k;
}
const PRESS_QUEUE = [];   // discrete presses consumed by game logic
const CLICK_QUEUE = [];   // discrete mouse clicks (virtual screen coords)
function onKeyDown(e) {
  const k = normKey(e); if (!k) return;
  LAST_KEY = k; ANY_KEY_PRESSED = true;
  try { if (typeof Audio2 !== 'undefined') Audio2.unlock(); } catch (err) {}
  if (!KEYS[k]) PRESS_QUEUE.push(k);
  KEYS[k] = true;
  if (k === 'f' && G.NQ_toggleFullscreen) G.NQ_toggleFullscreen();
  if ([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k) && e.preventDefault) e.preventDefault();
}
function onKeyUp(e) { const k = normKey(e); if (k) KEYS[k] = false; }
function bootInput() {
  for (const t of [G, (typeof document !== 'undefined' ? document : null)]) {
    if (t && t.addEventListener) {
      t.addEventListener('keydown', onKeyDown);
      t.addEventListener('keyup', onKeyUp);
    }
  }
}
function keyHeld(k) { return !!KEYS[k]; }
function takePresses() { const q = PRESS_QUEUE.slice(); PRESS_QUEUE.length = 0; return q; }
function takeClicks() { const q = CLICK_QUEUE.slice(); CLICK_QUEUE.length = 0; return q; }
