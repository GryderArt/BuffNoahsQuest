"use strict";
// ============== WORLD 2 maps, REBUILT: open creature-worlds + SEALED combo-dungeon corridors ==============
// These buildBurrowN definitions OVERRIDE the stubs in 15_underburrow.js (later declaration wins).
// Each world = a big OPEN cavern where rounding up HERDS is the main draw, PLUS a tight, fully
// SEALED dungeon corridor whose gates chain Noah's tools/abilities in series (no walk-arounds —
// verified by test/_choke.js). Beating the WARDEN (Ramsi headbutt + Noah's tool) unlocks its caged
// PILLOW-KIN; freeing the Kin awakens a new power that opens that world's exit.

// seal a dungeon region [x0..x1] to a single horizontal corridor band [y0..y1]; carve the band soil
function sealBand(m, x0, x1, y0, y1) {
  R(m, x0, 1, x1 - x0 + 1, y0 - 1, 'rootwall');
  R(m, x0, y1 + 1, x1 - x0 + 1, (m.h - 1) - (y1 + 1), 'rootwall');
  R(m, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 'soil');
}
function chamber(m, x0, y0, w, h) { R(m, x0, y0, w, h, 'soil'); }   // carve a den chamber over the seal

// ===================== LEVEL 5 — TOPSOIL TUNNELS =====================
function buildBurrow5() {
  if (MAPS.burrow5) return;
  const m = newMap('burrow5', 64, 40, 'soil', { name: 'Topsoil Tunnels', song: 'dungeon', cliff: 'dirt', zone: 'burrow', noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  const vein = (p) => { for (const [x, y] of p) T(m, x, y, 'glowvein'); };
  m.start = { x: 4, y: 20 };

  // ---- OPEN WEST: lit topsoil meadows full of herds (the main draw) ----
  blob(m, 12, 9, 2.0, 1.5, 'rootwall', 0, 5101, ['soil']); blob(m, 22, 30, 2.2, 1.6, 'rootwall', 0, 5102, ['soil']);
  blob(m, 8, 31, 4.0, 2.4, 'water', 0, 5110, ['soil']);                  // a watering pool
  vein([[6, 12], [16, 8], [24, 14], [10, 27], [30, 30]]);
  NPC(m, 6, 18, 'granny', 'Old Mole');
  SIGN(m, 4, 22, 'Welcome to THE UNDERBURROW! GNASH stole the PILLOW-KIN. While you hunt, round up the burrow-Mimis — CLOVER cages (B) or your NET! The dig-works (and a WARDEN) lie EAST.');
  SPAWN(m, 'sheep', 4, 3, 20, 12, 5); SPAWN(m, 'ram', 14, 5, 10, 9, 2);
  SPAWN(m, 'goat', 5, 24, 16, 10, 3); SPAWN(m, 'snowhare', 3, 14, 16, 6, 3);
  CHEST(m, 23, 3, { coins: 12 }); CHEST(m, 3, 37, { gems: 4 });

  // ================= SEALED DUNGEON CORRIDOR (x41-62, band y17-23): Harpoon -> Ram -> Bracers =================
  sealBand(m, 41, 62, 17, 23);
  SIGN(m, 38, 20, 'EAST: the dig-works. A bottomless moat blocks the way — HARPOON the POST across and reel over!');
  R(m, 41, 17, 4, 7, 'chasm'); POST(m, 45, 20);                          // gate 1: HARPOON
  R(m, 48, 17, 1, 7, 'rootwall'); T(m, 48, 20, 'crack');                 // gate 2: RAM-smash
  SIGN(m, 46, 18, 'A cracked seam — LUNGE (Z) with the RAM SUIT to smash through.');
  OBJ(m, { type: 'block', x: 50, y: 20, id: 'b5_blk1' }); T(m, 53, 20, 'switch');   // gate 3: BRACERS
  R(m, 55, 17, 1, 7, 'chasm');
  SIGN(m, 49, 18, 'Shove the BLOCK (BRACERS) onto the SWITCH to bridge the pit.');
  m.puzzle = [{ sw: [53, 20], flag: 'sw_b5bridge', to: 'bridge', tiles: [[55, 19], [55, 20], [55, 21]], color: '248,208,72', jingle: 'door', msg: 'CLUNK! Root-beams swing across the pit!' }];

  // ---- MOTTLE den (a chamber off the corridor) + MR. RAM + the shrink-hole down ----
  chamber(m, 56, 14, 7, 13);                                             // x56-62, y14-26
  SIGN(m, 57, 25, 'MOTTLE THE MOLE guards the dig-head! Bring RAMSI close to HEADBUTT his shell, then GRAB him (Z)!');
  OBJ(m, { type: 'boss', x: 60, y: 20, boss: 'mottle' });
  OBJ(m, { type: 'pillowkin', x: 61, y: 15, kin: 1, caged: true, warden: 'mottle', color: '#d8b48a', name: 'MR. RAM',
    gives: ['ramGlow', 'ramShrink'], freed: 'You free MR. RAM! RAMSI now GLOWS in the dark AND can SHRINK through burrow-holes (press C). Use it on the hole below to dig deeper!' });
  T(m, 60, 25, 'holegap'); DOOR(m, 60, 26, 'flag', 'b5_exit', 'A snug burrow-hole, plugged from below.');
  chamber(m, 60, 27, 1, 2);                                              // a 1-wide shaft, reachable ONLY through the latched hole
  OBJ(m, { type: 'ramhole', x: 61, y: 25, flag: 'b5_exit', compOnly: true, msg: 'RAMSI shrinks down the hole and kicks the plug loose — a way down opens!' });
  OBJ(m, { type: 'portal', x: 60, y: 28, to: 'burrow6', tx: 4, ty: 20, req: 'b5_exit' });
}

// ===================== LEVEL 6 — ROOT HOLLOWS =====================
function buildBurrow6() {
  if (MAPS.burrow6) return;
  const m = newMap('burrow6', 64, 40, 'soil', { name: 'Root Hollows', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  const vein = (p) => { for (const [x, y] of p) T(m, x, y, 'glowvein'); };
  m.start = { x: 4, y: 20 };

  // ---- OPEN WEST: dark sap-caverns lit by Ramsi's GLOW; sap-pools + land herds + a GLOW secret ----
  blob(m, 12, 30, 5.0, 3.0, 'water', 0, 6110, ['soil']); blob(m, 22, 11, 3.6, 2.4, 'water', 0, 6111, ['soil']);
  blob(m, 9, 9, 2.0, 1.6, 'rootwall', 0, 6101, ['soil']);
  vein([[6, 22], [16, 14], [10, 31], [24, 30], [27, 8]]);
  NPC(m, 6, 20, 'sal', 'Bog-Keeper');
  SIGN(m, 4, 23, 'THE ROOT HOLLOWS. Dark down here — good thing RAMSI GLOWS now! HARPOON the sap-swimmers; CAGE the goats. A WARDEN lurks EAST.');
  SPAWN(m, 'octopus', 9, 28, 8, 6, 3); SPAWN(m, 'jellyfish', 19, 9, 7, 5, 2);
  SPAWN(m, 'goat', 4, 5, 12, 10, 3); SPAWN(m, 'crab', 14, 24, 12, 8, 2); SPAWN(m, 'ibex', 18, 4, 9, 9, 2);
  R(m, 2, 2, 4, 1, 'rootwall'); R(m, 2, 2, 1, 4, 'rootwall'); R(m, 5, 3, 1, 3, 'rootwall');
  CHEST(m, 3, 4, { heartpiece: 1 }); SIGN(m, 7, 6, "A pitch-black nook — only RAMSI's GLOW reveals the heart-piece inside.");
  CHEST(m, 27, 34, { gems: 5 });

  // ================= SEALED DUNGEON (x35-62, band y17-23): Shrink -> Harpoon -> Bracers =================
  sealBand(m, 35, 62, 17, 23);
  R(m, 36, 17, 1, 7, 'rootwall'); T(m, 36, 19, 'holegap'); DOOR(m, 36, 20, 'flag', 'b6_g1', 'A latched root-gate.');   // gate 1: SHRINK
  OBJ(m, { type: 'ramhole', x: 35, y: 20, flag: 'b6_g1', compOnly: true, msg: 'RAMSI shrinks through and drops the gate-latch!' });
  SIGN(m, 33, 20, 'A latched gate — SHRINK RAMSI (C) through the hole to drop it.');
  R(m, 40, 17, 4, 7, 'chasm'); POST(m, 44, 20);                          // gate 2: HARPOON the sap-fall
  SIGN(m, 38, 18, 'A bottomless sap-fall — HARPOON the POST across.');
  OBJ(m, { type: 'block', x: 47, y: 20, id: 'b6_blk1' }); T(m, 50, 20, 'switch');   // gate 3: BRACERS
  R(m, 52, 17, 1, 7, 'chasm');
  SIGN(m, 46, 18, 'Shove the BLOCK (BRACERS) onto the switch to bridge the pit.');
  m.puzzle = [{ sw: [50, 20], flag: 'sw_b6bridge', to: 'bridge', tiles: [[52, 19], [52, 20], [52, 21]], color: '248,208,72', jingle: 'door', msg: 'CLUNK! A root-bridge swings over the pit!' }];

  // ---- THORNBACK den + BEAST MIMI + a BOUNCE up & over a sealed ridge to the exit ----
  chamber(m, 53, 10, 10, 17);                                            // x53-62, y10-26
  SIGN(m, 54, 25, 'THORNBACK guards the deep root! Bring RAMSI close to HEADBUTT its armor, then NET it (Z)!');
  OBJ(m, { type: 'boss', x: 58, y: 17, boss: 'thornback' });
  OBJ(m, { type: 'pillowkin', x: 61, y: 11, kin: 2, caged: true, warden: 'thornback', color: '#3a3550', name: 'BEAST MIMI',
    gives: ['ramBounce', 'ramDecoy'], freed: 'You free BEAST MIMI! RAMSI learns PILLOW-BOUNCE (stand on a mushroom, press X) and DECOY TAUNT (press C). BOUNCE over the ridge to escape!' });
  OBJ(m, { type: 'bouncepad', x: 60, y: 23, to: [60, 33], msg: 'BOING! RAMSI springs Noah over the ridge to the exit shaft!' });
  SIGN(m, 54, 22, 'No path on but UP and over — stand on RAMSI and BOUNCE (X)!');
  chamber(m, 57, 31, 6, 6);                                              // sealed exit shelf (only the bounce reaches it)
  OBJ(m, { type: 'portal', x: 60, y: 33, to: 'burrow7', tx: 4, ty: 20, req: 'thornback' });
}

// ===================== LEVEL 7 — CRYSTAL DEEP =====================
function buildBurrow7() {
  if (MAPS.burrow7) return;
  const m = newMap('burrow7', 64, 40, 'soil', { name: 'Crystal Deep', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  const vein = (p) => { for (const [x, y] of p) T(m, x, y, 'glowvein'); };
  const crys = (p) => { for (const [x, y] of p) T(m, x, y, 'crystal'); };
  m.start = { x: 4, y: 20 };

  // ---- OPEN WEST: crystal caverns; CAPRICORN pools, IBEX/STAR-PUPIL herds, a DECOY-guarded secret ----
  blob(m, 12, 12, 4.6, 2.8, 'water', 0, 7110, ['soil']);
  crys([[8, 5], [20, 7], [6, 28], [24, 30], [16, 22], [27, 9]]); vein([[6, 16], [16, 26], [10, 9]]);
  NPC(m, 6, 20, 'gruul', 'Gem-Warden');
  SIGN(m, 4, 23, 'THE CRYSTAL DEEP. CAPRICORN swim the pools; STAR-PUPILS spook easily (a quiet COOKIE cage works best). A WARDEN waits EAST.');
  SPAWN(m, 'capricorn', 9, 10, 8, 5, 3); SPAWN(m, 'ibex', 4, 24, 22, 12, 3); SPAWN(m, 'starpupil', 16, 5, 11, 9, 2);
  R(m, 2, 34, 5, 1, 'crystal'); R(m, 2, 34, 1, 4, 'crystal'); R(m, 6, 34, 1, 4, 'crystal');
  CHEST(m, 4, 36, { heartpiece: 1 }); SPAWN(m, 'jellyfish', 3, 37, 4, 2, 3);
  SIGN(m, 9, 36, 'A heart-piece behind a stinging jelly-swarm — press C so RAMSI DECOYS them, then dash in!');
  CHEST(m, 27, 4, { gems: 5 });

  // ================= SEALED DUNGEON (x33-62, band y17-23): Bounce -> Bracers -> Harpoon =================
  sealBand(m, 33, 62, 17, 23);
  R(m, 36, 17, 1, 7, 'rootwall'); R(m, 36, 19, 1, 3, 'crystal');         // gate 1: BOUNCE the crystal shelf
  OBJ(m, { type: 'bouncepad', x: 34, y: 20, to: [38, 20], msg: 'BOING! Over the crystal shelf!' });
  SIGN(m, 33, 20, 'A sheer crystal shelf — stand on the mushroom and BOUNCE (X) over it.');
  OBJ(m, { type: 'block', x: 40, y: 20, id: 'b7_blk1' }); T(m, 43, 20, 'switch');   // gate 2: BRACERS
  R(m, 45, 17, 1, 7, 'chasm');
  SIGN(m, 39, 18, 'Shove the BLOCK (BRACERS) onto the switch to bridge the star-chasm.');
  m.puzzle = [{ sw: [43, 20], flag: 'sw_b7bridge', to: 'bridge', tiles: [[45, 19], [45, 20], [45, 21]], color: '160,120,240', jingle: 'door', msg: 'CHIME! A crystal bridge forms!' }];
  R(m, 48, 17, 4, 7, 'chasm'); POST(m, 52, 20);                          // gate 3: HARPOON the star-fall
  SIGN(m, 46, 18, 'A bottomless star-fall — HARPOON the POST across to the Golem vault.');

  // ---- GEODE vault + TOOTHLESS + a GLIDE across a sealed star-chasm to the exit ----
  chamber(m, 53, 11, 10, 13);                                            // x53-62, y11-23
  SIGN(m, 54, 22, 'GEODE GOLEM! Bring RAMSI close to HEADBUTT its shell, then HARPOON its core (Z)!');
  OBJ(m, { type: 'boss', x: 58, y: 17, boss: 'geode' });
  OBJ(m, { type: 'pillowkin', x: 61, y: 12, kin: 3, caged: true, warden: 'geode', color: '#1a1a22', name: 'TOOTHLESS',
    gives: ['ramGlide', 'ramRoll'], freed: 'You free TOOTHLESS! RAMSI learns PUFF-GLIDE (at an updraft, press C) and ROLL-CHARGE (face a soft-block, press C). GLIDE the star-chasm to descend!' });
  R(m, 53, 24, 10, 7, 'chasm');                                          // sealed star-chasm (glide-only)
  OBJ(m, { type: 'glidevent', x: 58, y: 23, to: [60, 32], msg: 'RAMSI puffs up and glides Noah across the great star-chasm!' });
  SIGN(m, 54, 20, 'A vast star-chasm bars the way down — at the UPDRAFT, GLIDE (C) across.');
  chamber(m, 57, 31, 6, 6);
  OBJ(m, { type: 'portal', x: 60, y: 33, to: 'burrow8', tx: 4, ty: 20, req: 'geode' });
}

// ===================== LEVEL 8 — THE HOARD DESCENT (master combo) =====================
function buildBurrow8() {
  if (MAPS.burrow8) return;
  const m = newMap('burrow8', 72, 40, 'soil', { name: 'The Hoard Descent', song: 'dungeon', cliff: 'dirt', zone: 'burrow', dark: true, noFly: true });
  for (let i = 0; i < m.w; i++) { T(m, i, 0, 'rootwall'); T(m, i, m.h - 1, 'rootwall'); }
  for (let j = 0; j < m.h; j++) { T(m, 0, j, 'rootwall'); T(m, m.w - 1, j, 'rootwall'); }
  const vein = (p) => { for (const [x, y] of p) T(m, x, y, 'glowvein'); };
  m.start = { x: 4, y: 20 };

  // ---- OPEN WEST: Gnash's hoard, stuffed with stolen EXOTIC Mimis ----
  blob(m, 10, 10, 2.2, 1.7, 'rootwall', 0, 8101, ['soil']); blob(m, 22, 30, 2.0, 1.5, 'rootwall', 0, 8102, ['soil']);
  vein([[6, 22], [16, 12], [9, 30], [24, 28], [27, 8]]);
  NPC(m, 6, 20, 'cora', 'Hoard-Watch');
  SIGN(m, 4, 23, "GNASH'S HOARD, stuffed with stolen Mimis! ALIENS & COMET-PUPS love COOKIES; the UNICORN bolts unless you BONE-stun it first. The last WARDEN waits EAST.");
  SPAWN(m, 'alien', 4, 4, 22, 12, 3); SPAWN(m, 'condor', 16, 5, 11, 9, 2);
  SPAWN(m, 'cometpup', 4, 24, 14, 12, 3); SPAWN(m, 'unicorn', 18, 26, 9, 8, 2);
  CHEST(m, 27, 4, { gems: 6 }); CHEST(m, 3, 37, { coins: 18 });

  // ============ SEALED MASTER DUNGEON (x32-70, band y17-23): Shrink -> Bone -> Bracers -> Harpoon -> Roll ============
  sealBand(m, 32, 70, 17, 23);
  R(m, 35, 17, 1, 7, 'rootwall'); T(m, 35, 19, 'holegap'); DOOR(m, 35, 20, 'flag', 'b8_g1', 'A latched root-gate.');   // 1: SHRINK
  OBJ(m, { type: 'ramhole', x: 34, y: 20, flag: 'b8_g1', compOnly: true, msg: 'RAMSI shrinks through and drops the latch!' });
  SIGN(m, 33, 20, '1) SHRINK RAMSI (C) through the hole to drop the gate.');
  R(m, 39, 17, 1, 7, 'rootwall'); DOOR(m, 39, 20, 'flag', 'b8_g2', 'A bolted gate — its switch hangs on a ledge above a gap.');   // 2: BONE
  T(m, 38, 15, 'soil'); T(m, 38, 16, 'chasm');                           // a switch-ledge over a gap, carved into the seal (bone-only)
  OBJ(m, { type: 'boneswitch', x: 38, y: 15, flag: 'b8_g2', compOnly: true, msg: 'CLACK! The BOOMER-BONE trips the bolt — the gate opens!' });
  SIGN(m, 36, 22, '2) A switch on a ledge above a gap — stand below it, face UP, and fling your BOOMER-BONE (Z)!');
  OBJ(m, { type: 'block', x: 43, y: 20, id: 'b8_blk1' }); T(m, 46, 20, 'switch');   // 3: BRACERS
  R(m, 48, 17, 1, 7, 'chasm');
  SIGN(m, 42, 18, '3) Shove the BLOCK (BRACERS) onto the switch to bridge the treasure-pit.');
  m.puzzle = [{ sw: [46, 20], flag: 'sw_b8bridge', to: 'bridge', tiles: [[48, 19], [48, 20], [48, 21]], color: '248,208,72', jingle: 'door', msg: 'CLUNK! Stolen beams bridge the pit!' }];
  R(m, 51, 17, 4, 7, 'chasm'); POST(m, 55, 20);                          // 4: HARPOON
  SIGN(m, 49, 18, '4) A chasm of spilled coins — HARPOON the POST across.');
  R(m, 58, 17, 1, 7, 'softblock');                                       // 5: ROLL
  SIGN(m, 56, 18, '5) A soft-block wall — face it and ROLL-CHARGE (C) straight through to the den.');

  // ---- TREMOR-GRUB den + LUCKY + the way to the GAUNTLET ----
  chamber(m, 59, 14, 12, 13);                                            // x59-70, y14-26
  SIGN(m, 60, 25, 'THE TREMOR-GRUB! Bring RAMSI close to HEADBUTT it, then BONE it (Z)!');
  OBJ(m, { type: 'boss', x: 64, y: 20, boss: 'grub' });
  OBJ(m, { type: 'pillowkin', x: 68, y: 15, kin: 4, caged: true, warden: 'grub', color: '#e0a0d0', name: 'LUCKY',
    gives: ['ramPound'], freed: 'You free LUCKY, the last Pillow-Kin! RAMSI learns the GROUND-POUND (press C). Now into the Hoard Cavern... and GNASH.' });
  SIGN(m, 60, 23, 'THE HOARD CAVERN yawns beyond — GNASH re-summons his elite. Brace for the GAUNTLET!');
  OBJ(m, { type: 'portal', x: 67, y: 20, to: 'vault1', tx: 3, ty: 7, req: 'grub' });
}
if (typeof G !== 'undefined' && G.NQ) { Object.assign(G.NQ, { buildBurrow5, buildBurrow6, buildBurrow7, buildBurrow8 }); }
