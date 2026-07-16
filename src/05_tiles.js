"use strict";
// ================= tiles v2: organic terrain, autotile fringes, contoured cliffs =================
const TILEDEFS = {
  grass:   {},
  path:    {},
  sand:    {},
  dust:    {},                                  // canyon terracotta ground
  snow:    {},
  ice:     { slick: true },
  water:   { swim: true, hole: true, anim: true },
  deep:    { solid: true, anim: true },
  rock:    { solid: true },
  tree:    { solid: true, prop: 'tree' },
  pine:    { solid: true, prop: 'pine' },
  palm:    { solid: true, prop: 'palm' },
  bush:    {},                                  // walk-through ground cover (was a solid 'grass' wall)
  stump:   {},                                  // walk-through decor
  fence:   { solid: true },
  flowers: {},
  pebbles: {},                                  // walkable decor (grass)
  shell:   {},                                  // walkable decor (sand)
  rubble:  {},                                  // walkable decor (dungeon)
  stal:    { solid: true },                     // stalagmite (cave)
  chasm:   { hole: true },
  rift:    { rift: true, anim: true },
  voidfloor:{ anim: true },
  crater:  { anim: true },
  warp:    { anim: true },
  stair:   { stair: true },
  wall:    { solid: true },
  floor:   {},
  wood:    {},
  seafloor:{},
  openwater:{},                                 // deep OPEN water: renders transparent so the painted backdrop shows (side-scroller depth)
  coral:   { solid: true },
  kelp:    {},
  gate:    { gate: true, anim: true },
  doorL:   { door: 'lock' },
  doorB:   { door: 'boss' },
  doorF:   { door: 'flag' },
  switch:  { switch: true },
  bridge:  {},
  statue:  { solid: true },
  berrybed:{},
  cloud:   { solid: true },
  skyfloor:{ anim: true },
  crack:   { solid: true, crack: true },   // smashable with the RAM SUIT
  // ---- World 2: The Underburrow ----
  soil:     {},                                 // walkable burrow floor
  rootwall: { solid: true },                    // braided-root wall
  glowvein: {},                                 // faint vein path (brightens in Ramsi's Glow)
  crystal:  { solid: true },                    // crystal wall
  softblock:{ solid: true, soft: true },        // Roll-Charge smashes it
  holegap:  { solid: true, hole2: true },       // burrow-hole: blocks Noah; shrunk-Ramsi only
  bouncecap:{},                                 // mushroom bounce-pad marker
  updraft:  {},                                 // glide-lane / updraft marker
  // ---- World 3: Cogwerk City ----
  cogfloor: {},                                 // brass riveted street-plate (walkable)
  gearwall: { solid: true },                    // machinery building wall (gear emblem)
  pipe:     { solid: true },                    // copper pipe wall
  pipefe:   { solid: true },                    // iron pipe
  pipebr:   { solid: true },                    // brass pipe
  bigpipe:  { solid: true },                    // fat main pipe (vertical)
  bigpipeh: { solid: true },                    // fat main pipe (horizontal)
  bigpipe_dr: { solid: true }, bigpipe_dl: { solid: true }, bigpipe_ur: { solid: true }, bigpipe_ul: { solid: true },  // elbows
  wetpipe:  { anim: true },                     // a carved channel running with water (walkable)
  cog:      { solid: true },                    // big gear pillar
  steam:    { anim: true },                     // iron grate venting steam (walkable)
  towerwall:{ solid: true },                    // ornate brass clock-tower panel (HD art overrides)
  towergear:{ solid: true },                    // brass gear-emblem crown panel (HD art overrides)
  // ---- World 3: The High Roofs (rooftop level) ----
  roof:     {},                                 // walkable rooftop deck (tar + seams)
  roofb:    {},                                 // lighter rooftop variant
  parapet:  { solid: true },                    // roof-edge wall / ledge rim (can't cross)
  skygap:   { hole: true },                     // the VOID between buildings — fall (lose a heart, respawn)
  acunit:   { solid: true },                    // rooftop AC/vent box (obstacle)
  skylight: {},                                 // glass skylight panel (walkable, slick look)
  sky:      {},                                 // open SUNSET SKY backdrop (decorative; tower walls keep the player off it)
};
const CLIFF_PALS = {
  dirt:  { face:'#9c6b38', dark:'#754d26', lip:'#caa05c', rim:'#5e3c1c', extra:'#b5854c' },
  snow:  { face:'#8c9ab4', dark:'#67738c', lip:'#c2cce0', rim:'#4e586e', extra:'#dde8f6' },
  sea:   { face:'#2a6a8c', dark:'#1c4a66', lip:'#4a9ab8', rim:'#143850', extra:'#5fc0b8' },
  void:  { face:'#54387c', dark:'#3a2458', lip:'#7c5aa8', rim:'#281846', extra:'#7ce6ff' },
  canyon:{ face:'#b06a3c', dark:'#834c28', lip:'#d89860', rim:'#653a1e', extra:'#c98b58' },
  stone: { face:'#6a6a7a', dark:'#4e4e5c', lip:'#90909e', rim:'#3a3a46', extra:'#7e7e8e' },
};
const TileArt = { variants: {}, built: false };
const TILE_VARS = 5;   // texture variants per tile id

