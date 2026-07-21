# BOOTSTRAP — Buff Noah's Quest v4 (read me first)

A fast, high-signal onboarding for a fresh session. (PROGRESS.md is the full changelog —
useful as a *reference*, but don't read it cover to cover; it's long by design.)

---

## 1. What this is (the vision)

**Buff Noah's Quest** is a kid-friendly, Zelda-like pixel-art adventure built as a gift for Noah.
It ships as **one self-contained HTML file** you can just open in a browser.

- **Heroes:** Noah (the player) and **Ramsi**, a fiery clockwork-ram companion who *lends abilities*
  on the C key — Glow, Shrink, Bounce, Glide, Roll, Decoy, Ground-Pound. Ramsi is central: most
  puzzles are "use the right Ramsi ability at the right gate."
- **Loop:** explore → **catch** creatures (net/tools) → solve ability-gated traversal → beat a boss →
  collect **star-cells**. Four star-cells unlock **Super Ramsi** for the finale.
- **Worlds:** W1 overworld/Greenwood Vale, W2 the Underburrow, **W3 Cogwerk City** (the current focus:
  `cog1` clock-tower climb, `cog2` the Pipeworks water-maze, `cog3` the High Roofs, `cog4` the GNASHARA
  multi-head finale). A painted overview map (`world3map`) links the W3 levels.
- **Tone & art:** warm storybook palette, chunky pixel sprites, plum-black outline `#241a33`. Keep it
  charming, readable, and gentle. The player is a kid — no dark/scary turns.

Design instincts that have served well: **readability first** (every gate should telegraph the
intended ability), **one clean way forward** per puzzle, living/animated background machinery,
and "show, don't tell" cutscenes using the real in-game sprites.

**READING LEVEL — the player is SIX and reads slowly.** Action-critical information must be
PERSISTENT and glanceable, never a timed banner/toast: <=5 short words, ALL-CAPS verbs, plus
key-cap badges ([1]..[5], Z, X, C) the player can match against the HUD tool row without
reading. The pinned boss-hint bar (`src/22b_bosshints.js`, `Game.bossHintLine`) is the
pattern — state-aware, always on screen during fights, updates as the fight changes. Timed
banners/toasts are for flavor only; SIGNS may be longer (a grown-up reads those aloud).
Prefer showing over telling everywhere: icons, arrows, wired glows, species portraits.

---

## 2. Build & run (the core loop)

```
python3 build.py        # concatenates src/NN_*.js (sorted) -> BuffNoahsQuest_v4.html + game.js,
                        # and embeds assets/*.png as base64 into EXT_ART
```
Open `BuffNoahsQuest_v4.html` to play. `game.js` is the same code for the Node test harness.

There is **no bundler/transpiler** — it's hand-rolled concatenation. Files are plain strict-mode JS;
top-level `function` declarations hoist across files, `const`/`let` are script-scoped at runtime.

### GitHub (publishing) — the token lives in GITHUB_TOKEN.md

- Repo: `GryderArt/BuffNoahsQuest` (public). The playable link is
  **https://gryderart.github.io/BuffNoahsQuest/** — Pages serves `index.html` from the
  `gh-pages` branch, so `cp BuffNoahsQuest_v4.html index.html` before a release commit,
  then push **both** `main` and `main:gh-pages`.
- Berkley's fine-grained push token is saved in **`GITHUB_TOKEN.md`** (repo root, on his PC
  and in the cloud copy). That file is **gitignored — NEVER commit it, never `git add -f` it,
  never put the token in git config/remotes.** Read the push commands from that file.
- If the token ever stops working (revoked/expired), ask Berkley for a fresh one
  (Contents: read/write on the repo) and update GITHUB_TOKEN.md — don't guess.

---

## 3. ⚠️ How to edit files here (most important lesson)

This repo lives in a **Dropbox-synced folder**. Editing source with the Edit/Write tools has, in this
project, corrupted files and caused local-mount ↔ cloud **divergence/truncation**. The reliable
convention that emerged:

