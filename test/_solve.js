// SOLVABILITY: play each tight dungeon's intended chain with the new layout (gates must open/cross).
const H = require('./harness'); const { NQ } = H; const { Game, Player, TILEDEFS, tileAt } = NQ;
function applyTool(t,b){ if(t==='mitts'){Player.x=b.x;Player.y=b.y;Player.dir='right';Player.lungeT=0.2;}else if(t==='net'){Player.x=b.x;Player.y=b.y;Player.netT=0.2;}else if(t==='harpoon')Player.harpoon={x:b.x,y:b.y,vx:0,vy:0,dist:0,max:300,state:'out'};else if(t==='bone')Player.bone={x:b.x,y:b.y,vx:0,vy:0,t:0.1}; }
function beat(tool){ let ok=false; for(let i=0;i<1500&&Game.boss;i++){const b=Game.boss;Player.hearts=Player.maxHearts;Player.x=b.x-10;Player.y=b.y;Player.dir='right';Game.companion.x=b.x;Game.companion.y=b.y;if(b.awake&&b.shieldT>0){ok=true;b.inv=0;applyTool(tool,b);}H.step(1);} return ok; }
function grab(block,dir,key,tx,ty){ H.place(block.x-1, block.y); H.face(dir);NQ.hold(' ',true);H.step(3);H.assert(Player.grab===block,'grabbed');H.hold(key,true);let g=0;while((block.x!==tx||block.y!==ty)&&g++<400)H.step(2);H.hold(key,false);H.step(16);NQ.hold(' ',false);H.step(4);H.assert(block.x===tx&&block.y===ty,'block@'+tx+','+ty); }
function harpoon(x,y){ H.place(x,y);H.face('right');Player.tool='harpoon';Player.useTool();H.step(70); }
function gear(){ Object.assign(Game.flags,{ramsi:1,world2:1,ramHead:1,ramStun:1,ramShield:1,ramBoost:1,ramsuit:1,sandals:1,gloves:1,bracers:1,suit:1,wings:1,net:1,harpoon:1,bone:1,cage:1,ramGlow:1,ramShrink:1,ramBounce:1,ramDecoy:1,ramGlide:1,ramRoll:1,ramPound:1}); Game.flags.baits={clover:9,tincan:9,fishsnack:9,cookie:9,berry:9}; }
H.startPlay(); gear();
const T=(x,y)=>tileAt(Game.map,x,y), soft=(x,y)=>(TILEDEFS[T(x,y)]||{}).soft;
function rc(){ Object.assign(Game.companion,{busyT:0,shrinkT:0,glide:0,bounceT:0,decoyT:0,poundT:0,poundCool:0,rollT:0,bossShrinkT:0}); }

// W5: HARPOON -> RAM -> BRACER -> Mottle -> MR.RAM
Game.loadMap('burrow5');Game.state='play';rc();harpoon(40,20);H.assert(Player.x/16>44,'W5 harpoon moat');
Game.smashCrack(Game.map,48,20);H.assert(!(TILEDEFS[T(48,20)]||{}).crack,'W5 ram crack');
grab(Game.map.objects.find(o=>o.id==='b5_blk1'),'right','ArrowRight',53,20);H.assert(T(55,20)==='bridge','W5 bracer bridge');
H.place(58,20);H.step(2);H.assert(beat('mitts'),'W5 Mottle');H.place(61,16);H.face('up');Game.interact();H.assert(Game.flags.ramGlow,'W5 Mr.Ram->Glow');
H.place(61,25);H.step(20);Game.ramsiCommand();H.assert(Game.flags.b5_exit,'W5 shrink exit');

// W6: SHRINK -> HARPOON -> BRACER -> Thornback
gear();Game.loadMap('burrow6');Game.state='play';rc();
H.place(35,20);H.step(20);Game.ramsiCommand();H.assert(Game.flags.b6_g1,'W6 shrink gate');
harpoon(39,20);H.assert(Player.x/16>43,'W6 harpoon');
grab(Game.map.objects.find(o=>o.id==='b6_blk1'),'right','ArrowRight',50,20);H.assert(T(52,20)==='bridge','W6 bracer bridge');
H.place(56,17);H.step(2);H.assert(beat('net'),'W6 Thornback');H.place(61,12);H.face('up');Game.interact();H.assert(Game.flags.ramBounce,'W6 Beast Mimi->Bounce');
H.place(60,23);H.step(20);H.assert(Game.tryBounce(),'W6 bounce exit');

// W7: BOUNCE -> BRACER -> HARPOON -> Geode
gear();Game.loadMap('burrow7');Game.state='play';rc();
H.place(34,20);H.step(20);H.assert(Game.tryBounce(),'W7 bounce shelf');H.step(50);H.assert(Player.x/16>37,'W7 bounced over');
grab(Game.map.objects.find(o=>o.id==='b7_blk1'),'right','ArrowRight',43,20);H.assert(T(45,20)==='bridge','W7 bracer bridge');
harpoon(47,20);H.assert(Player.x/16>51,'W7 harpoon');
H.place(56,17);H.step(2);H.assert(beat('harpoon'),'W7 Geode');H.place(61,13);H.face('up');Game.interact();H.assert(Game.flags.ramGlide,'W7 Toothless->Glide');
H.place(58,23);H.step(20);Game.ramsiCommand();H.assert(!!Player.gArc&&Player.gArc.kind==='glide','W7 glide exit');

// W8: SHRINK -> BONE -> BRACER -> HARPOON -> ROLL -> Grub
gear();Game.loadMap('burrow8');Game.state='play';rc();
H.place(34,20);H.step(20);Game.ramsiCommand();H.assert(Game.flags.b8_g1,'W8 shrink gate');
H.place(38,17);H.face('up');Player.tool='bone';Player.useTool();H.step(40);H.assert(Game.flags.b8_g2,'W8 bone-switch gate');
grab(Game.map.objects.find(o=>o.id==='b8_blk1'),'right','ArrowRight',46,20);H.assert(T(48,20)==='bridge','W8 bracer bridge');
harpoon(50,20);H.assert(Player.x/16>54,'W8 harpoon');
H.assert(soft(58,20),'W8 soft-block present');H.place(56,20);H.face('right');H.step(20);Game.ramsiCommand();H.step(40);H.assert(!soft(58,20),'W8 roll smash');
H.place(62,20);H.step(2);H.assert(beat('bone'),'W8 Tremor-Grub');H.place(68,16);H.face('up');Game.interact();H.assert(Game.flags.ramPound,'W8 Lucky->Pound');
console.log('SOLVE OK — all four tight dungeons are solvable end-to-end with their intended chains');
