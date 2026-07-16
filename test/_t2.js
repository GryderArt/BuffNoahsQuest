const fs=require('fs');
// Boot the game code in a sandbox that exposes TileArt by hooking applyExtArt timing.
const H=require('./harness');
// TileArt is a top-level const in 05_tiles.js (global via indirect eval). Try global.TileArt
console.log('global.TileArt?', typeof global.TileArt, global.TileArt && Object.keys(global.TileArt).slice(0,8));
if (global.TileArt) for (const k of ['tree','pine','palm']) { const t=global.TileArt[k]; if (t) console.log(k, t.width+'x'+t.height, 'dens='+(t.dens||1), '-> logical', (t.width/(t.dens||1)).toFixed(1)+'x'+(t.height/(t.dens||1)).toFixed(1)); }
