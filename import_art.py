#!/usr/bin/env python3
"""import_art.py — turn AI-generated sprite renders into true game assets.

Workflow:
  1. Generate art in ChatGPT (see ASSETS.md for the exact prompts).
  2. Save/rename the download to its asset key, e.g.  gear.sandal.png
  3. Drop it in  assets/raw/
  4. Run:  python3 import_art.py
  5. Run:  python3 build.py       (embeds assets/ into the game)

The converter accepts ANY input size (typically a 1024px AI render):
it trims the background, snaps the image onto the sprite's true pixel
grid (dominant color per cell), hardens the alpha, and re-darkens the
outline to the game's plum-black. Output goes to assets/<key>.png at
the exact size the engine expects. Add '--keep KEY' sizes via ASSET_SIZES.
"""
import os, sys, json, collections
try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow required:  pip install Pillow')

HERE = os.path.dirname(os.path.abspath(__file__))
RAW, OUT = os.path.join(HERE, 'assets', 'raw'), os.path.join(HERE, 'assets')
OUTLINE = (36, 26, 51)          # #241a33 storybook outline
DENSITY = 4                     # stored pixels per logical game pixel (HD sprites; 4 = crisp at fullscreen SCALE 4, clean 2:1 at SCALE 2)

ASSET_SIZES = { "noah.down.a": [ 16, 20 ], "noah.down.b": [ 16, 20 ], "noah.up.a": [ 16, 20 ], "noah.up.b": [ 16, 20 ], "noah.side.a": [ 16, 20 ], "noah.side.b": [ 16, 20 ], "noah.climb": [ 16, 20 ], "noahdive.down.a": [ 16, 20 ], "noahdive.down.b": [ 16, 20 ], "noahdive.up.a": [ 16, 20 ], "noahdive.up.b": [ 16, 20 ], "noahdive.side.a": [ 16, 20 ], "noahdive.side.b": [ 16, 20 ], "noahdive.climb": [ 16, 20 ], "noahswim.right.a": [ 22, 11 ], "noahswim.right.b": [ 22, 11 ], "creature.sheep.a": [ 16, 10 ], "creature.sheep.b": [ 16, 10 ], "creature.ram.a": [ 16, 10 ], "creature.ram.b": [ 16, 10 ], "creature.goat.a": [ 16, 10 ], "creature.goat.b": [ 16, 10 ], "creature.snowhare.a": [ 16, 9 ], "creature.snowhare.b": [ 16, 9 ], "creature.crab.a": [ 16, 8 ], "creature.crab.b": [ 16, 8 ], "creature.octopus.a": [ 16, 9 ], "creature.octopus.b": [ 16, 9 ], "creature.jellyfish.a": [ 16, 8 ], "creature.jellyfish.b": [ 16, 8 ], "creature.shark.a": [ 16, 8 ], "creature.shark.b": [ 16, 8 ], "creature.capricorn.a": [ 16, 8 ], "creature.capricorn.b": [ 16, 8 ], "creature.starpupil.a": [ 16, 7 ], "creature.starpupil.b": [ 16, 7 ], "creature.alien.a": [ 16, 10 ], "creature.alien.b": [ 16, 10 ], "creature.unicorn.a": [ 16, 10 ], "creature.unicorn.b": [ 16, 10 ], "creature.cometpup.a": [ 16, 8 ], "creature.cometpup.b": [ 16, 8 ], "creature.dragon.a": [ 20, 11 ], "creature.dragon.b": [ 20, 11 ], "creature.condor.a": [ 16, 8 ], "creature.condor.b": [ 16, 8 ], "creature.ibex.a": [ 16, 9 ], "creature.ibex.b": [ 16, 9 ], "npc.granny": [ 16, 16 ], "npc.marko": [ 16, 16 ], "npc.trader": [ 16, 16 ], "npc.plume": [ 16, 15 ], "npc.zibble": [ 16, 16 ], "npc.spirit": [ 16, 12 ], "npc.tess": [ 16, 16 ], "npc.sal": [ 16, 16 ], "npc.gruul": [ 16, 16 ], "npc.cora": [ 16, 16 ], "boss.billy": [ 32, 21 ], "boss.cerberus": [ 27, 15 ], "boss.sahor": [ 21, 25 ], "boss.twinkle": [ 20, 11 ], "boss.ramsi": [ 22, 16 ], "boss.ramsicage": [ 22, 5 ], "prop.chest": [ 16, 8 ], "prop.chestOpen": [ 16, 8 ], "prop.sign": [ 16, 9 ], "prop.post": [ 16, 9 ], "prop.buoy": [ 16, 7 ], "prop.cage": [ 16, 6 ], "prop.block": [ 16, 9 ], "prop.saucer": [ 20, 7 ], "prop.crystal": [ 8, 9 ], "prop.beacon": [ 8, 9 ], "item.heart": [ 7, 6 ], "item.heartC": [ 7, 6 ], "item.coin": [ 6, 6 ], "item.gem": [ 6, 5 ], "item.key": [ 6, 6 ], "item.bosskey": [ 6, 6 ], "item.clover": [ 6, 6 ], "item.tincan": [ 6, 5 ], "item.fishsnack": [ 6, 5 ], "item.cookie": [ 6, 5 ], "item.berry": [ 6, 5 ], "item.bone": [ 6, 5 ], "item.shard": [ 6, 5 ], "item.crown": [ 6, 5 ], "item.berrySeed": [ 6, 4 ], "tool.mitts": [ 10, 7 ], "tool.net": [ 10, 7 ], "tool.harpoon": [ 10, 7 ], "tool.cage": [ 10, 5 ], "tool.bone": [ 10, 5 ], "gear.sandal": [ 10, 9 ], "gear.glove": [ 10, 8 ], "gear.suit": [ 10, 8 ], "gear.wing": [ 10, 7 ], "gear.bracer": [ 10, 7 ], "tree.tree": [ 24, 30 ], "tree.pine": [ 20, 30 ], "tree.palm": [ 24, 30 ] }

