// CRAFTING MATERIALS: scattered pickups that persist in flags.mats and are consumed by
// the decor catalog. Walk-over collection, first-of-kind fanfare, chest loot, HUD.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS } = NQ;
const T = 16;
H.startPlay();

// the mats namespaces exist
H.assert(Game.flags.mats && Game.flags.matsFound, 'flags.mats + flags.matsFound exist');
H.assert(NQ.Sprites.items.pearl && NQ.Sprites.items.skyfeather && NQ.Sprites.items.tire, 'material icons built');

// each craftable material is scattered somewhere reachable
const scattered = {};
for (const id of Object.keys(MAPS)) for (const o of MAPS[id].objects) if (o.type === 'material') scattered[o.mat] = (scattered[o.mat] || 0) + 1;
for (const mat of ['spring', 'tire', 'pearl', 'seedbag', 'marble', 'bucket']) H.assert(scattered[mat] >= 1, mat + ' is scattered in the world');
H.assert(!scattered.skyfeather, 'the SKY-FEATHER is NOT loose in the world (it lives atop the Ascent)');

// walk over a material -> collected once, count goes up, fanfare on the first
const stable = MAPS.stable;
const spring = stable.objects.find(o => o.type === 'material' && o.mat === 'spring');
H.assert(spring, 'a SPRING waits in the stable');
Game.loadMap('stable');
Game.flags.mats.spring = 0; delete Game.flags.matsFound[spring.id];
Player.x = spring.x * T + 8; Player.y = spring.y * T + 8;
Game.autoPickups();
H.assert(Game.flags.mats.spring === 1, 'walking over the SPRING collects it (+1)');
H.assert(Game.flags.matsFound[spring.id], 'the pickup is marked found (never re-collect the same one)');
H.assert(Game.state === 'itemget' && /SPRING/.test(Game.itemGetData.title), 'the first of a kind plays the treasure fanfare');
Game.state = 'play'; Game.itemGetData = null;
// re-walking does nothing
Game.autoPickups();
H.assert(Game.flags.mats.spring === 1, 'the same pickup never gives a second SPRING');

// chests can drop materials too
Game.flags.mats.pearl = 0;
Game.giveLoot({ mat: 'pearl' });
H.assert(Game.flags.mats.pearl === 1, 'a chest {mat:pearl} gives a PEARL');

console.log('MATERIALS PASS — scattered pickups, once-only collection, first-kind fanfare, chest loot');
