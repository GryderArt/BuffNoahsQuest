"use strict";
// ================= pixel sprite art (hand-coded grids, chunky outlines) =================
// Style guide: saturated storybook palette, dark plum outlines, big silhouettes.
const PAL = {
  k:'#241a33',  // outline plum-black
  w:'#ffffff', W:'#f0e8d8', e:'#241a33',
  S:'#f8c896', s:'#e0a070',           // skin / skin shade
  Y:'#f8d048', y:'#f8ec70',           // gold hair / bright yellow
  R:'#e84a4a', r:'#a83040',           // red / dark red
  B:'#4878e8', b:'#2c4ca8',           // blue / dark blue
  G:'#54585f', g:'#3a3d45',           // dark gray (pants)
  V:'#58c452', v:'#3a9440',           // green
  N:'#a8703c', n:'#7a4c26',           // brown
  A:'#aab2c0', a:'#6c7484',           // gray
  P:'#f898c8', p:'#d060a0',           // pink
  U:'#9a62e0', u:'#6a3cb0',           // purple
  O:'#f89238', o:'#c86820',           // orange
  T:'#40c0b8', t:'#288880',           // teal
  C:'#9adcf8', c:'#58a8d8',           // ice blue
  F:'#fff8f0',                        // fluff white
  D:'#c8a060',                        // tan
  Q:'#f8b800',                        // deep gold
  X:'#181018',                        // near black
};
// automatic storybook shading: top-lit highlight where a color run meets the
// upper outline, soft shade where it meets the lower outline. Applied to every
// grid sprite, so the whole cast shares one consistent light direction.
function shadeSprite(c) {
  const x = c.getContext('2d');
  const w = c.width, h = c.height;
  const img = x.getImageData(0, 0, w, h), d = img.data;
  const alpha = (i, j) => (j < 0 || j >= h || i < 0 || i >= w) ? 0 : d[(j * w + i) * 4 + 3];
  const isDark = (i, j) => { if (j < 0 || j >= h || i < 0 || i >= w) return false; const o = (j * w + i) * 4; return d[o] + d[o + 1] + d[o + 2] < 150; };
  const out = new Uint8ClampedArray(d);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const o = (j * w + i) * 4;
    if (d[o + 3] === 0 || isDark(i, j)) continue;
    const below = !alpha(i, j + 1) || isDark(i, j + 1);
    const above = !alpha(i, j - 1) || isDark(i, j - 1);
    if (below && !above) { out[o] = d[o] * 0.80; out[o + 1] = d[o + 1] * 0.80; out[o + 2] = d[o + 2] * 0.86; }
    else if (above && !below) { out[o] = Math.min(255, d[o] * 1.12 + 10); out[o + 1] = Math.min(255, d[o + 1] * 1.12 + 10); out[o + 2] = Math.min(255, d[o + 2] * 1.10 + 8); }
  }
  img.data.set(out);
  x.putImageData(img, 0, 0);
  return c;
}
function buildSprite(grid, palOver) {
  const h = grid.length, w = grid[0].length;
  const c = mkCanvas(w, h), x = c.getContext('2d');
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const ch = grid[j][i];
    if (ch === '.' || ch === ' ') continue;
    x.fillStyle = (palOver && palOver[ch]) || PAL[ch] || '#f0f';
    x.fillRect(i, j, 1, 1);
  }
  return shadeSprite(c);
}
function flipH(spr) {
  const c = mkCanvas(spr.width, spr.height), x = c.getContext('2d');
  x.translate(spr.width, 0); x.scale(-1, 1); x.drawImage(spr, 0, 0);
  c.dens = spr.dens || 1; return c;
}
// ---- sprite density: HD art stores N pixels per logical game pixel ----
function sprW(s) { return s.width / (s.dens || 1); }
function sprH(s) { return s.height / (s.dens || 1); }
function dspr(c, s, x, y) { c.drawImage(s, x, y, sprW(s), sprH(s)); }
// hop frame for critters: body down 1px, legs gathered
function hopFrame(grid) {
  const g = grid.slice(0, grid.length - 1);
  return ['.'.repeat(grid[0].length)].concat(g);
}

