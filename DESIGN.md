# DESIGN — Buff Noah's Quest v4 (implementation notes)
*The soul of the game lives in ../noahs-quest/GAME_BIBLE.md. This file is the
v4-specific implementation contract.*

## Architecture
- `src/` modules concatenated by `build.py` (sorted by filename) into one
  double-clickable `BuffNoahsQuest_v4.html` + `game.js` (same code, for tests).
  - 00_boot: constants (TILE=16, EOFF=10, view 30x17 tiles + 176px panel),
    canvas/integer scaling, keyboard (legacy key-name + keyCode normalization,
    press queue + held map). IS_NODE switch for the test harness.
  - 01_util, 02_portraits (base64 art from the 3 approved PNGs), 03_audio
    (chiptune sequencer: SONGS table + jingle table).
  - 04_sprites: PAL palette, buildSprite(grid) from ASCII pixel grids; Noah
    frames; DIVE_PAL palette swap; creatures get auto hop-frames; pixPortraits.
  - 05_tiles: TILEDEFS (solid/hole/rift/swim/slick/stair/door/gate flags),
    paintTileBase per type ×4 variants ×2 anim frames, drawWorld renderer:
    rows top→bottom, cliff wall drawn in the gap above each face (palette from
    the upper tile's terrain), entityHook(j) interleaved per row for occlusion.
  - 06_maps: builder DSL (newMap/R/E/T/scatter/CHEST/SIGN/NPC/POST/LINK/DOOR/
    SPAWN). 9 maps + WORLD_NODES. All gating geometry lives here.
  - 07_entities: CREATURES table (habitat, spd, catch methods, bait, skittish/
    feisty/sting/stunThen), wander/flee/lure AI, cage trapping, particles.
  - 08_player: canEnter (the LAW: elevation/stairs/gloves/sandals/slick/rift
    rules), escape-rule tryMove, airborne arc (×1.55 speed boost) + wings
    flight, tools (lunge/net+launcher/harpoon out-pull/cage/boomerang), unstick.
  - 09_systems: Game state, doors/keys, capture & lifetime counters (life_*),
    shops/trades/baits, questHint() chain, dialog content.
  - 10_bosses: Bosses.spawn/update/draw + harpoonHit/boneHit hooks (wired to
    Game at module end — DO NOT remove).
  - 11_ui: side panel, dialog (portraits), menus, world map, title, credits.
  - 12_main: update/render orchestration, links, switches/block pushing
    (blocks LOCK on switches), save/load (slot buffNoahQuest_v4), boot, NQ hooks.

## Invariants (tests enforce; keep them true)
1. Every chest/npc/door/boss/link reachable with full gear (validate.js).
2. Granny + meadow reachable with NO gear; grotto door NOT (gating).
3. Jump crosses exactly 1-tile gaps (1.55× air speed); 2+ wide chasms and all
   rifts are jump-proof. Rifts need wings-flight; slick ice needs gloves even
   while airborne; swimmers need the suit; deep water is never walkable.
4. Required gear is never gem-purchasable-only: suit & wings are creature
   trades with renewable inputs (respawn on map load).
5. Blocks lock onto switches; switch flags persist (sw_grotto, sw_keep).
6. Save never resumes inside dungeon/underwater maps; positions sanitized.
7. Pixel test must keep passing: hero hair色 sampled at expected screen pos
   before AND after movement (guards the camera/renderer contract).

## Coordinates that matter (don't move without updating tests)
- vale: granny(34,11) spirit(6,5) grotto-door(25,2→grotto 17,23) marko(40,12)
  tess(45,16) gauntlet door(51,33→coast 2,18) post(48,33)
- grotto: harpoon chest(7,17) post(17,11) key(17,10) lock(24,11) block(28,11)
  switch(30,13) bosskey(29,5) bossdoor(17,6) billy(17,3)
- coast: sal(22,25) school door(40,11→school 11,13) buoys(24,31)(38,31)
- deep: entries(5,5)(7,30) gate x36 y14-21 twinkle(42,17) crown chest(45,12)
- wastes: zibble(11,16) shards(24,4)(40,9)(32,26) keep door(44,19→keep 17,23)
- keep: blocks(10,13)(13,14) switches(9,15)(14,12) key(28,16) bosskey(5,4)
  cerberus(17,5)
- canyon: stairs(8,27) ice(36,19) post(24,8) berries(20,2)(27,2)
  spire door(40,4→spire 15,27) cora(12,32)
- spire: sahor(15,11) perches (6,6)(23,6)(6,16)(23,16); phase2 path = rect
  perimeter tiles x5-25 / y5-18.
