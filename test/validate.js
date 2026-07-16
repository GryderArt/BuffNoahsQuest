// map reachability: BFS over every map (full gear); every chest/sign/npc/post/
// boss/shard/berry/link must be adjacent to a reachable tile.
const H = require('./harness');
// model SOLVED puzzle machines (walls sunk, bridges out) for reachability
for (const m of Object.values(H.NQ.MAPS)) {
  if (!m.puzzle) continue;
  for (const pz of m.puzzle) for (const [ti, tj] of (pz.tiles || [])) m.tiles[tj][ti] = pz.to;
}
// model OPENED anemone gates (Glimmer Deep light-gates always open with play)
for (const m of Object.values(H.NQ.MAPS)) {
  for (const o of (m.objects || [])) if (o.type === 'anemgate') for (const [ti, tj] of o.cells) m.tiles[tj][ti] = 'openwater';
}
const { NQ } = H;
const { MAPS, TILEDEFS, tileAt, elevAt } = NQ;

function bfsNoPulls(map, sx, sy) { return bfs(map, sx, sy, true, true); }
function bfs(map, sx, sy, fullGear, noPulls) {
  const seen = new Set([sx + ',' + sy]);
  const q = [[sx, sy]];
  const pass = (i, j, fi, fj) => {
    const id = tileAt(map, i, j), d = TILEDEFS[id] || {};
    if (map._beamBridges && map._beamBridges.has(i + ',' + j)) return fullGear;   // solved light-bridge
    if (d.crack) return fullGear;                                 // ram suit smashes cracked walls
    if (d.soft) return fullGear;                                  // Roll-Charge smashes soft-blocks
    if (d.solid && !d.prop) return false;
    if (d.prop) return false;
    if (d.door || d.gate) return fullGear; // doors/gates assumed openable with progress
    if (id === 'deep' && !map.underwater) return false;
    if (id === 'water' && !map.underwater) return fullGear;       // suit
    if (d.hole && id !== 'water') return fullGear;                 // jump
    if (d.rift) return fullGear && !map.noFly;                     // wings (disabled on no-fly burrows)
    const e0 = elevAt(map, fi, fj), e1 = elevAt(map, i, j);
    if (e1 > e0) {
      const diff = e1 - e0;
      const stair = (TILEDEFS[tileAt(map, fi, fj)] || {}).stair || d.stair;
      if (stair && diff <= 1) return true;
      if (diff === 1) return fullGear;                             // gloves/jump
      return false;
    }
    return true;
  };
  const posts = map.objects.filter(o => o.type === 'post');
  const warps = {}; for (const o of map.objects) if (o.type === 'warp') warps[o.x + ',' + o.y] = [o.tx, o.ty];
  const lands = {}; for (const o of map.objects) if ((o.type === 'bouncepad' || o.type === 'glidevent' || o.type === 'raildock') && o.to) lands[o.x + ',' + o.y] = o.to;
  while (q.length) {
    const [i, j] = q.shift();
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di, nj = j + dj, k = ni + ',' + nj;
      if (ni < 0 || nj < 0 || ni >= map.w || nj >= map.h || seen.has(k)) continue;
      if (pass(ni, nj, i, j)) { seen.add(k); q.push([ni, nj]); }
    }
    // step on a WARP PAD -> its partner tile is reachable
    const w = warps[i + ',' + j];
    if (w) { const wk = w[0] + ',' + w[1]; if (!seen.has(wk)) { seen.add(wk); q.push([w[0], w[1]]); } }
    const lp = lands[i + ',' + j];
    if (lp) { const lk = lp[0] + ',' + lp[1]; if (!seen.has(lk)) { seen.add(lk); q.push([lp[0], lp[1]]); } }
    // harpoon pulls: a post in axis line-of-sight within 7 tiles is reachable (with gear)
    if (fullGear && !noPulls) for (const p of posts) {
      const k = p.x + ',' + p.y;
      if (seen.has(k)) continue;
      if (p.x === i && Math.abs(p.y - j) <= 7) { seen.add(k); q.push([p.x, p.y]); }
      else if (p.y === j && Math.abs(p.x - i) <= 7) { seen.add(k); q.push([p.x, p.y]); }
    }
  }
  return seen;
}

