const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, world2: true, ramHead: true, ramGlow: true, ramShrink: true, ramBounce: true,
  ramDecoy: true, ramGlide: true, ramRoll: true, ramsuit: true, sandals: true, gloves: true, bracers: true, suit: true,
  net: true, harpoon: true, bone: true, cage: true });
Game.flags.baits = { clover: 9, tincan: 9, fishsnack: 9, cookie: 9, berry: 9 };
function shot(map, x, y, n) { Game.loadMap(map); Game.state = 'play'; Player.x = x*16+8; Player.y = y*16+12; Game.companion.map=map; Game.companion.x=Player.x-14; Game.companion.y=Player.y; H.step(3); Game.banners=[];Game.toasts=[]; H.render(); fs.writeFileSync(__dirname+'/../shots/world_'+n+'.png', H.canvas.toBuffer('image/png')); }
shot('burrow6', 12, 30, '6_hollows');     // sap-pool + herds, lit by Glow
shot('burrow7', 12, 9, '7_crystal');      // crystal caverns
shot('burrow8', 12, 28, '8_hoard');       // exotic hoard
console.log('world shots saved');
