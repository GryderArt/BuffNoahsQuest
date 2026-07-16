const H = require('./harness');
const fs = require('fs');
const { createCanvas } = require('canvas');
const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay();
Game.loadMap('vale');
// move the chest onto open meadow grass and stand Noah beside it (screenshot only)
const chest = Game.map.objects.find(o => o.type === 'chest');
chest.x = 21; chest.y = 13;
Player.x = 21 * 16 + 8; Player.y = 15 * 16;
for (const c of Game.creatures) c.state = 'gone';     // clear clutter
H.step(2); Game.banners = []; Game.toasts = []; H.render();
const cwx = chest.x * 16, cwy = chest.y * 16;          // chest world px
const sx = Math.round(cwx - Game.camX), sy = Math.round(cwy - Game.camY);  // logical screen px
const SRC = 2, Z = 7, halfW = 40, halfH = 44;
const ox = sx - 12, oy = sy - 40;                      // crop window (logical)
const out = createCanvas((halfW*2) * Z, (halfH*2) * Z), o = out.getContext('2d');
o.imageSmoothingEnabled = false;
o.drawImage(H.canvas, ox*SRC, oy*SRC, halfW*2*SRC, halfH*2*SRC, 0, 0, out.width, out.height);
// 16px tile grid aligned to the world
o.strokeStyle = 'rgba(255,0,128,.5)'; o.lineWidth = 1;
for (let gx = (-ox % 16 + 16) % 16; gx <= halfW*2; gx += 16) { o.beginPath(); o.moveTo(gx*Z,0); o.lineTo(gx*Z,out.height); o.stroke(); }
for (let gy = (-oy % 16 + 16) % 16; gy <= halfH*2; gy += 16) { o.beginPath(); o.moveTo(0,gy*Z); o.lineTo(out.width,gy*Z); o.stroke(); }
fs.writeFileSync(__dirname + '/../shots/scale_chest_zoom.png', out.toBuffer('image/png'));
console.log('chest framed; each pink cell = one 16px tile (chest should overflow its tile ~1.5x)');
