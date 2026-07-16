// each star-cell in the Cogwerk series plays a short celebration cutscene
const H = require('./harness'); const { NQ } = H; const { Game } = NQ;
H.startPlay(); Game.enterSlot('city');
H.assert(typeof Game.STAR_CUTSCENE === 'function', 'STAR_CUTSCENE exists');
const beats = Game.STAR_CUTSCENE(2);
H.assert(beats.length >= 2 && typeof beats[0].draw === 'function', 'it returns drawable cutscene beats');
Game.flags.starcells = {}; Game.state = 'play';
Game.collectStarcell({ id: 'sc_test1' });
H.assert(Game.state === 'cutscene' && Game.cutscene, 'collecting a STAR-CELL plays a celebration cutscene');
H.assert(Game.starcellCount() === 1, 'the star-cell is still recorded');
for (let i = 0; i < 4 && Game.cutscene; i++) { Game.cutscene.t = 1; Game.advanceCutscene(); }
H.assert(Game.state !== 'cutscene', 'the cutscene ends and returns to play');
console.log('STARCUT OK — each star-cell plays a short celebration');
