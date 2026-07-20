"use strict";
// ================= main: loop, render, save, states =================
const SAVE_BASE = 'buffNoahQuest_v4';
const NUM_SLOTS = 3;
function slotKey(n) { return SAVE_BASE + '_s' + n; }
function migrateSlots() { const s = storage(); if (!s) return; try { const old = s.getItem(SAVE_BASE); if (old && !s.getItem(slotKey(0)) && !s.getItem(slotKey(1)) && !s.getItem(slotKey(2))) s.setItem(slotKey(0), old); } catch (e) {} }
function storage() {
  try { return G.localStorage || (typeof localStorage !== 'undefined' ? localStorage : null); } catch (e) { return null; }
}
function hasSave(n) { const s = storage(); try { return !!(s && s.getItem(slotKey(n === undefined ? Game.saveSlot : n))); } catch (e) { return false; } }
// snapshot the current WORLD scene (no HUD panel, no dialog box) into a tiny JPEG for the album
Game.capturePhoto = function (id) {
  try {
    if (typeof canvas === 'undefined' || !canvas || !canvas.width) return;
    const cw = canvas.width, ch = canvas.height;
    const sw = Math.round(cw * VW / SW), sh = ch;          // the world view region (device px)
    // CRISP PHOTOS: capture at the album zoom-view's exact device size (300x170 logical
    // at SCALE 2 = 600x340 -> the zoomed polaroid is pixel-for-pixel), smooth the
    // photographic downscale (nearest-neighbour speckled it), and prefer WEBP with a
    // JPEG fallback (webp halves the localStorage cost). Old saved photos still draw.
    const DW = 600, DH = Math.round(DW * VH / VW);
    const off = mkCanvas(DW, DH), ox = off.getContext('2d');
    ox.imageSmoothingEnabled = true;
    ox.drawImage(canvas, 0, 0, sw, sh, 0, 0, DW, DH);
    let url = '';
    try { url = off.toDataURL('image/webp', 0.72); } catch (e) {}
    if (!url || url.indexOf('data:image/webp') !== 0) { try { url = off.toDataURL('image/jpeg', 0.62); } catch (e) { url = ''; } }
    if (!url || url.length < 64) { try { url = off.toDataURL(); } catch (e) {} }          // PNG: last resort
    if (url && url.length > 220000) {                                                     // huge (PNG path)? shrink it
      try {
        const off2 = mkCanvas(300, 170), o2 = off2.getContext('2d');
        o2.imageSmoothingEnabled = true; o2.drawImage(off, 0, 0, 300, 170);
        url = off2.toDataURL('image/jpeg', 0.55);
      } catch (e) {}
    }
    // Keep ANY real capture. A valid data-URL IS a valid photo — even a dark cave or a
    // plain view (those are legitimate scenes that just compress small). Only a genuine
    // ENCODE FAILURE yields an empty/invalid string, which we skip. The old '>1500 bytes
    // = blank' gate wrongly rejected dark/simple scenes, so the album kept re-trying them
    // forever (the never-ending glitter spew). Never gate a photo by its byte size again.
    if (url && url.indexOf('data:image/') === 0 && url.length > 128) {
      this.flags.mimiphotos = this.flags.mimiphotos || {};
      this.flags.mimiphotos[id] = url;
      (this.flags.mimiphotoV = this.flags.mimiphotoV || {})[id] = 2;
      saveGame();
      return true;
    }
    return false;
  } catch (e) { return false; }
};
function saveGame() {
  const s = storage(); if (!s || Game.state === 'title') return;
  const payload = () => JSON.stringify({
    v: 4, flags: Game.flags, log: Game.log, maxHearts: Player.maxHearts,
    mapId: Game.mapId, px: Player.x, py: Player.y,
  });
  try { s.setItem(slotKey(Game.saveSlot), payload()); return; } catch (e) {}
  // localStorage FULL: shed album photos OLDEST-first so real PROGRESS is never lost.
  // A shed photo simply re-snaps on the next visit (bounded — see the album re-shoot).
  const ph = Game.flags.mimiphotos, V = Game.flags.mimiphotoV;
  if (ph) for (const k of Object.keys(ph)) {
    delete ph[k]; if (V) delete V[k];
    try { s.setItem(slotKey(Game.saveSlot), payload()); return; } catch (e2) {}
  }
  try { s.setItem(slotKey(Game.saveSlot), payload()); } catch (e3) {}
}
function loadGame() {
  const s = storage(); if (!s) return false;
  try {
    const d = JSON.parse(s.getItem(slotKey(Game.saveSlot)));
    if (!d || d.v !== 4) return false;
    Object.assign(Game.flags, d.flags || {});
    Game.flags.baits = Object.assign({ clover: 0, tincan: 0, fishsnack: 0, cookie: 0, berry: 0 }, (d.flags || {}).baits);
    // normalize mats so saves from before newer materials existed keep every key
    Game.flags.mats = Object.assign({ pearl: 0, tire: 0, spring: 0, seedbag: 0, marble: 0, bucket: 0, skyfeather: 0, goldnugget: 0, crystalshard: 0, voidgem: 0 }, (d.flags || {}).mats);
    // MIGRATION: the SKY-FEATHER reward changed from the old RAIN CLOUD to the FLOATING AVIARY.
    // Anyone who already EARNED the feather must still be able to build the aviary — even a save
    // that spent it on the now-removed rain cloud (feather gone, and the Ascent grab won't re-fire).
    // Refund exactly one feather if they earned it, don't have the aviary, and hold none.
    {
      const F = Game.flags;
      const earnedFeather = F.gotmat_skyfeather || (F.matsFound && F.matsFound.ascent_feather);
      const hasAviary = F.decor_aviary || F.aviary;
      if (earnedFeather && !hasAviary && (F.mats.skyfeather || 0) < 1) {
        F.mats.skyfeather = 1;
        F.decor_raincloud = false;   // retire the old trophy state
      }
    }
    Game.log = d.log || {};
    Player.maxHearts = clamp(d.maxHearts || 6, 6, 28); Player.hearts = Player.maxHearts;
    // never resume inside a dungeon; sanitize position
    let mapId = MAPS[d.mapId] ? d.mapId : 'vale';
    if (MAPS[mapId].dungeon || MAPS[mapId].underwater) mapId = MAPS[mapId].zone === 'coast' ? 'coast' : MAPS[mapId].zone || 'vale';
    if (!MAPS[mapId]) mapId = 'vale';
    Game.loadMap(mapId);
    if (Number.isFinite(d.px) && Number.isFinite(d.py) && d.mapId === mapId) {
      Player.x = clamp(d.px, 8, MAPS[mapId].w * TILE - 8); Player.y = clamp(d.py, 8, MAPS[mapId].h * TILE - 8);
      Player.unstick(Game.map);
    }
    return true;
  } catch (e) { return false; }
}
function godMode() {
  // playtesting: every tool, every gear, every zone unlocked
  const F = Game.flags;
  F.god = true;
  // every TOOL, GEAR and resource — plus free travel — but the world is still FRESH:
  // bosses uncaught, dungeon/quest doors shut, so you can actually go play/test them.
  Object.assign(F, {
    net: true, harpoon: true, cage: true, bone: true,
    sandals: true, gloves: true, bracers: true, suit: true, wings: true,
    coins: 99, gems: 60, keys: 5, bosskeys: 3,
  });
  F.baits = { clover: 9, tincan: 9, fishsnack: 9, cookie: 9, berry: 9 };
  Player.maxHearts = 14; Player.hearts = 14;
  Game.state = 'play';
  Game.banner('GOD MODE: all tools, gear & travel unlocked — bosses are UNCAUGHT and doors SHUT, ready to test! ESC = map (6/7/8 = roads).');
  saveGame();
}
function world2Start() {
  // QUICK-START at WORLD 2 (The Underburrow) with every WORLD 1 achievement already earned.
  const F = Game.flags;
  Object.assign(F, {
    // gear, tools & shop upgrades
    net: true, cage: true, harpoon: true, bone: true,
    sandals: true, gloves: true, bracers: true, suit: true, wings: true,
    upg_lunge: 2, upg_net: 2, upg_jump: 2, upg_speed: 2, upg_harpoon: 2,
    coins: 80, gems: 40, keys: 5, bosskeys: 3,
    // World 1 bosses + progression all complete
    billy: true, coastPath: true, twinkle: true, crown: true, cerberus: true, sahor: true, keepOpen: true,
    // the Skyward Ascent: Ram Suit, Ramsi + his sky powers, all 4 sky bosses, parents rescued
    ramsuit: true, ramsi: true, world2: true, ramHead: true, ramStun: true, ramShield: true, ramBoost: true,
    gustwing: true, pufflord: true, sparkhorn: true, tempestia: true, parents: true,
    // ...but WORLD 2 itself is FRESH: clear any prior Underburrow progress
    ramGlow: false, ramShrink: false, ramBounce: false, ramGlide: false, ramDecoy: false, ramRoll: false, ramPound: false,
    mottle: false, thornback: false, geode: false, grub: false,
    g_mottle: false, g_thornback: false, g_geode: false, g_grub: false, gnash: false, pillowkin: 0,
    underburrow: true,   // skip the one-time intro for this repeatable quick-start
  });
  for (const k of Object.keys(F)) if (/^(kin_|b5_|b6_|b8_|bt_)/.test(k)) F[k] = false;
  F.openedChests = {}; F.openedDoors = {}; F.switchFlags = {};
  F.baits = { clover: 9, tincan: 9, fishsnack: 9, cookie: 9, berry: 9 };
  Player.maxHearts = 16; Player.hearts = 16;
  Game.loadMap('burrow5', 3, 11);
  Game.state = 'play';
  Game.banner('WORLD 2 — THE UNDERBURROW! Noah arrives with every World-1 power. Free the PILLOW-KIN to teach RAMSI his burrow abilities (C)!');
  saveGame();
}
function cityStart() {
  // QUICK-START at WORLD 3 (Cogwerk City): Ramsi joins with his FULL skill-set unlocked.
  const F = Game.flags;
  Object.assign(F, {
    net: true, cage: true, harpoon: true, bone: true,
    sandals: true, gloves: true, bracers: true, suit: true, wings: true,
    upg_lunge: 2, upg_net: 2, upg_jump: 2, upg_speed: 2, upg_harpoon: 2,
    coins: 80, gems: 40, keys: 5, bosskeys: 3,
    billy: true, coastPath: true, twinkle: true, crown: true, cerberus: true, sahor: true, keepOpen: true,
    ramsuit: true, ramsi: true, world2: true, ramHead: true, ramStun: true, ramShield: true, ramBoost: true,
    gustwing: true, pufflord: true, sparkhorn: true, tempestia: true, parents: true,
    ramGlow: true, ramShrink: true, ramBounce: true, ramGlide: true, ramDecoy: true, ramRoll: true, ramPound: true,
    underburrow: true, pillowkin: 4, gnash: true,
  });
  for (const k of Object.keys(F)) if (/^cog_/.test(k)) F[k] = false;   // FRESH city puzzle/quest flags
  F.has_mastergear = false;
  F.openedDoors = {}; F.switchFlags = {}; F.starcells = {};
  F.baits = { clover: 9, tincan: 9, fishsnack: 9, cookie: 9, berry: 9 };
  Player.maxHearts = 16; Player.hearts = 16;
  Game.loadMap('cog1');
  Game.state = 'play';
  Game.banner('WORLD 3 — COGWERK CITY! The SUPREME TRADER needs you. Talk to him (SPACE), then use ALL of Ramsi\'s skills to gather the STAR-CELLS!');
  saveGame();
}
function newGame() {
  const s = storage(); try { if (s) s.removeItem(slotKey(Game.saveSlot)); } catch (e) {}
  Game.flags.playtest = false; Game.flags.god = false;   // mode flags never leak into a fresh run
  Player.maxHearts = 6; Player.hearts = 6;
  Game.loadMap('vale');
  Game.flags.ramsiIntro = true;
  Game.state = 'intro'; Game.introT = 0; Game.intro = null;   // fresh beat state for the opening
}

