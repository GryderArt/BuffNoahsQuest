# ASSETS_WORLD3.md — sheet prompts for World 3 art, cutscene stars & Super Ramsi

Addendum to **ASSETS.md**. Same pipeline: paste the MASTER PROMPT from ASSETS.md once,
then request each sheet below as a **1024×1024 PNG, transparent background**. Save it to
`assets/raw/<filename>`, run `python3 import_art.py`, then `python3 build.py`.

**Sheet rule:** put each sprite in its own cell of an evenly-spaced grid with clear empty
(transparent) gutters between sprites — the importer auto-finds each sprite by its blob, so
sprites must NOT touch. Render them row-major in the order listed. Sizes are SILHOUETTE cells
(2× finer inner detail survives). Keep the plum #241a33 outline and flat top-lit colors.

---

## 1) `sheet.blazagon.png` — Blazagon, the fiery roof-dragon (the World-3 prize catch)

A 2×2 grid, 4 sprites, each ~**28×26**, facing RIGHT. Big-jawed muscular red dragon-man with a
yellow flame crest, fierce grin, yellow trunks. He should read at a glance even when small.

1. **idle A** — standing tall, fists up, chest puffed, flame crest calm.
2. **idle B** — same, breathing bob: shoulders a touch lower, crest flickers a little wider.
3. **run A** — leaning forward, one leg lifted mid-stride, arms pumping, flame crest streaming back.
4. **leap** — airborne pose, body arched, both legs tucked, arms spread, a small flame trail off heels (he BOLTS roof-to-roof when you net him — this is that hop).

Importer keys (add to `SHEETS` in import_art.py): `creature.blazagon.a`, `creature.blazagon.b`,
`creature.blazagon.run`, `creature.blazagon.leap`. (a/b already drive walk; run/leap are optional polish.)

---

## 2) `sheet.rooftiles.png` — High-Roofs tileset (replaces the procedural rooftop look)

A 4×2 grid, 8 tiles, each **16×16**, drawn as seamless top-down tiles (fill the whole cell, no
outline border — these tile against each other). Cool slate-gray city palette + warm window glow.

1. **roof** — flat tar-and-gravel roof deck, subtle seams, a couple of gravel specks.
2. **roofb** — lighter shingled roof variant, faint rows.
3. **parapet** — roof-edge brick lip: light stone cap on top third, brick courses below.
4. **skygap** — the deep VOID between towers: near-black blue, faint horizontal haze, a few tiny
   far-below window lights.
5. **facade_win** — a building-side wall segment seen head-on: gray concrete with TWO lit windows
   (warm gold) and a dark mullion — tiles vertically to form a tower wall.
6. **facade_blank** — same wall, no windows (a solid floor band) — alternates with #5 going down.
7. **acunit** — a metal rooftop AC/vent box with a grille and round fan, small bevel highlight.
8. **skylight** — a glass skylight panel: pale blue panes, dark cross-frame, a white glint.

Importer keys (new `tile.*` group — or wire as TileArt overrides): `tile.roof`, `tile.roofb`,
`tile.parapet`, `tile.skygap`, `tile.facadeWin`, `tile.facadeBlank`, `tile.acunit`, `tile.skylight`.

---

## 3) `sheet.roofprops.png` — rooftop traversal props

A 3×1 row, 3 sprites, transparent. These read as the "verbs" of the level.

1. **anchor** (~**12×14**) — a brass grappling ANCHOR on a short post: a polished hook/ring on a
   riveted copper stanchion, a faint gleam. (the harpoon target)
2. **glidepuff** (~**14×10**) — Ramsi inflated into a round parachute-puff with a tiny face and
   stubby legs, soft white belly. (shown mid-glide)
3. **antenna** (~**10×16**) — a thin rooftop radio antenna with a blinking red tip (decor).

Keys: `prop.anchor`, `prop.glidepuff`, `prop.antenna`.

---

## 4) `sheet.stars.png` — STAR-CELL cutscene graphics

A 3×2 grid, 6 sprites, transparent, on the ICE-BLUE/GOLD palette. Used by the "star-cell secured"
celebration cutscene (and the HUD).

1. **starcell** (~**18×18**) — a four-point CLOCKWORK star-cell: ice-blue crystal star with a small
   gold gear at its heart, bright core.