ASSET_SIZES['prop.block'] = [14, 13]
ASSET_SIZES.update({
  'noah.down.c': [16, 20], 'noah.down.d': [16, 20],
  'noah.up.c': [16, 20], 'noah.up.d': [16, 20],
  'noah.side.c': [16, 20], 'noah.side.d': [16, 20],
  'noahdive.down.c': [16, 20], 'noahdive.down.d': [16, 20],
  'noahdive.up.c': [16, 20], 'noahdive.up.d': [16, 20],
  'noahdive.side.c': [16, 20], 'noahdive.side.d': [16, 20],
  'noahsurf.right.a': [20, 12], 'noahsurf.right.b': [20, 12],
})
ASSET_SIZES.update({
  'boss.gustwing': [28, 22], 'boss.pufflord': [26, 22], 'boss.sparkhorn': [26, 24],
  'boss.tempestia': [30, 30], 'boss.parents': [32, 24], 'boss.parentsfree': [32, 24],
})
ASSET_SIZES.update({
  'boss.mottle': [22, 18], 'boss.thornback': [26, 18], 'boss.geode': [24, 24],
  'boss.grub': [28, 16], 'boss.gnash': [30, 30],
  'npc.kin1': [14, 16], 'npc.kin2': [14, 16], 'npc.kin3': [14, 16], 'npc.kin4': [14, 16],
})
ASSET_SIZES['boss.blazagon'] = [28, 26]
ASSET_SIZES['npc.lady'] = [16, 18]
# --- v10.22: museum / stableworks / mythics / facades ---
ASSET_SIZES.update({
  'creature.horse.a': [20, 17], 'creature.lion.a': [21, 17], 'creature.rainbowsheep.a': [18, 14],
  'creature.baalien.a': [18, 15], 'creature.glittergoat.a': [18, 14], 'creature.glimmerram.a': [18, 15],
  'creature.pegasus.a': [20, 17], 'creature.centaur.a': [19, 17], 'creature.griffin.a': [22, 17],
  'creature.mermaid.a': [17, 15], 'creature.prismabeast.a': [20, 16],
  'prop.haybale': [16, 13], 'prop.haystubble': [12, 5], 'prop.trough': [16, 11], 'prop.lantern': [10, 18],
  'prop.barnfront': [96, 72], 'prop.denarch': [30, 26], 'npc.otto': [16, 19], 'prop.crest': [14, 17],
  'prop.pedestal': [20, 17], 'prop.gearpede': [15, 18], 'prop.velvetrope': [24, 14], 'prop.banner': [13, 22],
  'npc.combi': [16, 19], 'prop.combinermachine': [44, 32], 'prop.plump': [18, 13], 'prop.trophystar': [15, 17],
  'prop.grannyhouse': [112, 94], 'prop.workshopannex': [72, 80], 'prop.coasthouse': [176, 120],
  'creature.mermaidsea.a': [16, 16], 'creature.seahorse.a': [10, 16], 'creature.angelfish.a': [16, 14],
  'creature.pufferfish.a': [14, 14], 'creature.starfish.a': [14, 12],
  'prop.sunkenship': [64, 56], 'prop.divingbell': [24, 30], 'prop.anchor': [20, 24], 'prop.porthole': [16, 16],
})

