// ============================ THE AUDITOR v2 ============================
// Progression-aware playtest analysis + WALK-AROUND detection.
//   1. STAGE REACHABILITY — each map scanned with only the abilities owned on arrival;
//      a fixpoint earns what the map itself grants (bosses, runes, jobs, kin gifts).
//      Items: reachable / backtrack-only / NEVER (error).
//   2. PUZZLE SOLVERS — Beams & Sap brute-forced through the real modules (sandboxed),
//      Rails/Herd/Wind data-audited. Unsolvable or PRE-SOLVED puzzles are errors.
//   3. WALK-AROUND DETECTOR (automatic) — every flag-door and puzzle machine is force-
//      LOCKED one at a time; if the map's reachable set does not shrink, the gate is
//      DECORATIVE: the player can simply walk around it. That is an error.
//   4. INTENT TABLE — for the rebuilt levels, each boss/kin/exit declares the mechanics
//      it must require (doors/post/bounce/glide/rail/crack/soft/pz/lit/wind). Each is
//      knocked out in turn; if the objective stays reachable, that is a BYPASS error.
//   5. SOFTLOCK SCAN + annotated minimaps (audits/<map>.png) + density stats.
// Usage:  NODE_PATH=/tmp/node_modules node test/audit.js [mapId ...]
const H = require('./harness'); const fs = require('fs'), path = require('path');
const { NQ } = H;
const { Game, Player, MAPS, TILEDEFS, tileAt } = NQ;
const OUT = []; const FINDINGS = { error: [], warn: [] };
const say = (s) => OUT.push(s);
const find = (lvl, map, msg) => FINDINGS[lvl].push('[' + map + '] ' + msg);

// ---------------- stages ----------------
const CAPS = {};
const stage = (id, base, extra) => { CAPS[id] = Object.assign({}, base ? CAPS[base] : {}, extra); };
stage('w1', null, { net: 1, cage: 1, sandals: 1, gloves: 1, harpoon: 1, bracers: 1, suit: 1, bone: 1, wings: 1, keys: 1 });
stage('sky1', 'w1', { ramsuit: 1, ramsi: 1, ramHead: 1 });
stage('sky2', 'sky1', { ramStun: 1 }); stage('sky3', 'sky2', { ramShield: 1 }); stage('sky4', 'sky3', { ramBoost: 1 });
stage('b5', 'sky4', { parents: 1 });
stage('b6', 'b5', { ramGlow: 1, ramShrink: 1 });
stage('b7', 'b6', { ramBounce: 1, ramDecoy: 1 });
stage('b8', 'b7', { ramGlide: 1, ramRoll: 1 });
stage('vaults', 'b8', { ramPound: 1 });
stage('w3', 'vaults', {}); stage('w4', 'w3', {});
const MAP_STAGE = {
  sky1: 'sky1', sky2: 'sky2', sky3: 'sky3', sky4: 'sky4',
  burrow5: 'b5', burrow6: 'b6', burrow7: 'b7', burrow8: 'b8', burrowtest: 'b8',
  vault1: 'vaults', vault2: 'vaults', vault3: 'vaults', vault4: 'vaults', gnash_throne: 'vaults', cog4: 'w4', castle1: 'w4',
};
const STRICT = new Set(Object.keys(MAP_STAGE));
const stageFor = (id) => MAP_STAGE[id] || (id.startsWith('cog') || id === 'world3map' ? 'w3' : 'w1');

// ---------------- intent: what each objective MUST require ----------------
// mech ∈ door | post | bounce | glide | rail | crack | soft | pz | lit | wind
const INTENT = {
  sky1:    { boss: ['crack'], exit: ['crack'] },
  sky2:    { boss: ['door'], exit: ['door'] },
  sky3:    { boss: ['crack'], exit: ['crack'] },
  sky4:    { boss: ['crack'], parents: ['crack'] },
  burrow5: { boss: ['pz', 'post', 'crack'], exit: ['door'] },
  burrow6: { boss: ['door', 'post', 'pz'], exit: ['bounce'] },
  burrow7: { boss: ['bounce', 'lit', 'post'], exit: ['glide'] },
  burrow8: { boss: ['rail', 'door', 'post'], exit: ['rail', 'door', 'post'] },
  vault1:  { exit: ['door'] }, vault2: { exit: ['door'] }, vault3: { exit: ['door'] }, vault4: { exit: ['door'] },
};

