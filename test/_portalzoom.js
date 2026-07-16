const H = require('./harness'); const fs = require('fs'); const { createCanvas } = require('canvas'); const { NQ } = H; const { Game, Player } = NQ;
H.startPlay();
Player.x = 14*16+8; Player.y = 6*16+12; Player.dir='up'; H.step(2);
Game.banners=[]; Game.toasts=[]; H.render();
const src = H.canvas;
// crop a region centred on Noah (world view centre ~ 480,272 at 2x) and upscale 3.2x
const sx=300, sy=120, sw=360, sh=300, sc=3.2;
const out = createCanvas(sw*sc, sh*sc); const c = out.getContext('2d'); c.imageSmoothingEnabled=false;
c.drawImage(src, sx, sy, sw, sh, 0, 0, sw*sc, sh*sc);
// label the portal
c.fillStyle='#fff'; c.font='bold 28px system-ui'; c.textAlign='center';
fs.writeFileSync(__dirname+'/../shots/portal_zoom.png', out.toBuffer('image/png'));
console.log('zoom saved');
