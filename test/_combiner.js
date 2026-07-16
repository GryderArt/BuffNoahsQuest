// THE CREATURE COMBINER: tiered recipes, ingredient checks, friends-transform (never lost),
// crafted rares land in the log + workshop pens; the capstone consumes CRAFTED rares.
const H = require('./harness'); const { NQ } = H;
const { Game, MAPS } = NQ;
const selById = (id) => { Game.menu.items = Game.combineStock(); Game.menu.sel = Game.menu.items.findIndex(it => it.rid === id); };
H.startPlay();   // fresh save: the workshop + every recipe are visible from day one

// open via COMBI the tinker-bot
Game.loadMap('workshop');
const combi = MAPS.workshop.objects.find(o => o.type === 'npc' && o.who === 'combi');
Game.talkTo(combi);
H.assert(Game.state === 'menu' && Game.menu && Game.menu.type === 'combine', 'talking to COMBI opens the combiner menu');
H.assert(Game.menu.items.length === 10, 'ten recipes on the board (incl. CAPRICORN)');

// no tier locks: the hunt for ingredients IS the gate
H.assert(Game.combineStock().every(it => !it.locked) && Game.combineStock().length === 10, 'all ten recipes visible + unlocked from day one');

// missing ingredients: denied, nothing changes
Game.menu.sel = 0;
Game.combineSelected();
H.assert(!Game.log.rainbowsheep, 'no sheep, no rainbow');

// T1 craft: six sheep join hooves — with the full new-treasure fanfare
Game.log.sheep = 6; Game.flags.life_sheep = 6;
Game.combineSelected();
H.assert(Game.log.rainbowsheep === 1 && Game.log.sheep === 0 && Game.flags.life_rainbowsheep === 1,
  'RAINBOW SHEEP crafted; the six sheep transformed (log + life both moved)');
H.assert(Game.state === 'itemget' && Game.itemGetData && Game.itemGetData.iconKey === 'creature:rainbowsheep',
  'crafting stars the new friend in the ITEM-GET celebration');
H.assert(NQ.Game.itemIcon('creature:rainbowsheep'), 'the celebration icon resolves to the creature sprite');
for (let i = 0; i < 30; i++) H.render();   // the pop-in blooms per FRAME RENDER — let it grow
H.assert(Game.state === 'itemget', 'fanfare holds until the player taps a key');
H.shot('craft_fanfare');
Game.itemGetData = null; Game.openCombiner();

// with the right ingredients, anything crafts — no artificial waiting
Game.log.goat = 4; Game.log.ibex = 2;
selById('glittergoat');
Game.combineSelected();
H.assert(Game.log.glittergoat === 1 && Game.log.goat === 0 && Game.log.ibex === 0, 'GLITTER GOAT crafted with ingredients alone');
Game.itemGetData = null; Game.openCombiner();

// mythics still naturally wait for the stable dungeon's catch
Game.log.horse = 1; Game.log.condor = 2;
selById('pegasus');
Game.combineSelected();
H.assert(Game.log.pegasus === 1 && Game.log.horse === 0, 'PEGASUS: a horse takes the sky');
Game.itemGetData = null; Game.openCombiner();

// the capstone consumes CRAFTED rares — deep replay
Game.log.ram = 4; Game.log.snowhare = 2;
selById('glimmerram'); Game.combineSelected();
H.assert(Game.log.glimmerram === 1, 'GLIMMER RAM crafted');
Game.itemGetData = null; Game.openCombiner();
Game.log.dragon = 1; Game.log.unicorn = 1;
Game.log.rainbowsheep = 1; Game.log.glittergoat = 1;   // (re-set: keep one of each on hand)
selById('prismabeast');
Game.combineSelected();
H.assert(Game.log.prismabeast === 1 && Game.log.glimmerram === 0 && Game.log.rainbowsheep === 0,
  'PRISMA-BEAST consumes crafted rares — the long game');
Game.itemGetData = null; Game.openCombiner();

// crafted friends live in the pens + the capture log knows their names
H.assert(NQ.CREATURES.prismabeast.name === 'Prisma-Beast' && NQ.Sprites.creatures.prismabeast.right[0], 'sprite + name registered');
Game.flags.life_mermaid = 2;
Game.creatures = Game.creatures.filter(c => !c.display);
Game.populateZoo(MAPS.workshop);
H.assert(Game.creatures.some(c => c.display && c.species === 'prismabeast'), 'the PRISMA-BEAST struts in the mythic field');
H.assert(Game.creatures.filter(c => c.display && c.species === 'mermaid').length === 1, 'ONE greeter mermaid sits in the Tinker Annex surface pool (the rest swim in the AQUARIUM)');
H.assert(NQ.CREATURES.mermaid.sea === true, 'mermaids are proper sea-folk');

// menu renders (screenshot with the machine + menu up)
selById('prismabeast');
H.render(); H.shot('combiner_menu');
console.log('COMBINER PASS — 9 tiered recipes, honest ingredient math, crafted rares on display');
