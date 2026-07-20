# SHEET_PROMPTS.md - generate ALL game art in 11 ChatGPT images


> **HD UPDATE:** sprites are now stored at 2x pixel density — the importer keeps twice
> the detail per game pixel (Noah is 32x40 in storage, drawn at 16x20 world size). The
> design grids below are SILHOUETTE sizes; fine inner detail up to 2x finer survives.

ChatGPT can't bundle 100 separate downloads, so each prompt below packs a whole
category into ONE sprite-sheet image. Eleven images = the entire game (sheet 10 = the Skyward Ascent finale; sheet 11 = World 2, The Underburrow).

## Workflow

1. Open one ChatGPT conversation. Paste the MASTER PROMPT once.
2. Paste sheet prompt 1. Download the image, save it into `noahs-quest-v4/assets/raw/`
   with the EXACT filename shown in the prompt header (e.g. `sheet.noah.png`).
3. Say "next" and paste sheet prompt 2... through 9 (sheet 9 is optional).
4. Run `python3 import_art.py` - it auto-slices every `sheet.*.png` into the right
   per-sprite assets, snapped to true game resolution.
5. Check the output it prints, peek at `assets/*.png`, then `python3 build.py` and reload the game.

If one cell comes out bad, you can regenerate just that sprite later using the
single-item prompts in ASSETS.md - singles overwrite sheet results.

---

## MASTER PROMPT (paste first, once)

```
You are the pixel artist for "Buff Noah's Quest", a kid-friendly top-down
Zelda-like adventure with a saturated storybook look. I will ask for a series
of SPRITE SHEETS, one image each. Rules for EVERY sheet:
- The image is divided into an INVISIBLE grid of equal cells (I give columns x
  rows each time). NO visible grid lines, NO labels, NO text, NO numbers.
- Exactly one sprite per listed cell, centered, filling about 70% of its cell.
  Nothing may touch or cross a cell border. Leave listed-empty cells EMPTY.
- Fully TRANSPARENT background everywhere.
- Style: chunky, cute, readable pixel art with big simple silhouettes. Each
  sprite is designed on a tiny grid of W x H pixel-cells (given per sprite) and
  rendered crisp and blocky - no detail smaller than one design cell.
- Every sprite gets a 1-cell dark outline in PLUM #241a33 (never pure black).
- Flat colors: one base per material + at most one lighter top highlight and one
  darker bottom shade. Light from above. NO gradients, NO anti-aliasing, NO
  dithering, NO drop shadows, NO ground planes.
- Palette: outline #241a33, skin #f8c896 (shade #e0a070), gold #f8d048, deep
  gold #f8b800, red #e84a4a, blue #4878e8, green #58c452, brown #a8703c, gray
  #aab2c0, pink #f898c8, purple #9a62e0, orange #f89238, teal #40c0b8, ice
  blue #9adcf8, fluff white #fff8f0.
- Side-view characters and creatures FACE RIGHT unless a cell says otherwise.
- Keep each character IDENTICAL across all its cells (same colors and design),
  changing only the pose described.
Reply with the image only.
```

---

## SHEET 1 of 9 - NOAH (v2: full walk cycles + surface swimming)

Save the result as: **`sheet.noah2.png`** -> `assets/raw/`
(Your original `sheet.noah.png` stays valid for the underwater swim frames.)

```
Generate sheet image NOAH2, size 1024x1024, transparent background,
invisible grid of 4 columns x 4 rows. The SAME hero in every cell: cheerful
over-muscled blond boy, short gold hair, big arms, blue tee with red camo
patches, dark gray pants, black shoes. Keep his design IDENTICAL across all
cells; only the pose changes. Walk cycles use 4 frames: A = LEFT foot planted
forward, B = RIGHT foot planted forward, C = passing pose (feet together
under body, knees slightly bent, mid-stride between A and B), D = second
passing pose (feet together, arms at the opposite swing). Cell contents
(left to right, top to bottom; design grid 16x20 unless noted):
- R1C1: walking toward camera, frame A
- R1C2: walking toward camera, frame B
- R1C3: walking toward camera, frame C
- R1C4: walking toward camera, frame D
- R2C1: walking away from camera (back view, gold hair), frame A
- R2C2: walking away, frame B
- R2C3: walking away, frame C
- R2C4: walking away, frame D
- R3C1: walking side view FACING RIGHT, frame A
- R3C2: side view facing right, frame B
- R3C3: side view facing right, frame C
- R3C4: side view facing right, frame D
- R4C1: back view, both arms raised overhead gripping a ledge (climbing)
- R4C2: [design 20x12, WIDE flat composition] SWIMMING AT THE SURFACE facing
  right: teal dive hood, face and one eye visible above the waterline, orange
  wetsuit shoulders awash, one arm raised mid-recovery, white splash foam line
  across the water surface - only his top half shows, no legs
- R4C3: [design 20x12] same surface swimmer, front-crawl arm extended forward
  past his head, splash variant
- R4C4: EMPTY (leave fully transparent)
```

---

## SHEET 2 of 9 - CREATURES

Save the result as: **`sheet.creatures.png`** -> `assets/raw/`

```
Generate sheet image CREATURES, size 1024x1024, transparent background,
invisible grid of 4 columns x 4 rows. Cell contents (left to right, top to
bottom; "design WxH" is each sprite's tiny pixel-design grid):
- R1C1: [design 16x10] fluffy white sheep facing right, dark cute face, stubby legs
- R1C2: [design 16x10] fluffy white ram facing right, big golden curled horns, dark face
- R1C3: [design 16x10] white goat facing right, small gray horns, happy face
- R1C4: [design 16x9] white snow hare facing right, tall upright ears, pink nose
- R2C1: [design 16x8] little red crab, front view, claws raised, stalk eyes
- R2C2: [design 16x9] round pink octopus, front view, big sweet eyes, curly tentacles
- R2C3: [design 16x8] pink jellyfish, rounded bell, trailing wavy tentacles
- R2C4: [design 16x8] small gray cartoon shark facing right, white belly, dorsal fin, friendly eye
- R3C1: [design 16x8] sea-goat facing right: white goat head with little gold horns, teal fish tail body
- R3C2: [design 16x7] orange starfish school-kid with one big eye, front view
- R3C3: [design 16x10] small green alien, front view, two big dark eyes, round head
- R3C4: [design 16x10] white unicorn facing right, golden horn, pink mane
- R4C1: [design 16x8] ice-blue puppy facing right, floppy ears, sparkling gold comet trail behind
- R4C2: [design 20x11] small green dragon facing LEFT, long tail trailing right, red chest scales, tiny wings
- R4C3: [design 16x8] brown condor in flight, wings spread, white head ruff, orange beak
- R4C4: [design 16x9] brown mountain ibex facing right, big backward-curving horns
```

