const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player, MAPS } = NQ;
H.startPlay();
const m = MAPS.vale;
const ids = ['soil','rootwall','glowvein','crystal','softblock','holegap','bouncecap','updraft'];
// lay the 8 new tiles in a row right where Noah stands so the camera frames them
const sx = m.start.x, sy = m.start.y;
ids.forEach((id,i)=>{ for(let dy=0;dy<3;dy++) m.tiles[sy+dy][sx+i] = id; });
m.dark = false;
Game.loadMap('vale', sx, sy+1);
Player.x = (sx+4)*16+8; Player.y = (sy+1)*16+12;
Game.banners=[]; Game.toasts=[];
H.render();
fs.writeFileSync(__dirname+'/../shots/_tileswatch.png', H.canvas.toBuffer('image/png'));
console.log('rendered tiles:', ids.join(', '));
