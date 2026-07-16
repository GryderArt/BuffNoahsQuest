const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player, MAPS } = NQ;
const save=(n)=>{Game.banners=[];Game.toasts=[];H.render();fs.writeFileSync(__dirname+'/../shots/ice_'+n+'.png',H.canvas.toBuffer('image/png'));};
H.startPlay();
H.assert(MAPS.icefield && MAPS.icefield.custom===true, "Noah's Ice Field built (custom)");
// SECRET portal: hidden up behind the summit, gated on all 5 tools
const portal = Game.map.objects.find(o=>o.type==='portal'&&o.to==='icefield');
H.assert(portal && portal.x===8 && portal.y===1 && portal.req==='tools5' && portal.secret===true, 'hidden tool-gated rift at the summit top (8,1)');
H.assert(!Game.map.objects.some(o=>o.type==='sign'&&/RIFT|SUMMIT|rift|summit/.test(o.text||'')), 'no hint signs in the Vale');
// WITHOUT the 5 tools: the rift is inactive (and hidden)
Game.flags.net=Game.flags.cage=Game.flags.harpoon=Game.flags.bone=false;
H.assert(Game.lookupFlag('tools5')===false, 'tools5 is false without the tools');
H.place(8,1); H.step(2);
H.assert(Game.mapId==='vale', 'stepping on the spot does NOTHING without all 5 tools');
// WITH all 5 tools: it activates
Object.assign(Game.flags,{net:true,cage:true,harpoon:true,bone:true});
H.assert(Game.lookupFlag('tools5')===true, 'tools5 true once you own net+cage+harpoon+bone');
H.place(8,1); H.step(2);
H.assert(Game.mapId==='icefield', 'now the rift opens into the Ice Field');
save('1_icefield');
// WARPS now loop to EACH OTHER (not back to start): warp (8,1) -> (17,6)
H.place(8,1); H.step(1);
H.assert((Player.x/16|0)===17 && (Player.y/16|0)===6, 'warp loops to the NEXT warp (8,1 -> 17,6), not the start');
// the EXIT returns near the hidden rift
const ex = Game.map.links.find(L=>L.to==='vale');
H.place(ex.x, ex.y); H.step(2);
H.assert(Game.mapId==='vale' && (Player.y/16|0)===2, 'exit drops Noah back by the summit rift');
console.log('ICE FIELD OK — hidden 5-tool-gated rift, no signs, looping warps, clean exit');
