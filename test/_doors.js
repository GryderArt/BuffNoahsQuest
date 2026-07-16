// SWITCH-OPENED DOORS VANISH: when a bone-boomerang / block-on-switch / Ramsi headbutt opens an
// in-level gate, the door tile visibly melts to floor (obvious feedback). Map-portal doors stay.
const H = require('./harness'); const { NQ } = H;
const { Game, MAPS, TILEDEFS } = NQ;
H.startPlay();
const isDoor = (m, x, y) => !!(TILEDEFS[m.tiles[y][x]] || {}).door;

// SKY2: a RAMSI-headbutt gate — DOOR(20,16,'flag','sky2_gate')
Game.loadMap('sky2');
let m = Game.map;
H.assert(isDoor(m, 20, 16), "the Ramsi cloud-gate starts as a solid DOOR tile");
H.assert(!Game.doorIsOpen(m, 20, 16), 'and starts closed');
Game.flags.sky2_gate = true;             // Ramsi butts the switch
Game.revealOpenedDoors(m);
H.assert(!isDoor(m, 20, 16), 'once Ramsi opens it, the DOOR TILE VISIBLY VANISHES');
H.assert(!(TILEDEFS[m.tiles[16][20]] || {}).solid, 'the opened tile is now walkable');

// BURROW8: a gate — DOOR(31,20,'flag','b8_g1')
Game.loadMap('burrow8');
m = Game.map;
H.assert(isDoor(m, 31, 20) && !Game.doorIsOpen(m, 31, 20), 'the burrow gate starts closed (a door tile)');
Game.flags.b8_g1 = true;                  // a switch fires
Game.revealOpenedDoors(m);
H.assert(!isDoor(m, 31, 20), 'opening it melts the door tile to floor');

// re-entering shows a previously-opened gate already open (silent)
Game.loadMap('burrow8');
H.assert(!isDoor(Game.map, 31, 20), 'a gate opened on a past visit shows open on re-entry');

// MAP-PORTAL doors (with a LINK) must NOT vanish — you walk INTO those to change maps
Game.loadMap('grannyzoo');
const z = Game.map;
const portal = (z.links || []).find(L => (z.doors || {})[L.x + ',' + L.y]);
H.assert(portal, 'the museum has portal doors (door + link)');
Game.flags.mus_cog = true; Game.flags.parents = true; Game.flags.ramsi = true;
Game.revealOpenedDoors(z);
H.assert(isDoor(z, portal.x, portal.y), 'a museum wing door (a map portal) is LEFT as a door — you still step through it');

console.log('DOORS PASS — switch-opened gates visibly vanish; map-portal doors stay; state persists');