ASSET_SIZES.update({
  'creature.voltbug.a':[16,10],'creature.voltbug.b':[16,10],
  'creature.coghopper.a':[16,11],'creature.coghopper.b':[16,11],
  'creature.rustbeetle.a':[16,9],'creature.rustbeetle.b':[16,9],
  'creature.steambull.a':[16,11],'creature.steambull.b':[16,11],
  'creature.sparkdrone.a':[16,12],'creature.sparkdrone.b':[16,12],
  'creature.blazagon.a':[18,20],'creature.blazagon.b':[18,20],'creature.blazagon.run':[18,20],'creature.blazagon.leap':[18,20],
  'boss.ramsisuper.a':[22,18],'boss.ramsisuper.b':[22,18],'boss.ramsisuper.charge':[22,18],'boss.ramsisuper.blast':[26,18],
  'prop.colbodya':[48,64],'prop.colbodyb':[48,64],'prop.colhead':[16,16],'prop.colhelm':[20,18],
  'prop.colarml':[14,30],'prop.colarmr':[14,30],'prop.colplates':[14,12],'prop.colplatec':[16,14],
  'prop.colplateb':[16,12],'prop.coltornado':[16,28],'prop.colbolt':[10,16],
  'prop.colgrass':[12,10],'prop.colmilk':[10,14],'prop.colchunk':[14,12],
  'item.starcell':[11,11],'item.starcelldim':[11,11],'fx.starburst':[16,16],'fx.starsmall':[5,5],'prop.ribbon':[18,8],'item.superseal':[14,14],
  'prop.anchor':[10,13],'prop.glidepuff':[14,10],'prop.antenna':[8,15],
  'tile.wall0':[16,16],'tile.wall1':[16,16],'tile.winstrip':[16,16],'tile.brick':[16,16],
  'tile.facadelit':[16,16],'tile.facadeblue':[16,16],'tile.facadedark':[16,16],'tile.facadedim':[16,16],
  'tile.facadebig':[16,16],'tile.ledge':[16,16],'tile.acunit':[16,16],'tile.skylight':[16,16],
})
ASSET_SIZES.update({
  'prop.clockface':[48,48],
  'tile.towerpanel':[16,16],'tile.towergear':[16,16],
  'prop.towercolumn':[12,32],'prop.towercolumn2':[12,32],'prop.towerwindow':[15,26],'prop.towercornice':[20,8],
  'prop.cloudbig':[36,16],'prop.cloudsmall':[24,12],'prop.sun':[26,26],'prop.spire':[13,28],'prop.birds':[20,8],'prop.airship':[30,15],
})
ASSET_SIZES.update({
  # sheet 12 (newart12): Glimmer-Deep fish + Sky-Spire stormcrow + secret-vault craft gems.
  # Sizes match each cell's content aspect; widths keep densFor() integer vs the procedural
  # twins (stormcrow base is 16 logical px wide; the item grids are 5 wide).
  'creature.lanterna.a': [12, 12], 'creature.glowfish.a': [8, 6], 'creature.stormcrow.a': [15, 17],
  'item.goldnugget': [5, 5], 'item.crystalshard': [5, 9], 'item.voidgem': [5, 7],
})
ASSET_SIZES = {k.lower(): v for k, v in ASSET_SIZES.items()}

# sprites that must face RIGHT in-engine but were generated facing left
FLIP_KEYS = {'creature.sheep.a', 'creature.ram.a', 'creature.snowhare.a'}

# gentle palette normalization: colors very close to the official game palette
# snap to it exactly (keeps AI art on-model; pure whites become fluff-white)
PALETTE = [(36,26,51),(255,248,240),(240,232,216),(248,200,150),(224,160,112),(248,208,72),(248,236,112),
 (232,74,74),(168,48,64),(72,120,232),(44,76,168),(84,88,95),(58,61,69),(88,196,82),(58,148,64),
 (168,112,60),(122,76,38),(170,178,192),(108,116,132),(248,152,200),(208,96,160),(154,98,224),
 (106,60,176),(248,146,56),(200,104,32),(64,192,184),(40,136,128),(154,220,248),(88,168,216),
 (200,160,96),(248,184,0),(24,16,24)]
def snap_palette(r, g, b):
    best, bd = None, 23 * 23
    for (pr, pg, pb) in PALETTE:
        d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
        if d < bd: bd, best = d, (pr, pg, pb)
    return best or (r, g, b)


def has_real_alpha(im):
    if im.mode != 'RGBA': return False
    hist = im.getchannel('A').histogram()
    return sum(hist[:128]) > im.width * im.height * 0.01

