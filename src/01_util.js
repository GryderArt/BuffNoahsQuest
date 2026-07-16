"use strict";
// ================= utilities =================
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
function rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function hash2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >> 13)) * 1274126177; h = h ^ (h >> 16); return (h >>> 0) / 4294967296; }
function choice(arr, r) { return arr[Math.floor(r * arr.length) % arr.length]; }
const DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

// word wrap for canvas text
function wrapText(c, text, maxW) {
  const words = String(text).split(' '), lines = []; let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
// chunky text with outline (storybook readability)
function drawText(c, txt, x, y, size, color, outline, align) {
  c.font = 'bold ' + size + 'px monospace';
  c.textAlign = align || 'left'; c.textBaseline = 'top';
  if (outline !== false) {
    c.fillStyle = outline || '#1a1426';
    for (const [ox, oy] of [[-1,0],[1,0],[0,-1],[0,1]]) c.fillText(txt, x + ox, y + oy);
  }
  c.fillStyle = color || '#fff';
  c.fillText(txt, x, y);
  c.textAlign = 'left';
}

// smooth polyline through control points (Catmull-Rom). <3 points => straight.
function catmullRom(pts, perSeg) {
  perSeg = perSeg || 12;
  if (pts.length < 3) return pts.map(p => [p[0], p[1]]);
  const out = [], n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    for (let s = 0; s < perSeg; s++) {
      const t = s / perSeg, t2 = t * t, t3 = t2 * t;
      const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([x, y]);
    }
  }
  out.push([pts[n - 1][0], pts[n - 1][1]]);
  return out;
}

// tiny seeded RNG for deterministic decoration
function sRandom(seed) { let s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
