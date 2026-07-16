const H = require('./harness');
const fs = require('fs');
const { createCanvas } = require('canvas');
const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay();
Game.loadMap('keep3');
const b = Game.boss;
Player.x = (b ? b.x : 12*16) ; Player.y = (b ? b.y : 5*16) + 40;
H.step(2); Game.banners = []; Game.toasts = []; H.render();
// zoom on the boss
const bx = Math.round((b?b.x:200) - Game.camX), by = Math.round((b?b.y:120) - Game.camY);
const SRC=2, Z=7, cw=70, ch=70, ox=bx-35, oy=by-46;
const out=createCanvas(cw*Z,ch*Z), o=out.getContext('2d'); o.imageSmoothingEnabled=false;
o.fillStyle='#1a1426'; o.fillRect(0,0,out.width,out.height);
o.drawImage(H.canvas, ox*SRC, oy*SRC, cw*SRC, ch*SRC, 0, 0, cw*Z, ch*Z);
fs.writeFileSync(__dirname+'/../shots/cerb_check.png', out.toBuffer('image/png'));
console.log('boss=', b && b.name, 'at', b && (b.x+','+b.y));
