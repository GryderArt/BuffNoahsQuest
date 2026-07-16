const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player, Bosses } = NQ;
Object.assign(Game.flags, { ramsi: true, world2: true, net: true, harpoon: true, bone: true, sandals: true, gloves: true, bracers: true });
const save = n => fs.writeFileSync(__dirname + '/../shots/' + n + '.png', H.canvas.toBuffer('image/png'));
H.startPlay(); Game.enterSlot('city');
// 1) GNASHARA boss arena
Game.flags.gnashara = false; Game.loadMap('cog4'); const b = Game.boss; if (b) b.awake = true;
Player.x = 16 * 16 + 8; Player.y = 13 * 16 + 12; Player.dir = 'up';
Game.companion.map = 'cog4'; Game.companion.x = Player.x - 14; Game.companion.y = Player.y + 2;
H.step(1); for (let i = 0; i < 6; i++) H.step(1); Game.banners = []; Game.toasts = []; H.render(); save('finale_gnashara');
// 2) staggered Cogwerk climb (zoomed-out band of the climb)
Game.flags.cog_started = true; Game.flags.cog_cleared = true; Game.loadMap('cog1');
Player.x = 26 * 16 + 8; Player.y = 16 * 16 + 12; H.step(1); Game.banners = []; Game.toasts = []; H.render(); save('cog1_climb');
console.log('finale + climb shots done; boss heads:', b ? b.heads.length : 0);
