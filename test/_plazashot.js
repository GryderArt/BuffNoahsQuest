const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player } = NQ;
H.startPlay(); Game.enterSlot('city');
Object.assign(Game.flags, { intro_cog1: 1 }); Game._pendingIntro = null; Game.dialog = null;
Game.banners = []; Player.x = 26 * 16 + 8; Player.y = 36 * 16 + 8; if (Game.companion) { Game.companion.x = Player.x - 14; Game.companion.y = Player.y; }
H.step(2); Game.banners = []; H.render();
fs.writeFileSync(__dirname + '/../shots/cog1_plaza_pests.png', H.canvas.toBuffer('image/png'));
const pests = Game.creatures.filter(c => NQ.CREATURES[c.species] && NQ.CREATURES[c.species].pest);
console.log('plaza shot done; pests:', pests.length, pests.slice(0,5).map(c=>c.species).join(','));