Game.saveSlot = 0; Game.titleSlot = 0;
Game.slotSummary = function (n) {
  const s = storage(); if (!s) return null;
  try { const d = JSON.parse(s.getItem(slotKey(n))); if (!d || d.v !== 4) return null;
    return { name: (MAPS[d.mapId] && MAPS[d.mapId].name) || 'Mimi Island', hearts: d.maxHearts || 6,
      caught: Object.keys(d.log || {}).reduce((a, k) => a + (d.log[k] || 0), 0) };
  } catch (e) { return null; }
};
Game.eraseSlot = function (n) { const s = storage(); try { if (s) s.removeItem(slotKey(n)); } catch (e) {} Audio2.jingle('denied'); };
Game.enterSlot = function (mode) {
  Game.saveSlot = Game.titleSlot;
  if (mode === 'god') { newGame(); godMode(); }
  else if (mode === 'under') { newGame(); world2Start(); }
  else if (mode === 'playtest') { newGame(); playtestMode(); }
  else if (mode === 'city') { newGame(); cityStart(); }
  else if (mode === 'new') { newGame(); }
  else { if (!loadGame()) newGame(); }
  if (Game.state === 'title') Game.state = 'play';
};

// ---------- per-frame update ----------
function updateGame(dt) {
  Game.time += dt;
  if (typeof pollGamepad === 'function') pollGamepad();        // USB SNES pad -> same KEYS[]/PRESS_QUEUE as the keyboard
  for (const cl of takeClicks()) UI.handleClick(cl.x, cl.y);   // mouse -> selections / confirms
  const presses = takePresses();
  const F = Game.flags;
  if (Game.state === 'padsetup') { if (Game.Gamepad) Game.Gamepad.updateSetup(presses); return; }
  if (Game.state === 'title') {
    if (presses.length) Audio2.ensure();
    for (const k of presses) {
      if (k === 'ArrowUp' || k === 'w' || k === 'ArrowLeft' || k === 'a') Game.titleSlot = (Game.titleSlot + NUM_SLOTS - 1) % NUM_SLOTS;
      else if (k === 'ArrowDown' || k === 's' || k === 'ArrowRight' || k === 'd') Game.titleSlot = (Game.titleSlot + 1) % NUM_SLOTS;
      else if (k === '1' || k === '2' || k === '3') Game.titleSlot = clamp(+k - 1, 0, NUM_SLOTS - 1);
      else if (k === 'x' || k === 'Delete' || k === 'Backspace') Game.eraseSlot(Game.titleSlot);
      else if (k === 'g') Game.enterSlot('god');
      else if (k === 'u') Game.enterSlot('under');
      else if (k === 't') Game.enterSlot('playtest');
      else if (k === 'c') Game.enterSlot('city');
      else if (k === 'n') Game.enterSlot('new');
      else if (k === 'k') { if (Game.Gamepad) Game.Gamepad.openSetup(); }
      else if (k === ' ' || k === 'z' || k === 'Enter') Game.enterSlot('auto');
    }
    return;
  }
  if (Game.state === 'intro') {
    if (presses.length) Audio2.ensure();
    Game.updateIntro(dt, presses);   // SPACE-paced beats (12b_intro.js); X/ESC skips
    return;
  }
  if (Game.state === 'credits') {
    Game.creditsT = (Game.creditsT || 0) + dt;
    if (Game.creditsT > 4 && presses.length) {
      if (F.colossus) {                                  // the true ending: home to the Vale, world open
        Game.loadMap('vale', 13, 40); Game.state = 'play';
        Game.banner('Home again! The whole world is yours to roam — and SUPER RAMSI is here to stay.');
        Audio2.playSong('vale'); saveGame();
      } else { Game.state = 'title'; Audio2.playSong('title'); }
    }
    return;
  }
  if (Game.state === 'itemget') {
    if ((Game.itemGetData && Game.itemGetData.t > 0.6) &&
        (presses.includes(' ') || presses.includes('z') || presses.includes('Enter') || presses.includes('x'))) {
      Game.itemGetData = null; Game.state = 'play'; saveGame();
    }
    return;
  }
  if (Game.state === 'dialog') {
    if (presses.includes(' ') || presses.includes('z') || presses.includes('Enter')) {
      Game.dialog.lines.shift();
      if (!Game.dialog.lines.length) {
        const after = Game.dialog.after; Game.dialog = null; Game.state = 'play';
        if (after) after();
      }
    }
    return;
  }
  if (Game.state === 'cutscene') { Game.updateCutscene(dt, presses); return; }
  if (Game.state === 'menu') {
    const m = Game.menu;
    const nMoments = (Game.MIMI_MOMENTS ? Game.MIMI_MOMENTS.length : 20);
    for (const k of presses) {
      if (m.type === 'album' && m.zoom != null) {                 // ZOOM view: arrows flip, ESC backs out
        if (k === 'Escape' || k === 'x' || k === 'i') m.zoom = null;
        else if (k === 'ArrowLeft' || k === 'a') { m.zoom = (m.zoom + nMoments - 1) % nMoments; m.sel = m.zoom; }
        else if (k === 'ArrowRight' || k === 'd' || k === ' ' || k === 'z' || k === 'Enter') { m.zoom = (m.zoom + 1) % nMoments; m.sel = m.zoom; }
        continue;
      }
      if (k === 'Escape' || k === 'x' || (k === 'i' && (m.type === 'log' || m.type === 'album'))) { Game.menu = null; Game.state = 'play'; }
      else if (m.type === 'log') {   // YOUR PACK: every arrow flips pages (kid-simple)
        if (k === 'ArrowLeft' || k === 'a' || k === 'ArrowUp' || k === 'w') m.page = ((m.page || 0) + 2) % 3;
        else if (k === 'ArrowRight' || k === 'd' || k === 'ArrowDown' || k === 's' || k === ' ' || k === 'z' || k === 'Enter') m.page = ((m.page || 0) + 1) % 3;
      }
      else if (k === 'ArrowUp' || k === 'w') m.sel = Math.max(0, (m.sel || 0) - (m.type === 'album' ? 5 : 1));
      else if (k === 'ArrowDown' || k === 's') m.sel = Math.min((m.type === 'album' ? nMoments : (m.items ? m.items.length : 1)) - 1, (m.sel || 0) + (m.type === 'album' ? 5 : 1));
      else if (k === 'ArrowLeft' || k === 'a') m.sel = Math.max(0, (m.sel || 0) - 1);
      else if (k === 'ArrowRight' || k === 'd') m.sel = Math.min((m.type === 'album' ? nMoments : (m.items ? m.items.length : 1)) - 1, (m.sel || 0) + 1);
      else if (k === ' ' || k === 'z' || k === 'Enter') {
        if (m.type === 'album') { if (Game.flags.mimimoments && Game.flags.mimimoments[Game.MIMI_MOMENTS[m.sel].id]) m.zoom = m.sel; }
        else Game.menuConfirm();
      }
    }
    return;
  }
  if (Game.state === 'side') { SideScroll.update(dt, presses); return; }
  if (Game.state === 'ascent') { if (Game.updateAscent) Game.updateAscent(dt, presses); return; }
  if (Game.state === 'aviary') { if (Game.updateAviary) Game.updateAviary(dt, presses); return; }
  if (Game.state === 'burrowmap') { Game.updateBurrowMap(presses); return; }
  if (Game.state === 'world3map') {
    if (Game.world3Travel) { Game.updateWorld3Travel(dt); return; }   // Noah is walking the brass trail
    const ul3 = WORLD3_NODES.map(n => F.god || !n.req || Game.lookupFlag(n.req));
    for (const k of presses) {
      if (k === 'Escape') Game.state = 'play';
      else if (k === 'ArrowLeft' || k === 'a' || k === 'ArrowUp' || k === 'w') Game.world3Cursor = (Game.world3Cursor + WORLD3_NODES.length - 1) % WORLD3_NODES.length;
      else if (k === 'ArrowRight' || k === 'd' || k === 'ArrowDown' || k === 's') Game.world3Cursor = (Game.world3Cursor + 1) % WORLD3_NODES.length;
      else if ((k === ' ' || k === 'z' || k === 'Enter') && ul3[Game.world3Cursor]) {
        Game.world3Go(WORLD3_NODES[Game.world3Cursor]);
      }
    }
    return;
  }
  if (Game.state === 'worldmap') {
    if (Game.worldTravel) { Game.updateWorldTravel(dt); return; }   // Noah is walking the trail
    const unlocked = WORLD_NODES.map(n => F.god || !n.req || Game.lookupFlag(n.req));
    for (const k of presses) {
      if (k === 'Escape') Game.state = 'play';
      else if (F.god && (k === '6' || k === '7' || k === '8')) {
        SideScroll.start({ '6': 'bramble', '7': 'squall', '8': 'meteor' }[k], false); return;
      }
      else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'a' || k === 'w') Game.worldCursor = (Game.worldCursor + WORLD_NODES.length - 1) % WORLD_NODES.length;
      else if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'd' || k === 's') Game.worldCursor = (Game.worldCursor + 1) % WORLD_NODES.length;
      else if ((k === ' ' || k === 'z' || k === 'Enter') && unlocked[Game.worldCursor]) {
        Game.startWorldTravel(Game.worldCursor);
      }
    }
    return;
  }
  // ---- play state ----
  for (const k of presses) {
    if (Player.grab) break;                      // hands are full (grabbing a block)
    if (k === 'z') Player.useTool();
    else if (k === 'x') { if (!(Game.tryBounce && Game.tryBounce())) Player.jump(); }
    else if (k === 'c') { if (Game.ramsiCommand) Game.ramsiCommand(); }
    else if (k === ' ') Game.interact();
    else if (k === 'i') { Game.menu = { type: 'log', page: 0 }; Game.state = 'menu'; }
    else if (k === 'Escape') { if (Game.map.zone === 'sky' && !F.parents && !F.playtest) Game.toast("The storm winds won't let you turn back — CLIMB!"); else if (Game.map.zone === 'city') { Game.state = 'world3map'; Game.world3Cursor = Game.world3Here(); } else if (Game.map.zone === 'burrow') { Game.state = 'burrowmap'; Game.burrowCursor = Game.burrowHere(); } else { Game.state = 'worldmap'; Game.worldCursor = Math.max(0, WORLD_NODES.findIndex(n => n.id === (Game.map.zone || 'vale'))); } }
    else if (k === 'p') { const on = Audio2.toggle(); Game.toast(on ? 'music ON' : 'music OFF'); }
    else if (k === 'k') { if (Game.Gamepad) Game.Gamepad.openSetup(); }
    else if (k === 'u') {
      if (!F.suit) Game.toast('No wetsuit yet — Salty Sal trades one for a SHARK!');
      else if (Player.swimming || Game.map.underwater) Game.toast('Not while you are WET!');
      else { Player.wearingSuit = !Player.wearingSuit; Audio2.jingle('cage'); Game.toast(Player.wearingSuit ? 'Wetsuit ON. Stylish AND practical.' : 'Back to the camo tee!'); }
    }
    else if (k === 'b') { Player.tool = 'cage'; if (F.cage) Game.openBaitMenu(); }
    else if ('12345'.includes(k)) { const t = ['mitts', 'net', 'harpoon', 'cage', 'bone'][+k - 1]; Player.tool = t; }
    else if (k === 'q' || k === 'e') {
      const order = ['mitts', 'net', 'harpoon', 'cage', 'bone'];
      let idx = order.indexOf(Player.tool);
      idx = (idx + (k === 'e' ? 1 : order.length - 1)) % order.length;
      Player.tool = order[idx];
    }
  }
  if (Game._pendingIntro && Game.state === 'play' && !Game.dialog && !Game.menu && Game._pendingIntro === Game.mapId) {
    const iid = Game._pendingIntro; Game._pendingIntro = null; Game.flags['intro_' + iid] = true;
    const g = Game.map.objects.find(o => o.type === 'npc'), sg = Game.map.objects.find(o => o.type === 'sign');
    if (g) Game.talkTo(g);
    else if (sg) { Audio2.jingle('talk'); Game.dialog = { name: 'Sign', who: null, lines: [sg.text] }; Game.state = 'dialog'; }
  }
  Player.update(Game.map, dt);
  if (Game.updateZip) Game.updateZip(dt);   // zip-wires carry Noah along their cable
  Game.autoPickups();         // berries & star shards collect on walk-over
  // warp pads: step on to launch (gated by catching every Wastes alien; anti-bounce on arrival)
  {
    const [wfi, wfj] = Player.footTile();
    if (Player.lastWarpTile && (Player.lastWarpTile[0] !== wfi || Player.lastWarpTile[1] !== wfj)) Player.lastWarpTile = null;
    if (!Player.lastWarpTile) for (const o of Game.map.objects) {
      if (o.type === 'warp' && o.x === wfi && o.y === wfj) {
        if (Game.map.id === 'wastes' && (F.life_alien || 0) < WASTES_ALIEN_QUOTA) {
          if (Game.time - (Game.warpMsgT || 0) > 2) { Game.warpMsgT = Game.time; Game.toast('The warp pads are DEAD — catch ALL the aliens to power them!'); }
          break;
        }
        Player.x = o.tx * TILE + 8; Player.y = o.ty * TILE + 12; Player.lastWarpTile = [o.tx, o.ty];
        Audio2.jingle('dive'); Particles.burst(Player.x, Player.y, 'sparkle');
        if (!F.mimi_warpgag && Game.companionActive && Game.companionActive() && Game.MIMI_MOMENTS) {
          F.mimi_warpgag = 1;
          const M = Game.MIMI_MOMENTS.find((x) => x.id === 'warp_lost');
          if (M) Game.fireMimiMoment(M);                       // "Noah, where did you GO!!" -> then she flies after you
        }
        break;
      }
    }
  }
  Game.updateAsteroids(dt);   // ride the Astral Drift's moving asteroids
  if (Game.updateCompanion) Game.updateCompanion(dt);   // Ramsi tags along in World 2
  // portals: step on to travel to another map
  { const [pi, pj] = Player.footTile(); for (const o of Game.map.objects) if (o.type === 'portal' && o.x === pi && o.y === pj && (!o.req || Game.lookupFlag(o.req))) { if (o.to === 'world3map') { Game.state = 'world3map'; Game.world3Cursor = Game.world3Here ? Game.world3Here() : 0; } else Game.loadMap(o.to, o.tx, o.ty); saveGame(); break; } }
  // door bumping
  {
    const [dx, dy] = DIRS[Player.dir];
    const ti = ((Player.x + dx * 11) / TILE) | 0, tj = ((Player.y + dy * 9) / TILE) | 0;
    if ((TILEDEFS[tileAt(Game.map, ti, tj)] || {}).door && (keyHeld('ArrowUp') || keyHeld('ArrowDown') || keyHeld('ArrowLeft') || keyHeld('ArrowRight') || keyHeld('w') || keyHeld('a') || keyHeld('s') || keyHeld('d')))
      Game.tryDoor(Game.map, ti, tj);
  }
  // links (map transitions)
  {
    const [fi, fj] = Player.footTile();
    for (const L of Game.map.links) {
      if (L.req && !Game.lookupFlag(L.req)) continue;
      if (L.x === fi && L.y === fj) {
        // LEVEL 1 EXIT: the Gauntlet door opens into THE CLIFFSIDE CROSSING (the
        // climbing sub-level); ITS far exit surfaces on the WORLD MAP so Noah still
        // walks the trail to the coast (which springs the road ambush between zones).
        if (Game.map.id === 'vale' && L.to === 'coast') {
          Game.loadMap('crags', 2, 20);
          Game.banner('THE CLIFFSIDE CROSSING — the Vale tumbles down to the SEA. Onward and UPWARD!');
          saveGame(); return;
        }
        if (Game.map.id === 'crags' && L.to === 'coast') {
          if (!F.coastPath) { F.coastPath = true; Game.banner('CROSSING CONQUERED! Now WALK the trail to Sunsplash Coast on the World Map!'); }
          else Game.toast('To the World Map — walk the trail onward!');
          Game.state = 'worldmap';
          Game.worldCursor = Math.max(0, WORLD_NODES.findIndex(n => n.id === 'coast'));
          Audio2.playSong('title'); saveGame(); return;
        }
        Game.loadMap(L.to, L.tx, L.ty); saveGame(); return;
      }
    }
  }
  // creatures
  for (const c of Game.creatures) {
    updateCreature(c, Game.map, dt, Player);
    if (c.state === 'trapped') {
      if (c.trapTimer === undefined) c.trapTimer = 0.9;
      c.trapTimer -= dt;
      if (c.trapTimer <= 0) {
        const idx = Game.map.objects.indexOf(c.trapAt);
        if (idx >= 0) Game.map.objects.splice(idx, 1);
        Game.capture(c, 'cage');
      }
    }
    const def = CREATURES[c.species];
    if (def.sting && !c.display && c.state !== 'gone' && c.state !== 'trapped' && c.stun <= 0 && Player.inv <= 0 && !(Game.companion && Game.companion.decoyT > 0) && dist(c.x, c.y, Player.x, Player.y) < 10) Player.hurt(Math.max(1, Math.round(def.sting * 2 * (Game.map.feral || 1))));
  }
  // flying nets
  for (let i = Game.flyingNets.length - 1; i >= 0; i--) {
    const n = Game.flyingNets[i];
    n.x += n.vx * dt; n.y += n.vy * dt; n.life -= dt;
    const r = 10 + ((F.upg_net || 0) >= 3 ? 6 : 0);
    if (Game.checkToolCatch('net', n.x, n.y, r) || n.life <= 0) Game.flyingNets.splice(i, 1);
  }
  // switches (block puzzles)
  {
    const m = Game.map;
    // staged puzzle rooms: each switch drives ONE machine (wall / bridge / gate)
    if (m.puzzle) {
      for (const pz of m.puzzle) {
        if (F.switchFlags[pz.flag]) continue;
        const on = m.objects.some(o => o.type === 'block' && o.x === pz.sw[0] && o.y === pz.sw[1]);
        if (!on) continue;
        F.switchFlags[pz.flag] = true;
        Game.applyPuzzle(m, pz);
        Audio2.jingle(pz.jingle || 'door');
        Game.banner(pz.msg || 'CLICK! Something moves...');
        Particles.burst(pz.sw[0] * TILE + 8, pz.sw[1] * TILE + 8, 'sparkle');
        for (const [ti, tj] of pz.tiles || []) { Particles.burst(ti * TILE + 8, tj * TILE + 8, 'dust'); Particles.burst(ti * TILE + 8, tj * TILE + 8, 'sparkle'); }
        saveGame();
      }
    } else if (m.dungeon) {
      const flagKey = 'sw_' + m.id;
      if (!F.switchFlags[flagKey]) {
        let switches = [], covered = 0;
        for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) if (m.tiles[j][i] === 'switch') switches.push([i, j]);
        for (const [si, sj] of switches) {
          let on = false;
          for (const o of m.objects) if (o.type === 'block' && o.x === si && o.y === sj) on = true;
          if (!m.switchesNeedBlocks) {           // some rooms only respect STONE on the switch
            const [fi, fj] = Player.footTile();
            if (fi === si && fj === sj) on = true;
          }
          if (on) covered++;
        }
        if (switches.length && covered === switches.length) {
          F.switchFlags[flagKey] = true; Audio2.jingle('door'); Game.banner('CLICK! A door slides open somewhere...'); saveGame();
        }
      }
    }
    // (block movement is now POWER-BRACERS grab push/pull — see Player.updateGrab)
  }
  if (Game.revealOpenedDoors) Game.revealOpenedDoors(Game.map);   // any door a switch just opened VISIBLY vanishes (puff + clunk)
  // solid objects: nudge player out
  for (const o of Game.map.objects) {
    if (o === Player.grab) continue;
    if (o.type === 'block' || o.type === 'npc' || (o.type === 'chest' && !Game.flags.openedChests[o.id]) || o.type === 'prop') {
      const bx = o.x * TILE + 8, by = o.y * TILE + 8;
      const dd = dist(Player.x, Player.y, bx, by);
      const rad = o.type === 'prop' ? 14 : 10;
      if (dd < rad && dd > 0.01) {
        Player.x += (Player.x - bx) / dd * (rad - dd);
        Player.y += (Player.y - by) / dd * (rad - dd);
      }
    }
  }
  Bosses.update(dt);
  Particles.update(dt);
  if (Game.map.id === 'deep') Game.map.gateOpen = Game.map.gateOpen || Game.seaCount() >= 8;
  // win sequence
  if (Game.winT > 0) {
    Game.winT -= dt;
    if (Game.winT <= 0) {
      if (Game.winKind === 'ramsi') { Game.winKind = null; Game.loadMap('sky1'); Game.state = 'play'; saveGame(); }
      else if (Game.winKind === 'parents' && Game.startCutscene) { Game.winKind = null; Game.startCutscene(Game.REUNION, function () {
        Game.loadMap('vale', 24, 22); Game.state = 'play';
        Game.banner('HOME AT LAST! ...but the meadow RUMBLES. GNASH has torn a BURROW in the grass — the PILLOW-KIN need you! (Step into the burrow!)');
        Audio2.playSong('vale'); saveGame();
      }); }
      else { Game.state = 'credits'; Game.creditsT = 0; saveGame(); }
    }
  }
  // autosave
  Game.saveT = (Game.saveT || 0) + dt;
  if (Game.saveT > 3) { Game.saveT = 0; saveGame(); }
}

