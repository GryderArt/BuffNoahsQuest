// PLAYTEST MODE (T at title): everything OPEN, nothing DONE, Noah undying,
// roads skipped — and the req-stripping reverses cleanly for normal games.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS } = NQ;

// ---- activate from the title ----
Game.state = 'title';
H.press('t');
const F = Game.flags;
H.assert(Game.state === 'play', 'T at the title drops straight into play');
H.assert(F.playtest && F.god, 'playtest + god flags set');
H.assert(F.ramsi && F.ramHead && F.ramPound && F.ramGlide, 'full Ramsi kit granted');
H.assert(F.net && F.suit && F.wings && F.ramsuit, 'full gear granted');
H.assert(F.road_bramble && F.road_squall && F.road_meteor, 'all three travel roads pre-cleared (no side-scroll ambushes)');

// ---- nothing is completed ----
H.assert(!F.mottle && !F.geode && !F.grub && !F.thornback && !F.gnash, 'no warden/boss is beaten');
H.assert(!F.gustwing && !F.tempestia && !F.billy && !F.sahor, 'no W1/sky boss is beaten');
H.assert(!F.kin_1 && !F.kin_3 && F.pillowkin === 0, 'Pillow-Kin all still caged');
H.assert(Object.keys(F.switchFlags).length === 0, 'no puzzle machine is pre-solved');
H.assert(Object.keys(F.starcells).length === 0, 'no star-cells collected');

// ---- everything is open ----
Game.loadMap('burrow7'); Game.state = 'play'; Game._pendingIntro = null; H.place(4, 20); H.step(2);
const m7 = Game.map;
H.assert(Game.doorIsOpen(m7, 30, 20) && Game.doorIsOpen(m7, 54, 18), 'burrow7: gate-rune + vault doors stand open');
const p7 = m7.objects.find(o => o.type === 'portal');
H.assert(p7 && !p7.req, 'burrow7: exit portal requirement waived');
H.assert(m7.objects.some(o => o.type === 'boss' && o.boss === 'geode'), 'burrow7: the Geode Golem is still home');
H.place(56, 17); H.step(2);
H.assert(Game.boss && Game.boss.name === 'geode', 'geode spawns and waits, uncaught');
H.place(61, 12); H.face('up'); Game.interact();
H.assert(!F.kin_3, 'TOOTHLESS stays caged while the Golem stands');
// secret portals visible + unlocked (burrow8 throne drop)
Game.loadMap('burrow8'); Game.state = 'play'; H.place(4, 20); H.step(2);
const p8 = Game.map.objects.find(o => o.type === 'portal');
H.assert(p8 && !p8.req && !p8.secret, 'burrow8: the hidden throne-drop is visible and open');

// ---- victory exits stay hidden even in playtest (no leaving the finale early) ----
Game.loadMap('castle1'); Game.state = 'play'; Game._pendingIntro = null; H.place(4, 12); H.step(2);
const pc = Game.map.objects.find(o => o.type === 'portal');
H.assert(pc && pc.req === 'colossus' && pc.secret, 'castle1: the victory warp keeps its lock + stays hidden in playtest');

// ---- the Underburrow map: ESC underground, all dens open under god ----
Game.loadMap('burrow5'); Game.state = 'play'; Game._pendingIntro = null; H.place(4, 20); H.step(2);
NQ.press('Escape'); H.step(1);
H.assert(Game.state === 'burrowmap', 'ESC in the burrow opens the UNDERBURROW map');
const BN = NQ.BURROW_NODES;
Game.burrowCursor = BN.findIndex(n => n.id === 'burrow7');
NQ.press(' '); H.step(1);
H.assert(Game.mapId === 'burrow7' && Game.state === 'play', 'playtest: dig straight to Crystal Deep');

// ---- Noah cannot die ----
Player.hearts = Player.maxHearts;
Player.hurt(5); H.step(1);
H.assert(Player.hearts === Player.maxHearts, 'hits refill instantly (undying)');

// ---- sky ESC is allowed even before the rescue ----
Game.loadMap('sky2'); Game.state = 'play'; H.place(4, 16); H.step(2);
H.assert(!F.parents, 'parents not yet rescued');
NQ.press('Escape'); H.step(1);
H.assert(Game.state === 'worldmap', 'ESC leaves the sky freely in playtest');
Game.state = 'play';

// ---- reversibility: a fresh NORMAL game gets its locks back ----
Game.state = 'title'; H.press('n');
H.assert(!Game.flags.playtest, 'N starts a normal game (no playtest flag)');
Game.loadMap('burrow7'); Game.state = 'play';
const p7b = Game.map.objects.find(o => o.type === 'portal');
H.assert(p7b && p7b.req === 'geode', 'normal game: the exit portal requirement is RESTORED');
H.assert(!Game.doorIsOpen(Game.map, 30, 20), 'normal game: the gate-rune door is shut again');
Game.loadMap('burrow8'); Game.state = 'play';
const p8b = Game.map.objects.find(o => o.type === 'portal');
H.assert(p8b && p8b.req === 'b8_seal' && p8b.secret, 'normal game: the throne-drop is hidden + locked again');
console.log('PLAYTEST PASS — open world, fresh content, undying tester, clean reversal');
