# REVAMP PLAN — Sky Path + Underburrow (v10)

Scope agreed with Berkley: **full rebuild of sky1–4 and burrow5–8**, one bespoke system per
level, Claude drafts procedural art with flagged slots for painted replacements. Everything
else (W1, Cogwerk, W4, progression flags, creature rosters, kin grants) stays.

---

## 1. Diagnosis — why these 8 levels are boring

**Sky1–4:** each map is ONE 6-tile-tall walk-right band (`R(m,2,13,36,6,'skyfloor')`) with 1–2
obstacle tiles, a boss ON the band, and a copy-pasted secret alcove. All four bosses share a
single sine-orbit AI (`up_skyboss`) differing only in armor count and tool. No verticality,
no system, no timing, nothing moves.

**Burrow5–8:** open-west zones are palette-identical soil bowls with herds sprinkled in; the
sealed east corridors are 1D bands where signs literally number the steps ("1) SHRINK…
2) BONE…"). Gates are answer-key lookups, not puzzles. Wardens share one sine AI. `dark:true`
is only a vignette — Glow never actually matters.

**What the good levels (cog1/2/3) do differently — the formula:**
each has ONE bespoke system (flood-fill water, zoomed tower climb, traversal hierarchy),
escalated 3–4 times, examined by the boss, wrapped in animated machinery, with solvability
guaranteed by a test. That formula is what we replicate 8 times below.

## 2. Design rules (apply to every rebuilt level)

1. One bespoke system per level; introduce → twist → combine → exam (boss uses it too).
2. Sealed-chain guarantee stays (`_choke.js`), but chambers replace 1D bands — 2D rooms,
   verticality via `elev`, multiple visual routes, one *logical* way forward.
3. Show, don't sign: the gate's tile art telegraphs the verb; max ONE sign per gate, zero
   numbered step-lists.
4. Landmark shot: the level's goal (cage, throne, big machine) is visible early.
5. ≥2 secrets per level, each using the level's system a sneaky way.
6. Distinct identity per level: own palette accent, 2–3 new `TILEDEFS`+`paintTileBase` tiles,
   one always-animated background element.
7. Density: an interaction every ~6–8 tiles; no dead 10-tile walks.
8. Bosses: unique movement/AI per boss, telegraphed attacks, armor pips kept, level's system
   woven into the fight.
9. Preserve: all flags (`req:`, kin `gives:`, portals, `vault1` exit), creature spawns/rosters,
   NPCs (dialogue may be rewritten), save compatibility, auto-intro behavior.

Ability budget (hard constraint on designs):
- sky1–4: Noah tools (net/grab/harpoon/bone) + RAM SUIT lunge + swim; Ramsi headbutt,
  then +stun (s1), +guard (s2), +boost (s3). NO C-abilities yet.
- burrow5: tools only → grants Glow+Shrink at end.
- burrow6: +Glow, Shrink → grants Bounce+Decoy.
- burrow7: +Bounce, Decoy → grants Glide+Roll.
- burrow8: +Glide, Roll → grants Pound at the very end (one pound = the exit).

---

## 3. SKY PATH — shared system: WIND

**New system `windField`** (small module in 14_world2 or new 14b file): per-map gust emitters
define directional push lanes (visible streaming leaf/cloud particles). Wind pushes Noah,
creatures, and thrown tools (nets/bones curve downwind — instant depth for catching AND
combat). Some lanes pulse on timers (3s on / 2s off, telegraphed by a windsock prop).
Maps become 2–3 stacked terraces (use `elev` + rifts), not one band.

### sky1 — Cloudrise Landing (teach wind)
- Beats: land → RAM SUIT chest → first gust lane carries Noah over a rift → crack-vane wall
  (lunge it; the vane falls and REDIRECTS the lane to reach terrace 2) → windsock shows a
  pulsing lane, time the crossing → net lesson: condors drift downwind, throw upwind of them.
- Boss GUST WING rebuilt: swoop-diver that rides the lanes; block its favorite lane with the
  fallen vane → it stalls mid-swoop → headbutt window → net. 3 armor.
- Secrets: a lane that only pulses ON while the boss is alive (catch it early); crack ceiling
  above start (kept from current).
