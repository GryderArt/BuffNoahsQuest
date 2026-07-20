"use strict";
// ===================== CRAFTING MATERIALS (scattered across the whole game) =====================
// Play-item decorations now cost 10x coins AND a found MATERIAL — a pearl for the mermaid
// lamp, a tire for the swing, a spring for the ball, etc. Materials are walk-over pickups
// (or chest loot) tucked into thematic corners of many maps, so decorating means EXPLORING.
// A material's flag lives in flags.mats (spendable count) + flags.matsFound (per-pickup guard,
// so the same world pickup is only grabbed once). The rarest, SKYFEATHER, waits atop the Ascent.
(function () {
  if (typeof Game === 'undefined') return;

  const MAT_NAMES = {
    pearl: 'PEARL', tire: 'TIRE', spring: 'SPRING', seedbag: 'SEED BAG',
    marble: 'MARBLE', bucket: 'BUCKET', skyfeather: 'SKY-FEATHER',
    goldnugget: 'GOLD NUGGET', crystalshard: 'CRYSTAL SHARD', voidgem: 'VOID GEM',
  };
  const MAT_BLURB = {
    pearl:  'A glowing PEARL from the deep — perfect for a lamp.',
    tire:   'A sturdy rubber TIRE — a swing waiting to happen!',
    spring: 'A bouncy metal SPRING — boing!',
    seedbag: 'A pouch of flower SEEDS — plant a garden!',
    marble: 'A chunk of polished MARBLE — fit for a fountain.',
    bucket: 'A little wooden BUCKET — hold water in it!',
    skyfeather: 'A shimmering SKY-FEATHER from the very top of the world!',
    goldnugget: 'A heavy GOLD NUGGET from a hidden dungeon vault!',
    crystalshard: 'A humming CRYSTAL SHARD, pried from a secret cave!',
    voidgem: 'A starry VOID GEM that fell between worlds!',
  };
  Game.MAT_NAMES = MAT_NAMES;

  const F = () => Game.flags;
  Game.hasMat = function (m, n) { return (this.flags.mats[m] || 0) >= (n || 1); };

  // the treasure-fanfare a NEW kind of material earns (later grabs just toast)
  Game.collectMaterialFanfare = function (mat) {
    const first = !this.flags['gotmat_' + mat];
    this.flags['gotmat_' + mat] = true;
    if (first) this.itemGet('item:' + mat, MAT_NAMES[mat] + ' FOUND!', (MAT_BLURB[mat] || '') + ' (Craft PLAY ITEMS at COMBI\'s DECOR CATALOG.)');
    else { Audio2.jingle('gem'); this.toast('Found a ' + MAT_NAMES[mat] + '! (' + (this.flags.mats[mat] || 0) + ' total)'); }
  };

  Game.collectMaterial = function (o) {
    if (this.flags.matsFound[o.id]) return false;
    this.flags.matsFound[o.id] = true;
    this.flags.mats[o.mat] = (this.flags.mats[o.mat] || 0) + 1;
    Particles.burst(o.x * TILE + 8, o.y * TILE, 'sparkle');
    this.collectMaterialFanfare(o.mat);
    saveGame();
    return true;
  };

  // walk-over pickup (chained onto autoPickups) + SPACE/adjacency pickup
  {
    const _ap = Game.autoPickups;
    Game.autoPickups = function () {
      _ap.call(this);
      const m = this.map; if (!m) return;
      for (const o of m.objects) {
        if (o.type === 'material' && !this.flags.matsFound[o.id] &&
            dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 14) this.collectMaterial(o);
      }
    };
  }

  // ---- the floating pickup art (mirrors the shard drawer) ----
  Game.OBJDRAW = Game.OBJDRAW || {};
  Game.OBJDRAW.material = function (c, o, ox, oy, e) {
    if (Game.flags.matsFound[o.id]) return;                       // already grabbed: gone
    const spr = Sprites.items[o.mat]; if (!spr) return;
    const oy2 = oy - (e || 0);                                    // lift with elevated terrain (e = elev*EOFF)
    const t = Game.time, bob = Math.sin(t * 2.4 + o.x) * 2;
    // a soft glow so it reads as a treasure across a big map
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(248,236,140,' + (0.16 + 0.08 * Math.sin(t * 3 + o.y)).toFixed(2) + ')';
    c.beginPath(); c.arc(ox + 8, oy2 + 6 + bob, 10, 0, 7); c.fill(); c.restore();
    const sc = 1.5, w = sprW(spr), h = sprH(spr);
    c.save(); c.translate(ox + 8, oy2 + 8 + bob); c.scale(sc, sc); dspr(c, spr, -w / 2, -h / 2); c.restore();
    if ((t * 2 | 0) % 3 === 0) { c.fillStyle = '#fff'; c.fillRect(ox + 2 + ((t * 31 | 0) % 12), oy2 - 2 + bob, 1, 1); }
    if (dist(Player.x, Player.y, ox + 8, oy + 8) < 30) drawText(c, MAT_NAMES[o.mat], ox + 8, oy2 - 12, 6, '#f8e858', '#241a33', 'center');
  };

  // ---- SCATTER: place each material in a thematic, exploration-gated spot ----
  // one findable pickup of each craftable material (skyfeather is placed by the Ascent).
  const SCATTER = [
    // [mapId, x, y, mat]  — chosen to sit on reachable floor, tucked a bit off the main path
    ['stable',  18, 24, 'spring'],     // the royal stableworks — a coil on the floor
    ['coghall',  3, 11, 'tire'],       // the Cog Hall (museum) — a spare tire by the pests
    ['coast',    6, 20, 'bucket'],     // Sunsplash Coast — a pail on the sand
    ['grannyzoo',13, 14, 'seedbag'],   // Granny's menagerie — seeds by the pens
    ['wastes',   6, 6,  'marble'],     // Starfall Wastes — a marble shard among the stars
    ['aquarium', 6, 22, 'pearl'],      // Combi's Aquarium — a pearl on the seabed
  ];
  Game.scatterMaterials = function () {
    if (this._matsScattered) return; this._matsScattered = true;
    for (const [mid, x, y, mat] of SCATTER) {
      const m = MAPS[mid]; if (!m) continue;
      if (m.objects.some(o => o.type === 'material' && o.mat === mat)) continue;
      OBJ(m, { type: 'material', mat, x, y, id: 'mat_' + mat + '_' + mid });
    }
  };
})();
