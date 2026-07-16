const H = require('./harness'); const fs = require('fs'); const { createCanvas } = require('canvas');
const { NQ } = H; const { Game, TILEDEFS, drawWorld } = NQ;
H.startPlay(); Game.enterSlot('city'); Game.loadMap('cog2'); const m = Game.map; const W=m.w, Hh=m.h;
const carveable = (x,y) => { const id=m.tiles[y][x], d=TILEDEFS[id]||{}; return id==='crack'||id==='softblock'||!d.solid; };
function renderFull(name){
  const Wpx=W*16, Hpx=Hh*16, cv=createCanvas(Wpx,Hpx), ctx=cv.getContext('2d'); ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#0e0a18'; ctx.fillRect(0,0,Wpx,Hpx);
  for(let cy=0;cy<Hpx;cy+=200) for(let cx=0;cx<Wpx;cx+=300) drawWorld(ctx, m, cx, cy, Game.time||0);
  fs.writeFileSync(__dirname+'/../shots/'+name+'.png', cv.toBuffer('image/png'));
}
function minRoute(){ const prev=new Map(),sn=new Set(),qq=[]; for(const s of m._waterSrc){const k=s[0]+','+s[1];sn.add(k);qq.push(s);} let end=null;
  while(qq.length){const c=qq.shift(),ck=c[0]+','+c[1]; if(m._pondSet.has(ck)){end=ck;break;}
    for(const [dx,dy] of [[0,1],[-1,0],[1,0],[0,-1]]){const nx=c[0]+dx,ny=c[1]+dy,k=nx+','+ny; if(nx>=0&&ny>=0&&nx<W&&ny<Hh&&!sn.has(k)&&carveable(nx,ny)){sn.add(k);prev.set(k,ck);qq.push([nx,ny]);}}}
  const p=[]; for(let k=end;k;k=prev.get(k))p.push(k.split(',').map(Number)); return p.reverse(); }

// 1) fresh, un-carved maze
renderFull('pipe_solid');

// 2) MID-CARVE: carve ~62% of the route from the top -> water descends partway, pond still dry
const route = minRoute();
const cut = Math.floor(route.length*0.62);
for(let i=0;i<cut;i++){ const [x,y]=route[i]; if(m.tiles[y][x]==='crack'||m.tiles[y][x]==='softblock') m.tiles[y][x]='cogfloor'; }
Game.flags.cog2_flow=false; Game.floodPipes(m);
renderFull('pipe_midcarve');
const midPond = m._pondTiles.filter(t=>m.tiles[t[1]][t[0]]==='water').length;
const midWet = (()=>{let n=0;for(let y=0;y<Hh;y++)for(let x=0;x<W;x++)if(m.tiles[y][x]==='wetpipe')n++;return n;})();
let maxWetY=0; for(let y=0;y<Hh;y++)for(let x=0;x<W;x++)if(m.tiles[y][x]==='wetpipe')maxWetY=Math.max(maxWetY,y);

// 3) FULLY carved route -> pond floods
for(const [x,y] of route){ if(m.tiles[y][x]==='crack'||m.tiles[y][x]==='softblock') m.tiles[y][x]='cogfloor'; }
Game.floodPipes(m);
renderFull('pipe_flooded');
const fullPond = m._pondTiles.filter(t=>m.tiles[t[1]][t[0]]==='water').length;
console.log('route len', route.length, '| MID: carved', cut, 'wet channel', midWet, 'maxWetY', maxWetY, 'pond', midPond+'/'+m._pondTiles.length,
  '| FULL: pond', fullPond+'/'+m._pondTiles.length, 'flow', Game.flags.cog2_flow);
