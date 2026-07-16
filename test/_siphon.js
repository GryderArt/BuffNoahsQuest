// REGRESSION: the maze's carved corridors are 1-wide winding tubes that SIPHON (dip into a sealed pit,
// then the only way on is up-and-over). The pond MUST still fill — completion is connectivity, not gravity.
const H = require('./harness'); const { NQ } = H; const { Game, TILEDEFS } = NQ;
H.startPlay(); Game.enterSlot('city'); Game.loadMap('cog2');
const m = Game.map; const W = m.w, Hh = m.h; const sx = m._waterSrc[0][0];
const carve = (x,y) => { m.tiles[y][x] = 'cogfloor'; };

// wall the maze solid, then carve ONE sealed 1-wide siphon: down -> pit -> UP-shaft -> over -> down -> pond
for (let y=1;y<Hh-1;y++) for (let x=1;x<W-1;x++) m.tiles[y][x]='gearwall';
let x=sx; for (let y=0;y<=28;y++) carve(x,y);          // descend into a sealed pit (row 28)
carve(x+1,28); carve(x+2,28); x+=2;                    // short tunnel at the pit floor
for (let y=28;y>=16;y--) carve(x,y);                   // UP-shaft (water must climb this — gravity can't)
carve(x+1,16); carve(x+2,16); x+=2;                    // over the barrier
for (let y=16;y<Hh-2;y++) carve(x,y);                  // down the far side
const pondT = m._pondTiles.find(t=>t[0]===x) || m._pondTiles[0];
for (let y=Hh-2;y<=pondT[1];y++) carve(x,y); carve(pondT[0],pondT[1]);

H.assert(Game.flags.cog2_flow !== true, 'pond starts dry');
Game.floodPipes(m);
H.assert(Game.flags.cog2_flow === true, 'a SIPHON channel (up-and-over) still completes the puzzle');
H.assert(m._pondTiles.every(t => m.tiles[t[1]][t[0]] === 'water'), 'the WHOLE pond fills even though water had to climb a siphon');

// and it must NOT have wet a sealed pocket cut off from the channel
let qx=-1,qy=-1; for(let y=2;y<Hh-2&&qx<0;y++)for(let xx=2;xx<W-2;xx++){ const sld=(a,b)=>(TILEDEFS[m.tiles[b][a]]||{}).solid; if(sld(xx,y)&&sld(xx-1,y)&&sld(xx+1,y)&&sld(xx,y-1)&&sld(xx,y+1)){qx=xx;qy=y;break;} }
if(qx>0){ m.tiles[qy][qx]='cogfloor'; Game.floodPipes(m); H.assert(m.tiles[qy][qx]!=='wetpipe', 'a sealed-off pocket stays DRY (no phantom water)'); }
console.log('SIPHON OK — a winding up-and-over channel fills the pond; sealed pockets stay dry');
