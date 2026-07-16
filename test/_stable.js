// THE ROYAL STABLEWORKS: Cogwerk side-dungeon — skittish horses (HAY-baited cages only),
// bone-latched lion den, regrowing hay bales, and a world-3 node gated on the first star.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS, CREATURES } = NQ;
H.startPlay();

// the node
const node = NQ.WORLD3_NODES.find(n => n.id === 'stable');
H.assert(node && node.req === 'sc_cog1', 'Stableworks node exists, gated on the first star-cell');
H.assert(NQ.WORLD3_NODES.filter(n => n.id === 'stable').length === 1, 'node registered exactly once');

// the species
H.assert(CREATURES.horse.catch.length === 1 && CREATURES.horse.catch[0] === 'cage' && CREATURES.horse.bait === 'hay',
  'horses: CAGE-only, HAY-only — nets are useless (the new food matters)');
H.assert(CREATURES.lion.catch[0] === 'stun' && CREATURES.lion.stunThen === 'net' && CREATURES.lion.aggressive,
  'lions: bonk sleepy then net, and they fight back');
H.assert(NQ.Sprites.creatures.horse.right[0] && NQ.Sprites.creatures.lion.right[0], 'placeholder sprites installed');

// the dungeon (by the time it unlocks, Ramsi rides along — the hay hook lives on her update)
Game.flags.ramsi = true; Game.flags.world2 = true;
Game.loadMap('stable');
const m = MAPS.stable;
const horses = Game.creatures.filter(c => c.species === 'horse');
const lions = Game.creatures.filter(c => c.species === 'lion');
H.assert(horses.length === 5 && lions.length === 3, '5 wild horses + 3 lions (' + horses.length + '/' + lions.length + ')');
H.assert(m.doors['29,9'] && m.doors['29,9'].kind === 'bone', 'the lion den hides behind a BONE-LATCH');
H.assert(m.objects.filter(o => o.type === 'haybale').length === 3, '3 hay bales in the barn');
H.assert(m.objects.some(o => o.type === 'chest'), 'a treasure chest guards the den');

// hay gathering: walk to a bale -> +2 hay; bales regrow on re-entry
const bale = m.objects.find(o => o.type === 'haybale');
const hay0 = Game.flags.baits.hay;
Player.x = bale.x * 16 + 8; Player.y = bale.y * 16 + 8;
H.step(2);
H.assert(Game.flags.baits.hay === hay0 + 2 && bale.done, 'walking up gathers +2 HAY');
H.step(2);
H.assert(Game.flags.baits.hay === hay0 + 2, 'a spent bale gives nothing more');
Game.loadMap('vale'); Game.loadMap('stable');
H.assert(!MAPS.stable.objects.find(o => o.type === 'haybale').done, 'hay regrows on every visit');

// render + shot
Player.x = 12 * 16; Player.y = 16 * 16;
H.render(); H.shot('stable_dungeon');
console.log('STABLE PASS — gated node, hay economy, cage-only horses, bone-latched lions');
