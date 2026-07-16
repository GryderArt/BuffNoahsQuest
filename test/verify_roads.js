// bug-3 verification: flags reachable on the ground; no enemy floats; + screenshots
const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, SideScroll } = NQ;
H.startPlay();
for (const level of ['bramble', 'squall', 'meteor']) {
  SideScroll.start(level, false);
  const S = SideScroll.active;
  // 1) every checkpoint flag must trigger when Noah stands in its column on the ground
  for (const fi of S.flagCols) {
    const gx = fi * 16 + 8;
    S.p.x = gx; S.p.y = SideScroll.groundYAt(S, gx) - 1; S.p.vx = 0; S.p.vy = 0;
    H.step(2);
    H.assert(S.flags[fi], level + ': flag @col ' + fi + ' reachable on the ground');
  }
  // 2) no enemy floats: each rests on a solid surface (or is a pit-leaping hopper)
  // the bug was enemies resting HIGH in mid-air (at the marker row, far above ground).
  // invariant: every enemy rests on solid ground, or at the chasm floor (lowest row) over a gap.
  for (const e of S.enemies) {
    const grounded = SideScroll.solidAt(S, e.x, e.homeY);
    const atChasmFloor = e.homeY >= 14 * 16;
    H.assert(grounded || atChasmFloor, level + ': ' + e.species + ' (' + e.kind + ') not floating high in mid-air (homeY=' + e.homeY + ')');
  }
  // 3) screenshots across the level
  let shot = 0;
  for (let cx = 0; cx < S.def.w * 16; cx += 600) {
    S.camX = cx; S.p.x = Math.min(cx + 240, S.def.w * 16 - 8);
    S.p.y = SideScroll.groundYAt(S, S.p.x) - 1;
    H.render();
    fs.writeFileSync(__dirname + '/../shots/vfy_' + level + '_' + (shot++) + '.png', H.canvas.toBuffer('image/png'));
  }
}
console.log('ROAD VERIFY PASS — flags grounded & reachable, no floaters');
