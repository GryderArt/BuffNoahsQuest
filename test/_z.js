const H = require('./harness');
const fs = require('fs');
const { createCanvas } = require('canvas');
const { NQ } = H;
const { Game, Player } = NQ;
H.startPlay(); Game.loadMap('vale');
// confirm the spirit object exists and its tile is not a pine
const sp = Game.map.objects.find(o => o.type === 'npc' && o.who === 'spirit');
console.log('spirit at', sp && (sp.x + ',' + sp.y), '| tile under it =', Game.map.tiles[sp.y][sp.x], '| npc sprite?', !!NQ.Sprites.npcs.spirit);
console.log('tiles 5-7 x 4-6:', [4,5,6].map(r => [5,6,7].map(c => Game.map.tiles[r][c]).join(' ')).join(' | '));
for (const c of Game.creatures) c.state = 'gone';   // clear snowhares for a clean shot
Player.x = 8 * 16 + 8; Player.y = 8 * 16 + 12; H.step(2); Game.banners = []; Game.toasts = []; H.render();
const sx = Math.round(6 * 16 - Game.camX), sy = Math.round(5 * 16 - Game.camY);
const SRC = 2, Z = 8, ox = sx - 40, oy = sy - 44, cw = 84, ch = 84;
const out = createCanvas(cw * Z, ch * Z), o = out.getContext('2d'); o.imageSmoothingEnabled = false;
o.drawImage(H.canvas, ox * SRC, oy * SRC, cw * SRC, ch * SRC, 0, 0, cw * Z, ch * Z);
fs.writeFileSync(__dirname + '/../shots/b_spirit_zoom.png', out.toBuffer('image/png'));
console.log('shot ok');
