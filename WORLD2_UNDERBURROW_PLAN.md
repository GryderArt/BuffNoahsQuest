# WORLD 2 — THE UNDERBURROW  ·  Storyboard + Build Handoff

> **Naming.** *World 1 = **Mimi Island*** — the whole current game: its four levels (Greenwood Vale,
> Sunsplash Coast, Starfall Wastes, Whistling Canyon) **plus the Skyward Ascent** sky-finale and its
> four sky bosses. **This new world — The Underburrow — is World 2, the SECOND world**: four new
> levels (5–8). NOTE for coders: the existing sky code is *internally* labelled `world2` /
> `14_world2.js` / `flags.world2`; that's just the Skyward-Ascent feature's name, **not** a separate
> world. The new world uses `underburrow` / `burrow` identifiers to avoid the clash.

> **For the NEXT session.** This is a self-contained brief: it assumes no memory of the
> chat that produced it. Read PART A (what to build) then PART B (how to build it).
> Scope = the same as the original game's first four levels (Vale/Coast/Wastes/Canyon):
> **four LARGE levels**, each roughly Greenwood-Vale-sized (~56–64 tiles wide, with a
> sub-room or two), not the little 40×20 sky rooms. Build it in WAVES (see PART B §13)
> and test after each wave — do NOT try to land it all in one pass.

---

## Decisions already made (by Berkley, the owner)
- **New world** = "The Underburrow", a 4-level underground adventure for Noah **and Ramsi**
  (the pillow-pet companion, already implemented and following Noah).
- **Goal / quest:** *Rescue the Pillow-Kin* — Ramsi's plush family, dragged underground
  and caged by the villain. Each Pillow-Kin you free awakens one of Ramsi's dormant powers.
- **Structure:** Levels 5–7 are ability/puzzle adventures, each with its own **Underburrow boss
  ("Burrow Warden")** beaten using that level's new Ramsi ability. **Level 8** is the big descent:
  its own Warden, then a **boss-rush gauntlet that re-fights all four Wardens** (Gnash re-summons
  his elite), then **GNASH** as the final boss.
- **Brand-NEW bosses — do NOT reuse the sky bosses.** The four sky bosses stay ONLY in the **Skyward Ascent** (part of World 1, Mimi Island), untouched. **World 2 — the
  Underburrow** gets four new, theme-matched Wardens: **Mottle the Mole**
  (L5), **Thornback** the root-spider (L6), **Geode Golem** (L7), **the Tremor-Grub** (L8). Each is
  a co-op fight whose KEY is that level's ability (Glow+Shrink / Decoy+Bounce / Glide+Roll / Pound).
- **Ramsi's new abilities (7):**
  - Traversal/puzzle: **Shrink, Pillow-Bounce, Puff-Glide, Glow**
  - Battle: **Decoy Taunt, Roll-Charge, Ground-Pound**

## Open choices the next session can finalize (sensible defaults proposed below)
- Villain name: **GNASH, the Hollow King** (a giant mole-monarch who hoards soft, cuddly
  things to line his burrow). Rename freely.
- Exact map dimensions, miniboss names, secret contents — proposed, adjust to taste.
- World-3 entry point (proposed: a burrow entrance that opens after the parents are rescued;
  see PART B §10).

---

# PART A — STORYBOARD

