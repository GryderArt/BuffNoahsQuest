"use strict";
// ================= MAP EDITS — level-editor tile/elev overrides =================
// The level editor (level_editor.html) can load ANY game map, let you repaint its
// tiles and elevation, and export `<mapid>.edit.json`. Drop that file into
// customlevels/ and `python3 build.py` embeds it into MAP_EDITS (02c). This file
// applies each edit AFTER the whole buildMaps wrapper chain (crystal crown etc.),
// replacing ONLY tiles + elev (+ optional size) — objects, doors, links, spawns
// and start stay exactly as the code built them. Delete the .edit.json and
// rebuild to fall back to the coded map. Run validate + audit after any edit!
(function () {
  function applyMapEdits() {
    if (typeof MAP_EDITS === 'undefined' || !MAP_EDITS) return;
    for (const id of Object.keys(MAP_EDITS)) {
      const m = MAPS[id], e = MAP_EDITS[id];
      if (!m || !e || !e.tiles) continue;
      const w = e.w || m.w, h = e.h || m.h;
      m.w = w; m.h = h;
      m.tiles = e.tiles.map(row => row.slice());
      m.elev = (e.elev && e.elev.length ? e.elev : []).map(row => row.slice());
      while (m.elev.length < h) m.elev.push(new Array(w).fill(0));
      for (const row of m.tiles) while (row.length < w) row.push(m.tiles[0][0]);
      // keep everything in bounds if the edit shrank the map
      m.start.x = Math.min(m.start.x, w - 1); m.start.y = Math.min(m.start.y, h - 1);
      m._edited = true;
    }
  }
  const _bm = buildMaps;
  buildMaps = function () { _bm(); applyMapEdits(); };
  if (typeof MAPS !== 'undefined' && Object.keys(MAPS).length) applyMapEdits();
})();
