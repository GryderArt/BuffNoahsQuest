const H=require('./harness'); const fs=require('fs'); const {createCanvas}=require('canvas');
const {NQ}=H; const {Game,Player}=NQ;
H.startPlay(); Game.loadMap('vale');
Player.x=55*16+8; Player.y=8*16+12; H.step(2); Game.banners=[]; Game.toasts=[]; H.render();
const sx=Math.round(59*16-Game.camX), sy=Math.round(4*16-Game.camY);
const SRC=2,Z=8,cw=60,ch=64,ox=sx-30,oy=sy-40;
const out=createCanvas(cw*Z,ch*Z),o=out.getContext('2d'); o.imageSmoothingEnabled=false;
o.drawImage(H.canvas, ox*SRC,oy*SRC,cw*SRC,ch*SRC,0,0,cw*Z,ch*Z);
fs.writeFileSync(__dirname+'/../shots/r_zoom.png', out.toBuffer('image/png')); console.log('rendered');