## Story
With Berkley & Megan safely home, the ground itself starts to rumble. Ramsi's plush family —
the **Pillow-Kin** — have been snatched down into **The Underburrow** by **GNASH, the Hollow
King**, a mole-monarch who collects soft, precious things. Worse: in his deepest cavern Gnash
breeds a brood of burrow-beasts — the **Wardens** — to guard his hoard. Noah and Ramsi dig down
through four great burrow-realms, freeing a Pillow-Kin in each (every reunion reawakens one of
Ramsi's powers) and besting each realm's Warden, until they reach Gnash's hoard, fight back
through all four Wardens re-summoned as a gauntlet, and defeat Gnash to bring the whole
Pillow-Kin family home.

## Ramsi ability roster (existing + NEW)
Ramsi already: **follows** Noah, **Headbutts** boss shields & sky-switches (ramHead), **Charge-
stuns** small enemies (ramStun), **Guards** Noah from a hit (ramShield), **Boost** (ramBoost).

NEW (taught one/two per level; gated behind freeing each Pillow-Kin):
| Ability | Flag | Kind | What it does | Trigger |
|---|---|---|---|---|
| **Glow** | `ramGlow` | puzzle | Ramsi lights up; widens the dark-room light radius and reveals hidden paths/switches that only show in her glow. | Passive in `map.dark` burrow rooms. |
| **Shrink** | `ramShrink` | puzzle | Ramsi shrinks, scurries through a tiny **burrow-hole** Noah can't fit, and flips a switch on the far side (opens a flag-gate). | Press **C** near a `ramhole`. |
| **Pillow-Bounce** | `ramBounce` | traversal | Ramsi flattens into a trampoline on a **bounce-pad**; Noah jumps (X) on her to launch up a tall ledge / over a wall. | Stand on her at a pad, press **X**. |
| **Puff-Glide** | `ramGlide` | traversal | Ramsi inflates and carries Noah across a wide chasm / rides an updraft to a marked landing. | Board her at a `glidevent`, press **C**. |
| **Decoy Taunt** | `ramDecoy` | battle | Ramsi taunts; nearby enemies/boss target HER (she's briefly invulnerable) so Noah can act. | Press **C** near enemies. |
| **Roll-Charge** | `ramRoll` | battle/puzzle | Ramsi rolls in Noah's facing direction, bowling enemies and smashing **soft-blocks**. | Press **C** with a clear lane. |
| **Ground-Pound** | `ramPound` | battle | Ramsi slams down: shockwave stuns ALL nearby enemies. The finale "ultimate." | Press **C** (cooldown). |

> **One command key: `C` ("Call Ramsi").** It performs the *context-appropriate* ability based
> on what's nearest (a `ramhole` → Shrink; a `glidevent` → Glide; enemies/boss → Decoy / Pound /
> Roll). Glow is automatic; Bounce uses Noah's existing jump (X) while standing on Ramsi. This
> keeps the control scheme tiny and matches the existing auto-assist feel.

> **NO-FLY rule:** Underburrow ceilings are too low — set `m.noFly = true` on burrow maps so
> Noah's Angel Wings are disabled there. This is what makes Bounce/Glide matter (otherwise wings
> trivialize vertical/gap traversal). The Ram Suit (smash cracked walls) still works.

## The four levels (each ≈ Greenwood-Vale sized)

### LEVEL 5 — TOPSOIL TUNNELS  (teaches GLOW + SHRINK)
- **Look:** soft brown soil, dangling roots, glow-worm veins, the first dark caverns.
- **Open:** you tumble in after Ramsi; a friendly burrow-mole NPC explains Gnash took the Pillow-Kin.
- **GLOW:** first dark cavern — you can barely see. Free **Pillow-Kin #1 (a glow-cub)** in a lit
  alcove → Ramsi learns **Glow**; now her light fills dark rooms and makes faint "ghost-vein"
  paths/switches visible.
- **SHRINK:** the path is blocked by a wall with a tiny **burrow-hole**; press **C** so Ramsi
  shrinks through and flips the gate switch. 2–3 escalating shrink puzzles (one hides a secret
  heart-piece; one needs Glow first to even SEE the hole).
- **Boss — "MOTTLE THE MOLE" (Burrow Warden):** pops between holes (use Glow to spot the right hole; send
  shrunk Ramsi to yank the plug that traps him; Noah grabs him). 1 reusable mini-boss pattern.
- **Exit:** a root-elevator down to Level 6.

### LEVEL 6 — ROOT HOLLOWS  (teaches PILLOW-BOUNCE + DECOY)
- **Look:** vast vertical chamber of braided giant roots, sap pools, hanging mushrooms.
- **BOUNCE:** free **Pillow-Kin #2** → Ramsi learns **Pillow-Bounce**. Mushroom **bounce-pads**
  let Noah launch up root-shelves he can't climb. Vertical platforming puzzles; a secret ledge.
