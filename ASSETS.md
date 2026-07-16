# ASSETS.md - outsourced art pipeline for Buff Noah's Quest


> **HD UPDATE:** sprites are now stored at 2x pixel density — the importer keeps twice
> the detail per game pixel (Noah is 32x40 in storage, drawn at 16x20 world size). The
> design grids below are SILHOUETTE sizes; fine inner detail up to 2x finer survives.

Generate sprites in ChatGPT (or any AI image tool), drop them in `assets/raw/`,
and two commands later they are IN the game - no code edits needed.

## The pipeline

1. In ChatGPT, paste the MASTER PROMPT below, then ONE item line from the catalog.
2. Ask for a 1024x1024 PNG **with a transparent background**. Download it.
3. Rename the file to its exact asset key, e.g. `gear.sandal.png` (the filename IS the slot).
4. Put it in `noahs-quest-v4/assets/raw/`.
5. Run `python3 import_art.py` - converts the big AI render into a true game-resolution
   sprite in `assets/` (trims background, snaps to the pixel grid, hardens the outline).
6. Run `python3 build.py` - embeds everything in `assets/` into the game HTML.
7. Reload `BuffNoahsQuest_v4.html`. Any slot without a PNG keeps its built-in art.

To reject art, just delete the PNG from `assets/` and rebuild - the procedural art returns.

## MASTER PROMPT (paste this first, once per ChatGPT conversation)

```
You are the pixel artist for "Buff Noah's Quest", a kid-friendly top-down
Zelda-like adventure with a saturated storybook look. I will request one
sprite at a time. Rules for EVERY sprite:
- Chunky, readable pixel art. 
- The sprite is designed on a tiny pixel grid of W x H cells (I give W x H
  each time). Render it as crisp pixel art at 1024x1024 where every design
  cell is a perfect large square. NO detail smaller than one cell.
- 1-pixel-cell dark outline around the whole silhouette in PLUM #241a33 (never pure black).
- Flat colors only: one base color per material, plus at most one lighter
  highlight near the top and one darker shade near the bottom. Light comes from above.
- NO gradients, NO anti-aliasing, NO dithering, NO drop shadows, NO background,
  NO ground plane. Fully TRANSPARENT background.
- Prefer this palette: outline #241a33, skin #f8c896 (shade #e0a070),
  gold #f8d048, deep gold #f8b800, red #e84a4a, blue #4878e8, green #58c452,
  brown #a8703c, gray #aab2c0, pink #f898c8, purple #9a62e0, orange #f89238,
  teal #40c0b8, ice blue #9adcf8, fluff white #fff8f0.
- Side-view characters and creatures FACE RIGHT unless told otherwise.
- Center the subject and fill most of the canvas.
Reply with the image only.
```

## ITEM CATALOG (copy one line per request)

Format you paste after the master prompt:
`Sprite "<key>" - grid <W>x<H> - <description>`

### Noah (the hero)

| save as | grid | prompt description |
|---|---|---|
| `noah.down.a.png` | 16x20 | BUFF NOAH walking toward the camera (south): cheerful over-muscled blond boy hero, short gold hair, big arms, blue tee with red camo patches, dark gray pants, black shoes; left foot forward |
| `noah.down.b.png` | 16x20 | same Noah walking south, other foot forward |
| `noah.up.a.png` | 16x20 | Noah from behind (walking north): back of gold hair, blue/red camo tee, dark pants; left foot forward |
| `noah.up.b.png` | 16x20 | same Noah from behind, other foot forward |
| `noah.side.a.png` | 16x20 | Noah walking, side view FACING RIGHT, one visible eye, arms swinging; left foot forward |
| `noah.side.b.png` | 16x20 | same side-view Noah, other foot forward |
| `noah.climb.png` | 16x20 | Noah from behind, both arms raised overhead gripping a ledge, climbing |

### Noah in the dive suit