function paintTileBase(x, id, vseed, frame) {
  const r = sRandom(vseed * 7919 + 13);
  const px = (i, j, col) => { x.fillStyle = col; x.fillRect(i, j, 1, 1); };
  const fill = (col) => { x.fillStyle = col; x.fillRect(0, 0, 16, 16); };
  const speck = (n, col, col2) => { for (let i = 0; i < n; i++) { const a = (r() * 16) | 0, b = (r() * 16) | 0; px(a, b, r() < 0.5 || !col2 ? col : col2); } };
  // a pair of grass blades (1x2 dark + light tip)
  const blade = (a, b) => { px(a, b, '#3f9434'); px(a, b - 1, '#69ca58'); };
  switch (id) {
    case 'grass': case 'flowers': case 'tree': case 'bush': case 'pebbles': case 'stump': {
      fill('#55b24a');
      // soft mottling, no checkerboard: tiny two-tone clumps
      for (let n = 0; n < 3; n++) { const a = 1 + (r() * 13 | 0), b = 1 + (r() * 13 | 0); px(a, b, '#4da243'); px(a + 1, b, '#4da243'); if (r() < 0.5) px(a, b + 1, '#4da243'); }
      for (let n = 0; n < 2; n++) px(1 + (r() * 14 | 0), 1 + (r() * 14 | 0), '#62c054');
      // a blade tuft or two
      blade(2 + (r() * 11 | 0), 3 + (r() * 10 | 0));
      if (vseed % 2) blade(2 + (r() * 11 | 0), 3 + (r() * 10 | 0));
      if (vseed === 3) { const a = 3 + (r() * 9 | 0), b = 3 + (r() * 9 | 0); px(a, b, '#46a03c'); px(a + 1, b + 1, '#46a03c'); px(a + 1, b, '#5fbe50'); }
      if (id === 'flowers') {
        for (let f = 0; f < 2; f++) {
          const a = 2 + (r() * 11 | 0), b = 3 + (r() * 10 | 0);
          const col = ['#6f9ff2', '#ffffff', '#f898c8', '#ffb84d'][(vseed + f) % 4];
          px(a, b - 1, col); px(a - 1, b, col); px(a + 1, b, col); px(a, b + 1, col); px(a, b, '#f8e858');
          px(a, b + 2, '#3f9434');
        }
      }
      if (id === 'pebbles') {
        for (let n = 0; n < 3; n++) { const a = 2 + (r() * 11 | 0), b = 3 + (r() * 10 | 0); px(a, b, '#9aa2ae'); px(a + 1, b, '#c2c8d2'); px(a, b + 1, '#777e8a'); }
      }
      break; }
    case 'fence': {
      // grass base + a real wooden rail fence (chunky storybook posts)
      fill('#55b24a');
      for (let n = 0; n < 2; n++) { const a = 1 + (r() * 13 | 0), b = 9 + (r() * 5 | 0); px(a, b, '#4da243'); px(a + 1, b, '#4da243'); }
      x.fillStyle = '#241a33'; x.fillRect(2, 2, 4, 12); x.fillRect(10, 2, 4, 12);  // post outlines
      x.fillStyle = '#241a33'; x.fillRect(0, 5, 16, 3); x.fillRect(0, 10, 16, 3);  // rail outlines
      x.fillStyle = '#a8703c'; x.fillRect(3, 3, 2, 10); x.fillRect(11, 3, 2, 10);  // posts
      x.fillStyle = '#c08850'; x.fillRect(3, 3, 1, 10); x.fillRect(11, 3, 1, 10);  // post light side
      x.fillStyle = '#c08850'; x.fillRect(0, 6, 16, 1); x.fillRect(0, 11, 16, 1);  // rails (lit)
      x.fillStyle = '#8a5c2c'; x.fillRect(0, 7, 16, 1); x.fillRect(0, 12, 16, 1);  // rails (shade)
      x.fillStyle = '#241a33'; x.fillRect(2, 2, 4, 1); x.fillRect(10, 2, 4, 1);    // post caps
      x.fillStyle = '#deb275'; px(3, 2, '#deb275'); px(11, 2, '#deb275');
      break; }
    case 'path': {
      fill('#d2a161');
      speck(5, '#c0904f', '#deb275');
      // faint wheel-rut waves
      for (const yy of [5, 11]) for (let i = 0; i < 16; i += 2) px(i, yy + ((i / 4 | 0) % 2), '#c79552');
      if (r() < 0.6) { const a = 2 + (r() * 12 | 0), b = 2 + (r() * 12 | 0); px(a, b, '#b78d52'); px(a + 1, b, '#e3bd80'); }
      break; }
    case 'sand': case 'palm': case 'shell': {
      fill('#eed694');
      speck(4, '#e2c47e');
      // dotted ripple curves (soft)
      const yy = 3 + (vseed % 3) * 4;
      for (let i = 1; i < 15; i += 3) px(i, yy + Math.round(Math.sin(i * 0.8 + vseed) * 1.2), '#dcc07c');
      if (r() < 0.4) px(2 + (r() * 12 | 0), 2 + (r() * 12 | 0), '#fff3c0');
      if (id === 'shell') {
        const a = 4 + (r() * 7 | 0), b = 5 + (r() * 6 | 0);
        px(a, b, '#f8b8c8'); px(a + 1, b, '#ffffff'); px(a, b + 1, '#e89aae'); px(a + 1, b + 1, '#f8d8e0'); px(a - 1, b + 1, '#cf8a98');
      }
      break; }
    case 'dust': {
      // canyon terracotta: warm strata flecks + cracks
      fill(vseed % 2 ? '#c98b58' : '#c4854f');
      speck(5, '#b27744', '#dba26c');
      if (r() < 0.5) { const a = 2 + (r() * 11 | 0), b = 2 + (r() * 11 | 0); px(a, b, '#a76b3c'); px(a + 1, b, '#a76b3c'); px(a + 2, b + 1, '#a76b3c'); }
      if (vseed === 4) { const a = 3 + (r() * 9 | 0), b = 3 + (r() * 9 | 0); px(a, b, '#8f5830'); px(a + 1, b + 1, '#8f5830'); px(a + 2, b + 1, '#8f5830'); }
      break; }
    case 'snow': case 'pine': case 'berrybed': {
      fill('#f1f4fa');
      // soft blue shade drifts
      x.fillStyle = '#dce6f4';
      for (let n = 0; n < 2; n++) { const a = (r() * 12) | 0, b = (r() * 12) | 0; x.fillRect(a, b, 3 + (r() * 3 | 0), 2); }
      speck(3, '#ccd8ea', '#ffffff');
      if (r() < 0.5) px(2 + (r() * 12 | 0), 2 + (r() * 12 | 0), '#ffffff'); // sparkle
      if (id === 'berrybed') { fill('#e6d8f2'); x.fillStyle = '#d4bfe8'; for (let n = 0; n < 3; n++) { const a = (r() * 12) | 0, b = (r() * 12) | 0; x.fillRect(a, b, 3, 2); } speck(5, '#c8aade', '#fff'); }
      break; }
    case 'ice':
      fill('#aadcf2'); speck(3, '#d8f0fc');
      x.fillStyle = '#d8f0fc'; x.fillRect(2 + vseed % 4, 2, 1, 5); x.fillRect(9, 8, 1, 4);
      for (let i = 0; i < 6; i++) px(3 + i + (vseed % 3), 12 - i, '#e2f4ff'); // diagonal sheen
      break;
    case 'water': {
      fill(frame ? '#3f7fd4' : '#3a78cc');
      // curvy glints
      const off = frame ? 2 : 0;
      for (let i = 0; i < 5; i++) px(2 + off + i, 4 + Math.round(Math.sin(i * 1.3 + vseed) * 1.0), '#6fa7ec');
      for (let i = 0; i < 4; i++) px(9 - off + i, 11 + Math.round(Math.sin(i * 1.5 + vseed * 2) * 1.0), '#6fa7ec');
      if (vseed % 2 === frame) px(12, 3, '#cfe8ff');
      break; }
    case 'deep':
      fill(frame ? '#2b5cab' : '#2856a3');
      x.fillStyle = '#3f7fd4'; x.fillRect(frame ? 8 : 4, 6, 3, 1);
      if (vseed === 2) px(11, 12, '#3f7fd4');
      break;
    case 'rock': {
      // a chunky rounded boulder with shadowed gaps (no more flat gray box)
      fill('#3a3542');
      x.fillStyle = '#241a33'; x.beginPath(); x.arc(8, 9, 7.6, 0, 7); x.fill();
      x.fillStyle = '#8a8a96'; x.beginPath(); x.arc(8, 9, 6.6, 0, 7); x.fill();
      x.fillStyle = '#a6a6b2'; x.beginPath(); x.arc(6, 7, 3.6, 0, 7); x.fill();
      x.fillStyle = '#bdbdc8'; x.beginPath(); x.arc(5.5, 6, 1.6, 0, 7); x.fill();
      px(9 + (vseed % 3), 11, '#5f5f6c'); px(10 + (vseed % 3), 12, '#5f5f6c'); px(11, 9, '#5f5f6c');
      x.fillStyle = '#6e6e7a'; x.fillRect(4, 13, 3, 1);
      px(1, 14, '#55505e'); px(14, 2, '#55505e'); px(14, 14, '#55505e');
      break; }
    case 'crack': {
      fill('#6a6a7a'); speck(4, '#5a5a68', '#7e7e8e');
      x.fillStyle = '#4e4e5c'; x.fillRect(0,0,16,1); x.fillRect(0,15,16,1); x.fillRect(0,0,1,16); x.fillRect(15,0,1,16);
      x.fillStyle = '#54545f'; x.fillRect(0,5,16,1); x.fillRect(0,10,16,1); x.fillRect(7,0,1,5); x.fillRect(3,5,1,5); x.fillRect(11,5,1,5); x.fillRect(7,10,1,6);
      x.fillStyle = '#241a33'; const ck=[8,9,7,9,8,10,8,7]; for (let k=0;k<8;k++) x.fillRect(ck[k], 1+k*2, 1, 2);
      px(6,4,'#241a33'); px(11,9,'#241a33'); px(5,12,'#241a33'); px(10,13,'#2c2040');
      break; }
    case 'stal': {
      // cave stalagmite on dark stone
      fill('#2c2438'); speck(3, '#241a33');
      x.fillStyle = '#241a33'; x.beginPath(); x.moveTo(8, 1); x.lineTo(13, 15); x.lineTo(3, 15); x.fill();
      x.fillStyle = '#7c8494'; x.beginPath(); x.moveTo(8, 3); x.lineTo(12, 14); x.lineTo(4, 14); x.fill();
      x.fillStyle = '#9aa2b2'; x.fillRect(7, 4, 1, 9);
      x.fillStyle = '#5c6474'; x.fillRect(9, 8, 1, 5);
      break; }
    case 'chasm':
      fill('#181020'); speck(2, '#241a33');
      if (vseed === 1) px(4 + (vseed * 3) % 8, 12, '#2c2040');
      break;
    case 'rift': {
      const g = x.createRadialGradient(8, 8, 1, 8, 8, 11);
      g.addColorStop(0, '#05030c'); g.addColorStop(1, '#140a26');
      x.fillStyle = g; x.fillRect(0, 0, 16, 16);
      for (let s = 0; s < 5; s++) { const a = (r() * 16) | 0, b = (r() * 16) | 0; x.fillStyle = s % 2 ? 'rgba(180,200,255,.7)' : 'rgba(255,180,230,.6)'; x.fillRect(a, b, 1, 1); }
      if (frame) { x.fillStyle = '#9fe8ff'; x.fillRect((vseed * 7 + 2) % 14, (vseed * 5 + 5) % 12, 2, 1); }
      break; }
    case 'voidfloor': {
      const g = x.createLinearGradient(0, 0, 16, 16);
      g.addColorStop(0, vseed % 2 ? '#3a2a66' : '#34255c'); g.addColorStop(1, '#48306e');
      x.fillStyle = g; x.fillRect(0, 0, 16, 16);
      if (vseed % 3 === 0) { x.fillStyle = 'rgba(120,90,180,.14)'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 0, 1, 16); }
      x.fillStyle = 'rgba(150,90,200,.18)';
      for (let s = 0; s < 3; s++) { const a = (r() * 13) | 0, b = (r() * 13) | 0; x.fillRect(a, b, 3, 2); }
      for (let s = 0; s < 4; s++) { const a = (r() * 16) | 0, b = (r() * 16) | 0; x.fillStyle = (frame && s === 0) ? '#fff' : 'rgba(220,210,255,.7)'; x.fillRect(a, b, 1, 1); }
      if (frame) { x.fillStyle = '#cfe6ff'; x.fillRect((vseed * 5 + 3) % 14, (vseed * 3 + 2) % 14, 1, 1); }
      break; }
    case 'crater': {
      const g = x.createLinearGradient(0, 0, 16, 16); g.addColorStop(0, '#34255c'); g.addColorStop(1, '#48306e');
      x.fillStyle = g; x.fillRect(0, 0, 16, 16);
      x.fillStyle = '#241a33'; x.beginPath(); x.arc(8, 8, 6, 0, 7); x.fill();
      x.fillStyle = '#2a1c44'; x.beginPath(); x.arc(8, 8, 5, 0, 7); x.fill();
      x.fillStyle = frame ? 'rgba(120,230,240,.55)' : 'rgba(90,180,220,.45)'; x.beginPath(); x.arc(8, 8, 2.4, 0, 7); x.fill();
      x.strokeStyle = 'rgba(160,120,210,.5)'; x.beginPath(); x.arc(8, 8, 6, 0, 7); x.stroke();
      break; }
    case 'warp': {
      const g = x.createRadialGradient(8, 8, 0, 8, 8, 8);
      g.addColorStop(0, frame ? '#bfffff' : '#80f0ff'); g.addColorStop(0.5, '#5a3ca0'); g.addColorStop(1, '#241a44');
      x.fillStyle = g; x.fillRect(0, 0, 16, 16);
      x.lineWidth = 1;
      for (let ri = 0; ri < 3; ri++) {
        x.strokeStyle = ri % 2 ? 'rgba(220,120,230,.8)' : 'rgba(120,240,255,.85)';
        x.beginPath(); x.arc(8, 8, 6 - ri * 1.8, frame * 0.6 + ri, frame * 0.6 + ri + 4.6); x.stroke();
      }
      x.fillStyle = '#fff'; x.fillRect(8, 8, 1, 1);
      break; }
    case 'stair': {
      fill('#b89868');
      for (let s = 0; s < 4; s++) { x.fillStyle = s % 2 ? '#a08050' : '#cab080'; x.fillRect(0, s * 4, 16, 3); x.fillStyle = '#705830'; x.fillRect(0, s * 4 + 3, 16, 1); x.fillStyle = '#d8c098'; x.fillRect(1, s * 4, 14, 1); }
      x.fillStyle = '#705830'; x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
      break; }
    case 'wall': {
      // staggered stone bricks with top-lit faces
      fill('#473a56');
      for (let row = 0; row < 4; row++) {
        const off = (row % 2) * 4;
        for (let bx = -4 + off; bx < 16; bx += 8) {
          x.fillStyle = '#5e4d70'; x.fillRect(bx + 1, row * 4 + 1, 6, 3);
          x.fillStyle = '#73608a'; x.fillRect(bx + 1, row * 4 + 1, 6, 1);
          x.fillStyle = '#503f63'; x.fillRect(bx + 1, row * 4 + 3, 6, 1);
        }
      }
      if (vseed === 2) { px(5, 6, '#3a2e48'); px(6, 7, '#3a2e48'); px(7, 9, '#3a2e48'); }       // crack
      if (vseed === 4) { px(11, 2, '#8a76a2'); px(12, 2, '#8a76a2'); }                          // glint
      break; }
    case 'floor': case 'rubble': {
      // big stone slabs (2x2 per tile), slightly varied
      fill(vseed % 2 ? '#a8b0be' : '#a0a8b6');
      x.fillStyle = '#848ca0';
      x.fillRect(0, 7 + (vseed % 2), 16, 1); x.fillRect(7 + ((vseed * 3) % 2), 0, 1, 16);
      x.fillStyle = '#b8c0cc'; x.fillRect(1, 1, 5, 1); x.fillRect(9, 9, 5, 1);
      speck(2, '#909aa8');
      if (vseed === 1) { px(3, 11, '#737d8e'); px(4, 12, '#737d8e'); px(5, 12, '#737d8e'); }    // crack
      if (vseed === 3) { px(12, 3, '#7d9a7a'); px(13, 4, '#7d9a7a'); }                          // moss
      if (id === 'rubble') {
        for (let n = 0; n < 4; n++) { const a = 2 + (r() * 11 | 0), b = 2 + (r() * 11 | 0); px(a, b, '#7c8494'); px(a + 1, b, '#c0c8d4'); }
        x.fillStyle = '#737d8e'; x.fillRect(4 + (vseed % 4), 10, 3, 2);
      }
      break; }
    case 'wood':
      fill('#b07a48');
      x.fillStyle = '#9a6638'; x.fillRect(0, 5, 16, 1); x.fillRect(0, 11, 16, 1); x.fillRect(vseed % 2 ? 4 : 11, 0, 1, 5);
      x.fillStyle = '#c08850'; x.fillRect(0, 6, 16, 1);
      speck(2, '#c08850');
      if (vseed === 2) { px(8, 8, '#83552c'); px(9, 8, '#83552c'); px(9, 9, '#83552c'); }       // knot
      break;
    case 'cogfloor': {
      fill(['#9c7228', '#a87a26', '#946c24'][vseed % 3]);
      x.fillStyle = '#6e4e18'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 0, 1, 16);             // plate seam (dark)
      x.fillStyle = '#c89a3e'; x.fillRect(0, 1, 16, 1); x.fillRect(1, 0, 1, 16);             // bevel highlight
      for (const rv of [[3, 3], [12, 3], [3, 12], [12, 12]]) { px(rv[0], rv[1], '#5a3e14'); px(rv[0] - 1, rv[1] - 1, '#e6c060'); }
      speck(3, '#876018', '#b88a30');
      if (vseed === 2) { x.fillStyle = '#7a5a1c'; x.fillRect(6, 8, 5, 1); }
      break;
    }
    case 'gearwall': case 'towerwall': case 'towergear': {
      fill('#5a4628');
      x.fillStyle = '#71582e'; x.fillRect(1, 1, 14, 14);                                     // brass panel
      x.fillStyle = '#8c6c38'; x.fillRect(1, 1, 14, 1); x.fillRect(1, 1, 1, 14);             // bevel
      x.fillStyle = '#3a2c16'; x.fillRect(1, 14, 14, 1); x.fillRect(14, 1, 1, 14);           // shadow
      for (const rv of [[2, 2], [13, 2], [2, 13], [13, 13]]) px(rv[0], rv[1], '#e6c060');    // corner rivets
      const motif = vseed % 6;
      if (motif === 3) {                       // a gear emblem
        for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; px(Math.round(8 + Math.cos(a) * 6), Math.round(8 + Math.sin(a) * 6), '#caa044'); }
        x.fillStyle = '#caa044'; x.beginPath(); x.arc(8, 8, 4, 0, 7); x.fill();
        x.fillStyle = '#8c6c38'; x.beginPath(); x.arc(8, 8, 2.4, 0, 7); x.fill();
        x.fillStyle = '#241a33'; x.beginPath(); x.arc(8, 8, 1.2, 0, 7); x.fill();
      } else if (motif === 4) {                // a pressure gauge
        x.fillStyle = '#3a2c16'; x.beginPath(); x.arc(8, 8, 4.5, 0, 7); x.fill();
        x.fillStyle = '#cdd2c4'; x.beginPath(); x.arc(8, 8, 3.4, 0, 7); x.fill();
        x.strokeStyle = '#b03030'; x.lineWidth = 1; x.beginPath(); x.moveTo(8, 8); x.lineTo(8 + 2.4, 8 - 1.6); x.stroke();
        px(8, 8, '#241a33');
      } else if (motif === 5) {                // a vent grille
        x.fillStyle = '#3a2c16'; for (let i = 4; i <= 11; i += 2) x.fillRect(i, 4, 1, 8);
      } else {                                 // plain riveted plate (the common case)
        x.fillStyle = '#3a2c16'; x.fillRect(4, 7, 8, 1);
        px(5, 5, '#8c6c38'); px(10, 10, '#8c6c38');
      }
      break;
    }
    case 'pipe': {
      fill('#3a2c18');
      x.fillStyle = '#7a4628'; x.fillRect(3, 0, 10, 16);
      x.fillStyle = '#a8623a'; x.fillRect(4, 0, 3, 16);
      x.fillStyle = '#d88a5a'; x.fillRect(5, 0, 1, 16);                                      // shine
      x.fillStyle = '#5a321c'; x.fillRect(11, 0, 2, 16);                                     // shadow
      x.fillStyle = '#8a5230'; x.fillRect(2, 4, 12, 2); x.fillRect(2, 11, 12, 2);            // couplings
      x.fillStyle = '#c07a4a'; x.fillRect(2, 4, 12, 1); x.fillRect(2, 11, 12, 1);
      break;
    }
    case 'pipefe': {
      fill('#26282c'); x.fillStyle = '#5a5e66'; x.fillRect(3, 0, 10, 16);
      x.fillStyle = '#828892'; x.fillRect(4, 0, 3, 16); x.fillStyle = '#b0b6bf'; x.fillRect(5, 0, 1, 16);
      x.fillStyle = '#383b40'; x.fillRect(11, 0, 2, 16);
      x.fillStyle = '#6a6e76'; x.fillRect(2, 4, 12, 2); x.fillRect(2, 11, 12, 2);
      break;
    }
    case 'pipebr': {
      fill('#2e2410'); x.fillStyle = '#a8822a'; x.fillRect(3, 0, 10, 16);
      x.fillStyle = '#caa044'; x.fillRect(4, 0, 3, 16); x.fillStyle = '#e8c870'; x.fillRect(5, 0, 1, 16);
      x.fillStyle = '#6e5418'; x.fillRect(11, 0, 2, 16);
      x.fillStyle = '#b8902e'; x.fillRect(2, 4, 12, 2); x.fillRect(2, 11, 12, 2);
      break;
    }
    case 'bigpipe': {
      fill('#241a10'); x.fillStyle = '#7a4628'; x.fillRect(1, 0, 14, 16);
      x.fillStyle = '#a8623a'; x.fillRect(2, 0, 5, 16); x.fillStyle = '#d88a5a'; x.fillRect(3, 0, 2, 16);
      x.fillStyle = '#5a321c'; x.fillRect(12, 0, 3, 16);
      x.fillStyle = '#8a5230'; x.fillRect(0, 5, 16, 3); x.fillRect(0, 11, 16, 3);
      x.fillStyle = '#c07a4a'; x.fillRect(0, 5, 16, 1); x.fillRect(0, 11, 16, 1);
      break;
    }
    case 'bigpipeh': {
      fill('#241a10'); x.fillStyle = '#7a4628'; x.fillRect(0, 1, 16, 14);
      x.fillStyle = '#a8623a'; x.fillRect(0, 2, 16, 5); x.fillStyle = '#d88a5a'; x.fillRect(0, 3, 16, 2);
      x.fillStyle = '#5a321c'; x.fillRect(0, 12, 16, 3);
      x.fillStyle = '#8a5230'; x.fillRect(5, 0, 3, 16); x.fillRect(11, 0, 3, 16);
      x.fillStyle = '#c07a4a'; x.fillRect(5, 0, 1, 16); x.fillRect(11, 0, 1, 16);
      break;
    }
    case 'bigpipe_dr': case 'bigpipe_dl': case 'bigpipe_ur': case 'bigpipe_ul': {
      const oL = id === 'bigpipe_dl' || id === 'bigpipe_ul', oU = id === 'bigpipe_ur' || id === 'bigpipe_ul';
      fill('#241a10');
      x.fillStyle = '#5a321c'; x.fillRect(1, 1, 14, 14);
      x.fillStyle = '#7a4628'; x.fillRect(2, 2, 12, 12);
      x.fillStyle = '#a8623a'; x.fillRect(3, 3, 10, 10);
      x.fillStyle = '#d88a5a'; x.fillRect(oL ? 3 : 9, oU ? 3 : 9, 4, 4);
      x.fillStyle = '#241a10'; x.beginPath(); x.arc(oL ? 16 : 0, oU ? 16 : 0, 11, 0, 7); x.fill();
      break;
    }
    case 'wetpipe': {
      fill('#23323e'); x.fillStyle = '#2f6aa8'; x.fillRect(2, 2, 12, 12);
      x.fillStyle = '#3f86c8'; x.fillRect(2, 2, 12, 2);
      const o = frame ? 0 : 4;
      px(4, (3 + o) % 12 + 2, '#bfe4ff'); px(9, (8 + o) % 12 + 2, '#bfe4ff'); px(6, (11 - o + 12) % 12 + 2, '#9fd0f0');
      x.fillStyle = '#6e5424'; x.fillRect(0, 0, 16, 2); x.fillRect(0, 14, 16, 2); x.fillRect(0, 0, 2, 16); x.fillRect(14, 0, 2, 16);
      break;
    }
    case 'cog': {
      fill('#3a2c18');
      x.fillStyle = '#a87a26';
      for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; x.fillRect(Math.round(8 + Math.cos(a) * 7) - 1, Math.round(8 + Math.sin(a) * 7) - 1, 2, 2); }  // teeth
      x.beginPath(); x.arc(8, 8, 6, 0, 7); x.fill();
      x.fillStyle = '#caa044'; x.beginPath(); x.arc(8, 8, 5.4, 0, 7); x.fill();
      x.fillStyle = '#7a5a1c'; x.beginPath(); x.arc(8, 8, 3, 0, 7); x.fill();
      x.fillStyle = '#241a33'; x.beginPath(); x.arc(8, 8, 1.6, 0, 7); x.fill();              // hub
      x.strokeStyle = '#7a5a1c'; x.lineWidth = 1; x.beginPath(); x.moveTo(8, 3); x.lineTo(8, 13); x.moveTo(3, 8); x.lineTo(13, 8); x.stroke();
      break;
    }
    case 'steam': {
      fill('#4a4a52');
      x.fillStyle = '#30303a'; for (let i = 2; i < 14; i += 3) x.fillRect(i, 3, 1, 11);      // grate slots
      x.fillStyle = '#5a5a66'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 0, 1, 16);
      x.fillStyle = 'rgba(225,235,250,.55)';
      if (frame) { x.fillRect(5, 3, 1, 2); x.fillRect(9, 6, 1, 2); x.fillRect(12, 2, 1, 2); }
      else { x.fillRect(4, 6, 1, 2); x.fillRect(8, 3, 1, 2); x.fillRect(11, 7, 1, 2); }
      break;
    }
    case 'roof': {
      fill(['#46454e', '#4b4a54', '#424149'][vseed % 3]);
      x.fillStyle = '#34333b'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 8, 16, 1);             // tar seams
      x.fillStyle = '#56555f'; x.fillRect(0, 1, 16, 1);                                      // seam highlight
      speck(4, '#3a3942', '#52515b');
      if (vseed === 1) { x.fillStyle = '#3e3d46'; x.fillRect(3, 11, 6, 1); }                 // tar patch
      break;
    }
    case 'roofb': {
      fill('#585360');
      x.fillStyle = '#46424c'; for (let i = 1; i < 16; i += 4) x.fillRect(0, i, 16, 1);      // shingle rows
      x.fillStyle = '#6a6572'; x.fillRect(0, 0, 16, 1);
      speck(3, '#4e4a54', '#665f6e');
      break;
    }
    case 'parapet': {
      fill('#6a5a52');                                                                       // brick body
      x.fillStyle = '#7e6c60'; x.fillRect(0, 0, 16, 4);                                       // light cap
      x.fillStyle = '#94837a'; x.fillRect(0, 0, 16, 1);
      x.fillStyle = '#3e342e'; x.fillRect(0, 4, 16, 1);                                       // shadow under cap
      x.fillStyle = '#574a44'; for (let j = 7; j < 16; j += 4) x.fillRect(0, j, 16, 1);       // brick courses
      x.fillStyle = '#3e342e'; for (let j = 6; j < 15; j += 4) x.fillRect(((j * 5) % 13) + 1, j, 1, 3);
      break;
    }
    case 'skygap': {
      x.fillStyle = '#0c0a16'; x.fillRect(0, 0, 16, 16);                                      // the deep VOID
      x.fillStyle = '#15132a'; x.fillRect(0, 0, 16, 6);                                       // hazy upper air
      for (let i = 0; i < 5; i++) { const gx = (r() * 16) | 0, gy = 8 + ((r() * 7) | 0); x.fillStyle = (r() < 0.5 ? '#332c4c' : '#241f3a'); x.fillRect(gx, gy, 1, 1); }
      if (vseed % 2) { x.fillStyle = '#6a5a22'; x.fillRect((r() * 16) | 0, 11 + ((r() * 4) | 0), 1, 1); }   // a lone street light far below
      break;
    }
    case 'acunit': {
      fill('#46454e');
      x.fillStyle = '#8a8a96'; x.fillRect(2, 3, 12, 11);                                      // metal box
      x.fillStyle = '#a6a6b2'; x.fillRect(2, 3, 12, 1); x.fillRect(2, 3, 1, 11);              // bevel
      x.fillStyle = '#5e5e68'; x.fillRect(2, 13, 12, 1); x.fillRect(13, 3, 1, 11);            // shadow
      x.fillStyle = '#3a3a42'; for (let i = 4; i < 13; i += 2) x.fillRect(i, 5, 1, 7);        // grille
      x.fillStyle = '#6a6a76'; x.fillRect(6, 7, 4, 4);                                        // fan hub
      break;
    }
    case 'skylight': {
      fill('#46454e');
      x.fillStyle = '#7fa8c8'; x.fillRect(2, 2, 12, 12);                                      // glass
      x.fillStyle = '#a6d0e8'; x.fillRect(2, 2, 12, 1); x.fillRect(2, 2, 1, 12);
      x.fillStyle = '#5a7e98'; x.fillRect(2, 13, 12, 1); x.fillRect(13, 2, 1, 12);
      x.fillStyle = '#34333b'; x.fillRect(7, 2, 2, 12); x.fillRect(2, 7, 12, 2);              // frame cross
      x.fillStyle = 'rgba(255,255,255,.30)'; x.fillRect(3, 3, 3, 3);                          // glint
      break;
    }
    case 'openwater':
      x.fillStyle = 'rgba(30,96,140,.16)'; x.fillRect(0, 0, 16, 16);   // mostly clear (the backdrop reads through in-world)
      break;
    case 'seafloor':
      fill('#3e8ca6'); speck(5, '#347a92', '#52a2ba');
      if (r() < 0.4) { px(3 + (r() * 9 | 0), 3 + (r() * 9 | 0), '#7ac8da'); }
      if (vseed === 3) { const a = 3 + (r() * 9 | 0), b = 4 + (r() * 8 | 0); px(a, b, '#2e6e84'); px(a + 1, b, '#2e6e84'); px(a + 2, b + 1, '#2e6e84'); } // sand ripple
      break;
    case 'coral': {
      fill('#3e8ca6'); speck(3, '#347a92', '#52a2ba');
      const style = vseed % 4;
      if (style === 0) {        // BRANCHING coral (pink antlers)
        x.fillStyle = '#241a33';
        x.fillRect(7, 4, 2, 11); x.fillRect(3, 8, 2, 7); x.fillRect(11, 6, 2, 9);
        x.fillRect(4, 8, 4, 2); x.fillRect(8, 6, 4, 2);
        x.fillStyle = '#f078a8';
        x.fillRect(7, 3, 2, 11); x.fillRect(3, 7, 2, 7); x.fillRect(11, 5, 2, 9);
        x.fillRect(4, 7, 4, 2); x.fillRect(8, 5, 4, 2);
        x.fillStyle = '#ffc0dc'; x.fillRect(7, 3, 1, 4); x.fillRect(11, 5, 1, 4);
      } else if (style === 1) { // BRAIN coral (round orange, squiggles)
        x.fillStyle = '#241a33'; x.beginPath(); x.arc(8, 9, 7, 0, 7); x.fill();
        x.fillStyle = '#f0883c'; x.beginPath(); x.arc(8, 9, 6, 0, 7); x.fill();
        x.strokeStyle = '#a85820'; x.lineWidth = 1;
        for (let yy = 5; yy < 14; yy += 2) { x.beginPath(); x.moveTo(3, yy); x.bezierCurveTo(6, yy - 1, 10, yy + 2, 13, yy); x.stroke(); }
        x.fillStyle = '#ffc070'; x.fillRect(5, 6, 2, 1);
      } else if (style === 2) { // FAN coral (purple sea fan)
        x.fillStyle = '#241a33'; x.fillRect(7, 9, 2, 6);
        x.fillStyle = '#9a62e0';
        for (let a = -3; a <= 3; a++) { x.fillRect(8 + a, 3 + Math.abs(a), 1, 9 - Math.abs(a)); }
        x.fillStyle = '#c8a0f0'; x.fillRect(8, 3, 1, 7); x.fillRect(6, 4, 1, 5); x.fillRect(10, 4, 1, 5);
        x.fillStyle = '#6a3cb0'; x.fillRect(7, 13, 2, 2);
      } else {                  // SEA ANEMONE / tube sponges (teal-red tendrils)
        x.fillStyle = '#241a33'; x.fillRect(4, 10, 8, 5);
        x.fillStyle = '#e84a6a'; x.fillRect(5, 11, 6, 4);
        x.fillStyle = '#ff90a8';
        for (let i = 0; i < 6; i++) { const tx = 4 + i * 2, h = 4 + ((r() * 5) | 0); x.fillRect(tx, 11 - h, 1, h); }
        x.fillStyle = '#fff0a0'; x.fillRect(6, 12, 1, 1); x.fillRect(9, 13, 1, 1);
      }
      x.fillStyle = 'rgba(20,40,55,.3)'; x.fillRect(0, 14, 16, 2);
      break; }
    case 'kelp':
      fill('#3e8ca6');
      x.fillStyle = '#2a9a6a';
      for (let j = 0; j < 13; j++) px(3 + (vseed % 2) + Math.round(Math.sin(j * 0.7 + vseed) * 1.2), 2 + j, '#2a9a6a');
      for (let j = 0; j < 10; j++) px(10 - (vseed % 2) + Math.round(Math.sin(j * 0.8 + vseed * 2) * 1.2), 5 + j, '#2a9a6a');
      for (let j = 0; j < 12; j++) px(4 + Math.round(Math.sin(j * 0.7 + vseed) * 1.2), 2 + j, '#38c088');
      break;
    case 'gate': {
      fill('#2a6a8c');
      x.fillStyle = frame ? '#40e0e8' : '#80f0f4';
      for (let i = 2; i < 16; i += 5) x.fillRect(i, 0, 2, 16);
      break; }
    case 'doorL': case 'doorB': case 'doorF': {
      fill('#241a33');
      x.fillStyle = '#704820'; x.fillRect(1, 0, 14, 16);
      x.fillStyle = '#8a5c2c'; x.fillRect(2, 1, 12, 14);
      x.fillStyle = '#a06c38'; x.fillRect(2, 1, 12, 2);
      x.fillStyle = '#6e451f'; for (const vx of [5, 8, 11]) x.fillRect(vx, 1, 1, 14);
      x.fillStyle = id === 'doorB' ? '#e84a4a' : id === 'doorF' ? '#40c0b8' : '#f8b800';
      x.fillRect(6, 6, 4, 4); x.fillStyle = '#241a33'; x.fillRect(7, 8, 2, 3);
      break; }
    case 'switch': fill('#9aa2b2'); x.fillStyle = '#241a33'; x.fillRect(3, 3, 10, 10); x.fillStyle = '#c0c8d4'; x.fillRect(4, 4, 8, 8); x.fillStyle = '#e84a4a'; x.fillRect(6, 6, 4, 4); x.fillStyle = '#ff9a9a'; x.fillRect(6, 6, 2, 1); break;
    case 'bridge':
      fill('#a8703c');
      x.fillStyle = '#8a5c2c'; x.fillRect(0, 3, 16, 1); x.fillRect(0, 8, 16, 1); x.fillRect(0, 13, 16, 1);
      x.fillStyle = '#c08850'; x.fillRect(0, 4, 16, 1); x.fillRect(0, 9, 16, 1);
      x.fillStyle = '#704820'; x.fillRect(0, 0, 2, 16); x.fillRect(14, 0, 2, 16);
      x.fillStyle = '#8a5c34'; x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
      break;
    case 'statue': {
      fill('#8e96a6'); x.fillStyle = '#7c8494'; x.fillRect(0, 0, 16, 2); x.fillRect(0, 14, 16, 2);
      x.fillStyle = '#241a33'; x.fillRect(2, 0, 12, 16);
      x.fillStyle = '#9aa2b2'; x.fillRect(3, 1, 10, 14);
      x.fillStyle = '#7c8494'; x.fillRect(5, 2, 6, 4); x.fillRect(4, 7, 8, 7);
      x.fillStyle = '#bcc4d0'; x.fillRect(4, 1, 2, 13);
      break; }
    case 'skyfloor': {
      fill(vseed % 2 ? '#cfe0f2' : '#c2d6ee'); speck(3, '#b0c6e2', '#e8f2ff');
      x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(0, 0, 16, 1);
      x.fillStyle = 'rgba(150,180,220,.4)'; x.fillRect(0, 15, 16, 1);
      if (frame) { x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect((vseed * 5) % 12, (vseed * 3 + 4) % 12, 4, 2); }
      break; }
    case 'cloud': {
      fill('#dfeaf8');
      x.fillStyle = '#fff'; x.beginPath(); x.arc(5, 9, 5, 0, 7); x.arc(11, 8, 5, 0, 7); x.arc(8, 11, 5, 0, 7); x.fill();
      x.fillStyle = 'rgba(170,195,230,.5)'; x.fillRect(0, 13, 16, 3);
      break; }
    case 'soil': {
      fill(vseed % 2 ? '#6b4a2c' : '#5e4026'); speck(5, '#4a3018', '#7c5636');
      x.fillStyle = '#4a3018'; x.fillRect(0, 7 + (vseed % 2), 16, 1);
      if (vseed === 1) { px(3, 11, '#3a2410'); px(4, 12, '#3a2410'); }
      if (vseed === 3) { px(11, 4, '#7c5636'); px(12, 5, '#8a623c'); }
      px(2 + (vseed * 3) % 12, 13, '#3a2410'); px(9, 3 + (vseed % 3), '#3a2410');
      break; }
    case 'rootwall': {
      fill('#3a2616');
      for (let cxx = 1; cxx < 16; cxx += 5) {
        const wob = Math.round(Math.sin(cxx + vseed) * 1.5);
        x.fillStyle = '#241608'; x.fillRect(cxx + wob, 0, 3, 16);
        x.fillStyle = '#5a3c1e'; x.fillRect(cxx + wob, 0, 2, 16);
        x.fillStyle = '#6e4a26'; x.fillRect(cxx + wob, 0, 1, 16);
      }
      for (let j = 2; j < 16; j += 6) px(2 + (j % 5), j, '#7c5636');
      x.fillStyle = 'rgba(20,12,6,.4)'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 15, 16, 1);
      break; }
    case 'glowvein': {
      fill(vseed % 2 ? '#5a3c22' : '#4e3420'); speck(3, '#3a2410');
      x.strokeStyle = frame ? 'rgba(120,240,180,.9)' : 'rgba(80,180,140,.5)'; x.lineWidth = 2;
      x.beginPath(); x.moveTo(3, 0); x.bezierCurveTo(8, 5, 4, 10, 9, 16); x.stroke(); x.lineWidth = 1;
      const gc = frame ? '#bfffe0' : '#7fe6b8';
      px(3, 2, gc); px(6, 7, gc); px(9, 13, gc);
      break; }
    case 'crystal': {
      fill('#2a2050');
      x.fillStyle = '#241a33'; x.beginPath(); x.moveTo(8, 0); x.lineTo(15, 7); x.lineTo(11, 16); x.lineTo(4, 16); x.lineTo(1, 7); x.fill();
      x.fillStyle = vseed % 2 ? '#6a52c8' : '#5a44b0'; x.beginPath(); x.moveTo(8, 1); x.lineTo(13, 7); x.lineTo(10, 15); x.lineTo(5, 15); x.lineTo(3, 7); x.fill();
      x.fillStyle = '#8a74e8'; x.beginPath(); x.moveTo(8, 1); x.lineTo(13, 7); x.lineTo(8, 8); x.fill();
      x.fillStyle = '#c8b8ff'; x.fillRect(7, 2, 1, 5);
      px(10, 9, frame ? '#ffffff' : '#bfa8ff');
      break; }
    case 'softblock': {
      fill('#5e4026');
      x.fillStyle = '#241608'; x.beginPath(); x.arc(8, 9, 7.4, 0, 7); x.fill();
      x.fillStyle = '#7a5230'; x.beginPath(); x.arc(8, 9, 6.4, 0, 7); x.fill();
      x.fillStyle = '#8c6238'; x.beginPath(); x.arc(6, 7, 3, 0, 7); x.fill();
      x.strokeStyle = '#4a3018'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(3, 9); x.lineTo(13, 9); x.moveTo(8, 4); x.lineTo(8, 14); x.stroke();
      px(5, 12, '#a07848'); px(11, 6, '#a07848');
      break; }
    case 'holegap': {
      fill('#3a2616');
      for (let cxx = 1; cxx < 16; cxx += 5) { x.fillStyle = '#241608'; x.fillRect(cxx, 0, 3, 16); x.fillStyle = '#5a3c1e'; x.fillRect(cxx, 0, 2, 16); }
      x.fillStyle = '#140c06'; x.beginPath(); x.arc(8, 9, 4.4, 0, 7); x.fill();
      x.fillStyle = '#0a0603'; x.beginPath(); x.arc(8, 9, 3.2, 0, 7); x.fill();
      x.strokeStyle = '#6e4a26'; x.beginPath(); x.arc(8, 9, 4.4, 0, 7); x.stroke();
      break; }
    case 'bouncecap': {
      fill(vseed % 2 ? '#6b4a2c' : '#5e4026'); speck(3, '#4a3018');
      x.fillStyle = '#241a33'; x.fillRect(6, 9, 4, 6);
      x.fillStyle = '#e8e0d0'; x.fillRect(6, 9, 3, 6);
      x.fillStyle = '#241a33'; x.beginPath(); x.ellipse(8, 8, 7, 4.4, 0, 0, 7); x.fill();
      x.fillStyle = '#e8589a'; x.beginPath(); x.ellipse(8, 7, 6.4, 4, 0, 0, 7); x.fill();
      x.fillStyle = '#ff90c0'; x.beginPath(); x.ellipse(6, 6, 2.4, 1.4, 0, 0, 7); x.fill();
      px(5, 6, '#ffffff'); px(10, 5, '#ffd0e8'); px(11, 8, '#ffd0e8');
      break; }
    case 'updraft': {
      fill(vseed % 2 ? '#5a4028' : '#52391f');
      x.fillStyle = frame ? 'rgba(180,230,255,.45)' : 'rgba(150,210,245,.3)';
      for (let k = 0; k < 3; k++) { const ax = 3 + k * 5; x.fillRect(ax, frame ? 4 : 10, 1, 4); x.fillRect(ax + 1, frame ? 9 : 2, 1, 3); }
      px(4, 2, '#bfe8ff'); px(9, 9, '#bfe8ff'); px(13, 5, '#bfe8ff');
      break; }
    case 'sky': { fill('#f0a85a'); break; }      // warm base; drawWorld overlays the per-row sunset gradient + clouds + sun
    default: fill('#f0f');
  }
}

