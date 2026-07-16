// smoke: boot -> every map renders & updates with chaotic input; zero errors.
const H = require('./harness');
const { NQ } = H;
const { Game, Player } = NQ;

H.startPlay();
const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
for (const id of Object.keys(NQ.MAPS)) {
  H.warp(id);
  for (let f = 0; f < 240; f++) {
    if (f % 30 === 0) { H.releaseAll(); H.hold(keys[(f / 30 | 0) % 4], true); }
    if (f % 45 === 7) NQ.press('z');
    if (f % 60 === 13) NQ.press('x');
    if (f % 75 === 21) NQ.press(' ');
    if (f % 90 === 31) NQ.press((1 + (f % 5)) + '');
    H.step(1);
    if (f % 20 === 0) H.render();
    Player.hearts = Player.maxHearts;
    // close anything random presses opened
    if (Game.state === 'dialog') H.press(' ');
    if (Game.state === 'menu') H.press('Escape');
    if (Game.state === 'itemget') { Game.itemGetData.t = 1; H.press(' '); }
  }
  H.releaseAll(); NQ.hold(' ', false);
  if (Game.state !== 'play') { Game.state = 'play'; Game.menu = null; Game.dialog = null; Game.itemGetData = null; }
  NQ.Player.grab = null;
  H.assert(!Game.errorMsg, id + ': 240 chaotic frames, zero errors');
}
// road levels: chaotic platforming, zero errors
for (const id of Object.keys(NQ.ROAD_LEVELS)) {
  NQ.SideScroll.start(id, false);
  for (let f = 0; f < 300; f++) {
    if (f % 24 === 0) { H.releaseAll(); H.hold(f % 48 === 0 ? 'ArrowRight' : 'ArrowLeft', true); }
    if (f % 17 === 3) NQ.press('x');
    H.step(1);
    Player.hearts = Player.maxHearts;
  }
  H.releaseAll();
  H.assert(!Game.errorMsg, 'road ' + id + ': 300 chaotic frames, zero errors');
  NQ.SideScroll.active = null; Game.state = 'play';
}
// menus & overlays
Game.state = 'worldmap'; H.render();
for (const k of ['ArrowRight', 'ArrowRight', 'Escape']) H.press(k);
H.assert(Game.state === 'play', 'world map opens and closes');
H.press('i'); H.render(); H.press('Escape');
H.press('Escape'); H.render(); H.press('Escape');
H.assert(!Game.errorMsg, 'overlays render with zero errors');
console.log('SMOKE PASS — all maps, chaotic input, zero errors');
