const H = require('./harness'); const fs = require('fs'); const { NQ } = H;
const { Game, Player, TILEDEFS, tileAt } = NQ;
const save = (n) => { Game.banners = []; Game.toasts = []; H.render(); fs.writeFileSync(__dirname + '/../shots/b67n_' + n + '.png', H.canvas.toBuffer('image/png')); };
function applyTool(t, b){ if(t==='mitts'){Player.x=b.x;Player.y=b.y;Player.dir='right';Player.lungeT=0.2;} else if(t==='net'){Player.x=b.x;Player.y=b.y;Player.netT=0.2;} else if(t==='harpoon')Player.harpoon={x:b.x,y:b.y,vx:0,vy:0,dist:0,max:300,state:'out'}; else if(t==='bone')Player.bone={x:b.x,y:b.y,vx:0,vy:0,t:0.1}; }
function beatWarden(tool){ let broke=false; for(let i=0;i<1500&&Game.boss;i++){ const b=Game.boss; Player.hearts=Player.maxHearts; Player.x=b.x-10;Player.y=b.y;Player.dir='right'; Game.companion.x=b.x;Game.companion.y=b.y; if(b.awake&&b.shieldT>0){broke=true;b.inv=0;applyTool(tool,b);} H.step(1);} return broke; }
function grabMove(block,dir,key,tx,ty){ H.face(dir); NQ.hold(' ',true); H.step(3); H.assert(Player.grab===block,'grabbed block'); H.hold(key,true); let g=0; while((block.x!==tx||block.y!==ty)&&g++<400)H.step(2); H.hold(key,false); H.step(16); NQ.hold(' ',false); H.step(4); H.assert(block.x===tx&&block.y===ty,'block at ('+tx+','+ty+')'); }
function catchOne(species,method){ const c=Game.creatures.find(cc=>cc.species===species&&cc.state!=='gone'); if(!c)throw new Error('no '+species); c.vx=c.vy=0;c.wanderT=999;c.x=Player.x+18;c.y=Player.y;H.face('right'); Player.tool=method;Player.useTool();H.step(25); H.assert(c.state==='gone','caught '+species+' ('+method+')'); }
function gear(){ Object.assign(Game.flags,{ramsi:true,world2:true,ramHead:true,ramStun:true,ramShield:true,ramBoost:true,ramsuit:true,sandals:true,gloves:true,bracers:true,suit:true,wings:true,net:true,harpoon:true,bone:true,cage:true}); Game.flags.baits={clover:9,tincan:9,fishsnack:9,cookie:9,berry:9}; }

H.startPlay(); gear();
// ================= WORLD 6 — ROOT HOLLOWS (have Glow+Shrink) =================
Object.assign(Game.flags,{ramGlow:true,ramShrink:true});
Game.loadMap('burrow6'); Game.state='play'; H.place(6,33); H.step(3); save('6_entry');
const h6={}; for(const cr of Game.creatures) h6[cr.species]=(h6[cr.species]||0)+1;
H.assert(h6.octopus>=2&&h6.goat>=2,'W6 sap-caverns stocked: '+JSON.stringify(h6));
H.place(12,31); catchOne('octopus','harpoon'); H.place(5,23); catchOne('goat','net');
// combo: SHRINK gate
H.place(34,11); H.step(20); Game.ramsiCommand();
H.assert(Game.flags.b6_g1 && Game.doorIsOpen(Game.map,36,11),'W6: SHRINK drops the gate');
// HARPOON the sap-fall
H.place(39,11); H.face('right'); Player.tool='harpoon'; Player.useTool(); H.step(70);
H.assert(Player.x/16>43,'W6: HARPOON-post crossed the sap-fall (x='+(Player.x/16).toFixed(1)+')');
// BRACER bridge
const blk6=Game.map.objects.find(o=>o.id==='b6_blk1'); H.place(46,11); grabMove(blk6,'right','ArrowRight',51,11);
H.assert(tileAt(Game.map,52,11)==='bridge','W6: bracer bridge spans the pit');
// THORNBACK -> Beast Mimi -> Bounce+Decoy
H.place(56,11); H.step(2); H.assert(Game.boss&&Game.boss.name==='thornback','Thornback present');
Game.companion.x=Game.boss.x; Game.companion.y=Game.boss.y; save('6_thornback');
H.assert(beatWarden('net'),'W6: Ramsi headbutts, Noah NETS Thornback'); H.assert(Game.flags.thornback,'Thornback beaten');
H.place(61,7); H.face('up'); Game.interact();
H.assert(Game.flags.ramBounce&&Game.flags.ramDecoy,'W6: freeing Beast Mimi awakens Bounce+Decoy');
// BOUNCE exit
H.place(60,19); H.step(20); H.assert(Game.tryBounce(),'W6: bounce off the pad'); H.step(55);
H.assert(Player.y/16>30,'W6: BOUNCE sprang over the ridge to the exit shelf (y='+(Player.y/16).toFixed(1)+')');

// ================= WORLD 7 — CRYSTAL DEEP (have Bounce+Decoy) =================
gear(); Object.assign(Game.flags,{ramGlow:true,ramShrink:true,ramBounce:true,ramDecoy:true});
Game.loadMap('burrow7'); Game.state='play'; H.place(6,8); H.step(3); save('7_entry');
const h7={}; for(const cr of Game.creatures) h7[cr.species]=(h7[cr.species]||0)+1;
H.assert(h7.capricorn>=2&&h7.ibex>=2,'W7 crystal caverns stocked: '+JSON.stringify(h7));
H.place(10,28); catchOne('capricorn','harpoon'); H.place(6,6); catchOne('ibex','net');
// DECOY the jelly-swarm (the secret guard)
H.place(5,37); H.step(2); Game.ramsiCommand(); H.assert(Game.companion.decoyT>0,'W7: DECOY taunts the jelly-swarm');
// BOUNCE shelf
H.place(33,20); H.step(20); H.assert(Game.tryBounce(),'W7: bounce the crystal shelf'); H.step(55);
H.assert(Player.x/16>36,'W7: BOUNCE cleared the shelf');
// BRACER bridge
const blk7=Game.map.objects.find(o=>o.id==='b7_blk1'); H.place(38,20); grabMove(blk7,'right','ArrowRight',43,20);
H.assert(tileAt(Game.map,44,20)==='bridge','W7: crystal bridge forms');
// HARPOON post
H.place(48,20); H.face('right'); Player.tool='harpoon'; Player.useTool(); H.step(70);
H.assert(Player.x/16>52,'W7: HARPOON crossed to the Golem vault');
// GEODE -> Toothless -> Glide+Roll
H.place(56,14); H.step(2); H.assert(Game.boss&&Game.boss.name==='geode','Geode present');
Game.companion.x=Game.boss.x; Game.companion.y=Game.boss.y; save('7_geode');
H.assert(beatWarden('harpoon'),'W7: Ramsi headbutts, Noah HARPOONS Geode'); H.assert(Game.flags.geode,'Geode beaten');
H.place(61,7); H.face('up'); Game.interact();
H.assert(Game.flags.ramGlide&&Game.flags.ramRoll,'W7: freeing Toothless awakens Glide+Roll');
// GLIDE exit
H.place(56,23); H.step(20); Game.ramsiCommand(); H.assert(!!Player.gArc&&Player.gArc.kind==='glide','W7: glide starts'); H.step(90);
H.assert(Player.x/16>59,'W7: GLIDE crossed the great star-chasm to the exit');
console.log('BURROW 6 & 7 (new) OK — open herds, escalating combos, headbutt Wardens, ability-gated exits');
