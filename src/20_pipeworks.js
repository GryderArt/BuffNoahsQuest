"use strict";
// ===================== WORLD 3 — THE PIPEWORKS (Level 2) =====================
// A big CLOGGED pipe-maze (user design). The '.' channels are open pipe; the '#'
// are breakable gunk-walls — RAM the CRACKED ones (Ram Suit) and ROLL the SLUDGE
// (Ramsi). Water pours from the SOURCE at the top and floods every channel it can
// reach DOWNHILL; carve the walls to route it DOWN through the maze to the dried POND. When
// the water reaches the pond it floods, reviving the fish so the LADY OF THE LAKE
// grants STAR-CELL #2. No monsters.
const PIPE_MAZE = [
  "#################..#################",
  "#......#...##.................##...#",
  "#.#.##.#.#..########.########.##.#.#",
  "#.#.##.#.#...........#....#.#.##.#.#",
  "###.##.#.#############.#..#.#.####.#",
  "#...##...#.##..........##...#.##...#",
  "#.########.##.#.######.######.##.###",
  "#.#....#......#.#....#.##.....##...#",
  "#.###..#.######.#..###.##.########.#",
  "#..###.#..#####.#..###.##.#######..#",
  "###.##.###.##.#.#..#..####..#..##..#",
  "###.##.###....#.#..#.######.#.####.#",
  "#...##........#.#..#......#...##...#",
  "#.#############.#..#.###########.###",
  "#.#.............#..#.#........##.#.#",
  "#.#.#############..#.#.####.####.#.#",
  "#.#.##..........#....#.##.#......#.#",
  "#.#.##.##########..###.##.########.#",
  "#.#.##........#....#.#.##.....##...#",
  "###.##.######.#.####.#.##.###.##.#.#",
  "#...##.....##.#......#....#...##.#.#",
  "#.#.######.##.######.######.####.#.#",
  "#.#..#####.##.#####...#####.###..#.#",
  "#.###..#######...##########.#..###.#",
  "#.####.########.###########.#.####.#",
  "#...##...#....#....#........#.##.#.#",
  "###.####.#.##.######.########.##.#.#",
  "#...##...#.##......#.#........##...#",
  "#.####.###.######..#.######.####.###",
  "#.#.##.....##...#..#......#.#.##.#.#",
  "#.#.#########.#.#..#####..#.#.##.#.#",
  "#.............#.#...........#......#",
  "##...############..############...##"];
const PIPE_MAZE_2 = [
  "#################..#################",
  "#.....#.................#...##....##",
  "#######.###############.#.#.#####.##",
  "#.....#.#.#...#.........#.#.#...#.##",
  "#.#####.#####.#####.#####.#######.##",
  "#.#.....#...#.....#..##.#...##...###",
  "#.###.###########.###.#.###.#.###.##",
  "#.#.#.......#...###.#.#.....#..##.##",
  "###.###########.#.#.#.#####.###.#.##",
  "#.#.#.......#.#...#.#.....##..#.#.##",
  "#.#.#######.#.#####.#####.###.#.#.##",
  "#.#.#.#.....#.#.........#...#.#.#.##",
  "#.#.#.#.#####.#.#############.#.#.##",
  "#..##...#...#.#.......#.....#.#.#.##",
  "#.#####.#.#.#.#######.#.#######.#.##",
  "#.....#.#.#..##....##.#.#.......####",
  "#########.#####.###.#.#.#####.###.##",
  "#.#.#.#.#.....#.#...#.#.#...#.#..###",
  "#.#####.#.###.#.#.#####.###.###.####",
  "##..#...#...#####.#...#...#..####.##",
  "#.#.#.#######.#.#.#############.#.##",
  "#.#.###.....#.#.#.....#.#.#...#...##",
  "#.#.#.###############.#.#.#.#.###.##",
  "#.##..#.......##...#..#.#.###.#.#.##",
  "#.#####.#####.#.#######.#.#.###.#.##",
  "#.#.....#.#...#.#...#...#.#.#.#.####",
  "#.###.###.#####.#.#####.###.#.#.#.##",
  "#.....#.#.......###...#.#...#.#.#.##",
  "#######.#########.#.#.#.#.###.#.#.##",
  "#.#.........#...##..#.#.#.....#.#.##",
  "#.#.#######.#.#.#.###.#######.#.#.##",
  "##......#.#...#.....#.##..##..#...##",
  "##...############..############...##"];
