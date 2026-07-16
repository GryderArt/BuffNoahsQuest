const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player, MAPS } = NQ;
const PENS = {
  tank:    { x: 3, y: 3, w: 5, h: 3, species: ['octopus','jellyfish','shark','capricorn'] },
  aviary:  { x: 14, y: 3, w: 5, h: 3, species: ['condor'] },
  paddock: { x: 3, y: 10, w: 5, h: 3, species: ['sheep','ram','goat','snowhare','ibex','crab'] },
  starpen: { x: 14, y: 10, w: 5, h: 3, species: ['starpupil','alien','unicorn','cometpup','dragon'] },
};
const penOf = (c) => { for (const k in PENS){ const p=PENS[k]; const cx=(c.x/16|0),cy=(c.y/16|0);
  if (cx>=p.x&&cx<p.x+p.w&&cy>=p.y&&cy<p.y+p.h) return k; } return null; };

H.startPlay();
// the cottage door must lead into the menagerie, and the menagerie must lead back
const vale = MAPS.vale;
H.assert(vale.doors['34,8'] && vale.links.some(L=>L.x===34&&L.y===8&&L.to==='grannyzoo'), "cottage door (34,8) opens into Granny's Menagerie");
H.assert(MAPS.grannyzoo && MAPS.grannyzoo.links.some(L=>L.to==='vale'), 'the menagerie has an exit back to the Vale');

// stock an inventory: a few of several species, plus an over-cap pile of sharks
Object.assign(Game.flags, { life_octopus:2, life_shark:10, life_sheep:3, life_goat:1, life_condor:1, life_unicorn:2, life_starpupil:1 });
const before = Game.totalCaught();
Game.loadMap('grannyzoo', 11, 13);
const zoo = Game.creatures;
H.assert(zoo.length > 0 && zoo.every(c=>c.display===true), 'every animal in the zoo is display-only (cannot be caught)');

// animals land in their RIGHT bins
const count = (sp)=>zoo.filter(c=>c.species===sp).length;
H.assert(zoo.filter(c=>c.species==='octopus').every(c=>penOf(c)==='tank'), 'octopus -> the water tank');
H.assert(zoo.filter(c=>c.species==='shark').every(c=>penOf(c)==='tank'), 'sharks -> the water tank');
H.assert(zoo.filter(c=>c.species==='sheep').every(c=>penOf(c)==='paddock'), 'sheep -> the grass paddock');
H.assert(zoo.filter(c=>c.species==='goat').every(c=>penOf(c)==='paddock'), 'goat -> the grass paddock');
H.assert(zoo.filter(c=>c.species==='condor').every(c=>penOf(c)==='aviary'), 'condor -> the aviary');
H.assert(zoo.filter(c=>c.species==='unicorn').every(c=>penOf(c)==='starpen'), 'unicorn -> the star pen');

// counts mirror the inventory, but cap so the pens stay readable
H.assert(count('octopus')===2 && count('sheep')===3 && count('unicorn')===2, 'pen counts mirror your inventory');
H.assert(count('shark')===4, 'a huge pile (10 sharks) is capped to 4 on display');

// you cannot re-catch an exhibit
const target = zoo.find(c=>c.species==='sheep');
H.place((target.x/16|0), (target.y/16|0));  // stand on it
const caught = Game.checkToolCatch('net', target.x, target.y, 24);
H.assert(caught===false && target.state!=='gone', 'swinging the net at an exhibit does NOT catch it');
H.assert(Game.totalCaught()===before, 'the trophy count is unchanged (nothing re-caught)');

// empty inventory -> empty pens (a reason to go catch more)
for (const k of Object.keys(Game.flags)) if (k.startsWith('life_')) Game.flags[k]=0;
Game.loadMap('grannyzoo', 11, 13);
H.assert(Game.creatures.length===0, 'with an empty inventory the pens are empty');

// snapshot a stocked zoo
Object.assign(Game.flags, { life_octopus:3, life_shark:2, life_jellyfish:2, life_sheep:4, life_goat:2, life_snowhare:2, life_condor:2, life_unicorn:2, life_alien:2, life_cometpup:2 });
Game.loadMap('grannyzoo', 11, 13); H.place(11,13); Game.banners=[]; Game.toasts=[];
H.render(); fs.writeFileSync(__dirname+'/../shots/zoo.png', H.canvas.toBuffer('image/png'));
console.log('ZOO OK — door wired, animals sorted into their bins, capped, display-only, empties when emptied');