| save as | grid | prompt description |
|---|---|---|
| `noahdive.down.a.png` | 16x20 | BUFF NOAH walking toward the camera (south): cheerful over-muscled blond boy hero, short gold hair, big arms, orange wetsuit, dark gray pants, black shoes; left foot forward; DIVE VERSION: teal dive hood instead of hair, orange wetsuit, dark teal legs |
| `noahdive.down.b.png` | 16x20 | same Noah walking south, other foot forward; DIVE VERSION: teal dive hood instead of hair, orange wetsuit, dark teal legs |
| `noahdive.up.a.png` | 16x20 | Noah from behind (walking north): back of gold hair, orange wetsuit, dark pants; left foot forward; DIVE VERSION: teal dive hood instead of hair, orange wetsuit, dark teal legs |
| `noahdive.up.b.png` | 16x20 | same Noah from behind, other foot forward; DIVE VERSION: teal dive hood instead of hair, orange wetsuit, dark teal legs |
| `noahdive.side.a.png` | 16x20 | Noah walking, side view FACING RIGHT, one visible eye, arms swinging; left foot forward; DIVE VERSION: teal dive hood instead of hair, orange wetsuit, dark teal legs |
| `noahdive.side.b.png` | 16x20 | same side-view Noah, other foot forward; DIVE VERSION: teal dive hood instead of hair, orange wetsuit, dark teal legs |
| `noahdive.climb.png` | 16x20 | Noah from behind, both arms raised overhead gripping a ledge, climbing; DIVE VERSION: teal dive hood instead of hair, orange wetsuit, dark teal legs |

### Noah swimming (underwater maps)

| save as | grid | prompt description |
|---|---|---|
| `noahswim.right.a.png` | 22x11 | Noah SWIMMING underwater, prone horizontal body FACING RIGHT: teal dive hood, clear mask showing his face and one eye, orange wetsuit, small gray air tank on his back, dark teal legs ending in long swim fins; legs apart mid-kick |
| `noahswim.right.b.png` | 22x11 | same swimming diver, legs together and front arm extended in a stroke |

### Creatures (Mimis)

| save as | grid | prompt description |
|---|---|---|
| `creature.sheep.a.png` | 16x10 | fluffy white sheep, side view facing right, dark cute face, stubby legs |
| `creature.sheep.b.png` | 16x10 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.ram.a.png` | 16x10 | fluffy white ram facing right with big golden curled horns, dark face |
| `creature.ram.b.png` | 16x10 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.goat.a.png` | 16x10 | white goat facing right, small gray horns, happy face |
| `creature.goat.b.png` | 16x10 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.snowhare.a.png` | 16x9 | white snow hare facing right, tall upright ears, pink nose |
| `creature.snowhare.b.png` | 16x9 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.crab.a.png` | 16x8 | little red crab, front view, claws raised, stalk eyes |
| `creature.crab.b.png` | 16x8 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.octopus.a.png` | 16x9 | round pink octopus, front view, big sweet eyes, curly tentacle feet |
| `creature.octopus.b.png` | 16x9 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.jellyfish.a.png` | 16x8 | pink jellyfish, bell on top, trailing wavy tentacles, one white glint |
| `creature.jellyfish.b.png` | 16x8 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.shark.a.png` | 16x8 | small gray cartoon shark facing right, white belly, dorsal fin, friendly eye |
| `creature.shark.b.png` | 16x8 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.capricorn.a.png` | 16x8 | sea-goat facing right: white goat head with little gold horns, body becomes a teal fish tail |
| `creature.capricorn.b.png` | 16x8 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.starpupil.a.png` | 16x7 | orange starfish school-kid with one big eye and a tiny backpack, front view |
| `creature.starpupil.b.png` | 16x7 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.alien.a.png` | 16x10 | small green alien, front view, two big dark eyes, skinny arms, round head |
| `creature.alien.b.png` | 16x10 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.unicorn.a.png` | 16x10 | white unicorn facing right, golden horn, pink mane, elegant little legs |
| `creature.unicorn.b.png` | 16x10 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.cometpup.a.png` | 16x8 | ice-blue puppy facing right with floppy ears and a sparkling golden comet trail behind |
| `creature.cometpup.b.png` | 16x8 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.dragon.a.png` | 20x11 | small green dragon facing LEFT with long tail trailing right, red chest scales, tiny wings, snout with nostrils |
| `creature.dragon.b.png` | 20x11 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.condor.a.png` | 16x8 | brown condor in flight, wings spread, white head ruff, orange beak, front view |
| `creature.condor.b.png` | 16x8 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |
| `creature.ibex.a.png` | 16x9 | brown mountain ibex facing right, big backward-curving horns |
| `creature.ibex.b.png` | 16x9 | second animation frame of the same creature: body squashed 1px lower, legs gathered mid-hop |

### NPCs