const PIPE_MAZE_3 = [
  "#################..#################",
  "#.#.....#.....#...................##",
  "###.###.#.###.#.#############.#.####",
  "#.#.#.##..#...#.#...#.#.....#.#.#.##",
  "#.#.#.#####.###.#.#####.###.#.######",
  "#.#.#..##...#.#.#.#.###.#.#.#.#...##",
  "#.#.###.#.###.#####.#.#.#.#.#####.##",
  "#.#.#...#.##.##.....#.#.#......#..##",
  "#####.###.#.###########.#########.##",
  "#.#.#..##.#.........#.#...#...#.#.##",
  "#.#.#.#.#.#.#.###.###.###.#.#.#.####",
  "#...#.#.#.#.#.##..#..##...#.#.#.#.##",
  "#####.#.#.#.#.#####.###.###.#####.##",
  "#.....#...#.#...##..#...#.#.....#.##",
  "#.#############.#####.###.#.###.####",
  "#.#...#.......#.#...#.#.#.#...#...##",
  "#.#.#.#####.#.###.#######.###.######",
  "#.#.#.......#.#...#.......#.#.#...##",
  "#############.#.#######.###.###.#.##",
  "#...#.....#...#..##.#...#...#...#.##",
  "###.#.###.#.#######.#.###.#####.#.##",
  "#.#.#.#.#.#.##....#.#.#...#.....#.##",
  "#.###.#.###########.#.#.###.#.######",
  "##....#.#.#.#...#.#.#..##...#.#..###",
  "#.#####.#.#.###.#.#.###.#########.##",
  "#.#...#.#.#...###.#...#.#...#...#.##",
  "#.#.#.#.#.###.###.###.#.#.#.#.#.#.##",
  "#.#.#.#...#..##...#...#..##...#.#.##",
  "#####.#####.#######.###########.#.##",
  "#.....#...#...#.#...##....#.....#.##",
  "#.#######.###.#.###.#.#.#########.##",
  "#...#.#.....#..#..#.#.##..#.......##",
  "##...############..############...##"];
const PIPE_MAZES = [PIPE_MAZE, PIPE_MAZE_2, PIPE_MAZE_3];

