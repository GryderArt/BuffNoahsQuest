// Renders a whole map as a small top-down overview PNG (tiles + objects) to check layout.
const H = require('./harness'); const fs = require('fs'); const { createCanvas } = require('canvas');
const { NQ } = H; const { MAPS, TILEDEFS, tileAt } = NQ;
const COL = { rootwall:'#3a2616', soil:'#6b4a2c', glowvein:'#4e7a52', crystal:'#5a44b0', chasm:'#0c0814',
  water:'#2a6a8c', deep:'#1c4a66', softblock:'#8a5230', holegap:'#180e06', bridge:'#a8703c', stair:'#b89868',
  switch:'#e84a4a', doorF:'#f8b800', doorB:'#e84a4a', doorL:'#f8b800', wall:'#473a56', floor:'#9aa2b2',
  crack:'#6a6a7a', rock:'#8a8a96', fence:'#7a5230', grass:'#3f9434', sand:'#cba35a', rubble:'#8a8a96', stal:'#5c6474' };
const OBJC = { boss:'#ff2020', post:'#30e0ff', block:'#ff9020', chest:'#f8d048', sign:'#ffffff', npc:'#40ff60',
  pillowkin:'#ff70c0', portal:'#b070ff', lever:'#ffe040', ramhole:'#202020', bouncepad:'#ff90c0', glidevent:'#90e0ff', warp:'#80f0ff' };
const id = process.argv[2] || 'burrow5'; const m = MAPS[id]; const S = 8;
const cv = createCanvas(m.w*S, m.h*S); const c = cv.getContext('2d');
for (let j=0;j<m.h;j++) for (let i=0;i<m.w;i++){ const t=tileAt(m,i,j); c.fillStyle = COL[t]||'#ff00ff'; c.fillRect(i*S,j*S,S,S); }
// puzzle target tiles (what a solved machine becomes) outlined
for (const o of m.objects){ const col=OBJC[o.type]; if(!col) continue; c.fillStyle=col; c.fillRect(o.x*S+1,o.y*S+1,S-2,S-2); if(o.type==='boss'){c.fillStyle='#fff';c.fillRect(o.x*S+3,o.y*S+1,2,S-2);} }
for (const L of m.links){ c.fillStyle='#a0f0a0'; c.fillRect(L.x*S+2,L.y*S+2,S-4,S-4); }
c.strokeStyle='#fff'; c.lineWidth=1; c.strokeRect(m.start.x*S+0.5,m.start.y*S+0.5,S-1,S-1);
fs.writeFileSync(__dirname+'/../shots/ov_'+id+'.png', cv.toBuffer('image/png'));
console.log(id, m.w+'x'+m.h, 'objects:', m.objects.length, '-> shots/ov_'+id+'.png');
