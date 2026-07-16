const H = require('./harness');
const fs = require('fs');
const { createCanvas } = require('canvas');
const { NQ } = H;
const S = NQ.Sprites;
const dspr = global.dspr, sprW = global.sprW, sprH = global.sprH;
console.log('globals present:', typeof dspr, typeof sprW, typeof sprH);
const chest = S.props.chest;
console.log('chest sprite size:', sprW(chest) + 'x' + sprH(chest));
const Z = 8, pad = 8;
const out = createCanvas(220, 130), o = out.getContext('2d');
o.imageSmoothingEnabled = false;
o.fillStyle = '#3a5a3a'; o.fillRect(0,0,out.width,out.height);
function cell(cx, label, scale){
  o.save(); o.translate(cx, 96);
  // 16px tile grid (one cell), zoomed
  o.strokeStyle='rgba(255,0,128,.5)';
  o.strokeRect(0, -16*Z*1.6, 16*Z, 16*Z*1.6);
  o.scale(Z, Z);
  const bx = sprW(chest)/2, by = sprH(chest);
  o.save(); o.translate(bx, by); o.scale(scale, scale); o.translate(-bx, -by);
  dspr(o, chest, 0, sprH(chest)-sprH(chest)); // draw with base at y=sprH
  o.restore(); o.restore();
  o.fillStyle='#fff'; o.font='14px sans-serif'; o.fillText(label, cx+6, 120);
}
// draw chest so its base sits on the grid bottom
function draw(cx, label, scale){
  o.save();
  const gx=cx, gy=20, cellH=16*Z;
  o.strokeStyle='rgba(255,0,128,.55)'; o.strokeRect(gx, gy, 16*Z, cellH);
  o.save(); o.translate(gx, gy+cellH);          // bottom-left of the tile
  o.scale(Z,Z);
  const baseX=8, baseY=0;
  o.translate(baseX, baseY); o.scale(scale,scale); o.translate(-baseX,-baseY);
  dspr(o, chest, 8 - sprW(chest)/2, -sprH(chest)); // base centered, sitting on grid bottom
  o.restore();
  o.fillStyle='#fff'; o.font='13px sans-serif'; o.fillText(label, gx+10, gy+cellH+22);
  o.restore();
}
draw(20, '1x', 1.0);
draw(120, '1.5x', 1.5);
fs.writeFileSync(__dirname + '/../shots/scale_chest_cmp.png', out.toBuffer('image/png'));
console.log('comparison written');