let total = 0;
for (const id of Object.keys(MAPS)) {
  const m = MAPS[id];
  if (m.custom) continue;   // player-made custom levels are exempt from the strict reachability audit
  const seen = bfs(m, m.start.x, m.start.y, true);
  const targets = [];
  for (const o of m.objects) { if (o.compOnly || o.deco || o.type === 'railseg') continue; targets.push([o.type + (o.boss ? ':' + o.boss : ''), o.x, o.y]); }
  for (const L of m.links) targets.push(['link->' + L.to, L.x, L.y]);
  for (const key of Object.keys(m.doors)) { const [x, y] = key.split(',').map(Number); targets.push(['door', x, y]); }
  for (const [label, x, y] of targets) {
    const ok = seen.has(x + ',' + y) ||
      [[1,0],[-1,0],[0,1],[0,-1]].some(([di,dj]) => seen.has((x+di) + ',' + (y+dj)));
    H.assert(ok, `${id}: ${label} @ (${x},${y}) reachable`);
    total++;
  }
}
// no-gear sanity: from vale start, granny and the sheep meadow reachable barehanded
{
  const m = MAPS.vale;
  const seen = bfs(m, m.start.x, m.start.y, false);
  const granny = m.objects.find(o => o.type === 'npc' && o.who === 'granny');
  H.assert([[0,1],[0,-1],[1,0],[-1,0],[0,0]].some(([di,dj]) => seen.has((granny.x+di)+','+(granny.y+dj))), 'vale: Granny reachable with no gear');
  H.assert(seen.has('20,14'), 'vale: sheep meadow reachable with no gear');
  // gating: grotto door NOT reachable without gear (chasm)
  H.assert(!seen.has('25,2'), 'vale: grotto door gated without jump');
}
// POST-ESCAPE AUDIT: every post must connect back to ground that is reachable
// WITHOUT post pulls (transitively, via other posts in line-of-sight <= 7).
// Otherwise a harpoon island is a one-way trip = soft-lock.
for (const id of Object.keys(MAPS)) {
  const m = MAPS[id];
  const posts = m.objects.filter(o => o.type === 'post');
  if (!posts.length) continue;
  const base = bfsNoPulls(m, m.start.x, m.start.y);   // full gear, NO pulls
  const anchored = posts.map(p =>
    base.has(p.x + ',' + p.y) ||
    [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => base.has((p.x+dx) + ',' + (p.y+dy))));
  // spread anchoring through post-to-post line-of-sight
  let changed = true;
  while (changed) {
    changed = false;
    for (let a = 0; a < posts.length; a++) {
      if (anchored[a]) continue;
      for (let b = 0; b < posts.length; b++) {
        if (a === b || !anchored[b]) continue;
        const A = posts[a], B = posts[b];
        if ((A.x === B.x && Math.abs(A.y - B.y) <= 7) || (A.y === B.y && Math.abs(A.x - B.x) <= 7)) {
          anchored[a] = true; changed = true; break;
        }
      }
    }
  }
  posts.forEach((p, i) => H.assert(anchored[i], `${id}: post @ (${p.x},${p.y}) has an escape route (no one-way islands)`));
}
// WASTES TRAVERSAL GUARD: every shard + the keep door must be reachable WITHOUT
// wings (rift impassable), purely by walking the hub and using warp pads.
{
  const m = MAPS.wastes;
  const warps = {}; for (const o of m.objects) if (o.type === 'warp') warps[o.x + ',' + o.y] = [o.tx, o.ty];
  const seen = new Set([m.start.x + ',' + m.start.y]); const q = [[m.start.x, m.start.y]];
  while (q.length) {
    const [i, j] = q.shift();
    for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const ni = i + di, nj = j + dj, k = ni + ',' + nj;
      if (ni < 0 || nj < 0 || ni >= m.w || nj >= m.h || seen.has(k)) continue;
      const id = tileAt(m, ni, nj), dd = TILEDEFS[id] || {};
      if (dd.solid || dd.rift) continue;                 // NO wings: rift is impassable
      if (dd.door && !(m.doors[ni + ',' + nj] || {}).req) {} // flag-doors openable
      seen.add(k); q.push([ni, nj]);
    }
    const w = warps[i + ',' + j]; if (w) { const wk = w[0] + ',' + w[1]; if (!seen.has(wk)) { seen.add(wk); q.push([w[0], w[1]]); } }
  }
  const adj = (x, y) => [[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => seen.has((x+dx)+','+(y+dy)));
  for (const o of m.objects) {
    if (o.type === 'shard') H.assert(adj(o.x, o.y), 'wastes: ' + o.id + ' reachable via warp pads (no wings)');
  }
  const keepDoor = Object.keys(m.doors).find(k => m.doors[k].req === 'keepOpen').split(',').map(Number);
  H.assert(adj(keepDoor[0], keepDoor[1]), 'wastes: Hound\'s Keep door reachable via warp pads (no wings)');
}

