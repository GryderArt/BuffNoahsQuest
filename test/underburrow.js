// FULL World-2 (The Underburrow) progression, REBUILT flow: open creature-worlds where beating
// each WARDEN (Ramsi headbutt + Noah's tool) unlocks its caged PILLOW-KIN, and freeing the Kin
// awakens a new power. Verifies: vale entry + intro, all 4 Wardens + Kin/abilities, the 4-Warden
// gauntlet (fresh g_* flags), and GNASH -> reunion -> credits.
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;
function applyTool(t, b) {
  if (t === 'mitts') { Player.x = b.x; Player.y = b.y; Player.dir = 'right'; Player.lungeT = 0.2; }
  else if (t === 'net') { Player.x = b.x; Player.y = b.y; Player.netT = 0.2; }
  else if (t === 'harpoon') Player.harpoon = { x: b.x, y: b.y, vx: 0, vy: 0, dist: 0, max: 300, state: 'out' };
  else if (t === 'bone') Player.bone = { x: b.x, y: b.y, vx: 0, vy: 0, t: 0.1 };
}
function beatWarden(name, tool) {            // Ramsi headbutts (auto, when near) -> Noah lands the tool
  let broke = false;
  for (let i = 0; i < 2200 && Game.boss; i++) {
    const b = Game.boss; Player.hearts = Player.maxHearts;
    Player.x = b.x - 10; Player.y = b.y; Player.dir = 'right';
    Game.companion.x = b.x; Game.companion.y = b.y;
    if (b.awake && b.shieldT > 0) { broke = true; b.inv = 0; applyTool(tool, b); }
    H.step(1);
  }
  H.assert(broke, name + ': Ramsi headbutts and Noah lands the co-op blow');
  H.assert(Game.flags[name] || Game.flags['g_' + name], name + ' caught');
}
function gear() {
  Object.assign(Game.flags, { ramsi: true, world2: true, ramHead: true, ramStun: true, ramShield: true, ramBoost: true,
    parents: true, ramsuit: true, sandals: true, gloves: true, bracers: true, suit: true, wings: true,
    net: true, harpoon: true, bone: true, cage: true });
  Game.flags.baits = { clover: 9, tincan: 9, fishsnack: 9, cookie: 9, berry: 9 };
}
H.startPlay(); gear();

// ===== ENTRY: the burrow opens in Greenwood Vale; first dive plays the intro =====
Game.loadMap('vale'); Game.state = 'play';
const ent = Game.map.objects.find(o => o.type === 'portal' && o.to === 'burrow5');
H.assert(!!ent, 'a burrow entrance exists in Greenwood Vale');
H.place(ent.x, ent.y); H.step(1);
H.assert(Game.flags.underburrow, 'stepping in unlocks the Underburrow');
H.assert(Game.state === 'cutscene', 'the intro cutscene plays');
for (let i = 0; i < 6 && Game.state === 'cutscene'; i++) { Game.cutscene.t = 1; Game.advanceCutscene(); }
H.assert(Game.mapId === 'burrow5', 'intro over -> Topsoil Tunnels');

