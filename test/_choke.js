// PER-MECHANIC no-bypass audit. Model the fully-solved dungeon, then DISABLE one mechanic and
// check each Warden/exit becomes UNREACHABLE — proving that mechanic is REQUIRED (no walk-around).
const H = require('./harness'); const { NQ } = H; const { MAPS, TILEDEFS, tileAt } = NQ;
const D4 = [[1,0],[-1,0],[0,1],[0,-1]];
function reach(m, o) {
  const bridge = new Set();
  if (m.puzzle) for (const pz of m.puzzle) if (pz.to === 'bridge' || pz.to === 'soil') for (const [x,y] of (pz.tiles||[])) bridge.add(x+','+y);
  const lands = {}; if (o.bg) for (const ob of m.objects) if ((ob.type==='bouncepad'||ob.type==='glidevent') && ob.to) lands[ob.x+','+ob.y] = ob.to;
  if (o.rail) for (const ob of m.objects) if (ob.type==='raildock' && ob.to) lands[ob.x+','+ob.y] = ob.to;
  const posts = o.chasm ? m.objects.filter(ob=>ob.type==='post') : [];
  const pass = (i,j) => {
    if (i<0||j<0||i>=m.w||j>=m.h) return false;
    const id = tileAt(m,i,j), d = TILEDEFS[id]||{};
    if (bridge.has(i+','+j)) return o.bridge;
    if (m._beamBridges && m._beamBridges.has(i+','+j)) return o.lit;
    if (id==='chasm'||id==='rift') return false;
    if (d.crack) return o.crack;
    if (d.soft) return o.soft;
    if (id==='water'||id==='deep') return false;
    if (d.door||d.gate) return o.doors;
    if (d.solid) return false;
    return true;
  };
  const seen = new Set([m.start.x+','+m.start.y]); const q=[[m.start.x,m.start.y]];
  while (q.length) { const [i,j]=q.shift();
    for (const [di,dj] of D4){ const ni=i+di,nj=j+dj,k=ni+','+nj; if(!seen.has(k)&&pass(ni,nj)){seen.add(k);q.push([ni,nj]);} }
    const lp=lands[i+','+j]; if(lp){const lk=lp[0]+','+lp[1]; if(!seen.has(lk)){seen.add(lk);q.push(lp);}}
    if(o.chasm) for(const p of posts){ const pk=p.x+','+p.y; if(seen.has(pk))continue; if((p.x===i&&Math.abs(p.y-j)<=7)||(p.y===j&&Math.abs(p.x-i)<=7)){seen.add(pk);q.push([p.x,p.y]);} }
  }
  return seen;
}
const ALL = { doors:1, chasm:1, bridge:1, crack:1, soft:1, bg:1, lit:1, rail:1 };
const adj = (s,x,y) => [[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>s.has((x+a)+','+(y+b)));
// per level: which mechanics MUST gate the Warden, and which gate the EXIT portal
const REQ = {
  burrow5: { warden:['chasm','crack','bridge'], exit:['doors'] },
  burrow6: { warden:['doors','chasm','bridge'], exit:['bg'] },
  burrow7: { warden:['bg','lit','chasm'],       exit:['bg'] },
  burrow8: { warden:['rail','doors','chasm'], exit:['rail','doors','chasm'] },
};
let bad=0;
for (const id of Object.keys(REQ)) {
  const m = MAPS[id]; const boss = m.objects.find(o=>o.type==='boss'); const exit = m.objects.find(o=>o.type==='portal');
  const base = reach(m, ALL);
  if (!adj(base, boss.x, boss.y)) { console.log('!! '+id+' Warden UNREACHABLE even fully solved (bug)'); bad++; }
  for (const mech of REQ[id].warden) { const s = reach(m, Object.assign({}, ALL, {[mech]:0}));
    const r = adj(s, boss.x, boss.y); if (r) { console.log('BYPASS '+id+': Warden reachable without '+mech.toUpperCase()); bad++; } }
  for (const mech of REQ[id].exit) { const s = reach(m, Object.assign({}, ALL, {[mech]:0}));
    const r = adj(s, exit.x, exit.y); if (r) { console.log('BYPASS '+id+': EXIT reachable without '+mech.toUpperCase()); bad++; } }
}
console.log(bad ? ('\n>>> '+bad+' bypass(es) to seal') : '\n>>> TIGHT — every Warden & exit requires its intended mechanics');