- **Edit existing source via Python heredocs in bash**, matching an exact unique string and asserting
  the count, e.g.:
  ```bash
  python3 - << 'PYEOF'
  p='src/11_ui.js'; s=open(p,encoding='utf-8').read()
  old="...exact text..."; new="...replacement..."
  assert s.count(old)==1, 'anchor'; open(p,'w',encoding='utf-8').write(s.replace(old,new))
  PYEOF
  ```
- **Create new files** with `cat > path << 'EOF' … EOF`.
- **After any edit:** `node --check src/<file>.js`, then `python3 build.py`.
- The **Read tool** pulls the full cloud copy (trustworthy for reading). Bash sees the local mount; if a
  bash path read looks stale/truncated, Read it instead.

If you prefer the Edit tool, re-verify on a throwaway change first — but heredocs are the safe default.

---

## 4. Testing & screenshots

- Harness: `test/harness.js` (stubs a DOM + node-canvas, requires `game.js`).
- Run a suite: `NODE_PATH=/tmp/node_modules node test/<name>.js`
- **THE AUDITOR** (deep playtest analysis): `NODE_PATH=/tmp/node_modules node test/audit.js [mapIds]`
  → progression-aware reachability (per-stage abilities, fixpoint over in-map grants),
  brute-forced puzzle solvers (beams/sap/rails/herd/wind), softlock pockets, and annotated
  minimaps. Writes `audit_report.md` + `audits/<map>.png` (green/orange/red items). Run it
  after ANY map/system change — it is stricter than validate (e.g. it models harpoon
  line-of-sight, which validate ignores).
- **The `canvas` module lives in `/tmp` and gets wiped between sessions.** If tests error on
  `Cannot find module 'canvas'`: `cd /tmp && npm install canvas` (then retry).
- **Core regression set (keep all green):**
  `validate smoke playthrough features features2 underburrow _icefield _zoo _cogwerk _pipeworks
   _siphon _randmaze _starcut _world3map _rooftops _world4 _polish`
  plus the v10 revamp suites: `_choke _beams _rails _sap _lure _wind _world2shortcut _nofly _playtest _bosshint _colossus _cogroads`
  and the museum/replay suites: `_museum _stable _combiner _crags _moments _aquarium _glowcave _pendecor _gamepad _materials _ascent _aviary _doors _secrets _feathermig`
- **Screenshots:** most `_*shot.js` tests set up a state, call `H.render()`, and
  `fs.writeFileSync(... H.canvas.toBuffer('image/png'))`. Copy one to make a new view. The render
  canvas is `SW×SH×SCALE` = 656×272×2; the world view is the left `480×272` logical region, the HUD
  panel is the right 176px.

---

## 5. The art pipeline (and the "I edited a PNG" answer)

