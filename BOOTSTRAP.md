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

---

## 2. Build & run (the core loop)

```
python3 build.py        # concatenates src/NN_*.js (sorted) -> BuffNoahsQuest_v4.html + game.js,
                        # and embeds assets/*.png as base64 into EXT_ART
```
Open `BuffNoahsQuest_v4.html` to play. `game.js` is the same code for the Node test harness.

There is **no bundler/transpiler** — it's hand-rolled concatenation. Files are plain strict-mode JS;
top-level `function` declarations hoist across files, `const`/`let` are script-scoped at runtime.

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
- **The `canvas` module lives in `/tmp` and gets wiped between sessions.** If tests error on
  `Cannot find module 'canvas'`: `cd /tmp && npm install canvas` (then retry).
- **Core regression set (keep all green):**
  `validate smoke playthrough features features2 underburrow _icefield _zoo _cogwerk _pipeworks
   _siphon _randmaze _starcut _world3map _rooftops _world4 _polish`
- **Screenshots:** most `_*shot.js` tests set up a state, call `H.render()`, and
  `fs.writeFileSync(... H.canvas.toBuffer('image/png'))`. Copy one to make a new view. The render
  canvas is `SW×SH×SCALE` = 656×272×2; the world view is the left `480×272` logical region, the HUD
  panel is the right 176px.

---

## 5. The art pipeline (and the "I edited a PNG" answer)

```
assets/raw/<art>.png  --(python3 import_art.py)-->  assets/<key>.png  --(python3 build.py)-->  embedded in HTML
```
- `import_art.py` slices sheets (`sheet.<name>.png`) per its `SHEETS` dict, keys out the background
  (handles white/checker bgs via border flood-fill), **snaps to a chunky pixel grid**, snaps near-palette
  colors, darkens outlines to `#241a33`, and writes `assets/<key>.png` at **DENSITY=2** (stored 2× the
  logical size). Single files use `ASSET_SIZES[key]`.
- **`scene.*` (backgrounds/dialogue portraits)** are NOT snapped — process them with a small custom
  Python script (open, optional bg-key, smooth resize, save `assets/scene.<name>.png`). Examples:
  `scene.world3bg` (the overview map), `scene.lady`, `scene.trader`.
- **`.big.png` override:** drop `assets/raw/<key>.big.png` and the importer's second pass converts it
  *after* the normal pass, so it wins every import (good for hand-made art that must survive re-imports).
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
