// THE FLOATING AVIARY: crafted with the SKY-FEATHER, a bright cloud opens in the Workshop
// mythic pen -> a side-scroll free-flight sky where your winged friends drift. Pet them,
// swoop the rings, leave via the HOME cloud or ESC.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS, CREATURES } = NQ;
const T = 16;
H.startPlay();

// crafting the aviary at the decor catalog consumes the skyfeather + opens the cloud
Game.loadMap('workshop');
const cat = MAPS.workshop.objects.find(o => o.type === 'decorcatalog');
Player.x = cat.x * T + 8; Player.y = cat.y * T + 8;
Game.flags.coins = 9999; Game.flags.mats.skyfeather = 1;
Game.openDecorCatalog();
const ai = Game.menu.items.findIndex(it => it.key === 'aviary');
H.assert(ai >= 0 && /AVIARY/.test(Game.menu.items[ai].label) && /SKY-FEATHER/.test(Game.menu.items[ai].label), 'the FLOATING AVIARY is craftable with a SKY-FEATHER');
Game.menu.sel = ai; Game.menuConfirm();
H.assert(Game.flags.aviary === true && Game.flags.mats.skyfeather === 0, 'crafting it consumes the sky-feather and sets the flag');
Game.state = 'play'; Game.itemGetData = null;
const cloud = MAPS.workshop.objects.find(o => o.type === 'aviarycloud');
H.assert(cloud && cloud.x >= 19 && cloud.x <= 31, 'a bright AVIARY CLOUD opens in the mythic pen');

// step into the cloud -> the aviary
Game.flags.life_griffin = 1; Game.flags.life_pegasus = 2;   // some winged friends to show
Player.x = cloud.x * T + 8; Player.y = cloud.y * T + 8;
Game.interact();
H.assert(Game.state === 'aviary' && Game.aviary, 'stepping into the cloud opens the AVIARY');
const A = Game.aviary;
H.assert(A.creatures.some(c => c.species === 'griffin') && A.creatures.some(c => c.species === 'pegasus'), 'your winged friends drift in the aviary');
H.assert(A.rings.length >= 5, 'glowing rings float in the sky');

// free flight: pressing a direction moves Noah that way (no gravity)
const p = A.p; const x0 = p.x;
H.hold('ArrowRight', true); for (let i = 0; i < 40; i++) H.step(1); H.hold('ArrowRight', false);
H.assert(p.x > x0, 'ARROWS free-fly Noah (moved right)');
const y0 = p.y;
H.hold('ArrowUp', true); for (let i = 0; i < 40; i++) H.step(1); H.hold('ArrowUp', false);
H.assert(p.y < y0, 'and up — full 8-directional flight, no falling');

// swoop a ring -> counted
const rg = A.rings[0]; p.x = rg.x; p.y = rg.y; p.vx = 0; p.vy = 0;
Game.updateAviary(1/60, []);
H.assert(rg.hit && A.ringsHit >= 1, 'flying through a ring collects it');

// PET a friend
const cr = A.creatures[0]; p.x = cr.x; p.y = cr.y; Game.toasts = [];
Game.updateAviary(1/60, [' ']);
H.assert(cr.petT > 0, 'SPACE near a friend pets it (it loops with joy)');

// leave via ESC -> back to the workshop
Game.updateAviary(1/60, ['Escape']);
H.assert(!Game.aviary && Game.mapId === 'workshop' && Game.state === 'play', 'ESC flies you home to the Workshop');

// re-entering rebuilds fresh; owning NO flyers still shows a couple ambient ones
delete Game.flags.life_griffin; delete Game.flags.life_pegasus; Game.log = {};
Game.startAviary();
H.assert(Game.aviary.creatures.length >= 2, 'even with no caught flyers, a couple ambient friends wheel there');
Game.exitAviary();

console.log('AVIARY PASS — skyfeather craft, bright cloud, free-flight sky, your winged friends, rings, pet, exit');