2. **starcell_dim** — same, unlit/grayed (for the "X of 4" tracker, not-yet-collected slots).
3. **starburst** (~**24×24**) — the star with long radiant gold rays bursting outward (the moment of collection).
4. **star_small** (~**8×8**) — a tiny sparkle star (scatter these in the cutscene).
5. **ribbon4** (~**26×10**) — a little banner reading nothing (blank scroll) for "★ 4 / 4" overlays.
6. **superseal** (~**20×20**) — all four star-points fused into a blazing gold-and-blue emblem (shows
   when the 4th is gathered → unlocks Super Ramsi).

Keys: `item.starcell`, `item.starcellDim`, `fx.starburst`, `fx.starSmall`, `prop.ribbon`, `item.superseal`.

---

## 5) `sheet.superramsi.png` — SUPER RAMSI (powered-up form, end of World 4)

A 2×2 grid, 4 sprites, each ~**24×20**, facing RIGHT. Ramsi is normally a small woolly ram-spirit;
SUPER RAMSI is his star-charged form: bigger, golden fleece tipped with ice-blue energy, glowing
gold eyes, a small four-point star hovering at his brow, wisps of aura. Heroic but still cute.

1. **idle A** — hovering proudly, aura calm, star at brow steady.
2. **idle B** — aura pulse: fleece tips brighter, a faint ring of star-sparks around him.
3. **charge** — reared back, head down, horns forward, gathering a bright star-energy ball between the horns.
4. **blast** — lunging forward, a beam/comet of gold-blue star-energy firing from the horns (the finishing move on the final boss).

Keys: `boss.ramsiSuper.a`, `boss.ramsiSuper.b`, `boss.ramsiSuper.charge`, `boss.ramsiSuper.blast`.

---

## 6) `sheet.cogcreatures.png` — the Cogwerk City clockwork creatures (the "clear the city" pests)

A 5×2 grid, **10 sprites** (one creature per ROW, two walk frames per row: **A** then **B**), facing
RIGHT, transparent. These currently borrow other animals' sprites — this sheet gives them their own.
Brass/copper/iron clockwork palette with little glints of electric blue. Each should read its BEHAVIOR
at a glance (the AI tell is in parentheses).

1. **Volt-Bug** (~**16×10**) — a small, fast clockwork insect crackling with electricity *(aggressive,
   stings, darts at you)*. Brass beetle body, two big glassy lens-eyes, sparking antennae, blurry copper
   wings, a blue zap arcing between its feelers.  •A: wings up.  •B: wings down (buzzing).
2. **Cog-Hopper** (~**16×10**) — a jumpy mechanical hopper, half brass grasshopper / half spring-loaded
   jackrabbit *(skittish, VERY fast, flees)*. Coiled-spring hind legs, big nervous eyes, cog ears.
   •A: crouched, springs compressed.  •B: mid-hop, legs flung out.
3. **Rust-Beetle** (~**16×8**) — a slow, heavily-armored rusty beetle *(tanky — must be STUNNED then
   netted)*. Domed rust-orange riveted carapace, stubby iron legs, a grumpy little face peeking out.
   •A/B: a heavy leg shuffle.
4. **Steam-Bull** (~**16×11**) — a stocky steam-powered mechanical bull *(charges in straight lines,
   feisty)*. Iron body, brass horns, a riveted snout with a steam valve, a glowing furnace belly.
   •A: standing, a small steam puff.  •B: head-down charge stance, steam BLASTING from the snout.
