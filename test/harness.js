// node test harness: DOM/canvas stubs + load built game.js
const { createCanvas } = require('canvas');
const fs = require('fs'), path = require('path');

const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
global.__mkCanvas = (w, h) => createCanvas(w, h);
const mainCanvas = createCanvas(1312, 544);
mainCanvas.style = {};
mainCanvas.focus = () => {};
global.document = {
  getElementById: () => mainCanvas,
  addEventListener: () => {},
  createElement: () => createCanvas(16, 16),
};
global.window = global;
global.addEventListener = () => {};
global.requestAnimationFrame = () => {};
global.devicePixelRatio = 1;
global.innerWidth = 1312; global.innerHeight = 544;
global.Image = require('canvas').Image;   // real decoding: faces/portraits render in tests

const code = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
if (code.includes('\x00')) throw new Error('NUL bytes in game.js!');
(0, eval)(code);

const NQ = global.NQ;
if (NQ.applyMapOverride) {} NQ.bootGame();

const H = {
  NQ, canvas: mainCanvas,
  step(n = 1, dt = 1 / 60) {
    for (let i = 0; i < n; i++) NQ.updateGame(dt);
    if (NQ.Game.errorMsg) throw new Error('Game error: ' + NQ.Game.errorMsg);
  },
  render() { NQ.render(1 / 60); },
  press(k) { NQ.press(k); this.step(1); },
  hold(k, v) { NQ.hold(k, v); },
  releaseAll() { for (const k of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd']) NQ.hold(k, false); },
  warp(mapId, x, y) { NQ.Game.loadMap(mapId, x, y); },
  place(x, y) {
    NQ.Player.x = x * 16 + 8; NQ.Player.y = y * 16 + 12;
    NQ.Player.lastSafe = [NQ.Player.x, NQ.Player.y];
    NQ.Player.grab = null; NQ.Player.gSlide = null;
    if (NQ.Game.state === 'play') this.step(1);
  },
  face(dir) { NQ.Player.dir = dir; },
  startPlay() {
    NQ.Game.state = 'title';
    this.press('z');
    if (NQ.Game.state === 'intro') this.press('z');   // skip the opening cutscene
    if (NQ.Game.state !== 'play') throw new Error('did not enter play state');
  },
  assert(cond, msg) {
    if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; throw new Error('ASSERT: ' + msg); }
    console.log('  ok -', msg);
  },
  shot(name) {
    this.render();
    fs.writeFileSync(path.join(__dirname, '..', 'shots', name + '.png'), mainCanvas.toBuffer('image/png'));
  },
};
module.exports = H;
