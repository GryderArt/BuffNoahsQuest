"use strict";
// ============== THE UNDERBURROW MAP (ESC underground) ==============
// A root-and-lantern level select, mirroring the World-3 clockwork map. In normal play
// each den unlocks once you have LEGITIMATELY reached it (its entry flag), so it is
// honest fast-travel, never a skip. flags.god / playtest opens everything.
const BURROW_NODES = [
  { id: 'burrow5',      label: 'Topsoil Tunnels', req: 'underburrow', x: 66,  y: 88 },
  { id: 'burrow6',      label: 'Root Hollows',    req: 'mottle',      x: 168, y: 140 },
  { id: 'burrow7',      label: 'Crystal Deep',    req: 'thornback',   x: 272, y: 96 },
  { id: 'burrow8',      label: 'Hoard Descent',   req: 'geode',       x: 372, y: 150 },
  { id: 'vault1',       label: 'Hoard Cavern',    req: 'grub',        x: 428, y: 82 },
  { id: 'gnash_throne', label: "Gnash's Throne",  req: 'g_grub',      x: 300, y: 196 },
  { id: 'vale',         label: 'Greenwood Vale',  req: null, exit: true, x: 250, y: 52 },   // parked in the painted backdrop's sunlit shaft (the way up)
];
Game.burrowHere = function () {
  const i = BURROW_NODES.findIndex(n => n.id === this.mapId);
  return i >= 0 ? i : 0;
};
Game.updateBurrowMap = function (presses) {
  const F = this.flags;
  const ul = BURROW_NODES.map(n => F.god || !n.req || this.lookupFlag(n.req));
  for (const k of presses) {
    if (k === 'Escape') this.state = 'play';
    else if (k === 'ArrowLeft' || k === 'a' || k === 'ArrowUp' || k === 'w') this.burrowCursor = (this.burrowCursor + BURROW_NODES.length - 1) % BURROW_NODES.length;
    else if (k === 'ArrowRight' || k === 'd' || k === 'ArrowDown' || k === 's') this.burrowCursor = (this.burrowCursor + 1) % BURROW_NODES.length;
    else if ((k === ' ' || k === 'z' || k === 'Enter') && ul[this.burrowCursor]) {
      const n = BURROW_NODES[this.burrowCursor];
      this.state = 'play'; this.loadMap(n.id); saveGame();
    }
  }
};
UI.drawBurrowMap = function (c) {
  // the dark under-earth: soil strata + glowing veins
  const bgB = Sprites.scenes && Sprites.scenes.burrowbg;   // painted overview map (drops in via scene.burrowbg.png)
  c.fillStyle = '#17100c'; c.fillRect(0, 0, VW, VH);
  if (bgB) {
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = true;
    try { c.drawImage(bgB, 0, 0, VW, VH); } catch (e) {}
    c.imageSmoothingEnabled = sm;
    c.fillStyle = 'rgba(10,7,4,.10)'; c.fillRect(0, 0, VW, VH);   // gentle unifying wash
  } else {
    // procedural fallback: dark under-earth strata + glowing veins
    for (let j = 0; j < 6; j++) { c.fillStyle = j % 2 ? '#1d1410' : '#191009'; c.fillRect(0, j * 48, VW, 24); }
    for (let k = 0; k < 26; k++) {
      const x = (hash2(k, 3) * VW) | 0, y = (hash2(k, 7) * VH) | 0;
      c.fillStyle = 'rgba(126,240,160,' + (0.12 + 0.14 * Math.abs(Math.sin(Game.time * 2 + k))) + ')';
      c.fillRect(x, y, 2, 2);
    }
  }
  drawText(c, '~ THE UNDERBURROW ~', VW / 2, 12, 12, '#8ef0c0', '#241a10', 'center');
  this.hot = [];
  const ul = BURROW_NODES.map(n => Game.flags.god || !n.req || Game.lookupFlag(n.req));
  const lv = BURROW_NODES.filter(n => !n.exit);
  for (let i = 1; i < lv.length; i++) {   // winding root-trail between dens
    c.strokeStyle = '#3a2818'; c.lineWidth = 6;
    c.beginPath(); c.moveTo(lv[i - 1].x, lv[i - 1].y);
    const mx = (lv[i - 1].x + lv[i].x) / 2 + (i % 2 ? 18 : -18), my = (lv[i - 1].y + lv[i].y) / 2;
    c.quadraticCurveTo(mx, my, lv[i].x, lv[i].y); c.stroke();
    c.strokeStyle = '#5a3c22'; c.lineWidth = 3; c.stroke(); c.lineWidth = 1;
  }
  BURROW_NODES.forEach((n, i) => {
    const open = ul[i], cur = i === Game.burrowCursor;
    this.hot.push({ x: n.x - 14, y: n.y - 14, w: 28, h: 28, fn: () => { Game.burrowCursor = i; if (open) { Game.state = 'play'; Game.loadMap(n.id); saveGame(); } } });
    c.save(); c.translate(n.x, n.y);
    if (n.exit) {   // the way up: a sunlit shaft
      c.fillStyle = '#241a33'; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill();
      c.fillStyle = open ? '#9adcf8' : '#554a6a'; c.beginPath(); c.arc(0, 0, 9, 0, 7); c.fill();
      c.fillStyle = '#f8d048'; c.beginPath(); c.arc(0, -2, 4, 0, 7); c.fill();
    } else {        // a burrow-hole lantern
      c.fillStyle = '#0a0603'; c.beginPath(); c.ellipse(0, 2, 12, 9, 0, 0, 7); c.fill();
      c.strokeStyle = '#5a3c1e'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 2, 12, 9, 0, 0, 7); c.stroke(); c.lineWidth = 1;
      c.fillStyle = open ? (cur ? '#8ef0c0' : '#58c452') : '#3a3550';
      c.beginPath(); c.arc(0, 0, 5 + (cur ? Math.sin(Game.time * 5) : 0), 0, 7); c.fill();
    }
    c.restore();
    if (!open) drawText(c, '?', n.x - 3, n.y - 5, 9, '#fff', '#241a33');
    c.font = 'bold 8px monospace'; const lw = c.measureText(n.label).width + 8;
    c.fillStyle = 'rgba(10,6,3,.75)'; c.fillRect(n.x - lw / 2, n.y + 13, lw, 11);
    drawText(c, n.label, n.x, n.y + 15, 8, open ? '#fff' : '#b0a0c8', '#241a10', 'center');
    if (cur) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(n.x, n.y, 15 + Math.sin(Game.time * 6) * 2, 0, 7); c.stroke(); c.lineWidth = 1; }
  });
  const here = BURROW_NODES[Game.burrowHere()];
  const spr = Sprites.noah.down[0]; dspr(c, spr, Math.round(here.x - 9), Math.round(here.y - 30 + Math.sin(Game.time * 3)));
  if (Sprites.ramsi) dspr(c, Sprites.ramsi, Math.round(here.x + 3), Math.round(here.y - 25));
  const cn = BURROW_NODES[Game.burrowCursor];
  drawText(c, ul[Game.burrowCursor] ? (cn.exit ? 'SPACE: climb up to ' + cn.label : 'SPACE: dig to ' + cn.label) : 'Locked — reach it the long way first!', VW / 2, VH - 28, 9, ul[Game.burrowCursor] ? '#f8e858' : '#f898c8', '#241a10', 'center');
  drawText(c, 'arrows: choose   ESC: back', VW / 2, VH - 15, 8, '#9adcf8', '#241a10', 'center');
};
if (typeof G !== 'undefined' && G.NQ) { G.NQ.BURROW_NODES = BURROW_NODES; }