// paint a chosen maze into cog2's upper region: '#'=UNBREAKABLE pipe wall, '.'=BREAKABLE corridor
// (sludge=ROLL, cracked seams=RAM); plus the top SOURCE, a guaranteed-solvable down/sideways carve-route,
// and a cosmetic pass that dresses the unbreakable walls as a variety of pipes.
function paintPipeworksMaze(m, maze) {
  const MH = maze.length, MW = maze[0].length, Hh = m.h;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (maze[y][x] === '#') m.tiles[y][x] = 'gearwall';
    else m.tiles[y][x] = (y % 5 < 2) ? 'crack' : 'softblock';
  }
  const src = []; for (let x = 0; x < MW; x++) if (maze[0][x] === '.') { m.tiles[0][x] = 'water'; src.push([x, 0]); }
  m._waterSrc = src; m.start = { x: src[0][0], y: 1 };
  { // Dijkstra source->pond (down + sideways), carving any wall it must cross so a route ALWAYS exists
    const pondY = MH + 3, W = MW, idx = (x, y) => y * W + x;
    const cost = new Array(W * Hh).fill(Infinity), prev = new Array(W * Hh).fill(-1);
    const pq = []; for (const sN of src) { cost[idx(sN[0], sN[1])] = 0; pq.push([0, sN[0], sN[1]]); }
    let endK = -1;
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]); const [c, x, y] = pq.shift(); const k = idx(x, y); if (c > cost[k]) continue;
      if (y >= pondY) { endK = k; break; }
      for (const d of [[0, 1], [-1, 0], [1, 0]]) {
        const nx = x + d[0], ny = y + d[1]; if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= Hh - 1) continue;
        const wall = (ny < MH) && (maze[ny][nx] === '#');
        const nc = c + (wall ? 30 : 1), nk = idx(nx, ny);
        if (nc < cost[nk]) { cost[nk] = nc; prev[nk] = k; pq.push([nc, nx, ny]); }
      }
    }
    for (let k = endK; k >= 0; k = prev[k]) { const x = k % W, y = (k / W) | 0; if (y > 0 && y < MH && m.tiles[y][x] === 'gearwall') m.tiles[y][x] = 'crack'; }
  }
  for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) if (m.tiles[y][x] === 'gearwall') {
    const horiz = maze[y][x - 1] === '#' && maze[y][x + 1] === '#';
    if ((x + y) % 9 === 0) m.tiles[y][x] = horiz ? 'bigpipeh' : 'bigpipe';
    else if ((x * 2 + y) % 5 === 0) m.tiles[y][x] = (x % 2 ? 'pipefe' : 'pipebr');
  }
}

(function buildPipeworks() {
  if (typeof newMap !== 'function' || MAPS.cog2) return;
  const MH = PIPE_MAZE.length, MW = PIPE_MAZE[0].length;   // 33 x 36
  const m = newMap('cog2', MW, MH + 7, 'gearwall', { name: 'The Pipeworks', song: 'coast', cliff: 'sea', zone: 'city', noFly: true });
  m.custom = true;
  paintPipeworksMaze(m, PIPE_MAZE);   // a fresh RANDOM maze is rolled on entry while unsolved (see onLoad)
  SIGN(m, m._waterSrc[0][0] + 1, 1, 'THE PIPEWORKS — water pours from the top and only runs DOWNHILL. RAM the cracked walls & ROLL the sludge to carve a channel DOWN through the maze to the dried pond below!');

  // collector + the WIDE dried POND beneath the maze (the maze's bottom openings drain into it)
  R(m, 1, MH, MW - 2, 1, 'cogfloor');
  R(m, 2, MH + 1, MW - 4, 5, 'sand');
  const pond = []; for (let y = MH + 1; y <= MH + 5; y++) for (let x = 2; x <= MW - 3; x++) pond.push([x, y]);
  m._pondTiles = pond; m._pondSet = new Set(pond.map(p => p[0] + ',' + p[1]));
  R(m, 0, MH, 1, 7, 'gearwall'); R(m, MW - 1, MH, 1, 7, 'gearwall'); R(m, 0, MH + 6, MW, 1, 'gearwall');
  NPC(m, MW >> 1, MH + 4, 'lady', 'Lady of the Lake');
  OBJ(m, { type: 'portal', x: MW - 4, y: MH + 5, to: 'world3map', secret: true, req: 'sc_lady' });   // post-star EXIT to the overview map (appears once the Lady grants the star)

  m.onLoad = function (G) {
    if (!G.flags.cog2_flow) { paintPipeworksMaze(m, PIPE_MAZES[(Math.random() * PIPE_MAZES.length) | 0]); m._wet = null; }   // REPLAY: roll a random maze each fresh attempt
    const py = MH + 2;
    for (const f of [['octopus', 5, py], ['jellyfish', 12, py + 1], ['octopus', 22, py], ['jellyfish', 28, py + 1]]) {
      const c = makeCreature(f[0], f[1], f[2], { x: 2, y: MH + 1, w: MW - 4, h: 5 }); c.display = true; G.creatures.push(c);
    }
    if (G.flags.cog2_flow) for (const t of m._pondTiles) m.tiles[t[1]][t[0]] = 'water';   // already solved -> pond stays alive across reloads/re-entry
    G.floodPipes(m);
  };
})();

