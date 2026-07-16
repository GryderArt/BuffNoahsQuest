// Reachability for road platforms: BFS over stand-cells using the real jump physics.
const H = require('./harness');
const { NQ } = H;
const LV = NQ.ROAD_LEVELS;
const SOLID = ch => '#=B'.includes(ch);
function mk(level){
  const rows = level.rows, W = level.w, HH = 14, g = level.gravity || 1;
  const tile = (i,j) => (i<0||i>=W) ? '#' : (j<0||j>=HH) ? ' ' : (rows[j][i]||' ');
  const solid = (x,y) => SOLID(tile(Math.floor(x/16), Math.floor(y/16)));
  // simulate a jump from standing on solidRow at col, with horiz input ax and hold, vy0
  function jump(col, sr, ax, hold, vy0){
    const half=5, top=15;
    let x = col*16+8, y = sr*16 - 0.01, vx = ax*118, vy = vy0;
    for (let s=0;s<260;s++){
      const target = ax*118; vx += Math.max(-640/60, Math.min(640/60, target - vx));
      const rising = vy < 0 && hold; vy += (rising ? g*760*0.55 : g*760)/60; vy = Math.min(vy,330);
      x += vx/60;
      if (vx>0 && (solid(x+half,y-2)||solid(x+half,y-top+2))) { x = Math.floor((x+half)/16)*16-half-0.01; vx=0; }
      else if (vx<0 && (solid(x-half,y-2)||solid(x-half,y-top+2))) { x = Math.ceil((x-half)/16)*16+half+0.01; vx=0; }
      x = Math.max(6, Math.min(W*16-6, x));
      y += vy/60;
      if (vy>=0 && (solid(x-half+1,y)||solid(x+half-1,y))) { y = Math.floor(y/16)*16-0.01; vy=0; if (s>2) return [Math.floor(x/16), Math.round(y/16)]; }
      else if (vy<0 && (solid(x-half+1,y-top)||solid(x+half-1,y-top))) { y = Math.ceil((y-top)/16)*16+top+0.01; vy=0; }
      if (y > HH*16+40) return null;
    }
    return null;
  }
  // all stand cells: solid tile with non-solid directly above
  const stand = new Set();
  for (let j=0;j<HH;j++) for (let i=0;i<W;i++) if (SOLID(tile(i,j)) && !SOLID(tile(i,j-1))) stand.add(i+','+j);
  // springs: col -> spring exists (launches -420)
  const springs = [];
  for (let j=0;j<HH;j++) for (let i=0;i<W;i++) if (tile(i,j)==='S') springs.push([i,j]);
  // seed: ground stand-cells in the spawn area (leftmost solid columns), then BFS
  const reach = new Set();
  const q = [];
  // spawn stands on the lowest solid of col 1
  for (let j=HH-1;j>=0;j--) if (SOLID(tile(1,j)) && !SOLID(tile(1,j-1))) { reach.add('1,'+j); q.push([1,j]); break; }
  const add = (cell) => { if (cell && stand.has(cell[0]+','+cell[1]) && !reach.has(cell[0]+','+cell[1])) { reach.add(cell[0]+','+cell[1]); q.push(cell); } };
  while(q.length){
    const [col,sr] = q.shift();
    // walk along flat ground
    add([col+1,sr]); add([col-1,sr]);
    // small step up/down to neighbor stand cells (1 tile)
    for (const d of [-1,1]) for (const dr of [-1,0,1]) if (stand.has((col+d)+','+(sr+dr))) add([col+d,sr+dr]);
    // jumps
    for (const ax of [-1,0,1]) for (const hold of [true,false]){ add(jump(col,sr,ax,hold,-262)); }
    // a nearby spring (within 3 cols, roughly same height) gives a big launch
    for (const [si,sj] of springs) if (Math.abs(si-col)<=3 && Math.abs(sj-sr)<=2) for (const ax of [-1,0,1]) add(jump(si,sr,ax,true,-420));
  }
  // platforms = '=' tiles; reachable if you can stand on them
  const plats = [];
  for (let j=0;j<HH;j++) for (let i=0;i<W;i++) if (tile(i,j)==='=') plats.push([i,j]);
  const bad = plats.filter(([i,j]) => !reach.has(i+','+j));
  return { plats: plats.length, bad };
}
let anyBad = false;
for (const id of Object.keys(LV)){
  const r = mk(LV[id]);
  // group bad tiles into contiguous platform runs for readability
  const runs = [];
  r.bad.sort((a,b)=> a[1]-b[1] || a[0]-b[0]);
  for (const [i,j] of r.bad){ const last=runs[runs.length-1]; if (last && last.j===j && i===last.i2+1) last.i2=i; else runs.push({j, i1:i, i2:i}); }
  console.log(`${id}: ${r.plats} platform tiles, ${r.bad.length} unreachable` + (runs.length?'  -> '+runs.map(rn=>`row ${rn.j} cols ${rn.i1}-${rn.i2}`).join('; '):''));
  if (r.bad.length) anyBad = true;
}
console.log(anyBad ? 'REACH: some platforms unreachable' : 'REACH OK: all platforms reachable');
