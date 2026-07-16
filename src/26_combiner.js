"use strict";
// ===================== THE CREATURE COMBINER =====================
// COMBI's machine in Granny's Workshop: bring the right friends and they JOIN
// HOOVES and transform into one rare new friend (nobody is ever "lost" — kid rule).
// Recipes unlock with adventure progress; the deepest ones consume CRAFTED rares,
// so completing the collection means many more catching trips. REPLAY FUEL.
(function () {
  // ---- crafted species ----
  Object.assign(CREATURES, {
    rainbowsheep: { name: 'Rainbow Sheep', habitat: 'land', spd: 12, catch: [], bait: null, sparkle: true },
    baalien:      { name: 'Baa-lien',      habitat: 'land', spd: 16, catch: [], bait: null },
    glittergoat:  { name: 'Glitter Goat',  habitat: 'land', spd: 18, catch: [], bait: null, sparkle: true },
    glimmerram:   { name: 'Glimmer Ram',   habitat: 'land', spd: 16, catch: [], bait: null, sparkle: true },
    pegasus:      { name: 'Pegasus',       habitat: 'land', spd: 30, catch: [], bait: null, sparkle: true },
    centaur:      { name: 'Centaur',       habitat: 'land', spd: 24, catch: [], bait: null },
    griffin:      { name: 'Griffin',       habitat: 'land', spd: 28, catch: [], bait: null },
    mermaid:      { name: 'Mermaid',       habitat: 'water', sea: true, spd: 10, catch: [], bait: null, sparkle: true },
    prismabeast:  { name: 'Prisma-Beast',  habitat: 'land', spd: 20, catch: [], bait: null, sparkle: true },
  });

  // ---- placeholder pixel grids (sheet.mythics overrides later) ----
  const G = {};
  G.rainbowsheep = [
    '...kkkkkk.......',
    '..k123456k.kkk..',
    '.k12345612kXXXk.',
    '.k23456123XXeXk.',
    '.k34561234XXXXk.',
    '.k45612345kXXk..',
    '..k56123456kk...',
    '...kkkkkkkk.....',
    '...kXk..kXk.....',
    '...kkk..kkk.....',
  ];
  G.baalien = [
    '.q...q..........',
    '.kq.qk..........',
    '..kqqk...........',
    '...kkkkkk..kkk..',
    '..kVVVVVVkVAeAk.',
    '.kVVVVVVVVAAAAk.',
    '.kVVVVVVVVkAAk..',
    '..kVVVVVVVkkk...',
    '...kkkkkkkk.....',
    '...kAk..kAk.....',
    '...kkk..kkk.....',
  ];
  G.glittergoat = [
    '..........kk.kk.',
    '..........kGkGk.',
    '....kkkkkkkGGGk.',
    '...kYYYYYYGGeGk.',
    '..kYYYYYYYGGGGk.',
    '..kYYYYYYYkGGbk.',
    '..kYyYYYyYkkkk..',
    '..kYkkkkkYk.....',
    '..kYk...kYk.....',
    '..kkk...kkk.....',
  ];
  G.glimmerram = [
    '..........kkkk..',
    '.........kWWWWk.',
    '....kkkkkWCCWWk.',
    '...kCCCCCWCeCk..',
    '..kCCCCCCWCCCk..',
    '..kCCCCCCCkCk...',
    '..kCcCCCcCkk....',
    '..kCkkkkkCk.....',
    '..kCk...kCk.....',
    '..kkk...kkk.....',
  ];
  G.pegasus = [
    '....kWWk...kk...',
    '...kWWWWk.kMMk..',
    '..kWWWWWWkMHHWk.',
    '...kWWWWHHMHek..',
    '..kHHHHHHHMHk...',
    '..kHHHHHHHHk....',
    '..kHHHHHHHk.....',
    '..kHhHHHhHk.....',
    '..kHkkkkkHk.....',
    '..kHk...kHk.....',
    '..kkk...kkk.....',
  ];
  G.centaur = [
    '...........kkk..',
    '..........kYYYk.',
    '..........kSeSk.',
    '.........kSSSSk.',
    '....kkkkkSSBBk..',
    '...kHHHHHSBBk...',
    '..kHHHHHHHBk....',
    '..kHHHHHHHk.....',
    '..kHhHHHhHk.....',
    '..kHkkkkkHk.....',
    '..kHk...kHk.....',
    '..kkk...kkk.....',
  ];
  G.griffin = [
    '....kWWk...kkk..',
    '...kWWWWk.kWWWk.',
    '..kWWWWWWkWWeWk.',
    '...kWWWWLLWWWOk.',
    '..kLLLLLLLWWk...',
    '..kLLLLLLLLk....',
    '.mkLLLLLLLk.....',
    'kmkLlLLLlLk.....',
    '.m.kLkkkLk......',
    '...kLk.kLk......',
    '...kkk.kkk......',
  ];
  G.mermaid = [
    '.......kkkk.....',
    '......kRRRRk....',
    '......kRSeSRk...',
    '.......kSSSSk...',
    '......kSSSSk....',
    '.....kTTSSTk....',
    '....kTTTTTk.....',
    '..kkTTTTTk......',
    '.kTTTTTTk.......',
    '.kTTkTTTTk......',
    '..kk..kkkk......',
  ];
  G.prismabeast = [
    '..1.2.3.4.5.....',
    '..k1k2k3k4k.....',
    '...kkkkkkkk.kkk.',
    '..kPPPPPPPkPPek.',
    '.kPPPPPPPPPPPPk.',
    '.kPPPPPPPPkPPk..',
    '.wkPPPPPPPkkk...',
    'kwkPpPPPpPk.....',
    '.w.kPkkkPk......',
    '...kPk.kPk......',
    '...kkk.kkk......',
  ];
  const PALS = {
    rainbowsheep: { 1: '#e84a4a', 2: '#f89238', 3: '#f8d048', 4: '#58c452', 5: '#4878e8', 6: '#9a62e0', X: '#f8c896' },
    baalien:      { q: '#58c452', A: '#f8c896' },
    glittergoat:  { Y: '#f8d048', y: '#e8b430', G: '#f0e8d8', b: '#f8c896' },
    glimmerram:   { C: '#d8f0f8', c: '#a8d8ec', W: '#fff' },
    pegasus:      { H: '#f0e8d8', h: '#d0c8b8', M: '#f8d048', W: '#fff' },
    centaur:      { H: '#a8703c', h: '#8a5c2c', S: '#f8c896', B: '#4878e8', Y: '#f8d048' },
    griffin:      { L: '#e8c060', l: '#c89838', m: '#a8642c', W: '#f0e8d8', O: '#f89238' },
    mermaid:      { R: '#e84a4a', S: '#f8c896', T: '#40c0b8' },
    prismabeast:  { P: '#9a62e0', p: '#7a42c0', w: '#f8ec70', 1: '#e84a4a', 2: '#f89238', 3: '#f8d048', 4: '#58c452', 5: '#4878e8' },
  };
  function installRareSprites() {
    const S = Sprites;
    const hasExt = (k) => (typeof EXT_ART !== 'undefined') && EXT_ART['creature.' + k + '.a'];
    for (const k of Object.keys(G)) {
      if (hasExt(k)) continue;                                                           // sheet art incoming: let EXT_DENS size it
      if (S.creatures[k] && S.creatures[k].right && S.creatures[k].right[0]) continue;   // sheet art already in
      const w = Math.max(...G[k].map(r => r.length));
      const g = G[k].map(r => r.padEnd(w, '.'));
      const a = buildSprite(g, PALS[k]), b = buildSprite(hopFrame(g), PALS[k]);
      S.creatures[k] = { right: [a, b], left: [flipH(a), flipH(b)] };
    }
    if (!((typeof EXT_ART !== 'undefined') && EXT_ART['npc.combi'])) S.npcs.combi = S.npcs.combi || buildSprite(NPC_GRIDS.trader, { V: '#40c0b8', v: '#2c8880' });
  }
  const _bas = buildAllSprites;
  buildAllSprites = function () { _bas(); installRareSprites(); };
  if (typeof Sprites !== 'undefined' && Sprites.creatures) installRareSprites();

  // ---- recipes, tiered by adventure progress ----
  const RECIPES = [
    { id: 'rainbowsheep', name: 'RAINBOW SHEEP', parts: { sheep: 6 }, gate: null,
      flavor: 'Six sheep hold hooves — a rainbow blooms!' },
    { id: 'baalien', name: 'BAA-LIEN', parts: { alien: 1, sheep: 3 }, gate: null,
      flavor: 'The cutest antennas in the galaxy.' },
    { id: 'glittergoat', name: 'GLITTER GOAT', parts: { goat: 4, ibex: 2 }, gate: 'sc_cog1',
      hint: 'Win a STAR-CELL in Cogwerk City first!', flavor: 'Mountain-shine on golden hooves.' },
    { id: 'glimmerram', name: 'GLIMMER RAM', parts: { ram: 4, snowhare: 2 }, gate: 'sc_cog1',
      hint: 'Win a STAR-CELL in Cogwerk City first!', flavor: 'Frost-curled horns that never melt.' },
    { id: 'capricorn', name: 'CAPRICORN', parts: { ram: 2, shark: 1 }, gate: 'sc_cog1',
      hint: 'Win a STAR-CELL in Cogwerk City first!', flavor: 'A ram up top, a fish below — SEA-GOAT!' },
    { id: 'pegasus', name: 'PEGASUS', parts: { horse: 1, condor: 2 }, gate: 'sc_lady',
      hint: 'Win the SECOND star-cell first!', flavor: 'A horse takes the sky!' },
    { id: 'centaur', name: 'CENTAUR', parts: { horse: 1, ibex: 2 }, gate: 'sc_lady',
      hint: 'Win the SECOND star-cell first!', flavor: 'Half gallop, half wisdom.' },
    { id: 'griffin', name: 'GRIFFIN', parts: { lion: 1, condor: 2 }, gate: 'gnashara',
      hint: 'Best the ALL-BEAST first!', flavor: 'Lion heart, eagle wings — king of both.' },
    { id: 'mermaid', name: 'MERMAID', parts: { shark: 1, jellyfish: 2, crab: 2 }, gate: 'gnashara',
      hint: 'Best the ALL-BEAST first!', flavor: 'A song from the Deep Blue.' },
    { id: 'prismabeast', name: 'PRISMA-BEAST', parts: { dragon: 1, unicorn: 1, rainbowsheep: 1, glittergoat: 1, glimmerram: 1 }, gate: 'colossus',
      hint: 'Topple the STORM COLOSSUS first!', flavor: 'The rarest friend in ANY world.' },
  ];
  Game.RECIPES = RECIPES;

  const gateOk = (g) => !g || (g.startsWith('sc_') ? !!(Game.flags.starcells && Game.flags.starcells[g]) : !!Game.flags[g]);
  const partsLine = (r) => Object.entries(r.parts)
    .map(([sp, n]) => n + ' ' + (CREATURES[sp] ? CREATURES[sp].name : sp) + ' (' + Math.min(Game.log[sp] || 0, n) + '/' + n + ')')
    .join(' + ');
  const craftable = (r) => Object.entries(r.parts).every(([sp, n]) => (Game.log[sp] || 0) >= n);

  Game.combineStock = function () {
    // every recipe is visible from day one — the hunt for ingredients IS the gate
    return RECIPES.map((r) => {
      const done = (this.log[r.id] || 0) > 0;
      return { rid: r.id, label: r.name + (done ? ' (made!)' : ''), special: craftable(r),
        desc: 'JOIN: ' + partsLine(r) };
    });
  };
  Game.openCombiner = function () {
    this.menu = { type: 'combine', who: 'combi', sel: 0, items: this.combineStock() };
    this.state = 'menu'; Audio2.jingle('talk');
  };
  Game.combineSelected = function () {
    const m = this.menu, it = m.items[m.sel];
    if (!it) return;
    const r = RECIPES.find((x) => x.id === it.rid);
    for (const [sp, n] of Object.entries(r.parts)) {
      const have = this.log[sp] || 0;
      if (have < n) {
        Audio2.jingle('denied');
        this.toast('Needs ' + (n - have) + ' more ' + (CREATURES[sp] ? CREATURES[sp].name : sp) + '! (Granny keeps them safe till then.)');
        return;
      }
    }
    for (const [sp, n] of Object.entries(r.parts)) {
      this.log[sp] = Math.max(0, (this.log[sp] || 0) - n);
      this.flags['life_' + sp] = Math.max(0, (this.flags['life_' + sp] || 0) - n);
    }
    this.log[r.id] = (this.log[r.id] || 0) + 1;
    this.flags['life_' + r.id] = (this.flags['life_' + r.id] || 0) + 1;
    // the full new-treasure fanfare — a brand-new FRIEND deserves it
    this.itemGet('creature:' + r.id, r.name + '!', r.flavor + ' Meet them in the Workshop pens!');
    if (this.map && this.map.id === 'workshop') {
      for (const o of this.map.objects) if (o.type === 'combiner') { Particles.burst(o.x * TILE + 8, o.y * TILE, 'confetti'); o.craftT = 1.6; }
      this.creatures = this.creatures.filter((c) => !c.display);
      this.populateZoo(this.map);                       // pens refresh on the spot
    }
    m.items = this.combineStock(); m.sel = Math.min(m.sel, m.items.length - 1);
    saveGame();
  };

  // ---- the machine ----
  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.combiner = function (c, o, ox, oy) {
    const t = Game.time, hot = (o.craftT = Math.max(0, (o.craftT || 0) - 1 / 60)) > 0;
    const art = Sprites.props && Sprites.props.combinermachine;
    if (art) {
      if (hot) { c.fillStyle = 'rgba(248,236,112,.35)'; c.beginPath(); c.ellipse(ox, oy - 14, 30, 22, 0, 0, 7); c.fill(); }
      dspr(c, art, ox - sprW(art) / 2, oy + 8 - sprH(art));
      drawText(c, 'THE COMBINER', ox, oy + 10, 5, '#f8d048', '#241a33', 'center');
      return;
    }
    // twin glass pods
    for (const sx of [-14, 14]) {
      c.fillStyle = '#241a33'; c.fillRect(ox + sx - 6, oy - 22, 12, 24);
      c.fillStyle = hot ? '#f8ec70' : '#9adcf8'; c.fillRect(ox + sx - 5, oy - 21, 10, 18);
      c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(ox + sx - 4, oy - 20, 2, 16);
      c.fillStyle = '#8a94a8'; c.fillRect(ox + sx - 6, oy - 4, 12, 6);
      // bubbles
      c.fillStyle = '#fff';
      c.fillRect(ox + sx - 1, oy - 8 - ((t * 14 + sx) % 12), 1, 1);
      c.fillRect(ox + sx + 2, oy - 6 - ((t * 10 + sx * 2) % 10), 1, 1);
    }
    // central mixer
    c.fillStyle = '#241a33'; c.fillRect(ox - 8, oy - 16, 16, 18);
    c.fillStyle = '#c8743c'; c.fillRect(ox - 7, oy - 15, 14, 16);
    c.fillStyle = '#e8c060'; c.fillRect(ox - 7, oy - 15, 14, 3);
    c.fillStyle = '#241a33'; c.beginPath(); c.arc(ox, oy - 7, 4.5, 0, 7); c.fill();
    c.fillStyle = hot ? '#f8ec70' : '#40c0b8'; c.beginPath(); c.arc(ox, oy - 7, 3.2, 0, 7); c.fill();
    c.save(); c.translate(ox, oy - 7); c.rotate(t * (hot ? 9 : 2));
    c.strokeStyle = '#241a33'; c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.moveTo(0, -3); c.lineTo(0, 3); c.stroke();
    c.restore();
    // pipes to pods
    c.strokeStyle = '#54585f'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(ox - 8, oy - 12); c.lineTo(ox - 14, oy - 12); c.moveTo(ox + 8, oy - 12); c.lineTo(ox + 14, oy - 12); c.stroke();
    c.lineWidth = 1;
    if (hot) { c.fillStyle = 'rgba(248,236,112,.3)'; c.beginPath(); c.ellipse(ox, oy - 12, 26, 18, 0, 0, 7); c.fill(); }
    drawText(c, 'THE COMBINER', ox, oy + 4, 5, '#f8d048', '#241a33', 'center');
  };
})();