5. **Spark-Drone** (~**16×10**) — a hovering spark drone *(aggressive, can't be dazed, stings)*. A
   floating brass orb with a single glowing eye-lens, a bright electric core, little rotor fins on top,
   and dangling sparking tendrils below.  •A/B: tendrils sway, core pulses.

Importer keys (add a `sheet.cogcreatures` entry to `SHEETS`, row-major): `creature.voltbug.a`,
`creature.voltbug.b`, `creature.coghopper.a`, `creature.coghopper.b`, `creature.rustbeetle.a`,
`creature.rustbeetle.b`, `creature.steambull.a`, `creature.steambull.b`, `creature.sparkdrone.a`,
`creature.sparkdrone.b`. (Then change each entry's `sprite:'alien'/'snowhare'/'crab'/'ram'/'jellyfish'`
in `07_entities.js` to its own species name — I can wire that.)

---

## 7) The LADY OF THE LAKE (Pipeworks) — NPC sprite + dialogue portrait

She revives with the pond and grants STAR-CELL #2. Right now she falls back to the generic "spirit"
sprite — give her her own. Two requests (each its OWN file, transparent):

- **`npc.lady.png`**  (~**16×18** silhouette) — a serene water-spirit lady, full body, facing the
  viewer: flowing teal / ice-blue robes whose hem dissolves into water and mist, pale luminous skin,
  long rippling hair, a gentle circlet of water-droplets (or a single lily), hands cupping a small
  glowing star-cell. Kind, calm, slightly translucent. Palette: teal #40c0b8, ice-blue #9adcf8,
  white #fff8f0, with a gold #f8d048 star.

- **`scene.lady.png`**  (a single **1024×1024** head-and-shoulders DIALOGUE PORTRAIT, same framing as
  `scene.trader`) — the Lady of the Lake up close: luminous watery skin, kind knowing smile, hair and
  shoulders trailing into ripples and droplets, a soft aqua glow behind her, offering the star-cell in
  one hand. Storybook pixel look, plum outline, ice-blue/teal palette. (Drives her dialogue box.)

Importer keys: `npc.lady` (add `'npc.lady': [16, 18]` to `ASSET_SIZES`; it slots in via the existing
NPC override path) and `scene.lady` (scene portraits import automatically). Then in `09_systems.js` her
dialogue `D('Lady of the Lake', 'spirit', ...)` switches `'spirit'` -> `'lady'`, and `NPC(..., 'lady', ...)`
already names her sprite — I can wire both.

---

## Wiring notes (after the art exists)
- Single tiles (#2) can override the procedural `paintTileBase` cases via the existing `tile`/TileArt
  override path, or stay procedural if you prefer the current look.
- `sheet.*` files need one line each in `SHEETS` in `import_art.py` listing the keys in render order.
- The star + Super-Ramsi art slot straight into the cutscene draw (`drawStarGet`) and Ramsi's
  super-form draw once those frames exist — say the word and I'll wire them.

---

## 8) `world3bg.png` — the COGWERK overworld / World-3 map background

A single full-bleed background image for the World-3 overview map (the screen you ESC to). Save it as
`world3bg.png` in `assets/raw/` and I'll process it to `assets/scene.world3bg.png` (the map auto-uses
it; otherwise it falls back to the procedural gears). Aspect ratio **480 × 272** (≈16:9) — generate at
**1920 × 1088** (or any 16:9) and it'll be scaled down.

**Paste this into ChatGPT (image gen):**
```
A top-down fantasy WORLD MAP illustration for a kid-friendly storybook adventure game, in the style of
a hand-painted Zelda-like overworld map — but themed as a CLOCKWORK CITY at golden dawn. 16:9, 1920x1088.

Layout (leave these regions readable, with open space for round level icons that I will draw ON TOP):
- LOWER-CENTER: a small green GREENWOOD VALE — rolling hills, a tiny cottage, the edge of a forest,
  with a great brass CLOCKWORK GATE where the green meets the city.
- LEFT-CENTER: the sprawling brass-and-copper COGWERK CITY plaza, turning gears and a clock-tower.
- MID-CENTER, lower: a tangle of PIPES and a small revived blue POND (the Pipeworks), steam wisps.
- UPPER-CENTER/RIGHT: a SKYLINE of tall rooftops poking through clouds (the High Roofs).
- FAR RIGHT: a dark storm-wreathed CITADEL silhouette with an ominous red glow (the final boss lair).
- Winding brass-rail / cobble PATHS link these regions left-to-right in a gentle S-curve.

Style: warm storybook palette (brass gold #caa044, copper, deep teal shadows, dawn-orange sky),
chunky soft pixel-art / painterly hybrid, plum-dark outlines, gentle top light, NO text, NO labels,
NO character sprites, NO UI. Cohesive, slightly muted so bright icons read on top. Fully filled frame.
```

After you save `world3bg.png`, I'll wire + rebuild — the overview map then renders your painting with
the level icons (Cogwerk City, Pipeworks, High Roofs, All-Beast, Vale-exit) drawn over it.

---

## 9) CLOCK-TOWER art — make Cogwerk City (Level 1) match the world map's brass tower

The cog1 climb is now a **slender clock-tower rising into an open sunset sky** (narrow tower in the
middle, sky to its left & right with no border tiles, a great CLOCK on the crown). Everything renders
**procedurally right now** — these three files swap in the hand-painted versions. All on the established
storybook palette: plum **#241a33** outlines, brass **#caa044**, copper, ivory **#f4ead2**, dawn-orange
sky, gentle top light, NO text/labels/UI.

### 9a) `clockface.png` — the great tower clock (single file, ~**512×512**, TRANSPARENT, round)
The ornate DIAL only — **draw NO hands** (the game animates the brass hands on top). Fill the frame with a
single big round clock seen head-on:
```
A large ornate antique tower CLOCK FACE, head-on, round, filling a square transparent frame — pixel-art
storybook style. A thick polished BRASS ring with rivets and tiny gear-teeth around the outer rim; an
inner filigree border; a clean IVORY/cream dial (#f4ead2) with bold dark plum hour marks — chunky tick
marks with the 12/3/6/9 a touch larger (or simple roman numerals). A little gold GEAR sits behind a round
glass boss at the very center. Warm dawn light from upper-left, soft brass sheen on the top rim, gentle
shadow on the lower rim. Plum-dark #241a33 outline. NO clock hands. NO text other than the hour marks.
```
Key: `prop.clockface` (drops straight into the clock object — it already prefers this art and keeps the
animated hands on top). Save as `assets/raw/prop.clockface.png`.

### 9b) `sheet.towerwalls.png` — ornate brass tower masonry (1024×1024, **3×2 grid, 6 tiles @ 16×16**)
Seamless top-lit tiles (fill the whole cell, no outline border — they tile against each other) that
replace the plain brass wall **on the tower only**. Brass/copper, warmer & fancier than the street walls:
```
1. tower_panel  — a riveted polished-brass wall panel with a faint vertical pilaster groove and corner rivets.
2. tower_gear   — same panel with a raised GEAR EMBLEM medallion centered (brass, dark hub).
3. tower_pilasterL — the tower's LEFT edge: a fluted brass column/pilaster, lit on its left face, shadow to the right.
4. tower_pilasterR — the RIGHT edge: mirror of #3, lit on the right, shadow to the left.
5. tower_window — a tall arched WINDOW glowing warm gold (#ffcf7a) behind a brass frame and sill.
6. tower_cornice — a horizontal decorative MOLDING band (brass cornice with little dentils) — a floor divider.
```
Keys (new `tile.*` group): `tile.towerPanel`, `tile.towerGear`, `tile.towerPilasterL`, `tile.towerPilasterR`,
`tile.towerWindow`, `tile.towerCornice`. (I'll add a `towerwall` tile id + the four edge/feature variants
and repaint the tower with them — gearwall elsewhere stays as-is.)

### 9c) `sheet.skyprops.png` — sunset sky decor (1024×1024, **3×2 grid**, TRANSPARENT)
Soft painterly props layered OVER the procedural sunset gradient for depth:
```
1. cloud_big  (~48×22) — a soft puffy SUNSET cloud, peach-gold lit top (#ffe8c0), rosy underside (#c66c76).
2. cloud_small(~32×16) — a smaller wispy cloud, same lighting.
3. sun        (~40×40) — the soft SETTING SUN: pale-gold core (#fff3c8) fading into a warm hazy halo, no hard edge.
4. spire      (~28×40) — the tower's crowning FINIAL: a slender brass spire with a little gear-and-arrow
   WEATHERVANE on top and a pennant; sits above the clock at the very peak.
5. birds      (~20×10) — a tiny distant V-flock of 3 birds (a faint flourish for the sky).
6. airship    (~44×24) — optional: a small brass dirigible/blimp drifting far off (matches the world-map sky).
```
Keys: `prop.cloudBig`, `prop.cloudSmall`, `prop.sun`, `prop.spire`, `prop.birds`, `prop.airship`.
(I'll scatter the clouds/birds/airship across cog1's sky, set `prop.sun` where the procedural sun-glow is
now, and stand the `spire` on the crown above the clock.)

### Wiring (after the art exists — say the word)
- **9a** needs nothing new: the clock render already falls back to `Sprites.props.clockface` and draws the
  moving hands over it.
- **9b**: I add a `towerwall` TILEDEF (+ L/R-edge, gear, window, cornice variants), repaint the tower's
  outer walls / crown / gate frames with them, and route the six tiles through the `tile` override path.
- **9c**: pure decor — I place the props in cog1's `sky` region (parallax-free, behind the tower).
- Same pipeline as the rest: drop files in `assets/raw/`, I add the `SHEETS`/`ASSET_SIZES` lines, run
  `import_art.py`, then `build.py`.