// ---------------- NOAH (16x20, buff & blond, camo tee like the photo art) ----------------
const NOAH_DOWN_A = [
'.....kkkkkk.....',
'....kYYYYYYk....',
'...kYYyYYYYYk...',
'...kYYYYYYYYk...',
'...kSSSSSSSSk...',
'...kSeSSSSeSk...',
'...kSSSssSSSk...',
'....kSSSSSSk....',
'..kkkBBRBBBkkk..',
'.kSSkBRBBBRBkSk.',
'.kSskRBBBBBBksk.',
'.kSSkBBBRBBRkSk.',
'..kkkBBBBBBkkk..',
'...kGGGGGGGGk...',
'...kGGGkkGGGk...',
'...kGGk..kGGk...',
'...kGGk..kGGk...',
'...kGGk..kGGk...',
'..kXXk....kXXk..',
'..kkkk....kkkk..',
];
const NOAH_DOWN_B = [
'.....kkkkkk.....',
'....kYYYYYYk....',
'...kYYyYYYYYk...',
'...kYYYYYYYYk...',
'...kSSSSSSSSk...',
'...kSeSSSSeSk...',
'...kSSSssSSSk...',
'....kSSSSSSk....',
'..kkkBBRBBBkkk..',
'.kSSkBRBBBRBkSk.',
'.kSskRBBBBBBksk.',
'.kSSkBBBRBBRkSk.',
'..kkkBBBBBBkkk..',
'...kGGGGGGGGk...',
'...kGGGkkGGGk...',
'...kGGk..kGGGk..',
'..kGGk....kGGk..',
'..kGGk...kGGk...',
'.kXXk....kXXk...',
'.kkkk....kkkk...',
];
const NOAH_UP_A = [
'.....kkkkkk.....',
'....kYYYYYYk....',
'...kYYYYYYYYk...',
'...kYYYYYYYYk...',
'...kYYYYYYYYk...',
'...kYYyYYYYYk...',
'...kYYYYYYYYk...',
'....kYYYYYYk....',
'..kkkBBRBBBkkk..',
'.kSSkBBBBBRBkSk.',
'.kSskRBBBBBBksk.',
'.kSSkBBBRBBBkSk.',
'..kkkBBBBBBkkk..',
'...kGGGGGGGGk...',
'...kGGGkkGGGk...',
'...kGGk..kGGk...',
'...kGGk..kGGk...',
'...kGGk..kGGk...',
'..kXXk....kXXk..',
'..kkkk....kkkk..',
];
const NOAH_UP_B = NOAH_UP_A.map((r, j) => (j >= 13 ? NOAH_DOWN_B[j] : r));
const NOAH_SIDE_A = [   // facing right
'.....kkkkkk.....',
'....kYYYYYYk....',
'...kYYYYYyYYk...',
'...kYYYYYYYYk...',
'...kYSSSSSSSk...',
'...kYSSeSSSSk...',
'...kYSSSSssSk...',
'....kSSSSSSk....',
'...kkBBBRBBkk...',
'...kBBRBBBBSSk..',
'...kBBBBBRBssk..',
'...kBBRBBBBSSk..',
'...kkBBBBBBkk...',
'....kGGGGGGk....',
'....kGGGGGGk....',
'....kGGkkGGk....',
'....kGGk.kGGk...',
'....kGGk.kGGk...',
'...kXXk...kXXk..',
'...kkkk...kkkk..',
];
const NOAH_SIDE_B = [
'.....kkkkkk.....',
'....kYYYYYYk....',
'...kYYYYYyYYk...',
'...kYYYYYYYYk...',
'...kYSSSSSSSk...',
'...kYSSeSSSSk...',
'...kYSSSSssSk...',
'....kSSSSSSk....',
'...kkBBBRBBkk...',
'...kBBRBBBBSSk..',
'...kBBBBBRBssk..',
'...kBBRBBBBSSk..',
'...kkBBBBBBkk...',
'....kGGGGGGk....',
'....kGGGGGGk....',
'....kGGkGGk.....',
'...kGGGkkGGk....',
'...kGGk..kGGk...',
'..kXXk....kXXk..',
'..kkkk....kkkk..',
];
const NOAH_CLIMB = [   // back view, arms reaching up to grip the ledge
'..kk.kkkkkk.kk..',
'.kSSkYYYYYYkSSk.',
'.kSskYYYYYYksSk.',
'..kkkYYYYYYkkk..',
'...kYYYYYYYYk...',
'...kYYyYYYYYk...',
'...kYYYYYYYYk...',
'....kYYYYYYk....',
'...kkBBRBBBkk...',
'...kBBBBBRBBk...',
'...kBRBBBBBBk...',
'...kBBBRBBBRk...',
'...kkBBBBBBkk...',
'...kGGGGGGGGk...',
'...kGGGkkGGGk...',
'...kGGk..kGGk...',
'...kGGk.kGGk....',
'..kGGk...kGGk...',
'..kXXk...kXXk...',
'..kkkk...kkkk...',
];
// dive suit recolor: teal helmet-hair, orange wetsuit, teal legs
const DIVE_PAL = { Y:'#40c0b8', y:'#9adcf8', B:'#f89238', b:'#c86820', R:'#f8b800', G:'#288880', X:'#1c5860' };
// SWIMMING pose (prone, facing right): goggled head leads, arms reach forward, legs kick behind
const NOAH_SWIM_A = [   // prone diver, facing right: hooded mask w/ face, orange wetsuit, tank, flippers
'......................',
'.............kkkkkk...',
'.......kkk..kYYYYYYk..',
'......kAAAk.kYkkkkYk..',
'..kkkkkAAAkkYkwwSSYk..',
'.kXXkGGBBBBBYkwSeSYk..',
'kXXkGGBBBBBBBYkSSSk...',
'.kkkkBBBBBBBBBkkkk....',
'...kSSkBBBBBkSSSk.....',
'....kkkkkkkkkkkk......',
'......................',
]
const NOAH_SWIM_B = [   // kick frame: legs gathered, front arm extended in the stroke
'......................',
'.............kkkkkk...',
'.......kkk..kYYYYYYk..',
'......kAAAk.kYkkkkYk..',
'...kkkkAAAkkYkwwSSYk..',
'..kXXkGGBBBBYkwSeSYk..',
'..kXXkGGBBBBBYkSSSk...',
'...kkkBBBBBBBBkkkkk...',
'....kkBBBBBkSSSSSk....',
'......kkkkkkkkkkk.....',
'......................',
];

const NOAH_SURF_A = [   // surface swim, facing right: head up, back awash, splash
'....................',
'.............kkkkk..',
'............kYYYYYk.',
'....kkk.....kYkkkYk.',
'...kSSSk...kYkwSeYk.',
'....kSSk...kYkSSSYk.',
'..kkkBBBkkkkYkkSSk..',
'.kBBBBBBBBBBkkkkkw..',
'w.kkkkkkkkkkkw..ww..',
'.ww.Cw..ww.Cww.w....',
'..C...w..w....C.....',
'....................',
];
const NOAH_SURF_B = [   // surface swim: front-crawl arm extended
'....................',
'.............kkkkk..',
'............kYYYYYk.',
'............kYkkkYk.',
'...........kYkwSeYk.',
'..kkkkkkkkkkYkSSSYk.',
'.kBBBBBBBBBkYkkSSkSk',
'w.kkkkkkkkkkkkkkkk.w',
'.ww..Cw.ww..wwC.ww..',
'..Cw...w..w...Cw....',
'....................',
'....................',
];

