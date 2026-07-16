"use strict";
// ===================== THE ROYAL STABLEWORKS (Cogwerk side-dungeon) =====================
// The city's old royal menagerie: brass paddocks where wild HORSES gallop (they bolt from
// nets — only a cage baited with fresh HAY works) and a bone-latched den of sleepy LIONS
// (bonk with the BOOMER-BONE, then net). Feeds THE COMBINER's mythic recipes (26).
(function () {
  // ---- new species ----
  Object.assign(CREATURES, {
    horse: { name: 'Horse', habitat: 'land', spd: 42, catch: ['cage'], bait: 'hay', skittish: true },
    lion:  { name: 'Lion',  habitat: 'land', spd: 30, catch: ['stun'], stunThen: 'net', bait: null,
             sting: 1, aggressive: true, aggro: 110 },
  });

  // ---- placeholder sprites (chunky pixel grids; sheet.mythics art overrides these later) ----
  const HORSE_G = [
    '..........kk....',
    '.........kMMk...',
    '....kkkkkMHHWk..',
    '...kHHHHHMHHk...',
    '..kHHHHHHMHek...',
    '..kHHHHHHHHk....',
    '..kHHHHHHHk.....',
    '..kHhHHHhHk.....',
    '..kHkkkkkHk.....',
    '..kHk...kHk.....',
    '..kkk...kkk.....',
  ];
  const LION_G = [
    '..........kkk...',
    '........kkMMMk..',
    '.......kMMLLMMk.',
    '...kkkkMMLeLMMk.',
    '..kLLLLLMMLLMk..',
    '..kLLLLLLMMMk...',
    '.mkLLLLLLLLk....',
    'kmkLlLLLlLk.....',
    '.m.kLkkkLk......',
    '...kLk.kLk......',
    '...kkk.kkk......',
  ];
  const HAY_G = [
    '..kkkkk...',
    '.kYyYyYk..',
    'kYyYyYyYk.',
    'kyYyYyYyk.',
    'kYyYyYyYk.',
    '.kkkkkkk..',
  ];
  const HORSE_PAL = { H: '#a8703c', h: '#8a5c2c', M: '#54382c', W: '#f0e8d8' };
  const LION_PAL  = { L: '#e8c060', l: '#c89838', M: '#a8642c', m: '#a8642c' };
  const HAY_PAL   = { Y: '#e8c060', y: '#c89838' };
  function installStableSprites() {
    const S = Sprites;
    const hasExt = (k) => (typeof EXT_ART !== 'undefined') && EXT_ART[k];   // sheet art incoming? step aside
    const mk = (g, pal) => { const a = buildSprite(g, pal), b = buildSprite(hopFrame(g), pal); return { right: [a, b], left: [flipH(a), flipH(b)] }; };
    if (!hasExt('creature.horse.a') && !(S.creatures.horse && S.creatures.horse.right[0])) S.creatures.horse = mk(HORSE_G, HORSE_PAL);
    if (!hasExt('creature.lion.a') && !(S.creatures.lion && S.creatures.lion.right[0])) S.creatures.lion = mk(LION_G, LION_PAL);
    S.items.hay = S.items.hay || buildSprite(HAY_G, HAY_PAL);
    if (!hasExt('npc.otto')) S.npcs.otto = S.npcs.otto || buildSprite(NPC_GRIDS.trader, { V: '#c8743c', v: '#8a5c2c' });
  }
  const _bas = buildAllSprites;
  buildAllSprites = function () { _bas(); installStableSprites(); };
  if (typeof Sprites !== 'undefined' && Sprites.creatures) installStableSprites();

  // ---- the dungeon map ----
  if (typeof newMap === 'function' && !MAPS.stable) {
    const m = newMap('stable', 44, 26, 'cogfloor', { name: 'The Royal Stableworks', song: 'canyon', cliff: 'stone', zone: 'city' });
    for (let i = 0; i < m.w; i++) { T(m, i, 0, 'wall'); T(m, i, m.h - 1, 'wall'); }
    for (let j = 0; j < m.h; j++) { T(m, 0, j, 'wall'); T(m, m.w - 1, j, 'wall'); }

    // HORSE PADDOCK (west): fenced meadow with a gate gap
    R(m, 4, 4, 17, 11, 'fence');
    R(m, 5, 5, 15, 9, 'grass');
    T(m, 12, 14, 'grass');                       // the gate gap
    SPAWN(m, 'horse', 6, 6, 13, 7, 5);
    SIGN(m, 14, 15, 'WILD HORSES! They BOLT from nets. SET A CAGE [4] with HAY, stand back, and wait...');

    // HAY BARN (south-west): hay regrows every visit
    R(m, 3, 18, 8, 6, 'fence');
    R(m, 4, 19, 6, 4, 'wood');
    T(m, 7, 18, 'wood');                         // barn doorway
    OBJ(m, { type: 'haybale', x: 5, y: 20 });
    OBJ(m, { type: 'haybale', x: 8, y: 20 });
    OBJ(m, { type: 'haybale', x: 6, y: 22 });
    SIGN(m, 9, 17, 'THE HAY BARN — walk up to a bale to GATHER HAY. It regrows, always!');

    // LION DEN (east): behind a bone-latch
    for (let j = 4; j <= 13; j++) { T(m, 29, j, 'wall'); }
    for (let i = 29; i < 43; i++) { T(m, i, 4, 'wall'); T(m, i, 13, 'wall'); }
    R(m, 30, 5, 12, 8, 'floor');
    DOOR(m, 29, 9, 'bone', null, 'A BONE-LATCH! Knock it open with the BOOMER-BONE (tool 5, Z).');
    T(m, 28, 9, 'cogfloor');
    SPAWN(m, 'lion', 31, 6, 10, 6, 3);
    CHEST(m, 40, 6, { gems: 10 });
    SIGN(m, 27, 10, 'THE LION DEN: BONK a lion sleepy with the BOOMER-BONE [5], then NET [2] it quick!');

    // keeper + flavor
    OBJ(m, { type: 'facade', x: 4, y: 17, w: 6, key: 'barnfront' });     // the barn house behind the yard
    OBJ(m, { type: 'artprop', x: 8, y: 12, key: 'trough' });
    OBJ(m, { type: 'artprop', x: 15, y: 12, key: 'trough' });
    OBJ(m, { type: 'artprop', x: 20, y: 20, key: 'lantern' });
    OBJ(m, { type: 'artprop', x: 25, y: 20, key: 'lantern' });
    OBJ(m, { type: 'artprop', x: 35, y: 5, key: 'crest' });
    OBJ(m, { type: 'artprop', x: 29, y: 9, key: 'denarch' });
    NPC(m, 22, 20, 'otto', "OSTLER OTTO: Welcome to the ROYAL STABLEWORKS! The horses went wild when the city wound down. HAY from my barn is the only snack they trust. And, er... mind the lions.");
    SIGN(m, 22, 23, 'THE ROYAL STABLEWORKS — home of the swiftest horses and laziest lions in Cogwerk.');
    T(m, 34, 19, 'flowers'); T(m, 16, 17, 'flowers');
    m.start = { x: 22, y: 22 };
  }

  // ---- world-3 node (after the first star-cell) ----
  if (typeof WORLD3_NODES !== 'undefined' && !WORLD3_NODES.some(n => n.id === 'stable')) {
    WORLD3_NODES.splice(4, 0, { id: 'stable', label: 'The Stableworks', req: 'sc_cog1', x: 140, y: 196 });
  }

  // ---- HAY: the sixth bait ----
  const ensureHay = () => { const F = Game.flags; if (F && F.baits && !('hay' in F.baits)) F.baits.hay = 0; };
  // hay bales: walk-over gather + per-entry regrowth (chained on the zoo populator like the museum)
  const _pz = Game.populateZoo;
  Game.populateZoo = function (m) {
    _pz.call(this, m);
    ensureHay();
    if (m && m.id === 'stable') for (const o of m.objects) if (o.type === 'haybale') o.done = false;
  };
  const _uba = Game.updateBurrowAbilities;
  Game.updateBurrowAbilities = function (dt) {
    _uba.call(this, dt);
    const m = this.map;
    if (!m || m.id !== 'stable' || this.state !== 'play') return;
    for (const o of m.objects) {
      if (o.type !== 'haybale' || o.done) continue;
      if (Math.abs(Player.x - (o.x * TILE + 8)) < 14 && Math.abs(Player.y - (o.y * TILE + 8)) < 14) {
        o.done = true; ensureHay();
        this.flags.baits.hay += 2;
        Audio2.jingle('gem'); Particles.burst(o.x * TILE + 8, o.y * TILE + 4, 'sparkle');
        this.toast('+2 HAY! Set a cage [4] near the horses.');
      }
    }
  };
  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.haybale = function (c, o, ox, oy) {
    const art = Sprites.props && Sprites.props[o.done ? 'haystubble' : 'haybale'];
    if (art) {
      dspr(c, art, ox - sprW(art) / 2, oy + 8 - sprH(art));
      if (!o.done && ((Game.time * 2 | 0) % 4) === 0) { c.fillStyle = '#fff'; c.fillRect(ox + 4, oy - 12, 1, 1); }
      return;
    }
    if (o.done) {                                  // stubble regrowing
      c.fillStyle = '#8a6c3c';
      for (let k = 0; k < 4; k++) c.fillRect(ox - 6 + k * 4, oy - 2, 1, 3);
      return;
    }
    c.fillStyle = '#241a33'; c.fillRect(ox - 8, oy - 10, 16, 12);
    c.fillStyle = '#e8c060'; c.fillRect(ox - 7, oy - 9, 14, 10);
    c.fillStyle = '#c89838';
    for (let k = 0; k < 3; k++) c.fillRect(ox - 7, oy - 8 + k * 3, 14, 1);
    c.fillStyle = '#f8ec70'; c.fillRect(ox - 7, oy - 9, 14, 1);
    c.strokeStyle = '#8a5c2c'; c.beginPath(); c.moveTo(ox - 2, oy - 9); c.lineTo(ox - 2, oy + 1); c.stroke();
    if (((Game.time * 2 | 0) % 4) === 0) { c.fillStyle = '#fff'; c.fillRect(ox + 3, oy - 12, 1, 1); }
  };
})();
