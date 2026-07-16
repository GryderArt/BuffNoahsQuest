"use strict";
// ================= CREATURE DRAW-SCALE (per-species size multiplier) =================
// Multiplier applied ON TOP of ANIMAL_DRAW_SCALE wherever a creature is drawn
// (drawCreature in the overworld/coast/aquarium, and the aviary). 1.0 = default.
// The reef friends' art is nearly as TALL as it is wide, so at 1.0 they loomed
// LARGER than the long-and-flat shark; these bring the little ones back into scale.
// Tune visually with art_editor.html and paste its exported table back over this one.
const CREATURE_SCALE = {
  starfish:   0.55,
  pufferfish: 0.60,
  angelfish:  0.62,
  seahorse:   0.72,
  glowfish:   0.70,
};