// ---------------- creatures (chunky-cute) ----------------
const SPR_GRIDS = {
blazagon: [
'......kYk.......',
'.....kYOYk......',
'....kRYOYRk.....',
'...kRRRRRRRk....',
'...kRReeRRRk....',
'...kRRwwwwRk....',
'..kkRRRRRRkk....',
'.kRRRRRRRRRRk...',
'kRRRRRRRRRRRRk..',
'kRrRRRRRRRRrRk..',
'.kRRRRRRRRRRk...',
'..kRRRRRRRRk....',
'..kRYYYYYYRk....',
'..kRYk..kYRk....',
'..kRk....kRk....',
'.kRRk....kRRk...',
],
sheep: [
'...kkkkkk.......',
'..kFFFFFFk.kkk..',
'.kFFFFFFFFkXXXk.',
'.kFFFFFFFFXXeXk.',
'.kFFFFFFFFXXXXk.',
'.kFFFFFFFFkXXk..',
'..kFFFFFFFFkk...',
'...kkkkkkkk.....',
'...kXk..kXk.....',
'...kXk..kXk.....',
],
ram: [
'..kkkkkk..kQQk..',
'.kFFFFFFkkQqQQk.',
'kFFFFFFFFkXXkQk.',
'kFFFFFFFFXXeXQk.',
'kFFFFFFFFXXXXk..',
'kFFFFFFFFkXXk...',
'.kFFFFFFFFkk....',
'..kkkkkkkk......',
'..kXk...kXk.....',
'..kXk...kXk.....',
],
goat: [
'..........kk.kk.',
'..kkkkkk.kAAkAk.',
'.kWWWWWWkkWWWWk.',
'.kWWWWWWWWWeWWk.',
'.kWWWWWWWWWWWWk.',
'.kWWWWWWWWkWWk..',
'..kWWWWWWWWkWWk.',
'...kkkkkkkk.kk..',
'...kWk..kWk.....',
'...kWk..kWk.....',
],
snowhare: [
'....kk..kk......',
'...kWWkkWWk.....',
'...kWWkkWWk.....',
'..kWWWWWWWWk....',
'..kWeWWWWeWk....',
'..kWWWPPWWWk....',
'..kWWWWWWWWk....',
'...kWWWWWWk.....',
'...kWk..kWk.....',
],
crab: [
'.kk..........kk.',
'kRRk..kkkk..kRRk',
'kRkk.kRRRRk.kkRk',
'.kk.kRReeRRk.kk.',
'....kRRRRRRk....',
'.kkkRRRRRRRRkkk.',
'kRkkRRRRRRRRkkRk',
'.k..kk.kk.kk..k.',
],
octopus: [
'...kkkkkkkk.....',
'..kPPPPPPPPk....',
'.kPPPPPPPPPPk...',
'.kPePPPPPPePk...',
'.kPPPPppPPPPk...',
'.kPPPPPPPPPPk...',
'..kPkPkPkPkk....',
'..kPkPkPkPk.....',
'.kPk.kPk.kPk....',
],
jellyfish: [
'...kkkkkk.......',
'..kPPPPPPk......',
'.kPPwPPPPPk.....',
'.kPPPPPPPPk.....',
'.kkkkkkkkkk.....',
'..kP.kP.kP......',
'..P...P...P.....',
'..kP.kP..P......',
],
shark: [
'........kk......',
'.......kAAk.....',
'..kkkkkAAAAkkk..',
'.kAAAAAAAAAAAAk.',
'kAAeAAAAAAAAAAAk',
'kAAAAAAAAAAAkkk.',
'.kWWWWWWWAAk....',
'..kkkkkkkkk.....',
],
capricorn: [
'..kk.kk.........',
'.kQQkQk.kkkk....',
'.kWWWWkkTTTTk...',
'.kWeWWWTTTTTTk..',
'.kWWWWWTTTTTk...',
'..kWWWTTTTTk.kk.',
'...kkTTTTTTkkTk.',
'.....kkkkkkkk...',
],
starpupil: [
'...kkkkk........',
'..kOOOOOk..k....',
'.kOkekOOOkkOk...',
'.kOkkkOOOOOOk...',
'.kOOOOOOOOkOk...',
'..kOOOOOk..k....',
'...kkkkk........',
],
alien: [
'....kkkkkk......',
'...kVVVVVVk.....',
'..kVVeVVeVVk....',
'..kVVVVVVVVk....',
'...kVVvvVVk.....',
'....kVVVVk......',
'..kkVVVVVVkk....',
'.kVkVVVVVVkVk...',
'....kVk.kVk.....',
'....kk...kk.....',
],
unicorn: [
'......ky........',
'.....kyk.kk.....',
'..kkkkWWkPk.....',
'.kWWWWWWWWk.....',
'.kWeWWWWWWk.....',
'.kWWWWWWWk......',
'..kWWWWWWWWk....',
'..kWWWWWWWWk....',
'..kWk.kWkWk.....',
'..kWk.kWk.kW....',
],
cometpup: [
'...kkk...kkk....',
'..kCCk..kCCk....',
'..kCCkkkkCCk....',
'.kCCCCCCCCCCk...',
'.kCeCCCCCeCCk...',
'.kCCCXXCCCCCk.y.',
'..kCCCCCCCCkky..',
'...kCk..kCk.y...',
],
dragon: [
'....kkkk........kkk.',
'...kVVVVk......kVVk.',
'..kVVeVVVk....kVVk..',
'..kVVVVVVk...kVVk...',
'..kVRRVVVkkkkVVk....',
'...kVVVVVVVVVVk.....',
'..kkVVVVVVVVVk......',
'.kVkVVVVVVVVVVk.....',
'kVkkVVVVVVVVVVk.....',
'....kVk..kVkVVVk....',
'....kVk..kVk.kkk....',
],
condor: [
'.kk.......kk....',
'kNNkk...kkNNk...',
'kNNNNkkkNNNNk...',
'.kNNNNNNNNNk....',
'..kNNWWWNNk.....',
'...kWWeWWk......',
'....kWWWk..k....',
'.....kOOkkk.....',
],
// STORMCROW: the Sky-Spire's diving foe (NOT the catchable Condor) — stormy grey-blue
// body, a yellow lightning-flash on the chest, sharp orange beak.
stormcrow: [
'.kk.......kk....',
'kAAkk...kkAAk...',
'kAAGGkkkGGAAk...',
'.kAGGGGGGGAk....',
'..kGGYYYGGk.....',
'...kGGeGGk......',
'....kGGGk..k....',
'.....kOOkkk.....',
],
ibex: [
'.....kk..kk.....',
'....kNNkkNk.....',
'..kkkkNNNNNk....',
'.kNNNNNNNeNk....',
'.kNNNNNNNNNk....',
'.kNNNNNNNNk.....',
'..kNNNNNNNNk....',
'...kNk..kNk.....',
'...kNk..kNk.....',
],
};
// ---------------- NPCs ----------------
const NPC_GRIDS = {
granny: [
'....kkkkkk......',
'...kAAAAAAk.....',
'..kAAAAAAAAk....',
'..kASSSSSSAk....',
'..kSkSSSSkSk....',
'..kSSSSssSSk....',
'...kSSSSSSk.....',
'..kkPPPPPPkk....',
'.kSkPPPPPPkSk...',
'.kSkPWWWWPkSk...',
'.kSkPWWWWPkSk...',
'..kkPWWWWPkk....',
'...kPPPPPPk.....',
'...kPPPPPPk.....',
'....kXk.kXk.....',
'....kkk.kkk.....',
],
marko: [
'....kkkkkk......',
'...kNNNNNNk.....',
'..kNSSSSSSNk....',
'..kSeSSSSeSk....',
'..kSSnnnnSSk....',
'...kSnSSnSk.....',
'....kSSSSk......',
'..kkRRRRRRkk....',
'.kSkRWWWWRkSk...',
'.kSkRWWWWRkSk...',
'.kSkRWWWWRkSk...',
'..kkRRRRRRkk....',
'...kGGGGGGk.....',
'...kGGkkGGk.....',
'....kXk.kXk.....',
'....kkk.kkk.....',
],
trader: [
'....kkkkkkk.....',
'...kVVVVVVVk....',
'...kkVVVVVkk....',
'..kSSSSSSSSk....',
'..kSeSSSSeSk....',
'..kSSSssSSSk....',
'....kSSSSk......',
'..kkVVVVVVkk....',
'.kSkVVVVVVkSk...',
'.kSkVQQQQVkSk...',
'.kSkVVVVVVkSk...',
'..kkVVVVVVkk....',
'...kVVVVVVk.....',
'...kGGkkGGk.....',
'....kXk.kXk.....',
'....kkk.kkk.....',
],
plume: [
'....kkkkkk......',
'...kUUUUUUk.....',
'..kUUWWWWUUk....',
'..kWkWWWWkWk....',
'..kWWWOOWWWk....',
'...kWWWWWWk.....',
'..kkUUUUUUkk....',
'.kUkUUUUUUkUk...',
'.kUkUWWWWUkUk...',
'.kUkUUUUUUkUk...',
'..kkUUUUUUkk....',
'...kUUUUUUk.....',
'...kUUUUUUk.....',
'....kOk.kOk.....',
'....kkk.kkk.....',
],
zibble: [
'..k........k....',
'...k......k.....',
'....kkkkkk......',
'...kVVVVVVk.....',
'..kVeeVVeeVk....',
'..kVVVVVVVVk....',
'...kVVvvVVk.....',
'....kVVVVk......',
'..kkAAAAAAkk....',
'.kVkAAQQAAkVk...',
'.kVkAAAAAAkVk...',
'..kkAAAAAAkk....',
'...kAAAAAAk.....',
'...kVVkkVVk.....',
'....kVk.kVk.....',
'....kk...kk.....',
],
spirit: [
'....kkkkkk......',
'...kCCCCCCk.....',
'..kCCwCCwCCk....',
'..kCCCCCCCCk....',
'..kCCCccCCCk....',
'..kCCCCCCCCk....',
'...kCCCCCCk.....',
'..kCCCCCCCCk....',
'.kCCCCCCCCCCk...',
'..kCkCCCCkCk....',
'...k.kCCk.k.....',
'......kk........',
],
};
// ---------------- RAMSI the Pillow Pet (the rescue goal) ----------------
const RAMSI_GRID = [
'.....kkkkkkkkkkkk.....',
'...kkCCCCCCCCCCCCkk...',
'..kCCCCCCCCCCCCCCCCk..',
'.kCCCCkkQQQQQQkkCCCCk.',
'.kCCkQQyWWWWWWyQQkCCk.',
'kCCkQQkWWWWWWWWkQQkCCk',
'kCCkQkWWeWWWWeWWkQkCCk',
'kCCkQkWWWWWWWWWWkQkCCk',
'kCCkYkWWWWppWWWWkYkCCk',
'kCCkYkkWWWnnWWWkkYkCCk',
'kCCCkWkWWWWWWWWkWkCCCk',
'.kCCCkkWWWWWWWWkkCCCk.',
'.kCCCCCkkkkkkkkCCCCCk.',
'..kCCCCCCCCCCCCCCCCk..',
'...kkCCCCCCCCCCCCkk...',
'.....kkkkkkkkkkkk.....',
];
const RAMSI_CAGE = [
'kkkkkkkkkkkkkkkkkkkkkk',
'kQk.kQk.kQk.kQk.kQk.Qk',
'kQk.kQk.kQk.kQk.kQk.Qk',
'kQk.kQk.kQk.kQk.kQk.Qk',
'kkkkkkkkkkkkkkkkkkkkkk',
];
// ---------------- bosses ----------------
const BILLY_GRID = [
'....kk....................kk....',
'...kQQk..................kQQk...',
'..kQqQQk................kQQqQk..',
'.kQk.kQQk....kkkkkk....kQQk.kQk.',
'.kQk..kQQkkkkAAAAAAkkkkQQk..kQk.',
'..kk...kQAAAAAAAAAAAAAAQk...kk..',
'........kAAWWWWWWWWWWAAk........',
'.......kAWWWeWWWWWWeWWWAk.......',
'.......kAWWWWWWWWWWWWWWAk.......',
'.......kAWWWWWnnWWWWWWWAk.......',
'........kWWWWnWWnWWWWWk.........',
'......kkkAAAAAAAAAAAAkkkk.......',
'.....kAAAkAAAAAAAAAAkAAAAk......',
'....kAWWWAkAAAAAAAAkAWWWAAk.....',
'....kAWWWAAkkkkkkkkAAWWWAAk.....',
'....kAAAAAAAAAAAAAAAAAAAAAk.....',
'.....kAAAAAAAAAAAAAAAAAAAk......',
'......kkAAAAAAAAAAAAAAkk........',
'.......kWWk.kWWk.kWWk...........',
'.......kWWk.kWWk.kWWk...........',
'......kkkk.kkkk.kkkk............',
];
const CERB_GRID = [
'..kkk......kkk......kkk....',
'.kNNNk....kNNNk....kNNNk...',
'kNNeNNk..kNNeNNk..kNNeNNk..',
'kNNNNNk..kNNNNNk..kNNNNNk..',
'kNnnNNk..kNnnNNk..kNnnNNk..',
'.kNNNk....kNNNk....kNNNk...',
'..kNNkkkkkkNNNkkkkkkNNk....',
'...kNNNNNNNNNNNNNNNNNk.....',
'..kNNNNNNNNNNNNNNNNNNNk....',
'..kNNNNNNNNNNNNNNNNNNNk....',
'..kNNNNNNNNNNNNNNNNNNNk....',
'...kNNNNNNNNNNNNNNNNNk.....',
'...kNNk..kNNk..kNNk.kNNk...',
'...kNNk..kNNk..kNNk..kNk...',
'..kkkk..kkkk..kkkk..kkk....',
];
const SAHOR_GRID = [
'...kkk.........kkk...',
'..kQQQk.......kQQQk..',
'.kQQyQQk.....kQQyQQk.',
'.kQk.kQQk...kQQk.kQk.',
'.kQk..kQQkkkkQQk..kQk',
'.kQk...kBBBBBBk...kQk',
'..kk..kBBBBBBBBk..kk.',
'.....kBBBBBBBBBBk....',
'....kBBWWWWWWWWBBk...',
'....kBWeWWWWWWeWBk...',
'....kBWWWWWWWWWWBk...',
'....kBWWWpWWpWWWBk...',
'.....kWWWWnnWWWWk....',
'......kWWWWWWWWk.....',
'......kkQQQQQQkk.....',
'....kkBBBBBBBBBBkk...',
'..kNNkBBBBBBBBBBkSSk.',
'..kNNkBBRBBBBRBBkSsk.',
'...kkkBBBBBBBBBBkkk..',
'.....kBBBBBBBBBBk....',
'.....kBBBBBBBBBBk....',
'......kBBk..kBBk.....',
'.....kWWWk..kWWWk....',
'.....kWQWk..kWQWk....',
'.....kkkk...kkkk.....',
]
const TWINKLE_CORE = [
'.......kkkkkk.......',
'.....kkyQyQykk......',
'....kOOOOOOOOOk.....',
'...kOOPOOOOPOOOk....',
'..kOOOOOOOOOOOOk....',
'..kOOeOOOOOOeOOk....',
'..kOOOOOOOOOOOOk....',
'..kOOOOOppOOOOOk....',
'...kOOOOOOOOOOk.....',
'....kOOOOOOOOk......',
'.....kkkkkkkk.......',
];
// ---------------- props & items ----------------
const PROP_GRIDS = {
chest: [
'..kkkkkkkkkkkk..',
'.kNNNNNNNNNNNNk.',
'kNnNNNNNNNNNNnNk',
'kNNkkkkkkkkkkNNk',
'kNNNNNkQQkNNNNNk',
'kNnNNNkQQkNNNnNk',
'kNNNNNNkkNNNNNNk',
'.kkkkkkkkkkkkkk.',
],
chestOpen: [
'..kkkkkkkkkkkk..',
'.kXXXXXXXXXXXXk.',
'kNXXXXXXXXXXXXNk',
'kNNkkkkkkkkkkNNk',
'kNNNNNkQQkNNNNNk',
'kNnNNNkQQkNNNnNk',
'kNNNNNNkkNNNNNNk',
'.kkkkkkkkkkkkkk.',
],
sign: [
'..kkkkkkkkkkk...',
'.kDDDDDDDDDDDk..',
'.kDnnnDnnnDnDk..',
'.kDDDDDDDDDDDk..',
'.kDnnDnnnnnDDk..',
'.kDDDDDDDDDDDk..',
'..kkkkkNNkkkk...',
'......kNNk......',
'......kNNk......',
],
post: [
'.....kkkk.......',
'....kQQQQk......',
'...kQkkkkQk.....',
'...kQk..kQk.....',
'...kQkkkkQk.....',
'....kQQQQk......',
'.....kNNk.......',
'.....kNNk.......',
'.....kNNk.......',
],
buoy: [
'......kk........',
'.....kyyk.......',
'....kkkkkk......',
'...kRRWWRRk.....',
'...kRRWWRRk.....',
'...kWWRRWWk.....',
'....kkkkkk......',
],
cage: [
'.kkkkkkkkkkkk...',
'kQkk.kk.kk.kQk..',
'kQk..k..k..kQk..',
'kQk..k..k..kQk..',
'kQkk.kk.kk.kQk..',
'.kkkkkkkkkkk....',
],
block: [
'kkkkkkkkkkkkkkkk',
'kAAAAAAAAAAAAAak',
'kAWAAAAAAAAAAAak',
'kAAAAAAkkAAAAAak',
'kAAAAAkaakAAAAak',
'kAAAAAAkkAAAAAak',
'kAAAAAAAAAAAAAak',
'kAaaaaaaaaaaaaak',
'kkkkkkkkkkkkkkkk',
],
saucer: [
'......kkkkkkkk......',
'....kkCCCCCCCCkk....',
'...kCCcCCCCCCcCCk...',
'.kkAAAAAAAAAAAAAAkk.',
'kAAQAAQAAQAAQAAQAAAk',
'.kkAAAAAAAAAAAAAAkk.',
'...kkk..kkk..kkk....',
],
crystal: [
'...kk...',
'..kCCk..',
'..kCck..',
'.kCCCCk.',
'.kCcCck.',
'kCCCCCCk',
'kCcCCcCk',
'.kUUUUk.',
'..kkkk..',
],
beacon: [
'...kk...',
'..kQQk..',
'.kQyyQk.',
'.kQyyQk.',
'..kAAk..',
'..kAAk..',
'.kAAAAk.',
'kAAAAAAk',
'.kkkkkk.',
],
};
const ITEM_GRIDS = {
heart:    ['.kk.kk.','kRRkRRk','kRRRRRk','.kRRRk.','..kRk..','...k...'],
heartC:   ['.kk.kk.','kPPkPPk','kPWPPPk','.kPPPk.','..kPk..','...k...'],
coin:     ['.kkkk.','kyQQyk','kQyyQk','kQyyQk','kyQQyk','.kkkk.'],
gem:      ['.kkkk.','kCwCCk','kCCCCk','.kCCk.','..kk..'],
key:      ['.kkk..','kQ.Qk.','.kkk..','..Qk..','..QQk.','..Qk..'],
bosskey:  ['.kkk..','kRwRk.','.kkk..','..Rk..','..RRk.','..Rk..'],
clover:   ['.kV.Vk','kVVkVV','.kVVk.','kVVkVV','.kV.k.','..k...'],
tincan:   ['.kkkk.','kAWWAk','kAAAAk','kAWWAk','.kkkk.'],
fishsnack:['......','kOOk.k','kOeOkk','kOOk.k','......'],
cookie:   ['.kkkk.','kDyDDk','kDDyDk','kDyDDk','.kkkk.'],
berry:    ['..kk..','.kRPk.','kPUCVk','kVCBPk','.kRk..'],
bone:     ['kk..kk','kWWWWk','.kWWk.','kWWWWk','kk..kk'],
shard:    ['..k...','.kyk..','kywyk.','.kyk..','..k...'],
crown:    ['k.k.k.','kQkQkQ','kQQQQk','kQQQQk','.kkkk.'],
berrySeed:['..kk..','.kVVk.','.kVVk.','..kk..'],
pearl:    ['.kkk.','kFWpk','kWwWk','kpWFk','.kkk.'],
tire:     ['.kkkk.','kXXXXk','kXk.Xk','kX.kXk','kXXXXk','.kkkk.'],
spring:   ['.kAAk.','kAk.k.','.kAAk.','kAk.k.','.kAAk.','..kk..'],
seedbag:  ['..kk..','.kNNk.','kNyyNk','kNyyNk','kNNNNk','.kkkk.'],
marble:   ['kkkkkk','kWWWWk','kWwWWk','kWWwWk','kWWWWk','kkkkkk'],
bucket:   ['k....k','kNNNNk','kNCCNk','kNCCNk','kNNNNk','.kkkk.'],
skyfeather:['....ky','...kyF','..kyFk','.kyFk.','kyFk..','.Qk...','.Qk...'],
goldnugget:['.kkk.','kQQyk','kyQQk','kQQyk','.kkk.'],
crystalshard:['..k..','.kCk.','kCwCk','kCCCk','.kCk.','..k..'],
voidgem:['.kkk.','kUwUk','kUUUk','.kUk.','..k..'],
};
// gear icons (for panel + item-get celebrations)
const GEAR_GRIDS = {
sandal: ['..........','.kkk......','kSSSk.....','kSSSSk....','.kkkkkk...','.kRRRRk...','kVVVVVVk..','kVVVVVVVk.','.kkkkkkk..'],
glove:  ['..kkk.....','.kOOOk....','.kOOOk....','kkOOOk....','kOkOOOkk..','kOOOOOOk..','.kOOOOOk..','..kkkkk...'],
suit:   ['..kkkk....','.kTTTTk...','kTwTTTTk..','kTTTTTTk..','.kkkkkk...','.kOOOOk...','.kOOOOk...','..kkkk....'],
wing:   ['k...k.....','kWk.kWk...','kWWkWWk...','kWWWWWk...','.kWWWk....','..kWk.....','...k......'],
bracer: ['.kkkkk....','kQQQQQk...','kQwwwQk...','kQQQQQk...','kQwwwQk...','kQQQQQk...','.kkkkk....'],
};
// tool icons (12x12-ish)
const TOOL_GRIDS = {
mitts:   ['...kkk....','..kRRRk...','.kRRRRRk..','.kRRRRRk..','.kRWWRRk..','..kRRRk...','...kkk....'],
net:     ['kkkkk.....','kw.wk.....','kwwwk.....','kw.wk.....','kkkkk.....','...kN.....','....kN....'],
harpoon: ['........k.','......kQk.','.....kQk..','....kQk...','...kNk....','..kNk.....','.kNk......'],
cage:    ['kkkkkkk...','kQ.k.Qk...','kQ.k.Qk...','kQ.k.Qk...','kkkkkkk...'],
bone:    ['kk...kk...','kWk.kWk...','.kWWWk....','kWk.kWk...','kk...kk...'],
};

