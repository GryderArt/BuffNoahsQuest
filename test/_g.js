const H = require('./harness'); const { NQ } = H;
const m = NQ.MAPS.vale, TD = NQ.TILEDEFS;
const soft = new Set(['grass','flowers','path','pebbles']);
// 1) grass-like tiles that are SOLID/hole/rift (would block despite looking like grass)
let weird = [];
for (let j=0;j<m.h;j++) for (let i=0;i<m.w;i++){ const id=m.tiles[j][i], d=TD[id]||{}; if (soft.has(id) && (d.solid||d.hole||d.rift)) weird.push(id+'@'+i+','+j); }
console.log('grass-like-but-blocking tiles:', weird.length, weird.slice(0,20));
// 2) grass-like tiles with elevation > 0 (invisible step-ups), grouped
const elev = [];
for (let j=0;j<m.h;j++) for (let i=0;i<m.w;i++){ const id=m.tiles[j][i], e=m.elev[j][i]; if (soft.has(id) && e>0) elev.push([i,j,e,id]); }
console.log('grass-like tiles with elev>0:', elev.length);
// cluster by proximity for readability
elev.sort((a,b)=>a[2]-b[2]||a[1]-b[1]||a[0]-b[0]);
const byElev = {};
for (const [i,j,e,id] of elev){ (byElev[e]=byElev[e]||[]).push(i+','+j+'('+id+')'); }
for (const e of Object.keys(byElev)) console.log('  elev '+e+':', byElev[e].join(' '));
