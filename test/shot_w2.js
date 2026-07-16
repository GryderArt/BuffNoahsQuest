const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player } = NQ;
const save = (n) => fs.writeFileSync(__dirname + '/../shots/w2_' + n + '.png', H.canvas.toBuffer('image/png'));
H.startPlay();
Object.assign(Game.flags, { ramsi: true, world2: true, ramHead: true, ramStun: true, ramShield: true, ramsuit: true, net: true, harpoon: true, bone: true, suit: true, wings: true, gloves: true, bracers: true });

function frame(map, px, py, cx, cy) {
  Game.loadMap(map); Game.state = 'play';
  Player.x = px * 16 + 8; Player.y = py * 16 + 12;
  Game.companion.map = map; Game.companion.x = (cx !== undefined ? cx : px - 1) * 16 + 8; Game.companion.y = (cy !== undefined ? cy : py) * 16 + 12;
  H.step(1);
}

// 1) Cloudrise Landing — Noah + Ramsi companion + ram-suit chest + cracked wall
frame('sky1', 7, 15, 5, 16);
Game.banners = []; Game.toasts = []; H.render(); save('1_sky1_landing');

// 2) Gust Wing boss — shield bubble up, armor pips, Ramsi charging in
frame('sky1', 19, 14, 22, 14);
{ const b = Game.boss; b.awake = true; b.shieldT = 0; b.hits = 1; b.x = Player.x + 26; b.y = Player.y - 6; Game.companion.x = b.x; Game.companion.y = b.y + 8; }
Game.banners = []; Game.toasts = []; H.render(); save('2_sky1_gustwing');

// 3) Gale Terraces — the Ramsi sky-switch + the wide rift
frame('sky2', 15, 16, 13, 17);
Game.banners = []; Game.toasts = []; H.render(); save('3_sky2_terraces');

// 4) Storm Citadel — the Storm-Lord, shield up, in his arena
frame('sky4', 24, 14, 27, 14);
{ const b = Game.boss; b.awake = true; b.shieldT = 0; b.hits = 2; b.x = Player.x + 28; b.y = Player.y - 8; Game.companion.x = b.x; Game.companion.y = b.y + 8; }
Game.banners = []; Game.toasts = []; H.render(); save('4_sky4_stormlord');

// 5) Storm Citadel — the caged parents (Berkley & Megan)
frame('sky4', 26, 5, 25, 6);
Game.banners = []; Game.toasts = []; H.render(); save('5_sky4_parents');

console.log('W2 shots written:', fs.readdirSync(__dirname + '/../shots').filter(f => f.startsWith('w2_')).join(', '));

// 6) the REUNION cutscene (uses the freed-parents art)
Game.flags.tempestia = true;
Game.startCutscene(NQ.REUNION, () => {});
Game.cutscene.i = 0; Game.cutscene.t = 1.2;
H.render(); save('6_reunion_cutscene');
console.log('reunion shot written');