// GATE EXPLOIT GUARD: in The Deep Blue, the boss must NOT be reachable while the
// tide gate is shut (no swimming around the coral curtain).
{
  const m = MAPS.deep;
  const boss = m.objects.find(o => o.type === 'boss');
  const seen = new Set([m.start.x + ',' + m.start.y]); const q = [[m.start.x, m.start.y]];
  while (q.length) {
    const [i, j] = q.shift();
    for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const ni = i + di, nj = j + dj, k = ni + ',' + nj;
      if (ni < 0 || nj < 0 || ni >= m.w || nj >= m.h || seen.has(k)) continue;
      const id = tileAt(m, ni, nj), dd = TILEDEFS[id] || {};
      if (dd.solid || dd.gate) continue;     // gate CLOSED + coral impassable
      seen.add(k); q.push([ni, nj]);
    }
  }
  const reach = [[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => seen.has((boss.x+dx)+','+(boss.y+dy)));
  H.assert(!reach, 'deep: Sir Twinkle is UNREACHABLE with the tide gate shut (no swim-around)');
}

// ============ ROAD LEVELS: structural sanity ============
{
  const RL = H.NQ.ROAD_LEVELS, RR = H.NQ.ROAD_ROUTES;
  for (const key of Object.keys(RR)) H.assert(RL[RR[key]], 'route ' + key + ' maps to a real road level');
  for (const [id, def] of Object.entries(RL)) {
    const rows = def.rows, W = def.w, HH = rows.length;
    const colSolid = [];
    for (let i = 0; i < W; i++) {
      let s = false;
      for (let j = 0; j < HH; j++) if ('#=B'.includes(rows[j][i])) { s = true; break; }
      colSolid.push(s);
    }
    H.assert(colSolid[1] && colSolid[2], id + ': spawn ground exists');
    let run = 0, maxRun = 0;
    for (let i = 0; i < W; i++) { if (!colSolid[i]) { run++; maxRun = Math.max(maxRun, run); } else run = 0; }
    const maxGap = (def.wings ? 5 : 0) + (def.gravity < 1 ? 7 : 5);   // wings:1 roads lend flight (flap meter)
    H.assert(maxRun <= maxGap, id + ': widest bottomless gap ' + maxRun + ' <= ' + maxGap + ' (jumpable)');
    H.assert(rows.some(r => r.includes('G')), id + ': has a boss arena');
    H.assert(rows.some(r => r.includes('F')), id + ': has at least one checkpoint flag');
    let earlySpike = false;
    for (let j = 0; j < HH; j++) for (let i = 0; i < 8; i++) if (rows[j][i] === '^') earlySpike = true;
    H.assert(!earlySpike, id + ': no hazards at the spawn');
    H.assert(NQ.ROAD_BOSS_SPECIES && NQ.ROAD_BOSS_SPECIES[def.boss], id + ': known boss');
  }
  console.log('  ok - 3 road levels structurally sound (gaps, flags, bosses, spawns)');
}
console.log(`VALIDATE PASS — ${total} targets reachable across ${Object.keys(MAPS).length} maps + post-escape audit`);
