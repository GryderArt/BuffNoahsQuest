const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player, SideScroll } = NQ;
const save = (n) => fs.writeFileSync(__dirname + '/../shots/b_' + n + '.png', H.canvas.toBuffer('image/png'));
H.startPlay();
// 1) void dungeon with moving asteroids
Game.loadMap('void'); Player.x = 9 * 16; Player.y = 11 * 16;
for (const a of Game.map.asteroids) { a.t = 1.0; const u = 0.5 - 0.5 * Math.cos((a.t / a.period + a.phase) * Math.PI * 2); a.x = NQ.MAPS ? a.ax0 + (a.ax1 - a.ax0) * u : a.ax0; a.y = a.ay0; }
H.step(2); Game.banners = []; Game.toasts = []; H.render(); save('void');
// 2) shop with Marko's face
Game.loadMap('coast'); Game.flags.gems = 30; Game.openShop(); Game.banners = []; Game.toasts = []; H.render(); save('shop_face');
Game.menu = null; Game.state = 'play';
// 3) bigger dialog text
Game.dialog = { name: 'Granny', who: 'granny', lines: ["My sheep! You wonderful buff boy! Take my CATCH NET (tool 2) and my picnic-basket SCENT CAGE (tool 4)."] };
Game.state = 'dialog'; H.render(); save('dialog'); Game.dialog = null; Game.state = 'play';
// 4) snow summit — the Shrine Spirit (no pine over him)
Game.loadMap('vale'); Player.x = 7 * 16 + 8; Player.y = 7 * 16 + 12; H.step(2); Game.banners = []; Game.toasts = []; H.render(); save('spirit');
// 5) road boss penned by the left wall
SideScroll.start('meteor', false); const S = SideScroll.active;
S.p.x = (S.bossHome[0] - 12) * 16; S.p.y = SideScroll.groundYAt(S, S.p.x) - 1;
for (let i = 0; i < 100; i++) { H.step(1); Player.hearts = Player.maxHearts; }
Game.banners = []; Game.toasts = []; H.render(); save('boss_wall');
console.log('shots written; boss present:', !!S.boss);
