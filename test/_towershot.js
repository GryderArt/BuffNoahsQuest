const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player } = NQ;
H.startPlay(); Game.enterSlot('city');
Object.assign(Game.flags, { intro_cog1: 1 }); Game._pendingIntro = null; Game.dialog = null;
Object.assign(Game.flags, { cog_cleared: 1, has_mastergear: 1, cog_started: 1, cog_grate: 1, cog_vault: 1 });
// 1) the VAULT/crown: clock + star + sky framing
Game.banners = []; Player.x = 26 * 16 + 8; Player.y = 6 * 16 + 8; if (Game.companion) { Game.companion.x = Player.x - 16; Game.companion.y = Player.y; }
Game.time = 7.0; H.render(); fs.writeFileSync(__dirname + '/../shots/cog1_tower_crown.png', H.canvas.toBuffer('image/png'));
// 2) mid-climb: tower walls + sunset sky on both sides
Player.x = 26 * 16 + 8; Player.y = 17 * 16 + 8; if (Game.companion) { Game.companion.x = Player.x - 12; Game.companion.y = Player.y; }
H.render(); fs.writeFileSync(__dirname + '/../shots/cog1_tower_mid.png', H.canvas.toBuffer('image/png'));
// 3) the plaza looking up at the parapet + tower base
Player.x = 26 * 16 + 8; Player.y = 30 * 16 + 8; if (Game.companion) { Game.companion.x = Player.x - 12; Game.companion.y = Player.y; }
H.render(); fs.writeFileSync(__dirname + '/../shots/cog1_plaza_up.png', H.canvas.toBuffer('image/png'));
console.log('tower shots done');
