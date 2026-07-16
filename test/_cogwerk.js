const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player, MAPS, CREATURES, TILEDEFS } = NQ;
const tileAt = (x, y) => Game.map.tiles[y][x];
const D = (c) => Math.hypot(c.x - Player.x, c.y - Player.y);
function settle(n){ Player.gArc=null; Player.airborne=false; if(Game.companion){Game.companion.busyT=0;Game.companion.poundCool=0;Game.companion.glide=0;Game.companion.rollT=0;} H.step(n||1); }
const live = (sp) => Game.creatures.find(c => c.species === sp && c.state !== 'gone');

H.startPlay(); Game.enterSlot('city');
Object.assign(Game.flags, { intro_cog1: 1, intro_cog2: 1, intro_cog3: 1, intro_cog4: 1 }); Game._pendingIntro = null; Game.dialog = null;
H.assert(Game.mapId === 'cog1' && Game.companionActive() && Game.map.noFly, 'in Cogwerk City with Ramsi (no-fly)');
H.assert(Game.map.tiles[5][3]==='sky' && Game.map.tiles[5][48]==='sky' && Game.map.objects.some(o=>o.type==='clock'), 'the tower stands against an open SUNSET SKY with a great CLOCK on top');
H.assert(Game.map.viewScale && Game.map.viewScale < 1, 'the camera is pulled back (viewScale<1) so the full-size tower is framed by wide sky');
const pests = Game.creatures.filter(c => CREATURES[c.species] && CREATURES[c.species].pest);
H.assert(pests.length >= 10, 'the plaza is overrun with haywire pests (' + pests.length + ')');
const stuck = pests.filter(c => { const d = TILEDEFS[tileAt(c.x/16|0, c.y/16|0)] || {}; return d.solid || d.hole || d.rift; });
H.assert(stuck.length === 0, 'no pest stuck in a wall');
H.assert(CREATURES.sparkdrone.dazeImmune && CREATURES.voltbug.aggressive && CREATURES.coghopper.skittish, 'diverse pest behaviours incl. daze-immune');

// daze-immunity: Volt-Bug dazed, Spark-Drone not (and it hurts Noah)
settle(2); H.place(25,38); Game.companion.x=Player.x; Game.companion.y=Player.y;
const vb=live('voltbug'), sd=live('sparkdrone'); vb.x=Player.x+8;vb.y=Player.y;vb.stun=0; sd.x=Player.x-8;sd.y=Player.y;sd.stun=0; H.step(3);
H.assert(vb.stun>0 && sd.stun<=0, 'Ramsi dazes a Volt-Bug but a Spark-Drone is immune');

// Trader: quest but NO gear yet; clocktower JAMMED
const tr = Game.map.objects.find(o => o.type==='npc' && o.who==='supreme_trader');
Game.state='play'; Game.talkTo(tr); H.assert(Game.flags.cog_quest && Game.flags.has_mastergear!==true, 'Trader gives the quest but withholds the gear'); Game.state='play'; Game.dialog=null;
settle(1); H.place(26,28); H.step(1); H.assert(Game.tryBounce()===false, 'the climb is JAMMED before clearing/socketing');

// clear the city -> Trader hands over the gear -> socket it
for (const c of pests) c.state='gone'; Game.onCaptureQuests('voltbug'); H.assert(Game.flags.cog_cleared, 'catching all pests clears the city');
Game.state='play'; Game.talkTo(tr); H.assert(Game.flags.has_mastergear===true, 'after clearing, the Trader gives the gear'); Game.state='play'; Game.dialog=null;
settle(1); H.place(23,28); Player.dir='up'; Game.interact(); H.assert(Game.flags.cog_started===true, 'socketing the gear starts the clocktower');

// THE LINEAR CLIMB: bounce -> glide -> shrink -> roll -> pound -> star
settle(1); H.place(26,28); H.step(1); H.assert(Game.tryBounce()===true, '(1) BOUNCE works now'); H.step(70); H.assert((Player.y/16|0)<=24, '    ...up to Ledge 1');
settle(2); H.place(19,23); Player.dir='up'; H.step(1); Game.ramsiCommand(); H.step(70); H.assert((Player.y/16|0)<=18, '(2) GLIDE (left) across the steam-gap to Ledge 2');
settle(2); H.place(34,17); Player.dir='up'; H.step(1); Game.ramsiCommand(); H.step(5); H.assert(Game.flags.cog_grate && Game.doorIsOpen(Game.map,35,16), '(3) SHRINK (right) opens the grate');
settle(2); H.place(20,13); Player.dir='up'; H.step(1); Game.ramsiCommand(); H.step(40); H.assert(tileAt(20,12)!=='softblock', '(4) ROLL (left) clears the barricade');
settle(2); H.place(34,11); Player.dir='up'; H.step(1); Game.companion.x=Player.x; Game.companion.y=Player.y; Game.ramsiCommand(); H.step(5); H.assert(Game.flags.cog_vault && Game.doorIsOpen(Game.map,34,8), '(5) POUND (right) cracks the vault');
settle(2); H.place(26,6); H.step(4); H.assert(Game.starcellCount()===1, '    STAR-CELL claimed');
H.assert(Game.map.objects.some(o=>o.type==='portal'&&o.to==='cog2'), 'the vault has the PIPE down to the Pipeworks');
console.log('COGWERK OK — linear climb (bounce/glide/shrink/roll/pound), no skips/sidesteps, gear-after-clear, daze-immune drones');
