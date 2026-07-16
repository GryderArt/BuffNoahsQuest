const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player, SideScroll } = NQ;
H.startPlay();
// 1) overworld creatures — the vale sheep meadow
Game.loadMap('vale'); Player.x = 22 * 16; Player.y = 14 * 16;
for (const c of Game.creatures) { c.x = Player.x + (Math.random()*120-60); c.y = Player.y + (Math.random()*60-10); }
H.step(3); H.render();
fs.writeFileSync(__dirname + '/../shots/scale_creatures.png', H.canvas.toBuffer('image/png'));
// 2) road enemies
SideScroll.start('bramble', false);
{ const S = SideScroll.active; S.camX = 24*16; S.p.x = 30*16; S.p.y = SideScroll.groundYAt(S, S.p.x)-1; }
H.render();
fs.writeFileSync(__dirname + '/../shots/scale_road.png', H.canvas.toBuffer('image/png'));
SideScroll.active = null; Game.state = 'play';
// 3) a chest — find the first map with one, frame Noah beside it
for (const id of Object.keys(NQ.MAPS)) {
  const m = NQ.MAPS[id]; const chest = m.objects.find(o => o.type === 'chest');
  if (!chest) continue;
  Game.loadMap(id); Player.x = chest.x*16 + 8; Player.y = chest.y*16 + 28; H.step(2); H.render();
  fs.writeFileSync(__dirname + '/../shots/scale_chest.png', H.canvas.toBuffer('image/png'));
  console.log('chest shot from map', id, 'at', chest.x, chest.y);
  break;
}
console.log('scale shots written');