// build everything once
const Sprites = {};
function buildAllSprites() {
  const S = Sprites;
  // Noah: [dir][frame], plus dive variant
  function noahSet(pal) {
    const sideA = buildSprite(NOAH_SIDE_A, pal), sideB = buildSprite(NOAH_SIDE_B, pal);
    return {
      down: [buildSprite(NOAH_DOWN_A, pal), buildSprite(NOAH_DOWN_B, pal)],
      up:   [buildSprite(NOAH_UP_A, pal),   buildSprite(NOAH_UP_B, pal)],
      right:[sideA, sideB],
      left: [flipH(sideA), flipH(sideB)],
      climb: buildSprite(NOAH_CLIMB, pal),
    };
  }
  S.noah = noahSet(null);
  S.noahDive = noahSet(DIVE_PAL);
  // swim frames (dive palette); right + flipped left
  const swimR = [buildSprite(NOAH_SWIM_A, DIVE_PAL), buildSprite(NOAH_SWIM_B, DIVE_PAL)];
  S.noahSwim = { right: swimR, left: [flipH(swimR[0]), flipH(swimR[1])] };
  // SURFACE swim frames (head above the waterline, splashy front crawl)
  const surfR = [buildSprite(NOAH_SURF_A, DIVE_PAL), buildSprite(NOAH_SURF_B, DIVE_PAL)];
  S.noahSurf = { right: surfR, left: [flipH(surfR[0]), flipH(surfR[1])] };
  S.creatures = {};
  for (const [k, g] of Object.entries(SPR_GRIDS)) {
    const a = buildSprite(g), b = buildSprite(hopFrame(g));
    S.creatures[k] = { right: [a, b], left: [flipH(a), flipH(b)] };
  }
  S.npcs = {};
  for (const [k, g] of Object.entries(NPC_GRIDS)) S.npcs[k] = buildSprite(g);
  // traders: palette swaps of the green coat
  S.npcs.tess = buildSprite(NPC_GRIDS.trader);
  S.npcs.sal  = buildSprite(NPC_GRIDS.trader, { V:'#4878e8', v:'#2c4ca8' });
  S.npcs.gruul= buildSprite(NPC_GRIDS.trader, { V:'#9a62e0', v:'#6a3cb0', S:'#58c452', s:'#3a9440' });
  S.npcs.cora = buildSprite(NPC_GRIDS.trader, { V:'#f89238', v:'#c86820' });
  S.billy = buildSprite(BILLY_GRID);
  S.cerb = buildSprite(CERB_GRID);
  S.sahor = buildSprite(SAHOR_GRID);
  S.ramsi = buildSprite(RAMSI_GRID);
  S.ramsiCage = buildSprite(RAMSI_CAGE);
  S.gustwing = S.pufflord = S.sparkhorn = S.tempestia = S.parents = S.parentsFree = null;   // World 2: optional dedicated art via boss.*.png
  S.mottle = S.thornback = S.geode = S.grub = S.gnash = null;   // Underburrow Wardens + Gnash art slots
  S.twinkle = buildSprite(TWINKLE_CORE);
  S.props = {};
  for (const [k, g] of Object.entries(PROP_GRIDS)) S.props[k] = buildSprite(g);
  // tall 2.5D push-block: a heavy stone pillar with a lit top face + gold rune
  S.tallBlock = (() => {
    const c = mkCanvas(16, 20), x = c.getContext('2d');
    x.fillStyle = '#241a33'; x.fillRect(0, 0, 16, 20);
    x.fillStyle = '#b9bdc9'; x.fillRect(1, 1, 14, 5);
    x.fillStyle = '#d3d6df'; x.fillRect(1, 1, 14, 2);
    x.fillStyle = '#878b99'; x.fillRect(1, 6, 14, 12);
    x.fillStyle = '#6c7080'; x.fillRect(1, 16, 14, 2);
    x.fillStyle = '#565a68'; x.fillRect(1, 6, 14, 1);
    x.fillStyle = '#f8b800'; x.fillRect(6, 9, 4, 4);
    x.fillStyle = '#241a33'; x.fillRect(7, 10, 2, 2);
    x.fillStyle = '#6c7080'; x.fillRect(3, 8, 1, 4); x.fillRect(12, 11, 1, 4);
    x.fillStyle = 'rgba(20,10,40,.3)'; x.fillRect(1, 1, 1, 17); x.fillRect(14, 1, 1, 17);
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(2, 1, 12, 1);
    return c;
  })();
  S.items = {};
  for (const [k, g] of Object.entries(ITEM_GRIDS)) S.items[k] = buildSprite(g);
  S.tools = {};
  for (const [k, g] of Object.entries(TOOL_GRIDS)) S.tools[k] = buildSprite(g);
  S.gear = {};
  for (const [k, g] of Object.entries(GEAR_GRIDS)) S.gear[k] = buildSprite(g);
  // real dialog faces (FF-Tactics sheet)
  S.faceImgs = {};
  if (!IS_NODE && typeof FACE_B64 !== 'undefined') {
    for (const [k, v] of Object.entries(FACE_B64)) {
      const img = new G.Image();
      img.src = 'data:image/png;base64,' + v;
      S.faceImgs[k] = img;
    }
  }
  // portraits from embedded art
  S.portraitImgs = {};
  if (!IS_NODE) {
    for (const key of ['noahFace', 'sahorFace', 'sahorBig', 'titleArt', 'noahFull']) {
      const img = new G.Image();
      img.src = 'data:image/jpeg;base64,' + PORTRAIT_B64[key];
      S.portraitImgs[key] = img;
    }
  }
  // optional hand-made world map background: drop worldmap_bg.png next to the HTML
  S.worldMapBg = null;
  if (!IS_NODE && G.Image) {
    try {
      const img = new G.Image();
      img.onload = () => { S.worldMapBg = img; };
      img.onerror = () => { S.worldMapBg = null; };
      img.src = 'worldmap_bg.png';
    } catch (e) {}
  }
  // pixel portraits for NPCs (whole sprite, scaled up nearest-neighbor, FF-T mini style)
  S.pixPortraits = {};
  for (const k of Object.keys(S.npcs)) {
    const src = S.npcs[k];
    const c = mkCanvas(64, 64), x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.fillStyle = '#2c2244'; x.fillRect(0, 0, 64, 64);
    x.fillStyle = '#382a58'; x.fillRect(0, 34, 64, 30);
    const s = Math.floor(56 / Math.max(src.width, src.height));
    x.drawImage(src, 0, 0, src.width, src.height,
      (64 - src.width * s) >> 1, 62 - src.height * s, src.width * s, src.height * s);
    S.pixPortraits[k] = c;
  }
  applyExtArt();
}