---

## SHEET 3 of 9 - NPCS

Save the result as: **`sheet.npcs.png`** -> `assets/raw/`

```
Generate sheet image NPCS, size 1536x1024 (landscape), transparent background,
invisible grid of 4 columns x 3 rows. Cell contents (left to right, top to
bottom; "design WxH" is each sprite's tiny pixel-design grid):
- R1C1: [design 16x16] sweet granny chibi, front view: gray hair bun, glasses, pink dress, white apron
- R1C2: [design 16x16] merchant chibi, front view: brown wide hat, mustache, red vest over white shirt
- R1C3: [design 16x16] trapper woman chibi, front view: green ranger coat with gold clasps
- R1C4: [design 16x16] old sailor chibi, front view: blue sailor coat, gold buttons, weathered grin
- R2C1: [design 16x16] alien bounty hunter chibi, front view: green skin, purple coat with gold trim
- R2C2: [design 16x16] cliff trader chibi, front view: orange climber coat, rope coil on shoulder
- R2C3: [design 16x16] generic trader chibi, front view: green coat, gold sash
- R2C4: [design 16x15] teacher-bird chibi, front view: purple plumage, white face, orange beak
- R3C1: [design 16x16] alien pilot chibi, front view: green skin, big dark eyes, two antennae, gray spacesuit with gold badge
- R3C2: [design 16x12] gentle mountain spirit: ice-blue ghost, serene face, wispy trailing bottom, no legs
- R3C3: EMPTY (leave fully transparent)
- R3C4: EMPTY (leave fully transparent)
```

---

## SHEET 4 of 9 - BOSSES

Save the result as: **`sheet.bosses.png`** -> `assets/raw/`

```
Generate sheet image BOSSES, size 1536x1024 (landscape), transparent background,
invisible grid of 3 columns x 2 rows. Cell contents (left to right, top to
bottom; "design WxH" is each sprite's tiny pixel-design grid):
- R1C1: [design 32x21] KING BILLY: huge armored goat king, front view - white goat face, giant golden curled horns, gray plate armor, sturdy legs, regal scowl (WIDE composition)
- R1C2: [design 27x15] CERBERUS: cute brown puppy body with THREE happy puppy heads in a row, floppy ears (WIDE composition)
- R1C3: [design 21x25] MIMI SAHOR: blue ram-imp standing upright, big golden curling horns, white face with pink blush, gold chain, holding a small bat, white-and-gold sneakers (TALL composition)
- R2C1: [design 20x11] starfish boss body core ONLY: round orange starfish center, tiny gold crown on top, happy eyes, pink blush - NO arms (the game draws them)
- R2C2: [design 22x16] RAMSI: soft pillow-shaped plush ram, light Carolina-blue body, white face panel with sweet eyes, small gold horns, lying flat like a pillow (WIDE composition)
- R2C3: [design 22x5] a horizontal strip of golden cage bars: vertical gold bars with dark gaps (VERY WIDE, short strip)
```

---

## SHEET 5 of 9 - PROPS

Save the result as: **`sheet.props.png`** -> `assets/raw/`

```
Generate sheet image PROPS, size 1536x1024 (landscape), transparent background,
invisible grid of 4 columns x 3 rows. Cell contents (left to right, top to
bottom; "design WxH" is each sprite's tiny pixel-design grid):
- R1C1: [design 16x8] closed wooden treasure chest, front view, dark wood bands, gold lock
- R1C2: [design 16x8] the same wooden chest, lid open, dark empty inside
- R1C3: [design 16x9] small wooden signpost: tan plank face with carved marks, single post leg
- R1C4: [design 16x9] golden harpoon anchor: gold ring target on a short wooden post
- R2C1: [design 16x7] little red-and-white striped sea buoy, tiny gold light on top
- R2C2: [design 16x6] small golden trap cage, open barred sides
- R2C3: [design 16x9] heavy gray stone push-block, carved square border
- R2C4: [design 20x7] crashed flying saucer side view: ice-blue dome, gray hull with gold lights (WIDE)
- R3C1: [design 8x9] ice-blue glowing crystal cluster on a purple base (small and tall)
- R3C2: [design 8x9] small beacon lamp: glowing gold top on a gray post (small and tall)
- R3C3: EMPTY (leave fully transparent)
- R3C4: EMPTY (leave fully transparent)
```

---

## SHEET 6 of 9 - ITEM ICONS

Save the result as: **`sheet.items.png`** -> `assets/raw/`

```
Generate sheet image ITEMS, size 1024x1024, transparent background,
invisible grid of 4 columns x 4 rows. Cell contents (left to right, top to
bottom; "design WxH" is each sprite's tiny pixel-design grid):
- R1C1: [design 7x6] tiny red heart icon
- R1C2: [design 7x6] tiny pink heart-container icon with hollow shine
- R1C3: [design 6x6] tiny gold coin icon
- R1C4: [design 6x5] tiny ice-blue gem icon
- R2C1: [design 6x6] tiny gold key icon
- R2C2: [design 6x6] tiny red key icon with white glint
- R2C3: [design 6x6] tiny green four-leaf clover icon
- R2C4: [design 6x5] tiny gray tin can icon
- R3C1: [design 6x5] tiny orange fish-cracker icon
- R3C2: [design 6x5] tiny tan cookie icon with gold star sprinkles
- R3C3: [design 6x5] tiny berry icon with little rainbow color patches
- R3C4: [design 6x5] tiny white dog-bone icon
- R4C1: [design 6x5] tiny glowing gold star-shard icon
- R4C2: [design 6x5] tiny gold crown icon
- R4C3: [design 6x4] tiny green sprouting seed icon
- R4C4: EMPTY (leave fully transparent)
```

---

## SHEET 7 of 9 - GEAR & TOOL ICONS

Save the result as: **`sheet.gear.png`** -> `assets/raw/`

```
Generate sheet image GEAR, size 1536x1024 (landscape), transparent background,
invisible grid of 4 columns x 3 rows. Cell contents (left to right, top to
bottom; "design WxH" is each sprite's tiny pixel-design grid):
- R1C1: [design 10x9] spring sandal: red strap, green springy sole, tiny gold heel-wing
- R1C2: [design 10x8] chunky orange climbing glove with grip pads
- R1C3: [design 10x8] dive icon: teal helmet with white glint above an orange wetsuit torso
- R1C4: [design 10x7] one white feathered angel wing
- R2C1: [design 10x7] gold arm bracer with three white gems
- R2C2: [design 10x7] chunky red mitten with white cuff
- R2C3: [design 10x7] white net mesh on a brown handle, diagonal
- R2C4: [design 10x7] gold-tipped harpoon spear, diagonal
- R3C1: [design 10x5] small golden cage, front view
- R3C2: [design 10x5] white dog bone with a motion sparkle
- R3C3: EMPTY (leave fully transparent)
- R3C4: EMPTY (leave fully transparent)
```

