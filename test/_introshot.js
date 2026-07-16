const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, parents: true });
Game.startCutscene(NQ.Game.UNDERBURROW_INTRO, () => {});
Game.cutscene.i = 1; Game.cutscene.t = 1.2; H.render();
fs.writeFileSync(__dirname + '/../shots/intro_burrow.png', H.canvas.toBuffer('image/png'));
console.log('intro shot saved');
