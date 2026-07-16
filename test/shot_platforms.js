const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, SideScroll } = NQ;
H.startPlay();
SideScroll.start('meteor', false);
const S = SideScroll.active;
for (const [name, col] of [['meteor_seg4', 78], ['meteor_seg6', 116]]) {
  S.camX = Math.max(0, Math.min(col * 16 - 200, S.def.w * 16 - NQ.Sprites ? 99999 : 0));
  S.camX = Math.max(0, col * 16 - 240);
  S.p.x = col * 16; S.p.y = SideScroll.groundYAt(S, S.p.x) - 1;
  Game.banners = []; Game.toasts = [];
  H.render();
  fs.writeFileSync(__dirname + '/../shots/' + name + '.png', H.canvas.toBuffer('image/png'));
}
console.log('platform shots written');
