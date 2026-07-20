# PROGRESS LOG — Buff Noah's Quest v4 "Storybook Edition"

## v10.44 — one surface mermaid + the AQUARIUM art drop (2026-07-06)
- SURFACE GREETER: the Tinker Annex dive-pool shows ONE mermaid (on-land sheet.mythics
  art, capped at 1) whenever you own any; the rest swim below. In the aquarium your
  mermaids now render with the UNDERWATER art (mermaidsea) via a log-display override
  ([flag, cap, showAs]).
- ART DELIVERED + WIRED: sheet.aquarium (mermaidsea/seahorse/angelfish/pufferfish/starfish,
  3x2), sheet.aqobjects (sunkenship w/ RAM-HEAD mast, divingbell, anchor, porthole, 2x2),
  and scene.aquariumbg (painted parallax backdrop, smooth-resized to 480x190). Registered
  in import_art.py SHEETS + ASSET_SIZES and imported. Ramsi now rides the REAL diving bell
  (drawn INSIDE the glass). The parallax layer uses the painted backdrop at 0.35 alpha.
- Tests: _combiner + _aquarium updated (1 greeter mermaid up top; player mermaids appear
  as mermaidsea in the tank). Full suite green; validate 595/45; audit 0/0. Build ~10.4MB.
  Shots VIEWED: aquarium_art (real ship+bell+bg).

## v10.43 — flying-Ramsi warp gag, REAL photo album, aquarium depth (2026-07-06)
- FLYING WARP GAG: the first Starfall Wastes warp Ramsi witnesses fires a Mimi Moment —
  "Noah, where did you GO!! Wait for meeeeee!" — and on dismiss she LAUNCHES into a
  spinning arc through the air and lands beside him (comp.flyTo in updateCompanion +
  spin in drawCompanion; once-only via F.mimi_warpgag). Moment #21, album-worthy.
- REAL CAPTURED PHOTOS: every Mimi Moment now snapshots the actual scene (world view,
  NO dialog box, NO HUD) into a ~10KB JPEG dataURL (Game.capturePhoto, fired in the draw
  right before the dialog overlay) stored in flags.mimiphotos and SAVED. The album shows
  the real photos; CLICK a page (or SPACE) to ZOOM — full photo with the caption UNDER it
  (so the box never covers the scene), arrows/click to flip, ESC back. Grey pages still
  show the location + hint.
- AQUARIUM DEPTH: the tank grew to a long 72x26 gallery; a PARALLAX backdrop drifts at
  0.4x (far silhouettes + god-rays + motes; uses scene.aquariumbg if delivered); a SUNKEN
  SHIP with a RAM-HEAD mast landmark; scattered diving bells / anchor / porthole. RAMSI
  now rides a DIVING BELL underwater (companionActive enabled underwater; drawCompanion
  bell branch; C underwater just bobs — no rolling in a jar). Placeholder art + SHEET 17
  (aqobjects) + SCENE 14 (aquariumbg) prompts.
- Tests: _moments (21 count, real-JPEG capture assert, full warp-gag flight, once-only);
  _aquarium updated for the long map; regression across 38 suites green; validate 595/45;
  audit 0/0. Shots VIEWED: captured_photo (a real clean scene), album_real_grid/zoom,
  ramsi_flight, aquarium_deep (rays + ship + bell).

## v10.42 — real Super-Mimi face, a bigger diverse Crossing, THE AQUARIUM (2026-07-06)
- SUPER MIMI FACE: the dialog portrait for RAMSI (and SUPER RAMSI) now fills the box from
  his REAL sprite art (Sprites.props.sramsi1, the golden-maned sheet frame), cover-fit +
  clipped to the head — was a tiny cramped pixPortrait of the disliked boss art.
- CLIFFSIDE CROSSING v4: widened 72->88, now FIVE lands / FOUR channels, each summit a
  DIFFERENT climb (World-1 valid, NO Ramsi abilities): Lesson Mount (slick 2-step, gloves),
  Ladder Spire (stairs, NO gloves), Stair-&-Slick Tower (stairs then a slick lip -> e4),
  The Sheer Face (tallest, all-slick e1->e4). Playtested end-to-end via real climbing +
  wire rides. ZIP CLIP FIXED: the wire now draws in the LOWER pole's row (draws:lowFirst)
  so its downhill end paints over intervening tiles instead of behind them.
- CAPRICORN is a new COMBINER recipe (ram x2 + shark = half-ram/half-fish, gate sc_cog1).
- COMBI'S AQUARIUM (29_aquarium.js): a buoy in the Workshop dive-pool (mermaids/capricorns
  LEFT the lagoon) drops into an underwater tank where your crafted mermaids & capricorns
  swim with an always-on reef exhibit (new creatures: Deep Mermaid, Seahorse, Angelfish,
  Pufferfish, Starfish — placeholder art + SHEET 16 prompt). PET them (SPACE). Aquarium
  buoys are suit-FREE (o.free). A second bubble surfaces at the Vale's long-unused SOUTH
  LAKE, which finally gets a purpose: a matching buoy dives back — pond & lake connected.
- Tests: new _aquarium (map, capricorn recipe, lagoon emptied, dive both ways, exhibit +
  collection, pet, containment, Vale-lake round-trip). _combiner recipe-id-based selections
  (+capricorn), lagoon assert flipped. _crags + playthrough rewritten for the v4 geometry.
  Full 37-suite regression green; validate 588/45 maps; audit 0/0. Shots VIEWED:
  super_face_fix, crags_v4_spire/mid, aquarium.

## v10.41 — RAMSI IS A BOY (pronoun pass) (2026-07-06)
- Berkley: Ramsi (aka Mimi) is MALE. Swept all player-facing text + comments for she/her/
  herself referring to Ramsi and changed them to he/him/himself: the vale vision sign,
  the roost/portal signs, Super-Ramsi laser hints (2 spots), the burrow-ability banner,
  the Sahor-stole-Ramsi banner + the caught-Sahor "his ROOST" line, the World-2 learn
  banners (CHARGE/GUARD), the headbutt/decoy/taunt hints (world2 + underburrow + crystal
  deep), the reunion + burrow-intro cutscenes, and the transformation cutscene (title
  "SHE CHANGES" -> "HE CHANGES", "his star-bright eyes"). Comments in 12/14/16d/16e/22c/
  27/28 fixed too.
- LEFT female (correctly): MIMI SAHOR (the trickster boss), GASKETTA (road boss), plus
  Granny / the Lady / Ms. Plume / Megan. "Mimi" as the creature-family name is untouched.
- Full suite green; build delivered byte-identical.

## v10.40 — MIMI MOMENTS, the ALBUM, kid-paced text, the 4th-star cutscene (2026-07-06)
- READING PASS: dialog text 11->12px, cutscene text 9->11px with word-wrap; cutscenes AND
  dialogs now advance on SPACE *or* a mouse click (UI.handleClick routes to
  advanceCutscene/advanceDialog); prompts read 'SPACE / click >'. Beats already waited for
  input — clicks are the new part. Signs left long on purpose (grown-up-read-aloud, per the
  READING LEVEL doc).
- MIMI MOMENTS (28_mimimoments.js): 20 surprise scenes where Ramsi's face fills the dialog
  box (pixPortrait of Sprites.ramsi / ramsiSuper) and she hollers something short + silly
  specific to the spot — "WATER! BAAAAH! MIMI SO WET!" at the Pipeworks pond, meeting
  Granny, first Mermaid, Super-Mimi, etc. Mostly calm areas (Vale/Stables/Pipeworks/
  museum). Trigger rides updateCompanion; fires once each, never during a boss fight
  (Game.boss), a victory (winT), the colossus finale (map.colossus), or another
  dialog/menu/cutscene/zip. Flags in F.mimimoments.
- THE MIMI ALBUM: a book OBJ in the Pillow Den (SPACE opens it). 20 polaroids in a 5x4
  grid — earned pages show Ramsi + the scene icon + caption; grey '?' pages show the
  LOCATION title and a HINT of where to make that memory. Arrow keys / clicks navigate;
  album menu type routes through UI.drawMenu -> Game.drawAlbum.
- THE FOURTH STAR: GNASHARA's defeat now awards sc_cog4 via collectStarcell, which fires
  the star cutscene; at 4/4 the SUPER RAMSI transformation beats (22c) play right after —
  the previously-missing on-screen transform moment, and it lands the super_mimi photo.
- Tests: new _moments suite (20 registered, face-in-box, click-to-page, once-only, the
  water gag, the 4th-star->cutscene->photo chain, album open + hints). _colossus/_bosshint
  updated for the input-wait + no-interrupt rules. Full suite green; audit 0/0; 570
  targets/44 maps. Shots VIEWED: mimi_moment (Ramsi big, 'HORSES! So big! So fast!'),
  album_view (9/20, captions + hints).
- IDEAS.md written: replay-ability list, game-quality list (Web Speech read-aloud flagged
  as the cheapest huge kid-win; 3D video gently discouraged for a single-file gift), and a
  candidate World 5 'Sugarspun Sky-Isles' (5 levels, bounce/float spine) — each with
  time/cost/memory estimates.
- SESSION NOTE: /tmp got wiped mid-session (canvas module + /tmp/nqbuild gone) — reinstalled
  canvas, re-staged the fast-disk build dir. Standard recovery.

## v10.39 — RAMSI KEEPS HER HORNS TO HERSELF IN THE PENS (2026-07-05)
- Since Ramsi follows everywhere (v10.30), her CHARGE-STUN (ramStun, the sky-critter
  dazer) was knocking the Workshop's pen friends when she trotted through. One guard in
  updateCompanion: display creatures are skipped — pen family is never stunned; wild
  critters still get dazed (WIND suite confirms).
- _museum: Ramsi parked ON a pen friend for 30 frames -> stun stays 0. Suite green.
  (Mount recovered — full-size copies delivered + cmp-verified.)

## v10.38 — FULLSCREEN FILLS THE SCREEN (2026-07-05)
- Berkley: fullscreen left big margins (2560x1600 got a 1968x816 box). Cause: integer-only
  scaling floors 3.9x down to 3x. fit() now uses EXACT-fit fractional SCALE in fullscreen
  (the renderer applies SCALE via setTransform, so fractions render fine with nearest-
  neighbor) while windowed mode stays integer-crisp. His display now gets 2560x1061 —
  full width, slim top/bottom bars only (the game view is 2.41:1 vs his 16:10; no display
  setting can change that — only a taller game view could).
- BUILD-DELIVERY GOTCHA (session note): the Dropbox mount began stalling on multi-MB
  writes; build.py started timing out MID-WRITE, leaving a truncated game.js (crash at a
  base64 line = the tell). Recovery: stage src+assets to /tmp, build there (fast disk),
  verify tests against the /tmp build, then deliver both artifacts to the mount in 1MB
  APPEND CHUNKS with cmp -s verification (partial appends leave a valid prefix — resume
  from the byte offset). Both files byte-identical; smoke green on the mount copy.

## v10.37 — FULLSCREEN on F (2026-07-04)
- The canvas already integer-fits the window on resize (00_boot fit()), so fullscreen is
  just the browser request: F (any state, any screen — a keydown is a valid gesture)
  toggles document fullscreen; fullscreenchange re-runs fit(), which bumps SCALE to the
  biggest crisp integer for the display (DENSITY-4 art shines at 1:1). Mouse mapping was
  already rect-ratio based, so clicks stay true at any scale. ESC (browser) also exits.
- HUD teaches it: the help line now reads 'I:log ESC:map P:music F:full'.
- smoke/playthrough/_museum green (node harness untouched by the guards).

## v10.36 — THE PETTING PENS: walk in, pet, feed (2026-07-04)
- The Grand Workshop's pens opened up: gate gaps in the rare meadow + mythic field
  fences, and the lagoon grew a sandy BEACH SHELF (mermaids keep to the water rows;
  Noah pets from the shore). Signs invite the mingling.
- PET + FEED (24, Game.tryPetFriend via the interact chain): SPACE near ANY display
  friend (museum-wide, zoo included) = pets — heart burst, happy toast, the friend
  turns to nuzzle. Carrying a snack? The first pet per visit becomes a TREAT: consumes
  ONE bait (favorite first, then hay/clover/...), 'GOBBLES the clover! New best
  friend!'. Seconds are pets, not snacks.
- CONTAINMENT: the existing home-leash already steers wanderers back, gates or no gates
  — locked in by a 600-frame mingling test (every display friend stays within +-1.5
  tiles of its pen).
- CAP CONFIRMED: crafting multiples fills the pens up to THREE of each species
  (populate min(life, per:3) — craft 5 rainbow sheep, three roam the meadow).
- _museum grew the petting section (gates, walk-in, pet, one-treat rule, cap-3,
  containment). Suite green; shot VIEWED (Noah in the meadow with the crew, clover
  count down one, mermaids on the shelf line).

## v10.35 — CRYSTAL DEEP: the vault chain teaches itself; the Golem obeys walls (2026-07-04)
- Berkley couldn't open the LAST GATE (the Golem vault). Live-simulated the intended
  chain with real C-commands — it DOES work (spout -> warm heart turned SOUTH -> cold
  heart drinks it -> cold turned EAST -> beam crosses the trench, wall-rune fires,
  vault door opens). The mechanics were fine; the GUIDANCE was not: turning a dark
  COLD-HEART gave zero feedback, so the two-step order was easy to miss.
- Turn feedback is now state-aware (READING LEVEL): dark cold-heart -> 'FEED it a beam
  first (turn a LIT crystal into it)!'; dark normal crystal -> 'it is dark. Feed it
  light!'; lit -> 'its BEAM swings EAST/SOUTH/...' — every C-press teaches the chain.
- GEODE GOLEM ghosted through solids: its shadow-wander and lit-lumber moved with raw
  += and no collision. Movement now steps per-axis through a walkable check (solid/
  rift/hole/door/gate all block); when cornered in shadow it re-rolls its wander angle.
- _beams grew a LIVE PATH section (plays the vault chain with real commands on
  fresh-visit state, asserts the dark-cold toast, the feed, and b7_vault) + a 600-frame
  shadow-wander watch asserting the Golem never stands inside a wall. Note: crystal
  charged/woken state persists across loadMap — tests must reset for fresh-visit sims.
- Suite green; audit 0/0.

## v10.34 — POLES PLANTED: the OBJDRAW convention bite (2026-07-04)
- Berkley: wires WORK but anchors drew in the wrong place, and the ladder flickered.
  ROOT CAUSE: 12_main's OBJDRAW dispatch passes ox/oy as the tile's TOP-LEFT px and `e`
  ALREADY in pixels (level * EOFF). The zipanchor/laddervis drawers assumed center
  coords and multiplied by EOFF again — e3 poles rendered 588px (three-plus screens of
  rows) above their tiles: "floating off screen", and the ladder popped in/out as its
  far-away sprite crossed the row-clip window.
- Both drawers rewritten to the real conventions: pole feet planted at
  (tileBottom - elevPx); wire endpoints computed per-anchor the same way; the ladder now
  leans exactly along its tile's south face (lip -> raw ground, rung count from height).
  A convention NOTE now sits above the drawers.
- Shots VIEWED: poles_fixed (pole standing on the Tower crown beside Noah, wires
  pole-tip to pole-tip over the channels) + ladder_fixed (ladder flush on the knoll
  face). _crags/smoke/playthrough green.
- LESSON: before writing an OBJDRAW drawer, read the dispatch line (12_main ~449) — ox/oy
  are TOP-LEFT and e is PRE-MULTIPLIED pixels. Existing drawers are not a spec.

## v10.33 — CROSSING v3: the wires are THE way (2026-07-04)
- Berkley: pole tops still floated off-screen, and terraces could be walked down anyway.
  Geometry rebuilt around MANDATORY rides: three sea-water CHANNELS (3 wide, full height —
  unjumpable, unwadeable pre-suit) split the level into meadow | green band | sandy band |
  beach, and each summit's wire is the ONLY crossing: Lesson Mount over channel A, Ridge
  Tower (e3 crown) over channel B, Great Banyan (e3 canopy) over channel C.
- Wires shortened to 9-12 tiles so BOTH poles share the screen — no more phantom anchors.
- The ladder knoll gained a PRACTICE STUB wire (knoll -> meadow): gloveless kids climb the
  LADDER (no gloves needed), try the pole, and learn the slip lesson hands-on.
- PLAYTESTED end-to-end again: channel A resists a genuine jump attempt; mount climb ->
  ride channel A -> tower crown -> ride channel B -> banyan canopy -> ride channel C ->
  beach -> world map + coastPath. playthrough rides all three wires now too. Suite green;
  validate 568/44; audit 0/0 (W1 caps include the suit, so the auditor swims — the
  mandatory-wire property is enforced behaviorally by the playtest; post-coast suit
  swimmers get a legit replay shortcut, same class as the wings whitelist).
- Shots VIEWED: v3_mount (landing pole co-visible across the channel, Ramsi on the cap),
  v3_ride (mid-flight between Tower and Banyan over blue water).

## v10.32 — CROSSING POLISH: real summits, downhill wires, lunge-safe, Ramsi at height (2026-07-04)
- LUNGE HIJACK fixed: SPACE near a pole no longer steals a mitts-lunge (tryZip bails when
  lungeT>0 or grabbing; grab radius 20->13). Riders now hang in a proper AIR pose
  (airborne during the ride, cleared on landing) — no more standing-slide over walls.
- RAMSI AT ELEVATION: drawCompanion never applied the elevation offset, so she sank into
  terraces and southern cliff strips covered her. She now rides elev*EOFF like every
  other actor (shield/decoy rings too).
- WIRES SLIDE DOWNHILL ONLY — universal rule in tryZip (e_here must exceed e_there), the
  per-pole oneway config is gone. Gloves-slip teaching still fires first at any pole.
- LAUNCH SUMMITS (Berkley: tops felt off-map, and should demand multiple climbs):
  * THE LESSON MOUNT (meadow): 5x5 e1 ring + 3x3 e2 cap, every face slick — two climbs,
    then the first WHEEE back down to the meadow pole.
  * THE RIDGE KNOB: a third step (e3) atop the e2 ridge; its wire sails the gorge.
  * THE GREAT BANYAN: an e3 'canopy' summit with bush corners on the sandy band; its
    Seaward wire is the long ride to the beach. All poles well inside the map.
- PLAYTESTED as requested: _crags now runs the WHOLE level like a player — mount climb
  (peak e2), wire ride with air-pose check, both green bands, Knob (peak e3), gorge sail
  to the sands (e1), summit band + Banyan (peak e3), Seaward landing, exit -> world map
  + coastPath. The sim immediately caught one real scripting truth (you WALK OFF the far
  side of a summit if you keep holding right — peak-tracking asserts), and the whole run
  passes. Suite green; audit 0/0. Shots VIEWED: mount_summit (Ramsi beside Noah at
  height) + seaward_ride (air pose + sparkle trail over the sands).

## v10.31 — VALE REVERTED; THE CLIFFSIDE CROSSING is its own level (2026-07-04)
- Berkley: the in-Vale crags were "rife with glitches" — REVERTED. The Vale is bit-for-bit
  stock again (64 wide, causeway posts, Billy door, original exit link); the whole
  addValeCrags surgery + boot hooks are gone. Ramsi-everywhere stays (his words: spot on).
- THE CLIFFSIDE CROSSING (new 72x24 map in 27, replaces the surgery): the old Vale exit
  now OPENS it (12_main vale->coast handler loads crags instead of surfacing the map);
  its far exit runs the classic flow (world map + coastPath + Bramble ambush).
- Theme gradient west->east per Berkley: vale-green meadow (trees/flowers/bushes/goats)
  -> pebbled ridge -> a gorge with the first salt-water pool -> SAND terraces with
  palms/shells/crabs -> beach + open ocean along the east edge. Elevation is full-height
  BANDS (e0|e1|e2|e0|e1|e2|e0) so every ascending face is a slick 'ice' column — gloves
  ONLY by construction, no side doors for sandal-hops (audit-clean geometrically).
- All the climbing toys moved in: ladder-knoll pocket + 3 chests (heart piece on the
  sandy summit), the LESSON zip (bare hands slip), the gorge wire (or climb down and up),
  and THE SEAWARD WIRE — a grand one-way ride to the beach. Back-link to the Vale so
  gloveless kids can retreat and shop.
- Tests: _crags rewritten (stock-Vale asserts + gradient sample tiles + flow-through
  handler checks + zip/climb honesty + Ramsi everywhere); playthrough exit leg crosses
  the new level. Full suite green; validate 566/44 maps; audit 0/0. Shots VIEWED:
  crossing_west (pure Vale feel) + crossing_east (palms, crabs, ocean).
- LESSON: big overworld surgery invites glitch soup — new content belongs in NEW maps
  with a clean link, not carved into a shipped level.

## v10.30 — RAMSI EVERYWHERE + THE GREENWOOD CRAGS (2026-07-04)
- RAMSI FOLLOWS EVERYWHERE (27_valecrags): companionActive was zone-locked to
  sky/burrow/city while Player.hurt read the stale companion's shield — the infamous
  invisible "RAMSI shields you!". Now she (or SUPER RAMSI, via the existing 22c sprite
  swap) follows on EVERY map once rescued, waiting out only underwater swims. Tested
  across vale/coast/wastes/museum/stable/cog1 + the shield now fires where she visibly is.
- THE GREENWOOD CRAGS: the Vale widened 64->77 (+20%) and the east strip became a
  climbing park. Past King Billy's door (which now opens INTO the crags — the old
  door-tile exit link is gone, killing the harpoon bypass): two terraces (e1/e2) rimmed
  on EVERY exposed edge with SLICK ice-stone — gloves-ONLY, so springy sandal-jumps slip
  off too. The coast exit moved to the SUMMIT (75,20); the vale->coast link handler is
  position-independent, so the world-map surfacing + coastPath + Bramble ambush flow
  survives untouched. Ladder knoll (free taste of climbing + chest), ibex & goats graze
  the terraces (tin-can quest synergy), 2 chests + heart piece, kid-clear signs.
- ZIP-WIRES (new mechanic, 27): pole pairs with sagging cables; SPACE to ride at 150px/s
  with sparkle trail (bare hands SLIP off with a nudge + shop hint — Berkley's teaching
  gate); one-way wires refuse the bottom end. Three lines: the teach line (foot->terrace),
  the link line (t1<->t2), and THE SUMMIT WIRE — a long one-way ride home over the whole
  meadow. Engine: Game.tryZip via an interact wrap + Game.updateZip ticked after
  Player.update in 12_main; zipanchor/laddervis OBJDRAWs.
- Placement polish after VIEWING shots: summit anchor actually on the summit (74,13),
  landing clear of the cottage + ram-suit pocket (44,12), knoll away from the vision
  rift, and BOTH terraces' north rims iced after spotting a sandal-hop side door the
  auditor could not see (its caps grant gloves at W1).
- Audit: vale:61,33 re-whitelisted with an HONEST reason (late-game WINGS can glide in —
  same accepted shortcut class as wastes:53,12; Billy guards every walking route).
- Tests: new _crags suite (12 asserts: geometry, slick honesty via real bunny-hop
  movement, zip slip/ride/one-way, companion everywhere, shield-where-visible);
  playthrough's exit leg rewritten to CLIMB the crags. Full suite green (35 suites);
  validate 563/43; audit 0/0. Shots VIEWED: crags_final + crags_ride2.

## v10.29 — THE COMBINER MACHINE MADE WHOLE + prompt rules codified (2026-07-03)
- The machine's LEFT rainbow pod had bled across its museum-sheet grid cell (into
  COMBI's) and was amputated by the slicer — same failure as the barn. Whole museum
  sheet re-sliced by content clusters (8/8) with the tight keyer; the machine now shows
  BOTH fizzing pods, funnel, wheel, gauge and lever. VIEWED solo + in-game.
- Berkley's ask: codified "PROMPT RULES LEARNED" at the top of SHEET_PROMPTS.md —
  explicit cell containment (~10% padding, nothing crosses borders), explicit
  transparent-not-white background, glow art flagged for the gentle keyer, and
  cluster re-slicing as the repair of last resort.