---

## SHEET 8 of 9 - TREES

Save the result as: **`sheet.trees.png`** -> `assets/raw/`

```
Generate sheet image TREES, size 1536x1024 (landscape), transparent background,
invisible grid of 3 columns x 2 rows. Cell contents (left to right, top to
bottom; "design WxH" is each sprite's tiny pixel-design grid):
- R1C1: [design 24x30] big leafy storybook tree: round layered green canopy, light leaf tufts on top, brown trunk with root flare
- R1C2: [design 20x30] snowy pine: dark green triangle tiers with white snow rims, brown trunk
- R1C3: [design 24x30] beach palm: brown curved segmented trunk, splayed green fronds, two coconuts
- R2C1: EMPTY (leave fully transparent)
- R2C2: EMPTY (leave fully transparent)
- R2C3: EMPTY (leave fully transparent)
```

---

## SHEET 9 of 9 - NOAH IN DIVE GEAR (optional)

Save the result as: **`sheet.noahdive.png`** -> `assets/raw/`

```
Generate sheet image NOAHDIVE, size 1024x1024, transparent background,
invisible grid of 3 columns x 3 rows. Cell contents (left to right, top to
bottom; "design WxH" is each sprite's tiny pixel-design grid):
- R1C1: [design 16x20] Noah in dive gear walking toward camera: teal dive hood instead of hair, face visible, orange wetsuit, dark teal legs; left foot forward
- R1C2: [design 16x20] dive-gear Noah toward camera, other foot forward
- R1C3: [design 16x20] dive-gear Noah from behind; left foot forward
- R2C1: [design 16x20] dive-gear Noah from behind, other foot forward
- R2C2: [design 16x20] dive-gear Noah side view facing right; left foot forward
- R2C3: [design 16x20] dive-gear Noah side view facing right, other foot forward
- R3C1: [design 16x20] dive-gear Noah from behind, arms raised gripping a ledge
- R3C2: EMPTY (leave fully transparent)
- R3C3: EMPTY (leave fully transparent)
```

---

## PROMPT RULES LEARNED (apply to EVERY future sheet — hard-won)

1. CELL CONTAINMENT, say it explicitly: "Every sprite must fit ENTIRELY inside its
   own invisible grid cell with ~10% empty padding on all four sides. NOTHING may
   touch or cross a cell border." (The barn and the Combiner machine both bled into
   neighbor cells and were sliced in half; wide items are the usual offenders —
   give them their own row or generous cells.)
2. BACKGROUND, say it explicitly: "TRANSPARENT background (checkerboard), NOT solid
   white." Pure-white backgrounds fight white fur/feathers/glow (griffin, mermaid,
   centaur) and need the tight keyer; true transparency imports perfectly.
3. GLOW & AURAS: if a sprite has a soft glow (prisma-beast, super-forms), call it
   out in the prompt AND import it with the gentle soft-alpha keyer — never the
   flood keyer, never the palette snapper.
4. One more repair tool: content-cluster re-slicing (connected components + merge)
   recovers a sheet whose art ignored the grid — but rule 1 makes it unnecessary.

## Gotchas

- Filenames are the contract: `sheet.noah.png`, `sheet.creatures.png`, `sheet.npcs.png`,
  `sheet.bosses.png`, `sheet.props.png`, `sheet.items.png`, `sheet.gear.png`,
  `sheet.trees.png`, `sheet.noahdive.png`.
- BACKGROUNDS: don't stress about ChatGPT's fake transparency. The importer now
  removes the background by FLOOD FILL from the image border, so all of these work
  without any third-party editing: real transparency, solid white, off-white,
  the gray "transparency checkerboard", or solid magenta. Anything connected to
  the border in background-ish colors is removed; sprite interiors are protected
  by their dark outlines. If a sheet stars something WHITE and FLUFFY that touches
  its own silhouette edge a lot (sheep!), magenta #FF00FF is still the safest ask.
- If a sheet comes back with grid lines, labels, or sprites touching borders, regenerate:
  "same sheet, no lines or text, more empty margin inside each cell".
- Keep Noah's hair GOLD and the sheep WHITE (automated tests sample those colors).
- Creature hop frames and Noah's dive palette are auto-derived if you skip them; sheet 9
  only matters if you want custom dive-suit walk art.
- After importing, singles from ASSETS.md can patch any cell you don't like.


---

## SHEET 10 of 11 - SKYWARD ASCENT — Mimi Island sky-finale (the 4 sky bosses + the parents, caged & freed)

Save the result as: **`sheet.skyworld.png`** -> `assets/raw/`

These are the brand-new visuals for World 2. The game already plays with stand-in
art (recolored animals + a drawn cage), so this sheet is a drop-in upgrade: make
it, slice it, rebuild, and the real art appears automatically.

```
Generate sheet image SKYWORLD, size 1536x1024 (landscape), transparent
background, invisible grid of 3 columns x 2 rows. A stormy floating-sky theme:
cool greys, ice-blue (#9adcf8), and storm-purple (#9a62e0) with gold accents.
Each is a chunky, cute, readable BOSS, facing RIGHT, 1-cell plum outline
(#241a33), flat colors. Cell contents (left to right, top to bottom; "design
WxH" is each sprite's tiny pixel-design grid):
- R1C1: [design 28x22] THE GUST WING: a fierce sky-raptor boss - big storm-grey
  eagle/condor with broad spread wings tipped in ice-blue, sharp gold beak,
  angry golden brows, little white wind-swirls curling off the wingtips (WIDE)
- R1C2: [design 26x22] THE PUFF LORD: a grumpy storm-cloud monster - round
  fluffy white-and-lavender cloud body, pouty face, two tiny stubby arms, a few
  yellow lightning sparks crackling along its bottom edge (WIDE)
- R1C3: [design 26x24] SPARKHORN: an electric ram beast - muscular slate-blue
  ram with HUGE spiraled brass horns arcing with yellow lightning, glowing
  white eyes, sparks at the hooves, fierce stance
- R2C1: [design 30x30] THE STORM-LORD (TEMPESTIA): the final boss - a towering
  storm-purple dragon-wizard wrapped in a swirling thundercloud cloak, glowing
  violet eyes, a jagged lightning crown, arms raised menacingly, wisps of
  cloud at the base (TALL, imposing)
- R2C2: [design 32x24] BERKLEY & MEGAN, CAGED: two warm grown-up parents
  huddled close together behind pale-gold cage bars - on the left BERKLEY, a
  friendly bearded dad in a warm blue shirt; on the right MEGAN, a kind mom
  with auburn hair in a red-pink top; both with worried-but-hopeful smiles;
  vertical gold cage bars with dark gaps drawn IN FRONT of them (WIDE)
- R2C3: [design 32x24] BERKLEY & MEGAN, FREED: the SAME two parents now OUT
  of the cage and overjoyed - hugging or arms raised in joy, big happy smiles,
  NO bars; Berkley in the warm blue shirt, Megan with auburn hair in the
  red-pink top (used in the reunion CUTSCENE when you win) (WIDE)
```

