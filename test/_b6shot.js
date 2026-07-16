// ROOT HOLLOWS screenshots: heart-root + bulb / grown bridge-root / stuck Thornback
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi: true, ramHead: true, parents: true, ramsuit: true, suit: true, bracers: true,
  net: true, harpoon: true, bone: true, cage: true, ramGlow: true, ramShrink: true });
Game.flags['intro_burrow6'] = 1;
Game.loadMap('burrow6'); Game._pendingIntro = null; Game.state = 'play';
const m = Game.map;
const bulb = (id) => m.objects.find(o => o.type === 'sapbulb' && o.id === id);

// 1) the heart-root, trunk sap flowing, bulb A at hand
H.place(20, 21); Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 4;
for (let i = 0; i < 10; i++) H.step(1);
H.shot('b6_heart');

// 2) the bridge-root grown over the pit, main line pulsing
bulb('A').state = 'E'; bulb('B').state = 'E'; H.step(4);
H.place(44, 20); Game.companion.x = Player.x - 12; Game.companion.y = Player.y + 4;
for (let i = 0; i < 8; i++) H.step(1);
H.shot('b6_bridge');

// 3) Thornback glued in the sticky channel, thorns strewn
bulb('D').state = 'E'; H.step(4);
H.place(58, 22); Game.companion.x = Player.x - 14; Game.companion.y = Player.y + 4; H.step(2);
const b = Game.boss;
if (b) {
  b.awake = true; b.x = 58 * 16 + 8; b.y = 19 * 16 + 8;
  b._thorns = [[56, 16], [57, 15], [59, 14], [60, 15], [61, 17], [57, 22], [55, 18]].map(([x, y]) => ({ x: x * 16 + 8, y: y * 16 + 8, life: 5 }));
  b.stuckT = 2.5; b.shieldT = 2.5; b.tstate = 'stuck';
}
H.step(1);
if (Game.boss) { Game.boss.x = 58 * 16 + 8; Game.boss.y = 19 * 16 + 8; Game.boss.stuckT = 2.5; Game.boss.shieldT = 2.5; }
H.shot('b6_den');
console.log('B6 SHOTS saved');
