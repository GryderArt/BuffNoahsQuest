const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player } = NQ;
Object.assign(Game.flags, { ramsi: true, world2: true, intro_cog1: 1, intro_cog2: 1, intro_cog3: 1, intro_cog4: 1 });
const save = n => fs.writeFileSync(__dirname + '/../shots/' + n + '.png', H.canvas.toBuffer('image/png'));
H.startPlay(); Game.enterSlot('city');
// 1) star cutscene — pixel Noah/Ramsi + the LADY
Game.startCutscene(Game.STAR_CUTSCENE(2, 'lady'), () => {}); Game.cutscene.t = 0.9; Game.banners = []; H.render(); save('polish_cutscene_lady');
// 2) Supreme Trader dialogue — FACE ZOOM portrait
Game.state = 'play'; Game.dialog = null; Game.loadMap('cog1'); Game._pendingIntro = null;
const tr = Game.map.objects.find(o => o.type === 'npc' && o.who === 'supreme_trader'); Game.flags.cog_quest = false;
Game.state = 'play'; Game.talkTo(tr); Game.banners = []; H.render(); save('polish_trader_portrait');
// 3) the spaced-out overview map
Game.dialog = null; Game.state = 'world3map'; Game.world3Cursor = 1; Game.flags.starcells = { sc_cog1: 1, sc_lady: 1, sc_cog3: 1 }; H.render(); save('polish_world3map');
console.log('polish shots: cutscene(lady), trader portrait, world3map');
