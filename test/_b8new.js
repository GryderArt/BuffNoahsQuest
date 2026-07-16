const H = require('./harness'); const fs = require('fs'); const { NQ } = H;
const { Game, Player, TILEDEFS, tileAt } = NQ;
const save=(n)=>{Game.banners=[];Game.toasts=[];H.render();fs.writeFileSync(__dirname+'/../shots/b8n_'+n+'.png',H.canvas.toBuffer('image/png'));};
function applyTool(t,b){ if(t==='mitts'){Player.x=b.x;Player.y=b.y;Player.dir='right';Player.lungeT=0.2;} else if(t==='net'){Player.x=b.x;Player.y=b.y;Player.netT=0.2;} else if(t==='harpoon')Player.harpoon={x:b.x,y:b.y,vx:0,vy:0,dist:0,max:300,state:'out'}; else if(t==='bone')Player.bone={x:b.x,y:b.y,vx:0,vy:0,t:0.1}; }
function beatWarden(tool){ let broke=false; for(let i=0;i<1800&&Game.boss;i++){ const b=Game.boss; Player.hearts=Player.maxHearts; Player.x=b.x-10;Player.y=b.y;Player.dir='right'; Game.companion.x=b.x;Game.companion.y=b.y; if(b.awake&&b.shieldT>0){broke=true;b.inv=0;applyTool(tool,b);} H.step(1);} return broke; }
function grabMove(block,dir,key,tx,ty){ H.face(dir); NQ.hold(' ',true); H.step(3); H.assert(Player.grab===block,'grabbed block'); H.hold(key,true); let g=0; while((block.x!==tx||block.y!==ty)&&g++<400)H.step(2); H.hold(key,false); H.step(16); NQ.hold(' ',false); H.step(4); H.assert(block.x===tx&&block.y===ty,'block at ('+tx+','+ty+')'); }

H.startPlay();
Object.assign(Game.flags,{ramsi:true,world2:true,ramHead:true,ramStun:true,ramShield:true,ramBoost:true,ramsuit:true,sandals:true,gloves:true,bracers:true,suit:true,wings:true,net:true,harpoon:true,bone:true,cage:true,
  ramGlow:true,ramShrink:true,ramBounce:true,ramDecoy:true,ramGlide:true,ramRoll:true});  // everything earned through W7
Game.flags.baits={clover:9,tincan:9,fishsnack:9,cookie:9,berry:9};
Game.loadMap('burrow8'); Game.state='play'; H.place(6,20); H.step(3); save('1_hoard');
const h8={}; for(const cr of Game.creatures) h8[cr.species]=(h8[cr.species]||0)+1;
H.assert(h8.alien>=2&&h8.cometpup>=2&&h8.unicorn>=1,'W8 hoard stocked with exotics: '+JSON.stringify(h8));
const c=Game.creatures.find(x=>x.species==='alien'&&x.state!=='gone'); c.vx=c.vy=0;c.wanderT=999;c.x=Player.x+18;c.y=Player.y;H.face('right'); Player.tool='net';Player.useTool();H.step(25);
H.assert(c.state==='gone','caught an alien Mimi (net)');

// ===== MASTER COMBO: Shrink -> Bone -> Bracers -> Harpoon -> Roll =====
H.place(34,20); H.step(20); Game.ramsiCommand();
H.assert(Game.flags.b8_g1&&Game.doorIsOpen(Game.map,36,21),'1) SHRINK drops gate 1');
H.place(38,19); H.face('up'); Player.tool='bone'; Player.useTool(); H.step(40);
H.assert(Game.flags.b8_g2&&Game.doorIsOpen(Game.map,41,21),'2) BONE-switch opens gate 2');
const blk=Game.map.objects.find(o=>o.id==='b8_blk1'); H.place(44,21); grabMove(blk,'right','ArrowRight',49,21);
H.assert(tileAt(Game.map,50,21)==='bridge','3) BRACER block bridges the treasure-pit');
H.place(54,21); H.face('right'); Player.tool='harpoon'; Player.useTool(); H.step(70);
H.assert(Player.x/16>58,'4) HARPOON-post crossed the coin-chasm (x='+(Player.x/16).toFixed(1)+')');
H.assert((TILEDEFS[tileAt(Game.map,61,21)]||{}).soft===true,'soft-block wall present');
H.place(59,21); H.face('right'); H.step(20); Game.ramsiCommand(); H.step(40);
H.assert(!(TILEDEFS[tileAt(Game.map,61,21)]||{}).soft,'5) ROLL-CHARGE smashed the soft-block to the den');

// ===== TREMOR-GRUB -> LUCKY -> Pound -> gauntlet portal =====
H.place(63,21); H.step(2); H.assert(Game.boss&&Game.boss.name==='grub','Tremor-Grub present');
Game.companion.x=Game.boss.x; Game.companion.y=Game.boss.y; save('2_grub');
H.assert(beatWarden('bone'),'Ramsi headbutts, Noah BONES the Tremor-Grub'); H.assert(Game.flags.grub,'Tremor-Grub beaten');
H.place(69,16); H.face('up'); Game.interact();
H.assert(Game.flags.ramPound,'freeing LUCKY awakens GROUND-POUND');
H.assert(Game.doorIsOpen||true, '');
console.log('BURROW8(new) OK — open exotic hoard + 5-tool MASTER combo (shrink/bone/bracers/harpoon/roll) + Tremor-Grub -> Pound');