// ===== each world: open herds + beat the WARDEN (headbutt) + free the KIN (gated) -> power =====
function world(map, herdSpecies, den, boss, tool, kinXY, kinName, powers) {
  Game.loadMap(map); Game.state = 'play'; H.place(4, 20); H.step(2);
  const herd = {}; for (const cr of Game.creatures) herd[cr.species] = (herd[cr.species] || 0) + 1;
  H.assert(herdSpecies.every(s => herd[s] >= 1), map + ': open world stocked with herds to catch (' + JSON.stringify(herd) + ')');
  H.place(den[0], den[1]); H.step(2);
  H.assert(Game.boss && Game.boss.name === boss, map + ': ' + boss + ' guards the den');
  // the Kin cage is locked until the Warden falls
  H.place(kinXY[0], kinXY[1] + 1); H.face('up'); Game.interact();
  H.assert(!Game.flags['kin_' + ({ mottle: 1, thornback: 2, geode: 3, grub: 4 })[boss]], kinName + ' cage is locked while ' + boss + ' stands');
  H.place(den[0], den[1]); H.step(2);
  beatWarden(boss, tool);
  H.place(kinXY[0], kinXY[1] + 1); H.face('up'); Game.interact();
  H.assert(powers.every(p => Game.flags[p]), 'freeing ' + kinName + ' awakens ' + powers.join(' + '));
}
world('burrow5', ['sheep', 'goat'], [58, 20], 'mottle', 'mitts', [61, 15], 'MR. RAM', ['ramGlow', 'ramShrink']);
world('burrow6', ['octopus', 'goat'], [56, 17], 'thornback', 'net', [61, 11], 'BEAST MIMI', ['ramBounce', 'ramDecoy']);
world('burrow7', ['capricorn', 'ibex'], [56, 17], 'geode', 'harpoon', [61, 12], 'TOOTHLESS', ['ramGlide', 'ramRoll']);
world('burrow8', ['alien', 'cometpup'], [62, 20], 'grub', 'bone', [68, 15], 'LUCKY', ['ramPound']);
H.assert(Game.flags.pillowkin === 4, 'all four Pillow-Kin freed');

// ===== THE GAUNTLET: all four re-summoned (fresh g_* flags) =====
for (const [map, boss, tool] of [['vault1', 'mottle', 'mitts'], ['vault2', 'thornback', 'net'], ['vault3', 'geode', 'harpoon'], ['vault4', 'grub', 'bone']]) {
  Game.loadMap(map); Game.state = 'play'; H.place(4, 7); H.step(2);
  H.assert(Game.boss && Game.boss.name === boss && Game.boss.gauntlet, map + ': ' + boss + ' re-summoned');
  beatWarden(boss, tool);
  H.assert(Game.flags['g_' + boss], map + ': g_' + boss + ' set');
}

// ===== GNASH: 3 phases (uses Pound/Roll), then reunion -> credits =====
Game.loadMap('gnash_throne'); Game.state = 'play'; H.place(20, 11); H.step(2);
H.assert(Game.boss && Game.boss.name === 'gnash', 'GNASH spawned');
const phases = new Set();
for (let i = 0; i < 6000 && Game.boss && Game.state === 'play'; i++) {
  const b = Game.boss; phases.add(b.phase); Player.hearts = Player.maxHearts;
  Player.x = b.x - 10; Player.y = b.y; Player.dir = 'right';
  Game.companion.x = b.x; Game.companion.y = b.y + 4;
  if (b.phase !== 2) { b.surf = 1; Game.companion.poundCool = 0; }
  if (b.caughtAnim > 0) { H.step(1); continue; }
  const t = ['bone', 'harpoon', 'bone'][b.phase - 1];
  if (b.shieldT > 0) { b.inv = 0; applyTool(t, b); }
  else if (!(Game.companion.busyT > 0)) Game.ramsiCommand();
  H.step(1);
}
H.assert(phases.has(1) && phases.has(2) && phases.has(3), 'GNASH fought through all 3 phases');
H.assert(Game.flags.gnash, 'GNASH defeated');
H.assert(Game.state === 'cutscene', 'reunion cutscene plays');
for (let i = 0; i < 8 && Game.state === 'cutscene'; i++) { Game.cutscene.t = 1; Game.advanceCutscene(); }
H.assert(Game.state === 'play' && Game.mapId === 'vale', 'reunion -> home to the VALE at the Clockwork Gate (no mid-game credits)');
H.assert(Game.map.objects.some(o => o.type === 'portal' && o.to === 'cog1'), 'the Cogwerk gate stands ready — onward to World 3');
console.log('UNDERBURROW PASS — entry, 4 open creature-worlds + Wardens, gauntlet, GNASH, and the Cogwerk hand-off verified');