After saving `sheet.skyworld.png` into `assets/raw/`, run `python3 import_art.py`
(it slices the cells into `boss.gustwing.png`, `boss.pufflord.png`,
`boss.sparkhorn.png`, `boss.tempestia.png`, `boss.parents.png` (caged), and
`boss.parentsfree.png` (freed - shown in the ending reunion cutscene)), then
`python3 build.py`. The sky bosses and the parents' cage will use your art with
no code changes (the engine falls back to the stand-ins until the files exist).

### Notes / not on this sheet
- **RAMSI the companion** reuses your existing Ramsi art (`boss.ramsi.png`) - no
  new art needed; she just follows Noah and headbutts on her own.
- **Cracked walls, the sky-switch, and the skyfloor** are drawn procedurally in
  code (no PNG needed). If you'd rather hand-paint a cracked-wall tile, say so
  and I'll wire a tile asset for it.
- **A "RAM SUIT" look for Noah** (a horned helmet / armored Noah) would be a
  full alternate walk set - if you want it, generate a Noah-style sheet and ask
  me to wire a `noahram.*` variant into Player rendering (small follow-up).

---

## SHEET 11 of 11 - WORLD 2: THE UNDERBURROW (the 4 Wardens, GNASH, and the Pillow-Kin)

> STATUS: IMPORTED (2026-06-13). sheet.underburrow.png sliced -> boss.mottle/.thornback/.geode/.grub/.gnash + npc.kin1-4; live in-game.

Save the result as: **`sheet.underburrow.png`** -> `assets/raw/`

The bosses and rescue-pals for the SECOND world (an underground burrow). The game runs with
stand-in art until these exist, then slices in via `python3 import_art.py`.

