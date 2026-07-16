const H=require('./harness'); const fs=require('fs'); const {createCanvas}=require('canvas'); const {NQ}=H; const {Game,Player}=NQ;
const m=NQ.MAPS.vale;
const bushes=[], stumps=[], props=[];
for (let j=0;j<m.h;j++) for (let i=0;i<m.w;i++){ const id=m.tiles[j][i]; if(id==='bush')bushes.push(i+','+j); if(id==='stump')stumps.push(i+','+j); }
for (const o of m.objects) if (o.type==='prop') props.push(o.sprite+'@'+o.x+','+o.y);
console.log('vale bushes('+bushes.length+'):', bushes.join(' '));
console.log('vale stumps('+stumps.length+'):', stumps.join(' '));
console.log('vale prop objects:', props.length, props.join(' '));
// render around the first bush, zoomed
H.startPlay(); Game.loadMap('vale');
const [bx,by]=bushes[0].split(',').map(Number);
Player.x=bx*16+8; Player.y=(by+3)*16+12; H.step(2); Game.banners=[]; Game.toasts=[]; H.render();
const sx=Math.round(bx*16-Game.camX), sy=Math.round(by*16-Game.camY);
const SRC=2,Z=9,cw=48,ch=48,ox=sx-16,oy=sy-20;
const out=createCanvas(cw*Z,ch*Z),o=out.getContext('2d'); o.imageSmoothingEnabled=false;
o.drawImage(H.canvas, ox*SRC,oy*SRC,cw*SRC,ch*SRC,0,0,cw*Z,ch*Z);
// mark the bush tile center
o.strokeStyle='rgba(255,0,128,.9)'; o.lineWidth=2; o.strokeRect((bx*16-ox)*Z,(by*16-oy)*Z,16*Z,16*Z);
fs.writeFileSync(__dirname+'/../shots/bush_check.png', out.toBuffer('image/png'));
console.log('bush at',bx,by);