- Art slots: `props.windsock`, `props.vane` (procedural first); `scene.sky1bg` optional.

### sky2 — Gale Terraces (wind + time)
- **Level twist: puff-platforms** — cloud tiles solidify/fade on a shared 4-beat cycle
  (soft "fluff" chime each beat; fade telegraphed by shrinking outline). New tile `puffcloud`.
- Beats: puff-stair climb → ramswitch re-aims a gust lane to ferry a KEY-BALLOON across the
  map into a hoop (watch it fly — the map's landmark) → balloon pops on the gate spike,
  gate opens → grab-block on a puff platform (shove it BEFORE the fade so it drops a level
  and bridges below — signature moment) → boss.
- Boss PUFF LORD rebuilt: shell game — hides inside 3 drifting puff clouds; wrong cloud =
  harmless burst, right cloud = he bolts to a new trio; headbutt when exposed, then GRAB.
  3 armor, forgiving.
- Secrets: a 5th puff platform that only exists during the OFF phase of a lane; heartpiece
  behind a downwind net-throw target.
- Art slots: `props.keyballoon`; puffcloud tile is procedural.

### sky3 — Thunderhead Span (wind + danger)
- **Level twist: lightning.** Storm bolts strike on a visible 2s telegraph (ground ring),
  aimed at the nearest METAL tile (`stormplate`). Safe = wooden planks. Squall bands
  (strong pulsing lanes) shove Noah toward plates — route around them.
- Beats: plank path weaving between plates → swim the sky-pool while squalls push (aim
  upstream) → LIGHTNING ROD puzzle: harpoon a loose rod, plant it in a socket to draw the
  bolts, opening the plate corridor → Ramsi guard (from s2) explicitly taught as the
  "one free mistake" → boss.
- Boss SPARKHORN rebuilt: charges in straight lines (telegraphed), leaves crackling trail;
  plant rods to bait his charge into a rod → self-shock stun → headbutt+HARPOON. 4 armor.
- Secrets: a chest ON a stormplate (dare the timer); rod socket that also opens a side cache.
- Art slots: `props.lightningrod`; `stormplate`/`plank` tiles procedural.

### sky4 — Storm Citadel (exam, no new mechanic)
- Vertical citadel: 3 terraces + arena, `viewScale` if needed for the reveal; the parents'
  cage visible from the very first screen (landmark shot up top).
- Beats: gust lanes now HOSTILE (push toward edges) → puff-platform climb in wind →
  rod-and-plate lock guarding the arena gate → two crack gates kept → arena.
- Boss STORM-LORD rebuilt, 3 phases: (1) sine-ish drift + bolt telegraphs, (2) summons a
  rotating squall wall — use it to slingshot Ramsi headbutts, (3) desperate: puff floor
  fades in patches while bolts fall. BONE him down. 5 armor. Rescue + REUNION unchanged.
- Art slots: `scene.citadelbg` (Berkley hero piece — the one painted backdrop this world
  really wants), cage prop.

## 4. UNDERBURROW — one bespoke system per level

**Shared new system `lightMask`** (medium, in 05/12): real darkness for `dark` maps — black
overlay punched by light sources (Ramsi Glow radius, glowveins, crystals, sap pulses,
carts' lantern). Replaces the vignette; b6/b7/b8 use it at increasing darkness. This finally
makes ramGlow a real verb.

### burrow5 — Topsoil Tunnels (tools only) — system: **HERDWORK (creatures as keys)**
The catching loop becomes load-bearing: burrow critters DO JOBS when lured.
- New system: drop CLOVER (already an item) on marked spots → nearest herd critter trots
  over; MOLES dig open `softsoil` plugs, RAMS butt loose boulders, SHEEP flatten bramble
  patches. Simple job table keyed by species; big visible payoff animations.
- Open west rebuilt: three pastures at different `elev` around a central sinkhole landmark;
  each pasture's herd is the key to another pasture's blockage (mini logistics loop);
  daylight shafts + hanging roots animate.
- Sealed east chain (choke kept): harpoon moat → lure a MOLE through a fence gap to dig the
  next plug (creature + tool combo) → cracked seam lunge → block-switch bridge, but the
  switch is behind a bramble a SHEEP must mow. Wordless where possible.
- Warden MOTTLE rebuilt: whack-a-mole — dives, mounds telegraph where he pops, wrong mounds
  spray dirt; headbutt as he surfaces, then GRAB. Uses the dig system's mound art.
- Kin: MR. RAM grant unchanged; Glow demo = the last chamber goes dark for the shrink-hole
  exit (first taste of lightMask).
- Secrets: a mole you can lure OFF the critical path digs a coin room; sinkhole bottom
  reachable only by leading a ram to butt a boulder in.
- Art slots: mound/softsoil/bramble tiles procedural; `props.sinkroots`.

### burrow6 — Root Hollows (Glow, Shrink) — system: **SAPWORKS (organic floodPipes)**
- New system `sapFlow`: a visible root network (new `rootpipe` tiles) carries glowing amber
  sap; ROOTBULB switches (headbutt) reroute flow at junctions like organic pipe valves.
  Sap-filled roots = light sources + power: sap-gates open only when fed, sap pools rise/
  drain to change swimmable areas. Direct floodPipes descendant → same testability.
- Dark map, real lightMask: Ramsi is your lantern; glowveins and lit roots are the map's
  wayfinding. The landmark: a giant HEART-ROOT pulsing in the center — all roots visibly
  lead there.
- Open west: reroute sap to drain the west pool (revealing a herd hollow) OR feed the east
  gate — not both at once; a second junction later lets you do both (aha moment).
- Sealed chain: shrink-hole into a wall-vein to reach a bulb Noah can't (shrink now a
  routing verb, not a latch-opener) → harpoon across the sap-fall → feed the bridge-root
  sap so it GROWS across the pit (replaces the block-switch repeat).
- Warden THORNBACK rebuilt: charge lines that leave thorn trails (arena slowly fills);
  lure a charge into the sap channel → sticky stop → headbutt + NET. Decoy grant then
  demoed on the exit jellies.
- Kin: BEAST MIMI unchanged; Bounce demo = the ridge bounce (kept).
- Secrets: an unlit root that only glows when Ramsi stands on it, tracing to a buried
  chest; feed sap to a dead-end flower → it blooms a heartpiece.
- Art slots: `props.heartroot` (Berkley hero piece candidate), rootpipe/bulb tiles procedural.

### burrow7 — Crystal Deep (Bounce, Decoy) — system: **LIGHTBEAMS**
- New system `beams`: Ramsi's Glow CHARGES a crystal; charged crystals fire a beam to the
  next aligned crystal (chain); headbutt rotates a crystal 90°. Beams (a) light the dark,
  (b) harden `lightbridge` tiles over chasms while lit, (c) scare shadow-moths off things.
  Darkest map in the game — near-black beyond light sources.
- Open west: routing beams across the cavern to reach three herd shelves; STAR-PUPILS only
  visible/catchable inside beam light (their catch rule becomes systemic).
- Sealed chain: bounce to a crystal sill and rotate it → beam extends a light-bridge over
  the star-chasm (walk your own beam — signature image) → DECOY pulls shadow-moths off the
  last crystal so it holds charge → final two-crystal alignment opens the vault.
- Warden GEODE GOLEM rebuilt: invisible outside light; only vulnerable while standing in a
  beam — rotate arena crystals mid-fight to keep him lit, headbutt + HARPOON core. The
  fight IS the system exam.
- Kin: TOOTHLESS unchanged; Glide demo = the great star-chasm crossing (kept, but now you
  glide OVER your dimming beams — moths chase behind you).
- Secrets: a crystal aimable at a wall that casts a shadow-arrow to a buried chest; a
  beam-lit underwater capricorn grotto.
- Art slots: `scene.crystalbg` cavern backdrop (hero piece candidate), crystal/lightbridge
  tiles procedural.

### burrow8 — The Hoard Descent (Glide, Roll + everything) — system: **MINECARTS**
- New system `rails` (the marquee build): `rail` tiles form tracks; hop a cart at a dock and
  it rides the spline; JUNCTIONS switch by throwing the lever with a BONE mid-ride or
  pre-setting with harpoon; `softblock` barricades on-track need ROLL-charge sent ahead;
  gaps in track = the cart jumps if you hit a boost gear. Cart carries a lantern
  (lightMask). Crashing is soft: tip out, walk back to the dock.
- Map rebuilt as a 3-terrace DESCENT through Gnash's hoard (viewScale 0.8 candidate):
  coin-dune open zone up top (exotic herds kept), rail network weaving down through it,
  the throne gate at the bottom — visible from terrace 1 (landmark shot).
- Sealed chain = one long masterpiece ride with 5 gated junctions, one per prior verb:
  shrink (Ramsi rides ahead through a pinch to flip a lever), bone (lever mid-ride),
  bracers (pre-shove a block that re-angles a track piece), harpoon (yank a bridge rail
  into place from the dock), roll (barricade). Same choke guarantee, zero numbered signs.
- Warden TREMOR-GRUB rebuilt: tunnels under the coin dunes, mound wake telegraphs, erupts
  under Noah; near rails it derails carts (arena hazard). Headbutt when it surfaces + BONE.
- Kin: LUCKY grants POUND → the single exit beat: pound the cracked throne-floor seal and
  drop into `vault1` (grander exit than a portal tile; flag/portal wiring unchanged).
- Secrets: a hidden rail spur behind a soft-wall (roll it, ride to a treasure vault);
  a unicorn snoozing on a ledge only a cart-jump reaches.
- Art slots: `props.minecart` + `rail` tiles procedural first; `scene.hoardbg` (hero piece
  candidate); painted `grub` boss art auto-wins via the existing `Sprites[b.name]` override —
  same for all eight bosses, easy wins for Berkley later.

---

## 5. Engine work inventory (sized)

| System | For | Size | Notes |
|---|---|---|---|
| windField + pulsing lanes | sky1–4 | M | pushes player/creatures/projectiles; particles |
| puff-platform cycle tiles | sky2,4 | S | shared beat clock, fade telegraph |
| lightning telegraph + rods/plates | sky3,4 | S–M | strike scheduler, rod socket objects |
| lightMask (real darkness) | b6,b7,b8 (+b5 end) | M | replaces vignette; sources registry |
| herd job/lure system | b5 | M | clover target + species job table |
| sapFlow graph | b6 | M | floodPipes pattern reuse; junction bulbs |
| beams (charge/rotate/bridge) | b7 | M | segment cast; lightbridge tiles |
| rails + carts + junctions | b8 | L | spline ride, mid-ride verb hooks |
| 8 unique boss AIs | all | S ×8 | framework hooks exist (`up_*`, `skyHit`, pips) |

## 6. Build order (each phase: system → level → tests green → screenshots → Berkley review)

1. **burrow7 Crystal Deep** — lightMask + beams. Highest wow-per-effort; proves the formula.
2. **burrow8 Hoard Descent** — rails. The marquee; benefits from lightMask done.
3. **burrow6 Root Hollows** — sapFlow (floodPipes reuse) + lightMask already in hand.
4. **burrow5 Topsoil Tunnels** — herd jobs; lightest engine lift, big identity change.
5. **sky1→4** — windField once, then four levels quickly; all four boss AIs here.
6. **Polish pass** — palettes/tiles audit, secrets count, density check, dialogue rewrite,
   PROGRESS.md entry.

Per-phase verification (non-negotiable, per house style):
- edit via python heredocs → `node --check` → `build.py` → suite.
- Keep all 17 regression suites green; extend `_choke.js` to every new sealed chain.
- New tests: `_wind`, `_beams`, `_rails`, `_sap`, `_lure` (simulation asserts, pipeworks-style
  solvability: graph-walk each gate chain start→boss), plus `_b7shot`-style screenshot tests
  for every level — and actually LOOK at the screenshots before calling a phase done.
- Playthrough test extended to cross all 8 rebuilt levels end-to-end.

## 7. Untouched / protected

W1 (vale, coast, grottos, keeps, canyon, spire, roost, deep, wastes, void), icefield,
grannyzoo, vault gauntlet, gnash_throne, all of W3/W4, the world maps, save format, kin/flag
progression, creature definitions, capture rules, REUNION cutscene. If a rebuilt level needs
to touch shared code (tiles, bosses, companion), the regression suites arbitrate.

---
*Next step: say the word and I start Phase 1 (Crystal Deep). Each phase lands as one
reviewable chunk with screenshots.*
