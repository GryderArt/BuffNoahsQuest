"use strict";
// ===================== DUNGEON SECRET ROOMS (a SECOND-PASS reward) =====================
// Every dungeon hides a VAULT you can only reach on a return trip. A CRACKED WALL (grottos,
// keeps, the Void) opens when you LUNGE with the RAM SUIT; a bolted latch (the burrows) drops
// when you SHRINK Mimi through a ram-hole. Either way the wall becomes an OPEN DOORWAY (a portal)
// that leads to a small, SEPARATE vault map — so the room is truly invisible until you step in,
// and no existing map is redrawn. Inside: a rare crafting material (GOLD NUGGET / CRYSTAL SHARD /
// VOID GEM), a coin bonus, and a way back. Entrances are found at build time, adapting to each map.
(function () {
  if (typeof Game === 'undefined') return;

  // [dungeonId, material, ability]  crack = RAM-SMASH (Vale/Wastes), shrink = FLING-MIMI (burrows)
  const ROOMS = [
    ['grotto1', 'goldnugget', 'crack'], ['grotto2', 'goldnugget', 'crack'],
    ['grotto3', 'goldnugget', 'crack'], ['grotto4', 'goldnugget', 'crack'],
    ['keep1', 'voidgem', 'crack'], ['keep2', 'voidgem', 'crack'], ['keep3', 'voidgem', 'crack'],
    ['void', 'voidgem', 'crack'],
    ['burrow5', 'crystalshard', 'shrink'], ['burrow6', 'crystalshard', 'shrink'],
    ['burrow7', 'crystalshard', 'shrink'], ['burrow8', 'crystalshard', 'shrink'],
  ];
  const THEME = {   // vault look per material
    goldnugget: { name: 'Hidden Treasure Vault', base: 'floor', zone: 'vale', wall: 'wall', accent: 'shell' },
    voidgem:    { name: 'Astral Cache', base: 'voidfloor', zone: 'wastes', wall: 'wall', accent: 'crater' },
    crystalshard: { name: 'Crystal Pocket', base: 'soil', zone: 'burrow', wall: 'crystal', accent: 'shell' },
  };

  const tdAt = (m, x, y) => TILEDEFS[m.tiles[y][x]] || {};
  const objAt = (m, x, y) => m.objects.some(o => o.x === x && o.y === y && o.type !== 'sign');
  function reachable(m) {
    const seen = new Set(), q = [], st = m.start || { x: 1, y: 1 };
    const walk = (x, y) => { const d = tdAt(m, x, y); return !(d.solid && !d.crack) && !d.hole && !d.rift; };
    const push = (x, y) => { const k = x + ',' + y; if (x < 0 || y < 0 || x >= m.w || y >= m.h || seen.has(k) || !walk(x, y)) return; seen.add(k); q.push([x, y]); };
    push(st.x, st.y);
    while (q.length) { const [x, y] = q.shift(); push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
    return seen;
  }
  // a WALL (or, on rift maps like the Void, a chasm tile) adjacent to reachable floor — the
  // entrance goes here (no carving). Two passes: prefer a real wall, fall back to a rift/chasm.
  function findWall(m) {
    const seen = reachable(m), DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const cells = [...seen].map(k => k.split(',').map(Number));
    cells.sort((a, b) => (Math.abs(b[0] - m.w / 2) + Math.abs(b[1] - m.h / 2)) - (Math.abs(a[0] - m.w / 2) + Math.abs(a[1] - m.h / 2)));
    const scan = (accept) => {
      for (const [fx, fy] of cells) for (const [dx, dy] of DIRS) {
        const wx = fx + dx, wy = fy + dy;
        if (wx < 1 || wy < 1 || wx >= m.w - 1 || wy >= m.h - 1) continue;
        const d = tdAt(m, wx, wy);
        if (d.crack || d.door || d.gate || objAt(m, wx, wy)) continue;
        if (!accept(d)) continue;
        if (fx < 1 || fy < 1 || objAt(m, fx, fy)) continue;
        return { fx, fy, wx, wy };
      }
      return null;
    };
    return scan(d => !!d.solid) || scan(d => !!(d.hole || d.rift));   // wall first, then a chasm crystal
  }

  // ---- build a small, self-contained VAULT map ----
  function makeVault(vid, mat, ret, theme) {
    if (MAPS[vid]) return;
    const th = THEME[mat] || THEME.goldnugget;
    const W = 10, H = 8;
    const m = newMap(vid, W, H, th.base, { name: th.name, song: 'dungeon', cliff: 'stone', zone: th.zone, dungeon: true });
    for (let i = 0; i < W; i++) { T(m, i, 0, th.wall); T(m, i, H - 1, th.wall); }
    for (let j = 0; j < H; j++) { T(m, 0, j, th.wall); T(m, W - 1, j, th.wall); }
    // a little decor + the treasure
    T(m, 2, 2, th.accent); T(m, 7, 2, th.accent); T(m, 2, 5, th.accent); T(m, 7, 5, th.accent);
    CHEST(m, 5, 3, { mat, coins: 15 });
    CHEST(m, 3, 4, { coins: 20 });
    SIGN(m, 5, 5, 'A FORGOTTEN VAULT — sealed since the old days. The ' + (Game.MAT_NAMES && Game.MAT_NAMES[mat] || mat) + ' is yours!');
    OBJ(m, { type: 'portal', x: 5, y: 6, to: ret.map, tx: ret.x, ty: ret.y });   // the way back out
    SIGN(m, 4, 6, 'Step on the swirl to climb back out.');
    m.start = { x: 5, y: 2 };
  }

  Game.addSecretRooms = function () {
    if (this._secretRooms) return; this._secretRooms = true;
    this.secretRoomInfo = {};
    for (const [mid, mat, type] of ROOMS) {
      const m = MAPS[mid]; if (!m) continue;
      const spot = findWall(m);
      if (!spot) { this.secretRoomInfo[mid] = 'no-spot'; continue; }
      const vid = 'vault_' + mid, flag = 'secret_' + mid;
      makeVault(vid, mat, { map: mid, x: spot.fx, y: spot.fy }, mat);
      // the DOORWAY portal (hidden until the entrance is opened) sits on the wall tile
      OBJ(m, { type: 'portal', x: spot.wx, y: spot.wy, to: vid, tx: 5, ty: 2, req: flag, secret: true, vaultEntry: true });
      if (type === 'crack') {
        T(m, spot.wx, spot.wy, 'crack');                                 // smash it with the RAM SUIT
      } else {
        T(m, spot.wx, spot.wy, 'doorF'); m.doors[spot.wx + ',' + spot.wy] = { kind: 'flag', req: flag, id: mid + '_secretdoor' };
        OBJ(m, { type: 'ramhole', x: spot.fx, y: spot.fy, flag, compOnly: true, secret: true, msg: 'RAMSI wriggles into a crevice and pops a hidden latch — a SECRET DOORWAY opens!' });
      }
      this.secretRoomInfo[mid] = { type, mat, wx: spot.wx, wy: spot.wy, vault: vid };
    }
  };

  // ---- smashing a secret crack sets its flag, so the hidden doorway appears ----
  {
    const _smash = Game.smashCrack;
    Game.smashCrack = function (map, ti, tj) {
      const port = map.objects.find(o => o.type === 'portal' && o.vaultEntry && o.x === ti && o.y === tj && o.req);
      _smash.call(this, map, ti, tj);
      if (port && !this.flags[port.req]) {
        this.flags[port.req] = true;
        Audio2.jingle('door'); Particles.burst(ti * TILE + 8, tj * TILE + 8, 'sparkle');
        this.banner('A HIDDEN DOORWAY yawns open behind the rubble — step through!');
        saveGame();
      }
    };
  }
})();
