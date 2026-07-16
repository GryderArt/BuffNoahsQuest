# BOSS_FINALE.md — World 4 finale: GNASHARA, THE ALL-BEAST (design)

The last world ends on ONE monstrosity that fuses every previous boss into a single towering
body — a HEAD for each fallen foe, sprouting from a quaking core. You knock the heads out **one at
a time**, and each head is only vulnerable to the **mechanic from its own world**. So the finale is
a victory-lap gauntlet: every tool, gear and Ramsi-skill you earned gets one last spotlight. When the
last head drops, the chest-core opens and **SUPER RAMSI** (charged by the 4 star-cells) lands the
finishing blow.

> Working name: **GNASHARA, the All-Beast** (a grown, fused echo of GNASH). Rename freely.

---

## Appearance
A hulking, barnacled mountain of a beast — mismatched limbs, patched hide in every world's palette,
chains and gears half-grown into the flesh. From its hunched shoulders and back rise **7 heads**, each
unmistakably a former boss, blinking and snarling out of sync. Center-chest: a glowing **STAR-SOCKET**
(dark until the heads fall). It barely fits the arena — "quite a monstrosity."

## Arena
A wide final platform with the hazards of every world layered in: a few **cracked floor seams** (ram),
a **sky-gap rim** you can be knocked toward (glide back), a couple of **bounce-pads** and a
**pound-plate**, a strip of **deep water** along one edge (harpoon), and **dark corners** (glow). The
arena IS the toolbox — each head's phase lights up the props it needs.

---

## The 7 heads (knock out in this order — each = one mechanic spotlight)

Each head has: an **ATTACK** it telegraphs, a **TELL/opening**, and the **WAY TO KNOCK IT OUT** (its
world's mechanic). Heads already down stay slumped (still scenery, occasional twitch).

1. **GUST-WING head** — *World 2, air.* Whips up a wind-shield and dive-buffets you toward the rim.
   • Tell: it raises a swirling shield and hovers low.
   • KO: lead **RAMSI to HEADBUTT the shield** (companion), then **NET** (Z) the dazed head. GLIDE (C)
     back from the rim buffets so you don't fall.

2. **STORM-LORD head** (Tempestia) — *World 2 finale.* Calls down telegraphed lightning columns.
   • Tell: a bolt charges over your last position (bright marker) before it strikes.
   • KO: **BONE-STUN** (boomer-bone, tool 5) to ground the head mid-charge, then **HARPOON** (tool 3)
     to reel it down and pop it.

3. **GNASH head** — *Underburrow finale.* Armored chomp; spits tremor-blocks (soft) across the floor.
   • Tell: its cracked jaw GLOWS just before it bites down and exposes the crack.
   • KO: **ROLL** Ramsi (C) through the tremor-blocks to clear a lane, then **RAM-SUIT LUNGE** (Z into
     the CRACK) on the glowing jaw. Two ram hits.

4. **GEODE head** (Geode Golem / Thornback) — *Underburrow.* Curls into a spiked crystal ball and rolls.
   • Tell: it stops, shell-plates flare (a seam opens on top).
   • KO: **POUND-PLATE** (the shockwave, C on the plate) to stagger it, then **SHRINK** (C at a vent) to
     slip under the spikes and strike the open seam.

5. **CERBERUS head** — *the three-dog guardian.* Lunges on a chain; splits attention three ways; the
   arena dims around it.
   • Tell: a single eye glows in the dark as it winds up the lunge.
   • KO: drop a **RAMSI DECOY** (C) to bait the lunge, use **GLOW** (dark-sight) to spot the glowing
     weak eye, and **NET/BONE** it on the whiff.

6. **BLAZAGON head** — *World 3, roofs.* Leaps up and breathes a fan of fire; bolts side to side.
   • Tell: it rears and LEAPS (airborne) to breathe — vulnerable while hanging.
   • KO: **HARPOON-GRAPPLE** (tool 3) the airborne head to YANK it down, then **NET** (Z) it on landing.

7. **MIMI SAHOR head** — *the legendary World-1 catch; the heart.* The central, largest head. It can't be
   hurt — it must be **CAUGHT**, the way the whole game taught you, but only once everything else is down.
   • Tell: with the 6 side-heads slumped, the chest STAR-SOCKET blazes open and Mimi Sahor lolls,
     stunned and reachable.
   • KO → FINALE below.

---

## Finale — SUPER RAMSI
With all six side-heads out and the core open:
1. The four **STAR-CELLS** you gathered (Worlds 1–3 + the city) lift out of your pack and orbit Ramsi.
2. **RAMSI POWERS UP → SUPER RAMSI** (new sprite, see ASSETS_WORLD3 §5): bigger, golden, star at his brow.
3. **CHARGE:** hold the action while Super Ramsi gathers a star-energy ball between his horns (a short
   bar fills; dodge the beast's last flailing during it).
4. **BLAST:** release → Super Ramsi fires the **STAR-BEAM** into the open core; you **NET/SEAL** Mimi
   Sahor in the same beat. The All-Beast comes apart, the heads dissolve into freed creatures, and the
   skyline clears. **THE END of World 4.**

A short ending cutscene reuses the existing `startCutscene` system (and the star + Super-Ramsi art).

---

## Fairness / pacing
- One head active at a time (others only do light ambient hazards) so the player always knows the
  "current verb." A floating prompt names the needed mechanic the first time each head wakes.
- Each head = ~2 clean hits with its mechanic → the fight is long but never a damage-sponge.
- Checkpoints between heads (or between the three acts: Air → Earth → Fire) so a death doesn't replay
  the whole gauntlet.
- If a player is missing a skill (shouldn't happen by World 4), that head's prompt teaches it in-arena.

## Implementation hooks (fits the current engine)
- Model it like the existing multi-stage bosses (`Bosses.spawn`, per-boss `update`/`hits`): one boss
  entity with a `heads[]` array, an `activeHead` index, and a `phase` per head. Reuse each head's
  existing sprite (EXT_BOSS_KEYS already has gustwing/tempestia/gnash/geode/cerberus + new blazagon).
- Each head's KO check reuses the SAME code paths that already exist: companion shield-headbutt,
  `Game.smashCrack` (ram), roll/pound/shrink/decoy/glow events, `checkToolCatch('net'/'harpoon'/'bone')`.
  So phases are mostly wiring existing verbs to head-hitboxes — low new-mechanic risk.
- New art needed: the fused body + the 7-head rig (one big sheet), Super Ramsi (ASSETS_WORLD3 §5),
  star FX (§4). Heads can start as palette-tinted reuses of existing boss sprites if you want it sooner.
- Suggested new files: `src/22_world4.js` (arena + boss), extend `12_main` cutscene list with the
  ending, add a World-4 node + entry gated on all 4 star-cells.
