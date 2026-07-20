// PIXEL verification: sample rendered output at expected screen positions,
// before AND after movement (the v3.2 double-camera lesson). Also emits a
// screenshot sheet for human review.
const H = require('./harness');
const { NQ, canvas } = H;
const { Game, Player } = NQ;
const SCALE = 2, TILE = 16, VW = 480, VH = 272;

function px(x, y) {
  const d = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
  return [d[0], d[1], d[2]];
}
function sampleBox(cx, cy, w, h) {
  const out = [];
  for (let j = 0; j < h; j += 2) for (let i = 0; i < w; i += 2) out.push(px(cx + i, cy + j));
  return out;
}
function hasColorNear(cx, cy, w, h, rgb, tol) {
  return sampleBox(cx, cy, w, h).some(([r, g, b]) =>
    Math.abs(r - rgb[0]) < tol && Math.abs(g - rgb[1]) < tol && Math.abs(b - rgb[2]) < tol);
}
function playerScreenXY() {
  const camX = Math.round(Math.max(0, Math.min(Player.x - VW / 2, Game.map.w * TILE - VW)));
  const camY = Math.round(Math.max(-(Game.map.topPad || 0), Math.min(Player.y - VH / 2, Game.map.h * TILE - VH)));
  return [(Player.x - camX) * SCALE, (Player.y - camY) * SCALE];
}
function assertPlayerVisible(label) {
  H.render();
  const [sx, sy] = playerScreenXY();
  // Noah's gold hair (#f8d048) must appear within his (elevation-lifted) sprite box
  const ok = hasColorNear(sx - 24, Math.max(0, sy - 130), 48, 140, [248, 208, 72], 30);
  H.assert(ok, label + ': Noah hair pixels at expected screen position');
}

// 1. title renders
Game.state = 'title';
H.render();
H.assert(hasColorNear(40, 80, 300, 100, [248, 208, 72], 30), 'title: gold title text pixels');
H.shot('00_title');

// 2. new game -> the SPACE-paced opening plays; X skips the whole thing
H.press('z');
H.assert(Game.state === 'intro', 'new game opens the intro cutscene');
NQ.Game.intro = { i: 0, t: 1.2, fx: {}, entered: 0 }; H.render(); H.shot('00b_intro_dawn');
NQ.Game.intro = { i: 3, t: 1.3, fx: {}, entered: 3 }; H.render(); H.shot('00c_intro_snatch');
NQ.Game.intro.t = 9;                       // caption fully typed -> SPACE advances a beat
H.press(' ');
H.assert(Game.state === 'intro' && NQ.Game.intro.i === 4, 'SPACE advances one beat (self-paced)');
H.press('x');
H.assert(Game.state === 'play', 'X skips the whole opening to play');
assertPlayerVisible('vale spawn');
H.shot('01_vale_start');

// 3. walk right 1s — player still visible at NEW expected position
const beforeX = Player.x;
H.hold('ArrowRight', true); H.step(60); H.hold('ArrowRight', false);
H.assert(Player.x > beforeX + 20, 'movement: walked right (' + Math.round(Player.x - beforeX) + 'px)');
assertPlayerVisible('after walking');

// 4. creature visible: teleport a sheep next to Noah; its fluff (#fff8f0) must render
{
  const sheep = Game.creatures.find(c => c.species === 'sheep');
  H.assert(!!sheep, 'a sheep exists in vale');
  sheep.x = Player.x + 24; sheep.y = Player.y; sheep.vx = 0; sheep.vy = 0;
  H.render();
  const [sx, sy] = playerScreenXY();
  H.assert(hasColorNear(sx + 24, sy - 40, 50, 50, [255, 248, 240], 12), 'sheep fluff pixels next to Noah');
}
H.shot('02_vale_meadow');