// ---------- terrain blending: which ground a tile "is", priorities, fringe casters ----------
const GROUND_OF = {
  tree:'grass', bush:'grass', flowers:'grass', fence:'grass', pebbles:'grass', stump:'grass',
  pine:'snow', berrybed:'snow', palm:'sand', shell:'sand', kelp:'seafloor', coral:'seafloor',
  crater:'voidfloor', warp:'voidfloor', rubble:'floor', stal:'floor', statue:'floor',
};
const BLEND_PRI = {
  chasm:0, water:1, seafloor:1.5, sand:2, dust:2.5, wood:3, floor:3, voidfloor:3, skyfloor:3,
  path:4, ice:4.5, grass:5, flowers:5, snow:6, berrybed:6,
};
// terrains that paint fringe overhangs onto lower-priority neighbors
const FRINGE_CASTERS = ['grass', 'snow', 'sand', 'path', 'dust', 'floor', 'voidfloor', 'skyfloor', 'seafloor'];
// terrains that accept fringes
const FRINGE_RECV = { grass:1, flowers:1, path:1, sand:1, dust:1, snow:1, berrybed:1, water:1, chasm:1, seafloor:1, kelp:1, voidfloor:1, crater:1, floor:1, wood:1, skyfloor:1, ice:1, shell:1, pebbles:1, rubble:1 };
const FRINGE_SEAM = {
  grass:'rgba(30,62,30,.85)', snow:'rgba(118,138,176,.8)', sand:'rgba(168,134,76,.8)',
  path:'rgba(146,104,58,.85)', dust:'rgba(134,82,44,.85)', floor:'rgba(78,84,102,.8)',
  voidfloor:'rgba(38,26,70,.85)', skyfloor:'rgba(142,164,202,.8)', seafloor:'rgba(38,92,112,.8)',
};
// large-scale ground tint (sun patches / mossy shade) applied per tile
const TONE_TILES = { grass:1, flowers:1, snow:1, sand:1, dust:1, path:1, seafloor:1, kelp:1, voidfloor:1, pebbles:1, shell:1, berrybed:1 };

