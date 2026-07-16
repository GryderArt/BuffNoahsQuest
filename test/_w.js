const H=require('./harness'); const fs=require('fs'); const {NQ}=H; const {Game,Player,SideScroll}=NQ;
H.startPlay(); Game.flags.wings=true; SideScroll.start('bramble', false); const S=SideScroll.active;
S.camX = 0; S.p.x=8*16; S.p.y=6*16; S.p.onG=false; S.p.vy=-40; S.p.face=1; S.p.flapT=0.15;
Game.banners=[]; Game.toasts=[]; H.render();
fs.writeFileSync(__dirname+'/../shots/wings_road.png', H.canvas.toBuffer('image/png'));
console.log('rendered');