// 5. snow summit (elevation + shrine)
H.place(7, 6); assertPlayerVisible('snow summit e3'); H.shot('03_snow_summit');
// 6. grotto (dungeon dark + boss)
H.warp('grotto1', 13, 21); assertPlayerVisible('grotto'); H.shot('04_grotto');
H.warp('grotto4', 14, 15); H.place(14, 8); H.render(); H.shot('05_grotto_boss');
// 7. gauntlet
H.warp('vale', 38, 31); H.render(); H.shot('06_gauntlet');
// 8. coast pier
H.warp('coast', 20, 26); assertPlayerVisible('coast'); H.shot('07_coast');
// 9. school
H.warp('school', 11, 8); assertPlayerVisible('school'); H.shot('08_school');
// 10. deep blue + twinkle
H.warp('deep', 5, 5); assertPlayerVisible('deep'); H.shot('09_deep');
H.place(46, 19); H.step(30); H.render(); H.shot('10_twinkle');
// 11. wastes (peel off the wetsuit from the deep dive first — hair probe wants gold)
NQ.Player.wearingSuit = false;
H.warp('wastes', 6, 20); assertPlayerVisible('wastes'); H.shot('11_wastes');
// 12. keep boss
H.warp('keep2', 15, 8); H.step(20); H.render(); H.shot('12_keep');
// 13. canyon tiers
H.warp('canyon', 6, 34); assertPlayerVisible('canyon'); H.shot('13_canyon');
H.place(24, 14); H.render(); H.shot('14_canyon_top');
// 14. spire + sahor
H.warp('spire', 15, 27); H.render(); H.shot('15_spire');
H.place(15, 14); H.step(30); H.render(); H.shot('16_sahor');
// 15. dialog with portrait
H.warp('vale', 34, 12); NQ.Game.talkTo({ who: 'granny' }); H.render(); H.shot('17_dialog');
Game.dialog = null; Game.state = 'play';
// 16. shop + trade + log + bait menus
Game.openShop(); H.render(); H.shot('18_shop'); Game.menu = null;
Game.openTrade('tess'); H.render(); H.shot('19_trade'); Game.menu = null;
Game.state = 'play';
// 17. world map
Game.state = 'worldmap'; H.render(); H.shot('20_worldmap'); Game.state = 'play';
// 18. credits
Game.state = 'credits'; Game.creditsT = 1; H.render(); H.shot('21_credits');
Game.state = 'play';
// 19. ITEM GET celebration
H.warp('vale', 26, 20);
NQ.Game.itemGet('tool:harpoon', 'THE HARPOON!', 'Z fires it: reel in swimmers, hook golden posts!');
NQ.Game.itemGetData.t = 0.9; H.render(); H.shot('22_itemget');
NQ.Game.itemGetData = null; Game.state = 'play';

// 19b. ROAD LEVELS: render + Noah visible in side mode
for (const id of ['bramble', 'squall', 'meteor']) {
  NQ.SideScroll.start(id, false);
  const S = NQ.SideScroll.active;
  S.p.x = 40 * 16; S.p.y = NQ.SideScroll.groundYAt(S, S.p.x) - 1;
  for (const e of S.enemies) e.x += 9999;     // clear the probe area
  S.p.inv = 0; H.step(2); S.p.inv = 0; H.render();
  const sx = (S.p.x - S.camX) * SCALE, sy = (S.p.y + 28) * SCALE;
  H.assert(hasColorNear(sx - 24, Math.max(0, sy - 90), 48, 100, [248, 208, 72], 30), 'road ' + id + ': Noah visible in side mode');
  H.shot('23_road_' + id);
  NQ.SideScroll.active = null; Game.state = 'play';
}
// 20. GOD MODE: G at the title unlocks everything
Game.state = 'title'; H.press('g');
H.assert(Game.state === 'play', 'god mode skips straight to play');
H.assert(Game.flags.wings && Game.flags.suit && Game.flags.harpoon && Game.flags.bracers, 'god mode grants all gear');
H.assert(NQ.WORLD_NODES.map(n => Game.flags.god || !n.req || Game.lookupFlag(n.req)).every(Boolean), 'god mode unlocks every world-map zone for travel');
H.assert(!Game.flags.billy && !Game.flags.twinkle && !Game.flags.cerberus && !Game.flags.sahor, 'god mode leaves the bosses UNCAUGHT');
H.assert(!Game.flags.keepOpen && !Game.flags.crown, 'god mode leaves quest doors SHUT');
console.log('PIXELS PASS — screenshots in shots/');