// ---------------- sandboxed system solvers (unchanged from v1) ----------------
function snapshot(m) {
  return { flags: JSON.parse(JSON.stringify(Game.flags)), tiles: m.tiles.map(r => r.slice()),
    objs: m.objects.map(o => ({ o, charged: o.charged, dir: o.dir, state: o.state, fleeT: o.fleeT, on: o.on })) };
}
function restore(m, snap) {
  for (const k of Object.keys(Game.flags)) delete Game.flags[k];
  Object.assign(Game.flags, snap.flags);
  for (let j = 0; j < m.tiles.length; j++) m.tiles[j] = snap.tiles[j].slice();
  for (const r of snap.objs) { r.o.charged = r.charged; r.o.dir = r.dir; r.o.state = r.state; r.o.fleeT = r.fleeT; r.o.on = r.on; }
}
function solveBeams(m) {
  const Beams = NQ.Beams; if (!Beams || !m.beams) return null;
  const rots = m.objects.filter(o => o.type === 'beamcrystal' && o.rot);
  const anchors = m.objects.filter(o => o.type === 'beamcrystal');
  const runes = m.objects.filter(o => o.type === 'sunrune');
  const moths = m.objects.filter(o => o.type === 'moths');
  const res = { runes: {}, bridge: 0, combos: Math.pow(4, rots.length) * (anchors.length + 1), rot: rots.length, initFired: [] };
  for (const r of runes) res.runes[r.flag] = 0;
  const snap = snapshot(m);
  Game.loadMap(m.id); Game.state = 'play';
  Object.assign(Game.flags, { ramsi: true, ramHead: true, ramGlow: true, ramDecoy: true });
  Game.flags['intro_' + m.id] = 1; Game._pendingIntro = null;
  for (const rec of snap.objs) if (rec.o.type === 'beamcrystal') rec.o.dir = rec.dir;
  for (const q of moths) q.fleeT = 0;
  if (m._beamWoken) m._beamWoken.clear();
  Game.companion.x = -999; Game.companion.y = -999; Game.glowOn = true;
  for (const key of Object.keys(Game.flags)) if (/^b7_/.test(key)) Game.flags[key] = false;
  Beams.update(0, m); Beams.update(0, m);
  for (const r of runes) if (Game.flags[r.flag]) res.initFired.push(r.flag);
  const total = Math.pow(4, rots.length);
  for (let mask = 0; mask < total; mask++) {
    let v = mask; for (const c of rots) { c.dir = v & 3; v >>= 2; }
    for (let a = -1; a < anchors.length; a++) {
      Game.companion.x = a < 0 ? -999 : anchors[a].x * 16 + 8; Game.companion.y = a < 0 ? -999 : anchors[a].y * 16 + 8;
      if (m._beamWoken) m._beamWoken.clear();
      for (const q of moths) q.fleeT = 99;
      Game.glowOn = true;
      for (const key of Object.keys(Game.flags)) if (/^b7_/.test(key)) Game.flags[key] = false;
      Beams.update(0, m); Beams.update(0, m);
      for (const r of runes) if (Game.flags[r.flag]) res.runes[r.flag]++;
      if (m._beamLit && m._beamLit.size >= (m._beamBridges ? m._beamBridges.size : 3)) res.bridge++;
    }
  }
  restore(m, snap); Beams.update(0, m);
  return res;
}
function solveSap(m) {
  const Sap = NQ.Sap; if (!Sap || !m._sap) return null;
  const bulbs = m.objects.filter(o => o.type === 'sapbulb');
  const runes = m.objects.filter(o => o.type === 'saprune');
  const res = { runes: {}, states: bulbs.reduce((a, b) => a * b.states.length, 1), initFired: [] };
  for (const r of runes) res.runes[r.flag] = 0;
  const snap = snapshot(m);
  Game.loadMap(m.id); Game.state = 'play';
  const idx = bulbs.map(() => 0);
  for (let n = 0; ; n++) {
    bulbs.forEach((b, i) => { b.state = b.states[idx[i]]; });
    Game.flags.switchFlags = {};
    Sap.recompute(m); Sap.recompute(m);
    for (const r of runes) if (Game.flags.switchFlags[r.flag]) { res.runes[r.flag]++; if (n === 0) res.initFired.push(r.flag); }
    let i = 0; while (i < bulbs.length && ++idx[i] >= bulbs[i].states.length) { idx[i] = 0; i++; }
    if (i >= bulbs.length) break;
  }
  restore(m, snap); Sap.recompute(m);
  return res;
}
function checkRails(m, walk) {
  if (!m._docks) return null; const notes = [];
  for (const d of m._docks) for (const r of d.routes.concat(d.routes.map(x => x.blocked).filter(Boolean))) {
    const end = r.pts[r.pts.length - 1];
    if (r.crash) { if (!r.out) notes.push('ERROR dock(' + d.x + ',' + d.y + '): crash route without out'); else if (!walk(r.out[0], r.out[1])) notes.push('ERROR dock(' + d.x + ',' + d.y + '): crash-out (' + r.out + ') not walkable'); }
    else if (!walk(end[0], end[1])) notes.push('ERROR dock(' + d.x + ',' + d.y + '): landing (' + end + ') not walkable');
  }
  for (const d of m._docks) { const s = d.routes.find(r => !r.crash); if (s && d.to && (s.pts[s.pts.length - 1][0] !== d.to[0] || s.pts[s.pts.length - 1][1] !== d.to[1])) notes.push('ERROR dock(' + d.x + ',' + d.y + '): d.to disagrees with solved route'); }
  return notes;
}
function checkHerd(m) {
  const spots = m.objects.filter(o => o.type === 'jobspot'); if (!spots.length) return null; const notes = [];
  for (const s of spots) {
    const ok = (m.spawns || []).some(sp => sp.species === s.species && Math.hypot((sp.x + sp.w / 2) - s.x, (sp.y + sp.h / 2) - s.y) < 10.5 + Math.max(sp.w, sp.h) / 2);
    if (!ok) notes.push('ERROR jobspot(' + s.x + ',' + s.y + ') ' + s.species + ': no herd in call range');
    if (!(m.puzzle || []).find(p => p.flag === s.flag)) notes.push('ERROR jobspot ' + s.flag + ': no puzzle entry');
  }
  return notes;
}
function checkWind(m) {
  if (!m._wind) return null; const notes = [];
  const stones = [];
  m._wind.forEach((l) => { if (l.bridge && l.pulse) for (let j = l.y; j < l.y + l.h; j++) for (let x = l.x; x < l.x + l.w; x++) if (tileAt(m, x, j) === 'rift') stones.push({ x, y: j, l }); });
  const onAt = (l, t) => ((t + (l.pulse[2] || 0)) % (l.pulse[0] + l.pulse[1])) < l.pulse[0];
  for (const s of stones) {
    if (s.l.pulse[0] < 0.9) notes.push('WARN stone(' + s.x + ',' + s.y + '): ON window <0.9s');
    for (const s2 of stones) {
      if (s2 === s || Math.abs(s2.x - s.x) + Math.abs(s2.y - s.y) !== 1 || s2.l === s.l) continue;
      let ov = 0; for (let t = 0; t < 40; t += 0.05) if (onAt(s.l, t) && onAt(s2.l, t)) ov += 0.05;
      const cyc = Math.max(s.l.pulse[0] + s.l.pulse[1], s2.l.pulse[0] + s2.l.pulse[1]);
      if (ov / (40 / cyc) < 0.5) notes.push('ERROR stones (' + s.x + ',' + s.y + ')<->(' + s2.x + ',' + s2.y + '): <0.5s shared ON per cycle');
    }
  }
  return notes;
}