// ---------- render ----------
function render(dtForUi) {
  const c = ctx;
  c.save();
  try {
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#1a1426'; c.fillRect(0, 0, SW, SH);
    if (Game.state === 'padsetup') { if (Game.Gamepad) Game.Gamepad.drawSetup(c); return; }
    if (Game.state === 'title') { UI.drawTitle(c); return; }
    if (Game.state === 'intro') { UI.drawIntro(c, Game.introT || 0); return; }
    if (Game.state === 'side') { SideScroll.draw(c); UI.drawBannersToasts(c, dtForUi); return; }
    if (Game.state === 'ascent') { if (Game.drawAscent) Game.drawAscent(c); UI.drawBannersToasts(c, dtForUi); if (Game.state === 'itemget') UI.drawItemGet(c, dtForUi); return; }
    if (Game.state === 'aviary') { if (Game.drawAviary) Game.drawAviary(c); UI.drawBannersToasts(c, dtForUi); if (Game.state === 'itemget') UI.drawItemGet(c, dtForUi); return; }
    if (Game.state === 'cutscene') { Game.drawCutscene(c); return; }
    if (Game.state === 'credits') { UI.drawCredits(c, Game.creditsT || 0); return; }
    if (Game.state === 'world3map') { UI.drawWorld3Map(c); UI.drawPanel(c); return; }
    if (Game.state === 'burrowmap') { UI.drawBurrowMap(c); UI.drawPanel(c); return; }
    if (Game.state === 'worldmap') { UI.drawWorldMap(c); UI.drawPanel(c); return; }
    const map = Game.map; if (!map) return;
    const Z = map.viewScale || 1, VWv = VW / Z, VHv = VH / Z;     // per-map camera zoom (Z<1 = pull back, more sky)
    const camX = clamp(Player.x - VWv / 2, 0, Math.max(0, map.w * TILE - VWv));
    const camY = clamp(Player.y - VHv / 2, -(map.topPad || 0), Math.max(0, map.h * TILE - VHv));
    Game.camX = camX; Game.camY = camY; Game.viewScale = Z;
    c.save();
    c.beginPath(); c.rect(0, 0, VW, VH); c.clip();
    if (Z !== 1) c.scale(Z, Z);
    c.translate(-Math.round(camX), -Math.round(camY));
    // gather drawables by foot row (row-interleaved with terrain for occlusion)
    const rows = {};
    const addRow = (j, fn) => { (rows[j] = rows[j] || []).push(fn); };
    for (const o of map.objects) {
      const j = o.y, ox = o.x * TILE, oy = o.y * TILE, e = Math.min(elevAt(map, o.x, o.y), 8) * EOFF;
      if (Game.OBJDRAW && Game.OBJDRAW[o.type]) addRow(j, () => Game.OBJDRAW[o.type](c, o, ox, oy, e));
      else if (o.type === 'chest') addRow(j, () => {
        const spr = Game.flags.openedChests[o.id] ? Sprites.props.chestOpen : Sprites.props.chest;
        const bx = ox + sprW(spr) / 2, by = oy - e + 4 + sprH(spr);   // render 1.5x from the chest's base
        c.save(); c.translate(bx, by); c.scale(CHEST_DRAW_SCALE, CHEST_DRAW_SCALE); c.translate(-bx, -by);
        dspr(c, spr, ox, oy - e + 4);
        c.restore();
      });
      else if (o.type === 'sign') addRow(j, () => dspr(c, Sprites.props.sign, ox, oy - e + 2));
      else if (o.type === 'post') addRow(j, () => dspr(c, (map.zone === 'city' && Sprites.props && Sprites.props.anchor) ? Sprites.props.anchor : Sprites.props.post, ox, oy - e + 2));
      else if (o.type === 'decor' && Sprites.props && Sprites.props[o.sprite]) addRow(j, () => { const sp = Sprites.props[o.sprite]; dspr(c, sp, ox + 8 - sprW(sp) / 2, oy - e + 14 - sprH(sp)); });
      else if (o.type === 'buoy') addRow(j, () => dspr(c, Sprites.props.buoy, ox, oy - e + Math.sin(Game.time * 2 + o.x) * 1.5 + 2));
      else if (o.type === 'bubble') addRow(j, () => {
        // bright rising bubble column — a clearly readable way UP
        c.fillStyle = 'rgba(150,225,255,.22)'; c.beginPath(); c.arc(ox + 8, oy + 8, 12, 0, 7); c.fill();
        for (let k = 0; k < 6; k++) {
          const bx = ox + 8 + Math.sin(Game.time * 2 + k * 1.7) * 4;
          const by = oy + 14 - ((Game.time * 22 + k * 7) % 30);
          c.fillStyle = 'rgba(225,248,255,.85)'; c.beginPath(); c.arc(bx, by, 1.5 + (k % 3), 0, 7); c.fill();
          c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke();
        }
        const pulse = 0.5 + 0.5 * Math.sin(Game.time * 5);
        c.fillStyle = '#cdeeff'; c.strokeStyle = '#15486a'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(ox + 8, oy + 1 - pulse * 2); c.lineTo(ox + 3, oy + 8); c.lineTo(ox + 13, oy + 8); c.closePath(); c.fill(); c.stroke();
        drawText(c, 'UP', ox + 8, oy + 9, 7, '#fff', '#15486a', 'center');
      });
      else if (o.type === 'cageSet') addRow(j, () => { dspr(c, Sprites.props.cage, ox + 1, oy - e + 4); dspr(c, Sprites.items[o.bait === 'tincan' ? 'tincan' : o.bait === 'clover' ? 'clover' : o.bait === 'cookie' ? 'cookie' : o.bait === 'berry' ? 'berry' : 'fishsnack'], ox + 5, oy - e + 6); });
      else if (o.type === 'block') addRow(j, () => {
        const B = Sprites.tallBlock;
        let bx2 = ox, by2 = oy;
        if (o.slideFrom) {
          const p = Math.min(1, (Game.time - o.slideStart) / 0.2);
          const ee2 = p * p * (3 - 2 * p);
          bx2 = lerp(o.slideFrom[0] * TILE, ox, ee2); by2 = lerp(o.slideFrom[1] * TILE, oy, ee2);
          if (p >= 1) o.slideFrom = null;
        }
        c.fillStyle = 'rgba(20,10,40,.3)'; c.beginPath(); c.ellipse(bx2 + 8, by2 - e + 15, 7, 2.4, 0, 0, 7); c.fill();
        dspr(c, B, bx2 + 8 - sprW(B) / 2, by2 - e + 16 - sprH(B));
      });
      else if (o.type === 'shard') { if (!Game.flags.shards[o.id]) addRow(j, () => { const fl = Math.sin(Game.time * 4 + o.x) * 2; c.save(); c.translate(ox + 5, oy - e + 4 + fl); c.scale(2, 2); dspr(c, Sprites.items.shard, 0, 0); c.restore(); }); }
      else if (o.type === 'berry') { if (!Game.flags.berries[o.id]) addRow(j, () => { const fl = Math.sin(Game.time * 3 + o.x) * 1.5; c.save(); c.translate(ox + 4, oy - e + 4 + fl); c.scale(1.6, 1.6); dspr(c, Sprites.items.berry, 0, 0); c.restore(); }); }
      else if (o.type === 'starcell') { if (!Game.flags.starcells[o.id]) addRow(j, () => {
        const fl = Math.sin(Game.time * 4 + o.x) * 2, cx = ox + 8, cy = oy - e + 6 + fl;
        for (let r = 0; r < 2; r++) { c.strokeStyle = 'rgba(120,230,255,' + (0.35 + 0.3 * Math.sin(Game.time * 3 + r)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 6 + r * 3, Game.time * 2 + r, Game.time * 2 + r + 4.6); c.stroke(); }
        c.fillStyle = '#ffd95a'; c.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; c.lineTo(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5); const a2 = a + Math.PI / 5; c.lineTo(cx + Math.cos(a2) * 2.2, cy + Math.sin(a2) * 2.2); } c.closePath(); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 1.6, 0, 7); c.fill(); c.lineWidth = 1;
      }); }
      else if (o.type === 'prop') addRow(j, () => {
        const spr = Sprites.props[o.sprite]; if (!spr) return;
        const sc = o.sprite === 'saucer' ? 2 : 1.4;
        if (o.sprite === 'crystal' || o.sprite === 'beacon') {
          const gl = 0.4 + 0.3 * Math.sin(Game.time * 3 + o.x);
          c.fillStyle = 'rgba(120,230,255,' + (0.18 * gl) + ')'; c.beginPath(); c.arc(ox + 8, oy + 6, 12, 0, 7); c.fill();
        }
        c.save(); c.translate(ox + 8 - sprW(spr) * sc / 2, oy + 14 - sprH(spr) * sc); c.scale(sc, sc); dspr(c, spr, 0, 0); c.restore();
      });
      else if (o.type === 'ramsi') addRow(j, () => {
        if (Game.flags.ramsi && o.vale) return;          // rescued: gone from the vale vision
        const spr = Sprites.ramsi, bob = Math.sin(Game.time * 2 + o.x) * 1.5;
        const px2 = ox + 8 - sprW(spr) / 2, py2 = oy + 14 - sprH(spr) + bob - e;   // honor the island's elevation
        if (o.vale) { c.globalAlpha = 0.65 + 0.15 * Math.sin(Game.time * 3); }   // shimmering vision
        dspr(c, spr, px2, py2);
        c.globalAlpha = 1;
        if (!Game.flags.ramsi) { dspr(c, Sprites.ramsiCage, ox + 8 - sprW(Sprites.ramsiCage) / 2, py2 - 2); }
        if (o.roost && !Game.flags.ramsi && dist(Player.x, Player.y, ox + 8, oy + 8) < 26) drawText(c, 'SPACE: FREE!', ox - 12, py2 - 12, 7, '#f8e858', '#241a33');
        if (Game.flags.ramsi && o.roost) drawText(c, 'FREE!', ox + 8, py2 - 10, 8, '#f8e858', '#241a33', 'center');
      });
      else if (o.type === 'lever') addRow(j, () => {
        const lx = ox + 8, ly = oy + 11 - e;
        c.fillStyle = '#241a33'; c.fillRect(lx - 5, ly - 2, 10, 6);
        c.fillStyle = '#3a2c50'; c.fillRect(lx - 4, ly - 1, 8, 4);
        c.strokeStyle = o.on ? '#58c452' : '#e84a4a'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + (o.on ? 5 : -5), ly - 9); c.stroke();
        c.fillStyle = o.on ? '#58c452' : '#e84a4a'; c.beginPath(); c.arc(lx + (o.on ? 5 : -5), ly - 9, 2.6, 0, 7); c.fill();
        c.lineWidth = 1;
      });
      else if (o.type === 'portal') addRow(j, () => {
        const px = ox + 8, py = oy + 8 - e, locked = o.req && !Game.lookupFlag(o.req);
        if (o.secret && locked) return;   // hidden until its requirement is met
        if (o.plain) { if (dist(Player.x, Player.y, ox + 8, oy + 8) < 26) drawText(c, locked ? 'LOCKED' : 'STEP IN', ox - 8, oy - e - 12, 7, locked ? '#f89238' : '#f8e858', '#241a33'); return; }   // bespoke art (e.g. cog gate / burrow mouth) draws its own look
        c.globalAlpha = locked ? 0.4 : 1;
        for (let r = 0; r < 3; r++) { c.strokeStyle = 'rgba(180,120,240,' + (0.4 + 0.3 * Math.sin(Game.time * 3 + r * 1.3)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(px, py, 5 + r * 3, Game.time * 2 + r, Game.time * 2 + r + 4.2); c.stroke(); }
        c.fillStyle = 'rgba(140,90,220,.45)'; c.beginPath(); c.arc(px, py, 7, 0, 7); c.fill();
        c.globalAlpha = 1; c.lineWidth = 1;
        if (dist(Player.x, Player.y, ox + 8, oy + 8) < 26) drawText(c, locked ? 'LOCKED' : 'STEP IN', ox - 8, oy - e - 12, 7, locked ? '#f89238' : '#f8e858', '#241a33');
      });
      else if (o.type === 'ramswitch') addRow(j, () => {
        const sx = ox + 8, sy = oy + 6 - e, on = o.on || Game.lookupFlag(o.flag);
        c.fillStyle = '#2a2440'; c.fillRect(sx - 7, sy - 1, 14, 7);
        c.fillStyle = on ? '#7ef0a0' : '#f8e858'; c.beginPath(); c.arc(sx, sy - 1, on ? 2.5 : 4, 0, 7); c.fill();
        c.strokeStyle = '#9adcf8'; c.lineWidth = 1; c.beginPath(); c.arc(sx, sy - 1, 6.5, 0, 7); c.stroke();
        if (!on && dist(Player.x, Player.y, ox + 8, oy + 8) < 30) drawText(c, 'RAMSI!', ox - 4, oy - e - 12, 7, '#f8e858', '#241a33');
      });
      else if (o.type === 'poundplate') addRow(j, () => {
        const on = o.on || Game.lookupFlag(o.flag), cx = ox + 8, cy = oy + 9 - e;
        c.fillStyle = '#4a3c28'; c.fillRect(cx - 9, cy - 5, 18, 10);
        c.fillStyle = on ? '#6a5a3a' : '#caa44a'; c.fillRect(cx - 7, cy - (on ? 2 : 4), 14, on ? 4 : 7);
        for (let k = -6; k <= 6; k += 4) { c.fillStyle = on ? '#5a4a32' : '#e8cc66'; c.fillRect(cx + k - 1, cy - (on ? 3 : 5), 2, 2); }
        c.strokeStyle = '#241a33'; c.lineWidth = 1; c.strokeRect(cx - 9, cy - 5, 18, 10);
        if (!on && dist(Player.x, Player.y, ox + 8, oy + 8) < 34) drawText(c, 'C: POUND!', cx - 18, oy - e - 12, 7, '#f8e858', '#241a33');
      });
      else if (o.type === 'gear') addRow(j, () => {
        const gx = ox + 8 + (o.dx || 0), gy = oy + 8 - e + (o.dy || 0), R = o.r || 10, teeth = o.teeth || 8;
        const ang = Game.time * (o.speed || 0.5) * (o.dir || 1);
        c.save(); c.translate(gx, gy); c.rotate(ang);
        c.fillStyle = o.col2 || '#7a5a1c';
        for (let k = 0; k < teeth; k++) { c.save(); c.rotate(k * Math.PI * 2 / teeth); c.fillRect(-2, -R - 3, 4, 5); c.restore(); }
        c.fillStyle = o.col || '#caa044'; c.beginPath(); c.arc(0, 0, R, 0, 7); c.fill();
        c.strokeStyle = o.col2 || '#7a5a1c'; c.lineWidth = 2;
        for (let k = 0; k < 5; k++) { c.save(); c.rotate(k * Math.PI * 2 / 5); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -R * 0.62); c.stroke(); c.restore(); }
        c.fillStyle = o.col2 || '#7a5a1c'; c.beginPath(); c.arc(0, 0, R * 0.4, 0, 7); c.fill();
        c.fillStyle = '#241a33'; c.beginPath(); c.arc(0, 0, R * 0.16, 0, 7); c.fill();
        c.restore(); c.lineWidth = 1;
      });
      else if (o.type === 'clock') addRow(j, () => {
        const cx = ox + 8, cy = oy + 8 - e, R = o.r || 24;
        const art = (typeof Sprites !== 'undefined' && Sprites.props) ? Sprites.props.clockface : null;
        if (art && art.width) {                                              // HD clock face art (if present)
          const s2 = (R + 4) * 2 / art.width;
          try { c.drawImage(art, cx - art.width * s2 / 2, cy - art.height * s2 / 2, art.width * s2, art.height * s2); } catch (e2) {}
        } else {                                                             // procedural brass clock face
          c.fillStyle = '#241a33'; c.beginPath(); c.arc(cx, cy + 1, R + 4, 0, 7); c.fill();
          c.fillStyle = '#3a2c16'; c.beginPath(); c.arc(cx, cy, R + 3, 0, 7); c.fill();
          c.fillStyle = '#caa044'; c.beginPath(); c.arc(cx, cy, R + 1.5, 0, 7); c.fill();
          c.fillStyle = '#e6c878'; c.beginPath(); c.arc(cx, cy, R + 1.5, -2.3, -0.7); c.fill();    // lit brass arc
          c.fillStyle = '#f4ead2'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();                // ivory face
          c.fillStyle = 'rgba(180,150,120,.22)'; c.beginPath(); c.arc(cx, cy + R * 0.2, R * 0.92, 0, 7); c.fill();
          c.fillStyle = '#3a2c16';
          for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, big = (k % 3 === 0); c.save(); c.translate(cx, cy); c.rotate(a); c.fillRect(-(big ? 1.5 : 1), -R + 1.5, big ? 3 : 2, big ? 5 : 3); c.restore(); }
        }
        const mm = Game.time * 0.6, hh = mm / 12;                            // hands sweep so the clock is clearly RUNNING
        c.strokeStyle = '#241a33'; c.lineCap = 'round';
        c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(hh - Math.PI / 2) * R * 0.5, cy + Math.sin(hh - Math.PI / 2) * R * 0.5); c.stroke();
        c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(mm - Math.PI / 2) * R * 0.8, cy + Math.sin(mm - Math.PI / 2) * R * 0.8); c.stroke();
        c.lineCap = 'butt'; c.lineWidth = 1;
        c.fillStyle = '#caa044'; c.beginPath(); c.arc(cx, cy, 2.6, 0, 7); c.fill();
        c.fillStyle = '#241a33'; c.beginPath(); c.arc(cx, cy, 1.2, 0, 7); c.fill();
      });
      else if (o.type === 'gearsocket') addRow(j, () => {
        const sx = ox + 8, sy = oy + 9 - e, started = Game.lookupFlag('cog_started'), ready = Game.lookupFlag('cog_cleared') && !started;
        c.fillStyle = '#3a2c18'; c.beginPath(); c.arc(sx, sy, 9, 0, 7); c.fill();
        c.fillStyle = '#5a4628'; c.beginPath(); c.arc(sx, sy, 7.5, 0, 7); c.fill();
        if (started) { const ang = Game.time * 1.2; c.save(); c.translate(sx, sy); c.rotate(ang); c.fillStyle = '#e6c060';
          for (let k = 0; k < 8; k++) { c.save(); c.rotate(k * Math.PI / 4); c.fillRect(-1.5, -8, 3, 3); c.restore(); }
          c.beginPath(); c.arc(0, 0, 6, 0, 7); c.fill(); c.fillStyle = '#7a5a1c'; c.beginPath(); c.arc(0, 0, 2.5, 0, 7); c.fill(); c.restore();
        } else {
          c.fillStyle = ready ? 'rgba(255,225,90,' + (0.4 + 0.3 * Math.sin(Game.time * 4)) + ')' : '#241a33'; c.beginPath(); c.arc(sx, sy, 4.5, 0, 7); c.fill();
          for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.fillStyle = '#caa044'; c.fillRect(sx + Math.cos(a) * 7 - 1, sy + Math.sin(a) * 7 - 1, 2, 2); }
        }
        if (!started && dist(Player.x, Player.y, ox + 8, oy + 8) < 28) drawText(c, ready ? 'SPACE: SOCKET GEAR' : 'CLEAR THE CITY FIRST', sx - 34, oy - e - 12, 7, ready ? '#f8e858' : '#f89238', '#241a33');
      });
      else if (o.type === 'bouncepad') addRow(j, () => {
        const px = ox + 8, py = oy + 12 - e, blocked = o.req && !Game.lookupFlag(o.req);
        c.globalAlpha = blocked ? 0.4 : 1;
        c.fillStyle = '#241a33'; c.fillRect(px - 1, py - 6, 3, 6);
        c.fillStyle = '#e8589a'; c.beginPath(); c.ellipse(px, py - 6, 7, 4, 0, 0, 7); c.fill();
        c.fillStyle = '#ff90c0'; c.beginPath(); c.ellipse(px - 2, py - 7, 2.4, 1.4, 0, 0, 7); c.fill();
        c.fillStyle = '#241a33'; c.fillRect(px - 4, py - 6, 1, 1); c.fillRect(px + 3, py - 6, 1, 1);
        c.globalAlpha = 1;
        const [fi, fj] = Player.footTile();
        if (fi === o.x && fj === o.y) { if (blocked) drawText(c, 'JAMMED', px - 14, py - 18, 7, '#f89238', '#241a33');
          else if (Game.flags.ramBounce && Game.companionActive && Game.companionActive()) drawText(c, 'X: BOUNCE!', px - 20, py - 18, 7, '#f8e858', '#241a33'); }
      });
      else if (o.type === 'glidevent') addRow(j, () => {
        const px = ox + 8, py = oy + 8 - e;
        for (let k = 0; k < 3; k++) { const yy = py + 6 - ((Game.time * 30 + k * 9) % 18); c.fillStyle = 'rgba(180,230,255,.5)'; c.fillRect(px - 4 + k * 4, yy, 1, 4); }
        c.strokeStyle = 'rgba(150,210,245,.7)'; c.lineWidth = 1; c.beginPath(); c.arc(px, py, 7, 0, 7); c.stroke();
        if (o.to) { const lx = o.to[0] * TILE + 8, ly = o.to[1] * TILE + 10; c.strokeStyle = 'rgba(150,210,245,.4)'; c.beginPath(); c.arc(lx, ly, 6, 0, 7); c.stroke(); }
        if (Game.flags.ramGlide && Game.companionActive && Game.companionActive() && dist(Player.x, Player.y, ox + 8, oy + 8) < 24) drawText(c, 'C: GLIDE!', px - 16, py - 16, 7, '#f8e858', '#241a33');
      });
      else if (o.type === 'pillowkin') addRow(j, () => {
        const caged = o.caged && !Game.flags['kin_' + o.kin];
        const px = ox + 8, py = oy + 13 - e, bob = Math.sin(Game.time * 3 + o.x) * 1.4;
        const kspr = Sprites.npcs && Sprites.npcs['kin' + o.kin];
        c.save(); c.translate(px, py + bob);
        c.fillStyle = 'rgba(20,10,40,.3)'; c.beginPath(); c.ellipse(0, 1, 6, 2.2, 0, 0, 7); c.fill();
        if (kspr) { dspr(c, kspr, -sprW(kspr) / 2, 1 - sprH(kspr)); }
        else {
          const col = o.color || '#f29ad0';
          c.fillStyle = '#241a33'; c.beginPath(); c.arc(0, -5, 7.2, 0, 7); c.fill();
          c.fillStyle = col; c.beginPath(); c.arc(0, -5, 6.2, 0, 7); c.fill();
          c.fillStyle = col; c.beginPath(); c.arc(-4, -11, 2.6, 0, 7); c.arc(4, -11, 2.6, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.arc(-2, -7, 1.6, 0, 7); c.fill();
          c.fillStyle = '#241a33'; c.fillRect(-3, -6, 1.6, 1.6); c.fillRect(2, -6, 1.6, 1.6);
          if (caged) { c.fillStyle = '#241a33'; c.fillRect(-2, -3, 4, 1); }
          else { c.strokeStyle = '#241a33'; c.lineWidth = 1; c.beginPath(); c.arc(0, -3.5, 2, 0.15, 2.99); c.stroke(); c.lineWidth = 1; }
        }
        c.restore();
        if (caged) {
          c.strokeStyle = '#cfcfe8'; c.lineWidth = 1.4;
          for (let bx = -7; bx <= 7; bx += 3.5) { c.beginPath(); c.moveTo(px + bx, py - 14); c.lineTo(px + bx, py + 1); c.stroke(); }
          c.lineWidth = 1;
          if (dist(Player.x, Player.y, ox + 8, oy + 8) < 28) drawText(c, 'SPACE: FREE!', px - 22, py - 23, 7, '#f8e858', '#241a33');
        } else if (dist(Player.x, Player.y, ox + 8, oy + 8) < 30) drawText(c, 'FREED!', px - 12, py - 21, 7, '#7ef0a0', '#241a33');
      });
      else if (o.type === 'boneswitch') addRow(j, () => {
        const on = o.on || Game.lookupFlag(o.flag), sx = ox + 8, sy = oy + 7 - e;
        c.fillStyle = '#2a2440'; c.beginPath(); c.arc(sx, sy, 7, 0, 7); c.fill();
        c.strokeStyle = on ? '#7ef0a0' : '#e8b048'; c.lineWidth = 2; c.beginPath(); c.arc(sx, sy, 7, 0, 7); c.stroke(); c.lineWidth = 1;
        c.fillStyle = on ? '#7ef0a0' : '#e8b048'; c.fillRect(sx - 3, sy - 1, 6, 2); c.fillRect(sx - 1, sy - 3, 2, 6);
        if (!on && Game.flags.bone && dist(Player.x, Player.y, ox + 8, oy + 8) < 60) drawText(c, 'BONE it!', sx - 12, sy - 14, 7, '#f8e858', '#241a33');
      });
      else if (o.type === 'ramhole') addRow(j, () => {
        const done = Game.lookupFlag(o.flag);
        const px = ox + 8, py = oy + 9 - e;
        c.fillStyle = '#0a0603'; c.beginPath(); c.ellipse(px, py, 5.5, 4, 0, 0, 7); c.fill();
        c.fillStyle = '#1a0f06'; c.beginPath(); c.ellipse(px, py - 0.5, 4, 2.8, 0, 0, 7); c.fill();
        c.strokeStyle = '#5a3c1e'; c.lineWidth = 1; c.beginPath(); c.ellipse(px, py, 5.5, 4, 0, 0, 7); c.stroke();
        const near = Game.companionActive && Game.companionActive() && Game.flags.ramShrink && dist(Player.x, Player.y, ox + 8, oy + 8) < 30;
        if (!done && near) drawText(c, 'C: RAMSI!', px - 16, py - 16, 7, '#f8e858', '#241a33');
        else if (done) drawText(c, 'open', px - 8, py - 14, 6, '#7ef0a0', '#241a33');
      });
      else if (o.type === 'parents') addRow(j, () => {
        const px = ox + 8, py = oy + 14 - e, freed = Game.flags.parents;
        const art = freed ? (Sprites.parentsFree || Sprites.parents) : Sprites.parents;
        if (art) { dspr(c, art, px - sprW(art) / 2, oy + 16 - e - sprH(art)); }
        else {
        c.fillStyle = '#3a6ea5'; c.fillRect(px - 7, py - 12, 6, 12); c.fillStyle = '#b54a6a'; c.fillRect(px + 1, py - 12, 6, 12);
        c.fillStyle = '#f0c89a'; c.fillRect(px - 6, py - 16, 4, 4); c.fillRect(px + 2, py - 16, 4, 4);
        if (!freed) { c.strokeStyle = '#cfcfe8'; c.lineWidth = 1.5; for (let bx = -8; bx <= 8; bx += 4) { c.beginPath(); c.moveTo(px + bx, py - 20); c.lineTo(px + bx, py + 2); c.stroke(); } c.lineWidth = 1; }
        }
        const near = dist(Player.x, Player.y, ox + 8, oy + 8) < 28;
        if (near && !freed) drawText(c, Game.flags.tempestia ? 'SPACE: FREE!' : 'LOCKED', px - 16, oy - e - 14, 7, '#f8e858', '#241a33');
        if (freed) drawText(c, 'FREE!', px, oy - e - 14, 8, '#f8e858', '#241a33', 'center');
      });
      else if (o.type === 'npc') addRow(j, () => {
        const big = o.bigArt && Sprites.scenes && Sprites.scenes[o.bigArt];
        const bob = Math.sin(Game.time * (big ? 1.6 : 2.4) + o.x) * (big ? 1.2 : 0.8);
        c.fillStyle = 'rgba(20,10,40,.3)'; c.beginPath(); c.ellipse(ox + 8, oy + 14 - e, big ? 15 : 6, big ? 4.5 : 2.2, 0, 0, 7); c.fill();
        if (big) { const th = o.big || 56, s = th / big.height, w = big.width * s; try { c.drawImage(big, ox + 8 - w / 2, oy - e + 16 - th + bob, w, th); } catch (e2) {} }
        else { const spr = Sprites.npcs[o.who] || Sprites.npcs.spirit; dspr(c, spr, ox + 8 - sprW(spr) / 2, oy - e + 15 - sprH(spr) + bob); }
        if (dist(Player.x, Player.y, ox + 8, oy + 8) < 30) drawText(c, 'SPACE', ox - 2, oy - e - (big ? 48 : 12), 6, '#f8e858');
      });
    }
    // tree-type props from tiles
    const i0 = Math.max(0, (camX / TILE | 0) - 2), i1 = Math.min(map.w - 1, ((camX + VWv) / TILE | 0) + 2);
    const j0 = Math.max(0, (camY / TILE | 0) - 2), j1 = Math.min(map.h - 1, ((camY + VHv) / TILE | 0) + 3);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const id = map.tiles[j][i], def = TILEDEFS[id];
      if (def && def.prop) {
        const spr = propSpriteFor(id), e = Math.min(elevAt(map, i, j), 8) * EOFF;
        const ox = i * TILE, oy = j * TILE;
        addRow(j, () => dspr(c, spr, ox + 8 - sprW(spr) / 2, oy + TILE - sprH(spr) - e));
      }
    }
    for (const cr of Game.creatures) if (cr.state !== 'gone') addRow((cr.y / TILE) | 0, () => drawCreature(c, cr, map));
    if (map.asteroids) for (const a of map.asteroids) { const aa = a; addRow(Math.floor(aa.y / TILE), () => {
      const w = aa.w * TILE, h = aa.h * TILE, x = Math.round(aa.x), y = Math.round(aa.y);
      if (map.zone === 'city') {
        c.fillStyle = '#2a1c10'; c.fillRect(x - 1, y + 3, w + 2, h);
        c.fillStyle = '#8c6c38'; c.fillRect(x, y, w, h - 2); c.fillStyle = '#b08a44'; c.fillRect(x, y, w, 3); c.fillStyle = '#5a4628'; c.fillRect(x, y + h - 3, w, 2);
        c.fillStyle = '#e6c060'; for (let k = 2; k < w - 1; k += 6) { c.fillRect(x + k, y + 2, 1, 1); c.fillRect(x + k, y + h - 5, 1, 1); }
        const gx = x + w / 2, gy = y + h - 1, R = 5, ang = Game.time * 1.4; c.save(); c.translate(gx, gy); c.rotate(ang); c.fillStyle = '#caa044';
        for (let k = 0; k < 8; k++) { c.save(); c.rotate(k * Math.PI / 4); c.fillRect(-1.5, -R - 2, 3, 3); c.restore(); }
        c.beginPath(); c.arc(0, 0, R, 0, 7); c.fill(); c.fillStyle = '#241a33'; c.beginPath(); c.arc(0, 0, 1.4, 0, 7); c.fill(); c.restore();
      } else {
        c.fillStyle = '#1a1226'; c.fillRect(x - 1, y + 3, w + 2, h); c.fillStyle = '#4a3a68'; c.fillRect(x, y, w, h - 2); c.fillStyle = '#6a5a92'; c.fillRect(x, y, w, 3); c.fillStyle = '#2a1c44'; for (let k = 2; k < w - 2; k += 6) c.fillRect(x + k, y + 6 + ((k * 3) % Math.max(2, h - 8)), 3, 2); c.fillStyle = 'rgba(150,220,255,' + (0.35 + 0.2 * Math.sin(Game.time * 4 + aa.x * 0.1)) + ')'; c.fillRect(x + w / 2 - 2, y + h / 2 - 1, 4, 3);
      }
    }); }
    if (Game.companionActive && Game.companionActive()) addRow((Game.companion.y / TILE) | 0, () => Game.drawCompanion(c));
    addRow((Player.y / TILE) | 0, () => Player.draw(c));
    if (Game.flags.has_mastergear) addRow(((Player.y / TILE) | 0) + 1, () => {
      const gx = Player.x, gy = Player.y - 21 + Math.sin(Game.time * 3) * 1.5, ang = Game.time * 1.5;
      c.save(); c.translate(gx, gy); c.rotate(ang); c.fillStyle = '#e6c060';
      for (let k = 0; k < 8; k++) { c.save(); c.rotate(k * Math.PI / 4); c.fillRect(-1, -6, 2, 2.4); c.restore(); }
      c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); c.fillStyle = '#7a5a1c'; c.beginPath(); c.arc(0, 0, 1.6, 0, 7); c.fill(); c.restore();
    });
    if (map.aqua && Game.drawAquariumBg) Game.drawAquariumBg(c, camX, camY);   // painted deep-water BACKDROP behind everything (openwater tiles are transparent)
    drawWorld(c, map, camX, camY, Game.time, (j) => { if (rows[j]) for (const fn of rows[j]) fn(); });
    for (const j of Object.keys(rows)) if (+j > j1) for (const fn of rows[j]) fn();
    // ---- TOP OVERLAY: things that must never clip under terrain (downward bug) ----
    // visible RETURN / EXIT markers on dungeon & underwater links
    if (map.dungeon || map.underwater) {
      for (const L of map.links) {
        if (L.req && !Game.lookupFlag(L.req)) continue;
        const lx = L.x * TILE + 8, ly = L.y * TILE + 8;
        const pulse = 0.5 + 0.5 * Math.sin(Game.time * 4);
        if (L.req) {  // a freshly torn boss-exit portal: swirling magic ring
          c.strokeStyle = 'rgba(220,110,230,' + (0.5 + 0.4 * pulse) + ')'; c.lineWidth = 2;
          c.beginPath(); c.arc(lx, ly, 13 + pulse * 2, Game.time * 3, Game.time * 3 + 4.6); c.stroke();
        }
        c.fillStyle = 'rgba(120,210,255,' + (0.25 + 0.25 * pulse) + ')';
        c.beginPath(); c.arc(lx, ly, 11 + pulse * 3, 0, 7); c.fill();
        c.fillStyle = '#9adcf8'; c.strokeStyle = '#16304a'; c.lineWidth = 2;
        // upward chevron
        c.beginPath(); c.moveTo(lx, ly - 6 - pulse * 2); c.lineTo(lx - 5, ly + 1); c.lineTo(lx + 5, ly + 1); c.closePath(); c.fill(); c.stroke();
        drawText(c, 'EXIT', lx, ly + 3, 7, '#fff', '#16304a', 'center');
      }
    }
    // puzzle wires: each switch glows + a dotted line runs to the machine it drives
    if (map.puzzle) {
      for (const pz of map.puzzle) {
        const done = Game.flags.switchFlags[pz.flag];
        const ax = pz.sw[0] * TILE + 8, ay = pz.sw[1] * TILE + 8;
        const t2 = pz.wireTo || (pz.tiles && pz.tiles[0]) || pz.sw;
        const bx3 = t2[0] * TILE + 8, by3 = t2[1] * TILE + 8;
        c.strokeStyle = 'rgba(' + pz.color + (done ? ',.9)' : ',.4)');
        c.lineWidth = 1.5;
        c.setLineDash([3, 5]); c.lineDashOffset = done ? -((Game.time * 24) % 8) : 0;
        c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx3, ay); c.lineTo(bx3, by3); c.stroke();
        c.setLineDash([]); c.lineWidth = 1;
        if (!done) {
          const pulse = 0.5 + 0.5 * Math.sin(Game.time * 3 + pz.sw[0]);
          c.strokeStyle = 'rgba(' + pz.color + ',' + (0.3 + 0.4 * pulse).toFixed(2) + ')';
          c.beginPath(); c.arc(ax, ay, 8 + pulse * 2, 0, 7); c.stroke();
        }
      }
    }
    Player.drawFx(c);
    for (const n of Game.flyingNets) { c.strokeStyle = '#f0e8d8'; c.lineWidth = 1; c.beginPath(); c.arc(n.x, n.y, 6, 0, 7); c.stroke(); }
    if (Game.boss) Bosses.draw(c);
    Particles.draw(c, camX, camY);
    c.restore();
    // dark dungeon vignette — or the full LIGHT-MASK, when the map opts in (map.lightMask)
    if (map.dark && map.lightMask && Game.drawLightMask) { Game.drawLightMask(c, map, camX, camY, Z); }
    else if (map.dark) {
      const px = Player.x - camX, py = Player.y - 10 - Player.elev * EOFF - camY;
      const glow = !!Game.glowOn;
      const grd = c.createRadialGradient(px, py, glow ? 66 : 40, px, py, glow ? 224 : 150);
      grd.addColorStop(0, 'rgba(8,4,16,0)'); grd.addColorStop(1, 'rgba(8,4,16,.82)');
      c.fillStyle = grd; c.fillRect(0, 0, VW, VH);
      if (glow && Game.companionActive && Game.companionActive()) {
        const gx = Game.companion.x - camX, gy = Game.companion.y - 8 - camY;
        c.save(); c.globalCompositeOperation = 'lighter';
        const g2 = c.createRadialGradient(gx, gy, 0, gx, gy, 96);
        g2.addColorStop(0, 'rgba(96,210,150,.34)'); g2.addColorStop(1, 'rgba(96,210,150,0)');
        c.fillStyle = g2; c.beginPath(); c.arc(gx, gy, 96, 0, 7); c.fill(); c.restore();
      }
    }
    if (map.underwater) { c.fillStyle = 'rgba(30,90,140,.18)'; c.fillRect(0, 0, VW, VH); }
    const inSnow = Game.mapId === 'vale' && Player.y < 15 * TILE && Player.x < 17 * TILE;
    Particles.drawAmbient(c, inSnow ? 'snow' : Game.zoneAmb, Game.time);
    if (Game._pendingPhoto && Game.capturePhoto) { Game.capturePhoto(Game._pendingPhoto); Game._pendingPhoto = null; }
    UI.drawBannersToasts(c, dtForUi);
    if (Game.state === 'dialog') UI.drawDialog(c);
    if (Game.state === 'menu') UI.drawMenu(c);
    if (Game.state === 'itemget') UI.drawItemGet(c, dtForUi);
    UI.drawPanel(c);
    if (Game.errorMsg) { c.fillStyle = '#c81830'; c.fillRect(0, 0, SW, 12); drawText(c, String(Game.errorMsg).slice(0, 100), 3, 2, 8, '#fff', false); }
  } finally { c.restore(); }
}

