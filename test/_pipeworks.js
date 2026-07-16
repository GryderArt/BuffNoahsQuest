const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player, MAPS, TILEDEFS } = NQ;
const carveable = (x,y) => { const id=Game.map.tiles[y][x], d=TILEDEFS[id]||{}; if(id==='crack'||id==='softblock')return true; return !d.solid; };
const solidAt = (m,x,y) => (TILEDEFS[m.tiles[y][x]]||{}).solid === true;

H.startPlay(); Game.enterSlot('city'); Game.loadMap('cog2');
if (Game.paintPipeworksMaze) Game.paintPipeworksMaze(Game.map, Game.PIPE_MAZES[0]);  // force the canonical maze for deterministic assertions
const m = Game.map; const W = m.w, Hh = m.h;
H.assert(m.id === 'cog2' && Game.companionActive() && m.noFly, 'in the Pipeworks with Ramsi (no-fly)');
let walls=0, brk=0; for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){ const id=m.tiles[y][x]; const d=TILEDEFS[id]||{}; if(id==='crack'||id==='softblock')brk++; else if(d.solid)walls++; }
H.assert(walls > 400, 'a MAZE of UNBREAKABLE pipe walls (' + walls + ')');
H.assert(brk > 300, 'breakable diggable corridors to ram/roll (' + brk + ')');
H.assert(Game.creatures.filter(c => !c.display).length === 0, 'NO enemy monsters');
H.assert(Game.creatures.filter(c => c.display).length >= 3, 'gasping fish in the dried pond');
H.assert(m.tiles[0][17] === 'water' || m.tiles[0][18] === 'water', 'a water SOURCE pours from the top');
H.assert(Game.flags.cog2_flow !== true, 'the pond stays DRY until you carve a channel to it');

// a solvable carve-route exists (the maze is completable)
const seen=new Set(),q=[]; for(const s of m._waterSrc){seen.add(s[0]+','+s[1]);q.push(s);}
while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx>=0&&ny>=0&&nx<m.w&&ny<m.h&&!seen.has(k)&&carveable(nx,ny)){seen.add(k);q.push([nx,ny]);}}}
H.assert([...m._pondSet].some(k=>seen.has(k)), 'a SOLVABLE carve-route from the source to the pond exists');

// RAM + ROLL still work on the corridor tiles
const someCrack=[]; for(let y=1;y<m.h&&!someCrack.length;y++)for(let x=1;x<m.w;x++)if(m.tiles[y][x]==='crack'){someCrack.push(x,y);break;}
Game.smashCrack(m, someCrack[0], someCrack[1]); H.assert(m.tiles[someCrack[1]][someCrack[0]] !== 'crack', 'RAM clears a cracked corridor seam');

// ---- carve ONLY the MINIMAL route (realistic play), then let the water run DOWNHILL ----
function minRoute(){ const prev=new Map(),sn=new Set(),qq=[]; for(const s of m._waterSrc){const k=s[0]+','+s[1];sn.add(k);qq.push(s);} let end=null;
  while(qq.length){const c=qq.shift(),ck=c[0]+','+c[1]; if(m._pondSet.has(ck)){end=ck;break;}
    for(const [dx,dy] of [[0,1],[-1,0],[1,0],[0,-1]]){const nx=c[0]+dx,ny=c[1]+dy,k=nx+','+ny; if(nx>=0&&ny>=0&&nx<W&&ny<Hh&&!sn.has(k)&&carveable(nx,ny)){sn.add(k);prev.set(k,ck);qq.push([nx,ny]);}}}
  const p=[]; for(let k=end;k;k=prev.get(k))p.push(k.split(',').map(Number)); return p; }
const route = minRoute();
H.assert(route.length > 40, 'the minimal carve-route is a real maze run (' + route.length + ' tiles)');
for(const [x,y] of route){ if(m.tiles[y][x]==='crack'||m.tiles[y][x]==='softblock') m.tiles[y][x]='cogfloor'; }
Game.flags.cog2_flow=false; Game.floodPipes(m);
H.assert(Game.flags.cog2_flow === true, 'carving a channel DOWN to the pond FLOODS it');
H.assert(m._pondTiles.every(t => m.tiles[t[1]][t[0]] === 'water'), 'the WHOLE dried pond fills with water (sand -> water)');
const f0 = Game.creatures.find(c => c.display);
H.assert((TILEDEFS[m.tiles[f0.y/16|0][f0.x/16|0]] || {}).swim === true, 'the revived fish can SWIM');

// ---- SMART WATER #1: a sealed dead-end pipe going UP stays DRY (water never climbs) ----
let bx=-1, by=-1; for(let y=16;y<32&&bx<0;y++)for(let x=2;x<W-2;x++) if(m.tiles[y][x]==='wetpipe'){ bx=x; by=y; break; }
H.assert(bx>0, 'found a flowing channel tile to branch from');
const up=[]; for(let y=by-1;y>=by-5&&y>1;y--){ m.tiles[y][bx-1]='gearwall'; m.tiles[y][bx+1]='gearwall'; m.tiles[y][bx]='cogfloor'; up.push([bx,y]); }
if(by-6>1) m.tiles[by-6][bx]='gearwall';                 // cap it -> a true dead-end going UP
Game.floodPipes(m);
H.assert(up.length>0 && up.every(([x,y]) => m.tiles[y][x] !== 'wetpipe'), 'SMART WATER: a dead-end pipe going UP stays DRY (no climbing — ' + up.length + ' tiles)');

// ---- SMART WATER #2: a carved pocket NOT connected to the source stays DRY ----
let px=-1, py=-1; for(let y=2;y<Hh-2&&px<0;y++)for(let x=2;x<W-2;x++){ if(solidAt(m,x,y)&&solidAt(m,x-1,y)&&solidAt(m,x+1,y)&&solidAt(m,x,y-1)&&solidAt(m,x,y+1)){ px=x; py=y; break; } }
H.assert(px>0, 'found a fully-walled interior cell');
m.tiles[py][px]='cogfloor';                              // carve an ISOLATED pocket (all 4 sides walled)
Game.floodPipes(m);
H.assert(m.tiles[py][px] !== 'wetpipe' && m.tiles[py][px] !== 'water', 'SMART WATER: a carved pocket cut off from the source stays DRY');

// ---- Lady grants STAR-CELL #2 ----
Game.flags.starcells = {}; const lady = m.objects.find(o => o.type==='npc' && o.who==='lady');
Game.state='play'; Game.talkTo(lady); if (Game.dialog && Game.dialog.after) Game.dialog.after();
H.assert(Game.starcellCount() === 1, 'the LADY OF THE LAKE grants STAR-CELL #2');
console.log('PIPEWORKS OK — gravity water: fills the pond on a real carve-route, never climbs up, never wets disconnected pockets');