// ---------------- THE MODEL: one parameterized fixpoint run ----------------
// knock = { door:'all'|Set('x,y'), post, bounce, glide, rail, crack, soft, wind, lit, pz:'all'|Set(flag) }
function runModel(m, stg, solv, knock) {
  knock = knock || {};
  const caps = Object.assign({}, CAPS[stg]);
  const achieved = new Set(); const chain = [];
  const doorKnocked = (i, j) => knock.door === 'all' || (knock.door && knock.door.has(i + ',' + j));
  const pzKnocked = (f) => knock.pz === 'all' || (knock.pz && knock.pz.has(f));
  const has = (f) => !f || caps[f] || achieved.has(f) || (!STRICT.has(m.id) && /^(sw_|cog_|sc_)/.test(f));
  const bridgeTiles = new Set();
  const rebuild = () => {
    bridgeTiles.clear();
    if (!knock.lit && m._beamBridges && solv.beams && solv.beams.bridge > 0) for (const k of m._beamBridges) bridgeTiles.add(k);
    if (!knock.wind && m._wind) for (const l of m._wind) if (l.bridge) for (let j = l.y; j < l.y + l.h; j++) for (let x = l.x; x < l.x + l.w; x++) if (tileAt(m, x, j) === 'rift') bridgeTiles.add(x + ',' + j);
    if (m.puzzle) for (const pz of m.puzzle) if (!pzKnocked(pz.flag) && has(pz.flag)) for (const [ti, tj] of pz.tiles || []) bridgeTiles.add(ti + ',' + tj);
    for (const o of m.objects) if (o.type === 'anemgate' && has('glowgate_' + o.id)) for (const [ti, tj] of o.cells) bridgeTiles.add(ti + ',' + tj);
  };
  const pass = (i, j) => {
    if (i < 0 || j < 0 || i >= m.w || j >= m.h) return false;
    if (bridgeTiles.has(i + ',' + j)) return true;
    const id = tileAt(m, i, j), d = TILEDEFS[id] || {};
    if (d.door || d.gate) { if (doorKnocked(i, j)) return false; const dr = (m.doors || {})[i + ',' + j]; return !dr || dr.kind !== 'flag' || has(dr.req); }
    if (d.crack) return !knock.crack && !!caps.ramsuit;
    if (d.soft) return !knock.soft && !!caps.ramRoll;
    if (d.prop) return false;
    if (d.solid) return false;
    if (id === 'water') return !!caps.suit || !!m.underwater;
    if (id === 'deep') return !!m.underwater;
    if (d.hole) return true;
    if (d.rift) return !!caps.wings && !m.noFly;
    return true;
  };
  const losClear = (x0, y0, x1, y1) => {
    const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0); let x = x0 + dx, y = y0 + dy;
    while (x !== x1 || y !== y1) { const d = TILEDEFS[tileAt(m, x, y)] || {}; if (d.solid) return false; x += dx; y += dy; }
    return true;
  };
  const reach = () => {
    rebuild();
    const seen = new Set(); const q = [];
    const push = (i, j) => { const k = i + ',' + j; if (!seen.has(k) && pass(i, j)) { seen.add(k); q.push([i, j]); } };
    seen.add(m.start.x + ',' + m.start.y); q.push([m.start.x, m.start.y]);
    const posts = knock.post ? [] : m.objects.filter(o => o.type === 'post');
    const lands = {};
    for (const o of m.objects) {
      if (o.type === 'bouncepad' && o.to && !knock.bounce && caps.ramBounce && has(o.req)) lands[o.x + ',' + o.y] = o.to;
      if (o.type === 'glidevent' && o.to && !knock.glide && caps.ramGlide && has(o.req)) lands[o.x + ',' + o.y] = o.to;
      if (o.type === 'raildock' && o.to && !knock.rail && has(o.req)) lands[o.x + ',' + o.y] = o.to;
      if (o.type === 'warp') lands[o.x + ',' + o.y] = [o.tx, o.ty];
    }
    while (q.length) {
      const [i, j] = q.shift();
      push(i + 1, j); push(i - 1, j); push(i, j + 1); push(i, j - 1);
      const lp = lands[i + ',' + j]; if (lp) { const k = lp[0] + ',' + lp[1]; if (!seen.has(k)) { seen.add(k); q.push(lp); } }
      if (caps.harpoon) for (const p of posts) {
        const k = p.x + ',' + p.y; if (seen.has(k)) continue;
        if (((p.x === i && Math.abs(p.y - j) <= 7) || (p.y === j && Math.abs(p.x - i) <= 7)) && losClear(i, j, p.x, p.y)) { seen.add(k); q.push([p.x, p.y]); }
      }
    }
    return seen;
  };
  const adj = (s, x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => s.has((x + a) + ',' + (y + b)));
  let seen = reach();
  for (let iter = 0; iter < 12; iter++) {
    let grew = false;
    const earn = (f, why) => { if (f && !achieved.has(f) && !caps[f]) { achieved.add(f); chain.push(f + '  <-  ' + why); grew = true; } };
    for (const o of m.objects) {
      if (o.type === 'boss' && adj(seen, o.x, o.y)) { earn(o.boss, 'beat ' + o.boss.toUpperCase() + ' in its den'); if (o.gauntlet) earn('g_' + o.boss, 'gauntlet re-match won'); }
      if (o.type === 'pillowkin' && adj(seen, o.x, o.y) && has(o.warden)) {
        earn('kin_' + o.kin, 'freed ' + (o.name || 'kin') + ' (needs ' + o.warden + ')');
        for (const g of o.gives || []) if (!caps[g]) { caps[g] = 1; chain.push(g + '  <-  gift of ' + (o.name || 'kin')); grew = true; }
      }
      if (o.type === 'ramswitch' && caps.ramHead && adj(seen, o.x, o.y)) earn(o.flag, 'RAMSI headbutts the switch');
      if (o.type === 'boneswitch' && caps.bone && [...seen].some(k => { const [i, j] = k.split(',').map(Number); return Math.abs(i - o.x) + Math.abs(j - o.y) <= 6; })) earn(o.flag, 'boomer-bone throw');
      if (o.type === 'poundplate' && caps.ramPound && adj(seen, o.x, o.y)) earn(o.flag, 'ground-pound');
      if (o.type === 'ramhole' && caps.ramShrink && o.flag && adj(seen, o.x, o.y)) earn(o.flag, 'shrink through the hole');
      if (o.type === 'anemgate' && !achieved.has('glowgate_' + o.id) &&
          m.objects.some(a => a.type === 'glowalgae' && Math.hypot(a.x - o.x, a.y - o.y) < 3.4 && adj(seen, a.x, a.y)))
        earn('glowgate_' + o.id, 'glow-algae lit beside the anemones');
      if (o.type === 'sunrune' && !pzKnocked(o.flag) && solv.beams && solv.beams.runes[o.flag] > 0) earn(o.flag, 'light-beam puzzle');
      if (o.type === 'saprune' && !pzKnocked(o.flag) && solv.sap && solv.sap.runes[o.flag] > 0) earn(o.flag, 'sap-flow puzzle');
      if (o.type === 'jobspot' && !pzKnocked(o.flag) && adj(seen, o.x, o.y)) earn(o.flag, 'herd job (' + o.species + ')');
      if (o.type === 'parents' && achieved.has('tempestia')) earn('parents', 'rescued after the Storm-Lord');
    }
    if (m.puzzle) for (const pz of m.puzzle) {
      const isRune = m.objects.some(o => ['sunrune', 'saprune', 'jobspot'].includes(o.type) && o.flag === pz.flag);
      if (!isRune && !pzKnocked(pz.flag) && caps.bracers && adj(seen, pz.sw[0], pz.sw[1]) && m.objects.some(o => o.type === 'block'))
        if (!achieved.has(pz.flag)) { achieved.add(pz.flag); chain.push(pz.flag + '  <-  block on switch'); grew = true; }
    }
    else if (m.dungeon && caps.bracers && !pzKnocked('sw_' + m.id) && m.objects.some(o => o.type === 'block')) {
      // implicit dungeon rule (12_main): any block on any 'switch' tile sets sw_<mapId>
      let swReach = false;
      for (let j = 0; j < m.h && !swReach; j++) for (let i = 0; i < m.w; i++) if (tileAt(m, i, j) === 'switch' && adj(seen, i, j)) { swReach = true; break; }
      if (swReach) earn('sw_' + m.id, 'block on the star switch (dungeon rule)');
    }
    if (!grew) break;
    seen = reach();
  }
  return { seen, achieved, chain, caps, adj, pass, reach };
}

