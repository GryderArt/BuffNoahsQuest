// REPLAY VALUE: the Pipeworks rolls a random maze each fresh attempt; every variant must be solvable.
const H = require('./harness'); const { NQ } = H; const { Game, TILEDEFS } = NQ;
H.startPlay(); Game.enterSlot('city');
const carveable = (m,x,y) => { const id=m.tiles[y][x], d=TILEDEFS[id]||{}; return id==='crack'||id==='softblock'||!d.solid; };
function solvable(m){ const seen=new Set(),q=[]; for(const s of m._waterSrc){seen.add(s[0]+','+s[1]);q.push(s);}
  while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx>=0&&ny>=0&&nx<m.w&&ny<m.h&&!seen.has(k)&&carveable(m,nx,ny)){seen.add(k);q.push([nx,ny]);}}}
  return [...m._pondSet].some(k=>seen.has(k)); }

H.assert(Game.PIPE_MAZES && Game.PIPE_MAZES.length >= 3, 'there are 3+ maze variants for replay value');
// force-paint EACH variant and confirm it is solvable + correctly shaped
let shapes = new Set();
for (let i=0;i<Game.PIPE_MAZES.length;i++){
  Game.loadMap('cog2'); const m = Game.map;
  Game.paintPipeworksMaze(m, Game.PIPE_MAZES[i]);
  let walls=0,brk=0; for(let y=0;y<33;y++)for(let x=0;x<m.w;x++){const id=m.tiles[y][x],d=TILEDEFS[id]||{}; if(id==='crack'||id==='softblock')brk++; else if(d.solid)walls++;}
  H.assert(walls>400 && brk>300, 'variant '+i+' is a proper dense maze (walls '+walls+', corridors '+brk+')');
  H.assert(solvable(m), 'variant '+i+' has a solvable carve-route to the pond');
  shapes.add(Game.PIPE_MAZES[i].join('|'));
}
H.assert(shapes.size === Game.PIPE_MAZES.length, 'all maze variants are DISTINCT');
// a fresh entry while unsolved actually rolls a maze (source + start are set)
Game.flags.cog2_flow = false; Game.loadMap('cog2');
H.assert(Game.map._waterSrc && Game.map._waterSrc.length >= 1 && Game.map.start.y === 1, 'entering unsolved rolls a maze with a top source + start');
console.log('RANDMAZE OK — 3 distinct, solvable maze variants; a random one loads each attempt');