- **DECOY:** sap-wasps swarm Noah. Free a caged Kin → **Decoy**: press C, Ramsi taunts the swarm
  while Noah slips past / hits a switch. Combine: Decoy the guard, then Bounce up.
- **Boss — "THORNBACK", the root-spider Warden:** armored front; **Decoy** to spin it around, **Bounce**
  to its soft back, Noah strikes. (Co-op pattern, like the Skyward-Ascent bosses.)
- **Sub-room (optional dungeon):** a small "Sap Works" block-puzzle using existing bracers + a
  bounce gate.
- **Exit:** descend a sap-fall to Level 7.

### LEVEL 7 — CRYSTAL DEEP  (teaches PUFF-GLIDE + ROLL-CHARGE)
- **Look:** glittering crystal caverns, bottomless star-chasms, warm updrafts.
- **GLIDE:** free **Pillow-Kin #3** → **Puff-Glide**. `glidevent` launch tiles + updrafts let Ramsi
  carry Noah across chasms too wide to jump (and wings are disabled here). Chasm-crossing puzzles.
- **ROLL-CHARGE:** crystal **soft-blocks** wall off the path; **Roll-Charge** smashes them and
  bowls crystal-crawlers. Combine: Glide to a ledge, Roll through a crystal wall to a secret vault.
- **Boss — "GEODE GOLEM" (Warden):** invulnerable shell; Glide behind it, **Roll-Charge** its exposed
  core; repeat 3×.
- **Exit:** a great downward shaft — you hear Gnash's hoard below.

### LEVEL 8 — THE HOARD DESCENT  (teaches GROUND-POUND → its Warden → GAUNTLET → GNASH)
- **Look:** Gnash's treasure-stuffed burrow — piles of stolen soft things, root-pillars, and a vast
  hoard-cavern lit by stolen lanterns.
- **GROUND-POUND:** free **Pillow-Kin #4** → **Ground-Pound** (AoE stun): the finale ultimate.
  A few rooms drill every ability together (Glow→Shrink→Bounce→Glide→Roll→Pound puzzle chain).
- **Warden — "THE TREMOR-GRUB":** a huge burrowing grub; **Ground-Pound** as it surfaces sends a
  shockwave that flips it belly-up → Noah strikes. (3 hits.)
- **THE GAUNTLET (Hoard Cavern):** the far end opens into **four den-rooms** (new maps
  `vault1`–`vault4`, Underburrow look). Gnash re-summons his elite — re-fight, back-to-back:
  **Mottle → Thornback → Geode Golem → Tremor-Grub**, each via its own co-op ability mechanic.
  (Fresh flags — see PART B §6 — so they re-appear even though you beat them once in L5–L8.)
- **FINAL BOSS — GNASH, the Hollow King:** a giant mole-monarch. Multi-phase co-op:
  1. Gnash **burrows** (invulnerable underground), surfacing to swipe → **Ground-Pound** as he
     surfaces to stun him → Noah strikes.
  2. He hurls crystal boulders → **Roll-Charge** them back or smash them; **Decoy** his charge.
  3. He summons mole-minions → **Decoy** + **Pound**. 3 hits per phase, 3 phases.
- **ENDING:** free all the **Pillow-Kin**; a **reunion cutscene** (reuse the cutscene system) →
  credits. Bonus: the Pillow-Kin could appear back in the overworld as cameo NPCs.

## New art needed → SHEET 11 (add to SHEET_PROMPTS.md, same MASTER-PROMPT style)
Produce one transparent sprite-sheet `sheet.underburrow.png` (and slice via import_art — PART B §9):
- **Underburrow tiles/props** (or draw procedurally — see PART B §5): soil floor, root-wall,
  glow-vein, crystal wall, burrow-hole, mushroom bounce-pad, glide-vent/updraft, soft-block.