```
Generate sheet image UNDERBURROW, size 1536x1536, transparent background, invisible grid of
3 columns x 3 rows. Earthy underground palette: warm soil browns, mossy greens, glowing
teal/purple crystals; 1-cell plum outline (#241a33), flat colors, each facing RIGHT. Cell
contents (left to right, top to bottom; "design WxH" = each sprite's tiny pixel-design grid):
- R1C1: [design 22x18] MOTTLE THE MOLE: a chubby brown burrow-mole boss, huge digging claws,
  tiny goggles pushed up on its head, buck teeth, cheeky grin, a few flecks of dirt (WIDE)
- R1C2: [design 26x18] THORNBACK: an armored root-spider - a woody bark-plated back studded
  with thorns, six stubby legs, a soft pale underbelly, glowing amber eyes (WIDE)
- R1C3: [design 24x24] GEODE GOLEM: a boulder-beast built of clustered teal-and-purple
  crystals, a bright glowing core in its chest, short rocky arms and legs, blank stony face
- R2C1: [design 28x16] THE TREMOR-GRUB: a huge pale segmented burrowing grub, little side
  legs, cute-but-menacing mandibles, crumbs of soil around it (WIDE, long body)
- R2C2: [design 30x30] GNASH, THE HOLLOW KING (final boss): a large regal mole-monarch with
  dark velvety fur, a crooked gold crown, a tattered royal cloak, enormous clawed paws, one
  beady eye with a monocle, and a sly menacing grin - imposing (TALL)
- R2C3: [design 14x16] PILLOW-KIN "MR. RAM": this is the dog plushy in the attached file
```
- R3C1: [design 14x16] PILLOW-KIN "BEAST MIMI": this is the one with a star on his head in the attached file
```
- R3C2: [design 14x16] PILLOW-KIN "TOOTHLESS": this is the black dragon in the attached file
```
- R3C3: [design 14x16] PILLOW-KIN "LUCKY": this is the unicorn in the attached file
```

After saving `sheet.underburrow.png` into `assets/raw/`, run `python3 import_art.py` (it slices
`boss.mottle/.thornback/.geode/.grub/.gnash.png` and `npc.kin1..kin4.png`), then `python3 build.py`.
The importer and sprite slots are ALREADY wired for these names, so the art drops straight in.
(The Warden/Gnash AI and Pillow-Kin rendering are built per WORLD2_UNDERBURROW_PLAN.md; until then
the slices simply sit unused — nothing breaks.)

### Underburrow TILES — drawn in code, NO art needed on this sheet
soil, root-wall, glow-vein, crystal wall, burrow-hole, mushroom bounce-pad, glide-vent, soft-block
are all procedural (plan PART B §4). Say the word if you'd rather hand-paint any of them.
                                                                                                           
---

## SHEET 12 — `sheet.colossus.png` — THE STORM COLOSSUS finale (Grimspire Keep)

Save as: `assets/raw/sheet.colossus.png`

```
Sprite sheet, invisible grid of 4 columns x 4 rows, transparent background,
rules as before (one sprite per cell, ~70% fill, nothing touches borders,
1-cell PLUM #241a33 outline, chunky kid-friendly pixel art).

This is the TRUE final boss: a knight-shaped STORM COLOSSUS as tall as a
castle, seen from the front at a distance. Its armor is storm-cloud slate
blue-violet (#4a4266 / #6a6288 highlights) with GREEN-GLOW seams
(#7ef0a0) where pieces attach — each piece below is knocked off one by
one in the game, so every piece must read as a SEPARATE object.

Row 1:
1. COLOSSUS BODY, stride pose A (left leg forward) — design 48x64. Torso +
   legs + neck stump ONLY: no head, no helmet, no arms, no armor plates.
   Show green glowing attachment sockets where those pieces belong.
2. COLOSSUS BODY, stride pose B (right leg forward) — design 48x64. Same.
3. BARE HEAD — design 16x16. Round steel head, big worried glowing eyes
   (it should look a bit silly/vulnerable once the helmet is gone).
4. GREAT HELM — design 20x18. Gothic bucket helm with a tall RED plume,
   narrow eye slit, small horns.

Row 2:
5. LEFT ARM — design 14x30. Segmented armored arm, huge gauntlet fist.
6. RIGHT ARM — design 14x30. Mirror of 5.
7. SHOULDER PLATE — design 14x12. A chunky pauldron slab, storm-blue with
   a gold rivet trim (one sprite; the game mirrors it for both shoulders).
8. CHEST PLATE — design 16x14. Breastplate slab with a lightning emblem.

Row 3:
9.  BELLY PLATE — design 16x12. Rounded tummy armor slab.
10. SUPER RAMSI — design 20x24. Ramsi the little clockwork ram transformed:
    GOLDEN-WHITE fleece, tiny cape, star-bright eyes, faint sun halo — mid
    hover, facing right, charging up (mouth open, light gathering).
11. TORNADO — design 16x28. A cute whirling white-grey funnel, wide at the
    top, debris flecks, motion swirl lines.
12. LIGHTNING BOLT GLYPH — design 10x16. A fat golden zigzag bolt (used as
    the laser-charge pip icon).

Row 4:
13. GRASS LUMP — design 12x10. A juicy tuft of bright green grass on a
    little soil clod (Ramsi's snack).
14. MILK CARTON — design 10x14. A classic white milk carton, blue stripe,
    open spout.
15. KNOCKED-OFF PIECE, tumbling — design 14x12. A generic dented armor
    slab, scorched green at one edge (drawn spinning as pieces fall).
16. EMPTY.
```

## SCENE 12a/12b — the Grimspire panoramas (smooth painted, NOT snapped)

Save as: `assets/raw/scene.grimspire_storm.png` and `assets/raw/scene.grimspire_sunny.png`
(processed with a smooth-resize scene script at import time, like scene.world3bg)

```
Two matching painterly backdrops, 1440x460 each, same composition:
a gothic castle skyline seen from its own rooftop — rows of dark towers,
spires, flying buttresses and crenellated walls receding into the distance,
NO characters, NO monster (the game draws the Colossus on top). Storybook
gouache style, chunky shapes, plum-black #241a33 line accents.

12a STORM: bruised thunderheads boiling overhead, teal-violet gloom, rain
haze, two distant lightning forks, warm candlelit windows in the towers.

12b SUNNY: the SAME skyline under a clear morning-blue sky, puffy white
clouds, golden sunlight raking the stone, windows now dark (day), a few
birds. It should feel like a deep breath after the storm.
```

> **Import wiring note (for the session that processes these):** slice
> `sheet.colossus.png` via a new `SHEETS['colossus']` entry in import_art.py →
> keys `colossus_bodyA/B, colossus_head, colossus_helm, colossus_armL/R,
> colossus_plateS, colossus_plateC, colossus_plateB, superramsi, tornado,
> boltglyph, grasslump, milkcarton, colossus_chunk`; the two scenes go through
> the smooth scene path (bg-key + resize, no snapping). `Sprites.superramsi`
> and `Sprites.scenes.grimspire_*` are already hooked in src/22c; the piece
> sprites get wired into the colossus draw at import time.

---

## OPTIONAL — `portrait.noah.png` — a dedicated hero portrait (single image)

Save as: `assets/raw/portrait.noah.png` (Claude will wire it into the HUD on the next pass)

```
One single image, square, transparent or plain background. A chest-up PORTRAIT of
BUFF NOAH, the hero of a kid-friendly pixel adventure: a cheerful, slightly buff
6-year-old with a big swoosh of blond hair, huge friendly blue eyes, rosy cheeks
and a proud open-mouth grin, wearing his blue-and-red camo tee. Chunky readable
pixel-art style on a fine grid (this one may be MORE detailed than the world
sprites — it is a portrait), 1-cell PLUM #241a33 outline, warm storybook palette.
He should look like the world's happiest tiny superhero. No text, no border.
```

## SHEET 13 [DELIVERED + WIRED] — `sheet.mythics.png` — RARE & COMBINED CREATURES (the Combiner's family)

Save as: `assets/raw/sheet.mythics.png`

```
Sprite sheet, invisible grid of 4 columns x 3 rows, transparent background,
rules as before (one creature per cell, ~70% fill, nothing touches borders,
1-cell PLUM #241a33 outline, chunky kid-friendly pixel art, side view facing
RIGHT, standing pose). These are PRIZE creatures — make every one feel like
a celebration. Design size ~24x20 each unless noted.

Row 1:
1. HORSE — a warm chestnut-brown horse with a dark chocolate mane and a
   white blaze on its nose. Sturdy, friendly, slightly cartoony.
   (The only WILD-caught creature here, along with the lion — Stableworks.)
2. LION — a golden lion with a huge round amber mane, tiny proud chin tuft,
   tail with a tassel. More cuddly than fierce. (Wild-caught, Stableworks.)
3. RAINBOW SHEEP — a fluffy sheep whose wool is banded in soft rainbow
   stripes (red/orange/gold/green/blue/violet), white face, tiny sparkles.
   (COMBINER-crafted only — never wanders wild. Same for everything below.)
4. BAA-LIEN — a mint-GREEN sheep with two bendy alien antennas ending in
   glowing bobbles, big happy black eyes. (Crafted: Alien + Sheep.)

Row 2 (crafted rares):
1. GLITTER GOAT — a white-gold goat with gleaming golden horns and hooves;
   little star-glints in the coat.
2. GLIMMER RAM — a frost-white ram with icy pale-blue curled horns that look
   like carved glacier glass; snowflake glints.
3. PEGASUS — a cream-white winged horse, golden mane, wings half-spread.
4. CENTAUR — chestnut horse body, friendly kid-storybook person torso with a
   blue tunic and gold hair; waving.

Row 3 (crafted mythics):
1. GRIFFIN — lion body + white eagle head and wings, orange beak; regal but
   smiling. (design ~26x22)
2. MERMAID — teal shimmering fish tail, kind face, red-gold hair, sitting on
   a tiny rock; a few bubbles.
3. PRISMA-BEAST — the rarest: a violet dragon-cat with a crest of five
   rainbow spines and starlight freckles; faint white glow. (design ~26x22)
4. (empty)
```

Wiring on delivery: add `mythics` to `import_art.py` SHEETS (4x3, dens 4) with
cell names exactly: horse, lion, rainbowsheep, baalien / glittergoat,
glimmerram, pegasus, centaur / griffin, mermaid, prismabeast, '-'.
`installExtSprite` picks them up as creatures automatically and the pixel-grid
placeholders in 25/26 step aside (they only install when no sheet art exists).

## SHEET 14 [DELIVERED + WIRED] — `sheet.stableworks.png` — THE ROYAL STABLEWORKS props

Save as: `assets/raw/sheet.stableworks.png`

```
Sprite sheet, invisible grid of 4 columns x 2 rows, transparent background,
same rules (plum outline #241a33, chunky pixel art, nothing touches borders).
Brass-and-timber royal stable style, warm and lived-in.

Row 1:
1. HAY BALE — a plump golden hay bale with twine cross-ties and a few loose
   straws. (design 16x14)
2. HAY STUBBLE — the same spot after gathering: a sad little tuft of cut
   straw. (design 12x6)
3. STABLE TROUGH — a wooden feed trough on brass legs, hay inside. (16x10)
4. PADDOCK LANTERN — a brass stable lantern on a post, warm glow. (10x18)

Row 2:
1. BARN FACADE — a small timber barn front with a rounded brass-hinged door
   and a horseshoe over it. (design 48x32)
2. LION DEN ARCH — a stone archway with a sleepy lion face carved in the
   keystone. (design 32x24)
3. OSTLER OTTO — a round, kindly stable-keeper in a straw hat and brass-
   buttoned overalls, holding a pitchfork like a walking stick. (16x20)
4. ROYAL CREST — a shield: golden horse and lion rampant on plum. (14x16)
```

Wiring on delivery: SHEETS entry `stableworks` (4x2, dens 4): haybale,
haystubble, trough, lantern / barnfront, denarch, otto, crest. `otto` lands as
an NPC sprite; haybale/haystubble replace the procedural bale drawing in
`Game.OBJDRAW.haybale` (keys checked first once wired).

## SHEET 15 [DELIVERED + WIRED] — `sheet.museum.png` — GRANNY'S GRAND MUSEUM props

Save as: `assets/raw/sheet.museum.png`

```
Sprite sheet, invisible grid of 4 columns x 2 rows, transparent background,
same rules. Cozy cottage-museum style: honey wood, brass, red velvet.

Row 1:
1. TROPHY PEDESTAL — a wooden museum pedestal with a brass plaque and a red
   velvet top. (design 20x16)
2. GEAR PEDESTAL — a slimmer glass-domed display stand, brass base. (16x18)
3. VELVET ROPE — two brass posts with a swooping red velvet rope. (24x12)
4. MUSEUM BANNER — a hanging plum banner with a gold star and tassels. (14x22)

Row 2:
1. COMBI — a round teal tinker-robot with one big friendly eye, tiny wrench
   hands, and a chest hatch shaped like a heart. (design 16x20)
2. THE COMBINER MACHINE — a brass contraption: two glass pods full of
   bubbling rainbow fizz joined by pipes to a central mixer with a spinning
   dial and a big friendly lever. (design 44x30)
3. PILLOW (PLUMP) — a plump storybook pillow with gold corner tassels,
   neutral cream (the game tints it per Pillow-Kin). (18x12)
4. TROPHY STAR — a chunky gold star statuette on a mini base (used for
   giants with no statue art: GNASHARA, COLOSSUS, CERBERUS, SAHOR). (14x16)
```

Wiring on delivery: SHEETS entry `museum` (4x2, dens 4): pedestal, gearpede,
velvetrope, banner / combi, combinermachine, plump, trophystar. Optional
per-boss statues can come later as singles named `trophy_<key>.png`
(e.g. trophy_gnashara) — the trophy drawer checks `Sprites.props.trophy_<key>`
FIRST, so any delivered statue instantly replaces the gold-tinted sprite.

## PIXEL FACADES — big building art that OVERLAYS the plain tile exteriors  [DELIVERED + WIRED 2026-07-03]

Three SINGLE images (not sheets). These are chunky PIXEL ART, processed down
the normal snapping path at density 4 — NOT smooth-painted scenes. In-game,
the plain solid wall tiles stay put underneath (they govern walkability); the
facade draws over the footprint, anchored at the building's bottom row. So:

```
Rules for all three: transparent background, 1-cell PLUM #241a33 outline,
chunky kid-friendly pixel art, to be viewed as from above and front for a
zelda style video game angle (roof visible from above, face visible from
the front — this reads FAR better in-game than flat fronts). NO creatures and NO people baked
in — live animated sprites (sheep, Noah, Granny, COMBI) walk in FRONT of the
art, so painted ones would stand frozen beside moving ones. Static objects
(lanterns, surfboards, weathervanes) are welcome. Each building's DOOR must
be an open, inviting doorway at the EXACT position given — that is where the
real walk-in door tile sits.
```

13a `assets/raw/prop.grannyhouse.png` — GRANNY'S GRAND MUSEUM (design 112x96,
so deliver ~448x384). The cottage has GROWN into a friendly jumble: thatched
core with a crooked chimney, and one little extension per wing — a brass Cog
Hall dome, a glass-roofed Gear Gallery, a round Pillow Den bump with a
pillow-shaped window, a tall Trophy Turret with a gold star on top. Warm lit
windows, hollyhocks at the base. FRONT DOOR: bottom edge, centered 40% of
the way across from the LEFT (it must line up with the real door tile,
3rd tile of the 6-tile footprint).

13b `assets/raw/prop.workshopannex.png` — THE TINKER ANNEX (design 72x80,
deliver ~288x320). COMBI's street-front workshop beside the cottage: teal
copper pipes hugging the walls, a big round brass gauge window, a smokestack
with a happy puff, rivets everywhere — clearly kin to Cogwerk but cottage-
sized and cozy. FRONT DOOR: bottom edge, centered ~40% from the LEFT
(2nd tile of the 4-tile footprint).

13c `assets/raw/prop.coasthouse.png` — THE SUNSPLASH SCHOOL (design 176x120,
deliver ~704x480). The ocean-level schoolhouse: driftwood-and-whitewash on
short stilts, coral-pink roof, brass school bell in a little tower, a fish-
shaped weathervane, surfboards leaning by the steps. FRONT DOOR: bottom
edge, centered ~55% from the LEFT (6th tile of the 10-tile footprint).

Wiring on delivery: add ASSET_SIZES entries — grannyhouse [112,96],
workshopannex [72,80], coasthouse [176,120] — and run the single-image
import (snapped, dens 4). The overlay hooks already ship (Game.OBJDRAW.facade
via `Game.addMuseumFacades`): each facade appears the moment
`Sprites.props.<key>` exists; until then the vale/coast look unchanged.

## SHEET 16 — `sheet.aquarium.png` — COMBI'S AQUARIUM (underwater friends)

Save as: `assets/raw/sheet.aquarium.png`

```
Sprite sheet, invisible grid of 3 columns x 2 rows, TRANSPARENT (checkerboard)
background — NOT white. Same house rules: one creature per cell entirely inside
its cell with ~10% padding (nothing touches a border), 1-cell PLUM #241a33
outline, chunky kid-friendly pixel art, SIDE view facing RIGHT, gentle swimming
pose. These live UNDERWATER, so give them a soft, floaty look. Design ~16x14
each unless noted.

Row 1:
1. DEEP MERMAID — an UNDERWATER mermaid mid-swim (not sitting on a rock): teal
   shimmering fish tail streaming behind, kind face, red-gold hair flowing in
   the current, a few bubbles. (design ~16x16)
2. SEAHORSE — a curly golden seahorse, tall and skinny, tiny fluttering fin,
   big friendly eye. (design ~10x16)
3. ANGELFISH — a round pearly-white angelfish with sky-blue stripes and long
   flowing top/bottom fins.

Row 2:
1. PUFFERFISH — a round happy orange pufferfish with tiny spikes and a big
   grin. (design ~14x14)
2. STARFISH — a plump red-coral starfish with little bumps and a smiling face.
   (design ~14x12)
3. (empty)
```

Wiring on delivery: add SHEETS['aquarium'] (3x2, dens 4) with cell names:
mermaidsea, seahorse, angelfish / pufferfish, starfish, '-'  (creature.<name>.a
each). The pixel-grid placeholders in 29_aquarium.js step aside automatically
when the sheet art exists (same hasExt guard as the mythics/stableworks sheets).
NOTE: the on-land MERMAID (sheet.mythics) is unchanged; `mermaidsea` is the
new SWIMMING version shown in the aquarium tank.

## SCENE 14 — `scene.aquariumbg.png` — the AQUARIUM parallax backdrop (smooth painted)

Save as: `assets/raw/scene.aquariumbg.png` — processed down the smooth scene.* path (LANCZOS,
no snapping), like scene.world3bg.

```
A wide, seamless-ish PAINTED deep-water backdrop (design ~480x190). Dreamy blues
fading darker toward the bottom, soft god-rays slanting from the surface, hazy
far-off coral towers and a sunken castle silhouette in the distance, a few
drifting jellyfish way back. NO close-up detail (it sits FAR behind the reef and
draws at 35% opacity with parallax). Left and right edges should blend so it can
tile horizontally.
```

Wiring: process to `assets/scene.aquariumbg.png`; Game.drawAquariumBg uses
`Sprites.scenes.aquariumbg` automatically (parallax + low alpha) when present.

## SHEET 17 — `sheet.aqobjects.png` — AQUARIUM underwater objects

Save as: `assets/raw/sheet.aqobjects.png`

```
Sprite sheet, invisible grid 2 cols x 2 rows, alpha TRANSPARENT png,
1-cell PLUM #241a33 outline, chunky pixel art, viewed from front.
 One object per cell, ~10% padding, nothing touches a border.

Row 1:
1. SUNKEN SHIP — a broken wooden galleon hull resting on the seafloor, mossy
   planks, a tilted mast whose top is carved as a RAM'S HEAD figurehead (curled
   golden horns), a few bubbles rising. THE landmark. (design ~64x56)
2. DIVING BELL — a brass-ringed glass dome diving bell on a hanging hook, empty
   inside (the game floats Ramsi in it), warm brass fittings, bubbles. (24x30)

Row 2:
1. SHIP ANCHOR — a big rusty iron anchor half-buried in sand. (design 20x24)
2. PORTHOLE — a round brass ship porthole with blue glass, barnacles. (16x16)
```

Wiring on delivery: SHEETS['aqobjects'] (2x2, dens 4): prop.sunkenship,
prop.divingbell / prop.anchor, prop.porthole. The 29_aquarium.js OBJDRAWs check
`Sprites.props.<key>` first, so the art drops in automatically; the diving-bell
companion uses `Sprites.props.divingbell` too (Ramsi floats inside it).



---

## SHEET 12 (NEW) - sheet.newart12.png  (3 columns x 2 rows)

Warm storybook pixel-art, chunky pixels, plum-black outline (#241a33), gentle top-lit
shading, TRANSPARENT background, each item centred in its own cell. No text, no scenery.

IMPORTANT: do NOT draw the reef fish (seahorse, angelfish, pufferfish, starfish) here -
they already have art in sheet.aquarium.png, and re-drawing them would double-wire the
same sprites. This sheet is ONLY the six genuinely-new pieces below, in this exact reading
order (left->right, top row then bottom):

Row 1 - creatures, each facing RIGHT:
1. LANTERNA - a SHY plump PURPLE lantern-fish (deep violet body #4a3a78, lighter belly,
   dark waving tail, one big soft eye) with a slender stalk rising from her head ending in a
   glowing GOLD lantern bulb (#f8b800). Cute, gentle, a little bashful. (This SAME art is
   used for the Glimmer-Deep BOSS and the freed friend, so make her lovable - never scary.)
2. GLOW FISH - a small teal fish (#48e0c8) that glows, with a bright gold spark/tail-lamp
   (#f8ec70) and wide friendly eyes. Simple and bold.
3. STORMCROW - the Sky-Spire's diving foe. This is a NEW creature: do NOT confuse it with the
   catchable CONDOR (which keeps its own art). A stormy STORM-CROW - slate grey-blue body and
   swept wings (#aab2c0 / #54585f), a bright YELLOW lightning-flash across its chest (#f8d048),
   a sharp ORANGE beak (#f89238), one fierce eye. Menacing but cartoonish (never gory), side
   view, wings spread wide as it dives.

Row 2 - craft GEMS: small, bold and chunky so they read when tiny; one faceted stone each
with a single white sparkle-glint:
4. GOLD NUGGET - a heavy rounded lump of raw GOLD (#f8b800 with warmer #c88800 shadows),
   bumpy and glinting. (From a hidden dungeon vault.)
5. CRYSTAL SHARD - a tall pale ICE-BLUE crystal (#9adcf8 with a white core), faceted, humming.
6. VOID GEM - a dark starry PURPLE gem (#9a62e0 / #6a3cb0), a faceted teardrop with a few
   tiny white star-specks inside, softly glowing.

After saving to assets/raw/sheet.newart12.png, run `python3 import_art.py && python3 build.py`.
The importer slices the 3x2 grid into creature.lanterna.a / creature.glowfish.a /
creature.stormcrow.a / item.goldnugget / item.crystalshard / item.voidgem and they replace the
built-in procedural sprites. (The stormcrow art also flows into the Sky-Spire fight, which draws
Sprites.creatures.stormcrow.)

---

## SCENE (NEW) - scene.burrowbg.png - THE UNDERBURROW overview map  (painted, ~480 x 272)

A painted STORYBOOK overview map of the Underburrow (World 2), in the SAME illustrated style
as the Cogwerk overview (scene.world3bg): a warm hand-painted backdrop - NOT chunky sprite
pixels, NOT snapped. Like the other scene.* art it is smooth-resized, not run through the
grid slicer.

Scene: a cozy CROSS-SECTION of the underground world seen from the side - layered dark earth
strata (browns #2a1c12 / #1d1410), a winding network of ROOT-TUNNELS and burrow-holes
threading between soft-lit dens, dangling roots, the odd glowing mushroom and firefly mote
(warm amber + minty #8ef0c0 glow). Near the top edge, a SUNLIT SHAFT breaks in from the
surface (the way back up). Keep it fairly EVEN and open - the game draws the level nodes and
winding root-trails ON TOP, so avoid busy clutter where those would sit. Think warm painted
backdrop: darker at the edges, glowier toward the centre. No text, no UI, no characters.
Cohesive with the game's warm plum-and-amber palette.

Because scenes aren't snapped, finish it smooth and drop it straight in as
assets/scene.burrowbg.png (about 480x272), then `python3 build.py`. A tiny sizer if you
start from a bigger painting:
    python3 - <<'PY'
    from PIL import Image
    im = Image.open('assets/raw/scene.burrowbg.png').convert('RGBA')
    im.resize((480, 272), Image.LANCZOS).save('assets/scene.burrowbg.png')
    PY
Once embedded, it paints behind the UNDERBURROW overview map automatically (UI.drawBurrowMap
falls back to the old procedural strata until the art is present).


---

## SHEET 18 — `sheet.introart.png` — THE OPENING CUTSCENE poses (3 cols x 2 rows)

Save as: **`assets/raw/sheet.introart.png`** — then `python3 import_art.py && python3 build.py`.
The new SPACE-paced opening plays with sprite-composed stand-ins until this sheet exists;
every cell below replaces its stand-in automatically.

```
Generate sheet image INTROART, size 1536x1024 (landscape), TRANSPARENT background,
invisible grid of 3 columns x 2 rows. Same house rules as always: one sprite per cell,
centred, ~70% fill, NOTHING touches a cell border, 1-cell PLUM #241a33 outline, flat
colors, chunky kid-friendly pixel art, no text, no ground planes. The hero NOAH is the
same cheerful over-muscled blond boy as ever (blue tee with red camo patches, dark gray
pants); RAMSI is the light Carolina-blue plush-ram with small gold horns and a white
face panel. Cell contents (left to right, top to bottom; "design WxH" = tiny pixel grid):

- R1C1: [design 24x20] THE HUG — Noah kneeling, arms wrapped around RAMSI in a big warm
  hug; Ramsi's eyes closed and happy; one or two tiny pink hearts floating just above
  their heads (WIDE, the sweetest thing you have ever drawn)
- R1C2: [design 26x22] SAHOR IN FLIGHT — MIMI SAHOR the blue ram-imp (big golden curling
  horns, white face, pink blush, gold chain) flying with small dark bat-wings spread,
  facing LEFT, gripping a small golden birdcage that dangles below on a short chain;
  a sly grin (WIDE — this is the villain snatch moment, menacing but cute, never scary)
- R1C3: [design 16x14] RAMSI CAGED — RAMSI squeezed sadly inside that same golden
  birdcage, ears drooping, one hoof on the bars, big glossy worried eyes
- R2C1: [design 16x20] BRAVE NOAH — Noah standing side view FACING RIGHT, fists clenched
  at his sides, chin up, hair swept by wind, tiny determination sparkle in his eye
- R2C2: [design 18x20] NOAH DASH — Noah sprinting side view FACING RIGHT, leaning hard
  into the run, one arm pumped forward, a little dust puff behind his back foot
- R2C3: [design 22x30] THE RAINBOW SPIRE — the far-off landmark where Ramsi is taken: a
  tall elegant crystal spire on a tiny floating island, a small RAINBOW arcing through
  its peak, a few sparkles (TALL — it should look impossibly far away and magical)
```

## SCENES 18a/18b — the opening backdrops (painted smooth, NOT snapped)

Save as: **`assets/raw/scene.intro_vale.png`** and **`assets/raw/scene.intro_storm.png`**
(processed down the smooth scene path like scene.burrowbg — any size ~1500x800+ works,
they get LANCZOS-resized to 960x544).

```
Two matching painterly STORYBOOK backdrops of the same place, ~1536x816 each, in the
exact same illustrated style as the game's other painted scenes (warm gouache, chunky
shapes, plum-black #241a33 line accents, NO characters, NO text). The place: Noah's
home meadow in GREENWOOD VALE — rolling green hills, a cozy thatched cottage with a
crooked chimney off to ONE side, a big friendly oak, a low wooden fence, wildflowers.
Keep the lower CENTER of the image fairly open and calm (the animated characters and
the caption text play there), and keep the bottom ~15% simple.

18a GOLDEN MORNING (scene.intro_vale.png): sunrise gold and honey light, long soft
shadows, a few dawn clouds catching pink, smoke curling gently from the chimney,
butterflies implied with a few bright flecks. It should feel like the happiest,
safest morning in the world.

18b THE STORM COMES (scene.intro_storm.png): the SAME composition swallowed by a
sudden storm — bruised purple-and-teal thunderheads boiling overhead, the gold light
squeezed to a thin bright seam on the horizon, wind-bent grass and flying leaves, one
jagged lightning fork far behind the cottage, warm window light glowing brave against
the dark. Dramatic, but storybook-dramatic — never horror.
```

> Import wiring (ALREADY DONE in import_art.py — just drop the files and run
> `python3 import_art.py && python3 build.py`):
> SHEETS['introart'] slices the cells to prop.introhug / prop.introsahorfly /
> prop.introcage / prop.intronoahbrave / prop.intronoahdash / prop.introspire (dens 4),
> and import_art now smooth-processes the two scenes itself (SCENES table) to
> assets/scene.intro_vale.png + assets/scene.intro_storm.png at 960x544 — no manual
> sizer needed. The opening's draw code checks Sprites.props.intro* and
> Sprites.scenes.intro_* first and falls back to sprite-composed stand-ins until then.
