// THE SKY-SPIRE ASCENT: a bespoke vertical wing-flyer. Enter from the Vale spire (needs wings),
// flap up (X), glide (hold X), dodge zap-bats + arc-gates that spark your wings out and drop you,
// perch checkpoints, and grab the SKY-FEATHER at the very top -> exit + fanfare.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS } = NQ;
const T = 16;
H.startPlay();

// the entrance exists in the Vale and is gated on WINGS
const spire = MAPS.vale.objects.find(o => o.type === 'skyspire');
H.assert(spire, 'a SKY SPIRE stands in the Vale');
Game.loadMap('vale');
Player.x = spire.x * T + 8; Player.y = spire.y * T + 8;
delete Game.flags.wings;
Game.interact();
H.assert(Game.state !== 'ascent', 'without wings you cannot fly the spire');
Game.flags.wings = true;
Game.interact();
H.assert(Game.state === 'ascent' && Game.ascent, 'with WINGS, stepping in starts the ASCENT');

const A = Game.ascent;
H.assert(A.solid.length > 100 && A.solid[0].length < 20, 'the shaft is NARROW and VERY tall');
H.assert(A.bats.length >= 3 && A.gates.length >= 2, 'zap-bats AND arc-gates populate the shaft');
H.assert(A.stormcrows && A.stormcrows.length >= 2, 'STORMCROWS patrol the shaft too (added difficulty)');
// smaller ledges: in the CLIMBING zone the regular clouds are now tiny (you fall farther)
{
  let widest = 0;
  for (let j = 12; j < A.solid.length - 4; j++) { let run = 0; for (let i = 1; i < A.solid[0].length - 1; i++) { if (A.solid[j][i] && !A.perch.has(i+','+j)) { run++; widest = Math.max(widest, run); } else run = 0; } }
  H.assert(widest <= 4, 'regular climbing ledges are small now (<=4 wide) — more falling (widest ' + widest + ')');
}
H.assert(A.checkpoints.length >= 3, 'perch checkpoints exist');

// COMPLETABILITY: the open (flyable) cells must connect the start to the feather.
// A wing-flyer can move through any connected open space, so this proves the shaft is beatable.
{
  const solid = A.solid, w = solid[0].length, h = solid.length;
  const key = (x, y) => x + ',' + y;
  const sx = (A.start.x / T) | 0, sy = ((A.start.y / T) | 0) - 1;
  const fx = (A.feather.x / T) | 0, fy = (A.feather.y / T) | 0;
  const seen = new Set([key(sx, sy)]), q = [[sx, sy]];
  while (q.length) { const [x, y] = q.shift();
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx=x+dx, ny=y+dy, k=key(nx,ny);
      if (nx<0||ny<0||nx>=w||ny>=h||seen.has(k)) continue; if (solid[ny][nx]) continue; seen.add(k); q.push([nx,ny]); } }
  H.assert(seen.has(key(fx, fy)), 'the SKY-FEATHER is reachable through open air from the start (shaft is completable)');
  // the feather must NOT sit above a solid tile you'd hit flying straight up (the old bug: a perch
  // right under it stopped you a row short). Check the cells just below the feather are open air.
  H.assert(!solid[fy + 1][fx] && !solid[fy + 2][fx], 'nothing blocks the column directly below the feather (you can fly up to it)');
  H.assert(A.checkpoints.every(cp => seen.has(key((cp.x/T)|0, ((cp.y/T)|0)))), 'every checkpoint sits in the flyable region');
}

// physics: tapping X flaps UP (y decreases); gravity pulls down when idle
const p = A.p; const y0 = p.y;
for (let i = 0; i < 8; i++) { NQ.press('x'); }         // a few flaps
for (let i = 0; i < 30; i++) H.step(1);
H.assert(p.y < y0, 'FLAP (X) climbs upward');
// idle -> falls
const y1 = p.y; H.releaseAll(); for (let i = 0; i < 40; i++) H.step(1);
H.assert(p.y > y1 - 40, 'gravity pulls you back down when you stop flapping');

// getting ZAPPED sparks the wings out: cannot flap, plummets
p.x = A.bats[0].x0 + (A.bats[0].x1 - A.bats[0].x0) / 2; p.y = A.bats[0].y + 7; p.inv = 0;
Game.ascentZap(A, 'a test zap');
H.assert(p.stun > 0 && p.wingsOff, 'a zap sparks the wings OUT (stun + wingsOff)');
const yz = p.y; NQ.press('x'); H.step(1);
H.assert(p.wingsOff, 'you cannot flap while zapped');

