// THE GLIMMER DEEP: the secret crack behind the sunken ship leads to a pitch-dark,
// glitter-walled chimney — glow-algae light trail (lights fade!), anemone gates that
// open forever, glow-fish lanterns, LANTERNA's no-bite light puzzle, PEARL LANTERN.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS, CREATURES, TILEDEFS } = NQ;
const T = 16;
H.startPlay();

const gc = MAPS.glowcave;
H.assert(gc && gc.underwater && gc.dark && gc.lightMask, 'the Glimmer Deep exists: underwater + truly dark');
H.assert(gc.h > 100 && gc.w < gc.h / 3, 'a LONG, DEEP, NARROW chimney — a level shape no other map tries');
H.assert(CREATURES.glowfish && CREATURES.lanterna, 'glow fish + Lanterna registered');
H.assert(NQ.Sprites.creatures.glowfish.right[0] && NQ.Sprites.items.pearllantern, 'their sprites + the pearl-lantern icon installed');

// the crack hides right behind the sunken ship
const mouth = MAPS.aquarium.objects.find(o => o.type === 'cavemouth');
const ship = MAPS.aquarium.objects.find(o => o.type === 'sunkenship');
H.assert(mouth && ship && Math.abs(mouth.x - ship.x) <= 3, 'a secret crack hides behind the sunken ship');

// BFS reachability: gates SEAL the deep until lit open
function reach(m) {
  const seen = new Set(['15,3']), q = [[15, 3]];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || seen.has(k)) continue;
      if ((TILEDEFS[m.tiles[ny][nx]] || {}).solid) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  return seen;
}
H.assert(!reach(gc).has('15,112'), 'the anemone gates SEAL the deep at first');

// in through the crack
Game.flags['intro_aquarium'] = 1; Game._pendingIntro = null;
Game.loadMap('aquarium');
Player.x = mouth.x * T + 8; Player.y = mouth.y * T + 8;
Game.interact();
H.assert(Game.mapId === 'glowcave', 'SPACE at the crack squeezes into the Glimmer Deep');
H.assert(!Game.boss, 'the descent starts calm — no boss music at the top');
H.assert(Game.creatures.filter(c => c.species === 'glowfish' && c.display).length === 11, 'glow fish school in the pockets');

// glow algae: bump -> WAKES; then it fades on its own
const alg = Game.map.objects.find(o => o.type === 'glowalgae' && !o.bosslight);
Player.x = alg.x * T + 8; Player.y = alg.y * T + 8; H.step(2);
H.assert(alg.lit > 0.9, 'bumping a glow plant wakes it');
Player.x = 15 * T + 8; Player.y = 3 * T + 12;
for (let i = 0; i < 60 * 6; i++) H.step(1);
H.assert(alg.lit < 0.6 && alg.lit > 0, 'the glow slowly fades as you move on (' + alg.lit.toFixed(2) + ')');

// gate 1: light its teaching algae -> the anemones curl away FOREVER
const g1 = Game.map.objects.find(o => o.type === 'anemgate' && o.id === 1);
const teach = Game.map.objects.find(o => o.type === 'glowalgae' && o.x === 9 && o.y === 38);
H.assert(g1 && teach, 'gate 1 + its teaching algae exist');
Player.x = teach.x * T + 8; Player.y = teach.y * T + 8; H.step(3);
H.assert(g1.open === 1 && Game.flags.glowgate_1, 'light near the gate -> it opens, and the flag remembers');
H.assert(!(TILEDEFS[Game.map.tiles[40][8]] || {}).solid, 'the gate tiles are open water now');
const g2 = Game.map.objects.find(o => o.type === 'anemgate' && o.id === 2);
const teach2 = Game.map.objects.find(o => o.type === 'glowalgae' && o.x === 18 && o.y === 72);
Player.x = teach2.x * T + 8; Player.y = teach2.y * T + 8; H.step(3);
H.assert(g2.open === 1, 'gate 2 opens the same way');
H.assert(reach(Game.map).has('15,112'), 'with both gates open the bottom chamber is reachable');

// LANTERNA: wake her, read the kid-hint, light ALL THREE at once
Player.x = 15 * T + 8; Player.y = 108 * T + 8; H.step(3);
H.assert(Game.boss && Game.boss.name === 'lanterna', 'swimming deep enough calls LANTERNA out');
H.assert(Game.boss.awake, 'Lanterna wakes when Noah drifts near');
const hint = Game.bossHintLine();
H.assert(hint && /GLOW PLANTS/.test(hint.text), 'the pinned kid-hint says what to do: ' + (hint && hint.text));
const lights = Game.map.objects.filter(o => o.bosslight);
H.assert(lights.length === 3, 'three boss lights ring the chamber');
const hp0 = Player.hp;
for (const L of lights) { Player.x = L.x * T + 8; Player.y = L.y * T + 8; H.step(4); }
H.assert(lights.every(o => o.lit > 0.5), 'all three lit fast enough');
for (let i = 0; i < 60 * 3 && Game.boss; i++) H.step(1);
H.assert(!Game.boss && Game.flags.lanterna, 'ALL THREE at once -> Lanterna is befriended');
H.assert(Player.hp === hp0, 'a completely gentle fight: Noah never got hurt');

// the treasure: the pearl altar unseals -> PEARL LANTERN with the full fanfare
const altar = Game.map.objects.find(o => o.type === 'pearlaltar');
Player.x = altar.x * T + 8; Player.y = altar.y * T + 8;
Game.interact();
H.assert(Game.state === 'itemget' && Game.flags.pearllantern, 'the PEARL LANTERN treasure, full itemget fanfare');
Game.state = 'play'; Game.itemGetData = null; H.step(1);

// home again: the bubble beside the altar surfaces at the aquarium
const bub = Game.map.objects.find(o => o.type === 'bubble' && o.y > 100);
H.assert(bub, 'an exit bubble waits by the altar (no long climb back)');
Player.x = bub.x * T + 8; Player.y = bub.y * T + 8;
Game.interact();
H.assert(Game.mapId === 'aquarium', 'whoosh — back up beside the ship');

// LANTERNA + two glow fish now visit the mermaid pond
H.assert(Game.creatures.some(c => c.display && c.species === 'lanterna'), 'Lanterna visits the aquarium after her rescue');
H.assert(Game.creatures.filter(c => c.display && c.species === 'glowfish').length >= 2, '...with two glow-fish pals');

// containment + re-entry sanity: gates stay open, no boss respawn, fish stay inside
Game.loadMap('glowcave');
H.assert(!Game.boss, 'no boss respawn once Lanterna is a friend');
H.assert(Game.map.objects.filter(o => o.type === 'anemgate').every(o => o.open), 'the gates remember they are open');
for (let i = 0; i < 300; i++) H.step(1);
for (const c of Game.creatures) if (c.display) {
  H.assert(c.x > 0 && c.x < gc.w * T && c.y > 0 && c.y < gc.h * T, c.species + ' stays inside the cave');
}
console.log('GLIMMER DEEP PASS — secret crack, fading light-trail, anemone gates, a gentle boss, and the Pearl Lantern');
