const H = require('./harness'); const fs = require('fs'); const { createCanvas } = require('canvas');
const { NQ } = H; const { Game, Player, drawWorld } = NQ;
Object.assign(Game.flags, { ramsi: true, world2: true, ramGlide: true, harpoon: true, net: true, sandals: true, gloves: true, bracers: true });
H.startPlay(); Game.enterSlot('city'); Game.flags.starcells = {}; Game.loadMap('cog3'); const m = Game.map;
// in-game play view over the towers (facades + Blazagon)
Player.x = 33 * 16 + 8; Player.y = 17 * 16 + 12; Player.dir = 'right';
const bz = Game.creatures.find(c => c.species === 'blazagon'); if (bz) { bz.x = 33 * 16 + 8; bz.y = 19 * 16 + 12; bz.anim = 1; }
Game.companion.map = 'cog3'; Game.companion.x = Player.x - 14; Game.companion.y = Player.y + 4;
H.step(1); Game.banners = []; Game.toasts = []; H.render();
fs.writeFileSync(__dirname + '/../shots/cog3_play.png', H.canvas.toBuffer('image/png'));
// wide skyline overview (scaled down)
const Wpx = m.w * 16, Hpx = m.h * 16, big = createCanvas(Wpx, Hpx), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false;
for (let cy = 0; cy < Hpx; cy += 200) for (let cx = 0; cx < Wpx; cx += 400) drawWorld(bx, m, cx, cy, 0);
for (const o of m.objects) { if (o.type === 'post') { bx.fillStyle = '#f8d048'; bx.beginPath(); bx.arc(o.x*16+8,o.y*16+3,3,0,7); bx.fill(); bx.fillStyle='#caa05c'; bx.fillRect(o.x*16+7,o.y*16+3,2,11);} if (o.type === 'glidevent') { bx.fillStyle='rgba(154,220,248,.9)'; bx.beginPath(); bx.arc(o.x*16+8,o.y*16+8,5,0,7); bx.fill(); } }
const sc = 0.5, out = createCanvas(Math.round(Wpx*sc), Math.round(Hpx*sc)), oc = out.getContext('2d'); oc.imageSmoothingEnabled=false; oc.drawImage(big,0,0,out.width,out.height);
fs.writeFileSync(__dirname + '/../shots/cog3_skyline.png', out.toBuffer('image/png'));
console.log('cog3 shots: play view + skyline', out.width + 'x' + out.height);
