const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, MAPS, WORLD3_NODES } = NQ;

H.startPlay(); Game.enterSlot('city');
// the Vale clockwork gate -> Cogwerk City, gated on Ramsi
const vg = MAPS.vale.objects.find(o => o.type === 'portal' && o.to === 'cog1');
H.assert(vg && vg.req === 'ramsi', 'a CLOCKWORK GATE in the Vale opens to Cogwerk City once you have Ramsi');
// World-3 nodes exist
H.assert(WORLD3_NODES && WORLD3_NODES.find(n=>n.id==='cog1') && WORLD3_NODES.find(n=>n.id==='cog2') && WORLD3_NODES.find(n=>n.exit), 'World-3 map has Cogwerk City, the Pipeworks, and a Vale exit');
H.assert(WORLD3_NODES.find(n=>n.id==='cog2').req === 'sc_cog1', 'the Pipeworks is locked until you win Cogwerk City\'s star');
H.assert(WORLD3_NODES.find(n=>n.id==='cog3').req === 'sc_lady', 'The High Roofs is locked until the Pipeworks star (sc_lady)');

// ESC from a city level opens the WORLD-3 map (not the Vale)
H.assert(Game.mapId === 'cog1', 'in Cogwerk City');
Game.state = 'play'; H.press('Escape');
H.assert(Game.state === 'world3map', 'ESC opens the dedicated WORLD-3 map');
H.assert(Game.world3Cursor === 0 && Game.world3Here() === 0, 'cursor starts on Cogwerk City');

// snapshot the World-3 map
Game.banners=[]; Game.toasts=[]; H.render(); fs.writeFileSync(__dirname+'/../shots/world3_map.png', H.canvas.toBuffer('image/png'));

// the Pipeworks node is locked until star #1; unlock it and travel there (Noah now WALKS)
Game.flags.starcells = { sc_cog1: true };
Game.world3Cursor = 1; H.press(' ');
H.assert(Game.world3Travel, 'picking a node starts the walk');
for (let i = 0; i < 600 && Game.state !== 'side'; i++) H.step(1);
H.assert(Game.state === 'side' && NQ.SideScroll.active.id === 'gearline', 'first trip to the Pipeworks: THE GEAR-LINE ambushes mid-walk');
NQ.SideScroll.finish(true);
for (let i = 0; i < 600 && Game.state !== 'play'; i++) H.step(1);
H.assert(Game.state === 'play' && Game.mapId === 'cog2', 'winning the interlude resumes the walk into cog2');
// ESC from the Pipeworks -> World-3 map again; the Vale exit returns to World 1
Game.state = 'play'; H.press('Escape');
H.assert(Game.state === 'world3map' && Game.world3Here() === 1, 'ESC from the Pipeworks re-opens the World-3 map (cursor on it)');
Game.world3Cursor = WORLD3_NODES.findIndex(n => n.exit); H.press(' ');
H.assert(Game.state === 'play' && Game.mapId === 'vale', 'the Greenwood Vale node leaves World 3 back to World 1');
// and ESC from the Vale uses the NORMAL world map, not the World-3 one
Game.state = 'play'; H.press('Escape');
H.assert(Game.state === 'worldmap', 'ESC in the Vale still opens the ORIGINAL world map');
console.log('WORLD-3 MAP OK — Vale gate, dedicated ESC map, Pipeworks gated on star #1, Vale exit, normal map elsewhere');
