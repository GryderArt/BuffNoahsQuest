// THE HIGH ROOFS — 3x-wide skyline; JUMP<HARPOON<GLIDE hierarchy; chase & corner Blazagon for star #3
const H = require('./harness'); const { NQ } = H; const { Game, Player, TILEDEFS, CREATURES } = NQ;
Object.assign(Game.flags, { ramsi: true, world2: true, ramGlide: true, harpoon: true, net: true, sandals: true });
H.startPlay(); Game.enterSlot('city'); Game.flags.starcells = {};
Game.loadMap('cog3'); Game.flags.intro_cog3 = 1; Game._pendingIntro = null; Game.dialog = null; const m = Game.map;
H.assert(m.id === 'cog3' && m.zone === 'city' && m.noFly, 'in The High Roofs (city, no free flight)');
H.assert(m.w >= 140, 'the skyline is 3x wide (' + m.w + ' tiles)');

let roof = 0, gap = 0; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const id = m.tiles[y][x]; if (id === 'roof' || id === 'roofb') roof++; if (id === 'skygap') gap++; }
H.assert(roof > 300, 'lots of walkable rooftops (' + roof + ')');
H.assert((TILEDEFS.skygap || {}).hole === true, 'the sky-gap is a FALL tile');

// HIERARCHY: medium gaps get HARPOON anchors, the widest get GLIDE points; small gaps are jump-only
const posts = m.objects.filter(o => o.type === 'post'), glides = m.objects.filter(o => o.type === 'glidevent');
H.assert(posts.length === 3, 'HARPOON anchors at the medium gaps (' + posts.length + ')');
H.assert(glides.length === 3, 'GLIDE points at the widest chasms (' + glides.length + ')');
H.assert(glides.every(g => Math.abs(g.to[0] - g.x) >= 8), 'every GLIDE chasm is far too wide to jump or harpoon (>=8 tiles)');

// HARPOON grapples Noah across a medium gap to the anchor
const post = posts[0]; let pxx = post.x - 1;
while (pxx > 0 && !['roof', 'roofb', 'parapet', 'skylight', 'acunit'].includes(m.tiles[post.y][pxx])) pxx--;
Player.x = pxx * 16 + 8; Player.y = post.y * 16 + 12; Player.dir = 'right'; Player.harpoon = null; Player.tool = 'harpoon'; Player.useTool();
H.assert(Player.harpoon, 'harpoon fires at the anchor across the gap');
for (let i = 0; i < 90 && Player.harpoon; i++) Player.updateHarpoon(m, 1 / 30);
H.assert(Math.abs(Player.x - (post.x * 16 + 8)) < 18, 'HARPOON grapples Noah across to the anchor roof');

// building FACADES descend below the roofs (tower walls), deep void between them
H.assert(Array.isArray(m._facadeTop) && m._facadeTop.some(v => v >= 0) && m._facadeTop.some(v => v < 0), 'tall building FACADES under roofs, void between towers');

// BLAZAGON CHASE: bolts to a new tower each net hit, caught only on the LAST roof
const bz = Game.creatures.find(c => c.species === 'blazagon');
H.assert(bz && bz._chaseMax === 4 && CREATURES.blazagon.catch[0] === 'net', 'Blazagon prowls, NET-only, with a 4-hop chase');
Player.x = m.start.x * 16 + 8; Player.y = m.start.y * 16 + 12;        // stand somewhere safe while we sim the hops
let prevX = bz.x;
for (let hop = 1; hop <= 4; hop++) {
  Game.capture(bz, 'net');
  H.assert(bz._leap && bz.state === 'leaping', 'NET ' + hop + ': Blazagon RUNS & LEAPS off (animated, not teleport)');
  for (let i = 0; i < 80 && bz._leap; i++) H.step(1);                 // let the run+leap arc finish
  H.assert(!bz._leap && bz._chase === hop && Math.abs(bz.x - prevX) > 8, '   ...he lands on a new tower (escape ' + hop + '/4)');
  prevX = bz.x;
}
H.assert(bz.state !== 'gone', 'after 4 escapes he is still free on the last roof');
Game.flags.starcells = {}; Game.state = 'play';
Game.capture(bz, 'net');
H.assert(bz.state === 'gone' && Game.flags.starcells['sc_cog3'] === true, 'cornered on the LAST roof, he is CAUGHT -> star #3');

// on the World-3 map, gated behind the Pipeworks star
const node = NQ.WORLD3_NODES.find(n => n.id === 'cog3');
H.assert(node && node.req === 'sc_lady', 'The High Roofs sits on the World-3 map (after the Pipeworks)');
console.log('ROOFTOPS OK — 3x skyline, jump<harpoon<glide hierarchy, facades, and the multi-roof BLAZAGON chase');
