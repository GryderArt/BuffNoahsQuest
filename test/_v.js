const H=require('./harness'); const fs=require('fs'); const {createCanvas}=require('canvas'); const {NQ}=H; const {Game,Player}=NQ;
H.startPlay(); Game.loadMap('vale');
// stand in the west forest where oaks scatter
Player.x = 6*16+8; Player.y = 22*16+12; H.step(2); Game.banners=[]; Game.toasts=[]; H.render();
fs.writeFileSync(__dirname+'/../shots/tree_check.png', H.canvas.toBuffer('image/png'));
console.log('rendered, camX=', Game.camX, 'camY=', Game.camY);