// ---------------- per-map audit ----------------
function audit(mapId) {
  const m = MAPS[mapId]; if (!m) return;
  const stg = stageFor(mapId), strict = STRICT.has(mapId);
  const walk = (i, j) => { const d = TILEDEFS[tileAt(m, i, j)] || {}; return !d.solid && !d.hole && !d.rift && tileAt(m, i, j) !== 'water'; };
  const solv = { beams: solveBeams(m), sap: solveSap(m) };
  const rails = checkRails(m, walk), herd = checkHerd(m), wind = checkWind(m);
  const base = runModel(m, stg, solv, {});
  say('\n## ' + mapId + '  (' + (m.name || '') + ') — stage: ' + stg + (strict ? '' : ' [lenient]'));

  // ---- items ----
  const SKIP = new Set(['railseg', 'rootseg', 'windnet', 'stormfx', 'molehill', 'coindune', 'railsignal', 'spout', 'moths', 'decor', 'prop', 'colossusbg', 'stormfx2']);
  const items = m.objects.filter(o => !o.compOnly && !o.deco && !SKIP.has(o.type)).map(o => ({ o, ok: base.adj(base.seen, o.x, o.y) }));
  let lateSeen = null;
  for (const it of items) if (!it.ok) {
    if (!lateSeen) { const lm = runModel(m, 'w4', solv, {}); ['mottle','thornback','geode','grub','gnash','gustwing','pufflord','sparkhorn','tempestia'].forEach(f => lm.achieved.add(f)); lateSeen = lm.reach(); }
    it.late = base.adj(lateSeen, it.o.x, it.o.y);
  }
  const bad = items.filter(i => !i.ok && !i.late), late = items.filter(i => !i.ok && i.late);
  say('- items: ' + items.filter(i => i.ok).length + ' ok, ' + late.length + ' backtrack-only, ' + bad.length + ' NEVER');
  for (const it of bad) { say('  - **ERROR** ' + it.o.type + (it.o.boss ? ':' + it.o.boss : '') + ' @(' + it.o.x + ',' + it.o.y + ') never reachable'); find('error', mapId, it.o.type + '@(' + it.o.x + ',' + it.o.y + ') never reachable'); }
  for (const it of late) say('  - WARN ' + it.o.type + ' @(' + it.o.x + ',' + it.o.y + ') backtrack-only');
  if (base.chain.length) { say('- logic path:'); for (const c of base.chain) say('  1. ' + c); }

  // ---- solvers ----
  if (solv.beams) {
    say('- beams: ' + solv.beams.rot + ' turnables, per-rune: ' + JSON.stringify(solv.beams.runes) + ', bridge states: ' + solv.beams.bridge);
    for (const f in solv.beams.runes) if (!solv.beams.runes[f]) { say('  - **ERROR** rune ' + f + ' unsolvable'); find('error', mapId, 'beam rune ' + f + ' unsolvable'); }
    if (solv.beams.initFired.length) { say('  - **ERROR** pre-solved at load: ' + solv.beams.initFired); find('error', mapId, 'beam pre-solved: ' + solv.beams.initFired); }
  }
  if (solv.sap) {
    say('- sap: ' + solv.sap.states + ' states, per-rune: ' + JSON.stringify(solv.sap.runes));
    for (const f in solv.sap.runes) if (!solv.sap.runes[f]) { say('  - **ERROR** sap rune ' + f + ' unsolvable'); find('error', mapId, 'sap rune ' + f + ' unsolvable'); }
    if (solv.sap.initFired.length) { say('  - **ERROR** pre-solved at load: ' + solv.sap.initFired); find('error', mapId, 'sap pre-solved: ' + solv.sap.initFired); }
  }
  for (const set of [rails, herd, wind]) if (set) for (const n of set) { say('  - ' + (n.startsWith('ERROR') ? '**' + n + '**' : n)); find(n.startsWith('ERROR') ? 'error' : 'warn', mapId, n.replace(/^(ERROR|WARN) /, '')); }

  // ---- WALK-AROUND detector: lock each flag-door; reach must SHRINK ----
  const BYPASS_OK = { 'wastes:53,12': 'late-game wings shortcut, accepted',
    'vale:61,33': 'late-game WINGS can glide over the pond into the crags — accepted (Billy still guards every walking route)',
    // museum wing doors gate a LINK to another map; per-map-start reach cannot see cross-map
    // gating, so locking them "loses" nothing in-map. The wings are display-only rooms.
    'grannyzoo:4,0': 'museum wing door (cross-map link, display room)',
    'grannyzoo:10,0': 'museum wing door (cross-map link, display room)',
    'grannyzoo:0,7': 'museum wing door (cross-map link, display room)',
    'grannyzoo:21,7': 'museum wing door (cross-map link, display room)',
    'vale:40,8': 'Tinker Annex street door (cross-map link into the workshop)' };
  const doors = Object.entries(m.doors || {}).filter(([, d]) => d.kind === 'flag');
  for (const [key] of doors) {
    if (BYPASS_OK[mapId + ':' + key]) { say('- door @(' + key + ') bypassable — accepted: ' + BYPASS_OK[mapId + ':' + key]); continue; }
    const locked = runModel(m, stg, solv, { door: new Set([key]) });
    let shrunk = false; for (const k of base.seen) if (!locked.seen.has(k)) { shrunk = true; break; }
    if (!shrunk) { say('- **ERROR** door @(' + key + ') is DECORATIVE — the player can walk around it'); find('error', mapId, 'door @(' + key + ') bypassable (walk-around)'); }
  }
  // puzzle machines whose tile-swaps gate nothing (pure-loot machines are fine: knock only bridge swaps)
  if (m.puzzle) for (const pz of m.puzzle) {
    if (!(pz.tiles || []).length) continue;
    const locked = runModel(m, stg, solv, { pz: new Set([pz.flag]) });
    let shrunk = false; for (const k of base.seen) if (!locked.seen.has(k)) { shrunk = true; break; }
    if (!shrunk) { say('- note: machine ' + pz.flag + ' opens no new ground (loot/cosmetic?)'); }
  }

  // ---- INTENT: declared mechanics must be REQUIRED for boss/kin/exit ----
  const intent = INTENT[mapId];
  if (intent) {
    const objectives = {
      boss: m.objects.find(o => o.type === 'boss'),
      kin: m.objects.find(o => o.type === 'pillowkin'),
      exit: m.objects.find(o => o.type === 'portal'),
      parents: m.objects.find(o => o.type === 'parents'),
    };
    for (const [what, mechs] of Object.entries(intent)) {
      const o = objectives[what]; if (!o) { say('- **ERROR** intent lists ' + what + ' but none found'); find('error', mapId, 'intent: no ' + what); continue; }
      if (!base.adj(base.seen, o.x, o.y)) continue;   // already reported as unreachable
      for (const mech of mechs) {
        const ko = runModel(m, stg, solv, { [mech]: mech === 'door' ? 'all' : (mech === 'pz' ? 'all' : true) });
        if (ko.adj(ko.seen, o.x, o.y)) { say('- **ERROR** ' + what + ' reachable WITHOUT ' + mech.toUpperCase() + ' — bypass!'); find('error', mapId, what + ' bypasses ' + mech); }
        else say('- gate ok: ' + what + ' requires ' + mech.toUpperCase());
      }
    }
  }

  // ---- softlock ----
  const exits = [[m.start.x, m.start.y]];
  for (const o of m.objects) if (o.type === 'portal' && base.adj(base.seen, o.x, o.y)) exits.push([o.x, o.y]);
  for (const L of m.links || []) exits.push([L.x, L.y]);
  const back = new Set(); {
    const q = [];
    const push = (i, j) => { const k = i + ',' + j; if (!back.has(k) && base.pass(i, j)) { back.add(k); q.push([i, j]); } };
    for (const [x, y] of exits) { back.add(x + ',' + y); q.push([x, y]); }
    const revLands = {};
    for (const o of m.objects) if ((o.type === 'bouncepad' || o.type === 'glidevent' || o.type === 'raildock' || o.type === 'warp') && (o.to || o.tx !== undefined)) {
      const t = o.to || [o.tx, o.ty]; (revLands[t[0] + ',' + t[1]] = revLands[t[0] + ',' + t[1]] || []).push([o.x, o.y]);
    }
    while (q.length) {
      const [i, j] = q.shift();
      push(i + 1, j); push(i - 1, j); push(i, j + 1); push(i, j - 1);
      for (const src of revLands[i + ',' + j] || []) { const k = src.join(','); if (!back.has(k) && base.pass(src[0], src[1])) { back.add(k); q.push(src); } }
    }
    // posts pull both ways for the return trip
    let grew = true;
    while (grew) { grew = false;
      for (const p of m.objects.filter(o => o.type === 'post')) {
        if (back.has(p.x + ',' + p.y)) {
          for (const k of base.seen) { const [i, j] = k.split(',').map(Number);
            if (!back.has(k) && ((p.x === i && Math.abs(p.y - j) <= 7) || (p.y === j && Math.abs(p.x - i) <= 7))) { back.add(k); q.push([i, j]); grew = true; } }
        }
      }
      while (q.length) { const [i, j] = q.shift(); push(i + 1, j); push(i - 1, j); push(i, j + 1); push(i, j - 1); }
    }
  }
  const stranded = [...base.seen].filter(k => !back.has(k));
  if (stranded.length) {
    const withItems = items.filter(i => i.ok && stranded.includes(i.o.x + ',' + i.o.y));
    say('- softlock: ' + stranded.length + ' stranded tiles' + (withItems.length ? ' (' + withItems.length + ' items!)' : ''));
    find(withItems.length ? 'error' : 'warn', mapId, stranded.length + ' stranded tiles e.g. ' + stranded.slice(0, 4).join(' '));
  }

  // ---- minimap ----
  try {
    const S = 4, cv = global.__mkCanvas(m.w * S, m.h * S), c = cv.getContext('2d');
    for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) {
      const id = tileAt(m, i, j), d = TILEDEFS[id] || {};
      c.fillStyle = d.solid ? '#2a2140' : id === 'water' ? '#3a6ea5' : (d.hole || d.rift) ? '#0c0918' : d.door ? '#c8a030' : '#8a6a44';
      if (base.seen.has(i + ',' + j)) c.fillStyle = '#b99a6b';
      if (stranded.includes(i + ',' + j)) c.fillStyle = '#7a3a8a';
      c.fillRect(i * S, j * S, S, S);
    }
    for (const it of items) { c.fillStyle = it.ok ? '#35d048' : it.late ? '#f0a030' : '#f03030'; c.fillRect(it.o.x * S, it.o.y * S, S, S); c.strokeStyle = '#000'; c.strokeRect(it.o.x * S + 0.5, it.o.y * S + 0.5, S - 1, S - 1); }
    fs.writeFileSync(path.join(__dirname, '..', 'audits', mapId + '.png'), cv.toBuffer('image/png'));
  } catch (e) { say('  (minimap failed: ' + e.message + ')'); }
}