function fringeDepths(seedBase) {
  const r = sRandom(seedBase);
  const ph = r() * 6.28, ph2 = r() * 6.28, amp = 1.1 + r() * 0.9;
  const d = [];
  for (let i = 0; i < 16; i++) {
    d.push(Math.max(1, Math.min(6, Math.round(2.6 + amp * Math.sin(i * 0.52 + ph) + 1.0 * Math.sin(i * 1.27 + ph2)))));
  }
  return d;
}
function makeFringe(id, edge, variant) {
  const c = mkCanvas(16, 16), x = c.getContext('2d');
  paintTileBase(x, id, variant % TILE_VARS, 0);
  const depths = fringeDepths(id.length * 131 + edge * 47 + variant * 7 + 3);
  // mask: keep only the scalloped band along the edge
  const m = mkCanvas(16, 16), mx = m.getContext('2d');
  mx.fillStyle = '#fff';
  for (let i = 0; i < 16; i++) {
    const d = depths[i];
    if (edge === 0) mx.fillRect(i, 0, 1, d);
    else if (edge === 1) mx.fillRect(i, 16 - d, 1, d);
    else if (edge === 2) mx.fillRect(0, i, d, 1);
    else mx.fillRect(16 - d, i, d, 1);
  }
  x.globalCompositeOperation = 'destination-in';
  x.drawImage(m, 0, 0);
  x.globalCompositeOperation = 'source-over';
  // dark seam tracing the scallop (the chunky storybook outline)
  x.fillStyle = FRINGE_SEAM[id] || 'rgba(36,26,51,.7)';
  for (let i = 0; i < 16; i++) {
    const d = depths[i];
    if (edge === 0) x.fillRect(i, d - 1, 1, 1);
    else if (edge === 1) x.fillRect(i, 16 - d, 1, 1);
    else if (edge === 2) x.fillRect(d - 1, i, 1, 1);
    else x.fillRect(16 - d, i, 1, 1);
  }
  return c;
}
function makeFoam(edge, frameN, variant) {
  // scalloped animated surf along a shore edge of a water tile
  const c = mkCanvas(16, 16), x = c.getContext('2d');
  const r = sRandom(edge * 31 + variant * 13 + frameN * 5 + 11);
  const ph = r() * 6.28;
  for (let i = 0; i < 16; i++) {
    const d = Math.max(1, Math.round(1.6 + 1.1 * Math.sin(i * 0.7 + ph + frameN * 0.9)));
    x.fillStyle = 'rgba(255,255,255,.85)';
    if (edge === 0) x.fillRect(i, 0, 1, d);
    else if (edge === 1) x.fillRect(i, 16 - d, 1, d);
    else if (edge === 2) x.fillRect(0, i, d, 1);
    else x.fillRect(16 - d, i, d, 1);
    // trailing ripple px
    if (i % 3 === frameN) {
      x.fillStyle = 'rgba(220,240,255,.5)';
      if (edge === 0) x.fillRect(i, d, 1, 1);
      else if (edge === 1) x.fillRect(i, 15 - d, 1, 1);
      else if (edge === 2) x.fillRect(d, i, 1, 1);
      else x.fillRect(15 - d, i, 1, 1);
    }
  }
  // a bubble or two
  for (let n = 0; n < 2; n++) {
    const a = (r() * 14 | 0) + 1;
    x.fillStyle = 'rgba(255,255,255,.6)';
    if (edge === 0) x.fillRect(a, 2 + (r() * 2 | 0), 1, 1);
    else if (edge === 1) x.fillRect(a, 12 + (r() * 2 | 0), 1, 1);
    else if (edge === 2) x.fillRect(2 + (r() * 2 | 0), a, 1, 1);
    else x.fillRect(12 + (r() * 2 | 0), a, 1, 1);
  }
  return c;
}

