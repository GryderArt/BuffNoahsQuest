// The Crossing's practice-wire chest: SPACE must open the chest FIRST, then zip.
const H = require('./harness.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ok - ' : '  FAIL - ') + m); if (!c) fails++; };
const { Game, Player } = NQ;
NQ.newGame(); Game.state = 'play';
Game.flags.gloves = true;                       // gloves ON: the wire is fully rideable
Game.loadMap('crags', 4, 16); Game.state = 'play';
Player.x = 4 * 16 + 8; Player.y = 16 * 16 + 8; Player.elev = 1; Player.dir = 'down';
const anchor = Game.map.objects.find(o => o.type === 'zipanchor' && o.x === 4 && o.y === 16);
const chest = Game.map.objects.find(o => o.type === 'chest' && o.x === 4 && o.y === 16);
ok(!!anchor && !!chest, 'the chest and the wire anchor really share tile (4,16)');
ok(!Game.flags.openedChests[chest.id], 'chest starts closed');
const gems0 = Game.flags.gems;
Game.interact();                                 // SPACE #1
ok(Game.flags.openedChests[chest.id] === true, 'SPACE #1 opens the chest (not the zip)');
ok(!Game.zip, 'no zip started while the chest was waiting');
ok(Game.flags.gems === gems0 + 4, 'the 4 gems arrived (' + gems0 + ' -> ' + Game.flags.gems + ')');
Game.interact();                                 // SPACE #2
ok(!!Game.zip, 'SPACE #2 rides the wire (chest now open)');
Game.zip = null;
// gloveless flow: chest first too, THEN the slip-shove
NQ.newGame(); Game.state = 'play';
Game.flags.gloves = false;
Game.loadMap('crags', 4, 16); Game.state = 'play';
Player.x = 4 * 16 + 8; Player.y = 16 * 16 + 8; Player.elev = 1;
const chest2 = Game.map.objects.find(o => o.type === 'chest' && o.x === 4 && o.y === 16);
Game.interact();
ok(Game.flags.openedChests[chest2.id] === true, 'gloveless SPACE #1 still opens the chest');
const px0 = Player.x; Game.interact();
ok(!Game.zip && Player.x !== px0, 'gloveless SPACE #2 does the bare-hands slip-shove');
// a chest AWAY from any wire is untouched by the new priority; wires far from chests still zip
Player.x = 25 * 16 + 8; Player.y = 17 * 16 + 8; Player.elev = 1;
Game.interact();
ok(Game.flags.openedChests['crags_c_25_17'] === true, 'a normal chest still opens fine');
Game.flags.gloves = true;
Player.x = 8 * 16 + 8; Player.y = 9 * 16 + 8; Player.elev = 2; Player.dir = 'down';
Game.interact();
ok(!!Game.zip, 'a wire with no chest nearby still zips instantly');
console.log(fails ? 'CHEST/ZIP: ' + fails + ' FAILURES' : 'CHEST/ZIP PASS — chest first, ride after');
process.exit(fails ? 1 : 0);