- **Pillow-Kin** ×4 (cute plush critters in Ramsi's family — distinct colors; caged + freed poses).
- **Burrow Wardens** ×4: Mottle the Mole, Thornback the root-spider, Geode Golem, the Tremor-Grub (each its own boss art).
- **GNASH** the Hollow King (final boss; big mole-monarch with a crown) — caged-trophy backdrop optional.
- **Ramsi ability poses** (optional polish): shrunk-Ramsi, inflated/glide-Ramsi, glowing-Ramsi,
  rolling-Ramsi — so abilities read clearly. (The companion currently reuses `boss.ramsi` art.)
- Optional **big cutscene art**: "Noah + Ramsi + the Pillow-Kin family" group (compose like the
  existing `cutscene_family.png`).

---

# PART B — BUILD INSTRUCTIONS (engineering)

## §0 Environment, paths, workflow (READ FIRST)
- Source lives in `noahs-quest-v4/src/NN_name.js`. `build.py` concatenates `src/*.js` **sorted by
  filename**, embeds `assets/*.png` as base64 `EXT_ART`, and emits `BuffNoahsQuest_v4.html` + `game.js`.
  New world code → **`src/15_underburrow.js`** (loads after `14_world2.js`).
- **CRITICAL — file edits:** the Edit/Write tools corrupt files in this Dropbox folder (NUL bytes /
  truncation). Make ALL source edits with **python heredocs in bash**, each with an assertion that the
  anchor occurs exactly once, e.g.:
  ```python
  import io; p='src/09_systems.js'; s=io.open(p,encoding='utf-8').read()
  old="...unique anchor..."; new="...replacement..."
  assert s.count(old)==1; io.open(p,'w',encoding='utf-8').write(s.replace(old,new))
  ```
  Writing a brand-NEW file via a quoted bash heredoc (`cat > src/15_underburrow.js << 'EOF'`) is fine.
  After every change: `node --check src/<file>.js`.
- **Build:** `python3 build.py`  (run from `noahs-quest-v4/`).
- **Tests** (Node + the `canvas` pkg already at `/tmp/node_modules`):
  `NODE_PATH=/tmp/node_modules node test/<name>.js` — suites: `validate, smoke, playthrough,
  features, features2`. All must stay green.
- **Screenshots:** copy the pattern in `test/shot_w2.js` (`H.startPlay()`, `Game.loadMap(...)`,
  position `Player`, `H.render()`, save PNG to `shots/`). Read the PNG back to eyeball it.
- VM/bash path map: `noahs-quest-v4/` ⇒ `/sessions/<sess>/mnt/CaptureMimim/noahs-quest-v4/`.

## §1 Architecture you will REUSE (don't reinvent)
- **Maps:** `newMap(id,w,h,base,opts)`, `R/T/OBJ/SIGN/CHEST/DOOR/LINK/SPAWN` helpers in `06_maps.js`.
  `m.start={x,y}`. `opts`: `name,song,cliff,zone,dark,dungeon,underwater`. Maps built inside
  `buildMaps()` (ends ~line 789, which already calls `buildWorld2()`).
- **Tiles:** `TILEDEFS` (flags: solid/hole/rift/swim/slick/stair/door/gate/crack/anim/prop) + a
  `case` in `paintTileBase()` for art — both in `05_tiles.js`. Tiles are PROCEDURAL (no PNG needed);
  copy the `crack` tile as a template for new ones.
- **Companion (Ramsi):** `Game.companion`, `Game.companionActive()`, `Game.updateCompanion(dt)`,
  `Game.drawCompanion(c)` in `14_world2.js`. Update is called from `12_main.js` update; draw is
  added to the render row list. Auto-assist (headbutt/charge/guard) lives in `updateCompanion`.
- **Bosses:** `Bosses.spawn/wake/update/draw/finalize/catchBoss` in `10_bosses.js`. Sky bosses route
  through `b.sky` + `SKY_BOSS` config; their AI/draw/finalize (`up_skyboss/drawSkyBoss/finalizeSky`)
  live in `14_world2.js`. Boss objects: `OBJ(m,{type:'boss',x,y,boss:'name'})`; `loadMap` spawns
  `if (o.type==='boss' && !flags[o.boss])`.
- **Cutscenes:** `Game.startCutscene(beats,onDone)` + `updateCutscene/drawCutscene` in `14_world2.js`.
  A beat = `{title,text,draw(c,t)}`. State `'cutscene'`; advances on space/click. REUSE for the
  World-3 intro and the Pillow-Kin reunion ending.
- **EXT art override:** any `assets/<kind>.<who>[.frame].png` auto-installs over a sprite at load
  (`installExtSprite` in `04_sprites.js`). Bosses go through `EXT_BOSS_KEYS`; we added a `scene.<name>`
  channel (→ `Sprites.scenes`). `import_art.py` slices `sheet.*.png` using `SHEETS` + `ASSET_SIZES`.
- **Doors/gates:** `DOOR(m,x,y,'flag','myFlag',msg)` → a `doorF` tile, OPEN when `flags.myFlag` (or
  `switchFlags` for `sw_` flags). Auto-persists. This is the cleanest way to gate progress on a
  Ramsi action (set the flag, the door opens).
- **Save:** `flags` is the save blob; `loadGame` only sanitizes dungeon/underwater maps. Burrow maps
  should be `dungeon:false` (so resume works) but can use `dark:true`.

## §2 New file + hook
1. Create `src/15_underburrow.js` defining: `GNASH` config, `Bosses.up_gnash/drawGnash/finalizeGnash`,
   the new Ramsi-ability logic (a `Game.ramsiCommand()` + extensions to `updateCompanion`),
   `buildUnderburrow()` (the four big maps + sub-rooms + `vault1-4` gauntlet rooms + Gnash throne),
   and `Game.UNDERBURROW_INTRO`/`PILLOWKIN_ENDING` cutscene beat arrays.
2. At the end of `buildMaps()` in `06_maps.js`, beside the existing buildWorld2 call, add:
   `if (typeof buildUnderburrow==='function') buildUnderburrow();`  (function-hoisted; runs after all files load).

## §3 Flags (add to the `flags` init in `09_systems.js`, ~line 5–10)
Add: `ramGlow:false, ramShrink:false, ramBounce:false, ramGlide:false, ramDecoy:false, ramRoll:false,
ramPound:false, underburrow:false, pillowkin:0,` plus the Warden kill-flags `mottle, thornback, geode,
grub` (set on their home-level defeat) and the **gauntlet** re-fight flags `g_mottle:false,
g_thornback:false, g_geode:false, g_grub:false, gnash:false,` and any per-level switch flags you place
(or just use ad-hoc `flags.b5_gate1=true` style — they don't need pre-init to read as falsy).

## §4 Tiles (in `05_tiles.js` — copy the `crack` pattern)
Add to `TILEDEFS` and a `paintTileBase` case for each (all procedural):
- `soil` `{}` (walkable burrow floor) ; `rootwall` `{solid:true}` ; `glowvein` `{}` (faint unless Glow) ;
  `crystal` `{solid:true}` ; `softblock` `{solid:true, soft:true}` (Roll-Charge breaks it — like crack
  but for Ramsi) ; `holegap` `{solid:true, hole2:true}` (Noah can't pass; shrunk-Ramsi can — but you
  don't actually move Ramsi through tiles; see §6 Shrink: it's puzzle-flag based, the tile is just visual
  + a Noah-blocker) ; `bouncecap` `{}` (marks a bounce-pad spot) ; `updraft` `{}` (glide lane marker).
- Reuse existing `water/chasm/crack/wall/floor` as needed. Burrow zone = `zone:'burrow'`.

## §5 Companion zone + the Ramsi command key + abilities (the core work)
**(a) Generalize companion activation** — in `14_world2.js`:
```js
Game.companionActive = function () {
  return !!(this.flags.ramsi && this.map && (this.map.zone === 'sky' || this.map.zone === 'burrow'));
};
```
**(b) Add the command key.** In `12_main.js` play-state input (where Escape/tool keys are handled),
add: `if (presses.includes('c')) Game.ramsiCommand();`  (confirm `normKey` in `00_boot.js` lowercases
letters so 'c' arrives; it does for the existing tool letters). Also make a click on Ramsi call it
(optional, via `UI.handleClick`).

**(c) `Game.ramsiCommand()`** (in `15_underburrow.js`) — context dispatch by nearest interactable to the
companion/Noah, gated on the matching flag:
```js
Game.ramsiCommand = function () {
  if (!this.companionActive || !this.companionActive()) return;
  const comp = this.companion, m = this.map;
  // 1) SHRINK into a ramhole -> set its gate flag (only if ramShrink)
  if (this.flags.ramShrink) for (const o of m.objects)
    if (o.type==='ramhole' && !this.lookupFlag(o.flag) && dist(comp.x,comp.y,o.x*TILE+8,o.y*TILE+8)<28) {
      comp.shrinkT=1.2; this.flags[o.flag]=true; Audio2.jingle('door');
      Game.banner(o.msg||'RAMSI shrinks through the hole and flips the switch!'); saveGame(); return; }
  // 2) GLIDE at a glidevent (ramGlide): scripted carry to o.tx,o.ty
  if (this.flags.ramGlide) for (const o of m.objects)
    if (o.type==='glidevent' && dist(Player.x,Player.y,o.x*TILE+8,o.y*TILE+8)<20) {
      Game.startGlide(o); return; }                 // implement: lerp Player to (o.tx,o.ty) over ~1s
  // 3) BATTLE: boss present -> Decoy or Pound; else Roll-Charge / Pound near enemies
  ... (Decoy: set comp.decoyT, enemies/boss retarget comp; Pound: stun all within R; Roll: dash) ...
};
```
**(d) Passive abilities** belong in `updateCompanion`:
- **Glow:** if `flags.ramGlow` and `map.dark`, set a `Game.glowR` used by the dark vignette (see §8).
- **Pillow-Bounce:** detect Noah standing on a `bouncecap` with Ramsi present; when he presses X,
  give him a bigger hop (set `Player.airborne`, longer `airT`, and allow clearing one extra elevation
  / a wider gap). Simplest: a `bouncepad` OBJECT with a `to:[x,y]` landing; on X while overlapping,
  lerp/arc Noah to the landing tile.
- **Decoy/Pound/Roll timers** tick down here; while `comp.decoyT>0`, enemy/boss targeting prefers comp.
**(e) `drawCompanion`** — branch on `comp.shrinkT>0` (draw small), `comp.glide` (draw inflated),
`flags.ramGlow` (draw a soft light halo), `comp.rollT>0` (spin).

> Keep each ability SMALL and add it behind its flag so half-built abilities never block the game.

## §6 The 4 Burrow Wardens + the finale gauntlet (FRESH flags)
The four NEW Wardens are the world's bosses (one per level) AND the finale gauntlet. Build them ONCE
and spawn them in two contexts (their home level, and re-summoned in the vault rooms).
- **Define a `BURROW_BOSS` table** (mirror `SKY_BOSS` in `14_world2.js`), keys `mottle, thornback,
  geode, grub`, each: `title, sprite, armor, tool` (Noah's finishing tool) and `ability` (the Ramsi
  power that opens the vulnerable window: `ramShrink`/`ramDecoy`+`ramBounce`/`ramGlide`+`ramRoll`/
  `ramPound`) plus a `wake` line. Add a co-op AI: model `up_warden(b,dt)` on `up_skyboss` — roam, and
  when the Warden's `ability` condition is met (e.g. Ramsi pounded/decoyed, or Noah glided behind it)
  open a vulnerable window during which Noah's `tool` lands hits. Route it like the sky bosses:
  `else if (b.warden) this.up_warden(b,dt)`, `drawWarden`, `finalizeWarden`. Set `b.warden=true` in
  `Bosses.spawn` when `BURROW_BOSS[name]` exists (mirror the SKY_BOSS branch).
- **Home-level bosses:** `OBJ(m,{type:'boss',x,y,boss:'mottle'})` in `burrow5`, etc. `finalizeWarden`
  sets `F[b.name]=true`, gives loot, opens the level's exit.
- **Gauntlet rooms** `vault1..vault4` in `buildUnderburrow()` (Underburrow look — `zone:'burrow'`, soil/root
  tiles). Each: one Warden + a `portal` to the next gated on its **gauntlet flag**.
- **Re-summon without colliding with the home kill:** tag the gauntlet object
  `OBJ(m,{type:'boss',x,y,boss:'mottle',gauntlet:true})`. In `loadMap`'s boss-spawn line, spawn when
  `o.gauntlet ? !flags['g_'+o.boss] : !flags[o.boss]`. Thread `gauntlet` through
  `Bosses.spawn(name,tx,ty,opts)` → `b.gauntlet=true`; in `finalizeWarden`, if `b.gauntlet` set
  `F['g_'+b.name]=true` (open next vault portal) else `F[b.name]=true`. So a Warden beaten in its home
  level still re-appears in the gauntlet.
- Portals between vaults: reuse `portal` with `req:'g_mottle'` etc. Final vault → Gnash's throne map.

## §7 Final boss GNASH (new, in `15_underburrow.js`)
- Config + AI like a Warden/sky boss but NOT `b.sky`/`b.warden`. Route it: in `Bosses.update` add `else if (b.gnash)
  this.up_gnash(b,dt)`, in `draw` `else if (b.gnash) this.drawGnash(c,b)`, in `finalize`
  `else if (b.gnash) this.finalizeGnash(b)`. Spawn via `OBJ(m,{type:'boss',x,y,boss:'gnash'})` and in
  `Bosses.spawn` set `b.gnash=true` when `name==='gnash'` (mirror the SKY_BOSS branch).
- Co-op AI (3 phases, 3 hits each): burrow/surface (Ground-Pound to stun → Noah hits) → boulder throw
  (Roll-Charge / Decoy) → minion summon (Decoy + Pound). `catchBoss(b)`→`finalizeGnash`: set
  `F.gnash=true`, free the Pillow-Kin, `Game.startCutscene(Game.PILLOWKIN_ENDING, ()=>credits)`.

## §8 No-fly + Glow (small engine hooks)
- **No-fly:** in `08_player.js` where flight/flap is initiated (search `this.flight` / the wings flap),
  gate it: `if (Game.map.noFly) { /* no flap */ }`. Set `m.noFly=true` on all burrow + vault maps.
  (Validate must then NOT assume wings on those maps — see §9.)
- **Glow:** the dark vignette is drawn in `12_main.js` (~line 489, `if (map.dark){...}` — a light mask
  around Noah). Widen/brighten it when `Game.flags.ramGlow && Game.companionActive()`: e.g. add a
  second light circle at the companion and increase Noah's radius. Reveal `glowvein` paths only when lit.

## §9 Validate + tests (keep all green)
- `test/validate.js` BFS assumes FULL gear (incl. wings) and checks every object reachable by Noah.
  For burrow maps you must teach it the new rules:
  - In `pass()`: `softblock`→ passable with fullGear (Roll-Charge); `holegap`→ treat as solid for Noah
    (NOT passable); new walkable tiles (`soil/glowvein/bouncecap/updraft`) → passable.
  - **No-fly:** for `m.noFly` maps, `rift`/wide gaps are crossed by GLIDE, not wings — so either (a)
    mark glide-crossings with `glidevent` objects and special-case them, or (b) simplest: make every
    NOAH-REQUIRED target reachable by Noah's own footing within the map, and place glide/bounce purely
    for secrets/shortcuts. Recommended: design so the critical path never needs validate to model a
    companion move.
  - **Companion-only targets** (a `ramhole`'s far switch, a Kin behind a hole): mark them
    `{type:'ramhole', compOnly:true,...}` and SKIP `compOnly` objects in validate's reachability loop.
- Add `test/playthrough` coverage (or a new `test/underburrow.js`): grant Noah all gear + `flags.ramsi` +
  all `ram*` ability flags, then for each burrow level: load it, walk to each Pillow-Kin & free it
  (assert the ability flag flips), beat the Warden (reuse the co-op driver from the Skyward-Ascent
  playthrough — position Noah, force the shield/▶ window, apply tool), then run the gauntlet
  (assert the `g_*` gauntlet flags get set, distinct from the home-level Warden kill-flags), beat Gnash, assert the ending cutscene → credits.
- `smoke.js` auto-iterates all maps with chaotic input — new maps are covered automatically; just
  re-run it (zero errors required).

## §10 World-3 entry / unlock
- Proposed: after the parents are freed (`flags.parents`), reveal a **burrow entrance**. Cleanest:
  add a `LINK`/`portal` in an existing hub (e.g., Greenwood Vale or the sky4 finale room) gated on
  `flags.parents`, leading to `burrow5` (Level 5 start). Optionally add an `'underburrow'` node to
  `WORLD_NODES` (the world-map select) unlocked by `flags.parents`, mirroring how zones unlock.
- Set `flags.underburrow=true` on first entry; play an intro cutscene (`Game.startCutscene(
  Game.UNDERBURROW_INTRO, ...)`) showing Gnash dragging the Pillow-Kin down.

## §11 Cutscenes (reuse)
- Intro beats (Gnash steals the Pillow-Kin) and ending beats (family reunion) use the existing
  `Game.startCutscene`. For the ending splash, compose a "Noah + Ramsi + Pillow-Kin" PNG the same way
  `cutscene_family.png` was made (PIL: crop raw sheet cells, key out white bg, keep-largest component,
  arrange, save `assets/scene.kinreunion.png`; install via a `scene.kinreunion` EXT key; draw in a beat).

## §12 Art pipeline (when art is ready)
- Add a `SHEETS['underburrow']` entry to `import_art.py` (cols/rows + the `boss.*` / new keys) AND the
  matching `ASSET_SIZES` design sizes (copy how `skyworld` was added). The Wardens + Gnash go through the
  `boss.*` channel → add their keys to `EXT_BOSS_KEYS` in `04_sprites.js` and null-init the slots
  (like `S.gustwing=...=null`). Pillow-Kin can be `npc.*` or `creature.*`. Run `python3 import_art.py`
  then `python3 build.py`. Until art exists, everything must render with procedural/stand-in visuals.

## §13 Suggested BUILD ORDER (waves — test after EACH)
1. **Foundations:** flags (§3), new tiles (§4), `zone:'burrow'`, generalize `companionActive` (§5a),
   add the `C` command key plumbing (§5b) as a no-op. Build + tests green.
2. **One tiny test map** `burrowtest` + **Shrink** + **Glow** end-to-end (ramhole→gate, dark+glow).
   Add validate handling. Green.
3. **Bounce + Glide + Roll + Decoy + Pound**, each behind its flag, each demoed on the test map. Green.
4. **No-fly** hook (§8) + validate no-fly handling (§9). Green.
5. **Level 5** full map + miniboss + Pillow-Kin #1 + secrets. Green + screenshot.
6. **Levels 6, 7** similarly (one wave each). Green + screenshots.
7. **Level 8** + its Warden + the **vault1–4 gauntlet** (re-fight the 4 Wardens, fresh flags §6). Green.
8. **GNASH** final boss (§7) + ending cutscene (§11). Green.
9. **Entry/unlock** (§10) + intro cutscene. Full `underburrow` playthrough test. Green.
10. **Art** (§12) when sheets arrive; SHEET 11 prompt into SHEET_PROMPTS.md.

## §14 Gotchas (learned building the Skyward Ascent)
- Symbols referenced across files resolve at call-time (function hoisting) — fine to call
  `buildUnderburrow()` from `06_maps.js` even though it's defined in `15_underburrow.js`.
- Export runtime handles onto `Game` (e.g., `Game.UNDERBURROW_INTRO = ...`), not only onto the test
  global `NQ`, or `12_main` can't see them. (The Skyward-Ascent build hit exactly this bug with `REUNION`.)
- `Bosses.spawn` sets `b.hx/b.hy/b.t/b.awake` — reuse for floaty bosses. `catchBoss`→ caughtAnim →
  `finalize` (route new bosses there).
- Keep the cutscene/credits/menu state machine happy: any new `Game.state` needs an update branch, a
  render branch, and (for click-advance) an entry in `UI.handleClick`.
- Embedded PNGs bloat `game.js`; downscale big cutscene art before putting it in `assets/`.
- Re-run the FULL suite (`validate, smoke, playthrough, features, features2`) before calling any wave done.
