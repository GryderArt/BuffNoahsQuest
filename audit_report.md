# BUFF NOAH — AUDIT REPORT v2 (2026-07-12)
Stage reachability + puzzle solvers + WALK-AROUND detection + intent gates + softlocks.

## grotto1  (Goat Grotto — Entry Cavern) — stage: w1 [lenient]
- items: 6 ok, 0 backtrack-only, 0 NEVER

## grotto2  (Goat Grotto — The Great Chasm) — stage: w1 [lenient]
- items: 7 ok, 0 backtrack-only, 0 NEVER

## grotto3  (Goat Grotto — The Bracer Works) — stage: w1 [lenient]
- items: 10 ok, 0 backtrack-only, 0 NEVER
- logic path:
  1. sw_grotto3_1  <-  block on switch
  1. sw_grotto3_2  <-  block on switch
  1. sw_grotto3  <-  block on switch
- note: machine sw_grotto3_2 opens no new ground (loot/cosmetic?)

## grotto4  (Goat Grotto — Billy's Hall) — stage: w1 [lenient]
- items: 3 ok, 0 backtrack-only, 0 NEVER
- logic path:
  1. billy  <-  beat BILLY in its den

## keep1  (Hound's Keep — Star Halls) — stage: w1 [lenient]
- items: 7 ok, 0 backtrack-only, 0 NEVER

## keep2  (Hound's Keep — The Triple Locks) — stage: w1 [lenient]
- items: 8 ok, 0 backtrack-only, 0 NEVER
- logic path:
  1. sw_keep2_1  <-  block on switch
  1. sw_keep2_2  <-  block on switch
  1. sw_keep2  <-  block on switch
- note: machine sw_keep2_2 opens no new ground (loot/cosmetic?)

## keep3  (Hound's Keep — Cerberus Den) — stage: w1 [lenient]
- items: 3 ok, 0 backtrack-only, 0 NEVER
- logic path:
  1. cerberus  <-  beat CERBERUS in its den

## void  (The Astral Drift) — stage: w1 [lenient]
- items: 6 ok, 0 backtrack-only, 0 NEVER

## burrow5  (Topsoil Tunnels) — stage: b5
- items: 30 ok, 0 backtrack-only, 0 NEVER
- logic path:
  1. sw_b5mow1  <-  herd job (sheep)
  1. sw_b5sniff  <-  herd job (snowhare)
  1. sw_b5dig1  <-  herd job (goat)
  1. sw_b5ram1  <-  herd job (ram)
  1. sw_b5dig2  <-  herd job (goat)
  1. mottle  <-  beat MOTTLE in its den
  1. kin_1  <-  freed MR. RAM (needs mottle)
  1. ramGlow  <-  gift of MR. RAM
  1. ramShrink  <-  gift of MR. RAM
  1. b5_exit  <-  shrink through the hole
  1. secret_burrow5  <-  shrink through the hole
  1. sw_b5bridge  <-  block on switch
- note: machine sw_b5bridge opens no new ground (loot/cosmetic?)
- gate ok: boss requires PZ
- gate ok: boss requires POST
- gate ok: boss requires CRACK
- gate ok: exit requires DOOR

## burrow6  (Root Hollows) — stage: b6
- items: 33 ok, 0 backtrack-only, 0 NEVER
- logic path:
  1. sw_b6drain  <-  sap-flow puzzle
  1. sw_b6gate  <-  sap-flow puzzle
  1. sw_b6bloom  <-  sap-flow puzzle
  1. sw_b6vault  <-  sap-flow puzzle
  1. sw_b6bridge  <-  sap-flow puzzle
  1. sw_b6den  <-  sap-flow puzzle
  1. sw_b6gems  <-  sap-flow puzzle
  1. secret_burrow6  <-  shrink through the hole
  1. thornback  <-  beat THORNBACK in its den
  1. kin_2  <-  freed BEAST MIMI (needs thornback)
  1. ramBounce  <-  gift of BEAST MIMI
  1. ramDecoy  <-  gift of BEAST MIMI
- sap: 36 states, per-rune: {"sw_b6drain":9,"sw_b6gate":9,"sw_b6bloom":9,"sw_b6vault":3,"sw_b6bridge":3,"sw_b6den":1,"sw_b6gems":1}
- note: machine sw_b6drain opens no new ground (loot/cosmetic?)
- note: machine sw_b6bridge opens no new ground (loot/cosmetic?)
- gate ok: boss requires DOOR
- gate ok: boss requires POST
- gate ok: boss requires PZ
- gate ok: exit requires BOUNCE

## burrow7  (Crystal Deep) — stage: b7
- items: 42 ok, 0 backtrack-only, 0 NEVER
- logic path:
  1. b7_srx  <-  light-beam puzzle
  1. b7_gate0  <-  light-beam puzzle
  1. b7_g2  <-  light-beam puzzle
  1. b7_vault  <-  light-beam puzzle
  1. secret_burrow7  <-  shrink through the hole
  1. geode  <-  beat GEODE in its den
  1. kin_3  <-  freed TOOTHLESS (needs geode)
  1. ramGlide  <-  gift of TOOTHLESS
  1. ramRoll  <-  gift of TOOTHLESS
- beams: 6 turnables, per-rune: {"b7_srx":2048,"b7_gate0":2048,"b7_g2":40960,"b7_vault":2560}, bridge states: 10240
- gate ok: boss requires BOUNCE
- gate ok: boss requires LIT
- gate ok: boss requires POST
- gate ok: exit requires GLIDE

## burrow8  (The Hoard Descent) — stage: b8
- items: 30 ok, 0 backtrack-only, 0 NEVER
- logic path:
  1. b8_g1  <-  shrink through the hole
  1. secret_burrow8  <-  shrink through the hole
  1. b8_j1  <-  boomer-bone throw
  1. grub  <-  beat GRUB in its den
  1. kin_4  <-  freed LUCKY (needs grub)
  1. ramPound  <-  gift of LUCKY
  1. b8_seal  <-  ground-pound
  1. sw_b8j2  <-  block on switch
- gate ok: boss requires RAIL
- gate ok: boss requires DOOR
- gate ok: boss requires POST
- gate ok: exit requires RAIL
- gate ok: exit requires DOOR
- gate ok: exit requires POST

---
# FINDINGS
## Errors (0)
## Warnings (0)