// expose for tests / tooling (force a specific maze deterministically)
Game.paintPipeworksMaze = paintPipeworksMaze; Game.PIPE_MAZES = PIPE_MAZES;

// ---- WATER FLOW ----------------------------------------------------------------------------------
// FOOLPROOF RULE: the pond fills when a continuous OPEN channel links the source to the pond — in ANY
// direction. The maze's carved corridors are 1-tile-wide winding tubes that often SIPHON (dip into a
// sealed pit, then the only way on is up-and-over). Real plumbing pushes water up-and-over a siphon, so
// completion is decided by CONNECTIVITY, not by gravity. (A pure downhill test wrongly left the pond dry
// whenever the route had to climb — which, in a tight maze, was almost always.)
Game.floodPipes = function (m) {
  if (!m || m.id !== 'cog2') return;
  // self-heal the water bookkeeping (e.g. after a save/reload rebuilds the map fresh)
  if (!m._waterSrc || !m._waterSrc.length) { m._waterSrc = []; for (let x = 0; x < m.w; x++) if (m.tiles[0][x] === 'water') m._waterSrc.push([x, 0]); }
  if (!m._pondSet) m._pondSet = new Set((m._pondTiles || []).map(p => p[0] + ',' + p[1]));
  const open = (x, y) => { if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false; return !((TILEDEFS[m.tiles[y][x]] || {}).solid); };

  // (1) CONNECTIVITY (any direction) — does the source reach the pond? Trace one channel while we are at it.
  const prev = new Map(), bq = [];
  for (const s of m._waterSrc) { const k = s[0] + ',' + s[1]; if (!prev.has(k)) { prev.set(k, null); bq.push(s); } }
  let endK = null;
  for (let h = 0; h < bq.length && !endK; h++) {            // BFS (shortest channel); stops when the pond is hit
    const c = bq[h], ck = c[0] + ',' + c[1];
    if (m._pondSet.has(ck)) { endK = ck; break; }
    for (const d of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
      const nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
      if (!prev.has(k) && open(nx, ny)) { prev.set(k, ck); bq.push([nx, ny]); }
    }
  }
  const connected = !!endK;

  // (2) VISUAL: water visibly RUNS DOWNHILL as you carve (down + sideways from the source). It never
  //     climbs dead-end pipes or backs up into unrelated branches, so the picture stays clean.
  const wet = new Set(), q = [];
  for (const s of m._waterSrc) { const k = s[0] + ',' + s[1]; if (!wet.has(k)) { wet.add(k); q.push(s); } }
  while (q.length) {
    const c = q.pop();
    for (const d of [[0, 1], [-1, 0], [1, 0]]) {            // DOWN, LEFT, RIGHT — no UP
      const nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
      if (!wet.has(k) && open(nx, ny)) { wet.add(k); q.push([nx, ny]); }
    }
  }
  // (3) when connected, light up the actual source->pond channel too (so siphon climbs read as full water)
  if (connected) for (let k = endK; k; k = prev.get(k)) wet.add(k);

  for (const k of wet) { const p = k.split(',').map(Number); if (m.tiles[p[1]][p[0]] === 'cogfloor') m.tiles[p[1]][p[0]] = 'wetpipe'; }
  m._wet = wet;

  if (connected && !this.flags.cog2_flow) {
    this.flags.cog2_flow = true;
    for (const t of (m._pondTiles || [])) m.tiles[t[1]][t[0]] = 'water';
    Audio2.jingle('door');
    this.banner('THE WATER REACHES THE POND! It brims back to life and the fish DANCE — seek the LADY OF THE LAKE!');
    saveGame();
  }
};
Game.onCitySmash = function (m) { if (m && m.id === 'cog2') this.floodPipes(m); };