function buildTileArt() {
  for (const id of Object.keys(TILEDEFS)) {
    TileArt.variants[id] = [];
    for (let f = 0; f < 2; f++) for (let v = 0; v < TILE_VARS; v++) {
      const c = mkCanvas(16, 16); paintTileBase(c.getContext('2d'), id, v, f);
      TileArt.variants[id].push(c);
    }
  }
  // fringes[casterId][edge][variant]
  TileArt.fringes = {};
  for (const id of FRINGE_CASTERS) {
    TileArt.fringes[id] = [];
    for (let e = 0; e < 4; e++) {
      const vs = [];
      for (let v = 0; v < 3; v++) vs.push(makeFringe(id, e, v));
      TileArt.fringes[id].push(vs);
    }
  }
  // foam[edge][frame][variant]
  TileArt.foam = [];
  for (let e = 0; e < 4; e++) {
    TileArt.foam.push([
      [makeFoam(e, 0, 0), makeFoam(e, 0, 1)],
      [makeFoam(e, 1, 0), makeFoam(e, 1, 1)],
    ]);
  }
  // ---- big tree: layered storybook canopy ----
  TileArt.tree = mkCanvas(24, 30); {
    const x = TileArt.tree.getContext('2d');
    x.fillStyle = 'rgba(20,40,20,.30)'; x.beginPath(); x.ellipse(12, 27.5, 8, 2.4, 0, 0, 7); x.fill();
    x.fillStyle = '#241a33'; x.fillRect(9, 18, 6, 11);
    x.fillStyle = '#704820'; x.fillRect(10, 19, 4, 10);
    x.fillStyle = '#8a5c2c'; x.fillRect(10, 19, 1, 10);
    x.fillStyle = '#503418'; x.fillRect(13, 22, 1, 7);
    x.fillStyle = '#241a33'; x.beginPath(); x.arc(12, 11, 11, 0, 7); x.fill();
    x.fillStyle = '#2f8038'; x.beginPath(); x.arc(12, 11, 10, 0, 7); x.fill();
    x.fillStyle = '#3f9c46'; x.beginPath(); x.arc(10, 9.5, 8.4, 0, 7); x.fill();
    x.fillStyle = '#58c452'; x.beginPath(); x.arc(9, 8, 5.5, 0, 7); x.arc(16, 11, 4.5, 0, 7); x.fill();
    x.fillStyle = '#79d96a'; x.beginPath(); x.arc(8, 7, 3, 0, 7); x.fill();
    x.fillStyle = '#a2ec8a'; x.fillRect(6, 5, 2, 1); x.fillRect(9, 4, 1, 1);
    x.fillStyle = '#2f8038'; x.beginPath(); x.arc(14, 16, 5, 0, 7); x.fill();
    x.fillStyle = '#256a2e'; x.beginPath(); x.arc(15, 17.5, 3.4, 0, 7); x.fill();
  }
  TileArt.pine = mkCanvas(20, 30); {
    const x = TileArt.pine.getContext('2d');
    x.fillStyle = 'rgba(30,40,60,.30)'; x.beginPath(); x.ellipse(10, 28, 7, 2, 0, 0, 7); x.fill();
    x.fillStyle = '#241a33'; x.fillRect(7, 23, 6, 7);
    x.fillStyle = '#704820'; x.fillRect(8, 24, 4, 6);
    x.fillStyle = '#241a33';
    x.beginPath(); x.moveTo(10, 0); x.lineTo(20, 26); x.lineTo(0, 26); x.fill();
    x.fillStyle = '#2f7a44';
    x.beginPath(); x.moveTo(10, 2); x.lineTo(18, 25); x.lineTo(2, 25); x.fill();
    x.fillStyle = '#3f9c56'; x.beginPath(); x.moveTo(10, 2); x.lineTo(15, 16); x.lineTo(5, 16); x.fill();
    x.fillStyle = '#58b46a'; x.beginPath(); x.moveTo(10, 3); x.lineTo(12.5, 10); x.lineTo(7.5, 10); x.fill();
    x.fillStyle = '#eef1f7'; x.fillRect(6, 8, 8, 2); x.fillRect(4, 16, 5, 2); x.fillRect(12, 19, 5, 2);
    x.fillStyle = '#ffffff'; x.fillRect(6, 8, 8, 1); x.fillRect(4, 16, 5, 1);
  }
  TileArt.palm = mkCanvas(24, 30); {
    const x = TileArt.palm.getContext('2d');
    x.fillStyle = 'rgba(120,90,30,.30)'; x.beginPath(); x.ellipse(12, 28, 7, 2, 0, 0, 7); x.fill();
    x.fillStyle = '#241a33'; x.fillRect(10, 8, 5, 22);
    x.fillStyle = '#a8703c'; x.fillRect(11, 9, 3, 20);
    x.fillStyle = '#c08850'; x.fillRect(11, 9, 1, 20);
    x.fillStyle = '#83552c'; for (const ty of [12, 17, 22, 26]) x.fillRect(11, ty, 3, 1);
    x.fillStyle = '#241a33';
    for (const [dx, dy] of [[-9, -2], [9, -2], [-7, -6], [7, -6], [0, -9]]) { x.beginPath(); x.ellipse(12 + dx / 1.5, 8 + dy / 1.5, 7, 3, Math.atan2(dy, dx), 0, 7); x.fill(); }
    x.fillStyle = '#3f9c46';
    for (const [dx, dy] of [[-9, -2], [9, -2], [-7, -6], [7, -6], [0, -9]]) { x.beginPath(); x.ellipse(12 + dx / 1.5, 8 + dy / 1.5, 6, 2.2, Math.atan2(dy, dx), 0, 7); x.fill(); }
    x.fillStyle = '#58c452';
    for (const [dx, dy] of [[-9, -2], [9, -2], [0, -9]]) { x.beginPath(); x.ellipse(12 + dx / 1.8, 8 + dy / 1.8, 3.5, 1.2, Math.atan2(dy, dx), 0, 7); x.fill(); }
    x.fillStyle = '#704820'; x.beginPath(); x.arc(10, 9, 1.5, 0, 7); x.arc(14, 9.5, 1.5, 0, 7); x.fill();
  }
  // torch (wall decoration, 2 flame frames)
  TileArt.torch = [];
  for (let f = 0; f < 2; f++) {
    const c = mkCanvas(8, 14), x = c.getContext('2d');
    x.fillStyle = '#241a33'; x.fillRect(3, 7, 2, 6);
    x.fillStyle = '#a8703c'; x.fillRect(3, 8, 1, 5);
    x.fillStyle = '#704820'; x.fillRect(4, 8, 1, 5);
    x.fillStyle = '#241a33'; x.fillRect(2, 6, 4, 2);
    x.fillStyle = '#f89238'; x.fillRect(2 + f, 3, 3, 3);
    x.fillStyle = '#f8d048'; x.fillRect(3, 4 - f, 2, 2);
    x.fillStyle = '#fff8d0'; x.fillRect(3 + f, 4, 1, 1);
    TileArt.torch.push(c);
  }
  // ---- rocky cliff-wall textures, one per palette, with per-terrain flourishes ----
  TileArt.walls = {};
  for (const [key, cp] of Object.entries(CLIFF_PALS)) {
    const c = mkCanvas(16, 70), x = c.getContext('2d');
    const r = sRandom(key.length * 977 + 5);
    x.fillStyle = cp.face; x.fillRect(0, 0, 16, 70);
    // strata bands (wavier, chunkier)
    for (let y = 3; y < 70; y += 5) {
      x.fillStyle = cp.dark;
      const off = ((y / 5 | 0) % 2) * 4;
      for (let i = -4 + off; i < 16; i += 8) x.fillRect(i + 1, y + ((r() * 2) | 0), 6, 2);
    }
    if (key === 'canyon') {
      // bold red-rock strata
      for (let y = 6; y < 70; y += 9) { x.fillStyle = 'rgba(220,140,80,.35)'; x.fillRect(0, y, 16, 2); }
    }
    // chipped highlights
    for (let n = 0; n < 12; n++) {
      x.fillStyle = cp.lip; x.globalAlpha = 0.35;
      x.fillRect((r() * 15) | 0, (r() * 68) | 0, 2, 1);
      x.globalAlpha = 1;
    }
    // embedded stones
    for (let n = 0; n < 5; n++) {
      const a = (r() * 13) | 0, b = 4 + ((r() * 60) | 0);
      x.fillStyle = cp.dark; x.fillRect(a, b, 3, 2);
      x.fillStyle = cp.extra || cp.lip; x.globalAlpha = 0.5; x.fillRect(a, b, 2, 1); x.globalAlpha = 1;
    }
    // vertical cracks
    x.fillStyle = cp.rim;
    for (const cx of [3, 9, 14]) {
      let y = (r() * 8) | 0;
      while (y < 68) { const len = 3 + ((r() * 5) | 0); x.fillRect(cx + (((y / 9) | 0) % 2 ? 1 : 0), y, 1, len); y += len + 2 + ((r() * 4) | 0); }
    }
    // per-terrain flourish near the top of the face
    if (key === 'snow') {        // icicles
      for (let n = 0; n < 4; n++) { const a = 1 + (r() * 13 | 0), len = 2 + (r() * 4 | 0); x.fillStyle = '#dde8f6'; x.fillRect(a, 0, 1, len + 2); x.fillStyle = '#ffffff'; x.fillRect(a, 0, 1, 1); }
    } else if (key === 'dirt') { // dangling roots
      for (let n = 0; n < 3; n++) { const a = 2 + (r() * 12 | 0), len = 3 + (r() * 4 | 0); x.fillStyle = '#5e3c1c'; for (let yy = 0; yy < len; yy++) x.fillRect(a + ((yy % 3) === 2 ? 1 : 0), yy, 1, 1); }
    } else if (key === 'sea') {  // barnacles + algae streak
      for (let n = 0; n < 5; n++) { x.fillStyle = '#cfe2dd'; x.fillRect(1 + (r() * 14 | 0), 6 + (r() * 56 | 0), 1, 1); }
      x.fillStyle = 'rgba(60,170,140,.4)'; x.fillRect(4 + (r() * 8 | 0), 0, 2, 14 + (r() * 12 | 0));
    } else if (key === 'void') { // glowing cracks
      x.fillStyle = 'rgba(124,230,255,.55)';
      let yy = 4; let cx2 = 5 + (r() * 6 | 0);
      while (yy < 64) { x.fillRect(cx2, yy, 1, 3); cx2 += (r() < 0.5 ? -1 : 1); yy += 3 + (r() * 3 | 0); }
    }
    // side ambient occlusion
    const g = x.createLinearGradient(0, 0, 16, 0);
    g.addColorStop(0, 'rgba(20,10,40,.30)'); g.addColorStop(0.22, 'rgba(20,10,40,0)');
    g.addColorStop(0.78, 'rgba(20,10,40,0)'); g.addColorStop(1, 'rgba(20,10,40,.30)');
    x.fillStyle = g; x.fillRect(0, 0, 16, 70);
    TileArt.walls[key] = c;
  }
  TileArt.built = true;
}
function tileAt(map, i, j) {
  if (i < 0 || j < 0 || i >= map.w || j >= map.h) return 'rock';
  const o = map.overrides && map.overrides[i + ',' + j];
  return o || map.tiles[j][i];
}
function elevAt(map, i, j) {
  if (i < 0 || j < 0 || i >= map.w || j >= map.h) return 9;
  return map.elev[j][i];
}
// smooth 2D value noise (period ~7 tiles) for large-scale ground tone
function vnoise2(i, j) {
  const xx = i / 7, yy = j / 7;
  const xi = Math.floor(xx), yi = Math.floor(yy), fx = xx - xi, fy = yy - yi;
  const s = (a, b) => hash2(a * 3 + 11, b * 5 + 7);
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return lerp(lerp(s(xi, yi), s(xi + 1, yi), u), lerp(s(xi, yi + 1), s(xi + 1, yi + 1), u), v);
}
function cliffKeyFor(upId, map) {
  const g = GROUND_OF[upId] || upId;
  if (g === 'snow' || upId === 'ice') return 'snow';
  if (g === 'seafloor') return 'sea';
  if (g === 'voidfloor') return 'void';
  if (g === 'floor' || upId === 'wall') return 'stone';
  if (g === 'dust') return 'canyon';
  return map.cliff || 'dirt';
}
const FR_DIRS = [[0, -1, 0], [0, 1, 1], [-1, 0, 2], [1, 0, 3]];
function drawWorld(c, map, camX, camY, time, entityHook) {
  const frame = (time * 2 | 0) % 2;
  const _Z = map.viewScale || 1, _VWv = VW / _Z, _VHv = VH / _Z;
  const j0 = Math.max(0, ((camY / TILE) | 0) - 4), j1 = Math.min(map.h - 1, (((camY + _VHv) / TILE) | 0) + 2);
  const i0 = Math.max(0, ((camX / TILE) | 0) - 1), i1 = Math.min(map.w - 1, (((camX + _VWv) / TILE) | 0) + 1);
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const id = tileAt(map, i, j), e = elevAt(map, i, j);
      const sx = i * TILE, sy = j * TILE - e * EOFF;
      const en = elevAt(map, i, j - 1);
      const upId = tileAt(map, i, j - 1);
      // ---- cliff face above this tile ----
      if (en > e && en < 9) {
        const wallTop = j * TILE - en * EOFF, wallH = (en - e) * EOFF;
        const cpKey = cliffKeyFor(upId, map);
        const cp = CLIFF_PALS[cpKey] || CLIFF_PALS.dirt;
        c.drawImage(TileArt.walls[cpKey] || TileArt.walls.dirt, 0, 0, 16, Math.min(wallH, 70), sx, wallTop, 16, wallH);
        // jagged sunlit lip (per-2px jitter instead of a ruler line)
        for (let seg = 0; seg < 8; seg++) {
          const jit = (hash2(i * 7 + seg, j * 3) * 2) | 0;
          c.fillStyle = cp.lip; c.fillRect(sx + seg * 2, wallTop + jit, 2, 2);
          c.fillStyle = 'rgba(255,250,220,.55)'; c.fillRect(sx + seg * 2, wallTop + jit, 2, 1);
        }
        c.fillStyle = cp.rim; c.fillRect(sx, wallTop + wallH - 2, TILE, 2);
        c.fillStyle = 'rgba(16,8,28,.55)'; c.fillRect(sx, wallTop + wallH - 1, TILE, 1);
        // rubble crumbs at the base
        for (let seg = 0; seg < 3; seg++) {
          if (hash2(i * 13 + seg, j * 17) < 0.4) { c.fillStyle = cp.dark; c.fillRect(sx + 2 + seg * 5, wallTop + wallH - 3, 2, 1); }
        }
      }
      // ---- ground tile ----
      const v = (hash2(i, j) * TILE_VARS) | 0;
      const def = TILEDEFS[id] || {};
      if (id !== 'openwater')                                             // openwater draws NOTHING: the painted backdrop behind shows through
        c.drawImage(TileArt.variants[id][def.anim ? frame * TILE_VARS + v : v], sx, sy);
      // ---- World 3 rooftops: a tall building FACADE descends below each roof to the screen base ----
      if (map._facadeTop && id === 'skygap') {
        const ft = map._facadeTop[i];
        if (ft >= 0 && j > ft) {
          const depth = j - ft, shf = Math.max(0.42, 1 - depth * 0.035);
          const RT = (typeof TileArt !== 'undefined') && TileArt.roofTiles;
          if (RT && (RT.facadelit || RT.facadeblue)) {                          // HD building-facade tiles, varied per tower-column
            const fset = RT._fset || (RT._fset = [RT.facadelit, RT.facadeblue, RT.facadedark, RT.facadebig, RT.winstrip].filter(Boolean));
            const band = RT.facadedim || RT.ledge || RT.facadedark;
            const tile = (depth % 4 === 0 && band) ? band : (fset[(hash2(i, 7) * fset.length) | 0] || RT.facadelit);
            c.drawImage(tile, sx, sy);
            if (depth > 4) { c.fillStyle = 'rgba(10,8,18,' + Math.min(0.5, (depth - 4) * 0.03).toFixed(2) + ')'; c.fillRect(sx, sy, 16, 16); }  // fade into the deep
            if (depth === 1) { c.fillStyle = 'rgba(14,10,22,.6)'; c.fillRect(sx, sy, 16, 2); c.fillStyle = 'rgba(176,166,188,.25)'; c.fillRect(sx, sy + 2, 16, 1); }
          } else {
            c.fillStyle = 'rgb(' + ((72 * shf) | 0) + ',' + ((68 * shf) | 0) + ',' + ((84 * shf) | 0) + ')'; c.fillRect(sx, sy, 16, 16);
            c.fillStyle = 'rgba(18,14,28,.55)'; c.fillRect(sx, sy, 1, 16); c.fillRect(sx + 8, sy, 1, 16);
            if (depth === 1) { c.fillStyle = 'rgba(14,10,22,.7)'; c.fillRect(sx, sy, 16, 2); c.fillStyle = 'rgba(176,166,188,.25)'; c.fillRect(sx, sy + 2, 16, 1); }
            if (depth % 2 === 1) {
              for (let wx = 2; wx < 14; wx += 6) {
                const lit = hash2(i * 7 + wx, j * 3) > 0.5;
                c.fillStyle = lit ? 'rgba(255,224,150,' + (0.55 * shf).toFixed(2) + ')' : 'rgba(26,30,48,.85)';
                c.fillRect(sx + wx, sy + 5, 4, 7);
                c.fillStyle = 'rgba(14,10,22,.5)'; c.fillRect(sx + wx - 1, sy + 4, 6, 1);
              }
            }
          }
        }
      }
      // ---- World 3 clock-tower: an open SUNSET SKY behind the tower (no border tiles beside it) ----
      if (id === 'sky') {
        const horizon = map._skyHorizon || ((map.h * 0.62) | 0);
        const tt = Math.max(0, Math.min(1, j / horizon));
        let R8, G8, B8;
        if (tt < 0.5) { const u = tt / 0.5; R8 = 252 - u * 8; G8 = 208 - u * 58; B8 = 150 - u * 42; }
        else { const u = (tt - 0.5) / 0.5; R8 = 244 - u * 40; G8 = 150 - u * 42; B8 = 108 + u * 30; }
        c.fillStyle = 'rgb(' + (R8 | 0) + ',' + (G8 | 0) + ',' + (B8 | 0) + ')'; c.fillRect(sx, sy, 16, 16);
        const cn = vnoise2(i, j);                                          // soft, tile-spanning clouds
        if (cn > 0.64) { c.fillStyle = 'rgba(255,240,218,' + Math.min(0.55, (cn - 0.64) * 2.3).toFixed(2) + ')'; c.fillRect(sx, sy, 16, 16); }
        else if (cn < 0.30) { c.fillStyle = 'rgba(198,108,118,' + Math.min(0.28, (0.30 - cn) * 1.1).toFixed(2) + ')'; c.fillRect(sx, sy, 16, 16); }
      }
      if (def.gate && map.gateOpen) { c.drawImage(TileArt.variants.seafloor[v], sx, sy); }
      // ---- large-scale tonal variation (kills the flat-field look) ----
      if (TONE_TILES[id]) {
        const n = vnoise2(i, j);
        if (n > 0.62) { c.fillStyle = 'rgba(255,250,200,' + ((n - 0.62) * 0.30).toFixed(3) + ')'; c.fillRect(sx, sy, TILE, TILE); }
        else if (n < 0.38) { c.fillStyle = 'rgba(20,40,34,' + ((0.38 - n) * 0.30).toFixed(3) + ')'; c.fillRect(sx, sy, TILE, TILE); }
      }
      // ---- rift edge glow: only where the void meets solid ground ----
      if (id === 'rift') {
        for (const [di, dj, edge] of FR_DIRS) {
          if (tileAt(map, i + di, j + dj) === 'rift') continue;
          c.fillStyle = edge < 2 ? 'rgba(90,200,240,.5)' : 'rgba(220,110,210,.45)';
          if (edge === 0) c.fillRect(sx, sy, 16, 1);
          else if (edge === 1) c.fillRect(sx, sy + 15, 16, 1);
          else if (edge === 2) c.fillRect(sx, sy, 1, 16);
          else c.fillRect(sx + 15, sy, 1, 16);
        }
      }
      // ---- animated surf on shorelines ----
      if (id === 'water' || id === 'deep') {
        for (const [di, dj, edge] of FR_DIRS) {
          const nid = tileAt(map, i + di, j + dj), nd = TILEDEFS[nid] || {};
          if (!nd.swim && nid !== 'deep' && !nd.hole && nid !== 'bridge') {
            const fv = (hash2(i * 3 + edge, j * 5) * 2) | 0;
            c.drawImage(TileArt.foam[edge][frame][fv], sx, sy);
          }
        }
      }
      // ---- terrain fringes: higher-priority neighbors overhang this tile ----
      const gid = GROUND_OF[id] || id;
      if (FRINGE_RECV[id] || FRINGE_RECV[gid]) {
        const myPri = BLEND_PRI[gid] !== undefined ? BLEND_PRI[gid] : -1;
        for (const [di, dj, edge] of FR_DIRS) {
          const ni = i + di, nj = j + dj;
          const nid = tileAt(map, ni, nj), ngid = GROUND_OF[nid] || nid;
          if (ngid === gid) continue;
          const fr = TileArt.fringes[ngid];
          if (!fr) continue;
          if ((BLEND_PRI[ngid] || 0) <= myPri) continue;
          if (elevAt(map, ni, nj) !== e) continue;
          const fv = (hash2(ni * 3 + edge * 7, nj * 5 + 1) * 3) | 0;
          c.drawImage(fr[edge][fv], sx, sy);
        }
      }
      // ---- deep drop shadow cast by the cliff onto this lower ground ----
      if (en > e && en < 9) {
        const grd = c.createLinearGradient(0, sy, 0, sy + 9);
        grd.addColorStop(0, 'rgba(16,8,28,.55)'); grd.addColorStop(1, 'rgba(16,8,28,0)');
        c.fillStyle = grd; c.fillRect(sx, sy, TILE, 9);
      }
      // ---- plateau silhouette: crisp dark edges + rounded corners + sunlit south lip ----
      const es = elevAt(map, i, j + 1);
      const ew = elevAt(map, i - 1, j), ee = elevAt(map, i + 1, j);
      if (e > 0) {
        if (es < e) {
          c.fillStyle = 'rgba(255,250,220,.6)'; c.fillRect(sx, sy + TILE - 2, TILE, 1);
          c.fillStyle = 'rgba(36,26,51,.8)'; c.fillRect(sx, sy + TILE - 1, TILE, 1);
        }
        if (ew < e && ew < 9) {
          c.fillStyle = 'rgba(36,26,51,.7)'; c.fillRect(sx, sy, 1, TILE);
          c.fillStyle = 'rgba(20,10,40,.25)'; c.fillRect(sx + 1, sy, 2, TILE);
        }
        if (ee < e && ee < 9) {
          c.fillStyle = 'rgba(36,26,51,.7)'; c.fillRect(sx + TILE - 1, sy, 1, TILE);
          c.fillStyle = 'rgba(20,10,40,.25)'; c.fillRect(sx + TILE - 3, sy, 2, TILE);
        }
        if (en < e && en < 9) { c.fillStyle = 'rgba(255,250,220,.30)'; c.fillRect(sx, sy, TILE, 1); }
        // rounded plateau corners (cut the square corner with dark notches)
        c.fillStyle = 'rgba(36,26,51,.75)';
        if (es < e && es < 9 && ee < e && ee < 9) { c.fillRect(sx + 14, sy + 15, 2, 1); c.fillRect(sx + 15, sy + 13, 1, 2); c.fillRect(sx + 14, sy + 14, 1, 1); }
        if (es < e && es < 9 && ew < e && ew < 9) { c.fillRect(sx, sy + 15, 2, 1); c.fillRect(sx, sy + 13, 1, 2); c.fillRect(sx + 1, sy + 14, 1, 1); }
        if (en < e && en < 9 && ee < e && ee < 9) { c.fillRect(sx + 14, sy, 2, 1); c.fillRect(sx + 15, sy + 1, 1, 1); }
        if (en < e && en < 9 && ew < e && ew < 9) { c.fillRect(sx, sy, 2, 1); c.fillRect(sx, sy + 1, 1, 1); }
      }
      // ---- altitude sunlight ----
      if (e > 0 && !def.solid) { c.fillStyle = 'rgba(255,242,190,' + (0.065 * e) + ')'; c.fillRect(sx, sy, TILE, TILE); }
      // ---- dungeon torches: on wall faces above floor, flickering ----
      if (map.dark && id === 'wall' && tileAt(map, i, j + 1) === 'floor' && hash2(i * 13, j * 29) < 0.16) {
        const tf = ((time * 5 + i) | 0) % 2;
        c.drawImage(TileArt.torch[tf], sx + 4, sy + 1);
        const gl = c.createRadialGradient(sx + 8, sy + 5, 2, sx + 8, sy + 5, 22);
        gl.addColorStop(0, 'rgba(255,180,80,.18)'); gl.addColorStop(1, 'rgba(255,180,80,0)');
        c.fillStyle = gl; c.fillRect(sx - 14, sy - 14, 44, 44);
      }
    }
    if (entityHook) entityHook(j);
  }
  // ---- World 3 clock-tower: a soft SETTING SUN over the open sky ----
  if (map._sun) {
    const sxc = map._sun.x * TILE + 8, syc = map._sun.y * TILE + 8;
    const g = c.createRadialGradient(sxc, syc, 1, sxc, syc, 60);
    g.addColorStop(0, 'rgba(255,253,238,.95)'); g.addColorStop(0.18, 'rgba(255,244,212,.85)');
    g.addColorStop(0.5, 'rgba(255,224,170,.4)'); g.addColorStop(1, 'rgba(255,210,150,0)');
    c.fillStyle = g; c.beginPath(); c.arc(sxc, syc, 60, 0, 7); c.fill();
    const _sun = (typeof Sprites !== 'undefined' && Sprites.props) ? Sprites.props.sun : null;
    if (_sun && _sun.width) { const sw = _sun.width / (_sun.dens || 2), sh = _sun.height / (_sun.dens || 2); c.drawImage(_sun, sxc - sw / 2, syc - sh / 2, sw, sh); }
    else { c.fillStyle = 'rgba(255,251,236,.92)'; c.beginPath(); c.arc(sxc, syc, 13, 0, 7); c.fill(); }
  }
}
