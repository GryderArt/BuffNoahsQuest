"use strict";
// ================= Game state, quests, capture, economy, dialog =================
const Game = {
  state: 'title', map: null, mapId: 'vale', creatures: [], flyingNets: [],
  flags: { coins: 0, gems: 0, keys: 0, bosskeys: 0, heartpieces: 0,
    net: false, cage: false, harpoon: false, bone: false, bracers: false,
    sandals: false, gloves: false, suit: false, wings: false,
    billy: false, coastPath: false, twinkle: false, crown: false,
    cerberus: false, sahor: false, ramsi: false, keepOpen: false, zibbleStage: 0,
    ramsuit: false, world2: false, ramHead: false, ramStun: false, ramShield: false, parents: false,
    ramGlow: false, ramShrink: false, ramBounce: false, ramGlide: false, ramDecoy: false, ramRoll: false, ramPound: false,
    underburrow: false, pillowkin: 0, mottle: false, thornback: false, geode: false, grub: false,
    g_mottle: false, g_thornback: false, g_geode: false, g_grub: false, gnash: false,
    sheepGiven: 0, mimiphotos: {}, baits: { clover: 0, tincan: 0, fishsnack: 0, cookie: 0, berry: 0, hay: 0 },
    shards: {}, berries: {}, starcells: {}, openedChests: {}, openedDoors: {}, switchFlags: {},
    mats: { pearl: 0, tire: 0, spring: 0, seedbag: 0, marble: 0, bucket: 0, skyfeather: 0, goldnugget: 0, crystalshard: 0, voidgem: 0 }, matsFound: {},
    upg_lunge: 0, upg_net: 0, upg_jump: 0, upg_speed: 0, upg_harpoon: 0 },
  log: {},               // species -> caught count (living herd / trade inventory)
  time: 0, banners: [], toasts: [], dialog: null, menu: null, boss: null,
  worldCursor: 0, world3Cursor: 0, winT: 0, lastDoorMsg: 0, worldTravel: null,
  worldHere() { return Math.max(0, WORLD_NODES.findIndex(n => n.id === ((this.map && this.map.zone) || 'vale'))); },
  world3Here() { const id = this.map && this.map.id; const i = WORLD3_NODES.findIndex(n => n.id === id); return i < 0 ? 0 : i; },
  startWorldTravel(targetIdx) {
    const here = this.worldHere();
    if (targetIdx === here) { this.state = 'play'; this.loadMap(WORLD_NODES[targetIdx].id); saveGame(); return; }
    const stepDir = targetIdx > here ? 1 : -1;
    let pts = []; let first = true; const legs = [];
    for (let i = here; i !== targetIdx; i += stepDir) {
      const a = [nodeX(WORLD_NODES[i]), nodeY(WORLD_NODES[i])];
      const b = [nodeX(WORLD_NODES[i + stepDir]), nodeY(WORLD_NODES[i + stepDir])];
      let curve = catmullRom([a, ...segPoints(i, i + stepDir), b], 14);
      if (curve.length < 8) {        // straight leg: densify so the midpoint exists
        const c2 = [];
        for (let s2 = 0; s2 <= 12; s2++) c2.push([lerp(a[0], b[0], s2 / 12), lerp(a[1], b[1], s2 / 12)]);
        curve = c2;
      }
      const startSeg = pts.length ? pts.length - 1 : 0;
      for (let k = first ? 0 : 1; k < curve.length; k++) pts.push(curve[k]);
      first = false;
      legs.push({ key: Math.min(i, i + stepDir) + '-' + Math.max(i, i + stepDir), startSeg, endSeg: pts.length - 1 });
    }
    if (!pts.length) pts = [[nodeX(WORLD_NODES[here]), nodeY(WORLD_NODES[here])]];
    this.worldTravel = { pts, seg: 0, x: pts[0][0], y: pts[0][1], target: WORLD_NODES[targetIdx].id, anim: 0, dir: 'down', legs };
    Audio2.jingle('step');
  },
  updateWorldTravel(dt) {
    const tv = this.worldTravel; if (!tv) return;
    tv.anim += dt;
    const next = tv.pts[tv.seg + 1];
    if (!next) {
      const id = tv.target; this.worldTravel = null;
      this.state = 'play'; this.loadMap(id); saveGame(); return;
    }
    const d = dist(tv.x, tv.y, next[0], next[1]);
    const spd = 95 * dt;
    if (d <= spd) {
      tv.x = next[0]; tv.y = next[1]; tv.seg++;
      // TROUBLE ON THE ROAD: halfway along each leg, an ambush (once per route)
      for (const leg of tv.legs || []) {
        const mid = (leg.startSeg + leg.endSeg) >> 1;
        const road = ROAD_ROUTES[leg.key];
        if (road && tv.seg === mid && !this.flags['road_' + road]) {
          this.pendingTravel = tv; this.worldTravel = null;
          SideScroll.start(road, true);
          return;
        }
      }
    }
    else {
      tv.x += (next[0] - tv.x) / d * spd; tv.y += (next[1] - tv.y) / d * spd;
      tv.dir = Math.abs(next[0] - tv.x) > Math.abs(next[1] - tv.y) ? (next[0] > tv.x ? 'right' : 'left') : (next[1] > tv.y ? 'down' : 'up');
    }
  },

  totalCaught() { let n = 0; for (const k in this.log) n += this.log[k]; return n; },
  seaCount() { let n = 0; for (const s of SEA_SPECIES) n += (this.flags['life_' + s] || 0); return n; },
  mountainCount() { return (this.flags.life_goat || 0) + (this.flags.life_ram || 0); },
  shardCount() { let n = 0; for (const k in this.flags.shards) if (this.flags.shards[k]) n++; return n; },
  starcellCount() { let n = 0; for (const k in this.flags.starcells) if (this.flags.starcells[k]) n++; return n; },
  cityPestsLeft() { return this.creatures.filter(c => CREATURES[c.species] && CREATURES[c.species].pest && c.state !== 'gone').length; },

  // ---------- map load / warp ----------
  applyPuzzle(m, pz) {
    for (const [ti, tj] of pz.tiles || []) m.tiles[tj][ti] = pz.to;
  },
  loadMap(id, tx, ty) {
    const m = MAPS[id]; this.map = m; this.mapId = id;
    if (m.asteroids) for (const a of m.asteroids) { a.t = 0; a.x = a.ax0; a.y = a.ay0; }
    if (m.puzzle) for (const pz of m.puzzle) if (this.flags.switchFlags[pz.flag]) this.applyPuzzle(m, pz);
    this.creatures = []; this.flyingNets = []; Player.harpoon = null; Player.bone = null;
    this._retroShot = {};   // album re-shoot: at most one attempt per moment per map visit (no glitter spew)
    for (const s of m.spawns) {
      for (let k = 0; k < s.n; k++) {
        const r = sRandom(k * 131 + s.x * 17 + s.y);
        let ci, cj, tries = 0;
        do { ci = s.x + (r() * s.w | 0); cj = s.y + (r() * s.h | 0); tries++; }
        while (tries < 30 && !creatureWalkable(m, { species: s.species }, ci, cj));
        this.creatures.push(makeCreature(s.species, ci, cj, s));
      }
    }
    if (this.populateZoo) this.populateZoo(m);   // GRANNY'S MENAGERIE: fill pens from inventory
    this.revealOpenedDoors(m, true);   // doors opened on a past visit already show open
    if (m.onLoad) m.onLoad(this, m);   // per-map dynamic spawns (e.g. Cogwerk sentinels)
    // clean transient objects
    m.objects = m.objects.filter(o => o.type !== 'cageSet');
    m.gateOpen = this.seaCount() >= 8;
    this.boss = null;
    for (const o of m.objects) if (o.type === 'boss' && (o.gauntlet ? !this.flags['g_' + o.boss] : !this.flags[o.flag || o.boss])) Bosses.spawn(o.boss, o.x, o.y, { gauntlet: o.gauntlet, flag: o.flag });
    Player.reset(tx !== undefined ? tx : m.start.x, ty !== undefined ? ty : m.start.y);
    Player.unstick(m); Player.lastSafe = [Player.x, Player.y];
    Audio2.playSong(this.boss ? 'boss' : m.song);
    if (m.dungeon) this.toast('~ ' + m.name + ' ~');
    this.zoneAmb = m.underwater ? 'deep' : (m.zone === 'vale' ? 'vale' : m.zone === 'coast' ? 'coast' : m.zone === 'wastes' ? 'wastes' : 'canyon');
    if (id === 'burrow5' && !this.flags.underburrow && this.UNDERBURROW_INTRO && this.startCutscene) {
      this.flags.underburrow = true;
      this.startCutscene(this.UNDERBURROW_INTRO, () => { this.state = 'play'; saveGame(); });
    }
    // AUTO-INTRO: first visit to a World-3 level -> queue the guide's first line (or first sign)
    if (m.zone === 'city' && this.flags && !this.flags['intro_' + id] && m.objects.some(o => o.type === 'npc' || o.type === 'sign')) this._pendingIntro = id;
  },
  respawn() { Player.hearts = Player.maxHearts; this.loadMap(this.mapId); },

  // ---------- doors ----------
  doorIsOpen(map, ti, tj) {
    const d = map.doors[ti + ',' + tj]; if (!d) return true;
    if (this.flags.openedDoors[d.id]) return true;
    if (d.kind === 'flag') return d.req ? !!this.lookupFlag(d.req) : true;
    return false;
  },
  // ---- when a switch OPENS an in-level gate, the blocking tile VISIBLY vanishes ----
  // (so bone-boomerang / block-on-switch / Ramsi-headbutt all produce an obvious result).
  // Map-transition doors (those with a LINK) are left alone — you still walk INTO those.
  _openTileFor(map, ti, tj) {
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const row = map.tiles[tj + dy]; const id = row && row[ti + dx]; if (!id) continue;
      const d = TILEDEFS[id] || {};
      if (!d.solid && !d.door && !d.gate && !d.hole && !d.rift) return id;   // copy the corridor floor it opens onto
    }
    return map.zone === 'sky' ? 'skyfloor' : map.zone === 'city' ? 'cogfloor' : map.zone === 'burrow' ? 'dirt' : (map.dungeon ? 'floor' : 'grass');
  },
  revealOpenedDoors(map, silent) {
    map = map || this.map; if (!map) return; let changed = false;
    // flag-gated DOOR tiles that are now open -> melt to floor with a puff
    for (const key in (map.doors || {})) {
      const d = map.doors[key]; if (d.kind !== 'flag') continue;
      const p = key.split(',').map(Number), ti = p[0], tj = p[1];
      if (!((TILEDEFS[map.tiles[tj][ti]] || {}).door)) continue;                 // already opened / not a door tile
      if (map.links && map.links.some(L => L.x === ti && L.y === tj)) continue;   // a map-portal door — keep it
      if (!this.doorIsOpen(map, ti, tj)) continue;                               // still locked
      map.tiles[tj][ti] = this._openTileFor(map, ti, tj); changed = true;
      if (!silent) { Particles.burst(ti * TILE + 8, tj * TILE + 8, 'dust'); Particles.burst(ti * TILE + 8, tj * TILE + 8, 'sparkle'); }
    }
    // apply any SATISFIED puzzle tile-swaps that a bone/ram switch triggered (block-on-switch already does this live)
    if (map.puzzle) for (const pz of map.puzzle) if (this.lookupFlag(pz.flag)) for (const t of (pz.tiles || [])) {
      if (map.tiles[t[1]][t[0]] !== pz.to) { map.tiles[t[1]][t[0]] = pz.to; changed = true; if (!silent) { Particles.burst(t[0] * TILE + 8, t[1] * TILE + 8, 'dust'); Particles.burst(t[0] * TILE + 8, t[1] * TILE + 8, 'sparkle'); } }
    }
    if (changed && !silent) Audio2.jingle('door');
  },
  lookupFlag(req) {
    if (req === 'tools5') return !!(this.flags.net && this.flags.cage && this.flags.harpoon && this.flags.bone);
    if (req === 'keepOpen') return this.flags.keepOpen;
    if (req.startsWith('sw_')) return this.flags.switchFlags[req];
    if (req.startsWith('sc_')) return !!(this.flags.starcells && this.flags.starcells[req]);
    return this.flags[req];
  },
  tryDoor(map, ti, tj) {
    const d = map.doors[ti + ',' + tj]; if (!d || this.doorIsOpen(map, ti, tj)) return;
    if (this.time - this.lastDoorMsg < 1.2) return;
    this.lastDoorMsg = this.time;
    if (d.kind === 'lock') {
      if (this.flags.keys > 0) { this.flags.keys--; this.flags.openedDoors[d.id] = true; Audio2.jingle('door'); this.toast('The little key fits! Click!'); }
      else this.toast('Locked tight. You need a LITTLE KEY.');
    } else if (d.kind === 'boss') {
      if (this.flags.bosskeys > 0) { this.flags.bosskeys--; this.flags.openedDoors[d.id] = true; Audio2.jingle('door'); this.banner('The BOSS DOOR rumbles open!'); }
      else this.toast('The BOSS DOOR needs the BIG KEY!');
    } else if (d.kind === 'bone') { if (d.msg) this.toast(d.msg); }
    else if (d.kind === 'flag' && d.msg) this.toast(d.msg);
  },

  // ---------- capture ----------
  checkToolCatch(method, x, y, radius) {
    for (const c of this.creatures) {
      if (c.display) continue;   // zoo exhibit: look, don't catch
      if (c.state === 'gone' || c.state === 'trapped') continue;
      if (dist(x, y, c.x, c.y) > radius) continue;
      const def = CREATURES[c.species];
      let ok = def.catch.includes(method);
      if (!ok && c.stun > 0 && (method === 'mitts' || method === 'net')) {
        if (def.stunThen) ok = (method === def.stunThen);
        else if (def.catch.includes('stun')) ok = true;
      }
      if (def.stunThen && c.stun <= 0) ok = false;
      if (ok) { this.capture(c, method); return true; }
      else if (method !== 'harpoon') {
        if (def.sting && c.stun <= 0) { Player.hurt(Math.max(1, Math.round(def.sting * 2 * (this.map.feral || 1)))); }
        else if (def.feisty && method === 'mitts') this.toast('Too feisty for mitts! Try the NET or a clover CAGE.');
      }
    }
    return false;
  },
  capture(c, method) {
    // BLAZAGON CHASE: each net hit makes him BOLT to a new tower; only the LAST roof truly catches him
    if (c.species === 'blazagon' && (c._chase || 0) < (c._chaseMax || 0)) {
      if (c._leap) return;                                          // mid-leap — can't be netted in the air
      c._chase = (c._chase || 0) + 1;
      const sp = (this.map._chaseSpots || [])[c._chase], bx = (this.map._chaseBoxes || [])[c._chase];
      if (sp) { c._leap = { x0: c.x, y0: c.y, x1: sp[0] * TILE + 8, y1: sp[1] * TILE + 12, t: 0, dur: 0.9, hop: 28, box: bx }; c.state = 'leaping'; c.stun = 0; }
      Audio2.jingle('cage'); Particles.burst(c.x, c.y - 8, 'sparkle'); Particles.burst(c.x, c.y - 8, 'dust');
      this.banner('BLAZAGON breaks free, RUNS and LEAPS to a far tower! (' + c._chase + '/' + c._chaseMax + ') — chase him to the LAST roof!');
      return;
    }
    c.state = 'gone';
    this.log[c.species] = (this.log[c.species] || 0) + 1;
    this.flags['life_' + c.species] = (this.flags['life_' + c.species] || 0) + 1;
    const e = elevAt(this.map, (c.x / TILE) | 0, (c.y / TILE) | 0);
    Particles.burst(c.x, c.y - 8 - e * EOFF, 'confetti');
    Audio2.jingle('capture');
    this.flags.coins += 2;
    this.banner(CREATURES[c.species].name + ' befriended! (+2 coins)');
    this.onCaptureQuests(c.species);
    saveGame();
  },
  onTrapped(c, cage) {
    Audio2.jingle('cage');
    this.flags.baits[cage.bait] = this.flags.baits[cage.bait]; // bait already consumed on placement
    c.trapTimer = 0.9;
    c.heartT = 1.2;                                            // a happy HEART pops up: "you fed me!"
    Particles.burst(c.x, c.y - 10, 'sparkle');
  },
  onCaptureQuests(species) {
    const F = this.flags;
    // World 3: clearing every haywire critter un-jams the Clocktower
    if (this.map && this.map.zone === 'city' && !F.cog_cleared && this.cityPestsLeft() === 0) {
      F.cog_cleared = true; Audio2.jingle('door');
      this.banner('THE CITY IS CLEAR! Every haywire critter is caught — return to the SUPREME TRADER for the MASTER-GEAR!'); saveGame();
    }
    // tide gate live check
    if (this.map && this.map.id === 'deep' && !this.map.gateOpen && this.seaCount() >= 8) {
      this.map.gateOpen = true; Audio2.jingle('door'); this.banner('THE TIDE GATE PARTS! The way east is open!');
    }
    if (this.map && this.map.id === 'school') {
      const n = F.life_starpupil || 0;
      if (n < 3) this.toast('Star pupil rounded up! (' + n + '/3)');
    }
    // THE HIGH ROOFS: netting mighty BLAZAGON is the prize — it yields a STAR-CELL
    if (species === 'blazagon' && !(F.starcells && F.starcells['sc_cog3'])) {
      Audio2.jingle('bosswin'); this.toast('BLAZAGON CAUGHT — the fiery roof-dragon is yours!');
      this.collectStarcell({ id: 'sc_cog3' });
    }
  },
  giveLoot(loot) {
    const F = this.flags;
    if (loot.mat) { F.mats[loot.mat] = (F.mats[loot.mat] || 0) + 1; if (this.collectMaterialFanfare) this.collectMaterialFanfare(loot.mat); else Audio2.jingle('gem'); }
    if (loot.coins) { F.coins += loot.coins; Audio2.jingle('coin'); this.toast('+' + loot.coins + ' coins!'); }
    if (loot.gems) { F.gems += loot.gems; Audio2.jingle('gem'); this.toast('+' + loot.gems + ' gems!'); }
    if (loot.key) { F.keys += loot.key; Audio2.jingle('key'); this.banner('You found a LITTLE KEY!'); }
    if (loot.bosskey) { F.bosskeys += 1; Audio2.jingle('gear'); this.banner('You found the BIG BOSS KEY!'); }
    if (loot.heartpiece) {
      F.heartpieces++; Audio2.jingle('heart');
      if (F.heartpieces >= 4) { F.heartpieces -= 4; Player.maxHearts += 2; Player.hearts = Player.maxHearts; this.banner('4 pieces — a whole new HEART CONTAINER!'); }
      else this.banner('A piece of heart! (' + F.heartpieces + '/4)');
    }
    if (loot.heartC) { Player.maxHearts += 2; Player.hearts = Player.maxHearts; Audio2.jingle('heart'); this.banner('A HEART CONTAINER! Noah feels buffer than ever!'); }
    if (loot.tool === 'harpoon') { F.harpoon = true; this.itemGet('tool:harpoon', 'THE HARPOON!', 'Z fires it: reel in swimmers, hook golden posts — zip across anything!'); }
    if (loot.item === 'bracers') { F.bracers = true; this.itemGet('gear:bracer', 'POWER BRACERS!', 'Hold SPACE to GRAB a block, then PUSH or PULL it with the arrows!'); }
    if (loot.item === 'crown') { F.crown = true; this.itemGet('item:crown', 'THE SUNKEN CROWN!', 'Starfall Wastes unlocked — press ESC to travel!'); }
    if (loot.item === 'ramsuit') { F.ramsuit = true; this.itemGet('gear:bracer', 'THE RAM SUIT!', 'LUNGE (Z) into a CRACKED wall to smash through — some hide secrets!'); }
    saveGame();
  },

  // ---------- item-get celebration (zoomed item + fanfare) ----------
  itemGet(iconKey, title, sub) {
    this.menu = null; this.dialogQueued = this.dialog; this.dialog = null;
    this.itemGetData = { iconKey, title, sub, t: 0 };
    this.state = 'itemget';
    Audio2.jingle('fanfare');
    Particles.burst(Player.x, Player.y - 12 - Player.elev * EOFF, 'confetti');
  },
  itemIcon(iconKey) {
    const [kind, name] = iconKey.split(':');
    if (kind === 'creature') { const cr = Sprites.creatures[name]; return cr && cr.right && cr.right[0]; }
    return kind === 'tool' ? Sprites.tools[name] : kind === 'gear' ? Sprites.gear[name] : Sprites.items[name];
  },
  // ---------- RAM SUIT: smash a cracked wall ----------
  smashCrack(map, ti, tj) {
    if (!((TILEDEFS[tileAt(map, ti, tj)] || {}).crack)) return;
    map.tiles[tj][ti] = map.zone === 'sky' ? 'skyfloor' : map.zone === 'city' ? 'cogfloor' : (map.dungeon ? 'floor' : 'grass');
    Audio2.jingle('rumble');
    Particles.burst(ti * TILE + 8, tj * TILE + 8, 'dust'); Particles.burst(ti * TILE + 8, tj * TILE + 8, 'sparkle');
    if (map.zone === 'city' && this.onCitySmash) this.onCitySmash(map);
    saveGame();
  },
  // ---------- collectibles (walk-over OR SPACE) ----------
  collectShard(o) {
    if (this.flags.shards[o.id]) return false;
    this.flags.shards[o.id] = true; Audio2.jingle('gem');
    this.banner('STAR SHARD recovered! (' + this.shardCount() + '/3)'); saveGame(); return true;
  },
  collectStarcell(o) {
    if (this.flags.starcells[o.id]) return false;
    this.flags.starcells[o.id] = true; Audio2.jingle('gem'); Particles.burst(Player.x, Player.y - 10, 'confetti');
    const n = this.starcellCount();
    this.banner('STAR-CELL recovered! (' + n + '/4)'); saveGame();
    if (this.startCutscene && this.STAR_CUTSCENE) this.startCutscene(this.STAR_CUTSCENE(n, ({ sc_lady: 'lady', sc_cog3: 'blazagon', sc_cog1: 'trader' })[o.id]), null);   // celebration w/ the level character
    return true;
  },
  collectBerry(o) {
    if (this.flags.berries[o.id]) return false;
    const first = !Object.keys(this.flags.berries).length;
    this.flags.berries[o.id] = true; this.flags.baits.berry++; Audio2.jingle('gem');
    if (first) this.itemGet('item:berry', 'A RAINBOW BERRY!', 'Every color at once! The one bait MIMI SAHOR cannot resist...');
    else this.banner('Another RAINBOW BERRY!');
    saveGame(); return true;
  },
  autoPickups() {
    const m = this.map; if (!m) return;
    for (const o of m.objects) {
      if (o.type === 'shard') { if (!this.flags.shards[o.id] && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 13) this.collectShard(o); }
      else if (o.type === 'berry') { if (!this.flags.berries[o.id] && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 13) this.collectBerry(o); }
      else if (o.type === 'starcell') { if (!this.flags.starcells[o.id] && dist(Player.x, Player.y, o.x * TILE + 8, o.y * TILE + 8) < 14) this.collectStarcell(o); }
    }
  },
  // ---------- the BOOMER-BONE interacts with the world at range ----------
  boneInteract(b) {
    const m = this.map; if (!m) return;
    const bi = (b.x / TILE) | 0, bj = (b.y / TILE) | 0;
    const dr = m.doors[bi + ',' + bj];
    if (dr && dr.kind === 'bone' && !this.flags.openedDoors[dr.id]) {
      this.flags.openedDoors[dr.id] = true; Audio2.jingle('door');
      this.banner('CLACK! The boomer-bone knocks the BONE-LATCH open!'); saveGame();
    }
    for (const o of m.objects) {
      const ox = o.x * TILE + 8, oy = o.y * TILE + 8;
      if (o.type === 'lever' && !o.on && dist(b.x, b.y, ox, oy) < 11) {
        o.on = true; if (o.flag) this.flags[o.flag] = true;
        Audio2.jingle('door'); Particles.burst(ox, oy, 'sparkle');
        this.banner(o.msg || 'CLICK! A far-off mechanism turns over.'); saveGame();
      } else if (o.type === 'boneswitch' && !this.lookupFlag(o.flag) && dist(b.x, b.y, ox, oy) < 12) {
        this.flags[o.flag] = true; o.on = true; Audio2.jingle('door'); Particles.burst(ox, oy, 'sparkle');
        this.banner(o.msg || 'CLACK! The BOOMER-BONE trips a far switch — something opens!'); saveGame();
      } else if (o.type === 'berry' && !this.flags.berries[o.id] && dist(b.x, b.y, ox, oy) < 11) this.collectBerry(o);
      else if (o.type === 'shard' && !this.flags.shards[o.id] && dist(b.x, b.y, ox, oy) < 11) this.collectShard(o);
    }
  },
  // ---------- moving asteroids (the Astral Drift dungeon) ----------
  asteroidCovers(ti, tj) {
    const m = this.map; if (!m || !m.asteroids) return false;
    const cx = ti * TILE + 8, cy = tj * TILE + 8;
    for (const a of m.asteroids) if (cx >= a.x && cx <= a.x + a.w * TILE && cy >= a.y && cy <= a.y + a.h * TILE) return true;
    return false;
  },
  updateAsteroids(dt) {
    const m = this.map; if (!m || !m.asteroids) return;
    let carrier = null;
    for (const a of m.asteroids) if (Player.x >= a.x && Player.x <= a.x + a.w * TILE && Player.y >= a.y && Player.y <= a.y + a.h * TILE) carrier = a;
    for (const a of m.asteroids) {
      a.t = (a.t || 0) + dt;
      const px = a.x, py = a.y;
      const u = 0.5 - 0.5 * Math.cos((a.t / a.period + (a.phase || 0)) * Math.PI * 2);
      a.x = lerp(a.ax0, a.ax1, u); a.y = lerp(a.ay0, a.ay1, u);
      if (a === carrier && !Player.grab && !Player.ledge && !Player.airborne) { Player.x += a.x - px; Player.y += a.y - py; }
    }
    if (!Player.airborne && !Player.ledge && !Player.grab) {
      const [fi, fj] = Player.footTile();
      const d = TILEDEFS[tileAt(m, fi, fj)] || {};
      if ((d.rift || d.hole) && !this.asteroidCovers(fi, fj)) {
        Player.hurt(1); Audio2.jingle('denied');
        Player.x = Player.lastSafe[0]; Player.y = Player.lastSafe[1]; Player.airborne = false;
        Particles.burst(Player.x, Player.y, 'dust'); this.toast('Into the void! Back to solid rock.');
      }
    }
  },
  // ---------- interactions (SPACE) ----------
  interact() {
    const map = this.map, px = Player.x, py = Player.y;
    const [fi, fj] = Player.footTile();
    // underfoot first: warp pads, buoys, bubbles
    for (const o of map.objects) {
      if (o.type === 'warp' && o.x === fi && o.y === fj) {
        if (this.map.id === 'wastes' && (this.flags.life_alien || 0) < WASTES_ALIEN_QUOTA) { this.toast('The warp pads are DEAD — catch ALL the aliens to power them!'); return; }
        Player.x = o.tx * TILE + 8; Player.y = o.ty * TILE + 12; Player.lastWarpTile = [o.tx, o.ty];
        Audio2.jingle('dive'); Particles.burst(Player.x, Player.y, 'sparkle'); return;
      }
      if (o.type === 'buoy' && dist(px, py, o.x * TILE + 8, o.y * TILE + 8) < 22) {
        if (o.free || this.flags.suit) { Audio2.jingle('dive'); this.banner(o.msg || 'Noah dives into the Deep Blue!'); this.loadMap(o.to, o.tx, o.ty); }
        else this.toast('You need the DIVING SUIT to dive! (Salty Sal trades one for a shark)');
        return;
      }
      if (o.type === 'bubble' && dist(px, py, o.x * TILE + 8, o.y * TILE + 8) < 20) {
        Audio2.jingle('dive'); this.loadMap(o.to, o.tx, o.ty); return;
      }
    }
    // RAM PRIORITY: facing a cracked brick with the RAM SUIT? SMASH it — don't let a nearby SIGN hijack SPACE.
    {
      const [rdx, rdy] = DIRS[Player.dir];
      const rci = ((px + rdx * 14) / TILE) | 0, rcj = ((py + rdy * 14) / TILE) | 0;
      if (this.flags.ramsuit && (TILEDEFS[tileAt(map, rci, rcj)] || {}).crack) { Player.lunge(); return; }
    }
    // facing tile + adjacency
    const [dx, dy] = DIRS[Player.dir];
    const tx = px + dx * 14, ty = py + dy * 14;
    for (const o of map.objects) {
      const ox = o.x * TILE + 8, oy = o.y * TILE + 8;
      const near = dist(px, py, ox, oy) < 22 || dist(tx, ty, ox, oy) < 12;
      if (!near) continue;
      if (o.type === 'sign') { Audio2.jingle('talk'); this.dialog = { name: 'Sign', who: null, lines: [o.text] }; this.state = 'dialog'; return; }
      if (o.type === 'npc') { this.talkTo(o); return; }
      if (o.type === 'gearsocket') {
        if (this.flags.cog_started) { Audio2.jingle('talk'); this.toast('The MASTER-GEAR is seated — the Clocktower turns smoothly.'); return; }
        if (!this.flags.cog_cleared) { Audio2.jingle('talk'); this.toast('The gears are still FOULED — clear the city first! (' + this.cityPestsLeft() + ' critters left)'); return; }
        if (!this.flags.has_mastergear) { Audio2.jingle('talk'); this.toast('City clear! Return to the SUPREME TRADER for the MASTER-GEAR.'); return; }
        this.flags.cog_started = true; this.flags.has_mastergear = false; Audio2.jingle('door'); Particles.burst(ox, oy - 8, 'sparkle');
        this.banner('CLUNK — the MASTER-GEAR seats home! The CLOCKTOWER roars to life. BOUNCE up and chain your skills to the STAR-CELL!'); saveGame(); return;
      }
      if (o.type === 'chest' && !this.flags.openedChests[o.id]) {
        if (o.req && !this.lookupFlag(o.req)) {
          Audio2.jingle('talk');
          this.toast(o.req === 'twinkle' ? 'The chest is SEALED by twinkling magic... defeat the master of this lair first!' : 'This chest is SEALED — flip its far SWITCH (boomer-bone) to unlock it!');
          return;
        }
        this.flags.openedChests[o.id] = true; this.giveLoot(o.loot); Particles.burst(ox, oy - 10, 'sparkle'); return;
      }
      if (o.type === 'shard' && this.collectShard(o)) return;
      if (o.type === 'starcell' && this.collectStarcell(o)) return;
      if (o.type === 'parents' && !this.flags.parents) {
        if (!this.flags.tempestia) { Audio2.jingle('talk'); this.toast('A storm-cage holds them! Defeat the STORM-LORD first.'); return; }
        this.flags.parents = true; this.winT = 2.4; this.winKind = 'parents'; Audio2.jingle('bosswin'); Audio2.playSong('title');
        Particles.burst(ox, oy - 12, 'confetti'); Particles.burst(ox - 12, oy, 'confetti'); Particles.burst(ox + 12, oy, 'confetti');
        this.banner('BERKLEY & MEGAN ARE FREE! Noah, Ramsi and his parents soar home on the dawn wind. HERO OF THE SKY — THE END!');
        saveGame(); return;
      }
      if (o.type === 'ramsi' && o.roost && !this.flags.ramsi) {
        // adjacency here means the cage door (sw_roost) is already open
        this.flags.ramsi = true; this.flags.world2 = true; this.flags.ramHead = true; this.winT = 4.0; this.winKind = 'ramsi';
        Audio2.jingle('bosswin'); Audio2.playSong('title');
        Particles.burst(ox, oy - 12, 'confetti'); Particles.burst(ox - 12, oy, 'confetti'); Particles.burst(ox + 12, oy, 'confetti');
        this.banner("RAMSI IS FREE! But the sky tears open — a STORM-LORD snatches Noah's parents BERKLEY & MEGAN to the SKYWARD CITADEL! Ramsi joins the rescue — CLIMB!");
        saveGame(); return;
      }
      if (o.type === 'pillowkin' && o.caged && !this.flags['kin_' + o.kin]) {
        if (o.warden && !this.flags[o.warden]) { Audio2.jingle('talk'); this.toast('A WARDEN guards this cage — defeat it first!'); return; }
        this.flags['kin_' + o.kin] = true;
        this.flags.pillowkin = (this.flags.pillowkin || 0) + 1;
        const gives = Array.isArray(o.gives) ? o.gives : (o.gives ? [o.gives] : []);
        for (const g of gives) this.flags[g] = true;
        o.caged = false;
        Audio2.jingle('bosswin');
        Particles.burst(ox, oy - 10, 'confetti'); Particles.burst(ox - 10, oy, 'confetti'); Particles.burst(ox + 10, oy, 'confetti');
        this.banner(o.freed || 'A PILLOW-KIN is free! Ramsi feels a power reawaken!');
        saveGame(); return;
      }
      if (o.type === 'berry' && this.collectBerry(o)) return;
    }
    // facing a block? POWER BRACERS grab beats lunging
    for (const o of map.objects) {
      if (o.type !== 'block') continue;
      const ox = o.x * TILE + 8, oy = o.y * TILE + 8;
      if (dist(tx, ty, ox, oy) < 13 || dist(px, py, ox, oy) < 17) {
        if (this.flags.bracers) {
          Player.grab = o; Player.grabT = 0.22; Player.gSlide = null;
          if (!this.flags.grabHinted) { this.flags.grabHinted = true; this.toast('Grabbed! Keep holding SPACE — arrows now PUSH or PULL it.'); }
        } else this.toast('Too slippery to grip! POWER BRACERS would do it...');
        return;
      }
    }
    // nothing to talk to — GRAB-LUNGE! (always available, no tool swap needed)
    Player.lunge();
  },
  talkTo(o) {
    const F = this.flags, D = (name, who, lines, after) => { this.dialog = { name, who, lines: Array.isArray(lines) ? lines : [lines], after }; this.state = 'dialog'; Audio2.jingle('talk'); };
    if (o.who === 'granny') {
      const sheep = F.life_sheep || 0;
      if (!F.net) {
        if (sheep >= 3) {
          F.net = true; F.cage = true; F.baits.clover += 3; F.baits.tincan += 3;
          D('Granny', 'granny', ["My sheep! You wonderful buff boy! Take my CATCH NET (tool 2) and my picnic-basket SCENT CAGE (tool 4).",
            "Cage trick: stand somewhere nice, press Z with the cage to pick a BAIT. CLOVER charms sheep & rams. TIN CANS? Goats can't resist 'em!",
            "Try trapping a RAM in the west woods — and the mountain goats up the snowy stairs!"], () => { this.itemGet('tool:net', 'CATCH NET + SCENT CAGE!', 'Z swings the net (tool 2). Tool 4 sets a baited cage trap!'); saveGame(); });
        } else D('Granny', 'granny', "Oh deary me! My 3 sheep scampered off into the meadow. Sneak close and GRAB them (SPACE)! You've found " + sheep + " of 3.");
      } else D('Granny', 'granny', "You're doing GRAND, Noah! Remember: every creature loves the right bait.");
    }
    else if (o.who === 'spirit') {
      if (F.sandals) D('Shrine Spirit', 'spirit', 'Spring high, little champion!');
      else if (this.mountainCount() >= 3) {
        F.sandals = true;
        D('Shrine Spirit', 'spirit', ["The mountain folk vouch for you, kind one. Receive the SPRING SANDALS!",
          'Press X to JUMP — over gaps, up little ledges. The Goat Grotto gap awaits!'], () => { this.itemGet('gear:sandal', 'SPRING SANDALS!', 'Press X to JUMP over gaps and up little ledges!'); saveGame(); });
      } else D('Shrine Spirit', 'spirit', 'Befriend 3 mountain friends (goats or rams) and I shall gift you wings for your feet. So far: ' + this.mountainCount() + ' of 3.');
    }
    else if (o.who === 'supreme_trader') {
      const left = this.cityPestsLeft();
      if (!F.cog_quest) {
        F.cog_quest = true;
        D('Supreme Trader', 'supreme_trader', [
          "AH — NOAH! And the pillow-pet RAMSI! COGWERK CITY hails you, champions of three worlds!",
          "But we're in a JAM — literally. Haywire critters swarmed the plaza and FOULED the great Clocktower's gears. It won't turn!",
          "CLEAR them ALL out first. VOLT-BUGS charge and ZAP you; SPARK-DRONES shrug off Ramsi's daze and bite — keep your distance and NET them; COG-HOPPERS bolt faster than you can run (throw the NET, or bait a CAGE!); RUST-BEETLES need a BONE-stun first; STEAM-BULLS charge in bursts.",
          "Catch every last one, then come back to me — I'll hand you the MASTER-GEAR to restart the Clocktower.",
        ]);
      } else if (left > 0) {
        D('Supreme Trader', 'supreme_trader', left + ' haywire critter' + (left === 1 ? '' : 's') + " still fouling the gears! Catch them ALL, then come see me.");
      } else if (!F.has_mastergear && !F.cog_started) {
        F.has_mastergear = true;
        D('Supreme Trader', 'supreme_trader', ["The city's CLEAR — wonderful work! Here, take the MASTER-GEAR.", "SOCKET it at the Clocktower base (SPACE) to set the great gears turning — THEN climb: BOUNCE, GLIDE, SHRINK, POUND to the STAR-CELL atop!"], () => { this.banner('Got the MASTER-GEAR! Carry it to the CLOCKTOWER base and SOCKET it (SPACE).'); saveGame(); });
      } else if (!F.cog_started) {
        D('Supreme Trader', 'supreme_trader', "Carry the MASTER-GEAR to the Clocktower base and SOCKET it (SPACE) to start the gears turning.");
      } else {
        const n = this.starcellCount();
        if (n >= 4) D('Supreme Trader', 'supreme_trader', ["ALL FOUR STAR-CELLS! Stand back — let the FUSION begin!", "(Ramsi's super-form fusion is coming in a future update, champion!)"]);
        else D('Supreme Trader', 'supreme_trader', "The Clocktower turns! CLIMB it — BOUNCE up, GLIDE the gap, SHRINK the vent, POUND the plate — to the STAR-CELL. (" + n + "/4)");
      }
    }
    else if (o.who === 'lady') {
      if (this.flags.starcells && this.flags.starcells.sc_lady) D('Lady of the Lake', 'lady', 'The waters thank you, hero. Ramsi glows brighter with every cell you gather.');
      else if (this.flags.cog2_flow) D('Lady of the Lake', 'lady', ["You cleared the Pipeworks — the pond breathes again and my fish DANCE!", "Rise, champion of three worlds. Take this STAR-CELL — the second of four."], () => { this.collectStarcell({ id: 'sc_lady' }); saveGame(); });
      else D('Lady of the Lake', 'lady', 'My pond lies dry and my fish gasp on the cracked bed... CLEAR every clogged pipe — ROLL Ramsi through the SLUDGE walls, RAM the CRACKED ones — and the waters shall return.');
    }
    else if (o.who === 'marko') this.openShop();
    else if (o.who === 'combi' && this.combineStock) this.openCombiner();
    else if (o.who === 'tess' || o.who === 'sal' || o.who === 'gruul' || o.who === 'cora') this.openTrade(o.who);
    else if (o.who === 'plume') {
      const pupils = F.life_starpupil || 0;
      if (F.bone) D('Ms. Plume', 'plume', 'My pupils are back at their desks. You have a 100% in Heroism, Noah!');
      else if (pupils >= 3) {
        F.bone = true;
        D('Ms. Plume', 'plume', ["All my star pupils are back for snack time! As promised: my BOOMER-BONE (tool 5).",
          'Throw it (Z) to STUN skittish or dangerous creatures — then grab or net them. Even sleepy giants...'], () => { this.itemGet('tool:bone', 'THE BOOMER-BONE!', 'Z throws it (tool 5) — STUN a critter, then GRAB (SPACE) or net it!'); saveGame(); });
      } else D('Ms. Plume', 'plume', "Class is in chaos! My 3 STAR PUPILS swam off. Trap them with STARDUST COOKIE cages (Marko sells cookies). Rounded up: " + pupils + ' of 3.');
    }
    else if (o.who === 'zibble') {
      const n = this.shardCount();
      if (F.keepOpen) D('Zibble', 'zibble', 'Bleep! Saucer fixed soon. Cerberus is a GOOD boy, just overexcited. Bonk him gently when he naps!');
      else if (n >= 3) {
        F.keepOpen = true; F.gems += 5;
        D('Zibble', 'zibble', ["ZORP! All 3 shards! You are hero of planet Zibblon-7! Take 5 gems!",
          "The starlight seal on HOUND'S KEEP is broken. Cerberus sleeps within — the Boomer-Bone, while he's drowsy!"], () => { Audio2.jingle('gear'); this.banner("HOUND'S KEEP is unsealed!"); saveGame(); });
      } else D('Zibble', 'zibble', 'Bzzt... my saucer! CERBERUS scattered 3 STAR SHARDS across the rifts. WARP PADS go where feet cannot (stand on pad, press SPACE). Found: ' + n + ' of 3.');
    }
  },
  // ---------- shop ----------
  shopStock() {
    const F = this.flags, zone = this.map.zone;
    const items = [];
    const upg = (key, names, prices, descs) => {
      const lv = F['upg_' + key] || 0;
      if (lv < names.length) items.push({ kind: 'upg', key, label: names[lv] + '  [lv ' + (lv + 1) + '/' + names.length + ']', price: prices[lv], desc: descs[lv] });
    };
    if (zone === 'vale') {
      if (!F.gloves) items.push({ kind: 'flag', key: 'gloves', label: 'CLIMBING GLOVES', price: 8, desc: 'Mantle up cliffs & SLICK walls!' });
      items.push({ kind: 'bait', key: 'clover', n: 3, label: 'Clover x3', price: 2, desc: 'Sheep & rams adore it.' });
      items.push({ kind: 'bait', key: 'tincan', n: 3, label: 'Tin Cans x3', price: 2, desc: "Goats' favorite snack." });
      upg('lunge', ['Long Lunge', 'Rocket Lunge'], [5, 10], ['Mitts lunge farther!', 'Lunge MUCH faster!']);
      upg('speed', ['Swift Boots'], [6], ['Run faster!']);
      items.push({ kind: 'heartpiece', label: 'Piece of Heart', price: 6, desc: '4 pieces = new container.' });
    } else if (zone === 'coast') {
      items.push({ kind: 'bait', key: 'fishsnack', n: 3, label: 'Fish Snacks x3', price: 2, desc: 'Sea Mimis & starfish arms!' });
      items.push({ kind: 'bait', key: 'cookie', n: 3, label: 'Stardust Cookies x3', price: 3, desc: 'Star pupils & cosmic critters.' });
      upg('net', ['Big Net', 'NET LAUNCHER', 'Mega Launcher'], [6, 12, 18], ['Bigger swing!', 'Fires flying nets!', 'Huge net radius!']);
      upg('jump', ['Springy Soles'], [8], ['Longer jumps!']);
      items.push({ kind: 'heartpiece', label: 'Piece of Heart', price: 8, desc: '4 pieces = new container.' });
    } else if (zone === 'wastes') {
      items.push({ kind: 'bait', key: 'cookie', n: 3, label: 'Stardust Cookies x3', price: 3, desc: 'Unicorns & comet pups!' });
      upg('harpoon', ['Long Harpoon'], [10], ['Harpoon flies farther!']);
      upg('speed', ['Zoom Boots'], [12], ['Zoom zoom!']);
      items.push({ kind: 'heartC', label: 'Heart Container', price: 14, desc: 'A whole heart!' });
    } else {
      upg('jump', ['Moon Soles'], [14], ['Highest hops!']);
      upg('net', ['Mega Launcher'], [18], ['Huge net radius!']);
      items.push({ kind: 'heartpiece', label: 'Piece of Heart', price: 10, desc: '4 pieces = new container.' });
      items.push({ kind: 'heartC', label: 'Heart Container', price: 16, desc: 'A whole heart!' });
    }
    return items;
  },
  openShop() { this.menu = { type: 'shop', who: 'marko', sel: 0, items: this.shopStock() }; this.state = 'menu'; Audio2.jingle('talk'); },
  buySelected() {
    const m = this.menu, it = m.items[m.sel], F = this.flags;
    if (!it) return;
    if (F.gems < it.price) { Audio2.jingle('denied'); this.toast('Not enough gems! Trade creatures or coins with the zone trader.'); return; }
    F.gems -= it.price; Audio2.jingle('trade');
    if (it.kind === 'flag') {
      F[it.key] = true;
      if (it.key === 'gloves') this.itemGet('gear:glove', 'CLIMBING GLOVES!', 'Walk into cliffs and SLICK walls to clamber right up!');
      else this.banner('Got the ' + it.label + '!');
    }
    else if (it.kind === 'bait') { F.baits[it.key] += it.n; this.toast('+' + it.n + ' ' + it.label.split(' x')[0] + '!'); }
    else if (it.kind === 'upg') { F['upg_' + it.key] = (F['upg_' + it.key] || 0) + 1; this.banner(it.label.split('  [')[0] + ' acquired!'); }
    else if (it.kind === 'heartpiece') this.giveLoot({ heartpiece: 1 });
    else if (it.kind === 'heartC') this.giveLoot({ heartC: 1 });
    m.items = this.shopStock(); m.sel = Math.min(m.sel, Math.max(0, m.items.length - 1));
    saveGame();
  },
  // ---------- traders ----------
  tradeStock(who) {
    const F = this.flags, t = [];
    const cr = (sp, n, label, fn, special) => t.push({ sp, n, label, fn, special, have: this.log[sp] || 0 });
    if (who === 'tess') {
      cr('sheep', 2, '2 Sheep -> 3 gems', () => { F.gems += 3; });
      cr('ram', 1, '1 Ram -> 2 gems', () => { F.gems += 2; });
      cr('goat', 1, '1 Goat -> 3 gems', () => { F.gems += 3; });
    } else if (who === 'sal') {
      if (!F.suit) cr('shark', 1, '1 SHARK -> DIVING SUIT', () => { F.suit = true; this.itemGet('gear:suit', 'THE DIVING SUIT!', 'Swim the shallows! Press SPACE at a buoy to DIVE into the Deep Blue!'); }, true);
      cr('octopus', 1, '1 Octopus -> 2 gems', () => { F.gems += 2; });
      cr('jellyfish', 1, '1 Jellyfish -> 2 gems', () => { F.gems += 2; });
    } else if (who === 'gruul') {
      cr('alien', 1, '1 Alien -> 3 gems', () => { F.gems += 3; });
      cr('unicorn', 1, '1 Unicorn -> 5 gems', () => { F.gems += 5; });
      cr('unicorn', 2, '2 Unicorns -> HEART CONTAINER', () => { this.giveLoot({ heartC: 1 }); }, true);
    } else if (who === 'cora') {
      if (!F.wings) cr('dragon', 1, '1 DRAGON -> ANGEL WINGS', () => { F.wings = true; this.itemGet('gear:wing', 'ANGEL WINGS!!', 'Press X in mid-air to FLAP — again and again — and truly FLY!'); }, true);
      cr('capricorn', 1, '1 Capricorn -> 4 gems', () => { F.gems += 4; });
      cr('condor', 1, '1 Condor -> 3 gems', () => { F.gems += 3; });
      cr('ibex', 1, '1 Ibex -> 3 gems', () => { F.gems += 3; });
    }
    t.push({ sp: null, n: 10, label: '10 coins -> 1 gem', fn: () => { F.gems += 1; } });
    t.push({ sp: null, pay: 'gem', n: 1, label: '1 gem -> 8 coins', fn: () => { F.coins += 8; } });   // exchange back (small spread)
    return t;
  },
  openTrade(who) { this.menu = { type: 'trade', who, sel: 0, items: this.tradeStock(who) }; this.state = 'menu'; Audio2.jingle('talk'); },
  tradeSelected() {
    const m = this.menu, it = m.items[m.sel], F = this.flags;
    if (!it) return;
    if (it.sp === null) {
      if (it.pay === 'gem') {
        if (F.gems < it.n) { Audio2.jingle('denied'); this.toast('Not enough gems!'); return; }
        F.gems -= it.n;
      } else {
        if (F.coins < it.n) { Audio2.jingle('denied'); this.toast('Not enough coins!'); return; }
        F.coins -= it.n;
      }
    } else {
      if ((this.log[it.sp] || 0) < it.n) { Audio2.jingle('denied'); this.toast('Not enough ' + CREATURES[it.sp].name + 's in your herd!'); return; }
      this.log[it.sp] -= it.n;
    }
    it.fn(); Audio2.jingle('trade');
    if (this.menu) {   // an ITEM GET celebration may have closed the menu
      this.menu.items = this.tradeStock(m.who); m.sel = Math.min(m.sel, this.menu.items.length - 1);
    }
    saveGame();
  },
  // confirm the highlighted menu row (shared by keyboard + mouse)
  menuConfirm() {
    const m = this.menu; if (!m) return;
    if (m.type === 'shop') this.buySelected();
    else if (m.type === 'trade') this.tradeSelected();
    else if (m.type === 'combine') this.combineSelected();
    else if (m.type === 'bait') { const it = m.items[m.sel]; this.menu = null; this.state = 'play'; if (it) this.placeCage(it.key); }
  },
  // ---------- bait menu / cage placement ----------
  openBaitMenu() {
    const opts = Object.entries(this.flags.baits).filter(([k, v]) => v > 0);
    if (!opts.length) { this.toast('No baits! Granny gave some; Marko sells more.'); return; }
    this.menu = { type: 'bait', sel: 0, items: opts.map(([k, v]) => ({ key: k, label: ({ clover: 'Clover', tincan: 'Tin Can', fishsnack: 'Fish Snack', cookie: 'Stardust Cookie', berry: 'RAINBOW BERRY', hay: 'FRESH HAY' })[k] + '  x' + v })) };
    this.state = 'menu';
  },
  placeCage(bait) {
    const [dx, dy] = DIRS[Player.dir];
    const ti = ((Player.x + dx * TILE) / TILE) | 0, tj = ((Player.y + dy * TILE) / TILE) | 0;
    const id = tileAt(this.map, ti, tj), d = TILEDEFS[id] || {};
    if (d.solid || d.hole || d.rift || d.door || d.gate) { this.toast("Can't set a cage there!"); return; }
    this.flags.baits[bait]--;
    this.map.objects.push({ type: 'cageSet', x: ti, y: tj, bait, done: false });
    Audio2.jingle('cage'); this.toast('Cage set with ' + bait + '. Stand back...');
  },
  // ---------- quest hint (live) ----------
  questHint() {
    const F = this.flags;
    if (this.map && this.map.id === 'castle1')
      return F.colossus ? 'THE STORM IS OVER! Bask in the sunshine... then take the glowing portal home. THE END!'
        : 'GRIMSPIRE KEEP: stand under a GLOW and FIRE the LASER (C)! Grass lumps & milk refill Ramsi\'s zap. Blast every piece, then the HELMET, then the HEAD!';
    // World 3: Cogwerk City — the STAR-CELL hunt
    if (this.map && this.map.zone === 'city') {
      if (this.map.id === 'cog2') {
        if (this.flags.starcells && this.flags.starcells.sc_lady) return 'STAR-CELL won! Head back up the pipe to Cogwerk City.';
        if (F.cog2_flow) return 'The pond LIVES again! Speak to the LADY OF THE LAKE for your STAR-CELL.';
        return 'THE PIPEWORKS: carve a channel DOWN through the MAZE to the pond — ROLL the SLUDGE (C), RAM the CRACKS (Z). Water only runs DOWNHILL!';
      }
      if (this.map.id === 'cog4') {
        if (this.flags.gnashara) return 'GNASHARA is BEATEN — Cogwerk City is saved! (ESC home)';
        return 'GNASHARA, THE ALL-BEAST: knock out each HEAD with the RIGHT tool (watch the prompt) — then SUPER RAMSI ends it!';
      }
      if (this.map.id === 'cog3') {
        if (this.flags.starcells && this.flags.starcells.sc_cog3) return 'BLAZAGON caught — STAR-CELL #3! A FINALE portal opened on the last tower. ESC to the map, or step in.';
        return 'THE HIGH ROOFS: chase BLAZAGON and NET him (Z) — JUMP small gaps, HARPOON the anchors, GLIDE the wide chasms. He BOLTS to a new roof each hit — corner him on the last tower!';
      }
      if (!F.cog_quest) return 'COGWERK CITY: talk to the SUPREME TRADER (he is by the plaza).';
      if (!F.cog_cleared) return 'CLEAR THE CITY! Catch every haywire critter fouling the Clocktower gears. [' + this.cityPestsLeft() + ' left]';
      if (!F.has_mastergear && !F.cog_started) return 'City clear! Return to the SUPREME TRADER for the MASTER-GEAR.';
      if (!F.cog_started) return 'SOCKET the MASTER-GEAR at the CLOCKTOWER base to set it turning.';
      const n = this.starcellCount();
      if (n >= 4) return 'ALL FOUR STAR-CELLS! See the SUPREME TRADER to awaken RAMSI\'s SUPER-FORM!';
      return 'Climb the CLOCKTOWER: BOUNCE, GLIDE, SHRINK, POUND to the STAR-CELL atop! [' + n + '/4]';
    }
    // World 2: The Underburrow takes over the hint once Noah has descended
    if (this.map && this.map.zone === 'burrow') {
      if (F.gnash) return 'THE PILLOW-KIN ARE FREE! Noah, Ramsi & the whole plush family head home. HERO OF THE UNDERBURROW!';
      if (F.gnashara && !F.colossus) return 'GRIMSPIRE KEEP: the STORM COLOSSUS strides the walls! Stand under a GLOW, fire RAMSI\'s LASER (C) — grass & milk refill his zap. Knock off every piece, the helmet, then the HEAD!';
      if (F.grub) return 'THE HOARD CAVERN: run the GAUNTLET — re-fight all four Wardens, then beat GNASH the Hollow King!';
      if (F.geode) return 'HOARD DESCENT: ride the MINE-RAILS — BONE + BLOCK the junctions, ROLL the slide, HARPOON down. Beat the TREMOR-GRUB; POUND the seal.';
      if (F.thornback) return 'CRYSTAL DEEP: wake the GREAT PRISM, walk the LIGHT-BRIDGE, decoy the moths, align the vault-hearts. Pin the GEODE GOLEM in light!';
      if (F.mottle) return 'ROOT HOLLOWS: turn ROOT-BULBS (C) to route the sap — drain, feed the gate, grow the BRIDGE-ROOT. Glue THORNBACK in sticky sap; NET it.';
      return 'TOPSOIL TUNNELS: wave clovers at JOB-PATCHES (SPACE) — sheep MOW, goats DIG, rams BUTT, hares SNIFF. Whack MOTTLE; free MR. RAM.';
    }
    if (F.gnashara && !F.colossus) return 'Something VAST still strides the storm! Take the CLOUD-STAIR in the All-Beast arena up to GRIMSPIRE KEEP.';
    if (F.gnash && !F.gnashara) return 'The Pillow-Kin are safe! Now the CLOCKWORK GATE east of the cottage ticks for you — enter COGWERK CITY!';
    if (F.parents && !F.gnash) return 'Home safe! But GNASH tore a BURROW in the meadow and stole the PILLOW-KIN — dive in and bring them home!';
    if (F.ramsi) {
      if (F.tempestia) return 'The storm-cage is open! RAM up through the cracked ceiling and FREE Berkley & Megan (SPACE)!';
      if (F.sparkhorn) return 'STORM CITADEL: cross the gust ON THE BEAT, step the moat-stones, smash the gates — then BONE the STORM-LORD through his three tempers!';
      if (F.pufflord) return 'THUNDERHEAD SPAN: bolts hunt the PLATES — walk in a ROD\'s shadow! Let SPARKHORN fry itself, then HARPOON it!';
      if (F.gustwing) return 'GALE TERRACES: cross the PUFF-STONES while plump, butt the sky-switch — find the PUFF LORD by his CROWN and GRAB him!';
      if (F.ramsuit) return 'CLOUDRISE LANDING: RAM the wall, WALK THE LEAF-STREAM, ride the up-draft — sidestep the GUST WING\'s dives and NET it!';
      return 'RAMSI joins you! Climb the SKY to the Storm Citadel and rescue BERKLEY & MEGAN — grab the RAM SUIT chest first!';
    }
    if (F.sahor && Game.mapId === 'roost') return "RAMSI'S ROOST: JUMP, CLIMB, HARPOON, DIVE, FLY east — then BRACER-push the block onto the STAR SWITCH to free Ramsi!";
    if (F.sahor) return 'The PORTAL atop the RAINBOW SPIRE is open! Step in and use ALL your powers to reach & free RAMSI.';
    if (!F.net) return "Catch Granny's sheep — sneak close and GRAB (SPACE)! [" + (F.life_sheep || 0) + '/3]';
    if (this.mountainCount() < 3) return 'Befriend 3 mountain friends: clover cages for RAMS (west woods), tin-can cages for GOATS (snowy stairs NW)! [' + this.mountainCount() + '/3]';
    if (!F.sandals) return 'Climb the snowy stairs NW to the summit shrine — the spirit has a gift!';
    if (!F.harpoon) return 'JUMP (X) the gap into GOAT GROTTO (north cliffs). The HARPOON waits inside!';
    if (!F.billy) return 'Grotto rooms: Entry Cavern (harpoon) -> Great Chasm (island key) -> Bracer Works (2 blocks on 2 switches -> BIG KEY) -> Billy\'s Hall!';
    if (!F.gloves) return "Buy CLIMBING GLOVES at Marko's stall (8 gems). Tess trades sheep/rams/goats & coins into gems!";
    if (!F.coastPath) return 'Conquer the GEAR GAUNTLET (SE corner), then CLIMB the Cliffside Crossing beyond — gloves grip the slick stone!';
    if (!F.suit) return 'At the coast: HARPOON a shark from the pier, then trade it to SALTY SAL for the DIVING SUIT!';
    if (!F.bone) return 'Visit SUNSPLASH SCHOOL (NE building): cage 3 star pupils with STARDUST COOKIES -> Ms. Plume lends her BOOMER-BONE! [' + (F.life_starpupil || 0) + '/3]';
    if (this.seaCount() < 8) return 'Befriend 8 sea Mimis (harpoon swimmers; fish-snack cages in the Deep Blue) to open the TIDE GATE. [' + this.seaCount() + '/8]';
    if (!F.twinkle) return "Dive at a buoy (SPACE). Beyond the Tide Gate: trap SIR TWINKLE's GLOWING arm tips with FISH-SNACK cages!";
    if (!F.crown) return "Open the chest in Twinkle's lair: the SUNKEN CROWN!";
    if (this.shardCount() < 3 || !F.keepOpen) return F.keepOpen ? '' : 'Press ESC: travel to STARFALL WASTES. Warp-pad across the rifts for 3 STAR SHARDS, then see ZIBBLE. [' + this.shardCount() + '/3]';
    if (!F.cerberus) return "HOUND'S KEEP: Star Halls slalom -> little key -> TRIPLE LOCKS (3 blocks; standing doesn't count!) -> BIG KEY -> bone drowsy CERBERUS, GRAB!";
    if (!F.wings) return 'Press ESC: WHISTLING CANYON. Stun a napping DRAGON (bone) then NET it — Cora trades it for ANGEL WINGS!';
    if (!(F.baits.berry > 0 || Object.keys(F.berries).length)) return 'Fly (X-flap!) across the summit rift to the RAINBOW BERRY garden!';
    if (!F.sahor) return 'Enter the RAINBOW SPIRE: harpoon Sahor\'s GLOWING RING ×3, then rainbow-berry cage her on the run. (Then a PORTAL to RAMSI opens!)';
    return 'Explore Mimi Island!';
  },
  // ---------- ui feedback ----------
  banner(text) { this.banners.push({ text, t: 3.4 }); },
  toast(text) { this.toasts.push({ text, t: 2.4 }); },
};
