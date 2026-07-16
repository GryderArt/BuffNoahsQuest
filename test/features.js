const H = require('./harness');
const { NQ } = H;
const { Game, Player, SideScroll, UI } = NQ;

console.log('== escape does NOT skip a road ==');
H.startPlay();
Game.loadMap('vale'); delete Game.flags.road_bramble;
Game.state = 'worldmap'; Game.startWorldTravel(1);            // vale -> coast
let g = 0; while (Game.worldTravel && g++ < 4000) H.step(1);
H.assert(Game.state === 'side' && SideScroll.active && SideScroll.active.id === 'bramble', 'bramble ambush triggers en route');
H.press('Escape');                                           // retreat
H.assert(Game.state === 'worldmap', 'retreat returns to the world map');
H.assert(!Game.worldTravel && !Game.pendingTravel, 'the trip is cancelled (no auto-advance)');
H.assert(!Game.flags.road_bramble, 'road is NOT cleared by retreating');
H.assert(Game.mapId === 'vale', 'Noah stays at the ORIGIN (vale) — no skip to the coast');

console.log('== walk-over pickups ==');
Game.state = 'play'; Game.loadMap('canyon');
const berry = Game.map.objects.find(o => o.type === 'berry'); Game.flags.berries = {};
Player.x = berry.x * 16 + 8; Player.y = berry.y * 16 + 12; Game.autoPickups();
H.assert(Game.flags.berries[berry.id], 'walking onto a rainbow berry picks it up (no SPACE)');
Game.itemGetData = null; Game.state = 'play';
Game.loadMap('wastes');
const shard = Game.map.objects.find(o => o.type === 'shard'); Game.flags.shards = {};
Player.x = shard.x * 16 + 8; Player.y = shard.y * 16 + 12; Game.autoPickups();
H.assert(Game.flags.shards[shard.id], 'walking onto a star shard picks it up (no SPACE)');

console.log('== clickable shop row ==');
Game.itemGetData = null; Game.state = 'play'; Game.loadMap('vale'); Game.flags.gloves = false; Game.flags.gems = 20;
Game.openShop(); H.render();
H.assert(UI.hot.length > 0, 'shop rows are registered as click targets');
const row = UI.hot[0];
UI.handleClick(row.x + row.w / 2, row.y + row.h / 2);        // click the first item (gloves)
H.assert(Game.flags.gloves, 'clicking a shop row buys that item');

console.log('== clickable world-map node ==');
Game.itemGetData = null; Game.state = 'play'; Game.loadMap('vale');
Game.flags.coastPath = true; Game.state = 'worldmap'; Game.worldCursor = 0; Game.worldTravel = null;
H.render();
const coast = UI.hot[1];                                     // node order = vale, coast, wastes, canyon
UI.handleClick(coast.x + coast.w / 2, coast.y + coast.h / 2);
H.assert(Game.worldCursor === 1, 'clicking the coast node selects it');
H.assert(!!Game.worldTravel, 'clicking an unlocked node starts travel');

console.log('FEATURES PASS — escape, pickups, and clicks all verified');
