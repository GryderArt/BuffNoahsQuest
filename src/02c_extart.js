"use strict";
// ================= external art overrides =================
// build.py fills this object from assets/*.png (base64). Keys are the
// filenames without .png:  noah.down.a / noah.side.b / noah.climb /
// noahdive.* / noahswim.right.a / creature.sheep.a / npc.granny /
// boss.billy / prop.chest / item.heart / gear.sandal / tool.net /
// tree.tree|pine|palm.   Empty object = all-procedural art (the default).
let EXT_ART = {};