## v10.28 — CERBERUS GROWS UP (2026-07-03)
- Cerberus drew at raw sprite size (27x15 logical) in his den — barely bigger than Noah.
  Now drawn at 1.75x (feet planted; zzz/dizzy bubbles raised to the new head height), and
  his interaction ranges grew with him: head-GRAB 30->44, zoomies contact 18->25,
  bone-bonk 28->42. Covers both his homes (icefield + Hound's Keep).
- Shot VIEWED (cerberus_big): a proper three-headed BOSS looms over Noah.
  features2/_icefield/smoke/playthrough/validate green.

## v10.27 — DEN & GALLERY POLISH: Ramsi-scale kin, statue presence, the mitts mystery (2026-07-03)
- PILLOW DEN: rescued kin now stand RAMSI-SIZED (same 26x30 fit + brown dais as the Ramsi
  displays) and their waiting pillow is RETIRED on rescue — pillows only mark friends not
  yet found (grey '???'). Berkley request.
- TROPHY SCALING: statues were fit width-first (22/lw, 26/lh), so wide-flat beasts —
  CERBERUS 27x15 — shrank into squat miniatures. Now height-first with a width cap
  (22/lh, 34/lw): every statue has equal PRESENCE; sprite logical sizes were verified
  correct, the box math was the bug.
- THE CIRCLED '???': the dark Gear Gallery pedestal was the GRABBER MITTS — the starter
  tool never sets an 'earned' flag, so its pedestal could never light. Mitts pedestal is
  now flag-less (always shining); pedestal drawer treats flag:null as owned.
- Shots VIEWED: den_ramsisize (kin at Ramsi scale, one waiting pillow), trophy_scaled
  (Cerberus imposing in gold). _museum green; audit unchanged.

## v10.26 — GENTLE PRISMA, REAL KIN IN THE DEN, THE HELMET TROPHY (2026-07-03)
- PRISMA-BEAST reworked: its soft white GLOW halo is glow-art (the superramsi rule) — the
  flood keyer had turned it into ragged fringe and mudded the face. New gentle pass:
  strict-white flood -> BFS distance-from-sky -> outer 9px band gets a de-white soft-alpha
  ramp (interior + body sparkles stay opaque) -> LANCZOS fit, NO snapping. The beast now
  wears a clean translucent aura; face, crest and freckles intact. VIEWED on wood + sky.
- PILLOW DEN: pillows now show the REAL kin PNGs (npc.kin1-4 from the Underburrow sheet)
  napping on cream plump cushions with bobbing + Z's; grey '???' cushions until rescued.
- MINTY MYSTERY solved: kin 0 exists ONLY in `burrowtest` (the ability test bed) — no real
  player can earn kin_0, which is why the first den slot sat blank. The phantom pillow is
  gone; the den now honors the four REAL Pillow-Kin (mus_kin alias unchanged, harmless).
- STORM COLOSSUS trophy: his pedestal now displays the actual HELMET piece
  (Sprites.props.colhelm) in TRUE storm-slate colors (trophy def gained prop/noGold;
  trophySprite checks boss-piece props after the trophy_ art slot) — instantly
  recognizable beside the gold statues.
- Suite green; audit 0/0. Shots VIEWED: prisma_rework/prisma_ingame, den_realkin
  (kin art + one grey '???'), helmet_trophy.

## v10.25 — THE GRAND WORKSHOP: room to roam, a mermaid lagoon, craft fanfares (2026-07-03)
- WORKSHOP rebuilt 24x14 -> 34x22 ("The Grand Workshop"): the RARE MEADOW and MYTHIC
  FIELD are now 12x7 pens (per-species cap 2 -> 3) so the crafted family properly roams;
  banner + velvet-rope decor, flowers, repositioned machine/COMBI/signs; both visible
  doors (museum west 0,15; street south 17,21) with all cross-map links retargeted
  (zoo punch -> 2,15; vale annex -> 17,20).
- THE LAGOON: a fenced saltwater pool (water floor + shell beach) just for MERMAIDS —
  their def became honest sea-folk (habitat water, sea: true; they are display-only so
  nothing else changes) and the pen populator drops them straight into the water, where
  they bob and swim like the zoo tank creatures. Tested: every displayed mermaid stands
  on a swim tile.
- CRAFT FANFARE: combining now fires the full ITEM-GET celebration (the harpoon
  treatment): dark iris, rotating gold beams, sparkle ring, and the NEW CREATURE pops in
  huge with its name + flavor line. itemIcon() learned 'creature:<species>'. The combine
  menu closes for the fanfare (same behavior as trades that award items).
- TEST NOTE: the item-get pop-in advances per RENDER, not per update tick — screenshot
  loops must call H.render() repeatedly (H.step alone leaves the icon at frame-0 size).
- _combiner: fanfare asserts (state itemget, creature iconKey resolves, holds until
  keypress) + lagoon swim-tile assert + sea-folk assert; _museum exit coords updated.
  Full suite green; validate 550/43; audit 0/0. Shots VIEWED: grand_workshop (pens +
  lagoon + machine) and craft_fanfare (giant rainbow sheep in the beams).

## v10.24 — WHITE-ON-WHITE KEYING FIXED + the cottage-annex walk (2026-07-03)
- WHY: griffin/mermaid/centaur (pure-WHITE-background cells) came out chewed — the
  standard keyer floods border-color +-16, which leaks through soft AI outlines into
  white FUR; and the barnfront crossed its grid cell, so half the barn vanished and a
  corner leaked into the denarch slot.
- FIX (targeted re-key, raws were fine — no new sheets needed):
  * tight_mask keyer: flood tolerance +-6, PLUS a white-family rule (only when the
    border itself is white-ish, any pixel with min(RGB)>=246 counts as sky) — kills the
    noisy-white speckle haze while enclosed whites (griffin's head, centaur's hair,
    glimmer-ram wool) stay safe behind their plum outlines; then a <300px blob sweep
    peels leftover dust (mermaid's bubbles are bigger and survive).
  * stableworks re-sliced by CONTENT clusters (connected components + 24px merge,
    row-major mapping), not by grid lines — 8 clean clusters, whole barn, real arch.
  * all 11 mythics + all 8 stableworks pieces re-rendered through render_snapped.
- VALE: a brick path now runs beneath both doors tying GRANNY'S GRAND MUSEUM to the
  TINKER ANNEX (side-yard tile + flowers) — one household, two doors.
- Shots VIEWED (contact sheets + in-game workshop/stable/vale): full white eagle head,
  whole mermaid + rock, waving centaur, complete barn over the hay yard, lion arch on
  the den. Suite green; audit 0/0.
- LESSON: pure-white-background sheets need the tight keyer + content-cluster slicing;
  if a piece looks chewed, fix the KEYER before asking for new art.

## v10.23 — MUSEUM GATES THAT FORGIVE, VISIBLE EXITS, DAY-ONE COMBINER (2026-07-03)
- WHY: Berkley's real save (bosses beaten, Cogwerk done) could not open the wings — the
  doors demanded ONE specific flag each ('gnash'/'billy'/'parents'), and saves can carry
  different evidence for the same milestone. Also: room exits were invisible wood tiles,
  and the Combiner deserved to be open from day one.
- FORGIVING GATES: doors now use mus_* aliases via a Game.lookupFlag wrap — mus_cog (gnash
  OR intro_cog1 OR cog_started/cleared OR any star-cell OR road_gearline), mus_boss (ANY
  of the 15 boss flags), mus_kin (parents OR ramsi OR any kin_0..4). Any legit evidence
  opens the wing. Tested: intro_cog1 alone opens the Cog Hall; mottle alone opens the
  Trophy Hall.
- DAY-ONE COMBINER: the Workshop wing + Tinker Annex street door lost their reqs, and ALL
  NINE recipes are visible + unlocked from the start — missing ingredients are the real
  gate (horses/lions/dragons naturally arrive late; PRISMA-BEAST still consumes crafted
  rares). Locked-row code retired from combineStock/combineSelected.
- VISIBLE EXITS: every wing's exit is now a real doorF DOOR set INTO the wall (coghall
  12,13 / gearhall 12,11 / pillowden 15,11 / trophyhall 17,15 / workshop west 0,7 +
  street 12,13) — kid-glanceable, matches the entrance language. Workshop sign updated.
- Tests reworked (_museum: alias evidence cases + exit-door sweep; _combiner: no tier
  locks, ingredients-only). Full suite green; validate 547/43; audit 0/0. exit_door shot
  VIEWED (door reads clearly in the wall; BILLY-only save shows exactly one gold statue).
- NOTE for the save in question: if a wing still refuses on that save, it predates ANY
  of its evidence flags being recorded — one boss re-fight (or T playtest) will open it.

## v10.22 — THE ART DROP: facades, mythics, stableworks, museum props, real portrait (2026-07-03)
- Berkley delivered 7 files (his revised prompt angle — "from above and front, zelda
  style" — recorded in SHEET_PROMPTS, and it does read far better in-game).
- IMPORTER: SHEETS mythics (4x3, single .a frames — the engine auto-builds hop frames),
  stableworks (4x2), museum (4x2); ~30 ASSET_SIZES entries; three facade singles.
  Targeted conversions only (import_art as a module), never a blind full main().
- SIZING LESSON: placeholder sprites now STEP ASIDE at build time when EXT_ART has the
  key (hasExt guards in 25/26) so installExtSprite's no-base path applies EXT_DENS and
  every sprite lands at its exact ASSET_SIZES logical size — verified by printing
  sprW/dens for all 30 (all exact). With a placeholder base, densFor's rounding would
  have distorted the odd-sized ones (e.g. 22px griffin -> 14.7).
- WIRED ART PREFERENCES (procedural fallbacks all kept): haybale/haystubble,
  combiner machine (+hot glow), trophy pedestals + trophystar fallback statue, gear
  pedestal glass domes, kin pillows = TINTED plump art (source-atop per kin color),
  COMBI + OTTO real NPCs, all 11 creatures from the mythics sheet.
- NEW DECOR: stable got its barn-house backdrop (facade slot), troughs, lanterns, den
  arch + royal crest; trophy hall got velvet ropes + banners; gear gallery a banner.
- PORTRAIT: dedicated portrait.noah.png -> noahFace (64% head crop) + noahFull (bust)
  at 256px JPEG on plum, checker-keyed with the house keyer. The HUD finally shows the
  real Buff Noah.
- All shots VIEWED (vale, coast, stable, workshop, trophy hall, pillow den): facades
  anchor on their footprints with live sprites in front; mythic pens are a parade.
  Full suite green; validate 541 targets/43 maps; audit 0/0. Build ~10.1MB.

## v10.21 — WORLD 3 TRAVEL: Noah walks the map; roads ambush him halfway (2026-07-03)
- WHY: Berkley — Cogwerk node travel should work like World 1: Noah visibly walks the
  painted overview map, and the side-scroll interludes interrupt at the midpoint of a leg
  (instead of the old instant select->road->teleport).
- MECHANISM (19b, mirrors 09's W1 recipe): `Game.world3Go` now builds a densified
  point-path (12 steps/leg) along a declared trail graph — `W3_CHAIN`
  cog1>cog2>cog3>cog4 plus `W3_SPURS` (stable hangs off cog1, peaceful) — and starts
  `Game.world3Travel`. `Game.updateWorld3Travel` moves 95px/s; at each leg's midpoint an
  unbeaten `COG_ROUTES` road (now keyed 'cog1-cog2' style, direction-agnostic) stashes
  the walk in `pendingCog3` and starts the interlude. 13_roads finish(): WIN restores the
  stashed walk (Noah resumes from the ambush spot and arrives); RETREAT cancels it (stay
  at the old stop, nothing skipped). Multi-leg trips can be ambushed once per route, W1-style.
- DRAW (11_ui): trail lines follow the chain+spur graph (kills the stray cog4->stable
  line the node-insert had created), and Noah WALKS the map with directional frames, dust
  puffs, and Ramsi bobbing alongside; input is locked while walking (hot-nodes + world3Go
  guard).
- Tests: _cogroads + _world3map rewritten for the walk (start, mid-leg ambush, win-resume
  into cog2, cleared-route walkthrough with sawSide=false, retreat cancels). Full suite
  green; audit 0/0; world3_walk shot VIEWED (mid-leg walker on the painted map).

## v10.20 — PIXEL FACADES: big building art overlays the plain exteriors (2026-07-03)
- WHY: Berkley — the cottage exterior is "plain and ugly"; he wants pixel building art
  drawn OVER the existing solid tiles (tiles keep governing walkability), not an
  entry-vignette painting; same treatment for the combiner's building.
- MECHANISM (24_museum): `Game.addMuseumFacades` runs after buildMaps (new boot hook in
  bootGame + NQ.buildAll, joining addBurrowEntrance & co) and plants OBJ
  `{type:'facade', x, y, w, key}` slots; `Game.OBJDRAW.facade` scales
  `Sprites.props.<key>` to the footprint width (+8px overhang each side) anchored at the
  building's BASE row — the row-sorted object pass gives correct occlusion (sheep/Noah
  walk in front, roof rises behind). Draws NOTHING until the art exists, so the world
  is pixel-identical until sheets land.
- SLOTS: prop.grannyhouse (vale cottage, 6-tile footprint, design 112x96),
  prop.workshopannex, prop.coasthouse (Sunsplash School, 10 tiles, 176x120).
- THE TINKER ANNEX: the combiner got its own street building in the vale beside the
  cottage — 4x4 wall footprint, facade slot (design 72x80), and a REAL door (req gnash)
  straight into the Workshop; the Workshop gained a matching street exit back to the
  meadow (the museum route via the zoo still works).
- SHEET_PROMPTS: SCENE 13a/13b replaced by "PIXEL FACADES" — three snapped singles with
  the pixel rules, exact design sizes, and CRITICAL door-position callouts (doorway art
  must sit on the real door tile: cottage 40% from left, annex 40%, school 55%);
  no-creatures rule kept (live sprites animate in front — scene.reunion lesson).
- TEST (_museum): facade slots on vale/coast, annex door gated + workshop street exit,
  no-art render unchanged, then TEST-ONLY placeholder facades injected → vale shot
  VIEWED: anchoring, overhang, and sheep-in-front layering confirmed.
- Audit: vale:40,8 joins BYPASS_OK (cross-map-link artifact, same as the museum wing
  doors). validate 529 targets/43 maps; audit 0/0; full suite green.

## v10.19 — GRANNY'S GRAND MUSEUM, THE ROYAL STABLEWORKS & THE CREATURE COMBINER (2026-07-03)
- WHY: Berkley wants showcase space + replay value: rooms for cog creatures, gear, pillow
  pets/Ramsi(s), and beaten bosses; a "combiner" for rare/mythic creature variants; a
  Cogwerk horse dungeon with a new trap food; lions for the griffin; everything gated by
  completion tiers; sheet prompts for the new art.
- GRANNY'S MUSEUM (24_museum): five wings punched into the menagerie walls, each a small
  map behind a gated door: COG HALL (req gnash; pest pen + horse/lion pen), GEAR GALLERY
  (open; 10 pedestals — owned gear glows, missing gear is a dark shape + '???'), PILLOW
  DEN (req parents; 5 kin pillows w/ sleepy blinks + Ramsi & SUPER RAMSI (super shows
  after colossus)), TROPHY HALL (req billy; 22 pedestals — every map boss, all 6 road
  bosses, GNASHARA, COLOSSUS — gold-tinted statues via goldize(), dark '???' silhouettes
  until earned; future art slots Sprites.props.trophy_<key> checked first), THE WORKSHOP
  (req gnash; the Combiner + rare/mythic display pens). Pens reuse the zoo's populator
  (fillPens chained onto Game.populateZoo).
- THE ROYAL STABLEWORKS (25_stableworks): new World-3 node (req sc_cog1) — a brass
  paddock dungeon. HORSES (cage-ONLY, bait 'hay' — the new food) + LIONS (bone-stun then
  net, aggressive) behind a bone-latch den w/ chest. HAY = sixth bait: barn bales give +2
  on walk-up and REGROW every visit (hook rides the companion-update wrapper chain — by
  the time the node unlocks Ramsi is always along). Bait menu label, HUD row (6 icons at
  27px pitch), F.baits.hay init + save-migration guard.
- THE COMBINER (26_combiner): COMBI the tinker-bot in the Workshop opens a new 'combine'
  menu (reuses the shop menu framework: title/portrait/confirm branches). NINE recipes in
  FIVE completion tiers: T1 RAINBOW SHEEP (6 sheep) & BAA-LIEN (alien+3 sheep); T2 (first
  star-cell) GLITTER GOAT (4 goat+2 ibex) & GLIMMER RAM (4 ram+2 snowhare); T3 (second
  star) PEGASUS (horse+2 condor) & CENTAUR (horse+2 ibex); T4 (gnashara) GRIFFIN
  (lion+2 condor — the condor plays the eagle) & MERMAID (shark+2 jellyfish+2 crab);
  T5 (colossus) PRISMA-BEAST — consumes a dragon, a unicorn AND three CRAFTED rares:
  the capstone demands whole extra catching trips. Locked rows show '??????' + a gate
  hint; kid framing throughout: friends "join hooves & TRANSFORM", nobody is lost.
  Crafting decrements log + life_ (zoo pens honestly shrink), grants the new species,
  refreshes workshop pens on the spot, confetti + banner.
- NEW SPECIES (11): horse, lion + 9 crafted — pixel-grid placeholder sprites w/ custom
  palettes installed via a buildAllSprites wrapper (sheet art in SHEET_PROMPTS 13 will
  override; installers skip when sheet art exists). def.sparkle twinkle hook added to
  drawCreature for the glittery ones.
- ART PROMPTS (SHEET_PROMPTS.md): SHEET 13 mythics (4x3), SHEET 14 stableworks props,
  SHEET 15 museum props, SCENES 13a/13b — Granny's grown cottage + the Sunsplash school
  (the ocean-level house), painted, scene.* path.
- FIXES en route: 'stone' is a CLIFF palette, not a tile id (crashed drawWorld) → cogfloor/
  floor; combi NPC dispatch mirrors marko's (no phantom this.talk); combine desc wraps to
  two lines + taller panel; done-marker renamed '(made!)' so it can't be read as the
  craftable star.
- AUDIT: museum wing doors flagged "bypassable" — per-map-start reach can't see cross-map
  LINK gating; whitelisted in BYPASS_OK with reason (display-only rooms). Audit 0/0 across
  43 maps; validate 521 targets/43 maps; suites now 34 (added _museum _stable _combiner).
  Shots VIEWED: museum_trophies / museum_workshop / museum_den / stable_dungeon /
  combiner_menu.
- LESSON: hooks that ride the companion-update chain silently no-op before Ramsi joins —
  fine for post-W2 content, but TEST with realistic progression flags, and say so in the
  test comment.

## v10.18 — COGWERK ROADS v2: big set-piece levels, a wing meter, three bespoke boss fights (2026-07-03)
- WHY: Berkley: the road bosses "don't move or fight and can't be hit" (they dispatched on
  hardcoded kinds), the interludes were "super short and boring", and infinite wing-flaps
  trivialized everything. Also fixed en route: Cogwerk city art drew oversized (external-only
  sprites fell back to dens 1/2 while files are stored at 4x -> `EXT_DENS = 4` guards in
  04_sprites installExtSprite for every kind).
- WING METER (13_roads): on roads, flying costs feathers — `ROAD_FLAPS = 5` per flight,
  refilled the moment you land; out of feathers, holding X GLIDES you down like a bird
  (fall capped 70). Feather pips live in the road HUD; wings spread wide + grey when spent.
  Roads with `wings: 1` (skyrail) LEND brass loaner wings if the dragon hasn't been caught,
  so the level never hard-blocks; loaner feathers draw brass.
- SET-PIECE TILES (13_roads, shared by all roads): `>` `<` conveyors (solid, carry you),
  `C` crushers (hang from above; slam/park/rise cycle), `V` steam vents (idle-hiss-BLAST,
  80px jets that cook lazy fliers), `Z` spark-bobs (patrol a vertical line). Cogwerk theme
  got its own brass wall palette, smoggy gear-and-chimney sky, and rail-styled `=` planks.
- LEVELS (19b) roughly DOUBLED: gearline 74->192 tiles (belt runs with + against, a 3-crusher
  corridor, vent hopscotch, 2 flags), steamway ->160 (vent rhythms over crate stacks, a
  spark-bob shaft over void, the belt-against-you PIPE-PRESS, arena with a real pipe
  CEILING), skyrail ->144 (10-tile flap-economy voids with forgiveness rails, bob-guarded
  lanes, 2 rest islands). join() now throws on ragged/mis-sized segments.
- BESPOKE BOSSES (SideScroll.BOSS_AI/BOSS_DRAW/BOSS_HINT/BOSS_INTRO registries in 13_roads,
  fights in 19b — the copy-paste archetype alias is gone):
  * PISTON PETE: armored head (stomps CLANG off harmlessly), strides + slams out floor-waves
    (jump them), every-2nd slam steams YOUR column (step aside), every 3rd slam his fist
    WEDGES -> stun window. Piston-fist pads raise/carry/bury with the phase.
  * GASKETTA: hangs upside-down from the arena's pipe ceiling (the ceiling is HERS — no
    stomping up there), pours 3-column telegraphed steam-rain (stand in a gap), lobs
    wrenches once warm; after 2 rains her gasket glows red and she OVERHEATS, crashing to
    the floor dizzy -> the bop window, then flies home.
  * THE RAIL KING (hp 4): surfs a drawn spark-cart, sparks bounce off the back, long
    cart-hops when you camp; brake-telegraph then MAGNET CROWN drags Noah toward the cart
    (run/flap away — feather pressure); every 2nd pull the crown overloads and the cart
    DERAILS -> stun window, crown rolls, then he remounts.
- READING LEVEL: roads got the pinned bottom boss bar (never fades, <=5 ALL-CAPS words,
  X=JUMP key-cap, gold edge when it's GO time) — per-state lines for all SIX road bosses
  (the W1 trio got default hints too). Toasts hop above the bar during fights.
- ENGINE FIX: groundYAt now skips a leading solid CEILING strip (it used to return the
  ceiling's roof as "ground", which would have put the whole Gasketta fight on top of the
  arena, off-screen — caught by a suspicious minY in the test, not by eyes).
- validate: road gap rule is wings-aware (`def.wings` roads allow flap-range voids).
  _cogroads rewritten: 30+ asserts — meter (5 flaps, denial, glide cap, landing refill,
  loaner), belts carry, hazard censuses, and full sims of all three fights (clang-off,
  stuck-fist bop, ceiling hang + rain + overheat bop, surf + sparks + magnet + derail bop).
  Full 31-suite regression green; audit 0/0. Shots: road_pete_stuck2 / road_gasketta2 /
  road_crushers / road_railking_magnet — all VIEWED.
- LESSONS: (1) test sims that re-pin the player each frame can sit 0.3px outside a hit
  window forever — pin INSIDE the box, not at its edge. (2) A "passing" fight test with a
  nonsense telemetry value (minY=-117) is a failing test — read the numbers, not just the
  green. (3) When a level gains a ceiling, every "scan from row 0" helper is suspect.

## v10.17 — a real Noah portrait + the reunion composes live (2026-07-03)
- The HUD/credits portrait is now cut from the RAW sheet.noah.png cell (full AI-art face
  detail, house checker-keyer, head crop on plum, LANCZOS to 256px JPEG) — the previous
  blown-up-sprite portrait looked awful; VIEW generated art before shipping it. An
  optional dedicated-portrait prompt was added to SHEET_PROMPTS.md (portrait.noah.png).
- The Berkley & Megan REUNION cutscene showed OLD composed art (scene.reunion.png,
  frozen at an earlier art generation) while the level showed the new sheet-imported
  parents. Fix: drawReunion's baked-scene branch retired (Dropbox forbids deleting the
  asset; scene=null in code) — the cutscene now composes LIVE from the current
  parentsFree/noah/ramsi sprites, so it can never drift from in-game art again.
- LESSON: baked composite scenes rot every art pass — compose cutscenes from live
  sprites wherever possible.

## v10.16 — big hitboxes, fierce critters, COGWERK ROADS, cartoon Noah (2026-07-02)
- BIG BOSSES = BIG TARGETS: per-boss hitR on every cfg — GNASH (the underworld megaboss)
  now lands hits across his whole 40px bulk; sky bosses 26-32, wardens 24-28, GNASHARA's
  presenting head 28-36 per tool, Billy/Cerberus bumped. skyHit/toolHits read cfg.hitR.
- FIERCE CRITTERS: crab/condor/alien/comet-pup now CHASE (aggressive+aggro) and NIP on
  contact while aggro'd (sting 0.5 -> 1 heart, inv-gated); ibex charges like the steam-
  bull; shark/dragon hunt; jellyfish sting on touch. Calm/wandering creatures stay 100%
  safe to grab — catching is never punished; only getting caught napping is.
- THE COGWERK ROADS (src/19b_cogroads.js): three side-scroll interludes on the classic
  road engine, gating the FIRST trip between city stages via the World-3 map:
  cog1->cog2 THE GEAR-LINE (Piston Pete), cog2->cog3 THE STEAMWAY (Gasketta the Gust),
  cog3->cog4 THE SKY-RAIL (low-gravity, The Rail King). Win -> arrive at the stage,
  route open forever; retreat -> back to the map, nothing skipped. world3Go() routes
  both keyboard + mouse travel; 13_roads finish() gained the pendingCog branch;
  playtest pre-clears all three. ROAD_LEVELS/ROAD_ENEMY_SPECIES/ROAD_BOSS_* are runtime-
  extensible (no 13_roads level edits needed). validate's road audit generalized
  (known-boss check reads ROAD_BOSS_SPECIES; each level needs an F checkpoint).
- PRIVACY: the real-photo Noah portraits (HUD face + full credits portrait) replaced by
  cartoon renders built from his own pixel sprite (02_portraits.js base64 swapped —
  the photo BYTES are gone from the shipped file, not merely unused).
- New suite test/_cogroads.js; _world3map updated to the interlude flow. All suites
  green, audit clean.

## v10.15 — one unbroken adventure: mid-game credits removed (2026-07-02)
Worlds now hand off to each other; CREDITS roll exactly once, after the Storm Colossus.
- SKY rescue: REUNION cutscene -> home to the VALE beside the freshly-torn burrow, with
  the rumble banner (the burrow portal then plays its own intro as before).
- GNASH beaten: PILLOWKIN reunion -> the VALE at the ticking CLOCKWORK GATE, banner
  pointing into Cogwerk City. (W1->sky already flowed; GNASHARA->cloud-stair already
  flowed; Colossus keeps the one true credits roll, which returns to the Vale.)
- Quest ladder rewritten to always point ONWARD (no more mid-game 'YOU WIN'):
  parents -> the burrow; gnash -> the Clockwork Gate; gnashara -> the cloud-stair.
- playthrough + underburrow suites updated to assert the hand-offs (play state in vale
  with the next world's portal open). All suites green, audit clean.

## v10.14 — the throne-seal pound trap (2026-07-02)
Berkley stuck again, better bug: after beating the grub, C at the throne-seal ROLLED
Ramsi away instead of pounding. Root cause: ramsiCommand's no-enemy fallback order
prefers ROLL over POUND once Roll is known (b7 grant) — the old maps never exposed it
because their pounds always happened with enemies near (enemyNear picks pound first).
Fix (16d wrapper): an unpounded POUND-PLATE within 40px always wins the C key; Ramsi
hops onto the seal. _rails now presses the REAL C key with Roll known instead of
calling startPound() directly.
LESSON: input-dispatch fallback chains rot when new abilities join — test through the
actual input path, never by calling the ability function directly.

## v10.13 — CRYSTAL DEEP made comprehensible + THE UNDERBURROW MAP (2026-07-02)
Berkley got STUCK in Crystal Deep — root cause was a design Catch-22, not logic: crystals
only stayed lit while Ramsi stood beside them, but Ramsi follows Noah, so walking to a
crystal to TURN it always killed the beam you were aiming. You rotated dead crystals
blind, then had to guess to walk back. (The test passed because it 'knew' to walk back.)
- STICKY LIGHT: a glow-woken crystal now stays awake for the session ('crystal-hearts
  remember light' — the sign finally tells the truth). Wake chime + sparkle on wake.
  Every rotation happens on a LIVE beam. m._beamWoken set; audit solver clears it per
  brute-force iteration.
- COLD-HEARTS (new, so puzzles don't collapse): the bridge-heart (35,20) and the vault-
  heart (49,22) refuse the glow — only a BEAM feeds them (icy pale look + frost ring).
  Chamber A stays 'aim the lit crystal into the cold one'; chamber C keeps its two-step.
- All west-zone signs rewritten short and true to the new rules.
- THE UNDERBURROW MAP (src/15c_burrowmap.js): ESC underground now opens a root-and-
  lantern level select (mirrors the World-3 map): Topsoil / Root Hollows / Crystal Deep /
  Hoard Descent / Hoard Cavern / Gnash's Throne / climb to Vale. Normal play: each den
  unlocks at its legitimate entry flag (honest fast-travel, no skips — underburrow/
  mottle/thornback/geode/grub/g_grub). Playtest/god: everything open — dig straight to
  Crystal Deep.
- _beams: new sticky + cold-heart asserts; _playtest: burrow-map warp assert;
  _colossus fire() helper pins the shooter (a stray bolt knockback flaked the head shot).
- All suites green, audit clean.
- LESSON (the big one): 'solvable' is not 'comprehensible' — the auditor proves paths
  exist, only a HUMAN in the loop catches a mechanic that fights its own controls. When
  a tester says a level makes no sense, look for state that DIES while the player is
  busy interacting with it.

## v10.12 — anchor-true colossus, 4-frame laser, transformation, endings, HD-4 world (2026-07-02)
- COLOSSUS CALIBRATION, done right: measured every green socket cluster in BOTH painted
  stride frames (connected-component centroids -> design px -> world px). New COL_ANCH
  table: every piece, reticle and laser hit-check reads the CURRENT frame's socket
  (frame B is wider-shouldered and 7px taller — no global offset could fit both).
  Verified with zoomed in-game frame photos. Nearest-aligned piece wins the blast
  (list order stole hits when two sockets sat in the window), and the giant now
  HESITATES mid-stride while Ramsi charges (fixes drift-aim, reads dramatic).
- LASER is now a two-beat move using all four sheet frames: press C -> CHARGE pose with
  a swelling star (0.34s) -> BLAST frame + beam. Hover frames alternate at idle.
- 4th STAR-CELL plays the SUPER TRANSFORMATION: three new beats appended to the star
  celebration (cells spiral into Ramsi -> white burst -> SUPER RAMSI reveal + tease of
  the thing beyond the storm).
- COLOSSUS ENDING now plays over the painted scene.grimspire_sunny panorama with Noah +
  Super Ramsi composited in; CREDITS after the true ending return the player to the
  VALE (world stays open) instead of the title.
- POST-GAME: Super Ramsi rides along for the rest of the save (sprite swap outside the
  castle once flags.colossus is set).
- Playtest victory-warp: ptKeep respected (previous entry) — retested.
- GLOBAL HD: importer DENSITY 2 -> 4 (uniform 2:1 decimation at windowed SCALE 2, true
  1:1 at fullscreen SCALE 4); engine hardcoded density defaults (external-only
  creatures, fx) bumped to 4; full re-import of every raw-backed asset. densFor()
  handles everything with a procedural base automatically.

## v10.11 — stride alignment + playtest victory-warp lock (2026-07-02)
- The two painted colossus stride poses are centered independently by the importer, so
  frame B's socket grid sat 4px left / 7px high of frame A's — pieces looked 'unhinged'
  every other step. Measured the green socket centroids of both processed frames and
  baked a per-frame body compensation (bdx/bdy applied to body + head + helm; pieces
  stay at the gameplay offsets the reticles/laser use). Verified with a two-frame
  side-by-side render.
- Playtest mode stripped the castle1 victory portal's req+secret, letting a tester warp
  out mid-boss-fight. New o.ptKeep flag: ptApplyMap skips stripping it — victory exits
  stay hidden until the boss falls, even in playtest. (_playtest asserts it.)

## v10.10 — THE COLOSSUS ART PASS (density-4 finale art) (2026-07-02)
Berkley's sheets landed; the finale runs on painted art with a per-sheet density system:
- import_art.py: SHEETS entries now take an optional 'dens' (per-sheet pixel density;
  convert_group threads it through). SHEETS['colossus'] added (4x4, dens 4 — stored at
  4x logical so the castle-sized boss stays crisp at high SCALE): body stride A/B, bare
  head, helm, arms L/R, 3 plate types, tornado, bolt glyph, grass, milk, chunk ('-'
  skips the unwanted sheet-ramsi cell). Ran a TARGETED import (module import + one
  convert_sheet call — never rerun main() blindly; it would regenerate every asset).
- SUPER RAMSI uses the dedicated sheet.superramsi.png (4 frames: hover a/b, charge,
  BLAST) — that sheet has a dark GLOW background, so the house flood-fill keyer +
  palette snap would destroy it. Custom gentle path instead: per-cell local background
  median -> soft alpha key (glow survives with real alpha) -> LANCZOS to design x3 ->
  assets/prop.sramsi1..4.png. drawCompanion on the roof now animates those frames
  (hover alternation, charge on busyT, blast while the laser fires) — the disliked
  colossus-sheet ramsi is never imported.
- Panoramas: scene.grimspire_storm/sunny (2172x724 raws -> smooth 1440x480, scene path,
  no snapping) — the backdrop hook picks storm vs sunny by clearT and they are painterly
  gorgeous. All colossus draws prefer sprites with the procedural knight as fallback;
  falling chunks/tornado/pips/pickups all painted. HTML: 5.3MB -> 8.5MB (fine, local).
- All 28 suites green, audit clean.
- LESSONS: (1) per-sheet density beats a global bump — spend pixels only where art is
  drawn big; (2) glow-art needs the gentle keyer, never the palette snapper; (3) always
  targeted-import single sheets via the module, protecting hand-tuned older assets.

## v10.9 — GNASHARA PROWLS + THE STORM COLOSSUS true finale (2026-07-02)
- GNASHARA now MOVES: drifts perch-to-perch across the arena and winds up telegraphed
  SWEEP charges (shiver + amber arrow, then a barreling dash that hurts on contact).
  Victory no longer rolls credits — the storm screams louder and a cloud-stair portal
  (req gnashara) rises in cog4 to GRIMSPIRE KEEP.
- NEW src/22c_stormcolossus.js — a dungeon within the last level ('castle1', zone sky):
  Noah on a gothic battlement; the STORM COLOSSUS (castle-tall, background-scale with
  0.45 parallax) strides around the keep. SUPER RAMSI (golden aura; Sprites.superramsi
  override slot) swaps her pillow tricks for a GIANT LASER on C: line up under a glowing
  piece and blast it OFF — 4 armor plates + 2 arms in any order, then the HELMET, then
  the bare HEAD, and the whole thing comes crashing down. Boss answers with telegraphed
  LIGHTNING BOLTS at Noah's feet and TORNADOS that sweep the battlement (push + hurt).
  Laser holds 3 charges; GRASS LUMPS and MILK CARTONS on the roof refill (+respawn 12s).
  Charge pips (bolt icons) sit above the pinned hint bar; the hint bar is fully
  state-aware ('STAND UNDER A GLOW!' / 'NOW! FIRE THE LASER!' / 'EAT GRASS! DRINK
  MILK!' / 'ZAP THE HELMET!'). On the kill the thunderheads dissolve into a clear
  sunny sky (backdrop state blend), flags.colossus opens the portal home, and the new
  COLOSSUS_ENDING cutscene rolls into credits. Painted panorama slots
  (scene.grimspire_storm/sunny) already hooked; SHEET_PROMPTS.md sheet 12 + scenes
  12a/12b written for Berkley's art pass (placeholder procedural knight for now).
- Layering lesson repeated and now memorized: full-screen backdrops draw at the LAST
  sky row (row 8 here), never row 0, or terrain rows overpaint them.
- New suite test/_colossus.js (portal, laser recipe & ordering, ammo economy, snack
  refills, bolts/tornados, collapse, sky-clear, cutscene->credits). All suites green.

## v10.8 — PINNED BOSS HINTS + reading-level core principle (2026-07-02)
The player is six: timed banners vanish before he can read them. New src/22b_bosshints.js:
- Game.bossHintLine() + a UI.drawBannersToasts wrap draw a PERSISTENT hint bar (bottom of
  the view, above the toast line, gold border) during every boss fight: <=5 ALL-CAPS words
  + KEY-CAP badges ([1]..[5], Z, C) matched to the HUD tool row — readable by symbol, not
  sentence. State-aware: GNASHARA shows each head's recipe (and flips to a green pulsing
  'AGAIN!' hot state on a wounded head, 'SUPER RAMSI ENDS IT!' at the core); wardens/sky
  bosses show the co-op two-step, with live states (dark geode -> 'LIGHT IT UP!', buried
  grub/mottle -> 'WATCH THE MOUND', stuck thornback / open window -> hot 'NOW!').
- GNASHARA's one-shot head toast became a jingle (the bar carries the text now).
- CLAUDE.md core principles gained the READING LEVEL rule: action-critical info is
  persistent + glanceable with key-caps; timed text is flavor only; signs may be longer
  (grown-ups read those); show > tell.
- New suite test/_bosshint.js (per-head recipes, hot states, warden states, no-boss = no
  bar). 28/28 suites green, audit still clean.

## v10.7 — AUDITOR v2 (walk-around detection) + the bypass purge (2026-07-01)
test/audit.js rebuilt around a parameterized model runner (runModel(map, stage, knockouts)):
- WALK-AROUND DETECTOR (automatic): every flag-door is force-locked one at a time; if the
  map's reachable set does not shrink, the gate is decorative -> ERROR. Accepted-legacy
  whitelist for two W1 doors (vale vestigial gate, wastes late-wings shortcut).
- INTENT TABLE: every rebuilt level declares the mechanics its boss/kin/exit MUST require
  (door/post/bounce/glide/rail/crack/pz/lit); each is knocked out in turn — objective
  still reachable = BYPASS error. Model now knows the implicit dungeon block-switch rule
  (any block on any 'switch' sets sw_<mapId> when m.puzzle is absent).
- REAL BUGS FOUND AND FIXED (16 findings -> 0):
  * ROOST (W1 finale!): the DOOR tile for Ramsi's cage was OVERWRITTEN by the skyfloor
    fill on the next line of 06_maps — the star-switch gate never physically existed and
    the cage had no walls: the endgame puzzle was always skippable. Door re-stamped after
    the fills + a solid cloud cage-ring built (switch door is now the only way in).
  * SKY 1-4: wings could FLY AROUND every gate — the crack walls and the sky-gate door
    only spanned the walk band, with open rift above/below (pre-existing geometry, kept in
    the rebuild). All gate columns now rise full height; the parents' storm-cage got a
    solid ring (the cracked ceiling is the only way up); the sky1 terrace heart-piece
    crack now spans the full terrace (was walk-aroundable).
  * BURROW 5-8: all four harpoon crossings were 1-2 tile CHASMS — a maxed jump covers
    ~4.9 tiles (0.58s air x 136px/s), so every harpoon gate was hoppable. They are now
    bottomless RIFT (jump-proof: rift needs FLIGHT, which noFly forbids) with PAIRED
    POSTS on both banks (the coast pattern) so return trips work — validate's post-escape
    anchoring passes via the post-to-post chain.
- Audits CLEAN game-wide: 0 errors, 0 warnings; 26/26 suites green.
- LESSON: when a gate 'never mattered' in playtests, check whether the gate TILE even
  exists — later R() fills silently clobber DOOR() stamps. The auditor catches this class
  now (a clobbered door reads as decorative).

## v10.6 — THE AUDITOR: a playtest-analysis side-program (2026-07-01)
`test/audit.js` — deep, progression-aware map analysis on the live engine (run:
`NODE_PATH=/tmp/node_modules node test/audit.js [maps]`; writes audit_report.md +
audits/<map>.png minimaps; exit 1 on errors):
- STAGE-AWARE REACHABILITY: each map is scanned with only the abilities the player owns
  when they first arrive (w1→sky1-4→b5-b8→vaults→w3→w4), then a FIXPOINT earns what the
  map itself grants (bosses→door flags incl. gauntlet g_*, runes if their solver says
  solvable, jobs, switches, kin→ability gifts mid-map) and re-scans. Items report as
  reachable / backtrack-only (orange) / NEVER (red). Harpoon pulls now require true
  line-of-sight (walls block, matching 08_player's blocked check) — stricter than validate.
- PUZZLE-LOGIC SOLVERS (sandboxed on the real modules, flags/tiles snapshot-restored):
  Beams: all 4^rot rotation combos x every glow-anchor (moths decoyed) -> per-rune solution
  counts, bridge-lit states, and a pre-solved probe against the AUTHORED initial state.
  Sap: all bulb-state products -> per-rune counts + pre-solved probe. Rails: every route/
  stub's landing & crash-out tiles walkable + d.to consistency. Herd: every jobspot has a
  matching herd in call range + valid puzzle wiring. Wind: puff-stone ON-window lengths +
  shared-ON overlap between adjacent stones on different lanes.
- SOFTLOCK SCAN: reachable pockets with no path back to any exit/portal (purple on maps).
- Report includes the per-map PUZZLE LOGIC PATH (flag <- how it's earned) and density.
- FIRST CATCH, a real pre-existing W1 bug: coast's treasure-pocket post (49,31) was only
  reachable by a pull whose line crossed a solid wall at (48,31) — the harpoon stops at
  walls, so chest (49,30) was unreachable in actual play (validate's wall-blind post rule
  masked it). Fixed: (48,31) is water now. Full game audits CLEAN: 0 errors, 0 warnings
  across 36 maps; 26/26 suites green.

## v10.5 — PLAYTEST MODE (T on the title screen) (2026-07-01)
God mode's sibling for level testing (src/23_playtest.js + tiny 12_main/11_ui edits):
- Press T at the title: full kit (tools, gear, upgrades, Ramsi + all 7 abilities + sky
  powers, baits, 16 hearts) and TOTAL freedom of travel — flags.god unlocks every
  world/W3 map node, all road_* flags are pre-set (no side-scroll ambushes), every door
  reports open (doorIsOpen wrap), every portal/pad req is waived and secret portals shown
  (reversible strip on loadMap: originals stashed in o._ptReq/_ptSecret and restored the
  moment a non-playtest game loads the map), and sky-ESC works pre-rescue.
- NOTHING is completed: bosses uncaught, Pillow-Kin caged, puzzles/runes/star-cells
  unsolved. Noah is undying (hits flash + shove, hearts refill). A gold PLAYTEST badge
  sits bottom-left so screenshots are never mistaken for real runs.
- Fixed en route: newGame() now clears god/playtest flags (they used to leak from a god
  session into a subsequent 'N' new game in the same boot).
- New suite test/_playtest.js (activation, openness, freshness, undying, sky-ESC, and
  clean req restoration). Full set: 26/26 green.

## v10.4 — REVAMP Phase 5+6: SKY REALMS rebuilt around WIND + polish (2026-07-01)
sky1-4 rebuilt (src/16b_skyrealms.js overrides buildWorld2 — NOTE: renamed from 14b; wrapper
files MUST sort after 15_underburrow or its updateBurrowAbilities definition clobbers the
chain). New reusable system:
- Wind — authored LANES push Noah/critters/thrown nets & bones; bridge:true lanes are
  leaf-streams whose rift tiles carry weight while blowing (asteroidCovers wrap again);
  pulsing lanes (windsocks show the beat) make timing bridges; 1-tile pulsing bridge lanes
  = PUFF-STONES. Storm maps: m._storm scheduler — bolts telegraph then strike the plate
  nearest Noah, preferring a LIGHTNING ROD within reach (walk in the rod's shadow).
- Four unique sky-boss AIs (headbutt co-op unchanged): GUST WING circle/aim/DIVE along
  telegraphed lines; PUFF LORD shell-games among decoy puffs (his crown pokes out; a
  headbutt pops him out); SPARKHORN charge-lines then calls a bolt on itself (self-fry =
  free window); STORM-LORD 3 phases (bolt tempo, squall-swirl shove, fury). All test
  anchors kept: suit chest (6,13), crack (11,15), sky2 ramswitch/door (20,16), parents.
- Maps: sky1 leaf-stream lesson + pulsing up-draft to a condor terrace (heart-piece behind
  a crack); sky2 staggered puff-stone crossing + terrace draft + drifting balloons; sky3
  plates/rods/squall causeway (secret kept); sky4 hostile gust over a rift edge + moat
  stones + arena with plates & rod. Quest-ladder texts refreshed for all 8 rebuilt levels.
- POLISH: windnet/stormfx draw at last row (row-0 objects get overpainted by terrain);
  _world2shortcut.js was stale (pre-16_ kin position) — updated to the warden-gated flow.
- FULL SET GREEN: 25 suites (16 core + _choke _beams _rails _sap _lure _wind
  _world2shortcut _nofly), screenshots reviewed for every rebuilt level.
- THE REVAMP IS COMPLETE: all 8 flagged levels (sky1-4, burrow5-8) rebuilt per
  REVAMP_PLAN.md — one bespoke, escalated, boss-examined system per level, sealed-chain
  audits kept TIGHT, zero regressions.

## v10.3 — REVAMP Phase 4: TOPSOIL TUNNELS rebuilt around HERDWORK (2026-07-01)
burrow5 rebuilt (src/16f_topsoil.js overrides buildBurrow5). Tools-only level; the system
is the creatures themselves:
- Herdwork — JOBSPOT patches (dashed ring + bobbing species portrait + clover). SPACE
  calls the nearest matching Mimi within ~10 tiles; it trots over and works: GOATS dig
  plugs, RAMS butt boulders, SHEEP mow bramble-roots, SNOWHARES sniff buried treasure.
  Jobs are m.puzzle entries (sw_* + applyPuzzle) — permanent, wired, audit-covered
  (_choke's 'bridge' mechanic now includes to:'soil' machine swaps). Interact radius 32
  (roaming herds nudge Noah ~7px; don't be stingy).
- MAP: three pastures ring the GREAT SINKHOLE landmark (sheep/ram NW, snowhare NE behind
  a mowable bramble wall + sniff-out heart-piece nook, goat pasture S behind a plug its
  own stray kid digs open). Dig-works: ram-smashed boulder gate → harpoon the sinkhole
  moat post → cracked seam lunge → the KIDNAPPED GOAT-KID digs the inner plug → block-
  on-switch beam bridge → den. Vignette-dark only (daylight leaks into the topsoil;
  darkness now escalates level by level down to Crystal Deep).
- MOTTLE rebuilt: whack-a-mole — swims the soil between four MOLEHILLS (windowless,
  mound wake), shakes the hill he'll pop from, then surfaces for the co-op window.
  Synth-hills fallback keeps the vault1 gauntlet re-fight working.
- Exit kept: MR. RAM grants GLOW+SHRINK, and the very first Shrink unlatches the plugged
  hatch down to the Root Hollows. Contracts kept: vale drop (3,11), start (4,20), den
  (58,20), kin (61,15). All 23 suites green.
- LESSON: door tiles are entered LATERALLY along a floor row — a decorative holegap above
  a door must not be the door's only approach (validate caught the sealed shaft).

## v10.2 — REVAMP Phase 3: ROOT HOLLOWS rebuilt around SAP-FLOW (2026-07-01)
burrow6 rebuilt (src/16e_roothollows.js overrides buildBurrow6). New reusable system:
- Sap — the HEART-ROOT landmark pumps amber sap through an authored root graph (nodes/
  edges w/ per-edge bulb gates). ROOT-BULBS turn on C (one hides in a sealed vein-pocket,
  turned by SHRINKING Ramsi through its burrow-hole — repeatable, unlike flag ramholes).
  Fed SAP-RUNES bloom ONCE, permanently, as m.puzzle entries (sw_* switchFlags +
  applyPuzzle): drain the drowned pool (heart-piece), open the dig-works gate, grow the
  BRIDGE-ROOT (real 'bridge' tiles → _choke's existing 'bridge' mechanic audits it free),
  open the Warden-door, + 3 bloom secrets. rootseg objects draw the living network with
  traveling sap-beads; the light-mask shows fed lines glowing.
- THORNBACK rebuilt: charge-liner — aims (dashed telegraph), dashes, leaves fading THORN
  TRAILS (thorns live on the boss object, auto-cleaned); a charge across the den's glowing
  STICKY SAP CHANNEL glues it for a long free window. Headbutt window kept (gauntlet-safe).
- Contracts kept: entry (4,20), den (56,17), kin BEAST MIMI (61,11), octopus+goat herds,
  bounce-ridge exit to burrow7 — underburrow.js and _choke REQ.burrow6 pass UNCHANGED.
- TESTS: test/_sap.js (routing, permanence, shrink-vein bulb, thornback states) +
  _b6shot.js (3 shots, reviewed). All 22 suites green.
- LESSONS: (1) a branch edge must hang off the node UPSTREAM of its gating bulb — hanging
  it off the downstream node makes the option impossible (e6 bug); (2) any new flagless
  object near ramhole code paths: guard Game.lookupFlag(undefined) (wrapped defensively
  now); (3) invisible mechanics aren't mechanics — the sticky channel needed its shimmer.

## v10.1 — REVAMP Phase 2: THE HOARD DESCENT rebuilt around MINECART RAILS (2026-07-01)
burrow8 rebuilt (src/16d_hoard.js overrides buildBurrow8). New reusable system:
- Rails — raildock objects with authored tile-polyline ROUTES; stepping on a dock rides the
  line via chained Player.gArc segments (input locked, hazards skipped, Ramsi rides in the
  cart, warm lantern halo through the lightMask). Junctions are FLAGS driven by EXISTING
  switch systems (boneswitch b8_j1, block-on-switch m.puzzle sw_b8j2 with tiles:[]), shown
  by red/green railsignals. Crash stubs tip Noah out safely beside the dock (0.9s dock
  cooldown). Soft-block BARRICADES on the line divert to a 'blocked' stub until ROLLed
  clear. railseg objects (draw-only, deco:true) render brass track per tile.
- MAP: west dune-sea (aliens/condor/cometpups/unicorn + 12 glinting coindune props) →
  sealed dig-works: SHRINK latch into the dock-house → BONE the ledge junction → D1 over
  the GREAT VOID up to the high works → BRACERS block-junction + ROLL coin-slide → D2 to
  the coin-fall ledge → HARPOON post down into the den → TREMOR-GRUB → LUCKY → POUND the
  throne-seal → secret drop-portal to vault1. Secret ROLL-gated spur line rides to Gnash's
  private stash and back. Test anchors kept: entry (4,20), den (62,20), kin (68,15).
- TREMOR-GRUB rebuilt: tunneling worm — stalking mound wake (windowless, headbutts void),
  swelling telegraph, eruption with a real co-op window that holds while it's up. Painted
  Sprites.grub still wins when present; gauntlet vault4 re-fight works unchanged.
- TESTS: new test/_rails.js (latch, stub crash, junctions, barricade+roll, grub cycle,
  pound-seal, secret spur) + _b8shot.js (3 screenshots, reviewed). _choke taught 'rail'
  (REQ.burrow8 warden+exit: rail+doors+chasm — TIGHT). validate: raildock links + deco
  exemption for draw-only objects. All 21 suites green.
- LESSONS: (1) rides leave comp.busyT warm for ~7 frames — C presses right after a
  crash-out are eaten (fine in play, mind it in tests); (2) validate audits EVERY object:
  mark draw-only props deco:true; (3) dock cooldown is 54 frames — tests must wait.

## v10.0 — REVAMP Phase 1: CRYSTAL DEEP rebuilt around LIGHT-BEAMS (2026-07-01)
Per REVAMP_PLAN.md (approved): burrow7 fully rebuilt as the game's darkness/light level.
- NEW SYSTEMS (src/16c_crystaldeep.js, overrides buildBurrow7 later-declaration-wins):
  * Beams — wall-spouts + glow-charged crystals fire chained light-beams; RAMSI butts a
    crystal (C) to TURN it 90°. Beams light the dark, harden LIGHT-BRIDGE tiles over
    star-chasms (m._beamBridges + a Game.asteroidCovers wrap = zero collision edits),
    trigger SUNRUNES (flag-openers with dotted cause->effect wires), and wake the GREAT
    PRISM landmark. Shadow-MOTHS smother a crystal until DECOYed (C).
  * lightMask — real darkness (map.lightMask=true, map.darkness) replacing the vignette:
    black veil punched by Noah/Ramsi glow/veins/crystals/beams/prism. Opt-in per map.
  * Game.OBJDRAW registry in 12_main — one generic branch; all new object types
    (beamcrystal/spout/prism/sunrune/moths) draw without further 12_main edits.
- MAP: 64×40, west open zone (beam lesson row C1→C2→PRISM→gate-rune; capricorn pool with
  jelly-guarded heart-piece isle; ibex ridge; starpupil hollow; beam-aimed secret north
  vault) + sealed dig-works: bounce wall → spout-fed LIGHT-BRIDGE over the star-chasm →
  moth vault (decoy) → two-crystal alignment + harpoon trench → Golem den → glide exit.
  Same contracts as before: entry (4,20), den ~(56,17), kin TOOTHLESS (61,12), exit
  portal (60,33) req 'geode' — core underburrow.js passes UNCHANGED.
- GEODE GOLEM rebuilt (up_warden/drawWarden wrapped): light-shy — invisible wandering
  shadow in the dark, lumbering hunter in Ramsi's glow (telegraphed SLAM ring), SLOWED
  with longer co-op windows while beam-bathed. Painted Sprites.geode still wins if present.
  Gauntlet vault3 re-fight works on the glow rule alone (no crystals needed).
- TESTS: new test/_beams.js (charge/turn/chain/bridge/moths/runes/prism/golem states) +
  test/_b7shot.js (3 screenshots, reviewed). _choke.js taught the 'lit' mechanic
  (REQ.burrow7 = warden: bg+lit+chasm, exit: bg — TIGHT). validate.js passes solved
  light-bridges with full gear. Full 16-suite core set + _nofly + _choke + _beams GREEN.
- LESSONS: (1) den north wall must be y10 only — a stray y13 row sealed the Kin alcove
  (validate caught it); (2) choke's post-pull rule ignores walls: keep posts >7 tiles
  from any strip outside the seal, and seal the band THICK (y11-13); (3) validate's
  no-pulls BFS can't cross rift — audit-mandatory crossings should be 'chasm' (jumpable
  in the model) or registered beam-bridges; (4) doors registry entries are {kind,req,msg}
  (req, not flag).

## Status: v4.0 COMPLETE GAME (2026-06-12) — ground-up rebuild
Fresh code + fresh hand-coded pixel art per GAME_BIBLE.md. Only three graphics
carried over (CaptureMimi.png title art, Mimi_Sahor.png portraits, BUFF_NOAH.png
portraits/credits). All four test suites green.

## What's in v4.0
- ENGINE: 16px tiles, 480x272 game view + 176px side panel, integer scaling
  (crisp), row-interleaved terrain/entity renderer with real elevation lift
  (EOFF=10), terrain-tinted cliff walls (snow/sea/void/canyon/stone), cast
  shadows + altitude sunlight, dark-dungeon vignette, per-zone ambient particles.
- ART: all-new procedural tile set in the chunky outlined storybook style of the
  reference shots (checker grass, foam shores, coral maze, void grids) + ~40
  hand-pixel sprite grids (Noah 6-frame walk + dive-suit palette swap, 16
  creatures with hop frames, 10 NPCs, 4 bosses, props/items/tools).
- WORLD: 9 maps — Greenwood Vale (snow summit shrine, sheep meadow, Goat Grotto,
  GEAR GAUNTLET corridor), Sunsplash Coast (pier, school interior, 2 dive
  buoys), The Deep Blue (coral maze + tide gate), Starfall Wastes (rifts + warp
  pads + saucer quest), Hound's Keep, Whistling Canyon (4 tiers: stairs → slick
  wall → harpoon post → wings-only rift), Rainbow Spire. Painted world map (ESC).
- CRITICAL PATH (no skips, validated): 3 sheep (mitts) → Granny gives NET+CAGE+
  baits → ram via clover cage + goats → snow-summit SANDALS → Grotto (jump) →
  HARPOON → island key → block/switch → BIG KEY → KING BILLY (harpoon mid-charge
  → grab) → GLOVES (shop) → Gauntlet (jump+climb+harpoon, Billy-gated door) →
  Coast → shark → SAL trade → DIVING SUIT → school cookies → 3 pupils → BOOMER-
  BONE → 8 sea Mimis → tide gate → SIR TWINKLE (fish-snack cages on glowing arm
  tips ×5) → SUNKEN CROWN → Wastes → 3 shards (warp pads) → Zibble → Keep →
  CERBERUS (bone while drowsy → grab) → Canyon → dragon (bone+net) → CORA trade
  → ANGEL WINGS → fly to berry garden → RAINBOW BERRY → Spire → MIMI SAHOR
  (3 ring harpoons → berry cage on her run) → credits with family art.
- ECONOMY: coins (capture drops/chests) → 10:1 gems at traders; 4 zone shops w/
  upgrade tracks (lunge/net→NET LAUNCHER→Mega/jump/speed/harpoon), 4 traders
  (Tess/Sal/Gruul/Cora) incl. the two must-pass trades (shark→suit, dragon→
  wings). Capture log = living herd = trade inventory (I key).
- UX: live quest hint with counters, numbered dungeon signs, kid-size dialog
  text + big portraits (photo art for Noah/Sahor, pixel-zoom for NPCs), key
  monitor + version stamp, keyboard-not-detected banner, N = fresh game.
- SAFETY: escape-rule collision, boxed-in-only stuck watchdog with BFS rescue,
  spawn-safety relocation, save slot buffNoahQuest_v4 (versioned, sanitized,
  never resumes in a dungeon/underwater), autosave ~3s.
- AUDIO: WebAudio chiptune sequencer — 8 zone/boss/title loops + 18 jingles, P toggles.

## Tests (node + node-canvas; run all on EVERY build)
- test/validate.js — BFS reachability of all 122 chests/keys/npcs/doors/bosses/
  links across 9 maps + no-gear gating checks.
- test/playthrough.js — scripted FULL progression start→credits using real
  mechanics (jump arcs, harpoon pulls, cage lures, block pushes, boss puzzles).
- test/smoke.js — every map × 240 frames of chaotic input + renders, 0 errors.
- test/pixels.js — samples RENDERED pixels at expected screen positions (hero
  before/after movement, creatures, elevation) + emits shots/ + sheet_*.jpg.

## How to resume work
1. Read ../noahs-quest/GAME_BIBLE.md (the soul), then this file. Source = src/.
2. Build: `python3 build.py` → BuffNoahsQuest_v4.html + game.js (test input)
3. Test: `node test/validate.js && node test/playthrough.js && node test/smoke.js && node test/pixels.js`
4. WARNING (hard-won, again this session): file writes through the agent mount
   can TRUNCATE or NUL-pad. Run `python3 striputil.py` then `node --check` on
   every touched file before building. Prefer whole-file writes over partial edits.

## Controls
Arrows/WASD move · Z use tool · X jump (X again mid-air = FLAP with wings) ·
SPACE talk/grab/dive/warp · 1-5 or Q/E tools · B bait cage · I capture log ·
ESC world map · P music · N (title) new game

## Ideas for next session
- Boss intro cinematics; more arena hazards for Billy's escalation
- Wandering merchant between zones; fishing minigame off the pier
- Title-screen attract mode; gamepad support

## v4.1 (2026-06-12, session 2) — feel & celebration pass
- OVERWORLD BGM: the classic mp3 (BGM_B64 from capture-mimis_world2.html) now
  loops on all four zone overworlds (src/02a_bgm.js); chiptune remains for
  dungeons/deep/boss/title. Audio unlocks on first keypress (browser autoplay).
- REAL DIALOG FACES: FF-Tactics-style portraits cropped from
  dialog_portrait_examples.png (src/02b_faces.js) for Granny/Marko/Tess/Sal/
  Gruul/Cora/Plume/Zibble/Spirit; Noah & Sahor keep their photo/PNG art.
- SPACE = GRAB, ALWAYS: lunging/grabbing is no longer a tool. SPACE talks,
  opens, grabs creatures AND dazed bosses — harpoon stays equipped for Billy.
- POWER BRACERS (new gear, chest in Grotto east room): blocks are immovable
  bare-handed; hold SPACE to GRIP, arrows PUSH or PULL — blocks can never be
  stuck in a corner. Blocks lock onto switches.
- ITEM GET! cutscenes: dim screen, radiant beams, sparkle ring, zoomed item,
  fanfare jingle for net/cage, sandals, harpoon, bracers, gloves, suit, bone,
  crown, wings, first berry.
- ELEVATION OVERHAUL: lift raised EOFF 10->14; textured rocky cliff walls
  (strata, cracks, chipped highlights, per-terrain palettes), sunlit double
  lips, heavy contact rims, deep cast shadows on lower ground, crisp plateau
  silhouettes, stronger altitude sunlight.
- NOAH ANIMATIONS: real CLIMB mantle (arms-up pose, eased rise, dust),
  springy auto HOP-DOWN off ledges, jump squash-&-stretch with landing squash.
- Tests upgraded: harness uses real image decoding (faces verified in pixels);
  playthrough now proves bracers gating, grab-push/pull INCLUDING a pull-back,
  SPACE-grab boss captures, and ITEM GET flow. All 4 suites green.

## v4.2 (2026-06-12, session 2c) — THE GREAT EXPANSION (space & spacing pass)
- HARPOON HURDLES ARE NOW REAL: every post crossing has 3+ tiles of un-jumpable
  void/water on all sides (playthrough literally attempts the jump and asserts
  it FAILS before harpooning across):
  * Grotto key island: 9x9 chasm, island dead-center, narrow west catwalk
    leads around the pit to the relocated boss door (17,5).
  * Gear Gauntlet: rebuilt as ONE LONG causeway (27 tiles): jump gap -> slick
    ice ridge -> 9-wide water with a TWO-POST harpoon chain -> final island
    hop -> Billy door. (Vale grew to 64x40 with an open east meadow.)
  * Coast heart-piece island: 4 water tiles off the sand spit (coast now 60 wide).
  * Canyon notch: already 3-wide. Harpoon now ignores the post underfoot
    (firing from island A can reach island B).
- LONG-CORRIDOR SPACES (nothing has to be a box anymore):
  * Grotto "Whistling Tunnel": scenic snaking side-loop along the south wall.
  * Deep Blue (56x44): "Kelp Canyon" — a narrow winding channel through a coral
    massif, ending in a wide lair bowl for Sir Twinkle; tide gate seals the
    canyon mouth; extra south maze arm.
  * Starfall Wastes (58x40): "Starlight Causeway" — a 10-tile void-road through
    a sea of rift, Hound's Keep door now on its far eastern face.
  * Rainbow Spire (30x38): a long torchlit climb hall flanked by statues
    before the arena.
- Validator now models harpoon post-pulls (axis line-of-sight <= 7 tiles);
  133 targets reachable. All 4 suites green.

## v4.2b (2026-06-12) — soft-lock fix: no more one-way harpoon islands
- BUG (reported live): the Grotto key island's only post was ON the island —
  zip over, no target to zip back. Stranded.
- FIX: every harpoon island now has a return post in line-of-sight:
  Grotto rim post (17,16); Gauntlet shore posts (47,32) & (57,32) — the chain
  works in BOTH directions; Coast sand-spit post (44,31); Canyon lower post
  (24,12). Post-underfoot exclusion raised to 20px so adjacent posts don't
  snag your own shot.
- NEW TEST LAYER: validate.js POST-ESCAPE AUDIT — BFS without pulls finds
  anchored ground, then post-to-post line-of-sight closure must anchor EVERY
  post. A one-way island now fails the build. Playthrough also physically
  harpoons BACK off the key island and round-trips the gauntlet chain.

## v4.3 (2026-06-12) — MULTI-ROOM DUNGEONS & bigger puzzles
- Dungeons are now chains of real rooms (separate maps, persistent doors/keys/
  switch flags per room). Room-name banner on entry.
- GOAT GROTTO -> 4 rooms: Entry Cavern (grabby-gap ring + whistling tunnel),
  The Great Chasm (15x11 pit, key island, rim-post return, catwalks to TWO
  gated exits), The Bracer Works (bracers chest + TWO blocks on TWO switches
  -> BIG KEY vault), Billy's Hall (arena).
- HOUND'S KEEP -> 3 rooms: Star Halls (obstacle slalom: jump bar -> climb
  ridge -> 3-wide harpoon span -> little key), The Triple Locks (THREE blocks
  on THREE switches with the new `switchesNeedBlocks` rule — Noah standing on
  a switch does NOT count, only stone; one triple-click opens both the den
  door and the BIG KEY vault), Cerberus Den.
- Boss arenas: charge/chase bounds now follow the spawn point (any room shape).
- Playthrough proves: room-to-room doors, key/bosskey across rooms, the
  2-block and 3-block puzzles (incl. a deliberate pull-back and a 'Noah on the
  switch does nothing' check), slalom traversal. 158 targets validated across
  14 maps; all 4 suites green.

## v4.3b (2026-06-12) — world map: walk the trail + drop-in art
- WORLD MAP TRAVEL: choosing a destination no longer teleports — a mini Noah
  walks the dotted trail node-to-node (through intermediate zones, ~95px/s)
  with walk frames, facing, shadow and dust, then the zone loads. He also
  stands idle at your current zone whenever the map is open.
- DROP-IN MAP ART: if a file named worldmap_bg.png sits next to the HTML, the
  world map uses it as the painted background (nodes/labels/Noah drawn on
  top); otherwise the built-in painted island remains. Aspect ~30:17
  (e.g. 1920x1088); node anchor points at 31%/63% (Vale), 63%/70% (Coast),
  75%/33% (Wastes), 42%/22% (Canyon).
- Playthrough now travels Coast->Wastes on foot via the real key path.

## v4.3d (2026-06-12) — drag-to-place world map node editor
- NEW: map_editor.html — standalone tool. Loads worldmap_bg.png, shows the 4
  node circles + trail; DRAG nodes onto the painted landmarks, toggle "path
  mode" to add/drag/double-click-delete trail waypoints that bend Noah's route.
  "Download worldmap_nodes.js" (or Copy values).
- Game reads worldmap_nodes.js via a <script src> tag in the HTML head
  (window.NQ_MAP_OVERRIDE) — works on file:// where fetch() of a .json would be
  blocked. applyMapOverride() sets each node's bx/by and WORLD_PATHS; travel
  (startWorldTravel/segPoints) threads Noah through the waypoints; the world
  map draws the custom dotted trail. No rebuild needed: drop the .js in the
  game folder, reload.
- build.py rewritten ASCII-safe (mount kept truncating the f-string template);
  HTML now also assembled directly from game.js when shipping to dodge the
  mount's stale read-cache. Unit test proves override sets bx/by=160,188 and
  inserts waypoint 210,205 into the travel path. All 4 suites green.

## v4.3e (2026-06-12) — curved world-map trails
- Paths between nodes are now smooth Catmull-Rom curves through the waypoints
  (shared catmullRom() in 01_util). Noah walks the dense sampled curve; the
  world map draws it; the editor renders the identical curve so what you draw
  is what you get. Zero waypoints = a straight line (unchanged); add waypoints
  to bow the trail. Unit-verified: a 2-waypoint Coast->Wastes path samples 43
  points and bows off the straight line. All 4 suites green.

## v4.4 (2026-06-12) — underwater & projectile fixes
- TIDE GATE EXPLOIT SEALED: The Deep Blue lair sat on open seafloor you could
  swim around. Rebuilt with a full-height CORAL CURTAIN (x40) whose only gap is
  the tide gate; lair is now a sealed pocket. New validate guard BFS-proves the
  boss is UNREACHABLE while the gate is shut.
- PROJECTILE/TENTACLE CLIPPING FIXED: harpoon, boomer-bone, flying nets AND the
  boss are now drawn in a TOP overlay pass (after all terrain) instead of
  interleaved by row — so downward-firing projectiles and Sir Twinkle's lower
  arms no longer vanish under the seafloor.
- HARPOON FLIES OVER WATER: projectiles pass over water/deep tiles (only real
  walls stop them); with the suit you can now harpoon posts across the bay
  (unit-verified ~111px over open water).
- VISIBLE RETURNS: dungeon & underwater exit links now draw a pulsing blue
  ring + up-chevron + 'EXIT'; bubble columns are bigger/brighter with an 'UP'
  arrow + label.
- SWIM ANIMATION: underwater Noah uses a real prone swim pose (kick frames,
  gentle tilt + idle flutter) instead of the walk cycle.
- CORAL DIVERSITY: 4 distinct reef styles on a seafloor base — branching
  (pink), brain (orange), sea-fan (purple), anemone/sponge (red tendrils).
- All 4 suites green (159 checks incl. the new gate guard).

## v4.5 (2026-06-12) — STARFALL WASTES reborn (fun + pretty + reachable)
- KEEP WAS UNREACHABLE: the old "Starlight Causeway" was an island marooned in
  rift with no warp onto it (validator only passed by assuming wings you don't
  have yet). Whole zone redesigned.
- NEW LAYOUT — a cosmic WARP-HOP badland: a west hub plaza (Zibble's crashed
  saucer, Gruul, Marko) faces a great RIFT SEA of stars. A launch row of glowing
  WARP PADS each teleports Noah to a floating ASTEROID: 3 shard asteroids, a
  secret heart-piece asteroid, and the KEEP asteroid (door gated by keepOpen).
  Pads are 2-way so returning is automatic — no soft-locks.
- COSMIC ART: voidfloor is now a blue-violet nebula plate with twinkling stars
  + faint grid; rift is a starry abyss with a glowing cyan/magenta lip (no more
  red error box); warp pads are swirling cyan/magenta wormholes; new 'crater'
  tile + 'crystal' & 'beacon' props (with soft glow) scattered for variety.
- TESTS: validator now MODELS warp pads (step a pad -> partner reachable) and a
  new no-wings guard BFS-proves all 3 shards + the keep door are reachable via
  pads alone (rift impassable). Playthrough hops the real pad network. 173
  targets validated; all 4 suites green.

## v5.0 (2026-06-12) — RAMSI: the true goal + all-gear finale
- THE GOAL IS NOW RAMSI: a UNC-blue Pillow-Pet ram (new sprite) shown at game
  start as a shimmering VISION trapped on a floating island in Greenwood Vale.
  newGame establishes the goal. The whole adventure now points at freeing her.
- WINGS (and EVERY movement item) ARE MANDATORY: catching MIMI SAHOR no longer
  ends the game — instead a PORTAL tears open atop the Rainbow Spire (gated by
  the sahor flag). It leads to a brand-new finale zone:
- RAMSI'S ROOST — a floating sky-temple gauntlet that demands all five powers in
  sequence: 1) JUMP a sky gap, 2) CLIMB a frosty wall (gloves), 3) HARPOON a post
  across a void, 4) DIVE/swim a sky pool (suit), 5) FLY a great rift (wings),
  6) BRACER-push a sky-block onto a star switch to drop Ramsi's cage. Free her =
  the TRUE ENDING (credits now feature Ramsi). New 'skyfloor' + 'cloud' tiles.
- SAHOR REDRAWN to match Mimi_Sahor.png: blue ram-imp, gold curling horns, white
  face + blush, gold chain, held bat, white/gold sneakers (was an abstract blob).
- BACKTRACK COLLECTABLE: a heart on a rift-ringed floating islet in Greenwood
  Vale, reachable ONLY after you earn Angel Wings in the late canyon — return to
  claim it ("everything earns its place").
- Tests: validator now reaches 200 targets across 15 maps; playthrough walks the
  ENTIRE roost finale (all 5 movement gates + the bracer puzzle + freeing Ramsi
  -> true-ending credits). All 4 suites green.

## v5.2 (2026-06-12) — diver fix + OUTSOURCED ART PIPELINE
- UNDERWATER NOAH is a real diver now (was a seal): 22x11 prone pose with teal
  hood, clear mask + visible face/eye, orange wetsuit, gray back tank, dark
  teal legs with long fins; two kick frames.
- EXTERNAL ART OVERRIDES: drop PNGs in assets/ and build.py embeds them as
  base64 EXT_ART; applyExtArt() (04_sprites) installs them over any sprite
  slot at boot — noah/dive/swim poses, all creatures (auto hop-frame if no .b),
  npcs (pixel portraits regenerate), bosses, props, items, tools, gear, trees.
  Filename = slot key (case-insensitive). Missing file = procedural fallback.
- import_art.py: converts ANY-size AI renders (assets/raw/) to true game
  resolution: bg keying (transparent or solid), content crop, dominant-color
  grid snap, dark-pixel snap to #241a33 outline. 102 slots in ASSET_SIZES.
- ASSETS.md: full catalog (key, exact grid, per-item ChatGPT prompt line) +
  the master style prompt + workflow + gotchas (keep Noah hair gold & sheep
  white — pixels.js samples those colors).
- E2E-tested in /tmp clone: synthetic blurred/noisy 1024px "AI render" ->
  importer -> build -> sprite override confirmed in the live sprite set.
- DIVISION OF LABOR going forward: art via ChatGPT->assets pipeline;
  Claude owns mechanics, puzzles, zones, renderer, tests, and wiring new
  asset slots into ASSET_SIZES/ASSETS.md when content is added.
- All 4 suites green.

## v5.2b (2026-06-12) — sprite-sheet batch generation
- import_art.py SHEET MODE: assets/raw/sheet.<name>.png is auto-sliced row-major
  into per-slot assets (SHEETS layouts: noah 3x3, creatures 4x4, npcs 4x3,
  bosses 3x2, props 4x3, items 4x4, gear+tools 4x3, trees 3x2, noahdive 3x3).
  Each cell is independently bg-keyed/cropped/grid-snapped, so sloppy AI
  centering is tolerated; '-' cells skipped; singles overwrite sheet output.
- SHEET_PROMPTS.md: master style prompt + 9 ready-to-paste sheet prompts that
  generate the ENTIRE game art set in 9 ChatGPT images (with per-cell design
  grids and descriptions). E2E-tested with synthetic transparent + magenta-bg
  sheets: 18/18 cells sliced to exact dims, embedded, override confirmed.

## v5.3 (2026-06-12) — GAMEPLAY PACK: tougher bosses, hungry starfish, exits, intro
- MULTI-HIT BOSSES: King Billy now takes THREE harpoon-daze-grab rounds (wriggles
  free + speeds up each time); Cerberus needs a grab per HEAD (3x — soothing one
  head wakes the others into zoomies). Sahor already demanded 3 ring hooks + cage.
- SIR TWINKLE REBUILT: he now DRIFTS around his lair bowl (lissajous), and his
  five arms are HUNGRY — each free arm bends toward the nearest unclaimed
  fish-snack cage (70px attraction) and gets STUCK on touch. All five stuck =
  caught. Glowing-tip mechanic removed; lunging arm tips glow as the tell.
- SEALED LAIR CHESTS: the Sunken Crown + lair heart chest now carry req
  'twinkle' (generic chest req support in 09_systems) — no more strolling past
  the boss to loot the dungeon prize.
- VICTORY EXIT PORTALS: links now honor a req flag (transition + EXIT marker);
  each boss room gains a flag-gated exit with a swirling magic ring:
  grotto4 alcove -> vale (grotto mouth), keep3 alcove -> wastes (keep pad),
  deep lair top -> coast (2nd buoy). Spire already portals on to the Roost.
- OPENING CUTSCENE (skippable, auto-advances ~11.5s): meadow scene — Noah &
  Ramsi cuddle w/ floating hearts -> SAHOR swoops in and YOINKS him offscreen ->
  world-map scene — Sahor + Ramsi fly a dotted trail from Greenwood Vale to the
  Rainbow Spire. New-game only; SPACE/Z/X skips. UI.drawIntro in 11_ui;
  'intro' state in 12_main; harness skips it automatically.
- Tests updated & green: playthrough proves 3-round Billy, 3-head Cerberus,
  cage-ring Twinkle capture, the SEALED chest refusing early opening; pixels
  shoots both intro scenes (00b/00c). 203 validate targets (3 new exit links).

## v5.4 (2026-06-12) — FIRST CHATGPT ART IN THE GAME
- Imported 33 outsourced sprites from 3 AI sheets: all 9 Noah poses (walk/climb/
  swim), all 16 creatures, 8 of 10 NPCs (sheet.npcs.png arrived truncated on the
  sync layer — recovered rows 1-2 via PIL LOAD_TRUNCATED_IMAGES; zibble + spirit
  stay procedural until a clean re-export).
- Importer upgrades: FLIP_KEYS (sheep/ram/snowhare were drawn facing left —
  auto-mirrored to the engine's face-right convention) and PALETTE snap (colors
  within ~22 of the official palette snap exactly; whites normalize to fluff
  #fff8f0 — this is what keeps pixels.js color probes green under new art).
- All 4 suites green with the new art embedded (1.45MB HTML).
- NOTE for future sheets: real transparency came through on 2 of 3 sheets; the
  magenta fallback also worked. Dropbox can hand the mount a truncated PNG —
  if PIL says "truncated", recover what decoded and re-request the file.

## v5.5 (2026-06-12) — HD SPRITES (2x pixel density across the game)
- Sprites now carry a `dens` factor: stored at N px per logical game pixel and
  drawn at logical size via sprW/sprH/dspr helpers (04_sprites). All ~30 sprite
  draw sites updated (player, creatures, NPCs, bosses, props, items, tools,
  gear, trees, panel, menus, intro, credits, world map). Procedural grid art
  stays dens 1 and renders identically.
- installExtSprite auto-detects density from the slot it replaces; flipH and
  the auto hop-frame preserve it; pixPortraits scale by logical size.
- import_art.py DENSITY = 2: every converted asset now keeps 2x detail
  (Noah 32x40, creatures 32x20, NPCs 32x32, bosses up to 64x42).
- Re-imported all sheets at HD incl. the NEW sheet.bosses.png (all 6 bosses!).
  39 external assets embedded. The difference is dramatic — AI art detail
  survives at world scale because device pixels were always there (SCALE>=2).
- NPC dialog faces still use the FF-T portrait sheet; zibble + spirit still
  procedural (npcs sheet truncated — needs re-export).
- All 4 suites green.

## v5.6 (2026-06-12) — surface swimming + 4-frame walk cycles
- SURFACE SWIM SPRITE: new Sprites.noahSurf (right/left, 2 frames) used whenever
  Player.swimming on overworld water — hooded head + eye above the waterline,
  orange shoulders awash, raised crawl arm, patchy splash foam. Procedural
  fallback grids (20x12) included; external slots noahsurf.right.a/b. The old
  white waterline rect and the ground shadow are suppressed while afloat.
- 4-FRAME WALK CYCLES: Player.draw plays frames in gait order (A=left step,
  C=pass, B=right step, D=pass) whenever 4 frames exist; 2-frame art behaves
  as before. External slots noah.<dir>.c/.d (+ noahdive.*) accepted; frame
  letter map a/b/c/d in installExtSprite.
- NEW SHEET PROMPT: sheet.noah2 (4x4) = full 3-direction walk cycles + climb +
  both surface-swim frames. SHEET_PROMPTS.md section replaced; ASSETS.md
  appendix lists the 14 new slots. Old sheet.noah remains valid (swim frames).
- All 4 suites green.

## v5.7 (2026-06-12) — flood-fill background keying + noah2/props sheets in
- IMPORTER: background removal rewritten as border FLOOD FILL (bg = pixels
  connected to the border through bg-like colors; top-4 border ring colors,
  tol 16, real alpha used when present). Handles white, off-white, opaque
  fake-transparency checkers, and magenta — outlined sprite interiors are safe
  even when white. A corrupt sheet no longer aborts the whole import run.
- IMPORTED: sheet.noah2 (4-frame walk cycles x3 directions + climb + BOTH
  surface-swim frames) and sheet.props (all 10 props). 57 external assets
  embedded; Noah now walks with a real gait and swims with custom surf art.
- sheet.npcs.png is STILL the truncated copy (zibble/spirit pending);
  the stray "ChatGPT Image ..." file is a byte-identical duplicate of
  sheet.bosses.png (ignored). All 4 suites green.

## v5.8 (2026-06-13) — WEAR THE WETSUIT + full art set + auto-cluster slicing
- WETSUIT IS NOW A WEARABLE: Noah automatically suits up when he enters water
  (or an underwater map) and KEEPS the dive gear on when he climbs out — walk
  around the island in it. U toggles it on land (blocked while wet; helpful
  toasts; first-exit hint; keyCode 85 mapped). Dive walk art finally has a job.
- ALL ART SHEETS IMPORTED: gear (10), items (15), trees (3), noahdive (7) and
  the FINALLY-synced npcs sheet (all 10 — zibble + spirit in). 94 external
  assets embedded; 101 of 102 slots are now ChatGPT art (only chestOpen shares
  a generated file? no — full set; only remaining procedural: none of note).
- AUTO-CLUSTER SHEET SLICING: sheet.noahdive came back 4x3 with misaligned rows
  (split figures -> double-Noah bug on screen). New find_sprites() detects
  connected non-bg blobs (flood mask + merge + row grouping) and maps them
  row-major to keys — the noahdive SHEETS entry now uses {'auto': True} and
  skips the 2 left-facing extras. Use auto mode for any future sloppy sheet.
- pixels.js: wastes hair probe now doffs the wetsuit first (the suit stays on
  after the deep dive — by design).
- All 4 suites green.

## v5.9 (2026-06-13) — steady animation frames (importer rendering rework)
- BUG (reported): walking Noah pulsed in size; junk pixels under his feet when
  idle facing left/right. Cause: per-frame bbox STRETCHED to the target box
  (every frame got its own scale + distortion), and row-bleed from misaligned
  AI sheets survived the near-figure speck rule, extending bboxes.
- FIX (import_art.py): render_snapped() — uniform aspect-preserving scale,
  anchored BOTTOM-CENTER (feet pinned to the baseline); clean_mask() now also
  drops small blobs TOUCHING THE CELL BORDER (<15% of the figure — that is
  exactly what neighboring-row bleed looks like); group machinery converts
  related frames together (group_id: one character = one group).
- All 101 cells re-imported; side a-d / down a-d / climb / dive / surf verified
  pixel-steady on a shared baseline. All 4 suites green.

## v5.10 (2026-06-13) — block & tree rendering fixes
- BLOCKS: the props-sheet block cell carried a bleed blob that survived cleanup,
  shoving the block off-center and shrinking it ("clipped"). Importer gains
  STRICT single-object mode (props/items/gear/tools/trees/bosses/npcs keep ONLY
  the main blob + blobs overlapping its box); prop.block retargeted 16x9 ->
  14x13 (the AI draws square blocks); draw is bottom-center anchored in the tile.
- TREES: ext tree overrides were racing buildTileArt (node installed them before
  the procedural art overwrote them; browser after — divergent results).
  applyExtArt() now runs AGAIN after buildTileArt in bootGame/buildAll, so node
  tests and the browser render identical AI trees at correct density.
- All 101 cells re-imported under strict mode. All 4 suites green.

## v6.0 (2026-06-13) — REAL MACHINE PUZZLES (Three Weight Gate design)
- STAGED PUZZLE ENGINE: maps can declare m.puzzle = [{sw, flag, tiles, to,
  color, jingle, msg, wireTo}] — each switch drives ONE machine. A block parked
  on a switch transforms tiles (wall sinks -> floor, chasm -> bridge) or opens
  flag-gated doors; per-machine jingle + banner + particles; switchFlags
  persist and loadMap re-applies transforms (Game.applyPuzzle). Old
  all-switches-covered logic remains for non-puzzle maps (roost).
- WIRE HINTS: dotted colored circuit lines run from every switch to its
  machine (dim until triggered, then bright + animated dashes); un-pressed
  switches pulse with a colored ring.
- BOTH ROOMS REBUILT on the "Three Weight Gate" structure (per design doc):
  * grotto3 Bracer Works: B1 -> switch 1 sinks a cracked WALL; B2 -> switch 2
    extends a stone BRIDGE over a 2-wide chasm; the third block is BOXED IN on
    three sides (the aha: bracers must PULL it free); B3 -> switch 3 opens the
    VAULT GATE. The treasure vault is VISIBLE from the start across the moat.
  * keep2 Triple Locks: same grammar, harder traversal — sinking west wall,
    bridge over a starry moat splitting the room, boxed block in the north
    hall; final switch opens BOTH the den door and the BIG KEY vault.
- FEEL: blocks are now TALL 2.5D stone pillars (procedural, lit top face +
  gold rune + shadow); pushing/pulling SLIDES smoothly (0.2s eased glide for
  Noah AND the block, dust on arrival) instead of tile-teleporting; new low
  'push' scrape jingle per shove + deep 'rumble' when a wall sinks.
- BUG FIXED EN ROUTE: a grab slide could outlive its grab (released when the
  block clicked into a switch outside updateGrab) and teleport Noah across
  the room on the NEXT grab. gSlide now dies with its grab.
- Tests: validator models solved machines pre-BFS (207 targets); playthrough
  physically solves both rooms stage-by-stage (incl. the pull extraction,
  walking the new bridges, and blocks-only switch enforcement). All 4 green.

## v6.1 (2026-06-13) — GOD MODE + kid-paced intro
- GOD MODE (playtesting): press G at the title — fresh game with every tool
  (net/harpoon/cage/bone), all gear (sandals/gloves/bracers/suit/wings), all
  world-map zones unlocked (coastPath/crown/cerberus + billy/keepOpen/sahor),
  99 coins / 60 gems / 5 keys / 3 big keys / 9 of every bait, 14 hearts; skips
  the intro; ESC = instant zone travel. Hint line on the title screen;
  keyCodes 71/78 mapped. Bosses still spawn (flags only gate doors/nodes), so
  every fight remains testable.
- INTRO SLOWED for young readers (~2x): cuddle scene 0-4.6s, Sahor swoop
  4.6-7.4s, the yoink 7.4-11s; world-map flight 11-21s; auto-advance 21.5s.
  SPACE still skips instantly. pixels.js shot times updated + new god-mode
  assertions (state, gear, zone unlocks). All 4 suites green.

## v6.2 (2026-06-13) — camera over-scan: lifted terrain at map tops unmasked
- BUG (reported): the rainbow-berry garden (elev-3 tiles in canyon rows 1-3,
  lifted 42px by EOFF) drew above world y=0 where the camera clamp cut it off.
- FIX: buildMaps computes m.topPad = max(e*EOFF - j*TILE + 26) over the top 7
  rows of each map (vale: 40, canyon: 52); the render camera (and the pixel
  harness mirror) clamps camY to -topPad instead of 0, revealing the lift with
  dark sky above the map edge. All 4 suites green.

## v7.0 (2026-06-13) — TROUBLE ON THE ROAD: 3 side-scroller ambush levels
- Quick fixes first: FENCE tile is a real wooden rail fence again (the tile-v2
  rewrite had folded it into plain grass — the sheep pen reads as a pen);
  CANYON is now a stepped PYRAMID (higher tiers pull in from the sides) and its
  summit is a RIFT SEA with the berry garden FLOATING in it — rainbow berries
  are truly wings-only (the old side corridors around the rift band are gone).
- NEW MODULE src/13_roads.js (~1000 lines): a Mario-style side-scroller mode.
  * Physics: gravity/variable jump/coyote+buffer, axis-separated AABB tile
    collision, squash & stretch, knockback, invuln blink, pit respawns.
  * Tiles: themed ground, one-way-look platforms, crates, spikes, coins (into
    the real wallet), springs, checkpoint flags. Stomping an enemy = a CAPTURE
    (credited to the real capture log). Hearts shared with the main game;
    wiping out restarts at the last flag with full hearts.
  * Enemies: walkers, hoppers (leaping sharks!), bobbing flyers, telegraphed
    dashers — all drawn from the existing creature sprite set per theme.
  * BOSSES (3 stomps each, dramatic drop-in, hp pips, telegraphs): THE TOLL
    GOAT (hop-chase with big leaps), THE GALE GULL (swoops; stunned on landing
    = stomp window), THE COMET WOLF (floor dashes; wall-crash dizzy = window).
    Each drops a heart container + 20 coins and joins the capture log.
  * THREE LEVELS: The Bramble Road (vale-coast, rolling hills + clouds),
    The Squall Strait (coast-wastes, storm clouds, rain, lightning flashes,
    waves), The Meteor Pass (wastes-canyon, 0.82x gravity, starfield, purple
    crags, telegraphed falling meteors). Parallax skies, new 'road' chiptune.
  * AMBUSH HOOK: world-map legs are densified; crossing the midpoint of a leg
    with an uncleared road interrupts travel (journey saved in pendingTravel),
    runs the level, and RESUMES the walk after victory. Once per route — the
    way home is peaceful. ESC retreats (road stays uncleared).
  * GOD MODE: 6/7/8 on the world map jump straight into the three roads.
- TESTS (all 4 suites extended + green):
  * validate: structural audit per level (spawn ground, widest bottomless gap
    jumpable per gravity, boss arena, checkpoint, no spawn hazards).
  * playthrough: physics unit (running jump clears the first gap), stomp ->
    capture-log unit, coin unit, and the FULL integration: travel -> midpoint
    ambush -> Toll Goat 3-stomp -> heart container -> travel resumes ->
    arrives at coast -> return trip ambush-free.
  * smoke: 300 chaotic frames in each road, zero errors.
  * pixels: per-road render + Noah-visible probes + screenshots (23_road_*).
- Found en route: world-travel banners/toasts were invisible in side mode
  (drawBannersToasts now runs there); straight world-map legs had only 2
  curve points (no midpoint to cross) — legs densify to 13 points.

## v8.0 (2026-06-13) — WORLD 2: THE UNDERBURROW (levels 5–8 + GNASH)
Built per WORLD2_UNDERBURROW_PLAN.md in 9 tested waves. New file `src/15_underburrow.js`
(loads after 14_world2.js); engine hooks threaded into the shared files.
- STORY: with Berkley & Megan home, GNASH the Hollow King drags Ramsi's plush family — the
  PILLOW-KIN (Mr. Ram, Beast Mimi, Toothless, Lucky) — underground. Noah & Ramsi dig down
  through four burrow-realms, freeing one Kin per level (each reawakens a Ramsi power) and
  besting its WARDEN, then run a gauntlet of all four and beat GNASH to bring the family home.
- 7 NEW RAMSI ABILITIES on ONE key (C, "Call Ramsi", context-dispatched): GLOW (passive light
  in dark burrows), SHRINK (ramhole→gate flag), PILLOW-BOUNCE (mushroom pad + X, scripted arc),
  PUFF-GLIDE (glidevent + C, carry across chasms), DECOY TAUNT (enemies/boss target Ramsi),
  ROLL-CHARGE (dash that smashes soft-blocks + bowls critters), GROUND-POUND (AoE stun ultimate).
  Each gated behind freeing its Pillow-Kin. `companionActive` generalized to zone 'burrow'.
- NO-FLY: `m.noFly` disables Angel-Wings flight on all burrow/vault maps (basic hop still works),
  so Bounce/Glide matter; validate teaches the new rules (soft-blocks pass w/ gear, holegap solid,
  bounce/glide landings reachable, rifts not wing-crossable on no-fly maps, compOnly targets skipped).
- 8 PROCEDURAL TILES (05_tiles): soil, rootwall, glowvein, crystal, softblock, holegap, bouncecap, updraft.
- 4 WARDENS (one shared co-op AI `up_warden`, mirrors the sky bosses): MOTTLE THE MOLE (Shrink→Grab),
  THORNBACK the root-spider (Decoy→Net), GEODE GOLEM (Glide+Roll→Harpoon), TREMOR-GRUB (Pound as it
  surfaces→Bone). Each is fought in its home level AND re-summoned in the finale gauntlet (fresh g_*
  flags so a home win still re-appears). FINAL BOSS GNASH: 3 phases × 3 hits (Pound surfacing → Roll
  boulders → Pound minions) → reunion cutscene → credits.
- MAPS (+10): burrowtest (dev bed), burrow5 Topsoil Tunnels, burrow6 Root Hollows, burrow7 Crystal
  Deep, burrow8 Hoard Descent (Glow→Shrink→Bounce→Glide→Roll→Pound ability chain), vault1–4 gauntlet
  dens, gnash_throne. ~Greenwood-Vale-sized; dark + Ramsi's Glow; secret heart-pieces in 5/6/7.
- ENTRY: a burrow opens in Greenwood Vale, gated on `flags.parents`; first entry plays the
  UNDERBURROW intro cutscene (Gnash dragging the Kin down). Sky ESC unblocks once parents are home.
  Burrow-aware quest HUD hints.
- ART: SHEET 11 (`sheet.underburrow.png`, 3×3) imported via import_art.py → boss.mottle/.thornback/
  .geode/.grub/.gnash + npc.kin1–4; Wardens/Gnash auto-override their stand-ins, Pillow-Kin render
  in-world and in both cutscenes.
- TESTS: all green — validate (335 targets / 30 maps), smoke, playthrough, features, features2, and a
  NEW `test/underburrow.js` full integration run (entry → 4 levels → gauntlet → GNASH → ending).

## v8.1 (2026-06-14) — UNDERBURROW REBUILT as open creature-worlds + combo dungeons
Owner feedback: the first pass was four cramped ability-gated "rooms"; World 2 should be big open
worlds where CATCHING animals is the main goal, abilities are earned over a whole world (by the
Warden), and dungeons should chain MULTIPLE tools/abilities in sequence. Reworked accordingly.
- WARDEN = the gate that grants the power. Wardens are now co-op HEADBUTT fights (Ramsi's sky
  headbutt drops the guard, Noah lands his tool — same proven pattern as the Skyward bosses), so
  no burrow ability is needed to beat one. Beating a Warden unlocks its caged PILLOW-KIN; freeing
  the Kin awakens the new Ramsi power, which then opens that world's exit. The chain never
  deadlocks (Mottle->Glow+Shrink, Thornback->Bounce+Decoy, Geode->Glide+Roll, Grub->Pound).
- OPEN CREATURE-WORLDS (new src/16_underburrow_maps.js overrides the old stubs): each level is a
  Vale-sized (64-72 x 40) organic cavern with roaming HERDS to round up (the main draw) — reusing
  the familiar Mimi roster, themed per world: sheep/ram/goat/snow-hare (Topsoil); octopus/jelly/
  crab/goat/ibex in sap-pools (Root Hollows); capricorn/ibex/star-pupil + a DECOY-guarded swarm
  (Crystal Deep); alien/condor/comet-pup/unicorn (the Hoard). Plus an NPC keeper and secrets.
- COMBINATION DUNGEONS that chain tools/abilities in sequence (escalating each world):
  * W5: HARPOON a post across the moat -> RAM-smash a crack -> BRACER a block onto a switch (bridge).
  * W6: SHRINK a hole -> HARPOON the sap-fall -> BRACER bridge.  (dark; lit by Ramsi's GLOW)
  * W7: BOUNCE a crystal shelf -> BRACER bridge -> HARPOON post.
  * W8 (master): SHRINK -> BONE a far switch -> BRACER bridge -> HARPOON post -> ROLL a soft-block.
  New BONE-SWITCH mechanic: the boomerang trips a walled switch across a pit (folded into the
  existing boneInteract, beside bone-latches & levers). Each world's earned power gates its EXIT
  (Shrink-hole / Bounce-ridge / Glide-chasm), so the new ability is used immediately.
- TESTS: full suite green incl. the rewritten test/underburrow.js (entry+intro -> 4 open worlds &
  Wardens -> gauntlet -> GNASH -> credits), plus per-world functional runs proving the herds,
  every combo step, the headbutt Warden + Kin-gating, and the ability exits. validate 340/30 maps.

## v8.2 (2026-06-14) — UNDERBURROW dungeons SEALED (no walk-arounds)
Owner feedback: in the open levels you could often just walk around the intended tool/ability.
Fixed structurally + added a guard.
- SEALED CORRIDORS: each dungeon (src/16_underburrow_maps.js) is now a single horizontal corridor
  band; everything above/below is rootwall (sealBand helper), and every gate spans the FULL band,
  so the only way on is THROUGH each mechanism. The open creature-areas stay big; only the dungeon
  path is tight. Chained gates per world (each REQUIRED):
  * W5: HARPOON the post -> RAM-smash the crack -> BRACER a block to bridge -> Mottle.
  * W6: SHRINK a hole -> HARPOON -> BRACER -> Thornback;  exit = BOUNCE over a sealed ridge.
  * W7: BOUNCE a shelf -> BRACER -> HARPOON -> Geode;  exit = GLIDE a sealed star-chasm.
  * W8: SHRINK -> BONE a ledge-switch over a gap -> BRACER -> HARPOON -> ROLL a soft-block -> Grub.
  Each world's earned power gates its EXIT (shrink-hole / bounce-ridge / glide-chasm).
- NEW GUARD test/_choke.js: a per-mechanic auditor — models the fully-solved dungeon, then disables
  ONE mechanic at a time (doors/chasm-cross/bracer-bridge/crack/soft-block/bounce-glide) and asserts
  every Warden & exit becomes UNREACHABLE. Catches walk-arounds that validate (lenient, full-gear)
  misses. Result: "TIGHT — every Warden & exit requires its intended mechanics."
- test/_solve.js: plays all four dungeons' intended chains end-to-end (every gate opens/crosses) —
  proving the tight layouts are still solvable. Full suite + underburrow integration stay green.

## v8.3 (2026-06-14) — SAVE SLOTS + click-outside-to-close
- SAVE SLOTS (3): per-slot localStorage keys (buffNoahQuest_v4_s0..2); Game.saveSlot tracks the
  active slot; save/load/hasSave/newGame all operate on it. The old single-key save auto-migrates
  to slot 0 on boot (migrateSlots). Title screen is now a SLOT PICKER: each slot shows its zone +
  hearts + caught count (Game.slotSummary); arrows/1-3/click to pick, ENTER/click to play (continue
  or start fresh), N = new game, X/Del = erase, and G god-mode / U Underburrow now launch into the
  selected slot. Verified: per-slot isolation, summaries, erase, migration.
- CLICK-OUTSIDE-TO-CLOSE: UI.drawMenu records the panel + shopkeeper-face rects; UI.handleClick
  closes any open menu (shop/trade/bait/log) when a click lands outside it (clicks inside, or on an
  item row, behave as before). Verified for shop & trade menus.
- Full suite stays green (the title-input rework is compatible with the test harness).

## v8.4 (2026-06-14) — LEVEL EDITOR (level_editor.html)
A standalone, single-file visual level editor (open it in a browser; no build/server needed).
- FAITHFUL TILES: embeds the game's actual paintTileBase + TILEDEFS, so the 51 tiles render
  pixel-identical to the game.
- PAINT: pencil / rectangle (shift = erase) / flood-fill / eraser, with pan (right- or alt-drag)
  and wheel-zoom; toggleable grid; map props (id, fn name, W/H + Resize, base tile, zone, song,
  cliff, dark/noFly/dungeon).
- OBJECTS: place/move/delete 19 types (chest, sign, npc, boss, portal, door, spawn, link, post,
  lever, block, ramhole, boneswitch, bouncepad, glidevent, pillowkin, ramswitch, warp, prop) +
  the START tile; an Inspector edits the selected object's properties as JSON; bounce/glide draw
  a line to their target, spawns draw their region.
- EXPORT CODE: emits a ready-to-paste buildXxx() using the game's own helpers — tiles greedy-
  rectangle-compressed into R()/T(), plus CHEST/SIGN/NPC/DOOR/SPAWN/LINK/POST/OBJ and m.start.
  Verified by a round-trip test: editor map -> exported code -> rebuilt map is byte-identical.
- JSON save/load for re-editing; Ctrl+Z undo. (The old map_editor.html is the separate overworld
  node positioner.)

## v8.5 (2026-06-14) — first CUSTOM LEVEL wired in: "NOAH'S ICE FIELD"
- customlevels/noahsicefield.json (built by Noah in level_editor.html) is converted to a builder
  function in the new src/17_customlevels.js (id 'icefield', tagged m.custom), built at module load.
- SECRET ENTRANCE: a hidden ice-cave (rock-framed snow-steps + a hint sign) added to Greenwood
  Vale's snowy summit via Game.addCustomEntrances() (boot hook, beside addBurrowEntrance); stepping
  on the steps LINKs into the Ice Field at its start, and a return LINK by the start hops Noah back
  onto the summit.
- The strict reachability validator now skips m.custom maps (so kid-made levels aren't "corrected").
  Full suite green (31 maps); new test/_icefield.js verifies entrance -> level -> exit.
- Notes (faithful to Noah's design): the Mottle bosses roam as obstacles (Ramsi's headbutt only
  arms in burrow/sky zones, so they can't be 'caught' here and won't touch Underburrow progress);
  the warps teleport to the map corner as built.

## v8.6 (2026-06-14) — Ice Field: fightable bosses + findable entrance
- CUSTOM BOSS FLAGS (engine): a boss object may carry a `flag`; loadMap gates/spawns on it and
  Bosses.finalize routes the win to THAT flag (loot + banner) instead of the global progression
  flag. So custom-level bosses are real, beatable fights that never touch main-game progress.
- NOAH'S ICE FIELD now uses solo-beatable WORLD-1 bosses (King Billy: harpoon mid-charge then GRAB;
  Cerberus: bone while drowsy then GRAB), each on its own ice_b* flag. (Mottle/Wardens need Ramsi's
  headbutt, which only arms in burrow/sky zones — wrong for a snowy field.)
- ENTRANCE is now a bright FROZEN-RIFT portal on the Vale's snowy summit (elev-1, reachable by the
  snow steps) with three signposts (one down in the meadow pointing players up the summit). Easy to
  find. A return link drops Noah back beside the rift.
- customlevels/noahsicefield.json updated to match (bosses + flags + exit + signs); validate skips
  m.custom maps; full suite green (31 maps); test/_icefield.js covers entrance, beatable boss on its
  own flag (main flags untouched), and exit.
- HOW TO SPECIFY BOSSES in the editor for a custom level: place a Boss object, set its `boss` to a
  World-1 boss (billy / cerberus / twinkle), and in the Inspector add  "flag": "myboss1"  so beating
  it stays isolated to your level.

## v8.7 (2026-06-14) — FIX: Vale entrances never appeared in the browser (load order)
- ROOT CAUSE: `if (!IS_NODE) bootGame();` ran at the END of 12_main.js, i.e. BEFORE files 13-17
  executed. So when bootGame's hooks ran `if (Game.addBurrowEntrance) ...` / `... addCustomEntrances`,
  those functions (defined in 15 & 17) were still undefined -> both Vale entrances were silently
  skipped. (Tests passed only because the node harness calls bootGame a SECOND time, after the full
  eval.) The Underburrow's Vale entrance was affected too; it just hadn't been noticed (the U
  shortcut loads burrow5 directly).
- FIX: defer the browser auto-boot one tick -> `if (!IS_NODE) setTimeout(bootGame, 0);` so the whole
  concatenated script (incl. the entrance hooks) has loaded before bootGame runs. Verified with a
  faithful browser-boot simulation: vale now has BOTH the ice-field portal (14,5) and the Underburrow
  entrance (24,20). Full suite still green.

## v8.8 (2026-06-14) — Noah's rift is now a hidden, 5-tool reward with self-looping warps
- HIDDEN BEHIND THE MOUNTAIN: the Frozen Rift moved to the very top of the summit (vale 8,1),
  tucked behind the central peaks. It is now a `secret` portal: it does not render and cannot be
  entered until the player owns all five tools, so it reads as a genuine end-game secret.
- 5-TOOL GATE: portal `req:'tools5'` -> new computed flag in Game.lookupFlag ('tools5' = mitts(free)
  + net + cage + harpoon + bone). Inactive AND invisible until all are owned; once owned the rift
  appears and opens. (12_main portal step + render both route through lookupFlag; render early-outs
  on `secret && locked`.)
- HINT SIGNS REMOVED: the three summit/meadow signposts are gone (no more hand-holding).
- WARPS LOOP TO EACH OTHER: the four in-level warps now chain (8,1)->(17,6)->(28,22)->(4,25)->(8,1)
  instead of every pad dumping you back at the entrance, so they read as a connected circuit.
- customlevels/noahsicefield.json updated to match (warp targets + exit); buildIceField regenerated.
- test/_icefield.js rewritten: asserts the rift is hidden/inert without the 5 tools, appears+opens
  with them, has no hint signs, that warp (8,1) loops to the next pad (17,6), and the exit returns to
  the summit. Full suite green (validate 340 / smoke / playthrough / features / features2 /
  underburrow) and the real deferred-boot simulation still shows both Vale entrances.

## v8.9 (2026-06-14) — Granny's Menagerie: the cottage is now a living zoo
- NEW INTERIOR (src/18_grannyzoo.js): the cottage door in the Vale (34,8) now opens into
  "Granny's Menagerie," a walled trophy room with FOUR fenced enclosures:
    * THE TANK   — water pool for swimmers (octopus, jellyfish, shark, capricorn)
    * THE AVIARY — a big fenced bird cage (condor + future flyers), with a perch
    * THE PADDOCK— grass pen for land grazers (sheep, ram, goat, snow hare, ibex, crab)
    * THE STAR PEN — a starry skyfloor pen for the cosmic critters (star pupil, alien,
      unicorn, comet pup, dragon)
  Each pen has a label sign; Granny greets you by the entrance; an exit drops you back in
  the meadow by the cottage.
- POPULATES FROM YOUR INVENTORY: on entry, Game.populateZoo reads flags.life_<species> and
  fills each pen with the matching animals (up to 4 of each so the pens stay readable). Walk
  out and back and it re-reads your current collection. Empty inventory -> empty pens.
- DISPLAY ONLY: penned animals wander but can never be re-caught — guarded in checkToolCatch
  (skip c.display), the skittish-flee AI, and the boomer-bone stun. Caught counts/log are
  untouched when you swing at an exhibit.
- TESTS: new test/_zoo.js (14 checks: door wiring both ways, right-bin sorting, counts mirror
  inventory, 10-shark pile capped to 4, net-on-exhibit catches nothing, empties when emptied).
  Full suite green — now 32 maps / 348 reachable targets. Snapshot in shots/zoo.png.

## v9.0 (2026-06-15) — Art pipeline: hi-res *.big.png overrides + Cerberus restored
- BUG: re-slicing sheet.bosses.png had clobbered the good CERBERUS art with the tiny sheet cell.
- FIX + FUTURE-PROOFING: import_art.py now runs a SECOND pass — after slicing all sheets, any
  assets/raw/<key>.big.png is converted OVER assets/<key>.png, so hand-made hi-res art always wins.
  (First pass now skips *.big.png; second pass applies them.) Re-running the importer changed ONLY
  boss.cerberus.png (verified by md5 diff of the whole assets/ folder).
- Cerberus is once again the fierce flaming three-headed hellhound (from boss.cerberus.big.png).
- Megan & Berkley: confirmed their cutscene art (boss.parents / boss.parentsfree) is already current
  from sheet.skyworld.png — no change needed; the reunion cutscene renders the celebrating couple.

## v9.1 (2026-06-15) — WORLD 3: Cogwerk City (Level 1), a "with-Ramsi" adventure
- NEW WORLD + ZONE 'city' (companionActive now includes it, so Ramsi + all her skills work there).
  Quick-start from the title screen with the letter **C** (cityStart: Ramsi joins with her FULL
  burrow skill-set unlocked; loads map 'cog1').
- HOST: the SUPREME TRADER, rendered EXTRA-LARGE on the map and as his dialogue portrait (art copied
  to assets/scene.trader.png -> Sprites.scenes.trader; new generic NPC `bigArt`/`big` fields drive a
  large draw, mirroring GNASH). He gives the quest: gather 4 STAR-CELLS to fuse RAMSI's SUPER-FORM.
- STAR-CELL collectible system: flags.starcells{}, collectStarcell, starcellCount, autoPickup +
  SPACE pickup + a glowing on-map render (gold star + cyan rings). Level 1 holds the first cell.
- LEVEL 1 = an industrial-clockwork vertical gauntlet that CANNOT be walked around (noFly). Five
  hard skill-gates in sequence: BOUNCE up the rampart -> GLIDE the steam-chasm -> SHRINK through a
  service grate (ramhole latch) -> ROLL through a gear-barricade (softblock) -> POUND the vault
  plate. Plus an open plaza with catchable cog-bugs/gear-hawks for the spacious creature-world feel.
- NEW MECHANIC: 'poundplate' — Ramsi's GROUND-POUND now slams a floor-plate to open a gate
  (15_underburrow startPound hook + 12_main draw). The vault is guarded by un-catchable 'cog-sentinel'
  display-creatures so a C-press reliably POUNDS (not rolls) and the route can never soft-lock
  (spawned via a new reusable loadMap `m.onLoad` hook).
- City-specific questHint; title-screen shortcut list now shows "C Cogwerk City (W3)".
- TESTS: new test/_cogwerk.js (18 checks) drives the whole gauntlet bounce->glide->shrink->roll->
  pound->star-cell and the Trader quest. Full suite green (33 maps). Shots: cog_plaza, cog_vault.
- SCOPE: Level 1 only, as requested. Reached via the title shortcut for now; a world-map node/own
  overworld for World 3, the remaining 3 star-cells, and the super-form FUSION payoff are the next
  steps. (City uses the 'canyon' song for now — a dedicated track can come later.)

## v9.2 (2026-06-15) — Cogwerk City reworked: real clockwork art, open level, fixed Trader
- FIX (Trader's fake transparency): supreme.trader.png had an opaque near-white background baked in
  (a white box in-game). Now keyed out with the pipeline's bg_mask (border flood-fill that preserves
  white sprite interiors), trimmed, saved as assets/scene.trader.png — clean transparency, white
  chest/eyes intact.
- NEW CLOCKWORK TILE ART (procedural, 05_tiles.js): cogfloor (brass riveted street-plate), gearwall
  (machinery wall with a gear emblem + rivets), pipe (copper pipe), cog (big gear pillar), steam
  (animated iron vent). Registered in TILEDEFS. The city finally LOOKS like a clockwork city.
- LEVEL 1 REDESIGNED (was a boring linear 5-gate corridor): now an OPEN brass plaza — 21 catchable
  cog-bugs/gear-hawks/sheep, a central gear-fountain, pipe-runs, gear pillars and steam vents — ringed
  by THREE skill-spokes you can do in ANY order: ROOFTOP GARDENS (BOUNCE, twice, for a gem cache),
  the STAR-CELL VAULT (SHRINK the grate, then POUND the gear-plate), and THE SCRAPWORKS (ROLL the
  barricade, then GLIDE the steam-gap). Each spoke has chests/critters; noFly still forbids bypassing.
- test/_cogwerk.js rewritten for the hub-and-spokes layout (19 checks incl. 21 catchable critters,
  brass cogfloor skin, all five skills, the star-cell, the Trader quest). Full suite green (33 maps).

## v9.3 (2026-06-15) — Cogwerk City, take 2: living machinery + real skill-chains
- TURNING GEARS: new animated 'gear' object (rotates with Game.time — teeth, spokes, hub, dir/speed/
  radius fields). The city now TICKS: a central counter-rotating FLYWHEEL on a raised base, gears
  churning in the clocktower's steam-gap, landmark cogs on every building. 15 gears in level 1.
- VARIED WALLS: gearwall now varies by vseed — mostly plain riveted brass panels, with the occasional
  gear emblem / pressure-gauge / vent-grille. No more wall-of-identical-gears monotony.
- MOVING GEAR-TROLLEY: the asteroid platform system is reused + restyled as a brass gear-trolley
  (city zone draw). It CARRIES Noah across a steam-gap (verified) — real timing-based traversal.
- LEVEL 1 REBUILT around genuine movement, not single gates:
  * THE CLOCKTOWER (center) — the STAR-CELL is now a real 4-skill CHAIN: BOUNCE up -> GLIDE the
    steam-gap (gears churning) -> SHRINK a vent to drop the grate -> POUND the gear-plate. A climb.
  * THE FLYWHEEL HALL (east) — ROLL through the barricade, then RIDE the moving trolley across the gap.
  * THE ROOFTOP GARDENS (west) — BOUNCE up (twice) to catch gear-hawks + a gem cache.
  * THE PLAZA — open brass square, central flywheel, 24 catchable critters, pipes/vents/cogs.
- test/_cogwerk.js updated (18 checks incl. the 4-skill chain, the trolley carry, 15 gears, 24
  critters). Full suite green (33 maps).

## v9.4 (2026-06-15) — Catching MATTERS: clear-the-city gate + diverse pest AI
- NEW CREATURE AI (07_entities.js): two new behaviours join skittish/feisty/armored —
  * aggressive: the creature CHASES Noah within its aggro range and zaps on contact (uses sting).
  * charger: telegraphed wind-up then a fast straight-line DASH, then a cooldown.
  drawCreature gained a `sprite` alias so new species can reuse existing art.
- 4 NEW COGWERK PESTS: VOLT-BUG (aggressive chaser, zaps), COG-HOPPER (skittish — flee speed 96 > 
  Noah's 88, so you must throw the net or bait a cage, not just walk up), RUST-BEETLE (armored —
  BONE-stun then net, or a tin-can cage), STEAM-BULL (charger + feisty). (Art is borrowed from
  existing creatures for now; a dedicated clockwork-pest sheet would make them look the part.)
- CLEAR-THE-CITY QUEST: the Supreme Trader explains the haywire critters have FOULED the Clocktower
  and hands over a carryable MASTER-GEAR (it bobs/turns above Noah's head). The plaza is overrun by
  10 pests (spawned in onLoad until cleared). Catching the LAST one trips cog_cleared. Then you SOCKET
  the master-gear at a new gear-socket at the Clocktower base (new 'gearsocket' object) -> cog_started.
- GATING: the Clocktower bounce-pad now carries `req:'cog_started'` (tryBounce refuses + shows
  "JAMMED" until socketed). So the whole skill-chain is locked behind clearing the city — catching is
  the gate, exactly as asked. Quest-hint walks the player through clear -> socket -> climb.
- test/_cogwerk.js rewritten (13 checks): pest roster + behaviour flags, aggressive-chase and
  skittish-flee verified by motion, flee-faster-than-walk, JAMMED bounce, socket-refuses-then-accepts,
  clear-trips-the-flag, chain-opens-after-socket. Full suite green (33 maps).

## v9.5 (2026-06-15) — Cogwerk fixes: real danger, sealed star, gear-after-clear
- FIX (invulnerable Noah): Ramsi's passive auto-daze (flags.ramStun) stunned any critter within 14px,
  so nothing could land a hit. Added a `dazeImmune` creature flag; the auto-daze now SKIPS it. New
  pest SPARK-DRONE (aggressive + dazeImmune + sting 1) shrugs off the daze and actually HURTS Noah —
  you must keep your distance and net it (Ramsi's shield still blocks one hit per 6s).
- FIX (bounce to the star without clearing): the real leak was row y1 — only y0 was a border wall, so
  y1 was an open corridor across the whole map above the separators. Made the top border 2 thick; the
  clocktower is now provably unreachable until cleared (reachability audit: 0 clocktower tiles).
- FIX (stuck rust-beetle): a pest spawned inside a building wall. Pests are now placed via a spiral
  walkable-tile search, so none can spawn stuck/unreachable (audit: 12 pests, 0 stuck).
- FIX (gear too early): the Supreme Trader now WITHHOLDS the master-gear until the city is fully
  cleared — first talk gives only the quest; after clearing, talk again to receive the gear, then
  socket it. Quest-hint and banners updated for clear -> see Trader -> socket -> climb.

## v9.6 (2026-06-15) — WORLD 3 Level 2: THE PIPEWORKS (revived pond, Lady of the Lake, star #2)
- NEW MAP cog2 'The Pipeworks' (zone city, noFly): a debris-gated piping maze. ROLL Ramsi through
  SLUDGE walls (softblock) and RAM the CRACKED ones (crack, Ram Suit lunge) to clear EVERY pipe.
  Smashes leave cogfloor in the city; a new Game.onCitySmash hook checks for remaining debris.
- RESTORE THE FLOW: clearing the last clogged pipe floods a dried pond (sand -> water). The sad fish
  (display octopus/jellyfish) that flopped on the cracked bed can suddenly SWIM (the sand->water flip
  makes them walkable/animate) — a free "revival" with no extra code. The LADY OF THE LAKE then grants
  STAR-CELL #2 (reuses the mystical 'spirit' face/sprite + a new 'lady' dialogue branch).
- WIRED: a pipe-portal from the Cogwerk vault (cog1 24,2) down into the Pipeworks; an exit portal back.
  Reachability audit: all 7 debris + the Lady + the exit reachable. Quest-hint tracks "[N clogged]".
- TESTS: test/_pipeworks.js (12 checks) — dried bed, gasping fish, real ROLL + RAM clears, flow
  restored, pond floods, fish swim, Lady grants the star, portal wired. Full suite green (34 maps).
- Engine: NPC map-sprite fallback (unknown `who` -> spirit) so the Lady renders without new art.

## v9.7 (2026-06-15) — cog1 rebuilt as a STRICTLY LINEAR climb (no dead-ends/skips/sidesteps/stuck)
- The hub-and-spokes layout had real problems: the Rooftop spoke was a dead-end you couldn't leave;
  the Flywheel's roll-softblock let you bust through and side-step; the stages had no clear order.
- REBUILT cog1 as two linear stages: STAGE 1 the open PLAZA (clear the pests, socket the gear) ->
  STAGE 2 a vertical stack of FULL-WIDTH skill-gated ledges: BOUNCE up -> GLIDE the steam-gap ->
  SHRINK a vent -> ROLL the barricade -> POUND the plate -> STAR-CELL + the PIPE to Level 2.
  Every band spans the whole width with exactly ONE skill-opening, and the only soft/rollable tile is
  the roll-gate itself — so nothing is skippable, side-steppable, or a dead-end, and the only one-way
  step (the entry bounce) never strands you (ESC always returns to the World-3 map). Reachability
  audit: star UNREACHABLE without socketing; fully reachable through the gates with skills; all ledges
  connected. Removed the rooftop/flywheel/trolley spokes. test/_cogwerk.js updated (18 checks).

## v9.8 (2026-06-15) — WORLD 3 gets its OWN map + a Vale gate (ESC no longer dumps you in the Vale)
- NEW STATE 'world3map': a dedicated World-3 level-select with a procedural CLOCKWORK backdrop (four
  big turning gears), nodes for COGWERK CITY and THE PIPEWORKS (pipe-linked; the Pipeworks gated on
  star #1 'sc_cog1'), and a GREENWOOD VALE exit node back to World 1. Arrow/click to choose, SPACE to
  enter. WORLD3_NODES drives it; lookupFlag now resolves 'sc_*' star-cell reqs.
- ESC ROUTING: pressing ESC in any city-zone level opens the WORLD-3 map (cursor on the current
  level), NOT the Vale. ESC elsewhere still opens the original overworld.
- HOW YOU GET THERE FROM THE VALE: a great CLOCKWORK GATE now stands in Greenwood Vale (30,18); it
  opens to Cogwerk City once RAMSI is your companion (req 'ramsi'). Wired via Game.addCogwerkEntrance
  in bootGame/buildAll (after buildMaps), like the other Vale entrances.
- test/_world3map.js (10 checks): Vale gate + req, the three nodes, ESC opens the World-3 map, the
  Pipeworks unlock gate, entering each node, the Vale exit, and that ESC in the Vale still uses the
  original map. Full suite green (350 targets / all maps).

## v9.10 (2026-06-15) — Pipeworks reborn: carve-the-water-path puzzle + new pipe tiles
- THE PIPEWORKS is no longer open chambers — it's a near-SOLID block (1124 tiles) of alternating
  CRACK bands (Noah RAMs) and SLUDGE bands (Ramsi ROLLs), studded with UNBREAKABLE big pipes to route
  around. Enemy monsters removed (only the pond fish remain), per request.
- WATER FLOWS DOWNHILL: a SOURCE pours from the top; Game.floodPipes floods from it down/left/right
  (never up) through whatever tiles you've carved, painting them as a flowing 'wetpipe' channel. Carve
  a connected DESCENDING path and the water reaches the dried POND -> it floods (sand->water), the
  gasping fish SWIM, and the LADY OF THE LAKE grants STAR-CELL #2. A half-carved/uphill path does NOT
  reach the pond (verified) — you have to cut the RIGHT route. Runs on every ram/roll via onCitySmash.
- NEW PIPE TILES (05_tiles.js): pipefe (iron) and pipebr (brass) 1-tile pipes, bigpipe (fat unbreakable
  main), and wetpipe (a walkable channel running with animated water). The works are lined with them.
- Audit: with the mass fully carved, water provably reaches the pond (solvable). test/_pipeworks.js
  rewritten (15 checks: solid mass, no monsters, source+pond, new tiles, ram/roll carve, water flows
  in, half-path fails, full path floods the pond, fish swim, Lady grants the star). Full suite green.

## v9.11 (2026-06-16) — Pipeworks: a pipe-MAZE + reliable pond fill + horizontal/angle pipes
- FIX (pond didn't fill): floodPipes now floods by plain CONNECTIVITY — water fills every tile your
  carved channel connects to the source (any direction), so as long as your channel reaches the pond,
  it floods (and revives the fish). No more "water runs but the pond stays dry."
- THE MAZE: the unbreakable big pipes now form a real maze — five UNBREAKABLE horizontal SHELVES
  (bigpipeh) with gaps that alternate left/right, so you CANNOT ram straight down; you must switch-back
  through the offset gaps (carve down, sideways to the gap, down, the other way...). Audit proves a
  straight-down carve never reaches the pond, while the switchback does.
- NEW PIPE TILES: bigpipeh (HORIZONTAL fat pipe) + four ANGLE elbows (bigpipe_dr/dl/ur/ul) joining the
  shelves to the side mains, plus the existing iron/brass colored 1-tile pipes. (Per request: a
  horizontal pipe and angle tiles.)
- test/_pipeworks.js updated (14 checks: solid mass + shelves, no monsters, new tiles, ram/roll carve,
  STRAIGHT-DOWN blocked by the maze, SWITCHBACK floods the pond, fish swim, Lady grants the star).
  Full suite green (350 targets / all maps). Shot: pipeworks_maze.

## v9.12 (2026-06-16) — Pipeworks made clearly completable (smaller maze, pond spans the bottom)
- DIAGNOSIS: the flood/fill logic was correct (audit: pond carve-reachable + flooding the carved space
  fills it), but the breakable region was huge — 36 wide x 33 tall (~1048 tiles) with FIVE switchbacks
  and thick bands — so connecting source->pond was a slog and easy to miss ("water runs but pond stays
  dry"). Practical, not a code bug.
- REBUILT compact: cog2 is now 26x24 with a breakable region of just 24x10 (~205 tiles). TWO clear
  switchbacks (two unbreakable horizontal shelves with WIDE offset gaps) — still can't ram straight
  down (audit confirms), but short and obvious. THIN bands (2-3 rows). One big instructional sign.
- THE POND NOW SPANS THE WHOLE BOTTOM (x2..23): the final drop ALWAYS lands in it, so the water can't
  miss the fish. Verified by a faithful carve sim using the REAL ram/roll+flood hooks: the switchback
  carve floods the pond and all four fish end on water tiles.
- test/_pipeworks.js updated for the compact layout (14 checks). Full suite green (350 targets).
  Shot: pipeworks_small_done.

## v9.13 (2026-06-16) — Pipeworks = your 36x33 maze, used faithfully + the pond reliably fills
- DIAGNOSIS of "pond doesn't fill": with open '.' channels + breakable '#', the channels already
  reached the pond, so the MIN carve was 1 wall (trivial) and the maze didn't matter; and as a solid
  block you couldn't SEE where to dig. Both confirmed by a faithful (real ram/roll) sim + a min-cut audit.
- NOW your maze is used directly: '#' -> UNBREAKABLE pipe walls (gearwall, dressed with bigpipes +
  iron/brass pipes), '.' -> BREAKABLE corridors (ROLL the sludge, RAM the cracked seams). 732 wall
  tiles, 512 carve-able corridor tiles.
- WATER-FOLLOWS-CARVE (reliable): water flows only through what you've CARVED (+ the source). It pours
  from the top opening; carve a channel through the maze corridors and the water follows it down — when
  it reaches the dried POND at the bottom, the pond floods and the fish revive (the Lady then gives
  star #2). The pond stays dry until your channel actually connects, so it can't "run but not fill".
- SOLVABILITY GUARANTEED: a Dijkstra pass opens the minimum wall-seams needed so a carve-route always
  exists; min carve to the pond is 58 corridor tiles (a real maze, not a 1-wall shortcut). Audited.
- test/_pipeworks.js rewritten (13 checks: maze walls + corridors, source, pond dry-until-carved,
  solvable route, ram clears a seam, carving floods the pond, fish swim, Lady grants the star).
  Full suite green (350 targets). Shots: maze_solid, maze_flooded.

## v9.14 (2026-06-16) — SMART WATER: it runs downhill, fills the sand, never floods wrong pipes
- Two bugs reported on the maze build: (1) the sand pond still didn't fill in real play, and
  (2) once water was released it also filled "incorrect" maze paths not connected to the source.
- ROOT CAUSE (proved with a faithful sim): floodPipes used an OMNI-directional connectivity flood.
  With the minimal route it behaved, but in real play (where you carve extra/wrong branches) water
  CLIMBED UP into dead-end pipes and backed up through the full-width collector into unrelated
  branches — which both looked wrong AND masked the fact the channel hadn't actually reached the
  bottom, so the sand "never filled". Diagnostic: a carved dead-end going UP filled 6/6 tiles (bad).
- FIX — GRAVITY FLOW: water now spreads from the source DOWN and SIDEWAYS only, NEVER up. So it pours
  down the carved channel and pools in the pond (a top-fed basin), but can't climb dead-ends or back
  up into disconnected upper pipes. Same dead-end-up test now fills 0/6; pond fills 160/160 sand tiles.
- The guaranteed carve-route opener (Dijkstra) is now down+sideways-only too, so the always-solvable
  route is gravity-compatible (water can actually run its length). Quest hint + sign say "runs DOWNHILL".
- Player feedback is honest now: water visibly descends as you carve and STOPS at the lowest point you've
  reached (pond stays dry) until your channel truly connects to the bottom collector — then the whole
  pond floods and the fish revive. Shots: pipe_solid, pipe_midcarve (water mid-descent, pond dry),
  pipe_flooded (pond full).
- test/_pipeworks.js: now carves only the MINIMAL route (realistic) and adds two SMART-WATER guards —
  a sealed dead-end going UP stays dry, and a carved pocket cut off from the source stays dry. 18/18.
  Full suite green (828 checks).

## v9.15 (2026-06-16) — THE fix: the pond fills on a COMPLETED channel, every time (siphon-proof)
- Report: completing the water path still didn't fill the bottom pond — "every time". My tests passed,
  so my sim was lying. Built a faithful diagnostic and found the real cause.
- ROOT CAUSE: the maze's carveable corridors are 1-tile-wide WINDING TUBES. A path through them almost
  always SIPHONS — it dips into a sealed pit, and the only way onward is UP and over a barrier. The v9.14
  "gravity, never up" water literally COULD NOT climb a siphon, so it stalled at the first low point and
  the pond stayed dry. Proof: a sealed up-and-over channel filled 0/160 under gravity. My earlier test
  only ever carved an idealized straight-down route, so it never hit a siphon — that's the test gap.
- FIX (fundamental): pond completion is now decided by CONNECTIVITY, not gravity. If a continuous OPEN
  channel links the source to the pond in ANY direction, the pond fills — exactly like real plumbing,
  where water under pressure runs up and over a siphon. Same sealed channel now fills 160/160.
- Kept the nice look: water still visibly runs DOWNHILL as you carve (gravity flow for the descending
  picture, never climbing into dead-ends or backing up into unrelated branches), and when the channel
  completes we also light up the actual source->pond route so a siphon climb reads as full water.
- Robustness: floodPipes self-heals its water bookkeeping; onLoad re-fills the pond if already solved, so
  a solved Pipeworks stays alive across save/reload and re-entry (tiles aren't persisted in saves).
- New test/_siphon.js (THE regression: a sealed up-and-over channel must fill the pond; sealed pockets
  stay dry). _pipeworks smart-water guards still hold. Full suite green (832 checks).

## v9.16 (2026-06-16) — Pipeworks polish, random mazes, star cutscenes + WORLD 3 LEVEL 3: THE HIGH ROOFS
- PIPEWORKS polish: removed the per-smash "RAM SUIT busts through" banner spam; SPACE now RAMS a faced
  cracked brick (ram-priority) instead of a nearby SIGN hijacking the press; sign nudged one tile left;
  Ramsi's roll-WHIRL now STOPS at unbreakable walls (no phasing). 3 maze variants (your original + 2
  generated), a RANDOM one rolls each fresh attempt for replay value (all guaranteed solvable).
- STAR CUTSCENE: every Cogwerk-series star-cell now plays a short glowing celebration.
- BLAZAGON processed from assets/raw/blazagon.png -> game sprite (boss.blazagon) + dialogue portrait
  (scene.blazagon) + a procedural creature sprite; CREATURES.blazagon (skittish, NET-only, big).
- NEW LEVEL — cog3 "The High Roofs" (World 3, level 3): a looser rooftop maze 100 ft up. New tiles:
  roof/roofb decks, parapet lips, the deep SKY-GAP void (a 'hole' -> miss a jump = lose a heart, respawn
  on your last roof), acunit + skylight clutter. Traversal: WALK, JUMP (X) small gaps, GLIDE (C) at
  glide-points, and HARPOON (tool 3) the brass ANCHORS to ZIP across / REEL up / SWING over chasms
  (new harpoon `land` option for swings). The prize: mighty BLAZAGON prowls the high roost and flees —
  corner him with your moves and NET him (Z) for STAR-CELL #3 + a celebration. Entry on the World-3 map,
  gated behind the Pipeworks star (sc_lady).
- TESTS: new test/_rooftops.js (15 checks: roofs+void, no-walk-off, anchors/glide, Blazagon net-only,
  harpoon grapple, catch->star#3+cutscene, world-map gating); _world3map updated for the new node.
  Full suite green. Shots: cog3_layout, cog3_play.
- NOTE: a file-sync hiccup truncated a few source mounts mid-session (04_sprites/05_tiles/08_player);
  all were restored from the intact copies and verified (full suite green).

## v9.17 (2026-06-17) — High Roofs 3x wide + gap hierarchy + facades + Blazagon chase; World-3/4 art & boss design
- THE HIGH ROOFS rebuilt at 3x width (144 tiles, 10 towers). TRAVERSAL HIERARCHY enforced by placement:
  JUMP (X) only crosses the SMALL 2-tile gaps; HARPOON (tool 3 -> brass anchor) crosses the MEDIUM gaps
  (too wide to jump); GLIDE (C glide-point, NO anchor) crosses the WIDEST chasms (too wide to jump or
  harpoon). Jumps alone can no longer traverse the map.
- BUILDING FACADES: each tower's windowed wall now renders from its roof's edge down to the screen base
  (lit windows, cornice, pilasters), with deep void between towers — a real "100 ft up" skyline.
- BLAZAGON CHASE: he now BOLTS to a new tower each time you net him (4 escapes across the skyline) and is
  only truly CAUGHT on the last roof -> STAR-CELL #3 + celebration. Chasing him = traversing the whole map.
- cog3 quest-hint added. test/_rooftops rewritten (15 checks: 3x width, anchors/glide counts, glide spans
  too wide to jump, harpoon grapple, facades, the multi-hop chase -> star). Full suite green.
- DESIGN DELIVERABLES: ASSETS_WORLD3.md (sheet prompts for Blazagon, rooftop tiles, roof props, cutscene
  STAR graphics, and SUPER RAMSI) and BOSS_FINALE.md (GNASHARA the All-Beast: a 7-head monstrosity, one
  head per prior boss, each KO'd by that world's mechanic, finished by Super Ramsi's star-blast).

## v9.18 (2026-06-17) — World-3 art is IN: sheets sliced + wired into the game
- Imported all 6 new sheets (import_art SHEETS + sizes) into individual assets, plus the two Lady singles:
  - sheet.cogcreatures (2x5) -> creature.{voltbug,coghopper,rustbeetle,steambull,sparkdrone}.a/.b
  - sheet.blazagon (2x2) -> creature.blazagon.a/.b/run/leap
  - sheet.superramsi (2x2) -> boss.ramsisuper.a/b/charge/blast
  - sheet.stars (3x2) -> item.starcell/starcelldim/superseal, fx.starburst/starsmall, prop.ribbon
  - sheet.roofprops (3x1) -> prop.anchor/glidepuff/antenna
  - sheet.rooftiles (4x3) -> tile.* (facade + acunit + skylight + walls)
  - scene.lady (custom keyed portrait) + npc.lady
- WIRING (04_sprites): external-only creatures now install without a base grid; added 'tile' (TileArt
  override + facade store), 'fx' (Sprites.fx), and registered Super Ramsi in EXT_BOSS_KEYS.
  - 07_entities: the 5 Cogwerk pests point at their OWN sprites (+ a safe drawCreature fallback).
  - 11_ui/09_systems: Lady dialogue uses her scene.lady portrait (spirit fallback).
  - 05_tiles: building FACADES render from the HD facade tiles (procedural fallback); acunit + skylight
    tiles overridden with HD art.
  - 19_cogwerk drawStarGet: the star-cell cutscene now uses the HD starburst + star-cell art.
  - 12_main: rooftop harpoon posts render as the brass ANCHOR prop.
  - Super Ramsi art is stored (Sprites.ramsiSuper), ready for the World-4 finale.
- Verified: art-load test (every sheet live in Sprites), full suite green (15 suites), shots:
  art_cog1_creatures, art_lady_portrait, art_cog3_anchor, art_star_cutscene.

## v9.19 (2026-06-17) — finale build + level polish (6-part batch)
- PROPS/TILES: Ramsi now inflates into the GLIDE-PUFF sprite while gliding; rooftop ANTENNA decor
  (new 'decor' object render); the star cutscene shows the RIBBON banner with the count; building
  FACADES now vary across towers using the extra HD wall tiles (facadeblue/dark/big/winstrip).
- COGWERK CITY: the climb's skill-gates are STAGGERED into a zigzag (glide=left12, shrink=right40,
  roll=left14, pound=right38) instead of a straight vertical line; sentinels + signs moved to match;
  _cogwerk test updated.
- PIPEWORKS: a new EXIT portal (hidden until sc_lady) appears once the Lady grants the star — the way
  back up to the city.
- ROOFTOPS: Blazagon now RUNS & LEAPS in a parabolic arc to his next tower each time you net him
  (animated, not a teleport; can't be netted mid-air); after he's caught a FINALE portal appears on the
  last tower (hidden until sc_cog3).
- WORLD 4 — THE ALL-BEAST (GNASHARA): the final boss is built! A fused monstrosity with a HEAD for every
  prior foe (Gust-Wing, Gnash, Storm-Lord, Cerberus, Geode). Knock them out ONE AT A TIME, each only
  vulnerable to its own world's tool (lead-Ramsi / ram-lunge / harpoon / bone / net); a telegraphed SLAM
  punishes camping. When all heads drop, the core opens and SUPER RAMSI fires the finishing star-beam ->
  ending cutscene -> credits. Built on the Bosses framework (spawn/wake/up/draw/finalize hooks).
  Added to the World-3 map (req sc_cog3) and reachable via the rooftops finale portal. test/_world4.js.
- Full suite green (16 suites). Shots: finale_gnashara, cog1_climb.

## v9.20 (2026-06-18) — cutscene/dialogue/exit/map polish
- CUTSCENE: the star celebration now draws Noah, Ramsi AND the level's character (Lady / Blazagon /
  Trader) as REAL pixel sprites instead of crude shapes (drawStarGet takes a `who`; collectStarcell maps
  the star id -> character).
- DIALOGUE: auto-intro — first visit to a World-3 level pops the GUIDE's first line (or the first sign if
  no guide), queued in loadMap + fired in the play loop. SUPREME TRADER now has a face-zoom dialogue
  portrait (new scene.traderface crop) like the Lady (his full-body art stays for the in-world figure).
- EXITS: cog1/cog2/cog3 each get a post-star EXIT portal (hidden until the star) that opens the WORLD-3
  OVERVIEW MAP (portals can now target 'world3map'); the finale is the All-Beast node on that map.
- OVERVIEW MAP: WORLD3_NODES re-spaced into a flowing S-curve (no overlaps); drawWorld3Map now uses
  scene.world3bg as its background when present (else the procedural gears). ASSETS_WORLD3.md §8 adds a
  ready-to-paste ChatGPT prompt for the map background PNG.
- Tests: _polish.js (trader face, world-map exits, auto-intro, cutscene character, spaced nodes);
  _cogwerk/_rooftops suppress the new auto-intro so they drive the sim. Full suite green (17 suites).

## v9.21 (2026-06-18) — painted overworld map background wired in
- Processed assets/raw/world3bg.png (1672x941 painted clockwork-city overworld) -> assets/scene.world3bg.png
  (960x544). drawWorld3Map now renders it (smoothed) behind the level nodes; the node path was already
  spaced to sit over the painting's regions (clock-tower City, pond Pipeworks, skyline High Roofs,
  citadel All-Beast, green Vale-exit). Falls back to the procedural gears if the art is ever removed.
- Full suite green (17 suites). Shot: world3map_painted.

## v9.22 (2026-06-18) — Cogwerk City reshaped into a CLOCK-TOWER vs sunset sky
- New `sky` tile + per-row SUNSET gradient render (drawWorld): warm gold up high -> deep rose at the
  horizon, soft tile-spanning clouds (vnoise2), and a setting-sun glow (`map._sun`). Decorative/non-solid.
- New animated `clock` object: brass rim + ivory dial + hour ticks + sweeping hour/minute hands (prefers
  HD `Sprites.props.clockface` art when present, hands always drawn on top).
- cog1 redesigned: the full-width climb is now a SLENDER TOWER (x16-37) with the SUNSET SKY to its left &
  right (no border tiles beside it), a full-width city PARAPET capping the plaza, and the GREAT CLOCK on
  the crown. Gates re-staggered inside the tower (bounce center -> glide L -> shrink R -> roll L -> pound R
  -> star in front of the clock). Pound sentinels + homes moved into the tower.
- _cogwerk updated (new gate coords + a sky/clock assertion). Full suite green (17). Shots:
  cog1_tower_crown, cog1_tower_mid, cog1_plaza_up.
- ASSETS_WORLD3.md §9: clock-tower art prompts — `clockface.png` (9a), `sheet.towerwalls.png` (9b, ornate
  brass masonry), `sheet.skyprops.png` (9c, clouds/sun/spire/airship). Procedural now; HD art swaps in.

## v9.23 (2026-06-18) — Cogwerk camera pulled back to reveal wide sky (tower unchanged)
- Added per-map `viewScale` (camera zoom) to the render: camera + tile culling (12_main) and drawWorld
  culling (05_tiles) use the enlarged viewport VW/Z × VH/Z; the world is `c.scale(Z,Z)`'d inside the clip.
  Only cog1 sets it (0.75) — every other map stays Z=1.
- cog1 keeps its full 22-wide tower & all 5 gates; the camera now frames it with ~8 tiles of sunset sky on
  EACH side (was ~3). Replaced the blocky per-tile sun with a smooth radial SETTING-SUN disc+halo drawn as
  a drawWorld post-pass (`map._sun`).
- _cogwerk: added sky/clock + viewScale assertions. Full suite green (17). Shots refreshed.

## v9.24 (2026-06-18) — HD clock-tower art wired into Cogwerk City
- import_art.py: registered prop.clockface (single) + sheet.towerwalls (3x2) + sheet.skyprops (3x2);
  imported 13 assets (clock dial; towerpanel/towergear tiles; column/window/cornice props; cloud/sun/
  spire/birds/airship sky props).
- Tower MASONRY: new towerwall/towergear TILEDEFs (procedural = gearwall fallback) + TILE_OVERRIDE
  (towerpanel->towerwall, towergear->towergear). cog1's tower outer walls + gate walls now use the ornate
  brass panel art; the crown uses the gear-emblem panel.
- CLOCK: render already prefers Sprites.props.clockface; bumped cog1 clock to r=42 (grand, ~6 tiles) so the
  ornate dial + roman numerals read; animated hands still drawn on top.
- SKY: drawWorld sun post-pass now draws prop.sun (halo + disc). Placed decor in the sky — a drifting
  airship, a V of birds, four sunset clouds — plus two Ionic columns flanking the vault and two glowing
  arched windows on the tower.
- Full suite green (17). Shots: cog1_tower_crown/_mid (HD).
- (Unused so far: prop.towercornice — imported & available if we want molding bands.)

## v9.25 (2026-06-18) — fix oversized Cogwerk creatures (sprite density)
- Root cause: the 5 Cogwerk pests (voltbug/coghopper/rustbeetle/steambull/sparkdrone) are "external-only"
  sprites (no base procedural grid), so installExtSprite's densFor() saw no base and returned dens=1 — their
  32px (DENSITY=2) art was treated as 32 LOGICAL px, rendering 2x too big with chunky/oversized pixels.
- Fix (04_sprites installExtSprite, creature kind): external-only creatures (no base sprite) now default to
  dens=2 (the import DENSITY) instead of 1. Verified all 5 pests -> dens=2, intended logical sizes (16x10..16x12),
  crisp and correctly sized (match sheep/crab). Creatures WITH a base grid are unchanged.
- (The large fiery figure by the plaza is the Supreme Trader NPC — drawn big on purpose from a hi-res scene
  portrait, smooth pixels; not a creature.)
- Full suite green (17). Shot: cog1_plaza_pests.

## v10.9 (2026-07-06) — Aquarium life, THE GLIMMER DEEP (secret cave), pen decor, crisp album
- AQUARIUM ROAMING (29): the old populate walked `slots[si*5]` — in the huge 33x22 tanks that never
  wrapped, so EVERY animal spawned in the top 3 rows and hovered there (this is also why "mermaid faces
  looked cropped": they hugged the screen top under the banner line). Now each species gets a DEPTH BAND
  (angelfish high, mermaids/puffers mid, seahorses low, STARFISH ON THE SAND at y19-20) spread across the
  full tank width, plus new motion: `_swim` = long glides w/ horizontal cruise bias + gentle depth weave,
  `_crawl` = starfish sand-shuffles. Implemented as a chained `updateCreature` wrapper keyed on the flags
  (soft band leash turns them around instead of yanking). Ship sign now hints at the secret crack.
- THE GLIMMER DEEP (new 30_glowcave.js): a SECRET underwater cave behind the sunken ship ('cavemouth'
  obj, SPACE within 22px; bubbles + teal breath telegraph it). A 30x121 serpentine CHIMNEY (deepest,
  narrowest shape in the game; corridors 2 wide, pockets at the bends, bulb chamber at the bottom).
  Pitch dark (m.dark+lightMask+darkness .9, chained Game.drawLightMask w/ own mask canvas) with
  GLITTER-SPARKLE solid walls + dark-gradient bg (chained drawAquariumBg since m.aqua). NEW MECHANIC:
  GLOW ALGAE ('glowalgae' objs) light when bumped (lit=1) and fade over ~8.5s — your own light trail;
  asleep ones wink faintly so they're findable. Two ANEMONE GATES open PERMANENTLY (flags glowgate_1/2)
  when a lit algae is within 3.4 tiles — teaches the mechanic. 11 glow fish (new creature, swimming
  lanterns punched in the mask). BOSS: LANTERNA the lantern-fish (lazy-spawned at y>100 so the descent
  stays calm) — a NO-DAMAGE light puzzle: wake ALL THREE chamber algae at once (slower fade, 11s);
  she drifts toward lit hope, darts shyly if touched, never bites. Pinned kid-hints: 'BUMP THE GLOW
  PLANTS!' -> 'N MORE! BE QUICK!'. Reward: heartC + the PEARL ALTAR unseals -> PEARL LANTERN item
  (full itemget): Noah's aura 46->84 in the cave and a warm additive halo in EVERY lightMask map.
  After the rescue LANTERNA + 2 glow fish visit the aquarium's mermaid pond. Exit bubbles top AND
  bottom (no climb-back). Chests: gems 6 / coins 15 / heartpiece.
- PEN DECOR (new 31_pendecor.js; IDEAS.md L1#8): DECOR CATALOG easel in the Workshop (menu type
  'decor', COMBI face, priced in COINS — first real coin sink): BOUNCY BALL 8 / TIRE SWING 12 /
  SPLASH POND 15 / FLOWER GARDEN 6 (butterflies) / MARBLE FOUNTAIN 18 / PEARL LAMP 10. Buying plays
  the SAME itemget fanfare as crafting (icon = the decor draws its own 30px portrait via shared
  painter). Decorations are always-present 'pendecor' objs, invisible until flag decor_<key>. FRIENDS
  REACT (2nd chained updateCreature wrapper): pen pals stroll to a toy every 7-16s, throw hearts
  /sparkles beside it, and NUDGE the bouncy ball around (spring-back toy physics in the draw tick).
  11_ui: 'decor' added to menu title + face-panel condition (2 lines).
- CRISP MIMI ALBUM (12_main capturePhoto + 28 thumbs): photos were 300x170 JPEG q0.5, nearest-
  neighbour downscaled, then upscaled 2x in the zoom view = mush. Now captured at the zoom view's
  exact device size 600x340 with SMOOTH downscale, preferring WEBP q0.72 (halves storage) w/ JPEG
  q0.62 fallback (node-canvas + old browsers); zoom draws 1:1 pixel-perfect; grid thumbs now smooth-
  downscale. Old saved photos still display.
- TESTS: new suites _glowcave (18 asserts: sealed-then-open BFS, fade timing, gates remembered, calm
  descent, gentle boss, altar, return bubble, aquarium visit, containment) + _pendecor (catalog, coin
  math, fanfare + icon, placed! relist, no double-charge, sheep strolls to ball & plays). validate:
  models anemgates as openable (like doors). audit.js: anemgate = honest fixpoint grant (opens only
  once a REACHABLE algae is within 3.4 tiles). Full suite green (37 files run); auditor 0 err/0 warn
  on glowcave/aquarium/workshop.

## v10.10 (2026-07-07) — album photos: SUPER MIMI face, proximity timing, self-healing capture
- Verified in a REAL browser engine (headless Chromium 150 via puppeteer, file:// load) — not just
  the node harness — because the bug was browser-only. Repro scripts drive window.NQ exactly like play.
- SUPER MIMI PORTRAIT (28): once the FOUR STAR-CELLS are gathered (Game.starcellCount()>=4, or the
  finale flag), Ramsi's dialog portrait + name switch to SUPER RAMSI / 'SUPER MIMI'. New Game.ramsiWho()
  helper (lazily builds the super pixPortrait; prefers the sramsi1/2 glow art) replaces the old
  `flags.colossus`-only check used at both fire sites. Confirmed on-screen: golden fleece + glow in the box.
- PROXIMITY TIMING (28): moments used to fire on mere map entry, so the photo was snapped before the
  SUBJECT was on screen (Berkley: "the horse reaction happens before Noah/Ramsi get near the horses").
  Eight checks now also require the subject in frame (<~90px / in-view): stable_horses (a real horse),
  zoo_friends (any exhibit), first_craft (the combiner), school_smart (Ms. Plume), trophy_gold (a WON
  trophy), gear_shiny (an OWNED pedestal), sea_bath (water within 3 tiles), water_flows (near a pond
  tile). The photo now frames what the caption is about.
- CAPTURE, made bulletproof (12_main): the v10.9 "crisp" rewrite is kept (600x340, smooth downscale)
  but every encoder is now guarded webp->jpeg->PNG, an oversize PNG result auto-downscales to a 300px
  JPEG, and a photo is only KEPT when it's a real scene (>1500 bytes — a blank/failed grab encodes
  tiny). capturePhoto returns success and sets the per-page version flag itself. New saveGamePhotosafe()
  drops the oldest photos and retries if localStorage quota ever throws, so a long album never silently
  loses the save. Browser test: 21/21 moments captured as webp, 527KB total, saves + reloads all 21.
- SELF-HEALING / RETRO RE-SHOOT (28): checkMoments now also fixes ALREADY-earned pages — if a page's
  photo is missing, tiny(<1500B), or an old blurry (V<2) shot, standing in the right spot again QUIETLY
  re-snaps it (a 'CLICK! ...ALBUM' toast + sparkle, no dialog replay). This means any photos that failed
  to capture in an older build heal themselves on the next visit — the direct cure for "no pictures."
  Album zoom now tells an earned-but-photoless page how to get its shot ("Visit that place again").
- TESTS: _moments extended — proximity (no horse photo at the doorway; fires beside a real horse with
  the horse IN frame), retro re-shoot (old blurry photo silently replaced, V=2, toast), SUPER MIMI face
  with four stars. Full suite green (37 files). Browser repro confirms fresh capture, retro re-shoot,
  SUPER MIMI, and quota-safe save all work on a genuine file:// page.

## v10.11 (2026-07-07) — sunken-ship photo moment + readable album labels
- NEW MOMENT 'ship_secret' (28): "THE SUNKEN SHIP" fires when Noah swims up behind the aquarium's
  great wreck (proximity <62px to the sunkenship obj, back/east side) — Ramsi: "A whole SHIP under the
  sea! Mimi is the CAPTAIN now!" The photo frames the ram-head mast. 22 moments total now.
- ALBUM LABELS were unreadable "double black" (28): drawText(...) was called with `null` for the
  outline arg, not `false` — so `outline !== false` was true and dark titles (#241a33) got a dark
  #1a1426 shadow drawn 4x around them = smeared double-struck black. Fixed all album label calls:
  zoom TITLE is now clean navy on the white polaroid (outline false); zoom placeholder text is light
  on the grey unearned plate / dark on the green earned plate; grid thumbnails get a solid dark
  name-plate with crisp light text; the grid's bottom caption sits on its own dark bar. Zero `, null`
  outline calls remain in the album.
- ADAPTIVE GRID (28): the grid was hard-coded to 5x4=20 cells; with 22 moments the 5th row ran off
  the 272px view. It now computes cols=5, rows=ceil(N/5) and shrinks cell/thumb height to fit every
  row on screen (50px cells at <=4 rows unchanged; 42px at 5 rows). Book background, divider seam and
  caption bar all track the computed height.
- BUILD NOTE: the Edit tool re-triggered the known Dropbox local-mount truncation (bash saw a 315-line
  cut-off copy while the cloud copy was whole). Repaired per CLAUDE.md by rebuilding the file tail via
  bash heredoc; verified markers + node --check + the built HTML embed the correct source. (Reminder:
  prefer bash heredocs over the Edit tool for this repo.)
- TESTS: _moments now asserts 22 moments, the ship moment (fires only near the wreck, not across the
  tank; queues a photo; Mimi speaks), and that the 22-moment grid + zoom render without throwing.
  Verified in real headless Chromium: ship moment on-screen, album grid 5 rows all-readable, zoom
  title crisp. Full regression green.

## v10.12 (2026-07-11) — USB SNES gamepad support
- NEW src/32_gamepad.js: polls the browser Gamepad API each frame (pollGamepad(), called at the
  top of updateGame) and feeds the SAME KEYS[]/PRESS_QUEUE the keyboard uses — so the ENTIRE game
  plays on a USB SNES controller with no other code changes. No-op when no pad/navigator (node-safe).
- D-PAD: read from analog axes[0]/[1] (deadzone .5) AND the dpad-buttons (12-15) — cheap USB SNES
  clones report the pad one way or the other; we cover both. Rising edge -> one PRESS_QUEUE entry;
  level -> KEYS[] held; falling edge -> release. Unplug clears everything (no stuck movement).
- DEFAULT MAP (standard Gamepad indices, SNES face layout): B(0)=CATCH/use tool(z), A(1)=talk/OK(space),
  Y(2)=RAMSI power(c), X(3)=JUMP(x), L(4)=tool◀(q), R(5)=tool▶(e) [per request], Select(8)=backpack(i),
  Start(9)=map(Escape). L2/R2 mirror the shoulders. Because cheap pads number buttons inconsistently,
  this is a best guess — the setup screen makes it correct for any pad.
- SETUP SCREEN (Game.state 'padsetup'): a kid-proof press-to-bind flow. Open with SELECT+START on the
  pad (raw buttons 8+9, works whatever the face mapping is) or the K key (title or in-play). Walks the
  8 actions with a lit SNES-pad glyph, a live "button N down" read-out (proves the pad is heard), and
  progress pips; ENTER skips (keep default), R starts over, ESC saves & plays. Map persists to its own
  localStorage key (buffNoahQuest_pad); never touches the save slots. GP.resetMap() restores defaults.
- UI: title shows "▶ CONTROLLER READY — K: button setup" (green when a pad is seen). render() + updateGame
  dispatch the padsetup state. NQ now also exports keyHeld + dist (for the test).
- TESTS: new test/_gamepad.js injects a fake pad into navigator.getGamepads and asserts d-pad (axes AND
  buttons), the four SNES faces, L/R tool swap, single-fire edge detection, hot-unplug release, and the
  press-to-bind setup. VERIFIED in real headless Chromium with an injected pad: detection, analog move
  (Noah walked left), R tool-swap (mitts->net), and SELECT+START opening setup all work live. Full
  regression green (38 suites). NOTE: face-button indices vary by pad; if any button feels wrong, press
  SELECT+START (or K) and rebind — takes 20 seconds.

## v10.13 (2026-07-11) — gamepad setup fixes: bind Select/Start + the D-PAD directions
- BUG (reported): in Controller Setup, the MAP step said "button 9 down" but never bound or
  advanced. Cause: pollSetup did `if (idx===8||idx===9) continue` to reserve Select/Start for the
  open-setup combo — but the MAP & BACKPACK steps ask for exactly those. Fix: every button is
  bindable now; the open combo needs BOTH 8+9 at once, so single presses never collide. Also
  seeded setup.lastRaw at open so the SELECT+START used to ENTER setup can't mis-bind step 1, and
  hardened the 'ALL SET' screen (a pad press finishes instead of indexing STEPS out of range — a
  latent crash).
- BUG (reported): setup never asked for UP/DOWN (the d-pad). The map now supports AXIS bindings
  ('ax0-','ax1+', ...) alongside buttons, and the default d-pad works via axes[0/1] OR buttons
  12-15. Setup now walks the FOUR DIRECTIONS FIRST — each step binds a fresh BUTTON press OR a
  fresh AXIS push (>0.6), so it works whether the pad reports the d-pad digitally or on a stick.
  12 steps total (4 dirs + 8 actions). Screen shows "PUSH THE D-PAD DIRECTION FOR: MOVE UP", lights
  the glyph's d-pad, and the live read-out now lists pressed buttons AND deflected axes.
- Play-time poll interprets axes THROUGH the map (GP.map['ax'+i+'-'/'+']), so rebound directions
  take effect immediately. Saved maps merge over DEFAULT_MAP, so old saves still get axis defaults.
- TESTS: _gamepad now walks the whole 12-step setup — directions via axis AND via a d-pad button,
  CATCH on a face button, MAP bound to START(9), BACKPACK to SELECT(8), the done-screen finish, and
  confirms the rebound START opens the map in play. Verified end-to-end in real headless Chromium:
  full walk, START->MAP + SELECT->BACKPACK + axis UP all committed, button on ALL SET starts the game.
  Full regression green.

## v10.14 (2026-07-11) — album: kill the glitter spew + capture dark/plain scenes
- ROOT CAUSE (both reported bugs): capturePhoto only kept a photo when the encode was `> 1500`
  bytes — a guard meant to reject "blank/failed" grabs. But a DARK cave or a PLAIN view is a
  legitimate scene that just compresses small, so those captures were rejected. The album's retro
  re-shoot (checkMoments) then saw the photo still missing every frame and re-fired forever:
  _pendingPhoto set -> capture rejected -> re-fire -> a never-ending spew of sparkle + "CLICK!"
  toasts (no dialogue, on revisiting an already-earned site — exactly what the player described).
- FIX 1 — never gate a photo by byte size: capturePhoto now keeps ANY valid `data:image/...`
  result (>128 chars); only a genuine encode failure (empty/thrown) is skipped. Dark/plain scenes
  now store correctly (verified: a black glow-cave corner stores a 9 KB webp).
- FIX 2 — hard anti-spew guard: the retro re-shoot may attempt each moment AT MOST ONCE PER MAP
  VISIT (Game._retroShot, reset in loadMap). Proven in a real browser: with capture FORCED to fail,
  a parked site produced exactly 1 sparkle over 600 frames (was unbounded); with a working capture
  the page heals in one shot on revisit, then stays silent. Retro condition simplified to
  `V<2 || !photo` (byte check dropped).
- FIX 3 — quota-robust save (Issue: "photos failing at some sites" after reload): saveGame used to
  silently swallow a full-localStorage error, so late photos never persisted. It now sheds album
  photos OLDEST-first until the core save fits, so real PROGRESS (position, flags, log) is never
  lost; a shed photo simply re-snaps (bounded) on the next visit. Removed saveGamePhotosafe (its
  prune path was dead code — plain saveGame swallowed the throw and never re-threw).
- TESTS: _moments now asserts the spew is impossible (<=1 burst/visit even when capture always
  fails), the guard resets on load, and that a small/dark valid capture is kept while only true
  failures are skipped. Verified end-to-end in headless Chromium: dark-scene store, no spew on
  forced-fail revisit, one-shot heal, and quota save keeps progress (coins) while shedding photos.
  Full regression green.

## v10.15 (2026-07-11) — crafting economy + the Sky-Spire Ascent + distinct entrances
- CRAFTING MATERIALS (new 33_materials.js): play-item decorations are no longer trivially bought.
  New flags.mats (spendable) + flags.matsFound (per-pickup guard). Seven material item icons added
  to ITEM_GRIDS (pearl, tire, spring, seedbag, marble, bucket, skyfeather). A 'material' walk-over
  OBJ (floating, glowing, once-only) + Game.collectMaterial + collectMaterialFanfare (first-of-kind
  plays the full itemGet; later grabs toast). giveLoot gained loot.mat so chests can drop materials.
  A MATERIALS row in the HUD (shows once you hold any). Six materials scattered in thematic reachable
  spots (spring=stable, tire=coghall, bucket=coast, seedbag=grannyzoo, marble=wastes, pearl=aquarium);
  all validated reachable. The skyfeather is NOT loose — it's the Ascent's prize.
- DECOR ECONOMY reworked (31_pendecor.js): prices x10 (60-250 coins) AND each play-item now needs its
  material (flowerbed=seedbag, ball=spring, sealamp=pearl, tireswing=tire, pond=bucket, fountain=marble).
  New premium RAIN CLOUD decor (250 coins + skyfeather) that drifts over the pens and sprinkles rain.
  The catalog shows the coin+material requirement with a live have-count; buying consumes both. (Owned
  decorations in existing saves stay owned — the new gate applies to future crafting.)
- THE SKY-SPIRE ASCENT (new 34_ascent.js): a bespoke VERTICAL wing-flyer game-state ('ascent'),
  entered from a SKY SPIRE in the Vale (gated on WINGS). Narrow (15 tiles) + very tall (116 rows).
  TAP X to flap up, HOLD X to glide, arrows to drift; alternating cloud ledges force a zig-zag climb;
  PERCH clouds are checkpoints. Two dangers spark your wings OUT (a stun where you can't flap and
  plummet): patrolling ZAP-BATS and timed ARC-GATES that crackle across the shaft. Falling out the
  bottom bounces you to the last checkpoint (never a hard game-over; a heart floor keeps it kid-safe).
  The SKY-FEATHER waits at the summit -> grants the rare material + fanfare, then flutters you back to
  the Vale. ESC bails out. Own bright-sky render (parallax clouds, height meter, big kid-hints,
  spin-when-zapped). Completability is proven by an open-cell BFS in the test.
- DISTINCT ENTRANCES: the Vale's two portals were identical purple swirls. Added a `plain` portal flag
  (suppresses the swirl) + bespoke OBJDRAW art: COGWERK = a BRASS CLOCKWORK ARCHWAY (brass pillars,
  turning gears, a ticking clock keystone, steam; barred when locked); UNDERBURROW = a dark EARTHY
  BURROW-MOUTH (dirt mound, grass tufts, dangling roots, eyeshine; rubble-sealed when locked). You can
  tell them apart at a glance now.
- TESTS: new _materials (scatter, once-only pickup, first-kind fanfare, chest loot) + _ascent (wings
  gate, flap/glide physics, zap-out stun, checkpoints, fall-recovery, the feather + fanfare, ESC bail,
  and a BFS completability proof). _pendecor updated for the 7-item + material economy. Full suite
  green (32 files); auditor 0/0 on vale/workshop/stable/coast/grannyzoo/wastes/aquarium. Verified in
  real Chromium: the Ascent (bottom/mid/zap/summit), both entrances (open+locked), decor menu.
- BUILD NOTE: the Edit tool again truncated Dropbox-synced files (19_cogwerk.js, 31_pendecor.js) mid-
  write; repaired each by appending the correct tail via bash heredoc. Reminder (per CLAUDE.md): use
  bash heredocs, NOT the Edit tool, for this repo.

## v10.16 (2026-07-11) — catchable reef fish, harder Ascent, the Floating Aviary, doors that vanish
- AQUARIUM FISH ARE CATCHABLE (29 + 06_maps): seahorse/angelfish/pufferfish/starfish gained catch
  tools + fishsnack bait; they now spawn wild in the Sunsplash Coast shallows AND the Deep Blue, so
  they enter the capture log/inventory (they were display-only before). The public aquarium still
  shows them swimming.
- HARDER SKY-SPIRE (34_ascent): cloud ledges shrunk (regular ledges 3 wide, was 7 — you fall farther,
  more often; perches slightly bigger, wandering across the shaft). New CONDORS: they cruise a band
  then DIVE at Noah when he drifts below (dive telegraph line), sparking his wings out like the bats.
  Still completability-proven by the open-cell BFS test.
- THE FLOATING AVIARY (new 35_aviary.js) replaces the "rain cloud" as the SKY-FEATHER payoff. Crafting
  it at the decor catalog (200 coins + skyfeather) opens a bright AVIARY CLOUD in the Workshop's MYTHIC
  pen. Step in -> a peaceful side-scroll FREE-FLIGHT sky (state 'aviary'): arrows fly Noah in any
  direction (no gravity/danger), his winged friends (pegasus/griffin/condor/dragon/blazagon/cometpup —
  up to 3 of each owned, or 2 ambient if none) wheel on lazy loops, glowing RINGS to swoop through
  (all 9 -> +20 coins), PET friends (SPACE, hearts), leave via ESC or the HOME cloud. Dreamy parallax
  sky. State dispatched in updateGame/render next to 'ascent'.
- DOORS VISIBLY OPEN (09_systems + 12_main): when a switch opens an IN-LEVEL gate — bone-boomerang
  (boneswitch), block-on-switch, or Ramsi headbutt (ramswitch) — the door tile now MELTS to floor with
  a dust+sparkle puff and a 'clunk', so it's obvious something happened. New Game.revealOpenedDoors:
  flag-gated door tiles that are now open swap to the corridor's floor tile; it runs every play frame
  (instant feedback) and silently on map load (past-opened gates show open on entry). Map-PORTAL doors
  (those with a LINK — museum wings etc.) are deliberately LEFT as doors, since you walk INTO those to
  change maps. Also applies any satisfied puzzle tile-swaps live (so bone/ram switches driving bridges
  update immediately, not just on reload).
- TESTS: new _aviary (skyfeather craft -> cloud -> free-flight, friends, rings, pet, exit), _doors
  (switch-gates vanish, portal doors stay, state persists); _ascent extended (condor dive + small
  ledges); _aquarium extended (fish catchable + wild + logged); _pendecor updated for the aviary craft.
  Full suite green; validate 659 targets; auditor 0/0 on coast/deep/sky2/burrow8/workshop/vale.
  Verified in real Chromium: catchable fish, condor-dive Ascent, the Aviary (cloud + flight), decor menu.
- BUILD NOTE: the Edit tool truncated 34_ascent.js again mid-write; repaired via bash heredoc. Switched
  to bash heredocs for all edits (per CLAUDE.md).

## v10.17 (2026-07-12) — dungeon secret vaults, new craftables, Condor stomp, Lanterna unified
- LANTERNA CONSISTENCY (30_glowcave): the shy Glimmer-Deep boss was fully hand-drawn while the freed
  lantern-fish used a different pixel grid. Redesigned the creature sprite into a plump PURPLE
  lantern-fish and made the BOSS render that same sprite (plus its animated grey->gold lantern glow),
  so the depths boss and the freed friend now look identical.
- SPIRE — STOMP CONDORS (34_ascent): condors were too hard to just dodge. Landing on a condor from
  ABOVE (falling onto its back) now KOs it and bounces Noah up (confetti + toast); side/below touches
  still spark the wings out. A discovery hint ("DROP ON THE CONDOR TO BONK IT!") shows when one is near.
- SECRET ROOMS IN EVERY DUNGEON (new 36_secretrooms.js): a second-pass reward. A CRACKED WALL (grottos,
  keeps, the Void — smash with the RAM SUIT) or a bolted GATE + ram-hole (the burrows — SHRINK Mimi
  through) opens into a DOORWAY PORTAL leading to a SEPARATE, invisible-until-entered VAULT map. No
  existing map is redrawn and the room can't be seen until you step in (per the design suggestion).
  Entrances are found at build time by scanning each map for a wall (or, on the rift-based Void, a
  chasm crystal) beside reachable floor. Smashing a secret crack sets its flag (wrapped smashCrack) to
  reveal the hidden portal; the burrow gates open via the shrink-latch + the door-vanish system. Each
  vault holds a rare material + a coin bonus + a way back. 12 tiny vault maps, 3 rare materials:
  GOLD NUGGET (grottos), VOID GEM (keeps + Void), CRYSTAL SHARD (burrows).
- NEW RARE MATERIALS + CRAFTABLES (04/09/33 + 31_pendecor): goldnugget / crystalshard / voidgem added
  (icons, flags, HUD). Four new decorations craft from them at the catalog: TREASURE CHEST (goldnugget)
  + GLOW CORAL (crystalshard) appear in COMBI'S AQUARIUM; SUN CRYSTAL (voidgem) + RAINBOW ARCH
  (goldnugget) appear in the FLOATING AVIARY (your flyers circle the sun-crystal; swoop the arch).
  Catalog now 11 wares; buy logic + placement generalized via a per-item `place` field.
- ART SHEET (import_art.py + SHEET_PROMPTS.md): registered sheet.deepfriends (3x2) for refreshed reef
  fish + LANTERNA + glow fish, with a full art prompt. Because the boss + freed friend both draw
  Sprites.creatures.lanterna, dropping the real art feeds BOTH automatically. Improved procedural
  placeholders hold the look until then.
- TESTS: new _secrets (a hidden vault in every dungeon; both RAM-SMASH and SHRINK gating; end-to-end
  smash->doorway->vault->material->return); _ascent (+ condor STOMP KO + non-stomp still zaps); _pendecor
  (11 wares incl. the rare-material craftables); _aquarium (fish catchable). Full suite green (37 files);
  validate 735 targets / 58 maps; auditor 0/0 across all 12 dungeons. Verified in real Chromium: the
  vault interior, aquarium + aviary craftables, condor stomp, harder Ascent, unified Lanterna.

## v10.18 (2026-07-12) — fix: the Sky-Feather was unreachable at the summit
- BUG (reported): "got to the top of the spire, but there was no sky-feather there." The summit PERCH
  sat directly UNDER the feather, so flapping straight up you hit the perch's underside and stopped a
  row BELOW the feather — the "top" you reached wasn't where the feather was, and it read as missing.
- FIX: the feather now floats in the OPEN CENTRE column (nothing solid beneath it), with the rest
  clouds moved to the sides and the summit perch off to one side. Flying up the final stretch grabs
  it. Grab radius widened (14x16 -> 20x22) so a young flyer can't narrowly miss. New regression assert:
  the two cells directly below the feather must be open air. Verified in real Chromium: a straight-up
  flight collects it (got=true, victory plays). Full Ascent suite green.

## v10.19 (2026-07-12) — traders exchange gems back into coins
- Every trader (Tess, Sal, Gruul, Cora) now offers "1 gem -> 8 coins" alongside the existing
  "10 coins -> 1 gem", so you can convert the premium currency back (with a small spread so a
  round-trip isn't free). tradeSelected gained a `pay:'gem'` path that spends gems instead of coins
  and refuses gracefully when you have none. Verified: both directions, the refusal, and all 4 traders.

## v10.20 (2026-07-12) — fix: old saves softlocked out of the Floating Aviary
- BUG (player-reported): the SKY-FEATHER reward was changed from the old RAIN CLOUD decor to the
  FLOATING AVIARY. A save that had ALREADY grabbed the feather and spent it on the rain cloud was
  stuck — the feather material was gone, the aviary recipe needs one, and the Ascent's one-time
  feather grab (gated by matsFound.ascent_feather) never re-fires. A brand-new game was fine.
- FIX: loadGame() now runs a migration — if a save EARNED the feather (gotmat_skyfeather /
  matsFound.ascent_feather), doesn't yet have the aviary (decor_aviary / aviary), and holds no
  skyfeather, it refunds exactly one and retires the old decor_raincloud flag. Guarded so it never
  double-grants (holding one, or aviary already built, or never earned = no refund). Also normalized
  flags.mats on load so pre-existing saves keep every newer material key (goldnugget/crystalshard/voidgem).
- Also fixed the stale Ascent pickup text ("Craft the RAIN CLOUD") -> "Craft the FLOATING AVIARY".
- New regression test/_feathermig.js (4 save scenarios). Core set stays green: smoke, playthrough,
  validate (737 targets/58 maps), _ascent, _materials, _aviary, _pendecor.

## v10.21 (2026-07-12) — a real sky rainbow + heart-artwork animal reactions
- AVIARY RAINBOW: the crafted RAINBOW ARCH was a small hoop on the ground. It's now a GIANT,
  translucent rainbow arcing across the whole sky — drawn in the background (screen space, faint
  parallax so it reads as sky-far), 7 ROYGBIV bands violet(inner)->red(outer) at alpha .30 with a
  soft white inner sheen. Clouds and flyers pass in front of it.
- ANIMAL-REACTION HEARTS: swapped the little "<3" text for the REAL heart artwork (Sprites.items.heart
  — the same heart as the life-total HUD). Applies to the aviary pet reaction and the Glimmer-Deep
  glowfish catch reaction; both now float the sprite up and fade.
- FEED REACTION (new): when a creature reaches a baited cage and is fed (onTrapped), a happy heart
  now pops above it — creature gains c.heartT, decremented in updateCreature, drawn in drawCreature.
- Verified: build + _aviary, _glowcave, features, features2, validate (737/58), smoke, playthrough,
  underburrow, _zoo, _museum all green; screenshots confirm the sky rainbow and the fed-sheep heart.

## v10.22 (2026-07-12) — art-sheet cleanup: no duplicate fish; new sprites + burrow map
- The pending Sheet 12 (sheet.deepfriends) duplicated the reef fish (seahorse/angelfish/
  pufferfish/starfish) that ALREADY have art in sheet.aquarium — re-importing it would have
  double-wired creature.<fish>.a and could clobber the aquarium art. Fixed: renamed the sheet
  to sheet.newart12 and set it to ONLY genuinely-new pieces: creature.lanterna.a,
  creature.glowfish.a, creature.condor.a, item.goldnugget, item.crystalshard, item.voidgem
  (all six have base procedural sprites, so density snapping stays correct; the condor art
  also flows into the Sky-Spire fight, which draws Sprites.creatures.condor).
- Underburrow OVERVIEW MAP art: UI.drawBurrowMap now paints Sprites.scenes.burrowbg behind the
  World-2 map (mirroring drawWorld3Map's world3bg), with the old procedural strata kept as the
  fallback until the art is dropped in. Added a matching painted-scene prompt.
- SHEET_PROMPTS.md: rewrote Sheet 12 (with an explicit "do NOT redraw the reef fish" note) and
  added a SCENE prompt for scene.burrowbg (~480x272, smooth, drop into assets/ + build).
- Skipped (by request): pen-decoration art — those decorations are animated/moving and would
  lose their motion if flattened to pixel PNGs.
- Verified: build OK, import_art SHEETS valid, smoke + _glowcave + underburrow + validate
  (737/58) green; burrow overview screenshot confirms the fallback + node overlay.

## v10.23 (2026-07-12) — renamed the Spire's diving foe: CONDOR -> STORMCROW
- BUG (naming/art collision): the Sky-Spire Ascent's diving, stompable foe was coded as "condor"
  and even drew with Sprites.creatures.condor — but CONDOR is the existing CATCHABLE eagle-creature
  (it spawns at the summit and already has real external art, assets/creature.condor.a.png). The
  new-art sheet had listed creature.condor.a, which on import would have CLOBBERED that nice art.
- FIX: the Ascent foe is now the STORMCROW, a distinct creature only in that level.
  - src/04_sprites.js: added a STORMCROW grid to SPR_GRIDS (slate grey-blue swept wings, a yellow
    lightning-flash on the chest, orange beak) so Sprites.creatures.stormcrow builds automatically
    and reads clearly apart from the brown/white Condor.
  - src/34_ascent.js: renamed condor->stormcrow throughout (array, AI, stomp, toasts, the pinned
    hint "DROP ON THE STORMCROW TO BONK IT!") and it now draws Sprites.creatures.stormcrow.
  - import_art.py sheet.newart12: creature.condor.a -> creature.stormcrow.a (Condor art untouched).
  - SHEET_PROMPTS.md: the Sheet-12 bird is now STORMCROW (with a "do NOT confuse with the catchable
    Condor" note and the stormy grey/yellow palette).
  - test/_ascent.js updated to the new field name.
- Verified: build OK; stormcrow sprite builds; the Condor sprite + CREATURES entry are untouched and
  still catchable; stormcrow is NOT a catchable creature; _ascent + smoke + validate (737/58) green;
  side-by-side sprite render confirms the two birds read as clearly different.
- PUBLISHED (same day): the full project is now on GitHub — https://github.com/GryderArt/BuffNoahsQuest
  — with a public play link via GitHub Pages: https://gryderart.github.io/BuffNoahsQuest/ (index.html
  redirects to BuffNoahsQuest_v4.html). Pages serves the gh-pages branch; to update the LIVE game,
  push to BOTH: `git push origin main && git push origin main:gh-pages`. shots/ and audits/ are
  gitignored (transient outputs).