| save as | grid | prompt description |
|---|---|---|
| `npc.granny.png` | 16x16 | sweet granny, front view chibi: gray hair bun, glasses, pink dress, white apron |
| `npc.marko.png` | 16x16 | merchant Marko, front view chibi: brown wide hat, mustache, red vest over white shirt, gray pants |
| `npc.trader.png` | 16x16 | generic trader, front view chibi: green coat with a gold sash |
| `npc.plume.png` | 16x15 | Ms. Plume the teacher bird, front view chibi: purple plumage, white face, orange beak, wing-arms folded like a teacher |
| `npc.zibble.png` | 16x16 | Zibble the alien pilot, front view chibi: green skin, big dark eyes, two antennae, gray spacesuit with a gold badge |
| `npc.spirit.png` | 16x12 | gentle mountain spirit, front view: ice-blue translucent ghost, serene closed-happy eyes, wispy trailing bottom instead of legs |
| `npc.tess.png` | 16x16 | Trapper Tess, front view chibi: green ranger coat with gold clasps, friendly face |
| `npc.sal.png` | 16x16 | Salty Sal the sailor, front view chibi: blue sailor coat with gold buttons, weathered grin |
| `npc.gruul.png` | 16x16 | Gruul the alien bounty hunter, front view chibi: green alien skin, purple long coat with gold trim |
| `npc.cora.png` | 16x16 | Cliffside Cora, front view chibi: orange climber coat, rope coil over shoulder |

### Bosses

| save as | grid | prompt description |
|---|---|---|
| `boss.billy.png` | 32x21 | KING BILLY, huge armored goat king, front view: white goat face, giant golden curled horns, gray plate armor with shoulder plates, three sturdy legs visible, regal scowl |
| `boss.cerberus.png` | 27x15 | CERBERUS the three-headed good boy: cute brown puppy body with THREE happy puppy heads in a row, floppy ears, wagging stance, front view |
| `boss.sahor.png` | 21x25 | MIMI SAHOR the trickster: blue ram-imp standing upright, big golden curling horns, white face with pink blush cheeks, gold chain necklace, holding a little bat, white sneakers with gold trim |
| `boss.twinkle.png` | 20x11 | SIR TWINKLE's body core only (arms are drawn by the game): round orange starfish center with a tiny gold crown on top, two happy eyes, pink blush |
| `boss.ramsi.png` | 22x16 | RAMSI the Pillow-Pet ram: a soft rounded pillow-shaped ram, light Carolina-blue body, white face panel with sweet eyes, small gold horns, lying flat like a plush pillow |
| `boss.ramsicage.png` | 22x5 | a strip of golden cage bars (vertical gold bars with dark gaps), purely decorative grate |

### Props

| save as | grid | prompt description |
|---|---|---|
| `prop.chest.png` | 16x8 | closed wooden treasure chest, front view, dark wood bands, gold lock plate |
| `prop.chestOpen.png` | 16x8 | the same wooden chest with the lid open and dark empty inside |
| `prop.sign.png` | 16x9 | small wooden signpost, front view: tan plank face with carved line marks, single post leg |
| `prop.post.png` | 16x9 | golden harpoon anchor post: a gold ring target on top of a short wooden post |
| `prop.buoy.png` | 16x7 | little red-and-white striped sea buoy with a tiny gold light on top |
| `prop.cage.png` | 16x6 | small golden trap cage with open barred sides |
| `prop.block.png` | 16x9 | heavy gray push-block: square stone with carved border and a small face-like indent |
| `prop.saucer.png` | 20x7 | crashed flying saucer, side view: ice-blue dome, gray hull rim with gold lights |
| `prop.crystal.png` | 8x9 | ice-blue crystal shard cluster growing from a purple base, glowing |
| `prop.beacon.png` | 8x9 | small gold-topped beacon lamp on a gray post, glowing |

### Items (very small icons!)

| save as | grid | prompt description |
|---|---|---|
| `item.heart.png` | 7x6 | tiny red heart |
| `item.heartC.png` | 7x6 | tiny pink heart container (heart with a hollow shine) |
| `item.coin.png` | 6x6 | tiny gold coin with shine |
| `item.gem.png` | 6x5 | tiny ice-blue gem with white glint |
| `item.key.png` | 6x6 | tiny gold key |
| `item.bosskey.png` | 6x6 | tiny red boss key with a white glint |
| `item.clover.png` | 6x6 | tiny green four-leaf clover |
| `item.tincan.png` | 6x5 | tiny gray tin can |
| `item.fishsnack.png` | 6x5 | tiny orange fish-shaped cracker |
| `item.cookie.png` | 6x5 | tiny tan cookie with golden star sprinkles |
| `item.berry.png` | 6x5 | tiny rainbow berry: a berry whose surface shows little rainbow color patches |
| `item.bone.png` | 6x5 | tiny white dog bone |
| `item.shard.png` | 6x5 | tiny golden star shard, glowing |
| `item.crown.png` | 6x5 | tiny golden crown |
| `item.berrySeed.png` | 6x4 | tiny green seed sprout |

