const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, world2: true, ramGlow: true });
Game.loadMap('burrow5'); Game.state = 'play'; H.place(11, 9); H.step(3);
Game.banners = []; Game.toasts = []; H.render();
fs.writeFileSync(__dirname + '/../shots/kin_mrram.png', H.canvas.toBuffer('image/png'));
console.log('kin art shot saved; Sprites.npcs.kin1 present?', !!(NQ.Sprites.npcs && NQ.Sprites.npcs.kin1));
