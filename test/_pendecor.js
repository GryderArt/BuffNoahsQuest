// PEN DECORATIONS: the Workshop DECOR CATALOG sells toys/ponds/lamps for COINS,
// with the same full itemget fanfare as crafting a rare friend; decorations appear
// on the spot and pen friends stroll over to PLAY (the bouncy ball gets nudged!).
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS } = NQ;
const T = 16;
H.startPlay();

const w = MAPS.workshop;
const cat = w.objects.find(o => o.type === 'decorcatalog');
H.assert(cat, 'the DECOR CATALOG stands in the Workshop');
H.assert(w.objects.filter(o => o.type === 'pendecor').length === 6, 'six pen-decoration spots wait (the AVIARY is a special craft, no pen spot)');

// open the catalog
Game.loadMap('workshop');
Player.x = cat.x * T + 8; Player.y = cat.y * T + 8;
Game.interact();
H.assert(Game.state === 'menu' && Game.menu.type === 'decor', 'SPACE at the stand opens the catalog');
H.assert(Game.menu.items.length === 11 && /coins/.test(Game.menu.items[0].label), 'eleven wares (pen decor + aviary + aquarium/aviary craftables), priced in COINS');
H.assert(Game.menu.items.some(it => it.key === 'treasurechest' && /GOLD NUGGET/.test(it.label)) && Game.menu.items.some(it => it.key === 'suncrystal' && /VOID GEM/.test(it.label)), 'the secret-room rare materials craft NEW aquarium/aviary decor');
const ballItem = Game.menu.items.findIndex(it => it.key === 'ball');
H.assert(/SPRING/.test(Game.menu.items[ballItem].label), 'the ball now also asks for a SPRING material');

// enough coins but NO material -> still refused (the new gate)
Game.flags.coins = 9999; Game.flags.mats.spring = 0;
Game.menu.sel = ballItem; Game.menuConfirm();
H.assert(!Game.flags.decor_ball && Game.state === 'menu', 'coins alone no longer buy it — a material is required');

// too few coins (but has material) -> refused
Game.flags.coins = 10; Game.flags.mats.spring = 1;
Game.menuConfirm();
H.assert(!Game.flags.decor_ball, '10x price means 10 coins is not enough');

// rich AND holding the SPRING -> crafts, spends BOTH coins and the material
Game.flags.coins = 200; Game.flags.mats.spring = 1;
Game.menuConfirm();
H.assert(Game.flags.decor_ball === true, 'bought the BOUNCY BALL with coins + a SPRING');
H.assert(Game.flags.coins === 120, 'coins spent (200 - 80 = 120)');
H.assert(Game.flags.mats.spring === 0, 'the SPRING was consumed');
H.assert(Game.state === 'itemget' && Game.itemGetData && /BOUNCY BALL/.test(Game.itemGetData.title), 'the full new-treasure fanfare plays');
H.assert(Game.itemIcon('decor:ball') && Game.itemIcon('decor:ball').width, 'the fanfare shows the ball itself');
Game.state = 'play'; Game.itemGetData = null;      // dismiss the fanfare (it closed the menu, like the combiner)
Game.openDecorCatalog();
const bi = Game.menu.items.findIndex(it => it.key === 'ball');
H.assert(/placed!/.test(Game.menu.items[bi].label), 'reopening the catalog marks the ball (placed!)');

// buying again is a gentle no-op
const coins0 = Game.flags.coins;
Game.menu.sel = bi; Game.menuConfirm();
H.assert(Game.flags.coins === coins0, 'no double-charging for a placed decoration');
Game.menu = null; Game.state = 'play';

// friends react: a rare-pen sheep strolls to the ball and plays
Game.flags.life_rainbowsheep = 2;
Game.creatures = Game.creatures.filter(c => !c.display);
Game.populateZoo(w);
const sheep = Game.creatures.find(c => c.display && c.species === 'rainbowsheep');
H.assert(sheep, 'a rainbow sheep lives in the rare pen');
const ball = w.objects.find(o => o.type === 'pendecor' && o.key === 'ball');
let minD = 1e9, played = false, nudged = false;
Player.x = 17 * T; Player.y = 12 * T;                       // Noah stands clear
for (let i = 0; i < 60 * 30; i++) {
  H.step(1);
  const d = NQ.dist ? NQ.dist(sheep.x, sheep.y, ball.x * T + 8, ball.y * T + 8)
    : Math.hypot(sheep.x - (ball.x * T + 8), sheep.y - (ball.y * T + 8));
  if (d < minD) minD = d;
  if (d < 16) played = true;
  if (Math.abs(ball._vx || 0) + Math.abs(ball._vy || 0) > 1) nudged = true;
  if (played && nudged) break;
}
H.assert(minD < 16, 'the sheep strolled over to the ball (closest ' + minD.toFixed(1) + 'px)');
H.assert(played, 'and PLAYED beside it (hearts!)');

// render both: the pens with decor + the catalog menu (no crashes, art draws)
Game.flags.decor_pond = true; Game.flags.decor_flowerbed = true; Game.flags.decor_fountain = true;
Game.flags.decor_tireswing = true; Game.flags.decor_sealamp = true;
H.render();
Game.openDecorCatalog(); H.render();
Game.menu = null; Game.state = 'play';
console.log('PEN DECOR PASS — a coin catalog, the crafted-friend fanfare, live decorations, and friends who PLAY');