// ---- external art overrides (assets/*.png embedded by build.py as EXT_ART) ----
function pixPortraitFor(src) {
  const c = mkCanvas(64, 64), x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.fillStyle = '#2c2244'; x.fillRect(0, 0, 64, 64);
  x.fillStyle = '#382a58'; x.fillRect(0, 34, 64, 30);
  const lw = sprW(src), lh = sprH(src);
  const s = Math.max(1, Math.floor(56 / Math.max(lw, lh)));
  x.drawImage(src, 0, 0, src.width, src.height,
    (64 - lw * s) >> 1, 62 - lh * s, lw * s, lh * s);
  return c;
}
function ciKey(obj, name) { if (obj[name]) return name; const lo = String(name).toLowerCase(); for (const k of Object.keys(obj)) if (k.toLowerCase() === lo) return k; return name; }
const EXT_BOSS_KEYS = { billy:'billy', cerberus:'cerb', sahor:'sahor', twinkle:'twinkle', ramsi:'ramsi', ramsicage:'ramsiCage', gustwing:'gustwing', pufflord:'pufflord', sparkhorn:'sparkhorn', tempestia:'tempestia', parents:'parents', parentsfree:'parentsFree', mottle:'mottle', thornback:'thornback', geode:'geode', grub:'grub', gnash:'gnash', ramsisuper:'ramsiSuper' };
const TILE_OVERRIDE = { acunit:'acunit', skylight:'skylight', towerpanel:'towerwall', towergear:'towergear' };   // HD tiles -> TILEDEFS ids
function densFor(cur, img) {
  if (!cur || !cur.width) return 1;
  const logicalW = cur.width / (cur.dens || 1);
  return Math.max(1, Math.round(img.width / logicalW));
}
const EXT_DENS = 4;   // the importer's DENSITY: external-only art (no procedural twin to
                      // measure against) is ALWAYS stored at this many px per logical px