// falling out the bottom returns you to a checkpoint (never a hard game-over)
Player.hearts = Player.maxHearts;
p.stun = 0; p.wingsOff = false; p.y = (A.solid.length) * T + 40;   // shove below the bottom
Game.updateAscent(1 / 60, []);
H.assert(p.y < A.solid.length * T, 'falling out the bottom bounces you back up to a checkpoint');
H.assert(Player.hearts >= 1, 'a fall never drops you below a safe heart floor');

// reaching the feather: grant the material, celebrate, exit to the Vale + fanfare
delete Game.flags.matsFound['ascent_feather']; Game.flags.mats.skyfeather = 0;
p.x = A.feather.x; p.y = A.feather.y; p.stun = 0; p.inv = 0;
Game.updateAscent(1 / 60, []);
H.assert(Game.flags.mats.skyfeather === 1 && Game.flags.matsFound['ascent_feather'], 'touching the SKY-FEATHER grants the rare material (once)');
H.assert(Game.ascent && Game.ascent.won > 0, 'a short victory beat plays');
// run out the victory timer -> exits to Vale, plays the itemget fanfare
for (let i = 0; i < 60 * 3 && Game.ascent; i++) Game.updateAscent(1 / 60, []);
H.assert(!Game.ascent && Game.mapId === 'vale', 'the ascent ends back in the Vale');
H.assert(Game.state === 'itemget' && /SKY-FEATHER/.test(Game.itemGetData.title), 'the SKY-FEATHER fanfare plays on solid ground');
Game.state = 'play'; Game.itemGetData = null;

// ESC bails out cleanly back to the Vale
Game.startAscent();
H.assert(Game.state === 'ascent', 're-entered the ascent');
Game.updateAscent(1 / 60, ['Escape']);
H.assert(!Game.ascent && Game.mapId === 'vale' && Game.state === 'play', 'ESC flies you back down to the Vale');

// a STORMCROW dives at Noah when he drifts below it (fresh ascent so nothing is polluted)
Game.startAscent();
{
  const A2 = Game.ascent, cd = A2.stormcrows[0], pp = A2.p;
  cd.state = 'cruise'; cd.cool = -1; cd.x = 7 * T; cd.y = cd.homeY;
  pp.x = 7 * T; pp.y = cd.homeY + 3 * T; pp.inv = 0; pp.stun = 0;
  let dove = false;
  for (let i = 0; i < 120 && !dove; i++) { Game.updateAscent(1 / 60, []); if (cd.state === 'dive') dove = true; }
  H.assert(dove, 'a STORMCROW dives at Noah when he passes below it');
}
Game.exitAscent(false);

// STOMP: falling onto a stormcrow from ABOVE knocks it out and bounces Noah up
Game.startAscent();
{
  const A3 = Game.ascent, cd = A3.stormcrows[0], pp = A3.p;
  cd.dead = false; cd.state = 'cruise'; cd.x = 7 * T; cd.y = cd.homeY;
  pp.x = 7 * T; pp.y = cd.homeY - 6; pp.vy = 120; pp.inv = 0; pp.stun = 0;   // dropping onto its back
  Game.updateAscent(1 / 60, []);
  H.assert(cd.dead, 'landing on a STORMCROW from above KOs it (stomp)');
  H.assert(pp.vy < 0, 'and bounces Noah upward');
  // a side hit still zaps (not a stomp)
  const cd2 = A3.stormcrows.find(x => !x.dead) || A3.stormcrows[1];
  const yy = (A3.solid.length * 0.5 | 0) * T;
  cd2.dead = false; cd2.state = 'cruise'; cd2.cool = 5; cd2.x = 7 * T; cd2.y = cd2.homeY = yy;   // pin its band so it doesn't drift away
  pp.x = 7 * T + 11; pp.y = yy + 8; pp.vx = 0; pp.vy = -60; pp.inv = 0; pp.stun = 0;              // approaching from the SIDE, rising
  Game.updateAscent(1 / 60, []);
  H.assert(pp.stun > 0, 'a non-stomp (side) touch still sparks the wings out');
}
Game.exitAscent(false);

console.log('ASCENT PASS — wings-gated spire, flap/glide, zap-out, stormcrow dives, small clouds, the SKY-FEATHER, ESC bail');
