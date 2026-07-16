const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player } = NQ;
H.startPlay();
// confirm the portal exists and where
const p = Game.map.objects.find(o=>o.type==='portal'&&o.to==='icefield');
console.log('frozen-rift portal at vale tile', p.x+','+p.y);
// 1) close-up: Noah standing right below it -> shows the swirl + STEP IN prompt
Player.x = 14*16+8; Player.y = 6*16+12; Player.dir='up'; H.step(2);
Game.banners=[]; Game.toasts=[]; H.render();
fs.writeFileSync(__dirname+'/../shots/portal_closeup.png', H.canvas.toBuffer('image/png'));
console.log('closeup saved');