function installExtSprite(key, img) {
  const S = Sprites;
  const c = mkCanvas(img.width, img.height), x = c.getContext('2d');
  x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0);
  const p = key.toLowerCase().split('.');
  const kind = p[0], who = p[1], fr = ({ a: 0, b: 1, c: 2, d: 3 })[p[2]] || 0;
  if (kind === 'noah' || kind === 'noahdive') {
    const set = kind === 'noah' ? S.noah : S.noahDive;
    c.dens = densFor(set.down[0], img);
    if (who === 'climb') { set.climb = c; return; }
    if (who === 'side') { set.right[fr] = c; set.left[fr] = flipH(c); return; }
    if (set[who]) set[who][fr] = c;
  } else if (kind === 'noahswim') {
    c.dens = densFor(S.noahSwim.right[0], img);
    S.noahSwim.right[fr] = c; S.noahSwim.left[fr] = flipH(c);
  } else if (kind === 'noahsurf') {
    c.dens = densFor(S.noahSurf.right[0], img);
    S.noahSurf.right[fr] = c; S.noahSurf.left[fr] = flipH(c);
  } else if (kind === 'creature') {
    let cr = S.creatures[ciKey(S.creatures, who)];
    const hadBase = !!(cr && cr.right && cr.right[0]);
    if (!cr) cr = S.creatures[who] = { right: [null, null], left: [null, null] };   // external-only creature (no base grid)
    c.dens = hadBase ? densFor(cr.right[0], img) : EXT_DENS;
    cr.right[fr] = c; cr.left[fr] = flipH(c);
    if (fr === 0 && !EXT_ART[kind + '.' + who + '.b']) {
      const dn = c.dens || 1;
      const b = mkCanvas(c.width, c.height + dn), bx = b.getContext('2d');
      bx.drawImage(c, 0, dn); b.dens = dn;                    // auto hop frame
      cr.right[1] = b; cr.left[1] = flipH(b);
    }
  } else if (kind === 'npc') { const nk = ciKey(S.npcs, who); c.dens = S.npcs[nk] ? densFor(S.npcs[nk], img) : EXT_DENS; S.npcs[nk] = c; S.pixPortraits[nk] = pixPortraitFor(c); }
  else if (kind === 'boss') { const bk = EXT_BOSS_KEYS[who]; if (bk) { c.dens = S[bk] ? densFor(S[bk], img) : EXT_DENS; S[bk] = c; } }
  else if (kind === 'prop') { const k2 = ciKey(S.props, who); c.dens = S.props[k2] ? densFor(S.props[k2], img) : EXT_DENS; S.props[k2] = c; }
  else if (kind === 'item') { const k2 = ciKey(S.items, who); c.dens = S.items[k2] ? densFor(S.items[k2], img) : EXT_DENS; S.items[k2] = c; }
  else if (kind === 'tool') { const k2 = ciKey(S.tools, who); c.dens = S.tools[k2] ? densFor(S.tools[k2], img) : EXT_DENS; S.tools[k2] = c; }
  else if (kind === 'gear') { const k2 = ciKey(S.gear, who); c.dens = S.gear[k2] ? densFor(S.gear[k2], img) : EXT_DENS; S.gear[k2] = c; }
  else if (kind === 'tree') { if (who === 'tree' || who === 'pine' || who === 'palm') { c.dens = densFor(TileArt[who], img); TileArt[who] = c; } }
  else if (kind === 'scene') { S.scenes = S.scenes || {}; c.dens = 1; S.scenes[who] = c; }
  else if (kind === 'fx') { S.fx = S.fx || {}; c.dens = EXT_DENS; S.fx[who] = c; }
  else if (kind === 'tile') {
    if (typeof TileArt !== 'undefined') {
      const t = mkCanvas(16, 16), tx = t.getContext('2d'); tx.imageSmoothingEnabled = false;
      tx.drawImage(c, 0, 0, c.width, c.height, 0, 0, 16, 16);                 // HD tile -> 16x16 game tile
      const id = TILE_OVERRIDE[who];
      if (id && TileArt.variants && TileArt.variants[id]) { for (let k = 0; k < TileArt.variants[id].length; k++) TileArt.variants[id][k] = t; }
      else { TileArt.roofTiles = TileArt.roofTiles || {}; TileArt.roofTiles[who] = t; }   // facade/misc -> facade renderer
    }
  }
}
function applyExtArt() {
  if (typeof EXT_ART === 'undefined' || !EXT_ART) return;
  for (const [key, b64] of Object.entries(EXT_ART)) {
    try {
      const img = new Image();
      const uri = (typeof b64 === 'string' && b64.indexOf('data:') === 0) ? b64 : 'data:image/png;base64,' + b64;
      img.onload = () => { try { installExtSprite(key, img); } catch (e) {} };
      img.src = uri;                                        // BROWSERS need the data: URI scheme to decode + fire onload
      if (img.width) { try { installExtSprite(key, img); } catch (e) {} }   // node-canvas decodes synchronously
    } catch (e) {}
  }
}