```
assets/raw/<art>.png  --(python3 import_art.py)-->  assets/<key>.png  --(python3 build.py)-->  embedded in HTML
```
- `import_art.py` slices sheets (`sheet.<name>.png`) per its `SHEETS` dict (optional per-sheet `dens`), keys out the background
  (handles white/checker bgs via border flood-fill), **snaps to a chunky pixel grid**, snaps near-palette
  colors, darkens outlines to `#241a33`, and writes `assets/<key>.png` at **DENSITY=4** (stored 4× the
  logical size — clean 2:1 at windowed SCALE 2, 1:1 at fullscreen; glow-art like sheet.superramsi
  needs the custom gentle keyer in 22c's import notes, never the palette snapper). Single files use `ASSET_SIZES[key]`.
- **`scene.*` (backgrounds/dialogue portraits)** are NOT snapped — process them with a small custom
  Python script (open, optional bg-key, smooth resize, save `assets/scene.<name>.png`). Examples:
  `scene.world3bg` (the overview map), `scene.lady`, `scene.trader`.
- **`.big.png` override:** drop `assets/raw/<key>.big.png` and the importer's second pass converts it
  *after* the normal pass, so it wins every import (good for hand-made art that must survive re-imports).
- **Map repaints via the LEVEL EDITOR:** level_editor.html now loads game.js itself (window.NQ_EDITOR
  guard skips the boot) — every map + every tile + elevation painting, always in sync. "Open level" →
  repaint tiles/height → "Save level edit" downloads `<mapid>.edit.json` → drop in customlevels/ →
  `python3 build.py` embeds it (MAP_EDITS in 02c, applied by 17b_mapedits after the buildMaps chain;
  tiles+elev only — objects/doors/links/spawns stay coded). Delete the .edit.json + rebuild to revert.
  Run validate + audit after map edits.
- **Editing a PNG does NOT auto-update the game** (everything is embedded at build time):
  - cleaned a processed `assets/<key>.png` → `python3 build.py` (your exact pixels embed verbatim; just
    don't re-run import_art for that key or it regenerates/overwrites from raw).
  - edited a raw `assets/raw/*.png` → `python3 import_art.py && python3 build.py`.

---

## 6. Architecture map (`src/NN_*.js`, concatenated in order)

- `00_boot` constants (TILE=16, VIEW 30×17 → VW480×VH272, PANEL_W176, SCALE, ANIMAL_DRAW_SCALE=1.5).
- `01_util` math/rng/`wrapText`/`hash2`. `02_*` portraits/faces/BGM. `02c_extart` holds `EXT_ART` (filled by build).
- `03_audio` sfx/music. `04_sprites` sprite store, `installExtSprite` (loads EXT_ART by key→kind), `TILE_OVERRIDE`, density logic.
- `05_tiles` `TILEDEFS`, `paintTileBase` (procedural tile art), `buildTileArt`, **`drawWorld`** (tile render, facades, sky gradient, sun).
- `06_maps` `newMap` + helpers **R/T/OBJ/SIGN/NPC/DOOR/LINK/SPAWN/CHEST/POST**; world-node tables (e.g. `WORLD3_NODES`).
- `07_entities` `CREATURES` defs + `drawCreature` + particles. `08_player` movement/abilities. `09_systems` maps load, doors, capture, quests, cutscene driver.
- `10_bosses` boss framework (`Bosses.spawn/update/draw/catchBoss`). `11_ui` HUD panel, dialogue, world maps. `12_main` main loop, **camera**, object render pass, input.
- `13_roads` side-scroll segments. `14_world2` companion + cutscene helpers. `15/16_underburrow*`. `17_customlevels` `18_grannyzoo`.
- **`19_cogwerk`** Cogwerk City (cog1 clock-tower) + the star-cell cutscene. **`20_pipeworks`** (cog2 water-maze + floodPipes). **`21_rooftops`** (cog3). **`22_world4`** (GNASHARA finale).
- **v10 REVAMP overrides (later-declaration-wins over 14/16):** `16b_skyrealms` (sky1-4 + Wind
  lanes/leaf-bridges/puff-stones/storm + 4 sky-boss AIs), `16c_crystaldeep` (b7 + lightMask +
  Beams + Game.OBJDRAW registry + geode AI), `16d_hoard` (b8 + Rails/carts + grub AI),
  `16e_roothollows` (b6 + Sap graph + thornback AI), `16f_topsoil` (b5 + Herdwork jobs +
  mottle AI). Shared tricks: sw_* m.puzzle entries for permanent effects; asteroidCovers
  wraps for dynamic bridges; wrapper CHAINS on updateBurrowAbilities/ramsiCommand/up_warden
  (order matters: files must sort AFTER 15_underburrow to wrap, not be clobbered).
- **`32b_touch`** TOUCH CONTROLS (phones/tablets; `G.NQ_TOUCH` detection, `?touch=1/0` override).
  Feeds the SAME KEYS/PRESS_QUEUE/CLICK_QUEUE as the keyboard — never add touch-only logic
  elsewhere. Joystick lower-left (arrow keys, hidden outside play/side/ascent/aviary);
  `UI.drawTouchPad` replaces the QUEST box (11_ui branches on NQ_TOUCH) with Z/X/C + SPACE;
  floating pad bottom-right in panel-less states; "..." menu top-right (pack/outfit/map/
  quest-as-dialog/music/fullscreen). Wraps `render` (overlay) + `bootCanvas` (listeners);
  00_boot uses fractional SCALE when NQ_TOUCH. Test: `/tmp/touchtest.js` (playwright,
  emulated iPhone + desktop, 21 checks).

---

## 7. Conventions & patterns worth knowing

- **Maps:** build inside an IIFE with `newMap(id,w,h,base,opts)` then the helpers. `m.objects` drives both
  gameplay and the render pass in `12_main` (each `o.type` has a draw branch). Portals: `OBJ{type:'portal',
  to, tx, ty}`; `secret:true`+`req:'flag'` hides until a flag is set; `to:'world3map'` opens the overview.
- **Tiles:** add to `TILEDEFS` (flags: `solid/hole/anim/swim/...`), a `paintTileBase` case (procedural look),
  and—if HD art should override it—wire `TILE_OVERRIDE[artKey]='tileId'`.
- **Creatures:** add to `CREATURES`; art via the `cogcreatures`-style sheet. **External-only creatures (no
  base procedural grid) MUST install at density 2** — see lesson below.
- **Camera zoom:** per-map `m.viewScale` (<1 pulls back / shows more). Only `cog1` uses it (0.75). The camera
  always *centers on the player*, so widening a map does NOT reveal more sky — only `viewScale` does.
- **Roads (13_roads + 19b):** hazard chars `< >` belts, `C` crusher, `V` vent, `Z` spark-bob; wing meter
  `ROAD_FLAPS=5` (land to refill, hold-X glide; `def.wings:1` lends loaner wings); per-boss registries
  `SideScroll.BOSS_AI/BOSS_DRAW/BOSS_HINT/BOSS_INTRO` (bespoke cog fights live in 19b); pinned bottom
  hint bar during road boss fights; `groundYAt` skips ceiling strips. Road segs must be exactly 14
  uniform-width rows — join() throws otherwise.
- **Crags & companion (27):** `Game.companionActive` = everywhere post-rescue (not underwater);
  zip-wires = `zipanchor` OBJ pairs + `Game.tryZip`/`updateZip` (interact wrap + tick after
  Player.update); slick 'ice' rims on EVERY exposed terrace edge are the gloves-only gate
  (plain +1 edges are sandal-jumpable — seal them); vale->coast links surface the world map.
- **Museum & Combiner (24/25/26):** zoo wings = small maps behind gated DOORs; pens fill via
  `Game.populateZoo` chain; trophies/pedestals/pillows are `Game.OBJDRAW` types; THE COMBINER is
  menu type `'combine'` (recipes in `Game.RECIPES`, tiers via sc_*/boss flags); hay is the 6th bait;
  new-species placeholder sprites install via a `buildAllSprites` wrapper and step aside for sheet art.
- **Cutscenes:** `Game.startCutscene(beats,onDone)`; beats are `{title,text,draw(c,t)}`. Prefer real sprites
  (`Sprites.noah.down[...]`, `Sprites.ramsi`, the level's NPC) over abstract shapes.

---

## 8. Lessons learned (gotchas that already bit us)

- **External-only creatures rendered 2× too big / chunky:** `densFor` returns 1 when there's no base sprite,
  so 32px (DENSITY-2) art was read as 32 *logical* px. Fix: in `installExtSprite` creature kind, default
  external-only sprites to `dens=2`. (Watch for this on any new own-art creature.)
- **"Lost all custom art":** `applyExtArt` must build a proper data URI — `EXT_ART` stores *raw* base64, so
  decode with `'data:image/png;base64,'+b64`.
- **Pixel-art at non-integer zoom shimmers:** pick `viewScale` values that keep tiles integer-sized
  (0.75 → 12px logical tiles is clean).
- **Pipeworks water:** fill by **connectivity** (BFS source→pond decides fill), not gravity, or 1-wide maze
  corridors "siphon" wrongly. Keep `_waterSrc`/`_pondSet` and the `_siphon` test.
- **Big painterly images** (map bg, clock dial) want smooth resize + `imageSmoothingEnabled=true` for that one
  draw; chunky in-world sprites want the snapping importer (off by default).
- **Auto-intro** reads the first NPC (else first sign) on city-zone entry; suppress it in tests with
  `Game.flags['intro_'+id]=1; Game._pendingIntro=null`.

---

## 9. Working style that fit this project

Small, verifiable steps: edit → `node --check` → `build.py` → run the relevant `_*` test → screenshot →
look at it. Keep the 17-suite set green. When something's visual, **always render and actually view it**
before declaring done. Ask before big redesigns; otherwise pick the obvious option and note it.
