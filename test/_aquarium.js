// COMBI'S AQUARIUM: a buoy in the Workshop dive-pool drops into an underwater tank of
// swimming mermaids, CAPRICORNS (new combiner recipe), and ambient reef friends; a second
// bubble surfaces at the Vale's long-unused south lake. Mermaids/capricorns left the
// Workshop lagoon.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS, CREATURES } = NQ;
const T = 16;
H.startPlay();

// the map + its water nature
const aq = MAPS.aquarium;
H.assert(aq && aq.underwater, 'the Aquarium exists and is underwater');
H.assert(['seahorse', 'angelfish', 'pufferfish', 'starfish', 'mermaidsea'].every(k => CREATURES[k]), 'the new reef friends are registered');
// the reef fish are now CATCHABLE (they enter the inventory) and spawn in the wild
for (const f of ['seahorse', 'angelfish', 'pufferfish', 'starfish']) {
  H.assert(CREATURES[f].catch.length > 0 && CREATURES[f].bait, f + ' is catchable (tools + bait)');
}
Game.loadMap('coast');
const wild = {}; for (const c of Game.creatures) wild[c.species] = (wild[c.species] || 0) + 1;
H.assert(['seahorse','angelfish','pufferfish','starfish'].every(f => (wild[f] || 0) >= 1), 'all four reef fish now swim wild at the Sunsplash Coast');
{ const sh = Game.creatures.find(c => c.species === 'seahorse'); Game.log.seahorse = 0; Game.capture(sh, 'net');
  H.assert(Game.log.seahorse === 1, 'catching a seahorse adds it to the capture log (inventory)'); }
Game.loadMap('aquarium');
H.assert(NQ.Sprites.creatures.mermaidsea && NQ.Sprites.creatures.seahorse.right[0], 'their placeholder sprites installed');

// CAPRICORN is a combiner recipe now (half ram, half fish)
const cap = Game.RECIPES.find(r => r.id === 'capricorn');
H.assert(cap && cap.parts.ram && cap.parts.shark, 'CAPRICORN = ram + shark in the combiner');

// mermaids/capricorns are GONE from the Workshop lagoon; a buoy replaced them
Game.loadMap('workshop');
Game.flags.life_mermaid = 3; Game.flags.life_capricorn = 2;
Game.creatures = Game.creatures.filter(c => !c.display); Game.populateZoo(MAPS.workshop);
H.assert(Game.creatures.filter(c => c.display && c.species === 'mermaid').length === 1 && !Game.creatures.some(c => c.display && c.species === 'capricorn'), 'ONE greeter mermaid in the lagoon; capricorns swim only in the aquarium');
const wbuoy = MAPS.workshop.objects.find(o => o.type === 'buoy' && o.to === 'aquarium');
H.assert(wbuoy && wbuoy.free, 'the dive-pool buoy leads to the aquarium (no suit needed)');

// dive from the Workshop pool -> aquarium
Player.x = wbuoy.x * T + 8; Player.y = wbuoy.y * T + 8;
delete Game.flags.suit;
Game.interact();
H.assert(Game.mapId === 'aquarium', 'the buoy dives to the aquarium even without the suit');

// the tank is full: exhibit friends ALWAYS + your crafted mermaids/capricorns
const disp = Game.creatures.filter(c => c.display);
H.assert(disp.some(c => c.species === 'mermaidsea') && disp.some(c => c.species === 'seahorse'), 'the reef exhibit always swims');
H.assert(disp.some(c => c.species === 'mermaidsea') && disp.some(c => c.species === 'capricorn'), 'your crafted mermaids (underwater art) & capricorns joined them');
H.assert(disp.filter(c => c.species === 'mermaidsea').length >= 3 && disp.filter(c => c.species === 'capricorn').length === 2, 'shows your collection underwater (2 ambient + your 3), capped');

// PET a reef friend (SPACE)
const fish = disp[0];
Player.x = fish.x; Player.y = fish.y + 6; Game.toasts = [];
Game.interact();
H.assert(Game.toasts.some(t => /wiggles happily|GOBBLES/.test(t.text)), 'you can PET the aquarium friends');

// containment: 400 frames, nobody leaves the tank
for (let i = 0; i < 400; i++) H.step(1);
for (const c of Game.creatures) if (c.display) {
  const ok = c.x >= 0 && c.x <= aq.w * T && c.y >= 0 && c.y <= aq.h * T;
  H.assert(ok, c.species + ' stays inside the aquarium');
}

// the two exits: a bubble up to the Workshop pool, a bubble to the VALE LAKE
const bubbles = aq.objects.filter(o => o.type === 'bubble');
H.assert(bubbles.some(b => b.to === 'workshop') && bubbles.some(b => b.to === 'vale'), 'bubbles surface at the Workshop pool AND the Vale lake');

// and the matching buoy sits in the Vale's south lake
const vbuoy = MAPS.vale.objects.find(o => o.type === 'buoy' && o.to === 'aquarium');
H.assert(vbuoy && vbuoy.free, 'the Vale south lake finally has a purpose: a buoy to the aquarium');
// round-trip: aquarium -> vale lake -> back to aquarium
const toVale = bubbles.find(b => b.to === 'vale');
Player.x = toVale.x * T + 8; Player.y = toVale.y * T + 8;
Game.interact();
H.assert(Game.mapId === 'vale', 'surfacing at the Vale lake works');
Player.x = vbuoy.x * T + 8; Player.y = vbuoy.y * T + 8;
Game.interact();
H.assert(Game.mapId === 'aquarium', 'and the Vale-lake buoy dives right back — the pond & lake are connected');

console.log('AQUARIUM PASS — capricorn recipe, an underwater tank of swimmers, and the Vale lake connected');