// ---------------- run ----------------
const want = process.argv.slice(2);
const all = want.length ? want : Object.keys(MAPS);
say('# BUFF NOAH — AUDIT REPORT v2 (' + new Date().toISOString().slice(0, 10) + ')');
say('Stage reachability + puzzle solvers + WALK-AROUND detection + intent gates + softlocks.');
for (const id of all) { try { audit(id); } catch (e) { say('\n## ' + id + '\n- AUDITOR CRASH: ' + e.message); find('error', id, 'auditor crash: ' + e.message); } }
say('\n---\n# FINDINGS');
say('## Errors (' + FINDINGS.error.length + ')'); for (const f of FINDINGS.error) say('- ' + f);
say('## Warnings (' + FINDINGS.warn.length + ')'); for (const f of FINDINGS.warn) say('- ' + f);
fs.writeFileSync(path.join(__dirname, '..', 'audit_report.md'), OUT.join('\n') + '\n');
console.log('\nAUDIT DONE — ' + FINDINGS.error.length + ' error(s), ' + FINDINGS.warn.length + ' warning(s). Report: audit_report.md');
if (FINDINGS.error.length) { console.log(FINDINGS.error.map(f => 'ERROR ' + f).join('\n')); }
process.exitCode = FINDINGS.error.length ? 1 : 0;
