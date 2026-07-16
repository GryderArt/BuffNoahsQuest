const H = require('./harness'); const { NQ } = H; const { Game, Sprites } = NQ;
H.assert(Sprites.scenes && Sprites.scenes.traderface && Sprites.scenes.traderface.width > 0, 'trader FACE crop loaded (dialogue zoom like the Lady)');
H.assert(Sprites.scenes.lady && Sprites.scenes.lady.width > 0, 'Lady portrait loaded');
H.startPlay(); Game.enterSlot('city');
const exits = {};
for (const id of ['cog1', 'cog2', 'cog3']) { Game.loadMap(id); exits[id] = Game.map.objects.find(o => o.type === 'portal' && o.to === 'world3map' && o.secret); }
H.assert(exits.cog1 && exits.cog1.req === 'sc_cog1', 'cog1 has a post-star EXIT to the overview map');
H.assert(exits.cog2 && exits.cog2.req === 'sc_lady', 'cog2 has a post-star EXIT to the overview map');
H.assert(exits.cog3 && exits.cog3.req === 'sc_cog3', 'cog3 has a post-star EXIT to the overview map');
Game.flags.intro_cog2 = false; Game._pendingIntro = null; Game.loadMap('cog2');
H.assert(Game._pendingIntro === 'cog2', 'first visit queues the guide/sign auto-intro');
const beats = Game.STAR_CUTSCENE(2, 'lady');
H.assert(beats.length >= 2 && typeof beats[0].draw === 'function', 'the star cutscene carries the level character');
const node = NQ.WORLD3_NODES; const xs = node.map(n => n.x);
H.assert(new Set(xs).size === xs.length, 'overview-map nodes are spaced out (no shared x)');
console.log('POLISH OK — trader face zoom, world-map exits, auto-intro, cutscene character, spaced map');