// ---------- boot ----------
function bootGame() {
  migrateSlots();
  buildAllSprites();
  buildTileArt();
  applyExtArt();             // again, now that TileArt exists (tree overrides)
  buildMaps();
  if (Game.addBurrowEntrance) Game.addBurrowEntrance();
  if (Game.addCustomEntrances) Game.addCustomEntrances();
  if (Game.addCogwerkEntrance) Game.addCogwerkEntrance();
  if (Game.addMuseumFacades) Game.addMuseumFacades();
  if (Game.addMimiAlbum) Game.addMimiAlbum();
  if (Game.addAquariumLink) Game.addAquariumLink();
  if (Game.addAscent) Game.addAscent();
  if (Game.scatterMaterials) Game.scatterMaterials();
  if (Game.addSecretRooms) Game.addSecretRooms();
  applyMapOverride();
  bootCanvas();
  bootInput();
  // background tab = silence (no more mystery music from another window!)
  try {
    if (typeof document !== 'undefined' && document.addEventListener)
      document.addEventListener('visibilitychange', () => Audio2.setFocus(!document.hidden));
    if (G.addEventListener) {
      G.addEventListener('blur', () => Audio2.setFocus(false));
      G.addEventListener('focus', () => Audio2.setFocus(true));
    }
  } catch (e) {}
  Audio2.playSong('title');
  let last = 0;
  function frame(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
    try { updateGame(dt); render(dt); Game.errorMsg = null; }
    catch (e) {
      Game.errorMsg = String(e && e.message || e);
      if (typeof console !== 'undefined') console.error(e);
    }
    G.requestAnimationFrame(frame);
  }
  G.requestAnimationFrame(frame);
}
// hooks for the automated test harness
G.NQ = { Game, Player, MAPS, TILEDEFS, CREATURES, Bosses, Audio2, UI,
  updateGame, render, bootGame, newGame, loadGame, saveGame, hasSave,
  buildAll: () => { buildAllSprites(); buildTileArt(); applyExtArt(); buildMaps(); if (Game.addBurrowEntrance) Game.addBurrowEntrance(); if (Game.addCustomEntrances) Game.addCustomEntrances(); if (Game.addCogwerkEntrance) Game.addCogwerkEntrance(); if (Game.addMuseumFacades) Game.addMuseumFacades(); if (Game.addMimiAlbum) Game.addMimiAlbum(); if (Game.addAquariumLink) Game.addAquariumLink(); if (Game.addAscent) Game.addAscent(); if (Game.scatterMaterials) Game.scatterMaterials(); if (Game.addSecretRooms) Game.addSecretRooms(); },
  tileAt, elevAt, drawWorld, Sprites, Particles, WORLD_NODES, WORLD3_NODES, applyMapOverride, segPoints,
  press: (k) => { onKeyDown({ key: k }); onKeyUp({ key: k }); },
  hold: (k, v) => { if (v) onKeyDown({ key: k }); else onKeyUp({ key: k }); },
  keyHeld, dist };
if (!IS_NODE) setTimeout(bootGame, 0);   // defer to next tick so ALL files (incl. entrance hooks in 15/17) have loaded