### Gear icons

| save as | grid | prompt description |
|---|---|---|
| `gear.sandal.png` | 10x9 | SPRING SANDALS icon: a single cartoon sandal with a red strap, green springy sole, tiny gold wing on the heel |
| `gear.glove.png` | 10x8 | CLIMBING GLOVES icon: one chunky orange climbing glove with grip pads |
| `gear.suit.png` | 10x8 | DIVING SUIT icon: teal dive helmet with white glint above an orange wetsuit torso |
| `gear.wing.png` | 10x7 | ANGEL WINGS icon: one white feathered angel wing |
| `gear.bracer.png` | 10x7 | POWER BRACERS icon: a gold arm bracer with three white gems |

### Tool icons

| save as | grid | prompt description |
|---|---|---|
| `tool.mitts.png` | 10x7 | MIGHTY MITTS icon: a chunky red mitten with white cuff |
| `tool.net.png` | 10x7 | CATCH NET icon: a white net mesh on a brown handle, diagonal |
| `tool.harpoon.png` | 10x7 | HARPOON icon: a gold-tipped harpoon spear, diagonal |
| `tool.cage.png` | 10x5 | SCENT CAGE icon: small golden cage front |
| `tool.bone.png` | 10x5 | BOOMER-BONE icon: white dog bone with motion sparkle |

### Trees

| save as | grid | prompt description |
|---|---|---|
| `tree.tree.png` | 24x30 | big leafy storybook tree: round layered green canopy with light tufts on top, brown trunk with root flare, small dark ground shadow |
| `tree.pine.png` | 20x30 | snowy pine tree: dark green triangle tiers with white snow rims, brown trunk, small ground shadow |
| `tree.palm.png` | 24x30 | beach palm tree: brown segmented curved trunk, splayed green fronds, two coconuts, small ground shadow |


### NEW SLOTS (v5.6): walk-cycle frames + surface swimming

| save as | grid | prompt description |
|---|---|---|
| `noah.down.c.png` / `noah.down.d.png` | 16x20 | passing poses for the south walk (feet together mid-stride; D = opposite arm swing) |
| `noah.up.c.png` / `noah.up.d.png` | 16x20 | passing poses, back view |
| `noah.side.c.png` / `noah.side.d.png` | 16x20 | passing poses, side view facing right |
| `noahsurf.right.a.png` | 20x12 | Noah swimming AT THE SURFACE facing right: hooded head + eye above the waterline, orange shoulders awash, arm mid-recovery, white splash line (top half only, no legs) |
| `noahsurf.right.b.png` | 20x12 | same surface swimmer, crawl arm extended forward, splash variant |

With only A/B frames the walk alternates two steps (as before); add C/D and the
engine plays the full 4-frame gait automatically (A, C, B, D). The same applies
to `noahdive.*` frames. Or generate everything at once with `sheet.noah2`
(see SHEET_PROMPTS.md).

## Rules & gotchas

- **Filenames must match the catalog exactly** (case does not matter). The key is the slot.
- **Grid proportions matter more than pixels.** The importer rescales anything, but if
  ChatGPT draws a tall thin sandal for a 10x9 slot, it will squash. Repeat the grid size
  in your request and say "wide, short composition" for wide slots.
- **Frame `.b` files are optional** for creatures - the game auto-generates a hop frame
  from `.a`. Noah's walk frames (`.a`/`.b`) should BOTH be provided if you redo him.
- **Keep Noah's hair gold-ish (#f8d048) and the sheep fluffy white** - the automated
  pixel tests verify those exact colors on screen. Anything else can change freely.
- **Items are TINY** (6x6-ish). Ask ChatGPT for "an icon readable at 6x6 cells" - one
  shape, two colors, no inner detail.
- The dragon faces LEFT (it is the one exception - its tail trails right).
- After `import_art.py`, peek at the PNGs in `assets/` (zoom in!) before building.
  Bad conversion usually means the AI ignored the grid - regenerate with "bigger, simpler pixels".
- `python3 build.py` must run after ANY change in `assets/`.

## What stays Claude's job

Gameplay mechanics, puzzles, new zones/features, map geometry, the procedural terrain
renderer (tiles/cliffs/water are painted in code, not sprites), tests, and wiring any
NEW asset slots into this pipeline when new creatures/items get added.