def border_colors(im):
    """Dominant colors of the border ring (handles solid AND two-tone checker bgs)."""
    px = im.load(); w, h = im.size
    cnt = collections.Counter()
    step = max(1, w // 128)
    for i in range(0, w, step):
        for j in (0, 1, h - 2, h - 1):
            p = px[i, j]; cnt[(p[0] // 8 * 8, p[1] // 8 * 8, p[2] // 8 * 8)] += 1
    step = max(1, h // 128)
    for j in range(0, h, step):
        for i in (0, 1, w - 2, w - 1):
            p = px[i, j]; cnt[(p[0] // 8 * 8, p[1] // 8 * 8, p[2] // 8 * 8)] += 1
    total = sum(cnt.values()) or 1
    out = [col for col, n in cnt.most_common(4) if n > total * 0.08]
    return out or [cnt.most_common(1)[0][0]]

def bg_mask(im):
    """1 = background. True alpha if present; otherwise FLOOD FILL from the
    border through background-like colors — survives fake-transparency
    checkers and never eats outlined sprite interiors (even white ones)."""
    px = im.load(); w, h = im.size
    mask = bytearray(w * h)
    if has_real_alpha(im):
        for j in range(h):
            base = j * w
            for i in range(w):
                if px[i, j][3] < 128: mask[base + i] = 1
        return mask
    bgs = border_colors(im)
    def bglike(p):
        if len(p) > 3 and p[3] < 128: return True
        for b in bgs:
            if abs(p[0] - b[0]) <= 16 and abs(p[1] - b[1]) <= 16 and abs(p[2] - b[2]) <= 16: return True
        return False
    dq = collections.deque()
    def seed(i, j):
        if not mask[j * w + i] and bglike(px[i, j]): mask[j * w + i] = 1; dq.append((i, j))
    for i in range(w): seed(i, 0); seed(i, h - 1)
    for j in range(h): seed(0, j); seed(w - 1, j)
    while dq:
        i, j = dq.popleft()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < w and 0 <= nj < h and not mask[nj * w + ni] and bglike(px[ni, nj]):
                mask[nj * w + ni] = 1; dq.append((ni, nj))
    return mask

def convert(src, dst, tw, th):
    key = os.path.basename(dst)[:-4].lower()
    return convert_group([(Image.open(src).convert('RGBA'), key)])

def convert_image(im, dst, tw, th):
    tw *= DENSITY; th *= DENSITY
    im = im.convert('RGBA')
    px = im.load(); w, h = im.size
    mask = bg_mask(im)
    # content bounding box
    minx, miny, maxx, maxy = w, h, -1, -1
    for j in range(h):
        base = j * w
        for i in range(w):
            if not mask[base + i]:
                if i < minx: minx = i
                if i > maxx: maxx = i
                if j < miny: miny = j
                if j > maxy: maxy = j
    if maxx < 0: raise ValueError('image is empty: ' + dst)
    cw, ch = maxx + 1 - minx, maxy + 1 - miny
    # snap to the sprite grid: dominant color per cell
    out = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    for cj in range(th):
        for ci in range(tw):
            x0 = minx + int(ci * cw / tw); x1 = max(x0 + 1, minx + int((ci + 1) * cw / tw))
            y0 = miny + int(cj * ch / th); y1 = max(y0 + 1, miny + int((cj + 1) * ch / th))
            cnt, total = collections.Counter(), 0
            for j in range(y0, min(y1, h)):
                base = j * w
                for i in range(x0, min(x1, w)):
                    total += 1
                    if mask[base + i]: continue
                    p = px[i, j]
                    cnt[(p[0] // 10 * 10 + 5, p[1] // 10 * 10 + 5, p[2] // 10 * 10 + 5)] += 1
            if not cnt or sum(cnt.values()) < total * 0.45:
                continue
            r, g, b = cnt.most_common(1)[0][0]
            if r + g + b < 150:                     # snap dark pixels to the game outline
                r, g, b = OUTLINE
            else:
                r, g, b = snap_palette(min(r, 255), min(g, 255), min(b, 255))
            out.putpixel((ci, cj), (r, g, b, 255))
    key = os.path.basename(dst)[:-4].lower()
    if key in FLIP_KEYS:
        out = out.transpose(Image.FLIP_LEFT_RIGHT)
    out.save(dst)

# ---- sprite sheets: one AI image carries a whole category ----
# file assets/raw/sheet.<name>.png  ->  sliced row-major into the keys below.
# '-' = empty cell. Cells are equal subdivisions of the image; each cell is
# background-keyed and content-cropped independently, so sloppy AI centering
# is fine as long as sprites do not touch cell borders.
SHEETS = {
  'cogcreatures': {'cols': 2, 'rows': 5, 'keys': [
    'creature.voltbug.a','creature.voltbug.b',
    'creature.coghopper.a','creature.coghopper.b',
    'creature.rustbeetle.a','creature.rustbeetle.b',
    'creature.steambull.a','creature.steambull.b',
    'creature.sparkdrone.a','creature.sparkdrone.b']},
  'blazagon': {'cols': 2, 'rows': 2, 'keys': [
    'creature.blazagon.a','creature.blazagon.b',
    'creature.blazagon.run','creature.blazagon.leap']},
  # v10.22 additions registered after the dict (see below)
  'colossus': {'cols': 4, 'rows': 4, 'dens': 4, 'keys': [
    'prop.colbodya','prop.colbodyb','prop.colhead','prop.colhelm',
    'prop.colarml','prop.colarmr','prop.colplates','prop.colplatec',
    'prop.colplateb','-','prop.coltornado','prop.colbolt',
    'prop.colgrass','prop.colmilk','prop.colchunk','-']},
  'superramsi': {'cols': 2, 'rows': 2, 'keys': [
    'boss.ramsisuper.a','boss.ramsisuper.b',
    'boss.ramsisuper.charge','boss.ramsisuper.blast']},
  'stars': {'cols': 3, 'rows': 2, 'keys': [
    'item.starcell','item.starcelldim','fx.starburst',
    'fx.starsmall','prop.ribbon','item.superseal']},
  'roofprops': {'cols': 3, 'rows': 1, 'keys': ['prop.anchor','prop.glidepuff','prop.antenna']},
  'rooftiles': {'cols': 4, 'rows': 3, 'keys': [
    'tile.wall0','tile.wall1','tile.winstrip','tile.brick',
    'tile.facadelit','tile.facadeblue','tile.facadedark','tile.facadedim',
    'tile.facadebig','tile.ledge','tile.acunit','tile.skylight']},

  'towerwalls': {'cols': 3, 'rows': 2, 'keys': [
    'tile.towerpanel','tile.towergear','prop.towercolumn',
    'prop.towercolumn2','prop.towerwindow','prop.towercornice']},
  'skyprops': {'cols': 3, 'rows': 2, 'keys': [
    'prop.cloudbig','prop.cloudsmall','prop.sun',
    'prop.spire','prop.birds','prop.airship']},

  'noah':      {'cols': 3, 'rows': 3, 'keys': [
    'noah.down.a','noah.down.b','noah.up.a',
    'noah.up.b','noah.side.a','noah.side.b',
    'noah.climb','noahswim.right.a','noahswim.right.b']},
  'noah2':     {'cols': 4, 'rows': 4, 'keys': [
    'noah.down.a','noah.down.b','noah.down.c','noah.down.d',
    'noah.up.a','noah.up.b','noah.up.c','noah.up.d',
    'noah.side.a','noah.side.b','noah.side.c','noah.side.d',
    'noah.climb','noahsurf.right.a','noahsurf.right.b','-']},
  'noahdive':  {'auto': True, 'keys': [
    'noahdive.down.a','noahdive.down.b','noahdive.up.a','noahdive.up.b',
    '-','-','noahdive.side.a','noahdive.side.b',
    'noahdive.climb']},
  'creatures': {'cols': 4, 'rows': 4, 'keys': [
    'creature.sheep.a','creature.ram.a','creature.goat.a','creature.snowhare.a',
    'creature.crab.a','creature.octopus.a','creature.jellyfish.a','creature.shark.a',
    'creature.capricorn.a','creature.starpupil.a','creature.alien.a','creature.unicorn.a',
    'creature.cometpup.a','creature.dragon.a','creature.condor.a','creature.ibex.a']},
  'npcs':      {'cols': 4, 'rows': 3, 'keys': [
    'npc.granny','npc.marko','npc.tess','npc.sal',
    'npc.gruul','npc.cora','npc.trader','npc.plume',
    'npc.zibble','npc.spirit','-','-']},
  'bosses':    {'cols': 3, 'rows': 2, 'keys': [
    'boss.billy','boss.cerberus','boss.sahor',
    'boss.twinkle','boss.ramsi','boss.ramsicage']},
  'skyworld':  {'cols': 3, 'rows': 2, 'keys': [
    'boss.gustwing','boss.pufflord','boss.sparkhorn',
    'boss.tempestia','boss.parents','boss.parentsfree']},
  'underburrow':{'cols': 3, 'rows': 3, 'keys': [
    'boss.mottle','boss.thornback','boss.geode',
    'boss.grub','boss.gnash','npc.kin1',
    'npc.kin2','npc.kin3','npc.kin4']},
  'props':     {'cols': 4, 'rows': 3, 'keys': [
    'prop.chest','prop.chestopen','prop.sign','prop.post',
    'prop.buoy','prop.cage','prop.block','prop.saucer',
    'prop.crystal','prop.beacon','-','-']},
  'items':     {'cols': 4, 'rows': 4, 'keys': [
    'item.heart','item.heartc','item.coin','item.gem',
    'item.key','item.bosskey','item.clover','item.tincan',
    'item.fishsnack','item.cookie','item.berry','item.bone',
    'item.shard','item.crown','item.berryseed','-']},
  'gear':      {'cols': 4, 'rows': 3, 'keys': [
    'gear.sandal','gear.glove','gear.suit','gear.wing',
    'gear.bracer','tool.mitts','tool.net','tool.harpoon',
    'tool.cage','tool.bone','-','-']},
  'trees':     {'cols': 3, 'rows': 2, 'keys': [
    'tree.tree','tree.pine','tree.palm',
    '-','-','-']},
}
SHEETS['mythics'] = {'cols': 4, 'rows': 3, 'dens': 4, 'keys': [
  'creature.horse.a', 'creature.lion.a', 'creature.rainbowsheep.a', 'creature.baalien.a',
  'creature.glittergoat.a', 'creature.glimmerram.a', 'creature.pegasus.a', 'creature.centaur.a',
  'creature.griffin.a', 'creature.mermaid.a', 'creature.prismabeast.a', '-']}
SHEETS['stableworks'] = {'cols': 4, 'rows': 2, 'dens': 4, 'keys': [
  'prop.haybale', 'prop.haystubble', 'prop.trough', 'prop.lantern',
  'prop.barnfront', 'prop.denarch', 'npc.otto', 'prop.crest']}
SHEETS['museum'] = {'cols': 4, 'rows': 2, 'dens': 4, 'keys': [
  'prop.pedestal', 'prop.gearpede', 'prop.velvetrope', 'prop.banner',
  'npc.combi', 'prop.combinermachine', 'prop.plump', 'prop.trophystar']}
SHEETS['aquarium'] = {'cols': 3, 'rows': 2, 'dens': 4, 'keys': [
  'creature.mermaidsea.a', 'creature.seahorse.a', 'creature.angelfish.a',
  'creature.pufferfish.a', 'creature.starfish.a', '-']}
SHEETS['aqobjects'] = {'cols': 2, 'rows': 2, 'dens': 4, 'keys': [
  'prop.sunkenship', 'prop.divingbell', 'prop.anchor', 'prop.porthole']}
# NEW (Sheet 12): ONLY genuinely-new art. The reef fish (seahorse/angelfish/pufferfish/
# starfish) already have art in SHEETS['aquarium'] and must NOT be redrawn here (double-
# wiring creature.<fish>.a would collide). This sheet = the two Glimmer-Deep glow fish +
# the Spire condor + the three secret-vault craft gems. LANTERNA art feeds BOTH the shy
# boss and the freed lantern-fish (both draw Sprites.creatures.lanterna). Drop
# assets/raw/sheet.newart12.png (3x2) and re-run import_art to replace the procedural art.
SHEETS['newart12'] = {'cols': 3, 'rows': 2, 'dens': 4, 'keys': [
  'creature.lanterna.a', 'creature.glowfish.a', 'creature.stormcrow.a',
  'item.goldnugget', 'item.crystalshard', 'item.voidgem']}
# Sheet 18: the OPENING CUTSCENE poses (props so installExtSprite files them under Sprites.props)
# NOTE: the R2C3 spire cell is deliberately SKIPPED ('-') — its floating-crystal-island look
# didn't match the unified world map (red rock + crystal crown); the intro draws its own
# matching spire, and the Crystal Crown level art carries the aesthetic in-game.
SHEETS['introart'] = {'cols': 3, 'rows': 2, 'dens': 4, 'keys': [
  'prop.introhug', 'prop.introsahorfly', 'prop.introcage',
  'prop.intronoahbrave', 'prop.intronoahdash', '-']}
ASSET_SIZES.update({
  'prop.introhug': [24, 20], 'prop.introsahorfly': [26, 22], 'prop.introcage': [16, 14],
  'prop.intronoahbrave': [16, 20], 'prop.intronoahdash': [18, 20], 'prop.introspire': [22, 30],
})

# ---- painted scene.* backdrops: smooth LANCZOS resize (NEVER grid-snapped) ----
# Drop assets/raw/scene.<name>.png and, if listed here, import_art resizes it to the
# target and writes assets/scene.<name>.png. (Other scene.* raws keep their manual flow.)
SCENES = {
  'scene.intro_vale': (960, 544),
  'scene.intro_storm': (960, 544),
}


def find_sprites(im):
    """Connected non-background blobs -> bounding boxes, row-major order.
    Rescues sheets where the AI ignored the requested grid."""
    im = im.convert('RGBA')
    w, h = im.size
    mask = bg_mask(im)
    seen = bytearray(w * h)
    boxes = []
    for j0 in range(0, h, 2):
        base0 = j0 * w
        for i0 in range(0, w, 2):
            if mask[base0 + i0] or seen[base0 + i0]: continue
            dq = collections.deque([(i0, j0)]); seen[base0 + i0] = 1
            minx = maxx = i0; miny = maxy = j0; n = 0
            while dq:
                i, j = dq.popleft(); n += 1
                if i < minx: minx = i
                if i > maxx: maxx = i
                if j < miny: miny = j
                if j > maxy: maxy = j
                for dj in (-2, -1, 0, 1, 2):
                    nj = j + dj
                    if nj < 0 or nj >= h: continue
                    nbase = nj * w
                    for di in (-2, -1, 0, 1, 2):
                        ni = i + di
                        if ni < 0 or ni >= w: continue
                        if mask[nbase + ni] or seen[nbase + ni]: continue
                        seen[nbase + ni] = 1; dq.append((ni, nj))
            boxes.append([minx, miny, maxx, maxy, n])
    # merge boxes that overlap (pad 10px)
    changed = True
    while changed:
        changed = False
        out = []
        for b in boxes:
            for o in out:
                if b[0] - 10 <= o[2] and b[2] + 10 >= o[0] and b[1] - 10 <= o[3] and b[3] + 10 >= o[1]:
                    o[0] = min(o[0], b[0]); o[1] = min(o[1], b[1])
                    o[2] = max(o[2], b[2]); o[3] = max(o[3], b[3]); o[4] += b[4]
                    changed = True; break
            else:
                out.append(b)
        boxes = out
    big = max(b[4] for b in boxes) if boxes else 0
    boxes = [b for b in boxes if b[4] > big * 0.04 and (b[2] - b[0]) > 8 and (b[3] - b[1]) > 8]
    # group into rows by center-y, then sort by x
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    rows, cur = [], []
    for b in boxes:
        if cur and (b[1] + b[3]) / 2 - (cur[-1][1] + cur[-1][3]) / 2 > (cur[-1][3] - cur[-1][1]) * 0.6:
            rows.append(cur); cur = []
        cur.append(b)
    if cur: rows.append(cur)
    ordered = []
    for r in rows:
        r.sort(key=lambda b: b[0])
        ordered.extend(r)
    return im, ordered


STRICT_KINDS = ('prop', 'item', 'gear', 'tool', 'tree', 'boss', 'npc')

def clean_mask(im, mask, strict=False):
    """Remove small stray blobs (AI dust/checker residue) far from the main figure.
    strict: single-object sprites keep ONLY the main blob + blobs overlapping it."""
    w, h = im.size
    seen = bytearray(w * h)
    comps = []
    for j0 in range(h):
        b0 = j0 * w
        for i0 in range(w):
            if mask[b0 + i0] or seen[b0 + i0]: continue
            dq = collections.deque([(i0, j0)]); seen[b0 + i0] = 1
            cells = [(i0, j0)]; minx = maxx = i0; miny = maxy = j0
            while dq:
                i, j = dq.popleft()
                for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
                    ni, nj = i + di, j + dj
                    if 0 <= ni < w and 0 <= nj < h and not mask[nj * w + ni] and not seen[nj * w + ni]:
                        seen[nj * w + ni] = 1; dq.append((ni, nj)); cells.append((ni, nj))
                        if ni < minx: minx = ni
                        if ni > maxx: maxx = ni
                        if nj < miny: miny = nj
                        if nj > maxy: maxy = nj
            comps.append((cells, minx, miny, maxx, maxy))
    if not comps: return mask
    main = max(comps, key=lambda c: len(c[0]))
    mc, mx0, my0, mx1, my1 = main
    padx, pady = (mx1 - mx0) * 0.12 + 2, (my1 - my0) * 0.12 + 2
    for cells, x0, y0, x1, y1 in comps:
        if cells is mc: continue
        if strict:
            overlap = x1 >= mx0 and x0 <= mx1 and y1 >= my0 and y0 <= my1
            if not overlap:
                for (i, j) in cells: mask[j * w + i] = 1
            continue
        near = x1 >= mx0 - padx and x0 <= mx1 + padx and y1 >= my0 - pady and y0 <= my1 + pady
        on_border = x0 <= 1 or y0 <= 1 or x1 >= w - 2 or y1 >= h - 2
        drop = (len(cells) < len(mc) * 0.03 and not near) or (on_border and len(cells) < len(mc) * 0.15)
        if drop:
            for (i, j) in cells: mask[j * w + i] = 1
    return mask

def content_bbox(im, mask):
    w, h = im.size
    minx, miny, maxx, maxy = w, h, -1, -1
    for j in range(h):
        base = j * w
        for i in range(w):
            if not mask[base + i]:
                if i < minx: minx = i
                if i > maxx: maxx = i
                if j < miny: miny = j
                if j > maxy: maxy = j
    if maxx < 0: raise ValueError('image is empty')
    return minx, miny, maxx, maxy

def render_snapped(im, mask, bbox, dst, tw, th, spp):
    """Grid-snap with a FIXED scale (spp = source px per target px), uniform
    aspect, anchored bottom-center — animation frames stay rock steady."""
    px = im.load(); w, h = im.size
    minx, miny, maxx, maxy = bbox
    cxc = (minx + maxx + 1) / 2.0
    out = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    for cj in range(th):
        y0 = (maxy + 1) - (th - cj) * spp; y1 = y0 + spp
        for ci in range(tw):
            x0 = cxc + (ci - tw / 2.0) * spp; x1 = x0 + spp
            cnt, total = collections.Counter(), 0
            for j in range(max(0, int(y0)), min(h, max(int(y0) + 1, int(y1)))):
                base = j * w
                for i in range(max(0, int(x0)), min(w, max(int(x0) + 1, int(x1)))):
                    total += 1
                    if mask[base + i]: continue
                    p = px[i, j]
                    cnt[(p[0] // 10 * 10 + 5, p[1] // 10 * 10 + 5, p[2] // 10 * 10 + 5)] += 1
            if not cnt or total == 0 or sum(cnt.values()) < total * 0.45:
                continue
            r, g, b = cnt.most_common(1)[0][0]
            if r + g + b < 150:
                r, g, b = OUTLINE
            else:
                r, g, b = snap_palette(min(r, 255), min(g, 255), min(b, 255))
            out.putpixel((ci, cj), (r, g, b, 255))
    key = os.path.basename(dst)[:-4].lower()
    if key in FLIP_KEYS:
        out = out.transpose(Image.FLIP_LEFT_RIGHT)
    out.save(dst)

def group_id(key):
    p = key.split('.')
    if p[0] in ('noah', 'noahdive'): return p[0]          # one scale per character
    if p[-1] in ('a', 'b', 'c', 'd'): return '.'.join(p[:-1])
    return key

def convert_group(cells, dens=None):
    """cells: list of (im, key). Shared uniform scale across the group."""
    d = dens or DENSITY
    prepared, done = [], 0
    for im, key in cells:
        im = im.convert('RGBA')
        strict = key.split('.')[0] in STRICT_KINDS
        mask = clean_mask(im, bg_mask(im), strict)
        try:
            bbox = content_bbox(im, mask)
        except ValueError:
            print('  FAIL %-22s empty cell' % key); continue
        tw, th = ASSET_SIZES[key]
        tw *= d; th *= d
        spp = max((bbox[2] + 1 - bbox[0]) / tw, (bbox[3] + 1 - bbox[1]) / th)
        prepared.append([im, mask, bbox, key, tw, th, spp])
    if not prepared: return 0
    for im, mask, bbox, key, tw, th, spp in prepared:
        try:
            render_snapped(im, mask, bbox, os.path.join(OUT, key + '.png'), tw, th, spp)
            print('  OK %-24s (%dx%d @x%d)' % (key + '.png', tw // d, th // d, d)); done += 1
        except Exception as e:
            print('  FAIL %-22s %s' % (key, e))
    return done

def convert_sheet_auto(path, name):
    layout = SHEETS[name]
    keys = layout['keys']
    im, boxes = find_sprites(Image.open(path))
    print('  (auto-cluster: %d sprites found, %d expected)' % (len(boxes), sum(1 for k in keys if k != '-')))
    groups = {}
    for box, key in zip(boxes, keys):
        if key == '-': continue
        if key not in ASSET_SIZES:
            print('  ?? unknown key:', key); continue
        cell = im.crop((box[0] - 2, box[1] - 2, box[2] + 3, box[3] + 3))
        groups.setdefault(group_id(key), []).append((cell, key))
    return sum(convert_group(cells) for cells in groups.values())

def convert_sheet(path, name):
    layout = SHEETS[name]
    if layout.get('auto'):
        return convert_sheet_auto(path, name)
    cols, rows, keys = layout['cols'], layout['rows'], layout['keys']
    sheet = Image.open(path).convert('RGBA')
    w, h = sheet.size
    cw, ch = w / cols, h / rows
    groups = {}
    for idx, key in enumerate(keys):
        if key == '-': continue
        if key not in ASSET_SIZES:
            print('  ?? unknown key in sheet:', key); continue
        row, col = idx // cols, idx % cols
        inset_x, inset_y = cw * 0.03, ch * 0.03
        cell = sheet.crop((int(col * cw + inset_x), int(row * ch + inset_y),
                           int((col + 1) * cw - inset_x), int((row + 1) * ch - inset_y)))
        groups.setdefault(group_id(key), []).append((cell, key))
    return sum(convert_group(cells, layout.get('dens')) for cells in groups.values())

def main():
    os.makedirs(RAW, exist_ok=True)
    done = errs = 0
    for f in sorted(os.listdir(RAW)):
        if not f.lower().endswith('.png'): continue
        if f.lower().endswith('.big.png'): continue   # handled in the .big override pass below
        key = f[:-4].lower()
        if key in SCENES:                              # painted backdrop: smooth resize, no snapping
            tw, th = SCENES[key]
            try:
                im = Image.open(os.path.join(RAW, f)).convert('RGB')
                im.resize((tw, th), Image.LANCZOS).save(os.path.join(OUT, key + '.png'))
                print('SCENE %-23s -> assets/%s.png  (%dx%d smooth)' % (f, key, tw, th)); done += 1
            except Exception as e:
                print('FAIL %-24s %s' % (f, e)); errs += 1
            continue
        if key.startswith('sheet.'):
            name = key[6:]
            if name in SHEETS:
                print('SHEET %-23s slicing %d cells:' % (f, sum(1 for k in SHEETS[name]['keys'] if k != '-')))
                try:
                    done += convert_sheet(os.path.join(RAW, f), name)
                except Exception as e:
                    print('  FAIL whole sheet: %s (re-export this file?)' % e); errs += 1
            else:
                print('SKIP %-24s (unknown sheet; one of: %s)' % (f, ', '.join(sorted(SHEETS)))); errs += 1
            continue
        if key not in ASSET_SIZES:
            print('SKIP %-24s (unknown key; see ASSETS.md for the full list)' % f); errs += 1; continue
        tw, th = ASSET_SIZES[key]
        try:
            convert(os.path.join(RAW, f), os.path.join(OUT, key + '.png'), tw, th)
            print('OK   %-24s -> assets/%s.png  (%dx%d)' % (f, key, tw, th)); done += 1
        except Exception as e:
            print('FAIL %-24s %s' % (f, e)); errs += 1
    # ---- second pass: hi-res *.big.png overrides WIN over sheet-sliced art ----
    # Drop a file like  assets/raw/boss.cerberus.big.png  and it overwrites the
    # sheet's version of that key every import, so hand-made art is never clobbered.
    for f in sorted(os.listdir(RAW)):
        if not f.lower().endswith('.big.png'): continue
        key = f[:-len('.big.png')].lower()
        if key not in ASSET_SIZES:
            print('SKIP %-24s (.big override: no such asset key "%s")' % (f, key)); errs += 1; continue
        tw, th = ASSET_SIZES[key]
        try:
            convert(os.path.join(RAW, f), os.path.join(OUT, key + '.png'), tw, th)
            print('BIG  %-24s -> assets/%s.png  (hi-res override)' % (f, key)); done += 1
        except Exception as e:
            print('FAIL %-24s %s' % (f, e)); errs += 1
    print('%d converted, %d skipped/failed. Now run: python3 build.py' % (done, errs))

if __name__ == '__main__':
    main()
