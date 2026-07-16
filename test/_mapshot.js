const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Sprites } = NQ;
H.startPlay(); Game.enterSlot('city');
Game.flags.starcells = { sc_cog1: 1, sc_lady: 1, sc_cog3: 1 };
Game.dialog = null; Game._pendingIntro = null; Game.state = 'world3map'; Game.world3Cursor = 2;
H.assert(Sprites.scenes && Sprites.scenes.world3bg && Sprites.scenes.world3bg.width > 0, 'world3bg painted background loaded (' + (Sprites.scenes.world3bg ? Sprites.scenes.world3bg.width : 0) + 'px)');
Game.banners = []; H.render();
fs.writeFileSync(__dirname + '/../shots/world3map_painted.png', H.canvas.toBuffer('image/png'));
console.log('map shot done; bg loaded:', !!(Sprites.scenes && Sprites.scenes.world3bg));
