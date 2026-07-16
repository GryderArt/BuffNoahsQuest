// DUNGEON SECRET ROOMS: every dungeon hides a sealed VAULT reachable only on a second pass with
// the RAM SUIT (smash a crack) or SHRINK (fling Mimi through a ram-hole). The opened wall becomes
// a doorway PORTAL to a separate, invisible-until-entered vault map with a rare material.
const H = require('./harness'); const { NQ } = H;
const { Game, Player, MAPS, TILEDEFS } = NQ; const T = 16;
H.startPlay();

const info = Game.secretRoomInfo || {};
const DUNGEONS = ['grotto1','grotto2','grotto3','grotto4','keep1','keep2','keep3','void','burrow5','burrow6','burrow7','burrow8'];
// EVERY dungeon has an entrance + a real vault behind it
for (const mid of DUNGEONS) {
  const ii = info[mid];
  H.assert(ii && ii !== 'no-spot', mid + ' has a secret entrance');
  const vm = MAPS['vault_' + mid];
  H.assert(vm && vm.objects.some(o => o.type === 'chest' && o.loot && o.loot.mat === ii.mat), mid + "'s vault holds its rare material (" + ii.mat + ')');
  H.assert(vm.objects.some(o => o.type === 'portal' && o.to === mid), mid + "'s vault has a way back out");
  const hidden = MAPS[mid].objects.find(o => o.type === 'portal' && o.vaultEntry && o.x === ii.wx && o.y === ii.wy);
  H.assert(hidden && hidden.secret && hidden.req === 'secret_' + mid, 'the doorway portal is hidden until the entrance is opened');
}
// both abilities are represented
H.assert(DUNGEONS.some(m => info[m].type === 'crack') && DUNGEONS.some(m => info[m].type === 'shrink'), 'both RAM-SMASH and SHRINK entrances exist');
// three distinct rare materials across the vaults
const mats = new Set(DUNGEONS.map(m => info[m].mat));
H.assert(mats.has('goldnugget') && mats.has('voidgem') && mats.has('crystalshard'), 'gold nuggets, void gems AND crystal shards are hidden away');

// CRACK room end-to-end (grotto1): can't reach it, smash reveals the doorway, vault grants the material, return
{
  const gi = info.grotto1; Game.loadMap('grotto1');
  H.assert((TILEDEFS[Game.map.tiles[gi.wy][gi.wx]] || {}).crack, 'the grotto entrance is a CRACKED wall');
  const port = Game.map.objects.find(o => o.type === 'portal' && o.vaultEntry);
  H.assert(!Game.lookupFlag(port.req), 'the doorway is sealed (portal locked) until smashed');
  Game.flags.ramsuit = true; Game.flags.mats.goldnugget = 0;
  Game.smashCrack(Game.map, gi.wx, gi.wy);
  H.assert(Game.flags.secret_grotto1 === true, 'RAM-smashing the crack opens the hidden doorway');
  H.place(port.x, port.y); H.step(1);
  H.assert(Game.mapId === 'vault_grotto1', 'stepping through the doorway enters the hidden vault');
  const chest = Game.map.objects.find(o => o.type === 'chest' && o.loot && o.loot.mat === 'goldnugget');
  Game.giveLoot(chest.loot);
  H.assert(Game.flags.mats.goldnugget === 1, 'the vault chest grants a GOLD NUGGET');
  Game.state = 'play'; Game.itemGetData = null;      // dismiss the material fanfare (as a player would)
  const back = Game.map.objects.find(o => o.type === 'portal' && o.to === 'grotto1');
  H.place(back.x, back.y); H.step(1);
  H.assert(Game.mapId === 'grotto1', 'the return portal climbs you back out to the dungeon');
}

// SHRINK room end-to-end (burrow5): shrink Mimi through the ram-hole -> gate/doorway opens -> vault
{
  const bi = info.burrow5; Game.flags.underburrow = true; Game.loadMap('burrow5');
  H.assert((TILEDEFS[Game.map.tiles[bi.wy][bi.wx]] || {}).door, 'the burrow entrance is a bolted GATE');
  const rh = Game.map.objects.find(o => o.type === 'ramhole' && o.flag === 'secret_burrow5');
  H.assert(rh, 'a ram-hole sits nearby for Mimi to shrink into');
  Game.flags.ramShrink = true;
  Game.flags.secret_burrow5 = true;                 // (the shrink-command sets this; do it directly here)
  Game.revealOpenedDoors(Game.map);
  H.assert(!(TILEDEFS[Game.map.tiles[bi.wy][bi.wx]] || {}).door, 'opening it melts the gate to floor (visible)');
  const bport = Game.map.objects.find(o => o.type === 'portal' && o.vaultEntry);
  H.place(bport.x, bport.y); H.step(1);
  H.assert(Game.mapId === 'vault_burrow5', 'and the doorway leads into the burrow vault');
}

console.log('SECRETS PASS — a hidden vault in every dungeon, gated by RAM-SMASH or SHRINK, with rare materials');
